import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./admin-dashboard-client";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect("/");

  const [userCount, storeCount, productCount, orderCount, revenue, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "DELIVERED"] } },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <AdminDashboardClient
      userCount={userCount}
      storeCount={storeCount}
      productCount={productCount}
      orderCount={orderCount}
      totalRevenue={revenue._sum.totalAmount ?? 0}
      recentOrders={recentOrders}
    />
  );
}
