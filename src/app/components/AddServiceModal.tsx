import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Search, Plus, Minus, Check, ChevronDown,
  Pill, Stethoscope, Scissors, Syringe, Heart,
  Sparkles, Receipt, MessageSquare, User, Package,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/* ── Drug / Service database ── */
export interface CatalogItem {
  id: number;
  code: string;
  genericName: string;     // ชื่อสามัญ
  tradeName: string;       // ชื่อการค้า
  keywords: string[];      // คำค้นหาเพิ่มเติม
  category: "ยา" | "วัคซีน" | "บริการ" | "Lab" | "ผ่าตัด" | "อุปกรณ์";
  unit: string;
  pricePerUnit: number;
  stock?: number;
}

const catalog: CatalogItem[] = [
  { id: 1,  code: "MED-001", genericName: "Amoxicillin 250mg",       tradeName: "อะม็อกซิซิลลิน",       keywords: ["ยาฆ่าเชื้อ","antibiotic","amox"],   category: "ยา",     unit: "แผง",  pricePerUnit: 120, stock: 85  },
  { id: 2,  code: "MED-002", genericName: "Prednisolone 5mg",        tradeName: "เพรดนิโซโลน",          keywords: ["สเตียรอยด์","steroid","pred"],       category: "ยา",     unit: "แผง",  pricePerUnit: 80,  stock: 120 },
  { id: 3,  code: "MED-003", genericName: "Metronidazole 200mg",     tradeName: "เมโทรนิดาโซล",         keywords: ["ท้องเสีย","diarrhea","flagyl"],      category: "ยา",     unit: "แผง",  pricePerUnit: 95,  stock: 60  },
  { id: 4,  code: "MED-004", genericName: "Doxycycline 100mg",       tradeName: "ด็อกซี่ไซคลิน",        keywords: ["antibiotic","doxy","เห็บ"],          category: "ยา",     unit: "แผง",  pricePerUnit: 150, stock: 45  },
  { id: 5,  code: "MED-005", genericName: "Meloxicam 7.5mg",         tradeName: "เมล็อกซิแคม",          keywords: ["แก้ปวด","nsaid","pain"],             category: "ยา",     unit: "เม็ด", pricePerUnit: 25,  stock: 200 },
  { id: 6,  code: "MED-006", genericName: "Omeprazole 20mg",         tradeName: "โอเมพราโซล",           keywords: ["กระเพาะ","gastric","ppi"],           category: "ยา",     unit: "แคปซูล", pricePerUnit: 18, stock: 150 },
  { id: 7,  code: "MED-007", genericName: "Ivermectin 1%",           tradeName: "ไอเวอร์เม็คติน",       keywords: ["พยาธิ","dewormer","parasite"],        category: "ยา",     unit: "ml",   pricePerUnit: 35,  stock: 30  },
  { id: 8,  code: "MED-008", genericName: "Cephalexin 500mg",        tradeName: "เซฟาเล็กซิน",          keywords: ["antibiotic","cepha","ผิวหนัง"],       category: "ยา",     unit: "แคปซูล", pricePerUnit: 12, stock: 300 },
  { id: 9,  code: "MED-009", genericName: "Chlorpheniramine 4mg",    tradeName: "คลอร์เฟนิรามีน",       keywords: ["แพ้","allergy","antihistamine"],      category: "ยา",     unit: "เม็ด", pricePerUnit: 5,   stock: 500 },
  { id: 10, code: "MED-010", genericName: "Tramadol 50mg",           tradeName: "ทรามาดอล",             keywords: ["แก้ปวด","opioid","pain"],             category: "ยา",     unit: "เม็ด", pricePerUnit: 15,  stock: 100 },
  { id: 11, code: "VAC-001", genericName: "Rabies Vaccine",          tradeName: "วัคซีนพิษสุนัขบ้า",    keywords: ["rabies","พิษสุนัขบ้า"],               category: "วัคซีน", unit: "โดส",  pricePerUnit: 350, stock: 40  },
  { id: 12, code: "VAC-002", genericName: "DHPP Vaccine",            tradeName: "วัคซีนรวม 5 โรค",      keywords: ["dhpp","distemper","parvo"],            category: "วัคซีน", unit: "โดส",  pricePerUnit: 450, stock: 35  },
  { id: 13, code: "VAC-003", genericName: "FVRCP Vaccine",           tradeName: "วัคซีนรวมแมว",         keywords: ["fvrcp","แมว","cat"],                  category: "วัคซีน", unit: "โดส",  pricePerUnit: 400, stock: 25  },
  { id: 14, code: "SVC-001", genericName: "ค่าตรวจรักษาทั่วไป",      tradeName: "OPD Examination",      keywords: ["ตรวจ","exam","opd"],                  category: "บริการ", unit: "ครั้ง", pricePerUnit: 300  },
  { id: 15, code: "SVC-002", genericName: "ทำแผล",                   tradeName: "Wound Dressing",       keywords: ["แผล","wound","dressing"],             category: "บริการ", unit: "ครั้ง", pricePerUnit: 200  },
  { id: 16, code: "SVC-003", genericName: "ให้น้ำเกลือ IV",          tradeName: "IV Fluid Therapy",     keywords: ["น้ำเกลือ","iv","fluid"],              category: "บริการ", unit: "ถุง",  pricePerUnit: 250  },
  { id: 17, code: "SVC-004", genericName: "ค่าสวนปัสสาวะ",           tradeName: "Urinary Catheter",     keywords: ["สวน","catheter","ปัสสาวะ"],           category: "บริการ", unit: "ครั้ง", pricePerUnit: 500  },
  { id: 18, code: "LAB-001", genericName: "ตรวจเลือด CBC",           tradeName: "CBC Blood Test",       keywords: ["เลือด","cbc","blood"],                category: "Lab",    unit: "ชุด",  pricePerUnit: 450  },
  { id: 19, code: "LAB-002", genericName: "ตรวจเคมีเลือด",           tradeName: "Blood Chemistry",      keywords: ["เคมี","chemistry","liver","kidney"],  category: "Lab",    unit: "ชุด",  pricePerUnit: 800  },
  { id: 20, code: "LAB-003", genericName: "ตรวจปัสสาวะ",             tradeName: "Urinalysis",           keywords: ["ปัสสาวะ","urine","ua"],               category: "Lab",    unit: "ชุด",  pricePerUnit: 300  },
  { id: 21, code: "SUR-001", genericName: "ทำหมันสุนัขตัวผู้",        tradeName: "Castration (Dog)",     keywords: ["ทำหมัน","castrate","neuter"],          category: "ผ่าตัด", unit: "ครั้ง", pricePerUnit: 2500 },
  { id: 22, code: "SUR-002", genericName: "ทำหมันแมวตัวเมีย",        tradeName: "Spay (Cat)",           keywords: ["ทำหมัน","spay","แมว"],                category: "ผ่าตัด", unit: "ครั้ง", pricePerUnit: 3000 },
  { id: 23, code: "EQP-001", genericName: "ปลอกคอกันเลีย",           tradeName: "E-Collar",             keywords: ["cone","collar","ปลอกคอ"],             category: "อุปกรณ์", unit: "ชิ้น", pricePerUnit: 180, stock: 20  },
];

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "ยา":      { icon: Pill,        color: "text-blue-600",   bg: "bg-blue-50"   },
  "วัคซีน":  { icon: Syringe,     color: "text-amber-600",  bg: "bg-amber-50"  },
  "บริการ":  { icon: Stethoscope,  color: "text-teal-600",   bg: "bg-teal-50"   },
  "Lab":     { icon: Sparkles,    color: "text-purple-600", bg: "bg-purple-50" },
  "ผ่าตัด":  { icon: Scissors,    color: "text-rose-600",   bg: "bg-rose-50"   },
  "อุปกรณ์": { icon: Heart,       color: "text-indigo-600", bg: "bg-indigo-50" },
};

