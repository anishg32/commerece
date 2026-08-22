import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const brand = searchParams.get("brand") || "";
    const sort = searchParams.get("sort") || "newest"; // newest, price_asc, price_desc, rating
    
    // Base query: Only active and non-deleted products
    const query: any = { isActive: true, isDeleted: { $ne: true } };

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    // Price filter (uses discountPrice if exists, else price)
    if (minPrice > 0 || maxPrice > 0) {
      query.$or = [
        { 
          discountPrice: { $exists: true, $ne: null },
          $and: []
        },
        {
          discountPrice: { $exists: false },
          price: {}
        }
      ];
      
      const priceFilter: any = {};
      if (minPrice > 0) priceFilter.$gte = minPrice;
      if (maxPrice > 0) priceFilter.$lte = maxPrice;

      query.$or[0].$and.push({ discountPrice: priceFilter });
      query.$or[1].price = priceFilter;
      
      // Simplify if only one bound
      if (query.$or[0].$and.length === 0) delete query.$or;
    }

    // Brand filter
    if (brand) {
      query.brand = { $regex: `^${brand}$`, $options: "i" };
    }

    // Special flags
    if (searchParams.get("featured") === "true") query.isFeatured = true;
    if (searchParams.get("newArrival") === "true") query.isNewArrival = true;
    if (searchParams.get("bestseller") === "true") query.isBestseller = true;

    // Sorting
    let sortObj: any = { createdAt: -1 };
    switch (sort) {
      case "price_asc": sortObj = { activePrice: 1 }; break;
      case "price_desc": sortObj = { activePrice: -1 }; break;
      case "rating": sortObj = { rating: -1, numReviews: -1 }; break;
      case "newest": default: sortObj = { createdAt: -1 }; break;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
