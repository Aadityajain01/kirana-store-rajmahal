import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    const products = await prisma.product.findMany({
      where: {
        shopId: session.shopId,
        status: 'ACTIVE',
        ...(q
          ? {
              name: { contains: q, mode: 'insensitive' },
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      take: 20,
    });

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Product search failed' } },
      { status: 500 }
    );
  }
}
