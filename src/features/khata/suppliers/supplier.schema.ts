import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be a valid 10-digit number').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  openingBalanceRupees: z.coerce.number().default(0), // Amount shop owes supplier
});

export const updateSupplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be a valid 10-digit number').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
