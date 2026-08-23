import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

// Middleware to check admin role
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    await dbConnect();
    
    const coupon = await Coupon.create(body);
    
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || "Failed to create coupon" },
      { status: 500 }
    );
  }
}
