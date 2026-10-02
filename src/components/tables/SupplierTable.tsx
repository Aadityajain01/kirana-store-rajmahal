'use client';

import React from 'react';
import Link from 'next/link';
import { SupplierWithBalance } from '@/features/khata/suppliers/supplier.service';
import { formatINR } from '@/lib/money';
import { Phone, FileText, ChevronRight } from 'lucide-react';

interface SupplierTableProps {
  suppliers: SupplierWithBalance[];
  onQuickPayment?: (supplier: SupplierWithBalance) => void;
  onQuickPurchase?: (supplier: SupplierWithBalance) => void;
}

export function SupplierTable({ suppliers, onQuickPayment, onQuickPurchase }: SupplierTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2 px-3">व्यापारी का नाम (Supplier)</th>
              <th className="py-2 px-2 text-center w-24">फ़ोन / संपर्क</th>
              <th className="py-2 px-3 text-right w-28">देना बाकी (We Owe)</th>
              <th className="py-2 px-3 text-center w-20">स्थिति</th>
              <th className="py-2 px-3 text-right w-36">कार्रवाई (Action)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  कोई व्यापारी उपलब्ध नहीं है (No suppliers found).
                </td>
              </tr>
            ) : (
              suppliers.map((s) => {
                const isPayable = s.balanceMinor > 0n;
                const isZero = s.balanceMinor === 0n;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Supplier Name */}
                    <td className="py-2 px-3">
                      <Link
                        href={`/khata/suppliers/${s.id}`}
                        className="font-bold text-slate-900 hover:text-black flex items-center gap-1 group"
                      >
                        <span className="truncate max-w-[150px] sm:max-w-xs">{s.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Link>
                      {s.address && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{s.address}</p>
                      )}
                    </td>

                    {/* Mobile Phone */}
                    <td className="py-2 px-2 text-center text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {s.mobile ? (
                        <a href={`tel:${s.mobile}`} className="hover:underline flex items-center justify-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{s.mobile}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Balance Owed */}
                    <td className="py-2 px-3 text-right whitespace-nowrap font-mono">
                      <div
                        className={`font-black text-xs sm:text-sm ${
                          isPayable
                            ? 'text-amber-700'
                            : isZero
                            ? 'text-slate-500'
                            : 'text-emerald-600'
                        }`}
                      >
                        {formatINR(s.balanceMinor)}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPayable
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isZero
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isPayable ? 'देना है' : isZero ? 'चुकता' : 'अग्रिम'}
                      </span>
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/khata/suppliers/${s.id}/ledger`}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="बही खाता देखें (Ledger)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => onQuickPurchase?.(s)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300 transition-colors"
                          title="माल ख़रीद दर्ज करें"
                        >
                          + खरीद
                        </button>

                        <button
                          type="button"
                          onClick={() => onQuickPayment?.(s)}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-sm transition-colors"
                          title="भुगतान करें"
                        >
                          + भुगतान
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
