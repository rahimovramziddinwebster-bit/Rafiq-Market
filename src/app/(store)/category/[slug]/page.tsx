import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import type { Metadata } from "next";
import { CategoryBreadcrumb, CategoryProductsCount, CategoryEmpty } from "./category-text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const cat = await prisma.category.findUnique({ where: { slug }, select: { name: true } });
    if (!cat) return {};
    return { title: cat.name };
  } catch {
    return {};
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let category: Awaited<ReturnType<typeof prisma.category.findUnique<{ where: { slug: string }; include: { children: true } }>>> | null = null;
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    category = await prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });

    if (!category) notFound();

    products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { categoryId: category.id },
          { category: { parentId: category.id } },
        ],
      },
      orderBy: { rating: "desc" },
      take: 40,
      include: { store: { select: { name: true, isVerified: true } } },
    });
  } catch {
    if (!category) notFound();
    // DB error after category found — show empty products
  }

  if (!category) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <CategoryBreadcrumb categoryName={category.name} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <CategoryProductsCount count={products.length} />
        </div>
      </div>

      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className="px-4 py-1.5 rounded-full border border-border text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <CategoryEmpty />
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
