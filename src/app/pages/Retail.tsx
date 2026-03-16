import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, ShoppingCart, Trash2, ChevronDown,
  FileText, BarChart3, Receipt, Package, AlertTriangle,
  DollarSign, TrendingUp,
} from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import svgPaths from "../../imports/svg-wzp4lylxew";

/* ═══════════════════════════════════════════════════════════════════ */
/*  Product Data                                                      */
/* ═══════════════════════════════════════════════════════════════════ */
type Category = "ทั้งหมด" | "อาหาร" | "Grooming" | "ของเล่น" | "ยา/วิตามิน" | "อื่นๆ";
interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  price: number;
  unit: string;
  stock: number;
  useStock: boolean;
  image: string;
  catColor: string;
  catBg: string;
}
const categories: Category[] = ["ทั้งหมด", "อาหาร", "Grooming", "ของเล่น", "ยา/วิตามิน", "อื่นๆ"];
const catColors: Record<string, { color: string; bg: string; banner: string }> = {
  "อาหาร":      { color: "#e8802a", bg: "#fff3e6", banner: "linear-gradient(135deg,#f6a94d 0%,#e8802a 100%)" },
  "Grooming":   { color: "#d6608f", bg: "#fce4ec", banner: "linear-gradient(135deg,#f48fb1 0%,#d6608f 100%)" },
  "ของเล่น":    { color: "#5c6bc0", bg: "#e8eaf6", banner: "linear-gradient(135deg,#9fa8da 0%,#5c6bc0 100%)" },
  "ยา/วิตามิน": { color: "#43a047", bg: "#e8f5e9", banner: "linear-gradient(135deg,#81c784 0%,#43a047 100%)" },
  "อื่นๆ":      { color: "#78909c", bg: "#eceff1", banner: "linear-gradient(135deg,#b0bec5 0%,#78909c 100%)" },
};

const initialProducts: Product[] = [
  { id: "p1", name: "ขนม Milk-Bone",          sku: "TRT-001", category: "อาหาร",      price: 49,   unit: "ชิ้น",  stock: 4,  useStock: true,  image: "https://images.unsplash.com/photo-1761660304474-d921d4d3f49d?w=200&q=80", catColor: "#e8802a", catBg: "#fff3e6" },
  { id: "p2", name: "Royal Canin Adult 3kg",   sku: "FOOD-012", category: "อาหาร",      price: 890,  unit: "ถุง",   stock: 18, useStock: true,  image: "https://images.unsplash.com/photo-1761660304474-d921d4d3f49d?w=200&q=80", catColor: "#e8802a", catBg: "#fff3e6" },
  { id: "p3", name: "แชมพูสุนัข Furminator",   sku: "GRM-005", category: "Grooming",   price: 350,  unit: "ขวด",  stock: 9,  useStock: true,  image: "https://images.unsplash.com/photo-1672062519474-1a4407fdf387?w=200&q=80", catColor: "#d6608f", catBg: "#fce4ec" },
  { id: "p4", name: "วิตามิน C 60 เม็ด",      sku: "VIT-008", category: "ยา/วิตามิน", price: 180,  unit: "กระปุก", stock: 22, useStock: true,  image: "https://images.unsplash.com/photo-1740592754365-2117f5977528?w=200&q=80", catColor: "#43a047", catBg: "#e8f5e9" },
  { id: "p5", name: "ลูกบอลยาง S",             sku: "TOY-002", category: "ของเล่น",    price: 89,   unit: "ลูก",   stock: 15, useStock: true,  image: "https://images.unsplash.com/photo-1621719456129-ddaa16536dae?w=200&q=80", catColor: "#5c6bc0", catBg: "#e8eaf6" },
  { id: "p6", name: "สายจูง Leather Premium",  sku: "ACC-013", category: "อื่นๆ",      price: 450,  unit: "เส้น",  stock: 7,  useStock: true,  image: "https://images.unsplash.com/photo-1728448644391-3672afb72ed8?w=200&q=80", catColor: "#78909c", catBg: "#eceff1" },
  { id: "p7", name: "ตัดขนพิเศษ (Custom)",     sku: "SVC-081", category: "Grooming",   price: 500,  unit: "ครั้ง", stock: 0,  useStock: false, image: "https://images.unsplash.com/photo-1725419876939-f8f9987cf0d2?w=200&q=80", catColor: "#d6608f", catBg: "#fce4ec" },
  { id: "p8", name: "บริการรับ-ส่งถึงบ้าน",    sku: "SVC-T81", category: "อื่นๆ",      price: 200,  unit: "เที่ยว", stock: 0,  useStock: false, image: "https://images.unsplash.com/photo-1586015512520-a3269c5c03cc?w=200&q=80", catColor: "#78909c", catBg: "#eceff1" },
];

