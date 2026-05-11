import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ items: [] });

  const userId = (session.user as { id: string }).id;
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true, title: true, price: true, discountPrice: true,
              images: true, slug: true, stock: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  return NextResponse.json(cart ?? { items: [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { productId, variantId, quantity = 1 } = await req.json();

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId_variantId: { cartId: cart.id, productId, variantId: variantId ?? null } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { itemId } = await req.json();

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
