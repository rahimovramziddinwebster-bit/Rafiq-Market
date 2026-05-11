"use client";

import { useT } from "@/lib/i18n";
import Link from "next/link";
import { ChevronRight, Shield, Package, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PdBreadcrumb({
  categorySlug,
  categoryName,
  productTitle,
}: {
  categorySlug: string;
  categoryName: string;
  productTitle: string;
}) {
  const t = useT();
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
      <Link href="/" className="hover:text-foreground">{t.productDetail.home}</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <Link href="/products" className="hover:text-foreground">{t.productDetail.products}</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <Link href={`/category/${categorySlug}`} className="hover:text-foreground">{categoryName}</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-foreground">{productTitle}</span>
    </nav>
  );
}

export function PdVerifiedBadge() {
  const t = useT();
  return (
    <Badge variant="secondary" className="text-xs gap-1">
      <CheckCircle className="w-3 h-3" /> {t.productDetail.verifiedStore}
    </Badge>
  );
}

export function PdReviewsCount({ count }: { count: number }) {
  const t = useT();
  return <span className="text-sm text-muted-foreground">({count} {t.productDetail.reviews})</span>;
}

export function PdSaveBadge({ amount }: { amount: number }) {
  const t = useT();
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200 text-sm font-semibold">
      {t.productDetail.save} ${amount.toFixed(2)}
    </Badge>
  );
}

export function PdOfficialStore() {
  const t = useT();
  return <p className="text-xs text-muted-foreground">{t.productDetail.officialStore}</p>;
}

export function PdGuarantees() {
  const t = useT();
  const items = [
    { Icon: Shield, label: t.productDetail.buyerProtection },
    { Icon: Package, label: t.productDetail.easyReturns },
    { Icon: CheckCircle, label: t.productDetail.authenticProduct },
  ];
  return (
    <>
      {items.map(({ Icon, label }) => (
        <div key={label} className="text-center p-3 rounded-xl bg-muted/30 border border-border">
          <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </>
  );
}

export function PdDescriptionTitle() {
  const t = useT();
  return <h2 className="text-xl font-bold mb-4">{t.productDetail.description}</h2>;
}

export function PdRelatedTitle() {
  const t = useT();
  return <h2 className="text-xl font-bold mb-6">{t.productDetail.relatedProducts}</h2>;
}
