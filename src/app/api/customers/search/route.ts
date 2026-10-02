import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getCustomers } from '@/features/khata/customers/customer.service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    const customers = await getCustomers(session.shopId, {
      query: q || undefined,
    });

    const results = customers.slice(0, 15).map((c) => ({
      id: c.id,
      name: c.name,
      mobile: c.mobile,
      balanceMinor: c.balanceMinor.toString(),
    }));

    return NextResponse.json({ success: true, customers: results });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to search customers' } },
      { status: 500 }
    );
  }
}
