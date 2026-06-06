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

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export function getApiUrl(): string {
  return API_URL;
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

export async function login(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
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
    const res = await fetch(`${API_URL}/api/auth/me`, {
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

  let user: AuthUser | null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${stored.accessToken}` },
    });
    if (!res.ok) {
      clearSession();
      return null;
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

export function parseApiError(data: unknown, status: number): string {
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
  return "No se pudo iniciar sesión";
}

export const ROL_LABELS: Record<Rol, string> = {
  admin: "Administrador",
  mesero: "Mesero",
  cocinero: "Barra / Preparación",
};
