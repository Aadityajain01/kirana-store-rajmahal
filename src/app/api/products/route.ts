import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    const where: any = {
      shopId: session.shopId,
      status: 'ACTIVE',
    };

    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 100,
    });

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch products from database' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { name, unitType } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: { message: 'Product name is required' } },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const validUnit = unitType ? unitType.trim().toUpperCase() : 'KG';

    // Check if product already exists
    let product = await prisma.product.findFirst({
      where: {
        shopId: session.shopId,
        name: cleanName,
      },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          shopId: session.shopId,
          name: cleanName,
          unitType: validUnit,
          status: 'ACTIVE',
        },
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create product' } },
      { status: 500 }
    );
  }
}
