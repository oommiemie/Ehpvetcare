import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, ShoppingCart, CreditCard, User, Phone, Hash,
  Save, Plus, Trash2, Tag, ChevronDown, AlertCircle, Pill, Stethoscope,
  Banknote, Smartphone, QrCode, Wallet, ArrowRight, Pencil, Printer, X,
  MapPin, Scissors, ArrowLeft, CheckCircle2, BedDouble, Sparkles,
  ClipboardList, Ban, Eye, Calendar, RotateCcw, Check,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { useClinicData } from "../contexts/ClinicDataContext";
import { useLang } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

/* ─────────────────────── Visit Invoice Data ─────────────────────── */
const petImages: Record<string, string> = {
  "INV-2026-0412": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80", // บัดดี้ HN-2026-001
  "INV-2026-0411": "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=200&q=80", // ลูน่า HN-2026-011
  "INV-2026-0410": "https://images.unsplash.com/photo-1608138498905-05b5cd816a36?w=200&q=80", // แม็กซ์ HN-2026-003
  "INV-2026-0409": "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=200&q=80", // โคโค่ HN-2026-042
  "INV-2026-0408": "https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?w=200&q=80", // ชาร์ลี HN-2026-005
};
const invoices = [
  { id: "INV-2026-0412", pet: "บัดดี้",  breed: "โกลเดน รีทรีฟเวอร์", owner: "สมศักดิ์ ใจดี",    vet: "น.สพ. วิชัย พรมดี",       date: "28 ก.พ. 2569", status: "ยังไม่ชำระ", animal: "🐕", amount: 2460 },
  { id: "INV-2026-0411", pet: "ลูน่า",   breed: "เปอร์เซีย",          owner: "วรรณา ศรีสุข",     vet: "สพ.ญ. อรนุช สุขสวัสดิ์", date: "28 ก.พ. 2569", status: "ชำระแล้ว",   animal: "🐈", amount: 850  },
  { id: "INV-2026-0410", pet: "แม็กซ์",  breed: "แบล็ก แลบราดอร์",   owner: "ประพันธ์ มงคล",    vet: "น.สพ. วิชัย พรมดี",       date: "27 ก.พ. 2569", status: "ชำระแล้ว",   animal: "🐕", amount: 3800 },
  { id: "INV-2026-0409", pet: "โคโค่",   breed: "ฮอลแลนด์ลอป",       owner: "อรอนงค์ พรมเสน",   vet: "สพ.ญ. มาลี รักสัตว์",    date: "27 ก.พ. 2569", status: "คืนเงินแล้ว", animal: "🐇", amount: 1200 },
  { id: "INV-2026-0408", pet: "ชาร์ลี",  breed: "บีเกิ้ล",            owner: "ธีรพล วงศ์สุวรรณ", vet: "สพ.ญ. อรนุช สุขสวัสดิ์", date: "26 ก.พ. 2569", status: "ชำระแล้ว",   animal: "🐕", amount: 650  },
  { id: "INV-2026-0407", pet: "มิ้ว",    breed: "สก็อตติช โฟลด์",     owner: "กัญญา สุวรรณ",     vet: "สพ.ญ. มาลี รักสัตว์",    date: "25 ก.พ. 2569", status: "ยังไม่ชำระ", animal: "🐈", amount: 1750 },
  { id: "INV-2026-0406", pet: "ป๊อบ",    breed: "ปอมเมอเรเนียน",     owner: "วิชัย มงคล",       vet: "น.สพ. วิชัย พรมดี",       date: "25 ก.พ. 2569", status: "ชำระแล้ว",   animal: "🐕", amount: 990  },
];
const statusCfg = (s: string) => {
  if (s === "ชำระแล้ว")   return { cls: "bg-[#19a589]/10 text-[#0d7c66]", dot: "bg-[#19a589]" };
  if (s === "ยังไม่ชำระ") return { cls: "bg-amber-50 text-amber-700",     dot: "bg-amber-500" };
  return { cls: "bg-red-50 text-red-600", dot: "bg-red-400" };
};
const statuses = ["ทั้งหมด", "ยังไม่ชำระ", "ชำระแล้ว", "คืนเงินแล้ว"];

/* ── Mock Visit Line Items ── */
interface VisitLineItem { name: string; type: "service" | "med"; qty: number; unit: string; price: number; }
const visitItems: Record<string, VisitLineItem[]> = {
  "INV-2026-0412": [
    { name: "ค่าตรวจรักษา", type: "service", qty: 1, unit: "ครั้ง", price: 500 },
    { name: "ค่าฉีดวัคซีน 5 โรค", type: "service", qty: 1, unit: "เข็ม", price: 850 },
    { name: "Amoxicillin 250mg", type: "med", qty: 30, unit: "เม็ด", price: 15 },
    { name: "Prednisolone 5mg", type: "med", qty: 20, unit: "เม็ด", price: 8 },
    { name: "ค่าเอกซเรย์", type: "service", qty: 1, unit: "ครั้ง", price: 600 },
  ],
  "INV-2026-0411": [
    { name: "ค่าตรวจรักษา", type: "service", qty: 1, unit: "ครั้ง", price: 500 },
    { name: "Vitamin B Complex", type: "med", qty: 1, unit: "ขวด", price: 120 },
    { name: "ค่าตัดเล็บ", type: "service", qty: 1, unit: "ครั้ง", price: 80 },
    { name: "Metronidazole 200mg", type: "med", qty: 10, unit: "เม็ด", price: 12 },
  ],
  "INV-2026-0410": [
    { name: "ค่าตรวจรักษา", type: "service", qty: 1, unit: "ครั้ง", price: 500 },
    { name: "ค่าผ่าตัดทำหมัน", type: "service", qty: 1, unit: "ครั้ง", price: 2500 },
    { name: "ค่ายาระงับความเจ็บปวด", type: "med", qty: 5, unit: "เม็ด", price: 50 },
    { name: "Amoxicillin 250mg", type: "med", qty: 14, unit: "เม็ด", price: 15 },
    { name: "ค่าดมยาสลบ", type: "service", qty: 1, unit: "ครั้ง", price: 590 },
  ],
  "INV-2026-0409": [
    { name: "ค่าตรวจรักษา", type: "service", qty: 1, unit: "ครั้ง", price: 500 },
    { name: "Ivermectin drops", type: "med", qty: 1, unit: "ขวด", price: 250 },
    { name: "ค่าเก็บเหาหู", type: "service", qty: 1, unit: "ครั้ง", price: 120 },
    { name: "Vitamin B Complex", type: "med", qty: 2, unit: "ขวด", price: 120 },
    { name: "ค่าอาบน้ำตัดขน", type: "service", qty: 1, unit: "ครั้ง", price: 210 },
  ],
  "INV-2026-0408": [
    { name: "ค่าตรวจรักษา", type: "service", qty: 1, unit: "ครั้ง", price: 500 },
    { name: "Metronidazole 200mg", type: "med", qty: 10, unit: "เม็ด", price: 12 },
    { name: "ค่าตัดเล็บ", type: "service", qty: 1, unit: "ครั้ง", price: 80 },
  ],
  "INV-2026-0407": [
    { name: "ค่าตรวจรักษา", type: "service", qty: 1, unit: "ครั้ง", price: 500 },
    { name: "ค่าฉีดวัคซีน (แมว)", type: "service", qty: 1, unit: "เข็ม", price: 750 },
    { name: "Prednisolone 5mg", type: "med", qty: 30, unit: "เม็ด", price: 8 },
    { name: "ค่าเก็บเหาหู", type: "service", qty: 1, unit: "ครั้ง", price: 120 },
    { name: "Vitamin B Complex", type: "med", qty: 1, unit: "ขวด", price: 120 },
  ],
  "INV-2026-0406": [
    { name: "ค่าตรวจรักษา", type: "service", qty: 1, unit: "ครั้ง", price: 500 },
    { name: "Amoxicillin 250mg", type: "med", qty: 20, unit: "เม็ด", price: 15 },
    { name: "ค่าตัดเล็บ", type: "service", qty: 1, unit: "ครั้ง", price: 80 },
  ],
};

/* ─────────────────────── Retail POS Data ─────────────────────── */
// medicines & services ถูกดึงจาก ClinicDataContext แบบ real-time ใน RetailTab
const quickDiscounts = [
  { label: "สมาชิก VIP 10%",        type: "pct", value: 10  },
  { label: "สมาชิก Gold 5%",        type: "pct", value: 5   },
  { label: "ส่วนลดพิเศษ ฿100",      type: "fix", value: 100 },
  { label: "โปรวัดชั้น 15%",        type: "pct", value: 15  },
];

interface CartItem { id: string; name: string; unit: string; price: number; qty: number; }

const cv = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const iv = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" as const } } };

/* ═══════════════════════════════════════════════════════════════════ */
/*  Visit Payment Modal                                                */
/* ═══════════════════════════════════════════════════════════════════ */
type InvoiceType = typeof invoices[0];

