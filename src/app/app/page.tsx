"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  BrainCircuit,
  Settings2,
  Database,
  GitBranch,
  Building2,
  Check,
  Copy,
  Bot
} from "lucide-react";
import confetti from "canvas-confetti";
import Papa from "papaparse";
import {
  BUSINESS_DOMAINS,
  BusinessDomain,
  DEFAULT_COMPANY_PROFILE,
  CompanyProfile
} from "@/lib/business-domains";
import {
  toTitleCase,
  formatPhoneNumber,
  normalizeDate,
  normalizeAmount,
  normalizeTaxId,
  normalizeWebsiteUrl,
  normalizeSku,
  normalizeInvoiceNumber,
  normalizeAddress
} from "@/lib/cleaner";
import { generateColumnMappings, applySchemaMappings, ColumnMapping } from "@/lib/schema-mapper";
import { generateRagChunks, VectorChunk } from "@/lib/rag-vector";

import { IntakeBar } from "@/components/studio/intake-bar";
import { SchemaMapperPanel } from "@/components/studio/schema-mapper-panel";
import { DataTable } from "@/components/studio/data-table";
import { RagVectorModal } from "@/components/studio/rag-vector-modal";
import { SqlHubModal } from "@/components/studio/sql-hub-modal";
import { PipelinesPanel } from "@/components/studio/pipelines-panel";
import { DomainSelector } from "@/components/studio/domain-selector";
import { CompanyProfileModal } from "@/components/studio/company-profile-modal";
import { AiSpecialistModal } from "@/components/studio/ai-specialist-modal";

