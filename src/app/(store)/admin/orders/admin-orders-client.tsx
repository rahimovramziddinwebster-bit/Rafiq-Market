"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, ShoppingBag, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderStatusSelect } from "./order-status-select";

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  user: { name: string | null; email: string | null };
  _count: { items: number };
}

const orderStatuses = ["ALL", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const paymentStatuses = ["ALL", "PAID", "UNPAID", "PARTIAL"] as const;

const paymentColors: Record<string, string> = {
  PAID: "text-green-700 bg-green-50 border-green-200",
  UNPAID: "text-red-700 bg-red-50 border-red-200",
  PARTIAL: "text-orange-700 bg-orange-50 border-orange-200",
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
      <span
        className={`text-xs font-semibold px-2 py-1 rounded-full border ${paymentColors[current] ?? ""}`}
      >
        {t.orders.paymentStatuses[current as keyof typeof t.orders.paymentStatuses] ?? current}
      </span>
      <button
        onClick={toggle}
        disabled={loading}
        className="text-[11px] text-muted-foreground hover:text-primary underline cursor-pointer disabled:opacity-50"
      >
        {current === "PAID" ? t.admin.markUnpaid : t.admin.markPaid}
      </button>
    </div>
  );
}

export function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const t = useT();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (paymentFilter !== "ALL" && o.paymentStatus !== paymentFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.user.name ?? "").toLowerCase().includes(q) ||
        (o.user.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, paymentFilter, query]);

  const summary = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
    const totalAmount = orders.reduce((s, o) => s + o.totalAmount, 0);
    return { total, pending, delivered, cancelled, totalAmount };
  }, [orders]);

  const stats = [
    {
      label: t.admin.totalOrders,
      value: summary.total.toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: t.admin.pendingOrdersStat,
      value: summary.pending.toLocaleString(),
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: t.orders.statuses.DELIVERED,
      value: summary.delivered.toLocaleString(),
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
    {
      label: t.orders.statuses.CANCELLED,
      value: summary.cancelled.toLocaleString(),
      icon: XCircle,
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-xl font-bold">
          {t.admin.ordersTitle}{" "}
          <span className="text-muted-foreground font-medium">({filtered.length}/{orders.length})</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.admin.totalAmountCol}: <span className="font-bold text-foreground">${summary.totalAmount.toFixed(2)}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.admin.ordersSearch}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {orderStatuses.map((s) => {
            const active = statusFilter === s;
            const label =
              s === "ALL" ? t.admin.allStatuses : t.orders.statuses[s as keyof typeof t.orders.statuses];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {paymentStatuses.map((p) => {
            const active = paymentFilter === p;
            const label =
              p === "ALL"
                ? t.admin.allPayments
                : t.orders.paymentStatuses[p as keyof typeof t.orders.paymentStatuses];
            return (
              <button
                key={p}
                onClick={() => setPaymentFilter(p)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border text-center py-16 text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t.admin.noOrdersFound}</p>
        </div>
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.admin.orderCol}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.admin.customerCol}</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t.admin.amountCol}</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.admin.statusCol}</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.admin.paymentStatusCol}</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">{t.admin.dateCol}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="hover:text-primary hover:underline transition-colors"
                      >
                        #{o.id.slice(-8).toUpperCase()}
                      </Link>
                      <span className="text-muted-foreground ml-2">
                        ({o._count.items} {t.admin.itemsCount})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.user.name}</p>
                      <p className="text-xs text-muted-foreground">{o.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">${o.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <OrderStatusSelect orderId={o.id} status={o.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PaymentToggle orderId={o.id} paymentStatus={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                      {format(new Date(o.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((o) => (
              <div key={o.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      #{o.id.slice(-8).toUpperCase()}
                    </Link>
                    <p className="font-medium truncate">{o.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(o.createdAt), "MMM d, yyyy")} · {o._count.items} {t.admin.itemsCount}
                    </p>
                  </div>
                  <span className="font-bold text-base shrink-0">${o.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                  <PaymentToggle orderId={o.id} paymentStatus={o.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
