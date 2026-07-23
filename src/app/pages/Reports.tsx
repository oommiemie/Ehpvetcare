import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area, Legend,
} from "recharts";
import {
  FileSpreadsheet, Download,
  TrendingUp, TrendingDown, Users, Syringe, Pill,
  Stethoscope, Star, Heart, DollarSign, Activity,
  PawPrint, Award, Clock, BarChart3, PieChart as PieIcon, Crown, Target,
  Printer, CalendarRange,
} from "lucide-react";
import { PageMotion, PageItem } from "../components/PageMotion";
import { DateRangePickerModern } from "../components/DateRangePickerModern";
import { useLang } from "../contexts/LanguageContext";

/* ================================================================
   Mock Data
   ================================================================ */

const sickBySpecies = [
  { name: "สุนัข", cases: 142, pct: 42, color: "var(--brand)" },
  { name: "แมว", cases: 98, pct: 29, color: "#3b82f6" },
  { name: "กระต่าย", cases: 38, pct: 11, color: "#f59e0b" },
  { name: "นก", cases: 28, pct: 8, color: "#8b5cf6" },
  { name: "สัตว์เลื้อยคลาน", cases: 18, pct: 5, color: "#ef4444" },
  { name: "อื่น·", cases: 16, pct: 5, color: "#9ca3af" },
];
const sickByDiagnosis = [
  { name: "ลำไส้อักเสบ", dog: 32, cat: 18, rabbit: 8, bird: 4, other: 3 },
  { name: "ผิวหนังอักเสบ", dog: 28, cat: 22, rabbit: 5, bird: 2, other: 2 },
  { name: "ติดเชื้อทางเดินหายใจ", dog: 22, cat: 15, rabbit: 6, bird: 8, other: 3 },
  { name: "กระดูก/ข้อ", dog: 18, cat: 8, rabbit: 4, bird: 1, other: 2 },
  { name: "ไต/ทางเดินปัสสาวะ", dog: 12, cat: 20, rabbit: 3, bird: 2, other: 1 },
  { name: "หัวใจ", dog: 15, cat: 5, rabbit: 2, bird: 3, other: 1 },
  { name: "โรคอื่น·", dog: 15, cat: 10, rabbit: 10, bird: 10, other: 4 },
];
const sickTrend = [
  { month: "ต.ค.", total: 48 }, { month: "พ.ย.", total: 55 }, { month: "ธ.ค.", total: 62 },
  { month: "ม.ค.", total: 58 }, { month: "ก.พ.", total: 65 }, { month: "มี.ค.", total: 52 },
];

const vaccineData = [
  { name: "พิษสุนัขบ้า", count: 210, pct: 35, color: "var(--brand)" },
  { name: "DHPP (5 โรค)", count: 168, pct: 28, color: "#3b82f6" },
  { name: "FVRCP (แมว)", count: 108, pct: 18, color: "#f59e0b" },
  { name: "FeLV", count: 60, pct: 10, color: "#8b5cf6" },
  { name: "Bordetella", count: 30, pct: 5, color: "#ef4444" },
  { name: "อื่น·", count: 24, pct: 4, color: "#9ca3af" },
];
const vaccineTrend = [
  { month: "ต.ค.", count: 82 }, { month: "พ.ย.", count: 95 }, { month: "ธ.ค.", count: 110 },
  { month: "ม.ค.", count: 105 }, { month: "ก.พ.", count: 120 }, { month: "มี.ค.", count: 88 },
];
const vaccineUpcoming = [
  { pet: "บัดดี้", owner: "สมศักดิ์ ใจดี", vaccine: "DHPP", dueDate: "14 ก.ค. 2569", species: "สุนัข" },
  { pet: "ลูน่า", owner: "วรรณา ศรีสุข", vaccine: "FVRCP", dueDate: "18 ก.ค. 2569", species: "แมว" },
  { pet: "แม็กซ์", owner: "ประพันธ์ มงคล", vaccine: "พิษสุนัขบ้า", dueDate: "25 ก.ค. 2569", species: "สุนัข" },
  { pet: "เบลล่า", owner: "ปรียาภรณ์ ทองดี", vaccine: "DHPP", dueDate: "3 ส.ค. 2569", species: "สุนัข" },
  { pet: "กะทิ", owner: "ชลธิชา อินทร์แก้ว", vaccine: "FVRCP", dueDate: "9 ส.ค. 2569", species: "แมว" },
];

const drugUsage = [
  { name: "Amoxicillin 250mg", qty: 1260, cost: 126000, category: "ยาปฏิชีวนะ" },
  { name: "Doxycycline 100mg", qty: 840, cost: 75600, category: "ยาปฏิชีวนะ" },
  { name: "Prednisolone 5mg", qty: 700, cost: 52500, category: "ยาสเตียรอยด์" },
  { name: "Metronidazole 200mg", qty: 560, cost: 44800, category: "ยาปฏิชีวนะ" },
  { name: "Omeprazole 20mg", qty: 480, cost: 38400, category: "ยาลดกรด" },
  { name: "Meloxicam 1.5mg", qty: 420, cost: 33600, category: "ยาแก้ปวด" },
  { name: "Cephalexin 500mg", qty: 380, cost: 30400, category: "ยาปฏิชีวนะ" },
  { name: "Ivermectin 12mg", qty: 320, cost: 25600, category: "ยาถ่ายพยาธิ" },
];
const drugByCategory = [
  { name: "ยาปฏิชีวนะ", value: 45, color: "var(--brand)" },
  { name: "ยาสเตียรอยด์", value: 15, color: "#3b82f6" },
  { name: "ยาแก้ปวด", value: 12, color: "#f59e0b" },
  { name: "ยาถ่ายพยาธิ", value: 10, color: "#8b5cf6" },
  { name: "ยาลดกรด", value: 8, color: "#ef4444" },
  { name: "อื่น·", value: 10, color: "#9ca3af" },
];
const drugTrend = [
  { month: "ต.ค.", expense: 380000 }, { month: "พ.ย.", expense: 420000 }, { month: "ธ.ค.", expense: 465000 },
  { month: "ม.ค.", expense: 440000 }, { month: "ก.พ.", expense: 490000 }, { month: "มี.ค.", expense: 415000 },
];

