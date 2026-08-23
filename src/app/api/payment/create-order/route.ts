import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import CheckoutSession from "@/models/CheckoutSession";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const { sessionId, customer, shipping } = data;

    if (!sessionId || !customer || !shipping) {
      return NextResponse.json({ message: "Missing required information" }, { status: 400 });
    }

    const checkoutSession = await CheckoutSession.findById(sessionId);

    if (!checkoutSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    if (checkoutSession.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (checkoutSession.status === "completed" || checkoutSession.status === "failed") {
      return NextResponse.json({ message: "Session already processed" }, { status: 400 });
    }

    // Save customer & shipping info to session
    checkoutSession.customerInfo = customer;
    checkoutSession.shippingAddress = shipping;
    checkoutSession.paymentMethod = "razorpay";
    checkoutSession.status = "payment_initiated";

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(checkoutSession.totalPrice * 100);

    // Create Razorpay Order
    const razorpayOrder = await createRazorpayOrder(
      amountInPaise,
      "INR", // Configurable via SiteSettings if needed
      `rcpt_${checkoutSession._id.toString().substring(0, 10)}`
    );

    checkoutSession.razorpayOrderId = razorpayOrder.id;
    await checkoutSession.save();

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });
  } catch (error: unknown) {
    console.error("Create Razorpay Order Error:", error);
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) || "Failed to create payment order" }, { status: 500 });
  }
}
