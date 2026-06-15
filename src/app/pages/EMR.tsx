import imgRegister from 'figma:asset/a1967352cdbf70082057279d9f1da577111f728b.png';
import imgVitals from 'figma:asset/6317ae4d3b9de7af54e44fd0158fe82a27528f7e.png';
import imgExam from 'figma:asset/96abe847ba3ed1d9fb591820a7ad55ff78054378.png';
import imgDiagnosis from 'figma:asset/b22499c0fc0ff440776a1d8d7d92323051f87be5.png';
import imgVaccine from 'figma:asset/8b808d5c3179978c85ca92be1616bafab275590b.png';
import imgLab from 'figma:asset/6d3f7eb3a84dbadfb81427f57e9bf2e7e36583b7.png';
import imgPrescription from 'figma:asset/45dad44930ed9b7532907081ab7bfe2c59225081.png';
import imgService from 'figma:asset/c61ab29a755633b18786fca68c91658d098e121c.png';
import imgAppointment from 'figma:asset/00ae110dd6fe318c87b85d646478bc142fc97f85.png';
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getSpeciesAvatar } from "../components/petAvatars";
import {
  Search, ChevronRight, ChevronDown, ChevronUp,
  Clock, AlertTriangle, PawPrint, Thermometer, Heart, Wind, Weight,
  ClipboardList, Activity, Stethoscope, BookOpen, Syringe,
  FlaskConical, Pill, Receipt, Calendar, User, MapPin,
  FileText, Phone, Printer, Eye,
} from "lucide-react";

/* ─────────────────────── Types ─────────────────────── */
interface PetEMR {
  id: number;
  hn: string;
  pet: string;
  species: string;
  breed: string;
  sex: string;
  age: string;
  weight: string;
  color: string;
  microchip: string;
  owner: string;
  ownerPhone: string;
  photo: string;
  allergies: string;
  visits: VisitEMR[];
}

interface VisitEMR {
  id: number;
  date: string;
  time: string;
  type: string;
  status: string;
  symptoms: string;
  room: string;
  doctor: string;
  vitals: {
    temp: string;
    pulse: string;
    resp: string;
    weight: string;
    chiefComplaint: string;
    presentIllness: string;
  };
  examFindings: string[];
  diagnoses: { name: string; doctor: string }[];
  vaccines: { name: string; date: string }[];
  labs: { name: string; type: string; date: string; result?: string }[];
  drugs: { name: string; qty: string; instruction: string; doctor: string }[];
  services: { name: string; qty: number; doctor: string; price: number }[];
  appointments: { date: string; time: string; reason: string }[];
}

