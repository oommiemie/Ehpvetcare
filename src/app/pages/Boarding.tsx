import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home, Search, Plus, Calendar, Clock, ChevronLeft, ChevronRight,
  LogIn, LogOut, DoorOpen, BedDouble, PawPrint, User, Phone, X, Check,
  MoreHorizontal, AlertTriangle, Utensils, Pill, Droplets, Heart,
  FileText, CreditCard, Star, Sparkles, Edit2, Trash2, ChevronDown,
  Bath, Stethoscope, Smartphone, Banknote, Thermometer,
  Camera, Printer, Hourglass, ClipboardCheck, Activity as ActivityIcon, PartyPopper,
} from "lucide-react";
import { PageMotion } from "../components/PageMotion";
import { DatePickerModern } from "../components/DatePickerModern";
import { TimePickerModern } from "../components/TimePickerModern";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useClinicData, type BoardingRoom } from "../contexts/ClinicDataContext";
import { useLang } from "../contexts/LanguageContext";
import { useNavigate } from "react-router";
import { getSpeciesAvatar } from "../components/petAvatars";
import { BoardingDetail } from "../components/BoardingDetail";
import crownSvgPaths from "../../imports/svg-lxtubw66mu";
import doorSvgPaths from "../../imports/svg-gw6jqem3sg";
import alertSvgPaths from "../../imports/svg-hzv7bc3cys";

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */
type BookingStatus = "ลงทะเบียน" | "เช็คอิน" | "ฝากเลี้ยง" | "ชำระเงิน" | "เช็คเอาท์";

const STATUS_FLOW: BookingStatus[] = ["ลงทะเบียน", "เช็คอิน", "ฝากเลี้ยง", "ชำระเงิน", "เช็คเอาท์"];
const NEXT_STATUS_LABEL: Record<BookingStatus, string> = {
  "ลงทะเบียน": "เช็คอิน",
  "เช็คอิน": "ฝากเลี้ยง",
  "ฝากเลี้ยง": "ชำระเงิน",
  "ชำระเงิน": "เช็คเอาท์",
  "เช็คเอาท์": "",
};
function getNextStatus(current: BookingStatus): BookingStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

interface Booking {
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
  checkoutPhotos?: string[];
}

interface Activity {
  id: number;
  time: string;
  type: string;
  detail: string;
  staff: string;
}

// Room interface moved to ClinicDataContext as `BoardingRoom`
type Room = BoardingRoom;

/* ═══════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════ */
const THAI_MONTHS_ABBR = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
// Build a "<day> <thai-month-abbr>" string in the CURRENT month (clamped to month length)
const _calNow = new Date();
const cd = (day: number) => {
  const maxDay = new Date(_calNow.getFullYear(), _calNow.getMonth() + 1, 0).getDate();
  return `${Math.max(1, Math.min(day, maxDay))} ${THAI_MONTHS_ABBR[_calNow.getMonth()]}`;
};
const _todayDay = _calNow.getDate();

/* รูปจากทะเบียนสัตว์ (HN-2026-xxx) */
const petPhotos = {
  lucky:  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80&auto=format&fit=crop",   // ลัคกี้ HN-2026-007
  yuri:   "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80&auto=format&fit=crop", // ยูริ HN-2026-018
  snow:   "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80&auto=format&fit=crop", // หิมะ HN-2026-043
  mocha:  "https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400&q=80&auto=format&fit=crop", // มอคค่า HN-2026-009
  nomsod: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&q=80&auto=format&fit=crop", // นมสด HN-2026-015
  bunny:  "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=400&q=80&auto=format&fit=crop", // บันนี่ HN-2026-045
  coco:   "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=400&q=80&auto=format&fit=crop", // โคโค่ HN-2026-042
  sueanoi: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&q=80&auto=format&fit=crop", // เสือน้อย HN-2026-020
  kati:   "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80&auto=format&fit=crop", // กะทิ HN-2026-016
};

const initialBookings: Booking[] = [
  {
    id: 1, petName: "ลัคกี้", species: "สุนัข", breed: "ชิสุ", ownerName: "อนันต์ ศรีวิไล",
    ownerPhone: "089-234-1122", photo: petPhotos.lucky, checkIn: cd(_todayDay - 3), checkOut: cd(_todayDay + 2),
    roomType: "ห้อง VIP", roomNumber: "A-01", status: "ฝากเลี้ยง", services: ["ให้อาหารวันละ 3 มื้อ", "พาเดินเล่นเช้า-เย็น", "ให้ยาตามใบสั่งแพทย์"],
    notes: "แพ้โปรตีนไก่ ให้อาหารเนื้อวัว · มีผิวหนังอักเสบภูมิแพ้เรื้อรัง ทายาตามแพทย์สั่ง", dailyRate: 800, deposit: 1500, weight: "6.2", temperature: "101.3", healthStatus: "ปกติ", healthColor: "green", kennelCard: true,
    activities: [
      { id: 1, time: "08:00", type: "ให้อาหาร", detail: "อาหารเช้า — เนื้อวัวบด 100g", staff: "สมศรี" },
      { id: 2, time: "09:30", type: "พาเดินเล่น", detail: "เดินเล่นสนามหญ้า 30 นาที", staff: "สมศรี" },
      { id: 3, time: "12:00", type: "ให้อาหาร", detail: "อาหารกลางวัน", staff: "วิภา" },
    ],
  },
  {
    id: 2, petName: "ยูริ", species: "แมว", breed: "บริติช ช็อตแฮร์", ownerName: "มานพ สิงห์โต",
    ownerPhone: "082-445-6677", photo: petPhotos.yuri, checkIn: cd(_todayDay), checkOut: cd(_todayDay + 4),
    roomType: "ห้องแมว", roomNumber: "C-02", status: "เช็คอิน", services: ["ให้อาหารวันละ 2 มื้อ"],
    notes: "", dailyRate: 500,
    activities: [],
  },
  {
    id: 3, petName: "หิมะ", species: "กระต่าย", breed: "เนเธอร์แลนด์ดวอฟ", ownerName: "อรอนงค์ พรมเสน",
    ownerPhone: "091-444-5566", photo: petPhotos.snow, checkIn: cd(_todayDay + 3), checkOut: cd(_todayDay + 9),
    roomType: "กรงนก/สัตว์เล็ก", roomNumber: "F-03", status: "ลงทะเบียน", services: ["ให้อาหารวันละ 2 มื้อ"],
    notes: "ตกใจเสียงง่าย · ตรวจฟันกรามทุก 3 เดือน (molar spurs)", dailyRate: 400,
    activities: [],
  },
  {
    id: 4, petName: "มอคค่า", species: "สุนัข", breed: "พุดเดิ้ล ทอย", ownerName: "สุนิสา แสงทอง",
    ownerPhone: "092-556-7788", photo: petPhotos.mocha, checkIn: cd(_todayDay - 6), checkOut: cd(_todayDay - 2),
    roomType: "ห้องธรรมดา", roomNumber: "B-03", status: "เช็คเอาท์", services: ["อาบน้ำก่อนกลับ"],
    notes: "", dailyRate: 400, deposit: 800, weight: "3.6", temperature: "100.8", healthStatus: "ปกติ", healthColor: "green", kennelCard: true,
    activities: [
      { id: 1, time: "07:30", type: "ให้อาหาร", detail: "อาหารเช้า", staff: "วิภา" },
      { id: 2, time: "10:00", type: "อาบน้ำ", detail: "อาบน้ำ + ตัดเล็บก่อนเช็คเอาท์", staff: "สมศรี" },
    ],
  },
  {
    id: 5, petName: "นมสด", species: "แมว", breed: "ขาวมณี", ownerName: "อนันต์ ศรีวิไล",
    ownerPhone: "089-234-1122", photo: petPhotos.nomsod, checkIn: cd(_todayDay - 5), checkOut: cd(_todayDay + 1),
    roomType: "กรงมาตรฐาน", roomNumber: "E-01", status: "ฝากเลี้ยง", services: ["ให้อาหารวันละ 2 มื้อ"],
    notes: "", dailyRate: 350, deposit: 500, weight: "3.4", temperature: "101.8", healthStatus: "ปกติ", healthColor: "yellow", kennelCard: true,
    activities: [
      { id: 1, time: "08:00", type: "ให้อาหาร", detail: "อาหารเช้า — เม็ดสูตรแมว", staff: "วิภา" },
    ],
  },
  {
    id: 6, petName: "บันนี่", species: "กระต่าย", breed: "ไลอ้อนเฮด", ownerName: "กัญญา สุวรรณ",
    ownerPhone: "091-678-9012", photo: petPhotos.bunny, checkIn: cd(_todayDay - 4), checkOut: cd(_todayDay),
    roomType: "กรงนก/สัตว์เล็ก", roomNumber: "F-01", status: "ชำระเงิน", services: ["ให้อาหารวันละ 2 มื้อ", "ตัดเล็บ"],
    notes: "ครบกำหนดรับกลับวันนี้ — รอชำระค่าบริการก่อนเช็คเอาท์", dailyRate: 400, deposit: 600, weight: "1.6", temperature: "38.9", healthStatus: "ปกติ", healthColor: "green", kennelCard: true,
    paymentMethod: "promptpay", paymentCompleted: false,
    activities: [
      { id: 1, time: "08:00", type: "ให้อาหาร", detail: "หญ้าแห้ง + เม็ดกระต่าย", staff: "วิภา" },
      { id: 2, time: "11:00", type: "ทำความสะอาดกรง", detail: "เปลี่ยนวัสดุรองกรง", staff: "สมศรี" },
      { id: 3, time: "15:30", type: "ตรวจสุขภาพ", detail: "ตัดเล็บ + ตรวจฟันก่อนกลับ", staff: "สมศรี" },
    ],
  },
  {
    id: 7, petName: "เสือน้อย", species: "แมว", breed: "อเมริกัน ช็อตแฮร์", ownerName: "รัตนา จันทร์เพ็ญ",
    ownerPhone: "086-321-9900", photo: petPhotos.sueanoi, checkIn: cd(_todayDay - 2), checkOut: cd(_todayDay + 3),
    roomType: "ห้องแมว", roomNumber: "C-01", status: "ฝากเลี้ยง", services: ["ให้อาหารวันละ 2 มื้อ", "ดูแลพิเศษ 24 ชม."],
    notes: "", dailyRate: 500, deposit: 700, weight: "5.2", temperature: "38.5", healthStatus: "ปกติ", healthColor: "green", kennelCard: true,
    activities: [
      { id: 1, time: "07:45", type: "ให้อาหาร", detail: "อาหารเช้า — เม็ดสูตรแมวโต", staff: "วิภา" },
      { id: 2, time: "13:00", type: "ทำความสะอาดกรง", detail: "ทำความสะอาด + เปลี่ยนทราย", staff: "สมศรี" },
    ],
  },
  {
    id: 8, petName: "โคโค่", species: "กระต่าย", breed: "ฮอลแลนด์ลอป", ownerName: "อรอนงค์ พรมเสน",
    ownerPhone: "091-444-5566", photo: petPhotos.coco, checkIn: cd(_todayDay + 5), checkOut: cd(_todayDay + 10),
    roomType: "กรงนก/สัตว์เล็ก", roomNumber: "F-02", status: "ลงทะเบียน", services: ["ให้อาหารวันละ 2 มื้อ"],
    notes: "จองล่วงหน้า · มีภาวะลำไส้เคลื่อนไหวช้าเป็นซ้ำ (GI stasis) เฝ้าระวังการกินอาหาร", dailyRate: 400,
    activities: [],
  },
];

// initialRooms moved to ClinicDataContext as `INIT_BOARDING_ROOMS`

