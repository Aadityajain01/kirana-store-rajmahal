import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getOutstandingReport } from '@/features/reports/report.service';
import { OutstandingReport } from '@/features/reports/ui/OutstandingReport';

export default async function OutstandingReportPage() {
  const session = await requireAuthSession();
  const data = await getOutstandingReport(session.shopId);

  return <OutstandingReport data={data} />;
}
