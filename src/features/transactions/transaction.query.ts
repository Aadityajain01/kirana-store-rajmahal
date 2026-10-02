import { prisma } from '@/lib/db/prisma';
import { TransactionFilters } from './transaction-filter.schema';
import { getTodayTradingDate, getMonthDateRange } from '@/lib/dates';
import { Money } from '@/lib/money';

export async function getTransactions(shopId: string, filters?: TransactionFilters) {
  const where: any = {
    shopId,
    deletedAt: null,
  };

  const today = getTodayTradingDate();

  // Apply presets if specified
  if (filters?.preset === 'TODAY') {
    const startOfDay = new Date(`${today}T00:00:00.000Z`);
    const endOfDay = new Date(`${today}T23:59:59.999Z`);
    where.transactionDate = { gte: startOfDay, lte: endOfDay };
  } else if (filters?.preset === 'THIS_MONTH') {
    const { dateFrom, dateTo } = getMonthDateRange();
    where.transactionDate = {
      gte: new Date(`${dateFrom}T00:00:00.000Z`),
      lte: new Date(`${dateTo}T23:59:59.999Z`),
    };
  } else if (filters?.preset === 'UPI_TODAY') {
    const startOfDay = new Date(`${today}T00:00:00.000Z`);
    const endOfDay = new Date(`${today}T23:59:59.999Z`);
    where.transactionDate = { gte: startOfDay, lte: endOfDay };
    where.paymentMode = 'UPI';
  } else if (filters?.preset === 'LARGE_ENTRIES') {
    where.amount = { gte: 500000n }; // >= ₹5,000
  }

  // Explicit date filters
  if (filters?.dateFrom || filters?.dateTo) {
    where.transactionDate = where.transactionDate || {};
    if (filters.dateFrom) where.transactionDate.gte = new Date(`${filters.dateFrom}T00:00:00.000Z`);
    if (filters.dateTo) where.transactionDate.lte = new Date(`${filters.dateTo}T23:59:59.999Z`);
  }

  if (filters?.type) where.type = filters.type;
  if (filters?.partyType) where.partyType = filters.partyType;
  if (filters?.partyId) where.partyId = filters.partyId;
  if (filters?.paymentMode) where.paymentMode = filters.paymentMode;

  if (filters?.minAmountRupees) {
    where.amount = { ...(where.amount || {}), gte: Money.fromRupees(filters.minAmountRupees) };
  }
  if (filters?.maxAmountRupees) {
    where.amount = { ...(where.amount || {}), lte: Money.fromRupees(filters.maxAmountRupees) };
  }

  if (filters?.query) {
    const q = filters.query.trim();
    where.OR = [
      { referenceNo: { contains: q } },
      { billNo: { contains: q } },
      { note: { contains: q } },
    ];
  }

  const limit = filters?.limit || 25;
  const page = filters?.page || 1;
  const skip = (page - 1) * limit;

  const [totalCount, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: {
        expense: {
          include: { category: true },
        },
      },
      orderBy: { transactionDate: 'desc' },
      take: limit,
      skip,
    }),
  ]);

  // Enrich with party names (Customer or Supplier)
  const customerIds = items.filter((i) => i.partyType === 'CUSTOMER' && i.partyId).map((i) => i.partyId!);
  const supplierIds = items.filter((i) => i.partyType === 'SUPPLIER' && i.partyId).map((i) => i.partyId!);

  const [customers, suppliers] = await Promise.all([
    customerIds.length > 0 ? prisma.customer.findMany({ where: { id: { in: customerIds } } }) : [],
    supplierIds.length > 0 ? prisma.supplier.findMany({ where: { id: { in: supplierIds } } }) : [],
  ]);

  const customerMap = new Map(customers.map((c) => [c.id, c.name]));
  const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]));

  const enrichedItems = items.map((item) => {
    let partyName = '-';
    if (item.partyType === 'CUSTOMER' && item.partyId) {
      partyName = customerMap.get(item.partyId) || 'Unknown Customer';
    } else if (item.partyType === 'SUPPLIER' && item.partyId) {
      partyName = supplierMap.get(item.partyId) || 'Unknown Supplier';
    }
    return {
      ...item,
      partyName,
    };
  });

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit) || 1,
    items: enrichedItems,
  };
}
