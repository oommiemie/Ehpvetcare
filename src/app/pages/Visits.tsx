// Real PNG icons from src/assets/
import imgRegister     from "@/assets/medical-record-pet.png";
import imgVitals       from "@/assets/vital-sign-pet.png";
import imgExam         from "@/assets/Check-up-pet.png";
import imgDiagnosis    from "@/assets/diagnose-pet.png";
import imgVaccine      from "@/assets/vaccine-pet.png";
import imgDeworming    from "@/assets/parasite.png";
import imgLab          from "@/assets/lab-pet.png";
import imgPrescription from "@/assets/drug-pet.png";
import imgService      from "@/assets/service-pet.png";
import imgAppointment  from "@/assets/appointment-pet.png";
import imgXray         from "@/assets/xray-pet.png";
import imgEMR          from "@/assets/emr-pet.png";
import imgProcedures   from "@/assets/treatment-pet.png";

import svgTemplatePaths from "../../imports/svg-fje83nw5y4";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { th } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutOutletContext } from "../components/Layout";
import { heroPillStyle, heroPillIconStyle, heroPillIconClass, heroPillClearStyle } from "../utils/heroFilter";
import { ExamPhotosPanel, ExamBodyMapPanel } from "../components/ExamMediaPanel";
import { RegisterVisitModal, type RegisterVisitData } from "../components/RegisterVisitModal";
import DiagnosisSection from "../components/DiagnosisSection";
import { LabOrderModal, type LabOrderData } from "../components/LabOrderModal";
import { XRayOrderModal, type XRayOrderData } from "../components/XRayOrderModal";
import { AddServiceModal, type OrderLineItem } from "../components/AddServiceModal";
import { AddDrugModal, type DrugOrderItem } from "../components/AddDrugModal";
import { DatePickerModern } from "../components/DatePickerModern";
import { TimePickerModern } from "../components/TimePickerModern";
import { DewormingTab, getLatestDeworming } from "../components/DewormingTab";
import { VETS, INIT_SLOTS } from "./SlotBuilder";
import { useLang } from "../contexts/LanguageContext";
import { TemplatePicker } from "../components/TemplatePicker";
import { ServicePresetPicker } from "../components/ServicePresetPicker";
import { SymptomSetPicker } from "../components/SymptomSetPicker";
import { DrugTemplatePicker } from "../components/DrugTemplatePicker";
import { drugCatalog } from "../components/AddDrugModal";
import { getVitalRef, fmtRange } from "../components/vitalSignRef";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { formatPhone } from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { EMRHistorySummary } from "../components/EMRHistorySummary";
import { ProceduresTab } from "../components/ipd/ProceduresTab";
import { useAutosaveDraft, AutosaveStatusBadge } from "../components/AutosaveDraft";
import {
  AlertTriangle, PawPrint, Thermometer, Heart, Wind, Weight,
  Search, Plus, Printer, Syringe, FlaskConical, Pill, Receipt,
  ChevronLeft, ArrowLeft, Clock, CheckCircle2, Loader2, Circle,
  ClipboardList, FileText, Stethoscope, Activity, Calendar, CalendarDays,
  LayoutList, X, BookOpen, ChevronRight, User, LayoutTemplate, Phone,
  ChevronDown, Home, Scissors, Eye, Ear, Bone, Brain, Droplets,
  Layers, Check, ChevronUp, AlertCircle, MapPin, ImagePlus,
  Pencil, Trash2, CalendarClock, ScanLine, Bug,
  CreditCard, Banknote, Wallet, QrCode, Smartphone, Tag, RefreshCw, Camera,
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
    id: 1, hn: "HN-2026-002",
    pet: "ร็อคกี้", species: "สุนัข", breed: "เยอรมันเชพเพิร์ด", sex: "ผู้",
    owner: "สมศักดิ์ ใจดี", phone: "081-234-5678",
    photo: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400&q=80&auto=format&fit=crop",
    weight: "34.0 กก.", age: "6 ปี", allergies: "",
    symptoms: "ลุกช้า เดินกะเผลกขาหลังหลังตื่นนอน ติดตามข้อสะโพกเสื่อม",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
    arrivalTime: "08:30", status: "เสร็จสิ้น", type: "การรักษา",
  },
  {
    id: 2, hn: "HN-2026-013",
    pet: "มิ้ว", species: "แมว", breed: "สก็อตติช โฟลด์", sex: "เมีย",
    owner: "กัญญา สุวรรณ", phone: "091-678-9012",
    photo: "https://images.unsplash.com/photo-1719218214197-441901e981b7?w=400&q=80&auto=format&fit=crop",
    weight: "3.2 กก.", age: "1 ปี", allergies: "",
    symptoms: "ฉีดวัคซีน FeLV เข็มแรก ก่อนเริ่มปล่อยเลี้ยงนอกบ้าน",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. วรรณา",
    arrivalTime: "08:45", status: "เสร็จสิ้น", type: "วัคซีน",
  },
  {
    id: 3, hn: "HN-2026-021",
    pet: "เดซี่", species: "นก", breed: "หงส์หยก", sex: "เมีย",
    owner: "ธีรพล วงศ์สุวรรณ", phone: "085-777-8899",
    photo: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=80&auto=format&fit=crop",
    weight: "38 กรัม", age: "2 ปี", allergies: "",
    symptoms: "จะงอยปากและเล็บยาว เกาะคอนลำบาก นัดกรอแต่งตามรอบ",
    room: "ห้อง 4 — Exotic", doctor: "พญ. ณัฐสุดา ทองพูล",
    arrivalTime: "09:00", status: "เสร็จสิ้น", type: "ตรวจสุขภาพ",
  },
  {
    id: 4, hn: "HN-2026-007",
    pet: "ลัคกี้", species: "สุนัข", breed: "ชิสุ", sex: "ผู้",
    owner: "อนันต์ ศรีวิไล", phone: "089-234-1122",
    photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80&auto=format&fit=crop",
    weight: "6.2 กก.", age: "7 ปี", allergies: "อาหารโปรตีนไก่",
    symptoms: "คันผิวหนัง เการักแร้-ขาหนีบ ผิวแดง ภูมิแพ้ผิวหนังกำเริบ",
    room: "ห้อง 3 — ผิวหนัง", doctor: "สพ.ว. วรรณา",
    arrivalTime: "09:15", status: "กำลังตรวจ", type: "การรักษา",
  },
  {
    id: 5, hn: "HN-2026-030",
    pet: "เต่าทอง", species: "สัตว์เลื้อยคลาน", breed: "เต่าซูลคาต้า", sex: "ผู้",
    owner: "วิภาดา สายทอง", phone: "096-333-8899",
    photo: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400&q=80&auto=format&fit=crop",
    weight: "6.5 กก.", age: "4 ปี", allergies: "",
    symptoms: "ซึม กินหญ้าน้อยลงช่วงฝนตกอากาศเย็น ไม่ค่อยเดิน",
    room: "ห้อง 4 — Exotic", doctor: "พญ. ณัฐสุดา ทองพูล",
    arrivalTime: "09:30", status: "รอตรวจ", type: "การรักษา",
  },
  {
    id: 6, hn: "HN-2026-004",
    pet: "เบลล่า", species: "สุนัข", breed: "ปอมเมอเรเนียน", sex: "เมีย",
    owner: "ปรียาภรณ์ ทองดี", phone: "094-321-6543",
    photo: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=80&auto=format&fit=crop",
    weight: "2.8 กก.", age: "3 ปี", allergies: "",
    symptoms: "เดินยกขาหลังขวาเป็นพัก ๆ สะบัดขาแล้วเดินต่อ สะบ้าเคลื่อน Grade 2",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
    arrivalTime: "09:45", status: "รอตรวจ", type: "การรักษา",
  },
  {
    id: 7, hn: "HN-2026-034",
    pet: "ทองคำ", species: "ปลา", breed: "ปลาทองออรันดา", sex: "ผู้",
    owner: "กิตติพงษ์ วงษ์ทอง", phone: "086-447-2211",
    photo: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80&auto=format&fit=crop",
    weight: "150 กรัม", age: "2 ปี", allergies: "",
    symptoms: "ลอยตัวเอียงหลังกินอาหาร ว่ายกลับตัวลำบาก ถุงลมกำเริบซ้ำ",
    room: "ห้อง 4 — Exotic", doctor: "พญ. ณัฐสุดา ทองพูล",
    arrivalTime: "10:00", status: "รอตรวจ", type: "การรักษา",
  },
  {
    id: 8, hn: "HN-2026-016",
    pet: "กะทิ", species: "แมว", breed: "วิเชียรมาศ", sex: "เมีย",
    owner: "ชลธิชา อินทร์แก้ว", phone: "095-888-2211",
    photo: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80&auto=format&fit=crop",
    weight: "3.6 กก.", age: "6 ปี", allergies: "Amoxicillin",
    symptoms: "ตรวจสุขภาพประจำปี ประเมินหินปูนฟันกรามก่อนนัดขูดหินปูน",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย",
    arrivalTime: "10:15", status: "รอตรวจ", type: "ตรวจสุขภาพ",
  },
  {
    id: 9, hn: "HN-2026-023",
    pet: "เรนโบว์", species: "นก", breed: "บลูแอนด์โกลด์ มาคอว์", sex: "ผู้",
    owner: "สราวุฒิ ตั้งตรงจิตร", phone: "087-654-3210",
    photo: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80&auto=format&fit=crop",
    weight: "1.1 กก.", age: "6 ปี", allergies: "",
    symptoms: "กลับมาจามมีน้ำมูก หายใจมีเสียงหวีดเล็กน้อยหลังหายจาก URI",
    room: "ห้อง 4 — Exotic", doctor: "พญ. ณัฐสุดา ทองพูล",
    arrivalTime: "10:30", status: "รอตรวจ", type: "การรักษา",
  },
  {
    id: 10, hn: "HN-2026-020",
    pet: "เสือน้อย", species: "แมว", breed: "อเมริกัน ช็อตแฮร์", sex: "ผู้",
    owner: "รัตนา จันทร์เพ็ญ", phone: "086-321-9900",
    photo: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&q=80&auto=format&fit=crop",
    weight: "5.2 กก.", age: "5 ปี", allergies: "",
    symptoms: "นัดชั่งน้ำหนักติดตามโปรแกรมลดความอ้วน (BCS 7/9)",
    room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. วรรณา",
    arrivalTime: "10:45", status: "รอตรวจ", type: "ตรวจสุขภาพ",
  },
  {
    id: 11, hn: "HN-2026-039",
    pet: "มิลค์", species: "หนู", breed: "แฮมสเตอร์ซีเรียน", sex: "เมีย",
    owner: "ศิริพร แก้วมณี", phone: "083-321-6655",
    photo: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=80&auto=format&fit=crop",
    weight: "145 กรัม", age: "1 ปี", allergies: "",
    symptoms: "คลำตรวจก้อนซ้ำตามนัดหลังผ่าตัดก้อนเนื้อสีข้าง ผล benign",
    room: "ห้อง 4 — Exotic", doctor: "พญ. ณัฐสุดา ทองพูล",
    arrivalTime: "11:00", status: "รอตรวจ", type: "ตรวจสุขภาพ",
  },
  {
    id: 12, hn: "HN-2026-043",
    pet: "หิมะ", species: "กระต่าย", breed: "เนเธอร์แลนด์ดวอฟ", sex: "เมีย",
    owner: "อรอนงค์ พรมเสน", phone: "091-444-5566",
    photo: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80&auto=format&fit=crop",
    weight: "1.1 กก.", age: "2 ปี", allergies: "",
    symptoms: "เคี้ยวอาหารช้า ทำหญ้าหล่นจากปาก ตรวจช่องปากตามรอบ molar spurs",
    room: "ห้อง 4 — Exotic", doctor: "พญ. ณัฐสุดา ทองพูล",
    arrivalTime: "11:15", status: "รอตรวจ", type: "ตรวจสุขภาพ",
  },
  {
    id: 13, hn: "HN-2026-033",
    pet: "เจลลี่", species: "สัตว์เลื้อยคลาน", breed: "เลพเพิร์ดเก็คโค่", sex: "เมีย",
    owner: "ปกรณ์ เลิศวิริยะ", phone: "084-777-1234",
    photo: "https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=400&q=80&auto=format&fit=crop",
    weight: "58 กรัม", age: "2 ปี", allergies: "",
    symptoms: "ดูแผลไฟไหม้ใต้ท้องรอบสุดท้าย สังเกตคราบลอกไม่หมดบริเวณแผล",
    room: "ห้อง 4 — Exotic", doctor: "พญ. ณัฐสุดา ทองพูล",
    arrivalTime: "11:30", status: "รอตรวจ", type: "การรักษา",
  },
  {
    id: 14, hn: "HN-2026-046",
    pet: "สกาย", species: "กระรอก", breed: "กระรอกดินริชาร์ดสัน", sex: "ผู้",
    owner: "วิชัย มงคล", phone: "083-456-7890",
    photo: "https://images.unsplash.com/photo-1507666405895-422eee7d517f?w=400&q=80&auto=format&fit=crop",
    weight: "450 กรัม", age: "2 ปี", allergies: "",
    symptoms: "นัดตัดเล็บตามรอบ 6-8 สัปดาห์ ติดตามน้ำหนักหลังคุมอาหาร",
    room: "ห้อง 4 — Exotic", doctor: "พญ. ณัฐสุดา ทองพูล",
    arrivalTime: "11:45", status: "รอตรวจ", type: "ตรวจสุขภาพ",
  },
];

// ── ใบสั่งยาแบบ HOSxP: จ่ายยาเป็นคอร์สหลายวัน (perDay × days = qty รวม) ──
interface DrugItem {
  id: number;
  name: string;
  genericName: string;
  qty: number;        // จำนวนเบิก (= perDay × days) — จำนวนที่สั่งเบิก
  dispensed: number;  // จำนวนจ่าย — จำนวนที่จ่ายจริง (ค่าเริ่มต้น = จำนวนเบิก) · ใช้คิดเงิน/ตัดสต๊อก
  unit: string;
  price: number;      // ราคา/หน่วย
  instruction: string;
  indication: string;
  perDay: number;     // จำนวนที่ใช้ต่อวัน
  days: number;       // Day — จำนวนวันที่จ่าย
  stockCut?: boolean; // ตัด Stock แล้วหรือยัง (true=จ่าย/ตัดแล้ว · เขียว, false/undefined=ยังไม่ตัด · แดง)
}
/** คำนวณจำนวนยารวมจาก จำนวน/วัน × จำนวนวัน (รองรับทศนิยม เช่น 0.5 เม็ด) */
const drugQty = (perDay: number, days: number) => Math.round(perDay * days * 100) / 100;

