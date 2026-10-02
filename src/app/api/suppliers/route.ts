import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getSuppliers, createSupplier } from '@/features/khata/suppliers/supplier.service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    const suppliers = await getSuppliers(session.shopId, {
      query: q || undefined,
    });

    const serialized = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      mobile: s.mobile,
      address: s.address,
      balanceMinor: s.balanceMinor.toString(),
      status: s.status,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ success: true, suppliers: serialized });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch suppliers from database' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: { message: 'Supplier name is required / व्यापारी का नाम अनिवार्य है' } },
        { status: 400 }
      );
    }

    const supplier = await createSupplier(session, {
      name: body.name.trim(),
      mobile: body.mobile?.trim() || null,
      address: body.address?.trim() || null,
      openingBalanceRupees: body.openingBalanceRupees || 0,
    });

    return NextResponse.json({
      success: true,
      supplier: {
        id: supplier.id,
        name: supplier.name,
        mobile: supplier.mobile,
        address: supplier.address,
        balanceMinor: body.openingBalanceRupees ? (BigInt(body.openingBalanceRupees) * 100n).toString() : '0',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create supplier' } },
      { status: 500 }
    );
  }
}
