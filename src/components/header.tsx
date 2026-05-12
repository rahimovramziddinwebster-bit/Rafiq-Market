"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { ShoppingCart, Search, Menu, X, User, LogOut, Package, Heart, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const categorySlugs = [
  { key: "electronics" as const, slug: "electronics" },
  { key: "phones" as const, slug: "phones" },
  { key: "clothing" as const, slug: "clothing" },
  { key: "homeAppliances" as const, slug: "home-appliances" },
  { key: "sports" as const, slug: "sports" },
];

export function Header() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useT();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setMobileOpen(false);
      }
    },
    [query, router]
  );

  const user = session?.user as { id?: string; role?: string; image?: string } | undefined;

  const navItems = [
    { href: "/account/profile", icon: User, label: t.header.profile },
    { href: "/account/orders", icon: Package, label: t.header.myOrders },
    { href: "/account/wishlist", icon: Heart, label: t.header.wishlist },
    { href: "/account/settings", icon: Settings, label: t.header.settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main header bar */}
      <div className="bg-[#7B1C1C] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1">
            <span className="text-2xl font-bold tracking-tight text-yellow-300">Rafiq</span>
            <span className="text-2xl font-bold text-white">market</span>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.header.searchPlaceholder}
                className="rounded-r-none bg-white text-gray-900 border-0 focus-visible:ring-0 h-10 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="rounded-r-lg rounded-l-none h-10 px-5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold flex items-center cursor-pointer transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-lg text-white hover:bg-[#8B2020] transition-colors cursor-pointer">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-yellow-400 text-gray-900 font-bold rounded-full border-2 border-[#7B1C1C]">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-white hover:bg-[#8B2020] gap-2 cursor-pointer"
                  )}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image ?? ""} />
                    <AvatarFallback className="bg-[#9B2C2C] text-white text-xs">
                      {session.user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm max-w-24 truncate">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {navItems.map(({ href, icon: Icon, label }) => (
                    <DropdownMenuItem
                      key={href}
                      onClick={() => router.push(href)}
                      className="cursor-pointer"
                    >
                      <Icon className="w-4 h-4 mr-2" /> {label}
                    </DropdownMenuItem>
                  ))}
                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin/dashboard")}
                      className="cursor-pointer"
                    >
                      <Shield className="w-4 h-4 mr-2" /> {t.header.adminPanel}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> {t.header.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link
                  href="/auth/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-white hover:bg-[#8B2020] border border-white/40"
                  )}
                >
                  {t.header.login}
                </Link>
                <Link
                  href="/auth/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold border-0"
                  )}
                >
                  {t.header.register}
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="md:hidden text-white hover:bg-[#8B2020] cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-4 bg-[#7B1C1C] text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold">{t.header.menu}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileOpen(false)}
                      className="text-white hover:bg-[#8B2020] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.header.searchMobilePlaceholder}
                      className="bg-white text-gray-900 border-0 h-9"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-yellow-400 text-gray-900 rounded-lg cursor-pointer hover:bg-yellow-300 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </form>
                </div>
                <nav className="p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {t.header.categories}
                  </p>
                  {categorySlugs.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium cursor-pointer"
                    >
                      {t.categories[cat.key]}
                    </Link>
                  ))}
                  <div className="border-t pt-3 mt-3 space-y-1">
                    {!session ? (
                      <>
                        <Link
                          href="/auth/login"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium cursor-pointer"
                        >
                          {t.header.login}
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer"
                        >
                          {t.header.register}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account/orders"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm cursor-pointer"
                        >
                          <Package className="w-4 h-4" /> {t.header.myOrders}
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm cursor-pointer"
                        >
                          <Heart className="w-4 h-4" /> {t.header.wishlist}
                        </Link>
                        <Link
                          href="/account/settings"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm cursor-pointer"
                        >
                          <Settings className="w-4 h-4" /> {t.header.settings}
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 text-sm w-full cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> {t.header.signOut}
                        </button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Category nav - desktop */}
      <div className="hidden md:block bg-[#5C1515] text-white/90">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 h-10 items-center">
            {categorySlugs.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-4 h-full flex items-center text-sm font-medium hover:bg-[#8B2020] hover:text-white transition-colors cursor-pointer"
              >
                {t.categories[cat.key]}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
