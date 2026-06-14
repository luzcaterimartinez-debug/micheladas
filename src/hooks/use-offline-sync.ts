import { useCallback, useEffect, useState } from "react";

import { getPendingCount } from "@/lib/offline/outbox";
import { flushOutbox, initOfflineSync } from "@/lib/offline/sync-engine";
import { checkServerReachable, isAppOnline, notifySyncChange } from "@/lib/offline/network";

export function useOfflineSync() {
  const [online, setOnline] = useState(() => isAppOnline());
  const [serverReachable, setServerReachable] = useState(true);
  const [pending, setPending] = useState(() => getPendingCount());
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(() => {
    setOnline(isAppOnline());
    setPending(getPendingCount());
  }, []);

  const pingServer = useCallback(async () => {
    const ok = await checkServerReachable();
    setServerReachable(ok);
    return ok;
  }, []);

  const syncNow = useCallback(async () => {
    const reachable = await pingServer();
    if (!reachable) return;
    setSyncing(true);
    try {
      await flushOutbox();
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
