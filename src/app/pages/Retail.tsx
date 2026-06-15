import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, ShoppingCart, Trash2, ChevronDown,
  BarChart3, Receipt, Package, DollarSign, Pill,
  Store, History,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useClinicData } from "../contexts/ClinicDataContext";
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

/* ═══════════════════════════════════════════════════════════════════ */
/*  POS Tab — ดึงสินค้าจาก ClinicDataContext                          */
/* ═══════════════════════════════════════════════════════════════════ */
function POSTab() {
  const { showSnackbar } = useSnackbar();
  const { stockProducts, setStockProducts } = useClinicData();

  const [search, setSearch]             = useState("");
  const [selectedCat, setSelectedCat]   = useState<Category>("ทั้งหมด");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [customerType, setCustomerType] = useState("ลูกค้าทั่วไป (ไม่สมาชิก)");
  const [discountInput, setDiscountInput] = useState("");
  const [discountType, setDiscountType]   = useState<"fix" | "pct">("fix");

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
  const clearCart = () => { setCart([]); setDiscountInput(""); };

  // ── Totals ──
  const subtotal    = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountVal = parseFloat(discountInput) || 0;
  const discountAmt = discountType === "pct"
    ? Math.round(subtotal * discountVal / 100)
    : Math.min(discountVal, subtotal);
  const total = Math.max(0, subtotal - discountAmt);

  // ── Checkout: ลดสต็อกใน context ──
  const handleCheckout = () => {
    setStockProducts(prev => {
      const copy = [...prev];
      cart.forEach(ci => {
        const rawId = parseInt(ci.id.replace("sp", ""), 10);
        const idx   = copy.findIndex(p => p.id === rawId && p.type === "stock");
        if (idx !== -1) {
          copy[idx] = { ...copy[idx], stock: Math.max(0, copy[idx].stock - ci.qty) };
        }
      });
      return copy;
    });
    showSnackbar("success", `ชำระเงิน ฿${total.toLocaleString()} สำเร็จ — ระบบอัปเดตสต็อกเรียบร้อย`);
    clearCart();
  };

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

        {/* Customer selector */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-2">
          <label className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>เลือกรายขาย / ลูกค้า</label>
          <div className="relative">
            <select value={customerType} onChange={e => setCustomerType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#19a589]/20 appearance-none pr-8 text-gray-700 cursor-pointer"
              style={{ fontWeight: 500 }}>
              <option>ลูกค้าทั่วไป (ไม่สมาชิก)</option>
              <option>สมาชิก VIP</option>
              <option>สมาชิก Gold</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">ยังไม่มีสินค้าในตะกร้า</p>
              <p className="text-[10px] mt-0.5">คลิกสินค้า เพื่อเพิ่มรายการ</p>
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
              <div className="flex justify-between text-xs text-gray-500">
                <span>VAT (0%)</span>
                <span>-</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ยอดชำระ</span>
                <span className="text-[#19a589]" style={{ fontWeight: 800, fontSize: "1.15rem" }}>
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Confirm button */}
            <div className="px-4 pb-4">
              <button onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-full transition-all active:scale-[0.98]"
                style={{ fontWeight: 700, background: "linear-gradient(177deg,#5a9e60,#3a7d40)", boxShadow: "0 4px 16px rgba(73,138,79,0.35)" }}>
                <DollarSign className="w-4 h-4" />
                สรุปยอด & ชำระเงิน
              </button>
            </div>
          </div>
        )}
      </div>
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
  const { lowStockCount, outOfStockCount } = useClinicData();
  const [tab, setTab] = useState<"pos" | "stock" | "history">("pos");

  const tabsCfg = [
    { key: "pos"     as const, label: "ขายสินค้า (POS)", icon: ShoppingCart },
    { key: "stock"   as const, label: "สต็อกสินค้า",     icon: Package },
    { key: "history" as const, label: "ประวัติการขาย",    icon: History },
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
          {/* Title + action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))", border: "1px solid rgba(255,255,255,0.32)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.12)" }}>
              <Store className="w-[22px] h-[22px] text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: 25, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                ร้านค้า &amp; POS
              </h1>
              <p className="text-white/75 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>จัดการสินค้า สต็อก และจุดขาย</p>
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
                <BarChart3 className="w-3.5 h-3.5" /> รายงานยอดขาย
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
                <Receipt className="w-3.5 h-3.5" /> ใบเสร็จล่าสุด
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
