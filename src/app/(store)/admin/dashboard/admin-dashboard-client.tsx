"use client";

import { useT } from "@/lib/i18n";
import { DollarSign, Users, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  user: { name: string | null; email: string | null };
}

interface Props {
  totalRevenue: number;
  totalCustomers: number;
  pendingOrdersCount: number;
  unpaidTotal: number;
  recentOrders: Order[];
}

const orderStatusColors: Record<string, string> = {
  PENDING: "text-yellow-700 bg-yellow-50",
  PAID: "text-blue-700 bg-blue-50",
  SHIPPED: "text-purple-700 bg-purple-50",
  DELIVERED: "text-green-700 bg-green-50",
  CANCELLED: "text-red-700 bg-red-50",
};

const paymentStatusColors: Record<string, string> = {
  PAID: "text-green-700 bg-green-50",
  UNPAID: "text-red-700 bg-red-50",
  PARTIAL: "text-orange-700 bg-orange-50",
};

export function AdminDashboardClient({ totalRevenue, totalCustomers, pendingOrdersCount, unpaidTotal, recentOrders }: Props) {
  const t = useT();

  const stats = [
    {
      label: t.admin.totalRevenueStat,
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: t.admin.totalCustomersStat,
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: t.admin.pendingOrdersStat,
      value: pendingOrdersCount.toLocaleString(),
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: t.admin.unpaidTotalStat,
      value: `$${unpaidTotal.toFixed(2)}`,
      icon: AlertCircle,
      color: unpaidTotal > 0 ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-50",
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t.admin.platformOverview}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" /> {t.admin.recentOrders}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="text-left pb-3">{t.admin.orderCol}</th>
                <th className="text-left pb-3 hidden md:table-cell">{t.admin.customerCol}</th>
                <th className="text-right pb-3">{t.admin.amountCol}</th>
                <th className="text-center pb-3">{t.admin.statusCol}</th>
                <th className="text-center pb-3">{t.admin.paymentStatusCol}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-3 font-mono text-xs text-muted-foreground">#{o.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 hidden md:table-cell">
                    <p className="font-medium">{o.user.name}</p>
                    <p className="text-xs text-muted-foreground">{o.user.email}</p>
                  </td>
                  <td className="py-3 text-right font-bold">${o.totalAmount.toFixed(2)}</td>
                  <td className="py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${orderStatusColors[o.status] ?? ""}`}>
                      {t.orders.statuses[o.status as keyof typeof t.orders.statuses] ?? o.status}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${paymentStatusColors[o.paymentStatus] ?? ""}`}>
                      {t.orders.paymentStatuses[o.paymentStatus as keyof typeof t.orders.paymentStatuses] ?? o.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
