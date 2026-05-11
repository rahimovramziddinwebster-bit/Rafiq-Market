"use client";

import { useT } from "@/lib/i18n";
import { format } from "date-fns";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; title: string; images: string[] };
}

interface Order {
  id: string;
  status: string;
  createdAt: Date;
  user: { name: string | null; email: string | null };
}

interface OrderGroup {
  id: string;
  order: Order;
  items: OrderItem[];
  revenue: number;
}

export function SellerOrdersClient({ orders }: { orders: OrderGroup[] }) {
  const t = useT();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t.seller.incomingOrders} ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>{t.seller.noOrders}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(({ id, order, items, revenue }) => (
            <div key={id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-mono text-muted-foreground">#{id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground">{order.user.name} · {order.user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <OrderStatusBadge orderId={id} status={order.status} />
                  <span className="text-sm font-bold">${revenue.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground w-5 text-right">{item.quantity}×</span>
                    <span className="font-medium flex-1 truncate">{item.product.title}</span>
                    <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
