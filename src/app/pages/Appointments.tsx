import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, Calendar, Stethoscope, Syringe, Scissors, Home } from "lucide-react";
import { AddAppointmentModal } from "../components/AddAppointmentModal";
import { useSnackbar } from "../contexts/SnackbarContext";

const DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const FULL_DAYS_TH = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
const MONTHS_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];

type AppointmentType = "การรักษา" | "วัคซีน" | "อาบน้ำ" | "ฝากเลี้ยง";

interface Appointment {
  id: number; time: string; petName: string; owner: string;
  type: AppointmentType; vet: string; day: number; status: string;
}

const appointments: Appointment[] = [
  { id: 1, time: "09:00", petName: "บัดดี้", owner: "สมศักดิ์ ใจดี", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 17, status: "ยืนยันแล้ว" },
  { id: 2, time: "09:30", petName: "ลูน่า", owner: "วรรณา ศรีสุข", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 17, status: "ยืนยันแล้ว" },
  { id: 3, time: "10:00", petName: "แม็กซ์", owner: "ประพันธ์ มงคล", type: "อาบน้ำ", vet: "เจ้าหน้าที่", day: 17, status: "ยืนยันแล้ว" },
  { id: 4, time: "11:00", petName: "โคโค่", owner: "อรอนงค์ พรมเสน", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 17, status: "รอยืนยัน" },
  { id: 5, time: "13:00", petName: "ชาร์ลี", owner: "ธีรพล วงศ์สุวรรณ", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 17, status: "ยืนยันแล้ว" },
  { id: 6, time: "14:00", petName: "เบลล่า", owner: "ปรียาภรณ์ ทองดี", type: "ฝากเลี้ยง", vet: "เจ้าหน้าที่", day: 17, status: "ยืนยันแล้ว" },
  { id: 7, time: "09:00", petName: "ร็อคกี้", owner: "สมศักดิ์ ใจดี", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 15, status: "ยืนยันแล้ว" },
  { id: 8, time: "10:30", petName: "เดซี่", owner: "ธีรพล วงศ์สุวรรณ", type: "อาบน้ำ", vet: "เจ้าหน้าที่", day: 16, status: "ยืนยันแล้ว" },
  { id: 9, time: "15:00", petName: "โมจิ", owner: "ประพันธ์ มงคล", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 14, status: "ยืนยันแล้ว" },
  { id: 10, time: "09:00", petName: "บัดดี้", owner: "สมศักดิ์ ใจดี", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 22, status: "กำหนดการ" },
  { id: 11, time: "14:30", petName: "ลูน่า", owner: "วรรณา ศรีสุข", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 27, status: "กำหนดการ" },
];

