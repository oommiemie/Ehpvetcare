import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Warehouse as WarehouseIcon, Search, Package, TrendingUp, AlertTriangle,
  CalendarClock, ChevronRight, ChevronLeft, FileDown, X, Ban, Layers,
} from "lucide-react";
import { useClinicData, type StockProduct } from "../contexts/ClinicDataContext";
import { WAREHOUSES, stockByWarehouse, lotsOf, daysLeft, minStockOf, type WarehouseLot } from "../config/warehouses";

const PAGE_SIZE = 10;   /* แบ่งหน้าเท่าหน้าจัดการ Stock */

const baht = (n: number) => `฿${Math.round(n).toLocaleString("th-TH")}`;
const fsz = (px: number) => `calc(${px}px * var(--fs))`;
const fmtThai = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

/* ป้ายสถานะอายุสินค้า */
const expiryTone = (d: number) =>
  d < 0     ? { label: "หมดอายุแล้ว", color: "#ef4444", soft: "rgba(239,68,68,0.12)" }
  : d <= 90 ? { label: `ใกล้หมดอายุ (${d} วัน)`, color: "#f59e0b", soft: "rgba(245,158,11,0.14)" }
  :           { label: "ปกติ", color: "#10b981", soft: "rgba(16,185,129,0.12)" };

