'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, ArrowRight, AlertCircle, Wallet } from 'lucide-react';
import { searchCache, CachedCustomer } from '@/lib/cache/searchCache';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialCustomerId?: string;
}

const PAYMENT_MODES = [
  { value: 'CASH', label: 'नकद (Cash)' },
  { value: 'UPI', label: 'UPI / PhonePe / GPay' },
  { value: 'BANK', label: 'बैंक ट्रांसफर (Bank)' },
  { value: 'OTHER', label: 'अन्य (Other)' },
];

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  initialCustomerId,
}: PaymentModalProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CachedCustomer | null>(null);
  const [customerSuggestions, setCustomerSuggestions] = useState<CachedCustomer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [amountRupees, setAmountRupees] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      searchCache.getCustomers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialCustomerId) {
      const match = searchCache.searchCustomers('').find((c) => c.id === initialCustomerId);
      if (match) {
        setSelectedCustomer(match);
        setCustomerSearch(match.name);
      }
    }
  }, [initialCustomerId]);

  const handleCustomerChange = (text: string) => {
    setCustomerSearch(text);
    if (!text.trim()) {
      setSelectedCustomer(null);
      setCustomerSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const matches = searchCache.searchCustomers(text);
    setCustomerSuggestions(matches);
    setShowDropdown(true);

    const exact = matches.find((c) => c.name.toLowerCase() === text.trim().toLowerCase());
    if (exact) {
      setSelectedCustomer(exact);
    } else {
      setSelectedCustomer(null);
    }
  };

  const handleSelectCustomer = (customer: CachedCustomer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowDropdown(false);

    // If customer has a positive balance, suggest it
    if (customer.currentBalancePaise && Number(customer.currentBalancePaise) > 0) {
      setAmountRupees(Number(customer.currentBalancePaise) / 100);
    }
  };

  const handleFillFullDue = () => {
    if (selectedCustomer?.currentBalancePaise) {
      setAmountRupees(Math.max(0, Number(selectedCustomer.currentBalancePaise) / 100));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('कृपया सूची में से ग्राहक चुनें (Select customer from list)');
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
      const res = await fetch('/api/transactions/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          amountRupees: amt,
          paymentMode,
          note,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local cache balance
        searchCache.addOrUpdateCustomer({
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          currentBalancePaise: data.balanceMinor,
        });

        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(data.error?.message || 'जमा दर्ज करने में त्रुटि हुई');
      }
    } catch {
      setError('सर्वर से संपर्क नहीं हो पाया (Connection failed)');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentDueRupees = selectedCustomer?.currentBalancePaise
    ? Number(selectedCustomer.currentBalancePaise) / 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col text-slate-800">
        {/* Header - Dark slate with Green accent for payment received */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="font-bold text-sm sm:text-base">
              जमा लें / Receive Payment
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              ग्राहक का नाम (Customer Name) *
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={customerSearch}
                onChange={(e) => handleCustomerChange(e.target.value)}
                onFocus={() => {
                  if (customerSearch.trim()) {
                    setCustomerSuggestions(searchCache.searchCustomers(customerSearch));
                    setShowDropdown(true);
                  }
                }}
                placeholder="ग्राहक का नाम खोजें..."
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
              />
            </div>

            {showDropdown && customerSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-lg bg-white border border-slate-200 shadow-xl max-h-48 overflow-y-auto text-xs">
                {customerSuggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCustomer(c)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-slate-100 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{c.name}</span>
                      {c.mobile && <span className="text-[10px] text-slate-500 ml-1.5">{c.mobile}</span>}
                    </div>
                    {c.currentBalancePaise !== undefined && (
                      <span className="text-[10px] font-bold text-rose-600">
                        ₹{(Number(c.currentBalancePaise) / 100).toFixed(0)} बाकी
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Balance Indicator */}
          {selectedCustomer && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">वर्तमान उधारी (Current Due):</span>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-rose-600 text-sm">
                  ₹{currentDueRupees.toLocaleString('en-IN')}
                </span>
                {currentDueRupees > 0 && (
                  <button
                    type="button"
                    onClick={handleFillFullDue}
                    className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded hover:bg-emerald-100 font-bold"
                  >
                    पूरा भरें
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              जमा राशि (Amount Received ₹) *
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
                className="w-full pl-8 pr-3 py-2 text-base font-bold font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Payment Mode */}
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

          {/* Note */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              विवरण / नोट (Optional Note)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="उदा. गूगल पे / नकद रसीद..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Action Buttons */}
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
              className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>{loading ? 'सहेज रहे हैं...' : 'जमा दर्ज करें (Save Payment)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
