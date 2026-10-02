'use client';

import React from 'react';
import Link from 'next/link';
import { CustomerWithBalance } from '@/features/khata/customers/customer.service';
import { formatINR } from '@/lib/money';
import { Phone, ArrowUpRight, ArrowDownLeft, FileText, ChevronRight } from 'lucide-react';

interface CustomerTableProps {
  customers: CustomerWithBalance[];
  onQuickPayment?: (customer: CustomerWithBalance) => void;
  onQuickCredit?: (customer: CustomerWithBalance) => void;
}

export function CustomerTable({ customers, onQuickPayment, onQuickCredit }: CustomerTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
      {/* High-Density Responsive Table View for Both Mobile and Desktop */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2 px-3">ग्राहक का नाम (Customer)</th>
              <th className="py-2 px-2 text-center w-24">फ़ोन / संपर्क</th>
              <th className="py-2 px-3 text-right w-28">उधारी बाकी (Due)</th>
              <th className="py-2 px-3 text-center w-20">स्थिति</th>
              <th className="py-2 px-3 text-right w-36">कार्रवाई (Action)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  कोई ग्राहक उपलब्ध नहीं है (No customers found).
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const isReceivable = c.balanceMinor > 0n;
                const isZero = c.balanceMinor === 0n;
                const isOverLimit = c.creditLimit > 0n && c.balanceMinor > c.creditLimit;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer Name */}
                    <td className="py-2 px-3">
                      <Link
                        href={`/khata/customers/${c.id}`}
                        className="font-bold text-slate-900 hover:text-black flex items-center gap-1 group"
                      >
                        <span className="truncate max-w-[150px] sm:max-w-xs">{c.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Link>
                      {c.address && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{c.address}</p>
                      )}
                    </td>

                    {/* Mobile Phone */}
                    <td className="py-2 px-2 text-center text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {c.mobile ? (
                        <a href={`tel:${c.mobile}`} className="hover:underline flex items-center justify-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.mobile}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Balance Due */}
                    <td className="py-2 px-3 text-right whitespace-nowrap font-mono">
                      <div
                        className={`font-black text-xs sm:text-sm ${
                          isReceivable
                            ? 'text-rose-600'
                            : isZero
                            ? 'text-slate-500'
                            : 'text-emerald-600'
                        }`}
                      >
                        {formatINR(c.balanceMinor)}
                      </div>
                      {isOverLimit && (
                        <span className="text-[9px] text-amber-600 font-bold block">
                          ⚠️ सीमा पार
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isReceivable
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isZero
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isReceivable ? 'लेना है' : isZero ? 'चुकता' : 'जमा'}
                      </span>
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/khata/customers/${c.id}/ledger`}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="बही खाता देखें (Ledger)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => onQuickCredit?.(c)}
                          className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors"
                          title="उधार दें"
                        >
                          + उधार
                        </button>

                        <button
                          type="button"
                          onClick={() => onQuickPayment?.(c)}
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 transition-colors"
                          title="जमा लें"
                        >
                          + जमा
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
