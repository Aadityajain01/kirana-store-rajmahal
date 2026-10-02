import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { processSyncPush } from '@/features/sync/sync.service';
import { syncPushSchema } from '@/features/sync/sync.schema';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();

    const validated = syncPushSchema.parse(body);
    const result = await processSyncPush(session, validated);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: err.code || 'SYNC_FAILED',
          message: err.message || 'Push sync failed',
          requestId: `req_${Date.now()}`,
          retryable: true,
        },
      },
      { status: err.statusCode || 500 }
    );
  }
}
