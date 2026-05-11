"use client";

import { useT } from "@/lib/i18n";
import { Package, ShoppingBag, DollarSign, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  rating: number;
  stock: number;
  category: { name: string };
}

interface Props {
  storeName: string;
  totalRevenue: number;
  productCount: number;
  pendingOrders: number;
  avgRating: number;
  products: Product[];
}

export function SellerDashboardClient({ storeName, totalRevenue, productCount, pendingOrders, avgRating, products }: Props) {
  const t = useT();

  const stats = [
    { label: t.seller.totalRevenue, value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: t.seller.totalProducts, value: productCount, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: t.seller.pendingOrders, value: pendingOrders, icon: ShoppingBag, color: "text-yellow-600 bg-yellow-50" },
    { label: t.seller.avgRating, value: avgRating.toFixed(1), icon: Star, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{storeName}</h1>
          <p className="text-sm text-muted-foreground">{t.seller.dashboardSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> {t.seller.recentProducts}
          </h2>
          <Link href="/seller/products" className="text-sm text-primary hover:underline">{t.seller.viewAll}</Link>
        </div>
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.category.name} · {p.stock} {t.seller.inStock}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-bold">${(p.discountPrice ?? p.price).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">⭐ {p.rating.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
