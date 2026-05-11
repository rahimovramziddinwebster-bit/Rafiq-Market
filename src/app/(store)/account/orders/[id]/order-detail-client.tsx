"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Package, Truck, CheckCircle, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const steps = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; title: string; images: string[]; slug: string };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  paymentId: string | null;
  address: { city: string; street: string; zip: string };
  items: OrderItem[];
}

export function OrderDetailClient({ order }: { order: Order }) {
  const t = useT();
  const address = order.address;
  const stepIndex = steps.indexOf(order.status);

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/account/orders" className="hover:text-foreground">{t.orders.ordersList}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-mono">#{order.id.slice(-8).toUpperCase()}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t.orders.details}</h1>
        <span className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "MMMM d, yyyy")}</span>
      </div>

      {order.status !== "CANCELLED" && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i <= stepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <p className={`text-xs mt-1.5 font-medium ${i <= stepIndex ? "text-primary" : "text-muted-foreground"}`}>
                    {t.orders.statuses[step as keyof typeof t.orders.statuses]}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold mb-4">{t.orders.items}</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <Link href={`/products/${item.product.slug}`}>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <Image
                        src={item.product.images[0] ?? ""}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="text-sm font-medium hover:text-primary line-clamp-2">
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm font-bold shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> {t.orders.shippingAddress}
            </h3>
            <p className="text-sm text-muted-foreground">{address.street}</p>
            <p className="text-sm text-muted-foreground">{address.city}, {address.zip}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> {t.orders.payment}
            </h3>
            <p className="text-sm text-muted-foreground">
              {order.paymentId ? t.orders.paidByCard : t.orders.cashOnDelivery}
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> {t.orders.orderSummary}
            </h3>
            <Separator className="mb-3" />
            <div className="flex justify-between text-sm font-bold">
              <span>{t.orders.total}</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
