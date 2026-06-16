import { useCallback, useEffect, useRef, useState } from "react";

import { getPendingCount } from "@/lib/offline/outbox";
import { initOfflineSync, runAutoSync } from "@/lib/offline/sync-engine";
import {
  checkServerReachable,
  isApiReachable,
  isAppOnline,
  notifySyncChange,
} from "@/lib/offline/network";

export function useOfflineSync() {
  const [online, setOnline] = useState(() => isAppOnline());
  const [serverReachable, setServerReachable] = useState(true);
  const [pending, setPending] = useState(() => getPendingCount());
  const [syncing, setSyncing] = useState(false);
  const wasReachableRef = useRef(true);

  const refresh = useCallback(() => {
    setOnline(isAppOnline());
    setServerReachable(isApiReachable());
    setPending(getPendingCount());
  }, []);

  const pingServer = useCallback(async () => {
    const wasReachable = wasReachableRef.current;
    const ok = await checkServerReachable();
    wasReachableRef.current = ok;
    setServerReachable(ok);
    if (ok && !wasReachable) {
      void runAutoSync();
    }
    return ok;
  }, []);

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
      void pingServer();
    };
    window.addEventListener("online", onChange);
    window.addEventListener("offline", onChange);
    window.addEventListener("michelada-sync-change", onChange);
    refresh();
    void pingServer();
    const interval = window.setInterval(() => void pingServer(), 15000);
    return () => {
      teardown();
      window.clearInterval(interval);
      window.removeEventListener("online", onChange);
      window.removeEventListener("offline", onChange);
      window.removeEventListener("michelada-sync-change", onChange);
    };
  }, [pingServer, refresh]);

  return { online, serverReachable, pending, syncing, syncNow };
}

export function triggerSyncRefresh(): void {
  notifySyncChange();
}
