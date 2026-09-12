import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { parseUnstructuredText } from "@/lib/parsers";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();

    const rawText = typeof textResult === "string" ? textResult : (textResult as any).text || "";

    // Parse extracted text into structured rows
    const parsed = parseUnstructuredText(rawText);

    return NextResponse.json({
      success: true,
      filename: file.name,
      rows: parsed.rows,
      columns: parsed.columns,
      totalRecords: parsed.rows.length,
      previewText: rawText.slice(0, 500),
    });
  } catch (error: any) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse PDF document" },
      { status: 500 }
    );
  }
}
