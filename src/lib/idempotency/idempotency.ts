import { prisma } from '@/lib/db/prisma';

export async function checkIdempotency(shopId: string, idempotencyKey?: string | null) {
  if (!idempotencyKey) return null;

  const existingTx = await prisma.transaction.findFirst({
    where: {
      shopId,
      idempotencyKey,
      deletedAt: null,
    },
  });

  return existingTx;
}
