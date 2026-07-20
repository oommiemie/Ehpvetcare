import { useCallback, useEffect, useState } from "react";
import { navItems } from "../config/nav";

/* ─────────────────────────────────────────────────────────────
   เมนูลัดบนหน้า Dashboard — ผู้ใช้เพิ่ม/ลบ/จัดลำดับเองได้
   เก็บเป็น "รายการ path" ไม่ใช่ทั้ง object เพื่อให้ label/ไอคอน/สี
   อ้างอิงจาก config/nav.ts เสมอ (แก้ที่เดียวแล้วเมนูลัดตามทันที)
   ───────────────────────────────────────────────────────────── */

const STORAGE_KEY = "ehp_shortcuts_v1";

/* ค่าเริ่มต้น 8 เมนู — เต็มพอดี 1 แถวบนจอใหญ่ (grid 8 ช่อง) */
export const DEFAULT_SHORTCUTS = [
  "/visits",
  "/appointments",
  "/owners",
  "/pets",
  "/schedule",
  "/retail",
  "/stock",
  "/financial",
];

export const MAX_SHORTCUTS = 12;

const isValid = (p: string) => navItems.some(n => n.path === p);

const load = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SHORTCUTS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_SHORTCUTS];
    /* กรอง path ที่ถูกลบ/เปลี่ยนชื่อออก + กันซ้ำ + กันเกินลิมิต
       ไม่งั้นเมนูที่หายไปจะกลายเป็นไทล์กดแล้วเจอหน้าว่าง */
    const clean = [...new Set(parsed.filter(p => typeof p === "string" && isValid(p)))];
    return clean.slice(0, MAX_SHORTCUTS);
  } catch {
    return [...DEFAULT_SHORTCUTS];
  }
};

export function useShortcuts() {
  const [paths, setPaths] = useState<string[]>(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(paths)); } catch { /* quota */ }
  }, [paths]);

  const add = useCallback((path: string) => {
    setPaths(p => (p.includes(path) || p.length >= MAX_SHORTCUTS ? p : [...p, path]));
  }, []);

  const remove = useCallback((path: string) => {
    setPaths(p => p.filter(x => x !== path));
  }, []);

  const toggle = useCallback((path: string) => {
    setPaths(p => {
      if (p.includes(path)) return p.filter(x => x !== path);
      return p.length >= MAX_SHORTCUTS ? p : [...p, path];
    });
  }, []);

  /* ลากวางจัดลำดับ — ย้าย from ไปแทรกตำแหน่งของ to */
  const reorder = useCallback((from: string, to: string) => {
    setPaths(p => {
      const i = p.indexOf(from);
      const j = p.indexOf(to);
      if (i < 0 || j < 0 || i === j) return p;
      const next = [...p];
      next.splice(j, 0, next.splice(i, 1)[0]);
      return next;
    });
  }, []);

  const reset = useCallback(() => setPaths([...DEFAULT_SHORTCUTS]), []);

  /* คืนเป็น NavItem ตามลำดับที่ผู้ใช้จัดไว้ */
  const items = paths
    .map(p => navItems.find(n => n.path === p))
    .filter((n): n is NonNullable<typeof n> => Boolean(n));

  return { paths, items, add, remove, toggle, reorder, reset, isFull: paths.length >= MAX_SHORTCUTS };
}
