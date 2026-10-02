import { z } from 'zod';

export const updateShopSchema = z.object({
  name: z.string().min(2).max(100),
  mobile: z.string().regex(/^[0-9]{10}$/),
  address: z.string().max(255).optional(),
  currency: z.string().default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;
