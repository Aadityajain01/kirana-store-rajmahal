import { NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await requireAuthSession();

    const [devices, pendingCount] = await Promise.all([
      prisma.device.findMany({
        where: { shopId: session.shopId },
        orderBy: { lastSeenAt: 'desc' },
      }),
      prisma.syncCommand.count({
        where: { shopId: session.shopId, status: 'LOCAL_PENDING' },
      }),
    ]);

    return NextResponse.json({
      status: 'HEALTHY',
      shopId: session.shopId,
      devices,
      pendingCommandsCount: pendingCount,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: err.code || 'SERVER_ERROR',
          message: err.message || 'Sync status check failed',
          requestId: `req_${Date.now()}`,
          retryable: true,
        },
      },
      { status: err.statusCode || 500 }
    );
  }
}
