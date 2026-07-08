import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, ShoppingCart, Trash2, ChevronDown,
  BarChart3, Receipt, Package, DollarSign, Pill,
  Store, History, QrCode, CreditCard, Banknote, Printer, PauseCircle, X, Check, User, Star,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useClinicData } from "../contexts/ClinicDataContext";
import { useOwners, type Owner } from "../contexts/OwnersContext";
import { usePosSettings, applyRounding } from "../contexts/PosSettingsContext";
import { useLang } from "../contexts/LanguageContext";
import svgPaths from "../../imports/svg-wzp4lylxew";

/* ═══════════════════════════════════════════════════════════════════ */
/*  Types & Config                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
type Category = "ทั้งหมด" | "อาหาร" | "Grooming" | "ของเล่น" | "ยา/วิตามิน" | "อื่นๆ";

interface Product {
  id: string;                               // "sp{stockProductId}"
  name: string;
  sku: string;
  category: Exclude<Category, "ทั้งหมด">;
  price: number;
  unit: string;
  stock: number;
  useStock: boolean;
  image: string;
  emoji: string;                            // categoryEmoji fallback
  catColor: string;
  catBg: string;
  usage?: string;                           // วิธีใช้ตั้งต้นจากตัวสินค้า (read-only)
}

interface CartItem { id: string; name: string; unit: string; price: number; qty: number; category: Exclude<Category, "ทั้งหมด">; usage?: string; }

const categories: Category[] = ["ทั้งหมด", "อาหาร", "Grooming", "ของเล่น", "ยา/วิตามิน", "อื่นๆ"];

const catColors: Record<string, { color: string; bg: string }> = {
  "อาหาร":      { color: "#e8802a", bg: "#fff3e6" },
  "Grooming":   { color: "#d6608f", bg: "#fce4ec" },
  "ของเล่น":    { color: "#5c6bc0", bg: "#e8eaf6" },
  "ยา/วิตามิน": { color: "#43a047", bg: "#e8f5e9" },
  "อื่นๆ":      { color: "#78909c", bg: "#eceff1" },
};

/** แปลง StockProduct.category → retail Category */
function mapCat(cat: string): Exclude<Category, "ทั้งหมด"> {
  if (cat === "อาหาร/ขนม") return "อาหาร";
  if (cat === "Grooming")   return "Grooming";
  if (cat === "ของเล่น")    return "ของเล่น";
  if (cat === "ยา/วิตามิน") return "ยา/วิตามิน";
  return "อื่นๆ";  // อุปกรณ์, บริการ, etc.
}

const cv = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const iv = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } } };

/* QR จำลอง (deterministic ตาม payload) — ใช้แสดงหน้าจอชำระเงิน */
function FakeQR({ text, size = 168 }: { text: string; size?: number }) {
  const n = 25, cell = size / n;
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = (i: number) => { const x = Math.sin(h + i * 97.13) * 43758.5453; return x - Math.floor(x); };
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const corner = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    let on: boolean;
    if (corner) {
      const fx = x < 7 ? x : x - (n - 7), fy = y < 7 ? y : y - (n - 7);
      on = (fx === 0 || fx === 6 || fy === 0 || fy === 6) || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
    } else on = rnd(y * n + x) > 0.52;
    if (on) cells.push({ x, y });
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 12 }}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((c, i) => <rect key={i} x={c.x * cell} y={c.y * cell} width={cell} height={cell} fill="#0f172a" />)}
    </svg>
  );
}

type PayMethod = "cash" | "card" | "qr";
interface Receipt {
  no: string; customer: string; customerPhone?: string; customerType?: string; time: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number; discount: number; total: number;
  method: PayMethod; received?: number;
  pointsEarned?: number; pointsTotal?: number; pointsRedeemed?: number; pointsDiscount?: number;
  vatRate?: number; vatAmount?: number; roundAdj?: number; footer?: string;
}
const METHOD_LABEL: Record<PayMethod, string> = { cash: "เงินสด", card: "บัตรเครดิต", qr: "QR พร้อมเพย์" };

/* ประเภทลูกค้า (จากจำนวนครั้งที่มา) */
const memberTier = (o: Owner) => o.totalVisits >= 30 ? { label: "สมาชิก Gold", color: "#b45309", bg: "rgba(245,158,11,0.14)" }
  : o.totalVisits >= 10 ? { label: "สมาชิก VIP", color: "#7c3aed", bg: "rgba(124,58,237,0.12)" }
  : { label: "สมาชิก", color: "#0d7c66", bg: "rgba(25,165,137,0.12)" };
/* แต้มสะสม (จำลองจากจำนวนครั้งที่มา) */
const memberPoints = (o: Owner) => o.totalVisits * 25;

