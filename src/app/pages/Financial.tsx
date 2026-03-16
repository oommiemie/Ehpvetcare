import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, ShoppingCart, CreditCard, User, Phone, Hash,
  Save, Plus, Trash2, Tag, ChevronDown, AlertCircle, Pill, Stethoscope,
  Banknote, Smartphone, QrCode, Wallet, ArrowRight, Pencil, Printer, X,
  MapPin,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";

/* ─────────────────────── Visit Invoice Data ─────────────────────── */
const petImages: Record<string, string> = {
  "INV-2026-0412": "https://images.unsplash.com/photo-1683212144556-472045913c76?w=200&q=80",
  "INV-2026-0411": "https://images.unsplash.com/photo-1710997740246-75b30937dd6d?w=200&q=80",
  "INV-2026-0410": "https://images.unsplash.com/photo-1676895282950-5c2b61dc04e7?w=200&q=80",
  "INV-2026-0409": "https://images.unsplash.com/photo-1726343461237-c4141489ffb4?w=200&q=80",
  "INV-2026-0408": "https://images.unsplash.com/photo-1685387714439-edef4bd70ef5?w=200&q=80",
};
const invoices = [
  { id: "INV-2026-0412", pet: "บัดดี้",  breed: "Golden Retriever", owner: "สมศักดิ์ ใจดี",    vet: "น.สพ. วิชัย พรมดี",       date: "28 ก.พ. 2569", status: "ยังไม่ชำระ", animal: "🐕", amount: 2460 },
  { id: "INV-2026-0411", pet: "ลูน่า",   breed: "Persian Cat",      owner: "วรรณา ศรีสุข",     vet: "สพ.ญ. อรนุช สุขสวัสดิ์", date: "28 ก.พ. 2569", status: "ชำระแล้ว",   animal: "🐈", amount: 850  },
  { id: "INV-2026-0410", pet: "แม็กซ์",  breed: "Black Labrador",   owner: "ประพันธ์ มงคล",    vet: "น.สพ. วิชัย พรมดี",       date: "27 ก.พ. 2569", status: "ชำระแล้ว",   animal: "🐕", amount: 3800 },
  { id: "INV-2026-0409", pet: "โคโค่",   breed: "Holland Lop",      owner: "อรอนงค์ พรมเสน",   vet: "สพ.ญ. มาลี รักสัตว์",    date: "27 ก.พ. 2569", status: "คืนเงินแล้ว", animal: "🐇", amount: 1200 },
  { id: "INV-2026-0408", pet: "ชาร์ลี",  breed: "Beagle",           owner: "ธีรพล วงศ์สุวรรณ", vet: "สพ.ญ. อรนุช สุขสวัสดิ์", date: "26 ก.พ. 2569", status: "ชำระแล้ว",   animal: "🐕", amount: 650  },
  { id: "INV-2026-0407", pet: "มิ้ว",    breed: "Scottish Fold",    owner: "กัญญา สุวรรณ",     vet: "สพ.ญ. มาลี รักสัตว์",    date: "25 ก.พ. 2569", status: "ยังไม่ชำระ", animal: "🐈", amount: 1750 },
  { id: "INV-2026-0406", pet: "ป๊อบ",    breed: "Pomeranian",       owner: "วิชัย มงคล",       vet: "น.สพ. วิชัย พรมดี",       date: "25 ก.พ. 2569", status: "ชำระแล้ว",   animal: "🐕", amount: 990  },
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
const medicines = [
  { id: "m1", name: "Amoxicillin 250mg",  unit: "เม็ด",  price: 15  },
  { id: "m2", name: "Metronidazole 200mg",unit: "เม็ด",  price: 12  },
  { id: "m3", name: "Prednisolone 5mg",   unit: "เม็ด",  price: 8   },
  { id: "m4", name: "Vitamin B Complex",  unit: "ขวด",  price: 120 },
  { id: "m5", name: "Ivermectin drops",   unit: "ขวด",  price: 250 },
];
const services = [
  { id: "s1", name: "อาบน้ำ-ตัดขน (เล็ก)",  unit: "ครั้ง", price: 350 },
  { id: "s2", name: "อาบน้ำ-ตัดขน (กลาง)", unit: "ครั้ง", price: 500 },
  { id: "s3", name: "ตัดเล็บ",              unit: "ครั้ง", price: 80  },
  { id: "s4", name: "เก็บเหาหู",            unit: "ครั้ง", price: 120 },
];
const quickDiscounts = [
  { label: "สมาชิก VIP 10%",        type: "pct", value: 10  },
  { label: "สมาชิก Gold 5%",        type: "pct", value: 5   },
  { label: "ส่วนลดพิเศษ ฿100",      type: "fix", value: 100 },
  { label: "โปรวัดชั้น 15%",        type: "pct", value: 15  },
];

interface CartItem { id: string; name: string; unit: string; price: number; qty: number; }

const cv = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const iv = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };

/* ═══════════════════════════════════════════════════════════════════ */
/*  Visit Payment Modal                                                */
/* ═══════════════════════════════════════════════════════════════════ */
type InvoiceType = typeof invoices[0];

