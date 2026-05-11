"use client";

import Link from "next/link";
import { Package, Heart, MapPin, User, ChevronRight, Settings } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const t = useT();

  const navItems = [
    { href: "/account/orders", icon: Package, label: t.account.myOrders },
    { href: "/account/wishlist", icon: Heart, label: t.account.wishlist },
    { href: "/account/addresses", icon: MapPin, label: t.account.addresses },
    { href: "/account/profile", icon: User, label: t.account.profile },
    { href: "/account/settings", icon: Settings, label: t.account.settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 px-3">
            {t.account.title}
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

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
