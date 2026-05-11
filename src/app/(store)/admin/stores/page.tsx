import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminStoresClient } from "./admin-stores-client";

export const metadata = { title: "Stores — Admin" };

export default async function AdminStoresPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect("/");

  const stores = await prisma.store.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminStoresClient stores={stores} />;
}
