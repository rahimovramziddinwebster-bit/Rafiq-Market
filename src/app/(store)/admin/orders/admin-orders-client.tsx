"use client";

import { useT } from "@/lib/i18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  user: { name: string | null; email: string | null };
  _count: { items: number };
}

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-700 bg-yellow-50",
  PAID: "text-blue-700 bg-blue-50",
  SHIPPED: "text-purple-700 bg-purple-50",
  DELIVERED: "text-green-700 bg-green-50",
  CANCELLED: "text-red-700 bg-red-50",
};

const paymentColors: Record<string, string> = {
  PAID: "text-green-700 bg-green-50",
  UNPAID: "text-red-700 bg-red-50",
  PARTIAL: "text-orange-700 bg-orange-50",
};

function PaymentToggle({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) {
  const t = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(paymentStatus);

  const toggle = async () => {
    const next = current === "PAID" ? "UNPAID" : "PAID";
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: next }),
      });
      if (!res.ok) throw new Error();
      setCurrent(next);
      toast.success(t.admin.paymentUpdated);
      router.refresh();
    } catch {
      toast.error(t.admin.paymentUpdateFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${paymentColors[current] ?? ""}`}>
        {t.orders.paymentStatuses[current as keyof typeof t.orders.paymentStatuses] ?? current}
      </span>
      <button
        onClick={toggle}
        disabled={loading}
        className="text-xs text-muted-foreground hover:text-primary underline cursor-pointer disabled:opacity-50"
      >
        {current === "PAID" ? t.admin.markUnpaid : t.admin.markPaid}
      </button>
    </div>
  );
}

export function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const t = useT();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t.admin.ordersTitle} ({orders.length})</h1>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.admin.orderCol}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t.admin.customerCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t.admin.amountCol}</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.admin.statusCol}</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.admin.paymentStatusCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t.admin.dateCol}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">
                  #{o.id.slice(-8).toUpperCase()}
                  <span className="text-muted-foreground ml-2">({o._count.items} {t.admin.itemsCount})</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="font-medium">{o.user.name}</p>
                  <p className="text-xs text-muted-foreground">{o.user.email}</p>
                </td>
                <td className="px-4 py-3 text-right font-bold">${o.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[o.status] ?? ""}`}>
                    {t.orders.statuses[o.status as keyof typeof t.orders.statuses] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <PaymentToggle orderId={o.id} paymentStatus={o.paymentStatus} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                  {format(new Date(o.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
