import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Scissors, Camera, ChevronDown,
  ArrowLeft, CheckCircle2, Calendar, User, Clock,
  Ruler, Zap, Droplets, Sparkles, X, ChevronRight,
  Bell, Tag, Percent, Phone, MessageSquare, Edit2, Trash2,
  Check, Star,
} from "lucide-react";
import { DatePickerModern } from "../components/DatePickerModern";
import { TimePickerModern } from "../components/TimePickerModern";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useLang } from "../contexts/LanguageContext";
import { heroPillStyle } from "../utils/heroFilter";

/* ─────────────────────── Types & Mock Data ─────────────────────── */
interface GroomRecord {
  id: number;
  hn: string;
  pet: string;
  breed: string;
  owner: string;
  phone: string;
  animal: string;
  photo: string;
  date: string;
  groomer: string;
  services: string[];
  style: string;
  length: string;
  size: string;
  difficulty: string;
  price: number;
  note: string;
  status: "เสร็จสิ้น" | "กำลังดำเนินการ" | "รออนุมัติ";
  nextAppt: string;
  satisfaction?: number;       // 1–5 (post-service)
  photos?: string[];           // post-service upload (สูงสุด 4)
  nextApptInfo?: { date: string; time: string; service: string; channel: string; note: string; reminder: boolean };
}

const mockRecords: GroomRecord[] = [
  {
    id: 1, hn: "HN-2026-003",
    pet: "แม็กซ์", breed: "แบล็ก แลบราดอร์", owner: "ประพันธ์ มงคล", phone: "062-111-2233",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1608138498905-05b5cd816a36?w=400&q=80&auto=format&fit=crop",
    date: "5 ก.ค. 2569", groomer: "อรัญ สีลา",
    services: ["ตัดแต่งทั้งชุด", "บำบัดขนร่วง"],
    style: "พัพพี้คัท", length: "30 มม.", size: "ใหญ่ (20–35 กก.)", difficulty: "ปกติ",
    price: 1000, note: "น้องดีมาก ไม่กัด สยบตัวเร็ว",
    status: "เสร็จสิ้น", nextAppt: "5 ส.ค. 2569",
  },
  {
    id: 2, hn: "HN-2026-011",
    pet: "ลูน่า", breed: "เปอร์เซีย", owner: "วรรณา ศรีสุข", phone: "089-876-5432",
    animal: "🐈", photo: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&q=80&auto=format&fit=crop",
    date: "8 ก.ค. 2569", groomer: "ทอม ชาตรี",
    services: ["อาบน้ำพื้นฐาน", "ทำความสะอาดหู", "ตัดเล็บ"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ง่าย",
    price: 520, note: "ขนยาวมาก ใช้เวลาพิเศษ",
    status: "กำลังดำเนินการ", nextAppt: "—",
  },
  {
    id: 3, hn: "HN-2026-006",
    pet: "ป๊อบ", breed: "ปอมเมอเรเนียน", owner: "วิชัย มงคล", phone: "083-456-7890",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1703368786305-4e1dcfcfd0db?w=400&q=80&auto=format&fit=crop",
    date: "2 ก.ค. 2569", groomer: "อรัญ สีลา",
    services: ["ตัดแต่งทั้งชุด"],
    style: "เท็ดดี้แบร์", length: "20 มม.", size: "เล็กมาก (< 5 กก.)", difficulty: "ปกติ",
    price: 600, note: "",
    status: "เสร็จสิ้น", nextAppt: "2 ส.ค. 2569",
  },
  {
    id: 4, hn: "HN-2026-005",
    pet: "ชาร์ลี", breed: "บีเกิ้ล", owner: "ธีรพล วงศ์สุวรรณ", phone: "085-777-8899",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?w=400&q=80&auto=format&fit=crop",
    date: "29 มิ.ย. 2569", groomer: "ทอม ชาตรี",
    services: ["อาบน้ำพื้นฐาน", "แปรงฟัน"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ยาก",
    price: 450, note: "ดื้อตอนจับอุ้งเท้า ต้องใช้สองคน",
    status: "เสร็จสิ้น", nextAppt: "29 ก.ค. 2569",
  },
  {
    id: 5, hn: "HN-2026-013",
    pet: "มิ้ว", breed: "สก็อตติช โฟลด์", owner: "กัญญา สุวรรณ", phone: "091-678-9012",
    animal: "🐈", photo: "https://images.unsplash.com/photo-1719218214197-441901e981b7?w=400&q=80&auto=format&fit=crop",
    date: "26 มิ.ย. 2569", groomer: "อรัญ สีลา",
    services: ["อาบน้ำพื้นฐาน", "ตัดเล็บ", "ทำความสะอาดหู"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ง่าย",
    price: 520, note: "น่ารักมาก ชอบอาบน้ำ",
    status: "เสร็จสิ้น", nextAppt: "26 ก.ค. 2569",
  },
  {
    id: 6, hn: "HN-2026-008",
    pet: "โอเลี้ยง", breed: "ไทยหลังอาน", owner: "จิราพร บุญมาก", phone: "081-909-3344",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&q=80&auto=format&fit=crop",
    date: "9 ก.ค. 2569", groomer: "กมล วงศ์ดี",
    services: ["ตัดแต่งทั้งชุด", "บำบัดขนร่วง"],
    style: "ธรรมชาติ", length: "40 มม.", size: "ใหญ่ (20–35 กก.)", difficulty: "ปกติ",
    price: 1000, note: "นัดตอนบ่ายสอง รอยืนยันเจ้าของ",
    status: "รออนุมัติ", nextAppt: "—",
  },
  {
    id: 7, hn: "HN-2026-004",
    pet: "เบลล่า", breed: "ปอมเมอเรเนียน", owner: "ปรียาภรณ์ ทองดี", phone: "094-321-6543",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=80&auto=format&fit=crop",
    date: "10 ก.ค. 2569", groomer: "ทอม ชาตรี",
    services: ["อาบน้ำพื้นฐาน", "แปรงฟัน", "ตัดเล็บ"],
    style: "เท็ดดี้แบร์", length: "25 มม.", size: "เล็กมาก (< 5 กก.)", difficulty: "ง่าย",
    price: 550, note: "ขนพันกัน ควรใช้ครีมนวด",
    status: "รออนุมัติ", nextAppt: "—",
  },
  {
    id: 8, hn: "HN-2026-001",
    pet: "บัดดี้", breed: "โกลเดน รีทรีฟเวอร์", owner: "สมศักดิ์ ใจดี", phone: "081-234-5678",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop",
    date: "1 ก.ค. 2569", groomer: "กมล วงศ์ดี",
    services: ["อาบน้ำพื้นฐาน", "ทำความสะอาดหู"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ปกติ",
    price: 420, note: "ผิวหนังแพ้ง่าย ใช้แชมพูอ่อนโยน",
    status: "เสร็จสิ้น", nextAppt: "1 ส.ค. 2569",
  },
  {
    id: 9, hn: "HN-2026-019",
    pet: "มะลิ", breed: "เมนคูน", owner: "พิมพ์ชนก วัฒนกุล", phone: "090-112-3456",
    animal: "🐈", photo: "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=400&q=80&auto=format&fit=crop",
    date: "27 มิ.ย. 2569", groomer: "อรัญ สีลา",
    services: ["ตัดแต่งทั้งชุด", "บำบัดขนร่วง", "ตัดเล็บ"],
    style: "ไลออนคัท", length: "15 มม.", size: "กลาง (10–20 กก.)", difficulty: "ยาก",
    price: 1100, note: "ขนหนามาก ใช้เวลา 3 ชม.",
    status: "เสร็จสิ้น", nextAppt: "27 ก.ค. 2569",
  },
  {
    id: 10, hn: "HN-2026-010",
    pet: "ไทเกอร์", breed: "ไทยบางแก้ว", owner: "ปกรณ์ เลิศวิริยะ", phone: "084-777-1234",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&q=80&auto=format&fit=crop",
    date: "8 ก.ค. 2569", groomer: "กมล วงศ์ดี",
    services: ["บำบัดขนร่วง", "อาบน้ำพื้นฐาน"],
    style: "ธรรมชาติ", length: "—", size: "ใหญ่ (20–35 กก.)", difficulty: "ยาก",
    price: 900, note: "ขนร่วงเยอะมาก ต้องเป่าลมพิเศษ",
    status: "กำลังดำเนินการ", nextAppt: "—",
  },
  {
    id: 11, hn: "HN-2026-045",
    pet: "บันนี่", breed: "ไลอ้อนเฮด", owner: "กัญญา สุวรรณ", phone: "091-678-9012",
    animal: "🐇", photo: "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=400&q=80&auto=format&fit=crop",
    date: "4 ก.ค. 2569", groomer: "ทอม ชาตรี",
    services: ["อาบน้ำพื้นฐาน", "ตัดเล็บ"],
    style: "ธรรมชาติ", length: "—", size: "เล็กมาก (< 5 กก.)", difficulty: "ง่าย",
    price: 420, note: "กระต่ายขนยาว แผงคอฟู ควรแปรงขนสม่ำเสมอ เป่าขนให้แห้งสนิท",
    status: "เสร็จสิ้น", nextAppt: "4 ส.ค. 2569",
  },
  {
    id: 12, hn: "HN-2026-016",
    pet: "กะทิ", breed: "วิเชียรมาศ", owner: "ชลธิชา อินทร์แก้ว", phone: "095-888-2211",
    animal: "🐈", photo: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80&auto=format&fit=crop",
    date: "30 มิ.ย. 2569", groomer: "อรัญ สีลา",
    services: ["อาบน้ำพื้นฐาน", "ทำความสะอาดหู"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ปกติ",
    price: 420, note: "จับนุ่มนวล น้องตื่นคนแปลกหน้าเล็กน้อย",
    status: "เสร็จสิ้น", nextAppt: "30 ก.ค. 2569",
  },
];

const groomingServices = [
  { id: 1, name: "อาบน้ำพื้นฐาน",    price: 300, desc: "แชมพู เป่าขน แปรงขน",                  icon: Droplets },
  { id: 2, name: "ตัดแต่งทั้งชุด",   price: 600, desc: "อาบน้ำ + ตัดขน + ตัดเล็บ + ทำความสะอาดหู", icon: Scissors },
  { id: 3, name: "ตัดเล็บ",          price: 100, desc: "ตัดเล็บเท่านั้น",                        icon: Sparkles },
  { id: 4, name: "ทำความสะอาดหู",   price: 120, desc: "ทำความสะอาดและดึงขนในหู",               icon: Sparkles },
  { id: 5, name: "บำบัดขนร่วง",      price: 400, desc: "ลดการหลุดร่วงของขนได้ถึง 80%",           icon: Zap      },
  { id: 6, name: "แปรงฟัน",          price: 150, desc: "บริการทำความสะอาดช่องปาก",              icon: Sparkles },
];

const styles      = ["เท็ดดี้แบร์", "พัพพี้คัท", "ไลออนคัท", "ท็อปน็อต", "ธรรมชาติ", "ครีเอทีฟ"];
const sizes       = ["เล็กมาก (< 5 กก.)", "เล็ก (5–10 กก.)", "กลาง (10–20 กก.)", "ใหญ่ (20–35 กก.)", "ใหญ่มาก (> 35 กก.)"];
const difficulties = ["ง่าย", "ปกติ", "ยาก", "ยากมาก"];
const groomers    = ["อรัญ สีลา", "ทอม ชาตรี", "กมล วงศ์ดี"];

const statusCfg = (s: string) => {
  if (s === "เสร็จสิ้น")        return { cls: "bg-[#19a589]/10 text-[#0d7c66]",  dot: "bg-[#19a589]"  };
  if (s === "กำลังดำเนินการ")   return { cls: "bg-blue-50 text-blue-700",         dot: "bg-blue-500"   };
  if (s === "รออนุมัติ")         return { cls: "bg-amber-50 text-amber-700",       dot: "bg-amber-400"  };
  return { cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
};

/* ─────────────────────── Animation variants ─────────────────────── */
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const panelVariants = { hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const, delay: 0.1 } } };

/* Status pill gradient (matches Visits card status pills) */
const statusGrad = (s: string) =>
  s === "เสร็จสิ้น" ? "linear-gradient(135deg, #34d399, #0d7c66)"
  : s === "กำลังดำเนินการ" ? "linear-gradient(135deg, #60a5fa, #2563eb)"
  : s === "รออนุมัติ" ? "linear-gradient(135deg, #fbbf24, #d97706)"
  : "linear-gradient(135deg, #cbd5e1, #94a3b8)";

/* Pet sex per record id (mock) — drives the ♀/♂ avatar badge */
/* แปลงวันที่ไทย "4 มี.ค. 2569" (พ.ศ.) → Date — ใช้กรองช่วงวันที่ในทะเบียนอาบน้ำตัดขน */
const GROOM_TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function parseGroomDate(s?: string): Date | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2})\s+(\S+)\s*(\d{4})?/);
  if (!m) return null;
  const mi = GROOM_TH_MONTHS.indexOf(m[2]);
  if (mi < 0) return null;
  let y = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
  if (y > 2400) y -= 543;   // พ.ศ. → ค.ศ.
  return new Date(y, mi, parseInt(m[1], 10));
}

