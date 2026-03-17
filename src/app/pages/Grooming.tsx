import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Star, Scissors, Camera, ChevronDown,
  ArrowLeft, CheckCircle2, Calendar, User, Clock,
  Ruler, Zap, Droplets, Sparkles, X, ChevronRight,
  Bell, Tag, Percent, Phone, MessageSquare, Edit2, Trash2,
  Check,
} from "lucide-react";
import { DatePickerModern } from "../components/DatePickerModern";
import { TimePickerModern } from "../components/TimePickerModern";
import { useSnackbar } from "../contexts/SnackbarContext";

/* ─────────────────────── Types & Mock Data ─────────────────────── */
interface GroomRecord {
  id: number;
  pet: string;
  breed: string;
  owner: string;
  phone: string;
  animal: string;
  photo: string;
  date: string;
  groomer: string;
  services: string[];
  style: string;
  length: string;
  size: string;
  difficulty: string;
  price: number;
  rating: number;
  note: string;
  status: "เสร็จสิ้น" | "กำลังดำเนินการ" | "รออนุมัติ";
  nextAppt: string;
}

const mockRecords: GroomRecord[] = [
  {
    id: 1,
    pet: "แม็กซ์", breed: "Black Labrador", owner: "ประพันธ์ มงคล", phone: "062-111-2233",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1608138498905-05b5cd816a36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "4 มี.ค. 2569", groomer: "อรัญ สีลา",
    services: ["ตัดแต่งทั้งชุด", "บำบัดขนร่วง"],
    style: "พัพพี้คัท", length: "30 มม.", size: "ใหญ่ (20–35 กก.)", difficulty: "ปกติ",
    price: 1000, rating: 5, note: "น้องดีมาก ไม่กัด สยบตัวเร็ว",
    status: "เสร็จสิ้น", nextAppt: "4 เม.ย. 2569",
  },
  {
    id: 2,
    pet: "ลูน่า", breed: "Persian Cat", owner: "วรรณา ศรีสุข", phone: "089-876-5432",
    animal: "🐈", photo: "https://images.unsplash.com/photo-1673125301353-0eeb662e51d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "4 มี.ค. 2569", groomer: "ทอม ชาตรี",
    services: ["อาบน้ำพื้นฐาน", "ทำความสะอาดหู", "ตัดเล็บ"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ง่าย",
    price: 520, rating: 4, note: "ขนยาวมาก ใช้เวลาพิเศษ",
    status: "กำลังดำเนินการ", nextAppt: "—",
  },
  {
    id: 3,
    pet: "ป๊อบ", breed: "Pomeranian", owner: "วิชัย มงคล", phone: "083-456-7890",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1703368786305-4e1dcfcfd0db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "3 มี.ค. 2569", groomer: "อรัญ สีลา",
    services: ["ตัดแต่งทั้งชุด"],
    style: "เท็ดดี้แบร์", length: "20 มม.", size: "เล็กมาก (< 5 กก.)", difficulty: "ปกติ",
    price: 600, rating: 5, note: "",
    status: "เสร็จสิ้น", nextAppt: "3 เม.ย. 2569",
  },
  {
    id: 4,
    pet: "ชาร์ลี", breed: "Beagle", owner: "ธีรพล วงศ์สุวรรณ", phone: "085-777-8899",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "2 มี.ค. 2569", groomer: "ทอม ชาตรี",
    services: ["อาบน้ำพื้นฐาน", "แปรงฟัน"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ยาก",
    price: 450, rating: 3, note: "ดื้อตอนจับอุ้งเท้า ต้องใช้สองคน",
    status: "เสร็จสิ้น", nextAppt: "2 เม.ย. 2569",
  },
  {
    id: 5,
    pet: "มิ้ว", breed: "Scottish Fold", owner: "กัญญา สุวรรณ", phone: "091-678-9012",
    animal: "🐈", photo: "https://images.unsplash.com/photo-1719218214197-441901e981b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "1 มี.ค. 2569", groomer: "อรัญ สีลา",
    services: ["อาบน้ำพื้นฐาน", "ตัดเล็บ", "ทำความสะอาดหู"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ง่าย",
    price: 520, rating: 5, note: "น่ารักมาก ชอบอาบน้ำ",
    status: "เสร็จสิ้น", nextAppt: "1 เม.ย. 2569",
  },
  {
    id: 6,
    pet: "โกลดี้", breed: "Golden Retriever", owner: "สมชาย แก้วใส", phone: "082-111-2233",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "4 มี.ค. 2569", groomer: "กมล วงศ์ดี",
    services: ["ตัดแต่งทั้งชุด", "บำบัดขนร่วง"],
    style: "ธรรมชาติ", length: "40 มม.", size: "ใหญ่ (20–35 กก.)", difficulty: "ปกติ",
    price: 1000, rating: 0, note: "นัดตอนบ่ายสอง รอยืนยันเจ้าของ",
    status: "รออนุมัติ", nextAppt: "—",
  },
  {
    id: 7,
    pet: "ถั่ว", breed: "Shih Tzu", owner: "นฤมล ดาวเรือง", phone: "098-765-4321",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1591160690555-5d7ac4f4f4bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "4 มี.ค. 2569", groomer: "ทอม ชาตรี",
    services: ["อาบน้ำพื้นฐาน", "แปรงฟัน", "ตัดเล็บ"],
    style: "เท็ดดี้แบร์", length: "25 มม.", size: "เล็กมาก (< 5 กก.)", difficulty: "ง่าย",
    price: 550, rating: 0, note: "ขนพันกัน ควรใช้ครีมนวด",
    status: "รออนุมัติ", nextAppt: "—",
  },
  {
    id: 8,
    pet: "บัดดี้", breed: "Golden Retriever", owner: "สมศักดิ์ ใจดี", phone: "081-234-5678",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1734966213753-1b361564bab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "3 มี.ค. 2569", groomer: "กมล วงศ์ดี",
    services: ["อาบน้ำพื้นฐาน", "ทำความสะอาดหู"],
    style: "ธรรมชาติ", length: "—", size: "เล็ก (5–10 กก.)", difficulty: "ปกติ",
    price: 420, rating: 4, note: "ผิวหนังแพ้ง่าย ใช้แชมพูอ่อนโยน",
    status: "เสร็จสิ้น", nextAppt: "3 เม.ย. 2569",
  },
  {
    id: 9,
    pet: "โมจิ", breed: "Maine Coon", owner: "ประพันธ์ มงคล", phone: "062-111-2233",
    animal: "🐈", photo: "https://images.unsplash.com/photo-1616684000067-36952fde56ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "2 มี.ค. 2569", groomer: "อรัญ สีลา",
    services: ["ตัดแต่งทั้งชุด", "บำบัดขนร่วง", "ตัดเล็บ"],
    style: "ไลออนคัท", length: "15 มม.", size: "กลาง (10–20 กก.)", difficulty: "ยาก",
    price: 1100, rating: 5, note: "ขนหนามาก ใช้เวลา 3 ชม.",
    status: "เสร็จสิ้น", nextAppt: "2 เม.ย. 2569",
  },
  {
    id: 10,
    pet: "ริว", breed: "Siberian Husky", owner: "ภูมิ วัฒนา", phone: "086-998-7766",
    animal: "🐕", photo: "https://images.unsplash.com/photo-1617895153857-82fe79b741c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    date: "4 มี.ค. 2569", groomer: "กมล วงศ์ดี",
    services: ["บำบัดขนร่วง", "อาบน้ำพื้นฐาน"],
    style: "ธรรมชาติ", length: "—", size: "ใหญ่ (20–35 กก.)", difficulty: "ยาก",
    price: 900, rating: 0, note: "ขนร่วงเยอะมาก ต้องเป่าลมพิเศษ",
    status: "กำลังดำเนินการ", nextAppt: "—",
  },
];

const groomingServices = [
  { id: 1, name: "อาบน้ำพื้นฐาน",    price: 300, desc: "แชมพู เป่าขน แปรงขน",                  icon: Droplets },
  { id: 2, name: "ตัดแต่งทั้งชุด",   price: 600, desc: "อาบน้ำ + ตัดขน + ตัดเล็บ + ทำความสะอาดหู", icon: Scissors },
  { id: 3, name: "ตัดเล็บ",          price: 100, desc: "ตัดเล็บเท่านั้น",                        icon: Sparkles },
  { id: 4, name: "ทำความสะอาดหู",   price: 120, desc: "ทำความสะอาดและดึงขนในหู",               icon: Sparkles },
  { id: 5, name: "บำบัดขนร่วง",      price: 400, desc: "ลดการหลุดร่วงของขนได้ถึง 80%",           icon: Zap      },
  { id: 6, name: "แปรงฟัน",          price: 150, desc: "บริการทำความสะอาดช่องปาก",              icon: Sparkles },
];

const styles      = ["เท็ดดี้แบร์", "พัพพี้คัท", "ไลออนคัท", "ท็อปน็อต", "ธรรมชาติ", "ครีเอทีฟ"];
const sizes       = ["เล็กมาก (< 5 กก.)", "เล็ก (5–10 กก.)", "กลาง (10–20 กก.)", "ใหญ่ (20–35 กก.)", "ใหญ่มาก (> 35 กก.)"];
const difficulties = ["ง่าย", "ปกติ", "ยาก", "ยากมาก"];
const groomers    = ["อรัญ สีลา", "ทอม ชาตรี", "กมล วงศ์ดี"];

const statusCfg = (s: string) => {
  if (s === "เสร็จสิ้น")        return { cls: "bg-[#19a589]/10 text-[#0d7c66]",  dot: "bg-[#19a589]"  };
  if (s === "กำลังดำเนินการ")   return { cls: "bg-blue-50 text-blue-700",         dot: "bg-blue-500"   };
  if (s === "รออนุมัติ")         return { cls: "bg-amber-50 text-amber-700",       dot: "bg-amber-400"  };
  return { cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
};

/* ─────────────────────── Animation variants ─────────────────────── */
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };
const panelVariants = { hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } } };

/* ═══════════════════════════════════════════════════════════════════ */
/*  New Record Form                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
function NewRecordForm({ onBack }: { onBack: () => void }) {
  const fc = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const fv = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle]         = useState("พัพพี้คัท");
  const [selectedSize, setSelectedSize]           = useState("กลาง (10–20 กก.)");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ปกติ");
  const [selectedServices, setSelectedServices]   = useState<number[]>([1]);
  const [selectedGroomer, setSelectedGroomer]     = useState(groomers[0]);
  const [selectedAssistant, setSelectedAssistant] = useState("ไม่มี");
  const [hairLength, setHairLength]               = useState("30");
  const [note, setNote]                           = useState("");
  const [nextAppt, setNextAppt]                   = useState("");
  const [rating, setRating]                       = useState(5);
  const [hoverRating, setHoverRating]             = useState(0);
  const [timeStart, setTimeStart]                 = useState("");
  const [timeEnd, setTimeEnd]                     = useState("");
  const [behaviorTags, setBehaviorTags]           = useState<string[]>([]);
  const [furCondition, setFurCondition]           = useState("ปกติ");
  const [cuttingDone, setCuttingDone]             = useState("ตัด");
  const [productUsed, setProductUsed]             = useState("แชมพูมาตรฐาน");
  const [specialRec, setSpecialRec]               = useState("");
  const [apptDate, setApptDate]                   = useState("");
  const [apptTime, setApptTime]                   = useState("");
  const [apptType, setApptType]                   = useState("อาบน้ำตัดขน");
  const [apptChannel, setApptChannel]             = useState("โทรศัพท์");
  const [apptNote, setApptNote]                   = useState("");
  const [sendReminder, setSendReminder]           = useState(true);
  const [discount, setDiscount]                   = useState(0);

  /* ── Pet search ── */
  const petDatabase = mockRecords.map(r => ({ name: r.pet, hn: `HN-2026-${String(r.id).padStart(3, "0")}`, breed: r.breed, owner: r.owner, phone: r.phone, animal: r.animal, photo: r.photo }));
  const [petSearch, setPetSearch]       = useState("");
  const [selectedPet, setSelectedPet]  = useState<typeof petDatabase[number] | null>(null);
  const [showPetDrop, setShowPetDrop]  = useState(false);
  const petSearchRef = useRef<HTMLDivElement>(null);
  const filteredPets = petSearch.trim()
    ? petDatabase.filter(p => p.name.includes(petSearch) || p.hn.includes(petSearch) || p.owner.includes(petSearch) || p.breed.toLowerCase().includes(petSearch.toLowerCase()))
    : petDatabase;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (petSearchRef.current && !petSearchRef.current.contains(e.target as Node)) setShowPetDrop(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectPet = (pet: typeof petDatabase[number]) => {
    setSelectedPet(pet);
    setPetSearch(pet.name);
    setShowPetDrop(false);
  };

  const handleClearPet = () => {
    setSelectedPet(null);
    setPetSearch("");
  };

  const toggleService = (id: number) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const subtotal      = groomingServices.filter(s => selectedServices.includes(s.id)).reduce((a, s) => a + s.price, 0);
  const extraCharge   = selectedSize === "ใหญ่มาก (> 35 กก.)" ? 200 : selectedSize === "ใหญ่ (20–35 กก.)" ? 100 : 0;
  const beforeDiscount = subtotal + extraCharge;
  const afterDiscount  = Math.max(0, beforeDiscount - discount);
  const vat            = Math.round(afterDiscount * 0.07);
  const total          = afterDiscount + vat;

  const handleSave = () => {
    showSnackbar("success", "บันทึกบริการอาบน้ำสำเร็จแล้ว");
    onBack();
  };

  const handleSaveAndBill = () => {
    const billItems = groomingServices
      .filter(s => selectedServices.includes(s.id))
      .map(s => ({ name: s.name, unit: "ครั้ง", price: s.price, qty: 1 }));
    if (extraCharge > 0) {
      billItems.push({ name: `ค่าเพิ่มเติมสัตว์ขนาดใหญ่`, unit: "ครั้ง", price: extraCharge, qty: 1 });
    }
    showSnackbar("success", "บันทึกบริการอาบน้ำสำเร็จแล้ว");
    navigate("/financial", {
      state: {
        groomingBill: {
          pet:     selectedPet?.name   || "สัตว์เลี้ยง",
          breed:   selectedPet?.breed  || "",
          owner:   selectedPet?.owner  || "",
          phone:   selectedPet?.phone  || "",
          animal:  selectedPet?.animal || "🐕",
          photo:   selectedPet?.photo  || "",
          groomer: selectedGroomer,
          style:   selectedStyle,
          size:    selectedSize,
          items:   billItems,
          discount,
        },
      },
    });
  };

  return (
    <motion.div className="flex-1 flex flex-col min-h-0" variants={fc} initial="hidden" animate="visible">
      {/* Sub-header */}
      <motion.div variants={fv} className="flex-shrink-0 px-3 sm:px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-gray-900" style={{ fontWeight: 700 }}>บันทึกบริการใหม่</p>
          <p className="text-xs text-gray-400">กรอกข้อ���ูลการอาบน้ำตัดขน</p>
        </div>
      </motion.div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#FEFBF8]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* ── LEFT ── */}
          <div className="space-y-4">

            {/* Pet info */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "0.7rem", fontWeight: 700 }}>1</span>
                ข้อมูลสัตว์เลี้ยง
              </h3>

              {/* ── Pet Search ── */}
              <div ref={petSearchRef} className="relative mb-4">
                <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ค้นหาสัตว์เลี้ยง *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input
                    value={petSearch}
                    onChange={e => { setPetSearch(e.target.value); setShowPetDrop(true); if (selectedPet && e.target.value !== selectedPet.name) setSelectedPet(null); }}
                    onFocus={() => setShowPetDrop(true)}
                    placeholder="พิมพ์ชื่อสัตว์, HN, หรือชื่อเจ้าของ..."
                    className="vet-input !pl-9 !pr-9"
                  />
                  {selectedPet && (
                    <button onClick={handleClearPet} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                  {showPetDrop && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-y-auto"
                    >
                      {filteredPets.length > 0 ? filteredPets.map(p => (
                        <button
                          key={p.hn}
                          onClick={() => handleSelectPet(p)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#19a589]/5 transition-colors ${selectedPet?.hn === p.hn ? "bg-[#19a589]/8" : ""}`}
                        >
                          <img src={p.photo} alt={p.name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>
                              {p.animal} {p.name} <span className="text-gray-400" style={{ fontWeight: 400 }}>({p.hn})</span>
                            </p>
                            <p className="text-xs text-gray-400 truncate">{p.breed} · เจ้าของ: {p.owner}</p>
                          </div>
                          {selectedPet?.hn === p.hn && <CheckCircle2 className="w-4 h-4 text-[#19a589] flex-shrink-0" />}
                        </button>
                      )) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">ไม่พบสัตว์เลี้ยงที่ตรงกัน</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Auto-filled fields ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ชื่อสัตว์ / HN</label>
                  <input value={selectedPet ? `${selectedPet.name} — ${selectedPet.hn}` : ""} readOnly placeholder="เลือกจากช่องค้นหาด้านบน" className="vet-input bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>เจ้าของ</label>
                  <input value={selectedPet?.owner ?? ""} readOnly placeholder="—" className="vet-input bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>สายพันธุ์</label>
                  <input value={selectedPet?.breed ?? ""} readOnly placeholder="—" className="vet-input bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>เบอร์โทรติดต่อ</label>
                  <input value={selectedPet?.phone ?? ""} readOnly placeholder="—" className="vet-input bg-gray-50" />
                </div>
              </div>
            </motion.div>

            {/* Style */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "0.7rem", fontWeight: 700 }}>2</span>
                สไตล์การตัด
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {styles.map(s => (
                  <button key={s} onClick={() => setSelectedStyle(s)}
                    className="py-2.5 text-sm rounded-full border transition-all"
                    style={{
                      background: selectedStyle === s ? "#19a589" : "white",
                      color: selectedStyle === s ? "white" : "#374151",
                      borderColor: selectedStyle === s ? "#19a589" : "#e5e7eb",
                      fontWeight: selectedStyle === s ? 600 : 400,
                      boxShadow: selectedStyle === s ? "0 3px 10px rgba(25,165,137,0.28)" : undefined,
                    }}>{s}</button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ความยาวที่ตัด (มม.)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="number" value={hairLength} onChange={e => setHairLength(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ช่างอาบน้ำ</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <select value={selectedGroomer} onChange={e => setSelectedGroomer(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                      {groomers.map(g => <option key={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ผู้ช่วย</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <select value={selectedAssistant} onChange={e => setSelectedAssistant(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                      <option>ไม่มี</option>
                      {groomers.filter(g => g !== selectedGroomer).map(g => <option key={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Services */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "0.7rem", fontWeight: 700 }}>3</span>
                เลือกบริการ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groomingServices.map(svc => {
                  const active = selectedServices.includes(svc.id);
                  return (
                    <button key={svc.id} onClick={() => toggleService(svc.id)}
                      className="flex items-center gap-3 p-3 rounded-2xl border transition-all text-left"
                      style={{
                        background: active ? "rgba(25,165,137,0.06)" : "white",
                        borderColor: active ? "#19a589" : "#e5e7eb",
                      }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: active ? "#19a589" : "#f3f4f6" }}>
                        <svc.icon className="w-4 h-4" style={{ color: active ? "white" : "#9ca3af" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 truncate" style={{ fontWeight: active ? 600 : 400 }}>{svc.name}</p>
                        <p className="text-gray-400" style={{ fontSize: "0.6rem" }}>{svc.desc}</p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ fontWeight: 600, color: active ? "#19a589" : "#9ca3af" }}>฿{svc.price}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Animal details */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "0.7rem", fontWeight: 700 }}>4</span>
                รายละเอียดสัตว์
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ขนาดตัว</label>
                  <div className="space-y-1.5">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full border text-xs transition-all"
                        style={{
                          background: selectedSize === s ? "rgba(73,138,79,0.07)" : "white",
                          borderColor: selectedSize === s ? "#19a589" : "#e5e7eb",
                          color: selectedSize === s ? "#0d7c66" : "#6b7280",
                          fontWeight: selectedSize === s ? 600 : 400,
                        }}>
                        <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: selectedSize === s ? "#19a589" : "#d1d5db", background: selectedSize === s ? "#19a589" : "transparent" }} />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ระดับความยาก</label>
                  <div className="space-y-1.5">
                    {difficulties.map(d => {
                      const diffColor = d === "ยากมาก" ? "#ef4444" : d === "ยาก" ? "#f97316" : d === "ปกติ" ? "#3b82f6" : "#19a589";
                      return (
                        <button key={d} onClick={() => setSelectedDifficulty(d)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full border text-xs transition-all"
                          style={{
                            background: selectedDifficulty === d ? `${diffColor}10` : "white",
                            borderColor: selectedDifficulty === d ? diffColor : "#e5e7eb",
                            color: selectedDifficulty === d ? diffColor : "#6b7280",
                            fontWeight: selectedDifficulty === d ? 600 : 400,
                          }}>
                          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                            style={{ borderColor: selectedDifficulty === d ? diffColor : "#d1d5db", background: selectedDifficulty === d ? diffColor : "transparent" }} />
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notes + Photos */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-gray-800 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "0.7rem", fontWeight: 700 }}>5</span>
                บันทึกและรูปภาพ
              </h3>

              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ช่วงเวลา</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-300 mb-1 block">เริ่ม</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="datetime-local" value={timeStart} onChange={e => setTimeStart(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 mb-1 block">สิ้นสุด</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="datetime-local" value={timeEnd} onChange={e => setTimeEnd(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>พฤติกรรม</label>
                <div className="flex flex-wrap gap-2">
                  {["แปรงง่าย", "สัตว์เลี้ยงตัวใหญ่", "ขัดขวาง", "กัด/ข่วน", "ขนพันกัน", "กลัวน้ำ", "ร้องไห้", "ต้อ��ใช้สองคน"].map(tag => {
                    const active = behaviorTags.includes(tag);
                    return (
                      <button key={tag} type="button"
                        onClick={() => setBehaviorTags(prev => active ? prev.filter(t => t !== tag) : [...prev, tag])}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
                        style={{
                          background: active ? "rgba(25,165,137,0.08)" : "white",
                          borderColor: active ? "#19a589" : "#e5e7eb",
                          color: active ? "#0d7c66" : "#6b7280",
                          fontWeight: active ? 600 : 400,
                        }}>
                        {active && <CheckCircle2 className="w-3 h-3" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-4">
                <p className="text-xs text-gray-500" style={{ fontWeight: 600 }}>การประเมินสภาพขน</p>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>สภาพขนเดิม</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <select value={furCondition} onChange={e => setFurCondition(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                      {["ปกติ", "แปรงง่าย", "ขนพันกัน (เล็กน้อย)", "ขนพันกัน (มาก)", "ขนร่วงมาก", "ขนแห้ง/เสีย", "มีปรสิต"].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>การตัดขน</label>
                  <div className="flex gap-2">
                    {["ไม่ตัด", "ตัด"].map(opt => (
                      <button key={opt} type="button" onClick={() => setCuttingDone(opt)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all"
                        style={{
                          background: cuttingDone === opt ? "#19a589" : "white",
                          borderColor: cuttingDone === opt ? "#19a589" : "#e5e7eb",
                          color: cuttingDone === opt ? "white" : "#6b7280",
                          fontWeight: cuttingDone === opt ? 600 : 400,
                          boxShadow: cuttingDone === opt ? "0 2px 8px rgba(25,165,137,0.25)" : undefined,
                        }}>
                        <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: cuttingDone === opt ? "white" : "#d1d5db", background: cuttingDone === opt ? "white" : "transparent" }} />
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>หมายเหตุ</label>
                  <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="ระบุข้อสังเกตพิเศษ เช่น ขนพันกันที่หู, มีแผลเล็กน้อย..."
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all resize-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>ผลิตภัณฑ์ที่ใช้บริการ</label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <select value={productUsed} onChange={e => setProductUsed(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                      {["แชมพูมาตรฐาน", "แชมพูสำหรับขนแห้ง", "แชมพูสมุนไพร", "แชมพูกำจัดหมัด", "แชมพูลูกสุนัข/แมว", "ครีมนวดขน", "สเปรย์น้ำหอม"].map(p => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>คำแนะนำพิเศษสำหรับการบริการ</label>
                  <textarea rows={2} value={specialRec} onChange={e => setSpecialRec(e.target.value)}
                    placeholder="คำแนะนำสำหรับเจ้าของหรือครั้งต่อไป เช่น ควรแปรงขนทุก 3 วัน..."
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all resize-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ความพึงพอใจ</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i + 1)}>
                      <Star className={`w-6 h-6 transition-colors ${i < (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>รูปภาพก่อนอาบน้ำตัดขน</label>
                <div className="grid grid-cols-2 gap-3">
                  {["รูปก่อนทำ", "รูปหลังทำ"].map(label => (
                    <div key={label}>
                      <p className="text-xs text-gray-300 mb-1.5">{label}</p>
                      <label className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#19a589]/40 hover:bg-[#19a589]/3 transition-all">
                        <Camera className="w-5 h-5 text-gray-300" />
                        <span className="text-xs text-gray-400">อัปโหลดรูป</span>
                        <input type="file" accept="image/*" className="hidden" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Section 6: นัดหมายถัดไป */}
            <motion.div variants={fv} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-gray-800 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <span className="w-6 h-6 rounded-full bg-[#19a589] flex items-center justify-center text-white" style={{ fontSize: "0.7rem", fontWeight: 700 }}>6</span>
                นัดหมายถัดไป
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>วันที่นัดหมาย</label>
                  <DatePickerModern value={apptDate} onChange={setApptDate} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>เวลานัด</label>
                  <TimePickerModern value={apptTime} onChange={setApptTime} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>บริการที่นัดหมาย</label>
                <div className="relative">
                  <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select value={apptType} onChange={e => setApptType(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none">
                    {["อาบน้ำตัดขน", "อาบน้ำพื้นฐาน", "ตัดแต่งทั้���ชุด", "ตัดเล็บ", "บำบัดขนร่วง", "แปรงฟัน"].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>ช่องทางการนัด</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "โทรศัพท์", icon: Phone },
                    { label: "LINE",     icon: MessageSquare },
                    { label: "Walk-in",  icon: User },
                  ].map(({ label, icon: Icon }) => (
                    <button key={label} type="button" onClick={() => setApptChannel(label)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all"
                      style={{
                        background: apptChannel === label ? "#19a589" : "white",
                        borderColor: apptChannel === label ? "#19a589" : "#e5e7eb",
                        color: apptChannel === label ? "white" : "#6b7280",
                        fontWeight: apptChannel === label ? 600 : 400,
                        boxShadow: apptChannel === label ? "0 2px 8px rgba(25,165,137,0.25)" : undefined,
                      }}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>หมายเหตุ / คำแนะนำสำหรับการนัดไป</label>
                <textarea rows={3} value={apptNote} onChange={e => setApptNote(e.target.value)}
                  placeholder="หมายเหตุ / คำแนะนำ สำหรับการนัดไป..."
                  className="vet-textarea" />
              </div>
              <button type="button" onClick={() => setSendReminder(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
                style={{
                  background: sendReminder ? "rgba(25,165,137,0.06)" : "white",
                  borderColor: sendReminder ? "#19a589" : "#e5e7eb",
                }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: sendReminder ? "#19a589" : "#f3f4f6" }}>
                  <Bell className="w-4 h-4" style={{ color: sendReminder ? "white" : "#9ca3af" }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-gray-800" style={{ fontWeight: sendReminder ? 600 : 400 }}>ส่งการแจ้งเตือนอัตโนมัติ</p>
                  <p className="text-gray-400" style={{ fontSize: "0.62rem" }}>แจ้งเตือนเจ้าของสัตว์ก่อนวันนัด 1 วัน</p>
                </div>
                <div className="w-8 h-5 rounded-full flex-shrink-0 relative transition-all"
                  style={{ background: sendReminder ? "#19a589" : "#e5e7eb" }}>
                  <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
                    style={{ left: sendReminder ? "calc(100% - 1rem)" : "0.125rem" }} />
                </div>
              </button>
              {apptDate && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "linear-gradient(135deg,#f0faf1,#e8f5e9)", border: "1px solid #c8e6c9" }}>
                  <Calendar className="w-4 h-4 text-[#19a589] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#0d7c66]" style={{ fontWeight: 600 }}>นัดหมาย: {apptType}</p>
                    <p className="text-[#19a589]" style={{ fontSize: "0.68rem" }}>
                      {new Date(apptDate).toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      {apptTime ? ` · ${apptTime} น.` : ""} · {apptChannel}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT: Summary sidebar ── */}
          <div>
            <motion.div variants={fv} className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100" style={{ background: "linear-gradient(135deg,#f0faf1,#ffffff)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#19a589] flex items-center justify-center">
                    <Scissors className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-gray-800" style={{ fontWeight: 700 }}>สรุปรายการ</span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2 text-xs">
                  {[
                    { label: "สไตล์",   value: selectedStyle },
                    { label: "ขนาด",    value: selectedSize.split(" ")[0] },
                    { label: "ความยาก", value: selectedDifficulty },
                    { label: "ช่าง",    value: selectedGroomer },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-gray-400">{row.label}</span>
                      <span className="text-gray-700" style={{ fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                  <p className="text-gray-400 mb-2" style={{ fontWeight: 600 }}>บริการ</p>
                  {groomingServices.filter(s => selectedServices.includes(s.id)).map(s => (
                    <div key={s.id} className="flex justify-between">
                      <span className="text-gray-500">{s.name}</span>
                      <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{s.price.toLocaleString()}</span>
                    </div>
                  ))}
                  {extraCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ค่าเพิ่มตามขนาด</span>
                      <span className="text-gray-700" style={{ fontWeight: 500 }}>+฿{extraCharge}</span>
                    </div>
                  )}
                  {selectedServices.length === 0 && (
                    <p className="text-gray-300 text-center py-2">ยังไม่ได้เลือกบริการ</p>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-dashed border-gray-100 mt-1">
                    <span className="text-gray-500">ราคารวม</span>
                    <span className="text-gray-700" style={{ fontWeight: 600 }}>฿{beforeDiscount.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1" style={{ fontWeight: 500 }}>
                    <Tag className="w-3 h-3" /> ส่วนลด
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">฿</span>
                    <input type="number" min={0} max={beforeDiscount}
                      value={discount || ""}
                      onChange={e => setDiscount(Math.min(Number(e.target.value), beforeDiscount))}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between mt-1.5 text-xs">
                      <span className="text-orange-500">ส่วนลด</span>
                      <span className="text-orange-500" style={{ fontWeight: 600 }}>-฿{discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">ราคาก่อน VAT</span>
                    <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{afterDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Percent className="w-3 h-3" />VAT 7%
                    </span>
                    <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{vat.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                  <p className="text-white/80" style={{ fontSize: "0.7rem", fontWeight: 500 }}>รวมทั้งหมด</p>
                  <p className="text-white mt-0.5" style={{ fontWeight: 800, fontSize: "1.5rem" }}>
                    ฿{total.toLocaleString()}
                  </p>
                  {discount > 0 && (
                    <p className="text-white/60 mt-0.5" style={{ fontSize: "0.65rem" }}>
                      ประหยัด ฿{discount.toLocaleString()}
                    </p>
                  )}
                </div>

                {apptDate && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#19a589]/6 border border-[#19a589]/15">
                    <Calendar className="w-3.5 h-3.5 text-[#19a589] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#0d7c66] truncate" style={{ fontWeight: 600 }}>นัดครั้งถัดไป</p>
                      <p className="text-[#19a589] truncate" style={{ fontSize: "0.62rem" }}>
                        {new Date(apptDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                        {apptTime ? ` · ${apptTime} น.` : ""}
                      </p>
                    </div>
                  </div>
                )}

                <button onClick={handleSaveAndBill}
                  className="vet-btn vet-btn-primary btn-green w-full">
                  บันทึกและเปิดบิล
                </button>
                
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Edit Grooming Modal                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function EditGroomModal({ open, onClose, record, onSave }: {
  open: boolean;
  onClose: () => void;
  record: GroomRecord;
  onSave: (updated: GroomRecord) => void;
}) {
  const [pet, setPet] = useState(record.pet);
  const [breed, setBreed] = useState(record.breed);
  const [owner, setOwner] = useState(record.owner);
  const [phone, setPhone] = useState(record.phone);
  const [style, setStyle] = useState(record.style);
  const [size, setSize] = useState(record.size);
  const [difficulty, setDifficulty] = useState(record.difficulty);
  const [groomer, setGroomer] = useState(record.groomer);
  const [selectedServices, setSelectedServices] = useState<string[]>(record.services);
  const [price, setPrice] = useState(record.price);
  const [rating, setRating] = useState(record.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [note, setNote] = useState(record.note);
  const [status, setStatus] = useState(record.status);
  const [nextAppt, setNextAppt] = useState(record.nextAppt);

  useEffect(() => {
    if (open) {
      setPet(record.pet);
      setBreed(record.breed);
      setOwner(record.owner);
      setPhone(record.phone);
      setStyle(record.style);
      setSize(record.size);
      setDifficulty(record.difficulty);
      setGroomer(record.groomer);
      setSelectedServices(record.services);
      setPrice(record.price);
      setRating(record.rating);
      setNote(record.note);
      setStatus(record.status);
      setNextAppt(record.nextAppt);
    }
  }, [open, record]);

  const toggleService = (s: string) =>
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    onSave({
      ...record,
      pet, breed, owner, phone, style, size, difficulty, groomer,
      services: selectedServices, price, rating, note,
      status, nextAppt,
    });
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              className="w-full max-w-[640px] vet-modal pointer-events-auto flex flex-col"
              style={{ height: "min(92vh, calc(100vh - 2rem))", maxHeight: "92vh" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <Edit2 className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">แก้ไขข้อมูลบริการ</h2>
                      <p className="vet-tiny mt-[2px]">แก้ไขรายละเอียดการอาบน้ำตัดขน</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body flex-1 overflow-y-auto space-y-5 p-5">
                {/* ── Section: ข้อมูลสัตว์เลี้ยง ── */}
                <div className="vet-section-divider"><span>ข้อมูลสัตว์เลี้ยง</span></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">ชื่อสัตว์เลี��ยง</label>
                    <input value={pet} onChange={e => setPet(e.target.value)} className="vet-input" />
                  </div>
                  <div>
                    <label className="vet-label">สายพันธุ์</label>
                    <input value={breed} onChange={e => setBreed(e.target.value)} className="vet-input" />
                  </div>
                  <div>
                    <label className="vet-label">เจ้าของ</label>
                    <input value={owner} onChange={e => setOwner(e.target.value)} className="vet-input" />
                  </div>
                  <div>
                    <label className="vet-label">เบอร์โทร</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="vet-input" />
                  </div>
                </div>

                {/* ── Section: สไตล์และรายละเอียด ── */}
                <div className="vet-section-divider"><span>สไตล์และรายละเอียด</span></div>
                <div>
                  <label className="vet-label mb-2">สไตล์การตัด</label>
                  <div className="flex flex-wrap gap-2">
                    {styles.map(s => (
                      <button key={s} onClick={() => setStyle(s)}
                        className="px-3 py-1.5 text-xs rounded-full border transition-all"
                        style={{
                          background: style === s ? "#19a589" : "white",
                          color: style === s ? "white" : "#6b7280",
                          borderColor: style === s ? "#19a589" : "#e5e7eb",
                          fontWeight: style === s ? 600 : 400,
                        }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label mb-2">ขนาดตัว</label>
                    <div className="space-y-1">
                      {sizes.map(s => (
                        <button key={s} onClick={() => setSize(s)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all text-left"
                          style={{
                            background: size === s ? "rgba(25,165,137,0.07)" : "white",
                            borderColor: size === s ? "#19a589" : "#e5e7eb",
                            color: size === s ? "#0d7c66" : "#6b7280",
                            fontWeight: size === s ? 600 : 400,
                          }}>
                          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                            style={{ borderColor: size === s ? "#19a589" : "#d1d5db", background: size === s ? "#19a589" : "transparent" }} />
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="vet-label mb-2">ระดับความยาก</label>
                    <div className="space-y-1">
                      {difficulties.map(d => {
                        const dc = d === "ยากมาก" ? "#ef4444" : d === "ยาก" ? "#f97316" : d === "ปกติ" ? "#3b82f6" : "#19a589";
                        return (
                          <button key={d} onClick={() => setDifficulty(d)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all text-left"
                            style={{
                              background: difficulty === d ? `${dc}10` : "white",
                              borderColor: difficulty === d ? dc : "#e5e7eb",
                              color: difficulty === d ? dc : "#6b7280",
                              fontWeight: difficulty === d ? 600 : 400,
                            }}>
                            <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                              style={{ borderColor: difficulty === d ? dc : "#d1d5db", background: difficulty === d ? dc : "transparent" }} />
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Section: บริการ ── */}
                <div className="vet-section-divider"><span>บริการ</span></div>
                <div className="grid grid-cols-2 gap-2">
                  {groomingServices.map(svc => {
                    const active = selectedServices.includes(svc.name);
                    return (
                      <button key={svc.id} onClick={() => toggleService(svc.name)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left"
                        style={{
                          background: active ? "rgba(25,165,137,0.06)" : "white",
                          borderColor: active ? "#19a589" : "#e5e7eb",
                        }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: active ? "#19a589" : "#f3f4f6" }}>
                          <svc.icon className="w-3.5 h-3.5" style={{ color: active ? "white" : "#9ca3af" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-800 truncate" style={{ fontWeight: active ? 600 : 400 }}>{svc.name}</p>
                        </div>
                        {active && <Check className="w-3.5 h-3.5 text-[#19a589] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* ── Section: ช่างและค่าบริการ ── */}
                <div className="vet-section-divider"><span>ช่างและค่าบริการ</span></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">ช่างอาบน้ำ</label>
                    <select value={groomer} onChange={e => setGroomer(e.target.value)} className="vet-select">
                      {groomers.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="vet-label">ค่าบริการ (฿)</label>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="vet-input" />
                  </div>
                </div>

                {/* ── Section: สถานะ ── */}
                <div className="vet-section-divider"><span>สถานะ</span></div>
                <div>
                  <label className="vet-label mb-2">สถานะปัจจุบัน</label>
                  <div className="flex gap-2">
                    {(["รออนุมัติ", "กำลังดำเนินการ", "เสร็จสิ้น"] as const).map(s => {
                      const sc = statusCfg(s);
                      return (
                        <button key={s} onClick={() => setStatus(s)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${status === s ? sc.cls : "bg-white text-gray-500 border-gray-200"}`}
                          style={{ fontWeight: status === s ? 600 : 400 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status === s ? sc.dot : "bg-gray-300"}`} />
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Section: ความพึงพอใจ ── */}
                <div className="vet-section-divider"><span>ความพึงพอใจและบันทึก</span></div>
                <div>
                  <label className="vet-label mb-2">ความพึงพอใจ</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i + 1)}>
                        <Star className={`w-5 h-5 transition-colors ${i < (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="vet-label">บันทึกพฤติกรรม</label>
                  <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="ระบุข้อสังเกตพิเศษ..."
                    className="vet-textarea" />
                </div>
                <div>
                  <label className="vet-label">นัดครั้งถัดไป</label>
                  <input value={nextAppt} onChange={e => setNextAppt(e.target.value)} className="vet-input" placeholder="เช่น 4 เม.ย. 2569" />
                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={handleSave}
                  className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all ml-auto"
                  style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                  <Check className="w-4 h-4" />
                  บันทึกการแก้ไข
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ═════════════════════════════════��═════════════════════════════════ */
/*  Delete Grooming Confirmation Dialog                                */
/* ═══════════════════════════════════════════════════════════════════ */
function DeleteGroomDialog({ open, onClose, record, onConfirm }: {
  open: boolean;
  onClose: () => void;
  record: GroomRecord;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
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
                    <img src={record.photo} alt={record.pet} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{record.pet}</p>
                    <p className="text-xs text-gray-400">{record.breed} · {record.owner} · {record.date}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  ข้อมูลบริการอาบน้ำตัดขนนี้จะถูกลบออกจากระบบอย่างถาวร
                </p>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>
                  ยกเลิก
                </button>
                <button onClick={onConfirm}
                  className="flex items-center justify-center gap-1.5 text-sm px-5 py-2 text-white rounded-full transition-all active:scale-[0.97]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                  ลบข้อมูล
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Grooming Page                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
export function Grooming() {
  const [view, setView]                 = useState<"list" | "form">("list");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ทุกสถานะ");
  const [records, setRecords]           = useState<GroomRecord[]>(mockRecords);
  const [selected, setSelected]         = useState<GroomRecord | null>(records[0]);
  const [showDetail, setShowDetail]     = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();
  const navigateTo = useNavigate();

  const statuses = ["ทุกสถานะ", "รออนุมัติ", "กำลังดำเนินการ", "เสร็จสิ้น"];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = records.filter(r => {
    const ms = r.pet.includes(search) || r.owner.includes(search) || r.breed.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "ทุกสถานะ" || r.status === statusFilter;
    return ms && mf;
  });

  const handleEditSave = (updated: GroomRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelected(updated);
    showSnackbar("update", `แก้ไขข้อมูล "${updated.pet}" เรียบร้อยแล้ว`);
  };

  const handleDeleteConfirm = () => {
    if (!selected) return;
    const name = selected.pet;
    const remaining = records.filter(r => r.id !== selected.id);
    setRecords(remaining);
    setSelected(remaining[0] || null);
    setShowDeleteDialog(false);
    setShowDetail(false);
    showSnackbar("delete", `ลบข้อมูลบริการ "${name}" เรียบร้อยแล้ว`);
  };

  /* ── Form view ── */
  if (view === "form") return (
    <motion.div className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <NewRecordForm onBack={() => setView("list")} />
    </motion.div>
  );

  /* ── List view (Pets-style layout) ── */
  return (
    <div className="flex h-full">
      {/* Left: Grooming List */}
      <div className={`
        ${showDetail ? "hidden" : "flex"} md:flex
        flex-col w-full md:w-[320px] border-r border-gray-100 bg-white flex-shrink-0
      `}>
        <motion.div
          className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Title row */}
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900" style={{ fontWeight: 600 }}>อาบน้ำตัดขน</h2>
            <button
              onClick={() => setView("form")}
              className="flex items-center gap-1.5 text-white rounded-full flex-shrink-0 active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}>
              <Plus className="w-3.5 h-3.5" />
              สร้างรายการใหม่
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} ร��ยการ</p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ชื่อสัตว์, เจ้าของ, สายพันธุ์..."
              className="vet-search"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowStatusDropdown(v => !v)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-full transition-colors ${
                statusFilter !== "ทุกสถานะ"
                  ? "border-[#19a589] text-[#19a589] bg-[#19a589]/5"
                  : "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <Scissors className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left text-sm">
                {statusFilter === "ทุกสถานะ" ? "กรองตามสถานะ" : statusFilter}
              </span>
              {statusFilter !== "ทุกสถานะ" && (
                <span
                  onClick={(e) => { e.stopPropagation(); setStatusFilter("ทุกสถานะ"); }}
                  className="w-4 h-4 rounded-full bg-[#19a589]/20 text-[#19a589] flex items-center justify-center text-xs hover:bg-[#19a589]/30 cursor-pointer flex-shrink-0"
                >×</span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 text-gray-400 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
            </button>

            {showStatusDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                {statuses.map((s) => {
                  const isActive = statusFilter === s;
                  const sc = s === "ทุกสถานะ" ? { dot: "bg-gray-300" } : statusCfg(s);
                  return (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isActive ? "text-[#19a589] bg-[#19a589]/5" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-[#19a589]/15" : "bg-gray-100"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      </div>
                      <span style={{ fontWeight: isActive ? 600 : 400 }}>{s}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#19a589]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Scrollable list */}
        <motion.div
          className="flex-1 overflow-y-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((rec) => {
            const sc = statusCfg(rec.status);
            return (
              <motion.button
                key={rec.id}
                variants={itemVariants}
                onClick={() => { setSelected(rec); setShowDetail(true); }}
                className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 vet-border-b-50 hover:bg-[#e8802a]/5 relative
                  ${selected?.id === rec.id ? "bg-gradient-to-r from-[#e8802a]/10 via-[#e8802a]/5 to-transparent" : ""}
                `}
                style={selected?.id === rec.id ? { boxShadow: "inset 3px 0 0 #e8802a, 0 1px 8px rgba(232,128,42,0.08)" } : {}}
              >
                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src={rec.photo} alt={rec.pet} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>{rec.pet}</span>
                    <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${sc.cls}`} style={{ fontSize: "0.6rem", fontWeight: 500 }}>
                      <span className={`w-1 h-1 rounded-full ${sc.dot}`} />{rec.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{rec.breed} · {rec.style}</div>
                  <div className="text-xs text-gray-400">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateTo("/owners", { state: { search: rec.owner } }); }}
                      className="text-[#0d7c66] hover:underline hover:text-[#19a589] transition-colors"
                    >{rec.owner}</button>
                    {" · "}{rec.date}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>฿{rec.price.toLocaleString()}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      null
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">ไม่พบรายการที่ตรงกัน</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Right: Detail Panel */}
      <motion.div
        className={`
          ${showDetail ? "flex" : "hidden"} md:flex
          flex-col flex-1 overflow-y-auto bg-[#FEFBF8]
        `}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
      >
        {selected ? (
          <>
            {/* Header */}
            <div className="flex-shrink-0" style={{ background: "linear-gradient(168deg, #edf5ee 0%, #e2efe3 40%, #d9e9da 100%)", boxShadow: "0 4px 24px rgba(73,138,79,0.10), 0 1px 6px rgba(0,0,0,0.04)" }}>
              <div className="relative px-4 pt-4 pb-4 overflow-hidden">
                {/* Radial glow — top-left */}
                <div className="pointer-events-none absolute left-4 top-4 w-48 h-48 rounded-full opacity-[0.15]" style={{ background: "radial-gradient(circle, #86d492 0%, rgba(134,212,146,0.5) 35%, transparent 70%)" }} />

                {/* Main row: Avatar + Info + Buttons */}
                <div className="relative flex items-start gap-4 py-4">
                  {/* Back button — mobile only */}
                  <button
                    onClick={() => setShowDetail(false)}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/50 text-[#2d5232]/70 transition-colors flex-shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Avatar with gradient ring */}
                  <div className="flex-shrink-0 rounded-full p-[2.5px]" style={{ background: "linear-gradient(135deg, #6aad70 0%, #19a589 50%, #0d7c66 100%)" }}>
                    <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-white p-[2px]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                        <img src={selected.photo} alt={selected.pet} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Name + Status */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-gray-900 text-2xl truncate" style={{ fontWeight: 700 }}>{selected.pet}</h1>
                      {(() => {
                        const sc = statusCfg(selected.status);
                        return (
                          <span className="flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full flex-shrink-0 border border-[#19a589]/20 text-[#19a589] bg-[#19a589]/10" style={{ fontWeight: 600 }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{selected.status}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Dot-separated meta info */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                      <span className="text-[#2d5232]/70">{selected.breed}</span>
                      <span className="text-[#19a589] text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-[#2d5232]/70">สไตล์: {selected.style}</span>
                      <span className="text-[#19a589] text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-[#2d5232]/70">ขนาด: {selected.size}</span>
                      <span className="text-xs text-[#19a589]/20">|</span>
                      <span className="text-[#2d5232]/70">
                        <span>เจ้าของ:</span>
                        <span style={{ fontWeight: 500 }}> {selected.owner}</span>
                      </span>
                      <span className="text-[#19a589] text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-[#2d5232]/70">{selected.phone}</span>
                    </div>
                  </div>

                  {/* Action buttons — frosted glass style */}
                  <div className="flex gap-1.5 flex-shrink-0 pt-1">
                    <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-white/50 rounded-full hover:bg-white/90 text-[#6a7282] transition-colors text-xs cursor-pointer" style={{ fontWeight: 500 }}>
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                    <button onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-white/50 rounded-full hover:bg-white/90 text-red-500 transition-colors text-xs cursor-pointer" style={{ fontWeight: 500 }}>
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Content */}
            <div className="p-4 md:p-6 space-y-4">
              {/* Details grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: Calendar, label: "วันที่",       value: selected.date,       color: "text-white", bg: "bg-gradient-to-br from-[#5a9e60] to-[#2d5232]" },
                  { icon: User,     label: "ช่างอาบน้ำ",   value: selected.groomer,    color: "text-white",  bg: "bg-gradient-to-br from-blue-400 to-blue-600" },
                  { icon: Scissors, label: "สไตล์",        value: selected.style,      color: "text-white", bg: "bg-gradient-to-br from-purple-400 to-purple-600" },
                  { icon: Ruler,    label: "ความยาว",      value: selected.length,     color: "text-white", bg: "bg-gradient-to-br from-amber-400 to-amber-600" },
                  { icon: Clock,    label: "ขนาด",         value: selected.size,       color: "text-white",  bg: "bg-gradient-to-br from-teal-400 to-teal-600" },
                  { icon: Zap,      label: "ระดับความยาก", value: selected.difficulty,  color: "text-white", bg: "bg-gradient-to-br from-orange-400 to-orange-600" },
                ].map(row => (
                  <motion.div key={row.label} variants={itemVariants} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${row.bg}`}>
                      <row.icon className={`w-4 h-4 ${row.color}`} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">{row.label}</div>
                      <div className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{row.value}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Services */}
              <motion.div
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
              >
                <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 600 }}>บริการที่ใช้</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.services.map(s => (
                    <span key={s} className="flex items-center gap-1 bg-[#19a589]/8 text-[#0d7c66] text-xs px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>
                      <CheckCircle2 className="w-3 h-3" />{s}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Rating */}
              <motion.div
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
              >
                <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>ความพึงพอใจ</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < selected.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({selected.rating}/5)</span>
                </div>
              </motion.div>

              {/* Note */}
              {selected.note && (
                <motion.div
                  className="bg-amber-50 rounded-xl border border-amber-100 px-4 py-3"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 }}
                >
                  <p className="text-xs text-amber-600 mb-1" style={{ fontWeight: 600 }}>บันทึกพฤติกรรม</p>
                  <p className="text-xs text-amber-700">{selected.note}</p>
                </motion.div>
              )}

              {/* Price + next appt */}
              <motion.div
                className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 }}
              >
                <div>
                  <p className="text-xs text-gray-400">นัดครั้งถัดไป</p>
                  <p className="text-sm text-gray-700 mt-0.5" style={{ fontWeight: 600 }}>{selected.nextAppt}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">ค่าบริการ</p>
                  <p className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.25rem" }}>฿{selected.price.toLocaleString()}</p>
                </div>
              </motion.div>

              {/* Grooming Gallery */}
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.35 }}
              >
                {[
                  { src: selected.animal === "🐈" ? "https://images.unsplash.com/photo-1686479037314-88bc3732de16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" : "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", label: "ก่อนทำ" },
                  { src: selected.photo, label: "หลังทำ" },
                ].map((img, idx) => (
                  <div key={idx} className="rounded-[10px] shrink-0 size-[80px] overflow-hidden cursor-pointer" onClick={() => setLightboxSrc(img.src)}>
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </motion.div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>เลือกรายการเพื่อดูรายละเอียด</p>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      {selected && (
        <EditGroomModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          record={selected}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Dialog */}
      {selected && (
        <DeleteGroomDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          record={selected}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
          >
            <motion.img
              src={lightboxSrc}
              alt="ดูภาพขยาย"
              className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
