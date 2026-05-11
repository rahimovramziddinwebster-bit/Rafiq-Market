"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Store, Tag, ShoppingBag, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useT();

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: t.admin.dashboard },
    { href: "/admin/users", icon: Users, label: t.admin.users },
    { href: "/admin/stores", icon: Store, label: t.admin.stores },
    { href: "/admin/categories", icon: Tag, label: t.admin.categories },
    { href: "/admin/orders", icon: ShoppingBag, label: t.admin.allOrders },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="hidden md:block w-56 shrink-0">
          <div className="flex items-center gap-2 mb-5 px-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">{t.admin.panelTitle}</span>
          </div>
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
