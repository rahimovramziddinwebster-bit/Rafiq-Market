"use client";

import { useT } from "@/lib/i18n";

export function ProductsEmpty() {
  const t = useT();
  return (
    <div className="text-center py-16">
      <p className="text-muted-foreground text-lg">{t.products.noProducts}</p>
      <p className="text-sm text-muted-foreground mt-1">{t.products.tryAdjusting}</p>
    </div>
  );
}
