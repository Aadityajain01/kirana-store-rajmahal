'use client';

import React, { useState } from 'react';
import { SupplierWithBalance } from '@/features/khata/suppliers/supplier.service';
import { SupplierTable } from '@/components/tables/SupplierTable';
import { FilterBar } from '@/components/filters/FilterBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Plus, Truck } from 'lucide-react';
import { SupplierPurchaseModal } from '@/features/daily-entry/ui/SupplierPurchaseModal';
import { SupplierPaymentModal } from '@/features/daily-entry/ui/SupplierPaymentModal';

interface SupplierListProps {
  initialSuppliers: SupplierWithBalance[];
}

export function SupplierList({ initialSuppliers }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState('ALL');

  const [activeSupplier, setActiveSupplier] = useState<SupplierWithBalance | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const filteredSuppliers = suppliers.filter((s) => {
    if (query) {
      const q = query.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchMobile = s.mobile && s.mobile.includes(q);
      if (!matchName && !matchMobile) return false;
    }

    if (preset === 'PAYABLE') return s.balanceMinor > 0n;
    if (preset === 'ZERO') return s.balanceMinor === 0n;

    return true;
  });

  const handleOpenPurchase = (supplier: SupplierWithBalance) => {
    setActiveSupplier(supplier);
    setIsPurchaseModalOpen(true);
  };

  const handleOpenPayment = (supplier: SupplierWithBalance) => {
    setActiveSupplier(supplier);
    setIsPaymentModalOpen(true);
  };

  const refreshSupplierList = async () => {
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        if (data.suppliers) {
          setSuppliers(
            data.suppliers.map((s: any) => ({
              ...s,
              balanceMinor: BigInt(s.balanceMinor || '0'),
            }))
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto">
      {/* Header Bar - Slate Themed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-300" />
            <h1 className="text-base sm:text-lg font-bold text-white">
              व्यापारी खाता बही (Supplier Khata)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            सप्लायरों से खरीदी गई सामग्री, देय उधार एवं किए गए भुगतान का हिसाब।
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveSupplier(null);
            setIsPurchaseModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold shadow-sm transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ नई खरीद दर्ज करें (उधार)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        preset={preset}
        onPresetChange={setPreset}
        presets={[
          { id: 'ALL', label: 'All', hindi: 'सभी' },
          { id: 'PAYABLE', label: 'Payable', hindi: 'देना बाकी है' },
          { id: 'ZERO', label: 'Settled', hindi: 'चुकता' },
        ]}
        placeholder="व्यापारी का नाम या मोबाइल नंबर से खोजें..."
      />

      {/* High-Density Responsive Table View */}
      {filteredSuppliers.length > 0 ? (
        <SupplierTable
          suppliers={filteredSuppliers}
          onQuickPurchase={handleOpenPurchase}
          onQuickPayment={handleOpenPayment}
        />
      ) : (
        <EmptyState
          title="कोई व्यापारी नहीं मिला"
          hindiTitle="No supplier found"
          description={
            query
              ? `"${query}" नाम से कोई व्यापारी मौजूद नहीं है।`
              : 'सामान खरीद एवं भुगतान रिकॉर्ड रखने के लिए पहला सप्लायर जोड़ें।'
          }
          actionHref="/khata/suppliers/new"
          actionLabel="+ नया व्यापारी जोड़ें"
        />
      )}

      {/* Fast Modals */}
      <SupplierPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setActiveSupplier(null);
        }}
        onSuccess={refreshSupplierList}
        initialSupplierId={activeSupplier?.id}
      />

      <SupplierPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setActiveSupplier(null);
        }}
        onSuccess={refreshSupplierList}
        initialSupplierId={activeSupplier?.id}
      />
    </div>
  );
}
