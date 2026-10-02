'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/money';
import { CustomerWithBalance } from '@/features/khata/customers/customer.service';
import {
  ArrowLeft,
  Phone,
  MapPin,
  FileText,
  Edit,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
} from 'lucide-react';

interface CustomerDetailProps {
  customer: CustomerWithBalance;
  recentLedgerEntries: any[];
}

export function CustomerDetail({ customer, recentLedgerEntries }: CustomerDetailProps) {
  const isReceivable = customer.balanceMinor > 0n;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `नमस्ते ${customer.name} जी, आपके किराना स्टोर खाते में कुल बाकी राशि ${formatINR(
        customer.balanceMinor
      )} है। कृपया समय पर भुगतान करें। धन्यवाद!`
    );
    window.open(`https://wa.me/${customer.mobile ? '91' + customer.mobile : ''}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/khata/customers"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <span className="text-xs text-slate-500">Customer Profile / ग्राहक प्रोफ़ाइल</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customer.mobile && (
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Reminder</span>
            </button>
          )}

          <Link
            href={`/khata/customers/${customer.id}/edit`}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Edit Profile"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Current Balance / कुल बाकी
          </span>
          <div
            className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${
              isReceivable ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {formatINR(customer.balanceMinor)}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {isReceivable
              ? 'Receivable / ग्राहक से लेना है'
              : customer.balanceMinor === 0n
              ? 'Account Settled / चुकता'
              : 'Advance Balance / अग्रिम जमा'}
          </p>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 border-t sm:border-t-0 sm:border-l sm:pl-6 border-slate-100 pt-3 sm:pt-0">
          {customer.mobile && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-mono">{customer.mobile}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{customer.address}</span>
            </div>
          )}
          <div className="pt-1">
            <span className="text-slate-400">Credit Limit: </span>
            <span className="font-semibold font-mono">
              {customer.creditLimit > 0n ? formatINR(customer.creditLimit) : 'No Limit'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/transactions/new?type=SALE_CREDIT&partyType=CUSTOMER&partyId=${customer.id}`}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm transition-colors text-center"
        >
          <ArrowUpRight className="w-5 h-5" />
          <span>Give Credit / उधार दें</span>
        </Link>

        <Link
          href={`/transactions/new?type=CUSTOMER_PAYMENT&partyType=CUSTOMER&partyId=${customer.id}`}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors text-center"
        >
          <ArrowDownLeft className="w-5 h-5" />
          <span>Receive Payment / जमा लें</span>
        </Link>
      </div>

      {/* Recent Ledger Entries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Recent Ledger Entries / हाल का हिसाब
          </h2>
          <Link
            href={`/khata/customers/${customer.id}/ledger`}
            className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
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
                      e.debitMinor > 0n ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {e.debitMinor > 0n ? `+${formatINR(e.debitMinor)}` : `-${formatINR(e.creditMinor)}`}
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
            No transactions yet. Give credit or record a payment above.
          </div>
        )}
      </div>
    </div>
  );
}
