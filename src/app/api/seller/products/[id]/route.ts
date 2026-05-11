import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) return NextResponse.json({ error: "No store" }, { status: 404 });

  const product = await prisma.product.findFirst({ where: { id, storeId: store.id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { variants, ...data } = body;

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(variants !== undefined && {
        variants: {
          deleteMany: {},
          create: variants,
        },
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
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) return NextResponse.json({ error: "No store" }, { status: 404 });

  await prisma.product.deleteMany({ where: { id, storeId: store.id } });
  return NextResponse.json({ success: true });
}
