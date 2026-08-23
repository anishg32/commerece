import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code || !cartTotal) {
      return NextResponse.json(
        { error: "Coupon code and cart total are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    const now = new Date();
    if (now < coupon.startDate) {
      return NextResponse.json({ error: "Coupon is not yet active" }, { status: 400 });
    }
    if (now > coupon.expirationDate) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    if (cartTotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${coupon.minOrderAmount} required` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountAmount,
      description: coupon.description
    });
  } catch (error: unknown) {
    console.error("Error applying coupon:", error);
    return NextResponse.json(
      { error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}
