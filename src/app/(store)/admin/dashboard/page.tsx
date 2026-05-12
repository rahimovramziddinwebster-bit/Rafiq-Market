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

  const [totalRevenue, totalCustomers, pendingOrdersCount, unpaidAggregate, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "DELIVERED"] } },
      _sum: { totalAmount: true },
    }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "UNPAID" },
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
      totalRevenue={totalRevenue._sum.totalAmount ?? 0}
      totalCustomers={totalCustomers}
      pendingOrdersCount={pendingOrdersCount}
      unpaidTotal={unpaidAggregate._sum.totalAmount ?? 0}
      recentOrders={recentOrders}
    />
  );
}
