"use client";

import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Store, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const t = useT();

  const navItems = [
    { href: "/seller/dashboard", icon: LayoutDashboard, label: t.seller.dashboard },
    { href: "/seller/products", icon: Package, label: t.seller.products },
    { href: "/seller/orders", icon: ShoppingBag, label: t.seller.orders },
    { href: "/seller/store", icon: Store, label: t.seller.storeSettings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="hidden md:block w-56 shrink-0">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 px-3">
            {t.seller.panelTitle}
          </h2>
          <nav className="space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group cursor-pointer"
              >
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                <span className="text-sm font-medium">{label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
