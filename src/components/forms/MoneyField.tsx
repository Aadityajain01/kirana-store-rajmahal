import React from 'react';
import { IndianRupee } from 'lucide-react';

interface MoneyFieldProps {
  label: string;
  hindiLabel?: string;
  value: number | string;
  onChange: (val: number) => void;
  error?: string;
  required?: boolean;
  quickPills?: boolean;
}

export function MoneyField({
  label,
  hindiLabel,
  value,
  onChange,
  error,
  required,
  quickPills = true,
}: MoneyFieldProps) {
  const numVal = typeof value === 'string' ? parseFloat(value) || 0 : value;

  const handleAdd = (extra: number) => {
    onChange(Math.max(0, numVal + extra));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
        <span>
          {label} {hindiLabel && <span className="text-emerald-700 font-normal">({hindiLabel})</span>}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      </div>

      <div className="relative rounded-xl shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
          <IndianRupee className="w-5 h-5 text-slate-600" />
        </div>
        <input
          type="number"
          step="any"
          min="0"
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="block w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
        />
      </div>

      {quickPills && (
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
          {[100, 200, 500, 1000, 2000].map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => handleAdd(pill)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition-colors shrink-0"
            >
              +{pill}
            </button>
          ))}
          {numVal > 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="px-2 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
