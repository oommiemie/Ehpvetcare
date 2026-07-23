import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  Bed, Plus, ChevronRight, AlertTriangle, Shield, TrendingUp,
  Sparkles, ArrowUpRight, Stethoscope, Clock,
} from "lucide-react";
import { useIPD } from "../contexts/IPDContext";
import { useLang } from "../contexts/LanguageContext";
import heroAnimals from "@/assets/ipd hero.png";

const sevColor: Record<string, string> = {
  Critical: "#ef4444",
  Observation: "#f59e0b",
  Recovering: "#10b981",
  Isolation: "#8b5cf6",
};

const sevCfg: Record<string, { color: string; bg: string; grad: string; label: string }> = {
  Critical:    { color: "#ef4444", bg: "rgba(239,68,68,0.10)",  grad: "linear-gradient(135deg, #f87171, #dc2626)", label: "วิกฤต" },
  Observation: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", grad: "linear-gradient(135deg, #fbbf24, #d97706)", label: "เฝ้าระวัง" },
  Recovering:  { color: "#10b981", bg: "rgba(16,185,129,0.10)", grad: "linear-gradient(135deg, #34d399, #059669)", label: "ฟื้นฟู" },
  Isolation:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", label: "แยกโรค" },
};

const daysSince = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  return d < 1 ? "วันนี้" : `${d} วัน`;
};

