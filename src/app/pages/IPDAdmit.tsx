import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Search, Bed, Check, X, ClipboardPlus, Stethoscope,
  AlertTriangle, Activity, Heart, Shield, PawPrint, Wind, Package,
  FileSignature, ChevronDown, BookOpen,
} from "lucide-react";
import { useIPD, type AdmitSeverity, type CageType } from "../contexts/IPDContext";
import { usePets } from "../contexts/PetsContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import { formatPhone } from "../utils/format";
import { DatePickerModern } from "../components/DatePickerModern";
import { TimePickerModern } from "../components/TimePickerModern";

/* ICD-10 reference list for autocomplete */
const ICD10_OPTIONS = [
  { code: "K29.7", name: "Gastroenteritis (กระเพาะอาหารและลำไส้อักเสบ)" },
  { code: "N18.2", name: "Chronic kidney disease, stage 2 (ไตวายเรื้อรัง stage 2)" },
  { code: "N18.3", name: "Chronic kidney disease, stage 3" },
  { code: "K85",   name: "Acute pancreatitis (ตับอ่อนอักเสบเฉียบพลัน)" },
  { code: "J96.0", name: "Acute respiratory failure (หายใจล้มเหลวเฉียบพลัน)" },
  { code: "L30.9", name: "Dermatitis, unspecified (ผิวหนังอักเสบ)" },
  { code: "I10",   name: "Essential (primary) hypertension" },
  { code: "A02.9", name: "Salmonella infection, unspecified" },
  { code: "R09.02", name: "Hypoxemia (ภาวะออกซิเจนในเลือดต่ำ)" },
  { code: "S52",   name: "Fracture of forearm" },
  { code: "Z51.5", name: "Encounter for palliative care" },
];

const DOCTORS = [
  "สพ.ว. สมชาย รักสัตว์",
  "สพ.ว. สุภา มีสุข",
  "สพ.ว. ปรีชา",
  "สพ.ว. นภา",
  "สพ.ว. ธีรพงษ์",
];

const BELONGING_OPTIONS = [
  "ปลอกคอ / สายจูง",
  "อาหารประจำ",
  "ยาเดิม",
  "ผ้าห่ม / ที่นอน",
  "ของเล่น",
  "ชามอาหาร / ชามน้ำ",
];

