"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  store?: { name: string; isVerified: boolean } | null;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { status } = useSession();
  const router = useRouter();
  const t = useT();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const discount =
    product.discountPrice && product.price > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const displayPrice = product.discountPrice ?? product.price;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      productId: product.id,
      quantity: 1,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        images: product.images,
        slug: product.slug,
        stock: product.stock,
      },
    });
    toast.success(t.productDetail.addedToCart, { description: product.title });
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      toast.info(t.wishlist.signInToSave);
      router.push("/auth/login?callbackUrl=/products/" + product.slug);
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) throw new Error();
      const { wishlisted: isWishlisted } = await res.json();
      setWishlisted(isWishlisted);
      toast.success(isWishlisted ? t.wishlist.added : t.wishlist.removed, {
        description: product.title,
      });
    } catch {
      toast.error(t.wishlist.error);
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className={cn(
          "group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer",
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={product.images[0] ?? "/images/products/cat-electronics.jpg"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold border-0 z-10">
              -{discount}%
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">
                {t.home.outOfStock}
              </span>
            </div>
          )}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white z-10 disabled:opacity-50"
            aria-label="Add to wishlist"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                wishlisted ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500"
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {product.store && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-muted-foreground truncate">{product.store.name}</span>
              {product.store.isVerified && (
                <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
              )}
            </div>
          )}

          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3 h-3",
                      star <= Math.round(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-base font-bold text-foreground">
                ${displayPrice.toFixed(2)}
              </div>
              {discount > 0 && (
                <div className="text-xs text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="h-8 px-2 shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
