import { prisma } from '@/lib/db/prisma';

export async function findSyncCommand(shopId: string, idempotencyKey: string) {
  return prisma.syncCommand.findUnique({
    where: {
      shopId_idempotencyKey: {
        shopId,
        idempotencyKey,
      },
    },
  });
}

export async function recordSyncCommand(data: {
  shopId: string;
  deviceId: string;
  idempotencyKey: string;
  commandType: string;
  payloadJson: string;
  status: string;
  errorCode?: string;
}) {
  return prisma.syncCommand.create({
    data: {
      shopId: data.shopId,
      deviceId: data.deviceId,
      idempotencyKey: data.idempotencyKey,
      commandType: data.commandType,
      payloadJson: data.payloadJson,
      status: data.status,
      errorCode: data.errorCode,
      processedAt: new Date(),
    },
  });
}

export async function upsertDevice(shopId: string, userId: string, deviceKey: string, label: string) {
  return prisma.device.upsert({
    where: {
      shopId_deviceKey: {
        shopId,
        deviceKey,
      },
    },
    update: {
      lastSeenAt: new Date(),
      lastSyncAt: new Date(),
    },
    create: {
      shopId,
      userId,
      deviceKey,
      label,
      lastSeenAt: new Date(),
      lastSyncAt: new Date(),
      status: 'ACTIVE',
    },
  });
}
