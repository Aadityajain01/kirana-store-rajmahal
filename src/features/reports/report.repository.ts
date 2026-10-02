import { prisma } from '@/lib/db/prisma';

export async function findTransactionsForDateRange(shopId: string, start: Date, end: Date) {
  return prisma.transaction.findMany({
    where: {
      shopId,
      status: 'POSTED',
      deletedAt: null,
      transactionDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      expense: {
        include: { category: true },
      },
    },
    orderBy: { transactionDate: 'asc' },
  });
}

export async function findCashAccountEntriesForRange(shopId: string, start: Date, end: Date) {
  const cashAccount = await prisma.account.findUnique({
    where: { shopId_code: { shopId, code: 'CASH' } },
  });
  if (!cashAccount) return [];

  return prisma.transactionEntry.findMany({
    where: {
      shopId,
      accountId: cashAccount.id,
      transaction: {
        status: 'POSTED',
        deletedAt: null,
        transactionDate: {
          gte: start,
          lte: end,
        },
      },
    },
    include: {
      transaction: true,
    },
    orderBy: { transaction: { transactionDate: 'asc' } },
  });
}
