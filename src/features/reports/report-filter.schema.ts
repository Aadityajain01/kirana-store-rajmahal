import { z } from 'zod';

export const reportDateFilterSchema = z.object({
  date: z.string().optional(), // For single day report (YYYY-MM-DD)
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMode: z.string().optional(),
});

export const closeDaySchema = z.object({
  tradingDate: z.string(),
  actualCashRupees: z.coerce.number().min(0, 'Actual cash cannot be negative'),
  note: z.string().optional(),
});

export type ReportDateFilters = z.infer<typeof reportDateFilterSchema>;
export type CloseDayInput = z.infer<typeof closeDaySchema>;
