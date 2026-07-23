/* ─────────────────────────────────────────────────────────────
   ตั้งค่าแท็บ OPD / IPD — เลือกว่าจะแสดงแท็บไหน และเรียงลำดับเอง

   เก็บเป็น { order: string[]; hidden: string[] } ต่อ 1 ชุด (opd/ipd)
   ไม่เก็บ label/ไอคอน — อ่านจากโค้ดเสมอ เพิ่มแท็บใหม่ในอนาคต
   จะโผล่ต่อท้ายให้เองโดยค่าเก่าไม่พัง

   บางแท็บซ่อนไม่ได้ (lockedKeys) เพราะเป็นจุดเริ่ม/จบของงาน
   เช่น ลงทะเบียนของ OPD หรือ Discharge ของ IPD
   ───────────────────────────────────────────────────────────── */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type TabScope = "opd" | "ipd";

export interface TabPref { order: string[]; hidden: string[] }

const KEY = (scope: TabScope) => `ehp_tabprefs_${scope}_v1`;

/** แท็บที่ปิดไม่ได้ — เป็นขั้นตอนบังคับของงาน */
export const LOCKED_TABS: Record<TabScope, string[]> = {
  opd: ["register", "payment"],
  ipd: ["overview", "discharge"],
};

interface Ctx {
  /** เรียง+กรองรายการแท็บตามที่ตั้งค่าไว้ */
  applyTabs: <T extends { key: string }>(scope: TabScope, all: T[]) => T[];
  /** ค่าดิบของ scope นั้น (ใช้ในหน้าตั้งค่า) */
  getPref: (scope: TabScope, allKeys: string[]) => TabPref;
  setOrder: (scope: TabScope, order: string[]) => void;
  toggleHidden: (scope: TabScope, key: string) => void;
  resetScope: (scope: TabScope) => void;
}

const C = createContext<Ctx | null>(null);

const load = (scope: TabScope): TabPref => {
  try {
    const raw = localStorage.getItem(KEY(scope));
    if (!raw) return { order: [], hidden: [] };
    const p = JSON.parse(raw) as Partial<TabPref>;
    return { order: p.order ?? [], hidden: p.hidden ?? [] };
  } catch { return { order: [], hidden: [] }; }
};

export function TabPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Record<TabScope, TabPref>>(() => ({
    opd: load("opd"), ipd: load("ipd"),
  }));

  const save = (scope: TabScope, next: TabPref) => {
    setPrefs(prev => ({ ...prev, [scope]: next }));
    try { localStorage.setItem(KEY(scope), JSON.stringify(next)); } catch { /* เขียนไม่ได้ก็ใช้ได้รอบนี้ */ }
  };

  /** เรียงตามที่บันทึกไว้ก่อน แล้วต่อท้ายด้วยแท็บที่ยังไม่เคยเห็น (แท็บใหม่) */
  const sortKeys = useCallback((saved: string[], allKeys: string[]) => {
    const known = saved.filter(k => allKeys.includes(k));
    return [...known, ...allKeys.filter(k => !known.includes(k))];
  }, []);

  const getPref = useCallback((scope: TabScope, allKeys: string[]): TabPref => {
    const p = prefs[scope];
    return { order: sortKeys(p.order, allKeys), hidden: p.hidden.filter(k => allKeys.includes(k)) };
  }, [prefs, sortKeys]);

  const applyTabs = useCallback(<T extends { key: string }>(scope: TabScope, all: T[]): T[] => {
    const allKeys = all.map(t => t.key);
    const { order, hidden } = getPref(scope, allKeys);
    const locked = LOCKED_TABS[scope];
    return order
      .filter(k => !hidden.includes(k) || locked.includes(k))
      .map(k => all.find(t => t.key === k)!)
      .filter(Boolean);
  }, [getPref]);

  const setOrder = useCallback((scope: TabScope, order: string[]) => {
    setPrefs(prev => {
      const next = { ...prev[scope], order };
      try { localStorage.setItem(KEY(scope), JSON.stringify(next)); } catch { /* ไม่เป็นไร */ }
      return { ...prev, [scope]: next };
    });
  }, []);

  const toggleHidden = useCallback((scope: TabScope, key: string) => {
    if (LOCKED_TABS[scope].includes(key)) return;   // ปิดแท็บบังคับไม่ได้
    setPrefs(prev => {
      const cur = prev[scope];
      const hidden = cur.hidden.includes(key) ? cur.hidden.filter(k => k !== key) : [...cur.hidden, key];
      const next = { ...cur, hidden };
      try { localStorage.setItem(KEY(scope), JSON.stringify(next)); } catch { /* ไม่เป็นไร */ }
      return { ...prev, [scope]: next };
    });
  }, []);

  const resetScope = useCallback((scope: TabScope) => {
    save(scope, { order: [], hidden: [] });
  }, []);

  return <C.Provider value={{ applyTabs, getPref, setOrder, toggleHidden, resetScope }}>{children}</C.Provider>;
}

export function useTabPrefs() {
  const v = useContext(C);
  if (!v) throw new Error("useTabPrefs ต้องอยู่ภายใน TabPrefsProvider");
  return v;
}
