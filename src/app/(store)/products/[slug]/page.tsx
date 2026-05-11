import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Package, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { AddToCartSection } from "./add-to-cart-section";
import { ReviewSection } from "./review-section";
import {
  PdBreadcrumb,
  PdVerifiedBadge,
  PdReviewsCount,
  PdSaveBadge,
  PdOfficialStore,
  PdGuarantees,
  PdDescriptionTitle,
  PdRelatedTitle,
} from "./product-detail-text";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!product) return {};
  return { title: product.title, description: product.description.slice(0, 160) };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      store: { select: { id: true, name: true, logo: true, isVerified: true } },
      variants: true,
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: { store: { select: { name: true, isVerified: true } } },
  });

  const discount =
    product.discountPrice && product.price > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PdBreadcrumb
        categorySlug={product.category.slug}
        categoryName={product.category.name}
        productTitle={product.title}
      />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <Image
              src={product.images[0] ?? "/images/products/cat-electronics.jpg"}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold border-0">
                -{discount}%
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.slice(0, 5).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border-2 border-primary/30 cursor-pointer hover:border-primary transition-colors">
                  <Image src={img} alt={`${product.title} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/category/${product.category.slug}`} className="text-xs text-primary font-medium hover:underline">
              {product.category.name}
            </Link>
            {product.store.isVerified && <PdVerifiedBadge />}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">{product.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <PdReviewsCount count={product.reviewCount} />
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-foreground">
              ${(product.discountPrice ?? product.price).toFixed(2)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                <PdSaveBadge amount={product.price - (product.discountPrice ?? product.price)} />
              </>
            )}
          </div>

          <AddToCartSection product={product} />

          <Separator className="my-5" />

          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {product.store.logo ? (
                <Image src={product.store.logo} alt={product.store.name} fill className="object-cover" />
              ) : (
                <Package className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{product.store.name}</span>
                {product.store.isVerified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
              </div>
              <PdOfficialStore />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <PdGuarantees />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PdDescriptionTitle />
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p className="leading-relaxed">{product.description}</p>
        </div>
      </div>

      <Separator className="my-8" />

      <ReviewSection
        productId={product.id}
        reviews={product.reviews}
        rating={product.rating}
        reviewCount={product.reviewCount}
        ratingDist={ratingDist}
      />

      {related.length > 0 && (
        <div className="mt-12">
          <PdRelatedTitle />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
