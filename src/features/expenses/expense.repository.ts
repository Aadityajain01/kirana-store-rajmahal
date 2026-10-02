import { prisma } from '@/lib/db/prisma';
import type { ExpenseCategory } from '@prisma/client';

export async function findExpenseCategories(shopId: string): Promise<ExpenseCategory[]> {
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
