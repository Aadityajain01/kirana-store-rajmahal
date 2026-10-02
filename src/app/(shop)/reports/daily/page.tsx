import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getDailyReport } from '@/features/reports/report.service';
import { DailyReport } from '@/features/reports/ui/DailyReport';

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const session = await requireAuthSession();
  const data = await getDailyReport(session.shopId, searchParams.date);

  return <DailyReport data={data} userRole={session.role} />;
}
