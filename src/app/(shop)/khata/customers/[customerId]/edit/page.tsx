import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getCustomer } from '@/features/khata/customers/customer.service';
import { CustomerForm } from '@/features/khata/customers/ui/CustomerForm';

export default async function CustomerEditPage({
  params,
}: {
  params: { customerId: string };
}) {
  const session = await requireAuthSession();
  const customer = await getCustomer(session.shopId, params.customerId);

  return (
    <CustomerForm
      isEdit
      initialData={{
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address,
        creditLimitRupees: Number(customer.creditLimit / 100n),
      }}
    />
  );
}
