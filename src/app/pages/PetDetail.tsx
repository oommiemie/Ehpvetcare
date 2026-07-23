import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router";
import {
  PawPrint, Edit2, Trash2, ArrowLeft, User, Phone, Hash, Palette,
  Scale, Calendar, Cpu, Shield, GitBranch, Heart, AlertTriangle,
  Syringe, Scissors, Stethoscope, FileText, Pill, ChevronDown, ChevronUp,
  Activity, Printer, Camera, Plus, Check,
} from "lucide-react";

import { AddPetModal } from "../components/AddPetModal";
import { getSpeciesAvatar } from "../components/petAvatars";
import { useSnackbar } from "../contexts/SnackbarContext";
import { usePets } from "../contexts/PetsContext";
import { formatPhone } from "../utils/format";

const speciesEmojiMap: Record<string, string> = {
  "สุนัข": "🐶", "แมว": "🐱", "นก": "🐦", "ปลา": "🐠",
  "กระต่าย": "🐰", "สัตว์เลื้อยคลาน": "🦎", "สัตว์เลี้ยงขนาดเล็ก": "🐹",
};

/* ─── Data section — bordered sub-card with neutral header + grouped rows ─── */
interface DataField {
  label: string;
  value: string;
  icon: any;
  color: string;
  soft: string;
  span?: number;
  isGender?: string;
}
function DataRow({ f }: { f: DataField }) {
  const Icon = f.icon;
  const spanClass = f.span === 3 ? "sm:col-span-3" : f.span === 2 ? "sm:col-span-2" : "";
  return (
    <div
      className={`group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50/80 hover:translate-x-0.5 cursor-default ${spanClass}`}
    >
      <span
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
        style={{ background: f.color, boxShadow: `0 0 8px ${f.color}88` }}
      />
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-transform duration-200 group-hover:scale-110"
        style={{ background: f.color, boxShadow: `0 2px 6px ${f.color}55, inset 0 1px 0 rgba(255,255,255,0.30)` }}
      >
        {f.isGender ? (
          <span className="text-[11px] leading-none select-none" style={{ fontWeight: 700 }}>
            {f.isGender === "เพศเมีย" ? "♀" : f.isGender === "เพศผู้" ? "♂" : "?"}
          </span>
        ) : (
          <Icon className="w-3 h-3" strokeWidth={2.4} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10.5px] text-gray-400 mb-0.5" style={{ fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase" }}>{f.label}</div>
        <div className="text-[14px] text-gray-900 truncate" style={{ fontWeight: 600, letterSpacing: "-0.1px" }}>{f.value}</div>
      </div>
    </div>
  );
}
function DataSection({
  icon: HeadIcon, title, subtitle, color, badge, fields, cols = 2,
}: { icon: any; title: string; subtitle?: string; color: string; badge?: string; fields: DataField[]; cols?: 2 | 3 }) {
  const gridClass = cols === 3 ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-0.5" : "grid grid-cols-1 sm:grid-cols-2 gap-0.5";
  return (
    <section className="relative rounded-2xl border border-gray-100 overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      {/* Header zone — neutral, no color */}
      <div className="relative px-4 py-3.5 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
          <HeadIcon className="w-4.5 h-4.5" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.25 }}>{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{subtitle}</p>}
        </div>
        {badge && (
          <span
            className="relative inline-flex items-center justify-center px-2.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${color}14`, color, fontWeight: 700, fontSize: "calc(10.5px * var(--fs))", border: `1px solid ${color}26` }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className={gridClass}>
          {fields.map((f) => <DataRow key={f.label} f={f} />)}
        </div>
      </div>
    </section>
  );
}

/* Parse medication string like "Metronidazole 250mg 2x1 PC 5 วัน" → structured fields.
   Pattern: <Name> <Freq>x<Qty> <Timing?> <Duration?>
   Timing: PC=หลังอาหาร, AC=ก่อนอาหาร, HS=ก่อนนอน, qNh = ทุก N ชม. */
