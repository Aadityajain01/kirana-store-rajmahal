'use client';

import React, { useState } from 'react';
import { TransactionTable } from '@/components/tables/TransactionTable';
import { FilterBar } from '@/components/filters/FilterBar';
import { formatINR } from '@/lib/money';
import { Download } from 'lucide-react';

interface TransactionReportProps {
  initialData: any;
}

export function TransactionReport({ initialData }: TransactionReportProps) {
  const [data] = useState(initialData);
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState('ALL');

  const filteredItems = (data.items || []).filter((t: any) => {
    if (query) {
      const q = query.toLowerCase();
      const matchNote = t.note && t.note.toLowerCase().includes(q);
      const matchRef = t.referenceNo && t.referenceNo.toLowerCase().includes(q);
      const matchParty = t.partyName && t.partyName.toLowerCase().includes(q);
      if (!matchNote && !matchRef && !matchParty) return false;
    }
    return true;
  });

  const totalAmount = filteredItems.reduce((sum: bigint, t: any) => sum + BigInt(t.amount), 0n);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Report</h1>
          <span className="text-xs text-emerald-700 font-semibold">लेन-देन ऑडिट रिपोर्ट</span>
        </div>

        <button
          onClick={() => (window.location.href = '/api/exports/report?type=DAILY')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold uppercase text-slate-400">Total Entries</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {filteredItems.length} transactions
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold uppercase text-slate-400">Total Volume</span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {formatINR(totalAmount)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold uppercase text-slate-400">Page Navigation</span>
          <p className="text-xs text-slate-500 mt-2">Showing all synchronized transaction records.</p>
        </div>
      </div>

      <FilterBar query={query} onQueryChange={setQuery} preset={preset} onPresetChange={setPreset} />

      <TransactionTable transactions={filteredItems} />
    </div>
  );
}
