import { getDailyReport, getOutstandingReport } from '@/features/reports/report.service';
import { calculateCashBalance, calculateBankBalance } from '@/features/accounting/balance.calculator';
import { getTransactions } from '@/features/transactions/transaction.query';
import { getTodayTradingDate } from '@/lib/dates';

export interface DashboardSummary {
  tradingDate: string;
  todaySalesMinor: bigint;
  todayReceivedMinor: bigint;
  todayExpensesMinor: bigint;
  todaySupplierPaidMinor: bigint;
  customerReceivableMinor: bigint;
  supplierPayableMinor: bigint;
  cashBalanceMinor: bigint;
  bankBalanceMinor: bigint;
  customerCount: number;
  supplierCount: number;
  recentTransactions: any[];
}

export async function getDashboardSummary(shopId: string): Promise<DashboardSummary> {
  const today = getTodayTradingDate();

  const [daily, outstanding, cashBal, bankBal, recentTxs] = await Promise.all([
    getDailyReport(shopId, today),
    getOutstandingReport(shopId),
    calculateCashBalance(shopId),
    calculateBankBalance(shopId),
    getTransactions(shopId, { limit: 6 }),
  ]);

  return {
    tradingDate: today,
    todaySalesMinor: daily.totalSales,
    todayReceivedMinor: daily.customerReceived,
    todayExpensesMinor: daily.totalExpenses,
    todaySupplierPaidMinor: daily.supplierPaid,
    customerReceivableMinor: outstanding.totalCustomerReceivables,
    supplierPayableMinor: outstanding.totalSupplierPayables,
    cashBalanceMinor: cashBal,
    bankBalanceMinor: bankBal,
    customerCount: outstanding.customers.length,
    supplierCount: outstanding.suppliers.length,
    recentTransactions: recentTxs.items,
  };
}
