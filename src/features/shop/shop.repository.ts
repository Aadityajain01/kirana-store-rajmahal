import { prisma } from '@/lib/db/prisma';

export async function findShopById(shopId: string) {
  return prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      members: {
        include: { user: true },
      },
    },
  });
}

export async function updateShopRecord(
  shopId: string,
  data: {
    name: string;
    mobile: string;
    address?: string | null;
    currency: string;
    timezone: string;
  }
) {
  return prisma.shop.update({
    where: { id: shopId },
    data,
  });
}
