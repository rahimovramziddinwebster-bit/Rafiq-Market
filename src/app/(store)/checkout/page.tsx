"use client";

import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Banknote, Truck } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function CheckoutPage() {
  const { status } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const t = useT();

  const schema = useMemo(
    () =>
      z.object({
        city: z.string().min(2, t.checkout.cityRequired),
        street: z.string().min(5, t.checkout.streetRequired),
      }),
    [t]
  );

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/checkout");
    } else if (status === "authenticated" && items.length === 0 && !processing) {
      router.push("/cart");
    }
  }, [status, items.length, processing, router]);

  if (status !== "authenticated" || items.length === 0) return null;

  const subtotal = totalPrice();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const onSubmit = async (data: FormData) => {
    setProcessing(true);
    try {
      const address = { city: data.city, street: data.street };

      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? null,
          quantity: i.quantity,
        })),
        address,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      clearCart();
      toast.success(t.checkout.orderSuccess);
      router.push("/account/orders");
    } catch {
      toast.error(t.checkout.orderError);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t.checkout.title}</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> {t.checkout.shippingAddress}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="street" className="mb-1.5 block text-sm">{t.checkout.streetAddress}</Label>
                  <Input id="street" {...register("street")} placeholder={t.checkout.streetPlaceholder} />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                </div>
                <div>
                  <Label htmlFor="city" className="mb-1.5 block text-sm">{t.checkout.city}</Label>
                  <Input id="city" {...register("city")} placeholder={t.checkout.cityPlaceholder} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment: cash on delivery only */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary" /> {t.checkout.paymentMethod}
              </h2>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-primary bg-primary/5">
                <Banknote className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t.checkout.cashOnDelivery}</p>
                  <p className="text-xs text-muted-foreground">{t.checkout.cashOnDeliveryDesc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Review */}
          <div>
            <div className="bg-card rounded-xl border border-border p-5 sticky top-24">
              <h2 className="font-semibold mb-4">{t.checkout.orderReview}</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => {
                  const price =
                    (item.product.discountPrice ?? item.product.price) +
                    (item.variant?.priceModifier ?? 0);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <Image
                          src={item.product.images[0] ?? ""}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2">{item.product.title}</p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">{item.variant.value}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × ${price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-xs font-bold shrink-0">
                        ${(price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="mb-4" />

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.checkout.subtotal}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.checkout.shipping}</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? t.checkout.free : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-base mb-5">
                <span>{t.checkout.total}</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full cursor-pointer font-semibold"
                disabled={processing}
              >
                {processing ? t.checkout.processing : t.checkout.placeOrder}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
