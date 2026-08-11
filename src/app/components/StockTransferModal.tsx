/* ─────────────────────────────────────────────────────────────
   โอนสินค้าให้หน่วยจ่าย (Store Room → Store Room)

   สองป๊อบอัพซ้อนกัน ไม่ใช่กล่องเดียวสลับเนื้อใน
     ทะเบียน — ใบโอนที่ผ่านมา กรองตามคลังต้นทางและช่วงวันที่
     ฟอร์ม   — ออกใบใหม่/แก้ใบเดิม เปิดทับทะเบียนอีกชั้น

   ที่ต้องแยกกล่อง เพราะถ้าสลับเนื้อในกล่องเดียว ปุ่มปิด/ยกเลิกจะพา
   ปิดทั้งหมดทีเดียว คนใช้ที่แค่อยากเลิกกรอกใบนี้จะหลุดออกจากทะเบียนไปด้วย
   แยกกล่องแล้วปิดฟอร์ม = ทะเบียนยังอยู่ที่เดิม
   ───────────────────────────────────────────────────────────── */
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, ArrowRightLeft, Plus, Trash2, ChevronDown,
  Search, FileText, ArrowRight,
} from "lucide-react";
import { DatePickerModern } from "./DatePickerModern";
import { WAREHOUSES, warehouseByKey } from "../config/warehouses";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { fmtThaiDate } from "../utils/format";
import {
  listTransfers, saveTransfer, deleteTransfer, transferValue, nextDocNo,
  TRANSFER_REASONS, type StockTransfer, type TransferLine,
} from "../lib/stockTransfers";

