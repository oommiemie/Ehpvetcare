import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Utensils, Plus, Pencil, Trash2, Check, X, ChefHat, CalendarDays } from "lucide-react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useIPD } from "../../contexts/IPDContext";
import { InlineCalendar } from "../InlineCalendar";

interface DietPlan {
  id: string;
  species: string;        // ประเภทสัตว์
  date?: string;          // วันที่เริ่ม (YYYY-MM-DD) ในช่วง admit
  dateEnd?: string;       // วันที่สิ้นสุด (ถ้าเลือกเป็นช่วง)
  foodName: string;       // ชื่อรายการอาหาร
  foodType: string;       // ประเภทอาหาร (เม็ด/เปียก/พิเศษ ฯลฯ)
  meals: string[];        // มื้ออาหาร (เช้า/กลางวัน/เย็น/อื่นๆ)
  amount?: string;        // ปริมาณ
  note?: string;          // หมายเหตุ
}

/* ─── วันที่ในช่วง admit ─── */
const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtThaiDate = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
const fmtRange = (s?: string, e?: string) => (!s ? "" : (!e || e === s) ? fmtThaiDate(s) : `${fmtThaiDate(s)} – ${fmtThaiDate(e)}`);
const buildDateRange = (startStr?: string, endStr?: string): string[] => {
  if (!startStr) return [];
  const start = new Date(startStr + "T00:00:00");
  if (isNaN(start.getTime())) return [];
  const endParsed = new Date((endStr || startStr) + "T00:00:00");
  const last = isNaN(endParsed.getTime()) || endParsed < start ? start : endParsed;
  const out: string[] = [];
  for (const d = new Date(start); d <= last && out.length < 120; d.setDate(d.getDate() + 1)) out.push(toDateStr(d));
  return out;
};

const MEAL_OPTIONS = ["เช้า", "กลางวัน", "เย็น", "ก่อนนอน", "ตามต้องการ"];
const FOOD_TYPES = ["อาหารเม็ด", "อาหารเปียก", "อาหารสูตรพิเศษ", "อาหารโรค", "อาหารผสม", "ของว่าง", "น้ำ/สารน้ำ"];
const SPECIES_OPTIONS = ["สุนัข", "แมว", "นก", "กระต่าย", "อื่นๆ"];

function loadPlans(key: string): DietPlan[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as DietPlan[];
  } catch { /* ignore */ }
  return [];
}

const fieldCls =
  "w-full text-[12.5px] text-gray-700 rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-[#19a589]";

