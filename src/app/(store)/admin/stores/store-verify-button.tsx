"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export function StoreVerifyButton({ id, isVerified }: { id: string; isVerified: boolean }) {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !isVerified }),
      });
      if (!res.ok) throw new Error();
      toast.success(isVerified ? t.admin.storeUnverified : t.admin.storeVerified);
      router.refresh();
    } catch {
      toast.error(t.admin.storeUpdateFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isVerified ? "outline" : "default"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="cursor-pointer h-7 text-xs"
    >
      {isVerified ? t.admin.unverify : t.admin.verify}
    </Button>
  );
}
