import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CategoryManager, CategoriesTitle } from "./category-manager";

export const metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect("/");

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: { include: { _count: { select: { products: true } } } },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <CategoriesTitle />
      <CategoryManager categories={categories} />
    </div>
  );
}