const categories = ["ทั้งหมด", "ยา", "วัคซีน", "บริการ", "Lab", "ผ่าตัด", "อุปกรณ์"] as const;

export interface OrderLineItem {
  catalogItem: CatalogItem;
  qty: number;
  pricePerUnit: number;
  discount: number;
  note: string;
  doctor: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (items: OrderLineItem[]) => void;
}

export function AddServiceModal({ open, onClose, onAdd }: Props) {
  const { user } = useAuth();
  const defaultDoctor = user?.displayName ?? "สพ.ว. สมชาย";

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("ทั้งหมด");
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  // order form
  const [qty, setQty] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [doctor, setDoctor] = useState(defaultDoctor);
  const [doctorOpen, setDoctorOpen] = useState(false);

  // cart
  const [cart, setCart] = useState<OrderLineItem[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const doctorRef = useRef<HTMLDivElement>(null);

  const doctorList = ["สพ.ญ. อรพิน", "สพ.ว. สมชาย", "น.ส. สุภาพร"];

  useEffect(() => {
    if (open) {
      setSearch("");
      setCatFilter("ทั้งหมด");
      setSelectedItem(null);
      setQty(1);
      setDiscount(0);
      setNote("");
      setDoctor(defaultDoctor);
      setCart([]);
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
    return catalog.filter(item => {
      if (catFilter !== "ทั้งหมด" && item.category !== catFilter) return false;
      if (!q) return true;
      return (
        item.genericName.toLowerCase().includes(q) ||
        item.tradeName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }, [search, catFilter]);

  const lineTotal = selectedItem ? qty * selectedItem.pricePerUnit - discount : 0;

  const handleSelectItem = (item: CatalogItem) => {
    setSelectedItem(item);
    setQty(1);
    setDiscount(0);
    setNote("");
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    setCart(prev => [
      ...prev,
      { catalogItem: selectedItem, qty, pricePerUnit: selectedItem.pricePerUnit, discount, note, doctor },
    ]);
    setSelectedItem(null);
    setQty(1);
    setDiscount(0);
    setNote("");
    setSearch("");
  };

  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    // if there's a selected item not yet added, add it
    let finalCart = [...cart];
    if (selectedItem) {
      finalCart.push({ catalogItem: selectedItem, qty, pricePerUnit: selectedItem.pricePerUnit, discount, note, doctor });
    }
    if (finalCart.length === 0) return;
    onAdd(finalCart);
    onClose();
  };

  const cartTotal = cart.reduce((s, i) => s + (i.qty * i.pricePerUnit - i.discount), 0);
  const currentLineTotal = selectedItem ? Math.max(0, lineTotal) : 0;
  const grandTotal = cartTotal + currentLineTotal;

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
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
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <Receipt className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">เพิ่มรายการค่าบริการ</h2>
                      <p className="vet-tiny mt-[2px]">ค้นหาและเลือกรายการยา วัคซีน หรือบริการ</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="flex-1 min-h-0 p-5 flex flex-col gap-4">

                {/* Search + Category Filter */}
                <div className="space-y-3 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="ค้นหายา วัคซีน บริการ (ชื่อสามัญ / ชื่อการค้า / Keyword)..."
                      className="vet-search"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCatFilter(cat)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          catFilter === cat
                            ? "bg-(--brand) text-white border-(--brand)"
                            : "bg-white text-gray-500 border-gray-200 hover:border-(--brand)/40 hover:bg-(--brand)/5"
                        }`}
                        style={{ fontWeight: catFilter === cat ? 600 : 400 }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result + Form */}
                <div className="flex gap-4 flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
                  {/* Left: search results */}
                  <div className="flex-1 min-w-0 flex flex-col min-h-0">
                    <p className="text-[10px] text-gray-400 mb-2" style={{ fontWeight: 500 }}>
                      {search.trim() ? `ผลลัพธ์ ${filtered.length} รายการ` : `รายการทั้งหมด ${filtered.length} รายการ`}
                    </p>
                    <div className="space-y-1 flex-1 overflow-y-auto pr-1">
                      {filtered.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Search className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                          <p className="text-sm">ไม่พบรายการที่ค้นหา</p>
                          <p className="text-[10px] mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
                        </div>
                      ) : (
                        filtered.map(item => {
                          const cfg = categoryConfig[item.category] ?? categoryConfig["ยา"];
                          const Icon = cfg.icon;
                          const isActive = selectedItem?.id === item.id;
                          const inCart = cart.some(c => c.catalogItem.id === item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectItem(item)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all group ${
                                isActive
                                  ? "border-(--brand) bg-(--brand)/5 shadow-sm"
                                  : inCart
                                  ? "border-amber-200 bg-amber-50/50"
                                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>{item.tradeName}</span>
                                  {inCart && <span className="text-[9px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ fontWeight: 600 }}>ในตะกร้า</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-gray-400 truncate">{item.genericName}</span>
                                  <span className="text-[10px] text-gray-300">|</span>
                                  <span className="text-[10px] text-gray-400">{item.code}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-sm text-(--brand)" style={{ fontWeight: 600 }}>฿{item.pricePerUnit.toLocaleString()}</div>
                                <div className="text-[10px] text-gray-400">/{item.unit}</div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right: order form */}
                  <div className="md:w-[340px] flex-shrink-0">
                    {selectedItem ? (
                      <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-2xl border border-(--brand)/15 bg-gradient-to-br from-[#f0f7f1]/80 to-white flex flex-col h-full"
                      >
                        {/* Item header — prominent card */}
                        <div className="px-4 py-3 bg-gradient-to-r from-(--brand)/[0.06] to-transparent border-b border-(--brand)/10">
                          <div className="flex items-center gap-2.5">
                            {(() => {
                              const cfg = categoryConfig[selectedItem.category] ?? categoryConfig["ยา"];
                              const Icon = cfg.icon;
                              return (
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                                  style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 20%, transparent)" }}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                              );
                            })()}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{selectedItem.tradeName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600" style={{ fontWeight: 500 }}>{selectedItem.code}</span>
                                <span className="text-[10px] text-gray-400 truncate">{selectedItem.genericName} · {selectedItem.category}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Form content — scrollable */}
                        <div className="flex-1 flex flex-col p-3.5 gap-2.5 min-h-0 overflow-y-auto">

                          {/* ── จำนวน & ราคา ── */}
                          <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/80 p-3.5 flex-shrink-0"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 0 0 1px rgba(73,138,79,0.04)" }}>
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e0f0e3, #c8e6cc)" }}>
                                <Package className="w-3 h-3 text-(--brand)" />
                              </div>
                              <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>จำนวนและราคา</span>
                              <div className="flex-1" />
                              {selectedItem.stock !== undefined && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-0.5" style={{ fontWeight: 500 }}>
                                  <Package className="w-2.5 h-2.5" />คงเหลือ {selectedItem.stock} {selectedItem.unit}
                                </span>
                              )}
                            </div>

                            <div className="flex items-end gap-3">
                              {/* จำนวน */}
                              <div className="flex-1">
                                <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>จำนวน ({selectedItem.unit})</label>
                                <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }}>
                                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-(--brand) hover:bg-(--brand)/8 transition-all active:scale-90">
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} min={1}
                                    className="w-10 text-center text-sm bg-transparent py-0.5 focus:outline-none text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    style={{ fontWeight: 700 }} />
                                  <button onClick={() => setQty(q => q + 1)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-(--brand) hover:bg-(--brand)/8 transition-all active:scale-90">
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              {/* ราคา */}
                              <div className="w-[80px]">
                                <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ราคา/{selectedItem.unit}</label>
                                <div className="px-2.5 py-[7px] text-sm bg-white rounded-xl border border-gray-100 text-gray-700 text-center" style={{ fontWeight: 600, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }}>
                                  ฿{selectedItem.pricePerUnit.toLocaleString()}
                                </div>
                              </div>
                              {/* ส่วนลด */}
                              <div className="w-[72px]">
                                <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>ส่วนลด (฿)</label>
                                <input type="number" value={discount || ""} onChange={e => setDiscount(Math.max(0, parseInt(e.target.value) || 0))} min={0} placeholder="0"
                                  className="w-full px-2.5 py-[7px] text-sm text-center bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand)/40 placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }} />
                              </div>
                            </div>

                            {/* ยอดรวม */}
                            <div className="flex items-center justify-between mt-3 px-3.5 py-2 rounded-xl"
                              style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 20%, transparent)" }}>
                              <span className="text-[11px] text-white/80" style={{ fontWeight: 500 }}>ยอดเงินรวม</span>
                              <span className="text-white tracking-wide" style={{ fontWeight: 700, fontSize: "calc(15px * var(--fs))" }}>฿{Math.max(0, lineTotal).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* ── หมายเหตุ ── */}
                          <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/80 p-3.5 flex-shrink-0"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 0 0 1px rgba(73,138,79,0.04)" }}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>
                                <MessageSquare className="w-3 h-3 text-blue-600" />
                              </div>
                              <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>ข้อมูลเพิ่มเติม</span>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 500 }}>หมายเหตุ</label>
                              <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                rows={2}
                                placeholder="ระบุหมายเหตุเพิ่มเติม..."
                                className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-(--brand)/15 focus:border-(--brand)/30 placeholder:text-gray-300 resize-none transition-all"
                                style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }}
                              />
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
                                <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>แพทย์ผู้รักษา</span>
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

                        {/* Add to cart — removed */}

                      </motion.div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center py-14 px-4 text-center">
                        <Receipt className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400" style={{ fontWeight: 500 }}>เลือกรายการจากด้านซ้าย</p>
                        <p className="text-[10px] text-gray-300 mt-1">เพื่อกรอกจำนวนและรายละเอียด</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-white overflow-hidden flex-shrink-0">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50/80 to-transparent border-b border-gray-100">
                      <div className="w-1 h-4 rounded-full bg-amber-400" />
                      <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>รายการที่เลือก ({cart.length})</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {cart.map((item, idx) => {
                        const total = item.qty * item.pricePerUnit - item.discount;
                        const cfg = categoryConfig[item.catalogItem.category] ?? categoryConfig["ยา"];
                        const Icon = cfg.icon;
                        return (
                          <div key={idx} className="flex items-center gap-3 px-4 py-2.5 group">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-700 truncate block" style={{ fontWeight: 500 }}>{item.catalogItem.tradeName}</span>
                              <span className="text-[10px] text-gray-400">
                                {item.qty} {item.catalogItem.unit} × ฿{item.pricePerUnit}
                                {item.discount > 0 && <span className="text-red-400"> -฿{item.discount}</span>}
                                {item.note && <span className="ml-2 text-gray-300">| {item.note}</span>}
                              </span>
                            </div>
                            <span className="text-sm text-(--brand) flex-shrink-0" style={{ fontWeight: 600 }}>฿{Math.max(0, total).toLocaleString()}</span>
                            <button
                              onClick={() => removeFromCart(idx)}
                              className="p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            >
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
                  {(cart.length > 0 || selectedItem) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">ยอดรวม</span>
                      <span className="text-(--brand)" style={{ fontWeight: 700 }}>
                        ฿{grandTotal.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-300">({cart.length + (selectedItem ? 1 : 0)} รายการ)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={onClose} className="vet-btn vet-btn-secondary">
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={cart.length === 0 && !selectedItem}
                    className="vet-btn vet-btn-primary"
                  >
                    <Check className="w-[16px] h-[16px]" /> บันทึกรายการ
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