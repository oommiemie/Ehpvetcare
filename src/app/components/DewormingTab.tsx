import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bug, Plus, Pencil, Trash2, Check, X, CalendarDays, Pill, Stethoscope, ClipboardList,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { DatePickerModern } from "./DatePickerModern";
import { TimePickerModern } from "./TimePickerModern";

export interface DewormingRecord {
  id: string;
  date: string;
  time: string;
  type: "ภายใน" | "ภายนอก" | "ทั้งภายในและภายนอก";
  route: "รับประทาน" | "หยอดหลังคอ" | "ฉีด" | "อื่นๆ";
  productName: string;
  brand: string;
  drugRegNo?: string;
  lotNumber?: string;
  expiryDate?: string;
  preAssessment: string[];
  preNote?: string;
  postEffects: string[];
  postNote?: string;
  nextAppointmentDate?: string;
  recordedAt: string;
  recordedBy?: string;
}

const TYPE_OPTIONS: DewormingRecord["type"][] = ["ภายใน", "ภายนอก", "ทั้งภายในและภายนอก"];
const ROUTE_OPTIONS: DewormingRecord["route"][] = ["รับประทาน", "หยอดหลังคอ", "ฉีด", "อื่นๆ"];

const PRE_OPTIONS = [
  "สุขภาพปกติ",
  "มีอาการท้องเสีย",
  "อาเจียน",
  "เบื่ออาหาร",
  "ซึม",
  "ตั้งท้อง",
  "ให้นมลูก",
  "โรคประจำตัว",
];

const POST_OPTIONS = [
  "ไม่มีอาการผิดปกติ",
  "อาเจียน",
  "ท้องเสีย",
  "แพ้ยา",
  "ซึม",
  "พบพยาธิในอุจจาระ",
  "อื่นๆ",
];

const NEXT_PRESETS: { label: string; days: number }[] = [
  { label: "30 วัน",  days: 30 },
  { label: "90 วัน",  days: 90 },
  { label: "180 วัน", days: 180 },
  { label: "1 ปี",   days: 365 },
];

