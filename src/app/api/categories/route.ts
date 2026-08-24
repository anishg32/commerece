import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query = includeInactive ? {} : { isActive: true };

    // 1. Fetch categories
    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // 2. Fetch direct product counts for each category
    const counts = await Product.aggregate([
      { $match: { isActive: true, isDeleted: { $ne: true }, status: "ACTIVE" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map(counts.map((c: any) => [c._id.toString(), c.count]));

    // 3. Build tree and calculate recursive product counts
    const categoryMap = new Map();
    const roots: any[] = [];

    // Initialize nodes
    categories.forEach((cat: any) => {
      categoryMap.set(cat._id.toString(), {
        ...cat,
        children: [],
        directProductCount: countMap.get(cat._id.toString()) || 0,
        productCount: 0 // Will be calculated
      });
    });

    // Build hierarchy
    categories.forEach((cat: any) => {
      const node = categoryMap.get(cat._id.toString());
      if (cat.parentId) {
        const parentIdStr = cat.parentId.toString();
        const parent = categoryMap.get(parentIdStr);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found or inactive, treat as root (or drop depending on business logic, here we treat as root)
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // Recursive function to calculate total product counts
    const calculateTotalCount = (node: any): number => {
      let total = node.directProductCount;
      for (const child of node.children) {
        total += calculateTotalCount(child);
      }
      node.productCount = total;
      return total;
    };

    // Apply count calculation to roots
    for (const root of roots) {
      calculateTotalCount(root);
    }

    return NextResponse.json(roots);
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
