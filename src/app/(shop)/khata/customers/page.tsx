import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getCustomers } from '@/features/khata/customers/customer.service';
import { CustomerList } from '@/features/khata/customers/ui/CustomerList';

export default async function CustomersPage() {
  const session = await requireAuthSession();
  let customers: any[] = [];
  try {
    customers = await getCustomers(session.shopId);
  } catch (e: any) {
    console.warn('Customer list SSR note:', e.message);
  }

  return <CustomerList initialCustomers={customers} />;
}
