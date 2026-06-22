import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Printer, Send, X, Check, Edit2, Plus,
  User, Phone, Calendar, BedDouble, Clock, PawPrint,
  Utensils, Pill, Bath, Sparkles, FileText, Heart,
  Camera, AlertTriangle, Mail, MapPin, MessageCircle, CreditCard,
  Shield, Activity as ActivityIcon, Trash2, Pencil,
  ClipboardCheck, Package, Scale, Stethoscope,
  Thermometer, UserCheck, ClipboardList, LogIn,
  ChevronDown, Video, Hourglass, Receipt, Banknote, LogOut, PartyPopper,
  CalendarDays,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { CheckOutWizardModal } from "./CheckOutWizard";
import { BoardingPaymentModal } from "./BoardingPaymentModal";
import { DailyCareDashboard, AddDailyLogModal, mockDailyLogs } from "./DailyCareLog";
import type { DailyLogEntry } from "./DailyCareLog";

/* ═══════════════════════════════════════════════════════
   Types (mirror from Boarding)
   ═══════════════════════════════════════════════════════ */
type BookingStatus = "ลงทะเบียน" | "เช็คอิน" | "ฝากเลี้ยง" | "ชำระเงิน" | "เช็คเอาท์";

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
  "ลงทะเบียน": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "#fbbf24" },
  "เช็คอิน": { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400", border: "#2dd4bf" },
  "ฝากเลี้ยง": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "#34d399" },
  "ชำระเงิน": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400", border: "#a78bfa" },
  "เช็คเอาท์": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", border: "#60a5fa" },
};

