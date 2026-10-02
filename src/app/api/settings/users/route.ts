import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { addShopMember, updateMemberRole } from '@/features/users/user.service';
import { addMemberSchema } from '@/features/users/user.schema';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();
    const validated = addMemberSchema.parse(body);

    const member = await addShopMember(session, validated);
    return NextResponse.json({ success: true, member });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'SERVER_ERROR', message: err.message } },
      { status: err.statusCode || 500 }
    );
  }
}
