/** Datos temporales para la pantalla /ticket (vista tipo impresora 80 mm). */

import type { OrderItem } from "@/lib/micheladas-store";

export const PRINT_TICKET_HTML_KEY = "michelada-print-ticket-html";
export const PRINT_RETURN_URL_KEY = "michelada-print-return-url";
export const PRINT_AUTO_KEY = "michelada-print-auto";
export const PENDING_BARRA_ORDER_KEY = "michelada-pending-barra-order";
export const MESERO_CART_RESTORE_KEY = "michelada-mesero-cart-restore";
/** Tras enviar a barra: al volver (o bfcache/atrás) no restaurar el pedido anterior. */
export const MESERO_FRESH_START_KEY = "michelada-mesero-fresh-start";

export type PendingBarraOrder = {
  cliente: string;
  mesaId?: string;
  mesa?: string;
  items: OrderItem[];
  total: number;
  clientId: string;
};

export type MeseroCartRestore = {
  cart: OrderItem[];
  cliente: string;
  mesaId: string;
};

export function parseTicketHtml(fullHtml: string): { body: string; css: string } {
  const parsed = new DOMParser().parseFromString(fullHtml, "text/html");
  return {
    body: parsed.body.innerHTML,
    css: parsed.querySelector("style")?.textContent ?? "",
  };
}

export function openComandaTicketPage(
  html: string,
  returnUrl?: string,
  options?: {
    autoPrint?: boolean;
    pendingOrder?: PendingBarraOrder;
    cartRestore?: MeseroCartRestore;
  },
): boolean {
  if (typeof window === "undefined") return false;
  try {
    sessionStorage.setItem(PRINT_TICKET_HTML_KEY, html);
    sessionStorage.setItem(PRINT_RETURN_URL_KEY, returnUrl ?? location.pathname + location.search);
    sessionStorage.setItem(PRINT_AUTO_KEY, options?.autoPrint ? "1" : "0");

    if (options?.pendingOrder) {
      sessionStorage.setItem(PENDING_BARRA_ORDER_KEY, JSON.stringify(options.pendingOrder));
    } else {
      sessionStorage.removeItem(PENDING_BARRA_ORDER_KEY);
    }

    // Nunca restaurar carrito tras un envío exitoso (evita pedidos duplicados).
    if (options?.cartRestore && !shouldForceMeseroFreshStart()) {
      sessionStorage.setItem(MESERO_CART_RESTORE_KEY, JSON.stringify(options.cartRestore));
    } else {
      sessionStorage.removeItem(MESERO_CART_RESTORE_KEY);
    }

    window.location.assign("/ticket");
    return true;
  } catch {
    return false;
  }
}

/** @deprecated Usar openComandaTicketPage */
export function navigateToTicketPrintPage(
  html: string,
  returnUrl?: string,
  autoPrint = true,
): boolean {
  return openComandaTicketPage(html, returnUrl, { autoPrint });
}

export function loadPendingBarraOrder(): PendingBarraOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_BARRA_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingBarraOrder;
  } catch {
    return null;
  }
}

export function clearPendingBarraOrder(): void {
  sessionStorage.removeItem(PENDING_BARRA_ORDER_KEY);
  sessionStorage.removeItem(MESERO_CART_RESTORE_KEY);
}

/** Marca que el pedido ya se envió: al volver no se reabre el carrito anterior. */
export function armMeseroFreshStart(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MESERO_FRESH_START_KEY, "1");
  sessionStorage.removeItem(MESERO_CART_RESTORE_KEY);
  sessionStorage.removeItem(PENDING_BARRA_ORDER_KEY);
}

export function shouldForceMeseroFreshStart(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(MESERO_FRESH_START_KEY) === "1";
}

/** El mesero eligió mesa / empezó un pedido nuevo a propósito. */
export function clearMeseroFreshStart(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(MESERO_FRESH_START_KEY);
}

export function consumeMeseroCartRestore(): MeseroCartRestore | null {
  if (typeof window === "undefined") return null;
  if (shouldForceMeseroFreshStart()) {
    sessionStorage.removeItem(MESERO_CART_RESTORE_KEY);
    return null;
  }
  try {
    const raw = sessionStorage.getItem(MESERO_CART_RESTORE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(MESERO_CART_RESTORE_KEY);
    return JSON.parse(raw) as MeseroCartRestore;
  } catch {
    return null;
  }
}

export function peekTicketSession(): {
  html: string;
  returnUrl: string;
  autoPrint: boolean;
} | null {
  if (typeof window === "undefined") return null;
  const html = sessionStorage.getItem(PRINT_TICKET_HTML_KEY);
  if (!html) return null;
  return {
    html,
    returnUrl: sessionStorage.getItem(PRINT_RETURN_URL_KEY) || "/",
    autoPrint: sessionStorage.getItem(PRINT_AUTO_KEY) !== "0",
  };
}

export function consumePrintTicketSession(): {
  html: string;
  returnUrl: string;
  autoPrint: boolean;
} | null {
  const peek = peekTicketSession();
  if (!peek) return null;
  sessionStorage.removeItem(PRINT_TICKET_HTML_KEY);
  sessionStorage.removeItem(PRINT_RETURN_URL_KEY);
  sessionStorage.removeItem(PRINT_AUTO_KEY);
  return peek;
}

export function updateTicketHtml(html: string): void {
  sessionStorage.setItem(PRINT_TICKET_HTML_KEY, html);
}
