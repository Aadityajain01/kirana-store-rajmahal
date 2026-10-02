import { prisma } from '@/lib/db/prisma';

export async function findSuppliers(shopId: string, query?: string) {
  return prisma.supplier.findMany({
    where: {
      shopId,
      status: 'ACTIVE',
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { mobile: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { name: 'asc' },
  });
}

export async function findSupplierById(shopId: string, supplierId: string) {
  return prisma.supplier.findFirst({
    where: { id: supplierId, shopId },
  });
}

export async function insertSupplier(data: {
  shopId: string;
  name: string;
  mobile?: string | null;
  address?: string | null;
}) {
  return prisma.supplier.create({
    data: {
      shopId: data.shopId,
      name: data.name,
      mobile: data.mobile,
      address: data.address,
    },
  });
}

export async function updateSupplierRecord(
  shopId: string,
  supplierId: string,
  data: {
    name?: string;
    mobile?: string | null;
    address?: string | null;
    status?: string;
  }
) {
  return prisma.supplier.update({
    where: { id: supplierId },
    data,
  });
}
