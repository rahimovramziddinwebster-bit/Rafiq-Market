import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SellerDashboardClient } from "./seller-dashboard-client";

export const metadata = { title: "Seller Dashboard" };

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) redirect("/auth/register");

  const [productCount, products, orders] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
    prisma.orderItem.findMany({
      where: { product: { storeId: store.id } },
      include: { order: { select: { status: true, createdAt: true } } },
    }),
  ]);

  const totalRevenue = orders
    .filter((i) => i.order.status === "PAID" || i.order.status === "DELIVERED")
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  const pendingOrders = new Set(
    orders
      .filter((i) => i.order.status === "PENDING")
      .map((i) => i.orderId)
  ).size;

  const avgRating =
    products.length > 0
      ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
      : 0;

  return (
    <SellerDashboardClient
      storeName={store.name}
      totalRevenue={totalRevenue}
      productCount={productCount}
      pendingOrders={pendingOrders}
      avgRating={avgRating}
      products={products}
    />
  );
}
