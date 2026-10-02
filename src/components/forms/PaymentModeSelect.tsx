import React from 'react';
import { Banknote, QrCode, Building, CreditCard, MoreHorizontal } from 'lucide-react';

interface PaymentModeSelectProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  label?: string;
  hindiLabel?: string;
}

export function PaymentModeSelect({
  value,
  onChange,
  error,
  label = 'Payment Mode',
  hindiLabel = 'भुगतान का माध्यम',
}: PaymentModeSelectProps) {
  const modes = [
    { id: 'CASH', label: 'Cash', hindi: 'नकद', icon: Banknote },
    { id: 'UPI', label: 'UPI / QR', hindi: 'ऑनलाइन', icon: QrCode },
    { id: 'BANK', label: 'Bank', hindi: 'खाता', icon: Building },
    { id: 'CARD', label: 'Card', hindi: 'कार्ड', icon: CreditCard },
    { id: 'OTHER', label: 'Other', hindi: 'अन्य', icon: MoreHorizontal },
  ];

  return (
    <div className="space-y-1.5">
      <div className="text-sm font-semibold text-slate-700">
        {label} <span className="text-emerald-700 font-normal">({hindiLabel})</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {modes.map((m) => {
          const isSelected = value === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600/20 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs">{m.label}</span>
              <span className="text-[10px] text-slate-400">{m.hindi}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
