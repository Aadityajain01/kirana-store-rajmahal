'use client';

import React, { useState } from 'react';
import { ArrowLeft, Shield, Smartphone, KeyRound, Check } from 'lucide-react';
import Link from 'next/link';

export function SecuritySettings() {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          <h1 className="text-2xl font-bold text-slate-900">Security & PIN Controls</h1>
          <span className="text-xs text-emerald-700 font-semibold">सुरक्षा व पिन सेटिंग्स</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Device Quick-Lock PIN (त्वरित पिन)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enable a 4-digit PIN to prevent unauthorized staff access when keeping the mobile or counter tablet unlocked.
            </p>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Security settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSavePin} className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-800 block">Require App PIN</span>
              <span className="text-xs text-slate-400">Lock app after 5 minutes of inactivity</span>
            </div>
            <input
              type="checkbox"
              checked={pinEnabled}
              onChange={(e) => setPinEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
          </div>

          {pinEnabled && (
            <div className="space-y-1.5 max-w-xs">
              <label className="block text-xs font-semibold text-slate-700">Set 4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3.5 py-2 text-center text-xl font-mono tracking-widest border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
            >
              Save Security Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
