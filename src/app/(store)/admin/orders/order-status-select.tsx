"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useT } from "@/lib/i18n";

const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const colors: Record<string, string> = {
  PENDING: "text-yellow-700 bg-yellow-50 border-yellow-200",
  PAID: "text-blue-700 bg-blue-50 border-blue-200",
  SHIPPED: "text-purple-700 bg-purple-50 border-purple-200",
  DELIVERED: "text-green-700 bg-green-50 border-green-200",
  CANCELLED: "text-red-700 bg-red-50 border-red-200",
};

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const router = useRouter();
  const t = useT();

  const update = async (value: string | null) => {
    if (!value || value === current) return;
    const prev = current;
    setCurrent(value);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        `${t.admin.statusUpdated} ${t.orders.statuses[value as keyof typeof t.orders.statuses] ?? value}`
      );
      router.refresh();
    } catch {
      setCurrent(prev);
      toast.error(t.admin.statusUpdateFailed);
    }
  };

  return (
    <Select value={current} onValueChange={update}>
      <SelectTrigger
        className={`h-7 text-xs w-32 font-semibold border ${colors[current] ?? ""} cursor-pointer`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s} className="text-xs cursor-pointer">
            {t.orders.statuses[s as keyof typeof t.orders.statuses]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
