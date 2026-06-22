import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Package, Download, AlertTriangle,
  Edit2, Trash2, Pencil, X, ChevronLeft, ChevronRight,
  ArrowDownToLine, History, RefreshCw, FileDown,
  ShoppingBag, TrendingUp, TrendingDown, MoreHorizontal,
  Warehouse, Bell, ClipboardList, Upload, Camera,
  ClipboardCheck, Truck, Check, Clock, Ban, BarChart2, Receipt,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useSnackbar } from "../contexts/SnackbarContext";
import { StockMovementModal, type EditingMovement } from "../components/StockMovementModal";
import { useClinicData } from "../contexts/ClinicDataContext";
import { useLang } from "../contexts/LanguageContext";
import { useConfirm } from "../contexts/ConfirmContext";

// ─── Types ───────────────────────────────────────────────────────────
interface StockProduct {
  id: number;
  code: string;
  name: string;
  barcode: string;
  category: string;
  categoryEmoji: string;
  type: "stock" | "nostock";
  sellPrice: number;
  costPrice: number;
  unit: string;
  stock: number;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  image: string;
  note: string;
  active: boolean;
}

// ─── PO Types ────────────────────────────────────────────────────────
interface POItem {
  productId: number;
  productName: string;
  unit: string;
  qty: number;
  costPerUnit: number;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  deliveryMethod: string;
  items: POItem[];
  note: string;
  status: "draft" | "sent" | "waiting" | "received" | "cancelled";
}

interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: "in" | "out" | "adjust";
  qty: number;
  costPerUnit: number;
  date: string;
  ref: string;
  supplier: string;
  lot: string;
  note: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────
// หมายเหตุ: INIT_PRODUCTS ถูกย้ายไปใน ClinicDataContext (INIT_STOCK_PRODUCTS) แล้ว
//           Stock() component ดึงข้อมูลจาก useClinicData().stockProducts โดยตรง

const INIT_MOVEMENTS: StockMovement[] = [
  { id:1, productId:2, productName:"Royal Canin Adult 3kg",  type:"in",     qty:24, costPerUnit:620, date:"12 มี.ค. 10:30", ref:"PO-2025-0033", supplier:"Royal Canin TH", lot:"LOT-250312", note:"" },
  { id:2, productId:2, productName:"Royal Canin Adult 3kg",  type:"out",    qty:1,  costPerUnit:620, date:"12 มี.ค. 16:22", ref:"INV-O089",     supplier:"",              lot:"",          note:"ขาย POS" },
  { id:3, productId:1, productName:"ขนม Milk-Bone",          type:"adjust", qty:-2, costPerUnit:28,  date:"12 มี.ค. 09:00", ref:"ADJ-001",      supplier:"",              lot:"",          note:"ปรับยอด" },
  { id:4, productId:2, productName:"Royal Canin Adult 3kg",  type:"out",    qty:3,  costPerUnit:620, date:"12 มี.ค. 16:00", ref:"INV-O088",     supplier:"",              lot:"",          note:"ขาย POS" },
  { id:5, productId:9, productName:"แอมม็อกซิซิลลิน 250mg", type:"in",     qty:20, costPerUnit:85,  date:"11 มี.ค. 14:00", ref:"PO-2025-0031", supplier:"VetMed",        lot:"LOT-250311", note:"" },
];

const INIT_POS: PurchaseOrder[] = [
  {
    id: 1, poNumber: "PO-2025-0023", supplier: "Royal Canin TH",
    orderDate: "10 ธ.ค. 2566", expectedDate: "14 ธ.ค. 2566",
    deliveryMethod: "ขนส่งทั่วไป", status: "received", note: "",
    items: [
      { productId: 2, productName: "Royal Canin Adult 3kg", unit: "ถุง",  qty: 24, costPerUnit: 620 },
      { productId: 3, productName: "แปรงขน Furminator",     unit: "ชิ้น", qty: 6,  costPerUnit: 210 },
    ],
  },
  {
    id: 2, poNumber: "PO-2025-0024", supplier: "MedPet TH",
    orderDate: "12 ธ.ค. 2566", expectedDate: "16 ธ.ค. 2566",
    deliveryMethod: "ขนส่งทั่วไป", status: "waiting", note: "ขอใบกำกับภาษีด้วย",
    items: [
      { productId: 4, productName: "วิตามิน C 60 เม็ด", unit: "กล่อง", qty: 48, costPerUnit: 90 },
      { productId: 7, productName: "ชามอาหาร M",         unit: "ใบ",   qty: 5,  costPerUnit: 320 },
    ],
  },
  {
    id: 3, poNumber: "PO-2025-0025", supplier: "Pet Supply Co.",
    orderDate: "13 ธ.ค. 2566", expectedDate: "17 ธ.ค. 2566",
    deliveryMethod: "รับเอง", status: "sent", note: "",
    items: [
      { productId: 1, productName: "ขนม Milk-Bone", unit: "ชิ้น", qty: 100, costPerUnit: 28 },
    ],
  },
];

const SEVEN_DAY = [
  { day:"จ",  รับเข้า:12, จ่ายออก:5 },
  { day:"อ",  รับเข้า:0,  จ่ายออก:8 },
  { day:"พ",  รับเข้า:20, จ่ายออก:6 },
  { day:"พฤ", รับเข้า:5,  จ่ายออก:12 },
  { day:"ศ",  รับเข้า:0,  จ่ายออก:9 },
  { day:"ส",  รับเข้า:8,  จ่ายออก:4 },
  { day:"อา", รับเข้า:24, จ่ายออก:3 },
];

const CATS = ["ทั้งหมด","อาหาร/ขนม","Grooming","ของเล่น","ยา/วิตามิน","อุปกรณ์","บริการ"];
const UNITS = ["ชิ้น","แผง","กล่อง","กระปุก","ถุง","ขวด","ลูก","เส้น","ใบ","ครั้ง","เที่ยว","มล."];
const SUPPLIERS = ["Royal Canin TH","Mars Petcare","Pet Supply Co.","VetMed","Grooming Pro","FunPet","PetLeather Co","PetHome","MedPet TH","อื่นๆ"];
const DELIVERY_METHODS = ["ขนส่งทั่วไป","รับเอง","Kerry Express","Flash Express","ไปรษณีย์ไทย"];

const nextId = (arr: { id: number }[]) => Math.max(0, ...arr.map(x => x.id)) + 1;

// ─── Helpers ──────────────────────────────────────────────────────────
function stockStatus(p: StockProduct): "ok" | "low" | "out" | "nostock" {
  if (p.type === "nostock") return "nostock";
  if (p.stock === 0) return "out";
  if (p.stock < p.minStock) return "low";
  return "ok";
}

