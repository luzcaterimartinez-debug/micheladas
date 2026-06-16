import { getApiUrl } from "@/lib/auth";
import { getCachedMenu, setCachedMenu } from "@/lib/offline/local-cache";
import { isAppOnline } from "@/lib/offline/network";
import { getFallbackMenu, normalizeMenuFromApi, type MenuData } from "@/lib/menu-utils";

export async function fetchPublicMenu(): Promise<MenuData> {
  if (!isAppOnline()) {
    return getCachedMenu(getFallbackMenu());
  }

  try {
    const res = await fetch(`${getApiUrl()}/api/menu/public`);
    if (!res.ok) {
      console.warn("Menú público no disponible, usando respaldo local");
      return getCachedMenu(getFallbackMenu());
    }
    const data = await res.json();
    const menu = normalizeMenuFromApi({
      categorias: data.categorias,
      productos: data.productos,
      adiciones: data.adiciones,
    });
    setCachedMenu(menu);
    return menu;
  } catch {
    return getCachedMenu(getFallbackMenu());
  }
}
