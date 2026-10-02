import { PrismaClient } from '@prisma/client';

// Enable seamless JSON serialization of BigInt values in Next.js API routes
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
