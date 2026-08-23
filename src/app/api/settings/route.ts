import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export async function GET() {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return NextResponse.json({
      brandDescription: settings.brandDescription,
      socialLinks: settings.socialLinks,
      currency: settings.currency,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingRate: settings.shippingRate
    });
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
