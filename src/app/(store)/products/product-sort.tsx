"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";

export function ProductSort({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useT();

  const options = [
    { value: "newest", label: t.products.sortNewest },
    { value: "rating", label: t.products.sortTopRated },
    { value: "price-asc", label: t.products.sortPriceLow },
    { value: "price-desc", label: t.products.sortPriceHigh },
  ];

  const handleSort = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={current} onValueChange={handleSort}>
      <SelectTrigger className="w-48 h-8 text-sm cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="cursor-pointer">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
