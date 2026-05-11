"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCartStore();
  const [promoCode, setPromoCode] = useState("");
  const router = useRouter();
  const t = useT();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t.cart.empty}</h1>
        <p className="text-muted-foreground mb-6">{t.cart.emptyDesc}</p>
        <Button asChild size="lg" className="cursor-pointer">
          <Link href="/products">{t.cart.browseProducts}</Link>
        </Button>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t.cart.title} ({totalItems()} {t.cart.itemsCount})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.product.discountPrice ?? item.product.price;
            const variantExtra = item.variant?.priceModifier ?? 0;
            const itemPrice = price + variantExtra;

            return (
              <div key={item.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border">
                <Link href={`/products/${item.product.slug}`} className="shrink-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={item.product.images[0] ?? ""}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.product.title}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        className="px-2.5 py-1.5 hover:bg-muted transition-colors cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2.5 py-1.5 hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${itemPrice.toFixed(2)} {t.cart.each}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t.cart.clearCart}
            </button>
            <Link href="/products" className="text-sm text-primary hover:underline">
              {t.cart.continueShopping}
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-card rounded-xl border border-border p-5 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">{t.cart.orderSummary}</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.cart.subtotal} ({totalItems()} {t.cart.itemsCount})
                </span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.cart.shipping}</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {shipping === 0 ? t.cart.free : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  {t.cart.freeShippingBefore} ${(50 - subtotal).toFixed(2)} {t.cart.freeShippingAfter}
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-bold text-base mb-5">
              <span>{t.cart.total}</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {/* Promo Code */}
            <div className="flex gap-2 mb-4">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={t.cart.promoCode}
                className="h-9 text-sm"
              />
              <Button variant="outline" size="sm" className="shrink-0 cursor-pointer">
                {t.cart.apply}
              </Button>
            </div>

            <Button
              size="lg"
              className="w-full cursor-pointer font-semibold"
              onClick={() => router.push("/checkout")}
            >
              {t.cart.checkout} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
