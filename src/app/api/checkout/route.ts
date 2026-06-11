import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
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
    zip: z.string().min(1),
  }),
});

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { items, address } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
    include: { variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Prices and stock are resolved from the database — client values are never trusted
  const resolved = [];
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
    const available = variant ? variant.stock : product.stock;
    if (item.quantity > available) {
      return NextResponse.json(
        { error: "Insufficient stock", productId: product.id, available },
        { status: 409 }
      );
    }
    const price = (product.discountPrice ?? product.price) + (variant?.priceModifier ?? 0);
    resolved.push({ product, variant, quantity: item.quantity, price });
  }

  const subtotal = resolved.reduce((sum, r) => sum + r.price * r.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const totalAmount = subtotal + shipping;

  // Create the order up front so the webhook can mark it paid without
  // reconstructing items from Stripe line items
  const order = await prisma.order.create({
    data: {
      userId,
      status: "PENDING",
      paymentStatus: "UNPAID",
      totalAmount,
      address,
      items: {
        create: resolved.map((r) => ({
          productId: r.product.id,
          quantity: r.quantity,
          price: r.price,
        })),
      },
    },
  });

  const lineItems = resolved.map((r) => ({
    price_data: {
      currency: "usd" as const,
      product_data: {
        name: r.variant ? `${r.product.title} (${r.variant.value})` : r.product.title,
        images: r.product.images.slice(0, 1).filter((img) => img.startsWith("http")),
      },
      unit_amount: Math.round(r.price * 100),
    },
    quantity: r.quantity,
  }));

  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "usd" as const,
        product_data: { name: "Shipping", images: [] },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/account/orders?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
    metadata: {
      orderId: order.id,
      userId,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
