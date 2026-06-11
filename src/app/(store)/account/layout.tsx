"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Heart, MapPin, User, ChevronRight, Settings } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();

  const navItems = [
    { href: "/account/orders", icon: Package, label: t.account.myOrders },
    { href: "/account/wishlist", icon: Heart, label: t.account.wishlist },
    { href: "/account/addresses", icon: MapPin, label: t.account.addresses },
    { href: "/account/profile", icon: User, label: t.account.profile },
    { href: "/account/settings", icon: Settings, label: t.account.settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Mobile horizontal nav */}
      <nav className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium whitespace-nowrap shrink-0 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 px-3">
            {t.account.title}
          </h2>
          <nav className="space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group cursor-pointer",
                    isActive && "bg-accent text-primary"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 text-muted-foreground group-hover:text-primary",
                      isActive && "text-primary"
                    )}
                  />
                  <span className="text-sm font-medium">{label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100" />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
