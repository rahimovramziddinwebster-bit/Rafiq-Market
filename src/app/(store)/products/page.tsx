import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-skeleton";
import { Suspense } from "react";
import { ProductFilters } from "./product-filters";
import { MobileFilters } from "./mobile-filters";
import { ProductSort } from "./product-sort";
import { ProductPagination } from "./product-pagination";
import { ProductsBreadcrumb } from "./products-breadcrumb";
import { ProductsCount } from "./products-count";
import { ProductsEmpty } from "./products-empty";

interface SearchParams {
  page?: string;
  sort?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  inStock?: string;
  [key: string]: string | undefined;
}

export const metadata = { title: "All Products" };

async function ProductList({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page ?? "1");
  const limit = 20;
  const sort = searchParams.sort ?? "newest";
  const category = searchParams.category;
  const minPrice = parseFloat(searchParams.minPrice ?? "0");
  const maxPrice = parseFloat(searchParams.maxPrice ?? "999999");
  const minRating = parseFloat(searchParams.rating ?? "0");
  const inStock = searchParams.inStock === "true";

  const where = {
    isActive: true,
    ...(category && { category: { slug: category } }),
    price: { gte: minPrice, lte: maxPrice },
    ...(minRating > 0 && { rating: { gte: minRating } }),
    ...(inStock && { stock: { gt: 0 } }),
  };

  const orderBy =
    sort === "price-asc" ? { price: "asc" as const }
    : sort === "price-desc" ? { price: "desc" as const }
    : sort === "rating" ? { rating: "desc" as const }
    : { createdAt: "desc" as const };

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let total = 0;

  try {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { store: { select: { name: true, isVerified: true } } },
      }),
      prisma.product.count({ where }),
    ]);
  } catch {
    // DB unavailable — render empty state
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <ProductsCount total={total} />
        <ProductSort current={sort} />
      </div>
      {products.length === 0 ? (
        <ProductsEmpty />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <ProductPagination page={page} totalPages={totalPages} searchParams={searchParams} />
      )}
    </>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const categories = await prisma.category
    .findMany({ orderBy: { name: "asc" } })
    .catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <ProductsBreadcrumb />

      <div className="flex gap-6">
        <aside className="hidden lg:block w-56 shrink-0">
          <ProductFilters categories={categories} searchParams={params} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden mb-3">
            <MobileFilters categories={categories} searchParams={params} />
          </div>
          <Suspense fallback={<ProductGridSkeleton count={20} />}>
            <ProductList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
