import type { Rol } from "@/lib/auth";
import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";

export type AdminUser = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
};

export type CreateUserInput = {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
};

export type UpdateUserInput = {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: Rol;
  activo?: boolean;
};

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data as T;
}

export function listUsers(): Promise<AdminUser[]> {
  return adminFetch("/api/admin/users");
}

export function createUser(input: CreateUserInput): Promise<AdminUser> {
  return adminFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateUser(id: number, input: UpdateUserInput): Promise<AdminUser> {
  return adminFetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
