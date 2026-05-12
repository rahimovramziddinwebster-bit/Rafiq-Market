import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { AdminProductForm } from "../../admin-product-form";

export const metadata = { title: "Edit Product — Admin" };

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!product) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Edit Product</h1>
      <AdminProductForm
        categories={categories}
        defaultValues={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
          categoryId: product.categoryId,
          isActive: product.isActive,
          images: product.images,
          variants: product.variants.map((v) => ({
            name: v.name,
            value: v.value,
            priceModifier: v.priceModifier,
            stock: v.stock,
          })),
        }}
      />
    </div>
  );
}
