import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import CheckoutSession from "@/models/CheckoutSession";
import Order from "@/models/Order";
import Product from "@/models/Product";
import SiteSettings from "@/models/SiteSettings";
import { generateOrderId } from "@/lib/razorpay";

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

    // Verify COD is enabled
    const settings = await (SiteSettings as any).getSettings();
    if (!settings.codEnabled) {
      return NextResponse.json({ message: "Cash on Delivery is disabled" }, { status: 400 });
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

    // Check COD limits
    if (checkoutSession.totalPrice < settings.codMinAmount) {
      return NextResponse.json({ message: `Minimum order amount for COD is ₹${settings.codMinAmount}` }, { status: 400 });
    }
    if (checkoutSession.totalPrice > settings.codMaxAmount) {
      return NextResponse.json({ message: `Maximum order amount for COD is ₹${settings.codMaxAmount}` }, { status: 400 });
    }

    // 1. Create Order
    const newOrder = await Order.create({
      orderId: generateOrderId(),
      user: session.user.id,
      orderItems: checkoutSession.items,
      shippingAddress: shipping,
      customerInfo: customer,
      paymentMethod: "cod",
      paymentStatus: "pending",
      itemsPrice: checkoutSession.itemsPrice,
      discountAmount: checkoutSession.discountAmount,
      taxPrice: checkoutSession.taxPrice,
      shippingPrice: checkoutSession.shippingPrice,
      totalPrice: checkoutSession.totalPrice,
      isPaid: false,
      status: "Pending" // Will be confirmed by admin or delivery partner
    });

    // 2. Reduce Inventory
    for (const item of checkoutSession.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // 3. Mark session completed
    checkoutSession.status = "completed";
    await checkoutSession.save();

    return NextResponse.json({ orderId: newOrder.orderId, success: true });
  } catch (error: any) {
    console.error("COD Processing Error:", error);
    return NextResponse.json({ message: error.message || "Failed to process COD order" }, { status: 500 });
  }
}
