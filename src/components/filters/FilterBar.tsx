'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  preset?: string;
  onPresetChange?: (p: string) => void;
  presets?: { id: string; label: string; hindi: string }[];
  placeholder?: string;
  children?: React.ReactNode; // Optional extra filters like date or dropdowns
  onReset?: () => void;
}

export function FilterBar({
  query,
  onQueryChange,
  preset,
  onPresetChange,
  presets = [
    { id: 'ALL', label: 'All', hindi: 'सभी' },
    { id: 'TODAY', label: 'Today', hindi: 'आज' },
    { id: 'THIS_MONTH', label: 'This Month', hindi: 'इस माह' },
    { id: 'RECEIVABLE', label: 'Receivable', hindi: 'उधार लेना' },
    { id: 'PAYABLE', label: 'Payable', hindi: 'देना बाकी' },
    { id: 'UPI_TODAY', label: 'UPI Today', hindi: 'ऑनलाइन' },
    { id: 'LARGE_ENTRIES', label: 'Large (₹5k+)', hindi: 'बड़ी राशि' },
  ],
  placeholder = 'Search by name, mobile, bill no...',
  children,
  onReset,
}: FilterBarProps) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-subtle space-y-3 mb-6">
      {/* Search Input and action */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {onReset && (
          <button
            onClick={onReset}
            type="button"
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Reset Filters / साफ़ करें</span>
          </button>
        )}
      </div>

      {/* Preset Pills */}
      {presets && onPresetChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {presets.map((p) => {
            const isSelected = (preset || 'ALL') === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPresetChange(p.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label} <span className="text-[10px] opacity-80">({p.hindi})</span>
              </button>
            );
          })}
        </div>
      )}

      {children && <div className="pt-2 border-t border-slate-100">{children}</div>}
    </div>
  );
}
