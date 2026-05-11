import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { WishlistTitle, WishlistEmpty } from "./wishlist-text";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;

  const wishlist = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: { store: { select: { name: true, isVerified: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <WishlistTitle count={wishlist.length} />

      {wishlist.length === 0 ? (
        <WishlistEmpty />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
