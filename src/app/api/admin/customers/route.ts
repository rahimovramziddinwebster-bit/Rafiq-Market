import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const customers = await prisma.user.findMany({
    where: { role: "BUYER" },
    include: {
      orders: {
        select: {
          id: true,
          totalAmount: true,
          paymentStatus: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = customers.map((u) => {
    const totalOrders = u.orders.length;
    const totalAmount = u.orders.reduce((s, o) => s + o.totalAmount, 0);
    const paidAmount = u.orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((s, o) => s + o.totalAmount, 0);
    const unpaidAmount = totalAmount - paidAmount;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      totalOrders,
      totalAmount,
      paidAmount,
      unpaidAmount,
    };
  });

  return NextResponse.json(result);
}