/* ─────────────────────── Mock Data ─────────────────────── */
const mockPets: PetEMR[] = [
  {
    id: 1, hn: "HN-2026-001", pet: "บัดดี้", species: "สุนัข", breed: "Golden Retriever", sex: "ผู้",
    age: "2 ปี", weight: "28.5 กก.", color: "ทอง", microchip: "900118000123456",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    photo: "https://images.unsplash.com/photo-1734966213753-1b361564bab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    allergies: "เพนิซิลิน",
    visits: [
      {
        id: 101, date: "12/03/2026", time: "08:30", type: "การรักษา", status: "กำลังตรวจ",
        symptoms: "ซึม เบื่ออาหาร 2 วัน มีไข้เล็กน้อย",
        room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
        vitals: { temp: "102.9°F", pulse: "110 bpm", resp: "28 ครั้ง/นาที", weight: "28.5 กก.", chiefComplaint: "ซึม เบื่ออาหาร", presentIllness: "เจ้าของแจ้งว่าน้องไม่กินอาหาร 2 วัน มีอาการซึมลง มีไข้เล็กน้อย ไม่ไอ ไม่จาม ถ่ายปกติ" },
        examFindings: ["ต่อมน้ำเหลืองบริเวณคอโต 2 ข้าง", "เยื่อเมือกเหงือกสีชมพูซีดเล็กน้อย", "หัวใจและปอดปกติ", "ช่องท้อง soft ไม่เจ็บ"],
        diagnoses: [{ name: "Fever of unknown origin", doctor: "สพ.ว. สมชาย" }, { name: "Lymphadenopathy", doctor: "สพ.ว. สมชาย" }],
        vaccines: [],
        labs: [{ name: "CBC (Complete Blood Count)", type: "lab", date: "12/03/2026", result: "WBC สูงเล็กน้อย" }, { name: "Blood Chemistry", type: "lab", date: "12/03/2026" }],
        drugs: [{ name: "อะม็อกซิซิลลิน 250mg", qty: "2 แผง", instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 7 วัน", doctor: "สพ.ว. สมชาย" }, { name: "เมโทรนิดาโซล 250mg", qty: "1 แผง", instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 5 วัน", doctor: "สพ.ว. สมชาย" }],
        services: [{ name: "ค่าตรวจ", qty: 1, doctor: "สพ.ว. สมชาย", price: 300 }, { name: "ตรวจเลือด CBC", qty: 1, doctor: "สพ.ว. สมชาย", price: 450 }, { name: "Blood Chemistry", qty: 1, doctor: "สพ.ว. สมชาย", price: 650 }],
        appointments: [{ date: "19/03/2026", time: "09:00", reason: "ติดตามผลหลังรักษา 7 วัน" }],
      },
      {
        id: 102, date: "05/02/2026", time: "10:00", type: "วัคซีน", status: "เสร็จสิ้น",
        symptoms: "ฉีดวัคซีนประจำปี",
        room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
        vitals: { temp: "101.5°F", pulse: "98 bpm", resp: "22 ครั้ง/นาที", weight: "28.0 กก.", chiefComplaint: "มาฉีดวัคซีนประจำปี", presentIllness: "สุขภาพดี กินอาหารปกติ ร่าเริง" },
        examFindings: ["ร่างกายสมส่วน สุขภาพโดยรวมดี", "หัวใจ/ปอดปกติ"],
        diagnoses: [],
        vaccines: [{ name: "DHPP (Canine Distemper)", date: "05/02/2026" }, { name: "Rabies", date: "05/02/2026" }],
        labs: [],
        drugs: [],
        services: [{ name: "ค่าฉีดวัคซีน DHPP", qty: 1, doctor: "สพ.ว. สมชาย", price: 600 }, { name: "ค่าฉีดวัคซีนพิษสุนัขบ้า", qty: 1, doctor: "สพ.ว. สมชาย", price: 350 }],
        appointments: [{ date: "05/02/2027", time: "10:00", reason: "ฉีดวัคซีนประจำปีครั้งถัดไป" }],
      },
      {
        id: 103, date: "15/11/2025", time: "14:00", type: "การรักษา", status: "เสร็จสิ้น",
        symptoms: "ท้องเสีย อาเจียน",
        room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. วรรณา",
        vitals: { temp: "101.8°F", pulse: "105 bpm", resp: "24 ครั้ง/นาที", weight: "27.8 กก.", chiefComplaint: "ท้องเสีย อาเจียน 1 วัน", presentIllness: "กินอาหารผิดปกติ (กระดูกไก่) แล้วอาเจียนและถ่ายเหลว" },
        examFindings: ["เจ็บปวดเล็กน้อยบริเวณช่องท้อง", "Dehydration ระดับเล็กน้อย"],
        diagnoses: [{ name: "Acute gastroenteritis", doctor: "สพ.ว. วรรณา" }],
        vaccines: [],
        labs: [],
        drugs: [{ name: "เมโทโคลพราไมด์", qty: "1 ขวด", instruction: "ฉีดใต้ผิวหนัง 1 ครั้ง", doctor: "สพ.ว. วรรณา" }, { name: "Probiotics", qty: "1 กล่อง", instruction: "ผสมอาหารวันละ 1 ครั้ง นาน 5 วัน", doctor: "สพ.ว. วรรณา" }],
        services: [{ name: "ค่าตรวจ", qty: 1, doctor: "สพ.ว. วรรณา", price: 300 }, { name: "น้ำเกลือ", qty: 1, doctor: "สพ.ว. วรรณา", price: 250 }],
        appointments: [{ date: "18/11/2025", time: "10:00", reason: "ติดตามอาการท้องเสีย" }],
      },
    ],
  },
  {
    id: 2, hn: "HN-2026-002", pet: "มิ้ว", species: "แมว", breed: "Scottish Fold", sex: "เมีย",
    age: "3 ปี", weight: "4.2 กก.", color: "เทา", microchip: "900118000654321",
    owner: "กัญญา สุวรรณ", ownerPhone: "091-678-9012",
    photo: "https://images.unsplash.com/photo-1634546865062-ed3eb17643f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    allergies: "",
    visits: [
      {
        id: 201, date: "12/03/2026", time: "09:00", type: "การรักษา", status: "รอตรวจ",
        symptoms: "ตาแดง น้ำตาไหล",
        room: "ห้อง 2 — ตา/หู", doctor: "สพ.ว. วรรณา",
        vitals: { temp: "101.3°F", pulse: "180 bpm", resp: "30 ครั้ง/นาที", weight: "4.2 กก.", chiefComplaint: "ตาแดง น้ำตาไหลทั้งสองข้าง", presentIllness: "เริ่มมีอาการตาแดง 3 วันก่อน น้ำตาไหลมากขึ้น ขยี้ตาบ่อย" },
        examFindings: ["Conjunctivitis ทั้งสองข้าง", "ไม่มี Corneal ulcer"],
        diagnoses: [{ name: "Bilateral conjunctivitis", doctor: "สพ.ว. วรรณา" }],
        vaccines: [],
        labs: [],
        drugs: [{ name: "ยาหยอดตา Tobramycin", qty: "1 ขวด", instruction: "หยอดตาข้างละ 1 หยด วันละ 3 ครั้ง นาน 7 วัน", doctor: "สพ.ว. วรรณา" }],
        services: [{ name: "ค่าตรวจตา", qty: 1, doctor: "สพ.ว. วรรณา", price: 400 }],
        appointments: [{ date: "19/03/2026", time: "10:00", reason: "ตรวจตาติดตามผล" }],
      },
    ],
  },
  {
    id: 3, hn: "HN-2026-003", pet: "แม็กซ์", species: "สุนัข", breed: "Black Labrador", sex: "ผู้",
    age: "4 ปี", weight: "32.0 กก.", color: "ดำ", microchip: "900118000789012",
    owner: "ประพันธ์ มงคล", ownerPhone: "089-234-5678",
    photo: "https://images.unsplash.com/photo-1713241931215-aa8d25a9cd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    allergies: "",
    visits: [
      {
        id: 301, date: "12/03/2026", time: "09:15", type: "วัคซีน", status: "รอตรวจ",
        symptoms: "ฉีดวัคซีนประจำปี DHPP",
        room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
        vitals: { temp: "101.7°F", pulse: "90 bpm", resp: "20 ครั้ง/นาที", weight: "32.0 กก.", chiefComplaint: "มาฉีดวัคซีน DHPP ประจำปี", presentIllness: "สุขภาพแข็งแรง ไม่มีอาการผิดปกติ" },
        examFindings: ["สุขภาพโดยรวมดี", "น้ำหนักเหมาะสม"],
        diagnoses: [],
        vaccines: [{ name: "DHPP (Canine Distemper)", date: "12/03/2026" }],
        labs: [],
        drugs: [],
        services: [{ name: "ค่าฉีดวัคซีน DHPP", qty: 1, doctor: "สพ.ว. สมชาย", price: 600 }],
        appointments: [{ date: "12/03/2027", time: "09:00", reason: "ฉีดวัคซีน DHPP ปีถัดไป" }],
      },
    ],
  },
  {
    id: 4, hn: "HN-2026-004", pet: "ป๊อบ", species: "สุนัข", breed: "Pomeranian", sex: "ผู้",
    age: "1.5 ปี", weight: "3.8 กก.", color: "ส้ม", microchip: "900118000345678",
    owner: "วิชัย มงคล", ownerPhone: "083-456-7890",
    photo: "https://images.unsplash.com/photo-1626975896819-8884aa7034d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    allergies: "ซัลฟา",
    visits: [
      {
        id: 401, date: "12/03/2026", time: "09:45", type: "การรักษา", status: "รอตรวจ",
        symptoms: "ผิวหนังคัน ขนร่วงบริเวณหลัง",
        room: "ห้อง 3 — ผิวหนัง", doctor: "สพ.ว. วรรณา",
        vitals: { temp: "101.5°F", pulse: "130 bpm", resp: "26 ครั้ง/นาที", weight: "3.8 กก.", chiefComplaint: "คันตามตัว ขนร่วง", presentIllness: "เริ่มมีอาการคัน 2 สัปดาห์ ขนร่วงบริเวณหลังและขาหลัง เกาจนเป็นแผล" },
        examFindings: ["Alopecia บริเวณหลังและขาหลัง", "ผิวหนังแดง มี Scale เล็กน้อย", "Skin scraping: Demodex (+)"],
        diagnoses: [{ name: "Demodicosis", doctor: "สพ.ว. วรรณา" }],
        vaccines: [],
        labs: [{ name: "Skin scraping", type: "lab", date: "12/03/2026", result: "Demodex mites พบ" }],
        drugs: [{ name: "Ivermectin 1%", qty: "1 ขวด", instruction: "กินตามน้ำหนัก สัปดาห์ละ 1 ครั้ง", doctor: "สพ.ว. วรรณา" }, { name: "แชมพู Benzoyl Peroxide", qty: "1 ขวด", instruction: "อาบทุก 3 วัน แช่ทิ้งไว้ 10 นาที", doctor: "สพ.ว. วรรณา" }],
        services: [{ name: "ค่าตรวจ", qty: 1, doctor: "สพ.ว. วรรณา", price: 300 }, { name: "ค่าขูดผิวหนัง (Skin scraping)", qty: 1, doctor: "สพ.ว. วรรณา", price: 350 }],
        appointments: [{ date: "26/03/2026", time: "10:00", reason: "ติดตามผลรักษา Demodex 2 สัปดาห์" }],
      },
    ],
  },
];

