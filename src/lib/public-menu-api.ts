import { getApiUrl } from "@/lib/auth";
import { FALLBACK_MENU, normalizeMenuFromApi, type MenuData } from "@/lib/menu-utils";

export async function fetchPublicMenu(): Promise<MenuData> {
  const res = await fetch(`${getApiUrl()}/api/menu/public`);
  if (!res.ok) {
    console.warn("Menú público no disponible, usando respaldo local");
    return FALLBACK_MENU;
  }
  const data = await res.json();
  return normalizeMenuFromApi({
    categorias: data.categorias,
    productos: data.productos,
    adiciones: data.adiciones,
  });
}
