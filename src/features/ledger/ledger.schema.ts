import { z } from 'zod';

export const ledgerFilterSchema = z.object({
  partyId: z.string(),
  partyType: z.enum(['CUSTOMER', 'SUPPLIER']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  page: z.coerce.number().min(1).default(1),
});

export type LedgerFilterInput = z.infer<typeof ledgerFilterSchema>;
