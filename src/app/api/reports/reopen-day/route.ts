import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { reopenTradingDay } from '@/features/reports/report.service';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { tradingDate } = await req.json();

    const result = await reopenTradingDay(session, tradingDate);
    return NextResponse.json({ success: true, reopened: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'SERVER_ERROR', message: err.message } },
      { status: err.statusCode || 500 }
    );
  }
}
