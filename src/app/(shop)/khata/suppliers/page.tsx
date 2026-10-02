import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getSuppliers } from '@/features/khata/suppliers/supplier.service';
import { SupplierList } from '@/features/khata/suppliers/ui/SupplierList';

export default async function SuppliersPage() {
  const session = await requireAuthSession();
  let suppliers: any[] = [];
  try {
    suppliers = await getSuppliers(session.shopId);
  } catch (e: any) {
    console.warn('Supplier list SSR note:', e.message);
  }

  return <SupplierList initialSuppliers={suppliers} />;
}
