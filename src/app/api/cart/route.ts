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
  const body = await req.json().catch(() => ({}));
  const { productId, variantId } = body as { productId?: string; variantId?: string };
  const quantity = Number.isInteger(body.quantity) && body.quantity > 0 ? body.quantity : 1;

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const variant = variantId ? product.variants.find((v) => v.id === variantId) : undefined;
  if (variantId && !variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }
  const available = variant ? variant.stock : product.stock;
  if (available <= 0) {
    return NextResponse.json({ error: "Out of stock" }, { status: 409 });
  }

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId: variantId ?? null },
  });

  const newQuantity = Math.min((existing?.quantity ?? 0) + quantity, available);

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity: newQuantity },
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

  // Only allow deleting items that belong to this user's cart
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  return NextResponse.json({ success: true });
}
