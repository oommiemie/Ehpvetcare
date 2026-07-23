/* ─────────────────────────────────────────────────────────────
   คีย์ลัด — กดคีย์บอร์ดแล้วกระโดดไปหน้าที่ผูกไว้

   ตัวคีย์ "ตายตัว" 10 ชุด (Shift+1 … Shift+0) แก้ไม่ได้
   ผู้ใช้เลือกได้แค่ว่าคีย์แต่ละชุดจะไปหน้าไหน

   Shift มีเหมือนกันทั้ง Windows และ Mac (ไม่เอา Alt/Option เพราะ
   คีย์บอร์ด Windows ไม่มีปุ่ม Option)

   ⚠️ Shift+เลข = เครื่องหมาย !@#$ ที่ใช้พิมพ์ตลอด
      ตัวฟังจึงต้องข้ามเมื่อโฟกัสอยู่ในช่องกรอกข้อความ ไม่งั้นพิมพ์
      "!" ในฟอร์มแล้วหน้าจะเด้งทันที — ดู onKey ด้านล่าง
   ───────────────────────────────────────────────────────────── */
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";

/** ปลายทางที่ผูกกับคีย์ลัดได้ */
export interface ShortcutAction { path: string; label: string; group: string; }

export const SHORTCUT_ACTIONS: ShortcutAction[] = [
  { path: "/",              label: "แดชบอร์ด",           group: "ภาพรวม" },
  { path: "/chat",          label: "แชท",                group: "ภาพรวม" },
  { path: "/assistant",     label: "หมอเหมียว (AI)",      group: "ภาพรวม" },
  { path: "/owners",        label: "เจ้าของสัตว์",        group: "ข้อมูล" },
  { path: "/pets",          label: "สัตว์เลี้ยง",          group: "ข้อมูล" },
  { path: "/visits",        label: "การตรวจรักษา",        group: "บริการ" },
  { path: "/appointments",  label: "นัดหมาย",             group: "บริการ" },
  { path: "/schedule",      label: "ตารางแพทย์",          group: "บริการ" },
  { path: "/grooming",      label: "บริการอาบน้ำ",        group: "บริการ" },
  { path: "/boarding",      label: "ฝากเลี้ยง",           group: "บริการ" },
  { path: "/ipd",           label: "IPD Dashboard",      group: "IPD ผู้ป่วยใน" },
  { path: "/ipd/ward",      label: "Ward ผู้ป่วยใน",      group: "IPD ผู้ป่วยใน" },
  { path: "/ipd/reports",   label: "รายงาน IPD",          group: "IPD ผู้ป่วยใน" },
  { path: "/financial",     label: "การเงิน",             group: "การเงิน & สินค้า" },
  { path: "/retail",        label: "ร้านค้า & POS",       group: "การเงิน & สินค้า" },
  { path: "/stock",         label: "จัดการ Stock",        group: "การเงิน & สินค้า" },
  { path: "/storeroom",     label: "คลังสินค้าแยกหน่วยจ่าย",    group: "การเงิน & สินค้า" },
  { path: "/reports",       label: "รายงาน",              group: "ระบบ" },
  { path: "/notifications", label: "การแจ้งเตือน",        group: "ระบบ" },
  { path: "/settings",      label: "ตั้งค่า",              group: "ระบบ" },
];

/** คีย์ 10 ชุดที่ระบบกำหนดไว้ — ผู้ใช้เปลี่ยนตัวคีย์ไม่ได้ */
export const SHORTCUT_COMBOS = [
  "shift+1", "shift+2", "shift+3", "shift+4", "shift+5",
  "shift+6", "shift+7", "shift+8", "shift+9", "shift+0",
] as const;

/** ปลายทางเริ่มต้นของแต่ละคีย์ — "" = ยังไม่ผูก */
export const DEFAULT_ACTIONS: string[] = [
  "/",             // Shift+1
  "/visits",       // Shift+2
  "/appointments", // Shift+3
  "/owners",       // Shift+4
  "/pets",         // Shift+5
  "/retail",       // Shift+6
  "/stock",        // Shift+7
  "/financial",    // Shift+8
  "/ipd/ward",     // Shift+9
  "/settings",     // Shift+0
];

const KEY = "ehp_shortcut_actions_v1";
const ENABLED_KEY = "ehp_shortcuts_enabled_v1";

