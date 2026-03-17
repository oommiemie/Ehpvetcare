import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  AreaChart, Area,
} from "recharts";
import {
  DollarSign, Users, Pill, TrendingUp, FileSpreadsheet,
  Download, Stethoscope, Link2, CalendarDays, AlertTriangle,
  ChevronRight, Activity,
} from "lucide-react";
import { useClinicData } from "../contexts/ClinicDataContext";

/* ── Mock Data ── */
const trendData = [
  { week: "สัปดาห์ 1", revenue: 270000, cost: 195000, profit: 95000 },
  { week: "สัปดาห์ 2", revenue: 278000, cost: 198000, profit: 98000 },
  { week: "สัปดาห์ 3", revenue: 295000, cost: 204000, profit: 107000 },
  { week: "สัปดาห์ 4", revenue: 315000, cost: 210000, profit: 115000 },
];

const revenueCategoryData = [
  { name: "ค่ายา",         value: 41, color: "#19a589" },
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

const speciesData = [
  { name: "สุนัข",          value: 50, color: "#19a589" },
  { name: "แมว",            value: 25, color: "#4BA8D5" },
  { name: "กระต่าย",        value: 12, color: "#F59E0B" },
  { name: "นก",             value: 8,  color: "#8B5CF6" },
  { name: "สัตว์เลื้อยคลาน", value: 5, color: "#9CA3AF" },
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
      style={{ fontSize: 12, fontWeight: 700 }}>
      {value}%
    </text>
  );
}

