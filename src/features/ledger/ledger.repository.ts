import { prisma } from '@/lib/db/prisma';

export async function findLedgerTransactions(options: {
  shopId: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  partyId: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  skip?: number;
}) {
  const whereClause: any = {
    shopId: options.shopId,
    partyType: options.partyType,
    partyId: options.partyId,
    status: 'POSTED',
    deletedAt: null,
  };

  if (options.dateFrom || options.dateTo) {
    whereClause.transactionDate = {};
    if (options.dateFrom) whereClause.transactionDate.gte = options.dateFrom;
    if (options.dateTo) whereClause.transactionDate.lte = options.dateTo;
  }

  const [totalCount, transactions] = await Promise.all([
    prisma.transaction.count({ where: whereClause }),
    prisma.transaction.findMany({
      where: whereClause,
      include: {
        entries: {
          include: { account: true },
        },
      },
      orderBy: { transactionDate: 'asc' },
    }),
  ]);

  return { totalCount, transactions };
}
