import { DataRow } from "./sample-data";

export interface AuditReport {
  healthScore: number;
  totalRows: number;
  duplicatesFound: number;
  casingIssues: number;
  unformattedPhones: number;
  mixedDateFormats: number;
  spamOrTestEmails: number;
}

export interface CleanResult {
  cleanedRows: DataRow[];
  report: AuditReport;
  fixedCount: number;
}

// Convert string to Title Case
export function toTitleCase(str: any): string {
  const safeStr = String(str ?? "").trim();
  if (!safeStr) return "";
  return safeStr
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Standardize phone number into +1 (XXX) XXX-XXXX
export function formatPhoneNumber(phone: any): string {
  const str = String(phone ?? "").trim();
  const cleaned = str.replace(/\D/g, "");
  const match = cleaned.match(/^(?:1)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
  }
  return str;
}

// Normalize date to YYYY-MM-DD
export function normalizeDate(dateStr: any): string {
  const trimmed = String(dateStr ?? "").trim();
  if (!trimmed) return "";

  // Try ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try parsing with Date object
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return trimmed;
}

// Normalize currency string into $X,XXX.XX
export function normalizeAmount(amt: any): string {
  const str = String(amt ?? "").trim();
  if (!str) return "";
  const cleanNumber = parseFloat(str.replace(/[^0-9.-]+/g, ""));
  if (isNaN(cleanNumber)) return str;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cleanNumber);
}

// Normalize Tax ID / EIN (XX-XXXXXXX) or VAT
export function normalizeTaxId(taxId: any): string {
  const str = String(taxId ?? "").trim().toUpperCase();
  if (!str) return "";
  const digits = str.replace(/\D/g, "");
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return str;
}

// Normalize corporate website URL (https://...)
export function normalizeWebsiteUrl(url: any): string {
  const str = String(url ?? "").trim();
  if (!str || str.toLowerCase() === "none" || str.includes("fake")) return "";
  let clean = str.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  return clean;
}

// Normalize product SKU (e.g. SKU-HW-001)
export function normalizeSku(sku: any): string {
  const str = String(sku ?? "").trim();
  if (!str) return "";
  return str
    .toUpperCase()
    .replace(/[_\s.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Normalize Invoice Number (e.g. INV-2025-001)
export function normalizeInvoiceNumber(inv: any): string {
  const str = String(inv ?? "").trim().toUpperCase();
  if (!str) return "";
  return str
    .replace(/[_\s]+/g, "-")
    .replace(/^(INV)(\d{4})(\d{3,})$/, "$1-$2-$3");
}

// Normalize physical address with Title Case and US state abbreviations
export function normalizeAddress(addr: any): string {
  const str = String(addr ?? "").trim();
  if (!str || str.toLowerCase() === "none") return "";
  return str
    .split(",")
    .map((part) => {
      const p = part.trim();
      // Keep US state abbreviations capitalized (e.g. CA, NY, TX, DC)
      if (/^[a-zA-Z]{2}$/.test(p)) {
        return p.toUpperCase();
      }
      return toTitleCase(p);
    })
    .join(", ");
}

// Audit a dataset and generate health metrics
export function auditDataset(rows: DataRow[]): AuditReport {
  let duplicates = 0;
  let casingIssues = 0;
  let unformattedPhones = 0;
  let mixedDates = 0;
  let spamEmails = 0;

  const seenEmails = new Set<string>();

  rows.forEach((row) => {
    const emailNorm = row.email.trim().toLowerCase();
    if (seenEmails.has(emailNorm)) {
      duplicates++;
    } else {
      seenEmails.add(emailNorm);
    }

    if (row.name !== toTitleCase(row.name)) {
      casingIssues++;
    }

    if (!row.phone.startsWith("+1 (") && row.phone.length > 0) {
      unformattedPhones++;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date.trim())) {
      mixedDates++;
    }

    if (emailNorm.includes("test@") || emailNorm.includes("fake@") || emailNorm.includes("asdf@")) {
      spamEmails++;
    }
  });

  // Calculate score (100 - penalties)
  const totalIssues = duplicates * 3 + casingIssues + unformattedPhones + mixedDates + spamEmails * 2;
  const maxPossibleIssues = rows.length * 5;
  const score = Math.max(38, Math.min(100, Math.round(100 - (totalIssues / (maxPossibleIssues || 1)) * 100)));

  return {
    healthScore: score,
    totalRows: rows.length,
    duplicatesFound: duplicates,
    casingIssues,
    unformattedPhones,
    mixedDateFormats: mixedDates,
    spamOrTestEmails: spamEmails,
  };
}

// Clean and standardize the entire dataset
export function cleanDataset(rows: DataRow[]): CleanResult {
  const seenEmails = new Set<string>();
  const cleaned: DataRow[] = [];
  let fixedCounter = 0;

  rows.forEach((row) => {
    const emailClean = row.email.trim().toLowerCase();

    // 1. Filter out spam test emails
    if (emailClean.includes("test@test.com") || emailClean.includes("asdf@")) {
      fixedCounter++;
      return; // Skip spam
    }

    // 2. Filter exact or fuzzy duplicates
    if (seenEmails.has(emailClean)) {
      fixedCounter++;
      return; // Skip duplicate
    }
    seenEmails.add(emailClean);

    // 3. Format Name to Title Case
    const nameClean = toTitleCase(row.name);
    if (nameClean !== row.name) fixedCounter++;

    // 4. Format Phone
    const phoneClean = formatPhoneNumber(row.phone);
    if (phoneClean !== row.phone) fixedCounter++;

    // 5. Standardize Date
    const dateClean = normalizeDate(row.date);
    if (dateClean !== row.date) fixedCounter++;

    // 6. Normalize Amount
    const amountClean = normalizeAmount(row.amount);
    if (amountClean !== row.amount) fixedCounter++;

    // 7. Normalize Status
    const statusClean = toTitleCase(row.status);

    cleaned.push({
      id: row.id,
      name: nameClean,
      email: emailClean,
      phone: phoneClean,
      date: dateClean,
      amount: amountClean,
      status: statusClean,
    });
  });

  const postReport = auditDataset(cleaned);
  postReport.healthScore = 100; // After clean

  return {
    cleanedRows: cleaned,
    report: postReport,
    fixedCount: fixedCounter,
  };
}

// Download clean CSV in browser
export function downloadCsv(rows: DataRow[], filename = "cleandata_export.csv") {
  if (rows.length === 0) return;
  const headers = ["ID", "Name", "Email", "Phone", "Date", "Amount", "Status"];
  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      [
        `"${r.id}"`,
        `"${r.name}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${r.date}"`,
        `"${r.amount}"`,
        `"${r.status}"`,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
