import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LOGIN_BACKGROUNDS, DEFAULT_LOGIN_BG } from "./../config/loginBackgrounds";

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
  /* จัดกลุ่มในหน้าเลือกธีม — พาสเทลแสดงแยกแถวของตัวเอง */
  pastel?: boolean;
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
  /* ── โทนพาสเทล — sidebar พื้นอ่อน + ตัวอักษรเข้ม (ใช้กลไก sbFrom/sbTo/sbInk)
        ปุ่มหลัก/hero ใช้โทนกลางของสีเดียวกัน เพื่อให้ตัวหนังสือขาวยังอ่านออก ── */
  /* พาสเทล: sbFrom = สีบนสุด (อ่อนเกือบขาว), sbTo = สีล่างสุด (เฉดระดับ 200 ให้เห็นการไล่)
     sidebar ไล่จากล่างขึ้นบน — เข้มล่าง จางขึ้นด้านบน (ดู applyDisplay) */
  { key: "pastelpink", label: "ชมพูพาสเทล",  pastel: true, brand: "#ec4899", brandDark: "#be185d", heroFrom: "#f9a8d4", heroTo: "#be185d", heroAccent: "251, 207, 232", heroDeep: "131, 24, 67",
    sbFrom: "#fdf2f8", sbTo: "#fbcfe8", sbInk: "131, 24, 67" },
  { key: "pastelmint", label: "มินต์พาสเทล", pastel: true, brand: "#0d9488", brandDark: "#0f766e", heroFrom: "#5eead4", heroTo: "#0f766e", heroAccent: "153, 246, 228", heroDeep: "19, 78, 74",
    sbFrom: "#f0fdfa", sbTo: "#99f6e4", sbInk: "19, 78, 74" },
  { key: "pastelblue", label: "ฟ้าพาสเทล",   pastel: true, brand: "#3b82f6", brandDark: "#1d4ed8", heroFrom: "#93c5fd", heroTo: "#1d4ed8", heroAccent: "191, 219, 254", heroDeep: "30, 58, 138",
    sbFrom: "#eff6ff", sbTo: "#bfdbfe", sbInk: "30, 58, 138" },
  { key: "pastellilac", label: "ม่วงไลแลค",   pastel: true, brand: "#a855f7", brandDark: "#7e22ce", heroFrom: "#d8b4fe", heroTo: "#7e22ce", heroAccent: "233, 213, 255", heroDeep: "88, 28, 135",
    sbFrom: "#faf5ff", sbTo: "#e9d5ff", sbInk: "88, 28, 135" },
];

/* ── ขนาดตัวอักษร — 5 ระดับสำหรับ slider
      คีย์ sm/md/lg คงชื่อเดิมไว้ ให้ค่าที่ผู้ใช้เคยบันทึกยังใช้ได้ ── */
