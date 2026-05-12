"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Package } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const paymentColors: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  UNPAID: "bg-red-100 text-red-800 border-red-200",
  PARTIAL: "bg-orange-100 text-orange-800 border-orange-200",
};

interface OrderItem {
  id: string;
  product: { id: string; title: string; images: string[]; slug: string };
}

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  items: OrderItem[];
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const t = useT();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t.orders.title} ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t.orders.noOrders}</p>
          <Link href="/products" className="text-primary text-sm mt-2 inline-block hover:underline">
            {t.orders.startShopping}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`}>
              <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-mono text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(order.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[order.status] ?? ""}`}>
                      {t.orders.statuses[order.status as keyof typeof t.orders.statuses] ?? order.status}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${paymentColors[order.paymentStatus] ?? ""}`}>
                      {t.orders.paymentStatuses[order.paymentStatus as keyof typeof t.orders.paymentStatuses] ?? order.paymentStatus}
                    </span>
                    <span className="text-sm font-bold">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <Image
                        src={item.product.images[0] ?? ""}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
