import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getCustomers } from '@/features/khata/customers/customer.service';
import { getSuppliers } from '@/features/khata/suppliers/supplier.service';
import { getCategories } from '@/features/expenses/expense.service';
import { TransactionComposer } from '@/features/transactions/ui/TransactionComposer';

export default async function NewTransactionPage() {
  const session = await requireAuthSession();

  const [customers, suppliers, categories] = await Promise.all([
    getCustomers(session.shopId),
    getSuppliers(session.shopId),
    getCategories(session.shopId),
  ]);

  return (
    <TransactionComposer
      customers={customers.map((c) => ({
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        balanceMinor: c.balanceMinor,
      }))}
      suppliers={suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        mobile: s.mobile,
        balanceMinor: s.balanceMinor,
      }))}
      expenseCategories={categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
      }))}
    />
  );
}
