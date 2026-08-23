import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json(
      { status: "ok", database: "connected" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "error", message: (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
