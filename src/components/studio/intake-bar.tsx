"use client";

import React, { useState, useRef } from "react";
import { Layers, FileUp, ClipboardPaste, Cpu, FileSpreadsheet, Upload, Sparkles, Wand2 } from "lucide-react";
import Papa from "papaparse";
import { parseClipboardText, parseExcelBuffer, parseUnstructuredText } from "@/lib/parsers";

interface IntakeBarProps {
  onDataLoaded: (rows: Record<string, string>[], columns: string[], fileName: string) => void;
  setIsProcessing: (val: boolean) => void;
}

export function IntakeBar({ onDataLoaded, setIsProcessing }: IntakeBarProps) {
  const [intakeTab, setIntakeTab] = useState<"upload" | "paste" | "notes">("upload");
  const [pastedContent, setPastedContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    setIsProcessing(true);

    try {
      if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        const arrayBuffer = await file.arrayBuffer();
        const parsed = parseExcelBuffer(arrayBuffer);
        onDataLoaded(parsed.rows, parsed.columns, file.name);
      } else if (lowerName.endsWith(".pdf")) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
        const result = await res.json();
        if (result.success && result.rows.length > 0) {
          onDataLoaded(result.rows, result.columns, file.name);
        } else {
          alert("Could not extract tabular rows from PDF.");
        }
      } else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              const parsed = results.data as Record<string, string>[];
              const cols = results.meta.fields || Object.keys(parsed[0]);
              onDataLoaded(parsed, cols, file.name);
            }
          },
        });
      }
    } catch (err: any) {
      alert(`Error reading file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPastedData = () => {
    if (!pastedContent.trim()) return;
    const parsed = parseClipboardText(pastedContent);
    if (parsed.rows.length > 0) {
      onDataLoaded(parsed.rows, parsed.columns, `clipboard_${parsed.sourceType}.csv`);
      setIntakeTab("upload");
    } else {
      alert("Could not detect tabular rows. Try pasting comma-separated or tab-separated text.");
    }
  };

  const handleProcessNotesData = () => {
    if (!pastedContent.trim()) return;
    const parsed = parseUnstructuredText(pastedContent);
    if (parsed.rows.length > 0) {
      onDataLoaded(parsed.rows, parsed.columns, "extracted_paragraph_data.csv");
      setIntakeTab("upload");
    } else {
      alert("No entities could be extracted. Please check the text.");
    }
  };

  const handleLoadSamplePaste = (type: "excel" | "notes" | "json" | "corporate_paragraph" | "school_paragraph") => {
    if (type === "excel") {
      setPastedContent(
        "Client Name\tWork Email\tMobile\tClosed Date\tAmount\n" +
          "SARAH CONNOR\tsarah@skynet.com\t555.345.6789\t04/12/2025\t$4,500.00\n" +
          "bruce wayne\tbatman@wayne.org\t(555) 789-0123\t2025-04-22\t9800\n" +
          "TONY STARK\tironman@avengers.org\t555-567-8901\t04-10-2025\t$12,500.00\n" +
          "  alice smith  \talice@yahoo.com\t5556789012\t2025/04/20\t340"
      );
    } else if (type === "corporate_paragraph") {
      setPastedContent(
        "During Q1 review, Apex Solutions LLC (Tax ID: 12-3456789) located at 450 Lexington Ave, New York confirmed invoice INV-2024-001 totaling $14,250.00 on 2024-01-15 via CFO Sarah Jenkins (sarah.j@apexsolutions.com, +1 (555) 345-6789). Meanwhile, Marcus Vance from Vortex Logistics Corp (EIN: 98-7654321) at 1200 Industrial Blvd, Chicago settled billing INV-2024-002 for $8,900.50 on 2024-02-20, reachable at marcus.v@vortexlogistics.io or 555-876-5432. Later on 2024-03-05, BioGenix Labs Inc with tax id 45-6789012 authorized order INV-2024-003 for $31,400.00 handled by Dr. Robert Chen (r.chen@biogenixlabs.org, 555-432-1098) regarding sterile diagnostic reagents."
      );
    } else if (type === "school_paragraph") {
      setPastedContent(
        "For 2024 admissions at Horizon Valley High School, student Emily Watson (ID: STD-2024-01, Grade 10) enrolled on 2024-08-15 in Section A. Parent contact is emily.parents@gmail.com or (555) 987-6543, paid tuition fee of $1,250.00 living at 742 Evergreen Terrace. Also Liam Davis (ID: STD-2024-02, Grade 11) joined on 2024-08-18 with guardian phone 555-123-9988, email liam.davis.family@yahoo.com, paying $1,400.00 registration fee residing at 84 Baker Street. Finally Sophia Martinez (ID: STD-2024-03, Grade 9) enrolled on 2024-09-01, emergency email sophia.m@gmail.com, mobile 555-456-7890 with partial deposit of $850.00."
      );
    } else if (type === "notes") {
      setPastedContent(
        "Vendor invoice received from Apex Enterprise Software LLC (Tax ID: 12-3456789) Invoice INV-2025-001 for $13,562.50 due 2025-05-01 contact robert@apex.io.\n" +
          "Logistics bill from Vortex Logistics Corp (EIN 98-7654321) INV-2025-002 total $4,200.00 approved by Marcus Vance phone (555) 789-0123.\n" +
          "BioGenix Lab Solutions Inc. invoice INV-2025-003 for $9,487.53 payment pending for lab supplies order."
      );
    } else {
      setPastedContent(
        JSON.stringify(
          [
            { name: "CLARK KENT", email: "superman@dailyplanet.com", phone: "555-012-3456", revenue: "$520.00" },
            { name: "wanda maximoff", email: "scarlet@westview.org", phone: "(555) 123-4567", revenue: "$7,100.50" },
            { name: "PETER PARKER", email: "spidey@dailybugle.com", phone: "555.890.1234", revenue: "150.75" }
          ],
          null,
          2
        )
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Data Ingestion Channel
          </span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setIntakeTab("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              intakeTab === "upload"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileUp className="h-3.5 w-3.5 text-brand-600" />
            <span>Files (CSV, Excel, PDF)</span>
          </button>

          <button
            onClick={() => setIntakeTab("paste")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              intakeTab === "paste"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ClipboardPaste className="h-3.5 w-3.5 text-indigo-600" />
            <span>Copy-Paste Raw Text</span>
          </button>

          <button
            onClick={() => setIntakeTab("notes")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              intakeTab === "notes"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Paragraph Ingestion</span>
          </button>
        </div>
      </div>

      {intakeTab === "upload" && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Upload Spreadsheet, Excel workbook or PDF invoice
                </p>
                <p className="text-[11px] text-slate-500">
                  Supports <strong>.csv</strong>, <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.pdf</strong> (100% private in-browser)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.tsv,.xlsx,.xls,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Choose File</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">Quick Test Datasets:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const res = await fetch("/messy_school_students.csv");
                    const text = await res.text();
                    Papa.parse(text, {
                      header: true,
                      skipEmptyLines: true,
                      complete: (results) => {
                        if (results.data && results.data.length > 0) {
                          const parsed = results.data as Record<string, string>[];
                          const cols = results.meta.fields || Object.keys(parsed[0]);
                          onDataLoaded(parsed, cols, "messy_school_students.csv");
                        }
                      },
                    });
                  } catch (e: any) {
                    alert("Error loading sample: " + e.message);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>🎓</span> Load School Students CSV
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const res = await fetch("/messy_sample_data.csv");
                    const text = await res.text();
                    Papa.parse(text, {
                      header: true,
                      skipEmptyLines: true,
                      complete: (results) => {
                        if (results.data && results.data.length > 0) {
                          const parsed = results.data as Record<string, string>[];
                          const cols = results.meta.fields || Object.keys(parsed[0]);
                          onDataLoaded(parsed, cols, "messy_sample_data.csv");
                        }
                      },
                    });
                  } catch (e: any) {
                    alert("Error loading sample: " + e.message);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>💼</span> Load Customers CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {intakeTab === "paste" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Paste rows directly from Excel, Google Sheets, JSON array, or TSV:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLoadSamplePaste("excel")}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Paste Sample Excel TSV
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => handleLoadSamplePaste("json")}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Paste Sample JSON
              </button>
            </div>
          </div>

          <textarea
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            placeholder="Paste here... (e.g. John Doe \t john@gmail.com \t (555) 234-5678)"
            rows={4}
            className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50"
          />

          <div className="flex justify-end">
            <button
              onClick={handleProcessPastedData}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Format & Load Pasted Data</span>
            </button>
          </div>
        </div>
      )}

      {intakeTab === "notes" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium">
              Paste continuous narrative paragraphs, emails, or notes. AI extracts & arranges multi-record tables:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLoadSamplePaste("corporate_paragraph")}
                className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
              >
                🏢 Load Corporate Paragraph
              </button>
              <button
                onClick={() => handleLoadSamplePaste("school_paragraph")}
                className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition-colors"
              >
                🎓 Load School Paragraph
              </button>
              <button
                onClick={() => handleLoadSamplePaste("notes")}
                className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded-md transition-colors"
              >
                📝 Notes
              </button>
            </div>
          </div>

          <textarea
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            placeholder="Paste any single paragraph or multiple sentences here... (e.g. During Q1 review, Apex Solutions LLC (Tax ID: 12-3456789) confirmed invoice INV-2024-001 totaling $14,250.00 via Sarah Jenkins sarah.j@apexsolutions.com...)"
            rows={5}
            className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-400">
              💡 AI automatically detects entity boundaries, company EIN, contact emails, invoice codes, and monetary amounts into clean table columns.
            </p>
            <button
              onClick={handleProcessNotesData}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Extract & Arrange into Table</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
