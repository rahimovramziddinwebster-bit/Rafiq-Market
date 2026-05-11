import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, address } = session.metadata!;

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

    const totalAmount = (session.amount_total ?? 0) / 100;

    await prisma.order.create({
      data: {
        userId,
        status: "PAID",
        totalAmount,
        address: JSON.parse(address),
        paymentId: session.payment_intent as string,
        items: {
          create: lineItems.data.map((item) => ({
            productId: item.description ?? "",
            quantity: item.quantity ?? 1,
            price: (item.amount_total ?? 0) / 100,
          })),
        },
      },
    });

    await prisma.cart.deleteMany({ where: { userId } });
  }

  return NextResponse.json({ received: true });
}
