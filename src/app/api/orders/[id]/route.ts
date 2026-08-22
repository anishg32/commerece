import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product"; // needed for population if necessary

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const order = await Order.findOne({
      orderId: resolvedParams.id,
      user: session.user.id
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // For handling cancellations and return requests
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, reason } = await request.json();
    await dbConnect();

    const order = await Order.findOne({
      orderId: resolvedParams.id,
      user: session.user.id
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "cancel") {
      if (["Shipped", "Out for Delivery", "Delivered"].includes(order.status)) {
        return NextResponse.json({ error: "Cannot cancel order at this stage" }, { status: 400 });
      }
      order.status = "Cancelled";
      order.cancellationReason = reason;
      order.cancelledAt = new Date();
      order.trackingHistory.push({
        status: "Cancelled",
        comment: reason || "Cancelled by user"
      });
      await order.save();
      return NextResponse.json({ success: true, order });
    }

    if (action === "return") {
      if (order.status !== "Delivered") {
        return NextResponse.json({ error: "Can only return delivered orders" }, { status: 400 });
      }
      order.status = "Return Requested";
      order.returnReason = reason;
      order.returnStatus = "Pending";
      order.trackingHistory.push({
        status: "Return Requested",
        comment: reason
      });
      await order.save();
      return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
