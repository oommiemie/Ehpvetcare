import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Package, Download, AlertTriangle,
  Edit2, Trash2, X, ChevronLeft, ChevronRight,
  ArrowDownToLine, History, RefreshCw, FileDown,
  ShoppingBag, TrendingUp, TrendingDown, MoreHorizontal,
  Warehouse, Bell, ClipboardList, Upload, Camera,
  ClipboardCheck, Truck, Check, Clock, Ban,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useSnackbar } from "../contexts/SnackbarContext";

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
const INIT_PRODUCTS: StockProduct[] = [
  { id:1,  code:"TRT-001", name:"ขนม Milk-Bone",            barcode:"8851234000011", category:"อาหาร/ขนม",  categoryEmoji:"🍖", type:"stock",   sellPrice:49,  costPrice:28,  unit:"ชิ้น",  stock:4,  minStock:10, maxStock:100, location:"ชั้น A แถว 1", supplier:"Pet Supply Co.", image:"", note:"",       active:true },
  { id:2,  code:"FOOD-012",name:"Royal Canin Adult 3kg",    barcode:"8851234000022", category:"อาหาร/ขนม",  categoryEmoji:"🍖", type:"stock",   sellPrice:890, costPrice:620, unit:"ถุง",   stock:18, minStock:5,  maxStock:50,  location:"ชั้น A แถว 2", supplier:"Royal Canin TH", image:"", note:"",       active:true },
  { id:3,  code:"GRM-865", name:"แปรงขน Furminator",        barcode:"8851234000033", category:"Grooming",   categoryEmoji:"✂️",  type:"stock",   sellPrice:350, costPrice:210, unit:"ชิ้น",  stock:9,  minStock:3,  maxStock:30,  location:"ชั้น B แถว 1", supplier:"Grooming Pro",   image:"", note:"",       active:true },
  { id:4,  code:"VIT-888", name:"วิตามิน C 60 เม็ด",        barcode:"8851234000044", category:"ยา/วิตามิน", categoryEmoji:"💊", type:"stock",   sellPrice:180, costPrice:90,  unit:"กล่อง", stock:22, minStock:10, maxStock:60,  location:"ตู้ยา A",     supplier:"MedPet TH",      image:"", note:"",       active:true },
  { id:5,  code:"TOY-001", name:"ลูกบอลยาง S",              barcode:"8851234000055", category:"ของเล่น",   categoryEmoji:"🎾", type:"stock",   sellPrice:89,  costPrice:45,  unit:"ลูก",   stock:3,  minStock:10, maxStock:50,  location:"ชั้น C แถว 1", supplier:"FunPet",          image:"", note:"",       active:true },
  { id:6,  code:"ACC-B13", name:"สายจูง Leather Premium",   barcode:"8851234000066", category:"อุปกรณ์",   categoryEmoji:"🛠️",  type:"stock",   sellPrice:450, costPrice:280, unit:"เส้น",  stock:0,  minStock:5,  maxStock:20,  location:"ชั้น B แถว 3", supplier:"PetLeather Co",   image:"", note:"",       active:true },
  { id:7,  code:"ACC-M72", name:"ชามอาหาร M",               barcode:"8851234000077", category:"อุปกรณ์",   categoryEmoji:"🥣",  type:"stock",   sellPrice:590, costPrice:320, unit:"ใบ",    stock:5,  minStock:3,  maxStock:20,  location:"ชั้น B แถว 2", supplier:"PetHome",         image:"", note:"",       active:true },
  { id:8,  code:"FOOD-B22",name:"Whiskas 1.2kg (แมว)",      barcode:"8851234000088", category:"อาหาร/ขนม",  categoryEmoji:"🐱", type:"stock",   sellPrice:320, costPrice:195, unit:"ถุง",   stock:12, minStock:5,  maxStock:40,  location:"ชั้น A แถว 3", supplier:"Mars Petcare",    image:"", note:"",       active:true },
  { id:9,  code:"MED-022", name:"แอมม็อกซิซิลลิน 250mg",   barcode:"8851234000099", category:"ยา/วิตามิน", categoryEmoji:"💊", type:"stock",   sellPrice:120, costPrice:85,  unit:"แผง",   stock:14, minStock:10, maxStock:60,  location:"ตู้ยา B",     supplier:"VetMed",          image:"", note:"",       active:true },
  { id:10, code:"SVC-GR5", name:"ตัดขนพิเศษ (Custom)",      barcode:"",              category:"บริการ",     categoryEmoji:"✂️",  type:"nostock", sellPrice:500, costPrice:0,   unit:"ครั้ง", stock:0,  minStock:0,  maxStock:0,   location:"",             supplier:"",                image:"", note:"บริการตามความต้องการ", active:true },
  { id:11, code:"SVC-T81", name:"บริการรับ-ส่งถึงบ้าน",    barcode:"",              category:"บริการ",     categoryEmoji:"🚗",  type:"nostock", sellPrice:200, costPrice:0,   unit:"เที่ยว",stock:0,  minStock:0,  maxStock:0,   location:"",             supplier:"",                image:"", note:"", active:true },
];

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

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#19a589]/30 focus:border-[#19a589] bg-white";
const labelCls = "block text-xs text-gray-500 mb-1";

