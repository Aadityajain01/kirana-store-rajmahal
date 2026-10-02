import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthSession } from '@/lib/auth/session';
import { postFinancialTransaction } from '@/features/accounting/posting.service';
import { Money } from '@/lib/money';

interface LineItemInput {
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnitRupees: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await req.json();

    const {
      customerId: inputCustomerId,
      customerName,
      customerMobile,
      items,
      note,
    } = body;

    // 1. Resolve or Create Customer
    let customer: any = null;
    if (inputCustomerId) {
      customer = await prisma.customer.findFirst({
        where: { id: inputCustomerId, shopId: session.shopId },
      });
    }

    if (!customer && customerName && customerName.trim()) {
      const cleanName = customerName.trim();
      customer = await prisma.customer.findFirst({
        where: { shopId: session.shopId, name: cleanName },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            shopId: session.shopId,
            name: cleanName,
            mobile: customerMobile?.trim() || null,
            status: 'ACTIVE',
          },
        });
      }
    }

    if (!customer) {
      return NextResponse.json(
        { error: { message: 'Customer is required / ग्राहक चुनना या नया नाम भरना अनिवार्य है' } },
        { status: 400 }
      );
    }

    // 2. Validate Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: { message: 'At least one item is required / कम से कम एक सामान जोड़ें' } },
        { status: 400 }
      );
    }

    let grandTotalPaise = 0n;
    const resolvedItems: Array<{
      productId?: string;
      productName: string;
      quantity: number;
      unit: string;
      pricePerUnit: bigint;
      totalPrice: bigint;
    }> = [];

    for (const item of items as LineItemInput[]) {
      const pName = item.productName?.trim();
      if (!pName) continue;

      const qty = Number(item.quantity) || 1;
      const unit = item.unit?.trim().toUpperCase() || 'KG';
      const pricePerUnitPaise = Money.fromRupees(Number(item.pricePerUnitRupees) || 0);
      const totalItemPaise = BigInt(Math.round(qty * Number(pricePerUnitPaise)));

      grandTotalPaise += totalItemPaise;

      // Find or auto-create Product in catalog
      let product: any = null;
      if ((prisma as any).product) {
        product = await (prisma as any).product.findFirst({
          where: { shopId: session.shopId, name: pName },
        });

        if (!product) {
          product = await (prisma as any).product.create({
            data: {
              shopId: session.shopId,
              name: pName,
              unitType: unit,
              status: 'ACTIVE',
            },
          });
        }
      }

      resolvedItems.push({
        productId: product?.id,
        productName: pName,
        quantity: qty,
        unit,
        pricePerUnit: pricePerUnitPaise,
        totalPrice: totalItemPaise,
      });
    }

    if (grandTotalPaise <= 0n) {
      return NextResponse.json(
        { error: { message: 'Total amount must be greater than zero / कुल राशि शून्य से अधिक होनी चाहिए' } },
        { status: 400 }
      );
    }

    // Generate descriptive note from items if not provided
    const itemsSummary = resolvedItems
      .map((i) => `${i.productName} (${i.quantity} ${i.unit})`)
      .join(', ');
    const finalNote = note?.trim() ? `${note.trim()} [${itemsSummary}]` : itemsSummary;

    // 3. Post Financial Transaction
    const postResult = await postFinancialTransaction({
      shopId: session.shopId,
      actorUserId: session.userId,
      type: 'SALE_CREDIT',
      partyType: 'CUSTOMER',
      partyId: customer.id,
      amountMinor: grandTotalPaise,
      paymentMode: 'OTHER',
      note: finalNote,
    });

    // 4. Save Transaction Items
    if (resolvedItems.length > 0 && (prisma as any).transactionItem) {
      await (prisma as any).transactionItem.createMany({
        data: resolvedItems.map((ri) => ({
          shopId: session.shopId,
          transactionId: postResult.transaction.id,
          productId: ri.productId,
          productName: ri.productName,
          quantity: ri.quantity,
          unit: ri.unit,
          pricePerUnit: ri.pricePerUnit,
          totalPrice: ri.totalPrice,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      transactionId: postResult.transaction.id,
      amountRupees: Money.toRupees(grandTotalPaise),
      balanceMinor: postResult.balanceMinor.toString(),
      customer: {
        id: customer.id,
        name: customer.name,
      },
    });
  } catch (err: any) {
    console.error('Credit entry error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to record credit entry' } },
      { status: 500 }
    );
  }
}
