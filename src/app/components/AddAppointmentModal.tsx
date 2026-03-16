import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  X, Check, Dog, Cat, Bird, Fish, Rabbit, PawPrint, Search,
  Calendar, Clock, Stethoscope, FileText, MapPin, Printer, Bell,
  FlaskConical, Scan, ChevronRight, MessageSquare,
} from "lucide-react";

import { AddPetModal } from "./AddPetModal";
import { getSpeciesAvatar } from "./petAvatars";

const mockPets = [
  { id: 1, hn: "HN-00123", name: "บัดดี้", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์", owner: "สมศักดิ์ ใจดี", color: "bg-amber-100 text-amber-600" },
  { id: 2, hn: "HN-00124", name: "ลูน่า", species: "แมว", breed: "เปอร์เซีย", owner: "วรรณา ศรีสุข", color: "bg-purple-100 text-purple-600" },
  { id: 3, hn: "HN-00125", name: "แม็กซ์", species: "สุนัข", breed: "พุดเดิ้ล", owner: "ประพันธ์ มงคล", color: "bg-amber-100 text-amber-600" },
  { id: 4, hn: "HN-00126", name: "โคโค่", species: "สุนัข", breed: "ชิสุ", owner: "อรอนงค์ พรมเสน", color: "bg-amber-100 text-amber-600" },
  { id: 5, hn: "HN-00127", name: "ชาร์ลี", species: "แมว", breed: "สก็อตติส โฟลด์", owner: "ธีรพล วงศ์สุวรรณ", color: "bg-purple-100 text-purple-600" },
  { id: 6, hn: "HN-00128", name: "เบลล่า", species: "สุนัข", breed: "บีเกิล", owner: "ปรียาภรณ์ ทองดี", color: "bg-amber-100 text-amber-600" },
  { id: 7, hn: "HN-00129", name: "ร็อคกี้", species: "สุนัข", breed: "ลาบราดอร์", owner: "สมศักดิ์ ใจดี", color: "bg-amber-100 text-amber-600" },
  { id: 8, hn: "HN-00130", name: "เดซี่", species: "นก", breed: "เลิฟเบิร์ด", owner: "ธีรพล วงศ์สุวรรณ", color: "bg-sky-100 text-sky-600" },
  { id: 9, hn: "HN-00131", name: "โมจิ", species: "แมว", breed: "บริติส ช็อตแฮร์", owner: "ประพันธ์ มงคล", color: "bg-purple-100 text-purple-600" },
  { id: 10, hn: "HN-00132", name: "โทโร่", species: "กระต่าย", breed: "ฮอลแลนด์ ลอป", owner: "นิดา สวัสดี", color: "bg-pink-100 text-pink-600" },
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

const speciesIcon: Record<string, React.ElementType> = {
  "สุนัข": Dog, "แมว": Cat, "นก": Bird, "ปลา": Fish, "กระต่าย": Rabbit,
};

const TIME_SLOTS: Record<string, string[]> = {
  "ช่วงเช้า": ["08:00", "09:00", "10:00", "11:00", "12:00"],
  "ช่วงบ่าย": ["13:00", "14:00", "15:00", "16:00"],
  "ช่วงเย็น": ["17:00", "18:00"],
};

const STEPS = [
  { id: 1, label: "สัตว์เลี้ยง", icon: PawPrint },
  { id: 2, label: "วัน-เวลา", icon: Calendar },
  { id: 3, label: "สัตวแพทย์", icon: Stethoscope },
  { id: 4, label: "รายละเอียด", icon: FileText },
  { id: 5, label: "ที่อยู่", icon: MapPin },
  { id: 6, label: "สรุป", icon: MessageSquare },
];

interface FormState {
  pet: typeof mockPets[0] | null;
  date: Date | undefined;
  timeSlot: string;
  vetId: number | null;
  reasons: string[];
  needLab: boolean;
  needXray: boolean;
  address: string;
  province: string;
  zipcode: string;
  note: string;
  printSlip: boolean;
  sendNotification: boolean;
}

const defaultForm: FormState = {
  pet: null, date: undefined, timeSlot: "", vetId: null,
  reasons: [], needLab: false, needXray: false,
  address: "", province: "", zipcode: "",
  note: "", printSlip: true, sendNotification: true,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function AddAppointmentModal({ open, onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [petSearch, setPetSearch] = useState("");
  const [vetSearch, setVetSearch] = useState("");
  const [form, setForm] = useState<FormState>(defaultForm);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, 6)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep(1); setForm(defaultForm); setPetSearch(""); setVetSearch(""); }, 300);
  };

  const canNext = () => {
    if (step === 1) return !!form.pet;
    if (step === 2) return !!form.date && !!form.timeSlot;
    if (step === 3) return form.vetId !== null;
    if (step === 4) return form.reasons.length > 0;
    return true;
  };

  const filteredPets = mockPets.filter(p =>
    p.name.includes(petSearch) || p.hn.includes(petSearch) ||
    p.owner.includes(petSearch) || p.breed.includes(petSearch)
  );

  const filteredVets = mockVets.filter(v =>
    v.name.includes(vetSearch) || v.specialty.includes(vetSearch)
  );

  const selectedVet = mockVets.find(v => v.id === form.vetId);

  if (!open) return null;

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

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[660px] vet-modal"
              style={{ height: "min(680px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <Calendar className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">นัดหมายใหม่</h2>
                      <p className="vet-tiny mt-[2px]">ขั้นตอนที่ {step} จาก {STEPS.length}</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Stepper */}
              <div className="bg-white vet-border-b px-5 py-3 flex-shrink-0 flex justify-center">
                <div className="flex items-center gap-1 justify-center overflow-x-auto">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = step === s.id;
                    const isDone = step > s.id;
                    return (
                      <div key={s.id} className="flex items-center gap-1">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
                          isActive ? "bg-[#19a589] text-white" :
                          isDone   ? "bg-[#19a589]/15 text-[#19a589]" :
                                     "bg-gray-100 text-gray-400"
                        }`}>
                          {isDone
                            ? <Check className="w-3 h-3" />
                            : <Icon className="w-3 h-3" />
                          }
                          <span style={{ fontWeight: isActive || isDone ? 600 : 400 }}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-px w-5 flex-shrink-0 ${isDone ? "bg-[#19a589]/40" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="vet-border-t flex-shrink-0" />

              {/* Step Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: direction * 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -32 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="p-6"
                  >

                    {/* ── Step 1: เลือกสัตว์เลี้ยง ── */}
                    {step === 1 && (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                          <input
                            value={petSearch}
                            onChange={e => setPetSearch(e.target.value)}
                            placeholder="ค้นหาชื่อสัตว์, HN, หรือเจ้าของ..."
                            className="vet-search"
                          />
                        </div>
                        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-0.5">
                          {filteredPets.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                              <PawPrint className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                              <p className="text-sm">ไม่พบสัตว์เลี้ยง</p>
                            </div>
                          ) : filteredPets.map(pet => {
                            const Icon = speciesIcon[pet.species] ?? PawPrint;
                            const isSelected = form.pet?.id === pet.id;
                            return (
                              <button
                                key={pet.id}
                                onClick={() => set("pet", pet)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                  isSelected ? "border-[#19a589] bg-[#19a589]/5" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${pet.color}`}>
                                  <img src={getSpeciesAvatar(pet.species)} alt={pet.species} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-800" style={{ fontWeight: isSelected ? 600 : 500 }}>{pet.name}</p>
                                    <span className="text-xs text-gray-400">{pet.hn}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 truncate">{pet.species} · {pet.breed} · {pet.owner}</p>
                                </div>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-[#19a589] flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Step 2: วัน-เวลานัดหมาย ── */}
                    {step === 2 && (
                      <div className="flex gap-4 h-full">
                        {/* Left: ปฏิทิน */}
                        <div className="flex-1 min-w-0">
                          <label className="text-xs text-gray-500 mb-2 block" style={{ fontWeight: 500 }}>วันที่นัดหมาย</label>
                          <div className="bg-gray-50 rounded-2xl py-2 flex justify-center">
                            <DayPicker
                              mode="single"
                              selected={form.date}
                              onSelect={d => set("date", d)}
                              locale={th}
                              captionLayout="dropdown"
                              fromYear={2026}
                              toYear={2027}
                              disabled={{ before: new Date(2026, 1, 28) }}
                              style={{ fontSize: "0.8rem", margin: 0 }}
                            />
                          </div>
                          {form.date && (
                            <p className="text-center text-xs text-[#19a589] mt-2" style={{ fontWeight: 600 }}>
                              📅 {format(form.date, "EEEE d MMMM yyyy", { locale: th })}
                            </p>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-gray-100 self-stretch" />

                        {/* Right: ช่วงเวลา */}
                        <div className="w-[180px] flex-shrink-0">
                          <label className="text-xs text-gray-500 mb-3 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                            <Clock className="w-3.5 h-3.5" /> ช่วงเวลา
                          </label>
                          {(() => {
                            const allTimes: string[] = [];
                            for (let h = 7; h <= 20; h++) {
                              allTimes.push(`${String(h).padStart(2, "0")}:00`);
                              if (h < 20) allTimes.push(`${String(h).padStart(2, "0")}:30`);
                            }
                            const parts = (form.timeSlot || "").split("~");
                            const startVal = parts.length === 2 ? parts[0] : "";
                            const endVal   = parts.length === 2 ? parts[1] : "";
                            const endTimes = startVal ? allTimes.filter(t => t > startVal) : allTimes;

                            const handleStart = (v: string) => {
                              const keepEnd = endVal && endVal > v ? endVal : "";
                              set("timeSlot", `${v}~${keepEnd}`);
                            };
                            const handleEnd = (v: string) => {
                              set("timeSlot", `${startVal}~${v}`);
                            };

                            const btnCls = (active: boolean) =>
                              `text-[11px] py-1.5 rounded-full border transition-all ${
                                active
                                  ? "bg-[#19a589] text-white border-[#19a589] shadow-sm"
                                  : "bg-gray-50 text-gray-600 border-gray-100 hover:border-[#19a589]/40 hover:bg-[#19a589]/8 hover:text-[#19a589]"
                              }`;

                            return (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-[11px] text-gray-400 mb-1.5" style={{ fontWeight: 500 }}>เวลาเริ่มต้น</p>
                                  <div className="grid grid-cols-2 gap-1 max-h-[130px] overflow-y-auto pr-0.5">
                                    {allTimes.map(t => (
                                      <button
                                        key={t}
                                        onClick={() => handleStart(t)}
                                        className={btnCls(startVal === t)}
                                        style={{ fontWeight: startVal === t ? 600 : 400 }}
                                      >
                                        {t}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-[11px] text-gray-400 mb-1.5" style={{ fontWeight: 500 }}>เวลาสิ้นสุด</p>
                                  <div className="grid grid-cols-2 gap-1 max-h-[130px] overflow-y-auto pr-0.5">
                                    {endTimes.map(t => (
                                      <button
                                        key={t}
                                        onClick={() => handleEnd(t)}
                                        className={btnCls(endVal === t)}
                                        style={{ fontWeight: endVal === t ? 600 : 400 }}
                                      >
                                        {t}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {startVal && endVal && (() => {
                                  const [sh, sm] = startVal.split(":").map(Number);
                                  const [eh, em] = endVal.split(":").map(Number);
                                  const total = (eh * 60 + em) - (sh * 60 + sm);
                                  const hrs = Math.floor(total / 60);
                                  const mins = total % 60;
                                  return (
                                    <div className="bg-[#19a589]/8 border border-[#19a589]/15 rounded-xl px-3 py-3 text-center">
                                      <p className="text-xs text-[#19a589]" style={{ fontWeight: 700 }}>
                                        {startVal} – {endVal} น.
                                      </p>
                                      <p className="text-[11px] text-[#19a589]/60 mt-0.5">
                                        {hrs > 0 ? `${hrs} ชม.` : ""}{mins > 0 ? `${hrs > 0 ? " " : ""}${mins} นาที` : ""}
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* ── Step 3: สัตวแพทย์ ── */}
                    {step === 3 && (
                      <div className="space-y-2.5">
                        <div className="relative">
                          <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                          <input
                            value={vetSearch}
                            onChange={e => setVetSearch(e.target.value)}
                            placeholder="ค้นหาชื่อหมอ หรือความเชี่ยวชาญ..."
                            className="vet-search"
                          />
                        </div>
                        {filteredVets.length === 0 ? (
                          <div className="text-center py-10 text-gray-400">
                            <Stethoscope className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                            <p className="text-sm">ไม่พบสัตวแพทย์</p>
                          </div>
                        ) : filteredVets.map(vet => {
                          const isSelected = form.vetId === vet.id;
                          return (
                            <button
                              key={vet.id}
                              onClick={() => vet.available && set("vetId", vet.id)}
                              disabled={!vet.available}
                              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                                !vet.available
                                  ? "opacity-40 cursor-not-allowed border-gray-100 bg-gray-50"
                                  : isSelected
                                  ? "border-[#19a589] bg-[#19a589]/5"
                                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                                isSelected ? "bg-[#19a589] text-white" : vet.color
                              }`} style={{ fontWeight: 700 }}>
                                {vet.initials}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{vet.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-400">{vet.specialty}</span>
                                  <span className="text-gray-200">·</span>
                                  {vet.available
                                    ? <span className="text-xs text-[#19a589]" style={{ fontWeight: 500 }}>พร้อมให้บริการ</span>
                                    : <span className="text-xs text-red-400">ไม่ว่าง</span>
                                  }
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#19a589] flex items-center justify-center flex-shrink-0">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* ── Step 4: รายละเอียดนัดหมาย ── */}
                    {step === 4 && (
                      <div className="space-y-5">
                        <div>
                          <label className="text-xs text-gray-500 mb-2 block" style={{ fontWeight: 500 }}>
                            เหตุผลนัดหมาย <span className="text-red-400">*</span>
                            {form.reasons.length > 0 && (
                              <span className="ml-2 text-[#19a589]">(เลือกแล้ว {form.reasons.length} รายการ)</span>
                            )}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {appointmentReasons.map(reason => {
                              const isSelected = form.reasons.includes(reason);
                              return (
                                <button
                                  key={reason}
                                  onClick={() => set("reasons", isSelected ? [] : [reason])}
                                  className={`py-2 px-4 text-xs rounded-full border transition-all ${
                                    isSelected
                                      ? "bg-[#19a589] border-[#19a589] text-white shadow-sm"
                                      : "bg-white border-gray-200 text-gray-600 hover:border-[#19a589]/50 hover:bg-[#19a589]/5"
                                  }`}
                                  style={{ fontWeight: isSelected ? 600 : 400 }}
                                >
                                  {reason}
                                </button>
                              );
                            })}
                          </div>
                          {form.reasons.includes("อื่นๆ") && (
                            <div className="mt-3">
                              <input
                                autoFocus
                                placeholder="ระบุเหตุผลเพิ่มเติม..."
                                className="vet-input"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-gray-500 block" style={{ fontWeight: 500 }}>บริการเพิ่มเติม</label>
                          <button
                            onClick={() => set("needLab", !form.needLab)}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                              form.needLab ? "border-blue-300 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                              form.needLab ? "bg-blue-500 border-blue-500" : "border-gray-300"
                            }`}>
                              {form.needLab && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <FlaskConical className={`w-4 h-4 flex-shrink-0 ${form.needLab ? "text-blue-500" : "text-gray-400"}`} />
                            <div>
                              <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>ต้องการตรวจแลป</p>
                              <p className="text-xs text-gray-400">ตรวจเลือด / ปัสสาวะ / อุจจาระ</p>
                            </div>
                          </button>
                          <button
                            onClick={() => set("needXray", !form.needXray)}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                              form.needXray ? "border-purple-300 bg-purple-50" : "border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                              form.needXray ? "bg-purple-500 border-purple-500" : "border-gray-300"
                            }`}>
                              {form.needXray && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <Scan className={`w-4 h-4 flex-shrink-0 ${form.needXray ? "text-purple-500" : "text-gray-400"}`} />
                            <div>
                              <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>ต้องการเอกซเรย์ (X-Ray)</p>
                              <p className="text-xs text-gray-400">ถ่ายภาพรังสีเพื่อวินิจฉัย</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Step 5: ที่อยู่ ── */}
                    {step === 5 && (
                      <div className="space-y-4">
                        <p className="text-xs text-gray-400">ที่อยู่สำหรับออกใบนัดหมาย (ไม่บังคับ)</p>
                        <div>
                          <label className="vet-label">ที่อยู่</label>
                          <textarea
                            value={form.address}
                            onChange={e => set("address", e.target.value)}
                            rows={3}
                            placeholder="บ้านเลขที่ / ถนน / ซอย / แขวง / เขต..."
                            className="vet-textarea"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-[12px]">
                          <div>
                            <label className="vet-label">จังหวัด</label>
                            <input
                              value={form.province}
                              onChange={e => set("province", e.target.value)}
                              placeholder="กรุงเทพมหานคร"
                              className="vet-input"
                            />
                          </div>
                          <div>
                            <label className="vet-label">รหัสไปรษณีย์</label>
                            <input
                              value={form.zipcode}
                              onChange={e => set("zipcode", e.target.value)}
                              placeholder="10110"
                              maxLength={5}
                              className="vet-input"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Step 6: หมายเหตุ + สรุป ── */}
                    {step === 6 && (
                      <div className="space-y-4">
                        {/* Summary card */}
                        <div className="bg-[#19a589]/5 border border-[#19a589]/20 rounded-2xl p-4 space-y-2.5">
                          <p className="text-xs text-[#19a589]" style={{ fontWeight: 600 }}>สรุปนัดหมาย</p>
                          {form.pet && (
                            <div className="flex items-center gap-2">
                              <PawPrint className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{form.pet.name} <span className="text-gray-400">({form.pet.hn})</span> · {form.pet.owner}</span>
                            </div>
                          )}
                          {form.date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{format(form.date, "d MMMM yyyy", { locale: th })} · เวลา {form.timeSlot} น.</span>
                            </div>
                          )}
                          {selectedVet && (
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{selectedVet.name}</span>
                            </div>
                          )}
                          {form.reasons.length > 0 && (
                            <div className="flex items-start gap-2">
                              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-700">{form.reasons.join(", ")}</span>
                            </div>
                          )}
                          {(form.needLab || form.needXray) && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {form.needLab && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">ตรวจแลป</span>}
                              {form.needXray && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">X-Ray</span>}
                            </div>
                          )}
                        </div>

                        {/* Note */}
                        <div>
                          <label className="vet-label">หมายเหตุ</label>
                          <textarea
                            value={form.note}
                            onChange={e => set("note", e.target.value)}
                            rows={3}
                            placeholder="หมายเหตุพิเศษสำหรับนัดหมายนี้..."
                            className="vet-textarea"
                          />
                        </div>

                        {/* Print & Notify */}
                        <div className="space-y-2">
                          <button
                            onClick={() => set("printSlip", !form.printSlip)}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                              form.printSlip ? "border-[#19a589]/30 bg-[#19a589]/5" : "border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                              form.printSlip ? "bg-[#19a589] border-[#19a589]" : "border-gray-300"
                            }`}>
                              {form.printSlip && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <Printer className={`w-4 h-4 flex-shrink-0 ${form.printSlip ? "text-[#19a589]" : "text-gray-400"}`} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>พิมพ์ใบนัด</p>
                              <p className="text-xs text-gray-400">พิมพ์เอกสารใบนัดหมายให้เจ้าของสัตว์</p>
                            </div>
                          </button>
                          <button
                            onClick={() => set("sendNotification", !form.sendNotification)}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                              form.sendNotification ? "border-[#19a589]/30 bg-[#19a589]/5" : "border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                              form.sendNotification ? "bg-[#19a589] border-[#19a589]" : "border-gray-300"
                            }`}>
                              {form.sendNotification && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <Bell className={`w-4 h-4 flex-shrink-0 ${form.sendNotification ? "text-[#19a589]" : "text-gray-400"}`} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>ส่งแจ้งเตือน</p>
                              <p className="text-xs text-gray-400">แจ้งเตือนเจ้าของผ่าน SMS หรือ LINE</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer">
                <button
                  onClick={step === 1 ? handleClose : goBack}
                  className="vet-btn vet-btn-secondary"
                >
                  {step === 1 ? "ยกเลิก" : "ย้อนกลับ"}
                </button>

                {step < 6 ? (
                  <button
                    onClick={goNext}
                    disabled={!canNext()}
                    className="vet-btn vet-btn-primary"
                  >
                    ถัดไป <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => { onSave?.(); handleClose(); }}
                    className="vet-btn vet-btn-primary"
                  >
                    <Check className="w-3.5 h-3.5" /> บันทึกนัดหมาย
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}