'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, ShieldCheck, Database, HardDriveDownload } from 'lucide-react';
import Link from 'next/link';

interface BackupSettingsProps {
  userRole: string;
}

export function BackupSettings({ userRole }: BackupSettingsProps) {
  const [downloading, setDownloading] = useState(false);
  const isOwner = userRole === 'OWNER';

  const handleDownloadBackup = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/settings/backup');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kirana_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Backup download error:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Backup & Data Controls</h1>
          <span className="text-xs text-emerald-700 font-semibold">डेटा बैकअप व सुरक्षा</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Full Store Data Backup (पूर्ण बैकअप)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Download an encrypted, portable JSON snapshot of your entire shop ledger, customer
              balances, suppliers, transactions, and daily closings.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automatic Tenant Isolation & Security</span>
          </div>
          <p>
            Your backup contains strictly tenant-scoped data for this shop. Keep this backup file in a safe location such as Google Drive or a USB drive.
          </p>
        </div>

        {isOwner ? (
          <div className="pt-2">
            <button
              onClick={handleDownloadBackup}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>{downloading ? 'Preparing Backup...' : 'Download Store Backup JSON / बैकअप डाउनलोड करें'}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-amber-700 font-medium">
            * Only the shop owner can export data backups.
          </p>
        )}
      </div>
    </div>
  );
}
