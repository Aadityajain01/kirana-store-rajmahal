'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoneyField } from '@/components/forms/MoneyField';
import { PaymentModeSelect } from '@/components/forms/PaymentModeSelect';
import { DateField } from '@/components/forms/DateField';
import { getTodayTradingDate } from '@/lib/dates';
import { enqueueOfflineCommand } from '@/features/sync/offline-db';
import { useSyncStatus } from '@/features/sync/sync-client';
import { ArrowLeft, Receipt } from 'lucide-react';
import Link from 'next/link';

interface ExpenseFormProps {
  categories: { id: string; name: string }[];
}

export function ExpenseForm({ categories }: ExpenseFormProps) {
  const router = useRouter();
  const { syncNow } = useSyncStatus();

  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [amountRupees, setAmountRupees] = useState(0);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [expenseDate, setExpenseDate] = useState(getTodayTradingDate());
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountRupees <= 0) {
      setError('Please enter expense amount / खर्च की राशि भरें');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await enqueueOfflineCommand('EXPENSE', {
        categoryId,
        amountRupees,
        paymentMode,
        expenseDate,
        note,
      });
      syncNow();

      router.push('/reports/expenses');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/reports/expenses"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Record Store Expense</h1>
          <span className="text-xs text-purple-700 font-semibold">दुकान खर्च दर्ज करें</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5"
      >
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Expense Category / खर्च की श्रेणी <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl outline-none focus:border-purple-600 bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <MoneyField
          label="Expense Amount / खर्च राशि"
          value={amountRupees}
          onChange={setAmountRupees}
          required
        />

        <PaymentModeSelect value={paymentMode} onChange={setPaymentMode} />

        <DateField value={expenseDate} onChange={setExpenseDate} />

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Details / Note / विशेष विवरण
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Electricity bill for September, Samosa-tea"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-purple-600"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/reports/expenses"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel / रद्द करें
          </Link>

          <button
            type="submit"
            disabled={submitting || amountRupees <= 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Expense / खर्च सुरक्षित करें'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
