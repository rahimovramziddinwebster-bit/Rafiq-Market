import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "../../product-form";
import { SellerProductTitle } from "../../seller-products-client";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) redirect("/auth/register");

  const product = await prisma.product.findFirst({
    where: { id, storeId: store.id },
    include: { variants: true },
  });
  if (!product) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <SellerProductTitle isEdit />
      <ProductForm
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