export interface TransferProduct {
  id: number; name: string; unit: string; stock: number; costPrice: number;
  units?: { name: string; qty: number; standard: boolean }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  products: TransferProduct[];
  /** ใบโอนที่บันทึก/แก้/ลบ — หน้า Stock เอาไปลง movement คู่ออก-เข้า */
  onCommit: (t: StockTransfer, prev?: StockTransfer) => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const baht = (n: number) => `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const whName = (k: string) => warehouseByKey(k)?.label ?? k;

let seq = 0;
const newLine = (): TransferLine => ({ key: `t${++seq}`, productId: "", qty: "1", packUnit: "", packSize: 1, costPerUnit: "" });

const inputCls = "vet-input";
const labelCls = "vet-label";

export function StockTransferModal({ open, onClose, products, onCommit }: Props) {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();

  const [view, setView] = useState<"list" | "form">("list");
  const [rows, setRows] = useState<StockTransfer[]>([]);
  const [editing, setEditing] = useState<StockTransfer | null>(null);

  /* ── ตัวกรองทะเบียน ── */
  const [fFrom, setFFrom]   = useState("all");
  const [fStart, setFStart] = useState("");
  const [fEnd, setFEnd]     = useState("");
  const [search, setSearch] = useState("");

  /* ── ฟอร์ม ── */
  const [fromWh, setFromWh] = useState(WAREHOUSES[0].key);
  const [toWh, setToWh]     = useState(WAREHOUSES[1]?.key ?? WAREHOUSES[0].key);
  const [date, setDate]     = useState(todayStr());
  const [reason, setReason] = useState(TRANSFER_REASONS[0]);
  const [note, setNote]     = useState("");
  const [lines, setLines]   = useState<TransferLine[]>([newLine()]);

  const reload = () => setRows(listTransfers());
  useEffect(() => { if (open) { reload(); setView("list"); } }, [open]);

  /* เข้าฟอร์ม — ใบใหม่ส่ง null, แก้ใบเดิมส่งใบนั้นมา */
  const openForm = (t: StockTransfer | null) => {
    setEditing(t);
    setFromWh(t?.fromWh ?? WAREHOUSES[0].key);
    setToWh(t?.toWh ?? (WAREHOUSES[1]?.key ?? WAREHOUSES[0].key));
    setDate(t?.date ?? todayStr());
    setReason(t?.reason ?? TRANSFER_REASONS[0]);
    setNote(t?.note ?? "");
    setLines(t?.items.length
      ? t.items.map(it => ({
          key: `t${++seq}`, productId: it.productId, qty: String(it.packQty),
          packUnit: it.packUnit, packSize: it.packQty ? it.stockQty / it.packQty : 1,
          costPerUnit: String(it.costPerUnit),
        }))
      : [newLine()]);
    setView("form");
  };

  /* ── ตัวช่วยของฟอร์ม ── */
  const productOf = (id: number | "") => products.find(p => p.id === Number(id));
  const packsOf = (p?: TransferProduct) =>
    p?.units?.length ? p.units.map(u => ({ name: u.name, size: u.qty || 1 })) : [{ name: p?.unit ?? "ชิ้น", size: 1 }];

  const patch = (key: string, v: Partial<TransferLine>) =>
    setLines(ls => ls.map(l => (l.key === key ? { ...l, ...v } : l)));
  const addLine = () => setLines(ls => [...ls, newLine()]);
  const delLine = (key: string) => setLines(ls => (ls.length <= 1 ? ls : ls.filter(l => l.key !== key)));

  /* เลือกสินค้าแล้วเติมหน่วยและราคาทุนให้เลย — ส่วนใหญ่ใช้ค่านี้ ไม่ต้องกรอกซ้ำ */
  const pickProduct = (key: string, id: number | "") => {
    const p = productOf(id);
    const pack = packsOf(p)[0];
    patch(key, { productId: id, packUnit: pack.name, packSize: pack.size, costPerUnit: String(p?.costPrice ?? "") });
  };

  const stockQtyOf = (l: TransferLine) => (Number(l.qty) || 0) * (l.packSize || 1);
  const lineTotal  = (l: TransferLine) => stockQtyOf(l) * (Number(l.costPerUnit) || 0);
  const filled = lines.filter(l => l.productId !== "" && Number(l.qty) > 0);
  const grand  = filled.reduce((s, l) => s + lineTotal(l), 0);

  /* สินค้าตัวเดียวกันสองบรรทัดจะตัดสต็อกสองรอบ ยอดถูกแต่ไล่ที่มายาก */
  const dupIds = filled.map(l => Number(l.productId)).filter((id, i, a) => a.indexOf(id) !== i);
  const sameWh = fromWh === toWh;   // โอนเข้าคลังเดิม = เอกสารลวง
  const canSave = filled.length > 0 && dupIds.length === 0 && !sameWh;

  const submit = () => {
    if (!canSave) return;
    const t: StockTransfer = {
      id: editing?.id ?? `tf${Date.now()}`,
      docNo: editing?.docNo ?? nextDocNo(),
      fromWh, toWh, date, reason, note,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      items: filled.map(l => {
        const p = productOf(l.productId)!;
        return {
          productId: p.id, productName: p.name,
          stockQty: stockQtyOf(l), stockUnit: p.unit,
          packQty: Number(l.qty), packUnit: l.packUnit || p.unit,
          costPerUnit: Number(l.costPerUnit) || 0,
        };
      }),
    };
    saveTransfer(t);
    onCommit(t, editing ?? undefined);
    reload();
    setView("list");
    showSnackbar("success", editing
      ? `แก้ไขใบโอน ${t.docNo} เรียบร้อย`
      : `โอน ${t.items.length} รายการ → ${whName(toWh)} เรียบร้อย`);
  };

  const removeTransfer = async (t: StockTransfer) => {
    const ok = await confirm({
      title: "ลบใบโอน",
      description: `ลบ ${t.docNo} (${t.items.length} รายการ) — ระบบจะคืนยอดคงเหลือกลับให้คลังต้นทาง`,
      confirmLabel: "ลบ", kind: "danger",
    });
    if (!ok) return;
    deleteTransfer(t.id);
    onCommit({ ...t, items: [] }, t);   // ใบเปล่า = คืนผลกระทบของใบเดิมทั้งหมด
    reload();
    setView("list");
    showSnackbar("delete", `ลบใบโอน ${t.docNo} แล้ว`);
  };

  /* ── ทะเบียน ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(t => {
      if (fFrom !== "all" && t.fromWh !== fFrom) return false;
      if (fStart && t.date < fStart) return false;
      if (fEnd && t.date > fEnd) return false;
      if (!q) return true;
      return t.docNo.toLowerCase().includes(q)
        || t.reason.toLowerCase().includes(q)
        || t.items.some(i => i.productName.toLowerCase().includes(q));
    });
  }, [rows, fFrom, fStart, fEnd, search]);

  const totalValue = filtered.reduce((s, t) => s + transferValue(t), 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              /* ขนาดคงที่ — ทะเบียนมีกี่แถวก็ตาม กล่องไม่ยืดหด */
              className="w-full max-w-[980px] vet-modal overflow-hidden"
              style={{ height: "min(760px, calc(100vh - 2rem))" }}>

              {/* ── หัว ── */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="vet-modal-header-icon"><ArrowRightLeft className="w-[20px] h-[20px] text-white" /></div>
                    <div className="min-w-0">
                      <h2 className="vet-section-title truncate">ทะเบียนโอนสินค้าหน่วยจ่าย</h2>
                      <p className="vet-tiny mt-[2px] truncate">{filtered.length} ใบ · มูลค่ารวม {baht(totalValue)}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-[16px] h-[16px] text-gray-500" /></button>
                </div>
              </div>

              <div className="vet-modal-body">
                {/* ═══════════ ทะเบียน ═══════════ */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className={labelCls}>Store Room ต้นทาง</label>
                      <div className="relative">
                        <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} value={fFrom} onChange={e => setFFrom(e.target.value)}>
                          <option value="all">ทุกคลัง</option>
                          {WAREHOUSES.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>ตั้งแต่วันที่</label>
                      <DatePickerModern value={fStart} onChange={setFStart} placeholder="ไม่จำกัด" />
                    </div>
                    <div>
                      <label className={labelCls}>ถึงวันที่</label>
                      <DatePickerModern value={fEnd} onChange={setFEnd} placeholder="ไม่จำกัด" />
                    </div>
                    <div>
                      <label className={labelCls}>ค้นหา</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input className={inputCls} style={{ paddingLeft: 34 }} value={search}
                          onChange={e => setSearch(e.target.value)} placeholder="เลขที่ / สินค้า / สาเหตุ" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] text-[12.5px]">
                        <thead>
                          <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            <th className="text-left px-3 py-3" style={{ width: 110 }}>เลขที่</th>
                            <th className="text-left px-3 py-3">Store Room</th>
                            <th className="text-left px-3 py-3" style={{ width: 140 }}>วันที่รับสินค้า</th>
                            <th className="text-left px-3 py-3" style={{ width: 170 }}>สาเหตุ</th>
                            <th className="text-left px-3 py-3">หมายเหตุ</th>
                            <th className="text-right px-3 py-3" style={{ width: 130 }}>รายละเอียด</th>
                            <th className="px-3 py-3" style={{ width: 84 }} />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center text-gray-400 py-12">
                              ยังไม่มีใบโอนในช่วงที่เลือก — กด “เพิ่มรายการ”
                            </td></tr>
                          ) : filtered.map(t => (
                            /* กดทั้งแถวเข้าแก้ไขได้ ไม่ต้องเล็งปุ่มไอคอน */
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openForm(t)}>
                              <td className="px-3 py-2.5 font-mono text-[11.5px] text-gray-500">{t.docNo}</td>
                              <td className="px-3 py-2.5">
                                <span className="inline-flex items-center gap-1.5 text-gray-800" style={{ fontWeight: 600 }}>
                                  {whName(t.fromWh)}
                                  <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                  {whName(t.toWh)}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-gray-600">{fmtThaiDate(t.date)}</td>
                              <td className="px-3 py-2.5 text-gray-600 truncate">{t.reason}</td>
                              <td className="px-3 py-2.5 text-gray-500 truncate">{t.note || <span className="text-gray-300">—</span>}</td>
                              <td className="px-3 py-2.5 text-right text-gray-700">
                                {t.items.length} รายการ
                                <span className="block text-[10.5px] text-gray-400">{baht(transferValue(t))}</span>
                              </td>
                              <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                                <div className="flex gap-1 justify-end">
                                  <button onClick={() => openForm(t)} title="แก้ไขรายการ"
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><FileText className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => removeTransfer(t)} title="ลบ"
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ท้ายของทะเบียน ── */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ปิด</button>
                <button onClick={() => openForm(null)} className="vet-btn vet-btn-primary btn-green">
                  <Plus className="w-[16px] h-[16px]" /> เพิ่มรายการ
                </button>
              </div>
            </motion.div>
          </div>

          {/* ═══════════ ป๊อบอัพชั้นบน — ฟอร์มออกใบโอน ═══════════
              z สูงกว่าทะเบียน และปิดตัวเองอย่างเดียว ทะเบียนข้างหลังยังอยู่ */}
          <AnimatePresence>
            {view === "form" && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }} className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-[60]"
                  onClick={() => setView("list")} />
                <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ type: "spring", damping: 28, stiffness: 320 }}
                    className="w-full max-w-[940px] vet-modal overflow-hidden"
                    style={{ height: "min(760px, calc(100vh - 2rem))" }}>

                    <div className="vet-modal-header rounded-t-3xl">
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="vet-modal-header-icon"><ArrowRightLeft className="w-[20px] h-[20px] text-white" /></div>
                          <div className="min-w-0">
                            <h2 className="vet-section-title truncate">
                              {editing ? `แก้ไขใบโอน ${editing.docNo}` : "โอนสินค้าให้หน่วยจ่าย"}
                            </h2>
                            <p className="vet-tiny mt-[2px] truncate">ย้ายของระหว่าง Store Room — ใส่ได้หลายรายการต่อใบ</p>
                          </div>
                        </div>
                        <button onClick={() => setView("list")} className="vet-modal-close" title="ปิดฟอร์ม (ทะเบียนยังเปิดอยู่)">
                          <X className="w-[16px] h-[16px] text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="vet-modal-body">
                          <div className="space-y-3.5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}>Store Room ต้นทาง <span className="required">*</span></label>
                                <div className="relative">
                                  <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} value={fromWh} onChange={e => setFromWh(e.target.value)}>
                                    {WAREHOUSES.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                              </div>
                              <div>
                                <label className={labelCls}>ไปยัง Store Room ปลายทาง <span className="required">*</span></label>
                                <div className="relative">
                                  <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} value={toWh} onChange={e => setToWh(e.target.value)}
                                    style={sameWh ? { borderColor: "rgba(239,68,68,0.45)" } : undefined}>
                                    {WAREHOUSES.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                {sameWh && <p className="text-[10.5px] mt-1" style={{ color: "#dc2626", fontWeight: 600 }}>ต้นทางกับปลายทางต้องคนละคลัง</p>}
                              </div>
                              <div>
                                <label className={labelCls}>วันที่รับสินค้า</label>
                                <DatePickerModern value={date} onChange={setDate} />
                              </div>
                              <div>
                                <label className={labelCls}>สาเหตุ</label>
                                <div className="relative">
                                  <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} value={reason} onChange={e => setReason(e.target.value)}>
                                    {TRANSFER_REASONS.map(r => <option key={r}>{r}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>

                            {/* ── รายการสินค้า ── */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] uppercase tracking-wider text-gray-400" style={{ fontWeight: 700 }}>รายการสินค้า</p>
                                <button type="button" onClick={addLine}
                                  className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-full transition-colors"
                                  style={{ background: "color-mix(in srgb, var(--brand) 8%, transparent)", color: "var(--brand-dark)", border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)", fontWeight: 600 }}>
                                  <Plus className="w-3 h-3" strokeWidth={2.6} /> เพิ่มสินค้า
                                </button>
                              </div>

                              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full min-w-[820px]">
                                    <thead>
                                      <tr className="bg-gray-50 border-b border-gray-100">
                                        {["สินค้า", "จำนวน", "หน่วยบรรจุ", "หน่วยจ่าย (Stock)", "คงเหลือต้นทาง", "ราคาทุน/หน่วย", "รวม", ""].map(h => (
                                          <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap"
                                            style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {lines.map(l => {
                                        const p = productOf(l.productId);
                                        const packs = packsOf(p);
                                        const dup = l.productId !== "" && dupIds.includes(Number(l.productId));
                                        const short = !!p && stockQtyOf(l) > p.stock;
                                        return (
                                          <tr key={l.key} style={dup || short ? { background: "rgba(239,68,68,0.03)" } : undefined}>
                                            <td className="px-3 py-2" style={{ minWidth: 220 }}>
                                              <div className="relative">
                                                <select className={`${inputCls} appearance-none pr-8 cursor-pointer`} style={{ height: 36 }}
                                                  value={l.productId} onChange={e => pickProduct(l.key, e.target.value === "" ? "" : Number(e.target.value))}>
                                                  <option value="">— เลือกสินค้า —</option>
                                                  {products.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                              </div>
                                              {dup && <p className="text-[10px] mt-1" style={{ color: "#dc2626", fontWeight: 600 }}>สินค้าซ้ำกับอีกบรรทัด</p>}
                                            </td>
                                            <td className="px-3 py-2" style={{ width: 110 }}>
                                              <input type="number" min={1} className={`${inputCls} no-spin text-center`} style={{ height: 36, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
                                                value={l.qty} onChange={e => patch(l.key, { qty: e.target.value })} />
                                            </td>
                                            <td className="px-3 py-2" style={{ width: 130 }}>
                                              <div className="relative">
                                                <select className={`${inputCls} appearance-none pr-8 cursor-pointer`} style={{ height: 36 }}
                                                  value={l.packUnit}
                                                  onChange={e => {
                                                    const pk = packs.find(x => x.name === e.target.value);
                                                    patch(l.key, { packUnit: e.target.value, packSize: pk?.size ?? 1 });
                                                  }}>
                                                  {packs.map(pk => <option key={pk.name}>{pk.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                              </div>
                                            </td>
                                            {/* หน่วยจ่ายจริง = จำนวน × ขนาดบรรจุ — คิดให้ กันคำนวณผิดตอนบรรจุใหญ่ */}
                                            <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ width: 130 }}>
                                              {p ? <span className="text-(--brand-dark)" style={{ fontWeight: 700 }}>{stockQtyOf(l).toLocaleString()} {p.unit}</span>
                                                 : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ width: 120 }}>
                                              {p ? <span style={{ color: short ? "#dc2626" : "#6b7280", fontWeight: short ? 700 : 500 }}>
                                                    {p.stock.toLocaleString()} {p.unit}{short && " · ไม่พอ"}
                                                  </span>
                                                 : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-3 py-2" style={{ width: 120 }}>
                                              <input type="number" min={0} className={`${inputCls} no-spin text-right`} style={{ height: 36 }}
                                                value={l.costPerUnit} onChange={e => patch(l.key, { costPerUnit: e.target.value })} placeholder="0" />
                                            </td>
                                            <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ width: 110, fontWeight: 700 }}>{baht(lineTotal(l))}</td>
                                            <td className="px-3 py-2 text-center" style={{ width: 44 }}>
                                              {lines.length > 1 && (
                                                <button type="button" onClick={() => delLine(l.key)} title="ลบรายการนี้"
                                                  className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50/70 border-t border-gray-100 text-[12.5px]">
                                  <span className="text-gray-500">{filled.length} รายการ · มูลค่าสินค้า</span>
                                  <span className="text-(--brand-dark)" style={{ fontWeight: 800, fontSize: 15 }}>{baht(grand)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className={labelCls}>หมายเหตุ</label>
                              <textarea className="vet-textarea" rows={2} value={note} onChange={e => setNote(e.target.value)}
                                placeholder="เช่น เบิกให้ห้องยา OPD รอบเช้า, ผู้รับของ..." />
                            </div>
                          </div>
                    </div>

                    <div className="vet-modal-footer rounded-b-3xl">
                      {editing && (
                        <button onClick={() => removeTransfer(editing)} className="vet-btn vet-btn-secondary mr-auto" style={{ color: "#dc2626" }}>
                          <Trash2 className="w-[15px] h-[15px]" /> ลบ
                        </button>
                      )}
                      <button onClick={() => setView("list")} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                      <button onClick={submit} disabled={!canSave} className="vet-btn vet-btn-primary btn-green">
                        <Check className="w-[16px] h-[16px]" /> บันทึก
                      </button>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
