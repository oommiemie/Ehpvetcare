import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  AreaChart, Area,
} from "recharts";
import {
  TrendingUp, FileSpreadsheet, Download, Stethoscope,
  CalendarDays, AlertTriangle, Plus, Sparkles, ArrowUpRight, Sun,
  Users, Activity,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { QuickShortcuts } from "../components/QuickShortcuts";
import { useClinicData } from "../contexts/ClinicDataContext";

/* ── Hero decorative image ── */
import heroAnimals from "@/assets/hero1.png";

/* ── Mock Data ── */
const trendData = [
  { week: "สัปดาห์ 1", revenue: 270000, cost: 195000, profit: 95000 },
  { week: "สัปดาห์ 2", revenue: 278000, cost: 198000, profit: 98000 },
  { week: "สัปดาห์ 3", revenue: 295000, cost: 204000, profit: 107000 },
  { week: "สัปดาห์ 4", revenue: 315000, cost: 210000, profit: 115000 },
];

const revenueCategoryData = [
  { name: "ค่ายา",         value: 41, color: "var(--brand)" },
  { name: "ค่ารักษา",      value: 33, color: "#4BA8D5" },
  { name: "วัคซีน",        value: 7,  color: "#F59E0B" },
  { name: "Lab",           value: 12, color: "#EF4444" },
  { name: "อาบน้ำตัดขน",   value: 5,  color: "#8B5CF6" },
  { name: "อื่นๆ",         value: 2,  color: "#D1D5DB" },
];

const topSalesData = [
  { id: 1, name: "Amoxicillin 250mg",    qty: 1260, revenue: 126000 },
  { id: 2, name: "ตวจสุขภาพทั่วไป",     qty: 336,  revenue: 100800 },
  { id: 3, name: "วัคซีนพิษสุนัขบ้า",    qty: 224,  revenue: 89600  },
  { id: 4, name: "Doxycycline 100mg",    qty: 840,  revenue: 75600  },
  { id: 5, name: "ตรวจเลือด CBC",        qty: 280,  revenue: 70000  },
  { id: 6, name: "ทำหมันแมวตัวผู้",      qty: 84,   revenue: 67200  },
  { id: 7, name: "Prednisolone 5mg",     qty: 700,  revenue: 52500  },
  { id: 8, name: "อาบน้ำตัดขน (กลาง)",   qty: 168,  revenue: 50400  },
  { id: 9, name: "Metronidazole 200mg",  qty: 560,  revenue: 44800  },
  { id: 10, name: "วัคซีนรวม 5 โรค",    qty: 112,  revenue: 39200  },
];

/* สัดส่วนจริงจากทะเบียน 48 ตัว — value เป็น % (สุนัข 10, แมว 10, สัตว์เล็ก 10, นก 8, เลื้อยคลาน 5, ปลา 5) */
const speciesData = [
  { name: "สุนัข",               value: 21, color: "var(--brand)" }, // 10 ตัว
  { name: "แมว",                 value: 21, color: "#4BA8D5" }, // 10 ตัว
  { name: "สัตว์เลี้ยงขนาดเล็ก",  value: 21, color: "#8B5CF6" }, // 10 ตัว (หนู 3 + กระต่าย 4 + กระรอก 3)
  { name: "นก",                  value: 17, color: "#F59E0B" }, // 8 ตัว
  { name: "สัตว์เลื้อยคลาน",      value: 10, color: "#84CC16" }, // 5 ตัว
  { name: "ปลา",                 value: 10, color: "#EC4899" }, // 5 ตัว
];

const diseaseData = [
  { name: "ผิวหนัง",          cases: 95 },
  { name: "โรคเกี่ยวกับตา",   cases: 85 },
  { name: "พยาธิ",             cases: 75 },
  { name: "ปอดบวม",           cases: 55 },
  { name: "กระดูกหัก",        cases: 45 },
  { name: "โรคไต",            cases: 35 },
  { name: "เบาหวาน",          cases: 25 },
  { name: "โรคติดเชื้อ",      cases: 15 },
];

const timeData = [
  { time: "08:00", cases: 120 },
  { time: "09:00", cases: 95  },
  { time: "10:00", cases: 40  },
  { time: "11:00", cases: 28  },
  { time: "12:00", cases: 50  },
  { time: "13:00", cases: 70  },
  { time: "14:00", cases: 82  },
  { time: "15:00", cases: 68  },
  { time: "16:00", cases: 55  },
  { time: "17:00", cases: 60  },
  { time: "18:00", cases: 52  },
];

/* ── Helpers ── */
const fmtBaht  = (v: number) =>
  `฿${v.toLocaleString("th-TH")}`;
const fmtAxis  = (v: number) =>
  v >= 1000 ? `฿${(v / 1000).toFixed(0)}k` : `${v}`;

const greetingKeyByHour = (h: number): { key: string; icon: string } =>
  h < 12  ? { key: "greeting.morning",   icon: "🌅" }
  : h < 16 ? { key: "greeting.afternoon", icon: "🌤️" }
  : h < 19 ? { key: "greeting.evening",   icon: "🌇" }
  :          { key: "greeting.night",     icon: "🌙" };

const fmtDate = (d: Date, lang: "th" | "en") =>
  lang === "th"
    ? d.toLocaleDateString("th-TH-u-ca-buddhist", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

/* ── Custom Legend Dot (→ line) ── */
function LineLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-5 mt-3">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/* ── Donut Label (center) ── */
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (value < 5) return <text x={x} y={y} fill="transparent" />;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 700 }}>
      {value}%
    </text>
  );
}