const plData = [
  { month: "ต.ค.", income: 980000, expense: 620000, profit: 360000 },
  { month: "พ.ย.", income: 1050000, expense: 680000, profit: 370000 },
  { month: "ธ.ค.", income: 1200000, expense: 740000, profit: 460000 },
  { month: "ม.ค.", income: 1120000, expense: 710000, profit: 410000 },
  { month: "ก.พ.", income: 1180000, expense: 720000, profit: 460000 },
  { month: "มี.ค.", income: 1250000, expense: 750000, profit: 500000 },
];
const expenseBreakdown = [
  { name: "ค่ายา/เวชภัณฑ์", value: 35, color: "var(--brand)" },
  { name: "เงินเดือน", value: 30, color: "#3b82f6" },
  { name: "ค่าเช่า/สาธารณูปโภค", value: 15, color: "#f59e0b" },
  { name: "อุปกรณ์การแพทย์", value: 10, color: "#8b5cf6" },
  { name: "การตลาด", value: 5, color: "#ef4444" },
  { name: "อื่น·", value: 5, color: "#9ca3af" },
];

const vetPerformance = [
  { name: "สพ.ว. สมชาย รักสัตว์", cases: 128, revenue: 420000, satisfaction: 4.8, specialty: "ศัลยกรรม", avgTime: 25, color: "var(--brand)" },
  { name: "สพ.ว. สุภา มีสุข", cases: 112, revenue: 380000, satisfaction: 4.7, specialty: "อายุรกรรม", avgTime: 22, color: "#3b82f6" },
  { name: "สพ.ว. วรรณา ใจดี", cases: 98, revenue: 340000, satisfaction: 4.9, specialty: "ทันตกรรม", avgTime: 28, color: "#f59e0b" },
  { name: "สพ.ว. ปรีชา เก่งกล้า", cases: 85, revenue: 290000, satisfaction: 4.6, specialty: "จักษุ", avgTime: 20, color: "#8b5cf6" },
];
const vetCasesTrend = [
  { month: "ต.ค.", a: 18, b: 16, c: 14, d: 12 },
  { month: "พ.ย.", a: 20, b: 18, c: 15, d: 13 },
  { month: "ธ.ค.", a: 24, b: 20, c: 18, d: 15 },
  { month: "ม.ค.", a: 22, b: 19, c: 17, d: 14 },
  { month: "ก.พ.", a: 23, b: 21, c: 18, d: 16 },
  { month: "มี.ค.", a: 21, b: 18, c: 16, d: 15 },
];
const vetNames = ["สมชาย", "สุภา", "วรรณา", "ปรีชา"];

const topCustomers = [
  { rank: 1, name: "ประพันธ์ มงคล", pets: 2, visits: 41, spending: 112000, since: "2566", phone: "062-111-2233" },
  { rank: 2, name: "ธีรพล วงศ์สุวรรณ", pets: 2, visits: 33, spending: 89000, since: "2566", phone: "085-777-8899" },
  { rank: 3, name: "สมศักดิ์ ใจดี", pets: 2, visits: 24, spending: 64000, since: "2567", phone: "081-234-5678" },
  { rank: 4, name: "รัตนา จันทร์เพ็ญ", pets: 2, visits: 15, spending: 41000, since: "2567", phone: "086-321-9900" },
  { rank: 5, name: "วรรณา ศรีสุข", pets: 2, visits: 14, spending: 37000, since: "2567", phone: "089-876-5432" },
  { rank: 6, name: "อนันต์ ศรีวิไล", pets: 2, visits: 13, spending: 34000, since: "2567", phone: "089-234-1122" },
  { rank: 7, name: "ปรียาภรณ์ ทองดี", pets: 2, visits: 9, spending: 24000, since: "2567", phone: "094-321-6543" },
  { rank: 8, name: "กิตติพงษ์ วงษ์ทอง", pets: 2, visits: 5, spending: 14000, since: "2567", phone: "086-447-2211" },
];
const customerRetention = [
  { month: "ต.ค.", old: 65, newc: 18 },
  { month: "พ.ย.", old: 70, newc: 22 },
  { month: "ธ.ค.", old: 75, newc: 28 },
  { month: "ม.ค.", old: 72, newc: 25 },
  { month: "ก.พ.", old: 78, newc: 20 },
  { month: "มี.ค.", old: 80, newc: 15 },
];

/* ================================================================
   Shared helpers
   ================================================================ */

/** Make gradient stops — prefix must be the gradient's id to guarantee globally unique keys */
function makeStops(color0: string, color1: string, op0 = 1, op1 = 1, prefix = "g") {
  return [
    <stop key={prefix + "_s0"} offset="0%"   stopColor={color0} stopOpacity={op0} />,
    <stop key={prefix + "_s1"} offset="100%" stopColor={color1} stopOpacity={op1} />,
  ];
}

const TIME_RANGES = ["รายวัน", "รายเดือน", "รายปี"] as const;
type TimeRange = (typeof TIME_RANGES)[number] | "custom";

function pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function fmtThaiShort(s: string): string {
  if (!s) return "";
  const MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const [y, m, d] = s.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y + 543}`;
}

/* ================================================================
   Export Utilities
   ================================================================ */

function getDateRangeLabel(timeRange: TimeRange, customStart: string, customEnd: string): string {
  if (timeRange === "custom" && customStart && customEnd) {
    return `${fmtThaiShort(customStart)} – ${fmtThaiShort(customEnd)}`;
  }
  const labels: Record<string, string> = {
    "รายวัน": "วันนี้",
    "รายสัปดาห์": "สัปดาห์นี้",
    "รายเดือน": "เดือนนี้",
    "รายปี": "ปีนี้",
  };
  return labels[timeRange as string] || "ทั้งหมด";
}

// ── Excel export ─────────────────────────────────────────────────
function exportExcel(reportKey: string, timeRange: TimeRange, customStart: string, customEnd: string) {
  const wb = XLSX.utils.book_new();
  const period = getDateRangeLabel(timeRange, customStart, customEnd);
  const dateNow = new Date().toLocaleDateString("th-TH");

  if (reportKey === "sick") {
    // Sheet 1: by species
    const ws1 = XLSX.utils.json_to_sheet(
      sickBySpecies.map(r => ({
        "ประเภทสัตว์": r.name,
        "จำนวนเคส": r.cases,
        "สัดส่วน (%)": r.pct,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws1, "สัตว์ป่วยตามประเภท");
    // Sheet 2: by diagnosis
    const ws2 = XLSX.utils.json_to_sheet(
      sickByDiagnosis.map(r => ({
        "โรค/อาการ": r.name,
        "สุนัข": r.dog,
        "แมว": r.cat,
        "กระต่าย": r.rabbit,
        "นก": r.bird,
        "อื่น·": r.other,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws2, "โรคตามประเภทสัตว์");
    // Sheet 3: trend
    const ws3 = XLSX.utils.json_to_sheet(sickTrend.map(r => ({ "เดือน": r.month, "จำนวนเคส": r.total })));
    XLSX.utils.book_append_sheet(wb, ws3, "แนวโน้มรายเดือน");

  } else if (reportKey === "vaccine") {
    const ws1 = XLSX.utils.json_to_sheet(
      vaccineData.map(r => ({
        "ชื่อวัคซีน": r.name,
        "จำนวน (โดส)": r.count,
        "สัดส่วน (%)": r.pct,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws1, "สัดส่วนวัคซีน");
    const ws2 = XLSX.utils.json_to_sheet(
      vaccineUpcoming.map(r => ({
        "ชื่อสัตว์": r.pet,
        "ประเภท": r.species,
        "เจ้าของ": r.owner,
        "วัคซีน": r.vaccine,
        "วันครบกำหนด": r.dueDate,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws2, "นัดวัคซีนใกล้ครบกำหนด");
    const ws3 = XLSX.utils.json_to_sheet(vaccineTrend.map(r => ({ "เดือน": r.month, "จำนวนโดส": r.count })));
    XLSX.utils.book_append_sheet(wb, ws3, "แนวโน้มการฉีด");

  } else if (reportKey === "drug") {
    const ws1 = XLSX.utils.json_to_sheet(
      drugUsage.map((r, i) => ({
        "#": i + 1,
        "ชื่อยา": r.name,
        "หมวดหมู่": r.category,
        "จำนวน (หน่วย)": r.qty,
        "มูลค่า (฿)": r.cost,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws1, "ยาที่ใช้สูงสุด");
    const ws2 = XLSX.utils.json_to_sheet(drugByCategory.map(r => ({ "หมวดหมู่": r.name, "สัดส่วน (%)": r.value })));
    XLSX.utils.book_append_sheet(wb, ws2, "แยกตามหมวดหมู่");
    const ws3 = XLSX.utils.json_to_sheet(drugTrend.map(r => ({ "เดือน": r.month, "ค่าใช้จ่าย (฿)": r.expense })));
    XLSX.utils.book_append_sheet(wb, ws3, "แนวโน้มค่าใช้จ่าย");

  } else if (reportKey === "pl") {
    const ws1 = XLSX.utils.json_to_sheet(
      plData.map(r => ({
        "เดือน": r.month,
        "รายรับ (฿)": r.income,
        "รายจ่าย (฿)": r.expense,
        "กำไร (฿)": r.profit,
        "อัตรากำไร (%)": ((r.profit / r.income) * 100).toFixed(1),
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws1, "กำไรขาดทุน");
    const ws2 = XLSX.utils.json_to_sheet(expenseBreakdown.map(r => ({ "หมวดรายจ่าย": r.name, "สัดส่วน (%)": r.value })));
    XLSX.utils.book_append_sheet(wb, ws2, "สัดส่วนรายจ่าย");

  } else if (reportKey === "vet") {
    const ws1 = XLSX.utils.json_to_sheet(
      vetPerformance.map(r => ({
        "ชื่อสัตวแพทย์": r.name,
        "ความชำนาญ": r.specialty,
        "จำนวนเคส": r.cases,
        "รายได้ (฿)": r.revenue,
        "คะแนนความพึงพอใจ": r.satisfaction,
        "เวลาเฉลี่ย (นาที)": r.avgTime,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws1, "ประสิทธิภาพสัตวแพทย์");

  } else if (reportKey === "customer") {
    const ws1 = XLSX.utils.json_to_sheet(
      topCustomers.map(r => ({
        "อันดับ": r.rank,
        "ชื่อลูกค้า": r.name,
        "เบอร์โทรศัพท์": r.phone,
        "จำนวนสัตว์เลี้ยง": r.pets,
        "จำนวนเข้ารับบริการ": r.visits,
        "ยอดใช้จ่าย (฿)": r.spending,
        "ลูกค้าตั้งแต่ พ.ศ.": r.since,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws1, "ลูกค้าประจำ");
    const ws2 = XLSX.utils.json_to_sheet(
      customerRetention.map(r => ({ "เดือน": r.month, "ลูกค้าเก่า": r.old, "ลูกค้าใหม่": r.newc }))
    );
    XLSX.utils.book_append_sheet(wb, ws2, "การเติบโตของลูกค้า");
  }

  // Add metadata sheet
  const metaWs = XLSX.utils.aoa_to_sheet([
    ["รายงานคลินิกสัตวแพทย์"],
    ["ช่วงเวลา:", period],
    ["วันที่ส่งออก:", dateNow],
  ]);
  XLSX.utils.book_append_sheet(wb, metaWs, "ข้อมูล");

  const today = new Date();
  const fileName = `รายงาน_${reportKey}_${today.getFullYear()}${pad2(today.getMonth()+1)}${pad2(today.getDate())}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ── PDF (print-to-PDF) ───────────────────────────────────────────
