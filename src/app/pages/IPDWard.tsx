import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Bed, Search, Plus, Stethoscope, Clock, AlertTriangle,
  ChevronDown, Activity, Heart, Shield, Settings,
} from "lucide-react";
import { useIPD, type AdmitSeverity } from "../contexts/IPDContext";
import { useLang } from "../contexts/LanguageContext";
import { heroPillStyle, heroPillIconStyle, heroPillIconClass, heroPillClearStyle } from "../utils/heroFilter";

const sevCfg: Record<AdmitSeverity, { color: string; bg: string; grad: string; label: string }> = {
  Critical:    { color: "#ef4444", bg: "rgba(239,68,68,0.10)",  grad: "linear-gradient(135deg, #f87171, #dc2626)", label: "วิกฤต" },
  Observation: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", grad: "linear-gradient(135deg, #fbbf24, #d97706)", label: "เฝ้าระวัง" },
  Recovering:  { color: "#10b981", bg: "rgba(16,185,129,0.10)", grad: "linear-gradient(135deg, #34d399, #059669)", label: "ฟื้นฟู" },
  Isolation:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", label: "แยกโรค" },
};

type SevOption = {
  value: "all" | AdmitSeverity;
  label: string;
  icon: typeof Bed;
  color: string;
  grad: string;
};

const sevOptions: SevOption[] = [
  { value: "all",         label: "ทั้งหมด",   icon: Bed,           color: "#6b7280", grad: "linear-gradient(135deg, #9ca3af, #4b5563)" },
  { value: "Critical",    label: "วิกฤต",     icon: AlertTriangle, color: sevCfg.Critical.color,    grad: sevCfg.Critical.grad },
  { value: "Observation", label: "เฝ้าระวัง", icon: Activity,      color: sevCfg.Observation.color, grad: sevCfg.Observation.grad },
  { value: "Recovering",  label: "ฟื้นฟู",    icon: Heart,         color: sevCfg.Recovering.color,  grad: sevCfg.Recovering.grad },
  { value: "Isolation",   label: "แยกโรค",    icon: Shield,        color: sevCfg.Isolation.color,   grad: sevCfg.Isolation.grad },
];

const daysSince = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  return d < 1 ? "วันนี้" : `${d} วัน`;
};

