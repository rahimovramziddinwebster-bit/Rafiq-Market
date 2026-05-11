"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useT } from "@/lib/i18n";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  discountPrice: z.number().optional().nullable(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().min(1),
  isActive: z.boolean(),
  images: z.array(z.string()).min(1),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        value: z.string().min(1),
        priceModifier: z.number(),
        stock: z.number().int().nonnegative(),
      })
    )
    .optional(),
});
type FormData = z.infer<typeof schema>;

interface Category { id: string; name: string; }
interface ProductFormProps {
  categories: Category[];
  defaultValues?: Partial<FormData> & { id?: string };
}

export function ProductForm({ categories, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const t = useT();

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { isActive: true, images: [], variants: [], ...defaultValues },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const images = watch("images") ?? [];
  const isActive = watch("isActive");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImageLoading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, folder: "products" }),
        });
        if (res.ok) {
          const { url } = await res.json();
          newUrls.push(url);
        }
      }
      setValue("images", [...images, ...newUrls]);
      if (newUrls.length > 0) toast.success(`${newUrls.length} ${t.seller.imagesUploaded}`);
    } catch {
      toast.error(t.seller.imageUploadFailed);
    } finally {
      setImageLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const url = defaultValues?.id ? `/api/seller/products/${defaultValues.id}` : "/api/seller/products";
      const method = defaultValues?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(defaultValues?.id ? t.seller.productUpdated : t.seller.productCreated);
      router.push("/seller/products");
      router.refresh();
    } catch {
      toast.error(t.seller.productSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold">{t.seller.basicInfo}</h2>
        <div>
          <Label className="mb-1.5 block">{t.seller.formTitle}</Label>
          <Input {...register("title")} placeholder={t.seller.formTitlePlaceholder} />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label className="mb-1.5 block">{t.seller.formDescription}</Label>
          <Textarea {...register("description")} rows={4} placeholder={t.seller.formDescPlaceholder} />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>
        <div>
          <Label className="mb-1.5 block">{t.seller.categoryCol}</Label>
          <Select onValueChange={(v) => v && setValue("categoryId", v)} defaultValue={defaultValues?.categoryId}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder={t.seller.selectCategory} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="cursor-pointer">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold">{t.seller.pricingStock}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 block">{t.seller.formPrice}</Label>
            <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <Label className="mb-1.5 block">{t.seller.formSalePrice}</Label>
            <Input type="number" step="0.01" {...register("discountPrice", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })} placeholder={t.seller.formOptional} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t.seller.formStock}</Label>
            <Input type="number" {...register("stock", { valueAsNumber: true })} />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} id="isActive" />
          <Label htmlFor="isActive">{t.seller.formActive}</Label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold">{t.seller.productImages}</h2>
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="120px" />
              <button
                type="button"
                onClick={() => setValue("images", images.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 cursor-pointer hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">{imageLoading ? t.seller.uploading : t.seller.upload}</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageUpload} disabled={imageLoading} />
          </label>
        </div>
        {errors.images && <p className="text-red-500 text-xs">{errors.images.message}</p>}
      </div>

      {/* Variants */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t.seller.variantsSection}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", value: "", priceModifier: 0, stock: 0 })}
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" /> {t.seller.addVariant}
          </Button>
        </div>
        {fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-4 gap-3 items-end">
            <div>
              <Label className="mb-1 block text-xs">{t.seller.variantName}</Label>
              <Input {...register(`variants.${i}.name`)} placeholder="e.g. Color" />
            </div>
            <div>
              <Label className="mb-1 block text-xs">{t.seller.variantValue}</Label>
              <Input {...register(`variants.${i}.value`)} placeholder="e.g. Red" />
            </div>
            <div>
              <Label className="mb-1 block text-xs">{t.seller.variantPrice}</Label>
              <Input type="number" step="0.01" {...register(`variants.${i}.priceModifier`, { valueAsNumber: true })} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="mb-1 block text-xs">{t.seller.variantStock}</Label>
                <Input type="number" {...register(`variants.${i}.stock`, { valueAsNumber: true })} />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="mb-0.5 self-end p-2 text-muted-foreground hover:text-red-500 cursor-pointer"
                aria-label="Remove variant"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="cursor-pointer font-semibold">
          {saving ? t.seller.formSaving : defaultValues?.id ? t.seller.updateProduct : t.seller.createProduct}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} className="cursor-pointer">
          {t.seller.formCancel}
        </Button>
      </div>
    </form>
  );
}
