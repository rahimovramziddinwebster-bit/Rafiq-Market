import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { id: string; role?: string };
  const { id } = await params;
  const { status } = await req.json().catch(() => ({}));

  if (!status || !Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // A seller may only update orders containing products from their own store
  if (user.role !== "ADMIN") {
    const ownsOrderItems = await prisma.orderItem.findFirst({
      where: {
        orderId: id,
        product: { store: { ownerId: user.id } },
      },
      select: { id: true },
    });
    if (!ownsOrderItems) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(order);
}
