"use client";

import { useT } from "@/lib/i18n";

export function ProductsCount({ total }: { total: number }) {
  const t = useT();
  return (
    <p className="text-sm text-muted-foreground">
      {total.toLocaleString()} {t.products.found}
    </p>
  );
}