function VisitPaymentModal({ inv, onClose }: { inv: InvoiceType; onClose: () => void }) {
  const { showSnackbar } = useSnackbar();
  const rawItems = visitItems[inv.id] ?? [];
  const isPaid   = inv.status !== "ยังไม่ชำระ";

  // ── Cart (pre-loaded from visit items) ──
  const [cart, setCart] = useState<CartItem[]>(() =>
    rawItems.map((it, i) => ({ id: `v${i}`, name: it.name, unit: it.unit, price: it.price, qty: it.qty }))
  );
  const [itemDiscounts, setItemDiscounts] = useState<Record<string, { value: string; type: "fix" | "pct" }>>({});
  const [discountAmt, setDiscountAmt]       = useState(0);
  const [discountReason, setDiscountReason] = useState("");
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
                    style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", boxShadow: "0 4px 12px rgba(25,165,137,0.25)" }}>
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-gray-900" style={{ fontWeight: 700 }}>ชำระเงินจาก Visit</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{inv.id} · {inv.date}</p>
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

            {/* ── Already paid ── */}
            {isPaid ? (
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
                        { label: "เจ้าของ",   value: inv.owner, color: "text-gray-700" },
                        { label: "สัตวแพทย์", value: inv.vet,   color: "text-[#0d7c66]" },
                        { label: "วันที่",    value: inv.date,  color: "text-gray-600" },
                        { label: "เลขบิล",   value: inv.id,    color: "text-gray-500" },
                      ] as { label: string; value: string; color: string }[]).map(row => (
                        <div key={row.label} className="bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-gray-400 mb-0.5" style={{ fontSize: "0.62rem" }}>{row.label}</p>
                          <p className={`text-xs ${row.color} truncate`} style={{ fontWeight: 600 }}>{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mx-4 mb-4 flex-shrink-0">
                    <div className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: "#fff8f0", border: "1.5px solid #fed7aa" }}>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-amber-700" style={{ fontSize: "0.6rem", fontWeight: 600 }}>ยอดค้างชำระ</p>
                        <p className="text-amber-600" style={{ fontSize: "0.75rem", fontWeight: 700 }}>฿2,000.00</p>
                      </div>
                    </div>
                  </div>
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
                            const isService = rawItems.find(r => r.name === item.name)?.type === "service";
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

      {receiptData && <ReceiptModal data={receiptData} onClose={() => { setReceiptData(null); onClose(); }} />}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Visit Invoice Tab                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function VisitTab() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [selectedInv, setSelectedInv]   = useState<typeof invoices[0] | null>(null);
  const filtered = invoices.filter(inv => {
    const ms = inv.pet.includes(search) || inv.owner.includes(search) || inv.id.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "ทั้งหมด" || inv.status === statusFilter;
    return ms && mf;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 bg-white vet-border-b">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสัตว์เลี้ยง, เจ้าของ, หรือเลขที่ใบแจ้งหนี้..."
              className="vet-search" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{
                  background: statusFilter === s ? "#19a589" : "white",
                  color: statusFilter === s ? "white" : "#6b7280",
                  borderColor: statusFilter === s ? "#19a589" : "#e5e7eb",
                  fontWeight: statusFilter === s ? 600 : 400,
                  boxShadow: statusFilter === s ? "0 2px 8px rgba(25,165,137,0.25)" : undefined,
                }}>{s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <motion.div className="flex-1 overflow-y-auto" variants={cv} initial="hidden" animate="visible">
        {filtered.length === 0 ? (
          <div className="py-24 text-center"><p className="text-sm text-gray-400">ไม่พบรายการที่ตรงกัน</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {filtered.map(inv => {
              const sc  = statusCfg(inv.status);
              const img = petImages[inv.id];
              const banner =
                inv.status === "ชำระแล้ว"   ? "from-[#19a589]/20 to-[#e0f5f0]" :
                inv.status === "ยังไม่ชำระ" ? "from-amber-200/60 to-amber-50"  :
                                              "from-red-200/60 to-red-50";
              return (
                <motion.button key={inv.id} variants={iv}
                  onClick={() => setSelectedInv(inv)}
                  className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#19a589]/20 hover:-translate-y-1 transition-all duration-200 group overflow-hidden flex flex-col">
                  <div className={`relative h-24 bg-gradient-to-br ${banner} flex-shrink-0`}>
                    <span className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${sc.cls}`} style={{ fontWeight: 500 }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{inv.status}
                    </span>
                    <span className="absolute top-3 left-3 text-xs text-gray-400 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>{inv.id}</span>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white ring-4 ring-white overflow-hidden shadow-md">
                      {img ? <img src={img} alt={inv.pet} className="w-full h-full object-cover" />
                           : <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">{inv.animal}</div>}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4 pt-10 pb-4 text-center">
                    <span className="text-gray-900" style={{ fontWeight: 700 }}>{inv.pet}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{inv.breed}</span>
                    <div className="w-full mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-gray-400">เจ้าของ</span>
                        <span className="text-gray-700" style={{ fontWeight: 500 }}>{inv.owner}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-gray-400">สัตวแพทย์</span>
                        <span className="text-[#0d7c66]" style={{ fontWeight: 500 }}>{inv.vet}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 group-hover:bg-[#19a589]/5 transition-colors">
                    <span className="text-xs text-gray-400">{inv.date}</span>
                    <span className="text-sm" style={{ fontWeight: 700, color: inv.status === "คืนเงินแล้ว" ? "#ef4444" : "#1f2937" }}>
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
/*  Receipt Modal                                                       */
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
    showSnackbar("success", "ชำระเงินสำเร็จแล้ว");
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

      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptModal data={receiptData} onClose={() => setReceiptData(null)} />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Financial Page                                                */
/* ═══════════════════════════════════════════════════════════════════ */
export function Financial() {
  return (
    <div className="h-full bg-[#FEFBF8] flex flex-col">

      {/* ── Page header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex-shrink-0 px-3 sm:px-6 pt-4 sm:pt-5 bg-white border-b border-gray-100">

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-gray-900" style={{ fontWeight: 700 }}>ระบบการเงิน</h1>
        </div>
      </motion.div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col min-h-0">
        <VisitTab />
      </div>
    </div>
  );
}