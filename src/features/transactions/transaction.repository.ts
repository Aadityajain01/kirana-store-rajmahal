import { prisma } from '@/lib/db/prisma';

export async function findTransactionById(shopId: string, transactionId: string) {
  return prisma.transaction.findFirst({
    where: { id: transactionId, shopId },
    include: {
      entries: {
        include: { account: true },
      },
      expense: {
        include: { category: true },
      },
    },
  });
}

export async function softDeleteTransaction(shopId: string, transactionId: string, actorUserId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { id: transactionId, shopId, deletedAt: null },
    });
    if (!existing) return null;

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        deletedAt: new Date(),
        status: 'SOFT_DELETED',
      },
    });

    await tx.auditLog.create({
      data: {
        shopId,
        actorUserId,
        entityType: 'TRANSACTION',
        entityId: transactionId,
        action: 'SOFT_DELETE',
        beforeJson: JSON.stringify(existing),
      },
    });

    return updated;
  });
}
