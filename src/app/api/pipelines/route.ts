import { NextRequest, NextResponse } from "next/server";
import { listPipelines, listPipelineRuns, executePipelineRun, getDb } from "@/lib/db";

export async function GET() {
  try {
    const pipelines = listPipelines();
    const runs = listPipelineRuns();
    return NextResponse.json({ success: true, pipelines, runs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load pipelines" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pipelineId, rows, pipeline } = body;

    if (action === "run") {
      if (!pipelineId) {
        return NextResponse.json({ error: "Missing pipelineId" }, { status: 400 });
      }

      const inputRows = rows && Array.isArray(rows) && rows.length > 0 ? rows : [];
      const runResult = executePipelineRun(pipelineId, inputRows);

      return NextResponse.json({
        success: true,
        message: `Pipeline executed successfully: ${runResult.recordsOut} clean records output.`,
        ...runResult,
      });
    }

    if (action === "create") {
      const db = getDb();
      const id = `pipe_${Date.now()}`;
      db.prepare(`
        INSERT INTO pipelines (id, name, source_type, cleaning_rules, destination, schedule, status, last_run_at, total_processed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        pipeline.name || "Custom Data Pipeline",
        pipeline.sourceType || "CSV/Excel",
        JSON.stringify(pipeline.rules || {}),
        pipeline.destination || "SQLite Database",
        pipeline.schedule || "On Demand",
        "active",
        null,
        0
      );

      return NextResponse.json({
        success: true,
        message: "New automated pipeline created!",
        id,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Pipeline operation failed" },
      { status: 500 }
    );
  }
}
