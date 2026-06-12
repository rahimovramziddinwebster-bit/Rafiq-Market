import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional().nullable(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
  address: z.object({
    city: z.string().min(1),
    street: z.string().min(1),
    zip: z.string().optional(),
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, images: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { items, address } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
    include: { variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Prices come from the database — the client total is never trusted
  const resolved: Array<{
    product: (typeof products)[number];
    variant: (typeof products)[number]["variants"][number] | undefined;
    quantity: number;
    price: number;
  }> = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 400 });
    }
    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : undefined;
    if (item.variantId && !variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 400 });
    }
    const price = (product.discountPrice ?? product.price) + (variant?.priceModifier ?? 0);
    resolved.push({ product, variant, quantity: item.quantity, price });
  }

  const subtotal = resolved.reduce((sum, r) => sum + r.price * r.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const totalAmount = subtotal + shipping;

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const r of resolved) {
        const res = await tx.product.updateMany({
          where: { id: r.product.id, stock: { gte: r.quantity } },
          data: { stock: { decrement: r.quantity } },
        });
        if (res.count === 0) throw new Error("INSUFFICIENT_STOCK");
        if (r.variant) {
          await tx.productVariant.updateMany({
            where: { id: r.variant.id, stock: { gte: r.quantity } },
            data: { stock: { decrement: r.quantity } },
          });
        }
      }

      return tx.order.create({
        data: {
          userId,
          address,
          totalAmount,
          items: {
            create: resolved.map((r) => ({
              productId: r.product.id,
              quantity: r.quantity,
              price: r.price,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 409 });
    }
    throw err;
  }
}
