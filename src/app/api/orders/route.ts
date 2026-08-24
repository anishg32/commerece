import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import CheckoutSession from "@/models/CheckoutSession";
import Product from "@/models/Product";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Please log in to place an order" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const { sessionId, shippingAddress, paymentMethod } = data;

    if (!sessionId || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch the Checkout Session
    const checkoutSession = await CheckoutSession.findById(sessionId);
    
    if (!checkoutSession) {
      return NextResponse.json({ message: "Checkout session not found" }, { status: 404 });
    }

    if (checkoutSession.status !== "pending") {
      return NextResponse.json({ message: `Session is already ${checkoutSession.status}` }, { status: 400 });
    }

    if (checkoutSession.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate Stock and Deduct Stock
    // Use a transaction or simply sequential updates since this is a mock payment flow
    for (const item of checkoutSession.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json({ message: `Product ${item.name} not found` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${product.name}. Available: ${product.stock}` }, { status: 400 });
      }
    }

    // Deduct stock
    for (const item of checkoutSession.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 3. Create the Order
    const order = await Order.create({
      user: session.user.id,
      orderItems: checkoutSession.items,
      shippingAddress,
      paymentMethod,
      paymentResult: {
        id: `mock_pi_${Date.now()}`,
        status: "succeeded",
        update_time: new Date().toISOString(),
        email_address: session.user.email
      },
      itemsPrice: checkoutSession.itemsPrice,
      taxPrice: checkoutSession.taxPrice,
      shippingPrice: checkoutSession.shippingPrice,
      totalPrice: checkoutSession.totalPrice,
      isPaid: true,
      paidAt: new Date(),
      isDelivered: false
    });

    // 4. Update the Checkout Session status
    checkoutSession.status = "completed";
    await checkoutSession.save();

    return NextResponse.json({ orderId: order._id, message: "Order placed successfully" });
  } catch (error: unknown) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
