'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/money';
import { formatReadableDateTime } from '@/lib/dates';
import { Download, Plus, Receipt } from 'lucide-react';

interface ExpenseReportProps {
  data: any;
}

export function ExpenseReport({ data }: ExpenseReportProps) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState(data.dateFrom);
  const [dateTo, setDateTo] = useState(data.dateTo);

  const handleApplyFilter = () => {
    router.push(`/reports/expenses?dateFrom=${dateFrom}&dateTo=${dateTo}`);
  };

  const handleExport = () => {
    window.location.href = `/api/exports/report?type=EXPENSES&dateFrom=${dateFrom}&dateTo=${dateTo}`;
  };

  const totalExpenseNum = Number(data.totalExpenseMinor);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expense Report</h1>
          <span className="text-xs text-purple-700 font-semibold">दुकान खर्च रिपोर्ट</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/transactions/new?type=EXPENSE"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense / नया खर्च</span>
          </Link>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
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
          className="w-full sm:w-auto px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
        >
          Apply Filter
        </button>
      </div>

      {/* Overall Total Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Expenses in Period
          </span>
          <div className="text-3xl font-black font-mono text-purple-700 mt-1">
            {formatINR(data.totalExpenseMinor)}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{data.transactionCount} transactions recorded</p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <Receipt className="w-6 h-6" />
        </div>
      </div>

      {/* Category Breakdown with Bars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Category-wise Breakdown (श्रेणीवार खर्च)
        </h2>

        <div className="space-y-3">
          {data.breakdown.map((b: any) => {
            const bNum = Number(b.totalMinor);
            const percent = totalExpenseNum > 0 ? Math.round((bNum / totalExpenseNum) * 100) : 0;

            return (
              <div key={b.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">
                    {b.name} ({b.count} entries)
                  </span>
                  <span className="font-mono text-purple-900">
                    {formatINR(b.totalMinor)} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Entries Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">All Expense Entries</h2>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category / Note</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.transactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {formatReadableDateTime(t.transactionDate)}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800 text-xs">
                      {t.expense?.category?.name || 'Store Expense'}
                    </p>
                    {t.note && <p className="text-[11px] text-slate-500 italic">{t.note}</p>}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 font-mono">
                    {t.paymentMode || 'CASH'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-purple-700">
                    {formatINR(t.amount)}
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
