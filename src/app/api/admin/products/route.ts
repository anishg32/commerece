import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status"); // "active", "inactive", "all"

    const query: any = { isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    if (status === "active") query.isActive = true;
    else if (status === "inactive") query.isActive = false;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
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

    // Validation
    const errors: string[] = [];
    if (!data.name?.trim()) errors.push("Product name is required");
    if (!data.description?.trim()) errors.push("Description is required");
    if (!data.price || data.price <= 0) errors.push("Valid price is required");
    if (!data.sku?.trim()) errors.push("SKU is required");
    if (data.stock === undefined || data.stock < 0) errors.push("Valid stock is required");
    if (!data.category) errors.push("Category is required");

    if (errors.length > 0) {
      return NextResponse.json({ message: errors.join(", "), errors }, { status: 400 });
    }

    // Auto-generate slug
    if (!data.slug && data.name) {
      let baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      data.slug = slug;
    }

    // Auto-calculate discount percentage
    if (data.discountPrice && data.price) {
      data.discountPercentage = Math.round(
        ((data.price - data.discountPrice) / data.price) * 100
      );
    }

    // Set thumbnail to first image if not specified
    if (!data.thumbnail && data.images?.length > 0) {
      data.thumbnail = data.images[0];
    }

    const product = await Product.create(data);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A product with this SKU or slug already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
