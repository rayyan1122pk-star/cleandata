// src/app/api/specialist/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAutonomousAiDataSpecialist } from "@/lib/ai-specialist";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows, columns, sourceName, rawText } = body;

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid rows array." },
        { status: 400 }
      );
    }

    const cols = columns || (rows.length > 0 ? Object.keys(rows[0]) : []);
    const result = runAutonomousAiDataSpecialist(rows, cols, sourceName || "dataset.csv", rawText);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute AI Data Specialist pipeline." },
      { status: 500 }
    );
  }
}
