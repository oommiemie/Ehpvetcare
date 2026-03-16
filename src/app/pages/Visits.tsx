import imgRegister from 'figma:asset/a1967352cdbf70082057279d9f1da577111f728b.png';
import imgVitals from 'figma:asset/6317ae4d3b9de7af54e44fd0158fe82a27528f7e.png';
import imgExam from 'figma:asset/96abe847ba3ed1d9fb591820a7ad55ff78054378.png';
import imgDiagnosis from 'figma:asset/b22499c0fc0ff440776a1d8d7d92323051f87be5.png';
import imgVaccine from 'figma:asset/8b808d5c3179978c85ca92be1616bafab275590b.png';
import imgLab from 'figma:asset/6d3f7eb3a84dbadfb81427f57e9bf2e7e36583b7.png';
import imgPrescription from 'figma:asset/45dad44930ed9b7532907081ab7bfe2c59225081.png';
import imgService from 'figma:asset/c61ab29a755633b18786fca68c91658d098e121c.png';
import imgAppointment from 'figma:asset/00ae110dd6fe318c87b85d646478bc142fc97f85.png';
import imgXray from 'figma:asset/8d6cafbb4412259c659e8d207348ba00e91b3741.png';

// EMR tab icon — 3D medical folder
import imgEMR from "figma:asset/b052f8a153293db4c4328a915c54535745067675.png";

import svgTemplatePaths from "../../imports/svg-fje83nw5y4";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useOutletContext } from "react-router";
import type { LayoutOutletContext } from "../components/Layout";
import { ExamPhotosPanel, ExamBodyMapPanel } from "../components/ExamMediaPanel";
import { RegisterVisitModal, type RegisterVisitData } from "../components/RegisterVisitModal";
import DiagnosisSection from "../components/DiagnosisSection";
import { LabOrderModal } from "../components/LabOrderModal";
import { XRayOrderModal } from "../components/XRayOrderModal";
import { AddServiceModal, type OrderLineItem } from "../components/AddServiceModal";
import { AddDrugModal, type DrugOrderItem } from "../components/AddDrugModal";
import { DatePickerModern } from "../components/DatePickerModern";
import { TimePickerModern } from "../components/TimePickerModern";
import { useSnackbar } from "../contexts/SnackbarContext";
import { EMRHistorySummary } from "../components/EMRHistorySummary";
import {
  AlertTriangle, PawPrint, Thermometer, Heart, Wind, Weight,
  Search, Plus, Printer, Syringe, FlaskConical, Pill, Receipt,
  ChevronLeft, Clock, CheckCircle2, Loader2, Circle,
  ClipboardList, FileText, Stethoscope, Activity, Calendar,
  LayoutList, X, BookOpen, ChevronRight, User, LayoutTemplate, Phone,
  ChevronDown, Home, Scissors, Eye, Ear, Bone, Brain, Droplets,
  Layers, Check, ChevronUp, AlertCircle, MapPin, ImagePlus,
  Pencil, Trash2, CalendarClock,
} from "lucide-react";

/* ─────────────────────── Types ─────────────────────── */
type VisitStatus = "รอตรวจ" | "กำลังตรวจ" | "เสร็จสิ้น" | "ยกเลิก";

interface VisitRecord {
  id: number;
  hn: string;
  pet: string;
  species: string;
  breed: string;
  sex: string;
  owner: string;
  phone: string;
  photo: string;
  weight: string;
  age: string;
  allergies: string;
  symptoms: string;
  room: string;
  doctor: string;
  arrivalTime: string;
  status: VisitStatus;
  type: string;
}

/* ─────────────────────── Mock Data ─────────────────────── */
const mockVisits: VisitRecord[] = [
  {
    id: 1, hn: "HN-2026-001",
    pet: "บัดดี้", species: "สุนัข", breed: "Golden Retriever", sex: "ผู้",
    owner: "สมศักดิ์ ใจดี", phone: "081-234-5678",
    photo: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    weight: "28.5 กก.", age: "2 ปี", allergies: "เพนิซิลิน",
    symptoms: "ซึม เบื่ออาหาร 2 วัน มีไข้เล็กน้อย",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
    arrivalTime: "08:30", status: "กำลังตรวจ", type: "การรักษา",
  },
  {
    id: 2, hn: "HN-2026-002",
    pet: "มิ้ว", species: "แมว", breed: "Scottish Fold", sex: "เมีย",
    owner: "กัญญา สุวรรณ", phone: "091-678-9012",
    photo: "https://images.unsplash.com/photo-1719218214197-441901e981b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    weight: "4.2 กก.", age: "3 ปี", allergies: "",
    symptoms: "ตาแดง น้ำตาไหล",
    room: "ห้อง 2 — ตา/หู", doctor: "สพ.ว. วรรณา",
    arrivalTime: "09:00", status: "รอตรวจ", type: "การรักษา",
  },
  {
    id: 3, hn: "HN-2026-003",
    pet: "แม็กซ์", species: "สุนัข", breed: "Black Labrador", sex: "ผู้",
    owner: "ประพันธ์ มงคล", phone: "089-234-5678",
    photo: "https://images.unsplash.com/photo-1608138498905-05b5cd816a36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    weight: "32.0 กก.", age: "4 ปี", allergies: "",
    symptoms: "ฉีดวัคซีนประจำปี DHPP",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
    arrivalTime: "09:15", status: "รอตรวจ", type: "วัคซีน",
  },
  {
    id: 4, hn: "HN-2026-004",
    pet: "ป๊อบ", species: "สุนัข", breed: "Pomeranian", sex: "ผู้",
    owner: "วิชัย มงคล", phone: "083-456-7890",
    photo: "https://images.unsplash.com/photo-1703368786305-4e1dcfcfd0db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    weight: "3.8 กก.", age: "1.5 ปี", allergies: "ซัลฟา",
    symptoms: "ผิวหนังคัน ขนร่วงบริเวณหลัง",
    room: "ห้อง 3 — ผิวหนัง", doctor: "สพ.ว. วรรณา",
    arrivalTime: "09:45", status: "รอตรวจ", type: "การรักษา",
  },
  {
    id: 5, hn: "HN-2026-005",
    pet: "ลูน่า", species: "แมว", breed: "Persian Cat", sex: "เมีย",
    owner: "วรรณา ศรีสุข", phone: "081-345-6789",
    photo: "https://images.unsplash.com/photo-1673125301353-0eeb662e51d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    weight: "3.5 กก.", age: "2 ปี", allergies: "",
    symptoms: "อาเจียน 3 ครั้ง กินน้อยลง",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
    arrivalTime: "10:00", status: "รอตรวจ", type: "การรักษา",
  },
  {
    id: 6, hn: "HN-2026-006",
    pet: "ชาร์ลี", species: "สุนัข", breed: "Beagle", sex: "ผู้",
    owner: "ธีรพล วงศ์สุวรรณ", phone: "087-567-8901",
    photo: "https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    weight: "9.5 กก.", age: "5 ปี", allergies: "",
    symptoms: "ติดตามผลหลังผ่าตัด 7 วัน",
    room: "ห้อง 2 — ตา/หู", doctor: "สพ.ว. วรรณา",
    arrivalTime: "10:30", status: "เสร็จสิ้น", type: "ติดตามผล",
  },
  {
    id: 7, hn: "HN-2026-007",
    pet: "โกลดี้", species: "สุนัข", breed: "Golden Retriever", sex: "เมีย",
    owner: "สมชาย แก้วใส", phone: "082-111-2233",
    photo: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    weight: "30.0 กก.", age: "3 ปี", allergies: "",
    symptoms: "ท้องเสีย ถ่ายเหลว 1 วัน",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
    arrivalTime: "11:00", status: "รอตรวจ", type: "ฉุกเฉิน",
  },
];

