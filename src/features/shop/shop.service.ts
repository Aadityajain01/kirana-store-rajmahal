import { findShopById, updateShopRecord } from './shop.repository';
import { UpdateShopInput } from './shop.schema';
import { AuthSession } from '@/lib/auth/session';
import { assertOwner } from '@/lib/permissions/guards';

export { findShopById };

export async function updateShop(session: AuthSession, input: UpdateShopInput) {
  assertOwner(session.role, 'Only the shop owner can update shop profile settings.');

  return updateShopRecord(session.shopId, {
    name: input.name.trim(),
    mobile: input.mobile.trim(),
    address: input.address?.trim() || null,
    currency: input.currency,
    timezone: input.timezone,
  });
}
