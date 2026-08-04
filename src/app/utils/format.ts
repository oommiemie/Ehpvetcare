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

const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/**
 * แสดงวันที่เป็นไทย (พ.ศ.) — "5 ก.ค. 2569"
 *
 * ข้อมูลในระบบเก็บวันที่ไว้หลายรูปแบบปนกัน ทั้ง ISO ที่มาจากฟอร์ม/ปฏิทิน
 * และสตริงไทยที่พิมพ์ไว้ตรง ๆ ในข้อมูลตั้งต้น ตัวนี้จึงรับได้ทั้งหมด
 * และคืนค่าเดิมกลับไปถ้าเป็นไทยอยู่แล้ว — เรียกซ้ำกี่รอบผลก็เท่าเดิม
 *
 * รับ: "2026-07-05" · "05/07/2026" · "5 ก.ค. 2569" (คืนเดิม) · "" → "—"
 */
export function fmtThaiDate(input?: string | null, fallback = "—"): string {
  const s = String(input ?? "").trim();
  if (!s) return fallback;

  /* เป็นไทยอยู่แล้ว — อย่าไปยุ่ง ไม่งั้นบวก 543 ซ้ำเป็น 3112 */
  if (/[ก-๙]/.test(s)) return s;

  let y = 0, m = 0, d = 0;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);          // 2026-07-05
  const dmy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/); // 05/07/2026
  if (iso) [, y, m, d] = iso.map(Number) as [any, number, number, number];
  else if (dmy) [, d, m, y] = dmy.map(Number) as [any, number, number, number];
  else return s;

  if (!y || !m || !d || m > 12 || d > 31) return s;
  /* ปีเกิน 2500 แปลว่าเป็น พ.ศ. มาแล้ว (เช่น "05/07/2569") ไม่ต้องบวกซ้ำ */
  return `${d} ${THAI_MONTHS_SHORT[m - 1]} ${y > 2400 ? y : y + 543}`;
}

/**
 * วันที่ + เวลา เป็นไทย — "5 ก.ค. 2569 · 10:30 น."
 * เวลาว่างได้ จะเหลือแค่วันที่
 */
export function fmtThaiDateTime(date?: string | null, time?: string | null, sep = " · "): string {
  const d = fmtThaiDate(date);
  const t = String(time ?? "").trim();
  return t ? `${d}${sep}${t} น.` : d;
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
