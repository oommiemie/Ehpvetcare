import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router";
import {
  User, Phone, Mail, MapPin, Edit2, Trash2, PawPrint,
  Calendar, Heart, ArrowLeft, Plus, IdCard, MessageCircle, ChevronRight,
} from "lucide-react";

import { AddOwnerModal } from "../components/AddOwnerModal";
import { getSpeciesAvatar, getGenderAvatar } from "../components/petAvatars";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useOwners, petSpeciesMap, petPhotoMap } from "../contexts/OwnersContext";
import { formatPhone } from "../utils/format";

/* ─── Section header ─── */
function SectionHeader({
  icon: Icon, title, subtitle, color, badge,
}: { icon: any; title: string; subtitle?: string; color: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
        style={{
          background: `linear-gradient(135deg, ${color}26 0%, ${color}12 100%)`,
          border: `1px solid ${color}40`,
          color,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px ${color}25`,
        }}
      >
        <Icon className="w-4.5 h-4.5" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <h2 className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.3px", lineHeight: 1.2 }}>{title}</h2>
        {subtitle && <p className="text-[11.5px] text-gray-400 truncate" style={{ fontWeight: 500 }}>{subtitle}</p>}
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}26, transparent)` }} />
      {badge && (
        <span
          className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${color}12`, color, fontWeight: 700, fontSize: 11, border: `1px solid ${color}26` }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* ─── Data section — bordered sub-card with tinted header + grouped rows ─── */
interface DataField {
  label: string;
  value: string;
  icon: any;
  color: string;
  soft: string;
  span?: number;
  isGender?: string;
}
interface DataGroup {
  label: string;
  fields: DataField[];
}
function DataRow({ f }: { f: DataField }) {
  const Icon = f.icon;
  const spanClass = f.span === 3 ? "sm:col-span-2 lg:col-span-3" : f.span === 2 ? "sm:col-span-2" : "";
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
            {f.isGender === "หญิง" ? "♀" : "♂"}
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
  icon: HeadIcon, title, subtitle, color, badge, fields, groups, cols = 2,
}: { icon: any; title: string; subtitle?: string; color: string; badge?: string; fields?: DataField[]; groups?: DataGroup[]; cols?: 2 | 3 }) {
  const gridClass = cols === 3
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5"
    : "grid grid-cols-1 sm:grid-cols-2 gap-0.5";
  return (
    <section className="relative rounded-2xl border border-gray-100 overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      {/* Header zone — neutral, no color */}
      <div className="relative px-4 py-3.5 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
          <HeadIcon className="w-4.5 h-4.5" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.2px", lineHeight: 1.25 }}>{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{subtitle}</p>}
        </div>
        {badge && (
          <span
            className="relative inline-flex items-center justify-center px-2.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${color}14`, color, fontWeight: 700, fontSize: 10.5, border: `1px solid ${color}26` }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Body — either flat fields or grouped */}
      <div className="p-3 space-y-4">
        {groups
          ? groups.map((group, gIdx) => (
              <div key={gIdx}>
                <div className="flex items-center gap-2 px-2 mb-1.5">
                  <span className="w-1 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-[10.5px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>{group.label}</span>
                  <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.06), transparent)" }} />
                </div>
                <div className={gridClass}>
                  {group.fields.map((f) => <DataRow key={f.label} f={f} />)}
                </div>
              </div>
            ))
          : (
            <div className={gridClass}>
              {fields?.map((f) => <DataRow key={f.label} f={f} />)}
            </div>
          )}
      </div>
    </section>
  );
}

