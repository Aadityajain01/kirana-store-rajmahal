import { findSuppliers, findSupplierById, insertSupplier, updateSupplierRecord } from './supplier.repository';
import { CreateSupplierInput, UpdateSupplierInput } from './supplier.schema';
import { calculateSupplierBalance } from '@/features/accounting/balance.calculator';
import { postFinancialTransaction } from '@/features/accounting/posting.service';
import { Money } from '@/lib/money';
import { AuthSession } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guards';
import { AppError } from '@/lib/errors/app-error';

export interface SupplierWithBalance {
  id: string;
  name: string;
  mobile: string | null;
  address: string | null;
  balanceMinor: bigint; // Payable: > 0 means shop owes money to supplier
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getSuppliers(
  shopId: string,
  filter?: { query?: string; preset?: 'ALL' | 'PAYABLE' | 'ZERO' }
): Promise<SupplierWithBalance[]> {
  const suppliers = await findSuppliers(shopId, filter?.query);

  const list: SupplierWithBalance[] = [];
  for (const s of suppliers) {
    const balanceMinor = await calculateSupplierBalance(shopId, s.id);

    if (filter?.preset === 'PAYABLE' && balanceMinor <= 0n) continue;
    if (filter?.preset === 'ZERO' && balanceMinor !== 0n) continue;

    list.push({
      ...s,
      balanceMinor,
    });
  }

  // Sort by highest payable balance first
  list.sort((a, b) => {
    if (b.balanceMinor !== a.balanceMinor) {
      return b.balanceMinor > a.balanceMinor ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  return list;
}

export async function getSupplier(shopId: string, supplierId: string) {
  const supplier = await findSupplierById(shopId, supplierId);
  if (!supplier) {
    throw new AppError({
      code: 'PARTY_NOT_FOUND',
      message: 'Supplier not found.',
      statusCode: 404,
    });
  }

  const balanceMinor = await calculateSupplierBalance(shopId, supplierId);
  return {
    ...supplier,
    balanceMinor,
  };
}

export async function createSupplier(session: AuthSession, input: CreateSupplierInput) {
  assertPermission(session.role, 'CREATE_PARTY');

  const supplier = await insertSupplier({
    shopId: session.shopId,
    name: input.name.trim(),
    mobile: input.mobile?.trim() || null,
    address: input.address?.trim() || null,
  });

  if (input.openingBalanceRupees && input.openingBalanceRupees !== 0) {
    const openingAmt = Money.fromRupees(Math.abs(input.openingBalanceRupees));
    await postFinancialTransaction({
      shopId: session.shopId,
      actorUserId: session.userId,
      type: 'OPENING_BALANCE',
      partyType: 'SUPPLIER',
      partyId: supplier.id,
      amountMinor: openingAmt,
      paymentMode: 'OTHER',
      note: 'Opening supplier balance / पिछला बाकी',
    });
  }

  return supplier;
}

export async function updateSupplier(
  session: AuthSession,
  supplierId: string,
  input: UpdateSupplierInput
) {
  assertPermission(session.role, 'CREATE_PARTY');

  const supplier = await findSupplierById(session.shopId, supplierId);
  if (!supplier) {
    throw new AppError({
      code: 'PARTY_NOT_FOUND',
      message: 'Supplier not found.',
      statusCode: 404,
    });
  }

  const updated = await updateSupplierRecord(session.shopId, supplierId, {
    ...(input.name ? { name: input.name.trim() } : {}),
    ...(input.mobile !== undefined ? { mobile: input.mobile ? input.mobile.trim() : null } : {}),
    ...(input.address !== undefined ? { address: input.address ? input.address.trim() : null } : {}),
    ...(input.status ? { status: input.status } : {}),
  });

  return updated;
}
