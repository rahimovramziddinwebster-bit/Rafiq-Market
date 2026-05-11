"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function CategoryBreadcrumb({ categoryName }: { categoryName: string }) {
  const t = useT();
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link href="/" className="hover:text-foreground">{t.category.home}</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <Link href="/products" className="hover:text-foreground">{t.category.products}</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-foreground font-medium">{categoryName}</span>
    </nav>
  );
}

export function CategoryProductsCount({ count }: { count: number }) {
  const t = useT();
  return <p className="text-sm text-muted-foreground mt-1">{count} {t.category.productsCount}</p>;
}

export function CategoryEmpty() {
  const t = useT();
  return (
    <div className="text-center py-20 text-muted-foreground">
      <p className="text-lg">{t.category.noProducts}</p>
    </div>
  );
}
