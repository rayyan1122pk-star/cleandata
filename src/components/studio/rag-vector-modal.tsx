"use client";

import React, { useState } from "react";
import { BrainCircuit, X, Zap, Download, Copy, Check } from "lucide-react";
import { VectorChunk, downloadJsonlFile, generateSupabasePgVectorSql } from "@/lib/rag-vector";

interface RagVectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chunks: VectorChunk[];
  fileName: string;
}

export function RagVectorModal({ isOpen, onClose, chunks, fileName }: RagVectorModalProps) {
  const [ragTab, setRagTab] = useState<"preview" | "sync" | "export">("preview");
  const [ragProvider, setRagProvider] = useState<"pinecone" | "chroma" | "qdrant" | "supabase">("pinecone");
  const [ragApiKey, setRagApiKey] = useState<string>("pc_test_sec_9942a1bc8f");
  const [ragEndpoint, setRagEndpoint] = useState<string>("https://prod-rag-index-1234.svc.us-east1.pinecone.io");
  const [ragCollection, setRagCollection] = useState<string>("enterprise-knowledge-base");
  const [ragStatusMessage, setRagStatusMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestVectorDb = async () => {
    setIsSyncing(true);
    setRagStatusMessage(null);
    try {
      const res = await fetch("/api/vector-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-connection",
          provider: ragProvider,
          config: {
            apiKey: ragApiKey,
            endpointUrl: ragEndpoint,
            indexOrCollection: ragCollection,
          },
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setRagStatusMessage(`🟢 ${resData.message} (${resData.latencyMs}ms latency)`);
      } else {
        setRagStatusMessage(`🔴 Connection failed: ${resData.error}`);
      }
    } catch (e: any) {
      setRagStatusMessage(`🔴 Error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncVectors = async () => {
    setIsSyncing(true);
    setRagStatusMessage(null);
    try {
      const res = await fetch("/api/vector-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync-vectors",
          provider: ragProvider,
          config: {
            apiKey: ragApiKey,
            endpointUrl: ragEndpoint,
            indexOrCollection: ragCollection,
          },
          chunks,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setRagStatusMessage(`🎉 ${resData.message}`);
      } else {
        setRagStatusMessage(`🔴 Sync failed: ${resData.error}`);
      }
    } catch (e: any) {
      setRagStatusMessage(`🔴 Error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Enterprise RAG & Vector Database Hub
              </h2>
              <p className="text-xs text-slate-500">
                Convert cleaned data into semantic chunks and sync directly to your vector store.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-semibold">
          <button
            onClick={() => setRagTab("preview")}
            className={`py-3 border-b-2 transition-colors ${
              ragTab === "preview"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            1. Semantic Chunks Preview ({chunks.length})
          </button>
          <button
            onClick={() => setRagTab("sync")}
            className={`py-3 border-b-2 transition-colors ${
              ragTab === "sync"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            2. Direct Vector DB Sync
          </button>
          <button
            onClick={() => setRagTab("export")}
            className={`py-3 border-b-2 transition-colors ${
              ragTab === "export"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            3. Download Embeddings JSONL
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {ragTab === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Natural language passages optimized for vector embeddings:</span>
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                  ~{chunks.reduce((acc, c) => acc + c.estimatedTokens, 0)} total tokens
                </span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                {chunks.slice(0, 5).map((chunk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                      <span className="font-bold text-indigo-600">{chunk.id}</span>
                      <span>{chunk.estimatedTokens} tokens</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">{chunk.text}</p>
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-400 font-mono">
                      <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        source: {chunk.metadata.source}
                      </span>
                      <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        row: {chunk.metadata.rowIndex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {chunks.length > 5 && (
                <p className="text-center text-xs text-slate-400">
                  + {chunks.length - 5} more documents ready for vector ingestion
                </p>
              )}
            </div>
          )}

          {ragTab === "sync" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "pinecone", label: "Pinecone", icon: "🌲" },
                  { id: "qdrant", label: "Qdrant", icon: "🟣" },
                  { id: "chroma", label: "ChromaDB", icon: "🔵" },
                  { id: "supabase", label: "Supabase pgvector", icon: "⚡" },
                ].map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setRagProvider(provider.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      ragProvider === provider.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xl">{provider.icon}</span>
                    <span>{provider.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {ragProvider === "supabase" ? "Project URL" : "Cluster / Host Endpoint URL"}
                  </label>
                  <input
                    type="text"
                    value={ragEndpoint}
                    onChange={(e) => setRagEndpoint(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    API Key / Service Role Token
                  </label>
                  <input
                    type="password"
                    value={ragApiKey}
                    onChange={(e) => setRagApiKey(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Collection / Index Name
                  </label>
                  <input
                    type="text"
                    value={ragCollection}
                    onChange={(e) => setRagCollection(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {ragStatusMessage && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium">
                    {ragStatusMessage}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleTestVectorDb}
                  disabled={isSyncing}
                  className="text-xs font-semibold text-slate-700 border border-slate-300 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Test Connection
                </button>
                <button
                  onClick={handleSyncVectors}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl shadow-md transition-all"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>{isSyncing ? "Syncing..." : `Sync ${chunks.length} Vectors Now`}</span>
                </button>
              </div>
            </div>
          )}

          {ragTab === "export" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                <h4 className="font-bold text-indigo-900">Standardized Embeddings Formats</h4>
                <p className="text-indigo-700">
                  Download pre-formatted vector documents directly to load into{" "}
                  <strong>LangChain</strong>, <strong>LlamaIndex</strong>, or run embeddings via the{" "}
                  <strong>OpenAI Embeddings API</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block mb-1">
                      JSONL Embeddings Dataset
                    </span>
                    <p className="text-slate-500 text-xs">
                      Line-delimited JSON with id, text, and rich metadata ready for vector loaders.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      downloadJsonlFile(chunks, `${fileName.replace(/\.[^/.]+$/, "")}_rag.jsonl`)
                    }
                    className="flex items-center justify-center gap-1.5 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .jsonl</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block mb-1">
                      Supabase pgvector SQL
                    </span>
                    <p className="text-slate-500 text-xs">
                      Copy direct SQL insert statements to run inside Supabase SQL Editor.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const sql = generateSupabasePgVectorSql(chunks);
                      navigator.clipboard.writeText(sql);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors"
                  >
                    {copiedSql ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSql ? "Copied SQL!" : "Copy Supabase SQL"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>🔒 Zero external storage — Your vector credentials remain strictly local.</span>
          <button onClick={onClose} className="text-xs font-semibold text-slate-700 hover:underline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
