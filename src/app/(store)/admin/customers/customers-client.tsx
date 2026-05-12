"use client";

import { useT } from "@/lib/i18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  totalOrders: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

const paymentColors: Record<string, string> = {
  hasDebt: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  noOrders: "bg-gray-100 text-gray-600",
};

function UnpaidBadge({ amount }: { amount: number }) {
  const t = useT();
  const color = amount > 0 ? paymentColors.hasDebt : paymentColors.paid;
  const label = amount > 0
    ? `${t.admin.unpaidAmountCol}: $${amount.toFixed(2)}`
    : t.admin.markPaid;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}

export function CustomersClient({ customers: initial }: { customers: Customer[] }) {
  const t = useT();
  const router = useRouter();
  const [customers] = useState(initial);

  const totalUnpaid = customers.reduce((s, c) => s + c.unpaidAmount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t.admin.customersTitle}</h1>
        {totalUnpaid > 0 && (
          <div className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            {t.admin.unpaidAmountCol}: ${totalUnpaid.toFixed(2)}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.admin.customerNameCol}</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t.admin.totalOrdersCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t.admin.totalAmountCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t.admin.paidAmountCol}</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.admin.unpaidAmountCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t.admin.joinedCol}</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{c.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">{c.totalOrders}</td>
                <td className="px-4 py-3 text-right font-semibold hidden md:table-cell">
                  ${c.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-green-700 hidden md:table-cell">
                  ${c.paidAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <UnpaidBadge amount={c.unpaidAmount} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden sm:table-cell">
                  {format(new Date(c.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
