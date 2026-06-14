import { getApiUrl } from "@/lib/auth";
import { getCachedMenu, setCachedMenu } from "@/lib/offline/local-cache";
import { isAppOnline } from "@/lib/offline/network";
import { FALLBACK_MENU, normalizeMenuFromApi, type MenuData } from "@/lib/menu-utils";

export async function fetchPublicMenu(): Promise<MenuData> {
  if (!isAppOnline()) {
    return getCachedMenu(FALLBACK_MENU);
  }

  try {
    const res = await fetch(`${getApiUrl()}/api/menu/public`);
    if (!res.ok) {
      console.warn("Menú público no disponible, usando respaldo local");
      return getCachedMenu(FALLBACK_MENU);
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
    return getCachedMenu(FALLBACK_MENU);
  }
}