export function StoreRoom() {
  const { stockProducts } = useClinicData();
  const [whKey, setWhKey] = useState(WAREHOUSES[0].key);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyLow, setOnlyLow] = useState(false);
  const [selected, setSelected] = useState<StockProduct | null>(null);
  const [lotTab, setLotTab] = useState<"stock" | "expiring">("stock");
  const [page, setPage] = useState(1);

  /* คำนวณครั้งเดียวต่อการเรนเดอร์ — กันสร้าง Date ใหม่ทุกแถว */
  const today = useMemo(() => new Date(), []);
  const wh = WAREHOUSES.find(w => w.key === whKey)!;

  /* ยอดคงเหลือรายคลังของทุกสินค้า */
  const split = useMemo(
    () => new Map(stockProducts.map(p => [p.id, stockByWarehouse(p)])),
    [stockProducts],
  );

  /* สถิติรายคลัง — คำนวณครบทุกคลัง เพื่อโชว์บนการ์ดคลังใน hero */
  const statsByWh = useMemo(() => {
    const m: Record<string, {
      items: number; value: number; low: number;
      expiring: number; expiringQty: number; expiringValue: number;   // ใกล้หมดอายุ ≤90 วัน
      expired: number;  expiredQty: number;  expiredValue: number;    // หมดอายุแล้ว
    }> = {};
    for (const w of WAREHOUSES) m[w.key] = { items: 0, value: 0, low: 0, expiring: 0, expiringQty: 0, expiringValue: 0, expired: 0, expiredQty: 0, expiredValue: 0 };
    for (const p of stockProducts) {
      if (p.type !== "stock") continue;
      const sp = split.get(p.id)!;
      for (const w of WAREHOUSES) {
        const qty = sp[w.key] ?? 0;
        if (qty <= 0) continue;
        const st = m[w.key];
        st.items++;
        st.value += qty * p.costPrice;
        if (qty <= minStockOf(p, w.key)) st.low++;
        /* แยกล็อตเป็นหมดอายุแล้ว / ใกล้หมดอายุ แล้วรวมทั้งจำนวนชิ้นและมูลค่า */
        const lots = lotsOf(p, w.key, qty, today);
        let hasExpired = false, hasExpiring = false;
        for (const l of lots) {
          const d = daysLeft(l.expiry, today);
          if (d < 0) {
            hasExpired = true;
            st.expiredQty += l.qty;
            st.expiredValue += l.qty * l.costPerUnit;
          } else if (d <= 90) {
            hasExpiring = true;
            st.expiringQty += l.qty;
            st.expiringValue += l.qty * l.costPerUnit;
          }
        }
        if (hasExpired) st.expired++;
        if (hasExpiring) st.expiring++;
      }
    }
    return m;
  }, [stockProducts, split, today]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(stockProducts.map(p => p.category)))],
    [stockProducts],
  );

  /* รายการในคลังที่เลือก */
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stockProducts
      .filter(p => p.type === "stock")
      .map(p => {
        const qty = split.get(p.id)![whKey] ?? 0;
        const lots = lotsOf(p, whKey, qty, today);
        const soonest = lots.length
          ? lots.reduce((a, b) => (new Date(a.expiry) < new Date(b.expiry) ? a : b))
          : null;
        return { p, qty, lots, soonest, value: qty * p.costPrice, min: minStockOf(p, whKey) };
      })
      .filter(r => r.qty > 0)
      .filter(r => category === "all" || r.p.category === category)
      .filter(r => !onlyLow || r.qty <= r.min)
      .filter(r => !q || r.p.name.toLowerCase().includes(q) || r.p.code.toLowerCase().includes(q))
      .sort((a, b) => a.p.name.localeCompare(b.p.name, "th"));
  }, [stockProducts, split, whKey, search, category, onlyLow, today]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  /* ถ้าตัวกรอง/คลังเปลี่ยนจนหน้าปัจจุบันเกินช่วง ให้เด้งกลับหน้าแรก */
  const curPage = Math.min(page, totalPages);
  const paged = rows.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  /* จำนวนรายการต่อหมวดในคลังนี้ — โชว์ในตัวเลือกหมวด (ไม่คิดตัวกรองหมวดเอง) */
  const catCount = useMemo(() => {
    const m: Record<string, number> = { all: 0 };
    for (const p of stockProducts) {
      if (p.type !== "stock") continue;
      if ((split.get(p.id)![whKey] ?? 0) <= 0) continue;
      m.all++;
      m[p.category] = (m[p.category] ?? 0) + 1;
    }
    return m;
  }, [stockProducts, split, whKey]);

  /* ล็อตของรายการที่เลือก — แท็บ "สินค้าหมดอายุ" กรองเฉพาะที่เหลือ ≤ 90 วัน */
  const selectedLots: WarehouseLot[] = useMemo(() => {
    if (!selected) return [];
    const qty = split.get(selected.id)![whKey] ?? 0;
    const all = lotsOf(selected, whKey, qty, today);
    return lotTab === "stock" ? all : all.filter(l => daysLeft(l.expiry, today) <= 90);
  }, [selected, split, whKey, lotTab, today]);

  const exportCsv = () => {
    const head = ["รหัส", "ชื่อรายการ", "หมวด", "หน่วย", "ยอดคงเหลือ", "ทุน/หน่วย", "มูลค่า", "หมดอายุใกล้สุด"];
    const body = rows.map(r => [
      r.p.code, r.p.name, r.p.category, r.p.unit, r.qty, r.p.costPrice, r.value,
      r.soonest ? r.soonest.expiry : "",
    ]);
    const csv = [head, ...body].map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `stock-${whKey}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4 min-h-full" style={{ background: "#FEFBF8" }}>

      {/* ═══ HERO ═══ */}
      <div className="relative rounded-3xl overflow-hidden" style={{
        backgroundImage: `
          radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
          radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
          linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)` }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)" }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        </div>

        <div className="relative p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))",
              border: "1px solid rgba(255,255,255,0.32)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.12)" }}>
              <WarehouseIcon className="w-[22px] h-[22px] text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: fsz(25), letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                คลังสินค้าแยกตามหน่วยจ่าย
              </h1>
              <p className="text-white/75 mt-1" style={{ fontSize: fsz(12), fontWeight: 500 }}>
                ดูรายการคงเหลือ · ล็อต · วันหมดอายุ แยกตามคลัง
              </p>
            </div>
            {/* ปุ่ม Export ย้ายไปอยู่ใน toolbar ของตารางแล้ว (ชุดเดียวกับหน้าจัดการ Stock) */}
          </div>

          {/* ── การ์ดคลัง — KPI + ของหมดอายุ อยู่ในการ์ดของแต่ละคลัง ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {WAREHOUSES.map(w => {
              const on = w.key === whKey;
              const st = statsByWh[w.key];
              return (
                <button key={w.key} onClick={() => { setWhKey(w.key); setSelected(null); setPage(1); }}
                  className="relative rounded-2xl p-3 text-left transition-all hover:-translate-y-0.5"
                  style={{
                    /* การ์ดที่เลือก: ไล่สีอ่อน ๆ ของสีประจำคลัง จางลงเป็นขาว
                       ต้องมีพื้นขาวทึบรองใต้ gradient ไม่งั้นสี hero ทะลุผ่านสต็อปที่โปร่ง */
                    backgroundColor: "#ffffff",
                    backgroundImage: on
                      ? `linear-gradient(145deg, ${w.color}14 0%, ${w.color}07 45%, ${w.color}00 100%)`
                      : "none",
                    border: on ? `1.5px solid ${w.color}` : "1px solid rgba(255,255,255,0.5)",
                    boxShadow: on
                      ? `0 8px 22px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.9)`
                      : "0 6px 18px rgba(0,0,0,0.12)",
                  }}>
                  {/* สามเหลี่ยมมุมขวาบน — บอกว่าคลังนี้กำลังถูกเลือกอยู่
                      ใช้ gradient 45° ตัดครึ่งเป็นรูปสามเหลี่ยม + โค้งมุมตามการ์ด (16px ลบขอบ 1.5px)
                      จึงแนบมุมพอดีทุกโค้ง ไม่ต้องซ้อน overflow-hidden */}
                  {on && (
                    <span aria-hidden className="absolute top-0 right-0 pointer-events-none"
                      style={{
                        width: 34, height: 34,
                        borderTopRightRadius: 14.5,
                        background: `linear-gradient(45deg, transparent 50%, ${w.color} 50%)`,
                      }} />
                  )}

                  {/* หัวการ์ด */}
                  <span className="relative flex items-center gap-2 mb-2">
                    {/* คลังที่เลือก: วงไอคอนทึบสีเข้ม + ไอคอนขาว ให้เด่นกว่าใบที่ไม่ได้เลือก */}
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={on
                        ? { background: `linear-gradient(135deg, ${w.color}, ${w.color}cc)`, boxShadow: `0 3px 10px ${w.color}59` }
                        : { background: `${w.color}1f` }}>
                      <WarehouseIcon className="w-4 h-4" style={{ color: on ? "#ffffff" : w.color }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-gray-900 truncate" style={{ fontSize: fsz(12.5), fontWeight: on ? 800 : 700, lineHeight: 1.2 }}>{w.label}</span>
                      <span className="block text-gray-400 truncate" style={{ fontSize: fsz(9.5) }}>{w.sub}</span>
                    </span>
                  </span>

                  {/* ตัวเลขหลัก: มูลค่าคลัง */}
                  <span className="block text-gray-900" style={{ fontSize: fsz(17), fontWeight: 800, lineHeight: 1.15, fontVariantNumeric: "tabular-nums" }}>
                    {baht(st.value)}
                  </span>
                  <span className="block text-gray-400 mb-2" style={{ fontSize: fsz(9.5) }}>มูลค่าคงเหลือ</span>

                  {/* KPI ย่อย 3 ตัว */}
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: "#f3f4f6", color: "#4b5563", fontSize: fsz(9.5), fontWeight: 700 }}>
                      <Package className="w-2.5 h-2.5" /> {st.items}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                      style={{ background: st.low ? "rgba(232,128,42,0.12)" : "#f3f4f6", color: st.low ? "#e8802a" : "#9ca3af", fontSize: fsz(9.5), fontWeight: 700 }}
                      title="ถึงจุดสั่งซื้อ">
                      <AlertTriangle className="w-2.5 h-2.5" /> {st.low}
                    </span>
                  </span>

                  {/* ── ของหมดอายุ / ใกล้หมดอายุ — ไทล์คู่ พื้นสีอ่อนตามระดับความเร่งด่วน ── */}
                  <span className="block mt-2.5 pt-2.5" style={{ borderTop: "1px dashed #e5e7eb" }}>
                    <span className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: "exp",  icon: Ban,           label: "หมดอายุ",     n: st.expired,  qty: st.expiredQty,  val: st.expiredValue,  c: "#dc2626", bg: "rgba(239,68,68,0.08)" },
                        { key: "near", icon: CalendarClock, label: "ใกล้หมดอายุ", n: st.expiring, qty: st.expiringQty, val: st.expiringValue, c: "#d97706", bg: "rgba(245,158,11,0.10)" },
                      ] as const).map(x => {
                        const active = x.n > 0;
                        const Ico = x.icon;
                        return (
                          <span key={x.key} className="block rounded-xl px-2 py-1.5"
                            style={{ background: active ? x.bg : "#f9fafb" }}>
                            <span className="flex items-center gap-1 mb-0.5" style={{ color: active ? x.c : "#9ca3af" }}>
                              <Ico className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate" style={{ fontSize: fsz(8.5), fontWeight: 700 }}>{x.label}</span>
                            </span>
                            <span className="block truncate" style={{ color: active ? x.c : "#9ca3af", fontSize: fsz(13), fontWeight: 800, lineHeight: 1.15, fontVariantNumeric: "tabular-nums" }}>
                              {baht(x.val)}
                            </span>
                            <span className="block truncate" style={{ color: active ? "#6b7280" : "#c4c9d2", fontSize: fsz(8.5) }}>
                              {x.n} รายการ · {x.qty.toLocaleString()} ชิ้น
                            </span>
                          </span>
                        );
                      })}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ ตารางรายการ ═══ */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* ── Toolbar — ชุดเดียวกับหน้าจัดการ Stock ── */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 flex-wrap">
            {/* ค้นหา */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="ค้นหาสินค้า, รหัส, ตำแหน่ง..."
                className="pl-9 pr-4 h-9 rounded-full text-[13px] w-56 outline-none transition-all duration-200"
                style={{ border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151" }}
                onFocus={e => { e.currentTarget.style.border = "1px solid var(--brand)"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--brand) 10%, transparent)"; }}
                onBlur={e => { e.currentTarget.style.border = "1px solid #e5e7eb"; e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.boxShadow = ""; }}
              />
            </div>

            {/* เลือกคลัง — ทำงานร่วมกับการ์ดคลังใน hero (state เดียวกัน) */}
            <div className="relative inline-flex items-center">
              <WarehouseIcon className="absolute left-3 w-3.5 h-3.5 pointer-events-none" style={{ color: "#9ca3af" }} />
              <select
                value={whKey}
                onChange={e => { setWhKey(e.target.value); setSelected(null); setPage(1); }}
                aria-label="เลือกคลัง"
                className="appearance-none h-9 pl-8 pr-8 rounded-full text-[13px] outline-none transition-all duration-200 cursor-pointer"
                /* เทาปกติเสมอ — คลังที่เลือกอยู่ดูได้จากการ์ดใน hero */
                style={{ border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontWeight: 500 }}
              >
                {WAREHOUSES.map(w => (
                  <option key={w.key} value={w.key}>{w.label} ({statsByWh[w.key].items})</option>
                ))}
              </select>
              <ChevronRight className="absolute right-2.5 w-3.5 h-3.5 pointer-events-none rotate-90" style={{ color: "#9ca3af" }} />
            </div>

            {/* หมวดหมู่ + จำนวน */}
            <div className="relative inline-flex items-center">
              <select
                value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                className="appearance-none h-9 pl-3 pr-8 rounded-full text-[13px] outline-none transition-all duration-200 cursor-pointer"
                style={{
                  border: category !== "all" ? "1px solid color-mix(in srgb, var(--brand) 40%, transparent)" : "1px solid #e5e7eb",
                  background: category !== "all" ? "color-mix(in srgb, var(--brand) 7%, transparent)" : "#f9fafb",
                  color: category !== "all" ? "var(--brand-dark)" : "#6b7280",
                  fontWeight: category !== "all" ? 700 : 500,
                }}
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c === "all" ? `ทั้งหมด (${catCount.all ?? 0})` : `${c} (${catCount[c] ?? 0})`}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none rotate-90"
                style={{ color: category !== "all" ? "var(--brand-dark)" : "#9ca3af" }} />
            </div>

            {/* เฉพาะถึงจุดสั่งซื้อ */}
            <button
              onClick={() => { setOnlyLow(v => !v); setPage(1); }}
              className="flex items-center gap-2 h-9 px-4 rounded-full text-[13px] transition-all duration-200"
              style={{
                border: onlyLow ? "1px solid color-mix(in srgb, var(--brand) 40%, transparent)" : "1px solid #e5e7eb",
                background: onlyLow ? "color-mix(in srgb, var(--brand) 7%, transparent)" : "#f9fafb",
                color: onlyLow ? "var(--brand-dark)" : "#6b7280",
                fontWeight: onlyLow ? 700 : 500,
              }}
              title="แสดงเฉพาะรายการที่คงเหลือถึงจุดสั่งซื้อของคลังนี้"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              ถึงจุดสั่งซื้อ
            </button>

            {/* Export — ดันไปขวาสุด (คลังที่กำลังดูดูได้จากการ์ดใน hero แล้ว) */}
            <button
              onClick={exportCsv}
              className="ml-auto flex items-center gap-2 h-9 px-4 rounded-full text-[13px] transition-all duration-200"
              style={{ background: "#f9fafb", color: "#475569", fontWeight: 600, border: "1px solid #e5e7eb" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
              title="ส่งออกรายการที่กรองอยู่เป็นไฟล์ CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]" style={{ fontSize: fsz(12.5) }}>
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th className="text-left px-4 py-2.5" style={{ width: 46 }}>#</th>
                <th className="text-left px-3 py-2.5">ชื่อรายการ</th>
                <th className="text-left px-3 py-2.5">หมวด</th>
                <th className="text-center px-3 py-2.5">หน่วย</th>
                <th className="text-right px-3 py-2.5">คงเหลือ</th>
                <th className="text-right px-3 py-2.5">มูลค่า</th>
                <th className="text-center px-3 py-2.5">ล็อต</th>
                <th className="text-left px-3 py-2.5">หมดอายุใกล้สุด</th>
                <th className="px-4 py-2.5" style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-12" style={{ fontSize: fsz(12.5) }}>
                  ไม่พบรายการในคลังนี้
                </td></tr>
              ) : paged.map((r, i) => {
                const low = r.qty <= r.min;
                const d = r.soonest ? daysLeft(r.soonest.expiry, today) : null;
                const tone = d === null ? null : expiryTone(d);
                const on = selected?.id === r.p.id;
                return (
                  <tr key={r.p.id}
                    onClick={() => { setSelected(r.p); setLotTab("stock"); }}
                    className="cursor-pointer transition-colors duration-150 hover:bg-[#f8fffe]"
                    title={`${r.p.name} · คงเหลือ ${r.qty} ${r.p.unit}`}
                    style={on ? { background: `${wh.color}0f` } : undefined}>
                    <td className="px-4 py-3 text-gray-400" style={{ fontVariantNumeric: "tabular-nums" }}>{(curPage - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="text-gray-800 truncate" style={{ fontWeight: 600 }}>{r.p.name}</p>
                      <p className="text-gray-400" style={{ fontSize: fsz(10.5) }}>{r.p.code} · {r.p.location}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-700 truncate">{r.p.categoryEmoji} {r.p.category}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{r.p.unit}</td>
                    <td className="px-3 py-3 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                      <span style={{ color: low ? "#e8802a" : "#111827", fontWeight: 700 }}>{r.qty.toLocaleString()}</span>
                      {low && <span className="block text-[#e8802a]" style={{ fontSize: fsz(9.5) }}>ต่ำกว่า {r.min}</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-[#1e2939]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{baht(r.value)}</td>
                    <td className="px-3 py-3 text-center text-gray-600" style={{ fontVariantNumeric: "tabular-nums" }}>{r.lots.length}</td>
                    <td className="px-3 py-3">
                      {tone && r.soonest ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tone.color }} />
                          <span className="text-gray-600">{fmtThai(r.soonest.expiry)}</span>
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-gray-300" /></td>
                  </tr>
                );
              })}
            </tbody>
            {/* ไม่มีแถวรวมมูลค่า — ดูได้จากการ์ดคลังใน hero แล้ว */}
          </table>
        </div>

        {/* ── แบ่งหน้า — ชุดเดียวกับหน้าจัดการ Stock ── */}
        {rows.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 flex-wrap gap-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-[12px] text-gray-400">
              แสดง{" "}
              <span className="text-gray-600" style={{ fontWeight: 600 }}>{(curPage - 1) * PAGE_SIZE + 1}–{Math.min(curPage * PAGE_SIZE, rows.length)}</span>
              {" "}จาก{" "}
              <span className="text-gray-600" style={{ fontWeight: 600 }}>{rows.length}</span> รายการ
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={curPage === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                style={{ background: "#f3f4f6", color: "#6b7280" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-full text-[12px] transition-all duration-150"
                  style={curPage === n
                    ? { background: "linear-gradient(135deg,var(--brand),var(--brand-dark))", color: "#fff", fontWeight: 700, boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 28%, transparent)" }
                    : { background: "#f3f4f6", color: "#6b7280", fontWeight: 500 }
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={curPage === totalPages}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                style={{ background: "#f3f4f6", color: "#6b7280" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Popup รายละเอียดล็อต — ขนาดคงที่ ไม่ยุบตามเนื้อหา ═══ */}
      <AnimatePresence>
        {selected && (() => {
          const qty = split.get(selected.id)![whKey] ?? 0;
          const allLots = lotsOf(selected, whKey, qty, today);
          const value = allLots.reduce((t, l) => t + l.qty * l.costPerUnit, 0);
          const expiredLots = allLots.filter(l => daysLeft(l.expiry, today) < 0);
          const nearLots = allLots.filter(l => { const d = daysLeft(l.expiry, today); return d >= 0 && d <= 90; });
          const riskValue = [...expiredLots, ...nearLots].reduce((t, l) => t + l.qty * l.costPerUnit, 0);

          /* การ์ด KPI 4 ใบ (เดิมเป็นข้อความ 3 ช่อง) */
          const kpiCards = [
            { label: "คงเหลือในคลัง", value: `${qty.toLocaleString()} ${selected.unit}`, icon: Package,       c: "#0d9488" },
            { label: "มูลค่ารวม",     value: baht(value),                                  icon: TrendingUp,    c: "#3b82f6" },
            { label: "จำนวนล็อต",     value: `${allLots.length} ล็อต`,                    icon: Layers,        c: "#8b5cf6" },
            { label: "มูลค่าเสี่ยง",   value: baht(riskValue),                              icon: CalendarClock, c: riskValue > 0 ? "#dc2626" : "#9ca3af" },
          ];

          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full bg-white rounded-3xl overflow-hidden flex flex-col"
                /* ขนาดตายตัว — ป๊อบอัพไม่ยุบ/ยืดตามจำนวนล็อต */
                style={{ maxWidth: 720, height: "min(620px, calc(100vh - 2rem))", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}
                onClick={e => e.stopPropagation()}
              >
                {/* ── header: รูปสินค้า + ชื่อ + ปุ่มปิดเล็ก ── */}
                <div className="vet-modal-header flex items-center gap-3 flex-shrink-0">
                  <span className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center"
                    style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 3px 10px rgba(0,0,0,0.10)" }}>
                    {selected.image
                      ? <img src={selected.image} alt="" className="w-full h-full object-cover" draggable={false} />
                      : <span style={{ fontSize: 26 }}>{selected.categoryEmoji}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate" style={{ fontSize: fsz(15.5), fontWeight: 800, letterSpacing: "-0.2px" }}>{selected.name}</p>
                    {/* รายละเอียดรวมบรรทัดเดียว — ยาวเกินตัดด้วย … และดูเต็มได้จาก title */}
                    <p className="text-gray-500 truncate" style={{ fontSize: fsz(11.5) }}
                      title={`${selected.code} · ${selected.category} · ${selected.location} · คลัง ${wh.label} · ทุน ${baht(selected.costPrice)}/${selected.unit}`}>
                      {selected.code} · {selected.categoryEmoji} {selected.category} · {selected.location} · คลัง {wh.label} · ทุน {baht(selected.costPrice)}/{selected.unit}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)} aria-label="ปิด"
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-black/5"
                    style={{ color: "#9ca3af" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ── การ์ด KPI ── */}
                <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  {kpiCards.map(k => (
                    <div key={k.label} className="rounded-xl px-2.5 py-2" style={{ background: `${k.c}0f`, border: `1px solid ${k.c}22` }}>
                      <span className="flex items-center gap-1 mb-0.5" style={{ color: k.c }}>
                        <k.icon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate" style={{ fontSize: fsz(9), fontWeight: 700 }}>{k.label}</span>
                      </span>
                      <span className="block truncate text-gray-900" style={{ fontSize: fsz(14), fontWeight: 800, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>
                        {k.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── แท็บแบบแถบ (segmented) ── */}
                <div className="px-5 pt-3 flex-shrink-0">
                  <div className="flex p-1 rounded-full bg-gray-100">
                    {([
                      ["stock", `จำนวนคงเหลือ (${allLots.length})`],
                      ["expiring", `ใกล้หมดอายุ / หมดอายุ (${expiredLots.length + nearLots.length})`],
                    ] as const).map(([k, label]) => {
                      const on = lotTab === k;
                      return (
                        <button key={k} onClick={() => setLotTab(k)}
                          className="flex-1 rounded-full py-1.5 transition-all duration-200"
                          style={{
                            fontSize: fsz(12), fontWeight: on ? 700 : 600,
                            background: on ? "#ffffff" : "transparent",
                            color: on ? "var(--brand-dark)" : "#6b7280",
                            boxShadow: on ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── ตารางล็อต (พื้นที่ที่เหลือทั้งหมด เลื่อนได้) ── */}
                <div className="flex-1 min-h-0 overflow-auto px-5 py-3">
                  <table className="w-full min-w-[560px]" style={{ fontSize: fsz(12.5) }}>
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <th className="text-left px-3 py-2.5 rounded-l-lg">Lot No.</th>
                        <th className="text-left px-3 py-2.5">วันที่รับ</th>
                        <th className="text-left px-3 py-2.5">วันหมดอายุ</th>
                        <th className="text-right px-3 py-2.5">คงเหลือ</th>
                        <th className="text-right px-3 py-2.5">มูลค่า</th>
                        <th className="text-left px-3 py-2.5 rounded-r-lg">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedLots.length === 0 ? (
                        <tr><td colSpan={6} className="text-center text-gray-400 py-16">
                          {lotTab === "expiring" ? "ไม่มีล็อตที่ใกล้หมดอายุ" : "ไม่มีล็อตในคลังนี้"}
                        </td></tr>
                      ) : selectedLots.map(l => {
                        const d = daysLeft(l.expiry, today);
                        const tone = expiryTone(d);
                        return (
                          <tr key={l.lotNo} className="transition-colors duration-150 hover:bg-[#f8fffe]">
                            <td className="px-3 py-3 font-mono text-(--brand-dark)" style={{ fontWeight: 700 }}>{l.lotNo}</td>
                            <td className="px-3 py-3 text-gray-600">{fmtThai(l.receivedAt)}</td>
                            <td className="px-3 py-3 text-gray-600">{fmtThai(l.expiry)}</td>
                            <td className="px-3 py-3 text-right text-gray-800" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{l.qty.toLocaleString()} {selected.unit}</td>
                            <td className="px-3 py-3 text-right text-[#1e2939]" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{baht(l.qty * l.costPerUnit)}</td>
                            <td className="px-3 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap"
                                style={{ background: tone.soft, color: tone.color, fontSize: fsz(10.5), fontWeight: 700 }}>
                                {tone.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <p className="text-gray-400 px-1" style={{ fontSize: fsz(11) }}>
        ยอดรายคลังคำนวณจากยอดคงเหลือรวมของสินค้า — ผลรวมทุกคลังเท่ากับยอดในหน้าจัดการ Stock
      </p>
    </div>
  );
}
