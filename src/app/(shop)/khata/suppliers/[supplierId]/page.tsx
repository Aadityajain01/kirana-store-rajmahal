import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getSupplier } from '@/features/khata/suppliers/supplier.service';
import { getSupplierLedger } from '@/features/ledger/ledger.service';
import { SupplierDetail } from '@/features/khata/suppliers/ui/SupplierDetail';

export default async function SupplierDetailPage({
  params,
}: {
  params: { supplierId: string };
}) {
  const session = await requireAuthSession();
  const supplier = await getSupplier(session.shopId, params.supplierId);
  const ledger = await getSupplierLedger(session.shopId, params.supplierId);

  return (
    <SupplierDetail
      supplier={supplier}
      recentLedgerEntries={ledger.entries}
    />
  );
}
