import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Check, Clock, AlertTriangle, X, Pencil, Pill, Printer, Stethoscope } from "lucide-react";
import { useIPD, type DrugOrder, type MARRecord, type DrugRoute, type DrugFrequency } from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { drugCatalog } from "../AddDrugModal";

const ROUTES: DrugRoute[] = ["PO", "IV", "IM", "SC", "Topical", "Inhalation", "PR", "Other"];
const FREQUENCIES: DrugFrequency[] = ["q24h", "q12h", "q8h", "q6h", "q4h", "PRN", "Continuous", "Once"];
const frequencyHours: Record<DrugFrequency, number> = {
  "q24h": 24, "q12h": 12, "q8h": 8, "q6h": 6, "q4h": 4, "PRN": 0, "Continuous": 0, "Once": 0,
};

const fieldCls = "w-full text-[12.5px] text-gray-700 rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-[#19a589]";

const dayKey = (d: Date) => {
  // Use LOCAL date components (avoid toISOString UTC shift that causes wrong day in non-UTC timezones like Asia/Bangkok)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (iso: string, n: number) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return dayKey(d); };
const thaiShort = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const W = ["อา","จ","อ","พ","พฤ","ศ","ส"];
  return { weekday: `${W[d.getDay()]}.`, date: `${d.getDate()} ${M[d.getMonth()]}.`, year: d.getFullYear() + 543 };
};
const isSameDay = (isoA: string, isoB: string) => isoA === isoB;
const dayOfTherapy = (order: DrugOrder, dateIso: string) => {
  const start = new Date(order.orderedAt);
  const target = new Date(dateIso + "T00:00:00");
  const diff = Math.floor((target.getTime() - new Date(start.toISOString().slice(0, 10) + "T00:00:00").getTime()) / 86400000);
  return diff + 1;
};

