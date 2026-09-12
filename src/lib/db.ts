import fs from "node:fs";
import path from "node:path";
import {
  toTitleCase,
  formatPhoneNumber,
  normalizeDate,
  normalizeAmount,
  normalizeTaxId,
  normalizeWebsiteUrl,
  normalizeSku,
  normalizeInvoiceNumber,
  normalizeAddress,
} from "./cleaner";
import { BUSINESS_DOMAINS, DEFAULT_COMPANY_PROFILE, CompanyProfile } from "./business-domains";

// Dynamically require node:sqlite to support Node 22+ built-in SQLite
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DatabaseSync } = require("node:sqlite");

export interface DatasetRecord {
  id: string;
  name: string;
  row_count: number;
  health_score: number;
  columns: string; // JSON string
  raw_data: string; // JSON string
  clean_data: string; // JSON string
  created_at: string;
}

export interface PipelineRecord {
  id: string;
  name: string;
  source_type: string;
  cleaning_rules: string; // JSON string
  destination: string; // "sql" | "vector" | "webhook"
  schedule: string;
  status: string;
  last_run_at: string;
  total_processed: number;
}

export interface PipelineRunRecord {
  id: string;
  pipeline_id: string;
  status: string;
  records_in: number;
  records_out: number;
  errors_fixed: number;
  executed_at: string;
  logs: string;
}

