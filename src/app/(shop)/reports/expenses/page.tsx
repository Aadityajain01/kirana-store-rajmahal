import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getExpenseReport } from '@/features/reports/report.service';
import { ExpenseReport } from '@/features/reports/ui/ExpenseReport';

export default async function ExpensesReportPage({
  searchParams,
}: {
  searchParams: { dateFrom?: string; dateTo?: string };
}) {
  const session = await requireAuthSession();
  const data = await getExpenseReport(
    session.shopId,
    searchParams.dateFrom,
    searchParams.dateTo
  );

  return <ExpenseReport data={data} />;
}
