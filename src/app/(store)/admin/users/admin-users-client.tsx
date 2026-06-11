"use client";

import { useT } from "@/lib/i18n";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  _count: { orders: number };
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  SELLER: "bg-purple-100 text-purple-700 border-purple-200",
  BUYER: "bg-blue-100 text-blue-700 border-blue-200",
};

export function AdminUsersClient({ users }: { users: User[] }) {
  const t = useT();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t.admin.usersTitle} ({users.length})</h1>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.admin.userCol}</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.admin.roleCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t.admin.ordersCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t.admin.joinedCol}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{u.name ?? "вЂ”"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className={`text-xs font-semibold ${roleColors[u.role] ?? ""}`}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">{u._count.orders}</td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                  {format(new Date(u.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
