import { NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getDashboardSummary } from '@/features/dashboard/dashboard.service';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuthSession();
    const summary = await getDashboardSummary(session.shopId);

    // Also fetch line items for recent transactions to show product breakdown
    const recentTxIds = summary.recentTransactions.map((tx: any) => tx.id);
    const lineItems = (prisma as any).transactionItem
      ? await (prisma as any).transactionItem.findMany({
          where: {
            shopId: session.shopId,
            transactionId: { in: recentTxIds },
          },
        })
      : [];

    const itemsByTx: { [key: string]: any[] } = {};
    for (const item of lineItems) {
      if (!itemsByTx[item.transactionId]) itemsByTx[item.transactionId] = [];
      itemsByTx[item.transactionId].push({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnitPaise: item.pricePerUnit.toString(),
        totalPricePaise: item.totalPrice.toString(),
      });
    }

    const enhancedRecentTxs = summary.recentTransactions.map((tx: any) => ({
      ...tx,
      amount: tx.amount.toString(),
      items: itemsByTx[tx.id] || [],
    }));

    return NextResponse.json({
      success: true,
      summary: {
        tradingDate: summary.tradingDate,
        todaySalesPaise: summary.todaySalesMinor.toString(),
        todayReceivedPaise: summary.todayReceivedMinor.toString(),
        todayExpensesPaise: summary.todayExpensesMinor.toString(),
        customerReceivablePaise: summary.customerReceivableMinor.toString(),
        supplierPayablePaise: summary.supplierPayableMinor.toString(),
        cashBalancePaise: summary.cashBalanceMinor.toString(),
        customerCount: summary.customerCount,
        supplierCount: summary.supplierCount,
        recentTransactions: enhancedRecentTxs,
      },
    });
  } catch (err: any) {
    console.error('Dashboard summary error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch dashboard summary from database' } },
      { status: 500 }
    );
  }
}
