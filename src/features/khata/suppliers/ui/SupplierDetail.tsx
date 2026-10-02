'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/money';
import { SupplierWithBalance } from '@/features/khata/suppliers/supplier.service';
import { ArrowLeft, Phone, MapPin, FileText, Edit, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface SupplierDetailProps {
  supplier: SupplierWithBalance;
  recentLedgerEntries: any[];
}

export function SupplierDetail({ supplier, recentLedgerEntries }: SupplierDetailProps) {
  const isPayable = supplier.balanceMinor > 0n;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/khata/suppliers"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{supplier.name}</h1>
            <span className="text-xs text-slate-500">Supplier Profile / व्यापारी प्रोफ़ाइल</span>
          </div>
        </div>

        <Link
          href={`/khata/suppliers/${supplier.id}/edit`}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          title="Edit Profile"
        >
          <Edit className="w-4 h-4" />
        </Link>
      </div>

      {/* Balance Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Payable / दुकान को देना है
          </span>
          <div
            className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${
              isPayable ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {formatINR(supplier.balanceMinor)}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {isPayable
              ? 'Payable / व्यापारी का बकाया'
              : supplier.balanceMinor === 0n
              ? 'Account Settled / चुकता'
              : 'Advance Balance / अग्रिम'}
          </p>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 border-t sm:border-t-0 sm:border-l sm:pl-6 border-slate-100 pt-3 sm:pt-0">
          {supplier.mobile && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-mono">{supplier.mobile}</span>
            </div>
          )}
          {supplier.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{supplier.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/transactions/new?type=PURCHASE_CREDIT&partyType=SUPPLIER&partyId=${supplier.id}`}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition-colors text-center"
        >
          <ArrowDownLeft className="w-5 h-5" />
          <span>Purchase Credit / माल ख़रीद</span>
        </Link>

        <Link
          href={`/transactions/new?type=SUPPLIER_PAYMENT&partyType=SUPPLIER&partyId=${supplier.id}`}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-colors text-center"
        >
          <ArrowUpRight className="w-5 h-5" />
          <span>Pay Supplier / भुगतान करें</span>
        </Link>
      </div>

      {/* Recent Ledger Entries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Recent Ledger Entries / हाल का हिसाब
          </h2>
          <Link
            href={`/khata/suppliers/${supplier.id}/ledger`}
            className="text-xs text-amber-700 hover:underline font-semibold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full Ledger / पूरी बही</span>
          </Link>
        </div>

        {recentLedgerEntries.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {recentLedgerEntries.slice(0, 5).map((e) => (
              <div key={e.id} className="p-3.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {e.type.replace('_', ' ')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(e.transactionDate).toLocaleDateString('en-IN')}
                    {e.note && ` • ${e.note}`}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono font-bold ${
                      e.creditMinor > 0n ? 'text-amber-600' : 'text-blue-600'
                    }`}
                  >
                    {e.creditMinor > 0n ? `+${formatINR(e.creditMinor)}` : `-${formatINR(e.debitMinor)}`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Bal: {formatINR(e.runningBalanceMinor)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No transactions yet. Record a purchase credit or payment above.
          </div>
        )}
      </div>
    </div>
  );
}
