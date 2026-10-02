import { findCustomers, findCustomerById, insertCustomer, updateCustomerRecord } from './customer.repository';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.schema';
import { calculateCustomerBalance } from '@/features/accounting/balance.calculator';
import { postFinancialTransaction } from '@/features/accounting/posting.service';
import { Money } from '@/lib/money';
import { AuthSession } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guards';
import { AppError } from '@/lib/errors/app-error';

export interface CustomerWithBalance {
  id: string;
  name: string;
  mobile: string | null;
  address: string | null;
  creditLimit: bigint;
  balanceMinor: bigint;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCustomers(
  shopId: string,
  filter?: { query?: string; preset?: 'ALL' | 'RECEIVABLE' | 'ZERO' | 'OVER_LIMIT' }
): Promise<CustomerWithBalance[]> {
  const customers = await findCustomers(shopId, filter?.query);

  const list: CustomerWithBalance[] = [];
  for (const c of customers) {
    const balanceMinor = await calculateCustomerBalance(shopId, c.id);

    if (filter?.preset === 'RECEIVABLE' && balanceMinor <= 0n) continue;
    if (filter?.preset === 'ZERO' && balanceMinor !== 0n) continue;
    if (filter?.preset === 'OVER_LIMIT' && (c.creditLimit === 0n || balanceMinor <= c.creditLimit)) continue;

    list.push({
      ...c,
      balanceMinor,
    });
  }

  // Sort by highest receivable balance first, then name
  list.sort((a, b) => {
    if (b.balanceMinor !== a.balanceMinor) {
      return b.balanceMinor > a.balanceMinor ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  return list;
}

export async function getCustomer(shopId: string, customerId: string) {
  const customer = await findCustomerById(shopId, customerId);
  if (!customer) {
    throw new AppError({
      code: 'PARTY_NOT_FOUND',
      message: 'Customer not found.',
      statusCode: 404,
    });
  }

  const balanceMinor = await calculateCustomerBalance(shopId, customerId);
  return {
    ...customer,
    balanceMinor,
  };
}

export async function createCustomer(session: AuthSession, input: CreateCustomerInput) {
  assertPermission(session.role, 'CREATE_PARTY');

  const creditLimit = Money.fromRupees(input.creditLimitRupees || 0);

  const customer = await insertCustomer({
    shopId: session.shopId,
    name: input.name.trim(),
    mobile: input.mobile?.trim() || null,
    address: input.address?.trim() || null,
    creditLimit,
  });

  // If opening balance entered, post as an initial accounting entry
  if (input.openingBalanceRupees && input.openingBalanceRupees !== 0) {
    const openingAmt = Money.fromRupees(Math.abs(input.openingBalanceRupees));
    await postFinancialTransaction({
      shopId: session.shopId,
      actorUserId: session.userId,
      type: 'OPENING_BALANCE',
      partyType: 'CUSTOMER',
      partyId: customer.id,
      amountMinor: openingAmt,
      paymentMode: 'OTHER',
      note: 'Opening balance / पिछला बाकी',
    });
  }

  return customer;
}

export async function updateCustomer(
  session: AuthSession,
  customerId: string,
  input: UpdateCustomerInput
) {
  assertPermission(session.role, 'CREATE_PARTY');

  const customer = await findCustomerById(session.shopId, customerId);
  if (!customer) {
    throw new AppError({
      code: 'PARTY_NOT_FOUND',
      message: 'Customer not found.',
      statusCode: 404,
    });
  }

  const updated = await updateCustomerRecord(session.shopId, customerId, {
    ...(input.name ? { name: input.name.trim() } : {}),
    ...(input.mobile !== undefined ? { mobile: input.mobile ? input.mobile.trim() : null } : {}),
    ...(input.address !== undefined ? { address: input.address ? input.address.trim() : null } : {}),
    ...(input.creditLimitRupees !== undefined
      ? { creditLimit: Money.fromRupees(input.creditLimitRupees) }
      : {}),
    ...(input.status ? { status: input.status } : {}),
  });

  return updated;
}
