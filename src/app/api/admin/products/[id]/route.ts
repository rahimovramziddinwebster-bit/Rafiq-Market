import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: { user?: unknown } | null) {
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN";
}

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  discountPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).min(1).optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(z.object({
    name: z.string(),
    value: z.string(),
    priceModifier: z.number(),
    stock: z.number().int().nonnegative(),
  })).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { variants, ...data } = parsed.data;

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(variants !== undefined && {
        variants: { deleteMany: {}, create: variants },
      }),
    },
    include: { variants: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
