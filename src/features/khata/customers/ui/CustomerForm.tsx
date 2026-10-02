'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoneyField } from '@/components/forms/MoneyField';
import { enqueueOfflineCommand } from '@/features/sync/offline-db';
import { useSyncStatus } from '@/features/sync/sync-client';
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface CustomerFormProps {
  initialData?: {
    id?: string;
    name?: string;
    mobile?: string | null;
    address?: string | null;
    creditLimitRupees?: number;
  };
  isEdit?: boolean;
}

export function CustomerForm({ initialData, isEdit = false }: CustomerFormProps) {
  const router = useRouter();
  const { syncNow } = useSyncStatus();

  const [name, setName] = useState(initialData?.name || '');
  const [mobile, setMobile] = useState(initialData?.mobile || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [creditLimitRupees, setCreditLimitRupees] = useState(initialData?.creditLimitRupees || 0);
  const [openingBalanceRupees, setOpeningBalanceRupees] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Customer name is required / ग्राहक का नाम आवश्यक है');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        mobile: mobile.trim() || undefined,
        address: address.trim() || undefined,
        creditLimitRupees,
        openingBalanceRupees,
      };

      if (!isEdit) {
        // Enqueue offline creation
        await enqueueOfflineCommand('CREATE_CUSTOMER', payload);
        syncNow();
      }

      router.push('/khata/customers');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/khata/customers"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h1>
          <span className="text-xs text-emerald-700 font-semibold">
            {isEdit ? 'ग्राहक विवरण बदलें' : 'नया ग्राहक खाता जोड़ें'}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5"
      >
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Customer Name / ग्राहक का नाम <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ram Kumar, Vikram Singh"
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Mobile Number / मोबाइल नंबर (10 अंक)
          </label>
          <input
            type="tel"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 9876543210"
            className="w-full px-3.5 py-2.5 text-base font-mono border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Village / Address / गाँव या पता
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Ward No. 3, Near Primary School"
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <MoneyField
          label="Credit Limit / उधारी की सीमा"
          hindiLabel="अधिकतम उधार"
          value={creditLimitRupees}
          onChange={setCreditLimitRupees}
          quickPills={false}
        />

        {!isEdit && (
          <MoneyField
            label="Opening Due Balance / पिछला बकाया"
            hindiLabel="पहले से बाकी उधार"
            value={openingBalanceRupees}
            onChange={setOpeningBalanceRupees}
            quickPills={true}
          />
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/khata/customers"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel / रद्द करें
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Customer / सुरक्षित करें'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