const MED_TIMING_LABEL: Record<string, string> = {
  PC: "หลังอาหาร",
  AC: "ก่อนอาหาร",
  HS: "ก่อนนอน",
  MN: "ตอนเช้า",
  PRN: "เมื่อจำเป็น",
};
function parseMedication(s: string): {
  name: string;
  structured: boolean;
  frequency?: number;
  quantity?: number;
  unit?: string;
  timing?: string;
  timingLabel?: string;
  duration?: string;
} {
  // Match: <name (everything before)> <N>x<N> <TIMING?> <duration?>
  const m = s.match(/^(.+?)\s+(\d+)x(\d+)\s*(PC|AC|HS|MN|PRN|q\d+h)?\s*(\d+\s*(?:วัน|ครั้ง|สัปดาห์|เดือน))?$/i);
  if (!m) return { name: s, structured: false };
  const name = m[1].trim();
  const frequency = parseInt(m[2]);
  const quantity = parseInt(m[3]);
  const timing = m[4] ? m[4].toUpperCase() : "";
  // Infer unit from name (เม็ด/แคปซูล/ขวด/ml etc.)
  let unit = "เม็ด";
  if (/แคปซูล|capsule/i.test(name)) unit = "แคปซูล";
  else if (/ml|ซีซี|cc/i.test(name)) unit = "ml";
  else if (/ซอง|sachet/i.test(name)) unit = "ซอง";
  return {
    name,
    structured: true,
    frequency,
    quantity,
    unit,
    timing,
    timingLabel: timing ? (MED_TIMING_LABEL[timing] ?? timing) : "",
    duration: m[5] ? m[5].trim() : "",
  };
}

