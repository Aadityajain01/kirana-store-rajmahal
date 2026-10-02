import { prisma } from '@/lib/db/prisma';

export interface PartyBalanceResult {
  partyId: string;
  balanceMinor: bigint; // For customer: >0 is receivable. For supplier: >0 is payable.
  totalDebitMinor: bigint;
  totalCreditMinor: bigint;
}

/**
 * Calculates customer balance strictly from posted ledger entries.
 * Customer Receivable: Debits to RECEIVABLE account increase due, Credits decrease due.
 */
export async function calculateCustomerBalance(shopId: string, customerId: string): Promise<bigint> {
  const receivableAccount = await prisma.account.findUnique({
    where: { shopId_code: { shopId, code: 'RECEIVABLE' } },
  });

  if (!receivableAccount) return 0n;

  // MongoDB native: query customer transactions then aggregate entries
  const customerTxs = await prisma.transaction.findMany({
    where: {
      shopId,
      partyType: 'CUSTOMER',
      partyId: customerId,
      status: 'POSTED',
      deletedAt: null,
    },
    select: { id: true },
  });

  if (customerTxs.length === 0) return 0n;
  const txIds = customerTxs.map((t) => t.id);

  const entries = await prisma.transactionEntry.findMany({
    where: {
      shopId,
      accountId: receivableAccount.id,
      transactionId: { in: txIds },
    },
    select: { debit: true, credit: true },
  });

  let balance = 0n;
  for (const e of entries) {
    balance += (e.debit - e.credit);
  }
  return balance;
}

/**
 * Calculates supplier balance strictly from posted ledger entries.
 * Supplier Payable: Credits to PAYABLE account increase what shop owes, Debits decrease what shop owes.
 */
export async function calculateSupplierBalance(shopId: string, supplierId: string): Promise<bigint> {
  const payableAccount = await prisma.account.findUnique({
    where: { shopId_code: { shopId, code: 'PAYABLE' } },
  });

  if (!payableAccount) return 0n;

  const supplierTxs = await prisma.transaction.findMany({
    where: {
      shopId,
      partyType: 'SUPPLIER',
      partyId: supplierId,
      status: 'POSTED',
      deletedAt: null,
    },
    select: { id: true },
  });

  if (supplierTxs.length === 0) return 0n;
  const txIds = supplierTxs.map((t) => t.id);

  const entries = await prisma.transactionEntry.findMany({
    where: {
      shopId,
      accountId: payableAccount.id,
      transactionId: { in: txIds },
    },
    select: { debit: true, credit: true },
  });

  let balance = 0n;
  for (const e of entries) {
    balance += (e.credit - e.debit);
  }
  return balance;
}

/**
 * Calculates total cash in hand balance: debits - credits to CASH account.
 */
export async function calculateCashBalance(shopId: string): Promise<bigint> {
  const cashAccount = await prisma.account.findUnique({
    where: { shopId_code: { shopId, code: 'CASH' } },
  });

  if (!cashAccount) return 0n;

  const entries = await prisma.transactionEntry.findMany({
    where: {
      shopId,
      accountId: cashAccount.id,
    },
    select: { debit: true, credit: true },
  });

  let balance = 0n;
  for (const e of entries) {
    balance += (e.debit - e.credit);
  }
  return balance;
}

/**
 * Calculates total bank balance: debits - credits to BANK account.
 */
export async function calculateBankBalance(shopId: string): Promise<bigint> {
  const bankAccount = await prisma.account.findUnique({
    where: { shopId_code: { shopId, code: 'BANK' } },
  });

  if (!bankAccount) return 0n;

  const entries = await prisma.transactionEntry.findMany({
    where: {
      shopId,
      accountId: bankAccount.id,
    },
    select: { debit: true, credit: true },
  });

  let balance = 0n;
  for (const e of entries) {
    balance += (e.debit - e.credit);
  }
  return balance;
}