/* ─────────────────────── EMR Section Tabs ─────────────────────── */
const emrTabs = [
  { key: "register", label: "บันทึกส่งตรวจ", img: imgRegister, icon: ClipboardList },
  { key: "vitals", label: "สัญญาณชีพ", img: imgVitals, icon: Activity },
  { key: "exam", label: "ตรวจร่างกาย", img: imgExam, icon: Stethoscope },
  { key: "diagnosis", label: "วินิจฉัย", img: imgDiagnosis, icon: BookOpen },
  { key: "vaccine", label: "วัคซีน", img: imgVaccine, icon: Syringe },
  { key: "lab", label: "แล็บ / เอกซเรย์", img: imgLab, icon: FlaskConical },
  { key: "prescription", label: "ใบสั่งยา", img: imgPrescription, icon: Pill },
  { key: "service", label: "ค่าบริการ", img: imgService, icon: Receipt },
  { key: "appointment", label: "นัดหมาย", img: imgAppointment, icon: Calendar },
];

/* ─── Status config ─── */
const statusStyle = (s: string) => {
  if (s === "กำลังตรวจ") return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-100" };
  if (s === "เสร็จสิ้น") return { bg: "bg-[#19a589]/10", text: "text-[#0d7c66]", dot: "bg-[#19a589]", border: "border-[#19a589]/20" };
  if (s === "ยกเลิก") return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", border: "border-red-100" };
  return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-100" };
};

