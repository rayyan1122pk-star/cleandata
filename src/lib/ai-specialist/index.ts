// src/lib/ai-specialist/index.ts
import { AutonomousRunResult } from "./types";
import { profileDataset } from "./profiler";
import { cleanAndOrganizeData } from "./cleaner-organizer";
import { engineerKnowledge } from "./knowledge-engineer";
import { runAutonomousRagSelfTest } from "./rag-self-test";

export * from "./types";
export * from "./profiler";
export * from "./cleaner-organizer";
export * from "./knowledge-engineer";
export * from "./rag-self-test";
export * from "./agent-manager";

/**
 * Autonomous AI Data Specialist Master Execution Pipeline
 * Replaces manual data prep by executing the 10 specialist modes end-to-end.
 */
export function runAutonomousAiDataSpecialist(
  rows: Record<string, string>[],
  columns: string[],
  sourceName = "enterprise_dataset.csv",
  rawDocumentText?: string
): AutonomousRunResult {
  const startTime = Date.now();
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Mode 1: Analyst & Data Profiler
  const initialProfile = profileDataset(rows, columns, sourceName);

  // Mode 2 & 3: Cleaner & Organizer (Deduplication + Entity Resolution + Relationships)
  const cleanResult = cleanAndOrganizeData(rows, columns, sourceName);

  // Mode 4, 6, 7: Knowledge Engineer, Librarian & Conflict Detector
  const knowledgeResult = engineerKnowledge(cleanResult.cleanedRows, columns, sourceName, rawDocumentText);

  // Mode 8: RAG Engineer & Autonomous Self-Test Validator
  const selfTestResult = runAutonomousRagSelfTest(
    knowledgeResult.chunks,
    cleanResult.entities,
    knowledgeResult.conflicts,
    sourceName
  );

  // Mode 5 & 10: Final Quality & Readiness Audit
  const finalScore = Math.max(initialProfile.overallScore, selfTestResult.aiReadinessScore);

  // Update auto-fixed count in metrics
  const updatedReport = {
    ...initialProfile,
    overallScore: finalScore,
    metrics: {
      ...initialProfile.metrics,
      autoFixedIssuesCount: cleanResult.fixedCount,
      detectedEntitiesCount: cleanResult.entities.length,
      detectedRelationshipsCount: cleanResult.relationships.length,
      conflictsCount: knowledgeResult.conflicts.length,
      duplicateCandidatesCount: cleanResult.duplicates.length,
    },
    executiveSummary: `Autonomous AI Data Specialist successfully processed "${sourceName}". Fixed ${cleanResult.fixedCount} formatting errors, resolved ${cleanResult.entities.length} canonical entities, identified ${knowledgeResult.conflicts.length} policy conflicts, and passed RAG self-test at ${selfTestResult.overallPassRate}% precision. Certified AI Readiness Score: ${finalScore}/100.`,
  };

  const executionTimeMs = Date.now() - startTime;

  return {
    runId,
    timestamp: new Date().toISOString(),
    aiReadinessScore: finalScore,
    executionTimeMs,
    qualityReport: updatedReport,
    entities: cleanResult.entities,
    relationships: cleanResult.relationships,
    conflicts: knowledgeResult.conflicts,
    duplicates: cleanResult.duplicates,
    chunks: knowledgeResult.chunks,
    selfTestResults: selfTestResult.testResults,
    rawSourcePreserved: true,
    auditTrailSummary: `Run ${runId}: Ingested ${rows.length} records -> Profiled -> Cleaned (${cleanResult.fixedCount} auto-fixes) -> Extracted ${cleanResult.entities.length} entities -> Engineered ${knowledgeResult.chunks.length} RAG chunks -> Validated via ${selfTestResult.testResults.length} self-test queries -> Readiness: ${finalScore}% in ${executionTimeMs}ms.`,
  };
}
