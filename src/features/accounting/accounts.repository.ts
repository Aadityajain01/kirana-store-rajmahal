import { prisma } from '@/lib/db/prisma';

export async function getShopAccounts(shopId: string) {
  const accounts = await prisma.account.findMany({
    where: { shopId, status: 'ACTIVE' },
  });

  const map = new Map<string, string>();
  for (const acc of accounts) {
    map.set(acc.code, acc.id);
  }
  return map;
}

export async function ensureStandardAccounts(shopId: string) {
  const standards = [
    { code: 'CASH', name: 'Cash in Hand (गल्ला/नकद)', type: 'ASSET' },
    { code: 'BANK', name: 'Bank & UPI (बैंक/UPI)', type: 'ASSET' },
    { code: 'RECEIVABLE', name: 'Customer Receivables (ग्राहक उधारी)', type: 'ASSET' },
    { code: 'PAYABLE', name: 'Supplier Payables (व्यापारी देय राशि)', type: 'LIABILITY' },
    { code: 'SALES', name: 'Sales Revenue (बिक्री)', type: 'INCOME' },
    { code: 'PURCHASES', name: 'Inventory Purchases (खरीद)', type: 'EXPENSE' },
    { code: 'EXPENSES', name: 'General Store Expenses (खर्च)', type: 'EXPENSE' },
    { code: 'OPENING_BALANCE_EQUITY', name: 'Opening Balance Equity (प्रारंभिक शेष)', type: 'EQUITY' },
  ];

  for (const s of standards) {
    await prisma.account.upsert({
      where: { shopId_code: { shopId, code: s.code } },
      update: {},
      create: {
        shopId,
        code: s.code,
        name: s.name,
        type: s.type,
      },
    });
  }

  return getShopAccounts(shopId);
}