function exportPDF(reportTitle: string) {
  const prev = document.title;
  document.title = `รายงาน — ${reportTitle}`;
  const style = document.createElement("style");
  style.id = "__rpt_print_css";
  style.textContent = `
    @media print {
      aside,
      [data-no-print],
      button[data-no-print] { display: none !important; }
      .no-print { display: none !important; }
      main { padding: 0 !important; overflow: visible !important; }
      body { background: #fff !important; }
      .vet-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
      @page { margin: 14mm; size: A4; }
    }
  `;
  document.head.appendChild(style);
  window.onafterprint = () => {
    document.querySelector("#__rpt_print_css")?.remove();
    document.title = prev;
    (window as Window).onafterprint = null;
  };
  setTimeout(() => window.print(), 80);
}

/* ================================================================
   Shared visual components
   ================================================================ */

function StatCard({ label, value, change, gradient, shadow, icon: Icon }: {
  label: string; value: string; change: string; gradient: string; shadow: string; icon: React.ElementType;
}) {
  const isUp = change.startsWith("+");
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{ background: gradient, boxShadow: shadow }}>
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle,rgba(255,255,255,0.07) 0%,transparent 70%)" }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
            <Icon className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="flex items-center gap-0.5 text-[11px] text-white/80" style={{ fontWeight: 600 }}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {change}
          </span>
        </div>
        <p className="text-white/70 text-[12px] mb-1" style={{ fontWeight: 500 }}>{label}</p>
        <p className="text-white text-[20px]" style={{ fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"vet-card " + className}>
      <p className="text-[14px] text-gray-800 mb-4" style={{ fontWeight: 600 }}>{title}</p>
      {children}
    </div>
  );
}

const tooltipStyle = {
  background: "#fff", borderRadius: 14, border: "none",
  boxShadow: "0 8px 32px rgba(0,0,0,0.13)", padding: "10px 16px", fontSize: "calc(12px * var(--fs))",
};

const customLegend = ({ payload }: any) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3">
    {payload?.map((e: any) => (
      <span key={e.value} className="flex items-center gap-1.5 text-xs text-gray-600">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />{e.value}
      </span>
    ))}
  </div>
);

/* ================================================================
   Pie Gradient configs
   ================================================================ */
const SP_GRADS: [string, string][] = [
  ["#4dd4b0", "#0d6e5a"], ["#80cae8", "#226f9a"], ["#fcd07e", "#b87206"],
  ["#c4aafb", "#6925d4"], ["#f87171", "#b91c1c"], ["#c8d0da", "#64748b"],
];
const DRUG_GRADS: [string, string, string][] = [
  ["dg0", "var(--brand)", "var(--brand-dark)"], ["dg1", "#3b82f6", "#1d4ed8"],
  ["dg2", "#f59e0b", "#d97706"], ["dg3", "#8b5cf6", "#6d28d9"],
  ["dg4", "#ef4444", "#dc2626"], ["dg5", "#9ca3af", "#6b7280"],
];
const DIAG_GRADS: [string, string, string][] = [
  ["diagDog", "#4dd4b0", "var(--brand-dark)"], ["diagCat", "#80cae8", "#1a6fa0"],
  ["diagRabbit", "#fcd07e", "#b87206"], ["diagBird", "#c4aafb", "#6925d4"],
  ["diagOther", "#c8d0da", "#64748b"],
];

/* ================================================================
   Reports
   ================================================================ */

