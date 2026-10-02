import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getTransactions } from '@/features/transactions/transaction.query';
import { TransactionReport } from '@/features/reports/ui/TransactionReport';

export default async function TransactionsReportPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await requireAuthSession();
  const data = await getTransactions(session.shopId, {
    limit: 100,
    preset: (searchParams.preset as any) || undefined,
  });

  return <TransactionReport initialData={data} />;
}
