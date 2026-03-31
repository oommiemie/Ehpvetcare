import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
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

const typeConfig: Record<AppointmentType, { color: string; bg: string; border: string }> = {
  "การรักษา": { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  "วัคซีน": { color: "text-[#0d7c66]", bg: "bg-[#19a589]/10", border: "border-[#19a589]/30" },
  "อาบน้ำ": { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  "ฝากเลี้ยง": { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
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

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };
  const panelVariants = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.15 } } };

  return (
    <motion.div className="flex h-full flex-col" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white vet-border-b px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h1 className="text-gray-900" style={{ fontWeight: 700 }}>นัดหมาย</h1>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <button onClick={handlePrevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <span style={{ fontWeight: 600 }}>{MONTHS_TH[month]} {year + 543}</span>
              <button onClick={handleNextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white/90 rounded-full p-1 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)]">
              {(["day","week","month"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex items-center justify-center rounded-full transition-all w-[90px] h-[32px] text-[12px] text-center ${view === v ? "bg-[#19a589] text-white" : "text-[#6a7282]"}`}
                  style={{ fontWeight: view === v ? 500 : 400, lineHeight: "16px" }}
                >
                  {viewLabels[v]}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
              <input placeholder="ค้นหา HN / เจ้าของ / หมอ..." className="vet-search w-full sm:w-64" />
            </div>
            
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-add flex items-center gap-1.5 text-white rounded-full flex-shrink-0 active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}
            >
              <Plus className="w-3.5 h-3.5" />
              นัดหมายใหม่
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {Object.entries(typeConfig).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${config.bg} border ${config.border}`} />
              <span className="text-xs text-gray-500">{type}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-6">
        {view === "month" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
            <div className="min-w-[480px]">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS_TH.map(d => (
                <div key={d} className="py-3 text-center text-xs text-gray-500 border-r border-gray-50 last:border-r-0" style={{ fontWeight: 600 }}>{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[100px] border-r border-b border-gray-50 bg-gray-50/50" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayAppts = getApptsByDay(day);
                const isToday = isCurrentMonth && day === now.getDate();
                const isSelected = day === selectedDay;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[60px] sm:min-h-[100px] border-r border-b border-gray-50 p-1.5 sm:p-2 cursor-pointer transition-colors hover:bg-blue-50/30 ${isSelected ? "bg-blue-50/50" : ""}`}
                  >
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1.5 ${isToday ? "bg-blue-600 text-white" : "text-gray-700"}`}
                      style={{ fontWeight: isToday ? 700 : 400 }}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 2).map(appt => {
                        const cfg = typeConfig[appt.type];
                        return (
                          <div key={appt.id} className={`text-xs px-1.5 py-0.5 rounded truncate ${cfg.bg} ${cfg.color}`} style={{ fontWeight: 500 }}>
                            {appt.time} {appt.petName}
                          </div>
                        );
                      })}
                      {dayAppts.length > 2 && (
                        <div className="text-xs text-gray-400 pl-1">+{dayAppts.length - 2} รายการ</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        )}

        {view === "day" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-gray-900" style={{ fontWeight: 600 }}>
                วัน{FULL_DAYS_TH[new Date(year, month, selectedDay).getDay()]}ที่ {selectedDay} {MONTHS_TH[month]} {year + 543}
              </h2>
              <p className="text-xs text-gray-400">{todayAppts.length} นัดหมาย</p>
            </div>
            <div className="divide-y divide-gray-50">
              {HOURS.map(hour => {
                const appt = todayAppts.find(a => a.time === hour);
                return (
                  <div key={hour} className="flex gap-4 p-3 hover:bg-gray-50">
                    <div className="text-xs text-gray-400 w-12 flex-shrink-0 pt-1">{hour}</div>
                    {appt ? (
                      <div className={`flex-1 p-2.5 rounded-lg border ${typeConfig[appt.type].bg} ${typeConfig[appt.type].border}`}>
                        <div className={`text-sm ${typeConfig[appt.type].color}`} style={{ fontWeight: 600 }}>{appt.petName}</div>
                        <div className="text-xs text-gray-500">{appt.owner} · {appt.vet} · {appt.type}</div>
                      </div>
                    ) : (
                      <div className="flex-1 border border-dashed border-gray-100 rounded-lg" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <div className="min-w-[640px]">
            <div className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-3 border-r border-gray-100" />
              {weekDays.map((day, i) => (
                <div key={day} className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${isCurrentMonth && day === now.getDate() ? "bg-blue-50" : ""}`}>
                  <div className="text-xs text-gray-400">{DAYS_TH[i % 7]}</div>
                  <div className={`text-sm mt-0.5 ${isCurrentMonth && day === now.getDate() ? "text-blue-600" : "text-gray-700"}`} style={{ fontWeight: isCurrentMonth && day === now.getDate() ? 700 : 400 }}>{day > 0 && day <= daysInMonth ? day : ""}</div>
                </div>
              ))}
            </div>
            <div>
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-50">
                  <div className="px-3 py-2 text-xs text-gray-400 border-r border-gray-100 flex-shrink-0">{hour}</div>
                  {weekDays.map(day => {
                    const appt = appointments.find(a => a.day === day && a.time === hour);
                    return (
                      <div key={day} className="border-r border-gray-50 last:border-r-0 p-1 min-h-[44px]">
                        {appt && (
                          <div className={`text-xs p-1 rounded ${typeConfig[appt.type].bg} ${typeConfig[appt.type].color} truncate`} style={{ fontWeight: 500 }}>
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
        )}

        {/* Selected day panel */}
        {view === "month" && (
          <motion.div variants={panelVariants} className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-gray-900 mb-4" style={{ fontWeight: 600 }}>
              นัดหมาย — {selectedDay} {MONTHS_TH[month]} {year}
              <span className="ml-2 text-sm text-gray-400 font-normal">({todayAppts.length} รายการ)</span>
            </h2>
            {todayAppts.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">ไม่มีนัดหมายในวันนี้</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayAppts.map(appt => {
                  const cfg = typeConfig[appt.type];
                  return (
                    <div key={appt.id} className={`p-4 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">{appt.time} น.</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color} bg-white/70`} style={{ fontWeight: 500 }}>{appt.type}</span>
                      </div>
                      <div className={`text-sm ${cfg.color}`} style={{ fontWeight: 600 }}>{appt.petName}</div>
                      <div className="text-xs text-gray-500 mt-1">{appt.owner}</div>
                      <div className="text-xs text-gray-400">{appt.vet}</div>
                      <div className={`mt-2 text-xs px-2 py-0.5 rounded-full inline-block ${appt.status === "ยืนยันแล้ว" ? "bg-[#19a589]/15 text-[#0d7c66]" : "bg-yellow-100 text-yellow-700"}`} style={{ fontWeight: 500 }}>{appt.status}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* New Appointment Modal */}
      <AddAppointmentModal open={showNewModal} onClose={() => setShowNewModal(false)} onSave={() => showSnackbar("success", "บันทึกนัดหมายสำเร็จแล้ว")} />
    </motion.div>
  );
}