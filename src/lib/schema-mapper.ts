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
} from "./cleaner";

export type SemanticFieldType =
  | "name"
  | "email"
  | "phone"
  | "date"
  | "amount"
  | "status"
  | "id"
  | "address"
  | "company"
  | "tax_id"
  | "website"
  | "sku"
  | "invoice_id"
  | "department"
  | "text";

export interface ColumnMapping {
  originalCol: string;
  detectedType: SemanticFieldType;
  confidence: number;
  sampleValue: string;
  targetCol: string;
}

export interface TargetSchemaPreset {
  id: string;
  name: string;
  description: string;
  requiredFields: SemanticFieldType[];
}

export const SCHEMA_PRESETS: TargetSchemaPreset[] = [
  {
    id: "companies",
    name: "Enterprise Companies Master",
    description: "Corporate legal entity profiles, Tax IDs/EIN, industries, and addresses.",
    requiredFields: ["company", "tax_id", "website", "address", "amount"],
  },
  {
    id: "invoices",
    name: "Accounts Payable & Invoices",
    description: "Vendor bills, payment terms, due dates, subtotal, and tax ledger.",
    requiredFields: ["invoice_id", "company", "date", "amount", "status"],
  },
  {
    id: "inventory",
    name: "Products & Inventory Catalog",
    description: "SKU tracking, unit costs, retail prices, and stock reorder alerts.",
    requiredFields: ["sku", "id", "amount", "company"],
  },
  {
    id: "employees",
    name: "HR Roster & Payroll",
    description: "Personnel directory, departments, salary bands, and hire dates.",
    requiredFields: ["id", "name", "department", "email", "amount"],
  },
  {
    id: "leads",
    name: "Customer Leads & CRM",
    description: "Standardized schema for HubSpot, Salesforce, and email marketing tools.",
    requiredFields: ["name", "email", "phone", "date", "status"],
  },
  {
    id: "universal",
    name: "Universal Standard",
    description: "Preserves all columns while standardizing names, formats, dates, and numbers.",
    requiredFields: [],
  },
];

/**
 * Automatically inspects a column name and sample values to detect its semantic type
 */
export function detectColumnSemanticType(
  columnName: string,
  sampleValues: string[]
): { type: SemanticFieldType; confidence: number } {
  const col = columnName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const samples = sampleValues.filter(Boolean);

  // 1. Tax ID / EIN check
  if (col.includes("tax") || col.includes("ein") || col.includes("vat")) {
    return { type: "tax_id", confidence: 0.95 };
  }
  if (samples.some((s) => /^\d{2}-\d{7}$/.test(s.trim()))) {
    return { type: "tax_id", confidence: 0.9 };
  }

  // 2. Website URL check
  if (col.includes("website") || col.includes("url") || col.includes("domain") || col.includes("web")) {
    return { type: "website", confidence: 0.95 };
  }
  if (samples.some((s) => s.includes("http://") || s.includes("https://") || s.endsWith(".io") || s.endsWith(".com") || s.endsWith(".org") || s.endsWith(".net"))) {
    return { type: "website", confidence: 0.9 };
  }

  // 3. Invoice ID check
  if (col.includes("invoice") || col.includes("invnum") || col.includes("billno")) {
    return { type: "invoice_id", confidence: 0.95 };
  }

  // 4. SKU / Product Code check
  if (col.includes("sku") || col.includes("itemcode") || col.includes("productcode")) {
    return { type: "sku", confidence: 0.95 };
  }

  // 5. Department check
  if (col.includes("dept") || col.includes("department") || col.includes("division") || col.includes("sector")) {
    return { type: "department", confidence: 0.95 };
  }

  // 6. Company / Vendor / Supplier check
  if (col.includes("company") || col.includes("vendor") || col.includes("supplier") || col.includes("legalentity") || col.includes("corp") || col.includes("organization")) {
    return { type: "company", confidence: 0.95 };
  }

  // 7. Email check
  if (col.includes("email") || col.includes("mail")) {
    return { type: "email", confidence: 0.95 };
  }
  if (samples.some((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()))) {
    return { type: "email", confidence: 0.9 };
  }

  // 8. Phone check
  if (col.includes("phone") || col.includes("mobile") || col.includes("cell") || col.includes("tel") || col.includes("fax")) {
    return { type: "phone", confidence: 0.95 };
  }
  if (samples.some((s) => s.replace(/\D/g, "").length >= 7 && s.replace(/\D/g, "").length <= 15 && /\d/.test(s))) {
    return { type: "phone", confidence: 0.85 };
  }

  // 9. Amount / Currency / Salary / Price / Fee check
  if (
    col.includes("amount") ||
    col.includes("price") ||
    col.includes("cost") ||
    col.includes("revenue") ||
    col.includes("total") ||
    col.includes("fee") ||
    col.includes("salary") ||
    col.includes("budget")
  ) {
    return { type: "amount", confidence: 0.95 };
  }
  if (samples.some((s) => /^\$?\s?\d+(?:,\d{3})*(?:\.\d{2})?$/.test(s.trim()))) {
    return { type: "amount", confidence: 0.85 };
  }

  // 10. Date check
  if (col.includes("date") || col.includes("time") || col.includes("created") || col.includes("updated") || col.includes("dob") || col.includes("day") || col.includes("due")) {
    return { type: "date", confidence: 0.95 };
  }
  if (samples.some((s) => !isNaN(Date.parse(s)) && (s.includes("-") || s.includes("/") || s.includes(".")))) {
    return { type: "date", confidence: 0.8 };
  }

  // 11. Name check
  if (col.includes("name") || col.includes("client") || col.includes("customer") || col.includes("lead") || col.includes("user") || col.includes("person") || col.includes("contact")) {
    return { type: "name", confidence: 0.9 };
  }

  // 12. Address check
  if (col.includes("address") || col.includes("city") || col.includes("state") || col.includes("country") || col.includes("zip") || col.includes("street") || col.includes("location")) {
    return { type: "address", confidence: 0.9 };
  }

  // 13. Status check
  if (col.includes("status") || col.includes("state") || col.includes("stage") || col.includes("condition")) {
    return { type: "status", confidence: 0.9 };
  }

  // 14. ID check
  if (col.includes("id") || col.includes("uuid") || col.includes("code") || col.includes("num") || col.includes("index")) {
    return { type: "id", confidence: 0.85 };
  }

  return { type: "text", confidence: 0.6 };
}

