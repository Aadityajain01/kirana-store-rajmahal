import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { processSyncPull } from '@/features/sync/sync.service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') || undefined;

    const data = await processSyncPull(session, cursor);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: err.code || 'SYNC_FAILED',
          message: err.message || 'Pull sync failed',
          requestId: `req_${Date.now()}`,
          retryable: true,
        },
      },
      { status: err.statusCode || 500 }
    );
  }
}
