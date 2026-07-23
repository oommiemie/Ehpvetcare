/* ═══════════════════════════════════════════════════════════════════
   STOCK CARD — บัญชีคุมสินค้ารายตัว (รับเข้า / จ่ายออก / คงเหลือ)

   รวมข้อมูล 2 แหล่งเป็นบัญชีเดียว
     1) stockMovements — รับตามใบ PO · รับไม่มีใบ PO · จ่ายเอง · ปรับยอด
     2) stockLedger    — ตัดจ่ายอัตโนมัติจาก POS / ใบสั่งยา OPD-IPD

   ยอดคงเหลือคิดถอยหลังจากยอดจริงของสินค้า ไม่ใช่บวกจาก 0
   เพื่อให้บรรทัดสุดท้ายตรงกับยอดคงเหลือจริงเสมอ แม้บัญชีจะไม่ครบตั้งแต่วันแรก

   โหมดหน่วยจ่าย (warehouse) — ใช้ในหน้าคลังสินค้าแยกตามหน่วยจ่าย
   จะกรองเฉพาะบรรทัดที่เกิดในหน่วยจ่ายนั้น และปิดยอดด้วยคงเหลือของหน่วยจ่ายนั้น
   ═══════════════════════════════════════════════════════════════════ */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ClipboardList, FileDown, Printer } from "lucide-react";
import { DateRangePickerModern } from "./DateRangePickerModern";
import type { StockProduct, StockMovement, StockLedgerEntry } from "../contexts/ClinicDataContext";
import { WAREHOUSES, warehouseByKey, stockByWarehouse } from "../config/warehouses";

const THAI_MONTH: Record<string, number> = {
  "ม.ค.": 0, "ก.พ.": 1, "มี.ค.": 2, "เม.ย.": 3, "พ.ค.": 4, "มิ.ย.": 5,
  "ก.ค.": 6, "ส.ค.": 7, "ก.ย.": 8, "ต.ค.": 9, "พ.ย.": 10, "ธ.ค.": 11,
};
/** movement → เวลาจริง (ISO) · ของเก่าที่เก็บวันที่เป็นข้อความไทยจะถูกแปลงให้ */
export function mvIso(m: StockMovement): string {
  if (m.at) return m.at;
  const s = m.date ?? "";
  const mt = s.match(/(\d{1,2})\s+(\S+)\.?\s*(?:(\d{4})\s*)?(?:(\d{1,2}):(\d{2}))?/);
  const now = new Date();
  if (!mt) return now.toISOString();
  const mon = THAI_MONTH[mt[2].endsWith(".") ? mt[2] : `${mt[2]}.`] ?? THAI_MONTH[mt[2]] ?? now.getMonth();
  const yBE = mt[3] ? Number(mt[3]) : 0;
  const year = yBE > 2400 ? yBE - 543 : yBE || now.getFullYear();
  return new Date(year, mon, Number(mt[1]), Number(mt[4] ?? 9), Number(mt[5] ?? 0)).toISOString();
}

export interface StockCardRow {
  key: string;
  at: string;
  dept: string;
  docNo: string;
  lot: string;
  expiry?: string;
  price: number;
  dir: "IN" | "OUT";
  qty: number;
  unit: string;
  warehouse?: string;
  patient?: string;
  note?: string;
  balance: number;
}

/** ป้ายหน่วยงานของ movement — แยกตามที่มาตาม journey ของระบบ */
function deptOf(m: StockMovement): { dept: string; docNo: string } {
  const isPo = /^PO-/i.test(m.ref || "");
  if (m.type === "in")
    return isPo
      ? { dept: `รับตามใบสั่งซื้อ${m.supplier ? ` · ${m.supplier}` : ""}`, docNo: m.ref }
      : { dept: `รับเข้าไม่มีใบสั่งซื้อ${m.supplier ? ` · ${m.supplier}` : ""}`, docNo: m.ref || "—" };
  if (m.type === "adjust")
    return { dept: m.qty >= 0 ? "ปรับยอดรับเข้า" : "ปรับยอดจ่ายออก", docNo: m.ref || "—" };
  return { dept: `ตัด manual${m.note ? ` · ${m.note}` : ""}`, docNo: m.ref || "—" };
}

