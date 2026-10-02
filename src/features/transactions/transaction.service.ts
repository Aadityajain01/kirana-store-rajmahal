import { AuthSession } from '@/lib/auth/session';
import { assertPermission, assertOwner } from '@/lib/permissions/guards';
import { postFinancialTransaction } from '@/features/accounting/posting.service';
import { findTransactionById, softDeleteTransaction } from './transaction.repository';
import { CreateTransactionInput } from './transaction.schema';
import { Money } from '@/lib/money';
import { AppError } from '@/lib/errors/app-error';

export async function createTransaction(session: AuthSession, input: CreateTransactionInput) {
  assertPermission(session.role, 'CREATE_FINANCIAL_ENTRY');

  const amountMinor = Money.fromRupees(input.amountRupees);
  const txDate = input.transactionDate ? new Date(input.transactionDate) : new Date();

  return postFinancialTransaction({
    shopId: session.shopId,
    actorUserId: session.userId,
    type: input.type,
    partyType: input.partyType,
    partyId: input.partyId || undefined,
    amountMinor,
    paymentMode: input.paymentMode,
    transactionDate: txDate,
    note: input.note,
    referenceNo: input.referenceNo,
    billNo: input.billNo,
    idempotencyKey: input.idempotencyKey,
    expenseCategoryId: input.expenseCategoryId,
  });
}

export async function recordCustomerPayment(
  session: AuthSession,
  customerId: string,
  amountRupees: number,
  paymentMode: 'CASH' | 'UPI' | 'BANK' | 'CARD' | 'OTHER' = 'CASH',
  note?: string,
  referenceNo?: string
) {
  assertPermission(session.role, 'RECORD_CUSTOMER_PAYMENT');

  return postFinancialTransaction({
    shopId: session.shopId,
    actorUserId: session.userId,
    type: 'CUSTOMER_PAYMENT',
    partyType: 'CUSTOMER',
    partyId: customerId,
    amountMinor: Money.fromRupees(amountRupees),
    paymentMode,
    note: note || 'Customer payment received / जमा किया',
    referenceNo,
  });
}

export async function recordSupplierPayment(
  session: AuthSession,
  supplierId: string,
  amountRupees: number,
  paymentMode: 'CASH' | 'UPI' | 'BANK' | 'CARD' | 'OTHER' = 'CASH',
  note?: string,
  referenceNo?: string
) {
  assertPermission(session.role, 'RECORD_SUPPLIER_PAYMENT');

  return postFinancialTransaction({
    shopId: session.shopId,
    actorUserId: session.userId,
    type: 'SUPPLIER_PAYMENT',
    partyType: 'SUPPLIER',
    partyId: supplierId,
    amountMinor: Money.fromRupees(amountRupees),
    paymentMode,
    note: note || 'Supplier payment made / भुगतान किया',
    referenceNo,
  });
}

export async function createCreditTransaction(
  session: AuthSession,
  customerId: string,
  amountRupees: number,
  note?: string,
  referenceNo?: string,
  billNo?: string
) {
  assertPermission(session.role, 'CREATE_FINANCIAL_ENTRY');

  return postFinancialTransaction({
    shopId: session.shopId,
    actorUserId: session.userId,
    type: 'SALE_CREDIT',
    partyType: 'CUSTOMER',
    partyId: customerId,
    amountMinor: Money.fromRupees(amountRupees),
    paymentMode: 'OTHER',
    note: note || 'Credit sale / उधार बिक्री',
    referenceNo,
    billNo,
  });
}

export async function getTransaction(shopId: string, transactionId: string) {
  const tx = await findTransactionById(shopId, transactionId);
  if (!tx) {
    throw new AppError({
      code: 'PARTY_NOT_FOUND',
      message: 'Transaction not found.',
      statusCode: 404,
    });
  }
  return tx;
}

export async function deleteTransaction(session: AuthSession, transactionId: string) {
  assertOwner(session.role, 'Only the shop owner can delete a transaction.');
  const deleted = await softDeleteTransaction(session.shopId, transactionId, session.userId);
  if (!deleted) {
    throw new AppError({
      code: 'PARTY_NOT_FOUND',
      message: 'Transaction not found or already deleted.',
      statusCode: 404,
    });
  }
  return deleted;
}
