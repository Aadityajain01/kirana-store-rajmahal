import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getTransaction, deleteTransaction } from '@/features/transactions/transaction.service';

export async function GET(req: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const session = await requireAuthSession();
    const tx = await getTransaction(session.shopId, params.transactionId);
    return NextResponse.json(tx);
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'SERVER_ERROR', message: err.message } },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const session = await requireAuthSession();
    const deleted = await deleteTransaction(session, params.transactionId);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'SERVER_ERROR', message: err.message } },
      { status: err.statusCode || 500 }
    );
  }
}
