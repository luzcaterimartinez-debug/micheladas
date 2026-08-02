import { useCallback, useEffect, useRef, useState } from "react";

import { getPendingCount } from "@/lib/offline/outbox";
import { initOfflineSync, runAutoSync } from "@/lib/offline/sync-engine";
import {
  checkServerReachable,
  isApiReachable,
  isAppOnline,
  notifySyncChange,
} from "@/lib/offline/network";

/** Hostinger limita conexiones/hora: no martillar /api/health. */
const HEALTH_OK_MS = 45_000;
const HEALTH_DOWN_MS = 90_000;

export function useOfflineSync() {
  const [online, setOnline] = useState(() => isAppOnline());
  const [serverReachable, setServerReachable] = useState(true);
  const [pending, setPending] = useState(() => getPendingCount());
  const [syncing, setSyncing] = useState(false);
  const wasReachableRef = useRef(true);
  const intervalRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    setOnline(isAppOnline());
    setServerReachable(isApiReachable());
    setPending(getPendingCount());
  }, []);

  const scheduleNext = useCallback((ok: boolean) => {
    if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    const ms = ok ? HEALTH_OK_MS : HEALTH_DOWN_MS;
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
    scheduleNext(ok);
    if (ok && !wasReachable) {
      void runAutoSync();
    }
    return ok;
  }, [scheduleNext]);

  pingRef.current = pingServer;

  const syncNow = useCallback(async () => {
    const reachable = await pingServer();
    if (!reachable) return;
    setSyncing(true);
    try {
      await runAutoSync();
    } finally {
      setSyncing(false);
      refresh();
    }
  }, [pingServer, refresh]);

  useEffect(() => {
    const teardown = initOfflineSync();
    const onChange = () => {
      refresh();
      // No ping en cada sync-change (comandas cada 2s): solo refrescar contadores.
    };
    const onOnline = () => {
      refresh();
      void pingServer();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOnline);
    window.addEventListener("michelada-sync-change", onChange);
    refresh();
    void pingServer();
    return () => {
      teardown();
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOnline);
      window.removeEventListener("michelada-sync-change", onChange);
    };
  }, [pingServer, refresh]);

  return { online, serverReachable, pending, syncing, syncNow };
}

export function triggerSyncRefresh(): void {
  notifySyncChange();
}