const drugs = [
  { id: 1, name: "อะม็อกซิซิลลิน 250mg", genericName: "Amoxicillin 250mg", qty: 2, unit: "แผง", price: 120, instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 7 วัน", indication: "ติดเชื้อแบคทีเรีย" },
  { id: 2, name: "เพรดนิโซโลน 5mg", genericName: "Prednisolone 5mg", qty: 1, unit: "แผง", price: 80, instruction: "กินวันละ 1 ครั้ง ครั้งละ 0.5 เม็ด นาน 5 วั���", indication: "ลดการอักเสบ" },
];

const services = [
  { id: 1, name: "ค่าตรวจ", qty: 1, unit: "ครั้ง", price: 300, discount: 0 },
  { id: 2, name: "ตรวจเลือด (CBC)", qty: 1, unit: "ชุด", price: 450, discount: 50 },
  { id: 3, name: "น้ำเกลือ", qty: 2, unit: "ถุง", price: 250, discount: 0 },
];

const TAB_REGISTER = "register";
const TAB_VITALS = "vitals";
const TAB_EXAM = "exam";
const TAB_DIAGNOSIS = "diagnosis";
const TAB_VACCINE = "vaccine";
const TAB_LAB = "lab";
const TAB_PRESCRIPTION = "prescription";
const TAB_SERVICE = "service";
const TAB_APPOINTMENT = "appointment";
const TAB_EMR = "emr";

const visitTabs = [
  { key: TAB_REGISTER, label: "บันทึกส่งตรวจ", icon: ClipboardList, img: imgRegister },
  { key: TAB_VITALS, label: "สัญญาณชีพ", icon: Activity, img: imgVitals },
  { key: TAB_EXAM, label: "ตรวจร่างกาย", icon: Stethoscope, img: imgExam },
  { key: TAB_DIAGNOSIS, label: "วินิจฉัย", icon: BookOpen, img: imgDiagnosis },
  { key: TAB_VACCINE, label: "วัคซีน", icon: Syringe, img: imgVaccine },
  { key: TAB_LAB, label: "แล็บ / เอกซเรย์", icon: FlaskConical, img: imgLab },
  { key: TAB_PRESCRIPTION, label: "ใบสั่งยา", icon: Pill, img: imgPrescription },
  { key: TAB_SERVICE, label: "ค่าบริการ", icon: Receipt, img: imgService },
  { key: TAB_APPOINTMENT, label: "นัดหมาย", icon: Calendar, img: imgAppointment },
  { key: TAB_EMR, label: "EMR", icon: FileText, img: imgEMR },
];

/* ─────────────────────── Status helpers ─────────────────────── */
const statusCfg = (s: VisitStatus) => {
  const base = { darkFrom: "", darkVia: "", darkTo: "", darkGlow: "", darkRingA: "", darkRingB: "", darkRingBg: "", darkChipBg: "", darkChipText: "", darkChipBorder: "" };
  if (s === "กำลังตรวจ") return { ...base, cls: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-500", icon: <Loader2 className="w-3 h-3 animate-spin" />, banner: "from-blue-100 to-blue-50", darkFrom: "#172340", darkVia: "#1c2b42", darkTo: "#1e3045", darkGlow: "bg-blue-500/15", darkRingA: "#60a5fa", darkRingB: "#3b82f6", darkRingBg: "#1c2b42", darkChipBg: "bg-blue-400/30", darkChipText: "text-blue-300", darkChipBorder: "border-blue-400/25", lightGrad: "linear-gradient(168deg, #eff6ff 0%, #e0edff 40%, #dbeafe 100%)", lightGlow: "radial-gradient(circle, #93c5fd 0%, rgba(147,197,253,0.5) 35%, transparent 70%)", lightRingFrom: "#60a5fa", lightRingVia: "#3b82f6", lightRingTo: "#2563eb", lightMetaText: "text-blue-700/70", lightDotClr: "text-blue-400", lightPillBg: "bg-blue-600", lightShadow: "rgba(59,130,246,0.10)", lightChipBg: "bg-blue-50 border-blue-200/60 text-blue-600" };
  if (s === "เสร็จสิ้น") return { ...base, cls: "bg-[#19a589]/10 text-[#0d7c66] border-[#19a589]/20", dot: "bg-[#19a589]", icon: <CheckCircle2 className="w-3 h-3" />, banner: "from-[#19a589]/20 to-[#e8f5e9]", darkFrom: "#1e3a20", darkVia: "#243627", darkTo: "#2a3d2c", darkGlow: "bg-[#19a589]/15", darkRingA: "#6abf72", darkRingB: "#19a589", darkRingBg: "#243627", darkChipBg: "bg-[#19a589]/40", darkChipText: "text-[#8bd493]", darkChipBorder: "border-[#19a589]/30", lightGrad: "linear-gradient(168deg, #edf5ee 0%, #e2efe3 40%, #d9e9da 100%)", lightGlow: "radial-gradient(circle, #86d492 0%, rgba(134,212,146,0.5) 35%, transparent 70%)", lightRingFrom: "#6aad70", lightRingVia: "#19a589", lightRingTo: "#0d7c66", lightMetaText: "text-[#2d5232]/70", lightDotClr: "text-[#19a589]", lightPillBg: "bg-[#19a589]", lightShadow: "rgba(25,165,137,0.10)", lightChipBg: "bg-[#19a589]/10 border-[#19a589]/20 text-[#19a589]" };
  if (s === "ยกเลิก")    return { ...base, cls: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-400", icon: <X className="w-3 h-3" />, banner: "from-red-100 to-red-50", darkFrom: "#3a1c1c", darkVia: "#362424", darkTo: "#3d2929", darkGlow: "bg-red-500/15", darkRingA: "#f87171", darkRingB: "#ef4444", darkRingBg: "#362424", darkChipBg: "bg-red-400/30", darkChipText: "text-red-300", darkChipBorder: "border-red-400/25", lightGrad: "linear-gradient(168deg, #fef2f2 0%, #fde8e8 40%, #fecaca 100%)", lightGlow: "radial-gradient(circle, #fca5a5 0%, rgba(252,165,165,0.5) 35%, transparent 70%)", lightRingFrom: "#f87171", lightRingVia: "#ef4444", lightRingTo: "#dc2626", lightMetaText: "text-red-600/70", lightDotClr: "text-red-400", lightPillBg: "bg-red-500", lightShadow: "rgba(239,68,68,0.10)", lightChipBg: "bg-red-50 border-red-200/60 text-red-600" };
  return                          { ...base, cls: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400", icon: <Circle className="w-3 h-3" />, banner: "from-amber-100 to-amber-50", darkFrom: "#3a3118", darkVia: "#362e1e", darkTo: "#3d3520", darkGlow: "bg-amber-500/15", darkRingA: "#fbbf24", darkRingB: "#f59e0b", darkRingBg: "#362e1e", darkChipBg: "bg-amber-400/30", darkChipText: "text-amber-300", darkChipBorder: "border-amber-400/25", lightGrad: "linear-gradient(168deg, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)", lightGlow: "radial-gradient(circle, #fcd34d 0%, rgba(252,211,77,0.5) 35%, transparent 70%)", lightRingFrom: "#fbbf24", lightRingVia: "#f59e0b", lightRingTo: "#d97706", lightMetaText: "text-amber-700/70", lightDotClr: "text-amber-400", lightPillBg: "bg-amber-500", lightShadow: "rgba(245,158,11,0.10)", lightChipBg: "bg-amber-50 border-amber-200/60 text-amber-700" };
};

const typeCfg = (t: string) => {
  if (t === "วัคซีน")    return "bg-[#19a589]/10 text-[#0d7c66]";
  if (t === "ฉุกเฉิน")   return "bg-red-50 text-red-600";
  if (t === "ติดตามผล")  return "bg-purple-50 text-purple-700";
  return "bg-blue-50 text-blue-700";
};

/* ─────────────────────── Animation variants ─────────────────────── */
const cv = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const iv = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

/* ═══════════════════════════════════════════════════════════════════ */
/*  Visit Card                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
function VisitCard({ rec, onClick }: { rec: VisitRecord; onClick: () => void }) {
  const sc = statusCfg(rec.status);
  const tc = typeCfg(rec.type);
  return (
    <motion.button variants={iv} onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#19a589]/20 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden flex flex-col"
    >
      {/* ���─ Banner + Avatar wrapper ── */}
      <div className="relative flex-shrink-0" style={{ marginBottom: 32 }}>
        <div className={`relative h-28 overflow-hidden rounded-t-2xl bg-gradient-to-br ${sc.banner}`}>
          {/* Status badge */}
          <span className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${sc.cls}`} style={{ fontWeight: 500 }}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />{rec.status}
          </span>
          {/* Time badge */}
          <span className="absolute top-3 left-3 flex items-center gap-1 text-xs text-gray-500 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200/50" style={{ fontWeight: 500 }}>
            <Clock className="w-3 h-3" />{rec.arrivalTime}
          </span>
        </div>
        {/* Pet avatar */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full p-[2.5px] shadow-md z-10 bg-white">
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden p-[2px] bg-white">
            <img src={rec.photo} alt={rec.pet} className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="flex-1 flex flex-col px-4 pt-2 pb-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-gray-900" style={{ fontWeight: 700 }}>{rec.pet}</span>
          {rec.allergies && (
            <span title={`แพ้ยา: ${rec.allergies}`}>
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 mt-0.5">{rec.breed}</span>

        {/* Type chip */}
        <div className="mt-2 flex justify-center">
          <span className={`text-xs px-2.5 py-1 rounded-full ${tc}`} style={{ fontWeight: 600 }}>
            {rec.type}
          </span>
        </div>

        {/* Symptoms */}
        <p className="mt-2 text-xs text-gray-400 line-clamp-2 text-center leading-relaxed">{rec.symptoms}</p>

        {/* Owner + Doctor rows */}
        <div className="mt-3 space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-1.5">
            <span className="text-gray-400">เจ้าขอ���</span>
            <span className="text-gray-700 truncate ml-2" style={{ fontWeight: 500 }}>{rec.owner}</span>
          </div>
          <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-1.5">
            <span className="text-gray-400">แพทย์</span>
            <span className="text-[#0d7c66] truncate ml-2" style={{ fontWeight: 500 }}>{rec.doctor}</span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 group-hover:bg-[#19a589]/5 transition-colors">
        <span className="text-xs text-gray-300">{rec.hn}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">{rec.room.split("—")[0].trim()}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#19a589] transition-colors" />
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Profile Info Block (always visible)                               */
/* ═══════════════════════════════════════════════════════════════════ */
function ProfileInfoBlock({ rec, sc }: { rec: VisitRecord; sc: ReturnType<typeof statusCfg> }) {
  return (
    <div className="relative z-10 px-5 pt-5 pb-5 text-center">
      {/* Avatar */}
      <div className="flex justify-center mb-3">
        <div className="w-[80px] h-[80px] rounded-full p-[3px] shadow-lg shadow-black/20" style={{ background: `linear-gradient(135deg, ${sc.darkRingA}, ${sc.darkRingB})` }}>
          <div className="w-full h-full rounded-full p-[2px]" style={{ backgroundColor: sc.darkRingBg }}>
            <img src={rec.photo} alt={rec.pet} className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      </div>

      {/* Name + allergy icon */}
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-[17px] text-white" style={{ fontWeight: 700 }}>{rec.pet}</span>
        {rec.allergies && (
          <span title={`แพ้ยา: ${rec.allergies}`} className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
          </span>
        )}
      </div>
      <p className="text-xs text-white/50 mt-1">{rec.species} · {rec.breed}</p>

      {/* Type + HN chips */}
      <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
        <span className={`text-[11px] px-2.5 py-1 rounded-full ${sc.darkChipBg} ${sc.darkChipText} ${sc.darkChipBorder} border`} style={{ fontWeight: 600 }}>{rec.type}</span>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/8 text-white/50 border border-white/10" style={{ fontWeight: 500 }}>{rec.hn}</span>
      </div>

      {/* Allergy banner */}
      {rec.allergies && (
        <div className="mt-4 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2.5 text-left">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/20 flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] text-orange-400/70 uppercase tracking-wider" style={{ fontWeight: 600 }}>แพ้ยา</p>
            <p className="text-xs text-orange-300 truncate" style={{ fontWeight: 600 }}>{rec.allergies}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Expandable Info Rows (on white bg, outside dark card)             */
/* ═══════════════════════════════════════════════════════════════════ */
function ProfileExpandableInfo({ rec }: { rec: VisitRecord }) {
  const [expanded, setExpanded] = useState(true);

  const infoRows = [
    { label: "เพศ", value: rec.sex },
    { label: "น้ำหนัก", value: rec.weight },
    { label: "อายุ", value: rec.age },
    { label: "เจ้าของ", value: rec.owner },
    { label: "โทร", value: rec.phone },
  ];

  return (
    <div className="overflow-hidden">
      {/* Expandable info rows */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="info-rows"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-4 pt-4 pb-2 text-xs">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[#101828]/50">{row.label}</span>
                  <span className="text-[#101828]" style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <div className="flex justify-center py-2.5">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 text-[10px] text-[#99a1af] hover:text-gray-600 bg-[#99a1af]/10 hover:bg-[#99a1af]/15 px-3 py-1 rounded-full transition-all"
          style={{ fontWeight: 500 }}
        >
          {expanded ? "ย่อข้อมูล" : "แ���ดงข้อมูลเพิ่มเติม"}
          <motion.span
            animate={{ rotate: expanded ? 0 : 180 }}
            transition={{ duration: 0.25 }}
            className="inline-flex"
          >
            <ChevronUp className="w-3 h-3" />
          </motion.span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Left Sidebar — Pet Profile + Vertical Tab Nav                      */
/* ═══════════════���═══════════════════════════════════════════════════ */
function DetailSidebar({
  rec, onBack, activeTab, setActiveTab,
}: {
  rec: VisitRecord;
  onBack: () => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
}) {
  const sc = statusCfg(rec.status);
  const tc = typeCfg(rec.type);
  const [expanded, setExpanded] = useState(false);

  const infoRows = [
    { label: "เพศ", value: rec.sex },
    { label: "น้ำหนัก", value: rec.weight },
    { label: "อายุ", value: rec.age },
    { label: "เจ้าของ", value: rec.owner },
    { label: "โทร", value: rec.phone },
  ];

  return (
    <div className="flex-shrink-0 w-full md:w-[320px] flex flex-col relative z-10 md:border-r border-gray-200/70 overflow-y-auto bg-white">
      {/* ═══ Profile Card ═══ */}
      <div className="mx-2 mt-2">
        <div className="rounded-2xl flex flex-col items-center gap-3 pb-3" style={{ background: `linear-gradient(168deg, rgba(239,246,255,0.1) 7%, rgba(224,237,255,0.1) 41%, rgba(219,234,254,0.1) 93%), linear-gradient(90deg, #fff, #fff)` }}>
          {/* Gradient banner */}
          <div className="relative w-full overflow-hidden rounded-2xl" style={{ background: sc.lightGrad }}>
            {/* White border overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white" style={{ boxShadow: `0 4px 20px ${sc.lightShadow}` }} />
            {/* Radial glow overlay */}
            <div className="pointer-events-none absolute left-[40px] top-0 w-[240px] h-[160px] rounded-full blur-[64px] opacity-[0.18]" style={{ background: sc.lightGlow }} />

            {/* Top bar: Back + Status */}
            <div className="relative flex items-center justify-between px-3 pt-3 pb-1">
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 bg-white/50 hover:bg-white/70 rounded-full px-3 py-1.5 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span style={{ fontWeight: 500 }}>ย้อนกลับ</span>
              </button>
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${sc.cls}`} style={{ fontWeight: 500 }}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />{rec.status}
              </span>
            </div>

            {/* Profile Content */}
            <div className="relative px-5 pt-3 pb-5 text-center">
              {/* Avatar with gradient ring */}
              <div className="flex justify-center mb-3">
                <div className="rounded-full p-[3px]" style={{ background: `linear-gradient(135deg, ${sc.lightRingFrom}, ${sc.lightRingVia}, ${sc.lightRingTo})`, boxShadow: `0 8px 20px ${sc.lightShadow}` }}>
                  <div className="w-[74px] h-[74px] rounded-full p-[2px] bg-white">
                    <img src={rec.photo} alt={rec.pet} className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Name + allergy icon */}
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[17px] text-[#101828]" style={{ fontWeight: 700 }}>{rec.pet}</span>
                {rec.allergies && (
                  <span title={`แพ้ยา: ${rec.allergies}`} className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ffedd4]">
                    <AlertTriangle className="w-3 h-3 text-[#ff6900]" />
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${sc.lightMetaText}`}>{rec.species} · {rec.breed}</p>

              {/* Type + HN badges */}
              <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${sc.lightChipBg}`} style={{ fontWeight: 600 }}>{rec.type}</span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/60 text-gray-500 border border-gray-200/60" style={{ fontWeight: 500 }}>{rec.hn}</span>
              </div>
            </div>
          </div>

          {/* Expandable info rows */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="info-rows"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden w-full px-5"
              >
                <div className="space-y-0 text-xs pt-1">
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-[8px]">
                      <span className="text-[#101828]/50">{row.label}</span>
                      <span className="text-[#101828] truncate ml-2" style={{ fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand/collapse toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[10px] text-[#99a1af] hover:text-gray-600 bg-[#99a1af]/10 hover:bg-[#99a1af]/15 px-3 py-1 rounded-full transition-all"
            style={{ fontWeight: 500 }}
          >
            {expanded ? "ย่อข้อมูล" : "ข้อมูลเพิ่ม"}
            <motion.span animate={{ rotate: expanded ? 0 : 180 }} transition={{ duration: 0.25 }} className="inline-flex">
              <ChevronUp className="w-3 h-3" />
            </motion.span>
          </button>
        </div>
      </div>

      {/* ═══ Vertical Tab Nav ═══ */}
      <nav className="flex-1 px-2 pt-3 pb-3 overflow-y-auto">
        {visitTabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <div key={tab.key}>
              {idx > 0 && <div className="mx-3 border-t border-gray-100" />}
              <button
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-3.5 text-[13px] rounded-[14px] whitespace-nowrap transition-all relative ${
                  isActive
                    ? "text-[#0d7c66]"
                    : "text-[#6a7282] hover:text-gray-800 hover:bg-gray-100/50"
                }`}
                style={{
                  fontWeight: isActive ? 600 : 400,
                  ...(isActive ? { background: "linear-gradient(90deg, rgba(25,165,137,0.12) 0%, rgba(25,165,137,0.05) 100%)" } : {}),
                }}
              >
                {/* Active left indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#19a589]" />
                )}
                <div className={`w-7 h-7 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive
                    ? "bg-white shadow-[0px_1px_3px_rgba(25,165,137,0.12)]"
                    : "bg-gray-50"
                }`}>
                  <img src={tab.img} alt={tab.label} className="w-7 h-7 object-contain" />
                </div>
                {tab.label}
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Detail View (tabs)                                                 */
/* ═══════════════════════════════════════════════════════════════════ */
function DetailView({ rec, onBack }: { rec: VisitRecord; onBack: () => void }) {
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(TAB_REGISTER);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [examStatus, setExamStatus] = useState<Record<string, "ปกติ" | "ผิดปกติ" | "ไม่ได้ตรวจ">>({
    "ตา": "ปกติ", "หู": "ปกติ", "จมูก": "ปกติ", "ปาก/ฟัน": "ปกติ",
    "หัวใจและหลอดเลือด": "ปกติ", "ระบบทางเดินหายใจ": "ปกติ",
    "ระบบทางเดินอาหาร": "ปกติ", "ระบบทางเดินปัสสาวะ": "ปกติ",
    "กระดูกและกล้ามเนื้อ": "ปกติ", "ระบบประสาท": "ปกติ",
    "ผิวหนังและขน": "ปกติ", "ต่อมน้ำเหลือง": "ปกติ",
  });
  const [examNote, setExamNote] = useState("");
  const [examNoteOpen, setExamNoteOpen] = useState(true);
  const [examSectionsOpen, setExamSectionsOpen] = useState<Record<string, boolean>>({
    head: true, internal: true, external: true,
  });
  const [paid, setPaid] = useState(false);
  const [vitals, setVitals] = useState<Record<string, string>>({
    "อุณหภูมิ": "", "ชีพจร": "", "อัตราหายใจ": "", "น้ำหนัก": "",
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["เบื่ออาหาร"]);
  const [visitType, setVisitType] = useState("ตรวจสุขภาพทั่วไป");
  const [visitTypeOpen, setVisitTypeOpen] = useState(false);
  const [expandedVaxData, setExpandedVaxData] = useState<{ date: string; vaccine: string; vet: string; method: string; status: string; isWarning: boolean; batch: string; site: string; next: string; note: string } | null>(null);
  const [vaccineExpiryDate, setVaccineExpiryDate] = useState("");
  const [vaccineInjectionTime, setVaccineInjectionTime] = useState("10:30");
  const [expandedDiagHistory, setExpandedDiagHistory] = useState<{ date: string; icd: string; disease: string; diagType: string; vet: string; status: string; note: string; priority: string; licenseNo: string } | null>(null);
  const [expandedDrugHistory, setExpandedDrugHistory] = useState<{ date: string; drugName: string; qty: string; instruction: string; indication: string; vet: string; status: string; note: string; refillable: boolean } | null>(null);
  const visitTypeRef = useRef<HTMLDivElement>(null);
  const [visitRoom, setVisitRoom] = useState("");
  const [visitRoomOpen, setVisitRoomOpen] = useState(false);
  const visitRoomRef = useRef<HTMLDivElement>(null);
  const [visitDoctor, setVisitDoctor] = useState("");
  const [visitDoctorOpen, setVisitDoctorOpen] = useState(false);
  const visitDoctorRef = useRef<HTMLDivElement>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [apptSaving, setApptSaving] = useState(false);
  const [apptForm, setApptForm] = useState({ date: "", time: "09:00", type: "ตรวจติดตามอาการ", room: "", doctor: "", note: "" });
  const apptTypeIconMap: Record<string, string> = { "ตรวจติดตามอาการ": "🩺", "ฉีดวัคซีน (กระตุ้น)": "💉", "ตรวจสุขภาพประจำปี": "📋", "รับผลแล็บ": "🔬", "ผ่าตัด": "🏥", "ตรวจทันตกรรม": "🦷", "อาบน้ำ / ตัดขน": "✂️", "อื่น ๆ": "📌" };
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const [upcomingAppts, setUpcomingAppts] = useState([
    { id: "init-1", day: "20", month: "มี.ค.", year: "2569", time: "10:00", type: "ตรวจติดตามอาการ", doctor: "สพ.ว. สมชาย", room: "ห้อง 1 — ทั่วไป", note: "ตรวจผลเลือดหลังให้ยา 2 สัปดาห์", icon: "🩺" },
    { id: "init-2", day: "10", month: "เม.ย.", year: "2569", time: "09:30", type: "ฉีดวัคซีน (กระตุ้น)", doctor: "สพ.ว. สมชาย", room: "ห้อง 1 — ทั่วไป", note: "วัคซีนพิษสุนัขบ้า ครั้งที่ 2", icon: "💉" },
  ]);
  const [rescheduleAppt, setRescheduleAppt] = useState<typeof upcomingAppts[number] | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("09:00");
  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleAppt) return;
    const d = new Date(rescheduleDate);
    setUpcomingAppts(prev =>
      prev.map(a => a.id === rescheduleAppt.id ? {
        ...a,
        day: String(d.getDate()).padStart(2, "0"),
        month: thaiMonths[d.getMonth()],
        year: String(d.getFullYear() + 543),
        time: rescheduleTime,
      } : a).sort((a, b) => {
        const da = parseInt(a.year) * 10000 + thaiMonths.indexOf(a.month) * 100 + parseInt(a.day);
        const db = parseInt(b.year) * 10000 + thaiMonths.indexOf(b.month) * 100 + parseInt(b.day);
        return da - db;
      })
    );
    setRescheduleAppt(null);
    setRescheduleDate("");
    setRescheduleTime("09:00");
    showSnackbar("success", "เลื่อนนัดหมายเรียบร้อยแล้ว");
  };
  const handleSaveAppointment = () => {
    if (!apptForm.date) return;
    setApptSaving(true);
    setTimeout(() => {
      const d = new Date(apptForm.date);
      const newAppt = {
        id: `appt-${Date.now()}`,
        day: String(d.getDate()).padStart(2, "0"),
        month: thaiMonths[d.getMonth()],
        year: String(d.getFullYear() + 543),
        time: apptForm.time,
        type: apptForm.type,
        doctor: apptForm.doctor || rec.doctor,
        room: apptForm.room || "ห้อง 1 — ทั่วไป",
        note: apptForm.note,
        icon: apptTypeIconMap[apptForm.type] || "📌",
      };
      setUpcomingAppts(prev => [...prev, newAppt].sort((a, b) => {
        const da = parseInt(a.year) * 10000 + thaiMonths.indexOf(a.month) * 100 + parseInt(a.day);
        const db = parseInt(b.year) * 10000 + thaiMonths.indexOf(b.month) * 100 + parseInt(b.day);
        return da - db;
      }));
      setApptForm({ date: "", time: "09:00", type: "ตรวจติดตามอาการ", room: "", doctor: "", note: "" });
      setTimeout(() => { setApptSaving(false); setShowAppointmentForm(false); showSnackbar("success", "บันทึกนัดหมายสำเร็จแล้ว"); }, 800);
    }, 400);
  };
  const [selectedPastAppt, setSelectedPastAppt] = useState<{ day: string; month: string; year: string; time: string; type: string; doctor: string; icon: string; status: string; statusCls: string; room: string; note: string; duration: string; cost: string; isCancel: boolean } | null>(null);
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [showXRayOrderModal, setShowXRayOrderModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [serviceItems, setServiceItems] = useState(services);
  const [showAddDrugModal, setShowAddDrugModal] = useState(false);
  const [drugItems, setDrugItems] = useState(drugs);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [stickerSelected, setStickerSelected] = useState<number[]>([]);
  const [xrayOrders, setXrayOrders] = useState<{ exam: string; room: string; urgency: string; status: string; clinicalInfo: string; clinicalDiagnosis: string; note: string; films: string[] }[]>([
    { exam: "Chest AP + Lateral", room: "ห้อง X-Ray 1", urgency: "routine", status: "รอ", clinicalInfo: "ไอเรื้อรัง 2 สัปดาห์", clinicalDiagnosis: "สงสัยปอดบวม", note: "", films: [] },
  ]);
  const [labOrders, setLabOrders] = useState<{ test: string; note: string; status: string; specimen: string; urgency: string; results: { name: string; value: string; unit: string; ref: string; flag: string }[] }[]>([
    { test: "ความสมบูรณ์ของเลือด (CBC)", note: "ตรวจภาวะโลหิตจาง การติดเชื้อ", status: "เสร็จสิ้น", specimen: "Blood - EDTA (ม่วง)", urgency: "routine", results: [
      { name: "WBC", value: "18.5", unit: "x10³/µL", ref: "5.5-16.9", flag: "H" },
      { name: "RBC", value: "7.2", unit: "x10⁶/µL", ref: "5.5-8.5", flag: "" },
      { name: "Hb", value: "14.1", unit: "g/dL", ref: "12.0-18.0", flag: "" },
      { name: "Hct", value: "42", unit: "%", ref: "37-55", flag: "" },
      { name: "PLT", value: "280", unit: "x10³/µL", ref: "175-500", flag: "" },
    ] },
    { test: "ชีวเคมีในเลือด", note: "ตรวจการทำงานของตับ ไต", status: "รอผล", specimen: "Blood - Serum (แดง)", urgency: "urgent", results: [] },
  ]);
  const [expandedLabResult, setExpandedLabResult] = useState<number | null>(null);
  const [checkStatus, setCheckStatus] = useState<"รอตรวจ" | "กำลังตรวจ" | "ตรวจเสร็จแล้ว">("รอตรวจ");
  const [checkStatusOpen, setCheckStatusOpen] = useState(false);
  const checkStatusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (visitTypeRef.current && !visitTypeRef.current.contains(e.target as Node)) {
        setVisitTypeOpen(false);
      }
      if (visitRoomRef.current && !visitRoomRef.current.contains(e.target as Node)) {
        setVisitRoomOpen(false);
      }
      if (visitDoctorRef.current && !visitDoctorRef.current.contains(e.target as Node)) {
        setVisitDoctorOpen(false);
      }
      if (checkStatusRef.current && !checkStatusRef.current.contains(e.target as Node)) {
        const portalEl = document.querySelector('[data-check-status-portal]');
        if (!portalEl || !portalEl.contains(e.target as Node)) {
          setCheckStatusOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const symptomList = [
    "เบื่ออาหาร","อาเจียน","ท้องเสีย","ไข้","ขาแข็ง","แน่นหน้าอก",
    "น้ำหนักลด","ไอ","พฤติกรรมผิดปกติ","ตัวร้อน","ตัวเย็น","ชัก","อื่นๆ",
  ];

  const subtotal  = serviceItems.reduce((s, i) => s + (i.price * i.qty - i.discount), 0);
  const drugTotal = drugItems.reduce((s, d) => s + d.price * d.qty, 0);
  const grandTotal = subtotal + drugTotal;

  const inputCls = "vet-input";
  const textareaCls = "vet-textarea";
  const labelCls = "vet-label";
  const btnPrimary = "vet-btn vet-btn-primary btn-green";
  const btnSecondary = "flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-full hover:bg-gray-50 transition-all";

  return (
    <>
    <div className="flex flex-1 min-h-0">
      {/* Mobile overlay for sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setShowMobileSidebar(false)} />
      )}

      {/* ── Left Sidebar — Profile + Tabs ── */}
      <div className={`
        fixed md:relative z-30 md:z-10 h-full md:h-auto
        transition-transform duration-300
        ${showMobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <DetailSidebar rec={rec} onBack={onBack} activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setShowMobileSidebar(false); }} />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto bg-[#FEFBF8] p-3 sm:p-5">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="md:hidden flex items-center gap-2 mb-3 px-3 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> ดูข้อมูลสัตว์เลี้ยง
        </button>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}>

            {/* ── 1. บันทึกส่งตรวจ ── */}
            {activeTab === TAB_REGISTER && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                    {/* Radial glow */}
                    <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                    <div className="relative flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                          <img src={imgRegister} alt="บันทึกส่งตรวจ" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>ข้อมูลการรับบริการ</h2>
                          <p className="text-xs text-[#99a1af]">บันทึกรายละเอียดการเข้ารับบริการ</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button className="flex items-center gap-1.5 bg-white text-[#19a589] border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors text-[12px]" style={{ fontWeight: 600 }}>
                          <LayoutTemplate className="w-4 h-4" />Template
                        </button>
                        <button className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 rounded-full px-3.5 py-2 hover:bg-gray-50 transition-colors text-[12px]" style={{ fontWeight: 500 }}>
                          <Printer className="w-3.5 h-3.5" />พิมพ์ใบ Visit
                        </button>
                        <button className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 rounded-full px-3.5 py-2 hover:bg-gray-50 transition-colors text-[12px]" style={{ fontWeight: 500 }}>
                          <Printer className="w-3.5 h-3.5" />พิมพ์ใบบันทึกการตรวจ
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                  {/* ── Section: ข้อมูลทั่วไป ── */}
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50/60 to-white p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-4 rounded-full bg-[#19a589]" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>ข้อมูลทั่วไป</span>
                      <span className="text-[10px] text-gray-400">General Information</span>
                    </div>
                  {/* ประเภทการมา + ห้องตรวจ + แพทย์ + วันเวลา (single row) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* ประเภทการมา */}
                  <div>
                    <label className={labelCls} style={{ fontWeight: 500 }}>ประเภทการมา <span className="text-red-400">*</span></label>
                    <div className="relative" ref={visitTypeRef}>
                      {(() => {
                        const visitTypeOptions = [
                          { label: "ตรวจสุขภาพทั่วไป", icon: Stethoscope, color: "text-[#19a589]", bg: "bg-[#19a589]/10" },
                          { label: "เจ็บป่วย",           icon: Heart,        color: "text-orange-500", bg: "bg-orange-50" },
                          { label: "ฉุกเฉิน",            icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-50" },
                          { label: "ตรวจติดตาม",         icon: Activity,     color: "text-blue-500",   bg: "bg-blue-50" },
                          { label: "ฉีดวัคซีน",          icon: Syringe,      color: "text-purple-500", bg: "bg-purple-50" },
                          { label: "ตัดขน/อาบน้ำ",       icon: Scissors,     color: "text-sky-500",    bg: "bg-sky-50" },
                          { label: "ฝากเลี้ยง",          icon: Home,         color: "text-amber-500",  bg: "bg-amber-50" },
                        ];
                        const selected = visitTypeOptions.find(o => o.label === visitType) ?? visitTypeOptions[0];
                        const SelIcon = selected.icon;
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => setVisitTypeOpen(v => !v)}
                              className="w-full flex items-center justify-between gap-2 px-3 py-[8px] border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-[#19a589]/50 focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all bg-[#f9fafb]"
                            >
                              <span>{selected.label}</span>
                              <motion.div animate={{ rotate: visitTypeOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {visitTypeOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden py-1"
                                >
                                  {visitTypeOptions.map(opt => {
                                    const isActive = visitType === opt.label;
                                    return (
                                      <button
                                        key={opt.label}
                                        type="button"
                                        onClick={() => { setVisitType(opt.label); setVisitTypeOpen(false); }}
                                        className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
                                          isActive
                                            ? "bg-[#19a589]/10 text-[#0d7c66]"
                                            : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                        style={{ fontWeight: isActive ? 500 : 400 }}
                                      >
                                        {opt.label}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* ห้องตรวจ */}
                  <div>
                    <label className={labelCls} style={{ fontWeight: 500 }}>ห้องตรวจ</label>
                    <div className="relative" ref={visitRoomRef}>
                      <button
                        type="button"
                        onClick={() => setVisitRoomOpen(v => !v)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-[8px] border border-gray-200 rounded-xl text-sm hover:border-[#19a589]/50 focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all bg-[#f9fafb]"
                      >
                        <span className={visitRoom ? "text-gray-700" : "text-gray-300"}>
                          {visitRoom || "-- เลือกห้อง --"}
                        </span>
                        <motion.div animate={{ rotate: visitRoomOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {visitRoomOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.12 }}
                            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden py-1"
                          >
                            {["ห้อง 1 — ทั่วไป", "ห้อง 2 — ตา/หู", "ห้อง 3 — ผิวหนัง", "ห้อง 4 — ผ่าตัด", "ห้อง 5 — ไอซียู"].map(room => {
                              const isActive = visitRoom === room;
                              return (
                                <button
                                  key={room}
                                  type="button"
                                  onClick={() => { setVisitRoom(room); setVisitRoomOpen(false); }}
                                  className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
                                    isActive
                                      ? "bg-[#19a589]/10 text-[#0d7c66]"
                                      : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                  style={{ fontWeight: isActive ? 500 : 400 }}
                                >
                                  {room}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* สัตวแพทย์ผู้ดูแล */}
                  <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>
                        <User className="w-3 h-3 inline mr-1 -mt-0.5 text-gray-400" />สัตวแพทย์ผู้ดูแล
                      </label>
                      <div className="relative" ref={visitDoctorRef}>
                        <button
                          type="button"
                          onClick={() => setVisitDoctorOpen(v => !v)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-[8px] border border-gray-200 rounded-xl text-sm hover:border-[#19a589]/50 focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all bg-[#f9fafb]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-[#19a589]/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-[#19a589]" />
                            </div>
                            <span className={(visitDoctor || rec.doctor) ? "text-gray-700 truncate" : "text-gray-300"}>
                              {visitDoctor || rec.doctor || "-- เล��อกแพทย์ --"}
                            </span>
                          </div>
                          <motion.div animate={{ rotate: visitDoctorOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {visitDoctorOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.98 }}
                              transition={{ duration: 0.12 }}
                              className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden py-1"
                            >
                              {[
                                { name: "สพ.ว. สมชาย", specialty: "อายุรกรรมทั่วไป" },
                                { name: "สพ.ว. วรรณา", specialty: "จักษุ / โสต" },
                                { name: "สพ.ว. ปรีชา", specialty: "ศัลยกรรม" },
                                { name: "สพ.ว. นภา", specialty: "ผิวหนัง" },
                                { name: "สพ.ว. ธนวัฒน์", specialty: "ทันตกรรม" },
                              ].map(doc => {
                                const isActive = (visitDoctor || rec.doctor) === doc.name;
                                return (
                                  <button
                                    key={doc.name}
                                    type="button"
                                    onClick={() => { setVisitDoctor(doc.name); setVisitDoctorOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                                      isActive
                                        ? "bg-[#19a589]/10 text-[#0d7c66]"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                    style={{ fontWeight: isActive ? 500 : 400 }}
                                  >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-[#19a589]/15" : "bg-gray-100"}`}>
                                      <User className={`w-3 h-3 ${isActive ? "text-[#19a589]" : "text-gray-400"}`} />
                                    </div>
                                    <div className="text-left min-w-0">
                                      <span className="block truncate">{doc.name}</span>
                                      <span className="block text-[10px] text-gray-400 -mt-0.5">{doc.specialty}</span>
                                    </div>
                                    {isActive && <Check className="w-3.5 h-3.5 ml-auto text-[#19a589] flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>
                        <Calendar className="w-3 h-3 inline mr-1 -mt-0.5 text-gray-400" />วันเวลารับบริการ
                      </label>
                      <div className="flex items-center gap-2 px-3 py-[8px] border border-gray-200 rounded-xl bg-white text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-3 h-3 text-blue-500" />
                        </div>
                        <span className="text-[14px]">4/3/2569 {rec.arrivalTime}</span>
                      </div>
                    </div>
                  </div>
                  </div>{/* end section ข้อมูลทั่วไป */}

                  {/* ── Section: รายละเอียดอาการ ── */}
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-orange-50/30 to-white p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-4 rounded-full bg-orange-400" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}><span className="font-bold">รายละเอียดอาการ</span></span>
                      <span className="text-[10px] text-gray-400">Symptoms Details</span>
                    </div>

                  {/* อาการหลัก */}
                  

                  {/* อาการที่พบ chips */}
                  <div>
                    <label className={labelCls} style={{ fontWeight: 500 }}>อาการที่พบ (เลือกได้หลายอาการ) <span className="text-red-400">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-1">
                      {symptomList.map(s => {
                        const active = selectedSymptoms.includes(s);
                        return (
                          <button key={s} type="button" onClick={() => toggleSymptom(s)}
                            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs rounded-full border transition-all duration-150 w-full ${
                              active
                                ? "bg-[#19a589] text-white border-[#19a589] shadow-sm shadow-[#19a589]/30"
                                : "bg-white text-gray-500 border-gray-200 hover:border-[#19a589]/50 hover:text-[#19a589] hover:bg-[#19a589]/5"
                            }`} style={{ fontWeight: active ? 500 : 400 }}>
                            {active && (
                              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  </div>{/* end section รายละเอียดอาการ */}

                  {/* Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-4 mt-4 border-t border-[#34C759]/20">
                      <div className="flex items-center flex-wrap gap-3">
                        {(() => {
                          const statusOpts = [
                            { key: "รอตรวจ" as const, icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
                            { key: "กำลังตรวจ" as const, icon: Loader2, color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
                            { key: "ตรวจเสร็จแล้ว" as const, icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.10)" },
                          ];
                          const cur = statusOpts.find(o => o.key === checkStatus) || statusOpts[0];
                          return (
                            <div className="relative" ref={checkStatusRef}>
                              <button
                                type="button"
                                onClick={() => setCheckStatusOpen(!checkStatusOpen)}
                                className="flex items-center gap-2 h-[36px] px-3.5 rounded-full border border-gray-200 bg-white text-xs cursor-pointer transition-all hover:border-gray-300 hover:shadow-sm"
                                style={{ fontWeight: 500 }}
                              >
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cur.color }} />
                                <span style={{ color: cur.color }}>{cur.key}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                              {checkStatusOpen && checkStatusRef.current && createPortal(
                                <div
                                  data-check-status-portal
                                  className="fixed w-[180px] bg-white rounded-xl border border-gray-200 py-1.5"
                                  style={{
                                    top: checkStatusRef.current.getBoundingClientRect().bottom + 6,
                                    left: checkStatusRef.current.getBoundingClientRect().left,
                                    zIndex: 99999,
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                                  }}
                                >
                                  {statusOpts.map((opt) => {
                                    const Icon = opt.icon;
                                    const isAct = checkStatus === opt.key;
                                    return (
                                      <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => { setCheckStatus(opt.key); setCheckStatusOpen(false); }}
                                        className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs cursor-pointer transition-colors ${isAct ? "" : "hover:bg-gray-50"}`}
                                        style={isAct ? { background: opt.bg, fontWeight: 600, color: opt.color } : { fontWeight: 400, color: "#4b5563" }}
                                      >
                                        <Icon className={`w-3.5 h-3.5 ${opt.key === "กำลังตรวจ" && isAct ? "animate-spin" : ""}`} style={{ color: opt.color }} />
                                        {opt.key}
                                        {isAct && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: opt.color }} />}
                                      </button>
                                    );
                                  })}
                                </div>,
                                document.body
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <button onClick={() => showSnackbar("success", "บันทึกข้อมูลส่งตรวจสำเร็จแล้ว")} className={`${btnPrimary} btn-green`} style={{ background: "linear-gradient(135deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>บันทึกข้อมูลส่งตรวจ</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. สัญญาณชีพ ── */}
            {activeTab === TAB_VITALS && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                    <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                        <img src={imgVitals} alt="สัญญาณชีพ" className="w-7 h-7 object-contain" />
                      </div>
                      <div>
                        <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>บันทึกสัญญาณชีพ</h2>
                        <p className="text-xs text-[#99a1af]">Vital Signs</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                  {/* Vitals — 4 inline (matching reference) */}
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    {(() => {
                      const themes = {
                        empty:    { color: "#94a3b8", border: "#e2e8f0" },
                        normal:   { color: "#22c55e", border: "#e2e8f0" },
                        abnormal: { color: "#ef4444", border: "rgba(239,68,68,0.30)" },
                      };
                      const items = [
                        { label: "อุณหภูมิ",   sublabel: "Temperature", icon: Thermometer, unit: "°C",       step: 0.1, min: 37.5, max: 39.5, rangeText: "37.5–39.5" },
                        { label: "ชีพจร",       sublabel: "Pulse Rate",  icon: Heart,       unit: "���รั้ง/นาที", step: 1,   min: 60,   max: 140,  rangeText: "60–140" },
                        { label: "อัตราหายใจ", sublabel: "Respiration", icon: Wind,        unit: "ครั้ง/นาที", step: 1,   min: 15,   max: 30,   rangeText: "15–30" },
                        { label: "น้ำหนัก",     sublabel: "Weight",      icon: Weight,      unit: "กก.",       step: 0.1, min: null, max: null, rangeText: "—" },
                      ];
                      return items.map((v) => {
                        const val = vitals[v.label] ?? "";
                        const num = parseFloat(val);
                        const isEmpty = val.trim() === "" || isNaN(num);
                        const isAbnormal = !isEmpty && v.min !== null && v.max !== null && (num < v.min || num > v.max);
                        const status: "empty" | "normal" | "abnormal" = isEmpty ? "empty" : isAbnormal ? "abnormal" : "normal";
                        const t = themes[status];
                        const Icon = v.icon;
                        const inputId = `vital-${v.label}`;
                        const updateVal = (newVal: string) => setVitals(prev => ({ ...prev, [v.label]: newVal }));
                        const adjust = (delta: number) => {
                          const cur = parseFloat(vitals[v.label]) || 0;
                          updateVal((cur + delta).toFixed(v.step < 1 ? 1 : 0));
                        };
                        return (
                        <div key={v.label} data-vital-card>
                          <label htmlFor={inputId} className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                            <Icon className="w-3 h-3 text-gray-400" />
                            {v.label}
                            {v.rangeText !== "—" && <span className="text-gray-300 ml-auto">({v.rangeText})</span>}
                          </label>
                          <div
                            className="flex items-center border rounded-xl overflow-hidden bg-white transition-all duration-150"
                            style={{ borderColor: t.border }}
                          >
                            <input
                              id={inputId}
                              value={val}
                              placeholder="—"
                              onChange={(e) => updateVal(e.target.value)}
                              className="min-w-0 w-full bg-transparent py-[7px] px-3 text-sm focus:outline-none"
                              style={{ fontWeight: 500, color: isEmpty ? "#cbd5e1" : t.color }}
                              onFocus={(e) => { const w = e.currentTarget.parentElement!; w.style.borderColor = "#19a589"; w.style.boxShadow = "0 0 0 2px rgba(25,165,137,0.10)"; }}
                              onBlur={(e) => { const w = e.currentTarget.parentElement!; w.style.borderColor = t.border; w.style.boxShadow = "none"; }}
                            />
                            <span className="pr-2.5 text-[11px] text-gray-400 flex-shrink-0" style={{ fontWeight: 400 }}>{v.unit}</span>
                          </div>
                          {status === "abnormal" && (
                            <p className="text-[10px] mt-1 text-red-400" style={{ fontWeight: 500 }}>ค่าผิดปกติ</p>
                          )}
                        </div>
                      );});
                    })()}
                  </div>

                  {/* ── Section: อาการ & ประวัติ ── */}
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-orange-50/30 to-white p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-4 rounded-full bg-orange-400" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>อาการ & ประวัติ</span>
                      <span className="text-[10px] text-gray-400">History & Chief Complaint</span>
                    </div>

                  {/* อาการสำคัญ */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls} style={{ fontWeight: 500 }}>อาการสำคัญ (Chief Complaint)</label>
                      <button type="button" className="flex items-center gap-1.5 text-xs text-[#19a589] border border-gray-200 bg-white px-3.5 py-[7px] rounded-full hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
                        <LayoutTemplate className="w-4 h-4" />Template
                      </button>
                    </div>
                    <textarea rows={3} placeholder="ระบุอาการสำคัญที่นำสัตว์มาพบสัตวแพทย์" className={textareaCls} />
                  </div>

                  {/* ประวัติการเจ็บป่วย */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls} style={{ fontWeight: 500 }}>ประวัติการเจ็บป่วย</label>
                      <button type="button" className="flex items-center gap-1.5 text-xs text-[#19a589] border border-gray-200 bg-white px-3.5 py-[7px] rounded-full hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
                        <LayoutTemplate className="w-4 h-4" />Template
                      </button>
                    </div>
                    <textarea rows={3} placeholder="อธิบายอาการเจ็บป่วยในรายละเอียด" className={textareaCls} />
                  </div>

                  {/* 2-col: ระยะเวลาที่มีอาการ + ผลตรวจเพิ่มเติม */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>
                        <Clock className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-gray-400" />
                        ระยะเวลาที่มีอาการ
                      </label>
                      <input placeholder="เช่น 3 วัน, 1 สัปดาห์" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>ผลตรวจเพิ่มเติมที่มีความผิดปกติ</label>
                      <input placeholder="เช่น ไข้รุ่นการตรวจ, ขนร่วง" className={inputCls} />
                    </div>
                  </div>

                  {/* ประวัติการรักษาก่อนหน้า */}
                  <div>
                    <label className={labelCls} style={{ fontWeight: 500 }}>ประวัติการรักษาก่อนหน้า</label>
                    <textarea rows={3} placeholder="ระบุการรักษาที่เคยได้รับในครั้งก่อน (ถ้ามี)" className={textareaCls} />
                  </div>
                  </div>{/* end section อาการ */}

                   {/* ── Section: ผู้บันทึก ── */}
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50/60 to-white p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-4 rounded-full bg-blue-400" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>ผู้บันทึก</span>
                      <span className="text-[10px] text-gray-400">Recorded By</span>
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>
                        <Stethoscope className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-gray-400" />
                        ชื่อผู้บันทึก
                      </label>
                      <div className="flex items-center gap-2 px-3 py-[8px] border border-gray-200 rounded-xl bg-white text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-3 h-3 text-blue-500" />
                        </div>
                        <span>Dr. Veterinarian</span>
                      </div>
                    </div>
                  </div>

                  {/* Save button — right aligned */}
                  <div className="flex justify-end border-t border-[rgba(52,199,89,0.2)] pt-4">
                    <button onClick={() => showSnackbar("success", "บันทึกสัญญาณชีพสำเร็จแล้ว")} className="flex items-center justify-center gap-2 px-5 py-2 text-sm text-white rounded-full active:scale-95 transition-all" style={{ fontWeight: 500, backgroundImage: "linear-gradient(168deg, #5a9e60 0%, #3a7d40 100%)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      บันทึกสัญญาณชีพ
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. ตรวจร่างกาย ── */}
            {activeTab === TAB_EXAM && (() => {
              const bodySystems = [
                { key: "ตา", label: "ตา", subLabel: "(Eyes)", icon: Eye },
                { key: "หู", label: "หู", subLabel: "(Ears)", icon: Ear },
                { key: "จมูก", label: "จมูก", subLabel: "(Nose)", icon: Wind },
                { key: "ปาก/ฟัน", label: "ปาก/ฟัน", subLabel: "(Mouth/Teeth)", icon: Stethoscope },
                { key: "หัวใจและหลอดเลือด", label: "หัวใจและหลอดเลือด", subLabel: "(Cardiovascular)", icon: Heart },
                { key: "ระบบทางเดินหายใจ", label: "ระบบทางเดินหายใจ", subLabel: "(Respiratory)", icon: Activity },
                { key: "ระบบทางเดินอาหาร", label: "ระบบทางเดินอาหาร", subLabel: "(GI)", icon: FlaskConical },
                { key: "ระบบทางเดินปัสสาวะ", label: "ระบบทางเดินปัสสาวะ", subLabel: "(Urogenital)", icon: Droplets },
                { key: "กระดูกและกล้ามเนื้อ", label: "กระดูกและกล้ามเนื้อ", subLabel: "(Musculoskeletal)", icon: Bone },
                { key: "ระบบประสาท", label: "ระบบประสาท", subLabel: "(Neurological)", icon: Brain },
                { key: "ผิวหนังและขน", label: "ผิวหนังและขน", subLabel: "(Skin/Coat)", icon: Layers },
                { key: "ต่อมน้ำเหลือง", label: "ต่อมน้ำเหลือง", subLabel: "(Lymph Nodes)", icon: PawPrint },
              ];
              return (
                <div className="flex flex-col gap-4">
                  {/* Main grid */}
                  <div className="w-full space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {/* Header card — inside */}
                      <div className="relative overflow-hidden p-5 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #f0f7f1 0%, #fefbf8 60%, #f5faf5 100%)" }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white" style={{ boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                              <img src={imgExam} alt="ตรวจร่างกาย" className="w-7 h-7 object-contain" />
                            </div>
                            <div>
                              <h2 className="text-gray-900" style={{ fontWeight: 700 }}>ตรวจระบบต่างๆ ของร่างกาย</h2>
                              <p className="text-xs text-gray-400 mt-0.5">ตรวจประเมินระบบร่างกายแต่ละส่วน</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                      {/* Legend */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm text-gray-700" style={{ fontWeight: 600 }}>ตรวจร่างกาย</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#19a589] inline-block" />ปกติ</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />ผิดปกติ</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />ไม่ได้ตรวจ</span>
                        </div>
                      </div>

                      {/* Grouped body systems */}
                      {(() => {
                        const groups = [
                          {
                            id: "head",
                            title: "ศีรษะและใบหน้า",
                            subtitle: "Head & Face",
                            icon: Eye,
                            keys: ["ตา", "หู", "จมูก", "ปาก/ฟัน"],
                          },
                          {
                            id: "internal",
                            title: "อวัยวะภายใน",
                            subtitle: "Internal Systems",
                            icon: Heart,
                            keys: ["หัวใจและหลอดเลือด", "ระบบทางเดินหายใจ", "ระบบทางเดินอาหาร", "ระบบทางเดินปัสสาวะ"],
                          },
                          {
                            id: "external",
                            title: "โครงสร้างและภายนอก",
                            subtitle: "Structure & External",
                            icon: Bone,
                            keys: ["กระดูกและกล้ามเนื้อ", "ระบบประสาท", "ผิวหนังและขน", "ต่อมน้ำเหลือง"],
                          },
                        ];
                        return (
                          <div className="space-y-3">
                            {/* Quick action bar */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const total = bodySystems.length;
                                  const checked = bodySystems.filter(s => examStatus[s.key]).length;
                                  return (
                                    <>
                                      <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>ตรวจแล้ว {checked}/{total}</span>
                                      <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(checked / total) * 100}%`, background: checked === total ? "#22c55e" : "#19a589" }} />
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const allNormal: Record<string, string> = {};
                                  bodySystems.forEach(s => { allNormal[s.key] = "ปกติ"; });
                                  setExamStatus(prev => ({ ...prev, ...allNormal }));
                                }}
                                className="flex items-center gap-1.5 px-3 py-1 text-xs text-[#19a589] bg-[#19a589]/8 hover:bg-[#19a589]/15 border border-[#19a589]/20 rounded-full transition-all active:scale-95 cursor-pointer"
                                style={{ fontWeight: 600 }}
                              >
                                <Check className="w-3.5 h-3.5" />ปกติทั้งหมด
                              </button>
                            </div>

                            {/* Flat card grid — no groups */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {bodySystems.map(({ key, label, subLabel, icon: Icon }) => {
                                const status = examStatus[key];
                                const isNormal   = status === "ปกติ";
                                const isAbnormal = status === "ผิดปกติ";
                                const isSkipped  = status === "ไม่ได้ตรวจ";
                                const isUnchecked = !status;
                                return (
                                  <div key={key} className={`relative rounded-xl border p-3 transition-all duration-200 ${
                                    isAbnormal ? "border-red-200 bg-red-50/40 shadow-sm" :
                                    isNormal ? "border-[#19a589]/20 bg-[#19a589]/[0.03] shadow-sm" :
                                    isSkipped ? "border-gray-200 bg-gray-50/60" :
                                    "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                                  }`}>
                                    {/* Card icon + label */}
                                    <div className="flex items-center gap-2 mb-2.5">
                                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                        style={{
                                          background: isAbnormal ? "linear-gradient(135deg, #ef4444, #dc2626)" :
                                                      isNormal ? "linear-gradient(135deg, #19a589, #0d7c66)" :
                                                      isSkipped ? "linear-gradient(135deg, #9ca3af, #6b7280)" :
                                                      "#f3f4f6",
                                          boxShadow: isAbnormal ? "0 2px 6px rgba(239,68,68,0.25)" :
                                                     isNormal ? "0 2px 6px rgba(25,165,137,0.25)" :
                                                     "none"
                                        }}
                                      >
                                        <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ${isUnchecked ? "text-gray-400" : "text-white"}`} />
                                      </div>
                                      <span className={`text-xs leading-tight transition-colors duration-200 ${isUnchecked ? "text-gray-600" : "text-gray-800"}`} style={{ fontWeight: 600 }}>{label}</span>
                                    </div>
                                    {/* Status buttons */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setExamStatus(p => ({ ...p, [key]: isNormal ? undefined as any : "ปกติ" }))}
                                        className={`flex-1 flex items-center justify-center gap-0.5 py-1 text-[10px] rounded-full transition-all duration-200 cursor-pointer ${
                                          isNormal ? "bg-[#19a589] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-400 hover:text-[#19a589] hover:border-[#19a589]/40"
                                        }`}
                                        style={{ fontWeight: isNormal ? 600 : 400 }}
                                      >
                                        <Check className="w-2.5 h-2.5" />ปกติ
                                      </button>
                                      <button
                                        onClick={() => setExamStatus(p => ({ ...p, [key]: isAbnormal ? undefined as any : "ผิดปกติ" }))}
                                        className={`flex-1 flex items-center justify-center gap-0.5 py-1 text-[10px] rounded-full transition-all duration-200 cursor-pointer ${
                                          isAbnormal ? "bg-red-500 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300"
                                        }`}
                                        style={{ fontWeight: isAbnormal ? 600 : 400 }}
                                      >
                                        <X className="w-2.5 h-2.5" />ผิดปกติ
                                      </button>
                                      <button
                                        onClick={() => setExamStatus(p => ({ ...p, [key]: isSkipped ? (undefined as any) : "ไม่ได้ตรวจ" }))}
                                        className={`w-7 h-[22px] flex items-center justify-center text-[10px] rounded-full transition-all duration-200 cursor-pointer ${
                                          isSkipped ? "bg-gray-400 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-300 hover:text-gray-500 hover:border-gray-400"
                                        }`}
                                        style={{ fontWeight: isSkipped ? 600 : 400 }}
                                        title="ข้าม"
                                      >
                                        —
                                      </button>
                                    </div>
                                    {/* Abnormal note input */}
                                    <AnimatePresence initial={false}>
                                      {isAbnormal && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden"
                                        >
                                          <input
                                            placeholder="ระบุความผิดปกติ..."
                                            className="w-full mt-2 px-2.5 py-1 text-[11px] border border-red-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-200/50 focus:border-red-300 placeholder:text-red-300 transition-all"
                                            autoFocus
                                          />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* บันทึกทั่วไป */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setExamNoteOpen(prev => !prev)}
                          className="flex items-center justify-between w-full group"
                        >
                          <h3 className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>บันทึกทั่วไป</h3>
                          <motion.span
                            animate={{ rotate: examNoteOpen ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-400 group-hover:text-gray-600 transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {examNoteOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <textarea
                                rows={3}
                                value={examNote}
                                onChange={e => setExamNote(e.target.value)}
                                placeholder="บันทึกการตรวจทั่วไป พฤติกรรม, อุปนิสัย..."
                                className="w-full mt-2 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-colors placeholder:text-gray-300"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* อัพโหลดรูปภาพ */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <ExamPhotosPanel />
                      </div>

                      {/* แผนผังร่างกาย */}
                      <div className="mt-2 pt-4 border-t border-gray-100">
                        <ExamBodyMapPanel species={rec.species} />
                      </div>

                      {/* ปุ่มบันทึก */}
                      <div className="mt-4 pt-4 border-t flex justify-end" style={{ borderColor: "rgba(52,199,89,0.2)" }}>
                        <button
                          onClick={() => showSnackbar("success", "บันทึกการตรวจสำเร็จแล้ว")}
                          className="text-sm text-white rounded-full transition-all active:scale-[0.95] whitespace-nowrap cursor-pointer"
                          style={{ fontWeight: 500, background: "linear-gradient(167.75deg, #5a9e60 0%, #3a7d40 100%)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)", padding: "8px 20px", width: 165.707, height: 35.979 }}
                        >
                          บันทึกการตรวจ
                        </button>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}



            {/* ── 4. วินิจฉัย ── */}
            {activeTab === TAB_DIAGNOSIS && (
              <>
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* ── ฟอร์มวินิจฉัย (ซ้าย) ── */}
                <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                    <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                    <div className="relative flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                          <img src={imgDiagnosis} alt="วินิจฉัย" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>การวินิจฉัย</h2>
                          <p className="text-xs text-[#99a1af]">Diagnosis & Treatment Plan</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DiagnosisSection />
                </div>
                </div>{/* end flex-1 form wrapper */}

                {/* ── ประวัติการวินิจฉัยเดิม (ขวา) ── */}
                <div className="hidden lg:block w-[250px] flex-shrink-0">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Header — minimal */}
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100">
                          <BookOpen className="w-3 h-3 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-gray-600 text-[14px]" style={{ fontWeight: 600 }}>ประวัติวินิจฉัย</h3>
                          <p className="text-gray-400 text-[10px]">6 ครั้ง</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                      {[
                        { date: "10 ก.พ. 69", icd: "J00", disease: "Acute nasopharyngitis", diagType: "Principal", vet: "สพ.สมชาย รักสัตว์", status: "ยืนยัน", note: "", priority: "3551", licenseNo: "555" },
                        { date: "28 ม.ค. 69", icd: "L30.9", disease: "Dermatitis, unspecified", diagType: "Principal", vet: "สพ.วิภาวดี ใจดี", status: "ยืนยัน", note: "ผิวหนังอักเสบบริเวณท้อง มีอาการคัน", priority: "2100", licenseNo: "789" },
                        { date: "15 ธ.ค. 68", icd: "K29.7", disease: "Gastritis, unspecified", diagType: "Co-morbidity", vet: "สพ.สมชาย รักสัตว์", status: "ยืนยัน", note: "", priority: "1800", licenseNo: "555" },
                        { date: "3 พ.ย. 68", icd: "A09", disease: "Infectious gastroenteritis", diagType: "Principal", vet: "สพ.ปรีชา สัตวแพทย์", status: "รอยืนยัน", note: "อาเจียนและท้องเสีย 2 วัน", priority: "2500", licenseNo: "321" },
                        { date: "20 ก.ย. 68", icd: "H10.9", disease: "Conjunctivitis, unspecified", diagType: "Principal", vet: "สพ.สมชาย รักสัตว์", status: "ยืนยัน", note: "", priority: "1200", licenseNo: "555" },
                        { date: "5 ส.ค. 68", icd: "R50.9", disease: "Fever, unspecified", diagType: "Other", vet: "สพ.วิภาวดี ใจดี", status: "ยืนยัน", note: "ไข้สูง 2 วัน หายเองหลังรับยา", priority: "900", licenseNo: "789" },
                      ].map((h, i) => (
                        <div key={`diag-history-${i}`} className="group flex items-start gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50/60" onClick={() => setExpandedDiagHistory(h)}>
                          <div className="flex flex-col items-center pt-[4px] flex-shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${h.status === "รอยืนยัน" ? "bg-amber-400" : "bg-purple-300"}`} />
                            {i < 5 && <div className="w-px flex-1 min-h-[28px] bg-gray-100 mt-1" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-gray-600 truncate text-[12px]" style={{ fontWeight: 500 }}>{h.disease.length > 20 ? h.disease.substring(0, 20) + "…" : h.disease}</span>
                              <span className={`flex-shrink-0 px-1 py-0.5 rounded-full ${h.status === "รอยืนยัน" ? "bg-amber-50 text-amber-500" : "text-gray-400 bg-gray-50"} text-[8px]`} style={{ fontWeight: 500 }}>{h.status}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-gray-400">
                              <span className="text-[10px]">{h.date}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px] px-1 py-0 rounded bg-purple-50 text-purple-500" style={{ fontWeight: 600 }}>{h.icd}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px]">{h.diagType.split(" ")[0]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Diagnosis History Popup ── */}
              {expandedDiagHistory && createPortal(
                <AnimatePresence>
                  <motion.div
                    key="diag-popup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
                    onClick={() => setExpandedDiagHistory(null)}
                  />
                  <div key="diag-popup-content" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ type: "spring", damping: 28, stiffness: 320 }}
                      className="bg-white rounded-3xl w-full max-w-[380px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                      {/* Header */}
                      <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)] rounded-t-3xl"
                        style={{ backgroundImage: "linear-gradient(135deg, #f5f0fa 0%, #FEFBF8 50%, #f8f5fc 100%)" }}>
                        <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                          style={{ background: "radial-gradient(circle, rgba(147,51,234,1) 0%, transparent 70%)" }} />
                        <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                          style={{ background: "radial-gradient(circle, rgba(147,51,234,1) 0%, transparent 70%)" }} />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, #9333ea, #7c3aed)", boxShadow: "0 4px 12px rgba(147,51,234,0.25)" }}>
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-gray-900" style={{ fontWeight: 700 }}>{expandedDiagHistory.disease.length > 25 ? expandedDiagHistory.disease.substring(0, 25) + "…" : expandedDiagHistory.disease}</h2>
                              <p className="text-xs text-gray-400 mt-0.5">รายละเอียดการวินิจฉัย</p>
                            </div>
                          </div>
                          <button onClick={() => setExpandedDiagHistory(null)}
                            className="w-8 h-8 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-4">
                        {/* Status + ICD badge row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${expandedDiagHistory.status === "รอยืนยัน" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`} style={{ fontWeight: 500 }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${expandedDiagHistory.status === "รอยืนยัน" ? "bg-amber-400" : "bg-emerald-400"}`} />
                            {expandedDiagHistory.status}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100" style={{ fontWeight: 600 }}>
                            {expandedDiagHistory.icd}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100" style={{ fontWeight: 500 }}>
                            <Calendar className="w-3 h-3" />
                            {expandedDiagHistory.date}
                          </span>
                        </div>

                        {/* Detail rows */}
                        <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                          {[
                            { label: "ชื่อโรค", value: expandedDiagHistory.disease, icon: <FileText className="w-3.5 h-3.5 text-purple-500" /> },
                            { label: "ประเภทวินิจฉัย", value: expandedDiagHistory.diagType, icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" /> },
                            { label: "สัตวแพทย์", value: expandedDiagHistory.vet, icon: <User className="w-3.5 h-3.5 text-teal-500" /> },
                            { label: "เลขที่ใบอนุญาต", value: expandedDiagHistory.licenseNo, icon: <FileText className="w-3.5 h-3.5 text-gray-500" /> },
                            { label: "ลำดับความสำคัญ", value: expandedDiagHistory.priority, icon: <LayoutList className="w-3.5 h-3.5 text-orange-500" /> },
                          ].map((row, ri) => (
                            <div key={ri} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                                {row.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-gray-400">{row.label}</p>
                                <p className="text-sm truncate text-gray-700" style={{ fontWeight: 500 }}>{row.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Note */}
                        {expandedDiagHistory.note && (
                          <div className="flex gap-2.5 p-3.5 rounded-xl bg-blue-50/80 border border-blue-100">
                            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FileText className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-blue-700" style={{ fontWeight: 600 }}>หมายเหตุ</p>
                              <p className="text-xs text-blue-600 mt-0.5">{expandedDiagHistory.note}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => setExpandedDiagHistory(null)}
                          className="px-5 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          ปิด
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </AnimatePresence>,
                document.body
              )}
              </>
            )}

            {/* ── 5. วัคซีน ── */}
            {activeTab === TAB_VACCINE && (
              <>
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* ── ฟอร์มบันทึกวัคซีน (ซ้าย) ── */}
                <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                    <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                    <div className="relative flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                          <img src={imgVaccine} alt="วัคซีน" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>บันทึกการฉีดวัคซีน</h2>
                          <p className="text-xs text-[#99a1af]">บันทึกข้อมูลวัคซีนและติดตามผล</p>
                        </div>
                      </div>
                      
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                  {/* เลือกวัคซีน */}
                  <div>
                    <label className={labelCls} style={{ fontWeight: 500 }}>เลือกวัคซีน <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <select className="w-full px-3 py-[10px] border border-gray-200 rounded-xl text-sm text-gray-700 bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all appearance-none">
                        <option value="">-- เลือกวัคซีน --</option>
                        <option>พิษสุนัขบ้า (Rabies)</option>
                        <option>DHPP (สุนัข)</option>
                        <option>FVRCP (แมว)</option>
                        <option>บอร์เดเทลลา (Bordetella)</option>
                        <option>เลปโตสไปรา (Leptospira)</option>
                        <option>FeLV (ไวรัสมะเร็งเม็ดเลือดขาวแมว)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Batch Number + วันหมดอายุ + ตำแหน่งที่ฉีด */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>Lot Number <span className="text-red-400">*</span></label>
                      <input placeholder="เช่น B12345" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>วั��หมดอายุ <span className="text-red-400">*</span></label>
                      <DatePickerModern value={vaccineExpiryDate} onChange={setVaccineExpiryDate} placeholder="เลือกวันหมดอายุ" />
                    </div>
                    <div>
                      <label className={`${labelCls} flex items-center gap-1.5`} style={{ fontWeight: 500 }}>
                        📍 ตำแหน่งที่ฉีด <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select className="w-full px-3 py-[10px] border border-gray-200 rounded-xl text-sm text-gray-700 bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all appearance-none">
                          <option>บริเวณต้นคอ (Scruff)</option>
                          <option>หัวไหล่ซ้าย</option>
                          <option>หัวไหล่ขวา</option>
                          <option>ต้นขาซ้าย</option>
                          <option>ต้นขาขวา</option>
                          <option>หลังสะโพก</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* วิธีการฉีด + สัตว์แพทย์ผู้ฉีด + เวลาฉีด */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>วิธีการฉีด <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select className="w-full px-3 py-[10px] border border-gray-200 rounded-xl text-sm text-gray-700 bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all appearance-none">
                          <option>ใต้ผิวหนัง (Subcutaneous - SC)</option>
                          <option>เข้ากล้ามเนื้อ (Intramuscular - IM)</option>
                          <option>เข้าหลอดเลือดดำ (Intravenous - IV)</option>
                          <option>หยอดจมูก (Intranasal)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>สัตว์แพทย์ผู้ฉีด <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select className="w-full px-3 py-[10px] border border-gray-200 rounded-xl text-sm text-gray-700 bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all appearance-none">
                          <option>สพ.สมชาย รักสัตว์</option>
                          <option>สพ.วิภาวดี ใจดี</option>
                          <option>สพ.ปรีชา สัตวแพทย์</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontWeight: 500 }}>เวลาฉีด <span className="text-red-400">*</span></label>
                      <TimePickerModern value={vaccineInjectionTime} onChange={setVaccineInjectionTime} />
                    </div>
                  </div>

                  {/* ── Section: ติดตาม Vital Signs ── */}
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-[#19a589]/[0.03] to-white p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-4 rounded-full bg-[#19a589]" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>ติดตาม Vital Signs</span>
                      <span className="text-[10px] text-gray-400">Monitoring</span>
                    </div>

                    {/* Vital Signs ก่อนฉีด */}
                    <div className="border border-[#19a589]/10 rounded-xl p-4 space-y-3 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <Activity className="w-3 h-3 text-blue-500" />
                        </div>
                        <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>ก่อนฉีด (Baseline)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">อุณหภูมิ (°C)</label>
                          <input defaultValue="38.5" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">ชีพจร (bpm)</label>
                          <input defaultValue="120" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">การหายใจ (rpm)</label>
                          <input defaultValue="24" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all text-gray-700" />
                        </div>
                      </div>
                    </div>

                    {/* Vital Signs หลังฉีด */}
                    <div className="border border-orange-200/50 rounded-xl p-4 space-y-3 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                          <Activity className="w-3 h-3 text-orange-500" />
                        </div>
                        <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>หลังฉีด (15-30 นาที)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">อุณหภูมิ (°C)</label>
                          <input defaultValue="38.5" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">ช���พจร (bpm)</label>
                          <input defaultValue="120" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all text-gray-700" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">การหายใจ (rpm)</label>
                          <input defaultValue="24" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section: อาการไม่พึงประสงค์ ── */}
                  <div className="rounded-xl border border-red-100/60 bg-gradient-to-br from-red-50/20 to-white p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-4 rounded-full bg-red-400" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>อาการไม่พึงประสงค์</span>
                      <span className="text-[10px] text-gray-400">Adverse Reaction</span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="มีอาการไม่พึงประสงค์หลังฉีดวัคซีน"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all resize-none placeholder:text-gray-300"
                    />
                  </div>

                  {/* Save button — right aligned, green gradient */}
                  <div className="flex justify-end pt-4 border-t" style={{ borderColor: "rgba(52,199,89,0.2)" }}>
                    <button
                      onClick={() => showSnackbar("success", "บันทึกการฉีดวัคซีนสำเร็จแล้ว")}
                      className="flex items-center justify-center px-5 py-2 text-sm text-white rounded-full transition-all active:scale-95"
                      style={{ fontWeight: 500, background: "linear-gradient(168deg,#5a9e60 0%,#3a7d40 100%)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)", width: 166 }}
                    >
                      บันทึกการฉีดวัคซีน
                    </button>
                  </div>
                  </div>
                </div>
                </div>{/* end flex-1 form wrapper */}

                {/* ── ประวัติการฉีดวัคซีน (ขวา) ── */}
                <div className="hidden lg:block w-[250px] flex-shrink-0">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Header — minimal */}
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100">
                          <Syringe className="w-3 h-3 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-gray-600 text-[14px]" style={{ fontWeight: 600 }}>ประวัติวัคซีน</h3>
                          <p className="text-gray-400 text-[10px]">5 ครั้ง</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                      {[
                        { date: "15 ก.พ. 69", vaccine: "พิษสุนัขบ้า", vet: "สพ.สมชาย รักสัตว์", method: "SC", status: "สำเร็จ", isWarning: false, batch: "RB-2569-001", site: "ต้นขาหลังขวา", next: "15 ก.พ. 70", note: "" },
                        { date: "20 ม.ค. 69", vaccine: "DHPP", vet: "สพ.วิภาวดี ใจดี", method: "SC", status: "สำเร็จ", isWarning: false, batch: "DH-2569-042", site: "สะบักขวา", next: "20 ม.ค. 70", note: "" },
                        { date: "10 ธ.ค. 68", vaccine: "เลปโตสไปรา", vet: "สพ.สมชาย รักสัตว์", method: "IM", status: "สำเร็จ", isWarning: false, batch: "LP-2568-118", site: "ต้นขาหลังซ้าย", next: "10 มิ.ย. 69", note: "" },
                        { date: "5 พ.ย. 68", vaccine: "บอร์เดเทลลา", vet: "สพ.ปรีชา สัตวแพทย์", method: "IN", status: "ข้างเคียง", isWarning: true, batch: "BD-2568-055", site: "โพรงจมูก", next: "5 พ.ย. 69", note: "มีอาการบวมบ��ิเวณที่ฉีด หายเองใน 24 ชม." },
                        { date: "20 ก.ย. 68", vaccine: "DHPP", vet: "สพ.สมชาย รักสัตว์", method: "SC", status: "สำเร็จ", isWarning: false, batch: "DH-2568-089", site: "สะบักซ้าย", next: "20 ม.ค. 69", note: "" },
                      ].map((h, i) => (
                        <div key={`vax-history-${i}`} className="group flex items-start gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50/60" onClick={() => setExpandedVaxData(h)}>
                          <div className="flex flex-col items-center pt-[4px] flex-shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${h.isWarning ? "bg-amber-400" : "bg-gray-300"}`} />
                            {i < 4 && <div className="w-px flex-1 min-h-[28px] bg-gray-100 mt-1" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-gray-600 truncate text-[12px]" style={{ fontWeight: 500 }}>{h.vaccine}</span>
                              <span className={`flex-shrink-0 px-1 py-0.5 rounded-full ${h.isWarning ? "bg-amber-50 text-amber-500" : "text-gray-400 bg-gray-50"} text-[8px]`} style={{ fontWeight: 500 }}>{h.status}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-gray-400">
                              <span className="text-[10px]">{h.date}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px]">{h.vet.split(" ")[0]}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px]">{h.method}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Vaccine History Popup ── */}
              {expandedVaxData && createPortal(
                <AnimatePresence>
                  <motion.div
                    key="vax-popup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
                    onClick={() => setExpandedVaxData(null)}
                  />
                  <div key="vax-popup-content" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ type: "spring", damping: 28, stiffness: 320 }}
                      className="bg-white rounded-3xl w-full max-w-[380px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                      {/* Header */}
                      <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)] rounded-t-3xl"
                        style={{ backgroundImage: "linear-gradient(135deg, #f0f7f1 0%, #FEFBF8 50%, #f5faf5 100%)" }}>
                        <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                          style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, transparent 70%)" }} />
                        <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                          style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, transparent 70%)" }} />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                              <Syringe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-gray-900" style={{ fontWeight: 700 }}>{expandedVaxData.vaccine}</h2>
                              <p className="text-xs text-gray-400 mt-0.5">รายละเอียดการฉีดวัคซีน</p>
                            </div>
                          </div>
                          <button onClick={() => setExpandedVaxData(null)}
                            className="w-8 h-8 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-4">
                        {/* Status + Date badge row */}
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${expandedVaxData.isWarning ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`} style={{ fontWeight: 500 }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${expandedVaxData.isWarning ? "bg-amber-400" : "bg-emerald-400"}`} />
                            {expandedVaxData.status}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100" style={{ fontWeight: 500 }}>
                            <Calendar className="w-3 h-3" />
                            {expandedVaxData.date}
                          </span>
                        </div>

                        {/* Detail rows */}
                        <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                          {[
                            { label: "สัตวแพทย์", value: expandedVaxData.vet, icon: <User className="w-3.5 h-3.5 text-blue-500" /> },
                            { label: "Batch No.", value: expandedVaxData.batch, icon: <FileText className="w-3.5 h-3.5 text-purple-500" /> },
                            { label: "ตำแหน่งฉีด", value: expandedVaxData.site, icon: <MapPin className="w-3.5 h-3.5 text-rose-500" /> },
                            { label: "วิธีฉีด", value: expandedVaxData.method === "SC" ? "ใต้ผิวหนัง (SC)" : expandedVaxData.method === "IM" ? "เข้ากล้าม (IM)" : "พ่นจมูก (IN)", icon: <Syringe className="w-3.5 h-3.5 text-teal-500" /> },
                            { label: "นัดถัดไป", value: expandedVaxData.next, icon: <Calendar className="w-3.5 h-3.5 text-blue-500" />, highlight: true },
                          ].map((row, ri) => (
                            <div key={ri} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                                {row.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-gray-400">{row.label}</p>
                                <p className={`text-sm truncate ${row.highlight ? "text-blue-600" : "text-gray-700"}`} style={{ fontWeight: 500 }}>{row.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Note */}
                        {expandedVaxData.note && (
                          <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-100">
                            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-xs text-amber-700" style={{ fontWeight: 600 }}>หมายเหตุ</p>
                              <p className="text-xs text-amber-600 mt-0.5">{expandedVaxData.note}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => setExpandedVaxData(null)}
                          className="px-5 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          ปิด
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </AnimatePresence>,
                document.body
              )}
              </>
            )}

            {/* ── 6. แล็บ / เอกซเรย์ ── */}
            {activeTab === TAB_LAB && (
              <div className="space-y-4">
                {/* LAB */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                    <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                    <div className="relative flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                          <img src={imgLab} alt="แล็บ" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>คำสั่ง LAB</h2>
                          <p className="text-xs text-[#99a1af]">Laboratory Orders</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowLabOrderModal(true)}
                        className="flex items-center gap-1.5 text-white rounded-full active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
                        style={{ fontWeight: 600, background: "linear-gradient(135deg, #e8802a, #d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}
                      ><Plus className="w-3.5 h-3.5" />เพิ่มคำสั่ง</button>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                  {/* ── รายการที่สั่งแล้ว ── */}
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50/30 to-white p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-4 rounded-full bg-blue-400" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>รายการที่สั่งแล้ว</span>
                      <span className="text-[10px] text-gray-400">Ordered Tests</span>
                      <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{labOrders.length} รายการ</span>
                    </div>
                    {labOrders.map((lab, i) => (
                      <div key={i} className="space-y-0">
                        <div className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-xl bg-white hover:shadow-sm transition-shadow">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={lab.status === "เสร็จสิ้น"
                              ? { background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 2px 8px rgba(25,165,137,0.3)" }
                              : { background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 2px 8px rgba(245,158,11,0.3)" }
                            }>
                            <FlaskConical className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{lab.test}</div>
                            <div className="text-xs text-gray-400">{lab.note || lab.specimen}{lab.urgency === "urgent" ? " · ด่วน" : lab.urgency === "stat" ? " · ด่วนมาก" : ""}</div>
                          </div>
                          {lab.status === "เสร็จสิ้น" && (
                            <button
                              onClick={() => setExpandedLabResult(expandedLabResult === i ? null : i)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-full border transition-colors ${
                                lab.results && lab.results.length > 0
                                  ? "text-[#19a589] bg-[#19a589]/8 border-[#19a589]/15 hover:bg-[#19a589]/14"
                                  : "text-amber-600 bg-amber-50 border-amber-200/50 hover:bg-amber-100/60"
                              }`}
                              style={{ fontWeight: 500 }}
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              {lab.results && lab.results.length > 0 ? "ดูผล" : "รายงานผล"}
                              {expandedLabResult === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                          <select
                            value={lab.status}
                            onChange={(e) => {
                              const updated = [...labOrders];
                              updated[i] = { ...updated[i], status: e.target.value };
                              setLabOrders(updated);
                            }}
                            className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#19a589]/20"
                          >
                            <option>รอ</option><option>ส่งแล้ว</option><option>รอผล</option><option>เสร็จสิ้น</option>
                          </select>
                          <button
                            onClick={() => {
                              /* TODO: open edit modal with lab data */
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#19a589] hover:bg-[#19a589]/8 transition-all"
                            title="แก้ไข"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setLabOrders(prev => prev.filter((_, idx) => idx !== i));
                              showSnackbar("delete", "ลบรายการ Lab แล้ว");
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Lab Results Panel */}
                        {expandedLabResult === i && lab.status === "เสร็จสิ้น" && (
                          <div className="mt-1 mx-1 p-4 bg-gradient-to-br from-[#19a589]/5 to-white border border-[#19a589]/10 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#19a589]" style={{ fontWeight: 600 }}>ผลตรวจ — {lab.test}</span>
                              <button
                                onClick={() => {
                                  const updated = [...labOrders];
                                  updated[i] = { ...updated[i], results: [...(updated[i].results || []), { name: "", value: "", unit: "", ref: "", flag: "" }] };
                                  setLabOrders(updated);
                                }}
                                className="flex items-center gap-1 text-[10px] text-[#19a589] hover:text-[#0d7c66] bg-[#19a589]/8 hover:bg-[#19a589]/15 px-2.5 py-1 rounded-full transition-colors"
                                style={{ fontWeight: 500 }}
                              >
                                <Plus className="w-3 h-3" />
                                เพิ่มรายการ
                              </button>
                            </div>
                            {lab.results && lab.results.length > 0 ? (
                              <div className="space-y-0">
                                <div className="grid grid-cols-[1fr_0.7fr_0.6fr_0.8fr_0.4fr_28px] gap-2 px-2 py-1.5 text-[10px] text-gray-400" style={{ fontWeight: 500 }}>
                                  <span>รายการ</span><span>ค่า</span><span>หน่วย</span><span>ค่าอ้างอิง</span><span>Flag</span><span></span>
                                </div>
                                {lab.results.map((r, ri) => (
                                  <div key={ri} className={`grid grid-cols-[1fr_0.7fr_0.6fr_0.8fr_0.4fr_28px] gap-2 px-2 py-1.5 rounded-lg items-center ${r.flag ? "bg-red-50/50" : ri % 2 === 0 ? "bg-white/60" : ""}`}>
                                    <input
                                      value={r.name}
                                      onChange={(e) => {
                                        const updated = [...labOrders];
                                        const results = [...updated[i].results];
                                        results[ri] = { ...results[ri], name: e.target.value };
                                        updated[i] = { ...updated[i], results };
                                        setLabOrders(updated);
                                      }}
                                      placeholder="ชื่อรายการ"
                                      className="text-xs text-gray-800 bg-transparent border-b border-transparent focus:border-[#19a589]/30 outline-none py-0.5 truncate"
                                      style={{ fontWeight: 500 }}
                                    />
                                    <input
                                      value={r.value}
                                      onChange={(e) => {
                                        const updated = [...labOrders];
                                        const results = [...updated[i].results];
                                        results[ri] = { ...results[ri], value: e.target.value };
                                        updated[i] = { ...updated[i], results };
                                        setLabOrders(updated);
                                      }}
                                      placeholder="ค่า"
                                      className={`text-xs bg-transparent border-b border-transparent focus:border-[#19a589]/30 outline-none py-0.5 ${r.flag === "H" ? "text-red-600" : r.flag === "L" ? "text-blue-600" : "text-gray-700"}`}
                                      style={{ fontWeight: r.flag ? 600 : 400 }}
                                    />
                                    <input
                                      value={r.unit}
                                      onChange={(e) => {
                                        const updated = [...labOrders];
                                        const results = [...updated[i].results];
                                        results[ri] = { ...results[ri], unit: e.target.value };
                                        updated[i] = { ...updated[i], results };
                                        setLabOrders(updated);
                                      }}
                                      placeholder="หน่วย"
                                      className="text-[11px] text-gray-400 bg-transparent border-b border-transparent focus:border-[#19a589]/30 outline-none py-0.5"
                                    />
                                    <input
                                      value={r.ref}
                                      onChange={(e) => {
                                        const updated = [...labOrders];
                                        const results = [...updated[i].results];
                                        results[ri] = { ...results[ri], ref: e.target.value };
                                        updated[i] = { ...updated[i], results };
                                        setLabOrders(updated);
                                      }}
                                      placeholder="ค่าอ้างอิง"
                                      className="text-[11px] text-gray-400 bg-transparent border-b border-transparent focus:border-[#19a589]/30 outline-none py-0.5"
                                    />
                                    <select
                                      value={r.flag}
                                      onChange={(e) => {
                                        const updated = [...labOrders];
                                        const results = [...updated[i].results];
                                        results[ri] = { ...results[ri], flag: e.target.value };
                                        updated[i] = { ...updated[i], results };
                                        setLabOrders(updated);
                                      }}
                                      className={`text-[10px] bg-transparent outline-none py-0.5 ${r.flag === "H" ? "text-red-600" : r.flag === "L" ? "text-blue-600" : "text-gray-400"}`}
                                      style={{ fontWeight: r.flag ? 600 : 400 }}
                                    >
                                      <option value="">-</option>
                                      <option value="H">H</option>
                                      <option value="L">L</option>
                                    </select>
                                    <button
                                      onClick={() => {
                                        const updated = [...labOrders];
                                        updated[i] = { ...updated[i], results: updated[i].results.filter((_, idx) => idx !== ri) };
                                        setLabOrders(updated);
                                      }}
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-xs text-gray-400">
                                ยังไม่มีผลตรวจ — กด "เพิ่มรายการ" เพื่อเริ่มบันทึกค่า
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {labOrders.length === 0 && (
                      <div className="text-center py-6 text-sm text-gray-400">
                        ยังไม่มีรายการสั่งตรวจ Lab
                      </div>
                    )}
                  </div>
                  </div>
                  <LabOrderModal
                    open={showLabOrderModal}
                    onClose={() => setShowLabOrderModal(false)}
                    onSubmit={(data) => {
                      setLabOrders(prev => [...prev, { ...data, status: "รอ", results: [] }]);
                      showSnackbar("success", "สั่ง Lab สำเร็จแล้ว");
                    }}
                  />
                </div>
                {/* X-Ray */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                    <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                          <img src={imgXray} alt="X-Ray" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>คำสั่ง X-Ray</h2>
                          <p className="text-xs text-[#99a1af]">X-Ray Orders</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowXRayOrderModal(true)}
                        className="flex items-center gap-1.5 text-white rounded-full active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
                        style={{ fontWeight: 600, background: "linear-gradient(135deg, #e8802a, #d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}
                      >
                        <Plus className="w-3.5 h-3.5" /> เพิ่มคำสั่ง
                      </button>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>รายการที่สั่งแล้ว</span>
                      <span className="text-[10px] text-gray-400">X-Ray Orders</span>
                      <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{xrayOrders.length} รายการ</span>
                    </div>
                    {xrayOrders.map((xr, i) => (
                      <div key={i} className="space-y-0">
                        <div className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-xl bg-white hover:shadow-sm transition-shadow">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={xr.status === "เสร็จสิ้น"
                              ? { background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 2px 8px rgba(25,165,137,0.3)" }
                              : { background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 2px 8px rgba(245,158,11,0.3)" }
                            }>
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>{xr.exam}</p>
                            <p className="text-[11px] text-gray-400 truncate">{xr.room || "ยังไม่ระบุห้อง"}{xr.clinicalDiagnosis ? ` • ${xr.clinicalDiagnosis}` : ""}</p>
                          </div>
                          {xr.status === "เสร็จสิ้น" && (
                            <label className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[#19a589] bg-[#19a589]/8 hover:bg-[#19a589]/14 border border-[#19a589]/15 rounded-full cursor-pointer transition-colors" style={{ fontWeight: 500 }}>
                              <ImagePlus className="w-3.5 h-3.5" />
                              แนบฟิล์ม
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (!files) return;
                                  const urls = Array.from(files).map((f) => URL.createObjectURL(f));
                                  const updated = [...xrayOrders];
                                  updated[i] = { ...updated[i], films: [...(updated[i].films || []), ...urls] };
                                  setXrayOrders(updated);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          )}
                          <select
                            value={xr.status}
                            onChange={(e) => {
                              const updated = [...xrayOrders];
                              updated[i] = { ...updated[i], status: e.target.value };
                              setXrayOrders(updated);
                            }}
                            className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#19a589]/20"
                          >
                            <option value="รอ">รอ</option>
                            <option value="กำลังถ่าย">กำลังถ่าย</option>
                            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                          </select>
                          <button
                            onClick={() => {
                              /* TODO: open edit modal with xray data */
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#19a589] hover:bg-[#19a589]/8 transition-all"
                            title="แก้ไข"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setXrayOrders(prev => prev.filter((_, idx) => idx !== i));
                              showSnackbar("delete", "ลบรายการ X-Ray แล้ว");
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Film thumbnails */}
                        {xr.films && xr.films.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2 pl-[52px] pb-1">
                            {xr.films.map((film, fi) => (
                              <div key={fi} className="relative group/film">
                                <img
                                  src={film}
                                  alt={`X-Ray film ${fi + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-[#19a589]/30 transition-all"
                                  onClick={() => window.open(film, "_blank")}
                                />
                                <button
                                  onClick={() => {
                                    const updated = [...xrayOrders];
                                    updated[i] = { ...updated[i], films: updated[i].films.filter((_, idx) => idx !== fi) };
                                    setXrayOrders(updated);
                                  }}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/film:opacity-100 transition-opacity shadow-sm"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <span className="absolute bottom-0.5 left-0.5 text-[8px] text-white bg-black/50 px-1 rounded" style={{ fontWeight: 500 }}>
                                  {fi + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {xrayOrders.length === 0 && (
                      <div className="text-center py-6 text-sm text-gray-400">
                        ยังไม่มีรายการสั่ง X-Ray
                      </div>
                    )}
                  </div>
                  <XRayOrderModal
                    open={showXRayOrderModal}
                    onClose={() => setShowXRayOrderModal(false)}
                    onSubmit={(data) => {
                      setXrayOrders(prev => [...prev, { ...data, status: "รอ", films: [] }]);
                      showSnackbar("success", "สั่ง X-Ray สำเร็จแล้ว");
                    }}
                  />
                </div>
              </div>
            )}

            {/* ── 7. ใบสั่งยา ── */}
            {activeTab === TAB_PRESCRIPTION && (
              <>
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* ── ฟอร์มใบสั่งยา (���้าย) ── */}
                <div className="flex-1 min-w-0">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                    <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                    <div className="relative flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                          <img src={imgPrescription} alt="ใบสั่งยา" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>ใบสั่งยา</h2>
                          <p className="text-xs text-[#99a1af]">รายการยาและคำแนะนำการใช้ยา</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setShowAddDrugModal(true)}
                          className="flex items-center gap-1.5 text-white rounded-full transition-all active:scale-95 hover:shadow-lg text-[12px] pl-[14px] pr-[18px] h-[32px]"
                          style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}
                        >
                          <Plus className="w-3.5 h-3.5" />เพิ่มยา
                        </button>
                        <button
                          className="flex items-center gap-1.5 bg-white border border-[#e5e7eb] text-[#19a589] rounded-full transition-all active:scale-95 hover:bg-[#f0faf7] text-[12px] pl-[16px] pr-[24px] py-[8px]"
                          style={{ fontWeight: 600 }}
                          onClick={() => {/* TODO: open template picker */}}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 15.996 15.996">
                            <path d={svgTemplatePaths.pf862b00} stroke="#19A589" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                            <path d={svgTemplatePaths.p690f700} stroke="#19A589" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                            <path d={svgTemplatePaths.p33842370} stroke="#19A589" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                          </svg>
                          Template
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                  <div className="space-y-3 mb-4">
                    {drugItems.map((d, idx) => (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.25 }}
                        className="group relative rounded-2xl bg-white border border-gray-100 hover:border-[#19a589]/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        {/* Accent left stripe */}
                        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: "linear-gradient(180deg, #19a589, #6ab870)" }} />

                        <div className="pl-5 pr-4 py-4">
                          {/* Header row */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.1)]"
                                style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)" }}>
                                <Pill className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[13px] text-[#1e2939] block truncate" style={{ fontWeight: 600 }}>{d.genericName || d.name}</span>
                                <span className="text-[11px] text-[#6a7282] block truncate mt-0.5">{d.name}</span>
                              </div>
                            </div>
                            {/* Edit & Delete */}
                            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                              <button
                                onClick={() => { /* TODO: open edit drug modal */ }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#19a589] hover:bg-[#19a589]/8 transition-all"
                                title="แก้ไข"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setDrugItems(prev => prev.filter(item => item.id !== d.id)); showSnackbar("delete", "ลบรายการยาแล้ว"); }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                title="ลบ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Instruction */}
                          <div className="mt-3 ml-12 flex items-start gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(25,165,137,0.04), rgba(254,251,248,0.8))", border: "1px solid rgba(25,165,137,0.08)" }}>
                            <FileText className="w-3.5 h-3.5 text-[#19a589]/50 flex-shrink-0 mt-[1px]" />
                            <span className="text-xs text-gray-600 leading-[1.6]">{d.instruction}</span>
                          </div>

                          {/* Qty, Price, Total */}
                          <div className="mt-2.5 ml-12 flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6a7282] bg-[#f9fafb] border border-[#f3f4f6] rounded-full px-2.5 py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#19a589]/40" />
                              <span style={{ fontWeight: 500 }}>{d.qty} {d.unit}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] bg-[#f9fafb]/60 border border-[#f3f4f6] rounded-full px-2.5 py-1 text-[#000000]">
                              ฿{d.price.toLocaleString()}<span className="text-[#8e8e8e]">/หน่วย</span>
                            </span>
                            <div className="ml-auto flex-shrink-0 text-right">
                              <span className="text-[15px] text-[#19a589]" style={{ fontWeight: 700 }}>฿{(d.price * d.qty).toLocaleString()}</span>
                              <span className="text-[10px] text-[#99a1af] ml-1">รวม</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* แพทย์ผู้สั่งยา */}
                  <div className="mb-4">
                    <label className={labelCls} style={{ fontWeight: 500 }}>แพทย์ผู้สั่งยา</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-[#19a589]/10 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-3.5 h-3.5 text-[#19a589]" />
                      </div>
                      <span className="text-sm text-gray-600" style={{ fontWeight: 500 }}>{rec.doctor}</span>
                    </div>
                  </div>

                  {/* รวมค่ายา */}
                  <div className="rounded-2xl border border-[#19a589]/15 p-4 flex items-center justify-between mb-4"
                    style={{ background: "linear-gradient(135deg, rgba(25,165,137,0.06), rgba(25,165,137,0.02))" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)" }}>
                        <span className="text-white text-xs" style={{ fontWeight: 700 }}>฿</span>
                      </div>
                      <span className="text-sm text-gray-600" style={{ fontWeight: 500 }}>รวมค่ายา</span>
                    </div>
                    <span className="text-xl text-[#19a589]" style={{ fontWeight: 700 }}>฿{drugTotal.toLocaleString()}</span>
                  </div>

                  {/* ปุ่มพิมพ์ */}
                  <div className="flex items-center justify-between pt-4 border-t border-[rgba(52,199,89,0.2)] flex-wrap gap-3">
                    <div className="flex gap-3 flex-wrap">
                      <button className={btnSecondary}><Printer className="w-4 h-4" />พิมพ์ใบส���่งยา</button>
                      <button onClick={() => { setShowStickerModal(true); setStickerSelected(drugItems.map(d => d.id)); }} className={btnSecondary}><Printer className="w-4 h-4" />พิมพ์สติ๊กเกอร์ยา</button>
                    </div>
                    <button
                      onClick={() => showSnackbar("success", "บันทึกใบสั่งยาเรียบร้อยแล้ว")}
                      className="flex items-center gap-2 px-[38px] py-2 text-sm text-white rounded-full active:scale-95 transition-all"
                      style={{ background: "linear-gradient(177deg, #5a9e60, #3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}
                    >
                      บันทึกใบสั่งยา
                    </button>
                  </div>
                  </div>
                </div>
              </div>
                </div>{/* end flex-1 form wrapper */}

                {/* ── ประวัติยาเดิม (ขวา) ── */}
                <div className="hidden lg:block w-[250px] flex-shrink-0">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Header — minimal */}
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100">
                          <Pill className="w-3 h-3 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-gray-600 text-[14px]" style={{ fontWeight: 600 }}>ประวัติยาเดิม</h3>
                          <p className="text-gray-400 text-[10px]">8 รายการ</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                      {[
                        { date: "10 มี.ค. 69", drugName: "อะม็อกซิซิลลิน 250mg", qty: "2 แผง (28 เม็ด)", instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 7 วัน", indication: "ติดเชื้อแบคทีเรีย", vet: "สพ.ว. สมชาย", status: "จ่ายแล้ว", note: "", refillable: false },
                        { date: "10 มี.ค. 69", drugName: "เพรดนิโซโลน 5mg", qty: "1 แผง (10 เม็ด)", instruction: "กินวันละ 1 ครั้ง ครั้งละ 0.5 เม็ด นาน 5 วัน", indication: "ลดการอักเสบ", vet: "สพ.ว. สมชาย", status: "จ่ายแล้ว", note: "ลดขนาดยาก่อนหยุด", refillable: false },
                        { date: "22 ก.พ. 69", drugName: "เมโทรนิดาโซล 250mg", qty: "1 แผง (10 เม็ด)", instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 5 วัน", indication: "ท้องเสีย ติดเชื้อ", vet: "สพ.ว. วรรณา", status: "จ่ายแล้ว", note: "", refillable: false },
                        { date: "22 ก.พ. 69", drugName: "สารน้ำทดแทน ORS", qty: "3 ซอง", instruction: "ละลายในน้ำ 200ml ให้กินเรื่อย ๆ", indication: "ขาดน้ำ", vet: "สพ.ว. วรรณา", status: "จ่ายแล้ว", note: "", refillable: true },
                        { date: "5 ม.ค. 69", drugName: "ไอเวอร์เมคติน 0.1%", qty: "1 หลอด", instruction: "หยดหลังคอ 1 ครั้ง ทุก 2 สัปดาห์ x3 ครั้ง", indication: "พยาธิหนอนหัวใจ ป้องกัน", vet: "สพ.ว. สมชา��", status: "จ่ายแล้ว", note: "ครั้งที่ 3/3", refillable: false },
                        { date: "15 ธ.ค. 68", drugName: "ออนแดนซีตรอน 4mg", qty: "5 เม็ด", instruction: "กินวันละ 1 ครั้ง ก่อนอาหาร 30 นาที", indication: "อาเจียน คลื่นไส้", vet: "สพ.ว. วรรณา", status: "จ่ายแล้ว", note: "ห้ามใช้ร่วมกับเมโทโคลพาไมด์", refillable: false },
                        { date: "1 พ.ย. 68", drugName: "เซฟาเล็กซิน 500mg", qty: "2 แผง (20 เม็ด)", instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 10 วัน", indication: "ติดเชื้อผิวหนัง", vet: "สพ.ว. สมชาย", status: "จ่ายแล้ว", note: "", refillable: false },
                        { date: "1 พ.ย. 68", drugName: "คลอร์เฮกซิดีน แชมพู", qty: "1 ขวด (250ml)", instruction: "อาบทุก 3 วัน ทิ้งไว้ 10 นาทีก่อนล้าง", indication: "เชื้อราผิวหนัง", vet: "สพ.ว. สมชาย", status: "จ่ายแล้ว", note: "ใช้คู่กับยากิน", refillable: true },
                      ].map((h, i) => (
                        <div key={`drug-history-${i}`} className="group flex items-start gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50/60" onClick={() => setExpandedDrugHistory(h)}>
                          <div className="flex flex-col items-center pt-[4px] flex-shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${h.refillable ? "bg-blue-400" : "bg-gray-300"}`} />
                            {i < 7 && <div className="w-px flex-1 min-h-[28px] bg-gray-100 mt-1" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-gray-600 truncate text-[12px]" style={{ fontWeight: 500 }}>{h.drugName}</span>
                              <span className="flex-shrink-0 px-1 py-0.5 rounded-full text-gray-400 bg-gray-50 text-[8px]" style={{ fontWeight: 500 }}>{h.status}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-gray-400">
                              <span className="text-[10px]">{h.date}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px]">{h.vet.split(" ")[0]}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px] truncate">{h.qty}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Drug History Popup ── */}
              {expandedDrugHistory && createPortal(
                <AnimatePresence>
                  <motion.div
                    key="drug-popup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
                    onClick={() => setExpandedDrugHistory(null)}
                  />
                  <div key="drug-popup-content" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ type: "spring", damping: 28, stiffness: 320 }}
                      className="bg-white rounded-3xl w-full max-w-[380px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                      {/* Header */}
                      <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)] rounded-t-3xl"
                        style={{ backgroundImage: "linear-gradient(135deg, #f0f7f1 0%, #FEFBF8 50%, #f5faf5 100%)" }}>
                        <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                          style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, transparent 70%)" }} />
                        <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                          style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, transparent 70%)" }} />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                              <Pill className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{expandedDrugHistory.drugName}</h2>
                              <p className="text-xs text-gray-400 mt-0.5">รายละเอียดการสั่งยา</p>
                            </div>
                          </div>
                          <button onClick={() => setExpandedDrugHistory(null)}
                            className="w-8 h-8 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-4">
                        {/* Status + Date badge row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100" style={{ fontWeight: 500 }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {expandedDrugHistory.status}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100" style={{ fontWeight: 500 }}>
                            <Calendar className="w-3 h-3" />
                            {expandedDrugHistory.date}
                          </span>
                          {expandedDrugHistory.refillable && (
                            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100" style={{ fontWeight: 500 }}>
                              สั่ง���้ำได้
                            </span>
                          )}
                        </div>

                        {/* Detail rows */}
                        <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                          {[
                            { label: "จำนวน", value: expandedDrugHistory.qty, icon: <Layers className="w-3.5 h-3.5 text-indigo-500" /> },
                            { label: "วิธีใช้ยา", value: expandedDrugHistory.instruction, icon: <FileText className="w-3.5 h-3.5 text-purple-500" /> },
                            { label: "ข้อบ่งใช้", value: expandedDrugHistory.indication, icon: <Activity className="w-3.5 h-3.5 text-rose-500" /> },
                            { label: "สัตวแพทย์", value: expandedDrugHistory.vet, icon: <User className="w-3.5 h-3.5 text-blue-500" /> },
                          ].map((row, ri) => (
                            <div key={ri} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                                {row.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-gray-400">{row.label}</p>
                                <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{row.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Note */}
                        {expandedDrugHistory.note && (
                          <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-100">
                            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-xs text-amber-700" style={{ fontWeight: 600 }}>หมายเหตุ</p>
                              <p className="text-xs text-amber-600 mt-0.5">{expandedDrugHistory.note}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => setExpandedDrugHistory(null)}
                          className="px-5 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          ปิด
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </AnimatePresence>,
                document.body
              )}

                <AddDrugModal
                  open={showAddDrugModal}
                  onClose={() => setShowAddDrugModal(false)}
                  onAdd={(items: DrugOrderItem[]) => {
                    const newDrugs = items.map((item, i) => ({
                      id: drugItems.length + i + 1,
                      name: item.drug.tradeName,
                      genericName: item.drug.genericName,
                      qty: item.qty,
                      unit: item.drug.unit,
                      price: item.pricePerUnit,
                      instruction: item.instruction,
                      indication: item.indication,
                    }));
                    setDrugItems(prev => [...prev, ...newDrugs]);
                    showSnackbar("success", "เพิ่มรายการยาสำเร็จแล้ว");
                  }}
                />

              </>
            )}

            {/* ── 8. ค่าบริการ ── */}
            {activeTab === TAB_SERVICE && (
              <>
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* ── ฟอร์มค่าบริการ (ซ้าย) ── */}
                <div className="flex-1 min-w-0">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                    <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                    <div className="relative flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                          <img src={imgService} alt="ค่าบริการ" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>ค่าบริการ</h2>
                          <p className="text-xs text-[#99a1af]">รายการบริการแล��ค่าใช้จ่าย</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setShowAddServiceModal(true)}
                          className="flex items-center gap-1.5 text-white rounded-full transition-all active:scale-95 hover:shadow-lg text-[12px] pl-[14px] pr-[18px] h-[32px]"
                          style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}
                        >
                          <Plus className="w-3.5 h-3.5" />เพิ่มรายการ
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                  <div className="space-y-3">
                    {serviceItems.map((s, idx) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.25 }}
                        className="group relative rounded-2xl bg-white border border-gray-100 hover:border-[#19a589]/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        {/* Accent left stripe */}
                        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: "linear-gradient(180deg, #19a589, #6ab870)" }} />

                        <div className="pl-5 pr-4 py-4">
                          {/* Header row */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.1)]"
                                style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)" }}>
                                <Receipt className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[13px] text-[#1e2939] block truncate" style={{ fontWeight: 600 }}>{s.name}</span>
                                <span className="text-[11px] text-[#6a7282] block truncate mt-0.5">{s.unit}</span>
                              </div>
                            </div>
                            {/* Edit & Delete */}
                            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                              <button
                                onClick={() => { /* TODO: open edit service modal */ }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#19a589] hover:bg-[#19a589]/8 transition-all"
                                title="แก้ไข"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setServiceItems(prev => prev.filter(item => item.id !== s.id)); showSnackbar("delete", "ลบรายการบริการแล้ว"); }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                title="ลบ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Qty, Price, Discount, Total */}
                          <div className="mt-2.5 ml-12 flex items-center gap-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6a7282] bg-[#f9fafb] border border-[#f3f4f6] rounded-full px-2.5 py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#19a589]/40" />
                              <span style={{ fontWeight: 500 }}>{s.qty} {s.unit}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] bg-[#f9fafb]/60 border border-[#f3f4f6] rounded-full px-2.5 py-1 text-[#000000]">
                              ฿{s.price.toLocaleString()}<span className="text-[#8e8e8e]">/หน่วย</span>
                            </span>
                            {s.discount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-red-50 border border-red-100 rounded-full px-2.5 py-1 text-red-500" style={{ fontWeight: 500 }}>
                                -฿{s.discount.toLocaleString()}
                              </span>
                            )}
                            <div className="ml-auto flex-shrink-0 text-right">
                              <span className="text-[15px] text-[#19a589]" style={{ fontWeight: 700 }}>฿{(s.price * s.qty - s.discount).toLocaleString()}</span>
                              <span className="text-[10px] text-[#99a1af] ml-1">รวม</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Doctor DF */}
                  <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50/60 to-white space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-amber-400" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>DF แพทย์</span>
                      <span className="text-[10px] text-gray-400">Doctor Fee</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls} style={{ fontWeight: 500 }}>แพทย์ผู้รักษา</label>
                        <input defaultValue={rec.doctor} readOnly className={`${inputCls} bg-white text-xs`} />
                      </div>
                      <div>
                        <label className={labelCls} style={{ fontWeight: 500 }}>ยอด DF</label>
                        <input defaultValue="200" className={`${inputCls} bg-white text-xs`} />
                      </div>
                    </div>
                  </div>
                  {/* Summary */}
                  <div className="mt-4 rounded-xl border border-[#19a589]/15 bg-gradient-to-br from-[#19a589]/[0.03] to-white p-4 space-y-2.5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 rounded-full bg-[#19a589]" />
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>สรุปค่าใช้จ่าย</span>
                    </div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">รวมค่าบริการ</span><span className="text-gray-700">฿{subtotal}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">ค่ายา</span><span className="text-gray-700">฿{drugTotal}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">ภาษีมูลค่าเพิ่ม 7%</span><span className="text-gray-700">฿{Math.round(grandTotal * 0.07)}</span></div>
                    <div className="flex justify-between border-t border-[#19a589]/10 pt-3 mt-1">
                      <span className="text-gray-900" style={{ fontWeight: 700 }}>ยอดรวมทั้งหมด</span>
                      <span className="text-lg text-[#19a589]" style={{ fontWeight: 700 }}>฿{Math.round(grandTotal * 1.07)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 flex-wrap">
                    
                    <button className={btnSecondary}><Printer className="w-4 h-4" />พิมพ์ใบสรุปค่ารักษา</button>
                  </div>
                  </div>
                </div>
              </div>
                </div>{/* end flex-1 form wrapper */}

                {/* ── ประวัติค่าบริการเดิม (ขวา) ── */}
                <div className="hidden lg:block w-[250px] flex-shrink-0">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100">
                          <Receipt className="w-3 h-3 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-gray-600 text-[14px]" style={{ fontWeight: 600 }}>ประวัติค่าบริการ</h3>
                          <p className="text-gray-400 text-[10px]">5 ครั้งล่าสุด</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                      {[
                        { date: "10 มี.ค. 69", items: [{ name: "ค่าตรวจ", price: 300 }, { name: "ตรว���เลือด (CBC)", price: 400 }, { name: "น้ำเกลือ x2", price: 500 }], total: 1200, vet: "สพ.ว. สมชาย", status: "ชำระแล้ว" },
                        { date: "22 ก.พ. 69", items: [{ name: "ค่าตรวจ", price: 300 }, { name: "ตรวจอุจจาระ", price: 200 }, { name: "ฉีดย���", price: 150 }], total: 650, vet: "สพ.ว. วรรณา", status: "ชำระแล้ว" },
                        { date: "5 ม.ค. 69", items: [{ name: "ค่าตรวจ", price: 300 }, { name: "หยดยาป้องกันพยาธิ", price: 450 }], total: 750, vet: "สพ.ว. สมชาย", status: "ชำระแล้ว" },
                        { date: "15 ธ.ค. 68", items: [{ name: "ค่าตรวจฉุกเฉิน", price: 500 }, { name: "ฉีดยาแก้อาเจียน", price: 250 }, { name: "ให้สารน้ำ", price: 350 }], total: 1100, vet: "สพ.ว. วรรณา", status: "ชำระแล้ว" },
                        { date: "1 พ.ย. 68", items: [{ name: "ค่าตรวจ", price: 300 }, { name: "ขูดผิวหนัง", price: 350 }, { name: "อาบน้ำยา", price: 500 }], total: 1150, vet: "สพ.ว. สมชาย", status: "ชำระแล้ว" },
                      ].map((visit, i, arr) => (
                        <div key={`svc-history-${i}`} className="group flex items-start gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50/60">
                          <div className="flex flex-col items-center pt-[4px] flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            {i < arr.length - 1 && <div className="w-px flex-1 min-h-[28px] bg-gray-100 mt-1" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] text-gray-400">{visit.date}</span>
                              <span className="flex-shrink-0 px-1 py-0.5 rounded-full text-gray-400 bg-gray-50 text-[8px]" style={{ fontWeight: 500 }}>{visit.status}</span>
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {visit.items.map((item, j) => (
                                <div key={j} className="flex items-center justify-between gap-1">
                                  <span className="text-[11px] text-gray-600 truncate" style={{ fontWeight: 500 }}>{item.name}</span>
                                  <span className="text-[10px] text-gray-400 flex-shrink-0">฿{item.price}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-dashed border-gray-100">
                              <span className="text-[9px] text-gray-400">{visit.vet.split(" ")[0]}</span>
                              <span className="text-[11px] text-[#19a589]" style={{ fontWeight: 600 }}>฿{visit.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
                <AddServiceModal
                  open={showAddServiceModal}
                  onClose={() => setShowAddServiceModal(false)}
                  onAdd={(items: OrderLineItem[]) => {
                    const newServices = items.map((item, i) => ({
                      id: serviceItems.length + i + 1,
                      name: item.catalogItem.tradeName,
                      qty: item.qty,
                      unit: item.catalogItem.unit,
                      price: item.pricePerUnit,
                      discount: item.discount,
                    }));
                    setServiceItems(prev => [...prev, ...newServices]);
                    showSnackbar("success", "เพิ่มค่าบริการสำเร็จแล้ว");
                  }}
                />
              </>
            )}

            {/* ── 9. นัดหมาย ── */}
            {activeTab === TAB_APPOINTMENT && (
              <div className="space-y-4">
                {/* ── รายการนัดหมาย (List View) ── */}
                {!showAppointmentForm && (
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* ── ฝั่งซ้าย: นัดหมายที่กำลังจะถึง ── */}
                    <div className="flex-1 min-w-0 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {/* Header */}
                      <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                        <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                        <div className="relative flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                              <img src={imgAppointment} alt="นัดหมาย" className="w-7 h-7 object-contain" />
                            </div>
                            <div>
                              <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>รายการนัดหมาย</h2>
                              <p className="text-xs text-[#99a1af]">กำลังจะถึง {upcomingAppts.length} รายการ</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowAppointmentForm(true)}
                            className="flex items-center gap-1.5 text-white rounded-full transition-all active:scale-95 hover:shadow-lg text-[12px] pl-[14px] pr-[18px] h-[32px]"
                            style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}
                          >
                            <Plus className="w-3.5 h-3.5" />เพิ่มนัดใหม่
                          </button>
                        </div>
                      </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-5 rounded-full bg-[#19a589]" />
                        <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>นัดหมายที่กำลังจะถึง</span>
                        <span className="ml-auto text-[10px] text-[#19a589] bg-[#19a589]/8 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{upcomingAppts.length} รายการ</span>
                      </div>
                      <AnimatePresence mode="popLayout">
                      {upcomingAppts.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-gray-300">
                          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm" style={{ fontWeight: 500 }}>ยังไม่มีนัดหมาย</p>
                          <p className="text-xs mt-1">กดปุ่ม "เพิ่มนัดใหม่" เพื่อสร้���งนัด</p>
                        </motion.div>
                      )}
                      {upcomingAppts.map((appt) => (
                        <motion.div
                          key={appt.id}
                          layout
                          initial={{ opacity: 0, y: 12, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                        <div className="relative overflow-hidden rounded-2xl border border-[#19a589]/12 hover:border-[#19a589]/25 transition-all duration-200 cursor-pointer group hover:shadow-md" style={{ background: "linear-gradient(135deg, rgba(25,165,137,0.02) 0%, rgba(255,255,255,1) 100%)" }}>
                          {/* Accent bar */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "linear-gradient(180deg, #19a589, #6aad70)" }} />

                          <div className="flex items-stretch">
                            {/* Date badge */}
                            <div className="flex flex-col items-center justify-center px-4 py-4 border-r border-dashed border-gray-100 min-w-[72px]">
                              <span className="text-2xl leading-none" style={{ fontWeight: 700, color: "#19a589" }}>{appt.day}</span>
                              <span className="text-[10px] text-gray-400 mt-1" style={{ fontWeight: 500 }}>{appt.month}</span>
                            </div>

                            {/* Main content */}
                            <div className="flex-1 py-3.5 px-4 min-w-0 space-y-2">
                              {/* Title row */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm leading-none">{appt.icon}</span>
                                <span className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{appt.type}</span>
                                <span className="text-[10px] px-2 py-[3px] rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 flex-shrink-0 leading-none" style={{ fontWeight: 600 }}>รอนัดหมาย</span>
                                {/* Reschedule button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRescheduleAppt(appt);
                                    setRescheduleDate("");
                                    setRescheduleTime(appt.time);
                                  }}
                                  className="ml-auto inline-flex items-center gap-1 text-[10px] px-2.5 py-[3px] rounded-full border transition-all active:scale-95 flex-shrink-0 leading-none bg-gray-50 text-gray-500 border-gray-200/60 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200/60"
                                  style={{ fontWeight: 600 }}
                                >
                                  <CalendarClock className="w-3 h-3" />
                                  เลื่อนนัด
                                </button>
                              </div>

                              {/* Meta chips */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-[3px] rounded-md">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span style={{ fontWeight: 500 }}>{appt.time} น.</span>
                                </div>
                                <div className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-[3px] rounded-md">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span>{appt.doctor}</span>
                                </div>
                                <div className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-[3px] rounded-md">
                                  <Home className="w-3 h-3 text-gray-400" />
                                  <span>{appt.room}</span>
                                </div>
                              </div>

                              {/* Note */}
                              {appt.note && (
                                <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#19a589]/[0.04] border border-[#19a589]/[0.06]">
                                  <FileText className="w-3 h-3 text-[#19a589]/50 flex-shrink-0 mt-px" />
                                  <span className="text-[11px] text-gray-500 leading-relaxed">{appt.note}</span>
                                </div>
                              )}


                            </div>

                            {/* Arrow */}
                            
                          </div>
                        </div>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                    </div>
                    </div>
                    </div>{/* end left column */}

                    {/* ── ฝั่งขวา: ประวัตินัดหมายที่ผ่านมา ── */}
                    <div className="hidden lg:block w-[250px] flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden lg:sticky lg:top-4">
                      {/* Header — minimal (vaccine history style) */}
                      <div className="px-3 py-2.5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100">
                            <Clock className="w-3 h-3 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-gray-600 text-[14px]" style={{ fontWeight: 600 }}>ประวัตินัดหมาย</h3>
                            <p className="text-gray-400 text-[10px]">5 รายการ</p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline list */}
                      <div className="p-2 space-y-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                      {[
                        { day: "15", month: "ก.พ.", year: "2569", time: "10:00", type: "ตรวจติดตามอาการ", doctor: rec.doctor, icon: "🩺", status: "มาตามนัด", statusCls: "bg-[#19a589]/8 text-[#0d7c66]", room: "ห้อง 1 — ทั่วไป", note: "ตรวจผลเลือดหลังให้ยา ค่าตับกลับสู่ปกติ", duration: "30 นาที", cost: "1,200", isCancel: false },
                        { day: "20", month: "ม.ค.", year: "2569", time: "09:30", type: "ฉีดวัคซีน DHPP", doctor: rec.doctor, icon: "💉", status: "มาตามนัด", statusCls: "bg-[#19a589]/8 text-[#0d7c66]", room: "ห้อง 1 — ทั่วไป", note: "ฉีดวัคซีนกระตุ้น DHPP ครั้งที่ 2", duration: "15 นาที", cost: "850", isCancel: false },
                        { day: "05", month: "ม.ค.", year: "2569", time: "14:00", type: "ตรวจสุขภาพประจำปี", doctor: rec.doctor, icon: "📋", status: "ผิดนัด", statusCls: "bg-red-50 text-red-500", room: "ห้อง 2 — ศัลยกรรม", note: "เจ้าของแจ้งยกเลิก — ติดธุระ", duration: "-", cost: "0", isCancel: true },
                        { day: "10", month: "ธ.ค.", year: "2568", time: "11:00", type: "ตรวจทันตกรรม", doctor: rec.doctor, icon: "🦷", status: "มาตามนัด", statusCls: "bg-[#19a589]/8 text-[#0d7c66]", room: "ห้อง 1 — ทั่วไป", note: "ขูดหินปูนและถอนฟันน้ำนม 2 ซี่", duration: "45 นาที", cost: "3,500", isCancel: false },
                        { day: "25", month: "พ.ย.", year: "2568", time: "10:30", type: "อาบน้ำ / ตัดขน", doctor: rec.doctor, icon: "���️", status: "มาตามนัด", statusCls: "bg-[#19a589]/8 text-[#0d7c66]", room: "ห้อง Grooming", note: "อาบน้ำ ตัดขน ตัดเล็บ ทำความสะอาดหู", duration: "1 ชม.", cost: "900", isCancel: false },
                      ].map((appt, i) => (
                        <div key={`past-${i}`} onClick={() => setSelectedPastAppt(appt)} className="group flex items-start gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50/60">
                          <div className="flex flex-col items-center pt-[4px] flex-shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${appt.isCancel ? "bg-amber-400" : "bg-gray-300"}`} />
                            {i < 4 && <div className="w-px flex-1 min-h-[28px] bg-gray-100 mt-1" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-gray-600 truncate text-[12px]" style={{ fontWeight: 500 }}>{appt.type}</span>
                              <span className={`flex-shrink-0 px-1 py-0.5 rounded-full ${appt.isCancel ? "bg-amber-50 text-amber-500" : "text-gray-400 bg-gray-50"} text-[8px]`} style={{ fontWeight: 500 }}>{appt.status}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-gray-400">
                              <span className="text-[10px]">{appt.day} {appt.month} {appt.year.slice(-2)}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px]">{appt.time}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px]">{appt.doctor.split(" ")[0]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                    </div>{/* end right column */}
                  </div>
                )}

                {/* ── Popup สร้างนัดหมายใหม่ ── */}
                {showAppointmentForm && createPortal(
                  <AnimatePresence>
                    <motion.div
                      key="appt-popup-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
                      onClick={() => setShowAppointmentForm(false)}
                    />
                    <div key="appt-popup-content" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 28, stiffness: 320 }}
                        className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto max-h-[90vh]"
                      >
                        {/* Header — Figma-inspired */}
                        <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)] rounded-t-3xl flex-shrink-0"
                          style={{ backgroundImage: "linear-gradient(135deg, #f0f7f1 0%, #FEFBF8 50%, #f5faf5 100%)" }}>
                          <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                            style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, transparent 70%)" }} />
                          <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                            style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, transparent 70%)" }} />
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>สร้างนัดหมายครั้งถัดไป</h2>
                                <p className="text-xs text-[#99a1af]">กำหนดวัน เวลา และรายละเอียดการนัด</p>
                              </div>
                            </div>
                            {/* Frosted glass close button */}
                            <button
                              onClick={() => setShowAppointmentForm(false)}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                              style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(73,138,79,0.1)" }}
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Body — scrollable */}
                        <div className="overflow-y-auto flex-1 p-5 space-y-4">
                          {/* วัน + เวลา */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls} style={{ fontWeight: 500 }}>วันนัดหมาย <span className="text-red-400">*</span></label>
                              <DatePickerModern value={apptForm.date} onChange={v => setApptForm(p => ({ ...p, date: v }))} />
                            </div>
                            <div>
                              <label className={labelCls} style={{ fontWeight: 500 }}>เวลานัดหมาย <span className="text-red-400">*</span></label>
                              <TimePickerModern value={apptForm.time} onChange={v => setApptForm(p => ({ ...p, time: v }))} />
                            </div>
                          </div>

                          {/* Section divider */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-[10px] text-gray-300" style={{ fontWeight: 500 }}>รายละเอียดนัด</span>
                            <div className="flex-1 h-px bg-gray-100" />
                          </div>

                          {/* ประเภทนัด + ห้องตรวจ */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls} style={{ fontWeight: 500 }}>ประเภทนัดหมาย <span className="text-red-400">*</span></label>
                              <div className="relative">
                                <select className="w-full px-3 py-[10px] border border-gray-200 rounded-xl text-sm text-gray-700 bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all appearance-none" value={apptForm.type} onChange={e => setApptForm(p => ({ ...p, type: e.target.value }))}>
                                  <option>ตรวจติดตามอาการ</option>
                                  <option>ฉีดวัคซีน (กระตุ้น)</option>
                                  <option>ตรวจสุขภาพประจำปี</option>
                                  <option>รับผลแล็บ</option>
                                  <option>ผ่าตัด</option>
                                  <option>ตรวจทันตกรรม</option>
                                  <option>อาบน้ำ / ��ัดขน</option>
                                  <option>อื่น ๆ</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                            <div>
                              <label className={labelCls} style={{ fontWeight: 500 }}>ห้องตรวจ</label>
                              <div className="relative">
                                <select className="w-full px-3 py-[10px] border border-gray-200 rounded-xl text-sm text-gray-700 bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all appearance-none" value={apptForm.room} onChange={e => setApptForm(p => ({ ...p, room: e.target.value }))}>
                                  <option value="">-- ไม่ระบุ --</option>
                                  <option>ห้อง 1 — ทั่วไป</option>
                                  <option>ห้อง 2 — ตา/หู</option>
                                  <option>ห้อง 3 — ผิวหนัง</option>
                                  <option>ห้อง 4 — ผ่าตัด</option>
                                  <option>ห้อง 5 — ไอซียู</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* สัตวแพทย์ */}
                          <div>
                            <label className={labelCls} style={{ fontWeight: 500 }}>สัตวแพทย์ผู้นัด</label>
                            <div className="relative">
                              <select
                                className="w-full appearance-none pl-9 pr-8 py-[10px] border border-gray-200 rounded-xl text-sm text-gray-700 bg-[#f9fafb] hover:border-[#19a589]/50 focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all cursor-pointer"
                                value={apptForm.doctor || rec.doctor}
                                onChange={e => setApptForm(p => ({ ...p, doctor: e.target.value }))}
                              >
                                <option value="">-- เลือกแพทย์ --</option>
                                <option value="สพ.ว. สมชาย">สพ.ว. สมชาย</option>
                                <option value="สพ.ว. วรรณา">สพ.ว. วรรณา</option>
                                <option value="สพ.ว. ปรีชา">สพ.ว. ปรีชา</option>
                                <option value="สพ.ว. นภา">สพ.ว. นภา</option>
                                <option value="สพ.ว. ธนวัฒน์">สพ.ว. ธนวัฒน์</option>
                              </select>
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Section divider */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-[10px] text-gray-300" style={{ fontWeight: 500 }}>เพิ่มเติม</span>
                            <div className="flex-1 h-px bg-gray-100" />
                          </div>

                          {/* หมายเหตุ */}
                          <div>
                            <label className={labelCls} style={{ fontWeight: 500 }}>หมายเหตุ / คำแนะนำก่อนมา</label>
                            <textarea
                              rows={3}
                              placeholder="เช่น งดอาหาร 8 ชั่วโมงก่อนผ่าตัด, น���สมุดวัคซีนมาด้วย..."
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all resize-none placeholder:text-gray-300"
                              value={apptForm.note}
                              onChange={e => setApptForm(p => ({ ...p, note: e.target.value }))}
                            />
                          </div>

                          {/* การแจ้งเตือน */}
                          <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-[#19a589]" />
                              <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>การแจ้งเตือนเจ้าของสัตว์</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                { label: "SMS แจ้งเตือน 1 วันก่อน", defaultChecked: true },
                                { label: "Line แจ้งเตือน 1 วันก่อน", defaultChecked: false },
                                { label: "โทรศัพท์ยืนยันนัด", defaultChecked: false },
                                { label: "แจ้งเตือนซ้ำในวันนัด", defaultChecked: true },
                              ].map(opt => (
                                <label key={opt.label} className="flex items-center gap-2.5 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    defaultChecked={opt.defaultChecked}
                                    className="w-4 h-4 rounded accent-[#19a589] cursor-pointer"
                                  />
                                  <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">{opt.label}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{rec.phone}</span>
                              <span className="text-xs text-gray-400">({rec.owner})</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer — Actions */}
                        <div className="bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0 rounded-b-3xl">
                          <button
                            onClick={() => setShowAppointmentForm(false)}
                            className="w-[110px] px-4 py-2 rounded-full border border-gray-200 text-sm text-[#4a5565] hover:bg-gray-50 transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            ยก��ลิก
                          </button>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-full hover:bg-gray-50 transition-all" style={{ fontWeight: 500 }}>
                              <Printer className="w-4 h-4" />พิมพ์ใบนัด
                            </button>
                            <button
                              onClick={handleSaveAppointment}
                              disabled={!apptForm.date || apptSaving}
                              className="w-[130px] flex items-center justify-center gap-2 py-2 text-white rounded-full transition-all text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ fontWeight: 500, background: "linear-gradient(177deg, #5a9e60, #3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}
                            >
                              {apptSaving ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", damping: 12 }}
                                  className="flex items-center gap-1.5"
                                >
                                  <Check className="w-4 h-4" />บันทึกแล้ว!
                                </motion.div>
                              ) : "บันทึกนัดหมาย"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </AnimatePresence>,
                  document.body
                )}

                {/* ── Popup รายละเอียดนัดหมายที่ผ่านมา ── */}
                {selectedPastAppt && createPortal(
                  <AnimatePresence>
                    <motion.div
                      key="past-appt-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
                      onClick={() => setSelectedPastAppt(null)}
                    />
                    <div key="past-appt-content" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 28, stiffness: 320 }}
                        className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto max-h-[90vh]"
                      >
                        {/* Header */}
                        <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                          <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                                <img src={imgAppointment} alt="นัดหมาย" className="w-7 h-7 object-contain" />
                              </div>
                              <div>
                                <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>รายละเอียดนัดหมาย</h2>
                                <p className="text-xs text-[#99a1af]">{selectedPastAppt.day} {selectedPastAppt.month} {selectedPastAppt.year}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedPastAppt(null)}
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 backdrop-blur border border-gray-200/60 hover:bg-white transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto flex-1 p-5 space-y-4">
                          {/* Status badge */}
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{selectedPastAppt.icon}</span>
                            <div className="flex-1">
                              <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{selectedPastAppt.type}</span>
                              <div className="mt-1">
                                <span className={`text-[11px] px-2.5 py-1 rounded-full ${selectedPastAppt.statusCls}`} style={{ fontWeight: 600 }}>{selectedPastAppt.status}</span>
                              </div>
                            </div>
                          </div>

                          {/* Info grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: "วันที่", value: `${selectedPastAppt.day} ${selectedPastAppt.month} ${selectedPastAppt.year}`, icon: <Calendar className="w-3.5 h-3.5" /> },
                              { label: "เวลา", value: `${selectedPastAppt.time} น.`, icon: <Clock className="w-3.5 h-3.5" /> },
                              { label: "สัตวแพทย์", value: selectedPastAppt.doctor, icon: <User className="w-3.5 h-3.5" /> },
                              { label: "ห้องตรวจ", value: selectedPastAppt.room, icon: <Home className="w-3.5 h-3.5" /> },
                              { label: "ระยะเวลา", value: selectedPastAppt.duration, icon: <Clock className="w-3.5 h-3.5" /> },
                              { label: "ค่าใช้จ่าย", value: selectedPastAppt.cost === "0" ? "-" : `฿${selectedPastAppt.cost}`, icon: <Receipt className="w-3.5 h-3.5" /> },
                            ].map(item => (
                              <div key={item.label} className="p-3 rounded-xl border border-gray-100 bg-[#f9fafb]">
                                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                  {item.icon}
                                  <span className="text-[10px]" style={{ fontWeight: 500 }}>{item.label}</span>
                                </div>
                                <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{item.value}</span>
                              </div>
                            ))}
                          </div>

                          {/* Section divider */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-[10px] text-gray-300" style={{ fontWeight: 500 }}>บันทึก</span>
                            <div className="flex-1 h-px bg-gray-100" />
                          </div>

                          {/* Note */}
                          <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-[#19a589]/[0.04] border border-[#19a589]/10">
                            <FileText className="w-4 h-4 text-[#19a589]/60 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>หมายเหตุ</span>
                              <p className="text-sm text-gray-700 mt-0.5">{selectedPastAppt.note}</p>
                            </div>
                          </div>

                          {/* สัตว์เลี้ยง info */}
                          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-[#f9fafb]">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                              <img src={rec.photo} alt={rec.pet} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{rec.pet}</span>
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                                <span>{rec.breed}</span>
                                <span className="text-gray-200">·</span>
                                <span>{rec.age}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0 rounded-b-3xl">
                          <button
                            onClick={() => setSelectedPastAppt(null)}
                            className="px-5 py-2 rounded-full border border-gray-200 text-sm text-[#4a5565] hover:bg-gray-50 transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            ปิด
                          </button>
                          <button className="flex items-center gap-1.5 px-5 py-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-full hover:bg-gray-50 transition-all" style={{ fontWeight: 500 }}>
                            <Printer className="w-4 h-4" />พิมพ์ใบนัด
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  </AnimatePresence>,
                  document.body
                )}
              </div>
            )}

            {/* ── 10. เวชระเบียน (EMR) ── */}
            {activeTab === TAB_EMR && (
              <div className="space-y-4">
                <EMRHistorySummary petName={rec.pet} />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>

      {/* ── Reschedule Appointment Modal (portal) ── */}
      {rescheduleAppt && createPortal(
        <AnimatePresence>
          <motion.div
            key="reschedule-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
            onClick={() => { setRescheduleAppt(null); setRescheduleDate(""); setRescheduleTime("09:00"); }}
          />
          <div key="reschedule-content" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto max-h-[90vh]"
            >
              {/* Header */}
              <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)]" style={{ backgroundImage: "linear-gradient(173deg, #f0f7f1 0%, #FEFBF8 60%, #f5faf5 100%)" }}>
                <div className="pointer-events-none absolute right-[-20px] top-[-38px] size-[128px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, rgba(55,104,59,0.75) 17.5%, rgba(37,69,40,0.5) 35%, rgba(18,35,20,0.25) 52.5%, rgba(0,0,0,0) 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] bg-white">
                      <CalendarClock className="w-6 h-6 text-[#19a589]" />
                    </div>
                    <div>
                      <h2 className="text-[#101828]" style={{ fontWeight: 700 }}>เลื่อนนัดหมาย</h2>
                      <p className="text-xs text-[#99a1af]">เปลี่ยนวันที่และเวลานัดใหม่</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setRescheduleAppt(null); setRescheduleDate(""); setRescheduleTime("09:00"); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 backdrop-blur border border-gray-200/60 hover:bg-white transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                {/* Current appointment info */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rescheduleAppt.icon}</span>
                  <div className="flex-1">
                    <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{rescheduleAppt.type}</span>
                    <div className="mt-1">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60" style={{ fontWeight: 600 }}>รอนัดหมาย</span>
                    </div>
                  </div>
                </div>

                {/* Section divider — นัดเดิม */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] text-gray-300" style={{ fontWeight: 500 }}>นัดเดิม</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Current date/time info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "วันที่เดิม", value: `${rescheduleAppt.day} ${rescheduleAppt.month} ${rescheduleAppt.year}`, icon: <Calendar className="w-3.5 h-3.5" /> },
                    { label: "เวลาเดิม", value: `${rescheduleAppt.time} น.`, icon: <Clock className="w-3.5 h-3.5" /> },
                    { label: "สัตวแพทย์", value: rescheduleAppt.doctor, icon: <User className="w-3.5 h-3.5" /> },
                    { label: "ห้องตรวจ", value: rescheduleAppt.room, icon: <Home className="w-3.5 h-3.5" /> },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl border border-gray-100 bg-[#f9fafb]">
                      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        {item.icon}
                        <span className="text-[10px]" style={{ fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Note */}
                {rescheduleAppt.note && (
                  <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-[#19a589]/[0.04] border border-[#19a589]/10">
                    <FileText className="w-4 h-4 text-[#19a589]/60 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>หมายเหตุ</span>
                      <p className="text-sm text-gray-700 mt-0.5">{rescheduleAppt.note}</p>
                    </div>
                  </div>
                )}

                {/* Section divider — เลื่อนนัดไป */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-blue-100" />
                  <span className="text-[10px] text-blue-400" style={{ fontWeight: 500 }}>เลื่อนนัดไป</span>
                  <div className="flex-1 h-px bg-blue-100" />
                </div>

                {/* Reschedule date/time pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 500 }}>วันที่ใหม่</label>
                    <DatePickerModern
                      value={rescheduleDate}
                      onChange={setRescheduleDate}
                      placeholder="เลือกวันที่"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 500 }}>เวลาใหม่</label>
                    <TimePickerModern
                      value={rescheduleTime}
                      onChange={setRescheduleTime}
                    />
                  </div>
                </div>

                {/* Preview new date */}
                {rescheduleDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50/60 border border-blue-100"
                  >
                    <CalendarClock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-[12px] text-blue-700" style={{ fontWeight: 500 }}>
                      เลื่อนไปวันที่ {(() => { const nd = new Date(rescheduleDate); return `${String(nd.getDate()).padStart(2, "0")} ${thaiMonths[nd.getMonth()]} ${nd.getFullYear() + 543}`; })()} เวลา {rescheduleTime} น.
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0 rounded-b-3xl">
                <button
                  onClick={() => { setRescheduleAppt(null); setRescheduleDate(""); setRescheduleTime("09:00"); }}
                  className="px-5 py-2 rounded-full border border-gray-200 text-sm text-[#4a5565] hover:bg-gray-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleReschedule()}
                  disabled={!rescheduleDate}
                  className="inline-flex items-center gap-1.5 text-sm text-white px-4 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                  style={{
                    fontWeight: 600,
                    background: rescheduleDate ? "linear-gradient(135deg, #5a9e60, #3a7d40)" : "#ccc",
                    boxShadow: rescheduleDate ? "0 4px 14px rgba(73,138,79,0.28)" : "none",
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  ยืนยันเลื่อนนัด
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* ── Sticker Print Modal (portal) ── */}
      {createPortal(
        <AnimatePresence>
          {showStickerModal && (
            <>
              <motion.div
                key="sticker-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                onClick={() => setShowStickerModal(false)}
              />
              <div className="fixed inset-0 z-[61] flex items-center justify-center p-4" onClick={() => setShowStickerModal(false)}>
                <motion.div
                  key="sticker-modal"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="w-full max-w-[520px] vet-modal relative"
                  style={{ height: "min(560px, calc(100vh - 2rem))" }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="vet-modal-header rounded-t-3xl">
                    <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="vet-modal-header-icon">
                          <Printer className="w-[20px] h-[20px] text-white" />
                        </div>
                        <div>
                          <h2 className="vet-section-title">พิมพ์สติ๊กเกอร์ยา</h2>
                          <p className="vet-tiny mt-[2px]">เลือกรายการยาที่ต้องการพิมพ์สติ๊กเกอร์</p>
                        </div>
                      </div>
                      <button onClick={() => setShowStickerModal(false)} className="vet-modal-close">
                        <X className="w-[16px] h-[16px] text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="vet-modal-body">
                    {/* Select all bar */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs text-gray-400" style={{ fontWeight: 500 }}>
                        เลือกแล้ว {stickerSelected.length}/{drugItems.length} รายการ
                      </span>
                      <button
                        onClick={() => {
                          if (stickerSelected.length === drugItems.length) {
                            setStickerSelected([]);
                          } else {
                            setStickerSelected(drugItems.map(d => d.id));
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs text-[#19a589] hover:text-[#0d7c66] transition-colors px-2.5 py-1 rounded-full hover:bg-[#19a589]/5"
                        style={{ fontWeight: 600 }}
                      >
                        {stickerSelected.length === drugItems.length ? (
                          <><X className="w-3 h-3" /> ยกเลิกทั้งหมด</>
                        ) : (
                          <><Check className="w-3 h-3" /> เลือกทั้งหมด</>
                        )}
                      </button>
                    </div>

                    {drugItems.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <Pill className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                        <p className="text-sm">ยังไม่มีรายการยา</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {drugItems.map((d) => {
                          const isChecked = stickerSelected.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              onClick={() => {
                                setStickerSelected(prev =>
                                  isChecked ? prev.filter(id => id !== d.id) : [...prev, d.id]
                                );
                              }}
                              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border text-left transition-all ${
                                isChecked
                                  ? "border-[#19a589]/30 bg-[#19a589]/[0.04] shadow-sm"
                                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                              }`}
                            >
                              {/* Checkbox */}
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isChecked
                                  ? "border-[#19a589] bg-[#19a589]"
                                  : "border-gray-300 bg-white"
                              }`}>
                                {isChecked && <Check className="w-3 h-3 text-white" />}
                              </div>
                              {/* Drug icon */}
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)" }}>
                                <Pill className="w-3.5 h-3.5 text-white" />
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <span className="text-[13px] text-gray-800 block truncate" style={{ fontWeight: 600 }}>{d.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-gray-400 truncate">{d.genericName || d.name}</span>
                                  <span className="text-[10px] text-gray-300">|</span>
                                  <span className="text-[10px] text-gray-400">{d.qty} {d.unit}</span>
                                </div>
                                {d.instruction && (
                                  <p className="text-[10px] text-[#19a589]/70 mt-1 truncate">{d.instruction}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="vet-modal-footer">
                    <button onClick={() => setShowStickerModal(false)} className="vet-btn vet-btn-secondary">
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => {
                        // TODO: actual print logic
                        setShowStickerModal(false);
                        showSnackbar("success", `ส่งพิมพ์สติ๊กเกอร์ยา ${stickerSelected.length} รายการแล้ว`);
                      }}
                      disabled={stickerSelected.length === 0}
                      className="vet-btn vet-btn-primary btn-green ml-auto"
                      style={stickerSelected.length > 0 ? { background: "linear-gradient(177deg, #5a9e60, #3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" } : {}}
                    >
                      <Printer className="w-[16px] h-[16px]" /> พิมพ์สติ๊กเกอร์ ({stickerSelected.length})
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  List View                                                          */
/* ═══════════════════════════════════════════════════════════════════ */
function ListView({ onSelect }: { onSelect: (rec: VisitRecord) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [visits, setVisits] = useState<VisitRecord[]>(mockVisits);
  const { showSnackbar: showListSnackbar } = useSnackbar();

  const statuses = ["ทั้งหมด", "รอตรวจ", "กำลังตรวจ", "เสร็จสิ้น"];

  const filtered = visits.filter((r) => {
    const ms = r.pet.includes(search) || r.owner.includes(search) || r.hn.toLowerCase().includes(search.toLowerCase()) || r.breed.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "ทั้งหมด" || r.status === statusFilter;
    return ms && mf;
  });

  const waiting   = visits.filter(r => r.status === "รอตรวจ").length;
  const inProgress = visits.filter(r => r.status === "กำลังตรวจ").length;
  const done      = visits.filter(r => r.status === "เสร็จสิ้น").length;

  const handleRegisterSave = (data: RegisterVisitData) => {
    const now = new Date();
    const arrivalTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newVisit: VisitRecord = {
      id: Date.now(),
      hn: data.pet.hn,
      pet: data.pet.name,
      species: data.pet.species,
      breed: data.pet.breed,
      sex: data.pet.sex,
      owner: data.pet.owner,
      phone: data.pet.phone,
      photo: data.pet.photo,
      weight: data.pet.weight,
      age: data.pet.age,
      allergies: "",
      symptoms: data.symptoms.length > 0 ? data.symptoms.join(", ") : "ไม่ระบุอาการ",
      room: data.room || "ห้อง 1 — ทั่วไป",
      doctor: data.vet,
      arrivalTime,
      status: "รอตรวจ",
      type: data.visitType === "ตรวจสุขภาพทั่วไป" ? "การรักษา" : data.visitType,
    };
    setVisits(prev => [newVisit, ...prev]);
    showListSnackbar("success", `ลงทะเบียน "${data.pet.name}" ส่งตรวจสำเร็จแล้ว`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h1 className="text-gray-900" style={{ fontWeight: 700 }}>ระบบตรวจรักษา</h1>
            <p className="text-xs text-gray-400 mt-0.5">คิววันนี้ {visits.length} ราย · รอตรวจ {waiting} · กำลังตรวจ {inProgress} · เสร็จสิ้น {done}</p>
          </div>
          <button onClick={() => setRegisterOpen(true)} className="flex items-center gap-1.5 text-white rounded-full flex-shrink-0 active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px] cursor-pointer"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /><span className="hidden xs:inline">ลงทะเบียนสัตว์</span><span className="xs:hidden text-[12px]">ลงทะเบียน</span>
          </button>
          <RegisterVisitModal open={registerOpen} onClose={() => setRegisterOpen(false)} onSave={handleRegisterSave} />
        </div>
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสัตว์, เจ้าของ, HN..."
              className="vet-search" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="text-xs py-1.5 rounded-full border transition-all px-[16px] py-[2px]"
                style={{
                  background: statusFilter === s ? "#19a589" : "white",
                  color: statusFilter === s ? "white" : "#6b7280",
                  borderColor: statusFilter === s ? "#19a589" : "#e5e7eb",
                  fontWeight: statusFilter === s ? 600 : 400,
                  boxShadow: statusFilter === s ? "0 2px 8px rgba(73,138,79,0.25)" : undefined,
                }}>{s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <motion.div className="flex-1 overflow-y-auto p-5" variants={cv} initial="hidden" animate="visible">
        {filtered.length === 0 ? (
          <div className="py-24 text-center"><p className="text-sm text-gray-400">ไม่พบรายการที่ตรงกัน</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" variants={cv}>
            {filtered.map(rec => (
              <VisitCard key={rec.id} rec={rec} onClick={() => onSelect(rec)} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Component                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
export function Visits() {
  const [selectedRec, setSelectedRec] = useState<VisitRecord | null>(null);
  const { setSidebarCollapsed } = useOutletContext<LayoutOutletContext>();

  const handleSelect = (rec: VisitRecord) => {
    setSelectedRec(rec);
    setTimeout(() => setSidebarCollapsed(true), 300);
  };

  const handleBack = () => {
    setSelectedRec(null);
    setSidebarCollapsed(false);
  };

  return (
    <motion.div className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}>
      <AnimatePresence mode="wait">
        {selectedRec ? (
          <motion.div key="detail" className="flex flex-col flex-1 min-h-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}>
            <DetailView rec={selectedRec} onBack={handleBack} />
          </motion.div>
        ) : (
          <motion.div key="list" className="flex flex-col flex-1 min-h-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}>
            <ListView onSelect={handleSelect} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}