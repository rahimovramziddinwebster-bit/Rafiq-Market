import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, address } = await req.json();

  const lineItems = items.map((item: {
    product: { title: string; images: string[] };
    quantity: number;
    price: number;
  }) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.title,
        images: item.product.images.slice(0, 1),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/account/orders?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
    metadata: {
      userId: (session.user as { id: string }).id,
      address: JSON.stringify(address),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
