import { prisma } from '@/lib/db/prisma';

export async function findCustomers(shopId: string, query?: string) {
  return prisma.customer.findMany({
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

export async function findCustomerById(shopId: string, customerId: string) {
  return prisma.customer.findFirst({
    where: { id: customerId, shopId },
  });
}

export async function insertCustomer(data: {
  shopId: string;
  name: string;
  mobile?: string | null;
  address?: string | null;
  creditLimit: bigint;
}) {
  return prisma.customer.create({
    data: {
      shopId: data.shopId,
      name: data.name,
      mobile: data.mobile,
      address: data.address,
      creditLimit: data.creditLimit,
    },
  });
}

export async function updateCustomerRecord(
  shopId: string,
  customerId: string,
  data: {
    name?: string;
    mobile?: string | null;
    address?: string | null;
    creditLimit?: bigint;
    status?: string;
  }
) {
  return prisma.customer.update({
    where: { id: customerId },
    data,
  });
}
