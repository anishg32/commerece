import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

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
    
    // Base query: Only active, non-deleted, and VERIFIED ACTIVE products
    const query: Record<string, any> = { isActive: true, isDeleted: { $ne: true }, status: "ACTIVE" };

    // Search
    if (search) {
      // Find any brands that match the search term
      const matchedBrands = await Brand.find({ name: { $regex: search, $options: "i" } }).select("_id");
      const brandIds = matchedBrands.map(b => b._id);

      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
      
      if (brandIds.length > 0) {
        query.$or.push({ brand: { $in: brandIds } });
      }
    }

    // Category filter
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        const getAllDescendants = async (parentId: any): Promise<any[]> => {
          const children = await Category.find({ parentId });
          let descendantIds: any[] = [];
          for (const child of children) {
            descendantIds.push(child._id);
            const deeperDescendants = await getAllDescendants(child._id);
            descendantIds = descendantIds.concat(deeperDescendants);
          }
          return descendantIds;
        };
        const descendantIds = await getAllDescendants(cat._id);
        query.category = { $in: [cat._id, ...descendantIds] };
      }
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

    // Brand filter (can accept brand slug or ObjectId)
    if (brand) {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        query.brand = brand;
      } else {
        const brandDoc = await Brand.findOne({ slug: brand });
        if (brandDoc) query.brand = brandDoc._id;
      }
    }

    // Dynamic Attribute filters
    // Look for any query parameter that starts with "attr_"
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        const attributeName = key.replace("attr_", "");
        // Support multiple values via comma separation
        const values = value.split(",").map(v => v.trim());
        if (values.length > 1) {
          query[`attributes.${attributeName}`] = { $in: values };
        } else {
          query[`attributes.${attributeName}`] = value;
        }
      }
    });

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
    
    // Aggregate available filters (Brands and Attributes)
    const filters: any = { brands: [], attributes: {} };
    if (total > 0 && total < 5000) { // Safety limit for aggregation
      const aggResult = await Product.aggregate([
        { $match: query },
        { $project: { brand: 1, attributes: 1 } }
      ]);
      
      const brandIds = new Set<string>();
      aggResult.forEach(p => {
        if (p.brand) brandIds.add(p.brand.toString());
        if (p.attributes) {
          Object.entries(p.attributes).forEach(([k, v]) => {
            if (!filters.attributes[k]) filters.attributes[k] = new Set();
            filters.attributes[k].add(String(v));
          });
        }
      });
      
      if (brandIds.size > 0) {
        const brands = await Brand.find({ _id: { $in: Array.from(brandIds) } }).select("name slug").lean();
        filters.brands = brands;
      }
      
      // Convert sets to arrays
      Object.keys(filters.attributes).forEach(k => {
        filters.attributes[k] = Array.from(filters.attributes[k]).sort();
      });
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
      filters
    });
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
