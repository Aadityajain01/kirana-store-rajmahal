'use client';

import React from 'react';
import { useSyncStatus } from '@/features/sync/sync-client';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export function SyncBadge() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useSyncStatus();

  return (
    <div className="flex items-center gap-2">
      {!isOnline ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300">
          <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
          <span>Offline / ऑफ़लाइन</span>
          {pendingCount > 0 && (
            <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </div>
      ) : pendingCount > 0 ? (
        <button
          onClick={syncNow}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition-colors"
          title="Click to sync pending entries"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : `Sync ${pendingCount} / सिंक करें`}</span>
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Synced / सुरक्षित</span>
          <Wifi className="w-3 h-3 text-emerald-500 sm:hidden" />
        </div>
      )}
    </div>
  );
}
