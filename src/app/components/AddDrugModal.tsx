import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Search, Plus, Minus, Check, ChevronDown,
  Pill, User, Package, AlertTriangle, MapPin,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/* ── Drug catalog ── */
export interface DrugCatalogItem {
  id: number;
  code: string;
  genericName: string;
  tradeName: string;
  keywords: string[];
  unit: string;
  pricePerUnit: number;
  stock: number;
  form: string;            // รูปแบบยา
  defaultInstruction: string;
  defaultIndication: string;
}

export const drugCatalog: DrugCatalogItem[] = [
  { id: 1,  code: "MED-001", genericName: "Amoxicillin 250mg",      tradeName: "อะม็อกซิซิลลิน 250mg",     keywords: ["ยาฆ่าเชื้อ","antibiotic","amox"],     unit: "แผง",    pricePerUnit: 120, stock: 85,  form: "เม็ด",     defaultInstruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 7 วัน",        defaultIndication: "ติดเชื้อแบคทีเรีย" },
  { id: 2,  code: "MED-002", genericName: "Prednisolone 5mg",       tradeName: "เพรดนิโซโลน 5mg",          keywords: ["สเตียรอยด์","steroid","pred"],       unit: "แผง",    pricePerUnit: 80,  stock: 120, form: "เม็ด",     defaultInstruction: "กินวันละ 1 ครั้ง ครั้งละ 0.5 เม็ด นาน 5 วัน",      defaultIndication: "ลดการอักเสบ" },
  { id: 3,  code: "MED-003", genericName: "Metronidazole 200mg",    tradeName: "เมโทรนิดาโซล 200mg",       keywords: ["ท้องเสีย","diarrhea","flagyl"],      unit: "แผง",    pricePerUnit: 95,  stock: 60,  form: "เม็ด",     defaultInstruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 5 วัน",        defaultIndication: "ท้องเสีย / ลำไส้อักเสบ" },
  { id: 4,  code: "MED-004", genericName: "Doxycycline 100mg",      tradeName: "ด็อกซี่ไซคลิน 100mg",      keywords: ["antibiotic","doxy","เห็บ","tick"],   unit: "แผง",    pricePerUnit: 150, stock: 45,  form: "แคปซูล",   defaultInstruction: "กินวันละ 2 ครั้ง ครั้งละ 1 แคปซูล นาน 14 วัน",     defaultIndication: "โรคจากเห็บ / เออร์ลิเคีย" },
  { id: 5,  code: "MED-005", genericName: "Meloxicam 7.5mg",        tradeName: "เมล็อกซิแคม 7.5mg",        keywords: ["แก้ปวด","nsaid","pain","ปวด"],       unit: "เม็ด",   pricePerUnit: 25,  stock: 200, form: "เม็ด",     defaultInstruction: "กินวันละ 1 ครั้ง ครั้งละ 1 เม็ด หลังอาหาร นาน 3 วัน", defaultIndication: "แก้ปวด / ลดอักเสบ" },
  { id: 6,  code: "MED-006", genericName: "Omeprazole 20mg",        tradeName: "โอเมพราโซล 20mg",          keywords: ["กระเพาะ","gastric","ppi"],           unit: "แคปซูล", pricePerUnit: 18,  stock: 150, form: "แคปซูล",   defaultInstruction: "กินวันละ 1 ครั้ง ก่อนอาหาร 30 นาที นาน 5 วัน",     defaultIndication: "ลดกรดกระเพาะ" },
  { id: 7,  code: "MED-007", genericName: "Ivermectin 1%",          tradeName: "ไอเวอร์เม็คติน 1%",        keywords: ["พยาธิ","dewormer","parasite"],        unit: "ml",     pricePerUnit: 35,  stock: 30,  form: "ยาฉีด",    defaultInstruction: "ฉีดใต้ผิวหนัง 0.2 ml/kg ครั้งเดียว",                defaultIndication: "กำจัดพยาธิ" },
  { id: 8,  code: "MED-008", genericName: "Cephalexin 500mg",       tradeName: "เซฟาเล็กซิน 500mg",        keywords: ["antibiotic","cepha","ผิวหนัง"],       unit: "แคปซูล", pricePerUnit: 12,  stock: 300, form: "แคปซูล",   defaultInstruction: "กินวันละ 2 ครั้ง ครั้งละ 1 แคปซูล นาน 7 วัน",      defaultIndication: "ติดเชื้อผิวหนัง" },
  { id: 9,  code: "MED-009", genericName: "Chlorpheniramine 4mg",   tradeName: "คลอร์เฟนิรามีน 4mg",       keywords: ["แพ้","allergy","antihistamine","คัน"],unit: "เม็ด",   pricePerUnit: 5,   stock: 500, form: "เม็ด",     defaultInstruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด นาน 5 วัน",        defaultIndication: "แพ้ / คัน" },
  { id: 10, code: "MED-010", genericName: "Tramadol 50mg",          tradeName: "ทรามาดอล 50mg",            keywords: ["แก้ปวด","opioid","pain","ปวด"],       unit: "เม็ด",   pricePerUnit: 15,  stock: 100, form: "เม็ด",     defaultInstruction: "กินวันละ 2 ครั้ง ครั้งละ 1 เม็ด เมื่อปวด นาน 3 วัน", defaultIndication: "บรรเทาอาการปวดรุนแรง" },
  { id: 11, code: "MED-011", genericName: "Enrofloxacin 50mg",      tradeName: "เอนโรฟลอกซาซิน 50mg",     keywords: ["antibiotic","enro","ทางเดินปัสสาวะ"], unit: "เม็ด",   pricePerUnit: 30,  stock: 180, form: "เม็ด",     defaultInstruction: "กินวันละ 1 ครั้ง ครั้งละ 1 เม็ด นาน 7 วัน",        defaultIndication: "ติดเชื้อทางเดินปัสสาวะ" },
  { id: 12, code: "MED-012", genericName: "Metoclopramide 10mg",    tradeName: "เมโทโคลพราไมด์ 10mg",      keywords: ["แก้อาเจียน","antiemetic","vomit"],    unit: "เม็ด",   pricePerUnit: 8,   stock: 220, form: "เม็ด",     defaultInstruction: "กินวันละ 3 ครั้ง ครั้งละ 0.5 เม็ด ก่อนอาหาร นาน 3 วัน", defaultIndication: "แก้คลื่นไส้ อาเจียน" },
  { id: 13, code: "MED-013", genericName: "Glucosamine 500mg",      tradeName: "กลูโคซามีน 500mg",         keywords: ["ข้อ","joint","arthritis","กระดูก"],    unit: "เม็ด",   pricePerUnit: 20,  stock: 90,  form: "เม็ด",     defaultInstruction: "กินวันละ 1 ครั้ง ครั้งละ 1 เม็ด ต่อเนื่อง",         defaultIndication: "บำรุงข้อต่อ / ข้อเสื่อม" },
  { id: 14, code: "MED-014", genericName: "Furosemide 40mg",        tradeName: "ฟูโรเซไมด์ 40mg",          keywords: ["ขับปัสสาวะ","diuretic","บวม"],         unit: "เม็ด",   pricePerUnit: 10,  stock: 160, form: "เม็ด",     defaultInstruction: "กินวันละ 1-2 ครั้ง ครั้งละ 0.5 เม็ด",              defaultIndication: "ขับน้ำ / หัวใจวาย" },
  { id: 15, code: "MED-015", genericName: "Diphenhydramine 25mg",   tradeName: "ไดเฟนไฮดรามีน 25mg",       keywords: ["แพ้","allergy","sedation","สงบ"],      unit: "แคปซูล", pricePerUnit: 8,   stock: 250, form: "แคปซูล",   defaultInstruction: "กินวันละ 2-3 ครั้ง ครั้งละ 1 แคปซูล",              defaultIndication: "แพ้ / ยาสงบ" },
  { id: 16, code: "MED-016", genericName: "Simethicone 80mg",       tradeName: "ซิเมทิโคน 80mg",           keywords: ["ท้องอืด","gas","bloat"],              unit: "เม็ด",   pricePerUnit: 6,   stock: 300, form: "เม็ด",     defaultInstruction: "กินวันละ 3 ครั้ง ครั้งละ 1 เม็ด หลังอาหาร",        defaultIndication: "ท้องอืด / แก๊สในกระเพาะ" },
];

export interface DrugOrderItem {
  drug: DrugCatalogItem;
  perDay: number;   // จำนวนที่ใช้ต่อวัน
  days: number;     // จำนวนวันที่จ่าย
  qty: number;      // จำนวนรวม (= perDay × days)
  pricePerUnit: number;
  discount: number;
  instruction: string;
  indication: string;
  note: string;
  dispensingLocation: string;
  doctor: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (items: DrugOrderItem[]) => void;
}

/** ดึงจำนวนวันจากข้อความวิธีใช้ เช่น "…นาน 7 วัน" → 7 (ไม่พบ = 1) */
function parseDays(instruction: string): number {
  const m = instruction.match(/(\d+)\s*วัน/);
  const n = m ? parseInt(m[1], 10) : 1;
  return n > 0 ? n : 1;
}

export function AddDrugModal({ open, onClose, onAdd }: Props) {
  const { user } = useAuth();
  const defaultDoctor = user?.displayName ?? "สพ.ว. สมชาย";

  const [search, setSearch] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<DrugCatalogItem | null>(null);

  // form — จำนวน/วัน × จำนวนวัน = qty รวม (HOSxP)
  const [perDay, setPerDay] = useState(1);
  const [days, setDays] = useState(1);
  const qty = Math.round(perDay * days * 100) / 100;
  const [discount, setDiscount] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [indication, setIndication] = useState("");
  const [note, setNote] = useState("");
  const [dispensingLocation, setDispensingLocation] = useState("ห้องยา");
  const [doctor, setDoctor] = useState(defaultDoctor);
  const [doctorOpen, setDoctorOpen] = useState(false);

  const [cart, setCart] = useState<DrugOrderItem[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const doctorRef = useRef<HTMLDivElement>(null);

  const doctorList = ["สพ.ญ. อรพิน", "สพ.ว. สมชาย", "น.ส. สุภาพร"];

  useEffect(() => {
    if (open) {
      setSearch(""); setSelectedDrug(null);
      setPerDay(1); setDays(1); setDiscount(0); setInstruction(""); setIndication(""); setNote("");
      setDispensingLocation("ห้องยา"); setDoctor(defaultDoctor); setCart([]);
      setTimeout(() => searchRef.current?.focus(), 200);
    }
  }, [open, defaultDoctor]);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (doctorRef.current && !doctorRef.current.contains(e.target as Node)) setDoctorOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drugCatalog;
    return drugCatalog.filter(d =>
      d.genericName.toLowerCase().includes(q) ||
      d.tradeName.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [search]);

  const lineTotal = selectedDrug ? qty * selectedDrug.pricePerUnit - discount : 0;

  const handleSelect = (d: DrugCatalogItem) => {
    setSelectedDrug(d);
    setPerDay(1); setDays(parseDays(d.defaultInstruction)); setDiscount(0);
    setInstruction(d.defaultInstruction);
    setIndication(d.defaultIndication);
    setNote("");
  };

  const handleAddToCart = () => {
    if (!selectedDrug) return;
    setCart(prev => [...prev, {
      drug: selectedDrug, perDay, days, qty, pricePerUnit: selectedDrug.pricePerUnit, discount,
      instruction, indication, note, dispensingLocation, doctor,
    }]);
    setSelectedDrug(null); setPerDay(1); setDays(1); setDiscount(0);
    setInstruction(""); setIndication(""); setNote(""); setSearch("");
  };

  const removeFromCart = (idx: number) => setCart(prev => prev.filter((_, i) => i !== idx));

  const handleConfirm = () => {
    let finalCart = [...cart];
    if (selectedDrug) {
      finalCart.push({ drug: selectedDrug, perDay, days, qty, pricePerUnit: selectedDrug.pricePerUnit, discount, instruction, indication, note, dispensingLocation, doctor });
    }
    if (finalCart.length === 0) return;
    onAdd(finalCart);
    onClose();
  };

  const cartTotal = cart.reduce((s, i) => s + (i.qty * i.pricePerUnit - i.discount), 0);
  const currentLine = selectedDrug ? Math.max(0, lineTotal) : 0;
  const grandTotal = cartTotal + currentLine;

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={onClose} />

          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[840px] vet-modal relative"
              style={{ height: "min(92vh, calc(100vh - 2rem))" }}
              onClick={e => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <Pill className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">เพิ่มรายการยา</h2>
                      <p className="vet-tiny mt-[2px]">ค้นหาและสั่งยาสำหรับใบสั่งยา</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="flex-1 min-h-0 p-5 flex flex-col gap-4">

                {/* Search */}
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="ค้นหายา (ชื่อสามัญ / ชื่อการค้า / Keyword)..."
                    className="vet-search" />
                </div>

                {/* Result + Form */}
                <div className="flex gap-4 flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
                  {/* Left: drug list */}
                  <div className="flex-1 min-w-0 flex flex-col min-h-0">
                    <p className="text-[10px] text-gray-400 mb-2" style={{ fontWeight: 500 }}>
                      {search.trim() ? `ผลลัพธ์ ${filtered.length} รายการ` : `ยาทั้งหมด ${filtered.length} รายการ`}
                    </p>
                    <div className="space-y-1 flex-1 overflow-y-auto pr-1">
                      {filtered.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Search className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                          <p className="text-sm">ไม่พบรายการยาที่ค้นหา</p>
                        </div>
                      ) : filtered.map(drug => {
                        const isActive = selectedDrug?.id === drug.id;
                        return (
                          <button key={drug.id} onClick={() => handleSelect(drug)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                              isActive ? "border-(--brand) bg-(--brand)/5 shadow-sm"
                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                            }`}>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Pill className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>{drug.genericName}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-400 truncate">{drug.tradeName}</span>
                                <span className="text-[10px] text-gray-300">|</span>
                                <span className="text-[10px] text-gray-400">{drug.form}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm text-(--brand)" style={{ fontWeight: 600 }}>฿{drug.pricePerUnit}</div>
                              <div className="text-[10px] text-gray-400">/{drug.unit}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: order form */}
                  <div className="md:w-[340px] flex-shrink-0">
                    {selectedDrug ? (
                      <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-2xl border border-(--brand)/15 bg-gradient-to-br from-[#f0f7f1]/80 to-white flex flex-col h-full">
                        {/* Drug header - prominent card */}
                        <div className="px-4 py-3 bg-gradient-to-r from-(--brand)/[0.06] to-transparent border-b border-(--brand)/10">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                              style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 20%, transparent)" }}>
                              <Pill className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{selectedDrug.genericName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600" style={{ fontWeight: 500 }}>{selectedDrug.code}</span>
                                <span className="text-[10px] text-gray-400 truncate">{selectedDrug.tradeName} · {selectedDrug.form}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Form content */}
                        <div className="flex-1 flex flex-col p-3.5 gap-2.5 min-h-0 overflow-y-auto">

                          {/* ── จำนวน & ราคา ── */}
                          <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/80 p-3.5 flex-shrink-0"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 0 0 1px rgba(73,138,79,0.04)" }}>
                            {/* Section label */}
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e0f0e3, #c8e6cc)" }}>
                                <Package className="w-3 h-3 text-(--brand)" />
                              </div>
                              <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>จำนวนและราคา</span>
                              <div className="flex-1" />
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-0.5" style={{ fontWeight: 500 }}>
                                <Package className="w-2.5 h-2.5" />คงเหลือ {selectedDrug.stock} {selectedDrug.unit}
                              </span>
                            </div>

                            <div className="flex items-end gap-2.5">
                              {/* จำนวน/วัน */}
                              <div className="w-[92px]">
                                <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>จำนวน/วัน</label>
                                <div className="flex items-center gap-0.5 bg-white rounded-xl border border-gray-100 p-1" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }}>
                                  <button onClick={() => setPerDay(q => Math.max(0.5, Math.round((q - 0.5) * 10) / 10))}
                                    className="w-6 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-(--brand) hover:bg-(--brand)/8 transition-all active:scale-90">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input type="number" value={perDay} onChange={e => setPerDay(Math.max(0, parseFloat(e.target.value) || 0))} min={0} step={0.5}
                                    className="w-8 text-center text-sm bg-transparent py-0.5 focus:outline-none text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    style={{ fontWeight: 700 }} />
                                  <button onClick={() => setPerDay(q => Math.round((q + 0.5) * 10) / 10)}
                                    className="w-6 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-(--brand) hover:bg-(--brand)/8 transition-all active:scale-90">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {/* จำนวนวัน */}
                              <div className="w-[84px]">
                                <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>จำนวนวัน</label>
                                <div className="flex items-center gap-0.5 bg-white rounded-xl border border-gray-100 p-1" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }}>
                                  <button onClick={() => setDays(d => Math.max(1, d - 1))}
                                    className="w-6 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-(--brand) hover:bg-(--brand)/8 transition-all active:scale-90">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input type="number" value={days} onChange={e => setDays(Math.max(1, parseInt(e.target.value) || 1))} min={1}
                                    className="w-7 text-center text-sm bg-transparent py-0.5 focus:outline-none text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    style={{ fontWeight: 700 }} />
                                  <button onClick={() => setDays(d => d + 1)}
                                    className="w-6 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-(--brand) hover:bg-(--brand)/8 transition-all active:scale-90">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {/* ส่วนลด */}
                              <div className="w-[64px]">
                                <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ส่วนลด</label>
                                <input type="number" value={discount || ""} onChange={e => setDiscount(Math.max(0, parseInt(e.target.value) || 0))} min={0} placeholder="0"
                                  className="w-full px-2 py-[7px] text-sm text-center bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand)/40 placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }} />
                              </div>
                            </div>
                            {/* สรุป: จำนวนรวม + ราคา */}
                            <div className="mt-2.5 flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06), color-mix(in srgb, var(--brand) 5%, transparent))", border: "1px solid color-mix(in srgb, var(--brand) 15%, transparent)" }}>
                              <span className="text-[11px] text-gray-600" style={{ fontWeight: 600 }}>
                                {perDay} × {days} วัน = <span className="text-(--brand-dark)" style={{ fontWeight: 800 }}>{qty} {selectedDrug.unit}</span>
                                <span className="text-gray-400"> · ฿{selectedDrug.pricePerUnit}/{selectedDrug.unit}</span>
                              </span>
                              <span className="text-[13px] text-(--brand-dark)" style={{ fontWeight: 800 }}>฿{Math.max(0, qty * selectedDrug.pricePerUnit - discount).toLocaleString()}</span>
                            </div>

                            {/* รับยาที่ */}
                            <div className="mt-2.5">
                              <label className="text-[10px] text-gray-400 mb-1 flex items-center gap-1" style={{ fontWeight: 500 }}>
                                <MapPin className="w-3 h-3" />รับยาที่
                              </label>
                              <div className="relative">
                                <select
                                  value={dispensingLocation}
                                  onChange={e => setDispensingLocation(e.target.value)}
                                  className="w-full px-3 py-[7px] text-sm bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand)/40 appearance-none pr-8 text-gray-700 cursor-pointer transition-all"
                                  style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)", fontWeight: 500 }}
                                >
                                  <option value="ห้องยา">ห้องยา</option>
                                  <option value="Substock2">Substock2</option>
                                  <option value="ทดสอบหน่วยจ่าย1">ทดสอบหน่วยจ่าย1</option>
                                  <option value="ทดสอบหน่วยจ่าย55">ทดสอบหน่วยจ่าย55</option>
                                  <option value="หน่วยจ่ายทดสอบ">หน่วยจ่ายทดสอบ</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* ยอดรวม */}
                            <div className="flex items-center justify-between mt-3 px-3.5 py-2 rounded-xl"
                              style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 20%, transparent)" }}>
                              <span className="text-[11px] text-white/80" style={{ fontWeight: 500 }}>ยอดเงินรวม</span>
                              <span className="text-white tracking-wide" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))" }}>฿{Math.max(0, lineTotal).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* ── คำแนะนำ — flex-1 fills remaining ── */}
                          <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/80 p-3.5 flex-shrink-0"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 0 0 1px rgba(73,138,79,0.04)" }}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>
                                <AlertTriangle className="w-3 h-3 text-blue-600" />
                              </div>
                              <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>คำแนะนำการใช้ยา</span>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div>
                                <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>วิธีใช้ยา</label>
                                <textarea value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="ระบุวิธีใช้ยา เช่น กินวันละ 2 ครั้ง..."
                                  rows={3}
                                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-(--brand)/15 focus:border-(--brand)/30 placeholder:text-gray-300 resize-none transition-all"
                                  style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }} />
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ข้อบ่งใช้</label>
                                  <input value={indication} onChange={e => setIndication(e.target.value)} placeholder="เช่น ติดเชื้อ..."
                                    className="w-full px-3 py-[6px] text-sm bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-(--brand)/15 focus:border-(--brand)/30 placeholder:text-gray-300 transition-all"
                                    style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }} />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>หมายเหตุ</label>
                                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="เพิ่มเติม..."
                                     className="w-full px-3 py-[6px] text-sm bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-(--brand)/15 focus:border-(--brand)/30 placeholder:text-gray-300 transition-all"
                                     style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── แพทย์ — compact ── */}
                          <div ref={doctorRef} className="relative flex-shrink-0">
                            <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/80 px-3.5 py-2.5"
                              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 0 0 1px rgba(73,138,79,0.04)" }}>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fde68a, #fbbf24)" }}>
                                  <User className="w-3 h-3 text-amber-700" />
                                </div>
                                <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>แพทย์ผู้สั่งยา</span>
                                <div className="flex-1" />
                                <button onClick={() => setDoctorOpen(o => !o)}
                                  className="flex items-center gap-1.5 px-3 py-1 text-sm bg-white rounded-lg border border-gray-100 hover:border-(--brand)/25 hover:shadow-sm transition-all text-left"
                                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                                  <span className="text-gray-700" style={{ fontWeight: 500 }}>{doctor}</span>
                                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${doctorOpen ? "rotate-180" : ""}`} />
                                </button>
                              </div>
                            </div>
                            <AnimatePresence>
                              {doctorOpen && (
                                <motion.div initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                  transition={{ duration: 0.15, ease: "easeOut" }}
                                  className="absolute z-20 right-0 top-full w-56 mt-1.5 bg-white/95 backdrop-blur-lg border border-gray-200/80 rounded-2xl overflow-hidden"
                                  style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" }}>
                                  <div className="p-1">
                                    {doctorList.map(d => (
                                      <button key={d} onClick={() => { setDoctor(d); setDoctorOpen(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-left transition-all ${
                                          doctor === d ? "bg-(--brand)/8 text-(--brand)" : "hover:bg-gray-50 text-gray-600"
                                        }`}>
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                          doctor === d ? "border-(--brand) bg-(--brand)" : "border-gray-300"
                                        }`}>
                                          {doctor === d && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <span style={{ fontWeight: doctor === d ? 600 : 400 }}>{d}</span>
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center py-14 px-4 text-center">
                        <Pill className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400" style={{ fontWeight: 500 }}>เลือกรายการยาจากด้านซ้าย</p>
                        <p className="text-[10px] text-gray-300 mt-1">เพื่อกรอกจำนวนและวิธีใช้ยา</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50/80 to-transparent border-b border-gray-100">
                      <div className="w-1 h-4 rounded-full bg-blue-400" />
                      <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>รายการยาที่เลือก ({cart.length})</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {cart.map((item, idx) => {
                        const total = item.qty * item.pricePerUnit - item.discount;
                        return (
                          <div key={idx} className="flex items-center gap-3 px-4 py-2.5 group">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Pill className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-700 truncate block" style={{ fontWeight: 500 }}>{item.drug.tradeName}</span>
                              <span className="text-[10px] text-gray-400">
                                <span className="text-blue-500" style={{ fontWeight: 600 }}>{item.perDay}/วัน × {item.days} วัน</span> = {item.qty} {item.drug.unit} × ฿{item.pricePerUnit}
                                {item.discount > 0 && <span className="text-red-400"> -฿{item.discount}</span>}
                                {item.instruction && <span className="ml-1.5 text-gray-300">| {item.instruction.substring(0, 24)}...</span>}
                              </span>
                            </div>
                            <span className="text-sm text-(--brand) flex-shrink-0" style={{ fontWeight: 600 }}>฿{Math.max(0, total).toLocaleString()}</span>
                            <button onClick={() => removeFromCart(idx)}
                              className="p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="vet-modal-footer flex-wrap">
                <div className="flex items-center gap-4">
                  {(cart.length > 0 || selectedDrug) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">รวมค่ายา</span>
                      <span className="text-(--brand)" style={{ fontWeight: 700 }}>฿{grandTotal.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-300">({cart.length + (selectedDrug ? 1 : 0)} รายการ)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={onClose} className="vet-btn vet-btn-secondary">
                    ยกเลิก
                  </button>
                  <button onClick={handleConfirm}
                    disabled={cart.length === 0 && !selectedDrug}
                    className="vet-btn vet-btn-primary">
                    <Check className="w-[16px] h-[16px]" />
                    บันทึกรายการยา
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}