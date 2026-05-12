"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold text-yellow-400">Rafiq</span>
              <span className="text-2xl font-bold text-white">market</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{t.footer.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{t.footer.shopping}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">{t.footer.allProducts}</Link></li>
              <li><Link href="/category/electronics" className="hover:text-white transition-colors">{t.footer.electronics}</Link></li>
              <li><Link href="/category/clothing" className="hover:text-white transition-colors">{t.footer.clothing}</Link></li>
              <li><Link href="/category/sports" className="hover:text-white transition-colors">{t.footer.sports}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{t.footer.myAccount}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account/orders" className="hover:text-white transition-colors">{t.footer.myOrders}</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-white transition-colors">{t.footer.wishlist}</Link></li>
              <li><Link href="/account/addresses" className="hover:text-white transition-colors">{t.footer.addresses}</Link></li>
              <li><Link href="/account/profile" className="hover:text-white transition-colors">{t.footer.profile}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{t.footer.downloadApp}</h3>
            <div className="flex gap-2">
              <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-center cursor-pointer hover:bg-gray-700 transition-colors">
                App Store
              </div>
              <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-center cursor-pointer hover:bg-gray-700 transition-colors">
                Google Play
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Rafiq Market. {t.footer.rights}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
