import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OrdersClient } from "./orders-client";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, images: true, slug: true } },
        },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <OrdersClient orders={orders} />;
}
