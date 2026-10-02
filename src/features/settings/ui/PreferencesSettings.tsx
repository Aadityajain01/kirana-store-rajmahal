'use client';

import React, { useState } from 'react';
import { ArrowLeft, Globe, Check } from 'lucide-react';
import Link from 'next/link';

export function PreferencesSettings() {
  const [lang, setLang] = useState('hi-en');
  const [largeFont, setLargeFont] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
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
          <h1 className="text-2xl font-bold text-slate-900">App Preferences</h1>
          <span className="text-xs text-emerald-700 font-semibold">भाषा व स्क्रीन प्राथमिकताएँ</span>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Language & Rural Display (भाषा)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure English & Hindi bilingual labels for store operators and helpers.
            </p>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Preferences saved! / प्राथमिकताएँ सुरक्षित हुईं।</span>
          </div>
        )}

        <div className="space-y-4 pt-2 border-t border-slate-100 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Display Mode / भाषा विकल्प
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setLang('hi-en')}
                className={`p-3 rounded-xl border text-left ${
                  lang === 'hi-en'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-sm">Bilingual (द्विभाषी)</div>
                <div className="text-xs text-slate-500">English + हिन्दी (अनुशंसित)</div>
              </button>

              <button
                type="button"
                onClick={() => setLang('en')}
                className={`p-3 rounded-xl border text-left ${
                  lang === 'en'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-sm">English Only</div>
                <div className="text-xs text-slate-500">Standard English terms</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-semibold text-slate-800 block">Large Touch Buttons & Numbers</span>
              <span className="text-xs text-slate-400">
                Optimized for rural counter use on mobile and small tablets (44px+ touch targets)
              </span>
            </div>
            <input
              type="checkbox"
              checked={largeFont}
              onChange={(e) => setLargeFont(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
            >
              Save Preferences / सुरक्षित करें
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
