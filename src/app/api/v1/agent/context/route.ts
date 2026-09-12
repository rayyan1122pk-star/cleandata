// src/app/api/v1/agent/context/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateAgentContext, runAutonomousAiDataSpecialist } from "@/lib/ai-specialist";
import { BUSINESS_DOMAINS } from "@/lib/business-domains";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId = "default-agent", agentRole = "support_agent", query, customerId } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Missing query parameter." },
        { status: 400 }
      );
    }

    // Default domain knowledge base seed containing invoices and policies
    const invoiceDomain = BUSINESS_DOMAINS.find((d) => d.id === "invoices") || BUSINESS_DOMAINS[0];
    const initialKnowledge = runAutonomousAiDataSpecialist(
      invoiceDomain.sampleData,
      invoiceDomain.columns,
      "enterprise_knowledge_base.csv"
    );

    const contextResponse = generateAgentContext(
      { agentId, agentRole, query, customerId },
      initialKnowledge.chunks,
      initialKnowledge.entities,
      initialKnowledge.conflicts
    );

    return NextResponse.json({
      success: true,
      context: contextResponse,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate agent context." },
      { status: 500 }
    );
  }
}
