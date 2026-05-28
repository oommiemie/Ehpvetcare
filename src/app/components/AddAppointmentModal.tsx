import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  X, Check, Search, Calendar, Stethoscope, PawPrint,
  Printer, Bell, FlaskConical, Scan, ChevronLeft, ChevronRight, ChevronDown,
} from "lucide-react";

const mockPets = [
  { id: 1, hn: "HN-00123", name: "บัดดี้", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์", owner: "สมศักดิ์ ใจดี", color: "bg-amber-100 text-amber-600", photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&q=80" },
  { id: 2, hn: "HN-00124", name: "ลูน่า", species: "แมว", breed: "เปอร์เซีย", owner: "วรรณา ศรีสุข", color: "bg-purple-100 text-purple-600", photo: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=120&q=80" },
  { id: 3, hn: "HN-00125", name: "แม็กซ์", species: "สุนัข", breed: "พุดเดิ้ล", owner: "ประพันธ์ มงคล", color: "bg-amber-100 text-amber-600", photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&q=80" },
  { id: 4, hn: "HN-00126", name: "โคโค่", species: "สุนัข", breed: "ชิสุ", owner: "อรอนงค์ พรมเสน", color: "bg-amber-100 text-amber-600", photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=120&q=80" },
  { id: 5, hn: "HN-00127", name: "ชาร์ลี", species: "แมว", breed: "สก็อตติส โฟลด์", owner: "ธีรพล วงศ์สุวรรณ", color: "bg-purple-100 text-purple-600", photo: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=120&q=80" },
  { id: 6, hn: "HN-00128", name: "เบลล่า", species: "สุนัข", breed: "บีเกิล", owner: "ปรียาภรณ์ ทองดี", color: "bg-amber-100 text-amber-600", photo: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=120&q=80" },
  { id: 7, hn: "HN-00129", name: "ร็อคกี้", species: "สุนัข", breed: "ลาบราดอร์", owner: "สมศักดิ์ ใจดี", color: "bg-amber-100 text-amber-600", photo: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=120&q=80" },
  { id: 8, hn: "HN-00130", name: "เดซี่", species: "นก", breed: "เลิฟเบิร์ด", owner: "ธีรพล วงศ์สุวรรณ", color: "bg-sky-100 text-sky-600", photo: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=120&q=80" },
  { id: 9, hn: "HN-00131", name: "โมจิ", species: "แมว", breed: "บริติส ช็อตแฮร์", owner: "ประพันธ์ มงคล", color: "bg-purple-100 text-purple-600", photo: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=120&q=80" },
  { id: 10, hn: "HN-00132", name: "โทโร่", species: "กระต่าย", breed: "ฮอลแลนด์ ลอป", owner: "นิดา สวัสดี", color: "bg-pink-100 text-pink-600", photo: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=120&q=80" },
];

const mockVets = [
  { id: 1, name: "สพ.ว. สมชาย ใจดี", specialty: "อายุรกรรม", available: true, initials: "สช", color: "bg-blue-100 text-blue-700" },
  { id: 2, name: "สพ.ว. สุภา รักดี", specialty: "ศัลยกรรม", available: true, initials: "สภ", color: "bg-rose-100 text-rose-700" },
  { id: 3, name: "สพ.ว. มานะ ศรีสุข", specialty: "ทันตกรรม", available: false, initials: "มน", color: "bg-amber-100 text-amber-700" },
  { id: 4, name: "เจ้าหน้าที่พยาบาล", specialty: "ทั่วไป", available: true, initials: "พย", color: "bg-green-100 text-green-700" },
];

const appointmentReasons = [
  "ฉีดวัคซีน", "ตรวจสุขภาพทั่วไป", "รักษาโรค", "อาบน้ำตัดขน",
  "ฝากเลี้ยง", "ผ่าตัด", "ติดตามอาการ", "อื่นๆ",
];

const TIMES: string[] = (() => {
  const out: string[] = [];
  for (let h = 8; h <= 18; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 18) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

interface FormState {
  pet: typeof mockPets[0] | null;
  date: Date | undefined;
  time: string;
  vetId: number | null;
  reasons: string[];
  needLab: boolean;
  needXray: boolean;
  note: string;
  printSlip: boolean;
  sendNotification: boolean;
}

const defaultForm: FormState = {
  pet: null, date: undefined, time: "", vetId: null,
  reasons: [], needLab: false, needXray: false,
  note: "", printSlip: true, sendNotification: true,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function AddAppointmentModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(defaultForm);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleClose = () => {
    onClose();
    setTimeout(() => { setForm(defaultForm); }, 300);
  };

  const toggleReason = (r: string) =>
    set("reasons", form.reasons.includes(r) ? form.reasons.filter(x => x !== r) : [...form.reasons, r]);

  const canSave = !!form.pet && !!form.date && !!form.time && form.vetId !== null && form.reasons.length > 0;

  if (!open) return null;

  const subtitle = [
    form.pet ? form.pet.name : "เลือกสัตว์",
    form.date ? format(form.date, "d MMM", { locale: th }) : "เลือกวัน",
    form.time || "เลือกเวลา",
  ].join(" · ");

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Modal — single-screen popup (matches SlotBuilder's CreateSlotPanel) */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[860px] vet-modal"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
            >
              {/* Header */}
              <div className="vet-modal-header flex items-center gap-3">
                <div className="vet-modal-header-icon">
                  <Calendar className="w-5 h-5 text-white" strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>นัดหมายใหม่</h3>
                  <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
                </div>
                <button onClick={handleClose} className="vet-modal-close">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Body — 2 columns */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">

                  {/* ─── LEFT: สัตว์เลี้ยง + วันที่ ─── */}
                  <div className="space-y-4 min-w-0">
                    <Field label="วันที่นัดหมาย">
                      <ApptCalendar selected={form.date} onSelect={d => set("date", d)} />
                    </Field>

                    <Field label="เวลานัดหมาย">
                      <div className="grid grid-cols-4 gap-1.5">
                        {TIMES.map(t => {
                          const on = form.time === t;
                          return (
                            <button
                              key={t}
                              onClick={() => set("time", t)}
                              className="text-[11.5px] py-1.5 rounded-lg transition-colors"
                              style={{ background: on ? "#0d7c66" : "rgba(0,0,0,0.03)", color: on ? "#ffffff" : "#475569", fontWeight: on ? 700 : 500 }}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  </div>

                  {/* ─── RIGHT: เวลา + หมอ + เหตุผล + บริการ + หมายเหตุ ─── */}
                  <div className="space-y-4 min-w-0">
                    <Field label="เลือกสัตว์เลี้ยง">
                      <PetCombobox pets={mockPets} value={form.pet} onChange={p => set("pet", p)} />
                    </Field>

                    <Field label="สัตวแพทย์">
                      <VetCombobox vets={mockVets} value={mockVets.find(v => v.id === form.vetId) ?? null} onChange={v => set("vetId", v.id)} />
                    </Field>

                    <Field label={`เหตุผลนัดหมาย${form.reasons.length > 0 ? ` · เลือกแล้ว ${form.reasons.length}` : ""}`}>
                      <div className="flex flex-wrap gap-1.5">
                        {appointmentReasons.map(r => {
                          const on = form.reasons.includes(r);
                          return (
                            <button
                              key={r}
                              onClick={() => toggleReason(r)}
                              className="py-1.5 px-3 text-[11.5px] rounded-full transition-colors"
                              style={{ background: on ? "#0d7c66" : "rgba(0,0,0,0.03)", color: on ? "#ffffff" : "#475569", fontWeight: on ? 700 : 500, letterSpacing: "-0.1px" }}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field label="บริการเพิ่มเติม">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: "needLab" as const, label: "ตรวจแลป", icon: FlaskConical, color: "#0284c7" },
                          { key: "needXray" as const, label: "เอกซเรย์", icon: Scan, color: "#7c3aed" },
                        ].map(opt => {
                          const Ico = opt.icon;
                          const checked = form[opt.key];
                          return (
                            <button
                              key={opt.key}
                              onClick={() => set(opt.key, !checked)}
                              className="flex items-center gap-2 p-2.5 rounded-xl text-left transition-colors"
                              style={{
                                background: checked ? `${opt.color}0E` : "#ffffff",
                                border: checked ? `1px solid ${opt.color}30` : "1px solid rgba(0,0,0,0.06)",
                              }}
                            >
                              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: checked ? opt.color : "#ffffff", border: `1.5px solid ${checked ? opt.color : "#d1d5db"}` }}>
                                {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <Ico className="w-4 h-4 flex-shrink-0" style={{ color: checked ? opt.color : "#9ca3af" }} />
                              <span className="text-[12px] text-gray-800" style={{ fontWeight: 600 }}>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field label="หมายเหตุ">
                      <textarea
                        value={form.note}
                        onChange={e => set("note", e.target.value)}
                        rows={2}
                        placeholder="หมายเหตุพิเศษสำหรับนัดหมายนี้..."
                        className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589] transition-all placeholder:text-gray-300"
                      />
                    </Field>

                    <Field label="ตัวเลือก">
                      <div className="grid grid-cols-2 gap-2">
                        <CheckCard label="พิมพ์ใบนัด" sub="เอกสารให้เจ้าของ" icon={Printer} on={form.printSlip} onToggle={() => set("printSlip", !form.printSlip)} />
                        <CheckCard label="ส่งแจ้งเตือน" sub="SMS / LINE" icon={Bell} on={form.sendNotification} onToggle={() => set("sendNotification", !form.sendNotification)} />
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer">
                <button onClick={handleClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button
                  onClick={() => { onSave?.(); handleClose(); }}
                  disabled={!canSave}
                  className="vet-btn vet-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-3.5 h-3.5" /> บันทึกนัดหมาย
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* Searchable pet picker — click to open a popover with search + rich list */
function PetCombobox({ pets, value, onChange }: {
  pets: typeof mockPets;
  value: typeof mockPets[0] | null;
  onChange: (p: typeof mockPets[0]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = pets.filter(p =>
    p.name.includes(q) || p.hn.includes(q) || p.owner.includes(q) || p.breed.includes(q)
  );

  return (
    <div className="relative" ref={ref}>
      {/* Trigger box */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white text-left transition-all hover:border-gray-300"
        style={{ border: open ? "1px solid #19a589" : "1px solid #e5e7eb", minHeight: 48, boxShadow: open ? "0 0 0 3px rgba(25,165,137,0.12)" : "none" }}
      >
        {value ? (
          <>
            <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ${value.color}`}>
              <img src={value.photo} alt={value.name} className="w-full h-full object-cover" draggable={false} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>{value.name}</p>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{value.hn}</span>
              </div>
              <p className="text-[10.5px] text-gray-500 truncate">{value.breed} · {value.owner}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <PawPrint className="w-4 h-4 text-gray-400" />
            </div>
            <span className="flex-1 text-[13px] text-gray-400">เลือกสัตว์เลี้ยง...</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="ค้นหาชื่อ, HN, เจ้าของ..."
                  className="vet-search"
                />
              </div>
            </div>
            <div className="max-h-[230px] overflow-y-auto p-1.5 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <PawPrint className="w-7 h-7 mx-auto mb-1.5 text-gray-200" />
                  <p className="text-[12px]">ไม่พบสัตว์เลี้ยง</p>
                </div>
              ) : filtered.map(pet => {
                const isSel = value?.id === pet.id;
                return (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => { onChange(pet); setOpen(false); setQ(""); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors hover:bg-gray-50"
                    style={{ background: isSel ? "rgba(13,124,102,0.06)" : "transparent" }}
                  >
                    <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ${pet.color}`}>
                      <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" draggable={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: isSel ? 700 : 600, letterSpacing: "-0.1px" }}>{pet.name}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{pet.hn}</span>
                      </div>
                      <p className="text-[10.5px] text-gray-500 truncate">{pet.breed} · {pet.owner}</p>
                    </div>
                    {isSel && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#0d7c66" }}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Searchable vet picker — click to open a popover with search + rich list */
function VetCombobox({ vets, value, onChange }: {
  vets: typeof mockVets;
  value: typeof mockVets[0] | null;
  onChange: (v: typeof mockVets[0]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = vets.filter(v => v.name.includes(q) || v.specialty.includes(q));

  return (
    <div className="relative" ref={ref}>
      {/* Trigger box */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white text-left transition-all hover:border-gray-300"
        style={{ border: open ? "1px solid #19a589" : "1px solid #e5e7eb", minHeight: 48, boxShadow: open ? "0 0 0 3px rgba(25,165,137,0.12)" : "none" }}
      >
        {value ? (
          <>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] ${value.color}`} style={{ fontWeight: 700 }}>
              {value.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>{value.name}</p>
              <p className="text-[10.5px] text-gray-500 truncate">{value.specialty}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-4 h-4 text-gray-400" />
            </div>
            <span className="flex-1 text-[13px] text-gray-400">เลือกสัตวแพทย์...</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="ค้นหาชื่อหมอ หรือความเชี่ยวชาญ..."
                  className="vet-search"
                />
              </div>
            </div>
            <div className="max-h-[230px] overflow-y-auto p-1.5 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Stethoscope className="w-7 h-7 mx-auto mb-1.5 text-gray-200" />
                  <p className="text-[12px]">ไม่พบสัตวแพทย์</p>
                </div>
              ) : filtered.map(vet => {
                const isSel = value?.id === vet.id;
                return (
                  <button
                    key={vet.id}
                    type="button"
                    onClick={() => { if (vet.available) { onChange(vet); setOpen(false); setQ(""); } }}
                    disabled={!vet.available}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: isSel ? "rgba(13,124,102,0.06)" : "transparent" }}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] ${vet.color}`} style={{ fontWeight: 700 }}>
                      {vet.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: isSel ? 700 : 600, letterSpacing: "-0.1px" }}>{vet.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10.5px] text-gray-500">{vet.specialty}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                        {vet.available
                          ? <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700" style={{ fontWeight: 600 }}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />พร้อม</span>
                          : <span className="text-[10px] text-gray-400">ไม่ว่าง</span>}
                      </div>
                    </div>
                    {isSel && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#0d7c66" }}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

function CheckCard({ label, sub, icon: Ico, on, onToggle }: { label: string; sub: string; icon: React.ElementType; on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      type="button"
      className="flex items-center gap-2 p-2.5 rounded-xl text-left transition-colors"
      style={{
        background: on ? "rgba(13,124,102,0.05)" : "#ffffff",
        border: on ? "1px solid rgba(13,124,102,0.25)" : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: on ? "#0d7c66" : "#ffffff", border: `1.5px solid ${on ? "#0d7c66" : "#d1d5db"}` }}>
        {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <Ico className={`w-4 h-4 flex-shrink-0 ${on ? "text-[#0d7c66]" : "text-gray-400"}`} />
      <div className="min-w-0">
        <p className="text-[12px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{label}</p>
        <p className="text-[10px] text-gray-400 truncate">{sub}</p>
      </div>
    </button>
  );
}

/* Single-select month calendar — visual style matches SlotBuilder's SlotCalendar */
function ApptCalendar({ selected, onSelect }: { selected: Date | undefined; onSelect: (d: Date) => void }) {
  const MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const base = selected ?? new Date();
  const [vm, setVm] = useState(base.getMonth());
  const [vy, setVy] = useState(base.getFullYear());
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const firstDow = (new Date(vy, vm, 1).getDay() + 6) % 7; // Mon-first
  const prev = () => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); };
  const next = () => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); };
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className="rounded-2xl border border-gray-100 p-3" style={{ background: "#fafafa" }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prev} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors" aria-label="เดือนก่อน">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-[13px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>
          {MONTHS_FULL[vm]} <span className="text-gray-500">{vy + 543}</span>
        </p>
        <button onClick={next} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors" aria-label="เดือนถัดไป">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map((d, i) => (
          <div key={d} className="text-center text-[10px] py-0.5" style={{ fontWeight: 700, color: i >= 5 ? "#cbd5e1" : "#94a3b8" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`pre-${i}`} className="h-9" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(vy, vm, day);
          const on = selected ? sameDay(date, selected) : false;
          const isToday = sameDay(date, today);
          const isPast = date < today;
          const colIdx = (firstDow + i) % 7;
          const isWE = colIdx >= 5;
          return (
            <button
              key={day}
              onClick={() => { if (!isPast) onSelect(date); }}
              disabled={isPast}
              className="h-9 rounded-xl text-[12.5px] transition-all enabled:hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
    </div>
  );
}
