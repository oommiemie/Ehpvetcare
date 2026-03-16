import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home, Search, Plus, Calendar, Clock, ChevronLeft, ChevronRight,
  LogIn, LogOut, DoorOpen, BedDouble, PawPrint, User, Phone, X, Check,
  MoreHorizontal, AlertTriangle, Utensils, Pill, Droplets, Heart,
  FileText, CreditCard, Star, Sparkles, Edit2, Trash2, ChevronDown,
  Bath, Stethoscope, Smartphone, Banknote, Thermometer,
  Camera, Printer,
} from "lucide-react";
import { PageMotion, PageItem, PagePanel } from "../components/PageMotion";
import { DatePickerModern } from "../components/DatePickerModern";
import { TimePickerModern } from "../components/TimePickerModern";
import { useSnackbar } from "../contexts/SnackbarContext";
import { getSpeciesAvatar } from "../components/petAvatars";
import { BoardingDetail } from "../components/BoardingDetail";
import crownSvgPaths from "../../imports/svg-lxtubw66mu";
import doorSvgPaths from "../../imports/svg-gw6jqem3sg";
import alertSvgPaths from "../../imports/svg-hzv7bc3cys";

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */
type BookingStatus = "จองฝากเลี้ยง" | "Check-in" | "กำลังฝากเลี้ยง" | "Check-out" | "ชำระเงิน" | "กลับบ้าน";

const STATUS_FLOW: BookingStatus[] = ["จองฝากเลี้ยง", "Check-in", "กำลังฝากเลี้ยง", "Check-out", "ชำระเงิน", "กลับบ้าน"];
const NEXT_STATUS_LABEL: Record<BookingStatus, string> = {
  "จองฝากเลี้ยง": "Check-in",
  "Check-in": "กำลังฝากเลี้ยง",
  "กำลังฝากเลี้ยง": "Check-out",
  "Check-out": "ชำระเงิน",
  "ชำระเงิน": "กลับบ้าน",
  "กลับบ้าน": "",
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

interface Room {
  id: string;
  type: string;
  status: "ว่าง" | "ไม่ว่าง" | "ซ่อมบำรุง";
  petName?: string;
  zone?: string;
  floor?: string;
  sizeSqm?: number;
  maxCapacity?: number;
  suitableFor?: string;
  pricePerNight?: number;
  longStayDiscount?: number;
  minDeposit?: number;
  amenities?: string[];
  photo?: string;
  notes?: string;
}

/* ═══════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════ */
const petPhotos = {
  dog1: "https://images.unsplash.com/photo-1734966213753-1b361564bab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  cat1: "https://images.unsplash.com/photo-1724286014482-ca026cf24420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  dog2: "https://images.unsplash.com/photo-1703368786305-4e1dcfcfd0db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  bird1: "https://images.unsplash.com/photo-1654181920354-5c4add3989a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  dog3: "https://images.unsplash.com/photo-1633717556731-b380ea2a79b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  dog4: "https://images.unsplash.com/photo-1676551494404-50bd1f48a155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
};

const initialBookings: Booking[] = [
  {
    id: 1, petName: "ไกด์ดี้", species: "สุนัข", breed: "Golden Retriever", ownerName: "คุณมิ้นท์ ทองดี",
    ownerPhone: "081-234-5678", photo: petPhotos.dog1, checkIn: "12 มี.ค.", checkOut: "18 มี.ค.",
    roomType: "ห้อง VIP", roomNumber: "A-01", status: "กำลังฝากเลี้ยง", services: ["ให้อาหารวันละ 3 มื้อ", "พาเดินเล่นเช้า-เย็น"],
    notes: "แพ้ไก่ ให้อาหารเนื้อวัว", dailyRate: 800, deposit: 1500, weight: "28", temperature: "38.5", healthStatus: "ปกติ", healthColor: "green", kennelCard: true,
    activities: [
      { id: 1, time: "08:00", type: "ให้อาหาร", detail: "อาหารเช้า — เนื้อวัวบด 200g", staff: "สมศรี" },
      { id: 2, time: "09:30", type: "พาเดินเล่น", detail: "เดินเล่นสนามหญ้า 30 นาที", staff: "สมศรี" },
      { id: 3, time: "12:00", type: "ให้อาหาร", detail: "อาหารกลางวัน", staff: "วิภา" },
    ],
  },
  {
    id: 2, petName: "ซาช่า", species: "แมว", breed: "Persian Cat", ownerName: "คุณมิ้นซ์ วิจารณ์",
    ownerPhone: "089-345-6789", photo: petPhotos.cat1, checkIn: "12 มี.ค.", checkOut: "15 มี.ค.",
    roomType: "ห้องแมว", roomNumber: "C-02", status: "Check-in", services: ["ให้อาหารวันละ 2 มื้อ"],
    notes: "", dailyRate: 500,
    activities: [],
  },
  {
    id: 3, petName: "ดีไล", species: "สุนัข", breed: "French Bulldog", ownerName: "คุณสมชาย รัตนโน",
    ownerPhone: "086-456-7890", photo: petPhotos.dog3, checkIn: "14 มี.ค.", checkOut: "20 มี.ค.",
    roomType: "ห้องธรรมดา", roomNumber: "D-04", status: "จองฝากเลี้ยง", services: ["ให้อาหารวันละ 2 มื้อ"],
    notes: "ตกใจเสียงง่าย", dailyRate: 400,
    activities: [],
  },
  {
    id: 4, petName: "เอ๋อเดลคอกเค่อร์", species: "สุนัข", breed: "Poodle", ownerName: "คุณมิ้นท์ เทพราช",
    ownerPhone: "081-567-8901", photo: petPhotos.dog2, checkIn: "10 มี.ค.", checkOut: "12 มี.ค.",
    roomType: "ห้องธรรมดา", roomNumber: "B-03", status: "Check-out", services: ["อาบน้ำก่อนกลับ"],
    notes: "", dailyRate: 400, deposit: 800, weight: "6.5", temperature: "38.2", healthStatus: "ปกติ", healthColor: "green", kennelCard: true,
    activities: [
      { id: 1, time: "07:30", type: "ให้อาหาร", detail: "อาหารเช้า", staff: "วิภา" },
      { id: 2, time: "10:00", type: "อาบน้ำ", detail: "อาบน้ำ + ตัดเล็บก่อนเช็คเอาท์", staff: "สมศรี" },
    ],
  },
  {
    id: 5, petName: "พริก", species: "สุนัข", breed: "Shiba Inu", ownerName: "คุณสรรพวิท นาคปัทม์",
    ownerPhone: "082-678-9012", photo: petPhotos.dog4, checkIn: "11 มี.ค.", checkOut: "16 มี.ค.",
    roomType: "กรงมาตรฐาน", roomNumber: "E-01", status: "กำลังฝากเลี้ยง", services: ["ให้อาหารวันละ 2 มื้อ"],
    notes: "", dailyRate: 350, deposit: 500, weight: "10.2", temperature: "38.8", healthStatus: "ปกติ", healthColor: "yellow", kennelCard: true,
    activities: [
      { id: 1, time: "08:00", type: "ให้อาหาร", detail: "อาหารเช้า — เม็ดสูตรสุนัข", staff: "วิภา" },
    ],
  },
];

const initialRooms: Room[] = [
  { id: "A-01", type: "ห้อง VIP", status: "ไม่ว่าง", petName: "ไกด์ดี้" },
  { id: "A-02", type: "ห้อง VIP", status: "ว่าง" },
  { id: "A-03", type: "ห้อง VIP", status: "ว่าง" },
  { id: "B-01", type: "ห้องธรรมดา", status: "ว่าง" },
  { id: "B-02", type: "ห้องธรรมดา", status: "ว่าง" },
  { id: "B-03", type: "ห้องธรรมดา", status: "ไม่ว่าง", petName: "เอ๋อเดลคอกเค่อร์" },
  { id: "C-01", type: "ห้องแมว", status: "ว่าง" },
  { id: "C-02", type: "ห้องแมว", status: "ไม่ว่าง", petName: "ซาช่า" },
  { id: "C-03", type: "ห้องแมว", status: "ว่าง" },
  { id: "D-01", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "D-02", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "D-03", type: "กรงมาตรฐาน", status: "ซ่อมบำรุง" },
  { id: "D-04", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "E-01", type: "กรงมาตรฐาน", status: "ไม่ว่าง", petName: "พริก" },
  { id: "E-02", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "E-03", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "F-01", type: "กรงนก/สัตว์เล็ก", status: "ว่าง" },
  { id: "F-02", type: "กรงนก/สัตว์เล็ก", status: "ว่าง" },
  { id: "F-03", type: "กรงนก/สัตว์เล็ก", status: "ว่าง" },
  { id: "F-04", type: "กรงนก/สัตว์เล็ก", status: "ว่าง" },
  { id: "G-01", type: "ห้อง VIP พิเศษ", status: "ว่าง" },
  { id: "G-02", type: "ห้อง VIP พิเศษ", status: "ว่าง" },
  { id: "H-01", type: "ห้องกักกัน", status: "ว่าง" },
  { id: "H-02", type: "ห้องกักกัน", status: "ว่าง" },
];

const petDB = [
  { name: "ไกด์ดี้", species: "สุนัข", breed: "Golden Retriever", owner: "คุณมิ้นท์ ทองดี", phone: "081-234-5678", photo: petPhotos.dog1 },
  { name: "ซาช่า", species: "แมว", breed: "Persian Cat", owner: "คุณมิ้นซ์ วิจารณ์", phone: "089-345-6789", photo: petPhotos.cat1 },
  { name: "ดีไล", species: "สุนัข", breed: "French Bulldog", owner: "คุณสมชาย รัตนโน", phone: "086-456-7890", photo: petPhotos.dog3 },
  { name: "เอ๋อเดลคอกเค่อร์", species: "สุนัข", breed: "Poodle", owner: "คุณมิ้นท์ เทพราช", phone: "081-567-8901", photo: petPhotos.dog2 },
  { name: "พริก", species: "สุนัข", breed: "Shiba Inu", owner: "คุณสรรพวิท นาคปัทม์", phone: "082-678-9012", photo: petPhotos.dog4 },
  { name: "มะลิ", species: "แมว", breed: "Scottish Fold", owner: "คุณปิยนุช สาธร", phone: "091-123-4567", photo: petPhotos.cat1 },
  { name: "โกลด์", species: "สุนัข", breed: "Golden Retriever", owner: "คุณวิชัย มงคล", phone: "084-567-1234", photo: petPhotos.dog1 },
];

const roomTypes = ["ห้อง VIP", "ห้อง VIP พิเศษ", "ห้องธรรมดา", "ห้องแมว", "กรงมาตรฐาน", "กรงนก/สัตว์เล็ก", "ห้องกักกัน"];
const extraServices = ["ให้อาหารวันละ 2 มื้อ", "ให้อาหารวันละ 3 มื้อ", "พาเดินเล่นเช้า-เย็น", "อาบน้ำก่อนกลับ", "ตัดเล็บ", "ให้ยาตามใบสั่งแพทย์", "ดูแลพิเศษ 24 ชม."];
const activityTypes = ["ให้อาหาร", "พาเดินเล่น", "อาบน้ำ", "ให้ยา", "ตรวจสุขภาพ", "ทำความสะอาดกรง", "อื่นๆ"];

/* ═══════════════════════════════════════════════════════
   Helper
   ═══════════════════════════════════════════════════════ */
const statusColor: Record<BookingStatus, { bg: string; text: string; dot: string; border: string }> = {
  "จองฝากเลี้ยง": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "#fbbf24" },
  "Check-in": { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400", border: "#2dd4bf" },
  "กำลังฝากเลี้ยง": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "#34d399" },
  "Check-out": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", border: "#60a5fa" },
  "ชำระเงิน": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400", border: "#a78bfa" },
  "กลับบ้าน": { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "#9ca3af" },
};

