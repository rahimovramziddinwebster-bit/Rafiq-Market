"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";

export function ProductsBreadcrumb() {
  const t = useT();
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link href="/" className="hover:text-foreground">{t.products.home}</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-foreground font-medium">{t.products.allProducts}</span>
    </nav>
  );
}
