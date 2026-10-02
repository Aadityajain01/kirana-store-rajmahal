import { z } from 'zod';

export const addMemberSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().regex(/^[0-9]{10}$/),
  role: z.enum(['OWNER', 'EMPLOYEE', 'ACCOUNTANT']),
});

export const updateRoleSchema = z.object({
  role: z.enum(['OWNER', 'EMPLOYEE', 'ACCOUNTANT']),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
