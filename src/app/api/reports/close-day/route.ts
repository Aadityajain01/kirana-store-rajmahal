import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { closeTradingDay } from '@/features/reports/report.service';
import { closeDaySchema } from '@/features/reports/report-filter.schema';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();
    const validated = closeDaySchema.parse(body);

    const result = await closeTradingDay(session, validated);
    return NextResponse.json({ success: true, closing: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'SERVER_ERROR', message: err.message } },
      { status: err.statusCode || 500 }
    );
  }
}
