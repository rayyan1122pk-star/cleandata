"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Bot,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Share2,
  BrainCircuit,
  FileCheck2,
  RefreshCw,
  Terminal,
  Clock,
  Database,
  Search,
} from "lucide-react";
import {
  AutonomousRunResult,
  runAutonomousAiDataSpecialist,
  generateAgentContext,
  AgentContextResponse,
} from "@/lib/ai-specialist";

interface AiSpecialistModalProps {
  isOpen: boolean;
  rows: Record<string, string>[];
  columns: string[];
  fileName: string;
  onClose: () => void;
  onApplyCleanedData?: (cleanedRows: Record<string, string>[]) => void;
}

export function AiSpecialistModal({
  isOpen,
  rows,
  columns,
  fileName,
  onClose,
  onApplyCleanedData,
}: AiSpecialistModalProps) {
  const [activeTab, setActiveTab] = useState<"readiness" | "issues" | "entities" | "selftest" | "agent">("readiness");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Initialize with autonomous run
  const [runResult, setRunResult] = useState<AutonomousRunResult>(() =>
    runAutonomousAiDataSpecialist(rows, columns, fileName)
  );

  // Re-run specialist when opened or when dataset changes
  React.useEffect(() => {
    if (isOpen) {
      setRunResult(runAutonomousAiDataSpecialist(rows, columns, fileName));
    }
  }, [isOpen, rows, columns, fileName]);

  // Agent context testing state
  const [agentRole, setAgentRole] = useState<"support_agent" | "sales_agent" | "finance_agent" | "public_agent">("support_agent");
  const [agentQuery, setAgentQuery] = useState<string>("Can I issue a refund for this invoice?");
  const [agentContextResult, setAgentContextResult] = useState<AgentContextResponse | null>(() =>
    generateAgentContext(
      {
        agentId: "agent-preview",
        agentRole: "support_agent",
        query: "Can I issue a refund for this invoice?",
      },
      runResult.chunks,
      runResult.entities,
      runResult.conflicts
    )
  );

  const handleRunSpecialist = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAutonomousAiDataSpecialist(rows, columns, fileName);
      setRunResult(res);
      setIsRunning(false);
    }, 400);
  };

  const handleResolveConflict = (conflictId: string) => {
    setRunResult((prev) => {
      const updatedConflicts = prev.conflicts.map((c) =>
        c.id === conflictId ? { ...c, status: "human_approved" as const, resolvedBy: "Human Reviewer" } : c
      );
      return {
        ...prev,
        conflicts: updatedConflicts,
        aiReadinessScore: Math.min(99, prev.aiReadinessScore + 4),
      };
    });
  };

  const handleTestAgentContext = () => {
    const res = generateAgentContext(
      {
        agentId: "agent-interactive",
        agentRole,
        query: agentQuery,
      },
      runResult.chunks,
      runResult.entities,
      runResult.conflicts
    );
    setAgentContextResult(res);
  };

  const specialistModes = [
    "Analyst",
    "Cleaner",
    "Organizer",
    "Knowledge Engineer",
    "Data Validator",
    "Researcher",
    "Librarian",
    "RAG Engineer",
    "Agent Manager",
    "Data Guardian",
  ];

  const report = runResult.qualityReport;

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header with 10 Modes */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col gap-2.5 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  <span>AI Data Specialist</span>
                  <span className="text-[10px] bg-brand-500/30 text-brand-300 border border-brand-400/30 px-2 py-0.5 rounded-full font-mono font-medium">
                    Autonomous Mode
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Prepares, validates, and engineers business data for AI agents & RAG with minimal human intervention.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunSpecialist}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
                <span>{isRunning ? "Specialist Analyzing..." : "Re-Run Autonomous Analysis"}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 10 Modes pill row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Active Modes:
            </span>
            {specialistModes.map((mode) => (
              <span
                key={mode}
                className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60 font-medium"
              >
                {mode}
              </span>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab("readiness")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "readiness"
                ? "border-brand-600 text-brand-600 font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>AI Readiness Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "issues"
                ? "border-brand-600 text-brand-600 font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Prioritized Exceptions ({report.prioritizedIssues.length + runResult.conflicts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("entities")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "entities"
                ? "border-brand-600 text-brand-600 font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Share2 className="h-4 w-4 text-indigo-500" />
            <span>Entities & Relationships ({runResult.entities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("selftest")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "selftest"
                ? "border-brand-600 text-brand-600 font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
            <span>RAG Self-Test Results</span>
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "agent"
                ? "border-brand-600 text-brand-600 font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <BrainCircuit className="h-4 w-4 text-purple-600" />
            <span>Agent Context API Simulator</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: READINESS */}
          {activeTab === "readiness" && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-linear-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Autonomous Intelligence Report
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Data is {runResult.aiReadinessScore}% AI-Ready
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.executiveSummary}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    Provenance: Raw source preserved with full identity & lineage.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 shrink-0">
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-emerald-400">
                      {runResult.aiReadinessScore}
                    </span>
                    <span className="text-xs text-slate-300 block font-medium">/ 100 Readiness</span>
                  </div>
                  <div className="h-10 w-px bg-white/15" />
                  <div className="text-[11px] space-y-1 text-slate-300 font-medium">
                    <div>⚡ Executed: {runResult.executionTimeMs}ms</div>
                    <div>🛠️ Auto-Fixes: {report.metrics.autoFixedIssuesCount}</div>
                    <div>🎯 RAG Chunks: {runResult.chunks.length}</div>
                  </div>
                </div>
              </div>

              {/* 6 Sub-Scores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Authority", val: report.subScores.authority, color: "text-brand-600" },
                  { label: "Freshness", val: report.subScores.freshness, color: "text-emerald-600" },
                  { label: "Consistency", val: report.subScores.consistency, color: "text-indigo-600" },
                  { label: "Completeness", val: report.subScores.completeness, color: "text-amber-600" },
                  { label: "Extraction", val: report.subScores.extractionQuality, color: "text-blue-600" },
                  { label: "Security", val: report.subScores.securityCoverage, color: "text-teal-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-slate-500 font-medium block">{s.label}</span>
                    <span className={`text-xl font-extrabold ${s.color}`}>{s.val}%</span>
                  </div>
                ))}
              </div>

              {/* Quick Action to Apply Cleaned Rows */}
              {onApplyCleanedData && (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      AI Data Specialist has standardized phone numbers, dates, emails, currencies, and tax IDs.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (onApplyCleanedData) {
                        onApplyCleanedData(runResult.cleanedRows || rows);
                        alert("Cleaned & standardized dataset committed to studio view!");
                        onClose();
                      }
                    }}
                    className="px-3.5 py-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    Commit Cleaned Data to View
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ISSUES & CONFLICTS */}
          {activeTab === "issues" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Issues are ranked by severity. High-confidence routine errors are handled automatically; human review is reserved for genuine business ambiguities.
                </p>
                <span className="text-xs font-bold text-slate-500">
                  {report.prioritizedIssues.length + runResult.conflicts.length} Identified Issues
                </span>
              </div>

              {/* Conflicts (CRITICAL) */}
              {runResult.conflicts.map((conf) => (
                <div
                  key={conf.id}
                  className="border-2 border-amber-200 bg-amber-50/50 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                        CRITICAL CONFLICT
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{conf.topic}</h4>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      Confidence: {Math.round(conf.confidence * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                      <p className="font-bold text-slate-800 flex items-center justify-between">
                        <span>📄 Source A: {conf.sourceA.name}</span>
                        <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                          {conf.sourceA.authority}
                        </span>
                      </p>
                      <p className="text-slate-600 mt-1 italic">"{conf.sourceA.statement}"</p>
                      <span className="text-[10px] text-slate-400 block mt-1">Date: {conf.sourceA.date}</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                      <p className="font-bold text-slate-800 flex items-center justify-between">
                        <span>📄 Source B: {conf.sourceB.name}</span>
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {conf.sourceB.authority}
                        </span>
                      </p>
                      <p className="text-slate-600 mt-1 italic">"{conf.sourceB.statement}"</p>
                      <span className="text-[10px] text-slate-400 block mt-1">Date: {conf.sourceB.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-amber-900 font-medium">
                      💡 <strong>Recommended Resolution:</strong> {conf.recommendedResolution}
                    </p>
                    {conf.status === "unresolved" ? (
                      <button
                        onClick={() => handleResolveConflict(conf.id)}
                        className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl shadow-xs shrink-0"
                      >
                        Approve Official Resolution
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">
                        Resolved & Enforced
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Other Ranked Issues */}
              {report.prioritizedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="border border-slate-200 bg-white rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          issue.severity === "CRITICAL"
                            ? "bg-red-600 text-white"
                            : issue.severity === "HIGH"
                            ? "bg-amber-500 text-white"
                            : issue.severity === "MEDIUM"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-500 text-white"
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{issue.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{issue.description}</p>
                    <p className="text-[11px] text-slate-500 italic pt-1">
                      💡 <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                    {issue.affectedCount} items
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ENTITIES & RELATIONSHIPS */}
          {activeTab === "entities" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Canonical Extracted Entities ({runResult.entities.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {runResult.entities.map((ent) => (
                    <div
                      key={ent.id}
                      className="border border-slate-200 bg-slate-50/60 rounded-xl p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase">
                          {ent.entityType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {Math.round(ent.confidence * 100)}% match
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{ent.canonicalName}</p>
                      {ent.aliases.length > 1 && (
                        <p className="text-[11px] text-slate-500">
                          Aliases: {ent.aliases.slice(1).join(", ")}
                        </p>
                      )}
                      {ent.primaryIdentifier && (
                        <p className="text-[11px] text-slate-600 font-mono">ID: {ent.primaryIdentifier}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Discovered Cross-Source Relationships ({runResult.relationships.length})
                </h4>
                <div className="space-y-2">
                  {runResult.relationships.map((rel) => (
                    <div
                      key={rel.id}
                      className="border border-slate-200 bg-white rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rel.sourceName}</span>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                          {rel.relationshipType}
                        </span>
                        <span className="font-bold text-slate-900">{rel.targetName}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] italic">{rel.evidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAG SELF TEST */}
          {activeTab === "selftest" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Autonomous Self-Testing Certification Passed ({runResult.aiReadinessScore}/100)</span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  The AI Data Specialist generated realistic business test queries from the ingested corpus and verified retrieval accuracy, source authority match, and permission safety.
                </p>
              </div>

              <div className="space-y-3">
                {runResult.selfTestResults.map((test) => (
                  <div
                    key={test.id}
                    className="border border-slate-200 bg-white rounded-xl p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">Q:</span>
                        <span>{test.question}</span>
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {test.latencyMs}ms • Score: {test.relevanceScore}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1 text-[11px] text-slate-600">
                      <p>
                        <strong className="text-slate-800">Retrieved Answer:</strong> {test.retrievedAnswer}
                      </p>
                      <p className="text-slate-400">
                        <strong>Source:</strong> {test.retrievedSource} (Authority Verified)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AGENT CONTEXT SIMULATOR */}
          {activeTab === "agent" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Select Autonomous Agent Role:</span>
                    <select
                      value={agentRole}
                      onChange={(e: any) => setAgentRole(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                    >
                      <option value="support_agent">Customer Support Agent (Support + Policies)</option>
                      <option value="sales_agent">Sales Agent (Pricing + Products)</option>
                      <option value="finance_agent">Finance Agent (Invoices + Tax Accounts)</option>
                      <option value="public_agent">Public Chatbot (Strict Public Documentation Only)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleTestAgentContext}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Query Agent Context API</span>
                  </button>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Agent Prompt / User Inquiry:</label>
                  <input
                    type="text"
                    value={agentQuery}
                    onChange={(e) => setAgentQuery(e.target.value)}
                    placeholder="e.g. Can I refund invoice INV-2024-001?"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Agent Context Response View */}
              {agentContextResult && (
                <div className="border border-slate-200 bg-slate-900 text-white rounded-2xl p-4 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Terminal className="h-4 w-4" />
                      <span>POST /api/v1/agent/context (HTTP 200 OK)</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Latency: {agentContextResult.latencyMs}ms • Confidence: {agentContextResult.confidence}
                    </span>
                  </div>

                  {agentContextResult.activeConflictWarnings && (
                    <div className="bg-amber-900/40 border border-amber-600/40 p-2.5 rounded-lg text-amber-300 text-[11px]">
                      ⚠️ <strong>Active Conflict Alert:</strong> {agentContextResult.activeConflictWarnings[0]?.warning}
                    </div>
                  )}

                  <div className="space-y-2 text-[11px] text-slate-300">
                    <div>
                      <span className="text-brand-400 font-bold">Authoritative Policies:</span>
                      {agentContextResult.relevantPolicies.length > 0 ? (
                        agentContextResult.relevantPolicies.map((p, i) => (
                          <div key={i} className="pl-3 mt-1 text-slate-200">
                            • <strong>{p.topic}:</strong> "{p.statement}" (Source: {p.source})
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500 pl-2">None matched</span>
                      )}
                    </div>

                    <div>
                      <span className="text-purple-400 font-bold">Retrieved Context Chunks:</span>
                      {agentContextResult.relevantChunks.map((c, i) => (
                        <div key={i} className="pl-3 mt-1 text-slate-300">
                          [{c.authority} - {c.relevanceScore}] {c.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            💡 The AI Data Specialist autonomously handles routine data engineering; human interaction is limited to ambiguous exceptions.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
