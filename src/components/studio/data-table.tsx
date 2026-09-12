"use client";

import React from "react";
import { Sparkles, Download, Copy, Check } from "lucide-react";

interface DataTableProps {
  data: Record<string, string>[];
  columns: string[];
  fileName: string;
  isCleaned: boolean;
  viewMode: "clean" | "raw";
  setViewMode: (mode: "clean" | "raw") => void;
  onCopy: () => void;
  copied: boolean;
  onDownload: () => void;
}

export function DataTable({
  data,
  columns,
  fileName,
  isCleaned,
  viewMode,
  setViewMode,
  onCopy,
  copied,
  onDownload,
}: DataTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                viewMode === "raw" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Raw View
            </button>
            <button
              onClick={() => setViewMode("clean")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                viewMode === "clean" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Clean View</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {data.length} records ({fileName})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied CSV!" : "Copy Data"}</span>
          </button>

          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[520px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100/80 text-slate-700 uppercase font-mono tracking-wider sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-bold text-slate-500 w-12 text-center">#</th>
              {columns.map((col) => (
                <th key={col} className="py-3 px-4 font-bold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                  {idx + 1}
                </td>
                {columns.map((col) => {
                  const val = String(row?.[col] ?? "");
                  const lowerCol = String(col || "").toLowerCase();
                  const isBadCasing =
                    !isCleaned &&
                    (lowerCol.includes("name") || lowerCol.includes("customer")) &&
                    (val === val.toUpperCase() || val === val.toLowerCase()) &&
                    val.length > 2;
                  const isBadPhone =
                    !isCleaned && lowerCol.includes("phone") && !val.startsWith("+1 (") && val.length > 0;
                  const isBadDate =
                    !isCleaned && lowerCol.includes("date") && !/^\d{4}-\d{2}-\d{2}$/.test(val.trim()) && val.length > 0;

                  return (
                    <td key={col} className="py-3 px-4 text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{val}</span>
                        {isBadCasing && (
                          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-200">
                            Casing
                          </span>
                        )}
                        {isBadPhone && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                            Format
                          </span>
                        )}
                        {isBadDate && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                            Date
                          </span>
                        )}
                        {isCleaned && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                            <Check className="h-2.5 w-2.5" />
                            <span>Clean</span>
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <span>💡 Tip: Use the RAG Vector Hub above to prepare this dataset for vector databases.</span>
        <span className="font-mono text-[11px] text-slate-400">CleanData AI Engine v2.0</span>
      </div>
    </div>
  );
}
