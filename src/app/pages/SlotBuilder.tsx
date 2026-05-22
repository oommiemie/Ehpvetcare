import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Plus, X, Check, Clock, Users,
  Stethoscope, Syringe, Activity, Sparkles, Scissors, Video,
  ClipboardList, AlertTriangle, Bone, Minus,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";

/* ═══════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════ */
interface Vet {
  id: string;
  name: string;
  specialty: string;
  hours: number;
  color: string;
  initials: string;
}

const VETS: Vet[] = [
  { id: "v1", name: "นพ. ปราโมทย์ วงศ์เพียร", specialty: "DVM, Small Animal",  hours: 32, color: "#19a589", initials: "ปร" },
  { id: "v2", name: "พญ. ศักรา สุขศรี",       specialty: "DVM, Surgery",       hours: 28, color: "#f43f5e", initials: "ศก" },
  { id: "v3", name: "นพ. ธีรวัฒน์ คงเดช",     specialty: "DVM, Dentistry",     hours: 24, color: "#3b82f6", initials: "ธว" },
  { id: "v4", name: "พญ. ณัฐสุดา ทองพูล",     specialty: "DVM, Exotic & Avian", hours: 20, color: "#8b5cf6", initials: "ณส" },
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

/* Week — 18-24 พ.ค. 2569 */
const WEEK_DAYS = [
  { idx: 0, label: "จ.",  date: "18", month: "พ.ค." },
  { idx: 1, label: "อ.",  date: "19", month: "พ.ค." },
  { idx: 2, label: "พ.",  date: "20", month: "พ.ค." },
  { idx: 3, label: "พฤ.", date: "21", month: "พ.ค." },
  { idx: 4, label: "ศ.",  date: "22", month: "พ.ค." },
  { idx: 5, label: "ส.",  date: "23", month: "พ.ค." },
  { idx: 6, label: "อา.", date: "24", month: "พ.ค." },
];

const GRID_START = 8 * 60;   // 08:00
const GRID_END   = 18 * 60;  // 18:00
const HOUR_PX    = 104;      // 30-min gap = 52px → fits a fixed 46px slot card
const SLOT_H     = 46;       // fixed slot height — all slots equal
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 08..18

interface Slot {
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
const INIT_SLOTS: Slot[] = [
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
  // surgery vet
  mk("v2", 0, 9, 0,  "surgery", 1), mk("v2", 0, 13, 0, "dental", 0),
];

const REPEAT_OPTS = ["ครั้งเดียว", "รายสัปดาห์", "2 สัปดาห์/ครั้ง", "ทั้งเดือน"];

/* ═══════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════ */
export function SlotBuilder() {
  const { showSnackbar } = useSnackbar();
  const [vetId, setVetId] = useState("v1");
  const [slots, setSlots] = useState<Slot[]>(INIT_SLOTS);
  const [filter, setFilter] = useState<Set<string>>(new Set(SERVICES.map(s => s.key)));
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [panelOpen, setPanelOpen] = useState(false);
  const [allView, setAllView] = useState(false);   // show every vet's roster

  // create-slot form state
  const [fDays, setFDays]     = useState<number[]>([2]);
  const [fService, setFService] = useState("sick");
  const [fStart, setFStart]   = useState(toMin(14, 0));
  const [fDur, setFDur]       = useState(30);
  const [fCap, setFCap]       = useState(1);
  const [fBuffer, setFBuffer] = useState(10);
  const [fRoom, setFRoom]     = useState("");
  const [fRepeat, setFRepeat] = useState("ครั้งเดียว");
  const [fOnline, setFOnline] = useState(true);
  const [fEmergency, setFEmergency] = useState(false);
  const [fNote, setFNote]     = useState("");

  const vet = VETS.find(v => v.id === vetId)!;
  const vetSlots = useMemo(
    () => slots.filter(s => s.vetId === vetId && filter.has(s.serviceKey)),
    [slots, vetId, filter],
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

  const openCreate = (day?: number, startMin?: number) => {
    if (day !== undefined) setFDays([day]);
    if (startMin !== undefined) setFStart(Math.max(GRID_START, Math.min(GRID_END - 30, startMin)));
    setPanelOpen(true);
  };
  const toggleFDay = (d: number) => setFDays(prev =>
    prev.includes(d) ? (prev.length > 1 ? prev.filter(x => x !== d) : prev) : [...prev, d].sort((a, b) => a - b),
  );

  const pickService = (key: string) => {
    setFService(key);
    const s = svc(key);
    setFDur(s.duration);
    setFCap(s.capacity);
  };

  const saveSlot = () => {
    const newSlots: Slot[] = fDays.map((day, i) => ({
      id: Date.now() + i, vetId, day, start: fStart, serviceKey: fService, capacity: fCap, booked: 0,
    }));
    setSlots(prev => [...prev, ...newSlots]);
    setPanelOpen(false);
    showSnackbar("success", `สร้าง Slot "${svc(fService).label}" ${fmt(fStart)} — ${fDays.length} วัน`);
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#FEFBF8" }}>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="w-[260px] flex-shrink-0 border-r border-gray-200/70 bg-white overflow-y-auto">
        {/* Vets */}
        <div className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-1 mb-2" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>แพทย์</p>
          {/* ดูแพทย์ทั้งหมด */}
          <button onClick={() => setAllView(true)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all mb-1.5 ${allView ? "" : "hover:bg-gray-50"}`}
            style={allView ? { background: "#19a58912", boxShadow: "inset 0 0 0 1.5px #19a58940" } : undefined}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-800 truncate" style={{ fontWeight: allView ? 700 : 600 }}>ดูแพทย์ทั้งหมด</p>
              <p className="text-[10px] text-gray-400 truncate">ตารางออกตรวจรวมทุกคน</p>
            </div>
            {allView && <Check className="w-4 h-4 text-[#19a589] flex-shrink-0" />}
          </button>
          <div className="space-y-1.5">
            {VETS.map(v => {
              const active = v.id === vetId && !allView;
              return (
                <button key={v.id} onClick={() => { setVetId(v.id); setAllView(false); }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${active ? "" : "hover:bg-gray-50"}`}
                  style={active ? { background: `${v.color}12`, boxShadow: `inset 0 0 0 1.5px ${v.color}40` } : undefined}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${v.color}, ${v.color}cc)`, fontWeight: 700 }}>
                    {v.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 truncate" style={{ fontWeight: active ? 700 : 600 }}>{v.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{v.specialty}</p>
                  </div>
                  <span className="text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded-md" style={{ background: `${v.color}15`, color: v.color, fontWeight: 700 }}>
                    {v.hours}h
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Service filter */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-1 mb-2" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>กรองบริการ</p>
          <div className="space-y-0.5">
            {SERVICES.map(s => {
              const on = filter.has(s.key);
              return (
                <button key={s.key} onClick={() => toggleFilter(s.key)}
                  className="w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="w-2.5 h-2.5 rounded-[4px] flex-shrink-0" style={{ background: on ? s.color : "transparent", boxShadow: `inset 0 0 0 1.5px ${s.color}` }} />
                  <span className={`text-[11px] flex-1 text-left truncate ${on ? "text-gray-700" : "text-gray-400"}`} style={{ fontWeight: 500 }}>{s.label}</span>
                  <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all`}
                    style={{ background: on ? s.color : "#fff", border: on ? "none" : "1.5px solid #d1d5db" }}>
                    {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ═══ CENTER — CALENDAR ═══ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar — row 1: identity + view toggle + create */}
        <div className="flex-shrink-0 px-4 py-2.5 border-b border-gray-100 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
              style={{ background: allView ? "linear-gradient(135deg,#19a589,#0d7c66)" : `linear-gradient(135deg, ${vet.color}, ${vet.color}cc)`, fontWeight: 700 }}>
              {allView ? <Users className="w-4 h-4" /> : vet.initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>
                {allView ? "ตารางออกตรวจ — แพทย์ทั้งหมด" : vet.name}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <button className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span style={{ fontWeight: 500 }}>18 – 24 พ.ค. 2569</span>
                <button className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
                <span className="text-gray-300">·</span>
                <span className="truncate">{allView ? `${VETS.length} แพทย์` : vet.specialty}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* view toggle */}
            <div className="flex bg-gray-100 rounded-full p-0.5">
              {(["day", "week", "month"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3.5 py-1.5 text-[11px] rounded-full transition-all ${view === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  style={{ fontWeight: view === v ? 600 : 400 }}>
                  {v === "day" ? "วัน" : v === "week" ? "สัปดาห์" : "เดือน"}
                </button>
              ))}
            </div>
            <button onClick={() => openCreate()}
              className="flex items-center gap-1.5 px-4 h-9 rounded-full text-white text-xs transition-all active:scale-95 hover:shadow-md"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}>
              <Plus className="w-3.5 h-3.5" /> สร้าง Slot
            </button>
          </div>
        </div>

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
                      <p className={`text-[10px] ${isToday ? "text-[#0d7c66]" : d.idx >= 5 ? "text-rose-300" : "text-gray-400"}`} style={{ fontWeight: 600 }}>{d.label}</p>
                      <p className="text-xs text-gray-800" style={{ fontWeight: 700 }}>{d.date} {d.month}</p>
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
                          style={{ background: `linear-gradient(135deg, ${v.color}, ${v.color}cc)`, fontWeight: 700 }}>
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
                          <div className="rounded-lg p-2" style={{ background: `${v.color}12` }}>
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: v.color }} />
                              <span className="text-[11px] leading-none truncate" style={{ fontWeight: 800, color: v.color }}>
                                {fmt(startMin)}–{fmt(endMin)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white" style={{ fontWeight: 700, color: v.color }}>
                                {ds.length} slot
                              </span>
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white text-gray-500" style={{ fontWeight: 600 }}>
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
        ) : (
        /* Gantt — days across top, time down the left */
        <div className="flex-1 overflow-auto">
          <div className="min-w-[820px]">
            {/* Day header row */}
            <div className="flex sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div className="w-16 flex-shrink-0 border-r border-gray-100 flex items-end justify-center pb-1.5">
                <span className="text-[9px] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 700 }}>เวลา</span>
              </div>
              {WEEK_DAYS.map(d => {
                const isToday = d.idx === 3;
                const isWeekend = d.idx >= 5;
                return (
                  <div key={d.idx} className="flex-1 py-2 text-center border-r border-gray-100 last:border-r-0 relative"
                    style={isToday ? { background: "linear-gradient(180deg, rgba(25,165,137,0.08), transparent)" } : undefined}>
                    <p className={`text-[10px] ${isToday ? "text-[#0d7c66]" : isWeekend ? "text-rose-300" : "text-gray-400"}`} style={{ fontWeight: 600 }}>{d.label}</p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className={`inline-flex items-center justify-center text-sm ${isToday ? "w-6 h-6 rounded-full bg-[#19a589] text-white" : "text-gray-800"}`}
                        style={{ fontWeight: 700, boxShadow: isToday ? "0 2px 8px rgba(25,165,137,0.4)" : undefined }}>{d.date}</span>
                      <span className="text-[10px] text-gray-400">{d.month}</span>
                    </div>
                    {isToday && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-[#19a589]" />}
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div className="flex relative">
              {/* hour labels (left) */}
              <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/40">
                {HOURS.map(h => (
                  <div key={h} style={{ height: HOUR_PX }} className="relative">
                    <span className="absolute -top-1.5 right-2 text-[10px] text-gray-400" style={{ fontWeight: 600 }}>
                      {String(h).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* day columns */}
              {WEEK_DAYS.map(d => {
                const isToday = d.idx === 3;
                return (
                  <div key={d.idx} className="flex-1 relative border-r border-gray-100 last:border-r-0"
                    style={isToday ? { background: "rgba(25,165,137,0.03)" } : undefined}>
                    {/* hour cells */}
                    {HOURS.map(h => (
                      <div key={h}
                        onClick={() => openCreate(d.idx, toMin(h, 0))}
                        style={{ height: HOUR_PX, background: h === 12 ? "rgba(245,158,11,0.05)" : undefined }}
                        className="border-b border-dashed border-gray-100 hover:bg-[#19a589]/8 cursor-pointer transition-colors group/cell relative">
                        <Plus className="w-3.5 h-3.5 text-[#19a589]/50 absolute top-1.5 left-1.5 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
                      </div>
                    ))}
                    {/* slot cards — fixed equal height, positioned by start time */}
                    {vetSlots.filter(s => s.day === d.idx).map(s => {
                      const cfg = svc(s.serviceKey);
                      const top = ((s.start - GRID_START) / 60) * HOUR_PX;
                      const full = s.booked >= s.capacity;
                      const Sico = cfg.icon;
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ x: 1, zIndex: 5 }}
                          onClick={(e) => { e.stopPropagation(); showSnackbar("info", `${cfg.label} · ${fmt(s.start)}–${fmt(s.start + cfg.duration)} · จอง ${s.booked}/${s.capacity}`); }}
                          className="absolute left-1 right-1 rounded-xl cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                          style={{
                            top: top + 2, height: SLOT_H,
                            background: full ? cfg.color : `${cfg.color}24`,
                          }}
                          title={`${cfg.label} · ${fmt(s.start)}–${fmt(s.start + cfg.duration)}`}
                        >
                          <div className="h-full flex flex-col justify-center px-2 gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{ background: full ? "rgba(255,255,255,0.25)" : cfg.color }}>
                                <Sico className="w-2.5 h-2.5 text-white" />
                              </span>
                              <p className="text-[10px] leading-none truncate flex-1"
                                style={{ fontWeight: 700, color: full ? "#fff" : cfg.color }}>{cfg.label}</p>
                            </div>
                            <div className="flex items-center justify-between gap-1 pl-[22px]">
                              <span className="text-[9px] leading-none" style={{ color: full ? "rgba(255,255,255,0.85)" : "#9ca3af" }}>
                                {fmt(s.start)}–{fmt(s.start + cfg.duration)}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-[8px] leading-none px-1.5 py-0.5 rounded-full"
                                style={{ background: full ? "rgba(255,255,255,0.22)" : "#fff", color: full ? "#fff" : cfg.color, fontWeight: 700 }}>
                                <Users className="w-2 h-2" /> {s.booked}/{s.capacity}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </main>

      {/* ═══ RIGHT — CREATE SLOT PANEL ═══ */}
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="w-[340px] flex-shrink-0 border-l-2 border-[#19a589]/30 bg-white overflow-y-auto"
            style={{ boxShadow: "-8px 0 24px rgba(0,0,0,0.05)" }}
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
              fOnline={fOnline} setFOnline={setFOnline}
              fEmergency={fEmergency} setFEmergency={setFEmergency}
              fNote={fNote} setFNote={setFNote}
              onClose={() => setPanelOpen(false)}
              onSave={saveSlot}
            />
          </motion.aside>
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
  fDays: number[]; toggleFDay: (v: number) => void;
  fService: string; pickService: (k: string) => void;
  fStart: number; setFStart: (v: number) => void;
  fDur: number; setFDur: (v: number) => void;
  fCap: number; setFCap: (v: number) => void;
  fBuffer: number; setFBuffer: (v: number) => void;
  fRoom: string; setFRoom: (v: string) => void;
  fRepeat: string; setFRepeat: (v: string) => void;
  fOnline: boolean; setFOnline: (v: boolean) => void;
  fEmergency: boolean; setFEmergency: (v: boolean) => void;
  fNote: string; setFNote: (v: string) => void;
  onClose: () => void; onSave: () => void;
}) {
  const cfg = svc(p.fService);
  const endMin = p.fStart + p.fDur;
  const daysLabel = [...p.fDays].sort((a, b) => a - b).map(i => WEEK_DAYS[i].date).join(", ");

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-100 bg-white flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>สร้าง Slot ใหม่</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {daysLabel} พ.ค. · {fmt(p.fStart)}–{fmt(endMin)} · {p.vet.name}
          </p>
        </div>
        <button onClick={p.onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-5">
        {/* วันที่ — เลือกได้หลายวัน */}
        <Field label={`วันที่ · เลือกได้หลายวัน (${p.fDays.length})`}>
          <div className="flex gap-1.5 flex-wrap">
            {WEEK_DAYS.map(d => {
              const on = p.fDays.includes(d.idx);
              return (
                <button key={d.idx} onClick={() => p.toggleFDay(d.idx)}
                  className={`flex-1 min-w-[38px] py-1.5 rounded-lg text-center transition-all ${on ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  style={on ? { background: "#19a589" } : undefined}>
                  <p className="text-[9px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-xs" style={{ fontWeight: 700 }}>{d.date}</p>
                </button>
              );
            })}
          </div>
        </Field>

        {/* ประเภทบริการ */}
        <Field label="ประเภทบริการ">
          <div className="grid grid-cols-2 gap-2">
            {SERVICES.map(s => {
              const Sico = s.icon;
              const on = s.key === p.fService;
              return (
                <button key={s.key} onClick={() => p.pickService(s.key)}
                  className="flex items-start gap-2 p-2 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: on ? s.color : "#e5e7eb",
                    background: on ? `${s.color}0E` : "#fff",
                    boxShadow: on ? `inset 0 0 0 1px ${s.color}` : undefined,
                  }}>
                  <Sico className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: s.color }} />
                  <div className="min-w-0">
                    <p className="text-[11px] leading-tight truncate" style={{ fontWeight: on ? 700 : 600, color: on ? s.color : "#374151" }}>{s.label}</p>
                    <p className="text-[9px] text-gray-400">{s.duration} min · cap {s.capacity}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> การเตรียม: ตรวจ/สอบประวัติ 5 นาที
          </p>
        </Field>

        {/* เวลา & ระยะเวลา */}
        <Field label="เวลา & ระยะเวลา">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <SubLabel>เวลาเริ่ม</SubLabel>
              <Stepper value={p.fStart} display={fmt(p.fStart)} onChange={p.setFStart} step={15} min={GRID_START} max={GRID_END - 15} />
            </div>
            <div>
              <SubLabel>ระยะเวลา</SubLabel>
              <Stepper value={p.fDur} onChange={p.setFDur} step={5} min={5} max={240} suffix="min" />
            </div>
          </div>
        </Field>

        {/* จำนวนคิว & เวลาเผื่อ */}
        <Field label="จำนวนคิว & เวลาเผื่อ">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <SubLabel>จองพร้อมกัน</SubLabel>
              <Stepper value={p.fCap} onChange={p.setFCap} min={1} max={20} suffix="ตัว" />
            </div>
            <div>
              <SubLabel>เวลาเผื่อหลัง</SubLabel>
              <Stepper value={p.fBuffer} onChange={p.setFBuffer} step={5} min={0} max={60} suffix="min" />
            </div>
          </div>
          {/* visual time bar */}
          <div className="mt-2.5 rounded-xl bg-gray-50 border border-gray-100 p-2.5">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
              <span style={{ fontWeight: 600 }}>{fmt(p.fStart)}</span>
              <span style={{ fontWeight: 600 }}>{fmt(endMin + p.fBuffer)}</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="rounded-l-full" style={{ flex: p.fDur, background: cfg.color }} />
              {p.fBuffer > 0 && (
                <div className="rounded-r-full" style={{
                  flex: p.fBuffer,
                  background: `repeating-linear-gradient(45deg, ${cfg.color}33, ${cfg.color}33 4px, transparent 4px, transparent 8px)`,
                }} />
              )}
            </div>
            <div className="flex items-center justify-between text-[9px] text-gray-400 mt-1">
              <span>เวลานัด {p.fDur} นาที</span>
              {p.fBuffer > 0 && <span>+{p.fBuffer} นาทีเผื่อ</span>}
            </div>
          </div>
        </Field>

        {/* ห้อง / ทรัพยากร */}
        <Field label="ห้อง / ทรัพยากร">
          <select value={p.fRoom} onChange={e => p.setFRoom(e.target.value)}
            className="w-full h-9 px-3 text-sm text-gray-700 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all">
            <option value="">— ไม่ระบุห้อง —</option>
            <option value="r1">ห้องตรวจ 1</option>
            <option value="r2">ห้องตรวจ 2</option>
            <option value="r3">ห้องผ่าตัด</option>
            <option value="r4">ห้องทันตกรรม</option>
            <option value="r5">ห้อง Grooming</option>
          </select>
        </Field>

        {/* ทำซ้ำ */}
        <Field label="ทำซ้ำ">
          <div className="flex gap-1.5 flex-wrap">
            {REPEAT_OPTS.map(r => {
              const on = r === p.fRepeat;
              return (
                <button key={r} onClick={() => p.setFRepeat(r)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${on ? "bg-[#19a589] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  style={{ fontWeight: on ? 600 : 400 }}>
                  {r}
                </button>
              );
            })}
          </div>
        </Field>

        {/* กฎการจอง */}
        <Field label="กฎการจอง">
          <div className="space-y-2">
            <ToggleRow
              label="รับจองออนไลน์"
              sub="แสดงในระบบของเจ้าของสัตว์"
              on={p.fOnline}
              onToggle={() => p.setFOnline(!p.fOnline)}
            />
            <ToggleRow
              label="สำรองสำหรับฉุกเฉิน"
              sub="พนักงานเท่านั้น ไม่เปิดสาธารณะ"
              on={p.fEmergency}
              onToggle={() => p.setFEmergency(!p.fEmergency)}
            />
          </div>
        </Field>

        {/* โน้ตภายใน */}
        <Field label="โน้ตภายใน">
          <textarea value={p.fNote} onChange={e => p.setFNote(e.target.value)} rows={2}
            placeholder="เช่น เคสใหม่ ใช้เวลาเพิ่ม"
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all placeholder:text-gray-300" />
        </Field>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
        <button onClick={p.onClose}
          className="px-4 h-10 rounded-full text-xs text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all" style={{ fontWeight: 500 }}>
          ยกเลิก
        </button>
        <button onClick={p.onSave}
          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full text-xs text-white transition-all active:scale-[0.98] hover:shadow-md"
          style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}>
          <Check className="w-4 h-4" /> สร้าง Slot
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
