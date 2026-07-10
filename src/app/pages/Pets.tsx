import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import {
  Search, Plus, PawPrint, Dog, Cat, Bird, Fish, Rabbit, Turtle, Rat, Squirrel,
  AlertTriangle, ChevronDown, Activity, Syringe, Scissors, Check, Filter,
  Pencil, Trash2,
} from "lucide-react";

import { AddPetModal } from "../components/AddPetModal";
import { RegisterVisitModal, type PetEntry } from "../components/RegisterVisitModal";
import { getSpeciesAvatar } from "../components/petAvatars";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { usePets, type Pet } from "../contexts/PetsContext";
import { useLang } from "../contexts/LanguageContext";
import { heroPillStyle, heroPillIconStyle, heroPillIconClass, heroPillClearStyle } from "../utils/heroFilter";

const speciesOptions = [
  { label: "ทั้งหมด",          icon: PawPrint, color: "#64748b", grad: "linear-gradient(135deg, #94a3b8, #475569)" },
  { label: "สุนัข",            icon: Dog,      color: "#f59e0b", grad: "linear-gradient(135deg, #fbbf24, #d97706)" },
  { label: "แมว",              icon: Cat,      color: "#8b5cf6", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
  { label: "นก",               icon: Bird,     color: "#0ea5e9", grad: "linear-gradient(135deg, #38bdf8, #0284c7)" },
  { label: "สัตว์เลื้อยคลาน",  icon: Turtle,   color: "#10b981", grad: "linear-gradient(135deg, #34d399, #059669)" },
  { label: "ปลา",              icon: Fish,     color: "#3b82f6", grad: "linear-gradient(135deg, #60a5fa, #2563eb)" },
  { label: "กระต่าย",          icon: Rabbit,   color: "#ec4899", grad: "linear-gradient(135deg, #f472b6, #db2777)" },
  { label: "หนู",              icon: Rat,      color: "#a16207", grad: "linear-gradient(135deg, #ca8a04, #854d0e)" },
  { label: "กระรอก",           icon: Squirrel, color: "#ea580c", grad: "linear-gradient(135deg, #fb923c, #c2410c)" },
];

const speciesEmojiMap: Record<string, string> = {
  "สุนัข": "🐶", "แมว": "🐱", "นก": "🐦", "ปลา": "🐠",
  "กระต่าย": "🐰", "สัตว์เลื้อยคลาน": "🦎", "สัตว์เลี้ยงขนาดเล็ก": "🐹",
};

export function Pets() {
  const { pets, addPet, updatePet, deletePet } = usePets();
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ทั้งหมด");
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-navigate from cross-page navigation state
  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
      const match = pets.find(p => p.name === location.state.search || p.hn === location.state.search);
      if (match) navigate(`/pets/${match.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSpeciesDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = pets.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.hn.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = speciesFilter === "ทั้งหมด" || p.species === speciesFilter;
    return matchSearch && matchSpecies;
  });

  type PetFormData = {
    hn: string; name: string; nameEn: string; species: string; breed: string; gender: string;
    color: string; weight: string; age: string; ageText: string; microchip: string;
    sterilized: boolean | null; sterilizedDate: string; food: string;
    owner: string; ownerPhone: string; allergies: string; chronic: string; imagePreview: string | null;
  };

  /* สัตว์ที่เพิ่งลงทะเบียนและติ๊ก "เปิด Visit" — เปิดหน้าต่างส่งตรวจต่อทันที */
  const [visitPrefill, setVisitPrefill] = useState<PetEntry | null>(null);

  const handleSavePet = (data: PetFormData, openVisit?: boolean) => {
    // ── EDIT existing pet ──
    if (editingPet) {
      updatePet(editingPet.id, {
        hn: data.hn || editingPet.hn,
        name: data.name,
        nameEn: data.nameEn || "",
        species: data.species || "อื่นๆ",
        breed: data.breed || "-",
        gender: data.gender || "-",
        weight: data.weight ? `${data.weight} กก.` : "-",
        age: data.ageText || data.age || "-",
        microchip: data.microchip || "-",
        color: data.color || "-",
        owner: data.owner || "-",
        ownerPhone: data.ownerPhone || "-",
        allergies: data.allergies || "ไม่มี",
        chronic: data.chronic || "ไม่มี",
        sterilized: data.sterilized === true,
        image: data.imagePreview,
      });
      showSnackbar("update", "แก้ไขข้อมูลสัตว์เลี้ยงแล้ว");
      const id = editingPet.id;
      setEditingPet(null);
      navigate(`/pets/${id}`);
      return;
    }

    // ── ADD new pet ──
    const newPet: Pet = {
      id: Date.now(),
      hn: data.hn || `HN-2026-${String(pets.length + 1).padStart(3, "0")}`,
      name: data.name,
      nameEn: data.nameEn || "",
      species: data.species || "อื่นๆ",
      breed: data.breed || "-",
      gender: data.gender || "-",
      weight: data.weight ? `${data.weight} กก.` : "-",
      age: data.ageText || data.age || "-",
      microchip: data.microchip || "-",
      color: data.color || "-",
      owner: data.owner || "-",
      ownerPhone: data.ownerPhone || "-",
      allergies: data.allergies || "ไม่มี",
      chronic: data.chronic || "ไม่มี",
      sterilized: data.sterilized === true,
      image: data.imagePreview,
      vaccines: [],
      surgeries: [],
      visits: 0,
      visitHistory: [],
    };
    addPet(newPet);
    showSnackbar("success", t("pets.add") + " " + t("common.success"));
    if (openVisit) {
      // เปิดหน้าต่างส่งตรวจ (Visit) พร้อมข้อมูลสัตว์ตัวใหม่ทันที
      setVisitPrefill({
        id: newPet.id, hn: newPet.hn, name: newPet.name, species: newPet.species,
        breed: newPet.breed, sex: newPet.gender, age: newPet.age, weight: newPet.weight,
        owner: newPet.owner, phone: newPet.ownerPhone, photo: newPet.image ?? "",
      });
      return;
    }
    navigate(`/pets/${newPet.id}`);
  };

  // Build prefill FormData from an existing pet and open the modal in edit mode
  const openEdit = (pet: Pet) => {
    setEditingPet(pet);
  };

  const handleDelete = async (pet: Pet) => {
    const ok = await confirm({
      title: "ลบสัตว์เลี้ยง",
      description: `ลบ "${pet.name}" (${pet.hn}) ออกจากระบบ?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    deletePet(pet.id);
    showSnackbar("delete", `ลบ "${pet.name}" แล้ว`);
  };

  // Convert an existing Pet into the modal's FormData shape (prefill all fields)
  const editingFormData: PetFormData | null = editingPet
    ? {
        hn: editingPet.hn === "-" ? "" : editingPet.hn,
        name: editingPet.name,
        nameEn: editingPet.nameEn || "",
        species: editingPet.species === "อื่นๆ" ? "" : editingPet.species,
        breed: editingPet.breed === "-" ? "" : editingPet.breed,
        gender: editingPet.gender === "-" ? "" : editingPet.gender,
        color: editingPet.color === "-" ? "" : editingPet.color,
        weight: editingPet.weight === "-" ? "" : editingPet.weight.replace(" กก.", ""),
        age: "",
        ageText: editingPet.age === "-" ? "" : editingPet.age,
        microchip: editingPet.microchip === "-" ? "" : editingPet.microchip,
        sterilized: editingPet.sterilized,
        sterilizedDate: "",
        food: "",
        owner: editingPet.owner === "-" ? "" : editingPet.owner,
        ownerPhone: editingPet.ownerPhone === "-" ? "" : editingPet.ownerPhone,
        allergies: editingPet.allergies || "ไม่มี",
        chronic: editingPet.chronic || "ไม่มี",
        imagePreview: editingPet.image,
      }
    : null;

  /* ── Stats for hero ── */
  const totalPets = pets.length;
  const totalVisits = pets.reduce((sum, p) => sum + p.visits, 0);
  const totalVaccines = pets.reduce((sum, p) => sum + p.vaccines.length, 0);
  const totalSurgeries = pets.reduce((sum, p) => sum + p.surgeries.length, 0);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: "#FEFBF8" }}>
      {/* ─── HERO HEADER (LIST page) ─── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl"
      >
        {/* Background + ambient decoration layer — clipped so dropdowns can overflow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
              radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
              linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)
            `,
          }}
        >
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
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                {t("pets.title")}
              </h1>
              <p className="text-white/70" style={{ fontSize: 12, letterSpacing: "0.1px" }}>{t("pets.subtitle")}</p>
            </div>

            {/* Add button — top-right like Stock */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 text-[12.5px] hover:-translate-y-0.5 flex-shrink-0 text-white"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                border: "1px solid rgba(253,186,116,0.85)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.15), 0 6px 22px rgba(234,88,12,0.65)",
                fontWeight: 600,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              <Plus className="w-3.5 h-3.5" /> {t("pets.add")}
            </button>
          </div>

          {/* Bottom: Search + Species filter + Add button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search — solid white */}
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("pets.searchPlaceholder")}
                className="w-full pl-9 pr-3 py-2 text-[13px] rounded-full text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              />
            </div>

            {/* Species filter — glass pill */}
            <div className="relative" ref={dropdownRef}>
              {(() => {
                const activeOpt = speciesOptions.find(o => o.label === speciesFilter) ?? speciesOptions[0];
                const ActiveIcon = activeOpt.icon;
                const isFiltered = speciesFilter !== "ทั้งหมด";
                return (
                  <button
                    onClick={() => setShowSpeciesDropdown(v => !v)}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full text-[12.5px] transition-all hover:-translate-y-0.5"
                    style={heroPillStyle(isFiltered)}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={heroPillIconStyle(isFiltered, activeOpt.grad, activeOpt.color)}
                    >
                      <ActiveIcon className={heroPillIconClass(isFiltered)} strokeWidth={2.4} />
                    </span>
                    <span>{isFiltered ? activeOpt.label : "ชนิดสัตว์"}</span>
                    {isFiltered && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setSpeciesFilter("ทั้งหมด"); }}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] cursor-pointer transition-opacity hover:opacity-70"
                        style={heroPillClearStyle}
                      >×</span>
                    )}
                    <ChevronDown className={`w-3 h-3 transition-transform ${showSpeciesDropdown ? "rotate-180" : ""}`} />
                  </button>
                );
              })()}

              <AnimatePresence>
                {showSpeciesDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 top-full mt-2 w-[300px] bg-white rounded-3xl z-[60] overflow-hidden"
                    style={{
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
                      transformOrigin: "top left",
                    }}
                  >
                    {/* Header strip */}
                    <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-gray-100">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-600 bg-gray-100">
                        <Filter className="w-3.5 h-3.5" strokeWidth={2.4} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900" style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.2px" }}>กรองตามชนิดสัตว์</div>
                        <div className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>เลือก 1 ชนิด</div>
                      </div>
                    </div>

                    {/* Grid of options */}
                    <div className="p-2 grid grid-cols-2 gap-1.5">
                      {speciesOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = speciesFilter === opt.label;
                        const count = opt.label === "ทั้งหมด"
                          ? pets.length
                          : pets.filter(p => p.species === opt.label).length;
                        return (
                          <button
                            key={opt.label}
                            onClick={() => { setSpeciesFilter(opt.label); setShowSpeciesDropdown(false); }}
                            className="group relative flex items-center gap-2 px-2 py-2 rounded-2xl transition-all duration-200 text-left hover:-translate-y-0.5"
                            style={{
                              background: isActive ? `${opt.color}10` : "transparent",
                              border: isActive ? `1px solid ${opt.color}40` : "1px solid transparent",
                              boxShadow: isActive ? `0 2px 8px ${opt.color}20` : "none",
                            }}
                          >
                            <span
                              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-transform duration-200 group-hover:scale-110"
                              style={{
                                background: isActive ? opt.grad : "#f3f4f6",
                                color: isActive ? "white" : opt.color,
                                boxShadow: isActive ? `0 3px 10px ${opt.color}55, inset 0 1px 0 rgba(255,255,255,0.30)` : "none",
                              }}
                            >
                              <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: isActive ? "white" : opt.color }} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] text-gray-900 truncate" style={{ fontWeight: isActive ? 700 : 600, letterSpacing: "-0.1px" }}>
                                {opt.label}
                              </div>
                              <div className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>{count} ตัว</div>
                            </div>
                            {isActive && (
                              <span
                                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                                style={{ background: opt.grad, boxShadow: `0 2px 6px ${opt.color}55` }}
                              >
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </motion.section>

      {/* ─── Grid of pet cards ─── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto overflow-x-hidden px-1 pt-1 pb-4"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">ไม่พบสัตว์เลี้ยง{search && ` ที่ตรงกับ "${search}"`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((pet) => {
              const isMale = pet.gender === "เพศผู้";
              const isFemale = pet.gender === "เพศเมีย";
              return (
                <motion.button
                  key={pet.id}
                  variants={itemVariants}
                  onClick={() => navigate(`/pets/${pet.id}`)}
                  className="group relative rounded-3xl overflow-hidden bg-white text-left transition-all duration-300 hover:-translate-y-1"
                  style={{
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* ── COVER BANNER (blurred pet photo) ── */}
                  <div className="relative h-20 overflow-hidden">
                    <img
                      src={pet.image || getSpeciesAvatar(pet.species)}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: "blur(18px) saturate(140%)", transform: "scale(1.3)" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = getSpeciesAvatar(pet.species); }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.50) 100%)" }} />

                    {/* Edit / Delete actions (top-left) */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span
                        role="button"
                        tabIndex={0}
                        title="แก้ไข"
                        onClick={(e) => { e.stopPropagation(); openEdit(pet); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 cursor-pointer transition-all hover:scale-110 hover:text-[var(--brand-hero-to)]"
                        style={{
                          background: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(6px)",
                          WebkitBackdropFilter: "blur(6px)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        title="ลบ"
                        onClick={(e) => { e.stopPropagation(); handleDelete(pet); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-red-500 cursor-pointer transition-all hover:scale-110 hover:text-red-600"
                        style={{
                          background: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(6px)",
                          WebkitBackdropFilter: "blur(6px)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </span>
                    </div>

                    {/* Allergy warning badge */}
                    {pet.allergies !== "ไม่มี" && (
                      <span
                        className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white"
                        style={{
                          background: "linear-gradient(135deg, #fb923c, #ea580c)",
                          boxShadow: "0 2px 6px rgba(234,88,12,0.35)",
                          fontWeight: 600,
                        }}
                        title={`แพ้: ${pet.allergies}`}
                      >
                        <AlertTriangle className="w-2.5 h-2.5" /> แพ้
                      </span>
                    )}
                  </div>

                  {/* ── AVATAR (overlapping cover, white ring + sex badge) ── */}
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
                          src={pet.image || getSpeciesAvatar(pet.species)}
                          alt={pet.name}
                          className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).src = getSpeciesAvatar(pet.species); }}
                        />
                      </div>
                    </div>
                    {(isMale || isFemale) && (
                      <span
                        className="absolute bottom-0 right-[calc(50%-42px)] w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{
                          background: isFemale ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)",
                          border: "2.5px solid #ffffff",
                          boxShadow: isFemale ? "0 3px 10px rgba(236,72,153,0.45)" : "0 3px 10px rgba(14,165,233,0.45)",
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 12, lineHeight: 1 }}>{isFemale ? "♀" : "♂"}</span>
                      </span>
                    )}
                  </div>

                  {/* ── Name + species (centered) ── */}
                  <div className="text-center px-4 mt-2.5">
                    <h3
                      className="text-gray-900 truncate"
                      style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", lineHeight: 1.3, paddingBottom: 2 }}
                    >
                      {pet.name}
                    </h3>
                    <p className="text-gray-500 truncate" style={{ fontSize: 12, fontWeight: 500 }}>
                      <span>{speciesEmojiMap[pet.species] ?? "🐾"}</span> {pet.species} · {pet.breed}
                    </p>
                  </div>

                  {/* ── Stats pill (gray bg, 3 cols) ── */}
                  <div
                    className="mx-3 mt-3 grid grid-cols-3 rounded-2xl py-2"
                    style={{ background: "#f3f4f6" }}
                  >
                    {[
                      { value: pet.age, label: "อายุ" },
                      { value: pet.weight.replace(" กก.", " kg"), label: "น้ำหนัก" },
                      { value: pet.visits, label: "รับบริการ" },
                    ].map((s, idx) => (
                      <div key={idx} className="text-center relative px-1">
                        {idx > 0 && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-300/60" />
                        )}
                        <div className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.2px", lineHeight: 1.2 }}>
                          {s.value}
                        </div>
                        <div className="text-gray-500 mt-0.5" style={{ fontSize: 10, fontWeight: 500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Owner info (bottom) ── */}
                  <div className="px-3 py-3 text-center">
                    <p className="text-[10px] text-gray-400" style={{ fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>เจ้าของ</p>
                    <p className="text-[12px] text-gray-700 truncate mt-0.5" style={{ fontWeight: 600 }}>{pet.owner}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Add / Edit Pet Modal (shared) */}
      <AddPetModal
        open={showAddModal || !!editingPet}
        onClose={() => { setShowAddModal(false); setEditingPet(null); }}
        onSave={handleSavePet}
        initialData={editingFormData}
      />

      {/* ส่งตรวจต่อทันทีหลังลงทะเบียน (ติ๊ก "เปิด Visit") */}
      <RegisterVisitModal
        open={!!visitPrefill}
        prefillPet={visitPrefill}
        onClose={() => setVisitPrefill(null)}
        onSave={(v) => {
          setVisitPrefill(null);
          showSnackbar("success", `เปิด Visit ให้ "${v.pet.name}" แล้ว — ${v.visitType}`);
          navigate("/visits");
        }}
      />
    </div>
  );
}
