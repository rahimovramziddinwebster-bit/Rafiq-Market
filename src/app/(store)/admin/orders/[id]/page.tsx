import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AdminOrderDetailClient } from "./admin-order-detail-client";

export const metadata = { title: "Order Details — Admin" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              slug: true,
              store: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  return <AdminOrderDetailClient order={order} />;
}
