'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/money';
import { formatReadableDateTime } from '@/lib/dates';
import { Download, Banknote, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface CashReportProps {
  data: any;
}

export function CashReport({ data }: CashReportProps) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState(data.dateFrom);
  const [dateTo, setDateTo] = useState(data.dateTo);

  const handleApplyFilter = () => {
    router.push(`/reports/cash?dateFrom=${dateFrom}&dateTo=${dateTo}`);
  };

  const handleExport = () => {
    window.location.href = `/api/exports/report?type=CASH&dateFrom=${dateFrom}&dateTo=${dateTo}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Book Report</h1>
          <span className="text-xs text-blue-700 font-semibold">रोकड़ बही (कैश बुक)</span>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500">From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
          />
        </div>

        <button
          onClick={handleApplyFilter}
          className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          Apply Filter
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Cash In</span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            +{formatINR(data.totalCashIn)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">नकद आवक</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Cash Out</span>
          <div className="text-xl font-bold font-mono text-red-600 mt-1">
            -{formatINR(data.totalCashOut)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">नकद जावक</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase text-slate-400">Net Movement</span>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              data.netCashMovement >= 0n ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {formatINR(data.netCashMovement, { signed: true })}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">शुद्ध नकद परिवर्तन</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase text-slate-400">Cash in Hand</span>
          <div className="text-xl font-black font-mono text-blue-700 mt-1">
            {formatINR(data.currentCashInHand)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">वर्तमान गल्ला</p>
        </div>
      </div>

      {/* Cash Movement Ledger */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Cash Ledger Entries ({data.items.length})
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Transaction / Note</th>
                <th className="py-3 px-4 text-right text-emerald-600">Cash In (जमा)</th>
                <th className="py-3 px-4 text-right text-red-600">Cash Out (निकासी)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((i: any) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {formatReadableDateTime(i.date)}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800 text-xs">{i.type.replace('_', ' ')}</p>
                    {i.note && <p className="text-[11px] text-slate-500 italic">{i.note}</p>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                    {i.cashIn > 0n ? `+${formatINR(i.cashIn)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-red-600">
                    {i.cashOut > 0n ? `-${formatINR(i.cashOut)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
