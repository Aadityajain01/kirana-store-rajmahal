import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getCustomerLedger } from '@/features/ledger/ledger.service';
import { LedgerPage } from '@/features/ledger/ui/LedgerPage';

export default async function CustomerLedgerPageRoute({
  params,
}: {
  params: { customerId: string };
}) {
  const session = await requireAuthSession();
  const ledger = await getCustomerLedger(session.shopId, params.customerId);

  return <LedgerPage initialLedger={ledger} />;
}