export function Dashboard() {
  const [period, setPeriod] = useState<"month" | "year">("month");
  const navigate = useNavigate();
  const { lowStockCount, outOfStockCount, stockProducts } = useClinicData();

  /* ── Today summary ── */
  const todayAppts   = 6;   // from Appointments day=17: 6 items
  const todayTypes   = { "การรักษา": 2, "วัคซีน": 2, "อาบน้ำ": 1, "ฝากเลี้ยง": 1 };
  const pendingBills = 2;   // INV-2026-0412 + INV-2026-0407
  const todayRevenue = 14_350;
  const lowStockItems = stockProducts.filter(p => p.type === "stock" && p.stock < p.minStock).slice(0, 2);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-full" style={{ background: "#FEFBF8" }}>

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
            ["#4dd4b0", "#0d7c66"],
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
            ["#fcd07e", "#b87206"],
            ["#c4aafb", "#6925d4"],
            ["c8d0da", "#64748b"],
          ].map(([light, dark], i) => (
            <linearGradient key={`spGrad${i}`} id={`spGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={light} />
              <stop offset="100%" stopColor={dark} />
            </linearGradient>
          ))}
          {/* Bar chart gradient */}
          <linearGradient key="barGrad" id="barGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4dd4b0" />
            <stop offset="100%" stopColor="#0d7c66" />
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

      {/* ── Header ── */}
      <motion.div
        className="flex items-start justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="text-gray-900 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <span>🌤️</span> สวัสดีตอนเช้า
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">ภาพรวมข้อมูลคลินิกของคุณ</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white/90 rounded-full p-1 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)]">
            {(["month", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 text-xs rounded-full transition-all ${
                  period === p
                    ? "bg-[#19a589] text-white"
                    : "text-[#6a7282]"
                }`}
                style={{ fontWeight: period === p ? 500 : 400, minWidth: 90 }}
              >
                {p === "month" ? "รายเดือน" : "รายปี"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-full bg-white hover:bg-gray-50 text-gray-600">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-full bg-white hover:bg-gray-50 text-gray-600">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
        }}
      >
        {[
          {
            label: "รายได้รวม", value: "฿1,250,000", change: "+6.3%",
            gradient: "linear-gradient(135deg, #19a589, #0d7c66)", shadow: "0 4px 14px rgba(25,165,137,0.3)",
            iconPath: "M19.9219 9.96094C19.9219 15.4492 15.459 19.9219 9.96094 19.9219C4.47266 19.9219 0 15.4492 0 9.96094C0 4.46289 4.47266 0 9.96094 0C15.459 0 19.9219 4.46289 19.9219 9.96094ZM9.62891 4.57031L9.62891 5.42969C8.14453 5.55664 6.88477 6.43555 6.88477 7.88086C6.88477 9.38477 8.14453 9.95117 9.38477 10.2441L9.62891 10.3125L9.62891 13.3594C8.75977 13.2812 8.14453 12.9102 7.83203 12.0605C7.70508 11.7578 7.53906 11.6211 7.26562 11.6211C6.97266 11.6211 6.72852 11.8262 6.72852 12.1484C6.72852 12.2559 6.74805 12.3535 6.78711 12.4707C7.13867 13.6816 8.4082 14.2578 9.62891 14.3555L9.62891 15.2344C9.62891 15.4102 9.77539 15.5664 9.96094 15.5664C10.1465 15.5664 10.293 15.4102 10.293 15.2344L10.293 14.3555C11.8652 14.2578 13.1934 13.4668 13.1934 11.8359C13.1934 10.3223 11.9727 9.73633 10.6055 9.41406L10.293 9.3457L10.293 6.42578C11.1133 6.51367 11.6895 6.93359 11.9336 7.68555C12.0312 7.98828 12.2266 8.14453 12.5 8.14453C12.7539 8.14453 13.0469 7.97852 13.0469 7.62695C13.0469 6.42578 11.6406 5.55664 10.293 5.42969L10.293 4.57031C10.293 4.39453 10.1465 4.23828 9.96094 4.23828C9.77539 4.23828 9.62891 4.39453 9.62891 4.57031ZM10.3906 10.4883C11.2695 10.7031 12.0703 11.0254 12.0703 11.9238C12.0703 12.9199 11.2109 13.3008 10.293 13.3691L10.293 10.459ZM9.62891 9.18945L9.56055 9.16992C8.7207 8.96484 8.01758 8.59375 8.01758 7.79297C8.01758 6.96289 8.79883 6.5332 9.62891 6.42578Z",
          },
          {
            label: "จำนวนเคส", value: "340 เคส", change: "+4.1%",
            gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)", shadow: "0 4px 14px rgba(59,130,246,0.3)",
            iconPath: "M19.9219 9.9707C19.9219 15.4688 15.459 19.9316 9.96094 19.9316C4.47266 19.9316 0 15.4688 0 9.9707C0 4.48242 4.47266 0.00976562 9.96094 0.00976562C15.459 0.00976562 19.9219 4.48242 19.9219 9.9707ZM3.33984 13.291C3.33984 13.7402 3.58398 13.9844 4.19922 13.9844L7.88827 13.9844C7.77042 13.7645 7.73438 13.5286 7.73438 13.3301C7.73438 12.5119 8.19387 11.6046 9.0107 10.8932C8.40949 10.5264 7.68105 10.3125 6.93359 10.3125C5.08789 10.3125 3.33984 11.6309 3.33984 13.291ZM8.44727 13.3301C8.44727 13.7598 8.73047 13.9844 9.50195 13.9844L15.6543 13.9844C16.4355 13.9844 16.6992 13.7598 16.6992 13.3301C16.6992 12.0605 15.127 10.332 12.5879 10.332C10.0391 10.332 8.44727 12.0605 8.44727 13.3301ZM5.22461 7.67578C5.22461 8.74023 6.02539 9.56055 6.93359 9.56055C7.85156 9.56055 8.64258 8.74023 8.64258 7.66602C8.64258 6.62109 7.85156 5.83984 6.93359 5.83984C6.03516 5.83984 5.22461 6.64062 5.22461 7.67578ZM10.625 7.28516C10.625 8.49609 11.5234 9.45312 12.5879 9.45312C13.6426 9.45312 14.541 8.49609 14.541 7.27539C14.541 6.07422 13.6328 5.17578 12.5879 5.17578C11.5234 5.17578 10.625 6.10352 10.625 7.28516Z",
          },
          {
            label: "ยอดขายยา", value: "฿515,000", change: "+7.8%",
            gradient: "linear-gradient(135deg, #e8802a, #d06a1a)", shadow: "0 4px 14px rgba(232,128,42,0.3)",
            iconPath: "M19.9219 9.9707C19.9219 15.4688 15.459 19.9316 9.96094 19.9316C4.47266 19.9316 0 15.4688 0 9.9707C0 4.48242 4.47266 0.00976562 9.96094 0.00976562C15.459 0.00976562 19.9219 4.48242 19.9219 9.9707ZM5.69336 10.4395C4.49219 11.6406 4.47266 13.1836 5.61523 14.3164C6.76758 15.4492 8.31055 15.4297 9.50195 14.2383L11.5723 12.1582L7.76367 8.35938ZM10.4102 5.70312L8.33984 7.77344L12.1484 11.5918L14.2285 9.51172C15.4395 8.31055 15.459 6.76758 14.2871 5.64453C13.125 4.50195 11.5918 4.49219 10.4102 5.70312Z",
          },
          {
            label: "กำไรสุทธิ", value: "฿735,000", change: "+9.2%",
            gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", shadow: "0 4px 14px rgba(139,92,246,0.3)",
            iconPath: "M19.9219 9.96094C19.9219 15.4492 15.459 19.9219 9.96094 19.9219C4.47266 19.9219 0 15.4492 0 9.96094C0 4.46289 4.47266 0 9.96094 0C15.459 0 19.9219 4.46289 19.9219 9.96094ZM8.25195 6.07422C7.77344 6.07422 7.4707 6.36719 7.4707 6.80664C7.4707 7.25586 7.7832 7.54883 8.27148 7.54883L10.0879 7.54883L11.6051 7.37067L10.0098 8.85742L6.31836 12.5488C6.16211 12.6953 6.07422 12.9004 6.07422 13.0957C6.07422 13.5547 6.36719 13.8477 6.80664 13.8477C7.05078 13.8477 7.24609 13.7598 7.39258 13.6133L11.0742 9.92188L12.5504 8.34614L12.3828 9.94141L12.3828 11.6699C12.3828 12.1484 12.6758 12.4609 13.1348 12.4609C13.5742 12.4609 13.8672 12.1191 13.8672 11.6504L13.8672 6.9043C13.8672 6.30859 13.5449 6.07422 13.0273 6.07422Z",
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            variants={{ hidden: { opacity: 0, y: 28, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-4 relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
            style={{ background: card.gradient, boxShadow: card.shadow }}
          >
            {/* Decorative radial glows */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />

            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                  <svg viewBox="0 0 20.2832 19.9316" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d={card.iconPath} fill="rgba(255,255,255,0.9)" />
                  </svg>
                </div>
                <span className="text-[11px] text-white/90 px-2.5 py-1 rounded-full" style={{ fontWeight: 600, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}>
                  ↑ {card.change}
                </span>
              </div>
              <div className="text-[11px] text-white/60 mb-1" style={{ fontWeight: 500, letterSpacing: "0.02em" }}>{card.label}</div>
              <div className="text-[26px] text-white" style={{ fontWeight: 800, lineHeight: 1 }}>{card.value}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── ภาพรวมรายได้ ── */}
      <motion.div {...fadeUp(0.32)}>
        <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700 }}>ภาพรวมรายได้</h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* เทรนด์รายได้ */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>เทรนด์รายได้</h3>
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
                    fontSize: 12,
                    padding: "10px 16px",
                    background: "#fff",
                  }}
                  labelStyle={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}
                  cursor={{ stroke: "#cbd5e1", strokeWidth: 1.5, strokeDasharray: "5 4" }}
                />
                <Line key="revenue" type="monotone" dataKey="revenue" stroke="#19a589" strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7, fill: "#19a589", stroke: "#fff", strokeWidth: 3, filter: "url(#lineGlow)" }}
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
              { color: "#19a589", label: "รายได้" },
              { color: "#F87171", label: "ต้นทุน" },
              { color: "#4BA8D5", label: "กำไร" },
            ]} />
          </div>

          {/* สัดส่วนรายได้ตามหมวดหมู่ */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>สัดส่วนรายได้ตามหมวดหมู่</h3>
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
                    fontSize: 12,
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
        </div>
      </motion.div>

      {/* ── รายงานยอดขาย ── */}
      <motion.div {...fadeUp(0.42)}>
        <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700 }}>รายงานยอดขาย</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Sub-summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 vet-border-b">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <svg viewBox="0 0 19.6745 19.3255" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5267 17.7731C3.59701 19.8337 6.4974 19.8532 8.79233 17.5583L17.5716 8.77898C19.8568 6.49383 19.8372 3.59344 17.7767 1.52312C15.7064-0.537422 12.806-0.547188 10.5208 1.73797L1.74154 10.5075C-0.553378 12.8024-0.533846 15.7028 1.5267 17.7731ZM2.56186 16.7477C1.08725 15.2829 1.27279 13.2321 2.86459 11.6208L11.6244 2.86102C13.2064 1.26922 15.2669 1.09344 16.7513 2.55828C18.2259 4.01336 18.0599 6.07391 16.4388 7.68523L7.68881 16.445C6.10678 18.027 4.03647 18.2126 2.56186 16.7477ZM6.26303 7.29461L12.0345 13.0661L13.0794 12.0212L7.29818 6.24969Z" fill="#F59E0B" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">ยอดขายยา</span>
              </div>
              <div className="text-lg" style={{ fontWeight: 700, color: "#F59E0B" }}>฿515,000</div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-teal-500" />
                </div>
                <span className="text-xs text-gray-500">ค่ารักษา</span>
              </div>
              <div className="text-lg" style={{ fontWeight: 700, color: "#14B8A6" }}>฿420,000</div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs text-gray-500">กำไร</span>
              </div>
              <div className="text-lg" style={{ fontWeight: 700, color: "#3B82F6" }}>฿735,000</div>
            </div>
          </div>

          {/* Table */}
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
                          row.id <= 6  ? "linear-gradient(135deg, #4dd4b0, #0d7c66)" :
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
      </motion.div>

      {/* ── วิเคราะห์ข้อมูล ── */}
      <motion.div {...fadeUp(0.52)}>
        <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700 }}>วิเคราะห์ข้อมูล</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ตามชนิดสัตว์ */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 600 }}>ตามชนิดสัตว์</h3>
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
                    fontSize: 12,
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

          {/* ตามโรค/การวินิจฉัย */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 600 }}>ตามโรค/การวินิจฉัย</h3>
            <ResponsiveContainer width="100%" height={230}>
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
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={88}
                />
                <Tooltip
                  key="barTooltip"
                  cursor={{ fill: "rgba(25,165,137,0.06)", rx: 6 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    fontSize: 12,
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
                  barSize={10}
                  label={{ position: "right", fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ตามช่วงเวลา */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 600 }}>ตามช่วงเวลา</h3>
            <ResponsiveContainer width="100%" height={230}>
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
                    fontSize: 12,
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

    </div>
  );
}