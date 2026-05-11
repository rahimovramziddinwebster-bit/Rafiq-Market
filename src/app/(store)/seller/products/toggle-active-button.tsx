"use client";

import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const t = useT();

  const toggle = async (checked: boolean) => {
    setActive(checked);
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
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

  return (
    <Switch
      checked={active}
      onCheckedChange={toggle}
      aria-label="Toggle product active status"
    />
  );
}
