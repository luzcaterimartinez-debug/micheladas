/** Datos temporales para imprimir en /ticket (tablets no pueden imprimir la SPA). */

export const PRINT_TICKET_HTML_KEY = "michelada-print-ticket-html";
export const PRINT_RETURN_URL_KEY = "michelada-print-return-url";
export const PRINT_AUTO_KEY = "michelada-print-auto";

export function parseTicketHtml(fullHtml: string): { body: string; css: string } {
  const parsed = new DOMParser().parseFromString(fullHtml, "text/html");
  return {
    body: parsed.body.innerHTML,
    css: parsed.querySelector("style")?.textContent ?? "",
  };
}

export function navigateToTicketPrintPage(
  html: string,
  returnUrl?: string,
  autoPrint = true,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    sessionStorage.setItem(PRINT_TICKET_HTML_KEY, html);
    sessionStorage.setItem(PRINT_RETURN_URL_KEY, returnUrl ?? location.pathname + location.search);
    sessionStorage.setItem(PRINT_AUTO_KEY, autoPrint ? "1" : "0");
    window.location.assign("/ticket");
    return true;
  } catch {
    return false;
  }
}

export function consumePrintTicketSession(): {
  html: string;
  returnUrl: string;
  autoPrint: boolean;
} | null {
  if (typeof window === "undefined") return null;
  const html = sessionStorage.getItem(PRINT_TICKET_HTML_KEY);
  if (!html) return null;
  const returnUrl = sessionStorage.getItem(PRINT_RETURN_URL_KEY) || "/";
  const autoPrint = sessionStorage.getItem(PRINT_AUTO_KEY) !== "0";
  sessionStorage.removeItem(PRINT_TICKET_HTML_KEY);
  sessionStorage.removeItem(PRINT_RETURN_URL_KEY);
  sessionStorage.removeItem(PRINT_AUTO_KEY);
  return { html, returnUrl, autoPrint };
}
