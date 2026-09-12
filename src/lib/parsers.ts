import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedDataset {
  rows: Record<string, string>[];
  columns: string[];
  sourceType: "csv" | "tsv" | "excel" | "json" | "markdown" | "unstructured";
  sheetNames?: string[];
  totalRecords: number;
}

/**
 * Checks if raw text is genuinely a delimited CSV vs natural language prose with commas
 */
function isLikelyCsv(text: string): boolean {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return false;

  const firstLine = lines[0];
  const fields = firstLine.split(/[,;]/).map((f) => f.trim().replace(/^["']|["']$/g, ""));
  if (fields.length < 2) return false;

  const avgLen = fields.reduce((sum, f) => sum + f.length, 0) / fields.length;
  if (avgLen > 35) return false;

  // If any header has sentence punctuation or is very long, it's narrative text
  if (fields.some((f) => f.length > 45 || /[.?!]/.test(f))) return false;

  // Prose indicator words
  const proseWords = /\b(during|whereas|located\s+at|meanwhile|confirmed|enrolled|living\s+at|residing|contact\s+is|due\s+on|authorized|settled)\b/i;
  if (fields.some((f) => proseWords.test(f))) return false;

  const firstCommaCount = (firstLine.match(/[,;]/g) || []).length;
  const secondCommaCount = (lines[1].match(/[,;]/g) || []).length;
  if (Math.abs(firstCommaCount - secondCommaCount) > 3) return false;

  return true;
}

/**
 * Parses raw text from clipboard, detecting format (JSON, TSV, CSV, Markdown, or Natural Paragraphs)
 */
export function parseClipboardText(raw: string): ParsedDataset {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { rows: [], columns: [], sourceType: "tsv", totalRecords: 0 };
  }

  // 1. Try JSON Array
  if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
    try {
      const parsed = JSON.parse(trimmed);
      const array = Array.isArray(parsed) ? parsed : [parsed];
      if (array.length > 0 && typeof array[0] === "object") {
        const columns = Array.from(
          new Set(array.flatMap((item) => Object.keys(item || {})))
        );
        const rows = array.map((item) => {
          const row: Record<string, string> = {};
          columns.forEach((col) => {
            row[col] = item[col] !== undefined && item[col] !== null ? String(item[col]) : "";
          });
          return row;
        });
        return { rows, columns, sourceType: "json", totalRecords: rows.length };
      }
    } catch {
      // Continue to next format
    }
  }

  // 2. Try Markdown Table (| Name | Email |)
  if (trimmed.includes("|") && trimmed.split("\n").some((l) => l.trim().startsWith("|"))) {
    const lines = trimmed.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|") && l.endsWith("|"));
    if (lines.length >= 2) {
      const headerLine = lines[0];
      const headers = headerLine
        .slice(1, -1)
        .split("|")
        .map((h) => h.trim())
        .filter(Boolean);

      const dataLines = lines.slice(1).filter((l) => !l.includes("---"));
      const rows = dataLines.map((line) => {
        const cells = line.slice(1, -1).split("|").map((c) => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = cells[idx] || "";
        });
        return row;
      });

      if (headers.length > 0 && rows.length > 0) {
        return { rows, columns: headers, sourceType: "markdown", totalRecords: rows.length };
      }
    }
  }

  // 3. Try TSV (standard Tab-Separated from Excel / Google Sheets copy-paste)
  if (trimmed.includes("\t")) {
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length > 0) {
      const headers = lines[0].split("\t").map((h, i) => h.trim() || `Column_${i + 1}`);
      const rows = lines.slice(1).map((line) => {
        const cells = line.split("\t");
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = (cells[i] || "").trim();
        });
        return row;
      });
      return { rows, columns: headers, sourceType: "tsv", totalRecords: rows.length };
    }
  }

  // 4. Try CSV / Delimited via PapaParse ONLY IF it passes genuine CSV heuristic
  if (isLikelyCsv(trimmed)) {
    const papaResult = Papa.parse(trimmed, { header: true, skipEmptyLines: true });
    if (papaResult.data && papaResult.data.length > 0) {
      const rows = (papaResult.data as Record<string, string>[]).filter(
        (r) => r && typeof r === "object" && Object.keys(r).length > 0
      );
      if (rows.length > 0) {
        const columns = papaResult.meta.fields || Object.keys(rows[0] || {});
        return { rows, columns, sourceType: "csv", totalRecords: rows.length };
      }
    }
  }

  // 5. Natural Language Paragraphs & Freeform Text Ingestion
  return parseUnstructuredText(trimmed);
}

/**
 * Parses native Excel (.xlsx, .xls) buffer into tabular rows
 */
