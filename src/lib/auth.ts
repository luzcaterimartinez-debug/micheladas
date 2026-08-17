import {
  isMysqlQuotaBackoff,
  markApiFailureFromStatus,
  mysqlQuotaBackoffRemainingMs,
} from "@/lib/offline/network";

export type Rol = "admin" | "mesero" | "cocinero";

export type AuthUser = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

const STORAGE_KEY = "micheladas_auth";

export function getApiUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  // Desarrollo: peticiones relativas /api → proxy de Vite hacia :8000
  if (import.meta.env.DEV) return "";
  // Producción (Vercel): API en el mismo dominio vía /api/index.py
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function apiUrl(path: string): string {
  const base = getApiUrl();
  return base ? `${base}${path}` : path;
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.accessToken || !parsed.user?.rol) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hostingerQuotaMessage(): string {
  const ms = mysqlQuotaBackoffRemainingMs();
  const mins = Math.max(1, Math.ceil(ms / 60_000));
  return (
    `Hostinger agotó las 500 conexiones de esta hora. ` +
    `Cierra las demás pestañas del POS y espera unos ${mins} min. ` +
    `Reintentar ahora no deja entrar.`
  );
}

export async function login(email: string, password: string): Promise<AuthSession> {
  if (isMysqlQuotaBackoff()) {
    throw new Error(hostingerQuotaMessage());
  }

  let res: Response;
  try {
    res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      import.meta.env.DEV
        ? "No se pudo conectar al servidor. Inicia el backend: cd backend && uvicorn app.main:app --reload --port 8000"
        : "No se pudo conectar al servidor. Revisa tu conexión o la configuración de VITE_API_URL.",
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const bodyText = JSON.stringify(data);
    markApiFailureFromStatus(res.status, bodyText);
    throw new Error(parseApiError(data, res.status));
  }

  const session: AuthSession = {
    accessToken: data.access_token,
    user: data.user,
  };
  saveSession(session);
  return session;
}

export async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(apiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function validateSession(): Promise<AuthSession | null> {
  const stored = getStoredSession();
  if (!stored) return null;
  // Sin MySQL no hay forma de renovar sesión: conservar la local para no echar al turno.
  if (isMysqlQuotaBackoff()) return stored;

  let user: AuthUser | null;
  try {
    const res = await fetch(apiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${stored.accessToken}` },
    });
    if (!res.ok) {
      // Solo invalidar sesión con 401 (token/usuario). 5xx/503/cuota Hostinger → conservar local.
      if (res.status === 401) {
        clearSession();
        return null;
      }
      const bodyText = await res.text().catch(() => "");
      markApiFailureFromStatus(res.status, bodyText);
      return stored;
    }
    user = await res.json();
    if (!user) {
      clearSession();
      return null;
    }
  } catch {
    // Backend caído o conexión cortada: conservar sesión local para no romper la ruta
    return stored;
  }

  const session: AuthSession = { accessToken: stored.accessToken, user };
  saveSession(session);
  return session;
}

function errorBlob(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const obj = data as Record<string, unknown>;
  return [obj.detail, obj.database_error, obj.hint, obj.error]
    .filter((v): v is string => typeof v === "string")
    .join(" ");
}

export function parseApiError(data: unknown, status: number): string {
  const blob = errorBlob(data);
  if (/1226|max_connections_per_hour/i.test(blob) || (status === 503 && /1226|max_connections/i.test(blob))) {
    return hostingerQuotaMessage();
  }
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string; loc?: unknown[] };
      if (first?.msg) {
        const field = Array.isArray(first.loc) ? first.loc.at(-1) : null;
        return field ? `${String(field)}: ${first.msg}` : first.msg;
      }
    }
  }
  if (status === 422) return "Datos inválidos. Revisa el correo y la contraseña.";
  if (status === 503) return "No se pudo completar ahora. Cierra pestañas extra del POS y reintenta en unos minutos.";
  if (status >= 500) return "Error del servidor. Se reintentará automáticamente.";
  if (status === 401) return "Sesión expirada. Vuelve a iniciar sesión.";
  return "No se pudo completar la solicitud";
}

export const ROL_LABELS: Record<Rol, string> = {
  admin: "Administrador",
  mesero: "Mesero",
  cocinero: "Barra / Preparación",
};
