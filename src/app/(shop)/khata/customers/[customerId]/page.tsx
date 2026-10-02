import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getCustomer } from '@/features/khata/customers/customer.service';
import { getCustomerLedger } from '@/features/ledger/ledger.service';
import { CustomerDetail } from '@/features/khata/customers/ui/CustomerDetail';

export default async function CustomerDetailPage({
  params,
}: {
  params: { customerId: string };
}) {
  const session = await requireAuthSession();
  const customer = await getCustomer(session.shopId, params.customerId);
  const ledger = await getCustomerLedger(session.shopId, params.customerId);

  return (
    <CustomerDetail
      customer={customer}
      recentLedgerEntries={ledger.entries}
    />
  );
}