function StockStatusBadge({ product }: { product: StockProduct }) {
  const s = stockStatus(product);
  const cfg = {
    ok:      { label: "ปกติ",     cls: "bg-[#f0fdf4] text-[#16a34a]" },
    low:     { label: "ใกล้หมด",  cls: "bg-[#fff7ed] text-[#c2410c]" },
    out:     { label: "หมด",      cls: "bg-[#fef2f2] text-[#dc2626]" },
    nostock: { label: "บริการ",   cls: "bg-[#f5f3ff] text-[#7c3aed]" },
  }[s];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${cfg.cls}`} style={{ fontWeight: 600 }}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: "stock" | "nostock" }) {
  return type === "stock"
    ? <span className="text-[11px] bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>มี Stock</span>
    : <span className="text-[11px] bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>ไม่ใช้ Stock</span>;
}

function StockBar({ product }: { product: StockProduct }) {
  if (product.type === "nostock") return <span className="text-[12px] text-[#9ca3af]">ไม่ใช้ Stock</span>;
  const pct = product.maxStock > 0 ? Math.min(100, (product.stock / product.maxStock) * 100) : 0;
  const s = stockStatus(product);
  const barColor = s === "ok" ? "#19a589" : s === "low" ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="w-[68px] h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span className="text-[13px] min-w-[28px]" style={{ fontWeight: 700, color: barColor }}>{product.stock}</span>
    </div>
  );
}

const inputCls = "vet-input";
const labelCls = "vet-label";

// ─── Modal Wrapper ────────────────────────────────────────────────────
function Modal({ open, title, subtitle, icon, onClose, onSave, saveLabel = "บันทึก", canSave = true, children, maxWidth = "max-w-lg" }: {
  open: boolean; title: string; subtitle?: string; icon?: React.ReactNode;
  onClose: () => void; onSave: () => void; saveLabel?: string; canSave?: boolean;
  children: React.ReactNode; maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={`w-full ${maxWidth} vet-modal`}
              style={{ maxHeight: "calc(100vh - 2rem)" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {icon && <div className="vet-modal-header-icon">{icon}</div>}
                    <div>
                      <h2 className="vet-section-title">{title}</h2>
                      {subtitle && <p className="vet-tiny mt-[2px]">{subtitle}</p>}
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>
              {/* Body */}
              <div className="vet-modal-body space-y-4">{children}</div>
              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>ยกเลิก</button>
                <button onClick={onSave} disabled={!canSave} className="vet-btn vet-btn-primary btn-green" style={{ width: 110 }}>
                  <Check className="w-[16px] h-[16px]" />
                  {saveLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Add/Edit Product Modal ───────────────────────────────────────────
function ProductModal({ open, onClose, onSave, editing }: {
  open: boolean; onClose: () => void;
  onSave: (p: StockProduct) => void; editing: StockProduct | null;
}) {
  const emptyForm: StockProduct = {
    id: 0, code: "", name: "", barcode: "", category: "อาหาร/ขนม", categoryEmoji: "🍖",
    type: "stock", sellPrice: 0, costPrice: 0, unit: "ชิ้น", stock: 0,
    minStock: 5, maxStock: 100, location: "", supplier: "", image: "", note: "", active: true,
  };
  const [form, setForm] = useState<StockProduct>(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  useState(() => {
    if (open) setForm(editing ? { ...editing } : emptyForm);
  });

  // sync when open/editing changes
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setForm(editing ? { ...editing } : emptyForm);
  }

  const set = <K extends keyof StockProduct>(k: K, v: StockProduct[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("image", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const catEmojiMap: Record<string, string> = {
    "อาหาร/ขนม": "🍖", "Grooming": "✂️", "ของเล่น": "🎾",
    "ยา/วิตามิน": "💊", "อุปกรณ์": "🛠️", "บริการ": "🛎️",
  };

  return (
    <Modal
      open={open}
      title={editing ? `แก้ไขสินค้า — ${editing.name}` : "เพิ่มสินค้าใหม่"}
      subtitle="กำหนดประเภทและรายละเอียดสินค้า"
      icon={<Package className="w-[20px] h-[20px] text-white" />}
      onClose={onClose}
      onSave={() => onSave(form)}
      canSave={!!form.code && !!form.name}
    >
      {/* Stock type toggle */}
      <div>
        <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 600 }}>ประเภทสินค้า</p>
        <div className="grid grid-cols-2 gap-3">
          {([["stock","📦","มี Stock","นับจำนวน ตรวจสอบได้"],["nostock","∞","ไม่ใช้ Stock","บริการ / ค่าดำเนินการ"]] as const).map(([val,ic,lbl,sub]) => (
            <button
              key={val}
              onClick={() => set("type", val as "stock" | "nostock")}
              className={`rounded-2xl p-4 text-center border-2 transition-all ${form.type === val
                ? val === "stock"
                  ? "border-[#2563eb] bg-[#eff6ff]"
                  : "border-[#7c3aed] bg-[#f5f3ff]"
                : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <div className="text-2xl mb-1.5">{ic}</div>
              <p className="text-sm" style={{ fontWeight: 700, color: form.type === val ? (val === "stock" ? "#2563eb" : "#7c3aed") : "#374151" }}>{lbl}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Product info */}
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-wider text-gray-400" style={{ fontWeight: 700 }}>ข้อมูลสินค้า</p>
        <div>
          <label className={labelCls}>ชื่อสินค้า <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="เช่น Royal Canin Adult 3kg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>รหัสสินค้า (SKU) <span className="text-red-400">*</span></label>
            <input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="FOOD-001" />
          </div>
          <div>
            <label className={labelCls}>บาร์โค้ด</label>
            <input className={inputCls} value={form.barcode} onChange={e => set("barcode", e.target.value)} placeholder="8851234567890" />
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-wider text-gray-400" style={{ fontWeight: 700 }}>ราคาและหน่วยนับ</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>ราคาขาย <span className="text-red-400">*</span></label>
            <input type="number" className={inputCls} value={form.sellPrice} onChange={e => set("sellPrice", Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>ราคาทุน</label>
            <input type="number" className={inputCls} value={form.costPrice} onChange={e => set("costPrice", Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>หน่วย</label>
            <select className={inputCls} value={form.unit} onChange={e => set("unit", e.target.value)}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>หมวดหมู่</label>
          <select className={inputCls} value={form.category}
            onChange={e => { set("category", e.target.value); set("categoryEmoji", catEmojiMap[e.target.value] ?? "📦"); }}>
            {CATS.filter(c => c !== "ทั้งหมด").map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Stock settings — only if stock type */}
      {form.type === "stock" && (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-400" style={{ fontWeight: 700 }}>การจัดการ STOCK</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Stock ตั้งต้น</label>
              <input type="number" className={inputCls} value={form.stock} onChange={e => set("stock", Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>แจ้งเตือนต่ำสุด</label>
              <input type="number" className={inputCls} value={form.minStock} onChange={e => set("minStock", Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Stock สูงสุด</label>
              <input type="number" className={inputCls} value={form.maxStock} onChange={e => set("maxStock", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>ตำแหน่งจัดเก็บ</label>
            <input className={inputCls} value={form.location} onChange={e => set("location", e.target.value)} placeholder="เช่น ชั้น A แถว 3 ห้องเก็บของ" />
          </div>
        </div>
      )}

      {/* Image upload */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2" style={{ fontWeight: 700 }}>รูปภาพสินค้า</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        {form.image ? (
          <div className="relative inline-block">
            <img src={form.image} alt="preview" className="w-24 h-24 rounded-2xl object-cover border border-gray-200" />
            <button
              onClick={() => set("image", "")}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-[#19a589]/50 hover:text-[#19a589] transition-colors"
          >
            <Camera className="w-7 h-7" />
            <span className="text-xs">คลิกเพื่อเลือก/โหลดรูปสินค้า</span>
          </button>
        )}
      </div>

      {/* Note */}
      <div>
        <label className={labelCls}>หมายเหตุ</label>
        <textarea className={`${inputCls} resize-none`} rows={2} value={form.note}
          onChange={e => set("note", e.target.value)} placeholder="รายละเอียดเพิ่มเติม..." />
      </div>
    </Modal>
  );
}

// ─── Receive Stock Modal ──────────────────────────────────────────────
function ReceiveModal({ open, onClose, onSave, product }: {
  open: boolean; onClose: () => void;
  onSave: (mv: Omit<StockMovement, "id">) => void;
  product: StockProduct | null;
}) {
  const [qty, setQty]       = useState(0);
  const [cost, setCost]     = useState(0);
  const [date, setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [lot, setLot]       = useState("");
  const [supplier, setSupplier] = useState("");
  const [po, setPo]         = useState("");
  const [note, setNote]     = useState("");

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && product) {
      setCost(product.costPrice);
      setQty(0); setLot(""); setSupplier(product.supplier); setPo(""); setNote("");
    }
  }

  if (!product) return null;
  const newStock = product.stock + qty;
  const totalCost = qty * cost;

  return (
    <Modal
      open={open}
      title="รับสินค้าเข้าคลัง"
      subtitle={product.code}
      icon={<ArrowDownToLine className="w-[20px] h-[20px] text-white" />}
      onClose={onClose}
      onSave={() => onSave({
        productId: product.id, productName: product.name, type: "in",
        qty, costPerUnit: cost,
        date: new Date(date).toLocaleDateString("th-TH", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }),
        ref: po, supplier, lot, note,
      })}
      saveLabel="รับเข้า Stock"
      canSave={qty > 0}
    >
      {/* Preview */}
      <div className="bg-[#f9fafb] rounded-2xl p-4 flex items-center justify-between">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1" style={{ fontWeight: 700 }}>STOCK ปัจจุบัน</p>
          <p className="text-3xl" style={{ fontWeight: 700, color: product.stock === 0 ? "#ef4444" : "#1e2939" }}>{product.stock}</p>
          <p className="text-[11px] text-gray-400">{product.unit}</p>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <div className="w-8 h-8 rounded-full bg-[#19a589]/10 flex items-center justify-center">
            <ArrowDownToLine className="w-4 h-4 text-[#19a589]" />
          </div>
          <span className="text-xs text-[#19a589]" style={{ fontWeight: 600 }}>+{qty}</span>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1" style={{ fontWeight: 700 }}>หลังรับเข้า</p>
          <p className="text-3xl" style={{ fontWeight: 700, color: "#19a589" }}>{newStock}</p>
          <p className="text-[11px] text-gray-400">{product.unit}</p>
        </div>
        <div className="text-center border-l border-gray-200 pl-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1" style={{ fontWeight: 700 }}>ต้นทุนรับเข้า</p>
          <p className="text-xl" style={{ fontWeight: 700, color: "#f59e0b" }}>฿{totalCost.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400">รวม</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>จำนวนรับเข้า <span className="text-red-400">*</span></label>
          <input type="number" min={1} className={inputCls} value={qty || ""} onChange={e => setQty(Number(e.target.value))} placeholder="50" />
        </div>
        <div>
          <label className={labelCls}>ราคาทุน / ชิ้น (฿)</label>
          <input type="number" className={inputCls} value={cost || ""} onChange={e => setCost(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>วันที่รับสินค้า</label>
          <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Lot / Batch</label>
          <input className={inputCls} value={lot} onChange={e => setLot(e.target.value)} placeholder="LOT-250316" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Supplier</label>
          <select className={inputCls} value={supplier} onChange={e => setSupplier(e.target.value)}>
            <option value="">— เลือก Supplier —</option>
            {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>เลข PO อ้างอิง</label>
          <input className={inputCls} value={po} onChange={e => setPo(e.target.value)} placeholder="PO-2025-0025" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>หมายเหตุ</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="หมายเหตุการรับสินค้า..." />
        </div>
      </div>
    </Modal>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────
function DonutChart({ products }: { products: StockProduct[] }) {
  const stockOnly = products.filter(p => p.type === "stock");
  const ok     = stockOnly.filter(p => stockStatus(p) === "ok").length;
  const low    = stockOnly.filter(p => stockStatus(p) === "low").length;
  const out    = stockOnly.filter(p => stockStatus(p) === "out").length;
  const nosvc  = products.filter(p => p.type === "nostock").length;
  const total  = products.length;
  const data = [
    { name: "Stock ปกติ",   value: ok,   gradId: "donut-ok",  colorFrom: "#34d399", colorTo: "#0d7c66", legendColor: "linear-gradient(135deg,#34d399,#0d7c66)" },
    { name: "ใกล้หมด",      value: low,  gradId: "donut-low", colorFrom: "#fcd34d", colorTo: "#d97706", legendColor: "linear-gradient(135deg,#fcd34d,#d97706)" },
    { name: "ขาด Stock",    value: out,  gradId: "donut-out", colorFrom: "#fca5a5", colorTo: "#dc2626", legendColor: "linear-gradient(135deg,#fca5a5,#dc2626)" },
    { name: "ไม่ใช้ Stock", value: nosvc,gradId: "donut-ns",  colorFrom: "#c4b5fd", colorTo: "#7c3aed", legendColor: "linear-gradient(135deg,#c4b5fd,#7c3aed)" },
  ].filter(d => d.value > 0);

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex-shrink-0" style={{ width: 80, height: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart id="stock-donut-chart">
            <defs>
              {data.map(d => (
                <linearGradient key={d.gradId} id={d.gradId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={d.colorFrom} />
                  <stop offset="100%" stopColor={d.colorTo} />
                </linearGradient>
              ))}
            </defs>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={26} outerRadius={38} strokeWidth={2} stroke="#fff">
              {data.map((d) => <Cell key={"stk-cell-" + d.gradId} fill={`url(#${d.gradId})`} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.legendColor }} />
            <span className="text-xs text-gray-600 flex-1">{d.name}</span>
            <span className="text-xs" style={{ fontWeight: 700, color: "#1e2939" }}>
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PO Status Config ─────────────────────────────────────────────────
const PO_STATUS_CFG = {
  draft:     { label: "ร่าง",           cls: "bg-gray-100 text-gray-500",    Icon: Clock },
  sent:      { label: "ส่ง PO แล้ว",    cls: "bg-blue-50 text-blue-600",     Icon: Truck },
  waiting:   { label: "รอรับสินค้า",    cls: "bg-amber-50 text-amber-600",   Icon: ClipboardCheck },
  received:  { label: "รับสินค้าแล้ว", cls: "bg-[#f0fdf4] text-[#16a34a]", Icon: Check },
  cancelled: { label: "ยกเลิก",         cls: "bg-red-50 text-red-500",       Icon: Ban },
};

// ─── PO Modal ─────────────────────────────────────────────────────────
function POModal({ open, onClose, onSave, products, initialItems }: {
  open: boolean;
  onClose: () => void;
  onSave: (po: Omit<PurchaseOrder, "id">) => void;
  products: StockProduct[];
  initialItems?: POItem[];
}) {
  const [tab, setTab] = useState<"new" | "history">("new");
  const [pos, setPOs] = useState<PurchaseOrder[]>(INIT_POS);

  const today = new Date().toISOString().split("T")[0];

  const emptyForm = () => ({
    poNumber: `PO-2025-${String(pos.length + 26).padStart(4, "0")}`,
    supplier: "",
    orderDate: today,
    expectedDate: "",
    deliveryMethod: "ขนส่งทั่วไป",
    items: initialItems ? [...initialItems] : [] as POItem[],
    note: "",
    status: "draft" as const,
  });

  const [form, setForm] = useState(emptyForm());
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) { setForm(emptyForm()); setTab("new"); }
  }

  const setF = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const addItem = () =>
    setF("items", [...form.items, { productId: 0, productName: "", unit: "ชิ้น", qty: 1, costPerUnit: 0 }]);
  const removeItem = (i: number) =>
    setF("items", form.items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, patch: Partial<POItem>) =>
    setF("items", form.items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const setItemProduct = (i: number, pid: number) => {
    const p = products.find(x => x.id === pid);
    if (!p) return;
    updateItem(i, { productId: pid, productName: p.name, unit: p.unit, costPerUnit: p.costPrice });
  };

  const total = form.items.reduce((s, it) => s + it.qty * it.costPerUnit, 0);
  const canSave = !!form.supplier && form.items.length > 0 && form.items.every(it => it.productId && it.qty > 0);

  const handleSave = (status: "draft" | "sent") => {
    const po: Omit<PurchaseOrder, "id"> = { ...form, status };
    setPOs(ps => [{ ...po, id: ps.length + 1 }, ...ps]);
    onSave(po);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-2xl vet-modal"
              style={{ height: "min(720px, calc(100vh - 2rem))" }}
            >
          {/* header */}
          <div className="vet-modal-header rounded-t-3xl">
            <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
            <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="vet-modal-header-icon">
                  <ClipboardList className="w-[20px] h-[20px] text-white" />
                </div>
                <div>
                  <h2 className="vet-section-title">ใบสั่งซื้อสินค้า (PO)</h2>
                  <p className="vet-tiny mt-[2px]">Purchase Order — จัดการการสั่งซื้อ</p>
                </div>
              </div>
              <button onClick={onClose} className="vet-modal-close">
                <X className="w-[16px] h-[16px] text-gray-500" />
              </button>
            </div>
          </div>

          {/* tabs */}
          <div className="flex border-b border-gray-100 px-6 py-3 bg-gray-50/40 flex-shrink-0 shrink-0">
            <div className="flex items-center rounded-full p-1"
              style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 0 4px 0 rgba(0,0,0,0.15)" }}>
              {(["new", "history"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="rounded-full px-4 py-1.5 text-xs transition-all whitespace-nowrap"
                  style={{
                    background: tab === t ? "#19a589" : "transparent",
                    color: tab === t ? "#ffffff" : "#6a7282",
                    fontWeight: tab === t ? 500 : 400,
                  }}
                >
                  {t === "new" ? "สร้าง PO ใหม่" : `ประวัติ PO (${pos.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* ── New PO ── */}
          {tab === "new" && (
            <>
              <div className="vet-modal-body space-y-5">
                {/* meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>เลขที่ PO</label>
                    <input className={inputCls} value={form.poNumber}
                      onChange={e => setF("poNumber", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Supplier <span className="text-red-400">*</span></label>
                    <select className={inputCls} value={form.supplier} onChange={e => setF("supplier", e.target.value)}>
                      <option value="">— เลือก Supplier —</option>
                      {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>วันที่สั่งซื้อ</label>
                    <input type="date" className={inputCls} value={form.orderDate}
                      onChange={e => setF("orderDate", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>วันที่คาดรับสินค้า</label>
                    <input type="date" className={inputCls} value={form.expectedDate}
                      onChange={e => setF("expectedDate", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>วิธีส่งสินค้า</label>
                    <select className={inputCls} value={form.deliveryMethod}
                      onChange={e => setF("deliveryMethod", e.target.value)}>
                      {DELIVERY_METHODS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-wider text-gray-400" style={{ fontWeight: 700 }}>
                      รายการสินค้า
                    </p>
                    <button onClick={addItem}
                      className="flex items-center gap-1 text-xs text-[#19a589] hover:text-[#0d7c66] transition-colors"
                      style={{ fontWeight: 600 }}>
                      <Plus className="w-3.5 h-3.5" /> เพิ่มสินค้า
                    </button>
                  </div>

                  {form.items.length === 0 ? (
                    <button onClick={addItem}
                      className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-[#19a589]/40 hover:text-[#19a589] transition-colors">
                      <Package className="w-8 h-8" />
                      <span className="text-sm">คลิกเพื่อเพิ่มรายการสินค้า</span>
                    </button>
                  ) : (
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {["สินค้า", "จำนวน", "ราคาทุน/ชิ้น", "รวม", ""].map(h => (
                              <th key={h} className="px-3 py-2.5 text-left"
                                style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {form.items.map((it, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2">
                                <select
                                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 w-full focus:outline-none focus:border-[#19a589] bg-white"
                                  value={it.productId || ""}
                                  onChange={e => setItemProduct(i, Number(e.target.value))}
                                >
                                  <option value="">— เลือกสินค้า —</option>
                                  {products.filter(p => p.type === "stock").map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2 w-20">
                                <input type="number" min={1}
                                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 w-full text-center focus:outline-none focus:border-[#19a589]"
                                  value={it.qty || ""}
                                  onChange={e => updateItem(i, { qty: Number(e.target.value) })} />
                              </td>
                              <td className="px-3 py-2 w-28">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">฿</span>
                                  <input type="number"
                                    className="text-sm border border-gray-200 rounded-lg pl-5 pr-2 py-1.5 w-full focus:outline-none focus:border-[#19a589]"
                                    value={it.costPerUnit || ""}
                                    onChange={e => updateItem(i, { costPerUnit: Number(e.target.value) })} />
                                </div>
                              </td>
                              <td className="px-3 py-2 w-24 text-sm text-[#1e2939] whitespace-nowrap" style={{ fontWeight: 600 }}>
                                ฿{(it.qty * it.costPerUnit).toLocaleString()}
                              </td>
                              <td className="px-3 py-2 w-8">
                                <button onClick={() => removeItem(i)}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* total */}
                      <div className="flex items-center justify-between px-4 py-3 bg-[#f9fafb] border-t border-gray-100">
                        <span className="text-xs text-gray-400" style={{ fontWeight: 600 }}>{form.items.length} รายการ</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">ยอดรวม PO</span>
                          <span className="text-base text-[#19a589]" style={{ fontWeight: 700 }}>฿{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* note */}
                <div>
                  <label className={labelCls}>หมายเหตุถึง Supplier</label>
                  <textarea className={`${inputCls} resize-none`} rows={2}
                    value={form.note} onChange={e => setF("note", e.target.value)}
                    placeholder="เช่น ขอใบกำกับภาษีด้วย, ส่งก่อน 17:00 น." />
                </div>
              </div>

              {/* footer */}
              <div className="vet-modal-footer rounded-b-3xl" style={{ justifyContent: "space-between" }}>
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { handleSave("draft"); }}
                    disabled={!canSave}
                    className="vet-btn vet-btn-secondary disabled:opacity-40">
                    บันทึกร่าง
                  </button>
                  <button
                    onClick={() => { handleSave("sent"); onClose(); }}
                    disabled={!canSave}
                    className="vet-btn vet-btn-primary btn-green disabled:opacity-40">
                    <Check className="w-[16px] h-[16px]" />
                    ส่ง PO ให้ Supplier
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── PO History ── */}
          {tab === "history" && (
            <div className="vet-modal-body p-0 overflow-y-auto">
              {pos.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">ยังไม่มีประวัติ PO</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pos.map(po => {
                    const cfg = PO_STATUS_CFG[po.status];
                    const StatusIcon = cfg.Icon;
                    const poTotal = po.items.reduce((s, it) => s + it.qty * it.costPerUnit, 0);
                    return (
                      <div key={po.id} className="group px-4 py-3.5 transition-colors duration-150 hover:bg-[#f8fffe]" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <div className="flex items-start gap-3">
                          {/* status icon bubble */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5" style={{
                            background: po.status === "received" ? "linear-gradient(135deg,#34d399,#0d7c66)"
                              : po.status === "cancelled" ? "linear-gradient(135deg,#fca5a5,#ef4444)"
                              : po.status === "waiting" ? "linear-gradient(135deg,#fcd34d,#d97706)"
                              : po.status === "sent" ? "linear-gradient(135deg,#93c5fd,#2563eb)"
                              : "linear-gradient(135deg,#e5e7eb,#9ca3af)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                          }}>
                            <StatusIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                          </div>

                          {/* content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] text-[#1e2939] font-mono" style={{ fontWeight: 700 }}>{po.poNumber}</span>
                                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${cfg.cls}`} style={{ fontWeight: 600 }}>{cfg.label}</span>
                              </div>
                              <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>฿{poTotal.toLocaleString()}</span>
                            </div>

                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-[11px] text-gray-400">{po.supplier}</span>
                              <span className="text-gray-300">·</span>
                              <span className="text-[11px] text-gray-400">{po.deliveryMethod}</span>
                              <span className="text-gray-300">·</span>
                              <span className="text-[11px] text-gray-400">{po.orderDate}</span>
                              {po.expectedDate && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-[11px] text-[#19a589]" style={{ fontWeight: 500 }}>นัด {po.expectedDate}</span>
                                </>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {po.items.map((it, i) => (
                                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(25,165,137,0.07)", color: "#0d7c66", fontWeight: 500, border: "1px solid rgba(25,165,137,0.15)" }}>
                                  {it.productName} <span style={{ opacity: 0.6 }}>x{it.qty}</span>
                                </span>
                              ))}
                            </div>

                            {po.note && (
                              <p className="text-[11px] text-gray-400 mt-1.5 italic">"{po.note}"</p>
                            )}

                            {po.status !== "received" && po.status !== "cancelled" && (
                              <button
                                className="mt-2 inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full transition-all duration-150"
                                style={{ fontWeight: 600, background: "rgba(25,165,137,0.08)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(25,165,137,0.15)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(25,165,137,0.08)"; }}
                                onClick={() => setPOs(ps => ps.map(p => p.id === po.id ? { ...p, status: "received" } : p))}
                              >
                                ✓ รับสินค้าแล้ว
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Stock History Modal ──────────────────────────────────────────────
function genMockHistory(p: StockProduct, realMovements: StockMovement[]) {
  const real = realMovements.filter(m => m.productId === p.id);
  const byNames = ["น.สพ.กวิน", "สพ.ญ.มินตรา", "ระบบ POS", "สพ.ญ.พิมพ์", "น.สพ.ธนกร"];
  const baseRows: Omit<StockMovement, "id" | "productId" | "productName">[] = [
    { type:"in",     qty:50,  costPerUnit:p.costPrice, date:"1 ม.ค. 09:00",  ref:"PO-2025-0001", supplier:p.supplier, lot:"LOT-250101", note:"" },
    { type:"out",    qty:8,   costPerUnit:p.costPrice, date:"3 ม.ค. 14:22",  ref:"INV-O010",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"out",    qty:5,   costPerUnit:p.costPrice, date:"7 ม.ค. 11:05",  ref:"INV-O022",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"in",     qty:100, costPerUnit:p.costPrice, date:"15 ม.ค. 10:00", ref:"PO-2025-0009", supplier:p.supplier, lot:"LOT-250115", note:"" },
    { type:"out",    qty:12,  costPerUnit:p.costPrice, date:"18 ม.ค. 16:00", ref:"INV-O041",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"adjust", qty:-3,  costPerUnit:p.costPrice, date:"20 ม.ค. 09:00", ref:"ADJ-002",      supplier:"", lot:"", note:"ปรับยอดนับจริง" },
    { type:"in",     qty:80,  costPerUnit:p.costPrice, date:"1 ก.พ. 10:30",  ref:"PO-2025-0017", supplier:p.supplier, lot:"LOT-250201", note:"" },
    { type:"out",    qty:20,  costPerUnit:p.costPrice, date:"10 ก.พ. 15:00", ref:"INV-O065",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"out",    qty:10,  costPerUnit:p.costPrice, date:"20 ก.พ. 13:30", ref:"INV-O078",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"in",     qty:50,  costPerUnit:p.costPrice, date:"1 มี.ค. 09:00",  ref:"PO-2025-0028", supplier:p.supplier, lot:"LOT-250301", note:"" },
  ];
  const allRows = [...baseRows, ...real.map(m => ({
    type: m.type, qty: m.qty, costPerUnit: m.costPerUnit,
    date: m.date, ref: m.ref, supplier: m.supplier, lot: m.lot, note: m.note,
  }))];
  let running = 0;
  const result = allRows.map((row, i) => {
    const delta = row.type === "in" ? row.qty : row.type === "out" ? -row.qty : row.qty;
    running += delta;
    return { ...row, id: i + 1, productId: p.id, productName: p.name, runningStock: Math.max(0, running), by: byNames[i % byNames.length] };
  });
  return result.reverse();
}

function StockHistoryModal({ open, product, movements, onClose, onOrder }: {
  open: boolean;
  product: StockProduct | null;
  movements: StockMovement[];
  onClose: () => void;
  onOrder: () => void;
}) {
  if (!product) return null;
  const history = genMockHistory(product, movements);
  const totalIn  = history.filter(m => m.type === "in").reduce((s, m) => s + m.qty, 0);
  const totalOut = history.filter(m => m.type === "out").reduce((s, m) => s + Math.abs(m.qty), 0);
  const typeCfg = {
    in:     { label: "รับเข้า",  cls: "bg-[#f0fdf4] text-[#16a34a]" },
    out:    { label: "จ่ายออก", cls: "bg-[#fff7ed] text-[#c2410c]" },
    adjust: { label: "ปรับยอด", cls: "bg-[#eff6ff] text-[#2563eb]" },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-2xl vet-modal flex flex-col"
              style={{ height: "min(720px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl flex-shrink-0">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
                      <History className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">ประวัติ Stock — {product.name}</h2>
                      <p className="vet-tiny mt-[2px]">SKU: {product.code} · คงเหลือ: <span style={{ fontWeight: 700, color: "#19a589" }}>{product.stock} {product.unit}</span></p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="flex-shrink-0 grid grid-cols-3 gap-3 px-6 pt-4 pb-2">
                <div className="rounded-2xl p-3.5" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <p className="text-[11px] text-[#16a34a] mb-1" style={{ fontWeight: 600 }}>รับเข้าทั้งหมด</p>
                  <p className="text-xl text-[#16a34a]" style={{ fontWeight: 700 }}>+{totalIn.toLocaleString()}</p>
                  <p className="text-[11px] text-[#16a34a]/70">{product.unit}</p>
                </div>
                <div className="rounded-2xl p-3.5" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <p className="text-[11px] text-[#c2410c] mb-1" style={{ fontWeight: 600 }}>จ่ายออกทั้งหมด</p>
                  <p className="text-xl text-[#c2410c]" style={{ fontWeight: 700 }}>-{totalOut.toLocaleString()}</p>
                  <p className="text-[11px] text-[#c2410c]/70">{product.unit}</p>
                </div>
                <div className="rounded-2xl p-3.5" style={{ background: "#f0fdf9", border: "1px solid #99f6e4" }}>
                  <p className="text-[11px] text-[#0d7c66] mb-1" style={{ fontWeight: 600 }}>Stock คงเหลือ</p>
                  <p className="text-xl text-[#19a589]" style={{ fontWeight: 700 }}>{product.stock.toLocaleString()}</p>
                  <p className="text-[11px] text-[#19a589]/70">{product.unit}</p>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto px-6 pb-2">
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                        {["วันที่", "ประเภท", "จำนวน", "คงเหลือ", "อ้างอิง", "โดย"].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 text-[11px] text-gray-400" style={{ fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {history.map((mv, i) => {
                        const cfg = typeCfg[mv.type];
                        const delta = mv.type === "in" ? mv.qty : mv.type === "out" ? -Math.abs(mv.qty) : mv.qty;
                        const color = mv.type === "in" ? "#16a34a" : mv.type === "out" ? "#c2410c" : "#2563eb";
                        return (
                          <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{mv.date}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full ${cfg.cls}`} style={{ fontWeight: 600 }}>
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5" style={{ fontWeight: 700, color }}>
                              {delta > 0 ? "+" : ""}{delta.toLocaleString()} {product.unit}
                            </td>
                            <td className="px-3 py-2.5 text-gray-700" style={{ fontWeight: 600 }}>{(mv as any).runningStock.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-gray-400 font-mono text-[11px]">{mv.ref || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-500">{(mv as any).by}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl flex-shrink-0" style={{ justifyContent: "space-between" }}>
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ปิด</button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {}}
                    className="vet-btn vet-btn-secondary flex items-center gap-1.5"
                  >
                    <FileDown className="w-[15px] h-[15px]" />
                    Export CSV
                  </button>
                  <button
                    onClick={onOrder}
                    className="vet-btn flex items-center gap-1.5 text-white"
                    style={{ fontWeight: 600, background: "linear-gradient(162.971deg, #e8802a 0%, #d06a1a 100%)", boxShadow: "0px 2px 12px 0px rgba(232,128,42,0.3)" }}
                  >
                    <Receipt className="w-[15px] h-[15px]" />
                    สั่งซื้อเพิ่ม
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export function Stock() {
  const { t } = useLang();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { stockProducts: products, setStockProducts: setProducts } = useClinicData();
  const [movements, setMovements]   = useState<StockMovement[]>(INIT_MOVEMENTS);
  const [editMovement, setEditMovement] = useState<StockMovement | null>(null);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("ทั้งหมด");
  const [page, setPage]             = useState(1);
  const [addOpen, setAddOpen]       = useState(false);
  const [editTarget, setEditTarget] = useState<StockProduct | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<StockProduct | null>(null);
  const [quickProduct, setQuickProduct]   = useState("");
  const [quickQty, setQuickQty]           = useState("");
  const [poOpen, setPoOpen]               = useState(false);
  const [poInitItems, setPoInitItems]     = useState<POItem[] | undefined>(undefined);
  const [movementOpen, setMovementOpen]   = useState(false);
  const [historyTarget, setHistoryTarget] = useState<StockProduct | null>(null);

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "ทั้งหมด" || p.category === catFilter;
    return matchSearch && matchCat;
  }), [products, search, catFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const lowItems   = products.filter(p => p.type === "stock" && stockStatus(p) === "low");
  const outItems   = products.filter(p => p.type === "stock" && stockStatus(p) === "out");
  const totalValue = products.filter(p => p.type === "stock").reduce((s, p) => s + p.costPrice * p.stock, 0);
  const pendingPO  = movements.filter(m => m.type === "in").length;

  const handleSaveProduct = (p: StockProduct) => {
    if (p.id) {
      setProducts(ps => ps.map(x => x.id === p.id ? p : x));
      showSnackbar("success", "แก้ไขข้อมูลสินค้าเรียบร้อย");
    } else {
      setProducts(ps => [...ps, { ...p, id: nextId(ps) }]);
      showSnackbar("success", "เพิ่มสินค้าใหม่เรียบร้อย");
    }
    setAddOpen(false);
    setEditTarget(null);
  };

  const handleDelete = (id: number) => {
    setProducts(ps => ps.filter(p => p.id !== id));
    showSnackbar("delete", "ลบสินค้าออกจากคลังแล้ว");
  };

  const handleReceive = (mv: Omit<StockMovement, "id">) => {
    const newMv: StockMovement = { ...mv, id: nextId(movements) };
    setMovements(ms => [newMv, ...ms]);
    setProducts(ps => ps.map(p => p.id === mv.productId ? { ...p, stock: p.stock + mv.qty } : p));
    setReceiveTarget(null);
    showSnackbar("success", `รับ ${mv.qty} ${mv.productName} เข้าคลังเรียบร้อย`);
  };

  const handleSavePO = (po: Omit<PurchaseOrder, "id">) => {
    showSnackbar("success", `${po.status === "sent" ? "ส่ง" : "บันทึกร่าง"} ${po.poNumber} เรียบร้อยแล้ว`);
  };

  const handleSaveMovement = (mv: {
    productId: number; productName: string; type: "in" | "out" | "adjust";
    qty: number; costPerUnit: number; date: string;
    ref: string; supplier: string; lot: string; note: string;
  }) => {
    const label = mv.type === "in" ? "รับเข้า" : mv.type === "out" ? "จ่ายออก" : "ปรับยอด";

    if (editMovement) {
      // ── แก้ไขรายการเดิม: กลับผลกระทบ stock เก่า แล้วใส่ของใหม่ ──
      const old = editMovement;
      const updated: StockMovement = { ...old, ...mv, id: old.id, ref: old.ref };
      setMovements((ms) => ms.map((m) => (m.id === old.id ? updated : m)));
      setProducts((ps) =>
        ps.map((p) => {
          let stock = p.stock;
          if (p.id === old.productId) stock = stock - old.qty;       // คืนผลกระทบเดิม
          if (p.id === mv.productId)  stock = stock + mv.qty;         // ใส่ผลกระทบใหม่
          return p.id === old.productId || p.id === mv.productId ? { ...p, stock: Math.max(0, stock) } : p;
        })
      );
      setEditMovement(null);
      showSnackbar("success", `แก้ไข${label} ${mv.productName} เรียบร้อยแล้ว`);
      return;
    }

    const newMv: StockMovement = { ...mv, id: nextId(movements) };
    setMovements((ms) => [newMv, ...ms]);
    setProducts((ps) =>
      ps.map((p) => p.id === mv.productId ? { ...p, stock: Math.max(0, p.stock + mv.qty) } : p)
    );
    showSnackbar("success", `${label} ${Math.abs(mv.qty)} ${mv.productName} เรียบร้อยแล้ว`);
  };

  // เปิดโมดัลเดิมแบบ prefill เพื่อแก้ไข movement
  const openEditMovement = (mv: StockMovement) => {
    setMovementOpen(false);
    setEditMovement(mv);
  };

  // ลบ movement: ยืนยันก่อน แล้วคืนผลกระทบ stock
  const handleDeleteMovement = async (mv: StockMovement) => {
    const ok = await confirm({
      title: "ลบรายการเคลื่อนไหว",
      description: `ลบรายการ "${mv.productName}" ออกจากประวัติ? Stock จะถูกปรับกลับ`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    setMovements((ms) => ms.filter((m) => m.id !== mv.id));
    setProducts((ps) =>
      ps.map((p) => p.id === mv.productId ? { ...p, stock: Math.max(0, p.stock - mv.qty) } : p)
    );
    showSnackbar("delete", `ลบรายการ ${mv.productName} แล้ว`);
  };

  // แปลง movement เดิม → ค่า prefill ของโมดัล (ดึงเวลา HH:MM จากสตริงวันที่ถ้ามี)
  const editingForModal: EditingMovement | null = editMovement
    ? {
        id: editMovement.id,
        productId: editMovement.productId,
        type: editMovement.type,
        qty: editMovement.qty,
        time: (editMovement.date.match(/(\d{1,2}:\d{2})/) || [])[1],
        reason: editMovement.note,
        note: editMovement.note,
      }
    : null;

  const handleQuickReceive = () => {
    const qty = Number(quickQty);
    if (!quickProduct || !qty || qty <= 0) return;
    const product = products.find(p => p.id === Number(quickProduct));
    if (!product) return;
    setProducts(ps => ps.map(p => p.id === product.id ? { ...p, stock: p.stock + qty } : p));
    const mv: StockMovement = {
      id: nextId(movements), productId: product.id, productName: product.name,
      type: "in", qty, costPerUnit: product.costPrice,
      date: "ตอนนี้", ref: "", supplier: "", lot: "", note: "รับด่วน",
    };
    setMovements(ms => [mv, ...ms]);
    setQuickProduct(""); setQuickQty("");
    showSnackbar("success", `รับ ${qty} ${product.name} เข้าคลังเรียบร้อย`);
  };

  // KPI tiles (white cards on hero)
  const kpis = [
    { label: t("stock.kpi.total"),  value: String(products.length),         icon: Package,     color: "#10b981", soft: "rgba(16,185,129,0.12)" },
    { label: t("stock.kpi.value"),  value: `฿${totalValue.toLocaleString()}`, icon: TrendingUp,  color: "#0d9488", soft: "rgba(13,148,136,0.12)" },
    { label: t("stock.kpi.low"),    value: String(lowItems.length),         icon: AlertTriangle, color: "#e8802a", soft: "rgba(232,128,42,0.12)" },
    { label: t("stock.kpi.out"),    value: String(outItems.length),         icon: AlertTriangle, color: "#ef4444", soft: "rgba(239,68,68,0.12)" },
  ];

  return (
    <div className="min-h-full flex flex-col" style={{ background: "#FEFBF8" }}>
      {/* ── HERO ── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden m-3 sm:m-4 mb-0 flex-shrink-0"
        style={{
          backgroundImage: `
            radial-gradient(at 100% 0%, rgba(45,212,191,0.55) 0%, transparent 55%),
            radial-gradient(at 0% 100%, rgba(8,75,62,0.65) 0%, transparent 60%),
            linear-gradient(135deg, #1aa78b 0%, #0e5e4f 100%)
          `,
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)" }} />
          <div className="absolute -bottom-28 left-1/4 w-[260px] h-[260px] rounded-full" style={{ background: "radial-gradient(circle, rgba(45,212,191,0.35) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)" }} />
        </div>

        <div className="relative p-5 flex flex-col gap-4">
          {/* Title row + actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))",
                border: "1px solid rgba(255,255,255,0.32)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.12)",
              }}
            >
              <Warehouse className="w-[22px] h-[22px] text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: 25, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                {t("stock.title")}
              </h1>
              <p className="text-white/75 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>
                {t("stock.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setMovementOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
                }}
              >
                <BarChart2 className="w-3.5 h-3.5" /> {t("stock.movement")}
              </button>
              <button
                onClick={() => { setPoInitItems(undefined); setPoOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
                }}
              >
                <Receipt className="w-3.5 h-3.5" /> {t("stock.po")}
              </button>
              <button
                onClick={() => { setEditTarget(null); setAddOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                  border: "1px solid rgba(253,186,116,0.85)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.55)",
                  fontWeight: 700,
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                <Plus className="w-3.5 h-3.5" /> {t("stock.add")}
              </button>
            </div>
          </div>

          {/* KPI tiles — white cards on hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.map((m, i) => {
              const Ico = m.icon;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-2xl bg-white p-3 transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.soft }}>
                      <Ico className="w-4 h-4" style={{ color: m.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[18px] text-gray-900" style={{ fontWeight: 800, lineHeight: 1.1 }}>{m.value}</p>
                      <p className="text-[10.5px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{m.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── Body content ── */}
      <div className="p-3 sm:p-4 pt-3 space-y-4">

      {/* ── Alert Banner ── */}
      {(lowItems.length + outItems.length) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl mb-5 flex items-center gap-4 px-5 py-4"
          style={{
            background: "linear-gradient(135deg, #fff1f2 0%, #fff5f5 60%, #fef3f2 100%)",
            border: "1px solid #fecaca",
            boxShadow: "0 2px 16px rgba(239,68,68,0.08)",
          }}
        >
          {/* accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "linear-gradient(180deg,#f87171,#dc2626)" }} />

          {/* icon bubble */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fca5a5,#ef4444)", boxShadow: "0 4px 10px rgba(239,68,68,0.25)" }}>
            <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>

          {/* text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800 leading-snug" style={{ fontWeight: 700 }}>
              {outItems.length > 0 && (
                <span className="inline-flex items-center gap-1 mr-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  หมด {outItems.length} รายการ
                </span>
              )}
              {lowItems.length > 0 && (
                <span className="inline-flex items-center gap-1 mr-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                  ใกล้หมด {lowItems.length} รายการ
                </span>
              )}
              <span className="text-red-400" style={{ fontWeight: 500 }}>— ต้องสั่งซื้อเพิ่มเติม</span>
            </p>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {[...outItems, ...lowItems].slice(0, 5).map(p => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full"
                  style={{
                    fontWeight: 600,
                    background: p.stock === 0 ? "rgba(239,68,68,0.10)" : "rgba(251,146,60,0.12)",
                    color: p.stock === 0 ? "#b91c1c" : "#9a3412",
                    border: p.stock === 0 ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(251,146,60,0.30)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.stock === 0 ? "#ef4444" : "#f97316" }} />
                  {p.name} {p.stock === 0 ? "• หมด" : `• ${p.stock} ${p.unit}`}
                </span>
              ))}
              {(outItems.length + lowItems.length) > 5 && (
                <span className="text-[11px] text-red-400 self-center" style={{ fontWeight: 500 }}>+{(outItems.length + lowItems.length) - 5} รายการ</span>
              )}
            </div>
          </div>

          {/* CTA button */}
          <button
            onClick={() => {
              const autoItems: POItem[] = [...outItems, ...lowItems].map(p => ({
                productId: p.id,
                productName: p.name,
                unit: p.unit,
                qty: Math.max(1, p.minStock - p.stock),
                costPerUnit: p.costPrice,
              }));
              setPoInitItems(autoItems);
              setPoOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 h-9 rounded-full text-white text-xs flex-shrink-0 transition-all duration-200"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#f87171,#dc2626)", boxShadow: "0 4px 12px rgba(220,38,38,0.30)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(220,38,38,0.40)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(220,38,38,0.30)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            สร้าง PO ทันที
          </button>
        </motion.div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* ─ Table Panel ─ */}
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)", height: 660 }}>

          {/* ── Toolbar ── */}
          <div className="px-5 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            {/* แถว: ค้นหา + หมวดหมู่ + รับสินค้า */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="ค้นหาสินค้า, SKU, บาร์โค้ด..."
                  className="pl-9 pr-4 h-9 rounded-full text-[13px] w-56 outline-none transition-all duration-200"
                  style={{ border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151" }}
                  onFocus={e => { e.currentTarget.style.border = "1px solid #19a589"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(25,165,137,0.10)"; }}
                  onBlur={e => { e.currentTarget.style.border = "1px solid #e5e7eb"; e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.boxShadow = ""; }}
                />
              </div>
              <div className="relative inline-flex items-center">
                <select
                  value={catFilter}
                  onChange={e => { setCatFilter(e.target.value); setPage(1); }}
                  className="appearance-none h-9 pl-3 pr-8 rounded-full text-[13px] outline-none transition-all duration-200 cursor-pointer"
                  style={{
                    border: catFilter !== "ทั้งหมด" ? "1px solid rgba(25,165,137,0.40)" : "1px solid #e5e7eb",
                    background: catFilter !== "ทั้งหมด" ? "rgba(25,165,137,0.07)" : "#f9fafb",
                    color: catFilter !== "ทั้งหมด" ? "#0d7c66" : "#6b7280",
                    fontWeight: catFilter !== "ทั้งหมด" ? 700 : 500,
                  }}
                >
                  {CATS.map(c => {
                    const count = c === "ทั้งหมด" ? products.length : products.filter(p => p.category === c).length;
                    return (
                      <option key={c} value={c}>{c} ({count})</option>
                    );
                  })}
                </select>
                <ChevronRight
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none rotate-90"
                  style={{ color: catFilter !== "ทั้งหมด" ? "#0d7c66" : "#9ca3af" }}
                />
              </div>
              <button
                onClick={() => { const p = products.find(p => p.type === "stock"); if (p) setReceiveTarget(p); }}
                className="ml-auto flex items-center gap-2 h-9 px-4 rounded-full text-[13px] transition-all duration-200"
                style={{ background: "rgba(25,165,137,0.08)", color: "#19a589", fontWeight: 600, border: "1px solid rgba(25,165,137,0.20)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(25,165,137,0.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(25,165,137,0.08)"; }}
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                รับสินค้า
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  {[
                    { label: "สินค้า" },
                    { label: "ประเภท" },
                    { label: "หมวดหมู่" },
                    { label: "ราคาขาย" },
                    { label: "ราคาทุน" },
                    { label: "สต็อก" },
                    { label: "แจ้งเตือน" },
                    { label: "สถานะ" },
                    { label: "จัดการ" },
                  ].map(h => (
                    <th
                      key={h.label}
                      className="px-4 py-3 text-left whitespace-nowrap"
                      style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase" }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((p, idx) => {
                  const s = stockStatus(p);
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors duration-150 group"
                      style={{
                        background: s === "out" ? "rgba(254,242,242,0.55)" : s === "low" ? "rgba(255,251,235,0.55)" : isEven ? "#fff" : "rgba(249,250,251,0.5)",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,253,249,0.85)"; }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = s === "out" ? "rgba(254,242,242,0.55)" : s === "low" ? "rgba(255,251,235,0.55)" : isEven ? "#fff" : "rgba(249,250,251,0.5)";
                      }}
                    >
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl overflow-hidden"
                            style={{ background: "linear-gradient(135deg,#f3f4f6,#e9ecef)", border: "1px solid rgba(0,0,0,0.06)" }}
                          >
                            {p.image
                              ? <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                              : <span style={{ lineHeight: 1 }}>{p.categoryEmoji}</span>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] text-gray-800 truncate max-w-[180px]" style={{ fontWeight: 600 }}>{p.name}</p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{p.code}</p>
                          </div>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TypeBadge type={p.type} />
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                          style={{ background: "#f3f4f6", color: "#4b5563", fontWeight: 500 }}
                        >
                          {p.categoryEmoji} {p.category}
                        </span>
                      </td>
                      {/* Sell price */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] text-gray-800" style={{ fontWeight: 700 }}>฿{p.sellPrice.toLocaleString()}</span>
                      </td>
                      {/* Cost price */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[12px] text-gray-400">
                          {p.costPrice > 0 ? `฿${p.costPrice.toLocaleString()}` : "—"}
                        </span>
                      </td>
                      {/* Stock bar */}
                      <td className="px-4 py-3">
                        <StockBar product={p} />
                      </td>
                      {/* Min stock */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {p.type === "stock" ? (
                          <span
                            className="inline-flex items-center justify-center text-[11px] px-2.5 py-0.5 rounded-full"
                            style={{ background: "rgba(251,191,36,0.12)", color: "#d97706", fontWeight: 600 }}
                          >
                            ≤{p.minStock}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <StockStatusBadge product={p} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.type === "stock" && (
                            <button
                              onClick={() => setReceiveTarget(p)}
                              title="รับสินค้าเข้า"
                              className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200"
                              style={{ background: "transparent", color: "#b0bec5" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(25,165,137,0.15)"; (e.currentTarget as HTMLElement).style.color = "#19a589"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#b0bec5"; }}
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => { setEditTarget(p); setAddOpen(true); }}
                            title="แก้ไข"
                            className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200"
                            style={{ background: "transparent", color: "#b0bec5" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.15)"; (e.currentTarget as HTMLElement).style.color = "#3b82f6"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#b0bec5"; }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setHistoryTarget(p)}
                            title="ประวัติ"
                            className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200"
                            style={{ background: "transparent", color: "#b0bec5" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.15)"; (e.currentTarget as HTMLElement).style.color = "#8b5cf6"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#b0bec5"; }}
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="ลบ"
                            className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200"
                            style={{ background: "transparent", color: "#b0bec5" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#b0bec5"; }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {paged.length === 0 && (
              <div className="py-14 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#f3f4f6" }}>
                  <Package className="w-7 h-7 text-gray-300" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] text-gray-500" style={{ fontWeight: 600 }}>ไม่พบสินค้า</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {search && catFilter !== "ทั้งหมด"
                      ? <span>ในหมวด <span style={{ fontWeight: 600, color: "#6b7280" }}>"{catFilter}"</span> ที่ตรงกับ <span style={{ fontWeight: 600, color: "#6b7280" }}>"{search}"</span></span>
                      : search
                      ? <span>ที่ตรงกับคำค้น <span style={{ fontWeight: 600, color: "#6b7280" }}>"{search}"</span></span>
                      : catFilter !== "ทั้งหมด"
                      ? <span>ในหมวดหมู่ <span style={{ fontWeight: 600, color: "#6b7280" }}>"{catFilter}"</span></span>
                      : "ยังไม่มีสินค้าในระบบ"
                    }
                  </p>
                </div>
                {(search || catFilter !== "ทั้งหมด") && (
                  <button
                    onClick={() => { setSearch(""); setCatFilter("ทั้งหมด"); setPage(1); }}
                    className="flex items-center gap-1.5 h-8 px-4 rounded-full text-[12px] transition-all duration-200"
                    style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 500 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e5e7eb"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-[12px] text-gray-400">
              แสดง{" "}
              <span className="text-gray-600" style={{ fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span>
              {" "}จาก{" "}
              <span className="text-gray-600" style={{ fontWeight: 600 }}>{filtered.length}</span> รายการ
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                style={{ background: "#f3f4f6", color: "#6b7280" }}
                onMouseEnter={e => { if (page !== 1) (e.currentTarget as HTMLElement).style.background = "#e5e7eb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-full text-[12px] transition-all duration-150"
                  style={page === n
                    ? { background: "linear-gradient(135deg,#19a589,#0d7c66)", color: "#fff", fontWeight: 700, boxShadow: "0 2px 8px rgba(25,165,137,0.28)" }
                    : { background: "#f3f4f6", color: "#6b7280", fontWeight: 500 }
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                style={{ background: "#f3f4f6", color: "#6b7280" }}
                onMouseEnter={e => { if (page !== totalPages) (e.currentTarget as HTMLElement).style.background = "#e5e7eb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─ Right Panel ─ */}
        <div className="flex flex-col gap-4">
          {/* Donut chart */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f0fdf9] flex items-center justify-center flex-shrink-0">
                <Package className="w-3.5 h-3.5 text-[#19a589]" />
              </div>
              <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>สัดส่วน Stock</span>
            </div>
            <DonutChart products={products} />
          </div>

          {/* 7-day bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>การเคลื่อนไหว 7 วัน</span>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: "linear-gradient(135deg,#34d399,#0d7c66)" }} /><span className="text-[11px] text-gray-500">รับเข้า</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: "linear-gradient(135deg,#fcd34d,#d97706)" }} /><span className="text-[11px] text-gray-500">จ่ายออก</span></div>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={SEVEN_DAY} barCategoryGap="25%" id="stock-7day-bar">
                  <defs>
                    <linearGradient id="bar-in" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#0d7c66" />
                    </linearGradient>
                    <linearGradient id="bar-out" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fcd34d" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  />
                  <Bar key="bar-in-stk" dataKey="รับเข้า" fill="url(#bar-in)" radius={[3,3,0,0]} />
                  <Bar key="bar-out-stk" dataKey="จ่ายออก" fill="url(#bar-out)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Items needing action */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                </div>
                <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>รายการต้องดำเนินการ</span>
              </div>
              <button
                onClick={() => showSnackbar("info", "สร้างใบสั่งซื้อทั้งหมดแล้ว")}
                className="text-xs text-[#19a589] hover:underline"
                style={{ fontWeight: 600 }}
              >
                สั่งซื้อทั้งหมด
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {[...outItems, ...lowItems].slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${stockStatus(p) === "out" ? "bg-red-50" : "bg-[#fff7ed]"}`}>
                    {p.categoryEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-[#1e2939] truncate" style={{ fontWeight: 600 }}>{p.name}</p>
                    <p className="text-[11px] text-gray-400">สั่ง ≤{p.minStock} {p.unit}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: stockStatus(p) === "out" ? "#dc2626" : "#f59e0b", fontSize: 18 }}>{p.stock}</span>
                </div>
              ))}
              {lowItems.length + outItems.length === 0 && (
                <div className="px-4 py-5 text-center text-xs text-gray-400">Stock ทุกรายการอยู่ในเกณฑ์ปกติ ✓</div>
              )}
            </div>
          </div>

          {/* Quick receive */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f0fdf9] flex items-center justify-center flex-shrink-0">
                <ArrowDownToLine className="w-3.5 h-3.5 text-[#19a589]" />
              </div>
              <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>รับสินค้าด่วน</span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <select
                value={quickProduct} onChange={e => setQuickProduct(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#19a589] bg-white text-gray-600"
              >
                <option value="">— เลือกสินค้า —</option>
                {products.filter(p => p.type === "stock").map(p => (
                  <option key={p.id} value={p.id}>{p.name} (คงเหลือ {p.stock})</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number" min={1} placeholder="จำนวน"
                  value={quickQty} onChange={e => setQuickQty(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#19a589] bg-white"
                />
              </div>
              <button
                onClick={handleQuickReceive}
                className="w-full h-9 rounded-full text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)" }}
                disabled={!quickProduct || !quickQty}
              >
                ✓ รับเข้า Stock
              </button>
            </div>
          </div>

          {/* Recent movements */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#fafafa] flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>ความเคลื่อนไหวล่าสุด</span>
              </div>
              <button className="text-xs text-[#19a589]" style={{ fontWeight: 600 }}>ดูทั้งหมด</button>
            </div>
            <div className="divide-y divide-gray-50">
              {movements.slice(0, 5).map((mv, i) => {
                const isIn  = mv.type === "in";
                const isAdj = mv.type === "adjust";
                return (
                  <div key={mv.id} className="group/mv flex items-start gap-3 px-4 py-2.5">
                    <div className="flex flex-col items-center pt-1 flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${isIn ? "bg-[#19a589]" : isAdj ? "bg-blue-400" : "bg-orange-400"}`} />
                      {i < movements.slice(0, 5).length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[14px]" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-0.5">
                      <p className="text-[12px] text-[#1e2939] truncate" style={{ fontWeight: 600 }}>
                        {isIn ? "รับ" : isAdj ? "ปรับ Stock" : "ขาย"} {mv.productName}
                      </p>
                      <p className="text-[11px] text-gray-400">{mv.date} · {mv.ref || "—"}</p>
                    </div>
                    <span
                      className="text-[12px] flex-shrink-0 transition-opacity duration-150 group-hover/mv:opacity-0"
                      style={{ fontWeight: 700, color: isIn ? "#19a589" : isAdj ? "#3b82f6" : "#f97316" }}
                    >
                      {isIn ? "+" : ""}{mv.qty > 0 && !isIn ? "-" : ""}{Math.abs(mv.qty)} ชิ้น
                    </span>
                    {/* per-row actions (โผล่ตอน hover) */}
                    <div className="flex items-center gap-1 flex-shrink-0 -ml-6 opacity-0 group-hover/mv:opacity-100 group-hover/mv:ml-0 transition-all duration-150">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditMovement(mv); }}
                        title="แก้ไข"
                        className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200"
                        style={{ background: "transparent", color: "#b0bec5" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.15)"; (e.currentTarget as HTMLElement).style.color = "#3b82f6"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#b0bec5"; }}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteMovement(mv); }}
                        title="ลบ"
                        className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200"
                        style={{ background: "transparent", color: "#b0bec5" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#b0bec5"; }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <ProductModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditTarget(null); }}
        onSave={handleSaveProduct}
        editing={editTarget}
      />
      <ReceiveModal
        open={!!receiveTarget}
        onClose={() => setReceiveTarget(null)}
        onSave={handleReceive}
        product={receiveTarget}
      />
      <POModal
        open={poOpen}
        onClose={() => { setPoOpen(false); setPoInitItems(undefined); }}
        onSave={handleSavePO}
        products={products}
        initialItems={poInitItems}
      />
      <StockMovementModal
        open={movementOpen || !!editMovement}
        onClose={() => { setMovementOpen(false); setEditMovement(null); }}
        onSave={handleSaveMovement}
        products={products.filter((p) => p.type === "stock")}
        editing={editingForModal}
      />
      <StockHistoryModal
        open={!!historyTarget}
        product={historyTarget}
        movements={movements}
        onClose={() => setHistoryTarget(null)}
        onOrder={() => {
          if (historyTarget) {
            setHistoryTarget(null);
            setPoInitItems([{ productId: historyTarget.id, productName: historyTarget.name, unit: historyTarget.unit, qty: historyTarget.minStock, costPerUnit: historyTarget.costPrice }]);
            setPoOpen(true);
          }
        }}
      />
      </div>
    </div>
  );
}
