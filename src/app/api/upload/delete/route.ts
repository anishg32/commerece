import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { message: "Public ID is required" },
        { status: 400 }
      );
    }

    await deleteImage(publicId);

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
