import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Package, Download, AlertTriangle,
  Edit2, Trash2, Pencil, X, ChevronLeft, ChevronRight, ChevronDown,
  ArrowDownToLine, History, RefreshCw, FileDown,
  ShoppingBag, TrendingUp, TrendingDown, MoreHorizontal,
  Warehouse, Bell, ClipboardList, Upload, Camera,
  ClipboardCheck, Truck, Check, Clock, Ban, BarChart2, Receipt, Printer, PackageOpen,
  Sparkles, Loader2,
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
import { extractPoFromImage, fileToDataUrl } from "../lib/aiExtract";

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
  // ── ฟอร์มเพิ่มสินค้าใหม่ (wizard) — optional, ไม่กระทบโค้ดเดิม ──
  genericName?: string;   // ชื่อยา (Generic)
  tradeName?: string;     // ชื่อการค้า (Trade)
  drugClass?: string;     // ประเภทยา (ยาอันตราย / ควบคุมพิเศษ / ฯลฯ)
  drugGroup?: string;     // กลุ่มยา (ตามการรักษา)
  dosageForm?: string;    // รูปแบบยา (เม็ด/แคปซูล/…)
  baseUnit?: string;      // หน่วยนับพื้นฐาน
  units?: ProductUnit[];  // หน่วยบรรจุหลายชั้น
  reorderQty?: number;    // จำนวนสั่งซื้อต่อครั้ง
  images?: string[];      // รูปสินค้า (สูงสุด 4 · รูปแรก = ปก, sync กับ image)
}

interface ProductUnit {
  id: string;
  name: string;         // ชื่อหน่วยนับ เช่น แผง, กล่อง
  qty: number;          // จำนวนหน่วยพื้นฐานต่อหน่วยนี้
  barcode: string;      // Barcode ตามหน่วยบรรจุ
  price: number;        // ราคาจำหน่าย/หน่วย
  refPrice?: number;    // ราคาอ้างอิง
  centralPrice?: number;// ราคากลาง
  active?: boolean;      // เปิดใช้งาน
  defaultPO?: boolean;   // ใช้เป็นค่าเริ่มต้นออกใบสั่งซื้อ
  standard: boolean;     // หน่วยขายหลัก (ปก)
  priceTiers?: PriceTier[]; // การคิดราคาตามจำนวน (ขั้นบันได)
}

interface PriceTier {
  id: string;
  memberLevel: string;  // ระดับสมาชิก
  qtyFrom: number;      // จำนวนเริ่มต้น
  qtyTo: number;        // จำนวนสิ้นสุด
  unitPrice: number;    // ราคาต่อหน่วย
}

// ─── PO Types ────────────────────────────────────────────────────────
interface POItem {
  productId: number;
  productName: string;
  unit: string;             // ชื่อหน่วยจ่าย (Stock) — หน่วยที่ใช้รับสินค้าเข้าคลัง
  packUnit?: string;        // หน่วยบรรจุในการสั่งซื้อ (กล่อง/ลัง/แพ็ค ฯลฯ)
  qty: number;              // จำนวนสั่งซื้อ (ตามหน่วยบรรจุ)
  costPerUnit: number;
  discount?: number;        // ส่วนลดต่อรายการ (฿ ทั้งบรรทัด)
  receivedQty?: number;     // จำนวนที่รับเข้าคลังสะสมแล้ว
}

/* บันทึกการรับสินค้า 1 ครั้ง — PO หนึ่งใบรับได้หลายครั้งจนครบ */
interface POReceipt {
  id: number;
  date: string;                              // ISO
  note?: string;
  items: { idx: number; qty: number; cost?: number; lot?: string; expiry?: string }[];   // idx อ้างตำแหน่งใน po.items · cost/lot/expiry ตอนรับจริง
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  deliveryMethod: string;
  storeRoom?: string;
  taxType?: TaxType;
  billDiscount?: number;                     // ส่วนลดท้ายบิล
  billDiscountType?: "baht" | "percent";     // หน่วยส่วนลดท้ายบิล
  items: POItem[];
  note: string;
  status: "draft" | "sent" | "waiting" | "partial" | "received" | "cancelled";
  receipts?: POReceipt[];                    // ประวัติการรับสินค้า
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
  expiry?: string;   // วันหมดอายุ (ISO) ของล็อตที่รับเข้า
}

// ─── Mock Data ────────────────────────────────────────────────────────
// หมายเหตุ: INIT_PRODUCTS ถูกย้ายไปใน ClinicDataContext (INIT_STOCK_PRODUCTS) แล้ว
//           Stock() component ดึงข้อมูลจาก useClinicData().stockProducts โดยตรง

const INIT_MOVEMENTS: StockMovement[] = [
  { id:1, productId:2,  productName:"PUREPUP อาหารสุนัข สูตรไก่ 1.5kg", type:"in",     qty:24, costPerUnit:320, date:"6 ก.ค. 10:30", ref:"PO-2569-0028", supplier:"PurePup TH", lot:"LOT-690706", note:"" },
  { id:2, productId:2,  productName:"PUREPUP อาหารสุนัข สูตรไก่ 1.5kg", type:"out",    qty:1,  costPerUnit:320, date:"7 ก.ค. 16:22", ref:"INV-O089",     supplier:"",           lot:"",          note:"ขาย POS" },
  { id:3, productId:1,  productName:"Complete Nutrition อาหารแมวสูตรครบถ้วน 2kg", type:"adjust", qty:-2, costPerUnit:430, date:"7 ก.ค. 09:00", ref:"ADJ-001",  supplier:"",           lot:"",          note:"ปรับยอด" },
  { id:4, productId:2,  productName:"PUREPUP อาหารสุนัข สูตรไก่ 1.5kg", type:"out",    qty:3,  costPerUnit:320, date:"7 ก.ค. 16:00", ref:"INV-O088",     supplier:"",           lot:"",          note:"ขาย POS" },
  { id:5, productId:21, productName:"PURR CARE อาหารเสริมแมว",           type:"in",     qty:20, costPerUnit:300, date:"5 ก.ค. 14:00", ref:"PO-2569-0027", supplier:"MedPet TH",  lot:"LOT-690705", note:"" },
];

/* วันที่แบบ ISO ย้อนหลัง n วันจากวันนี้ — ให้ทะเบียนใบสั่งซื้อกรองช่วงวันที่ได้จริง */
const isoDaysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0]; };
/** แสดงวันที่ ISO เป็นไทยสั้น (รองรับข้อความเดิมที่ไม่ใช่ ISO) */
const fmtPoDate = (s?: string) => {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
};
/** สรุปยอดใบ PO: มูลค่าสินค้า/ส่วนลดรายการ/ส่วนลดท้ายบิล/ก่อน VAT/VAT/สุทธิ */
const poTotals = (po: PurchaseOrder) => {
  const gross = po.items.reduce((s, it) => s + it.qty * it.costPerUnit, 0);
  const itemDisc = po.items.reduce((s, it) => s + Math.min(it.discount || 0, it.qty * it.costPerUnit), 0);
  const afterItems = gross - itemDisc;
  const billDisc = po.billDiscountType === "percent"
    ? afterItems * Math.min(po.billDiscount || 0, 100) / 100
    : Math.min(po.billDiscount || 0, afterItems);
  const sub = afterItems - billDisc;
  const vat = po.taxType === "exclude" ? sub * VAT_RATE : po.taxType === "include" ? sub - sub / (1 + VAT_RATE) : 0;
  const base = po.taxType === "include" ? sub - vat : sub;
  const total = po.taxType === "exclude" ? sub + vat : sub;
  return { gross, itemDisc, billDisc, base, vat, total };
};