const typeConfig: Record<AppointmentType, { color: string; bg: string; chipBg: string; chipText: string; icon: any; grad: string }> = {
  "การรักษา": { color: "#0284c7", bg: "rgba(14,165,233,0.10)",  chipBg: "rgba(14,165,233,0.10)",  chipText: "#0284c7", icon: Stethoscope, grad: "linear-gradient(135deg, #38bdf8, #0284c7)" },
  "วัคซีน":   { color: "#0d7c66", bg: "rgba(25,165,137,0.10)",  chipBg: "rgba(25,165,137,0.10)",  chipText: "#0d7c66", icon: Syringe,     grad: "linear-gradient(135deg, #34d399, #059669)" },
  "อาบน้ำ":   { color: "#7c3aed", bg: "rgba(139,92,246,0.10)",  chipBg: "rgba(139,92,246,0.10)",  chipText: "#7c3aed", icon: Scissors,    grad: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
  "ฝากเลี้ยง": { color: "#d97706", bg: "rgba(251,146,60,0.10)",  chipBg: "rgba(251,146,60,0.10)",  chipText: "#d97706", icon: Home,        grad: "linear-gradient(135deg, #fbbf24, #d97706)" },
};

const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

export function Appointments() {
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showNewModal, setShowNewModal] = useState(false);
  const { showSnackbar } = useSnackbar();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const now = new Date();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;

  const handlePrevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setCurrentDate(d);
    setSelectedDay(1);
  };
  const handleNextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setCurrentDate(d);
    setSelectedDay(1);
  };

  // Compute week containing selectedDay (Sun–Sat)
  const weekDayOffset = new Date(year, month, selectedDay).getDay();
  const weekStart = selectedDay - weekDayOffset;
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i);

  const getApptsByDay = (day: number) => appointments.filter(a => a.day === day);
  const todayAppts = getApptsByDay(selectedDay);

  const viewLabels = { day: "รายวัน", week: "รายสัปดาห์", month: "รายเดือน" };

  // Reusable: Right panel showing selected day's appointments
  const selectedDayPanel = (
    <motion.section
      key={`day-panel-${selectedDay}`}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden lg:sticky lg:top-0"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
    >
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
          <Calendar className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
              {selectedDay} {MONTHS_TH[month]}
            </h3>
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
              style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700, border: "1px solid rgba(25,165,137,0.20)" }}
            >
              {todayAppts.length} รายการ
            </span>
          </div>
          <p className="text-[11px] text-gray-500">วัน{FULL_DAYS_TH[new Date(year, month, selectedDay).getDay()]} · คลิกเพื่อดู</p>
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto">
        {todayAppts.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-[13px] text-gray-500" style={{ fontWeight: 600 }}>ไม่มีนัดหมายในวันนี้</p>
            <p className="text-[11px] text-gray-400 mt-0.5">กด "นัดหมายใหม่" เพื่อเพิ่ม</p>
          </div>
        ) : (
          todayAppts
            .slice()
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(appt => {
              const cfg = typeConfig[appt.type];
              const Ico = cfg.icon;
              const isPending = appt.status === "รอยืนยัน";
              return (
                <button
                  key={appt.id}
                  className="w-full text-left rounded-2xl transition-all hover:-translate-y-0.5 group relative overflow-hidden"
                  style={{ background: "#ffffff", border: `1.5px solid ${cfg.color}25`, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                >
                  <div className="px-3 py-2.5 flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                      style={{ background: cfg.grad, boxShadow: `0 2px 6px ${cfg.color}55` }}
                    >
                      <Ico className="w-4 h-4" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{appt.petName}</span>
                        <span
                          className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: cfg.chipBg, color: cfg.chipText, fontWeight: 700 }}
                        >
                          {appt.type}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{appt.owner}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[12.5px] text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>{appt.time}</div>
                      <span
                        className="inline-block text-[9.5px] px-1.5 py-0.5 rounded-full mt-0.5"
                        style={{
                          background: isPending ? "rgba(245,158,11,0.10)" : "rgba(16,185,129,0.10)",
                          color: isPending ? "#b45309" : "#059669",
                          fontWeight: 700,
                        }}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
        )}
      </div>
    </motion.section>
  );

  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: "#FEFBF8" }}>
      {/* ─── HERO HEADER ─── */}
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
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                นัดหมาย
              </h1>
              <p className="text-white/70" style={{ fontSize: 12, letterSpacing: "0.1px" }}>{appointments.length} นัดในเดือนนี้</p>
            </div>
          </div>

          {/* Bottom: Month nav + View toggle + Add */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Month nav — solid white */}
            <div
              className="inline-flex items-center gap-0.5 px-0.5 rounded-full bg-white"
              style={{
                height: 34,
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <button onClick={handlePrevMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span
                className="px-2 text-gray-900"
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "-0.2px",
                }}
              >
                {MONTHS_TH[month]} <span className="text-gray-500">{year + 543}</span>
              </span>
              <button onClick={handleNextMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View toggle — glass segmented */}
            <div
              className="inline-flex items-center p-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              {(["day","week","month"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-1.5 rounded-full text-[12px] transition-all"
                  style={{
                    background: view === v ? "#ffffff" : "transparent",
                    color: view === v ? "#0d7c66" : "rgba(255,255,255,0.85)",
                    fontWeight: view === v ? 700 : 500,
                    boxShadow: view === v ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {viewLabels[v]}
                </button>
              ))}
            </div>

            {/* Add button — orange */}
            <button
              onClick={() => setShowNewModal(true)}
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
              <Plus className="w-3.5 h-3.5" /> นัดหมายใหม่
            </button>
          </div>
        </div>
      </motion.section>

      {/* ─── Calendar ─── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pb-4">
        {view === "month" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
          <section
            className="relative bg-white rounded-3xl overflow-hidden"
            style={{
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 16px 48px rgba(0,0,0,0.06)",
            }}
          >
            {/* Subtle ambient highlight at top */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/4 right-1/4 h-40 opacity-50"
              style={{ background: "radial-gradient(ellipse at center, rgba(25,165,137,0.08) 0%, transparent 70%)" }}
            />

            <div className="overflow-x-auto relative">
              <div className="min-w-[720px]">
                {/* Day headers */}
                <div
                  className="grid grid-cols-7 relative"
                  style={{
                    background: "linear-gradient(180deg, rgba(254,251,248,0.7) 0%, #ffffff 100%)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  {DAYS_TH.map((d, i) => {
                    const isWE = i === 0 || i === 6;
                    return (
                      <div
                        key={d}
                        className="py-3.5 text-center text-[11px] relative"
                        style={{
                          fontWeight: 800,
                          letterSpacing: "0.6px",
                          textTransform: "uppercase",
                          color: isWE ? "#fb7185" : "#94a3b8",
                        }}
                      >
                        {d}
                      </div>
                    );
                  })}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 p-2 gap-2" style={{ background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)" }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[118px] rounded-xl"
                      style={{
                        background: "repeating-linear-gradient(135deg, rgba(0,0,0,0.015) 0 6px, transparent 6px 14px)",
                      }}
                    />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayAppts = getApptsByDay(day);
                    const isToday = isCurrentMonth && day === now.getDate();
                    const isSelected = day === selectedDay;
                    const colIdx = (firstDay + i) % 7;
                    const isWeekend = colIdx === 0 || colIdx === 6;
                    const isBusy = dayAppts.length >= 3;

                    return (
                      <motion.button
                        key={day}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        onClick={() => setSelectedDay(day)}
                        className="relative text-left min-h-[118px] p-2 cursor-pointer rounded-xl overflow-hidden group"
                        style={{
                          background: isToday
                            ? "linear-gradient(155deg, #ffffff 0%, rgba(25,165,137,0.04) 100%)"
                            : isSelected
                              ? "linear-gradient(155deg, rgba(25,165,137,0.08) 0%, rgba(25,165,137,0.02) 100%)"
                              : isWeekend
                                ? "linear-gradient(155deg, #ffffff 0%, rgba(251,113,133,0.025) 100%)"
                                : "#ffffff",
                          border: isToday
                            ? "1.5px solid rgba(25,165,137,0.50)"
                            : isSelected
                              ? "1.5px solid rgba(25,165,137,0.35)"
                              : "1px solid rgba(0,0,0,0.05)",
                          boxShadow: isToday
                            ? "0 0 0 4px rgba(25,165,137,0.10), 0 8px 24px rgba(25,165,137,0.20), inset 0 1px 0 rgba(255,255,255,0.80)"
                            : isSelected
                              ? "0 4px 14px rgba(25,165,137,0.15), inset 0 1px 0 rgba(255,255,255,0.80)"
                              : "0 1px 2px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.50)",
                        }}
                      >
                        {/* Today corner accent */}
                        {isToday && (
                          <span
                            aria-hidden
                            className="absolute -top-px -right-px"
                            style={{
                              width: 32,
                              height: 32,
                              background: "linear-gradient(225deg, rgba(25,165,137,0.30) 0%, transparent 60%)",
                              borderTopRightRadius: 11,
                            }}
                          />
                        )}

                        {/* Busy indicator — vertical color strip on left */}
                        {isBusy && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                            style={{ background: "linear-gradient(180deg, #fb923c, #ea580c)" }}
                          />
                        )}

                        <div className="flex items-center justify-between mb-2 relative">
                          <span
                            className="inline-flex items-center justify-center transition-all"
                            style={{
                              minWidth: isToday ? 32 : 26,
                              height: isToday ? 32 : 26,
                              padding: "0 8px",
                              borderRadius: 9999,
                              background: isToday
                                ? "linear-gradient(135deg, #19a589, #0d7c66)"
                                : isSelected
                                  ? "rgba(25,165,137,0.15)"
                                  : "transparent",
                              color: isToday ? "#ffffff" : isWeekend ? "#fb7185" : "#0f172a",
                              fontSize: isToday ? 14.5 : 13.5,
                              fontWeight: 800,
                              letterSpacing: "-0.3px",
                              boxShadow: isToday
                                ? "0 4px 12px rgba(25,165,137,0.50), inset 0 1px 0 rgba(255,255,255,0.35)"
                                : "none",
                              textShadow: isToday ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                            }}
                          >
                            {day}
                          </span>
                          {dayAppts.length > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 600, damping: 25, delay: 0.05 + i * 0.005 }}
                              className="inline-flex items-center justify-center gap-0.5 min-w-[20px] h-[18px] px-1.5 rounded-full text-[9.5px]"
                              style={{
                                background: isBusy
                                  ? "linear-gradient(135deg, #fb923c, #ea580c)"
                                  : "linear-gradient(135deg, #34d399, #0d7c66)",
                                color: "#ffffff",
                                fontWeight: 800,
                                boxShadow: isBusy
                                  ? "0 2px 8px rgba(234,88,12,0.40), inset 0 1px 0 rgba(255,255,255,0.30)"
                                  : "0 2px 8px rgba(25,165,137,0.40), inset 0 1px 0 rgba(255,255,255,0.30)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                              }}
                            >
                              {dayAppts.length}
                            </motion.span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {dayAppts.slice(0, 2).map((appt, ai) => {
                            const cfg = typeConfig[appt.type];
                            const initial = appt.petName.charAt(0);
                            return (
                              <motion.div
                                key={appt.id}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25, delay: 0.05 + ai * 0.04 }}
                                className="relative pl-0.5 pr-1.5 py-0.5 rounded-full flex items-center gap-1.5 overflow-hidden transition-all group-hover:shadow-sm"
                                style={{
                                  background: `linear-gradient(135deg, ${cfg.color}10 0%, ${cfg.color}05 100%)`,
                                  border: `1px solid ${cfg.color}20`,
                                }}
                              >
                                <span
                                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-white flex-shrink-0 text-[9.5px]"
                                  style={{
                                    background: cfg.grad,
                                    boxShadow: `0 1px 4px ${cfg.color}55, inset 0 1px 0 rgba(255,255,255,0.40)`,
                                    fontWeight: 800,
                                    textShadow: "0 1px 1px rgba(0,0,0,0.15)",
                                  }}
                                >
                                  {initial}
                                </span>
                                <span className="text-[9.5px] flex-shrink-0" style={{ fontWeight: 800, color: cfg.color, letterSpacing: "-0.1px" }}>{appt.time}</span>
                                <span className="text-[10px] text-gray-700 truncate" style={{ fontWeight: 600 }}>{appt.petName}</span>
                              </motion.div>
                            );
                          })}
                          {dayAppts.length > 2 && (
                            <div
                              className="text-[9.5px] text-[#0d7c66] inline-flex items-center gap-0.5 pl-1"
                              style={{ fontWeight: 700 }}
                            >
                              <span className="w-1 h-1 rounded-full bg-[#0d7c66]" />
                              + {dayAppts.length - 2} อื่นๆ
                            </div>
                          )}
                        </div>

                        {/* Today badge — bottom-right */}
                        {isToday && (
                          <motion.span
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 600, damping: 22, delay: 0.15 }}
                            className="absolute bottom-1.5 right-1.5 text-[8.5px] text-white px-1.5 rounded-full inline-flex items-center gap-0.5"
                            style={{
                              background: "linear-gradient(135deg, #34d399, #0d7c66)",
                              fontWeight: 800,
                              letterSpacing: "0.3px",
                              lineHeight: "15px",
                              boxShadow: "0 3px 10px rgba(25,165,137,0.45), inset 0 1px 0 rgba(255,255,255,0.30)",
                              textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/85" />
                            วันนี้
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}

                  {/* Trailing empty cells to complete the row */}
                  {(() => {
                    const totalCells = firstDay + daysInMonth;
                    const remainder = totalCells % 7;
                    if (remainder === 0) return null;
                    return Array.from({ length: 7 - remainder }).map((_, i) => (
                      <div
                        key={`trail-${i}`}
                        className="min-h-[118px] rounded-xl"
                        style={{
                          background: "repeating-linear-gradient(135deg, rgba(0,0,0,0.015) 0 6px, transparent 6px 14px)",
                        }}
                      />
                    ));
                  })()}
                </div>
              </div>
            </div>
          </section>

          {selectedDayPanel}
          </div>
        )}

        {view === "day" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
          <section
            className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
          >
            <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                <Calendar className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
                  วัน{FULL_DAYS_TH[new Date(year, month, selectedDay).getDay()]}ที่ {selectedDay} {MONTHS_TH[month]} {year + 543}
                </h3>
                <p className="text-[11px] text-gray-500">{todayAppts.length} นัดหมาย</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {HOURS.map(hour => {
                const appt = todayAppts.find(a => a.time === hour);
                return (
                  <div key={hour} className="flex gap-3 px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                    <div className="text-[11px] text-gray-400 w-14 flex-shrink-0 pt-1.5" style={{ fontWeight: 700 }}>{hour}</div>
                    {appt ? (
                      <button
                        className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all hover:-translate-y-0.5"
                        style={{ background: typeConfig[appt.type].bg, border: `1px solid ${typeConfig[appt.type].color}33` }}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: typeConfig[appt.type].grad, boxShadow: `0 2px 6px ${typeConfig[appt.type].color}55` }}>
                          {(() => {
                            const Ico = typeConfig[appt.type].icon;
                            return <Ico className="w-4 h-4" strokeWidth={2.2} />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{appt.petName}</div>
                          <div className="text-[10.5px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{appt.owner} · {appt.vet}</div>
                        </div>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.7)", color: typeConfig[appt.type].color, fontWeight: 700 }}
                        >
                          {appt.type}
                        </span>
                      </button>
                    ) : (
                      <div className="flex-1 h-10 rounded-xl border border-dashed border-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          {selectedDayPanel}
          </div>
        )}

        {view === "week" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
          <section
            className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
          >
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-8 border-b border-gray-100/80 bg-gray-50/60">
                  <div className="p-3 border-r border-gray-100" />
                  {weekDays.map((day, i) => {
                    const isToday = isCurrentMonth && day === now.getDate();
                    return (
                      <div key={day} className="p-2.5 text-center border-r border-gray-100 last:border-r-0">
                        <div className="text-[10px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                          {DAYS_TH[i % 7]}
                        </div>
                        <div
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full mt-1 text-[12.5px]"
                          style={{
                            background: isToday ? "linear-gradient(135deg, #19a589, #0d7c66)" : "transparent",
                            color: isToday ? "#ffffff" : "#374151",
                            fontWeight: isToday ? 800 : 600,
                            boxShadow: isToday ? "0 2px 6px rgba(25,165,137,0.40)" : "none",
                          }}
                        >
                          {day > 0 && day <= daysInMonth ? day : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  {HOURS.map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b border-gray-50 last:border-b-0">
                      <div className="px-3 py-2 text-[10.5px] text-gray-400 border-r border-gray-100 flex-shrink-0" style={{ fontWeight: 700 }}>{hour}</div>
                      {weekDays.map(day => {
                        const appt = appointments.find(a => a.day === day && a.time === hour);
                        return (
                          <div key={day} className="border-r border-gray-50 last:border-r-0 p-1 min-h-[44px]">
                            {appt && (
                              <div
                                className="text-[10.5px] p-1.5 rounded-md truncate"
                                style={{
                                  background: typeConfig[appt.type].chipBg,
                                  color: typeConfig[appt.type].chipText,
                                  fontWeight: 700,
                                  borderLeft: `2px solid ${typeConfig[appt.type].color}`,
                                }}
                              >
                                {appt.petName}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {selectedDayPanel}
          </div>
        )}

      </div>

      {/* New Appointment Modal */}
      <AddAppointmentModal open={showNewModal} onClose={() => setShowNewModal(false)} onSave={() => showSnackbar("success", "บันทึกนัดหมายสำเร็จแล้ว")} />
    </div>
  );
}
