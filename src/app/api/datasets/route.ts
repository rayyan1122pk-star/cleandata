import { NextRequest, NextResponse } from "next/server";
import { listDatasets, saveDatasetRecord, getDataset } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const dataset = getDataset(id);
      if (!dataset) {
        return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, dataset });
    }

    const datasets = listDatasets();
    return NextResponse.json({ success: true, datasets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load datasets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rowCount, healthScore, columns, rawData, cleanData } = body;

    if (!name || !columns || !cleanData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (name, columns, cleanData)" },
        { status: 400 }
      );
    }

    const result = saveDatasetRecord({
      name,
      rowCount: rowCount || cleanData.length,
      healthScore: healthScore || 100,
      columns,
      rawData: rawData || cleanData,
      cleanData,
    });

    return NextResponse.json({
      success: true,
      message: `Dataset saved permanently to SQL table "${result.tableName}"`,
      id: result.id,
      tableName: result.tableName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save dataset to SQL database" },
      { status: 500 }
    );
  }
}
