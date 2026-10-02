import { AuthSession } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guards';
import { postFinancialTransaction } from '@/features/accounting/posting.service';
import { findExpenseCategories, findExpenseCategoryById } from './expense.repository';
import { CreateExpenseInput } from './expense.schema';
import { Money } from '@/lib/money';
import { AppError } from '@/lib/errors/app-error';
import type { ExpenseCategory } from '@prisma/client';

export async function getCategories(shopId: string): Promise<ExpenseCategory[]> {
  return findExpenseCategories(shopId);
}

export async function recordExpense(session: AuthSession, input: CreateExpenseInput) {
  assertPermission(session.role, 'RECORD_EXPENSE');

  const category = await findExpenseCategoryById(session.shopId, input.categoryId);
  if (!category) {
    throw new AppError({
      code: 'CATEGORY_NOT_FOUND',
      message: 'Expense category not found.',
      statusCode: 404,
    });
  }

  const amountMinor = Money.fromRupees(input.amountRupees);
  const txDate = input.expenseDate ? new Date(input.expenseDate) : new Date();

  return postFinancialTransaction({
    shopId: session.shopId,
    actorUserId: session.userId,
    type: 'EXPENSE',
    partyType: 'NONE',
    amountMinor,
    paymentMode: input.paymentMode,
    transactionDate: txDate,
    note: `${category.name}: ${input.note || ''}`.trim(),
    expenseCategoryId: category.id,
  });
}
