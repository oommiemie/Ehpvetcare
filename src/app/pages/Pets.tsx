import { useState, useRef, useEffect, type ElementType } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, PawPrint, Camera, Printer, Edit2, AlertTriangle, Syringe, Scissors, Heart, Stethoscope, Pill, FileText, ChevronDown, ChevronUp, Dog, Cat, Bird, Fish, Rabbit, Hash, Palette, Scale, Calendar, Cpu, User, Phone, Shield, GitBranch, ArrowLeft, Trash2 } from "lucide-react";
import { AddPetModal } from "../components/AddPetModal";
import { getSpeciesAvatar } from "../components/petAvatars";
import { useSnackbar } from "../contexts/SnackbarContext";

const petsData = [
  {
    id: 1, hn: "HN-2026-001", name: "บัดดี้", nameEn: "Buddy", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์", gender: "เพศผู้",
    weight: "28.5 กก.", age: "4 ปี", microchip: "985112345678901", color: "สีทอง",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    allergies: "เพนิซิลิน", chronic: "ไม่มี", sterilized: true,
    image: "https://images.unsplash.com/photo-1734966213753-1b361564bab4?w=200&h=200&fit=crop",
    vaccines: [
      { name: "พิษสุนัขบ้า", date: "15 ต.ค. 2568", nextDue: "15 ต.ค. 2569", batch: "RB-2025-001" },
      { name: "DHPP", date: "15 ต.ค. 2568", nextDue: "15 ต.ค. 2569", batch: "DH-2025-002" },
      { name: "บอร์เดเทลลา", date: "20 เม.ย. 2568", nextDue: "20 เม.ย. 2569", batch: "BD-2025-003" },
    ],
    surgeries: [{ name: "ทำหมัน", date: "10 มิ.ย. 2565", vet: "สพ.ว. สมชาย", notes: "ผ่าตัดปกติ ฟื้นตัวดี" }],
    visits: 24,
    visitHistory: [
      {
        id: 1, date: "2 มี.ค. 2569", time: "10:30 น.", type: "OPD", weight: "28.5 กก.",
        chiefComplaint: "ซึมเศร้า ไม่กินข้าว 2 วัน",
        diagnosis: "Gastroenteritis (ลำไส้อักเสบเฉียบพลัน)",
        treatment: "ให้น้ำเกลือ IV 500 ml, ฉีดยาแก้อาเจียน",
        medications: ["Metronidazole 250mg 2x1 PC 5 วัน", "Omeprazole 20mg 1x1 AC 5 วัน"],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "นัดติดตามอาการ 5 วัน หากอาเจียนต่อเนื่องให้กลับมาก่อน",
      },
      {
        id: 2, date: "10 ก.พ. 2569", time: "14:00 น.", type: "OPD", weight: "28.3 กก.",
        chiefComplaint: "ตรวจสุขภาพประจำปี",
        diagnosis: "สุขภาพปกติ ไม่พบความผิดปกติ",
        treatment: "ตรวจร่างกายทั่วไป เจาะเลือด CBC",
        medications: ["Ivermectin (กำจัดพยาธิ) ฉีดครั้งเดียว"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "ผลเลือดปกติ นัดฉีดวัคซีนประจำปี ต.ค. 2569",
      },
      {
        id: 3, date: "5 ธ.ค. 2568", time: "09:15 น.", type: "OPD", weight: "27.9 กก.",
        chiefComplaint: "ขาหลังขวาびcko หลังออกกำลังกาย",
        diagnosis: "Muscle strain (กล้ามเนื้อฉีก) บริเวณต้นขา",
        treatment: "นวดและประคบเย็น แนะนำพักผ่อน",
        medications: ["Meloxicam 15mg 1x1 PC 3 วัน", "Tramadol 50mg 2x1 PC 3 วัน"],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "ห้ามออกกำลังกายหนัก 2 สัปดาห์ หากไม่ดีขึ้นให้เอกซเรย์",
      },
    ],
  },
  {
    id: 2, hn: "HN-2026-002", name: "ลูน่า", nameEn: "Luna", species: "แมว", breed: "เปอร์เซีย", gender: "เพศเมีย",
    weight: "3.8 กก.", age: "2 ปี", microchip: "985198765432109", color: "ขาว",
    owner: "วรรณา ศรีสุข", ownerPhone: "089-876-5432",
    allergies: "ไม่มี", chronic: "ความดันโลหิตสูง", sterilized: true,
    image: "https://images.unsplash.com/photo-1735618603118-89e26b0dcf6e?w=200&h=200&fit=crop",
    vaccines: [
      { name: "FVRCP", date: "1 ก.ย. 2568", nextDue: "1 ก.ย. 2569", batch: "FV-2025-001" },
      { name: "พิษสุนัขบ้า", date: "1 ก.ย. 2568", nextDue: "1 ก.ย. 2569", batch: "RB-2025-004" },
    ],
    surgeries: [{ name: "ทำหมัน", date: "14 ก.พ. 2567", vet: "สพ.ว. สุภา", notes: "ไม่มีภาวะแทรกซ้อน" }],
    visits: 12,
    visitHistory: [
      {
        id: 1, date: "15 ก.พ. 2569", time: "11:00 น.", type: "OPD", weight: "3.8 กก.",
        chiefComplaint: "ติดตามความดันโลหิต",
        diagnosis: "Hypertension controlled (ความดันอยู่ในเกณฑ์ดี)",
        treatment: "วัดความดัน, ตรวจปัสสาวะ",
        medications: ["Amlodipine 0.625mg 1x1 ต่อเนื่อง"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "ความดัน 130/85 mmHg ปกติดี นัดติดตาม 3 เดือน",
      },
    ],
  },
  {
    id: 3, hn: "HN-2026-003", name: "แม็กซ์", nameEn: "Max", species: "สุนัข", breed: "เยอรมัน เชพเพิร์ด", gender: "เพศผู้",
    weight: "35.2 กก.", age: "6 ปี", microchip: "985111222333444", color: "ดำ-น้ำตาล",
    owner: "ประพันธ์ มงคล", ownerPhone: "062-111-2233",
    allergies: "โปรตีนไก่", chronic: "สะโพกเสื่อม", sterilized: false,
    image: null,
    vaccines: [
      { name: "พิษสุนัขบ้า", date: "20 ส.ค. 2568", nextDue: "20 ส.ค. 2569", batch: "RB-2025-007" },
    ],
    surgeries: [],
    visits: 18,
    visitHistory: [
      {
        id: 1, date: "28 ก.พ. 2569", time: "13:30 น.", type: "OPD", weight: "35.2 กก.",
        chiefComplaint: "ขาหลังอ่อนแรง เดินกะเผลก",
        diagnosis: "Hip Dysplasia progression (สะโพกเสื่อมมากขึ้น)",
        treatment: "เอกซเรย์สะโพก, กายภาพบำบัด",
        medications: ["Meloxicam 15mg 1x1 PC 7 วัน", "Glucosamine 500mg 1x1 7 วัน"],
        vet: "สพ.ว. มชาย รักสัตว์",
        notes: "แนะนำลดการออกกำลังกายหนัก ควรพิจารณาผ่าตัดหากอาการไม่ดีขึ้น",
      },
      {
        id: 2, date: "10 ม.ค. 2569", time: "10:00 น.", type: "OPD", weight: "35.5 กก.",
        chiefComplaint: "แพ้อาหาร ผื่นคันตามตัว",
        diagnosis: "Food allergy (แพ้โปรตีนไก่)",
        treatment: "ฉีดยาแก้แพ้, แนะนำเปลี่ยนอาหาร",
        medications: ["Chlorpheniramine 4mg 2x1 5 วัน", "Prednisolone 5mg 1x1 PC 3 วัน"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "หลีกเลี่ยงอาหารที่มีส่วนผสมของไก่ทุกชนิด",
      },
    ],
  },
  {
    id: 4, hn: "HN-2026-004", name: "ทวีป", nameEn: "Tweep", species: "นก", breed: "คอกคาเทล", gender: "เพศผู้",
    weight: "0.09 กก.", age: "1 ปี 6 เดือน", microchip: "-", color: "เทา-เหลือง",
    owner: "นภาพร รุ่งเรือง", ownerPhone: "091-555-7788",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: false,
    image: "https://images.unsplash.com/photo-1761627064452-68769313f360?w=200&h=200&fit=crop",
    vaccines: [
      { name: "Newcastle Disease", date: "5 มี.ค. 2568", nextDue: "5 มี.ค. 2569", batch: "ND-2025-011" },
    ],
    surgeries: [],
    visits: 3,
    visitHistory: [
      {
        id: 1, date: "20 ก.พ. 2569", time: "09:00 น.", type: "OPD", weight: "0.09 กก.",
        chiefComplaint: "ขนร่วงผิดปกติ ขูดคันตลอดเวลา",
        diagnosis: "Feather Destructive Behavior (นกทำลายขนตัวเอง)",
        treatment: "ตรวจร่างกายทั่วไป เก็บตัวอย่างขน",
        medications: ["Vitamin A supplement 1 หยด/วัน 14 วัน"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "แนะนำปรับสภาพแวดล้อม เพิ่มของเล่นในกรง ลดควมเครียด",
      },
    ],
  },
  {
    id: 5, hn: "HN-2026-005", name: "มิลค์", nameEn: "Milk", species: "สัตว์เลี้ยงขนาดเล็ก", breed: "กระต่ายดัตช์", gender: "เพศเมีย",
    weight: "1.8 กก.", age: "3 ปี", microchip: "985100099988877", color: "ขาว-น้ำตาล",
    owner: "ศิริพร แก้วมณี", ownerPhone: "083-321-6655",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: true,
    image: "https://images.unsplash.com/photo-1643212263657-505473e76c7f?w=200&h=200&fit=crop",
    vaccines: [],
    surgeries: [{ name: "ทำหมัน", date: "3 ส.ค. 2566", vet: "สพ.ว. สมชาย", notes: "ผ่าตัดปกติ ฟื้นตัวดีภายใน 3 วัน" }],
    visits: 5,
    visitHistory: [
      {
        id: 1, date: "12 ม.ค. 2569", time: "10:00 น.", type: "OPD", weight: "1.8 กก.",
        chiefComplaint: "ท้องอืด ไม่กินหญ้า 1 วัน",
        diagnosis: "GI Stasis (ลำไส้หยุดเคลื่อนไหว)",
        treatment: "ฉีดยากระตุ้นลำไส้, ให้สารน้ำใต้ผิวหนัง",
        medications: ["Metoclopramide 0.5mg/kg ีด", "Simethicone 20mg 3x1 3 วัน"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "เพิ่มหญ้าทิโมธีในอาหารประจำวัน ลดเม็ดอาหาร",
      },
    ],
  },
  {
    id: 6, hn: "HN-2026-006", name: "ทองคำ", nameEn: "Goldie", species: "ปลา", breed: "ปลาทอง (Oranda)", gender: "-",
    weight: "0.05 กก.", age: "2 ปี", microchip: "-", color: "ส้ม-ขาว",
    owner: "กิตติพงษ์ วงษ์ทอง", ownerPhone: "086-447-2211",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: false,
    image: "https://images.unsplash.com/photo-1771627278592-dd4ab6c11c6c?w=200&h=200&fit=crop",
    vaccines: [],
    surgeries: [],
    visits: 2,
    visitHistory: [
      {
        id: 1, date: "8 ก.พ. 2569", time: "14:30 น.", type: "OPD", weight: "0.05 กก.",
        chiefComplaint: "ครีบกร่อน มีจุดขาวตามลำตัว",
        diagnosis: "Ich (White Spot Disease) ระยะแรก",
        treatment: "เปลี่ยนน้ำ 50%, ปรับอุณหภูมิน้ำ",
        medications: ["Malachite Green 0.1ppm ใส่ตู้ปลา 3 วัน"],
        vet: "สพ.ว. สมชาย รัสัตว์",
        notes: "แยกตู้กักกันก่อน ตรวจคุณภาพน้ำทุกวัน",
      },
    ],
  },
  {
    id: 7, hn: "HN-2026-007", name: "เร็กซ์", nameEn: "Rex", species: "สัตว์เลี้ยงคลาน", breed: "อีกัวน่าเขียว", gender: "เพศผู้",
    weight: "2.3 กก.", age: "5 ปี", microchip: "-", color: "เขียว",
    owner: "ธนากร ชัยชนะ", ownerPhone: "094-882-0033",
    allergies: "ไม่มี", chronic: "ขาดแคลเซียม", sterilized: false,
    image: "https://images.unsplash.com/photo-1764156903191-f9d250be3bf2?w=200&h=200&fit=crop",
    vaccines: [],
    surgeries: [],
    visits: 4,
    visitHistory: [
      {
        id: 1, date: "25 ก.พ. 2569", time: "11:30 น.", type: "OPD", weight: "2.3 กก.",
        chiefComplaint: "ขาอ่อนแรง งอผิดรูป",
        diagnosis: "Metabolic Bone Disease (โรคกระดูกขาดแคลเซียม)",
        treatment: "อกซเรย์กระดูก, ให้แคลเซียมเสริม",
        medications: ["Calcium Gluconate 100mg/kg ฉีด", "Vitamin D3 supplement 2 หยด/วัน"],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "เพิ่มการรับแสง UVB อย่างน้อย 12 ชั่วโมง/วัน ปรับอาหารเป็นผักใบเขียวเข้ม",
      },
    ],
  },
];

const tabs = ["ข้อมูลทั่วไป", "ข้อมูลทางการแพทย์", "ประวัติการรักษา", "วัคซีน", "การผ่าตัด", "ไฟล์แนบ"];

const speciesOptions = [
  { label: "ทั้งหมด", icon: PawPrint },
  { label: "สุนัข", icon: Dog },
  { label: "แมว", icon: Cat },
  { label: "นก", icon: Bird },
  { label: "ปลา", icon: Fish },
  { label: "สัตว์เลี้ยงขนาดเล็ก", icon: Rabbit },
  { label: "สัตว์เลี้ยงคลาน", icon: PawPrint },
  { label: "อื่นๆ", icon: PawPrint },
];

export function Pets() {
  const [pets, setPets] = useState(petsData);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(petsData[0]);
  const [activeTab, setActiveTab] = useState("ข้อมูลทั่วไป");
  const [expandedVisit, setExpandedVisit] = useState<number | null>(1);
  const [speciesFilter, setSpeciesFilter] = useState("ทั้งหมด");
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editingPet, setEditingPet] = useState<typeof petsData[0] | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSpeciesDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddPet = (data: {
    hn: string; name: string; nameEn: string; species: string; breed: string; gender: string;
    color: string; weight: string; age: string; ageText: string; microchip: string;
    sterilized: boolean | null; sterilizedDate: string; food: string;
    owner: string; ownerPhone: string; allergies: string; chronic: string; imagePreview: string | null;
  }) => {
    if (editingPet) {
      // Edit mode
      const updated = {
        ...editingPet,
        hn: data.hn || editingPet.hn,
        name: data.name,
        nameEn: data.nameEn || "",
        species: data.species || editingPet.species,
        breed: data.breed || "-",
        gender: data.gender || "-",
        weight: data.weight ? `${data.weight} กก.` : editingPet.weight,
        age: data.ageText || data.age || editingPet.age,
        microchip: data.microchip || "-",
        color: data.color || "-",
        owner: data.owner || editingPet.owner,
        ownerPhone: data.ownerPhone || editingPet.ownerPhone,
        allergies: data.allergies || "ไม่มี",
        chronic: data.chronic || "ไม่มี",
        sterilized: data.sterilized === true,
        image: data.imagePreview ?? editingPet.image,
      };
      setPets(prev => prev.map(p => p.id === editingPet.id ? updated : p));
      setSelected(updated);
      setEditingPet(null);
      showSnackbar("update", "อัปเดตข้อมูลสัตว์เลี้ยงสำเร็จ");
    } else {
      // Add mode
      const newPet = {
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
        image: data.imagePreview as string | null,
        vaccines: [] as { name: string; date: string; nextDue: string; batch: string }[],
        surgeries: [] as { name: string; date: string; vet: string; notes: string }[],
        visits: 0,
        visitHistory: [] as {
          id: number; date: string; time: string; type: string; weight: string;
          chiefComplaint: string; diagnosis: string; treatment: string;
          medications: string[]; vet: string; notes: string;
        }[],
      };
      setPets(prev => [newPet, ...prev]);
      setSelected(newPet);
      setActiveTab("ข้อมูลทั่วไป");
      setShowDetail(true);
      showSnackbar("success", "เพิ่มสัตว์เลี้ยงใหม่สำเร็จแล้ว");
    }
  };

  const handleEditClick = () => {
    if (!selected) return;
    setEditingPet(selected);
    setShowAddModal(true);
  };

  const handleDeleteClick = () => {
    if (!selected) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!selected) return;
    const remaining = pets.filter(p => p.id !== selected.id);
    setPets(remaining);
    setSelected(remaining[0] || null as any);
    setShowDeleteConfirm(false);
    setShowDetail(false);
    showSnackbar("delete", `ลบข้อมูล "${selected.name}" เรียบร้อยแล้ว`);
  };

  const filtered = pets.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.hn.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = speciesFilter === "ทั้งหมด" || p.species === speciesFilter;
    return matchSearch && matchSpecies;
  });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };
  const panelVariants = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } },
  };

  return (
    <>
    <div className="flex h-full">
      {/* Left: Pet List */}
      <div className={`
        ${showDetail ? "hidden" : "flex"} md:flex
        flex-col w-full md:w-[320px] border-r border-gray-100 bg-white flex-shrink-0
      `}>
        <motion.div
          className="px-4 pt-4 pb-3 vet-border-b space-y-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Title row */}
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900" style={{ fontWeight: 600 }}>สัตว์เลี้ยง</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-white rounded-full flex-shrink-0 active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}>
              <Plus className="w-3.5 h-3.5" />
              เพิ่มสัตว์เลี้ยง
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} รายการ</p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ชื่อ, HN, เจ้าของ..."
              className="vet-search"
            />
          </div>

          {/* Species filter */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSpeciesDropdown(v => !v)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-full transition-colors ${
                speciesFilter !== "ทั้งหมด"
                  ? "border-[#19a589] text-[#19a589] bg-[#19a589]/5"
                  : "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {(() => {
                const opt = speciesOptions.find(o => o.label === speciesFilter);
                const Icon = opt?.icon ?? PawPrint;
                return <Icon className="w-4 h-4 flex-shrink-0" />;
              })()}
              <span className="flex-1 text-left text-sm">
                {speciesFilter === "ทั้งหมด" ? "กรองตามชนิดสัตว์" : speciesFilter}
              </span>
              {speciesFilter !== "ทั้งหมด" && (
                <span
                  onClick={(e) => { e.stopPropagation(); setSpeciesFilter("ทั้งหมด"); }}
                  className="w-4 h-4 rounded-full bg-[#19a589]/20 text-[#19a589] flex items-center justify-center text-xs hover:bg-[#19a589]/30 cursor-pointer flex-shrink-0"
                >×</span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 text-gray-400 transition-transform ${showSpeciesDropdown ? "rotate-180" : ""}`} />
            </button>

            {showSpeciesDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                {speciesOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = speciesFilter === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => { setSpeciesFilter(opt.label); setShowSpeciesDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isActive ? "text-[#19a589] bg-[#19a589]/5" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-[#19a589]/15" : "bg-gray-100"
                      }`}>
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#19a589]" : "text-gray-500"}`} />
                      </div>
                      <span style={{ fontWeight: isActive ? 600 : 400 }}>{opt.label}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#19a589]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
        <motion.div
          className="flex-1 overflow-y-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((pet) => (
            <motion.button
              key={pet.id}
              variants={itemVariants}
              onClick={() => { setSelected(pet); setShowDetail(true); }}
              className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 vet-border-b-50 hover:bg-[#e8802a]/5 relative
                ${selected?.id === pet.id ? "bg-gradient-to-r from-[#e8802a]/10 via-[#e8802a]/5 to-transparent" : ""}
              `}
              style={selected?.id === pet.id ? { boxShadow: "inset 3px 0 0 #e8802a, 0 1px 8px rgba(232,128,42,0.08)" } : {}}
            >
              <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                {pet.image ? (
                  <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <img src={getSpeciesAvatar(pet.species)} alt={pet.species} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{pet.name}</span>
                  {pet.allergies !== "ไม่มี" && <AlertTriangle className="w-3 h-3 text-orange-400" />}
                </div>
                <div className="text-xs text-gray-400">{pet.hn} · {pet.breed}</div>
                <div className="text-xs text-gray-400">{pet.owner}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Right: Pet Detail */}
      <motion.div
        className={`
          ${showDetail ? "flex" : "hidden"} md:flex
          flex-col flex-1 overflow-y-auto bg-[#FEFBF8]
        `}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
      >
        {selected && (
          <>
            {/* Pet Header — Figma-inspired light banner + pill tabs */}
            <div className="flex-shrink-0" style={{ background: "linear-gradient(168deg, #eef7f5 0%, #e0f3ef 40%, #d4ede8 100%)", boxShadow: "0 4px 24px rgba(25,165,137,0.10), 0 1px 6px rgba(0,0,0,0.04)" }}>
              {/* ── Light Banner ── */}
              <div className="relative px-4 pt-4 pb-0 overflow-hidden">
                {/* Radial glow — top-left */}
                <div className="pointer-events-none absolute left-4 top-4 w-48 h-48 rounded-full opacity-[0.15]" style={{ background: "radial-gradient(circle, #86d492 0%, rgba(134,212,146,0.5) 35%, transparent 70%)" }} />

                {/* Main row: Avatar + Info + Buttons */}
                <div className="relative flex items-start gap-4 py-4">
                  {/* Back button — mobile only */}
                  <button
                    onClick={() => setShowDetail(false)}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#19a589]/10 text-[#19a589] hover:text-[#0d7c66] transition-colors flex-shrink-0 mt-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Avatar with gradient ring */}
                  <div className="flex-shrink-0 rounded-full p-[2.5px]" style={{ background: "linear-gradient(135deg, #4dd4b0 0%, #19a589 50%, #0d7c66 100%)" }}>
                    <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-white p-[2px]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                        {selected.image ? (
                          <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                        ) : (
                          <img src={getSpeciesAvatar(selected.species)} alt={selected.species} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Name + HN */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-gray-900 text-2xl truncate" style={{ fontWeight: 700 }}>{selected.name}</h1>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-[#19a589]/20 text-[#19a589] bg-[#19a589]/10" style={{ fontWeight: 600 }}>
                        {selected.hn}
                      </span>
                    </div>

                    {/* Dot-separated meta info */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                      <span className="text-[#2d5232]/70">{selected.species}</span>
                      <span className="text-[#19a589] text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-[#2d5232]/70">{selected.breed}</span>
                      <span className="text-[#19a589] text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-[#2d5232]/70">{selected.gender}</span>
                      <span className="text-[#19a589] text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-[#2d5232]/70">{selected.age}</span>
                      <span className="text-[#19a589] text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-[#2d5232]/70">{selected.weight}</span>
                      <span className="text-xs text-[#19a589]/20">|</span>
                      <span className="text-[#2d5232]/70">
                        <span>เจ้าของ:</span>
                        <span style={{ fontWeight: 500 }}> {selected.owner}</span>
                      </span>
                      <span className="text-[#19a589] text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-[#2d5232]/70">{selected.ownerPhone}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 flex-shrink-0 pt-1">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-white/50 rounded-full hover:bg-white/90 text-[#3B82F6] transition-colors text-xs" style={{ fontWeight: 500 }}>
                      <Printer className="w-3 h-3" />
                      <span className="hidden sm:inline">พิมพ์บัตร</span>
                    </button>
                    <button
                      onClick={handleEditClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-white/50 rounded-full hover:bg-white/90 text-[#6a7282] transition-colors text-xs" style={{ fontWeight: 500 }}
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-white/50 rounded-full hover:bg-white/90 text-[#ff6467] transition-colors text-xs" style={{ fontWeight: 500 }}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">ลบ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Pill Tab Bar ── */}
              <div className="px-4 pb-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] p-1 flex items-center overflow-x-auto scrollbar-hide">
                  {tabs.map((tab) => {
                    const tabIcons: Record<string, ElementType> = {
                      "ข้อมูลทั่วไป": FileText,
                      "ข้อมูลทางการแพทย์": Stethoscope,
                      "ประวัติการรักษา": Heart,
                      "วัคซีน": Syringe,
                      "การผ่าตัด": Scissors,
                      "ไฟล์แนบ": Camera,
                    };
                    const Icon = tabIcons[tab];
                    return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-full whitespace-nowrap transition-all ${
                        activeTab === tab
                          ? "bg-[#19a589] text-white"
                          : "text-[#6a7282] hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      style={{ fontWeight: activeTab === tab ? 500 : 400 }}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {tab}
                    </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-3 sm:p-6">
              {activeTab === "ข้อมูลทั่วไป" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "HN", value: selected.hn, icon: Hash, color: "text-white", bg: "bg-gradient-to-br from-[#20b899] to-[#0a4d3f]" },
                    { label: "ชื่อสัตว์เลี้ยง", value: selected.name, icon: PawPrint, color: "text-white", bg: "bg-gradient-to-br from-orange-400 to-orange-600" },
                    { label: "ชื่อภาษาอังกฤษ", value: selected.nameEn || "—", icon: PawPrint, color: "text-white", bg: "bg-gradient-to-br from-sky-400 to-sky-600" },
                    { label: "ชนิดสัตว์", value: selected.species, icon: Dog, color: "text-white", bg: "bg-gradient-to-br from-amber-400 to-amber-600" },
                    { label: "สายพันธุ์", value: selected.breed, icon: GitBranch, color: "text-white", bg: "bg-gradient-to-br from-purple-400 to-purple-600" },
                    { label: "เพศ", value: selected.gender, icon: User, color: "text-white", bg: "bg-gradient-to-br from-blue-400 to-blue-600" },
                    { label: "สี/ขน", value: selected.color, icon: Palette, color2: "text-white", bg2: "bg-gradient-to-br from-pink-400 to-pink-600" },
                    { label: "น้ำหนัก", value: selected.weight, icon: Scale, color: "text-white", bg: "bg-gradient-to-br from-teal-400 to-teal-600" },
                    { label: "อายุ", value: selected.age, icon: Calendar, color: "text-white", bg: "bg-gradient-to-br from-indigo-400 to-indigo-600" },
                    { label: "หมายเลขไมโครชิป", value: selected.microchip, icon: Cpu, color: "text-white", bg: "bg-gradient-to-br from-gray-400 to-gray-600" },
                    { label: "เจ้าของ", value: selected.owner, icon: User, color: "text-white", bg: "bg-gradient-to-br from-[#20b899] to-[#0a4d3f]" },
                    { label: "เบอร์โทรเจ้าของ", value: selected.ownerPhone, icon: Phone, color: "text-white", bg: "bg-gradient-to-br from-blue-400 to-blue-600" },
                    { label: "ทำหมัน", value: selected.sterilized ? "ใช่" : "ไม่", icon: Shield, color: "text-white", bg: selected.sterilized ? "bg-gradient-to-br from-[#20b899] to-[#0a4d3f]" : "bg-gradient-to-br from-gray-300 to-gray-500" },
                  ].map((f) => {
                    const Icon = f.icon;
                    const iconColor = f.color ?? f.color2 ?? "text-gray-400";
                    const iconBg = f.bg ?? f.bg2 ?? "bg-gray-100";
                    return (
                      <div key={f.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          f.label === "เพศ"
                            ? f.value === "เพศผู้" ? "bg-gradient-to-br from-blue-400 to-blue-600"
                            : f.value === "เพศเมีย" ? "bg-gradient-to-br from-pink-400 to-pink-600"
                            : "bg-gradient-to-br from-gray-300 to-gray-500"
                            : iconBg
                        }`}>
                          {f.label === "เพศ" ? (
                            <span className={`text-base leading-none select-none text-white`} style={{ fontWeight: 700 }}>
                              {f.value === "เพศผู้" ? "♂" : f.value === "เพศเมีย" ? "♀" : "?"}
                            </span>
                          ) : f.label === "ชนิดสัตว์" ? (() => {
                            const speciesIconMap: Record<string, ElementType> = {
                              "สุนัข": Dog,
                              "แมว": Cat,
                              "นก": Bird,
                              "ปลา": Fish,
                              "สัตว์เลี้ยงขนาดเล็ก": Rabbit,
                            };
                            const SpeciesIcon = speciesIconMap[f.value] ?? PawPrint;
                            return <SpeciesIcon className={`w-4 h-4 ${iconColor}`} />;
                          })() : (
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
                          <div className={`text-sm text-gray-800 ${
                            f.label === "เพศ"
                              ? f.value === "เพศผู้" ? "text-blue-700"
                              : f.value === "เพศเมีย" ? "text-pink-600"
                              : "text-gray-500"
                              : ""
                          }`} style={{ fontWeight: 500 }}>{f.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "ข้อมูลทางการแพทย์" && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <h3 className="text-gray-800" style={{ fontWeight: 600 }}>ประวัติแพ้ยา</h3>
                    </div>
                    <p className="text-sm text-gray-700">{selected.allergies !== "ไม่มี" ? selected.allergies : "ไม่มีประวัติแพ้ยา"}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-red-400" />
                      <h3 className="text-gray-800" style={{ fontWeight: 600 }}>โรคประจำตัว</h3>
                    </div>
                    <p className="text-sm text-gray-700">{selected.chronic !== "ไม่มี" ? selected.chronic : "ไม่มีโรคประจำตัว"}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="text-gray-800 mb-3" style={{ fontWeight: 600 }}>ประวัติการรักษา</h3>
                    <p className="text-sm text-gray-500">บันทึกการรักษาทั้งหมด {selected.visits} ครั้ง</p>
                  </div>
                </div>
              )}

              {activeTab === "ประวัติการรักษา" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">ทั้งหมด {selected.visitHistory.length} ครั้ง</span>
                    
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="hidden sm:block absolute left-[5.5rem] top-0 bottom-0 w-px bg-gray-100" />

                    <div className="space-y-4">
                      {selected.visitHistory.map((v) => (
                        <div key={v.id} className="flex gap-2 sm:gap-4">
                          {/* Date column */}
                          <div className="hidden sm:block w-20 flex-shrink-0 text-right pt-3.5">
                            <div className="text-xs text-gray-500" style={{ fontWeight: 500 }}>{v.date.split(" ").slice(0, 2).join(" ")}</div>
                            <div className="text-xs text-gray-400">{v.date.split(" ")[2]}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{v.time}</div>
                          </div>

                          {/* Dot */}
                          <div className="hidden sm:flex flex-col items-center flex-shrink-0" style={{ marginLeft: 4 }}>
                            <div className="w-3 h-3 rounded-full bg-[#19a589] border-2 border-white ring-2 ring-[#19a589]/30 mt-4 flex-shrink-0" />
                          </div>

                          {/* Card */}
                          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Card Header */}
                            <button
                              onClick={() => setExpandedVisit(expandedVisit === v.id ? null : v.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                v.type === "OPD"
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : "bg-orange-50 text-orange-600 border border-orange-100"
                              }`} style={{ fontWeight: 600 }}>
                                {v.type}
                              </span>
                              <span className="text-sm text-gray-800 flex-1" style={{ fontWeight: 500 }}>{v.chiefComplaint}</span>
                              <span className="text-xs text-gray-400 flex-shrink-0">{v.vet.split(" ")[1]}</span>
                              {expandedVisit === v.id
                                ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              }
                            </button>

                            {/* Expanded content */}
                            {expandedVisit === v.id && (
                              <div className="vet-border-t-50 px-4 py-4 space-y-3">
                                {/* Weight row */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="text-gray-400">น้ำหนัก:</span>
                                  <span className="text-gray-700" style={{ fontWeight: 500 }}>{v.weight}</span>
                                </div>

                                {/* Diagnosis */}
                                <div className="flex gap-2">
                                  <Stethoscope className="w-4 h-4 text-[#19a589] flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-xs text-gray-400 mb-0.5">การวินิจฉัย</div>
                                    <div className="text-sm text-gray-700">{v.diagnosis}</div>
                                  </div>
                                </div>

                                {/* Treatment */}
                                <div className="flex gap-2">
                                  <FileText className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-xs text-gray-400 mb-0.5">การรักษา</div>
                                    <div className="text-sm text-gray-700">{v.treatment}</div>
                                  </div>
                                </div>

                                {/* Medications */}
                                <div className="flex gap-2">
                                  <Pill className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-400 mb-1">ยาที่ได้รับ</div>
                                    <div className="space-y-1">
                                      {v.medications.map((med, mi) => (
                                        <div key={mi} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-3 py-1 inline-block mr-1 mb-1">
                                          {med}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {v.notes && (
                                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
                                    <span style={{ fontWeight: 600 }}>หมายเหตุ: </span>{v.notes}
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-1 vet-border-t-50">
                                  <span className="text-xs text-gray-400">สัตวแพทย์: <span className="text-gray-600">{v.vet}</span></span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selected.visitHistory.length === 0 && (
                    <div className="text-center py-12 text-gray-400">ไม่มีประวัติการรักษา</div>
                  )}
                </div>
              )}

              {activeTab === "วัคซีน" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button className="flex items-center gap-1.5 text-white rounded-full flex-shrink-0 active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
                      style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}>
                      <Plus className="w-3.5 h-3.5" />
                      เพิ่มวัคซีน
                    </button>
                  </div>
                  {selected.vaccines.map((v, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#20b899] to-[#0a4d3f]">
                        <Syringe className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{v.name}</div>
                        <div className="text-xs text-gray-400">รุ่นยา: {v.batch}</div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-xs text-gray-400">ฉีดเมื่อ: <span className="text-gray-700">{v.date}</span></div>
                        <div className="text-xs text-[#19a589]" style={{ fontWeight: 500 }}>นัดครั้งถัดไป: {v.nextDue}</div>
                      </div>
                    </div>
                  ))}
                  {selected.vaccines.length === 0 && (
                    <div className="text-center py-12 text-gray-400">ไม่มีข้อมูลวัคซีน</div>
                  )}
                </div>
              )}

              {activeTab === "การผ่าตัด" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button className="flex items-center gap-1.5 text-white rounded-full flex-shrink-0 active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
                      style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}>
                      <Plus className="w-3.5 h-3.5" />
                      เพิ่มบันทึก
                    </button>
                  </div>
                  {selected.surgeries.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{s.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{s.date} · {s.vet}</div>
                          <p className="text-sm text-gray-600 mt-2">{s.notes}</p>
                        </div>
                        <Scissors className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                  {selected.surgeries.length === 0 && (
                    <div className="text-center py-12 text-gray-400">ไม่มีบันทึกการผ่าตัด</div>
                  )}
                </div>
              )}

              {activeTab === "ไฟล์แนบ" && (
                <div className="max-w-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    {selected.image && (
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                        <img src={selected.image} alt="สัตว์เลี้ยง" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-400">อัปโหลดรูปภาพ</span>
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>

      <AddPetModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingPet(null); }}
        onSave={handleAddPet}
        initialData={editingPet ? {
          hn: editingPet.hn,
          name: editingPet.name,
          nameEn: editingPet.nameEn,
          species: editingPet.species,
          breed: editingPet.breed === "-" ? "" : editingPet.breed,
          gender: editingPet.gender === "-" ? "" : editingPet.gender,
          color: editingPet.color === "-" ? "" : editingPet.color,
          weight: editingPet.weight.replace(" กก.", ""),
          age: "",
          ageText: editingPet.age === "-" ? "" : editingPet.age,
          microchip: editingPet.microchip === "-" ? "" : editingPet.microchip,
          sterilized: editingPet.sterilized,
          sterilizedDate: "",
          food: "",
          owner: editingPet.owner === "-" ? "" : editingPet.owner,
          ownerPhone: editingPet.ownerPhone === "-" ? "" : editingPet.ownerPhone,
          allergies: editingPet.allergies,
          chronic: editingPet.chronic,
          imagePreview: editingPet.image,
        } : null}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                {/* Header */}
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

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-100">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-100">
                      {selected.image ? (
                        <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                      ) : (
                        <img src={getSpeciesAvatar(selected.species)} alt={selected.species} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{selected.name}</p>
                      <p className="text-xs text-gray-400">{selected.hn} · {selected.species} · {selected.breed}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ข้อมูลสัตว์เลี้ยงและประวัติการรักษาทั้งหมดจะถูกลบออกจากระบบ
                  </p>
                </div>

                {/* Footer */}
                <div className="vet-modal-footer rounded-b-3xl">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="vet-btn vet-btn-secondary"
                    style={{ width: 110 }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex items-center justify-center gap-1.5 text-sm px-5 py-2 text-white rounded-full transition-all active:scale-[0.97]"
                    style={{ fontWeight: 600, background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ลบข้อมูล
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}