function SickBySpeciesReport({ timeRange }: { timeRange: TimeRange }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sickBySpecies.map(s => (
          <div key={s.name} className="vet-card flex flex-col items-center text-center py-3 px-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `color-mix(in srgb, ${s.color} 9.4%, transparent)` }}>
              <PawPrint className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-[11px] text-gray-500 mb-0.5" style={{ fontWeight: 500 }}>{s.name}</p>
            <p className="text-[18px] text-gray-800" style={{ fontWeight: 700 }}>{s.cases}</p>
            <p className="text-[10px]" style={{ fontWeight: 600, color: s.color }}>{s.pct}%</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="สัดส่วนสัตว์ป่วยตามประเภท">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sickBySpecies} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="cases" nameKey="name" stroke="none" cornerRadius={6}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius: ir, outerRadius: or, index }: any) => {
                    const R = Math.PI / 180, r = ir + (or - ir) * 0.5;
                    const x = cx + r * Math.cos(-midAngle * R), y = cy + r * Math.sin(-midAngle * R);
                    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{ fontSize: "calc(11px * var(--fs))", fontWeight: 700 }}>{sickBySpecies[index].pct}%</text>;
                  }}>
                  {sickBySpecies.map((_, i) => <Cell key={"spCell" + i} fill={"url(#spGrad" + i + ")"} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "calc(11px * var(--fs))" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="แนวโน้มจำนวนเคส (6 เดือน)">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sickTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="total" stroke="var(--brand)" strokeWidth={2} fill="url(#gSick)" name="จำนวนเคส" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <ChartCard title="โรคที่พบบ่อยแยกตามประเภทสัตว์">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sickByDiagnosis} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
              <XAxis type="number" tick={false} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={120} />
              <Tooltip cursor={{ fill: "color-mix(in srgb, var(--brand) 6%, transparent)" }} contentStyle={{ ...tooltipStyle, padding: "8px 14px" }} labelStyle={{ fontWeight: 700, color: "#1e293b", marginBottom: 2 }} />
              <Legend wrapperStyle={{ fontSize: "calc(11px * var(--fs))", paddingTop: 8 }} iconType="circle" iconSize={8} />
              <Bar key="bar-dog" dataKey="dog" stackId="a" fill="url(#diagDog)" barSize={10} radius={[6, 0, 0, 6]} name="สุนัข" />
              <Bar key="bar-cat" dataKey="cat" stackId="a" fill="url(#diagCat)" barSize={10} name="แมว" />
              <Bar key="bar-rabbit" dataKey="rabbit" stackId="a" fill="url(#diagRabbit)" barSize={10} name="กระต่าย" />
              <Bar key="bar-bird" dataKey="bird" stackId="a" fill="url(#diagBird)" barSize={10} name="นก" />
              <Bar key="bar-other" dataKey="other" stackId="a" fill="url(#diagOther)" barSize={10} radius={[0, 6, 6, 0]} name="อื่น·" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

function VaccineReport({ timeRange }: { timeRange: TimeRange }) {
  const totalVacc = vaccineData.reduce((s, d) => s + d.count, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="วัคซีนทั้งหมด" value={totalVacc + " โดส"} change="+12.4%" gradient="linear-gradient(135deg,var(--brand),var(--brand-dark))" shadow="0 4px 14px color-mix(in srgb, var(--brand) 30%, transparent)" icon={Syringe} />
        <StatCard label="นัดหมายรอฉีด" value="23 ตัว" change="+5.2%" gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)" shadow="0 4px 14px rgba(59,130,246,0.3)" icon={Award} />
        <StatCard label="ครบกำหนดสัปดาห์นี้" value="8 ตัว" change="-2.1%" gradient="linear-gradient(135deg,#f59e0b,#d97706)" shadow="0 4px 14px rgba(245,158,11,0.3)" icon={Clock} />
        <StatCard label="เลยกำหนด" value="3 ตัว" change="-15%" gradient="linear-gradient(135deg,#ef4444,#dc2626)" shadow="0 4px 14px rgba(239,68,68,0.3)" icon={Activity} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="สัดส่วนวัคซีนที่ฉีด">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vaccineData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={4} dataKey="count" nameKey="name" stroke="none" cornerRadius={6}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                    const R = Math.PI / 180, r = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + r * Math.cos(-midAngle * R), y = cy + r * Math.sin(-midAngle * R);
                    const p = Math.round(percent * 100);
                    if (p < 5) return <text x={x} y={y} fill="transparent" />;
                    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 700 }}>{p}%</text>;
                  }}>
                  {vaccineData.map((_, i) => (
                    <Cell key={"vCell" + i} fill={`url(#vGrad${i})`} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend content={customLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="แนวโน้มการฉีดวัคซีน (6 เดือน)">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vaccineTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#gVacc)" name="จำนวน" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <ChartCard title="วัคซีนที่ใกล้ครบกำหนด (5 รายการถัดไป)">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["ชื่อสัตว์เลี้ยง", "ประเภท", "เจ้าของ", "วัคซีน", "วันครบกำหนด"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-[11px] text-gray-400" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vaccineUpcoming.map((v, i) => (
                <tr key={"vu" + i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-3" style={{ fontWeight: 600 }}>{v.pet}</td>
                  <td className="py-2.5 px-3 text-gray-500">{v.species}</td>
                  <td className="py-2.5 px-3 text-gray-500">{v.owner}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-600" style={{ fontWeight: 500 }}>
                      <Syringe className="w-3 h-3" /> {v.vaccine}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">{v.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

function DrugUsageReport({ timeRange }: { timeRange: TimeRange }) {
  const totalCost = drugUsage.reduce((s, d) => s + d.cost, 0);
  const totalQty = drugUsage.reduce((s, d) => s + d.qty, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="จ่ายยาทั้งหมด" value={totalQty.toLocaleString() + " รายการ"} change="+8.5%" gradient="linear-gradient(135deg,#e8802a,#d06a1a)" shadow="0 4px 14px rgba(232,128,42,0.3)" icon={Pill} />
        <StatCard label="มูลค่ายาที่ใช้" value={"฿" + (totalCost / 1000).toFixed(0) + "k"} change="+6.2%" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" shadow="0 4px 14px rgba(139,92,246,0.3)" icon={DollarSign} />
        <StatCard label="ชนิดยาที่ใช้" value="48 ชนิด" change="+3.1%" gradient="linear-gradient(135deg,var(--brand),var(--brand-dark))" shadow="0 4px 14px color-mix(in srgb, var(--brand) 30%, transparent)" icon={Activity} />
        <StatCard label="ยาใกล้หมดสต็อก" value="5 รายการ" change="+2" gradient="linear-gradient(135deg,#ef4444,#dc2626)" shadow="0 4px 14px rgba(239,68,68,0.3)" icon={TrendingDown} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="สัดส่วนการใช้ยาตามหมวดหมู่">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={drugByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={4} dataKey="value" nameKey="name" stroke="none" cornerRadius={6}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
                    const R = Math.PI / 180, r = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + r * Math.cos(-midAngle * R), y = cy + r * Math.sin(-midAngle * R);
                    if (value < 5) return <text x={x} y={y} fill="transparent" />;
                    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 700 }}>{value}%</text>;
                  }}>
                  {drugByCategory.map((_, i) => <Cell key={"dgCell" + i} fill={"url(#dg" + i + ")"} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v + "%", ""]} />
                <Legend content={customLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="แนวโน้มค่าใช้จ่ายยา (6 เดือน)">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drugTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => "฿" + (v / 1000).toFixed(0) + "k"} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => "฿" + v.toLocaleString()} />
                <Area type="monotone" dataKey="expense" stroke="#8b5cf6" strokeWidth={2} fill="url(#gDrug)" name="ค่าใช้จ่าย" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <ChartCard title="ยาที่ใช้มากที่สุด (Top 8)">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["#", "ชื่อยา", "หมวดหมู่", "จำนวน (หน่วย)", "มูลค่า (฿)"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-[11px] text-gray-400" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drugUsage.map((d, i) => (
                <tr key={"du" + i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-3 text-gray-400" style={{ fontWeight: 600 }}>{i + 1}</td>
                  <td className="py-2.5 px-3" style={{ fontWeight: 600 }}>{d.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-purple-50 text-purple-600" style={{ fontWeight: 500 }}>{d.category}</span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">{d.qty.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-gray-800" style={{ fontWeight: 600 }}>{"฿"}{d.cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

function ProfitLossReport({ timeRange }: { timeRange: TimeRange }) {
  const last = plData[plData.length - 1];
  const prev = plData[plData.length - 2];
  const pChange = (((last.profit - prev.profit) / prev.profit) * 100).toFixed(1);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="รายรับรวม" value={"฿" + (last.income / 1000).toFixed(0) + "k"} change="+5.9%" gradient="linear-gradient(135deg,var(--brand),var(--brand-dark))" shadow="0 4px 14px color-mix(in srgb, var(--brand) 30%, transparent)" icon={TrendingUp} />
        <StatCard label="รายจ่ายรวม" value={"฿" + (last.expense / 1000).toFixed(0) + "k"} change="+4.2%" gradient="linear-gradient(135deg,#ef4444,#dc2626)" shadow="0 4px 14px rgba(239,68,68,0.3)" icon={TrendingDown} />
        <StatCard label="กำไรสุทธิ์" value={"฿" + (last.profit / 1000).toFixed(0) + "k"} change={"+" + pChange + "%"} gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" shadow="0 4px 14px rgba(139,92,246,0.3)" icon={DollarSign} />
        <StatCard label="อัตรากำไร" value={((last.profit / last.income) * 100).toFixed(1) + "%"} change="+1.2%" gradient="linear-gradient(135deg,#f59e0b,#d97706)" shadow="0 4px 14px rgba(245,158,11,0.3)" icon={Target} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="รายรับ vs รายจ่าย (6 เดือน)" className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => "฿" + (v / 1000).toFixed(0) + "k"} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => "฿" + v.toLocaleString()} />
                <Legend wrapperStyle={{ fontSize: "calc(11px * var(--fs))" }} />
                <Bar dataKey="income" fill="url(#incomeGrad)" radius={[6, 6, 0, 0]} name="รายรับ" />
                <Bar dataKey="expense" fill="url(#expenseGrad)" radius={[6, 6, 0, 0]} name="รายจ่าย" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="สัดส่วนรายจ่าย">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name" stroke="none" cornerRadius={6}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                    const R = Math.PI / 180, r = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + r * Math.cos(-midAngle * R), y = cy + r * Math.sin(-midAngle * R);
                    const p = Math.round(percent * 100);
                    if (p < 5) return <text x={x} y={y} fill="transparent" />;
                    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 700 }}>{p}%</text>;
                  }}>
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={"exCell" + i} fill={`url(#exGrad${i})`} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => v + "%"} />
                <Legend wrapperStyle={{ fontSize: "calc(10px * var(--fs))" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <ChartCard title="แนวโน้มกำไรสุทธิ์ (6 เดือน)">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={plData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => "฿" + (v / 1000).toFixed(0) + "k"} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => "฿" + v.toLocaleString()} />
              <Area type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2} fill="url(#gProfit)" name="กำไร" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

function VetEfficiencyReport({ timeRange }: { timeRange: TimeRange }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {vetPerformance.map((vet) => (
          <div key={vet.name} className="vet-card relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full" style={{ background: "radial-gradient(circle," + vet.color + "15 0%,transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${vet.color} 9.4%, transparent)` }}>
                  <Stethoscope className="w-[16px] h-[16px]" style={{ color: vet.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{vet.name.replace("สพ.ว. ", "")}</p>
                  <p className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>{vet.specialty}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["เคส", String(vet.cases)],
                  ["เวลาเฉลี่ย", vet.avgTime + " นาที"],
                  ["รายได้", "฿" + (vet.revenue / 1000).toFixed(0) + "k"],
                  ["คะแนน", String(vet.satisfaction)],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>{lbl}</p>
                    <p className="text-[14px] text-gray-800" style={{ fontWeight: 700 }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="จำนวนเคสรายเดือนแยกตามสัตวแพทย์">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vetCasesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "calc(11px * var(--fs))" }} />
                {["a", "b", "c", "d"].map((k, i) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={vetPerformance[i].color} strokeWidth={2} dot={{ r: 4 }} name={vetNames[i]} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="รายได้ที่สร้างโดยสัตวแพทย์">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vetPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => "฿" + (v / 1000).toFixed(0) + "k"} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} tickFormatter={(v: string) => v.replace("สพ.ว. ", "")} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => "฿" + v.toLocaleString()} />
                <Bar dataKey="revenue" name="รายได้" radius={[0, 8, 8, 0]}>
                  {vetPerformance.map((_, i) => (
                    <Cell key={"vtCell" + i} fill={`url(#vtGrad${i})`} stroke="none" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function LoyalCustomersReport({ timeRange }: { timeRange: TimeRange }) {
  const totalVisits = topCustomers.reduce((s, c) => s + c.visits, 0);
  const totalSpending = topCustomers.reduce((s, c) => s + c.spending, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="ลูกค้าประจำ (Top)" value={topCustomers.length + " ราย"} change="+2" gradient="linear-gradient(135deg,var(--brand),var(--brand-dark))" shadow="0 4px 14px color-mix(in srgb, var(--brand) 30%, transparent)" icon={Crown} />
        <StatCard label="จำนวนเข้ารับบริการ" value={totalVisits + " ครั้ง"} change="+18%" gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)" shadow="0 4px 14px rgba(59,130,246,0.3)" icon={Users} />
        <StatCard label="ยอดใช้จ่ายรวม" value={"฿" + (totalSpending / 1000).toFixed(0) + "k"} change="+22%" gradient="linear-gradient(135deg,#e8802a,#d06a1a)" shadow="0 4px 14px rgba(232,128,42,0.3)" icon={DollarSign} />
        <StatCard label="อัตราลูกค้ากลับมาใช้" value="84%" change="+3.5%" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" shadow="0 4px 14px rgba(139,92,246,0.3)" icon={Heart} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="ลูกค้าเก่า vs ลูกค้าใหม่ (6 เดือน)" className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerRetention}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "calc(11px * var(--fs))" }} />
                <Bar dataKey="old" fill="url(#retGrad0)" radius={[6, 6, 0, 0]} name="ลูกค้าเก่า" />
                <Bar dataKey="newc" fill="url(#retGrad1)" radius={[6, 6, 0, 0]} name="ลูกค้าใหม่" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Top 5 ยอดใช้จ่าย">
          <div className="space-y-3">
            {topCustomers.slice(0, 5).map((c, i) => {
              const pct = (c.spending / topCustomers[0].spending) * 100;
              const medals = ["#FFD700", "#C0C0C0", "#CD7F32", "", ""];
              return (
                <div key={c.rank} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                    style={{ fontWeight: 700, background: i < 3 ? `color-mix(in srgb, ${medals[i]} 13.3%, transparent)` : "#f3f4f6", color: i < 3 ? medals[i] : "#9ca3af" }}>
                    {c.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-gray-700 truncate" style={{ fontWeight: 600 }}>{c.name}</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: pct + "%", background: i === 0 ? "var(--brand)" : i === 1 ? "#3b82f6" : i === 2 ? "#f59e0b" : "#9ca3af" }} />
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-600 flex-shrink-0" style={{ fontWeight: 600 }}>{"฿"}{c.spending.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
      <ChartCard title="รายชื่อลูกค้าประจำ">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["อันดับ", "ชื่อลูกค้า", "โทรศัพท์", "สัตว์เลี้ยง", "จำนวนเข้าใช้", "ยอดใช้จ่าย", "ลูกค้าตั้งแต่"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-[11px] text-gray-400" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCustomers.map(c => (
                <tr key={c.rank} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px]"
                      style={{ fontWeight: 700, background: c.rank <= 3 ? ["#FFD70022", "#C0C0C022", "#CD7F3222"][c.rank - 1] : "#f3f4f6", color: c.rank <= 3 ? ["#B8860B", "#808080", "#8B4513"][c.rank - 1] : "#9ca3af" }}>
                      {c.rank <= 3 ? <Award className="w-3.5 h-3.5" /> : c.rank}
                    </div>
                  </td>
                  <td className="py-2.5 px-3" style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="py-2.5 px-3 text-gray-500">{c.phone}</td>
                  <td className="py-2.5 px-3 text-gray-600">{c.pets} ตัว</td>
                  <td className="py-2.5 px-3 text-gray-600">{c.visits} ครั้ง</td>
                  <td className="py-2.5 px-3 text-gray-800" style={{ fontWeight: 600 }}>{"฿"}{c.spending.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-gray-400">พ.ศ. {c.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

/* ================================================================
   Tab config
   ================================================================ */

const MAIN_TABS = [
  { key: "general",   label: "รายงานทั่วไป",    icon: BarChart3 },
  { key: "executive", label: "รายงานเชิงบริหาร", icon: PieIcon },
] as const;
type MainTab = (typeof MAIN_TABS)[number]["key"];

const GENERAL_SUBS = [
  { key: "sick",    label: "สัตว์ป่วยตามประเภท", icon: Stethoscope },
  { key: "vaccine", label: "รายงานวัคซีน",  icon: Syringe },
  { key: "drug",    label: "การใช้ยา",           icon: Pill },
] as const;
type GeneralSub = (typeof GENERAL_SUBS)[number]["key"];

const EXEC_SUBS = [
  { key: "pl",       label: "กำไรขาดทุน",        icon: DollarSign },
  { key: "vet",      label: "ประสิทธิภาพสัตวแพทย์", icon: Award },
  { key: "customer", label: "ลูกค้าประจำ",    icon: Users },
] as const;
type ExecSub = (typeof EXEC_SUBS)[number]["key"];

/* ── Report title map ── */
const REPORT_TITLES: Record<string, string> = {
  sick:     "สัตว์ป่วยตามประเภท",
  vaccine:  "วัคซีน",
  drug:     "การใช้ยา",
  pl:       "กำไรขาดทุน",
  vet:      "ประสิทธิภาพสัตวแพทย์",
  customer: "ลูกค้าประจำ",
};

/* ================================================================
   Main export
   ================================================================ */

export function Reports() {
  const { t } = useLang();
  const [mainTab,    setMainTab]    = useState<MainTab>("general");
  const [generalSub, setGeneralSub] = useState<GeneralSub>("sick");
  const [execSub,    setExecSub]    = useState<ExecSub>("pl");
  const [timeRange,  setTimeRange]  = useState<TimeRange>("รายเดือน");
  const [customStart, setCustomStart] = useState("");
  const [customEnd,   setCustomEnd]   = useState("");

  const activeSubKey = mainTab === "general" ? generalSub : execSub;

  const handleTimeRangeClick = (tr: typeof TIME_RANGES[number]) => {
    setTimeRange(tr);
    setCustomStart("");
    setCustomEnd("");
  };

  const handleCustomRange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    if (start) setTimeRange("custom");
  };

  const handleExportExcel = () => {
    exportExcel(activeSubKey, timeRange, customStart, customEnd);
  };

  const handleExportPDF = () => {
    exportPDF(REPORT_TITLES[activeSubKey] || activeSubKey);
  };

  const rangeLabel = timeRange === "custom" && customStart && customEnd
    ? `${fmtThaiShort(customStart)} – ${fmtThaiShort(customEnd)}`
    : timeRange !== "custom"
      ? timeRange
      : "";

  return (
    <PageMotion className="p-4 sm:p-6 space-y-5">
      {/* ── Shared SVG gradient defs (outside recharts to avoid duplicate-key warnings) ── */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          {(["#4dd4b0","#4ecdc4","#60b8e8","#7b8fe8","#b48af5","#f0a0b8"] as string[]).map((light, i) => {
            const darks = ["var(--brand-dark)","#1a8a82","#1a7aad","#3a4fad","#6925d4","#c2507a"];
            return (
              <linearGradient key={`vGrad${i}`} id={`vGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={light} />
                <stop offset="100%" stopColor={darks[i]} />
              </linearGradient>
            );
          })}
          {(["#4dd4b0","#4ecdc4","#60b8e8","#7b8fe8","#b48af5","#f0a0b8"] as string[]).map((light, i) => {
            const darks = ["var(--brand-dark)","#1a8a82","#1a7aad","#3a4fad","#6925d4","#c2507a"];
            return (
              <linearGradient key={`exGrad${i}`} id={`exGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={light} />
                <stop offset="100%" stopColor={darks[i]} />
              </linearGradient>
            );
          })}
          {(["#4dd4b0","#4ecdc4","#60b8e8","#7b8fe8","#b48af5","#f0a0b8"] as string[]).map((light, i) => {
            const darks = ["var(--brand-dark)","#1a8a82","#1a7aad","#3a4fad","#6925d4","#c2507a"];
            return (
              <linearGradient key={`vtGrad${i}`} id={`vtGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={light} />
                <stop offset="100%" stopColor={darks[i]} />
              </linearGradient>
            );
          })}
          {SP_GRADS.map(([l, d], i) => (
            <linearGradient key={`spGrad${i}`} id={`spGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={l} /><stop offset="100%" stopColor={d} />
            </linearGradient>
          ))}
          {DIAG_GRADS.map(([id, l, d]) => (
            <linearGradient key={`diag_${id}`} id={id} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={l} /><stop offset="100%" stopColor={d} />
            </linearGradient>
          ))}
          {DRUG_GRADS.map(([id, l, d]) => (
            <linearGradient key={`drug_${id}`} id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={l} /><stop offset="100%" stopColor={d} />
            </linearGradient>
          ))}
          <linearGradient id="gSick" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gVacc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gDrug" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="retGrad0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" /><stop offset="100%" stopColor="var(--brand-dark)" />
          </linearGradient>
          <linearGradient id="retGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2ebfa3" /><stop offset="100%" stopColor="var(--brand-dark)" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Header ── */}
      <PageItem>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-[20px] text-gray-800" style={{ fontWeight: 700 }}>{t("reports.title")}</h1>
              <p className="text-[12px] text-gray-400" style={{ fontWeight: 400 }}>
                วิเคราะห์ข้อมูลคลินิกแบบเรียลไทม์
                {rangeLabel && (
                  null
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2" data-no-print>
            {/* Time range pills */}
            <div className="flex items-center bg-white rounded-full p-1"
              style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.10)" }}>
              {TIME_RANGES.map(tr => (
                <button key={tr} onClick={() => handleTimeRangeClick(tr)}
                  className={"px-4 py-1.5 text-[12px] rounded-full whitespace-nowrap transition-all " +
                    (timeRange === tr ? "bg-(--brand) text-white" : "text-[#6a7282] hover:text-gray-700")}
                  style={{ fontWeight: timeRange === tr ? 600 : 400 }}>
                  {tr}
                </button>
              ))}

            </div>

            {/* Export: Excel */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:border-green-300 hover:text-green-700 transition-all whitespace-nowrap"
              style={{ fontWeight: 500 }}
              title="ส่งออก Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-(--brand)" /> Excel
            </button>

            {/* Export: PDF */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:border-red-300 hover:text-red-600 transition-all whitespace-nowrap"
              style={{ fontWeight: 500 }}
              title="พิมพ์ / บันทึก PDF"
            >
              <Printer className="w-4 h-4 text-[#e74c3c]" /> PDF
            </button>
          </div>
        </div>
      </PageItem>

      {/* ── Sub-tabs ── */}
      <PageItem>
        <div className="flex flex-wrap items-center gap-2" data-no-print>
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {MAIN_TABS.map(t => {
              const Icon = t.icon, active = mainTab === t.key;
              return (
                <button key={t.key} onClick={() => setMainTab(t.key)}
                  className={"flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-full whitespace-nowrap transition-all " +
                    (active ? "bg-(--brand) text-white" : "text-[#6a7282] hover:text-gray-900 hover:bg-gray-200/60")}
                  style={{ fontWeight: active ? 600 : 400 }}>
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
          <div className="w-px h-6 bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {(mainTab === "general" ? GENERAL_SUBS : EXEC_SUBS).map(t => {
              const Icon = t.icon;
              const activeSub = mainTab === "general" ? generalSub : execSub;
              const active = activeSub === t.key;
              return (
                <button key={t.key}
                  onClick={() => mainTab === "general" ? setGeneralSub(t.key as GeneralSub) : setExecSub(t.key as ExecSub)}
                  className={"flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] rounded-full whitespace-nowrap transition-all " +
                    (active ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/60")}
                  style={{ fontWeight: active ? 600 : 400 }}>
                  <Icon className="w-3 h-3" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Active range badge (print-visible) */}
          {rangeLabel && (
            null
          )}
        </div>
      </PageItem>

      {/* ── Report content ── */}
      <PageItem>
        <motion.div
          key={mainTab + "-" + activeSubKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {mainTab === "general" && generalSub === "sick"    && <SickBySpeciesReport  timeRange={timeRange} />}
          {mainTab === "general" && generalSub === "vaccine" && <VaccineReport        timeRange={timeRange} />}
          {mainTab === "general" && generalSub === "drug"    && <DrugUsageReport      timeRange={timeRange} />}
          {mainTab === "executive" && execSub === "pl"       && <ProfitLossReport     timeRange={timeRange} />}
          {mainTab === "executive" && execSub === "vet"      && <VetEfficiencyReport  timeRange={timeRange} />}
          {mainTab === "executive" && execSub === "customer" && <LoyalCustomersReport timeRange={timeRange} />}
        </motion.div>
      </PageItem>
    </PageMotion>
  );
}
