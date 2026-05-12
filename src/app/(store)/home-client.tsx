"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count: { products: number };
}

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  store?: { name: string; isVerified: boolean } | null;
}

interface HomeClientProps {
  categories: Category[];
  trendingProducts: Product[];
  newArrivals: Product[];
}

export function HomeClient({ categories, trendingProducts, newArrivals }: HomeClientProps) {
  const t = useT();

  const trustBadges = [
    { icon: Truck, label: t.home.fastDelivery },
    { icon: Shield, label: t.home.buyerProtection },
    { icon: Zap, label: t.home.easyReturns },
  ];

  return (
    <div className="pb-12">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#7B1C1C] via-[#8B2020] to-[#5C1515] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                {t.home.flashSale}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                {t.home.heroTitle} <br />
                <span className="text-yellow-300">{t.home.heroTitleHighlight}</span>
              </h1>
              <p className="text-purple-200 text-lg mb-8 max-w-md">
                {t.home.heroSubtitle}
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold cursor-pointer"
                >
                  <Link href="/products">
                    {t.home.shopNow} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex gap-6 mt-10">
                {trustBadges.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-purple-200">
                    <Icon className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-3xl" />
                <div className="relative grid grid-cols-2 gap-3 p-4">
                  {trendingProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                    >
                      <Image
                        src={product.images[0] ?? ""}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="w-full aspect-square object-cover rounded-lg mb-1"
                      />
                      <p className="text-xs text-white/80 truncate">{product.title}</p>
                      <p className="text-sm font-bold text-yellow-300">
                        ${(product.discountPrice ?? product.price).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Categories Grid */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t.home.shopByCategory}</h2>
            <Link href="/products" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              {t.home.viewAll} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 hover:shadow-md transition-all cursor-pointer"
              >
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm">{cat.name}</p>
                  <p className="text-white/70 text-xs">{cat._count.products} {t.home.products}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Banner Ad */}
        <section className="mt-12">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-white flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">{t.home.limitedOffer}</p>
              <h3 className="text-2xl font-bold mb-2">{t.home.electronicsTitle}</h3>
              <p className="text-orange-100">{t.home.electronicsDesc}</p>
              <Button asChild className="mt-4 bg-white text-orange-500 hover:bg-orange-50 font-semibold cursor-pointer">
                <Link href="/category/electronics">{t.home.shopElectronics}</Link>
              </Button>
            </div>
            <div className="hidden md:block text-8xl">📱</div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{t.home.trendingNow}</h2>
              <p className="text-muted-foreground text-sm">{t.home.trendingDesc}</p>
            </div>
            <Link href="/products?sort=rating" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              {t.home.viewAll} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{t.home.newArrivals}</h2>
              <p className="text-muted-foreground text-sm">{t.home.newArrivalsDesc}</p>
            </div>
            <Link href="/products?sort=newest" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              {t.home.viewAll} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Second Banner */}
        <section className="mt-12">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
              <p className="text-blue-100 text-sm mb-1">{t.home.newCollection}</p>
              <h3 className="text-xl font-bold mb-2">{t.home.fashionTitle}</h3>
              <p className="text-blue-100 text-sm mb-4">{t.home.fashionDesc}</p>
              <Button asChild size="sm" className="bg-white text-blue-600 hover:bg-blue-50 cursor-pointer">
                <Link href="/category/clothing">{t.home.shopNow}</Link>
              </Button>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
              <p className="text-green-100 text-sm mb-1">{t.home.activeLife}</p>
              <h3 className="text-xl font-bold mb-2">{t.home.sportsTitle}</h3>
              <p className="text-green-100 text-sm mb-4">{t.home.sportsDesc}</p>
              <Button asChild size="sm" className="bg-white text-green-600 hover:bg-green-50 cursor-pointer">
                <Link href="/category/sports">{t.home.shopNow}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
