"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  X,
  Play,
  Copy,
  Check,
  Terminal,
  Table,
  Download,
  Clock,
  HardDrive,
  Layers,
  Sparkles,
  Search
} from "lucide-react";

interface SqlHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: Record<string, string>[];
  columns: string[];
  fileName: string;
  onLoadDataset: (rows: Record<string, string>[], columns: string[], name: string) => void;
}

export function SqlHubModal({
  isOpen,
  onClose,
  currentData,
  columns,
  fileName,
  onLoadDataset,
}: SqlHubModalProps) {
  const [tab, setTab] = useState<"console" | "tables" | "saved" | "export">("console");
  const [savedDatasets, setSavedDatasets] = useState<any[]>([]);
  const [dbTables, setDbTables] = useState<any[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState<boolean>(false);
  const [loadingTables, setLoadingTables] = useState<boolean>(false);

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT i.Invoice_ID, i.Vendor_Name, c.Industry, c.HQ_Address, i.Total_Amount, i.Payment_Status\nFROM tbl_invoices i\nLEFT JOIN tbl_companies c ON lower(trim(i.Vendor_Name)) = lower(trim(c.Company_Name));"
  );
  const [queryResult, setQueryResult] = useState<{
    rows: any[];
    columns: string[];
    rowCount: number;
    executionMs: number;
  } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // SQL Export state
  const [exportDialect, setExportDialect] = useState<"postgresql" | "mysql" | "sqlite">("postgresql");
  const [sqlDump, setSqlDump] = useState<string>("");
  const [copiedDump, setCopiedDump] = useState<boolean>(false);
  const [isGeneratingDump, setIsGeneratingDump] = useState<boolean>(false);

  // Pre-configured Relational Queries
  const PRESET_QUERIES = [
    {
      label: "Invoices ↔ Companies JOIN",
      sql: "SELECT i.Invoice_ID, i.Vendor_Name, c.Industry, c.HQ_Address, i.Total_Amount, i.Payment_Status\nFROM tbl_invoices i\nLEFT JOIN tbl_companies c ON lower(trim(i.Vendor_Name)) = lower(trim(c.Company_Name));",
    },
    {
      label: "Department Payroll Rollup",
      sql: "SELECT Department, count(*) as Headcount, round(avg(CAST(REPLACE(REPLACE(Salary, '$', ''), ',', '') AS FLOAT)), 2) as Avg_Salary, sum(CAST(REPLACE(REPLACE(Salary, '$', ''), ',', '') AS FLOAT)) as Total_Payroll\nFROM tbl_employees\nGROUP BY Department;",
    },
    {
      label: "Low Stock Inventory Alert",
      sql: "SELECT SKU, Product_Name, Supplier_Name, In_Stock, Reorder_Point, Unit_Cost\nFROM tbl_inventory\nWHERE CAST(In_Stock AS INT) <= CAST(Reorder_Point AS INT);",
    },
    {
      label: "Top Companies by Revenue",
      sql: "SELECT Company_Name, Industry, Annual_Revenue, Employee_Count\nFROM tbl_companies\nWHERE Status != 'dissolved'\nORDER BY CAST(REPLACE(REPLACE(Annual_Revenue, '$', ''), ',', '') AS FLOAT) DESC;",
    },
    {
      label: "School Tuition by Grade",
      sql: "SELECT Grade, count(*) as Students, sum(CAST(REPLACE(REPLACE(Tuition_Fee, '$', ''), ',', '') AS FLOAT)) as Total_Tuition\nFROM tbl_school_students\nGROUP BY Grade;",
    },
  ];

  // Fetch saved datasets and tables when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDatasets();
      fetchTables();
    }
  }, [isOpen]);

  const fetchDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const res = await fetch("/api/datasets");
      const json = await res.json();
      if (json.success) {
        setSavedDatasets(json.datasets || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDatasets(false);
    }
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const res = await fetch("/api/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tables" }),
      });
      const json = await res.json();
      if (json.success) {
        setDbTables(json.tables || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleRunQuery = async (overrideQuery?: string) => {
    const q = overrideQuery || sqlQuery;
    setIsExecuting(true);
    setQueryError(null);
    try {
      const res = await fetch("/api/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "query", query: q }),
      });
      const json = await res.json();
      if (json.success) {
        setQueryResult({
          rows: json.rows,
          columns: json.columns,
          rowCount: json.rowCount,
          executionMs: json.executionMs,
        });
      } else {
        setQueryError(json.error || "Query failed");
      }
    } catch (e: any) {
      setQueryError(e.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGenerateDump = async () => {
    setIsGeneratingDump(true);
    try {
      const safeTableName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
      const res = await fetch("/api/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export-dump",
          tableName: safeTableName,
          columns,
          rows: currentData,
          dialect: exportDialect,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSqlDump(json.sqlDump);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingDump(false);
    }
  };

  const handleCopyDump = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopiedDump(true);
    setTimeout(() => setCopiedDump(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Database className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                SQL Hub & Relational Database
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  SQLite Node Native
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Execute live relational queries, inspect business tables, and export multi-dialect DDL/DML.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-100 bg-slate-50/30">
          <button
            onClick={() => setTab("console")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              tab === "console"
                ? "border-brand-600 text-brand-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Interactive SQL Console</span>
          </button>

          <button
            onClick={() => setTab("tables")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              tab === "tables"
                ? "border-brand-600 text-brand-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Database Tables ({dbTables.length})</span>
          </button>

          <button
            onClick={() => setTab("saved")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              tab === "saved"
                ? "border-brand-600 text-brand-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <HardDrive className="h-4 w-4" />
            <span>Saved Datasets ({savedDatasets.length})</span>
          </button>

          <button
            onClick={() => {
              setTab("export");
              if (!sqlDump) handleGenerateDump();
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              tab === "export"
                ? "border-brand-600 text-brand-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Export DDL/DML</span>
          </button>
        </div>

        {/* Tab 1: SQL Console */}
        {tab === "console" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Presets bar */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Relational Query Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_QUERIES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSqlQuery(preset.sql);
                      handleRunQuery(preset.sql);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 rounded-lg transition-all"
                  >
                    <Sparkles className="h-3 w-3 text-brand-600" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Write or Edit SQL Query:</span>
                <button
                  onClick={() => handleRunQuery()}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-all shadow-xs"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isExecuting ? "Executing..." : "Execute Query"}</span>
                </button>
              </div>

              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none border border-slate-800"
              />
            </div>

            {queryError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-mono text-red-700">
                {queryError}
              </div>
            )}

            {queryResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Returned <strong>{queryResult.rowCount}</strong> row(s) in{" "}
                    <strong>{queryResult.executionMs}ms</strong>
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                      <tr>
                        {queryResult.columns.map((c) => (
                          <th key={c} className="px-3 py-2 border-r border-slate-200 last:border-none">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {queryResult.rows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {queryResult.columns.map((c) => (
                            <td key={c} className="px-3 py-1.5 border-r border-slate-100 last:border-none text-slate-800">
                              {String(r[c] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Database Tables Explorer */}
        {tab === "tables" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">
                Active Relational Tables in Embedded SQLite Engine
              </span>
              <button
                onClick={fetchTables}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Refresh Tables
              </button>
            </div>

            {loadingTables ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading tables...</div>
            ) : dbTables.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No custom tables found. Save a dataset to generate a SQL table.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dbTables.map((t) => (
                  <div
                    key={t.name}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-brand-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4 text-brand-600" />
                        <span className="text-xs font-mono font-bold text-slate-900">{t.name}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                        {t.rowCount} rows
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-500">
                      {t.columns.slice(0, 5).map((col: string) => (
                        <span key={col} className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {col}
                        </span>
                      ))}
                      {t.columns.length > 5 && (
                        <span className="text-slate-400">+{t.columns.length - 5} more</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const q = `SELECT * FROM "${t.name}" LIMIT 15;`;
                        setSqlQuery(q);
                        setTab("console");
                        handleRunQuery(q);
                      }}
                      className="w-full text-center text-[11px] font-semibold text-brand-600 hover:bg-brand-50 py-1 rounded-lg border border-brand-200 transition-colors"
                    >
                      Query in Console &rarr;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Datasets */}
        {tab === "saved" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Persisted Dataset Snapshots</span>
              <button
                onClick={fetchDatasets}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Refresh
              </button>
            </div>

            {loadingDatasets ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading datasets...</div>
            ) : savedDatasets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No datasets saved yet. Use &ldquo;Save to Database&rdquo; in Studio to store snapshots.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedDatasets.map((ds) => (
                  <div key={ds.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{ds.name}</span>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                          Score: {ds.health_score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>Saved {new Date(ds.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>{ds.row_count} records</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        try {
                          const cleanRows = JSON.parse(ds.clean_data);
                          const cols = JSON.parse(ds.columns);
                          onLoadDataset(cleanRows, cols, ds.name);
                          onClose();
                        } catch (e: any) {
                          alert("Failed to load dataset: " + e.message);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-all"
                    >
                      Load into Studio
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Export DDL/DML */}
        {tab === "export" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Target SQL Dialect:</span>
                {(["postgresql", "mysql", "sqlite"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setExportDialect(d);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      exportDialect === d
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateDump}
                  disabled={isGeneratingDump}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                >
                  {isGeneratingDump ? "Generating..." : "Regenerate"}
                </button>
                <button
                  onClick={handleCopyDump}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-all"
                >
                  {copiedDump ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedDump ? "Copied!" : "Copy SQL Script"}</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={sqlDump || "-- Click Regenerate to build SQL DDL/DML statements"}
              rows={12}
              className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
