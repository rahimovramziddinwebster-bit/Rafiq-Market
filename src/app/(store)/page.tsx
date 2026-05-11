import { prisma } from "@/lib/prisma";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const [categories, trendingProducts, newArrivals] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      include: { _count: { select: { products: true } } },
      take: 5,
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: { rating: "desc" },
      take: 8,
      include: {
        store: { select: { name: true, isVerified: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        store: { select: { name: true, isVerified: true } },
      },
    }),
  ]);

  return (
    <HomeClient
      categories={categories}
      trendingProducts={trendingProducts}
      newArrivals={newArrivals}
    />
  );
}
