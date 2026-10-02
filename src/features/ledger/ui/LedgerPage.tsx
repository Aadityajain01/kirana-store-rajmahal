'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PartyLedgerResult } from '@/features/ledger/ledger.service';
import { LedgerTable } from '@/components/tables/LedgerTable';
import { formatINR } from '@/lib/money';
import { ArrowLeft, Download, Share2, IndianRupee, FileText } from 'lucide-react';

interface LedgerPageProps {
  initialLedger: PartyLedgerResult;
}

export function LedgerPage({ initialLedger }: LedgerPageProps) {
  const [ledger] = useState(initialLedger);
  const party = ledger.party;
  const isCustomer = party.type === 'CUSTOMER';
  const isReceivable = isCustomer && ledger.currentBalanceMinor > 0n;

  const handleDownloadCSV = () => {
    window.location.href = `/api/exports/ledger?partyType=${party.type}&partyId=${party.id}`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `नमस्ते ${party.name} जी, आपके किराना खाते का विवरण:\nकुल दिया/उधार: ${formatINR(
        ledger.totalDebitMinor
      )}\nकुल जमा: ${formatINR(ledger.totalCreditMinor)}\nवर्तमान कुल बाकी: ${formatINR(
        ledger.currentBalanceMinor
      )}\nधन्यवाद!`
    );
    window.open(`https://wa.me/${party.mobile ? '91' + party.mobile : ''}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={isCustomer ? `/khata/customers/${party.id}` : `/khata/suppliers/${party.id}`}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{party.name}</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {isCustomer ? 'Customer Khata / ग्राहक खाता' : 'Supplier Khata / सप्लायर खाता'}
              </span>
            </div>
            {party.mobile && (
              <p className="text-xs font-mono text-slate-500 mt-0.5">Mobile: {party.mobile}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {party.mobile && (
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
          )}

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            {isCustomer ? 'Total Credit (उधार दिया)' : 'Total Paid (भुगतान दिया)'}
          </span>
          <div className="text-xl font-bold font-mono text-red-600 mt-1">
            {formatINR(ledger.totalDebitMinor)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            {isCustomer ? 'Total Received (जमा लिया)' : 'Total Credit (माल उधार लिया)'}
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {formatINR(ledger.totalCreditMinor)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Net Balance / कुल बाकी
          </span>
          <div
            className={`text-xl font-black font-mono mt-1 ${
              isReceivable ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {formatINR(ledger.currentBalanceMinor)}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Ledger Entries / खाता प्रविष्टियाँ ({ledger.entries.length})
          </h2>
        </div>

        {ledger.entries.length > 0 ? (
          <LedgerTable entries={ledger.entries} partyType={party.type} />
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
            No ledger transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
