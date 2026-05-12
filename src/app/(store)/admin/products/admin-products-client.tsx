"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  isActive: boolean;
  images: string[];
  category: { name: string };
}

function ToggleActive({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const t = useT();

  const toggle = async (checked: boolean) => {
    setActive(checked);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setActive(!checked);
      toast.error(t.seller.statusUpdateFailed);
    }
  };

  return <Switch checked={active} onCheckedChange={toggle} aria-label="Toggle active" />;
}

function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = useT();

  const handleDelete = async () => {
    if (!confirm(t.seller.deleteConfirm)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(t.seller.productDeleted);
      router.refresh();
    } catch {
      toast.error(t.seller.deleteFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-red-500 cursor-pointer"
      onClick={handleDelete}
      disabled={loading}
      aria-label="Delete product"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

export function AdminProductsClient({ products }: { products: Product[] }) {
  const t = useT();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t.admin.productsNav} ({products.length})</h1>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" /> {t.seller.addProduct}
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>{t.seller.noProducts}</p>
          <Button asChild className="mt-4 cursor-pointer">
            <Link href="/admin/products/new">{t.seller.addFirst}</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.seller.productCol}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t.seller.categoryCol}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t.seller.priceCol}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t.seller.stockCol}</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.seller.statusCol}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t.seller.actionsCol}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <Image src={p.images[0] ?? ""} alt={p.title} fill className="object-cover" sizes="40px" />
                      </div>
                      <p className="font-medium truncate max-w-[160px]">{p.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.category.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${(p.discountPrice ?? p.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className={p.stock === 0 ? "text-red-500 font-medium" : ""}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ToggleActive id={p.id} isActive={p.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DeleteButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
