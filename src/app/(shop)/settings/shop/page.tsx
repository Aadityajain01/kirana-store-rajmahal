import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { findShopById } from '@/features/shop/shop.repository';
import { ShopSettings } from '@/features/shop/ui/ShopSettings';

export default async function ShopSettingsPage() {
  const session = await requireAuthSession();
  const shop = await findShopById(session.shopId);

  return <ShopSettings shop={shop} userRole={session.role} />;
}