const GROOM_SEX: Record<number, "ผู้" | "เมีย"> = {
  1: "ผู้", 2: "เมีย", 3: "ผู้", 4: "ผู้", 5: "เมีย",
  6: "ผู้", 7: "เมีย", 8: "ผู้", 9: "เมีย", 10: "ผู้",
  11: "เมีย", 12: "เมีย",
};

/* Look up full service info / icon by name (from groomingServices) */
const serviceInfo = (name: string) => groomingServices.find(s => s.name === name);
const serviceIcon = (name: string) => serviceInfo(name)?.icon ?? Sparkles;

/* Difficulty badge style (gradient + glow) per level */
const diffStyle = (d: string) =>
  d === "ยากมาก" ? { grad: "linear-gradient(135deg, #f87171, #dc2626)", sh: "rgba(220,38,38,0.35)" }
  : d === "ยาก" ? { grad: "linear-gradient(135deg, #fb923c, #ea580c)", sh: "rgba(234,88,12,0.35)" }
  : d === "ปกติ" ? { grad: "linear-gradient(135deg, #60a5fa, #2563eb)", sh: "rgba(37,99,235,0.32)" }
  : { grad: "linear-gradient(135deg, #34d399, #059669)", sh: "rgba(5,150,105,0.32)" };

/* ─── Data section — bordered card w/ neutral header + icon-field grid (matches PetDetail) ─── */
interface DataField { label: string; value: string; icon: any; color: string; span?: number; }
function DataRow({ f }: { f: DataField }) {
  const Icon = f.icon;
  const spanClass = f.span === 3 ? "sm:col-span-3" : f.span === 2 ? "sm:col-span-2" : "";
  return (
    <div className={`group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50/80 hover:translate-x-0.5 cursor-default ${spanClass}`}>
      <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" style={{ background: f.color, boxShadow: `0 0 8px ${f.color}88` }} />
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-transform duration-200 group-hover:scale-110" style={{ background: f.color, boxShadow: `0 2px 6px ${f.color}55, inset 0 1px 0 rgba(255,255,255,0.30)` }}>
        <Icon className="w-3 h-3" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10.5px] text-gray-400 mb-0.5" style={{ fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase" }}>{f.label}</div>
        <div className="text-[14px] text-gray-900 truncate" style={{ fontWeight: 600, letterSpacing: "-0.1px" }}>{f.value}</div>
      </div>
    </div>
  );
}
function DataSection({ icon: HeadIcon, title, subtitle, color, badge, fields, cols = 2 }: { icon: any; title: string; subtitle?: string; color: string; badge?: string; fields: DataField[]; cols?: 2 | 3 }) {
  const gridClass = cols === 3 ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-0.5" : "grid grid-cols-1 sm:grid-cols-2 gap-0.5";
  return (
    <section className="relative rounded-2xl border border-gray-100 overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="relative px-4 py-3.5 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
          <HeadIcon className="w-4.5 h-4.5" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.25 }}>{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{subtitle}</p>}
        </div>
        {badge && (
          <span className="relative inline-flex items-center justify-center px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${color}14`, color, fontWeight: 700, fontSize: "calc(10.5px * var(--fs))", border: `1px solid ${color}26` }}>{badge}</span>
        )}
      </div>
      <div className="p-3">
        <div className={gridClass}>
          {fields.map((f) => <DataRow key={f.label} f={f} />)}
        </div>
      </div>
    </section>
  );
}

/* Generic section card (neutral gray header) for the post-service editable blocks */
function PostCard({ icon: Ico, title, subtitle, action, children }: { icon: any; title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="relative rounded-2xl border border-gray-100 overflow-hidden bg-white flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
          <Ico className="w-4.5 h-4.5" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))", letterSpacing: "-0.2px" }}>{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-4 flex-1">{children}</div>
    </section>
  );
}

