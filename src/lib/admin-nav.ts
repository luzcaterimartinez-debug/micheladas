import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  ListPlus,
  Menu,
  UserCog,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

export type AdminSection =
  | "resumen"
  | "categorias"
  | "menu"
  | "fases"
  | "adiciones"
  | "usuarios"
  | "comandas"
  | "reportes"
  | "nomina"
  | "inventario"
  | "mesas"
  | "pos";

export type AdminNavItem = {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "categorias", label: "Categorías", icon: LayoutGrid },
  { id: "menu", label: "Menú", icon: BookOpen },
  { id: "fases", label: "Fases", icon: Layers },
  { id: "adiciones", label: "Adiciones", icon: ListPlus },
  { id: "usuarios", label: "Usuarios", icon: UserCog },
  { id: "comandas", label: "Comandas", icon: ClipboardList },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "nomina", label: "Nómina", icon: Wallet },
  { id: "inventario", label: "Inventario", icon: Boxes },
  { id: "mesas", label: "Mesas", icon: Users },
  { id: "pos", label: "Nuevo pedido", icon: UtensilsCrossed },
];

export const ADMIN_NAV_GROUPS: { label: string; ids: AdminSection[] }[] = [
  { label: "General", ids: ["resumen", "reportes"] },
  { label: "Menú", ids: ["categorias", "menu", "fases", "adiciones"] },
  { label: "Operación", ids: ["comandas", "inventario", "mesas", "pos"] },
  { label: "Equipo", ids: ["usuarios", "nomina"] },
];

export const ADMIN_MOBILE_QUICK: { id: AdminSection | "more"; label: string; icon: LucideIcon }[] = [
  { id: "resumen", label: "Inicio", icon: LayoutDashboard },
  { id: "menu", label: "Menú", icon: BookOpen },
  { id: "comandas", label: "Comandas", icon: ClipboardList },
  { id: "more", label: "Más", icon: Menu },
];

export function adminNavLabel(id: AdminSection): string {
  return ADMIN_NAV.find((n) => n.id === id)?.label ?? id;
}
