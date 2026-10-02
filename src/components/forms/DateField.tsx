import React from 'react';
import { Calendar } from 'lucide-react';
import { getTodayTradingDate } from '@/lib/dates';

interface DateFieldProps {
  label?: string;
  hindiLabel?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function DateField({
  label = 'Date',
  hindiLabel = 'दिनांक',
  value,
  onChange,
  error,
}: DateFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
        <span>
          {label} <span className="text-emerald-700 font-normal">({hindiLabel})</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(getTodayTradingDate())}
          className="text-xs text-emerald-700 font-semibold hover:underline"
        >
          Set Today / आज
        </button>
      </div>

      <div className="relative rounded-xl shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
          <Calendar className="w-5 h-5 text-slate-500" />
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-base text-slate-900 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