export function IPDDashboard() {
  const navigate = useNavigate();
  const { admits, cages } = useIPD();
  const { t } = useLang();

  const activeAdmits = admits.filter(a => !a.dischargedAt);
  const totalCages = cages.length;
  const availableCages = cages.filter(c => c.status === "available").length;
  const occupiedCages = cages.filter(c => c.status === "occupied").length;
  const criticalCount = activeAdmits.filter(a => a.severity === "Critical").length;
  const totalRevenue = activeAdmits.reduce((s, a) => s + a.paid, 0);
  const outstandingBalance = activeAdmits.reduce((s, a) => s + (a.totalCharge - a.paid), 0);

  const wards = Array.from(new Set(cages.map(c => c.ward)));

  const kpis = [
    { label: "Admit ปัจจุบัน", value: `${activeAdmits.length} ราย`,           change: `${occupiedCages}/${totalCages} กรง`, icon: Bed,           color: "#0ea5e9", dark: "#0369a1", soft: "rgba(14,165,233,0.10)" },
    { label: "กรงว่าง",         value: `${availableCages} กรง`,          change: `${Math.round((availableCages/totalCages)*100)}%`, icon: Shield,        color: "var(--brand)", dark: "var(--brand-dark)", soft: "color-mix(in srgb, var(--brand) 10%, transparent)" },
    { label: "ผู้ป่วยวิกฤต",     value: `${criticalCount} ราย`,           change: criticalCount > 0 ? "ICU" : "ปกติ", icon: AlertTriangle, color: "#ef4444", dark: "#b91c1c", soft: "rgba(239,68,68,0.10)" },
    { label: "รายได้วันนี้",     value: `฿${totalRevenue.toLocaleString()}`, change: `ค้าง ฿${outstandingBalance.toLocaleString()}`, icon: TrendingUp,    color: "#8b5cf6", dark: "#6d28d9", soft: "rgba(139,92,246,0.10)" },
  ];

  return (
    <div className="p-4 space-y-4 min-h-full" style={{ background: "#FEFBF8" }}>
      {/* ── HERO ── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
            radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
            linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)
          `,
        }}
      >
        {/* Decorative layer */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Big animals photo — bottom-right */}
          <img
            src={heroAnimals}
            alt=""
            className="absolute hidden sm:block select-none"
            style={{
              right: -20,
              bottom: -10,
              width: 420,
              height: "auto",
              filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.30))",
              WebkitMaskImage: "radial-gradient(ellipse 75% 80% at 70% 60%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)",
              maskImage: "radial-gradient(ellipse 75% 80% at 70% 60%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)",
            }}
          />

          {/* Soft glow halo behind photo */}
          <div
            className="absolute hidden sm:block"
            style={{
              right: 40, bottom: 20, width: 360, height: 240,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(var(--brand-hero-accent), 0.30) 0%, transparent 65%)",
              filter: "blur(20px)",
            }}
          />

          {/* Ambient orbs */}
          <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)" }} />
          <div className="absolute -bottom-32 left-1/4 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)" }} />

          {/* Top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)" }} />

          {/* Decorative dot pattern — top-left */}
          <svg className="absolute top-3 left-3 opacity-25" width="60" height="60" viewBox="0 0 60 60" fill="none">
            <pattern id="ipdHeroDots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.8)" />
            </pattern>
            <rect width="60" height="60" fill="url(#ipdHeroDots)" />
          </svg>

          {/* Sparkle accents */}
          <div className="absolute" style={{ right: 380, top: 30, width: 4, height: 4, background: "rgba(255,255,255,0.85)", borderRadius: "50%", boxShadow: "0 0 8px rgba(255,255,255,0.7)" }} />
          <div className="absolute" style={{ right: 360, top: 64, width: 2, height: 2, background: "rgba(255,255,255,0.65)", borderRadius: "50%", boxShadow: "0 0 6px rgba(255,255,255,0.5)" }} />
        </div>

        <div className="relative p-4 flex flex-col gap-4">
          {/* Main: title + greeting */}
          <div className="flex flex-col gap-3 min-w-0 max-w-[60%]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/65" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                <Sparkles className="w-3 h-3" /> {t("ipd.dashboard.subtitle")}
              </div>
              <h1 className="flex items-center gap-2.5 flex-wrap" style={{ fontWeight: 700, fontSize: "calc(28px * var(--fs))", letterSpacing: "-0.6px", lineHeight: 1.15 }}>
                <span style={{ fontSize: "calc(30px * var(--fs))" }}>🏥</span>
                <span className="text-white">IPD</span>
                <span style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #d1fae5 50%, #fef3c7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Dashboard</span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/ipd/admit")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 text-white"
                style={{
                  background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
                  border: "1px solid var(--hero-btn-border)",
                  boxShadow: "var(--hero-btn-shadow)",
                  fontWeight: 600,
                  
                }}
              >
                <Plus className="w-3.5 h-3.5" /> Admit ใหม่
              </button>
              <button
                onClick={() => navigate("/ipd/ward")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] text-white hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontWeight: 600,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
                }}
              >
                <Stethoscope className="w-3.5 h-3.5" /> ดู Ward <ArrowUpRight className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </div>

          {/* KPI tiles — white cards on hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.map((m, i) => {
              const Ico = m.icon;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-3xl bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center relative text-white"
                      style={{
                        background: `linear-gradient(135deg, ${m.color} 0%, ${m.dark} 100%)`,
                        border: "1px solid rgba(255,255,255,0.22)",
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 3px 10px color-mix(in srgb, ${m.color} 33.3%, transparent)`,
                      }}
                    >
                      <Ico className="w-3.5 h-3.5" strokeWidth={2.4} />
                    </div>
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                      style={{ fontSize: "calc(10px * var(--fs))", fontWeight: 700, background: m.soft, color: m.color }}
                    >
                      {m.change}
                    </span>
                  </div>
                  <div className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(17px * var(--fs))", letterSpacing: "-0.3px", lineHeight: 1.1 }}>
                    {m.value}
                  </div>
                  <div className="text-gray-500" style={{ fontSize: "calc(10.5px * var(--fs))", letterSpacing: "0.2px", fontWeight: 500 }}>{m.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Cage Map */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>แผนผังกรง</h3>
          <span className="text-[11px] text-gray-500">คลิกกรงเพื่อเปิดบันทึก</span>
        </div>

        <div className="space-y-3">
          {wards.map(ward => {
            const wardCages = cages.filter(c => c.ward === ward);
            return (
              <div key={ward}>
                <div className="text-[11px] text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>{ward}</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {wardCages.map(cage => {
                    const admit = admits.find(a => a.id === cage.patientId);
                    const occupied = cage.status === "occupied" && admit;
                    const sevC = admit ? sevColor[admit.severity] : "#d1d5db";
                    return (
                      <button
                        key={cage.id}
                        onClick={() => admit && navigate(`/ipd/patient/${admit.id}`)}
                        disabled={!admit}
                        className="rounded-xl p-2 text-left transition-all hover:-translate-y-0.5 disabled:cursor-default"
                        style={{
                          background: occupied ? "#ffffff" : "#f9fafb",
                          border: `1.5px solid color-mix(in srgb, ${sevC} 25.1%, transparent)`,
                        }}
                      >
                        <div className="text-[11px] text-gray-700" style={{ fontWeight: 700 }}>{cage.id}</div>
                        {admit ? (
                          <div className="text-[11px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{admit.petName}</div>
                        ) : (
                          <div className="text-[10px] text-gray-400">{cage.status === "available" ? "ว่าง" : cage.status === "cleaning" ? "ล้าง" : "ปิด"}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Admits */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>ผู้ป่วย Admit ปัจจุบัน</h3>
          <button
            onClick={() => navigate("/ipd/ward")}
            className="ml-auto inline-flex items-center gap-1 text-[12px] text-(--brand-dark)"
            style={{ fontWeight: 600 }}
          >
            ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {admits.slice(0, 8).map(a => {
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
                  {/* Admit time — top-left */}
                  <span
                    className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] text-gray-700 bg-white/85 backdrop-blur-sm"
                    style={{ fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                  >
                    <Clock className="w-2.5 h-2.5 text-gray-500" /> {a.admitTime}
                  </span>
                  {/* Critical badge — top-right */}
                  {a.severity === "Critical" && (
                    <span
                      className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white"
                      style={{
                        background: sev.grad,
                        boxShadow: `0 2px 6px color-mix(in srgb, ${sev.color} 33.3%, transparent)`,
                        fontWeight: 600,
                      }}
                    >
                      <AlertTriangle className="w-2.5 h-2.5" /> วิกฤต
                    </span>
                  )}
                </div>

                {/* AVATAR — overlapping cover */}
                <div className="flex justify-center -mt-10 relative">
                  <div
                    className="rounded-full p-[3px]"
                    style={{ background: "#ffffff", boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}
                  >
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
                  <h3
                    className="text-gray-900 truncate"
                    style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))", letterSpacing: "-0.3px", lineHeight: 1.3, paddingBottom: 2 }}
                  >
                    {a.petName}
                  </h3>
                  <p className="text-gray-500 truncate" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 600, letterSpacing: "0.2px" }}>
                    {a.hn}
                  </p>
                  <div className="mt-1.5 flex justify-center">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] text-white"
                      style={{ background: sev.grad, boxShadow: `0 2px 6px color-mix(in srgb, ${sev.color} 33.3%, transparent)`, fontWeight: 600 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/85" /> {sev.label}
                    </span>
                  </div>
                </div>

                {/* Stats pill (3 cols) — ชนิดสัตว์ · กรง · Admit */}
                <div
                  className="mx-3 mt-3 grid grid-cols-3 rounded-2xl py-2"
                  style={{ background: "#f3f4f6" }}
                >
                  {[
                    { value: a.species, label: "ชนิดสัตว์" },
                    { value: a.cageId,  label: "กรง" },
                    { value: daysSince(a.admitDate), label: "Admit" },
                  ].map((s, idx) => (
                    <div key={idx} className="text-center relative px-1">
                      {idx > 0 && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-300/60" />}
                      <div className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(12.5px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.2 }}>{s.value}</div>
                      <div className="text-gray-500 mt-0.5" style={{ fontSize: "calc(10px * var(--fs))", fontWeight: 500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Owner + Doctor footer (2 cols) */}
                <div className="px-3 py-3 grid grid-cols-2 gap-2">
                  <div className="text-center min-w-0">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>เจ้าของ</p>
                    <p className="text-[12px] text-gray-700 truncate mt-0.5" style={{ fontWeight: 600 }}>{a.owner}</p>
                  </div>
                  <div className="text-center min-w-0 relative">
                    <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200/80" />
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>แพทย์</p>
                    <p className="text-[12px] text-(--brand-dark) truncate mt-0.5" style={{ fontWeight: 600 }}>{a.doctor}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
