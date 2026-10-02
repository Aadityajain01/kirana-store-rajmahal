import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { updateShop } from '@/features/shop/shop.service';
import { updateShopSchema } from '@/features/shop/shop.schema';

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();
    const validated = updateShopSchema.parse(body);

    const updated = await updateShop(session, validated);
    return NextResponse.json({ success: true, shop: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'SERVER_ERROR', message: err.message } },
      { status: err.statusCode || 500 }
    );
  }
}
