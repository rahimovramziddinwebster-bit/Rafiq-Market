import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const category = searchParams.get("category");
  const search = searchParams.get("q");
  const sort = searchParams.get("sort") ?? "newest";
  const minPrice = parseFloat(searchParams.get("minPrice") ?? "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") ?? "999999999");
  const rating = parseFloat(searchParams.get("rating") ?? "0");
  const inStock = searchParams.get("inStock") === "true";

  const where = {
    isActive: true,
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    price: { gte: minPrice, lte: maxPrice },
    ...(rating > 0 && { rating: { gte: rating } }),
    ...(inStock && { stock: { gt: 0 } }),
  };

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
      ? { price: "desc" as const }
      : sort === "rating"
      ? { rating: "desc" as const }
      : { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        store: { select: { id: true, name: true, logo: true, isVerified: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit), page });
}
