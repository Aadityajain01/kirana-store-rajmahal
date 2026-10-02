import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthSession } from '@/lib/auth/session';
import { Money } from '@/lib/money';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'daily'; // 'daily' | 'monthly'

    // Fetch transactions from the past 90 days for daily, or past 365 days for monthly
    const daysBack = mode === 'monthly' ? 365 : 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysBack);
    sinceDate.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        shopId: session.shopId,
        status: 'POSTED',
        deletedAt: null,
        transactionDate: { gte: sinceDate },
      },
      select: {
        id: true,
        type: true,
        partyType: true,
        partyId: true,
        amount: true,
        transactionDate: true,
      },
      orderBy: { transactionDate: 'desc' },
    });

    // Grouping map
    const groups: {
      [key: string]: {
        key: string;
        label: string;
        customerCreditGiven: bigint;
        customerCreditReceived: bigint;
        supplierCreditPurchases: bigint;
        supplierMoneyPaid: bigint;
      };
    } = {};

    let grandCustomerCreditGiven = 0n;
    let grandCustomerCreditReceived = 0n;
    let grandSupplierCreditPurchases = 0n;
    let grandSupplierMoneyPaid = 0n;

    for (const tx of transactions) {
      const d = new Date(tx.transactionDate);
      let groupKey = '';
      let groupLabel = '';

      if (mode === 'monthly') {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        groupKey = `${year}-${month}`;
        groupLabel = d.toLocaleDateString('hi-IN', { month: 'short', year: 'numeric' });
      } else {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        groupKey = `${year}-${month}-${day}`;
        groupLabel = d.toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          label: groupLabel,
          customerCreditGiven: 0n,
          customerCreditReceived: 0n,
          supplierCreditPurchases: 0n,
          supplierMoneyPaid: 0n,
        };
      }

      const g = groups[groupKey];
      const amt = tx.amount;

      if (tx.type === 'SALE_CREDIT') {
        g.customerCreditGiven += amt;
        grandCustomerCreditGiven += amt;
      } else if (tx.type === 'CUSTOMER_PAYMENT') {
        g.customerCreditReceived += amt;
        grandCustomerCreditReceived += amt;
      } else if (tx.type === 'PURCHASE_CREDIT') {
        g.supplierCreditPurchases += amt;
        grandSupplierCreditPurchases += amt;
      } else if (tx.type === 'SUPPLIER_PAYMENT') {
        g.supplierMoneyPaid += amt;
        grandSupplierMoneyPaid += amt;
      }
    }

    // Convert map to sorted list
    const rows = Object.values(groups)
      .sort((a, b) => b.key.localeCompare(a.key))
      .map((g) => ({
        key: g.key,
        label: g.label,
        customerCreditGivenRupees: Money.toRupees(g.customerCreditGiven),
        customerCreditReceivedRupees: Money.toRupees(g.customerCreditReceived),
        supplierCreditPurchasesRupees: Money.toRupees(g.supplierCreditPurchases),
        supplierMoneyPaidRupees: Money.toRupees(g.supplierMoneyPaid),
        netCustomerBalanceRupees: Money.toRupees(g.customerCreditGiven - g.customerCreditReceived),
        netSupplierBalanceRupees: Money.toRupees(g.supplierCreditPurchases - g.supplierMoneyPaid),
        netCashflowRupees: Money.toRupees(g.customerCreditReceived - g.supplierMoneyPaid),
      }));

    return NextResponse.json({
      success: true,
      mode,
      summary: {
        totalCustomerCreditGivenRupees: Money.toRupees(grandCustomerCreditGiven),
        totalCustomerCreditReceivedRupees: Money.toRupees(grandCustomerCreditReceived),
        totalSupplierCreditPurchasesRupees: Money.toRupees(grandSupplierCreditPurchases),
        totalSupplierMoneyPaidRupees: Money.toRupees(grandSupplierMoneyPaid),
        netCashflowRupees: Money.toRupees(grandCustomerCreditReceived - grandSupplierMoneyPaid),
      },
      rows,
    });
  } catch (err: any) {
    console.error('Reports summary error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to generate report from database' } },
      { status: 500 }
    );
  }
}