interface CartItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
}

const cv = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const iv = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } } };

/* ═══════════════════════════════════════════════════════════════════ */
/*  Stat Cards Data                                                   */
/* ═══════════════════════════════════════════════════════════════════ */
const stats = [
  { label: "ยอดขายวันนี้",  value: `฿${(4280).toLocaleString()}`, grad: "linear-gradient(154deg,#43a047,#2e7d32)", svgKey: "p1276f080" as keyof typeof svgPaths },
  { label: "รายการวันนี้",  value: "14",                           grad: "linear-gradient(154deg,#e8802a,#d06a1a)", svgKey: "p4078480"  as keyof typeof svgPaths },
  { label: "สินค้าใกล้หมด", value: "38",                           grad: "linear-gradient(154deg,#5c6bc0,#3f51b5)", svgKey: "p344da300" as keyof typeof svgPaths },
  { label: "Stock ใกล้หมด", value: "3",                            grad: "linear-gradient(154deg,#e53935,#c62828)", svgKey: "pc3aa880"  as keyof typeof svgPaths },
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  POS Tab                                                           */
/* ═══════════════════════════════════════════════════════════════════ */
function POSTab() {
  const { showSnackbar } = useSnackbar();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<Category>("ทั้งหมด");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerType, setCustomerType] = useState("ลูกค้าทั่วไป (ไม่สมาชิก)");
  const [discountInput, setDiscountInput] = useState("");
  const [discountType, setDiscountType] = useState<"fix" | "pct">("fix");

  const products = initialProducts.filter(p => {
    const matchCat = selectedCat === "ทั้งหมด" || p.category === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === p.id);
      if (existing) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, unit: p.unit, price: p.price, qty: 1 }];
    });
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const changeQty = (id: string, delta: number) => setCart(prev =>
    prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
  );
  const clearCart = () => { setCart([]); setDiscountInput(""); };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountVal = parseFloat(discountInput) || 0;
  const discountAmt = discountType === "pct" ? Math.round(subtotal * discountVal / 100) : Math.min(discountVal, subtotal);
  const total = Math.max(0, subtotal - discountAmt);

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-0">

      {/* ═══ LEFT: Product Grid ═══ */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
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
              return (
                <motion.div key={p.id} variants={iv}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  {/* Gradient banner */}
                  <div className="relative h-20 flex items-start justify-between px-3 pt-2 rounded-t-2xl"
                    style={{ background: `linear-gradient(135deg, ${cc.bg} 0%, #FEFBF8 50%, ${cc.bg} 100%)` }}>
                    {/* Decorative radial glow */}
                    <div className="pointer-events-none absolute -right-5 -top-5 w-24 h-24 rounded-full opacity-[0.10]"
                      style={{ background: `radial-gradient(circle, ${cc.color} 0%, transparent 70%)` }} />
                    <div className="pointer-events-none absolute -left-8 -bottom-8 w-20 h-20 rounded-full opacity-[0.05]"
                      style={{ background: `radial-gradient(circle, ${cc.color} 0%, transparent 70%)` }} />
                    {/* Category badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: cc.color + "18", color: cc.color, fontWeight: 600 }}>
                      {p.category}
                    </span>
                    {!p.useStock && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(0,0,0,0.06)", color: "#6a7282", fontWeight: 500 }}>
                        ไม่ใช้ Stock
                      </span>
                    )}
                    {/* Product image - overlapping circle */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-14 h-14 rounded-full bg-white p-1 shadow-lg"
                      style={{ boxShadow: `0 4px 14px ${cc.color}20` }}>
                      <img src={p.image} alt={p.name}
                        className="w-full h-full rounded-full object-cover"
                        draggable={false} />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="pt-9 pb-3 px-3 text-center">
                    <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 700 }}>{p.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">SKU: {p.sku}</p>
                    <p className="mt-2" style={{ fontWeight: 800, fontSize: "1rem", color: cc.color }}>
                      ฿{p.price.toLocaleString()}<span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>/{p.unit}</span>
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {p.useStock ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.stock <= 5 ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}
                          style={{ fontWeight: 500 }}>
                          คงเหลือ {p.stock}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400" style={{ fontWeight: 500 }}>
                          ไม่จำกัด
                        </span>
                      )}
                      <button onClick={() => addToCart(p)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                        style={{ background: "linear-gradient(135deg,#43a047,#2e7d32)", boxShadow: "0 2px 8px rgba(67,160,71,0.35)" }}>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
      <div className="w-full lg:w-[320px] xl:w-[340px] flex-shrink-0 bg-white border-l border-gray-100 flex flex-col min-h-0">
        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#e8802a]" />
            <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ตะกร้าสินค้า</span>
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
                const prod = initialProducts.find(p => p.id === item.id);
                const cc = prod ? (catColors[prod.category] || catColors["อื่นๆ"]) : catColors["อื่นๆ"];
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                    {/* Mini image */}
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2"
                      style={{ borderColor: cc.color + "40" }}>
                      {prod && <img src={prod.image} alt={item.name} className="w-full h-full object-cover" />}
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
              <button onClick={() => {
                showSnackbar("success", `ชำระเงิน ฿${total.toLocaleString()} สำเร็จ`);
                clearCart();
              }}
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
/*  Stock Management Tab (Placeholder)                                */
/* ═══════════════════════════════════════════════════════════════════ */
function StockTab() {
  const stockItems = initialProducts.filter(p => p.useStock);
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
        {stockItems.map((p, i) => {
          const cc = catColors[p.category] || catColors["อื่นๆ"];
          const low = p.stock <= 5;
          return (
            <motion.div key={p.id} variants={iv}
              className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border" style={{ borderColor: cc.color + "30" }}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>{p.name}</p>
                  <p className="text-[10px] text-gray-400">฿{p.price.toLocaleString()}/{p.unit}</p>
                </div>
              </div>
              <span className="w-20 text-center text-[11px] text-gray-500" style={{ fontWeight: 500 }}>{p.sku}</span>
              <span className="w-20 text-center">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: cc.color + "15", color: cc.color, fontWeight: 600 }}>
                  {p.category}
                </span>
              </span>
              <span className="w-16 text-center text-xs text-gray-700" style={{ fontWeight: 600 }}>฿{p.price.toLocaleString()}</span>
              <span className="w-20 text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${low ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`} style={{ fontWeight: 700 }}>
                  {p.stock}
                </span>
              </span>
              <span className="w-20 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${low ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`} style={{ fontWeight: 600 }}>
                  {low ? "ใกล้หมด" : "ปกติ"}
                </span>
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Sales History Tab (Placeholder)                                   */
/* ═══════════════════════════════════════════════════════════════════ */
function HistoryTab() {
  const mockSales = [
    { id: "S-2569-0081", date: "16 มี.ค. 2569 10:24", customer: "คุณสมศักดิ์", items: 3, total: 1290, status: "ชำระแล้ว" },
    { id: "S-2569-0080", date: "16 มี.ค. 2569 09:15", customer: "ลูกค้าทั่วไป", items: 1, total: 350, status: "ชำระแล้ว" },
    { id: "S-2569-0079", date: "15 มี.ค. 2569 16:40", customer: "คุณวรรณา", items: 5, total: 2640, status: "ชำระแล้ว" },
    { id: "S-2569-0078", date: "15 มี.ค. 2569 14:20", customer: "ลูกค้าทั่วไป", items: 2, total: 890, status: "ยกเลิก" },
    { id: "S-2569-0077", date: "15 มี.ค. 2569 11:00", customer: "คุณประพันธ์", items: 4, total: 1580, status: "ชำระแล้ว" },
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
        {mockSales.map((s, i) => (
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
/*  Main Retail Page                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
export function Retail() {
  return (
    <div className="h-full bg-[#FEFBF8] flex flex-col">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-shrink-0 px-3 sm:px-6 pt-4 sm:pt-5 bg-white border-b border-gray-100"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-gray-900" style={{ fontWeight: 700 }}>ร้านค้า & POS</h1>

          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#19a589] hover:text-[#19a589] transition-all"
              style={{ fontWeight: 500 }}>
              <BarChart3 className="w-3.5 h-3.5" /> รายงานยอดขาย
            </button>
            <button className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#19a589] hover:text-[#19a589] transition-all"
              style={{ fontWeight: 500 }}>
              <Receipt className="w-3.5 h-3.5" /> ใบเสร็จล่าสุด
            </button>
            <button className="flex items-center gap-1.5 text-white rounded-full active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px] hover:shadow-lg"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}>
              <Plus className="w-3.5 h-3.5" /> เพิ่มสินค้า
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-4 sm:pb-5"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
          }}
        >
          {stats.map((s, i) => (
            <motion.div key={i}
              variants={{ hidden: { opacity: 0, y: 20, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-4 relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group"
              style={{ background: s.grad, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
              {/* Decorative radial glows */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-200 group-hover:scale-110" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                  <svg className="w-5 h-5" viewBox="0 0 19.9925 19.9925" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d={svgPaths[s.svgKey]} fill="rgba(255,255,255,0.9)" />
                  </svg>
                </div>
                <div className="text-[11px] text-white/60 mb-1" style={{ fontWeight: 500, letterSpacing: "0.02em" }}>{s.label}</div>
                <span className="text-[26px] text-white" style={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Content ── */}
      <POSTab />
    </div>
  );
}