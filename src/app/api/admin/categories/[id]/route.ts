import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  image: z.string().url().nullable().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  return user?.role === "ADMIN";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.slug) {
    const taken = await prisma.category.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const counts = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true, children: true } } },
  });
  if (!counts) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (counts._count.products > 0 || counts._count.children > 0) {
    return NextResponse.json({ error: "Category is not empty" }, { status: 409 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
