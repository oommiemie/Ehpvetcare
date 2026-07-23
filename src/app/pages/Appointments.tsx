import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, Calendar, Stethoscope, Syringe, Scissors, Home, X, Clock, User, Phone, FileText, Edit3, Printer, Trash2, Pencil, Check, SlidersHorizontal } from "lucide-react";
import { AddAppointmentModal, type ApptSaveResult, type EditingAppt } from "../components/AddAppointmentModal";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { useLang } from "../contexts/LanguageContext";
import { heroPillStyle } from "../utils/heroFilter";
import { useAppointments, type Appointment, type AppointmentType } from "../contexts/AppointmentsContext";

const DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const FULL_DAYS_TH = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
const MONTHS_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];


const typeConfig: Record<AppointmentType, { color: string; bg: string; chipBg: string; chipText: string; icon: any; grad: string }> = {
  "การรักษา": { color: "#0284c7", bg: "rgba(14,165,233,0.10)",  chipBg: "rgba(14,165,233,0.10)",  chipText: "#0284c7", icon: Stethoscope, grad: "linear-gradient(135deg, #38bdf8, #0284c7)" },
  "วัคซีน":   { color: "var(--brand-dark)", bg: "color-mix(in srgb, var(--brand) 10%, transparent)",  chipBg: "color-mix(in srgb, var(--brand) 10%, transparent)",  chipText: "var(--brand-dark)", icon: Syringe,     grad: "linear-gradient(135deg, #34d399, #059669)" },
  "อาบน้ำ":   { color: "#7c3aed", bg: "rgba(139,92,246,0.10)",  chipBg: "rgba(139,92,246,0.10)",  chipText: "#7c3aed", icon: Scissors,    grad: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
  "ฝากเลี้ยง": { color: "#d97706", bg: "rgba(251,146,60,0.10)",  chipBg: "rgba(251,146,60,0.10)",  chipText: "#d97706", icon: Home,        grad: "linear-gradient(135deg, #fbbf24, #d97706)" },
};

const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

// Gantt (week view) geometry — mirrors SlotBuilder
const HOUR_NUMS = Array.from({ length: 11 }, (_, i) => 8 + i); // 08..18
const GRID_START = 8 * 60; // 08:00 in minutes
const HOUR_PX = 64;
const PILL_H = 24;

const ALL_TYPES: AppointmentType[] = ["การรักษา", "วัคซีน", "อาบน้ำ", "ฝากเลี้ยง"];

export function Appointments() {
  const { t } = useLang();
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<Set<AppointmentType>>(new Set(ALL_TYPES));
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();

  const toggleType = (t: AppointmentType) => setTypeFilter(prev => {
    const n = new Set(prev);
    n.has(t) ? n.delete(t) : n.add(t);
    return n.size === 0 ? new Set(ALL_TYPES) : n;
  });
  const allTypesSelected = typeFilter.size === ALL_TYPES.length;

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

  const getApptsByDay = (day: number) => appointments.filter(a => a.day === day && typeFilter.has(a.type));
  const todayAppts = getApptsByDay(selectedDay);

  // ── เพิ่ม / แก้ไข / ลบ ──
  const handleSave = (r: ApptSaveResult) => {
    if (editingAppt) {
      // อัปเดตรายการเดิม (ห้ามสร้างใหม่)
      updateAppointment(editingAppt.id, { petName: r.petName, owner: r.owner, photo: r.photo, vet: r.vetName, time: r.time, day: r.day, timeNote: r.timeNote });
      showSnackbar("update", "แก้ไขนัดหมายเรียบร้อยแล้ว");
    } else {
      addAppointment({
        time: r.time, petName: r.petName, owner: r.owner,
        type: editingAppt?.type ?? "การรักษา", vet: r.vetName, day: r.day,
        status: "กำหนดการ", photo: r.photo, timeNote: r.timeNote,
      });
      showSnackbar("success", "บันทึกนัดหมายสำเร็จแล้ว");
    }
  };

  const openEdit = (appt: Appointment) => {
    setDetailAppt(null);
    setEditingAppt(appt);
  };

  const handleDelete = async (appt: Appointment) => {
    const ok = await confirm({
      title: "ลบนัดหมาย",
      description: `ลบนัดของ "${appt.petName}" ${appt.time ? `เวลา ${appt.time} น.` : "(ไม่ระบุเวลา)"} ออกจากตาราง?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    deleteAppointment(appt.id);
    if (detailAppt?.id === appt.id) setDetailAppt(null);
    showSnackbar("delete", "ลบนัดหมายแล้ว");
  };

  // map นัดเดิม → prop สำหรับ prefill โมดัล
  const editingProp: EditingAppt | null = editingAppt
    ? { petName: editingAppt.petName, owner: editingAppt.owner, vetName: editingAppt.vet, time: editingAppt.time, day: editingAppt.day, month, year }
    : null;

  const viewLabels = { day: "รายวัน", week: "รายสัปดาห์", month: "รายเดือน" };

  // Group the selected day's appointments by vet (mirrors SlotBuilder's by-doctor sidebar)
  const apptsByVet = (() => {
    const m = new Map<string, Appointment[]>();
    todayAppts
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach(a => {
        if (!m.has(a.vet)) m.set(a.vet, []);
        m.get(a.vet)!.push(a);
      });
    return Array.from(m.entries());
  })();

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-hidden" style={{ background: "#FEFBF8" }}>
      {/* ─── HERO HEADER ─── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl flex-shrink-0"
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
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: "calc(22px * var(--fs))", letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                {t("appointments.title")}
              </h1>
              <p className="text-white/70" style={{ fontSize: "calc(12px * var(--fs))", letterSpacing: "0.1px" }}>{appointments.length} นัดในเดือนนี้</p>
            </div>

            {/* Add button — top-right like Stock */}
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 flex-shrink-0 text-white"
              style={{
                background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
                border: "1px solid var(--hero-btn-border)",
                boxShadow:
                  "var(--hero-btn-shadow)",
                fontWeight: 600,
                
              }}
            >
              <Plus className="w-3.5 h-3.5" /> นัดหมายใหม่
            </button>
          </div>

          {/* Bottom: Month nav + View toggle + Add */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Month nav — solid white, with date picker */}
            <div
              className="relative inline-flex items-center gap-0.5 px-0.5 rounded-full bg-white"
              style={{
                height: 34,
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <button onClick={handlePrevMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDateMenuOpen(o => !o)}
                className="px-2 text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                style={{ height: 28, fontSize: "calc(13px * var(--fs))", fontWeight: 800, letterSpacing: "-0.2px" }}
              >
                {MONTHS_TH[month]} <span className="text-gray-500">{year + 543}</span>
              </button>
              <button onClick={handleNextMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Date picker dropdown */}
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
                      style={{ width: 280, boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
                    >
                      <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
                        <button onClick={handlePrevMonth} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
                        <p className="text-[12.5px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{MONTHS_TH[month]} <span className="text-gray-500">{year + 543}</span></p>
                        <button onClick={handleNextMonth} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-7 px-2 pt-2">
                        {DAYS_TH.map((d, i) => {
                          const isWE = i === 0 || i === 6;
                          return <div key={d} className="py-1 text-center text-[9.5px]" style={{ fontWeight: 700, letterSpacing: "0.4px", color: isWE ? "#cbd5e1" : "#94a3b8" }}>{d}</div>;
                        })}
                      </div>
                      <div className="grid grid-cols-7 gap-0.5 px-2 pb-2.5">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`pre-${i}`} className="h-8" />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const isToday = isCurrentMonth && day === now.getDate();
                          const isSel = day === selectedDay;
                          const colIdx = (firstDay + i) % 7;
                          const isWE = colIdx === 0 || colIdx === 6;
                          return (
                            <button
                              key={day}
                              onClick={() => { setSelectedDay(day); setDateMenuOpen(false); }}
                              className="h-8 rounded-full text-[11.5px] transition-colors hover:bg-gray-100"
                              style={{
                                background: isToday ? "var(--brand-dark)" : isSel ? "color-mix(in srgb, var(--brand-dark) 12%, transparent)" : "transparent",
                                color: isToday ? "#ffffff" : isSel ? "var(--brand-dark)" : isWE ? "#94a3b8" : "#334155",
                                fontWeight: isToday || isSel ? 700 : 500,
                              }}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* View toggle — glass segmented */}
            <div
              className="relative inline-flex items-center p-0.5 rounded-full"
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
                  className="relative px-3 py-1.5 rounded-full text-[12px] transition-colors"
                  style={{
                    color: view === v ? "var(--brand-dark)" : "rgba(255,255,255,0.85)",
                    fontWeight: view === v ? 700 : 500,
                    zIndex: 1,
                  }}
                >
                  {view === v && (
                    <motion.span
                      layoutId="appt-view-indicator"
                      className="absolute inset-0 rounded-full bg-white"
                      style={{
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        zIndex: -1,
                      }}
                      transition={{ type: "spring", stiffness: 480, damping: 32 }}
                    />
                  )}
                  <span className="relative">{viewLabels[v]}</span>
                </button>
              ))}
            </div>

            {/* Type filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setTypeMenuOpen(o => !o)}
                className="inline-flex items-center gap-1.5 px-3 rounded-full transition-opacity hover:opacity-90"
                style={{ height: 34, ...heroPillStyle(!allTypesSelected) }}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="text-[12px]" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>
                  {allTypesSelected ? "ทุกประเภท" : `${typeFilter.size} ประเภท`}
                </span>
              </button>

              <AnimatePresence>
                {typeMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setTypeMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl overflow-hidden"
                      style={{ width: 220, boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
                    >
                      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>กรองประเภท</p>
                        <button onClick={() => setTypeFilter(new Set(ALL_TYPES))} className="text-[10.5px] text-(--brand-dark) hover:underline" style={{ fontWeight: 700 }}>เลือกทั้งหมด</button>
                      </div>
                      <div className="p-2">
                        {ALL_TYPES.map(t => {
                          const cfg = typeConfig[t];
                          const Ico = cfg.icon;
                          const on = typeFilter.has(t);
                          return (
                            <button
                              key={t}
                              onClick={() => toggleType(t)}
                              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${cfg.color} 7.8%, transparent)` }}>
                                <Ico className="w-3.5 h-3.5" style={{ color: cfg.color }} strokeWidth={2.2} />
                              </span>
                              <span className="text-[12px] text-gray-900 flex-1" style={{ fontWeight: on ? 700 : 500 }}>{t}</span>
                              <div className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                                style={{ background: on ? cfg.color : "#ffffff", border: on ? "none" : "1.5px solid #d1d5db" }}>
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

          </div>
        </div>
      </motion.section>

      {/* ─── MAIN: 2-column grid — calendar left, day sidebar right ─── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-stretch min-h-0">

        {/* CENTER — CALENDAR */}
        <main
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col min-w-0"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
        >

        {view === "month" ? (
          <div className="flex-1 overflow-auto">
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
                        className="py-3 text-center text-[10.5px] relative"
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

                {/* Calendar grid */}
                <div className="grid grid-cols-7 p-2 gap-1.5" style={{ background: "#ffffff" }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[118px] rounded-xl bg-gray-50/40"
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
                        whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
                        whileTap={{ scale: 0.985 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        onClick={() => setSelectedDay(day)}
                        className="relative text-left flex flex-col min-h-[118px] px-2 pb-2 cursor-pointer rounded-xl overflow-hidden group transition-colors duration-200"
                        style={{
                          background: isToday
                            ? "color-mix(in srgb, var(--brand) 3%, transparent)"
                            : "#ffffff",
                          border: isSelected
                            ? "1px solid color-mix(in srgb, var(--brand) 55%, transparent)"
                            : isToday
                              ? "1px solid color-mix(in srgb, var(--brand) 20%, transparent)"
                              : "1px solid rgba(0,0,0,0.04)",
                          boxShadow: isSelected
                            ? "0 2px 8px color-mix(in srgb, var(--brand) 12%, transparent)"
                            : "0 1px 2px rgba(0,0,0,0.015)",
                          paddingTop: 6,
                        }}
                      >
                        <div className="flex items-start justify-between mb-1.5 relative">
                          <span
                            className="inline-flex items-center justify-center transition-colors flex-shrink-0"
                            style={{
                              width: isToday ? 28 : 22,
                              height: isToday ? 28 : 22,
                              borderRadius: 9999,
                              background: isToday ? "var(--brand-dark)" : "transparent",
                              color: isToday
                                ? "#ffffff"
                                : isWeekend
                                  ? "#94a3b8"
                                  : "#334155",
                              fontSize: "calc(12px * var(--fs))",
                              fontWeight: isToday ? 700 : 600,
                              letterSpacing: "-0.3px",
                              lineHeight: 1,
                            }}
                          >
                            {day}
                          </span>
                          {dayAppts.length > 0 && (
                            <span
                              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[9.5px]"
                              style={{
                                background: isBusy ? "rgba(234,88,12,0.10)" : "color-mix(in srgb, var(--brand) 10%, transparent)",
                                color: isBusy ? "#c2410c" : "var(--brand-dark)",
                                fontWeight: 700,
                              }}
                            >
                              {dayAppts.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {dayAppts.slice(0, 2).map((appt) => {
                            const cfg = typeConfig[appt.type];
                            return (
                              <div
                                key={appt.id}
                                className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full"
                                style={{ background: `color-mix(in srgb, ${cfg.color} 7.8%, transparent)` }}
                              >
                                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                                  <img src={appt.photo} alt={appt.petName} className="w-full h-full object-cover" draggable={false} />
                                </div>
                                <span className="text-[10.5px] text-gray-700 truncate" style={{ fontWeight: 500, letterSpacing: "-0.1px" }}>{appt.petName}</span>
                              </div>
                            );
                          })}
                          {dayAppts.length > 2 && (
                            <div
                              className="text-[9.5px] text-gray-400 pl-[26px]"
                              style={{ fontWeight: 600 }}
                            >
                              + {dayAppts.length - 2} อื่นๆ
                            </div>
                          )}
                        </div>
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
                        className="min-h-[118px] rounded-xl bg-gray-50/40"
                      />
                    ));
                  })()}
                </div>
            </div>
          </div>
        ) : view === "day" ? (
          <div className="flex-1 overflow-auto">
            <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                <Calendar className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>
                  วัน{FULL_DAYS_TH[new Date(year, month, selectedDay).getDay()]}ที่ {selectedDay} {MONTHS_TH[month]} {year + 543}
                </h3>
                <p className="text-[11px] text-gray-500">{todayAppts.length} นัดหมาย</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {/* แถวนัดที่ไม่ระบุเวลา — แสดงไว้บนสุด */}
              {(() => {
                const untimed = todayAppts.filter(a => !a.time);
                if (untimed.length === 0) return null;
                return (
                  <div className="flex gap-3 px-4 py-2.5 bg-[#f7fdfb]">
                    <div className="text-[11px] text-(--brand-dark) w-14 flex-shrink-0 pt-2" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>ไม่ระบุ</div>
                    <div className="flex-1 flex flex-wrap items-center gap-1.5">
                      {untimed.map(appt => {
                        const cfg = typeConfig[appt.type];
                        return (
                          <button
                            key={appt.id}
                            onClick={() => setDetailAppt(appt)}
                            className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full transition-transform hover:scale-[1.02]"
                            style={{ background: `color-mix(in srgb, ${cfg.color} 7.8%, transparent)` }}
                            title={`${appt.petName} · ไม่ระบุเวลา · ${appt.type}`}
                          >
                            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                              <img src={appt.photo} alt={appt.petName} className="w-full h-full object-cover" draggable={false} />
                            </div>
                            <span className="text-[10.5px] text-gray-700 truncate" style={{ fontWeight: 500, letterSpacing: "-0.1px" }}>{appt.petName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {HOURS.map(hour => {
                const hourPrefix = hour.slice(0, 3); // "08:" matches 08:00–08:59
                const appts = todayAppts.filter(a => a.time.startsWith(hourPrefix)).sort((a, b) => a.time.localeCompare(b.time));
                return (
                  <div key={hour} className="flex gap-3 px-4 py-2.5 transition-colors">
                    <div className="text-[11px] text-gray-400 w-14 flex-shrink-0 pt-2" style={{ fontWeight: 600, letterSpacing: "-0.1px" }}>{hour}</div>
                    {appts.length > 0 ? (
                      <div className="flex-1 flex flex-wrap items-center gap-1.5">
                        {appts.map(appt => {
                          const cfg = typeConfig[appt.type];
                          return (
                            <button
                              key={appt.id}
                              onClick={() => setDetailAppt(appt)}
                              className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full transition-transform hover:scale-[1.02]"
                              style={{ background: `color-mix(in srgb, ${cfg.color} 7.8%, transparent)` }}
                              title={`${appt.petName} · ${appt.time} · ${appt.type}`}
                            >
                              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                                <img src={appt.photo} alt={appt.petName} className="w-full h-full object-cover" draggable={false} />
                              </div>
                              <span className="text-[10.5px] text-gray-700 truncate" style={{ fontWeight: 500, letterSpacing: "-0.1px" }}>{appt.petName}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewModal(true)}
                        className="flex-1 h-10 rounded-xl text-[10.5px] text-gray-400 hover:bg-gray-50/60 hover:text-gray-600 transition-colors inline-flex items-center justify-center gap-1.5 group/empty"
                        style={{ fontWeight: 500 }}
                      >
                        <Plus className="w-3 h-3 opacity-0 group-hover/empty:opacity-100 transition-opacity" /> เพิ่มนัด
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── WEEK (Gantt — days across the top, time down the left) ── */
          <div className="flex-1 overflow-auto">
            <div className="min-w-[820px]">
              {/* Day header row */}
              <div className="flex border-b border-gray-100/60 bg-white sticky top-0 z-10">
                <div className="w-16 flex-shrink-0" />
                {weekDays.map((day, i) => {
                  const isValid = day > 0 && day <= daysInMonth;
                  const isToday = isCurrentMonth && day === now.getDate();
                  const isWE = i === 0 || i === 6;
                  const isSelected = isValid && day === selectedDay;
                  return (
                    <button
                      key={i}
                      onClick={() => { if (isValid) setSelectedDay(day); }}
                      disabled={!isValid}
                      className="flex-1 p-2.5 text-center transition-colors disabled:cursor-default enabled:hover:bg-gray-50/60"
                      style={{
                        background: isSelected ? "color-mix(in srgb, var(--brand) 6%, transparent)" : "transparent",
                        borderBottom: isSelected ? "2px solid var(--brand-dark)" : "2px solid transparent",
                      }}
                    >
                      <div className="text-[10.5px]" style={{ fontWeight: 700, letterSpacing: "0.4px", color: isWE ? "#cbd5e1" : "#94a3b8" }}>
                        {DAYS_TH[i]}
                      </div>
                      <div className="flex items-center justify-center mt-1.5">
                        <span
                          className="inline-flex items-center justify-center"
                          style={{
                            width: isToday ? 28 : 22, height: isToday ? 28 : 22, borderRadius: 9999,
                            background: isToday ? "var(--brand-dark)" : "transparent",
                            color: isToday ? "#ffffff" : isWE ? "#94a3b8" : "#334155",
                            fontSize: "calc(12px * var(--fs))", fontWeight: isToday ? 700 : 600, letterSpacing: "-0.3px", lineHeight: 1,
                          }}
                        >
                          {isValid ? day : ""}
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
                  {HOUR_NUMS.map(h => (
                    <div key={h} style={{ height: HOUR_PX }} className="relative">
                      <span className="absolute -top-1.5 right-2 text-[10px] text-gray-400" style={{ fontWeight: 500 }}>
                        {String(h).padStart(2, "0")}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* day columns */}
                {weekDays.map((day, di) => {
                  const isValid = day > 0 && day <= daysInMonth;
                  const isToday = isCurrentMonth && day === now.getDate();
                  const dayAppts = isValid
                    ? getApptsByDay(day).slice().sort((a, b) => a.time.localeCompare(b.time))
                    : [];
                  return (
                    <div
                      key={di}
                      className="flex-1 relative"
                      style={isToday ? { background: "color-mix(in srgb, var(--brand) 3%, transparent)" } : undefined}
                    >
                      {HOUR_NUMS.map(h => (
                        <div
                          key={h}
                          onClick={() => { if (isValid) { setSelectedDay(day); setShowNewModal(true); } }}
                          style={{ height: HOUR_PX }}
                          className="border-b border-gray-50/80 hover:bg-gray-50/40 cursor-pointer transition-colors group/cell relative"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-400 absolute top-1.5 left-1.5 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
                        </div>
                      ))}
                      {(() => {
                        const untimedDay = dayAppts.filter(a => !a.time);
                        const timedDay = dayAppts.filter(a => a.time);
                        return (<>
                          {/* นัดไม่ระบุเวลา — ปักไว้บนสุดของคอลัมน์ (เส้นประ) */}
                          {untimedDay.map((appt, ui) => {
                            const cfg = typeConfig[appt.type];
                            return (
                              <motion.button
                                key={appt.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02, zIndex: 5 }}
                                onClick={(e) => { e.stopPropagation(); setDetailAppt(appt); }}
                                className="absolute left-1 right-1 rounded-full cursor-pointer overflow-hidden"
                                style={{ top: 2 + ui * (PILL_H + 2), height: PILL_H, background: `color-mix(in srgb, ${cfg.color} 6.3%, transparent)`, border: `1px dashed color-mix(in srgb, ${cfg.color} 40%, transparent)` }}
                                title={`${appt.petName} · ไม่ระบุเวลา · ${appt.type}`}
                              >
                                <div className="h-full flex items-center gap-1.5 pl-0.5 pr-2">
                                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                                    <img src={appt.photo} alt={appt.petName} className="w-full h-full object-cover" draggable={false} />
                                  </div>
                                  <span className="text-[10.5px] leading-tight truncate flex-1 min-w-0" style={{ fontWeight: 500, color: "#374151", letterSpacing: "-0.1px" }}>
                                    {appt.petName}
                                  </span>
                                </div>
                              </motion.button>
                            );
                          })}
                          {/* นัดที่มีเวลา — จัดตำแหน่งตามชั่วโมง (ดันช่อง 08:00 ลงถ้ามีนัดไม่ระบุเวลาปักบน) */}
                          {timedDay.map(appt => {
                            const cfg = typeConfig[appt.type];
                            const hourBucket = parseInt(appt.time.slice(0, 2), 10);
                            const baseTop = ((hourBucket * 60 - GRID_START) / 60) * HOUR_PX;
                            const sameBucket = timedDay.filter(x => parseInt(x.time.slice(0, 2), 10) === hourBucket);
                            const stackIdx = sameBucket.findIndex(x => x.id === appt.id);
                            const pushDown = hourBucket === 8 ? untimedDay.length * (PILL_H + 2) : 0;
                            const top = baseTop + pushDown + stackIdx * (PILL_H + 2);
                            return (
                              <motion.button
                                key={appt.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02, zIndex: 5 }}
                                onClick={(e) => { e.stopPropagation(); setDetailAppt(appt); }}
                                className="absolute left-1 right-1 rounded-full cursor-pointer overflow-hidden"
                                style={{ top: top + 2, height: PILL_H, background: `color-mix(in srgb, ${cfg.color} 7.8%, transparent)` }}
                                title={`${appt.petName} · ${appt.time} · ${appt.type}`}
                              >
                                <div className="h-full flex items-center gap-1.5 pl-0.5 pr-2">
                                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                                    <img src={appt.photo} alt={appt.petName} className="w-full h-full object-cover" draggable={false} />
                                  </div>
                                  <span className="text-[10.5px] leading-tight truncate flex-1 min-w-0" style={{ fontWeight: 500, color: "#374151", letterSpacing: "-0.1px" }}>
                                    {appt.petName}
                                  </span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </>);
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        </main>

        {/* ─── RIGHT SIDEBAR — selected day's appointments grouped by vet ─── */}
        <aside
          className="bg-white rounded-2xl border border-gray-100 overflow-y-auto"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Calendar className="w-4 h-4 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>
                วัน{FULL_DAYS_TH[new Date(year, month, selectedDay).getDay()]}ที่ {selectedDay} {MONTHS_TH[month]}
              </h3>
              <p className="text-[11px] text-gray-500">{todayAppts.length} นัดหมาย</p>
            </div>
          </div>

          <div className="p-3 space-y-3">
            {todayAppts.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
                <p className="text-[12px]" style={{ fontWeight: 600 }}>ไม่มีนัดหมาย</p>
                <p className="text-[10.5px] text-gray-400 mt-0.5">วันนี้ยังไม่มีนัด</p>
              </div>
            ) : (
              apptsByVet.map(([vet, vAppts]) => {
                const isStaff = !vet.startsWith("สพ.ว.");
                const VIco = isStaff ? User : Stethoscope;
                return (
                  <div key={vet} className="rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Vet header */}
                    <div className="px-3 py-2.5 flex items-center gap-2.5 bg-gray-50/60">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 flex-shrink-0">
                        <VIco className="w-4 h-4 text-gray-600" strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>{vet}</p>
                        <p className="text-[10px] text-gray-500 truncate">{vAppts.length} นัด</p>
                      </div>
                      <button
                        onClick={() => setShowNewModal(true)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-gray-400 hover:bg-gray-500 transition-colors"
                        title={`เพิ่มนัดให้ ${vet}`}
                        aria-label={`เพิ่มนัดให้ ${vet}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Appointment list */}
                    <ul className="divide-y divide-gray-100">
                      {vAppts.map(appt => {
                        const cfg = typeConfig[appt.type];
                        return (
                          <li key={appt.id} className="group/row flex items-center hover:bg-gray-50 transition-colors">
                            <button
                              onClick={() => setDetailAppt(appt)}
                              className="flex-1 min-w-0 px-3 py-2 flex items-center gap-2 text-left"
                            >
                              <span className="text-[11px] text-gray-500 flex-shrink-0 whitespace-nowrap" style={{ fontWeight: 600, minWidth: 36, color: appt.time ? undefined : "var(--brand-dark)" }}>{appt.time || "ไม่ระบุ"}</span>
                              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                <img src={appt.photo} alt={appt.petName} className="w-full h-full object-cover" draggable={false} />
                              </div>
                              <span className="text-[11.5px] text-gray-700 truncate flex-1" style={{ fontWeight: 500 }}>{appt.petName}</span>
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: cfg.chipBg, color: cfg.chipText, fontWeight: 700 }}>
                                {appt.type}
                              </span>
                            </button>
                            <div className="flex items-center gap-0.5 pr-2 flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); openEdit(appt); }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                title="แก้ไขนัด"
                                aria-label="แก้ไขนัด"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(appt); }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                title="ลบนัด"
                                aria-label="ลบนัด"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {/* Add / Edit Appointment Modal — โมดัลเดียวกัน prefill เมื่อแก้ไข */}
      <AddAppointmentModal
        open={showNewModal || editingAppt !== null}
        editing={editingProp}
        onClose={() => { setShowNewModal(false); setEditingAppt(null); }}
        onSave={handleSave}
        onDelete={() => { if (editingAppt) handleDelete(editingAppt); }}
      />

      {/* Appointment Detail Modal */}
      <AppointmentDetail
        appt={detailAppt}
        year={year}
        month={month}
        onClose={() => setDetailAppt(null)}
        onCancel={() => detailAppt && handleDelete(detailAppt)}
        onEdit={() => detailAppt && openEdit(detailAppt)}
      />
    </div>
  );
}

function AppointmentDetail({ appt, year, month, onClose, onCancel, onEdit }: { appt: Appointment | null; year: number; month: number; onClose: () => void; onCancel: () => void; onEdit: () => void }) {
  if (!appt) return null;
  const cfg = typeConfig[appt.type];
  const Ico = cfg.icon;
  const isPending = appt.status === "รอยืนยัน";
  const isScheduled = appt.status === "กำหนดการ";
  const date = new Date(year, month, appt.day);
  const dayName = FULL_DAYS_TH[date.getDay()];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — tinted by type */}
          <div className="px-5 pt-5 pb-4 relative" style={{ background: `color-mix(in srgb, ${cfg.color} 3.1%, transparent)` }}>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 w-7 h-7 rounded-full flex items-center justify-center bg-white/80 hover:bg-white transition-colors"
              aria-label="ปิด"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-2xl overflow-hidden"
                  style={{ boxShadow: `0 4px 12px color-mix(in srgb, ${cfg.color} 18.8%, transparent)`, border: "2px solid #ffffff" }}
                >
                  <img src={appt.photo} alt={appt.petName} className="w-full h-full object-cover" draggable={false} />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: cfg.grad, boxShadow: `0 2px 6px color-mix(in srgb, ${cfg.color} 31.4%, transparent)`, border: "1.5px solid #ffffff" }}
                >
                  <Ico className="w-2.5 h-2.5" strokeWidth={2.4} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: cfg.chipBg, color: cfg.chipText, fontWeight: 700 }}>{appt.type}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: isPending ? "rgba(245,158,11,0.10)" : isScheduled ? "rgba(0,0,0,0.05)" : "rgba(16,185,129,0.10)",
                      color: isPending ? "#b45309" : isScheduled ? "#6b7280" : "#059669",
                      fontWeight: 700,
                    }}
                  >
                    {appt.status}
                  </span>
                </div>
                <h3 className="text-gray-900 mt-1" style={{ fontWeight: 800, fontSize: "calc(18px * var(--fs))", letterSpacing: "-0.3px" }}>{appt.petName}</h3>
                <p className="text-[11.5px] text-gray-500" style={{ fontWeight: 500 }}>เจ้าของ: {appt.owner}</p>
              </div>
            </div>
          </div>

          {/* Body — info rows */}
          <div className="px-5 py-4 space-y-3">
            <InfoRow icon={Calendar} label="วันที่" value={`วัน${dayName} ${appt.day} ${MONTHS_TH[month]} ${year + 543}`} />
            <InfoRow icon={Clock} label="เวลา" value={appt.time ? `${appt.time} น.` : `ไม่ระบุเวลา${appt.timeNote ? ` · ${appt.timeNote}` : ""}`} />
            <InfoRow icon={Stethoscope} label="สัตวแพทย์" value={appt.vet} />
            <InfoRow icon={User} label="เจ้าของ" value={appt.owner} />
            <InfoRow icon={Phone} label="เบอร์ติดต่อ" value="081-234-5678" />
            <InfoRow icon={FileText} label="หมายเหตุ" value="—" muted />
          </div>

          {/* Footer actions */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-2 rounded-xl text-[12px] text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1.5 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Trash2 className="w-3.5 h-3.5" /> ลบนัด
            </button>
            <div className="flex-1" />
            <button
              className="px-3 py-2 rounded-xl text-[12px] text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1.5 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Printer className="w-3.5 h-3.5" /> พิมพ์
            </button>
            <button onClick={onEdit} className="vet-btn vet-btn-primary inline-flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> แก้ไข
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoRow({ icon: Ico, label, value, muted }: { icon: typeof Calendar; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 flex-shrink-0">
        <Ico className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{label}</div>
        <div className="text-[12.5px] mt-0.5" style={{ color: muted ? "#9ca3af" : "#111827", fontWeight: muted ? 500 : 600 }}>{value}</div>
      </div>
    </div>
  );
}
