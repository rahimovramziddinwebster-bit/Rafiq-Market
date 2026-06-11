"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Variant {
  id: string;
  name: string;
  value: string;
  priceModifier: number;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  slug: string;
  stock: number;
  variants: Variant[];
}

export function AddToCartSection({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const t = useT();

  const variantGroups = product.variants.reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const inStock = effectiveStock > 0;

  const handleAdd = () => {
    addItem({
      id: `${product.id}-${selectedVariant?.id ?? "base"}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity: qty,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        images: product.images,
        slug: product.slug,
        stock: product.stock,
      },
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            name: selectedVariant.name,
            value: selectedVariant.value,
            priceModifier: selectedVariant.priceModifier,
            stock: selectedVariant.stock,
          }
        : undefined,
    });
    toast.success(t.productDetail.addedToCart, {
      description: `${product.title}${selectedVariant ? ` — ${selectedVariant.value}` : ""}`,
    });
  };

  return (
    <div className="space-y-4">
      {Object.entries(variantGroups).map(([name, variants]) => (
        <div key={name}>
          <p className="text-sm font-medium mb-2">{name}</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg border transition-all cursor-pointer",
                  selectedVariant?.id === v.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary",
                  v.stock === 0 && "opacity-50 cursor-not-allowed line-through"
                )}
                disabled={v.stock === 0}
              >
                {v.value}
                {v.priceModifier !== 0 && (
                  <span className="ml-1 text-xs">
                    ({v.priceModifier > 0 ? "+" : ""}{v.priceModifier.toFixed(0)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Badge variant={inStock ? "default" : "destructive"} className="text-xs">
          {inStock
            ? `${t.productDetail.inStock} (${effectiveStock})`
            : t.productDetail.outOfStock}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-muted transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(effectiveStock, q + 1))}
            className="px-3 py-2 hover:bg-muted transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Button
        size="lg"
        onClick={handleAdd}
        disabled={!inStock}
        className="w-full cursor-pointer font-semibold"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        {inStock ? t.productDetail.addToCart : t.productDetail.outOfStock}
      </Button>
    </div>
  );
}
