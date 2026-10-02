import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getSuppliers } from '@/features/khata/suppliers/supplier.service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    const suppliers = await getSuppliers(session.shopId, {
      query: q || undefined,
    });

    const results = suppliers.slice(0, 15).map((s) => ({
      id: s.id,
      name: s.name,
      mobile: s.mobile,
      balanceMinor: s.balanceMinor.toString(),
    }));

    return NextResponse.json({ success: true, suppliers: results });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to search suppliers' } },
      { status: 500 }
    );
  }
}
