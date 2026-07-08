import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* ── ธีมสี (เปลี่ยน sidebar + hero + ปุ่มหลัก) ── */
export interface ColorTheme {
  key: string;
  label: string;
  brand: string;        // primary
  brandDark: string;    // primary dark
  heroFrom: string;     // hero gradient start
  heroTo: string;       // hero gradient end
  heroAccent: string;   // rgb triplet for radial glow
  heroDeep: string;     // rgb triplet for radial deep
  /* Sidebar overrides (ธีมสว่าง) — ถ้าไม่ระบุใช้ค่า hero + ตัวอักษรขาว */
  sbFrom?: string;
  sbTo?: string;
  sbInk?: string;       // rgb triplet ของตัวอักษร sidebar (เข้มสำหรับพื้นสว่าง)
}

export const COLOR_THEMES: ColorTheme[] = [
  { key: "teal",    label: "เขียวมิ้นต์ (เริ่มต้น)", brand: "#19a589", brandDark: "#0d7c66", heroFrom: "#1aa78b", heroTo: "#0e5e4f", heroAccent: "45, 212, 191", heroDeep: "8, 75, 62" },
  { key: "ocean",   label: "ฟ้าทะเล",            brand: "#0ea5e9", brandDark: "#0369a1", heroFrom: "#0ea5e9", heroTo: "#075985", heroAccent: "125, 211, 252", heroDeep: "12, 74, 110" },
  { key: "violet",  label: "ม่วงลาเวนเดอร์",      brand: "#8b5cf6", brandDark: "#6d28d9", heroFrom: "#8b5cf6", heroTo: "#5b21b6", heroAccent: "196, 181, 253", heroDeep: "76, 29, 149" },
  { key: "rose",    label: "ชมพูโรส",            brand: "#f43f5e", brandDark: "#be123c", heroFrom: "#fb7185", heroTo: "#9f1239", heroAccent: "253, 164, 175", heroDeep: "136, 19, 55" },
  { key: "amber",   label: "ส้มอำพัน",            brand: "#f59e0b", brandDark: "#b45309", heroFrom: "#fbbf24", heroTo: "#b45309", heroAccent: "253, 230, 138", heroDeep: "120, 53, 15" },
  { key: "indigo",  label: "น้ำเงินอินดิโก",       brand: "#6366f1", brandDark: "#4338ca", heroFrom: "#6366f1", heroTo: "#3730a3", heroAccent: "165, 180, 252", heroDeep: "49, 46, 129" },
  { key: "emerald", label: "เขียวมรกต",          brand: "#10b981", brandDark: "#047857", heroFrom: "#34d399", heroTo: "#065f46", heroAccent: "110, 231, 183", heroDeep: "6, 78, 59" },
  { key: "slate",   label: "เทาสเลต",            brand: "#475569", brandDark: "#1e293b", heroFrom: "#64748b", heroTo: "#1e293b", heroAccent: "148, 163, 184", heroDeep: "15, 23, 42" },
  { key: "minimal", label: "มินิมอล (ขาว-ดำ)",   brand: "#111827", brandDark: "#000000", heroFrom: "#374151", heroTo: "#0b0f19", heroAccent: "156, 163, 175", heroDeep: "3, 7, 18" },
  /* ── ธีมคลีน (พื้น sidebar สว่าง + ตัวอักษรเข้ม) ── */
  { key: "clean",     label: "คลีนขาว (สว่าง)",  brand: "#0d9488", brandDark: "#0f766e", heroFrom: "#0f766e", heroTo: "#134e4a", heroAccent: "20, 184, 166", heroDeep: "6, 78, 59",
    sbFrom: "#ffffff", sbTo: "#f1f5f9", sbInk: "31, 41, 55" },
  { key: "cleangray", label: "คลีนเทา (สว่าง)",  brand: "#475569", brandDark: "#334155", heroFrom: "#475569", heroTo: "#1e293b", heroAccent: "148, 163, 184", heroDeep: "15, 23, 42",
    sbFrom: "#f8fafc", sbTo: "#eef2f6", sbInk: "30, 41, 59" },
];

/* ── ฟอนต์ ── */
export interface FontOption { key: string; label: string; stack: string; }
export const FONT_OPTIONS: FontOption[] = [
  { key: "plex",   label: "IBM Plex Sans Thai (เริ่มต้น)", stack: "'IBM Plex Sans Thai Looped', sans-serif" },
  { key: "sarabun", label: "Sarabun (สารบรรณ)",           stack: "'Sarabun', sans-serif" },
  { key: "prompt", label: "Prompt",                       stack: "'Prompt', sans-serif" },
  { key: "kanit",  label: "Kanit",                        stack: "'Kanit', sans-serif" },
  { key: "noto",   label: "Noto Sans Thai",               stack: "'Noto Sans Thai', sans-serif" },
  { key: "mitr",   label: "Mitr",                         stack: "'Mitr', sans-serif" },
];

interface DisplayState { themeKey: string; fontKey: string; }
interface DisplayCtx extends DisplayState {
  setTheme: (key: string) => void;
  setFont: (key: string) => void;
  themes: ColorTheme[];
  fonts: FontOption[];
}

const KEY = "ehp_display_v1";
const load = (): DisplayState => {
  try { const r = localStorage.getItem(KEY); if (r) return { themeKey: "teal", fontKey: "plex", ...JSON.parse(r) }; } catch { /* ignore */ }
  return { themeKey: "teal", fontKey: "plex" };
};

/* ตั้งค่า CSS variables บน :root ตามธีม/ฟอนต์ */
export function applyDisplay(themeKey: string, fontKey: string) {
  const t = COLOR_THEMES.find(x => x.key === themeKey) ?? COLOR_THEMES[0];
  const f = FONT_OPTIONS.find(x => x.key === fontKey) ?? FONT_OPTIONS[0];
  const r = document.documentElement.style;
  r.setProperty("--brand", t.brand);
  r.setProperty("--brand-dark", t.brandDark);
  r.setProperty("--brand-hero-from", t.heroFrom);
  r.setProperty("--brand-hero-to", t.heroTo);
  r.setProperty("--brand-hero-accent", t.heroAccent);
  r.setProperty("--brand-hero-deep", t.heroDeep);
  r.setProperty("--app-font-family", f.stack);
  /* Sidebar: ธีมสว่างใช้พื้นอ่อน + ตัวอักษรเข้ม, ธีมปกติใช้ค่าเดียวกับ hero */
  r.setProperty("--sb-from", t.sbFrom ?? t.heroFrom);
  r.setProperty("--sb-to", t.sbTo ?? t.heroTo);
  r.setProperty("--sb-fg-rgb", t.sbInk ?? "255, 255, 255");
}

const Ctx = createContext<DisplayCtx | null>(null);

export function DisplayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DisplayState>(load);

  useEffect(() => {
    applyDisplay(state.themeKey, state.fontKey);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  }, [state.themeKey, state.fontKey]);

  return (
    <Ctx.Provider value={{
      ...state,
      setTheme: (themeKey) => setState(s => ({ ...s, themeKey })),
      setFont: (fontKey) => setState(s => ({ ...s, fontKey })),
      themes: COLOR_THEMES,
      fonts: FONT_OPTIONS,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDisplay() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDisplay must be used within DisplayProvider");
  return c;
}