export function IPDDailyOrdersView({
  admitId,
  patientWeightKg = 0,
  attendingDoctor,
}: {
  admitId: number;
  patientWeightKg?: number;
  attendingDoctor?: string;
}) {
  const { drugs, mar, addDrug, addMAR, administerMAR, admits } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const orderedBy = user?.displayName ?? "เจ้าหน้าที่";

  const todayKey = dayKey(new Date());
  const currentAdmit = useMemo(() => admits.find(a => a.id === admitId), [admits, admitId]);
  const admitDate = currentAdmit?.admitDate ?? todayKey;

  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [addOpen, setAddOpen] = useState(false);

  // Build date navigator: from admit date → today (inclusive)
  const dates = useMemo(() => {
    const result: string[] = [];
    let cursor = admitDate;
    let guard = 0;
    while (cursor <= todayKey && guard++ < 365) {
      result.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return result.length > 0 ? result : [todayKey];
  }, [admitDate, todayKey]);

  // Keep selectedDate within admit range
  useEffect(() => {
    if (selectedDate < admitDate) setSelectedDate(admitDate);
    else if (selectedDate > todayKey) setSelectedDate(todayKey);
  }, [admitDate, todayKey, selectedDate]);

  const patientDrugs = useMemo(() => drugs.filter(d => d.admitId === admitId), [drugs, admitId]);
  const activeDrugs = patientDrugs.filter(d => d.active);

  // MAR records for selected day, grouped by drug order
  const marForDate = useMemo(() => {
    const drugIds = new Set(patientDrugs.map(d => d.id));
    return mar.filter(m => drugIds.has(m.drugOrderId) && m.scheduledAt.slice(0, 10) === selectedDate)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [mar, patientDrugs, selectedDate]);

  const drugsForDay = useMemo(() => {
    const map = new Map<number, MARRecord[]>();
    marForDate.forEach(m => {
      const arr = map.get(m.drugOrderId) ?? [];
      arr.push(m);
      map.set(m.drugOrderId, arr);
    });
    return Array.from(map.entries()).map(([id, slots]) => ({
      order: patientDrugs.find(d => d.id === id)!,
      slots,
    })).filter(x => x.order);
  }, [marForDate, patientDrugs]);

  // Continuous / fluid orders for the day (no MAR slots — show as full-day banner)
  const fluidOrders = useMemo(
    () => activeDrugs.filter(d => d.isContinuous && !marForDate.find(m => m.drugOrderId === d.id)),
    [activeDrugs, marForDate]
  );

  const totalDoses = marForDate.length;
  const givenToday = marForDate.filter(m => m.status === "Administered").length;

  return (
    <div className="space-y-3">
      {/* Date navigator — range from admit date → today */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          disabled={selectedDate <= admitDate}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {dates.map((d, idx) => {
            const tag = thaiShort(d);
            const active = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, todayKey);
            const isAdmit = isSameDay(d, admitDate);
            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className="flex flex-col items-center px-3 py-1.5 rounded-xl transition-all flex-shrink-0 relative"
                style={{
                  background: active ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#ffffff",
                  border: active ? "1px solid #0d7c66" : "1px solid #e5e7eb",
                  color: active ? "#ffffff" : "#374151",
                  minWidth: 56,
                }}
                title={isAdmit ? "วันแอดมิท" : isToday ? "วันนี้" : `วันที่ ${idx + 1}`}
              >
                <span className="text-[9.5px]" style={{ fontWeight: 700, opacity: 0.7 }}>D{idx + 1}</span>
                <span className="text-[10px]" style={{ fontWeight: active ? 600 : 500, opacity: 0.85 }}>{tag.weekday}</span>
                <span className="text-[12.5px]" style={{ fontWeight: active ? 800 : 700 }}>{tag.date}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          disabled={selectedDate >= todayKey}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
          <CalendarDays className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>ยาที่ต้องให้ – {thaiShort(selectedDate).date} {thaiShort(selectedDate).year}</p>
          <p className="text-[11px] text-gray-500">
            {drugsForDay.length} ตัว · {totalDoses} dose · ให้แล้ว {givenToday}/{totalDoses}
            {fluidOrders.length > 0 && ` · ${fluidOrders.length} สารน้ำ`}
          </p>
        </div>
        <button onClick={() => setAddOpen(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> เพิ่มยา
        </button>
      </div>

      {/* Continuous fluid banner(s) */}
      {fluidOrders.map(f => (
        <div key={`fluid-${f.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border" style={{ background: "rgba(14,165,233,0.06)", borderColor: "rgba(14,165,233,0.25)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#38bdf8,#0284c7)" }}>
            <Pill className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 700 }}>{f.drugName} <span className="text-[10.5px] text-blue-600 ml-1" style={{ fontWeight: 700 }}>{f.route}</span></p>
            <p className="text-[10.5px] text-gray-500 truncate">{f.dose} · ให้ต่อเนื่องตลอดวัน{f.note ? ` · ${f.note}` : ""}</p>
          </div>
          <span className="text-[10.5px] text-blue-700 px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontWeight: 700, background: "rgba(14,165,233,0.14)" }}>คำสั่งให้</span>
        </div>
      ))}

      {/* Drug cards */}
      {drugsForDay.length === 0 && fluidOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Clock className="w-10 h-10 mb-2" strokeWidth={1.5} />
          <p className="text-[12px]" style={{ fontWeight: 600 }}>ไม่มีตารางให้ยาในวันนี้</p>
        </div>
      ) : (
        <div className="space-y-2">
          {drugsForDay.map(({ order, slots }) => (
            <DrugDayCard
              key={order.id}
              order={order}
              slots={slots}
              selectedDate={selectedDate}
              onAdminister={(id) => { administerMAR(id, orderedBy); showSnackbar("success", "ติ๊กให้ยาแล้ว"); }}
            />
          ))}
        </div>
      )}

      {/* Add-to-day popup */}
      <AnimatePresence>
        {addOpen && (
          <AddToDayModal
            admitId={admitId}
            selectedDate={selectedDate}
            activeDrugs={activeDrugs}
            patientWeightKg={patientWeightKg}
            orderedBy={orderedBy}
            addMAR={addMAR}
            addDrug={addDrug}
            onClose={() => setAddOpen(false)}
            onAdded={(name) => showSnackbar("success", `เพิ่ม ${name} ในคำสั่งรายวันแล้ว`)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 text-right" style={{ fontWeight: 700 }}>{value}</dd>
    </>
  );
}

/* Time chip selector — common 2-hour slots; click to toggle */
const TIME_CHOICES = ["00:00","02:00","04:00","06:00","08:00","10:00","12:00","14:00","16:00","18:00","20:00","22:00"];

function TimeChipSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = useMemo(
    () => value.split(",").map(s => s.trim()).filter(Boolean),
    [value],
  );
  const isOn = (t: string) => selected.includes(t);
  const toggle = (t: string) => {
    const next = isOn(t) ? selected.filter(x => x !== t) : [...selected, t].sort();
    onChange(next.join(", "));
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {TIME_CHOICES.map(t => {
          const on = isOn(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] transition-all"
              style={{
                fontWeight: on ? 700 : 600,
                color: on ? "#ffffff" : "#6b7280",
                background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#f3f4f6",
                border: on ? "1px solid #0d7c66" : "1px solid transparent",
                boxShadow: on ? "0 3px 10px rgba(25,165,137,0.22)" : "none",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-[10.5px] text-gray-500 mt-1.5">
          เลือก {selected.length} ช่วง: <span style={{ fontWeight: 600 }}>{selected.join(", ")}</span>
        </p>
      )}
    </div>
  );
}

function DrugDayCard({
  order, slots, selectedDate, onAdminister,
}: {
  order: DrugOrder;
  slots: MARRecord[];
  selectedDate: string;
  onAdminister: (id: number) => void;
}) {
  const day = dayOfTherapy(order, selectedDate);
  const totalDays = order.durationDays || 0;
  const now = Date.now();
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="px-3 py-2 flex items-center gap-2.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontWeight: 700, background: "rgba(25,165,137,0.10)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.25)" }}>
          {order.route}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{order.drugName}</span>
            <span className="text-[10.5px] text-gray-400">วันที่ {day}{totalDays ? ` จาก ${totalDays}` : ""}</span>
            {totalDays > 0 && day === totalDays && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700, background: "rgba(245,158,11,0.12)", color: "#b45309", border: "1px solid rgba(245,158,11,0.30)" }}>
                วันสุดท้าย
              </span>
            )}
            {order.isControlled && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700, background: "rgba(168,85,247,0.12)", color: "#7c3aed", border: "1px solid rgba(168,85,247,0.30)" }}>
                Controlled
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-gray-500 truncate">{order.dose} · {order.frequency}{order.strength ? ` · ${order.strength}` : ""}</p>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {slots.map(s => {
            const t = new Date(s.scheduledAt);
            const hh = String(t.getHours()).padStart(2, "0");
            const mm = String(t.getMinutes()).padStart(2, "0");
            const time = `${hh}:${mm}`;
            const isGiven = s.status === "Administered";
            const isLate = !isGiven && t.getTime() < now;
            const isDue = !isGiven && Math.abs(t.getTime() - now) < 30 * 60 * 1000;
            return (
              <button
                key={s.id}
                onClick={() => !isGiven && onAdminister(s.id)}
                disabled={isGiven}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] transition-colors"
                style={{
                  background: isGiven ? "rgba(16,185,129,0.12)" : isLate ? "rgba(239,68,68,0.10)" : isDue ? "rgba(245,158,11,0.12)" : "rgba(243,244,246,1)",
                  border: `1px solid ${isGiven ? "rgba(16,185,129,0.40)" : isLate ? "rgba(239,68,68,0.40)" : isDue ? "rgba(245,158,11,0.45)" : "rgba(229,231,235,1)"}`,
                  color: isGiven ? "#047857" : isLate ? "#b91c1c" : isDue ? "#b45309" : "#4b5563",
                  fontWeight: 700,
                }}
                title={isGiven ? `ให้แล้ว ${time}` : isLate ? `เลยเวลา ${time}` : isDue ? `ใกล้ถึงเวลา ${time}` : `กำหนด ${time}`}
              >
                {isGiven ? <Check className="w-2.5 h-2.5" strokeWidth={3} /> : isLate ? <AlertTriangle className="w-2.5 h-2.5" /> : isDue ? <Clock className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5 opacity-50" />}
                {time}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Add-to-day modal (2 tabs) ─── */
function AddToDayModal({
  admitId, selectedDate, activeDrugs, patientWeightKg, orderedBy,
  addMAR, addDrug, onClose, onAdded,
}: {
  admitId: number;
  selectedDate: string;
  activeDrugs: DrugOrder[];
  patientWeightKg: number;
  orderedBy: string;
  addMAR: (m: Omit<MARRecord, "id">) => MARRecord;
  addDrug: (d: Omit<DrugOrder, "id">) => DrugOrder;
  onClose: () => void;
  onAdded: (name: string) => void;
}) {
  const [tab, setTab] = useState<"existing" | "new">("existing");

  // "Add new" form state
  const [drugId, setDrugId] = useState<number | null>(null);
  const [doseValue, setDoseValue] = useState("");
  const [doseUnit, setDoseUnit] = useState<"mg/kg" | "mg">("mg/kg");
  const [route, setRoute] = useState<DrugRoute>("IV");
  const [frequency, setFrequency] = useState<DrugFrequency>("q8h");
  const [times, setTimes] = useState("08:00, 16:00, 22:00");
  const [instruction, setInstruction] = useState("");
  const [isPRN, setIsPRN] = useState(false);

  const selectedCatalog = drugCatalog.find(c => c.id === drugId);
  const doseNum = parseFloat(doseValue) || 0;
  const calcMg = doseUnit === "mg/kg" ? doseNum * patientWeightKg : doseNum;

  const addExisting = (order: DrugOrder) => {
    // Add a single MAR entry for the selected date at the next half-hour mark
    const now = new Date();
    const sched = new Date(selectedDate + "T" + String(Math.min(23, now.getHours() + 1)).padStart(2, "0") + ":00:00");
    addMAR({ drugOrderId: order.id, scheduledAt: sched.toISOString(), status: "Pending" });
    onAdded(order.drugName);
    onClose();
  };

  const submitNew = () => {
    if (!selectedCatalog || doseNum <= 0) return;
    const finalDose = doseUnit === "mg/kg" ? `${doseNum} mg/kg (${calcMg.toFixed(2)} mg)` : `${doseNum} mg`;
    const newDrug = addDrug({
      admitId,
      orderedAt: new Date(selectedDate + "T08:00:00").toISOString(),
      orderedBy,
      drugName: selectedCatalog.tradeName,
      strength: selectedCatalog.genericName,
      dose: finalDose,
      route,
      frequency,
      durationDays: 1,
      isPRN,
      isContinuous: frequency === "Continuous",
      isControlled: false,
      note: instruction || undefined,
      active: true,
    });
    // Parse times and create MAR for that day
    const timeList = times.split(",").map(t => t.trim()).filter(Boolean);
    timeList.forEach(t => {
      const sched = new Date(`${selectedDate}T${t.length === 5 ? t : "08:00"}:00`);
      if (!isNaN(sched.getTime())) {
        addMAR({ drugOrderId: newDrug.id, scheduledAt: sched.toISOString(), status: "Pending" });
      }
    });
    onAdded(selectedCatalog.tradeName);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden"
        style={{ height: 640, maxHeight: "92vh" }}
        initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon">
            <Pencil className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>เพิ่มยาในคำสั่งรายวัน</h3>
            <p className="text-[11px] text-gray-500">{thaiShort(selectedDate).date} {thaiShort(selectedDate).year}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>

        {/* Sub-tab */}
        <div className="px-5 pt-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-full p-1">
            {(["existing","new"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-3 py-1.5 rounded-full text-[12px] transition-colors"
                style={{ color: tab === t ? "#ffffff" : "#6b7280", fontWeight: tab === t ? 700 : 600, background: tab === t ? "linear-gradient(135deg,#19a589,#0d7c66)" : "transparent" }}>
                {t === "existing" ? "เลือกจากคำสั่งยา" : "เพิ่มยาตัวใหม่"}
              </button>
            ))}
          </div>
        </div>

        <div className="vet-modal-body">
          {tab === "existing" && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-500">ดึงยาที่กำลังให้ มาเพิ่มเป็นมื้อในวันนี้</p>
              {activeDrugs.length === 0 ? (
                <p className="text-[11.5px] text-gray-400 text-center py-6">ยังไม่มีคำสั่งยา</p>
              ) : (
                activeDrugs.map(d => (
                  <div key={d.id} className="flex items-center gap-2.5 rounded-xl border border-gray-100 p-2.5 hover:shadow-sm transition-shadow">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#34d399,#0d7c66)" }}>
                      <Pill className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 700 }}>{d.drugName} <span className="text-[10.5px] text-gray-500 ml-1">{d.route}</span></p>
                      <p className="text-[10.5px] text-gray-400 truncate">{d.dose} · {d.frequency}</p>
                    </div>
                    <button onClick={() => addExisting(d)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11.5px] text-white" style={{ fontWeight: 700, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 4px 14px rgba(232,128,42,0.28)" }}>
                      <Plus className="w-3 h-3" /> เพิ่ม
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "new" && (
            <div className="space-y-4">
              <div>
                <label className="vet-label">เลือกตำรับยา</label>
                <select value={drugId ?? ""} onChange={e => setDrugId(e.target.value ? parseInt(e.target.value) : null)} className="vet-select">
                  <option value="">— ตำรับยา หรือพิมพ์เองด้านล่าง —</option>
                  {drugCatalog.map(d => <option key={d.id} value={d.id}>{d.genericName} · {d.tradeName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="vet-label">ขนาดยา (Dose)</label>
                  <div className="flex items-stretch rounded-full border-[1.5px] border-gray-200 overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-[#19a589]" style={{ height: 40 }}>
                    <input type="number" step="any" min={0} value={doseValue} onChange={e => setDoseValue(e.target.value)} placeholder="0.02" className="flex-1 min-w-0 text-[13px] text-gray-800 px-4 bg-transparent focus:outline-none" style={{ fontWeight: 500 }} />
                    <select value={doseUnit} onChange={e => setDoseUnit(e.target.value as "mg/kg" | "mg")} className="text-[12px] text-gray-600 bg-white border-l border-gray-200 px-3 focus:outline-none appearance-none cursor-pointer" style={{ fontWeight: 600 }}>
                      <option value="mg/kg">mg/kg</option>
                      <option value="mg">mg</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="vet-label">ช่องทาง (Route) <span className="required">*</span></label>
                  <select value={route} onChange={e => setRoute(e.target.value as DrugRoute)} className="vet-select" style={{ fontWeight: 600 }}>
                    {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="vet-label">ความถี่ (Frequency) <span className="required">*</span></label>
                <select value={frequency} onChange={e => setFrequency(e.target.value as DrugFrequency)} className="vet-select" style={{ fontWeight: 600 }}>
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="vet-label">เวลาให้ยา (Times)</label>
                <TimeChipSelector value={times} onChange={setTimes} />
              </div>
              <div>
                <label className="vet-label">วิธีให้ / วิธีกิน (Instructions)</label>
                <textarea value={instruction} onChange={e => setInstruction(e.target.value)} rows={2} placeholder="เช่น ป้อนพร้อมอาหาร, ให้ช้าๆ over 5 นาที, หยอดตาขวา" className="vet-textarea" />
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <span className={`w-5 h-5 rounded-md flex items-center justify-center ${isPRN ? "bg-[#19a589]" : "bg-white border border-gray-300"}`}>
                  {isPRN && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span className="text-[12.5px] text-gray-700" style={{ fontWeight: 600 }}>ให้เมื่อจำเป็น (PRN) — ไม่กำหนดเวลาตายตัว</span>
                <input type="checkbox" checked={isPRN} onChange={e => setIsPRN(e.target.checked)} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {tab === "new" && (
          <div className="vet-modal-footer">
            <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
            <button onClick={submitNew} disabled={!selectedCatalog || doseNum <= 0} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> เพิ่มลงคำสั่งรายวัน
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
