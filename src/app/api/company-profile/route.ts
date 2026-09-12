import { NextRequest, NextResponse } from "next/server";
import { getCompanyProfile, saveCompanyProfile } from "@/lib/db";

export async function GET() {
  try {
    const profile = getCompanyProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load company profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveCompanyProfile(body);
    return NextResponse.json({
      success: true,
      message: "Company profile updated successfully",
      profile: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save company profile" },
      { status: 500 }
    );
  }
}
