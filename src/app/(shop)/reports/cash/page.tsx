import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getCashReport } from '@/features/reports/report.service';
import { CashReport } from '@/features/reports/ui/CashReport';

export default async function CashReportPage({
  searchParams,
}: {
  searchParams: { dateFrom?: string; dateTo?: string };
}) {
  const session = await requireAuthSession();
  const data = await getCashReport(
    session.shopId,
    searchParams.dateFrom,
    searchParams.dateTo
  );

  return <CashReport data={data} />;
}