export function parseExcelBuffer(buffer: ArrayBuffer): ParsedDataset {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error("No sheets found in Excel file.");
  }

  const firstSheetName = sheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (rawRows.length === 0) {
    return { rows: [], columns: [], sourceType: "excel", sheetNames, totalRecords: 0 };
  }

  const columns = Array.from(new Set(rawRows.flatMap((r) => Object.keys(r))));
  const rows: Record<string, string>[] = rawRows.map((r) => {
    const rowObj: Record<string, string> = {};
    columns.forEach((col) => {
      rowObj[col] = r[col] !== undefined && r[col] !== null ? String(r[col]).trim() : "";
    });
    return rowObj;
  });

  return {
    rows,
    columns,
    sourceType: "excel",
    sheetNames,
    totalRecords: rows.length,
  };
}

/**
 * Intelligent Entity & Multi-Record Extraction from continuous freeform paragraphs, emails, and notes.
 * Accurately segments continuous prose into distinct structured records.
 */
export function parseUnstructuredText(text: string): ParsedDataset {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return { rows: [], columns: [], sourceType: "unstructured", totalRecords: 0 };
  }

  // Sentence splitting that protects abbreviations, acronyms, and titles
  const rawSegments = trimmed
    .split(/(?:\r?\n)+|(?<!\b(?:Dr|Mr|Mrs|Ms|Prof|Inc|Corp|Ltd|Co|vs|e\.g|i\.e|EIN|ID|Tax|No|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\.\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter(Boolean);

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const phoneRegex = /((?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)/;
  const taxIdRegex = /(?:EIN|Tax\s*ID|TIN|Tax\s*#)?[:\s]*\b(\d{2}-\d{7})\b/i;
  const refIdRegex = /\b(INV[-_#]?[0-9][0-9a-zA-Z-]*|STD[-_#]?[0-9][0-9a-zA-Z-]*|EMP[-_#]?[0-9][0-9a-zA-Z-]*|PO[-_#]?[0-9][0-9a-zA-Z-]*|ORD[-_#]?[0-9][0-9a-zA-Z-]*|BILL[-_#]?[0-9][0-9a-zA-Z-]*)\b|(?<!Tax\s*)\b(?:ID|Ref)[:\s]+([A-Z0-9-]+)/i;
  const amountRegex = /(\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\b\d{2,6}\.\d{2}\b)/;
  const dateRegex = /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\b/i;
  const companyRegex = /\b([A-Z][A-Za-z0-9'&]+(?:\s+[A-Z][A-Za-z0-9'&]+){0,3}\s+(?:(?:Logistics|Solutions|Technologies|Tech|Labs|Systems|Retail|Ventures|Partners|Group)\s+)?(?:Inc\.?|LLC|Corp\.?|Corporation|Ltd\.?|Group|Solutions|Technologies|Tech|Labs|Holdings|Retail|Logistics|Systems|Ventures|Partners|Academy|High\s*School|College|University))\b/i;
  const addressRegex = /\b(\d{1,5}\s+[A-Z][a-zA-Z0-9\s.]{2,25}?\s+(?:Street|St\.?|Avenue|Ave\.?|Boulevard|Blvd\.?|Road|Rd\.?|Drive|Lane|Ln\.?|Terrace|Way|Highway|Hwy|Court|Ct\.?)(?:,\s*[A-Z][a-zA-Z]+(?:\s+[A-Z]{2}\b|\s+[A-Z][a-zA-Z]+)?)?)\b/i;
  const roleRegex = /\b(Grade\s+\d{1,2}|Section\s+[A-Z]|CFO|CEO|CTO|VP|Director|Manager|Executive|Lead|Student|Teacher|Parent|Guardian|Doctor|Dr\.|Nurse|Engineer|Accountant)\b/i;

  const namePatterns = [
    /(?:student|client|customer|patient|employee|contact|via|handled by|approved by|attending)\s+(?:(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /\b([A-Z][a-z]+\s+[A-Z][a-z]+)(?=\s+(?:from|at|with|sent|enrolled|placed|joined|authorized|living|residing)\b)/,
    /\b([A-Z][a-z]+\s+[A-Z][a-z]+)(?=\s*\((?:ID|Grade|STD|CFO|CEO))/i,
  ];

  const getRef = (str: string): string => {
    const m = str.match(refIdRegex);
    if (!m) return "";
    return (m[1] || m[2] || "").trim().toUpperCase();
  };

  const cleanComp = (raw: string): string => {
    if (!raw) return "";
    const afterPrep = raw.replace(/^.*?\b(?:from|at|by|vendor|client|bill\s+from)\s+/i, "");
    return afterPrep.replace(/^(?:from|at|by|in)\s+/i, "").trim();
  };

  // Group raw segments into distinct entity clusters
  const clusters: string[] = [];
  let currentCluster: string[] = [];

  const startsNewEntity = (seg: string, existingCluster: string[]): boolean => {
    if (existingCluster.length === 0) return false;
    const combined = existingCluster.join(" ");

    // Explicit transition starters
    if (/^(Meanwhile|Later|Also|Finally|Next|Additionally|On\s+(?:20\d\d|\d{1,2}[-/])|In\s+school|Vendor\s|Student\s|Client\s|Customer\s)/i.test(seg)) {
      return true;
    }

    // New distinct Reference ID (e.g. STD-01 vs STD-02, INV-01 vs INV-02)
    const segRef = getRef(seg);
    const existingRef = getRef(combined);
    if (segRef && existingRef && segRef !== existingRef) {
      return true;
    }

    // New distinct Email
    const segEmail = seg.match(emailRegex);
    const existingEmail = combined.match(emailRegex);
    if (segEmail && existingEmail && segEmail[1].toLowerCase() !== existingEmail[1].toLowerCase()) {
      return true;
    }

    // New distinct Tax ID
    const segTax = seg.match(taxIdRegex);
    const existingTax = combined.match(taxIdRegex);
    if (segTax && existingTax && segTax[1] !== existingTax[1]) {
      return true;
    }

    return false;
  };

  for (const seg of rawSegments) {
    if (startsNewEntity(seg, currentCluster)) {
      clusters.push(currentCluster.join(" "));
      currentCluster = [seg];
    } else {
      currentCluster.push(seg);
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster.join(" "));
  }

  // Parse each cluster into a structured record
  const rows: Record<string, string>[] = clusters.map((chunk, index) => {
    let email = "";
    let phone = "";
    let taxId = "";
    let refId = "";
    let amount = "";
    let date = "";
    let company = "";
    let address = "";
    let role = "";
    let name = "";

    const emailMatch = chunk.match(emailRegex);
    if (emailMatch) email = emailMatch[1];

    const phoneMatch = chunk.match(phoneRegex);
    if (phoneMatch) phone = phoneMatch[1];

    const taxMatch = chunk.match(taxIdRegex);
    if (taxMatch) taxId = taxMatch[1];

    refId = getRef(chunk);

    const amtMatch = chunk.match(amountRegex);
    if (amtMatch) {
      const val = amtMatch[1];
      amount = val.startsWith("$") ? val : `$${val}`;
    }

    const dateMatch = chunk.match(dateRegex);
    if (dateMatch) date = dateMatch[1];

    const compMatch = chunk.match(companyRegex);
    if (compMatch) {
      company = cleanComp(compMatch[1]);
    }

    const addrMatch = chunk.match(addressRegex);
    if (addrMatch) address = addrMatch[1].trim();

    const roleMatch = chunk.match(roleRegex);
    if (roleMatch) role = roleMatch[1].trim();

    // Extract person / student name
    for (const pattern of namePatterns) {
      const match = chunk.match(pattern);
      if (match && match[1]) {
        name = match[1].replace(/\b(?:phone|email|tel|mobile|fax|tax|id)\b/i, "").trim();
        break;
      }
    }

    // Fallback name extraction
    if (!name) {
      const stripped = chunk
        .replace(email, "")
        .replace(phone, "")
        .replace(taxId, "")
        .replace(refId, "")
        .replace(amount, "")
        .replace(date, "")
        .replace(company, "")
        .replace(address, "")
        .replace(/[^a-zA-Z\s]/g, " ");
      const words = stripped
        .split(/\s+/)
        .filter(
          (w) =>
            /^[A-Z][a-z]{2,}$/.test(w) &&
            !["The", "And", "For", "With", "From", "Invoice", "Vendor", "Logistics", "Solutions", "Corporate"].includes(w)
        );
      if (words.length >= 2) {
        name = `${words[0]} ${words[1]}`;
      }
    }

    if (name && role && name.toLowerCase().startsWith(role.toLowerCase())) {
      name = name.slice(role.length).trim();
    }

    return {
      Record_ID: `REC-${String(index + 1).padStart(3, "0")}`,
      Entity_Name: name || `Contact ${index + 1}`,
      Company_Name: company || "Corporate Entity",
      Email: email || "",
      Phone: phone || "",
      Reference_ID: refId || "",
      Tax_ID: taxId || "",
      Date: date || "",
      Amount: amount || "",
      Address: address || "",
      Category_Role: role || "General",
      Notes_Summary: chunk.length > 90 ? `${chunk.slice(0, 90)}...` : chunk,
    };
  });

  const columns = [
    "Record_ID",
    "Entity_Name",
    "Company_Name",
    "Email",
    "Phone",
    "Reference_ID",
    "Tax_ID",
    "Date",
    "Amount",
    "Address",
    "Category_Role",
    "Notes_Summary",
  ];

  return {
    rows,
    columns,
    sourceType: "unstructured",
    totalRecords: rows.length,
  };
}
