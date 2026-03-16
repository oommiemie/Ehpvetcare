import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, Plus, Camera, AlertTriangle, Send,
  Utensils, Pill, Stethoscope,
  Activity as ActivityIcon, FileText, Dumbbell,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */
export interface DailyLogEntry {
  id: number;
  date: string;
  time: string;
  category: "feeding" | "medication" | "exercise" | "health" | "photo" | "incident" | "other";
  title: string;
  detail: string;
  staff: string;
  healthColor: "green" | "yellow" | "red";
  photos?: string[];
}

const categoryConfig = {
  feeding: { label: "ให้อาหาร", icon: Utensils, color: "#e8802a", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  medication: { label: "ให้ยา", icon: Pill, color: "#ef4444", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  exercise: { label: "ออกกำลังกาย", icon: Dumbbell, color: "#3b82f6", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  health: { label: "สถานะสุขภาพ", icon: Stethoscope, color: "#19a589", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  photo: { label: "ส่งรูป/อัปเดต", icon: Camera, color: "#8b5cf6", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  incident: { label: "รายงานปัญหา", icon: AlertTriangle, color: "#dc2626", bg: "bg-red-50", text: "text-red-800", border: "border-red-300" },
  other: { label: "อื่นๆ", icon: FileText, color: "#6b7280", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

const healthColorMap = {
  green: { label: "ปกติ", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", border: "border-green-300" },
  yellow: { label: "สังเกตอาการ", bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", border: "border-yellow-300" },
  red: { label: "ต้องดูแลพิเศษ", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", border: "border-red-300" },
};

const foodBrands = ["Royal Canin", "Hill's Science Diet", "Orijen", "Acana", "เนื้อวัวบด", "อาหารเปียก", "อาหารเฉพาะทาง"];
const exerciseTypes = ["เดินเล่นสนามหญ้า", "เล่นกับสัตว์อื่น", "ว่ายน้ำ", "เล่นของเล่น", "วิ่งเล่นอิสระ"];
const healthChecks = ["อุจจาระปกติ", "อุจจาระผิดปกติ", "ปัสสาวะปกติ", "ปัสสาวะผิดปกติ", "อาเจียน", "ไม่กินอาหาร", "ซึม", "มีไข้", "บาดเจ็บ"];

/* ═══════════════════════════════════════════════════════
   Mock initial logs
   ═══════════════════════════════════════════════════════ */
export const mockDailyLogs: DailyLogEntry[] = [
  { id: 1, date: "13 มี.ค.", time: "08:00", category: "feeding", title: "อาหารเช้า", detail: "Royal Canin Adult 250g — กินหมด", staff: "ญาณี", healthColor: "green" },
  { id: 2, date: "13 มี.ค.", time: "07:15", category: "exercise", title: "เดินเล่นเช้า", detail: "เดินเล่นสนามหญ้า 30 นาที — สนุกสนาน", staff: "สุภาน", healthColor: "green" },
  { id: 3, date: "13 มี.ค.", time: "09:30", category: "photo", title: "ส่งรูปผ่าน Line", detail: "ส่งรูปและคลิปวิดีโอสั้นให้เจ้าของ — ตอบรับแล้ว 👍", staff: "ทินนท์", healthColor: "green" },
  { id: 4, date: "12 มี.ค.", time: "18:00", category: "feeding", title: "อาหารเย็น", detail: "Royal Canin Adult 250g — กินหมด", staff: "วิภา", healthColor: "green" },
  { id: 5, date: "12 มี.ค.", time: "14:00", category: "health", title: "ตรวจสุขภาพประจำวัน", detail: "สุขภาพปกติ อุจจาระปกติ ปัสสาวะปกติ เล่นสนุก", staff: "น.สพ. วิทยา", healthColor: "green" },
  { id: 6, date: "12 มี.ค.", time: "10:00", category: "medication", title: "ให้ยาถ่ายพยาธิ", detail: "Drontal Plus 1 เม็ด — ให้ร่วมกับอาหาร", staff: "ญาณี", healthColor: "yellow" },
];

/* ═══════════════════════════════════════════════════════
   Daily Care Dashboard Section (for BoardingDetail)
   ═══════════════════════════════════════════════════════ */
export function DailyCareDashboard({ logs, currentHealthColor, onAddLog }: {
  logs: DailyLogEntry[];
  currentHealthColor: "green" | "yellow" | "red";
  onAddLog: () => void;
}) {
  const hc = healthColorMap[currentHealthColor];

  // Group logs by date
  const grouped = logs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, DailyLogEntry[]>);

  const dates = Object.keys(grouped);

  return (
    <div className="space-y-3">
      {/* Health status banner */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${hc.border} ${hc.bg}`}>
        <div className={`w-3 h-3 rounded-full ${hc.dot}`} style={{ boxShadow: `0 0 8px ${currentHealthColor === "green" ? "rgba(34,197,94,0.5)" : currentHealthColor === "yellow" ? "rgba(234,179,8,0.5)" : "rgba(239,68,68,0.5)"}` }} />
        <div className="flex-1">
          <p className={`text-xs ${hc.text}`} style={{ fontWeight: 600 }}>สถานะสุขภาพ: {hc.label}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">อัปเดตล่าสุด: {logs[0]?.time || "-"} น. โดย {logs[0]?.staff || "-"}</p>
        </div>
        <button onClick={onAddLog}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-full transition-all active:scale-95"
          style={{ fontWeight: 600, background: "linear-gradient(177deg, #5a9e60, #3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
          <Plus className="w-3 h-3" /> บันทึก
        </button>
      </div>

      {/* Activity summary cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { cat: "feeding", count: logs.filter(l => l.category === "feeding").length },
          { cat: "medication", count: logs.filter(l => l.category === "medication").length },
          { cat: "exercise", count: logs.filter(l => l.category === "exercise").length },
          { cat: "health", count: logs.filter(l => l.category === "health").length },
        ].map(item => {
          const cfg = categoryConfig[item.cat as keyof typeof categoryConfig];
          const Icon = cfg.icon;
          return (
            <div key={item.cat} className={`${cfg.bg} rounded-xl p-2.5 text-center border ${cfg.border}`}>
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: cfg.color }} />
              <p className="text-lg" style={{ fontWeight: 700, color: cfg.color }}>{item.count}</p>
              <p className="text-[9px] text-gray-500" style={{ fontWeight: 500 }}>{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Timeline logs grouped by date */}
      {dates.map(date => (
        <div key={date}>
          <p className="text-[10px] text-gray-400 mb-2 px-1" style={{ fontWeight: 600 }}>{date}</p>
          <div className="space-y-0">
            {grouped[date].map((log, i) => {
              const cfg = categoryConfig[log.category];
              const Icon = cfg.icon;
              const isIncident = log.category === "incident";
              return (
                <div key={log.id} className={`flex items-start gap-3 py-2.5 relative ${isIncident ? "bg-red-50/50 -mx-2 px-2 rounded-lg" : ""}`}>
                  {i < grouped[date].length - 1 && (
                    <div className="absolute left-[7px] top-[28px] bottom-0 w-[2px] bg-gray-100" />
                  )}
                  <div className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 relative z-10" style={{ backgroundColor: cfg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] ${cfg.bg} ${cfg.text}`} style={{ fontWeight: 500 }}>
                        <Icon className="w-2.5 h-2.5" /> {cfg.label}
                      </span>
                      <span className="text-[10px] text-gray-400">{log.time} น.</span>
                      {/* Health dot */}
                      <span className={`w-2 h-2 rounded-full ml-auto flex-shrink-0 ${healthColorMap[log.healthColor].dot}`}
                        title={healthColorMap[log.healthColor].label} />
                    </div>
                    <p className="text-xs text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{log.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{log.detail}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">โดย: {log.staff}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Add Daily Log Modal
   ═══════════════════════════════════════════════════════ */
export function AddDailyLogModal({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave: (log: DailyLogEntry) => void;
}) {
  const categories = Object.keys(categoryConfig) as (keyof typeof categoryConfig)[];
  const [category, setCategory] = useState<keyof typeof categoryConfig>("feeding");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [staff, setStaff] = useState("");
  const [healthColor, setHealthColor] = useState<"green" | "yellow" | "red">("green");
  const [feedingAmount, setFeedingAmount] = useState("");
  const [feedingBrand, setFeedingBrand] = useState("");
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState("30");
  const [healthChecked, setHealthChecked] = useState<string[]>([]);
  const [isIncident, setIsIncident] = useState(false);

  const handleSave = () => {
    const hasContent = title || detail || (category === "feeding" && feedingBrand) || (category === "exercise" && exerciseType) || (category === "health" && healthChecked.length > 0);
    if (!hasContent) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    let finalTitle = title;
    let finalDetail = detail;

    if (category === "feeding" && !title) {
      finalTitle = `อาหาร${feedingBrand ? ` — ${feedingBrand}` : ""}`;
      finalDetail = `${feedingBrand || "อาหาร"} ${feedingAmount || "ไม่ระบุ"} — ${detail || "กินหมด"}`;
    }
    if (category === "exercise" && !title) {
      finalTitle = exerciseType || "ออกกำลังกาย";
      finalDetail = `${exerciseType || "ออกกำลังกาย"} ${exerciseDuration} นาที${detail ? ` — ${detail}` : ""}`;
    }
    if (category === "health" && !title) {
      finalTitle = "ตรวจสุขภาพประจำวัน";
      finalDetail = healthChecked.join(", ") + (detail ? ` — ${detail}` : "");
    }

    onSave({
      id: Date.now(),
      date: "13 มี.ค.",
      time,
      category: isIncident ? "incident" : category,
      title: finalTitle || categoryConfig[category].label,
      detail: finalDetail,
      staff: staff || "ไม่ระบุ",
      healthColor: isIncident ? "red" : healthColor,
    });

    // Reset
    setTitle(""); setDetail(""); setStaff(""); setHealthColor("green");
    setFeedingAmount(""); setFeedingBrand(""); setExerciseType("");
    setExerciseDuration("30"); setHealthChecked([]); setIsIncident(false);
  };

  const cfg = categoryConfig[category];

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
              style={{ height: "min(680px, calc(100vh - 2rem))" }}
            >
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <ActivityIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">บันทึกการดูแลประจำวัน</h2>
                      <p className="vet-tiny mt-[2px]">Daily Care Log</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>

              <div className="vet-modal-body">
                <div className="space-y-[20px]">
                  {/* Category selector */}
                  <div>
                    <p className="vet-divider">ประเภทการบันทึก</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.filter(c => c !== "incident").map(c => {
                        const cc = categoryConfig[c];
                        const Icon = cc.icon;
                        const isActive = category === c;
                        return (
                          <button key={c} onClick={() => setCategory(c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                              isActive ? `${cc.border} ${cc.bg} ${cc.text}` : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                            style={{ fontWeight: isActive ? 600 : 400 }}>
                            <Icon className="w-3 h-3" /> {cc.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category-specific fields */}
                  {category === "feeding" && (
                    <div>
                      <p className="vet-divider">รายละเอียดอาหาร</p>
                      <div className="vet-form-gap">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="vet-label">ยี่ห้อ/ชนิดอาหาร</label>
                            <select value={feedingBrand} onChange={e => setFeedingBrand(e.target.value)} className="vet-input">
                              <option value="">— เลือก —</option>
                              {foodBrands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="vet-label">ปริมาณ</label>
                            <input value={feedingAmount} onChange={e => setFeedingAmount(e.target.value)} placeholder="เช่น 250g" className="vet-input" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {category === "exercise" && (
                    <div>
                      <p className="vet-divider">รายละเอียดการออกกำลังกาย</p>
                      <div className="vet-form-gap">
                        <div>
                          <label className="vet-label">ประเภทกิจกรรม</label>
                          <div className="flex flex-wrap gap-2">
                            {exerciseTypes.map(t => (
                              <button key={t} onClick={() => setExerciseType(t)}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                                  exerciseType === t ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"
                                }`} style={{ fontWeight: exerciseType === t ? 500 : 400 }}>{t}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="vet-label">ระยะเวลา (นาที)</label>
                          <input value={exerciseDuration} onChange={e => setExerciseDuration(e.target.value)} type="number" min="5" className="vet-input" />
                        </div>
                      </div>
                    </div>
                  )}

                  {category === "health" && (
                    <div>
                      <p className="vet-divider">ตรวจสอบสุขภาพ</p>
                      <div className="flex flex-wrap gap-2">
                        {healthChecks.map(h => {
                          const isChecked = healthChecked.includes(h);
                          const isAbnormal = h.includes("ผิดปกติ") || h === "อาเจียน" || h === "ซึม" || h === "มีไข้" || h === "บาดเจ็บ" || h === "ไม่กินอาหาร";
                          return (
                            <button key={h}
                              onClick={() => setHealthChecked(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])}
                              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                                isChecked
                                  ? isAbnormal ? "border-red-400 bg-red-50 text-red-700" : "border-green-400 bg-green-50 text-green-700"
                                  : "border-gray-200 text-gray-500"
                              }`} style={{ fontWeight: isChecked ? 500 : 400 }}>
                              {isChecked && <Check className="w-3 h-3 inline mr-1" />}{h}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Common fields */}
                  <div>
                    <p className="vet-divider">รายละเอียดเพิ่มเติม</p>
                    <div className="vet-form-gap">
                      <div>
                        <label className="vet-label">หัวข้อ</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น อาหารเช้า, เดินเล่น..." className="vet-input" />
                      </div>
                      <div>
                        <label className="vet-label">รายละเอียด</label>
                        <textarea value={detail} onChange={e => setDetail(e.target.value)} placeholder="บันทึกรายละเอียด..." className="vet-textarea" rows={2} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">ผู้บันทึก</label>
                          <input value={staff} onChange={e => setStaff(e.target.value)} placeholder="ชื่อพนักงาน" className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">สถานะสุขภาพ</label>
                          <div className="flex gap-1">
                            {(["green", "yellow", "red"] as const).map(c => (
                              <button key={c}
                                onClick={() => setHealthColor(c)}
                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[10px] rounded-lg border transition-all ${
                                  healthColor === c ? `${healthColorMap[c].border} ${healthColorMap[c].bg} ${healthColorMap[c].text}` : "border-gray-200 text-gray-400"
                                }`} style={{ fontWeight: healthColor === c ? 600 : 400 }}>
                                <span className={`w-2 h-2 rounded-full ${healthColorMap[c].dot}`} />
                                {healthColorMap[c].label.split(" ")[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Incident toggle */}
                  <button
                    onClick={() => setIsIncident(!isIncident)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      isIncident ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 ${isIncident ? "text-red-500" : "text-gray-400"}`} />
                    <div className="text-left flex-1">
                      <p className={`text-xs ${isIncident ? "text-red-700" : "text-gray-600"}`} style={{ fontWeight: 600 }}>รายงานปัญหา (Incident Report)</p>
                      <p className="text-[10px] text-gray-400">สร้างรายงานเชื่อมระบบคลินิก</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isIncident ? "bg-red-500" : "bg-gray-200"}`}>
                      {isIncident && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                </div>
              </div>

              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <div className="flex items-center gap-2 ml-auto">
                  <button className="vet-btn vet-btn-secondary">
                    <Send className="w-3.5 h-3.5" /> ส่ง Line
                  </button>
                  <button onClick={handleSave} className="vet-btn vet-btn-primary btn-green">
                    <Check className="w-4 h-4" /> บันทึก
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}