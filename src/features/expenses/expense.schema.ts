import { z } from 'zod';
import { paymentModeEnum } from '@/features/transactions/transaction.schema';

export const createExpenseSchema = z.object({
  categoryId: z.string().min(1, 'Please select an expense category'),
  amountRupees: z.coerce.number().positive('Amount must be greater than zero'),
  paymentMode: paymentModeEnum.default('CASH'),
  expenseDate: z.string().optional(),
  note: z.string().max(255).optional().or(z.literal('')),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
