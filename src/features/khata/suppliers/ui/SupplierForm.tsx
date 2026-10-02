'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoneyField } from '@/components/forms/MoneyField';
import { enqueueOfflineCommand } from '@/features/sync/offline-db';
import { useSyncStatus } from '@/features/sync/sync-client';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

interface SupplierFormProps {
  initialData?: {
    id?: string;
    name?: string;
    mobile?: string | null;
    address?: string | null;
  };
  isEdit?: boolean;
}

export function SupplierForm({ initialData, isEdit = false }: SupplierFormProps) {
  const router = useRouter();
  const { syncNow } = useSyncStatus();

  const [name, setName] = useState(initialData?.name || '');
  const [mobile, setMobile] = useState(initialData?.mobile || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [openingBalanceRupees, setOpeningBalanceRupees] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Supplier name is required / व्यापारी का नाम आवश्यक है');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        mobile: mobile.trim() || undefined,
        address: address.trim() || undefined,
        openingBalanceRupees,
      };

      if (!isEdit) {
        await enqueueOfflineCommand('CREATE_SUPPLIER', payload);
        syncNow();
      }

      router.push('/khata/suppliers');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/khata/suppliers"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
          </h1>
          <span className="text-xs text-amber-700 font-semibold">
            {isEdit ? 'सप्लायर विवरण बदलें' : 'नया व्यापारी/मंडी सप्लायर जोड़ें'}
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
            Supplier / Firm Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kisan Agro Traders, Gwalior Mandi"
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Mobile Number / फ़ोन नंबर (10 अंक)
          </label>
          <input
            type="tel"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 9876543210"
            className="w-full px-3.5 py-2.5 text-base font-mono border border-slate-300 rounded-xl outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Mandi / Location / मंडी या शहर
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Krishi Mandi, Gwalior"
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
          />
        </div>

        {!isEdit && (
          <MoneyField
            label="Opening Payable Balance / पिछला बकाया"
            hindiLabel="दुकान पर पहले से बाकी"
            value={openingBalanceRupees}
            onChange={setOpeningBalanceRupees}
            quickPills={true}
          />
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/khata/suppliers"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel / रद्द करें
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Supplier / सुरक्षित करें'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
