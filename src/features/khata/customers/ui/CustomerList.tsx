'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CustomerWithBalance } from '@/features/khata/customers/customer.service';
import { CustomerTable } from '@/components/tables/CustomerTable';
import { FilterBar } from '@/components/filters/FilterBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Plus, Users } from 'lucide-react';
import { CreditEntryModal } from '@/features/daily-entry/ui/CreditEntryModal';
import { PaymentModal } from '@/features/daily-entry/ui/PaymentModal';

interface CustomerListProps {
  initialCustomers: CustomerWithBalance[];
}

export function CustomerList({ initialCustomers }: CustomerListProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState('ALL');

  // Modal states
  const [activeCustomer, setActiveCustomer] = useState<CustomerWithBalance | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const filteredCustomers = customers.filter((c) => {
    if (query) {
      const q = query.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchMobile = c.mobile && c.mobile.includes(q);
      if (!matchName && !matchMobile) return false;
    }

    if (preset === 'RECEIVABLE') return c.balanceMinor > 0n;
    if (preset === 'ZERO') return c.balanceMinor === 0n;
    if (preset === 'OVER_LIMIT') return c.creditLimit > 0n && c.balanceMinor > c.creditLimit;

    return true;
  });

  const handleOpenCredit = (customer: CustomerWithBalance) => {
    setActiveCustomer(customer);
    setIsCreditModalOpen(true);
  };

  const handleOpenPayment = (customer: CustomerWithBalance) => {
    setActiveCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  const refreshCustomerList = async () => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        if (data.customers) {
          setCustomers(
            data.customers.map((c: any) => ({
              ...c,
              creditLimit: BigInt(c.creditLimit || '0'),
              balanceMinor: BigInt(c.balanceMinor || '0'),
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
            <Users className="w-4 h-4 text-slate-300" />
            <h1 className="text-base sm:text-lg font-bold text-white">
              ग्राहक खाता बही (Customer Khata)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            सभी ग्राहकों का कुल उधार, जमा हिसाब, एवं दैनिक लेन-देन।
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveCustomer(null);
            setIsCreditModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ नया उधार दर्ज करें</span>
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
          { id: 'RECEIVABLE', label: 'Receivable', hindi: 'उधार लेना है' },
          { id: 'ZERO', label: 'Settled', hindi: 'चुकता' },
          { id: 'OVER_LIMIT', label: 'Over Limit', hindi: 'सीमा पार' },
        ]}
        placeholder="ग्राहक का नाम या मोबाइल नंबर से खोजें..."
      />

      {/* High-Density Responsive Table View */}
      {filteredCustomers.length > 0 ? (
        <CustomerTable
          customers={filteredCustomers}
          onQuickCredit={handleOpenCredit}
          onQuickPayment={handleOpenPayment}
        />
      ) : (
        <EmptyState
          title="कोई ग्राहक नहीं मिला"
          hindiTitle="No customer found"
          description={
            query
              ? `"${query}" नाम से कोई ग्राहक मौजूद नहीं है।`
              : 'उधार एवं जमा रिकॉर्ड रखने के लिए पहला ग्राहक जोड़ें।'
          }
          actionHref="/khata/customers/new"
          actionLabel="+ नया ग्राहक जोड़ें"
        />
      )}

      {/* Fast Modals */}
      <CreditEntryModal
        isOpen={isCreditModalOpen}
        onClose={() => {
          setIsCreditModalOpen(false);
          setActiveCustomer(null);
        }}
        onSuccess={refreshCustomerList}
        initialCustomerId={activeCustomer?.id}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setActiveCustomer(null);
        }}
        onSuccess={refreshCustomerList}
        initialCustomerId={activeCustomer?.id}
      />
    </div>
  );
}