export interface DatabaseTableInfo {
  name: string;
  rowCount: number;
  columns: string[];
}

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const isVercel = Boolean(process.env.VERCEL);
  const dataDir = isVercel ? path.join("/tmp", "cleandata") : path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "cleandata.sqlite");
  dbInstance = new DatabaseSync(dbPath);

  // 1. Core Schema
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      row_count INTEGER NOT NULL,
      health_score INTEGER NOT NULL,
      columns TEXT NOT NULL DEFAULT '[]',
      raw_data TEXT NOT NULL,
      clean_data TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  try {
    dbInstance.exec(`ALTER TABLE datasets ADD COLUMN columns TEXT NOT NULL DEFAULT '[]';`);
  } catch (e) {
    // Column already exists
  }

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS pipelines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      source_type TEXT NOT NULL,
      cleaning_rules TEXT NOT NULL,
      destination TEXT NOT NULL,
      schedule TEXT NOT NULL,
      status TEXT NOT NULL,
      last_run_at TEXT,
      total_processed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pipeline_runs (
      id TEXT PRIMARY KEY,
      pipeline_id TEXT NOT NULL,
      status TEXT NOT NULL,
      records_in INTEGER NOT NULL,
      records_out INTEGER NOT NULL,
      errors_fixed INTEGER NOT NULL,
      executed_at TEXT NOT NULL,
      logs TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS company_profile (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default pipeline if none exists
  const existingPipelines = dbInstance.prepare("SELECT count(*) as count FROM pipelines").get();
  if (existingPipelines.count === 0) {
    dbInstance.prepare(`
      INSERT INTO pipelines (id, name, source_type, cleaning_rules, destination, schedule, status, last_run_at, total_processed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "pipe_leads_daily",
      "Daily Customer Leads Sanitizer",
      "Excel / CSV Import",
      JSON.stringify({ properCase: true, phoneFormat: true, deduplicate: true, isoDates: true }),
      "SQLite Database (table: customers_clean)",
      "Daily (02:00 UTC)",
      "active",
      new Date().toISOString(),
      48
    );
  }

  // Seed default company profile if none exists
  const existingProfile = dbInstance.prepare("SELECT count(*) as count FROM company_profile").get();
  if (existingProfile.count === 0) {
    dbInstance.prepare(`
      INSERT INTO company_profile (id, data, updated_at)
      VALUES (?, ?, ?)
    `).run("default", JSON.stringify(DEFAULT_COMPANY_PROFILE), new Date().toISOString());
  }

  // Auto-seed enterprise domain tables
  seedEnterpriseDomains();

  return dbInstance;
}

/**
 * Seed initial enterprise business tables if they don't exist
 */
export function seedEnterpriseDomains() {
  if (!dbInstance) return;

  for (const domain of BUSINESS_DOMAINS) {
    const check = dbInstance
      .prepare(`SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name=?`)
      .get(domain.defaultTableName);

    if (check.count === 0) {
      createDynamicTable(domain.defaultTableName, domain.columns, domain.sampleData);
    }
  }
}

/**
 * Get Company Profile
 */
export function getCompanyProfile(): CompanyProfile {
  const db = getDb();
  try {
    const row = db.prepare("SELECT data FROM company_profile WHERE id = 'default'").get();
    if (row && row.data) {
      return JSON.parse(row.data) as CompanyProfile;
    }
  } catch (e) {
    // Fallback
  }
  return DEFAULT_COMPANY_PROFILE;
}

/**
 * Save Company Profile
 */
export function saveCompanyProfile(profile: CompanyProfile) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO company_profile (id, data, updated_at)
    VALUES ('default', ?, ?)
  `);
  stmt.run(JSON.stringify(profile), new Date().toISOString());
  return profile;
}

/**
 * Save dataset record and create a typed dedicated SQL table
 */
export function saveDatasetRecord(record: {
  id?: string;
  name: string;
  rowCount: number;
  healthScore: number;
  columns: string[];
  rawData: Record<string, string>[];
  cleanData: Record<string, string>[];
}) {
  const db = getDb();
  const id = record.id || `ds_${Date.now()}`;
  const now = new Date().toISOString();

  // 1. Insert into datasets index table
  const insert = db.prepare(`
    INSERT OR REPLACE INTO datasets (id, name, row_count, health_score, columns, raw_data, clean_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    record.name,
    record.rowCount,
    record.healthScore,
    JSON.stringify(record.columns),
    JSON.stringify(record.rawData),
    JSON.stringify(record.cleanData),
    now
  );

  // 2. Create dynamic SQL table for direct queries
  const safeTableName = `tbl_${record.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()}`;
  createDynamicTable(safeTableName, record.columns, record.cleanData);

  return { id, tableName: safeTableName };
}

/**
 * Create a dynamic typed SQL table from cleaned columns & rows
 */
export function createDynamicTable(
  tableName: string,
  columns: string[],
  rows: Record<string, string>[]
) {
  const db = getDb();
  const sanitizedTable = tableName.replace(/[^a-zA-Z0-9_]/g, "_");

  // Generate column definitions
  const colDefs = columns
    .map((col) => {
      const cleanColName = col.replace(/[^a-zA-Z0-9_]/g, "_");
      return `"${cleanColName}" TEXT`;
    })
    .join(", ");

  db.exec(`DROP TABLE IF EXISTS "${sanitizedTable}";`);
  db.exec(`CREATE TABLE "${sanitizedTable}" (row_id INTEGER PRIMARY KEY AUTOINCREMENT, ${colDefs});`);

  // Insert rows
  if (rows.length > 0) {
    const colNames = columns.map((c) => `"${c.replace(/[^a-zA-Z0-9_]/g, "_")}"`).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const insertStmt = db.prepare(`INSERT INTO "${sanitizedTable}" (${colNames}) VALUES (${placeholders})`);

    for (const r of rows) {
      const values = columns.map((c) => String(r[c] ?? ""));
      insertStmt.run(...values);
    }
  }
}

/**
 * List all active SQLite database tables and their schema
 */
export function listAllDatabaseTables(): DatabaseTableInfo[] {
  const db = getDb();
  const tables = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('datasets', 'pipelines', 'pipeline_runs', 'company_profile') ORDER BY name`
    )
    .all();

  const results: DatabaseTableInfo[] = [];

  for (const t of tables) {
    try {
      const countRow = db.prepare(`SELECT count(*) as count FROM "${t.name}"`).get();
      const pragma = db.prepare(`PRAGMA table_info("${t.name}")`).all();
      const cols = pragma.map((p: any) => p.name).filter((n: string) => n !== "row_id");

      results.push({
        name: t.name,
        rowCount: countRow.count,
        columns: cols,
      });
    } catch (e) {
      // Ignore unreadable table
    }
  }

  return results;
}

/**
 * List all saved datasets
 */
export function listSavedDatasets(): DatasetRecord[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM datasets ORDER BY created_at DESC`).all();
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    row_count: r.row_count,
    health_score: r.health_score,
    columns: r.columns || "[]",
    raw_data: r.raw_data,
    clean_data: r.clean_data,
    created_at: r.created_at,
  }));
}

export function listDatasets(): DatasetRecord[] {
  return listSavedDatasets();
}

export function getDataset(id: string): DatasetRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM datasets WHERE id = ?").get(id);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    row_count: row.row_count,
    health_score: row.health_score,
    columns: row.columns || "[]",
    raw_data: row.raw_data,
    clean_data: row.clean_data,
    created_at: row.created_at,
  };
}

/**
 * Execute raw user SQL query safely with execution timing
 */
export function executeSqlQuery(sql: string) {
  const db = getDb();
  const trimmed = sql.trim();
  const isSelect = trimmed.toLowerCase().startsWith("select") || trimmed.toLowerCase().startsWith("pragma");

  const startTime = performance.now();

  try {
    if (isSelect) {
      const rows = db.prepare(trimmed).all();
      const executionMs = Math.round(performance.now() - startTime);
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return {
        rows,
        columns,
        rowCount: rows.length,
        executionMs,
      };
    } else {
      const info = db.exec(trimmed);
      const executionMs = Math.round(performance.now() - startTime);

      return {
        rows: [],
        columns: [],
        rowCount: 0,
        executionMs,
        info,
      };
    }
  } catch (err: any) {
    throw new Error(`SQL Error: ${err.message}`);
  }
}

/**
 * List all ETL Pipelines
 */
export function listPipelines(): PipelineRecord[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM pipelines ORDER BY last_run_at DESC`).all();
}

/**
 * List Pipeline Execution Runs
 */
export function listPipelineRuns(limit = 20): PipelineRunRecord[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM pipeline_runs ORDER BY executed_at DESC LIMIT ?`).all(limit);
}

/**
 * Execute a Pipeline Run with multi-domain cleaning
 */
export function executePipelineRun(pipelineId: string, inputRows: Record<string, string>[]) {
  const db = getDb();
  const pipeline = db.prepare(`SELECT * FROM pipelines WHERE id = ?`).get(pipelineId);

  if (!pipeline) {
    throw new Error(`Pipeline ${pipelineId} not found`);
  }

  const rules = JSON.parse(pipeline.cleaning_rules || "{}");
  const rows = inputRows.length > 0 ? inputRows : [];
  const cleaned: Record<string, string>[] = [];
  let fixedErrors = 0;
  const startTime = Date.now();

  const seenKeys = new Set<string>();

  for (const r of rows) {
    let dedupeKey = "";
    for (const [k, v] of Object.entries(r)) {
      if (k.toLowerCase().includes("email") || k.toLowerCase().includes("id") || k.toLowerCase().includes("sku")) {
        dedupeKey = String(v ?? "").trim().toLowerCase();
        break;
      }
    }

    if (rules.deduplicate && dedupeKey) {
      if (seenKeys.has(dedupeKey)) {
        fixedErrors++;
        continue;
      }
      seenKeys.add(dedupeKey);
    }

    const cleanRow: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) {
      let val = String(v ?? "").trim();
      const lowerK = k.toLowerCase();

      if (rules.properCase && (lowerK.includes("name") || lowerK.includes("city") || lowerK.includes("company") || lowerK.includes("department"))) {
        const title = toTitleCase(val);
        if (title !== val) fixedErrors++;
        val = title;
      }

      if (rules.phoneFormat && lowerK.includes("phone")) {
        const phone = formatPhoneNumber(val);
        if (phone !== val) fixedErrors++;
        val = phone;
      }

      if (rules.isoDates && lowerK.includes("date")) {
        const date = normalizeDate(val);
        if (date !== val) fixedErrors++;
        val = date;
      }

      if (lowerK.includes("tax") || lowerK.includes("ein")) {
        const tax = normalizeTaxId(val);
        if (tax !== val) fixedErrors++;
        val = tax;
      }

      if (lowerK.includes("sku")) {
        const sku = normalizeSku(val);
        if (sku !== val) fixedErrors++;
        val = sku;
      }

      if (lowerK.includes("website") || lowerK.includes("url")) {
        const url = normalizeWebsiteUrl(val);
        if (url !== val) fixedErrors++;
        val = url;
      }

      if (lowerK.includes("amount") || lowerK.includes("total") || lowerK.includes("subtotal") || lowerK.includes("price") || lowerK.includes("fee") || lowerK.includes("salary")) {
        const amt = normalizeAmount(val);
        if (amt !== val) fixedErrors++;
        val = amt;
      }

      cleanRow[k] = val;
    }
    cleaned.push(cleanRow);
  }

  const runId = `run_${Date.now()}`;
  const executedAt = new Date().toISOString();
  const logMessage = `Processed ${rows.length} input rows -> ${cleaned.length} clean rows (${fixedErrors} errors repaired in ${Date.now() - startTime}ms)`;

  // Record run
  db.prepare(`
    INSERT INTO pipeline_runs (id, pipeline_id, status, records_in, records_out, errors_fixed, executed_at, logs)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    runId,
    pipelineId,
    "completed",
    rows.length,
    cleaned.length,
    fixedErrors,
    executedAt,
    logMessage
  );

  // Update pipeline stats
  db.prepare(`
    UPDATE pipelines
    SET total_processed = total_processed + ?, last_run_at = ?
    WHERE id = ?
  `).run(cleaned.length, executedAt, pipelineId);

  return {
    runId,
    recordsIn: rows.length,
    recordsOut: cleaned.length,
    errorsFixed: fixedErrors,
    cleaned,
    log: logMessage,
  };
}

