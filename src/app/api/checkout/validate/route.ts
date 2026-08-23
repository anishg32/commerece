import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json({ message: "Invalid cart items" }, { status: 400 });
    }

    const validationResults = [];
    let hasChanges = false;

    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      
      if (!product || !product.isActive || product.isDeleted) {
        validationResults.push({
          _id: item._id,
          status: "unavailable",
          message: `${item.name} is no longer available`
        });
        hasChanges = true;
        continue;
      }

      const currentPrice = product.discountPrice || product.price;
      
      let status = "ok";
      let message = "";
      
      if (currentPrice !== item.price) {
        status = "price_changed";
        message = `Price updated from ₹${item.price} to ₹${currentPrice}`;
        hasChanges = true;
      } else if (product.stock < item.quantity) {
        status = "low_stock";
        message = `Only ${product.stock} items left in stock`;
        hasChanges = true;
      }

      validationResults.push({
        _id: item._id,
        name: product.name,
        price: currentPrice,
        image: product.thumbnail || product.images?.[0]?.url || "",
        stock: product.stock,
        status,
        message
      });
    }

    return NextResponse.json({
      hasChanges,
      items: validationResults
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
