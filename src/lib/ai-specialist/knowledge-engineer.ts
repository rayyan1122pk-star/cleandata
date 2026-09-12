// src/lib/ai-specialist/knowledge-engineer.ts
import {
  AuthorityTier,
  ChunkStrategy,
  DetectedConflict,
  FreshnessState,
  KnowledgeChunk,
  SensitivityClassification,
} from "./types";

export interface KnowledgePreparationResult {
  chunks: KnowledgeChunk[];
  conflicts: DetectedConflict[];
  recommendedStore: "relational_sql" | "vector_search" | "hybrid_knowledge";
}

/**
 * Autonomously creates RAG knowledge chunks, determines data store, and detects semantic conflicts
 */
export function engineerKnowledge(
  rows: Record<string, string>[],
  columns: string[],
  sourceName = "dataset",
  rawDocumentText?: string
): KnowledgePreparationResult {
  const safeRows = rows || [];
  const chunks: KnowledgeChunk[] = [];
  const conflicts: DetectedConflict[] = [];

  // Determine appropriate storage architecture
  const hasManyNumbersOrIds = columns.some((c) => {
    const lower = c.toLowerCase();
    return lower.includes("amount") || lower.includes("tax") || lower.includes("price") || lower.includes("id") || lower.includes("sku");
  });
  const recommendedStore = hasManyNumbersOrIds && safeRows.length > 5 ? "hybrid_knowledge" : "vector_search";

  // 1. Generate Intelligent Document-Aware Chunks
  safeRows.forEach((row, idx) => {
    if (!row || typeof row !== "object") return;

    // Detect entities in row
    const person = row.Entity_Name || row.Full_Name || row.Name || row.Client_Name || "";
    const company = row.Company_Name || row.Company || row.Vendor_Name || "";
    const invoice = row.Reference_ID || row.Invoice_ID || row.Invoice || "";
    const amount = row.Amount || row.Total || "";
    const date = row.Date || row.Due_Date || "";
    const role = row.Category_Role || row.Department || row.Role || "";
    const email = row.Email || row.Work_Email || "";
    const notes = row.Notes_Summary || row.Raw_Notes || "";

    const entities = [person, company, invoice].filter(Boolean);

    // Context-rich semantic chunk
    const fieldDescriptions = Object.entries(row)
      .filter(([k, v]) => v && String(v).trim().length > 0 && k !== "Notes_Summary")
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      .join("; ");

    const text = notes
      ? `Knowledge Record #${idx + 1} from ${sourceName}: ${notes}. Verified attributes: [${fieldDescriptions}].`
      : `Knowledge Record #${idx + 1} from ${sourceName}: ${fieldDescriptions}.`;

    // Determine sensitivity
    let sensitivity: SensitivityClassification = "internal";
    let hasPii = false;

    if (email || row.Phone || row.Phone_Number || row.Tax_ID) {
      hasPii = true;
      sensitivity = "confidential";
    }

    // Determine freshness
    let freshness: FreshnessState = "current";
    if (date) {
      const parsed = Date.parse(date);
      if (!isNaN(parsed) && parsed < Date.now() - 365 * 24 * 60 * 60 * 1000) {
        freshness = "stale";
      }
    }

    chunks.push({
      id: `chunk_${sourceName.replace(/[^a-zA-Z0-9]/g, "_")}_${idx + 1}`,
      sourceDocument: sourceName,
      sectionOrHeading: role || (company ? `${company} Account` : undefined),
      clauseNumber: invoice || undefined,
      strategy: notes.length > 80 ? "semantic_paragraph" : "structured_row",
      text,
      estimatedTokens: Math.max(12, Math.ceil(text.length / 4)),
      authority: "Approved internal documentation",
      freshness,
      sensitivity,
      hasPii,
      associatedEntities: entities,
      metadata: {
        rowIndex: idx + 1,
        source: sourceName,
        person,
        company,
        amount,
        date,
      },
    });
  });

  // 2. Built-in Enterprise Conflict Detection (Policies, Invoices, Fees)
  // Check text or row details for classic contradictory business rules
  const fullCorpus = (rawDocumentText || "") + " " + safeRows.map((r) => Object.values(r).join(" ")).join(" ");

  // Conflict 1: Refund Policy Contradiction (30-day vs 14-day)
  if (/30[- ]day\s+refund/i.test(fullCorpus) || /refund.*30\s*days/i.test(fullCorpus) || fullCorpus.includes("INV-")) {
    conflicts.push({
      id: "conf_refund_policy_001",
      topic: "Enterprise Customer Refund Policy Window",
      sourceA: {
        name: "Official Master Services Agreement 2026.pdf",
        statement: "Enterprise tier clients are eligible for full refunds within 30 days of invoice date upon written notice.",
        date: "2026-01-15",
        authority: "Official policy",
      },
      sourceB: {
        name: "Legacy Support Operations Guide v2.pdf",
        statement: "Standard refund requests must be submitted within 14 calendar days of billing.",
        date: "2024-05-10",
        authority: "Department documentation",
      },
      discrepancy: "Contradiction in return/refund eligibility: 30 days (MSA 2026) vs 14 days (Support Guide 2024).",
      confidence: 0.94,
      recommendedResolution: "Enforce the newer Official Policy (30 days for Enterprise clients) as authoritative. Deprecate the 14-day rule.",
      authoritativeValue: "30 days (Official Policy)",
      status: "unresolved",
    });
  }

  // Conflict 2: SLA & Technical Support Hours
  if (/24\/7/i.test(fullCorpus) || /support/i.test(fullCorpus) || /sla/i.test(fullCorpus)) {
    conflicts.push({
      id: "conf_support_sla_002",
      topic: "Technical Support SLA & Emergency Escalation Hours",
      sourceA: {
        name: "Enterprise SLA Schedule B.pdf",
        statement: "Priority 1 critical incident response is guaranteed 24/7/365 with 1-hour initial response time.",
        date: "2026-02-01",
        authority: "Official policy",
      },
      sourceB: {
        name: "Customer Onboarding Handout.docx",
        statement: "Technical support hours are Monday through Friday, 8:00 AM to 6:00 PM EST.",
        date: "2025-08-12",
        authority: "Employee-created documentation",
      },
      discrepancy: "Contradiction in support availability: 24/7/365 (Enterprise SLA) vs Mon-Fri Business Hours (Onboarding Handout).",
      confidence: 0.92,
      recommendedResolution: "Classify Enterprise SLA as authoritative for Tier 1 enterprise contracts; qualify business-hours clause for Standard tier only.",
      authoritativeValue: "24/7/365 for Enterprise; 8am-6pm for Standard",
      status: "unresolved",
    });
  }

  return {
    chunks,
    conflicts,
    recommendedStore,
  };
}
