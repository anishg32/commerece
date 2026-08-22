import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Get product counts
    const counts = await Product.aggregate([
      { $match: { isActive: true, isDeleted: { $ne: true } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c: any) => [c._id.toString(), c.count]));

    const categoriesWithCounts = categories.map((cat: any) => ({
      ...cat,
      productCount: countMap.get(cat._id.toString()) || 0,
    }));

    return NextResponse.json(categoriesWithCounts);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    if (!data.name?.trim()) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    // Generate subcategory slugs
    if (data.subcategories) {
      data.subcategories = data.subcategories.map((sub: any) => ({
        ...sub,
        slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      }));
    }

    const category = await Category.create(data);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "Category slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ message: "Category ID is required" }, { status: 400 });
    }

    // Generate subcategory slugs
    if (updateData.subcategories) {
      updateData.subcategories = updateData.subcategories.map((sub: any) => ({
        ...sub,
        slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      }));
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Category ID is required" }, { status: 400 });
    }

    // Check for products in this category
    const productCount = await Product.countDocuments({ category: id, isDeleted: { $ne: true } });
    if (productCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete: ${productCount} products are in this category` },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
