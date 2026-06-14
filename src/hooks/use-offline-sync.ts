import { useCallback, useEffect, useState } from "react";

import { getPendingCount } from "@/lib/offline/outbox";
import { flushOutbox, initOfflineSync } from "@/lib/offline/sync-engine";
import { isAppOnline, notifySyncChange } from "@/lib/offline/network";

export function useOfflineSync() {
  const [online, setOnline] = useState(() => isAppOnline());
  const [pending, setPending] = useState(() => getPendingCount());
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(() => {
    setOnline(isAppOnline());
    setPending(getPendingCount());
  }, []);

  const syncNow = useCallback(async () => {
    if (!isAppOnline()) return;
    setSyncing(true);
    try {
      await flushOutbox();
    } finally {
      setSyncing(false);
      refresh();
    }
  }, [refresh]);

  useEffect(() => {
    const teardown = initOfflineSync();
    const onChange = () => refresh();
    window.addEventListener("online", onChange);
    window.addEventListener("offline", onChange);
    window.addEventListener("michelada-sync-change", onChange);
    refresh();
    return () => {
      teardown();
      window.removeEventListener("online", onChange);
      window.removeEventListener("offline", onChange);
      window.removeEventListener("michelada-sync-change", onChange);
    };
  }, [refresh]);

  return { online, pending, syncing, syncNow };
}

export function triggerSyncRefresh(): void {
  notifySyncChange();
}