/* Grooming card — faithfully mirrors the Visits VisitCard (centered avatar) */
function GroomCard({ rec, onClick }: { rec: GroomRecord; onClick: () => void }) {
  const stColor = rec.status === "เสร็จสิ้น" ? "#0d7c66" : rec.status === "กำลังดำเนินการ" ? "#2563eb" : "#d97706";
  const ds = diffStyle(rec.difficulty);
  const isFemale = GROOM_SEX[rec.id] === "เมีย";
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      className="group relative rounded-3xl overflow-hidden bg-white text-left transition-all duration-300 hover:-translate-y-1"
      style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)" }}
    >
      {/* Cover banner (blurred pet photo) */}
      <div className="relative h-20 overflow-hidden">
        <img src={rec.photo} alt="" aria-hidden onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(18px) saturate(140%)", transform: "scale(1.3)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(236,246,243,0.35) 0%, rgba(255,255,255,0.6) 100%)" }} />
        {/* Services received — icon stack, top-left */}
        <div className="absolute top-2 left-2 flex items-center -space-x-1.5">
          {rec.services.map((svc, i) => {
            const Ico = serviceIcon(svc);
            return (
              <div
                key={i}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm"
                style={{ border: "1.5px solid #ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.12)", zIndex: rec.services.length - i }}
                title={svc}
              >
                <Ico className="w-3 h-3 text-[#0d7c66]" strokeWidth={2.2} />
              </div>
            );
          })}
        </div>
        {/* Difficulty level — top-right (every card) */}
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white" style={{ background: ds.grad, boxShadow: `0 2px 6px ${ds.sh}`, fontWeight: 600 }} title={`ระดับความยาก: ${rec.difficulty}`}>
          <Zap className="w-2.5 h-2.5" /> {rec.difficulty}
        </span>
      </div>

      {/* Avatar (overlapping cover, white ring + animal badge) */}
      <div className="flex justify-center -mt-10 relative">
        <div className="rounded-full p-[3px]" style={{ background: "#ffffff", boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}>
          <div className="relative w-[66px] h-[66px] rounded-full overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e6f4f1, #cfe8e2)" }}>
            <span style={{ fontSize: "calc(28px * var(--fs))", lineHeight: 1 }}>{rec.animal}</span>
            <img src={rec.photo} alt={rec.pet} onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
        </div>
        <span
          className="absolute bottom-0 right-[calc(50%-40px)] w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{
            background: isFemale ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)",
            border: "2.5px solid #ffffff",
            boxShadow: isFemale ? "0 3px 10px rgba(236,72,153,0.45)" : "0 3px 10px rgba(14,165,233,0.45)",
          }}
          title={isFemale ? "เพศเมีย" : "เพศผู้"}
        >
          <span style={{ fontWeight: 700, fontSize: "calc(12px * var(--fs))", lineHeight: 1 }}>{isFemale ? "♀" : "♂"}</span>
        </span>
      </div>

      {/* Name + breed + status (centered) */}
      <div className="text-center px-4 mt-2.5">
        <h3 className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))", letterSpacing: "-0.3px", lineHeight: 1.3, paddingBottom: 2 }}>{rec.pet}</h3>
        <p className="text-gray-500 truncate" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 600 }}>{rec.breed}</p>
        <div className="mt-1.5 flex justify-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] text-white" style={{ background: statusGrad(rec.status), boxShadow: `0 2px 6px ${stColor}55`, fontWeight: 600 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/85" /> {rec.status}
          </span>
        </div>
      </div>

      {/* Stats (gray bg, 3 cols) — บริการ · ขนาด · ราคา */}
      <div className="mx-3 mt-3 grid grid-cols-3 rounded-2xl py-2" style={{ background: "#f3f4f6" }}>
        {[
          { value: `${rec.services.length}`, label: "บริการ" },
          { value: rec.size.split(" ")[0], label: "ขนาด" },
          { value: `฿${rec.price.toLocaleString()}`, label: "ราคา" },
        ].map((s, idx) => (
          <div key={idx} className="text-center relative px-1">
            {idx > 0 && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-300/60" />}
            <div className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(12.5px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.2 }}>{s.value}</div>
            <div className="text-gray-500 mt-0.5" style={{ fontSize: "calc(10px * var(--fs))", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Owner + groomer footer (2 cols) */}
      <div className="px-3 py-3 grid grid-cols-2 gap-2">
        <div className="text-center min-w-0">
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>เจ้าของ</p>
          <p className="text-[12px] text-gray-700 truncate mt-0.5" style={{ fontWeight: 600 }}>{rec.owner}</p>
        </div>
        <div className="text-center min-w-0 relative">
          <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200/80" />
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>ช่างอาบน้ำ</p>
          <p className="text-[12px] text-[#0d7c66] truncate mt-0.5" style={{ fontWeight: 600 }}>{rec.groomer}</p>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  New Record Form                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
function NewRecordForm({ onBack }: { onBack: () => void }) {
  const fc = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const fv = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle]         = useState("พัพพี้คัท");
  const [selectedSize, setSelectedSize]           = useState("กลาง (10–20 กก.)");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ปกติ");
  const [selectedServices, setSelectedServices]   = useState<number[]>([1]);
  const [selectedGroomer, setSelectedGroomer]     = useState(groomers[0]);
  const [selectedAssistant, setSelectedAssistant] = useState("ไม่มี");
  const [hairLength, setHairLength]               = useState("30");
  const [note, setNote]                           = useState("");
  const [nextAppt, setNextAppt]                   = useState("");
  const [timeStart, setTimeStart]                 = useState(() => new Date().toISOString().slice(0, 16));
  const [timeEnd, setTimeEnd]                     = useState("");
  /* ตั้งเวลาสิ้นสุด = เวลาเริ่ม + N นาที (ปุ่มลัด +5/+10) */
  const setEndFromStart = (mins: number) => {
    if (!timeStart) return;
    const d = new Date(timeStart);
    if (isNaN(d.getTime())) return;
    d.setMinutes(d.getMinutes() + mins);
    const pad = (n: number) => String(n).padStart(2, "0");
    setTimeEnd(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  };
  const [behaviorTags, setBehaviorTags]           = useState<string[]>([]);
  const [furCondition, setFurCondition]           = useState("ปกติ");
  const [cuttingDone, setCuttingDone]             = useState("ตัด");
  const [productUsed, setProductUsed]             = useState("แชมพูมาตรฐาน");
  const [specialRec, setSpecialRec]               = useState("");
  const [apptDate, setApptDate]                   = useState("");
  const [apptTime, setApptTime]                   = useState("");
  const [apptType, setApptType]                   = useState("อาบน้ำตัดขน");
  const [apptChannel, setApptChannel]             = useState("โทรศัพท์");
  const [apptNote, setApptNote]                   = useState("");
  const [sendReminder, setSendReminder]           = useState(true);
  const [discount, setDiscount]                   = useState(0);

  /* ── Pet search ── */
  const petDatabase = mockRecords.map(r => ({ name: r.pet, hn: r.hn, breed: r.breed, owner: r.owner, phone: r.phone, animal: r.animal, photo: r.photo }));
  const [petSearch, setPetSearch]       = useState("");
  const [selectedPet, setSelectedPet]  = useState<typeof petDatabase[number] | null>(null);
  const [showPetDrop, setShowPetDrop]  = useState(false);
  const petSearchRef = useRef<HTMLDivElement>(null);
  const filteredPets = petSearch.trim()
    ? petDatabase.filter(p => p.name.includes(petSearch) || p.hn.includes(petSearch) || p.owner.includes(petSearch) || p.breed.toLowerCase().includes(petSearch.toLowerCase()))
    : petDatabase;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (petSearchRef.current && !petSearchRef.current.contains(e.target as Node)) setShowPetDrop(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectPet = (pet: typeof petDatabase[number]) => {
    setSelectedPet(pet);
    setPetSearch(pet.name);
    setShowPetDrop(false);
  };

  const handleClearPet = () => {
    setSelectedPet(null);
    setPetSearch("");
  };

  const toggleService = (id: number) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const subtotal      = groomingServices.filter(s => selectedServices.includes(s.id)).reduce((a, s) => a + s.price, 0);
  const extraCharge   = selectedSize === "ใหญ่มาก (> 35 กก.)" ? 200 : selectedSize === "ใหญ่ (20–35 กก.)" ? 100 : 0;
  const beforeDiscount = subtotal + extraCharge;
  const afterDiscount  = Math.max(0, beforeDiscount - discount);
  const vat            = Math.round(afterDiscount * 0.07);
  const total          = afterDiscount + vat;

  const handleSave = () => {
    showSnackbar("success", "บันทึกบริการอาบน้ำสำเร็จแล้ว");
    onBack();
  };

  const handleSaveAndBill = () => {
    const billItems = groomingServices
      .filter(s => selectedServices.includes(s.id))
      .map(s => ({ name: s.name, unit: "ครั้ง", price: s.price, qty: 1 }));
    if (extraCharge > 0) {
      billItems.push({ name: `ค่าเพิ่มเติมสัตว์ขนาดใหญ่`, unit: "ครั้ง", price: extraCharge, qty: 1 });
    }
    showSnackbar("success", "บันทึกบริการอาบน้ำสำเร็จแล้ว");
    navigate("/financial", {
      state: {
        groomingBill: {
          pet:     selectedPet?.name   || "สัตว์เลี้ยง",
          breed:   selectedPet?.breed  || "",
          owner:   selectedPet?.owner  || "",
          phone:   selectedPet?.phone  || "",
          animal:  selectedPet?.animal || "🐕",
          photo:   selectedPet?.photo  || "",
          groomer: selectedGroomer,
          style:   selectedStyle,
          size:    selectedSize,
          items:   billItems,
          discount,
        },
      },
    });
  };

  return (
    <motion.div className="flex-1 flex flex-col min-h-0" variants={fc} initial="hidden" animate="visible">
      {/* Header — clean vet-modal style (matches sibling popups) */}
      <div className="vet-modal-header flex items-center gap-3 flex-shrink-0">
        <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)" }}>
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>บันทึกบริการใหม่</h3>
          <p className="text-[11px] text-gray-500">กรอกข้อมูลการอาบน้ำตัดขน</p>
        </div>
        <button onClick={onBack} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
      </div>

      {/* Form body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 bg-[#FEFBF8]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* ── LEFT ── */}
          <div className="space-y-4">

            {/* Pet info */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "calc(0.7rem * var(--fs))", fontWeight: 700 }}>1</span>
                ข้อมูลสัตว์เลี้ยง
              </h3>

              {/* ── Pet Search ── */}
              <div ref={petSearchRef} className="relative mb-4">
                <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ค้นหาสัตว์เลี้ยง *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input
                    value={petSearch}
                    onChange={e => { setPetSearch(e.target.value); setShowPetDrop(true); if (selectedPet && e.target.value !== selectedPet.name) setSelectedPet(null); }}
                    onFocus={() => setShowPetDrop(true)}
                    placeholder="พิมพ์ชื่อสัตว์, HN, หรือชื่อเจ้าของ..."
                    className="vet-input !pl-9 !pr-9"
                  />
                  {selectedPet && (
                    <button onClick={handleClearPet} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                  {showPetDrop && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-y-auto"
                    >
                      {filteredPets.length > 0 ? filteredPets.map(p => (
                        <button
                          key={p.hn}
                          onClick={() => handleSelectPet(p)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#19a589]/5 transition-colors ${selectedPet?.hn === p.hn ? "bg-[#19a589]/8" : ""}`}
                        >
                          <img src={p.photo} alt={p.name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>
                              {p.animal} {p.name} <span className="text-gray-400" style={{ fontWeight: 400 }}>({p.hn})</span>
                            </p>
                            <p className="text-xs text-gray-400 truncate">{p.breed} · เจ้าของ: {p.owner}</p>
                          </div>
                          {selectedPet?.hn === p.hn && <CheckCircle2 className="w-4 h-4 text-[#19a589] flex-shrink-0" />}
                        </button>
                      )) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">ไม่พบสัตว์เลี้ยงที่ตรงกัน</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Auto-filled fields ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ชื่อสัตว์ / HN</label>
                  <input value={selectedPet ? `${selectedPet.name} — ${selectedPet.hn}` : ""} readOnly placeholder="เลือกจากช่องค้นหาด้านบน" className="vet-input bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>เจ้าของ</label>
                  <input value={selectedPet?.owner ?? ""} readOnly placeholder="—" className="vet-input bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>สายพันธุ์</label>
                  <input value={selectedPet?.breed ?? ""} readOnly placeholder="—" className="vet-input bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>เบอร์โทรติดต่อ</label>
                  <input value={selectedPet?.phone ?? ""} readOnly placeholder="—" className="vet-input bg-gray-50" />
                </div>
              </div>
            </motion.div>

            {/* Style */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "calc(0.7rem * var(--fs))", fontWeight: 700 }}>2</span>
                สไตล์การตัด
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {styles.map(s => (
                  <button key={s} onClick={() => setSelectedStyle(s)}
                    className="py-2.5 text-sm rounded-full border transition-all"
                    style={{
                      background: selectedStyle === s ? "#19a589" : "white",
                      color: selectedStyle === s ? "white" : "#374151",
                      borderColor: selectedStyle === s ? "#19a589" : "#e5e7eb",
                      fontWeight: selectedStyle === s ? 600 : 400,
                      boxShadow: selectedStyle === s ? "0 3px 10px rgba(25,165,137,0.28)" : undefined,
                    }}>{s}</button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ความยาวที่ตัด (มม.)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="number" value={hairLength} onChange={e => setHairLength(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ช่างอาบน้ำ</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <select value={selectedGroomer} onChange={e => setSelectedGroomer(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                      {groomers.map(g => <option key={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ผู้ช่วย</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <select value={selectedAssistant} onChange={e => setSelectedAssistant(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                      <option>ไม่มี</option>
                      {groomers.filter(g => g !== selectedGroomer).map(g => <option key={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Services */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "calc(0.7rem * var(--fs))", fontWeight: 700 }}>3</span>
                เลือกบริการ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groomingServices.map(svc => {
                  const active = selectedServices.includes(svc.id);
                  return (
                    <button key={svc.id} onClick={() => toggleService(svc.id)}
                      className="flex items-center gap-3 p-3 rounded-2xl border transition-all text-left"
                      style={{
                        background: active ? "rgba(25,165,137,0.06)" : "white",
                        borderColor: active ? "#19a589" : "#e5e7eb",
                      }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: active ? "#19a589" : "#f3f4f6" }}>
                        <svc.icon className="w-4 h-4" style={{ color: active ? "white" : "#9ca3af" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 truncate" style={{ fontWeight: active ? 600 : 400 }}>{svc.name}</p>
                        <p className="text-gray-400" style={{ fontSize: "calc(0.6rem * var(--fs))" }}>{svc.desc}</p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ fontWeight: 600, color: active ? "#19a589" : "#9ca3af" }}>฿{svc.price}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Animal details */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "calc(0.7rem * var(--fs))", fontWeight: 700 }}>4</span>
                รายละเอียดสัตว์
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ขนาดตัว</label>
                  <div className="space-y-1.5">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full border text-xs transition-all"
                        style={{
                          background: selectedSize === s ? "rgba(73,138,79,0.07)" : "white",
                          borderColor: selectedSize === s ? "#19a589" : "#e5e7eb",
                          color: selectedSize === s ? "#0d7c66" : "#6b7280",
                          fontWeight: selectedSize === s ? 600 : 400,
                        }}>
                        <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: selectedSize === s ? "#19a589" : "#d1d5db", background: selectedSize === s ? "#19a589" : "transparent" }} />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ระดับความยาก</label>
                  <div className="space-y-1.5">
                    {difficulties.map(d => {
                      const diffColor = d === "ยากมาก" ? "#ef4444" : d === "ยาก" ? "#f97316" : d === "ปกติ" ? "#3b82f6" : "#19a589";
                      return (
                        <button key={d} onClick={() => setSelectedDifficulty(d)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full border text-xs transition-all"
                          style={{
                            background: selectedDifficulty === d ? `${diffColor}10` : "white",
                            borderColor: selectedDifficulty === d ? diffColor : "#e5e7eb",
                            color: selectedDifficulty === d ? diffColor : "#6b7280",
                            fontWeight: selectedDifficulty === d ? 600 : 400,
                          }}>
                          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                            style={{ borderColor: selectedDifficulty === d ? diffColor : "#d1d5db", background: selectedDifficulty === d ? diffColor : "transparent" }} />
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notes + Photos */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-gray-800 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "calc(0.7rem * var(--fs))", fontWeight: 700 }}>5</span>
                บันทึกและรูปภาพ
              </h3>

              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ช่วงเวลา</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-300 mb-1 block">เริ่ม</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="datetime-local" value={timeStart} onChange={e => setTimeStart(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 mb-1 block">สิ้นสุด</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="datetime-local" value={timeEnd} onChange={e => setTimeEnd(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
                    </div>
                    {/* ปุ่มลัด: สิ้นสุด = เวลาเริ่ม + N นาที */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {[5, 10].map(m => {
                        const on = (() => {
                          if (!timeStart || !timeEnd) return false;
                          const s = new Date(timeStart).getTime(), e = new Date(timeEnd).getTime();
                          return e - s === m * 60000;
                        })();
                        return (
                          <button key={m} type="button" onClick={() => setEndFromStart(m)}
                            className="px-2.5 py-1 rounded-full text-[11px] transition-all active:scale-95"
                            style={on
                              ? { fontWeight: 700, background: "#19a589", color: "#fff", border: "1px solid #0d7c66" }
                              : { fontWeight: 600, background: "rgba(25,165,137,0.08)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.25)" }}>
                            +{m} นาที
                          </button>
                        );
                      })}
                      <span className="text-[10px] text-gray-300">นับจากเวลาเริ่ม</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>พฤติกรรม</label>
                <div className="flex flex-wrap gap-2">
                  {["แปรงง่าย", "สัตว์เลี้ยงตัวใหญ่", "ขัดขวาง", "กัด/ข่วน", "ขนพันกัน", "กลัวน้ำ", "ร้องไห้", "ต้องใช้สองคน"].map(tag => {
                    const active = behaviorTags.includes(tag);
                    return (
                      <button key={tag} type="button"
                        onClick={() => setBehaviorTags(prev => active ? prev.filter(t => t !== tag) : [...prev, tag])}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
                        style={{
                          background: active ? "rgba(25,165,137,0.08)" : "white",
                          borderColor: active ? "#19a589" : "#e5e7eb",
                          color: active ? "#0d7c66" : "#6b7280",
                          fontWeight: active ? 600 : 400,
                        }}>
                        {active && <CheckCircle2 className="w-3 h-3" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-4">
                <p className="text-xs text-gray-500" style={{ fontWeight: 600 }}>การประเมินสภาพขน</p>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>สภาพขนเดิม</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <select value={furCondition} onChange={e => setFurCondition(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                      {["ปกติ", "แปรงง่าย", "ขนพันกัน (เล็กน้อย)", "ขนพันกัน (มาก)", "ขนร่วงมาก", "ขนแห้ง/เสีย", "มีปรสิต"].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>การตัดขน</label>
                  <div className="flex gap-2">
                    {["ไม่ตัด", "ตัด"].map(opt => (
                      <button key={opt} type="button" onClick={() => setCuttingDone(opt)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all"
                        style={{
                          background: cuttingDone === opt ? "#19a589" : "white",
                          borderColor: cuttingDone === opt ? "#19a589" : "#e5e7eb",
                          color: cuttingDone === opt ? "white" : "#6b7280",
                          fontWeight: cuttingDone === opt ? 600 : 400,
                          boxShadow: cuttingDone === opt ? "0 2px 8px rgba(25,165,137,0.25)" : undefined,
                        }}>
                        <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: cuttingDone === opt ? "white" : "#d1d5db", background: cuttingDone === opt ? "white" : "transparent" }} />
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>หมายเหตุ</label>
                  <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="ระบุข้อสังเกตพิเศษ เช่น ขนพันกันที่หู, มีแผลเล็กน้อย..."
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all resize-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>ผลิตภัณฑ์ที่ใช้บริการ</label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <select value={productUsed} onChange={e => setProductUsed(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                      {["แชมพูมาตรฐาน", "แชมพูสำหรับขนแห้ง", "แชมพูสมุนไพร", "แชมพูกำจัดหมัด", "แชมพูลูกสุนัข/แมว", "ครีมนวดขน", "สเปรย์น้ำหอม"].map(p => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>คำแนะนำพิเศษสำหรับการบริการ</label>
                  <textarea rows={2} value={specialRec} onChange={e => setSpecialRec(e.target.value)}
                    placeholder="คำแนะนำสำหรับเจ้าของหรือครั้งต่อไป เช่น ควรแปรงขนทุก 3 วัน..."
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all resize-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>รูปภาพก่อนอาบน้ำตัดขน</label>
                <div className="grid grid-cols-2 gap-3">
                  {["รูปก่อนทำ", "รูปหลังทำ"].map(label => (
                    <div key={label}>
                      <p className="text-xs text-gray-300 mb-1.5">{label}</p>
                      <label className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#19a589]/40 hover:bg-[#19a589]/3 transition-all">
                        <Camera className="w-5 h-5 text-gray-300" />
                        <span className="text-xs text-gray-400">อัปโหลดรูป</span>
                        <input type="file" accept="image/*" className="hidden" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Section 6: นัดหมายถัดไป */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-gray-800 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "calc(0.7rem * var(--fs))", fontWeight: 700 }}>6</span>
                นัดหมายถัดไป
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>วันที่นัดหมาย</label>
                  <DatePickerModern value={apptDate} onChange={setApptDate} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>เวลานัด</label>
                  <TimePickerModern value={apptTime} onChange={setApptTime} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>บริการที่นัดหมาย</label>
                <div className="relative">
                  <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select value={apptType} onChange={e => setApptType(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                    {["อาบน้ำตัดขน", "อาบน้ำพื้นฐาน", "ตัดแต่งทั้งชุด", "ตัดเล็บ", "บำบัดขนร่วง", "แปรงฟัน"].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ช่องทางการนัด</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "โทรศัพท์", icon: Phone },
                    { label: "LINE",     icon: MessageSquare },
                    { label: "Walk-in",  icon: User },
                  ].map(({ label, icon: Icon }) => (
                    <button key={label} type="button" onClick={() => setApptChannel(label)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all"
                      style={{
                        background: apptChannel === label ? "#19a589" : "white",
                        borderColor: apptChannel === label ? "#19a589" : "#e5e7eb",
                        color: apptChannel === label ? "white" : "#6b7280",
                        fontWeight: apptChannel === label ? 600 : 400,
                        boxShadow: apptChannel === label ? "0 2px 8px rgba(25,165,137,0.25)" : undefined,
                      }}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>หมายเหตุ / คำแนะนำสำหรับการนัดไป</label>
                <textarea rows={3} value={apptNote} onChange={e => setApptNote(e.target.value)}
                  placeholder="หมายเหตุ / คำแนะนำ สำหรับการนัดไป..."
                  className="vet-textarea" />
              </div>
              <button type="button" onClick={() => setSendReminder(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
                style={{
                  background: sendReminder ? "rgba(25,165,137,0.06)" : "white",
                  borderColor: sendReminder ? "#19a589" : "#e5e7eb",
                }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: sendReminder ? "#19a589" : "#f3f4f6" }}>
                  <Bell className="w-4 h-4" style={{ color: sendReminder ? "white" : "#9ca3af" }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-gray-800" style={{ fontWeight: sendReminder ? 600 : 400 }}>ส่งการแจ้งเตือนอัตโนมัติ</p>
                  <p className="text-gray-400" style={{ fontSize: "calc(0.62rem * var(--fs))" }}>แจ้งเตือนเจ้าของสัตว์ก่อนวันนัด 1 วัน</p>
                </div>
                <div className="w-8 h-5 rounded-full flex-shrink-0 relative transition-all"
                  style={{ background: sendReminder ? "#19a589" : "#e5e7eb" }}>
                  <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
                    style={{ left: sendReminder ? "calc(100% - 1rem)" : "0.125rem" }} />
                </div>
              </button>
              {apptDate && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "linear-gradient(135deg,#f0faf1,#e8f5e9)", border: "1px solid #c8e6c9" }}>
                  <Calendar className="w-4 h-4 text-[#19a589] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#0d7c66]" style={{ fontWeight: 600 }}>นัดหมาย: {apptType}</p>
                    <p className="text-[#19a589]" style={{ fontSize: "calc(0.68rem * var(--fs))" }}>
                      {new Date(apptDate).toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      {apptTime ? ` · ${apptTime} น.` : ""} · {apptChannel}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT: Summary sidebar ── */}
          <div>
            <motion.div variants={fv} className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100" style={{ background: "linear-gradient(135deg,#f0faf1,#ffffff)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#19a589] flex items-center justify-center">
                    <Scissors className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-gray-800" style={{ fontWeight: 700 }}>สรุปรายการ</span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2 text-xs">
                  {[
                    { label: "สไตล์",   value: selectedStyle },
                    { label: "ขนาด",    value: selectedSize.split(" ")[0] },
                    { label: "ความยาก", value: selectedDifficulty },
                    { label: "ช่าง",    value: selectedGroomer },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-gray-400">{row.label}</span>
                      <span className="text-gray-700" style={{ fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                  <p className="text-gray-400 mb-2" style={{ fontWeight: 600 }}>บริการ</p>
                  {groomingServices.filter(s => selectedServices.includes(s.id)).map(s => (
                    <div key={s.id} className="flex justify-between">
                      <span className="text-gray-500">{s.name}</span>
                      <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{s.price.toLocaleString()}</span>
                    </div>
                  ))}
                  {extraCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ค่าเพิ่มตามขนาด</span>
                      <span className="text-gray-700" style={{ fontWeight: 500 }}>+฿{extraCharge}</span>
                    </div>
                  )}
                  {selectedServices.length === 0 && (
                    <p className="text-gray-300 text-center py-2">ยังไม่ได้เลือกบริการ</p>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-dashed border-gray-100 mt-1">
                    <span className="text-gray-500">ราคารวม</span>
                    <span className="text-gray-700" style={{ fontWeight: 600 }}>฿{beforeDiscount.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1" style={{ fontWeight: 500 }}>
                    <Tag className="w-3 h-3" /> ส่วนลด
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">฿</span>
                    <input type="number" min={0} max={beforeDiscount}
                      value={discount || ""}
                      onChange={e => setDiscount(Math.min(Number(e.target.value), beforeDiscount))}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between mt-1.5 text-xs">
                      <span className="text-orange-500">ส่วนลด</span>
                      <span className="text-orange-500" style={{ fontWeight: 600 }}>-฿{discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">ราคาก่อน VAT</span>
                    <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{afterDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Percent className="w-3 h-3" />VAT 7%
                    </span>
                    <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{vat.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                  <p className="text-white/80" style={{ fontSize: "calc(0.7rem * var(--fs))", fontWeight: 500 }}>รวมทั้งหมด</p>
                  <p className="text-white mt-0.5" style={{ fontWeight: 800, fontSize: "calc(1.5rem * var(--fs))" }}>
                    ฿{total.toLocaleString()}
                  </p>
                  {discount > 0 && (
                    <p className="text-white/60 mt-0.5" style={{ fontSize: "calc(0.65rem * var(--fs))" }}>
                      ประหยัด ฿{discount.toLocaleString()}
                    </p>
                  )}
                </div>

                {apptDate && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#19a589]/6 border border-[#19a589]/15">
                    <Calendar className="w-3.5 h-3.5 text-[#19a589] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#0d7c66] truncate" style={{ fontWeight: 600 }}>นัดครั้งถัดไป</p>
                      <p className="text-[#19a589] truncate" style={{ fontSize: "calc(0.62rem * var(--fs))" }}>
                        {new Date(apptDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                        {apptTime ? ` · ${apptTime} น.` : ""}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Footer — vet-modal style (matches sibling popups) */}
      <div className="vet-modal-footer flex-shrink-0">
        <button onClick={onBack} className="vet-btn vet-btn-secondary">ยกเลิก</button>
        <button onClick={handleSaveAndBill} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> บันทึกและเปิดบิล
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Edit Grooming Modal                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function EditGroomModal({ open, onClose, record, onSave }: {
  open: boolean;
  onClose: () => void;
  record: GroomRecord;
  onSave: (updated: GroomRecord) => void;
}) {
  const [pet, setPet] = useState(record.pet);
  const [breed, setBreed] = useState(record.breed);
  const [owner, setOwner] = useState(record.owner);
  const [phone, setPhone] = useState(record.phone);
  const [style, setStyle] = useState(record.style);
  const [size, setSize] = useState(record.size);
  const [difficulty, setDifficulty] = useState(record.difficulty);
  const [groomer, setGroomer] = useState(record.groomer);
  const [selectedServices, setSelectedServices] = useState<string[]>(record.services);
  const [price, setPrice] = useState(record.price);
  const [rating, setRating] = useState(record.satisfaction ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [note, setNote] = useState(record.note);
  const [status, setStatus] = useState(record.status);
  const [nextAppt, setNextAppt] = useState(record.nextAppt);

  useEffect(() => {
    if (open) {
      setPet(record.pet);
      setBreed(record.breed);
      setOwner(record.owner);
      setPhone(record.phone);
      setStyle(record.style);
      setSize(record.size);
      setDifficulty(record.difficulty);
      setGroomer(record.groomer);
      setSelectedServices(record.services);
      setPrice(record.price);
      setRating(record.satisfaction ?? 0);
      setNote(record.note);
      setStatus(record.status);
      setNextAppt(record.nextAppt);
    }
  }, [open, record]);

  const toggleService = (s: string) =>
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    onSave({
      ...record,
      pet, breed, owner, phone, style, size, difficulty, groomer,
      services: selectedServices, price, satisfaction: rating, note,
      status, nextAppt,
    });
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[640px] vet-modal pointer-events-auto flex flex-col"
              style={{ height: "min(92vh, calc(100vh - 2rem))", maxHeight: "92vh" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <Edit2 className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">แก้ไขข้อมูลบริการ</h2>
                      <p className="vet-tiny mt-[2px]">แก้ไขรายละเอียดการอาบน้ำตัดขน</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body flex-1 overflow-y-auto space-y-5 p-5">
                {/* ── Section: ข้อมูลสัตว์เลี้ยง ── */}
                <div className="vet-section-divider"><span>ข้อมูลสัตว์เลี้ยง</span></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">ชื่อสัตว์เลี้ยง</label>
                    <input value={pet} onChange={e => setPet(e.target.value)} className="vet-input" />
                  </div>
                  <div>
                    <label className="vet-label">สายพันธุ์</label>
                    <input value={breed} onChange={e => setBreed(e.target.value)} className="vet-input" />
                  </div>
                  <div>
                    <label className="vet-label">เจ้าของ</label>
                    <input value={owner} onChange={e => setOwner(e.target.value)} className="vet-input" />
                  </div>
                  <div>
                    <label className="vet-label">เบอร์โทร</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="vet-input" />
                  </div>
                </div>

                {/* ── Section: สไตล์และรายละเอียด ── */}
                <div className="vet-section-divider"><span>สไตล์และรายละเอียด</span></div>
                <div>
                  <label className="vet-label mb-2">สไตล์การตัด</label>
                  <div className="flex flex-wrap gap-2">
                    {styles.map(s => (
                      <button key={s} onClick={() => setStyle(s)}
                        className="px-3 py-1.5 text-xs rounded-full border transition-all"
                        style={{
                          background: style === s ? "#19a589" : "white",
                          color: style === s ? "white" : "#6b7280",
                          borderColor: style === s ? "#19a589" : "#e5e7eb",
                          fontWeight: style === s ? 600 : 400,
                        }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label mb-2">ขนาดตัว</label>
                    <div className="space-y-1">
                      {sizes.map(s => (
                        <button key={s} onClick={() => setSize(s)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all text-left"
                          style={{
                            background: size === s ? "rgba(25,165,137,0.07)" : "white",
                            borderColor: size === s ? "#19a589" : "#e5e7eb",
                            color: size === s ? "#0d7c66" : "#6b7280",
                            fontWeight: size === s ? 600 : 400,
                          }}>
                          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                            style={{ borderColor: size === s ? "#19a589" : "#d1d5db", background: size === s ? "#19a589" : "transparent" }} />
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="vet-label mb-2">ระดับความยาก</label>
                    <div className="space-y-1">
                      {difficulties.map(d => {
                        const dc = d === "ยากมาก" ? "#ef4444" : d === "ยาก" ? "#f97316" : d === "ปกติ" ? "#3b82f6" : "#19a589";
                        return (
                          <button key={d} onClick={() => setDifficulty(d)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all text-left"
                            style={{
                              background: difficulty === d ? `${dc}10` : "white",
                              borderColor: difficulty === d ? dc : "#e5e7eb",
                              color: difficulty === d ? dc : "#6b7280",
                              fontWeight: difficulty === d ? 600 : 400,
                            }}>
                            <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                              style={{ borderColor: difficulty === d ? dc : "#d1d5db", background: difficulty === d ? dc : "transparent" }} />
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Section: บริการ ── */}
                <div className="vet-section-divider"><span>บริการ</span></div>
                <div className="grid grid-cols-2 gap-2">
                  {groomingServices.map(svc => {
                    const active = selectedServices.includes(svc.name);
                    return (
                      <button key={svc.id} onClick={() => toggleService(svc.name)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left"
                        style={{
                          background: active ? "rgba(25,165,137,0.06)" : "white",
                          borderColor: active ? "#19a589" : "#e5e7eb",
                        }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: active ? "#19a589" : "#f3f4f6" }}>
                          <svc.icon className="w-3.5 h-3.5" style={{ color: active ? "white" : "#9ca3af" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-800 truncate" style={{ fontWeight: active ? 600 : 400 }}>{svc.name}</p>
                        </div>
                        {active && <Check className="w-3.5 h-3.5 text-[#19a589] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* ── Section: ช่างและค่าบริการ ── */}
                <div className="vet-section-divider"><span>ช่างและค่าบริการ</span></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">ช่างอาบน้ำ</label>
                    <select value={groomer} onChange={e => setGroomer(e.target.value)} className="vet-select">
                      {groomers.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="vet-label">ค่าบริการ (฿)</label>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="vet-input" />
                  </div>
                </div>

                {/* ── Section: สถานะ ── */}
                <div className="vet-section-divider"><span>สถานะ</span></div>
                <div>
                  <label className="vet-label mb-2">สถานะปัจจุบัน</label>
                  <div className="flex gap-2">
                    {(["รออนุมัติ", "กำลังดำเนินการ", "เสร็จสิ้น"] as const).map(s => {
                      const sc = statusCfg(s);
                      return (
                        <button key={s} onClick={() => setStatus(s)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${status === s ? sc.cls : "bg-white text-gray-500 border-gray-200"}`}
                          style={{ fontWeight: status === s ? 600 : 400 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status === s ? sc.dot : "bg-gray-300"}`} />
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Section: ความพึงพอใจ ── */}
                <div className="vet-section-divider"><span>ความพึงพอใจและบันทึก</span></div>
                <div>
                  <label className="vet-label mb-2">ความพึงพอใจ</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i + 1)}>
                        <Star className={`w-5 h-5 transition-colors ${i < (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="vet-label">บันทึกพฤติกรรม</label>
                  <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="ระบุข้อสังเกตพิเศษ..."
                    className="vet-textarea" />
                </div>
                <div>
                  <label className="vet-label">นัดครั้งถัดไป</label>
                  <input value={nextAppt} onChange={e => setNextAppt(e.target.value)} className="vet-input" placeholder="เช่น 4 เม.ย. 2569" />
                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={handleSave}
                  className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all ml-auto"
                  style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                  <Check className="w-4 h-4" />
                  บันทึกการแก้ไข
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Delete Grooming Confirmation Dialog                                */
/* ═══════════════════════════════════════════════════════════════════ */
function DeleteGroomDialog({ open, onClose, record, onConfirm }: {
  open: boolean;
  onClose: () => void;
  record: GroomRecord;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl" style={{ background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)" }}>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>ยืนยันการลบข้อมูล</h2>
                      <p className="text-[11px] text-gray-500 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-100">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-100">
                    <img src={record.photo} alt={record.pet} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{record.pet}</p>
                    <p className="text-xs text-gray-400">{record.breed} · {record.owner} · {record.date}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  ข้อมูลบริการอาบน้ำตัดขนนี้จะถูกลบออกจากระบบอย่างถาวร
                </p>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>
                  ยกเลิก
                </button>
                <button onClick={onConfirm}
                  className="flex items-center justify-center gap-1.5 text-sm px-5 py-2 text-white rounded-full transition-all active:scale-[0.97]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                  ลบข้อมูล
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Grooming Page                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
export function Grooming() {
  const { t } = useLang();
  const [view, setView]                 = useState<"list" | "form">("list");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ทุกสถานะ");
  const [difficultyFilter, setDifficultyFilter] = useState("ทุกระดับ");
  // ช่วงวันที่ของรายการ (วันที่ทำบริการ) — ว่าง = ไม่กรอง
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [records, setRecords]           = useState<GroomRecord[]>(mockRecords);
  const [selected, setSelected]         = useState<GroomRecord | null>(records[0]);
  const [showDetail, setShowDetail]     = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  /* ── Post-service editable draft (detail page) — saved per-section ── */
  const [psNote, setPsNote] = useState("");
  const [psNextAppt, setPsNextAppt] = useState("");   // "YYYY-MM-DD"
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingDraft, setRatingDraft] = useState(0);
  const [apptOpen, setApptOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [apptTime, setApptTime] = useState("");
  const [apptService, setApptService] = useState("อาบน้ำตัดขน");
  const [apptChannel, setApptChannel] = useState("โทรศัพท์");
  const [apptNote, setApptNote] = useState("");
  const [apptReminder, setApptReminder] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();
  const navigateTo = useNavigate();

  const statuses = ["ทุกสถานะ", "รออนุมัติ", "กำลังดำเนินการ", "เสร็จสิ้น"];
  const difficultyOptions = ["ทุกระดับ", ...difficulties];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (difficultyRef.current && !difficultyRef.current.contains(e.target as Node)) {
        setShowDifficultyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Reset text drafts whenever a different record is opened */
  useEffect(() => {
    if (!selected) return;
    setPsNote(selected.note ?? "");
    setPsNextAppt("");
  }, [selected?.id]);

  /* Save a single field straight into the record */
  const savePatch = (patch: Partial<GroomRecord>, msg: string) => {
    if (!selected) return;
    const updated: GroomRecord = { ...selected, ...patch };
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelected(updated);
    showSnackbar("update", msg);
  };

  const photoList = selected ? (selected.photos ?? [selected.photo]) : [];
  const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !selected) return;
    const cur = selected.photos ?? [selected.photo];
    if (cur.length >= 4) return;
    savePatch({ photos: [...cur, URL.createObjectURL(f)] }, "อัปโหลดรูปแล้ว");
    e.target.value = "";
  };
  const removePhoto = (idx: number) => {
    if (!selected) return;
    const cur = selected.photos ?? [selected.photo];
    savePatch({ photos: cur.filter((_, i) => i !== idx) }, "ลบรูปแล้ว");
  };
  const saveRating = () => { savePatch({ satisfaction: ratingDraft }, "บันทึกความพึงพอใจแล้ว"); setRatingOpen(false); };
  const openApptPopup = () => {
    if (!selected) return;
    const info = selected.nextApptInfo;
    setPsNextAppt("");
    setApptTime(info?.time ?? "");
    setApptService(info?.service ?? "อาบน้ำตัดขน");
    setApptChannel(info?.channel ?? "โทรศัพท์");
    setApptNote(info?.note ?? "");
    setApptReminder(info?.reminder ?? true);
    setApptOpen(true);
  };
  const saveNextAppt = () => {
    if (!psNextAppt) return;
    const d = new Date(psNextAppt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
    savePatch({ nextAppt: d, nextApptInfo: { date: d, time: apptTime, service: apptService, channel: apptChannel, note: apptNote, reminder: apptReminder } }, "บันทึกนัดครั้งถัดไปแล้ว");
    setApptOpen(false);
  };
  const openNotePopup = () => { setPsNote(selected?.note ?? ""); setNoteOpen(true); };
  const saveNote = () => { savePatch({ note: psNote }, "บันทึกหมายเหตุแล้ว"); setNoteOpen(false); };

  const filtered = records.filter(r => {
    const ms = r.pet.includes(search) || r.owner.includes(search) || r.breed.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "ทุกสถานะ" || r.status === statusFilter;
    const md = difficultyFilter === "ทุกระดับ" || r.difficulty === difficultyFilter;
    let mdate = true;
    if (dateFrom || dateTo) {
      const d = parseGroomDate(r.date);
      if (!d) mdate = false;
      else {
        if (dateFrom && d.getTime() < new Date(dateFrom + "T00:00:00").getTime()) mdate = false;
        if (dateTo && d.getTime() > new Date(dateTo + "T23:59:59").getTime()) mdate = false;
      }
    }
    return ms && mf && md && mdate;
  });

  const diffColor = (d: string) =>
    d === "ยากมาก" ? "#ef4444" : d === "ยาก" ? "#f97316" : d === "ปกติ" ? "#3b82f6" : "#19a589";

  const handleEditSave = (updated: GroomRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelected(updated);
    showSnackbar("update", `แก้ไขข้อมูล "${updated.pet}" เรียบร้อยแล้ว`);
  };

  const handleDeleteConfirm = () => {
    if (!selected) return;
    const name = selected.pet;
    const remaining = records.filter(r => r.id !== selected.id);
    setRecords(remaining);
    setSelected(remaining[0] || null);
    setShowDeleteDialog(false);
    setShowDetail(false);
    showSnackbar("delete", `ลบข้อมูลบริการ "${name}" เรียบร้อยแล้ว`);
  };

  /* ── Unified render: form / detail / list ── */
  return (
    <>
      {showDetail && selected ? (
        /* ── DETAIL VIEW (PetDetail-style: photo hero + info cards) ── */
        <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto" style={{ background: "#FEFBF8" }}>
          {/* Top bar */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100 flex-shrink-0" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setShowDetail(false)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0" style={{ fontWeight: 500 }}>
                <ArrowLeft className="w-3.5 h-3.5" /> กลับ
              </button>
              <div className="hidden sm:flex items-center gap-2 min-w-0 text-[12px]">
                <span className="text-gray-400">อาบน้ำตัดขน</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700 truncate" style={{ fontWeight: 600 }}>{selected.pet}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => setShowEditModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-gray-700 hover:bg-gray-100 transition-colors" style={{ fontWeight: 500 }}>
                <Edit2 className="w-3 h-3" /> <span className="hidden sm:inline">แก้ไข</span>
              </button>
              <button onClick={() => setShowDeleteDialog(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-rose-500 hover:bg-rose-50 transition-colors" style={{ fontWeight: 500 }}>
                <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">ลบ</span>
              </button>
            </div>
          </motion.div>

          {/* Profile hero — blurred photo bg */}
          <motion.section initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden bg-gray-200 flex-shrink-0">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <img src={selected.photo} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(36px) saturate(150%)", transform: "scale(1.4)" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.50) 100%)" }} />
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45) 50%, transparent)" }} />
            </div>
            <div className="relative p-5 sm:p-6">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Avatar + sex badge */}
                <div className="relative flex-shrink-0">
                  <div className="rounded-full p-[3px]" style={{ background: "conic-gradient(from 180deg, #a78bfa, #ec4899, #f59e0b, #22c55e, #3b82f6, #a78bfa)", boxShadow: "0 10px 28px rgba(0,0,0,0.25)" }}>
                    <div className="relative w-[84px] h-[84px] rounded-full overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e6f4f1, #cfe8e2)" }}>
                      <span style={{ fontSize: "calc(38px * var(--fs))", lineHeight: 1 }}>{selected.animal}</span>
                      <img src={selected.photo} alt={selected.pet} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  </div>
                  <span className="absolute -bottom-1 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: GROOM_SEX[selected.id] === "เมีย" ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)", border: "3px solid #ffffff", boxShadow: "0 3px 10px rgba(0,0,0,0.25)" }}>
                    <span className="text-[13px]" style={{ fontWeight: 700, lineHeight: 1 }}>{GROOM_SEX[selected.id] === "เมีย" ? "♀" : "♂"}</span>
                  </span>
                </div>

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-white" style={{ fontWeight: 700, fontSize: "calc(26px * var(--fs))", letterSpacing: "-0.5px", lineHeight: 1.4, paddingBottom: 4, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>{selected.pet}</h1>
                    <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full text-white" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", fontWeight: 600 }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" /> {selected.status}
                    </span>
                  </div>
                  <p className="inline-flex items-center gap-2 text-white/90" style={{ fontSize: "calc(13px * var(--fs))", fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}>
                    <span>{selected.animal}</span> {selected.breed} · สไตล์ {selected.style}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => navigateTo("/owners", { state: { search: selected.owner } })} className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-white transition-all hover:-translate-y-0.5" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.30)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", fontSize: "calc(12px * var(--fs))", fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.18)" }} title={`ดูข้อมูลเจ้าของ: ${selected.owner}`}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.22)" }}>
                      <User className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
                    </span>
                    <span className="truncate max-w-[140px]">{selected.owner}</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.30)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.18)" }}>
                    <Camera className="w-3.5 h-3.5" strokeWidth={2.4} /> พิมพ์ใบเสร็จ
                  </button>
                </div>
              </div>

              {/* Stat chips */}
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                {[
                  { icon: Calendar, label: selected.date, accent: "#a7f3d0" },
                  { icon: User, label: selected.groomer, accent: "#bfdbfe" },
                  { icon: Sparkles, label: `${selected.services.length} บริการ`, accent: "#ddd6fe" },
                  { icon: Tag, label: `฿${selected.price.toLocaleString()}`, accent: "#fde68a" },
                ].map((chip, i) => {
                  const Ico = chip.icon;
                  return (
                    <span key={i} className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-white" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", fontSize: "calc(11.5px * var(--fs))", fontWeight: 600 }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
                        <Ico className="w-3 h-3" style={{ color: chip.accent }} />
                      </span>
                      {chip.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Body — 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
            {/* LEFT — service info (read-only) */}
            <div className="space-y-4 min-w-0">
              <DataSection
                icon={Scissors}
                title="ข้อมูลบริการ"
                subtitle="รายละเอียดการอาบน้ำตัดขน"
                color="#19a589"
                cols={3}
                fields={[
                  { label: "วันที่", value: selected.date, icon: Calendar, color: "#19a589" },
                  { label: "ช่างอาบน้ำ", value: selected.groomer, icon: User, color: "#3b82f6" },
                  { label: "สไตล์", value: selected.style, icon: Scissors, color: "#8b5cf6" },
                  { label: "ความยาว", value: selected.length, icon: Ruler, color: "#f59e0b" },
                  { label: "ขนาด", value: selected.size, icon: Clock, color: "#14b8a6" },
                  { label: "ระดับความยาก", value: selected.difficulty, icon: Zap, color: diffColor(selected.difficulty) },
                ]}
              />

              {/* ความพึงพอใจ + รูปก่อน–หลัง — แบ่งครึ่งใน row เดียว */}
              <div className="grid grid-cols-2 gap-4">
                <PostCard
                  icon={Star}
                  title="ความพึงพอใจ"
                  subtitle="หลังรับบริการ"
                  action={
                    <button onClick={() => { setRatingDraft(selected.satisfaction ?? 0); setRatingOpen(true); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] text-[#0d7c66] bg-[#19a589]/10 hover:bg-[#19a589]/15 transition-colors flex-shrink-0" style={{ fontWeight: 600 }}>
                      <Star className="w-3 h-3" /> {selected.satisfaction ? "แก้ไข" : "ให้คะแนน"}
                    </button>
                  }
                >
                  <div className="h-full flex flex-col items-center justify-center text-center py-2">
                    {selected.satisfaction ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} className="w-6 h-6" style={{ color: n <= (selected.satisfaction ?? 0) ? "#f59e0b" : "#e5e7eb", fill: n <= (selected.satisfaction ?? 0) ? "#f59e0b" : "transparent" }} strokeWidth={2} />
                          ))}
                        </div>
                        <p className="text-[13px] text-gray-700 mt-2.5" style={{ fontWeight: 700 }}>
                          {selected.satisfaction}/5 <span className="text-gray-400" style={{ fontWeight: 500 }}>ดาว</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.08)" }}>
                          <Star className="w-7 h-7 text-amber-300" strokeWidth={1.8} />
                        </div>
                        <p className="text-[12px] text-gray-400 mt-2.5" style={{ fontWeight: 500 }}>ยังไม่ให้คะแนน</p>
                      </>
                    )}
                  </div>
                </PostCard>

                <PostCard
                  icon={Camera}
                  title="รูปก่อน–หลัง"
                  subtitle="สูงสุด 4 รูป"
                  action={photoList.length < 4 ? (
                    <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] text-[#0d7c66] bg-[#19a589]/10 hover:bg-[#19a589]/15 cursor-pointer transition-colors flex-shrink-0" style={{ fontWeight: 600 }}>
                      <Plus className="w-3 h-3" /> เพิ่มภาพ
                      <input type="file" accept="image/*" className="hidden" onChange={addPhoto} />
                    </label>
                  ) : undefined}
                >
                  {photoList.length === 0 ? (
                    <div className="w-full h-20 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-300">
                      <Camera className="w-5 h-5" />
                      <span className="text-[10.5px]" style={{ fontWeight: 600 }}>ยังไม่มีรูป</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {photoList.map((src, i) => (
                        <div key={i} className="group relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="ลบรูป">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </PostCard>
              </div>


              {/* นัดครั้งถัดไป + บันทึกเพิ่มเติม — แบ่งครึ่งใน row เดียว */}
              <div className="grid grid-cols-2 gap-4">
                <PostCard
                  icon={Calendar}
                  title="นัดครั้งถัดไป"
                  subtitle="กำหนดวันนัดถัดไป"
                  action={
                    <button onClick={openApptPopup} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] text-[#0d7c66] bg-[#19a589]/10 hover:bg-[#19a589]/15 transition-colors flex-shrink-0" style={{ fontWeight: 600 }}>
                      <Plus className="w-3 h-3" /> {selected.nextAppt && selected.nextAppt !== "—" ? "แก้ไข" : "ตั้งนัด"}
                    </button>
                  }
                >
                  {selected.nextAppt && selected.nextAppt !== "—" ? (
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(25,165,137,0.1)" }}>
                        <Calendar className="w-5 h-5 text-[#0d7c66]" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>{selected.nextApptInfo?.date ?? selected.nextAppt}</p>
                        <p className="text-[11.5px] text-gray-500 truncate">
                          {selected.nextApptInfo?.time ? `${selected.nextApptInfo.time} น. · ` : ""}{selected.nextApptInfo?.service ?? "อาบน้ำตัดขน"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {selected.nextApptInfo?.channel && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontWeight: 600 }}>{selected.nextApptInfo.channel}</span>
                          )}
                          {selected.nextApptInfo?.reminder && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full text-[#0d7c66] bg-[#19a589]/10 inline-flex items-center gap-1" style={{ fontWeight: 600 }}><Bell className="w-2.5 h-2.5" /> แจ้งเตือน</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-2">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                        <Calendar className="w-6 h-6 text-gray-300" strokeWidth={1.8} />
                      </div>
                      <p className="text-[12px] text-gray-400 mt-2.5" style={{ fontWeight: 500 }}>ยังไม่มีนัด</p>
                    </div>
                  )}
                </PostCard>

                <PostCard
                  icon={MessageSquare}
                  title="บันทึกเพิ่มเติม"
                  subtitle="พฤติกรรม / ข้อสังเกต"
                  action={
                    <button onClick={openNotePopup} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] text-[#0d7c66] bg-[#19a589]/10 hover:bg-[#19a589]/15 transition-colors flex-shrink-0" style={{ fontWeight: 600 }}>
                      <Edit2 className="w-3 h-3" /> {selected.note ? "แก้ไข" : "เพิ่ม"}
                    </button>
                  }
                >
                  {selected.note ? (
                    <p className="text-[12.5px] text-gray-700 line-clamp-4" style={{ fontWeight: 500, lineHeight: 1.5 }}>{selected.note}</p>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-2">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                        <MessageSquare className="w-6 h-6 text-gray-300" strokeWidth={1.8} />
                      </div>
                      <p className="text-[12px] text-gray-400 mt-2.5" style={{ fontWeight: 500 }}>ยังไม่มีบันทึก</p>
                    </div>
                  )}
                </PostCard>
              </div>
            </div>

            {/* RIGHT — POST-SERVICE (each section saves on its own) */}
            <div className="space-y-4 min-w-0">
              {/* บริการที่ใช้ + ค่าบริการรวม (รวมในใบเดียว) */}
              <section className="rounded-2xl border border-gray-100 overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
                <div className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-100/80">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100"><CheckCircle2 className="w-4.5 h-4.5" strokeWidth={2.2} /></div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))", letterSpacing: "-0.2px" }}>บริการ</h2>
                    <p className="text-[11px] text-gray-500">{selected.services.length} รายการ</p>
                  </div>
                </div>
                <ul className="p-2">
                  {selected.services.map(s => {
                    const info = serviceInfo(s);
                    const Ico = info?.icon ?? Sparkles;
                    return (
                      <li key={s} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50/80 transition-colors">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#19a589]/10">
                          <Ico className="w-4 h-4 text-[#0d7c66]" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 600, letterSpacing: "-0.1px" }}>{s}</p>
                          {info?.desc && <p className="text-[11px] text-gray-400 truncate">{info.desc}</p>}
                        </div>
                        {info && <span className="text-[12.5px] text-gray-700 flex-shrink-0" style={{ fontWeight: 700 }}>฿{info.price.toLocaleString()}</span>}
                      </li>
                    );
                  })}
                </ul>
                {/* cost summary — soft green box */}
                {(() => {
                  const subtotal = selected.services.reduce((sum, s) => sum + (serviceInfo(s)?.price ?? 0), 0) || selected.price;
                  const vat = Math.round(subtotal * 0.07);
                  const total = subtotal + vat;
                  return (
                    <div className="px-3 pb-3 pt-1">
                      <div className="rounded-xl p-4" style={{ background: "rgba(25,165,137,0.06)", border: "1px solid rgba(25,165,137,0.16)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-1 h-4 rounded-full" style={{ background: "#19a589" }} />
                          <p className="text-[13px] text-gray-800" style={{ fontWeight: 700 }}>สรุปค่าใช้จ่าย</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[12.5px]">
                            <span className="text-gray-500">รวมค่าบริการ</span>
                            <span className="text-gray-700" style={{ fontWeight: 600 }}>฿{subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-[12.5px]">
                            <span className="text-gray-500">ภาษีมูลค่าเพิ่ม 7%</span>
                            <span className="text-gray-700" style={{ fontWeight: 600 }}>฿{vat.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(25,165,137,0.18)" }}>
                          <span className="text-[14px] text-gray-900" style={{ fontWeight: 800 }}>ยอดรวมทั้งหมด</span>
                          <div className="flex items-baseline gap-0.5 text-[#0d7c66]">
                            <span className="text-[13px]" style={{ fontWeight: 700, opacity: 0.7 }}>฿</span>
                            <span style={{ fontWeight: 800, fontSize: "calc(19px * var(--fs))", letterSpacing: "-0.4px" }}>{total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </section>

            </div>
          </div>
        </div>
      ) : (
        /* ── LIST VIEW (teal hero + card grid — Visits style) ── */
        <div className="flex flex-col h-full p-4 gap-4" style={{ background: "#FEFBF8" }}>
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl flex-shrink-0"
            style={{ backgroundImage: `radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%), radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%), linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)` }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute -top-24 -right-16 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 65%)" }} />
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)" }} />
            </div>
            <div className="relative p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))", border: "1px solid rgba(255,255,255,0.30)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}>
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-white" style={{ fontWeight: 700, fontSize: "calc(22px * var(--fs))", letterSpacing: "-0.4px", lineHeight: 1.15 }}>{t("grooming.title")}</h1>
                  <p className="text-white/70" style={{ fontSize: "calc(12px * var(--fs))" }}>{filtered.length} · {t("grooming.subtitle")}</p>
                </div>

                {/* Create button — top-right like Stock */}
                <button
                  onClick={() => setView("form")}
                  className="inline-flex items-center gap-1.5 px-3.5 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 flex-shrink-0 text-white"
                  style={{ height: 38, background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)", border: "1px solid rgba(253,186,116,0.85)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.55)", fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
                >
                  <Plus className="w-3.5 h-3.5" /> สร้างรายการใหม่
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหา ชื่อสัตว์, เจ้าของ, สายพันธุ์..."
                    className="w-full sm:w-[300px] h-[38px] pl-10 pr-4 rounded-full text-[13px] text-gray-800 bg-white focus:outline-none"
                    style={{ border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)" }}
                  />
                </div>

                {/* Status filter */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowStatusDropdown(v => !v)}
                    className="inline-flex items-center gap-1.5 px-3 rounded-full transition-colors"
                    style={{ height: 38, ...heroPillStyle(statusFilter !== "ทุกสถานะ") }}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span className="text-[12.5px]">{statusFilter === "ทุกสถานะ" ? "ทุกสถานะ" : statusFilter}</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: showStatusDropdown ? "rotate(180deg)" : "none" }} />
                  </button>
                  <AnimatePresence>
                    {showStatusDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                        className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl overflow-hidden p-1.5"
                        style={{ width: 200, boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
                      >
                        {statuses.map((s) => {
                          const isActive = statusFilter === s;
                          const sc = s === "ทุกสถานะ" ? { dot: "bg-gray-300" } : statusCfg(s);
                          return (
                            <button key={s} onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }}
                              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors text-left ${isActive ? "bg-[#19a589]/8" : "hover:bg-gray-50"}`}>
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                              <span className="text-[12px] flex-1" style={{ fontWeight: isActive ? 700 : 500, color: isActive ? "#0d7c66" : "#374151" }}>{s}</span>
                              {isActive && <Check className="w-3.5 h-3.5 text-[#0d7c66]" strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Difficulty filter */}
                <div className="relative" ref={difficultyRef}>
                  <button
                    onClick={() => setShowDifficultyDropdown(v => !v)}
                    className="inline-flex items-center gap-1.5 px-3 rounded-full transition-colors"
                    style={{ height: 38, ...heroPillStyle(difficultyFilter !== "ทุกระดับ") }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[12.5px]">{difficultyFilter === "ทุกระดับ" ? "ทุกระดับ" : difficultyFilter}</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: showDifficultyDropdown ? "rotate(180deg)" : "none" }} />
                  </button>
                  <AnimatePresence>
                    {showDifficultyDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                        className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl overflow-hidden p-1.5"
                        style={{ width: 180, boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
                      >
                        {difficultyOptions.map((d) => {
                          const isActive = difficultyFilter === d;
                          const dot = d === "ทุกระดับ" ? "#cbd5e1" : diffColor(d);
                          return (
                            <button key={d} onClick={() => { setDifficultyFilter(d); setShowDifficultyDropdown(false); }}
                              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors text-left ${isActive ? "bg-[#19a589]/8" : "hover:bg-gray-50"}`}>
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                              <span className="text-[12px] flex-1" style={{ fontWeight: isActive ? 700 : 500, color: isActive ? "#0d7c66" : "#374151" }}>{d}</span>
                              {isActive && <Check className="w-3.5 h-3.5 text-[#0d7c66]" strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ช่วงวันที่ของรายการ */}
                <div className="inline-flex items-center gap-1.5 pl-3 pr-2 rounded-full bg-white"
                  style={{ height: 38, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                  <Calendar className="w-3.5 h-3.5 text-[#19a589] flex-shrink-0" />
                  <span className="text-[11.5px] text-gray-400 whitespace-nowrap" style={{ fontWeight: 600 }}>วันที่</span>
                  <DatePickerModern value={dateFrom} onChange={setDateFrom} variant="ghost" placeholder="เริ่มต้น" max={dateTo || undefined} />
                  <span className="text-gray-300">–</span>
                  <DatePickerModern value={dateTo} onChange={setDateTo} variant="ghost" placeholder="สิ้นสุด" min={dateFrom || undefined} />
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(""); setDateTo(""); }} title="ล้างช่วงวันที่"
                      className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          </motion.section>

          {/* Card grid */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-2">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filtered.map((rec) => (
                <GroomCard key={rec.id} rec={rec} onClick={() => { setSelected(rec); setShowDetail(true); }} />
              ))}
            </motion.div>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">ไม่พบรายการที่ตรงกัน</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Satisfaction rating popup */}
      <AnimatePresence>
        {ratingOpen && selected && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setRatingOpen(false)}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-[360px] overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="vet-modal-header flex items-center gap-3">
                <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}><Star className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>ให้คะแนนความพึงพอใจ</h3>
                  <p className="text-[11px] text-gray-500 truncate">{selected.pet} · {selected.owner}</p>
                </div>
                <button onClick={() => setRatingOpen(false)} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
              </div>
              <div className="p-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setRatingDraft(n)} className="transition-transform hover:scale-110 active:scale-95" title={`${n} ดาว`}>
                      <Star className="w-10 h-10" style={{ color: n <= ratingDraft ? "#f59e0b" : "#e5e7eb", fill: n <= ratingDraft ? "#f59e0b" : "transparent" }} strokeWidth={1.8} />
                    </button>
                  ))}
                </div>
                <p className="text-[13px] text-gray-500" style={{ fontWeight: 600 }}>{ratingDraft ? `${ratingDraft} / 5 ดาว` : "แตะดาวเพื่อให้คะแนน"}</p>
              </div>
              <div className="vet-modal-footer">
                <button onClick={() => setRatingOpen(false)} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={saveRating} disabled={!ratingDraft} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Check className="w-3.5 h-3.5" /> บันทึกคะแนน
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next-appointment popup */}
      <AnimatePresence>
        {apptOpen && selected && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setApptOpen(false)}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-[440px]"
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="vet-modal-header flex items-center gap-3 rounded-t-3xl">
                <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}><Calendar className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>ตั้งนัดครั้งถัดไป</h3>
                  <p className="text-[11px] text-gray-500 truncate">{selected.pet} · {selected.owner}</p>
                </div>
                <button onClick={() => setApptOpen(false)} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
              </div>
              <div className="p-5 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 600 }}>วันที่นัดหมาย</label>
                    <DatePickerModern value={psNextAppt} onChange={setPsNextAppt} />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 600 }}>เวลานัด</label>
                    <TimePickerModern value={apptTime} onChange={setApptTime} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 600 }}>บริการที่นัดหมาย</label>
                  <select value={apptService} onChange={(e) => setApptService(e.target.value)} className="vet-select">
                    <option>อาบน้ำตัดขน</option>
                    <option>อาบน้ำพื้นฐาน</option>
                    <option>ตัดแต่งทั้งชุด</option>
                    <option>ตัดเล็บ</option>
                    <option>บำบัดขนร่วง</option>
                    <option>อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 600 }}>ช่องทางการนัด</label>
                  <div className="flex gap-2">
                    {([{ k: "โทรศัพท์", icon: Phone }, { k: "LINE", icon: MessageSquare }, { k: "Walk-in", icon: User }] as const).map(c => {
                      const on = apptChannel === c.k; const Ico = c.icon;
                      return (
                        <button key={c.k} onClick={() => setApptChannel(c.k)} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] transition-colors" style={{ background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#f3f4f6", color: on ? "#ffffff" : "#6b7280", fontWeight: on ? 700 : 500 }}>
                          <Ico className="w-3.5 h-3.5" /> {c.k}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 600 }}>หมายเหตุ / คำแนะนำ</label>
                  <textarea value={apptNote} onChange={(e) => setApptNote(e.target.value)} rows={2} placeholder="คำแนะนำสำหรับการนัดไป..." className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all placeholder:text-gray-300" />
                </div>

                <button onClick={() => setApptReminder(v => !v)} className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors" style={{ background: apptReminder ? "rgba(25,165,137,0.05)" : "#ffffff", borderColor: apptReminder ? "rgba(25,165,137,0.3)" : "#e5e7eb" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: apptReminder ? "#19a589" : "#f3f4f6" }}>
                    <Bell className="w-4 h-4" style={{ color: apptReminder ? "#ffffff" : "#9ca3af" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-gray-800" style={{ fontWeight: 600 }}>ส่งการแจ้งเตือนอัตโนมัติ</p>
                    <p className="text-[10.5px] text-gray-400">แจ้งเตือนเจ้าของสัตว์ก่อนวันนัด 1 วัน</p>
                  </div>
                  <span className="relative rounded-full flex-shrink-0" style={{ width: 40, height: 22, background: apptReminder ? "#19a589" : "#d1d5db", transition: "background 0.2s" }}>
                    <span className="absolute rounded-full bg-white" style={{ width: 16, height: 16, top: 3, left: apptReminder ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </span>
                </button>
              </div>
              <div className="vet-modal-footer">
                <button onClick={() => setApptOpen(false)} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={saveNextAppt} disabled={!psNextAppt} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Check className="w-3.5 h-3.5" /> บันทึกนัด
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create new record — popup */}
      <AnimatePresence>
        {view === "form" && (
          <motion.div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setView("list")}>
            <motion.div
              className="bg-white rounded-3xl w-full max-w-[920px] overflow-hidden flex flex-col"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <NewRecordForm onBack={() => setView("list")} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Additional note popup */}
      <AnimatePresence>
        {noteOpen && selected && (
          <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNoteOpen(false)}>
            <motion.div className="bg-white rounded-3xl w-full max-w-[420px] overflow-hidden" initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ type: "spring", damping: 28, stiffness: 320 }} onClick={(e) => e.stopPropagation()}>
              <div className="vet-modal-header flex items-center gap-3">
                <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}><MessageSquare className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>บันทึกเพิ่มเติม</h3>
                  <p className="text-[11px] text-gray-500 truncate">{selected.pet} · พฤติกรรม / ข้อสังเกต</p>
                </div>
                <button onClick={() => setNoteOpen(false)} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
              </div>
              <div className="p-5">
                <textarea autoFocus value={psNote} onChange={(e) => setPsNote(e.target.value)} rows={5} placeholder="ระบุพฤติกรรม / ข้อสังเกต / คำแนะนำ..." className="w-full px-3 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all placeholder:text-gray-300" />
              </div>
              <div className="vet-modal-footer">
                <button onClick={() => setNoteOpen(false)} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={saveNote} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> บันทึก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {selected && (
        <EditGroomModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          record={selected}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Dialog */}
      {selected && (
        <DeleteGroomDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          record={selected}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
          >
            <motion.img
              src={lightboxSrc}
              alt="ดูภาพขยาย"
              className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
