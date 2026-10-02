import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getCustomers, createCustomer } from '@/features/khata/customers/customer.service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    const customers = await getCustomers(session.shopId, {
      query: q || undefined,
    });

    const serialized = customers.map((c) => ({
      id: c.id,
      name: c.name,
      mobile: c.mobile,
      address: c.address,
      creditLimit: c.creditLimit.toString(),
      balanceMinor: c.balanceMinor.toString(),
      status: c.status,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ success: true, customers: serialized });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch customers from database' } },
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
        { error: { message: 'Customer name is required / ग्राहक का नाम अनिवार्य है' } },
        { status: 400 }
      );
    }

    const customer = await createCustomer(session, {
      name: body.name.trim(),
      mobile: body.mobile?.trim() || null,
      address: body.address?.trim() || null,
      creditLimitRupees: body.creditLimitRupees || 0,
      openingBalanceRupees: body.openingBalanceRupees || 0,
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address,
        creditLimit: customer.creditLimit.toString(),
        balanceMinor: body.openingBalanceRupees ? (BigInt(body.openingBalanceRupees) * 100n).toString() : '0',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create customer' } },
      { status: 500 }
    );
  }
}
