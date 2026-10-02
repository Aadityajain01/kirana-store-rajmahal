import { z } from 'zod';

export const transactionTypeEnum = z.enum([
  'SALE_CASH',
  'SALE_CREDIT',
  'PURCHASE_CASH',
  'PURCHASE_CREDIT',
  'CUSTOMER_PAYMENT',
  'SUPPLIER_PAYMENT',
  'EXPENSE',
  'CASH_IN',
  'CASH_OUT',
  'SALE_RETURN',
  'PURCHASE_RETURN',
  'OPENING_BALANCE',
  'ADJUSTMENT',
]);

export const paymentModeEnum = z.enum(['CASH', 'UPI', 'BANK', 'CARD', 'OTHER']);
export const partyTypeEnum = z.enum(['CUSTOMER', 'SUPPLIER', 'NONE']);

export const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  partyType: partyTypeEnum.default('NONE'),
  partyId: z.string().optional().or(z.literal('')),
  amountRupees: z.coerce.number().positive('Amount must be greater than zero'),
  paymentMode: paymentModeEnum.optional(),
  transactionDate: z.string().optional(), // YYYY-MM-DD
  note: z.string().max(255).optional().or(z.literal('')),
  referenceNo: z.string().max(100).optional().or(z.literal('')),
  billNo: z.string().max(100).optional().or(z.literal('')),
  idempotencyKey: z.string().optional(),
  expenseCategoryId: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
