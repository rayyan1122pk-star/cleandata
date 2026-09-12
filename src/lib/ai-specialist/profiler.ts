// src/lib/ai-specialist/profiler.ts
import { DataQualityReport, PrioritizedIssue } from "./types";

export function profileDataset(
  rows: Record<string, string>[],
  columns: string[],
  sourceName = "dataset"
): DataQualityReport {
  const safeRows = rows || [];
  const safeCols = columns || [];
  const totalRecords = safeRows.length;
  const totalFields = safeCols.length;

  if (totalRecords === 0) {
    return {
      overallScore: 100,
      subScores: {
        completeness: 100,
        authority: 100,
        freshness: 100,
        consistency: 100,
        extractionQuality: 100,
        securityCoverage: 100,
      },
      metrics: {
        totalRecords: 0,
        totalFields: 0,
        detectedEntitiesCount: 0,
        detectedRelationshipsCount: 0,
        duplicateCandidatesCount: 0,
        conflictsCount: 0,
        sensitiveItemsCount: 0,
        staleRecordsCount: 0,
        malformedValuesCount: 0,
        autoFixedIssuesCount: 0,
      },
      prioritizedIssues: [],
      executiveSummary: "No data loaded yet. Ingest files, clipboard text, or paragraphs to initiate autonomous profiling.",
    };
  }

  let emptyCells = 0;
  let malformedPhones = 0;
  let malformedEmails = 0;
  let malformedDates = 0;
  let unformattedTaxIds = 0;
  let badCasing = 0;
  let trailingSpaces = 0;
  let sensitivePiiCount = 0;
  let staleRecords = 0;
  let detectedEntities = 0;

  const seenKeys = new Map<string, number>();
  let duplicateCount = 0;

  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  safeRows.forEach((row, rowIdx) => {
    if (!row || typeof row !== "object") return;

    // Track entity presence
    const hasNameOrComp = Object.entries(row).some(([col, val]) => {
      const lowerCol = col.toLowerCase();
      return (lowerCol.includes("name") || lowerCol.includes("company")) && Boolean(val && String(val).trim());
    });
    if (hasNameOrComp) detectedEntities++;

    safeCols.forEach((col) => {
      const val = row[col];
      const strVal = val !== undefined && val !== null ? String(val) : "";
      const trimmed = strVal.trim();
      const lowerCol = col.toLowerCase();

      if (!trimmed) {
        emptyCells++;
        return;
      }

      // Whitespace
      if (strVal !== trimmed) {
        trailingSpaces++;
      }

      // Casing check for names and departments
      if (lowerCol.includes("name") || lowerCol.includes("department") || lowerCol.includes("title")) {
        if (/^[A-Z\s]{4,}$/.test(trimmed) || /^[a-z\s]{4,}$/.test(trimmed)) {
          badCasing++;
        }
      }

      // Phone check
      if (lowerCol.includes("phone") || lowerCol.includes("mobile") || lowerCol.includes("tel")) {
        sensitivePiiCount++;
        if (!/^\+?1?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(trimmed)) {
          malformedPhones++;
        }
      }

      // Email check
      if (lowerCol.includes("email") || lowerCol.includes("mail")) {
        sensitivePiiCount++;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          malformedEmails++;
        }
      }

      // Tax ID / SSN check
      if (lowerCol.includes("tax") || lowerCol.includes("ein") || lowerCol.includes("ssn")) {
        sensitivePiiCount++;
        if (!/^\d{2}-\d{7}$/.test(trimmed)) {
          unformattedTaxIds++;
        }
      }

      // Date & freshness check
      if (lowerCol.includes("date") || lowerCol.includes("created") || lowerCol.includes("due")) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          malformedDates++;
        }
        const parsedDate = Date.parse(trimmed);
        if (!isNaN(parsedDate)) {
          const d = new Date(parsedDate);
          if (d < oneYearAgo) {
            staleRecords++;
          }
        }
      }

      // Duplicate detection key on emails, Tax IDs, or SKU/Invoice IDs
      if (lowerCol.includes("email") || lowerCol.includes("tax") || lowerCol.includes("invoice") || lowerCol.includes("id")) {
        const normKey = `${lowerCol}:${trimmed.toLowerCase()}`;
        if (seenKeys.has(normKey)) {
          duplicateCount++;
        } else {
          seenKeys.set(normKey, rowIdx);
        }
      }
    });
  });

  const totalCells = totalRecords * totalFields;
  const completeness = Math.max(20, Math.round(100 - (emptyCells / Math.max(1, totalCells)) * 100));
  const malformedValuesCount = malformedPhones + malformedEmails + malformedDates + unformattedTaxIds + badCasing + trailingSpaces;

  // Compute sub-scores (0-100)
  const consistency = Math.max(30, Math.round(100 - (malformedValuesCount / Math.max(1, totalCells)) * 100));
  const freshness = Math.max(35, Math.round(100 - (staleRecords / Math.max(1, totalRecords)) * 70));
  const authority = 96; // Default enterprise dataset authority baseline
  const extractionQuality = Math.max(40, Math.round(100 - (duplicateCount / Math.max(1, totalRecords)) * 50));
  const securityCoverage = sensitivePiiCount > 0 ? 92 : 98;

  // Composite AI Readiness Score
  const overallScore = Math.round(
    completeness * 0.2 +
      authority * 0.2 +
      freshness * 0.15 +
      consistency * 0.2 +
      extractionQuality * 0.15 +
      securityCoverage * 0.1
  );

  // Prioritize issues into CRITICAL, HIGH, MEDIUM, LOW
  const prioritizedIssues: PrioritizedIssue[] = [];

  if (sensitivePiiCount > 0) {
    prioritizedIssues.push({
      id: "issue_pii_guard",
      severity: "CRITICAL",
      category: "pii",
      title: `${sensitivePiiCount} Sensitive PII Fields Detected (Emails, Phones, Tax IDs)`,
      description: "Direct exposure of unmasked customer identifiers, Tax IDs, and phone numbers to public AI agents poses a security risk.",
      affectedCount: sensitivePiiCount,
      sourceReferences: [sourceName],
      recommendation: "Apply ABAC permission tagging and mask PII fields for public or unauthorized AI agents.",
      status: "open",
      humanActionRequired: false,
    });
  }

  if (staleRecords > 0) {
    prioritizedIssues.push({
      id: "issue_stale_data",
      severity: "HIGH",
      category: "stale",
      title: `${staleRecords} Stale Records Older Than 12 Months`,
      description: "Outdated transactions and records can pollute RAG answers with obsolete business facts.",
      affectedCount: staleRecords,
      sourceReferences: [sourceName],
      recommendation: "Mark records as 'stale' with retrieval time-decay penalty so fresh information takes precedence.",
      status: "open",
      humanActionRequired: true,
    });
  }

  if (duplicateCount > 0) {
    prioritizedIssues.push({
      id: "issue_duplicates",
      severity: "MEDIUM",
      category: "duplicate",
      title: `${duplicateCount} Duplicate Identity References Found`,
      description: "Repeated primary keys (email, invoice ID, or tax ID) found across multiple rows.",
      affectedCount: duplicateCount,
      sourceReferences: [sourceName],
      recommendation: "Automatically merge exact matches and cluster fuzzy aliases into canonical entities.",
      status: "open",
      humanActionRequired: false,
    });
  }

  if (malformedValuesCount > 0) {
    prioritizedIssues.push({
      id: "issue_malformed",
      severity: "LOW",
      category: "malformed",
      title: `${malformedValuesCount} Inconsistent Formatting & Encoding Anomalies`,
      description: `Includes ${badCasing} casing issues, ${unformattedTaxIds} unformatted Tax IDs, ${malformedPhones} non-standard phones, and ${trailingSpaces} trailing spaces.`,
      affectedCount: malformedValuesCount,
      sourceReferences: [sourceName],
      recommendation: "Execute AI Cleaner normalizer to standardize phones to E.164, dates to ISO 8601, and title-case text.",
      status: "open",
      humanActionRequired: false,
    });
  }

  const executiveSummary = `AI Data Specialist profiled ${totalRecords} records across ${totalFields} fields from "${sourceName}". Computed AI Readiness Score is ${overallScore}/100. ${prioritizedIssues.length} priority issue categories identified. ${malformedValuesCount + duplicateCount} routine errors can be resolved autonomously.`;

  return {
    overallScore,
    subScores: {
      completeness,
      authority,
      freshness,
      consistency,
      extractionQuality,
      securityCoverage,
    },
    metrics: {
      totalRecords,
      totalFields,
      detectedEntitiesCount: detectedEntities,
      detectedRelationshipsCount: Math.round(detectedEntities * 1.5),
      duplicateCandidatesCount: duplicateCount,
      conflictsCount: 0,
      sensitiveItemsCount: sensitivePiiCount,
      staleRecordsCount: staleRecords,
      malformedValuesCount,
      autoFixedIssuesCount: 0,
    },
    prioritizedIssues,
    executiveSummary,
  };
}