export interface TextSizeOption { key: string; label: string; sub: string; scale: number; }
export const TEXT_SIZES: TextSizeOption[] = [
  { key: "xs", label: "เล็กมาก", sub: "ข้อมูลต่อหน้าจอมากที่สุด", scale: 0.85 },
  { key: "sm", label: "เล็ก",    sub: "ข้อมูลต่อหน้าจอมากขึ้น",   scale: 0.92 },
  { key: "md", label: "กลาง",   sub: "ค่าเริ่มต้น",               scale: 1 },
  { key: "lg", label: "ใหญ่",   sub: "อ่านสบายตา",               scale: 1.1 },
  { key: "xl", label: "ใหญ่มาก", sub: "อ่านสบายตาที่สุด",         scale: 1.2 },
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

/* สไตล์เมนู sidebar: normal = ชิดขอบเต็มสูง / float = การ์ดลอย ขอบมน มีระยะรอบ */
export type SbStyle = "normal" | "float";
/* รูปทรงไอคอนเมนูใน sidebar */
export type SbIcon = "circle" | "rounded";
interface DisplayState { themeKey: string; fontKey: string; sizeKey: string; sbStyle: SbStyle; sbIcon: SbIcon; loginBg: string; }
interface DisplayCtx extends DisplayState {
  setTheme: (key: string) => void;
  setFont: (key: string) => void;
  setSize: (key: string) => void;
  setSbStyle: (v: SbStyle) => void;
  setSbIcon: (v: SbIcon) => void;
  setLoginBg: (v: string) => void;
  themes: ColorTheme[];
  fonts: FontOption[];
  sizes: TextSizeOption[];
}

const KEY = "ehp_display_v1";
const DEFAULTS: DisplayState = { themeKey: "teal", fontKey: "plex", sizeKey: "md", sbStyle: "normal", sbIcon: "circle", loginBg: DEFAULT_LOGIN_BG };
const load = (): DisplayState => {
  try {
    const r = localStorage.getItem(KEY);
    if (r) {
      const s: DisplayState = { ...DEFAULTS, ...JSON.parse(r) };
      /* ตัวเลือกที่ถูกถอดออกแล้ว → กลับไปใช้ค่าเริ่มต้น */
      if (!COLOR_THEMES.some(t => t.key === s.themeKey)) s.themeKey = DEFAULTS.themeKey;
      if (!FONT_OPTIONS.some(f => f.key === s.fontKey)) s.fontKey = DEFAULTS.fontKey;
      if (!TEXT_SIZES.some(z => z.key === s.sizeKey)) s.sizeKey = DEFAULTS.sizeKey;
      if (s.sbStyle !== "normal" && s.sbStyle !== "float") s.sbStyle = DEFAULTS.sbStyle;
      if (s.sbIcon !== "circle" && s.sbIcon !== "rounded") s.sbIcon = DEFAULTS.sbIcon;
      /* ภาพที่ถูกลบออกจาก assets → กลับไปใช้ภาพเริ่มต้น */
      if (!LOGIN_BACKGROUNDS.some(b => b.key === s.loginBg)) s.loginBg = DEFAULTS.loginBg;
      return s;
    }
  } catch { /* ignore */ }
  return { ...DEFAULTS };
};

/* ตั้งค่า CSS variables บน :root ตามธีม/ฟอนต์ */
export function applyDisplay(themeKey: string, fontKey: string, sizeKey: string = DEFAULTS.sizeKey) {
  const t = COLOR_THEMES.find(x => x.key === themeKey) ?? COLOR_THEMES[0];
  const f = FONT_OPTIONS.find(x => x.key === fontKey) ?? FONT_OPTIONS[0];
  const z = TEXT_SIZES.find(x => x.key === sizeKey) ?? TEXT_SIZES[1];
  const r = document.documentElement.style;
  /* --fs สเกลเฉพาะ font-size/line-height (ดู styles/fontsize.css) ไม่ใช่ซูมทั้งหน้า */
  r.setProperty("--fs", String(z.scale));
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
  /* พื้นหลัง sidebar ทั้งผืน —
     พาสเทล: ไล่สะอาด ๆ จากเข้มด้านล่างขึ้นไปอ่อนด้านบน (ไม่มี radial ซ้อนให้เป็นหย่อม)
     ธีมปกติ: gradient 3 ชั้นแบบเดิม (radial accent/deep + linear) */
  r.setProperty(
    "--sb-bg",
    t.pastel
      ? `linear-gradient(to top, var(--sb-to) 0%, var(--sb-from) 70%, #ffffff 100%)`
      : `radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
         radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
         linear-gradient(178deg, var(--sb-from) 0%, var(--sb-to) 100%)`
  );
  /* สถานะ active ของเมนู sidebar —
     ธีมเข้ม: กระจกขาวโปร่งแบบเดิม / พาสเทล: การ์ดขาวทึบ + ขอบสีแบรนด์
     (ขาวโปร่ง 18% บนพื้นอ่อนแทบมองไม่เห็น) */
  r.setProperty("--sb-active-bg", t.pastel ? "#ffffff" : "rgba(255,255,255,0.18)");
  r.setProperty("--sb-active-border", t.pastel ? `${t.brand}59` : "rgba(255,255,255,0.32)");
  /* เงาใต้ตัวอักษร active — ช่วยตัวหนังสือขาวบนพื้นเข้ม แต่ทำตัวหนังสือเข้มบนพื้นอ่อนดูเบลอ */
  r.setProperty("--sb-active-text-shadow", t.pastel ? "none" : "0 1px 6px rgba(0,0,0,0.15)");
  /* ปุ่มเพิ่ม/บันทึกบน hero —
     ธีมหลัก: ส้ม gradient แบบดั้งเดิม / พาสเทล: ขาว + ตัวหนังสือสีแบรนด์
     (ส้มบน hero พาสเทลดูขัดตา แต่ผู้ใช้ต้องการส้มเดิมไว้ในธีมหลัก) */
  if (t.pastel) {
    r.setProperty("--hero-btn-bg", "#ffffff");
    r.setProperty("--hero-btn-fg", "var(--brand-dark)");
    r.setProperty("--hero-btn-border", "rgba(255,255,255,0.95)");
    r.setProperty("--hero-btn-shadow", "0 6px 20px rgba(0,0,0,0.18)");
    r.setProperty("--hero-btn-text-shadow", "none");
  } else {
    r.setProperty("--hero-btn-bg", "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)");
    r.setProperty("--hero-btn-fg", "#ffffff");
    r.setProperty("--hero-btn-border", "rgba(253,186,116,0.85)");
    r.setProperty("--hero-btn-shadow", "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.15), 0 6px 22px rgba(234,88,12,0.65)");
    r.setProperty("--hero-btn-text-shadow", "0 1px 2px rgba(0,0,0,0.15)");
  }
}

const Ctx = createContext<DisplayCtx | null>(null);

export function DisplayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DisplayState>(load);

  useEffect(() => {
    applyDisplay(state.themeKey, state.fontKey, state.sizeKey);
    /* รูปทรงไอคอนเมนู sidebar — วงกลม / ขอบมน (ใช้ทั้ง sidebar จริงและ wireframe ตัวอย่าง) */
    document.documentElement.style.setProperty("--sb-icon-radius", state.sbIcon === "rounded" ? "12px" : "9999px");
    /* พิลล์เมนู (active/hover) เปลี่ยนทรงตามไอคอน — วงกลม=pill เต็ม, ขอบมน=มุมมน */
    document.documentElement.style.setProperty("--sb-item-radius", state.sbIcon === "rounded" ? "14px" : "9999px");
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  }, [state.themeKey, state.fontKey, state.sizeKey, state.sbStyle, state.sbIcon, state.loginBg]);

  return (
    <Ctx.Provider value={{
      ...state,
      setTheme: (themeKey) => setState(s => ({ ...s, themeKey })),
      setFont: (fontKey) => setState(s => ({ ...s, fontKey })),
      setSize: (sizeKey) => setState(s => ({ ...s, sizeKey })),
      setSbStyle: (sbStyle) => setState(s => ({ ...s, sbStyle })),
      setSbIcon: (sbIcon) => setState(s => ({ ...s, sbIcon })),
      setLoginBg: (loginBg) => setState(s => ({ ...s, loginBg })),
      themes: COLOR_THEMES,
      fonts: FONT_OPTIONS,
      sizes: TEXT_SIZES,
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
