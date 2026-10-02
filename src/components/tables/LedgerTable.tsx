'use client';

import React from 'react';
import { LedgerEntryItem } from '@/features/ledger/ledger.service';
import { formatINR } from '@/lib/money';
import { formatReadableDateTime } from '@/lib/dates';

interface LedgerTableProps {
  entries: LedgerEntryItem[];
  partyType: 'CUSTOMER' | 'SUPPLIER';
}

export function LedgerTable({ entries, partyType }: LedgerTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
      {/* Mobile Ledger List */}
      <div className="divide-y divide-slate-100 sm:hidden">
        {entries.map((e) => {
          const isDebit = e.debitMinor > 0n;
          const isCredit = e.creditMinor > 0n;

          return (
            <div key={e.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    {formatReadableDateTime(e.transactionDate)}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {e.type.replace('_', ' ')}
                  </div>
                  {e.referenceNo && (
                    <div className="text-[11px] font-mono text-slate-400">
                      Ref: {e.referenceNo}
                    </div>
                  )}
                  {e.note && (
                    <div className="text-xs text-slate-600 mt-1 italic">&quot;{e.note}&quot;</div>
                  )}
                </div>

                <div className="text-right">
                  {isDebit && (
                    <div className="text-base font-bold font-mono text-red-600">
                      +{formatINR(e.debitMinor)}
                      <span className="text-[10px] block text-red-700 font-sans">
                        {partyType === 'CUSTOMER' ? 'Udhar / उधार दिया' : 'Paid / भुगतान दिया'}
                      </span>
                    </div>
                  )}
                  {isCredit && (
                    <div className="text-base font-bold font-mono text-emerald-600">
                      -{formatINR(e.creditMinor)}
                      <span className="text-[10px] block text-emerald-700 font-sans">
                        {partyType === 'CUSTOMER' ? 'Received / जमा लिया' : 'Credit / माल आया'}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-slate-500 font-mono mt-1 font-semibold">
                    Bal: {formatINR(e.runningBalanceMinor)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <table className="w-full text-left border-collapse hidden sm:table">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Date & Time / दिनांक</th>
            <th className="py-3.5 px-4">Transaction / विवरण</th>
            <th className="py-3.5 px-4">Mode / Ref</th>
            <th className="py-3.5 px-4 text-right text-red-600">
              {partyType === 'CUSTOMER' ? 'Debit (उधार दिया)' : 'Debit (भुगतान दिया)'}
            </th>
            <th className="py-3.5 px-4 text-right text-emerald-600">
              {partyType === 'CUSTOMER' ? 'Credit (जमा लिया)' : 'Credit (माल उधार लिया)'}
            </th>
            <th className="py-3.5 px-4 text-right">Balance / कुल बाकी</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {entries.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3.5 px-4 text-slate-600 text-xs">
                {formatReadableDateTime(e.transactionDate)}
              </td>
              <td className="py-3.5 px-4">
                <p className="font-semibold text-slate-900 text-xs">{e.type.replace('_', ' ')}</p>
                {e.note && <p className="text-slate-500 text-xs italic">&quot;{e.note}&quot;</p>}
              </td>
              <td className="py-3.5 px-4 text-slate-500 text-xs">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-mono">
                  {e.paymentMode || 'OTHER'}
                </span>
                {e.referenceNo && (
                  <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                    {e.referenceNo}
                  </span>
                )}
              </td>
              <td className="py-3.5 px-4 text-right font-bold font-mono text-red-600">
                {e.debitMinor > 0n ? formatINR(e.debitMinor) : '-'}
              </td>
              <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600">
                {e.creditMinor > 0n ? formatINR(e.creditMinor) : '-'}
              </td>
              <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900 bg-slate-50/50">
                {formatINR(e.runningBalanceMinor)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
