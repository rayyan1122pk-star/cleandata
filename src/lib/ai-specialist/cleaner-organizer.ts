// src/lib/ai-specialist/cleaner-organizer.ts
import {
  toTitleCase,
  formatPhoneNumber,
  normalizeDate,
  normalizeAmount,
  normalizeTaxId,
  normalizeWebsiteUrl,
  normalizeSku,
  normalizeInvoiceNumber,
  normalizeAddress,
} from "../cleaner";
import { ExtractedEntity, DiscoveredRelationship, DuplicatePair } from "./types";

export interface CleaningResult {
  cleanedRows: Record<string, string>[];
  fixedCount: number;
  entities: ExtractedEntity[];
  relationships: DiscoveredRelationship[];
  duplicates: DuplicatePair[];
}

function preserveCorporateAcronyms(text: string): string {
  return text
    .replace(/\bLlc\b/g, "LLC")
    .replace(/\bInc\b/g, "Inc.")
    .replace(/\bCorp\b/g, "Corp.")
    .replace(/\bEin\b/g, "EIN")
    .replace(/\bSla\b/g, "SLA")
    .replace(/\bCfo\b/g, "CFO")
    .replace(/\bCeo\b/g, "CEO")
    .replace(/\bCto\b/g, "CTO");
}

/**
 * Autonomously cleans and organizes business records into structured entities and relationships
 */
