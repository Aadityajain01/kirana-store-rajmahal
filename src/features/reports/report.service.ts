import { findTransactionsForDateRange, findCashAccountEntriesForRange } from './report.repository';
import {
  findDailyClosing,
  findLatestClosingBefore,
  createDailyClosing,
  reopenDailyClosing,
} from './closing.repository';
import { getCustomers } from '@/features/khata/customers/customer.service';
import { getSuppliers } from '@/features/khata/suppliers/supplier.service';
import { findExpenseCategories } from '@/features/expenses/expense.repository';
import { calculateCashBalance } from '@/features/accounting/balance.calculator';
import { getTodayTradingDate } from '@/lib/dates';
import { Money } from '@/lib/money';
import { AuthSession } from '@/lib/auth/session';
import { assertPermission, assertOwner } from '@/lib/permissions/guards';
import { AppError } from '@/lib/errors/app-error';

export async function getDailyReport(shopId: string, dateStr?: string) {
  const tradingDate = dateStr || getTodayTradingDate();
  const startOfDay = new Date(`${tradingDate}T00:00:00.000Z`);
  const endOfDay = new Date(`${tradingDate}T23:59:59.999Z`);

  const [transactions, closingRecord] = await Promise.all([
    findTransactionsForDateRange(shopId, startOfDay, endOfDay),
    findDailyClosing(shopId, tradingDate),
  ]);

  let totalSales = 0n;
  let cashSales = 0n;
  let creditSales = 0n;
  let customerReceived = 0n;
  let supplierPaid = 0n;
  let supplierCredit = 0n;
  let totalExpenses = 0n;
  let cashInflow = 0n;
  let cashOutflow = 0n;

  for (const tx of transactions) {
    const amt = tx.amount;
    switch (tx.type) {
      case 'SALE_CASH':
        totalSales += amt;
        cashSales += amt;
        cashInflow += amt;
        break;
      case 'SALE_CREDIT':
        totalSales += amt;
        creditSales += amt;
        break;
      case 'CUSTOMER_PAYMENT':
        customerReceived += amt;
        if (tx.paymentMode === 'CASH') cashInflow += amt;
        break;
      case 'PURCHASE_CREDIT':
        supplierCredit += amt;
        break;
      case 'SUPPLIER_PAYMENT':
        supplierPaid += amt;
        if (tx.paymentMode === 'CASH') cashOutflow += amt;
        break;
      case 'EXPENSE':
        totalExpenses += amt;
        if (tx.paymentMode === 'CASH') cashOutflow += amt;
        break;
      case 'CASH_IN':
        cashInflow += amt;
        break;
      case 'CASH_OUT':
        cashOutflow += amt;
        break;
    }
  }

  // Calculate prior day closing cash as opening cash
  const priorClosing = await findLatestClosingBefore(shopId, tradingDate);
  const openingCash = priorClosing ? priorClosing.actualCash : 0n;
  const expectedCash = openingCash + cashInflow - cashOutflow;

  return {
    tradingDate,
    totalSales,
    cashSales,
    creditSales,
    customerReceived,
    supplierPaid,
    supplierCredit,
    totalExpenses,
    cashInflow,
    cashOutflow,
    openingCash,
    expectedCash,
    closingRecord,
    transactionCount: transactions.length,
    transactions,
  };
}

