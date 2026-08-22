import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const addresses = await Address.find({ user: session.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return NextResponse.json(addresses);
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    // If this is set to default, unset others
    if (body.isDefault) {
      await Address.updateMany(
        { user: session.user.id },
        { $set: { isDefault: false } }
      );
    }

    // Check if this is their first address
    const count = await Address.countDocuments({ user: session.user.id });
    if (count === 0) {
      body.isDefault = true;
    }

    const address = await Address.create({
      ...body,
      user: session.user.id,
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error: any) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create address" },
      { status: 500 }
    );
  }
}
