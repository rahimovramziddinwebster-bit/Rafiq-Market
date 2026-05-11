"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Address {
  id: string;
  city: string;
  street: string;
  zip: string;
  isDefault: boolean;
}

const schema = z.object({
  city: z.string().min(2),
  street: z.string().min(5),
  zip: z.string().min(4),
});
type FormData = z.infer<typeof schema>;

export function AddressManager({ addresses: initial }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useT();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onAdd = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const addr = await res.json();
      setAddresses((p) => [...p, addr]);
      reset();
      setShowForm(false);
      toast.success(t.addresses.added);
    } catch {
      toast.error(t.addresses.addFailed);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      setAddresses((p) => p.filter((a) => a.id !== id));
      toast.success(t.addresses.removed);
    } catch {
      toast.error(t.addresses.removeFailed);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      {addresses.map((addr) => (
        <div key={addr.id} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
          <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{addr.street}</p>
            <p className="text-sm text-muted-foreground">{addr.city}, {addr.zip}</p>
            {addr.isDefault && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-muted-foreground">{t.addresses.default}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onDelete(addr.id)}
            className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer p-1"
            aria-label="Delete address"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit(onAdd)} className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h3 className="font-medium text-sm">{t.addresses.newAddress}</h3>
          <div>
            <Label className="mb-1 block text-xs">{t.addresses.street}</Label>
            <Input {...register("street")} placeholder="123 Main Street" />
            {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs">{t.addresses.city}</Label>
              <Input {...register("city")} placeholder="Tashkent" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block text-xs">{t.addresses.zip}</Label>
              <Input {...register("zip")} placeholder="100000" />
              {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading} className="cursor-pointer">
              {loading ? t.addresses.saving : t.addresses.saveAddress}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setShowForm(false); reset(); }}
              className="cursor-pointer"
            >
              {t.addresses.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full cursor-pointer border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" /> {t.addresses.addNew}
        </Button>
      )}
    </div>
  );
}

export function AddressesTitle() {
  const t = useT();
  return <h1 className="text-xl font-bold mb-6">{t.addresses.pageTitle}</h1>;
}
