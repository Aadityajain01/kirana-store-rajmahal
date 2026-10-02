'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/money';
import { Download, ChevronRight, Phone } from 'lucide-react';

interface OutstandingReportProps {
  data: any;
}

export function OutstandingReport({ data }: OutstandingReportProps) {
  const handleExport = () => {
    window.location.href = '/api/exports/report?type=OUTSTANDING';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outstanding Balance Report</h1>
          <span className="text-xs text-red-700 font-semibold">उधारी व बाकी हिसाब रिपोर्ट</span>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Customer Receivables (लेना है)
          </span>
          <div className="text-2xl font-black font-mono text-red-600 mt-1">
            {formatINR(data.totalCustomerReceivables)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {data.customers.length} customers with pending balance
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Supplier Payables (देना है)
          </span>
          <div className="text-2xl font-black font-mono text-amber-600 mt-1">
            {formatINR(data.totalSupplierPayables)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {data.suppliers.length} wholesale suppliers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Net Store Balance (शुद्ध स्थिति)
          </span>
          <div
            className={`text-2xl font-black font-mono mt-1 ${
              data.netBalance >= 0n ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {formatINR(data.netBalance, { signed: true })}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {data.netBalance >= 0n ? 'Net positive position' : 'Net payable position'}
          </p>
        </div>
      </div>

      {/* Tables side by side or stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customers Outstanding */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Customer Receivables ({data.customers.length})</span>
            <span className="text-xs text-red-600 font-semibold font-mono">
              {formatINR(data.totalCustomerReceivables)}
            </span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-subtle">
            {data.customers.map((c: any) => (
              <Link
                key={c.id}
                href={`/khata/customers/${c.id}`}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-sm"
              >
                <div>
                  <p className="font-bold text-slate-900">{c.name}</p>
                  {c.mobile && (
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{c.mobile}</span>
                    </p>
                  )}
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-bold font-mono text-base text-red-600">
                    {formatINR(c.balanceMinor)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Suppliers Outstanding */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Supplier Payables ({data.suppliers.length})</span>
            <span className="text-xs text-amber-600 font-semibold font-mono">
              {formatINR(data.totalSupplierPayables)}
            </span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-subtle">
            {data.suppliers.map((s: any) => (
              <Link
                key={s.id}
                href={`/khata/suppliers/${s.id}`}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-sm"
              >
                <div>
                  <p className="font-bold text-slate-900">{s.name}</p>
                  {s.mobile && (
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{s.mobile}</span>
                    </p>
                  )}
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-bold font-mono text-base text-amber-600">
                    {formatINR(s.balanceMinor)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
