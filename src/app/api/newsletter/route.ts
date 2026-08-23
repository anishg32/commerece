import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    await dbConnect();

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json({ error: "You are already subscribed!" }, { status: 400 });
      } else {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        return NextResponse.json({ message: "Subscription reactivated successfully!" }, { status: 200 });
      }
    }

    await Newsletter.create({ email });

    return NextResponse.json({ message: "Successfully subscribed to the newsletter!" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Newsletter Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
