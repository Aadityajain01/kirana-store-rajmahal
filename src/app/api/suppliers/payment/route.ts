import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { recordSupplierPayment } from '@/features/transactions/transaction.service';
import { calculateSupplierBalance } from '@/features/accounting/balance.calculator';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();

    const { supplierId, amountRupees, paymentMode, note } = body;

    if (!supplierId) {
      return NextResponse.json(
        { error: { message: 'Supplier is required / व्यापारी चुनना अनिवार्य है' } },
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

    const result = await recordSupplierPayment(
      session,
      supplierId,
      amt,
      paymentMode || 'CASH',
      note || 'Supplier payment / भुगतान'
    );

    const balanceMinor = await calculateSupplierBalance(session.shopId, supplierId);

    return NextResponse.json({
      success: true,
      transactionId: result.transaction.id,
      balanceMinor: balanceMinor.toString(),
    });
  } catch (err: any) {
    console.error('Supplier payment error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to record supplier payment' } },
      { status: 500 }
    );
  }
}
