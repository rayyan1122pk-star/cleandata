"use client";

import React from "react";
import { BrainCircuit, Check, SlidersHorizontal } from "lucide-react";
import { ColumnMapping, SCHEMA_PRESETS } from "@/lib/schema-mapper";

interface SchemaMapperPanelProps {
  mappings: ColumnMapping[];
  setMappings: (mappings: ColumnMapping[]) => void;
  onApply: () => void;
  onClose: () => void;
}

export function SchemaMapperPanel({
  mappings,
  setMappings,
  onApply,
  onClose,
}: SchemaMapperPanelProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-brand-200 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-brand-600" />
            <span>AI Schema Arranger & Semantic Normalizer</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            AI automatically detected what each column means. Review mappings before applying.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            Apply Standard Schema
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {mappings.map((m, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 truncate max-w-[120px]">
                {m.originalCol}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                {m.detectedType}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span>Maps to:</span>
              <input
                type="text"
                value={m.targetCol}
                onChange={(e) => {
                  const newMappings = [...mappings];
                  newMappings[idx].targetCol = e.target.value;
                  setMappings(newMappings);
                }}
                className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-900 font-medium focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <p className="text-[10px] text-slate-400 truncate">
              Sample: {m.sampleValue}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
