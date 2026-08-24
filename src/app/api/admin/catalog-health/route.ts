import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all categories
    const categories = await Category.find().lean();
    
    // We need to count ACTIVE products per category branch.
    // E.g., if "Mobiles & Tablets" has a child "Smartphones", products in "Smartphones" count towards both.
    
    // Build tree to resolve descendants easily
    const childrenMap = new Map<string, string[]>();
    for (const cat of categories) {
      if (cat.parentId) {
        const pId = cat.parentId.toString();
        if (!childrenMap.has(pId)) childrenMap.set(pId, []);
        childrenMap.get(pId)!.push(cat._id.toString());
      }
    }

    const getDescendants = (id: string): string[] => {
      const descendants: string[] = [];
      const children = childrenMap.get(id) || [];
      for (const child of children) {
        descendants.push(child);
        descendants.push(...getDescendants(child));
      }
      return descendants;
    };

    // Get product counts for each exact category
    const aggregationResult = await Product.aggregate([
      { $match: { status: "ACTIVE", isDeleted: false } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const exactCounts = new Map<string, number>();
    for (const res of aggregationResult) {
      if (res._id) {
        exactCounts.set(res._id.toString(), res.count);
      }
    }

    const healthData = categories.map((cat: any) => {
      const idStr = cat._id.toString();
      const descendants = getDescendants(idStr);
      const allIdsToSum = [idStr, ...descendants];
      
      let totalActive = 0;
      for (const cid of allIdsToSum) {
        totalActive += exactCounts.get(cid) || 0;
      }
      
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        isParent: !cat.parentId,
        productCount: totalActive,
        target: 50,
        missing: Math.max(0, 50 - totalActive),
        status: totalActive >= 50 ? "COMPLETE" : "INCOMPLETE",
      };
    });

    // Only return top-level categories for the main dashboard view, or all of them depending on preference.
    // The requirement is to ensure every active category has 50+. We'll return all, but sort parents first.
    healthData.sort((a, b) => {
      if (a.isParent && !b.isParent) return -1;
      if (!a.isParent && b.isParent) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(healthData);
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
