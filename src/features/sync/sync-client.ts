'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineDb, getPendingCommands, LocalSyncCommand } from './offline-db';

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const refreshPendingCount = useCallback(async () => {
    if (!offlineDb) return;
    try {
      const items = await getPendingCommands();
      setPendingCount(items.length);
    } catch {
      // ignore in SSR
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!offlineDb || isSyncing || !navigator.onLine) return;

    try {
      setIsSyncing(true);
      const pending = await getPendingCommands();
      if (pending.length === 0) {
        setIsSyncing(false);
        setLastSyncTime(new Date());
        return;
      }

      let deviceId = localStorage.getItem('kirana_device_id');
      if (!deviceId) {
        deviceId = `dev_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('kirana_device_id', deviceId);
      }

      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          commands: pending.map((p) => ({
            idempotencyKey: p.idempotencyKey,
            commandType: p.commandType,
            payload: p.payload,
            clientCreatedAt: p.clientCreatedAt,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        for (const ack of data.acks || []) {
          const match = pending.find((p) => p.idempotencyKey === ack.idempotencyKey);
          if (match && match.id) {
            if (ack.status === 'SYNCED' || ack.status === 'DUPLICATE') {
              await offlineDb.commands.delete(match.id);
            } else {
              await offlineDb.commands.update(match.id, {
                status: 'FAILED',
                error: ack.error,
              });
            }
          }
        }
        setLastSyncTime(new Date());
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
      refreshPendingCount();
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [refreshPendingCount, syncNow]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncNow,
    refreshPendingCount,
  };
}
