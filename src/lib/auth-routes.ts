import type { Rol } from "@/lib/auth";

export type AppHome = "/" | "/admin" | "/barra";

export function homePathForRole(rol: Rol): AppHome {
  if (rol === "admin") return "/admin";
  if (rol === "cocinero") return "/barra";
  return "/";
}