const INIT_POS: PurchaseOrder[] = [
  {
    id: 1, poNumber: "PO-2025-0029", supplier: "PetLeather Co",
    orderDate: isoDaysAgo(2), expectedDate: isoDaysAgo(-3),
    deliveryMethod: "ขนส่งทั่วไป", storeRoom: "คลังหลัก (Main)", taxType: "exclude",
    status: "waiting", note: "",
    items: [
      { productId: 8,  productName: "PAWDER สายจูงสุนัข พรีเมียม", unit: "เส้น", packUnit: "แพ็ค", qty: 5, costPerUnit: 230, discount: 100, receivedQty: 0 },
      { productId: 20, productName: "สายจูง+ฮาร์เนสแมว",           unit: "ชุด",  packUnit: "ถุง",  qty: 6, costPerUnit: 180, receivedQty: 0 },
    ],
  },
  {
    id: 2, poNumber: "PO-2569-0028", supplier: "PurePup TH",
    orderDate: isoDaysAgo(6), expectedDate: isoDaysAgo(-1),
    deliveryMethod: "Kerry Express", storeRoom: "คลังหลัก (Main)", taxType: "include",
    status: "partial", note: "",
    items: [
      { productId: 2, productName: "PUREPUP อาหารสุนัข สูตรไก่ 1.5kg", unit: "ถุง",  packUnit: "ลัง",   qty: 24, costPerUnit: 320, receivedQty: 12 },
      { productId: 9, productName: "แปรงสางขนสัตว์ ขนนุ่ม",           unit: "ชิ้น", packUnit: "กล่อง", qty: 6,  costPerUnit: 120, receivedQty: 6 },
    ],
    receipts: [
      { id: 1, date: isoDaysAgo(1), note: "รอบแรก — ส่งมาไม่ครบ", items: [{ idx: 0, qty: 12 }, { idx: 1, qty: 6 }] },
    ],
  },
  {
    id: 3, poNumber: "PO-2569-0027", supplier: "VetMed",
    orderDate: isoDaysAgo(14), expectedDate: isoDaysAgo(10),
    deliveryMethod: "ขนส่งทั่วไป", storeRoom: "คลังยา/เวชภัณฑ์ (Pharmacy)", taxType: "exclude",
    status: "received", note: "ขอใบกำกับภาษีด้วย",
    items: [
      { productId: 26, productName: "น้ำยากำจัดเห็บหมัด สุนัข-แมว", unit: "ขวด", packUnit: "กล่อง", qty: 20, costPerUnit: 190, receivedQty: 20 },
      { productId: 41, productName: "ยาถ่ายพยาธิ ชนิดน้ำ สัตว์เลี้ยง", unit: "ขวด", packUnit: "กล่อง", qty: 48, costPerUnit: 140, discount: 200, receivedQty: 48 },
    ],
    receipts: [
      { id: 1, date: isoDaysAgo(10), items: [{ idx: 0, qty: 20 }, { idx: 1, qty: 48 }] },
    ],
  },
  {
    id: 4, poNumber: "PO-2569-0026", supplier: "MedPet TH",
    orderDate: isoDaysAgo(24), expectedDate: isoDaysAgo(20),
    deliveryMethod: "ขนส่งทั่วไป", storeRoom: "คลังหลัก (Main)", taxType: "none",
    status: "received", note: "",
    items: [
      { productId: 22, productName: "YAMIN วิตามินรวมสุนัข", unit: "กระปุก", packUnit: "กล่อง", qty: 5, costPerUnit: 350, receivedQty: 5 },
    ],
    receipts: [
      { id: 1, date: isoDaysAgo(20), items: [{ idx: 0, qty: 5 }] },
    ],
  },
  {
    id: 5, poNumber: "PO-2569-0025", supplier: "Pet Supply Co.",
    orderDate: isoDaysAgo(45), expectedDate: isoDaysAgo(41),
    deliveryMethod: "รับเอง", storeRoom: "คลังหลัก (Main)", taxType: "exclude",
    status: "received", note: "",
    items: [
      { productId: 14, productName: "ขนมขัดฟัน Dental Chew", unit: "ถุง", packUnit: "ลัง", qty: 100, costPerUnit: 90, receivedQty: 100 },
    ],
    receipts: [
      { id: 1, date: isoDaysAgo(41), items: [{ idx: 0, qty: 100 }] },
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
const SUPPLIERS = ["Royal Canin TH","Mars Petcare","Pet Supply Co.","VetMed","Grooming Pro","FunPet","PetLeather Co","PetHome","MedPet TH","อื่นๆ"];
const DELIVERY_METHODS = ["ขนส่งทั่วไป","รับเอง","Kerry Express","Flash Express","ไปรษณีย์ไทย"];
// Store Room ที่รับสินค้าเข้า (จาก Stock_department)
const STORE_ROOMS = ["คลังหลัก (Main)","คลังยา/เวชภัณฑ์ (Pharmacy)","คลังหน้าร้าน (Front Store)","คลังอาหารสัตว์ (Food)","คลังอุปกรณ์/Grooming"];
/* หน่วยบรรจุในการสั่งซื้อ */
const PACK_UNITS = ["กล่อง","ลัง","แพ็ค","โหล","ขวด","แกลลอน","ซอง","ถุง","กระปุก","แผง","ชิ้น","เส้น","ใบ"];
/* ชื่อหน่วยจ่าย (Stock) — หน่วยที่ใช้รับสินค้าเข้าคลัง */
const STOCK_UNITS = ["ชิ้น","เม็ด","แคปซูล","ซอง","ขวด","หลอด","ถุง","กล่อง","เส้น","ใบ","แพ็ค","dose","ml"];
// ประเภทการคิดภาษี
type TaxType = "exclude" | "include" | "none";
const TAX_TYPES: { value: TaxType; label: string }[] = [
  { value: "exclude", label: "คิด VAT (แยกนอกราคา)" },
  { value: "include", label: "ราคารวม VAT แล้ว" },
  { value: "none",    label: "ไม่คิด VAT" },
];
const VAT_RATE = 0.07;

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
// ─── ตัวเลือกฟอร์มเพิ่มสินค้า (wizard) ───
const DRUG_CLASSES: { key: string; en: string; color: string }[] = [
  { key: "ยาอันตราย", en: "Dangerous", color: "#ef4444" },
  { key: "ยาควบคุมพิเศษ", en: "Special Control", color: "#8b5cf6" },
  { key: "ยาแผนปัจจุบัน", en: "Modern Medicine", color: "#10b981" },
  { key: "ยาสามัญประจำบ้าน", en: "Household", color: "#10b981" },
  { key: "เวชภัณฑ์", en: "Medical Supply", color: "#3b82f6" },
];
const DRUG_GROUPS = ["ยาแก้ปวด/ลดไข้", "ยาปฏิชีวนะ", "ยาแก้แพ้", "ยาระบบทางเดินอาหาร", "ยาหัวใจ/ความดัน", "วิตามิน/อาหารเสริม", "ยาภายนอก", "อื่นๆ"];
const DOSAGE_FORMS = ["เม็ด", "แคปซูล", "น้ำเชื่อม", "ยาฉีด", "ครีม/ขี้ผึ้ง", "ยาหยอด", "ผง"];
const WIZ_STEPS = [
  { n: 1, label: "ข้อมูลทั่วไป", en: "General" },
  { n: 2, label: "หน่วยบรรจุ", en: "Units" },
  { n: 3, label: "ราคา & สั่งซื้อ", en: "Price" },
  { n: 4, label: "ตรวจสอบ", en: "Review" },
];
const UNIT_NAMES = ["เม็ด", "แคปซูล", "แผง", "กล่อง", "ขวด", "หลอด", "ซอง", "ถุง", "กระปุก", "ไวอัล", "แอมพูล", "ชิ้น", "อัน", "ชุด", "แพ็ค", "ลัง", "โหล", "มล.", "กรัม"];
const MEMBER_LEVELS = ["ลูกค้าทั่วไป", "สมาชิก", "สมาชิก VIP", "ราคาส่ง", "ราคาพนักงาน"];

function ProductModal({ open, onClose, onSave, editing }: {
  open: boolean; onClose: () => void;
  onSave: (p: StockProduct) => void; editing: StockProduct | null;
}) {
  const blank = (): StockProduct => ({
    id: 0, code: `MED-${1000 + Math.floor(Math.random() * 9000)}`, name: "", barcode: "",
    category: "ยา/วิตามิน", categoryEmoji: "💊", type: "stock", sellPrice: 0, costPrice: 0,
    unit: "เม็ด", stock: 0, minStock: 0, maxStock: 0, location: "", supplier: "", image: "", note: "", active: true,
    genericName: "", tradeName: "", drugClass: "ยาอันตราย", drugGroup: DRUG_GROUPS[0], dosageForm: "เม็ด",
    baseUnit: "เม็ด", units: [], reorderQty: 0,
  });
  const hydrate = (p: StockProduct): StockProduct => ({
    ...p,
    genericName: p.genericName ?? p.name, tradeName: p.tradeName ?? "",
    drugClass: p.drugClass ?? "ยาอันตราย", drugGroup: p.drugGroup ?? DRUG_GROUPS[0],
    dosageForm: p.dosageForm ?? "เม็ด", baseUnit: p.baseUnit ?? p.unit ?? "เม็ด",
    units: p.units ?? [], reorderQty: p.reorderQty ?? 0,
    images: p.images ?? (p.image ? [p.image] : []),
  });

  const [form, setForm] = useState<StockProduct>(blank);
  const [step, setStep] = useState(1);
  const [unitDraft, setUnitDraft] = useState<ProductUnit | null>(null);
  const set = <K extends keyof StockProduct>(k: K, v: StockProduct[K]) => setForm(f => ({ ...f, [k]: v }));
  const fileRef = useRef<HTMLInputElement>(null);
  const productImages = form.images ?? (form.image ? [form.image] : []);
  const commitImages = (arr: string[]) => setForm(f => ({ ...f, images: arr, image: arr[0] ?? "" }));
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const room = 4 - productImages.length;
    Promise.all(files.slice(0, room).map(f => new Promise<string>(res => {
      const r = new FileReader(); r.onload = ev => res(ev.target?.result as string); r.readAsDataURL(f);
    }))).then(res => commitImages([...productImages, ...res]));
    e.target.value = "";
  };
  const removeImage = (i: number) => commitImages(productImages.filter((_, idx) => idx !== i));

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) { setStep(1); setForm(editing ? hydrate(editing) : blank()); }
  }

  const units = form.units ?? [];
  const delUnit = (id: string) => set("units", units.filter(u => u.id !== id));
  const setStd = (id: string) => set("units", units.map(u => ({ ...u, standard: u.id === id })));
  const openAddUnit = () => setUnitDraft({ id: `u-${Date.now()}`, name: "", qty: 1, barcode: "", price: 0, refPrice: 0, centralPrice: 0, active: true, defaultPO: units.length === 0, standard: units.length === 0 });
  const openEditUnit = (u: ProductUnit) => setUnitDraft({ ...u });
  const saveUnit = (u: ProductUnit) => {
    const exists = units.some(x => x.id === u.id);
    let next = exists ? units.map(x => x.id === u.id ? u : x) : [...units, u];
    if (u.standard) next = next.map(x => ({ ...x, standard: x.id === u.id })); // มีขายหลักได้ตัวเดียว
    set("units", next);
    setUnitDraft(null);
  };

  const margin = form.sellPrice - form.costPrice;
  const marginPct = form.costPrice > 0 ? (margin / form.costPrice) * 100 : 0;

  const step1Valid = !!(form.genericName ?? "").trim();
  const canNext = step === 1 ? step1Valid : true;

  const finalize = () => {
    const std = units.find(u => u.standard);
    const product: StockProduct = {
      ...form,
      name: (form.genericName || form.name).trim(),
      barcode: std?.barcode || form.barcode,
      unit: form.baseUnit || form.unit,
      category: "ยา/วิตามิน", categoryEmoji: "💊",
    };
    onSave(product);
  };

  const next = () => { if (!canNext) return; step < 4 ? setStep(step + 1) : finalize(); };
  const back = () => setStep(s => Math.max(1, s - 1));

  return (
    <AnimatePresence>
      {open && (
        <>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl w-full max-w-[640px] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="vet-modal-header flex items-center gap-3">
              <div className="vet-modal-header-icon"><Package className="w-5 h-5 text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>{editing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>
                <p className="text-[11px] text-gray-500">บันทึกข้อมูลยา/เวชภัณฑ์เข้าสู่ระบบคลัง · Add New Product</p>
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:inline">รหัสสินค้า <span className="text-[#0d7c66]" style={{ fontWeight: 700 }}>{form.code}</span></span>
              <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
            </div>

            {/* Stepper */}
            <div className="flex items-center px-5 py-3 border-b border-gray-100">
              {WIZ_STEPS.map((s, i) => {
                const done = step > s.n; const active = step === s.n;
                return (
                  <React.Fragment key={s.n}>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 70 }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px]" style={{
                        fontWeight: 700,
                        background: done || active ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#f3f4f6",
                        color: done || active ? "#fff" : "#9ca3af",
                      }}>
                        {done ? <Check className="w-3.5 h-3.5" /> : s.n}
                      </div>
                      <span className="text-[10px] leading-tight text-center" style={{ fontWeight: active ? 700 : 500, color: active ? "#0d7c66" : "#9ca3af" }}>{s.label}</span>
                    </div>
                    {i < WIZ_STEPS.length - 1 && <div className="flex-1 h-0.5 -mt-4 rounded" style={{ background: step > s.n ? "#19a589" : "#e5e7eb" }} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Body */}
            <div className="vet-modal-body space-y-4">
              {/* STEP 1 — ข้อมูลทั่วไป */}
              {step === 1 && (
                <>
                  <div className="vet-divider">ข้อมูลสินค้า</div>
                  {/* รูปสินค้า — สูงสุด 4 รูป · รูปแรก = ปก */}
                  <div>
                    <label className={labelCls}>รูปสินค้า <span className="text-gray-400 normal-case">(สูงสุด 4 รูป · รูปแรก = ปก)</span></label>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                    <div className="flex items-center gap-2 flex-wrap">
                      {productImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 flex-shrink-0">
                          <img src={img} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                          {i === 0 && <span className="absolute bottom-0 inset-x-0 text-[8px] text-white text-center py-0.5 rounded-b-xl" style={{ background: "rgba(13,124,102,0.88)", fontWeight: 700 }}>ปก</span>}
                          <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {productImages.length < 4 && (
                        <button type="button" onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#19a589]/50 hover:text-[#19a589] transition-colors flex-shrink-0">
                          <Camera className="w-4 h-4" /><span className="text-[8px] mt-0.5">เพิ่มรูป</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>ชื่อยา <span className="text-gray-400 normal-case">Generic name</span> <span className="text-red-400">*</span></label>
                      <input className={inputCls} value={form.genericName ?? ""} onChange={e => set("genericName", e.target.value)} placeholder="paracetamol" />
                    </div>
                    <div>
                      <label className={labelCls}>ชื่อการค้า <span className="text-gray-400 normal-case">Trade name</span></label>
                      <input className={inputCls} value={form.tradeName ?? ""} onChange={e => set("tradeName", e.target.value)} placeholder="เช่น Tylenol" />
                    </div>
                  </div>

                  <div className="vet-divider">หมวดหมู่ & รูปแบบยา</div>
                  <div>
                    <label className={labelCls}>ประเภทยา <span className="text-gray-400 normal-case">Category</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {DRUG_CLASSES.map(c => {
                        const on = form.drugClass === c.key;
                        return (
                          <button key={c.key} type="button" onClick={() => set("drugClass", c.key)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] border transition-all"
                            style={{ fontWeight: on ? 700 : 600, borderColor: on ? c.color : "#e5e7eb", background: on ? `${c.color}12` : "#fff", color: on ? c.color : "#6b7280" }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                            {c.key} <span className="text-[9.5px] opacity-60">{c.en}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>กลุ่มยา <span className="text-gray-400 normal-case">(จัดกลุ่มตามการรักษา)</span> <span className="text-red-400">*</span></label>
                      <select className="vet-select" value={form.drugGroup ?? ""} onChange={e => set("drugGroup", e.target.value)}>
                        {DRUG_GROUPS.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>ที่จัดเก็บ <span className="text-gray-400 normal-case">Location</span></label>
                      <input className={inputCls} value={form.location} onChange={e => set("location", e.target.value)} placeholder="เช่น ชั้น A-12, ตู้เย็น 2-8°C" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>รูปแบบยา <span className="text-gray-400 normal-case">Dosage form</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {DOSAGE_FORMS.map(d => (
                        <button key={d} type="button" onClick={() => { set("dosageForm", d); if (!units.length) set("baseUnit", d); }}
                          className={`vet-chip ${form.dosageForm === d ? "vet-chip-active" : ""}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="vet-divider">การตั้งค่า</div>
                  {/* ประเภทสินค้า — มีสต็อก / ไม่ใช้สต็อก */}
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{form.type === "stock" ? "📦" : "∞"}</span>
                      <div>
                        <p className="text-[12.5px] text-gray-800" style={{ fontWeight: 700 }}>{form.type === "stock" ? "สินค้ามีสต็อก (นับจำนวน)" : "ไม่ใช้สต็อก (บริการ/ค่าดำเนินการ)"}</p>
                        <p className="text-[10.5px] text-gray-400">{form.type === "stock" ? "นับจำนวน · แจ้งเตือนสต็อกต่ำ · ออกใบสั่งซื้อได้" : "ไม่นับจำนวนคงเหลือ · ไม่มีจุดสั่งซื้อ"}</p>
                      </div>
                    </div>
                    <button type="button" role="switch" aria-checked={form.type === "stock"} onClick={() => set("type", form.type === "stock" ? "nostock" : "stock")}
                      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0" style={{ background: form.type === "stock" ? "#0d7c66" : "#d1d5db" }}>
                      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: form.type === "stock" ? 22 : 2 }} />
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>หมายเหตุ <span className="text-gray-400 normal-case">Note</span></label>
                    <textarea className="vet-textarea" rows={2} value={form.note} onChange={e => set("note", e.target.value)} placeholder="ข้อบ่งใช้ คำเตือน หรือข้อมูลเพิ่มเติม..." />
                  </div>
                </>
              )}

              {/* STEP 2 — หน่วยบรรจุ */}
              {step === 2 && (
                <>
                  <div>
                    <p className="text-[13px] text-gray-900 mb-0.5" style={{ fontWeight: 700 }}>หน่วยนับและขนาดบรรจุ</p>
                    <p className="text-[11px] text-gray-500 mb-3">กำหนดหน่วยพื้นฐาน แล้วเพิ่มหน่วยบรรจุได้มากกว่า 1</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <label className={labelCls}>หน่วยนับพื้นฐาน <span className="text-gray-400 normal-case">(หน่วยเล็กที่สุด) Base unit</span></label>
                      <input className={inputCls} value={form.baseUnit ?? ""} onChange={e => set("baseUnit", e.target.value)} placeholder="เม็ด" />
                    </div>
                    <p className="text-[10.5px] text-gray-400 max-w-[150px] text-right">สต็อกทั้งหมดจะถูกคำนวณและเก็บเป็นหน่วยพื้นฐานนี้</p>
                  </div>

                  {/* Units summary table */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-[10px] text-gray-500" style={{ fontWeight: 700 }}>
                      <span className="w-4"></span>
                      <span className="flex-1">ชื่อหน่วยนับ · ขนาดบรรจุ</span>
                      <span className="w-20 text-right">ราคาจำหน่าย</span>
                      <span className="w-14 text-center">ขายหลัก</span>
                      <span className="w-14"></span>
                    </div>
                    {units.length === 0 ? (
                      <p className="text-[11px] text-gray-400 text-center py-5">ยังไม่มีหน่วยบรรจุ — กด "เพิ่มหน่วยบรรจุ"</p>
                    ) : units.map(u => (
                      <div key={u.id} className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 hover:bg-gray-50/60">
                        <span className="w-4 flex justify-center" title={u.active === false ? "ปิดใช้งาน" : "เปิดใช้งาน"}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: u.active === false ? "#d1d5db" : "#10b981" }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>
                            {u.name || "—"}
                            {u.defaultPO && <span className="ml-1.5 text-[9px] text-sky-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(2,132,199,0.10)", fontWeight: 700 }}>ออกใบสั่งซื้อ</span>}
                          </p>
                          <p className="text-[10.5px] text-gray-400 truncate">= {u.qty} {form.baseUnit}{u.barcode ? ` · ${u.barcode}` : ""}</p>
                        </div>
                        <span className="w-20 text-right text-[12px] text-gray-700" style={{ fontWeight: 700 }}>฿{(u.price || 0).toFixed(2)}</span>
                        <button type="button" onClick={() => setStd(u.id)} className="w-14 flex justify-center" title="ตั้งเป็นหน่วยขายหลัก">
                          <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: u.standard ? "#0d7c66" : "#d1d5db" }}>
                            {u.standard && <span className="w-2 h-2 rounded-full" style={{ background: "#0d7c66" }} />}
                          </span>
                        </button>
                        <div className="w-14 flex items-center justify-end gap-0.5">
                          <button type="button" onClick={() => openEditUnit(u)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="แก้ไข"><Pencil className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => delUnit(u.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500" title="ลบ"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={openAddUnit} className="w-full py-2 text-[11.5px] text-[#0d7c66] hover:bg-[#19a589]/5 border-t border-gray-100 inline-flex items-center justify-center gap-1.5" style={{ fontWeight: 600 }}>
                      <Plus className="w-3.5 h-3.5" /> เพิ่มหน่วยบรรจุ
                    </button>
                  </div>

                  {/* Conversion display */}
                  {units.some(u => u.name && u.qty) && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                      <p className="text-[11px] text-amber-700 mb-2 inline-flex items-center gap-1" style={{ fontWeight: 700 }}>🔄 ตารางแปลงหน่วย · Unit conversion</p>
                      <div className="flex flex-wrap gap-2">
                        {units.filter(u => u.name && u.qty).map(u => (
                          <span key={u.id} className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] text-gray-700" style={{ fontWeight: 600 }}>
                            1 {u.name} = {u.qty} {form.baseUnit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STEP 3 — ราคา & สั่งซื้อ */}
              {step === 3 && (
                <>
                  <div>
                    <p className="text-[13px] text-gray-900 mb-0.5" style={{ fontWeight: 700 }}>ราคาและจุดสั่งซื้อ</p>
                    <p className="text-[11px] text-gray-500 mb-3">ราคาต่อหน่วยพื้นฐาน ({form.baseUnit}) และการตั้งจุดสั่งซื้ออัตโนมัติ</p>
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div>
                      <label className={labelCls}>ราคาทุน/หน่วย <span className="text-red-400">*</span></label>
                      <input type="number" className={inputCls} value={form.costPrice} onChange={e => set("costPrice", Number(e.target.value))} placeholder="0.00" />
                    </div>
                    <div>
                      <label className={labelCls}>ราคาขาย/หน่วย <span className="text-red-400">*</span></label>
                      <input type="number" className={inputCls} value={form.sellPrice} onChange={e => set("sellPrice", Number(e.target.value))} placeholder="0.00" />
                    </div>
                    <div className="rounded-xl bg-[#19a589]/8 border border-[#19a589]/20 px-3 py-2 text-center min-w-[110px]">
                      <p className="text-[9.5px] text-gray-500">กำไรต่อหน่วย / Margin</p>
                      <p className="text-[15px]" style={{ fontWeight: 800, color: margin >= 0 ? "#0d7c66" : "#dc2626" }}>฿{margin.toFixed(2)} <span className="text-[10px]">{marginPct.toFixed(1)}%</span></p>
                    </div>
                  </div>

                  {form.type === "stock" && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[12px] text-amber-600 mb-2 inline-flex items-center gap-1.5" style={{ fontWeight: 700 }}><AlertTriangle className="w-3.5 h-3.5" /> จุดสั่งซื้ออัตโนมัติ <span className="text-gray-400 font-normal">Reorder point</span></p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>สต็อกเริ่มต้น ({form.baseUnit})</label>
                        <input type="number" className={inputCls} value={form.stock} onChange={e => set("stock", Number(e.target.value))} placeholder="0" />
                      </div>
                      <div>
                        <label className={labelCls}>จุดสั่งซื้อ ({form.baseUnit}) <span className="text-red-400">*</span></label>
                        <input type="number" className={inputCls} value={form.minStock} onChange={e => set("minStock", Number(e.target.value))} placeholder="เช่น 100" />
                      </div>
                      <div>
                        <label className={labelCls}>จำนวนสั่งซื้อต่อครั้ง ({form.baseUnit})</label>
                        <input type="number" className={inputCls} value={form.reorderQty ?? 0} onChange={e => set("reorderQty", Number(e.target.value))} placeholder="เช่น 500" />
                      </div>
                    </div>
                    <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/60 p-2.5">
                      <div className="flex items-center justify-between text-[9.5px] text-gray-400 mb-1" style={{ fontWeight: 600 }}>
                        <span>ระดับการแจ้งเตือนสต็อก</span><span>{form.minStock > 0 ? "" : "ยังไม่ได้กำหนด"}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden flex">
                        <div style={{ width: "25%", background: "#ef4444" }} /><div style={{ width: "35%", background: "#f59e0b" }} /><div style={{ width: "40%", background: "#10b981" }} />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 mt-1">
                        <span>0 · ซื้อด่วน</span><span>จุดสั่งซื้อ</span><span>สต็อกปกติ</span>
                      </div>
                    </div>
                  </div>
                  )}

                  <div>
                    <label className={labelCls}>ผู้จำหน่ายหลัก <span className="text-gray-400 normal-case">Supplier</span></label>
                    <input className={inputCls} value={form.supplier} onChange={e => set("supplier", e.target.value)} placeholder="เช่น บริษัท สยามฟาร์มา จำกัด" />
                  </div>
                </>
              )}

              {/* STEP 4 — ตรวจสอบ */}
              {step === 4 && (
                <div className="space-y-3">
                  <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>ตรวจสอบข้อมูลก่อนบันทึก</p>
                  <ReviewRow label="ชื่อยา">{form.genericName}{form.tradeName ? ` (${form.tradeName})` : ""}</ReviewRow>
                  <ReviewRow label="ประเภท / กลุ่ม">{form.drugClass} · {form.drugGroup}</ReviewRow>
                  <ReviewRow label="รูปแบบ / ที่จัดเก็บ">{form.dosageForm}{form.location ? ` · ${form.location}` : ""}</ReviewRow>
                  <ReviewRow label="หน่วยพื้นฐาน">{form.baseUnit}{units.length ? ` · ${units.length} หน่วยบรรจุ` : ""}</ReviewRow>
                  <ReviewRow label="ราคา (ทุน → ขาย)">฿{form.costPrice.toFixed(2)} → ฿{form.sellPrice.toFixed(2)} ({marginPct.toFixed(1)}%)</ReviewRow>
                  <ReviewRow label="จุดสั่งซื้อ">{form.minStock} {form.baseUnit} · สั่งครั้งละ {form.reorderQty ?? 0}</ReviewRow>
                  {form.supplier && <ReviewRow label="ผู้จำหน่าย">{form.supplier}</ReviewRow>}
                  {form.note && <ReviewRow label="หมายเหตุ">{form.note}</ReviewRow>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="vet-modal-footer" style={{ justifyContent: "space-between" }}>
              <button onClick={step === 1 ? onClose : back} className="vet-btn vet-btn-secondary inline-flex items-center gap-1.5">
                {step > 1 && <ChevronLeft className="w-3.5 h-3.5" />}{step === 1 ? "ยกเลิก" : "ย้อนกลับ"}
              </button>
              <span className="text-[10.5px] text-gray-400">ขั้นตอน {step} จาก 4</span>
              <button onClick={next} disabled={!canNext} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5">
                {step < 4 ? <>ถัดไป <ChevronRight className="w-3.5 h-3.5" /></> : <><Check className="w-3.5 h-3.5" /> บันทึก</>}
              </button>
            </div>
          </motion.div>
        </div>
        {unitDraft && (
          <UnitEntryModal unit={unitDraft} baseUnit={form.baseUnit ?? ""} onSave={saveUnit} onClose={() => setUnitDraft(null)} />
        )}
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── หน่วยสินค้า (add/edit หน่วยบรรจุ) ─── */
function UnitEntryModal({ unit, baseUnit, onSave, onClose }: {
  unit: ProductUnit; baseUnit: string; onSave: (u: ProductUnit) => void; onClose: () => void;
}) {
  const [u, setU] = useState<ProductUnit>(unit);
  const upd = (patch: Partial<ProductUnit>) => setU(p => ({ ...p, ...patch }));
  const valid = u.name.trim() !== "" && u.qty > 0;

  // การคิดราคาตามจำนวน (ขั้นบันได)
  const tiers = u.priceTiers ?? [];
  const [tier, setTier] = useState({ memberLevel: MEMBER_LEVELS[0], qtyFrom: "", qtyTo: "", unitPrice: "" });
  const addTier = () => {
    if (tier.qtyFrom === "" || tier.unitPrice === "") return;
    upd({ priceTiers: [...tiers, { id: `t-${Date.now()}`, memberLevel: tier.memberLevel, qtyFrom: Number(tier.qtyFrom) || 0, qtyTo: Number(tier.qtyTo) || 0, unitPrice: Number(tier.unitPrice) || 0 }] });
    setTier({ memberLevel: MEMBER_LEVELS[0], qtyFrom: "", qtyTo: "", unitPrice: "" });
  };
  const delTier = (id: string) => upd({ priceTiers: tiers.filter(t => t.id !== id) });
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.18 }}
        className="bg-white rounded-3xl w-full max-w-[640px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon"><Package className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 15 }}>ข้อมูลหน่วยสินค้า</h3>
            <p className="text-[11px] text-gray-500">กำหนดหน่วยบรรจุ ราคา และบาร์โค้ด</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ชื่อหน่วยนับ <span className="text-red-400">*</span></label>
              <select className="vet-select" value={u.name} onChange={e => upd({ name: e.target.value })}>
                <option value="">— เลือกหน่วยนับ —</option>
                {u.name && !UNIT_NAMES.includes(u.name) && <option value={u.name}>{u.name}</option>}
                {UNIT_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>จำนวนหน่วยพื้นฐาน</label>
              <div className="flex items-center gap-2">
                <input type="number" className={inputCls} value={u.qty} onChange={e => upd({ qty: Number(e.target.value) })} />
                <span className="text-[12px] text-gray-400 whitespace-nowrap">{baseUnit || "หน่วย"}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>ราคาจำหน่าย</label>
              <input type="number" className={inputCls} value={u.price} onChange={e => upd({ price: Number(e.target.value) })} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>ราคาอ้างอิง</label>
              <input type="number" className={inputCls} value={u.refPrice ?? 0} onChange={e => upd({ refPrice: Number(e.target.value) })} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>ราคากลาง</label>
              <input type="number" className={inputCls} value={u.centralPrice ?? 0} onChange={e => upd({ centralPrice: Number(e.target.value) })} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Barcode ตามหน่วยบรรจุ</label>
            <input className={inputCls} value={u.barcode} onChange={e => upd({ barcode: e.target.value })} placeholder="สแกน / กรอกบาร์โค้ด" />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[12.5px] text-gray-700" style={{ fontWeight: 600 }}>
              <input type="checkbox" checked={u.active !== false} onChange={e => upd({ active: e.target.checked })} className="w-4 h-4 accent-[#0d7c66]" /> เปิดใช้งาน
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-[12.5px] text-gray-700" style={{ fontWeight: 600 }}>
              <input type="checkbox" checked={!!u.defaultPO} onChange={e => upd({ defaultPO: e.target.checked })} className="w-4 h-4 accent-[#0d7c66]" /> ใช้เป็นค่าเริ่มต้นออกใบสั่งซื้อ
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-[12.5px] text-gray-700" style={{ fontWeight: 600 }}>
              <input type="checkbox" checked={!!u.standard} onChange={e => upd({ standard: e.target.checked })} className="w-4 h-4 accent-[#0d7c66]" /> หน่วยขายหลัก (ปก)
            </label>
          </div>

          {/* การคิดราคาตามจำนวน (ขั้นบันได ตามระดับสมาชิก) */}
          <div className="vet-divider">การคิดราคาตามจำนวน <span className="normal-case text-gray-400">(ไม่บังคับ)</span></div>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-[1.4fr_1.4fr_1fr_auto] gap-2 px-3 py-2 bg-gray-50 text-[10px] text-gray-500" style={{ fontWeight: 700 }}>
              <span>ระดับสมาชิก</span><span>ช่วงจำนวน (เริ่ม–สิ้นสุด)</span><span className="text-right">ราคา/หน่วย</span><span></span>
            </div>
            {tiers.map(t => (
              <div key={t.id} className="grid grid-cols-[1.4fr_1.4fr_1fr_auto] gap-2 px-3 py-2 items-center border-t border-gray-100 text-[12px] text-gray-700">
                <span className="truncate" style={{ fontWeight: 600 }}>{t.memberLevel}</span>
                <span className="text-gray-500">{t.qtyFrom}{t.qtyTo ? `–${t.qtyTo}` : "+"} {u.name || baseUnit}</span>
                <span className="text-right" style={{ fontWeight: 700 }}>฿{t.unitPrice.toFixed(2)}</span>
                <button type="button" onClick={() => delTier(t.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {/* add-tier row */}
            <div className="grid grid-cols-[1.4fr_1.4fr_1fr_auto] gap-2 px-3 py-2 items-center border-t border-gray-100 bg-[#19a589]/[0.03]">
              <select className="vet-select !h-9 !text-[12px]" value={tier.memberLevel} onChange={e => setTier(s => ({ ...s, memberLevel: e.target.value }))}>
                {MEMBER_LEVELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex items-center gap-1">
                <input type="number" className={`${inputCls} !h-9 !text-[12px]`} value={tier.qtyFrom} onChange={e => setTier(s => ({ ...s, qtyFrom: e.target.value }))} placeholder="เริ่ม" />
                <span className="text-gray-300">–</span>
                <input type="number" className={`${inputCls} !h-9 !text-[12px]`} value={tier.qtyTo} onChange={e => setTier(s => ({ ...s, qtyTo: e.target.value }))} placeholder="สิ้นสุด" />
              </div>
              <input type="number" className={`${inputCls} !h-9 !text-[12px] text-right`} value={tier.unitPrice} onChange={e => setTier(s => ({ ...s, unitPrice: e.target.value }))} placeholder="0.00" />
              <button type="button" onClick={addTier} disabled={tier.qtyFrom === "" || tier.unitPrice === ""} className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }} title="เพิ่มขั้นราคา"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={() => onSave(u)} disabled={!valid} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> บันทึก</button>
        </div>
      </motion.div>
    </div>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-gray-50">
      <span className="text-[11px] text-gray-400 w-[120px] flex-shrink-0" style={{ fontWeight: 600 }}>{label}</span>
      <span className="text-[12.5px] text-gray-800 flex-1" style={{ fontWeight: 600 }}>{children}</span>
    </div>
  );
}

// ─── Receive Stock Modal ──────────────────────────────────────────────
/* ── จับคู่ชื่อสินค้าจากเอกสารสแกนกับสินค้าในระบบ (ตรงเป๊ะ → มีคำซ้อน → คำร่วม ≥ 2 คำ) ── */
const normDocTxt = (s: string) => s.toLowerCase().replace(/\s+/g, "");
const matchDocProduct = (name: string, stock: StockProduct[]): StockProduct | undefined => {
  const n = normDocTxt(name);
  if (!n) return undefined;
  return stock.find(p => normDocTxt(p.name) === n)
    ?? stock.find(p => normDocTxt(p.name).includes(n) || n.includes(normDocTxt(p.name)))
    ?? stock.find(p => {
      const toks = name.toLowerCase().split(/\s+/).filter(t => t.length >= 3);
      return toks.filter(t => p.name.toLowerCase().includes(t)).length >= 2;
    });
};
const isIsoDate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

/* รายการที่ AI อ่านได้จากเอกสารรับสินค้า — พร้อมสถานะจับคู่ */
interface ScannedReceiveItem {
  product?: StockProduct;   // สินค้าในระบบที่จับคู่ได้ (undefined = ไม่พบ)
  rawName: string;
  qty: number;
  cost: number;
  lot: string;
  expiry: string;
}

function ReceiveModal({ open, onClose, onSave, product, pos, onOpenPoReceive, products, onBulkReceive }: {
  open: boolean; onClose: () => void;
  onSave: (mv: Omit<StockMovement, "id">, poId?: number) => void;
  product: StockProduct | null;
  pos: PurchaseOrder[];
  onOpenPoReceive: (po: PurchaseOrder) => void;   // เด้งไปหน้าจอรับตามใบสั่งซื้อ (หลายรายการ)
  products: StockProduct[];
  onBulkReceive: (mvs: Omit<StockMovement, "id">[]) => void;   // รับหลายรายการจากเอกสารสแกนทีเดียว
}) {
  const { showSnackbar } = useSnackbar();
  const [qty, setQty]       = useState(0);
  const [cost, setCost]     = useState(0);
  const [date, setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [lot, setLot]       = useState("");
  const [expiry, setExpiry] = useState("");
  const [supplier, setSupplier] = useState("");
  const [note, setNote]     = useState("");

  /* ── สแกนใบส่งของ/ใบกำกับด้วย AI ── */
  const aiFileRef = useRef<HTMLInputElement>(null);
  const [aiReading, setAiReading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [scanned, setScanned] = useState<ScannedReceiveItem[]>([]);

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && product) {
      setCost(product.costPrice);
      setQty(0); setLot(""); setExpiry(""); setSupplier(product.supplier); setNote("");
      setAiReading(false); setAiSummary(null); setScanned([]);
    }
  }

  const handleAiFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showSnackbar("error", "รองรับเฉพาะไฟล์ภาพ (JPG/PNG) — เอกสาร PDF ให้บันทึกเป็นภาพก่อน");
      return;
    }
    setAiReading(true); setAiSummary(null); setScanned([]);
    try {
      const stockList = products.filter(p => p.type === "stock");
      const dataUrl = await fileToDataUrl(file);
      const catalog = stockList.map(p => `${p.id}|${p.name}`).join("\n");
      const ex = await extractPoFromImage(dataUrl, catalog, SUPPLIERS, PACK_UNITS, STOCK_UNITS);

      const rows: ScannedReceiveItem[] = (ex.items ?? []).map(it => ({
        product: (it.productId ? stockList.find(x => x.id === it.productId) : undefined) ?? matchDocProduct(it.name ?? "", stockList),
        rawName: it.name ?? "",
        qty: Math.max(1, Math.round(Number(it.qty) || 1)),
        cost: Math.max(0, Number(it.unitPrice) || 0),
        lot: (it.lot ?? "").trim(),
        expiry: isIsoDate(it.expiry) ? it.expiry! : "",
      }));
      setScanned(rows);

      // Supplier + วันที่จากเอกสาร
      const exSupplier = ex.supplier?.trim() ?? "";
      const supMatch = SUPPLIERS.find(s => normDocTxt(s) === normDocTxt(exSupplier))
        ?? (exSupplier ? SUPPLIERS.find(s => normDocTxt(s).includes(normDocTxt(exSupplier)) || normDocTxt(exSupplier).includes(normDocTxt(s))) : undefined)
        ?? (exSupplier ? "อื่นๆ" : "");
      if (supMatch) setSupplier(supMatch);
      if (isIsoDate(ex.orderDate)) setDate(ex.orderDate!);
      if (ex.note?.trim()) setNote(n => [n, ex.note!.trim()].filter(Boolean).join("\n"));

      // ถ้าเอกสารมีสินค้าตัวที่กำลังรับอยู่ — กรอกช่องให้เลย
      const mine = product ? rows.find(r => r.product?.id === product.id) : undefined;
      if (mine) {
        setQty(mine.qty);
        if (mine.cost > 0) setCost(mine.cost);
        if (mine.lot) setLot(mine.lot);
        if (mine.expiry) setExpiry(mine.expiry);
      }

      const matched = rows.filter(r => r.product).length;
      const unmatchedNames = rows.filter(r => !r.product).map(r => r.rawName || "(ไม่ทราบชื่อ)");
      if (unmatchedNames.length) setNote(n => [n, `AI อ่านพบแต่ไม่ตรงกับสินค้าในระบบ: ${unmatchedNames.join(", ")}`].filter(Boolean).join("\n"));
      setAiSummary(rows.length
        ? `อ่านพบ ${rows.length} รายการ · จับคู่ได้ ${matched}${mine ? " · กรอกข้อมูลสินค้านี้ให้แล้ว" : ""}`
        : "อ่านเอกสารแล้วแต่ไม่พบรายการสินค้า — ลองภาพที่คมชัดขึ้น");
      showSnackbar(rows.length ? "success" : "info", rows.length ? "AI อ่านเอกสารรับสินค้าแล้ว — ตรวจสอบก่อนบันทึก" : "AI ไม่พบรายการสินค้าในเอกสาร");
    } catch (e) {
      setAiSummary(null);
      showSnackbar("error", `AI อ่านเอกสารไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setAiReading(false);
    }
  };

  /* รับสินค้าที่จับคู่ได้จากเอกสารทั้งหมดในคลิกเดียว */
  const receiveAllScanned = () => {
    const matched = scanned.filter(r => r.product);
    if (!matched.length) return;
    const dateTxt = new Date(date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    onBulkReceive(matched.map(r => ({
      productId: r.product!.id, productName: r.product!.name, type: "in" as const,
      qty: r.qty, costPerUnit: r.cost > 0 ? r.cost : r.product!.costPrice,
      date: dateTxt, ref: "", supplier, lot: r.lot,
      note: "รับจากเอกสารสแกน (AI)", expiry: r.expiry || undefined,
    })));
  };

  if (!product) return null;
  const newStock = product.stock + qty;
  const totalCost = qty * cost;

  /* ใบ PO ที่ยังค้างรับและมีสินค้าตัวนี้อยู่ในใบ — เลือกแล้วเปิดหน้าจอรับตามใบทันที */
  const relatedPos = pos.filter(p => poReceivable(p) && p.items.some(it => it.productId === product.id && poRemaining(it) > 0));

  return (
    <Modal
      open={open}
      title="รับสินค้าเข้าคลัง"
      subtitle={`${product.name} · ${product.code}`}
      icon={<ArrowDownToLine className="w-[20px] h-[20px] text-white" />}
      onClose={onClose}
      onSave={() => onSave({
        productId: product.id, productName: product.name, type: "in",
        qty, costPerUnit: cost,
        date: new Date(date).toLocaleDateString("th-TH", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }),
        ref: "", supplier, lot, note, expiry: expiry || undefined,
      })}
      saveLabel="รับเข้า Stock"
      canSave={qty > 0}
      maxWidth="max-w-2xl"
    >
      {/* สแกนใบส่งของ/ใบกำกับด้วย AI — กรอกฟอร์มให้อัตโนมัติ */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{
          background: "linear-gradient(135deg, rgba(25,165,137,0.08), rgba(13,124,102,0.03))",
          border: "1px dashed rgba(25,165,137,0.40)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.35)" }}
          >
            {aiReading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Sparkles className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] text-gray-800 flex items-center gap-1.5 flex-wrap" style={{ fontWeight: 700 }}>
              สแกนเอกสารด้วย AI
              <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", fontWeight: 700 }}>หมอเหมียว</span>
            </p>
            <p className="text-[11px] truncate" style={{ color: aiReading ? "#0d7c66" : "#6b7280", fontWeight: aiReading ? 600 : 400 }}
              title={aiSummary ?? undefined}>
              {aiReading
                ? "หมอเหมียวกำลังอ่านเอกสาร... รอสักครู่นะเหมียว~"
                : aiSummary ?? "แนบใบส่งของ / ใบกำกับ — กรอกจำนวน · ราคา · Lot · วันหมดอายุให้"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => aiFileRef.current?.click()}
            disabled={aiReading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] text-white whitespace-nowrap flex-shrink-0 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.40)", fontWeight: 700 }}
          >
            {aiReading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {aiReading ? "กำลังอ่าน..." : "แนบเอกสาร"}
          </button>
        </div>
        <input
          ref={aiFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleAiFile(f); e.target.value = ""; }}
        />
      </div>

      {/* รายการทั้งหมดที่ AI อ่านพบ — รับเข้าคลังทีเดียวได้ */}
      {scanned.filter(r => r.product).length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(25,165,137,0.25)" }}>
          <div className="px-3.5 py-2.5 flex items-center gap-2" style={{ background: "rgba(25,165,137,0.08)" }}>
            <PackageOpen className="w-4 h-4 text-[#0d7c66] flex-shrink-0" />
            <p className="text-[12px] text-[#0d7c66] flex-1" style={{ fontWeight: 700 }}>
              รายการจากเอกสาร {scanned.filter(r => r.product).length} รายการ
            </p>
            <button type="button" onClick={receiveAllScanned}
              className="text-[11px] text-white px-2.5 py-1 rounded-lg inline-flex items-center gap-1 flex-shrink-0"
              style={{ background: "#19a589", fontWeight: 600 }}>
              <ArrowDownToLine className="w-3 h-3" /> รับทั้งหมดเข้าคลัง
            </button>
          </div>
          <div className="divide-y divide-gray-50 bg-white">
            {scanned.filter(r => r.product).map((r, i) => (
              <div key={i} className="px-3.5 py-2 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{r.product!.name}</p>
                  <p className="text-[10.5px] text-gray-400 mt-0.5">
                    {r.qty} {r.product!.unit} · ฿{(r.cost > 0 ? r.cost : r.product!.costPrice).toLocaleString()}/{r.product!.unit}
                    {r.lot ? ` · Lot ${r.lot}` : ""}{r.expiry ? ` · หมดอายุ ${fmtPoDate(r.expiry)}` : ""}
                  </p>
                </div>
                {product && r.product!.id === product.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700 }}>สินค้านี้</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* สินค้าที่กำลังรับเข้า */}
      <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "rgba(25,165,137,0.06)", border: "1px solid rgba(25,165,137,0.15)" }}>
        <div className="relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl overflow-hidden bg-white"
          style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <span style={{ lineHeight: 1 }}>{product.categoryEmoji}</span>
          {product.image && (
            <img src={product.image} alt="" className="absolute inset-0 w-full h-full object-cover rounded-xl"
              onError={e => { e.currentTarget.style.display = "none"; }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{product.name}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            <span className="font-mono">{product.code}</span> · {product.categoryEmoji} {product.category} · หน่วย: {product.unit}
          </p>
        </div>
      </div>

      {/* ทางเลือกที่ 1 — สินค้านี้มีใบสั่งซื้อค้างรับ: กดรับตามใบได้เลย */}
      {relatedPos.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(25,165,137,0.25)" }}>
          <div className="px-3.5 py-2.5 flex items-center gap-2" style={{ background: "rgba(25,165,137,0.08)" }}>
            <ClipboardList className="w-4 h-4 text-[#0d7c66] flex-shrink-0" />
            <p className="text-[12px] text-[#0d7c66]" style={{ fontWeight: 700 }}>
              สินค้านี้มีใบสั่งซื้อค้างรับ {relatedPos.length} ใบ — ถ้าของมาตามใบ กดรับผ่านใบได้เลย
            </p>
          </div>
          <div className="divide-y divide-gray-50 bg-white">
            {relatedPos.map(p => {
              const it = p.items.find(x => x.productId === product.id)!;
              return (
                <button key={p.id} type="button" onClick={() => onOpenPoReceive(p)}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2 text-left hover:bg-[#f7fdfb] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-gray-800" style={{ fontWeight: 700 }}>
                      <span className="font-mono">{p.poNumber}</span>
                      <span className="text-gray-400" style={{ fontWeight: 400 }}> · {p.supplier}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      ค้างรับ {poRemaining(it)} {it.packUnit || it.unit} · ทั้งใบมี {p.items.length} รายการ
                    </p>
                  </div>
                  <span className="text-[11px] text-white px-2.5 py-1 rounded-lg inline-flex items-center gap-0.5 flex-shrink-0"
                    style={{ background: "#19a589", fontWeight: 600 }}>
                    รับตามใบ <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ทางเลือกที่ 2 — ไม่มีใบ: กรอกรับเอง */}
      <div className="flex items-center gap-2 text-[10.5px] text-gray-400">
        <div className="flex-1 h-px bg-gray-100" />
        <span style={{ fontWeight: 600 }}>{relatedPos.length > 0 ? "หรือรับแบบไม่มีใบสั่งซื้อ — กรอกเอง" : "รับแบบไม่มีใบสั่งซื้อ — กรอกเอง"}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

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
        <div>
          <label className={labelCls}>วันหมดอายุ</label>
          <input type="date" className={inputCls} value={expiry} onChange={e => setExpiry(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Supplier</label>
          <select className="vet-select" value={supplier} onChange={e => setSupplier(e.target.value)}>
            <option value="">— เลือก Supplier —</option>
            {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>หมายเหตุ</label>
          <textarea className="vet-textarea" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="หมายเหตุการรับสินค้า..." />
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
  partial:   { label: "รับบางส่วน",     cls: "bg-sky-50 text-sky-600",       Icon: PackageOpen },
  received:  { label: "รับสินค้าแล้ว", cls: "bg-[#f0fdf4] text-[#16a34a]", Icon: Check },
  cancelled: { label: "ยกเลิก",         cls: "bg-red-50 text-red-500",       Icon: Ban },
};

/* จำนวนค้างรับของรายการใน PO */
const poRemaining = (it: POItem) => Math.max(0, it.qty - (it.receivedQty || 0));
/* PO นี้ยังรับสินค้าเพิ่มได้ไหม */
const poReceivable = (po: PurchaseOrder) =>
  po.status !== "cancelled" && po.status !== "received" && po.items.some(it => poRemaining(it) > 0);
/* คำนวณใบ PO หลังรับสินค้า 1 รอบ — คืน null ถ้าไม่มีจำนวนรับจริง */
const applyPoReceipt = (po: PurchaseOrder, recvQtys: number[], date: string, note: string,
  costs?: number[], lots?: string[], expiries?: string[]):
  { updated: PurchaseOrder; receipt: POReceipt } | null => {
  const entries = recvQtys
    .map((q, idx) => ({
      idx,
      qty: Math.min(Math.max(0, q || 0), poRemaining(po.items[idx])),
      cost: costs?.[idx],
      lot: lots?.[idx]?.trim() || undefined,
      expiry: expiries?.[idx]?.trim() || undefined,
    }))
    .filter(e => e.qty > 0);
  if (entries.length === 0) return null;
  const items = po.items.map((it, idx) => {
    const e = entries.find(x => x.idx === idx);
    return e ? { ...it, receivedQty: (it.receivedQty || 0) + e.qty } : it;
  });
  const receipt: POReceipt = { id: (po.receipts?.length || 0) + 1, date, note: note.trim() || undefined, items: entries };
  const fully = items.every(it => (it.receivedQty || 0) >= it.qty);
  const updated: PurchaseOrder = { ...po, items, receipts: [...(po.receipts || []), receipt], status: fully ? "received" : "partial" };
  return { updated, receipt };
};

// ─── PO Modal ─────────────────────────────────────────────────────────
function POModal({ open, onClose, onSave, products, initialItems, pos, setPOs, onReceipt }: {
  open: boolean;
  onClose: () => void;
  onSave: (po: Omit<PurchaseOrder, "id">) => void;
  products: StockProduct[];
  initialItems?: POItem[];
  pos: PurchaseOrder[];
  setPOs: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  onReceipt?: (updated: PurchaseOrder, receipt: POReceipt) => void;   // แจ้ง Stock ให้บวกสต๊อก + ลง movement
}) {
  const [tab, setTab] = useState<"new" | "history">("new");

  const today = new Date().toISOString().split("T")[0];

  const emptyForm = () => ({
    poNumber: `PO-2025-${String(pos.length + 26).padStart(4, "0")}`,
    supplier: "",
    orderDate: today,
    expectedDate: "",
    deliveryMethod: "ขนส่งทั่วไป",
    storeRoom: STORE_ROOMS[0],
    taxType: "exclude" as TaxType,
    billDiscount: 0,
    billDiscountType: "baht" as "baht" | "percent",
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
    setF("items", [...form.items, { productId: 0, productName: "", unit: "ชิ้น", packUnit: "กล่อง", qty: 1, costPerUnit: 0 }]);
  const removeItem = (i: number) =>
    setF("items", form.items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, patch: Partial<POItem>) =>
    setF("items", form.items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const setItemProduct = (i: number, pid: number) => {
    const p = products.find(x => x.id === pid);
    if (!p) return;
    updateItem(i, {
      productId: pid, productName: p.name, costPerUnit: p.costPrice,
      unit: STOCK_UNITS.includes(p.unit) ? p.unit : (p.unit || "ชิ้น"),   // หน่วยจ่าย (Stock) ตั้งต้นตามหน่วยของสินค้า
    });
  };

  const lineNet = (it: POItem) => Math.max(0, it.qty * it.costPerUnit - (it.discount || 0));
  const grossAmt = form.items.reduce((s, it) => s + it.qty * it.costPerUnit, 0);              // มูลค่าสินค้า (ก่อนส่วนลด)
  const itemDisc = form.items.reduce((s, it) => s + Math.min(it.discount || 0, it.qty * it.costPerUnit), 0); // ส่วนลดรายการรวม
  const afterItemDisc = grossAmt - itemDisc;
  const billDisc = form.billDiscountType === "percent"
    ? afterItemDisc * Math.min(Math.max(form.billDiscount || 0, 0), 100) / 100
    : Math.min(Math.max(form.billDiscount || 0, 0), afterItemDisc);                            // ส่วนลดท้ายบิล
  const subtotal = afterItemDisc - billDisc;                                                   // ฐานคิด VAT หลังหักส่วนลดทั้งหมด
  const vat = form.taxType === "exclude" ? subtotal * VAT_RATE
    : form.taxType === "include" ? subtotal - subtotal / (1 + VAT_RATE)
    : 0;
  const baseAmt = form.taxType === "include" ? subtotal - vat : subtotal;   // มูลค่าก่อน VAT
  const total = form.taxType === "exclude" ? subtotal + vat : subtotal;      // ยอดสุทธิที่ต้องจ่าย
  const money = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const canSave = !!form.supplier && form.items.length > 0 && form.items.every(it => it.productId && it.qty > 0);

  /* ── ทะเบียนใบสั่งซื้อ: ตัวกรอง (default 30 วันย้อนหลัง) + ดูรายละเอียด ── */
  const [fltFrom, setFltFrom] = useState(isoDaysAgo(30));
  const [fltTo, setFltTo] = useState(isoDaysAgo(0));
  const [fltPoNo, setFltPoNo] = useState("");
  const [fltSupplier, setFltSupplier] = useState("");
  const [viewPo, setViewPo] = useState<PurchaseOrder | null>(null);
  const [recvPo, setRecvPo] = useState<PurchaseOrder | null>(null);   // PO ที่กำลังเปิดหน้าจอรับสินค้า
  const [recvInitial, setRecvInitial] = useState<ReceiveInitial | undefined>(undefined);   // ค่าตั้งต้นจากเอกสารสแกน

  /* ── สแกนใบส่งของในทะเบียน PO: หาใบที่ตรง → เปิดหน้ารับสินค้าพร้อมข้อมูลจากเอกสาร ── */
  const regFileRef = useRef<HTMLInputElement>(null);
  const [regReading, setRegReading] = useState(false);

  const handleRegistryScan = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      aiSnack("error", "รองรับเฉพาะไฟล์ภาพ (JPG/PNG) — เอกสาร PDF ให้บันทึกเป็นภาพก่อน");
      return;
    }
    setRegReading(true);
    try {
      const stockList = products.filter(p => p.type === "stock");
      const dataUrl = await fileToDataUrl(file);
      const catalog = stockList.map(p => `${p.id}|${p.name}`).join("\n");
      const ex = await extractPoFromImage(dataUrl, catalog, SUPPLIERS, PACK_UNITS, STOCK_UNITS);

      // จับคู่รายการในเอกสารกับสินค้าในระบบก่อน — ใช้ทั้งหาใบ PO และเติมจำนวน
      const docRows = (ex.items ?? []).map(it => ({
        pid: ((it.productId ? stockList.find(x => x.id === it.productId) : undefined) ?? matchDocProduct(it.name ?? "", stockList))?.id ?? 0,
        qty: Math.max(1, Math.round(Number(it.qty) || 1)),
        cost: Math.max(0, Number(it.unitPrice) || 0),
        lot: (it.lot ?? "").trim(),
        expiry: isIsoDate(it.expiry) ? it.expiry! : "",
      }));

      // 1) หาใบจากเลข PO ในเอกสาร  2) ไม่มีเลข → เทียบ Supplier + สินค้าที่ซ้อนกันมากสุด (เฉพาะใบที่ยังรับได้)
      const normPoNo = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const docNo = normPoNo(ex.poNumber ?? "");
      let target = docNo ? pos.find(p => normPoNo(p.poNumber) === docNo) : undefined;
      if (!target) {
        const scored = pos.filter(poReceivable).map(p => {
          const overlap = p.items.filter(it => docRows.some(r => r.pid && r.pid === it.productId)).length;
          const supOk = ex.supplier && normDocTxt(p.supplier).includes(normDocTxt(ex.supplier)) ? 1 : 0;
          return { p, score: overlap * 2 + supOk };
        }).filter(s => s.score >= 2).sort((a, b) => b.score - a.score);
        target = scored[0]?.p;
      }
      if (!target) {
        aiSnack("error", `ไม่พบใบสั่งซื้อที่ตรงกับเอกสาร${ex.poNumber ? ` (${ex.poNumber})` : ""} — ตรวจสอบเลขที่ PO หรือรับแบบไม่มีใบแทน`);
        return;
      }
      if (!poReceivable(target)) {
        aiSnack("info", `ใบ ${target.poNumber} รับครบ/ยกเลิกแล้ว — เปิดดูรายละเอียดแทน`);
        setViewPo(target);
        return;
      }

      // เตรียมค่าตั้งต้นเรียงตาม index ของรายการในใบ PO
      const init: ReceiveInitial = {
        qtys: target.items.map(it => docRows.find(r => r.pid === it.productId)?.qty),
        costs: target.items.map(it => { const c = docRows.find(r => r.pid === it.productId)?.cost; return c && c > 0 ? c : undefined; }),
        lots: target.items.map(it => docRows.find(r => r.pid === it.productId)?.lot || undefined),
        expiries: target.items.map(it => docRows.find(r => r.pid === it.productId)?.expiry || undefined),
        note: ["รับตามเอกสารสแกน (AI)", ex.note?.trim()].filter(Boolean).join(" · "),
      };
      setRecvInitial(init);
      setRecvPo(target);
      aiSnack("success", `พบใบ ${target.poNumber} (${target.supplier}) — เปิดหน้ารับสินค้าพร้อมข้อมูลจากเอกสารแล้ว`);
    } catch (e) {
      aiSnack("error", `AI อ่านเอกสารไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setRegReading(false);
    }
  };
  const poSuppliers = Array.from(new Set(pos.map(p => p.supplier))).sort();

  /* บันทึกการรับสินค้า 1 รอบ — สะสม receivedQty และอัปเดตสถานะ (รับบางส่วน/รับครบ) */
  const handleReceive = (po: PurchaseOrder, recvQtys: number[], date: string, note: string, costs?: number[], lots?: string[]) => {
    const res = applyPoReceipt(po, recvQtys, date, note, costs, lots);
    if (!res) return;
    setPOs(ps => ps.map(p => p.id === po.id ? res.updated : p));
    setViewPo(v => v && v.id === po.id ? res.updated : v);
    setRecvPo(null);
    onReceipt?.(res.updated, res.receipt);
  };
  const filteredPos = pos
    .filter(po => {
      const d = new Date(po.orderDate).getTime();
      const from = fltFrom ? new Date(fltFrom).getTime() : -Infinity;
      const to = fltTo ? new Date(fltTo).getTime() + 24 * 3600 * 1000 - 1 : Infinity;
      if (!isNaN(d) && (d < from || d > to)) return false;
      if (fltPoNo.trim() && !po.poNumber.toLowerCase().includes(fltPoNo.trim().toLowerCase())) return false;
      if (fltSupplier && po.supplier !== fltSupplier) return false;
      return true;
    })
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate));

  const handleSave = (status: "draft" | "sent") => {
    const po: Omit<PurchaseOrder, "id"> = { ...form, status };
    setPOs(ps => [{ ...po, id: ps.length + 1 }, ...ps]);
    onSave(po);
  };

  /* ── สร้างจากเอกสารด้วย AI: แนบภาพใบสั่งซื้อ/ใบเสนอราคา → AI อ่านแล้วกรอกฟอร์มให้ ── */
  const { showSnackbar: aiSnack } = useSnackbar();
  const aiFileRef = useRef<HTMLInputElement>(null);
  const [aiReading, setAiReading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleAiFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      aiSnack("error", "รองรับเฉพาะไฟล์ภาพ (JPG/PNG) — เอกสาร PDF ให้บันทึกเป็นภาพก่อน");
      return;
    }
    setAiReading(true);
    setAiSummary(null);
    try {
      const stockList = products.filter(p => p.type === "stock");
      const dataUrl = await fileToDataUrl(file);
      const catalog = stockList.map(p => `${p.id}|${p.name}`).join("\n");
      const ex = await extractPoFromImage(dataUrl, catalog, SUPPLIERS, PACK_UNITS, STOCK_UNITS);

      const items: POItem[] = [];
      const unmatched: string[] = [];
      for (const it of ex.items ?? []) {
        const p = (it.productId ? stockList.find(x => x.id === it.productId) : undefined) ?? matchDocProduct(it.name ?? "", stockList);
        const qty = Math.max(1, Math.round(Number(it.qty) || 1));
        const price = Number(it.unitPrice) > 0 ? Number(it.unitPrice) : (p?.costPrice ?? 0);
        const discount = Math.max(0, Number(it.discount) || 0);
        // หน่วยบรรจุ: ยึดตามเอกสารก่อน ค่อย fallback เป็น "กล่อง"
        const docUnit = (it.packUnit ?? "").trim() || (it.unit ?? "").trim();
        const packUnit = docUnit
          ? (PACK_UNITS.find(u => u === docUnit)
            ?? PACK_UNITS.find(u => docUnit.includes(u) || u.includes(docUnit))
            ?? docUnit)   // หน่วยนอกลิสต์ก็แสดงได้ — dropdown จะเติมเป็นตัวเลือกแรกให้เอง
          : "กล่อง";
        const docStockUnit = (it.unit ?? "").trim() || (it.packUnit ?? "").trim();
        if (p) {
          items.push({ productId: p.id, productName: p.name, unit: STOCK_UNITS.includes(p.unit) ? p.unit : (p.unit || "ชิ้น"), packUnit, qty, costPerUnit: price, ...(discount ? { discount } : {}) });
        } else {
          items.push({ productId: 0, productName: it.name ?? "", unit: docStockUnit || "ชิ้น", packUnit, qty, costPerUnit: price, ...(discount ? { discount } : {}) });
          unmatched.push(it.name || "(ไม่ทราบชื่อ)");
        }
      }

      const exSupplier = ex.supplier?.trim() ?? "";
      const supplier = SUPPLIERS.find(s => normDocTxt(s) === normDocTxt(exSupplier))
        ?? (exSupplier ? SUPPLIERS.find(s => normDocTxt(s).includes(normDocTxt(exSupplier)) || normDocTxt(exSupplier).includes(normDocTxt(s))) : undefined)
        ?? (exSupplier ? "อื่นๆ" : "");
      const delivery = ex.deliveryMethod
        ? DELIVERY_METHODS.find(d => normDocTxt(d).includes(normDocTxt(ex.deliveryMethod!)) || normDocTxt(ex.deliveryMethod!).includes(normDocTxt(d)))
        : undefined;
      const noteParts = [
        ex.note?.trim(),
        exSupplier && supplier === "อื่นๆ" ? `Supplier จากเอกสาร: ${exSupplier}` : "",
        unmatched.length ? `AI อ่านพบแต่ไม่ตรงกับสินค้าในระบบ (โปรดเลือกเอง): ${unmatched.join(", ")}` : "",
      ].filter(Boolean) as string[];

      const billDiscount = Math.max(0, Number(ex.billDiscount) || 0);
      setForm(f => ({
        ...f,
        supplier: supplier || f.supplier,
        orderDate: isIsoDate(ex.orderDate) ? ex.orderDate! : f.orderDate,
        expectedDate: isIsoDate(ex.expectedDate) ? ex.expectedDate! : f.expectedDate,
        deliveryMethod: delivery ?? f.deliveryMethod,
        taxType: ex.taxType === "exclude" || ex.taxType === "include" || ex.taxType === "none" ? ex.taxType : f.taxType,
        items: items.length ? items : f.items,
        ...(billDiscount ? { billDiscount, billDiscountType: "baht" as const } : {}),
        note: noteParts.length ? [f.note, ...noteParts].filter(Boolean).join("\n") : f.note,
      }));

      const matchedCount = items.filter(i => i.productId).length;
      const discCount = items.filter(i => i.discount).length;
      setAiSummary(items.length
        ? `อ่านพบ ${items.length} รายการ · จับคู่สินค้าในระบบได้ ${matchedCount}${unmatched.length ? ` · ต้องเลือกเอง ${unmatched.length}` : ""}${discCount ? ` · ส่วนลด ${discCount} รายการ` : ""}${billDiscount ? ` · ส่วนลดท้ายบิล ฿${billDiscount.toLocaleString()}` : ""}`
        : "อ่านเอกสารแล้วแต่ไม่พบรายการสินค้า — ลองภาพที่คมชัดขึ้น");
      aiSnack(items.length ? "success" : "info", items.length ? "AI กรอกข้อมูลใบ PO ให้แล้ว — ตรวจสอบก่อนบันทึก" : "AI ไม่พบรายการสินค้าในเอกสาร");
    } catch (e) {
      setAiSummary(null);
      aiSnack("error", `AI อ่านเอกสารไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setAiReading(false);
    }
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
              className="w-full max-w-7xl vet-modal"
              style={{ height: "min(880px, calc(100vh - 2rem))" }}
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
                  {t === "new" ? "สร้าง PO ใหม่" : `ทะเบียนใบสั่งซื้อ (${pos.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* ── New PO ── */}
          {tab === "new" && (
            <>
              <div className="vet-modal-body space-y-5">
                {/* AI import — แนบภาพเอกสารให้ AI อ่านแล้วกรอกฟอร์ม */}
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap"
                  style={{
                    background: "linear-gradient(135deg, rgba(25,165,137,0.08), rgba(13,124,102,0.03))",
                    border: "1px dashed rgba(25,165,137,0.40)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.35)" }}
                  >
                    {aiReading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-[12.5px] text-gray-800" style={{ fontWeight: 700 }}>
                      สร้างจากเอกสารด้วย AI <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full ml-1" style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", fontWeight: 700 }}>หมอเหมียว</span>
                    </p>
                    <p className="text-[11px]" style={{ color: aiReading ? "#0d7c66" : "#6b7280", fontWeight: aiReading ? 600 : 400 }}>
                      {aiReading
                        ? "หมอเหมียวกำลังอ่านเอกสาร... รอสักครู่นะเหมียว~"
                        : aiSummary ?? "แนบภาพใบสั่งซื้อ / ใบเสนอราคา แล้ว AI จะกรอกข้อมูลใบ PO ให้อัตโนมัติ"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => aiFileRef.current?.click()}
                    disabled={aiReading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.40)", fontWeight: 700 }}
                  >
                    {aiReading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {aiReading ? "กำลังอ่าน..." : "แนบไฟล์เอกสาร / ภาพ"}
                  </button>
                  <input
                    ref={aiFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleAiFile(f); e.target.value = ""; }}
                  />
                </div>

                {/* meta — 3-per-row field grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>เลขที่ PO</label>
                    <input className={inputCls} value={form.poNumber}
                      onChange={e => setF("poNumber", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Supplier <span className="text-red-400">*</span></label>
                    <select className="vet-select" value={form.supplier} onChange={e => setF("supplier", e.target.value)}>
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
                  <div>
                    <label className={labelCls}>วิธีส่งสินค้า</label>
                    <select className="vet-select" value={form.deliveryMethod}
                      onChange={e => setF("deliveryMethod", e.target.value)}>
                      {DELIVERY_METHODS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>ประเภทการคิดภาษี</label>
                    <select className="vet-select" value={form.taxType}
                      onChange={e => setF("taxType", e.target.value as TaxType)}>
                      {TAX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className={labelCls}>Store Room ที่รับสินค้าเข้า <span className="text-gray-400 normal-case">Stock department</span></label>
                    <select className="vet-select" value={form.storeRoom}
                      onChange={e => setF("storeRoom", e.target.value)}>
                      {STORE_ROOMS.map(s => <option key={s}>{s}</option>)}
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
                            {["สินค้า", "จำนวน", "หน่วยบรรจุ", "หน่วยจ่าย (Stock)", "ราคาทุน/หน่วย", "ส่วนลด", "รวม", ""].map(h => (
                              <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap"
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
                                <div className="relative">
                                  <select
                                    className="text-sm border border-gray-200 rounded-lg pl-2.5 pr-8 py-1.5 w-full focus:outline-none focus:border-[#19a589] bg-white appearance-none cursor-pointer truncate"
                                    value={it.productId || ""}
                                    onChange={e => setItemProduct(i, Number(e.target.value))}
                                  >
                                    <option value="">— เลือกสินค้า —</option>
                                    {products.filter(p => p.type === "stock").map(p => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                </div>
                              </td>
                              <td className="px-3 py-2 w-24">
                                <input type="number" min={1}
                                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 w-full text-center focus:outline-none focus:border-[#19a589]"
                                  value={it.qty || ""}
                                  onChange={e => updateItem(i, { qty: Number(e.target.value) })} />
                              </td>
                              {/* หน่วยบรรจุในการสั่งซื้อ */}
                              <td className="px-3 py-2 w-[120px]">
                                <div className="relative">
                                  <select
                                    className="text-sm border border-gray-200 rounded-lg pl-2 pr-6 py-1.5 w-full focus:outline-none focus:border-[#19a589] bg-white appearance-none cursor-pointer"
                                    value={it.packUnit || "กล่อง"}
                                    onChange={e => updateItem(i, { packUnit: e.target.value })}>
                                    {(PACK_UNITS.includes(it.packUnit || "กล่อง") ? PACK_UNITS : [it.packUnit!, ...PACK_UNITS]).map(u => (
                                      <option key={u} value={u}>{u}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                </div>
                              </td>
                              {/* ชื่อหน่วยจ่าย (Stock) ที่ใช้รับสินค้าเข้าคลัง */}
                              <td className="px-3 py-2 w-[120px]">
                                <div className="relative">
                                  <select
                                    className="text-sm border border-gray-200 rounded-lg pl-2 pr-6 py-1.5 w-full focus:outline-none focus:border-[#0d7c66] bg-[#f7fdfb] appearance-none cursor-pointer text-[#0d7c66]"
                                    value={it.unit || "ชิ้น"}
                                    onChange={e => updateItem(i, { unit: e.target.value })}>
                                    {(STOCK_UNITS.includes(it.unit || "ชิ้น") ? STOCK_UNITS : [it.unit!, ...STOCK_UNITS]).map(u => (
                                      <option key={u} value={u}>{u}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                </div>
                              </td>
                              <td className="px-3 py-2 w-36">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">฿</span>
                                  <input type="number"
                                    className="text-sm border border-gray-200 rounded-lg pl-5 pr-2 py-1.5 w-full focus:outline-none focus:border-[#19a589]"
                                    value={it.costPerUnit || ""}
                                    onChange={e => updateItem(i, { costPerUnit: Number(e.target.value) })} />
                                </div>
                              </td>
                              <td className="px-3 py-2 w-24">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">฿</span>
                                  <input type="number" min={0} placeholder="0"
                                    className="text-sm border border-gray-200 rounded-lg pl-5 pr-2 py-1.5 w-full focus:outline-none focus:border-[#19a589] text-amber-600"
                                    value={it.discount || ""}
                                    onChange={e => updateItem(i, { discount: Math.max(0, Number(e.target.value)) })} />
                                </div>
                              </td>
                              <td className="px-3 py-2 w-24 text-sm text-[#1e2939] whitespace-nowrap" style={{ fontWeight: 600 }}>
                                ฿{lineNet(it).toLocaleString()}
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
                      {/* total + discounts + VAT breakdown */}
                      <div className="px-4 py-3 bg-[#f9fafb] border-t border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{form.items.length} รายการ · มูลค่าสินค้า (ก่อนส่วนลด)</span>
                          <span style={{ fontWeight: 600 }}>฿{money(grossAmt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>ส่วนลดรายการ</span>
                          <span className={itemDisc > 0 ? "text-amber-600" : ""} style={{ fontWeight: 600 }}>− ฿{money(itemDisc)}</span>
                        </div>
                        {/* ส่วนลดท้ายบิล: สลับ % / ฿ + ช่องกรอก */}
                        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                          <span className="flex-shrink-0">ส่วนลดท้ายบิล</span>
                          <div className="flex items-center gap-2">
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
                              {(["percent", "baht"] as const).map(t => (
                                <button key={t} onClick={() => setF("billDiscountType", t)}
                                  className="px-2.5 py-1 text-[11px] transition-colors"
                                  style={form.billDiscountType === t
                                    ? { background: "#19a589", color: "#fff", fontWeight: 700 }
                                    : { background: "#fff", color: "#9ca3af", fontWeight: 600 }}>
                                  {t === "percent" ? "%" : "฿"}
                                </button>
                              ))}
                            </div>
                            <input type="number" min={0} placeholder="0"
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1 w-28 text-right focus:outline-none focus:border-[#19a589] bg-white"
                              value={form.billDiscount || ""}
                              onChange={e => setF("billDiscount", Math.max(0, Number(e.target.value)))} />
                            <span className={`min-w-[110px] text-right whitespace-nowrap ${billDisc > 0 ? "text-amber-600" : ""}`} style={{ fontWeight: 600 }}>− ฿{money(billDisc)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-1.5 border-t border-gray-200">
                          <span>มูลค่าก่อน VAT</span>
                          <span style={{ fontWeight: 600 }}>฿{money(baseAmt)}</span>
                        </div>
                        {form.taxType !== "none" && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>ภาษีมูลค่าเพิ่ม 7% {form.taxType === "include" ? "(รวมใน)" : "(แยกนอกราคา)"}</span>
                            <span style={{ fontWeight: 600 }}>฿{money(vat)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-200">
                          <span className="text-xs text-gray-600" style={{ fontWeight: 700 }}>ยอดสุทธิ</span>
                          <span className="text-base text-[#19a589]" style={{ fontWeight: 800 }}>฿{money(total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* note */}
                <div>
                  <label className={labelCls}>หมายเหตุถึง Supplier</label>
                  <textarea className="vet-textarea" rows={2}
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

          {/* ── ทะเบียนใบสั่งซื้อ (PO Registry) ── */}
          {tab === "history" && (
            <div className="vet-modal-body p-0 overflow-y-auto">
              {/* สแกนใบส่งของ → หาใบ PO ที่ตรง → เปิดหน้ารับสินค้าพร้อมข้อมูลจากเอกสาร
                  (มาร์กอัป/ระยะเดียวกับแถบในแท็บสร้าง PO — vet-modal-body มี padding 20px ให้แล้ว) */}
              <div className="pb-4">
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap"
                  style={{
                    background: "linear-gradient(135deg, rgba(25,165,137,0.08), rgba(13,124,102,0.03))",
                    border: "1px dashed rgba(25,165,137,0.40)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.35)" }}
                  >
                    {regReading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-[12.5px] text-gray-800" style={{ fontWeight: 700 }}>
                      รับสินค้าจากเอกสารด้วย AI <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full ml-1 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", fontWeight: 700 }}>หมอเหมียว</span>
                    </p>
                    <p className="text-[11px]" style={{ color: regReading ? "#0d7c66" : "#6b7280", fontWeight: regReading ? 600 : 400 }}>
                      {regReading
                        ? "หมอเหมียวกำลังอ่านเอกสารและหาใบ PO ที่ตรงกัน..."
                        : "แนบภาพใบส่งของ แล้ว AI จะหาใบ PO ที่ตรงกัน พร้อมเติมจำนวน · Lot · วันหมดอายุให้"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => regFileRef.current?.click()}
                    disabled={regReading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] text-white whitespace-nowrap flex-shrink-0 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.40)", fontWeight: 700 }}
                  >
                    {regReading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {regReading ? "กำลังอ่าน..." : "แนบไฟล์เอกสาร / ภาพ"}
                  </button>
                  <input
                    ref={regFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleRegistryScan(f); e.target.value = ""; }}
                  />
                </div>
              </div>

              {/* ตัวกรอง: ช่วงวันที่ (default 30 วันย้อนหลัง) · เลขที่ใบสั่งซื้อ · บริษัท */}
              <div className="px-4 py-3 border-b border-gray-100 bg-[#fafcfc]">
                <div className="flex items-center gap-2 mb-2.5">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 flex-1" style={{ fontWeight: 700 }}>ค้นหาใบสั่งซื้อย้อนหลัง</p>
                  <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[10.5px] whitespace-nowrap"
                    style={{ background: "rgba(25,165,137,0.08)", color: "#0d7c66", fontWeight: 700, border: "1px solid rgba(25,165,137,0.15)" }}>
                    พบ {filteredPos.length} รายการ
                  </span>
                  <span className="text-[12px] whitespace-nowrap" style={{ color: "#0d7c66", fontWeight: 800 }}>
                    ฿{filteredPos.reduce((s, po) => s + poTotals(po).total, 0).toLocaleString("th-TH", { maximumFractionDigits: 2 })}
                  </span>
                  <span className="w-px h-4 bg-gray-200" />
                  <button onClick={() => { setFltFrom(isoDaysAgo(30)); setFltTo(isoDaysAgo(0)); setFltPoNo(""); setFltSupplier(""); }}
                    title="กลับเป็นค่าเริ่มต้น (30 วันล่าสุด)"
                    className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10.5px] whitespace-nowrap transition-colors hover:bg-gray-50 hover:text-gray-600"
                    style={{ color: "#9ca3af", background: "#fff", border: "1px solid #e5e7eb", fontWeight: 600 }}>
                    <RefreshCw className="w-3 h-3" /> ล้างตัวกรอง
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 600 }}>ตั้งแต่วันที่</label>
                    <input type="date" value={fltFrom} onChange={e => setFltFrom(e.target.value)}
                      className="w-full h-9 px-2.5 text-[12px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#19a589]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 600 }}>ถึงวันที่</label>
                    <input type="date" value={fltTo} onChange={e => setFltTo(e.target.value)}
                      className="w-full h-9 px-2.5 text-[12px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#19a589]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 600 }}>เลขที่ใบสั่งซื้อ</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                      <input value={fltPoNo} onChange={e => setFltPoNo(e.target.value)} placeholder="PO-2569-…"
                        className="w-full h-9 pl-8 pr-2.5 text-[12px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#19a589]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block" style={{ fontWeight: 600 }}>บริษัท / Supplier</label>
                    <div className="relative">
                      <select value={fltSupplier} onChange={e => setFltSupplier(e.target.value)}
                        className="w-full h-9 px-2.5 pr-7 text-[12px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#19a589] appearance-none cursor-pointer">
                        <option value="">— ทุกบริษัท —</option>
                        {poSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {filteredPos.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">ไม่พบใบสั่งซื้อในเงื่อนไขที่เลือก</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-[12.5px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <th className="text-left px-4 py-2.5">เลขที่ PO</th>
                        <th className="text-left px-3 py-2.5">วันที่สั่งซื้อ</th>
                        <th className="text-left px-3 py-2.5">บริษัท / Supplier</th>
                        <th className="text-center px-3 py-2.5">รายการ</th>
                        <th className="text-right px-3 py-2.5">ยอดสุทธิ</th>
                        <th className="text-center px-3 py-2.5">สถานะ</th>
                        <th className="px-4 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPos.map(po => {
                        const cfg = PO_STATUS_CFG[po.status];
                        const poTotal = poTotals(po).total;
                        return (
                          <tr key={po.id} onClick={() => setViewPo(po)}
                            className="cursor-pointer transition-colors duration-150 hover:bg-[#f8fffe]"
                            title={po.items.map(it => `${it.productName} x${it.qty}`).join(" · ")}>
                            <td className="px-4 py-3">
                              <span className="font-mono text-[#0d7c66]" style={{ fontWeight: 700 }}>{po.poNumber}</span>
                            </td>
                            <td className="px-3 py-3">
                              <p className="text-gray-800" style={{ fontWeight: 600 }}>{fmtPoDate(po.orderDate)}</p>
                              {po.expectedDate && <p className="text-[10.5px] text-[#19a589] mt-0.5">นัดรับ {fmtPoDate(po.expectedDate)}</p>}
                            </td>
                            <td className="px-3 py-3 text-gray-700">{po.supplier}</td>
                            <td className="px-3 py-3 text-center text-gray-600" style={{ fontVariantNumeric: "tabular-nums" }}>{po.items.length}</td>
                            <td className="px-3 py-3 text-right text-[#1e2939]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                              ฿{poTotal.toLocaleString("th-TH", { maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.cls}`} style={{ fontWeight: 600 }}>{cfg.label}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1.5">
                                {poReceivable(po) && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setRecvInitial(undefined); setRecvPo(po); }}
                                    className="inline-flex items-center justify-center gap-1 h-7 min-w-[108px] px-3 text-[11px] rounded-lg whitespace-nowrap transition-colors duration-150 hover:bg-[#0d7c66]"
                                    style={{ fontWeight: 600, color: "#fff", background: "#19a589", border: "1px solid transparent" }}>
                                    <ArrowDownToLine className="w-3 h-3" /> รับสินค้า
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); setViewPo(po); }}
                                  className="inline-flex items-center justify-center gap-0.5 h-7 min-w-[108px] px-3 text-[11px] rounded-lg whitespace-nowrap transition-colors duration-150 hover:bg-[rgba(25,165,137,0.12)]"
                                  style={{ fontWeight: 600, color: "#0d7c66", border: "1px solid rgba(25,165,137,0.30)", background: "rgba(25,165,137,0.05)" }}>
                                  ดูรายละเอียด <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.div>
          </div>

          {/* ── รายละเอียดใบสั่งซื้อ (คลิกจากทะเบียน) ── */}
          {viewPo && (() => {
            const tt = poTotals(viewPo);
            const cfg = PO_STATUS_CFG[viewPo.status];
            return (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setViewPo(null)}>
                <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="relative w-full max-w-[520px] bg-white rounded-3xl overflow-hidden flex flex-col"
                  style={{ maxHeight: "min(720px, calc(100vh - 2rem))", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}
                  onClick={e => e.stopPropagation()}>
                  {/* header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] text-gray-900 font-mono" style={{ fontWeight: 800 }}>{viewPo.poNumber}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${cfg.cls}`} style={{ fontWeight: 600 }}>{cfg.label}</span>
                      </div>
                      <p className="text-[11.5px] text-gray-500 mt-0.5">{viewPo.supplier} · สั่ง {fmtPoDate(viewPo.orderDate)}</p>
                    </div>
                    <button onClick={() => setViewPo(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* meta */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                      <div><span className="text-gray-400">วันที่สั่งซื้อ</span><p className="text-gray-800" style={{ fontWeight: 600 }}>{fmtPoDate(viewPo.orderDate)}</p></div>
                      <div><span className="text-gray-400">วันที่คาดรับสินค้า</span><p className="text-gray-800" style={{ fontWeight: 600 }}>{fmtPoDate(viewPo.expectedDate) || "—"}</p></div>
                      <div><span className="text-gray-400">วิธีส่งสินค้า</span><p className="text-gray-800" style={{ fontWeight: 600 }}>{viewPo.deliveryMethod}</p></div>
                      <div><span className="text-gray-400">Store Room ที่รับเข้า</span><p className="text-gray-800" style={{ fontWeight: 600 }}>{viewPo.storeRoom || "—"}</p></div>
                      <div><span className="text-gray-400">ประเภทการคิดภาษี</span><p className="text-gray-800" style={{ fontWeight: 600 }}>{TAX_TYPES.find(t => t.value === viewPo.taxType)?.label ?? "—"}</p></div>
                      {viewPo.note && <div><span className="text-gray-400">หมายเหตุ</span><p className="text-gray-800" style={{ fontWeight: 600 }}>{viewPo.note}</p></div>}
                    </div>

                    {/* items */}
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            <th className="text-left px-3 py-2">สินค้า</th>
                            <th className="text-center px-2 py-2">จำนวน</th>
                            <th className="text-right px-2 py-2">ราคา/หน่วย</th>
                            <th className="text-right px-2 py-2">ส่วนลด</th>
                            <th className="text-right px-3 py-2">รวม</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {viewPo.items.map((it, i) => {
                            const recv = it.receivedQty || 0;
                            const remain = poRemaining(it);
                            return (
                              <tr key={i}>
                                <td className="px-3 py-2">
                                  <p className="text-gray-800" style={{ fontWeight: 600 }}>{it.productName}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">หน่วยจ่าย (Stock): {it.unit}</p>
                                </td>
                                <td className="px-2 py-2 text-center">
                                  <p className="text-gray-600">{it.qty} {it.packUnit || it.unit}</p>
                                  <p className="text-[10px] mt-0.5" style={{ color: remain === 0 ? "#16a34a" : recv > 0 ? "#0284c7" : "#9ca3af", fontWeight: 600 }}>
                                    รับแล้ว {recv}/{it.qty}
                                  </p>
                                </td>
                                <td className="px-2 py-2 text-right text-gray-600">฿{it.costPerUnit.toLocaleString()}</td>
                                <td className="px-2 py-2 text-right" style={{ color: it.discount ? "#d97706" : "#9ca3af" }}>{it.discount ? `− ฿${it.discount.toLocaleString()}` : "—"}</td>
                                <td className="px-3 py-2 text-right text-gray-900" style={{ fontWeight: 700 }}>฿{Math.max(0, it.qty * it.costPerUnit - (it.discount || 0)).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {/* summary */}
                      <div className="px-4 py-3 bg-[#f9fafb] border-t border-gray-100 space-y-1.5 text-[12px]">
                        <div className="flex justify-between text-gray-500"><span>มูลค่าสินค้า (ก่อนส่วนลด)</span><span style={{ fontWeight: 600 }}>฿{tt.gross.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></div>
                        {tt.itemDisc > 0 && <div className="flex justify-between text-amber-600"><span>ส่วนลดรายการ</span><span style={{ fontWeight: 600 }}>− ฿{tt.itemDisc.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></div>}
                        {tt.billDisc > 0 && <div className="flex justify-between text-amber-600"><span>ส่วนลดท้ายบิล</span><span style={{ fontWeight: 600 }}>− ฿{tt.billDisc.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></div>}
                        <div className="flex justify-between text-gray-500 pt-1.5 border-t border-gray-200"><span>มูลค่าก่อน VAT</span><span style={{ fontWeight: 600 }}>฿{tt.base.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></div>
                        {viewPo.taxType !== "none" && <div className="flex justify-between text-gray-500"><span>ภาษีมูลค่าเพิ่ม 7% {viewPo.taxType === "include" ? "(รวมใน)" : "(แยกนอกราคา)"}</span><span style={{ fontWeight: 600 }}>฿{tt.vat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></div>}
                        <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                          <span className="text-gray-700" style={{ fontWeight: 700 }}>ยอดสุทธิ</span>
                          <span className="text-[17px] text-[#0d7c66]" style={{ fontWeight: 800 }}>฿{tt.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    {/* ประวัติการรับสินค้า */}
                    {(viewPo.receipts?.length || 0) > 0 && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2" style={{ fontWeight: 700 }}>ประวัติการรับสินค้า ({viewPo.receipts!.length} ครั้ง)</p>
                        <div className="space-y-1.5">
                          {viewPo.receipts!.map(rc => (
                            <div key={rc.id} className="flex items-start gap-2 text-[11.5px] px-3 py-2 rounded-xl" style={{ background: "rgba(25,165,137,0.05)", border: "1px solid rgba(25,165,137,0.12)" }}>
                              <ArrowDownToLine className="w-3.5 h-3.5 text-[#19a589] mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-700" style={{ fontWeight: 600 }}>
                                  ครั้งที่ {rc.id} · {fmtPoDate(rc.date)}
                                  {rc.note && <span className="text-gray-400 italic" style={{ fontWeight: 400 }}> — "{rc.note}"</span>}
                                </p>
                                <p className="text-gray-500 mt-0.5">
                                  {rc.items.map(e => `${viewPo.items[e.idx]?.productName ?? "?"} x${e.qty}`).join(" · ")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-2 flex-shrink-0">
                    <button onClick={() => setViewPo(null)} className="vet-btn vet-btn-secondary">ปิด</button>
                    <div className="flex items-center gap-2">
                      {poReceivable(viewPo) && (
                        <button
                          onClick={() => { setRecvInitial(undefined); setRecvPo(viewPo); }}
                          className="vet-btn inline-flex items-center gap-1.5 transition-colors duration-150 hover:bg-[rgba(25,165,137,0.15)]"
                          style={{ fontWeight: 600, color: "#0d7c66", border: "1px solid rgba(25,165,137,0.30)", background: "rgba(25,165,137,0.07)" }}>
                          <ArrowDownToLine className="w-3.5 h-3.5" /> รับสินค้า
                        </button>
                      )}
                      <button onClick={() => window.print()} className="vet-btn vet-btn-primary btn-green inline-flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5" /> พิมพ์ใบสั่งซื้อ
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}

          {/* ── หน้าจอรับสินค้า (ดึงข้อมูลจาก PO — รับได้หลายครั้งจนครบ) ── */}
          {recvPo && (
            <ReceiveGoodsModal key={recvPo.id + "-" + (recvPo.receipts?.length || 0)}
              po={recvPo} onClose={() => { setRecvPo(null); setRecvInitial(undefined); }} onReceive={handleReceive}
              initial={recvInitial} />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Receive Goods Modal — รับสินค้าเข้าคลังจากใบสั่งซื้อ ────────────────
/* ค่าตั้งต้นจากเอกสารสแกน (AI) — index ตรงกับ po.items */
interface ReceiveInitial {
  qtys?: (number | undefined)[];
  costs?: (number | undefined)[];
  lots?: (string | undefined)[];
  expiries?: (string | undefined)[];
  note?: string;
}

function ReceiveGoodsModal({ po, onClose, onReceive, initial }: {
  po: PurchaseOrder;
  onClose: () => void;
  onReceive: (po: PurchaseOrder, qtys: number[], date: string, note: string, costs?: number[], lots?: string[], expiries?: string[]) => void;
  initial?: ReceiveInitial;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState(initial?.note ?? "");
  /* ค่าตั้งต้น = ค้างรับทั้งหมด หรือจำนวนจากเอกสารสแกน (กรอกลดลงได้ถ้ารับไม่ครบ) */
  const [qtys, setQtys] = useState<number[]>(() => po.items.map((it, i) =>
    initial?.qtys?.[i] != null ? Math.min(Math.max(0, initial.qtys[i]!), poRemaining(it)) : poRemaining(it)));
  const [costs, setCosts] = useState<number[]>(() => po.items.map((it, i) => initial?.costs?.[i] ?? it.costPerUnit));   // ราคาทุนตอนรับจริง (แก้ได้)
  const [lots, setLots] = useState<string[]>(() => po.items.map((_, i) => initial?.lots?.[i] ?? ""));                   // Lot/Batch ต่อรายการ
  const [expiries, setExpiries] = useState<string[]>(() => po.items.map((_, i) => initial?.expiries?.[i] ?? ""));       // วันหมดอายุต่อรายการ
  const setQty = (i: number, v: number) =>
    setQtys(qs => qs.map((q, idx) => idx === i ? Math.min(Math.max(0, v), poRemaining(po.items[i])) : q));
  const setCostAt = (i: number, v: number) =>
    setCosts(cs => cs.map((c, idx) => idx === i ? Math.max(0, v) : c));
  const setLotAt = (i: number, v: string) =>
    setLots(ls => ls.map((l, idx) => idx === i ? v : l));
  const setExpiryAt = (i: number, v: string) =>
    setExpiries(es => es.map((x, idx) => idx === i ? v : x));
  const totalThis = qtys.reduce((s, q) => s + (q || 0), 0);
  const totalValue = qtys.reduce((s, q, i) => s + (q || 0) * (costs[i] || 0), 0);
  const roundNo = (po.receipts?.length || 0) + 1;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[760px] bg-white rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "min(720px, calc(100vh - 2rem))", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#34d399,#0d7c66)", boxShadow: "0 2px 8px rgba(13,124,102,0.3)" }}>
            <ArrowDownToLine className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] text-gray-900" style={{ fontWeight: 800 }}>รับสินค้าเข้าคลัง</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a]" style={{ fontWeight: 700 }}>ครั้งที่ {roundNo}</span>
            </div>
            <p className="text-[11.5px] text-gray-500 mt-0.5 truncate">
              <span className="font-mono" style={{ fontWeight: 600 }}>{po.poNumber}</span> · {po.supplier} · รับเข้า {po.storeRoom || "คลังหลัก (Main)"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* วันที่รับ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 mb-1 block uppercase tracking-wider" style={{ fontWeight: 700 }}>วันที่รับสินค้า</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#19a589]" />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 mb-1 block uppercase tracking-wider" style={{ fontWeight: 700 }}>Store Room ที่รับเข้า</label>
              <div className="px-2.5 py-1.5 text-[12px] bg-gray-50 border border-gray-100 rounded-lg text-gray-600" style={{ fontWeight: 600 }}>
                {po.storeRoom || "คลังหลัก (Main)"}
              </div>
            </div>
          </div>

          {/* รายการจากใบสั่งซื้อ */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th className="text-left px-3 py-2">สินค้า</th>
                  <th className="text-center px-2 py-2">สั่งซื้อ</th>
                  <th className="text-center px-2 py-2">รับแล้ว</th>
                  <th className="text-center px-2 py-2">ค้างรับ</th>
                  <th className="text-center px-2 py-2">รับครั้งนี้</th>
                  <th className="text-center px-2 py-2">ราคาทุน/หน่วย</th>
                  <th className="text-center px-3 py-2">Lot / Batch</th>
                  <th className="text-center px-3 py-2">วันหมดอายุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {po.items.map((it, i) => {
                  const recv = it.receivedQty || 0;
                  const remain = poRemaining(it);
                  const done = remain === 0;
                  return (
                    <tr key={i} style={done ? { opacity: 0.55 } : undefined}>
                      <td className="px-3 py-2">
                        <p className="text-gray-800" style={{ fontWeight: 600 }}>{it.productName}</p>
                        <p className="text-[10px] text-[#0d7c66] mt-0.5">หน่วยจ่าย (Stock): {it.unit}</p>
                      </td>
                      <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">{it.qty} {it.packUnit || it.unit}</td>
                      <td className="px-2 py-2 text-center" style={{ color: recv > 0 ? "#0284c7" : "#9ca3af", fontWeight: 600 }}>{recv}</td>
                      <td className="px-2 py-2 text-center whitespace-nowrap" style={{ color: done ? "#16a34a" : "#d97706", fontWeight: 700 }}>{done ? "ครบ ✓" : remain}</td>
                      <td className="px-2 py-2">
                        <input type="number" min={0} max={remain} disabled={done}
                          className="w-16 mx-auto block text-sm text-center border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#19a589] disabled:bg-gray-50 disabled:text-gray-300"
                          value={done ? "" : qtys[i]}
                          onChange={e => setQty(i, Number(e.target.value))} />
                      </td>
                      <td className="px-2 py-2">
                        <div className="relative w-20 mx-auto">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">฿</span>
                          <input type="number" min={0} disabled={done}
                            className="w-full text-sm text-right border border-gray-200 rounded-lg pl-5 pr-2 py-1.5 focus:outline-none focus:border-[#19a589] disabled:bg-gray-50 disabled:text-gray-300"
                            value={done ? "" : (costs[i] || "")}
                            onChange={e => setCostAt(i, Number(e.target.value))} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input disabled={done} placeholder="LOT-250707"
                          className="w-24 mx-auto block text-[12px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#19a589] disabled:bg-gray-50 disabled:text-gray-300"
                          value={done ? "" : lots[i]}
                          onChange={e => setLotAt(i, e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="date" disabled={done}
                          className="w-32 mx-auto block text-[12px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#19a589] disabled:bg-gray-50 disabled:text-gray-300"
                          value={done ? "" : expiries[i]}
                          onChange={e => setExpiryAt(i, e.target.value)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-[#f9fafb] border-t border-gray-100 flex items-center justify-between text-[12px]">
              <span className="text-gray-500">รวมรับครั้งนี้</span>
              <span>
                <span className="text-[#0d7c66]" style={{ fontWeight: 800 }}>{totalThis.toLocaleString()} หน่วย</span>
                <span className="text-gray-400"> · มูลค่า </span>
                <span className="text-amber-600" style={{ fontWeight: 700 }}>฿{totalValue.toLocaleString("th-TH", { maximumFractionDigits: 2 })}</span>
              </span>
            </div>
          </div>

          {/* ประวัติการรับก่อนหน้า */}
          {(po.receipts?.length || 0) > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5" style={{ fontWeight: 700 }}>รับไปแล้ว {po.receipts!.length} ครั้ง</p>
              <div className="space-y-1">
                {po.receipts!.map(rc => (
                  <p key={rc.id} className="text-[11px] text-gray-500">
                    <span style={{ fontWeight: 600 }}>ครั้งที่ {rc.id}</span> · {fmtPoDate(rc.date)} · {rc.items.map(e => `${po.items[e.idx]?.productName ?? "?"} x${e.qty}`).join(", ")}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* หมายเหตุ */}
          <div>
            <label className="text-[10px] text-gray-400 mb-1 block uppercase tracking-wider" style={{ fontWeight: 700 }}>หมายเหตุการรับ</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="เช่น กล่องบุบ 1 กล่อง, ของขาดส่ง 2 ชิ้น"
              className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#19a589]" />
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button
            onClick={() => onReceive(po, qtys, date, note, costs, lots, expiries)}
            disabled={totalThis <= 0}
            className="vet-btn vet-btn-primary btn-green inline-flex items-center gap-1.5 disabled:opacity-40">
            <Check className="w-3.5 h-3.5" /> บันทึกรับสินค้า ({totalThis.toLocaleString()})
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stock History Modal ──────────────────────────────────────────────
function genMockHistory(p: StockProduct, realMovements: StockMovement[]) {
  const real = realMovements.filter(m => m.productId === p.id);
  const byNames = ["น.สพ.กวิน", "สพ.ญ.มินตรา", "ระบบ POS", "สพ.ญ.พิมพ์", "น.สพ.ธนกร"];
  const baseRows: Omit<StockMovement, "id" | "productId" | "productName">[] = [
    { type:"in",     qty:50,  costPerUnit:p.costPrice, date:"1 ม.ค. 09:00",  ref:"PO-2025-0001", supplier:p.supplier, lot:"LOT-250101", note:"", expiry:"2026-12-31" },
    { type:"out",    qty:8,   costPerUnit:p.costPrice, date:"3 ม.ค. 14:22",  ref:"INV-O010",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"out",    qty:5,   costPerUnit:p.costPrice, date:"7 ม.ค. 11:05",  ref:"INV-O022",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"in",     qty:100, costPerUnit:p.costPrice, date:"15 ม.ค. 10:00", ref:"PO-2025-0009", supplier:p.supplier, lot:"LOT-250115", note:"", expiry:"2027-01-31" },
    { type:"out",    qty:12,  costPerUnit:p.costPrice, date:"18 ม.ค. 16:00", ref:"INV-O041",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"adjust", qty:-3,  costPerUnit:p.costPrice, date:"20 ม.ค. 09:00", ref:"ADJ-002",      supplier:"", lot:"", note:"ปรับยอดนับจริง" },
    { type:"in",     qty:80,  costPerUnit:p.costPrice, date:"1 ก.พ. 10:30",  ref:"PO-2025-0017", supplier:p.supplier, lot:"LOT-250201", note:"", expiry:"2027-02-28" },
    { type:"out",    qty:20,  costPerUnit:p.costPrice, date:"10 ก.พ. 15:00", ref:"INV-O065",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"out",    qty:10,  costPerUnit:p.costPrice, date:"20 ก.พ. 13:30", ref:"INV-O078",     supplier:"", lot:"", note:"ขาย POS" },
    { type:"in",     qty:50,  costPerUnit:p.costPrice, date:"1 มี.ค. 09:00",  ref:"PO-2025-0028", supplier:p.supplier, lot:"LOT-250301", note:"", expiry: p.expiry ?? "2027-06-30" },
  ];
  const allRows = [...baseRows, ...real.map(m => ({
    type: m.type, qty: m.qty, costPerUnit: m.costPerUnit,
    date: m.date, ref: m.ref, supplier: m.supplier, lot: m.lot, note: m.note, expiry: m.expiry,
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

  /* ส่งออกประวัติความเคลื่อนไหวเป็นไฟล์ CSV */
  const exportHistoryCsv = () => {
    const esc = (v: string | number) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["วันที่","ประเภท","จำนวน","คงเหลือ","อ้างอิง","ล็อต","วันหมดอายุ","โดย"];
    const rows = history.map(mv => {
      const delta = mv.type === "in" ? mv.qty : mv.type === "out" ? -Math.abs(mv.qty) : mv.qty;
      return [
        mv.date, typeCfg[mv.type].label, delta, (mv as any).runningStock, mv.ref || "",
        (mv as any).lot || "", (mv as any).expiry ? fmtPoDate((mv as any).expiry) : "", (mv as any).by || "",
      ].map(esc).join(",");
    });
    const csv = "﻿" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `stock-history-${product.code}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
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
              className="w-full max-w-4xl vet-modal flex flex-col"
              style={{ height: "min(720px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl flex-shrink-0">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon relative overflow-hidden flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
                      <span style={{ lineHeight: 1, fontSize: 18 }}>{product.categoryEmoji}</span>
                      {product.image && (
                        <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover"
                          onError={e => { e.currentTarget.style.display = "none"; }} />
                      )}
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
                        {["วันที่", "ประเภท", "จำนวน", "คงเหลือ", "อ้างอิง", "ล็อต / วันหมดอายุ", "โดย"].map(h => (
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
                            <td className="px-3 py-2.5 text-[11px] whitespace-nowrap">
                              {mv.type === "in" && ((mv as any).lot || (mv as any).expiry) ? (
                                <div className="leading-tight">
                                  {(mv as any).lot && <span className="font-mono text-gray-500">{(mv as any).lot}</span>}
                                  {(mv as any).expiry && (
                                    <span className="block mt-0.5" style={{ fontWeight: 600, color: new Date((mv as any).expiry) < new Date() ? "#dc2626" : "#d97706" }}>
                                      หมดอายุ {fmtPoDate((mv as any).expiry)}
                                    </span>
                                  )}
                                </div>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
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
                    onClick={exportHistoryCsv}
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
const PAGE_SIZE = 10;

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
  const [pos, setPOs]                     = useState<PurchaseOrder[]>(INIT_POS);
  const [poRecvDirect, setPoRecvDirect]   = useState<PurchaseOrder | null>(null);   // รับตามใบ PO จากหน้ารายการสินค้า
  const [movementOpen, setMovementOpen]   = useState(false);
  const [historyTarget, setHistoryTarget] = useState<StockProduct | null>(null);
  const [allMovesOpen, setAllMovesOpen]   = useState(false);                    // modal ความเคลื่อนไหวทั้งหมด
  const [moveFilter, setMoveFilter]       = useState<"all" | "in" | "out" | "adjust">("all");

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "ทั้งหมด" || p.category === catFilter;
    return matchSearch && matchCat;
  }), [products, search, catFilter]);

  /* Export รายการสินค้า (ตามที่กรองอยู่) เป็นไฟล์ CSV */
  const handleExportCsv = () => {
    const headers = ["รหัส","ชื่อสินค้า","หมวดหมู่","หน่วย","ราคาขาย","ราคาทุน","คงเหลือ","ขั้นต่ำ","สูงสุด","ที่จัดเก็บ","ผู้จัดจำหน่าย","วันหมดอายุ","สถานะ"];
    const statusLabel = (p: StockProduct) => { const s = stockStatus(p); return s === "out" ? "ขาด Stock" : s === "low" ? "ใกล้หมด" : "ปกติ"; };
    const esc = (v: string | number) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const rows = filtered.map(p => [
      p.code, p.name, p.category, p.unit, p.sellPrice, p.costPrice, p.stock, p.minStock, p.maxStock,
      p.location, p.supplier, p.expiry ? fmtPoDate(p.expiry) : "", statusLabel(p),
    ].map(esc).join(","));
    const csv = "﻿" + [headers.join(","), ...rows].join("\n");   // BOM ให้ Excel อ่านไทยได้
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().split("T")[0];
    a.href = url; a.download = `stock-${catFilter === "ทั้งหมด" ? "all" : catFilter}-${stamp}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showSnackbar("success", `ส่งออก ${filtered.length} รายการเป็นไฟล์ CSV แล้ว`);
  };

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

  const handleReceive = (mv: Omit<StockMovement, "id">, poId?: number) => {
    const newMv: StockMovement = { ...mv, id: nextId(movements) };
    setMovements(ms => [newMv, ...ms]);
    setProducts(ps => ps.map(p => p.id === mv.productId ? { ...p, stock: p.stock + mv.qty } : p));
    // ถ้าอ้างอิงใบ PO — สะสมยอดรับของรายการนั้นในใบด้วย (สถานะใบขยับ รับบางส่วน/รับครบ)
    if (poId != null) {
      setPOs(ps => ps.map(p => {
        if (p.id !== poId) return p;
        const res = applyPoReceipt(p, p.items.map(it => it.productId === mv.productId ? mv.qty : 0),
          new Date().toISOString().split("T")[0], "รับจากหน้ารายการสินค้า");
        return res ? res.updated : p;
      }));
    }
    setReceiveTarget(null);
    showSnackbar("success", `รับ ${mv.qty} ${mv.productName} เข้าคลังเรียบร้อย`);
  };

  /* รับหลายรายการจากเอกสารสแกน (AI) ทีเดียว — ลง movement + บวกสต๊อก + วันหมดอายุ */
  const handleBulkReceive = (mvs: Omit<StockMovement, "id">[]) => {
    if (!mvs.length) return;
    setMovements(ms => {
      let nid = nextId(ms);
      return [...mvs.map(m => ({ ...m, id: nid++ })), ...ms];
    });
    setProducts(ps => ps.map(p => {
      const mine = mvs.filter(m => m.productId === p.id);
      if (!mine.length) return p;
      const got = mine.reduce((s, m) => s + m.qty, 0);
      const newExpiry = mine.map(m => m.expiry).filter(Boolean).pop();
      return { ...p, stock: p.stock + got, ...(newExpiry ? { expiry: newExpiry } : {}) };
    }));
    setReceiveTarget(null);
    showSnackbar("success", `รับสินค้าจากเอกสารสแกน ${mvs.length} รายการเข้าคลังเรียบร้อย`);
  };

  /* รับสินค้าตามใบ PO — บวกสต๊อกทุกรายการที่รับ + ลง movement + แจ้งผล */
  const handlePoReceipt = (updated: PurchaseOrder, receipt: POReceipt) => {
    const recvItems = receipt.items.map(e => ({ it: updated.items[e.idx], qty: e.qty, cost: e.cost, lot: e.lot, expiry: e.expiry })).filter(r => r.it);
    const dateTxt = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    setMovements(ms => {
      let nid = nextId(ms);
      const newMs: StockMovement[] = recvItems.map(({ it, qty, cost, lot, expiry }) => ({
        id: nid++, productId: it.productId, productName: it.productName, type: "in",
        qty, costPerUnit: cost ?? it.costPerUnit, date: dateTxt, ref: updated.poNumber,
        supplier: updated.supplier, lot: lot ?? "", note: `รับตามใบสั่งซื้อ ครั้งที่ ${receipt.id}`, expiry,
      }));
      return [...newMs, ...ms];
    });
    setProducts(ps => ps.map(p => {
      const rows = recvItems.filter(r => r.it.productId === p.id);
      const got = rows.reduce((s, r) => s + r.qty, 0);
      const newExpiry = rows.map(r => r.expiry).filter(Boolean).pop();   // วันหมดอายุล่าสุดที่รับ
      return got > 0 ? { ...p, stock: p.stock + got, ...(newExpiry ? { expiry: newExpiry } : {}) } : p;
    }));
    showSnackbar("success", `รับสินค้าตามใบ ${updated.poNumber} (ครั้งที่ ${receipt.id}) เข้าคลังเรียบร้อย`);
  };

  /* รับตามใบ PO ที่เปิดจาก modal รับทีละสินค้า / รับด่วน */
  const handlePoReceiveDirect = (po: PurchaseOrder, qtys: number[], date: string, note: string, costs?: number[], lots?: string[], expiries?: string[]) => {
    const res = applyPoReceipt(po, qtys, date, note, costs, lots, expiries);
    if (!res) return;
    setPOs(ps => ps.map(p => p.id === po.id ? res.updated : p));
    setPoRecvDirect(null);
    handlePoReceipt(res.updated, res.receipt);
  };

  const handleSavePO = (po: Omit<PurchaseOrder, "id">) => {
    showSnackbar("success", `${po.status === "sent" ? "ส่ง" : "บันทึกร่าง"} ${po.poNumber} เรียบร้อยแล้ว`);
  };

  const handleSaveMovement = (mv: {
    productId: number; productName: string; type: "in" | "out" | "adjust";
    qty: number; costPerUnit: number; date: string;
    ref: string; supplier: string; lot: string; note: string; expiry?: string;
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
      ps.map((p) => p.id === mv.productId
        ? { ...p, stock: Math.max(0, p.stock + mv.qty), ...(mv.type === "in" && mv.expiry ? { expiry: mv.expiry } : {}) }
        : p)
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
            radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
            radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
            linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)
          `,
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)" }} />
          <div className="absolute -bottom-28 left-1/4 w-[260px] h-[260px] rounded-full" style={{ background: "radial-gradient(circle, rgba(var(--brand-hero-accent), 0.35) 0%, transparent 70%)" }} />
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
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl mb-5 flex items-center gap-3.5 px-4 py-3.5 bg-white"
          style={{ border: "1px solid #eef0f2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
        >
          {/* icon — เรียบ ใช้สีจาง */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(225,29,72,0.06)" }}>
            <AlertTriangle className="w-4 h-4" style={{ color: "#e11d48" }} strokeWidth={2.2} />
          </div>

          {/* ตัวเลขเป็นลำดับสายตา + รายการเป็นบรรทัดจาง */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-5">
              {outItems.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#e11d48" }} />
                  <span className="text-[15px] text-gray-900 tabular-nums" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{outItems.length}</span>
                  <span className="text-[12px] text-gray-400" style={{ fontWeight: 500 }}>หมด</span>
                </span>
              )}
              {lowItems.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#f59e0b" }} />
                  <span className="text-[15px] text-gray-900 tabular-nums" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{lowItems.length}</span>
                  <span className="text-[12px] text-gray-400" style={{ fontWeight: 500 }}>ใกล้หมด</span>
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-gray-400 truncate mt-0.5">
              {[...outItems, ...lowItems].slice(0, 4).map(p => `${p.name} · ${p.stock === 0 ? "หมด" : `เหลือ ${p.stock} ${p.unit}`}`).join("   •   ")}
              {(outItems.length + lowItems.length) > 4 && `   •   +${(outItems.length + lowItems.length) - 4} รายการ`}
            </p>
          </div>

          {/* CTA — ghost เรียบ */}
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
            className="inline-flex items-center gap-1 px-3.5 h-9 rounded-full text-[12.5px] flex-shrink-0 transition-colors whitespace-nowrap"
            style={{ fontWeight: 600, color: "#e11d48", background: "rgba(225,29,72,0.05)", border: "1px solid rgba(225,29,72,0.18)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(225,29,72,0.10)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(225,29,72,0.05)"; }}
          >
            สร้าง PO <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* ─ Table Panel ─ (สูงตามเนื้อหา 10 แถว ไม่ล็อกความสูง/ไม่เลื่อนภายใน) */}
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>

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
                onClick={handleExportCsv}
                className="ml-auto flex items-center gap-2 h-9 px-4 rounded-full text-[13px] transition-all duration-200"
                style={{ background: "#f9fafb", color: "#475569", fontWeight: 600, border: "1px solid #e5e7eb" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                title="ส่งออกรายการที่กรองอยู่เป็นไฟล์ CSV"
              >
                <FileDown className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={() => { const p = products.find(p => p.type === "stock"); if (p) setReceiveTarget(p); }}
                className="flex items-center gap-2 h-9 px-4 rounded-full text-[13px] transition-all duration-200"
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
          <div className="overflow-x-auto">
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
                            {p.expiry && (
                              <p className="text-[10px] mt-0.5 inline-flex items-center gap-1" style={{ color: new Date(p.expiry) < new Date() ? "#dc2626" : "#d97706", fontWeight: 600 }}>
                                หมดอายุ {fmtPoDate(p.expiry)}
                              </p>
                            )}
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
                          {/* ปุ่มลบสินค้าถูกถอดออก — รายการในตารางคือสินค้าที่รับเข้าคลังแล้ว */}
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

          {/* Recent movements */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#fafafa] flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>ความเคลื่อนไหวล่าสุด</span>
              </div>
              <button onClick={() => { setMoveFilter("all"); setAllMovesOpen(true); }} className="text-xs text-[#19a589] hover:underline" style={{ fontWeight: 600 }}>ดูทั้งหมด ({movements.length})</button>
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
        pos={pos}
        onOpenPoReceive={(po) => { setReceiveTarget(null); setPoRecvDirect(po); }}
        products={products}
        onBulkReceive={handleBulkReceive}
      />
      <POModal
        open={poOpen}
        onClose={() => { setPoOpen(false); setPoInitItems(undefined); }}
        onSave={handleSavePO}
        products={products}
        initialItems={poInitItems}
        pos={pos}
        setPOs={setPOs}
        onReceipt={handlePoReceipt}
      />
      {/* หน้าจอรับตามใบสั่งซื้อ — เปิดจาก modal รับทีละสินค้า */}
      <AnimatePresence>
        {poRecvDirect && (
          <ReceiveGoodsModal key={poRecvDirect.id + "-" + (poRecvDirect.receipts?.length || 0)}
            po={poRecvDirect} onClose={() => setPoRecvDirect(null)} onReceive={handlePoReceiveDirect} />
        )}
      </AnimatePresence>
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

      {/* ── Modal: ความเคลื่อนไหวทั้งหมด ── */}
      <AnimatePresence>
        {allMovesOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
            onClick={() => setAllMovesOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg h-[600px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#f0fdf9] flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-4 h-4 text-[#19a589]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] text-[#1e2939]" style={{ fontWeight: 700 }}>ความเคลื่อนไหวทั้งหมด</h3>
                    <p className="text-[11px] text-gray-400">{movements.length} รายการ</p>
                  </div>
                </div>
                <button onClick={() => setAllMovesOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* filter chips */}
              <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2 flex-shrink-0">
                {([["all","ทั้งหมด"],["in","รับเข้า"],["out","จ่ายออก"],["adjust","ปรับ"]] as const).map(([k, label]) => {
                  const count = k === "all" ? movements.length : movements.filter(m => m.type === k).length;
                  const on = moveFilter === k;
                  return (
                    <button key={k} onClick={() => setMoveFilter(k)}
                      className="px-3 py-1.5 rounded-full text-[12px] transition-all"
                      style={{ fontWeight: 600,
                        background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#f1f5f9",
                        color: on ? "#fff" : "#64748b" }}>
                      {label} {count}
                    </button>
                  );
                })}
              </div>
              {/* list */}
              <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                {movements.filter(m => moveFilter === "all" || m.type === moveFilter).map(mv => {
                  const isIn = mv.type === "in"; const isAdj = mv.type === "adjust";
                  return (
                    <div key={mv.id} className="group/mv flex items-start gap-3 px-5 py-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${isIn ? "bg-[#19a589]" : isAdj ? "bg-blue-400" : "bg-orange-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#1e2939] truncate" style={{ fontWeight: 600 }}>
                          {isIn ? "รับ" : isAdj ? "ปรับ Stock" : "ขาย"} {mv.productName}
                        </p>
                        <p className="text-[11px] text-gray-400">{mv.date} · {mv.ref || "—"}{mv.supplier ? ` · ${mv.supplier}` : ""}{mv.lot ? ` · ${mv.lot}` : ""}{mv.expiry ? ` · หมดอายุ ${fmtPoDate(mv.expiry)}` : ""}{mv.note ? ` · ${mv.note}` : ""}</p>
                      </div>
                      <span className="text-[13px] flex-shrink-0" style={{ fontWeight: 700, color: isIn ? "#19a589" : isAdj ? "#3b82f6" : "#f97316" }}>
                        {isIn ? "+" : ""}{mv.qty > 0 && !isIn ? "-" : ""}{Math.abs(mv.qty)} ชิ้น
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover/mv:opacity-100 transition-opacity">
                        <button onClick={() => openEditMovement(mv)} title="แก้ไข" className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteMovement(mv)} title="ลบ" className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {movements.filter(m => moveFilter === "all" || m.type === moveFilter).length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">ไม่มีรายการในหมวดนี้</div>
                )}
              </div>
              {/* footer */}
              <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
                <button onClick={() => { setAllMovesOpen(false); setMovementOpen(true); }}
                  className="w-full h-10 rounded-full text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                  + บันทึกความเคลื่อนไหวใหม่
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
