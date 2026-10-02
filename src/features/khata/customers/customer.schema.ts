import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be a valid 10-digit number').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  creditLimitRupees: z.coerce.number().min(0).default(0),
  openingBalanceRupees: z.coerce.number().default(0),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be a valid 10-digit number').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  creditLimitRupees: z.coerce.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
