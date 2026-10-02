'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/money';
import { DateField } from '@/components/forms/DateField';
import { MoneyField } from '@/components/forms/MoneyField';
import {
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface DailyReportProps {
  data: any;
  userRole: string;
}

export function DailyReport({ data, userRole }: DailyReportProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(data.tradingDate);
  const [actualCashRupees, setActualCashRupees] = useState(
    data.closingRecord ? Number(data.closingRecord.actualCash / 100n) : 0
  );
  const [submittingClose, setSubmittingClose] = useState(false);
  const [closeSuccess, setCloseSuccess] = useState(false);

  const isClosed = data.closingRecord && !data.closingRecord.isReopened;
  const isOwner = userRole === 'OWNER';

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    router.push(`/reports/daily?date=${newDate}`);
  };

  const handleCloseDay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingClose(true);
    try {
      const res = await fetch('/api/reports/close-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradingDate: selectedDate,
          actualCashRupees,
        }),
      });
      if (res.ok) {
        setCloseSuccess(true);
        router.refresh();
      }
    } catch (e) {
      console.error('Close day failed:', e);
    } finally {
      setSubmittingClose(false);
    }
  };

  const handleReopenDay = async () => {
    try {
      const res = await fetch('/api/reports/reopen-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradingDate: selectedDate }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error('Reopen failed:', e);
    }
  };

  const handleExport = () => {
    window.location.href = `/api/exports/report?type=DAILY&dateFrom=${selectedDate}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Trading Report & Closing</h1>
          <span className="text-xs text-emerald-700 font-semibold">दैनिक व्यापार व गल्ला बंद</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date selector bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-64">
          <DateField value={selectedDate} onChange={handleDateChange} />
        </div>

        <div>
          {isClosed ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Day Closed / गल्ला बंद हो चुका है</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
              <Unlock className="w-3.5 h-3.5 text-amber-600" />
              <span>Day Open / गल्ला चालू है</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Sales</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {formatINR(data.totalSales)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Cash: {formatINR(data.cashSales)} | Credit: {formatINR(data.creditSales)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase text-slate-400">Customer Received</span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {formatINR(data.customerReceived)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">उधारी जमा वसूली</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase text-slate-400">Supplier Paid</span>
          <div className="text-xl font-bold font-mono text-blue-600 mt-1">
            {formatINR(data.supplierPaid)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">सप्लायर भुगतान</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase text-slate-400">Expenses</span>
          <div className="text-xl font-bold font-mono text-purple-600 mt-1">
            {formatINR(data.totalExpenses)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">दुकान खर्च</p>
        </div>
      </div>

      {/* Cash Movement & Day Closing Section (Section 18) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Cash Reconciliation & Daily Closing (गल्ला मिलान व बंदी)
          </h2>
          <p className="text-xs text-slate-500">
            Compare expected cash based on transactions against counted physical cash in drawer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
          <div>
            <span className="text-xs text-slate-500 block">Opening Cash (सुबह का गल्ला)</span>
            <span className="font-bold font-mono text-base text-slate-800">
              {formatINR(data.openingCash)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 block">Net Cash Flow (नकद आना - जाना)</span>
            <span className="font-bold font-mono text-base text-slate-800">
              +{formatINR(data.cashInflow)} / -{formatINR(data.cashOutflow)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 block">
              Expected Cash in Drawer (होना चाहिए)
            </span>
            <span className="font-black font-mono text-lg text-emerald-800">
              {formatINR(data.expectedCash)}
            </span>
          </div>
        </div>

        {/* Closing form or Closed summary */}
        {!isClosed ? (
          <form onSubmit={handleCloseDay} className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Enter Counted Cash to Close Day (गल्ला गिनकर भरें)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MoneyField
                label="Actual Physical Cash (गिने गए रुपये)"
                value={actualCashRupees}
                onChange={setActualCashRupees}
                required
              />

              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={submittingClose}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors"
                >
                  {submittingClose ? 'Closing Day...' : 'Lock & Close Day / गल्ला बंद करें'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">
                    Trading Day Closed by {data.closingRecord.closedBy}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Closed at: {new Date(data.closingRecord.closedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={handleReopenDay}
                  className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100"
                >
                  Reopen Day / पुनः खोलें
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-200/60 text-xs font-mono">
              <div>
                <span className="text-emerald-700">Actual Counted: </span>
                <span className="font-bold text-emerald-900">
                  {formatINR(data.closingRecord.actualCash)}
                </span>
              </div>
              <div>
                <span className="text-emerald-700">Cash Difference: </span>
                <span
                  className={`font-bold ${
                    data.closingRecord.difference === 0n
                      ? 'text-emerald-900'
                      : 'text-red-700'
                  }`}
                >
                  {formatINR(data.closingRecord.difference, { signed: true })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
