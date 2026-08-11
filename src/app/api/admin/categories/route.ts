import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  parentId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { name, slug, parentId } = parsed.data;

  const taken = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (taken) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { name, slug, parentId: parentId || null },
  });

  return NextResponse.json(category, { status: 201 });
}
