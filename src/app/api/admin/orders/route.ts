import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";

    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { orderId, status, isDelivered } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (isDelivered !== undefined) {
      updateData.isDelivered = isDelivered;
      if (isDelivered) updateData.deliveredAt = new Date();
    }
    if (status === "Delivered") {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
