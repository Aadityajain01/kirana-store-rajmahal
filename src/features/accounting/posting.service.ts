import { prisma } from '@/lib/db/prisma';
import { AppError } from '@/lib/errors/app-error';
import { ensureStandardAccounts } from './accounts.repository';
import { calculateCustomerBalance, calculateSupplierBalance } from './balance.calculator';
import { getTodayTradingDate } from '@/lib/dates';

export interface PostFinancialTransactionInput {
  shopId: string;
  actorUserId: string;
  type: string; // SALE_CASH, SALE_CREDIT, PURCHASE_CASH, PURCHASE_CREDIT, CUSTOMER_PAYMENT, SUPPLIER_PAYMENT, EXPENSE, CASH_IN, CASH_OUT
  partyType?: 'CUSTOMER' | 'SUPPLIER' | 'NONE';
  partyId?: string;
  amountMinor: bigint;
  paymentMode?: 'CASH' | 'UPI' | 'BANK' | 'CARD' | 'OTHER';
  transactionDate?: Date;
  note?: string;
  referenceNo?: string;
  billNo?: string;
  deviceId?: string;
  idempotencyKey?: string;
  expenseCategoryId?: string;
}

export async function postFinancialTransaction(input: PostFinancialTransactionInput) {
  if (input.amountMinor <= 0n) {
    throw new AppError({
      code: 'VALIDATION_ERROR',
      message: 'Transaction amount must be a positive number.',
      statusCode: 400,
    });
  }

  // Idempotency check
  if (input.idempotencyKey) {
    const existing = await prisma.transaction.findFirst({
      where: {
        shopId: input.shopId,
        idempotencyKey: input.idempotencyKey,
        deletedAt: null,
      },
    });
    if (existing) {
      let balanceMinor = 0n;
      if (existing.partyType === 'CUSTOMER' && existing.partyId) {
        balanceMinor = await calculateCustomerBalance(input.shopId, existing.partyId);
      } else if (existing.partyType === 'SUPPLIER' && existing.partyId) {
        balanceMinor = await calculateSupplierBalance(input.shopId, existing.partyId);
      }
      return {
        transaction: existing,
        balanceMinor,
        isIdempotentReplay: true,
      };
    }
  }

  const txDate = input.transactionDate || new Date();
  const tradingDate = getTodayTradingDate();

  // Check if trading day is already closed
  const closedDay = await prisma.dailyClosing.findUnique({
    where: {
      shopId_tradingDate: {
        shopId: input.shopId,
        tradingDate,
      },
    },
  });

  if (closedDay && !closedDay.isReopened) {
    throw new AppError({
      code: 'CLOSED_DAY',
      message: `Trading day ${tradingDate} is closed. You must reopen the day or post on a new date.`,
      statusCode: 409,
    });
  }

  const accountsMap = await ensureStandardAccounts(input.shopId);

  // Determine posting entries based on Section 9.1
  const paymentAccountId =
    input.paymentMode === 'UPI' || input.paymentMode === 'BANK'
      ? accountsMap.get('BANK')!
      : accountsMap.get('CASH')!;

  const receivableAccountId = accountsMap.get('RECEIVABLE')!;
  const payableAccountId = accountsMap.get('PAYABLE')!;
  const salesAccountId = accountsMap.get('SALES')!;
  const purchasesAccountId = accountsMap.get('PURCHASES')!;
  const expensesAccountId = accountsMap.get('EXPENSES')!;
  const openingEquityAccountId = accountsMap.get('OPENING_BALANCE_EQUITY')!;

  interface DoubleEntry {
    accountId: string;
    debit: bigint;
    credit: bigint;
  }

  const entries: DoubleEntry[] = [];
  const amt = input.amountMinor;

  switch (input.type) {
    case 'SALE_CREDIT':
      // Debit Customer receivable, Credit Sales income
      entries.push({ accountId: receivableAccountId, debit: amt, credit: 0n });
      entries.push({ accountId: salesAccountId, debit: 0n, credit: amt });
      break;

    case 'CUSTOMER_PAYMENT':
      // Debit Cash/Bank, Credit Customer receivable
      entries.push({ accountId: paymentAccountId, debit: amt, credit: 0n });
      entries.push({ accountId: receivableAccountId, debit: 0n, credit: amt });
      break;

    case 'PURCHASE_CREDIT':
      // Debit Purchases, Credit Supplier payable
      entries.push({ accountId: purchasesAccountId, debit: amt, credit: 0n });
      entries.push({ accountId: payableAccountId, debit: 0n, credit: amt });
      break;

    case 'SUPPLIER_PAYMENT':
      // Debit Supplier payable, Credit Cash/Bank
      entries.push({ accountId: payableAccountId, debit: amt, credit: 0n });
      entries.push({ accountId: paymentAccountId, debit: 0n, credit: amt });
      break;

    case 'SALE_CASH':
      // Debit Cash, Credit Sales
      entries.push({ accountId: paymentAccountId, debit: amt, credit: 0n });
      entries.push({ accountId: salesAccountId, debit: 0n, credit: amt });
      break;

    case 'PURCHASE_CASH':
      // Debit Purchases, Credit Cash
      entries.push({ accountId: purchasesAccountId, debit: amt, credit: 0n });
      entries.push({ accountId: paymentAccountId, debit: 0n, credit: amt });
      break;

    case 'EXPENSE':
      // Debit Expense, Credit Cash/Bank
      entries.push({ accountId: expensesAccountId, debit: amt, credit: 0n });
      entries.push({ accountId: paymentAccountId, debit: 0n, credit: amt });
      break;

    case 'CASH_IN':
      // Debit Cash, Credit Bank / Equity
      entries.push({ accountId: accountsMap.get('CASH')!, debit: amt, credit: 0n });
      entries.push({ accountId: accountsMap.get('BANK')!, debit: 0n, credit: amt });
      break;

    case 'CASH_OUT':
      // Debit Bank / Equity, Credit Cash
      entries.push({ accountId: accountsMap.get('BANK')!, debit: amt, credit: 0n });
      entries.push({ accountId: accountsMap.get('CASH')!, debit: 0n, credit: amt });
      break;

    case 'OPENING_BALANCE':
      if (input.partyType === 'CUSTOMER') {
        entries.push({ accountId: receivableAccountId, debit: amt, credit: 0n });
        entries.push({ accountId: openingEquityAccountId, debit: 0n, credit: amt });
      } else if (input.partyType === 'SUPPLIER') {
        entries.push({ accountId: openingEquityAccountId, debit: amt, credit: 0n });
        entries.push({ accountId: payableAccountId, debit: 0n, credit: amt });
      } else {
        entries.push({ accountId: accountsMap.get('CASH')!, debit: amt, credit: 0n });
        entries.push({ accountId: openingEquityAccountId, debit: 0n, credit: amt });
      }
      break;

    default:
      throw new AppError({
        code: 'VALIDATION_ERROR',
        message: `Unsupported transaction type: ${input.type}`,
        statusCode: 400,
      });
  }

  // Validate balanced double entry: Sum(debit) == Sum(credit)
  const totalDebit = entries.reduce((acc, curr) => acc + curr.debit, 0n);
  const totalCredit = entries.reduce((acc, curr) => acc + curr.credit, 0n);
  if (totalDebit !== totalCredit) {
    throw new AppError({
      code: 'SERVER_ERROR',
      message: `Accounting imbalance error: debit (${totalDebit}) != credit (${totalCredit})`,
      statusCode: 500,
    });
  }

  // Execute database transaction atomically
  const result = await prisma.$transaction(async (tx) => {
    const createdTx = await tx.transaction.create({
      data: {
        shopId: input.shopId,
        type: input.type,
        partyType: input.partyType || 'NONE',
        partyId: input.partyId,
        amount: input.amountMinor,
        paymentMode: input.paymentMode,
        transactionDate: txDate,
        note: input.note?.trim(),
        referenceNo: input.referenceNo?.trim(),
        billNo: input.billNo?.trim(),
        deviceId: input.deviceId,
        idempotencyKey: input.idempotencyKey,
        status: 'POSTED',
        deletedAt: null,
      },
    });

    for (const e of entries) {
      await tx.transactionEntry.create({
        data: {
          shopId: input.shopId,
          transactionId: createdTx.id,
          accountId: e.accountId,
          debit: e.debit,
          credit: e.credit,
        },
      });
    }

    if (input.type === 'EXPENSE' && input.expenseCategoryId) {
      await tx.expense.create({
        data: {
          shopId: input.shopId,
          transactionId: createdTx.id,
          categoryId: input.expenseCategoryId,
        },
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        shopId: input.shopId,
        actorUserId: input.actorUserId,
        entityType: 'TRANSACTION',
        entityId: createdTx.id,
        action: 'CREATE',
        afterJson: JSON.stringify({
          type: createdTx.type,
          amount: createdTx.amount.toString(),
          partyType: createdTx.partyType,
          partyId: createdTx.partyId,
          paymentMode: createdTx.paymentMode,
        }),
      },
    });

    return createdTx;
  });

  // Derived balance calculation
  let balanceMinor = 0n;
  if (result.partyType === 'CUSTOMER' && result.partyId) {
    balanceMinor = await calculateCustomerBalance(input.shopId, result.partyId);
  } else if (result.partyType === 'SUPPLIER' && result.partyId) {
    balanceMinor = await calculateSupplierBalance(input.shopId, result.partyId);
  }

  return {
    transaction: result,
    balanceMinor,
    isIdempotentReplay: false,
  };
}