export default function StudioPage() {
  const initialDomain = BUSINESS_DOMAINS[0];
  const [activeDomainId, setActiveDomainId] = useState<string>(initialDomain.id);
  const [data, setData] = useState<Record<string, string>[]>(() => initialDomain.sampleData);
  const [columns, setColumns] = useState<string[]>(() => initialDomain.columns);
  const [fileName, setFileName] = useState<string>(`${initialDomain.defaultTableName}.csv`);
  const [isCleaned, setIsCleaned] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"clean" | "raw">("raw");

  // Company Profile state
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [showCompanyProfileModal, setShowCompanyProfileModal] = useState<boolean>(false);

  // Modals & Panels
  const [showSchemaMapper, setShowSchemaMapper] = useState<boolean>(false);
  const [showRagModal, setShowRagModal] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [showPipelines, setShowPipelines] = useState<boolean>(false);
  const [showSpecialistModal, setShowSpecialistModal] = useState<boolean>(false);
  const [isSavingDb, setIsSavingDb] = useState<boolean>(false);

  const [mappings, setMappings] = useState<ColumnMapping[]>(() =>
    generateColumnMappings(initialDomain.columns, initialDomain.sampleData)
  );

  // Cleaning options
  const [optTitleCase, setOptTitleCase] = useState<boolean>(true);
  const [optPhoneFormat, setOptPhoneFormat] = useState<boolean>(true);
  const [optDeduplicate, setOptDeduplicate] = useState<boolean>(true);
  const [optDateFormat, setOptDateFormat] = useState<boolean>(true);
  const [optTrimSpaces, setOptTrimSpaces] = useState<boolean>(true);
  const [optFilterSpam, setOptFilterSpam] = useState<boolean>(true);

  // Fetch company profile on load
  useEffect(() => {
    fetch("/api/company-profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.profile) {
          setCompanyProfile(json.profile);
        }
      })
      .catch(() => {});
  }, []);

  // Calculate audit stats
  const calculateAudit = (rows: Record<string, string>[]) => {
    let duplicateRecords = 0;
    let badCasing = 0;
    let badPhones = 0;
    let badDates = 0;
    let trailingSpaces = 0;
    let unformattedTaxIds = 0;
    const seenKeys = new Set<string>();

    (rows || []).forEach((row) => {
      if (!row || typeof row !== "object") return;
      Object.entries(row).forEach(([col, val]) => {
        const lowerCol = String(col || "").toLowerCase();
        const strVal = String(val ?? "");

        if (strVal !== strVal.trim()) trailingSpaces++;

        if (lowerCol.includes("email") || lowerCol.includes("id") || lowerCol.includes("sku")) {
          const norm = strVal.trim().toLowerCase();
          if (norm && seenKeys.has(norm)) duplicateRecords++;
          else if (norm) seenKeys.add(norm);
        }

        if (
          lowerCol.includes("name") ||
          lowerCol.includes("company") ||
          lowerCol.includes("city") ||
          lowerCol.includes("department")
        ) {
          if (strVal && (/^[A-Z\s]{4,}$/.test(strVal) || /^[a-z\s]{4,}$/.test(strVal))) {
            badCasing++;
          }
        }

        if (lowerCol.includes("phone") || lowerCol.includes("mobile")) {
          if (strVal && !/^\(\d{3}\)\s\d{3}-\d{4}$/.test(strVal.trim())) badPhones++;
        }

        if (lowerCol.includes("date")) {
          if (strVal && !/^\d{4}-\d{2}-\d{2}$/.test(strVal.trim())) badDates++;
        }

        if (lowerCol.includes("tax") || lowerCol.includes("ein")) {
          if (strVal && !/^\d{2}-\d{7}$/.test(strVal.trim())) unformattedTaxIds++;
        }
      });
    });

    const totalIssues = duplicateRecords * 3 + badCasing + badPhones + badDates + trailingSpaces + unformattedTaxIds;
    const maxIssues = (rows.length || 1) * 4;
    const rawScore = Math.max(35, Math.min(100, Math.round(100 - (totalIssues / maxIssues) * 100)));

    return {
      healthScore: isCleaned ? 100 : rawScore,
      totalIssues: isCleaned ? 0 : totalIssues,
      duplicateRecords: isCleaned ? 0 : duplicateRecords,
      badCasing: isCleaned ? 0 : badCasing,
      badPhones: isCleaned ? 0 : badPhones,
      badDates: isCleaned ? 0 : badDates,
      unformattedTaxIds: isCleaned ? 0 : unformattedTaxIds,
    };
  };

  const stats = calculateAudit(data);

  const handleSelectDomain = (domain: BusinessDomain) => {
    setActiveDomainId(domain.id);
    setData(domain.sampleData);
    setColumns(domain.columns);
    setFileName(`${domain.defaultTableName}.csv`);
    setMappings(generateColumnMappings(domain.columns, domain.sampleData));
    setIsCleaned(false);
    setViewMode("raw");
  };

  const handleDataLoaded = (newRows: Record<string, string>[], newCols: string[], newFileName: string) => {
    setData(newRows);
    setColumns(newCols);
    setFileName(newFileName);
    setMappings(generateColumnMappings(newCols, newRows));
    setIsCleaned(false);
    setViewMode("raw");
  };

  const handleApplySchema = () => {
    const { arrangedRows, targetColumns } = applySchemaMappings(data, mappings);
    setData(arrangedRows);
    setColumns(targetColumns);
    setShowSchemaMapper(false);
  };

  const handleSaveToSqlDb = async () => {
    setIsSavingDb(true);
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fileName,
          rowCount: data.length,
          healthScore: stats.healthScore,
          columns,
          rawData: data,
          cleanData: data,
        }),
      });
      const json = await res.json();
      if (json.success) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#10B981", "#3B82F6", "#6366F1"],
          });
        } catch (e) {}
        if (window.confirm(`🎉 ${json.message}\n\nWould you like to open the SQL Database Hub to query this table now?`)) {
          setShowSqlModal(true);
        }
      } else {
        alert(`Save error: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Save error: ${e.message}`);
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleCleanData = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const seenKeys = new Set<string>();
      const cleanedRows: Record<string, string>[] = [];

      (data || []).forEach((row) => {
        if (!row || typeof row !== "object") return;
        let emailVal = "";
        let idVal = "";
        for (const [k, v] of Object.entries(row)) {
          const lowerK = String(k).toLowerCase();
          if (lowerK.includes("email")) {
            emailVal = String(v ?? "").trim().toLowerCase();
          }
          if (lowerK.includes("id") || lowerK.includes("sku")) {
            idVal = String(v ?? "").trim().toLowerCase();
          }
        }

        const dedupeKey = emailVal || idVal;
        if (
          optFilterSpam &&
          (emailVal.includes("test@") ||
            emailVal.includes("fake@") ||
            emailVal.includes("asdf@") ||
            idVal.includes("void") ||
            idVal.includes("fake"))
        ) {
          return;
        }

        if (optDeduplicate && dedupeKey) {
          if (seenKeys.has(dedupeKey)) return;
          seenKeys.add(dedupeKey);
        }

        const newRow: Record<string, string> = {};
        Object.entries(row).forEach(([col, val]) => {
          let cleanVal = String(val ?? "");

          if (optTrimSpaces) {
            cleanVal = cleanVal.trim().replace(/\s+/g, " ");
          }

          const lowerCol = String(col).toLowerCase();

          if (
            optTitleCase &&
            (lowerCol.includes("name") ||
              lowerCol.includes("company") ||
              lowerCol.includes("city") ||
              lowerCol.includes("department")) &&
            !lowerCol.includes("email") &&
            !lowerCol.includes("id")
          ) {
            cleanVal = toTitleCase(cleanVal);
          }

          if (optPhoneFormat && (lowerCol.includes("phone") || lowerCol.includes("mobile"))) {
            cleanVal = formatPhoneNumber(cleanVal);
          }

          if (lowerCol.includes("email")) {
            cleanVal = cleanVal.toLowerCase();
          }

          if (optDateFormat && lowerCol.includes("date")) {
            cleanVal = normalizeDate(cleanVal);
          }

          if (lowerCol.includes("tax") || lowerCol.includes("ein")) {
            cleanVal = normalizeTaxId(cleanVal);
          }

          if (lowerCol.includes("website") || lowerCol.includes("url")) {
            cleanVal = normalizeWebsiteUrl(cleanVal);
          }

          if (lowerCol.includes("sku")) {
            cleanVal = normalizeSku(cleanVal);
          }

          if (lowerCol.includes("invoice") || lowerCol.includes("invnum")) {
            cleanVal = normalizeInvoiceNumber(cleanVal);
          }

          if (lowerCol.includes("address") || lowerCol.includes("street")) {
            cleanVal = normalizeAddress(cleanVal);
          }

          if (
            lowerCol.includes("amount") ||
            lowerCol.includes("price") ||
            lowerCol.includes("revenue") ||
            lowerCol.includes("total") ||
            lowerCol.includes("subtotal") ||
            lowerCol.includes("fee") ||
            lowerCol.includes("tuition") ||
            lowerCol.includes("salary") ||
            lowerCol.includes("cost") ||
            lowerCol.includes("value")
          ) {
            cleanVal = normalizeAmount(cleanVal);
          } else if (lowerCol.includes("status") || lowerCol.includes("stage")) {
            cleanVal = toTitleCase(cleanVal);
          }

          newRow[col] = cleanVal;
        });

        cleanedRows.push(newRow);
      });

      setData(cleanedRows);
      setIsCleaned(true);
      setViewMode("clean");
      setIsProcessing(false);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10B981", "#4F46E5", "#06B6D4"],
        });
      } catch (e) {}
    }, 400);
  };

  const handleDownload = () => {
    if (data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cleaned_${fileName.replace(/\.[^/.]+$/, "")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    const csv = Papa.unparse(data);
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ragChunks: VectorChunk[] = generateRagChunks(data, fileName);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Link>
            <div className="h-5 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">CleanData Studio</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Enterprise Edition
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Flagship AI Data Specialist Trigger Button */}
            <button
              onClick={() => setShowSpecialistModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg transition-all shadow-xs border border-slate-700"
            >
              <Bot className="h-3.5 w-3.5 text-emerald-400" />
              <span>AI Data Specialist</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={() => setShowCompanyProfileModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Building2 className="h-3.5 w-3.5 text-brand-600" />
              <span>{companyProfile.name}</span>
            </button>

            <button
              onClick={() => setShowSqlModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Database className="h-3.5 w-3.5 text-blue-600" />
              <span>SQL Database Hub</span>
            </button>

            <button
              onClick={() => setShowPipelines(!showPipelines)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <GitBranch className="h-3.5 w-3.5 text-indigo-600" />
              <span>Pipelines (ETL)</span>
            </button>

            <button
              onClick={handleSaveToSqlDb}
              disabled={isSavingDb}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isSavingDb ? "Saving..." : "Save to SQL"}</span>
            </button>

            <button
              onClick={() => setShowRagModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-indigo-600" />
              <span>Vectorize for RAG</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Enterprise Domain Selector & Workspace Bar */}
        <DomainSelector
          activeDomainId={activeDomainId}
          onSelectDomain={handleSelectDomain}
          onOpenCompanyProfile={() => setShowCompanyProfileModal(true)}
          companyName={companyProfile.name}
          companyTaxId={companyProfile.taxId}
        />

        {/* AI Data Specialist Command Banner */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Autonomous AI Data Specialist
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono font-medium">
                  10 Active Modes
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Analyst • Cleaner • Organizer • Knowledge Engineer • Validator • Researcher • Librarian • RAG Engineer • Agent Manager • Guardian
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSpecialistModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch AI Specialist Command Center</span>
          </button>
        </div>

        {/* Ingestion Channels */}
        <IntakeBar onDataLoaded={handleDataLoaded} setIsProcessing={setIsProcessing} />

        {/* Pipelines Drawer */}
        {showPipelines && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-200">
            <PipelinesPanel
              currentRows={data}
              onPipelineComplete={(cleanedRows) => {
                setData(cleanedRows);
                setIsCleaned(true);
                setViewMode("clean");
              }}
              onClose={() => setShowPipelines(false)}
            />
          </div>
        )}

        {/* Health Score & Cleaning Options Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Card 1: Data Health Meter */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Data Health Score
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span
                  className={`text-4xl font-extrabold tracking-tight ${
                    stats.healthScore >= 90
                      ? "text-emerald-600"
                      : stats.healthScore >= 70
                      ? "text-amber-500"
                      : "text-rose-500"
                  }`}
                >
                  {stats.healthScore}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {stats.totalIssues === 0 ? "Perfect Quality" : `${stats.totalIssues} issues flagged`}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    stats.healthScore >= 90
                      ? "bg-emerald-500"
                      : stats.healthScore >= 70
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${stats.healthScore}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                {stats.badCasing > 0 && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {stats.badCasing} casing
                  </span>
                )}
                {stats.badPhones > 0 && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {stats.badPhones} phone
                  </span>
                )}
                {stats.badDates > 0 && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {stats.badDates} dates
                  </span>
                )}
                {stats.duplicateRecords > 0 && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {stats.duplicateRecords} dupes
                  </span>
                )}
                {stats.unformattedTaxIds > 0 && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {stats.unformattedTaxIds} tax IDs
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Rules Toggles */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Transformation Normalizers
                </span>
                <span className="text-[11px] font-semibold text-brand-600 flex items-center gap-1">
                  <Settings2 className="h-3 w-3" />
                  Auto-Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optTitleCase}
                    onChange={(e) => setOptTitleCase(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Title Case Names</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optPhoneFormat}
                    onChange={(e) => setOptPhoneFormat(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Format Phones</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optDeduplicate}
                    onChange={(e) => setOptDeduplicate(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Deduplicate Rows</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optDateFormat}
                    onChange={(e) => setOptDateFormat(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>ISO 8601 Dates</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optTrimSpaces}
                    onChange={(e) => setOptTrimSpaces(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Trim Spaces</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optFilterSpam}
                    onChange={(e) => setOptFilterSpam(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Filter Test Data</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              <span>Automatic Normalizers: Tax IDs (EIN) • Invoices • SKUs • Currency • Addresses</span>
            </div>
          </div>

          {/* Card 3: Action Buttons */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Action Control
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Standardize table columns or arrange into enterprise target schemas.
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={handleCleanData}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isProcessing ? "Standardizing..." : "1-Click Auto-Clean"}</span>
              </button>

              <button
                onClick={() => setShowSchemaMapper(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                <Sliders className="h-3.5 w-3.5 text-slate-500" />
                <span>Arrange Schema</span>
              </button>
            </div>
          </div>
        </div>

        {/* Schema Mapper Drawer */}
        {showSchemaMapper && (
          <SchemaMapperPanel
            mappings={mappings}
            setMappings={setMappings}
            onApply={handleApplySchema}
            onClose={() => setShowSchemaMapper(false)}
          />
        )}

        {/* Data Table */}
        <DataTable
          data={data}
          columns={columns}
          fileName={fileName}
          isCleaned={isCleaned}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCopy={handleCopy}
          copied={copied}
          onDownload={handleDownload}
        />
      </main>

      {/* Modals */}
      <AiSpecialistModal
        isOpen={showSpecialistModal}
        rows={data}
        columns={columns}
        fileName={fileName}
        onClose={() => setShowSpecialistModal(false)}
        onApplyCleanedData={(cleanedRows) => {
          setData(cleanedRows);
          setIsCleaned(true);
          setViewMode("clean");
        }}
      />

      <CompanyProfileModal
        isOpen={showCompanyProfileModal}
        onClose={() => setShowCompanyProfileModal(false)}
        onProfileUpdated={(p) => setCompanyProfile(p)}
      />

      <SqlHubModal
        isOpen={showSqlModal}
        onClose={() => setShowSqlModal(false)}
        currentData={data}
        columns={columns}
        fileName={fileName}
        onLoadDataset={(rows, cols, name) => {
          setData(rows);
          setColumns(cols);
          setFileName(name);
          setMappings(generateColumnMappings(cols, rows));
          setIsCleaned(true);
          setViewMode("clean");
        }}
      />

      <RagVectorModal
        isOpen={showRagModal}
        onClose={() => setShowRagModal(false)}
        chunks={ragChunks}
        fileName={fileName}
      />
    </div>
  );
}