/**
 * Generate DDL/DML for PostgreSQL, MySQL, and SQLite
 */
export function generateSqlDump(
  tableName: string,
  columns: string[],
  rows: Record<string, string>[],
  dialect: "postgresql" | "mysql" | "sqlite" = "postgresql"
): string {
  const safeName = tableName.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

  let idCol = "id SERIAL PRIMARY KEY";
  if (dialect === "sqlite") idCol = "id INTEGER PRIMARY KEY AUTOINCREMENT";
  if (dialect === "mysql") idCol = "id INT AUTO_INCREMENT PRIMARY KEY";

  const colDefinitions = columns
    .map((c) => {
      const colSafe = c.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
      return `  "${colSafe}" TEXT`;
    })
    .join(",\n");

  const createTable = `CREATE TABLE IF NOT EXISTS ${safeName} (\n  ${idCol},\n${colDefinitions}\n);`;

  const safeColsList = columns.map((c) => `"${c.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()}"`).join(", ");

  const insertStatements = rows.map((r) => {
    const values = columns
      .map((c) => {
        const val = String(r[c] ?? "").replace(/'/g, "''");
        return `'${val}'`;
      })
      .join(", ");
    return `INSERT INTO ${safeName} (${safeColsList}) VALUES (${values});`;
  });

  return [
    `-- CleanData AI: ${dialect.toUpperCase()} SQL Export`,
    `-- Generated on: ${new Date().toISOString()}`,
    `-- Total records: ${rows.length}`,
    "",
    createTable,
    "",
    ...insertStatements,
  ].join("\n");
}
