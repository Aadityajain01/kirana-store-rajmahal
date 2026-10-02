import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyOTP } from '@/lib/auth/otp';
import { createSessionToken } from '@/lib/auth/session';
import { ensureStandardAccounts } from '@/features/accounting/accounts.repository';

export async function POST(req: NextRequest) {
  try {
    const { mobile, otp, name } = await req.json();

    if (!mobile || !otp) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Mobile number and OTP are required.',
            requestId: `req_${Date.now()}`,
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    const isValid = verifyOTP(mobile, otp);
    if (!isValid) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid or expired OTP. (Default test OTP is 123456)',
            requestId: `req_${Date.now()}`,
            retryable: true,
          },
        },
        { status: 400 }
      );
    }

    // Find or create User
    let user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          mobile,
          name: name || 'Kirana Store Owner',
          status: 'ACTIVE',
        },
      });
    }

    // Find or create Shop membership
    let member = await prisma.shopMember.findFirst({
      where: { userId: user.id },
      include: { shop: true },
    });

    let shop: any = member?.shop;

    if (!shop) {
      // Find default shop or create one for new user
      shop = await prisma.shop.findFirst();
      if (!shop) {
        shop = await prisma.shop.create({
          data: {
            name: `${user.name}'s Kirana Store`,
            ownerUserId: user.id,
            mobile: user.mobile,
            currency: 'INR',
            timezone: 'Asia/Kolkata',
          },
        });
      }

      member = await prisma.shopMember.create({
        data: {
          shopId: shop.id,
          userId: user.id,
          role: 'OWNER',
          status: 'ACTIVE',
        },
        include: { shop: true },
      });

      await ensureStandardAccounts(shop.id);
    }

    const sessionPayload = {
      userId: user.id,
      shopId: shop.id,
      role: member?.role || 'OWNER',
      userName: user.name,
      shopName: shop.name,
      mobile: user.mobile,
    };

    const token = createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set('kirana_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: 'SERVER_ERROR',
          message: err.message || 'OTP verification failed.',
          requestId: `req_${Date.now()}`,
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