export function Dashboard() {
  const [period, setPeriod] = useState<"month" | "year">("month");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, t } = useLang();
  const { lowStockCount, stockProducts } = useClinicData();

  /* ── Today summary ── */
  const todayAppts   = 6;
  const pendingBills = 2;
  const todayRevenue = 14_350;
  const lowStockItems = stockProducts.filter(p => p.type === "stock" && p.stock < p.minStock).slice(0, 2);

  const now = new Date();
  const greetingMeta = greetingKeyByHour(now.getHours());
  const greeting = { text: t(greetingMeta.key), icon: greetingMeta.icon };
  const todayText = fmtDate(now, lang);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <div className="p-4 space-y-4 min-h-full" style={{ background: "#FEFBF8" }}>

      {/* ── Shared SVG defs (gradients & filters) ── */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          {/* Line chart glow filter */}
          <filter key="lineGlow" id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Revenue category pie gradients */}
          {[
            ["#4dd4b0", "var(--brand-dark)"],
            ["#4ecdc4", "#1a8a82"],
            ["#60b8e8", "#1a7aad"],
            ["#7b8fe8", "#3a4fad"],
            ["b48af5", "#6925d4"],
            ["f0a0b8", "#c2507a"],
          ].map(([light, dark], i) => (
            <linearGradient key={`rcGrad${i}`} id={`rcGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={light} />
              <stop offset="100%" stopColor={dark} />
            </linearGradient>
          ))}
          {/* Species pie gradients */}
          {[
            ["#4dd4b0", "#0d6e5a"],
            ["#80cae8", "#226f9a"],
            ["#c4aafb", "#6925d4"],
            ["#fcd07e", "#b87206"],
            ["#b6e763", "#5a8f0d"],
            ["#f9a8d4", "#be1a6c"],
          ].map(([light, dark], i) => (
            <linearGradient key={`spGrad${i}`} id={`spGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={light} />
              <stop offset="100%" stopColor={dark} />
            </linearGradient>
          ))}
          {/* Bar chart gradient */}
          <linearGradient key="barGrad" id="barGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4dd4b0" />
            <stop offset="100%" stopColor="var(--brand-dark)" />
          </linearGradient>
          {/* Area chart gradients & filter */}
          <linearGradient key="timeGrad" id="timeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4BA8D5" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#4BA8D5" stopOpacity={0} />
          </linearGradient>
          <linearGradient key="timeStroke" id="timeStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7ec8e8" />
            <stop offset="100%" stopColor="#1a7aad" />
          </linearGradient>
          <filter key="areaGlow" id="areaGlow" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

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
        {/* Ambient decoration + animals photo bg */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Big animals photo — bottom-right corner with feathered edges */}
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
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 80% at 70% 60%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)",
              maskImage:
                "radial-gradient(ellipse 75% 80% at 70% 60%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)",
            }}
          />

          {/* Soft glow halo behind photo */}
          <div
            className="absolute hidden sm:block"
            style={{
              right: 40,
              bottom: 20,
              width: 360,
              height: 240,
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
            <pattern id="heroDots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.8)" />
            </pattern>
            <rect width="60" height="60" fill="url(#heroDots)" />
          </svg>

          {/* Sparkle accents */}
          <div
            className="absolute"
            style={{
              right: 380, top: 30, width: 4, height: 4,
              background: "rgba(255,255,255,0.85)",
              borderRadius: "50%",
              boxShadow: "0 0 8px rgba(255,255,255,0.7)",
            }}
          />
          <div
            className="absolute"
            style={{
              right: 360, top: 64, width: 2, height: 2,
              background: "rgba(255,255,255,0.65)",
              borderRadius: "50%",
              boxShadow: "0 0 6px rgba(255,255,255,0.5)",
            }}
          />
        </div>

        <div className="relative p-4 flex flex-col gap-4">
          {/* ─── Top bar: date + live indicator ─── */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-white/95"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.10))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                fontWeight: 500,
                letterSpacing: "0.3px",
                border: "1px solid rgba(255,255,255,0.20)",
              }}
            >
              <Sun className="w-3 h-3" /> {todayText}
            </span>
            <LanguagePicker variant="dark" />
          </div>

          {/* ─── Main: greeting only ─── */}
          <div className="flex flex-col gap-3 min-w-0 max-w-[60%]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/65" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                <Sparkles className="w-3 h-3" /> {t("welcome.back")}
              </div>
              <h1 className="flex items-center gap-2.5 flex-wrap" style={{ fontWeight: 700, fontSize: "calc(28px * var(--fs))", letterSpacing: "-0.6px", lineHeight: 1.15 }}>
                <span style={{ fontSize: "calc(30px * var(--fs))" }}>{greeting.icon}</span>
                <span className="text-white">{greeting.text},</span>
                <span style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #d1fae5 50%, #fef3c7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>{user?.displayName ?? t("vet.fallback")}</span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/visits")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                  color: "var(--brand-dark)",
                  fontWeight: 600,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.95)",
                }}
              >
                <Plus className="w-3.5 h-3.5" /> {t("dashboard.addCase")}
              </button>
              <button
                onClick={() => navigate("/appointments")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] text-white hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.24)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  fontWeight: 500,
                }}
              >
                <CalendarDays className="w-3.5 h-3.5" /> {t("dashboard.viewAppts")} <ArrowUpRight className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </div>

          {/* ─── Bottom band: 6 KPI tiles (white cards on green hero) ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: t("kpi.revenue"),     value: "฿1,250,000", change: "+6.3%",  icon: TrendingUp,    color: "var(--brand)", dark: "var(--brand-dark)", soft: "color-mix(in srgb, var(--brand) 10%, transparent)" },
              { label: t("kpi.cases"),       value: lang === "th" ? "340 เคส" : "340 cases", change: "+4.1%",  icon: Stethoscope,   color: "#3b82f6", dark: "#1d4ed8", soft: "rgba(59,130,246,0.10)" },
              { label: t("kpi.drugSales"),   value: "฿515,000",   change: "+7.8%",  icon: Sparkles,      color: "#e8802a", dark: "#c2611a", soft: "rgba(232,128,42,0.10)" },
              { label: t("kpi.profit"),      value: "฿735,000",   change: "+9.2%",  icon: ArrowUpRight,  color: "#8b5cf6", dark: "#6d28d9", soft: "rgba(139,92,246,0.10)" },
              { label: t("kpi.newClients"),  value: lang === "th" ? "24 คน" : "24 people", change: "+12.5%", icon: Users,         color: "#ec4899", dark: "#be185d", soft: "rgba(236,72,153,0.10)" },
              { label: t("kpi.avgPerCase"),  value: "฿3,676",     change: "+2.1%",  icon: Activity,      color: "#0ea5e9", dark: "#0369a1", soft: "rgba(14,165,233,0.10)" },
            ].map((m, i) => {
              const Ico = m.icon;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-3xl bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center relative text-white"
                      style={{
                        background: `linear-gradient(135deg, ${m.color} 0%, ${m.dark} 100%)`,
                        border: "1px solid rgba(255,255,255,0.22)",
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 3px 10px ${m.color}55`,
                      }}
                    >
                      <Ico className="w-3.5 h-3.5" strokeWidth={2.4} />
                    </div>
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                      style={{ fontSize: "calc(10px * var(--fs))", fontWeight: 700, background: m.soft, color: m.color }}
                    >
                      <ArrowUpRight className="w-2.5 h-2.5" />
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

      {/* ── เมนูลัด (ผู้ใช้เพิ่ม/ลบ/จัดลำดับเองได้) ── */}
      <motion.div {...fadeUp(0.28)}>
        <QuickShortcuts />
      </motion.div>

      {/* ── Row 1: Revenue trend + breakdown ── */}
      <motion.div {...fadeUp(0.36)} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* เทรนด์รายได้ */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800" style={{ fontWeight: 600 }}>{t("section.revenueTrend")}</h3>
              <span className="text-[11px] text-gray-400 px-2 py-0.5 rounded-full bg-gray-50" style={{ fontWeight: 500 }}>4 สัปดาห์ล่าสุด</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 10, right: 16, left: 5, bottom: 5 }}>
                <CartesianGrid key="grid" stroke="#F1F5F9" vertical={false} strokeDasharray="0" />
                <XAxis
                  key="xaxis"
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                  padding={{ left: 12, right: 12 }}
                />
                <YAxis
                  key="yaxis"
                  tickFormatter={fmtAxis}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                  domain={[0, 350000]}
                  ticks={[0, 85000, 170000, 255000, 340000]}
                  width={52}
                />
                <Tooltip
                  key="tooltip"
                  formatter={(v: number, name: string) => [fmtBaht(v), name]}
                  contentStyle={{
                    borderRadius: 14,
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                    fontSize: "calc(12px * var(--fs))",
                    padding: "10px 16px",
                    background: "#fff",
                  }}
                  labelStyle={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}
                  cursor={{ stroke: "#cbd5e1", strokeWidth: 1.5, strokeDasharray: "5 4" }}
                />
                <Line key="revenue" type="monotone" dataKey="revenue" stroke="var(--brand)" strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7, fill: "var(--brand)", stroke: "#fff", strokeWidth: 3, filter: "url(#lineGlow)" }}
                  name="รายได้"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <Line key="cost" type="monotone" dataKey="cost" stroke="#4BA8D5" strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7, fill: "#4BA8D5", stroke: "#fff", strokeWidth: 3, filter: "url(#lineGlow)" }}
                  name="ต้นทุน"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <Line key="profit" type="monotone" dataKey="profit" stroke="#F87171" strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7, fill: "#F87171", stroke: "#fff", strokeWidth: 3, filter: "url(#lineGlow)" }}
                  name="กำไร"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </LineChart>
            </ResponsiveContainer>
            <LineLegend items={[
              { color: "var(--brand)", label: "รายได้" },
              { color: "#F87171", label: "ต้นทุน" },
              { color: "#4BA8D5", label: "กำไร" },
            ]} />
          </div>

          {/* สัดส่วนรายได้ตามหมวดหมู่ */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>{t("section.revenueBreak")}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  key="rcPie"
                  data={revenueCategoryData}
                  cx="50%" cy="50%"
                  innerRadius={58} outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={DonutLabel}
                  cornerRadius={6}
                  stroke="none"
                >
                  {revenueCategoryData.map((_, i) => (
                    <Cell key={`rcCell${i}`} fill={`url(#rcGrad${i})`} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  key="rcTooltip"
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                  contentStyle={{
                    borderRadius: 14,
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                    fontSize: "calc(12px * var(--fs))",
                    padding: "10px 16px",
                    background: "#fff",
                  }}
                  itemStyle={{ color: "#374151" }}
                  labelStyle={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-1">
              {revenueCategoryData.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>
      </motion.div>

      {/* ── Row 2: Top sales + Species mix ── */}
      <motion.div {...fadeUp(0.46)} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-gray-800" style={{ fontWeight: 600 }}>{t("section.topSelling")}</h3>
            <span className="text-[11px] text-gray-400 px-2 py-0.5 rounded-full bg-gray-50" style={{ fontWeight: 500 }}>เดือนนี้</span>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-xs text-gray-400 vet-border-b">
                <th className="text-left px-5 py-3" style={{ fontWeight: 500 }}>#</th>
                <th className="text-left px-3 py-3" style={{ fontWeight: 500 }}>ชื่อรายการ</th>
                <th className="text-right px-3 py-3" style={{ fontWeight: 500 }}>จำนวน</th>
                <th className="text-right px-5 py-3" style={{ fontWeight: 500 }}>รายได้</th>
              </tr>
            </thead>
            <tbody>
              {topSalesData.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{
                        background:
                          row.id === 1 ? "linear-gradient(135deg, #FFD700, #F59E0B)" :
                          row.id === 2 ? "linear-gradient(135deg, #D1D5DB, #94A3B8)" :
                          row.id === 3 ? "linear-gradient(135deg, #FCA47A, #B45309)" :
                          row.id <= 6  ? "linear-gradient(135deg, color-mix(in srgb, var(--brand) 62%, white), var(--brand-dark))" :
                                         "linear-gradient(135deg, #93C5FD, #3B82F6)",
                        fontWeight: 600,
                        boxShadow: row.id <= 3 ? "0 2px 6px rgba(0,0,0,0.18)" : "none",
                      }}
                    >
                      {row.id}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-700">{row.name}</td>
                  <td className="px-3 py-3 text-right text-gray-500">{row.qty.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-gray-800" style={{ fontWeight: 600 }}>
                    ฿{row.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Right column: Species pie + Time area stacked */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 600 }}>{t("section.bySpecies")}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  key="spPie"
                  data={speciesData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={82}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={DonutLabel}
                  cornerRadius={6}
                  stroke="none"
                >
                  {speciesData.map((_, i) => (
                    <Cell key={`spCell${i}`} fill={`url(#spGrad${i})`} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  key="spTooltip"
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                  contentStyle={{
                    borderRadius: 14,
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                    fontSize: "calc(12px * var(--fs))",
                    padding: "10px 16px",
                    background: "#fff",
                  }}
                  itemStyle={{ color: "#374151" }}
                  labelStyle={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
              {speciesData.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          {/* Time area chart — stacked under species pie */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 600 }}>{t("section.byHour")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={timeData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid key="areaGrid" stroke="#F1F5F9" vertical={false} strokeDasharray="0" />
                <XAxis
                  key="areaXaxis"
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                  interval={2}
                  padding={{ left: 8, right: 8 }}
                />
                <YAxis
                  key="areaYaxis"
                  domain={[0, 130]}
                  ticks={[0, 30, 60, 90, 120]}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                  width={28}
                />
                <Tooltip
                  key="areaTooltip"
                  cursor={{ stroke: "#4BA8D5", strokeWidth: 1.5, strokeDasharray: "5 4" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    fontSize: "calc(12px * var(--fs))",
                    padding: "8px 14px",
                    background: "#fff",
                  }}
                  labelStyle={{ fontWeight: 700, color: "#1e293b", marginBottom: 2 }}
                  formatter={(v: number) => [v, "เคส"]}
                />
                <Area
                  key="areaCases"
                  type="monotoneX"
                  dataKey="cases"
                  stroke="url(#timeStroke)"
                  strokeWidth={2.5}
                  fill="url(#timeGrad)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#4BA8D5", stroke: "#fff", strokeWidth: 3, filter: "url(#areaGlow)" }}
                  name="เคส"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── Row 3: Disease bar (full width) ── */}
      <motion.div {...fadeUp(0.56)}>
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 mb-3" style={{ fontWeight: 600 }}>เคสตามโรค/การวินิจฉัย</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={diseaseData}
              layout="vertical"
              margin={{ top: 0, right: 48, left: 4, bottom: 0 }}
            >
              <XAxis
                key="barXaxis"
                type="number"
                domain={[0, 100]}
                tick={false}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                key="barYaxis"
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                key="barTooltip"
                cursor={{ fill: "color-mix(in srgb, var(--brand) 6%, transparent)", rx: 6 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  fontSize: "calc(12px * var(--fs))",
                  padding: "8px 14px",
                  background: "#fff",
                }}
                labelStyle={{ fontWeight: 700, color: "#1e293b", marginBottom: 2 }}
                formatter={(v: number) => [v, "เคส"]}
              />
              <Bar
                key="barCases"
                dataKey="cases"
                fill="url(#barGrad)"
                radius={[0, 6, 6, 0]}
                name="เคส"
                barSize={12}
                label={{ position: "right", fontSize: "calc(11px * var(--fs))", fill: "#94a3b8", fontWeight: 600 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}