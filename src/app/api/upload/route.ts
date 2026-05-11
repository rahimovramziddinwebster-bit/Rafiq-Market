import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { image } = await req.json();
  if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

  const matches = (image as string).match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return NextResponse.json({ error: "Invalid image format" }, { status: 400 });

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const uploadDir = join(process.cwd(), "public", "images", "products");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), Buffer.from(matches[2], "base64"));

  return NextResponse.json({ url: `/images/products/${filename}` });
}
