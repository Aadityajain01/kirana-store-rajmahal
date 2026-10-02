import React from 'react';
import { formatINR } from '@/lib/money';

interface PartyOption {
  id: string;
  name: string;
  mobile?: string | null;
  balanceMinor?: bigint;
}

interface PartySelectProps {
  label: string;
  hindiLabel?: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  parties: PartyOption[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  required?: boolean;
}

export function PartySelect({
  label,
  hindiLabel,
  partyType,
  parties,
  value,
  onChange,
  error,
  required,
}: PartySelectProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
        <span>
          {label} {hindiLabel && <span className="text-emerald-700 font-normal">({hindiLabel})</span>}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
      >
        <option value="">
          -- Select {partyType === 'CUSTOMER' ? 'Customer / ग्राहक चुनें' : 'Supplier / व्यापारी चुनें'} --
        </option>
        {parties.map((p) => {
          const balanceStr =
            p.balanceMinor !== undefined
              ? ` [Bal: ${formatINR(p.balanceMinor)}]`
              : '';
          const mobileStr = p.mobile ? ` (${p.mobile})` : '';
          return (
            <option key={p.id} value={p.id}>
              {p.name}
              {mobileStr}
              {balanceStr}
            </option>
          );
        })}
      </select>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
