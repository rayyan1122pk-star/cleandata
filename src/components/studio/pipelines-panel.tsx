"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Play, CheckCircle2, ArrowRight, Clock, Zap, RefreshCw, Layers } from "lucide-react";

interface PipelinesPanelProps {
  currentRows: Record<string, string>[];
  onPipelineComplete: (cleanedRows: Record<string, string>[]) => void;
  onClose: () => void;
}

export function PipelinesPanel({
  currentRows,
  onPipelineComplete,
  onClose,
}: PipelinesPanelProps) {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runLog, setRunLog] = useState<string | null>(null);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pipelines");
      const json = await res.json();
      if (json.success) {
        setPipelines(json.pipelines || []);
        setRuns(json.runs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPipeline = async (pipelineId: string) => {
    setIsRunning(true);
    setRunLog(null);
    try {
      const res = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run",
          pipelineId,
          rows: currentRows,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRunLog(`✅ ${json.log}`);
        if (json.cleaned && json.cleaned.length > 0) {
          onPipelineComplete(json.cleaned);
        }
        fetchPipelines(); // refresh stats & runs
      } else {
        setRunLog(`❌ ${json.error}`);
      }
    } catch (e: any) {
      setRunLog(`❌ ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-md space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Automated Data Pipelines (ETL Orchestrator)
            </h3>
            <p className="text-xs text-slate-500">
              Configure recurring automated ingestion, cleaning rules, and direct SQL/Vector loading.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1"
        >
          Close Pipelines
        </button>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
          <span className="font-bold text-slate-700">1. Source Ingest</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
            Files/Clipboard
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 hidden sm:block" />

        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-brand-200 shadow-xs">
          <span className="font-bold text-brand-700">2. Cleaning Transforms</span>
          <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-mono">
            Dedupe + Case + Standardize
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 hidden sm:block" />

        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-emerald-200 shadow-xs">
          <span className="font-bold text-emerald-700">3. Storage & Sink</span>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
            SQLite Table / Vector DB
          </span>
        </div>
      </div>

      {/* Active Pipelines */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Configured Pipelines
        </h4>

        {loading ? (
          <p className="text-xs text-slate-400">Loading pipelines...</p>
        ) : (
          pipelines.map((pipe) => (
            <div
              key={pipe.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{pipe.name}</span>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                    {pipe.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span>Source: <strong>{pipe.source_type}</strong></span>
                  <span>•</span>
                  <span>Destination: <strong>{pipe.destination}</strong></span>
                  <span>•</span>
                  <span>Total Processed: <strong>{pipe.total_processed}</strong></span>
                </div>
              </div>

              <button
                onClick={() => handleRunPipeline(pipe.id)}
                disabled={isRunning}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>{isRunning ? "Executing..." : "Run on Current Data"}</span>
              </button>
            </div>
          ))
        )}

        {runLog && (
          <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl">
            {runLog}
          </div>
        )}
      </div>

      {/* Recent Execution History */}
      {runs.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Pipeline Runs
          </h4>
          <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white text-xs">
            {runs.slice(0, 5).map((run) => (
              <div key={run.id} className="p-2.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-600 truncate">{run.logs}</span>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(run.executed_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
