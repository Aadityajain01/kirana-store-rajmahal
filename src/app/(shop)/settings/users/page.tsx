import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { getShopMembers } from '@/features/users/user.service';
import { UserManagement } from '@/features/users/ui/UserManagement';

export default async function UserManagementPage() {
  const session = await requireAuthSession();
  const members = await getShopMembers(session.shopId);

  return <UserManagement members={members} userRole={session.role} />;
}
