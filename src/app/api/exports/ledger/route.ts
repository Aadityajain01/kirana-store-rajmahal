import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guards';
import { getCustomerLedger, getSupplierLedger } from '@/features/ledger/ledger.service';
import { formatINR } from '@/lib/money';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    assertPermission(session.role, 'EXPORT_REPORTS');

    const { searchParams } = new URL(req.url);
    const partyType = searchParams.get('partyType') || 'CUSTOMER';
    const partyId = searchParams.get('partyId');

    if (!partyId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'partyId is required' } },
        { status: 400 }
      );
    }

    const ledger =
      partyType === 'CUSTOMER'
        ? await getCustomerLedger(session.shopId, partyId)
        : await getSupplierLedger(session.shopId, partyId);

    const filename = `ledger_${ledger.party.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;

    const rows = [
      `Party Name,"${ledger.party.name}"`,
      `Party Type,${ledger.party.type}`,
      `Mobile,"${ledger.party.mobile || ''}"`,
      `Current Balance,${formatINR(ledger.currentBalanceMinor, { showSymbol: false })}`,
      '',
      'Date,Transaction Type,Payment Mode,Reference,Debit / दिया (₹),Credit / लिया (₹),Running Balance (₹),Note',
      ...ledger.entries.map((e) =>
        `"${new Date(e.transactionDate).toISOString()}","${e.type}","${e.paymentMode || ''}","${e.referenceNo || ''}","${formatINR(e.debitMinor, { showSymbol: false })}","${formatINR(e.creditMinor, { showSymbol: false })}","${formatINR(e.runningBalanceMinor, { showSymbol: false })}","${(e.note || '').replace(/"/g, '""')}"`
      ),
    ];

    const csv = rows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: err.code || 'SERVER_ERROR',
          message: err.message || 'Ledger export failed',
          requestId: `req_${Date.now()}`,
          retryable: false,
        },
      },
      { status: err.statusCode || 500 }
    );
  }
}
