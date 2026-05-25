import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Search, PawPrint, User, Phone, Calendar, Clock,
  ChevronDown, Check, ClipboardList, Stethoscope,
} from "lucide-react";

/* ─── Mock pet registry ─── */
interface PetEntry {
  id: number;
  hn: string;
  name: string;
  species: string;
  breed: string;
  sex: string;
  age: string;
  weight: string;
  owner: string;
  phone: string;
  photo: string;
}

const petRegistry: PetEntry[] = [
  { id: 1, hn: "HN-2026-001", name: "บัดดี้", species: "สุนัข", breed: "Golden Retriever", sex: "ผู้", age: "2 ปี", weight: "28.5 กก.", owner: "สมศักดิ์ ใจดี", phone: "081-234-5678", photo: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 2, hn: "HN-2026-002", name: "มิ้ว", species: "แมว", breed: "Scottish Fold", sex: "เมีย", age: "3 ปี", weight: "4.2 กก.", owner: "กัญญา สุวรรณ", phone: "091-678-9012", photo: "https://images.unsplash.com/photo-1719218214197-441901e981b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 3, hn: "HN-2026-003", name: "แม็กซ์", species: "สุนัข", breed: "Black Labrador", sex: "ผู้", age: "4 ปี", weight: "32.0 กก.", owner: "ประพันธ์ มงคล", phone: "089-234-5678", photo: "https://images.unsplash.com/photo-1608138498905-05b5cd816a36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 4, hn: "HN-2026-004", name: "ป๊อบ", species: "สุนัข", breed: "Pomeranian", sex: "ผู้", age: "1.5 ปี", weight: "3.8 กก.", owner: "วิชัย มงคล", phone: "083-456-7890", photo: "https://images.unsplash.com/photo-1703368786305-4e1dcfcfd0db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 5, hn: "HN-2026-005", name: "ลูน่า", species: "แมว", breed: "Persian Cat", sex: "เมีย", age: "2 ปี", weight: "3.5 กก.", owner: "วรรณา ศรีสุข", phone: "081-345-6789", photo: "https://images.unsplash.com/photo-1673125301353-0eeb662e51d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 6, hn: "HN-2026-006", name: "ชาร์ลี", species: "สุนัข", breed: "Beagle", sex: "ผู้", age: "5 ปี", weight: "9.5 กก.", owner: "ธีรพล วงศ์สุวรรณ", phone: "087-567-8901", photo: "https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 7, hn: "HN-2026-007", name: "โกลดี้", species: "สุนัข", breed: "Golden Retriever", sex: "เมีย", age: "3 ปี", weight: "30.0 กก.", owner: "สมชาย แก้วใส", phone: "082-111-2233", photo: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 8, hn: "HN-2026-008", name: "ส้มจี๊ด", species: "แมว", breed: "Domestic Shorthair", sex: "ผู้", age: "1 ปี", weight: "3.0 กก.", owner: "พิชญา ทองคำ", phone: "086-999-8877", photo: "https://images.unsplash.com/photo-1743634360082-1e29ef392fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 9, hn: "HN-2026-009", name: "บันนี่", species: "กระต่าย", breed: "Holland Lop", sex: "เมีย", age: "1 ปี", weight: "1.8 กก.", owner: "นภัสสร ดวงดาว", phone: "094-555-6677", photo: "https://images.unsplash.com/photo-1596982061390-8601a98fb501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
  { id: 10, hn: "HN-2026-010", name: "แฮม", species: "แฮมสเตอร์", breed: "Syrian Hamster", sex: "ผู้", age: "6 เดือน", weight: "0.12 กก.", owner: "ปณิดา ใจงาม", phone: "095-333-4455", photo: "https://images.unsplash.com/photo-1739897912889-f9db06e86c80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
];

const visitTypeOptions = ["ตรวจสุขภาพทั่วไป", "การรักษา", "วัคซีน", "ฉุกเฉิน", "ติดตามผล", "ทำหมัน", "ทำฟัน"];
const roomOptions = ["ห้อง 1 — ทั่วไป", "ห้อง 2 — ตา/หู", "ห้อง 3 — ผิวหนัง", "ห้อง 4 — ผ่าตัด", "ห้อง 5 — ไอซียู"];
const symptomOptions = ["เบื่ออาหาร", "อาเจียน", "ท้องเสีย", "ไข้", "ขาแข็ง", "แน่นหน้าอก", "น้ำหนักลด", "ไอ", "พฤติกรรมผิดปกติ", "ตัวร้อน", "ตัวเย็น", "ชัก", "อื่นๆ"];
const vetOptions = ["สพ.ว. สมชาย", "สพ.ว. วรรณา", "สพ.ว. กิตติ", "สพ.ว. มานี"];

export interface RegisterVisitData {
  pet: PetEntry;
  visitType: string;
  room: string;
  vet: string;
  symptoms: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (data: RegisterVisitData) => void;
}

export function RegisterVisitModal({ open, onClose, onSave }: Props) {
  /* ── Step: 1 = เลือกสัตว์, 2 = กรอกข้อมูล ── */
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [selectedPet, setSelectedPet] = useState<PetEntry | null>(null);

  /* ── Form state ── */
  const [visitType, setVisitType] = useState("ตรวจสุขภาพทั่วไป");
  const [room, setRoom] = useState("");
  const [vet, setVet] = useState("สพ.ว. สมชาย");
  const [symptoms, setSymptoms] = useState<string[]>([]);

  /* ── Dropdown states ── */
  const [visitTypeOpen, setVisitTypeOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [vetOpen, setVetOpen] = useState(false);

  const visitTypeRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const vetRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (visitTypeRef.current && !visitTypeRef.current.contains(e.target as Node)) setVisitTypeOpen(false);
      if (roomRef.current && !roomRef.current.contains(e.target as Node)) setRoomOpen(false);
      if (vetRef.current && !vetRef.current.contains(e.target as Node)) setVetOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Reset on close */
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setSearch("");
        setSelectedPet(null);
        setVisitType("ตรวจสุขภาพทั่วไป");
        setRoom("");
        setVet("สพ.ว. สมชาย");
        setSymptoms([]);
      }, 300);
    }
  }, [open]);

  const filtered = petRegistry.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q) || p.hn.toLowerCase().includes(q);
  });

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSelectPet = (pet: PetEntry) => {
    setSelectedPet(pet);
    setStep(2);
  };

  const inputCls = "vet-input";

  /* ── Dropdown component ── */
  const Dropdown = ({ refEl, isOpen, setOpen, value, placeholder, options, onSelect }: {
    refEl: React.RefObject<HTMLDivElement | null>;
    isOpen: boolean;
    setOpen: (v: boolean) => void;
    value: string;
    placeholder: string;
    options: string[];
    onSelect: (v: string) => void;
  }) => (
    <div className="relative" ref={refEl}>
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className="vet-select"
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-[99999] mt-1 w-full bg-white border border-gray-200 rounded-xl overflow-hidden py-1"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
          >
            {options.map((opt) => {
              const sel = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onSelect(opt); setOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm cursor-pointer transition-colors ${sel ? "bg-vet-teal/10" : "hover:bg-gray-50"}`}
                  style={sel ? { color: "var(--vet-teal)", fontWeight: 600 } : { fontWeight: 400 }}
                >
                  {opt}
                  {sel && <Check className="w-3.5 h-3.5 ml-auto text-vet-teal" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full max-w-[720px] vet-modal pointer-events-auto"
            style={{ height: "min(680px, calc(100vh - 2rem))" }}
          >
            {/* ═══ Header ═══ */}
            <div className="vet-modal-header rounded-t-3xl">
              <div className="vet-glow-teal pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full" />
              <div className="vet-glow-teal pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="vet-modal-header-icon">
                    <ClipboardList className="w-[20px] h-[20px] text-white" />
                  </div>
                  <div>
                    <h2 className="vet-section-title">ลงทะเบียนส่งตรวจ</h2>
                    <p className="vet-tiny mt-[2px]">{step === 1 ? "เลือกสัตว์เลี้ยงที่ต้องการส่งตรวจ" : "กรอกข้อมูลการรับบริการ"}</p>
                  </div>
                </div>
                <button onClick={onClose} className="vet-modal-close">
                  <X className="w-[16px] h-[16px] text-gray-500" />
                </button>
              </div>
            </div>

            {/* ═══ Body ═══ */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 space-y-4"
                  >
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาชื่อสัตว์, เจ้าของ, HN..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-vet-teal/20 focus:border-vet-teal/50 transition-all"
                        autoFocus
                      />
                    </div>

                    {/* Pet list */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {filtered.length === 0 ? (
                        <div className="py-12 text-center">
                          <PawPrint className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">ไม่พบสัตว์เลี้ยงที่ตรงกัน</p>
                        </div>
                      ) : (
                        filtered.map((pet) => (
                          <motion.button
                            key={pet.id}
                            type="button"
                            onClick={() => handleSelectPet(pet)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-gray-100 bg-white hover:border-vet-teal/30 hover:bg-vet-teal/[0.03] transition-all cursor-pointer text-left group"
                          >
                            {/* Photo */}
                            <div className="w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0 border-2 border-white" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                              <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{pet.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontWeight: 500 }}>{pet.hn}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${pet.species === "สุนัข" ? "bg-amber-50 text-amber-600" : pet.species === "แมว" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`} style={{ fontWeight: 500 }}>{pet.species}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{pet.breed} · {pet.sex} · {pet.age}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[11px] text-gray-400"><User className="w-3 h-3" />{pet.owner}</span>
                                <span className="flex items-center gap-1 text-[11px] text-gray-400"><Phone className="w-3 h-3" />{pet.phone}</span>
                              </div>
                            </div>
                            {/* Arrow */}
                            <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover:text-vet-teal transition-colors flex-shrink-0" />
                          </motion.button>
                        ))
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 space-y-5"
                  >
                    {/* Selected pet banner */}
                    {selectedPet && (
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-vet-teal/15 bg-vet-teal/[0.04]">
                        <div className="w-[44px] h-[44px] rounded-xl overflow-hidden flex-shrink-0 border-2 border-white" style={{ boxShadow: "0 2px 8px rgba(25,165,137,0.12)" }}>
                          <img src={selectedPet.photo} alt={selectedPet.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{selectedPet.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-vet-teal/10 text-vet-teal" style={{ fontWeight: 500 }}>{selectedPet.hn}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{selectedPet.breed} · {selectedPet.owner} · {selectedPet.phone}</p>
                        </div>
                        <button onClick={() => setStep(1)} className="text-[11px] text-vet-teal hover:underline cursor-pointer flex-shrink-0" style={{ fontWeight: 500 }}>เปลี่ยน</button>
                      </div>
                    )}

                    {/* ── Section: ข้อมูลทั่วไป ── */}
                    <div className="vet-section-bg rounded-[14px] border border-gray-100 overflow-hidden">
                      <div className="px-4 pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 rounded-full bg-vet-teal" />
                          <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ข้อมูลทั่วไป</span>
                          <span className="text-[10px] text-gray-400">General Information</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* ประเภทการมา */}
                          <div className="space-y-1.5">
                            <label className="text-xs text-gray-500" style={{ fontWeight: 500 }}>ประเภทการมา <span className="text-red-400">*</span></label>
                            <Dropdown refEl={visitTypeRef} isOpen={visitTypeOpen} setOpen={setVisitTypeOpen} value={visitType} placeholder="เลือกประเภท" options={visitTypeOptions} onSelect={setVisitType} />
                          </div>
                          {/* ห้องตรวจ */}
                          <div className="space-y-1.5">
                            <label className="text-xs text-gray-500" style={{ fontWeight: 500 }}>ห้องตรวจ</label>
                            <Dropdown refEl={roomRef} isOpen={roomOpen} setOpen={setRoomOpen} value={room} placeholder="-- เลือกห้อง --" options={roomOptions} onSelect={setRoom} />
                          </div>
                          {/* สัตวแพทย์ผู้ดูแล */}
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-1 text-xs text-gray-500" style={{ fontWeight: 500 }}><User className="w-3 h-3 text-gray-400" />สัตวแพทย์ผู้ดูแล</label>
                            <div className="relative" ref={vetRef}>
                              <button
                                type="button"
                                onClick={() => setVetOpen(!vetOpen)}
                                className="flex items-center gap-2 w-full h-[38px] px-3 text-sm bg-white border border-gray-200 rounded-[14px] cursor-pointer transition-all hover:border-gray-300"
                                style={{ fontWeight: 500 }}
                              >
                                <div className="w-6 h-6 rounded-full bg-vet-teal/10 flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 text-vet-teal" />
                                </div>
                                <span className="text-gray-700 text-left flex-1">{vet}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${vetOpen ? "rotate-180" : ""}`} />
                              </button>
                              <AnimatePresence>
                                {vetOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute z-[99999] mt-1 w-full bg-white border border-gray-200 rounded-xl overflow-hidden py-1"
                                    style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                                  >
                                    {vetOptions.map((v) => {
                                      const sel = vet === v;
                                      return (
                                        <button key={v} type="button" onClick={() => { setVet(v); setVetOpen(false); }}
                                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm cursor-pointer transition-colors ${sel ? "bg-vet-teal/10" : "hover:bg-gray-50"}`}
                                          style={sel ? { color: "var(--vet-teal)", fontWeight: 600 } : { fontWeight: 400 }}
                                        >
                                          <div className="w-5 h-5 rounded-full bg-vet-teal/10 flex items-center justify-center"><User className="w-2.5 h-2.5 text-vet-teal" /></div>
                                          {v}
                                          {sel && <Check className="w-3.5 h-3.5 ml-auto text-vet-teal" />}
                                        </button>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          {/* วันเวลารับบริการ */}
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-1 text-xs text-gray-500" style={{ fontWeight: 500 }}><Calendar className="w-3 h-3 text-gray-400" />วันเวลารับบริการ</label>
                            <div className="flex items-center gap-2 w-full h-[38px] px-3 text-sm bg-white border border-gray-200 rounded-[14px]">
                              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-3 h-3 text-blue-500" />
                              </div>
                              <span className="text-gray-700">{dateStr}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Section: รายละเอียดอาการ ── */}
                    <div className="vet-section-bg rounded-[14px] border border-gray-100 overflow-hidden">
                      <div className="px-4 pt-4 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 rounded-full bg-vet-orange" />
                          <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>รายละเอียดอาการ</span>
                          <span className="text-[10px] text-gray-400">Symptoms Details</span>
                        </div>

                        <label className="text-xs text-gray-500 mb-2 block" style={{ fontWeight: 500 }}>อาการที่พบ (เลือกได้หลายอาการ) <span className="text-red-400">*</span></label>
                        <div className="flex flex-wrap gap-2">
                          {symptomOptions.map((s) => {
                            const sel = symptoms.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleSymptom(s)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${sel ? "text-white border-vet-teal" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
                                style={sel ? { background: "var(--vet-teal)", fontWeight: 500, boxShadow: "0 1px 3px rgba(25,165,137,0.3)" } : { fontWeight: 400 }}
                              >
                                {sel && <Check className="w-3 h-3" />}
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ Footer ═══ */}
            <div className="vet-modal-footer">
              {step === 2 ? (
                <>
                  <div className="flex items-center gap-2">
                    {/* Status badge */}
                    <div className="flex items-center gap-1.5 h-[32px] px-3 rounded-full border border-gray-200 bg-white text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-amber-600" style={{ fontWeight: 500 }}>รอตรวจ</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { onSave?.({ pet: selectedPet!, visitType, room, vet, symptoms }); onClose(); }}
                    className="vet-btn vet-btn-primary ml-auto"
                  >
                    <Stethoscope className="w-4 h-4" />
                    บันทึกข้อมูลส่งตรวจ
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-end w-full">
                  <button
                    onClick={onClose}
                    className="vet-btn vet-btn-ghost"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}