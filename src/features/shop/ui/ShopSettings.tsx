'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store, Save } from 'lucide-react';
import Link from 'next/link';

interface ShopSettingsProps {
  shop: any;
  userRole: string;
}

export function ShopSettings({ shop, userRole }: ShopSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(shop.name);
  const [mobile, setMobile] = useState(shop.mobile);
  const [address, setAddress] = useState(shop.address || '');
  const [currency] = useState(shop.currency || 'INR');
  const [timezone] = useState(shop.timezone || 'Asia/Kolkata');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isOwner = userRole === 'OWNER';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, address, currency, timezone }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Shop details updated successfully! / दुकान का विवरण सुरक्षित हुआ।' });
        router.refresh();
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error?.message || 'Failed to update' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shop Profile Settings</h1>
          <span className="text-xs text-emerald-700 font-semibold">दुकान की जानकारी व सेटिंग्स</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5"
      >
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Shop Name / दुकान का नाम <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={!isOwner}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl outline-none focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Owner Contact Mobile / मोबाइल नंबर <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            maxLength={10}
            disabled={!isOwner}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3.5 py-2.5 text-base font-mono border border-slate-300 rounded-xl outline-none focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Shop Address / Market Location / दुकान का पता
          </label>
          <input
            type="text"
            disabled={!isOwner}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl outline-none focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500">Currency</label>
            <input
              type="text"
              disabled
              value={currency}
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500">Timezone</label>
            <input
              type="text"
              disabled
              value={timezone}
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-600"
            />
          </div>
        </div>

        {isOwner ? (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile / सुरक्षित करें'}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-amber-700 font-medium">
            * Only the shop owner can edit store profile settings.
          </p>
        )}
      </form>
    </div>
  );
}
