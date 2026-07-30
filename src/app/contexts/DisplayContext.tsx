import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  LOGIN_BACKGROUNDS, DEFAULT_LOGIN_BG,
  defaultLoginBgOf, loginBgSet, loginBackgroundsOf,
  type LoginBgSet, type LoginBg,
} from "./../config/loginBackgrounds";

/** เอฟเฟกต์อนุภาคประจำธีมเทศกาล
    snow = หิมะร่วง (คริสต์มาส) · hearts = หัวใจร่วง (วาเลนไทน์)
    stars = ดาวระยิบระยับ (วันแม่) — ไม่ร่วง อยู่กับที่แล้วกะพริบสลับชั้น */
export type ThemeFx = "snow" | "hearts" | "stars";

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
  /* sidebar ใช้เฉดเดียวล้วน — ไม่ซ้อน radial ของ hero accent/deep ทับ
     ใช้ตอนสี sidebar คนละโทนกับ hero (คริสต์มาส: sidebar เขียว / hero แดง) */
  sbPlain?: boolean;
  /* สีแถบขีดซ้ายของเมนูที่เลือกอยู่ — ถ้าไม่ระบุใช้สีประจำเมนูแต่ละอัน (item.color) */
  sbEdge?: string;
  /* พื้น/ขอบของเมนูที่เลือกอยู่ — ไม่ระบุ = ตามชนิดพื้น sidebar
     (พื้นสว่าง = การ์ดขาวทึบ / พื้นเข้ม = กระจกขาวโปร่ง)
     ใช้ตอน sidebar พื้นอ่อนแต่ยังใช้ตัวอักษรขาว เช่นวาเลนไทน์ —
     การ์ดขาวหรือขาวโปร่งจะจมไปกับพื้น ต้องเป็นพิลล์เข้มถึงจะเห็น */
  sbActiveBg?: string;
  sbActiveBorder?: string;
  /* เงาใต้ตัวอักษร sidebar ทุกตัว — ไม่ระบุ = ไม่มี
     ใช้ตอนตัวอักษรขาวอยู่บนพื้นอ่อน ให้ตัวอักษรมีขอบแยกจากพื้น */
  sbTextShadow?: string;
  /* ชุดภาพประจำธีม — คุมทั้งภาพพื้นหลังหน้าล็อกอิน (หน้าตั้งค่าโชว์เฉพาะชุดนี้)
     และภาพสัตว์ใน hero section (ดู config/heroImages.ts)
     ไม่ระบุ = ชุดปกติ */
  bgSet?: LoginBgSet;
  /* จัดกลุ่มในหน้าเลือกธีม — พาสเทลแสดงแยกแถวของตัวเอง */
  pastel?: boolean;
  /* ธีมพิเศษ/ตามเทศกาล — แสดงแยกแถว "ธีมพิเศษ" ในหน้าตั้งค่า */
  special?: boolean;
  /* อนุภาคร่วงประจำธีม (หน้าล็อกอิน · sidebar · hero)
     "snow" = หิมะ / "hearts" = หัวใจ — ดู .vet-snow / .vet-hearts ใน theme.css */
  fx?: ThemeFx;
  /* ปุ่มเพิ่ม/บันทึกบน hero — ถ้าไม่ระบุใช้ส้มมาตรฐาน (พาสเทลใช้ขาว)
     ใช้ตอนสีส้มไปจมกับ hero ของธีมนั้น เช่นคริสต์มาส hero แดง */
  heroBtnBg?: string;
  heroBtnBorder?: string;
  heroBtnShadow?: string;
  heroBtnFg?: string;   // สีตัวหนังสือบนปุ่ม hero — ไม่ระบุ = ขาว
  /* ปุ่มหลัก (บันทึก/ยืนยัน) ในโมดัลและฟอร์ม — ถ้าไม่ระบุใช้สีแบรนด์
     ใช้ตอนสีแบรนด์ไม่เหมาะเป็นปุ่มยืนยัน เช่นคริสต์มาส แบรนด์เป็นแดง
     (แดง = สื่อถึงลบ/อันตราย) จึงให้ปุ่มบันทึกเป็นเขียวชุดเดียวกับปุ่ม hero */
  btnBg?: string;
  btnBorder?: string;
  btnGlow?: string;
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
  /* ── ธีมพิเศษตามเทศกาล ──
     คริสต์มาส: hero/ปุ่มหลักโทนแดง + sidebar เขียวสนเข้ม (ใช้กลไก sbFrom/sbTo
     เดียวกับพาสเทล แต่ไม่ตั้ง sbInk จึงยังเป็นตัวอักษรขาว)
     fx → อนุภาคร่วงที่หน้าล็อกอิน · sidebar · hero (หิมะ / หัวใจ) */
  { key: "christmas", label: "คริสต์มาส", special: true, fx: "snow",
    brand: "#c8102e", brandDark: "#8c0a1f",
    heroFrom: "#d92336", heroTo: "#7a0b1b", heroAccent: "254, 205, 211", heroDeep: "94, 8, 20",
    sbFrom: "#1b6b41", sbTo: "#0a3a22", sbPlain: true,
    /* แถบขีดเมนู active — แดงสว่างกว่า brand เพื่อให้ตัดกับเขียวเข้มของ sidebar */
    sbEdge: "#ff3f52",
    /* ใช้ภาพพื้นหลังชุดคริสต์มาสเท่านั้น */
    bgSet: "xmas",
    /* ปุ่ม hero เขียวคริสต์มาส — ส้มมาตรฐานจมกับ hero แดง */
    heroBtnBg: "linear-gradient(135deg, #34d058 0%, #1a9c46 50%, #12793a 100%)",
    heroBtnBorder: "rgba(134, 239, 172, 0.85)",
    heroBtnShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.15), 0 6px 22px rgba(18,121,58,0.6)",
    /* ปุ่มบันทึก/ยืนยัน — เขียวชุดเดียวกับปุ่ม hero
       แบรนด์เป็นแดง ถ้าปุ่มบันทึกใช้แดงจะไปชนความหมายกับปุ่มลบ */
    btnBg: "linear-gradient(135deg, #34d058 0%, #1a9c46 50%, #12793a 100%)",
    btnBorder: "#12793a",
    btnGlow: "rgba(18,121,58,0.40)" },
  /* วาเลนไทน์: ชมพูหวาน #f5a2c6 เป็นสีหลักของทั้ง sidebar และ hero
     sidebar — พื้นชมพูหวาน ตัวอักษรขาว (ไม่ตั้ง sbInk)
       ขาวบน #f5a2c6 คอนทราสต์แค่ ~1.9:1 จึงต้องพยุงด้วย 3 อย่าง:
       ไล่เฉดลงล่างให้เข้มขึ้น · เงาใต้ตัวอักษรทุกตัว (sbTextShadow)
       · เมนู active เป็นพิลล์โรสเข้ม (sbActiveBg) แทนการ์ดขาว/ขาวโปร่งที่จะจมไปกับพื้น
       sbPlain กันไม่ให้ radial ของ hero accent/deep มาซ้อนจนเป็นหย่อม
     hero — เริ่มที่ #f5a2c6 แล้วไล่ลงโรสเข้ม เพื่อให้หัวข้อ/ตัวเลขสีขาวยังอ่านออก
       (ของประดับใน hero ทุกหน้าเป็นสีขาว จะเปลี่ยนเป็นชมพูล้วนทั้งใบไม่ได้)
     ปุ่มหลักไม่ต้อง override — ชมพูโรสใช้เป็นปุ่มยืนยันได้ ไม่ชนกับปุ่มลบ (แดง) */
  { key: "valentine", label: "วาเลนไทน์", special: true, fx: "hearts",
    brand: "#e5396f", brandDark: "#b21d52",
    heroFrom: "#f5a2c6", heroTo: "#a81a52", heroAccent: "253, 205, 222", heroDeep: "126, 14, 62",
    sbFrom: "#f5a2c6", sbTo: "#e0629c", sbPlain: true,
    /* แถบขีดเมนู active — โรสเข้มให้ตัดกับพื้นชมพูอ่อน */
    sbEdge: "#b31c56",
    sbActiveBg: "linear-gradient(135deg, #d92e6f 0%, #b21d52 100%)",
    sbActiveBorder: "rgba(255,255,255,0.45)",
    sbTextShadow: "0 1px 3px rgba(124,14,62,0.55)",
    /* ใช้ภาพพื้นหลังชุดวาเลนไทน์เท่านั้น */
    bgSet: "valentine",
    /* ปุ่ม hero — โรสเข้ม ตัวหนังสือขาว (ปุ่มขาวจะจมไปกับ hero ชมพูอ่อน
       ส่วนส้มมาตรฐานก็ผิดโทนเทศกาล) */
    heroBtnBg: "linear-gradient(135deg, #f2557f 0%, #d0245f 50%, #a81a4e 100%)",
    heroBtnBorder: "rgba(255,255,255,0.60)",
    heroBtnShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.12), 0 6px 22px rgba(168,26,78,0.45)" },
  /* วันแม่: ฟ้าอ่อน #68cfff เป็นสีหลักของ sidebar และ hero
     ใช้สูตรเดียวกับวาเลนไทน์เป๊ะ ๆ เพราะเป็นพื้นสว่างเหมือนกัน
     (ขาวบน #68cfff คอนทราสต์แค่ ~1.8:1 — ต้องไล่เฉดลงล่าง + เงาใต้ตัวอักษร
      + เมนู active เป็นพิลล์น้ำเงินเข้ม ไม่งั้นเมนูจมไปกับพื้น)

     fx: stars = ดาวระยิบระยับ (ไม่ร่วงเหมือนหิมะ/หัวใจ — อยู่กับที่แล้วกะพริบ)

     ปุ่ม hero ไม่ต้อง override — ส้มมาตรฐานเป็นสีตรงข้ามของฟ้า เด่นดีอยู่แล้ว
     ปุ่มบันทึกก็ใช้สีแบรนด์ได้ ฟ้าไม่ชนความหมายกับปุ่มลบ (แดง) */
  { key: "mothersday", label: "วันแม่", special: true, fx: "stars",
    brand: "#1898dc", brandDark: "#0a6394",
    heroFrom: "#68cfff", heroTo: "#0a6394", heroAccent: "104, 207, 255", heroDeep: "8, 74, 112",
    sbFrom: "#68cfff", sbTo: "#38a8e0", sbPlain: true,
    /* แถบขีดเมนู active — น้ำเงินเข้มให้ตัดกับพื้นฟ้าอ่อน */
    sbEdge: "#0b6ea8",
    sbActiveBg: "linear-gradient(135deg, #1e9ee0 0%, #0a6394 100%)",
    sbActiveBorder: "rgba(255,255,255,0.45)",
    sbTextShadow: "0 1px 3px rgba(8,74,112,0.55)",
    /* ใช้ภาพพื้นหลังชุดวันแม่เท่านั้น */
    bgSet: "mothersday" },
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
/* ภาพพื้นหลังหน้าล็อกอินต้องอยู่ในชุดของธีมที่เลือกอยู่ —
   ถ้าไม่ใช่ ให้เปลี่ยนเป็นภาพแรกของชุดนั้น (ถ้าชุดนั้นยังไม่มีภาพเลย คงค่าเดิมไว้) */
