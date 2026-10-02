import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guards';
import {
  getDailyReport,
  getCashReport,
  getOutstandingReport,
  getExpenseReport,
} from '@/features/reports/report.service';
import { formatINR } from '@/lib/money';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    assertPermission(session.role, 'EXPORT_REPORTS');

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'DAILY';
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    let csvContent = '';
    let filename = `report_${reportType.toLowerCase()}_${Date.now()}.csv`;

    if (reportType === 'DAILY') {
      const data = await getDailyReport(session.shopId, dateFrom);
      csvContent = [
        `Trading Date,${data.tradingDate}`,
        `Total Sales,${formatINR(data.totalSales, { showSymbol: false })}`,
        `Cash Sales,${formatINR(data.cashSales, { showSymbol: false })}`,
        `Credit Sales,${formatINR(data.creditSales, { showSymbol: false })}`,
        `Customer Payments Received,${formatINR(data.customerReceived, { showSymbol: false })}`,
        `Supplier Payments Paid,${formatINR(data.supplierPaid, { showSymbol: false })}`,
        `Expenses,${formatINR(data.totalExpenses, { showSymbol: false })}`,
        `Opening Cash,${formatINR(data.openingCash, { showSymbol: false })}`,
        `Expected Cash,${formatINR(data.expectedCash, { showSymbol: false })}`,
        `Actual Cash,${data.closingRecord ? formatINR(data.closingRecord.actualCash, { showSymbol: false }) : 'Not Closed'}`,
        `Cash Difference,${data.closingRecord ? formatINR(data.closingRecord.difference, { showSymbol: false }) : 'N/A'}`,
      ].join('\n');
    } else if (reportType === 'CASH') {
      const data = await getCashReport(session.shopId, dateFrom, dateTo);
      const rows = [
        'Date,Type,Cash In (Paise),Cash Out (Paise),Note',
        ...data.items.map((i) =>
          `"${new Date(i.date).toISOString()}",${i.type},${i.cashIn},${i.cashOut},"${(i.note || '').replace(/"/g, '""')}"`
        ),
      ];
      csvContent = rows.join('\n');
    } else if (reportType === 'OUTSTANDING') {
      const data = await getOutstandingReport(session.shopId);
      const rows = [
        'Party Type,Party Name,Mobile,Balance (₹)',
        ...data.customers.map(
          (c) => `"Customer","${c.name}","${c.mobile || ''}","${formatINR(c.balanceMinor, { showSymbol: false })}"`
        ),
        ...data.suppliers.map(
          (s) => `"Supplier","${s.name}","${s.mobile || ''}","${formatINR(s.balanceMinor, { showSymbol: false })}"`
        ),
      ];
      csvContent = rows.join('\n');
    } else if (reportType === 'EXPENSES') {
      const data = await getExpenseReport(session.shopId, dateFrom, dateTo);
      const rows = [
        'Category,Transaction Count,Total (₹)',
        ...data.breakdown.map((b) => `"${b.name}",${b.count},"${formatINR(b.totalMinor, { showSymbol: false })}"`),
      ];
      csvContent = rows.join('\n');
    }

    return new NextResponse(csvContent, {
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
          message: err.message || 'Export failed',
          requestId: `req_${Date.now()}`,
          retryable: false,
        },
      },
      { status: err.statusCode || 500 }
    );
  }
}
