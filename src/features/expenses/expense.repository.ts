import { prisma } from '@/lib/db/prisma';

export async function findExpenseCategories(shopId: string) {
  return prisma.expenseCategory.findMany({
    where: { shopId, status: 'ACTIVE' },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function findExpenseCategoryById(shopId: string, categoryId: string) {
  return prisma.expenseCategory.findFirst({
    where: { id: categoryId, shopId },
  });
}
