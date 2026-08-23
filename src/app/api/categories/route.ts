import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();

    // Get all active categories
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    // Get product counts per category (only active products)
    const counts = await Product.aggregate([
      { $match: { isActive: true, isDeleted: { $ne: true }, status: "ACTIVE" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map(counts.map((c: Record<string, any>) => [c._id.toString(), c.count]));

    const categoriesWithCounts = categories.map((cat: Record<string, any>) => ({
      ...cat,
      productCount: countMap.get(cat._id.toString()) || 0,
    }));

    return NextResponse.json(categoriesWithCounts);
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
