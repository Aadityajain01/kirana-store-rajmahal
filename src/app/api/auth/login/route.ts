import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { ensureStandardAccounts } from '@/features/accounting/accounts.repository';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.SHOP_PASSWORD || 'kirana123';

    if (!password || password.trim() !== expectedPassword.trim()) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'गलत पासवर्ड (Incorrect password). कृपया दोबारा जांचें।',
          },
        },
        { status: 401 }
      );
    }

    // Find first shop, or create default shop
    let shop = await prisma.shop.findFirst({
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    let ownerUser: any = shop?.members[0]?.user;

    if (!shop || !ownerUser) {
      return NextResponse.json(
        {
          error: {
            code: 'SHOP_NOT_FOUND',
            message: 'डेटाबेस में कोई दुकान नहीं मिली (No shop found in database). कृपया पहले सीड चलाएं।',
          },
        },
        { status: 404 }
      );
    }

    const sessionPayload = {
      userId: ownerUser.id,
      shopId: shop.id,
      role: 'OWNER',
      userName: ownerUser.name,
      shopName: shop.name,
      mobile: ownerUser.mobile,
    };

    const token = createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      token,
    });

    // 7-day persistent device cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      {
        error: {
          code: 'SERVER_ERROR',
          message: err.message || 'लॉगिन में त्रुटि हुई (Login error occurred).',
        },
      },
      { status: 500 }
    );
  }
}
