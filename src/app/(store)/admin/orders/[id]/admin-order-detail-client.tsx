"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/lib/i18n";
import { format } from "date-fns";
import { ArrowLeft, MapPin, User, Mail, Calendar, Package } from "lucide-react";
import { OrderStatusSelect } from "../order-status-select";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    images: string[];
    slug: string;
    store: { id: string; name: string };
  };
}

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  address: unknown;
  user: { id: string; name: string | null; email: string | null };
  items: OrderItem[];
}

const paymentColors: Record<string, string> = {
  PAID: "text-green-700 bg-green-50 border-green-200",
  UNPAID: "text-red-700 bg-red-50 border-red-200",
  PARTIAL: "text-orange-700 bg-orange-50 border-orange-200",
};

interface AddressShape {
  street?: string;
  city?: string;
  zip?: string;
}

function isAddress(value: unknown): value is AddressShape {
  return typeof value === "object" && value !== null;
}

export function AdminOrderDetailClient({ order }: { order: Order }) {
  const t = useT();
  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const addr = isAddress(order.address) ? order.address : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.admin.backToOrders}
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">
            {t.admin.orderCol} <span className="font-mono">#{order.id.slice(-8).toUpperCase()}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(order.createdAt), "MMMM d, yyyy · h:mm a")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${paymentColors[order.paymentStatus] ?? ""}`}
          >
            {t.orders.paymentStatuses[order.paymentStatus as keyof typeof t.orders.paymentStatuses] ?? order.paymentStatus}
          </span>
          <OrderStatusSelect orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 md:col-span-2 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {t.orders.items} ({order.items.length})
          </h2>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-14 h-14 rounded-lg bg-muted shrink-0 overflow-hidden relative">
                  {item.product.images[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-medium text-sm hover:text-primary line-clamp-2"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.product.store.name} · {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-bold text-sm whitespace-nowrap">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t.admin.subtotal}</span>
              <span>${itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1.5 border-t border-border">
              <span>{t.orders.total}</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
            <h2 className="font-semibold flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary" />
              {t.admin.customerCol}
            </h2>
            <p className="text-sm font-medium">{order.user.name ?? "—"}</p>
            <a
              href={`mailto:${order.user.email}`}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 break-all"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {order.user.email}
            </a>
          </div>

          {addr && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-1.5">
              <h2 className="font-semibold flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t.orders.shippingAddress}
              </h2>
              {addr.street && <p className="text-sm">{addr.street}</p>}
              <p className="text-sm text-muted-foreground">
                {[addr.city, addr.zip].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
