import React from 'react';
import Link from 'next/link';
import { requireAuthSession } from '@/lib/auth/session';
import { getTransactions } from '@/features/transactions/transaction.query';
import { TransactionTable } from '@/components/tables/TransactionTable';
import { Plus } from 'lucide-react';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await requireAuthSession();

  const filterParams: any = {
    preset: searchParams.preset || undefined,
    dateFrom: searchParams.dateFrom || undefined,
    dateTo: searchParams.dateTo || undefined,
    query: searchParams.query || undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 25,
  };

  const data = await getTransactions(session.shopId, filterParams);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Transactions</h1>
          <span className="text-xs text-emerald-700 font-semibold">
            दुकान के सभी लेन-देन ({data.totalCount})
          </span>
        </div>

        <Link
          href="/transactions/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction / नया लेन-देन</span>
        </Link>
      </div>

      <TransactionTable
        transactions={data.items}
        totalPages={data.totalPages}
        currentPage={data.page}
      />
    </div>
  );
}
