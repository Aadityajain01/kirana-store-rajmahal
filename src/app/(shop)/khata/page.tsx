import React from 'react';
import Link from 'next/link';
import { requireAuthSession } from '@/lib/auth/session';
import { getCustomers } from '@/features/khata/customers/customer.service';
import { getSuppliers } from '@/features/khata/suppliers/supplier.service';
import { formatINR } from '@/lib/money';
import { Users, Building2, ChevronRight, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default async function KhataShellPage() {
  const session = await requireAuthSession();

  const [customers, suppliers] = await Promise.all([
    getCustomers(session.shopId),
    getSuppliers(session.shopId),
  ]);

  const customerReceivables = customers.reduce((sum, c) => sum + (c.balanceMinor > 0n ? c.balanceMinor : 0n), 0n);
  const supplierPayables = suppliers.reduce((sum, s) => sum + (s.balanceMinor > 0n ? s.balanceMinor : 0n), 0n);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khata Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select customer khata or supplier khata to manage ledger entries and balances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Khata Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                {customers.length} Customers
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Customer Khata (ग्राहक खाता)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Track customer credit sales (udhar), record repayments (jama), and view running ledgers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Udhar to Receive</span>
              <div className="text-2xl font-black font-mono text-red-600 mt-0.5">
                {formatINR(customerReceivables)}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/khata/customers"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Open Customer Khata</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/khata/customers/new"
              className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              title="Add Customer"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Supplier Khata Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {suppliers.length} Suppliers
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Supplier Khata (व्यापारी खाता)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage wholesale purchases, distributor credit balances, and payout schedules.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Payable to Suppliers</span>
              <div className="text-2xl font-black font-mono text-amber-600 mt-0.5">
                {formatINR(supplierPayables)}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/khata/suppliers"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Open Supplier Khata</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/khata/suppliers/new"
              className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              title="Add Supplier"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
