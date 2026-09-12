// src/lib/ai-specialist/agent-manager.ts
import {
  AgentContextRequest,
  AgentContextResponse,
  AuthorityTier,
  DetectedConflict,
  ExtractedEntity,
  KnowledgeChunk,
} from "./types";

export function generateAgentContext(
  request: AgentContextRequest,
  chunks: KnowledgeChunk[],
  entities: ExtractedEntity[],
  conflicts: DetectedConflict[]
): AgentContextResponse {
  const startTime = Date.now();
  const { agentId, agentRole, query, customerId } = request;

  // 1. Role-Based Knowledge Access Boundaries
  const rolePermissions: Record<string, { allowedKeywords: string[]; disallowedKeywords: string[]; maxSensitivity: string }> = {
    support_agent: {
      allowedKeywords: ["support", "policy", "refund", "ticket", "faq", "customer", "order", "invoice", "product", "sla"],
      disallowedKeywords: ["payroll", "salary", "hr_internal", "secret_key", "password", "audit_restricted"],
      maxSensitivity: "internal",
    },
    sales_agent: {
      allowedKeywords: ["product", "pricing", "feature", "tier", "plan", "discount", "enterprise", "spec"],
      disallowedKeywords: ["payroll", "salary", "ssn", "tax_restricted", "incident_confidential"],
      maxSensitivity: "internal",
    },
    finance_agent: {
      allowedKeywords: ["invoice", "tax", "ein", "billing", "payment", "revenue", "budget", "cost", "fee"],
      disallowedKeywords: ["hr_restricted", "medical"],
      maxSensitivity: "confidential",
    },
    hr_agent: {
      allowedKeywords: ["employee", "department", "hiring", "onboarding", "benefits", "policy"],
      disallowedKeywords: ["api_secret", "customer_credit_card"],
      maxSensitivity: "confidential",
    },
    public_agent: {
      allowedKeywords: ["public", "faq", "overview", "product", "features", "documentation"],
      disallowedKeywords: ["invoice", "tax", "ein", "phone", "email", "internal", "confidential"],
      maxSensitivity: "public",
    },
  };

  const perms = rolePermissions[agentRole] || rolePermissions.support_agent;

  // Check query for disallowed sensitive queries
  const qLower = query.toLowerCase();
  const deniedViolation = perms.disallowedKeywords.find((bad) => qLower.includes(bad));
  if (deniedViolation) {
    return {
      agentId,
      agentRole,
      timestamp: new Date().toISOString(),
      authorized: false,
      deniedReasons: [`Access denied: ${agentRole} is not authorized to query "${deniedViolation}" restricted domain.`],
      relevantPolicies: [],
      relevantChunks: [],
      confidence: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  // 2. Fetch Customer Profile if customerId is provided
  let customerData: Record<string, any> | undefined = undefined;
  if (customerId) {
    const matchedEntity = entities.find(
      (e) =>
        e.id.toLowerCase().includes(customerId.toLowerCase()) ||
        e.canonicalName.toLowerCase().includes(customerId.toLowerCase()) ||
        e.primaryIdentifier?.toLowerCase().includes(customerId.toLowerCase())
    );

    if (matchedEntity) {
      customerData = {
        entityId: matchedEntity.id,
        name: matchedEntity.canonicalName,
        type: matchedEntity.entityType,
        primaryIdentifier: matchedEntity.primaryIdentifier,
        attributes: matchedEntity.attributes,
      };
    }
  }

  // 3. Authoritative Policy Matching
  const relevantPolicies: Array<{
    topic: string;
    statement: string;
    authority: AuthorityTier;
    source: string;
    lastVerified?: string;
  }> = [];

  if (qLower.includes("refund") || qLower.includes("return") || qLower.includes("cancel")) {
    relevantPolicies.push({
      topic: "Refund Policy",
      statement: "Enterprise clients are entitled to full refunds within 30 days of invoice date upon formal written notification.",
      authority: "Official policy",
      source: "Master Services Agreement 2026.pdf",
      lastVerified: "2026-02-15",
    });
  }

  if (qLower.includes("sla") || qLower.includes("support") || qLower.includes("hours")) {
    relevantPolicies.push({
      topic: "Technical Support SLA",
      statement: "Priority 1 critical incident support is guaranteed 24/7/365 with a 1-hour initial response SLA.",
      authority: "Official policy",
      source: "Enterprise SLA Schedule B.pdf",
      lastVerified: "2026-02-01",
    });
  }

  // 4. Chunk Retrieval filtered by agent permissions
  const queryTokens = qLower.split(/\s+/).filter((t) => t.length > 3);
  const relevantChunks: Array<{
    id: string;
    text: string;
    source: string;
    relevanceScore: number;
    authority: AuthorityTier;
  }> = [];

  chunks.forEach((chunk) => {
    // Filter out restricted chunks for public agents
    if (perms.maxSensitivity === "public" && chunk.sensitivity !== "public") return;

    const chunkText = chunk.text.toLowerCase();
    let matches = 0;
    queryTokens.forEach((tok) => {
      if (chunkText.includes(tok)) matches++;
    });

    if (matches > 0) {
      const score = Math.min(0.98, Math.round((matches / (queryTokens.length + 1) + 0.4) * 100) / 100);
      relevantChunks.push({
        id: chunk.id,
        text: chunk.text,
        source: chunk.sourceDocument,
        relevanceScore: score,
        authority: chunk.authority,
      });
    }
  });

  // Sort by relevance
  relevantChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topChunks = relevantChunks.slice(0, 4);

  // 5. Active Conflict Warnings
  const activeConflictWarnings: Array<{ topic: string; warning: string }> = [];
  conflicts
    .filter((c) => c.status === "unresolved")
    .forEach((c) => {
      if (qLower.includes("refund") && c.topic.toLowerCase().includes("refund")) {
        activeConflictWarnings.push({
          topic: c.topic,
          warning: `Contradiction detected across sources (${c.discrepancy}). Official recommended value is "${c.authoritativeValue}".`,
        });
      }
    });

  const latencyMs = Math.max(12, Date.now() - startTime);

  return {
    agentId,
    agentRole,
    timestamp: new Date().toISOString(),
    authorized: true,
    customerData,
    relevantPolicies,
    relevantChunks: topChunks,
    activeConflictWarnings: activeConflictWarnings.length > 0 ? activeConflictWarnings : undefined,
    confidence: activeConflictWarnings.length > 0 ? 0.88 : 0.96,
    latencyMs,
  };
}
