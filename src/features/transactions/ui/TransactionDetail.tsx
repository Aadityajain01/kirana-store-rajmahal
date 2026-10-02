'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/money';
import { formatReadableDateTime } from '@/lib/dates';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { ArrowLeft, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface TransactionDetailProps {
  transaction: any;
  userRole: string;
}

export function TransactionDetail({ transaction, userRole }: TransactionDetailProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = userRole === 'OWNER';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/transactions');
        router.refresh();
      }
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/transactions"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transaction Details</h1>
            <span className="text-xs text-slate-500 font-mono">ID: {transaction.id}</span>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Soft Delete / हटाएँ</span>
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Type / प्रकार
            </span>
            <p className="text-lg font-bold text-slate-900">{transaction.type.replace('_', ' ')}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Amount</span>
            <p className="text-2xl font-black font-mono text-emerald-700">
              {formatINR(transaction.amount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block">Date & Time</span>
            <span className="font-semibold text-slate-800">
              {formatReadableDateTime(transaction.transactionDate)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Payment Mode</span>
            <span className="font-semibold text-slate-800 font-mono">
              {transaction.paymentMode || 'OTHER'}
            </span>
          </div>

          {transaction.referenceNo && (
            <div>
              <span className="text-slate-400 block">Reference No / UTR</span>
              <span className="font-mono text-slate-800">{transaction.referenceNo}</span>
            </div>
          )}

          {transaction.billNo && (
            <div>
              <span className="text-slate-400 block">Bill No</span>
              <span className="font-mono text-slate-800">{transaction.billNo}</span>
            </div>
          )}
        </div>

        {transaction.note && (
          <div className="pt-2 text-xs">
            <span className="text-slate-400 block">Note / सामान का विवरण</span>
            <p className="text-slate-700 font-medium italic mt-0.5">&quot;{transaction.note}&quot;</p>
          </div>
        )}
      </div>

      {/* Double-Entry Ledger Postings (Immutable Section 9 Invariant) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Immutable Double-Entry Postings (द्वि-प्रविष्टि लेखा)
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                <th className="py-2.5 px-3">Account Code</th>
                <th className="py-2.5 px-3">Account Name</th>
                <th className="py-2.5 px-3 text-right">Debit (नामे)</th>
                <th className="py-2.5 px-3 text-right">Credit (जमा)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.entries?.map((e: any) => (
                <tr key={e.id}>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    {e.account.code}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{e.account.name}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                    {e.debit > 0n ? formatINR(e.debit) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                    {e.credit > 0n ? formatINR(e.credit) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Soft Delete Transaction"
        hindiTitle="लेन-देन रद्द करें"
        description="Are you sure you want to soft-delete this financial entry? An audit trail event will be created and this transaction will be excluded from ledger balances."
        isDestructive
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete / हटाएँ'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
