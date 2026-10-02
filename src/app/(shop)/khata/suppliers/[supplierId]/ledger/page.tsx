import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getSupplierLedger } from '@/features/ledger/ledger.service';
import { LedgerPage } from '@/features/ledger/ui/LedgerPage';

export default async function SupplierLedgerPageRoute({
  params,
}: {
  params: { supplierId: string };
}) {
  const session = await requireAuthSession();
  const ledger = await getSupplierLedger(session.shopId, params.supplierId);

  return <LedgerPage initialLedger={ledger} />;
}
