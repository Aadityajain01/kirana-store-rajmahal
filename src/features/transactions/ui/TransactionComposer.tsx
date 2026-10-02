'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MoneyField } from '@/components/forms/MoneyField';
import { PartySelect } from '@/components/forms/PartySelect';
import { PaymentModeSelect } from '@/components/forms/PaymentModeSelect';
import { DateField } from '@/components/forms/DateField';
import { NoteField } from '@/components/forms/NoteField';
import { getTodayTradingDate } from '@/lib/dates';
import { enqueueOfflineCommand } from '@/features/sync/offline-db';
import { useSyncStatus } from '@/features/sync/sync-client';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Receipt,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';

interface TransactionComposerProps {
  customers: { id: string; name: string; mobile?: string | null; balanceMinor?: bigint }[];
  suppliers: { id: string; name: string; mobile?: string | null; balanceMinor?: bigint }[];
  expenseCategories: { id: string; name: string }[];
}

function TransactionComposerContent({
  customers,
  suppliers,
  expenseCategories,
}: TransactionComposerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { syncNow } = useSyncStatus();

  const initialType = searchParams.get('type') || 'SALE_CREDIT';
  const initialPartyType = (searchParams.get('partyType') as 'CUSTOMER' | 'SUPPLIER' | 'NONE') ||
    (initialType === 'SUPPLIER_PAYMENT' || initialType === 'PURCHASE_CREDIT' ? 'SUPPLIER' : 'CUSTOMER');
  const initialPartyId = searchParams.get('partyId') || '';

  const [type, setType] = useState(initialType);
  const [partyType, setPartyType] = useState<'CUSTOMER' | 'SUPPLIER' | 'NONE'>(initialPartyType);
  const [partyId, setPartyId] = useState(initialPartyId);
  const [amountRupees, setAmountRupees] = useState(0);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [transactionDate, setTransactionDate] = useState(getTodayTradingDate());
  const [note, setNote] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [billNo, setBillNo] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState(expenseCategories[0]?.id || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transactionTypes = [
    {
      id: 'SALE_CREDIT',
      label: 'Customer Credit',
      hindi: 'ग्राहक को उधार दिया',
      partyType: 'CUSTOMER',
      color: 'border-red-500 bg-red-50 text-red-900',
      icon: ArrowUpRight,
    },
    {
      id: 'CUSTOMER_PAYMENT',
      label: 'Customer Payment',
      hindi: 'ग्राहक से जमा लिया',
      partyType: 'CUSTOMER',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
      icon: ArrowDownLeft,
    },
    {
      id: 'SALE_CASH',
      label: 'Cash Sale',
      hindi: 'नकद बिक्री (गल्ला)',
      partyType: 'NONE',
      color: 'border-teal-500 bg-teal-50 text-teal-900',
      icon: DollarSign,
    },
    {
      id: 'PURCHASE_CREDIT',
      label: 'Purchase Credit',
      hindi: 'सप्लायर से माल उधार',
      partyType: 'SUPPLIER',
      color: 'border-amber-500 bg-amber-50 text-amber-900',
      icon: ArrowDownLeft,
    },
    {
      id: 'SUPPLIER_PAYMENT',
      label: 'Supplier Payment',
      hindi: 'व्यापारी को भुगतान',
      partyType: 'SUPPLIER',
      color: 'border-blue-500 bg-blue-50 text-blue-900',
      icon: ArrowUpRight,
    },
    {
      id: 'EXPENSE',
      label: 'Store Expense',
      hindi: 'दुकान खर्च (खर्चा)',
      partyType: 'NONE',
      color: 'border-purple-500 bg-purple-50 text-purple-900',
      icon: TrendingDown,
    },
  ];

  const handleTypeSelect = (selectedId: string) => {
    setType(selectedId);
    const item = transactionTypes.find((t) => t.id === selectedId);
    if (item) {
      setPartyType(item.partyType as any);
      if (item.partyType === 'NONE') setPartyId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountRupees <= 0) {
      setError('Please enter a valid amount / कृपया राशि भरें');
      return;
    }

    if (partyType !== 'NONE' && !partyId) {
      setError('Please select a customer or supplier / कृपया पार्टी चुनें');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let cmdType = 'CUSTOMER_CREDIT';
      if (type === 'CUSTOMER_PAYMENT') cmdType = 'CUSTOMER_PAYMENT';
      else if (type === 'SUPPLIER_PAYMENT') cmdType = 'SUPPLIER_PAYMENT';
      else if (type === 'EXPENSE') cmdType = 'EXPENSE';

      const payload = {
        type,
        partyType,
        customerId: partyType === 'CUSTOMER' ? partyId : undefined,
        supplierId: partyType === 'SUPPLIER' ? partyId : undefined,
        amountRupees,
        paymentMode: type === 'SALE_CREDIT' ? 'OTHER' : paymentMode,
        transactionDate,
        note,
        referenceNo,
        billNo,
        categoryId: type === 'EXPENSE' ? expenseCategoryId : undefined,
      };

      await enqueueOfflineCommand(cmdType, payload);
      syncNow();

      router.push('/transactions');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Transaction failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/transactions"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Transaction Entry</h1>
          <span className="text-xs text-emerald-700 font-semibold">नया लेन-देन दर्ज करें</span>
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
            Select Entry Type / लेन-देन का प्रकार
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {transactionTypes.map((t) => {
              const isSelected = type === t.id;
              const Icon = t.icon;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeSelect(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? `${t.color} ring-2 ring-emerald-600/30 font-bold shadow-sm`
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="w-4 h-4" />
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold leading-tight">{t.label}</span>
                    <span className="block text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                      {t.hindi}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {partyType === 'CUSTOMER' && (
          <PartySelect
            label="Customer / ग्राहक चुनें"
            partyType="CUSTOMER"
            parties={customers}
            value={partyId}
            onChange={setPartyId}
            required
          />
        )}

        {partyType === 'SUPPLIER' && (
          <PartySelect
            label="Supplier / व्यापारी चुनें"
            partyType="SUPPLIER"
            parties={suppliers}
            value={partyId}
            onChange={setPartyId}
            required
          />
        )}

        {type === 'EXPENSE' && (
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Expense Category / खर्च की श्रेणी <span className="text-red-500">*</span>
            </label>
            <select
              value={expenseCategoryId}
              onChange={(e) => setExpenseCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl outline-none focus:border-emerald-600 bg-white"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <MoneyField
          label="Amount / राशि"
          value={amountRupees}
          onChange={setAmountRupees}
          required
        />

        {type !== 'SALE_CREDIT' && type !== 'PURCHASE_CREDIT' && (
          <PaymentModeSelect value={paymentMode} onChange={setPaymentMode} />
        )}

        <DateField value={transactionDate} onChange={setTransactionDate} />

        <NoteField
          value={note}
          onChange={setNote}
          billNo={billNo}
          onBillNoChange={setBillNo}
          referenceNo={referenceNo}
          onReferenceNoChange={setReferenceNo}
        />

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/transactions"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel / रद्द करें
          </Link>

          <button
            type="submit"
            disabled={submitting || amountRupees <= 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{submitting ? 'Posting...' : 'Save & Post / खाता जमा करें'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function TransactionComposer(props: TransactionComposerProps) {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500">Loading form...</div>}>
      <TransactionComposerContent {...props} />
    </Suspense>
  );
}
