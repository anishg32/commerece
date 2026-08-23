import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await dbConnect();
    const reviews = await Review.find({ product: resolvedParams.id, isApproved: true })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, reviewText } = await request.json();

    if (!rating || rating < 1 || rating > 5 || !reviewText) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }

    await dbConnect();

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      product: resolvedParams.id,
      user: session.user.id
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
    }

    // Check if user actually purchased this product
    const orderWithProduct = await Order.findOne({
      user: session.user.id,
      status: "Delivered",
      "orderItems.product": resolvedParams.id
    });

    const isVerifiedPurchase = !!orderWithProduct;

    const review = await Review.create({
      product: resolvedParams.id,
      user: session.user.id,
      rating,
      reviewText,
      isVerifiedPurchase
    });

    // Update product average rating
    const allReviews = await Review.find({ product: resolvedParams.id, isApproved: true });
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(resolvedParams.id, {
      rating: avgRating,
      numReviews: allReviews.length
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || "Failed to submit review" },
      { status: 500 }
    );
  }
}