function PlanCard({ p, onEdit, onRemove }: { p: DietPlan; onEdit: (p: DietPlan) => void; onRemove: (id: string) => void }) {
  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: "linear-gradient(135deg,#fbbf24,#ea580c)" }}>
          <Utensils className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{p.foodName}</p>
          <p className="text-[11px] text-gray-500 truncate">{p.foodType}{p.amount ? ` · ${p.amount}` : ""}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {p.date && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 600, background: "rgba(2,132,199,0.10)", color: "#0369a1", border: "1px solid rgba(2,132,199,0.20)" }}>
                <CalendarDays className="w-2.5 h-2.5" /> {fmtRange(p.date, p.dateEnd)}
              </span>
            )}
            {p.meals.map(m => (
              <span key={m} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 600, background: "rgba(25,165,137,0.10)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)" }}>{m}</span>
            ))}
          </div>
          {p.note && <p className="text-[10.5px] text-gray-400 mt-1.5 truncate">{p.note}</p>}
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="แก้ไข">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onRemove(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500" title="ลบ">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DietPlanTab({ admitId, patientSpecies }: { admitId: number; patientSpecies?: string }) {
  const { showSnackbar } = useSnackbar();
  const { getAdmit } = useIPD();
  const storageKey = `vet-ipd-diet-${admitId}`;
  const [plans, setPlans] = useState<DietPlan[]>(() => loadPlans(storageKey));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"date" | "species">("date");

  // ช่วงวันที่ของการ admit (admit → วันจำหน่าย/วันนี้)
  const admit = getAdmit(admitId);
  const todayStr = toDateStr(new Date());
  const rangeEnd = admit?.dischargedAt ? admit.dischargedAt.slice(0, 10) : todayStr;
  const dateOptions = buildDateRange(admit?.admitDate, rangeEnd);
  const defaultDate = dateOptions.includes(todayStr) ? todayStr : (dateOptions[dateOptions.length - 1] || todayStr);

  // Draft fields
  const [dSpecies, setDSpecies] = useState(patientSpecies || SPECIES_OPTIONS[0]);
  const [dDate, setDDate] = useState(defaultDate);
  const [dDateEnd, setDDateEnd] = useState("");
  const [dFoodName, setDFoodName] = useState("");
  const [dFoodType, setDFoodType] = useState(FOOD_TYPES[0]);
  const [dMeals, setDMeals] = useState<string[]>([]);
  const [dAmount, setDAmount] = useState("");
  const [dNote, setDNote] = useState("");

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(plans)); } catch { /* ignore */ }
  }, [plans, storageKey]);

  const openCreate = () => {
    setEditingId(null);
    setDSpecies(patientSpecies || SPECIES_OPTIONS[0]);
    setDDate(defaultDate);
    setDDateEnd("");
    setDFoodName("");
    setDFoodType(FOOD_TYPES[0]);
    setDMeals([]);
    setDAmount("");
    setDNote("");
    setModalOpen(true);
  };

  const openEdit = (p: DietPlan) => {
    setEditingId(p.id);
    setDSpecies(p.species);
    setDDate(p.date || defaultDate);
    setDDateEnd(p.dateEnd || "");
    setDFoodName(p.foodName);
    setDFoodType(p.foodType);
    setDMeals(p.meals);
    setDAmount(p.amount || "");
    setDNote(p.note || "");
    setModalOpen(true);
  };

  const toggleMeal = (m: string) => setDMeals(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const canSave = dFoodName.trim() && dMeals.length > 0;

  const submit = () => {
    if (!canSave) return;
    const data = { species: dSpecies, date: dDate || undefined, dateEnd: dDateEnd || undefined, foodName: dFoodName.trim(), foodType: dFoodType, meals: dMeals, amount: dAmount.trim() || undefined, note: dNote.trim() || undefined };
    if (editingId) {
      setPlans(prev => prev.map(p => p.id === editingId ? { ...p, ...data } : p));
      showSnackbar("success", "แก้ไข Diet plan แล้ว");
    } else {
      setPlans(prev => [{ id: `dp-${Date.now()}`, ...data }, ...prev]);
      showSnackbar("success", "เพิ่ม Diet plan แล้ว");
    }
    setModalOpen(false);
  };

  const remove = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    showSnackbar("delete", "ลบรายการแล้ว");
  };

  // จัดกลุ่มตามประเภทสัตว์
  const bySpecies = Object.entries(
    plans.reduce<Record<string, DietPlan[]>>((acc, p) => {
      (acc[p.species] = acc[p.species] || []).push(p);
      return acc;
    }, {})
  );
  // จัดกลุ่มตามวันที่ (วันเริ่ม) เรียงเก่า→ใหม่
  const byDate = Object.entries(
    plans.reduce<Record<string, DietPlan[]>>((acc, p) => {
      const key = p.date || "ไม่ระบุวันที่";
      (acc[key] = acc[key] || []).push(p);
      return acc;
    }, {})
  ).sort(([a], [b]) => (a === "ไม่ระบุวันที่" ? 1 : b === "ไม่ระบุวันที่" ? -1 : a.localeCompare(b)));

  return (
    <div className="space-y-4">
      {/* Header card */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <ChefHat className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>แผนอาหาร (Diet Plan)</h3>
            <p className="text-[11px] text-gray-500">กำหนดอาหารและมื้อแยกตามประเภทสัตว์</p>
          </div>
          <button onClick={openCreate} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
          </button>
        </div>

        <div className="p-4">
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400">ยังไม่มีแผนอาหาร — กด "เพิ่มรายการ" เพื่อเริ่มกำหนด</p>
            </div>
          ) : (
            <>
              {/* View toggle */}
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-[11px] text-gray-400 mr-1" style={{ fontWeight: 600 }}>จัดกลุ่มตาม:</span>
                {([["date", "วันที่", CalendarDays], ["species", "ประเภทสัตว์", Utensils]] as const).map(([key, label, Ico]) => {
                  const on = groupBy === key;
                  return (
                    <button key={key} type="button" onClick={() => setGroupBy(key)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] transition-all"
                      style={{
                        fontWeight: on ? 700 : 600,
                        background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#fff",
                        color: on ? "#fff" : "#6b7280",
                        border: on ? "1px solid #0d7c66" : "1px solid #e5e7eb",
                      }}>
                      <Ico className="w-3.5 h-3.5" /> {label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-5">
                {(groupBy === "date" ? byDate : bySpecies).map(([key, list]) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      {groupBy === "date" ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] text-[#0369a1]" style={{ fontWeight: 700 }}>
                          <CalendarDays className="w-3.5 h-3.5" /> {key === "ไม่ระบุวันที่" ? key : fmtThaiDate(key)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>{key}</span>
                      )}
                      <span className="text-[10px] text-gray-400">{list.length} รายการ</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {list.map(p => <PlanCard key={p.id} p={p} onEdit={openEdit} onRemove={remove} />)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Create / edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="vet-modal-header flex items-center gap-3">
                <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#fbbf24,#ea580c)" }}>
                  {editingId ? <Pencil className="w-5 h-5 text-white" /> : <Utensils className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>{editingId ? "แก้ไขแผนอาหาร" : "เพิ่มแผนอาหารใหม่"}</h3>
                  <p className="text-[11px] text-gray-500">กำหนดอาหารและมื้อสำหรับสัตว์ตัวนี้</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
              </div>
              <div className="vet-modal-body space-y-3 overflow-y-auto">
                <div>
                  <label className="vet-label">ประเภทสัตว์</label>
                  <select value={dSpecies} onChange={e => setDSpecies(e.target.value)} className="vet-select">
                    {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="vet-label flex items-center justify-between">
                    <span>วันที่ <span className="text-gray-400 normal-case">(เลือกช่วงในระยะ admit)</span></span>
                    {dDate && <span className="text-[#0d7c66] normal-case" style={{ fontWeight: 600 }}>{fmtRange(dDate, dDateEnd)}</span>}
                  </label>
                  <InlineCalendar
                    range
                    start={dDate}
                    end={dDateEnd}
                    onRangeChange={(s, e) => { setDDate(s); setDDateEnd(e ?? ""); }}
                    min={admit?.admitDate}
                    max={rangeEnd}
                  />
                  <p className="text-[10.5px] text-gray-400 mt-1">คลิกวันแรกและวันสุดท้ายเพื่อเลือกเป็นช่วง · คลิกวันเดียวซ้ำเพื่อเริ่มใหม่</p>
                </div>
                <div>
                  <label className="vet-label">ชื่อรายการอาหาร <span className="required">*</span></label>
                  <input value={dFoodName} onChange={e => setDFoodName(e.target.value)} autoFocus placeholder="เช่น Royal Canin Recovery, Hill's a/d" className="vet-input" />
                </div>
                <div>
                  <label className="vet-label">ประเภทอาหาร</label>
                  <select value={dFoodType} onChange={e => setDFoodType(e.target.value)} className="vet-select">
                    {FOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="vet-label">มื้ออาหาร <span className="required">*</span></label>
                  <div className="flex flex-wrap gap-1.5">
                    {MEAL_OPTIONS.map(m => {
                      const active = dMeals.includes(m);
                      return (
                        <button key={m} type="button" onClick={() => toggleMeal(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] rounded-full transition-all"
                          style={{
                            background: active ? "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)" : "#ffffff",
                            border: active ? "1px solid #0d7c66" : "1px solid #e5e7eb",
                            color: active ? "#ffffff" : "#6b7280",
                            fontWeight: active ? 700 : 500,
                          }}>
                          {active && <Check className="w-3 h-3" strokeWidth={3} />} {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="vet-label">ปริมาณ/มื้อ</label>
                  <input value={dAmount} onChange={e => setDAmount(e.target.value)} placeholder="เช่น 1/4 ถ้วย, 50 g, 30 ml" className="vet-input" />
                </div>
                <div>
                  <label className="vet-label">หมายเหตุ</label>
                  <textarea value={dNote} onChange={e => setDNote(e.target.value)} rows={2} placeholder="เช่น ให้ทีละน้อย / หลีกเลี่ยงน้ำมัน / หลังให้ยา 30 นาที" className="vet-textarea" />
                </div>
              </div>
              <div className="vet-modal-footer">
                <button onClick={() => setModalOpen(false)} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={submit} disabled={!canSave} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
