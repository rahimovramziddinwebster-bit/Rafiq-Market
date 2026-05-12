import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CustomersClient } from "./customers-client";

export const metadata = { title: "Customers — Admin" };

export default async function AdminCustomersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect("/");

  const rawCustomers = await prisma.user.findMany({
    where: { role: "BUYER" },
    include: {
      orders: {
        select: {
          id: true,
          totalAmount: true,
          paymentStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const customers = rawCustomers.map((u) => {
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
      createdAt: u.createdAt.toISOString(),
      totalOrders,
      totalAmount,
      paidAmount,
      unpaidAmount,
    };
  });

  return <CustomersClient customers={customers} />;
}
