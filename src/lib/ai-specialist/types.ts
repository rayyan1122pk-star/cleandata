// src/lib/ai-specialist/types.ts

export type SpecialistMode =
  | "Analyst"
  | "Cleaner"
  | "Organizer"
  | "Knowledge Engineer"
  | "Data Validator"
  | "Researcher"
  | "Librarian"
  | "RAG Engineer"
  | "Agent Knowledge Manager"
  | "Data Guardian";

export type DocumentCategory =
  | "Customer"
  | "Product"
  | "Employee"
  | "Company"
  | "Invoice"
  | "Order"
  | "Contract"
  | "Policy"
  | "FAQ"
  | "Procedure"
  | "Documentation"
  | "Pricing"
  | "Support ticket"
  | "Conversation"
  | "Transaction"
  | "Location"
  | "Event"
  | "Legal document"
  | "Financial document"
  | "Internal knowledge"
  | "Other";

export type AuthorityTier =
  | "Official policy"
  | "Approved internal documentation"
  | "Department documentation"
  | "Employee-created documentation"
  | "Customer conversation"
  | "External website"
  | "Unknown";

export type FreshnessState = "current" | "outdated" | "stale" | "expired" | "unknown";

export type SensitivityClassification = "public" | "internal" | "confidential" | "restricted";

export type ChunkStrategy =
  | "faq_qa"
  | "technical_heading"
  | "contract_clause"
  | "policy_condition"
  | "conversation"
  | "semantic_paragraph"
  | "structured_row";

export interface PrioritizedIssue {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "conflict" | "pii" | "stale" | "duplicate" | "malformed" | "missing_field";
  title: string;
  description: string;
  affectedCount: number;
  sourceReferences: string[];
  recommendation: string;
  status: "open" | "auto_resolved" | "human_reviewed" | "dismissed";
  humanActionRequired: boolean;
}

export interface DataQualityReport {
  overallScore: number; // 0-100
  subScores: {
    completeness: number;
    authority: number;
    freshness: number;
    consistency: number;
    extractionQuality: number;
    securityCoverage: number;
  };
  metrics: {
    totalRecords: number;
    totalFields: number;
    detectedEntitiesCount: number;
    detectedRelationshipsCount: number;
    duplicateCandidatesCount: number;
    conflictsCount: number;
    sensitiveItemsCount: number;
    staleRecordsCount: number;
    malformedValuesCount: number;
    autoFixedIssuesCount: number;
  };
  prioritizedIssues: PrioritizedIssue[];
  executiveSummary: string;
}

export interface ExtractedEntity {
  id: string;
  entityType: "person" | "company" | "customer" | "product" | "order" | "invoice" | "policy" | "department" | "location";
  canonicalName: string;
  aliases: string[];
  primaryIdentifier?: string; // Tax ID, email, SKU, invoice ID
  attributes: Record<string, any>;
  confidence: number;
  sourceProvenances: string[];
}

export interface DiscoveredRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  sourceName: string;
  targetName: string;
  relationshipType:
    | "PURCHASED"
    | "ISSUED_INVOICE"
    | "EMPLOYED_BY"
    | "GOVERNED_BY"
    | "ASSOCIATED_WITH"
    | "CONTAINS_PRODUCT"
    | "DELIVERED_TO";
  confidence: number;
  evidence: string;
}

export interface DetectedConflict {
  id: string;
  topic: string;
  sourceA: {
    name: string;
    statement: string;
    date?: string;
    authority: AuthorityTier;
  };
  sourceB: {
    name: string;
    statement: string;
    date?: string;
    authority: AuthorityTier;
  };
  discrepancy: string;
  confidence: number;
  recommendedResolution: string;
  authoritativeValue?: string;
  status: "unresolved" | "auto_resolved" | "human_approved";
  resolvedBy?: string;
}

export interface DuplicatePair {
  id: string;
  entityNameA: string;
  entityNameB: string;
  confidence: number; // e.g. 0.96 for "IBM" vs "IBM Corp."
  sourceReference: string;
  status: "auto_merged" | "pending_human_review" | "kept_separate";
}

export interface KnowledgeChunk {
  id: string;
  sourceDocument: string;
  sectionOrHeading?: string;
  clauseNumber?: string;
  strategy: ChunkStrategy;
  text: string;
  estimatedTokens: number;
  authority: AuthorityTier;
  freshness: FreshnessState;
  sensitivity: SensitivityClassification;
  hasPii: boolean;
  associatedEntities: string[];
  metadata: Record<string, any>;
}

export interface RagSelfTestQuestion {
  id: string;
  question: string;
  targetTopic: string;
  expectedSource: string;
  retrievedSource: string;
  retrievedAnswer: string;
  relevanceScore: number;
  authorityMatch: boolean;
  passed: boolean;
  latencyMs: number;
}

export interface AutonomousRunResult {
  runId: string;
  timestamp: string;
  aiReadinessScore: number; // 0-100
  executionTimeMs: number;
  qualityReport: DataQualityReport;
  entities: ExtractedEntity[];
  relationships: DiscoveredRelationship[];
  conflicts: DetectedConflict[];
  duplicates: DuplicatePair[];
  chunks: KnowledgeChunk[];
  cleanedRows?: Record<string, string>[];
  selfTestResults: RagSelfTestQuestion[];
  rawSourcePreserved: boolean;
  auditTrailSummary: string;
}

export interface AgentContextRequest {
  agentId: string;
  agentRole: "support_agent" | "sales_agent" | "finance_agent" | "hr_agent" | "public_agent";
  query: string;
  customerId?: string;
}

export interface AgentContextResponse {
  agentId: string;
  agentRole: string;
  timestamp: string;
  authorized: boolean;
  deniedReasons?: string[];
  customerData?: Record<string, any>;
  relevantPolicies: Array<{
    topic: string;
    statement: string;
    authority: AuthorityTier;
    source: string;
    lastVerified?: string;
  }>;
  relevantChunks: Array<{
    id: string;
    text: string;
    source: string;
    relevanceScore: number;
    authority: AuthorityTier;
  }>;
  activeConflictWarnings?: Array<{
    topic: string;
    warning: string;
  }>;
  confidence: number;
  latencyMs: number;
}
