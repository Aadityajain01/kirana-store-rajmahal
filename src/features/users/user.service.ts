import { prisma } from '@/lib/db/prisma';
import { AuthSession } from '@/lib/auth/session';
import { assertOwner } from '@/lib/permissions/guards';
import { AddMemberInput, UpdateRoleInput } from './user.schema';

export async function getShopMembers(shopId: string) {
  return prisma.shopMember.findMany({
    where: { shopId },
    include: { user: true },
    orderBy: { role: 'asc' },
  });
}

export async function addShopMember(session: AuthSession, input: AddMemberInput) {
  assertOwner(session.role, 'Only the shop owner can add team members.');

  const user = await prisma.user.upsert({
    where: { mobile: input.mobile },
    update: { name: input.name },
    create: {
      name: input.name,
      mobile: input.mobile,
      status: 'ACTIVE',
    },
  });

  return prisma.shopMember.upsert({
    where: {
      shopId_userId: {
        shopId: session.shopId,
        userId: user.id,
      },
    },
    update: {
      role: input.role,
      status: 'ACTIVE',
    },
    create: {
      shopId: session.shopId,
      userId: user.id,
      role: input.role,
      status: 'ACTIVE',
    },
    include: { user: true },
  });
}

export async function updateMemberRole(session: AuthSession, memberId: string, input: UpdateRoleInput) {
  assertOwner(session.role, 'Only the shop owner can change member roles.');

  return prisma.shopMember.update({
    where: { id: memberId },
    data: {
      role: input.role,
      status: input.status,
    },
    include: { user: true },
  });
}
