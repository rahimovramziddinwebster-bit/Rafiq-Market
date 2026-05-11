"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/lib/i18n";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}

export function ProductFilters({ categories, searchParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v && k !== key && k !== "page") params.set(k, v);
      });
      if (value) params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => router.push(pathname), [router, pathname]);

  const currentCategory = searchParams.category;
  const currentRating = parseInt(searchParams.rating ?? "0");
  const inStock = searchParams.inStock === "true";

  const priceRanges = [
    { label: t.products.under50, min: "0", max: "50" },
    { label: t.products["50to200"], min: "50", max: "200" },
    { label: t.products["200to500"], min: "200", max: "500" },
    { label: t.products["500to1000"], min: "500", max: "1000" },
    { label: t.products.over1000, min: "1000", max: "999999" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{t.products.filters}</h3>
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-xs text-primary cursor-pointer">
          {t.products.clearAll}
        </Button>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium mb-3">{t.products.category}</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={!currentCategory}
              onCheckedChange={() => updateParam("category", null)}
            />
            <span className="text-sm">{t.products.allCategories}</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={currentCategory === cat.slug}
                onCheckedChange={() =>
                  updateParam("category", currentCategory === cat.slug ? null : cat.slug)
                }
              />
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium mb-3">{t.products.priceRange}</h4>
        <div className="space-y-2">
          {priceRanges.map(({ label, min, max }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={searchParams.minPrice === min && searchParams.maxPrice === max}
                onCheckedChange={(checked) => {
                  const p = new URLSearchParams();
                  Object.entries(searchParams).forEach(([k, v]) => {
                    if (v && k !== "minPrice" && k !== "maxPrice" && k !== "page") p.set(k, v);
                  });
                  if (checked) {
                    p.set("minPrice", min);
                    p.set("maxPrice", max);
                  }
                  router.push(`${pathname}?${p.toString()}`);
                }}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h4 className="text-sm font-medium mb-3">{t.products.minRating}</h4>
        <div className="space-y-2">
          {[4, 3, 2].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={currentRating === rating}
                onCheckedChange={(checked) =>
                  updateParam("rating", checked ? String(rating) : null)
                }
              />
              <div className="flex items-center gap-1">
                <StarRating value={rating} readonly size="sm" />
                <span className="text-xs text-muted-foreground">{t.products.andUp}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* In Stock */}
      <div>
        <Label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={inStock}
            onCheckedChange={(checked) => updateParam("inStock", checked ? "true" : null)}
          />
          <span className="text-sm">{t.products.inStockOnly}</span>
        </Label>
      </div>
    </div>
  );
}