function loadRecords(key: string): DewormingRecord[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as DewormingRecord[];
  } catch { /* ignore */ }
  return [];
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function thaiShortDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DewormingTab({ storageKey, defaultRecordedBy }: { storageKey: string; defaultRecordedBy?: string }) {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [records, setRecords] = useState<DewormingRecord[]>(() => loadRecords(storageKey));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(records)); } catch { /* ignore */ }
  }, [records, storageKey]);

  const sorted = useMemo(
    () => [...records].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)),
    [records],
  );

  const latest = sorted[0];

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleDelete = async (rec: DewormingRecord) => {
    const ok = await confirm({
      title: "ลบบันทึกถ่ายพยาธิ",
      description: `ลบบันทึกวันที่ ${thaiShortDate(rec.date)}?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    setRecords(prev => prev.filter(r => r.id !== rec.id));
    showSnackbar("success", "ลบบันทึกแล้ว");
  };

  const handleSave = (rec: DewormingRecord) => {
    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? rec : r));
      showSnackbar("success", "แก้ไขบันทึกถ่ายพยาธิแล้ว");
    } else {
      setRecords(prev => [...prev, rec]);
      showSnackbar("success", "บันทึกถ่ายพยาธิเรียบร้อย");
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#34d399,#059669)",
              boxShadow: "0 4px 12px rgba(5,150,105,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>บันทึกถ่ายพยาธิ</p>
            <p className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>
              Deworming Records · {records.length} ครั้ง
              {latest && ` · ครั้งล่าสุด ${thaiShortDate(latest.date)}`}
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)",
            boxShadow: "var(--hero-btn-shadow)",
            fontWeight: 700,
            
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มบันทึก
        </button>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-12 gap-2" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <Bug className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
          <p className="text-[12px] text-gray-500" style={{ fontWeight: 600 }}>ยังไม่มีประวัติการถ่ายพยาธิ</p>
          <p className="text-[11px] text-gray-400">กด "+ เพิ่มบันทึก" เพื่อเริ่มบันทึก</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((rec, idx) => (
            <DewormingCard
              key={rec.id}
              rec={rec}
              isLatest={idx === 0}
              onEdit={() => openEdit(rec.id)}
              onDelete={() => handleDelete(rec)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <DewormingFormModal
            initial={editingId ? records.find(r => r.id === editingId) ?? null : null}
            defaultRecordedBy={defaultRecordedBy}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DewormingCard({ rec, isLatest, onEdit, onDelete }: { rec: DewormingRecord; isLatest: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div
      className="bg-white rounded-2xl border p-4 transition-all"
      style={{
        borderColor: isLatest ? "rgba(5,150,105,0.30)" : "#f3f4f6",
        boxShadow: isLatest ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(5,150,105,0.06)" : "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}
        >
          <Bug className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13.5px] text-gray-900" style={{ fontWeight: 700 }}>{rec.productName || "—"}</p>
            {isLatest && (
              <span className="text-[9.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>
                ล่าสุด
              </span>
            )}
            <span className="text-[10.5px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
              {rec.type}
            </span>
            <span className="text-[10.5px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
              {rec.route}
            </span>
          </div>
          <p className="text-[11.5px] text-gray-500 mt-0.5">
            {thaiShortDate(rec.date)}{rec.time ? ` · ${rec.time} น.` : ""}{rec.brand ? ` · ${rec.brand}` : ""}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors" title="แก้ไข">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors" title="ลบ">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        {rec.lotNumber && <InfoCell label="Lot" value={rec.lotNumber} />}
        {rec.expiryDate && <InfoCell label="หมดอายุ" value={thaiShortDate(rec.expiryDate)} />}
        {rec.postEffects.length > 0 && <InfoCell label="ผลหลังให้ยา" value={rec.postEffects.join(", ")} />}
        {rec.nextAppointmentDate && <InfoCell label="นัดถัดไป" value={thaiShortDate(rec.nextAppointmentDate)} highlight />}
      </div>
    </div>
  );
}

function InfoCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg px-2 py-1.5" style={{ background: highlight ? "color-mix(in srgb, var(--brand) 8%, transparent)" : "#f9fafb", border: `1px solid ${highlight ? "color-mix(in srgb, var(--brand) 20%, transparent)" : "#f3f4f6"}` }}>
      <p className="text-[9.5px] text-gray-400 uppercase" style={{ fontWeight: 700, letterSpacing: "0.3px" }}>{label}</p>
      <p className="text-[11.5px] truncate" style={{ fontWeight: 600, color: highlight ? "var(--brand-dark)" : "#374151" }}>{value}</p>
    </div>
  );
}

function DewormingFormModal({ initial, defaultRecordedBy, onClose, onSave }: {
  initial: DewormingRecord | null;
  defaultRecordedBy?: string;
  onClose: () => void;
  onSave: (rec: DewormingRecord) => void;
}) {
  const { showSnackbar } = useSnackbar();
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [time, setTime] = useState(initial?.time ?? "");
  const [type, setType] = useState<DewormingRecord["type"]>(initial?.type ?? "ภายใน");
  const [route, setRoute] = useState<DewormingRecord["route"]>(initial?.route ?? "รับประทาน");
  const [productName, setProductName] = useState(initial?.productName ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [drugRegNo, setDrugRegNo] = useState(initial?.drugRegNo ?? "");
  const [lotNumber, setLotNumber] = useState(initial?.lotNumber ?? "");
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ?? "");

  const [preAssessment, setPreAssessment] = useState<string[]>(initial?.preAssessment ?? []);
  const [preNote, setPreNote] = useState(initial?.preNote ?? "");

  const [postEffects, setPostEffects] = useState<string[]>(initial?.postEffects ?? []);
  const [postNote, setPostNote] = useState(initial?.postNote ?? "");

  const [nextAppointmentDate, setNextAppointmentDate] = useState(initial?.nextAppointmentDate ?? "");

  const toggleArr = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const nextDaysFromToday = nextAppointmentDate
    ? Math.round((new Date(nextAppointmentDate + "T00:00:00").getTime() - new Date(todayIso() + "T00:00:00").getTime()) / 86400000)
    : 0;

  const submit = () => {
    if (!date) { showSnackbar("error", "กรุณาระบุวันที่ถ่ายพยาธิ"); return; }
    if (!productName.trim()) { showSnackbar("error", "กรุณาระบุชื่อผลิตภัณฑ์"); return; }
    const rec: DewormingRecord = {
      id: initial?.id ?? `dw-${Date.now()}`,
      date,
      time,
      type,
      route,
      productName: productName.trim(),
      brand: brand.trim(),
      drugRegNo: drugRegNo.trim() || undefined,
      lotNumber: lotNumber.trim() || undefined,
      expiryDate: expiryDate || undefined,
      preAssessment,
      preNote: preNote.trim() || undefined,
      postEffects,
      postNote: postNote.trim() || undefined,
      nextAppointmentDate: nextAppointmentDate || undefined,
      recordedAt: initial?.recordedAt ?? new Date().toISOString(),
      recordedBy: initial?.recordedBy ?? defaultRecordedBy,
    };
    onSave(rec);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-[560px] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh" }}
        initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
            <Bug className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>
              {initial ? "แก้ไขบันทึกถ่ายพยาธิ" : "บันทึกถ่ายพยาธิใหม่"}
            </h3>
            <p className="text-[11px] text-gray-500">Deworming Record</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>

        <div className="vet-modal-body space-y-4">
          {/* ─── Section 1: ข้อมูลการถ่ายพยาธิ ─── */}
          <FormSection icon={Pill} title="ข้อมูลการถ่ายพยาธิ" en="Deworming Details" tone="emerald">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="vet-label">วันที่ถ่ายพยาธิ <span className="required">*</span></label>
                <DatePickerModern value={date} onChange={setDate} placeholder="เลือกวันที่" />
              </div>
              <div>
                <label className="vet-label">เวลาให้ยา</label>
                <TimePickerModern value={time} onChange={setTime} placeholder="เลือกเวลา" />
              </div>
            </div>
            <div className="mt-3">
              <label className="vet-label">ประเภทการถ่ายพยาธิ</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map(t => (
                  <Chip key={t} on={type === t} label={`พยาธิ${t}`} onClick={() => setType(t)} />
                ))}
              </div>
            </div>
            <div className="mt-3">
              <label className="vet-label">วิธีการให้ยา</label>
              <div className="flex flex-wrap gap-1.5">
                {ROUTE_OPTIONS.map(r => (
                  <Chip key={r} on={route === r} label={r} onClick={() => setRoute(r)} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="vet-label">ชื่อผลิตภัณฑ์ <span className="required">*</span></label>
                <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="เช่น Drontal Plus" className="vet-input" />
              </div>
              <div>
                <label className="vet-label">ยี่ห้อ</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="เช่น Bayer" className="vet-input" />
              </div>
              <div>
                <label className="vet-label">เลขทะเบียนยา</label>
                <input value={drugRegNo} onChange={e => setDrugRegNo(e.target.value)} placeholder="1A xxx/xx" className="vet-input" />
              </div>
              <div>
                <label className="vet-label">Lot Number</label>
                <input value={lotNumber} onChange={e => setLotNumber(e.target.value)} placeholder="—" className="vet-input" />
              </div>
              <div className="col-span-2">
                <label className="vet-label">วันหมดอายุ</label>
                <DatePickerModern value={expiryDate} onChange={setExpiryDate} placeholder="เลือกวันหมดอายุ" />
              </div>
            </div>
          </FormSection>

          {/* ─── Section 2: การประเมินสุขภาพก่อนถ่ายพยาธิ ─── */}
          <FormSection icon={Stethoscope} title="การประเมินสุขภาพก่อนถ่ายพยาธิ" en="Pre-assessment" tone="amber">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRE_OPTIONS.map(opt => (
                <CheckBoxRow key={opt} label={opt} on={preAssessment.includes(opt)} onToggle={() => setPreAssessment(toggleArr(preAssessment, opt))} />
              ))}
            </div>
            <div className="mt-3">
              <label className="vet-label">หมายเหตุเพิ่มเติม</label>
              <textarea value={preNote} onChange={e => setPreNote(e.target.value)} rows={2} placeholder="รายละเอียดอาการ / โรคประจำตัว" className="vet-textarea" />
            </div>
          </FormSection>

          {/* ─── Section 3: ผลหลังการถ่ายพยาธิ ─── */}
          <FormSection icon={ClipboardList} title="ผลหลังการถ่ายพยาธิ" en="Post-treatment" tone="rose">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POST_OPTIONS.map(opt => (
                <CheckBoxRow key={opt} label={opt} on={postEffects.includes(opt)} onToggle={() => setPostEffects(toggleArr(postEffects, opt))} />
              ))}
            </div>
            <div className="mt-3">
              <label className="vet-label">บันทึกอาการและการติดตาม</label>
              <textarea value={postNote} onChange={e => setPostNote(e.target.value)} rows={2} placeholder="รายละเอียดอาการและแผนติดตาม" className="vet-textarea" />
            </div>
          </FormSection>

          {/* ─── Section 4: นัดครั้งถัดไป ─── */}
          <FormSection icon={CalendarDays} title="กำหนดนัดครั้งถัดไป" en="Next Appointment" tone="sky">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="vet-label">วันนัดครั้งถัดไป</label>
                <DatePickerModern value={nextAppointmentDate} onChange={setNextAppointmentDate} placeholder="เลือกวันนัด" />
              </div>
              <div>
                <label className="vet-label">จำนวนวันนับจากวันนี้</label>
                <div className="vet-input flex items-center" style={{ color: nextDaysFromToday > 0 ? "var(--brand-dark)" : "#9ca3af", fontWeight: 700 }}>
                  {nextAppointmentDate ? (nextDaysFromToday > 0 ? `${nextDaysFromToday} วัน` : nextDaysFromToday === 0 ? "วันนี้" : "ผ่านมาแล้ว") : "—"}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <label className="vet-label">คำแนะนำให้นัดติดตาม</label>
              <div className="flex flex-wrap gap-1.5">
                {NEXT_PRESETS.map(p => {
                  const target = addDays(date || todayIso(), p.days);
                  const on = nextAppointmentDate === target;
                  return (
                    <Chip key={p.label} on={on} label={p.label} onClick={() => setNextAppointmentDate(target)} />
                  );
                })}
              </div>
            </div>
          </FormSection>
        </div>

        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> {initial ? "บันทึกการแก้ไข" : "บันทึก"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FormSection({ icon: Icon, title, en, tone, children }: { icon: React.ComponentType<{ className?: string }>; title: string; en: string; tone: "emerald" | "amber" | "rose" | "sky"; children: React.ReactNode }) {
  const TONE: Record<typeof tone, { bg: string; color: string }> = {
    emerald: { bg: "rgba(5,150,105,0.10)",  color: "#047857" },
    amber:   { bg: "rgba(245,158,11,0.10)", color: "#b45309" },
    rose:    { bg: "rgba(225,29,72,0.10)",  color: "#b91c1c" },
    sky:     { bg: "rgba(8,145,178,0.10)",  color: "#0e7490" },
  };
  const t = TONE[tone];
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: "#f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: t.bg }}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>{title}</p>
        </div>
        <span className="text-[10px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>{en}</span>
      </div>
      {children}
    </div>
  );
}

function Chip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] transition-all"
      style={{
        fontWeight: on ? 700 : 600,
        color: on ? "#ffffff" : "#475569",
        background: on ? "linear-gradient(135deg,var(--brand),var(--brand-dark))" : "rgba(0,0,0,0.04)",
        border: on ? "1px solid var(--brand-dark)" : "1px solid transparent",
        boxShadow: on ? "0 3px 10px color-mix(in srgb, var(--brand) 22%, transparent)" : "none",
      }}
    >
      {label}
    </button>
  );
}

function CheckBoxRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span
        className="w-4 h-4 rounded-md flex items-center justify-center transition-all flex-shrink-0"
        style={{
          background: on ? "linear-gradient(135deg,var(--brand),var(--brand-dark))" : "#ffffff",
          border: on ? "1px solid var(--brand-dark)" : "1.5px solid #d1d5db",
        }}
      >
        {on && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={on} onChange={onToggle} className="hidden" />
      <span className="text-[11.5px] text-gray-700" style={{ fontWeight: 500 }}>{label}</span>
    </label>
  );
}

/* ─── Helper: latest deworming summary (for EMR history) ─── */
export function getLatestDeworming(storageKey: string): DewormingRecord | null {
  const recs = loadRecords(storageKey);
  if (recs.length === 0) return null;
  return [...recs].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))[0];
}