const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DAYS_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

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
  const [bookings, setBookings] = useState(initialBookings);
  const [rooms, setRooms] = useState(initialRooms);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ภาพรวม");
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showCheckinConfirm, setShowCheckinConfirm] = useState<Booking | null>(null);
  const [calMonth, setCalMonth] = useState(2); // March 0-indexed
  const [calYear, setCalYear] = useState(2026);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();

  const tabs = ["ภาพรวม", "การจอง", "ห้องพัก/กรง"];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Stats
  const stayingNow = bookings.filter(b => b.status === "กำลังฝากเลี้ยง").length;
  const checkInToday = bookings.filter(b => b.status === "Check-in").length;
  const checkOutToday = bookings.filter(b => b.status === "Check-out").length;
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === "ว่าง").length;
  const occupancyRate = Math.round(((totalRooms - availableRooms) / totalRooms) * 100);

  const filteredBookings = bookings.filter(b =>
    b.petName.includes(search) || b.ownerName.includes(search) || b.roomNumber.includes(search)
  );

  const upcomingBookings = bookings.filter(b => b.status !== "กลับบ้าน");

  // Advance status handler — moves booking to next step in flow
  const handleAdvanceStatus = (booking: Booking) => {
    const next = getNextStatus(booking.status);
    if (!next) return;

    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: next } : b));

    // Room management: mark room occupied on Check-in step, free on Check-out step
    if (booking.status === "จองฝากเลี้ยง") {
      // จองฝากเลี้ยง → Check-in: mark room occupied
      setRooms(prev => prev.map(r => r.id === booking.roomNumber ? { ...r, status: "ไม่ว่าง" as const, petName: booking.petName } : r));
    }
    if (booking.status === "Check-out") {
      // Check-out → ชำระเงิน: free the room
      setRooms(prev => prev.map(r => r.id === booking.roomNumber ? { ...r, status: "ว่าง" as const, petName: undefined } : r));
    }

    const msgs: Record<string, string> = {
      "จองฝากเลี้ยง": `Check-in ${booking.petName} เรียบร้อยแล้ว`,
      "Check-in": `${booking.petName} กำลังฝากเลี้ยง`,
      "กำลังฝากเลี้ยง": `Check-out ${booking.petName} เรียบร้อยแล้ว`,
      "Check-out": `ชำระเงิน ${booking.petName} เรียบร้อยแล้ว`,
      "ชำระเงิน": `${booking.petName} กลับบ้านแล้ว`,
    };
    showSnackbar("success", msgs[booking.status] || "อัปเดตสถานะแล้ว");
    setShowCheckinConfirm(null);
  };

  // Advance status with additional data from modal form
  const handleAdvanceWithData = (booking: Booking, data: Partial<Booking>) => {
    const next = getNextStatus(booking.status);
    if (!next) return;

    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, ...data, status: next } : b));

    if (booking.status === "จองฝากเลี้ยง") {
      setRooms(prev => prev.map(r => r.id === booking.roomNumber ? { ...r, status: "ไม่ว่าง" as const, petName: booking.petName } : r));
    }
    if (booking.status === "Check-out") {
      setRooms(prev => prev.map(r => r.id === booking.roomNumber ? { ...r, status: "ว่าง" as const, petName: undefined } : r));
    }

    const msgs: Record<string, string> = {
      "จองฝากเลี้ยง": `Check-in ${booking.petName} เรียบร้อยแล้ว — บันทึกข้อมูลสำเร็จ`,
      "Check-in": `${booking.petName} เริ่มฝากเลี้ยงแล้ว`,
      "กำลังฝากเลี้ยง": `Check-out ${booking.petName} เรียบร้อย — บันทึกข้อมูลสำเร็จ`,
      "Check-out": `ชำระเงิน ${booking.petName} เรียบร้อยแล้ว`,
      "ชำระเงิน": `${booking.petName} กลับบ้านแล้ว 🎉`,
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
          <div className="max-w-6xl mx-auto">
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
        </div>
      ) : (
      <>
      {/* ── Header ── */}
      <PageItem className="bg-white vet-border-b px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-gray-900" style={{ fontWeight: 700 }}>ระบบฝากเลี้ยง</h1>
              <p className="text-xs text-gray-400">จัดการห้องพัก / กรง และการจองฝากเลี้ยงสัตว์</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อสัตว์, เจ้าของ, ห้อง..."
                className="vet-search w-48 sm:w-64"
              />
            </div>
            <button
              onClick={() => setShowNewBooking(true)}
              className="flex items-center gap-1.5 text-white rounded-full active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">จองฝากเลี้ยง</span>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] p-1 inline-flex items-center overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const icons: Record<string, typeof Home> = {
                "ภาพรวม": Home,
                "การจอง": Calendar,
                "ห้องพัก/กรง": BedDouble,
              };
              const Icon = icons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-full whitespace-nowrap transition-all ${activeTab === tab ? "bg-[#19a589] text-white" : "text-[#6a7282] hover:text-gray-900 hover:bg-gray-100"}`}
                  style={{ fontWeight: activeTab === tab ? 500 : 400 }}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </PageItem>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto bg-[#FEFBF8] p-3 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === "ภาพรวม" && <OverviewTab
            key="overview"
            bookings={bookings}
            stayingNow={stayingNow}
            checkInToday={checkInToday}
            checkOutToday={checkOutToday}
            availableRooms={availableRooms}
            totalRooms={totalRooms}
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

          {activeTab === "การจอง" && <BookingsTab
            key="bookings"
            bookings={filteredBookings}
            onAdvance={(b) => setShowCheckinConfirm(b)}
            onAdvanceWithData={handleAdvanceWithData}
            onSelect={setSelectedBooking}
            onDelete={(id) => {
              setBookings(prev => prev.filter(b => b.id !== id));
              showSnackbar("delete", "ลบรายการจองแล้ว");
            }}
          />}

          {activeTab === "ห้องพัก/กรง" && <RoomsTab key="rooms" rooms={rooms} bookings={bookings} onAddRoom={(room) => {
            setRooms(prev => [...prev, room]);
            showSnackbar("success", `เพิ่มห้อง ${room.id} เรียบร้อยแล้ว`);
          }} />}


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

      <ConfirmModal
        open={!!showCheckinConfirm}
        title={`ยืนยันเปลี่ยนสถานะ → ${showCheckinConfirm ? NEXT_STATUS_LABEL[showCheckinConfirm.status] : ""}`}
        message={`ยืนยันเปลี่ยนสถานะ "${showCheckinConfirm?.petName}" จาก "${showCheckinConfirm?.status}" เป็น "${showCheckinConfirm ? NEXT_STATUS_LABEL[showCheckinConfirm.status] : ""}" หรือไม่?`}
        icon={<Check className="w-5 h-5 text-white" />}
        onConfirm={() => showCheckinConfirm && handleAdvanceStatus(showCheckinConfirm)}
        onClose={() => setShowCheckinConfirm(null)}
      />
      </>
      )}
    </PageMotion>
  );
}

/* ═══════════════════════════════════════════════════════
   Overview Tab
   ═══════════════════════════════════════════════════════ */
function OverviewTab({
  stayingNow, checkInToday, checkOutToday, availableRooms, totalRooms, occupancyRate,
  upcomingBookings, calMonth, calYear, setCalMonth, setCalYear, calendarDays, isToday, hasBookingOnDay,
  onAdvance, onSelect, menuOpen, setMenuOpen, menuRef, bookings,
}: {
  bookings: Booking[];
  stayingNow: number; checkInToday: number; checkOutToday: number;
  availableRooms: number; totalRooms: number; occupancyRate: number;
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
  const todayActivities = bookings.filter(b => b.status === "กำลังฝากเลี้ยง" || b.status === "Check-in" || b.status === "Check-out");

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Stats cards */}
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
          { label: "กำลังฝากเลี้ยง", value: stayingNow, sub: `+ ${checkInToday} รอ Check-in`, gradient: "linear-gradient(135deg, #e8802a, #d06a1a)", shadow: "0 4px 14px rgba(232,128,42,0.3)", icon: PawPrint, svgPath: "M19.9219 9.96094C19.9219 15.4492 15.459 19.9219 9.96094 19.9219C4.47266 19.9219 0 15.4492 0 9.96094C0 4.46289 4.47266 0 9.96094 0C15.459 0 19.9219 4.46289 19.9219 9.96094ZM8.28125 9.96094C8.1543 10.1953 8.03711 10.4395 7.90039 10.6641C7.69531 10.9668 7.42188 11.1816 7.14844 11.3965C6.65039 11.8164 6.12305 12.2656 6.12305 13.1348C6.12305 14.1699 6.80664 14.8926 7.83203 14.8926C8.33984 14.8926 8.70117 14.7656 9.05273 14.6387C9.3457 14.5312 9.61914 14.4531 9.95117 14.4531C10.2832 14.4531 10.5664 14.5312 10.8496 14.6387C11.2109 14.7656 11.5723 14.8926 12.0703 14.8926C13.0957 14.8926 13.7891 14.1699 13.7891 13.1348C13.7891 12.2656 13.2617 11.8164 12.7637 11.3965C12.4902 11.1816 12.2168 10.9668 12.0117 10.6738C11.8652 10.4492 11.748 10.1953 11.6309 9.96094C11.2695 9.16992 10.9863 8.44727 9.95117 8.44727C8.92578 8.44727 8.63281 9.17969 8.28125 9.96094ZM4.58008 9.19922C4.58008 10.2051 5.11719 10.9766 5.81055 10.9766C6.49414 10.9766 7.04102 10.2051 7.04102 9.19922C7.04102 8.18359 6.49414 7.40234 5.81055 7.40234C5.11719 7.40234 4.58008 8.18359 4.58008 9.19922ZM12.8711 9.19922C12.8711 10.2051 13.418 10.9766 14.1016 10.9766C14.7852 10.9766 15.3223 10.2051 15.3223 9.19922C15.3223 8.18359 14.7852 7.40234 14.1016 7.40234C13.418 7.40234 12.8711 8.18359 12.8711 9.19922ZM7.06055 6.24023C7.06055 7.24609 7.60742 8.03711 8.29102 8.03711C8.98438 8.03711 9.52148 7.24609 9.52148 6.24023C9.52148 5.24414 8.98438 4.47266 8.29102 4.47266C7.60742 4.47266 7.06055 5.23438 7.06055 6.24023ZM10.3906 6.24023C10.3906 7.24609 10.9277 8.03711 11.6113 8.03711C12.3047 8.03711 12.8516 7.24609 12.8516 6.24023C12.8516 5.23438 12.3047 4.47266 11.6113 4.47266C10.9277 4.47266 10.3906 5.24414 10.3906 6.24023Z" },
          { label: "รอ Check-in", value: checkInToday, sub: `เหลือ ${checkInToday} รายการ`, gradient: "linear-gradient(135deg, #19a589, #0d7c66)", shadow: "0 4px 14px rgba(25,165,137,0.3)", icon: LogIn, svgPath: "M19.9219 9.96094C19.9219 15.4492 15.459 19.9219 9.96094 19.9219C4.47266 19.9219 0 15.4492 0 9.96094C0 4.46289 4.47266 0 9.96094 0C15.459 0 19.9219 4.46289 19.9219 9.96094ZM8.35938 6.04492L5.15625 9.36523C4.95117 9.57031 4.88281 9.73633 4.88281 9.95117C4.88281 10.1562 4.95117 10.332 5.15625 10.5371L8.35938 13.8574C8.50586 14.0137 8.67188 14.0918 8.88672 14.0918C9.29688 14.0918 9.59961 13.7891 9.59961 13.3691C9.59961 13.1738 9.52148 12.9492 9.35547 12.8125L7.72461 11.2793L7.10925 10.7021L8.44727 10.752L14.2578 10.752C14.6875 10.752 15.0488 10.3906 15.0488 9.95117C15.0488 9.51172 14.6875 9.14062 14.2578 9.14062L8.44727 9.15039L7.10925 9.20021L7.72461 8.62305L9.35547 7.08984C9.52148 6.95312 9.59961 6.73828 9.59961 6.54297C9.59961 6.12305 9.29688 5.81055 8.88672 5.81055C8.67188 5.81055 8.50586 5.88867 8.35938 6.04492Z" },
          { label: "รอ Check-out", value: checkOutToday, sub: "ครบตามกำหนด", gradient: "linear-gradient(135deg, #3b82f6, #2563eb)", shadow: "0 4px 14px rgba(59,130,246,0.3)", icon: LogOut, svgPath: "M19.9219 9.96094C19.9219 15.4492 15.459 19.9219 9.96094 19.9219C4.47266 19.9219 0 15.4492 0 9.96094C0 4.46289 4.47266 0 9.96094 0C15.459 0 19.9219 4.46289 19.9219 9.96094ZM10.3418 6.54297C10.3418 6.73828 10.4102 6.95312 10.5859 7.08984L12.207 8.62305L12.8221 9.19994L11.4844 9.15039L5.67383 9.14062C5.24414 9.14062 4.88281 9.51172 4.88281 9.95117C4.88281 10.3906 5.24414 10.752 5.67383 10.752L11.4844 10.752L12.8221 10.7024L12.207 11.2793L10.5859 12.8125C10.4102 12.9492 10.3418 13.1738 10.3418 13.3691C10.3418 13.7891 10.6348 14.0918 11.0449 14.0918C11.2598 14.0918 11.4258 14.0137 11.5723 13.8574L14.7754 10.5371C14.9805 10.332 15.0488 10.1562 15.0488 9.95117C15.0488 9.73633 14.9805 9.57031 14.7754 9.36523L11.5723 6.04492C11.4258 5.88867 11.2598 5.81055 11.0449 5.81055C10.6348 5.81055 10.3418 6.12305 10.3418 6.54297Z" },
          { label: "ห้องว่าง / ทั้งหมด", value: `${availableRooms}`, sub: `อัตราครองห้อง ${occupancyRate}%`, gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", shadow: "0 4px 14px rgba(139,92,246,0.3)", icon: BedDouble, extra: `/${totalRooms}`, svgPath: "M19.9219 9.96094C19.9219 15.4492 15.459 19.9219 9.96094 19.9219C4.47266 19.9219 0 15.4492 0 9.96094C0 4.46289 4.47266 0 9.96094 0C15.459 0 19.9219 4.46289 19.9219 9.96094ZM9.64844 6.03516L5.2832 9.69727L5.2832 13.8965C5.2832 14.6191 5.73242 15.0586 6.47461 15.0586L13.457 15.0586C14.1992 15.0586 14.6484 14.6191 14.6484 13.8965L14.6484 9.70703L10.2832 6.03516C10.0781 5.85938 9.85352 5.86914 9.64844 6.03516ZM11.3281 10.8008L11.3281 14.043L8.60352 14.043L8.60352 10.8008C8.60352 10.5664 8.75977 10.4004 9.00391 10.4004L10.9277 10.4004C11.1914 10.4004 11.3281 10.5664 11.3281 10.8008ZM9.24805 4.18945L3.76953 8.7793C3.65234 8.88672 3.60352 9.02344 3.60352 9.15039C3.60352 9.38477 3.7793 9.61914 4.08203 9.61914C4.24805 9.61914 4.36523 9.52148 4.48242 9.42383L9.72656 5.0293C9.89258 4.88281 10.0488 4.90234 10.2051 5.0293L15.4395 9.42383C15.5762 9.52148 15.6934 9.61914 15.8496 9.61914C16.1133 9.61914 16.3281 9.43359 16.3281 9.16992C16.3281 9.00391 16.2793 8.88672 16.1621 8.7793L14.6484 7.51953L14.6484 5.41992C14.6484 5.19531 14.4922 5.03906 14.2676 5.03906L13.7012 5.03906C13.4668 5.03906 13.3105 5.19531 13.3105 5.41992L13.3105 6.39648L10.6836 4.18945C10.2539 3.81836 9.6875 3.81836 9.24805 4.18945Z" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            variants={{ hidden: { opacity: 0, y: 28, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-4 relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
            style={{ background: s.gradient, boxShadow: s.shadow }}
          >
            {/* Decorative radial glows */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />

            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                  <svg viewBox="0 0 20.2832 19.9316" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d={s.svgPath} fill="rgba(255,255,255,0.9)" />
                  </svg>
                </div>
                {s.sub && (
                  <span className="text-[11px] text-white/90 px-2.5 py-1 rounded-full" style={{ fontWeight: 600, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}>
                    {s.sub}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-white/60 mb-1" style={{ fontWeight: 500, letterSpacing: "0.02em" }}>{s.label}</div>
              <div className="flex items-end gap-0.5">
                <span className="text-[26px] text-white" style={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</span>
                {s.extra && <span className="text-sm text-white/50 pb-0.5" style={{ fontWeight: 600 }}>{s.extra}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Alert banner */}
      {checkOutToday > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-orange-200 bg-orange-50/70">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <p className="text-xs text-orange-700 leading-relaxed">
            <span style={{ fontWeight: 600 }}>เอ๋อเดลคอกเค่อร์</span> (ห้อง B-03) ถึงกำหนดเช็คเอาท์วันนี้ เวลา 14:00 น.
          </p>
          <button className="ml-auto text-xs text-orange-600 whitespace-nowrap" style={{ fontWeight: 500 }}>ดูรายละเอียด →</button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* Upcoming bookings table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 vet-border-b">
              <div>
                <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>การจองที่ใกล้จะมาถึง</h3>
                <p className="text-xs text-gray-400 mt-0.5">{upcomingBookings.length} รายการ</p>
              </div>
              <button className="text-xs text-[#19a589]" style={{ fontWeight: 500 }}>ดูทั้งหมด →</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-xs text-gray-500">
                    <th className="text-left px-5 py-3" style={{ fontWeight: 600 }}>ชื่อ / เบื้อง</th>
                    <th className="text-left px-4 py-3" style={{ fontWeight: 600 }}>เจ้าของ</th>
                    <th className="text-left px-4 py-3" style={{ fontWeight: 600 }}>เข้า – ออก</th>
                    <th className="text-left px-4 py-3" style={{ fontWeight: 600 }}>ห้อง</th>
                    <th className="text-left px-4 py-3" style={{ fontWeight: 600 }}>สถานะ</th>
                    <th className="text-center px-4 py-3" style={{ fontWeight: 600 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBookings.map((b, idx) => {
                    const sc = statusColor[b.status];
                    return (
                      <motion.tr
                        key={b.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => onSelect(b)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={b.photo} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                            <div>
                              <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{b.petName}</p>
                              <p className="text-xs text-gray-400">{b.breed} · {b.species}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{b.ownerName}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{b.checkIn} – {b.checkOut}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{b.roomNumber}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${sc.bg} ${sc.text}`} style={{ fontWeight: 500 }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block" ref={menuOpen === b.id ? menuRef : undefined}>
                            <button
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
                              onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === b.id ? null : b.id); }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {menuOpen === b.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                                >
                                  {b.status !== "กลับบ้าน" && (
                                    <button onClick={() => { onAdvance(b); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50">
                                      <ChevronRight className="w-3.5 h-3.5" /> {NEXT_STATUS_LABEL[b.status]}
                                    </button>
                                  )}
                                  <button onClick={() => { onSelect(b); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                                    <FileText className="w-3.5 h-3.5" /> ดูรายละเอียด
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full xl:w-[320px] flex-shrink-0 space-y-4">
          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
                {THAI_MONTHS[calMonth]} {calYear + 543}
              </h4>
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
                <div key={i} className="py-1">
                  {d ? (
                    <button className={`w-8 h-8 rounded-full text-xs transition-all relative ${
                      isToday(d)
                        ? "text-white"
                        : hasBookingOnDay(d)
                        ? "text-orange-700 hover:bg-orange-50"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={isToday(d) ? { background: "linear-gradient(135deg, #e8802a, #d06a1a)", fontWeight: 700 } : { fontWeight: hasBookingOnDay(d) ? 600 : 400 }}
                    >
                      {d}
                      {hasBookingOnDay(d) && !isToday(d) && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
                      )}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Today's activities */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 vet-border-b">
              <h4 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>กิจกรรมวันนี้</h4>
              <span className="text-xs text-gray-400">12 มี.ค.</span>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              {todayActivities.map(b => (
                <div key={b.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusColor[b.status]?.dot || "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>
                      {b.petName} — {b.status}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      ห้อง {b.roomNumber}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[b.status]?.bg || "bg-gray-100"} ${statusColor[b.status]?.text || "text-gray-600"}`} style={{ fontWeight: 500 }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
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
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${statusFilter === s ? "bg-[#19a589] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"}`}
            style={{ fontWeight: statusFilter === s ? 600 : 400 }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((b, idx) => {
          const sc = statusColor[b.status];
          const statusIdx = STATUS_FLOW.indexOf(b.status);

          /* ── สี/ไอคอน/label เฉพาะสถานะ ── */
          const actionConfig: Record<BookingStatus, { label: string; icon: typeof LogIn; gradient: string; shadow: string; needsDetail: boolean }> = {
            "จองฝากเลี้ยง": { label: "รับ Check-in", icon: LogIn, gradient: "linear-gradient(135deg,#2dd4bf,#0d9488)", shadow: "0 2px 8px rgba(13,148,136,0.3)", needsDetail: true },
            "Check-in":      { label: "เริ่มฝากเลี้ยง", icon: PawPrint, gradient: "linear-gradient(135deg,#19a589,#0d7c66)", shadow: "0 2px 8px rgba(25,165,137,0.3)", needsDetail: false },
            "กำลังฝากเลี้ยง": { label: "Check-out", icon: LogOut, gradient: "linear-gradient(135deg,#3b82f6,#2563eb)", shadow: "0 2px 8px rgba(59,130,246,0.3)", needsDetail: true },
            "Check-out":     { label: "ชำระเงิน", icon: CreditCard, gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", shadow: "0 2px 8px rgba(139,92,246,0.3)", needsDetail: true },
            "ชำระเงิน":     { label: "ยืนยันกลับบ้าน", icon: Home, gradient: "linear-gradient(135deg,#6b7280,#4b5563)", shadow: "0 2px 8px rgba(75,85,99,0.3)", needsDetail: false },
            "กลับบ้าน":     { label: "", icon: Check, gradient: "", shadow: "", needsDetail: false },
          };
          const ac = actionConfig[b.status];

          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onSelect(b)}
            >
              <div className="flex flex-col">
                {/* ── Gradient Banner (Financial-style) ── */}
                <div className={`relative h-24 bg-gradient-to-br flex-shrink-0 ${
                  b.status === "จองฝากเลี้ยง" ? "from-amber-200/60 to-amber-50"
                  : b.status === "Check-in" ? "from-teal-200/60 to-teal-50"
                  : b.status === "กำลังฝากเลี้ยง" ? "from-emerald-200/60 to-emerald-50"
                  : b.status === "Check-out" ? "from-blue-200/60 to-blue-50"
                  : b.status === "ชำระเงิน" ? "from-purple-200/60 to-purple-50"
                  : "from-gray-200/60 to-gray-50"
                }`}>
                  <span className={`absolute top-3 right-3 flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`} style={{ fontWeight: 500 }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.border, boxShadow: `0 0 5px ${sc.border}80` }} />
                    {b.status}
                  </span>
                  <span className="absolute top-3 left-3 text-[10px] text-gray-400 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                    {statusIdx + 1}/{STATUS_FLOW.length}
                  </span>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white ring-4 ring-white overflow-hidden shadow-md">
                    <img src={b.photo} alt={b.petName} className="w-full h-full object-cover" />
                    {b.status === "กำลังฝากเลี้ยง" && b.healthColor && (
                      <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        b.healthColor === "green" ? "bg-green-500" : b.healthColor === "yellow" ? "bg-yellow-500" : "bg-red-500"
                      }`} style={{ boxShadow: b.healthColor === "green" ? "0 0 6px rgba(34,197,94,0.5)" : b.healthColor === "yellow" ? "0 0 6px rgba(234,179,8,0.5)" : "0 0 6px rgba(239,68,68,0.5)" }} />
                    )}
                  </div>
                </div>

                {/* ── Body (centered like Financial) ── */}
                <div className="flex-1 flex flex-col items-center px-4 pt-10 pb-4 text-center">
                  <span className="text-gray-900" style={{ fontWeight: 700 }}>{b.petName}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{b.breed} · {b.species}</span>

                  {/* Progress bar */}
                  

                  {/* Info rows (Financial-style) */}
                  <div className="w-full mt-4 space-y-2">
                    {[
                      { icon: User, label: "เจ้าของ", value: b.ownerName },
                      { icon: Calendar, label: "เข้า-ออก", value: `${b.checkIn} → ${b.checkOut}` },
                      { icon: BedDouble, label: "ห้อง", value: `${b.roomType} (${b.roomNumber})` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <item.icon className="w-3 h-3" style={{ color: "#19a589" }} />
                          <span className="text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-gray-700 truncate ml-2" style={{ fontWeight: 500 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* ── Status-specific info ── */}
                  {b.status === "กำลังฝากเลี้ยง" && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                      {b.healthColor && (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] border ${
                          b.healthColor === "green" ? "bg-green-50 border-green-200 text-green-700"
                          : b.healthColor === "yellow" ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                          : "bg-red-50 border-red-200 text-red-700"
                        }`} style={{ fontWeight: 500 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.healthColor === "green" ? "bg-green-500" : b.healthColor === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
                          {b.healthColor === "green" ? "ปกติ" : b.healthColor === "yellow" ? "สังเกต" : "ดูแลพิเศษ"}
                        </span>
                      )}
                      {b.weight && <span className="text-[10px] text-gray-400">{b.weight} กก.</span>}
                      {b.temperature && <span className="text-[10px] text-gray-400">{b.temperature}°C</span>}
                      {b.deposit && b.deposit > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[#19a589]/8 text-[#19a589] border border-[#19a589]/12" style={{ fontWeight: 500 }}>
                          มัดจำ ฿{b.deposit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                  {b.status === "Check-out" && b.deposit && b.deposit > 0 && (
                    <div className="flex items-center gap-2 mt-3 justify-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-600 border border-blue-200" style={{ fontWeight: 500 }}>คืนมัดจำ ฿{b.deposit.toLocaleString()}</span>
                    </div>
                  )}
                  {b.status === "ชำระเงิน" && (
                    <div className="flex items-center gap-2 mt-3 justify-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] bg-purple-50 text-purple-700 border border-purple-200" style={{ fontWeight: 600 }}>
                        <CreditCard className="w-3 h-3" /> ยอดประมาณ ฿{((b.dailyRate * 6) + (b.services.length * 200)).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {b.status === "กลับบ้าน" && (
                    <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 justify-center">
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[11px] text-gray-500" style={{ fontWeight: 500 }}>เสร็จสิ้นกระบวนการฝากเลี้ยง</span>
                    </div>
                  )}

                  {/* Services tags */}
                  {b.services.length > 0 && b.status !== "กลับบ้าน" && (
                    <div className="flex flex-wrap gap-1 mt-3 justify-center">
                      {b.services.slice(0, 2).map(s => (
                        <span key={s} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] border" style={{ fontWeight: 500, color: "#0d7c66", background: "rgba(25,165,137,0.05)", borderColor: "rgba(25,165,137,0.12)" }}>
                          <Sparkles className="w-2 h-2" />{s}
                        </span>
                      ))}
                      {b.services.length > 2 && <span className="text-[9px] text-gray-400 px-1 py-0.5">+{b.services.length - 2} เพิ่มเติม</span>}
                    </div>
                  )}
                </div>

                {/* ── Action footer (Financial-style) ── */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 group-hover:bg-[#19a589]/5 transition-colors">
                  <div className="flex items-center gap-2">
                    {b.status !== "กลับบ้าน" && (() => {
                      const ActionIcon = ac.icon;
                      return (
                        <button onClick={(e) => { e.stopPropagation(); if (b.status === "Check-in") { onSelect(b); } else { setTransitionBooking(b); } }}
                          className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full text-white transition-all hover:shadow-md active:scale-[0.97]"
                          style={{ fontWeight: 600, background: ac.gradient, boxShadow: ac.shadow }}>
                          <ActionIcon className="w-3.5 h-3.5" /> {ac.label}
                        </button>
                      );
                    })()}
                    {b.status !== "กลับบ้าน" && !ac.needsDetail && (
                      <button onClick={(e) => { e.stopPropagation(); onSelect(b); }}
                        className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all active:scale-[0.97]" style={{ fontWeight: 500 }}>
                        <FileText className="w-3 h-3" /> รายละเอียด
                      </button>
                    )}
                    {b.status === "กลับบ้าน" && (
                      <button onClick={(e) => { e.stopPropagation(); onSelect(b); }}
                        className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all active:scale-[0.97]" style={{ fontWeight: 500 }}>
                        <FileText className="w-3 h-3" /> ดูประวัติ
                      </button>
                    )}
                  </div>
                  {b.status === "จองฝากเลี้ยง" && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
                      className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-[0.97]" style={{ fontWeight: 500 }}>
                      <Trash2 className="w-3 h-3" /> ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
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
function RoomsTab({ rooms, bookings, onAddRoom }: { rooms: Room[]; bookings: Booking[]; onAddRoom: (room: Room) => void }) {
  const [typeFilter, setTypeFilter] = useState("ทั้งหมด");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showNewRoom, setShowNewRoom] = useState(false);
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
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap items-center">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${typeFilter === t ? "bg-[#19a589] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"}`}
            style={{ fontWeight: typeFilter === t ? 600 : 400 }}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => setShowNewRoom(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-white rounded-full active:scale-95 transition-all ml-auto flex-shrink-0"
          style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 4px 14px rgba(232,128,42,0.28)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          เพิ่มห้องพัก
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((r, idx) => {
          const isFree = r.status === "ว่าง";
          const isOccupied = r.status === "ไม่ว่าง";
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => setSelectedRoom(r)}
              className="relative bg-white rounded-[16px] cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <div className="flex flex-col items-start overflow-clip p-[4px] rounded-[inherit]">
                {/* ── Top Section (colored background) ── */}
                <div className="relative rounded-[12px] shrink-0 w-full" style={{
                  backgroundImage: isFree
                    ? "linear-gradient(139.123deg, rgba(172,255,238,0.2) 0%, rgba(220,255,248,0.2) 100%), linear-gradient(90deg, #fff 0%, #fff 100%)"
                    : isOccupied
                    ? "linear-gradient(148.782deg, #ffecd5 6.17%, #fff8f0 93.83%), linear-gradient(90deg, #fff 0%, #fff 100%)"
                    : "linear-gradient(148.782deg, #e6e6e6 6.17%, #f5f5f5 93.83%), linear-gradient(90deg, #fff 0%, #fff 100%)",
                }}>
                  <div className="flex flex-col items-center gap-[8px] px-[14px] py-[12px]">
                    {/* Icon */}
                    <div className="flex items-center justify-center rounded-[14px] size-[40px]" style={{
                      backgroundImage: isFree
                        ? "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)"
                        : isOccupied
                        ? "linear-gradient(135deg, #e8802a 0%, #d06a1a 100%)"
                        : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                    }}>
                      {(() => {
                        const isVip = r.type.includes("VIP");
                        const isMaint = r.status === "ซ่อมบำรุง";
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
                    {/* Room ID */}
                    <p className="text-[14px] text-black text-center tracking-[0.28px]" style={{ fontWeight: 700 }}>{r.id}</p>
                    {/* Room type */}
                    <p className="text-[10px] text-[#99a1af] text-center" style={{ fontWeight: 500 }}>{r.type}</p>
                    {/* Status badge */}
                    <div className="bg-[rgba(255,255,255,0.9)] h-[23px] relative rounded-full shrink-0 flex items-center justify-center gap-[6px] px-[12px]">
                      <span className="w-[6px] h-[6px] rounded-full" style={{
                        background: isFree ? "#34d399" : isOccupied ? "#fb923c" : "#9ca3af",
                        boxShadow: isFree ? "0 0 4px rgba(52,211,153,0.6)" : isOccupied ? "0 0 4px rgba(251,146,60,0.5)" : "none",
                      }} />
                      <span className="text-[10px]" style={{
                        fontWeight: 600,
                        color: isFree ? "#059669" : isOccupied ? "#c2410c" : "#6b7280",
                      }}>{r.status}</span>
                    </div>
                  </div>
                </div>

                {/* ── Bottom Section (pet info or empty) ── */}
                <div className="h-[60px] w-full flex items-center px-[12px]">
                  {isOccupied && r.petName ? (() => {
                    const linkedBooking = bookings.find(b => b.roomNumber === r.id && (b.status === "Check-in" || b.status === "กำลังฝากเลี้ยง" || b.status === "Check-out"));
                    return (
                      <div className="flex items-center gap-[8px]">
                        <div className="relative rounded-full shrink-0 size-[36px] overflow-hidden border-[2px] border-white shadow-sm">
                          {linkedBooking?.photo ? (
                            <img src={linkedBooking.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                              <PawPrint className="w-4 h-4 text-orange-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-[#1e2939] truncate" style={{ fontWeight: 600 }}>{r.petName}</p>
                          {linkedBooking && (
                            <p className="text-[10px] text-[#99a1af]" style={{ fontWeight: 400 }}>{linkedBooking.checkIn} – {linkedBooking.checkOut}</p>
                          )}
                        </div>
                      </div>
                    );
                  })() : (
                    <p className="text-[10px] text-[#99a1af]" style={{ fontWeight: 400 }}>
                      {r.status === "ซ่อมบำรุง" ? "กำลังซ่อมบำรุงห้องพักสัตว์เลี้ยง" : "ยังไม่มีสัตว์เข้ารับฝากเลี้ยง"}
                    </p>
                  )}
                </div>
              </div>
              {/* Border overlay */}
              <div aria-hidden="true" className="absolute border-[1.266px] border-solid border-[#e5e7eb] inset-0 pointer-events-none rounded-[16px]" />
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
          const linkedBooking = isOccupied ? bookings.find(b => b.roomNumber === room.id && (b.status === "Check-in" || b.status === "กำลังฝากเลี้ยง" || b.status === "Check-out")) : null;

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
                      style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                    <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                      style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
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
                              ? "linear-gradient(135deg, rgba(25,165,137,0.12), rgba(52,211,153,0.08))"
                              : isOccupied
                              ? "linear-gradient(135deg, rgba(232,128,42,0.12), rgba(251,146,60,0.08))"
                              : "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(0,0,0,0.03))",
                          }}>
                            {(() => {
                              const isVip = room.type.includes("VIP");
                              const iconColor = isFree ? "#19a589" : isOccupied ? "#e8802a" : "#9ca3af";
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
                            <p className="text-xs text-[#19a589]" style={{ fontWeight: 700 }}>{rate.toLocaleString()} บาท/คืน</p>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <p className="vet-divider">สิ่งอำนวยความสะดวก</p>
                        <div className="flex flex-wrap gap-1.5">
                          {features.map(f => (
                            <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[#19a589]/5 text-[#0d7c66] border border-[#19a589]/10" style={{ fontWeight: 500 }}>
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

      {/* New Room Modal */}
      <NewRoomModal
        open={showNewRoom}
        onClose={() => setShowNewRoom(false)}
        onSave={(room) => { onAddRoom(room); setShowNewRoom(false); }}
        existingRoomIds={rooms.map(r => r.id)}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   New Room Modal
   ═══════════════════════════════════════════════════════ */
const roomStatusOptions = ["ว่าง", "ซ่อมบำรุง"] as const;
const suitableForOptions = ["สุนัขขนาดเล็ก", "สุนัขขนาดกลาง", "สุนัขขนาดใหญ่", "แมว", "นก/สัตว์เล็ก", "สัตว์ทุกชนิด"];
const amenityOptions = ["แอร์", "พัดลม", "กล้องวงจรปิด", "เตียงนุ่ม", "เตียงพรีเมียม", "พื้นที่กว้าง", "พื้นที่กว้างพิเศษ", "สระว่ายน้ำ", "คอนโดแมว", "ที่ลับเล็บ", "ของเล่น", "คอนไม้", "กระดิ่ง", "ถาดอาหาร", "ถาดน้ำ", "ผ้ารองนอน", "ระบบกรองอากาศ", "แยกพื้นที่"];

function NewRoomModal({ open, onClose, onSave, existingRoomIds }: {
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
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
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
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${amenities.includes(a) ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
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
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Pet selector */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {bookings.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedPet(b.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 whitespace-nowrap transition-all ${selectedPet === b.id ? "border-[#19a589] bg-[#19a589]/5" : "border-gray-200 bg-white hover:border-gray-300"}`}
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
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full text-white"
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#19a589] to-[#0d7c66] flex items-center justify-center">
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
      transition={{ duration: 0.25 }}
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
                      <span className="text-sm text-[#19a589]" style={{ fontWeight: 700 }}>{total.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${sc.bg} ${sc.text}`} style={{ fontWeight: 500 }}>
                        {b.status === "กลับบ้าน" ? "ชำระแล้ว" : "รอชำระ"}
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
          <span className="text-lg text-[#19a589]" style={{ fontWeight: 700 }}>
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

  const petResults = petSearch ? petDB.filter(p => p.name.includes(petSearch) || p.owner.includes(petSearch)) : petDB;
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
      status: "จองฝากเลี้ยง",
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
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
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
                                  <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{p.name}</p>
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
                                className={`px-3 py-2 text-xs rounded-xl border-2 transition-all ${selectedRoom === r.id ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
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
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${services.includes(s) ? "border-[#19a589] bg-[#19a589]/5 text-[#19a589]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
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
                  style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.3)" }}>
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
  "จองฝากเลี้ยง": { title: "Check-in — บันทึกข้อมูลรับฝาก", sub: "กรอกข้อมูลสุขภาพและมัดจำ", icon: LogIn },
  "Check-in":      { title: "Check-in — บันทึกข้อมูลฝากเลี้ยง", sub: "บันทึกสุขภาพ, จัดสรรกรง, รับมัดจำ", icon: LogIn },
  "กำลังฝากเลี้ยง": { title: "Check-out — บันทึกก่อนออก", sub: "ตรวจสุขภาพก่อนส่งคืน", icon: LogOut },
  "Check-out":     { title: "ชำระเงิน", sub: "สรุปค่าใช้จ่ายและเลือกวิธีชำระ", icon: CreditCard },
  "ชำระเงิน":     { title: "ยืนยันกลับบ้าน", sub: "บันทึกส่งมอบและปิดรายการ", icon: Home },
  "กลับบ้าน":     { title: "", sub: "", icon: Check },
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
    setWt(booking.weight || ""); setTp(booking.temperature || "38.5");
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
    if (s === "จองฝากเลี้ยง") d = { weight: wt, temperature: tp, healthStatus: hs, healthColor: HC_MAP[hs], deposit: dp, checkInTime: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }), checkinPhotos: ciPhotos.length > 0 ? ciPhotos : undefined };
    else if (s === "Check-in") d = {};
    else if (s === "กำลังฝากเลี้ยง") d = { weight: wt, temperature: tp, healthStatus: hs, healthColor: HC_MAP[hs], checkOutTime: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }), handoverNote: nt, checkoutPhotos: coPhotos.length > 0 ? coPhotos : undefined };
    else if (s === "Check-out") d = { paymentMethod: pm, paymentCompleted: true };
    else if (s === "ชำระเงิน") d = { handoverNote: ho };
    onSubmit(d);
  };

  const ok = s === "จองฝากเลี้ยง" ? wt.trim() !== "" && tp.trim() !== "" : true;

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
              className="w-[72px] h-[72px] rounded-[12px] border-2 border-dashed border-gray-200 hover:border-[#19a589]/40 bg-gray-50/50 hover:bg-[#19a589]/5 flex flex-col items-center justify-center gap-[4px] transition-all">
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
            transition={{ duration: 0.2 }}
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
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
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
                  {s === "จองฝากเลี้ยง" && (<>
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
                            <label className="vet-label">อุณหภูมิ (°C) <span className="required">*</span></label>
                            <div className="relative">
                              <Thermometer className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                              <input type="number" step="0.1" value={tp} onChange={e => setTp(e.target.value)} placeholder="เช่น 38.5" className="vet-input has-icon-left" />
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
                                dp === d ? "bg-[#19a589]/10 border-[#19a589]/30 text-[#0d7c66]" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
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

                  {/* ═══ กำลังฝากเลี้ยง → Check-out ═══ */}
                  {s === "กำลังฝากเลี้ยง" && (<>
                    <div>
                      <p className="vet-divider">ตรวจสุขภาพก่อนออก</p>
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
                            <label className="vet-label">อุณหภูมิ (°C)</label>
                            <div className="relative">
                              <Thermometer className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                              <input type="number" step="0.1" value={tp} onChange={e => setTp(e.target.value)} placeholder="เช่น 38.5" className="vet-input has-icon-left" />
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
                      <p className="vet-divider">หมายเหตุ</p>
                      <div className="vet-form-gap">
                        <div>
                          <label className="vet-label">บันทึกสภาพ/หมายเหตุ</label>
                          <textarea value={nt} onChange={e => setNt(e.target.value)} rows={2} placeholder="บันทึกสภาพสัตว์เลี้ยงก่อนส่งคืน..." className="vet-textarea" />
                        </div>
                      </div>
                    </div>
                    <PhotoSection target="co" photos={coPhotos} label="📷 ภาพถ่ายสัตว์เลี้ยง (Check-out)" />
                  </>)}

                  {/* ═══ Check-out → ชำระเงิน ═══ */}
                  {s === "Check-out" && (<>
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
                              <span className={r.hi ? "text-[#19a589]" : "text-gray-700"} style={{ fontWeight: 600 }}>{r.v}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between px-[14px] py-[12px] border-t border-[#19a589]/10" style={{ background: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 50%, #f3faf8 100%)" }}>
                            <span className="text-[13px] text-[#0d7c66]" style={{ fontWeight: 700 }}>ยอดชำระสุทธิ</span>
                            <span className="text-[16px] text-[#0d7c66]" style={{ fontWeight: 700 }}>฿{net.toLocaleString()}</span>
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
                                  active ? "bg-[#19a589]/10 border-[#19a589]/30 text-[#0d7c66]" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                }`} style={{ fontWeight: active ? 600 : 400 }}>
                                <PMIcon className="w-[16px] h-[16px]" /> {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>)}

                  {/* ═══ ชำระเงิน → กลับบ้าน ═══ */}
                  {s === "ชำระเงิน" && (<>
                    <div className="text-center py-[8px]">
                      <div className="vet-modal-header-icon mx-auto mb-[16px]" style={{ width: 56, height: 56, borderRadius: 16 }}>
                        <Home className="w-[24px] h-[24px] text-white" />
                      </div>
                      <h3 className="vet-section-title mb-[4px]">ยืนยันส่ง "{booking.petName}" กลับบ้าน</h3>
                      <p className="vet-tiny">การชำระเงินเสร็จสิ้น — พร้อมส่งคืนเจ้าของ</p>
                    </div>

                    {booking.paymentCompleted && (
                      <div className="p-[12px] rounded-[14px] bg-green-50 border border-green-100">
                        <div className="flex items-center gap-[8px] text-[12px] text-green-700" style={{ fontWeight: 500 }}>
                          <Check className="w-[14px] h-[14px]" /> ชำระเงินเรียบร้อยแล้ว
                        </div>
                      </div>
                    )}

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
                <button onClick={submit} disabled={!ok} className="vet-btn vet-btn-primary btn-green" style={{ width: 110 }}>
                  <Check className="w-[16px] h-[16px]" />
                  {s === "Check-out" ? `ชำระ ฿${net.toLocaleString()}` : s === "Check-in" ? "บันทึก & เริ่มฝากเลี้ยง" : "ยืนยัน"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