const severityOptions: { value: AdmitSeverity; label: string; color: string; grad: string; icon: typeof Activity }[] = [
  { value: "Critical",    label: "วิกฤต",     color: "#ef4444", grad: "linear-gradient(135deg, #f87171, #dc2626)", icon: AlertTriangle },
  { value: "Observation", label: "เฝ้าระวัง", color: "#f59e0b", grad: "linear-gradient(135deg, #fbbf24, #d97706)", icon: Activity },
  { value: "Recovering",  label: "ฟื้นฟู",    color: "#10b981", grad: "linear-gradient(135deg, #34d399, #059669)", icon: Heart },
  { value: "Isolation",   label: "แยกโรค",    color: "#8b5cf6", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", icon: Shield },
];

const cageTypeOptions: { value: CageType; icon: typeof Bed; color: string; grad: string }[] = [
  { value: "Small",     icon: Bed,    color: "#0ea5e9", grad: "linear-gradient(135deg, #38bdf8, #0284c7)" },
  { value: "Medium",    icon: Bed,    color: "#19a589", grad: "linear-gradient(135deg, #34d399, #0d7c66)" },
  { value: "Large",     icon: Bed,    color: "#8b5cf6", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
  { value: "ICU",       icon: Heart,  color: "#ef4444", grad: "linear-gradient(135deg, #f87171, #dc2626)" },
  { value: "Isolation", icon: Shield, color: "#f59e0b", grad: "linear-gradient(135deg, #fbbf24, #d97706)" },
  { value: "Oxygen",    icon: Wind,   color: "#06b6d4", grad: "linear-gradient(135deg, #22d3ee, #0891b2)" },
];

export function IPDAdmit() {
  const navigate = useNavigate();
  const { cages, admits, addAdmit } = useIPD();
  const { pets } = usePets();
  const { showSnackbar } = useSnackbar();

  const [petQuery, setPetQuery] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [severity, setSeverity] = useState<AdmitSeverity>("Observation");
  const [cageType, setCageType] = useState<CageType>("Medium");
  const [selectedCageId, setSelectedCageId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [provisionalDx, setProvisionalDx] = useState("");
  const [showIcdSearch, setShowIcdSearch] = useState(false);
  const [reason, setReason] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [belongings, setBelongings] = useState<string[]>([]);
  const [consentSigned, setConsentSigned] = useState(false);
  // Admit date/time (editable, default = now)
  const [admitDate, setAdmitDate] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  });
  const [admitTime, setAdmitTime] = useState(() => new Date().toTimeString().slice(0, 5));
  // Cancel confirm
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const filteredIcd = useMemo(() => {
    if (!diagnosis) return ICD10_OPTIONS.slice(0, 6);
    const q = diagnosis.toLowerCase();
    return ICD10_OPTIONS.filter(o => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q)).slice(0, 6);
  }, [diagnosis]);

  const toggleBelonging = (b: string) => {
    setBelongings(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);
  };

  const filteredPets = useMemo(() => {
    if (!petQuery) return pets.slice(0, 6);
    const q = petQuery.toLowerCase();
    return pets.filter(p => p.name.toLowerCase().includes(q) || p.hn.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q)).slice(0, 6);
  }, [pets, petQuery]);

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const availableCages = cages.filter(c => c.status === "available" && c.type === cageType);
  const canSubmit = !!selectedPet && !!selectedCageId && !!diagnosis.trim();

  // Auto-generated AN — running per Buddhist year (e.g. AN-2569-001)
  const buddhistYear = new Date().getFullYear() + 543;
  const yearPrefix = `AN-${buddhistYear}-`;
  const seq = admits.filter(a => a.an?.startsWith(yearPrefix)).length + 1;
  const an = `${yearPrefix}${String(seq).padStart(3, "0")}`;

  const handleSubmit = () => {
    if (!canSubmit || !selectedPet) return;
    const now = new Date();
    const newAdmit = addAdmit({
      an,
      hn: selectedPet.hn,
      petName: selectedPet.name,
      species: selectedPet.species,
      breed: selectedPet.breed,
      photo: selectedPet.image ?? undefined,
      owner: selectedPet.owner,
      ownerPhone: formatPhone(selectedPet.ownerPhone),
      cageId: selectedCageId,
      cageType,
      severity,
      diagnosis,
      provisionalDx: provisionalDx.trim() || undefined,
      diagnosisCode: diagnosisCode || undefined,
      admitDate,
      admitTime,
      doctor,
      reason,
      belongings,
      treatmentPlan: treatmentPlan || undefined,
      consentSigned,
      consentSignedAt: consentSigned ? now.toISOString() : undefined,
      consentSignedBy: consentSigned ? selectedPet.owner : undefined,
      totalCharge: 0,
      paid: 0,
    });
    showSnackbar("success", `Admit ${selectedPet.name} ที่กรง ${selectedCageId} สำเร็จ`);
    navigate(`/ipd/patient/${newAdmit.id}`);
  };

  return (
    <div className="p-4 space-y-4 min-h-full" style={{ background: "#FEFBF8" }}>
      {/* APPBAR — back + breadcrumb + actions */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> กลับ
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0 text-[12px]">
            <span className="text-gray-400">IPD</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 truncate" style={{ fontWeight: 600 }}>Admit ผู้ป่วยใหม่</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] flex-shrink-0" style={{ fontWeight: 700, background: "rgba(25,165,137,0.10)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)", letterSpacing: "0.04em" }}>
            {an}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11.5px] text-gray-400" style={{ fontWeight: 500 }}>
            <ClipboardPlus className="w-3.5 h-3.5" /> {selectedPet ? "พร้อมยืนยัน" : "ร่างใหม่ – กรอกข้อมูล"}
          </span>
          <span className="hidden md:block w-px h-5 bg-gray-200" />
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="h-[34px] inline-flex items-center gap-1.5 text-[12px] px-3 rounded-full text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <X className="w-3.5 h-3.5" /> <span className="hidden sm:inline">ยกเลิก admit</span>
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="h-[34px] inline-flex items-center gap-1.5 text-[12px] pl-2.5 pr-3 rounded-full text-white transition-all hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontWeight: 700,
              background: canSubmit
                ? "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)"
                : "linear-gradient(135deg, #9ca3af, #6b7280)",
              border: canSubmit ? "1px solid rgba(253,186,116,0.85)" : "1px solid #9ca3af",
              boxShadow: canSubmit ? "0 4px 14px rgba(234,88,12,0.40), inset 0 1px 0 rgba(255,255,255,0.40)" : "none",
              textShadow: canSubmit ? "0 1px 2px rgba(0,0,0,0.15)" : undefined,
            }}
          >
            <Check className="w-4 h-4 text-white" strokeWidth={2.8} />
            <span className="hidden sm:inline">ยืนยัน Admit</span>
            <span className="sm:hidden">ยืนยัน</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* ━━ LEFT column ━━ */}
        <div className="space-y-4">

        {/* SECTION 1 — เลือกสัตว์เลี้ยง */}
        <section
          className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <PawPrint className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
                เลือกสัตว์เลี้ยง <span className="text-rose-400">*</span>
              </h3>
              <p className="text-[11px] text-gray-500">ค้นหา HN / ชื่อ / เจ้าของ</p>
            </div>
            {selectedPet && (
              <span
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)", fontSize: 11, fontWeight: 700 }}
              >
                <Check className="w-3 h-3" strokeWidth={3} /> เลือกแล้ว
              </span>
            )}
          </div>

          <div className="p-4">
            {selectedPet ? (
              <div className="vet-list-item selected p-3 flex items-center gap-3">
                <img
                  src={selectedPet.image ?? ""}
                  alt={selectedPet.name}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0 bg-gray-100"
                  style={{ boxShadow: "0 0 0 2.5px white, 0 0 0 3.5px rgba(25,165,137,0.30)" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[14px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{selectedPet.name}</span>
                    <span className="text-[10px] text-[#0d7c66] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(25,165,137,0.15)", fontWeight: 700 }}>{selectedPet.hn}</span>
                  </div>
                  <div className="text-[11px] text-gray-600 truncate">{selectedPet.species} · {selectedPet.breed} · {selectedPet.age}</div>
                  <div className="text-[11px] text-gray-500 truncate">เจ้าของ: {selectedPet.owner} · {selectedPet.ownerPhone}</div>
                </div>
                <button onClick={() => setSelectedPetId(null)} className="vet-btn-ghost p-1.5 rounded-full text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={petQuery}
                    onChange={(e) => setPetQuery(e.target.value)}
                    placeholder="พิมพ์ HN, ชื่อ, หรือชื่อเจ้าของ…"
                    className="vet-input has-icon-left"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredPets.length === 0 ? (
                    <div className="col-span-full text-center text-[11px] text-gray-400 py-6">ไม่พบสัตว์เลี้ยง</div>
                  ) : (
                    filteredPets.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPetId(p.id)}
                        className="vet-list-item p-2 flex items-center gap-2.5 text-left"
                      >
                        <img src={p.image ?? ""} alt={p.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-gray-100" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 600 }}>{p.name}</div>
                          <div className="text-[10.5px] text-gray-500 truncate">{p.hn} · {p.species}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2 — เลือกกรง */}
        <section
          className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Bed className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
                เลือกกรง <span className="text-rose-400">*</span>
              </h3>
              <p className="text-[11px] text-gray-500">กรง {cageType} ว่าง {availableCages.length} กรง</p>
            </div>
            {selectedCageId && (
              <span
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)", fontSize: 11, fontWeight: 700 }}
              >
                <Check className="w-3 h-3" strokeWidth={3} /> {selectedCageId}
              </span>
            )}
          </div>

          <div className="p-3 space-y-3">
            {/* Cage type picker — visual cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {cageTypeOptions.map(t => {
                const Icon = t.icon;
                const isActive = cageType === t.value;
                const count = cages.filter(c => c.status === "available" && c.type === t.value).length;
                return (
                  <motion.button
                    key={t.value}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setCageType(t.value); setSelectedCageId(""); }}
                    className="relative flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl transition-all duration-200 text-center hover:-translate-y-0.5"
                    style={{
                      background: isActive ? `${t.color}0d` : "#ffffff",
                      border: isActive ? `1.5px solid ${t.color}` : "1.5px solid #f3f4f6",
                      boxShadow: isActive ? `0 4px 14px ${t.color}35, inset 0 1px 0 rgba(255,255,255,0.50)` : "none",
                    }}
                  >
                    <span
                      className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                      style={{
                        background: isActive ? t.grad : "#f3f4f6",
                        boxShadow: isActive ? `0 3px 10px ${t.color}55, inset 0 1px 0 rgba(255,255,255,0.30)` : "none",
                      }}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: isActive ? "white" : t.color }} />
                    </span>
                    <span className="text-[11px] text-gray-900 leading-tight" style={{ fontWeight: isActive ? 700 : 600 }}>
                      {t.value}
                    </span>
                    <span className="text-[9.5px] px-1.5 rounded-full" style={{
                      background: isActive ? `${t.color}15` : "#f3f4f6",
                      color: isActive ? t.color : "#9ca3af",
                      fontWeight: 700,
                      lineHeight: "14px",
                    }}>
                      ว่าง {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Cage grid */}
            <div>
              <div className="text-[11px] text-gray-500 mb-2 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                เลือกหมายเลขกรง {cageType}
                <span className="text-gray-400" style={{ fontWeight: 500 }}>({availableCages.length} ว่าง)</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {availableCages.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-[11px] text-gray-400 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
                    <AlertTriangle className="w-5 h-5 mx-auto mb-1.5 text-amber-500" />
                    ไม่มีกรง {cageType} ว่าง
                  </div>
                ) : (
                  availableCages.map(c => {
                    const cur = cageTypeOptions.find(o => o.value === c.type)!;
                    const Icon = cur.icon;
                    const isActive = selectedCageId === c.id;
                    return (
                      <motion.button
                        key={c.id}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedCageId(c.id)}
                        className="relative flex items-center gap-2 p-2 rounded-2xl transition-all duration-200 text-left hover:-translate-y-0.5"
                        style={{
                          background: isActive ? `${cur.color}0d` : "#ffffff",
                          border: isActive ? `1.5px solid ${cur.color}` : "1.5px solid #f3f4f6",
                          boxShadow: isActive ? `0 4px 14px ${cur.color}35` : "0 1px 3px rgba(0,0,0,0.03)",
                        }}
                      >
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isActive ? cur.grad : "#f3f4f6",
                            boxShadow: isActive ? `0 2px 6px ${cur.color}55` : "none",
                          }}
                        >
                          <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: isActive ? "white" : cur.color }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "0.2px", lineHeight: 1.1 }}>{c.id}</div>
                          <div className="text-[9.5px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{c.ward.replace("Ward ", "")}</div>
                        </div>
                        {isActive && (
                          <span
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                            style={{ background: cur.grad, boxShadow: `0 2px 6px ${cur.color}55` }}
                          >
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        </div>{/* END LEFT column */}

        {/* ━━ RIGHT column ━━ */}
        <div className="space-y-4">

        {/* SECTION 3 — ระดับความรุนแรง */}
        <section
          className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <AlertTriangle className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
                ระดับความรุนแรง <span className="text-rose-400">*</span>
              </h3>
              <p className="text-[11px] text-gray-500">เลือกระดับการดูแลผู้ป่วย</p>
            </div>
          </div>

          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {severityOptions.map(opt => {
              const Icon = opt.icon;
              const isActive = severity === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSeverity(opt.value)}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 text-center hover:-translate-y-0.5"
                  style={{
                    background: isActive ? `${opt.color}0d` : "#ffffff",
                    border: isActive ? `1.5px solid ${opt.color}` : "1.5px solid #f3f4f6",
                    boxShadow: isActive ? `0 4px 14px ${opt.color}35, inset 0 1px 0 rgba(255,255,255,0.50)` : "none",
                  }}
                >
                  <span
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                    style={{
                      background: isActive ? opt.grad : "#f3f4f6",
                      boxShadow: isActive ? `0 3px 10px ${opt.color}55, inset 0 1px 0 rgba(255,255,255,0.30)` : "none",
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.2} style={{ color: isActive ? "white" : opt.color }} />
                  </span>
                  <span className="text-[11.5px] text-gray-900 leading-tight" style={{ fontWeight: isActive ? 700 : 600, letterSpacing: "-0.1px" }}>
                    {opt.label}
                  </span>
                  {isActive && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ background: opt.grad, boxShadow: `0 2px 6px ${opt.color}55` }}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* SECTION 4 — ข้อมูลทางการแพทย์ */}
        <section
          className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Stethoscope className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
                ข้อมูลทางการแพทย์ <span className="text-rose-400">*</span>
              </h3>
              <p className="text-[11px] text-gray-500">การวินิจฉัยและเหตุผล Admit</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Admit date / time (editable) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="vet-label">วันที่ Admit</label>
                <DatePickerModern value={admitDate} onChange={setAdmitDate} placeholder="เลือกวันที่" />
              </div>
              <div>
                <label className="vet-label">เวลา Admit</label>
                <TimePickerModern value={admitTime} onChange={setAdmitTime} />
              </div>
            </div>

            {/* Provisional Dx — วินิจฉัยเบื้องต้นก่อนยืนยัน Dx */}
            <div>
              <label className="vet-label">การวินิจฉัยเบื้องต้น (Provisional Dx)</label>
              <textarea
                value={provisionalDx}
                onChange={(e) => setProvisionalDx(e.target.value)}
                rows={2}
                placeholder="เช่น สงสัย Gastroenteritis ร่วมกับภาวะขาดน้ำ — ก่อนยืนยัน Dx"
                className="vet-textarea"
              />
            </div>

            {/* Diagnosis with ICD-10 autocomplete */}
            <div className="relative">
              <label className="vet-label">การวินิจฉัย / ICD-10 <span className="required">*</span></label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => { setDiagnosis(e.target.value); setShowIcdSearch(true); }}
                  onFocus={() => setShowIcdSearch(true)}
                  onBlur={() => setTimeout(() => setShowIcdSearch(false), 200)}
                  placeholder="พิมพ์ชื่อโรค หรือ ICD-10 code เช่น K29.7, Gastroenteritis..."
                  className="vet-input has-icon-left"
                />
                {diagnosisCode && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.10)", fontWeight: 700 }}>
                    ICD-10: {diagnosisCode}
                  </span>
                )}
              </div>
              <AnimatePresence>
                {showIcdSearch && filteredIcd.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden py-1 max-h-[300px] overflow-y-auto"
                    style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)" }}
                  >
                    {filteredIcd.map(o => (
                      <button
                        key={o.code}
                        type="button"
                        onMouseDown={() => {
                          setDiagnosis(o.name);
                          setDiagnosisCode(o.code);
                          setShowIcdSearch(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                      >
                        <span className="text-[10px] text-blue-700 px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(59,130,246,0.10)", fontWeight: 700, minWidth: 56, textAlign: "center" }}>
                          {o.code}
                        </span>
                        <span className="text-[12px] text-gray-700 truncate" style={{ fontWeight: 500 }}>{o.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Doctor */}
            <div>
              <label className="vet-label">แพทย์ผู้ดูแล <span className="required">*</span></label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select value={doctor} onChange={e => setDoctor(e.target.value)} className="vet-select has-icon-left pr-8 appearance-none">
                  {DOCTORS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="vet-label">เหตุผล Admit / Chief Complaint</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="อาการหรือเหตุผลที่ต้อง Admit"
                className="vet-textarea"
              />
            </div>

            {/* Treatment Plan */}
            <div>
              <label className="vet-label">Treatment Plan</label>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={3}
                placeholder="แผนการรักษา เช่น IV fluid, monitor vitals q4h, ATB course 5 วัน..."
                className="vet-textarea"
              />
            </div>
          </div>
        </section>

        {/* SECTION 5 — สิ่งของส่วนตัว */}
        <section
          className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Package className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>สิ่งของที่เจ้าของฝากไว้</h3>
              <p className="text-[11px] text-gray-500">เลือกได้หลายรายการ</p>
            </div>
            {belongings.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)", fontSize: 11, fontWeight: 700 }}>
                <Check className="w-3 h-3" strokeWidth={3} /> {belongings.length}
              </span>
            )}
          </div>
          <div className="p-3 flex flex-wrap gap-1.5">
            {BELONGING_OPTIONS.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBelonging(b)}
                className={belongings.includes(b) ? "vet-chip vet-chip-active" : "vet-chip"}
              >
                {b}
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 6 — Consent */}
        <section
          className="relative bg-white rounded-2xl border overflow-hidden"
          style={{
            borderColor: consentSigned ? "rgba(25,165,137,0.40)" : "#f3f4f6",
            background: consentSigned ? "rgba(25,165,137,0.04)" : "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: consentSigned ? "rgba(25,165,137,0.15)" : "#f3f4f6" }}>
              <FileSignature className="w-4.5 h-4.5" style={{ color: consentSigned ? "#0d7c66" : "#6b7280" }} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>Consent Form</h3>
              <p className="text-[11px] text-gray-500">หนังสือยินยอมรับการรักษา</p>
            </div>
          </div>
          <div className="p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all mt-0.5" style={{
                background: consentSigned ? "linear-gradient(135deg, #34d399, #059669)" : "#ffffff",
                border: `1.5px solid ${consentSigned ? "#059669" : "#d1d5db"}`,
                boxShadow: consentSigned ? "0 2px 6px rgba(16,185,129,0.40)" : "none",
              }}>
                {consentSigned && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>
                  เจ้าของยินยอมและรับทราบแผนการรักษา
                </div>
                <div className="text-[11.5px] text-gray-600 mt-0.5" style={{ lineHeight: 1.5 }}>
                  ยินยอมให้สถานพยาบาลให้การรักษา · ทำหัตถการตามแผน · รับผิดชอบค่าใช้จ่าย · เข้าใจความเสี่ยงที่อาจเกิดขึ้น
                </div>
                <input type="checkbox" className="hidden" checked={consentSigned} onChange={e => setConsentSigned(e.target.checked)} />
              </div>
            </label>
          </div>
        </section>

        </div>{/* END RIGHT column */}
      </div>

      {/* Cancel admit confirm */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-[360px] overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#fb7185,#e11d48)" }}>
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>ยกเลิก admit</h3>
                  <p className="text-[11px] text-gray-500">ข้อมูลที่กรอกจะหายไป</p>
                </div>
              </div>
              <div className="p-4 text-[12.5px] text-gray-600">
                ต้องการยกเลิกการ admit นี้ใช่หรือไม่? ระบบจะกลับไปยังหน้าก่อนหน้าโดยไม่บันทึก
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <button type="button" onClick={() => setShowCancelConfirm(false)} className="px-3.5 py-1.5 text-[12px] text-gray-600 rounded-full hover:bg-gray-100" style={{ fontWeight: 600 }}>
                  กลับไปกรอกต่อ
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCancelConfirm(false); showSnackbar("delete", "ยกเลิก admit แล้ว"); navigate(-1); }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded-full"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg,#fb7185,#e11d48)" }}
                >
                  <X className="w-3.5 h-3.5" /> ยืนยันยกเลิก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
