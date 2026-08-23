import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    let user = await User.findById(session.user.id);
    
    // If the user's account was deleted (e.g., by a database reset script) but they still have a valid session, 
    // we seamlessly recreate their account using the information from their session.
    if (!user) {
      if (session.user.email) {
        user = await User.create({
          _id: session.user.id, // Re-use the exact ID from their session token so it stays valid
          name: session.user.name || "Customer",
          email: session.user.email,
          role: "customer"
        });
      } else {
        return NextResponse.json({ error: "User not found and could not be recreated" }, { status: 404 });
      }
    }

    // Handle Password Change
    if (body.currentPassword && body.newPassword) {
      // Check if user actually has a password (they might have signed up with Google)
      if (!user.password) {
        return NextResponse.json(
          { error: "Account uses external provider (like Google). Cannot change password." },
          { status: 400 }
        );
      }

      const isCorrectPassword = await bcrypt.compare(body.currentPassword, user.password);
      if (!isCorrectPassword) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      
      return NextResponse.json({ message: "Password updated successfully" });
    }

    // Handle Profile Details Change
    if (body.name || body.email) {
      if (body.email && body.email !== user.email) {
        const emailExists = await User.findOne({ email: body.email, _id: { $ne: user._id } });
        if (emailExists) {
          return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
        }
        user.email = body.email;
      }
      if (body.name) {
        user.name = body.name;
      }
      
      await user.save();
      return NextResponse.json({ message: "Profile updated successfully", user: { name: user.name, email: user.email } });
    }

    return NextResponse.json({ error: "No update data provided" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || "Failed to update profile" },
      { status: 500 }
    );
  }
}
