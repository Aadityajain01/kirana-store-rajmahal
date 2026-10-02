import { z } from 'zod';

export const syncCommandTypeEnum = z.enum([
  'CREATE_CUSTOMER',
  'CREATE_SUPPLIER',
  'CUSTOMER_CREDIT',
  'CUSTOMER_PAYMENT',
  'SUPPLIER_PAYMENT',
  'EXPENSE',
]);

export const syncCommandItemSchema = z.object({
  idempotencyKey: z.string().min(10),
  commandType: syncCommandTypeEnum,
  payload: z.record(z.any()),
  clientCreatedAt: z.string(),
});

export const syncPushSchema = z.object({
  deviceId: z.string(),
  commands: z.array(syncCommandItemSchema),
});

export const syncPullSchema = z.object({
  deviceId: z.string(),
  cursor: z.string().optional(),
});

export type SyncCommandItem = z.infer<typeof syncCommandItemSchema>;
export type SyncPushInput = z.infer<typeof syncPushSchema>;
