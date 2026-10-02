import { prisma } from '@/lib/db/prisma';

export async function findDailyClosing(shopId: string, tradingDate: string) {
  return prisma.dailyClosing.findUnique({
    where: {
      shopId_tradingDate: {
        shopId,
        tradingDate,
      },
    },
  });
}

export async function findLatestClosingBefore(shopId: string, tradingDate: string) {
  return prisma.dailyClosing.findFirst({
    where: {
      shopId,
      tradingDate: { lt: tradingDate },
    },
    orderBy: { tradingDate: 'desc' },
  });
}

export async function createDailyClosing(data: {
  shopId: string;
  tradingDate: string;
  openingCash: bigint;
  expectedCash: bigint;
  actualCash: bigint;
  difference: bigint;
  closedBy: string;
}) {
  return prisma.dailyClosing.create({
    data: {
      shopId: data.shopId,
      tradingDate: data.tradingDate,
      openingCash: data.openingCash,
      expectedCash: data.expectedCash,
      actualCash: data.actualCash,
      difference: data.difference,
      closedBy: data.closedBy,
    },
  });
}

export async function reopenDailyClosing(shopId: string, tradingDate: string, reopenedBy: string) {
  return prisma.dailyClosing.update({
    where: {
      shopId_tradingDate: {
        shopId,
        tradingDate,
      },
    },
    data: {
      isReopened: true,
      reopenedBy,
      reopenedAt: new Date(),
    },
  });
}
