import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import {
  Search, Plus, Phone, PawPrint, ChevronRight, Heart,
  Users as UsersIcon, UserPlus, Activity, Pencil, Trash2,
  Crown as CrownIcon,
} from "lucide-react";

import { AddOwnerModal } from "../components/AddOwnerModal";
import { getGenderAvatar, getSpeciesAvatar } from "../components/petAvatars";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { useOwners, petPhotoMap, petSpeciesMap, type Owner } from "../contexts/OwnersContext";
import { useLang } from "../contexts/LanguageContext";
import { formatPhone } from "../utils/format";

/* ── Thai date helper ── */
const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
function todayThai() {
  const d = new Date();
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function Owners() {
  const { owners, addOwner, updateOwner, deleteOwner } = useOwners();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-fill search from navigation state (cross-page navigation)
  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
      const match = owners.find(o => o.name === location.state.search);
      if (match) navigate(`/owners/${match.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const filtered = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.phone.includes(search) ||
    o.idCard.includes(search)
  );

  const handleSaveOwner = (data: { name: string; nickname: string; gender: "ชาย" | "หญิง" | ""; idCard: string; customerType: string; phone: string; email: string; lineId: string; address: string }) => {
    if (editing) {
      // ── แก้ไขรายการเดิม ──
      updateOwner(editing.id, {
        name: data.name,
        nickname: data.nickname || "-",
        gender: data.gender || "ชาย",
        phone: data.phone,
        email: data.email || "-",
        lineId: data.lineId || "-",
        address: data.address || "-",
        idCard: data.idCard || "-",
        customerType: data.customerType || "ลูกค้าทั่วไป",
      });
      showSnackbar("success", "แก้ไขข้อมูลเจ้าของสัตว์แล้ว");
      setEditing(null);
      return;
    }
    // ── เพิ่มรายการใหม่ ──
    const newOwner: Owner = {
      id: Date.now(),
      name: data.name,
      nickname: data.nickname || "-",
      gender: data.gender || "ชาย",
      phone: data.phone,
      email: data.email || "-",
      lineId: data.lineId || "-",
      address: data.address || "-",
      idCard: data.idCard || "-",
      pets: [],
      joinDate: todayThai(),
      totalVisits: 0,
      photo: "",
      customerType: data.customerType || "ลูกค้าทั่วไป",
    };
    addOwner(newOwner);
    showSnackbar("success", t("owners.addSuccess"));
    navigate(`/owners/${newOwner.id}`);
  };

  const handleEdit = (owner: Owner) => {
    setShowForm(false);
    setEditing(owner);
  };

  const handleDelete = async (owner: Owner) => {
    const ok = await confirm({
      title: "ลบเจ้าของสัตว์",
      description: `ต้องการลบ "${owner.name}" ออกจากระบบหรือไม่?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    deleteOwner(owner.id);
    showSnackbar("delete", "ลบเจ้าของสัตว์แล้ว");
  };

  /* ── Stats for hero ── */
  const totalOwners = owners.length;
  const totalPets = owners.reduce((sum, o) => sum + o.pets.length, 0);
  const totalVisits = owners.reduce((sum, o) => sum + o.totalVisits, 0);
  const newThisMonth = owners.filter(o => o.totalVisits <= 5).length;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: "#FEFBF8" }}>
      {/* ─── HERO HEADER (LIST page) ─── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
            radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
            linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)
          `,
        }}
      >
        {/* Ambient decoration */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 65%)" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)" }} />
        </div>

        <div className="relative p-4 flex flex-col gap-4">
          {/* Top: Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.30)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: "calc(22px * var(--fs))", letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                {t("owners.title")}
              </h1>
              <p className="text-white/70" style={{ fontSize: "calc(12px * var(--fs))", letterSpacing: "0.1px" }}>{t("owners.subtitle")}</p>
            </div>

            {/* Add button — top-right like Stock */}
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 flex-shrink-0 text-white"
              style={{
                background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
                border: "1px solid var(--hero-btn-border)",
                boxShadow:
                  "var(--hero-btn-shadow)",
                fontWeight: 600,
                
              }}
            >
              <Plus className="w-3.5 h-3.5" /> {t("owners.add")}
            </button>
          </div>

          {/* Bottom: Search + Add button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search — solid white */}
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("owners.searchPlaceholder")}
                className="w-full pl-9 pr-3 py-2 text-[13px] rounded-full text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Grid of owner cards ─── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto overflow-x-hidden px-1 pt-1 pb-4"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">ไม่พบเจ้าของสัตว์{search && ` ที่ตรงกับ "${search}"`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((owner) => (
              <motion.div
                key={owner.id}
                variants={itemVariants}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/owners/${owner.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/owners/${owner.id}`);
                  }
                }}
                className="group relative rounded-3xl overflow-hidden bg-white text-left cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
                }}
              >
                {/* ── COVER BANNER (blurred owner photo) ── */}
                <div className="relative h-20 overflow-hidden">
                  <img
                    src={owner.photo || getGenderAvatar(owner.gender)}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "blur(18px) saturate(140%)", transform: "scale(1.3)" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = getGenderAvatar(owner.gender); }}
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.50) 100%)" }} />

                  {/* ── Edit / Delete actions (overlay, top-right) ── */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleEdit(owner); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:text-teal-600 transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                      title="แก้ไข"
                      aria-label="แก้ไข"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(owner); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                      title="ลบ"
                      aria-label="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── AVATAR (overlapping cover, neutral white ring + gender badge) ── */}
                <div className="flex justify-center -mt-10 relative">
                  <div
                    className="rounded-full p-[3px]"
                    style={{
                      background: "#ffffff",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-white p-[3px]">
                      <img
                        src={owner.photo || getGenderAvatar(owner.gender)}
                        alt={owner.name}
                        className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = getGenderAvatar(owner.gender); }}
                      />
                    </div>
                  </div>
                  <span
                    className="absolute bottom-0 right-[calc(50%-42px)] w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{
                      background: owner.gender === "หญิง" ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)",
                      border: "2.5px solid #ffffff",
                      boxShadow: owner.gender === "หญิง" ? "0 3px 10px rgba(236,72,153,0.45)" : "0 3px 10px rgba(14,165,233,0.45)",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "calc(12px * var(--fs))", lineHeight: 1 }}>{owner.gender === "หญิง" ? "♀" : "♂"}</span>
                  </span>
                </div>

                {/* ── Name + phone (centered) ── */}
                <div className="text-center px-4 mt-2.5">
                  <h3
                    className="text-gray-900 truncate"
                    style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))", letterSpacing: "-0.3px", lineHeight: 1.3, paddingBottom: 2 }}
                  >
                    {owner.name}
                    {owner.customerType && owner.customerType !== "ลูกค้าทั่วไป" && (
                      <span className="inline-flex items-center gap-0.5 align-middle ml-1.5 px-2 py-0.5 rounded-full"
                        style={{ fontSize: "calc(9.5px * var(--fs))", fontWeight: 700, background: "rgba(217,119,6,0.10)", color: "#b45309", border: "1px solid rgba(217,119,6,0.20)" }}>
                        <CrownIcon className="w-2.5 h-2.5" /> {owner.customerType}
                      </span>
                    )}
                  </h3>
                  <p className="inline-flex items-center gap-1 text-gray-600 truncate" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 600 }}>
                    <Phone className="w-3 h-3 text-gray-400" /> {formatPhone(owner.phone)}
                  </p>
                </div>

                {/* ── Stats pill (gray bg, 3 cols) ── */}
                <div
                  className="mx-3 mt-3 grid grid-cols-3 rounded-2xl py-2"
                  style={{ background: "#f3f4f6" }}
                >
                  {[
                    { value: owner.pets.length, label: t("owners.pets") },
                    { value: owner.totalVisits, label: t("owners.visits") },
                    { value: `"${owner.nickname}"`, label: t("field.name") },
                  ].map((s, idx) => (
                    <div key={idx} className="text-center relative px-1">
                      {idx > 0 && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-300/60" />
                      )}
                      <div className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(13.5px * var(--fs))", letterSpacing: "-0.2px", lineHeight: 1.2 }}>
                        {s.value}
                      </div>
                      <div className="text-gray-500 mt-0.5" style={{ fontSize: "calc(10px * var(--fs))", fontWeight: 500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* ── Pet avatar stack (bottom) ── */}
                {owner.pets.length > 0 && (
                  <div className="flex items-center justify-center px-3 py-3">
                    <div className="flex -space-x-2">
                      {owner.pets.slice(0, 4).map((pet, i) => {
                        const photo = petPhotoMap[pet];
                        return (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full overflow-hidden bg-white p-[1.5px]"
                            style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}
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
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[10px] text-gray-700"
                          style={{ fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}
                        >
                          +{owner.pets.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {owner.pets.length === 0 && <div className="h-3" />}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add / Edit Owner Modal (shared) */}
      <AddOwnerModal
        open={showForm || !!editing}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSave={handleSaveOwner}
        initialData={
          editing
            ? {
                name: editing.name === "-" ? "" : editing.name,
                nickname: editing.nickname === "-" ? "" : editing.nickname,
                gender: editing.gender === "หญิง" ? "หญิง" : "ชาย",
                idCard: editing.idCard === "-" ? "" : editing.idCard,
                customerType: editing.customerType || "ลูกค้าทั่วไป",
                phone: editing.phone === "-" ? "" : editing.phone,
                email: editing.email === "-" ? "" : editing.email,
                lineId: editing.lineId === "-" ? "" : editing.lineId,
                address: editing.address === "-" ? "" : editing.address,
              }
            : null
        }
      />
    </div>
  );
}