const typeBadge = (t: string) => {
  if (t === "วัคซีน") return "bg-[#19a589]/10 text-[#0d7c66]";
  if (t === "ฉุกเฉิน") return "bg-red-50 text-red-600";
  if (t === "ติดตามผล") return "bg-purple-50 text-purple-700";
  return "bg-blue-50 text-blue-700";
};

/* ─── Animation ─── */
const cv = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const iv = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

/* ═══════════════════════════════════════════════════════════════════ */
/*  EMR Section Content                                                */
/* ═══════════════════════════════════════════════════════════════════ */
function SectionHeader({ icon: Icon, title, count }: { icon: React.ElementType; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)" }}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[15px] text-gray-800" style={{ fontWeight: 600 }}>{title}</span>
      {count !== undefined && (
        <span className="text-[11px] text-[#19a589] bg-[#19a589]/10 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{count} รายการ</span>
      )}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs truncate ml-4 ${highlight ? "text-[#0d7c66]" : "text-gray-700"}`} style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-300">
      <FileText className="w-8 h-8 mb-2" />
      <span className="text-xs">{text}</span>
    </div>
  );
}

function EMRContent({ visit, activeTab }: { visit: VisitEMR; activeTab: string }) {
  const content = () => {
    switch (activeTab) {
      case "register":
        return (
          <div>
            <SectionHeader icon={ClipboardList} title="บันทึกส่งตรวจ" />
            <div className="bg-gray-50 rounded-xl p-4 space-y-0">
              <InfoRow label="วันที่มารับบริการ" value={`${visit.date} — ${visit.time} น.`} />
              <InfoRow label="ประเภท" value={visit.type} />
              <InfoRow label="สถานะ" value={visit.status} highlight />
              <InfoRow label="อาการที่พบ" value={visit.symptoms} />
              <InfoRow label="ห้องตรวจ" value={visit.room} />
              <InfoRow label="แพทย์ผู้รักษา" value={visit.doctor} highlight />
            </div>
          </div>
        );
      case "vitals":
        return (
          <div>
            <SectionHeader icon={Activity} title="สัญญาณชีพ" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: Thermometer, label: "อุณหภูมิ", value: visit.vitals.temp, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
                { icon: Heart, label: "ชีพจร", value: visit.vitals.pulse, color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
                { icon: Wind, label: "การหายใจ", value: visit.vitals.resp, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
                { icon: Weight, label: "น้ำหนัก", value: visit.vitals.weight, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
              ].map((v) => (
                <div key={v.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: v.bg }}>
                      <v.icon className="w-3.5 h-3.5" style={{ color: v.color }} />
                    </div>
                    <span className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>{v.label}</span>
                  </div>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{v.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-[11px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>อาการสำคัญ</span>
                <p className="text-xs text-gray-700">{visit.vitals.chiefComplaint}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-[11px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ประวัติอาการปัจจุบัน</span>
                <p className="text-xs text-gray-700 leading-relaxed">{visit.vitals.presentIllness}</p>
              </div>
            </div>
          </div>
        );
      case "exam":
        return (
          <div>
            <SectionHeader icon={Stethoscope} title="ตรวจร่างกาย" count={visit.examFindings.length} />
            {visit.examFindings.length > 0 ? (
              <div className="space-y-2">
                {visit.examFindings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#19a589]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] text-[#19a589]" style={{ fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <span className="text-xs text-gray-700 leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState text="ไม่มีบันทึกการตรวจร่างกาย" />}
          </div>
        );
      case "diagnosis":
        return (
          <div>
            <SectionHeader icon={BookOpen} title="การวินิจฉัย" count={visit.diagnoses.length} />
            {visit.diagnoses.length > 0 ? (
              <div className="space-y-2">
                {visit.diagnoses.map((d, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <span className="text-xs text-gray-800" style={{ fontWeight: 500 }}>{d.name}</span>
                    </div>
                    <span className="text-[11px] text-[#0d7c66]" style={{ fontWeight: 500 }}>{d.doctor}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState text="ไม่มีการวินิจฉัย" />}
          </div>
        );
      case "vaccine":
        return (
          <div>
            <SectionHeader icon={Syringe} title="ประวัติฉีดวัคซีน" count={visit.vaccines.length} />
            {visit.vaccines.length > 0 ? (
              <div className="space-y-2">
                {visit.vaccines.map((v, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Syringe className="w-3.5 h-3.5 text-teal-600" />
                      </div>
                      <span className="text-xs text-gray-800" style={{ fontWeight: 500 }}>{v.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {v.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : <EmptyState text="ไม่มีประวัติวัคซีนในรอบนี้" />}
          </div>
        );
      case "lab":
        return (
          <div>
            <SectionHeader icon={FlaskConical} title="แล็บ / เอกซเรย์" count={visit.labs.length} />
            {visit.labs.length > 0 ? (
              <div className="space-y-2">
                {visit.labs.map((l, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-xs text-gray-800" style={{ fontWeight: 500 }}>{l.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.type === "lab" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`} style={{ fontWeight: 600 }}>
                        {l.type === "lab" ? "Lab" : "X-Ray"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between ml-[34px]">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {l.date}</span>
                      {l.result && <span className="text-[11px] text-[#0d7c66]" style={{ fontWeight: 500 }}>ผล: {l.result}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState text="ไม่มีคำสั่ง Lab/X-Ray" />}
          </div>
        );
      case "prescription":
        return (
          <div>
            <SectionHeader icon={Pill} title="ใบสั่งยา" count={visit.drugs.length} />
            {visit.drugs.length > 0 ? (
              <div className="space-y-2">
                {visit.drugs.map((d, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Pill className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <span className="text-xs text-gray-800" style={{ fontWeight: 500 }}>{d.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-500" style={{ fontWeight: 500 }}>จำนวน: {d.qty}</span>
                    </div>
                    <div className="ml-[34px] space-y-0.5">
                      <p className="text-[11px] text-gray-500">{d.instruction}</p>
                      <p className="text-[11px] text-[#0d7c66]" style={{ fontWeight: 500 }}>แพทย์ผู้สั่ง: {d.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState text="ไม่มีใบสั่งยา" />}
          </div>
        );
      case "service":
        return (
          <div>
            <SectionHeader icon={Receipt} title="ค่าบริการ" count={visit.services.length} />
            {visit.services.length > 0 ? (
              <>
                <div className="space-y-2 mb-3">
                  {visit.services.map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                          <Receipt className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div>
                          <span className="text-xs text-gray-800 block" style={{ fontWeight: 500 }}>{s.name}</span>
                          <span className="text-[11px] text-gray-400">จำนวน: {s.qty} | {s.doctor}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-800" style={{ fontWeight: 600 }}>฿{s.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-[#19a589]/5 rounded-xl px-4 py-3 border border-[#19a589]/10">
                  <span className="text-xs text-[#0d7c66]" style={{ fontWeight: 600 }}>รวมค่าบริการ</span>
                  <span className="text-sm text-[#0d7c66]" style={{ fontWeight: 700 }}>฿{visit.services.reduce((sum, s) => sum + s.price * s.qty, 0).toLocaleString()}</span>
                </div>
              </>
            ) : <EmptyState text="ไม่มีค่าบริการ" />}
          </div>
        );
      case "appointment":
        return (
          <div>
            <SectionHeader icon={Calendar} title="ประวัตินัดหมาย" count={visit.appointments.length} />
            {visit.appointments.length > 0 ? (
              <div className="space-y-2">
                {visit.appointments.map((a, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                        </div>
                        <span className="text-xs text-gray-800" style={{ fontWeight: 500 }}>{a.date} — {a.time} น.</span>
                      </div>
                    </div>
                    <div className="ml-[34px]">
                      <p className="text-[11px] text-gray-500">{a.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState text="ไม่มีประวัตินัดหมาย" />}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {content()}
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main EMR Page                                                      */
/* ═══════════════════════════════════════════════════════════════════ */
export function EMR() {
  const [search, setSearch] = useState("");
  const [selectedPet, setSelectedPet] = useState<PetEMR | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<VisitEMR | null>(null);
  const [activeTab, setActiveTab] = useState("register");
  const [petInfoExpanded, setPetInfoExpanded] = useState(true);

  const filtered = mockPets.filter(
    (p) =>
      p.pet.includes(search) ||
      p.hn.includes(search) ||
      p.owner.includes(search) ||
      p.breed.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectPet = (pet: PetEMR) => {
    setSelectedPet(pet);
    setSelectedVisit(pet.visits[0] || null);
    setActiveTab("register");
  };

  return (
    <motion.div
      variants={cv}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col"
    >
      {/* ═══ Header ═══ */}
      <motion.div variants={iv} className="px-4 lg:px-6 pt-5 pb-4 flex-shrink-0">
        <div className="relative overflow-hidden rounded-2xl px-5 py-5" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 50%, #f3faf8 100%)" }}>
          <div className="absolute top-0 right-0 w-40 h-40 opacity-30" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)" }} />
          <div className="relative flex items-center gap-3.5">
            <div className="vet-modal-header-icon">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="vet-section-title">EMR — เวชระเบียนอิเล็กทรอนิกส์</h1>
              <p className="vet-tiny mt-0.5">ดูประวัติการรักษาของสัตว์เลี้ยงแบบละเอียด</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ Content ═══ */}
      <div className="flex-1 flex overflow-hidden px-4 lg:px-6 pb-4 gap-4 min-h-0">
        {/* ── Left: Pet List ── */}
        <motion.div variants={iv} className="w-72 xl:w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                className="vet-search"
                placeholder="ค้นหาชื่อสัตว์ / HN / เจ้าของ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Pet List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.map((pet) => {
              const isActive = selectedPet?.id === pet.id;
              return (
                <motion.button
                  key={pet.id}
                  variants={iv}
                  onClick={() => handleSelectPet(pet)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isActive
                      ? "bg-[#19a589]/8 border border-[#19a589]/15"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ${isActive ? "ring-[#19a589]/30" : "ring-gray-100"}`}>
                    <img src={pet.photo} alt={pet.pet} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-800 truncate" style={{ fontWeight: isActive ? 600 : 500 }}>{pet.pet}</span>
                      {pet.allergies && <AlertTriangle className="w-3 h-3 text-orange-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-gray-400 truncate">{pet.breed}</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[11px] text-gray-400">{pet.hn}</span>
                    </div>
                    <span className="text-[11px] text-gray-300 truncate block">{pet.owner}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-[#19a589] bg-[#19a589]/10 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                      {pet.visits.length} Visit{pet.visits.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-[10px] text-gray-300">{pet.species}</span>
                  </div>
                </motion.button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-300 text-xs">ไม่พบข้อมูล</div>
            )}
          </div>
        </motion.div>

        {/* ── Center: EMR Detail ── */}
        {selectedPet && selectedVisit ? (
          <>
            {/* Visit sidebar nav */}
            <motion.div variants={iv} className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              {/* Pet info header */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setPetInfoExpanded(!petInfoExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#19a589]/20 flex-shrink-0">
                      <img src={selectedPet.photo} alt={selectedPet.pet} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm text-gray-800 block" style={{ fontWeight: 600 }}>{selectedPet.pet}</span>
                      <span className="text-[11px] text-gray-400">{selectedPet.hn}</span>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: petInfoExpanded ? 0 : 180 }} transition={{ duration: 0.25 }}>
                    <ChevronUp className="w-4 h-4 text-gray-300" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {petInfoExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden px-4 pb-3"
                    >
                      <div className="space-y-0 text-xs">
                        {[
                          { l: "พันธุ์", v: selectedPet.breed },
                          { l: "เพศ", v: selectedPet.sex },
                          { l: "อายุ", v: selectedPet.age },
                          { l: "น้ำหนัก", v: selectedPet.weight },
                          { l: "สี", v: selectedPet.color },
                          { l: "เจ้าของ", v: selectedPet.owner },
                          { l: "โทร", v: selectedPet.ownerPhone },
                        ].map((r) => (
                          <div key={r.l} className="flex items-center justify-between py-1.5">
                            <span className="text-gray-400">{r.l}</span>
                            <span className="text-gray-700 truncate ml-2" style={{ fontWeight: 500 }}>{r.v}</span>
                          </div>
                        ))}
                        {selectedPet.allergies && (
                          <div className="flex items-center gap-1.5 mt-1 bg-orange-50 rounded-lg px-2 py-1.5">
                            <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
                            <span className="text-[11px] text-orange-600" style={{ fontWeight: 500 }}>แพ้ยา: {selectedPet.allergies}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Visit list */}
              <div className="px-3 py-2 border-b border-gray-100">
                <span className="text-[11px] text-gray-400" style={{ fontWeight: 600 }}>ประวัติ Visit ({selectedPet.visits.length})</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {selectedPet.visits.map((visit) => {
                  const isActive = selectedVisit?.id === visit.id;
                  const ss = statusStyle(visit.status);
                  return (
                    <button
                      key={visit.id}
                      onClick={() => { setSelectedVisit(visit); setActiveTab("register"); }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-[#19a589]/8 border border-[#19a589]/15"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-700" style={{ fontWeight: 500 }}>{visit.date}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${ss.bg} ${ss.text} border ${ss.border}`} style={{ fontWeight: 500 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                          {visit.status}
                        </span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeBadge(visit.type)}`} style={{ fontWeight: 500 }}>{visit.type}</span>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{visit.symptoms}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Main content area */}
            <motion.div variants={iv} className="flex-1 min-w-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Tab bar */}
              <div className="flex-shrink-0 border-b border-gray-100">
                <div className="flex overflow-x-auto px-2 py-2 gap-1 scrollbar-hide">
                  {emrTabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                          isActive
                            ? "text-[#0d7c66]"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        }`}
                        style={{
                          fontWeight: isActive ? 600 : 400,
                          ...(isActive ? { background: "linear-gradient(90deg, rgba(25,165,137,0.12) 0%, rgba(25,165,137,0.05) 100%)" } : {}),
                        }}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? "bg-white shadow-[0_1px_3px_rgba(25,165,137,0.12)]" : "bg-gray-50"
                        }`}>
                          <img src={tab.img} alt={tab.label} className="w-6 h-6 object-contain" />
                        </div>
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <EMRContent visit={selectedVisit} activeTab={activeTab} />
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Visit: {selectedVisit.date} — {selectedVisit.time} น.</span>
                  <span className="text-gray-200">|</span>
                  <span className="text-[#0d7c66]" style={{ fontWeight: 500 }}>{selectedVisit.doctor}</span>
                </div>
                <button
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
                  style={{ fontWeight: 500 }}
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5" /> พิมพ์
                </button>
              </div>
            </motion.div>
          </>
        ) : (
          /* No selection placeholder */
          <motion.div variants={iv} className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(25,165,137,0.12), rgba(25,165,137,0.05))" }}>
                <FileText className="w-10 h-10 text-[#19a589]/40" />
              </div>
              <p className="text-sm text-gray-400" style={{ fontWeight: 500 }}>เลือกสัตว์เลี้ยงเพื่อดูเวชระเบียน</p>
              <p className="text-xs text-gray-300 mt-1">ค้นหาด้วยชื่อ, HN หรือชื่อเจ้าของ</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
