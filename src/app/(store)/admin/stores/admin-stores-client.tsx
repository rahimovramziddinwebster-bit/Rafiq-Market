"use client";

import { useT } from "@/lib/i18n";
import { CheckCircle, XCircle } from "lucide-react";
import { StoreVerifyButton } from "./store-verify-button";

interface StoreEntry {
  id: string;
  name: string;
  description: string | null;
  isVerified: boolean;
  owner: { name: string | null; email: string | null };
  _count: { products: number };
}

export function AdminStoresClient({ stores }: { stores: StoreEntry[] }) {
  const t = useT();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t.admin.storesTitle} ({stores.length})</h1>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.admin.storeCol}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t.admin.ownerCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t.admin.productsCol}</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.admin.statusCol}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t.admin.actionCol}</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-40">{s.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-sm">{s.owner.name}</p>
                  <p className="text-xs text-muted-foreground">{s.owner.email}</p>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">{s._count.products}</td>
                <td className="px-4 py-3 text-center">
                  {s.isVerified ? (
                    <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> {t.admin.verified}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                      <XCircle className="w-3.5 h-3.5" /> {t.admin.pending}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <StoreVerifyButton id={s.id} isVerified={s.isVerified} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
