import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getSupplier } from '@/features/khata/suppliers/supplier.service';
import { SupplierForm } from '@/features/khata/suppliers/ui/SupplierForm';

export default async function SupplierEditPage({
  params,
}: {
  params: { supplierId: string };
}) {
  const session = await requireAuthSession();
  const supplier = await getSupplier(session.shopId, params.supplierId);

  return (
    <SupplierForm
      isEdit
      initialData={{
        id: supplier.id,
        name: supplier.name,
        mobile: supplier.mobile,
        address: supplier.address,
      }}
    />
  );
}
