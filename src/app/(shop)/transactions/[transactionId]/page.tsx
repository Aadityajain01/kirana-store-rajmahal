import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getTransaction } from '@/features/transactions/transaction.service';
import { TransactionDetail } from '@/features/transactions/ui/TransactionDetail';

export default async function TransactionDetailPage({
  params,
}: {
  params: { transactionId: string };
}) {
  const session = await requireAuthSession();
  const tx = await getTransaction(session.shopId, params.transactionId);

  return <TransactionDetail transaction={tx} userRole={session.role} />;
}
