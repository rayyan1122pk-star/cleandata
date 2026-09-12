"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  Zap,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import { SAMPLE_MESSY_DATA, DataRow } from "@/lib/sample-data";
import { auditDataset, cleanDataset, downloadCsv, AuditReport } from "@/lib/cleaner";

export function HeroCleaner() {
  const [rows, setRows] = useState<DataRow[]>(SAMPLE_MESSY_DATA);
  const [report, setReport] = useState<AuditReport>(() => auditDataset(SAMPLE_MESSY_DATA));
  const [isCleaned, setIsCleaned] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"clean" | "original">("original");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleCleanData = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { cleanedRows, report: cleanReport } = cleanDataset(rows);
      setRows(cleanedRows);
      setReport(cleanReport);
      setIsCleaned(true);
      setViewMode("clean");
      setIsProcessing(false);

      // Trigger celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#4F46E5", "#10B981", "#6366F1"],
        });
      } catch (e) {}
    }, 500);
  };

  const handleResetSample = () => {
    setRows(SAMPLE_MESSY_DATA);
    setReport(auditDataset(SAMPLE_MESSY_DATA));
    setIsCleaned(false);
    setViewMode("original");
  };

  const handleDownload = () => {
    downloadCsv(rows, isCleaned ? "cleandata_perfect.csv" : "messy_original.csv");
  };

  return (
    <section id="demo" className="relative pt-12 pb-24 overflow-hidden">
      {/* Soft background ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-brand-50/70 via-slate-50/50 to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-4 py-1.5 text-xs text-brand-700 font-semibold mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>THE NO-CODE AI DATA ENGINEER IN YOUR BROWSER</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Turn Messy Spreadsheets into{" "}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-700 bg-clip-text text-transparent">
              100% Clean Data
            </span>{" "}
            in Seconds.
          </h1>

          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            No complex Excel formulas. No Python code. Remove duplicates, fix phone & date formats, and standardize names with a single click.
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app"
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-all shadow-glow hover:shadow-lg"
            >
              <Upload className="h-4 w-4" />
              <span>Clean Your Own File Free</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>

            <a
              href="/messy_sample_data.csv"
              download="messy_sample_data.csv"
              className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download className="h-4 w-4 text-slate-400" />
              <span>Download Test CSV (.csv)</span>
            </a>
          </div>
        </div>

        {/* INTERACTIVE SPREADSHEET CLEANER WIDGET */}
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-brand-600 shadow-sm">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">customer_leads_april_raw.csv</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {rows.length} rows loaded • Status:{" "}
                  {isCleaned ? (
                    <span className="text-success-600 font-bold">100% Cleaned</span>
                  ) : (
                    <span className="text-amber-600 font-bold">Action Needed</span>
                  )}
                </p>
              </div>
            </div>

            {/* Actions on Widget */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Before/After Toggle */}
              {isCleaned && (
                <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setViewMode("original")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      viewMode === "original" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Original Messy
                  </button>
                  <button
                    onClick={() => setViewMode("clean")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      viewMode === "clean" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Cleaned
                  </button>
                </div>
              )}

              {!isCleaned ? (
                <button
                  onClick={handleCleanData}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition-all shadow-glow disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isProcessing ? "Cleaning with AI..." : "Auto-Clean with AI"}</span>
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-xl bg-success-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-success-700 transition-all shadow-emeraldGlow"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Clean CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Health Score Summary Banner */}
          <div className="px-6 py-4 bg-slate-50/40 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            {/* Circular/Pill Score */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center h-10 w-10 rounded-full font-black text-sm border-2 ${
                  report.healthScore >= 90
                    ? "bg-success-50 text-success-600 border-success-500"
                    : "bg-amber-50 text-amber-600 border-amber-500"
                }`}
              >
                {report.healthScore}%
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Data Quality Health Score
                </span>
                <span className="text-xs text-slate-500">
                  {isCleaned ? "All duplicates removed & formats standardized." : "Discovered 4 distinct formatting anomalies."}
                </span>
              </div>
            </div>

            {/* Issue Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              {!isCleaned ? (
                <>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/60">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    {report.duplicatesFound} Duplicates
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    {report.unformattedPhones} Broken Phones
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                    <AlertCircle className="h-3.5 w-3.5 text-purple-500" />
                    {report.spamOrTestEmails} Anomaly Email
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-50 text-success-700 border border-success-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                    Duplicates Merged
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-50 text-success-700 border border-success-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                    Phone & Dates Unified
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-50 text-success-700 border border-success-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                    Text Capitalized
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Live Spreadsheet Grid */}
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs font-normal">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-bold tracking-wider sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">#</th>
                  <th className="py-3 px-5">Customer Name</th>
                  <th className="py-3 px-5">Email Address</th>
                  <th className="py-3 px-5">Phone</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Order Amount</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(viewMode === "original" ? SAMPLE_MESSY_DATA : rows).map((row, idx) => (
                  <tr
                    key={row.id + idx}
                    className={`transition-colors ${
                      !isCleaned && (row.id === "3" || row.id === "7")
                        ? "bg-red-50/50 hover:bg-red-50" // Highlight duplicates in original
                        : !isCleaned && row.id === "4"
                        ? "bg-amber-50/50 hover:bg-amber-50" // Highlight spam email
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3.5 px-5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {row.name}
                      {!isCleaned && (row.id === "3" || row.id === "7") && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-600 font-bold uppercase">
                          Duplicate
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">
                      {row.email}
                      {!isCleaned && row.email.includes("test@") && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-700 font-bold uppercase">
                          Fake
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">{row.phone}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">{row.date}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.amount}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Widget Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>
              {isCleaned ? "Filtered down to unique, valid rows." : "Showing raw, uncleaned sample spreadsheet."}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Check className="h-3.5 w-3.5 text-success-600" /> Runs 100% locally in your browser
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Check className="h-3.5 w-3.5 text-success-600" /> No data ever stored on servers
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