function syncLoginBg(loginBg: string, themeKey: string): string {
  const want: LoginBgSet = COLOR_THEMES.find(t => t.key === themeKey)?.bgSet;
  if (loginBgSet(loginBg) === want) return loginBg;
  return defaultLoginBgOf(want) ?? loginBg;
}

interface DisplayCtx extends DisplayState {
  /** อนุภาคร่วงของธีมปัจจุบัน — undefined = ไม่มี · ใช้สั่งวาด <ThemeParticles /> */
  fx?: ThemeFx;
  /** ภาพพื้นหลังหน้าล็อกอินที่เลือกได้ในธีมนี้ (กรองตาม bgSet ของธีม) */
  loginBgs: LoginBg[];
  /** ชุดภาพของธีมปัจจุบัน — ใช้เลือกภาพ hero ด้วย (ดู config/heroImages.ts) */
  bgSet: LoginBgSet;
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
      /* ภาพที่บันทึกไว้ไม่ใช่ชุดของธีมที่บันทึกไว้ (เช่นเพิ่ม/ย้ายชุดภาพทีหลัง)
         → ดึงกลับเข้าชุดของธีม */
      s.loginBg = syncLoginBg(s.loginBg, s.themeKey);
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
  /* สวิตช์ CSS 2 ตัวที่ <html> — เปิดของประดับทุกหน้าในทีเดียว
     data-fx     = ชนิดอนุภาคร่วง (snow/hearts) → อนุภาคบน hero + หิมะเกาะปุ่ม
     data-season = เทศกาล → ของประดับเฉพาะเทศกาล เช่นต้นคริสต์มาสบน hero
     แยกกันเพราะไม่ผูกกันเสมอ: ธีมอาจมีหัวใจร่วงแต่ไม่มีของประดับประจำเทศกาล */
  const el = document.documentElement;
  if (t.fx) el.setAttribute("data-fx", t.fx);
  else el.removeAttribute("data-fx");
  if (t.bgSet) el.setAttribute("data-season", t.bgSet);
  else el.removeAttribute("data-season");
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
     sbPlain: เฉดเดียวล้วน ไม่มี radial สีอื่นซ้อน (คริสต์มาส — sidebar เขียว
              แต่ radial ใช้ hero accent/deep ซึ่งเป็นโทนแดง จะไปปนกับเขียว)
     ธีมปกติ: gradient 3 ชั้นแบบเดิม (radial accent/deep + linear) */
  r.setProperty(
    "--sb-bg",
    t.pastel
      ? `linear-gradient(to top, var(--sb-to) 0%, var(--sb-from) 70%, #ffffff 100%)`
      : t.sbPlain
      ? `linear-gradient(178deg, var(--sb-from) 0%, var(--sb-to) 100%)`
      : `radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
         radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
         linear-gradient(178deg, var(--sb-from) 0%, var(--sb-to) 100%)`
  );
  /* สถานะ active ของเมนู sidebar —
     ธีมเข้ม: กระจกขาวโปร่งแบบเดิม / sidebar พื้นสว่าง: การ์ดขาวทึบ + ขอบสีแบรนด์
     (ขาวโปร่ง 18% บนพื้นอ่อนแทบมองไม่เห็น)
     "พื้นสว่าง" = พาสเทลทุกตัว + ธีมที่ระบุ sbInk เอง (ตัวอักษรเข้ม = พื้นต้องอ่อน)
     เช่นวาเลนไทน์ที่ sidebar เป็นชมพูหวาน */
  const lightSb = t.pastel || !!t.sbInk;
  r.setProperty("--sb-active-bg", t.sbActiveBg ?? (lightSb ? "#ffffff" : "rgba(255,255,255,0.18)"));
  r.setProperty("--sb-active-border", t.sbActiveBorder ?? (lightSb ? `color-mix(in srgb, ${t.brand} 34.9%, transparent)` : "rgba(255,255,255,0.32)"));
  /* เงาใต้ตัวอักษร sidebar — ธีมกำหนดเองได้ (ตัวอักษรขาวบนพื้นอ่อนต้องมี ไม่งั้นจม)
     ไม่กำหนด: active บนพื้นเข้มมีเงาช่วยเหมือนเดิม / พื้นอ่อนตัวอักษรเข้มไม่ต้องมี (จะดูเบลอ) */
  r.setProperty("--sb-text-shadow", t.sbTextShadow ?? "none");
  /* ตัวคูณความเข้มของ "ของจาง ๆ" ใน sidebar — หัวข้อกลุ่ม เส้นคั่น ลูกศร ปุ่มเล็ก
     ทั้งหมดเป็นสีตัวอักษรที่ opacity ต่ำ (0.06–0.60) ซึ่งออกแบบมาบนพื้นเข้ม
     ธีมที่ตัวอักษรขาวอยู่บนพื้นอ่อน (วาเลนไทน์) ต้องคูณสองถึงจะมองเห็น
     ค่าที่เกิน 1 เบราว์เซอร์ปัดลงให้เอง — ธีมอื่นคูณ 1 = เหมือนเดิมทุกอย่าง */
  r.setProperty("--sb-dim", t.sbTextShadow ? "2" : "1");
  r.setProperty("--sb-active-text-shadow", t.sbTextShadow ?? (lightSb ? "none" : "0 1px 6px rgba(0,0,0,0.15)"));
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
  /* ปุ่มหลัก (บันทึก) — ธีมกำหนดเองได้ ไม่งั้นถอยไปใช้สีแบรนด์ตาม :root
     ต้องเคลียร์ค่าเก่าทุกครั้งด้วย ไม่งั้นสลับจากธีมคริสต์มาสไปธีมอื่น
     ปุ่มจะค้างเป็นเขียว (inline style บน :root ทับ :root ใน theme.css) */
  if (t.btnBg) {
    r.setProperty("--btn-primary-bg", t.btnBg);
    r.setProperty("--btn-primary-border", t.btnBorder ?? "transparent");
    r.setProperty("--btn-primary-glow", t.btnGlow ?? "transparent");
    /* เงา hover/กด ให้เข้ากับสีปุ่ม — ไม่งั้นปุ่มเขียวเรืองส้มตอนชี้ */
    r.setProperty("--btn-primary-glow-hover", t.btnGlow ?? "transparent");
    r.setProperty("--btn-primary-glow-active", t.btnGlow ?? "transparent");
  } else {
    r.removeProperty("--btn-primary-bg");
    r.removeProperty("--btn-primary-border");
    r.removeProperty("--btn-primary-glow");
    r.removeProperty("--btn-primary-glow-hover");
    r.removeProperty("--btn-primary-glow-active");
  }
  /* ธีมที่กำหนดสีปุ่ม hero เองไว้ — ทับค่าด้านบน
     ปุ่มพื้นขาว (วาเลนไทน์) ต้องส่ง heroBtnFg มาด้วย ไม่งั้นตัวหนังสือขาวบนขาว */
  if (t.heroBtnBg) {
    r.setProperty("--hero-btn-bg", t.heroBtnBg);
    r.setProperty("--hero-btn-fg", t.heroBtnFg ?? "#ffffff");
    r.setProperty("--hero-btn-text-shadow", t.heroBtnFg ? "none" : "0 1px 2px rgba(0,0,0,0.15)");
    if (t.heroBtnBorder) r.setProperty("--hero-btn-border", t.heroBtnBorder);
    if (t.heroBtnShadow) r.setProperty("--hero-btn-shadow", t.heroBtnShadow);
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

  /* ── เอฟเฟกต์ตอนกดปุ่มของธีมเทศกาล ──
     คริสต์มาส = หิมะที่เกาะอยู่ร่วงลง / วาเลนไทน์ = หัวใจผุดขึ้น
     ดักที่ document ตัวเดียว จึงครอบปุ่มทุกปุ่มในระบบและปุ่มที่เพิ่มมาทีหลัง
     ไม่ต้องแก้ปุ่มทีละอัน (ดู .vet-fx-btn / .vet-fx-press ใน theme.css) */
  const fx = COLOR_THEMES.find(t => t.key === state.themeKey)?.fx;
  useEffect(() => {
    if (!fx) return;
    const DROP = "vet-fx-press";
    /* ชื่อ keyframe ของแต่ละธีม — ใช้กรอง animationend ให้ถอดคลาสถูกตัว
       Partial เพราะบางธีมมีอนุภาคแต่ไม่มีเอฟเฟกต์ตอนกด (วันแม่ = ดาว) */
    const PRESS_ANIM: Partial<Record<ThemeFx, string>> = {
      snow: "vet-snowcap-drop",
      hearts: "vet-heart-pop",
    };
    const pressAnim = PRESS_ANIM[fx];
    if (!pressAnim) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const btn = t?.closest?.(".vet-btn-primary, .vet-fx-btn") as HTMLElement | null;
      if (!btn || btn.matches(":disabled")) return;
      /* ถอดคลาสแล้ว reflow ก่อนใส่ใหม่ — ไม่งั้นกดรัว ๆ animation จะไม่เริ่มรอบใหม่ */
      btn.classList.remove(DROP);
      void btn.offsetWidth;
      btn.classList.add(DROP);
    };
    /* จบครบใน keyframe เดียว (หิมะก่อตัวกลับ / หัวใจจางหาย) แล้วถอดคลาสรอรอบถัดไป */
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName !== pressAnim) return;
      (e.target as HTMLElement | null)?.classList?.remove(DROP);
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("animationend", onEnd, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("animationend", onEnd, true);
      /* ออกจากธีมแล้วเก็บคลาสที่ค้างอยู่ให้หมด */
      document.querySelectorAll("." + DROP).forEach(el => el.classList.remove(DROP));
    };
  }, [fx]);

  return (
    <Ctx.Provider value={{
      ...state,
      fx,
      bgSet: COLOR_THEMES.find(t => t.key === state.themeKey)?.bgSet,
      loginBgs: loginBackgroundsOf(COLOR_THEMES.find(t => t.key === state.themeKey)?.bgSet),
      /* เปลี่ยนธีม → สลับภาพพื้นหลังหน้าล็อกอินไปชุดของธีมใหม่
         (แต่ละธีมมีภาพให้เลือกคนละชุด — ดู bgSet / LoginBg.set)
         ถ้าภาพที่ใช้อยู่ไม่ได้อยู่ในชุดของธีมใหม่ → เปลี่ยนเป็นภาพแรกของชุดนั้น
         ผู้ใช้ยังเลือกภาพอื่นในชุดทับได้เองที่หน้าตั้งค่าเสมอ */
      setTheme: (themeKey) => setState(s => ({
        ...s,
        themeKey,
        loginBg: syncLoginBg(s.loginBg, themeKey),
      })),
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