const drugs: DrugItem[] = [
  { id: 1, name: "อะม็อกซิซิลลิน 250mg", genericName: "Amoxicillin 250mg", perDay: 2, days: 7, qty: 14, dispensed: 14, unit: "เม็ด", price: 8, instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 7 วัน", indication: "ติดเชื้อแบคทีเรีย", stockCut: true },
  { id: 2, name: "เพรดนิโซโลน 5mg", genericName: "Prednisolone 5mg", perDay: 1, days: 5, qty: 5, dispensed: 5, unit: "เม็ด", price: 6, instruction: "กินวันละ 1 ครั้ง ครั้งละ 0.5 เม็ด นาน 5 วัน", indication: "ลดการอักเสบ", stockCut: true },
];

/* ยาเดิมจาก visit ก่อนหน้า — แหล่งข้อมูลปุ่ม "Remed ยาเดิม" (เลือกเฉพาะรายการที่ต้องการได้) */
const REMED_PREVIOUS = {
  visitLabel: "Visit ก่อนหน้า · 23 มิ.ย. 2569 · น.สพ.กวิน",
  drugs: [
    { name: "อะม็อกซิซิลลิน 250mg",  genericName: "Amoxicillin 250mg",     perDay: 2, days: 7, unit: "เม็ด",   price: 8,  instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 7 วัน",        indication: "ติดเชื้อแบคทีเรีย" },
    { name: "คลอร์เฟนิรามีน 4mg",    genericName: "Chlorpheniramine 4mg",  perDay: 2, days: 5, unit: "เม็ด",   price: 5,  instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด",                   indication: "แก้แพ้ / คัน" },
    { name: "โอเมพราโซล 20mg",       genericName: "Omeprazole 20mg",       perDay: 1, days: 7, unit: "แคปซูล", price: 12, instruction: "กินวันละ 1 ครั้ง ก่อนอาหารเช้า",                    indication: "ลดกรดในกระเพาะ" },
    { name: "ยาหยอดหู Surolan",      genericName: "Surolan Ear Drops",      perDay: 2, days: 7, unit: "ขวด",    price: 320, instruction: "หยอดหูข้างละ 3-5 หยด วันละ 2 ครั้ง",              indication: "หูอักเสบ / เชื้อรา" },
  ],
};

/* ประวัติการวินิจฉัยครั้งก่อน — ใช้ 2 ที่: พาเนล "ประวัติการวินิจฉัย" (แท็บวินิจฉัย)
   และเป็นแหล่งข้อมูลของปุ่ม "Remed โรคเดิม" ใน DiagnosisSection */
export const DIAG_HISTORY = [
  { date: "10 ก.พ. 69", icd: "J00",   disease: "Acute nasopharyngitis",      diagType: "Principal",    vet: "สพ.สมชาย รักสัตว์",   status: "ยืนยัน",    note: "",                                              priority: "3551", licenseNo: "555" },
  { date: "28 ม.ค. 69", icd: "L30.9", disease: "Dermatitis, unspecified",    diagType: "Principal",    vet: "สพ.วิภาวดี ใจดี",     status: "ยืนยัน",    note: "ผิวหนังอักเสบบริเวณท้อง มีอาการคัน",          priority: "2100", licenseNo: "789" },
  { date: "15 ธ.ค. 68", icd: "K29.7", disease: "Gastritis, unspecified",     diagType: "Co-morbidity", vet: "สพ.สมชาย รักสัตว์",   status: "ยืนยัน",    note: "",                                              priority: "1800", licenseNo: "555" },
  { date: "3 พ.ย. 68",  icd: "A09",   disease: "Infectious gastroenteritis", diagType: "Principal",    vet: "สพ.ปรีชา สัตวแพทย์",  status: "รอยืนยัน",  note: "อาเจียนและท้องเสีย 2 วัน",                      priority: "2500", licenseNo: "321" },
  { date: "20 ก.ย. 68", icd: "H10.9", disease: "Conjunctivitis, unspecified",diagType: "Principal",    vet: "สพ.สมชาย รักสัตว์",   status: "ยืนยัน",    note: "",                                              priority: "1200", licenseNo: "555" },
  { date: "5 ส.ค. 68",  icd: "R50.9", disease: "Fever, unspecified",         diagType: "Other",        vet: "สพ.วิภาวดี ใจดี",     status: "ยืนยัน",    note: "ไข้สูง 2 วัน หายเองหลังรับยา",                priority: "900",  licenseNo: "789" },
];
export type DiagHistoryItem = (typeof DIAG_HISTORY)[number];

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
const TAB_DEWORMING = "deworming";
const TAB_LAB = "lab";
const TAB_PRESCRIPTION = "prescription";
const TAB_PROCEDURES = "procedures";
const TAB_SERVICE = "service";
const TAB_PAYMENT = "payment";
const TAB_APPOINTMENT = "appointment";
const TAB_EMR = "emr";

const visitTabs = [
  { key: TAB_REGISTER, labelKey: "opd.tab.register", icon: ClipboardList, img: imgRegister },
  { key: TAB_VITALS, labelKey: "opd.tab.vitals", icon: Activity, img: imgVitals },
  { key: TAB_EXAM, labelKey: "opd.tab.exam", icon: Stethoscope, img: imgExam },
  { key: TAB_DIAGNOSIS, labelKey: "opd.tab.diagnosis", icon: BookOpen, img: imgDiagnosis },
  { key: TAB_VACCINE, labelKey: "opd.tab.vaccine", icon: Syringe, img: imgVaccine },
  { key: TAB_DEWORMING, labelKey: "opd.tab.deworming", icon: Bug, img: imgDeworming },
  { key: TAB_LAB, labelKey: "opd.tab.lab", icon: FlaskConical, img: imgLab },
  { key: TAB_PRESCRIPTION, labelKey: "opd.tab.prescription", icon: Pill, img: imgPrescription },
  { key: TAB_PROCEDURES, labelKey: "opd.tab.procedures", icon: Stethoscope, img: imgProcedures },
  { key: TAB_SERVICE, labelKey: "opd.tab.service", icon: Receipt, img: imgService },
  { key: TAB_APPOINTMENT, labelKey: "opd.tab.appointment", icon: Calendar, img: imgAppointment },
  { key: TAB_EMR, labelKey: "opd.tab.emr", icon: FileText, img: imgEMR },
  { key: TAB_PAYMENT, labelKey: "opd.tab.payment", icon: CreditCard, img: imgService },
];

/* ── Recommended tabs per visit type — used to dim non-essential tabs ── */
const RECOMMENDED_TABS_BY_TYPE: Record<string, string[]> = {
  "ตรวจสุขภาพทั่วไป": [TAB_REGISTER, TAB_VITALS, TAB_EXAM, TAB_DIAGNOSIS, TAB_DEWORMING, TAB_PRESCRIPTION, TAB_SERVICE, TAB_PAYMENT, TAB_APPOINTMENT],
  "เจ็บป่วย":         [TAB_REGISTER, TAB_VITALS, TAB_EXAM, TAB_DIAGNOSIS, TAB_LAB, TAB_PRESCRIPTION, TAB_SERVICE, TAB_PAYMENT, TAB_APPOINTMENT],
  "ฉุกเฉิน":          [TAB_REGISTER, TAB_VITALS, TAB_EXAM, TAB_DIAGNOSIS, TAB_LAB, TAB_PRESCRIPTION, TAB_SERVICE, TAB_PAYMENT],
  "ตรวจติดตาม":       [TAB_REGISTER, TAB_VITALS, TAB_EXAM, TAB_DEWORMING, TAB_PRESCRIPTION, TAB_SERVICE, TAB_PAYMENT, TAB_APPOINTMENT],
  "ฉีดวัคซีน":        [TAB_REGISTER, TAB_VITALS, TAB_VACCINE, TAB_DEWORMING, TAB_APPOINTMENT, TAB_SERVICE, TAB_PAYMENT],
  "ตัดขน/อาบน้ำ":     [TAB_REGISTER, TAB_SERVICE, TAB_PAYMENT, TAB_APPOINTMENT],
  "ฝากเลี้ยง":        [TAB_REGISTER, TAB_VITALS, TAB_SERVICE, TAB_PAYMENT, TAB_APPOINTMENT],
};
const DEFAULT_RECOMMENDED = [TAB_REGISTER, TAB_VITALS, TAB_EXAM, TAB_DIAGNOSIS, TAB_PRESCRIPTION, TAB_SERVICE, TAB_PAYMENT];

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
const iv = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };

/* ═══════════════════════════════════════════════════════════════════ */
/*  Follow-up shortcut chips (relative-to-today)                       */
/* ═══════════════════════════════════════════════════════════════════ */
type FollowUpKind = "day" | "week" | "month";
const FOLLOWUP_PRESETS: { label: string; n: number; kind: FollowUpKind }[] = [
  { label: "วันนี้",     n: 0, kind: "day"   },
  { label: "พรุ่งนี้",   n: 1, kind: "day"   },
  { label: "+3 วัน",     n: 3, kind: "day"   },
  { label: "+1 สัปดาห์", n: 1, kind: "week"  },
  { label: "+2 สัปดาห์", n: 2, kind: "week"  },
  { label: "+1 เดือน",   n: 1, kind: "month" },
  { label: "+3 เดือน",   n: 3, kind: "month" },
  { label: "+6 เดือน",   n: 6, kind: "month" },
];
function followUpAdd(n: number, kind: FollowUpKind): string {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (kind === "day")   d.setDate(d.getDate() + n);
  if (kind === "week")  d.setDate(d.getDate() + n * 7);
  if (kind === "month") d.setMonth(d.getMonth() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function FollowUpShortcuts({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const THAI_M = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const selectedThai = value
    ? (() => { const d = new Date(value + "T00:00:00"); return isNaN(d.getTime()) ? "" : `${d.getDate()} ${THAI_M[d.getMonth()]} ${d.getFullYear() + 543}`; })()
    : "";
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {FOLLOWUP_PRESETS.map(p => {
          const target = followUpAdd(p.n, p.kind);
          const on = value === target;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(target)}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] transition-all"
              style={{
                fontWeight: on ? 700 : 600,
                color: on ? "#ffffff" : "#475569",
                background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "rgba(0,0,0,0.04)",
                border: on ? "1px solid #0d7c66" : "1px solid transparent",
                boxShadow: on ? "0 3px 10px rgba(25,165,137,0.22)" : "none",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {selectedThai && (
        <p className="text-[10.5px] text-gray-500 mt-1.5">
          วันที่นัด: <span className="text-[#0d7c66]" style={{ fontWeight: 700 }}>{selectedThai}</span>
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  OPD Deworming Form — inline (matches vaccine layout)               */
/* ═══════════════════════════════════════════════════════════════════ */
const DEWORM_PRODUCTS = [
  "Drontal Plus",
  "Milbemax",
  "Bravecto",
  "NexGard Spectra",
  "Frontline Plus",
  "Revolution",
  "Advocate",
  "Profender",
  "อื่นๆ",
];
const DEWORM_BRANDS = ["Bayer", "Novartis", "MSD", "Merial", "Zoetis", "Elanco", "Boehringer", "อื่นๆ"];
const DEWORM_TYPES = ["พยาธิภายใน", "พยาธิภายนอก", "ครอบคลุมทั้งสอง"] as const;
const DEWORM_ROUTES = ["รับประทาน", "หยอดหลังคอ", "ฉีด", "อื่นๆ"] as const;
const DEWORM_PRE_OPTS = ["สุขภาพปกติ", "ท้องเสีย", "อาเจียน", "เบื่ออาหาร", "ซึม", "ตั้งท้อง", "ให้นมลูก", "โรคประจำตัว"];
const DEWORM_POST_OPTS = ["ไม่มีอาการผิดปกติ", "อาเจียน", "ท้องเสีย", "แพ้ยา", "ซึม", "พบพยาธิในอุจจาระ", "อื่นๆ"];
const DEWORM_NEXT_PRESETS = [
  { label: "30 วัน",  days: 30  },
  { label: "90 วัน",  days: 90  },
  { label: "180 วัน", days: 180 },
  { label: "1 ปี",    days: 365 },
];

function todayIsoLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDaysIso(base: string, n: number): string {
  const d = base ? new Date(base + "T00:00:00") : new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface DewormHistoryItem {
  id: string;
  date: string;
  time?: string;
  type: string;
  route: string;
  productName: string;
  brand?: string;
  lotNumber?: string;
  expiryDate?: string;
  nextAppointmentDate?: string;
  recordedBy?: string;
}

function loadDewormHistory(key: string): DewormHistoryItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const list = JSON.parse(raw) as DewormHistoryItem[];
      return [...list].sort((a, b) => `${b.date}T${b.time ?? ""}`.localeCompare(`${a.date}T${a.time ?? ""}`));
    }
  } catch { /* ignore */ }
  return [];
}

function thaiShortDateOpd(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function OpdDewormingForm({ hn, defaultDoctor }: { hn: string; defaultDoctor?: string }) {
  const { showSnackbar } = useSnackbar();
  const storageKey = `vet-pet-deworming-${hn}`;

  // History — reload after save
  const [history, setHistory] = useState<DewormHistoryItem[]>(() => loadDewormHistory(storageKey));
  // Click-to-view-full popup
  const [expanded, setExpanded] = useState<(DewormHistoryItem & { preAssessment?: string[]; preNote?: string; postEffects?: string[]; postNote?: string; drugRegNo?: string }) | null>(null);

  // Form state
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState<typeof DEWORM_TYPES[number]>("พยาธิภายใน");
  const [route, setRoute] = useState<typeof DEWORM_ROUTES[number]>("รับประทาน");
  const [lotNumber, setLotNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [date, setDate] = useState(todayIsoLocal());
  const [time, setTime] = useState("");
  const [drugRegNo, setDrugRegNo] = useState("");
  const [doctorName, setDoctorName] = useState(defaultDoctor ?? "");

  const [preAssessment, setPreAssessment] = useState<string[]>([]);
  const [preNote, setPreNote] = useState("");
  const [postEffects, setPostEffects] = useState<string[]>([]);
  const [postNote, setPostNote] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");

  const toggleArr = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const handleSave = () => {
    if (!productName.trim()) { showSnackbar("error", "กรุณาเลือก / ระบุชื่อผลิตภัณฑ์"); return; }
    if (!date) { showSnackbar("error", "กรุณาระบุวันที่ถ่ายพยาธิ"); return; }

    const rec = {
      id: `dw-${Date.now()}`,
      date, time,
      type: type === "ครอบคลุมทั้งสอง" ? "ทั้งภายในและภายนอก" : type.replace("พยาธิ", ""),
      route,
      productName: productName.trim(),
      brand: brand.trim(),
      drugRegNo: drugRegNo.trim() || undefined,
      lotNumber: lotNumber.trim() || undefined,
      expiryDate: expiryDate || undefined,
      preAssessment,
      preNote: preNote.trim() || undefined,
      postEffects,
      postNote: postNote.trim() || undefined,
      nextAppointmentDate: nextAppointmentDate || undefined,
      recordedAt: new Date().toISOString(),
      recordedBy: doctorName || undefined,
    };
    try {
      const raw = localStorage.getItem(storageKey);
      const list = raw ? JSON.parse(raw) : [];
      list.push(rec);
      localStorage.setItem(storageKey, JSON.stringify(list));
      setHistory(loadDewormHistory(storageKey));
      showSnackbar("success", "บันทึกถ่ายพยาธิเรียบร้อย");
    } catch {
      showSnackbar("error", "บันทึกไม่สำเร็จ");
    }
  };

  const labelCls = "text-[10.5px] text-gray-400 mb-1.5 block";
  const labelStyle = { fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" as const };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start pb-4">
      {/* ═══════════ LEFT — Form sections ═══════════ */}
      <div className="space-y-4">
      {/* Section 1: ข้อมูลการถ่ายพยาธิ — vaccine-style 4-col grid */}
      <section
        className="relative bg-white rounded-2xl border border-gray-100"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
      >
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <Bug className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ข้อมูลการถ่ายพยาธิ</h3>
            <p className="text-[11px] text-gray-500">เลือกผลิตภัณฑ์ รายละเอียดการให้ยา และเวลา</p>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Row 1 */}
            <div>
              <label className={labelCls} style={labelStyle}>เลือกผลิตภัณฑ์ <span className="text-rose-400 normal-case">*</span></label>
              <div className="relative">
                <select value={productName} onChange={e => setProductName(e.target.value)} className="vet-select appearance-none">
                  <option value="">-- เลือก --</option>
                  {DEWORM_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>ยี่ห้อ</label>
              <div className="relative">
                <select value={brand} onChange={e => setBrand(e.target.value)} className="vet-select appearance-none">
                  <option value="">-- เลือก --</option>
                  {DEWORM_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>ประเภทพยาธิ <span className="text-rose-400 normal-case">*</span></label>
              <div className="relative">
                <select value={type} onChange={e => setType(e.target.value as typeof DEWORM_TYPES[number])} className="vet-select appearance-none">
                  {DEWORM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>วิธีให้ยา <span className="text-rose-400 normal-case">*</span></label>
              <div className="relative">
                <select value={route} onChange={e => setRoute(e.target.value as typeof DEWORM_ROUTES[number])} className="vet-select appearance-none">
                  {DEWORM_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <label className={labelCls} style={labelStyle}>Lot Number</label>
              <input value={lotNumber} onChange={e => setLotNumber(e.target.value)} placeholder="เช่น B12345" className="vet-input" />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>วันหมดอายุ</label>
              <DatePickerModern value={expiryDate} onChange={setExpiryDate} placeholder="เลือกวันหมดอายุ" />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>วันที่ถ่าย <span className="text-rose-400 normal-case">*</span></label>
              <DatePickerModern value={date} onChange={setDate} placeholder="เลือกวันที่" />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>เวลาให้ยา</label>
              <TimePickerModern value={time} onChange={setTime} />
            </div>

            {/* Row 3 — extra */}
            <div>
              <label className={labelCls} style={labelStyle}>เลขทะเบียนยา</label>
              <input value={drugRegNo} onChange={e => setDrugRegNo(e.target.value)} placeholder="1A xxx/xx" className="vet-input" />
            </div>
            <div className="sm:col-span-3 lg:col-span-3">
              <label className={labelCls} style={labelStyle}>สัตวแพทย์ผู้ทำ <span className="text-rose-400 normal-case">*</span></label>
              <input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="ชื่อสัตวแพทย์" className="vet-input" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: การประเมินสุขภาพก่อนถ่ายพยาธิ */}
      <section className="relative bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <Stethoscope className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>การประเมินสุขภาพก่อนถ่ายพยาธิ</h3>
            <p className="text-[11px] text-gray-500">Pre-assessment · เลือกได้หลายข้อ</p>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {DEWORM_PRE_OPTS.map(opt => {
              const on = preAssessment.includes(opt);
              return (
                <label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <span className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#ffffff",
                      border: on ? "1px solid #0d7c66" : "1.5px solid #d1d5db",
                    }}>
                    {on && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <input type="checkbox" checked={on} onChange={() => setPreAssessment(toggleArr(preAssessment, opt))} className="hidden" />
                  <span className="text-[11.5px] text-gray-700" style={{ fontWeight: 500 }}>{opt}</span>
                </label>
              );
            })}
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>หมายเหตุเพิ่มเติม</label>
            <textarea value={preNote} onChange={e => setPreNote(e.target.value)} rows={2} placeholder="รายละเอียดอาการ / โรคประจำตัว" className="vet-textarea" />
          </div>
        </div>
      </section>

      {/* Section 3: ผลหลังการถ่ายพยาธิ */}
      <section className="relative bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <ClipboardList className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ผลหลังการถ่ายพยาธิ</h3>
            <p className="text-[11px] text-gray-500">Post-treatment · เลือกได้หลายข้อ</p>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {DEWORM_POST_OPTS.map(opt => {
              const on = postEffects.includes(opt);
              return (
                <label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <span className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#ffffff",
                      border: on ? "1px solid #0d7c66" : "1.5px solid #d1d5db",
                    }}>
                    {on && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <input type="checkbox" checked={on} onChange={() => setPostEffects(toggleArr(postEffects, opt))} className="hidden" />
                  <span className="text-[11.5px] text-gray-700" style={{ fontWeight: 500 }}>{opt}</span>
                </label>
              );
            })}
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>บันทึกอาการและการติดตาม</label>
            <textarea value={postNote} onChange={e => setPostNote(e.target.value)} rows={2} placeholder="รายละเอียดอาการและแผนติดตาม" className="vet-textarea" />
          </div>
        </div>
      </section>

      {/* Section 4: กำหนดนัดครั้งถัดไป */}
      <section className="relative bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <Calendar className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>กำหนดนัดครั้งถัดไป</h3>
            <p className="text-[11px] text-gray-500">Next Appointment</p>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
            <div>
              <label className={labelCls} style={labelStyle}>วันนัดครั้งถัดไป</label>
              <DatePickerModern value={nextAppointmentDate} onChange={setNextAppointmentDate} placeholder="เลือกวันนัด" />
            </div>
            <div className="sm:col-span-1 lg:col-span-3">
              <label className={labelCls} style={labelStyle}>คำแนะนำให้นัดติดตาม</label>
              <div className="flex flex-wrap gap-1.5">
                {DEWORM_NEXT_PRESETS.map(p => {
                  const target = addDaysIso(date || todayIsoLocal(), p.days);
                  const on = nextAppointmentDate === target;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setNextAppointmentDate(target)}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] transition-all"
                      style={{
                        fontWeight: on ? 700 : 600,
                        color: on ? "#ffffff" : "#475569",
                        background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "rgba(0,0,0,0.04)",
                        border: on ? "1px solid #0d7c66" : "1px solid transparent",
                        boxShadow: on ? "0 3px 10px rgba(25,165,137,0.22)" : "none",
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)",
            border: "1px solid #0d7c66",
            boxShadow: "0 4px 14px rgba(25,165,137,0.30), inset 0 1px 0 rgba(255,255,255,0.30)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        >
          <Check className="w-3.5 h-3.5" /> บันทึกถ่ายพยาธิ
        </button>
      </div>
      </div>

      {/* ═══════════ RIGHT — History sidebar ═══════════ */}
      <aside className="space-y-3 lg:sticky lg:top-4">
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(5,150,105,0.10)" }}>
              <Bug className="w-4.5 h-4.5 text-emerald-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ประวัติถ่ายพยาธิ</h3>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                  style={{ background: "rgba(5,150,105,0.10)", color: "#047857", fontWeight: 700, border: "1px solid rgba(5,150,105,0.25)" }}>
                  {history.length} ครั้ง
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Deworming History · บันทึกล่าสุดอยู่บน</p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
              <Bug className="w-10 h-10" strokeWidth={1.5} />
              <p className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มีประวัติ</p>
              <p className="text-[10.5px]">บันทึกแรกจะปรากฏที่นี่</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[640px] overflow-y-auto">
              {history.map((d, idx) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setExpanded(d as typeof expanded)}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50/30 transition-colors active:scale-[0.99]"
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
                      <Bug className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{d.productName}</p>
                        {idx === 0 && (
                          <span className="text-[9.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>
                            ล่าสุด
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-gray-500 truncate">
                        {thaiShortDateOpd(d.date)}{d.time ? ` · ${d.time} น.` : ""}{d.brand ? ` · ${d.brand}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-1.5" />
                  </div>
                  <div className="flex flex-wrap gap-1 ml-10">
                    <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                      {d.type.startsWith("พยาธิ") ? d.type : `พยาธิ${d.type}`}
                    </span>
                    <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                      {d.route}
                    </span>
                    {d.nextAppointmentDate && (
                      <span className="text-[10px] text-[#0d7c66] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>
                        นัด {thaiShortDateOpd(d.nextAppointmentDate)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </aside>

      {/* ── Full-detail popup (matches vaccine history popup style) ── */}
      {expanded && createPortal(
        <AnimatePresence>
          <motion.div
            key="deworm-popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
            onClick={() => setExpanded(null)}
          />
          <div key="deworm-popup-content" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto max-h-[88vh]"
            >
              {/* Header */}
              <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(73,138,79,0.1)] rounded-t-3xl"
                style={{ backgroundImage: "linear-gradient(135deg, #f0f7f1 0%, #FEFBF8 50%, #f5faf5 100%)" }}>
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(73,138,79,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #34d399, #059669)", boxShadow: "0 4px 12px rgba(5,150,105,0.30)" }}>
                      <Bug className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-gray-900 truncate" style={{ fontWeight: 700 }}>{expanded.productName}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">รายละเอียดการถ่ายพยาธิ</p>
                    </div>
                  </div>
                  <button onClick={() => setExpanded(null)}
                    className="w-8 h-8 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors flex-shrink-0"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 overflow-y-auto">
                {/* Status + Date badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100" style={{ fontWeight: 500 }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {expanded.type.startsWith("พยาธิ") ? expanded.type : `พยาธิ${expanded.type}`}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100" style={{ fontWeight: 500 }}>
                    <Calendar className="w-3 h-3" />
                    {thaiShortDateOpd(expanded.date)}{expanded.time ? ` · ${expanded.time} น.` : ""}
                  </span>
                </div>

                {/* Detail rows */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {[
                    expanded.brand ? { label: "ยี่ห้อ", value: expanded.brand, icon: <FileText className="w-3.5 h-3.5 text-blue-500" /> } : null,
                    expanded.route ? { label: "วิธีให้ยา", value: expanded.route, icon: <Syringe className="w-3.5 h-3.5 text-teal-500" /> } : null,
                    expanded.lotNumber ? { label: "Lot Number", value: expanded.lotNumber, icon: <FileText className="w-3.5 h-3.5 text-purple-500" /> } : null,
                    expanded.expiryDate ? { label: "วันหมดอายุ", value: thaiShortDateOpd(expanded.expiryDate), icon: <Calendar className="w-3.5 h-3.5 text-rose-500" /> } : null,
                    expanded.drugRegNo ? { label: "เลขทะเบียนยา", value: expanded.drugRegNo, icon: <FileText className="w-3.5 h-3.5 text-gray-500" /> } : null,
                    expanded.recordedBy ? { label: "สัตวแพทย์ผู้ทำ", value: expanded.recordedBy, icon: <User className="w-3.5 h-3.5 text-blue-500" /> } : null,
                    expanded.nextAppointmentDate ? { label: "นัดถัดไป", value: thaiShortDateOpd(expanded.nextAppointmentDate), icon: <Calendar className="w-3.5 h-3.5 text-blue-500" />, highlight: true } : null,
                  ].filter(Boolean).map((row, ri) => (
                    <div key={ri} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {(row as { icon: React.ReactNode }).icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-400">{(row as { label: string }).label}</p>
                        <p className={`text-sm truncate ${(row as { highlight?: boolean }).highlight ? "text-blue-600" : "text-gray-700"}`} style={{ fontWeight: 500 }}>
                          {(row as { value: string }).value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pre-assessment */}
                {expanded.preAssessment && expanded.preAssessment.length > 0 && (
                  <div className="rounded-xl border border-gray-100 p-3">
                    <p className="text-[11px] text-gray-500 mb-1.5" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                      ก่อนถ่ายพยาธิ
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {expanded.preAssessment.map(p => (
                        <span key={p} className="text-[10.5px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{p}</span>
                      ))}
                    </div>
                    {expanded.preNote && <p className="text-[11px] text-gray-600 mt-2">{expanded.preNote}</p>}
                  </div>
                )}

                {/* Post-effects */}
                {expanded.postEffects && expanded.postEffects.length > 0 && (
                  <div className="rounded-xl border border-gray-100 p-3">
                    <p className="text-[11px] text-gray-500 mb-1.5" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                      หลังถ่ายพยาธิ
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {expanded.postEffects.map(p => (
                        <span key={p} className="text-[10.5px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{p}</span>
                      ))}
                    </div>
                    {expanded.postNote && <p className="text-[11px] text-gray-600 mt-2">{expanded.postNote}</p>}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setExpanded(null)}
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Mini calendar widget (used by OPD next-appointment modal)          */
/* ═══════════════════════════════════════════════════════════════════ */
function isoToDateLocal(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
}
function dateToIsoLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function VisitsMiniCalendar({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const selected = isoToDateLocal(value);
  const [vm, setVm] = useState((selected ?? today).getMonth());
  const [vy, setVy] = useState((selected ?? today).getFullYear());
  const MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  const DAY_LABELS = ["จ.","อ.","พ.","พฤ.","ศ.","ส.","อา."];
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const firstDow = (new Date(vy, vm, 1).getDay() + 6) % 7;
  const prev = () => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); };
  const next = () => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); };
  const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  return (
    <div className="rounded-2xl border border-gray-100 p-3" style={{ background: "#fafafa" }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prev} type="button" className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>{MONTHS_FULL[vm]} <span className="text-gray-500">{vy + 543}</span></p>
        <button onClick={next} type="button" className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_LABELS.map(l => <div key={l} className="text-[10px] text-gray-400 text-center" style={{ fontWeight: 600 }}>{l}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`x${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const d = new Date(vy, vm, day);
          const on = selected ? same(d, selected) : false;
          const isToday = same(d, today);
          const isPast = d < today;
          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onChange(dateToIsoLocal(d))}
              className="aspect-square rounded-lg text-[11.5px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontWeight: on ? 800 : isToday ? 700 : 500,
                color: on ? "#ffffff" : isPast ? "#d1d5db" : "#475569",
                background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : isToday ? "rgba(25,165,137,0.10)" : "transparent",
                border: isToday && !on ? "1px solid rgba(25,165,137,0.40)" : "1px solid transparent",
                boxShadow: on ? "0 2px 8px rgba(25,165,137,0.30)" : "none",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const VISIT_TIMES: string[] = (() => {
  const out: string[] = [];
  for (let h = 8; h <= 18; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 18) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

/* OPD vet picker — searchable popover with avatar + พร้อม/ไม่ว่าง status
   Matches the appointment page's VetCombobox UX */
function OpdVetPicker({ value, dateIso, onChange }: { value: string; dateIso: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const selected = VETS.find(v => v.name === value);
  const filtered = VETS.filter(v => v.name.includes(q) || v.specialty.includes(q));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white text-left transition-all hover:border-gray-300"
        style={{ border: open ? "1px solid #19a589" : "1px solid #e5e7eb", minHeight: 48, boxShadow: open ? "0 0 0 3px rgba(25,165,137,0.12)" : "none" }}
      >
        {selected ? (
          <>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] text-white" style={{ fontWeight: 700, background: selected.color }}>
              {selected.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>{selected.name}</p>
              <p className="text-[10.5px] text-gray-500 truncate">{selected.specialty}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-4 h-4 text-gray-400" />
            </div>
            <span className="flex-1 text-[13px] text-gray-400">เลือกสัตวแพทย์...</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="ค้นหาชื่อหมอ หรือความเชี่ยวชาญ..."
                  className="vet-search"
                />
              </div>
            </div>
            <div className="max-h-[260px] overflow-y-auto p-1.5 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Stethoscope className="w-7 h-7 mx-auto mb-1.5 text-gray-200" />
                  <p className="text-[12px]">ไม่พบสัตวแพทย์</p>
                </div>
              ) : filtered.map(vet => {
                const isSel = value === vet.name;
                const available = vetHasSlotsOnDate(vet.id, dateIso);
                return (
                  <button
                    key={vet.id}
                    type="button"
                    onClick={() => { if (available) { onChange(vet.name); setOpen(false); setQ(""); } }}
                    disabled={!available}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: isSel ? "rgba(13,124,102,0.06)" : "transparent" }}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] text-white" style={{ fontWeight: 700, background: vet.color }}>
                      {vet.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: isSel ? 700 : 600, letterSpacing: "-0.1px" }}>{vet.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10.5px] text-gray-500">{vet.specialty}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                        {available
                          ? <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700" style={{ fontWeight: 600 }}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />พร้อม</span>
                          : <span className="text-[10px] text-gray-400">ไม่ว่าง</span>}
                      </div>
                    </div>
                    {isSel && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#0d7c66" }}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Vet schedule helpers (sync with SlotBuilder)                       */
/* ═══════════════════════════════════════════════════════════════════ */
function dayIndexMonFirst(d: Date): number {
  return (d.getDay() + 6) % 7;
}
function vetHasSlotsOnDate(slotKey: string, isoDate: string | undefined): boolean {
  if (!isoDate) return true;
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return true;
  return INIT_SLOTS.some(s => s.vetId === slotKey && s.day === dayIndexMonFirst(d));
}
function vetAvailableTimesOnDate(slotKey: string | undefined, isoDate: string | undefined): Set<string> | null {
  if (!slotKey || !isoDate) return null;
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const di = dayIndexMonFirst(d);
  const out = new Set<string>();
  INIT_SLOTS.forEach(s => {
    if (s.vetId !== slotKey || s.day !== di) return;
    if (s.booked >= s.capacity) return;
    const h = String(Math.floor(s.start / 60)).padStart(2, "0");
    const m = String(s.start % 60).padStart(2, "0");
    out.add(`${h}:${m}`);
  });
  return out;
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Visit Card                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
function VisitCard({ rec, onClick }: { rec: VisitRecord; onClick: () => void }) {
  const tc = typeCfg(rec.type);
  // status — map to color tokens
  const statusMap: Record<string, { label: string; color: string; grad: string; soft: string }> = {
    "รอตรวจ":     { label: "รอตรวจ",    color: "#f59e0b", grad: "linear-gradient(135deg, #fbbf24, #d97706)", soft: "rgba(245,158,11,0.10)" },
    "กำลังตรวจ": { label: "กำลังตรวจ", color: "#0ea5e9", grad: "linear-gradient(135deg, #38bdf8, #0284c7)", soft: "rgba(14,165,233,0.10)" },
    "เสร็จสิ้น":  { label: "เสร็จสิ้น",  color: "#10b981", grad: "linear-gradient(135deg, #34d399, #059669)", soft: "rgba(16,185,129,0.10)" },
    "ยกเลิก":     { label: "ยกเลิก",    color: "#ef4444", grad: "linear-gradient(135deg, #f87171, #dc2626)", soft: "rgba(239,68,68,0.10)" },
  };
  const st = statusMap[rec.status] ?? statusMap["รอตรวจ"];
  const isFemale = rec.sex?.includes("เมีย");
  const isMale = rec.sex?.includes("ผู้");

  return (
    <motion.button
      variants={iv}
      onClick={onClick}
      className="group relative rounded-3xl overflow-hidden bg-white text-left transition-all duration-300 hover:-translate-y-1"
      style={{
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
      }}
    >
      {/* ── COVER BANNER (blurred pet photo) ── */}
      <div className="relative h-20 overflow-hidden">
        <img
          src={rec.photo}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(18px) saturate(140%)", transform: "scale(1.3)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.50) 100%)" }} />
        {/* Arrival time — top-left */}
        <span
          className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] text-gray-700 bg-white/85 backdrop-blur-sm"
          style={{ fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
        >
          <Clock className="w-2.5 h-2.5 text-gray-500" /> {rec.arrivalTime}
        </span>
        {/* Allergy badge — top-right */}
        {rec.allergies && (
          <span
            className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white"
            style={{
              background: "linear-gradient(135deg, #fb923c, #ea580c)",
              boxShadow: "0 2px 6px rgba(234,88,12,0.35)",
              fontWeight: 600,
            }}
            title={`แพ้: ${rec.allergies}`}
          >
            <AlertTriangle className="w-2.5 h-2.5" /> แพ้
          </span>
        )}
      </div>

      {/* ── AVATAR (overlapping cover, white ring + sex badge) ── */}
      <div className="flex justify-center -mt-10 relative">
        <div
          className="rounded-full p-[3px]"
          style={{
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-white p-[3px]">
            <img
              src={rec.photo}
              alt={rec.pet}
              className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>
        {(isMale || isFemale) && (
          <span
            className="absolute bottom-0 right-[calc(50%-42px)] w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{
              background: isFemale ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)",
              border: "2.5px solid #ffffff",
              boxShadow: isFemale ? "0 3px 10px rgba(236,72,153,0.45)" : "0 3px 10px rgba(14,165,233,0.45)",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "calc(12px * var(--fs))", lineHeight: 1 }}>{isFemale ? "♀" : "♂"}</span>
          </span>
        )}
      </div>

      {/* ── Name + species/breed + status (centered) ── */}
      <div className="text-center px-4 mt-2.5">
        <h3
          className="text-gray-900 truncate"
          style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))", letterSpacing: "-0.3px", lineHeight: 1.3, paddingBottom: 2 }}
        >
          {rec.pet}
        </h3>
        <p className="text-gray-500 truncate" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 600, letterSpacing: "0.2px" }}>
          {rec.hn}
        </p>
        {/* Status badge — below breed */}
        <div className="mt-1.5 flex justify-center">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] text-white"
            style={{
              background: st.grad,
              boxShadow: `0 2px 6px ${st.color}55`,
              fontWeight: 600,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/85" /> {st.label}
          </span>
        </div>
      </div>

      {/* ── Stats pill (gray bg, 3 cols) — ชนิดสัตว์ · ประเภท · ห้อง ── */}
      <div
        className="mx-3 mt-3 grid grid-cols-3 rounded-2xl py-2"
        style={{ background: "#f3f4f6" }}
      >
        {[
          { value: rec.species, label: "ชนิดสัตว์" },
          { value: rec.type, label: "ประเภท" },
          { value: rec.room.split("—")[0].trim(), label: "ห้อง" },
        ].map((s, idx) => (
          <div key={idx} className="text-center relative px-1">
            {idx > 0 && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-300/60" />
            )}
            <div className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(12.5px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.2 }}>
              {s.value}
            </div>
            <div className="text-gray-500 mt-0.5" style={{ fontSize: "calc(10px * var(--fs))", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Owner + Doctor footer (2 cols) ── */}
      <div className="px-3 py-3 grid grid-cols-2 gap-2">
        <div className="text-center min-w-0">
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>เจ้าของ</p>
          <p className="text-[12px] text-gray-700 truncate mt-0.5" style={{ fontWeight: 600 }}>{rec.owner}</p>
        </div>
        <div className="text-center min-w-0 relative">
          <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200/80" />
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>แพทย์</p>
          <p className="text-[12px] text-[#0d7c66] truncate mt-0.5" style={{ fontWeight: 600 }}>{rec.doctor}</p>
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
  const navigate = useNavigate();

  const infoRows = [
    { label: "เพศ", value: rec.sex },
    { label: "น้ำหนัก", value: rec.weight },
    { label: "อายุ", value: rec.age },
    { label: "เจ้าของ", value: rec.owner, link: () => navigate("/owners", { state: { search: rec.owner } }) },
    { label: "โทร", value: formatPhone(rec.phone) },
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
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-4 pt-4 pb-2 text-xs">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[#101828]/50">{row.label}</span>
                  {"link" in row && row.link ? (
                    <button onClick={row.link} className="text-[#0d7c66] hover:text-[#19a589] hover:underline transition-colors" style={{ fontWeight: 600 }}>{row.value}</button>
                  ) : (
                    <span className="text-[#101828]" style={{ fontWeight: 600 }}>{row.value}</span>
                  )}
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
          {expanded ? "ย่อข้อมูล" : "แสดงข้อมูลเพิ่มเติม"}
          <motion.span
            animate={{ rotate: expanded ? 0 : 180 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
/* ═══════════════════════════════════════════════════════════════════ */
function DetailSidebar({
  rec, onBack, activeTab, setActiveTab, visitType,
}: {
  rec: VisitRecord;
  onBack: () => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  visitType: string;
}) {
  const recommendedSet = new Set(RECOMMENDED_TABS_BY_TYPE[visitType] ?? DEFAULT_RECOMMENDED);
  const sc = statusCfg(rec.status);
  const tc = typeCfg(rec.type);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useLang();

  const infoRows = [
    { label: "เพศ", value: rec.sex },
    { label: "น้ำหนัก", value: rec.weight },
    { label: "อายุ", value: rec.age },
    { label: "เจ้าของ", value: rec.owner, link: () => navigate("/owners", { state: { search: rec.owner } }) },
    { label: "โทร", value: formatPhone(rec.phone) },
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
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden w-full px-5"
              >
                <div className="space-y-0 text-xs pt-1">
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-[8px]">
                      <span className="text-[#101828]/50">{row.label}</span>
                      {"link" in row && row.link ? (
                        <button onClick={row.link} className="text-[#0d7c66] hover:text-[#19a589] hover:underline truncate ml-2 transition-colors" style={{ fontWeight: 600 }}>{row.value}</button>
                      ) : (
                        <span className="text-[#101828] truncate ml-2" style={{ fontWeight: 600 }}>{row.value}</span>
                      )}
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
            <motion.span animate={{ rotate: expanded ? 0 : 180 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="inline-flex">
              <ChevronUp className="w-3 h-3" />
            </motion.span>
          </button>
        </div>
      </div>

      {/* ═══ Visit-type hint ═══ */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#19a589]" />
        <p className="text-[10px] text-gray-500" style={{ fontWeight: 500 }}>
          แนะนำตามประเภท: <span className="text-[#0d7c66]" style={{ fontWeight: 700 }}>{visitType}</span>
        </p>
      </div>

      {/* ═══ Vertical Tab Nav ═══ */}
      <nav className="flex-1 px-2 pt-1 pb-3 overflow-y-auto">
        {visitTabs.map((tab, idx) => {
          const isActive = activeTab === tab.key;
          const isRecommended = recommendedSet.has(tab.key) || tab.key === TAB_EMR;
          const isOptional = !isRecommended;
          return (
            <div key={tab.key}>
              {idx > 0 && <div className="mx-3 border-t border-gray-100" />}
              <button
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-3 text-[13px] rounded-[14px] whitespace-nowrap transition-all relative ${
                  isActive
                    ? "text-[#0d7c66]"
                    : isOptional
                      ? "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
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
                    : isOptional ? "bg-gray-50/60" : "bg-gray-50"
                }`}>
                  <img src={tab.img} alt={t(tab.labelKey)} className={`w-5 h-5 object-contain ${isOptional && !isActive ? "opacity-40" : ""}`} />
                </div>
                <span className="flex-1 text-left">{t(tab.labelKey)}</span>
                {isRecommended && tab.key !== TAB_EMR && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#19a589]" title="แนะนำสำหรับประเภทนี้" />
                )}
                {isOptional && !isActive && (
                  <span className="text-[9px] text-gray-300 px-1.5 py-0.5 rounded bg-gray-100" style={{ fontWeight: 500 }}>เสริม</span>
                )}
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Edit Drug Modal (inline — แก้ไขรายการยาเดิม)                        */
/* ═══════════════════════════════════════════════════════════════════ */
function EditDrugModal({ item, onClose, onSave }: { item: DrugItem | null; onClose: () => void; onSave: (d: DrugItem) => void }) {
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [perDay, setPerDay] = useState(1);
  const [days, setDays] = useState(1);
  const [dispensed, setDispensed] = useState(1);   // จำนวนจ่าย (แก้ได้ · ปกติ = จำนวนเบิก)
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [indication, setIndication] = useState("");
  const qty = drugQty(perDay, days);   // จำนวนเบิก

  useEffect(() => {
    if (item) {
      setName(item.name);
      setGenericName(item.genericName);
      setPerDay(item.perDay);
      setDays(item.days);
      setDispensed(item.dispensed);
      setUnit(item.unit);
      setPrice(item.price);
      setInstruction(item.instruction);
      setIndication(item.indication);
    }
  }, [item]);

  if (!item) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-[460px] vet-modal relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="vet-modal-header rounded-t-3xl">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="vet-modal-header-icon"><Pill className="w-[20px] h-[20px] text-white" /></div>
                <div>
                  <h2 className="vet-section-title">แก้ไขรายการยา</h2>
                  <p className="vet-tiny mt-[2px]">ปรับจำนวน ราคา หรือคำแนะนำการใช้ยา</p>
                </div>
              </div>
              <button onClick={onClose} className="vet-modal-close"><X className="w-[16px] h-[16px] text-gray-500" /></button>
            </div>
          </div>

          <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="vet-label">ชื่อยา (ชื่อการค้า)</label>
              <input value={name} onChange={e => setName(e.target.value)} className="vet-input" placeholder="ชื่อการค้า" />
            </div>
            <div>
              <label className="vet-label">ชื่อสามัญ</label>
              <input value={genericName} onChange={e => setGenericName(e.target.value)} className="vet-input" placeholder="Generic name" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="vet-label">จำนวน/วัน</label>
                <input type="number" min={0} step="0.5" value={perDay} onChange={e => { const v = Math.max(0, parseFloat(e.target.value) || 0); setPerDay(v); setDispensed(drugQty(v, days)); }} className="vet-input" />
              </div>
              <div>
                <label className="vet-label">Day (จำนวนวัน)</label>
                <input type="number" min={1} value={days} onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); setDays(v); setDispensed(drugQty(perDay, v)); }} className="vet-input" />
              </div>
              <div>
                <label className="vet-label">หน่วย</label>
                <input value={unit} onChange={e => setUnit(e.target.value)} className="vet-input" placeholder="เม็ด" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="vet-label">จำนวนเบิก</label>
                <div className="vet-input flex items-center bg-gray-50" style={{ cursor: "default" }}>
                  <span className="text-gray-700" style={{ fontWeight: 700 }}>{qty}</span>
                  <span className="text-gray-400 text-xs ml-1">{unit || "หน่วย"}</span>
                </div>
              </div>
              <div>
                <label className="vet-label">จำนวนจ่าย</label>
                <input type="number" min={0} step="0.5" value={dispensed} onChange={e => setDispensed(Math.max(0, parseFloat(e.target.value) || 0))} className="vet-input" style={{ fontWeight: 700 }} />
              </div>
              <div>
                <label className="vet-label">ราคา/หน่วย (฿)</label>
                <input type="number" min={0} value={price} onChange={e => setPrice(Math.max(0, parseInt(e.target.value) || 0))} className="vet-input" />
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#f0fdf9] border border-[#19a589]/25">
              <span className="text-[12px] text-gray-600" style={{ fontWeight: 600 }}>รวม (จ่าย {dispensed} {unit || "หน่วย"} × ฿{price})</span>
              <span className="text-[#0d7c66]" style={{ fontWeight: 800 }}>฿{(dispensed * price).toLocaleString()}</span>
            </div>
            <div>
              <label className="vet-label">วิธีใช้ยา</label>
              <textarea value={instruction} onChange={e => setInstruction(e.target.value)} rows={2} className="vet-textarea" placeholder="กินวันละ 2 ครั้ง..." />
            </div>
            <div>
              <label className="vet-label">ข้อบ่งใช้</label>
              <input value={indication} onChange={e => setIndication(e.target.value)} className="vet-input" placeholder="เช่น ติดเชื้อ..." />
            </div>
          </div>

          <div className="vet-modal-footer">
            <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>ยกเลิก</button>
            <button
              onClick={() => { if (!name.trim()) return; onSave({ ...item, name, genericName, perDay, days, qty, dispensed, unit, price, instruction, indication }); }}
              disabled={!name.trim()}
              className="vet-btn vet-btn-primary btn-green" style={{ width: 110 }}
            >
              <Check className="w-[16px] h-[16px]" /> บันทึก
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Edit Service Modal (inline — แก้ไขรายการค่าบริการเดิม)             */
/* ═══════════════════════════════════════════════════════════════════ */
type ServiceItem = typeof services[number];
function EditServiceModal({ item, onClose, onSave }: { item: ServiceItem | null; onClose: () => void; onSave: (s: ServiceItem) => void }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQty(item.qty);
      setUnit(item.unit);
      setPrice(item.price);
      setDiscount(item.discount);
    }
  }, [item]);

  if (!item) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-[460px] vet-modal relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="vet-modal-header rounded-t-3xl">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="vet-modal-header-icon"><Receipt className="w-[20px] h-[20px] text-white" /></div>
                <div>
                  <h2 className="vet-section-title">แก้ไขรายการค่าบริการ</h2>
                  <p className="vet-tiny mt-[2px]">ปรับชื่อ จำนวน ราคา หรือส่วนลด</p>
                </div>
              </div>
              <button onClick={onClose} className="vet-modal-close"><X className="w-[16px] h-[16px] text-gray-500" /></button>
            </div>
          </div>

          <div className="p-5 space-y-3.5">
            <div>
              <label className="vet-label">ชื่อรายการ</label>
              <input value={name} onChange={e => setName(e.target.value)} className="vet-input" placeholder="ชื่อบริการ" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="vet-label">จำนวน</label>
                <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="vet-input" />
              </div>
              <div>
                <label className="vet-label">หน่วย</label>
                <input value={unit} onChange={e => setUnit(e.target.value)} className="vet-input" placeholder="ครั้ง" />
              </div>
              <div>
                <label className="vet-label">ราคา/หน่วย (฿)</label>
                <input type="number" min={0} value={price} onChange={e => setPrice(Math.max(0, parseInt(e.target.value) || 0))} className="vet-input" />
              </div>
              <div>
                <label className="vet-label">ส่วนลด (฿)</label>
                <input type="number" min={0} value={discount} onChange={e => setDiscount(Math.max(0, parseInt(e.target.value) || 0))} className="vet-input" />
              </div>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl"
              style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 2px 8px rgba(25,165,137,0.2)" }}>
              <span className="text-[11px] text-white/80" style={{ fontWeight: 500 }}>ยอดรวม</span>
              <span className="text-white tracking-wide" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))" }}>฿{Math.max(0, price * qty - discount).toLocaleString()}</span>
            </div>
          </div>

          <div className="vet-modal-footer">
            <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>ยกเลิก</button>
            <button
              onClick={() => { if (!name.trim()) return; onSave({ ...item, name, qty, unit, price, discount }); }}
              disabled={!name.trim()}
              className="vet-btn vet-btn-primary btn-green" style={{ width: 110 }}
            >
              <Check className="w-[16px] h-[16px]" /> บันทึก
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Detail View (tabs)                                                 */
/* ═══════════════════════════════════════════════════════════════════ */
function DetailView({ rec, onBack }: { rec: VisitRecord; onBack: () => void }) {
  const { t } = useLang();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_REGISTER);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const formScopeRef = useRef<HTMLDivElement>(null);
  const { status: autosaveStatus, lastSavedAt, markDirty } = useAutosaveDraft(formScopeRef);
  const [examStatus, setExamStatus] = useState<Record<string, "ปกติ" | "ผิดปกติ" | "ไม่ได้ตรวจ">>({
    "ตา": "ปกติ", "หู": "ปกติ", "จมูก": "ปกติ", "ปาก/ฟัน": "ปกติ",
    "หัวใจและหลอดเลือด": "ปกติ", "ระบบทางเดินหายใจ": "ปกติ",
    "ระบบทางเดินอาหาร": "ปกติ", "ระบบทางเดินปัสสาวะ": "ปกติ",
    "กระดูกและกล้ามเนื้อ": "ปกติ", "ระบบประสาท": "ปกติ",
    "ผิวหนังและขน": "ปกติ", "ต่อมน้ำเหลือง": "ปกติ",
  });
  const [examNote, setExamNote] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [illnessHistory, setIllnessHistory] = useState("");
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

  // วันเวลารับบริการ — combined date + time picker
  const [visitDate, setVisitDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [visitTime, setVisitTime] = useState(rec.arrivalTime || "09:00");
  const [visitDateTimeOpen, setVisitDateTimeOpen] = useState(false);
  const visitDateTimeRef = useRef<HTMLDivElement>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [apptSaving, setApptSaving] = useState(false);
  const [apptForm, setApptForm] = useState({ date: "", time: "09:00", noTime: false, type: "ตรวจติดตามอาการ", room: "", doctor: "", note: "" });
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
        time: apptForm.noTime ? "" : apptForm.time,
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
      setApptForm({ date: "", time: "09:00", noTime: false, type: "ตรวจติดตามอาการ", room: "", doctor: "", note: "" });
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
  /* Remed ยาเดิม — เลือกรายการจาก visit ก่อนหน้า */
  const [showRemedModal, setShowRemedModal] = useState(false);
  const [remedSelected, setRemedSelected] = useState<number[]>([]);
  const openRemedModal = () => {
    // ตั้งต้นเลือกทุกตัวที่ยังไม่อยู่ในใบยาปัจจุบัน
    setRemedSelected(REMED_PREVIOUS.drugs
      .map((d, i) => ({ d, i }))
      .filter(({ d }) => !drugItems.some(x => x.name === d.name))
      .map(({ i }) => i));
    setShowRemedModal(true);
  };
  const applyRemed = () => {
    const sel = remedSelected.map(i => REMED_PREVIOUS.drugs[i]).filter(Boolean);
    if (sel.length === 0) return;
    setDrugItems(prev => {
      let nextId = prev.length ? Math.max(...prev.map(d => d.id)) + 1 : 1;
      const added = sel.map(d => ({
        id: nextId++, name: d.name, genericName: d.genericName, unit: d.unit, price: d.price,
        instruction: d.instruction, indication: d.indication, perDay: d.perDay, days: d.days,
        qty: drugQty(d.perDay, d.days), dispensed: drugQty(d.perDay, d.days), stockCut: true,
      }));
      return [...prev, ...added];
    });
    showSnackbar("success", `Remed ยาเดิม ${sel.length} รายการเรียบร้อย`);
    setShowRemedModal(false);
  };
  const [editingDrug, setEditingDrug] = useState<typeof drugs[number] | null>(null);
  const [editingService, setEditingService] = useState<typeof services[number] | null>(null);

  // ── Payment tab state ──
  const [payDiscountAmt, setPayDiscountAmt] = useState(0);
  const [payDiscountReason, setPayDiscountReason] = useState("");
  const [payIncludeVat, setPayIncludeVat] = useState(true);
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "transfer" | "qr">("cash");
  const [payCashReceived, setPayCashReceived] = useState("");
  const [payCompleted, setPayCompleted] = useState(false);
  const [payDaysOpen, setPayDaysOpen] = useState(true);   // กาง "ยาแยกรายวัน" ตอนชำระเงิน
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [stickerSelected, setStickerSelected] = useState<number[]>([]);
  const [xrayOrders, setXrayOrders] = useState<(XRayOrderData & { status: string; films: string[]; dicoms?: { name: string; url: string }[] })[]>([
    { exam: "Chest AP + Lateral", room: "ห้อง X-Ray 1", urgency: "routine", status: "รอ", clinicalInfo: "ไอเรื้อรัง 2 สัปดาห์", clinicalDiagnosis: "สงสัยปอดบวม", note: "", films: [] },
  ]);
  const [labOrders, setLabOrders] = useState<(LabOrderData & { status: string; results: { name: string; value: string; unit: string; ref: string; flag: string }[]; photos?: string[] })[]>([
    { test: "ความสมบูรณ์ของเลือด (CBC)", note: "ตรวจภาวะโลหิตจาง การติดเชื้อ", status: "เสร็จสิ้น", specimen: "Blood - EDTA (ม่วง)", collectionDate: "", urgency: "routine", results: [
      { name: "WBC", value: "18.5", unit: "x10³/µL", ref: "5.5-16.9", flag: "H" },
      { name: "RBC", value: "7.2", unit: "x10⁶/µL", ref: "5.5-8.5", flag: "" },
      { name: "Hb", value: "14.1", unit: "g/dL", ref: "12.0-18.0", flag: "" },
      { name: "Hct", value: "42", unit: "%", ref: "37-55", flag: "" },
      { name: "PLT", value: "280", unit: "x10³/µL", ref: "175-500", flag: "" },
    ] },
    { test: "ชีวเคมีในเลือด", note: "ตรวจการทำงานของตับ ไต", status: "รอผล", specimen: "Blood - Serum (แดง)", collectionDate: "", urgency: "urgent", results: [] },
  ]);
  const [expandedLabResult, setExpandedLabResult] = useState<number | null>(null);
  const [labPhotoView, setLabPhotoView] = useState<string | null>(null);   // lightbox ภาพแนบ Lab/X-Ray
  const [editingLabIdx, setEditingLabIdx] = useState<number | null>(null);
  const [editingXrayIdx, setEditingXrayIdx] = useState<number | null>(null);
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
      if (visitDateTimeRef.current && !visitDateTimeRef.current.contains(e.target as Node)) {
        setVisitDateTimeOpen(false);
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
  const drugTotal = drugItems.reduce((s, d) => s + d.price * d.dispensed, 0);   // คิดเงินตามจำนวนจ่าย
  const grandTotal = subtotal + drugTotal;

  const inputCls = "vet-input";
  const textareaCls = "vet-textarea";
  const labelCls = "vet-label";
  const btnPrimary = "vet-btn vet-btn-primary btn-green";
  const btnSecondary = "flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-full hover:bg-gray-50 transition-all";

  const recommendedSet = new Set(RECOMMENDED_TABS_BY_TYPE[visitType] ?? DEFAULT_RECOMMENDED);
  const isFemale = rec.sex?.includes("เมีย");
  const isMale = rec.sex?.includes("ผู้");

  return (
    <>
    <div ref={formScopeRef} className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 gap-4" style={{ background: "#FEFBF8" }}>

      {/* ─── HEADER strip — back + breadcrumb + autosave + actions ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> กลับ
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0 text-[12px]">
            <span className="text-gray-400">ระบบตรวจรักษา</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 truncate" style={{ fontWeight: 600 }}>{rec.pet}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 truncate" style={{ fontWeight: 500 }}>{rec.hn}</span>
          </div>
        </div>

        {/* Right: autosave + status pill + save */}
        {(() => {
          const statusOpts = [
            { key: "รอตรวจ" as const,        icon: Clock,        color: "#f59e0b", dark: "#b45309", grad: "linear-gradient(135deg,#fbbf24,#d97706)", glow: "rgba(245,158,11,0.40)", bg: "rgba(245,158,11,0.10)" },
            { key: "กำลังตรวจ" as const,     icon: Loader2,      color: "#3b82f6", dark: "#1d4ed8", grad: "linear-gradient(135deg,#60a5fa,#2563eb)", glow: "rgba(59,130,246,0.40)", bg: "rgba(59,130,246,0.10)" },
            { key: "ตรวจเสร็จแล้ว" as const, icon: CheckCircle2, color: "#22c55e", dark: "#15803d", grad: "linear-gradient(135deg,#4ade80,#16a34a)", glow: "rgba(34,197,94,0.40)", bg: "rgba(34,197,94,0.10)" },
          ];
          const cur = statusOpts.find(o => o.key === checkStatus) || statusOpts[0];
          const CurIcon = cur.icon;
          return (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Autosave — small pill */}
              <AutosaveStatusBadge status={autosaveStatus} lastSavedAt={lastSavedAt} className="hidden md:inline-flex" />

              {/* Divider */}
              <span className="hidden md:block w-px h-5 bg-gray-200" />

              {/* Status pill — chip with icon-in-circle */}
              <div className="relative" ref={checkStatusRef}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCheckStatusOpen(!checkStatusOpen)}
                  className="flex items-center gap-1.5 h-[34px] pl-2.5 pr-3 rounded-full text-[12px] text-white cursor-pointer transition-all hover:brightness-110 hover:-translate-y-0.5"
                  style={{
                    fontWeight: 700,
                    background: cur.grad,
                    border: `1px solid ${cur.color}`,
                    boxShadow: `0 4px 14px ${cur.glow}, inset 0 1px 0 rgba(255,255,255,0.40)`,
                    textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    <CurIcon className={`w-3.5 h-3.5 text-white ${cur.key === "กำลังตรวจ" ? "animate-spin" : ""}`} strokeWidth={2.6} />
                  </span>
                  <span style={{ letterSpacing: "0.01em" }}>{cur.key}</span>
                  <ChevronDown className={`w-3 h-3 text-white/85 transition-transform ${checkStatusOpen ? "rotate-180" : ""}`} />
                </motion.button>
                {checkStatusOpen && checkStatusRef.current && createPortal(
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    data-check-status-portal
                    className="fixed w-[200px] bg-white rounded-2xl py-1.5"
                    style={{
                      top: checkStatusRef.current.getBoundingClientRect().bottom + 6,
                      left: checkStatusRef.current.getBoundingClientRect().right - 200,
                      zIndex: 99999,
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
                      transformOrigin: "top right",
                    }}
                  >
                    {statusOpts.map((opt) => {
                      const Icon = opt.icon;
                      const isAct = checkStatus === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => { setCheckStatus(opt.key); setCheckStatusOpen(false); markDirty(); }}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs cursor-pointer transition-colors ${isAct ? "" : "hover:bg-gray-50"}`}
                          style={isAct ? { background: opt.bg, fontWeight: 600, color: opt.color } : { fontWeight: 500, color: "#4b5563" }}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: isAct ? opt.grad : "#f3f4f6", boxShadow: isAct ? `0 2px 8px ${opt.color}55, inset 0 1px 0 rgba(255,255,255,0.30)` : "none" }}
                          >
                            <Icon className={`w-3.5 h-3.5 ${opt.key === "กำลังตรวจ" && isAct ? "animate-spin" : ""}`} style={{ color: isAct ? "white" : opt.color }} strokeWidth={2.4} />
                          </div>
                          {opt.key}
                          {isAct && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: opt.color }} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </motion.div>,
                  document.body
                )}
              </div>

              {/* Save button — chip with icon-in-circle */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => showSnackbar("success", "บันทึกข้อมูลและปิดเคสเรียบร้อย")}
                className="h-[34px] inline-flex items-center gap-1.5 text-[12px] pl-2.5 pr-3 rounded-full text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
                style={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg,#19a589 0%,#0d7c66 100%)",
                  border: "1px solid #0d7c66",
                  boxShadow: "0 4px 14px rgba(25,165,137,0.40), inset 0 1px 0 rgba(255,255,255,0.40)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={2.8} />
                <span className="hidden sm:inline">บันทึกและปิดเคส</span>
                <span className="sm:hidden">บันทึก</span>
              </motion.button>
            </div>
          );
        })()}
      </motion.div>

      {/* ─── HERO section (blurred photo bg) with avatar + meta + horizontal tab bar ─── */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden bg-gray-200 flex-shrink-0"
      >
        {/* Blurred pet photo as full bg */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={rec.photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(36px) saturate(150%)", transform: "scale(1.4)" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.55) 100%)" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45) 50%, transparent)" }} />
        </div>

        <div className="relative p-4">
          {/* Top row — Avatar + Name/HN + meta chips */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Avatar with rainbow conic ring + sex badge */}
            <div className="relative flex-shrink-0">
              <div
                className="rounded-full p-[3px]"
                style={{
                  background: "conic-gradient(from 180deg, #a78bfa, #ec4899, #f59e0b, #22c55e, #3b82f6, #a78bfa)",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
                }}
              >
                <div className="w-[84px] h-[84px] rounded-full overflow-hidden bg-white">
                  <img src={rec.photo} alt={rec.pet} className="w-full h-full object-cover" />
                </div>
              </div>
              {(isMale || isFemale) && (
                <span
                  className="absolute -bottom-1 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: isFemale ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)",
                    border: "3px solid #ffffff",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
                  }}
                >
                  <span className="text-[13px] text-white" style={{ fontWeight: 700, lineHeight: 1 }}>{isFemale ? "♀" : "♂"}</span>
                </span>
              )}
            </div>

            {/* Name + meta block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1
                  className="text-white"
                  style={{ fontWeight: 700, fontSize: "calc(24px * var(--fs))", letterSpacing: "-0.5px", lineHeight: 1.3, paddingBottom: 2, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
                >
                  {rec.pet}
                </h1>
                {rec.allergies && (
                  <span
                    title={`แพ้: ${rec.allergies}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white"
                    style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)", boxShadow: "0 2px 6px rgba(234,88,12,0.35)", fontWeight: 600 }}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" /> แพ้ {rec.allergies}
                  </span>
                )}
              </div>
              <p className="text-white/85 truncate" style={{ fontSize: "calc(12.5px * var(--fs))", fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}>
                {rec.species} · {rec.breed} · {rec.hn}
              </p>
            </div>

            {/* Print actions — glass pills, right of name */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end flex-shrink-0">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.30)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                <Printer className="w-3.5 h-3.5" /> พิมพ์ใบ Visit
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.30)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                <Printer className="w-3.5 h-3.5" /> พิมพ์ใบบันทึกการตรวจ
              </button>
            </div>
          </div>

          {/* ─── Tab bar (inside hero) — WHITE pill with vivid active state ─── */}
          <div
            className="relative bg-white rounded-full border border-gray-100 mt-5 px-1.5 py-1"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10)" }}
          >
            <div
              className="overflow-x-auto scrollbar-hide"
              style={{ paddingTop: 6, paddingBottom: 6, marginTop: -6, marginBottom: -6 }}
            >
              <div className="flex items-center gap-1 min-w-min">
                {visitTabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <motion.button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      whileTap={{ scale: 0.94 }}
                      className="relative inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
                      style={{
                        color: isActive ? "#ffffff" : "#374151",
                        fontSize: "calc(12px * var(--fs))",
                        fontWeight: isActive ? 700 : 600,
                        textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Animated active indicator — slides between tabs */}
                      {isActive && (
                        <motion.div
                          layoutId="active-tab-indicator"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)",
                            border: "1px solid #0d7c66",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span
                        className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isActive ? "#ffffff" : "#f3f4f6",
                          boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.40)" : "none",
                          transition: "background 0.2s ease",
                        }}
                      >
                        <motion.img
                          src={tab.img}
                          alt=""
                          className="w-4 h-4 object-contain"
                          animate={isActive ? { rotate: [0, -10, 8, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                      </span>
                      <span className="relative z-10">{t(tab.labelKey)}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* ─── Tab content body ─── */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>

            {/* ── 1. บันทึกส่งตรวจ ── */}
            {activeTab === TAB_REGISTER && (() => {
              const visitTypeOptions = [
                { label: "ตรวจสุขภาพทั่วไป", icon: Stethoscope,    color: "#19a589", grad: "linear-gradient(135deg, #34d399, #059669)" },
                { label: "เจ็บป่วย",           icon: Heart,           color: "#f97316", grad: "linear-gradient(135deg, #fb923c, #ea580c)" },
                { label: "ฉุกเฉิน",            icon: AlertTriangle,   color: "#ef4444", grad: "linear-gradient(135deg, #f87171, #dc2626)" },
                { label: "ตรวจติดตาม",         icon: Activity,        color: "#3b82f6", grad: "linear-gradient(135deg, #60a5fa, #2563eb)" },
                { label: "ฉีดวัคซีน",          icon: Syringe,         color: "#a855f7", grad: "linear-gradient(135deg, #c084fc, #9333ea)" },
                { label: "ตัดขน/อาบน้ำ",       icon: Scissors,        color: "#0ea5e9", grad: "linear-gradient(135deg, #38bdf8, #0284c7)" },
                { label: "ฝากเลี้ยง",          icon: Home,            color: "#f59e0b", grad: "linear-gradient(135deg, #fbbf24, #d97706)" },
              ];
              const roomOptions = [
                { label: "ห้อง 1 — ทั่วไป", color: "#19a589" },
                { label: "ห้อง 2 — ตา/หู", color: "#0ea5e9" },
                { label: "ห้อง 3 — ผิวหนัง", color: "#ec4899" },
                { label: "ห้อง 4 — ผ่าตัด", color: "#a855f7" },
                { label: "ห้อง 5 — ไอซียู", color: "#ef4444" },
              ];
              const doctorOptions = [
                { name: "สพ.ว. สมชาย",   specialty: "อายุรกรรมทั่วไป" },
                { name: "สพ.ว. วรรณา",   specialty: "จักษุ / โสต" },
                { name: "สพ.ว. ปรีชา",   specialty: "ศัลยกรรม" },
                { name: "สพ.ว. นภา",     specialty: "ผิวหนัง" },
                { name: "สพ.ว. ธนวัฒน์", specialty: "ทันตกรรม" },
              ];
              const currentRoom = visitRoom || rec.room;
              const currentDoctor = visitDoctor || rec.doctor;

              return (
              <div className="space-y-4">
                {/* ═══════════ Two-column body — left wide, right fixed 420px ═══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">

                {/* ═══════════ LEFT column ═══════════ */}
                <div className="space-y-4">

                {/* ═══════════ SECTION 2: รายละเอียดบริการ (room · doctor · datetime) ═══════════ */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <ClipboardList className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>รายละเอียดบริการ</h3>
                      <p className="text-[11px] text-gray-500">ห้องตรวจ สัตวแพทย์ และเวลารับบริการ</p>
                    </div>
                    {/* Action button — service preset template */}
                    <div className="flex-shrink-0">
                      <ServicePresetPicker
                        storageKey="vet-tpl-service-preset"
                        visitTypeOptions={visitTypeOptions.map(v => v.label)}
                        roomOptions={roomOptions.map(r => r.label)}
                        doctorOptions={doctorOptions.map(d => d.name)}
                        onApply={(p) => {
                          setVisitType(p.visitType);
                          setVisitRoom(p.room);
                          setVisitDoctor(p.doctor);
                          markDirty();
                          showSnackbar("success", `ใช้พรีเซ็ต "${p.name}" แล้ว`);
                        }}
                        seed={[
                          { name: "ตรวจสุขภาพทั่วไป", visitType: "ตรวจสุขภาพทั่วไป", room: "ห้อง 1 — ทั่วไป", doctor: "สพ.ว. สมชาย" },
                          { name: "ตา / หู", visitType: "ตรวจติดตาม", room: "ห้อง 2 — ตา/หู", doctor: "สพ.ว. วรรณา" },
                          { name: "ผิวหนัง", visitType: "เจ็บป่วย", room: "ห้อง 3 — ผิวหนัง", doctor: "สพ.ว. นภา" },
                          { name: "ผ่าตัด", visitType: "เจ็บป่วย", room: "ห้อง 4 — ผ่าตัด", doctor: "สพ.ว. ปรีชา" },
                          { name: "ทันตกรรม", visitType: "ตรวจสุขภาพทั่วไป", room: "ห้อง 4 — ผ่าตัด", doctor: "สพ.ว. ธนวัฒน์" },
                          { name: "ฉุกเฉิน / ICU", visitType: "ฉุกเฉิน", room: "ห้อง 5 — ไอซียู", doctor: "สพ.ว. ปรีชา" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* ห้องตรวจ */}
                    <div>
                      <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                        ห้องตรวจ
                      </label>
                      <div className="relative" ref={visitRoomRef}>
                        <button
                          type="button"
                          onClick={() => setVisitRoomOpen(v => !v)}
                          className="vet-select cursor-pointer"
                        >
                          <span className={currentRoom ? "text-gray-800 truncate" : "text-gray-400"} style={{ fontWeight: 600 }}>
                            {currentRoom || "เลือกห้องตรวจ"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${visitRoomOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {visitRoomOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                              className="absolute z-50 mt-1 w-full bg-white rounded-2xl py-1.5 overflow-hidden"
                              style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)" }}
                            >
                              {roomOptions.map((room) => {
                                const isActive = currentRoom === room.label;
                                return (
                                  <button
                                    key={room.label}
                                    type="button"
                                    onClick={() => { setVisitRoom(room.label); setVisitRoomOpen(false); markDirty(); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] transition-colors ${isActive ? "bg-gray-50" : "hover:bg-gray-50"}`}
                                    style={isActive ? { color: room.color, fontWeight: 700 } : { color: "#374151", fontWeight: 500 }}
                                  >
                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "" : "bg-gray-100"}`} style={isActive ? { background: `${room.color}18` } : undefined}>
                                      <Home className="w-3.5 h-3.5" style={{ color: isActive ? room.color : "#6b7280" }} strokeWidth={2.2} />
                                    </div>
                                    <span>{room.label}</span>
                                    {isActive && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: room.color }} strokeWidth={3} />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* สัตวแพทย์ */}
                    <div>
                      <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                        สัตวแพทย์ผู้ดูแล
                      </label>
                      <div className="relative" ref={visitDoctorRef}>
                        <button
                          type="button"
                          onClick={() => setVisitDoctorOpen(v => !v)}
                          className="vet-select cursor-pointer"
                        >
                          <span className={currentDoctor ? "text-gray-800 truncate" : "text-gray-400"} style={{ fontWeight: 600 }}>
                            {currentDoctor || "เลือกสัตวแพทย์"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${visitDoctorOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {visitDoctorOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                              className="absolute z-50 mt-1 w-full bg-white rounded-2xl py-1.5 overflow-hidden"
                              style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)" }}
                            >
                              {doctorOptions.map((doc) => {
                                const isActive = currentDoctor === doc.name;
                                return (
                                  <button
                                    key={doc.name}
                                    type="button"
                                    onClick={() => { setVisitDoctor(doc.name); setVisitDoctorOpen(false); markDirty(); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-left transition-colors ${isActive ? "bg-[#19a589]/8" : "hover:bg-gray-50"}`}
                                    style={isActive ? { color: "#0d7c66", fontWeight: 700 } : { color: "#374151", fontWeight: 500 }}
                                  >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-[#19a589]/15" : "bg-gray-100"}`}>
                                      <User className={`w-3.5 h-3.5 ${isActive ? "text-[#19a589]" : "text-gray-500"}`} strokeWidth={2.2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate">{doc.name}</div>
                                      <div className="text-[10px] text-gray-400 truncate" style={{ fontWeight: 500 }}>{doc.specialty}</div>
                                    </div>
                                    {isActive && <Check className="w-3.5 h-3.5 text-[#19a589]" strokeWidth={3} />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* วันเวลา — combined date + time picker (one field) */}
                    <div>
                      <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                        วันเวลารับบริการ
                      </label>
                      <div className="relative" ref={visitDateTimeRef}>
                        {(() => {
                          const thaiShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                          const [yy, mm, dd] = visitDate.split("-").map(Number);
                          const dateLabel = `${dd} ${thaiShort[mm - 1]} ${yy + 543}`;
                          const selectedDate = new Date(yy, mm - 1, dd);
                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => setVisitDateTimeOpen(v => !v)}
                                className="vet-select cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-gray-800 truncate" style={{ fontWeight: 600 }}>{dateLabel}</span>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-gray-800" style={{ fontWeight: 600 }}>{visitTime} น.</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${visitDateTimeOpen ? "rotate-180" : ""}`} />
                              </button>

                              <AnimatePresence>
                                {visitDateTimeOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute right-0 top-full mt-2 bg-white rounded-2xl z-[60] overflow-hidden flex"
                                    style={{
                                      border: "1px solid rgba(0,0,0,0.05)",
                                      boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
                                    }}
                                  >
                                    {/* Calendar */}
                                    <div className="p-2 border-r border-gray-100">
                                      <DayPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => {
                                          if (d) {
                                            setVisitDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
                                            markDirty();
                                          }
                                        }}
                                        locale={th}
                                        captionLayout="dropdown"
                                        fromYear={2020}
                                        toYear={new Date().getFullYear() + 1}
                                        style={{ fontSize: "calc(0.78rem * var(--fs))", margin: 0 }}
                                        modifiersStyles={{
                                          selected: { background: "#19a589", color: "white", fontWeight: 700 },
                                          today:    { color: "#19a589", fontWeight: 700 },
                                        }}
                                      />
                                    </div>

                                    {/* Time scrollers */}
                                    <div className="flex flex-col w-[140px]">
                                      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#19a589]" strokeWidth={2.4} />
                                        <span className="text-[11.5px] text-gray-700" style={{ fontWeight: 700 }}>เวลา</span>
                                        <span className="ml-auto text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>{visitTime}</span>
                                      </div>
                                      <div className="flex flex-1 min-h-0">
                                        {/* Hour list */}
                                        <div className="flex-1 overflow-y-auto py-1" style={{ maxHeight: 220 }}>
                                          {Array.from({ length: 24 }, (_, h) => {
                                            const hStr = String(h).padStart(2, "0");
                                            const isActive = visitTime.startsWith(hStr);
                                            return (
                                              <button
                                                key={h}
                                                type="button"
                                                onClick={() => {
                                                  setVisitTime(`${hStr}:${visitTime.split(":")[1] ?? "00"}`);
                                                  markDirty();
                                                }}
                                                className={`w-full px-2 py-1.5 text-[12px] text-center transition-colors ${isActive ? "bg-[#19a589]/10 text-[#0d7c66]" : "text-gray-600 hover:bg-gray-50"}`}
                                                style={{ fontWeight: isActive ? 700 : 500 }}
                                              >
                                                {hStr}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        {/* Minute list (5-min steps) */}
                                        <div className="flex-1 overflow-y-auto py-1 border-l border-gray-100" style={{ maxHeight: 220 }}>
                                          {Array.from({ length: 12 }, (_, i) => {
                                            const m = i * 5;
                                            const mStr = String(m).padStart(2, "0");
                                            const isActive = visitTime.endsWith(`:${mStr}`);
                                            return (
                                              <button
                                                key={m}
                                                type="button"
                                                onClick={() => {
                                                  setVisitTime(`${visitTime.split(":")[0] ?? "09"}:${mStr}`);
                                                  markDirty();
                                                }}
                                                className={`w-full px-2 py-1.5 text-[12px] text-center transition-colors ${isActive ? "bg-[#19a589]/10 text-[#0d7c66]" : "text-gray-600 hover:bg-gray-50"}`}
                                                style={{ fontWeight: isActive ? 700 : 500 }}
                                              >
                                                {mStr}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      {/* Confirm */}
                                      <button
                                        type="button"
                                        onClick={() => setVisitDateTimeOpen(false)}
                                        className="m-2 px-3 py-1.5 rounded-full text-[12px] text-white"
                                        style={{
                                          background: "linear-gradient(135deg, #19a589, #0d7c66)",
                                          fontWeight: 700,
                                          boxShadow: "0 3px 10px rgba(25,165,137,0.35)",
                                        }}
                                      >
                                        ตกลง
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </section>


                {/* ═══════════ SECTION 1: ประเภทการมา (visual pill picker) ═══════════ */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <Stethoscope className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ประเภทการมา <span className="text-rose-400">*</span></h3>
                      <p className="text-[11px] text-gray-500">เลือกประเภทบริการที่สัตว์เลี้ยงมารับ</p>
                    </div>
                  </div>

                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                    {visitTypeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = visitType === opt.label;
                      return (
                        <motion.button
                          key={opt.label}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setVisitType(opt.label); markDirty(); }}
                          className="relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 text-center hover:-translate-y-0.5"
                          style={{
                            background: isActive ? `${opt.color}0d` : "#ffffff",
                            border: isActive ? `1.5px solid ${opt.color}` : "1.5px solid #f3f4f6",
                            boxShadow: isActive ? `0 4px 14px ${opt.color}35, inset 0 1px 0 rgba(255,255,255,0.50)` : "none",
                          }}
                        >
                          <span
                            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white transition-transform duration-200"
                            style={{
                              background: isActive ? opt.grad : "#f3f4f6",
                              color: isActive ? "white" : opt.color,
                              boxShadow: isActive ? `0 3px 10px ${opt.color}55, inset 0 1px 0 rgba(255,255,255,0.30)` : "none",
                            }}
                          >
                            <Icon className="w-5 h-5" strokeWidth={2.2} style={{ color: isActive ? "white" : opt.color }} />
                          </span>
                          <span className="text-[11.5px] text-gray-900 leading-tight" style={{ fontWeight: isActive ? 700 : 600, letterSpacing: "-0.1px" }}>
                            {opt.label}
                          </span>
                          {isActive && (
                            <span
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                              style={{ background: opt.grad, boxShadow: `0 2px 6px ${opt.color}55` }}
                            >
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>

                </div>{/* END LEFT column */}

                {/* ═══════════ RIGHT column ═══════════ */}
                <div className="space-y-4">

                {/* ═══════════ SECTION 3: อาการที่พบ ═══════════ */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <AlertCircle className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>อาการที่พบ <span className="text-rose-400">*</span></h3>
                      <p className="text-[11px] text-gray-500">เลือกอาการที่พบได้หลายอาการ</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <SymptomSetPicker
                        storageKey="vet-tpl-symptom-set"
                        options={symptomList}
                        onApply={(syms) => setSelectedSymptoms(prev => Array.from(new Set([...prev, ...syms])))}
                        seed={[
                          { name: "ทางเดินอาหาร", symptoms: ["อาเจียน", "ท้องเสีย", "เบื่ออาหาร"] },
                          { name: "ระบบหายใจ", symptoms: ["ไอ", "แน่นหน้าอก", "ตัวร้อน"] },
                          { name: "ไข้ / ติดเชื้อ", symptoms: ["ไข้", "ตัวร้อน", "เบื่ออาหาร"] },
                          { name: "ระบบประสาท", symptoms: ["ชัก", "พฤติกรรมผิดปกติ", "ขาแข็ง"] },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="p-3 grid grid-cols-2 gap-2">
                    {symptomList.map((s) => {
                      const active = selectedSymptoms.includes(s);
                      return (
                        <motion.button
                          key={s}
                          type="button"
                          whileTap={{ scale: 0.94 }}
                          onClick={() => toggleSymptom(s)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] rounded-full transition-all duration-150 hover:-translate-y-0.5"
                          style={{
                            background: active ? "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)" : "#ffffff",
                            border: active ? "1px solid #0d7c66" : "1px solid #e5e7eb",
                            color: active ? "#ffffff" : "#6b7280",
                            fontWeight: active ? 700 : 500,
                            boxShadow: active ? "0 3px 10px rgba(25,165,137,0.35), inset 0 1px 0 rgba(255,255,255,0.30)" : "none",
                            textShadow: active ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                          }}
                        >
                          {active && <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />}
                          {s}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>

                </div>{/* END RIGHT column */}
                </div>{/* END two-column body */}
              </div>
              );
            })()}

            {/* ── 2. สัญญาณชีพ ── */}
            {activeTab === TAB_VITALS && (() => {
              /* ค่าอ้างอิงตามชนิดสัตว์จากตาราง vital_sign (สุนัข/แมว/กระต่าย/นก/หนู) */
              const vref = getVitalRef(rec.species);
              const vitalItems = [
                { label: "อุณหภูมิ",   sublabel: "Temperature", icon: Thermometer, unit: "°F",        step: 0.1, min: vref.tempMin,  max: vref.tempMax,  rangeText: fmtRange(vref.tempMin, vref.tempMax),   color: "#f97316", grad: "linear-gradient(135deg, #fb923c, #ea580c)" },
                { label: "ชีพจร",       sublabel: "Pulse Rate",  icon: Heart,       unit: "BPM",       step: 1,   min: vref.pulseMin, max: vref.pulseMax, rangeText: fmtRange(vref.pulseMin, vref.pulseMax), color: "#ef4444", grad: "linear-gradient(135deg, #f87171, #dc2626)" },
                { label: "อัตราหายใจ", sublabel: "Respiration", icon: Wind,        unit: "rpm",       step: 1,   min: vref.respMin,  max: vref.respMax,  rangeText: fmtRange(vref.respMin, vref.respMax),   color: "#0ea5e9", grad: "linear-gradient(135deg, #38bdf8, #0284c7)" },
                { label: "น้ำหนัก",     sublabel: "Weight",      icon: Weight,      unit: "กก.",       step: 0.1, min: null, max: null, rangeText: null,         color: "#8b5cf6", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
              ];

              return (
              <div className="space-y-4">
                {/* ═══════════ Two-column body — LEFT vitals+recorder · RIGHT history ═══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ═══════════ LEFT column ═══════════ */}
                <div className="space-y-4">

                {/* ═══════════ SECTION 1: VITALS (4 cards) ═══════════ */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <Activity className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ค่าสัญญาณชีพ</h3>
                      <p className="text-[11px] text-gray-500">ค่าอ้างอิงตามชนิดสัตว์ ({vref.species}) จากตาราง vital_sign · ระบบจะเตือนเมื่อค่าผิดปกติ</p>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vitalItems.map((v) => {
                      const val = vitals[v.label] ?? "";
                      const num = parseFloat(val);
                      const isEmpty = val.trim() === "" || isNaN(num);
                      const isAbnormal = !isEmpty && v.min !== null && v.max !== null && (num < v.min! || num > v.max!);
                      const inputId = `vital-${v.label}`;
                      const updateVal = (newVal: string) => { setVitals(prev => ({ ...prev, [v.label]: newVal })); markDirty(); };

                      return (
                        <div key={v.label}>
                          <label htmlFor={inputId} className="flex items-baseline justify-between gap-2 mb-1.5">
                            <span className="text-[11.5px] text-gray-600" style={{ fontWeight: 600 }}>
                              {v.label} <span className="text-gray-400" style={{ fontWeight: 500 }}>({v.unit})</span>
                            </span>
                            {v.rangeText && (
                              <span className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>
                                ปกติ {v.rangeText}
                              </span>
                            )}
                          </label>
                          <input
                            id={inputId}
                            value={val}
                            placeholder={`ระบุ${v.label}`}
                            onChange={(e) => updateVal(e.target.value)}
                            inputMode="decimal"
                            className="vet-input"
                            style={isAbnormal ? { color: "#dc2626", borderColor: "rgba(239,68,68,0.40)" } : undefined}
                          />
                          {isAbnormal && (
                            <p className="text-[10.5px] text-rose-500 mt-1 flex items-center gap-1" style={{ fontWeight: 600 }}>
                              <AlertTriangle className="w-3 h-3" strokeWidth={2.4} /> ค่าผิดปกติ — ช่วงปกติของ{vref.species} {v.rangeText} {v.unit}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* ═══════════ SECTION 3: ผู้บันทึก ═══════════ */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <User className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ผู้บันทึก</h3>
                      <p className="text-[11px] text-gray-500">Recorded By</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: "0 3px 10px rgba(14,165,233,0.40)" }}>
                        {authUser?.photo ? (
                          <img src={authUser.photo} alt={authUser.displayName || authUser.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}>
                            <Stethoscope className="w-5 h-5" strokeWidth={2.2} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10.5px] text-gray-500" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>ชื่อผู้บันทึก</div>
                        <div className="text-[14px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{authUser?.displayName || visitDoctor || rec.doctor || "Dr. Veterinarian"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10.5px] text-gray-500" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>วันที่บันทึก</div>
                        <div className="text-[12px] text-gray-700" style={{ fontWeight: 600 }}>
                          {(() => {
                            const [yy, mm, dd] = visitDate.split("-").map(Number);
                            const ths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                            return `${dd} ${ths[mm-1]} ${yy + 543} · ${visitTime} น.`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                </div>{/* END LEFT column */}

                {/* ═══════════ RIGHT column ═══════════ */}
                <div className="space-y-4">

                {/* ═══════════ SECTION 2: อาการ & ประวัติ ═══════════ */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <FileText className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>อาการ & ประวัติ</h3>
                      <p className="text-[11px] text-gray-500">History &amp; Chief Complaint</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* อาการสำคัญ */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>อาการสำคัญ <span className="text-gray-400 normal-case">(Chief Complaint)</span></label>
                        <TemplatePicker
                          storageKey="vet-tpl-chief-complaint"
                          title="เทมเพลตอาการสำคัญ"
                          seed={["ซึม เบื่ออาหาร", "อาเจียน / ท้องเสีย", "ไอ จาม มีน้ำมูก", "คันผิวหนัง เกาบ่อย", "ปัสสาวะลำบาก"]}
                          onSelect={(t) => setChiefComplaint(prev => (prev.trim() ? `${prev.trim()}\n${t}` : t))}
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={chiefComplaint}
                        onChange={e => setChiefComplaint(e.target.value)}
                        placeholder="ระบุอาการสำคัญที่นำสัตว์มาพบสัตวแพทย์"
                        className={textareaCls}
                      />
                    </div>

                    {/* ประวัติการเจ็บป่วย */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ประวัติการเจ็บป่วย</label>
                        <TemplatePicker
                          storageKey="vet-tpl-illness-history"
                          title="เทมเพลตประวัติการเจ็บป่วย"
                          seed={["มีอาการมา 3 วัน อาการคงที่", "เคยมีประวัติแพ้ยา", "อาการเป็นๆ หายๆ มานานกว่า 1 สัปดาห์", "ไม่เคยมีประวัติเจ็บป่วยมาก่อน"]}
                          onSelect={(t) => setIllnessHistory(prev => (prev.trim() ? `${prev.trim()}\n${t}` : t))}
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={illnessHistory}
                        onChange={e => setIllnessHistory(e.target.value)}
                        placeholder="อธิบายอาการเจ็บป่วยในรายละเอียด"
                        className={textareaCls}
                      />
                    </div>

                    {/* 2-col: duration + abnormal findings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                          ระยะเวลาที่มีอาการ
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input placeholder="เช่น 3 วัน, 1 สัปดาห์" className={`${inputCls} has-icon-left`} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                          ผลตรวจเพิ่มเติม
                        </label>
                        <input placeholder="เช่น ขนร่วง, ผิวหนังแดง" className={inputCls} />
                      </div>
                    </div>

                    {/* ประวัติการรักษาก่อนหน้า */}
                    <div>
                      <label className="text-[11px] text-gray-500 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                        ประวัติการรักษาก่อนหน้า
                      </label>
                      <textarea rows={2} placeholder="ระบุการรักษาที่เคยได้รับในครั้งก่อน (ถ้ามี)" className={textareaCls} />
                    </div>
                  </div>
                </section>

                </div>{/* END RIGHT column */}
                </div>{/* END two-column body */}
              </div>
              );
            })()}

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
              const total = bodySystems.length;
              const checkedCount = bodySystems.filter(s => examStatus[s.key]).length;
              const allNormalAction = () => {
                const allNormal: Record<string, "ปกติ" | "ผิดปกติ" | "ไม่ได้ตรวจ"> = {};
                bodySystems.forEach(s => { allNormal[s.key] = "ปกติ"; });
                setExamStatus(prev => ({ ...prev, ...allNormal }));
                markDirty();
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                  {/* ═══════════ LEFT column ═══════════ */}
                  <div className="space-y-4">

                    {/* ── Body systems section ── */}
                    <section
                      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                    >
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                          <Stethoscope className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ระบบต่างๆ ของร่างกาย</h3>
                            <span
                              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                              style={{
                                background: checkedCount === total ? "rgba(16,185,129,0.10)" : "rgba(25,165,137,0.10)",
                                color: checkedCount === total ? "#059669" : "#0d7c66",
                                fontWeight: 700,
                                border: `1px solid ${checkedCount === total ? "rgba(16,185,129,0.20)" : "rgba(25,165,137,0.20)"}`,
                              }}
                            >
                              {checkedCount === total && <Check className="w-2.5 h-2.5 mr-0.5" strokeWidth={3} />}
                              {checkedCount}/{total}
                            </span>
                          </div>
                          {(() => {
                            const normalCount = bodySystems.filter(s => examStatus[s.key] === "ปกติ").length;
                            const abnormalCount = bodySystems.filter(s => examStatus[s.key] === "ผิดปกติ").length;
                            const skippedCount = bodySystems.filter(s => examStatus[s.key] === "ไม่ได้ตรวจ").length;
                            return (
                              <div className="flex items-center gap-2.5 text-[10.5px] mt-0.5">
                                <span className="inline-flex items-center gap-1 text-[#0d7c66]" style={{ fontWeight: 600 }}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#19a589]" /> ปกติ {normalCount}
                                </span>
                                <span className="inline-flex items-center gap-1 text-rose-500" style={{ fontWeight: 600 }}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> ผิดปกติ {abnormalCount}
                                </span>
                                <span className="inline-flex items-center gap-1 text-gray-400" style={{ fontWeight: 600 }}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> ข้าม {skippedCount}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <button
                          type="button"
                          onClick={allNormalAction}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-[#0d7c66] hover:bg-[#19a589]/15 transition-colors flex-shrink-0"
                          style={{ fontWeight: 600, background: "rgba(25,165,137,0.10)", border: "1px solid rgba(25,165,137,0.20)" }}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.4} /> ปกติทั้งหมด
                        </button>
                      </div>

                      {/* Compact list — one row per system */}
                      <div className="divide-y divide-gray-100">
                        {bodySystems.map(({ key, label, subLabel, icon: Icon }) => {
                          const status = examStatus[key];
                          const isNormal   = status === "ปกติ";
                          const isAbnormal = status === "ผิดปกติ";
                          const isSkipped  = status === "ไม่ได้ตรวจ";
                          const isUnchecked = !status;
                          return (
                            <div
                              key={key}
                              className="px-4 py-2.5 transition-colors"
                              style={{
                                background: isAbnormal ? "rgba(239,68,68,0.03)" : isNormal ? "rgba(25,165,137,0.03)" : "transparent",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {/* Icon — colored by status */}
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                                  style={{
                                    background: isAbnormal ? "linear-gradient(135deg, #f87171, #dc2626)" :
                                                isNormal ? "linear-gradient(135deg, #34d399, #059669)" :
                                                isSkipped ? "#e5e7eb" :
                                                "#f3f4f6",
                                    boxShadow: isAbnormal ? "0 2px 6px rgba(239,68,68,0.30), inset 0 1px 0 rgba(255,255,255,0.30)" :
                                               isNormal ? "0 2px 6px rgba(25,165,137,0.30), inset 0 1px 0 rgba(255,255,255,0.30)" :
                                               "none",
                                  }}
                                >
                                  <Icon className={`w-4 h-4 ${isNormal || isAbnormal ? "text-white" : "text-gray-400"}`} strokeWidth={2.2} />
                                </div>

                                {/* Label + sublabel */}
                                <div className="flex-1 min-w-0">
                                  <div className={`text-[13px] truncate ${isUnchecked ? "text-gray-700" : "text-gray-900"}`} style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{label}</div>
                                  <div className="text-[10px] text-gray-400 truncate" style={{ fontWeight: 500, letterSpacing: "0.3px" }}>{subLabel.replace(/[()]/g, "")}</div>
                                </div>

                                {/* Status segmented control — icon-only */}
                                <div className="flex items-center bg-gray-100 rounded-full p-0.5 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => { setExamStatus(p => ({ ...p, [key]: isNormal ? (undefined as any) : "ปกติ" })); markDirty(); }}
                                    className="w-8 h-7 inline-flex items-center justify-center rounded-full transition-all"
                                    style={{
                                      background: isNormal ? "linear-gradient(135deg, #19a589, #0d7c66)" : "transparent",
                                      color: isNormal ? "#ffffff" : "#9ca3af",
                                      boxShadow: isNormal ? "0 2px 6px rgba(25,165,137,0.40)" : "none",
                                    }}
                                    title="ปกติ"
                                  >
                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setExamStatus(p => ({ ...p, [key]: isAbnormal ? (undefined as any) : "ผิดปกติ" })); markDirty(); }}
                                    className="w-8 h-7 inline-flex items-center justify-center rounded-full transition-all"
                                    style={{
                                      background: isAbnormal ? "linear-gradient(135deg, #f87171, #dc2626)" : "transparent",
                                      color: isAbnormal ? "#ffffff" : "#9ca3af",
                                      boxShadow: isAbnormal ? "0 2px 6px rgba(239,68,68,0.40)" : "none",
                                    }}
                                    title="ผิดปกติ"
                                  >
                                    <X className="w-3.5 h-3.5" strokeWidth={3} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setExamStatus(p => ({ ...p, [key]: isSkipped ? (undefined as any) : "ไม่ได้ตรวจ" })); markDirty(); }}
                                    className="w-8 h-7 inline-flex items-center justify-center rounded-full transition-all text-[12px]"
                                    style={{
                                      background: isSkipped ? "linear-gradient(135deg, #9ca3af, #6b7280)" : "transparent",
                                      color: isSkipped ? "#ffffff" : "#9ca3af",
                                      fontWeight: 700,
                                      boxShadow: isSkipped ? "0 2px 6px rgba(107,114,128,0.40)" : "none",
                                    }}
                                    title="ไม่ได้ตรวจ"
                                  >
                                    —
                                  </button>
                                </div>
                              </div>

                              {/* Abnormal note input */}
                              <AnimatePresence initial={false}>
                                {isAbnormal && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden ml-12"
                                  >
                                    <input
                                      placeholder="ระบุความผิดปกติที่พบ..."
                                      className="w-full px-3 py-1.5 text-[11.5px] rounded-full focus:outline-none transition-all"
                                      style={{
                                        background: "#ffffff",
                                        border: "1.5px solid rgba(239,68,68,0.25)",
                                        color: "#7f1d1d",
                                      }}
                                      onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 4px rgba(239,68,68,0.10)"; }}
                                      onBlur={(e) => { e.target.style.borderColor = "rgba(239,68,68,0.25)"; e.target.style.boxShadow = "none"; }}
                                      autoFocus
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* ── General Notes section ── */}
                    <section
                      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                    >
                      <button
                        type="button"
                        onClick={() => setExamNoteOpen(prev => !prev)}
                        className="w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-gray-50/60"
                      >
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
                          <FileText className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>บันทึกทั่วไป</h3>
                          <p className="text-[11px] text-gray-500">พฤติกรรม อุปนิสัย และข้อสังเกตอื่นๆ</p>
                        </div>
                        <motion.span animate={{ rotate: examNoteOpen ? 180 : 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {examNoteOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            className="overflow-hidden border-t border-gray-100/80"
                          >
                            <div className="p-4">
                              <textarea
                                rows={3}
                                value={examNote}
                                onChange={e => { setExamNote(e.target.value); markDirty(); }}
                                placeholder="บันทึกการตรวจทั่วไป พฤติกรรม อุปนิสัยของสัตว์..."
                                className="vet-textarea"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>
                  </div>

                  {/* ═══════════ RIGHT column ═══════════ */}
                  <div className="space-y-4">
                    {/* Photos panel */}
                    <section
                      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                    >
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                          <ImagePlus className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>รูปภาพการตรวจ</h3>
                          <p className="text-[11px] text-gray-500">อัปโหลดรูปประกอบการวินิจฉัย</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <ExamPhotosPanel />
                      </div>
                    </section>

                    {/* Body map */}
                    <section
                      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                    >
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                          <MapPin className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>แผนผังร่างกาย</h3>
                          <p className="text-[11px] text-gray-500">ปักหมายจุดที่พบความผิดปกติ</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <ExamBodyMapPanel species={rec.species} />
                      </div>
                    </section>
                  </div>
                </div>
              );
            })()}



            {/* ── 4. วินิจฉัย ── */}
            {activeTab === TAB_DIAGNOSIS && (
              <>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start pb-4">

                {/* ═══════════ LEFT — Diagnosis form ═══════════ */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <BookOpen className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>การวินิจฉัย</h3>
                      <p className="text-[11px] text-gray-500">Diagnosis &amp; Treatment Plan</p>
                    </div>
                  </div>

                  <DiagnosisSection remedHistory={DIAG_HISTORY} />
                </section>

                {/* ═══════════ RIGHT — Past diagnoses ═══════════ */}
                {(() => {
                  const diagHistory = DIAG_HISTORY;
                  const pendingCount = diagHistory.filter(h => h.status === "รอยืนยัน").length;
                  return (
                    <section
                      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                    >
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                          <BookOpen className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ประวัติการวินิจฉัย</h3>
                            <span
                              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                              style={{
                                background: "rgba(147,51,234,0.10)",
                                color: "#7c3aed",
                                fontWeight: 700,
                                border: "1px solid rgba(147,51,234,0.20)",
                              }}
                            >
                              {diagHistory.length} ครั้ง
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            {pendingCount > 0
                              ? <>มี <span className="text-amber-600" style={{ fontWeight: 700 }}>{pendingCount}</span> รายการรอยืนยัน · คลิกเพื่อดูรายละเอียด</>
                              : "ทุกรายการยืนยันแล้ว · คลิกเพื่อดูรายละเอียด"}
                          </p>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {diagHistory.map((h, i) => {
                          const isPending = h.status === "รอยืนยัน";
                          return (
                            <button
                              key={`diag-history-${i}`}
                              onClick={() => setExpandedDiagHistory(h)}
                              className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[10.5px] flex-shrink-0"
                                    style={{ background: "rgba(147,51,234,0.10)", color: "#7c3aed", fontWeight: 700, letterSpacing: "0.3px" }}
                                  >
                                    {h.icd}
                                  </span>
                                  <span className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>{h.date}</span>
                                </div>
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                                  style={{
                                    background: isPending ? "rgba(245,158,11,0.10)" : "rgba(16,185,129,0.10)",
                                    color: isPending ? "#b45309" : "#059669",
                                    fontWeight: 600,
                                  }}
                                >
                                  {h.status}
                                </span>
                              </div>
                              <div className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 600 }}>
                                {h.disease}
                              </div>
                              <div className="text-[10.5px] text-gray-400 mt-0.5 truncate" style={{ fontWeight: 500 }}>
                                {h.diagType} · {h.vet}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })()}
              </div>

              {/* ── Diagnosis History Popup ── */}
              {expandedDiagHistory && createPortal(
                <AnimatePresence>
                  <motion.div
                    key="diag-popup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">

                {/* ═══════════ LEFT — Vaccine form ═══════════ */}
                <div className="space-y-4">

                  {/* Section 1: ข้อมูลการฉีด */}
                  <section
                    className="relative bg-white rounded-2xl border border-gray-100"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                  >
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                        <Syringe className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ข้อมูลการฉีดวัคซีน</h3>
                        <p className="text-[11px] text-gray-500">เลือกวัคซีน รายละเอียดการฉีด และเวลา</p>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Single 4-column grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {/* เลือกวัคซีน */}
                        <div>
                          <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            เลือกวัคซีน <span className="text-rose-400 normal-case">*</span>
                          </label>
                          <div className="relative">
                            <select className="vet-select appearance-none">
                              <option value="">-- เลือก --</option>
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

                        <div>
                          <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            Lot Number <span className="text-rose-400 normal-case">*</span>
                          </label>
                          <input placeholder="เช่น B12345" className="vet-input" />
                        </div>
                        <div>
                          <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            วันหมดอายุ <span className="text-rose-400 normal-case">*</span>
                          </label>
                          <DatePickerModern value={vaccineExpiryDate} onChange={setVaccineExpiryDate} placeholder="เลือกวันหมดอายุ" />
                        </div>
                        <div>
                          <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            ตำแหน่งที่ฉีด <span className="text-rose-400 normal-case">*</span>
                          </label>
                          <div className="relative">
                            <select className="vet-select appearance-none">
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

                        <div>
                          <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            วิธีการฉีด <span className="text-rose-400 normal-case">*</span>
                          </label>
                          <div className="relative">
                            <select className="vet-select appearance-none">
                              <option>ใต้ผิวหนัง (SC)</option>
                              <option>เข้ากล้ามเนื้อ (IM)</option>
                              <option>เข้าหลอดเลือดดำ (IV)</option>
                              <option>หยอดจมูก (IN)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            สัตวแพทย์ผู้ฉีด <span className="text-rose-400 normal-case">*</span>
                          </label>
                          <div className="relative">
                            <select className="vet-select appearance-none">
                              <option>สพ.สมชาย รักสัตว์</option>
                              <option>สพ.วิภาวดี ใจดี</option>
                              <option>สพ.ปรีชา สัตวแพทย์</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            เวลาฉีด <span className="text-rose-400 normal-case">*</span>
                          </label>
                          <TimePickerModern value={vaccineInjectionTime} onChange={setVaccineInjectionTime} />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Monitoring Vital Signs — comparison table */}
                  <section
                    className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                  >
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                        <Activity className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ติดตาม Vital Signs</h3>
                        <p className="text-[11px] text-gray-500">เปรียบเทียบค่าก่อน/หลังฉีดวัคซีน</p>
                      </div>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_110px_110px] px-4 pt-3 pb-2 gap-3 items-center">
                      <div className="text-[10.5px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                        รายการ
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                        <span className="text-[10.5px] text-[#0284c7]" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ก่อนฉีด</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#fb923c]" />
                        <span className="text-[10.5px] text-[#ea580c]" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>หลังฉีด</span>
                      </div>
                    </div>

                    {/* Rows */}
                    <div className="px-2 pb-3 space-y-1">
                      {[
                        { label: "อุณหภูมิ",  sublabel: "Temperature", unit: "°F",  icon: Thermometer, color: "#f97316", baseline: "101.3", after: "101.3" },
                        { label: "ชีพจร",     sublabel: "Pulse Rate",  unit: "bpm", icon: Heart,       color: "#ef4444", baseline: "120",  after: "120" },
                        { label: "การหายใจ", sublabel: "Respiration", unit: "rpm", icon: Wind,        color: "#0ea5e9", baseline: "24",   after: "24" },
                      ].map((v) => {
                        const Icon = v.icon;
                        return (
                          <div
                            key={v.label}
                            className="grid grid-cols-[1fr_110px_110px] items-center gap-3 px-2 py-2 rounded-xl transition-colors hover:bg-gray-50/60"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                style={{ background: `linear-gradient(135deg, ${v.color}cc, ${v.color})`, boxShadow: `0 2px 6px ${v.color}55` }}
                              >
                                <Icon className="w-3.5 h-3.5" strokeWidth={2.4} />
                              </span>
                              <div className="min-w-0">
                                <div className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>{v.label}</div>
                                <div className="text-[9.5px] text-gray-400 truncate" style={{ fontWeight: 500, letterSpacing: "0.3px" }}>{v.unit}</div>
                              </div>
                            </div>
                            <div className="relative">
                              <input defaultValue={v.baseline} className="vet-input text-right" style={{ height: 34, fontSize: "calc(13px * var(--fs))", paddingRight: 38 }} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none" style={{ fontWeight: 600 }}>{v.unit}</span>
                            </div>
                            <div className="relative">
                              <input defaultValue={v.after} className="vet-input text-right" style={{ height: 34, fontSize: "calc(13px * var(--fs))", paddingRight: 38 }} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none" style={{ fontWeight: 600 }}>{v.unit}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Section 3: Adverse reaction */}
                  <section
                    className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                  >
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                        <AlertTriangle className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>อาการไม่พึงประสงค์</h3>
                        <p className="text-[11px] text-gray-500">Adverse Reaction — บันทึกถ้ามีอาการผิดปกติ</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <textarea
                        rows={2}
                        placeholder="เช่น มีอาการบวม คัน อาเจียน หรืออาการอื่นๆ หลังการฉีด"
                        className="vet-textarea"
                      />
                    </div>
                  </section>

                  {/* Footer save */}
                  <div className="flex justify-end pt-1 pb-4">
                    <button
                      className="vet-btn vet-btn-primary"
                      onClick={() => showSnackbar("success", "บันทึกการฉีดวัคซีนสำเร็จแล้ว")}
                    >
                      <Check className="w-4 h-4" strokeWidth={2.4} />
                      บันทึกการฉีดวัคซีน
                    </button>
                  </div>
                </div>

                {/* ═══════════ RIGHT — Vaccine history ═══════════ */}
                {(() => {
                  const vaxHistory = [
                    { date: "15 ก.พ. 69", vaccine: "พิษสุนัขบ้า", vet: "สพ.สมชาย รักสัตว์", method: "SC", status: "สำเร็จ", isWarning: false, batch: "RB-2569-001", site: "ต้นขาหลังขวา", next: "15 ก.พ. 70", note: "" },
                    { date: "20 ม.ค. 69", vaccine: "DHPP", vet: "สพ.วิภาวดี ใจดี", method: "SC", status: "สำเร็จ", isWarning: false, batch: "DH-2569-042", site: "สะบักขวา", next: "20 ม.ค. 70", note: "" },
                    { date: "10 ธ.ค. 68", vaccine: "เลปโตสไปรา", vet: "สพ.สมชาย รักสัตว์", method: "IM", status: "สำเร็จ", isWarning: false, batch: "LP-2568-118", site: "ต้นขาหลังซ้าย", next: "10 มิ.ย. 69", note: "" },
                    { date: "5 พ.ย. 68", vaccine: "บอร์เดเทลลา", vet: "สพ.ปรีชา สัตวแพทย์", method: "IN", status: "ข้างเคียง", isWarning: true, batch: "BD-2568-055", site: "โพรงจมูก", next: "5 พ.ย. 69", note: "มีอาการบวมบริเวณที่ฉีด หายเองใน 24 ชม." },
                    { date: "20 ก.ย. 68", vaccine: "DHPP", vet: "สพ.สมชาย รักสัตว์", method: "SC", status: "สำเร็จ", isWarning: false, batch: "DH-2568-089", site: "สะบักซ้าย", next: "20 ม.ค. 69", note: "" },
                  ];
                  const warnCount = vaxHistory.filter(h => h.isWarning).length;
                  return (
                    <section
                      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                    >
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                          <Syringe className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ประวัติการฉีดวัคซีน</h3>
                            <span
                              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                              style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700, border: "1px solid rgba(25,165,137,0.20)" }}
                            >
                              {vaxHistory.length} ครั้ง
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            {warnCount > 0
                              ? <>มี <span className="text-amber-600" style={{ fontWeight: 700 }}>{warnCount}</span> ครั้งที่พบอาการข้างเคียง</>
                              : "ไม่มีอาการข้างเคียง · คลิกเพื่อดูรายละเอียด"}
                          </p>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {vaxHistory.map((h, i) => (
                          <button
                            key={`vax-history-${i}`}
                            onClick={() => setExpandedVaxData(h)}
                            className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="px-1.5 py-0.5 rounded text-[10.5px] flex-shrink-0"
                                  style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700, letterSpacing: "0.3px" }}
                                >
                                  {h.method}
                                </span>
                                <span className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>{h.date}</span>
                              </div>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{
                                  background: h.isWarning ? "rgba(245,158,11,0.10)" : "rgba(16,185,129,0.10)",
                                  color: h.isWarning ? "#b45309" : "#059669",
                                  fontWeight: 600,
                                }}
                              >
                                {h.status}
                              </span>
                            </div>
                            <div className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 600 }}>
                              {h.vaccine}
                            </div>
                            <div className="text-[10.5px] text-gray-400 mt-0.5 truncate" style={{ fontWeight: 500 }}>
                              {h.site} · {h.vet}
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  );
                })()}
              </div>

              {/* ── Vaccine History Popup ── */}
              {expandedVaxData && createPortal(
                <AnimatePresence>
                  <motion.div
                    key="vax-popup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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

            {/* ── 5.5 ถ่ายพยาธิ (Deworming) ── */}
            {activeTab === TAB_DEWORMING && (
              <OpdDewormingForm hn={rec.hn} defaultDoctor={rec.doctor} />
            )}

            {/* ── 6. แล็บ / เอกซเรย์ ── */}
            {activeTab === TAB_LAB && (
              <div className="space-y-4 pb-4">
                {/* LAB */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <FlaskConical className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>คำสั่ง LAB</h3>
                        <span
                          className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                          style={{ background: "rgba(14,165,233,0.10)", color: "#0284c7", fontWeight: 700, border: "1px solid rgba(14,165,233,0.20)" }}
                        >
                          {labOrders.length} รายการ
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">Laboratory Orders</p>
                    </div>
                    <button
                      onClick={() => setShowLabOrderModal(true)}
                      className="vet-btn vet-btn-orange"
                      style={{ height: 32, padding: "0 14px", fontSize: "calc(12px * var(--fs))" }}
                    >
                      <Plus className="w-3.5 h-3.5" /> เพิ่มคำสั่ง
                    </button>
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
                            {(lab.orderer || lab.collectionDate) && (
                              <div className="text-[10.5px] text-gray-400 mt-0.5">
                                สั่งเมื่อ {lab.collectionDate || "—"}{lab.collectionTime ? ` ${lab.collectionTime} น.` : ""}{lab.orderer ? ` · โดย ${lab.orderer}` : ""}
                              </div>
                            )}
                          </div>
                          {lab.status === "เสร็จสิ้น" && (() => {
                            const hasResults = lab.results && lab.results.length > 0;
                            return (
                              <button
                                onClick={() => setExpandedLabResult(expandedLabResult === i ? null : i)}
                                className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 rounded-full transition-all hover:-translate-y-0.5"
                                style={{
                                  height: 32,
                                  fontSize: "calc(12px * var(--fs))",
                                  fontWeight: 700,
                                  background: hasResults
                                    ? "linear-gradient(135deg, #19a589, #0d7c66)"
                                    : "linear-gradient(135deg, #fbbf24, #d97706)",
                                  color: "white",
                                  border: hasResults ? "1px solid #0d7c66" : "1px solid #b45309",
                                  boxShadow: hasResults
                                    ? "0 2px 8px rgba(25,165,137,0.30), inset 0 1px 0 rgba(255,255,255,0.30)"
                                    : "0 2px 8px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.30)",
                                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                                }}
                              >
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>
                                  <ClipboardList className="w-3 h-3" strokeWidth={2.4} />
                                </span>
                                {hasResults ? "ดูผล" : "รายงานผล"}
                                <ChevronDown className={`w-3 h-3 transition-transform ${expandedLabResult === i ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })()}
                          {(() => {
                            /* สถานะแบบ IPD: chip + ปุ่มขั้นถัดไป (รอ → ส่งแล้ว → รอผล → เสร็จสิ้น) */
                            const statusOpts: Record<string, { color: string; bg: string }> = {
                              "รอ":       { color: "#64748b", bg: "rgba(100,116,139,0.10)" },
                              "ส่งแล้ว":  { color: "#0284c7", bg: "rgba(14,165,233,0.10)" },
                              "รอผล":     { color: "#b45309", bg: "rgba(245,158,11,0.10)" },
                              "เสร็จสิ้น": { color: "#059669", bg: "rgba(16,185,129,0.10)" },
                            };
                            const nextStep: Record<string, { to: string; label: string } | undefined> = {
                              "รอ": { to: "ส่งแล้ว", label: "→ ส่งแล้ว" },
                              "ส่งแล้ว": { to: "รอผล", label: "→ รอผล" },
                              "รอผล": { to: "เสร็จสิ้น", label: "✓ ใส่ผล" },
                            };
                            const sc = statusOpts[lab.status] ?? statusOpts["รอ"];
                            const nx = nextStep[lab.status];
                            const setStatus = (v: string) => {
                              const updated = [...labOrders];
                                updated[i] = { ...updated[i], status: v };
                              setLabOrders(updated);
                              if (v === "เสร็จสิ้น") setExpandedLabResult(i);
                            };
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontWeight: 700, background: sc.bg, color: sc.color }}>{lab.status}</span>
                                {nx && (
                                  <button onClick={() => setStatus(nx.to)}
                                    className="text-[11px] px-2.5 py-1 rounded-full transition-colors hover:opacity-85"
                                    style={{ fontWeight: 700, background: nx.to === "เสร็จสิ้น" ? "rgba(16,185,129,0.10)" : "rgba(14,165,233,0.10)", color: nx.to === "เสร็จสิ้น" ? "#059669" : "#0284c7" }}>
                                    {nx.label}
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                          <button
                            onClick={() => { setEditingLabIdx(i); setShowLabOrderModal(true); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#19a589] hover:bg-[#19a589]/8 transition-all"
                            title="แก้ไข"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              const ok = await confirm({
                                title: "ลบคำสั่ง Lab",
                                description: `ลบ "${lab.test}" ออกจากรายการ?`,
                                confirmLabel: "ลบ",
                                kind: "danger",
                              });
                              if (!ok) return;
                              setLabOrders(prev => prev.filter((_, idx) => idx !== i));
                              showSnackbar("delete", "ลบรายการ Lab แล้ว");
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* แนบภาพถ่าย (สไลด์/ใบผล) — แบบ IPD */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5 px-1">
                          {(lab.photos ?? []).map((ph, pi) => (
                            <div key={pi} className="relative group/lph">
                              <button type="button" onClick={() => setLabPhotoView(ph)}
                                className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 hover:border-[#19a589] transition-colors block">
                                <img src={ph} alt={`แนบ ${pi + 1}`} className="w-full h-full object-cover" />
                              </button>
                              <button type="button" title="ลบภาพ"
                                onClick={() => {
                                  const updated = [...labOrders];
                                  updated[i] = { ...updated[i], photos: (updated[i].photos ?? []).filter((_, x) => x !== pi) };
                                  setLabOrders(updated);
                                }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white items-center justify-center hidden group-hover/lph:flex">
                                <X className="w-2.5 h-2.5" strokeWidth={3} />
                              </button>
                            </div>
                          ))}
                          {(lab.photos?.length ?? 0) < 6 && (
                            <label className="w-11 h-11 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#19a589]/60 hover:text-[#19a589] text-gray-300 flex flex-col items-center justify-center transition-colors cursor-pointer" title="แนบภาพถ่าย">
                              <Camera className="w-3.5 h-3.5" />
                              <span className="text-[7.5px] mt-0.5" style={{ fontWeight: 700 }}>แนบภาพ</span>
                              <input type="file" accept="image/*" multiple className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files ?? []);
                                  if (!files.length) return;
                                  const urls = files.map(f => URL.createObjectURL(f));
                                  const updated = [...labOrders];
                                  updated[i] = { ...updated[i], photos: [...(updated[i].photos ?? []), ...urls].slice(0, 6) };
                                  setLabOrders(updated);
                                  e.target.value = "";
                                }} />
                            </label>
                          )}
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
                  {labPhotoView && createPortal(
                  <div className="fixed inset-0 z-[130] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setLabPhotoView(null)}>
                    <img src={labPhotoView} alt="ภาพแนบ" className="max-w-full max-h-full rounded-2xl" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }} />
                  </div>,
                  document.body
                )}
                  <LabOrderModal
                    open={showLabOrderModal}
                    onClose={() => { setShowLabOrderModal(false); setEditingLabIdx(null); }}
                    editing={editingLabIdx !== null ? labOrders[editingLabIdx] : null}
                    onSubmit={(data) => {
                      if (editingLabIdx !== null) {
                        setLabOrders(prev => prev.map((item, idx) =>
                          idx === editingLabIdx ? { ...item, ...data } : item
                        ));
                        showSnackbar("success", "แก้ไข Lab สำเร็จแล้ว");
                        setEditingLabIdx(null);
                      } else {
                        setLabOrders(prev => [...prev, { ...data, status: "รอ", results: [], photos: [] }]);
                        showSnackbar("success", "สั่ง Lab สำเร็จแล้ว");
                      }
                    }}
                  />
                </section>

                {/* X-Ray */}
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <ScanLine className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>คำสั่ง X-Ray</h3>
                        <span
                          className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                          style={{ background: "rgba(139,92,246,0.10)", color: "#7c3aed", fontWeight: 700, border: "1px solid rgba(139,92,246,0.20)" }}
                        >
                          {xrayOrders.length} รายการ
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">X-Ray Orders</p>
                    </div>
                    <button
                      onClick={() => setShowXRayOrderModal(true)}
                      className="vet-btn vet-btn-orange"
                      style={{ height: 32, padding: "0 14px", fontSize: "calc(12px * var(--fs))" }}
                    >
                      <Plus className="w-3.5 h-3.5" /> เพิ่มคำสั่ง
                    </button>
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
                          <label className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[#19a589] bg-[#19a589]/8 hover:bg-[#19a589]/14 border border-[#19a589]/15 rounded-full cursor-pointer transition-colors" style={{ fontWeight: 500 }} title="แนบฟิล์ม/ภาพ หรือไฟล์ DICOM (.dcm)">
                            <ImagePlus className="w-3.5 h-3.5" />
                            แนบฟิล์ม/DICOM
                            <input
                              type="file"
                              accept="image/*,.dcm,application/dicom"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                if (!files.length) return;
                                const imgs: string[] = [];
                                const dcms: { name: string; url: string }[] = [];
                                files.forEach(f => {
                                  if (f.name.toLowerCase().endsWith(".dcm") || f.type === "application/dicom") dcms.push({ name: f.name, url: URL.createObjectURL(f) });
                                  else imgs.push(URL.createObjectURL(f));
                                });
                                const updated = [...xrayOrders];
                                updated[i] = { ...updated[i], films: [...(updated[i].films || []), ...imgs], dicoms: [...(updated[i].dicoms ?? []), ...dcms] };
                                setXrayOrders(updated);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          {(() => {
                            /* สถานะแบบ IPD: chip + ปุ่มขั้นถัดไป (รอ → กำลังถ่าย → เสร็จสิ้น) */
                            const cfg: Record<string, { color: string; bg: string }> = {
                              "รอ": { color: "#64748b", bg: "rgba(100,116,139,0.10)" },
                              "กำลังถ่าย": { color: "#b45309", bg: "rgba(245,158,11,0.10)" },
                              "เสร็จสิ้น": { color: "#059669", bg: "rgba(16,185,129,0.10)" },
                            };
                            const nxt: Record<string, { to: string; label: string } | undefined> = {
                              "รอ": { to: "กำลังถ่าย", label: "→ กำลังถ่าย" },
                              "กำลังถ่าย": { to: "เสร็จสิ้น", label: "✓ เสร็จสิ้น" },
                            };
                            const sc = cfg[xr.status] ?? cfg["รอ"];
                            const nx = nxt[xr.status];
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontWeight: 700, background: sc.bg, color: sc.color }}>{xr.status}</span>
                                {nx && (
                                  <button
                                    onClick={() => {
                                      const updated = [...xrayOrders];
                                      updated[i] = { ...updated[i], status: nx.to };
                                      setXrayOrders(updated);
                                    }}
                                    className="text-[11px] px-2.5 py-1 rounded-full transition-colors hover:opacity-85"
                                    style={{ fontWeight: 700, background: nx.to === "เสร็จสิ้น" ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.10)", color: nx.to === "เสร็จสิ้น" ? "#059669" : "#b45309" }}>
                                    {nx.label}
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                          <button
                            onClick={() => { setEditingXrayIdx(i); setShowXRayOrderModal(true); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#19a589] hover:bg-[#19a589]/8 transition-all"
                            title="แก้ไข"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              const ok = await confirm({
                                title: "ลบคำสั่ง X-Ray",
                                description: `ลบ "${xr.exam}" ออกจากรายการ?`,
                                confirmLabel: "ลบ",
                                kind: "danger",
                              });
                              if (!ok) return;
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
                        {(xr.dicoms?.length ?? 0) > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5 px-1">
                            {xr.dicoms!.map((dc, di) => (
                              <div key={di} className="relative group/dcm">
                                <a href={dc.url} download={dc.name} title={`ดาวน์โหลด ${dc.name}`}
                                  className="w-12 h-12 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 flex flex-col items-center justify-center transition-colors">
                                  <FileText className="w-4 h-4 text-indigo-500" />
                                  <span className="text-[7.5px] text-indigo-600 mt-0.5" style={{ fontWeight: 700 }}>DICOM</span>
                                </a>
                                <button type="button" title="ลบไฟล์"
                                  onClick={() => {
                                    const updated = [...xrayOrders];
                                    updated[i] = { ...updated[i], dicoms: (updated[i].dicoms ?? []).filter((_, x) => x !== di) };
                                    setXrayOrders(updated);
                                  }}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white items-center justify-center hidden group-hover/dcm:flex">
                                  <X className="w-2.5 h-2.5" strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
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
                    onClose={() => { setShowXRayOrderModal(false); setEditingXrayIdx(null); }}
                    editing={editingXrayIdx !== null ? xrayOrders[editingXrayIdx] : null}
                    onSubmit={(data) => {
                      if (editingXrayIdx !== null) {
                        setXrayOrders(prev => prev.map((item, idx) =>
                          idx === editingXrayIdx ? { ...item, ...data } : item
                        ));
                        showSnackbar("success", "แก้ไข X-Ray สำเร็จแล้ว");
                        setEditingXrayIdx(null);
                      } else {
                        setXrayOrders(prev => [...prev, { ...data, status: "รอ", films: [] }]);
                        showSnackbar("success", "สั่ง X-Ray สำเร็จแล้ว");
                      }
                    }}
                  />
                </section>
              </div>
            )}

            {/* ── 7. ใบสั่งยา ── */}
            {activeTab === TAB_PRESCRIPTION && (
              <>
              <div className="flex flex-col lg:flex-row gap-4 items-start pb-4">
                {/* ── ฟอร์มใบสั่งยา (ซ้าย) ── */}
                <div className="flex-1 min-w-0">
              <div className="space-y-4">
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <Pill className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ใบสั่งยา</h3>
                      <p className="text-[11px] text-gray-500">รายการยาและคำแนะนำการใช้ยา</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <DrugTemplatePicker
                        storageKey="vet-tpl-drug-set"
                        catalog={drugCatalog}
                        currentDrugs={drugItems.map(d => ({ name: d.name, genericName: d.genericName, qty: d.qty, unit: d.unit, price: d.price, instruction: d.instruction, indication: d.indication }))}
                        onApply={(presetDrugs, name) => {
                          setDrugItems(prev => {
                            let nextId = prev.length ? Math.max(...prev.map(d => d.id)) + 1 : 1;
                            const added = presetDrugs.map(d => {
                              const pd = d.perDay ?? d.qty;
                              const dd = d.days ?? 1;
                              return { ...d, genericName: d.genericName ?? "", id: nextId++, perDay: pd, days: dd, qty: drugQty(pd, dd), dispensed: drugQty(pd, dd), stockCut: true };
                            });
                            return [...prev, ...added];
                          });
                          showSnackbar("success", `เพิ่มชุดยา "${name}" แล้ว`);
                        }}
                        seed={[
                          { name: "ชุดท้องเสีย", drugs: [
                            { name: "เมโทรนิดาโซล 200mg", genericName: "Metronidazole 200mg", qty: 1, unit: "แผง", price: 95, instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 5 วัน", indication: "ท้องเสีย / ลำไส้อักเสบ" },
                            { name: "เมโทโคลพราไมด์ 10mg", genericName: "Metoclopramide 10mg", qty: 6, unit: "เม็ด", price: 8, instruction: "กินวันละ 3 ครั้ง ครั้งละ 0.5 เม็ด ก่อนอาหาร นาน 3 วัน", indication: "แก้คลื่นไส้ อาเจียน" },
                          ] },
                          { name: "ชุดถ่ายพยาธิ", drugs: [
                            { name: "ไอเวอร์เม็คติน 1%", genericName: "Ivermectin 1%", qty: 1, unit: "ml", price: 35, instruction: "ฉีดใต้ผิวหนัง 0.2 ml/kg ครั้งเดียว", indication: "กำจัดพยาธิ" },
                          ] },
                          { name: "ชุดภูมิแพ้ผิวหนัง", drugs: [
                            { name: "คลอร์เฟนิรามีน 4mg", genericName: "Chlorpheniramine 4mg", qty: 10, unit: "เม็ด", price: 5, instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 5 วัน", indication: "แพ้ / คัน" },
                            { name: "เพรดนิโซโลน 5mg", genericName: "Prednisolone 5mg", qty: 1, unit: "แผง", price: 80, instruction: "กินวันละ 1 ครั้ง ครั้งละ 0.5 เม็ด นาน 5 วัน", indication: "ลดการอักเสบ" },
                          ] },
                        ]}
                      />
                      <button
                        onClick={openRemedModal}
                        className="vet-btn vet-btn-secondary"
                        style={{ height: 32, padding: "0 14px", fontSize: "calc(12px * var(--fs))", color: "#0d7c66", borderColor: "rgba(25,165,137,0.35)" }}
                        title="ดึงยาจาก visit ก่อนหน้า — เลือกเฉพาะรายการที่ต้องการได้"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Remed ยาเดิม
                      </button>
                      <button
                        onClick={() => setShowAddDrugModal(true)}
                        className="vet-btn vet-btn-orange"
                        style={{ height: 32, padding: "0 14px", fontSize: "calc(12px * var(--fs))" }}
                      >
                        <Plus className="w-3.5 h-3.5" /> เพิ่มยา
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                  <div className="space-y-2 mb-4">
                    {drugItems.map((d, idx) => (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative rounded-2xl bg-white transition-all"
                        style={{
                          border: "1.5px solid #f3f4f6",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div className="p-3">
                          {/* Top row: index + name + actions */}
                          <div className="flex items-start gap-2.5">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] flex-shrink-0 tabular-nums"
                              style={{
                                background: "linear-gradient(135deg, #34d399, #059669)",
                                fontWeight: 700,
                                boxShadow: "0 2px 6px rgba(16,185,129,0.30), inset 0 1px 0 rgba(255,255,255,0.30)",
                              }}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[13.5px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>
                                  {d.genericName || d.name}
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{d.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {/* แก้ไข / ลบ (โผล่ตอน hover) */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingDrug(d)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0d7c66] hover:bg-[#19a589]/10 transition-colors"
                                  title="แก้ไข"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={async () => {
                                    const ok = await confirm({
                                      title: "ลบรายการยา",
                                      description: `ลบ "${d.genericName || d.name}" ออกจากใบสั่งยา?`,
                                      confirmLabel: "ลบ",
                                      kind: "danger",
                                    });
                                    if (!ok) return;
                                    setDrugItems(prev => prev.filter(item => item.id !== d.id));
                                    showSnackbar("delete", "ลบรายการยาแล้ว");
                                  }}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {/* จ่ายยา (ตัด) / ยกเลิกการจ่าย (คืน · ไม่ตัด) — ชิดขวาสุด */}
                              {!d.stockCut ? (
                                <button
                                  onClick={() => {
                                    setDrugItems(prev => prev.map(it => it.id === d.id ? { ...it, stockCut: true } : it));
                                    showSnackbar("success", `จ่ายยา "${d.genericName || d.name}" · ตัด Stock ${d.dispensed} ${d.unit} แล้ว`);
                                  }}
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] text-white transition-all active:scale-95 whitespace-nowrap"
                                  style={{ fontWeight: 600, background: "linear-gradient(135deg,#34d399,#059669)", boxShadow: "0 2px 6px rgba(16,185,129,0.28)" }}>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> จ่ายยา
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setDrugItems(prev => prev.map(it => it.id === d.id ? { ...it, stockCut: false } : it));
                                    showSnackbar("info", `ยกเลิกการจ่าย "${d.genericName || d.name}" · คืน Stock (ไม่ตัด)`);
                                  }}
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] transition-all active:scale-95 whitespace-nowrap"
                                  style={{ fontWeight: 600, color: "#dc2626", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.28)" }}>
                                  <RefreshCw className="w-3.5 h-3.5" /> ยกเลิกจ่าย
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Instruction */}
                          <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl" style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                            <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-[1px]" />
                            <span className="text-[12px] text-gray-700 leading-relaxed">{d.instruction}</span>
                          </div>

                          {/* HOSxP columns: Day · เบิก · จ่าย · ราคา · รวม */}
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            {/* Day */}
                            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.08)", color: "#1d4ed8", border: "1px solid rgba(37,99,235,0.20)", fontWeight: 700 }}>
                              <CalendarDays className="w-3 h-3" />
                              Day {d.days} · {d.perDay} {d.unit}/วัน
                            </span>
                            {/* จำนวนเบิก */}
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-600 px-2 py-0.5 rounded-full bg-gray-100" style={{ fontWeight: 600 }}>
                              เบิก <span className="text-gray-900" style={{ fontWeight: 700 }}>{d.qty}</span> {d.unit}
                            </span>
                            {/* จำนวนจ่าย */}
                            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: d.dispensed !== d.qty ? "rgba(234,88,12,0.10)" : "rgba(25,165,137,0.08)", color: d.dispensed !== d.qty ? "#c2410c" : "#0d7c66", border: `1px solid ${d.dispensed !== d.qty ? "rgba(234,88,12,0.25)" : "rgba(25,165,137,0.18)"}`, fontWeight: 700 }}>
                              จ่าย {d.dispensed} {d.unit}
                            </span>
                            {/* ราคา */}
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-600 px-2 py-0.5 rounded-full bg-gray-100" style={{ fontWeight: 600 }}>
                              ฿{d.price.toLocaleString()}<span className="text-gray-400">/หน่วย</span>
                            </span>
                            {/* สถานะการตัด Stock — ต่อท้ายราคา/หน่วย */}
                            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full whitespace-nowrap"
                              style={d.stockCut
                                ? { background: "rgba(22,163,74,0.10)", color: "#15803d", border: "1px solid rgba(22,163,74,0.28)", fontWeight: 700 }
                                : { background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.25)", fontWeight: 700 }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.stockCut ? "#16a34a" : "#dc2626" }} />
                              {d.stockCut ? "ตัด Stock แล้ว" : "ยังไม่ตัด Stock"}
                            </span>
                            <div className="ml-auto flex items-baseline gap-1 flex-shrink-0">
                              <span className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>รวม</span>
                              <span className="text-[16px] text-[#0d7c66]" style={{ fontWeight: 800, letterSpacing: "-0.3px" }}>฿{(d.price * d.dispensed).toLocaleString()}</span>
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
                  <div className="flex items-center justify-start pt-4 border-t border-gray-100 flex-wrap gap-2">
                    <button className="vet-btn vet-btn-secondary" style={{ height: 36, fontSize: "calc(12px * var(--fs))", padding: "0 14px" }}><Printer className="w-3.5 h-3.5" />พิมพ์ใบสั่งยา</button>
                    <button onClick={() => { setShowStickerModal(true); setStickerSelected(drugItems.map(d => d.id)); }} className="vet-btn vet-btn-secondary" style={{ height: 36, fontSize: "calc(12px * var(--fs))", padding: "0 14px" }}><Printer className="w-3.5 h-3.5" />พิมพ์สติ๊กเกอร์ยา</button>
                  </div>
                  </div>
                </section>
              </div>
                </div>{/* end flex-1 form wrapper */}

                {/* ── ประวัติยาเดิม (ขวา) ── */}
                <div className="hidden lg:block w-[420px] flex-shrink-0">
                  <section
                    className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                  >
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                        <Pill className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ประวัติยาเดิม</h3>
                          <span
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                            style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700, border: "1px solid rgba(25,165,137,0.20)" }}
                          >
                            8 รายการ
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">รายการยาที่เคยจ่าย · คลิกเพื่อดูรายละเอียด</p>
                      </div>
                    </div>

                    <div className="p-2 space-y-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                      {[
                        { date: "10 มี.ค. 69", drugName: "อะม็อกซิซิลลิน 250mg", qty: "2 แผง (28 เม็ด)", instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 7 วัน", indication: "ติดเชื้อแบคทีเรีย", vet: "สพ.ว. สมชาย", status: "จ่ายแล้ว", note: "", refillable: false },
                        { date: "10 มี.ค. 69", drugName: "เพรดนิโซโลน 5mg", qty: "1 แผง (10 เม็ด)", instruction: "กินวันละ 1 ครั้ง ครั้งละ 0.5 เม็ด นาน 5 วัน", indication: "ลดการอักเสบ", vet: "สพ.ว. สมชาย", status: "จ่ายแล้ว", note: "ลดขนาดยาก่อนหยุด", refillable: false },
                        { date: "22 ก.พ. 69", drugName: "เมโทรนิดาโซล 250mg", qty: "1 แผง (10 เม็ด)", instruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 5 วัน", indication: "ท้องเสีย ติดเชื้อ", vet: "สพ.ว. วรรณา", status: "จ่ายแล้ว", note: "", refillable: false },
                        { date: "22 ก.พ. 69", drugName: "สารน้ำทดแทน ORS", qty: "3 ซอง", instruction: "ละลายในน้ำ 200ml ให้กินเรื่อย ๆ", indication: "ขาดน้ำ", vet: "สพ.ว. วรรณา", status: "จ่ายแล้ว", note: "", refillable: true },
                        { date: "5 ม.ค. 69", drugName: "ไอเวอร์เมคติน 0.1%", qty: "1 หลอด", instruction: "หยดหลังคอ 1 ครั้ง ทุก 2 สัปดาห์ x3 ครั้ง", indication: "พยาธิหนอนหัวใจ ป้องกัน", vet: "สพ.ว. สมชาย", status: "จ่ายแล้ว", note: "ครั้งที่ 3/3", refillable: false },
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
                  </section>
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
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
                              สั่งซ้ำได้
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
                      perDay: item.perDay,
                      days: item.days,
                      qty: drugQty(item.perDay, item.days),
                      dispensed: drugQty(item.perDay, item.days),
                      unit: item.drug.unit,
                      price: item.pricePerUnit,
                      instruction: item.instruction,
                      indication: item.indication,
                      stockCut: true,
                    }));
                    setDrugItems(prev => [...prev, ...newDrugs]);
                    showSnackbar("success", "เพิ่มรายการยา · ตัด Stock แล้ว");
                  }}
                />
                <EditDrugModal
                  item={editingDrug}
                  onClose={() => setEditingDrug(null)}
                  onSave={(updated) => {
                    setDrugItems(prev => prev.map(item => item.id === updated.id ? updated : item));
                    setEditingDrug(null);
                    showSnackbar("success", "แก้ไขรายการยาแล้ว");
                  }}
                />

                {/* ── Remed ยาเดิม: เลือกรายการจาก visit ก่อนหน้า ── */}
                {showRemedModal && createPortal(
                  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setShowRemedModal(false)}>
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="relative w-full max-w-[520px] bg-white rounded-3xl overflow-hidden flex flex-col"
                      style={{ maxHeight: "min(640px, calc(100vh - 2rem))", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}
                      onClick={e => e.stopPropagation()}>
                      {/* header */}
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#34d399,#0d7c66)", boxShadow: "0 2px 8px rgba(13,124,102,0.3)" }}>
                          <RefreshCw className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] text-gray-900" style={{ fontWeight: 800 }}>Remed ยาเดิม</h3>
                          <p className="text-[11.5px] text-gray-500 mt-0.5">{REMED_PREVIOUS.visitLabel} · เลือกเฉพาะรายการที่ต้องการ</p>
                        </div>
                        <button onClick={() => setShowRemedModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* เลือกทั้งหมด / ไม่เลือกทั้งหมด */}
                      <div className="px-5 py-2 border-b border-gray-50 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const selectable = REMED_PREVIOUS.drugs
                                .map((d, i) => ({ d, i }))
                                .filter(({ d }) => !drugItems.some(x => x.name === d.name))
                                .map(({ i }) => i);
                              setRemedSelected(selectable);
                            }}
                            className="text-[11.5px] px-2.5 py-1 rounded-full transition-colors"
                            style={{ fontWeight: 600, color: "#0d7c66", background: "rgba(25,165,137,0.10)", border: "1px solid rgba(25,165,137,0.25)" }}>
                            เลือกทั้งหมด
                          </button>
                          <button
                            onClick={() => setRemedSelected([])}
                            disabled={remedSelected.length === 0}
                            className="text-[11.5px] px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
                            style={{ fontWeight: 600, color: "#6b7280", background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                            ไม่เลือกทั้งหมด
                          </button>
                        </div>
                        <span className="text-[11.5px] text-gray-500" style={{ fontWeight: 600 }}>เลือกแล้ว {remedSelected.length} รายการ</span>
                      </div>

                      {/* รายการยาเดิม */}
                      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {REMED_PREVIOUS.drugs.map((d, i) => {
                          const inRx = drugItems.some(x => x.name === d.name);
                          const on = remedSelected.includes(i);
                          return (
                            <button key={i} disabled={inRx}
                              onClick={() => setRemedSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                              className="w-full flex items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50/70 disabled:cursor-not-allowed"
                              style={{ background: on ? "rgba(25,165,137,0.05)" : undefined, opacity: inRx ? 0.5 : 1 }}>
                              <span className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 border transition-colors mt-0.5"
                                style={{ background: on ? "#19a589" : "#fff", borderColor: on ? "#19a589" : "#d1d5db" }}>
                                {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>{d.name}</p>
                                  {inRx && <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontWeight: 600 }}>มีในใบยาแล้ว</span>}
                                </div>
                                <p className="text-[11px] text-gray-400">{d.genericName}</p>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600, background: "rgba(59,130,246,0.08)", color: "#2563eb" }}>
                                    Day {d.days} · {d.perDay} {d.unit}/วัน
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600, background: "rgba(25,165,137,0.08)", color: "#0d7c66" }}>
                                    รวม {drugQty(d.perDay, d.days)} {d.unit}
                                  </span>
                                  <span className="text-[10px] text-gray-400">฿{d.price}/{d.unit}</span>
                                </div>
                                <p className="text-[10.5px] text-gray-400 mt-0.5 truncate">{d.instruction}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* footer */}
                      <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
                        <button onClick={() => setShowRemedModal(false)} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                        <button onClick={applyRemed} disabled={remedSelected.length === 0}
                          className="vet-btn vet-btn-primary btn-green inline-flex items-center gap-1.5 disabled:opacity-40">
                          <RefreshCw className="w-3.5 h-3.5" /> Remed ที่เลือก ({remedSelected.length})
                        </button>
                      </div>
                    </motion.div>
                  </div>,
                  document.body
                )}

              </>
            )}

            {/* ── หัตถการ (แบบ IPD) ── */}
            {activeTab === TAB_PROCEDURES && (
              <ProceduresTab storageKey={`vet-opd-procedures-${rec.hn}`} />
            )}

            {/* ── 8. ค่าบริการ ── */}
            {activeTab === TAB_SERVICE && (
              <>
              <div className="flex flex-col lg:flex-row gap-4 items-start pb-4">
                {/* ── ฟอร์มค่าบริการ (ซ้าย) ── */}
                <div className="flex-1 min-w-0">
              <div className="space-y-4">
                <section
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                      <Receipt className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ค่าบริการ</h3>
                      <p className="text-[11px] text-gray-500">รายการบริการและค่าใช้จ่าย</p>
                    </div>
                    <button
                      onClick={() => setShowAddServiceModal(true)}
                      className="vet-btn vet-btn-orange"
                      style={{ height: 32, padding: "0 14px", fontSize: "calc(12px * var(--fs))" }}
                    >
                      <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
                    </button>
                  </div>

                  <div className="p-5">
                  <div className="space-y-2">
                    {serviceItems.map((s, idx) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative rounded-2xl bg-white transition-all"
                        style={{
                          border: "1.5px solid #f3f4f6",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div className="p-3">
                          {/* Top row: index + name + actions */}
                          <div className="flex items-start gap-2.5">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] flex-shrink-0 tabular-nums"
                              style={{
                                background: "linear-gradient(135deg, #34d399, #059669)",
                                fontWeight: 700,
                                boxShadow: "0 2px 6px rgba(16,185,129,0.30), inset 0 1px 0 rgba(255,255,255,0.30)",
                              }}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[13.5px] text-gray-900 block truncate" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>
                                {s.name}
                              </span>
                              <span className="text-[11px] text-gray-500 block truncate" style={{ fontWeight: 500 }}>{s.unit}</span>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingService(s)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0d7c66] hover:bg-[#19a589]/10 transition-colors"
                                title="แก้ไข"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  const ok = await confirm({
                                    title: "ลบรายการค่าบริการ",
                                    description: `ลบ "${s.name}" ออกจากรายการ?`,
                                    confirmLabel: "ลบ",
                                    kind: "danger",
                                  });
                                  if (!ok) return;
                                  setServiceItems(prev => prev.filter(item => item.id !== s.id));
                                  showSnackbar("delete", "ลบรายการบริการแล้ว");
                                }}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                title="ลบ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Qty · Price · Discount · Total row */}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-600 px-2 py-0.5 rounded-full" style={{ background: "rgba(25,165,137,0.08)", border: "1px solid rgba(25,165,137,0.18)", fontWeight: 600 }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#19a589]" />
                              {s.qty} {s.unit}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-600 px-2 py-0.5 rounded-full bg-gray-100" style={{ fontWeight: 600 }}>
                              ฿{s.price.toLocaleString()}<span className="text-gray-400">/หน่วย</span>
                            </span>
                            {s.discount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "#dc2626", fontWeight: 700 }}>
                                -฿{s.discount.toLocaleString()}
                              </span>
                            )}
                            <div className="ml-auto flex items-baseline gap-1 flex-shrink-0">
                              <span className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>รวม</span>
                              <span className="text-[16px] text-[#0d7c66]" style={{ fontWeight: 800, letterSpacing: "-0.3px" }}>฿{(s.price * s.qty - s.discount).toLocaleString()}</span>
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
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button className="vet-btn vet-btn-secondary" style={{ height: 36, fontSize: "calc(12px * var(--fs))", padding: "0 14px" }}><Printer className="w-3.5 h-3.5" />พิมพ์ใบสรุปค่ารักษา</button>
                  </div>
                  </div>
                </section>
              </div>
                </div>{/* end flex-1 form wrapper */}

                {/* ── ประวัติค่าบริการเดิม (ขวา) ── */}
                <div className="hidden lg:block w-[420px] flex-shrink-0">
                  <section
                    className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                  >
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                        <Receipt className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ประวัติค่าบริการ</h3>
                          <span
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                            style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700, border: "1px solid rgba(25,165,137,0.20)" }}
                          >
                            5 ครั้งล่าสุด
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">รายการค่ารักษาก่อนหน้า</p>
                      </div>
                    </div>

                    <div className="p-2 space-y-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                      {[
                        { date: "10 มี.ค. 69", items: [{ name: "ค่าตรวจ", price: 300 }, { name: "ตรวจเลือด (CBC)", price: 400 }, { name: "น้ำเกลือ x2", price: 500 }], total: 1200, vet: "สพ.ว. สมชาย", status: "ชำระแล้ว" },
                        { date: "22 ก.พ. 69", items: [{ name: "ค่าตรวจ", price: 300 }, { name: "ตรวจอุจจาระ", price: 200 }, { name: "ฉีดยา", price: 150 }], total: 650, vet: "สพ.ว. วรรณา", status: "ชำระแล้ว" },
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
                  </section>
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
                <EditServiceModal
                  item={editingService}
                  onClose={() => setEditingService(null)}
                  onSave={(updated) => {
                    setServiceItems(prev => prev.map(item => item.id === updated.id ? updated : item));
                    setEditingService(null);
                    showSnackbar("success", "แก้ไขรายการบริการแล้ว");
                  }}
                />
              </>
            )}

            {/* ── 8.5 ชำระเงิน ── */}
            {activeTab === TAB_PAYMENT && (() => {
              const billItems = [
                ...serviceItems.map(s => ({ id: `s-${s.id}`, name: s.name, category: "บริการ", qty: s.qty, reqQty: s.qty, unit: s.unit, price: s.price, discount: s.discount, days: 0, perDay: 0 })),
                ...drugItems.map(d => ({ id: `d-${d.id}`, name: d.name, category: "ยา", qty: d.dispensed, reqQty: d.qty, unit: d.unit, price: d.price, discount: 0, days: d.days, perDay: d.perDay })),
              ];
              const billSubtotal = billItems.reduce((s, i) => s + (i.price * i.qty - i.discount), 0);
              const afterDisc = Math.max(0, billSubtotal - payDiscountAmt);
              const vatAmt = payIncludeVat ? Math.round(afterDisc * 7 / 107) : Math.round(afterDisc * 0.07);
              const billTotal = payIncludeVat ? afterDisc : afterDisc + vatAmt;
              const cashReceivedNum = parseFloat(payCashReceived) || 0;
              const cashChange = Math.max(0, cashReceivedNum - billTotal);
              const quickDiscounts = [
                { label: "สมาชิก VIP 10%", type: "pct" as const, value: 10 },
                { label: "สมาชิก Gold 5%", type: "pct" as const, value: 5 },
                { label: "ส่วนลดพิเศษ ฿100", type: "fix" as const, value: 100 },
                { label: "โปรวัคซีน 15%", type: "pct" as const, value: 15 },
              ];
              const PAY_METHODS = [
                { id: "cash" as const,     label: "เงินสด",           Icon: Banknote   },
                { id: "card" as const,     label: "บัตรเครดิต/เดบิต", Icon: CreditCard },
                { id: "transfer" as const, label: "โอนเงิน",           Icon: Smartphone },
                { id: "qr" as const,       label: "PromptPay QR",      Icon: QrCode    },
              ];
              return (
                <div className="space-y-4 pb-4">
                  {/* Status banner */}
                  <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>{payCompleted ? "ชำระเงินเรียบร้อยแล้ว" : "ยังไม่ชำระ"}</p>
                      <p className="text-[12px] text-gray-500">{billItems.length} รายการ · รวม ฿{billTotal.toLocaleString()}</p>
                    </div>
                    {payCompleted && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11.5px]" style={{ fontWeight: 700, background: "rgba(25,165,137,0.12)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.30)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> ชำระแล้ว
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    {/* LEFT — Bill summary */}
                    <div className="flex-1 min-w-0 w-full space-y-4">
                      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                            <Receipt className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>สรุปบิล</h3>
                            <p className="text-[11px] text-gray-500">{billItems.length} รายการ</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[12px] min-w-[640px]">
                            <thead>
                              <tr className="bg-gray-50/60 text-gray-500 text-[10.5px]" style={{ fontWeight: 600 }}>
                                <th className="text-left px-4 py-2">รายการ</th>
                                <th className="text-center px-2 py-2">หมวด</th>
                                <th className="text-center px-2 py-2">จำนวน</th>
                                <th className="text-right px-2 py-2">ราคา/หน่วย</th>
                                <th className="text-right px-2 py-2">ส่วนลด</th>
                                <th className="text-right px-4 py-2">รวม</th>
                              </tr>
                            </thead>
                            <tbody>
                              {billItems.map(it => {
                                const lineTotal = it.price * it.qty - it.discount;
                                return (
                                  <tr key={it.id} className="border-t border-gray-50">
                                    <td className="px-4 py-2.5">
                                      <p className="text-gray-900 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                                        {it.name}
                                        {it.days > 0 && (
                                          <span className="inline-flex items-center gap-0.5 text-[9.5px] text-[#1d4ed8] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.08)", fontWeight: 700 }}>
                                            <CalendarDays className="w-2.5 h-2.5" />{it.days} วัน
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-[10.5px] text-gray-400">฿{it.price} / {it.unit}{it.days > 0 ? ` · ${it.perDay}/วัน × ${it.days} วัน` : ""}</p>
                                      {it.days > 0 && (
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                          เบิก {it.reqQty} · <span className="text-[#0d7c66]" style={{ fontWeight: 700 }}>จ่าย {it.qty}</span> {it.unit}
                                        </p>
                                      )}
                                    </td>
                                    <td className="px-2 py-2.5 text-center">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px]" style={{ fontWeight: 700, background: it.category === "ยา" ? "rgba(96,165,250,0.10)" : "rgba(25,165,137,0.10)", color: it.category === "ยา" ? "#1d4ed8" : "#0d7c66" }}>
                                        {it.category}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2.5 text-center text-gray-700">{it.qty}</td>
                                    <td className="px-2 py-2.5 text-right text-gray-700">฿{it.price.toLocaleString()}</td>
                                    <td className="px-2 py-2.5 text-right text-rose-600">{it.discount > 0 ? `-฿${it.discount.toLocaleString()}` : "—"}</td>
                                    <td className="px-4 py-2.5 text-right text-gray-900" style={{ fontWeight: 700 }}>฿{lineTotal.toLocaleString()}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      {/* ── ยาแยกรายวัน (HOSxP) — เห็นเป็นวันๆ ── */}
                      {drugItems.length > 0 && (() => {
                        const maxDays = Math.max(1, ...drugItems.map(d => d.days || 1));
                        const dayRows = Array.from({ length: maxDays }, (_, i) => {
                          const dayNo = i + 1;
                          const active = drugItems.filter(d => dayNo <= (d.days || 1));
                          const dayCost = active.reduce((s, d) => s + d.perDay * d.price, 0);
                          return { dayNo, active, dayCost };
                        });
                        const daysTotal = dayRows.reduce((s, r) => s + r.dayCost, 0);
                        return (
                          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <button onClick={() => setPayDaysOpen(o => !o)} className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100/80 hover:bg-gray-50/40 transition-colors">
                              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(25,165,137,0.10))" }}>
                                <CalendarDays className="w-[18px] h-[18px] text-[#1d4ed8]" strokeWidth={2.2} />
                              </div>
                              <div className="flex-1 text-left">
                                <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>ยาแยกรายวัน</h3>
                                <p className="text-[11px] text-gray-500">คอร์สยา {maxDays} วัน · รวมค่ายา ฿{daysTotal.toLocaleString()}</p>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${payDaysOpen ? "rotate-180" : ""}`} />
                            </button>
                            {payDaysOpen && (
                              <div className="divide-y divide-gray-50">
                                {dayRows.map(({ dayNo, active, dayCost }) => (
                                  <div key={dayNo} className="flex items-start gap-3 px-4 py-2.5">
                                    <div className="flex-shrink-0 w-14 pt-0.5">
                                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px] text-white" style={{ fontWeight: 700, background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>วันที่ {dayNo}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-wrap gap-1.5">
                                      {active.map(d => (
                                        <span key={d.id} className="inline-flex items-center gap-1 text-[10.5px] text-gray-600 px-2 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.20)", fontWeight: 600 }}>
                                          {d.genericName || d.name} · {d.perDay} {d.unit}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="flex-shrink-0 text-[12px] text-gray-900 pt-0.5" style={{ fontWeight: 700 }}>฿{dayCost.toLocaleString()}</span>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0fdf9]">
                                  <span className="text-[12px] text-gray-600" style={{ fontWeight: 600 }}>รวมค่ายาทั้งคอร์ส ({maxDays} วัน)</span>
                                  <span className="text-[15px] text-[#0d7c66]" style={{ fontWeight: 800 }}>฿{daysTotal.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                          </section>
                        );
                      })()}

                      {/* Discount panel */}
                      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-500" />
                          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(13px * var(--fs))" }}>ส่วนลดบิล</h3>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500 mb-1.5">ส่วนลดสำเร็จรูป</p>
                          <div className="flex flex-wrap gap-1.5">
                            {quickDiscounts.map(d => {
                              const active = payDiscountReason === d.label;
                              return (
                                <button
                                  key={d.label}
                                  onClick={() => {
                                    const v = d.type === "pct" ? Math.round(billSubtotal * d.value / 100) : d.value;
                                    setPayDiscountAmt(v); setPayDiscountReason(d.label);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 rounded-full text-[11.5px] transition-colors"
                                  style={{
                                    fontWeight: active ? 700 : 600,
                                    color: active ? "#ffffff" : "#6b7280",
                                    background: active ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#f3f4f6",
                                    border: active ? "1px solid #0d7c66" : "1px solid transparent",
                                  }}
                                >{d.label}</button>
                              );
                            })}
                          </div>
                        </div>
                        {payDiscountAmt > 0 && (
                          <div className="flex items-center justify-between text-[12px] bg-rose-50/60 border border-rose-100 rounded-xl px-3 py-2">
                            <span className="text-rose-700" style={{ fontWeight: 600 }}>{payDiscountReason}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-rose-700" style={{ fontWeight: 700 }}>-฿{payDiscountAmt.toLocaleString()}</span>
                              <button onClick={() => { setPayDiscountAmt(0); setPayDiscountReason(""); }} className="w-6 h-6 rounded-full hover:bg-rose-100 flex items-center justify-center text-rose-500" title="ยกเลิก"><X className="w-3 h-3" /></button>
                            </div>
                          </div>
                        )}
                      </section>

                      {/* VAT toggle */}
                      <section className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(13px * var(--fs))" }}>ภาษีมูลค่าเพิ่ม (VAT 7%)</h3>
                          <p className="text-[11px] text-gray-500">{payIncludeVat ? "ยอดในบิลรวม VAT แล้ว" : "บวก VAT เพิ่มจากยอดบิล"}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                          {[{v: true, l: "รวม VAT"}, {v: false, l: "ไม่รวม VAT"}].map(o => {
                            const active = payIncludeVat === o.v;
                            return (
                              <button key={String(o.v)} onClick={() => setPayIncludeVat(o.v)} className="px-3 py-1.5 rounded-full text-[11.5px] transition-colors" style={{ fontWeight: active ? 700 : 600, color: active ? "#ffffff" : "#6b7280", background: active ? "linear-gradient(135deg,#19a589,#0d7c66)" : "transparent" }}>{o.l}</button>
                            );
                          })}
                        </div>
                      </section>
                    </div>

                    {/* RIGHT — Payment methods + total */}
                    <div className="w-full lg:w-[360px] flex-shrink-0 space-y-4 lg:sticky lg:top-4">
                      <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5">
                        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(13px * var(--fs))" }}>สรุปยอด</h3>
                        <div className="flex justify-between text-[12px]"><span className="text-gray-500">ยอดรวมรายการ</span><span className="text-gray-800">฿{billSubtotal.toLocaleString()}</span></div>
                        {payDiscountAmt > 0 && <div className="flex justify-between text-[12px]"><span className="text-rose-600">ส่วนลด</span><span className="text-rose-600">-฿{payDiscountAmt.toLocaleString()}</span></div>}
                        <div className="flex justify-between text-[12px]"><span className="text-gray-500">{payIncludeVat ? "VAT 7% (รวมในยอด)" : "VAT 7%"}</span><span className="text-gray-700">฿{vatAmt.toLocaleString()}</span></div>
                        <div className="flex justify-between pt-2 border-t border-gray-100"><span className="text-gray-900 text-[13px]" style={{ fontWeight: 700 }}>ยอดที่ต้องชำระ</span><span className="text-[#19a589] text-[18px]" style={{ fontWeight: 800 }}>฿{billTotal.toLocaleString()}</span></div>
                      </section>

                      <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(13px * var(--fs))" }}>วิธีชำระเงิน</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {PAY_METHODS.map(m => {
                            const active = payMethod === m.id;
                            return (
                              <button key={m.id} onClick={() => setPayMethod(m.id)} className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-[11.5px] transition-all" style={{
                                fontWeight: active ? 700 : 600,
                                color: active ? "#0d7c66" : "#6b7280",
                                background: active ? "rgba(25,165,137,0.10)" : "#f9fafb",
                                border: `1.5px solid ${active ? "rgba(25,165,137,0.40)" : "#e5e7eb"}`,
                              }}>
                                <m.Icon className="w-5 h-5" />
                                {m.label}
                              </button>
                            );
                          })}
                        </div>
                        {payMethod === "cash" && (
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <label className="vet-label">รับเงินสด</label>
                            <input type="number" value={payCashReceived} onChange={e => setPayCashReceived(e.target.value)} placeholder={String(billTotal)} className="vet-input" />
                            {cashReceivedNum > 0 && (
                              <div className="text-[11px] flex justify-between bg-emerald-50 px-3 py-2 rounded-lg">
                                <span className="text-emerald-700">เงินทอน</span>
                                <span className="text-emerald-700" style={{ fontWeight: 700 }}>฿{cashChange.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => { setPayCompleted(true); showSnackbar("success", "ชำระเงินสำเร็จแล้ว"); }}
                          disabled={payCompleted || billTotal === 0 || (payMethod === "cash" && cashReceivedNum < billTotal)}
                          className="w-full vet-btn vet-btn-primary inline-flex items-center justify-center gap-1.5"
                          style={{ height: 44 }}
                        >
                          <CheckCircle2 className="w-4 h-4" /> {payCompleted ? "ชำระเรียบร้อย" : "ยืนยันชำระเงิน"}
                        </button>
                        <button onClick={() => showSnackbar("info", "พิมพ์ใบเสร็จ")} className="w-full vet-btn vet-btn-secondary inline-flex items-center justify-center gap-1.5">
                          <Printer className="w-3.5 h-3.5" /> พิมพ์ใบเสร็จ
                        </button>
                      </section>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── 9. นัดหมาย ── */}
            {activeTab === TAB_APPOINTMENT && (
              <div className="space-y-4 pb-4">
                {/* ── รายการนัดหมาย (List View) ── */}
                {!showAppointmentForm && (
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    {/* ── ฝั่งซ้าย: นัดหมายที่กำลังจะถึง ── */}
                    <div className="flex-1 min-w-0 space-y-4">
                    <section
                      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                    >
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                          <Calendar className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>รายการนัดหมาย</h3>
                          <p className="text-[11px] text-gray-500">กำลังจะถึง {upcomingAppts.length} รายการ</p>
                        </div>
                        <button
                          onClick={() => setShowAppointmentForm(true)}
                          className="vet-btn vet-btn-orange"
                          style={{ height: 32, padding: "0 14px", fontSize: "calc(12px * var(--fs))" }}
                        >
                          <Plus className="w-3.5 h-3.5" /> เพิ่มนัดใหม่
                        </button>
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
                          <p className="text-xs mt-1">กดปุ่ม "เพิ่มนัดใหม่" เพื่อสร้างนัด</p>
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
                                {/* Delete appointment */}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const ok = await confirm({
                                      title: "ลบนัดหมาย",
                                      description: `ลบนัด "${appt.type}" วันที่ ${appt.day} ${appt.month} ${appt.year}?`,
                                      confirmLabel: "ลบ",
                                      kind: "danger",
                                    });
                                    if (!ok) return;
                                    setUpcomingAppts(prev => prev.filter(a => a.id !== appt.id));
                                    showSnackbar("delete", "ลบนัดหมายแล้ว");
                                  }}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full border transition-all active:scale-95 flex-shrink-0 bg-gray-50 text-gray-400 border-gray-200/60 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200/60"
                                  title="ลบนัดหมาย"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Meta chips */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-[3px] rounded-md">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span style={{ fontWeight: 500 }}>{appt.time ? `${appt.time} น.` : "ไม่ระบุเวลา"}</span>
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
                    </section>
                    </div>{/* end left column */}

                    {/* ── ฝั่งขวา: ประวัตินัดหมายที่ผ่านมา ── */}
                    <div className="hidden lg:block w-[420px] flex-shrink-0">
                    <section
                      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
                    >
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                          <Clock className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ประวัตินัดหมาย</h3>
                            <span
                              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                              style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700, border: "1px solid rgba(25,165,137,0.20)" }}
                            >
                              5 รายการ
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">นัดหมายที่ผ่านมา · มาตามนัด/ผิดนัด</p>
                        </div>
                      </div>

                      {/* Timeline list */}
                      <div className="p-2 space-y-0 max-h-[calc(100vh-220px)] overflow-y-auto">
                      {[
                        { day: "15", month: "ก.พ.", year: "2569", time: "10:00", type: "ตรวจติดตามอาการ", doctor: rec.doctor, icon: "🩺", status: "มาตามนัด", statusCls: "bg-[#19a589]/8 text-[#0d7c66]", room: "ห้อง 1 — ทั่วไป", note: "ตรวจผลเลือดหลังให้ยา ค่าตับกลับสู่ปกติ", duration: "30 นาที", cost: "1,200", isCancel: false },
                        { day: "20", month: "ม.ค.", year: "2569", time: "09:30", type: "ฉีดวัคซีน DHPP", doctor: rec.doctor, icon: "💉", status: "มาตามนัด", statusCls: "bg-[#19a589]/8 text-[#0d7c66]", room: "ห้อง 1 — ทั่วไป", note: "ฉีดวัคซีนกระตุ้น DHPP ครั้งที่ 2", duration: "15 นาที", cost: "850", isCancel: false },
                        { day: "05", month: "ม.ค.", year: "2569", time: "14:00", type: "ตรวจสุขภาพประจำปี", doctor: rec.doctor, icon: "📋", status: "ผิดนัด", statusCls: "bg-red-50 text-red-500", room: "ห้อง 2 — ศัลยกรรม", note: "เจ้าของแจ้งยกเลิก — ติดธุระ", duration: "-", cost: "0", isCancel: true },
                        { day: "10", month: "ธ.ค.", year: "2568", time: "11:00", type: "ตรวจทันตกรรม", doctor: rec.doctor, icon: "🦷", status: "มาตามนัด", statusCls: "bg-[#19a589]/8 text-[#0d7c66]", room: "ห้อง 1 — ทั่วไป", note: "ขูดหินปูนและถอนฟันน้ำนม 2 ซี่", duration: "45 นาที", cost: "3,500", isCancel: false },
                        { day: "25", month: "พ.ย.", year: "2568", time: "10:30", type: "อาบน้ำ / ตัดขน", doctor: rec.doctor, icon: "✂️", status: "มาตามนัด", statusCls: "bg-[#19a589]/8 text-[#0d7c66]", room: "ห้อง Grooming", note: "อาบน้ำ ตัดขน ตัดเล็บ ทำความสะอาดหู", duration: "1 ชม.", cost: "900", isCancel: false },
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
                    </section>
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
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
                      onClick={() => setShowAppointmentForm(false)}
                    />
                    <div key="appt-popup-content" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 28, stiffness: 320 }}
                        className="bg-white rounded-3xl w-full max-w-[860px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto max-h-[92vh]"
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

                        {/* Body — 2 columns */}
                        <div className="overflow-y-auto flex-1 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">

                            {/* ─── LEFT: Calendar + shortcuts + time grid ─── */}
                            <div className="space-y-4 min-w-0">
                              <div>
                                <label className={labelCls} style={{ fontWeight: 500 }}>วันนัดหมาย <span className="text-red-400">*</span></label>
                                <VisitsMiniCalendar value={apptForm.date} onChange={v => setApptForm(p => ({ ...p, date: v }))} />
                              </div>

                              <div>
                                <label className={labelCls} style={{ fontWeight: 500 }}>นัด follow-up อีก…</label>
                                <FollowUpShortcuts value={apptForm.date} onChange={v => setApptForm(p => ({ ...p, date: v }))} />
                              </div>

                              <div>
                                <label className={labelCls} style={{ fontWeight: 500 }}>
                                  {(() => {
                                    const vet = VETS.find(v => v.name === apptForm.doctor);
                                    const avail = vetAvailableTimesOnDate(vet?.id, apptForm.date);
                                    if (!avail) return "เวลานัดหมาย *";
                                    if (avail.size === 0) return "เวลานัดหมาย · ไม่มีคิวว่าง";
                                    return `เวลานัดหมาย · ว่าง ${avail.size} คิว`;
                                  })()}
                                </label>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {(() => {
                                    const vet = VETS.find(v => v.name === apptForm.doctor);
                                    const avail = vetAvailableTimesOnDate(vet?.id, apptForm.date);
                                    return VISIT_TIMES.map(t => {
                                      const on = apptForm.time === t && !apptForm.noTime;
                                      const disabled = avail !== null && !avail.has(t);
                                      return (
                                        <button
                                          key={t}
                                          type="button"
                                          disabled={disabled}
                                          onClick={() => !disabled && setApptForm(p => ({ ...p, time: t, noTime: false }))}
                                          title={disabled ? "หมอไม่ได้เปิดคิวเวลานี้" : undefined}
                                          className="text-[11.5px] py-1.5 rounded-lg transition-colors disabled:cursor-not-allowed"
                                          style={{
                                            background: on ? "#0d7c66" : disabled ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.03)",
                                            color: on ? "#ffffff" : disabled ? "#d1d5db" : "#475569",
                                            fontWeight: on ? 700 : 500,
                                            textDecoration: disabled ? "line-through" : "none",
                                            opacity: disabled ? 0.55 : 1,
                                          }}
                                        >
                                          {t}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                                {/* ไม่ระบุเวลา — บันทึกนัดได้โดยไม่ต้องเลือกช่วงเวลา */}
                                <button
                                  type="button"
                                  onClick={() => setApptForm(p => ({ ...p, time: "", noTime: true }))}
                                  className="w-full mt-2 flex items-center justify-center gap-1.5 text-[12px] py-2 rounded-lg transition-colors"
                                  style={{
                                    background: apptForm.noTime ? "#0d7c66" : "rgba(0,0,0,0.03)",
                                    color: apptForm.noTime ? "#ffffff" : "#475569",
                                    fontWeight: apptForm.noTime ? 700 : 500,
                                    border: apptForm.noTime ? "1px solid #0d7c66" : "1px dashed rgba(0,0,0,0.15)",
                                  }}
                                >
                                  {apptForm.noTime && <Check className="w-3.5 h-3.5" />}
                                  ไม่ระบุเวลา
                                </button>
                              </div>
                            </div>

                            {/* ─── RIGHT: form fields ─── */}
                            <div className="space-y-4 min-w-0">
                              {/* Pet info card */}
                              <div>
                                <label className={labelCls} style={{ fontWeight: 500 }}>ผู้ป่วย</label>
                                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                                    <PawPrint className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{rec.pet}</p>
                                    <p className="text-[10.5px] text-gray-500 truncate">{rec.owner} · {formatPhone(rec.phone)}</p>
                                  </div>
                                  <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>OPD</span>
                                </div>
                              </div>

                              {/* ประเภทนัด + ห้องตรวจ */}
                              <div className="grid grid-cols-2 gap-3">
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
                                      <option>อาบน้ำ / ตัดขน</option>
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

                              {/* สัตวแพทย์ — rich picker with avatars + พร้อม/ไม่ว่าง */}
                              <div>
                                <label className={labelCls} style={{ fontWeight: 500 }}>สัตวแพทย์ผู้นัด</label>
                                <OpdVetPicker
                                  value={apptForm.doctor || ""}
                                  dateIso={apptForm.date}
                                  onChange={name => setApptForm(p => ({ ...p, doctor: name, time: "" }))}
                                />
                                {!apptForm.doctor && apptForm.date && (
                                  <p className="text-[10.5px] text-gray-400 mt-1.5" style={{ fontWeight: 500 }}>
                                    💡 เลือกแพทย์เพื่อดูคิวว่างจริงจากตารางหมอ
                                  </p>
                                )}
                              </div>

                              {/* หมายเหตุ */}
                              <div>
                                <label className={labelCls} style={{ fontWeight: 500 }}>หมายเหตุ / คำแนะนำก่อนมา</label>
                                <textarea
                                  rows={2}
                                  placeholder="เช่น งดอาหาร 8 ชั่วโมงก่อนผ่าตัด, นำสมุดวัคซีนมาด้วย..."
                                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all resize-none placeholder:text-gray-300"
                                  value={apptForm.note}
                                  onChange={e => setApptForm(p => ({ ...p, note: e.target.value }))}
                                />
                              </div>

                              {/* การแจ้งเตือน */}
                              <div className="border border-gray-100 rounded-2xl p-3 space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-[#19a589]" />
                                  <span className="text-[12.5px] text-gray-700" style={{ fontWeight: 600 }}>การแจ้งเตือนเจ้าของสัตว์</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { label: "SMS 1 วันก่อน", defaultChecked: true },
                                    { label: "Line 1 วันก่อน", defaultChecked: false },
                                    { label: "โทรยืนยันนัด", defaultChecked: false },
                                    { label: "แจ้งซ้ำในวันนัด", defaultChecked: true },
                                  ].map(opt => (
                                    <label key={opt.label} className="flex items-center gap-2 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        defaultChecked={opt.defaultChecked}
                                        className="w-3.5 h-3.5 rounded accent-[#19a589] cursor-pointer"
                                      />
                                      <span className="text-[11px] text-gray-600 group-hover:text-gray-800 transition-colors truncate">{opt.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
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
                            ยกเลิก
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
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
              <div className="space-y-4 pb-4">
                <EMRHistorySummary petName={rec.pet} hn={rec.hn} />
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
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
                    { label: "เวลาเดิม", value: rescheduleAppt.time ? `${rescheduleAppt.time} น.` : "ไม่ระบุเวลา", icon: <Clock className="w-3.5 h-3.5" /> },
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
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { from: today, to: today };
  });
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [visits, setVisits] = useState<VisitRecord[]>(mockVisits);
  const { showSnackbar: showListSnackbar } = useSnackbar();

  const statusOptions = [
    { label: "ทั้งหมด",   icon: ClipboardList, color: "#64748b", grad: "linear-gradient(135deg, #94a3b8, #475569)" },
    { label: "รอตรวจ",    icon: Clock,         color: "#f59e0b", grad: "linear-gradient(135deg, #fbbf24, #d97706)" },
    { label: "กำลังตรวจ", icon: Loader2,       color: "#0ea5e9", grad: "linear-gradient(135deg, #38bdf8, #0284c7)" },
    { label: "เสร็จสิ้น",  icon: CheckCircle2,  color: "#10b981", grad: "linear-gradient(135deg, #34d399, #059669)" },
  ];

  /* Date helpers */
  const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const isSameDay = (a?: Date, b?: Date) => !!a && !!b && a.toDateString() === b.toDateString();
  const todayBuddhist = (d: Date) =>
    `${d.getDate()} ${["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][d.getMonth()]} ${(d.getFullYear() + 543).toString().slice(2)}`;

  const dateLabel = (() => {
    const today = startOfDay(new Date());
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const { from, to } = dateRange;
    if (!from) return "เลือกวันที่";
    if (from && to && isSameDay(from, to)) {
      if (isSameDay(from, today)) return "วันนี้";
      if (isSameDay(from, yesterday)) return "เมื่อวาน";
      return todayBuddhist(from);
    }
    if (from && to) return `${todayBuddhist(from)} – ${todayBuddhist(to)}`;
    return todayBuddhist(from);
  })();

  const presets = [
    { label: "วันนี้",         compute: () => { const t = startOfDay(new Date()); return { from: t, to: t }; } },
    { label: "เมื่อวาน",       compute: () => { const t = startOfDay(new Date()); const y = new Date(t); y.setDate(t.getDate() - 1); return { from: y, to: y }; } },
    { label: "7 วันที่ผ่านมา", compute: () => { const t = startOfDay(new Date()); const f = new Date(t); f.setDate(t.getDate() - 6); return { from: f, to: t }; } },
    { label: "เดือนนี้",       compute: () => { const t = new Date(); return { from: startOfDay(new Date(t.getFullYear(), t.getMonth(), 1)), to: startOfDay(new Date(t.getFullYear(), t.getMonth() + 1, 0)) }; } },
  ];

  const today0 = startOfDay(new Date());
  const yesterday0 = new Date(today0); yesterday0.setDate(today0.getDate() - 1);
  const isToday    = isSameDay(dateRange.from, today0)     && isSameDay(dateRange.to, today0);
  const isYesterday = isSameDay(dateRange.from, yesterday0) && isSameDay(dateRange.to, yesterday0);
  const isFiltered = !isToday;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setShowDateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="flex flex-col flex-1 min-h-0 p-4 gap-4" style={{ background: "#FEFBF8" }}>
      {/* ─── HERO HEADER (LIST page) ─── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl"
      >
        {/* Background + ambient decoration layer — clipped */}
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
          {/* Top: Title */}
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
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: "calc(22px * var(--fs))", letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                {t("visits.title")}
              </h1>
              <p className="text-white/70" style={{ fontSize: "calc(12px * var(--fs))", letterSpacing: "0.1px" }}>{t("visits.subtitle")}</p>
            </div>

            {/* Register button — top-right like Stock */}
            <button
              onClick={() => setRegisterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 flex-shrink-0 text-white cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                border: "1px solid rgba(253,186,116,0.85)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.15), 0 6px 22px rgba(234,88,12,0.65)",
                fontWeight: 600,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              <Plus className="w-3.5 h-3.5" /> ลงทะเบียนสัตว์
            </button>
          </div>

          {/* Bottom: Search + Status filters + Register button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search — solid white */}
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อสัตว์, เจ้าของ, HN..."
                className="w-full pl-9 pr-3 py-2 text-[13px] rounded-full text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              />
            </div>

            {/* Date filter — date range picker */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => setShowDateDropdown(v => !v)}
                className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full text-[12.5px] transition-all hover:-translate-y-0.5"
                style={heroPillStyle(isFiltered)}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={heroPillIconStyle(true, "linear-gradient(135deg, #34d399, #19a589)", "#19a589")}
                >
                  <Calendar className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
                </span>
                <span>{dateLabel}</span>
                {isFiltered && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      const t = startOfDay(new Date());
                      setDateRange({ from: t, to: t });
                    }}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] cursor-pointer transition-opacity hover:opacity-70"
                    style={heroPillClearStyle}
                  >×</span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${showDateDropdown ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showDateDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl z-[60] overflow-hidden flex"
                    style={{
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    {/* Presets column */}
                    <div className="w-[140px] bg-gray-50/70 border-r border-gray-100 py-2 flex flex-col">
                      <div className="px-3 py-1 text-[10.5px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                        ตัวเลือกด่วน
                      </div>
                      {presets.map((p) => {
                        const r = p.compute();
                        const isActive = isSameDay(dateRange.from, r.from) && isSameDay(dateRange.to, r.to);
                        return (
                          <button
                            key={p.label}
                            onClick={() => setDateRange(r)}
                            className={`mx-2 my-0.5 px-3 py-1.5 rounded-xl text-[12px] text-left transition-colors ${
                              isActive
                                ? "bg-[#19a589]/10 text-[#19a589]"
                                : "text-gray-700 hover:bg-white"
                            }`}
                            style={{ fontWeight: isActive ? 600 : 500 }}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                      <div className="mt-auto px-2 pt-2 pb-1 border-t border-gray-100">
                        <button
                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                          className="w-full px-3 py-1.5 rounded-xl text-[12px] text-left text-gray-500 hover:bg-white transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          ล้าง
                        </button>
                      </div>
                    </div>

                    {/* Calendar column */}
                    <div className="p-2">
                      <DayPicker
                        mode="range"
                        selected={dateRange as DateRange}
                        onSelect={(r) => setDateRange({ from: r?.from, to: r?.to })}
                        locale={th}
                        numberOfMonths={1}
                        showOutsideDays
                        captionLayout="dropdown"
                        fromYear={2020}
                        toYear={new Date().getFullYear() + 1}
                        style={{ fontSize: "calc(0.78rem * var(--fs))", margin: 0 }}
                        modifiersStyles={{
                          selected:    { background: "#19a589", color: "white", fontWeight: 700 },
                          range_start: { background: "#19a589", color: "white", fontWeight: 700 },
                          range_end:   { background: "#19a589", color: "white", fontWeight: 700 },
                          range_middle:{ background: "rgba(25,165,137,0.14)", color: "#0d7c66" },
                          today:       { color: "#19a589", fontWeight: 700 },
                        }}
                      />
                      {/* Selected range summary + apply */}
                      {dateRange.from && (
                        <div className="px-2 pt-1 pb-1 flex items-center justify-between gap-2 border-t border-gray-100 mt-1">
                          <div className="text-[11.5px] text-gray-600 truncate" style={{ fontWeight: 600 }}>
                            {dateRange.to && !isSameDay(dateRange.from, dateRange.to)
                              ? `${todayBuddhist(dateRange.from)} – ${todayBuddhist(dateRange.to)}`
                              : todayBuddhist(dateRange.from)}
                          </div>
                          <button
                            onClick={() => setShowDateDropdown(false)}
                            className="px-3 py-1 rounded-full text-[11.5px] text-white"
                            style={{
                              background: "linear-gradient(135deg, #19a589, #0d7c66)",
                              fontWeight: 600,
                              boxShadow: "0 2px 8px rgba(25,165,137,0.35)",
                            }}
                          >
                            ตกลง
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status filter — dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              {(() => {
                const activeOpt = statusOptions.find(o => o.label === statusFilter) ?? statusOptions[0];
                const ActiveIcon = activeOpt.icon;
                const isFiltered = statusFilter !== "ทั้งหมด";
                return (
                  <button
                    onClick={() => setShowStatusDropdown(v => !v)}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full text-[12.5px] transition-all hover:-translate-y-0.5"
                    style={heroPillStyle(isFiltered)}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={heroPillIconStyle(isFiltered, activeOpt.grad, activeOpt.color)}
                    >
                      <ActiveIcon className={heroPillIconClass(isFiltered)} strokeWidth={2.4} />
                    </span>
                    <span>{isFiltered ? activeOpt.label : "สถานะ"}</span>
                    {isFiltered && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setStatusFilter("ทั้งหมด"); }}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] cursor-pointer transition-opacity hover:opacity-70"
                        style={heroPillClearStyle}
                      >×</span>
                    )}
                    <ChevronDown className={`w-3 h-3 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
                  </button>
                );
              })()}

              <AnimatePresence>
                {showStatusDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-2 min-w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl z-[60] overflow-hidden py-1"
                  >
                    {statusOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = statusFilter === opt.label;
                      const count = opt.label === "ทั้งหมด"
                        ? visits.length
                        : visits.filter(v => v.status === opt.label).length;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => { setStatusFilter(opt.label); setShowStatusDropdown(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                            isActive ? "bg-gray-50" : "hover:bg-gray-50"
                          }`}
                          style={isActive ? { color: opt.color } : { color: "#374151" }}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isActive ? "" : "bg-gray-100"
                            }`}
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

      <RegisterVisitModal open={registerOpen} onClose={() => setRegisterOpen(false)} onSave={handleRegisterSave} />

      {/* ─── Grid of visit cards ─── */}
      <motion.div
        className="flex-1 overflow-y-auto overflow-x-hidden px-1 pt-1 pb-4"
        variants={cv}
        initial="hidden"
        animate="visible"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">ไม่พบรายการที่ตรงกัน{search && ` "${search}"`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <DetailView rec={selectedRec} onBack={handleBack} />
          </motion.div>
        ) : (
          <motion.div key="list" className="flex flex-col flex-1 min-h-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <ListView onSelect={handleSelect} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}