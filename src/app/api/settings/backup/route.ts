import { NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { createShopBackup } from '@/features/settings/backup.service';

export async function GET() {
  try {
    const session = await requireAuthSession();
    const backupData = await createShopBackup(session);

    return new NextResponse(
      JSON.stringify(backupData, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2
      ),
      {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="kirana_backup_${Date.now()}.json"`,
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'SERVER_ERROR', message: err.message } },
      { status: err.statusCode || 500 }
    );
  }
}
