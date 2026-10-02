import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await requireAuthSession();
    const shop = await prisma.shop.findUnique({
      where: { id: session.shopId },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    return NextResponse.json({
      success: true,
      shop: {
        id: shop?.id,
        name: shop?.name,
        mobile: shop?.mobile,
        address: shop?.address,
      },
      user: {
        id: user?.id || session.userId,
        name: user?.name || session.userName,
        mobile: user?.mobile || session.mobile,
        role: session.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch shop details' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();

    const { shopName, ownerName, mobile, address } = body;

    if (shopName) {
      await prisma.shop.update({
        where: { id: session.shopId },
        data: {
          name: shopName.trim(),
          ...(address !== undefined ? { address: address ? address.trim() : null } : {}),
          ...(mobile ? { mobile: mobile.trim() } : {}),
        },
      });
    }

    if (ownerName || mobile) {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          ...(ownerName ? { name: ownerName.trim() } : {}),
          ...(mobile ? { mobile: mobile.trim() } : {}),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Details updated successfully' });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to update details' } },
      { status: 500 }
    );
  }
}