/**
 * Generates initial AI column mappings for any dataset
 */
export function generateColumnMappings(
  columns: string[],
  rows: Record<string, string>[]
): ColumnMapping[] {
  const safeRows = rows || [];
  return (columns || []).map((col) => {
    const samples = safeRows.slice(0, 5).map((r) => (r ? String(r[col] ?? "") : ""));
    const { type, confidence } = detectColumnSemanticType(col, samples);

    // Provide clean suggested target column name
    let targetCol = col;
    const lowerCol = String(col || "").toLowerCase();

    if (type === "tax_id") {
      targetCol = "Tax_ID";
    } else if (type === "website") {
      targetCol = "Website";
    } else if (type === "sku") {
      targetCol = "SKU";
    } else if (type === "invoice_id") {
      targetCol = "Invoice_ID";
    } else if (type === "department") {
      targetCol = "Department";
    } else if (type === "company") {
      targetCol = lowerCol.includes("vendor") ? "Vendor_Name" : "Company_Name";
    } else if (type === "name" && !lowerCol.includes("first") && !lowerCol.includes("last")) {
      targetCol = lowerCol.includes("parent") ? "Parent_Name" : lowerCol.includes("student") ? "Student_Name" : "Full_Name";
    } else if (type === "email") {
      targetCol = lowerCol.includes("work") ? "Work_Email" : lowerCol.includes("parent") ? "Parent_Email" : "Email_Address";
    } else if (type === "phone") {
      targetCol = "Phone_Number";
    } else if (type === "date") {
      targetCol = lowerCol.includes("due") ? "Due_Date" : lowerCol.includes("hire") ? "Hire_Date" : "Date";
    } else if (type === "amount") {
      targetCol = lowerCol.includes("salary") ? "Salary" : lowerCol.includes("fee") ? "Tuition_Fee" : lowerCol.includes("cost") ? "Unit_Cost" : "Amount";
    } else if (type === "address") {
      targetCol = "HQ_Address";
    } else if (type === "status") {
      targetCol = "Status";
    } else {
      targetCol = toTitleCase(col).replace(/\s+/g, "_");
    }

    return {
      originalCol: col,
      detectedType: type,
      confidence,
      sampleValue: samples[0] || "(empty)",
      targetCol,
    };
  });
}

/**
 * Re-arranges and normalizes rows into the canonical target schema
 */
export function applySchemaMappings(
  rows: Record<string, string>[],
  mappings: ColumnMapping[]
): { arrangedRows: Record<string, string>[]; targetColumns: string[] } {
  const targetColumns = (mappings || []).map((m) => m.targetCol);

  const arrangedRows = (rows || []).map((row) => {
    const newRow: Record<string, string> = {};

    (mappings || []).forEach((m) => {
      let val = row ? String(row[m.originalCol] ?? "").trim() : "";

      switch (m.detectedType) {
        case "tax_id":
          val = normalizeTaxId(val);
          break;
        case "website":
          val = normalizeWebsiteUrl(val);
          break;
        case "sku":
          val = normalizeSku(val);
          break;
        case "invoice_id":
          val = normalizeInvoiceNumber(val);
          break;
        case "company":
          val = toTitleCase(val);
          break;
        case "department":
          val = toTitleCase(val);
          break;
        case "address":
          val = normalizeAddress(val);
          break;
        case "name":
          val = toTitleCase(val);
          break;
        case "email":
          val = val.toLowerCase();
          break;
        case "phone":
          val = formatPhoneNumber(val);
          break;
        case "date":
          val = normalizeDate(val);
          break;
        case "amount":
          val = normalizeAmount(val);
          break;
        case "status":
          val = toTitleCase(val);
          break;
        default:
          val = val.replace(/\s+/g, " ");
      }

      newRow[m.targetCol] = val;
    });

    return newRow;
  });

  return { arrangedRows, targetColumns };
}
