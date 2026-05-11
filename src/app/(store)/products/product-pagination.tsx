"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function ProductPagination({ page, totalPages, searchParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const goTo = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="h-8 w-8 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => goTo(p)}
          className={cn("h-8 w-8 p-0 cursor-pointer", p === page && "pointer-events-none")}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="h-8 w-8 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
