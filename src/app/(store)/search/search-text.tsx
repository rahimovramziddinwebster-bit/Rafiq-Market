"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

export function SearchBreadcrumb({ query }: { query: string }) {
  const t = useT();
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link href="/" className="hover:text-foreground">{t.search.home}</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-foreground font-medium">
        {query ? `${t.search.resultsFor} "${query}"` : t.search.allProducts}
      </span>
    </nav>
  );
}

export function SearchHeader({ query, total }: { query: string; total: number }) {
  const t = useT();
  if (query) {
    return (
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">
          {total.toLocaleString()} {t.search.results} &ldquo;{query}&rdquo;
        </h1>
      </div>
    );
  }
  return <h1 className="text-xl font-bold mb-6">{t.search.allProducts} ({total.toLocaleString()})</h1>;
}

export function SearchEmpty({ query }: { query: string }) {
  const t = useT();
  return (
    <div className="text-center py-20">
      <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-lg font-medium text-muted-foreground">{t.search.noResults} &ldquo;{query}&rdquo;</p>
      <p className="text-sm text-muted-foreground mt-1">{t.search.noResultsDesc}</p>
      <Link href="/products" className="text-primary text-sm mt-4 inline-block hover:underline">
        {t.search.browseAll}
      </Link>
    </div>
  );
}
