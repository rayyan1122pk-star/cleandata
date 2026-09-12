// src/app/api/sql/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeSqlQuery, generateSqlDump } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, tableName, columns, rows, dialect } = body;
    const effectiveAction = action || (query ? "query" : undefined);

    if (effectiveAction === "query") {
      if (!query || typeof query !== "string") {
        return NextResponse.json({ error: "Missing SQL query string" }, { status: 400 });
      }

      const result = executeSqlQuery(query);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    if (effectiveAction === "export-dump") {
      if (!tableName || !columns || !rows) {
        return NextResponse.json({ error: "Missing parameters for SQL export" }, { status: 400 });
      }

      const sqlDump = generateSqlDump(tableName, columns, rows, dialect || "postgresql");
      return NextResponse.json({
        success: true,
        sqlDump,
        dialect: dialect || "postgresql",
      });
    }

    if (effectiveAction === "tables") {
      const { listAllDatabaseTables } = await import("@/lib/db");
      const tables = listAllDatabaseTables();
      return NextResponse.json({
        success: true,
        tables,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "SQL execution failed" },
      { status: 500 }
    );
  }
}
