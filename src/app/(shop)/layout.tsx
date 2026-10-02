import React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <AppShell
      shopName={session.shopName}
      userName={session.userName}
      role={session.role}
    >
      {children}
    </AppShell>
  );
}
