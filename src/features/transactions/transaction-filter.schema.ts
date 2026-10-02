import { z } from 'zod';
import { transactionTypeEnum, paymentModeEnum, partyTypeEnum } from './transaction.schema';

export const transactionFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  partyType: partyTypeEnum.optional(),
  partyId: z.string().optional(),
  type: transactionTypeEnum.optional(),
  paymentMode: paymentModeEnum.optional(),
  minAmountRupees: z.coerce.number().optional(),
  maxAmountRupees: z.coerce.number().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  page: z.coerce.number().min(1).optional().default(1),
  preset: z.enum(['TODAY', 'THIS_MONTH', 'RECEIVABLE', 'PAYABLE', 'UPI_TODAY', 'LARGE_ENTRIES', 'ALL']).optional(),
});

export type TransactionFilters = z.input<typeof transactionFilterSchema>;