export function OwnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOwner, updateOwner, deleteOwner } = useOwners();
  const { showSnackbar } = useSnackbar();

  const owner = id ? getOwner(Number(id)) : undefined;

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Not found state
  if (!owner) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{ background: "#FEFBF8" }}>
        <div className="text-5xl mb-3 opacity-30">🔍</div>
        <h2 className="text-gray-700 mb-1" style={{ fontWeight: 600 }}>ไม่พบข้อมูลเจ้าของสัตว์</h2>
        <p className="text-sm text-gray-400 mb-4">รหัสที่ระบุไม่มีในระบบ หรืออาจถูกลบไปแล้ว</p>
        <button
          onClick={() => navigate("/owners")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] text-white"
          style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", fontWeight: 600 }}
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่รายการ
        </button>
      </div>
    );
  }

  const handleEditSave = (data: { name: string; nickname: string; gender: "ชาย" | "หญิง" | ""; idCard: string; phone: string; email: string; lineId: string; address: string }) => {
    updateOwner(owner.id, {
      name: data.name,
      nickname: data.nickname || "-",
      gender: data.gender || owner.gender,
      phone: data.phone,
      email: data.email || "-",
      lineId: data.lineId || "-",
      address: data.address || "-",
      idCard: data.idCard || "-",
    });
    setShowEdit(false);
    showSnackbar("update", "อัปเดตข้อมูลเจ้าของสัตว์สำเร็จ");
  };

  const handleDeleteConfirm = () => {
    deleteOwner(owner.id);
    setShowDeleteConfirm(false);
    showSnackbar("delete", `ลบข้อมูล "${owner.name}" เรียบร้อยแล้ว`);
    navigate("/owners");
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: "#FEFBF8" }}>
      {/* ─── HEADER strip — back nav + breadcrumb + actions ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/owners")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> กลับ
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0 text-[12px]">
            <span className="text-gray-400">เจ้าของสัตว์</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 truncate" style={{ fontWeight: 600 }}>{owner.name}</span>
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

      {/* ─── PROFILE HERO SECTION (blurred photo bg, no teal) ─── */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden bg-gray-200"
      >
        {/* Blurred owner photo as full bg */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={owner.photo || getGenderAvatar(owner.gender)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(36px) saturate(150%)", transform: "scale(1.4)" }}
            onError={(e) => { (e.target as HTMLImageElement).src = getGenderAvatar(owner.gender); }}
          />
          {/* Neutral dark overlay for white text readability (no teal tint) */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.50) 100%)" }} />
          {/* Top accent stripe (subtle) */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45) 50%, transparent)" }} />
        </div>

        <div className="relative p-5 sm:p-6">
          {/* Top row — Avatar + Name/Phone block + Add button */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Avatar with rainbow conic ring + gender badge */}
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
                    src={owner.photo || getGenderAvatar(owner.gender)}
                    alt={owner.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = getGenderAvatar(owner.gender); }}
                  />
                </div>
              </div>
              <span
                className="absolute -bottom-1 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: owner.gender === "หญิง" ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)",
                  border: "3px solid #ffffff",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
                }}
              >
                <span className="text-[13px] text-white" style={{ fontWeight: 700, lineHeight: 1 }}>
                  {owner.gender === "หญิง" ? "♀" : "♂"}
                </span>
              </span>
            </div>

            {/* Name + Phone block */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-white"
                style={{
                  fontWeight: 700,
                  fontSize: 26,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  paddingBottom: 4,
                  textShadow: "0 2px 8px rgba(0,0,0,0.35)",
                }}
              >
                {owner.name}
              </h1>
              <p
                className="inline-flex items-center gap-2 text-white/90"
                style={{ fontSize: 13, fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}
              >
                <Phone className="w-3.5 h-3.5" /> {formatPhone(owner.phone)}
              </p>
            </div>

            {/* Add pet button */}
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                border: "1px solid rgba(253,186,116,0.55)",
                fontWeight: 600,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 18px rgba(234,88,12,0.50)",
                textShadow: "0 1px 2px rgba(0,0,0,0.18)",
              }}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.4} /> เพิ่มสัตว์เลี้ยง
            </button>
          </div>

          {/* Bottom row — stat chips (left) + pet avatar stack (right) */}
          <div className="flex items-center justify-between gap-3 mt-5 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { icon: Calendar, label: `สมาชิก ${owner.joinDate}`, accent: "#a7f3d0" },
                { icon: Heart, label: `${owner.totalVisits} รับบริการ`, accent: "#fde68a" },
                { icon: PawPrint, label: `${owner.pets.length} สัตว์เลี้ยง`, accent: "#ddd6fe" },
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
                      fontSize: 11.5,
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

            {owner.pets.length > 0 && (
              <div className="flex -space-x-2 flex-shrink-0">
                {owner.pets.slice(0, 4).map((pet, i) => {
                  const photo = petPhotoMap[pet];
                  return (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full overflow-hidden bg-white p-[2px]"
                      style={{ boxShadow: "0 3px 8px rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.4)" }}
                      title={pet}
                    >
                      <img
                        src={photo || getSpeciesAvatar(petSpeciesMap[pet] ?? "สุนัข")}
                        alt={pet}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  );
                })}
                {owner.pets.length > 4 && (
                  <div
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[11px] text-gray-700"
                    style={{ fontWeight: 700, boxShadow: "0 3px 8px rgba(0,0,0,0.25)" }}
                  >
                    +{owner.pets.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ─── Detail content: 2 cards (LEFT owner info + RIGHT pets fits 400px) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 flex-1 min-h-0">
        {/* ━━━ LEFT: ข้อมูลเจ้าของ ━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-y-auto overflow-x-hidden min-h-0 px-2 pt-2 pb-4 space-y-4"
        >
          {/* ── Card 1: ข้อมูลส่วนตัว ── */}
          <DataSection
            icon={User}
            title="ข้อมูลส่วนตัว"
            subtitle="รายละเอียดของเจ้าของสัตว์"
            color="#19a589"
            cols={3}
            fields={[
              { label: "ชื่อ-นามสกุล", value: owner.name, icon: User, color: "#19a589", soft: "rgba(25,165,137,0.10)" },
              { label: "ชื่อเล่น", value: owner.nickname, icon: User, color: "#8b5cf6", soft: "rgba(139,92,246,0.10)" },
              { label: "เพศ", value: owner.gender, icon: User, color: owner.gender === "หญิง" ? "#ec4899" : "#0ea5e9", soft: owner.gender === "หญิง" ? "rgba(236,72,153,0.10)" : "rgba(14,165,233,0.10)", isGender: owner.gender },
              { label: "สมาชิกตั้งแต่", value: owner.joinDate, icon: Calendar, color: "#6366f1", soft: "rgba(99,102,241,0.10)" },
              { label: "บัตรประชาชน", value: owner.idCard, icon: IdCard, color: "#64748b", soft: "rgba(100,116,139,0.10)", span: 2 },
            ]}
          />

          {/* ── Card 2: ช่องทางติดต่อ ── */}
          <DataSection
            icon={Phone}
            title="ช่องทางติดต่อ"
            subtitle="เบอร์โทร อีเมล และที่อยู่"
            color="#3b82f6"
            cols={3}
            fields={[
              { label: "เบอร์โทรศัพท์", value: formatPhone(owner.phone), icon: Phone, color: "#0ea5e9", soft: "rgba(14,165,233,0.10)" },
              { label: "อีเมล", value: owner.email, icon: Mail, color: "#3b82f6", soft: "rgba(59,130,246,0.10)" },
              { label: "ไลน์ไอดี", value: owner.lineId, icon: MessageCircle, color: "#22c55e", soft: "rgba(34,197,94,0.10)" },
              { label: "ที่อยู่", value: owner.address, icon: MapPin, color: "#ef4444", soft: "rgba(239,68,68,0.10)", span: 3 },
            ]}
          />
        </motion.div>

        {/* ━━━ RIGHT: ข้อมูลสัตว์เลี้ยง (fixed 420px column) ━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-y-auto overflow-x-hidden min-h-0 px-2 pt-2 pb-4"
        >
          <section>
            {/* Header — neutral, no color */}
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-600 bg-gray-100">
                <PawPrint className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.2px", lineHeight: 1.25 }}>สัตว์เลี้ยง</h2>
                <p className="text-[11px] text-gray-400 truncate" style={{ fontWeight: 500 }}>สัตว์ที่อยู่ในการดูแล</p>
              </div>
            </div>
            {/* Pet profile cards — premium editorial style */}
            <div className="flex flex-col gap-3">
              {owner.pets.map((pet, i) => {
                const photo = petPhotoMap[pet];
                const species = petSpeciesMap[pet] ?? "สุนัข";
                const speciesEmoji: Record<string, string> = {
                  "สุนัข": "🐶", "แมว": "🐱", "กระต่าย": "🐰", "นก": "🐦",
                  "ปลา": "🐠", "สัตว์เลื้อยคลาน": "🦎", "สัตว์เลี้ยงขนาดเล็ก": "🐹",
                };
                // mock data — vary by index for visual richness
                const isMale = i % 2 === 0;
                const sexColor = isMale ? "#0ea5e9" : "#ec4899";
                const sexGrad = isMale
                  ? "linear-gradient(135deg, #38bdf8, #0284c7)"
                  : "linear-gradient(135deg, #f472b6, #db2777)";
                const sexGlow = isMale ? "rgba(14,165,233,0.45)" : "rgba(236,72,153,0.45)";
                const ages = ["2 ปี", "5 ปี", "1 ปี", "3 ปี"];
                const weights = ["5.2 kg", "8.1 kg", "3.6 kg", "12.4 kg"];
                const visits = [24, 12, 8, 41];
                return (
                  <div
                    key={i}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-white"
                    style={{
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* ── COVER BANNER (blurred pet photo as bg) ── */}
                    <div className="relative h-24 overflow-hidden">
                      <img
                        src={photo || getSpeciesAvatar(species)}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "blur(18px) saturate(140%)", transform: "scale(1.3)" }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.45) 100%)" }} />
                    </div>

                    {/* ── AVATAR (overlapping cover with neutral white ring) ── */}
                    <div className="flex justify-center -mt-10 relative">
                      <div
                        className="rounded-full p-[3px]"
                        style={{
                          background: "#ffffff",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
                        }}
                      >
                        <div className="w-[76px] h-[76px] rounded-full overflow-hidden bg-white p-[3px]">
                          <img
                            src={photo || getSpeciesAvatar(species)}
                            alt={pet}
                            className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      {/* Sex badge floating bottom-right of avatar */}
                      <span
                        className="absolute bottom-0 right-[calc(50%-44px)] w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{
                          background: sexGrad,
                          border: "2.5px solid #ffffff",
                          boxShadow: `0 3px 10px ${sexGlow}`,
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 12, lineHeight: 1 }}>{isMale ? "♂" : "♀"}</span>
                      </span>
                    </div>

                    {/* ── Name + description (centered) ── */}
                    <div className="text-center px-4 mt-2.5">
                      <h3
                        className="text-gray-900"
                        style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.4px", lineHeight: 1.25 }}
                      >
                        {pet}
                      </h3>
                      <p className="text-gray-500 mt-0.5" style={{ fontSize: 12, fontWeight: 500 }}>
                        <span>{speciesEmoji[species] ?? "🐾"}</span> {species} · อายุ {ages[i % ages.length]}
                      </p>
                    </div>

                    {/* ── Stats pill (gray bg) ── */}
                    <div
                      className="mx-3 mt-3 mb-3 grid grid-cols-3 rounded-2xl py-2.5"
                      style={{ background: "#f3f4f6" }}
                    >
                      {[
                        { value: weights[i % weights.length], label: "น้ำหนัก" },
                        { value: visits[i % visits.length], label: "รับบริการ" },
                        { value: "98%", label: "สุขภาพ" },
                      ].map((s, idx) => (
                        <div key={idx} className="text-center relative">
                          {idx > 0 && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-px bg-gray-300/60" />
                          )}
                          <div className="text-gray-900" style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.2px", lineHeight: 1.2 }}>
                            {s.value}
                          </div>
                          <div className="text-gray-500 mt-0.5" style={{ fontSize: 10.5, fontWeight: 500 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            </div>
          </section>
        </motion.div>
      </div>

      {/* Edit Owner Modal */}
      <AddOwnerModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleEditSave}
        initialData={{
          name: owner.name,
          nickname: owner.nickname === "-" ? "" : owner.nickname,
          gender: owner.gender as "ชาย" | "หญิง" | "",
          idCard: owner.idCard === "-" ? "" : owner.idCard,
          phone: owner.phone,
          email: owner.email === "-" ? "" : owner.email,
          lineId: owner.lineId === "-" ? "" : owner.lineId,
          address: owner.address === "-" ? "" : owner.address,
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
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
                        src={owner.photo || getGenderAvatar(owner.gender)}
                        alt={owner.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getGenderAvatar(owner.gender); }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{owner.name}</p>
                      <p className="text-xs text-gray-400">{formatPhone(owner.phone)} · สัตว์เลี้ยง {owner.pets.length} ตัว</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ข้อมูลเจ้าของสัตว์และประวัติทั้งหมดจะถูกลบออกจากระบบ
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