/** KeyboardEvent → สตริงคีย์ลัดรูปแบบเดียวกับ SHORTCUT_COMBOS */
export function comboFromEvent(e: KeyboardEvent): string {
  if (["Control", "Meta", "Alt", "Shift"].includes(e.key)) return "";
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.metaKey) parts.push("meta");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  /* Shift+เลข ให้สัญลักษณ์ (!@#) — ใช้ e.code แกะเลขจริงแทน */
  const digit = /^Digit(\d)$/.exec(e.code)?.[1];
  parts.push(digit ?? e.key.toLowerCase());
  return parts.join("+");
}

/** "shift+1" → "Shift + 1"
    ตั้งใจใช้ชื่อเดียวกันทุกระบบ ไม่แปลงเป็นสัญลักษณ์ Mac (⌘/⌥)
    เพราะเป็นคีย์ที่มีเหมือนกันทั้ง Windows/Mac จะได้สื่อสารตรงกัน */
export function comboLabel(combo: string): string {
  const NAME: Record<string, string> = { ctrl: "Ctrl", meta: "Meta", alt: "Alt", shift: "Shift" };
  return combo.split("+").map(p => NAME[p] ?? p.toUpperCase()).join(" + ");
}

export const actionByPath = (p: string) => SHORTCUT_ACTIONS.find(a => a.path === p);

interface Ctx {
  /** ปลายทางของคีย์แต่ละชุด เรียงตรงกับ SHORTCUT_COMBOS */
  actions: string[];
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  /** ตั้งปลายทางของคีย์ชุดที่ i — "" = ไม่ใช้ · ซ้ำกับชุดอื่นจะถอดของเดิมออกให้ */
  setAction: (i: number, path: string) => void;
  resetAll: () => void;
}

const C = createContext<Ctx | null>(null);

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [actions, setActions] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT_ACTIONS;
      const saved = JSON.parse(raw) as string[];
      /* ยึดจำนวนคีย์ตามโค้ดเสมอ — เพิ่ม/ลดคีย์ในอนาคตแล้วค่าเก่าไม่พัง */
      return SHORTCUT_COMBOS.map((_, i) => saved[i] ?? DEFAULT_ACTIONS[i] ?? "");
    } catch { return DEFAULT_ACTIONS; }
  });
  const [enabled, setEnabledState] = useState<boolean>(() => {
    try { return localStorage.getItem(ENABLED_KEY) !== "0"; } catch { return true; }
  });

  const persist = (list: string[]) => {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* เขียนไม่ได้ก็ยังใช้ได้รอบนี้ */ }
  };

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    try { localStorage.setItem(ENABLED_KEY, v ? "1" : "0"); } catch { /* ไม่เป็นไร */ }
  }, []);

  const setAction = useCallback((i: number, path: string) => {
    setActions(prev => {
      /* หน้าเดียวผูกได้คีย์เดียว — ถ้าซ้ำ ถอดออกจากคีย์เดิมก่อน */
      const next = prev.map((p, j) => (j === i ? path : path && p === path ? "" : p));
      persist(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => { setActions(DEFAULT_ACTIONS); persist(DEFAULT_ACTIONS); }, []);

  /* ── ตัวฟังคีย์บอร์ดทั้งแอป ── */
  const ref = useRef({ actions, enabled });
  useEffect(() => { ref.current = { actions, enabled }; }, [actions, enabled]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { actions: list, enabled: on } = ref.current;
      if (!on) return;
      /* กำลังพิมพ์อยู่ = ไม่ยิงคีย์ลัด — Shift+เลขคือเครื่องหมาย !@# ที่ต้องพิมพ์ได้ปกติ */
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      const combo = comboFromEvent(e);
      if (!combo) return;
      const i = SHORTCUT_COMBOS.indexOf(combo as (typeof SHORTCUT_COMBOS)[number]);
      if (i === -1 || !list[i]) return;
      e.preventDefault();
      navigate(list[i]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <C.Provider value={{ actions, enabled, setEnabled, setAction, resetAll }}>
      {children}
    </C.Provider>
  );
}

export function useShortcutKeys() {
  const v = useContext(C);
  if (!v) throw new Error("useShortcutKeys ต้องอยู่ภายใน ShortcutsProvider");
  return v;
}
