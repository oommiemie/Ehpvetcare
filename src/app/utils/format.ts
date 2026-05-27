/**
 * Format utilities — Postel's Law: accept liberally, send conservatively.
 */

/**
 * Normalize Thai phone numbers to `XXX-XXX-XXXX` format.
 * Accepts: `0812345678`, `081-234-5678`, `081 234 5678`, `+66812345678`, etc.
 * Returns normalized string. Invalid lengths returned as-is (trimmed digits).
 *
 * @example
 *   formatPhone("0812345678")     // "081-234-5678"
 *   formatPhone("081 234 5678")   // "081-234-5678"
 *   formatPhone("+66812345678")   // "081-234-5678"
 *   formatPhone("021234567")      // "02-123-4567" (Bangkok 9-digit)
 */
export function formatPhone(input: string): string {
  if (!input) return "";
  let digits = String(input).replace(/\D/g, "");
  // Strip Thailand country code "66" if present at start (and original had +)
  if (digits.length === 11 && digits.startsWith("66")) {
    digits = "0" + digits.slice(2);
  } else if (digits.length === 12 && digits.startsWith("66")) {
    digits = "0" + digits.slice(2);
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    // Bangkok landline: 02-XXX-XXXX
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

/**
 * Strip non-digits — useful for comparing/saving raw phone.
 */
export function phoneDigits(input: string): string {
  return String(input ?? "").replace(/\D/g, "");
}

/**
 * Validate Thai phone (mobile 10 digits or Bangkok 9 digits).
 */
export function isValidPhone(input: string): boolean {
  const d = phoneDigits(input);
  return d.length === 9 || d.length === 10;
}

/**
 * Format Thai HN — accepts any input, normalizes uppercase + dashes.
 * @example formatHN("hn2026001") // "HN-2026-001"
 */
export function formatHN(input: string): string {
  if (!input) return "";
  const s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = s.match(/^HN(\d{4})(\d{3})$/);
  if (m) return `HN-${m[1]}-${m[2]}`;
  return input.toUpperCase();
}

/**
 * Format Thai Baht with thousands separator.
 */
export function formatBaht(amount: number, withSign = true): string {
  const formatted = amount.toLocaleString("th-TH");
  return withSign ? `฿${formatted}` : formatted;
}

/**
 * Convert array of objects to CSV string with UTF-8 BOM for Excel compatibility.
 */
export function toCSV<T extends Record<string, any>>(rows: T[], headers: { key: keyof T; label: string }[]): string {
  if (rows.length === 0) return "";
  const escape = (v: any) => {
    const s = v === undefined || v === null ? "" : String(v);
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const header = headers.map(h => escape(h.label)).join(",");
  const body = rows.map(r => headers.map(h => escape(r[h.key])).join(",")).join("\n");
  return "﻿" + header + "\n" + body;
}

/**
 * Trigger browser download of a CSV/text file.
 */
export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
