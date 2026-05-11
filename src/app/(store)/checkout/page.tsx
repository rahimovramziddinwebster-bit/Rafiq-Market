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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CreditCard, Truck } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const t = useT();

  const schema = useMemo(
    () =>
      z.object({
        city: z.string().min(2, t.checkout.cityRequired),
        street: z.string().min(5, t.checkout.streetRequired),
        zip: z.string().min(4, t.checkout.zipRequired),
        paymentMethod: z.enum(["stripe", "cod"]),
      }),
    [t]
  );

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: "stripe" },
  });

  const paymentMethod = watch("paymentMethod");

  if (!session) {
    router.push("/auth/login?callbackUrl=/checkout");
    return null;
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = totalPrice();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const onSubmit = async (data: FormData) => {
    setProcessing(true);
    try {
      const address = { city: data.city, street: data.street, zip: data.zip };

      if (data.paymentMethod === "stripe") {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              product: { title: i.product.title, images: i.product.images },
              quantity: i.quantity,
              price: (i.product.discountPrice ?? i.product.price) + (i.variant?.priceModifier ?? 0),
            })),
            address,
          }),
        });
        const { url } = await res.json();
        if (url && typeof window !== "undefined") window.location.href = url;
      } else {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: (i.product.discountPrice ?? i.product.price) + (i.variant?.priceModifier ?? 0),
            })),
            address,
            totalAmount: total,
          }),
        });
        if (!res.ok) throw new Error();
        clearCart();
        toast.success(t.checkout.orderSuccess);
        router.push("/account/orders");
      }
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
                <div>
                  <Label htmlFor="zip" className="mb-1.5 block text-sm">{t.checkout.zipCode}</Label>
                  <Input id="zip" {...register("zip")} placeholder={t.checkout.zipPlaceholder} />
                  {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> {t.checkout.paymentMethod}
              </h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setValue("paymentMethod", v as "stripe" | "cod")}
                className="space-y-3"
              >
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-primary transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <div className="flex items-center gap-3 flex-1">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{t.checkout.creditCard}</p>
                      <p className="text-xs text-muted-foreground">{t.checkout.creditCardDesc}</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-primary transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5">
                  <RadioGroupItem value="cod" id="cod" />
                  <div className="flex items-center gap-3 flex-1">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{t.checkout.cashOnDelivery}</p>
                      <p className="text-xs text-muted-foreground">{t.checkout.cashOnDeliveryDesc}</p>
                    </div>
                  </div>
                </label>
              </RadioGroup>
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
                {processing
                  ? t.checkout.processing
                  : paymentMethod === "stripe"
                  ? t.checkout.payWithCard
                  : t.checkout.placeOrder}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
