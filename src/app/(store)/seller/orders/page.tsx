import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SellerOrdersClient } from "./seller-orders-client";

export const metadata = { title: "Seller Orders" };

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) redirect("/auth/register");

  const orderItems = await prisma.orderItem.findMany({
    where: { product: { storeId: store.id } },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      product: { select: { id: true, title: true, images: true } },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  const ordersMap = new Map<string, typeof orderItems>();
  for (const item of orderItems) {
    const key = item.orderId;
    if (!ordersMap.has(key)) ordersMap.set(key, []);
    ordersMap.get(key)!.push(item);
  }
  const orders = Array.from(ordersMap.entries()).map(([id, items]) => ({
    id,
    order: items[0].order,
    items,
    revenue: items.reduce((s, i) => s + i.price * i.quantity, 0),
  }));

  return <SellerOrdersClient orders={orders} />;
}
