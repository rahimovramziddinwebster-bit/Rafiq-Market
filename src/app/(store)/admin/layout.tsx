"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, ChevronRight, UserCheck } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: t.admin.dashboard },
    { href: "/admin/products", icon: Package, label: t.admin.productsNav },
    { href: "/admin/categories", icon: Tag, label: t.admin.categories },
    { href: "/admin/orders", icon: ShoppingBag, label: t.admin.allOrders },
    { href: "/admin/customers", icon: UserCheck, label: t.admin.customers },
    { href: "/admin/users", icon: Users, label: t.admin.users },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="flex items-center gap-2 mb-5 px-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">{t.admin.panelTitle}</span>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group cursor-pointer",
                      isActive && "bg-accent"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary", isActive && "text-primary")} />
                    <span className="text-sm font-medium">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* Mobile bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
        <div className="flex items-stretch justify-around h-16">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[9px] font-medium leading-tight text-center px-0.5 line-clamp-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
