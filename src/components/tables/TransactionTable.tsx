'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/money';
import { formatReadableDateTime } from '@/lib/dates';
import { ChevronRight, ArrowUpRight, ArrowDownLeft, Receipt, DollarSign } from 'lucide-react';

interface TransactionItem {
  id: string;
  type: string;
  partyType: string;
  partyId?: string | null;
  partyName?: string;
  amount: bigint;
  paymentMode?: string | null;
  transactionDate: Date;
  note?: string | null;
  referenceNo?: string | null;
  billNo?: string | null;
}

interface TransactionTableProps {
  transactions: TransactionItem[];
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function TransactionTable({
  transactions,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}: TransactionTableProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SALE_CREDIT':
        return {
          label: 'Customer Credit',
          hindi: 'उधार दिया',
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: ArrowUpRight,
        };
      case 'CUSTOMER_PAYMENT':
        return {
          label: 'Payment Received',
          hindi: 'जमा प्राप्त',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: ArrowDownLeft,
        };
      case 'PURCHASE_CREDIT':
        return {
          label: 'Supplier Credit',
          hindi: 'माल उधार',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: ArrowDownLeft,
        };
      case 'SUPPLIER_PAYMENT':
        return {
          label: 'Supplier Paid',
          hindi: 'भुगतान दिया',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: ArrowUpRight,
        };
      case 'SALE_CASH':
        return {
          label: 'Cash Sale',
          hindi: 'नकद बिक्री',
          color: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: DollarSign,
        };
      case 'EXPENSE':
        return {
          label: 'Store Expense',
          hindi: 'दुकान खर्च',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Receipt,
        };
      default:
        return {
          label: type.replace('_', ' '),
          hindi: 'लेन-देन',
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: Receipt,
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
      {/* Mobile Card List */}
      <div className="divide-y divide-slate-100 sm:hidden">
        {transactions.map((t) => {
          const badge = getTypeBadge(t.type);
          const Icon = badge.icon;

          return (
            <Link
              key={t.id}
              href={`/transactions/${t.id}`}
              className="block p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badge.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {t.partyName && t.partyName !== '-' ? t.partyName : badge.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${badge.color}`}
                      >
                        {badge.hindi}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatReadableDateTime(t.transactionDate)}
                    </p>

                    {t.note && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                        &quot;{t.note}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold font-mono text-base text-slate-900">
                    {formatINR(t.amount)}
                  </div>
                  {t.paymentMode && (
                    <span className="inline-block text-[10px] text-slate-500 font-medium">
                      {t.paymentMode}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <table className="w-full text-left border-collapse hidden sm:table">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Date & Time / दिनांक</th>
            <th className="py-3.5 px-4">Transaction / प्रकार</th>
            <th className="py-3.5 px-4">Party / ग्राहक या व्यापारी</th>
            <th className="py-3.5 px-4">Payment Mode</th>
            <th className="py-3.5 px-4 text-right">Amount / राशि</th>
            <th className="py-3.5 px-4">Bill/Ref</th>
            <th className="py-3.5 px-4 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {transactions.map((t) => {
            const badge = getTypeBadge(t.type);

            return (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 text-slate-600 text-xs">
                  {formatReadableDateTime(t.transactionDate)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                  >
                    <span>{badge.label}</span>
                    <span className="opacity-75">({badge.hindi})</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900">
                  {t.partyName && t.partyName !== '-' ? t.partyName : '-'}
                </td>
                <td className="py-3.5 px-4 text-slate-600 text-xs">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-mono">
                    {t.paymentMode || 'OTHER'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-base text-slate-900">
                  {formatINR(t.amount)}
                </td>
                <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                  {t.billNo || t.referenceNo || '-'}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/transactions/${t.id}`}
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold p-1"
                  >
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Bar */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium disabled:opacity-50"
            >
              Previous / पिछला
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium disabled:opacity-50"
            >
              Next / अगला
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
