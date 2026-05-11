"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useT } from "@/lib/i18n";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Store {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  isVerified: boolean;
}

export function StoreSettingsForm({ store }: { store: Store }) {
  const [saving, setSaving] = useState(false);
  const t = useT();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: store.name, description: store.description ?? "" },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/seller/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(t.seller.storeUpdated);
    } catch {
      toast.error(t.seller.storeUpdateFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
          {store.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{store.name}</p>
            {store.isVerified && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckCircle className="w-3 h-3 text-primary" /> {t.seller.verified}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{t.seller.storeIdLabel} {store.id.slice(-8)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="mb-1.5 block">{t.seller.storeName}</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label className="mb-1.5 block">{t.seller.storeDescription}</Label>
          <Textarea {...register("description")} rows={3} placeholder={t.seller.storeDescPlaceholder} />
        </div>
        <Button type="submit" disabled={saving} className="cursor-pointer">
          {saving ? t.seller.formSaving : t.seller.saveChanges}
        </Button>
      </form>
    </div>
  );
}

export function StoreSettingsTitle() {
  const t = useT();
  return <h1 className="text-xl font-bold mb-6">{t.seller.storeSettingsTitle}</h1>;
}
