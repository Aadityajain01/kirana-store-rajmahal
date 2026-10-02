'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  UserPlus,
  Truck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { searchCache, CachedSupplier, CachedProduct } from '@/lib/cache/searchCache';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface LineItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number | '';
  unit: string;
  pricePerUnitRupees: number | '';
  totalRupees: number;
}

interface SupplierPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialSupplierId?: string;
}

const UNIT_OPTIONS = [
  { value: 'KG', label: 'KG (किलो)' },
  { value: 'PCS', label: 'PCS (पीस)' },
  { value: 'LTR', label: 'LTR (लीटर)' },
  { value: 'PKT', label: 'PKT (पैकेट)' },
  { value: 'DOZEN', label: 'DOZEN (दर्जन)' },
  { value: 'MANUAL', label: 'MANUAL (अन्य)' },
];

export function SupplierPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  initialSupplierId,
}: SupplierPurchaseModalProps) {
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<CachedSupplier | null>(null);
  const [supplierSuggestions, setSupplierSuggestions] = useState<CachedSupplier[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [isNewSupplierMode, setIsNewSupplierMode] = useState(false);
  const [newSupplierMobile, setNewSupplierMobile] = useState('');

  const [items, setItems] = useState<LineItem[]>([
    {
      id: 'sup_item_1',
      productName: '',
      quantity: 1,
      unit: 'KG',
      pricePerUnitRupees: '',
      totalRupees: 0,
    },
  ]);

  const [productSuggestions, setProductSuggestions] = useState<{ [rowId: string]: CachedProduct[] }>({});
  const [activeProductRow, setActiveProductRow] = useState<string | null>(null);

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      searchCache.getSuppliers();
      searchCache.getProducts();
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

  const handleSupplierInputChange = (text: string) => {
    setSupplierSearch(text);
    setIsNewSupplierMode(false);
    if (!text.trim()) {
      setSelectedSupplier(null);
      setSupplierSuggestions([]);
      setShowSupplierDropdown(false);
      return;
    }

    const matches = searchCache.searchSuppliers(text);
    setSupplierSuggestions(matches);
    setShowSupplierDropdown(true);

    const exactMatch = matches.find((s) => s.name.toLowerCase() === text.trim().toLowerCase());
    if (exactMatch) {
      setSelectedSupplier(exactMatch);
    } else {
      setSelectedSupplier(null);
    }
  };

  const handleSelectSupplier = (supplier: CachedSupplier) => {
    setSelectedSupplier(supplier);
    setSupplierSearch(supplier.name);
    setShowSupplierDropdown(false);
    setIsNewSupplierMode(false);
  };

  const handleItemProductChange = (rowId: string, text: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, productName: text } : item))
    );

    if (!text.trim()) {
      setProductSuggestions((prev) => ({ ...prev, [rowId]: [] }));
      setActiveProductRow(null);
      return;
    }

    const matches = searchCache.searchProducts(text);
    setProductSuggestions((prev) => ({ ...prev, [rowId]: matches }));
    setActiveProductRow(rowId);
  };

  const handleSelectProduct = (rowId: string, product: CachedProduct) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === rowId) {
          const qty = Number(item.quantity) || 1;
          const price = Number(item.pricePerUnitRupees) || 0;
          return {
            ...item,
            productId: product.id,
            productName: product.name,
            unit: product.unitType || 'KG',
            totalRupees: Math.round(qty * price),
          };
        }
        return item;
      })
    );
    setActiveProductRow(null);
  };

  const handleItemNumericChange = (
    rowId: string,
    field: 'quantity' | 'pricePerUnitRupees',
    value: string
  ) => {
    const num = value === '' ? '' : parseFloat(value);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === rowId) {
          const updated = { ...item, [field]: num };
          const qty = Number(updated.quantity) || 0;
          const price = Number(updated.pricePerUnitRupees) || 0;
          updated.totalRupees = Math.round(qty * price * 100) / 100;
          return updated;
        }
        return item;
      })
    );
  };

  const handleItemUnitChange = (rowId: string, unit: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, unit } : item))
    );
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `sup_item_${Date.now()}`,
        productName: '',
        quantity: 1,
        unit: 'KG',
        pricePerUnitRupees: '',
        totalRupees: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (rowId: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== rowId));
  };

  const grandTotalRupees = items.reduce((sum, item) => sum + (Number(item.totalRupees) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierSearch.trim()) {
      setError('कृपया व्यापारी का नाम दर्ज करें (Enter supplier name)');
      return;
    }

    const validItems = items.filter(
      (item) => item.productName.trim() && (Number(item.totalRupees) > 0 || Number(item.pricePerUnitRupees) > 0)
    );

    if (validItems.length === 0) {
      setError('कम से कम एक सामान का नाम व खरीद दर भरें (Add at least 1 item with purchase price)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/suppliers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier?.id,
          supplierName: supplierSearch.trim(),
          supplierMobile: newSupplierMobile.trim() || undefined,
          items: validItems.map((item) => ({
            productId: item.productId,
            productName: item.productName.trim(),
            quantity: Number(item.quantity) || 1,
            unit: item.unit,
            pricePerUnitRupees: Number(item.pricePerUnitRupees) || 0,
          })),
          note,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.supplier) {
          searchCache.addOrUpdateSupplier({
            id: data.supplier.id,
            name: data.supplier.name,
            currentBalancePaise: data.balanceMinor,
          });
        }
        for (const it of validItems) {
          searchCache.addOrUpdateProduct({
            id: it.productId || `prod_${Date.now()}`,
            name: it.productName.trim(),
            unitType: it.unit,
          });
        }

        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(data.error?.message || 'खरीद दर्ज करने में त्रुटि हुई');
      }
    } catch {
      setError('सर्वर से संपर्क नहीं हो पाया (Connection failed)');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col text-slate-800">
        {/* Header - Slate with Amber accent for Supplier Purchase */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" />
              माल खरीद (उधार) / Purchase from Supplier
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
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 overflow-y-auto space-y-3.5 flex-1">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Supplier Autocomplete */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              व्यापारी / सप्लायर का नाम (Supplier Name) *
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={supplierSearch}
                onChange={(e) => handleSupplierInputChange(e.target.value)}
                onFocus={() => {
                  if (supplierSearch.trim()) {
                    setSupplierSuggestions(searchCache.searchSuppliers(supplierSearch));
                    setShowSupplierDropdown(true);
                  }
                }}
                placeholder="व्यापारी का नाम खोजें या नया दर्ज करें..."
                className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
              />
            </div>

            {/* Instant Suggestions Dropdown */}
            {showSupplierDropdown && (
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
                        ₹{(Number(s.currentBalancePaise) / 100).toFixed(0)} देना बाकी
                      </span>
                    )}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setIsNewSupplierMode(true);
                    setShowSupplierDropdown(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs border-t border-slate-200"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                  <span>+ नया व्यापारी बनाएं: &quot;{supplierSearch}&quot;</span>
                </button>
              </div>
            )}

            {isNewSupplierMode && (
              <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[11px] font-medium text-slate-600">
                  नया व्यापारी। मोबाइल नंबर (वैकल्पिक):
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={newSupplierMobile}
                  onChange={(e) => setNewSupplierMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 अंकों का मोबाइल..."
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
            )}
          </div>

          {/* 2. Items Table View */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                खरीदे गए सामान की सूची (Purchased Items)
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-[11px] font-bold text-slate-800 hover:text-black flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-slate-700" />
                <span>सामान जोड़ें</span>
              </button>
            </div>

            {/* Line Items Table with Non-Clipping Selection Pane & Sticky Header */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white shadow-subtle min-h-[160px]">
              <table className="w-full text-left text-xs min-w-[340px]">
                <thead className="sticky top-0 bg-slate-100 z-10 shadow-[0_1px_0_rgba(226,232,240,1)]">
                  <tr className="text-slate-700 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 px-2">सामान (Item)</th>
                    <th className="py-2 px-1 w-16 text-center">मात्रा</th>
                    <th className="py-2 px-1 w-24 text-center">इकाई</th>
                    <th className="py-2 px-1 w-16 text-right">खरीद दर (₹)</th>
                    <th className="py-2 px-2 w-16 text-right">कुल (₹)</th>
                    <th className="py-2 px-1 w-7 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="relative hover:bg-slate-50/50">
                      <td className="py-1 px-1.5 relative">
                        <input
                          type="text"
                          required
                          value={item.productName}
                          onChange={(e) => handleItemProductChange(item.id, e.target.value)}
                          onFocus={() => {
                            if (item.productName.trim()) {
                              setProductSuggestions((prev) => ({
                                ...prev,
                                [item.id]: searchCache.searchProducts(item.productName),
                              }));
                              setActiveProductRow(item.id);
                            }
                          }}
                          placeholder="उदा. तेल पीपा / साबुन..."
                          className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded focus:border-slate-800 focus:outline-none"
                        />

                        {activeProductRow === item.id && productSuggestions[item.id]?.length > 0 && (
                          <div className="absolute left-1 top-full mt-0.5 z-30 w-44 rounded-md bg-white border border-slate-200 shadow-xl max-h-36 overflow-y-auto text-xs py-1">
                            {productSuggestions[item.id].map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectProduct(item.id, p)}
                                className="flex items-center justify-between w-full px-2 py-1 text-left hover:bg-slate-100 text-xs"
                              >
                                <span className="font-medium text-slate-800 truncate">{p.name}</span>
                                <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded">{p.unitType}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-1 px-1">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemNumericChange(item.id, 'quantity', e.target.value)}
                          className="w-full px-1 py-1 text-xs text-center border border-slate-200 rounded focus:border-slate-800 focus:outline-none font-mono"
                        />
                      </td>

                      {/* Unit Type Custom Dropdown - Native non-clipping selection pane */}
                      <td className="py-1 px-1">
                        <CustomDropdown
                          options={UNIT_OPTIONS}
                          value={item.unit}
                          onChange={(val) => handleItemUnitChange(item.id, val)}
                          size="xs"
                          useNative={true}
                        />
                      </td>

                      <td className="py-1 px-1">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={item.pricePerUnitRupees}
                          onChange={(e) => handleItemNumericChange(item.id, 'pricePerUnitRupees', e.target.value)}
                          placeholder="0"
                          className="w-full px-1 py-1 text-xs text-right border border-slate-200 rounded focus:border-slate-800 focus:outline-none font-mono"
                        />
                      </td>

                      <td className="py-1 px-2 text-right font-bold font-mono text-slate-900 text-xs">
                        ₹{item.totalRupees || 0}
                      </td>

                      <td className="py-1 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(item.id)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Grand Total & Note */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="सप्लायर इनवॉइस नंबर / विवरण..."
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white placeholder-slate-400"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">व्यापारी को देय (Total Owed):</span>
              <span className="text-lg font-bold font-mono text-amber-700">
                ₹{grandTotalRupees.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading || grandTotalRupees <= 0}
              className="flex-1 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>{loading ? 'सहेज रहे हैं...' : 'खरीद दर्ज करें (Save Purchase)'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
