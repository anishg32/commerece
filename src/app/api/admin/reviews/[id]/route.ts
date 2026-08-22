import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return false;
  }
  return true;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isApproved } = await request.json();
    await dbConnect();
    
    const review = await Review.findByIdAndUpdate(
      resolvedParams.id, 
      { isApproved },
      { new: true }
    );

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    // Recalculate average rating for product
    const allReviews = await Review.find({ product: review.product, isApproved: true });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
      : 0;
    
    await Product.findByIdAndUpdate(review.product, {
      rating: avgRating,
      numReviews: allReviews.length
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const review = await Review.findByIdAndDelete(resolvedParams.id);
    
    if (review) {
      // Recalculate average rating
      const allReviews = await Review.find({ product: review.product, isApproved: true });
      const avgRating = allReviews.length > 0 
        ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
        : 0;
      
      await Product.findByIdAndUpdate(review.product, {
        rating: avgRating,
        numReviews: allReviews.length
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
