import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLang, type Lang } from "../contexts/LanguageContext";

const OPTIONS: { value: Lang; flag: string; label: string; short: string }[] = [
  { value: "th", flag: "🇹🇭", label: "ไทย",     short: "TH" },
  { value: "en", flag: "🇬🇧", label: "English", short: "EN" },
];

/**
 * Compact language switcher pill. Default styling fits glassy / dark hero
 * backgrounds; pass `variant="light"` for cream/white surfaces.
 */
export function LanguagePicker({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find(o => o.value === lang)!;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isDark = variant === "dark";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] transition-colors"
        style={{
          background: isDark ? "rgba(255,255,255,0.14)" : "#ffffff",
          color: isDark ? "rgba(255,255,255,0.95)" : "#374151",
          border: isDark ? "1px solid rgba(255,255,255,0.22)" : "1px solid #e5e7eb",
          fontWeight: 600,
          backdropFilter: isDark ? "blur(8px)" : undefined,
          WebkitBackdropFilter: isDark ? "blur(8px)" : undefined,
        }}
        title="เปลี่ยนภาษา / Change language"
      >
        <Globe className="w-3 h-3 opacity-90" />
        <span style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 700 }}>{current.short}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl overflow-hidden p-1"
            style={{ width: 170, boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
          >
            {OPTIONS.map(o => {
              const active = lang === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { setLang(o.value); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left ${active ? "bg-(--brand)/8" : "hover:bg-gray-50"}`}
                >
                  <span className="text-base leading-none">{o.flag}</span>
                  <span className="text-[12.5px] flex-1" style={{ fontWeight: active ? 700 : 500, color: active ? "var(--brand-dark)" : "#374151" }}>{o.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-(--brand-dark)" strokeWidth={3} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
