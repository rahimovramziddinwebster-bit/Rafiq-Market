import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  city: z.string().min(2).max(100),
  street: z.string().min(5).max(200),
  zip: z.string().min(4).max(20),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const parsed = addressSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const address = await prisma.address.create({
    data: { userId, ...parsed.data },
  });

  return NextResponse.json(address, { status: 201 });
}
