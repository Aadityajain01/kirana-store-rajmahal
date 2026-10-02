import React from 'react';
import { requireAuthSession } from '@/lib/auth/session';
import { BackupSettings } from '@/features/settings/ui/BackupSettings';

export default async function BackupSettingsPage() {
  const session = await requireAuthSession();
  return <BackupSettings userRole={session.role} />;
}