export function buildStockCard(
  product: StockProduct,
  movements: StockMovement[],
  ledger: StockLedgerEntry[],
  warehouse?: string,
): StockCardRow[] {
  const raw: Omit<StockCardRow, "balance">[] = [];

  movements.filter(m => m.productId === product.id).forEach(m => {
    const { dept, docNo } = deptOf(m);
    const dir: "IN" | "OUT" = m.type === "in" ? "IN" : m.type === "out" ? "OUT" : (m.qty >= 0 ? "IN" : "OUT");
    raw.push({
      key: `mv-${m.id}`, at: mvIso(m), dept, docNo, lot: m.lot || "", expiry: m.expiry,
      price: m.costPerUnit, dir, qty: Math.abs(m.qty), unit: product.unit,
      warehouse: m.warehouse, note: m.note,
    });
  });

  ledger.filter(l => l.productId === product.id).forEach(l => {
    raw.push({
      key: l.id, at: l.date, dept: l.dept, docNo: l.docNo || "—", lot: l.lot || "",
      expiry: l.expiry, price: l.price, dir: l.kind === "in" ? "IN" : "OUT",
      qty: Math.abs(l.qty), unit: l.unit || product.unit,
      warehouse: l.warehouse, patient: l.patient, note: l.note,
    });
  });

  /* โหมดหน่วยจ่าย — เอาเฉพาะบรรทัดที่เกิดในหน่วยจ่ายนั้น */
  /* รายการเก่าที่ยังไม่ได้ผูกคลัง ถือว่าอยู่คลังหลัก (PO รับเข้าคลังหลักเป็นค่าเริ่มต้น) */
  const rows = warehouse ? raw.filter(r => (r.warehouse ?? "main") === warehouse) : raw;
  rows.sort((a, b) => a.at.localeCompare(b.at) || a.key.localeCompare(b.key));

  /* เดินยอดถอยหลังจากยอดจริง → บรรทัดสุดท้าย = คงเหลือจริงพอดี */
  const closing = warehouse ? (stockByWarehouse(product)[warehouse] ?? 0) : product.stock;
  const net = rows.reduce((s, r) => s + (r.dir === "IN" ? r.qty : -r.qty), 0);

  /* คลังหลักรับของเข้ามาแล้วกระจายต่อไปคลังย่อย ยอดที่ถืออยู่จึงน้อยกว่าที่รับเข้า
     ถ้าเดินถอยหลังแล้วยอดยกมาติดลบ = มีการโอนออกที่ยังไม่มีบรรทัดรองรับ
     จึงตั้งยอดยกมาที่ 0 แล้วเติมบรรทัด "โอนย้ายไปคลังย่อย" ปิดส่วนต่างให้เห็นชัด ๆ
     แทนที่จะโชว์ยอดติดลบซึ่งอ่านแล้วเหมือนระบบพัง */
  const backSolved = closing - net;
  const opening = warehouse && backSolved < 0 ? 0 : backSolved;

  let running = opening;
  const out: StockCardRow[] = rows.map(r => {
    running += r.dir === "IN" ? r.qty : -r.qty;
    return { ...r, balance: running };
  });

  if (running !== closing) {
    const diff = running - closing;
    out.push({
      key: `transfer-${warehouse ?? "all"}`,
      at: out.length ? out[out.length - 1].at : new Date().toISOString(),
      dept: diff > 0 ? "โอนย้ายไปคลังย่อย" : "รับโอนจากคลังหลัก",
      docNo: "TRF-AUTO", lot: "", price: product.costPrice,
      dir: diff > 0 ? "OUT" : "IN", qty: Math.abs(diff), unit: product.unit,
      warehouse, balance: closing,
    });
  }
  return out;
}

/** รวมบรรทัดจ่ายยาให้ผู้ป่วยที่เกิดวันเดียวกัน+ล็อตเดียวกัน เป็นบรรทัดเดียว */
export function groupRxByDay(rows: StockCardRow[]): StockCardRow[] {
  const out: StockCardRow[] = [];
  const bucket = new Map<string, StockCardRow & { n: number }>();
  rows.forEach(r => {
    const isRx = r.dept.includes("ใบสั่งยา");
    if (!isRx) { out.push(r); return; }
    const k = `${r.at.slice(0, 10)}|${r.lot}|${r.price}`;
    const cur = bucket.get(k);
    if (cur) { cur.qty += r.qty; cur.n += 1; cur.balance = r.balance; cur.docNo = `${cur.n} ใบสั่งยา`; }
    else { const nr = { ...r, n: 1 }; bucket.set(k, nr); out.push(nr); }
  });
  return out;
}