const petDB = [
  { name: "ลัคกี้", hn: "HN-2026-007", species: "สุนัข", breed: "ชิสุ", owner: "อนันต์ ศรีวิไล", phone: "089-234-1122", photo: petPhotos.lucky },
  { name: "ยูริ", hn: "HN-2026-018", species: "แมว", breed: "บริติช ช็อตแฮร์", owner: "มานพ สิงห์โต", phone: "082-445-6677", photo: petPhotos.yuri },
  { name: "หิมะ", hn: "HN-2026-043", species: "กระต่าย", breed: "เนเธอร์แลนด์ดวอฟ", owner: "อรอนงค์ พรมเสน", phone: "091-444-5566", photo: petPhotos.snow },
  { name: "มอคค่า", hn: "HN-2026-009", species: "สุนัข", breed: "พุดเดิ้ล ทอย", owner: "สุนิสา แสงทอง", phone: "092-556-7788", photo: petPhotos.mocha },
  { name: "นมสด", hn: "HN-2026-015", species: "แมว", breed: "ขาวมณี", owner: "อนันต์ ศรีวิไล", phone: "089-234-1122", photo: petPhotos.nomsod },
  { name: "บันนี่", hn: "HN-2026-045", species: "กระต่าย", breed: "ไลอ้อนเฮด", owner: "กัญญา สุวรรณ", phone: "091-678-9012", photo: petPhotos.bunny },
  { name: "โคโค่", hn: "HN-2026-042", species: "กระต่าย", breed: "ฮอลแลนด์ลอป", owner: "อรอนงค์ พรมเสน", phone: "091-444-5566", photo: petPhotos.coco },
  { name: "เสือน้อย", hn: "HN-2026-020", species: "แมว", breed: "อเมริกัน ช็อตแฮร์", owner: "รัตนา จันทร์เพ็ญ", phone: "086-321-9900", photo: petPhotos.sueanoi },
  { name: "กะทิ", hn: "HN-2026-016", species: "แมว", breed: "วิเชียรมาศ", owner: "ชลธิชา อินทร์แก้ว", phone: "095-888-2211", photo: petPhotos.kati },
];

export const roomTypes = ["ห้อง VIP", "ห้อง VIP พิเศษ", "ห้องธรรมดา", "ห้องแมว", "กรงมาตรฐาน", "กรงนก/สัตว์เล็ก", "ห้องกักกัน"];
const extraServices = ["ให้อาหารวันละ 2 มื้อ", "ให้อาหารวันละ 3 มื้อ", "พาเดินเล่นเช้า-เย็น", "อาบน้ำก่อนกลับ", "ตัดเล็บ", "ให้ยาตามใบสั่งแพทย์", "ดูแลพิเศษ 24 ชม."];
const activityTypes = ["ให้อาหาร", "พาเดินเล่น", "อาบน้ำ", "ให้ยา", "ตรวจสุขภาพ", "ทำความสะอาดกรง", "อื่นๆ"];

/* ═══════════════════════════════════════════════════════
   Helper
   ═══════════════════════════════════════════════════════ */
const statusColor: Record<BookingStatus, { bg: string; text: string; dot: string; border: string }> = {
  "ลงทะเบียน": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "#fbbf24" },
  "เช็คอิน": { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400", border: "#2dd4bf" },
  "ฝากเลี้ยง": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "#34d399" },
  "ชำระเงิน": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400", border: "#a78bfa" },
  "เช็คเอาท์": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", border: "#60a5fa" },
};

const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DAYS_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

/* แปลงวันที่ไทยแบบ "24 มิ.ย." → Date (ปีปัจจุบัน) — ใช้กรองช่วงวันที่เริ่มฝากในทะเบียน */
function parseThaiDate(s?: string): Date | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2})\s+(\S+)/);
  if (!m) return null;
  const mi = THAI_MONTHS_ABBR.indexOf(m[2]);
  if (mi < 0) return null;
  return new Date(new Date().getFullYear(), mi, parseInt(m[1], 10));
}

