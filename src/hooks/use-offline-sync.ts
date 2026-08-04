import { useCallback, useEffect, useRef, useState } from "react";

import { getPendingCount } from "@/lib/offline/outbox";
import { initOfflineSync, runAutoSync } from "@/lib/offline/sync-engine";
import {
  checkServerReachable,
  isApiReachable,
  isAppOnline,
  isMysqlQuotaBackoff,
  isNetworkUsable,
  mysqlQuotaBackoffRemainingMs,
  notifySyncChange,
} from "@/lib/offline/network";

/** Hostinger limita conexiones/hora: health poco frecuente y NUNCA si hay cuota. */
const HEALTH_OK_MS = 3 * 60_000;
const HEALTH_DOWN_MS = 5 * 60_000;
const HEALTH_QUOTA_MS = 20 * 60_000;

export function useOfflineSync() {
  const [online, setOnline] = useState(() => isNetworkUsable());
  const [serverReachable, setServerReachable] = useState(() => isApiReachable());
  const [quotaBackoff, setQuotaBackoff] = useState(() => isMysqlQuotaBackoff());
  const [pending, setPending] = useState(() => getPendingCount());
  const [syncing, setSyncing] = useState(false);
  const wasReachableRef = useRef(isApiReachable());
  const intervalRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    // Online de UI = API usable o, en su defecto, la señal del browser.
    setOnline(isApiReachable() || isAppOnline());
    setServerReachable(isApiReachable());
    setQuotaBackoff(isMysqlQuotaBackoff());
    setPending(getPendingCount());
  }, []);

  const scheduleNext = useCallback((ok: boolean) => {
    if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    const ms = isMysqlQuotaBackoff() ? HEALTH_QUOTA_MS : ok ? HEALTH_OK_MS : HEALTH_DOWN_MS;
    intervalRef.current = window.setInterval(() => {
      void pingRef.current();
    }, ms);
  }, []);

  const pingRef = useRef<() => Promise<boolean>>(async () => false);

  const pingServer = useCallback(async () => {
    const wasReachable = wasReachableRef.current;
    const ok = await checkServerReachable();
    wasReachableRef.current = ok;
    setServerReachable(ok);
    // Si ping responde, tenemos internet real aunque navigator diga offline.
    if (ok) setOnline(true);
    else setOnline(isAppOnline());
    setQuotaBackoff(isMysqlQuotaBackoff());
    scheduleNext(ok);
    if (ok && !wasReachable) {
      void runAutoSync();
    }
    return ok;
  }, [scheduleNext]);

  pingRef.current = pingServer;

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      const reachable = await checkServerReachable({ force: true });
      wasReachableRef.current = reachable;
      setServerReachable(reachable);
      if (reachable) setOnline(true);
      setQuotaBackoff(isMysqlQuotaBackoff());
      scheduleNext(reachable);
      if (!reachable) return;
      await runAutoSync();
    } finally {
      setSyncing(false);
      refresh();
    }
  }, [refresh, scheduleNext]);

  useEffect(() => {
    const teardown = initOfflineSync();
    const onChange = () => {
      refresh();
    };
    const onDown = () => {
      wasReachableRef.current = false;
      setServerReachable(false);
      setQuotaBackoff(isMysqlQuotaBackoff());
      // API/MySQL caído ≠ sin Wi‑Fi: no mostrar "sin internet".
      setOnline(true);
      scheduleNext(false);
    };
    const onRecovered = () => {
      wasReachableRef.current = true;
      setServerReachable(true);
      setOnline(true);
      setQuotaBackoff(false);
      refresh();
      scheduleNext(true);
      void runAutoSync();
    };
    const onBrowserOnline = () => {
      setOnline(true);
      void pingServer();
    };
    const onBrowserOffline = () => {
      // No confiar en el evento offline de inmediato: muchos Android lo disparan con Wi‑Fi OK.
      void checkServerReachable({ force: true }).then((ok) => {
        setOnline(ok);
        setServerReachable(ok);
        wasReachableRef.current = ok;
      });
    };
    window.addEventListener("online", onBrowserOnline);
    window.addEventListener("offline", onBrowserOffline);
    window.addEventListener("michelada-sync-change", onChange);
    window.addEventListener("michelada-api-down", onDown);
    window.addEventListener("michelada-api-recovered", onRecovered);
    refresh();
    void pingServer();
    return () => {
      teardown();
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
      window.removeEventListener("online", onBrowserOnline);
      window.removeEventListener("offline", onBrowserOffline);
      window.removeEventListener("michelada-sync-change", onChange);
      window.removeEventListener("michelada-api-down", onDown);
      window.removeEventListener("michelada-api-recovered", onRecovered);
    };
  }, [pingServer, refresh, scheduleNext]);

  return {
    online,
    serverReachable,
    quotaBackoff,
    quotaRemainingMs: quotaBackoff ? mysqlQuotaBackoffRemainingMs() : 0,
    pending,
    syncing,
    syncNow,
  };
}

export function triggerSyncRefresh(): void {
  notifySyncChange();
}
