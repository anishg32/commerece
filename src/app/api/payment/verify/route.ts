import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import CheckoutSession from "@/models/CheckoutSession";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyPaymentSignature, generateOrderId } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const { sessionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    if (!sessionId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: "Missing payment details" }, { status: 400 });
    }

    const checkoutSession = await CheckoutSession.findById(sessionId);

    if (!checkoutSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    if (checkoutSession.status === "completed") {
      return NextResponse.json({ message: "Order already processed" }, { status: 400 });
    }

    // Verify Razorpay signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      checkoutSession.status = "failed";
      await checkoutSession.save();
      return NextResponse.json({ message: "Invalid payment signature" }, { status: 400 });
    }

    // Begin transaction for safety (optional if replica set not enabled, but good practice)
    // We will do atomic updates for inventory
    
    // 1. Create Order
    const newOrder = await Order.create({
      orderId: generateOrderId(),
      user: session.user.id,
      orderItems: checkoutSession.items,
      shippingAddress: checkoutSession.shippingAddress,
      customerInfo: checkoutSession.customerInfo,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      itemsPrice: checkoutSession.itemsPrice,
      discountAmount: checkoutSession.discountAmount,
      taxPrice: checkoutSession.taxPrice,
      shippingPrice: checkoutSession.shippingPrice,
      totalPrice: checkoutSession.totalPrice,
      isPaid: true,
      paidAt: new Date(),
      status: "Confirmed"
    });

    // 2. Reduce Inventory
    for (const item of checkoutSession.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true } // ensures atomic operation
      );
    }

    // 3. Mark session completed
    checkoutSession.status = "completed";
    await checkoutSession.save();

    return NextResponse.json({ orderId: newOrder.orderId, success: true });
  } catch (error: unknown) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) || "Payment verification failed" }, { status: 500 });
  }
}