export function IPDWard() {
  const navigate = useNavigate();
  const { admits } = useIPD();
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | AdmitSeverity>("all");
  const [showSevDropdown, setShowSevDropdown] = useState(false);
  const sevDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (sevDropdownRef.current && !sevDropdownRef.current.contains(e.target as Node)) {
        setShowSevDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const activeAdmits = useMemo(() => admits.filter(a => !a.dischargedAt), [admits]);
  const filtered = useMemo(() => {
    return activeAdmits.filter(a => {
      if (severity !== "all" && a.severity !== severity) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return a.petName.toLowerCase().includes(q) || a.hn.toLowerCase().includes(q) || a.cageId.toLowerCase().includes(q);
    });
  }, [activeAdmits, query, severity]);

  return (
    <div className="p-4 space-y-4 min-h-full" style={{ background: "#FEFBF8" }}>
      {/* HERO HEADER */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
              radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
              linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)
            `,
          }}
        >
          <div className="absolute -top-24 -right-16 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 65%)" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)" }} />
        </div>

        <div className="relative p-4 flex flex-col gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.30)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                {t("ipd.ward.title")}
              </h1>
              <p className="text-white/70" style={{ fontSize: 12, letterSpacing: "0.1px" }}>{filtered.length} / {activeAdmits.length} {t("common.records")}</p>
            </div>

            {/* Admit button — top-right like Stock */}
            <button
              onClick={() => navigate("/ipd/admit")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 flex-shrink-0 text-white"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                border: "1px solid rgba(253,186,116,0.85)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.15), 0 6px 22px rgba(234,88,12,0.65)",
                fontWeight: 600,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              <Plus className="w-3.5 h-3.5" /> {t("ipd.admitNew")}
            </button>
          </div>

          {/* Search + Severity filters + Admit button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("ipd.ward.search")}
                className="w-full pl-9 pr-3 py-2 text-[13px] rounded-full text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              />
            </div>

            <div className="relative" ref={sevDropdownRef}>
              {(() => {
                const activeOpt = sevOptions.find(o => o.value === severity) ?? sevOptions[0];
                const ActiveIcon = activeOpt.icon;
                const isFiltered = severity !== "all";
                return (
                  <button
                    onClick={() => setShowSevDropdown(v => !v)}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full text-[12.5px] transition-all hover:-translate-y-0.5"
                    style={heroPillStyle(isFiltered)}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={heroPillIconStyle(isFiltered, activeOpt.grad, activeOpt.color)}
                    >
                      <ActiveIcon className={heroPillIconClass(isFiltered)} strokeWidth={2.4} />
                    </span>
                    <span>{isFiltered ? activeOpt.label : t("ipd.ward.level")}</span>
                    {isFiltered && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setSeverity("all"); }}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] cursor-pointer transition-opacity hover:opacity-70"
                        style={heroPillClearStyle}
                      >×</span>
                    )}
                    <ChevronDown className={`w-3 h-3 transition-transform ${showSevDropdown ? "rotate-180" : ""}`} />
                  </button>
                );
              })()}

              <AnimatePresence>
                {showSevDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-2 min-w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl z-[60] overflow-hidden py-1"
                  >
                    {sevOptions.map(opt => {
                      const Icon = opt.icon;
                      const isActive = severity === opt.value;
                      const count = opt.value === "all"
                        ? activeAdmits.length
                        : activeAdmits.filter(a => a.severity === opt.value).length;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { setSeverity(opt.value); setShowSevDropdown(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive ? "bg-gray-50" : "hover:bg-gray-50"}`}
                          style={isActive ? { color: opt.color } : { color: "#374151" }}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "" : "bg-gray-100"}`}
                            style={isActive ? { background: `${opt.color}18` } : undefined}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color: isActive ? opt.color : "#6b7280" }} strokeWidth={2.2} />
                          </div>
                          <span style={{ fontWeight: isActive ? 600 : 400 }}>{opt.label}</span>
                          <span className="ml-auto text-[11px] text-gray-400" style={{ fontWeight: 500 }}>{count}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </motion.section>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Bed className="w-10 h-10 mb-2" strokeWidth={1.5} />
          <div className="text-[12px]" style={{ fontWeight: 600 }}>ไม่พบรายการ</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map(a => {
            const sev = sevCfg[a.severity];
            return (
              <motion.button
                key={a.id}
                whileTap={{ scale: 0.985 }}
                onClick={() => navigate(`/ipd/patient/${a.id}`)}
                className="group relative rounded-3xl overflow-hidden bg-white text-left transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
                }}
              >
                {/* COVER BANNER (blurred pet photo) */}
                <div className="relative h-20 overflow-hidden">
                  <img
                    src={a.photo}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "blur(18px) saturate(140%)", transform: "scale(1.3)" }}
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.50) 100%)" }} />
                  <span
                    className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] text-gray-700 bg-white/85 backdrop-blur-sm"
                    style={{ fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                  >
                    <Clock className="w-2.5 h-2.5 text-gray-500" /> {a.admitTime}
                  </span>
                  {a.severity === "Critical" && (
                    <span
                      className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white"
                      style={{ background: sev.grad, boxShadow: `0 2px 6px ${sev.color}55`, fontWeight: 600 }}
                    >
                      <AlertTriangle className="w-2.5 h-2.5" /> วิกฤต
                    </span>
                  )}
                </div>

                {/* AVATAR */}
                <div className="flex justify-center -mt-10 relative">
                  <div className="rounded-full p-[3px]" style={{ background: "#ffffff", boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}>
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-white p-[3px]">
                      <img
                        src={a.photo}
                        alt={a.petName}
                        className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>

                {/* Name + HN + severity pill */}
                <div className="text-center px-4 mt-2.5">
                  <h3 className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", lineHeight: 1.3, paddingBottom: 2 }}>
                    {a.petName}
                  </h3>
                  <p className="text-gray-500 truncate" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.2px" }}>
                    {a.hn}
                  </p>
                  <div className="mt-1.5 flex justify-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] text-white" style={{ background: sev.grad, boxShadow: `0 2px 6px ${sev.color}55`, fontWeight: 600 }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/85" /> {sev.label}
                    </span>
                  </div>
                </div>

                {/* Stats pill (3 cols) */}
                <div className="mx-3 mt-3 grid grid-cols-3 rounded-2xl py-2" style={{ background: "#f3f4f6" }}>
                  {[
                    { value: a.species, label: "ชนิดสัตว์" },
                    { value: a.cageId,  label: "กรง" },
                    { value: daysSince(a.admitDate), label: "Admit" },
                  ].map((s, idx) => (
                    <div key={idx} className="text-center relative px-1">
                      {idx > 0 && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-300/60" />}
                      <div className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: "-0.2px", lineHeight: 1.2 }}>{s.value}</div>
                      <div className="text-gray-500 mt-0.5" style={{ fontSize: 10, fontWeight: 500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Diagnosis row */}
                <div className="mx-3 mt-2 px-2.5 py-1.5 rounded-xl text-center" style={{ background: "rgba(13,124,102,0.05)", border: "1px solid rgba(13,124,102,0.10)" }}>
                  <span className="text-[11px] text-[#0d7c66] truncate block" style={{ fontWeight: 600 }} title={a.diagnosis}>{a.diagnosis}</span>
                </div>

                {/* Owner + Doctor footer */}
                <div className="px-3 py-3 grid grid-cols-2 gap-2">
                  <div className="text-center min-w-0">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>เจ้าของ</p>
                    <p className="text-[12px] text-gray-700 truncate mt-0.5" style={{ fontWeight: 600 }}>{a.owner}</p>
                  </div>
                  <div className="text-center min-w-0 relative">
                    <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200/80" />
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>แพทย์</p>
                    <p className="text-[12px] text-[#0d7c66] truncate mt-0.5" style={{ fontWeight: 600 }}>{a.doctor}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
