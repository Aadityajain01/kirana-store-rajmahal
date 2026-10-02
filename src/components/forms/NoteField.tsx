import React from 'react';

interface NoteFieldProps {
  label?: string;
  hindiLabel?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  referenceNo?: string;
  onReferenceNoChange?: (val: string) => void;
  billNo?: string;
  onBillNoChange?: (val: string) => void;
}

export function NoteField({
  label = 'Details / Note',
  hindiLabel = 'विवरण / सामान की पर्ची',
  value,
  onChange,
  placeholder = 'e.g. Atta 10kg, Sugar, Oil...',
  referenceNo,
  onReferenceNoChange,
  billNo,
  onBillNoChange,
}: NoteFieldProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          {label} <span className="text-emerald-700 font-normal">({hindiLabel})</span>
        </label>
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none resize-none"
        />
      </div>

      {(onReferenceNoChange || onBillNoChange) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {onBillNoChange && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Bill No / बिल नंबर
              </label>
              <input
                type="text"
                value={billNo || ''}
                onChange={(e) => onBillNoChange(e.target.value)}
                placeholder="e.g. BILL-102"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
              />
            </div>
          )}

          {onReferenceNoChange && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Ref / UTR No / ऑनलाइन पर्ची
              </label>
              <input
                type="text"
                value={referenceNo || ''}
                onChange={(e) => onReferenceNoChange(e.target.value)}
                placeholder="e.g. UPI-12345"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
