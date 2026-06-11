"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductFilters } from "./product-filters";
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

export function MobileFilters({ categories, searchParams }: Props) {
  const [open, setOpen] = useState(false);
  const t = useT();

  const activeCount = ["category", "minPrice", "rating", "inStock"].filter(
    (key) => searchParams[key]
  ).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="lg:hidden cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4 mr-1.5" />
        {t.products.filters}
        {activeCount > 0 && (
          <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </Button>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.products.filters}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <ProductFilters categories={categories} searchParams={searchParams} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