export async function getCashReport(shopId: string, dateFrom?: string, dateTo?: string) {
  const today = getTodayTradingDate();
  const from = dateFrom || today;
  const to = dateTo || today;

  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T23:59:59.999Z`);

  const entries = await findCashAccountEntriesForRange(shopId, start, end);
  const currentCashInHand = await calculateCashBalance(shopId);

  let totalCashIn = 0n;
  let totalCashOut = 0n;

  const items = entries.map((e) => {
    totalCashIn += e.debit;
    totalCashOut += e.credit;
    return {
      id: e.id,
      transactionId: e.transactionId,
      date: e.transaction.transactionDate,
      type: e.transaction.type,
      note: e.transaction.note,
      cashIn: e.debit,
      cashOut: e.credit,
    };
  });

  return {
    dateFrom: from,
    dateTo: to,
    totalCashIn,
    totalCashOut,
    netCashMovement: totalCashIn - totalCashOut,
    currentCashInHand,
    items,
  };
}

export async function getOutstandingReport(shopId: string) {
  const [customers, suppliers] = await Promise.all([
    getCustomers(shopId, { preset: 'RECEIVABLE' }),
    getSuppliers(shopId, { preset: 'PAYABLE' }),
  ]);

  const totalCustomerReceivables = customers.reduce((sum, c) => sum + c.balanceMinor, 0n);
  const totalSupplierPayables = suppliers.reduce((sum, s) => sum + s.balanceMinor, 0n);

  return {
    totalCustomerReceivables,
    totalSupplierPayables,
    netBalance: totalCustomerReceivables - totalSupplierPayables,
    customers,
    suppliers,
  };
}

export async function getExpenseReport(shopId: string, dateFrom?: string, dateTo?: string) {
  const today = getTodayTradingDate();
  const from = dateFrom || `${today.slice(0, 7)}-01`;
  const to = dateTo || today;

  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T23:59:59.999Z`);

  const [categories, txs] = await Promise.all([
    findExpenseCategories(shopId),
    findTransactionsForDateRange(shopId, start, end),
  ]);

  const expenseTxs = txs.filter((t) => t.type === 'EXPENSE');

  const categoryMap = new Map<string, { name: string; count: number; totalMinor: bigint }>();
  for (const cat of categories) {
    categoryMap.set(cat.id, { name: cat.name, count: 0, totalMinor: 0n });
  }

  let totalExpenseMinor = 0n;

  for (const t of expenseTxs) {
    totalExpenseMinor += t.amount;
    const catId = t.expense?.categoryId || 'OTHER';
    if (categoryMap.has(catId)) {
      const item = categoryMap.get(catId)!;
      item.count += 1;
      item.totalMinor += t.amount;
    } else {
      categoryMap.set(catId, {
        name: t.expense?.category?.name || 'General Expense',
        count: 1,
        totalMinor: t.amount,
      });
    }
  }

  const breakdown = Array.from(categoryMap.values()).filter((c) => c.totalMinor > 0n);

  return {
    dateFrom: from,
    dateTo: to,
    totalExpenseMinor,
    transactionCount: expenseTxs.length,
    breakdown,
    transactions: expenseTxs,
  };
}

export async function closeTradingDay(session: AuthSession, input: { tradingDate: string; actualCashRupees: number }) {
  assertPermission(session.role, 'CLOSE_DAY');

  const existing = await findDailyClosing(session.shopId, input.tradingDate);
  if (existing && !existing.isReopened) {
    throw new AppError({
      code: 'ALREADY_CLOSED',
      message: `Trading day ${input.tradingDate} is already closed.`,
      statusCode: 409,
    });
  }

  const daily = await getDailyReport(session.shopId, input.tradingDate);
  const actualCash = Money.fromRupees(input.actualCashRupees);
  const difference = actualCash - daily.expectedCash;

  return createDailyClosing({
    shopId: session.shopId,
    tradingDate: input.tradingDate,
    openingCash: daily.openingCash,
    expectedCash: daily.expectedCash,
    actualCash,
    difference,
    closedBy: session.userName,
  });
}

export async function reopenTradingDay(session: AuthSession, tradingDate: string) {
  assertOwner(session.role, 'Only the shop owner can reopen a closed trading day.');

  const existing = await findDailyClosing(session.shopId, tradingDate);
  if (!existing) {
    throw new AppError({
      code: 'VALIDATION_ERROR',
      message: 'No closing record found for this date.',
      statusCode: 404,
    });
  }

  return reopenDailyClosing(session.shopId, tradingDate, session.userName);
}
