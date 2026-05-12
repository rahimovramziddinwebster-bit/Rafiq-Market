import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import slugify from "slugify";

function makeSlug(title: string) {
  return slugify(title, { lower: true, strict: true }) + "-" + Date.now();
}

async function getAdminStore(userId: string) {
  let store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) {
    store = await prisma.store.create({
      data: { name: "Main Store", ownerId: userId, isVerified: true },
    });
  }
  return store;
}

const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  discountPrice: z.number().optional().nullable(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string()).min(1),
  categoryId: z.string(),
  isActive: z.boolean().optional().default(true),
  variants: z.array(z.object({
    name: z.string(),
    value: z.string(),
    priceModifier: z.number(),
    stock: z.number().int().nonnegative(),
  })).optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } }, store: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session!.user as { id: string }).id;
  const store = await getAdminStore(userId);
  const body = productSchema.parse(await req.json());
  const { variants, ...productData } = body;

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug: makeSlug(productData.title),
      storeId: store.id,
      ...(variants && { variants: { create: variants } }),
    },
    include: { variants: true },
  });

  return NextResponse.json(product, { status: 201 });
}
