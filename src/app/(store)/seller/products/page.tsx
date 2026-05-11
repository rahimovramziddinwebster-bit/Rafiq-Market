import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SellerProductsClient } from "./seller-products-client";

export const metadata = { title: "My Products" };

export default async function SellerProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) redirect("/auth/register");

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <SellerProductsClient products={products} />;
}
