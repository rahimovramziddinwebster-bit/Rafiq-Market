import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import type { Metadata } from "next";
import { SearchBreadcrumb, SearchHeader, SearchEmpty } from "./search-text";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: "${q}"` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await searchParams;
  const query = q?.trim() ?? "";
  const page = parseInt(pageStr ?? "1");
  const limit = 20;

  const where = query
    ? {
        isActive: true,
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { isActive: true };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { rating: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { store: { select: { name: true, isVerified: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SearchBreadcrumb query={query} />
      <SearchHeader query={query} total={total} />

      {products.length === 0 ? (
        <SearchEmpty query={query} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
