import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "products";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files provided" },
        { status: 400 }
      );
    }

    const uploadResults = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadImage(buffer, folder);
      uploadResults.push({
        url: result.url,
        publicId: result.publicId,
        originalName: file.name,
      });
    }

    return NextResponse.json({ images: uploadResults }, { status: 201 });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: (error instanceof Error ? error.message : String(error)) || "Upload failed" },
      { status: 500 }
    );
  }
}
