import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductForm } from "../product-form";
import { SellerProductTitle } from "../seller-products-client";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <SellerProductTitle />
      <ProductForm categories={categories} />
    </div>
  );
}
