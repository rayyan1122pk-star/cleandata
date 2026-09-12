export interface VectorChunk {
  id: string;
  text: string;
  metadata: Record<string, any>;
  estimatedTokens: number;
}

export interface VectorDbConfig {
  provider: "pinecone" | "chroma" | "qdrant" | "supabase" | "jsonl";
  apiKey?: string;
  endpointUrl?: string;
  indexOrCollection?: string;
  namespace?: string;
}

/**
 * Transforms tabular data rows into semantic natural language chunks for RAG
 */
export function generateRagChunks(
  rows: Record<string, string>[],
  sourceName = "dataset"
): VectorChunk[] {
  return (rows || [])
    .filter((row) => row && typeof row === "object")
    .map((row, idx) => {
      const fields = Object.entries(row)
        .filter(([_, val]) => val !== null && val !== undefined && String(val).trim().length > 0)
        .map(([col, val]) => `${String(col).replace(/_/g, " ")} is "${String(val).trim()}"`);

      const semanticText = `Entity record #${idx + 1} from ${sourceName}: ${fields.join(", ")}.`;
      const estimatedTokens = Math.max(1, Math.ceil(semanticText.length / 4));

      return {
        id: `doc_${String(sourceName)
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_")}_row_${idx + 1}`,
        text: semanticText,
        metadata: {
          rowIndex: idx + 1,
          source: sourceName,
          timestamp: new Date().toISOString(),
          rawFields: row,
        },
        estimatedTokens,
      };
    });
}

/**
 * Formats chunks into standard JSONL ready for OpenAI / LangChain / LlamaIndex
 */
export function exportToJsonl(chunks: VectorChunk[]): string {
  return chunks.map((c) => JSON.stringify(c)).join("\n");
}

/**
 * Generates SQL statements for Supabase pgvector
 */
export function generateSupabasePgVectorSql(
  chunks: VectorChunk[],
  tableName = "documents"
): string {
  const sqlStatements = chunks.map((c) => {
    const escapedText = c.text.replace(/'/g, "''");
    const jsonMeta = JSON.stringify(c.metadata).replace(/'/g, "''");
    return `INSERT INTO ${tableName} (content, metadata) VALUES ('${escapedText}', '${jsonMeta}'::jsonb);`;
  });

  return [
    `-- CleanData AI: Supabase pgvector Export`,
    `-- 1. Ensure extension is active: CREATE EXTENSION IF NOT EXISTS vector;`,
    `-- 2. Insert cleaned chunks:`,
    ...sqlStatements,
  ].join("\n");
}

/**
 * Downloads JSONL vector chunks in browser
 */
export function downloadJsonlFile(chunks: VectorChunk[], filename = "clean_rag_chunks.jsonl") {
  const content = exportToJsonl(chunks);
  const blob = new Blob([content], { type: "application/jsonl;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