// ─── Modal Wrapper ────────────────────────────────────────────────────
function Modal({ open, title, subtitle, onClose, onSave, saveLabel = "บันทึก", canSave = true, children }: {
  open: boolean; title: string; subtitle?: string; onClose: () => void;
  onSave: () => void; saveLabel?: string; canSave?: boolean; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-2xl w-full max-w-lg my-4"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.22)" }}
          >
            {/* header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{title}</h3>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
            {/* footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={onClose} className="px-5 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors" style={{ fontWeight: 500 }}>ยกเลิก</button>
              <button onClick={onSave} disabled={!canSave}
                className="px-5 py-2 rounded-full text-sm text-white transition-all active:scale-95 disabled:opacity-40"
                style={{ fontWeight: 600, background: canSave ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#9ca3af", boxShadow: canSave ? "0 2px 10px rgba(25,165,137,0.3)" : undefined }}>
                {saveLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
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
      onClose={onClose}
      onSave={() => onSave({
        productId: product.id, productName: product.name, type: "in",
        qty, costPerUnit: cost,
        date: new Date(date).toLocaleDateString("th-TH", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }),
        ref: po, supplier, lot, note,
      })}
      saveLabel="✓ รับเข้า Stock"
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
    { name: "Stock ปกติ",   value: ok,   color: "#19a589" },
    { name: "ใกล้หมด",      value: low,  color: "#f59e0b" },
    { name: "ขาด Stock",    value: out,  color: "#ef4444" },
    { name: "ไม่ใช้ Stock", value: nosvc,color: "#a78bfa" },
  ].filter(d => d.value > 0);

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex-shrink-0" style={{ width: 80, height: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart id="stock-donut-chart">
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={26} outerRadius={38} strokeWidth={2} stroke="#fff">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
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

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="po-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
        style={{ background: "rgba(0,0,0,0.45)" }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          key="po-card"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ duration: 0.22 }}
          className="bg-white rounded-2xl w-full max-w-2xl my-4 overflow-hidden flex flex-col"
          style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.22)", maxHeight: "90vh" }}
        >
          {/* header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f0fdf9] flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-[18px] h-[18px] text-[#19a589]" />
              </div>
              <div>
                <h3 className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>ใบสั่งซื้อสินค้า (PO)</h3>
                <p className="text-xs text-gray-400 mt-0.5">Purchase Order — จัดการการสั่งซื้อ</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* tabs */}
          <div className="flex border-b border-gray-100 px-6 bg-gray-50/40 flex-shrink-0">
            {(["new", "history"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm transition-all border-b-2 -mb-px ${
                  tab === t ? "border-[#19a589] text-[#19a589]" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
                style={{ fontWeight: tab === t ? 700 : 400 }}
              >
                {t === "new" ? "สร้าง PO ใหม่" : `ประวัติ PO (${pos.length})`}
              </button>
            ))}
          </div>

          {/* ── New PO ── */}
          {tab === "new" && (
            <>
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                <button onClick={onClose}
                  className="px-5 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  style={{ fontWeight: 500 }}>
                  ยกเลิก
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { handleSave("draft"); }}
                    disabled={!canSave}
                    className="px-5 py-2 rounded-full text-sm border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    style={{ fontWeight: 600 }}>
                    บันทึกร่าง
                  </button>
                  <button
                    onClick={() => { handleSave("sent"); onClose(); }}
                    disabled={!canSave}
                    className="px-5 py-2 rounded-full text-sm text-white disabled:opacity-40 active:scale-95 transition-all"
                    style={{
                      fontWeight: 600,
                      background: canSave ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#9ca3af",
                      boxShadow: canSave ? "0 2px 10px rgba(25,165,137,0.3)" : undefined,
                    }}>
                    ✓ ส่ง PO ให้ Supplier
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── PO History ── */}
          {tab === "history" && (
            <div className="overflow-y-auto flex-1">
              {pos.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">ยังไม่มีประวัติ PO</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pos.map(po => {
                    const cfg = PO_STATUS_CFG[po.status];
                    const StatusIcon = cfg.Icon;
                    const poTotal = po.items.reduce((s, it) => s + it.qty * it.costPerUnit, 0);
                    return (
                      <div key={po.id} className="px-6 py-4 hover:bg-gray-50/60 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-[#1e2939] font-mono" style={{ fontWeight: 700 }}>{po.poNumber}</span>
                              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${cfg.cls}`} style={{ fontWeight: 600 }}>
                                <StatusIcon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{po.supplier} · {po.deliveryMethod}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {po.items.map((it, i) => (
                                <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {it.productName} ×{it.qty}
                                </span>
                              ))}
                            </div>
                            {po.note && (
                              <p className="text-[11px] text-gray-400 mt-1.5 italic">"{po.note}"</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base text-[#1e2939]" style={{ fontWeight: 700 }}>฿{poTotal.toLocaleString()}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{po.orderDate}</p>
                            {po.expectedDate && (
                              <p className="text-[11px] text-gray-400">นัด {po.expectedDate}</p>
                            )}
                            {po.status !== "received" && po.status !== "cancelled" && (
                              <button
                                className="mt-2 text-[11px] text-[#19a589] border border-[#19a589]/30 px-2.5 py-1 rounded-full hover:bg-[#f0fdf9] transition-colors"
                                style={{ fontWeight: 600 }}
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
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export function Stock() {
  const { showSnackbar } = useSnackbar();
  const [products, setProducts]     = useState<StockProduct[]>(INIT_PRODUCTS);
  const [movements, setMovements]   = useState<StockMovement[]>(INIT_MOVEMENTS);
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

  return (
    <div className="p-6 min-h-full" style={{ background: "#FEFBF8" }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700, fontSize: 20 }}>จัดการ Stock คลังสินค้า</h1>
          <p className="text-xs text-gray-400 mt-0.5">ติดตามและบริหารสินค้าคงเหลือ</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 h-9 rounded-full text-sm border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-colors" style={{ fontWeight: 500 }}>
            <Bell className="w-3.5 h-3.5" />
            ปรับการแจ้งเตือนไว
          </button>
          <button
            onClick={() => { setPoInitItems(undefined); setPoOpen(true); }}
            className="flex items-center gap-1.5 px-4 h-9 rounded-full text-sm border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            ใบสั่งซื้อ (PO)
          </button>
          <button className="flex items-center gap-1.5 px-4 h-9 rounded-full text-sm border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-colors" style={{ fontWeight: 500 }}>
            <FileDown className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={() => { setEditTarget(null); setAddOpen(true); }}
            className="flex items-center gap-1.5 px-4 h-9 rounded-full text-white text-sm flex-shrink-0 transition-opacity hover:opacity-90 active:opacity-80"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 2px 10px rgba(25,165,137,0.3)" }}
          >
            <Plus className="w-4 h-4" />
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {([
          {
            label: "จำนวนทั้งหมด",
            value: products.length,
            sub: `Stock ${products.filter(p=>p.type==="stock").length} + บริการ ${products.filter(p=>p.type==="nostock").length}`,
            grad: "linear-gradient(154deg,#19a589,#0d7c66)",
            svgPath: "M19.6364 9.99146C19.6364 15.4011 15.2374 19.8097 9.81818 19.8097C4.40856 19.8097 -2.84529e-07 15.4011 -2.84529e-07 9.99146C-2.84529e-07 4.57221 4.40856 0.17328 9.81818 0.17328C15.2374 0.17328 19.6364 4.57221 19.6364 9.99146ZM10.1744 10.3091V15.6321C10.2128 15.6224 10.2417 15.6032 10.2706 15.584L14.3423 13.2641C14.8042 12.985 15.0834 12.7155 15.0834 11.9647V7.92194C15.0834 7.77755 15.0738 7.64279 15.0353 7.52729L10.1744 10.3091ZM4.57219 7.92194V11.9647C4.57219 12.7155 4.82246 12.985 5.29411 13.2641L9.35615 15.584C9.39465 15.6032 9.42353 15.6224 9.46203 15.6321V10.3091L4.60107 7.52729C4.57219 7.64279 4.57219 7.77755 4.57219 7.92194ZM5.22673 6.71873C5.1016 6.77649 5.00534 6.84387 4.93797 6.92087L9.81818 9.69306L12.0321 8.43211L7.13262 5.63103L5.22673 6.71873ZM8.88449 4.62996L7.82566 5.22675L12.7541 8.02782L14.6984 6.92087C14.6311 6.84387 14.5251 6.77649 14.4096 6.71873L10.7615 4.62996C10.4438 4.44708 10.1262 4.35082 9.81818 4.35082C9.51978 4.35082 9.20214 4.44708 8.88449 4.62996Z",
          },
          {
            label: "มูลค่าสินค้า",
            value: `฿${totalValue.toLocaleString()}`,
            sub: "ราคาทุนรวม",
            grad: "linear-gradient(154deg,#43a047,#2e7d32)",
            svgPath: "M19.6364 9.99146C19.6364 15.4011 15.2374 19.8097 9.81818 19.8097C4.40856 19.8097 -2.84529e-07 15.4011 -2.84529e-07 9.99146C-2.84529e-07 4.57221 4.40856 0.17328 9.81818 0.17328C15.2374 0.17328 19.6364 4.57221 19.6364 9.99146ZM9.49091 4.67809V5.52515C8.02781 5.65028 6.7861 6.5166 6.7861 7.94119C6.7861 9.42355 8.02781 9.98183 9.25027 10.2706L9.49091 10.338V13.3412C8.63423 13.2641 8.02781 12.8985 7.71978 12.0609C7.59465 11.7626 7.43101 11.6278 7.16149 11.6278C6.87273 11.6278 6.63209 11.83 6.63209 12.1476C6.63209 12.2535 6.65134 12.3497 6.68984 12.4653C7.03636 13.6588 8.2877 14.2267 9.49091 14.323V15.1893C9.49091 15.3626 9.63529 15.5166 9.81818 15.5166C10.0011 15.5166 10.1455 15.3626 10.1455 15.1893V14.323C11.6952 14.2267 13.0043 13.4471 13.0043 11.8396C13.0043 10.3476 11.8011 9.77007 10.4535 9.45242L10.1455 9.38504V6.50697C10.954 6.5936 11.522 7.0075 11.7626 7.74868C11.8588 8.04708 12.0514 8.20109 12.3209 8.20109C12.5711 8.20109 12.8599 8.03745 12.8599 7.69092C12.8599 6.50697 11.4738 5.65028 10.1455 5.52515V4.67809C10.1455 4.50483 10.0011 4.35082 9.81818 4.35082C9.63529 4.35082 9.49091 4.50483 9.49091 4.67809ZM10.2417 10.5113C11.108 10.723 11.8973 11.0407 11.8973 11.9262C11.8973 12.908 11.0502 13.2835 10.1455 13.3508V10.4824L10.2417 10.5113ZM9.49091 9.23103L9.42353 9.21178C8.59572 9.00964 7.90267 8.64387 7.90267 7.85456C7.90267 7.03638 8.67273 6.61285 9.49091 6.50697V9.23103Z",
          },
          {
            label: "Stock ใกล้หมด",
            value: lowItems.length,
            sub: "ต้องสั่งเพิ่ม",
            grad: "linear-gradient(154deg,#e8802a,#d06a1a)",
            svgPath: "M12.0068 2.3245L19.2802 14.9967C19.5144 15.4091 19.6457 15.8684 19.6457 16.3089C19.6457 17.743 18.6803 18.849 17.0868 18.849H2.55882C0.965414 18.849 4.62145e-08 17.743 4.62145e-08 16.3089C4.62145e-08 15.8684 0.112476 15.4185 0.365544 14.9967L7.63894 2.3245C8.11697 1.47157 8.96053 1.04041 9.82287 1.04041C10.6851 1.04041 11.5194 1.47157 12.0068 2.3245ZM8.78245 14.7249C8.78245 15.2779 9.26984 15.7278 9.83218 15.7278C10.3852 15.7278 10.8726 15.2873 10.8726 14.7249C10.8726 14.1531 10.3946 13.7126 9.83218 13.7126C9.26047 13.7126 8.78245 14.1626 8.78245 14.7249ZM8.94179 6.71104L9.06364 11.8099C9.073 12.3067 9.34482 12.5878 9.83218 12.5878C10.2915 12.5878 10.5633 12.316 10.5727 11.8099L10.7133 6.72042C10.7227 6.22365 10.329 5.8581 9.82287 5.8581C9.29796 5.8581 8.93241 6.21427 8.94179 6.71104Z",
          },
          {
            label: "ขาด Stock",
            value: outItems.length,
            sub: "หมดแล้ว",
            grad: "linear-gradient(154deg,#e53935,#c62828)",
            svgPath: "M12.0068 2.3245L19.2802 14.9967C19.5144 15.4091 19.6457 15.8684 19.6457 16.3089C19.6457 17.743 18.6803 18.849 17.0868 18.849H2.55882C0.965414 18.849 4.62145e-08 17.743 4.62145e-08 16.3089C4.62145e-08 15.8684 0.112476 15.4185 0.365544 14.9967L7.63894 2.3245C8.11697 1.47157 8.96053 1.04041 9.82287 1.04041C10.6851 1.04041 11.5194 1.47157 12.0068 2.3245ZM8.78245 14.7249C8.78245 15.2779 9.26984 15.7278 9.83218 15.7278C10.3852 15.7278 10.8726 15.2873 10.8726 14.7249C10.8726 14.1531 10.3946 13.7126 9.83218 13.7126C9.26047 13.7126 8.78245 14.1626 8.78245 14.7249ZM8.94179 6.71104L9.06364 11.8099C9.073 12.3067 9.34482 12.5878 9.83218 12.5878C10.2915 12.5878 10.5633 12.316 10.5727 11.8099L10.7133 6.72042C10.7227 6.22365 10.329 5.8581 9.82287 5.8581C9.29796 5.8581 8.93241 6.21427 8.94179 6.71104Z",
          },

        ] as const).map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-4 relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group"
            style={{ background: s.grad, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
          >
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-200 group-hover:scale-110"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                <svg className="w-5 h-5" viewBox="0 0 19.9925 19.9925" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d={s.svgPath} fill="rgba(255,255,255,0.9)" />
                </svg>
              </div>
              <div className="text-[11px] text-white/60 mb-1" style={{ fontWeight: 500, letterSpacing: "0.02em" }}>{s.label}</div>
              <span className="text-[26px] text-white" style={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Alert Banner ── */}
      {(lowItems.length + outItems.length) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-[#fff5f5] border border-red-200 rounded-2xl px-4 py-3 mb-5"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700" style={{ fontWeight: 700 }}>
              {lowItems.length + outItems.length} รายการต้องสั่งซื้อเพิ่มเติม — Stock ต่ำกว่าค่าต่ำสุด
            </p>
            <div className="flex gap-2 flex-wrap mt-1.5">
              {[...outItems, ...lowItems].slice(0, 5).map(p => (
                <span key={p.id} className="text-[11px] bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                  {p.name} {p.stock === 0 ? "• หมด 0 ชิ้น" : `• เหลือ ${p.stock} ${p.unit}`}
                </span>
              ))}
            </div>
          </div>
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
            className="flex items-center gap-1.5 px-4 h-8 rounded-full text-white text-xs flex-shrink-0"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)" }}
          >
            สร้าง PO ทันที
          </button>
        </motion.div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* ─ Table Panel ─ */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="ค้นหาสินค้า, SKU, บาร์โค้ด..."
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm w-56 focus:outline-none focus:border-[#19a589] bg-[#fafafa]"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATS.map(c => (
                <button
                  key={c}
                  onClick={() => { setCatFilter(c); setPage(1); }}
                  className={`px-3 h-8 rounded-full text-xs transition-all ${catFilter === c
                    ? "text-white shadow-sm"
                    : "text-gray-500 border border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  style={catFilter === c ? { fontWeight: 700, background: "linear-gradient(135deg,#19a589,#0d7c66)" } : { fontWeight: 500 }}
                >
                  {c === "ทั้งหมด" ? `ทั้งหมด (${products.length})` : c}
                </button>
              ))}
            </div>
            <button
              onClick={() => { const p = products.find(p => p.type === "stock"); if (p) setReceiveTarget(p); }}
              className="ml-auto flex items-center gap-1.5 px-3 h-8 rounded-full text-xs border border-gray-200 bg-white text-gray-600 hover:border-[#19a589] hover:text-[#19a589] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              รับสินค้า
            </button>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-gray-100">
                  {["สินค้า","ประเภท","หมวดหมู่","ราคาขาย","ราคาทุน","STOCK","แจ้งเตือน","สถานะ","จัดการ"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left" style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map(p => {
                  const s = stockStatus(p);
                  return (
                    <tr key={p.id} className={`transition-colors hover:bg-[#fafff9] ${s === "low" ? "bg-[#fffbf5]" : s === "out" ? "bg-[#fff9f9]" : ""}`}>
                      {/* product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg border border-gray-100 bg-gray-50 overflow-hidden">
                            {p.image
                              ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              : <span>{p.categoryEmoji}</span>
                            }
                          </div>
                          <div>
                            <p className="text-[13px] text-[#1e2939]" style={{ fontWeight: 600 }}>{p.name}</p>
                            <p className="text-[10.5px] text-gray-400 font-mono">{p.code}</p>
                          </div>
                        </div>
                      </td>
                      {/* type */}
                      <td className="px-4 py-3 whitespace-nowrap"><TypeBadge type={p.type} /></td>
                      {/* category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{p.categoryEmoji} {p.category}</span>
                      </td>
                      {/* sell price */}
                      <td className="px-4 py-3 text-[13px] text-[#1e2939] whitespace-nowrap" style={{ fontWeight: 600 }}>฿{p.sellPrice.toLocaleString()}</td>
                      {/* cost */}
                      <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">฿{p.costPrice > 0 ? p.costPrice.toLocaleString() : "—"}</td>
                      {/* stock bar */}
                      <td className="px-4 py-3"><StockBar product={p} /></td>
                      {/* min stock */}
                      <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">
                        {p.type === "stock" ? `≤${p.minStock}` : "—"}
                      </td>
                      {/* status */}
                      <td className="px-4 py-3 whitespace-nowrap"><StockStatusBadge product={p} /></td>
                      {/* actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {p.type === "stock" && (
                            <button
                              onClick={() => setReceiveTarget(p)}
                              title="รับสินค้าเข้า"
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:border-[#19a589] hover:bg-[#f0fdf9] text-gray-400 hover:text-[#19a589] transition-colors"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => { setEditTarget(p); setAddOpen(true); }}
                            title="แก้ไข"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => showSnackbar("info", `ประวัติ: ${p.name}`)}
                            title="ประวัติ"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="ลบ"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:border-red-400 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
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
              <div className="py-12 text-center text-sm text-gray-400">ไม่พบรายการสินค้า</div>
            )}
          </div>

          {/* pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">แสดง {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#19a589] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs transition-colors ${page === n ? "text-white border-0" : "border border-gray-200 text-gray-500 hover:border-[#19a589]"}`}
                  style={page === n ? { background: "linear-gradient(135deg,#19a589,#0d7c66)", fontWeight: 700 } : { fontWeight: 500 }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#19a589] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
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
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#19a589]" /><span className="text-[11px] text-gray-500">รับเข้า</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /><span className="text-[11px] text-gray-500">จ่ายออก</span></div>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={SEVEN_DAY} barCategoryGap="25%" id="stock-7day-bar">
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  />
                  <Bar dataKey="รับเข้า" fill="#19a589" radius={[3,3,0,0]} />
                  <Bar dataKey="จ่ายออก" fill="#f59e0b" radius={[3,3,0,0]} />
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
                  <div key={mv.id} className="flex items-start gap-3 px-4 py-2.5">
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
                      className="text-[12px] flex-shrink-0"
                      style={{ fontWeight: 700, color: isIn ? "#19a589" : isAdj ? "#3b82f6" : "#f97316" }}
                    >
                      {isIn ? "+" : ""}{mv.qty > 0 && !isIn ? "-" : ""}{Math.abs(mv.qty)} ชิ้น
                    </span>
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
    </div>
  );
}