const STATUS_FLOW: BookingStatus[] = ["ลงทะเบียน", "เช็คอิน", "ฝากเลี้ยง", "ชำระเงิน", "เช็คเอาท์"];
const NEXT_STATUS_LABEL: Record<BookingStatus, string> = {
  "ลงทะเบียน": "เช็คอิน",
  "เช็คอิน": "ฝากเลี้ยง",
  "ฝากเลี้ยง": "ชำระเงิน",
  "ชำระเงิน": "เช็คเอาท์",
  "เช็คเอาท์": "",
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

/* ── Activity Schedule + Extra Expense types ── */
interface ScheduleItem {
  id: number;
  time: string;            // "08:00"
  type: string;            // matches activityTypes
  detail: string;
  staff?: string;
  status: "pending" | "done";
  media: { kind: "photo" | "video"; url: string }[];
  completedAt?: string;
}

interface ExtraExpense {
  id: number;
  date: string;
  title: string;
  category: "ยา" | "อุปกรณ์" | "บริการเพิ่ม" | "อื่นๆ";
  amount: number;
  note?: string;
}

const expenseCategoryColor: Record<ExtraExpense["category"], string> = {
  "ยา": "#ef4444",
  "อุปกรณ์": "#3b82f6",
  "บริการเพิ่ม": "#19a589",
  "อื่นๆ": "#6b7280",
};

function getDefaultSchedule(): ScheduleItem[] {
  return [
    { id: 1, time: "07:00", type: "พาเดินเล่น", detail: "เดินยามเช้า 20 นาที", staff: "สุภาน", status: "done", media: [{ kind: "photo", url: "https://placehold.co/240x240/d1fae5/065f46?text=Walk" }], completedAt: "07:18 น." },
    { id: 2, time: "08:00", type: "ให้อาหาร", detail: "Royal Canin 250g", staff: "ญาณี", status: "done", media: [{ kind: "photo", url: "https://placehold.co/240x240/fef3c7/92400e?text=Meal" }], completedAt: "08:05 น." },
    { id: 3, time: "11:00", type: "อาบน้ำ", detail: "อาบน้ำ + เป่าขน", staff: "วิภา", status: "pending", media: [] },
    { id: 4, time: "13:00", type: "ตรวจสุขภาพ", detail: "วัดอุณหภูมิช่วงบ่าย", staff: "สมโชค", status: "pending", media: [] },
    { id: 5, time: "16:00", type: "พาเดินเล่น", detail: "เดินตอนเย็น 30 นาที", staff: "สุภาน", status: "pending", media: [] },
    { id: 6, time: "18:00", type: "ให้อาหาร", detail: "Royal Canin 250g", staff: "ญาณี", status: "pending", media: [] },
  ];
}

function getDefaultExtraExpenses(): ExtraExpense[] {
  return [];
}

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
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
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

  // Schedule + extra expenses (Active stage)
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => getDefaultSchedule());
  const [extraExpenses, setExtraExpenses] = useState<ExtraExpense[]>(() => getDefaultExtraExpenses());
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExtraExpense | null>(null);

  // History accordion open state
  const [openHistory, setOpenHistory] = useState<Record<string, boolean>>({
    petInfo: false, services: false, owner: false, photos: false,
    checkInRecord: false, activities: false,
  });
  const toggleHistory = (k: string) => setOpenHistory(prev => ({ ...prev, [k]: !prev[k] }));

  // Check-in inline form state
  const checkInRef = useRef<HTMLDivElement>(null);
  const DEP_OPTS = [500, 800, 1000, 1500, 2000];
  const [ciWeight, setCiWeight] = useState(booking.weight || "");
  const [ciTemp, setCiTemp] = useState(booking.temperature || "101.3");
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
  const totalExtras = extraExpenses.reduce((s, e) => s + e.amount, 0);
  const deposit = booking.deposit || 0;
  const subTotal = totalServices + totalExtras;
  const vat = Math.round(subTotal * 0.07);
  const payable = subTotal + vat - deposit;
  const statusIdx = STATUS_FLOW.indexOf(booking.status);
  const nextLabel = NEXT_STATUS_LABEL[booking.status];
  const bookingCode = `#BK-2025-${String(booking.id).padStart(4, "0")}`;
  const scheduleDone = schedule.filter(s => s.status === "done").length;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-4"
    >
      {/* ── Top bar (breadcrumb + actions) ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0" style={{ fontWeight: 500 }}>
            <ChevronLeft className="w-3.5 h-3.5" /> กลับ
          </button>
          <div className="flex items-center gap-2 min-w-0 text-[12px]">
            <span className="text-gray-400">ระบบฝากเลี้ยง</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 truncate" style={{ fontWeight: 600 }}>{booking.petName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-gray-700 hover:bg-gray-100 transition-colors" style={{ fontWeight: 500 }}>
            <Printer className="w-3 h-3" /> <span className="hidden sm:inline">พิมพ์ใบจอง</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-gray-700 hover:bg-gray-100 transition-colors" style={{ fontWeight: 500 }}>
            <Send className="w-3 h-3" /> <span className="hidden sm:inline">ส่งให้เจ้าของ</span>
          </button>
        </div>
      </motion.div>

      {/* ── Pet Hero Banner (photo + dark overlay) ── */}
      <motion.div variants={fadeUp} className="relative rounded-3xl overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <img src={booking.photo} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(36px) saturate(150%)", transform: "scale(1.4)" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.52) 100%)" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45) 50%, transparent)" }} />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            {/* Pet photo + identity */}
            <div className="flex items-center gap-4 lg:flex-1 min-w-0">
              <div className="rounded-full p-[3px] flex-shrink-0" style={{ background: "conic-gradient(from 180deg, #a78bfa, #ec4899, #f59e0b, #22c55e, #3b82f6, #a78bfa)", boxShadow: "0 10px 28px rgba(0,0,0,0.30)" }}>
                <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden bg-gray-200">
                  <img src={booking.photo} alt={booking.petName} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] text-white" style={{ fontWeight: 600, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> {booking.status}
                  </span>
                  <span className="text-[10px] text-white/70">{bookingCode}</span>
                </div>
                <h2 className="text-white truncate leading-tight" style={{ fontWeight: 700, fontSize: 24, letterSpacing: "-0.4px", textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>{booking.petName}</h2>
                <p className="text-white/85 text-xs mt-0.5" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}>{booking.breed} · {petDetail.gender} · {petDetail.age} · {petDetail.weight}</p>
              </div>
            </div>

            {/* Quick stats — glass chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:max-w-[560px] lg:flex-1">
              {[
                { icon: BedDouble, label: "ห้อง",     value: `${booking.roomNumber} · ${booking.roomType}` },
                { icon: User,      label: "เจ้าของ",  value: booking.ownerName },
                { icon: Clock,     label: "ระยะเวลา", value: `${nights} คืน` },
                { icon: Calendar,  label: "เข้าพัก",   value: booking.checkIn },
              ].map(f => {
                const Fico = f.icon;
                return (
                  <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.25)" }}>
                      <Fico className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wider text-white/60" style={{ fontWeight: 600, letterSpacing: "0.05em" }}>{f.label}</p>
                      <p className="text-xs truncate text-white" style={{ fontWeight: 600 }}>{f.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Stage Timeline ── */}
          <div className="relative pt-4 mt-2 border-t border-white/15">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-center flex-shrink-0">
                <p className="text-[9px] uppercase tracking-wider text-white/60" style={{ fontWeight: 600, letterSpacing: "0.06em" }}>CHECK-IN</p>
                <p className="text-xs mt-0.5 text-white" style={{ fontWeight: 700 }}>{booking.checkIn}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{
                    width: `${Math.min(100, Math.max(10, (statusIdx / (STATUS_FLOW.length - 1)) * 100))}%`,
                    background: "linear-gradient(90deg, #6ee7b7, #34d399)",
                  }} />
                </div>
                <div className="flex justify-between mt-2">
                  {STATUS_FLOW.map((s, i) => {
                    const done   = i <  statusIdx;
                    const active = i === statusIdx;
                    return (
                      <div key={s} className="flex flex-col items-center" style={{ width: `${100 / STATUS_FLOW.length}%` }}>
                        <div className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                          style={{
                            background: done || active ? "#34d399" : "rgba(255,255,255,0.25)",
                            borderColor: done || active ? "#34d399" : "rgba(255,255,255,0.40)",
                            boxShadow: active ? "0 0 0 3px rgba(52,211,153,0.35)" : undefined,
                          }}>
                          {done && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[9px] mt-1 text-center leading-tight"
                          style={{ fontWeight: active ? 700 : 500, color: active ? "#ffffff" : done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)" }}>
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-center flex-shrink-0">
                <p className="text-[9px] uppercase tracking-wider text-white/60" style={{ fontWeight: 600, letterSpacing: "0.06em" }}>CHECK-OUT</p>
                <p className="text-xs mt-0.5 text-white" style={{ fontWeight: 700 }}>{booking.checkOut}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════ Main 2-column area: stage panel + history (left) · sticky cost (right) ══════ */}

      {/* Hidden ref target so existing scrollIntoView still works */}
      <div ref={checkInRef} aria-hidden style={{ height: 0 }} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-4 items-start">
        {/* ─── Left: current stage panel + collapsible history sections ─── */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4 min-w-0">
          <CurrentStagePanel
            booking={booking}
            petDetail={petDetail}
            services={services}
            schedule={schedule}
            extraExpenses={extraExpenses}
            dailyLogs={dailyLogs}
            currentHealthColor={currentHealthColor}
            nights={nights}
            subTotal={subTotal}
            vat={vat}
            deposit={deposit}
            payable={payable}
            scheduleDone={scheduleDone}
            // check-in form state (used by CheckInStagePanel)
            ciRef={checkInRef}
            ciWeight={ciWeight} setCiWeight={setCiWeight}
            ciTemp={ciTemp} setCiTemp={setCiTemp}
            ciHealth={ciHealth} setCiHealth={setCiHealth}
            ciDeposit={ciDeposit} setCiDeposit={setCiDeposit}
            ciKennel={ciKennel} setCiKennel={setCiKennel}
            ciCaretaker={ciCaretaker} setCiCaretaker={setCiCaretaker}
            ciFeeding={ciFeeding} setCiFeeding={setCiFeeding}
            ciMeds={ciMeds} setCiMeds={setCiMeds}
            ciPhotos={ciPhotos} setCiPhotos={setCiPhotos}
            ciKennelCard={ciKennelCard} setCiKennelCard={setCiKennelCard}
            ciValid={ciValid}
            onCheckInSubmit={handleCheckInSubmit}
            // actions
            onStartCheckIn={() => onAdvance(booking)}
            onOpenSchedule={() => setShowAddSchedule(true)}
            onEditSchedule={(item) => { setEditingSchedule(item); setShowAddSchedule(true); }}
            onToggleScheduleStatus={(id) => setSchedule(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "done" ? "pending" : "done", completedAt: s.status === "done" ? undefined : new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น." } : s))}
            onDeleteSchedule={(id) => setSchedule(prev => prev.filter(s => s.id !== id))}
            onAddScheduleMedia={(id, kind) => {
              const url = kind === "photo"
                ? "https://placehold.co/240x240/d1fae5/065f46?text=Photo"
                : "https://placehold.co/240x240/ddd6fe/5b21b6?text=Video";
              setSchedule(prev => prev.map(s => s.id === id ? { ...s, media: [...s.media, { kind, url }] } : s));
              showSnackbar("success", kind === "photo" ? "เพิ่มรูปแล้ว" : "เพิ่มวิดีโอแล้ว");
            }}
            onOpenExpense={() => { setEditingExpense(null); setShowAddExpense(true); }}
            onEditExpense={(exp) => { setEditingExpense(exp); setShowAddExpense(true); }}
            onDeleteExpense={async (exp) => {
              const ok = await confirm({
                title: "ลบค่าใช้จ่าย",
                description: `ลบ "${exp.title}" — ฿${exp.amount.toLocaleString()} ออกจากรายการ?`,
                confirmLabel: "ลบ",
                kind: "danger",
              });
              if (!ok) return;
              setExtraExpenses(prev => prev.filter(e => e.id !== exp.id));
              showSnackbar("delete", `ลบ "${exp.title}" แล้ว`);
            }}
            onOpenDailyLog={() => setShowDailyLogModal(true)}
            onStartCheckOut={() => setShowCheckOutWizard(true)}
            onOpenPayment={() => setShowPaymentModal(true)}
            onAdvanceStatus={() => onAdvance(booking)}
          />

          {/* History sections (open cards) */}
          <div className="space-y-4">
          {/* ข้อมูลสัตว์เลี้ยง */}
          <Accordion
            icon={PawPrint}
            title="ข้อมูลสัตว์เลี้ยง"
            subtitle={`${petDetail.breed} · ${petDetail.gender} · ${petDetail.age}`}
            open={openHistory.petInfo}
            onToggle={() => toggleHistory("petInfo")}
            rightAction={
              <button onClick={(e) => { e.stopPropagation(); setShowEditPet(true); }} className="text-xs text-[#19a589] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
                <Edit2 className="w-3 h-3" /> แก้ไข
              </button>
            }
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: "ชื่อ", value: petDetail.name },
                  { label: "สายพันธุ์", value: petDetail.breed },
                  { label: "เพศ", value: petDetail.gender },
                  { label: "อายุ", value: petDetail.age },
                  { label: "น้ำหนัก", value: petDetail.weight },
                  { label: "สี", value: petDetail.color },
                  { label: "ไมโครชิป", value: petDetail.microchip },
                  { label: "หมอประจำตัว", value: petDetail.vetName },
                  { label: "เบอร์ฉุกเฉิน", value: petDetail.emergencyPhone },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>{f.label}</p>
                    <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>🍖 อาหาร</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{petDetail.food}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>🐾 พฤติกรรมพิเศษ</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{petDetail.behavior}</p>
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
          </Accordion>

          {/* Special notes (always visible if exists) */}
          {booking.notes && (
            <motion.div variants={fadeUp} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-700" style={{ fontWeight: 600 }}>ความต้องการพิเศษ</p>
                  <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">{petDetail.behavior}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* รูปภาพ */}
          <Accordion
            icon={Camera}
            title="รูปภาพระหว่างพัก"
            subtitle={`${photos.length} รูป`}
            open={openHistory.photos}
            onToggle={() => toggleHistory("photos")}
          >
            <div className="flex gap-3 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0 cursor-pointer hover:border-[#19a589] transition-colors">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-300 hover:border-[#19a589] hover:text-[#19a589] transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </Accordion>

          {/* Check-in record — visible only after check-in done */}
          {statusIdx >= STATUS_FLOW.indexOf("ฝากเลี้ยง") && (
            <Accordion
              icon={LogIn}
              title="บันทึก Check-in"
              subtitle={booking.checkInTime ? `เข้าพักเวลา ${booking.checkInTime}` : "เข้าพักแล้ว"}
              open={openHistory.checkInRecord}
              onToggle={() => toggleHistory("checkInRecord")}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { label: "น้ำหนัก", value: booking.weight ? `${booking.weight} กก.` : "—" },
                  { label: "อุณหภูมิ", value: booking.temperature ? `${booking.temperature} °F` : "—" },
                  { label: "สุขภาพ", value: booking.healthStatus || "—" },
                  { label: "มัดจำ", value: deposit > 0 ? `฿${deposit.toLocaleString()}` : "—" },
                  { label: "กรง", value: booking.kennelNumber || booking.roomNumber },
                  { label: "พนักงาน", value: booking.caretaker || "—" },
                  { label: "อาหาร", value: booking.feedingSchedule || "—" },
                  { label: "ยา", value: booking.medications || "ไม่มี" },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>{f.label}</p>
                    <p className="text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{f.value}</p>
                  </div>
                ))}
              </div>
              {(booking.checkinPhotos && booking.checkinPhotos.length > 0) && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {booking.checkinPhotos.map((u, i) => (
                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={u} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </Accordion>
          )}

          {/* Activity history — visible only after boarding is active or done */}
          {statusIdx >= STATUS_FLOW.indexOf("ฝากเลี้ยง") && (
            <Accordion
              icon={ActivityIcon}
              title="ประวัติการดูแลประจำวัน"
              subtitle={`${dailyLogs.length} บันทึก`}
              open={openHistory.activities}
              onToggle={() => toggleHistory("activities")}
              rightAction={
                <button onClick={(e) => { e.stopPropagation(); setShowDailyLogModal(true); }} className="text-xs text-[#19a589] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
                  <Plus className="w-3 h-3" /> เพิ่ม
                </button>
              }
            >
              <DailyCareDashboard
                logs={dailyLogs}
                currentHealthColor={currentHealthColor}
                onAddLog={() => setShowDailyLogModal(true)}
              />
            </Accordion>
          )}

          {/* Owner */}
          <Accordion
            icon={User}
            title="ข้อมูลเจ้าของ"
            subtitle={`${ownerDetail.name} · ${ownerDetail.memberType}`}
            open={openHistory.owner}
            onToggle={() => toggleHistory("owner")}
          >
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
              <div className="flex gap-2 mt-3">
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
          </Accordion>
          </div>
        </motion.div>

        {/* ─── Right: actions + sticky cost summary + services ─── */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          {/* การดำเนินการ */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
            <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-100">
                <ClipboardList className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>การดำเนินการ</p>
                <p className="text-[11px] text-gray-500">จัดการสถานะการจอง</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {nextLabel && (
                <button
                  onClick={() => {
                    if (booking.status === "ลงทะเบียน") { setShowCheckInWizard(true); }
                    else if (booking.status === "เช็คอิน") { checkInRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }
                    else if (booking.status === "ฝากเลี้ยง") { setShowPaymentModal(true); }
                    else if (booking.status === "ชำระเงิน") { setShowCheckOutWizard(true); }
                    else { setShowConfirmAdvance(true); }
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] text-white transition-all active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}
                >
                  {booking.status === "ฝากเลี้ยง" ? <CreditCard className="w-4 h-4" /> : <Check className="w-4 h-4" />} {nextLabel}
                </button>
              )}
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[12px] text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors" style={{ fontWeight: 500 }}>
                <X className="w-3.5 h-3.5" /> ยกเลิกการจอง
              </button>
            </div>
          </motion.div>

          {/* สรุปค่าใช้จ่าย */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-4 pt-3.5 pb-2 border-b border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="relative flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>สรุปค่าใช้จ่าย</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">บริการ ({services.length} รายการ)</span>
                <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{totalServices.toLocaleString()}</span>
              </div>
              {extraExpenses.length > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ค่าใช้จ่ายเพิ่ม ({extraExpenses.length})</span>
                  <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{totalExtras.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">VAT 7%</span>
                <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{vat.toLocaleString()}</span>
              </div>
              {deposit > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#19a589]">หักมัดจำ</span>
                  <span className="text-[#19a589]" style={{ fontWeight: 500 }}>-฿{deposit.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2.5 mt-1">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ชำระสุทธิ</span>
                  <span className="text-xl text-[#19a589]" style={{ fontWeight: 800 }}>฿{Math.max(0, payable).toLocaleString()}</span>
                </div>
              </div>
              {deposit > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full bg-[#19a589]/10 text-[#19a589] border border-[#19a589]/15" style={{ fontWeight: 500 }}>
                    <Check className="w-3 h-3" /> รับมัดจำแล้ว
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* บริการเสริมที่จอง */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden px-4 pt-3.5 pb-2 border-b border-[#19a589]/10 flex items-center justify-between gap-2" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 60%, #f3faf8 100%)" }}>
              <div className="relative flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>บริการเสริม</p>
                  <p className="text-[10px] text-gray-400">{services.length} รายการ · ฿{totalServices.toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setShowAddService(true)} className="text-[11px] text-[#19a589] hover:underline flex items-center gap-1 flex-shrink-0" style={{ fontWeight: 600 }}>
                <Plus className="w-3 h-3" /> เพิ่ม
              </button>
            </div>
            <div className="p-2 space-y-1 max-h-[360px] overflow-y-auto">
              {services.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">ยังไม่มีบริการเสริม</p>
              )}
              {services.map((sv) => {
                const iconMap: Record<string, typeof BedDouble> = { bed: BedDouble, bath: Bath, heart: Heart, camera: Camera };
                const Icon = iconMap[sv.icon] || Sparkles;
                return (
                  <div key={sv.id} className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-7 h-7 rounded-lg bg-[#19a589]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-[#19a589]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{sv.name}</p>
                        <span className="text-xs text-gray-800 flex-shrink-0" style={{ fontWeight: 700 }}>฿{sv.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-[10px] text-gray-400 truncate">{sv.qty}</p>
                        <button onClick={() => { setServices(prev => prev.filter(s => s.id !== sv.id)); showSnackbar("delete", `ลบบริการ "${sv.name}" แล้ว`); }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
          // Return to the boarding list after a short pause so the snackbar is visible
          setTimeout(() => onBack(), 600);
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

      {/* Schedule item modal (add or edit) */}
      <AddScheduleModal
        open={showAddSchedule}
        item={editingSchedule}
        onClose={() => { setShowAddSchedule(false); setEditingSchedule(null); }}
        onSave={(item) => {
          if (editingSchedule) {
            setSchedule(prev => prev.map(s => s.id === editingSchedule.id ? { ...editingSchedule, ...item } : s));
            showSnackbar("success", `อัปเดต "${item.time} · ${item.type}" แล้ว`);
          } else {
            setSchedule(prev => [...prev, { id: Date.now(), status: "pending", media: [], ...item }].sort((a, b) => a.time.localeCompare(b.time)));
            showSnackbar("success", `เพิ่มกิจกรรม "${item.time} · ${item.type}"`);
          }
          setShowAddSchedule(false);
          setEditingSchedule(null);
        }}
      />

      {/* Extra expense modal (add or edit) */}
      <AddExtraExpenseModal
        open={showAddExpense}
        editing={editingExpense}
        onClose={() => { setShowAddExpense(false); setEditingExpense(null); }}
        onSave={(exp) => {
          if (editingExpense) {
            setExtraExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...editingExpense, ...exp } : e));
            showSnackbar("success", `อัปเดตค่าใช้จ่าย "${exp.title}" — ฿${exp.amount.toLocaleString()}`);
          } else {
            setExtraExpenses(prev => [{ id: Date.now(), ...exp }, ...prev]);
            showSnackbar("success", `เพิ่มค่าใช้จ่าย "${exp.title}" — ฿${exp.amount.toLocaleString()}`);
          }
          setShowAddExpense(false);
          setEditingExpense(null);
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
    temperature: "101.3",
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
      temperature: "101.3",
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
              <label className="vet-label">อุณหภูมิ (°F) <span className="required">*</span></label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.temperature} onChange={e => update("temperature", e.target.value)}
                  placeholder="เช่น 101.3" className="vet-input !pl-9" type="number" step="0.1" />
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

/* ═══════════════════════════════════════════════════════
   Accordion — collapsible history section wrapper
   ═══════════════════════════════════════════════════════ */
function Accordion({
  icon: Icon, title, subtitle, rightAction, children,
}: {
  icon: typeof BedDouble;
  title: string;
  subtitle?: string;
  open?: boolean;
  onToggle?: () => void;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
    >
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-100">
          <Icon className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>{title}</p>
          {subtitle && <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>}
        </div>
        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   StagePanelShell — common card wrapper used by every stage panel
   ═══════════════════════════════════════════════════════ */
function StagePanelShell({
  icon: Icon, badge, title, subtitle, accent = "#19a589", children,
}: {
  icon: typeof BedDouble;
  badge: string;
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden"
      style={{ borderColor: `${accent}33`, boxShadow: `0 6px 24px ${accent}1F` }}
    >
      <div className="relative overflow-hidden px-5 pt-4 pb-3 border-b" style={{
        borderBottomColor: `${accent}1A`,
        background: `linear-gradient(135deg, ${accent}10 0%, #FEFBF8 60%, ${accent}10 100%)`,
      }}>
        <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.08] rounded-full" style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }} />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}DD)`, boxShadow: `0 4px 14px ${accent}40` }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider" style={{ background: `${accent}1A`, color: accent, fontWeight: 700 }}>
                {badge}
              </span>
            </div>
            <p className="text-base text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{title}</p>
            {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   CurrentStagePanel — switches on booking status
   ═══════════════════════════════════════════════════════ */
type StagePanelProps = {
  booking: BookingData;
  petDetail: PetDetail;
  services: ServiceItem[];
  schedule: ScheduleItem[];
  extraExpenses: ExtraExpense[];
  dailyLogs: DailyLogEntry[];
  currentHealthColor: "green" | "yellow" | "red";
  nights: number;
  subTotal: number;
  vat: number;
  deposit: number;
  payable: number;
  scheduleDone: number;
  ciRef: React.RefObject<HTMLDivElement | null>;
  ciWeight: string; setCiWeight: (v: string) => void;
  ciTemp: string; setCiTemp: (v: string) => void;
  ciHealth: "ปกติ" | "เครียด"; setCiHealth: (v: "ปกติ" | "เครียด") => void;
  ciDeposit: number; setCiDeposit: (v: number) => void;
  ciKennel: string; setCiKennel: (v: string) => void;
  ciCaretaker: string; setCiCaretaker: (v: string) => void;
  ciFeeding: string; setCiFeeding: (v: string) => void;
  ciMeds: string; setCiMeds: (v: string) => void;
  ciPhotos: string[]; setCiPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  ciKennelCard: boolean; setCiKennelCard: (v: boolean) => void;
  ciValid: boolean;
  onCheckInSubmit: () => void;
  onStartCheckIn: () => void;
  onOpenSchedule: () => void;
  onEditSchedule: (item: ScheduleItem) => void;
  onToggleScheduleStatus: (id: number) => void;
  onDeleteSchedule: (id: number) => void;
  onAddScheduleMedia: (id: number, kind: "photo" | "video") => void;
  onOpenExpense: () => void;
  onEditExpense: (exp: ExtraExpense) => void;
  onDeleteExpense: (exp: ExtraExpense) => void;
  onOpenDailyLog: () => void;
  onStartCheckOut: () => void;
  onOpenPayment: () => void;
  onAdvanceStatus: () => void;
};

function CurrentStagePanel(props: StagePanelProps) {
  switch (props.booking.status) {
    case "ลงทะเบียน": return <BookingStagePanel {...props} />;
    case "เช็คอิน":   return <CheckInStagePanel {...props} />;
    case "ฝากเลี้ยง": return <ActiveStagePanel {...props} />;
    case "ชำระเงิน":   return <PaymentStagePanel {...props} />;
    case "เช็คเอาท์":  return <CheckOutStagePanel {...props} />;
    default:           return null;
  }
}

/* ── Stage 1: จองฝากเลี้ยง (registration / waiting) ── */
function BookingStagePanel({ booking, nights, onStartCheckIn }: StagePanelProps) {
  // crude countdown using checkIn label like "12 มี.ค." — pretend 0 if today/past
  const daysUntil = 0; // mock — UI focus on action
  return (
    <StagePanelShell
      icon={Hourglass}
      badge="ทะเบียนฝากเลี้ยง"
      title="รอวัน Check-in"
      subtitle={`เข้าพัก ${booking.checkIn} · ${nights} คืน · ห้อง ${booking.roomNumber} (${booking.roomType})`}
      accent="#f59e0b"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-[10px] text-amber-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>Check-in</p>
            <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>{booking.checkIn}</p>
          </div>
        </div>
        <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-3 flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-[10px] text-blue-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>Check-out</p>
            <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>{booking.checkOut}</p>
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 flex items-center gap-2.5">
          <BedDouble className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-[10px] text-emerald-700 uppercase tracking-wider" style={{ fontWeight: 600 }}>ห้องที่จัดให้</p>
            <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>{booking.roomNumber} — {booking.roomType}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 mb-4">
        <p className="text-[11px] text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>📋 ก่อนถึงวัน Check-in</p>
        <ul className="space-y-1 text-xs text-gray-600">
          <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#19a589] mt-0.5 flex-shrink-0" /> ติดต่อเจ้าของเพื่อยืนยันเวลาเข้าพัก</li>
          <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#19a589] mt-0.5 flex-shrink-0" /> เตรียมห้อง {booking.roomNumber} ให้พร้อม</li>
          <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#19a589] mt-0.5 flex-shrink-0" /> เตรียม Kennel Card + ตารางอาหาร</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
          <Send className="w-3.5 h-3.5" /> แจ้งเจ้าของ
        </button>
        <button
          onClick={onStartCheckIn}
          className="flex items-center gap-1.5 px-5 py-2 text-xs text-white rounded-xl transition-all active:scale-95"
          style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}
        >
          <LogIn className="w-4 h-4" /> เริ่ม Check-in {daysUntil > 0 && `(เหลือ ${daysUntil} วัน)`}
        </button>
      </div>
    </StagePanelShell>
  );
}

/* ── Stage 2: Check-in ── */
function CheckInStagePanel({
  booking, ciRef,
  ciWeight, setCiWeight, ciTemp, setCiTemp, ciHealth, setCiHealth,
  ciDeposit, setCiDeposit, ciKennel, setCiKennel, ciCaretaker, setCiCaretaker,
  ciFeeding, setCiFeeding, ciMeds, setCiMeds, ciPhotos, setCiPhotos,
  ciKennelCard, setCiKennelCard, ciValid, onCheckInSubmit,
}: StagePanelProps) {
  const DEP_OPTS = [500, 800, 1000, 1500, 2000];

  // Pre-admission checklist (4 categories)
  const CHECKLIST_GROUPS: Array<{
    key: string;
    title: string;
    icon: typeof Shield;
    accent: string;
    items: { id: string; label: string }[];
  }> = [
    {
      key: "health", title: "สุขภาพและวัคซีน", icon: Shield, accent: "#10b981",
      items: [
        { id: "vax",        label: "วัคซีนครบตามอายุ (DHPPiL สุนัข / FVRCP แมว) และวัคซีนพิษสุนัขบ้า" },
        { id: "no-illness", label: "ไม่มีอาการป่วย ไข้ ท้องเสีย หรือติดเชื้อในช่วงรับฝาก" },
        { id: "no-recover", label: "ไม่อยู่ในระยะฟื้นตัวหลังผ่าตัด/รักษาโรคร้ายแรง" },
        { id: "parasite",   label: "กำจัดปรสิตภายนอก (เห็บ หมัด) ก่อนเข้าพัก" },
      ],
    },
    {
      key: "behavior", title: "พฤติกรรม", icon: PawPrint, accent: "#3b82f6",
      items: [
        { id: "no-bite",   label: "ไม่มีประวัติกัด/ข่วนบุคลากรหรือสัตว์อื่นรุนแรง" },
        { id: "calm",      label: "อยู่ในพื้นที่จำกัดได้โดยไม่เครียดเกินไป" },
        { id: "leash",     label: "ใส่ปลอกคอและสายจูงได้ (สำหรับสุนัข)" },
      ],
    },
    {
      key: "docs", title: "เอกสาร", icon: ClipboardList, accent: "#a855f7",
      items: [
        { id: "vax-book",  label: "สมุดวัคซีน / เอกสารยืนยันประวัติวัคซีน" },
        { id: "pet-reg",   label: "ทะเบียนสัตว์เลี้ยง (ถ้ามี)" },
        { id: "consent",   label: "ลงนามใบยินยอมรับฝาก + นโยบายของโรงพยาบาล" },
      ],
    },
    {
      key: "prep", title: "การเตรียมตัว", icon: Package, accent: "#f59e0b",
      items: [
        { id: "fast",      label: "งดอาหารก่อนเข้าพักตามที่กำหนด (บางกรณี)" },
        { id: "personal",  label: "นำของใช้ส่วนตัวมาเอง (อาหาร ของเล่น ผ้าห่ม)" },
        { id: "special",   label: "แจ้งยา/อาหารพิเศษที่สัตว์ต้องได้รับ" },
      ],
    },
  ];
  const [checklist, setChecklist] = useState<Set<string>>(new Set());
  const toggleCheck = (id: string) => setChecklist(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const totalChecks = CHECKLIST_GROUPS.reduce((s, g) => s + g.items.length, 0);
  const doneChecks  = CHECKLIST_GROUPS.reduce((s, g) => s + g.items.filter(i => checklist.has(i.id)).length, 0);

  return (
    <div ref={ciRef}>
      <StagePanelShell
        icon={LogIn}
        badge="เช็คอิน"
        title="บันทึกข้อมูลรับสัตว์เข้าพัก"
        subtitle="กรอกข้อมูลสุขภาพ · จัดสรรกรง · รับมัดจำ · บันทึกอุปกรณ์ส่วนตัว แล้วยืนยันเริ่มฝากเลี้ยง"
        accent="#14b8a6"
      >
        <div className="space-y-5">
          {/* Vital signs — compact inline row */}
          <div>
            <p className="vet-divider">ตรวจสอบสุขภาพ</p>
            <div className="flex flex-wrap items-start gap-3">
              <div className="w-[150px]">
                <label className="vet-label">น้ำหนัก (กก.) <span className="required">*</span></label>
                <div className="relative">
                  <Stethoscope className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                  <input type="number" step="0.1" value={ciWeight} onChange={e => setCiWeight(e.target.value)} placeholder="8.5" className="vet-input has-icon-left" />
                </div>
              </div>
              <div className="w-[150px]">
                <label className="vet-label">อุณหภูมิ (°F) <span className="required">*</span></label>
                <div className="relative">
                  <Thermometer className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                  <input type="number" step="0.1" value={ciTemp} onChange={e => setCiTemp(e.target.value)} placeholder="101.3" className="vet-input has-icon-left" />
                </div>
              </div>
              <div>
                <label className="vet-label">สถานะสุขภาพ</label>
                <div className="flex gap-[6px]" style={{ height: 40 }}>
                  {(["ปกติ", "เครียด"] as const).map(h => {
                    const active = ciHealth === h;
                    return (
                      <button key={h} onClick={() => setCiHealth(h)}
                        className={`flex items-center justify-center gap-[6px] px-4 rounded-[12px] border text-[13px] transition-all ${
                          active
                            ? h === "ปกติ" ? "bg-green-500 text-white border-green-500" : "bg-yellow-500 text-white border-yellow-500"
                            : h === "ปกติ" ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100" : "bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100"
                        }`}
                        style={{ fontWeight: active ? 600 : 500 }}
                      >{h}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pre-admission Checklist (4 categories) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="vet-divider !m-0">เช็คความพร้อมก่อนรับฝาก</p>
              <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>
                {doneChecks}/{totalChecks} ครบ
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CHECKLIST_GROUPS.map(g => {
                const Gico = g.icon;
                const done = g.items.filter(i => checklist.has(i.id)).length;
                return (
                  <div key={g.key} className="rounded-xl border p-3" style={{ background: `${g.accent}08`, borderColor: `${g.accent}30` }}>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${g.accent}1A` }}>
                        <Gico className="w-3.5 h-3.5" style={{ color: g.accent }} />
                      </div>
                      <p className="text-xs" style={{ fontWeight: 700, color: g.accent }}>{g.title}</p>
                      <span className="ml-auto text-[10px] text-gray-500 px-1.5 py-0.5 rounded bg-white/70" style={{ fontWeight: 500 }}>
                        {done}/{g.items.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {g.items.map(item => {
                        const checked = checklist.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleCheck(item.id)}
                            className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/80 transition-colors text-left"
                          >
                            <div
                              className="w-4 h-4 rounded-md border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all"
                              style={{ borderColor: checked ? g.accent : "#d1d5db", background: checked ? g.accent : "white" }}
                            >
                              {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />}
                            </div>
                            <span className={`text-[11px] leading-snug ${checked ? "text-gray-800" : "text-gray-600"}`} style={{ fontWeight: checked ? 500 : 400 }}>
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo */}
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
              <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>ถ่ายรูปสัตว์เลี้ยง · อุปกรณ์ที่นำมา · สภาพร่างกาย</p>
            </div>
          </div>

          {/* Kennel + deposit — compact */}
          <div>
            <p className="vet-divider">จัดสรรกรง & มัดจำ</p>
            <div className="flex flex-wrap items-start gap-3">
              <div className="w-[180px]">
                <label className="vet-label">Kennel / ห้อง <span className="required">*</span></label>
                <div className="relative">
                  <BedDouble className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                  <input type="text" value={ciKennel} onChange={e => setCiKennel(e.target.value)} placeholder="A-01" className="vet-input has-icon-left" />
                </div>
              </div>
              <div className="w-[220px]">
                <label className="vet-label">พนักงานดูแล</label>
                <div className="relative">
                  <UserCheck className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                  <input type="text" value={ciCaretaker} onChange={e => setCiCaretaker(e.target.value)} placeholder="ชื่อพนักงาน" className="vet-input has-icon-left" />
                </div>
              </div>
              <div className="flex-1 min-w-[280px]">
                <label className="vet-label">มัดจำกรง (500–2,000 บาท) <span className="required">*</span></label>
                <div className="flex gap-[6px] flex-wrap" style={{ height: 40, alignItems: "center" }}>
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

          {/* Kennel Card */}
          <div>
            <p className="vet-divider">Kennel Card · ตารางอาหาร / ยา</p>
            <div className="vet-form-gap">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-[260px] max-w-[360px]">
                  <label className="vet-label">ตารางให้อาหาร</label>
                  <div className="relative">
                    <Utensils className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                    <input type="text" value={ciFeeding} onChange={e => setCiFeeding(e.target.value)} placeholder="วันละ 2 มื้อ (เช้า-เย็น)" className="vet-input has-icon-left" />
                  </div>
                </div>
                <div className="flex-1 min-w-[220px] max-w-[320px]">
                  <label className="vet-label">ยา/อาหารเสริม</label>
                  <div className="relative">
                    <Pill className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                    <input type="text" value={ciMeds} onChange={e => setCiMeds(e.target.value)} placeholder="ระบุยา (ถ้ามี)" className="vet-input has-icon-left" />
                  </div>
                </div>
              </div>
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

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={onCheckInSubmit}
              disabled={!ciValid}
              className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-full text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}
            >
              <Check className="w-4 h-4" /> บันทึก & เริ่มฝากเลี้ยง
            </button>
          </div>
        </div>
      </StagePanelShell>
    </div>
  );
}

/* ── Stage 3: กำลังฝากเลี้ยง — schedule + daily log + extras ── */
function ActiveStagePanel({
  booking, schedule, extraExpenses, scheduleDone,
  onOpenSchedule, onEditSchedule, onToggleScheduleStatus, onDeleteSchedule, onAddScheduleMedia,
  onOpenExpense, onEditExpense, onDeleteExpense, onOpenDailyLog, onAdvanceStatus,
}: StagePanelProps) {
  const totalExtras = extraExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSchedule = schedule.length;
  const pct = totalSchedule > 0 ? Math.round((scheduleDone / totalSchedule) * 100) : 0;

  // Group schedule by time-of-day
  const groups = [
    { key: "เช้า",  label: "เช้า",  range: "06:00 – 11:59", icon: "🌅", items: schedule.filter(s => +s.time.slice(0,2) <  12) },
    { key: "บ่าย",  label: "บ่าย",  range: "12:00 – 16:59", icon: "☀️", items: schedule.filter(s => +s.time.slice(0,2) >= 12 && +s.time.slice(0,2) < 17) },
    { key: "เย็น",  label: "เย็น/กลางคืน", range: "17:00 – 22:00", icon: "🌙", items: schedule.filter(s => +s.time.slice(0,2) >= 17) },
  ].filter(g => g.items.length > 0);

  return (
    <StagePanelShell
      icon={ActivityIcon}
      badge="ฝากเลี้ยง"
      title={`กำลังดูแล ${booking.petName}`}
      subtitle={`ห้อง ${booking.roomNumber} · พนักงานดูแล ${booking.caretaker || "—"}`}
      accent="#10b981"
    >
      <div className="space-y-5">
        {/* Progress strip */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-100 p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-700" style={{ fontWeight: 700 }}>กิจกรรมวันนี้</span>
              <span className="text-[11px] text-gray-500">{scheduleDone}/{totalSchedule} เสร็จแล้ว</span>
            </div>
            <span className="text-sm text-emerald-700" style={{ fontWeight: 700 }}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-emerald-100/70 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#10b981,#059669)", boxShadow: "0 0 8px rgba(16,185,129,0.4)" }} />
          </div>
        </div>

        {/* Activity Schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ตารางกิจกรรม</p>
                <p className="text-[11px] text-gray-400">ติ๊กเสร็จ + แนบรูป/วิดีโอ ส่งให้เจ้าของ</p>
              </div>
            </div>
            <button onClick={onOpenSchedule}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-full transition-all active:scale-95"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}>
              <Plus className="w-3.5 h-3.5" /> เพิ่มกิจกรรม
            </button>
          </div>

          {totalSchedule === 0 ? (
            <div className="text-center py-10 rounded-xl bg-gray-50 border border-dashed border-gray-200">
              <CalendarDays className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500" style={{ fontWeight: 600 }}>ยังไม่มีกิจกรรม</p>
              <p className="text-[10px] text-gray-400 mt-0.5">กดเพิ่มกิจกรรมแรกเพื่อเริ่มดูแล</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map(g => (
                <div key={g.key}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[14px]">{g.icon}</span>
                    <span className="text-[11px] text-gray-700" style={{ fontWeight: 700 }}>{g.label}</span>
                    <span className="text-[10px] text-gray-400">{g.range}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] text-gray-400">{g.items.filter(i => i.status === "done").length}/{g.items.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {g.items.map(s => (
                      <ScheduleRow
                        key={s.id}
                        item={s}
                        onToggleStatus={() => onToggleScheduleStatus(s.id)}
                        onEdit={() => onEditSchedule(s)}
                        onDelete={() => onDeleteSchedule(s.id)}
                        onAddMedia={(kind) => onAddScheduleMedia(s.id, kind)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extra expenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ค่าใช้จ่ายเพิ่มเติมระหว่างฝาก</p>
                <p className="text-[11px] text-gray-400">ยา/อุปกรณ์/บริการพิเศษที่เกิดขึ้นเพิ่ม</p>
              </div>
            </div>
            <button onClick={onOpenExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-full transition-all active:scale-95"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#f59e0b,#d97706)", boxShadow: "0 2px 8px rgba(245,158,11,0.3)" }}>
              <Plus className="w-3.5 h-3.5" /> เพิ่มค่าใช้จ่าย
            </button>
          </div>
          {extraExpenses.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-gray-50 border border-dashed border-gray-200">
              <Receipt className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500" style={{ fontWeight: 600 }}>ยังไม่มีค่าใช้จ่ายเพิ่มเติม</p>
              <p className="text-[10px] text-gray-400 mt-0.5">บันทึกค่ายา/อุปกรณ์ที่เกิดขึ้นระหว่างฝากเลี้ยง</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {extraExpenses.map((e, i) => (
                <div key={e.id} className={`flex items-center gap-3 px-3 py-2.5 group hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}>
                  <div className="w-1 h-9 rounded-full flex-shrink-0" style={{ background: expenseCategoryColor[e.category] }} />
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] text-white flex-shrink-0" style={{ background: expenseCategoryColor[e.category], fontWeight: 600 }}>
                    {e.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{e.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{e.date}{e.note ? ` · ${e.note}` : ""}</p>
                  </div>
                  <span className="text-sm text-gray-800 flex-shrink-0" style={{ fontWeight: 700 }}>฿{e.amount.toLocaleString()}</span>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => onEditExpense(e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-[#19a589] transition-all" title="แก้ไข">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDeleteExpense(e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all" title="ลบ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 bg-amber-50/50 border-t border-amber-100">
                <span className="text-xs text-amber-700" style={{ fontWeight: 600 }}>รวมค่าใช้จ่ายเพิ่ม</span>
                <span className="text-sm text-amber-700" style={{ fontWeight: 800 }}>฿{totalExtras.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-gray-100">
          <button onClick={onOpenDailyLog} className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
            <FileText className="w-3.5 h-3.5" /> บันทึกการดูแลเพิ่ม
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
            <Send className="w-3.5 h-3.5" /> แจ้งเจ้าของ
          </button>
          <button onClick={onAdvanceStatus}
            className="flex items-center gap-1.5 px-5 py-2 text-xs text-white rounded-xl transition-all active:scale-95"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}>
            <CreditCard className="w-4 h-4" /> ออกบิล
          </button>
        </div>
      </div>
    </StagePanelShell>
  );
}

/* Schedule row sub-component — compact 1-line layout */
function ScheduleRow({
  item, onToggleStatus, onEdit, onDelete, onAddMedia,
}: {
  item: ScheduleItem;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddMedia: (kind: "photo" | "video") => void;
}) {
  const done = item.status === "done";
  const color = activityColors[item.type] || "#6b7280";
  return (
    <div className={`group rounded-xl border px-3 py-2 transition-all ${done ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm"}`}>
      <div className="flex items-center gap-2.5">
        {/* Checkbox */}
        <button
          onClick={onToggleStatus}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300 hover:border-emerald-400"}`}
          aria-label={done ? "ยกเลิกทำเสร็จ" : "ทำเสร็จ"}
        >
          {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>

        {/* Time */}
        <div className="w-12 flex-shrink-0 text-right border-r border-gray-100 pr-2.5">
          <p className="text-[13px] text-gray-800 leading-tight" style={{ fontWeight: 700 }}>{item.time}</p>
          {done && item.completedAt && <p className="text-[9px] text-emerald-600 leading-tight mt-0.5">{item.completedAt.replace(" น.", "")}</p>}
        </div>

        {/* Type chip */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-white flex-shrink-0" style={{ background: color, fontWeight: 600 }}>
          {item.type}
        </span>

        {/* Detail + staff (inline) */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <p className={`text-xs truncate ${done ? "text-gray-500 line-through" : "text-gray-700"}`}>{item.detail}</p>
          {item.staff && <span className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:inline">· {item.staff}</span>}
        </div>

        {/* Media thumbs (inline) */}
        {item.media.length > 0 && (
          <div className="flex gap-1 flex-shrink-0">
            {item.media.slice(0, 3).map((m, i) => (
              <div key={i} className="relative w-7 h-7 rounded-md overflow-hidden border border-gray-200">
                <img src={m.url} alt="" className="w-full h-full object-cover" />
                {m.kind === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Video className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
            {item.media.length > 3 && (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-[9px] text-gray-500" style={{ fontWeight: 600 }}>+{item.media.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions — always visible, subtle */}
        <div className="flex items-center gap-0.5 flex-shrink-0 border-l border-gray-100 pl-1.5 ml-0.5">
          <button onClick={() => onAddMedia("photo")} className="p-1 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all" title="แนบรูป">
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onAddMedia("video")} className="p-1 text-gray-300 hover:text-purple-500 hover:bg-purple-50 rounded transition-all" title="แนบวิดีโอ">
            <Video className="w-3.5 h-3.5" />
          </button>
          <button onClick={onEdit} className="p-1 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-all" title="แก้ไข">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all" title="ลบ">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Stage 4 (final): เช็คเอาท์ — checkout wizard + completion ── */
function CheckOutStagePanel({ booking, nights, payable, onStartCheckOut }: StagePanelProps) {
  const done = !!booking.handoverNote || !!booking.checkOutTime;
  return (
    <StagePanelShell
      icon={LogOut}
      badge={done ? "ปิดงานเรียบร้อย" : "เช็คเอาท์"}
      title={done ? `${booking.petName} กลับบ้านเรียบร้อย` : "รับส่งสัตว์เลี้ยงกลับบ้าน"}
      subtitle={done
        ? `ฝากเลี้ยง ${nights} คืน · ชำระแล้ว ฿${Math.max(0, payable).toLocaleString()} · ${booking.checkOutTime || "—"}`
        : "คืนอุปกรณ์ · ถ่ายภาพสัตว์เลี้ยง · บันทึกสภาพ · ส่งให้เจ้าของ"}
      accent="#3b82f6"
    >
      {done ? (
        <div className="text-center py-3">
          <div className="inline-flex w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mb-3">
            <PartyPopper className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ปิดงานเรียบร้อย</p>
          <p className="text-xs text-gray-500 mt-1">ขอบคุณที่ไว้วางใจให้ดูแล {booking.petName}</p>
          {booking.handoverNote && (
            <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-left">
              <p className="text-[10px] text-gray-400 mb-1" style={{ fontWeight: 600 }}>HANDOVER NOTE</p>
              <p className="text-xs text-gray-700 leading-relaxed">{booking.handoverNote}</p>
            </div>
          )}
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={onStartCheckOut} className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
              <Edit2 className="w-3.5 h-3.5" /> แก้ไข Handover
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
              <Receipt className="w-3.5 h-3.5" /> ส่งใบเสร็จ
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
              <Send className="w-3.5 h-3.5" /> ขอรีวิว
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-blue-50/60 border border-blue-200 p-3 mb-4">
            <div className="flex items-start gap-2.5">
              <ClipboardCheck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-800" style={{ fontWeight: 600 }}>ขั้นตอน Check-out</p>
                <ul className="mt-1.5 space-y-1 text-[11px] text-blue-700">
                  <li>1. ตรวจสภาพ {booking.petName} (น้ำหนัก/อุณหภูมิ/สภาพทั่วไป)</li>
                  <li>2. คืนอุปกรณ์ที่นำมา + ตรวจรายการให้ครบ</li>
                  <li>3. ถ่ายภาพ {booking.petName} ก่อนส่งกลับ</li>
                  <li>4. คืน/หักมัดจำ + บันทึก handover note</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onStartCheckOut}
              className="flex items-center gap-1.5 px-5 py-2 text-xs text-white rounded-xl transition-all active:scale-95"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.28)" }}
            >
              <ClipboardCheck className="w-4 h-4" /> เปิด Check-out Wizard
            </button>
          </div>
        </>
      )}
    </StagePanelShell>
  );
}

/* ── Stage 4 (alt): ชำระเงิน ── */
function PaymentStagePanel({ services, extraExpenses, subTotal, vat, deposit, payable, onOpenPayment }: StagePanelProps) {
  const totalExtras = extraExpenses.reduce((s, e) => s + e.amount, 0);
  return (
    <StagePanelShell
      icon={Banknote}
      badge="ชำระเงิน"
      title="รับชำระค่าบริการ"
      subtitle="ตรวจสอบบิล · เลือกวิธีชำระเงิน · ออกใบเสร็จ"
      accent="#a855f7"
    >
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">ค่าบริการ ({services.length} รายการ)</span><span className="text-gray-700" style={{ fontWeight: 500 }}>฿{services.reduce((s, sv) => s + sv.price, 0).toLocaleString()}</span></div>
          {extraExpenses.length > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">ค่าใช้จ่ายเพิ่มเติม ({extraExpenses.length})</span><span className="text-gray-700" style={{ fontWeight: 500 }}>฿{totalExtras.toLocaleString()}</span></div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1"><span className="text-gray-600" style={{ fontWeight: 500 }}>ยอดรวม</span><span className="text-gray-800" style={{ fontWeight: 600 }}>฿{subTotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">VAT 7%</span><span className="text-gray-700">฿{vat.toLocaleString()}</span></div>
          {deposit > 0 && <div className="flex justify-between"><span className="text-[#19a589]">หักมัดจำ</span><span className="text-[#19a589]">-฿{deposit.toLocaleString()}</span></div>}
          <div className="flex justify-between items-end border-t border-gray-200 pt-2 mt-1">
            <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ยอดชำระสุทธิ</span>
            <span className="text-2xl text-purple-600" style={{ fontWeight: 800 }}>฿{Math.max(0, payable).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all" style={{ fontWeight: 500 }}>
          <Receipt className="w-3.5 h-3.5" /> ดูใบแจ้งหนี้
        </button>
        <button
          onClick={onOpenPayment}
          className="flex items-center gap-1.5 px-5 py-2 text-xs text-white rounded-xl transition-all active:scale-95"
          style={{ fontWeight: 600, background: "linear-gradient(135deg,#a855f7,#7e22ce)", boxShadow: "0 4px 14px rgba(168,85,247,0.28)" }}
        >
          <CreditCard className="w-4 h-4" /> รับชำระเงิน
        </button>
      </div>
    </StagePanelShell>
  );
}

/* ═══════════════════════════════════════════════════════
   Add/Edit Schedule item modal
   ═══════════════════════════════════════════════════════ */
function AddScheduleModal({
  open, item, onClose, onSave,
}: {
  open: boolean;
  item: ScheduleItem | null;
  onClose: () => void;
  onSave: (item: { time: string; type: string; detail: string; staff?: string }) => void;
}) {
  const [time, setTime] = useState(item?.time || "08:00");
  const [type, setType] = useState(item?.type || activityTypes[0]);
  const [detail, setDetail] = useState(item?.detail || "");
  const [staff, setStaff] = useState(item?.staff || "");

  const handleOpen = () => {
    setTime(item?.time || "08:00");
    setType(item?.type || activityTypes[0]);
    setDetail(item?.detail || "");
    setStaff(item?.staff || "");
  };

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
              className="w-full max-w-[440px] vet-modal"
              style={{ height: "min(520px, calc(100vh - 2rem))" }}
            >
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon"><ActivityIcon className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="vet-section-title">{item ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมในตาราง"}</h2>
                      <p className="vet-tiny mt-[2px]">กำหนดเวลา · ประเภท · รายละเอียด</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
              <div className="vet-modal-body">
                <div className="space-y-[20px]">
                  <div>
                    <p className="vet-divider">เวลา & ประเภท</p>
                    <div className="vet-form-gap">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">เวลา <span className="required">*</span></label>
                          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">ผู้ดูแล</label>
                          <input value={staff} onChange={e => setStaff(e.target.value)} placeholder="ชื่อพนักงาน" className="vet-input" />
                        </div>
                      </div>
                      <div>
                        <label className="vet-label">ประเภทกิจกรรม</label>
                        <div className="flex flex-wrap gap-2">
                          {activityTypes.map(t => (
                            <button key={t} type="button" onClick={() => setType(t)}
                              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${type === t ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                              style={{ fontWeight: type === t ? 600 : 400 }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="vet-divider">รายละเอียด</p>
                    <div className="vet-form-gap">
                      <div>
                        <label className="vet-label">รายละเอียด <span className="required">*</span></label>
                        <input value={detail} onChange={e => setDetail(e.target.value)} placeholder="เช่น Royal Canin 250g" className="vet-input" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button
                  onClick={() => { if (time && type && detail) onSave({ time, type, detail, staff: staff || undefined }); }}
                  disabled={!time || !type || !detail}
                  className="vet-btn vet-btn-primary btn-green ml-auto"
                >
                  <Check className="w-4 h-4" /> {item ? "บันทึก" : "เพิ่ม"}
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
   Add Extra Expense modal
   ═══════════════════════════════════════════════════════ */
function AddExtraExpenseModal({
  open, editing, onClose, onSave,
}: {
  open: boolean;
  editing?: ExtraExpense | null;
  onClose: () => void;
  onSave: (e: Omit<ExtraExpense, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExtraExpense["category"]>("ยา");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const categories: ExtraExpense["category"][] = ["ยา", "อุปกรณ์", "บริการเพิ่ม", "อื่นๆ"];
  const presets: Record<ExtraExpense["category"], string[]> = {
    "ยา": ["Apoquel 16mg", "ยาแก้แพ้", "ยาหยอดหู", "วิตามิน"],
    "อุปกรณ์": ["ปลอกคอใหม่", "สายจูง", "ของเล่น", "ผ้าห่ม"],
    "บริการเพิ่ม": ["พาเดินเล่นเสริม", "ตัดเล็บ", "อาบน้ำเสริม", "ส่งรูปทาง Line"],
    "อื่นๆ": ["ค่าจอดรถ", "ค่าจัดส่ง"],
  };

  const today = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short" });

  const handleOpen = () => {
    if (editing) {
      setTitle(editing.title);
      setCategory(editing.category);
      setAmount(String(editing.amount));
      setNote(editing.note || "");
    } else {
      setTitle(""); setCategory("ยา"); setAmount(""); setNote("");
    }
  };

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
              className="w-full max-w-[460px] vet-modal"
              style={{ height: "min(560px, calc(100vh - 2rem))" }}
            >
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon"><Receipt className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="vet-section-title">{editing ? "แก้ไขค่าใช้จ่ายเพิ่มเติม" : "เพิ่มค่าใช้จ่ายเพิ่มเติม"}</h2>
                      <p className="vet-tiny mt-[2px]">บันทึกค่าใช้จ่ายที่เกิดระหว่างฝากเลี้ยง</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
              <div className="vet-modal-body">
                <div className="space-y-[20px]">
                  <div>
                    <p className="vet-divider">หมวด</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(c => (
                        <button key={c} type="button" onClick={() => setCategory(c)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${category === c ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                          style={{ fontWeight: category === c ? 600 : 400, color: category === c ? expenseCategoryColor[c] : undefined, borderColor: category === c ? `${expenseCategoryColor[c]}40` : undefined, background: category === c ? `${expenseCategoryColor[c]}10` : undefined }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="vet-divider">รายการ</p>
                    <div className="vet-form-gap">
                      <div className="flex flex-wrap gap-2">
                        {presets[category].map(p => (
                          <button key={p} type="button" onClick={() => setTitle(p)}
                            className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${title === p ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                            style={{ fontWeight: title === p ? 600 : 400 }}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="vet-label">ชื่อรายการ <span className="required">*</span></label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น Apoquel 16mg" className="vet-input" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">จำนวนเงิน (บาท) <span className="required">*</span></label>
                          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" min="0" className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">วันที่</label>
                          <input value={editing ? editing.date : today} readOnly className="vet-input bg-gray-50" />
                        </div>
                      </div>
                      <div>
                        <label className="vet-label">หมายเหตุ</label>
                        <input value={note} onChange={e => setNote(e.target.value)} placeholder="(ไม่บังคับ)" className="vet-input" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button
                  onClick={() => { if (title && amount) onSave({ title, category, amount: parseFloat(amount), note: note || undefined, date: editing ? editing.date : today }); }}
                  disabled={!title || !amount}
                  className="vet-btn vet-btn-primary btn-green ml-auto"
                >
                  <Check className="w-4 h-4" /> {editing ? "บันทึก" : "เพิ่ม"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}