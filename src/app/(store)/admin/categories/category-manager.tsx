"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ChevronRight, Tag, Pencil, ImageIcon, Trash2, Upload, X } from "lucide-react";
import { useT } from "@/lib/i18n";

interface CategoryBase {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count: { products: number };
}

interface Category extends CategoryBase {
  children?: CategoryBase[];
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

function EditCategoryDialog({
  category,
  onClose,
}: {
  category: CategoryBase;
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [image, setImage] = useState<string | null>(category.image);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        });
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        setImage(url);
      } catch {
        toast.error(t.admin.imageUploadFailed);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const save = async () => {
    if (name.trim().length < 2 || slug.trim().length < 2) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), image }),
      });
      if (!res.ok) throw new Error();
      toast.success(t.admin.categoryUpdated);
      router.refresh();
      onClose();
    } catch {
      toast.error(t.admin.categoryUpdateFailed);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`${t.admin.deleteCategory}: ${category.name}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      if (res.status === 409) {
        toast.error(t.admin.categoryNotEmpty);
        return;
      }
      if (!res.ok) throw new Error();
      toast.success(t.admin.categoryDeleted);
      router.refresh();
      onClose();
    } catch {
      toast.error(t.admin.categoryDeleteFailed);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.admin.editCategory}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div>
            <Label className="mb-2 block text-xs">{t.admin.catImage}</Label>
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                {image ? (
                  <Image src={image} alt={name} fill className="object-cover" sizes="80px" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {uploading
                    ? t.admin.uploading
                    : image
                    ? t.admin.changeImage
                    : t.admin.uploadImage}
                </Button>
                {image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImage(null)}
                    className="cursor-pointer text-muted-foreground"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    {t.admin.removeImage}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Name / slug */}
          <div>
            <Label className="mb-1 block text-xs">{t.admin.catName}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">{t.admin.catSlug}</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={remove}
              disabled={deleting || saving}
              className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t.admin.deleteCategory}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="cursor-pointer"
              >
                {t.admin.cancel}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={save}
                disabled={saving || uploading || name.trim().length < 2 || slug.trim().length < 2}
                className="cursor-pointer"
              >
                {saving ? t.admin.uploading : t.admin.save}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({
  category,
  isChild,
  productsLabel,
  onEdit,
}: {
  category: CategoryBase;
  isChild?: boolean;
  productsLabel: string;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className={`group w-full flex items-center justify-between px-4 border-b border-border last:border-0 text-left cursor-pointer hover:bg-accent/50 transition-colors ${
        isChild ? "py-2 bg-muted/20" : "py-3"
      }`}
    >
      <div className={`flex items-center gap-2 min-w-0 ${isChild ? "pl-4" : ""}`}>
        {isChild ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <Tag className="w-4 h-4 text-primary shrink-0" />
        )}
        {category.image && (
          <span className="relative w-7 h-7 rounded-md overflow-hidden bg-muted shrink-0">
            <Image src={category.image} alt={category.name} fill className="object-cover" sizes="28px" />
          </span>
        )}
        <span className={`truncate ${isChild ? "text-sm" : "font-medium"}`}>{category.name}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          ({category._count.products}{isChild ? "" : ` ${productsLabel}`})
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">{category.slug}</span>
        <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CategoryBase | null>(null);

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
            <CategoryRow
              category={cat}
              productsLabel={t.admin.products}
              onEdit={() => setEditing(cat)}
            />
            {cat.children?.map((child) => (
              <CategoryRow
                key={child.id}
                category={child}
                isChild
                productsLabel={t.admin.products}
                onEdit={() => setEditing(child)}
              />
            ))}
          </div>
        ))}
      </div>

      {editing && (
        <EditCategoryDialog
          key={editing.id}
          category={editing}
          onClose={() => setEditing(null)}
        />
      )}

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
