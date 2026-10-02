import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { recordCustomerPayment } from '@/features/transactions/transaction.service';
import { calculateCustomerBalance } from '@/features/accounting/balance.calculator';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();

    const { customerId, amountRupees, paymentMode, note } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: { message: 'Customer is required / ग्राहक चुनना अनिवार्य है' } },
        { status: 400 }
      );
    }

    const amt = Number(amountRupees);
    if (!amt || amt <= 0) {
      return NextResponse.json(
        { error: { message: 'Valid amount is required / वैध राशि भरें' } },
        { status: 400 }
      );
    }

    const result = await recordCustomerPayment(
      session,
      customerId,
      amt,
      paymentMode || 'CASH',
      note || 'Payment received / जमा'
    );

    const balanceMinor = await calculateCustomerBalance(session.shopId, customerId);

    return NextResponse.json({
      success: true,
      transactionId: result.transaction.id,
      balanceMinor: balanceMinor.toString(),
    });
  } catch (err: any) {
    console.error('Customer payment error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to record payment' } },
      { status: 500 }
    );
  }
}
