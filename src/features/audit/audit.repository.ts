import { prisma } from '@/lib/db/prisma';

export async function findAuditLogs(shopId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { shopId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