const activityIcons: Record<string, typeof Utensils> = {
  "ให้อาหาร": Utensils,
  "พาเดินเล่น": PawPrint,
  "อาบน้ำ": Bath,
  "ให้ยา": Pill,
  "ตรวจสุขภาพ": Stethoscope,
  "ทำความสะอาดกรง": Sparkles,
  "อื่นๆ": FileText,
};

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
export function Boarding() {
  const { t } = useLang();
  const { boardingRooms: rooms, setBoardingRooms: setRooms } = useClinicData();
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ภาพรวม");
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showCheckinConfirm, setShowCheckinConfirm] = useState<Booking | null>(null);
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();
  const navigateTo = useNavigate();

  const tabs = ["ภาพรวม", "ห้องพัก/กรง"];
  const tabIcons: Record<string, typeof Home> = {
    "ภาพรวม": Home,
    "ห้องพัก/กรง": BedDouble,
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Stats
  const stayingNow = bookings.filter(b => b.status === "ฝากเลี้ยง").length;
  const checkInToday = bookings.filter(b => b.status === "เช็คอิน").length;
  const checkOutToday = bookings.filter(b => b.status === "เช็คเอาท์").length;
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === "ว่าง").length;
  const maintenanceRooms = rooms.filter(r => r.status === "ซ่อมบำรุง").length;
  const occupancyRate = Math.round(((totalRooms - availableRooms) / totalRooms) * 100);

  const filteredBookings = bookings.filter(b =>
    b.petName.includes(search) || b.ownerName.includes(search) || b.roomNumber.includes(search)
  );

  const upcomingBookings = bookings.filter(b => b.status !== "เช็คเอาท์");

  // Advance status handler — moves booking to next step in flow
  const handleAdvanceStatus = (booking: Booking) => {
    const next = getNextStatus(booking.status);
    if (!next) return;

    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: next } : b));

    // Room management: mark room occupied on Check-in step, free on Check-out step
    if (booking.status === "ลงทะเบียน") {
      // ลงทะเบียน → เช็คอิน: mark room occupied
      setRooms(prev => prev.map(r => r.id === booking.roomNumber ? { ...r, status: "ไม่ว่าง" as const, petName: booking.petName } : r));
    }
    if (booking.status === "ชำระเงิน") {
      // ชำระเงิน → เช็คเอาท์ (final): free the room
      setRooms(prev => prev.map(r => r.id === booking.roomNumber ? { ...r, status: "ว่าง" as const, petName: undefined } : r));
    }

    const msgs: Record<string, string> = {
      "ลงทะเบียน": `เริ่ม Check-in ${booking.petName} แล้ว`,
      "เช็คอิน":    `${booking.petName} เริ่มฝากเลี้ยงแล้ว`,
      "ฝากเลี้ยง":  `ออกบิล ${booking.petName} แล้ว`,
      "ชำระเงิน":   `ชำระเงิน ${booking.petName} เรียบร้อย — พร้อม Check-out`,
      "เช็คเอาท์":  `Check-out ${booking.petName} เรียบร้อย — กลับบ้านแล้ว 🎉`,
    };
    showSnackbar("success", msgs[booking.status] || "อัปเดตสถานะแล้ว");
    setShowCheckinConfirm(null);
  };

  // Advance status with additional data from modal form
  const handleAdvanceWithData = (booking: Booking, data: Partial<Booking>) => {
    const next = getNextStatus(booking.status);
    if (!next) return;

    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, ...data, status: next } : b));

    if (booking.status === "ลงทะเบียน") {
      setRooms(prev => prev.map(r => r.id === booking.roomNumber ? { ...r, status: "ไม่ว่าง" as const, petName: booking.petName } : r));
    }
    if (booking.status === "ชำระเงิน") {
      setRooms(prev => prev.map(r => r.id === booking.roomNumber ? { ...r, status: "ว่าง" as const, petName: undefined } : r));
    }

    const msgs: Record<string, string> = {
      "ลงทะเบียน": `Check-in ${booking.petName} เรียบร้อย — บันทึกข้อมูลสำเร็จ`,
      "เช็คอิน":    `${booking.petName} เริ่มฝากเลี้ยงแล้ว`,
      "ฝากเลี้ยง":  `ออกบิล ${booking.petName} แล้ว`,
      "ชำระเงิน":   `ชำระเงิน ${booking.petName} เรียบร้อย — พร้อม Check-out`,
      "เช็คเอาท์":  `Check-out ${booking.petName} เรียบร้อย — กลับบ้านแล้ว 🎉`,
    };
    showSnackbar("success", msgs[booking.status] || "อัปเดตสถานะแล้ว");
  };

  // Calendar
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDay(calYear, calMonth);
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const today = new Date();
  const isToday = (d: number) => d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

  // Find bookings for a calendar day (simplified)
  const hasBookingOnDay = (d: number) => {
    // Simple mock: highlight days 10-18
    return d >= 10 && d <= 18;
  };

  return (
    <PageMotion className="flex flex-col h-full">
      {/* ── Booking Detail View ── */}
      {selectedBooking ? (
        <div className="flex-1 overflow-y-auto bg-[#FEFBF8] p-3 sm:p-6">
          <BoardingDetail
            booking={selectedBooking}
            onBack={() => setSelectedBooking(null)}
            onAdvance={(b) => {
              handleAdvanceStatus(b);
              // Update selectedBooking to reflect new status
              const next = getNextStatus(b.status);
              if (next) setSelectedBooking({ ...b, status: next });
            }}
            onUpdateBooking={(updated) => {
              setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
              setSelectedBooking(updated);
            }}
          />
        </div>
      ) : (
      <div className="flex flex-col h-full p-4 gap-4" style={{ background: "#FEFBF8" }}>
      {/* ── Hero ── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl flex-shrink-0"
        style={{ backgroundImage: `radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%), radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%), linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)` }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)" }} />
          <div className="absolute -bottom-28 left-1/4 w-[260px] h-[260px] rounded-full" style={{ background: "radial-gradient(circle, rgba(var(--brand-hero-accent), 0.35) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)" }} />
        </div>
        <div className="relative p-5 flex flex-col gap-4">
          {/* Title + actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))", border: "1px solid rgba(255,255,255,0.32)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.12)" }}>
              <Home className="w-[22px] h-[22px] text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: "calc(25px * var(--fs))", letterSpacing: "-0.5px", lineHeight: 1.12 }}>{t("boarding.title")}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ background: "#6ee7b7" }} />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ background: "#6ee7b7" }} />
                </span>
                <p className="text-white/75" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 500 }}>{bookings.length} · {t("boarding.subtitle")}</p>
              </div>
            </div>

            {/* Add booking button — top-right like Stock */}
            <button
              onClick={() => setShowNewBooking(true)}
              className="inline-flex items-center gap-1.5 px-3.5 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 flex-shrink-0 text-white"
              style={{ height: 38, background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)", border: "1px solid var(--hero-btn-border)", boxShadow: "var(--hero-btn-shadow)", fontWeight: 600,  }}
            >
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">จองฝากเลี้ยง</span>
            </button>
          </div>

          {/* Tabs + search row */}
          <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสัตว์, เจ้าของ, ห้อง..."
              className="w-full sm:w-[260px] h-[38px] pl-10 pr-4 rounded-full text-[13px] text-gray-800 bg-white focus:outline-none"
              style={{ border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)" }}
            />
          </div>
          {/* Tab pill */}
          <div className="relative bg-white rounded-full border border-gray-100 h-[38px] flex items-center px-1 max-w-full overflow-x-auto scrollbar-hide" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10)" }}>
            <div className="flex items-center gap-1 min-w-min">
              {tabs.map(tab => {
                const Icon = tabIcons[tab];
                const isActive = activeTab === tab;
                return (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    whileTap={{ scale: 0.94 }}
                    className="relative inline-flex items-center gap-1.5 pl-1.5 pr-3 h-[30px] rounded-full whitespace-nowrap flex-shrink-0"
                    style={{ color: isActive ? "#ffffff" : "#374151", fontSize: "calc(12px * var(--fs))", fontWeight: isActive ? 700 : 600, textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.15)" : "none" }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="boarding-tab-indicator"
                        className="absolute inset-0 rounded-full"
                        style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)", border: "1px solid var(--brand-dark)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isActive ? "#ffffff" : "#f3f4f6", transition: "background 0.2s ease" }}>
                      {Icon && <Icon className="w-3 h-3" style={{ color: isActive ? "var(--brand-dark)" : "#9ca3af" }} />}
                    </span>
                    <span className="relative z-10">{tab}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          {/* "+ เพิ่มห้องพัก" ถูกย้ายไปที่ ตั้งค่า → ข้อมูลฝากเลี้ยง */}
          </div>
        </div>
      </motion.section>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "ภาพรวม" && <OverviewTab
            key="overview"
            bookings={bookings}
            search={search}
            stayingNow={stayingNow}
            checkInToday={checkInToday}
            checkOutToday={checkOutToday}
            availableRooms={availableRooms}
            totalRooms={totalRooms}
            maintenanceRooms={maintenanceRooms}
            occupancyRate={occupancyRate}
            upcomingBookings={upcomingBookings}
            calMonth={calMonth}
            calYear={calYear}
            setCalMonth={setCalMonth}
            setCalYear={setCalYear}
            calendarDays={calendarDays}
            isToday={isToday}
            hasBookingOnDay={hasBookingOnDay}
            onAdvance={(b) => setShowCheckinConfirm(b)}
            onSelect={setSelectedBooking}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            menuRef={menuRef}
          />}

          {activeTab === "ห้องพัก/กรง" && <RoomsTab key="rooms" rooms={rooms} bookings={bookings} />}


        </AnimatePresence>
      </div>

      {/* ── Modals ── */}
      <NewBookingModal
        open={showNewBooking}
        onClose={() => setShowNewBooking(false)}
        onSave={(booking) => {
          setBookings(prev => [booking, ...prev]);
          showSnackbar("success", "สร้างการจองใหม่สำเร็จ");
        }}
        nextId={bookings.length + 1}
        rooms={rooms}
      />

      {/* NewRoomModal ถูกย้ายไปใช้ในหน้า ตั้งค่า → ข้อมูลฝากเลี้ยง */}

      <ConfirmModal
        open={!!showCheckinConfirm}
        title={`ยืนยันเปลี่ยนสถานะ → ${showCheckinConfirm ? NEXT_STATUS_LABEL[showCheckinConfirm.status] : ""}`}
        message={`ยืนยันเปลี่ยนสถานะ "${showCheckinConfirm?.petName}" จาก "${showCheckinConfirm?.status}" เป็น "${showCheckinConfirm ? NEXT_STATUS_LABEL[showCheckinConfirm.status] : ""}" หรือไม่?`}
        icon={<Check className="w-5 h-5 text-white" />}
        onConfirm={() => showCheckinConfirm && handleAdvanceStatus(showCheckinConfirm)}
        onClose={() => setShowCheckinConfirm(null)}
      />
      </div>
      )}
    </PageMotion>
  );
}

/* ═══════════════════════════════════════════════════════
   Booking Card (shared — Bookings tab & Overview)
   ═══════════════════════════════════════════════════════ */
function BookingCard({ b, idx = 0, onSelect }: {
  b: Booking;
  idx?: number;
  onSelect: (b: Booking) => void;
  onDelete?: (id: number) => void;
}) {
  const sc = statusColor[b.status];
  const statusIdx = STATUS_FLOW.indexOf(b.status);
  const statusGrad: Record<BookingStatus, string> = {
    "ลงทะเบียน": "linear-gradient(135deg,#fbbf24,#d97706)",
    "เช็คอิน":   "linear-gradient(135deg,#2dd4bf,#0d9488)",
    "ฝากเลี้ยง": "linear-gradient(135deg,#34d399,#059669)",
    "ชำระเงิน":   "linear-gradient(135deg,#c084fc,#7e22ce)",
    "เช็คเอาท์":  "linear-gradient(135deg,#60a5fa,#2563eb)",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => onSelect(b)}
      className="group relative rounded-3xl overflow-hidden bg-white text-left transition-all duration-300 hover:-translate-y-1"
      style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)" }}
    >
      {/* Cover banner (blurred pet photo) */}
      <div className="relative h-20 overflow-hidden">
        <img src={b.photo} alt="" aria-hidden onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(18px) saturate(140%)", transform: "scale(1.3)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(236,246,243,0.35) 0%, rgba(255,255,255,0.6) 100%)" }} />
        {/* Step chip — top-left */}
        <span className="absolute top-2 left-2 text-[10px] text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
          {statusIdx + 1}/{STATUS_FLOW.length}
        </span>
        {/* Status pill — top-right */}
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white" style={{ background: statusGrad[b.status], boxShadow: `0 2px 6px color-mix(in srgb, ${sc.border} 40%, transparent)`, fontWeight: 600 }}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/85" /> {b.status}
        </span>
      </div>

      {/* Avatar (overlapping cover) */}
      <div className="flex justify-center -mt-10 relative">
        <div className="rounded-full p-[3px]" style={{ background: "#ffffff", boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}>
          <div className="relative w-[66px] h-[66px] rounded-full overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e6f4f1, #cfe8e2)" }}>
            <img src={b.photo} alt={b.petName} onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
        </div>
        {b.status === "ฝากเลี้ยง" && b.healthColor && (
          <span
            className="absolute bottom-0 right-[calc(50%-40px)] w-5 h-5 rounded-full border-[2.5px] border-white"
            style={{ background: b.healthColor === "green" ? "#22c55e" : b.healthColor === "yellow" ? "#eab308" : "#ef4444", boxShadow: "0 3px 10px rgba(0,0,0,0.25)" }}
            title={b.healthColor === "green" ? "ปกติ" : b.healthColor === "yellow" ? "สังเกต" : "ดูแลพิเศษ"}
          />
        )}
      </div>

      {/* Name + breed (centered) */}
      <div className="text-center px-4 mt-2.5">
        <h3 className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))", letterSpacing: "-0.3px", lineHeight: 1.3, paddingBottom: 2 }}>{b.petName}</h3>
        <p className="text-gray-500 truncate" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 600 }}>{b.breed} · {b.species}</p>
      </div>

      {/* Stats (gray bg, 3 cols) — ห้อง · ต่อคืน · มัดจำ */}
      <div className="mx-3 mt-3 grid grid-cols-3 rounded-2xl py-2" style={{ background: "#f3f4f6" }}>
        {[
          { value: b.roomNumber, label: "ห้อง" },
          { value: `฿${b.dailyRate.toLocaleString()}`, label: "ต่อคืน" },
          { value: b.deposit ? `฿${b.deposit.toLocaleString()}` : "—", label: "มัดจำ" },
        ].map((s, i) => (
          <div key={i} className="text-center relative px-1">
            {i > 0 && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-300/60" />}
            <div className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(12.5px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.2 }}>{s.value}</div>
            <div className="text-gray-500 mt-0.5" style={{ fontSize: "calc(10px * var(--fs))", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Owner + dates footer (2 cols) */}
      <div className="px-3 py-3 grid grid-cols-2 gap-2">
        <div className="text-center min-w-0">
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>เจ้าของ</p>
          <p className="text-[12px] text-gray-700 truncate mt-0.5" style={{ fontWeight: 600 }}>{b.ownerName}</p>
        </div>
        <div className="text-center min-w-0 relative">
          <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200/80" />
          <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>เข้า-ออก</p>
          <p className="text-[12px] text-(--brand-dark) truncate mt-0.5" style={{ fontWeight: 600 }}>{b.checkIn} → {b.checkOut}</p>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════
   Overview Tab
   ═══════════════════════════════════════════════════════ */
function OverviewTab({
  stayingNow, checkInToday, checkOutToday, availableRooms, totalRooms, maintenanceRooms, occupancyRate,
  upcomingBookings, calMonth, calYear, setCalMonth, setCalYear, calendarDays, isToday, hasBookingOnDay,
  onAdvance, onSelect, menuOpen, setMenuOpen, menuRef, bookings, search,
}: {
  bookings: Booking[];
  search: string;
  stayingNow: number; checkInToday: number; checkOutToday: number;
  availableRooms: number; totalRooms: number; maintenanceRooms: number; occupancyRate: number;
  upcomingBookings: Booking[];
  calMonth: number; calYear: number;
  setCalMonth: (m: number) => void; setCalYear: (y: number) => void;
  calendarDays: (number | null)[];
  isToday: (d: number) => boolean;
  hasBookingOnDay: (d: number) => boolean;
  onAdvance: (b: Booking) => void;
  onSelect: (b: Booking) => void;
  menuOpen: number | null;
  setMenuOpen: (id: number | null) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const navigateTo = useNavigate();

  // Bookings list (status + search filter) — merged from the old "การจอง" tab
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  // ช่วงวันที่เริ่มฝากเลี้ยง (check-in) — ว่าง = ไม่กรอง
  const [ciFrom, setCiFrom] = useState("");
  const [ciTo, setCiTo] = useState("");
  const statuses = ["ทั้งหมด", ...STATUS_FLOW];
  const q = search.trim();
  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === "ทั้งหมด" || b.status === statusFilter;
    const matchSearch = !q || b.petName.includes(q) || b.ownerName.includes(q) || b.roomNumber.includes(q);
    let matchDate = true;
    if (ciFrom || ciTo) {
      const ci = parseThaiDate(b.checkIn);
      if (!ci) matchDate = false;
      else {
        if (ciFrom && ci.getTime() < new Date(ciFrom + "T00:00:00").getTime()) matchDate = false;
        if (ciTo && ci.getTime() > new Date(ciTo + "T23:59:59").getTime()) matchDate = false;
      }
    }
    return matchStatus && matchSearch && matchDate;
  });

  // Calendar day → booking filtering (default: today selected)
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());
  const monthAbbr = THAI_MONTHS_ABBR[calMonth];
  const dayNum = (s?: string) => (s ? parseInt(s, 10) : NaN);
  const inThisMonth = (s?: string) => !!s && s.includes(monthAbbr);
  const dayHasBooking = (d: number) => bookings.some(b => (inThisMonth(b.checkIn) && dayNum(b.checkIn) === d) || (inThisMonth(b.checkOut) && dayNum(b.checkOut) === d));
  const checkInsOnDay = selectedDay == null ? [] : bookings.filter(b => inThisMonth(b.checkIn) && dayNum(b.checkIn) === selectedDay);
  const checkOutsOnDay = selectedDay == null ? [] : bookings.filter(b => inThisMonth(b.checkOut) && dayNum(b.checkOut) === selectedDay);

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
        }}
      >
        {[
          { label: "กำลังฝากเลี้ยง", value: stayingNow, sub: `+${checkInToday} รอ Check-in`, icon: PawPrint, color: "#e8802a", dark: "#d06a1a", soft: "#fff1e6" },
          { label: "รอ Check-in", value: checkInToday, sub: `เหลือ ${checkInToday} รายการ`, icon: LogIn, color: "var(--brand)", dark: "var(--brand-dark)", soft: "#e6f7f3" },
          { label: "รอ Check-out", value: checkOutToday, sub: "ครบตามกำหนด", icon: LogOut, color: "#3b82f6", dark: "#2563eb", soft: "#e8f0fe" },
          { label: "ห้องว่าง / ทั้งหมด", value: `${availableRooms}`, extra: `/${totalRooms}`, sub: `ครองห้อง ${occupancyRate}%`, icon: BedDouble, color: "#8b5cf6", dark: "#7c3aed", soft: "#f1ebfe", progress: occupancyRate },
          { label: "ห้อง/กรงทั้งหมด", value: totalRooms, sub: `ครองพื้นที่ ${occupancyRate}%`, icon: DoorOpen, color: "#0ea5e9", dark: "#0369a1", soft: "#e0f2fe" },
          { label: "ซ่อมบำรุง", value: maintenanceRooms, sub: "ปิดใช้งานชั่วคราว", icon: AlertTriangle, color: "#6b7280", dark: "#4b5563", soft: "#f1f5f9" },
        ].map((s) => {
          const Ico = s.icon;
          return (
          <motion.div
            key={s.label}
            variants={{ hidden: { opacity: 0, y: 28, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl p-4 overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 group"
            style={{ background: `linear-gradient(135deg, ${s.color} 0%, ${s.dark} 100%)`, boxShadow: `0 6px 18px color-mix(in srgb, ${s.color} 26.7%, transparent)` }}
          >
            {/* Decorative glows */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)" }} />
            <div className="absolute -bottom-10 -left-8 w-24 h-24 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,0,0,0.12) 0%, transparent 70%)" }} />
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)" }} />

            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110" style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.30)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)", backdropFilter: "blur(6px)" }}>
                  <Ico className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
                </div>
                {s.sub && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-white" style={{ fontSize: "calc(10px * var(--fs))", fontWeight: 700, background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(6px)" }}>
                    {s.sub}
                  </span>
                )}
              </div>
              <div className="flex items-end gap-1">
                <span className="text-white" style={{ fontWeight: 800, fontSize: "calc(17px * var(--fs))", lineHeight: 1.1, letterSpacing: "-0.3px", textShadow: "0 1px 4px rgba(0,0,0,0.18)" }}>{s.value}</span>
                {s.extra && <span className="text-white/55" style={{ fontWeight: 700, fontSize: "calc(11px * var(--fs))" }}>{s.extra}</span>}
              </div>
              <div className="text-white/80" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.2px" }}>{s.label}</div>
              {s.progress != null && (
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: "rgba(255,255,255,0.92)" }} initial={{ width: 0 }} animate={{ width: `${s.progress}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }} />
                </div>
              )}
            </div>
          </motion.div>
          );
        })}
      </motion.div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* Bookings header + status dropdown */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>รายการจอง</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {filteredBookings.length} รายการ
                  {(ciFrom || ciTo) && <span className="text-(--brand-dark)" style={{ fontWeight: 600 }}> · กรองวันเริ่มฝาก</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
            {/* ช่วงวันที่เริ่มฝากเลี้ยง */}
            <div className="inline-flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-full bg-white border border-gray-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-(--brand) flex-shrink-0" />
              <span className="text-gray-400 whitespace-nowrap" style={{ fontWeight: 600 }}>เริ่มฝาก</span>
              <DatePickerModern value={ciFrom} onChange={setCiFrom} variant="ghost" placeholder="เริ่มต้น" max={ciTo || undefined} />
              <span className="text-gray-300">–</span>
              <DatePickerModern value={ciTo} onChange={setCiTo} variant="ghost" placeholder="สิ้นสุด" min={ciFrom || undefined} />
              {(ciFrom || ciTo) && (
                <button onClick={() => { setCiFrom(""); setCiTo(""); }} title="ล้างช่วงวันที่"
                  className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(v => !v)}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-3 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-300 transition-colors text-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusFilter === "ทั้งหมด" ? "#cbd5e1" : (statusColor[statusFilter as BookingStatus]?.border || "#cbd5e1") }} />
                <span className="text-gray-700" style={{ fontWeight: 600 }}>{statusFilter}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showStatusDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl overflow-hidden p-1.5"
                      style={{ width: 190, boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
                    >
                      {statuses.map(s => {
                        const isActive = statusFilter === s;
                        const dot = s === "ทั้งหมด" ? "#cbd5e1" : (statusColor[s as BookingStatus]?.border || "#cbd5e1");
                        return (
                          <button key={s} onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }} className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors text-left ${isActive ? "bg-(--brand)/8" : "hover:bg-gray-50"}`}>
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                            <span className="text-[12px] flex-1" style={{ fontWeight: isActive ? 700 : 500, color: isActive ? "var(--brand-dark)" : "#374151" }}>{s}</span>
                            {isActive && <Check className="w-3.5 h-3.5 text-(--brand-dark)" strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2 bg-white rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400">ไม่พบรายการจอง</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredBookings.map((b, idx) => (
                <BookingCard key={b.id} b={b} idx={idx} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-full xl:w-[320px] flex-shrink-0 space-y-4">
          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", boxShadow: "0 3px 10px color-mix(in srgb, var(--brand) 35%, transparent)" }}>
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-sm text-gray-800" style={{ fontWeight: 700 }}>
                  {THAI_MONTHS[calMonth]} {calYear + 543}
                </h4>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center">
              {THAI_DAYS_SHORT.map(d => (
                <div key={d} className="py-1.5 text-[10px] text-gray-400" style={{ fontWeight: 600 }}>{d}</div>
              ))}
              {calendarDays.map((d, i) => (
                <div key={i} className="py-1 flex justify-center">
                  {d ? (() => {
                    const sel = selectedDay === d;
                    const hasBk = dayHasBooking(d);
                    return (
                      <button
                        onClick={() => setSelectedDay(sel ? null : d)}
                        className={`w-8 h-8 rounded-full text-xs transition-all relative ${
                          isToday(d) ? "text-white"
                          : sel ? "text-white"
                          : hasBk ? "text-orange-700 hover:bg-orange-50"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                        style={
                          isToday(d) ? { background: "linear-gradient(135deg, #e8802a, #d06a1a)", fontWeight: 700 }
                          : sel ? { background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", fontWeight: 700, boxShadow: "0 3px 10px color-mix(in srgb, var(--brand) 40%, transparent)" }
                          : { fontWeight: hasBk ? 600 : 400 }
                        }
                      >
                        {d}
                        {hasBk && !isToday(d) && !sel && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
                        )}
                      </button>
                    );
                  })() : null}
                </div>
              ))}
            </div>

            {/* Selected-day check in/out */}
            <AnimatePresence initial={false}>
              {selectedDay != null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="mb-2">
                      <p className="text-xs text-gray-800" style={{ fontWeight: 700 }}>
                        {selectedDay} {monthAbbr} {calYear + 543}
                      </p>
                    </div>
                    {checkInsOnDay.length === 0 && checkOutsOnDay.length === 0 ? (
                      <p className="text-[11px] text-gray-400 py-2 text-center">ไม่มีรายการเข้า–ออกในวันนี้</p>
                    ) : (
                      <div className="space-y-1.5">
                        {checkInsOnDay.map(b => (
                          <button key={`in-${b.id}`} onClick={() => onSelect(b)} className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-emerald-50/60 transition-colors text-left">
                            <div className="relative flex-shrink-0">
                              <img src={b.photo} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                              <span className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-white border-2 border-white" style={{ background: "linear-gradient(135deg,#34d399,#059669)", boxShadow: "0 1px 4px rgba(5,150,105,0.4)" }}>
                                <LogIn className="w-2.5 h-2.5" strokeWidth={2.6} />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{b.petName}</p>
                              <p className="text-[10px] text-gray-400 truncate">{b.breed} · {b.species}</p>
                            </div>
                            <span className="text-[10px] text-emerald-600 flex-shrink-0" style={{ fontWeight: 600 }}>เข้า · {b.roomNumber}</span>
                          </button>
                        ))}
                        {checkOutsOnDay.map(b => (
                          <button key={`out-${b.id}`} onClick={() => onSelect(b)} className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-blue-50/60 transition-colors text-left">
                            <div className="relative flex-shrink-0">
                              <img src={b.photo} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                              <span className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-white border-2 border-white" style={{ background: "linear-gradient(135deg,#60a5fa,#2563eb)", boxShadow: "0 1px 4px rgba(37,99,235,0.4)" }}>
                                <LogOut className="w-2.5 h-2.5" strokeWidth={2.6} />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{b.petName}</p>
                              <p className="text-[10px] text-gray-400 truncate">{b.breed} · {b.species}</p>
                            </div>
                            <span className="text-[10px] text-blue-600 flex-shrink-0" style={{ fontWeight: 600 }}>ออก · {b.roomNumber}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Bookings Tab
   ═══════════════════════════════════════════════════════ */
function BookingsTab({ bookings, onAdvance, onAdvanceWithData, onSelect, onDelete }: {
  bookings: Booking[];
  onAdvance: (b: Booking) => void;
  onAdvanceWithData: (b: Booking, data: Partial<Booking>) => void;
  onSelect: (b: Booking) => void;
  onDelete: (id: number) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const statuses = ["ทั้งหมด", ...STATUS_FLOW];
  const [transitionBooking, setTransitionBooking] = useState<Booking | null>(null);

  const filtered = statusFilter === "ทั้งหมด" ? bookings : bookings.filter(b => b.status === statusFilter);

  return (
    <motion.div
      key="bookings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${statusFilter === s ? "bg-(--brand) text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"}`}
            style={{ fontWeight: statusFilter === s ? 600 : 400 }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((b, idx) => (
          <BookingCard key={b.id} b={b} idx={idx} onSelect={onSelect} onDelete={onDelete} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400" style={{ fontWeight: 500 }}>ไม่พบรายการจองในสถานะนี้</p>
          </div>
        )}
      </div>

      {/* Status Transition Modal */}
      <StatusTransitionModal
        booking={transitionBooking}
        onClose={() => setTransitionBooking(null)}
        onSubmit={(data) => {
          if (transitionBooking) {
            onAdvanceWithData(transitionBooking, data);
            setTransitionBooking(null);
          }
        }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Rooms Tab
   ═══════════════════════════════════════════════════════ */
function RoomsTab({ rooms, bookings }: { rooms: Room[]; bookings: Booking[] }) {
  const [typeFilter, setTypeFilter] = useState("ทั้งหมด");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const types = ["ทั้งหมด", ...roomTypes];

  const filtered = typeFilter === "ทั้งหมด" ? rooms : rooms.filter(r => r.type === typeFilter);

  const statusStyle: Record<string, { bg: string; text: string; border: string }> = {
    "ว่าง": { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    "ไม่ว่าง": { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
    "ซ่อมบำรุง": { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" },
  };

  return (
    <motion.div
      key="rooms"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap items-center">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${typeFilter === t ? "bg-(--brand) text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"}`}
            style={{ fontWeight: typeFilter === t ? 600 : 400 }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((r, idx) => {
          const isFree = r.status === "ว่าง";
          const isOccupied = r.status === "ไม่ว่าง";
          const isMaint = r.status === "ซ่อมบำรุง";
          const ss = statusStyle[r.status] || statusStyle["ว่าง"];
          const dotColor = isFree ? "#34d399" : isOccupied ? "#fb923c" : "#9ca3af";
          const linkedBooking = bookings.find(b => b.roomNumber === r.id && (b.status === "เช็คอิน" || b.status === "ฝากเลี้ยง" || b.status === "เช็คเอาท์"));
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => setSelectedRoom(r)}
              className="relative rounded-2xl border border-gray-100 bg-white p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                {/* Icon chip */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  backgroundImage: isFree
                    ? "linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)"
                    : isOccupied
                    ? "linear-gradient(135deg, #e8802a 0%, #d06a1a 100%)"
                    : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                  boxShadow: `0 4px 12px ${isFree ? "color-mix(in srgb, var(--brand) 35%, transparent)" : isOccupied ? "rgba(232,128,42,0.35)" : "rgba(107,114,128,0.30)"}`,
                }}>
                  {(() => {
                    const isVip = r.type.includes("VIP");
                    if (isMaint) return (
                      <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 19.9925 19.9925">
                        <g clipPath={`url(#clip_alert_${r.id})`}>
                          <path d={alertSvgPaths.pb16fe00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                          <path d="M9.99625 7.49719V10.8293" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                          <path d="M9.99625 14.1614H10.0046" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                        </g>
                        <defs><clipPath id={`clip_alert_${r.id}`}><rect fill="white" height="19.9925" width="19.9925" /></clipPath></defs>
                      </svg>
                    );
                    if (isVip) return (
                      <svg className="w-[24px] h-[19px]" fill="none" viewBox="0 0 25.4102 20.3418">
                        <path d={crownSvgPaths.p3b862af0} fill="white" />
                      </svg>
                    );
                    return (
                      <svg className="w-[14px] h-[20px]" fill="none" viewBox="0 0 15.2441 20.7324">
                        <path d={doorSvgPaths.p38336980} fill="white" />
                        <path d={doorSvgPaths.p3e0b9400} fill="white" />
                      </svg>
                    );
                  })()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] text-gray-900 tracking-[0.2px]" style={{ fontWeight: 700 }}>{r.id}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${ss.bg} ${ss.text}`} style={{ fontWeight: 600 }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{r.type}</p>
                  {isOccupied && r.petName ? (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-sm flex-shrink-0 bg-orange-100 flex items-center justify-center">
                        {linkedBooking?.photo ? <img src={linkedBooking.photo} alt="" className="w-full h-full object-cover" /> : <PawPrint className="w-3 h-3 text-orange-400" />}
                      </div>
                      <span className="text-[10.5px] text-gray-700 truncate" style={{ fontWeight: 600 }}>{r.petName}</span>
                      {linkedBooking && <span className="text-[10px] text-gray-400 truncate">· {linkedBooking.checkIn}–{linkedBooking.checkOut}</span>}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-300 truncate mt-1.5">{isMaint ? "กำลังซ่อมบำรุง" : "ยังไม่มีสัตว์เข้ารับฝาก"}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Room Detail Modal */}
      <AnimatePresence>
        {selectedRoom && (() => {
          const room = selectedRoom;
          const isFree = room.status === "ว่าง";
          const isOccupied = room.status === "ไม่ว่าง";
          const isMaintenance = room.status === "ซ่อมบำรุง";
          const linkedBooking = isOccupied ? bookings.find(b => b.roomNumber === room.id && (b.status === "เช็คอิน" || b.status === "ฝากเลี้ยง" || b.status === "เช็คเอาท์")) : null;

          const rateMap: Record<string, number> = {
            "ห้อง VIP": 800, "ห้อง VIP พิเศษ": 1200, "ห้องธรรมดา": 400,
            "ห้องแมว": 500, "กรงมาตรฐาน": 350, "กรงนก/สัตว์เล็ก": 250, "ห้องกักกัน": 600,
          };
          const featureMap: Record<string, string[]> = {
            "ห้อง VIP": ["แอร์", "กล้องวงจรปิด", "เตียงนุ่ม", "พื้นที่กว้าง"],
            "ห้อง VIP พิเศษ": ["แอร์", "กล้องวงจรปิด", "เตียงพรีเมียม", "พื้นที่กว้างพิเศษ", "สระว่ายน้ำ"],
            "ห้องธรรมดา": ["พัดลม", "ถาดอาหาร", "ผ้ารองนอน"],
            "ห้องแมว": ["แอร์", "คอนโดแมว", "ที่ลับเล็บ", "ของเล่น"],
            "กรงมาตรฐาน": ["ถาดอาหาร", "ถาดน้ำ", "ผ้ารองนอน"],
            "กรงนก/สัตว์เล็ก": ["คอนไม้", "ถาดอาหาร", "กระดิ่ง"],
            "ห้องกักกัน": ["แอร์", "ระบบกรองอากาศ", "แยกพื้นที่"],
          };
          const features = room.amenities && room.amenities.length > 0 ? room.amenities : (featureMap[room.type] || ["ถาดอาหาร"]);
          const rate = room.pricePerNight ?? (rateMap[room.type] || 400);

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setSelectedRoom(null)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="w-full max-w-[440px] vet-modal"
                  style={{ height: "min(560px, calc(100vh - 2rem))" }}
                >
                  {/* Header */}
                  <div className="vet-modal-header rounded-t-3xl">
                    <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                      style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                    <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                      style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="vet-modal-header-icon">
                          {(() => {
                            const isVip = room.type.includes("VIP");
                            if (isMaintenance) return (
                              <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 19.9925 19.9925">
                                <g clipPath="url(#clip_alert_modal)">
                                  <path d={alertSvgPaths.pb16fe00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                                  <path d="M9.99625 7.49719V10.8293" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                                  <path d="M9.99625 14.1614H10.0046" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                                </g>
                                <defs><clipPath id="clip_alert_modal"><rect fill="white" height="19.9925" width="19.9925" /></clipPath></defs>
                              </svg>
                            );
                            if (isVip) return (
                              <svg className="w-[25px] h-[20px]" fill="none" viewBox="0 0 25.4102 20.3418">
                                <path d={crownSvgPaths.p255a1500} fill="white" opacity="0" />
                                <path d={crownSvgPaths.p3b862af0} fill="white" />
                              </svg>
                            );
                            return (
                              <svg className="w-[15px] h-[21px]" fill="none" viewBox="0 0 15.2441 20.7324">
                                <path d={doorSvgPaths.p2fdb5a80} fill="white" opacity="0" />
                                <path d={doorSvgPaths.p38336980} fill="white" />
                                <path d={doorSvgPaths.p3e0b9400} fill="white" />
                              </svg>
                            );
                          })()}
                        </div>
                        <div>
                          <h2 className="vet-section-title">ห้อง {room.id}</h2>
                          <p className="vet-tiny mt-[2px]">{room.type}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedRoom(null)} className="vet-modal-close">
                        <X className="w-[16px] h-[16px] text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="vet-modal-body">
                    <div className="space-y-5">
                      {/* Status hero */}
                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                            background: isFree
                              ? "linear-gradient(135deg, color-mix(in srgb, var(--brand) 12%, transparent), rgba(52,211,153,0.08))"
                              : isOccupied
                              ? "linear-gradient(135deg, rgba(232,128,42,0.12), rgba(251,146,60,0.08))"
                              : "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(0,0,0,0.03))",
                          }}>
                            {(() => {
                              const isVip = room.type.includes("VIP");
                              const iconColor = isFree ? "var(--brand)" : isOccupied ? "#e8802a" : "#9ca3af";
                              if (isMaintenance) return (
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 19.9925 19.9925">
                                  <g clipPath="url(#clip_alert_hero)">
                                    <path d={alertSvgPaths.pb16fe00} stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                                    <path d="M9.99625 7.49719V10.8293" stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                                    <path d="M9.99625 14.1614H10.0046" stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.666" />
                                  </g>
                                  <defs><clipPath id="clip_alert_hero"><rect fill="white" height="19.9925" width="19.9925" /></clipPath></defs>
                                </svg>
                              );
                              if (isVip) return (
                                <svg className="w-8 h-7" fill="none" viewBox="0 0 25.4102 20.3418">
                                  <path d={crownSvgPaths.p255a1500} fill={iconColor} opacity="0" />
                                  <path d={crownSvgPaths.p3b862af0} fill={iconColor} />
                                </svg>
                              );
                              return (
                                <svg className="w-5 h-7" fill="none" viewBox="0 0 15.2441 20.7324">
                                  <path d={doorSvgPaths.p2fdb5a80} fill={iconColor} opacity="0" />
                                  <path d={doorSvgPaths.p38336980} fill={iconColor} />
                                  <path d={doorSvgPaths.p3e0b9400} fill={iconColor} />
                                </svg>
                              );
                            })()}
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{
                            fontWeight: 600,
                            color: isFree ? "#059669" : isOccupied ? "#c2410c" : "#6b7280",
                            background: isFree ? "rgba(5,150,105,0.08)" : isOccupied ? "rgba(194,65,12,0.08)" : "rgba(0,0,0,0.05)",
                          }}>
                            <span className="w-2 h-2 rounded-full" style={{
                              background: isFree ? "#34d399" : isOccupied ? "#fb923c" : "#9ca3af",
                              boxShadow: isFree ? "0 0 6px rgba(52,211,153,0.6)" : isOccupied ? "0 0 6px rgba(251,146,60,0.5)" : "none",
                            }} />
                            {room.status}
                          </span>
                        </div>
                      </div>

                      {/* Room info */}
                      <div>
                        <p className="vet-divider">ข้อมูลห้อง</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <BedDouble className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>ประเภท</span>
                            </div>
                            <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{room.type}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <CreditCard className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>อัตราค่าบริการ</span>
                            </div>
                            <p className="text-xs text-(--brand)" style={{ fontWeight: 700 }}>{rate.toLocaleString()} บาท/คืน</p>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <p className="vet-divider">สิ่งอำนวยความสะดวก</p>
                        <div className="flex flex-wrap gap-1.5">
                          {features.map(f => (
                            <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-(--brand)/5 text-(--brand-dark) border border-(--brand)/10" style={{ fontWeight: 500 }}>
                              <Sparkles className="w-3 h-3" />
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pet info if occupied */}
                      {linkedBooking && (
                        <div>
                          <p className="vet-divider">สัตว์เลี้ยงที่เข้าพัก</p>
                          <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(232,128,42,0.2)", background: "linear-gradient(135deg, #fffbf5, #ffffff)" }}>
                            <div className="flex items-center gap-3 p-3">
                              <img src={linkedBooking.photo} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{linkedBooking.petName}</p>
                                <p className="text-[11px] text-gray-400 truncate">{linkedBooking.breed} · {linkedBooking.species}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-px bg-orange-100/50">
                              {[
                                { label: "เจ้าของ", value: linkedBooking.ownerName, icon: User },
                                { label: "โทรศัพท์", value: linkedBooking.ownerPhone, icon: Phone },
                                { label: "เช็คอิน", value: linkedBooking.checkIn, icon: Calendar },
                                { label: "เช็คเอาท์", value: linkedBooking.checkOut, icon: Calendar },
                              ].map(item => (
                                <div key={item.label} className="bg-white px-3 py-2">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <item.icon className="w-2.5 h-2.5 text-gray-300" />
                                    <span className="text-[9px] text-gray-400" style={{ fontWeight: 500 }}>{item.label}</span>
                                  </div>
                                  <p className="text-[11px] text-gray-700 truncate" style={{ fontWeight: 600 }}>{item.value}</p>
                                </div>
                              ))}
                            </div>
                            {linkedBooking.services.length > 0 && (
                              <div className="px-3 py-2 bg-white border-t border-orange-100/50">
                                <p className="text-[9px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>บริการเสริม</p>
                                <div className="flex flex-wrap gap-1">
                                  {linkedBooking.services.map(s => (
                                    <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-orange-50 text-orange-600" style={{ fontWeight: 500 }}>{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {linkedBooking.notes && (
                              <div className="px-3 py-2 bg-amber-50/50 border-t border-orange-100/50">
                                <p className="text-[10px] text-amber-700 leading-relaxed">
                                  <span style={{ fontWeight: 600 }}>หมายเหตุ:</span> {linkedBooking.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Empty state for free rooms */}
                      {isFree && (
                        <div className="text-center py-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                          <DoorOpen className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                          <p className="text-xs text-emerald-600" style={{ fontWeight: 500 }}>ห้องนี้พร้อมให้บริการ</p>
                          <p className="text-[10px] text-emerald-400 mt-0.5">สามารถจองฝากเลี้ยงได้ทันที</p>
                        </div>
                      )}

                      {/* Maintenance state */}
                      {isMaintenance && (
                        <div className="text-center py-4 rounded-xl bg-gray-50 border border-gray-200">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-xs text-gray-500" style={{ fontWeight: 500 }}>ห้องอยู่ระหว่างการซ่อมบำรุง</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">ไม่สามารถจองได้ในขณะนี้</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="vet-modal-footer">
                    <button onClick={() => setSelectedRoom(null)} className="vet-btn vet-btn-secondary">ปิด</button>
                  </div>
                </motion.div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   New Room Modal
   ═══════════════════════════════════════════════════════ */
const roomStatusOptions = ["ว่าง", "ซ่อมบำรุง"] as const;
const suitableForOptions = ["สุนัขขนาดเล็ก", "สุนัขขนาดกลาง", "สุนัขขนาดใหญ่", "แมว", "นก/สัตว์เล็ก", "สัตว์ทุกชนิด"];
const amenityOptions = ["แอร์", "พัดลม", "กล้องวงจรปิด", "เตียงนุ่ม", "เตียงพรีเมียม", "พื้นที่กว้าง", "พื้นที่กว้างพิเศษ", "สระว่ายน้ำ", "คอนโดแมว", "ที่ลับเล็บ", "ของเล่น", "คอนไม้", "กระดิ่ง", "ถาดอาหาร", "ถาดน้ำ", "ผ้ารองนอน", "ระบบกรองอากาศ", "แยกพื้นที่"];

export function NewRoomModal({ open, onClose, onSave, existingRoomIds }: {
  open: boolean;
  onClose: () => void;
  onSave: (room: Room) => void;
  existingRoomIds: string[];
}) {
  const [roomType, setRoomType] = useState(roomTypes[0]);
  const [roomId, setRoomId] = useState("");
  const [zone, setZone] = useState("");
  const [floor, setFloor] = useState("1");
  const [sizeSqm, setSizeSqm] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("1");
  const [suitableFor, setSuitableFor] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [longStayDiscount, setLongStayDiscount] = useState("");
  const [minDeposit, setMinDeposit] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [roomStatus, setRoomStatus] = useState<"ว่าง" | "ซ่อมบำรุง">("ว่าง");
  const [photo, setPhoto] = useState("");
  const [notes, setNotes] = useState("");

  const isDuplicate = existingRoomIds.includes(roomId.trim());
  const canSave = roomId.trim() && !isDuplicate && pricePerNight;

  const handleSave = () => {
    if (!canSave) return;
    const room: Room = {
      id: roomId.trim(),
      type: roomType,
      status: roomStatus,
      zone: zone || undefined,
      floor: floor || undefined,
      sizeSqm: sizeSqm ? parseFloat(sizeSqm) : undefined,
      maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
      suitableFor: suitableFor || undefined,
      pricePerNight: pricePerNight ? parseFloat(pricePerNight) : undefined,
      longStayDiscount: longStayDiscount ? parseFloat(longStayDiscount) : undefined,
      minDeposit: minDeposit ? parseFloat(minDeposit) : undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      photo: photo || undefined,
      notes: notes || undefined,
    };
    onSave(room);
    // reset
    setRoomId(""); setZone(""); setFloor("1"); setSizeSqm(""); setMaxCapacity("1");
    setSuitableFor(""); setPricePerNight(""); setLongStayDiscount(""); setMinDeposit("");
    setAmenities([]); setRoomStatus("ว่าง"); setPhoto(""); setNotes("");
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
              className="w-full max-w-[560px] vet-modal"
              style={{ height: "min(760px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <BedDouble className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">เพิ่มห้องพักใหม่</h2>
                      <p className="vet-tiny mt-[2px]">กรอกข้อมูลห้องพักให้ครบถ้วน</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body">
                <div className="space-y-[20px]">

                  {/* Section: ประเภทห้องพัก */}
                  <div>
                    <p className="vet-divider">ประเภทห้องพัก</p>
                    <select value={roomType} onChange={e => setRoomType(e.target.value)} className="vet-input">
                      {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Section: ข้อมูลห้องพัก */}
                  <div>
                    <p className="vet-divider">ข้อมูลห้องพัก</p>
                    <div className="vet-form-gap">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">หมายเลขห้อง <span className="required">*</span></label>
                          <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="เช่น A-04" className={`vet-input ${isDuplicate ? "!border-red-300 !ring-red-100" : ""}`} />
                          {isDuplicate && <p className="text-[10px] text-red-500 mt-1">หมายเลขห้องนี้มีอยู่แล้ว</p>}
                        </div>
                        <div>
                          <label className="vet-label">โซน</label>
                          <input value={zone} onChange={e => setZone(e.target.value)} placeholder="เช่น A, B, C" className="vet-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="vet-label">ชั้น</label>
                          <input type="number" value={floor} onChange={e => setFloor(e.target.value)} min="1" className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">ขนาดห้อง (ตร.ม.)</label>
                          <input type="number" value={sizeSqm} onChange={e => setSizeSqm(e.target.value)} placeholder="เช่น 6" min="0" step="0.5" className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">ความจุสูงสุด</label>
                          <input type="number" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} min="1" className="vet-input" />
                        </div>
                      </div>
                      <div>
                        <label className="vet-label">เหมาะสำหรับ</label>
                        <select value={suitableFor} onChange={e => setSuitableFor(e.target.value)} className="vet-input">
                          <option value="">— เลือก —</option>
                          {suitableForOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section: ราคาและโปรโมชั่น */}
                  <div>
                    <p className="vet-divider">ราคาและโปรโมชั่น</p>
                    <div className="vet-form-gap">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="vet-label">ราคาต่อคืน (บาท) <span className="required">*</span></label>
                          <input type="number" value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} placeholder="เช่น 800" min="0" className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">ส่วนลดระยะยาว (%)</label>
                          <input type="number" value={longStayDiscount} onChange={e => setLongStayDiscount(e.target.value)} placeholder="เช่น 10" min="0" max="100" className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">มัดจำขั้นต่ำ (บาท)</label>
                          <input type="number" value={minDeposit} onChange={e => setMinDeposit(e.target.value)} placeholder="เช่น 500" min="0" className="vet-input" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: สิ่งอำนวยความสะดวก */}
                  <div>
                    <p className="vet-divider">สิ่งอำนวยความสะดวกในห้อง</p>
                    <div className="flex flex-wrap gap-2">
                      {amenityOptions.map(a => (
                        <button
                          key={a}
                          onClick={() => setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${amenities.includes(a) ? "border-(--brand) bg-(--brand)/5 text-(--brand)" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                          style={{ fontWeight: amenities.includes(a) ? 500 : 400 }}
                        >
                          {amenities.includes(a) && <Check className="w-3 h-3 inline mr-1" />}
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section: สถานะและอื่นๆ */}
                  <div>
                    <p className="vet-divider">สถานะและอื่นๆ</p>
                    <div className="vet-form-gap">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">สถานะห้องพัก</label>
                          <select value={roomStatus} onChange={e => setRoomStatus(e.target.value as typeof roomStatus)} className="vet-input">
                            {roomStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="vet-label">รูปห้อง (URL)</label>
                          <input value={photo} onChange={e => setPhoto(e.target.value)} placeholder="https://..." className="vet-input" />
                        </div>
                      </div>
                      <div>
                        <label className="vet-label">หมายเหตุ</label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับห้องพัก..."
                          className="vet-textarea"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="vet-btn vet-btn-primary btn-green ml-auto"
                >
                  <Check className="w-4 h-4" /> เพิ่มห้องพัก
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
   Activities Tab
   ═══════════════════════════════════════════════════════ */
function ActivitiesTab({ bookings, onAddActivity }: {
  bookings: Booking[];
  onAddActivity: (bookingId: number, activity: Activity) => void;
}) {
  const [selectedPet, setSelectedPet] = useState(bookings[0]?.id ?? 0);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("ให้อาหาร");
  const [formDetail, setFormDetail] = useState("");
  const [formTime, setFormTime] = useState("08:00");
  const [formStaff, setFormStaff] = useState("สมศรี");

  const currentBooking = bookings.find(b => b.id === selectedPet);

  return (
    <motion.div
      key="activities"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Pet selector */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {bookings.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedPet(b.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 whitespace-nowrap transition-all ${selectedPet === b.id ? "border-(--brand) bg-(--brand)/5" : "border-gray-200 bg-white hover:border-gray-300"}`}
          >
            <img src={b.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left">
              <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{b.petName}</p>
              <p className="text-[10px] text-gray-400">ห้อง {b.roomNumber}</p>
            </div>
          </button>
        ))}
      </div>

      {currentBooking && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 vet-border-b">
            <div>
              <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>บันทึกกิจกรรม — {currentBooking.petName}</h3>
              <p className="text-xs text-gray-400 mt-0.5">ห้อง {currentBooking.roomNumber} · {currentBooking.checkIn} – {currentBooking.checkOut}</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-add-green flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full text-white"
              style={{ fontWeight: 600, background: "linear-gradient(177deg, #5a9e60, #3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มกิจกรรม
            </button>
          </div>

          {/* Activity timeline */}
          <div className="p-5 space-y-3">
            {currentBooking.activities.length === 0 ? (
              <div className="text-center py-10 text-gray-300">
                <Heart className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm text-gray-400">ยังไม่มีกิจกรรมที่บันทึก</p>
              </div>
            ) : (
              currentBooking.activities.map((a, idx) => {
                const AIcon = activityIcons[a.type] || FileText;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-(--brand) to-(--brand-dark) flex items-center justify-center">
                        <AIcon className="w-4 h-4 text-white" />
                      </div>
                      {idx < currentBooking.activities.length - 1 && <div className="w-px h-full bg-gray-200 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{a.type}</span>
                        <span className="text-[10px] text-gray-400">· {a.time} น.</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">โดย: {a.staff}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Inline add form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-100 overflow-hidden"
              >
                <div className="p-5 space-y-3 bg-gray-50/50">
                  <p className="vet-divider">เพิ่มกิจกรรมใหม่</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="vet-label">ประเภทกิจกรรม</label>
                      <select value={formType} onChange={e => setFormType(e.target.value)} className="vet-input">
                        {activityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="vet-label">เวลา</label>
                      <TimePickerModern value={formTime} onChange={setFormTime} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="vet-label">รายละเอียด</label>
                      <input value={formDetail} onChange={e => setFormDetail(e.target.value)} placeholder="เช่น อาหารเช้า — เนื้อวัวบด" className="vet-input" />
                    </div>
                    <div>
                      <label className="vet-label">ผู้บันทึก</label>
                      <input value={formStaff} onChange={e => setFormStaff(e.target.value)} className="vet-input" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => setShowForm(false)} className="vet-btn vet-btn-secondary vet-btn-sm">ยกเลิก</button>
                    <button
                      onClick={() => {
                        if (!formDetail.trim()) return;
                        onAddActivity(selectedPet, {
                          id: Date.now(),
                          time: formTime,
                          type: formType,
                          detail: formDetail,
                          staff: formStaff,
                        });
                        setFormDetail("");
                        setShowForm(false);
                      }}
                      className="vet-btn vet-btn-primary vet-btn-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> บันทึก
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Billing Tab
   ═══════════════════════════════════════════════════════ */
function BillingTab({ bookings }: { bookings: Booking[] }) {
  return (
    <motion.div
      key="billing"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 vet-border-b">
          <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>รายการคิดค่าบริการ</h3>
          <p className="text-xs text-gray-400 mt-0.5">สรุปค่าใช้จ่ายของสัตว์เลี้ยงที่เข้าพักทั้งหมด</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-xs text-gray-500">
                <th className="text-left px-5 py-3" style={{ fontWeight: 600 }}>สัตว์เลี้ยง</th>
                <th className="text-left px-4 py-3" style={{ fontWeight: 600 }}>ห้อง</th>
                <th className="text-left px-4 py-3" style={{ fontWeight: 600 }}>ระยะเวลา</th>
                <th className="text-right px-4 py-3" style={{ fontWeight: 600 }}>ค่าห้อง/คืน</th>
                <th className="text-right px-4 py-3" style={{ fontWeight: 600 }}>บริการเสริม</th>
                <th className="text-right px-4 py-3" style={{ fontWeight: 600 }}>รวม (บาท)</th>
                <th className="text-left px-4 py-3" style={{ fontWeight: 600 }}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, idx) => {
                const nights = 3 + idx; // mock calculation
                const servicesTotal = b.services.length * 100;
                const total = (b.dailyRate * nights) + servicesTotal;
                const sc = statusColor[b.status];

                return (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <img src={b.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{b.petName}</p>
                          <p className="text-[10px] text-gray-400">{b.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{b.roomType} ({b.roomNumber})</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{nights} คืน</td>
                    <td className="px-4 py-3 text-xs text-gray-700 text-right" style={{ fontWeight: 500 }}>{b.dailyRate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 text-right" style={{ fontWeight: 500 }}>{servicesTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-(--brand)" style={{ fontWeight: 700 }}>{total.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${sc.bg} ${sc.text}`} style={{ fontWeight: 500 }}>
                        {b.status === "เช็คเอาท์" ? "ชำระแล้ว" : "รอชำระ"}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div className="px-5 py-4 vet-border-t bg-gray-50/50 flex items-center justify-between">
          <span className="text-xs text-gray-500">ยอดรวมทั้งหมด ({bookings.length} รายการ)</span>
          <span className="text-lg text-(--brand)" style={{ fontWeight: 700 }}>
            {bookings.reduce((sum, b, i) => sum + (b.dailyRate * (3 + i)) + (b.services.length * 100), 0).toLocaleString()} บาท
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   New Booking Modal
   ═══════════════════════════════════════════════════════ */
function NewBookingModal({ open, onClose, onSave, nextId, rooms }: {
  open: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  nextId: number;
  rooms: Room[];
}) {
  const [petSearch, setPetSearch] = useState("");
  const [selectedPet, setSelectedPet] = useState<typeof petDB[0] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const nowTime = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkInTime, setCheckInTime] = useState(nowTime);
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomType, setRoomType] = useState(roomTypes[0]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDropdown(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const petResults = petSearch ? petDB.filter(p => p.name.includes(petSearch) || p.owner.includes(petSearch) || p.hn.includes(petSearch)) : petDB;
  const availableRooms = rooms.filter(r => r.type === roomType && r.status === "ว่าง");

  const canSave = selectedPet && checkInDate && checkOutDate && selectedRoom;

  const handleSave = () => {
    if (!selectedPet || !canSave) return;
    const booking: Booking = {
      id: nextId,
      petName: selectedPet.name,
      species: selectedPet.species,
      breed: selectedPet.breed,
      ownerName: selectedPet.owner,
      ownerPhone: selectedPet.phone,
      photo: selectedPet.photo,
      checkIn: checkInDate.split("-").slice(1).join("/"),
      checkOut: checkOutDate.split("-").slice(1).join("/"),
      roomType,
      roomNumber: selectedRoom,
      status: "ลงทะเบียน",
      services,
      notes,
      dailyRate: roomType.includes("VIP") ? 800 : roomType.includes("แมว") ? 500 : 400,
      activities: [],
    };
    onSave(booking);
    onClose();
    // reset
    setPetSearch(""); setSelectedPet(null); setCheckOutDate(""); setServices([]); setNotes("");
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
              className="w-full max-w-[520px] vet-modal"
              style={{ height: "min(720px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <Home className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">สร้างการจองฝากเลี้ยง</h2>
                      <p className="vet-tiny mt-[2px]">กรอกข้อมูลให้ครบถ้วน</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body">
                <div className="space-y-[20px]">
                  {/* Section: เลือกสัตว์เลี้ยง */}
                  <div>
                    <p className="vet-divider">เลือกสัตว์เลี้ยง</p>
                    <div className="relative" ref={dropRef}>
                      <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                      <input
                        value={selectedPet ? `${selectedPet.name} (${selectedPet.breed})` : petSearch}
                        onChange={e => { setPetSearch(e.target.value); setSelectedPet(null); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="ค้นหาชื่อสัตว์เลี้ยง หรือ เจ้าของ..."
                        className="vet-input has-icon-left"
                      />
                      {selectedPet && (
                        <button onClick={() => { setSelectedPet(null); setPetSearch(""); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      )}
                      <AnimatePresence>
                        {showDropdown && !selectedPet && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto"
                          >
                            {petResults.map(p => (
                              <button
                                key={p.name}
                                onClick={() => { setSelectedPet(p); setPetSearch(""); setShowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left"
                              >
                                <img src={p.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                  <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{p.name} <span className="text-gray-400" style={{ fontWeight: 400 }}>({p.hn})</span></p>
                                  <p className="text-[10px] text-gray-400">{p.breed} · {p.owner}</p>
                                </div>
                              </button>
                            ))}
                            {petResults.length === 0 && (
                              <div className="px-3 py-4 text-center text-xs text-gray-400">ไม่พบข้อมูล</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Section: วัน-เวลา */}
                  <div>
                    <p className="vet-divider">กำหนดวัน-เวลา</p>
                    <div className="vet-form-gap">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">วันที่เข้าพัก <span className="required">*</span></label>
                          <DatePickerModern value={checkInDate} onChange={setCheckInDate} />
                        </div>
                        <div>
                          <label className="vet-label">เวลาเข้า</label>
                          <TimePickerModern value={checkInTime} onChange={setCheckInTime} />
                        </div>
                      </div>
                      <div>
                        <label className="vet-label">วันที่รับกลับ <span className="required">*</span></label>
                        <DatePickerModern value={checkOutDate} onChange={setCheckOutDate} />
                      </div>
                    </div>
                  </div>

                  {/* Section: ห้องพัก */}
                  <div>
                    <p className="vet-divider">ห้องพัก / กรง</p>
                    <div className="vet-form-gap">
                      <div>
                        <label className="vet-label">ประเภทห้อง <span className="required">*</span></label>
                        <select value={roomType} onChange={e => { setRoomType(e.target.value); setSelectedRoom(""); }} className="vet-input">
                          {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="vet-label">เลือกห้อง <span className="required">*</span></label>
                        {availableRooms.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {availableRooms.map(r => (
                              <button
                                key={r.id}
                                onClick={() => setSelectedRoom(r.id)}
                                className={`px-3 py-2 text-xs rounded-xl border-2 transition-all ${selectedRoom === r.id ? "border-(--brand) bg-(--brand)/5 text-(--brand)" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                                style={{ fontWeight: selectedRoom === r.id ? 600 : 400 }}
                              >
                                {r.id}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-red-400">ไม่มีห้องว่างในประเภทนี้</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: บริการเสริม */}
                  <div>
                    <p className="vet-divider">บริการเสริม</p>
                    <div className="flex flex-wrap gap-2">
                      {extraServices.map(s => (
                        <button
                          key={s}
                          onClick={() => setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${services.includes(s) ? "border-(--brand) bg-(--brand)/5 text-(--brand)" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                          style={{ fontWeight: services.includes(s) ? 500 : 400 }}
                        >
                          {services.includes(s) && <Check className="w-3 h-3 inline mr-1" />}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="vet-divider">หมายเหตุ</p>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="เช่น แพ้อาหารชนิดไหน, นิสัย, ข้อควรระวัง..."
                      className="vet-textarea"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="vet-btn vet-btn-primary btn-green ml-auto"
                >
                  <Check className="w-4 h-4" /> สร้างการจอง
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
   Confirm Modal
   ═══════════════════════════════════════════════════════ */
function ConfirmModal({ open, title, message, icon, onConfirm, onClose }: {
  open: boolean;
  title: string;
  message: string;
  icon: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}) {
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
              className="w-full max-w-[380px] bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", boxShadow: "0 4px 14px color-mix(in srgb, var(--brand) 30%, transparent)" }}>
                  {icon}
                </div>
                <h3 className="text-sm text-gray-800 mb-2" style={{ fontWeight: 700 }}>{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={onClose} className="flex-1 vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={onConfirm}
                  className="flex-1 vet-btn vet-btn-primary btn-green">
                  <Check className="w-4 h-4" /> ยืนยัน
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
   Status Transition Modal  (gold-standard design)
   ═══════════════════════════════════════════════════════ */
const HEALTH_OPTS: ("ปกติ" | "เครียด" | "ป่วย")[] = ["ปกติ", "เครียด", "ป่วย"];
const HC_MAP: Record<string, "green" | "yellow" | "red"> = { "ปกติ": "green", "เครียด": "yellow", "ป่วย": "red" };
const PAY_METHODS = [
  { id: "promptpay", label: "PromptPay", ico: Smartphone },
  { id: "credit", label: "บัตรเครดิต", ico: CreditCard },
  { id: "cash", label: "เงินสด", ico: Banknote },
];
const DEP_OPTS = [500, 800, 1000, 1500, 2000];

const STATUS_TITLES: Record<BookingStatus, { title: string; sub: string; icon: typeof LogIn }> = {
  "ลงทะเบียน": { title: "เริ่ม Check-in — บันทึกข้อมูลรับฝาก", sub: "กรอกข้อมูลสุขภาพและมัดจำ", icon: LogIn },
  "เช็คอิน":   { title: "บันทึก Check-in", sub: "บันทึกสุขภาพ, จัดสรรกรง, รับมัดจำ", icon: LogIn },
  "ฝากเลี้ยง": { title: "ออกบิล — สรุปค่าใช้จ่าย", sub: "ตรวจสอบค่าใช้จ่ายก่อนรับชำระ", icon: CreditCard },
  "ชำระเงิน":   { title: "เริ่ม Check-out — ส่งสัตว์เลี้ยงกลับบ้าน", sub: "ตรวจสุขภาพ, คืนอุปกรณ์, ส่งมอบ", icon: LogOut },
  "เช็คเอาท์":  { title: "ปิดงาน", sub: "บันทึกส่งมอบและขอบคุณ", icon: Check },
};

function StatusTransitionModal({ booking, onClose, onSubmit }: {
  booking: Booking | null;
  onClose: () => void;
  onSubmit: (data: Partial<Booking>) => void;
}) {
  const [wt, setWt] = useState("");
  const [tp, setTp] = useState("38.5");
  const [hs, setHs] = useState<"ปกติ" | "เครียด" | "ป่วย">("ปกติ");
  const [dp, setDp] = useState(1000);
  const [nt, setNt] = useState("");
  const [pm, setPm] = useState("promptpay");
  const [ho, setHo] = useState("");
  const [ciPhotos, setCiPhotos] = useState<string[]>([]);
  const [coPhotos, setCoPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoTarget, setPhotoTarget] = useState<"ci" | "co">("ci");
  const prevRef = useRef<number | null>(null);
  if (booking && booking.id !== prevRef.current) {
    prevRef.current = booking.id;
    setWt(booking.weight || ""); setTp(booking.temperature || "101.3");
    setHs(booking.healthStatus || "ปกติ"); setDp(booking.deposit || 1000);
    setNt(""); setPm("promptpay"); setHo(booking.handoverNote || "");
    setCiPhotos(booking.checkinPhotos || []); setCoPhotos(booking.checkoutPhotos || []);
  }

  if (!booking) return null;

  const s = booking.status;
  const nl = NEXT_STATUS_LABEL[s];
  const sc = statusColor[s];
  const cfg = STATUS_TITLES[s];
  const HeaderIcon = cfg.icon;

  // Payment calc
  const ngt = 6;
  const rc = booking.dailyRate * ngt, svc = booking.services.length * 200;
  const sub = rc + svc, vat = Math.round(sub * 0.07), tot = sub + vat;
  const dd = booking.deposit || 0, net = tot - dd;

  const submit = () => {
    let d: Partial<Booking> = {};
    // ลงทะเบียน → เช็คอิน: รับสัตว์เข้าพัก (vital + deposit + photos)
    if (s === "ลงทะเบียน") d = { weight: wt, temperature: tp, healthStatus: hs, healthColor: HC_MAP[hs], deposit: dp, checkInTime: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }), checkinPhotos: ciPhotos.length > 0 ? ciPhotos : undefined };
    // เช็คอิน → ฝากเลี้ยง: just advance
    else if (s === "เช็คอิน") d = {};
    // ฝากเลี้ยง → ชำระเงิน: confirm bill + payment method
    else if (s === "ฝากเลี้ยง") d = { paymentMethod: pm, paymentCompleted: true };
    // ชำระเงิน → เช็คเอาท์: handover (vital + photos + handover note)
    else if (s === "ชำระเงิน") d = { weight: wt, temperature: tp, healthStatus: hs, healthColor: HC_MAP[hs], checkOutTime: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }), handoverNote: ho || nt, checkoutPhotos: coPhotos.length > 0 ? coPhotos : undefined };
    onSubmit(d);
  };

  const ok = s === "ลงทะเบียน" ? wt.trim() !== "" && tp.trim() !== "" : true;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        if (photoTarget === "ci") setCiPhotos(prev => prev.length < 6 ? [...prev, url] : prev);
        else setCoPhotos(prev => prev.length < 6 ? [...prev, url] : prev);
      };
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const openFilePicker = (target: "ci" | "co") => {
    setPhotoTarget(target);
    setTimeout(() => fileRef.current?.click(), 0);
  };

  const removePhoto = (target: "ci" | "co", idx: number) => {
    if (target === "ci") setCiPhotos(prev => prev.filter((_, i) => i !== idx));
    else setCoPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const PhotoSection = ({ target, photos, label }: { target: "ci" | "co"; photos: string[]; label: string }) => (
    <div>
      <p className="vet-divider">{label}</p>
      <div className="vet-form-gap">
        <div className="flex flex-wrap gap-[8px]">
          {photos.map((p, i) => (
            <div key={i} className="relative group w-[72px] h-[72px] rounded-[12px] overflow-hidden border border-gray-200 bg-gray-50">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(target, i)}
                className="absolute top-[2px] right-[2px] w-[18px] h-[18px] rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-[10px] h-[10px]" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[8px] text-center py-[1px]" style={{ fontWeight: 500 }}>
                #{i + 1}
              </div>
            </div>
          ))}
          {photos.length < 6 && (
            <button onClick={() => openFilePicker(target)}
              className="w-[72px] h-[72px] rounded-[12px] border-2 border-dashed border-gray-200 hover:border-(--brand)/40 bg-gray-50/50 hover:bg-(--brand)/5 flex flex-col items-center justify-center gap-[4px] transition-all">
              <Camera className="w-[18px] h-[18px] text-gray-300" />
              <span className="text-[9px] text-gray-400" style={{ fontWeight: 500 }}>เพิ่มรูป</span>
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-400" style={{ fontWeight: 400 }}>
          แนบภาพถ่ายสัตว์เลี้ยง สูงสุด 6 รูป ({photos.length}/6)
        </p>
      </div>
    </div>
  );

  const healthButtons = HEALTH_OPTS.map(h => {
    const active = hs === h;
    return (
      <button key={h} onClick={() => setHs(h)}
        className={`flex-1 flex items-center justify-center gap-[6px] rounded-[12px] border text-[13px] transition-all ${
          active
            ? h === "ปกติ" ? "bg-green-500 text-white border-green-500"
            : h === "เครียด" ? "bg-yellow-500 text-white border-yellow-500"
            : "bg-red-500 text-white border-red-500"
            : h === "ปกติ" ? "bg-green-50 border-green-200 text-green-600"
            : h === "เครียด" ? "bg-yellow-50 border-yellow-200 text-yellow-600"
            : "bg-red-50 border-red-200 text-red-600"
        }`}
        style={{ fontWeight: active ? 600 : 500 }}
      >
        {h}
      </button>
    );
  });

  return (
    <AnimatePresence>
      {booking && (
        <>
          {/* Backdrop */}
          <motion.div
            key="stm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div key="stm-content" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[480px] vet-modal"
              style={{ height: "min(680px, calc(100vh - 2rem))" }}
            >
              {/* ── Header (Figma gold-standard) ── */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <HeaderIcon className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">{cfg.title}</h2>
                      <p className="vet-tiny mt-[2px]">{cfg.sub}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="vet-modal-body">
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                <div className="space-y-[20px]">

                  {/* Pet info card */}
                  <div className="flex items-center gap-3 p-[12px] rounded-[14px] bg-gray-50 border border-gray-100">
                    <img src={booking.photo} alt="" className="w-[44px] h-[44px] rounded-full object-cover" style={{ border: `2px solid ${sc.border}` }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{booking.petName} — {booking.breed}</p>
                      <p className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>เจ้าของ: {booking.ownerName} · {booking.ownerPhone}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-[8px] py-[3px] rounded-full text-[10px] ${sc.bg} ${sc.text}`} style={{ fontWeight: 600 }}>
                      {s} → {nl}
                    </span>
                  </div>

                  {/* ═══ จองฝากเลี้ยง → Check-in ═══ */}
                  {s === "ลงทะเบียน" && (<>
                    <div>
                      <p className="vet-divider">ตรวจสอบสุขภาพ</p>
                      <div className="vet-form-gap">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="vet-label">น้ำหนัก (กก.) <span className="required">*</span></label>
                            <div className="relative">
                              <Stethoscope className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                              <input type="number" step="0.1" value={wt} onChange={e => setWt(e.target.value)} placeholder="เช่น 8.5" className="vet-input has-icon-left" />
                            </div>
                          </div>
                          <div>
                            <label className="vet-label">อุณหภูมิ (°F) <span className="required">*</span></label>
                            <div className="relative">
                              <Thermometer className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                              <input type="number" step="0.1" value={tp} onChange={e => setTp(e.target.value)} placeholder="เช่น 101.3" className="vet-input has-icon-left" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="vet-label">สถานะสุขภาพ</label>
                          <div className="flex gap-[8px]" style={{ height: 40 }}>{healthButtons}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="vet-divider">มัดจำ</p>
                      <div className="vet-form-gap">
                        <div className="flex gap-[8px] flex-wrap">
                          {DEP_OPTS.map(d => (
                            <button key={d} onClick={() => setDp(d)}
                              className={`px-[14px] py-[8px] rounded-full text-[13px] transition-all border ${
                                dp === d ? "bg-(--brand)/10 border-(--brand)/30 text-(--brand-dark)" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                              }`} style={{ fontWeight: dp === d ? 600 : 400 }}>
                              ฿{d.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="vet-divider">หมายเหตุ</p>
                      <div className="vet-form-gap">
                        <div>
                          <label className="vet-label">หมายเหตุเพิ่มเติม</label>
                          <textarea value={nt} onChange={e => setNt(e.target.value)} rows={2} placeholder="อาการ, พฤติกรรม, คำแนะนำจากเจ้าของ..." className="vet-textarea" />
                        </div>
                      </div>
                    </div>
                    <PhotoSection target="ci" photos={ciPhotos} label="📷 ภาพถ่ายสัตว์เลี้ยง (Check-in)" />
                  </>)}

                  {/* ═══ ฝากเลี้ยง → ชำระเงิน (bill + payment method) ═══ */}
                  {s === "ฝากเลี้ยง" && (<>
                    <div>
                      <p className="vet-divider">สรุปค่าใช้จ่าย</p>
                      <div className="vet-form-gap">
                        <div className="rounded-[14px] border border-gray-100 overflow-hidden">
                          {[
                            { l: `ค่าห้อง ${booking.roomType} (${ngt} คืน × ฿${booking.dailyRate.toLocaleString()})`, v: `฿${rc.toLocaleString()}`, hi: false },
                            { l: `บริการเสริม (${booking.services.length} รายการ)`, v: `฿${svc.toLocaleString()}`, hi: false },
                            { l: "VAT 7%", v: `฿${vat.toLocaleString()}`, hi: false },
                            { l: "มัดจำหักแล้ว", v: `-฿${dd.toLocaleString()}`, hi: true },
                          ].map((r, i) => (
                            <div key={r.l} className={`flex items-center justify-between px-[14px] py-[10px] text-[13px] ${i % 2 === 0 ? "bg-gray-50/60" : "bg-white"}`}>
                              <span className="text-gray-500" style={{ fontWeight: 400 }}>{r.l}</span>
                              <span className={r.hi ? "text-(--brand)" : "text-gray-700"} style={{ fontWeight: 600 }}>{r.v}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between px-[14px] py-[12px] border-t border-(--brand)/10" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 9%, white) 0%, #FEFBF8 50%, color-mix(in srgb, var(--brand) 6%, white) 100%)" }}>
                            <span className="text-[13px] text-(--brand-dark)" style={{ fontWeight: 700 }}>ยอดชำระสุทธิ</span>
                            <span className="text-[16px] text-(--brand-dark)" style={{ fontWeight: 700 }}>฿{net.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="vet-divider">วิธีชำระเงิน</p>
                      <div className="vet-form-gap">
                        <div className="flex gap-[8px]">
                          {PAY_METHODS.map(p => {
                            const PMIcon = p.ico;
                            const active = pm === p.id;
                            return (
                              <button key={p.id} onClick={() => setPm(p.id)}
                                className={`flex-1 flex items-center justify-center gap-[6px] py-[10px] rounded-[12px] text-[13px] transition-all border ${
                                  active ? "bg-(--brand)/10 border-(--brand)/30 text-(--brand-dark)" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                }`} style={{ fontWeight: active ? 600 : 400 }}>
                                <PMIcon className="w-[16px] h-[16px]" /> {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>)}

                  {/* ═══ ชำระเงิน → เช็คเอาท์ (handover: vital + photos + note) ═══ */}
                  {s === "ชำระเงิน" && (<>
                    {booking.paymentCompleted && (
                      <div className="p-[12px] rounded-[14px] bg-green-50 border border-green-100">
                        <div className="flex items-center gap-[8px] text-[12px] text-green-700" style={{ fontWeight: 500 }}>
                          <Check className="w-[14px] h-[14px]" /> ชำระเงินเรียบร้อยแล้ว
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="vet-divider">ตรวจสุขภาพก่อนส่งกลับ</p>
                      <div className="vet-form-gap">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="vet-label">น้ำหนัก (กก.)</label>
                            <div className="relative">
                              <Stethoscope className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                              <input type="number" step="0.1" value={wt} onChange={e => setWt(e.target.value)} placeholder="เช่น 8.5" className="vet-input has-icon-left" />
                            </div>
                          </div>
                          <div>
                            <label className="vet-label">อุณหภูมิ (°F)</label>
                            <div className="relative">
                              <Thermometer className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                              <input type="number" step="0.1" value={tp} onChange={e => setTp(e.target.value)} placeholder="เช่น 101.3" className="vet-input has-icon-left" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="vet-label">สถานะสุขภาพ</label>
                          <div className="flex gap-[8px]" style={{ height: 40 }}>{healthButtons}</div>
                        </div>
                      </div>
                    </div>
                    <PhotoSection target="co" photos={coPhotos} label="📷 ภาพถ่ายสัตว์เลี้ยง (Check-out)" />
                    <div>
                      <p className="vet-divider">บันทึกส่งมอบ</p>
                      <div className="vet-form-gap">
                        <div>
                          <label className="vet-label">Handover Note</label>
                          <textarea value={ho} onChange={e => setHo(e.target.value)} rows={3} placeholder="คำแนะนำสำหรับเจ้าของ, สิ่งที่ต้องสังเกต..." className="vet-textarea" />
                        </div>
                      </div>
                    </div>
                  </>)}

                </div>
              </div>

              {/* ── Footer ── */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>
                  ยกเลิก
                </button>
                <button onClick={submit} disabled={!ok} className="vet-btn vet-btn-primary btn-green" style={{ width: 130 }}>
                  <Check className="w-[16px] h-[16px]" />
                  {s === "ฝากเลี้ยง" ? `ชำระ ฿${net.toLocaleString()}` : s === "ลงทะเบียน" ? "บันทึก Check-in" : s === "ชำระเงิน" ? "ยืนยัน Check-out" : "ยืนยัน"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
