import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Printer, Send, X, Check, Edit2, Plus,
  User, Phone, Calendar, BedDouble, Clock, PawPrint,
  Utensils, Pill, Bath, Sparkles, FileText, Heart,
  Camera, AlertTriangle, Mail, MapPin, MessageCircle, CreditCard,
  Shield, Activity as ActivityIcon, Trash2,
  ClipboardCheck, Package, Scale, Stethoscope, Image as ImageIcon,
  Thermometer, UserCheck, ClipboardList, LogIn,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { CheckOutWizardModal } from "./CheckOutWizard";
import { BoardingPaymentModal } from "./BoardingPaymentModal";
import { DailyCareDashboard, AddDailyLogModal, mockDailyLogs } from "./DailyCareLog";
import type { DailyLogEntry } from "./DailyCareLog";

/* ═══════════════════════════════════════════════════════
   Types (mirror from Boarding)
   ═══════════════════════════════════════════════════════ */
type BookingStatus = "จองฝากเลี้ยง" | "Check-in" | "กำลังฝากเลี้ยง" | "Check-out" | "ชำระเงิน" | "กลับบ้าน";

interface Activity {
  id: number;
  time: string;
  type: string;
  detail: string;
  staff: string;
}

interface BookingData {
  id: number;
  petName: string;
  species: string;
  breed: string;
  ownerName: string;
  ownerPhone: string;
  photo: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  roomNumber: string;
  status: BookingStatus;
  services: string[];
  notes: string;
  dailyRate: number;
  activities: Activity[];
  deposit?: number;
  weight?: string;
  temperature?: string;
  healthStatus?: "ปกติ" | "เครียด" | "ป่วย";
  healthColor?: "green" | "yellow" | "red";
  kennelCard?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  paymentMethod?: string;
  paymentCompleted?: boolean;
  handoverNote?: string;
  caretaker?: string;
  feedingSchedule?: string;
  medications?: string;
  kennelNumber?: string;
  checkinPhotos?: string[];
}

/* ═══════════════════════════════════════════════════════
   Extended detail data (mock enrichment)
   ═══════════════════════════════════════════════════════ */
interface PetDetail {
  name: string;
  breed: string;
  gender: string;
  age: string;
  weight: string;
  color: string;
  microchip: string;
  vetName: string;
  emergencyPhone: string;
  food: string;
  behavior: string;
  vaccines: string[];
}

interface ServiceItem {
  id: number;
  name: string;
  description: string;
  qty: string;
  price: number;
  icon: string;
}

interface ActivityLog {
  id: number;
  title: string;
  date: string;
  time: string;
  staff: string;
  color: string;
}

interface OwnerDetail {
  name: string;
  memberType: string;
  duration: string;
  phone: string;
  email: string;
  line: string;
  address: string;
}

const statusColor: Record<BookingStatus, { bg: string; text: string; dot: string; border: string }> = {
  "จองฝากเลี้ยง": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "#fbbf24" },
  "Check-in": { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400", border: "#2dd4bf" },
  "กำลังฝากเลี้ยง": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "#34d399" },
  "Check-out": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", border: "#60a5fa" },
  "ชำระเงิน": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400", border: "#a78bfa" },
  "กลับบ้าน": { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "#9ca3af" },
};

const STATUS_FLOW: BookingStatus[] = ["จองฝากเลี้ยง", "Check-in", "กำลังฝากเลี้ยง", "Check-out", "ชำระเงิน", "กลับบ้าน"];
const NEXT_STATUS_LABEL: Record<BookingStatus, string> = {
  "จองฝากเลี้ยง": "Check-in",
  "Check-in": "กำลังฝากเลี้ยง",
  "กำลังฝากเลี้ยง": "Check-out",
  "Check-out": "ชำระเงิน",
  "ชำระเงิน": "กลับบ้าน",
  "กลับบ้าน": "",
};

function getDefaultPetDetail(b: BookingData): PetDetail {
  return {
    name: b.petName,
    breed: b.breed,
    gender: b.species === "แมว" ? "เมีย (ทำหมันแล้ว)" : "เมีย (ทำหมันแล้ว)",
    age: "3 ปี 4 เดือน",
    weight: "28 กก.",
    color: "ทองอ่อน",
    microchip: "981000012345678",
    vetName: "น.สพ. วิทยา สัตวแพทย์",
    emergencyPhone: "02-555-7890",
    food: "Royal Canin Adult — 250g/มื้อ × 3 มื้อ/วัน",
    behavior: "ชอบเล่น กลัวเสียงดัง ต้องออกเดิน 2 ครั้ง/วัน",
    vaccines: ["Rabies (ล.ค. 68)", "DHPP ครบ", "ถ่ายพยาธิล่าสุด", "ฉ.แพ้ให้", "สารคลื่น — เมื่อจำเป็น"],
  };
}

function getDefaultServices(b: BookingData): ServiceItem[] {
  return [
    { id: 1, name: "ห้องพัก " + b.roomType, description: `ห้อง ${b.roomNumber} • ${b.roomType} พร้อมสิ่งอำนวยความสะดวกครบ`, qty: "6 คืน", price: b.dailyRate * 6, icon: "bed" },
    { id: 2, name: "อาบน้ำ-ตัดขน", description: "Full Grooming • วันที่ 15 มี.ค. เวลา 10:00", qty: "1 ครั้ง", price: 650, icon: "bath" },
    { id: 3, name: "ไสยาบำบัด", description: "โปรเต็ม • ดนตรีบำบัดผ่อนคลายในห้อง", qty: "6 วัน", price: 300, icon: "heart" },
    { id: 4, name: "วางยาจูงบริการถ่ายรูป", description: "ส่งรูปผ่าน Line ให้แม่ 2 ครั้ง", qty: "6 วัน", price: 400, icon: "camera" },
  ];
}

function getDefaultActivities(): ActivityLog[] {
  return [
    { id: 1, title: "Check-in สำเร็จ — รับสัตว์เข้าพักห้อง A-01", date: "12 มี.ค.", time: "09:15 น.", staff: "สมโชค", color: "#19a589" },
    { id: 2, title: "อาหารเช้า — Royal Canin 250g กินหมด", date: "12 มี.ค.", time: "08:00 น.", staff: "ญาณี", color: "#e8802a" },
    { id: 3, title: "พาเดิน — ออกทำกิจกรรม 30 นาที สนามดี", date: "12 มี.ค.", time: "07:10 น.", staff: "สุภาน", color: "#3b82f6" },
    { id: 4, title: "ส่งรูปผ่าน Line — เจ้าของตอบรับ 👍", date: "12 มี.ค.", time: "09:30 น.", staff: "ทินนท์", color: "#8b5cf6" },
  ];
}

