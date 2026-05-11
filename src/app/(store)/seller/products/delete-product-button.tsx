"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = useT();

  const handleDelete = async () => {
    if (!confirm(t.seller.deleteConfirm)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
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
