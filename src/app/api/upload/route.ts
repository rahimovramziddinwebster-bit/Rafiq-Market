import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 503 });
  }

  const { image } = await req.json();
  if (!image) return NextResponse.json({ error: "No image" }, { status: 400 });

  if (!image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
  }

  const result = await cloudinary.uploader.upload(image, {
    folder: "rafiq-market/products",
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }],
  });

  return NextResponse.json({ url: result.secure_url });
}
