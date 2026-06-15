import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Plus, X, Check, Clock, Users, Calendar,
  Stethoscope, Syringe, Activity, Sparkles, Scissors, Video,
  ClipboardList, AlertTriangle, Bone, Minus,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useLang } from "../contexts/LanguageContext";

/* ═══════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════ */
export interface Vet {
  id: string;
  name: string;
  specialty: string;
  hours: number;
  color: string;
  initials: string;
  photo: string;
}

export const VETS: Vet[] = [
  { id: "v1", name: "นพ. ปราโมทย์ วงศ์เพียร", specialty: "DVM, Small Animal",  hours: 32, color: "#19a589", initials: "ปร", photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80" },
  { id: "v2", name: "พญ. ศักรา สุขศรี",       specialty: "DVM, Surgery",       hours: 28, color: "#f43f5e", initials: "ศก", photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80" },
  { id: "v3", name: "นพ. ธีรวัฒน์ คงเดช",     specialty: "DVM, Dentistry",     hours: 24, color: "#3b82f6", initials: "ธว", photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80" },
  { id: "v4", name: "พญ. ณัฐสุดา ทองพูล",     specialty: "DVM, Exotic & Avian", hours: 20, color: "#8b5cf6", initials: "ณส", photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80" },
];

interface ServiceType {
  key: string;
  label: string;
  color: string;
  icon: typeof Stethoscope;
  duration: number; // minutes
  capacity: number;
}

const SERVICES: ServiceType[] = [
  { key: "checkup",   label: "ตรวจสุขภาพประจำปี", color: "#10b981", icon: Stethoscope,   duration: 30,  capacity: 1 },
  { key: "vaccine",   label: "ฉีดวัคซีน",          color: "#3b82f6", icon: Syringe,       duration: 15,  capacity: 2 },
  { key: "sick",      label: "ตรวจอาการป่วย",      color: "#f97316", icon: Activity,      duration: 30,  capacity: 1 },
  { key: "dental",    label: "ขูดหินปูน",          color: "#f59e0b", icon: Bone,          duration: 60,  capacity: 1 },
  { key: "surgery",   label: "ผ่าตัด",             color: "#f43f5e", icon: Sparkles,      duration: 120, capacity: 1 },
  { key: "grooming",  label: "อาบน้ำ-ตัดขน",       color: "#ec4899", icon: Scissors,      duration: 60,  capacity: 2 },
  { key: "tele",      label: "ปรึกษาทางไกล",       color: "#14b8a6", icon: Video,         duration: 20,  capacity: 1 },
  { key: "intake",   label: "ฝากตรวจ",            color: "#8b5cf6", icon: ClipboardList, duration: 15,  capacity: 4 },
  { key: "emergency", label: "สำรองฉุกเฉิน",       color: "#ef4444", icon: AlertTriangle, duration: 30,  capacity: 1 },
];
const svc = (k: string) => SERVICES.find(s => s.key === k)!;

/* Week days — mock data lives in May 18–24, 2026 (Mon-Sun) */
const MOCK_WEEK_START = new Date(2026, 4, 18); // May 18, 2026 = Monday
const MONTHS_SHORT_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const DAY_LABELS_TH = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."]; // Mon-first

interface WeekDay { idx: number; label: string; date: string; month: string; fullDate: Date }
const buildWeekDays = (weekStart: Date): WeekDay[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      idx: i,
      label: DAY_LABELS_TH[i],
      date: String(d.getDate()),
      month: MONTHS_SHORT_TH[d.getMonth()],
      fullDate: d,
    };
  });
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const MOCK_TODAY = new Date(2026, 4, 21); // hardcoded "today" for demo

/* Backward compat — initial reference, replaced by computed weekDays in component */
const WEEK_DAYS = buildWeekDays(MOCK_WEEK_START);

const GRID_START = 8 * 60;   // 08:00
const GRID_END   = 18 * 60;  // 18:00
const HOUR_PX    = 70;       // tighter — fits compact slot chips
const SLOT_H     = 24;       // matches month view pill height
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 08..18

export interface Slot {
  id: number;
  vetId: string;
  day: number;        // 0-6
  start: number;      // minutes from midnight
  serviceKey: string;
  capacity: number;
  booked: number;
}

const toMin = (h: number, m: number) => h * 60 + m;
const fmt = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/* Mock slots for the default vet (v1) + a few for others */
let _id = 1;
const mk = (vetId: string, day: number, h: number, m: number, key: string, booked: number): Slot => ({
  id: _id++, vetId, day, start: toMin(h, m), serviceKey: key, capacity: svc(key).capacity, booked,
});
export const INIT_SLOTS: Slot[] = [
  // ── v1 ปราโมทย์ (Small Animal) ──
  // จ. 18
  mk("v1", 0, 9, 0,  "checkup", 1), mk("v1", 0, 9, 30, "checkup", 0),
  mk("v1", 0, 10, 0, "vaccine", 1), mk("v1", 0, 11, 0, "sick", 1),
  mk("v1", 0, 13, 0, "checkup", 0), mk("v1", 0, 14, 0, "tele", 1),
  mk("v1", 0, 14, 30, "tele", 0),  mk("v1", 0, 15, 30, "emergency", 0),
  // อ. 19
  mk("v1", 1, 9, 0,  "vaccine", 2), mk("v1", 1, 9, 30, "vaccine", 1),
  mk("v1", 1, 10, 0, "checkup", 1), mk("v1", 1, 11, 0, "sick", 0),
  mk("v1", 1, 14, 0, "tele", 1),
  // พ. 20
  mk("v1", 2, 9, 0,  "checkup", 1), mk("v1", 2, 9, 30, "vaccine", 1),
  mk("v1", 2, 10, 0, "checkup", 0), mk("v1", 2, 11, 0, "sick", 1),
  mk("v1", 2, 13, 30, "intake", 2),
  // พฤ. 21
  mk("v1", 3, 9, 0,  "checkup", 1), mk("v1", 3, 10, 0, "checkup", 0),
  mk("v1", 3, 11, 0, "sick", 1),    mk("v1", 3, 14, 0, "sick", 1),
  // ศ. 22
  mk("v1", 4, 9, 0,  "checkup", 0), mk("v1", 4, 9, 30, "vaccine", 1),
  mk("v1", 4, 11, 0, "sick", 1),    mk("v1", 4, 13, 0, "sick", 1),
  mk("v1", 4, 15, 30, "emergency", 0),
  // ส. 23
  mk("v1", 5, 9, 0,  "checkup", 1), mk("v1", 5, 10, 0, "vaccine", 1),
  mk("v1", 5, 14, 0, "tele", 0),

  // ── v2 ศักรา (Surgery) — ออกตรวจ จ./พ./ศ. ──
  mk("v2", 0, 9, 0,  "surgery", 1), mk("v2", 0, 13, 0, "dental", 0),
  mk("v2", 2, 10, 0, "surgery", 0), mk("v2", 2, 14, 0, "dental", 1),
  mk("v2", 4, 9, 0,  "surgery", 1), mk("v2", 4, 13, 0, "surgery", 0),

  // ── v3 ธีรวัฒน์ (Dentistry) — ออกตรวจ อ./พฤ./ส. ──
  mk("v3", 1, 9, 30, "dental", 1), mk("v3", 1, 11, 0, "dental", 0),
  mk("v3", 1, 14, 0, "checkup", 1),
  mk("v3", 3, 10, 0, "dental", 1), mk("v3", 3, 13, 0, "dental", 0),
  mk("v3", 3, 15, 0, "grooming", 1),
  mk("v3", 5, 9, 0,  "dental", 0), mk("v3", 5, 11, 0, "grooming", 1),

  // ── v4 ณัฐสุดา (Exotic & Avian) — ออกตรวจ จ./พ./ศ./อา. ──
  mk("v4", 0, 10, 0, "checkup", 1), mk("v4", 0, 14, 0, "intake", 2),
  mk("v4", 2, 9, 30, "checkup", 0), mk("v4", 2, 13, 0, "tele", 1),
  mk("v4", 4, 10, 30, "checkup", 1), mk("v4", 4, 14, 30, "intake", 1),
  mk("v4", 6, 9, 0,  "checkup", 0), mk("v4", 6, 11, 0, "tele", 0),
];

const REPEAT_OPTS = ["ครั้งเดียว", "รายสัปดาห์", "2 สัปดาห์/ครั้ง", "ทั้งเดือน"];

/* ═══════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════ */
export function SlotBuilder() {
  const { t } = useLang();
  const { showSnackbar } = useSnackbar();
  const [vetId, setVetId] = useState("v1");
  const [slots, setSlots] = useState<Slot[]>(INIT_SLOTS);
  const [filter, setFilter] = useState<Set<string>>(new Set(SERVICES.map(s => s.key)));
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [selectedDayIdx, setSelectedDayIdx] = useState(3); // default: today (พฤ. 21)
  const [monthSelectedDate, setMonthSelectedDate] = useState<number | null>(21); // for month view (date 1-31)
  const [panelOpen, setPanelOpen] = useState(false);
  const [allView, setAllView] = useState(false);   // show every vet's roster
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(4); // 0-indexed, default พฤษภาคม
  const [pickerYear, setPickerYear] = useState(2026);
  const [weekStartDate, setWeekStartDate] = useState<Date>(MOCK_WEEK_START);
  const weekDays = useMemo(() => buildWeekDays(weekStartDate), [weekStartDate]);
  const isMockWeek = sameDay(weekStartDate, MOCK_WEEK_START);
  const [vetFilter, setVetFilter] = useState<Set<string>>(new Set(VETS.map(v => v.id)));
  const [vetMenuOpen, setVetMenuOpen] = useState(false);
  const toggleVetFilter = (id: string) => setVetFilter(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n.size === 0 ? new Set(VETS.map(v => v.id)) : n; // never empty
  });
  const allVetsSelected = vetFilter.size === VETS.length;

  // create-slot form state
  const [fDays, setFDays]     = useState<string[]>(["2026-4-20"]); // date keys "Y-M-D" (M 0-indexed)
  const [fService, setFService] = useState("sick");
  const [fStart, setFStart]   = useState(toMin(14, 0));
  const [fDur, setFDur]       = useState(30);
  const [fCap, setFCap]       = useState(1);
  const [fBuffer, setFBuffer] = useState(10);
  const [fRoom, setFRoom]     = useState("");
  const [fRepeat, setFRepeat] = useState("ครั้งเดียว");
  const [fWeekDays, setFWeekDays] = useState<number[]>([]); // 0=จ ... 6=อา
  const [fOnline, setFOnline] = useState(true);
  const [fEmergency, setFEmergency] = useState(false);
  const [fNote, setFNote]     = useState("");

  const vet = VETS.find(v => v.id === vetId)!;
  const vetSlots = useMemo(
    () => isMockWeek ? slots.filter(s => s.vetId === vetId && filter.has(s.serviceKey)) : [],
    [slots, vetId, filter, isMockWeek],
  );
  const allFilteredSlots = useMemo(
    () => isMockWeek ? slots.filter(s => filter.has(s.serviceKey) && vetFilter.has(s.vetId)) : [],
    [slots, filter, isMockWeek, vetFilter],
  );

  // stats — single vet, or all vets when allView
  const statSlots  = allView ? slots : slots.filter(s => s.vetId === vetId);
  const totalSlots = statSlots.length;
  const totalHours = statSlots.reduce((a, s) => a + svc(s.serviceKey).duration, 0) / 60;
  const bookedCap  = statSlots.reduce((a, s) => a + s.booked, 0);
  const totalCap   = statSlots.reduce((a, s) => a + s.capacity, 0);
  const occupancy  = totalCap > 0 ? Math.round((bookedCap / totalCap) * 100) : 0;

  const toggleFilter = (k: string) => setFilter(prev => {
    const n = new Set(prev);
    n.has(k) ? n.delete(k) : n.add(k);
    return n;
  });

  const openCreate = (dayIdx?: number, startMin?: number) => {
    if (dayIdx !== undefined) {
      const d = weekDays[dayIdx]?.fullDate ?? MOCK_TODAY;
      setFDays([`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`]);
    }
    if (startMin !== undefined) setFStart(Math.max(GRID_START, Math.min(GRID_END - 30, startMin)));
    setPanelOpen(true);
  };
  const toggleFDay = (key: string) => setFDays(prev =>
    prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key],
  );

  const pickService = (key: string) => {
    setFService(key);
    const s = svc(key);
    setFDur(s.duration);
    setFCap(s.capacity);
  };

  const saveSlot = () => {
    // Map picked date-keys that fall in the mock week (18-24 May 2026) to day indices
    const newSlots: Slot[] = [];
    fDays.forEach((key, i) => {
      const [y, m, d] = key.split("-").map(Number);
      if (y === 2026 && m === 4 && d >= 18 && d <= 24) {
        newSlots.push({ id: Date.now() + i, vetId, day: d - 18, start: fStart, serviceKey: fService, capacity: fCap, booked: 0 });
      }
    });
    if (newSlots.length > 0) setSlots(prev => [...prev, ...newSlots]);
    setPanelOpen(false);
    showSnackbar("success", `สร้าง Slot "${svc(fService).label}" ${fmt(fStart)} — ${fDays.length} วัน`);
  };

  const removeSlot = (slotId: number) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
    showSnackbar("success", "ลบ slot เรียบร้อย");
  };

  // For vet-day detail popup
  const [detailVetDay, setDetailVetDay] = useState<{ vet: Vet; day: number; fullDate: Date } | null>(null);

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-hidden" style={{ background: "#FEFBF8" }}>

      {/* ─── HERO HEADER ─── (matching Appointments) */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl flex-shrink-0"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(at 100% 0%, rgba(45,212,191,0.55) 0%, transparent 55%),
              radial-gradient(at 0% 100%, rgba(8,75,62,0.65) 0%, transparent 60%),
              linear-gradient(135deg, #1aa78b 0%, #0e5e4f 100%)
            `,
          }}
        >
          <div className="absolute -top-24 -right-16 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 65%)" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)" }} />
        </div>

        <div className="relative p-4 flex flex-col gap-4">
          {/* Title */}
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
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                {t("schedule.title")}
              </h1>
              <p className="text-white/70" style={{ fontSize: 12, letterSpacing: "0.1px" }}>
                {VETS.length} แพทย์ · ตารางรวมทุกคน
              </p>
            </div>
          </div>

          {/* Bottom: Date nav (changes by view) + View toggle + Create */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date nav — content & step depend on current view */}
            <div
              className="relative inline-flex items-center gap-0.5 px-0.5 rounded-full bg-white"
              style={{
                height: 34,
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <button
                onClick={() => {
                  if (view === "day") {
                    const cur = weekDays[selectedDayIdx].fullDate;
                    const prev = new Date(cur); prev.setDate(cur.getDate() - 1);
                    const dow = (prev.getDay() + 6) % 7;
                    const mon = new Date(prev); mon.setDate(prev.getDate() - dow);
                    setWeekStartDate(mon); setSelectedDayIdx(dow);
                  } else if (view === "week") {
                    const w = new Date(weekStartDate); w.setDate(weekStartDate.getDate() - 7);
                    setWeekStartDate(w);
                  } else {
                    if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1); }
                    else setPickerMonth(m => m - 1);
                  }
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                title="ก่อนหน้า"
                aria-label="ก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDateMenuOpen(o => !o)}
                className="px-2 text-gray-900 inline-flex items-center gap-1 hover:bg-gray-50 rounded-full transition-colors"
                style={{ height: 28, fontSize: 13, fontWeight: 800, letterSpacing: "-0.2px" }}
              >
                {(() => {
                  const MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
                  const sel = weekDays[selectedDayIdx];
                  if (view === "day" && sel) {
                    return <>{sel.date} {sel.month} <span className="text-gray-500">{sel.fullDate.getFullYear() + 543}</span></>;
                  }
                  if (view === "week") {
                    const wd0 = weekDays[0], wd6 = weekDays[6];
                    const sameMonth = wd0.fullDate.getMonth() === wd6.fullDate.getMonth();
                    return <>{wd0.date}{sameMonth ? "" : ` ${wd0.month}`}–{wd6.date} {wd6.month} <span className="text-gray-500">{wd6.fullDate.getFullYear() + 543}</span></>;
                  }
                  return <>{MONTHS_FULL[pickerMonth]} <span className="text-gray-500">{pickerYear + 543}</span></>;
                })()}
              </button>
              <button
                onClick={() => {
                  if (view === "day") {
                    const cur = weekDays[selectedDayIdx].fullDate;
                    const nxt = new Date(cur); nxt.setDate(cur.getDate() + 1);
                    const dow = (nxt.getDay() + 6) % 7;
                    const mon = new Date(nxt); mon.setDate(nxt.getDate() - dow);
                    setWeekStartDate(mon); setSelectedDayIdx(dow);
                  } else if (view === "week") {
                    const w = new Date(weekStartDate); w.setDate(weekStartDate.getDate() + 7);
                    setWeekStartDate(w);
                  } else {
                    if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1); }
                    else setPickerMonth(m => m + 1);
                  }
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                title="ถัดไป"
                aria-label="ถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Date picker dropdown — month calendar grid */}
              <AnimatePresence>
                {dateMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDateMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl overflow-hidden"
                      style={{
                        width: 280,
                        boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    >
                      {(() => {
                        const MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
                        const firstDay = new Date(pickerYear, pickerMonth, 1).getDay();
                        const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
                        const isMockMonth = pickerMonth === 4 && pickerYear === 2026;
                        const prevMonth = () => {
                          if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1); }
                          else setPickerMonth(m => m - 1);
                        };
                        const nextMonth = () => {
                          if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1); }
                          else setPickerMonth(m => m + 1);
                        };
                        return (
                          <>
                            {/* Header */}
                            <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
                              <button
                                onClick={prevMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                aria-label="เดือนก่อนหน้า"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <p className="text-[12.5px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>
                                {MONTHS[pickerMonth]} <span className="text-gray-500">{pickerYear + 543}</span>
                              </p>
                              <button
                                onClick={nextMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                aria-label="เดือนถัดไป"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Weekday labels */}
                            <div className="grid grid-cols-7 px-2 pt-2">
                              {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((d, i) => {
                                const isWE = i === 0 || i === 6;
                                return (
                                  <div
                                    key={d}
                                    className="py-1 text-center text-[9.5px]"
                                    style={{
                                      fontWeight: 700,
                                      letterSpacing: "0.4px",
                                      color: isWE ? "#cbd5e1" : "#94a3b8",
                                    }}
                                  >
                                    {d}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Date grid */}
                            <div className="grid grid-cols-7 gap-0.5 px-2 pb-2.5">
                              {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`pre-${i}`} className="h-8" />
                              ))}
                              {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const pickerDate = new Date(pickerYear, pickerMonth, day);
                                const isToday = sameDay(pickerDate, MOCK_TODAY);
                                const isActive = sameDay(pickerDate, weekDays[selectedDayIdx]?.fullDate ?? MOCK_TODAY);
                                const colIdx = (firstDay + i) % 7;
                                const isWE = colIdx === 0 || colIdx === 6;
                                return (
                                  <button
                                    key={day}
                                    onClick={() => {
                                      const picked = new Date(pickerYear, pickerMonth, day);
                                      // Compute Monday of the picked week (week starts Monday)
                                      const dow = (picked.getDay() + 6) % 7; // Mon=0 .. Sun=6
                                      const monday = new Date(picked);
                                      monday.setDate(picked.getDate() - dow);
                                      setWeekStartDate(monday);
                                      setSelectedDayIdx(dow);
                                      if (view === "month") setMonthSelectedDate(day);
                                      setDateMenuOpen(false);
                                    }}
                                    className="h-8 rounded-full text-[11.5px] transition-colors hover:bg-gray-100"
                                    style={{
                                      background: isToday ? "#0d7c66" : isActive ? "rgba(13,124,102,0.12)" : "transparent",
                                      color: isToday
                                        ? "#ffffff"
                                        : isActive
                                          ? "#0d7c66"
                                          : isWE
                                            ? "#94a3b8"
                                            : "#334155",
                                      fontWeight: isToday || isActive ? 700 : 500,
                                    }}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Footer — quick today */}
                            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setPickerMonth(4);
                                  setPickerYear(2026);
                                  setWeekStartDate(MOCK_WEEK_START);
                                  setSelectedDayIdx(3);
                                  setMonthSelectedDate(21);
                                  setDateMenuOpen(false);
                                }}
                                className="text-[11.5px] text-[#0d7c66] hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
                                style={{ fontWeight: 700 }}
                              >
                                วันนี้
                              </button>
                              <button
                                onClick={() => setDateMenuOpen(false)}
                                className="text-[11.5px] text-gray-500 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
                                style={{ fontWeight: 600 }}
                              >
                                ปิด
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* View toggle — glass segmented with sliding indicator */}
            <div
              className="relative inline-flex items-center p-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              {(["day", "week", "month"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="relative px-3 py-1.5 rounded-full text-[12px] transition-colors"
                  style={{
                    color: view === v ? "#0d7c66" : "rgba(255,255,255,0.85)",
                    fontWeight: view === v ? 700 : 500,
                    zIndex: 1,
                  }}
                >
                  {view === v && (
                    <motion.span
                      layoutId="schedule-view-indicator"
                      className="absolute inset-0 rounded-full bg-white"
                      style={{
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        zIndex: -1,
                      }}
                      transition={{ type: "spring", stiffness: 480, damping: 32 }}
                    />
                  )}
                  <span className="relative">{v === "day" ? "รายวัน" : v === "week" ? "รายสัปดาห์" : "รายเดือน"}</span>
                </button>
              ))}
            </div>

            {/* Vet filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setVetMenuOpen(o => !o)}
                className="inline-flex items-center gap-1.5 px-3 rounded-full bg-white transition-colors hover:bg-gray-50"
                style={{
                  height: 34,
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                {/* Avatar stack */}
                <div className="flex items-center -space-x-2">
                  {VETS.filter(v => vetFilter.has(v.id)).slice(0, 3).map(v => (
                    <div key={v.id} className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-white">
                      <img src={v.photo} alt={v.name} className="w-full h-full object-cover" draggable={false} />
                    </div>
                  ))}
                </div>
                <span className="text-[12px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>
                  {allVetsSelected ? "ทุกแพทย์" : `${vetFilter.size} แพทย์`}
                </span>
                <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
              </button>

              <AnimatePresence>
                {vetMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setVetMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl overflow-hidden"
                      style={{ width: 240, boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
                    >
                      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>กรองแพทย์</p>
                        <button
                          onClick={() => setVetFilter(new Set(VETS.map(v => v.id)))}
                          className="text-[10.5px] text-[#0d7c66] hover:underline"
                          style={{ fontWeight: 700 }}
                        >
                          เลือกทั้งหมด
                        </button>
                      </div>
                      <div className="p-2">
                        {VETS.map(v => {
                          const on = vetFilter.has(v.id);
                          return (
                            <button
                              key={v.id}
                              onClick={() => toggleVetFilter(v.id)}
                              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <img src={v.photo} alt={v.name} className="w-full h-full object-cover" draggable={false} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] text-gray-900 truncate" style={{ fontWeight: on ? 700 : 500 }}>{v.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{v.specialty}</p>
                              </div>
                              <div
                                className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                                style={{ background: on ? v.color : "#ffffff", border: on ? "none" : "1.5px solid #d1d5db" }}
                              >
                                {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1" />

            <button
              onClick={() => openCreate()}
              className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 flex-shrink-0 text-white"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                border: "1px solid rgba(253,186,116,0.85)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.15), 0 6px 22px rgba(234,88,12,0.65)",
                fontWeight: 600,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              <Plus className="w-3.5 h-3.5" /> สร้าง Slot
            </button>
          </div>
        </div>
      </motion.section>

      {/* ─── MAIN: 2-column grid — calendar left, vet/filter sidebar right ─── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-stretch min-h-0">

      {/* CENTER — CALENDAR */}
      <main className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col min-w-0" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>

        {/* ═══ ALL-VETS ROSTER ═══ */}
        {allView ? (
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full table-fixed rounded-2xl border border-gray-150 bg-white overflow-hidden" style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 880 }}>
            <colgroup>
              <col style={{ width: 200 }} />
              {WEEK_DAYS.map(d => <col key={d.idx} />)}
            </colgroup>
            {/* header */}
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2.5 border-b border-r border-gray-150 text-left">
                  <span className="text-[11px] text-gray-500" style={{ fontWeight: 700 }}>แพทย์ \ วัน</span>
                </th>
                {WEEK_DAYS.map(d => {
                  const isToday = d.idx === 3;
                  return (
                    <th key={d.idx} className="px-2 py-2.5 border-b border-r border-gray-100 last:border-r-0 text-center">
                      <p
                        className="text-[10.5px]"
                        style={{
                          fontWeight: 700,
                          letterSpacing: "0.4px",
                          color: isToday ? "#0d7c66" : d.idx >= 5 ? "#cbd5e1" : "#94a3b8",
                        }}
                      >
                        {d.label}
                      </p>
                      <p className="text-[12px] text-gray-800 mt-0.5" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{d.date} {d.month}</p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            {/* vet rows */}
            <tbody>
              {VETS.map(v => {
                const vSlots = slots.filter(s => s.vetId === v.id);
                const weekHours = vSlots.reduce((a, s) => a + svc(s.serviceKey).duration, 0) / 60;
                return (
                  <tr key={v.id} style={{ height: 84 }}>
                    {/* vet cell */}
                    <td className="border-b border-r border-gray-150 p-0 align-middle">
                      <button onClick={() => { setVetId(v.id); setAllView(false); }}
                        className="w-full h-full px-3 flex items-center gap-2.5 hover:bg-gray-50 transition-colors text-left">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ background: v.color, fontWeight: 700 }}>
                          {v.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 700 }}>{v.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{v.specialty} · {weekHours.toFixed(1)}h/สัปดาห์</p>
                        </div>
                      </button>
                    </td>
                    {/* day cells */}
                    {WEEK_DAYS.map(d => {
                      const ds = vSlots.filter(s => s.day === d.idx);
                      const isToday = d.idx === 3;
                      if (ds.length === 0) {
                        return (
                          <td key={d.idx} className="border-b border-r border-gray-100 last:border-r-0 text-center align-middle"
                            style={isToday ? { background: "rgba(25,165,137,0.03)" } : undefined}>
                            <span className="text-[10px] text-gray-300">หยุด</span>
                          </td>
                        );
                      }
                      const startMin = Math.min(...ds.map(s => s.start));
                      const endMin   = Math.max(...ds.map(s => s.start + svc(s.serviceKey).duration));
                      const seats    = ds.reduce((a, s) => a + s.capacity, 0);
                      const booked   = ds.reduce((a, s) => a + s.booked, 0);
                      return (
                        <td key={d.idx} className="border-b border-r border-gray-100 last:border-r-0 p-1.5 align-middle"
                          style={isToday ? { background: "rgba(25,165,137,0.03)" } : undefined}>
                          <div className="rounded-lg p-2" style={{ background: `${v.color}0E` }}>
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: v.color }} />
                              <span className="text-[11px] leading-none truncate" style={{ fontWeight: 700, color: "#334155", letterSpacing: "-0.1px" }}>
                                {fmt(startMin)}–{fmt(endMin)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#ffffff", color: v.color, fontWeight: 700 }}>
                                {ds.length} slot
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full text-gray-500" style={{ background: "#ffffff", fontWeight: 600 }}>
                                จอง {booked}/{seats}
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* hint */}
          <p className="text-[11px] text-gray-400 mt-3 text-center">
            คลิกชื่อแพทย์เพื่อดูตารางรายคน · ช่อง "หยุด" = ไม่มีคิวออกตรวจวันนั้น
          </p>
        </div>
        ) : view === "month" ? (
        /* Month — calendar showing all vets' overview */
        <MonthGrid
          allSlots={slots.filter(s => vetFilter.has(s.vetId))}
          vets={VETS.filter(v => vetFilter.has(v.id))}
          monthYear={pickerYear}
          monthIndex={pickerMonth}
          selectedDate={monthSelectedDate}
          onPickDate={(date) => setMonthSelectedDate(date)}
          onClickVet={(v, day) => {
            const fd = new Date(pickerYear, pickerMonth, day);
            const inMockWeek = fd >= MOCK_WEEK_START && fd <= new Date(2026, 4, 24, 23, 59);
            const di = inMockWeek ? (fd.getDay() + 6) % 7 : -1;
            setDetailVetDay({ vet: v, day: di, fullDate: fd });
          }}
        />
        ) : view === "day" ? (
        /* Day — hour rows showing all vets */
        <DayList
          daySlots={allFilteredSlots.filter(s => s.day === selectedDayIdx)}
          vets={VETS}
          dayLabel={weekDays[selectedDayIdx]}
          onPickHour={(h) => openCreate(selectedDayIdx, toMin(h, 0))}
          onClickSlot={(s) => { const cfg = svc(s.serviceKey); showSnackbar("info", `${cfg.label} · ${fmt(s.start)}–${fmt(s.start + cfg.duration)} · จอง ${s.booked}/${s.capacity}`); }}
        />
        ) : (
        /* Gantt — days across top, time down the left (week view) */
        <div className="flex-1 overflow-auto">
          <div className={view === "day" ? "" : "min-w-[820px]"}>
            {/* Day header row — matches Appointments style */}
            <div className="flex border-b border-gray-100/60 bg-white sticky top-0 z-10">
              <div className="w-16 flex-shrink-0" />
              {(view === "day" ? [weekDays[selectedDayIdx]] : weekDays).map(d => {
                const isToday = sameDay(d.fullDate, MOCK_TODAY);
                const isWeekend = d.idx >= 5;
                const isSelected = view === "week" && d.idx === selectedDayIdx;
                return (
                  <button
                    key={d.idx}
                    onClick={() => {
                      if (view === "week") setSelectedDayIdx(d.idx);
                    }}
                    disabled={view === "day"}
                    className="flex-1 p-2.5 text-center transition-colors disabled:cursor-default enabled:hover:bg-gray-50/60"
                    style={{
                      background: isSelected ? "rgba(25,165,137,0.06)" : "transparent",
                      borderBottom: isSelected ? "2px solid #0d7c66" : "2px solid transparent",
                    }}
                  >
                    <div
                      className="text-[10.5px]"
                      style={{
                        fontWeight: 700,
                        letterSpacing: "0.4px",
                        color: isWeekend ? "#cbd5e1" : "#94a3b8",
                      }}
                    >
                      {d.label}
                    </div>
                    <div className="flex items-center justify-center mt-1.5">
                      <span
                        className="inline-flex items-center justify-center"
                        style={{
                          width: isToday ? 28 : 22,
                          height: isToday ? 28 : 22,
                          borderRadius: 9999,
                          background: isToday ? "#0d7c66" : "transparent",
                          color: isToday ? "#ffffff" : isWeekend ? "#94a3b8" : "#334155",
                          fontSize: 12,
                          fontWeight: isToday ? 700 : 600,
                          letterSpacing: "-0.3px",
                          lineHeight: 1,
                        }}
                      >
                        {d.date}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Time grid */}
            <div className="flex relative pt-2">
              {/* hour labels (left) */}
              <div className="w-16 flex-shrink-0">
                {HOURS.map(h => (
                  <div key={h} style={{ height: HOUR_PX }} className="relative">
                    <span className="absolute -top-1.5 right-2 text-[10px] text-gray-400" style={{ fontWeight: 500 }}>
                      {String(h).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* day columns */}
              {(view === "day" ? [weekDays[selectedDayIdx]] : weekDays).map(d => {
                const isToday = sameDay(d.fullDate, MOCK_TODAY);
                return (
                  <div key={d.idx} className="flex-1 relative"
                    style={isToday ? { background: "rgba(25,165,137,0.025)" } : undefined}>
                    {/* hour cells */}
                    {HOURS.map(h => (
                      <div key={h}
                        onClick={() => openCreate(d.idx, toMin(h, 0))}
                        style={{ height: HOUR_PX }}
                        className="border-b border-gray-50/80 hover:bg-gray-50/40 cursor-pointer transition-colors group/cell relative">
                        <Plus className="w-3.5 h-3.5 text-gray-400 absolute top-1.5 left-1.5 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
                      </div>
                    ))}
                    {/* One pill per (vet, hour bucket) — same vet within same hour collapses */}
                    {(() => {
                      const daySlots = allFilteredSlots.filter(s => s.day === d.idx).sort((a, b) => a.start - b.start);
                      // Bucket by (vetId, hour). Within an hour, ONE pill per vet.
                      type Block = { vetId: string; hourBucket: number; start: number; end: number; slots: Slot[] };
                      const bucketKey = (vetId: string, startMin: number) => `${vetId}-${Math.floor(startMin / 60)}`;
                      const blockMap = new Map<string, Block>();
                      daySlots.forEach(s => {
                        const end = s.start + svc(s.serviceKey).duration;
                        const key = bucketKey(s.vetId, s.start);
                        const existing = blockMap.get(key);
                        if (existing) {
                          existing.end = Math.max(existing.end, end);
                          existing.start = Math.min(existing.start, s.start);
                          existing.slots.push(s);
                        } else {
                          blockMap.set(key, { vetId: s.vetId, hourBucket: Math.floor(s.start / 60), start: s.start, end, slots: [s] });
                        }
                      });
                      const blocks = Array.from(blockMap.values()).sort((a, b) => a.start - b.start);
                      return blocks.map((b, bi) => {
                        const v = VETS.find(vv => vv.id === b.vetId);
                        // Snap to the hour bucket (so all pills in same hour align)
                        const hourTopMin = b.hourBucket * 60;
                        const baseTop = ((hourTopMin - GRID_START) / 60) * HOUR_PX;
                        // Stack vertically: index within the same hour bucket
                        const sameBucketBlocks = blocks.filter(x => x.hourBucket === b.hourBucket);
                        const stackIdx = sameBucketBlocks.findIndex(x => x === b);
                        const top = baseTop + stackIdx * (SLOT_H + 2);
                        const totalCap = b.slots.reduce((a, s) => a + s.capacity, 0);
                        const totalBooked = b.slots.reduce((a, s) => a + s.booked, 0);
                        return (
                          <motion.div
                            key={`${b.vetId}-${b.start}-${bi}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, zIndex: 5 }}
                            onClick={(e) => { e.stopPropagation(); setSelectedDayIdx(d.idx); }}
                            className="absolute left-1 right-1 rounded-full cursor-pointer overflow-hidden transition-colors"
                            style={{
                              top: top + 2,
                              height: SLOT_H,
                              background: `${v?.color ?? "#94a3b8"}14`,
                            }}
                            title={`${v?.name ?? ""} · ${fmt(b.start)}–${fmt(b.end)} · ${b.slots.length} slot · จอง ${totalBooked}/${totalCap}`}
                          >
                            <div className="h-full flex items-center gap-1.5 pl-0.5 pr-2">
                              {v && (
                                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                                  <img src={v.photo} alt={v.name} className="w-full h-full object-cover" draggable={false} />
                                </div>
                              )}
                              <p className="text-[10.5px] leading-tight truncate flex-1 min-w-0"
                                style={{ fontWeight: 500, color: "#374151", letterSpacing: "-0.1px" }}>
                                {v?.name.replace(/^(นพ\.|พญ\.) /, "") ?? ""}
                              </p>
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </main>

      {/* ─── RIGHT SIDEBAR — always shows day details ─── */}
      {(() => {
        // For week/day: the actual selected calendar date. For month: the picked date in month.
        const sidebarFullDate =
          view === "month" && monthSelectedDate !== null
            ? new Date(pickerYear, pickerMonth, monthSelectedDate)
            : weekDays[selectedDayIdx]?.fullDate ?? MOCK_TODAY;
        // Map to mock-week day index if it falls in the mock week (else no data)
        const inMock = sidebarFullDate >= MOCK_WEEK_START && sidebarFullDate <= new Date(2026, 4, 24, 23, 59);
        const sidebarDayIdx = inMock ? (sidebarFullDate.getDay() + 6) % 7 : -1;
        return (
          <MonthDaySidebar
            fullDate={sidebarFullDate}
            dayIdx={sidebarDayIdx}
            allSlots={slots.filter(s => vetFilter.has(s.vetId))}
            vets={VETS.filter(v => vetFilter.has(v.id))}
            onAdd={(vId) => { setVetId(vId); openCreate(sidebarDayIdx >= 0 ? sidebarDayIdx : 0); }}
            onRemoveSlot={removeSlot}
            onViewVet={(v) => setDetailVetDay({ vet: v, day: sidebarDayIdx, fullDate: sidebarFullDate })}
          />
        );
      })()}
      </div>

      {/* ─── VET-DAY DETAIL POPUP — click vet name in calendar ─── */}
      <AnimatePresence>
        {detailVetDay && (
          <VetDayDetailModal
            vet={detailVetDay.vet}
            fullDate={detailVetDay.fullDate}
            slots={detailVetDay.day >= 0 ? slots.filter(s => s.vetId === detailVetDay.vet.id && s.day === detailVetDay.day) : []}
            onClose={() => setDetailVetDay(null)}
            onRemove={(id) => {
              if (confirm("ยืนยันการลบ slot นี้?")) removeSlot(id);
            }}
            onEdit={() => {
              setVetId(detailVetDay.vet.id);
              openCreate(detailVetDay.day >= 0 ? detailVetDay.day : 0);
              setDetailVetDay(null);
            }}
            onAdd={() => {
              setVetId(detailVetDay.vet.id);
              openCreate(detailVetDay.day >= 0 ? detailVetDay.day : 0);
              setDetailVetDay(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── CREATE SLOT — centered popup modal ─── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setPanelOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="bg-white rounded-3xl w-full max-w-[840px] shadow-2xl overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <CreateSlotPanel
                vet={vet}
                fDays={fDays} toggleFDay={toggleFDay}
                fService={fService} pickService={pickService}
                fStart={fStart} setFStart={setFStart}
                fDur={fDur} setFDur={setFDur}
                fCap={fCap} setFCap={setFCap}
                fBuffer={fBuffer} setFBuffer={setFBuffer}
                fRoom={fRoom} setFRoom={setFRoom}
                fRepeat={fRepeat} setFRepeat={setFRepeat}
                fWeekDays={fWeekDays} setFWeekDays={setFWeekDays}
                fOnline={fOnline} setFOnline={setFOnline}
                fEmergency={fEmergency} setFEmergency={setFEmergency}
                fNote={fNote} setFNote={setFNote}
                onClose={() => setPanelOpen(false)}
                onSave={saveSlot}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Create-slot panel
   ═══════════════════════════════════════════════════════ */
function Stepper({ value, onChange, display, suffix, step = 1, min = 0, max = 999 }: {
  value: number; onChange: (v: number) => void; display?: string; suffix?: string; step?: number; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-9 bg-white">
      <button onClick={() => onChange(Math.max(min, value - step))}
        className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="flex-1 text-center text-sm text-gray-800" style={{ fontWeight: 600 }}>
        {display ?? value}{suffix ? <span className="text-[10px] text-gray-400 ml-0.5">{suffix}</span> : null}
      </span>
      <button onClick={() => onChange(Math.min(max, value + step))}
        className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function CreateSlotPanel(p: {
  vet: Vet;
  fDays: string[]; toggleFDay: (v: string) => void;
  fService: string; pickService: (k: string) => void;
  fStart: number; setFStart: (v: number) => void;
  fDur: number; setFDur: (v: number) => void;
  fCap: number; setFCap: (v: number) => void;
  fBuffer: number; setFBuffer: (v: number) => void;
  fRoom: string; setFRoom: (v: string) => void;
  fRepeat: string; setFRepeat: (v: string) => void;
  fWeekDays: number[]; setFWeekDays: (v: number[]) => void;
  fOnline: boolean; setFOnline: (v: boolean) => void;
  fEmergency: boolean; setFEmergency: (v: boolean) => void;
  fNote: string; setFNote: (v: string) => void;
  onClose: () => void; onSave: () => void;
}) {
  const cfg = svc(p.fService);
  const endMin = p.fStart + p.fDur;
  const daysLabel = p.fDays.length > 0
    ? `${p.fDays.length} วัน`
    : "ยังไม่เลือกวัน";

  return (
    <div className="flex flex-col min-h-full">
      {/* Header — clean white (matches IPD modals) */}
      <div className="vet-modal-header flex items-center gap-3">
        <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)" }}>
          <Plus className="w-5 h-5 text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>สร้าง Slot ใหม่</h3>
          <p className="text-[11px] text-gray-500 truncate">
            {p.vet.name} · {daysLabel} · {fmt(p.fStart)}–{fmt(endMin)}
          </p>
        </div>
        <button onClick={p.onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
      </div>

      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        {/* ─── LEFT: Calendar + time controls ─── */}
        <div className="space-y-4">
          <Field label={`เลือกวัน · เลือกได้หลายวัน (${p.fDays.length})`}>
            <SlotCalendar fDays={p.fDays} toggleFDay={p.toggleFDay} />
          </Field>

          {/* steppers 2×2 — moved under calendar */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            <div>
              <SubLabel>เวลาเริ่ม</SubLabel>
              <Stepper value={p.fStart} display={fmt(p.fStart)} onChange={p.setFStart} step={15} min={GRID_START} max={GRID_END - 15} />
            </div>
            <div>
              <SubLabel>ระยะเวลา</SubLabel>
              <Stepper value={p.fDur} onChange={p.setFDur} step={5} min={5} max={240} suffix="min" />
            </div>
            <div>
              <SubLabel>จองพร้อมกัน</SubLabel>
              <Stepper value={p.fCap} onChange={p.setFCap} min={1} max={20} suffix="ตัว" />
            </div>
            <div>
              <SubLabel>เวลาเผื่อหลัง</SubLabel>
              <Stepper value={p.fBuffer} onChange={p.setFBuffer} step={5} min={0} max={60} suffix="min" />
            </div>
          </div>

          {/* time bar */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span style={{ fontWeight: 600 }}>{fmt(p.fStart)}</span>
              <span className="text-gray-400">{p.fDur} นาที{p.fBuffer > 0 ? ` +${p.fBuffer} เผื่อ` : ""}</span>
              <span style={{ fontWeight: 600 }}>{fmt(endMin + p.fBuffer)}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="rounded-l-full" style={{ flex: p.fDur, background: cfg.color }} />
              {p.fBuffer > 0 && (
                <div className="rounded-r-full" style={{
                  flex: p.fBuffer,
                  background: `repeating-linear-gradient(45deg, ${cfg.color}33, ${cfg.color}33 4px, transparent 4px, transparent 8px)`,
                }} />
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Slot details ─── */}
        <div className="space-y-4 min-w-0">
          {/* ประเภทบริการ */}
          <Field label="ประเภทบริการ">
            <div className="grid grid-cols-2 gap-1.5">
              {SERVICES.map(s => {
                const Sico = s.icon;
                const on = s.key === p.fService;
                return (
                  <button key={s.key} onClick={() => p.pickService(s.key)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: on ? `${s.color}40` : "rgba(0,0,0,0.06)",
                      background: on ? `${s.color}0E` : "#fff",
                    }}>
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: on ? s.color : `${s.color}14` }}
                    >
                      <Sico className="w-3 h-3" style={{ color: on ? "#ffffff" : s.color }} strokeWidth={2.2} />
                    </span>
                    <span className="text-[10.5px] leading-tight truncate min-w-0" style={{ fontWeight: on ? 700 : 600, color: on ? s.color : "#374151" }}>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* ห้อง + ทำซ้ำ */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="ห้อง / ทรัพยากร">
              <select value={p.fRoom} onChange={e => p.setFRoom(e.target.value)} className="vet-select">
                <option value="">— ไม่ระบุ —</option>
                <option value="r1">ห้องตรวจ 1</option>
                <option value="r2">ห้องตรวจ 2</option>
                <option value="r3">ห้องผ่าตัด</option>
                <option value="r4">ห้องทันตกรรม</option>
                <option value="r5">ห้อง Grooming</option>
              </select>
            </Field>
            <Field label="ทำซ้ำ">
              <select value={p.fRepeat} onChange={e => p.setFRepeat(e.target.value)} className="vet-select">
                {REPEAT_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>

          {/* Day-of-week selector — appears only on weekly repeats */}
          {(p.fRepeat === "รายสัปดาห์" || p.fRepeat === "2 สัปดาห์/ครั้ง") && (
            <Field label={`เลือกวันในสัปดาห์ ${p.fWeekDays.length > 0 ? `(${p.fWeekDays.length} วัน)` : ""}`}>
              <div className="flex flex-wrap gap-1.5">
                {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((label, idx) => {
                  const on = p.fWeekDays.includes(idx);
                  const isWeekend = idx >= 5;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (on) p.setFWeekDays(p.fWeekDays.filter(d => d !== idx));
                        else p.setFWeekDays([...p.fWeekDays, idx].sort((a, b) => a - b));
                      }}
                      className="inline-flex items-center justify-center min-w-[42px] h-9 px-3 rounded-full text-[12.5px] transition-all"
                      style={{
                        fontWeight: on ? 700 : 600,
                        color: on ? "#ffffff" : (isWeekend ? "#dc2626" : "#374151"),
                        background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#f3f4f6",
                        border: on ? "1px solid #0d7c66" : "1px solid transparent",
                        boxShadow: on ? "0 3px 10px rgba(25,165,137,0.22)" : "none",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {p.fWeekDays.length === 0 && (
                <p className="text-[10.5px] text-amber-600 mt-1.5">⚠ ยังไม่ได้เลือกวันใดเลย</p>
              )}
            </Field>
          )}

          {/* กฎการจอง */}
          <Field label="กฎการจอง">
            <div className="grid grid-cols-2 gap-2">
              <ToggleRow label="รับจองออนไลน์" sub="แสดงให้เจ้าของสัตว์" on={p.fOnline} onToggle={() => p.setFOnline(!p.fOnline)} />
              <ToggleRow label="สำรองฉุกเฉิน" sub="พนักงานเท่านั้น" on={p.fEmergency} onToggle={() => p.setFEmergency(!p.fEmergency)} />
            </div>
          </Field>

          {/* โน้ต */}
          <Field label="โน้ตภายใน">
            <textarea value={p.fNote} onChange={e => p.setFNote(e.target.value)} rows={2}
              placeholder="เช่น เคสใหม่ ใช้เวลาเพิ่ม"
              className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all placeholder:text-gray-300" />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="vet-modal-footer">
        <button onClick={p.onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
        <button onClick={p.onSave} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> บันทึก Slot
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-gray-700 mb-1.5" style={{ fontWeight: 700 }}>{label}</p>
      {children}
    </div>
  );
}

/* Multi-select calendar with month navigation for the create-slot form */
function SlotCalendar({ fDays, toggleFDay }: { fDays: string[]; toggleFDay: (key: string) => void }) {
  const MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const [vm, setVm] = useState(4); // viewed month, 0-indexed (default พฤษภาคม)
  const [vy, setVy] = useState(2026);
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  // Mon-first offset
  const firstDow = (new Date(vy, vm, 1).getDay() + 6) % 7;

  const prev = () => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); };
  const next = () => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); };

  return (
    <div className="rounded-2xl border border-gray-100 p-4" style={{ background: "#fafafa" }}>
      {/* Month header with nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors" aria-label="เดือนก่อน">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-[14px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>
          {MONTHS_FULL[vm]} <span className="text-gray-500">{vy + 543}</span>
        </p>
        <button onClick={next} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors" aria-label="เดือนถัดไป">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Weekday labels — Mon first */}
      <div className="grid grid-cols-7 mb-1.5">
        {["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map((d, i) => (
          <div key={d} className="text-center text-[10px] py-1" style={{ fontWeight: 700, color: i >= 5 ? "#cbd5e1" : "#94a3b8" }}>{d}</div>
        ))}
      </div>
      {/* Dates */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`pre-${i}`} className="h-10" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = `${vy}-${vm}-${day}`;
          const on = fDays.includes(key);
          const isToday = vy === 2026 && vm === 4 && day === 21;
          const colIdx = (firstDow + i) % 7;
          const isWE = colIdx >= 5;
          return (
            <button
              key={day}
              onClick={() => toggleFDay(key)}
              className="h-10 rounded-xl text-[13px] transition-all hover:bg-gray-100"
              style={on
                ? { background: "linear-gradient(135deg,#19a589,#0d7c66)", color: "#ffffff", fontWeight: 700, boxShadow: "0 2px 8px rgba(25,165,137,0.30)" }
                : {
                    background: "transparent",
                    color: isWE ? "#94a3b8" : "#334155",
                    fontWeight: isToday ? 800 : 500,
                    border: isToday && !on ? "1.5px solid rgba(25,165,137,0.40)" : undefined,
                  }}
            >
              {day}
            </button>
          );
        })}
      </div>
      {fDays.length > 0 && (
        <button
          onClick={() => fDays.forEach(k => toggleFDay(k))}
          className="w-full mt-2 text-[10px] text-gray-400 hover:text-rose-500 transition-colors py-1"
          style={{ fontWeight: 600 }}
        >
          ล้างที่เลือก ({fDays.length})
        </button>
      )}
    </div>
  );
}

/* sub-label inside a Field — sits above its control */
function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-gray-500 mb-1" style={{ fontWeight: 600 }}>{children}</p>;
}

function ToggleRow({ label, sub, on, onToggle }: { label: string; sub: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
      <div className="min-w-0">
        <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{label}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
      <button onClick={onToggle}
        role="switch" aria-checked={on}
        className="relative rounded-full flex-shrink-0 transition-colors"
        style={{ width: 46, height: 26, background: on ? "#19a589" : "#d1d5db" }}>
        <motion.span
          animate={{ x: on ? 23 : 3 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          className="absolute rounded-full bg-white"
          style={{ width: 20, height: 20, top: 3, left: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.28)" }}
        />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MonthGrid — month overview showing slot count per day
   ═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   WeekGrid — 7-day cells (same compact layout as month)
   ═══════════════════════════════════════════════════════ */
function WeekGrid({ allSlots, vets, selectedIdx, onPickDay }: { allSlots: Slot[]; vets: Vet[]; selectedIdx: number; onPickDay: (idx: number) => void }) {
  const todayIdx = 3; // พฤ. 21

  // Group vets+slots by day index (0-6)
  const dayData = WEEK_DAYS.map(d => {
    const daySlots = allSlots.filter(s => s.day === d.idx).sort((a, b) => a.start - b.start);
    const vetsToday = vets.filter(v => daySlots.some(s => s.vetId === v.id));
    return { day: d, daySlots, vetsToday };
  });

  return (
    <div className="flex-1 overflow-auto p-2">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100/60">
        {WEEK_DAYS.map(d => {
          const isToday = d.idx === todayIdx;
          const isWeekend = d.idx >= 5;
          return (
            <div key={d.idx} className="py-3 text-center">
              <p
                className="text-[10.5px]"
                style={{
                  fontWeight: 700,
                  letterSpacing: "0.4px",
                  color: isWeekend ? "#cbd5e1" : "#94a3b8",
                }}
              >
                {d.label}
              </p>
              <div className="flex items-center justify-center mt-1.5">
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    width: isToday ? 28 : 22,
                    height: isToday ? 28 : 22,
                    borderRadius: 9999,
                    background: isToday ? "#0d7c66" : "transparent",
                    color: isToday ? "#ffffff" : isWeekend ? "#94a3b8" : "#334155",
                    fontSize: 12,
                    fontWeight: isToday ? 700 : 600,
                    letterSpacing: "-0.3px",
                    lineHeight: 1,
                  }}
                >
                  {d.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 p-2 gap-1.5">
        {dayData.map(({ day, daySlots, vetsToday }) => {
          const isToday = day.idx === todayIdx;
          const isSelected = day.idx === selectedIdx;
          return (
            <button
              key={day.idx}
              onClick={() => onPickDay(day.idx)}
              className="text-left rounded-xl overflow-hidden transition-colors hover:bg-gray-50/60 p-2.5"
              style={{
                minHeight: 360,
                background: isSelected ? "rgba(25,165,137,0.06)" : isToday ? "rgba(25,165,137,0.03)" : "#ffffff",
                border: isSelected ? "1px solid rgba(25,165,137,0.35)" : isToday ? "1px solid rgba(25,165,137,0.20)" : "1px solid rgba(0,0,0,0.04)",
                boxShadow: isSelected ? "0 2px 8px rgba(25,165,137,0.10)" : "0 1px 2px rgba(0,0,0,0.015)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                  {daySlots.length} slot
                </span>
                {vetsToday.length > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[9.5px]"
                    style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700 }}
                  >
                    {vetsToday.length}
                  </span>
                )}
              </div>

              {/* Vets list — photo + name */}
              <div className="space-y-1.5">
                {vetsToday.map(v => {
                  const count = daySlots.filter(s => s.vetId === v.id).length;
                  return (
                    <div key={v.id} className="flex items-center gap-1.5 pr-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                        <img src={v.photo} alt={v.name} className="w-full h-full object-cover" draggable={false} />
                      </div>
                      <span className="text-[10.5px] text-gray-700 truncate flex-1" style={{ fontWeight: 500, letterSpacing: "-0.1px" }}>
                        {v.name.replace(/^(นพ\.|พญ\.) /, "")}
                      </span>
                      <span className="text-[9px] text-gray-400 flex-shrink-0" style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                  );
                })}
                {vetsToday.length === 0 && (
                  <div className="text-[10.5px] text-gray-300 text-center py-6" style={{ fontWeight: 500 }}>
                    หยุด
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonthGrid({ allSlots, vets, monthYear, monthIndex, selectedDate, onPickDate, onClickVet }: { allSlots: Slot[]; vets: Vet[]; monthYear: number; monthIndex: number; selectedDate: number | null; onPickDate: (date: number) => void; onClickVet?: (vet: Vet, day: number) => void }) {
  const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(monthYear, monthIndex, 1).getDay();
  const isMockMonth = monthIndex === 4 && monthYear === 2026;
  const todayDate = isMockMonth ? 21 : -1;
  const weekDayHeaders = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  // Group vets by date (only mock month May 2026 dates 18-24 have data)
  const vetsByDate: Record<number, Vet[]> = {};
  if (isMockMonth) {
    vets.forEach(v => {
      allSlots.filter(s => s.vetId === v.id).forEach(s => {
        const date = 18 + s.day;
        if (!vetsByDate[date]) vetsByDate[date] = [];
        if (!vetsByDate[date].some(x => x.id === v.id)) vetsByDate[date].push(v);
      });
    });
  }

  return (
    <div className="flex-1 overflow-auto p-2">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100/60">
        {weekDayHeaders.map((d, i) => {
          const isWE = i === 0 || i === 6;
          return (
            <div
              key={d}
              className="py-3 text-center text-[10.5px]"
              style={{ fontWeight: 700, letterSpacing: "0.4px", color: isWE ? "#cbd5e1" : "#94a3b8" }}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 p-2 gap-1.5">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[130px] rounded-xl bg-gray-50/40" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayVets = vetsByDate[day] ?? [];
          const isToday = day === todayDate;
          const isSelected = day === selectedDate;
          const colIdx = (firstDayOfMonth + i) % 7;
          const isWeekend = colIdx === 0 || colIdx === 6;

          return (
            <motion.button
              key={day}
              onClick={() => onPickDate(day)}
              whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative text-left flex flex-col min-h-[130px] px-2 pb-2 rounded-xl transition-colors"
              style={{
                background: isToday ? "rgba(25,165,137,0.03)" : "#ffffff",
                border: isSelected
                  ? "1px solid rgba(25,165,137,0.55)"
                  : isToday
                    ? "1px solid rgba(25,165,137,0.20)"
                    : "1px solid rgba(0,0,0,0.04)",
                boxShadow: isSelected ? "0 2px 8px rgba(25,165,137,0.12)" : "0 1px 2px rgba(0,0,0,0.015)",
                paddingTop: 6,
              }}
            >
              <div className="flex items-start justify-between mb-1.5">
                <span
                  className="inline-flex items-center justify-center flex-shrink-0"
                  style={{
                    width: isToday ? 28 : 22, height: isToday ? 28 : 22, borderRadius: 9999,
                    background: isToday ? "#0d7c66" : "transparent",
                    color: isToday ? "#ffffff" : isWeekend ? "#94a3b8" : "#334155",
                    fontSize: 12, fontWeight: isToday ? 700 : 600, letterSpacing: "-0.3px", lineHeight: 1,
                  }}
                >
                  {day}
                </span>
                {dayVets.length > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[9.5px]"
                    style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700 }}
                  >
                    {dayVets.length}
                  </span>
                )}
              </div>

              {/* Vets on this day — photo + name pill (clickable) */}
              <div className="space-y-1">
                {dayVets.slice(0, 3).map(v => (
                  <div
                    key={v.id}
                    role={onClickVet ? "button" : undefined}
                    tabIndex={onClickVet ? 0 : -1}
                    onClick={onClickVet ? (e) => { e.stopPropagation(); onClickVet(v, day); } : undefined}
                    onKeyDown={onClickVet ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onClickVet(v, day); } } : undefined}
                    className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full transition-colors hover:brightness-110"
                    style={{ background: `${v.color}14`, cursor: onClickVet ? "pointer" : "default" }}
                    title={onClickVet ? `ดูรายละเอียด ${v.name}` : undefined}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                      <img src={v.photo} alt={v.name} className="w-full h-full object-cover" draggable={false} />
                    </div>
                    <span className="text-[10.5px] text-gray-700 truncate" style={{ fontWeight: 500, letterSpacing: "-0.1px" }}>{v.name.replace(/^(นพ\.|พญ\.) /, "")}</span>
                  </div>
                ))}
                {dayVets.length > 3 && (
                  <div className="text-[9.5px] text-gray-400 pl-[26px]" style={{ fontWeight: 600 }}>
                    + {dayVets.length - 3} แพทย์อื่น
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MonthDaySidebar — selected day details grouped by doctor
   ═══════════════════════════════════════════════════════ */
function MonthDaySidebar({ fullDate, dayIdx, allSlots, vets, onAdd, onRemoveSlot, onViewVet }: { fullDate: Date; dayIdx: number; allSlots: Slot[]; vets: Vet[]; onAdd: (vetId: string) => void; onRemoveSlot?: (slotId: number) => void; onViewVet?: (vet: Vet) => void }) {
  const FULL_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const dayName = FULL_DAYS[fullDate.getDay()];

  // Get slots for this day, grouped by vet (only when date is in mock week → dayIdx >= 0)
  const slotsByVet = vets.map(v => ({
    vet: v,
    slots: dayIdx >= 0
      ? allSlots.filter(s => s.vetId === v.id && s.day === dayIdx).sort((a, b) => a.start - b.start)
      : [],
  })).filter(g => g.slots.length > 0);

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 overflow-y-auto" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
          <Calendar className="w-4 h-4 text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
            วัน{dayName}ที่ {fullDate.getDate()} {MONTHS_SHORT_TH[fullDate.getMonth()]}
          </h3>
          <p className="text-[11px] text-gray-500">{slotsByVet.length} แพทย์ออกตรวจ</p>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {slotsByVet.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
            <p className="text-[12px]" style={{ fontWeight: 600 }}>ไม่มีตารางออกตรวจ</p>
            <p className="text-[10.5px] text-gray-400 mt-0.5">วันนี้ไม่มีแพทย์ออกตรวจ</p>
          </div>
        ) : (
          slotsByVet.map(({ vet: v, slots: vSlots }) => (
            <div key={v.id} className="rounded-2xl border border-gray-100 overflow-hidden">
              {/* Vet header — clickable to open detail */}
              <button
                type="button"
                onClick={() => onViewVet?.(v)}
                disabled={!onViewVet}
                className="w-full px-3 py-2.5 flex items-center gap-2.5 bg-gray-50/60 enabled:hover:bg-gray-100/60 transition-colors text-left"
                title={onViewVet ? `ดูรายละเอียดและจัดการ slot ของ ${v.name}` : undefined}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img src={v.photo} alt={v.name} className="w-full h-full object-cover" draggable={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>{v.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{v.specialty} · {vSlots.length} slot</p>
                </div>
                <span
                  onClick={(e) => { e.stopPropagation(); onAdd(v.id); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onAdd(v.id); } }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-transform active:scale-95 cursor-pointer"
                  style={{ background: v.color }}
                  title={`เพิ่ม slot ให้ ${v.name}`}
                  aria-label={`เพิ่ม slot ให้ ${v.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Slots list */}
              <ul className="divide-y divide-gray-100">
                {vSlots.map(s => {
                  const cfg = svc(s.serviceKey);
                  const full = s.booked >= s.capacity;
                  return (
                    <li key={s.id} className="px-3 py-2 flex items-center gap-2 group hover:bg-gray-50/40 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                      <span className="text-[11px] text-gray-500 flex-shrink-0" style={{ fontWeight: 600 }}>{fmt(s.start)}</span>
                      <span className="text-[11.5px] text-gray-700 truncate flex-1" style={{ fontWeight: 500 }}>{cfg.label}</span>
                      <span
                        className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0 inline-flex items-center gap-0.5"
                        style={{
                          background: full ? "rgba(234,88,12,0.10)" : `${cfg.color}12`,
                          color: full ? "#c2410c" : cfg.color,
                          fontWeight: 700,
                        }}
                        title={`จอง ${s.booked} จาก ${s.capacity} คิว${full ? " (เต็มแล้ว)" : ""}`}
                      >
                        <Users className="w-2 h-2" /> {s.booked}/{s.capacity}
                      </span>
                      {onRemoveSlot && (
                        <button
                          type="button"
                          onClick={() => {
                            if (s.booked > 0) {
                              if (!confirm(`Slot นี้มีการจอง ${s.booked} คิว — ยืนยันการลบ?`)) return;
                            }
                            onRemoveSlot(s.id);
                          }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                          title="ลบ slot"
                          aria-label="ลบ slot"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════
   DayList — hour rows for day view (matches Appointments)
   ═══════════════════════════════════════════════════════ */
function DayList({
  daySlots, vets, dayLabel, onPickHour, onClickSlot,
}: {
  daySlots: Slot[];
  vets: Vet[];
  dayLabel: { idx: number; label: string; date: string; month: string };
  onPickHour: (hour: number) => void;
  onClickSlot: (s: Slot) => void;
}) {
  const dayName = ({ "จ.": "จันทร์", "อ.": "อังคาร", "พ.": "พุธ", "พฤ.": "พฤหัสบดี", "ศ.": "ศุกร์", "ส.": "เสาร์", "อา.": "อาทิตย์" } as Record<string, string>)[dayLabel.label] ?? dayLabel.label;
  const vetById = (id: string) => vets.find(v => v.id === id);
  const uniqueVets = Array.from(new Set(daySlots.map(s => s.vetId))).length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-4 py-3 border-b border-gray-100/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
          <Calendar className="w-4 h-4 text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
            วัน{dayName}ที่ {dayLabel.date} {dayLabel.month} 2569
          </h3>
          <p className="text-[11px] text-gray-500">{daySlots.length} slot · {uniqueVets} แพทย์</p>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {HOURS.map(h => {
          const slotsInHour = daySlots.filter(s => Math.floor(s.start / 60) === h).sort((a, b) => a.start - b.start);
          // Group by vet — one pill per vet per hour
          type VetBucket = { vet: Vet | undefined; slots: Slot[]; start: number; end: number };
          const vetGroups = new Map<string, VetBucket>();
          slotsInHour.forEach(s => {
            const end = s.start + svc(s.serviceKey).duration;
            const existing = vetGroups.get(s.vetId);
            if (existing) {
              existing.slots.push(s);
              existing.start = Math.min(existing.start, s.start);
              existing.end = Math.max(existing.end, end);
            } else {
              vetGroups.set(s.vetId, { vet: vetById(s.vetId), slots: [s], start: s.start, end });
            }
          });
          const buckets = Array.from(vetGroups.values()).sort((a, b) => a.start - b.start);
          const hourStr = `${String(h).padStart(2, "0")}:00`;
          return (
            <div key={h} className="flex gap-3 px-4 py-2.5 transition-colors">
              <div className="text-[11px] text-gray-400 w-14 flex-shrink-0 pt-2" style={{ fontWeight: 600, letterSpacing: "-0.1px" }}>{hourStr}</div>
              {buckets.length > 0 ? (
                <div className="flex-1 flex flex-wrap items-center gap-1.5">
                  {buckets.map(b => {
                    const v = b.vet;
                    const totalBooked = b.slots.reduce((a, s) => a + s.booked, 0);
                    const totalCap = b.slots.reduce((a, s) => a + s.capacity, 0);
                    return (
                      <button
                        key={v?.id ?? "unknown"}
                        onClick={() => onClickSlot(b.slots[0])}
                        className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full transition-transform hover:scale-[1.02]"
                        style={{ background: `${v?.color ?? "#94a3b8"}14` }}
                        title={`${v?.name ?? ""} · ${fmt(b.start)}–${fmt(b.end)} · ${b.slots.length} slot · จอง ${totalBooked}/${totalCap}`}
                      >
                        {v && (
                          <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                            <img src={v.photo} alt={v.name} className="w-full h-full object-cover" draggable={false} />
                          </div>
                        )}
                        <span className="text-[10.5px] text-gray-700 truncate" style={{ fontWeight: 500, letterSpacing: "-0.1px" }}>
                          {v?.name.replace(/^(นพ\.|พญ\.) /, "") ?? "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <button
                  onClick={() => onPickHour(h)}
                  className="flex-1 h-10 rounded-xl text-[10.5px] text-gray-400 hover:bg-gray-50/60 hover:text-gray-600 transition-colors inline-flex items-center justify-center gap-1.5 group/empty"
                  style={{ fontWeight: 500 }}
                >
                  <Plus className="w-3 h-3 opacity-0 group-hover/empty:opacity-100 transition-opacity" /> เพิ่ม slot
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Vet-day detail popup (slot list with delete/edit)
   ═══════════════════════════════════════════════════════ */
function VetDayDetailModal({ vet, fullDate, slots, onClose, onRemove, onEdit, onAdd }: {
  vet: Vet;
  fullDate: Date;
  slots: Slot[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onEdit: () => void;
  onAdd: () => void;
}) {
  const FULL_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const dayName = FULL_DAYS[fullDate.getDay()];
  const sorted = [...slots].sort((a, b) => a.start - b.start);
  const totalSlots = sorted.length;
  const totalBooked = sorted.reduce((s, x) => s + x.booked, 0);
  const totalCapacity = sorted.reduce((s, x) => s + x.capacity, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100" style={{ background: `${vet.color}10` }}>
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white" style={{ boxShadow: `0 4px 12px ${vet.color}40` }}>
            <img src={vet.photo} alt={vet.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{vet.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{vet.specialty}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 grid grid-cols-3 gap-2 text-center border-b border-gray-100 bg-gray-50/50">
          <div>
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>วัน</p>
            <p className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>{dayName}</p>
            <p className="text-[10.5px] text-gray-500">{fullDate.getDate()} {MONTHS_SHORT_TH[fullDate.getMonth()]}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>Slot</p>
            <p className="text-[14px] text-gray-900" style={{ fontWeight: 800 }}>{totalSlots}</p>
            <p className="text-[10.5px] text-gray-500">รายการ</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>จอง</p>
            <p className="text-[14px] text-[#0d7c66]" style={{ fontWeight: 800 }}>{totalBooked}/{totalCapacity}</p>
            <p className="text-[10.5px] text-gray-500">คิว</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sorted.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-9 h-9 mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
              <p className="text-[12px]" style={{ fontWeight: 600 }}>ไม่มี slot ในวันนี้</p>
            </div>
          ) : sorted.map(s => {
            const cfg = svc(s.serviceKey);
            const full = s.booked >= s.capacity;
            return (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] text-gray-900" style={{ fontWeight: 700 }}>{fmt(s.start)}</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[11.5px] text-gray-700 truncate" style={{ fontWeight: 500 }}>{cfg.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{cfg.duration} นาที</p>
                </div>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 inline-flex items-center gap-0.5"
                  style={{
                    background: full ? "rgba(234,88,12,0.10)" : `${cfg.color}12`,
                    color: full ? "#c2410c" : cfg.color,
                    fontWeight: 700,
                  }}
                >
                  <Users className="w-2.5 h-2.5" /> {s.booked}/{s.capacity}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(s.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  title="ลบ slot"
                  aria-label="ลบ slot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-between gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-gray-200 text-[12.5px] text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
            ปิด
          </button>
          <div className="flex gap-2">
            {sorted.length > 0 && (
              <button onClick={onEdit} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 text-[12.5px] text-gray-700 bg-white hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
                <Check className="w-3.5 h-3.5" /> แก้ไข
              </button>
            )}
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white text-[12.5px] transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                border: "1px solid rgba(253,186,116,0.85)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 14px rgba(234,88,12,0.30)",
                fontWeight: 700,
              }}
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่ม Slot
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
