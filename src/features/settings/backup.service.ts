import { prisma } from '@/lib/db/prisma';
import { AuthSession } from '@/lib/auth/session';
import { assertOwner } from '@/lib/permissions/guards';

export async function createShopBackup(session: AuthSession) {
  assertOwner(session.role, 'Only the shop owner can export data backups.');

  const [shop, customers, suppliers, transactions, closings] = await Promise.all([
    prisma.shop.findUnique({ where: { id: session.shopId } }),
    prisma.customer.findMany({ where: { shopId: session.shopId } }),
    prisma.supplier.findMany({ where: { shopId: session.shopId } }),
    prisma.transaction.findMany({
      where: { shopId: session.shopId },
      include: { entries: true, expense: true },
    }),
    prisma.dailyClosing.findMany({ where: { shopId: session.shopId } }),
  ]);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    shop,
    customers,
    suppliers,
    transactions,
    closings,
  };
}
