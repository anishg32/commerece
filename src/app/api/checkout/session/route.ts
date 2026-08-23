import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import CheckoutSession from "@/models/CheckoutSession";
import SiteSettings from "@/models/SiteSettings";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Please log in to checkout" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const { type, productId, quantity, variant, cartItems } = data;

    if (!type || !["buy_now", "cart"].includes(type)) {
      return NextResponse.json({ message: "Invalid checkout type" }, { status: 400 });
    }

    const checkoutItems = [];
    let itemsPrice = 0;

    // Handle Buy Now (Single Item)
    if (type === "buy_now") {
      if (!productId || !quantity || quantity < 1) {
        return NextResponse.json({ message: "Invalid product or quantity" }, { status: 400 });
      }

      const product = await Product.findById(productId);
      
      if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
      if (!product.isActive || product.isDeleted) return NextResponse.json({ message: "Product is no longer available" }, { status: 400 });
      if (product.stock < quantity) return NextResponse.json({ message: `Only ${product.stock} items left in stock` }, { status: 400 });

      const price = product.discountPrice || product.price;
      itemsPrice += price * quantity;

      checkoutItems.push({
        product: product._id,
        name: product.name,
        image: product.thumbnail || product.images?.[0]?.url || "",
        price: product.price,
        discountPrice: product.discountPrice,
        quantity,
        variant
      });
    } 
    // Handle Cart Checkout (Multiple Items)
    else if (type === "cart") {
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
      }

      for (const item of cartItems) {
        const product = await Product.findById(item.productId);
        
        if (!product || !product.isActive || product.isDeleted) {
          return NextResponse.json({ message: `Product ${item.name} is no longer available` }, { status: 400 });
        }
        if (product.stock < item.quantity) {
          return NextResponse.json({ message: `Only ${product.stock} items left for ${product.name}` }, { status: 400 });
        }

        const price = product.discountPrice || product.price;
        itemsPrice += price * item.quantity;

        checkoutItems.push({
          product: product._id,
          name: product.name,
          image: product.thumbnail || product.images?.[0]?.url || "",
          price: product.price,
          discountPrice: product.discountPrice,
          quantity: item.quantity,
          variant: item.variant
        });
      }
    }

    // Get site settings for taxes and shipping
    const settings = await (SiteSettings as any).getSettings();
    
    // Calculations
    const taxPrice = parseFloat((itemsPrice * settings.taxRate).toFixed(2));
    let shippingPrice = settings.shippingRate;
    
    // Free shipping threshold
    if (itemsPrice >= settings.freeShippingThreshold) {
      shippingPrice = 0;
    }

    const totalPrice = parseFloat((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    // Create session
    const checkoutSession = await CheckoutSession.create({
      userId: session.user.id,
      type,
      items: checkoutItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: "pending"
    });

    return NextResponse.json({ sessionId: checkoutSession._id });
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json({ message: "Session ID required" }, { status: 400 });
    }

    const checkoutSession = await CheckoutSession.findById(sessionId);

    if (!checkoutSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    if (checkoutSession.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (checkoutSession.status === "completed" || checkoutSession.status === "failed") {
      return NextResponse.json({ message: "Session already processed", status: checkoutSession.status }, { status: 400 });
    }

    return NextResponse.json(checkoutSession);
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
