'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, ArrowRight, AlertCircle, Truck } from 'lucide-react';
import { searchCache, CachedSupplier } from '@/lib/cache/searchCache';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface SupplierPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialSupplierId?: string;
}

const PAYMENT_MODES = [
  { value: 'CASH', label: 'नकद (Cash)' },
  { value: 'UPI', label: 'UPI / PhonePe / GPay' },
  { value: 'BANK', label: 'बैंक ट्रांसफर (Bank NEFT/RTGS)' },
  { value: 'OTHER', label: 'अन्य (Cheque/Other)' },
];

export function SupplierPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  initialSupplierId,
}: SupplierPaymentModalProps) {
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<CachedSupplier | null>(null);
  const [supplierSuggestions, setSupplierSuggestions] = useState<CachedSupplier[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [amountRupees, setAmountRupees] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      searchCache.getSuppliers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialSupplierId) {
      const match = searchCache.searchSuppliers('').find((s) => s.id === initialSupplierId);
      if (match) {
        setSelectedSupplier(match);
        setSupplierSearch(match.name);
      }
    }
  }, [initialSupplierId]);

  const handleSupplierChange = (text: string) => {
    setSupplierSearch(text);
    if (!text.trim()) {
      setSelectedSupplier(null);
      setSupplierSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const matches = searchCache.searchSuppliers(text);
    setSupplierSuggestions(matches);
    setShowDropdown(true);

    const exact = matches.find((s) => s.name.toLowerCase() === text.trim().toLowerCase());
    if (exact) {
      setSelectedSupplier(exact);
    } else {
      setSelectedSupplier(null);
    }
  };

  const handleSelectSupplier = (supplier: CachedSupplier) => {
    setSelectedSupplier(supplier);
    setSupplierSearch(supplier.name);
    setShowDropdown(false);

    if (supplier.currentBalancePaise && Number(supplier.currentBalancePaise) > 0) {
      setAmountRupees(Number(supplier.currentBalancePaise) / 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      setError('कृपया सूची में से व्यापारी चुनें (Select supplier from list)');
      return;
    }

    const amt = Number(amountRupees);
    if (!amt || amt <= 0) {
      setError('कृपया वैध राशि भरें (Enter valid amount)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/suppliers/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          amountRupees: amt,
          paymentMode,
          note,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        searchCache.addOrUpdateSupplier({
          id: selectedSupplier.id,
          name: selectedSupplier.name,
          currentBalancePaise: data.balanceMinor,
        });

        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(data.error?.message || 'भुगतान दर्ज करने में त्रुटि हुई');
      }
    } catch {
      setError('सर्वर से संपर्क नहीं हो पाया (Connection failed)');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentOwedRupees = selectedSupplier?.currentBalancePaise
    ? Number(selectedSupplier.currentBalancePaise) / 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col text-slate-800">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <h2 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-300" />
              व्यापारी को भुगतान / Pay Supplier
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              व्यापारी का नाम (Supplier Name) *
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={supplierSearch}
                onChange={(e) => handleSupplierChange(e.target.value)}
                onFocus={() => {
                  if (supplierSearch.trim()) {
                    setSupplierSuggestions(searchCache.searchSuppliers(supplierSearch));
                    setShowDropdown(true);
                  }
                }}
                placeholder="व्यापारी खोजें..."
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
              />
            </div>

            {showDropdown && supplierSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-lg bg-white border border-slate-200 shadow-xl max-h-48 overflow-y-auto text-xs">
                {supplierSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSupplier(s)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-slate-100 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{s.name}</span>
                      {s.mobile && <span className="text-[10px] text-slate-500 ml-1.5">{s.mobile}</span>}
                    </div>
                    {s.currentBalancePaise !== undefined && (
                      <span className="text-[10px] font-bold text-amber-700">
                        ₹{(Number(s.currentBalancePaise) / 100).toFixed(0)} बकाया
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSupplier && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">व्यापारी को देय (You Owe):</span>
              <span className="font-bold font-mono text-amber-700 text-sm">
                ₹{currentOwedRupees.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              भुगतान राशि (Amount Paid ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-base font-bold font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              भुगतान का माध्यम (Payment Mode)
            </label>
            <CustomDropdown
              options={PAYMENT_MODES}
              value={paymentMode}
              onChange={setPaymentMode}
              size="sm"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              विवरण / नोट (Optional Note)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="उदा. चेक नंबर / बैंक रसीद..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading || !amountRupees || Number(amountRupees) <= 0}
              className="flex-1 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>{loading ? 'सहेज रहे हैं...' : 'भुगतान दर्ज करें (Save Payment)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
