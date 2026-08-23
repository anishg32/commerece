import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export async function GET() {
  try {
    await dbConnect();
    const settings = await (SiteSettings as any).getSettings();
    return NextResponse.json(settings);
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
    const data = await req.json();
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
