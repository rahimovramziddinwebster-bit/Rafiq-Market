"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, ChevronRight, Tag } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  children?: Array<{ id: string; name: string; slug: string; _count: { products: number } }>;
}

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  parentId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function CategoriesTitle() {
  const t = useT();
  return <h1 className="text-xl font-bold mb-6">{t.admin.categoriesTitle}</h1>;
}

export function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(t.admin.categoryCreated);
      reset();
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error(t.admin.categoryCreateFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {initial.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span className="font-medium">{cat.name}</span>
                <span className="text-xs text-muted-foreground">({cat._count.products} {t.admin.products})</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{cat.slug}</span>
            </div>
            {cat.children?.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between px-4 py-2 border-b border-border last:border-0 bg-muted/20"
              >
                <div className="flex items-center gap-2 pl-4">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm">{child.name}</span>
                  <span className="text-xs text-muted-foreground">({child._count.products})</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{child.slug}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card rounded-xl border border-border p-5 space-y-3"
        >
          <h3 className="font-medium">{t.admin.newCategory}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs">{t.admin.catName}</Label>
              <Input {...register("name")} placeholder="Electronics" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block text-xs">{t.admin.catSlug}</Label>
              <Input {...register("slug")} placeholder="electronics" />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>
          </div>
          <div>
            <Label className="mb-1 block text-xs">{t.admin.parentCategory}</Label>
            <select
              {...register("parentId")}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">{t.admin.topLevel}</option>
              {initial.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving} className="cursor-pointer">
              {saving ? t.admin.creating : t.admin.createCategory}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setShowForm(false); reset(); }}
              className="cursor-pointer"
            >
              {t.admin.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="cursor-pointer border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" /> {t.admin.addCategory}
        </Button>
      )}
    </div>
  );
}
