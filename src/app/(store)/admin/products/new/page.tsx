import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminProductForm } from "../admin-product-form";

export const metadata = { title: "Add Product — Admin" };

export default async function AdminNewProductPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect("/");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Add Product</h1>
      <AdminProductForm categories={categories} />
    </div>
  );
}
