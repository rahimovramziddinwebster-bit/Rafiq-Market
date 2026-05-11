"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { Heart } from "lucide-react";

export function WishlistTitle({ count }: { count: number }) {
  const t = useT();
  return <h1 className="text-xl font-bold mb-6">{t.wishlist.title} ({count})</h1>;
}

export function WishlistEmpty() {
  const t = useT();
  return (
    <div className="text-center py-20">
      <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{t.wishlist.empty}</p>
      <Link href="/products" className="text-primary text-sm mt-2 inline-block hover:underline">
        {t.wishlist.browseProducts}
      </Link>
    </div>
  );
}