function VisitPaymentModal({ inv, onClose, overrideItems, overrideDiscount, isGroomingBill }: { inv: InvoiceType; onClose: () => void; overrideItems?: CartItem[]; overrideDiscount?: number; isGroomingBill?: boolean; }) {
  const { showSnackbar } = useSnackbar();
  const rawItems = visitItems[inv.id] ?? [];
  const isPaid   = inv.status !== "ยังไม่ชำระ";

  // ── Cart (pre-loaded from visit items or override) ──
  const [cart, setCart] = useState<CartItem[]>(() =>
    overrideItems ?? rawItems.map((it, i) => ({ id: `v${i}`, name: it.name, unit: it.unit, price: it.price, qty: it.qty }))
  );
  const [itemDiscounts, setItemDiscounts] = useState<Record<string, { value: string; type: "fix" | "pct" }>>({});
  const [discountAmt, setDiscountAmt]       = useState(overrideDiscount ?? 0);
  const [discountReason, setDiscountReason] = useState(overrideDiscount && overrideDiscount > 0 ? "ส่วนลดบริการอาบน้ำ" : "");
  const [discountInput, setDiscountInput]   = useState("");
  const [discountType, setDiscountType]     = useState<"fix" | "pct">("fix");
  const [includeVat, setIncludeVat]         = useState(true);
  const [showDiscountPanel, setShowDiscountPanel] = useState(true);
  const [pickupLocation, setPickupLocation] = useState("ห้องยา");

  // ── Payment ──
  type PayMethod = "cash" | "card" | "transfer" | "qr" | "deposit";
  const [payMethod, setPayMethod]       = useState<PayMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [cardAmount, setCardAmount]     = useState("");
  const [cardType, setCardType]         = useState("Visa");
  const [cardLast4, setCardLast4]       = useState("");
  const [transferRef, setTransferRef]   = useState("");
  const [depositAmt, setDepositAmt]     = useState("");
  const MOCK_DEPOSIT = 500;
  const [receiptData, setReceiptData]   = useState<ReceiptData | null>(null);

  // ── Helpers ──
  const getItemDiscountAmt = (item: CartItem) => {
    const d = itemDiscounts[item.id];
    if (!d || !d.value) return 0;
    const v = parseFloat(d.value) || 0;
    const gross = item.price * item.qty;
    return d.type === "pct" ? Math.round(gross * v / 100) : Math.min(v, gross);
  };
  const setItemDiscount = (id: string, value: string, type: "fix" | "pct") =>
    setItemDiscounts(prev => ({ ...prev, [id]: { value, type } }));
  const changeQty = (id: string, delta: number) =>
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
    setItemDiscounts(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  // ── Totals ──
  const subtotal           = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totalItemDiscounts = cart.reduce((s, c) => s + getItemDiscountAmt(c), 0);
  const afterItemDisc      = subtotal - totalItemDiscounts;
  const afterDisc          = Math.max(0, afterItemDisc - discountAmt);
  const vatAmt             = includeVat ? 0 : Math.round(afterDisc * 0.07);
  const total              = afterDisc + vatAmt;
  const cashChange         = Math.max(0, (parseFloat(cashReceived) || 0) - total);
  const depositLeft        = Math.max(0, MOCK_DEPOSIT - (parseFloat(depositAmt) || 0));

  const applyQuickDiscount = (d: typeof quickDiscounts[0]) => {
    const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    setDiscountAmt(d.type === "pct" ? Math.round(sub * d.value / 100) : d.value);
    setDiscountReason(d.label); setDiscountInput(String(d.value));
  };
  const applyManualDiscount = () => {
    const v = parseFloat(discountInput) || 0;
    setDiscountAmt(discountType === "pct" ? Math.round(afterItemDisc * v / 100) : v);
    if (!discountReason) setDiscountReason("ส่วนลดพิเศษ");
  };
  const cancelDiscount = () => { setDiscountAmt(0); setDiscountReason(""); setDiscountInput(""); };

  const PAY_METHODS: { id: PayMethod; label: string; Icon: React.ElementType }[] = [
    { id: "cash",     label: "เงินสด",           Icon: Banknote   },
    { id: "card",     label: "บัตรเครดิต/เดบิต", Icon: CreditCard  },
    { id: "transfer", label: "โอนเงิน",           Icon: Smartphone  },
    { id: "qr",       label: "PromptPay QR",      Icon: QrCode      },
    { id: "deposit",  label: "หักเงินค่ามัดจำ",   Icon: Wallet      },
  ];

  const openReceipt = () => {
    const now = new Date();
    const monthsTh = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    setReceiptData({
      receiptNo: `R-${now.getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`,
      date: `${now.getDate()} ${monthsTh[now.getMonth()]} ${now.getFullYear() + 543} เวลา ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`,
      customerName: inv.owner, phone: "", petName: `${inv.pet} (${inv.breed})`,
      items: cart.map(c => ({ name: c.name, unit: c.unit, qty: c.qty, price: c.price, discAmt: getItemDiscountAmt(c) })),
      subtotal, totalItemDiscounts, discountAmt, discountReason, includeVat, vatAmt, total, payMethod,
      cashReceived: payMethod === "cash" ? (parseFloat(cashReceived) || total) : undefined,
      cashChange:   payMethod === "cash" ? cashChange : undefined,
    });
    showSnackbar("success", "ชำระเงินสำเร็จแล้ว");
  };

  const img    = petImages[inv.id];
  const sc     = statusCfg(inv.status);
  const banner = inv.status === "ชำระแล้ว"   ? "from-[#19a589]/20 to-[#e0f5f0]" :
                 inv.status === "ยังไม่ชำระ" ? "from-amber-200/60 to-amber-50"  : "from-red-200/60 to-red-50";

  return (
    <>
      <AnimatePresence>
        <>
        <motion.div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden"
            style={{ maxWidth: "1100px", maxHeight: "90vh" }}
            initial={{ scale: 0.93, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}>

            {/* ── Header ── */}
            <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(25,165,137,0.1)] flex-shrink-0 rounded-t-3xl"
              style={{ backgroundImage: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 50%, #f3faf8 100%)" }}>
              <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
              <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center"
                    style={{ background: receiptData ? "linear-gradient(135deg,#0d7c66,#19a589)" : "linear-gradient(135deg, #19a589, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                    {receiptData ? <CheckCircle2 className="w-5 h-5 text-white" /> : isGroomingBill ? <Scissors className="w-5 h-5 text-white" /> : <CreditCard className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-gray-900" style={{ fontWeight: 700 }}>
                      {receiptData ? "ใบเสร็จรับเงิน" : isGroomingBill ? "ชำระเงินค่าบริการอาบน้ำ" : "ชำระเงินจาก Visit"}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">{receiptData ? `#${receiptData.receiptNo}` : `${inv.id} · ${inv.date}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${sc.cls}`} style={{ fontWeight: 500 }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{inv.status}
                  </span>
                  <button onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Receipt (inline, after payment confirmed) ── */}
            {receiptData ? (
              <ReceiptInlinePage
                data={receiptData}
                closeLabel="ปิด"
                onClose={() => { setReceiptData(null); onClose(); }}
              />
            ) : isPaid ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: inv.status === "ชำระแล้ว" ? "#e0f5f0" : "#fee2e2" }}>
                  {inv.status === "ชำระแล้ว" ? <CreditCard className="w-7 h-7 text-[#19a589]" /> : <ArrowRight className="w-7 h-7 text-red-400" />}
                </div>
                <div>
                  <p className="text-gray-700" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    {inv.status === "ชำระแล้ว" ? "ชำระเงินเรียบร้อยแล้ว" : "บิลนี้คืนเงินแล้ว"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">ยอดรวม ฿{subtotal.toLocaleString()}.00</p>
                </div>
                <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>ปิด</button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden">

                {/* ══ LEFT: Pet card ══ */}
                <div className="sm:w-64 flex-shrink-0 sm:border-r border-b sm:border-b-0 border-gray-100 bg-white flex flex-col sm:overflow-y-auto">
                  <div className={`relative h-24 bg-gradient-to-br ${banner} flex-shrink-0`}>
                    <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-[4.5rem] h-[4.5rem] rounded-full bg-white ring-4 ring-white overflow-hidden shadow-lg">
                      {img ? <img src={img} alt={inv.pet} className="w-full h-full object-cover" />
                           : <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">{inv.animal}</div>}
                    </div>
                  </div>
                  <div className="px-4 pt-12 pb-4 text-center">
                    <p className="text-gray-900" style={{ fontWeight: 700, fontSize: "1rem" }}>{inv.pet}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{inv.breed}</p>
                    <div className="mt-3 space-y-2 text-left">
                      {([
                        { label: "เจ้าของ",                                   value: inv.owner, color: "text-gray-700" },
                        { label: isGroomingBill ? "ช่างทำขน" : "สัตวแพทย์", value: inv.vet,   color: "text-[#0d7c66]" },
                        { label: "วันที่",                                    value: inv.date,  color: "text-gray-600" },
                        { label: "เลขบิล",                                   value: inv.id,    color: "text-gray-500" },
                      ] as { label: string; value: string; color: string }[]).map(row => (
                        <div key={row.label} className="bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-gray-400 mb-0.5" style={{ fontSize: "0.62rem" }}>{row.label}</p>
                          <p className={`text-xs ${row.color} truncate`} style={{ fontWeight: 600 }}>{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {!isGroomingBill && (
                    <div className="mx-4 mb-4 flex-shrink-0">
                      <div className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: "#fff8f0", border: "1.5px solid #fed7aa" }}>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="text-amber-700" style={{ fontSize: "0.6rem", fontWeight: 600 }}>ยอดค้างชำระ</p>
                          <p className="text-amber-600" style={{ fontSize: "0.75rem", fontWeight: 700 }}>฿2,000.00</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ══ RIGHT: Bill + Payment ══ */}
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#FEFBF8]">
                  <div className="p-5 space-y-4">

                    {/* Bill header */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>สรุปบิล</span>
                      <span className="text-xs text-gray-400">{cart.length} รายการ</span>
                    </div>

                    {/* Cart table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                      {cart.length === 0 ? (
                        <div className="py-10 text-center">
                          <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">ไม่มีรายการ</p>
                        </div>
                      ) : (<>
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100" style={{ background: "#f8faf8" }}>
                          <span className="flex-1 min-w-0 text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600, letterSpacing: "0.04em" }}>รายการ</span>
                          <span className="w-14 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>หมวด</span>
                          <span className="w-20 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>จำนวน</span>
                          <span className="w-16 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>ราคา/หน่วย</span>
                          <span className="w-24 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>ส่วนลด</span>
                          <span className="w-14 text-right text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>VAT</span>
                          <span className="w-16 text-right text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>รวม</span>
                          <span className="w-10 text-right text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>ลบ</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {cart.map(item => {
                            const isService = isGroomingBill ? true : rawItems.find(r => r.name === item.name)?.type === "service";
                            const itemGross = item.price * item.qty;
                            const itemDisc  = getItemDiscountAmt(item);
                            const itemNet   = itemGross - itemDisc;
                            const itemVat   = Math.round(itemNet * 7 / 107 * 100) / 100;
                            const discState = itemDiscounts[item.id] ?? { value: "", type: "fix" as const };
                            return (
                              <div key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                                  <p className="text-gray-400" style={{ fontSize: "0.6rem" }}>฿{item.price.toLocaleString()} / {item.unit}</p>
                                </div>
                                <div className="w-14 flex justify-center">
                                  <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "0.58rem", fontWeight: 600, background: isService ? "#e8f5e9" : "#e3f2fd", color: isService ? "#2e7d32" : "#1565c0" }}>{isService ? "บริการ" : "ยา"}</span>
                                </div>
                                <div className="w-20 flex items-center justify-center gap-1">
                                  <button onClick={() => changeQty(item.id, -1)} className="w-5 h-5 rounded-full bg-gray-100 hover:bg-[#19a589]/10 hover:text-[#19a589] flex items-center justify-center text-gray-500 transition-colors" style={{ fontSize: "0.8rem" }}>−</button>
                                  <span className="w-5 text-xs text-center text-gray-800" style={{ fontWeight: 700 }}>{item.qty}</span>
                                  <button onClick={() => changeQty(item.id, 1)} className="w-5 h-5 rounded-full bg-gray-100 hover:bg-[#19a589]/10 hover:text-[#19a589] flex items-center justify-center text-gray-500 transition-colors" style={{ fontSize: "0.8rem" }}>+</button>
                                </div>
                                <span className="w-16 text-gray-600 text-center" style={{ fontSize: "0.7rem", fontWeight: 500 }}>฿{item.price.toLocaleString()}</span>
                                <div className="w-24 flex items-center gap-1 justify-end">
                                  <input type="number" min="0" value={discState.value} onChange={e => setItemDiscount(item.id, e.target.value, discState.type)} placeholder="0"
                                    className="w-12 text-right bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#19a589]/30 transition-all"
                                    style={{ fontSize: "0.65rem", color: itemDisc > 0 ? "#e53935" : "#9ca3af" }} />
                                  <select value={discState.type} onChange={e => setItemDiscount(item.id, discState.value, e.target.value as "fix" | "pct")}
                                    className="bg-gray-50 border border-gray-200 rounded-lg py-0.5 pl-1 pr-1 focus:outline-none cursor-pointer text-gray-500" style={{ fontSize: "0.6rem" }}>
                                    <option value="fix">฿</option><option value="pct">%</option>
                                  </select>
                                </div>
                                <span className="w-14 text-gray-500 text-right" style={{ fontSize: "0.7rem", fontWeight: 500 }}>฿{itemVat.toFixed(2)}</span>
                                <div className="w-16 text-right">
                                  {itemDisc > 0 && <p className="text-gray-300 line-through" style={{ fontSize: "0.6rem" }}>฿{itemGross.toLocaleString()}</p>}
                                  <span className="text-gray-800" style={{ fontSize: "0.75rem", fontWeight: 700 }}>฿{itemNet.toLocaleString()}</span>
                                </div>
                                <div className="w-10 flex justify-end">
                                  <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>)}
                    </div>

                    {/* Discount panel */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <button onClick={() => setShowDiscountPanel(p => !p)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-gray-700" style={{ fontWeight: 600 }}><Tag className="w-4 h-4 text-[#19a589]" /> ส่วนลดบิล</div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDiscountPanel ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {showDiscountPanel && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-gray-100">
                            <div className="p-4 space-y-4">
                              <div>
                                <p className="text-xs text-gray-400 mb-2">ส่วนลดสำเร็จรูป</p>
                                <div className="flex flex-wrap gap-2">
                                  {quickDiscounts.map(d => (
                                    <button key={d.label} onClick={() => applyQuickDiscount(d)}
                                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${discountReason === d.label ? "bg-[#19a589] text-white border-[#19a589]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#19a589]/40"}`}
                                      style={{ fontWeight: discountReason === d.label ? 600 : 400 }}>{d.label}</button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs text-gray-400 block mb-1">จำนวนส่วนลด</label>
                                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#19a589]/20 transition-all">
                                    <input type="number" value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="0"
                                      className="flex-1 pl-3 pr-1 py-2 text-sm bg-transparent focus:outline-none min-w-0" />
                                    <div className="flex-shrink-0 border-l border-gray-200">
                                      <div className="relative">
                                        <select value={discountType} onChange={e => setDiscountType(e.target.value as "fix" | "pct")}
                                          className="h-full pl-2 pr-7 py-2 text-xs bg-white text-gray-600 focus:outline-none appearance-none cursor-pointer hover:bg-gray-50" style={{ fontWeight: 500 }}>
                                          <option value="fix">฿ บาท</option><option value="pct">% เปอร์เซ็นต์</option>
                                        </select>
                                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400 block mb-1">เหตุผล</label>
                                  <textarea value={discountReason} onChange={e => setDiscountReason(e.target.value)} placeholder="ระบุเหตุผลส่วนลด..." rows={2}
                                    className="vet-textarea" />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button onClick={cancelDiscount} className="text-xs px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">ยกเลิก</button>
                                  <button onClick={applyManualDiscount} className="text-xs px-4 py-1.5 rounded-full bg-[#19a589] text-white hover:bg-[#0d7c66] transition-all" style={{ fontWeight: 600 }}>ใช้ส่วนลด</button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* VAT + Summary */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                        <div className="relative bg-[#f3f4f6] rounded-full p-0.5 flex text-xs">
                          <motion.div layout transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="absolute top-0.5 bottom-0.5 bg-white rounded-full shadow-sm"
                            style={{ width: "calc(50% - 2px)", left: includeVat ? "2px" : "calc(50%)" }} />
                          <button onClick={() => setIncludeVat(true)} className="relative z-10 px-4 py-1.5 rounded-full transition-colors text-[12px]" style={{ fontWeight: includeVat ? 600 : 400, color: includeVat ? "#19a589" : "#6a7282" }}>รวม VAT</button>
                          <button onClick={() => setIncludeVat(false)} className="relative z-10 px-4 py-1.5 rounded-full transition-colors text-[12px]" style={{ fontWeight: !includeVat ? 600 : 400, color: !includeVat ? "#19a589" : "#6a7282" }}>ไม่รวม VAT</button>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-500"><span>ยอดรวมรายการ</span><span>฿{subtotal.toLocaleString()}</span></div>
                        {totalItemDiscounts > 0 && <div className="flex justify-between text-red-400"><span>ส่วนลดต่อรายการ</span><span>−฿{totalItemDiscounts.toLocaleString()}</span></div>}
                        {discountAmt > 0 && <div className="flex justify-between text-[#19a589]"><span>ส่วนลดบิล {discountReason && <span className="opacity-70">({discountReason})</span>}</span><span>−฿{discountAmt.toLocaleString()}</span></div>}
                        <div className="flex justify-between text-gray-500"><span>VAT 7%</span><span>฿{vatAmt.toLocaleString()}</span></div>
                      </div>
                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ยอดชำระทั้งหมด</span>
                        <span className="text-[#19a589]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>฿{total.toLocaleString()}.00</span>
                      </div>
                    </div>

                    {/* รับยาที่ */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <label className="text-[10px] text-gray-400 mb-1.5 flex items-center gap-1" style={{ fontWeight: 500 }}>
                        <MapPin className="w-3 h-3" />รับยาที่
                      </label>
                      <div className="relative">
                        <select
                          value={pickupLocation}
                          onChange={e => setPickupLocation(e.target.value)}
                          className="w-full px-3 py-[7px] text-sm bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/40 appearance-none pr-8 text-gray-700 cursor-pointer transition-all"
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

                    {/* Payment section */}
                    <div className="rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(160deg,#f0faf1 0%,#ffffff 45%)", border: "1.5px solid #d4ead6" }}>
                      <div className="px-5 pt-5 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#19a589] flex items-center justify-center shadow-sm"><CreditCard className="w-3.5 h-3.5 text-white" /></div>
                            <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ชำระเงิน</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องชำระ</p>
                            <p className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span className="text-sm">.00</span></p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                          {PAY_METHODS.map(({ id, label, Icon }) => (
                            <button key={id} onClick={() => setPayMethod(id)}
                              className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                              style={{ background: payMethod === id ? "#19a589" : "rgba(255,255,255,0.85)", boxShadow: payMethod === id ? "0 4px 14px rgba(25,165,137,0.35)" : "0 1px 3px rgba(0,0,0,0.07)", border: payMethod === id ? "1.5px solid transparent" : "1.5px solid #e9ecef", transform: payMethod === id ? "translateY(-1px)" : "none" }}>
                              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: payMethod === id ? "white" : "#6b7280" }} />
                              <span className="text-center leading-tight" style={{ fontSize: "0.58rem", fontWeight: payMethod === id ? 600 : 400, color: payMethod === id ? "white" : "#6b7280" }}>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mx-5 border-t border-dashed border-[#c8e6ca]" />
                      <AnimatePresence mode="wait">
                        <motion.div key={payMethod} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18, ease: "easeOut" }} className="px-5 py-4 space-y-3">

                          {payMethod === "cash" && (<>
                            <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                              <div><p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องชำระ</p><p className="text-gray-800" style={{ fontWeight: 800, fontSize: "1.45rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.85rem" }}>.00</span></p></div>
                              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center"><Banknote className="w-5 h-5 text-[#19a589]" /></div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>จำนวนเงินที่รับ</label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" style={{ fontWeight: 500 }}>฿</span>
                                <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder={String(total)}
                                  className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all shadow-sm" style={{ fontWeight: 600 }} />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {[100, 500, 1000, 5000].map(v => (
                                <button key={v} onClick={() => setCashReceived(String(v))} className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#19a589]/50 hover:text-[#19a589] transition-all shadow-sm" style={{ fontWeight: 500 }}>฿{v.toLocaleString()}</button>
                              ))}
                              <button onClick={() => setCashReceived(String(total))} className="text-xs px-3 py-1.5 rounded-full bg-[#19a589] border border-[#19a589] text-white hover:bg-[#0d7c66] transition-all shadow-sm" style={{ fontWeight: 600 }}>พอดี</button>
                            </div>
                            <div className="flex justify-between items-center rounded-xl px-4 py-3 text-xs" style={{ background: cashChange > 0 ? "linear-gradient(135deg,#f0faf1,#e8f5e9)" : "#f9fafb", border: `1.5px solid ${cashChange > 0 ? "#c8e6ca" : "#e5e7eb"}` }}>
                              <span className="text-gray-500">เงินทอน</span>
                              <span style={{ fontWeight: 800, fontSize: "1rem", color: cashChange > 0 ? "#19a589" : "#9ca3af" }}>฿{cashChange.toLocaleString()}.00</span>
                            </div>
                            <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all btn-green ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}><Banknote className="w-3.5 h-3.5" /> ยืนยันรับเงินสด</button>
                          </>)}

                          {payMethod === "card" && (<>
                            <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", minHeight: "88px" }}>
                              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#fff,transparent)" }} />
                              <div className="absolute top-3 right-3 flex items-center">
                                {cardType === "Visa" && (<div className="px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)" }}><span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontWeight: 900, fontSize: "1.1rem", color: "#fff", letterSpacing: "-1px" }}>VISA</span></div>)}
                                {cardType === "Mastercard" && (<div className="flex items-center px-2 py-1 rounded gap-1" style={{ background: "rgba(255,255,255,0.08)" }}><div className="relative flex"><div className="w-6 h-6 rounded-full" style={{ background: "#EB001B" }} /><div className="w-6 h-6 rounded-full -ml-3" style={{ background: "#F79E1B", opacity: 0.9 }} /></div><span className="text-white/80 ml-1" style={{ fontSize: "0.55rem", fontWeight: 600 }}>mastercard</span></div>)}
                                {cardType === "Amex" && (<div className="px-2 py-1 rounded flex flex-col items-center" style={{ background: "rgba(0,114,206,0.6)", border: "1px solid rgba(255,255,255,0.2)", minWidth: "44px" }}><span style={{ fontWeight: 900, fontSize: "0.55rem", color: "#fff", letterSpacing: "0.08em" }}>AMERICAN</span><span style={{ fontWeight: 900, fontSize: "0.55rem", color: "#fff", letterSpacing: "0.08em" }}>EXPRESS</span></div>)}
                                {cardType === "JCB" && (<div className="flex rounded-lg overflow-hidden" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.2)" }}><div className="w-6 h-7 flex items-center justify-center" style={{ background: "#003087" }}><span style={{ fontWeight: 900, fontSize: "0.65rem", color: "#fff" }}>J</span></div><div className="w-6 h-7 flex items-center justify-center" style={{ background: "#CC0000" }}><span style={{ fontWeight: 900, fontSize: "0.65rem", color: "#fff" }}>C</span></div><div className="w-6 h-7 flex items-center justify-center" style={{ background: "#007B40" }}><span style={{ fontWeight: 900, fontSize: "0.65rem", color: "#fff" }}>B</span></div></div>)}
                                {cardType === "UnionPay" && (<div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.1)" }}><div className="flex rounded overflow-hidden"><div className="w-4 h-5 flex items-center justify-center" style={{ background: "#E21836" }}><span style={{ fontWeight: 900, fontSize: "0.5rem", color: "#fff" }}>U</span></div><div className="w-4 h-5 flex items-center justify-center" style={{ background: "#007B84" }}><span style={{ fontWeight: 900, fontSize: "0.5rem", color: "#fff" }}>P</span></div></div><span style={{ fontWeight: 600, fontSize: "0.55rem", color: "rgba(255,255,255,0.85)" }}>UnionPay</span></div>)}
                              </div>
                              <p className="text-white/40 text-xs mb-3 mt-0.5">{cardType === "Amex" ? "American Express" : cardType}</p>
                              <p className="text-white" style={{ fontWeight: 600, letterSpacing: "0.18em", fontSize: "0.9rem", fontFamily: "monospace" }}>•••• •••• •••• {cardLast4 || <span style={{ color: "rgba(255,255,255,0.3)" }}>____</span>}</p>
                              <p className="text-white/30 text-xs mt-3">฿{total.toLocaleString()}.00</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>ประเภทบัตร</label>
                                <div className="relative">
                                  <select value={cardType} onChange={e => setCardType(e.target.value)} className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none shadow-sm">
                                    {["Visa","Mastercard","Amex","JCB","UnionPay"].map(t => <option key={t}>{t}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>4 หลักท้าย</label>
                                <input type="text" value={cardLast4} onChange={e => setCardLast4(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="0000" maxLength={4}
                                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 transition-all shadow-sm text-center tracking-widest" style={{ fontWeight: 700 }} />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>ยอดชำระ</label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" style={{ fontWeight: 500 }}>฿</span>
                                <input type="number" value={cardAmount || total} onChange={e => setCardAmount(e.target.value)}
                                  className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 transition-all shadow-sm" style={{ fontWeight: 600 }} />
                              </div>
                            </div>
                            <button className={`flex items-center justify-center gap-1.5 text-sm px-4 py-1.5 rounded-full transition-all ml-auto ${cardLast4.length === 4 ? "text-white active:scale-[0.98]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                              style={cardLast4.length === 4 ? { fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" } : { fontWeight: 600 }}
                              disabled={cardLast4.length !== 4} onClick={cardLast4.length === 4 ? openReceipt : undefined}>
                              <CreditCard className="w-3.5 h-3.5" /> ยืนยันชำระด้วยบัตร
                            </button>
                          </>)}

                          {payMethod === "transfer" && (<>
                            <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                              <div><p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องโอน</p><p className="text-gray-800" style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.85rem" }}>.00</span></p></div>
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><Smartphone className="w-5 h-5 text-blue-500" /></div>
                            </div>
                            <div className="rounded-xl px-4 py-3 text-xs space-y-1.5" style={{ background: "#f0f7ff", border: "1.5px solid #dbeafe" }}>
                              <div className="flex justify-between"><span className="text-blue-400">ธนาคาร</span><span className="text-blue-700" style={{ fontWeight: 600 }}>กสิกรไทย (KBANK)</span></div>
                              <div className="flex justify-between"><span className="text-blue-400">เลขบัญชี</span><span className="text-blue-700" style={{ fontWeight: 600 }}>123-4-56789-0</span></div>
                              <div className="flex justify-between"><span className="text-blue-400">ชื่อบัญชี</span><span className="text-blue-700" style={{ fontWeight: 600 }}>คลินิกสัตวแพทย์</span></div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>เลขอ้างอิง / หมายเลขรายการ</label>
                              <input type="text" value={transferRef} onChange={e => setTransferRef(e.target.value)} placeholder="เลขอ้างอิงจากสลิปโอน"
                                className="vet-input" />
                            </div>
                            <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all btn-green ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}><Smartphone className="w-3.5 h-3.5" /> ยืนยันการโอน</button>
                          </>)}

                          {payMethod === "qr" && (<>
                            <div className="flex flex-col items-center py-2 gap-3">
                              <div className="relative">
                                <div className="w-40 h-40 rounded-2xl bg-white flex items-center justify-center shadow-md border border-gray-100 p-3">
                                  <div className="w-full h-full rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200">
                                    <QrCode className="w-14 h-14 text-gray-300" /><p className="text-xs text-gray-300">QR Code</p>
                                  </div>
                                </div>
                                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#19a589] text-white text-xs px-3 py-0.5 rounded-full shadow-md" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>PromptPay</div>
                              </div>
                              <div className="text-center mt-1">
                                <p className="text-xs text-gray-400 mb-1">สแกนเพื่อชำระ</p>
                                <p className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.9rem" }}>.00</span></p>
                                <p className="text-xs text-gray-400 mt-1">รองรับทุกธนาคารผ่าน PromptPay</p>
                              </div>
                            </div>
                            <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all btn-green ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}><QrCode className="w-3.5 h-3.5" /> ยืนยันการรับชำระ QR</button>
                          </>)}

                          {payMethod === "deposit" && (<>
                            <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                              <div className="absolute right-3 top-2 opacity-15"><Wallet className="w-16 h-16 text-white" /></div>
                              <p className="text-white/70 text-xs mb-1">ยอดมัดจำคงเหลือ</p>
                              <p className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.5px" }}>฿{MOCK_DEPOSIT.toLocaleString()}<span style={{ fontSize: "0.9rem" }}>.00</span></p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>จำนวนที่ต้องการตัด</label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" style={{ fontWeight: 500 }}>฿</span>
                                <input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} placeholder={String(Math.min(total, MOCK_DEPOSIT))}
                                  className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 transition-all shadow-sm" style={{ fontWeight: 600 }} />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">จาก ฿{total.toLocaleString()}.00</p>
                            </div>
                            <div className="flex justify-between items-center rounded-xl px-4 py-3 text-xs" style={{ background: depositLeft < 100 ? "linear-gradient(135deg,#fff5f5,#fee2e2)" : "#f9fafb", border: `1.5px solid ${depositLeft < 100 ? "#fca5a5" : "#e5e7eb"}` }}>
                              <span className="text-gray-500">ยอดมัดจำคงเหลือหลังตัด</span>
                              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: depositLeft < 100 ? "#ef4444" : "#1f2937" }}>฿{depositLeft.toLocaleString()}.00</span>
                            </div>
                            <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all btn-green ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}><Wallet className="w-3.5 h-3.5" /> ยืนยันพักมัดจำ</button>
                          </>)}

                        </motion.div>
                      </AnimatePresence>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        </>
      </AnimatePresence>

    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Visit Invoice Tab                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function VisitTab({ search, setSearch, statusFilter, setStatusFilter }: {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}) {
  const [selectedInv, setSelectedInv]   = useState<typeof invoices[0] | null>(null);
  const filtered = invoices.filter(inv => {
    const ms = inv.pet.includes(search) || inv.owner.includes(search) || inv.id.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "ทั้งหมด" || inv.status === statusFilter;
    return ms && mf;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Grid */}
      <motion.div className="flex-1 overflow-y-auto" variants={cv} initial="hidden" animate="visible">
        {filtered.length === 0 ? (
          <div className="py-24 text-center"><p className="text-sm text-gray-400">ไม่พบรายการที่ตรงกัน</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
            {filtered.map(inv => {
              const img = petImages[inv.id];
              const statusGrad =
                inv.status === "ชำระแล้ว"   ? "linear-gradient(135deg, #34d399, #059669)" :
                inv.status === "ยังไม่ชำระ" ? "linear-gradient(135deg, #fbbf24, #d97706)" :
                                              "linear-gradient(135deg, #f87171, #dc2626)";
              const statusColor =
                inv.status === "ชำระแล้ว"   ? "#059669" :
                inv.status === "ยังไม่ชำระ" ? "#d97706" :
                                              "#dc2626";
              const amountColor =
                inv.status === "คืนเงินแล้ว" ? "#dc2626" :
                inv.status === "ชำระแล้ว"     ? "#059669" :
                                                "#1f2937";
              return (
                <motion.button
                  key={inv.id}
                  variants={iv}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setSelectedInv(inv)}
                  className="group relative rounded-3xl overflow-hidden bg-white text-left transition-all duration-300 hover:-translate-y-1"
                  style={{
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* COVER BANNER — blurred pet photo */}
                  <div className="relative h-20 overflow-hidden">
                    {img ? (
                      <>
                        <img
                          src={img}
                          alt=""
                          aria-hidden
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ filter: "blur(18px) saturate(140%)", transform: "scale(1.3)" }}
                        />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.50) 100%)" }} />
                      </>
                    ) : (
                      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(245,245,245,1) 0%, rgba(229,231,235,1) 100%)" }} />
                    )}
                    {/* Invoice ID — top-left */}
                    <span
                      className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] text-gray-700 bg-white/85 backdrop-blur-sm font-mono"
                      style={{ fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                    >
                      {inv.id}
                    </span>
                    {/* Status pill — top-right */}
                    <span
                      className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white"
                      style={{ background: statusGrad, boxShadow: `0 2px 6px ${statusColor}55`, fontWeight: 600 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/85" />
                      {inv.status}
                    </span>
                  </div>

                  {/* AVATAR */}
                  <div className="flex justify-center -mt-10 relative">
                    <div className="rounded-full p-[3px]" style={{ background: "#ffffff", boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}>
                      <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-white p-[3px]">
                        {img ? (
                          <img
                            src={img}
                            alt={inv.pet}
                            className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-3xl">{inv.animal}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name + breed + status pill */}
                  <div className="text-center px-4 mt-2.5">
                    <h3 className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", lineHeight: 1.3, paddingBottom: 2 }}>
                      {inv.pet}
                    </h3>
                    <p className="text-gray-500 truncate" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.2px" }}>
                      {inv.breed}
                    </p>
                  </div>

                  {/* Stats pill (3 cols) */}
                  <div className="mx-3 mt-3 grid grid-cols-3 rounded-2xl py-2" style={{ background: "#f3f4f6" }}>
                    {[
                      { value: inv.owner, label: "เจ้าของ" },
                      { value: inv.vet, label: "สัตวแพทย์" },
                      { value: inv.date, label: "วันที่" },
                    ].map((s, i) => (
                      <div key={i} className="text-center px-1 border-r border-gray-200/70 last:border-r-0 min-w-0">
                        <p className="text-[10.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{s.value}</p>
                        <p className="text-[9.5px] text-gray-500" style={{ fontWeight: 500 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Amount footer */}
                  <div className="flex items-center justify-between px-4 py-3 mt-2 border-t border-gray-100 group-hover:bg-[#19a589]/5 transition-colors">
                    <span className="text-[10.5px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                      ยอดเงิน
                    </span>
                    <span style={{ fontWeight: 800, fontSize: "1.05rem", color: amountColor, letterSpacing: "-0.3px" }}>
                      ฿{inv.amount.toLocaleString()}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Visit Payment Modal */}
      {selectedInv && (
        <VisitPaymentModal inv={selectedInv} onClose={() => setSelectedInv(null)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Receipt Data Interface + Inline Receipt Page                        */
/* ═══════════════════════════════════════════════════════════════════ */
interface ReceiptData {
  receiptNo: string;
  date: string;
  customerName: string;
  phone: string;
  petName: string;
  items: { name: string; unit: string; qty: number; price: number; discAmt: number }[];
  subtotal: number;
  totalItemDiscounts: number;
  discountAmt: number;
  discountReason: string;
  includeVat: boolean;
  vatAmt: number;
  total: number;
  payMethod: string;
  cashReceived?: number;
  cashChange?: number;
}

/* ── Inline receipt (no modal — renders directly inside the page) ── */
function ReceiptInlinePage({ data, onClose, closeLabel = "กลับหน้าการเงิน" }: {
  data: ReceiptData; onClose: () => void; closeLabel?: string;
}) {
  const payLabels: Record<string, string> = {
    cash: "เงินสด", card: "บัตรเครดิต/เดบิต",
    transfer: "โอนเงิน", qr: "PromptPay QR", deposit: "หักเงินมัดจำ",
  };
  return (
    <motion.div className="flex-1 overflow-y-auto"
      style={{ background: "#FEFBF8" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* ── Success banner ── */}
      <div className="py-8 px-6 text-center"
        style={{ background: "linear-gradient(180deg,#e0f5f0 0%,#FEFBF8 100%)" }}>
        <motion.div className="w-16 h-16 rounded-full bg-[#19a589] mx-auto flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 18 }}>
          <CheckCircle2 className="w-9 h-9 text-white" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <p className="text-gray-900 mt-4" style={{ fontWeight: 700, fontSize: "1.05rem" }}>ชำระเงินสำเร็จ</p>
          <p className="text-[#19a589] mt-1" style={{ fontWeight: 800, fontSize: "1.7rem", letterSpacing: "-0.5px" }}>
            ฿{data.total.toLocaleString()}<span style={{ fontSize: "1rem" }}>.00</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{data.date}</p>
        </motion.div>
      </div>

      <div className="px-4 sm:px-8 pb-8 space-y-4">
        {/* ── Receipt card ── */}
        <motion.div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>

          {/* Clinic header */}
          <div className="px-6 py-5 text-center"
            style={{ background: "linear-gradient(135deg,#0d7c66,#19a589)" }}>
            <p className="text-white" style={{ fontWeight: 700, fontSize: "1.05rem" }}>EHP VetCare Clinic</p>
            <p className="text-white/70 text-xs mt-0.5">123/45 ถ.สุขุมวิท กรุงเทพฯ 10110</p>
            <p className="text-white/70 text-xs">โทร: 02-123-4567</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Receipt meta */}
            <div className="flex justify-between items-start text-xs">
              <div>
                <p className="text-gray-400">เลขใบเสร็จ</p>
                <p className="text-gray-800" style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.85rem" }}>{data.receiptNo}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400">วันที่</p>
                <p className="text-gray-700" style={{ fontWeight: 500 }}>{data.date}</p>
              </div>
            </div>

            {/* Customer / pet */}
            {(data.customerName || data.petName) && (
              <div className="bg-gray-50 rounded-2xl px-4 py-3 space-y-1.5 border border-gray-100">
                {data.customerName && (
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700" style={{ fontWeight: 600 }}>{data.customerName}</span>
                    {data.phone && <span className="text-gray-400">· {data.phone}</span>}
                  </div>
                )}
                {data.petName && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-base leading-none">🐾</span>
                    <span className="text-gray-700">{data.petName}</span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-dashed border-gray-200" />

            {/* Items */}
            <div className="space-y-2.5">
              <p className="text-[0.62rem] text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>รายการ</p>
              {data.items.map((item, i) => {
                const net = item.price * item.qty - item.discAmt;
                const isService = !["เม็ด","ขวด"].includes(item.unit);
                return (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ fontSize: "0.52rem", fontWeight: 600,
                            background: isService ? "#e8f5e9" : "#e3f2fd",
                            color: isService ? "#2e7d32" : "#1565c0" }}>
                          {isService ? "บริการ" : "ยา"}
                        </span>
                        <p className="text-gray-800 truncate" style={{ fontWeight: 600, fontSize: "0.78rem" }}>{item.name}</p>
                      </div>
                      <p className="text-gray-400 ml-7" style={{ fontSize: "0.62rem" }}>
                        {item.qty} × ฿{item.price.toLocaleString()}{item.discAmt > 0 ? ` (ลด ฿${item.discAmt.toLocaleString()})` : ""}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-gray-900" style={{ fontWeight: 700, fontSize: "0.85rem" }}>฿{net.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-dashed border-gray-200" />

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>ยอดรวมรายการ</span><span>฿{data.subtotal.toLocaleString()}</span></div>
              {data.totalItemDiscounts > 0 && (
                <div className="flex justify-between text-red-400"><span>ส่วนลดรายการ</span><span>-฿{data.totalItemDiscounts.toLocaleString()}</span></div>
              )}
              {data.discountAmt > 0 && (
                <div className="flex justify-between text-[#19a589]">
                  <span>{data.discountReason || "ส่วนลด"}</span><span>-฿{data.discountAmt.toLocaleString()}</span>
                </div>
              )}
              {data.vatAmt > 0 && (
                <div className="flex justify-between text-gray-500"><span>VAT 7%</span><span>฿{data.vatAmt.toLocaleString()}</span></div>
              )}
            </div>

            {/* Total highlight */}
            <div className="rounded-2xl px-4 py-3 flex justify-between items-center"
              style={{ background: "linear-gradient(135deg,#e0f5f0,#f0faf8)", border: "1.5px solid rgba(25,165,137,0.2)" }}>
              <span className="text-gray-800" style={{ fontWeight: 700 }}>ยอดชำระทั้งหมด</span>
              <span className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.15rem" }}>฿{data.total.toLocaleString()}.00</span>
            </div>

            {/* Payment method */}
            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <p className="text-[0.62rem] text-gray-400 mb-1.5 uppercase tracking-wider" style={{ fontWeight: 600 }}>วิธีชำระเงิน</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                  {payLabels[data.payMethod] || data.payMethod}
                </span>
                {data.payMethod === "cash" && data.cashReceived !== undefined && (
                  <div className="text-right text-xs text-gray-500 space-y-0.5">
                    <p>รับ ฿{data.cashReceived.toLocaleString()}.00</p>
                    <p className="text-[#19a589]" style={{ fontWeight: 600 }}>ทอน ฿{(data.cashChange ?? 0).toLocaleString()}.00</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200" />

            {/* Footer */}
            <div className="text-center space-y-1 pb-1">
              <p className="text-xs text-gray-400">ผู้รับเงิน: คุณสุดา พนักงาน</p>
              <p className="text-sm text-[#19a589]" style={{ fontWeight: 600 }}>ขอบคุณที่ใช้บริการ 🐾</p>
              <p className="text-gray-300" style={{ fontSize: "0.55rem", fontFamily: "monospace" }}>EHP VetCare · {data.receiptNo}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Action buttons ── */}
        <motion.div className="max-w-lg mx-auto flex gap-3"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <button onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 border-[#19a589]/30 text-[#19a589] hover:bg-[#19a589]/5 transition-all"
            style={{ fontWeight: 600 }}>
            <Printer className="w-4 h-4" /> พิมพ์ใบเสร็จ
          </button>
          <button onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-white transition-all active:scale-[0.98]"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.3)" }}>
            <ArrowLeft className="w-4 h-4" /> {closeLabel}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
function ReceiptModal({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const payLabels: Record<string, string> = {
    cash: "เงินสด", card: "บัตรเครดิต/เดบิต",
    transfer: "โอนเงิน", qr: "PromptPay QR", deposit: "พักเงินมัดจำ",
  };
  const now = new Date();
  const dateStr = data.date || `${now.getDate()} ${["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"][now.getMonth()]} ${now.getFullYear() + 543} เวลา ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
          style={{ maxHeight: "90vh" }}
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative overflow-hidden px-5 py-4 border-b border-[rgba(25,165,137,0.1)] rounded-t-3xl"
            style={{ backgroundImage: "linear-gradient(135deg, #eef7f5 0%, #FEFBF8 50%, #f3faf8 100%)" }}>
            <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-gray-900" style={{ fontWeight: 700 }}>ใบเสร็จ</h2>
                  <p className="text-xs text-gray-400 mt-0.5">#{data.receiptNo}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/70 border border-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-4">

              {/* Clinic info */}
              <div className="text-center space-y-0.5 pb-4 border-b border-dashed border-gray-200">
                <p className="text-gray-900" style={{ fontWeight: 700, fontSize: "1rem" }}>EHP VetCare Clinic</p>
                <p className="text-xs text-gray-400">123/45 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</p>
                <p className="text-xs text-gray-400">โทร: 02-123-4567</p>
              </div>

              {/* Receipt title */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-gray-200">
                <p className="text-gray-800" style={{ fontWeight: 700, fontSize: "1rem" }}>ใบเสร็จรับเงิน</p>
                <p className="text-xs text-gray-500">เลขที่: {data.receiptNo}</p>
                <p className="text-xs text-gray-500">{dateStr}</p>
              </div>

              {/* Customer */}
              {(data.customerName || data.phone || data.petName) && (
                <div className="space-y-1 text-sm pb-4 border-b border-dashed border-gray-200">
                  {data.customerName && <p className="text-gray-700"><span className="text-gray-400" style={{ fontWeight: 500 }}>ชื่อ: </span><span style={{ fontWeight: 600 }}>{data.customerName}</span></p>}
                  {data.phone && <p className="text-gray-700"><span className="text-gray-400" style={{ fontWeight: 500 }}>โทร: </span>{data.phone}</p>}
                  {data.petName && <p className="text-gray-700"><span className="text-gray-400" style={{ fontWeight: 500 }}>สัตว์เลี้ยง: </span>{data.petName}</p>}
                </div>
              )}

              {/* Items table */}
              <div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 text-gray-400" style={{ fontWeight: 500 }}>รายการ</th>
                      <th className="text-center pb-2 text-gray-400 w-14" style={{ fontWeight: 500 }}>หมวด</th>
                      <th className="text-center pb-2 text-gray-400 w-12" style={{ fontWeight: 500 }}>จำนวน</th>
                      <th className="text-right pb-2 text-gray-400 w-16" style={{ fontWeight: 500 }}>ราคา</th>
                      <th className="text-right pb-2 text-gray-400 w-14" style={{ fontWeight: 500 }}>รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.items.map((item, i) => {
                      const net = item.price * item.qty - item.discAmt;
                      const isService = !["เม็ด","ขวด"].includes(item.unit);
                      return (
                        <tr key={i}>
                          <td className="py-2 text-gray-700 pr-2" style={{ fontWeight: 500 }}>{item.name}</td>
                          <td className="py-2 text-center">
                            <span className="px-1.5 py-0.5 rounded-full" style={{
                              fontSize: "0.58rem", fontWeight: 600,
                              background: isService ? "#e8f5e9" : "#e3f2fd",
                              color: isService ? "#2e7d32" : "#1565c0",
                            }}>{isService ? "บริการ" : "ยา"}</span>
                          </td>
                          <td className="py-2 text-center text-gray-600">{item.qty}</td>
                          <td className="py-2 text-right text-gray-600">฿{item.price.toLocaleString()}</td>
                          <td className="py-2 text-right text-gray-800" style={{ fontWeight: 600 }}>฿{net.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 pt-3 border-t border-dashed border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวม</span>
                  <span>฿{data.subtotal.toLocaleString()}</span>
                </div>
                {data.totalItemDiscounts > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>ส่วนลดรายการ</span>
                    <span className="text-red-400">-฿{data.totalItemDiscounts.toLocaleString()}</span>
                  </div>
                )}
                {data.discountAmt > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>{data.discountReason || "ส่วนลด"}</span>
                    <span className="text-red-400">-฿{data.discountAmt.toLocaleString()}</span>
                  </div>
                )}
                {data.vatAmt > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>VAT 7%</span>
                    <span>฿{data.vatAmt.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-900 pt-2 border-t border-gray-200" style={{ fontWeight: 800, fontSize: "1rem" }}>
                  <span>ยอดชำระทั้งหมด</span>
                  <span className="text-[#19a589]">฿{data.total.toLocaleString()}.00</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs space-y-1 border border-gray-100">
                <p className="text-gray-500" style={{ fontWeight: 600 }}>วิธีชำระเงิน</p>
                <p className="text-gray-700" style={{ fontWeight: 500 }}>{payLabels[data.payMethod] || data.payMethod}</p>
                {data.payMethod === "cash" && data.cashReceived !== undefined && (
                  <>
                    <div className="flex justify-between text-gray-500">
                      <span>รับมา</span><span>฿{data.cashReceived.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>เงินทอน</span><span className="text-[#19a589]" style={{ fontWeight: 600 }}>฿{(data.cashChange ?? 0).toLocaleString()}.00</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center space-y-1 pt-1">
                <p className="text-xs text-gray-400">ผู้รับเงิน: คุณสุดา พนักงาน</p>
                <p className="text-xs text-[#19a589]" style={{ fontWeight: 500 }}>ขอบคุณที่ใช้บริการ</p>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 bg-white">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              style={{ fontWeight: 500 }}>
              ปิด
            </button>
            <button onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-white text-sm transition-all active:scale-[0.98] btn-green"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 4px 14px rgba(232,128,42,0.3)" }}>
              <Printer className="w-4 h-4" /> พิมพ์
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Retail POS Tab                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
export function RetailTab() {
  const { showSnackbar } = useSnackbar();
  const { drugs: ctxDrugs, services: ctxServices, deductStock } = useClinicData();

  // ── POS catalogue derived from context (synced with Settings) ──
  const medicines = ctxDrugs
    .filter(d => d.active)
    .map(d => ({ id: `d${d.id}`, name: d.name, unit: d.unit, price: d.sellPrice }));
  const services = ctxServices
    .filter(s => s.active)
    .map(s => ({ id: `s${s.id}`, name: s.name, unit: "ครั้ง", price: s.price }));
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone]               = useState("");
  const [ref, setRef]                   = useState("");
  const [medSearch, setMedSearch]       = useState("");
  const [svcSearch, setSvcSearch]       = useState("");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [itemDiscounts, setItemDiscounts] = useState<Record<string, { value: string; type: "fix" | "pct" }>>({});
  const [discountAmt, setDiscountAmt]   = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [discountInput, setDiscountInput]   = useState("");
  const [discountType, setDiscountType]   = useState<"fix" | "pct">("fix");
  const [includeVat, setIncludeVat]     = useState(true);
  const [showDiscountPanel, setShowDiscountPanel] = useState(true);
  const [pickupLocation, setPickupLocation] = useState("ห้องยา");

  // Receipt
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Payment
  type PayMethod = "cash" | "card" | "transfer" | "qr" | "deposit";
  const [payMethod, setPayMethod]         = useState<PayMethod>("cash");
  const [cashReceived, setCashReceived]   = useState("");
  const [cardAmount, setCardAmount]       = useState("");
  const [cardType, setCardType]           = useState("Visa");
  const [cardLast4, setCardLast4]         = useState("");
  const [transferAmt, setTransferAmt]     = useState("");
  const [transferRef, setTransferRef]     = useState("");
  const [depositAmt, setDepositAmt]       = useState("");
  const MOCK_DEPOSIT = 500;

  const openReceipt = () => {
    const now = new Date();
    const monthsTh = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    const dateStr = `${now.getDate()} ${monthsTh[now.getMonth()]} ${now.getFullYear() + 543} เวลา ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const receiptNo = `R-${now.getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`;
    setReceiptData({
      receiptNo,
      date: dateStr,
      customerName,
      phone,
      petName: "",
      items: cart.map(c => ({ name: c.name, unit: c.unit, qty: c.qty, price: c.price, discAmt: getItemDiscountAmt(c) })),
      subtotal,
      totalItemDiscounts,
      discountAmt,
      discountReason,
      includeVat,
      vatAmt,
      total,
      payMethod,
      cashReceived: payMethod === "cash" ? (parseFloat(cashReceived) || total) : undefined,
      cashChange: payMethod === "cash" ? cashChange : undefined,
    });
    // ── ลดสต็อกยาที่ขายผ่าน POS ──
    deductStock(cart.map(c => ({ id: c.id, name: c.name, qty: c.qty })));
    showSnackbar("success", "ชำระเงินสำเร็จแล้ว — ระบบอัปเดตสต็อกยาเรียบร้อย");
  };

  const addToCart = (item: Omit<CartItem, "qty">) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
    setItemDiscounts(prev => { const n = { ...prev }; delete n[id]; return n; });
  };
  const setItemDiscount = (id: string, value: string, type: "fix" | "pct") =>
    setItemDiscounts(prev => ({ ...prev, [id]: { value, type } }));
  const getItemDiscountAmt = (item: CartItem) => {
    const d = itemDiscounts[item.id];
    if (!d || !d.value) return 0;
    const v = parseFloat(d.value) || 0;
    const gross = item.price * item.qty;
    return d.type === "pct" ? Math.round(gross * v / 100) : Math.min(v, gross);
  };
  const changeQty = (id: string, delta: number) => setCart(prev =>
    prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
  );
  const applyQuickDiscount = (d: typeof quickDiscounts[0]) => {
    const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    setDiscountAmt(d.type === "pct" ? Math.round(sub * d.value / 100) : d.value);
    setDiscountReason(d.label);
    setDiscountInput(d.type === "pct" ? String(d.value) : String(d.value));
  };
  const applyManualDiscount = () => {
    const v = parseFloat(discountInput) || 0;
    const amt = discountType === "pct" ? Math.round(afterItemDisc * v / 100) : v;
    setDiscountAmt(amt);
    if (!discountReason) setDiscountReason("ส่วนลดพิเศษ");
  };
  const cancelDiscount = () => { setDiscountAmt(0); setDiscountReason(""); setDiscountInput(""); };

  const subtotal          = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totalItemDiscounts = cart.reduce((s, c) => s + getItemDiscountAmt(c), 0);
  const afterItemDisc     = subtotal - totalItemDiscounts;
  const afterDisc         = Math.max(0, afterItemDisc - discountAmt);
  const vatAmt            = includeVat ? 0 : Math.round(afterDisc * 0.07);
  const total             = afterDisc + vatAmt;

  const cashChange  = Math.max(0, (parseFloat(cashReceived) || 0) - total);
  const depositLeft = Math.max(0, MOCK_DEPOSIT - (parseFloat(depositAmt) || 0));

  const PAY_METHODS: { id: PayMethod; label: string; Icon: React.ElementType }[] = [
    { id: "cash",     label: "เงินสด",            Icon: Banknote   },
    { id: "card",     label: "บัตรเครดิต/เดบิต",  Icon: CreditCard  },
    { id: "transfer", label: "โอนเงิน",            Icon: Smartphone  },
    { id: "qr",       label: "PromptPay QR",       Icon: QrCode      },
    { id: "deposit",  label: "พักเงินมัดจำ",       Icon: Wallet      },
  ];

  const filteredMed = medicines.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase()));
  const filteredSvc = services.filter(s => s.name.includes(svcSearch));

  /* ── When receipt is ready, show inline receipt page ── */
  if (receiptData) {
    return (
      <motion.div className="flex flex-col flex-1 min-h-0 overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <ReceiptInlinePage
          data={receiptData}
          closeLabel="บิลใหม่"
          onClose={() => setReceiptData(null)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="flex flex-col flex-1 min-h-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>

      {/* ── Customer bar ── */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 flex-1 min-w-36">
            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="ชื่อลูกค้า (ไม่บังคับ)"
              className="bg-transparent text-sm flex-1 focus:outline-none min-w-0" />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-36">
            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="เบอร์โทร"
              className="bg-transparent text-sm flex-1 focus:outline-none min-w-0" />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 flex-1 min-w-40">
            <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input value={ref} onChange={e => setRef(e.target.value)}
              placeholder="เลขอ้างอิงการชำระ"
              className="bg-transparent text-sm flex-1 focus:outline-none min-w-0" />
          </div>
          <button className="flex items-center gap-1.5 bg-[#19a589] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#0d7c66] transition-colors flex-shrink-0" style={{ fontWeight: 600 }}>
            <Save className="w-3.5 h-3.5" /> บันทึก
          </button>
        </div>
      </div>

      {/* ── Alert bar ── */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <div className="flex gap-3 flex-wrap">
          <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>
            ยอดค้างชำระ: ฿2,000.00
          </span>
          <span className="text-xs bg-[#19a589]/10 text-[#0d7c66] px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>
            เครดิตสินค้า: ฿500.00
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-0">

        {/* Left: Add items */}
        <div className="hidden md:flex w-72 flex-shrink-0 border-r border-gray-100 bg-white flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-[#19a589]" />
              <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>เพิ่มรายการ</span>
            </div>

            {/* Medicine search */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                <Pill className="w-3.5 h-3.5 text-[#19a589]" /> ค้นหายา
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={medSearch} onChange={e => setMedSearch(e.target.value)}
                  placeholder="พิมพ์ชื่อยา..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
              </div>
              <div className="mt-1.5 space-y-1">
                {filteredMed.map(m => (
                  <button key={m.id} onClick={() => addToCart(m)}
                    className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-gray-50 hover:bg-[#19a589]/8 hover:text-[#19a589] transition-colors text-left group">
                    <span className="text-gray-700 group-hover:text-[#0d7c66]">{m.name}</span>
                    <span className="text-gray-400" style={{ fontWeight: 500 }}>฿{m.price}/{m.unit}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Service search */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#19a589]" /> ค้นหาบริการ
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={svcSearch} onChange={e => setSvcSearch(e.target.value)}
                  placeholder="พิมพ์ชื่อบริการ..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all" />
              </div>
              <div className="mt-1.5 space-y-1">
                {filteredSvc.map(s => (
                  <button key={s.id} onClick={() => addToCart(s)}
                    className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-gray-50 hover:bg-[#19a589]/8 hover:text-[#19a589] transition-colors text-left group">
                    <span className="text-gray-700 group-hover:text-[#0d7c66]">{s.name}</span>
                    <span className="text-gray-400" style={{ fontWeight: 500 }}>฿{s.price}/{s.unit}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#FEFBF8]">
          <div className="p-3 sm:p-5 space-y-4">

            {/* Mobile: quick add row */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
              {[...medicines, ...services].map(item => (
                <button key={item.id} onClick={() => addToCart(item)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-white border border-gray-200 hover:border-[#19a589] hover:text-[#19a589] transition-colors">
                  <Plus className="w-3 h-3" />
                  <span className="whitespace-nowrap">{item.name}</span>
                  <span className="text-gray-400">฿{item.price}</span>
                </button>
              ))}
            </div>

            {/* Summary header */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>สรุปบิล</span>
              <span className="text-xs text-gray-400">{cart.length} รายการ</span>
            </div>

            {/* Cart items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              {cart.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">ยังไม่มีรายการ</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {/* Table header */}
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100" style={{ background: "#f8faf8" }}>
                    <span className="flex-1 min-w-0 text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600, letterSpacing: "0.04em" }}>รายการ</span>
                    <span className="w-14 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>หมวด</span>
                    <span className="w-20 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>จำนวน</span>
                    <span className="w-16 text-gray-400 text-center" style={{ fontSize: "0.63rem", fontWeight: 600 }}>ราคา/หน่วย</span>
                    <span className="w-24 text-gray-400 text-center" style={{ fontSize: "0.63rem", fontWeight: 600 }}>ส่วนลด</span>
                    <span className="w-14 text-gray-400 text-right" style={{ fontSize: "0.63rem", fontWeight: 600 }}>VAT</span>
                    <span className="w-16 text-right text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>รวม</span>
                    <span className="w-12 text-gray-400 text-right" style={{ fontSize: "0.63rem", fontWeight: 600 }}>จัดการ</span>
                  </div>
                  {cart.map(item => {
                    const isService = item.id.startsWith("s");
                    const code = isService
                      ? `SVC-00${item.id.slice(1)}`
                      : `DRG-00${item.id.slice(1)}`;
                    const itemGross = item.price * item.qty;
                    const itemDisc  = getItemDiscountAmt(item);
                    const itemNet   = itemGross - itemDisc;
                    const itemVat   = Math.round(itemNet * 7 / 107 * 100) / 100;
                    const discState = itemDiscounts[item.id] ?? { value: "", type: "fix" as const };
                    return (
                      <div key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                        {/* รายการ */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                          <p className="text-gray-400" style={{ fontSize: "0.6rem" }}>{code}</p>
                        </div>
                        {/* หมวด */}
                        <div className="w-14 flex justify-center">
                          <span className="px-1.5 py-0.5 rounded-full" style={{
                            fontSize: "0.58rem", fontWeight: 600,
                            background: isService ? "#e8f5e9" : "#e3f2fd",
                            color: isService ? "#2e7d32" : "#1565c0",
                          }}>
                            {isService ? "บริการ" : "ยา"}
                          </span>
                        </div>
                        {/* จำนวน */}
                        <div className="w-20 flex items-center justify-center gap-1">
                          <button onClick={() => changeQty(item.id, -1)}
                            className="w-5 h-5 rounded-full bg-gray-100 hover:bg-[#19a589]/10 hover:text-[#19a589] flex items-center justify-center text-gray-500 transition-colors" style={{ fontSize: "0.8rem" }}>−</button>
                          <span className="w-5 text-xs text-center text-gray-800" style={{ fontWeight: 700 }}>{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)}
                            className="w-5 h-5 rounded-full bg-gray-100 hover:bg-[#19a589]/10 hover:text-[#19a589] flex items-center justify-center text-gray-500 transition-colors" style={{ fontSize: "0.8rem" }}>+</button>
                        </div>
                        {/* ราคา/หน่วย */}
                        <span className="w-16 text-gray-600 text-center" style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                          ฿{item.price.toLocaleString()}
                        </span>
                        {/* ส่วนลด — editable */}
                        <div className="w-24 flex items-center gap-1 justify-end">
                          <input
                            type="number"
                            min="0"
                            value={discState.value}
                            onChange={e => setItemDiscount(item.id, e.target.value, discState.type)}
                            placeholder="0"
                            className="w-12 text-right bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#19a589]/30 focus:border-[#19a589]/60 transition-all"
                            style={{ fontSize: "0.65rem", color: itemDisc > 0 ? "#e53935" : "#9ca3af" }}
                          />
                          <select
                            value={discState.type}
                            onChange={e => setItemDiscount(item.id, discState.value, e.target.value as "fix" | "pct")}
                            className="bg-gray-50 border border-gray-200 rounded-lg py-0.5 pl-1 pr-1 focus:outline-none focus:ring-1 focus:ring-[#19a589]/30 cursor-pointer text-gray-500 transition-all"
                            style={{ fontSize: "0.6rem" }}
                          >
                            <option value="fix">฿</option>
                            <option value="pct">%</option>
                          </select>
                        </div>
                        {/* VAT */}
                        <span className="w-14 text-gray-500 text-right" style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                          ฿{itemVat.toFixed(2)}
                        </span>
                        {/* รวม */}
                        <div className="w-16 text-right">
                          {itemDisc > 0 && (
                            <p className="text-gray-300 line-through" style={{ fontSize: "0.6rem" }}>฿{itemGross.toLocaleString()}</p>
                          )}
                          <span className="text-gray-800" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                            ฿{itemNet.toLocaleString()}
                          </span>
                        </div>
                        {/* จัดการ */}
                        <div className="w-12 flex items-center justify-end gap-2">
                          <button
                            onClick={() => setItemDiscount(item.id, "", "fix")}
                            className={`transition-colors ${itemDisc > 0 ? "text-[#19a589] hover:text-[#0d7c66]" : "text-gray-300 hover:text-[#19a589]"}`}
                            title="ล้างส่วนลด"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Discount panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => setShowDiscountPanel(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-700" style={{ fontWeight: 600 }}>
                  <Tag className="w-4 h-4 text-[#19a589]" /> ส่วนลดนัล
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDiscountPanel ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showDiscountPanel && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-100">
                    <div className="p-4 space-y-4">
                      {/* Quick discounts */}
                      <div>
                        <p className="text-xs text-gray-400 mb-2">ส่วนลดสำเร็จรูป</p>
                        <div className="flex flex-wrap gap-2">
                          {quickDiscounts.map(d => (
                            <button key={d.label} onClick={() => applyQuickDiscount(d)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${discountReason === d.label ? "bg-[#19a589] text-white border-[#19a589]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#19a589]/40"}`}
                              style={{ fontWeight: discountReason === d.label ? 600 : 400 }}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Manual discount */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-xs text-gray-400 block mb-1">จำนวนส่วนลด</label>
                            {/* Input + Dropdown */}
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#19a589]/20 focus-within:border-[#19a589]/50 transition-all">
                              <input
                                type="number"
                                value={discountInput}
                                onChange={e => setDiscountInput(e.target.value)}
                                placeholder="0"
                                className="flex-1 pl-3 pr-1 py-2 text-sm bg-transparent focus:outline-none min-w-0"
                              />
                              <div className="flex-shrink-0 border-l border-gray-200">
                                <div className="relative">
                                  <select
                                    value={discountType}
                                    onChange={e => setDiscountType(e.target.value as "fix" | "pct")}
                                    className="h-full pl-2 pr-7 py-2 text-xs bg-white text-gray-600 focus:outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ fontWeight: 500 }}
                                  >
                                    <option value="fix">฿ บาท</option>
                                    <option value="pct">% เปอร์เซ็นต์</option>
                                  </select>
                                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">เหตุผล</label>
                          <textarea value={discountReason} onChange={e => setDiscountReason(e.target.value)}
                            placeholder="ระบุเหตุผลส่วนลด..." rows={2}
                            className="vet-textarea" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelDiscount}
                            className="text-xs px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                            ยกเลิก
                          </button>
                          <button onClick={applyManualDiscount}
                            className="text-xs px-4 py-1.5 rounded-full bg-[#19a589] text-white hover:bg-[#0d7c66] transition-all" style={{ fontWeight: 600 }}>
                            ใช้ส่วนลด
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* VAT + Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              {/* VAT toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                <div className="relative bg-[#f3f4f6] rounded-full p-0.5 flex text-xs" style={{ width: "fit-content" }}>
                  {/* sliding pill */}
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute top-0.5 bottom-0.5 bg-white rounded-full shadow-sm"
                    style={{
                      width: includeVat ? "calc(50% - 2px)" : "calc(50% - 2px)",
                      left: includeVat ? "2px" : "calc(50%)",
                    }}
                  />
                  <button
                    onClick={() => setIncludeVat(true)}
                    className="relative z-10 px-4 py-1.5 rounded-full transition-colors text-[12px]"
                    style={{ fontWeight: includeVat ? 600 : 400, color: includeVat ? "#19a589" : "#6a7282" }}
                  >รวม VAT</button>
                  <button
                    onClick={() => setIncludeVat(false)}
                    className="relative z-10 px-4 py-1.5 rounded-full transition-colors text-[12px]"
                    style={{ fontWeight: !includeVat ? 600 : 400, color: !includeVat ? "#19a589" : "#6a7282" }}
                  >ไม่รวม VAT</button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>ยอดรวมรายการ</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                {totalItemDiscounts > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>ส่วนลดต่อรายการ</span>
                    <span>−฿{totalItemDiscounts.toLocaleString()}</span>
                  </div>
                )}
                {discountAmt > 0 && (
                  <div className="flex justify-between text-[#19a589]">
                    <span>ส่วนลดนัล {discountReason && <span className="opacity-70">({discountReason})</span>}</span>
                    <span>−฿{discountAmt.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>VAT 7%</span>
                  <span>฿{vatAmt.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ยอดชำระทั้งหมด</span>
                <span className="text-[#19a589]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  ฿{total.toLocaleString()}.00
                </span>
              </div>
            </div>

            {/* รับยาที่ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <label className="text-[10px] text-gray-400 mb-1.5 flex items-center gap-1" style={{ fontWeight: 500 }}>
                <MapPin className="w-3 h-3" />รับยาที่
              </label>
              <div className="relative">
                <select
                  value={pickupLocation}
                  onChange={e => setPickupLocation(e.target.value)}
                  className="w-full px-3 py-[7px] text-sm bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/40 appearance-none pr-8 text-gray-700 cursor-pointer transition-all"
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

            {/* ── Payment Section ── */}
            <div className="rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(160deg,#f0faf1 0%,#ffffff 45%)", border: "1.5px solid #d4ead6" }}>
              {/* Header */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#19a589] flex items-center justify-center shadow-sm">
                      <CreditCard className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ชำระเงิน</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องชำระ</p>
                    <p className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span className="text-sm">.00</span></p>
                  </div>
                </div>

                {/* Method pills */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {PAY_METHODS.map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setPayMethod(id)}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                      style={{
                        background: payMethod === id ? "#19a589" : "rgba(255,255,255,0.85)",
                        boxShadow: payMethod === id ? "0 4px 14px rgba(25,165,137,0.35)" : "0 1px 3px rgba(0,0,0,0.07)",
                        border: payMethod === id ? "1.5px solid transparent" : "1.5px solid #e9ecef",
                        transform: payMethod === id ? "translateY(-1px)" : "none",
                      }}>
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: payMethod === id ? "white" : "#6b7280" }} />
                      <span className="text-center leading-tight" style={{ fontSize: "0.58rem", fontWeight: payMethod === id ? 600 : 400, color: payMethod === id ? "white" : "#6b7280" }}>{id === "deposit" ? "หักเงินค่ามัดจำ" : label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dashed divider */}
              <div className="mx-5 border-t border-dashed border-[#c8e6ca]" />

              {/* Method form */}
              <AnimatePresence mode="wait">
                <motion.div key={payMethod} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18, ease: "easeOut" }}
                  className="px-5 py-4 space-y-3">

                  {/* ── เงินสด ── */}
                  {payMethod === "cash" && (<>
                    <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องชำระ</p>
                        <p className="text-gray-800" style={{ fontWeight: 800, fontSize: "1.45rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.85rem" }}>.00</span></p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-[#19a589]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>จำนวนเงินที่รับ</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" style={{ fontWeight: 500 }}>฿</span>
                        <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)}
                          placeholder={String(total)}
                          className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all shadow-sm" style={{ fontWeight: 600 }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[100, 500, 1000, 5000].map(v => (
                        <button key={v} onClick={() => setCashReceived(String(v))}
                          className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#19a589]/50 hover:text-[#19a589] transition-all shadow-sm" style={{ fontWeight: 500 }}>
                          ฿{v.toLocaleString()}
                        </button>
                      ))}
                      <button onClick={() => setCashReceived(String(total))}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#19a589] border border-[#19a589] text-white hover:bg-[#0d7c66] transition-all shadow-sm" style={{ fontWeight: 600 }}>
                        พอดี
                      </button>
                    </div>
                    <div className="flex justify-between items-center rounded-xl px-4 py-3 text-xs"
                      style={{ background: cashChange > 0 ? "linear-gradient(135deg,#f0faf1,#e8f5e9)" : "#f9fafb", border: `1.5px solid ${cashChange > 0 ? "#c8e6ca" : "#e5e7eb"}` }}>
                      <span className="text-gray-500">เงินทอน</span>
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: cashChange > 0 ? "#19a589" : "#9ca3af" }}>฿{cashChange.toLocaleString()}.00</span>
                    </div>
                    <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all btn-green ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      <Banknote className="w-3.5 h-3.5" /> ยืนยันรับเงินสด
                    </button>
                  </>)}

                  {/* ── บัตรเครดิต/เดบิต ── */}
                  {payMethod === "card" && (<>
                    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", minHeight: "88px" }}>
                      {/* Decorative glow circles */}
                      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#fff,transparent)" }} />
                      <div className="absolute -left-4 -bottom-6 w-24 h-24 rounded-full opacity-5" style={{ background: "radial-gradient(circle,#fff,transparent)" }} />

                      {/* Card brand logo — top right */}
                      <div className="absolute top-3 right-3 flex items-center">
                        {cardType === "Visa" && (
                          <div className="px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}>
                            <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontWeight: 900, fontSize: "1.1rem", color: "#fff", letterSpacing: "-1px" }}>VISA</span>
                          </div>
                        )}
                        {cardType === "Mastercard" && (
                          <div className="flex items-center px-2 py-1 rounded gap-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="relative flex">
                              <div className="w-6 h-6 rounded-full" style={{ background: "#EB001B" }} />
                              <div className="w-6 h-6 rounded-full -ml-3" style={{ background: "#F79E1B", opacity: 0.9 }} />
                            </div>
                            <span className="text-white/80 ml-1" style={{ fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.02em" }}>mastercard</span>
                          </div>
                        )}
                        {cardType === "Amex" && (
                          <div className="px-2 py-1 rounded flex flex-col items-center justify-center" style={{ background: "rgba(0,114,206,0.6)", border: "1px solid rgba(255,255,255,0.2)", minWidth: "44px" }}>
                            <span style={{ fontWeight: 900, fontSize: "0.55rem", color: "#fff", letterSpacing: "0.08em" }}>AMERICAN</span>
                            <span style={{ fontWeight: 900, fontSize: "0.55rem", color: "#fff", letterSpacing: "0.08em" }}>EXPRESS</span>
                          </div>
                        )}
                        {cardType === "JCB" && (
                          <div className="flex rounded-lg overflow-hidden" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.2)" }}>
                            <div className="w-6 h-7 flex items-center justify-center" style={{ background: "#003087" }}>
                              <span style={{ fontWeight: 900, fontSize: "0.65rem", color: "#fff" }}>J</span>
                            </div>
                            <div className="w-6 h-7 flex items-center justify-center" style={{ background: "#CC0000" }}>
                              <span style={{ fontWeight: 900, fontSize: "0.65rem", color: "#fff" }}>C</span>
                            </div>
                            <div className="w-6 h-7 flex items-center justify-center" style={{ background: "#007B40" }}>
                              <span style={{ fontWeight: 900, fontSize: "0.65rem", color: "#fff" }}>B</span>
                            </div>
                          </div>
                        )}
                        {cardType === "UnionPay" && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                            <div className="flex rounded overflow-hidden" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.2)" }}>
                              <div className="w-4 h-5 flex items-center justify-center" style={{ background: "#E21836" }}>
                                <span style={{ fontWeight: 900, fontSize: "0.5rem", color: "#fff" }}>U</span>
                              </div>
                              <div className="w-4 h-5 flex items-center justify-center" style={{ background: "#007B84" }}>
                                <span style={{ fontWeight: 900, fontSize: "0.5rem", color: "#fff" }}>P</span>
                              </div>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: "0.55rem", color: "rgba(255,255,255,0.85)" }}>UnionPay</span>
                          </div>
                        )}
                      </div>

                      {/* Card text */}
                      <p className="text-white/40 text-xs mb-3 mt-0.5">
                        {cardType === "Amex" ? "American Express" : cardType}
                      </p>
                      <p className="text-white" style={{ fontWeight: 600, letterSpacing: "0.18em", fontSize: "0.9rem", fontFamily: "monospace" }}>
                        •••• •••• •••• {cardLast4 || <span style={{ color: "rgba(255,255,255,0.3)" }}>____</span>}
                      </p>
                      <p className="text-white/30 text-xs mt-3">฿{total.toLocaleString()}.00</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>ประเภทบัตร</label>
                        <div className="relative">
                          <select value={cardType} onChange={e => setCardType(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 appearance-none transition-all shadow-sm">
                            {["Visa", "Mastercard", "Amex", "JCB", "UnionPay"].map(t => <option key={t}>{t}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>4 หลักท้าย</label>
                        <input type="text" value={cardLast4} onChange={e => setCardLast4(e.target.value.replace(/\D/g,"").slice(0,4))}
                          placeholder="0000" maxLength={4}
                          className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all shadow-sm text-center tracking-widest" style={{ fontWeight: 700 }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>ยอดชำระ</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" style={{ fontWeight: 500 }}>฿</span>
                        <input type="number" value={cardAmount || total} onChange={e => setCardAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all shadow-sm" style={{ fontWeight: 600 }} />
                      </div>
                    </div>
                    <button
                      className={`flex items-center justify-center gap-1.5 text-sm px-4 py-1.5 rounded-full transition-all ml-auto ${cardLast4.length === 4 ? "text-white active:scale-[0.98]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                      style={cardLast4.length === 4 ? { fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" } : { fontWeight: 600 }}
                      disabled={cardLast4.length !== 4}
                      onClick={cardLast4.length === 4 ? openReceipt : undefined}>
                      <CreditCard className="w-3.5 h-3.5" /> ยืนยันชำระด้วยบัตร
                    </button>
                  </>)}

                  {/* ── โอนเงิน ── */}
                  {payMethod === "transfer" && (<>
                    <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องโอน</p>
                        <p className="text-gray-800" style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.85rem" }}>.00</span></p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="rounded-xl px-4 py-3 text-xs space-y-1.5" style={{ background: "#f0f7ff", border: "1.5px solid #dbeafe" }}>
                      <div className="flex justify-between">
                        <span className="text-blue-400">ธนาคาร</span>
                        <span className="text-blue-700" style={{ fontWeight: 600 }}>กสิกรไทย (KBANK)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-400">เลขบัญชี</span>
                        <span className="text-blue-700" style={{ fontWeight: 600 }}>123-4-56789-0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-400">ชื่อบัญชี</span>
                        <span className="text-blue-700" style={{ fontWeight: 600 }}>คลินิกสัตวแพทย์</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>เลขอ้างอิง / หมายเลขรายการ</label>
                      <input type="text" value={transferRef} onChange={e => setTransferRef(e.target.value)}
                        placeholder="เลขอ้างอิงจากสลิปโอน"
                        className="vet-input" />
                    </div>
                    <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all btn-green ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      <Smartphone className="w-3.5 h-3.5" /> ยืนยันการโอน
                    </button>
                  </>)}

                  {/* ── PromptPay QR ── */}
                  {payMethod === "qr" && (<>
                    <div className="flex flex-col items-center py-2 gap-3">
                      <div className="relative">
                        <div className="w-40 h-40 rounded-2xl bg-white flex items-center justify-center shadow-md border border-gray-100 p-3">
                          <div className="w-full h-full rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200">
                            <QrCode className="w-14 h-14 text-gray-300" />
                            <p className="text-xs text-gray-300">QR Code</p>
                          </div>
                        </div>
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#19a589] text-white text-xs px-3 py-0.5 rounded-full shadow-md" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                          PromptPay
                        </div>
                      </div>
                      <div className="text-center mt-1">
                        <p className="text-xs text-gray-400 mb-1">สแกนเพื่อชำระ</p>
                        <p className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.9rem" }}>.00</span></p>
                        <p className="text-xs text-gray-400 mt-1">รองรับทุกธนาคารผ่าน PromptPay</p>
                      </div>
                    </div>
                    <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      <QrCode className="w-3.5 h-3.5" /> ยืนยันการรับชำระ QR
                    </button>
                  </>)}

                  {/* ── พักเงินมัดจำ ── */}
                  {payMethod === "deposit" && (<>
                    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                      <div className="absolute right-3 top-2 opacity-15">
                        <Wallet className="w-16 h-16 text-white" />
                      </div>
                      <p className="text-white/70 text-xs mb-1">ยอดมัดจำคงเหลือ</p>
                      <p className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.5px" }}>฿{MOCK_DEPOSIT.toLocaleString()}<span style={{ fontSize: "0.9rem" }}>.00</span></p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>จำนวนที่ต้องการตัด</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" style={{ fontWeight: 500 }}>฿</span>
                        <input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)}
                          placeholder={String(Math.min(total, MOCK_DEPOSIT))}
                          className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all shadow-sm" style={{ fontWeight: 600 }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">จาก ฿{total.toLocaleString()}.00</p>
                    </div>
                    <div className="flex justify-between items-center rounded-xl px-4 py-3 text-xs"
                      style={{ background: depositLeft < 100 ? "linear-gradient(135deg,#fff5f5,#fee2e2)" : "#f9fafb", border: `1.5px solid ${depositLeft < 100 ? "#fca5a5" : "#e5e7eb"}` }}>
                      <span className="text-gray-500">ยอดมัดจำคงเหลือหลังตัด</span>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: depositLeft < 100 ? "#ef4444" : "#1f2937" }}>฿{depositLeft.toLocaleString()}.00</span>
                    </div>
                    <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      <Wallet className="w-3.5 h-3.5" /> ยืนยันพักมัดจำ
                    </button>
                  </>)}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Boarding Bill View — full-page payment for boarding session        */
/* ═══════════════════════════════════════════════════════════════════ */
interface BoardingBillState {
  petName: string; breed: string; species: string; photo: string;
  ownerName: string; ownerPhone: string;
  checkIn: string; checkOut: string;
  roomType: string; roomNumber: string; dailyRate: number;
  services: string[];
  deposit: number;
  bookingCode: string;
}

const boardingServicePriceMap: Record<string, number> = {
  "ให้อาหารวันละ 2 มื้อ": 0,
  "ให้อาหารวันละ 3 มื้อ": 150,
  "พาเดินเล่นเช้า-เย็น": 200,
  "อาบน้ำก่อนกลับ": 450,
  "ตัดเล็บ": 150,
  "ให้ยาตามใบสั่งแพทย์": 300,
  "ดูแลพิเศษ 24 ชม.": 800,
};

function BoardingBillView({ bill }: { bill: BoardingBillState }) {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const NIGHTS = 6;
  const monthsTh = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  const now = new Date();
  const dateStr = `${now.getDate()} ${monthsTh[now.getMonth()]} ${now.getFullYear() + 543}`;
  const [invId] = useState(`BRD-${now.getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`);

  /* ── Billing ── */
  const roomTotal      = bill.dailyRate * NIGHTS;
  const serviceItems   = bill.services.map(s => ({ name: s, price: boardingServicePriceMap[s] ?? 200 }));
  const servicesTotal  = serviceItems.reduce((s, sv) => s + sv.price, 0);
  const subtotal       = roomTotal + servicesTotal;
  const deposit        = bill.deposit || 0;
  const [includeVat, setIncludeVat] = useState(true);
  const vatAmt         = includeVat ? 0 : Math.round(subtotal * 0.07);
  const total          = Math.max(0, subtotal + vatAmt - deposit);

  /* ── Payment ── */
  type PayMethod = "cash"|"card"|"transfer"|"qr"|"deposit";
  const [payMethod, setPayMethod]       = useState<PayMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [cardLast4, setCardLast4]       = useState("");
  const [cardType, setCardType]         = useState("Visa");
  const [transferRef, setTransferRef]   = useState("");
  const cashChange = Math.max(0, (parseFloat(cashReceived) || 0) - total);
  const [receiptData, setReceiptData]   = useState<ReceiptData | null>(null);

  const PAY_METHODS: { id: PayMethod; label: string; Icon: React.ElementType }[] = [
    { id: "cash",     label: "เงินสด",           Icon: Banknote  },
    { id: "card",     label: "บัตรเครดิต/เดบิต", Icon: CreditCard },
    { id: "transfer", label: "โอนเงิน",           Icon: Smartphone },
    { id: "qr",       label: "PromptPay QR",      Icon: QrCode     },
    { id: "deposit",  label: "หักเงินมัดจำ",      Icon: Wallet     },
  ];

  const openReceipt = () => {
    const t = new Date();
    setReceiptData({
      receiptNo: invId.replace("BRD", "R"),
      date: `${t.getDate()} ${monthsTh[t.getMonth()]} ${t.getFullYear()+543} เวลา ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`,
      customerName: bill.ownerName,
      phone: bill.ownerPhone,
      petName: `${bill.petName}${bill.breed ? ` (${bill.breed})` : ""}`,
      items: [
        { name: `ค่าห้องพัก ${bill.roomType} (${NIGHTS} คืน)`, unit: "คืน", qty: NIGHTS, price: bill.dailyRate, discAmt: 0 },
        ...serviceItems.filter(s => s.price > 0).map(s => ({ name: s.name, unit: "ครั้ง", qty: 1, price: s.price, discAmt: 0 })),
      ],
      subtotal,
      totalItemDiscounts: 0,
      discountAmt: deposit,
      discountReason: deposit > 0 ? "หักมัดจำ" : "",
      includeVat,
      vatAmt,
      total,
      payMethod,
      cashReceived: payMethod === "cash" ? (parseFloat(cashReceived) || total) : undefined,
      cashChange:   payMethod === "cash" ? cashChange : undefined,
    });
    showSnackbar("success", "ชำระเงินสำเร็จแล้ว");
  };

  return (
    <motion.div className="flex flex-col flex-1 min-h-0 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>

      {/* ── Sub-header ── */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => { setReceiptData(null); navigate(-1); }}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: receiptData ? "linear-gradient(135deg,#0d7c66,#19a589)" : "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 10px rgba(25,165,137,0.25)" }}>
            {receiptData ? <CheckCircle2 className="w-4 h-4 text-white" /> : <BedDouble className="w-4 h-4 text-white" />}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 truncate" style={{ fontWeight: 700 }}>
              {receiptData ? "ใบเสร็จรับเงิน" : "ชำระเงินค่าฝากเลี้ยง"}
            </p>
            <p className="text-xs text-gray-400">{receiptData ? `#${receiptData.receiptNo}` : `${invId} · ${dateStr}`}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full flex-shrink-0 ${receiptData ? "bg-[#19a589]/10 text-[#0d7c66]" : "bg-amber-50 text-amber-700"}`} style={{ fontWeight: 500 }}>
          <span className={`w-1.5 h-1.5 rounded-full ${receiptData ? "bg-[#19a589]" : "bg-amber-400"}`} />
          {receiptData ? "ชำระแล้ว" : "รอชำระเงิน"}
        </span>
      </div>

      {/* ── Receipt inline OR payment form ── */}
      {receiptData ? (
        <ReceiptInlinePage
          data={receiptData}
          closeLabel="กลับหน้าการเงิน"
          onClose={() => { setReceiptData(null); navigate("/financial", { replace: true }); }}
        />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">

          {/* ════ LEFT: Pet & booking info ════ */}
          <div className="hidden md:flex md:w-56 lg:w-64 flex-shrink-0 border-r border-gray-100 bg-white flex-col overflow-y-auto">
            <div className="relative h-24 bg-gradient-to-br from-[#19a589]/20 to-[#e0f5f0] flex-shrink-0">
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-[4.5rem] h-[4.5rem] rounded-full bg-white ring-4 ring-white overflow-hidden shadow-lg">
                {bill.photo
                  ? <img src={bill.photo} alt={bill.petName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">{bill.species === "แมว" ? "🐈" : "🐕"}</div>}
              </div>
            </div>
            <div className="px-4 pt-12 pb-4 text-center">
              <p className="text-gray-900" style={{ fontWeight: 700, fontSize: "1rem" }}>{bill.petName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{bill.breed}</p>
              <div className="mt-3 space-y-2 text-left">
                {([
                  { label: "เจ้าของ",       value: bill.ownerName,  color: "text-gray-700" },
                  { label: "เบอร์โทร",      value: bill.ownerPhone, color: "text-gray-600" },
                  { label: "ประเภทห้อง",    value: bill.roomType,   color: "text-[#0d7c66]" },
                  { label: "หมายเลขห้อง",   value: bill.roomNumber, color: "text-gray-600" },
                  { label: "Check-in",      value: bill.checkIn,    color: "text-gray-600" },
                  { label: "Check-out",     value: bill.checkOut,   color: "text-gray-600" },
                ] as { label: string; value: string; color: string }[]).map(row => (
                  <div key={row.label} className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-gray-400 mb-0.5" style={{ fontSize: "0.62rem" }}>{row.label}</p>
                    <p className={`text-xs ${row.color} truncate`} style={{ fontWeight: 600 }}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mx-4 mb-4 mt-auto">
              <div className="rounded-xl px-3 py-3 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg,#e0f5f0,#f0faf8)", border: "1.5px solid rgba(25,165,137,0.2)" }}>
                <div className="w-8 h-8 rounded-full bg-[#19a589] flex items-center justify-center flex-shrink-0">
                  <BedDouble className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[#0d7c66]" style={{ fontSize: "0.6rem", fontWeight: 600 }}>ยอดต้องชำระ</p>
                  <p className="text-[#19a589]" style={{ fontSize: "0.9rem", fontWeight: 800 }}>฿{total.toLocaleString()}.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* ════ RIGHT: Bill + Payment ════ */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#FEFBF8]">
            <div className="p-3 sm:p-5 space-y-4">

              {/* Mobile pet strip */}
              <div className="flex md:hidden items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center text-xl">
                  {bill.photo ? <img src={bill.photo} alt={bill.petName} className="w-full h-full object-cover" /> : (bill.species === "แมว" ? "🐈" : "🐕")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate" style={{ fontWeight: 700 }}>{bill.petName}</p>
                  <p className="text-xs text-gray-400 truncate">{bill.breed} · {bill.ownerName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[0.6rem] text-gray-400">ยอดชำระ</p>
                  <p className="text-[#19a589]" style={{ fontWeight: 800 }}>฿{total.toLocaleString()}</p>
                </div>
              </div>

              {/* Bill header */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>สรุปบิลฝากเลี้ยง</span>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">{bill.bookingCode}</span>
              </div>

              {/* Bill table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100" style={{ background: "#f8faf8" }}>
                  <span className="flex-1 text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>รายการ</span>
                  <span className="w-16 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>จำนวน</span>
                  <span className="w-20 text-right text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>ราคา/หน่วย</span>
                  <span className="w-20 text-right text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>รวม</span>
                </div>

                {/* Room row */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#e0f5f0" }}>
                        <BedDouble className="w-2.5 h-2.5 text-[#19a589]" />
                      </span>
                      <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>ค่าห้องพัก {bill.roomType}</p>
                    </div>
                    <p className="text-[0.62rem] text-gray-400 mt-0.5" style={{ paddingLeft: "1.375rem" }}>{bill.roomNumber} · {bill.dailyRate.toLocaleString()} บาท/คืน</p>
                  </div>
                  <span className="w-16 text-center text-xs text-gray-600">{NIGHTS} คืน</span>
                  <span className="w-20 text-right text-xs text-gray-600">฿{bill.dailyRate.toLocaleString()}</span>
                  <span className="w-20 text-right text-xs text-gray-800" style={{ fontWeight: 700 }}>฿{roomTotal.toLocaleString()}</span>
                </div>

                {/* Service rows */}
                {serviceItems.map((svc, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#fef3c7" }}>
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        </span>
                        <p className="text-xs text-gray-800" style={{ fontWeight: 500 }}>{svc.name}</p>
                      </div>
                    </div>
                    <span className="w-16 text-center text-xs text-gray-400">1 ครั้ง</span>
                    <span className="w-20 text-right text-xs text-gray-600">{svc.price > 0 ? `฿${svc.price.toLocaleString()}` : "ฟรี"}</span>
                    <span className="w-20 text-right text-xs" style={{ fontWeight: svc.price > 0 ? 700 : 400, color: svc.price === 0 ? "#9ca3af" : "#1f2937" }}>
                      {svc.price > 0 ? `฿${svc.price.toLocaleString()}` : "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                  <div className="relative bg-[#f3f4f6] rounded-full p-0.5 flex text-xs" style={{ width: "fit-content" }}>
                    <motion.div layout transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute top-0.5 bottom-0.5 bg-white rounded-full shadow-sm"
                      style={{ width: "calc(50% - 2px)", left: includeVat ? "2px" : "calc(50%)" }} />
                    <button onClick={() => setIncludeVat(true)} className="relative z-10 px-4 py-1.5 rounded-full transition-colors text-[12px]"
                      style={{ fontWeight: includeVat ? 600 : 400, color: includeVat ? "#19a589" : "#6a7282" }}>รวม VAT</button>
                    <button onClick={() => setIncludeVat(false)} className="relative z-10 px-4 py-1.5 rounded-full transition-colors text-[12px]"
                      style={{ fontWeight: !includeVat ? 600 : 400, color: !includeVat ? "#19a589" : "#6a7282" }}>ไม่รวม VAT</button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500"><span>ค่าห้องพัก ({NIGHTS} คืน)</span><span>฿{roomTotal.toLocaleString()}</span></div>
                  {servicesTotal > 0 && <div className="flex justify-between text-gray-500"><span>บริการเสริม</span><span>฿{servicesTotal.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-gray-500"><span>ยอดรวม</span><span>฿{subtotal.toLocaleString()}</span></div>
                  {!includeVat && <div className="flex justify-between text-gray-500"><span>VAT 7%</span><span>฿{vatAmt.toLocaleString()}</span></div>}
                  {deposit > 0 && <div className="flex justify-between text-[#19a589]"><span>หักมัดจำ</span><span>−฿{deposit.toLocaleString()}</span></div>}
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ยอดชำระทั้งหมด</span>
                  <span className="text-[#19a589]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>฿{total.toLocaleString()}.00</span>
                </div>
              </div>

              {/* Payment section */}
              <div className="rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(160deg,#f0faf1 0%,#ffffff 45%)", border: "1.5px solid #d4ead6" }}>
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#19a589] flex items-center justify-center shadow-sm">
                        <CreditCard className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ชำระเงิน</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องชำระ</p>
                      <p className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span className="text-sm">.00</span></p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {PAY_METHODS.map(({ id, label, Icon }) => (
                      <button key={id} onClick={() => setPayMethod(id)}
                        className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                        style={{
                          background: payMethod === id ? "#19a589" : "rgba(255,255,255,0.85)",
                          boxShadow: payMethod === id ? "0 4px 14px rgba(25,165,137,0.35)" : "0 1px 3px rgba(0,0,0,0.07)",
                          border: payMethod === id ? "1.5px solid transparent" : "1.5px solid #e9ecef",
                          transform: payMethod === id ? "translateY(-1px)" : "none",
                        }}>
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: payMethod === id ? "white" : "#6b7280" }} />
                        <span className="text-center leading-tight" style={{ fontSize: "0.58rem", fontWeight: payMethod === id ? 600 : 400, color: payMethod === id ? "white" : "#6b7280" }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-5 border-t border-dashed border-[#c8e6ca]" />

                <AnimatePresence mode="wait">
                  <motion.div key={payMethod} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                    className="px-5 py-4 space-y-3">

                    {/* ── เงินสด ── */}
                    {payMethod === "cash" && (<>
                      <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องชำระ</p>
                          <p className="text-gray-800" style={{ fontWeight: 800, fontSize: "1.45rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.85rem" }}>.00</span></p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                          <Banknote className="w-5 h-5 text-[#19a589]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>จำนวนเงินที่รับ</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" style={{ fontWeight: 500 }}>฿</span>
                          <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder={String(total)}
                            className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 transition-all shadow-sm" style={{ fontWeight: 600 }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[100, 500, 1000, 5000].map(v => (
                          <button key={v} onClick={() => setCashReceived(String(v))}
                            className="px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-all" style={{ fontWeight: 500 }}>
                            ฿{v.toLocaleString()}
                          </button>
                        ))}
                        <button onClick={() => setCashReceived(String(Math.ceil(total / 100) * 100))}
                          className="px-3 py-1.5 rounded-full text-xs text-[#19a589] transition-all"
                          style={{ fontWeight: 600, background: "rgba(25,165,137,0.08)", border: "1px solid rgba(25,165,137,0.2)" }}>
                          เงินทอนพอดี
                        </button>
                      </div>
                      {cashReceived && (
                        <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between border border-green-100">
                          <span className="text-xs text-gray-600">เงินทอน</span>
                          <span className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1rem" }}>฿{cashChange.toLocaleString()}</span>
                        </div>
                      )}
                      <button onClick={openReceipt}
                        className="flex items-center justify-center gap-1.5 text-sm px-4 py-1.5 rounded-full transition-all ml-auto text-white active:scale-[0.98]"
                        style={{ fontWeight: 600, background: "linear-gradient(177deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> ยืนยันรับเงินสด
                      </button>
                    </>)}

                    {/* ── บัตรเครดิต/เดบิต ── */}
                    {payMethod === "card" && (<>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>ประเภทบัตร</label>
                        <div className="relative">
                          <select value={cardType} onChange={e => setCardType(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none transition-all shadow-sm">
                            {["Visa", "Mastercard", "Amex", "JCB", "UnionPay"].map(t => <option key={t}>{t}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>4 หลักท้าย</label>
                        <input type="text" value={cardLast4} onChange={e => setCardLast4(e.target.value.replace(/\D/g,"").slice(0,4))}
                          placeholder="0000" maxLength={4}
                          className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 transition-all shadow-sm text-center tracking-widest" style={{ fontWeight: 700 }} />
                      </div>
                      <button disabled={cardLast4.length !== 4} onClick={cardLast4.length === 4 ? openReceipt : undefined}
                        className={`flex items-center justify-center gap-1.5 text-sm px-4 py-1.5 rounded-full transition-all ml-auto ${cardLast4.length === 4 ? "text-white active:scale-[0.98]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                        style={cardLast4.length === 4 ? { fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" } : { fontWeight: 600 }}>
                        <CreditCard className="w-3.5 h-3.5" /> ยืนยันชำระด้วยบัตร
                      </button>
                    </>)}

                    {/* ── โอนเงิน ── */}
                    {payMethod === "transfer" && (<>
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <p className="text-xs text-blue-700 mb-1" style={{ fontWeight: 600 }}>ข้อมูลบัญชีรับโอน</p>
                        <p className="text-xs text-blue-600">ธนาคารกสิกรไทย · 0xx-x-xxxxx-x</p>
                        <p className="text-xs text-blue-600">ชื่อบัญชี: คลินิกสัตวแพทย์ สุขภาพดีเพ็ทคลินิก</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>หมายเลขอ้างอิง</label>
                        <input type="text" value={transferRef} onChange={e => setTransferRef(e.target.value)} placeholder="REF-XXXXXXXXXX"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 transition-all shadow-sm" />
                      </div>
                      <button disabled={!transferRef} onClick={transferRef ? openReceipt : undefined}
                        className={`flex items-center justify-center gap-1.5 text-sm px-4 py-1.5 rounded-full transition-all ml-auto ${transferRef ? "text-white active:scale-[0.98]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                        style={transferRef ? { fontWeight: 600, background: "linear-gradient(177deg,#1d4ed8,#1e40af)", boxShadow: "0 4px 14px rgba(29,78,216,0.25)" } : { fontWeight: 600 }}>
                        <Smartphone className="w-3.5 h-3.5" /> ยืนยันรับโอนเงิน
                      </button>
                    </>)}

                    {/* ── PromptPay QR ── */}
                    {payMethod === "qr" && (<>
                      <div className="flex flex-col items-center gap-3 py-2">
                        <div className="w-36 h-36 bg-white rounded-2xl border-2 border-[#19a589]/20 flex items-center justify-center shadow-md">
                          <div className="grid grid-cols-5 gap-0.5 p-2">
                            {Array.from({ length: 25 }, (_, i) => (
                              <div key={i} className="w-3.5 h-3.5 rounded-[2px]"
                                style={{ background: [0,1,5,6,7,11,12,13,17,18,19,23,24,3,9,15,21,4,10,16,22,2,8,14,20].includes(i) ? "#19a589" : "transparent" }} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">สแกน QR PromptPay เพื่อชำระ<br /><span style={{ fontWeight: 700, color: "#19a589" }}>฿{total.toLocaleString()}.00</span></p>
                      </div>
                      <button onClick={openReceipt}
                        className="flex items-center justify-center gap-1.5 text-sm px-4 py-1.5 rounded-full transition-all ml-auto text-white active:scale-[0.98]"
                        style={{ fontWeight: 600, background: "linear-gradient(177deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> ยืนยันชำระ PromptPay
                      </button>
                    </>)}

                    {/* ── หักมัดจำ ── */}
                    {payMethod === "deposit" && (<>
                      <div className="bg-[#e0f5f0] rounded-xl p-4 space-y-2 border border-[#19a589]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#0d7c66]" style={{ fontWeight: 600 }}>มัดจำที่มีอยู่</span>
                          <span className="text-[#19a589]" style={{ fontWeight: 800 }}>฿{deposit.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">ยอดค้างชำระ</span>
                          <span className="text-gray-800" style={{ fontWeight: 700 }}>฿{Math.max(0, total - deposit).toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={openReceipt}
                        className="flex items-center justify-center gap-1.5 text-sm px-4 py-1.5 rounded-full transition-all ml-auto text-white active:scale-[0.98]"
                        style={{ fontWeight: 600, background: "linear-gradient(177deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> ยืนยันหักมัดจำ
                      </button>
                    </>)}

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Grooming Bill View — full-page payment for grooming session        */
/* ═══════════════════════════════════════════════════════════════════ */
interface GroomingBillState {
  pet: string; breed: string; owner: string; phone: string;
  animal: string; photo: string; groomer: string; style: string; size: string;
  items: { name: string; unit: string; price: number; qty: number }[];
  discount: number;
}

function GroomingBillView({ bill }: { bill: GroomingBillState }) {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const monthsTh = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  const now = new Date();
  const dateStr = `${now.getDate()} ${monthsTh[now.getMonth()]} ${now.getFullYear() + 543}`;
  const [invId] = useState(`GRM-${now.getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`);

  /* ── Cart ── */
  const [cart, setCart] = useState<CartItem[]>(() =>
    bill.items.map((it, i) => ({ id: `g${i}`, name: it.name, unit: it.unit, price: it.price, qty: it.qty }))
  );
  const [itemDiscounts, setItemDiscounts] = useState<Record<string, { value: string; type: "fix"|"pct" }>>({});
  const [discountAmt, setDiscountAmt]     = useState(bill.discount ?? 0);
  const [discountReason, setDiscountReason] = useState(bill.discount > 0 ? "ส่วนลดบริการอาบน้ำ" : "");
  const [discountInput, setDiscountInput] = useState(bill.discount > 0 ? String(bill.discount) : "");
  const [discountType, setDiscountType]   = useState<"fix"|"pct">("fix");
  const [includeVat, setIncludeVat]       = useState(true);
  const [showDiscountPanel, setShowDiscountPanel] = useState(true);

  /* ── Payment ── */
  type PayMethod = "cash"|"card"|"transfer"|"qr"|"deposit";
  const [payMethod, setPayMethod]       = useState<PayMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [cardAmount, setCardAmount]     = useState("");
  const [cardType, setCardType]         = useState("Visa");
  const [cardLast4, setCardLast4]       = useState("");
  const [transferRef, setTransferRef]   = useState("");
  const [depositAmt, setDepositAmt]     = useState("");
  const MOCK_DEPOSIT = 500;
  const [receiptData, setReceiptData]   = useState<ReceiptData | null>(null);

  /* ── Helpers ── */
  const getItemDiscountAmt = (item: CartItem) => {
    const d = itemDiscounts[item.id]; if (!d || !d.value) return 0;
    const v = parseFloat(d.value) || 0; const gross = item.price * item.qty;
    return d.type === "pct" ? Math.round(gross * v / 100) : Math.min(v, gross);
  };
  const setItemDiscount = (id: string, value: string, type: "fix"|"pct") =>
    setItemDiscounts(prev => ({ ...prev, [id]: { value, type } }));
  const changeQty = (id: string, delta: number) =>
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
    setItemDiscounts(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  /* ── Totals ── */
  const subtotal           = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totalItemDiscounts = cart.reduce((s, c) => s + getItemDiscountAmt(c), 0);
  const afterItemDisc      = subtotal - totalItemDiscounts;
  const afterDisc          = Math.max(0, afterItemDisc - discountAmt);
  const vatAmt             = includeVat ? 0 : Math.round(afterDisc * 0.07);
  const total              = afterDisc + vatAmt;
  const cashChange         = Math.max(0, (parseFloat(cashReceived) || 0) - total);
  const depositLeft        = Math.max(0, MOCK_DEPOSIT - (parseFloat(depositAmt) || 0));

  const applyQuickDiscount = (d: typeof quickDiscounts[0]) => {
    const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    setDiscountAmt(d.type === "pct" ? Math.round(sub * d.value / 100) : d.value);
    setDiscountReason(d.label); setDiscountInput(String(d.value));
  };
  const applyManualDiscount = () => {
    const v = parseFloat(discountInput) || 0;
    setDiscountAmt(discountType === "pct" ? Math.round(afterItemDisc * v / 100) : v);
    if (!discountReason) setDiscountReason("ส่วนลดพิเศษ");
  };
  const cancelDiscount = () => { setDiscountAmt(0); setDiscountReason(""); setDiscountInput(""); };

  const PAY_METHODS: { id: PayMethod; label: string; Icon: React.ElementType }[] = [
    { id: "cash",     label: "เงินสด",           Icon: Banknote   },
    { id: "card",     label: "บัตรเครดิต/เดบิต", Icon: CreditCard  },
    { id: "transfer", label: "โอนเงิน",           Icon: Smartphone  },
    { id: "qr",       label: "PromptPay QR",      Icon: QrCode      },
    { id: "deposit",  label: "หักเงินค่ามัดจำ",   Icon: Wallet      },
  ];

  const openReceipt = () => {
    const t = new Date();
    setReceiptData({
      receiptNo: invId.replace("GRM","R"),
      date: `${t.getDate()} ${monthsTh[t.getMonth()]} ${t.getFullYear()+543} เวลา ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`,
      customerName: bill.owner, phone: bill.phone,
      petName: `${bill.pet}${bill.breed ? ` (${bill.breed})` : ""}`,
      items: cart.map(c => ({ name: c.name, unit: c.unit, qty: c.qty, price: c.price, discAmt: getItemDiscountAmt(c) })),
      subtotal, totalItemDiscounts, discountAmt, discountReason, includeVat, vatAmt, total, payMethod,
      cashReceived: payMethod === "cash" ? (parseFloat(cashReceived) || total) : undefined,
      cashChange:   payMethod === "cash" ? cashChange : undefined,
    });
    showSnackbar("success", "ชำระเงินสำเร็จแล้ว");
  };

  return (
    <motion.div className="flex flex-col flex-1 min-h-0 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>

      {/* ── Sub-header ── */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => { setReceiptData(null); navigate(-1); }}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: receiptData ? "linear-gradient(135deg,#0d7c66,#19a589)" : "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 10px rgba(25,165,137,0.25)" }}>
            {receiptData ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Scissors className="w-4 h-4 text-white" />}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 truncate" style={{ fontWeight: 700 }}>
              {receiptData ? "ใบเสร็จรับเงิน" : "ชำระเงินค่าบริการอาบน้ำ"}
            </p>
            <p className="text-xs text-gray-400">{receiptData ? `#${receiptData.receiptNo}` : `${invId} · ${dateStr}`}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full flex-shrink-0 ${receiptData ? "bg-[#19a589]/10 text-[#0d7c66]" : "bg-amber-50 text-amber-700"}`} style={{ fontWeight: 500 }}>
          <span className={`w-1.5 h-1.5 rounded-full ${receiptData ? "bg-[#19a589]" : "bg-amber-400"}`} />
          {receiptData ? "ชำระแล้ว" : "ยังไม่ชำระ"}
        </span>
      </div>

      {/* ── Receipt inline OR payment form ── */}
      {receiptData ? (
        <ReceiptInlinePage
          data={receiptData}
          closeLabel="กลับหน้าการเงิน"
          onClose={() => { setReceiptData(null); navigate("/financial", { replace: true }); }}
        />
      ) : (
      <>{/* ── Two-column body ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">

        {/* ════ LEFT: Pet & session card ════ */}
        <div className="hidden md:flex md:w-56 lg:w-64 flex-shrink-0 border-r border-gray-100 bg-white flex-col overflow-y-auto">

          {/* Banner + avatar */}
          <div className="relative h-24 bg-gradient-to-br from-[#19a589]/20 to-[#e0f5f0] flex-shrink-0">
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-[4.5rem] h-[4.5rem] rounded-full bg-white ring-4 ring-white overflow-hidden shadow-lg">
              {bill.photo
                ? <img src={bill.photo} alt={bill.pet} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">{bill.animal || "🐕"}</div>}
            </div>
          </div>

          {/* Pet info */}
          <div className="px-4 pt-12 pb-4 text-center">
            <p className="text-gray-900" style={{ fontWeight: 700, fontSize: "1rem" }}>{bill.pet || "ไม่ระบุ"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{bill.breed || "—"}</p>
            <div className="mt-3 space-y-2 text-left">
              {([
                { label: "เจ้าของ",   value: bill.owner   || "—", color: "text-gray-700" },
                { label: "เบอร์โทร",  value: bill.phone   || "—", color: "text-gray-600" },
                { label: "ช่างทำขน", value: bill.groomer || "—", color: "text-[#0d7c66]" },
                { label: "สไตล์",    value: bill.style   || "—", color: "text-gray-600" },
                { label: "ขนาด",     value: bill.size    || "—", color: "text-gray-600" },
              ] as { label: string; value: string; color: string }[]).map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-gray-400 mb-0.5" style={{ fontSize: "0.62rem" }}>{row.label}</p>
                  <p className={`text-xs ${row.color} truncate`} style={{ fontWeight: 600 }}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total badge */}
          <div className="mx-4 mb-4 mt-auto">
            <div className="rounded-xl px-3 py-3 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#e0f5f0,#f0faf8)", border: "1.5px solid rgba(25,165,137,0.2)" }}>
              <div className="w-8 h-8 rounded-full bg-[#19a589] flex items-center justify-center flex-shrink-0">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[#0d7c66]" style={{ fontSize: "0.6rem", fontWeight: 600 }}>ยอดต้องชำระ</p>
                <p className="text-[#19a589]" style={{ fontSize: "0.9rem", fontWeight: 800 }}>฿{total.toLocaleString()}.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT: Bill + Payment ════ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#FEFBF8]">
          <div className="p-3 sm:p-5 space-y-4">

            {/* Mobile pet strip */}
            <div className="flex md:hidden items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center text-xl">
                {bill.photo ? <img src={bill.photo} alt={bill.pet} className="w-full h-full object-cover" /> : bill.animal}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate" style={{ fontWeight: 700 }}>{bill.pet}</p>
                <p className="text-xs text-gray-400 truncate">{bill.breed} · {bill.owner}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[0.6rem] text-gray-400">ยอดชำระ</p>
                <p className="text-[#19a589]" style={{ fontWeight: 800 }}>฿{total.toLocaleString()}</p>
              </div>
            </div>

            {/* Bill header */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>สรุปบิลบริการ</span>
              <span className="text-xs text-gray-400">{cart.length} รายการ</span>
            </div>

            {/* Cart table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              {cart.length === 0 ? (
                <div className="py-10 text-center">
                  <Scissors className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">ไม่มีรายการบริการ</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100" style={{ background: "#f8faf8" }}>
                    <span className="flex-1 min-w-0 text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600, letterSpacing: "0.04em" }}>รายการบริการ</span>
                    <span className="w-20 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>จำนวน</span>
                    <span className="w-16 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>ราคา/หน่วย</span>
                    <span className="w-24 text-center text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>ส่วนลด</span>
                    <span className="w-14 text-right text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>VAT</span>
                    <span className="w-16 text-right text-gray-400" style={{ fontSize: "0.63rem", fontWeight: 600 }}>รวม</span>
                    <span className="w-8" />
                  </div>
                  {cart.map(item => {
                    const itemGross = item.price * item.qty;
                    const itemDisc  = getItemDiscountAmt(item);
                    const itemNet   = itemGross - itemDisc;
                    const itemVat   = Math.round(itemNet * 7 / 107 * 100) / 100;
                    const discState = itemDiscounts[item.id] ?? { value: "", type: "fix" as const };
                    return (
                      <div key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ fontSize: "0.55rem", fontWeight: 600, background: "#e8f5e9", color: "#2e7d32" }}>บริการ</span>
                            <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                          </div>
                          <p className="text-gray-400" style={{ fontSize: "0.6rem" }}>฿{item.price.toLocaleString()} / {item.unit}</p>
                        </div>
                        <div className="w-20 flex items-center justify-center gap-1">
                          <button onClick={() => changeQty(item.id, -1)} className="w-5 h-5 rounded-full bg-gray-100 hover:bg-[#19a589]/10 hover:text-[#19a589] flex items-center justify-center text-gray-500 transition-colors" style={{ fontSize: "0.8rem" }}>−</button>
                          <span className="w-5 text-xs text-center text-gray-800" style={{ fontWeight: 700 }}>{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)} className="w-5 h-5 rounded-full bg-gray-100 hover:bg-[#19a589]/10 hover:text-[#19a589] flex items-center justify-center text-gray-500 transition-colors" style={{ fontSize: "0.8rem" }}>+</button>
                        </div>
                        <span className="w-16 text-gray-600 text-center" style={{ fontSize: "0.7rem", fontWeight: 500 }}>฿{item.price.toLocaleString()}</span>
                        <div className="w-24 flex items-center gap-1 justify-end">
                          <input type="number" min="0" value={discState.value}
                            onChange={e => setItemDiscount(item.id, e.target.value, discState.type)} placeholder="0"
                            className="w-12 text-right bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#19a589]/30 transition-all"
                            style={{ fontSize: "0.65rem", color: itemDisc > 0 ? "#e53935" : "#9ca3af" }} />
                          <select value={discState.type} onChange={e => setItemDiscount(item.id, discState.value, e.target.value as "fix"|"pct")}
                            className="bg-gray-50 border border-gray-200 rounded-lg py-0.5 pl-1 pr-1 focus:outline-none text-gray-500 cursor-pointer" style={{ fontSize: "0.6rem" }}>
                            <option value="fix">฿</option>
                            <option value="pct">%</option>
                          </select>
                        </div>
                        <span className="w-14 text-gray-500 text-right" style={{ fontSize: "0.7rem", fontWeight: 500 }}>฿{itemVat.toFixed(2)}</span>
                        <div className="w-16 text-right">
                          {itemDisc > 0 && <p className="text-gray-300 line-through" style={{ fontSize: "0.6rem" }}>฿{itemGross.toLocaleString()}</p>}
                          <span className="text-gray-800" style={{ fontSize: "0.75rem", fontWeight: 700 }}>฿{itemNet.toLocaleString()}</span>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="w-8 flex justify-end text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Discount panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => setShowDiscountPanel(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-700" style={{ fontWeight: 600 }}>
                  <Tag className="w-4 h-4 text-[#19a589]" /> ส่วนลด
                  {discountAmt > 0 && <span className="text-xs text-[#19a589]" style={{ fontWeight: 500 }}>(-฿{discountAmt.toLocaleString()})</span>}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDiscountPanel ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showDiscountPanel && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-100">
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-2">ส่วนลดสำเร็จรูป</p>
                        <div className="flex flex-wrap gap-2">
                          {quickDiscounts.map(d => (
                            <button key={d.label} onClick={() => applyQuickDiscount(d)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${discountReason === d.label ? "bg-[#19a589] text-white border-[#19a589]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#19a589]/40"}`}
                              style={{ fontWeight: discountReason === d.label ? 600 : 400 }}>{d.label}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-xs text-gray-400 block mb-1">จำนวนส่วนลด</label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#19a589]/20 transition-all">
                              <input type="number" value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="0"
                                className="flex-1 pl-3 pr-1 py-2 text-sm bg-transparent focus:outline-none min-w-0" />
                              <div className="flex-shrink-0 border-l border-gray-200">
                                <div className="relative">
                                  <select value={discountType} onChange={e => setDiscountType(e.target.value as "fix"|"pct")}
                                    className="h-full pl-2 pr-7 py-2 text-xs bg-white text-gray-600 focus:outline-none appearance-none cursor-pointer" style={{ fontWeight: 500 }}>
                                    <option value="fix">฿ บาท</option>
                                    <option value="pct">% เปอร์เซ็นต์</option>
                                  </select>
                                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">เหตุผล</label>
                          <textarea value={discountReason} onChange={e => setDiscountReason(e.target.value)}
                            placeholder="ระบุเหตุผลส่วนลด..." rows={2} className="vet-textarea" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelDiscount} className="text-xs px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">ยกเลิก</button>
                          <button onClick={applyManualDiscount} className="text-xs px-4 py-1.5 rounded-full bg-[#19a589] text-white hover:bg-[#0d7c66] transition-all" style={{ fontWeight: 600 }}>ใช้ส่วนลด</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* VAT + Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                <div className="relative bg-[#f3f4f6] rounded-full p-0.5 flex text-xs" style={{ width: "fit-content" }}>
                  <motion.div layout transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute top-0.5 bottom-0.5 bg-white rounded-full shadow-sm"
                    style={{ width: "calc(50% - 2px)", left: includeVat ? "2px" : "calc(50%)" }} />
                  <button onClick={() => setIncludeVat(true)} className="relative z-10 px-4 py-1.5 rounded-full transition-colors text-[12px]"
                    style={{ fontWeight: includeVat ? 600 : 400, color: includeVat ? "#19a589" : "#6a7282" }}>รวม VAT</button>
                  <button onClick={() => setIncludeVat(false)} className="relative z-10 px-4 py-1.5 rounded-full transition-colors text-[12px]"
                    style={{ fontWeight: !includeVat ? 600 : 400, color: !includeVat ? "#19a589" : "#6a7282" }}>ไม่รวม VAT</button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500"><span>ยอดรวมรายการ</span><span>฿{subtotal.toLocaleString()}</span></div>
                {totalItemDiscounts > 0 && (
                  <div className="flex justify-between text-red-400"><span>ส่วนลดต่อรายการ</span><span>−฿{totalItemDiscounts.toLocaleString()}</span></div>
                )}
                {discountAmt > 0 && (
                  <div className="flex justify-between text-[#19a589]">
                    <span>ส่วนลด {discountReason && <span className="opacity-70">({discountReason})</span>}</span>
                    <span>−฿{discountAmt.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500"><span>VAT 7%</span><span>฿{vatAmt.toLocaleString()}</span></div>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ยอดชำระทั้งหมด</span>
                <span className="text-[#19a589]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>฿{total.toLocaleString()}.00</span>
              </div>
            </div>

            {/* Payment section */}
            <div className="rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(160deg,#f0faf1 0%,#ffffff 45%)", border: "1.5px solid #d4ead6" }}>
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#19a589] flex items-center justify-center shadow-sm">
                      <CreditCard className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ชำระเงิน</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องชำระ</p>
                    <p className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span className="text-sm">.00</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {PAY_METHODS.map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setPayMethod(id)}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                      style={{
                        background: payMethod === id ? "#19a589" : "rgba(255,255,255,0.85)",
                        boxShadow: payMethod === id ? "0 4px 14px rgba(25,165,137,0.35)" : "0 1px 3px rgba(0,0,0,0.07)",
                        border: payMethod === id ? "1.5px solid transparent" : "1.5px solid #e9ecef",
                        transform: payMethod === id ? "translateY(-1px)" : "none",
                      }}>
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: payMethod === id ? "white" : "#6b7280" }} />
                      <span className="text-center leading-tight" style={{ fontSize: "0.58rem", fontWeight: payMethod === id ? 600 : 400, color: payMethod === id ? "white" : "#6b7280" }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mx-5 border-t border-dashed border-[#c8e6ca]" />

              <AnimatePresence mode="wait">
                <motion.div key={payMethod} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  className="px-5 py-4 space-y-3">

                  {payMethod === "cash" && (<>
                    <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องชำระ</p>
                        <p className="text-gray-800" style={{ fontWeight: 800, fontSize: "1.45rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.85rem" }}>.00</span></p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-[#19a589]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>จำนวนเงินที่รับ</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" style={{ fontWeight: 500 }}>฿</span>
                        <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder={String(total)}
                          className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 transition-all shadow-sm" style={{ fontWeight: 600 }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[100, 500, 1000, 5000].map(v => (
                        <button key={v} onClick={() => setCashReceived(String(v))}
                          className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#19a589]/50 hover:text-[#19a589] transition-all shadow-sm" style={{ fontWeight: 500 }}>
                          ฿{v.toLocaleString()}
                        </button>
                      ))}
                      <button onClick={() => setCashReceived(String(total))}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#19a589] border border-[#19a589] text-white hover:bg-[#0d7c66] transition-all shadow-sm" style={{ fontWeight: 600 }}>
                        พอดี
                      </button>
                    </div>
                    <div className="flex justify-between items-center rounded-xl px-4 py-3 text-xs"
                      style={{ background: cashChange > 0 ? "linear-gradient(135deg,#f0faf1,#e8f5e9)" : "#f9fafb", border: `1.5px solid ${cashChange > 0 ? "#c8e6ca" : "#e5e7eb"}` }}>
                      <span className="text-gray-500">เงินทอน</span>
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: cashChange > 0 ? "#19a589" : "#9ca3af" }}>฿{cashChange.toLocaleString()}.00</span>
                    </div>
                    <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      <Banknote className="w-3.5 h-3.5" /> ยืนยันรับเงินสด
                    </button>
                  </>)}

                  {payMethod === "card" && (<>
                    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", minHeight: "88px" }}>
                      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#fff,transparent)" }} />
                      <p className="text-white/40 text-xs mb-3 mt-0.5">{cardType === "Amex" ? "American Express" : cardType}</p>
                      <p className="text-white" style={{ fontWeight: 600, letterSpacing: "0.18em", fontSize: "0.9rem", fontFamily: "monospace" }}>
                        •••• •••• •••• {cardLast4 || <span style={{ color: "rgba(255,255,255,0.3)" }}>____</span>}
                      </p>
                      <p className="text-white/30 text-xs mt-3">฿{total.toLocaleString()}.00</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>ประเภทบัตร</label>
                        <div className="relative">
                          <select value={cardType} onChange={e => setCardType(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none appearance-none shadow-sm">
                            {["Visa","Mastercard","Amex","JCB","UnionPay"].map(t => <option key={t}>{t}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>4 หลักท้าย</label>
                        <input type="text" value={cardLast4} onChange={e => setCardLast4(e.target.value.replace(/\D/g,"").slice(0,4))}
                          placeholder="0000" maxLength={4}
                          className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none shadow-sm text-center tracking-widest" style={{ fontWeight: 700 }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>ยอดชำระ</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">฿</span>
                        <input type="number" value={cardAmount || total} onChange={e => setCardAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none shadow-sm" style={{ fontWeight: 600 }} />
                      </div>
                    </div>
                    <button
                      className={`flex items-center justify-center gap-1.5 text-sm px-4 py-1.5 rounded-full transition-all ml-auto ${cardLast4.length === 4 ? "text-white active:scale-[0.98]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                      style={cardLast4.length === 4 ? { fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" } : { fontWeight: 600 }}
                      disabled={cardLast4.length !== 4} onClick={cardLast4.length === 4 ? openReceipt : undefined}>
                      <CreditCard className="w-3.5 h-3.5" /> ยืนยันชำระด้วยบัตร
                    </button>
                  </>)}

                  {payMethod === "transfer" && (<>
                    <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">ยอดที่ต้องโอน</p>
                        <p className="text-gray-800" style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.85rem" }}>.00</span></p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="rounded-xl px-4 py-3 text-xs space-y-1.5" style={{ background: "#f0f7ff", border: "1.5px solid #dbeafe" }}>
                      <div className="flex justify-between"><span className="text-blue-400">ธนาคาร</span><span className="text-blue-700" style={{ fontWeight: 600 }}>กสิกรไทย (KBANK)</span></div>
                      <div className="flex justify-between"><span className="text-blue-400">เลขบัญชี</span><span className="text-blue-700" style={{ fontWeight: 600 }}>123-4-56789-0</span></div>
                      <div className="flex justify-between"><span className="text-blue-400">ชื่อบัญชี</span><span className="text-blue-700" style={{ fontWeight: 600 }}>คลินิกสัตวแพทย์</span></div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>เลขอ้างอิง / หมายเลขรายการ</label>
                      <input type="text" value={transferRef} onChange={e => setTransferRef(e.target.value)} placeholder="เลขอ้างอิงจากสลิปโอน" className="vet-input" />
                    </div>
                    <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      <Smartphone className="w-3.5 h-3.5" /> ยืนยันการโอน
                    </button>
                  </>)}

                  {payMethod === "qr" && (<>
                    <div className="flex flex-col items-center py-2 gap-3">
                      <div className="relative">
                        <div className="w-40 h-40 rounded-2xl bg-white flex items-center justify-center shadow-md border border-gray-100 p-3">
                          <div className="w-full h-full rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200">
                            <QrCode className="w-14 h-14 text-gray-300" />
                            <p className="text-xs text-gray-300">QR Code</p>
                          </div>
                        </div>
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#19a589] text-white text-xs px-3 py-0.5 rounded-full shadow-md" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>PromptPay</div>
                      </div>
                      <div className="text-center mt-1">
                        <p className="text-xs text-gray-400 mb-1">สแกนเพื่อชำระ</p>
                        <p className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.5px" }}>฿{total.toLocaleString()}<span style={{ fontSize: "0.9rem" }}>.00</span></p>
                        <p className="text-xs text-gray-400 mt-1">รองรับทุกธนาคารผ่าน PromptPay</p>
                      </div>
                    </div>
                    <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      <QrCode className="w-3.5 h-3.5" /> ยืนยันการรับชำระ QR
                    </button>
                  </>)}

                  {payMethod === "deposit" && (<>
                    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                      <div className="absolute right-3 top-2 opacity-15"><Wallet className="w-16 h-16 text-white" /></div>
                      <p className="text-white/70 text-xs mb-1">ยอดมัดจำคงเหลือ</p>
                      <p className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.5px" }}>฿{MOCK_DEPOSIT.toLocaleString()}<span style={{ fontSize: "0.9rem" }}>.00</span></p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>จำนวนที่ต้องการตัด</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">฿</span>
                        <input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} placeholder={String(Math.min(total, MOCK_DEPOSIT))}
                          className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none shadow-sm" style={{ fontWeight: 600 }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">จาก ฿{total.toLocaleString()}.00</p>
                    </div>
                    <div className="flex justify-between items-center rounded-xl px-4 py-3 text-xs"
                      style={{ background: depositLeft < 100 ? "linear-gradient(135deg,#fff5f5,#fee2e2)" : "#f9fafb", border: `1.5px solid ${depositLeft < 100 ? "#fca5a5" : "#e5e7eb"}` }}>
                      <span className="text-gray-500">ยอดมัดจำคงเหลือหลังตัด</span>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: depositLeft < 100 ? "#ef4444" : "#1f2937" }}>฿{depositLeft.toLocaleString()}.00</span>
                    </div>
                    <button onClick={openReceipt} className="flex items-center justify-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full active:scale-[0.98] transition-all ml-auto" style={{ fontWeight: 600, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 14px rgba(73,138,79,0.28)" }}>
                      <Wallet className="w-3.5 h-3.5" /> ยืนยันพักมัดจำ
                    </button>
                  </>)}

                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      </>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Financial Page                                                */
/* ═══════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════
   Receipt Registry — ทะเบียนใบเสร็จ (ตรวจสอบ / ยกเลิกย้อนหลัง)
   ═══════════════════════════════════════════════════════════════════ */
const TH_MONTHS_ABBR = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
/* "28 ก.พ. 2569" (พ.ศ.) → ISO "2026-02-28" */
function thaiDateToIso(s: string): string {
  const m = s.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})/);
  if (!m) return "";
  const mi = TH_MONTHS_ABBR.indexOf(m[2]);
  if (mi < 0) return "";
  const y = parseInt(m[3], 10) - 543;
  return `${y}-${String(mi + 1).padStart(2, "0")}-${String(parseInt(m[1], 10)).padStart(2, "0")}`;
}
const invToReceiptNo = (invId: string) => invId.replace("INV-", "RC-");

interface CancelInfo { at: string; by: string; reason: string; }
const CANCEL_KEY = "ehp_receipt_cancels_v1";
const loadCancels = (): Record<string, CancelInfo> => {
  try { const r = localStorage.getItem(CANCEL_KEY); if (r) return JSON.parse(r); } catch { /* ignore */ }
  return {};
};

function ReceiptRegistry({ search }: { search: string }) {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { user } = useAuth();

  /* ใบเสร็จ = invoice ที่ออกใบเสร็จแล้ว (ชำระแล้ว / คืนเงินแล้ว) */
  const baseReceipts = useMemo(() =>
    invoices.filter(inv => inv.status !== "ยังไม่ชำระ").map(inv => ({
      ...inv, receiptNo: invToReceiptNo(inv.id), iso: thaiDateToIso(inv.date),
    })), []);

  const [cancels, setCancels] = useState<Record<string, CancelInfo>>(() => loadCancels());
  const [fltFrom, setFltFrom] = useState("");
  const [fltTo, setFltTo] = useState("");
  const [viewRc, setViewRc] = useState<typeof baseReceipts[number] | null>(null);
  const [cancelRc, setCancelRc] = useState<typeof baseReceipts[number] | null>(null);

  const persistCancels = (next: Record<string, CancelInfo>) => {
    setCancels(next);
    try { localStorage.setItem(CANCEL_KEY, JSON.stringify(next)); } catch { /* quota */ }
  };

  const statusOf = (rc: typeof baseReceipts[number]) => cancels[rc.id] ? "ยกเลิก" : rc.status;

  const filtered = baseReceipts.filter(rc => {
    const q = search.trim().toLowerCase();
    const ms = !q || rc.pet.includes(search) || rc.owner.includes(search) || rc.receiptNo.toLowerCase().includes(q) || rc.id.toLowerCase().includes(q);
    let md = true;
    if (fltFrom || fltTo) {
      if (!rc.iso) md = false;
      else {
        if (fltFrom && rc.iso < fltFrom) md = false;
        if (fltTo && rc.iso > fltTo) md = false;
      }
    }
    return ms && md;
  }).sort((a, b) => b.iso.localeCompare(a.iso));

  const doCancel = (rc: typeof baseReceipts[number], reason: string) => {
    persistCancels({ ...cancels, [rc.id]: { at: new Date().toISOString(), by: user?.displayName ?? "เจ้าหน้าที่", reason } });
    showSnackbar("delete", `ยกเลิกใบเสร็จ ${rc.receiptNo} แล้ว`);
    setCancelRc(null);
    setViewRc(null);
  };
  const undoCancel = async (rc: typeof baseReceipts[number]) => {
    const ok = await confirm({ title: "คืนสถานะใบเสร็จ", description: `นำ ${rc.receiptNo} กลับมาใช้งาน (ยกเลิกการยกเลิก)?`, confirmLabel: "คืนสถานะ", kind: "warning" });
    if (!ok) return;
    const next = { ...cancels }; delete next[rc.id]; persistCancels(next);
    showSnackbar("success", `คืนสถานะใบเสร็จ ${rc.receiptNo} แล้ว`);
  };

  const cancelledCount = baseReceipts.filter(rc => cancels[rc.id]).length;
  const totalActive = filtered.filter(rc => !cancels[rc.id] && statusOf(rc) === "ชำระแล้ว").reduce((s, rc) => s + rc.amount, 0);

  const chip = (s: string) =>
    s === "ยกเลิก" ? { bg: "rgba(107,114,128,0.12)", color: "#4b5563" } :
    s === "ชำระแล้ว" ? { bg: "rgba(25,165,137,0.10)", color: "#0d7c66" } :
    s === "คืนเงินแล้ว" ? { bg: "rgba(239,68,68,0.10)", color: "#dc2626" } :
    { bg: "rgba(245,158,11,0.10)", color: "#b45309" };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-full bg-gray-50 border border-gray-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#19a589] flex-shrink-0" />
            <span className="text-gray-400 whitespace-nowrap" style={{ fontWeight: 600 }}>วันที่</span>
            <input type="date" value={fltFrom} onChange={e => setFltFrom(e.target.value)} className="text-[11.5px] bg-transparent focus:outline-none text-gray-700 w-[110px]" style={{ fontWeight: 600 }} />
            <span className="text-gray-300">–</span>
            <input type="date" value={fltTo} onChange={e => setFltTo(e.target.value)} className="text-[11.5px] bg-transparent focus:outline-none text-gray-700 w-[110px]" style={{ fontWeight: 600 }} />
            {(fltFrom || fltTo) && (
              <button onClick={() => { setFltFrom(""); setFltTo(""); }} title="ล้างช่วงวันที่" className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-[11.5px] text-gray-500 ml-auto" style={{ fontWeight: 600 }}>
            พบ {filtered.length} ใบ · ใช้งานได้ ฿{totalActive.toLocaleString()}
            {cancelledCount > 0 && <span className="text-gray-400"> · ยกเลิก {cancelledCount}</span>}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[12.5px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th className="text-left px-4 py-2.5">เลขที่ใบเสร็จ</th>
                <th className="text-left px-3 py-2.5">วันที่</th>
                <th className="text-left px-3 py-2.5">ผู้ป่วย / เจ้าของ</th>
                <th className="text-left px-3 py-2.5">สัตวแพทย์</th>
                <th className="text-right px-3 py-2.5">ยอดเงิน</th>
                <th className="text-center px-3 py-2.5">สถานะ</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-14 text-gray-400 text-[12px]">ไม่พบใบเสร็จในเงื่อนไขที่เลือก</td></tr>
              )}
              {filtered.map(rc => {
                const st = statusOf(rc);
                const cx = chip(st);
                const cancelled = !!cancels[rc.id];
                return (
                  <tr key={rc.id} className="hover:bg-[#f8fffe] transition-colors" style={cancelled ? { opacity: 0.6 } : undefined}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[#0d7c66]" style={{ fontWeight: 700, textDecoration: cancelled ? "line-through" : undefined }}>{rc.receiptNo}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{rc.date}</td>
                    <td className="px-3 py-3">
                      <p className="text-gray-800" style={{ fontWeight: 600 }}>{rc.animal} {rc.pet}</p>
                      <p className="text-[11px] text-gray-400">{rc.owner}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{rc.vet}</td>
                    <td className="px-3 py-3 text-right text-[#1e2939]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>฿{rc.amount.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ fontWeight: 700, background: cx.bg, color: cx.color }}>{st}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setViewRc(rc)} className="inline-flex items-center gap-0.5 text-[11px] px-2.5 py-1 rounded-lg text-[#0d7c66] hover:bg-[rgba(25,165,137,0.10)] transition-colors" style={{ fontWeight: 600, border: "1px solid rgba(25,165,137,0.30)" }}>
                        <Eye className="w-3 h-3" /> ดู
                      </button>
                      {cancelled ? (
                        <button onClick={() => undoCancel(rc)} className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] px-2.5 py-1 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" style={{ fontWeight: 600, border: "1px solid rgba(245,158,11,0.30)" }} title="คืนสถานะ">
                          <RotateCcw className="w-3 h-3" /> คืน
                        </button>
                      ) : (
                        <button onClick={() => setCancelRc(rc)} className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors" style={{ fontWeight: 600, border: "1px solid rgba(244,63,94,0.30)" }} title="ยกเลิกใบเสร็จ">
                          <Ban className="w-3 h-3" /> ยกเลิก
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── รายละเอียดใบเสร็จ ── */}
      <AnimatePresence>
        {viewRc && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={() => setViewRc(null)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[480px] bg-white rounded-3xl overflow-hidden flex flex-col" style={{ maxHeight: "min(720px, calc(100vh - 2rem))", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}
              onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[15px] text-gray-900" style={{ fontWeight: 800 }}>{viewRc.receiptNo}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...(() => { const c = chip(statusOf(viewRc)); return { background: c.bg, color: c.color }; })() }}>{statusOf(viewRc)}</span>
                  </div>
                  <p className="text-[11.5px] text-gray-500 mt-0.5">{viewRc.animal} {viewRc.pet} · {viewRc.owner} · {viewRc.date}</p>
                </div>
                <button onClick={() => setViewRc(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cancels[viewRc.id] && (
                  <div className="p-3 rounded-xl" style={{ background: "rgba(107,114,128,0.06)", border: "1px solid rgba(107,114,128,0.20)" }}>
                    <p className="text-[12px] text-gray-700" style={{ fontWeight: 700 }}>⊘ ใบเสร็จนี้ถูกยกเลิก</p>
                    <p className="text-[11px] text-gray-500 mt-1">เหตุผล: {cancels[viewRc.id].reason || "—"}</p>
                    <p className="text-[10.5px] text-gray-400 mt-0.5">โดย {cancels[viewRc.id].by} · {new Date(cancels[viewRc.id].at).toLocaleString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })} น.</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                  <div><span className="text-gray-400">สัตวแพทย์</span><p className="text-gray-800" style={{ fontWeight: 600 }}>{viewRc.vet}</p></div>
                  <div><span className="text-gray-400">อ้างอิงใบแจ้งหนี้</span><p className="text-gray-800 font-mono" style={{ fontWeight: 600 }}>{viewRc.id}</p></div>
                </div>
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase" }}>
                        <th className="text-left px-3 py-2">รายการ</th>
                        <th className="text-center px-2 py-2">จำนวน</th>
                        <th className="text-right px-3 py-2">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(visitItems[viewRc.id] ?? []).map((it, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-gray-800" style={{ fontWeight: 600 }}>{it.name}</td>
                          <td className="px-2 py-2 text-center text-gray-500">{it.qty} {it.unit}</td>
                          <td className="px-3 py-2 text-right text-gray-900" style={{ fontWeight: 700 }}>฿{(it.qty * it.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 bg-[#f9fafb] border-t border-gray-100 flex items-center justify-between">
                    <span className="text-gray-700" style={{ fontWeight: 700 }}>ยอดสุทธิ</span>
                    <span className="text-[17px] text-[#0d7c66]" style={{ fontWeight: 800 }}>฿{viewRc.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-2 flex-shrink-0">
                <button onClick={() => setViewRc(null)} className="vet-btn vet-btn-secondary">ปิด</button>
                <div className="flex items-center gap-2">
                  {!cancels[viewRc.id] && (
                    <button onClick={() => setCancelRc(viewRc)} className="vet-btn inline-flex items-center gap-1.5" style={{ fontWeight: 600, color: "#e11d48", border: "1px solid rgba(244,63,94,0.30)", background: "rgba(244,63,94,0.05)" }}>
                      <Ban className="w-3.5 h-3.5" /> ยกเลิกใบเสร็จ
                    </button>
                  )}
                  <button onClick={() => window.print()} className="vet-btn vet-btn-primary btn-green inline-flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" /> พิมพ์ซ้ำ</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ยืนยันยกเลิกใบเสร็จ (ระบุเหตุผล) ── */}
      <AnimatePresence>
        {cancelRc && <CancelReceiptModal rc={cancelRc} onClose={() => setCancelRc(null)} onConfirm={(reason) => doCancel(cancelRc, reason)} />}
      </AnimatePresence>
    </div>
  );
}

function CancelReceiptModal({ rc, onClose, onConfirm }: { rc: { receiptNo: string; amount: number; pet: string }; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const PRESETS = ["ออกใบเสร็จผิด", "ยอดเงินไม่ถูกต้อง", "ลูกค้าขอยกเลิก/คืนเงิน", "ซ้ำซ้อน"];
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-[440px] bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#fb7185,#e11d48)" }}><Ban className="w-4 h-4 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] text-gray-900" style={{ fontWeight: 800 }}>ยกเลิกใบเสร็จ</h3>
            <p className="text-[11.5px] text-gray-500">{rc.receiptNo} · {rc.pet} · ฿{rc.amount.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-[12px] text-gray-500">ระบุเหตุผลการยกเลิก — จะบันทึกไว้ในทะเบียนพร้อมชื่อผู้ยกเลิกและเวลา</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(pr => (
              <button key={pr} onClick={() => setReason(pr)} className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
                style={reason === pr ? { fontWeight: 700, background: "#e11d48", color: "#fff" } : { fontWeight: 600, background: "#f9fafb", color: "#6b7280", border: "1px solid #f3f4f6" }}>{pr}</button>
            ))}
          </div>
          <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="เหตุผลการยกเลิก..." className="vet-textarea" />
        </div>
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={() => onConfirm(reason.trim())} disabled={!reason.trim()}
            className="vet-btn inline-flex items-center gap-1.5 disabled:opacity-40" style={{ fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#fb7185,#e11d48)" }}>
            <Check className="w-3.5 h-3.5" /> ยืนยันยกเลิกใบเสร็จ
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function Financial() {
  const { t } = useLang();
  const location      = useLocation();
  const groomBill     = (location.state as any)?.groomingBill  as GroomingBillState  | undefined;
  const boardingBill  = (location.state as any)?.boardingBill  as BoardingBillState  | undefined;
  const [visitSearch, setVisitSearch] = useState("");
  const [visitStatus, setVisitStatus] = useState("ทั้งหมด");
  const [finMode, setFinMode] = useState<"bills" | "receipts">("bills");   // มุมมอง: ใบแจ้งหนี้ · ทะเบียนใบเสร็จ
  /* ── Grooming bill: bypass tabs ── */
  if (groomBill) {
    return (
      <div className="h-full bg-[#FEFBF8] flex flex-col">
        <GroomingBillView bill={groomBill} />
      </div>
    );
  }

  /* ── Boarding bill: bypass tabs ── */
  if (boardingBill) {
    return (
      <div className="h-full bg-[#FEFBF8] flex flex-col">
        <BoardingBillView bill={boardingBill} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "#FEFBF8" }}>

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
          {/* Title row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))",
                border: "1px solid rgba(255,255,255,0.32)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.12)",
              }}
            >
              <Wallet className="w-[22px] h-[22px] text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: 25, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                {t("financial.title")}
              </h1>
              <p className="text-white/75 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>
                {t("financial.subtitle")}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.32)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                fontSize: 11.5,
                fontWeight: 600,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              {new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          {/* View mode toggle: ใบแจ้งหนี้ · ทะเบียนใบเสร็จ */}
          <div className="flex items-center rounded-full p-1 w-fit" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(8px)" }}>
            {([["bills", "ใบแจ้งหนี้ / ใบเสร็จ", Wallet], ["receipts", "ทะเบียนใบเสร็จ", ClipboardList]] as const).map(([m, label, Ico]) => {
              const on = finMode === m;
              return (
                <button key={m} onClick={() => setFinMode(m)}
                  className="inline-flex items-center gap-1.5 px-3.5 h-[30px] rounded-full whitespace-nowrap transition-colors text-[12px]"
                  style={on ? { background: "#fff", color: "#0d7c66", fontWeight: 700 } : { color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
                  <Ico className="w-3.5 h-3.5" /> {label}
                </button>
              );
            })}
          </div>

          {/* Search + Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={visitSearch}
                onChange={e => setVisitSearch(e.target.value)}
                placeholder={finMode === "receipts" ? "ค้นหาชื่อสัตว์, เจ้าของ, เลขที่ใบเสร็จ..." : "ค้นหาชื่อสัตว์เลี้ยง, เจ้าของ, เลขที่ใบแจ้งหนี้..."}
                className="w-full sm:w-[300px] h-[38px] pl-10 pr-4 rounded-full text-[13px] text-gray-800 bg-white focus:outline-none"
                style={{ border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)" }}
              />
            </div>

            {/* Filter pill (เฉพาะมุมมองใบแจ้งหนี้) */}
            {finMode === "bills" && (
            <div className="relative bg-white rounded-full h-[38px] flex items-center px-1 max-w-full overflow-x-auto scrollbar-hide"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10)" }}
            >
              <div className="flex items-center gap-1 min-w-min">
                {statuses.map(s => {
                  const isActive = visitStatus === s;
                  return (
                    <motion.button
                      key={s}
                      onClick={() => setVisitStatus(s)}
                      whileTap={{ scale: 0.94 }}
                      className="relative inline-flex items-center px-3 h-[30px] rounded-full whitespace-nowrap flex-shrink-0"
                      style={{
                        color: isActive ? "#ffffff" : "#374151",
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 600,
                        textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="finance-filter-indicator"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)",
                            border: "1px solid #0d7c66",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{s}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col min-h-0">
        {finMode === "bills"
          ? <VisitTab search={visitSearch} setSearch={setVisitSearch} statusFilter={visitStatus} setStatusFilter={setVisitStatus} />
          : <ReceiptRegistry search={visitSearch} />}
      </div>
    </div>
  );
}