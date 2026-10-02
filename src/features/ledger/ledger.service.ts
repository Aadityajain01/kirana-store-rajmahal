import { findLedgerTransactions } from './ledger.repository';
import { findCustomerById } from '@/features/khata/customers/customer.repository';
import { findSupplierById } from '@/features/khata/suppliers/supplier.repository';
import { AppError } from '@/lib/errors/app-error';

export interface LedgerEntryItem {
  id: string;
  transactionDate: Date;
  type: string;
  note: string | null;
  referenceNo: string | null;
  paymentMode: string | null;
  debitMinor: bigint;
  creditMinor: bigint;
  runningBalanceMinor: bigint;
}

export interface PartyLedgerResult {
  party: {
    id: string;
    name: string;
    mobile: string | null;
    address: string | null;
    type: 'CUSTOMER' | 'SUPPLIER';
    creditLimit?: bigint;
  };
  totalDebitMinor: bigint;
  totalCreditMinor: bigint;
  currentBalanceMinor: bigint;
  entries: LedgerEntryItem[];
}

export async function getCustomerLedger(
  shopId: string,
  customerId: string,
  options?: { dateFrom?: string; dateTo?: string }
): Promise<PartyLedgerResult> {
  const customer = await findCustomerById(shopId, customerId);
  if (!customer) {
    throw new AppError({
      code: 'PARTY_NOT_FOUND',
      message: 'Customer not found.',
      statusCode: 404,
    });
  }

  const { transactions } = await findLedgerTransactions({
    shopId,
    partyType: 'CUSTOMER',
    partyId: customerId,
    dateFrom: options?.dateFrom ? new Date(options.dateFrom) : undefined,
    dateTo: options?.dateTo ? new Date(`${options.dateTo}T23:59:59.999Z`) : undefined,
  });

  let runningBalance = 0n;
  let totalDebit = 0n;
  let totalCredit = 0n;

  const entries: LedgerEntryItem[] = [];

  for (const tx of transactions) {
    // Look at transaction entries for RECEIVABLE account
    const receivableEntry = tx.entries.find((e) => e.account.code === 'RECEIVABLE');
    const debit = receivableEntry ? receivableEntry.debit : 0n;
    const credit = receivableEntry ? receivableEntry.credit : 0n;

    totalDebit += debit;
    totalCredit += credit;
    runningBalance += (debit - credit);

    entries.push({
      id: tx.id,
      transactionDate: tx.transactionDate,
      type: tx.type,
      note: tx.note,
      referenceNo: tx.referenceNo,
      paymentMode: tx.paymentMode,
      debitMinor: debit,
      creditMinor: credit,
      runningBalanceMinor: runningBalance,
    });
  }

  return {
    party: {
      id: customer.id,
      name: customer.name,
      mobile: customer.mobile,
      address: customer.address,
      type: 'CUSTOMER',
      creditLimit: customer.creditLimit,
    },
    totalDebitMinor: totalDebit,
    totalCreditMinor: totalCredit,
    currentBalanceMinor: runningBalance,
    // Return latest entries first for convenient display, but with accurate chronological running balance
    entries: entries.reverse(),
  };
}

export async function getSupplierLedger(
  shopId: string,
  supplierId: string,
  options?: { dateFrom?: string; dateTo?: string }
): Promise<PartyLedgerResult> {
  const supplier = await findSupplierById(shopId, supplierId);
  if (!supplier) {
    throw new AppError({
      code: 'PARTY_NOT_FOUND',
      message: 'Supplier not found.',
      statusCode: 404,
    });
  }

  const { transactions } = await findLedgerTransactions({
    shopId,
    partyType: 'SUPPLIER',
    partyId: supplierId,
    dateFrom: options?.dateFrom ? new Date(options.dateFrom) : undefined,
    dateTo: options?.dateTo ? new Date(`${options.dateTo}T23:59:59.999Z`) : undefined,
  });

  let runningBalance = 0n;
  let totalDebit = 0n;
  let totalCredit = 0n;

  const entries: LedgerEntryItem[] = [];

  for (const tx of transactions) {
    // Look at transaction entries for PAYABLE account
    const payableEntry = tx.entries.find((e) => e.account.code === 'PAYABLE');
    const debit = payableEntry ? payableEntry.debit : 0n;
    const credit = payableEntry ? payableEntry.credit : 0n;

    totalDebit += debit;
    totalCredit += credit;
    runningBalance += (credit - debit);

    entries.push({
      id: tx.id,
      transactionDate: tx.transactionDate,
      type: tx.type,
      note: tx.note,
      referenceNo: tx.referenceNo,
      paymentMode: tx.paymentMode,
      debitMinor: debit,
      creditMinor: credit,
      runningBalanceMinor: runningBalance,
    });
  }

  return {
    party: {
      id: supplier.id,
      name: supplier.name,
      mobile: supplier.mobile,
      address: supplier.address,
      type: 'SUPPLIER',
    },
    totalDebitMinor: totalDebit,
    totalCreditMinor: totalCredit,
    currentBalanceMinor: runningBalance,
    entries: entries.reverse(),
  };
}