export function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPet, updatePet, deletePet } = usePets();
  const { showSnackbar } = useSnackbar();

  const pet = id ? getPet(Number(id)) : undefined;

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedVisit, setExpandedVisit] = useState<number | null>(1);

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{ background: "#FEFBF8" }}>
        <div className="text-5xl mb-3 opacity-30">🔍</div>
        <h2 className="text-gray-700 mb-1" style={{ fontWeight: 600 }}>ไม่พบข้อมูลสัตว์เลี้ยง</h2>
        <p className="text-sm text-gray-400 mb-4">รหัสที่ระบุไม่มีในระบบ หรืออาจถูกลบไปแล้ว</p>
        <button
          onClick={() => navigate("/pets")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] text-white"
          style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", fontWeight: 600 }}
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่รายการ
        </button>
      </div>
    );
  }

  const isMale = pet.gender === "เพศผู้";
  const isFemale = pet.gender === "เพศเมีย";

  const handleEditSave = (data: {
    hn: string; name: string; nameEn: string; species: string; breed: string; gender: string;
    color: string; weight: string; age: string; ageText: string; microchip: string;
    sterilized: boolean | null; sterilizedDate: string; food: string;
    owner: string; ownerPhone: string; allergies: string; chronic: string; imagePreview: string | null;
  }) => {
    updatePet(pet.id, {
      hn: data.hn || pet.hn,
      name: data.name,
      nameEn: data.nameEn || "",
      species: data.species || pet.species,
      breed: data.breed || "-",
      gender: data.gender || "-",
      weight: data.weight ? `${data.weight} กก.` : pet.weight,
      age: data.ageText || data.age || pet.age,
      microchip: data.microchip || "-",
      color: data.color || "-",
      owner: data.owner || pet.owner,
      ownerPhone: data.ownerPhone || pet.ownerPhone,
      allergies: data.allergies || "ไม่มี",
      chronic: data.chronic || "ไม่มี",
      sterilized: data.sterilized === true,
      image: data.imagePreview ?? pet.image,
    });
    setShowEdit(false);
    showSnackbar("update", "อัปเดตข้อมูลสัตว์เลี้ยงสำเร็จ");
  };

  const handleDeleteConfirm = () => {
    deletePet(pet.id);
    setShowDeleteConfirm(false);
    showSnackbar("delete", `ลบข้อมูล "${pet.name}" เรียบร้อยแล้ว`);
    navigate("/pets");
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: "#FEFBF8" }}>
      {/* ─── HEADER strip — back nav + breadcrumb + actions ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/pets")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> กลับ
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0 text-[12px]">
            <span className="text-gray-400">สัตว์เลี้ยง</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 truncate" style={{ fontWeight: 600 }}>{pet.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-gray-700 hover:bg-gray-100 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Edit2 className="w-3 h-3" />
            <span className="hidden sm:inline">แก้ไข</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-rose-500 hover:bg-rose-50 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">ลบ</span>
          </button>
        </div>
      </motion.div>

      {/* ─── PROFILE HERO SECTION (blurred pet photo bg) ─── */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden bg-gray-200"
      >
        {/* Blurred pet photo as full bg */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={pet.image || getSpeciesAvatar(pet.species)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(36px) saturate(150%)", transform: "scale(1.4)" }}
            onError={(e) => { (e.target as HTMLImageElement).src = getSpeciesAvatar(pet.species); }}
          />
          {/* Neutral dark overlay for white text readability */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.50) 100%)" }} />
          {/* Top accent stripe (subtle) */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45) 50%, transparent)" }} />
        </div>

        <div className="relative p-5 sm:p-6">
          {/* Top row — Avatar + Name/HN block + Visit button */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Avatar with rainbow conic ring + sex badge */}
            <div className="relative flex-shrink-0">
              <div
                className="rounded-full p-[3px]"
                style={{
                  background: "conic-gradient(from 180deg, #a78bfa, #ec4899, #f59e0b, #22c55e, #3b82f6, #a78bfa)",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
                }}
              >
                <div className="w-[84px] h-[84px] rounded-full overflow-hidden bg-white">
                  <img
                    src={pet.image || getSpeciesAvatar(pet.species)}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = getSpeciesAvatar(pet.species); }}
                  />
                </div>
              </div>
              {(isMale || isFemale) && (
                <span
                  className="absolute -bottom-1 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: isFemale ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)",
                    border: "3px solid #ffffff",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
                  }}
                >
                  <span className="text-[13px] text-white" style={{ fontWeight: 700, lineHeight: 1 }}>
                    {isFemale ? "♀" : "♂"}
                  </span>
                </span>
              )}
            </div>

            {/* Name + HN block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1
                  className="text-white"
                  style={{
                    fontWeight: 700,
                    fontSize: "calc(26px * var(--fs))",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.4,
                    paddingBottom: 4,
                    textShadow: "0 2px 8px rgba(0,0,0,0.35)",
                  }}
                >
                  {pet.name}
                </h1>
                <span
                  className="text-[11px] px-2.5 py-0.5 rounded-full text-white"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.30)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    fontWeight: 600,
                  }}
                >
                  {pet.hn}
                </span>
              </div>
              <p
                className="inline-flex items-center gap-2 text-white/90"
                style={{ fontSize: "calc(13px * var(--fs))", fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}
              >
                <span>{speciesEmojiMap[pet.species] ?? "🐾"}</span>
                {pet.species} · {pet.breed}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Owner pill — click to navigate */}
              <button
                onClick={() => navigate("/owners", { state: { search: pet.owner } })}
                className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.30)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontSize: "calc(12px * var(--fs))",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.18)",
                }}
                title={`ดูข้อมูลเจ้าของ: ${pet.owner}`}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.22)" }}>
                  <User className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
                </span>
                <span className="truncate max-w-[140px]">{pet.owner}</span>
              </button>

              {/* Print card — glass pill */}
              <button
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.30)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.18)",
                }}
              >
                <Printer className="w-3.5 h-3.5" strokeWidth={2.4} /> พิมพ์บัตร
              </button>

              {/* Add visit button — orange */}
              <button
                onClick={() => navigate("/visits", { state: { search: pet.name } })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
                  border: "1px solid rgba(253,186,116,0.55)",
                  fontWeight: 600,
                  boxShadow: "var(--hero-btn-shadow)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.18)",
                }}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.4} /> เปิดรับบริการ
              </button>
            </div>
          </div>

          {/* Bottom row — stat chips */}
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            {[
              { icon: Calendar, label: `อายุ ${pet.age}`, accent: "#a7f3d0" },
              { icon: Scale, label: pet.weight, accent: "#fde68a" },
              { icon: Activity, label: `${pet.visits} รับบริการ`, accent: "#ddd6fe" },
              { icon: Syringe, label: `${pet.vaccines.length} วัคซีน`, accent: "#fbcfe8" },
            ].map((chip, i) => {
              const Ico = chip.icon;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-white"
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    fontSize: "calc(11.5px * var(--fs))",
                    fontWeight: 600,
                  }}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
                    <Ico className="w-3 h-3" style={{ color: chip.accent }} />
                  </span>
                  {chip.label}
                </span>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ─── Detail content: 2 cards (LEFT info + RIGHT medical/history fits 420px) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 flex-1 min-h-0">
        {/* ━━━ LEFT: ข้อมูลทั่วไป + ข้อมูลทางการแพทย์ ━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-y-auto overflow-x-hidden min-h-0 px-2 pt-2 pb-4 space-y-4"
        >
          {/* ── Card 1: ข้อมูลทั่วไป ── */}
          <DataSection
            icon={PawPrint}
            title="ข้อมูลทั่วไป"
            subtitle="รายละเอียดสัตว์เลี้ยง"
            color="var(--brand)"
            cols={3}
            fields={[
              { label: "HN", value: pet.hn, icon: Hash, color: "var(--brand)", soft: "color-mix(in srgb, var(--brand) 10%, transparent)" },
              { label: "ชื่อภาษาอังกฤษ", value: pet.nameEn || "—", icon: PawPrint, color: "#0ea5e9", soft: "rgba(14,165,233,0.10)" },
              { label: "ชนิดสัตว์", value: pet.species, icon: PawPrint, color: "#f59e0b", soft: "rgba(245,158,11,0.10)" },
              { label: "สายพันธุ์", value: pet.breed, icon: GitBranch, color: "#8b5cf6", soft: "rgba(139,92,246,0.10)" },
              { label: "เพศ", value: pet.gender, icon: User, color: isFemale ? "#ec4899" : isMale ? "#0ea5e9" : "#64748b", soft: "rgba(0,0,0,0.05)", isGender: pet.gender },
              { label: "สี/ขน", value: pet.color, icon: Palette, color: "#ec4899", soft: "rgba(236,72,153,0.10)" },
              { label: "น้ำหนัก", value: pet.weight, icon: Scale, color: "#14b8a6", soft: "rgba(20,184,166,0.10)" },
              { label: "อายุ", value: pet.age, icon: Calendar, color: "#6366f1", soft: "rgba(99,102,241,0.10)" },
              { label: "ทำหมัน", value: pet.sterilized ? "ทำแล้ว" : "ยังไม่ทำ", icon: Shield, color: pet.sterilized ? "var(--brand)" : "#9ca3af", soft: "rgba(0,0,0,0.05)" },
              { label: "หมายเลขไมโครชิป", value: pet.microchip, icon: Cpu, color: "#64748b", soft: "rgba(100,116,139,0.10)", span: 3 },
              { label: "เจ้าของ", value: pet.owner, icon: User, color: "var(--brand)", soft: "color-mix(in srgb, var(--brand) 10%, transparent)" },
              { label: "เบอร์โทรเจ้าของ", value: formatPhone(pet.ownerPhone), icon: Phone, color: "#0ea5e9", soft: "rgba(14,165,233,0.10)", span: 2 },
            ]}
          />

          {/* ── Card 2: ข้อมูลทางการแพทย์ ── */}
          {(() => {
            const hasAllergy = pet.allergies !== "ไม่มี";
            const hasChronic = pet.chronic !== "ไม่มี";
            const isSterilized = pet.sterilized;
            const issueCount = (hasAllergy ? 1 : 0) + (hasChronic ? 1 : 0);
            const overallStatus = issueCount === 0
              ? { label: "สุขภาพดี", color: "#10b981", grad: "linear-gradient(135deg, #34d399, #059669)", soft: "rgba(16,185,129,0.10)" }
              : issueCount === 1
                ? { label: "เฝ้าระวัง", color: "#f59e0b", grad: "linear-gradient(135deg, #fbbf24, #d97706)", soft: "rgba(245,158,11,0.10)" }
                : { label: "ต้องดูแลใกล้ชิด", color: "#ef4444", grad: "linear-gradient(135deg, #f87171, #dc2626)", soft: "rgba(239,68,68,0.10)" };

            const medItems = [
              {
                key: "allergy",
                icon: AlertTriangle,
                label: "ประวัติแพ้ยา",
                value: pet.allergies,
                empty: hasAllergy ? null : "ไม่มีประวัติแพ้",
                status: hasAllergy ? "warning" : "clear" as const,
                accent: hasAllergy ? "#f59e0b" : "#10b981",
                accentGrad: hasAllergy
                  ? "linear-gradient(135deg, #fbbf24, #d97706)"
                  : "linear-gradient(135deg, #34d399, #059669)",
                tintBg: hasAllergy ? "#fffbeb" : "#f0fdf4",
                tintBorder: hasAllergy ? "#fed7aa" : "#bbf7d0",
              },
              {
                key: "chronic",
                icon: Heart,
                label: "โรคประจำตัว",
                value: pet.chronic,
                empty: hasChronic ? null : "ไม่มีโรคประจำตัว",
                status: hasChronic ? "danger" : "clear" as const,
                accent: hasChronic ? "#ef4444" : "#10b981",
                accentGrad: hasChronic
                  ? "linear-gradient(135deg, #f87171, #dc2626)"
                  : "linear-gradient(135deg, #34d399, #059669)",
                tintBg: hasChronic ? "#fef2f2" : "#f0fdf4",
                tintBorder: hasChronic ? "#fecaca" : "#bbf7d0",
              },
              {
                key: "sterilized",
                icon: Shield,
                label: "การทำหมัน",
                value: isSterilized ? "ทำแล้ว" : "ยังไม่ทำ",
                empty: null,
                status: isSterilized ? "clear" : "neutral" as const,
                accent: isSterilized ? "#10b981" : "#9ca3af",
                accentGrad: isSterilized
                  ? "linear-gradient(135deg, #34d399, #059669)"
                  : "linear-gradient(135deg, #d1d5db, #6b7280)",
                tintBg: isSterilized ? "#f0fdf4" : "#f9fafb",
                tintBorder: isSterilized ? "#bbf7d0" : "#e5e7eb",
              },
            ];

            return (
              <section className="relative rounded-2xl border border-gray-100 overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
                <div className="relative px-4 py-3.5 flex items-center gap-3 border-b border-gray-100/80">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
                    <Stethoscope className="w-4.5 h-4.5" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.25 }}>ข้อมูลทางการแพทย์</h2>
                    <p className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>ประวัติแพ้ยา · โรคประจำตัว · การทำหมัน</p>
                  </div>
                  {/* Overall health status badge */}
                  <span
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full flex-shrink-0"
                    style={{
                      background: overallStatus.soft,
                      border: `1px solid ${overallStatus.color}30`,
                      color: overallStatus.color,
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ background: overallStatus.grad, boxShadow: `0 1px 4px ${overallStatus.color}55` }}
                    >
                      {issueCount === 0
                        ? <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        : <AlertTriangle className="w-2.5 h-2.5" strokeWidth={3} />}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: "calc(11px * var(--fs))" }}>{overallStatus.label}</span>
                  </span>
                </div>

                <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {medItems.map((item) => {
                    const Icon = item.icon;
                    const isClear = item.status === "clear";
                    return (
                      <div
                        key={item.key}
                        className="relative rounded-xl p-3 overflow-hidden"
                        style={{
                          background: item.tintBg,
                          border: `1px solid ${item.tintBorder}`,
                        }}
                      >
                        {/* Left accent bar */}
                        <span
                          aria-hidden
                          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                          style={{ background: item.accentGrad, boxShadow: `0 0 8px ${item.accent}66` }}
                        />

                        {/* Header — icon + label + status chip */}
                        <div className="flex items-center gap-2 mb-2 pl-1.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              background: item.accentGrad,
                              boxShadow: `0 3px 10px ${item.accent}55, inset 0 1px 0 rgba(255,255,255,0.30)`,
                            }}
                          >
                            <Icon className="w-4 h-4" strokeWidth={2.4} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10.5px]" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: item.accent }}>
                              {item.label}
                            </div>
                            <div className="text-[9.5px] text-gray-400" style={{ fontWeight: 500 }}>
                              {item.status === "clear" ? "ปกติ" : item.status === "warning" ? "เฝ้าระวัง" : item.status === "danger" ? "ผิดปกติ" : "—"}
                            </div>
                          </div>
                        </div>

                        {/* Value or empty state */}
                        <div className="pl-1.5">
                          {item.empty ? (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Check className="w-3.5 h-3.5" style={{ color: item.accent }} strokeWidth={2.6} />
                              <span className="text-[12.5px]" style={{ fontWeight: 600 }}>{item.empty}</span>
                            </div>
                          ) : (
                            <div className="text-gray-900 text-[14px] leading-snug" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>
                              {item.value}
                            </div>
                          )}
                        </div>

                        {/* Decorative corner glow */}
                        {!isClear && item.status !== "neutral" && (
                          <span
                            aria-hidden
                            className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-30 pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${item.accent}55 0%, transparent 70%)` }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          {/* ── Card 3: วัคซีน ── */}
          <section className="relative rounded-2xl border border-gray-100 overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
            <div className="relative px-4 py-3.5 flex items-center gap-3 border-b border-gray-100/80">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
                <Syringe className="w-4.5 h-4.5" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.25 }}>วัคซีน</h2>
                <p className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>ประวัติการฉีดวัคซีนและนัดถัดไป</p>
              </div>
              <span
                className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand)", fontWeight: 700, fontSize: "calc(10.5px * var(--fs))", border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)" }}
              >
                {pet.vaccines.length} เข็ม
              </span>
            </div>
            <div className="p-3 space-y-2">
              {pet.vaccines.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-[13px]">ยังไม่มีข้อมูลวัคซีน</div>
              ) : (
                pet.vaccines.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 transition-all hover:bg-gray-50/80"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: "linear-gradient(135deg, #20b899, #0a4d3f)", boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 30%, transparent)" }}>
                      <Syringe className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{v.name}</div>
                      <div className="text-[11px] text-gray-400">รุ่นยา: {v.batch}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[11px] text-gray-500">ฉีดเมื่อ {v.date}</div>
                      <div className="text-[11.5px] text-(--brand)" style={{ fontWeight: 600 }}>นัดถัดไป {v.nextDue}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Card 4: การผ่าตัด ── */}
          <section className="relative rounded-2xl border border-gray-100 overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
            <div className="relative px-4 py-3.5 flex items-center gap-3 border-b border-gray-100/80">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
                <Scissors className="w-4.5 h-4.5" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.25 }}>การผ่าตัด</h2>
                <p className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>บันทึกการผ่าตัดและฟื้นตัว</p>
              </div>
              <span
                className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(139,92,246,0.10)", color: "#8b5cf6", fontWeight: 700, fontSize: "calc(10.5px * var(--fs))", border: "1px solid rgba(139,92,246,0.20)" }}
              >
                {pet.surgeries.length} ครั้ง
              </span>
            </div>
            <div className="p-3 space-y-2">
              {pet.surgeries.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-[13px]">ไม่มีบันทึกการผ่าตัด</div>
              ) : (
                pet.surgeries.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", boxShadow: "0 2px 8px rgba(139,92,246,0.30)" }}>
                        <Scissors className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] text-gray-900" style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{s.date} · {s.vet}</div>
                        <p className="text-[12.5px] text-gray-600 mt-1.5">{s.notes}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </motion.div>

        {/* ━━━ RIGHT: ประวัติการรักษา (fixed 420px column) ━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-y-auto overflow-x-hidden min-h-0 px-2 pt-2 pb-4"
        >
          <section>
            {/* Header — neutral, no color */}
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
                <Activity className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14.5px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.25 }}>ประวัติการรักษา</h2>
                <p className="text-[11px] text-gray-400 truncate" style={{ fontWeight: 500 }}>{pet.visitHistory.length} ครั้ง ทั้งหมด</p>
              </div>
            </div>

            {/* Visit timeline cards */}
            <div className="flex flex-col gap-3">
              {pet.visitHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-[13px]">ไม่มีประวัติการรักษา</div>
              ) : (
                pet.visitHistory.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all hover:-translate-y-0.5"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)" }}
                  >
                    {/* Card Header */}
                    <button
                      onClick={() => setExpandedVisit(expandedVisit === v.id ? null : v.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors text-left"
                    >
                      <div className="flex flex-col items-center flex-shrink-0 pt-0.5" style={{ minWidth: 44 }}>
                        <div className="text-[10.5px] text-gray-500" style={{ fontWeight: 600 }}>
                          {v.date.split(" ").slice(0, 2).join(" ")}
                        </div>
                        <div className="text-[10px] text-gray-400">{v.date.split(" ")[2]}</div>
                      </div>
                      <div className="w-px self-stretch bg-gray-100 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                              v.type === "OPD"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "bg-orange-50 text-orange-600 border border-orange-100"
                            }`}
                            style={{ fontWeight: 600 }}
                          >
                            {v.type}
                          </span>
                          <span className="text-[10.5px] text-gray-400">{v.time}</span>
                        </div>
                        <div className="text-[13px] text-gray-800 mt-1" style={{ fontWeight: 600 }}>{v.chiefComplaint}</div>
                        <div className="text-[10.5px] text-gray-400 truncate mt-0.5">{v.vet}</div>
                      </div>
                      {expandedVisit === v.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      }
                    </button>

                    {/* Expanded content */}
                    {expandedVisit === v.id && (
                      <div className="border-t border-gray-100/80 px-4 py-3 space-y-3 bg-gray-50/30">
                        {/* Weight */}
                        <div className="flex items-center gap-2 text-[11.5px] text-gray-500">
                          <Scale className="w-3 h-3 text-gray-400" />
                          <span>น้ำหนัก:</span>
                          <span className="text-gray-700" style={{ fontWeight: 600 }}>{v.weight}</span>
                        </div>

                        {/* Diagnosis */}
                        <div className="flex gap-2">
                          <Stethoscope className="w-3.5 h-3.5 text-(--brand) flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10.5px] text-gray-400 mb-0.5" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>การวินิจฉัย</div>
                            <div className="text-[13px] text-gray-700">{v.diagnosis}</div>
                          </div>
                        </div>

                        {/* Treatment */}
                        <div className="flex gap-2">
                          <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10.5px] text-gray-400 mb-0.5" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>การรักษา</div>
                            <div className="text-[13px] text-gray-700">{v.treatment}</div>
                          </div>
                        </div>

                        {/* Medications */}
                        {v.medications.length > 0 && (
                          <div className="flex gap-2">
                            <Pill className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-[10.5px] text-gray-400 mb-1.5" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                                ยาที่ได้รับ · {v.medications.length} รายการ
                              </div>
                              <div className="space-y-2">
                                {v.medications.map((med, mi) => {
                                  const parsed = parseMedication(med);
                                  const instruction = parsed.structured
                                    ? `กินวันละ ${parsed.frequency} ครั้ง ครั้งละ ${parsed.quantity} ${parsed.unit}${parsed.timingLabel ? ` ${parsed.timingLabel}` : ""}${parsed.duration ? ` นาน ${parsed.duration}` : ""}`
                                    : med;
                                  return (
                                    <div
                                      key={mi}
                                      className="rounded-xl bg-white border border-gray-100 p-2.5"
                                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                                    >
                                      {/* Header: number badge + name */}
                                      <div className="flex items-start gap-2">
                                        <div
                                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px]"
                                          style={{ background: "linear-gradient(135deg,#34d399,#059669)", fontWeight: 700 }}
                                        >
                                          {mi + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700, lineHeight: 1.2 }}>
                                            {parsed.name}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Instruction line */}
                                      <div className="mt-2 ml-7 flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-gray-50/70">
                                        <FileText className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-gray-600" style={{ fontWeight: 500 }}>
                                          {instruction}
                                        </p>
                                      </div>

                                      {/* Duration + total quantity chips */}
                                      {parsed.structured && (
                                        <div className="mt-1.5 ml-7 flex flex-wrap items-center gap-1">
                                          {(() => {
                                            const daysMatch = parsed.duration?.match(/(\d+)/);
                                            const days = daysMatch ? parseInt(daysMatch[1]) : 0;
                                            const total = parsed.frequency && parsed.quantity && days
                                              ? parsed.frequency * parsed.quantity * days
                                              : 0;
                                            return (
                                              <>
                                                {total > 0 && (
                                                  <span
                                                    className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    style={{ fontWeight: 700 }}
                                                  >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    รวม {total} {parsed.unit}
                                                  </span>
                                                )}
                                                {parsed.duration && (
                                                  <span
                                                    className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200"
                                                    style={{ fontWeight: 600 }}
                                                  >
                                                    {parsed.duration}
                                                  </span>
                                                )}
                                              </>
                                            );
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {v.notes && (
                          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-[11.5px] text-amber-700">
                            <span style={{ fontWeight: 600 }}>หมายเหตุ: </span>{v.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Files / image preview — simple */}
            {pet.image && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-2 px-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
                    <Camera className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14.5px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.25 }}>ไฟล์แนบ</h2>
                    <p className="text-[11px] text-gray-400 truncate" style={{ fontWeight: 500 }}>รูปภาพและเอกสาร</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)" }}>
                    <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                  <label className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-[11px] text-gray-400">อัปโหลด</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </section>
        </motion.div>
      </div>

      {/* Edit Pet Modal */}
      <AddPetModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleEditSave}
        initialData={{
          hn: pet.hn,
          name: pet.name,
          nameEn: pet.nameEn,
          species: pet.species,
          breed: pet.breed === "-" ? "" : pet.breed,
          gender: pet.gender === "-" ? "" : pet.gender,
          color: pet.color === "-" ? "" : pet.color,
          weight: pet.weight.replace(" กก.", ""),
          age: "",
          ageText: pet.age === "-" ? "" : pet.age,
          microchip: pet.microchip === "-" ? "" : pet.microchip,
          sterilized: pet.sterilized,
          sterilizedDate: "",
          food: "",
          owner: pet.owner === "-" ? "" : pet.owner,
          ownerPhone: pet.ownerPhone === "-" ? "" : pet.ownerPhone,
          allergies: pet.allergies,
          chronic: pet.chronic,
          imagePreview: pet.image,
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="vet-modal-header rounded-t-3xl" style={{ background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)" }}>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                        <Trash2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>ยืนยันการลบข้อมูล</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-100">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-100">
                      <img
                        src={pet.image || getSpeciesAvatar(pet.species)}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getSpeciesAvatar(pet.species); }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{pet.name}</p>
                      <p className="text-xs text-gray-400">{pet.hn} · {pet.species} · {pet.breed}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ข้อมูลสัตว์เลี้ยงและประวัติการรักษาทั้งหมดจะถูกลบออกจากระบบ
                  </p>
                </div>

                <div className="vet-modal-footer rounded-b-3xl">
                  <button onClick={() => setShowDeleteConfirm(false)} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>ยกเลิก</button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex items-center justify-center gap-1.5 text-sm px-5 py-2 text-white rounded-full transition-all active:scale-[0.97]"
                    style={{ fontWeight: 600, background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบข้อมูล
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
