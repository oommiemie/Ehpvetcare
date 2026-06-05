import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "th" | "en";

const STORAGE_KEY = "ehp-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Translation dictionary. Add a `th` and `en` entry per key.
 * Missing keys fall back to the key string itself.
 */
const dict: Record<string, Record<Lang, string>> = {
  // Dashboard hero
  "welcome.back":        { th: "ยินดีต้อนรับกลับมา",     en: "Welcome back" },
  "greeting.morning":    { th: "สวัสดีตอนเช้า",          en: "Good morning" },
  "greeting.afternoon":  { th: "สวัสดีตอนบ่าย",          en: "Good afternoon" },
  "greeting.evening":    { th: "สวัสดีตอนเย็น",          en: "Good evening" },
  "greeting.night":      { th: "สวัสดีตอนค่ำ",           en: "Good night" },
  "dashboard.addCase":   { th: "เพิ่มเคสใหม่",            en: "New case" },
  "dashboard.viewAppts": { th: "ดูนัด",                  en: "Appointments" },
  "vet.fallback":        { th: "สัตวแพทย์",              en: "Veterinarian" },

  // KPI labels
  "kpi.revenue":         { th: "รายได้รวม",              en: "Total revenue" },
  "kpi.cases":           { th: "จำนวนเคส",               en: "Cases" },
  "kpi.drugSales":       { th: "ยอดขายยา",               en: "Drug sales" },
  "kpi.profit":          { th: "กำไรสุทธิ",               en: "Net profit" },
  "kpi.newClients":      { th: "ลูกค้าใหม่",              en: "New clients" },
  "kpi.avgPerCase":      { th: "เฉลี่ย/เคส",              en: "Avg / case" },

  // Section titles
  "section.revenueTrend":   { th: "เทรนด์รายได้",          en: "Revenue trend" },
  "section.revenueBreak":   { th: "สัดส่วนรายได้",         en: "Revenue breakdown" },
  "section.topSelling":     { th: "รายการขายดี Top 10",   en: "Top 10 selling" },
  "section.bySpecies":      { th: "สัดส่วนตามชนิดสัตว์",   en: "Share by species" },
  "section.byHour":         { th: "เคสตามช่วงเวลา",       en: "Cases by hour" },

  // Common
  "lang.thai":           { th: "ไทย",                    en: "Thai" },
  "lang.english":        { th: "อังกฤษ",                 en: "English" },
};

function loadLang(): Lang {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "th" || raw === "en") return raw;
  } catch { /* ignore */ }
  return "th";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    document.documentElement.lang = lang === "th" ? "th-TH" : "en-US";
  }, [lang]);

  const t = (key: string) => dict[key]?.[lang] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
