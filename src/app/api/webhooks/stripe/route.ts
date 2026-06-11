import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (!orderId || !userId) {
      // Session not created by our checkout — acknowledge and skip
      return NextResponse.json({ received: true });
    }

    try {
      // Guard against webhook retries: only the first event flips the order to paid
      const updated = await prisma.order.updateMany({
        where: { id: orderId, paymentStatus: "UNPAID" },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
          paymentId: (session.payment_intent as string) ?? null,
        },
      });

      if (updated.count > 0) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order) {
          await prisma.$transaction(
            order.items.map((item) =>
              prisma.product.updateMany({
                where: { id: item.productId, stock: { gte: item.quantity } },
                data: { stock: { decrement: item.quantity } },
              })
            )
          );
        }

        await prisma.cart.deleteMany({ where: { userId } });
      }
    } catch (err) {
      console.error("Stripe webhook processing failed:", err);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