/* ═══════════════════════════════════════════════════════════════════ */
/*  POS Tab — ดึงสินค้าจาก ClinicDataContext                          */
/* ═══════════════════════════════════════════════════════════════════ */
function POSTab() {
  const { showSnackbar } = useSnackbar();
  const { stockProducts, setStockProducts } = useClinicData();
  const { owners } = useOwners();
  const { settings } = usePosSettings();

  const [search, setSearch]             = useState("");
  const [selectedCat, setSelectedCat]   = useState<Category>("ทั้งหมด");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedMember, setSelectedMember] = useState<Owner | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [discountType, setDiscountType]   = useState<"fix" | "pct">("fix");
  const [pointsRedeem, setPointsRedeem]   = useState("");   // แต้มที่ใช้แลกส่วนลด
  // พักบิล
  interface HeldBill { id: number; customer: string; items: CartItem[]; discountInput: string; discountType: "fix" | "pct"; time: string; total: number; }
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [showHeld, setShowHeld]   = useState(false);
  // ชำระเงิน / ใบเสร็จ
  const [payOpen, setPayOpen]       = useState(false);
  const [payMethod, setPayMethod]   = useState<PayMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [receipt, setReceipt]       = useState<Receipt | null>(null);
  const [rcSeq, setRcSeq]           = useState(1);

  // ── แปลง StockProduct → Product (memoized) ──
  const allProducts = useMemo<Product[]>(() =>
    stockProducts
      .filter(p => p.active)
      .map(p => {
        const cat = mapCat(p.category);
        const cc  = catColors[cat] ?? catColors["อื่นๆ"];
        return {
          id:       `sp${p.id}`,
          name:     p.name,
          sku:      p.code,
          category: cat,
          price:    p.sellPrice,
          unit:     p.unit,
          stock:    p.stock,
          useStock: p.type === "stock",
          image:    p.image,
          emoji:    p.categoryEmoji,
          catColor: cc.color,
          catBg:    cc.bg,
          usage:    p.usage,
        };
      }),
    [stockProducts]
  );

  const products = allProducts.filter(p => {
    const matchCat    = selectedCat === "ทั้งหมด" || p.category === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Cart helpers ──
  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, unit: p.unit, price: p.price, qty: 1, category: p.category, usage: p.usage }];
    });
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const changeQty = (id: string, delta: number) => setCart(prev =>
    prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
  );
  const clearCart = () => { setCart([]); setDiscountInput(""); setPointsRedeem(""); };

  // ── Totals ──
  const subtotal    = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountVal = parseFloat(discountInput) || 0;
  const discountAmt = discountType === "pct"
    ? Math.round(subtotal * discountVal / 100)
    : Math.min(discountVal, subtotal);
  // แลกแต้มเป็นส่วนลด (ตามอัตราจากตั้งค่า)
  const pts = settings.points;
  const pointsOn = pts.enabled && !!selectedMember;
  const availablePoints = selectedMember ? memberPoints(selectedMember) : 0;
  const afterDiscount   = Math.max(0, subtotal - discountAmt);
  const maxRedeemPoints = pointsOn ? Math.min(availablePoints, Math.floor(afterDiscount / pts.redeemBaht) * pts.redeemPoints) : 0;
  const pointsUsed      = pointsOn ? Math.min(Math.max(0, Math.floor(parseFloat(pointsRedeem) || 0)), maxRedeemPoints) : 0;
  const pointsDiscount  = Math.floor(pointsUsed / pts.redeemPoints) * pts.redeemBaht;
  const netBeforeVat    = Math.max(0, afterDiscount - pointsDiscount);
  // VAT (แยกนอกราคา ตามตั้งค่า)
  const vatAmount   = settings.vat.enabled ? Math.round(netBeforeVat * settings.vat.rate) / 100 : 0;
  const grandRaw    = netBeforeVat + vatAmount;
  // ปัดเศษ
  const total       = applyRounding(grandRaw, settings.rounding);
  const roundAdj    = total - grandRaw;
  const bahtFmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: (settings.vat.enabled || settings.rounding.enabled) && !Number.isInteger(n) ? 2 : 0, maximumFractionDigits: 2 });

  const custLabel = customerName.trim() || "ลูกค้าทั่วไป";
  const memberMatches = customerName.trim()
    ? owners.filter(o => {
        const s = customerName.trim().toLowerCase();
        return o.name.toLowerCase().includes(s) || (o.nickname ?? "").toLowerCase().includes(s) || (o.phone ?? "").includes(customerName.trim());
      }).slice(0, 6)
    : [];

  // ── พักบิล ──
  const holdBill = () => {
    if (!cart.length) return;
    const now = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    setHeldBills(prev => [...prev, { id: Date.now(), customer: custLabel, items: cart, discountInput, discountType, time: now, total }]);
    showSnackbar("info", `พักบิลของ ${custLabel} แล้ว`);
    clearCart(); setCustomerName(""); setSelectedMember(null);
  };
  const resumeBill = (b: HeldBill) => {
    setCart(b.items); setCustomerName(b.customer === "ลูกค้าทั่วไป" ? "" : b.customer);
    setDiscountInput(b.discountInput); setDiscountType(b.discountType);
    setHeldBills(prev => prev.filter(x => x.id !== b.id));
    setShowHeld(false);
    showSnackbar("success", "เรียกบิลที่พักไว้กลับมาแล้ว");
  };

  // ── เปิดหน้าชำระเงิน ──
  const openPay = () => { if (!cart.length) return; setPayMethod("cash"); setCashReceived(""); setPayOpen(true); };

  // ── ยืนยันชำระ: ลดสต็อก + ออกใบเสร็จ ──
  const confirmPay = () => {
    setStockProducts(prev => {
      const copy = [...prev];
      cart.forEach(ci => {
        const rawId = parseInt(ci.id.replace("sp", ""), 10);
        const idx   = copy.findIndex(p => p.id === rawId && p.type === "stock");
        if (idx !== -1) copy[idx] = { ...copy[idx], stock: Math.max(0, copy[idx].stock - ci.qty) };
      });
      return copy;
    });
    const received = payMethod === "cash" ? (parseFloat(cashReceived) || total) : undefined;
    const earned = pointsOn ? Math.floor(total / pts.earnSpend) * pts.earnPoints : 0;
    setReceipt({
      no: `RC-2569-${String(rcSeq).padStart(4, "0")}`,
      customer: custLabel,
      customerPhone: selectedMember?.phone,
      customerType: selectedMember ? memberTier(selectedMember).label : "ลูกค้าทั่วไป",
      time: new Date().toLocaleString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }),
      items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
      subtotal, discount: discountAmt, total, method: payMethod, received,
      pointsRedeemed: pointsUsed > 0 ? pointsUsed : undefined,
      pointsDiscount: pointsDiscount > 0 ? pointsDiscount : undefined,
      pointsEarned: earned || undefined,
      pointsTotal: pointsOn ? availablePoints - pointsUsed + earned : undefined,
      vatRate: settings.vat.enabled ? settings.vat.rate : undefined,
      vatAmount: settings.vat.enabled ? vatAmount : undefined,
      roundAdj: settings.rounding.enabled && roundAdj !== 0 ? roundAdj : undefined,
      footer: settings.receiptPrinter.footer,
    });
    setRcSeq(s => s + 1);
    setPayOpen(false);
    showSnackbar("success", `ชำระเงิน ฿${total.toLocaleString()} สำเร็จ`);
    clearCart(); setCustomerName(""); setSelectedMember(null);
  };

  const change = (parseFloat(cashReceived) || 0) - total;

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-3 p-3 sm:p-4 pt-3">

      {/* ═══ LEFT: Product Grid ═══ */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-white rounded-3xl border border-gray-100"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="p-3 sm:p-5 space-y-4">

          {/* Search + Categories */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-56 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาสินค้า, บาร์โค้ด..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 focus:border-[#19a589]/50 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCat(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-all ${
                    selectedCat === cat
                      ? "bg-[#e8802a] text-white shadow-md"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-[#e8802a]/40 hover:text-[#e8802a]"
                  }`}
                  style={{ fontWeight: selectedCat === cat ? 700 : 400 }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <motion.div variants={cv} initial="hidden" animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map(p => {
              const cc = catColors[p.category] || catColors["อื่นๆ"];
              const outOfStock = p.useStock && p.stock === 0;
              const lowStock   = p.useStock && p.stock > 0 && p.stock <= 5;
              return (
                <motion.div
                  key={p.id}
                  variants={iv}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* ── Top section: square thumbnail + meta side-by-side ── */}
                  <div className="flex gap-3 p-3 pb-2">
                    {/* Square thumbnail */}
                    <div
                      className="relative w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-xl overflow-hidden flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${cc.bg} 0%, #FEFBF8 100%)` }}
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${outOfStock ? "grayscale opacity-60" : ""}`}
                          draggable={false}
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const fb = img.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full items-center justify-center" style={{ display: p.image ? "none" : "flex" }}>
                        <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{p.emoji}</span>
                      </div>
                      {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[9.5px] text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 700, background: "#dc2626" }}>หมด</span>
                        </div>
                      )}
                    </div>

                    {/* Right side: meta + price */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Category + stock chips inline */}
                      <div className="flex items-center gap-1 mb-1">
                        <span
                          className="text-[9.5px] px-1.5 py-0.5 rounded-full truncate"
                          style={{ background: cc.bg, color: cc.color, fontWeight: 700, letterSpacing: "0.2px" }}
                        >
                          {p.category}
                        </span>
                        {p.useStock ? (
                          <span
                            className={`text-[9.5px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0 ${
                              outOfStock ? "bg-red-50 text-red-600" : lowStock ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                            }`}
                            style={{ fontWeight: 700 }}
                          >
                            <span className={`w-1 h-1 rounded-full ${outOfStock ? "bg-red-500" : lowStock ? "bg-amber-500" : "bg-emerald-500"}`} />
                            {p.stock}
                          </span>
                        ) : (
                          <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontWeight: 600 }}>∞</span>
                        )}
                      </div>

                      {/* Product name */}
                      <p className="text-[13px] text-gray-900 leading-snug line-clamp-2" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>
                        {p.name}
                      </p>

                      {/* SKU + price row */}
                      <div className="flex items-end justify-between gap-2 mt-auto pt-1">
                        <span className="text-[9.5px] text-gray-400 font-mono truncate">{p.sku}</span>
                        <p className="text-right flex-shrink-0" style={{ lineHeight: 1.1 }}>
                          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: cc.color }}>
                            ฿{p.price.toLocaleString()}
                          </span>
                          <span className="block text-[9.5px] text-gray-400">/{p.unit}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Usage strip — subtle gray, single chip ── */}
                  {p.usage && (
                    <div
                      className="mx-3 px-2.5 py-1.5 rounded-lg text-[10.5px] leading-snug"
                      style={{ background: "#f9fafb", border: "1px dashed #e5e7eb" }}
                    >
                      <p className="flex items-start gap-1" style={{ color: "#6b7280", fontWeight: 500 }}>
                        <Pill className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" style={{ color: "#9ca3af" }} />
                        <span className="line-clamp-2">{p.usage}</span>
                      </p>
                    </div>
                  )}

                  {/* ── Footer: Add button (pinned to bottom of card) ── */}
                  <div className="p-3 pt-2 mt-auto">
                    <button
                      onClick={() => addToCart(p)}
                      disabled={outOfStock}
                      className="w-full inline-flex items-center justify-center gap-1.5 h-[34px] rounded-full text-white text-[12.5px] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{
                        fontWeight: 700,
                        background: outOfStock
                          ? "linear-gradient(135deg,#94a3b8,#64748b)"
                          : "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                        border: outOfStock ? "1px solid #94a3b8" : "1px solid rgba(253,186,116,0.85)",
                        boxShadow: outOfStock
                          ? "none"
                          : "inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 14px rgba(234,88,12,0.30)",
                        textShadow: outOfStock ? "none" : "0 1px 2px rgba(0,0,0,0.15)",
                      }}
                    >
                      {outOfStock ? "หมดสต็อก" : <><Plus className="w-3.5 h-3.5" /> เพิ่มลงตะกร้า</>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">ไม่พบสินค้าที่ค้นหา</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ═══ RIGHT: Cart Sidebar ═══ */}
      <div className="w-full lg:w-[320px] xl:w-[340px] flex-shrink-0 bg-white rounded-3xl border border-gray-100 flex flex-col min-h-0 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#e8802a]" />
            <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ตะกร้าสินค้า</span>
            {cart.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8802a] text-white" style={{ fontWeight: 700 }}>
                {cart.reduce((s, c) => s + c.qty, 0)}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart}
              className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Customer name + held bills */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>ชื่อลูกค้า</label>
            {heldBills.length > 0 && (
              <div className="relative">
                <button onClick={() => setShowHeld(v => !v)}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" style={{ fontWeight: 700 }}>
                  <PauseCircle className="w-3 h-3" /> บิลพัก {heldBills.length}
                </button>
                {showHeld && (
                  <div className="absolute right-0 top-6 z-20 w-56 bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.15)" }}>
                    {heldBills.map(b => (
                      <button key={b.id} onClick={() => resumeBill(b)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-50 text-left transition-colors border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{b.customer}</p>
                          <p className="text-[9.5px] text-gray-400">{b.items.length} รายการ · {b.time}</p>
                        </div>
                        <span className="text-[11px] text-[#19a589] flex-shrink-0" style={{ fontWeight: 700 }}>฿{b.total.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedMember ? (
            /* สมาชิกที่เลือก — โชว์ ชื่อ-นามสกุล เบอร์ ประเภท */
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl border border-[#19a589]/30 bg-[#19a589]/5">
              <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-white flex items-center justify-center border border-gray-100">
                {selectedMember.photo ? <img src={selectedMember.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[12px] text-gray-800 truncate" style={{ fontWeight: 700 }}>{selectedMember.name}</span>
                  {(() => { const t = memberTier(selectedMember); return <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: t.bg, color: t.color, fontWeight: 700 }}>{t.label}</span>; })()}
                  <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(245,158,11,0.14)", color: "#b45309", fontWeight: 700 }}>
                    <Star className="w-2.5 h-2.5" fill="#f59e0b" strokeWidth={0} /> {memberPoints(selectedMember).toLocaleString()} แต้ม
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">📞 {selectedMember.phone} · มาแล้ว {selectedMember.totalVisits} ครั้ง</p>
              </div>
              <button onClick={() => { setSelectedMember(null); setCustomerName(""); }} className="text-gray-300 hover:text-red-400 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input value={customerName}
                onChange={e => { setCustomerName(e.target.value); setShowMembers(true); }}
                onFocus={() => setShowMembers(true)}
                onBlur={() => setTimeout(() => setShowMembers(false), 150)}
                placeholder="ค้นหาสมาชิก (ชื่อ/เบอร์) หรือพิมพ์ชื่อลูกค้า"
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 text-gray-700"
                style={{ fontWeight: 500 }} />
              {showMembers && customerName.trim() && memberMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-11 z-30 bg-white rounded-xl border border-gray-100 overflow-hidden max-h-56 overflow-y-auto" style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.15)" }}>
                  {memberMatches.map(o => {
                    const t = memberTier(o);
                    return (
                      <button key={o.id} onMouseDown={() => { setSelectedMember(o); setCustomerName(o.name); setShowMembers(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#19a589]/5 text-left transition-colors border-b border-gray-50 last:border-0">
                        <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                          {o.photo ? <img src={o.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11.5px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{o.name}</span>
                            <span className="text-[8.5px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: t.bg, color: t.color, fontWeight: 700 }}>{t.label}</span>
                          </div>
                          <p className="text-[9.5px] text-gray-400">📞 {o.phone} · ⭐ {memberPoints(o).toLocaleString()} แต้ม</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="p-3">
              {heldBills.length > 0 && (
                <div className="mb-2">
                  <p className="flex items-center gap-1.5 text-[11px] text-amber-600 mb-2 px-1" style={{ fontWeight: 700 }}>
                    <PauseCircle className="w-3.5 h-3.5" /> บิลที่พักไว้ ({heldBills.length}) — แตะเพื่อทำต่อ
                  </p>
                  <div className="space-y-1.5">
                    {heldBills.map(b => (
                      <button key={b.id} onClick={() => resumeBill(b)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-left transition-colors active:scale-[0.99]">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <PauseCircle className="w-4.5 h-4.5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 700 }}>{b.customer}</p>
                          <p className="text-[10px] text-gray-400">{b.items.length} รายการ · พักเมื่อ {b.time} น.</p>
                        </div>
                        <span className="text-[13px] text-[#19a589] flex-shrink-0" style={{ fontWeight: 800 }}>฿{b.total.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                  <div className="h-px bg-gray-100 my-3" />
                </div>
              )}
              <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-xs">ยังไม่มีสินค้าในตะกร้า</p>
                <p className="text-[10px] mt-0.5">คลิกสินค้า เพื่อเพิ่มรายการ</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {cart.map((item, i) => {
                const prod = allProducts.find(p => p.id === item.id);
                const cc   = prod ? (catColors[prod.category] || catColors["อื่นๆ"]) : catColors["อื่นๆ"];
                const isDrug = item.category === "ยา/วิตามิน";
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Mini thumbnail */}
                      <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2 flex items-center justify-center"
                        style={{ borderColor: cc.color + "40", background: cc.bg }}>
                        {prod?.image ? (
                          <img src={prod.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ fontSize: "1.1rem" }}>{prod?.emoji ?? "📦"}</span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                        <p className="text-[10px] text-gray-400">฿{item.price.toLocaleString()}/{item.unit}</p>
                      </div>
                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        <button onClick={() => changeQty(item.id, -1)}
                          className="w-5 h-5 rounded-full bg-gray-100 hover:bg-[#19a589]/10 flex items-center justify-center text-gray-500 text-xs transition-colors">−</button>
                        <span className="w-5 text-center text-xs text-gray-800" style={{ fontWeight: 700 }}>{item.qty}</span>
                        <button onClick={() => changeQty(item.id, 1)}
                          className="w-5 h-5 rounded-full bg-gray-100 hover:bg-[#19a589]/10 flex items-center justify-center text-gray-500 text-xs transition-colors">+</button>
                      </div>
                      {/* Total + delete */}
                      <div className="text-right flex-shrink-0 w-16">
                        <p className="text-xs text-gray-800" style={{ fontWeight: 700 }}>฿{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Usage — read-only (จากตัวสินค้า) */}
                    {item.usage && (
                      <div className="mt-2 ml-12 rounded-xl px-2.5 py-1.5"
                        style={{
                          background: "#f9fafb",
                          border: "1px dashed #e5e7eb",
                        }}>
                        <p className="flex items-center gap-1 text-[10px] mb-0.5"
                          style={{ fontWeight: 700, color: "#6b7280", letterSpacing: "0.2px" }}>
                          <Pill className="w-2.5 h-2.5" /> {isDrug ? "วิธีใช้ยา" : "วิธีใช้"}
                        </p>
                        <p className="text-[11px] text-gray-500 leading-snug" style={{ fontWeight: 500 }}>{item.usage}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart footer / summary */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50/60">
            {/* Discount row */}
            <div className="px-4 py-3 border-b border-gray-100">
              <label className="text-[10px] text-gray-400 mb-1.5 block" style={{ fontWeight: 500 }}>รหัสส่วนลด / โปรโมชั่น</label>
              <div className="flex gap-1.5">
                <input value={discountInput} onChange={e => setDiscountInput(e.target.value)}
                  placeholder="0" type="number"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 min-w-0" />
                <div className="relative">
                  <select value={discountType} onChange={e => setDiscountType(e.target.value as "fix" | "pct")}
                    className="h-full px-2 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none appearance-none cursor-pointer text-gray-600"
                    style={{ fontWeight: 500 }}>
                    <option value="fix">บาท</option>
                    <option value="pct">%</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* แลกแต้มเป็นส่วนลด (เฉพาะสมาชิก) */}
              {pointsOn && availablePoints > 0 && (
                <div className="mt-2.5 rounded-xl p-2.5" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.20)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1 text-[10.5px]" style={{ color: "#b45309", fontWeight: 700 }}>
                      <Star className="w-3 h-3" fill="#f59e0b" strokeWidth={0} /> แลกแต้มเป็นส่วนลด
                    </span>
                    <span className="text-[9.5px] text-amber-600/80">มี {availablePoints.toLocaleString()} แต้ม · {pts.redeemPoints} แต้ม = ฿{pts.redeemBaht}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <input value={pointsRedeem} onChange={e => setPointsRedeem(e.target.value)} type="number" min={0}
                      placeholder="แต้มที่ใช้"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300/40 min-w-0" />
                    <button onClick={() => setPointsRedeem(String(maxRedeemPoints))}
                      className="px-3 py-1.5 text-[11px] rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors whitespace-nowrap" style={{ fontWeight: 700 }}>
                      ใช้สูงสุด
                    </button>
                  </div>
                  {pointsUsed > 0 && (
                    <p className="text-[10px] text-amber-700 mt-1.5 text-right" style={{ fontWeight: 600 }}>ใช้ {pointsUsed.toLocaleString()} แต้ม = ส่วนลด ฿{pointsDiscount.toLocaleString()}</p>
                  )}
                </div>
              )}
              {pts.enabled && !selectedMember && (
                <p className="flex items-center gap-1 text-[10px] text-amber-600/80 mt-2">
                  <Star className="w-3 h-3" fill="#f59e0b" strokeWidth={0} /> เลือกสมาชิก (ช่องชื่อลูกค้าด้านบน) เพื่อแลกแต้มเป็นส่วนลด
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>ราคารวม</span>
                <span style={{ fontWeight: 500 }}>฿{subtotal.toLocaleString()}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-xs text-red-400">
                  <span>ส่วนลด</span>
                  <span style={{ fontWeight: 500 }}>−฿{discountAmt.toLocaleString()}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-xs text-amber-600">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" fill="#f59e0b" strokeWidth={0} /> แลก {pointsUsed.toLocaleString()} แต้ม</span>
                  <span style={{ fontWeight: 500 }}>−฿{pointsDiscount.toLocaleString()}</span>
                </div>
              )}
              {settings.vat.enabled ? (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>VAT {settings.vat.rate}%</span>
                  <span style={{ fontWeight: 500 }}>+฿{bahtFmt(vatAmount)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>VAT</span>
                  <span>ไม่คิด</span>
                </div>
              )}
              {settings.rounding.enabled && roundAdj !== 0 && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>ปัดเศษ</span>
                  <span style={{ fontWeight: 500 }}>{roundAdj > 0 ? "+" : "−"}฿{bahtFmt(Math.abs(roundAdj))}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ยอดชำระ</span>
                <span className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.15rem" }}>
                  ฿{bahtFmt(total)}
                </span>
              </div>
            </div>

            {/* Actions: พักบิล + ชำระเงิน */}
            <div className="px-4 pb-4 flex gap-2">
              <button onClick={holdBill}
                className="flex items-center justify-center gap-1.5 text-amber-600 text-sm py-2.5 px-4 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all active:scale-[0.98] flex-shrink-0"
                style={{ fontWeight: 700 }}>
                <PauseCircle className="w-4 h-4" /> พักบิล
              </button>
              <button onClick={openPay}
                className="flex-1 flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-full transition-all active:scale-[0.98]"
                style={{ fontWeight: 700, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 16px rgba(73,138,79,0.35)" }}>
                <DollarSign className="w-4 h-4" /> ชำระเงิน
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Payment modal ═══ */}
      <AnimatePresence>
        {payOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={() => setPayOpen(false)} />
            <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
              className="relative w-full max-w-[400px] bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[15px] text-gray-900" style={{ fontWeight: 800 }}>ชำระเงิน</p>
                  <p className="text-[11px] text-gray-400">{custLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">ยอดชำระ</p>
                  <p className="text-[20px] text-[#0d7c66]" style={{ fontWeight: 800 }}>฿{total.toLocaleString()}</p>
                </div>
              </div>
              {/* Method tabs */}
              <div className="px-5 pt-4 grid grid-cols-3 gap-2">
                {([["cash", Banknote, "เงินสด"], ["card", CreditCard, "บัตร"], ["qr", QrCode, "QR"]] as const).map(([m, Ico, label]) => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-2xl border transition-all"
                    style={payMethod === m
                      ? { borderColor: "#19a589", background: "rgba(25,165,137,0.08)", color: "#0d7c66" }
                      : { borderColor: "#eef0f2", color: "#9ca3af" }}>
                    <Ico className="w-5 h-5" />
                    <span className="text-[11px]" style={{ fontWeight: 700 }}>{label}</span>
                  </button>
                ))}
              </div>
              {/* Method body */}
              <div className="px-5 py-4 min-h-[150px]">
                {payMethod === "cash" && (
                  <div className="space-y-2.5">
                    <label className="text-[11px] text-gray-400" style={{ fontWeight: 600 }}>รับเงินมา (บาท)</label>
                    <input value={cashReceived} onChange={e => setCashReceived(e.target.value)} type="number" autoFocus
                      placeholder={String(total)} className="w-full px-3 py-2.5 text-[15px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20" style={{ fontWeight: 700 }} />
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set([total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, 1000].filter(v => v >= total))].slice(0, 4).map(v => (
                        <button key={v} onClick={() => setCashReceived(String(v))}
                          className="px-3 py-1 text-[12px] rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" style={{ fontWeight: 600 }}>฿{v.toLocaleString()}</button>
                      ))}
                    </div>
                    {cashReceived && change >= 0 && (
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-[12px] text-gray-500">เงินทอน</span>
                        <span className="text-[16px] text-[#0d7c66]" style={{ fontWeight: 800 }}>฿{change.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
                {payMethod === "card" && (
                  <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
                    <CreditCard className="w-10 h-10 text-[#0284c7]" />
                    <p className="text-[13px] text-gray-700" style={{ fontWeight: 600 }}>สอด/แตะบัตรที่เครื่อง EDC</p>
                    <p className="text-[11px] text-gray-400">รอผลอนุมัติจากเครื่องรูดบัตร แล้วกดยืนยัน</p>
                  </div>
                )}
                {payMethod === "qr" && (
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <div className="p-2 rounded-2xl border border-gray-100" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                      <FakeQR text={`PP|EHPVETCARE|${total}|${rcSeq}`} size={150} />
                    </div>
                    <p className="text-[12px] text-gray-700" style={{ fontWeight: 700 }}>สแกนจ่าย ฿{total.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">พร้อมเพย์ · EHP VetCare</p>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="px-5 pb-5 flex gap-2">
                <button onClick={() => setPayOpen(false)} className="px-4 py-2.5 rounded-full text-[13px] text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>ยกเลิก</button>
                <button onClick={confirmPay} disabled={payMethod === "cash" && !!cashReceived && change < 0}
                  className="flex-1 flex items-center justify-center gap-2 text-white text-[14px] py-2.5 rounded-full transition-all active:scale-[0.98] disabled:opacity-40"
                  style={{ fontWeight: 700, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 16px rgba(73,138,79,0.35)" }}>
                  <Check className="w-4 h-4" /> ยืนยันชำระ · {METHOD_LABEL[payMethod]}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Receipt modal (พิมพ์ได้) ═══ */}
      <AnimatePresence>
        {receipt && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={() => setReceipt(null)} />
            <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
              className="relative w-full max-w-[340px] bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
              <div className="rc-print px-5 py-4">
                <div className="text-center pb-3 border-b border-dashed border-gray-300">
                  <p className="text-[15px] text-gray-900" style={{ fontWeight: 800 }}>EHP VetCare</p>
                  <p className="text-[10px] text-gray-400">คลินิกสัตวแพทย์ · โทร 02-123-4567</p>
                </div>
                <div className="py-2.5 text-[11px] text-gray-500 space-y-0.5 border-b border-dashed border-gray-300">
                  <div className="flex justify-between"><span>ใบเสร็จ</span><span style={{ fontWeight: 700, color: "#111" }}>{receipt.no}</span></div>
                  <div className="flex justify-between"><span>วันที่</span><span>{receipt.time}</span></div>
                  <div className="flex justify-between"><span>ลูกค้า</span><span>{receipt.customer}{receipt.customerType ? ` · ${receipt.customerType}` : ""}</span></div>
                  {receipt.customerPhone && <div className="flex justify-between"><span>เบอร์</span><span>{receipt.customerPhone}</span></div>}
                </div>
                <div className="py-2.5 border-b border-dashed border-gray-300">
                  {receipt.items.map((it, i) => (
                    <div key={i} className="flex items-baseline gap-2 py-0.5 text-[12px]">
                      <span className="text-gray-700 flex-1">{it.name} <span className="text-gray-400">×{it.qty}</span></span>
                      <span className="text-gray-800 tabular-nums" style={{ fontWeight: 600 }}>{(it.qty * it.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="py-2.5 text-[12px] space-y-1 border-b border-dashed border-gray-300">
                  <div className="flex justify-between text-gray-500"><span>ราคารวม</span><span>฿{receipt.subtotal.toLocaleString()}</span></div>
                  {receipt.discount > 0 && <div className="flex justify-between text-red-400"><span>ส่วนลด</span><span>−฿{receipt.discount.toLocaleString()}</span></div>}
                  {receipt.pointsDiscount && <div className="flex justify-between text-amber-600"><span>แลก {receipt.pointsRedeemed?.toLocaleString()} แต้ม</span><span>−฿{receipt.pointsDiscount.toLocaleString()}</span></div>}
                  {receipt.vatAmount != null && <div className="flex justify-between text-gray-500"><span>VAT {receipt.vatRate}%</span><span>+฿{receipt.vatAmount.toLocaleString(undefined,{minimumFractionDigits:2})}</span></div>}
                  {receipt.roundAdj != null && <div className="flex justify-between text-gray-400"><span>ปัดเศษ</span><span>{receipt.roundAdj > 0 ? "+" : "−"}฿{Math.abs(receipt.roundAdj).toLocaleString(undefined,{minimumFractionDigits:2})}</span></div>}
                  <div className="flex justify-between items-baseline pt-0.5"><span className="text-gray-800" style={{ fontWeight: 800 }}>รวมสุทธิ</span><span className="text-[16px] text-[#0d7c66]" style={{ fontWeight: 800 }}>฿{receipt.total.toLocaleString(undefined,{maximumFractionDigits:2})}</span></div>
                </div>
                <div className="py-2.5 text-[11px] text-gray-500 space-y-0.5">
                  <div className="flex justify-between"><span>ชำระโดย</span><span style={{ fontWeight: 700, color: "#111" }}>{METHOD_LABEL[receipt.method]}</span></div>
                  {receipt.method === "cash" && receipt.received != null && (
                    <>
                      <div className="flex justify-between"><span>รับเงิน</span><span>฿{receipt.received.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>เงินทอน</span><span>฿{Math.max(0, receipt.received - receipt.total).toLocaleString()}</span></div>
                    </>
                  )}
                </div>
                {receipt.pointsEarned != null && (
                  <div className="mt-1 rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: "rgba(245,158,11,0.10)" }}>
                    <span className="text-[11px] flex items-center gap-1" style={{ color: "#b45309", fontWeight: 700 }}><Star className="w-3 h-3" fill="#f59e0b" strokeWidth={0} /> ได้รับแต้มนี้</span>
                    <span className="text-[11px]" style={{ color: "#b45309", fontWeight: 700 }}>+{receipt.pointsEarned} · รวม {receipt.pointsTotal?.toLocaleString()} แต้ม</span>
                  </div>
                )}
                <p className="text-center text-[10px] text-gray-400 pt-2">{receipt.footer || "ขอบคุณที่ใช้บริการค่ะ 🐾"}</p>
              </div>
              <div className="px-5 pb-5 pt-1 flex gap-2 rc-noprint">
                <button onClick={() => setReceipt(null)} className="px-4 py-2.5 rounded-full text-[13px] text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>ปิด</button>
                <button onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 text-white text-[14px] py-2.5 rounded-full transition-all active:scale-[0.98]"
                  style={{ fontWeight: 700, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 16px rgba(13,124,102,0.35)" }}>
                  <Printer className="w-4 h-4" /> พิมพ์ใบเสร็จ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* พิมพ์เฉพาะใบเสร็จ */}
      <style>{`@media print { body * { visibility: hidden !important; } .rc-print, .rc-print * { visibility: visible !important; } .rc-print { position: fixed; inset: 0; margin: 0 auto; width: 300px; } .rc-noprint { display: none !important; } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Stock Tab — ดึงข้อมูลจาก ClinicDataContext (live)                  */
/* ═══════════════════════════════════════════════════════════════════ */
function StockTab() {
  const { stockProducts } = useClinicData();
  const stockItems = stockProducts.filter(p => p.type === "stock" && p.active);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5">
      <motion.div variants={cv} initial="hidden" animate="visible"
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
          <span className="flex-1 min-w-0 text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.04em" }}>สินค้า</span>
          <span className="w-20 text-center text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>SKU</span>
          <span className="w-20 text-center text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>หมวด</span>
          <span className="w-16 text-center text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>ราคา</span>
          <span className="w-20 text-center text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>คงเหลือ</span>
          <span className="w-20 text-center text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>สถานะ</span>
        </div>
        {stockItems.map((p) => {
          const cat = mapCat(p.category);
          const cc  = catColors[cat] || catColors["อื่นๆ"];
          const low = p.stock < p.minStock;
          const out = p.stock === 0;
          return (
            <motion.div key={p.id} variants={iv}
              className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border flex items-center justify-center"
                  style={{ borderColor: cc.color + "30", background: cc.bg }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ fontSize: "1rem" }}>{p.categoryEmoji}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{p.name}</p>
                  <p className="text-[10px] text-gray-400">฿{p.sellPrice.toLocaleString()}/{p.unit}</p>
                </div>
              </div>
              <span className="w-20 text-center text-[11px] text-gray-500 font-mono" style={{ fontWeight: 500 }}>{p.code}</span>
              <span className="w-20 text-center">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: cc.color + "15", color: cc.color, fontWeight: 600 }}>
                  {p.category}
                </span>
              </span>
              <span className="w-16 text-center text-xs text-gray-700" style={{ fontWeight: 600 }}>฿{p.sellPrice.toLocaleString()}</span>
              <span className="w-20 text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${out ? "bg-red-50 text-red-500" : low ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}
                  style={{ fontWeight: 700 }}>
                  {p.stock}
                </span>
              </span>
              <span className="w-20 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${out ? "bg-red-50 text-red-500" : low ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}
                  style={{ fontWeight: 600 }}>
                  {out ? "หมด" : low ? "ใกล้หมด" : "ปกติ"}
                </span>
              </span>
            </motion.div>
          );
        })}
        {stockItems.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">ไม่มีสินค้าในคลัง</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Sales History Tab                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function HistoryTab() {
  const mockSales = [
    { id: "S-2569-0081", date: "16 มี.ค. 2569 10:24", customer: "คุณสมศักดิ์",  items: 3, total: 1290, status: "ชำระแล้ว" },
    { id: "S-2569-0080", date: "16 มี.ค. 2569 09:15", customer: "ลูกค้าทั่วไป", items: 1, total: 350,  status: "ชำระแล้ว" },
    { id: "S-2569-0079", date: "15 มี.ค. 2569 16:40", customer: "คุณวรรณา",     items: 5, total: 2640, status: "ชำระแล้ว" },
    { id: "S-2569-0078", date: "15 มี.ค. 2569 14:20", customer: "ลูกค้าทั่วไป", items: 2, total: 890,  status: "ยกเลิก" },
    { id: "S-2569-0077", date: "15 มี.ค. 2569 11:00", customer: "คุณประพันธ์",  items: 4, total: 1580, status: "ชำระแล้ว" },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5">
      <motion.div variants={cv} initial="hidden" animate="visible"
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
          <span className="w-28 text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.04em" }}>เลขที่</span>
          <span className="flex-1 text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>วันที่</span>
          <span className="w-28 text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>ลูกค้า</span>
          <span className="w-16 text-center text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>รายการ</span>
          <span className="w-20 text-right text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>ยอดรวม</span>
          <span className="w-20 text-center text-gray-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>สถานะ</span>
        </div>
        {mockSales.map(s => (
          <motion.div key={s.id} variants={iv}
            className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/40 transition-colors cursor-pointer">
            <span className="w-28 text-xs text-[#19a589]" style={{ fontWeight: 600 }}>{s.id}</span>
            <span className="flex-1 text-xs text-gray-500">{s.date}</span>
            <span className="w-28 text-xs text-gray-700" style={{ fontWeight: 500 }}>{s.customer}</span>
            <span className="w-16 text-center text-xs text-gray-500">{s.items}</span>
            <span className="w-20 text-right text-xs text-gray-800" style={{ fontWeight: 700 }}>฿{s.total.toLocaleString()}</span>
            <span className="w-20 text-center">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status === "ชำระแล้ว" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                style={{ fontWeight: 600 }}>
                {s.status}
              </span>
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Retail Page                                                   */
/* ═══════════════════════════════════════════════════════════════════ */
export function Retail() {
  const { t } = useLang();
  const { lowStockCount, outOfStockCount } = useClinicData();
  const [tab, setTab] = useState<"pos" | "stock" | "history">("pos");

  const tabsCfg = [
    { key: "pos"     as const, label: t("retail.tab.pos"),     icon: ShoppingCart },
    { key: "stock"   as const, label: t("retail.tab.stock"),   icon: Package },
    { key: "history" as const, label: t("retail.tab.history"), icon: History },
  ];

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
          {/* Title + action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))", border: "1px solid rgba(255,255,255,0.32)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.12)" }}>
              <Store className="w-[22px] h-[22px] text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: 25, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                {t("retail.title")}
              </h1>
              <p className="text-white/75 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>{t("retail.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
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
                <BarChart3 className="w-3.5 h-3.5" /> {t("retail.salesReport")}
              </button>
              <button
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
                <Receipt className="w-3.5 h-3.5" /> {t("retail.latestReceipts")}
              </button>
            </div>
          </div>

          {/* Pill tab nav */}
          <div className="relative bg-white rounded-full h-[42px] flex items-center px-1 w-fit max-w-full overflow-x-auto scrollbar-hide"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10)" }}>
            <div className="flex items-center gap-1 min-w-min">
              {tabsCfg.map(t => {
                const isActive = tab === t.key;
                const Ico = t.icon;
                return (
                  <motion.button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    whileTap={{ scale: 0.94 }}
                    className="relative inline-flex items-center gap-1.5 pl-1.5 pr-4 h-[34px] rounded-full whitespace-nowrap flex-shrink-0"
                    style={{
                      color: isActive ? "#ffffff" : "#374151",
                      fontSize: 12.5,
                      fontWeight: isActive ? 700 : 600,
                      textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="retail-tab-indicator"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)",
                          border: "1px solid #0d7c66",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: isActive ? "#ffffff" : "#f3f4f6", transition: "background 0.2s ease" }}>
                      <Ico className="w-3.5 h-3.5" style={{ color: isActive ? "#0d7c66" : "#9ca3af" }} />
                    </span>
                    <span className="relative z-10">{t.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {tab === "pos" && (
          <motion.div key="pos" className="flex-1 flex flex-col min-h-0 overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <POSTab />
          </motion.div>
        )}
        {tab === "stock" && (
          <motion.div key="stock" className="flex-1 flex flex-col min-h-0 overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <StockTab />
          </motion.div>
        )}
        {tab === "history" && (
          <motion.div key="history" className="flex-1 flex flex-col min-h-0 overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <HistoryTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
