'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Truck,
  Wallet,
  RefreshCw,
} from 'lucide-react';

export default function ReportsPage() {
  const [mode, setMode] = useState<'daily' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/reliable-summary?mode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const summary = reportData?.summary;
  const rows = reportData?.rows || [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Header with Mode Toggle */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-300" />
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                विश्वसनीय वित्तीय रिपोर्ट (Financial Reports)
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              दैनिक एवं मासिक आधार पर ग्राहक उधार, जमा, एवं सप्लायर लेन-देन का विश्वसनीय हिसाब।
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Daily / Monthly Toggle */}
            <div className="inline-flex p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('daily')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  mode === 'daily'
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                दैनिक (Daily)
              </button>
              <button
                type="button"
                onClick={() => setMode('monthly')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  mode === 'monthly'
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                मासिक (Monthly)
              </button>
            </div>

            <button
              type="button"
              onClick={fetchReports}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="रीफ्रेश करें"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Period Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-slate-800 text-xs">
          {/* Customer Credit Given */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">ग्राहक उधार दिया</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-400">
              ₹{summary ? summary.totalCustomerCreditGivenRupees.toLocaleString('en-IN') : '0'}
            </div>
          </div>

          {/* Customer Jama Received */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">ग्राहक जमा लिया</span>
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
              ₹{summary ? summary.totalCustomerCreditReceivedRupees.toLocaleString('en-IN') : '0'}
            </div>
          </div>

          {/* Supplier Purchases Owed */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">सप्लायर से खरीद</span>
              <Truck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-amber-300">
              ₹{summary ? summary.totalSupplierCreditPurchasesRupees.toLocaleString('en-IN') : '0'}
            </div>
          </div>

          {/* Net Cash Inflow */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">नेट नकद प्रवाह</span>
              <Wallet className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-white">
              ₹{summary ? summary.netCashflowRupees.toLocaleString('en-IN') : '0'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Compact High-Density Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-3 sm:px-4 sm:py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-xs sm:text-sm text-slate-900">
              {mode === 'daily' ? 'दैनिक सारांश तालिका (Daily Breakdown)' : 'मासिक सारांश तालिका (Monthly Breakdown)'}
            </h2>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
              {rows.length} {mode === 'daily' ? 'दिन' : 'माह'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2 px-3 w-32">तिथि / अवधि</th>
                <th className="py-2 px-3 text-right text-rose-700">उधार दिया (ग्राहक)</th>
                <th className="py-2 px-3 text-right text-emerald-700">जमा मिला (ग्राहक)</th>
                <th className="py-2 px-3 text-right text-amber-800">सप्लायर खरीद (देना)</th>
                <th className="py-2 px-3 text-right text-slate-700">सप्लायर भुगतान</th>
                <th className="py-2 px-3 text-right text-slate-900">नेट नकद बचत</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-sans">
                    गणना हो रही है...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-sans">
                    चयनित अवधि में कोई लेन-देन उपलब्ध नहीं है।
                  </td>
                </tr>
              ) : (
                rows.map((row: any) => {
                  const netCash = Number(row.netCashflowRupees) || 0;
                  return (
                    <tr key={row.key} className="hover:bg-slate-50/70 transition-colors">
                      {/* Period Label */}
                      <td className="py-2 px-3 text-xs font-sans font-semibold text-slate-800 whitespace-nowrap">
                        {row.label}
                      </td>

                      {/* Customer Credit Given */}
                      <td className="py-2 px-3 text-right font-bold text-rose-600 whitespace-nowrap">
                        {row.customerCreditGivenRupees > 0 ? `₹${row.customerCreditGivenRupees.toLocaleString('en-IN')}` : '-'}
                      </td>

                      {/* Customer Credit Received */}
                      <td className="py-2 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                        {row.customerCreditReceivedRupees > 0 ? `₹${row.customerCreditReceivedRupees.toLocaleString('en-IN')}` : '-'}
                      </td>

                      {/* Supplier Credit Purchases */}
                      <td className="py-2 px-3 text-right font-medium text-amber-700 whitespace-nowrap">
                        {row.supplierCreditPurchasesRupees > 0 ? `₹${row.supplierCreditPurchasesRupees.toLocaleString('en-IN')}` : '-'}
                      </td>

                      {/* Supplier Money Paid */}
                      <td className="py-2 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                        {row.supplierMoneyPaidRupees > 0 ? `₹${row.supplierMoneyPaidRupees.toLocaleString('en-IN')}` : '-'}
                      </td>

                      {/* Net Cash Flow */}
                      <td className="py-2 px-3 text-right font-bold whitespace-nowrap">
                        <span className={netCash >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {netCash >= 0 ? `+₹${netCash.toLocaleString('en-IN')}` : `-₹${Math.abs(netCash).toLocaleString('en-IN')}`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
