import { AuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { findSyncCommand, recordSyncCommand, upsertDevice } from './sync.repository';
import { SyncPushInput } from './sync.schema';
import { createCustomer } from '@/features/khata/customers/customer.service';
import { createSupplier } from '@/features/khata/suppliers/supplier.service';
import {
  createCreditTransaction,
  recordCustomerPayment,
  recordSupplierPayment,
} from '@/features/transactions/transaction.service';
import { recordExpense } from '@/features/expenses/expense.service';
import { logger } from '@/lib/logging/logger';

export interface SyncAckItem {
  idempotencyKey: string;
  status: 'SYNCED' | 'SYNC_FAILED' | 'DUPLICATE' | 'CONFLICT';
  entityId?: string;
  error?: string;
}

export async function processSyncPush(session: AuthSession, input: SyncPushInput) {
  await upsertDevice(session.shopId, session.userId, input.deviceId, 'Mobile/Browser Client');

  const acks: SyncAckItem[] = [];

  for (const cmd of input.commands) {
    const existing = await findSyncCommand(session.shopId, cmd.idempotencyKey);
    if (existing) {
      acks.push({
        idempotencyKey: cmd.idempotencyKey,
        status: 'DUPLICATE',
      });
      continue;
    }

    try {
      let entityId: string | undefined;

      switch (cmd.commandType) {
        case 'CREATE_CUSTOMER': {
          const cust = await createCustomer(session, {
            name: cmd.payload.name,
            mobile: cmd.payload.mobile,
            address: cmd.payload.address,
            creditLimitRupees: cmd.payload.creditLimitRupees,
            openingBalanceRupees: cmd.payload.openingBalanceRupees,
          });
          entityId = cust.id;
          break;
        }

        case 'CREATE_SUPPLIER': {
          const supp = await createSupplier(session, {
            name: cmd.payload.name,
            mobile: cmd.payload.mobile,
            address: cmd.payload.address,
            openingBalanceRupees: cmd.payload.openingBalanceRupees,
          });
          entityId = supp.id;
          break;
        }

        case 'CUSTOMER_CREDIT': {
          const res = await createCreditTransaction(
            session,
            cmd.payload.customerId,
            cmd.payload.amountRupees,
            cmd.payload.note,
            cmd.payload.referenceNo,
            cmd.payload.billNo
          );
          entityId = res.transaction.id;
          break;
        }

        case 'CUSTOMER_PAYMENT': {
          const res = await recordCustomerPayment(
            session,
            cmd.payload.customerId,
            cmd.payload.amountRupees,
            cmd.payload.paymentMode || 'CASH',
            cmd.payload.note,
            cmd.payload.referenceNo
          );
          entityId = res.transaction.id;
          break;
        }

        case 'SUPPLIER_PAYMENT': {
          const res = await recordSupplierPayment(
            session,
            cmd.payload.supplierId,
            cmd.payload.amountRupees,
            cmd.payload.paymentMode || 'CASH',
            cmd.payload.note,
            cmd.payload.referenceNo
          );
          entityId = res.transaction.id;
          break;
        }

        case 'EXPENSE': {
          const res = await recordExpense(session, {
            categoryId: cmd.payload.categoryId,
            amountRupees: cmd.payload.amountRupees,
            paymentMode: cmd.payload.paymentMode || 'CASH',
            note: cmd.payload.note,
            expenseDate: cmd.payload.expenseDate,
          });
          entityId = res.transaction.id;
          break;
        }

        default:
          throw new Error(`Unsupported sync command: ${cmd.commandType}`);
      }

      await recordSyncCommand({
        shopId: session.shopId,
        deviceId: input.deviceId,
        idempotencyKey: cmd.idempotencyKey,
        commandType: cmd.commandType,
        payloadJson: JSON.stringify(cmd.payload),
        status: 'SYNCED',
      });

      acks.push({
        idempotencyKey: cmd.idempotencyKey,
        status: 'SYNCED',
        entityId,
      });
    } catch (err: any) {
      logger.error('Sync command failed', {
        commandType: cmd.commandType,
        idempotencyKey: cmd.idempotencyKey,
        error: err.message,
      });

      await recordSyncCommand({
        shopId: session.shopId,
        deviceId: input.deviceId,
        idempotencyKey: cmd.idempotencyKey,
        commandType: cmd.commandType,
        payloadJson: JSON.stringify(cmd.payload),
        status: 'SYNC_FAILED',
        errorCode: err.code || 'SERVER_ERROR',
      });

      acks.push({
        idempotencyKey: cmd.idempotencyKey,
        status: 'SYNC_FAILED',
        error: err.message,
      });
    }
  }

  return { acks };
}

export async function processSyncPull(session: AuthSession, cursor?: string) {
  const sinceDate = cursor ? new Date(cursor) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [customers, suppliers, transactions] = await Promise.all([
    prisma.customer.findMany({
      where: { shopId: session.shopId, updatedAt: { gte: sinceDate } },
    }),
    prisma.supplier.findMany({
      where: { shopId: session.shopId, updatedAt: { gte: sinceDate } },
    }),
    prisma.transaction.findMany({
      where: { shopId: session.shopId, updatedAt: { gte: sinceDate }, deletedAt: null },
      orderBy: { updatedAt: 'asc' },
    }),
  ]);

  return {
    cursor: new Date().toISOString(),
    customers,
    suppliers,
    transactions,
  };
}
