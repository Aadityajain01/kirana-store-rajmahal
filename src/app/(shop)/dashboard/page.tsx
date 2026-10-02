'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Truck,
  Users,
  Building2,
  Clock,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from 'lucide-react';
import { CreditEntryModal } from '@/features/daily-entry/ui/CreditEntryModal';
import { PaymentModal } from '@/features/daily-entry/ui/PaymentModal';
import { SupplierPurchaseModal } from '@/features/daily-entry/ui/SupplierPurchaseModal';
import { SupplierPaymentModal } from '@/features/daily-entry/ui/SupplierPaymentModal';
import { searchCache } from '@/lib/cache/searchCache';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Modals state
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSupplierPurchaseModalOpen, setIsSupplierPurchaseModalOpen] = useState(false);
  const [isSupplierPaymentModalOpen, setIsSupplierPaymentModalOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch (e) {
      console.error('Error fetching dashboard summary:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    // Warm up the caches
    searchCache.getCustomers();
    searchCache.getProducts();
    searchCache.getSuppliers();
  }, [fetchSummary]);

  const handleModalSuccess = () => {
    fetchSummary();
  };

  const formatRupees = (paiseStr?: string | number) => {
    if (!paiseStr) return '0';
    const num = Number(paiseStr) / 100;
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const recentTransactions = summary?.recentTransactions || [];
  const filteredTxs = recentTransactions.filter((tx: any) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const partyMatch = tx.partyName && tx.partyName.toLowerCase().includes(q);
    const noteMatch = tx.note && tx.note.toLowerCase().includes(q);
    const typeMatch = tx.type && tx.type.toLowerCase().includes(q);
    return partyMatch || noteMatch || typeMatch;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Header Action Banner - Slate Neutral Theme */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                दैनिक खाता बही (Daily Ledger)
              </span>
              <span className="text-[11px] text-slate-400">
                • {summary?.tradingDate || 'आज'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
              त्वरित दैनिक प्रविष्टि (Quick Daily Entry)
            </h1>
          </div>

          <button
            type="button"
            onClick={fetchSummary}
            className="self-start sm:self-auto p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>रिफ्रेश</span>
          </button>
        </div>

        {/* 4 Primary 1-Tap Entry Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
          {/* 1. Give Credit - RED */}
          <button
            type="button"
            onClick={() => setIsCreditModalOpen(true)}
            className="flex items-center justify-center gap-2 p-2.5 sm:py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span>उधार दें (Give Credit)</span>
          </button>

          {/* 2. Receive Payment - GREEN */}
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center justify-center gap-2 p-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <ArrowDownLeft className="w-4 h-4 shrink-0" />
            <span>जमा लें (Receive Cash)</span>
          </button>

          {/* 3. Supplier Purchase - SLATE/AMBER */}
          <button
            type="button"
            onClick={() => setIsSupplierPurchaseModalOpen(true)}
            className="flex items-center justify-center gap-2 p-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all active:scale-[0.98]"
          >
            <Truck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>माल खरीद (Purchase)</span>
          </button>

          {/* 4. Pay Supplier - SLATE/NEUTRAL */}
          <button
            type="button"
            onClick={() => setIsSupplierPaymentModalOpen(true)}
            className="flex items-center justify-center gap-2 p-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all active:scale-[0.98]"
          >
            <CreditCard className="w-4 h-4 text-slate-300 shrink-0" />
            <span>व्यापारी भुगतान (Pay)</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Strip (Compact Information Density) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Total Customer Udhar (Red) */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              कुल ग्राहक उधारी (Total Udhar)
            </span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-600">
              ₹{formatRupees(summary?.customerReceivablePaise)}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {summary?.customerCount || 0} ग्राहकों से बाकी
            </p>
          </div>
        </div>

        {/* Today Customer Payment Received (Green) */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              आज का जमा (Today Received)
            </span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
              ₹{formatRupees(summary?.todayReceivedPaise)}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              आज ग्राहकों से प्राप्त नकदी
            </p>
          </div>
        </div>

        {/* Supplier Payable Owed (Slate / Amber) */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              व्यापारी को देय (We Owe Suppliers)
            </span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
              ₹{formatRupees(summary?.supplierPayablePaise)}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {summary?.supplierCount || 0} व्यापारियों को चुकाना है
            </p>
          </div>
        </div>
      </div>

      {/* 3. Recent Transactions Table View (Dense, Mobile-First Table View) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-3 sm:px-4 sm:py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-xs sm:text-sm text-slate-900">
              हाल के लेन-देन (Recent Entries)
            </h2>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
              {filteredTxs.length}
            </span>
          </div>

          {/* Table Search Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="नाम या सामान से खोजें..."
              className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-slate-800"
            />
          </div>
        </div>

        {/* Dense Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2 px-3 w-24">दिनांक/समय</th>
                <th className="py-2 px-3">ग्राहक / व्यापारी</th>
                <th className="py-2 px-3">विवरण / सामान</th>
                <th className="py-2 px-3 w-28 text-center">प्रकार</th>
                <th className="py-2 px-3 w-28 text-right">रकम (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    लोड हो रहा है...
                  </td>
                </tr>
              ) : filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    कोई लेन-देन नहीं मिला (No transactions found).
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx: any) => {
                  const isDebit = tx.type === 'SALE_CREDIT' || tx.type === 'SUPPLIER_PURCHASE_CREDIT' || tx.type === 'PURCHASE_CREDIT';
                  const isCustomerCredit = tx.type === 'SALE_CREDIT';
                  const isCustomerPayment = tx.type === 'CUSTOMER_PAYMENT';
                  const isSupplierPurchase = tx.type === 'PURCHASE_CREDIT';
                  const isSupplierPayment = tx.type === 'SUPPLIER_PAYMENT';

                  const isExpanded = expandedTxId === tx.id;
                  const hasItems = tx.items && tx.items.length > 0;

                  return (
                    <React.Fragment key={tx.id}>
                      <tr
                        onClick={() => hasItems && setExpandedTxId(isExpanded ? null : tx.id)}
                        className={`hover:bg-slate-50 transition-colors ${
                          hasItems ? 'cursor-pointer' : ''
                        }`}
                      >
                        {/* Date/Time */}
                        <td className="py-2 px-3 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                          <div>{formatDate(tx.transactionDate)}</div>
                          <div className="text-[10px] text-slate-400">{formatTime(tx.transactionDate)}</div>
                        </td>

                        {/* Party */}
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[140px] sm:max-w-xs">
                              {tx.partyName !== '-' ? tx.partyName : tx.type}
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                                tx.partyType === 'CUSTOMER'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {tx.partyType === 'CUSTOMER' ? 'ग्राहक' : 'व्यापारी'}
                            </span>
                          </div>
                        </td>

                        {/* Items / Summary */}
                        <td className="py-2 px-3 text-slate-600 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[180px] sm:max-w-sm">
                              {tx.note || (hasItems ? `${tx.items.length} सामान` : '-')}
                            </span>
                            {hasItems && (
                              <span className="text-slate-400">
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {isCustomerCredit && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              उधार दिया
                            </span>
                          )}
                          {isCustomerPayment && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              जमा लिया
                            </span>
                          )}
                          {isSupplierPurchase && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              माल खरीद (देना)
                            </span>
                          )}
                          {isSupplierPayment && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              भुगतान दिया
                            </span>
                          )}
                          {!isCustomerCredit && !isCustomerPayment && !isSupplierPurchase && !isSupplierPayment && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                              {tx.type}
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-2 px-3 text-right whitespace-nowrap font-mono font-bold text-xs sm:text-sm">
                          {isCustomerCredit && (
                            <span className="text-rose-600 font-black">+₹{formatRupees(tx.amount)}</span>
                          )}
                          {isCustomerPayment && (
                            <span className="text-emerald-600 font-black">-₹{formatRupees(tx.amount)}</span>
                          )}
                          {isSupplierPurchase && (
                            <span className="text-amber-700 font-bold">₹{formatRupees(tx.amount)}</span>
                          )}
                          {isSupplierPayment && (
                            <span className="text-slate-800 font-bold">₹{formatRupees(tx.amount)}</span>
                          )}
                          {!isCustomerCredit && !isCustomerPayment && !isSupplierPurchase && !isSupplierPayment && (
                            <span className="text-slate-800">₹{formatRupees(tx.amount)}</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Line Items Row */}
                      {isExpanded && hasItems && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={5} className="py-2 px-6">
                            <div className="p-2 rounded bg-white border border-slate-200 text-[11px] space-y-1">
                              <span className="font-bold text-slate-700 block">
                                सामान का विवरण (Line Items):
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {tx.items.map((it: any) => (
                                  <div key={it.id} className="flex justify-between border-b border-slate-100 pb-0.5">
                                    <span className="font-medium text-slate-800 truncate mr-2">
                                      {it.productName} ({it.quantity} {it.unit})
                                    </span>
                                    <span className="font-mono text-slate-600">
                                      ₹{(Number(it.totalPricePaise) / 100).toFixed(0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal Overlays */}
      <CreditEntryModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <SupplierPurchaseModal
        isOpen={isSupplierPurchaseModalOpen}
        onClose={() => setIsSupplierPurchaseModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <SupplierPaymentModal
        isOpen={isSupplierPaymentModalOpen}
        onClose={() => setIsSupplierPaymentModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