function getDefaultOwner(b: BookingData): OwnerDetail {
  return {
    name: b.ownerName,
    memberType: "ลูกค้าประจำ",
    duration: "2 ปี • 8 ครั้งพัก",
    phone: b.ownerPhone,
    email: "vipa.t@gmail.com",
    line: "Line: vipa_goldie",
    address: "สุขุมวิท 49 กรุงเทพฯ",
  };
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const availableServices = [
  "ห้องพัก VIP Suite", "อาบน้ำ-ตัดขน", "ไสยาบำบัด", "วางยาจูงบริการถ่ายรูป",
  "ตัดเล็บ", "ให้ยาตามใบสั่งแพทย์", "ดูแลพิเศษ 24 ชม.", "พาเดินเล่น 3 ครั้ง/วัน",
  "อาหารพิเศษ", "ฝึกพฤติกรรม",
];
const servicePrices: Record<string, number> = {
  "ห้องพัก VIP Suite": 3000, "อาบน้ำ-ตัดขน": 650, "ไสยาบำบัด": 300,
  "วางยาจูงบริการถ่ายรูป": 400, "ตัดเล็บ": 150, "ให้ยาตามใบสั่งแพทย์": 500,
  "ดูแลพิเศษ 24 ชม.": 1200, "พาเดินเล่น 3 ครั้ง/วัน": 300, "อาหารพิเศษ": 200, "ฝึกพฤติกรรม": 800,
};

const activityTypes = ["ให้อาหาร", "พาเดินเล่น", "อาบน้ำ", "ให้ยา", "ตรวจสุขภาพ", "ทำความสะอาดกรง", "ส่งรูป/อัปเดต", "อื่นๆ"];
const activityColors: Record<string, string> = {
  "ให้อาหาร": "#e8802a", "พาเดินเล่น": "#3b82f6", "อาบน้ำ": "#06b6d4",
  "ให้ยา": "#ef4444", "ตรวจสุขภาพ": "#19a589", "ทำความสะอาดกรง": "#8b5cf6",
  "ส่งรูป/อัปเดต": "#8b5cf6", "อื่นๆ": "#6b7280",
};

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
export function BoardingDetail({
  booking,
  onBack,
  onAdvance,
  onUpdateBooking,
}: {
  booking: BookingData;
  onBack: () => void;
  onAdvance: (b: BookingData) => void;
  onUpdateBooking: (updated: BookingData) => void;
}) {
  const { showSnackbar } = useSnackbar();
  const sc = statusColor[booking.status];

  // Local state
  const [petDetail, setPetDetail] = useState<PetDetail>(() => getDefaultPetDetail(booking));
  const [services, setServices] = useState<ServiceItem[]>(() => getDefaultServices(booking));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => getDefaultActivities());
  const [ownerDetail] = useState<OwnerDetail>(() => getDefaultOwner(booking));
  const [photos] = useState([
    "https://images.unsplash.com/photo-1511024654425-72f2d89820be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1734966213753-1b361564bab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1743763959056-41bbb557272d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  ]);

  // Modals
  const [showEditPet, setShowEditPet] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showConfirmAdvance, setShowConfirmAdvance] = useState(false);
  const [showCheckInWizard, setShowCheckInWizard] = useState(false);
  const [showCheckOutWizard, setShowCheckOutWizard] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDailyLogModal, setShowDailyLogModal] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>(mockDailyLogs);
  const currentHealthColor = (booking.healthColor || "green") as "green" | "yellow" | "red";

  // Check-in inline form state
  const checkInRef = useRef<HTMLDivElement>(null);
  const DEP_OPTS = [500, 800, 1000, 1500, 2000];
  const [ciWeight, setCiWeight] = useState(booking.weight || "");
  const [ciTemp, setCiTemp] = useState(booking.temperature || "38.5");
  const [ciHealth, setCiHealth] = useState<"ปกติ" | "เครียด">(
    (booking.healthStatus === "เครียด" ? "เครียด" : "ปกติ") as "ปกติ" | "เครียด"
  );
  const [ciDeposit, setCiDeposit] = useState(booking.deposit || 1000);
  const [ciKennel, setCiKennel] = useState(booking.roomNumber || "");
  const [ciCaretaker, setCiCaretaker] = useState(booking.caretaker || "");
  const [ciFeeding, setCiFeeding] = useState(booking.feedingSchedule || "วันละ 2 มื้อ (เช้า-เย็น)");
  const [ciMeds, setCiMeds] = useState(booking.medications || "");
  const [ciPhotos, setCiPhotos] = useState<string[]>(booking.checkinPhotos || []);
  const [ciKennelCard, setCiKennelCard] = useState(booking.kennelCard || false);
  const ciValid = ciWeight.trim() !== "" && ciTemp.trim() !== "" && ciKennel.trim() !== "" && ciDeposit > 0;

  const handleCheckInSubmit = () => {
    if (!ciValid) return;
    const hcMap: Record<string, "green" | "yellow"> = { "ปกติ": "green", "เครียด": "yellow" };
    onUpdateBooking({
      ...booking,
      weight: ciWeight,
      temperature: ciTemp,
      healthStatus: ciHealth,
      healthColor: hcMap[ciHealth],
      deposit: ciDeposit,
      kennelNumber: ciKennel,
      roomNumber: ciKennel,
      caretaker: ciCaretaker,
      feedingSchedule: ciFeeding,
      medications: ciMeds,
      checkinPhotos: ciPhotos,
      kennelCard: ciKennelCard,
      checkInTime: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    });
    onAdvance(booking);
    showSnackbar("success", `เริ่มฝากเลี้ยง "${booking.petName}" สำเร็จ — กรง ${ciKennel} · มัดจำ ฿${ciDeposit.toLocaleString()}`);
  };

  // Computed
  const nights = 6;
  const totalServices = services.reduce((s, sv) => s + sv.price, 0);
  const deposit = booking.deposit || 0;
  const vat = Math.round(totalServices * 0.07);
  const payable = totalServices + vat - deposit;
  const statusIdx = STATUS_FLOW.indexOf(booking.status);
  const nextLabel = NEXT_STATUS_LABEL[booking.status];
  const bookingCode = `#BK-2025-${String(booking.id).padStart(4, "0")}`;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-4"
    >
      {/* ── Breadcrumb + Actions ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={onBack} className="flex items-center gap-1 px-3 py-1 text-xs text-[#6a7282] bg-white/50 rounded-full hover:bg-white/80 transition-all" style={{ fontWeight: 500 }}>
            <ChevronLeft className="w-3.5 h-3.5" /> ย้อนกลับ
          </button>
          
          
          
          
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all" style={{ fontWeight: 500 }}>
            <Printer className="w-3.5 h-3.5" /> พิมพ์ใบจอง
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all" style={{ fontWeight: 500 }}>
            <Send className="w-3.5 h-3.5" /> ส่งให้เจ้าของ
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-all" style={{ fontWeight: 500 }}>
            <X className="w-3.5 h-3.5" /> ยกเลิกการจอง
          </button>
          {nextLabel && (
            <button
              onClick={() => {
                if (booking.status === "จองฝากเลี้ยง") {
                  setShowCheckInWizard(true);
                } else if (booking.status === "Check-in") {
                  checkInRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                } else if (booking.status === "กำลังฝากเลี้ยง") {
                  setShowCheckOutWizard(true);
                } else if (booking.status === "Check-out") {
                  setShowPaymentModal(true);
                } else {
                  setShowConfirmAdvance(true);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-white rounded-full transition-all active:scale-95"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}
            >
              <Check className="w-3.5 h-3.5" /> {nextLabel}
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Pet Hero Banner ── */}
      <motion.div variants={fadeUp} className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 50%, #f3faf8 100%)" }}>
        <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.07] pointer-events-none" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative flex flex-col lg:flex-row">
          {/* Pet info */}
          <div className="flex-1 p-5 flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-3 border-white shadow-lg flex-shrink-0 rounded-[1000px]"
              style={{ borderColor: sc.border }}>
              <img src={booking.photo} alt="" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 mb-0.5">รายละเอียดการจอง {bookingCode}</p>
              <h2 className="text-xl sm:text-2xl text-gray-900 truncate" style={{ fontWeight: 700 }}>{booking.petName}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{booking.breed} · {petDetail.gender} · {petDetail.age} · {petDetail.weight}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-[#19a589]" /> {booking.roomNumber} — {booking.roomType}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#19a589]" /> {booking.ownerName}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-400" /> {nights} คืน</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-400" /> {booking.checkIn.replace("มี.ค.", "มีนาคม 2568")}</span>
              </div>
            </div>
          </div>

          {/* Price summary badge */}
          <div className="lg:w-[200px] p-4 flex flex-col items-end justify-center"
            style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)" }}>
            <div className="text-right">
              {deposit > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white/90 bg-white/20 mb-1" style={{ fontWeight: 500 }}>
                  <Shield className="w-3 h-3" /> มัดจำ ฿{deposit.toLocaleString()}
                </span>
              )}
              <p className="text-[10px] text-white/70">ค่าใช้จ่ายรวม (VAT 7%)</p>
              <p className="text-2xl sm:text-3xl text-white" style={{ fontWeight: 800 }}>฿{(totalServices + vat).toLocaleString()}</p>
              {deposit > 0 && <p className="text-[10px] text-white/60 mt-0.5">ชำระสุทธิ ฿{Math.max(0, payable).toLocaleString()}</p>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Check-in / Check-out Timeline ── */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>CHECK-IN</p>
            <p className="text-sm text-gray-800 mt-1" style={{ fontWeight: 700 }}>{booking.checkIn}</p>
          </div>
          <div className="flex-1 mx-4">
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{
                width: `${Math.min(100, Math.max(10, (statusIdx / (STATUS_FLOW.length - 1)) * 100))}%`,
                background: "linear-gradient(90deg, #19a589, #0d7c66)"
              }} />
            </div>
            <div className="flex justify-between mt-2">
              {STATUS_FLOW.map((s, i) => (
                <div key={s} className="flex flex-col items-center" style={{ width: `${100 / STATUS_FLOW.length}%` }}>
                  <div className={`w-3 h-3 rounded-full border-2 ${i <= statusIdx ? "border-[#19a589] bg-[#19a589]" : "border-gray-300 bg-white"}`}>
                    {i <= statusIdx && <Check className="w-2 h-2 text-white" style={{ margin: "1px" }} />}
                  </div>
                  <span className={`text-[9px] mt-1 text-center leading-tight ${i <= statusIdx ? "text-[#19a589]" : "text-gray-400"}`} style={{ fontWeight: i === statusIdx ? 600 : 400 }}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>CHECK-OUT</p>
            <p className="text-sm text-gray-800 mt-1" style={{ fontWeight: 700 }}>{booking.checkOut}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Inline Check-in Form (when status is Check-in) ── */}
      {booking.status === "Check-in" && (
        <motion.div ref={checkInRef} variants={fadeUp}
          className="bg-white rounded-2xl border-2 border-[#19a589]/30 shadow-sm overflow-hidden"
          style={{ boxShadow: "0 4px 20px rgba(25,165,137,0.12)" }}
        >
          {/* Header */}
          <div className="relative overflow-hidden px-5 pt-4 pb-3 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
            <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                  <LogIn className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Check-in — บันทึกข้อมูลฝากเลี้ยง</span>
                  <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>กรอกข้อมูลสุขภาพ, จัดสรรกรง, รับมัดจำ แล้วกดยืนยันเพื่อเริ่มฝากเลี้ยง</p>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* ── ตรวจสอบสุขภาพ ── */}
            <div>
              <p className="vet-divider">ตรวจสอบสุขภาพ</p>
              <div className="vet-form-gap">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">น้ำหนัก (กก.) <span className="required">*</span></label>
                    <div className="relative">
                      <Stethoscope className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                      <input type="number" step="0.1" value={ciWeight} onChange={e => setCiWeight(e.target.value)} placeholder="เช่น 8.5" className="vet-input has-icon-left" />
                    </div>
                  </div>
                  <div>
                    <label className="vet-label">อุณหภูมิ (°C) <span className="required">*</span></label>
                    <div className="relative">
                      <Thermometer className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                      <input type="number" step="0.1" value={ciTemp} onChange={e => setCiTemp(e.target.value)} placeholder="เช่น 38.5" className="vet-input has-icon-left" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="vet-label">สถานะสุขภาพเริ่มต้น</label>
                  <div className="flex gap-[8px]" style={{ height: 40 }}>
                    {(["ปกติ", "เครียด"] as const).map(h => {
                      const active = ciHealth === h;
                      return (
                        <button key={h} onClick={() => setCiHealth(h)}
                          className={`flex-1 flex items-center justify-center gap-[6px] rounded-[12px] border text-[13px] transition-all ${
                            active
                              ? h === "ปกติ" ? "bg-green-500 text-white border-green-500" : "bg-yellow-500 text-white border-yellow-500"
                              : h === "ปกติ" ? "bg-green-50 border-green-200 text-green-600" : "bg-yellow-50 border-yellow-200 text-yellow-600"
                          }`}
                          style={{ fontWeight: active ? 600 : 500 }}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── ถ่ายรูป ── */}
            <div>
              <p className="vet-divider">ถ่ายรูปสัตว์เลี้ยง & อุปกรณ์ส่วนตัว</p>
              <div className="vet-form-gap">
                <div className="flex flex-wrap gap-[8px]">
                  {ciPhotos.map((p, i) => (
                    <div key={i} className="relative w-[64px] h-[64px] rounded-[12px] overflow-hidden border border-gray-200 group">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setCiPhotos(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const placeholders = [
                        "https://placehold.co/200x200/e8f5e9/2e7d32?text=Pet",
                        "https://placehold.co/200x200/fff3e0/e65100?text=Items",
                        "https://placehold.co/200x200/e3f2fd/1565c0?text=Kennel",
                      ];
                      setCiPhotos(prev => [...prev, placeholders[prev.length % placeholders.length]]);
                    }}
                    className="w-[64px] h-[64px] rounded-[12px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#19a589] hover:text-[#19a589] transition-colors"
                  >
                    <Camera className="w-[18px] h-[18px]" />
                    <span className="text-[9px]" style={{ fontWeight: 500 }}>ถ่ายรูป</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>ถ่ายรูปสัตว์เลี้ยง, อุปกรณ์ส่วนตัว, สภาพร่างกาย</p>
              </div>
            </div>

            {/* ── จัดสรรกรง & มัดจำ ── */}
            <div>
              <p className="vet-divider">จัดสรรกรง & มัดจำ</p>
              <div className="vet-form-gap">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">Kennel / ห้อง <span className="required">*</span></label>
                    <div className="relative">
                      <BedDouble className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                      <input type="text" value={ciKennel} onChange={e => setCiKennel(e.target.value)} placeholder="เช่น A-01" className="vet-input has-icon-left" />
                    </div>
                  </div>
                  <div>
                    <label className="vet-label">พนักงานดูแล</label>
                    <div className="relative">
                      <UserCheck className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                      <input type="text" value={ciCaretaker} onChange={e => setCiCaretaker(e.target.value)} placeholder="ชื่อพนักงาน" className="vet-input has-icon-left" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="vet-label">มัดจำกรง (500–2,000 บาท) <span className="required">*</span></label>
                  <div className="flex gap-[8px] flex-wrap">
                    {DEP_OPTS.map(d => (
                      <button key={d} onClick={() => setCiDeposit(d)}
                        className={`px-[14px] py-[8px] rounded-full text-[13px] transition-all border ${
                          ciDeposit === d ? "bg-[#19a589]/10 border-[#19a589]/30 text-[#0d7c66]" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                        }`} style={{ fontWeight: ciDeposit === d ? 600 : 400 }}>
                        ฿{d.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Kennel Card ── */}
            <div>
              <p className="vet-divider">Kennel Card</p>
              <div className="vet-form-gap">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">ตารางให้อาหาร</label>
                    <div className="relative">
                      <Utensils className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                      <input type="text" value={ciFeeding} onChange={e => setCiFeeding(e.target.value)} placeholder="เช่น วันละ 2 มื้อ (เช้า-เย็น)" className="vet-input has-icon-left" />
                    </div>
                  </div>
                  <div>
                    <label className="vet-label">ยา/อาหารเสริม</label>
                    <div className="relative">
                      <Pill className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                      <input type="text" value={ciMeds} onChange={e => setCiMeds(e.target.value)} placeholder="ระบุยา (ถ้ามี)" className="vet-input has-icon-left" />
                    </div>
                  </div>
                </div>
                {/* Preview */}
                <div className="p-[14px] rounded-[14px] bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-[10px]">
                    <div className="flex items-center gap-[6px] text-[12px] text-gray-600" style={{ fontWeight: 600 }}>
                      <ClipboardList className="w-[14px] h-[14px] text-[#19a589]" /> ตัวอย่าง Kennel Card
                    </div>
                    <button
                      onClick={() => setCiKennelCard(true)}
                      className="flex items-center gap-1 text-[11px] px-[10px] py-[4px] rounded-full text-[#19a589] bg-[#19a589]/8 border border-[#19a589]/15 hover:bg-[#19a589]/15 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <Printer className="w-3 h-3" /> พิมพ์ Kennel Card
                    </button>
                  </div>
                  <div className="space-y-[4px] text-[11px] text-gray-500" style={{ fontWeight: 400 }}>
                    <p>🐾 <span style={{ fontWeight: 600, color: "#1e2939" }}>{booking.petName}</span> ({booking.breed})</p>
                    <p>📍 ห้อง: <span style={{ fontWeight: 500 }}>{ciKennel || "–"}</span> · เจ้าของ: {booking.ownerName}</p>
                    <p>🍽️ อาหาร: {ciFeeding || "–"}</p>
                    {ciMeds && <p>💊 ยา: {ciMeds}</p>}
                    <p>👤 ดูแลโดย: {ciCaretaker || "–"}</p>
                  </div>
                  {ciKennelCard && (
                    <div className="mt-[8px] flex items-center gap-[6px] text-[10px] text-green-600" style={{ fontWeight: 500 }}>
                      <Check className="w-3 h-3" /> สั่งพิมพ์แล้ว
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={handleCheckInSubmit}
                disabled={!ciValid}
                className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-full text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 600, background: "linear-gradient(135deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}
              >
                <Check className="w-4 h-4" /> บันทึก & เริ่มฝากเลี้ยง
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Two-column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Left: Main Content */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">

          {/* ── ข้อมูลสัตว์เลี้ยง ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-5 pt-4 pb-2.5 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -40%)" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                    <PawPrint className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ข้อมูลสัตว์เลี้ยง</span>
                </div>
                <button onClick={() => setShowEditPet(true)} className="text-xs text-[#19a589] hover:underline flex items-center gap-1 relative z-10" style={{ fontWeight: 500 }}>
                  <Edit2 className="w-3 h-3" /> แก้ไข
                </button>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "ชื่อ", value: petDetail.name },
                  { label: "สายพันธุ์", value: petDetail.breed },
                  { label: "เพศ", value: petDetail.gender },
                  { label: "อายุ", value: petDetail.age },
                  { label: "น้ำหนัก", value: petDetail.weight },
                  { label: "สี", value: petDetail.color },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>{f.label}</p>
                    <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>ไมโครชิป</p>
                  <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{petDetail.microchip}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>หมอประจำตัว</p>
                  <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{petDetail.vetName}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>เบอร์ฉุกเฉิน</p>
                <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{petDetail.emergencyPhone}</p>
              </div>

              {/* Food & Behavior */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>🍖 อาหาร</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{petDetail.food}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>🐾 พฤติกรรมพิเศษ</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{petDetail.behavior}</p>
                </div>
              </div>

              {/* Vaccines */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {petDetail.vaccines.map((v, i) => {
                  const colors = ["bg-green-50 text-green-700 border-green-200", "bg-blue-50 text-blue-700 border-blue-200", "bg-purple-50 text-purple-700 border-purple-200", "bg-red-50 text-red-700 border-red-200", "bg-amber-50 text-amber-700 border-amber-200"];
                  return (
                    <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full border ${colors[i % colors.length]}`} style={{ fontWeight: 500 }}>
                      <Check className="w-3 h-3" /> {v}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── บริการเสริมที่เลือก ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-5 pt-4 pb-2.5 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -40%)" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>บริการเสริมที่เลือก</span>
                </div>
                <button onClick={() => setShowAddService(true)} className="text-xs text-[#19a589] hover:underline flex items-center gap-1 relative z-10" style={{ fontWeight: 500 }}>
                  <Plus className="w-3 h-3" /> เพิ่มบริการ
                </button>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-4 px-3 py-1.5 text-[10px] text-gray-400" style={{ fontWeight: 500 }}>
                <span className="flex-1">บริการ</span>
                <span className="w-16 text-right">จำนวน</span>
                <span className="w-16 text-right">ราคา</span>
              </div>
              <div className="space-y-1">
                {services.map((sv) => {
                  const iconMap: Record<string, typeof BedDouble> = { bed: BedDouble, bath: Bath, heart: Heart, camera: Camera };
                  const Icon = iconMap[sv.icon] || Sparkles;
                  return (
                    <div key={sv.id} className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="w-8 h-8 rounded-xl bg-[#19a589]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#19a589]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{sv.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{sv.description}</p>
                      </div>
                      <span className="text-[11px] text-gray-500 w-16 text-right flex-shrink-0">{sv.qty}</span>
                      <span className="text-xs text-gray-800 w-16 text-right flex-shrink-0" style={{ fontWeight: 600 }}>฿{sv.price.toLocaleString()}</span>
                      <button onClick={() => {
                        setServices(prev => prev.filter(s => s.id !== sv.id));
                        showSnackbar("delete", `ลบบริการ "${sv.name}" แล้ว`);
                      }} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── รูปภาพระหว่างพัก ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-5 pt-4 pb-2.5 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -40%)" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>รูปภาพระหว่างพัก</span>
                </div>
                <button className="text-xs text-[#19a589] hover:underline flex items-center gap-1 relative z-10" style={{ fontWeight: 500 }}>ดูทั้งหมด</button>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0 cursor-pointer hover:border-[#19a589] transition-colors">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {[1, 2, 3].map(i => (
                  null
                ))}
                <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-300 hover:border-[#19a589] hover:text-[#19a589] transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── ความต้องการพิเศษ ── */}
          {booking.notes && (
            <motion.div variants={fadeUp} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-700" style={{ fontWeight: 600 }}>ความต้องการพิเศษ</p>
                  <p className="text-xs text-amber-600 mt-1 leading-relaxed">{petDetail.behavior}</p>
                  <p className="text-[10px] text-amber-500 mt-1">ทำรายงานทุกขั้นตอนอย่างละเอียด และแจ้งเตือนเจ้าของ 2 ครั้ง/วัน เช้า 07:00 และเย็น 17:00</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── บันทึกการดูแลประจำวัน (Daily Care Log) ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-5 pt-4 pb-2.5 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -40%)" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                    <ActivityIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>บันทึกการดูแลประจำวัน</span>
                </div>
                <button onClick={() => setShowDailyLogModal(true)} className="text-xs text-[#19a589] hover:underline flex items-center gap-1 relative z-10" style={{ fontWeight: 500 }}>
                  <Plus className="w-3 h-3" /> เพิ่ม
                </button>
              </div>
            </div>
            <div className="px-5 py-4">
              <DailyCareDashboard
                logs={dailyLogs}
                currentHealthColor={currentHealthColor}
                onAddLog={() => setShowDailyLogModal(true)}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
          {/* ── สรุปค่าใช้จ่าย ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-5 pt-4 pb-2.5 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -40%)" }} />
              <div className="relative flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>สรุปค่าใช้จ่าย</span>
              </div>
            </div>
            <div className="p-5">
            <div className="space-y-2">
              {services.map(sv => (
                <div key={sv.id} className="flex justify-between text-xs">
                  <span className="text-gray-500">{sv.name} ({sv.qty})</span>
                  <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{sv.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600" style={{ fontWeight: 500 }}>ยอดรวม</span>
                  <span className="text-gray-800" style={{ fontWeight: 600 }}>฿{totalServices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">VAT 7%</span>
                  <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{vat.toLocaleString()}</span>
                </div>
                {deposit > 0 && (
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#19a589]">หักมัดจำ</span>
                    <span className="text-[#19a589]" style={{ fontWeight: 500 }}>-฿{deposit.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ยอดชำระสุทธิ</span>
                  <span className="text-xl text-[#19a589]" style={{ fontWeight: 800 }}>฿{Math.max(0, payable).toLocaleString()}</span>
                </div>
              </div>
              {deposit > 0 && (
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-full bg-[#19a589]/10 text-[#19a589] border border-[#19a589]/15" style={{ fontWeight: 500 }}>
                    <Check className="w-3 h-3" /> รับมัดจำแล้ว ฿{deposit.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400">รับตอน Check-in</span>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
                  <FileText className="w-3.5 h-3.5" /> ออกใบแจ้ง
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-white rounded-full transition-all active:scale-95"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 10px rgba(25,165,137,0.25)" }}>
                  <CreditCard className="w-3.5 h-3.5" /> รับชำระเงิน
                </button>
              </div>
            </div>
            </div>
          </motion.div>

          {/* ── เจ้าของสัตว์ ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-5 pt-4 pb-2.5 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -40%)" }} />
              <div className="relative flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>เจ้าของสัตว์</span>
              </div>
            </div>
            <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#19a589]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#19a589]" />
              </div>
              <div>
                <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{ownerDetail.name}</p>
                <p className="text-[10px] text-gray-400">{ownerDetail.memberType} · {ownerDetail.duration}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { icon: Phone, value: ownerDetail.phone },
                { icon: Mail, value: ownerDetail.email },
                { icon: MessageCircle, value: ownerDetail.line },
                { icon: MapPin, value: ownerDetail.address },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600">
                  <item.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              {[
                { label: "โทร", icon: Phone },
                { label: "Line", icon: MessageCircle },
                { label: "Email", icon: Mail },
              ].map(btn => (
                <button key={btn.label} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-gray-600 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
                  <btn.icon className="w-3 h-3" /> {btn.label}
                </button>
              ))}
            </div>
            </div>
          </motion.div>

          {/* ── การดำเนินการ ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-5 pt-4 pb-2.5 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #19a589 0%, transparent 70%)", transform: "translate(30%, -40%)" }} />
              <div className="relative flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>การดำเนินการ</span>
              </div>
            </div>
            <div className="p-5">
            <div className="grid grid-cols-2 gap-2 [&>button]:h-[40px]">
              {nextLabel && (
                <button
                  onClick={() => {
                    if (booking.status === "จองฝากเลี้ยง") {
                      setShowCheckInWizard(true);
                    } else if (booking.status === "Check-in") {
                      checkInRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    } else if (booking.status === "กำลังฝากเลี้ยง") {
                      setShowCheckOutWizard(true);
                    } else if (booking.status === "Check-out") {
                      setShowPaymentModal(true);
                    } else {
                      setShowConfirmAdvance(true);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 text-xs text-white rounded-xl transition-all active:scale-95"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 10px rgba(25,165,137,0.25)" }}
                >
                  <Check className="w-3.5 h-3.5" /> {nextLabel}
                </button>
              )}
              <button onClick={() => setShowDailyLogModal(true)} className="flex items-center justify-center gap-1.5 px-3 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
                <FileText className="w-3.5 h-3.5" /> บันทึกการดูแล
              </button>
              <button onClick={() => setShowDailyLogModal(true)} className="flex items-center justify-center gap-1.5 px-3 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
                <Utensils className="w-3.5 h-3.5" /> บันทึกอาหาร
              </button>
              <button onClick={() => setShowDailyLogModal(true)} className="flex items-center justify-center gap-1.5 px-3 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
                <Pill className="w-3.5 h-3.5" /> บันทึกยา
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
                <Camera className="w-3.5 h-3.5" /> อัปโหลดรูป
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
                <Send className="w-3.5 h-3.5" /> แจ้งเตือนเจ้าของ
              </button>
            </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ══════ Modals ══════ */}

      {/* Confirm Advance Status */}
      <AnimatePresence>
        {showConfirmAdvance && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowConfirmAdvance(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="w-full max-w-[400px] vet-modal"
              >
                <div className="vet-modal-header rounded-t-3xl">
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="vet-modal-header-icon"><Check className="w-5 h-5 text-white" /></div>
                      <div>
                        <h2 className="vet-section-title">ยืนยันเปลี่ยนสถานะ</h2>
                        <p className="vet-tiny mt-[2px]">→ {nextLabel}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowConfirmAdvance(false)} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                  </div>
                </div>
                <div className="vet-modal-body">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    ยืนยันเปลี่ยนสถานะ "<span style={{ fontWeight: 600 }}>{booking.petName}</span>" จาก "<span style={{ fontWeight: 600 }}>{booking.status}</span>"
                    เป็น "<span style={{ fontWeight: 600 }}>{nextLabel}</span>" หรือไม่?
                  </p>
                </div>
                <div className="vet-modal-footer">
                  <button onClick={() => setShowConfirmAdvance(false)} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                  <button onClick={() => { onAdvance(booking); setShowConfirmAdvance(false); }} className="vet-btn vet-btn-primary btn-green ml-auto">
                    <Check className="w-4 h-4" /> ยืนยัน
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Pet Detail Modal */}
      <EditPetModal
        open={showEditPet}
        petDetail={petDetail}
        onClose={() => setShowEditPet(false)}
        onSave={(updated) => { setPetDetail(updated); setShowEditPet(false); showSnackbar("success", "อัปเดตข้อมูลสัตว์เลี้ยงแลว"); }}
      />

      {/* Add Service Modal */}
      <AddServiceModal
        open={showAddService}
        onClose={() => setShowAddService(false)}
        onSave={(sv) => {
          setServices(prev => [...prev, { ...sv, id: Date.now() }]);
          setShowAddService(false);
          showSnackbar("success", `เพิ่มบริการ "${sv.name}" แล้ว`);
        }}
      />

      {/* Add Activity Modal */}
      <AddActivityModal
        open={showAddActivity}
        onClose={() => setShowAddActivity(false)}
        onSave={(log) => {
          setActivityLogs(prev => [{ ...log, id: Date.now() }, ...prev]);
          setShowAddActivity(false);
          showSnackbar("success", "บันทึกกิจกรรมแล้ว");
        }}
      />

      {/* Check-in Wizard Modal */}
      <CheckInWizardModal
        open={showCheckInWizard}
        booking={booking}
        petDetail={petDetail}
        onClose={() => setShowCheckInWizard(false)}
        onComplete={(checkInData) => {
          setPetDetail(prev => ({
            ...prev,
            weight: checkInData.weight ? `${checkInData.weight} กก.` : prev.weight,
            food: checkInData.food || prev.food,
            behavior: checkInData.specialNotes || prev.behavior,
          }));
          // Update booking with check-in data
          onUpdateBooking({
            ...booking,
            deposit: checkInData.deposit,
            weight: checkInData.weight,
            temperature: checkInData.temperature,
            healthStatus: checkInData.healthStatus,
            healthColor: checkInData.healthStatus === "ปกติ" ? "green" : checkInData.healthStatus === "เครียด" ? "yellow" : "red",
            kennelCard: checkInData.kennelCard,
          });
          onAdvance(booking);
          setShowCheckInWizard(false);
          showSnackbar("success", `Check-in "${booking.petName}" สำเร็จ — มัดจำ ฿${checkInData.deposit.toLocaleString()} · สถานะ: ${checkInData.healthStatus}`);
        }}
      />

      {/* Check-out Wizard Modal */}
      <CheckOutWizardModal
        open={showCheckOutWizard}
        booking={booking}
        onClose={() => setShowCheckOutWizard(false)}
        onComplete={(checkOutData) => {
          onUpdateBooking({
            ...booking,
            handoverNote: checkOutData.handoverNote,
          });
          onAdvance(booking);
          setShowCheckOutWizard(false);
          showSnackbar("success", `Check-out "${booking.petName}" เรียบร้อย — คืนมัดจำ ฿${checkOutData.depositRefund.toLocaleString()}`);
        }}
      />

      {/* Payment Modal */}
      <BoardingPaymentModal
        open={showPaymentModal}
        booking={booking}
        onClose={() => setShowPaymentModal(false)}
        onComplete={(paymentResult) => {
          onUpdateBooking({
            ...booking,
            paymentMethod: paymentResult.method,
            paymentCompleted: true,
          });
          onAdvance(booking);
          setShowPaymentModal(false);
          showSnackbar("success", `ชำระเงิน "${booking.petName}" สำเร็จ — ฿${paymentResult.netPayable.toLocaleString()} (${paymentResult.method === "promptpay" ? "PromptPay" : paymentResult.method === "credit" ? "บัตรเครดิต" : "เงินสด"})`);
        }}
      />

      {/* Daily Care Log Modal */}
      <AddDailyLogModal
        open={showDailyLogModal}
        onClose={() => setShowDailyLogModal(false)}
        onSave={(log) => {
          setDailyLogs(prev => [log, ...prev]);
          setShowDailyLogModal(false);
          showSnackbar("success", `บันทึกการดูแล "${log.title}" แล้ว`);
        }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Edit Pet Modal
   ═══════════════════════════════════════════════════════ */
function EditPetModal({ open, petDetail, onClose, onSave }: {
  open: boolean;
  petDetail: PetDetail;
  onClose: () => void;
  onSave: (p: PetDetail) => void;
}) {
  const [form, setForm] = useState<PetDetail>(petDetail);
  const update = (key: keyof PetDetail, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  // Reset form when opened
  const handleOpen = () => setForm(petDetail);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}
            onAnimationStart={handleOpen} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[540px] vet-modal"
              style={{ height: "min(700px, calc(100vh - 2rem))" }}
            >
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon"><PawPrint className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="vet-section-title">แก้ไขข้อมูลสัตว์เลี้ยง</h2>
                      <p className="vet-tiny mt-[2px]">อัปเดตข้อมูล {petDetail.name}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
              <div className="vet-modal-body">
                <div className="space-y-[20px]">
                  <div>
                    <p className="vet-divider">ข้อมูลพื้นฐาน</p>
                    <div className="vet-form-gap">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">ชื่อ <span className="required">*</span></label>
                          <input value={form.name} onChange={e => update("name", e.target.value)} className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">สายพันธุ์</label>
                          <input value={form.breed} onChange={e => update("breed", e.target.value)} className="vet-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="vet-label">เพศ</label>
                          <input value={form.gender} onChange={e => update("gender", e.target.value)} className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">อายุ</label>
                          <input value={form.age} onChange={e => update("age", e.target.value)} className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">น้ำหนัก</label>
                          <input value={form.weight} onChange={e => update("weight", e.target.value)} className="vet-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">สี</label>
                          <input value={form.color} onChange={e => update("color", e.target.value)} className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">ไมโครชิป</label>
                          <input value={form.microchip} onChange={e => update("microchip", e.target.value)} className="vet-input" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="vet-divider">การดูแล</p>
                    <div className="vet-form-gap">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">หมอประจำตัว</label>
                          <input value={form.vetName} onChange={e => update("vetName", e.target.value)} className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">เบอร์ฉุกเฉิน</label>
                          <input value={form.emergencyPhone} onChange={e => update("emergencyPhone", e.target.value)} className="vet-input" />
                        </div>
                      </div>
                      <div>
                        <label className="vet-label">อาหาร</label>
                        <input value={form.food} onChange={e => update("food", e.target.value)} className="vet-input" />
                      </div>
                      <div>
                        <label className="vet-label">พฤติกรรมพิเศษ</label>
                        <textarea value={form.behavior} onChange={e => update("behavior", e.target.value)} className="vet-textarea" rows={2} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={() => onSave(form)} className="vet-btn vet-btn-primary btn-green ml-auto">
                  <Check className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   Add Service Modal
   ═══════════════════════════════════════════════════════ */
function AddServiceModal({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave: (sv: ServiceItem) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1 ครั้ง");
  const [price, setPrice] = useState("");

  const handleSelectService = (s: string) => {
    setName(s);
    setPrice(String(servicePrices[s] || ""));
  };

  const handleSave = () => {
    if (!name || !price) return;
    onSave({ id: 0, name, description: desc, qty, price: parseFloat(price), icon: "sparkles" });
    setName(""); setDesc(""); setQty("1 ครั้ง"); setPrice("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[480px] vet-modal"
              style={{ height: "min(560px, calc(100vh - 2rem))" }}
            >
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon"><Sparkles className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="vet-section-title">เพิ่มบริการเสริม</h2>
                      <p className="vet-tiny mt-[2px]">เลือกหรือกรอกบริการใหม่</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
              <div className="vet-modal-body">
                <div className="space-y-[20px]">
                  <div>
                    <p className="vet-divider">เลือกบริการ</p>
                    <div className="flex flex-wrap gap-2">
                      {availableServices.map(s => (
                        <button key={s} onClick={() => handleSelectService(s)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${name === s ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                          style={{ fontWeight: name === s ? 600 : 400 }}>
                          {name === s && <Check className="w-3 h-3 inline mr-1" />}{s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="vet-divider">รายละเอียด</p>
                    <div className="vet-form-gap">
                      <div>
                        <label className="vet-label">ชื่อบริการ <span className="required">*</span></label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อบริการ" className="vet-input" />
                      </div>
                      <div>
                        <label className="vet-label">คำอธิบาย</label>
                        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="รายละเอียดเพิ่มเติม" className="vet-input" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">จำนวน</label>
                          <input value={qty} onChange={e => setQty(e.target.value)} className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">ราคา (บาท) <span className="required">*</span></label>
                          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" min="0" className="vet-input" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={handleSave} disabled={!name || !price} className="vet-btn vet-btn-primary btn-green ml-auto">
                  <Check className="w-4 h-4" /> เพิ่มบริการ
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   Add Activity Modal
   ═══════════════════════════════════════════════════════ */
function AddActivityModal({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave: (log: ActivityLog) => void;
}) {
  const [type, setType] = useState(activityTypes[0]);
  const [title, setTitle] = useState("");
  const [staff, setStaff] = useState("");

  const handleSave = () => {
    if (!title) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} น.`;
    onSave({
      id: 0,
      title: `${type} — ${title}`,
      date: "12 มี.ค.",
      time,
      staff: staff || "ไม่ระบุ",
      color: activityColors[type] || "#6b7280",
    });
    setTitle(""); setStaff(""); setType(activityTypes[0]);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[440px] vet-modal"
              style={{ height: "min(480px, calc(100vh - 2rem))" }}
            >
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon"><ActivityIcon className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="vet-section-title">บันทึกกิจกรรม</h2>
                      <p className="vet-tiny mt-[2px]">เพิ่มรายการกิจกรรมใหม่</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
              <div className="vet-modal-body">
                <div className="space-y-[20px]">
                  <div>
                    <p className="vet-divider">ประเภทกิจกรรม</p>
                    <div className="flex flex-wrap gap-2">
                      {activityTypes.map(t => (
                        <button key={t} onClick={() => setType(t)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${type === t ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                          style={{ fontWeight: type === t ? 600 : 400 }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="vet-divider">รายละเอียด</p>
                    <div className="vet-form-gap">
                      <div>
                        <label className="vet-label">รายละเอียด <span className="required">*</span></label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น Royal Canin 250g กินหมด" className="vet-input" />
                      </div>
                      <div>
                        <label className="vet-label">ผู้ดำเนินการ</label>
                        <input value={staff} onChange={e => setStaff(e.target.value)} placeholder="ชื่อพนักงาน" className="vet-input" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={handleSave} disabled={!title} className="vet-btn vet-btn-primary btn-green ml-auto">
                  <Check className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   Check-in Wizard Modal (4 Steps)
   ═══════════════════════════════════════════════════════ */
interface CheckInFormData {
  weight: string;
  temperature: string;
  healthStatus: "ปกติ" | "เครียด" | "ป่วย";
  healthSymptoms: string;
  food: string;
  medications: string;
  specialNotes: string;
  photos: string[];
  equipment: { name: string; qty: string; note: string }[];
  deposit: number;
  kennelCard: boolean;
  feedingSchedule: string;
  assignedStaff: string;
}

const CHECKIN_STEPS = [
  { label: "ยืนยันการเข้าพัก", icon: ClipboardCheck },
  { label: "ตรวจสอบข้อมูลสัตว์", icon: PawPrint },
  { label: "บันทึกสภาพ/มัดจำ", icon: Stethoscope },
  { label: "อุปกรณ์/Kennel Card", icon: Package },
];

const defaultEquipment = [
  { name: "สายจูง", qty: "1", note: "" },
  { name: "ชามอาหาร", qty: "1", note: "" },
  { name: "ผ้าห่ม/ที่นอน", qty: "1", note: "" },
];

function CheckInWizardModal({ open, booking, petDetail, onClose, onComplete }: {
  open: boolean;
  booking: BookingData;
  petDetail: PetDetail;
  onClose: () => void;
  onComplete: (data: CheckInFormData) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckInFormData>({
    weight: petDetail.weight.replace(" กก.", ""),
    temperature: "38.5",
    healthStatus: "ปกติ",
    healthSymptoms: "ปกติ สมบูรณ์ดี",
    food: petDetail.food,
    medications: "",
    specialNotes: petDetail.behavior,
    photos: [],
    equipment: [...defaultEquipment.map(e => ({ ...e }))],
    deposit: 1000,
    kennelCard: false,
    feedingSchedule: "เช้า 08:00 / เย็น 18:00",
    assignedStaff: "สมศรี",
  });
  const [confirmed, setConfirmed] = useState(false);
  const [petVerified, setPetVerified] = useState(false);

  // Reset on open
  const handleOpen = () => {
    setStep(0);
    setConfirmed(false);
    setPetVerified(false);
    setForm({
      weight: petDetail.weight.replace(" กก.", ""),
      temperature: "38.5",
      healthStatus: "ปกติ",
      healthSymptoms: "ปกติ สมบูรณ์ดี",
      food: petDetail.food,
      medications: "",
      specialNotes: petDetail.behavior,
      photos: [],
      equipment: [...defaultEquipment.map(e => ({ ...e }))],
      deposit: 1000,
      kennelCard: false,
      feedingSchedule: "เช้า 08:00 / เย็น 18:00",
      assignedStaff: "สมศรี",
    });
  };

  const addEquipment = () => {
    setForm(prev => ({
      ...prev,
      equipment: [...prev.equipment, { name: "", qty: "1", note: "" }],
    }));
  };

  const removeEquipment = (idx: number) => {
    setForm(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== idx),
    }));
  };

  const updateEquipment = (idx: number, field: "name" | "qty" | "note", val: string) => {
    setForm(prev => ({
      ...prev,
      equipment: prev.equipment.map((eq, i) => i === idx ? { ...eq, [field]: val } : eq),
    }));
  };

  const addPhotoPlaceholder = () => {
    const placeholders = [
      "https://images.unsplash.com/photo-1770836037793-95bdbf190f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    ];
    setForm(prev => ({
      ...prev,
      photos: [...prev.photos, placeholders[prev.photos.length % placeholders.length]],
    }));
  };

  const canProceed = () => {
    if (step === 0) return confirmed;
    if (step === 1) return petVerified;
    if (step === 2) return !!form.weight && !!form.temperature && form.deposit >= 500;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(form);
  };

  const bookingCode = `#BK-2025-${String(booking.id).padStart(4, "0")}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}
            onAnimationStart={handleOpen} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[600px] vet-modal flex flex-col"
              style={{ height: "min(720px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl flex-shrink-0">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon"><ClipboardCheck className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="vet-section-title">Check-in รับสัตว์เข้าพัก</h2>
                      <p className="vet-tiny mt-[2px]">{booking.petName} · {bookingCode}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  {CHECKIN_STEPS.map((s, i) => {
                    const StepIcon = s.icon;
                    const isActive = i === step;
                    const isDone = i < step;
                    return (
                      <div key={i} className="flex items-center flex-1">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isDone ? "bg-[#19a589] text-white" : isActive ? "bg-[#19a589] text-white shadow-md" : "bg-gray-200 text-gray-400"
                          }`} style={isActive ? { boxShadow: "0 2px 8px rgba(25,165,137,0.3)" } : {}}>
                            {isDone ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[10px] leading-tight hidden sm:block ${isActive ? "text-[#19a589]" : isDone ? "text-gray-600" : "text-gray-400"}`}
                            style={{ fontWeight: isActive ? 600 : 400 }}>
                            {s.label}
                          </span>
                        </div>
                        {i < CHECKIN_STEPS.length - 1 && (
                          <div className={`flex-1 h-[2px] mx-2 rounded-full ${isDone ? "bg-[#19a589]" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body flex-1 min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step === 0 && (
                      <Step1Confirm
                        booking={booking}
                        petDetail={petDetail}
                        confirmed={confirmed}
                        onToggle={() => setConfirmed(!confirmed)}
                      />
                    )}
                    {step === 1 && (
                      <Step2VerifyPet
                        petDetail={petDetail}
                        verified={petVerified}
                        onToggle={() => setPetVerified(!petVerified)}
                      />
                    )}
                    {step === 2 && (
                      <Step3Condition
                        form={form}
                        setForm={setForm}
                        onAddPhoto={addPhotoPlaceholder}
                      />
                    )}
                    {step === 3 && (
                      <Step4Equipment
                        equipment={form.equipment}
                        onAdd={addEquipment}
                        onRemove={removeEquipment}
                        onUpdate={updateEquipment}
                        kennelCard={form.kennelCard}
                        onToggleKennel={() => setForm(prev => ({ ...prev, kennelCard: !prev.kennelCard }))}
                        assignedStaff={form.assignedStaff}
                        onChangeStaff={(v) => setForm(prev => ({ ...prev, assignedStaff: v }))}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer flex-shrink-0">
                {step > 0 ? (
                  <button onClick={() => setStep(step - 1)} className="vet-btn vet-btn-secondary">
                    <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
                  </button>
                ) : (
                  <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="vet-btn vet-btn-primary btn-green ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step < 3 ? (
                    <>ถัดไป <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <><Check className="w-4 h-4" /> ยืนยัน Check-in</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Step 1: ยืนยันการเข้าพัก ── */
function Step1Confirm({ booking, petDetail, confirmed, onToggle }: {
  booking: BookingData; petDetail: PetDetail; confirmed: boolean; onToggle: () => void;
}) {
  const nights = 6;
  return (
    <div className="space-y-[20px]">
      <div>
        <p className="vet-divider">ข้อมูลการจอง</p>
        <div className="vet-form-gap">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
              <img src={booking.photo} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{booking.petName}</p>
              <p className="text-[11px] text-gray-500">{booking.breed} · {petDetail.gender}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">เจ้าของ</p>
              <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>{booking.ownerName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "วัน Check-in", value: booking.checkIn, icon: Calendar },
              { label: "วัน Check-out", value: booking.checkOut, icon: Calendar },
              { label: "ห้องพัก", value: `${booking.roomNumber} — ${booking.roomType}`, icon: BedDouble },
              { label: "จำนวนคืน", value: `${nights} คืน`, icon: Clock },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-[#19a589]/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-[#19a589]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>{f.label}</p>
                  <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="vet-divider">บริการเสริมที่จอง</p>
        <div className="space-y-1.5">
          {booking.services.length > 0 ? booking.services.map((sv, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
              <Check className="w-3.5 h-3.5 text-[#19a589]" />
              <span className="text-xs text-gray-700">{sv}</span>
            </div>
          )) : (
            <p className="text-xs text-gray-400 px-3 py-2">ไม่มีบริการเสริม</p>
          )}
        </div>
      </div>
      <div>
        <p className="vet-divider">ยืนยัน</p>
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all ${
            confirmed
              ? "border-[#19a589] bg-[#19a589]/5"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            confirmed ? "border-[#19a589] bg-[#19a589]" : "border-gray-300"
          }`}>
            {confirmed && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className={`text-xs text-left ${confirmed ? "text-[#19a589]" : "text-gray-600"}`} style={{ fontWeight: 500 }}>
            ข้าพเจ้ายืนยันว่าข้อมูลการจองถูกต้องครบถ้วน พร้อมรับสัตว์เข้าพัก
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: ตรวจสอบข้อมูลสัตว์ ── */
function Step2VerifyPet({ petDetail, verified, onToggle }: {
  petDetail: PetDetail; verified: boolean; onToggle: () => void;
}) {
  return (
    <div className="space-y-[20px]">
      <div>
        <p className="vet-divider">ข้อมูลทั่วไป</p>
        <div className="vet-form-gap">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "ชื่อ", value: petDetail.name },
              { label: "สายพันธุ์", value: petDetail.breed },
              { label: "เพศ", value: petDetail.gender },
              { label: "อายุ", value: petDetail.age },
              { label: "น้ำหนัก", value: petDetail.weight },
              { label: "สี", value: petDetail.color },
            ].map(f => (
              <div key={f.label} className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>{f.label}</p>
                <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="vet-divider">ข้อมูลทางการแพทย์</p>
        <div className="vet-form-gap">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>ไมโครชิป</p>
              <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{petDetail.microchip}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>หมอประจำตัว</p>
              <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{petDetail.vetName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {petDetail.vaccines.map((v, i) => {
              const colors = ["bg-green-50 text-green-700 border-green-200", "bg-blue-50 text-blue-700 border-blue-200", "bg-purple-50 text-purple-700 border-purple-200", "bg-red-50 text-red-700 border-red-200", "bg-amber-50 text-amber-700 border-amber-200"];
              return (
                <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full border ${colors[i % colors.length]}`} style={{ fontWeight: 500 }}>
                  <Check className="w-3 h-3" /> {v}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <p className="vet-divider">การดูแลพิเศษ</p>
        <div className="vet-form-gap">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>🍖 อาหาร</p>
            <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{petDetail.food}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>🐾 พฤติกรรม</p>
            <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{petDetail.behavior}</p>
          </div>
        </div>
      </div>
      <div>
        <p className="vet-divider">ยืนยัน</p>
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all ${
            verified
              ? "border-[#19a589] bg-[#19a589]/5"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            verified ? "border-[#19a589] bg-[#19a589]" : "border-gray-300"
          }`}>
            {verified && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className={`text-xs text-left ${verified ? "text-[#19a589]" : "text-gray-600"}`} style={{ fontWeight: 500 }}>
            ตรวจสอบข้อมูลสัตว์เลี้ยงแล้ว ข้อมูลถูกต้องครบถ้วน
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: บันทึกสภาพสัตว์ + มัดจำ ── */
function Step3Condition({ form, setForm, onAddPhoto }: {
  form: CheckInFormData;
  setForm: React.Dispatch<React.SetStateAction<CheckInFormData>>;
  onAddPhoto: () => void;
}) {
  const update = (key: keyof CheckInFormData, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-[20px]">
      <div>
        <p className="vet-divider">สัญญาณชีพ</p>
        <div className="vet-form-gap">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="vet-label">น้ำหนัก (กก.) <span className="required">*</span></label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.weight} onChange={e => update("weight", e.target.value)}
                  placeholder="เช่น 28" className="vet-input !pl-9" type="number" step="0.1" />
              </div>
            </div>
            <div>
              <label className="vet-label">อุณหภูมิ (°C) <span className="required">*</span></label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.temperature} onChange={e => update("temperature", e.target.value)}
                  placeholder="เช่น 38.5" className="vet-input !pl-9" type="number" step="0.1" />
              </div>
            </div>
            <div>
              <label className="vet-label">สถานะสุขภาพ</label>
              <div className="flex gap-1">
                {(["ปกติ", "เครียด"] as const).map(s => (
                  <button key={s}
                    onClick={() => setForm(prev => ({ ...prev, healthStatus: s }))}
                    className={`flex-1 px-2 py-2.5 text-[11px] rounded-lg border transition-all ${
                      form.healthStatus === s
                        ? s === "ปกติ" ? "border-green-400 bg-green-50 text-green-700" : "border-yellow-400 bg-yellow-50 text-yellow-700"
                        : "border-gray-200 text-gray-400"
                    }`} style={{ fontWeight: form.healthStatus === s ? 600 : 400 }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="vet-divider">มัดจำกรง</p>
        <div className="vet-form-gap">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="vet-label">จำนวนมัดจำ (500-2,000 บาท) <span className="required">*</span></label>
              <input type="number" value={form.deposit}
                onChange={e => setForm(prev => ({ ...prev, deposit: Math.max(500, Math.min(2000, Number(e.target.value))) }))}
                min="500" max="2000" step="100" className="vet-input" />
            </div>
            <div className="flex items-end">
              <div className="flex gap-1.5 pb-0.5">
                {[500, 1000, 1500, 2000].map(d => (
                  <button key={d} onClick={() => setForm(prev => ({ ...prev, deposit: d }))}
                    className={`px-2.5 py-1.5 text-[10px] rounded-lg border transition-all ${
                      form.deposit === d ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-400"
                    }`} style={{ fontWeight: form.deposit === d ? 600 : 400 }}>฿{d.toLocaleString()}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="vet-divider">อาหารและยา</p>
        <div className="vet-form-gap">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="vet-label">อาหาร</label>
              <input value={form.food} onChange={e => update("food", e.target.value)}
                placeholder="เช่น Royal Canin Adult 250g/มื้อ" className="vet-input" />
            </div>
            <div>
              <label className="vet-label">ตารางให้อาหาร</label>
              <input value={form.feedingSchedule} onChange={e => update("feedingSchedule", e.target.value)}
                placeholder="เช่น เช้า 08:00 / เย็น 18:00" className="vet-input" />
            </div>
          </div>
          <div>
            <label className="vet-label">ยา/อาหารเสริม</label>
            <textarea value={form.medications} onChange={e => update("medications", e.target.value)}
              placeholder="เช่น Apoquel 16mg วันละ 1 เม็ด (ถ้าไม่มีเว้นว่าง)" className="vet-textarea" rows={2} />
          </div>
        </div>
      </div>

      <div>
        <p className="vet-divider">ถ่ายรูปสัตว์ + อุปกรณ์ส่วนตัว</p>
        <div className="flex gap-2.5 flex-wrap">
          {form.photos.map((p, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 group">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setForm(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          <button onClick={onAddPhoto}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-[#19a589] hover:text-[#19a589] transition-colors">
            <Camera className="w-4 h-4" /><span className="text-[8px] mt-0.5">ถ่ายรูป</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: อุปกรณ์ + Kennel Card ── */
function Step4Equipment({ equipment, onAdd, onRemove, onUpdate, kennelCard, onToggleKennel, assignedStaff, onChangeStaff }: {
  equipment: { name: string; qty: string; note: string }[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, field: "name" | "qty" | "note", val: string) => void;
  kennelCard: boolean;
  onToggleKennel: () => void;
  assignedStaff: string;
  onChangeStaff: (v: string) => void;
}) {
  const suggestedItems = ["สายจูง", "ชามอาหาร", "ผ้าห่ม/ที่นอน", "ของเล่น", "อาหาร", "ยา/อาหารเสริม", "ปลอกคอ", "กรงเสริม"];
  const staffOptions = ["สมศรี", "วิภา", "ญาณี", "สุภาน", "สมโชค", "ทินนท์"];

  return (
    <div className="space-y-[20px]">
      <div>
        <p className="vet-divider">เพิ่มอุปกรณ์ด่วน</p>
        <div className="flex flex-wrap gap-2">
          {suggestedItems.map(item => {
            const exists = equipment.some(eq => eq.name === item);
            return (
              <button
                key={item}
                onClick={() => {
                  if (!exists) {
                    onAdd();
                    // Update the last item with the suggested name
                    setTimeout(() => onUpdate(equipment.length, "name", item), 0);
                  }
                }}
                disabled={exists}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  exists
                    ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
                style={{ fontWeight: exists ? 600 : 400 }}
              >
                {exists && <Check className="w-3 h-3 inline mr-1" />}{item}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="vet-divider">รายการอุปกรณ์</p>
        <div className="space-y-2">
          {equipment.map((eq, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl group">
              <div className="w-7 h-7 rounded-lg bg-[#19a589]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-3.5 h-3.5 text-[#19a589]" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="grid grid-cols-[1fr_60px] gap-2">
                  <input
                    value={eq.name}
                    onChange={e => onUpdate(i, "name", e.target.value)}
                    placeholder="ชื่ออุปกรณ์"
                    className="vet-input !py-1.5 text-xs"
                  />
                  <input
                    value={eq.qty}
                    onChange={e => onUpdate(i, "qty", e.target.value)}
                    placeholder="จำนวน"
                    className="vet-input !py-1.5 text-xs text-center"
                  />
                </div>
                <input
                  value={eq.note}
                  onChange={e => onUpdate(i, "note", e.target.value)}
                  placeholder="หมายเหตุ (สี, สภาพ, ยี่ห้อ ฯลฯ)"
                  className="vet-input !py-1.5 text-xs text-gray-400"
                />
              </div>
              <button
                onClick={() => onRemove(i)}
                className="p-1 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 mt-3 px-3 py-1.5 text-xs text-[#19a589] border border-dashed border-[#19a589]/30 rounded-full hover:bg-[#19a589]/5 transition-all"
          style={{ fontWeight: 500 }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มอุปกรณ์
        </button>
      </div>
      {/* Kennel Card & Staff */}
      <div>
        <p className="vet-divider">Kennel Card & พนักงานดูแล</p>
        <div className="vet-form-gap">
          <div>
            <label className="vet-label">พนักงานดูแลหลัก</label>
            <select value={assignedStaff} onChange={e => onChangeStaff(e.target.value)} className="vet-input">
              {staffOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={onToggleKennel}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              kennelCard ? "border-[#19a589] bg-[#19a589]/5" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${kennelCard ? "bg-[#19a589]" : "bg-gray-200"}`}>
              {kennelCard && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className="text-left flex-1">
              <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>พิมพ์ Kennel Card</p>
              <p className="text-[10px] text-gray-400">ชื่อสัตว์, ตารางอาหาร, ยา, พนักงานดูแล</p>
            </div>
          </button>
        </div>
      </div>

      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-amber-700" style={{ fontWeight: 600 }}>ข้อควรระวัง</p>
            <p className="text-[11px] text-amber-600 mt-0.5 leading-relaxed">
              ตรวจสอบอุปกรณ์ให้ครบถ้วน และพิมพ์ Kennel Card ติดหน้ากรง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}