export function StockCardModal({ open, product, movements, ledger, warehouse, onClose }: {
  open: boolean;
  product: StockProduct | null;
  movements: StockMovement[];
  ledger: StockLedgerEntry[];
  /** ล็อกไว้ที่หน่วยจ่ายเดียว (หน้าคลังแยกหน่วยจ่าย) — ไม่ส่ง = เลือกเองได้ */
  warehouse?: string;
  onClose: () => void;
}) {
  const today = new Date();
  const ago = new Date(); ago.setMonth(ago.getMonth() - 6);
  const [from, setFrom] = useState(ago.toISOString().slice(0, 10));
  const [to, setTo]     = useState(today.toISOString().slice(0, 10));
  const [wh, setWh]     = useState(warehouse ?? "");        // "" = ทุกหน่วยจ่าย
  const [groupRx, setGroupRx] = useState(true);
  const [showAdjust, setShowAdjust] = useState(true);

  const scope = warehouse ?? (wh || undefined);
  const all = useMemo(
    () => product ? buildStockCard(product, movements, ledger, scope) : [],
    [product, movements, ledger, scope],
  );
  const view = useMemo(() => {
    const lo = `${from}T00:00`, hi = `${to}T23:59`;
    let rows = all.filter(r => r.at >= lo && r.at <= hi);
    if (!showAdjust) rows = rows.filter(r => !r.dept.startsWith("ปรับยอด"));
    return groupRx ? groupRxByDay(rows) : rows;
  }, [all, from, to, groupRx, showAdjust]);

  if (!product) return null;
  const whInfo = scope ? warehouseByKey(scope) : null;

  const before = all.filter(r => r.at < `${from}T00:00`);
  const opening = before.length ? before[before.length - 1].balance
    : (all.length ? all[0].balance - (all[0].dir === "IN" ? all[0].qty : -all[0].qty)
                  : (scope ? (stockByWarehouse(product)[scope] ?? 0) : product.stock));
  const sumIn  = view.filter(r => r.dir === "IN").reduce((s, r) => s + r.qty, 0);
  const sumOut = view.filter(r => r.dir === "OUT").reduce((s, r) => s + r.qty, 0);
  const valIn  = view.filter(r => r.dir === "IN").reduce((s, r) => s + r.qty * r.price, 0);
  const valOut = view.filter(r => r.dir === "OUT").reduce((s, r) => s + r.qty * r.price, 0);
  const closing = view.length ? view[view.length - 1].balance : opening;

  const fmtD = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };
  const fmtDT = (iso: string) => {
    const d = new Date(iso);
    return `${fmtD(iso)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const money = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCsv = () => {
    const head = ["ลำดับ", "วันที่", "หน่วยงาน", "เลขเอกสาร", "Lot.No.", "วันหมดอายุ", "ราคา", "ประเภท", "จำนวนรับ", "มูลค่ารับ", "จำนวนจ่าย", "มูลค่าจ่าย", "คงเหลือ", "หน่วย"];
    const body = view.map((r, i) => [
      i + 1, fmtDT(r.at), r.dept, r.docNo, r.lot || "—", fmtD(r.expiry), r.price, r.dir,
      r.dir === "IN" ? r.qty : 0, r.dir === "IN" ? (r.qty * r.price).toFixed(2) : 0,
      r.dir === "OUT" ? r.qty : 0, r.dir === "OUT" ? (r.qty * r.price).toFixed(2) : 0,
      r.balance, r.unit,
    ]);
    const csv = "﻿" + [head, ...body].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `stock-card-${product.code}${scope ? `-${scope}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const TILES = [
    { label: "ยอดยกมา", value: opening, sub: product.unit, color: "#6b7280" },
    { label: "รับเข้า",  value: sumIn,  sub: `฿${money(valIn)}`,  color: "#16a34a" },
    { label: "จ่ายออก",  value: sumOut, sub: `฿${money(valOut)}`, color: "#c2410c" },
    { label: "คงเหลือ",  value: closing, sub: product.unit, color: "var(--brand-dark)" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            /* ขนาดคงที่ — ไม่ยุบตามจำนวนแถว เพื่อให้ตารางไม่กระโดดตอนเปลี่ยนช่วงวันที่/หน่วยจ่าย */
            className="bg-white rounded-3xl w-full shadow-2xl flex flex-col overflow-hidden"
            style={{ maxWidth: "min(1360px, calc(100vw - 2rem))", height: "min(760px, calc(100vh - 2rem))" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="vet-modal-header flex items-center gap-3 flex-shrink-0">
              <div className="vet-modal-header-icon"><ClipboardList className="w-5 h-5 text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>
                  Stock Card · {product.name}
                  {whInfo && <span className="ml-2 text-[12px] px-2 py-0.5 rounded-full align-middle" style={{ background: `color-mix(in srgb, ${whInfo.color} 12%, transparent)`, color: whInfo.color, fontWeight: 700 }}>{whInfo.label}</span>}
                </h3>
                <p className="text-[11px] text-gray-500">{product.code} · {product.categoryEmoji} {product.category} · หน่วย {product.unit}</p>
              </div>
              <button onClick={exportCsv} className="vet-btn vet-btn-secondary vet-btn-sm inline-flex items-center gap-1.5"><FileDown className="w-3.5 h-3.5" /> Excel</button>
              <button onClick={() => window.print()} className="vet-btn vet-btn-secondary vet-btn-sm inline-flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" /> พิมพ์เอกสาร</button>
              <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
            </div>

            {/* Toolbar */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap flex-shrink-0">
              <span className="text-[11.5px] text-gray-500" style={{ fontWeight: 600 }}>แสดงข้อมูล</span>
              <DateRangePickerModern startDate={from} endDate={to} onChange={(s, e) => { setFrom(s); setTo(e); }} variant="input" align="left" />
              {/* เลือกหน่วยจ่ายได้เฉพาะตอนเปิดจากหน้า Stock — เปิดจากหน้าคลังจะล็อกไว้แล้ว */}
              {!warehouse && (
                <select className="vet-select" style={{ width: 190, height: 38 }} value={wh} onChange={e => setWh(e.target.value)}>
                  <option value="">ทุกหน่วยจ่าย</option>
                  {WAREHOUSES.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
                </select>
              )}
              <label className="inline-flex items-center gap-1.5 text-[11.5px] text-gray-600 cursor-pointer ml-auto">
                <input type="checkbox" checked={showAdjust} onChange={e => setShowAdjust(e.target.checked)} className="accent-(--brand)" />
                แสดงรายการปรับยอด/ตรวจนับ
              </label>
              <label className="inline-flex items-center gap-1.5 text-[11.5px] text-gray-600 cursor-pointer">
                <input type="checkbox" checked={groupRx} onChange={e => setGroupRx(e.target.checked)} className="accent-(--brand)" />
                รวมกลุ่มรายการจ่ายยาให้ผู้ป่วยตามวันที่
              </label>
            </div>

            {/* สรุป */}
            <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
              {TILES.map(t => (
                <div key={t.label} className="rounded-xl bg-white border border-gray-100 px-3 py-2">
                  <p className="text-[10px] text-gray-400" style={{ fontWeight: 600 }}>{t.label}</p>
                  <p className="text-[17px] tabular-nums" style={{ fontWeight: 800, color: t.color }}>{t.value.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">{t.sub}</p>
                </div>
              ))}
            </div>

            {/* ตาราง — พื้นที่ที่เหลือทั้งหมด เลื่อนในตัวเอง (min-h-0 จำเป็นกับ flex child ที่ต้อง scroll) */}
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full min-w-[1080px]" style={{ fontSize: "calc(12.5px * var(--fs))" }}>
                {/* หัวตารางแบบเดียวกับหน้าจัดการ Stock / คลังแยกหน่วยจ่าย */}
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {["ลำดับ", "วันที่", "หน่วยงาน", "เลขเอกสาร", "Lot.No.", "วันหมดอายุ"].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 whitespace-nowrap">{h}</th>
                    ))}
                    <th className="text-right px-3 py-2.5 whitespace-nowrap">ราคา</th>
                    <th className="text-center px-3 py-2.5 whitespace-nowrap">ประเภท</th>
                    {["จำนวนรับ", "มูลค่ารับ", "จำนวนจ่าย", "มูลค่าจ่าย", "คงเหลือ"].map(h => (
                      <th key={h} className="text-right px-3 py-2.5 whitespace-nowrap">{h}</th>
                    ))}
                    <th className="text-center px-3 py-2.5">หน่วย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr style={{ background: "color-mix(in srgb, var(--brand) 4%, transparent)" }}>
                    <td className="px-3 py-2.5 text-gray-400">—</td>
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">ก่อน {fmtD(from)}</td>
                    <td className="px-3 py-2.5" colSpan={6} style={{ fontWeight: 700, color: "var(--brand-dark)" }}>ยอดยกมา</td>
                    <td colSpan={4} />
                    <td className="px-3 py-2.5 text-right tabular-nums" style={{ fontWeight: 800, color: "var(--brand-dark)" }}>{opening.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-center text-gray-400">{product.unit}</td>
                  </tr>
                  {view.map((r, i) => {
                    const isIn = r.dir === "IN";
                    return (
                      <tr key={r.key} className="transition-colors duration-150 hover:bg-[#f8fffe]">
                        <td className="px-3 py-2.5 text-gray-400 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{fmtDT(r.at)}</td>
                        <td className="px-3 py-2.5 max-w-[240px]" title={r.dept}>
                          <p className="text-gray-800 truncate" style={{ fontWeight: 600 }}>{r.dept}</p>
                          {r.patient && <p className="text-gray-400 truncate text-[10.5px]">{r.patient}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 font-mono text-[10.5px] whitespace-nowrap">{r.docNo}</td>
                        <td className="px-3 py-2.5 font-mono text-[10.5px] whitespace-nowrap" style={{ color: r.lot ? "var(--brand-dark)" : "#d1d5db", fontWeight: r.lot ? 700 : 400 }}>{r.lot || "—"}</td>
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{fmtD(r.expiry)}</td>
                        <td className="px-3 py-2.5 text-gray-600 text-right tabular-nums">{r.price.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] tracking-wide" style={{
                            fontWeight: 800,
                            background: isIn ? "rgba(22,163,74,0.10)" : "rgba(194,65,12,0.10)",
                            color: isIn ? "#16a34a" : "#c2410c",
                            border: `1px solid ${isIn ? "rgba(22,163,74,0.22)" : "rgba(194,65,12,0.22)"}`,
                          }}>{r.dir}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums" style={{ fontWeight: isIn ? 700 : 400, color: isIn ? "#16a34a" : "#d1d5db" }}>{isIn ? r.qty.toLocaleString() : 0}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">{isIn ? money(r.qty * r.price) : "0"}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums" style={{ fontWeight: !isIn ? 700 : 400, color: !isIn ? "#c2410c" : "#d1d5db" }}>{!isIn ? r.qty.toLocaleString() : 0}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">{!isIn ? money(r.qty * r.price) : "0"}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-[#1e2939]" style={{ fontWeight: 700 }}>{r.balance.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-center text-gray-400">{r.unit}</td>
                      </tr>
                    );
                  })}
                  {view.length === 0 && (
                    <tr><td colSpan={14} className="text-center text-gray-400 py-12" style={{ fontSize: "calc(12.5px * var(--fs))" }}>
                      ไม่มีความเคลื่อนไหว{whInfo ? `ของ${whInfo.label}` : ""}ในช่วงวันที่ที่เลือก
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 gap-3 flex-shrink-0">
              <span>{view.length} รายการ · ยอดคงเหลือปิดงวด <span className="text-gray-900" style={{ fontWeight: 800 }}>{closing.toLocaleString()} {product.unit}</span></span>
              <span className="text-right">
                {whInfo
                  ? `แสดงเฉพาะรายการที่เกิดใน${whInfo.label} · ยอดปิด = คงเหลือของหน่วยจ่ายนี้`
                  : "ยอดคงเหลือเดินถอยหลังจากยอดจริงในระบบ · บรรทัดสุดท้าย = สต็อกปัจจุบัน"}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