export function cleanAndOrganizeData(
  rows: Record<string, string>[],
  columns: string[],
  sourceName = "dataset"
): CleaningResult {
  const safeRows = rows || [];
  let fixedCount = 0;

  const seenIds = new Set<string>();
  const duplicates: DuplicatePair[] = [];
  const entityMap = new Map<string, ExtractedEntity>();
  const relationships: DiscoveredRelationship[] = [];

  const cleanedRows = safeRows
    .map((row) => {
      if (!row || typeof row !== "object") return null;

      const newRow: Record<string, string> = {};
      let rowIdentifier = "";

      Object.entries(row).forEach(([col, rawVal]) => {
        const strVal = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
        const lowerCol = col.toLowerCase();
        let cleaned = strVal.trim();

        if (strVal !== cleaned) fixedCount++;

        if (lowerCol.includes("phone") || lowerCol.includes("mobile") || lowerCol.includes("tel")) {
          const norm = formatPhoneNumber(cleaned);
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
        } else if (lowerCol.includes("email") || lowerCol.includes("mail")) {
          const norm = cleaned.toLowerCase();
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
          if (!rowIdentifier && cleaned) rowIdentifier = `email:${cleaned}`;
        } else if (lowerCol.includes("tax") || lowerCol.includes("ein")) {
          const norm = normalizeTaxId(cleaned);
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
          if (!rowIdentifier && cleaned) rowIdentifier = `tax:${cleaned}`;
        } else if (lowerCol.includes("invoice") || lowerCol.includes("invnum") || lowerCol.includes("billno")) {
          const norm = normalizeInvoiceNumber(cleaned);
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
          if (!rowIdentifier && cleaned) rowIdentifier = `inv:${cleaned}`;
        } else if (lowerCol.includes("date") || lowerCol.includes("due") || lowerCol.includes("created")) {
          const norm = normalizeDate(cleaned);
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
        } else if (lowerCol.includes("amount") || lowerCol.includes("price") || lowerCol.includes("cost") || lowerCol.includes("fee") || lowerCol.includes("salary")) {
          const norm = normalizeAmount(cleaned);
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
        } else if (lowerCol.includes("website") || lowerCol.includes("url") || lowerCol.includes("domain")) {
          const norm = normalizeWebsiteUrl(cleaned);
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
        } else if (lowerCol.includes("sku") || lowerCol.includes("itemcode")) {
          const norm = normalizeSku(cleaned);
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
        } else if (lowerCol.includes("address") || lowerCol.includes("street")) {
          const norm = normalizeAddress(cleaned);
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
        } else if (
          (lowerCol.includes("name") || lowerCol.includes("company") || lowerCol.includes("department") || lowerCol.includes("city")) &&
          !lowerCol.includes("email") &&
          !lowerCol.includes("id")
        ) {
          const norm = preserveCorporateAcronyms(toTitleCase(cleaned));
          if (norm !== cleaned) fixedCount++;
          cleaned = norm;
        }

        newRow[col] = cleaned;
      });

      // Duplicate detection on primary identifier
      if (rowIdentifier) {
        if (seenIds.has(rowIdentifier)) {
          duplicates.push({
            id: `dup_${rowIdentifier.replace(/[^a-zA-Z0-9]/g, "_")}`,
            entityNameA: newRow.Entity_Name || newRow.Name || newRow.Full_Name || "Record A",
            entityNameB: newRow.Company_Name || newRow.Company || "Record B",
            confidence: 0.98,
            sourceReference: sourceName,
            status: "auto_merged",
          });
          return null; // Merge duplicate
        }
        seenIds.add(rowIdentifier);
      }

      // Entity extraction from cleaned row
      const personName = newRow.Entity_Name || newRow.Full_Name || newRow.Name || newRow.Client_Name || newRow.Student_Name;
      const compName = newRow.Company_Name || newRow.Company || newRow.Vendor_Name;
      const emailVal = newRow.Email || newRow.Email_Address || newRow.Work_Email;
      const taxVal = newRow.Tax_ID || newRow.Tax_Id || newRow.EIN;
      const invoiceVal = newRow.Reference_ID || newRow.Invoice_ID || newRow.Invoice;
      const amountVal = newRow.Amount || newRow.Total || newRow.Total_Amount;

      if (personName && personName.length >= 3 && !personName.toLowerCase().startsWith("contact")) {
        const pKey = `person_${personName.toLowerCase()}`;
        if (!entityMap.has(pKey)) {
          entityMap.set(pKey, {
            id: pKey,
            entityType: "person",
            canonicalName: personName,
            aliases: [personName],
            primaryIdentifier: emailVal || undefined,
            attributes: {
              email: emailVal || "",
              phone: newRow.Phone || newRow.Phone_Number || "",
              role: newRow.Category_Role || newRow.Role || newRow.Department || "General",
            },
            confidence: 0.95,
            sourceProvenances: [sourceName],
          });
        }
      }

      if (compName && compName.length >= 3 && compName !== "N/A" && compName !== "Corporate Entity") {
        const cKey = `company_${compName.toLowerCase()}`;
        if (!entityMap.has(cKey)) {
          // Detect corporate alias (e.g. "Apex Solutions" vs "Apex Solutions LLC")
          const baseName = compName.replace(/\s+(?:LLC|Inc\.?|Corp\.?|Corporation|Ltd\.?)\b/i, "").trim();
          entityMap.set(cKey, {
            id: cKey,
            entityType: "company",
            canonicalName: compName,
            aliases: baseName !== compName ? [compName, baseName] : [compName],
            primaryIdentifier: taxVal || undefined,
            attributes: {
              taxId: taxVal || "",
              address: newRow.Address || "",
              website: newRow.Website || "",
            },
            confidence: 0.96,
            sourceProvenances: [sourceName],
          });
        }

        // Relationship: Person -> Company (EMPLOYED_BY or ASSOCIATED_WITH)
        if (personName && personName.length >= 3 && !personName.toLowerCase().startsWith("contact")) {
          const pKey = `person_${personName.toLowerCase()}`;
          relationships.push({
            id: `rel_${pKey}_${cKey}`,
            sourceEntityId: pKey,
            targetEntityId: cKey,
            sourceName: personName,
            targetName: compName,
            relationshipType: "EMPLOYED_BY",
            confidence: 0.94,
            evidence: `${personName} is affiliated with ${compName} in ${sourceName}`,
          });
        }

        // Relationship: Company -> Invoice (ISSUED_INVOICE)
        if (invoiceVal) {
          const invKey = `inv_${invoiceVal.toLowerCase()}`;
          relationships.push({
            id: `rel_${cKey}_${invKey}`,
            sourceEntityId: cKey,
            targetEntityId: invKey,
            sourceName: compName,
            targetName: invoiceVal,
            relationshipType: "ISSUED_INVOICE",
            confidence: 0.98,
            evidence: `${compName} billed ${amountVal || "services"} under ${invoiceVal}`,
          });
        }
      }

      return newRow;
    })
    .filter(Boolean) as Record<string, string>[];

  return {
    cleanedRows,
    fixedCount,
    entities: Array.from(entityMap.values()),
    relationships,
    duplicates,
  };
}
