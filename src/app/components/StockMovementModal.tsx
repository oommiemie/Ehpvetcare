import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, TrendingUp, TrendingDown, RefreshCw, Package, ChevronDown, Plus, Trash2, Search, ClipboardList } from "lucide-react";
import { DatePickerModern } from "./DatePickerModern";
import { TimePickerModern } from "./TimePickerModern";

type MovementType = "in" | "out" | "adjust";

/** แถวในทะเบียน — เอาเฉพาะฟิลด์ที่ต้องใช้ ไม่ผูกกับชนิดเต็มของหน้า Stock */
export interface HistoryRow {
  id: number;
  productId: number;
  productName: string;
  type: MovementType;
  qty: number;
  costPerUnit: number;
  date: string;
  ref: string;
  note: string;
  at?: string;
  warehouse?: string;
}

interface StockProduct {
  id: number;
  name: string;
  unit: string;
  stock: number;
  costPrice: number;
}

// ข้อมูล movement เดิมที่กำลังแก้ไข (ส่งมาจากหน้า Stock เพื่อ prefill)
export interface EditingMovement {
  id: number;
  productId: number;
  type: MovementType;
  qty: number;
  date?: string;   // YYYY-MM-DD (ถ้าแปลงได้)
  time?: string;   // HH:MM
  reason?: string;
  note?: string;
}

/* 1 บรรทัดสินค้าในการบันทึกครั้งนี้
   งานจริงรับของทีเดียวหลายตัว ตรวจนับก็ปรับหลายตัวพร้อมกัน
   บังคับให้เปิดโมดัลใหม่ทีละตัวคือเสียเวลาและเสี่ยงลืมกรอกบางตัว */
interface MovementLine {
  key: string;
  productId: number | "";
  qty: string;
}

interface MovementFormData {
  /* วันที่ เวลา สาเหตุ ผู้บันทึก หมายเหตุ ใช้ร่วมกันทั้งชุด
     เพราะเป็นเอกสารใบเดียวกัน — แยกรายบรรทัดจะกรอกซ้ำโดยไม่จำเป็น */
  type: MovementType;
  lines: MovementLine[];
  date: string;
  time: string;
  reason: string;
  recordedBy: string;
  note: string;
}

export interface MovementPayload {
  productId: number;
  productName: string;
  type: MovementType;
  qty: number;
  costPerUnit: number;
  date: string;
  ref: string;
  supplier: string;
  lot: string;
  note: string;
}

interface StockMovementModalProps {
  open: boolean;
  onClose: () => void;
  /** ได้เป็นชุด — 1 ครั้งบันทึกได้หลายรายการ (โหมดแก้ไขจะมีใบเดียวเสมอ) */
  onSave: (rows: MovementPayload[]) => void;
  products: StockProduct[];
  /** ความเคลื่อนไหวทั้งหมด — ใช้ทำทะเบียนย้อนหลังในแท็บที่สอง */
  movements?: HistoryRow[];
  /** movement เดิมที่กำลังแก้ไข — ถ้ามี โมดัลจะ prefill ค่าและ onSave จะหมายถึงการอัปเดต */
  editing?: EditingMovement | null;
}

const REASONS: Record<MovementType, string[]> = {
  in:     ["รับสินค้าจาก Supplier", "รับจาก PO", "โอนย้ายจากสาขา", "คืนสินค้าจากลูกค้า", "อื่นๆ"],
  out:    ["ขาย POS", "ใช้ภายใน", "โอนย้ายไปสาขา", "สินค้าเสียหาย/หมดอายุ", "อื่นๆ"],
  adjust: ["ตรวจนับสต็อก", "ปรับยอดคลัง", "แก้ไขข้อผิดพลาด", "อื่นๆ"],
};

const STAFF = ["สมใจ ใจดี", "นายแพทย์ วิชัย", "พยาบาล สุดา", "ผู้ดูแลระบบ"];

/* color = สีหลักของประเภท (เส้น/ไอคอน) · ink = สีตัวอักษรบนพื้นจาง
   แยกกันเพราะสีหลักบางตัวอ่อนเกินไปเมื่อวางบนพื้น 10% อ่านไม่ออก */
const TABS: { type: MovementType; label: string; icon: React.ElementType; color: string; ink: string; bg: string }[] = [
  { type: "in",     label: "รับเข้า",  icon: TrendingUp,   color: "var(--brand)", ink: "var(--brand-dark)", bg: "color-mix(in srgb, var(--brand) 10%, transparent)"  },
  { type: "out",    label: "จ่ายออก", icon: TrendingDown,  color: "#ef4444",      ink: "#b91c1c",           bg: "rgba(239,68,68,0.10)"   },
  { type: "adjust", label: "ปรับยอด", icon: RefreshCw,     color: "#f59e0b",      ink: "#b45309",           bg: "rgba(245,158,11,0.12)"  },
];

const todayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};
const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

let lineSeq = 0;
const newLine = (): MovementLine => ({ key: `l${++lineSeq}`, productId: "", qty: "" });

const emptyForm = (): MovementFormData => ({
  type: "in",
  lines: [newLine()],
  date: todayStr(),
  time: nowTime(),
  reason: REASONS["in"][0],
  recordedBy: STAFF[0],
  note: "",
});

const inputCls = "vet-input";
const labelCls = "vet-label";

const formFromEditing = (e: EditingMovement): MovementFormData => ({
  type: e.type,
  // adjust เก็บค่าติดลบได้ (บวก=เพิ่ม ลบ=ลด) จึงคงเครื่องหมายไว้; in/out ใช้ค่าสัมบูรณ์
  lines: [{ key: "edit", productId: e.productId, qty: String(e.type === "adjust" ? e.qty : Math.abs(e.qty)) }],
  date: e.date || todayStr(),
  time: e.time || nowTime(),
  reason: e.reason && REASONS[e.type].includes(e.reason) ? e.reason : REASONS[e.type][0],
  recordedBy: STAFF[0],
  note: e.note || "",
});

export function StockMovementModal({ open, onClose, onSave, products, movements = [], editing }: StockMovementModalProps) {
  const [form, setForm] = useState<MovementFormData>(emptyForm());
  /* บันทึกใหม่ / ทะเบียนย้อนหลัง — แท็บชั้นบนแบบเดียวกับโมดัลใบสั่งซื้อ */
  const [mode, setMode] = useState<"entry" | "history">("entry");

  /* ตัวกรองทะเบียน — ตั้งต้นย้อนหลัง 1 เดือน เพราะงานประจำวันดูแค่รอบเดือน
     อยากดูไกลกว่านั้นค่อยเลื่อนวันเอง */
  const [hType, setHType]   = useState<"all" | MovementType>("all");
  const [hStart, setHStart] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [hEnd, setHEnd]     = useState(todayStr());
  const [hSearch, setHSearch] = useState("");

  /* วันที่ของ movement เก็บเป็นข้อความไทย ("6 ก.ค. 10:30") เรียง/กรองไม่ได้
     ใช้ at (ISO) เป็นหลัก ถ้าไม่มีถือว่าอยู่นอกช่วงกรอง */
  const isoOf = (m: HistoryRow) => (m.at ? m.at.slice(0, 10) : "");

  const history = useMemo(() => {
    const q = hSearch.trim().toLowerCase();
    return movements
      .filter(m => {
        if (hType !== "all" && m.type !== hType) return false;
        const d = isoOf(m);
        if (hStart && (!d || d < hStart)) return false;
        if (hEnd && (!d || d > hEnd)) return false;
        if (!q) return true;
        return m.productName.toLowerCase().includes(q)
          || (m.ref ?? "").toLowerCase().includes(q)
          || (m.note ?? "").toLowerCase().includes(q);
      })
      .sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
  }, [movements, hType, hStart, hEnd, hSearch]);

  /* นับ "ใบ" ตามเลขอ้างอิง — บันทึกครั้งเดียวหลายรายการใช้ ref เดียวกัน
     ถ้านับเป็นแถวจะได้ตัวเลขเฟ้อกว่าจำนวนเอกสารจริง */
  const docStats = useMemo(() => {
    const byType: Record<MovementType, Set<string>> = { in: new Set(), out: new Set(), adjust: new Set() };
    const qtyByType: Record<MovementType, number> = { in: 0, out: 0, adjust: 0 };
    for (const m of history) {
      byType[m.type].add(m.ref || `#${m.id}`);
      qtyByType[m.type] += Math.abs(m.qty);
    }
    return { byType, qtyByType };
  }, [history]);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? formFromEditing(editing) : emptyForm());
    /* แก้ไขรายการเดิมต้องเด้งเข้าฟอร์มเสมอ ไม่ให้ค้างที่ทะเบียน */
    setMode("entry");
  }, [open, editing]);

  const set = <K extends keyof MovementFormData>(k: K, v: MovementFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const switchType = (t: MovementType) => {
    setForm((f) => ({ ...f, type: t, reason: REASONS[t][0] }));
  };

  /* ── จัดการบรรทัดสินค้า ── */
  const isEdit = !!editing;
  const patchLine = (key: string, patch: Partial<MovementLine>) =>
    setForm((f) => ({ ...f, lines: f.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)) }));
  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, newLine()] }));
  const delLine = (key: string) =>
    setForm((f) => ({ ...f, lines: f.lines.length <= 1 ? f.lines : f.lines.filter((l) => l.key !== key) }));

  const productOf = (id: number | "") => products.find((p) => p.id === Number(id));
  const lineOk = (l: MovementLine) =>
    l.productId !== "" && l.qty.trim() !== "" && Number(l.qty) !== 0 &&
    (form.type === "adjust" || Number(l.qty) > 0);

  const filledLines = form.lines.filter(lineOk);
  /* สินค้าตัวเดียวกันสองบรรทัดจะตัดสต็อกสองรอบ ยอดสุดท้ายถูกแต่ไล่ที่มายาก
     กันไว้ตั้งแต่ตอนกรอก ให้รวมเป็นบรรทัดเดียว */
  const dupIds = filledLines
    .map((l) => Number(l.productId))
    .filter((id, i, arr) => arr.indexOf(id) !== i);
  const canSave = filledLines.length > 0 && dupIds.length === 0;

  const handleSubmit = () => {
    if (!canSave) return;
    const dateLabel = `${new Date(form.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })} ${form.time}`;
    const refPrefix = form.type === "in" ? "IN" : form.type === "out" ? "OUT" : "ADJ";
    /* เลขอ้างอิงเดียวกันทั้งชุด — เป็นเอกสารใบเดียว ตามรอยย้อนกลับได้ว่ามาจากการบันทึกครั้งไหน */
    const ref = `${refPrefix}-${Date.now().toString().slice(-6)}`;

    const rows: MovementPayload[] = filledLines.map((l) => {
      const p = productOf(l.productId)!;
      const qty = Number(l.qty);
      return {
        productId: p.id,
        productName: p.name,
        type: form.type,
        qty: form.type === "out" ? -Math.abs(qty) : qty,
        costPerUnit: p.costPrice,
        date: dateLabel,
        ref,
        supplier: form.type === "in" ? form.reason : "",
        lot: "",
        note: form.note || form.reason,
      };
    });
    onSave(rows);
    onClose();
  };

  const activeTab = TABS.find((t) => t.type === form.type)!;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              /* ขนาดคงที่ ไม่ยืดหดตามเนื้อหา — สลับแท็บแล้วกล่องกระตุกอ่านยาก
                 และปุ่มท้ายขยับหนีนิ้วที่กำลังจะกด เนื้อหาเลื่อนข้างในแทน */
              className="w-full max-w-[900px] vet-modal overflow-hidden"
              style={{ height: "min(760px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <Package className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">{editing ? "แก้ไขความเคลื่อนไหว Stock" : "บันทึกความเคลื่อนไหว Stock"}</h2>
                      <p className="vet-tiny mt-[2px]">รับเข้า / จ่ายออก / ปรับยอด</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── แท็บประเภท ── ชุดเดียวกับแท็บในโมดัลใบสั่งซื้อ (PO)
                  แถบเทาเต็มความกว้าง + รางขาวกลมมีเงา ปุ่มที่เลือกเป็นเขียวทึบ
                  ของเดิมเป็นรางเทาเต็มแถวและปุ่มขาว คนละภาษากับที่อื่นในระบบ */}
              <div className="flex border-b border-gray-100 px-5 py-3 bg-gray-50/40 flex-shrink-0">
                <div className="flex items-center rounded-full p-1"
                  style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 0 4px 0 rgba(0,0,0,0.15)" }}>
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = mode === "entry" && form.type === tab.type;
                    return (
                      <button
                        key={tab.type}
                        onClick={() => { setMode("entry"); switchType(tab.type); }}
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs transition-all whitespace-nowrap"
                        style={{
                          background: isActive ? "var(--brand)" : "transparent",
                          color: isActive ? "#ffffff" : "#6a7282",
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                  {/* คั่นให้เห็นว่าเป็นคนละเรื่อง — สามอันซ้ายคือ "จะบันทึกอะไร"
                      อันขวาคือ "ดูของที่บันทึกไปแล้ว" */}
                  <span className="w-px h-4 bg-gray-200 mx-1" />
                  <button
                    onClick={() => setMode("history")}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs transition-all whitespace-nowrap"
                    style={{
                      background: mode === "history" ? "var(--brand)" : "transparent",
                      color: mode === "history" ? "#ffffff" : "#6a7282",
                      fontWeight: mode === "history" ? 500 : 400,
                    }}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    ทะเบียน ({movements.length})
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {mode === "entry" && (<div className="space-y-4">

                  {/* ═══ ส่วนที่ 1 · รายการสินค้า ═══ */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      {/* หัวข้อส่วนแบบเดียวกับที่ใช้ทั้งระบบ (.vet-divider) — เส้นลากยาว
                          บอกขอบเขตของส่วนได้ชัดกว่า label เปล่า ๆ */}
                      <p className="vet-divider flex-1" style={{ marginBottom: 0 }}>
                        รายการสินค้า <span className="text-red-400">*</span>
                        {filledLines.length > 1 && (
                          <span className="text-[10.5px] px-2 py-0.5 rounded-full"
                            style={{ background: activeTab.bg, color: activeTab.ink, fontWeight: 700 }}>
                            {filledLines.length} รายการ
                          </span>
                        )}
                      </p>
                      {/* โหมดแก้ไขจัดการทีละใบ — เพิ่มบรรทัดจะกลายเป็นสร้างใหม่ปนกับของเดิม */}
                      {!isEdit && (
                        <button type="button" onClick={addLine}
                          className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-full transition-colors"
                          style={{ background: "color-mix(in srgb, var(--brand) 8%, transparent)", color: "var(--brand-dark)", border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)", fontWeight: 600 }}>
                          <Plus className="w-3 h-3" strokeWidth={2.6} /> เพิ่มรายการ
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {form.lines.map((l, idx) => {
                        const p = productOf(l.productId);
                        const dup = l.productId !== "" && dupIds.includes(Number(l.productId));
                        const after = p && l.qty !== ""
                          ? (form.type === "out" ? p.stock - Math.abs(Number(l.qty)) : p.stock + Number(l.qty))
                          : null;
                        return (
                          <div key={l.key} className="rounded-xl p-2.5"
                            style={{ border: dup ? "1.5px solid rgba(239,68,68,0.45)" : "1.5px solid #f1f3f5", background: "#fafafa" }}>
                            {/* ทุกช่องอยู่แถวเดียว — เลือกสินค้าแล้วสายตาไหลไปช่องจำนวน
                                ต่อด้วยยอดคงเหลือหลังทำรายการ อ่านจบในบรรทัดเดียว */}
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] text-white tabular-nums"
                                style={{ background: activeTab.color, fontWeight: 700 }}>{idx + 1}</span>

                              <div className="relative flex-1 min-w-0">
                                <select
                                  className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                                  style={{ height: 38 }}
                                  value={l.productId}
                                  onChange={(e) => patchLine(l.key, { productId: e.target.value === "" ? "" : Number(e.target.value) })}
                                >
                                  <option value="">— เลือกสินค้า —</option>
                                  {products.map((op) => (
                                    <option key={op.id} value={op.id}>
                                      {op.name} (คงเหลือ {op.stock} {op.unit})
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>

                              <div className="relative w-[124px] flex-shrink-0">
                                <input
                                  type="number"
                                  min={form.type === "adjust" ? undefined : 1}
                                  className={`${inputCls} no-spin text-center`}
                                  style={{ height: 38, fontVariantNumeric: "tabular-nums", fontWeight: 600, paddingRight: p ? 34 : undefined }}
                                  placeholder="0"
                                  value={l.qty}
                                  onChange={(e) => patchLine(l.key, { qty: e.target.value })}
                                />
                                {p && (
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none">{p.unit}</span>
                                )}
                              </div>

                              {/* ยอดก่อน → หลัง ของบรรทัดนี้ — กว้างคงที่ ไม่ให้แถวขยับตอนพิมพ์ */}
                              <div className="w-[150px] flex-shrink-0 hidden lg:block">
                                {p && l.qty !== "" ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap"
                                    style={{ background: activeTab.bg, color: activeTab.ink, border: `1px solid color-mix(in srgb, ${activeTab.color} 26%, transparent)` }}>
                                    <activeTab.icon className="w-3 h-3 flex-shrink-0" strokeWidth={2.4} />
                                    {p.stock} → <strong>{after}</strong> {p.unit}
                                  </span>
                                ) : null}
                              </div>

                              {/* ที่ว่างของปุ่มลบจองไว้เสมอ — ไม่งั้นแถวที่ลบไม่ได้จะกว้างไม่เท่าเพื่อน */}
                              <div className="w-7 flex-shrink-0 flex justify-center">
                                {!isEdit && form.lines.length > 1 && (
                                  <button type="button" onClick={() => delLine(l.key)} title="ลบรายการนี้"
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {dup && (
                              <p className="text-[10.5px] mt-1.5 ml-8" style={{ color: "#dc2626", fontWeight: 600 }}>
                                สินค้าตัวนี้ซ้ำกับอีกบรรทัด — รวมจำนวนเป็นบรรทัดเดียว
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {form.type === "adjust" && (
                      <p className="vet-tiny mt-1.5">จำนวนใส่ค่าบวกเพื่อเพิ่ม ใส่ค่าลบเพื่อลด</p>
                    )}
                  </div>

                  {/* ═══ ส่วนที่ 2 · ข้อมูลเอกสาร ═══
                      วันที่ · เวลา · สาเหตุ · บันทึกโดย อยู่แถวเดียว
                      ทั้งสี่ช่องเป็นข้อมูลหัวเอกสารชุดเดียวกัน แยกคนละบรรทัด
                      ทำให้ฟอร์มยาวเกินจำเป็นทั้งที่โมดัลกว้าง 900px
                      จอแคบยุบเป็น 2 คอลัมน์ ไม่บีบจนอ่านไม่ออก */}
                  <div>
                    <p className="vet-divider">ข้อมูลเอกสาร</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="min-w-0">
                      <label className={labelCls}>
                        {form.type === "in" ? "วันที่รับ" : form.type === "out" ? "วันที่จ่าย" : "วันที่ปรับยอด"}
                      </label>
                      <DatePickerModern value={form.date} onChange={(v) => set("date", v)} />
                    </div>
                    <div className="min-w-0">
                      <label className={labelCls}>เวลา</label>
                      <TimePickerModern value={form.time} onChange={(v) => set("time", v)} />
                    </div>
                    <div className="min-w-0">
                      <label className={labelCls}>สาเหตุ / อ้างอิง</label>
                      <div className="relative">
                        <select
                          className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                          value={form.reason}
                          onChange={(e) => set("reason", e.target.value)}
                        >
                          {REASONS[form.type].map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <label className={labelCls}>บันทึกโดย</label>
                      <div className="relative">
                        <select
                          className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                          value={form.recordedBy}
                          onChange={(e) => set("recordedBy", e.target.value)}
                        >
                          {STAFF.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* ═══ ส่วนที่ 3 · หมายเหตุ ═══ มีชิปข้อความด่วนตามประเภทความเคลื่อนไหว */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="vet-divider flex-1" style={{ marginBottom: 0 }}>หมายเหตุ</p>
                      <span className="text-[10px] text-gray-300">{form.note.length > 0 ? `${form.note.length} ตัวอักษร` : "ไม่บังคับ"}</span>
                    </div>
                    <textarea
                      className="vet-textarea"
                      rows={2}
                      placeholder={form.type === "in" ? "เช่น สภาพของครบถ้วน, เลขที่ใบส่งของ..." : form.type === "out" ? "เช่น เบิกไปใช้ที่ห้องตรวจ 2..." : "เช่น เหตุผลที่ยอดคลาดเคลื่อน..."}
                      value={form.note}
                      onChange={(e) => set("note", e.target.value)}
                    />
                    {/* ชิปหมายเหตุด่วน — กดเพื่อเติมข้อความ */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {(form.type === "in"
                        ? ["ของครบตามใบส่งของ", "มีของแถมจาก Supplier", "รับโอนจากสาขา"]
                        : form.type === "out"
                        ? ["ใช้ภายในคลินิก", "เบิกให้แผนก OPD", "ของชำรุด/เสียหาย"]
                        : ["นับสต็อกประจำเดือน", "แก้ยอดคลาดเคลื่อน", "ตัดของหมดอายุ"]
                      ).map(txt => (
                        <button
                          key={txt}
                          type="button"
                          onClick={() => set("note", form.note ? `${form.note} · ${txt}` : txt)}
                          className="text-[10.5px] px-2.5 py-1 rounded-full transition-colors hover:text-(--brand-dark)"
                          style={{ background: "color-mix(in srgb, var(--brand) 6%, transparent)", color: "#6b7280", border: "1px solid color-mix(in srgb, var(--brand) 15%, transparent)", fontWeight: 600 }}
                        >
                          + {txt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>)}

                {/* ═══════════ ทะเบียนความเคลื่อนไหว ═══════════ */}
                {mode === "history" && (
                  <div className="space-y-3">
                    {/* สรุปจำนวนใบตามช่วงที่กรอง */}
                    <div className="grid grid-cols-3 gap-2">
                      {TABS.map(tab => {
                        const Icon = tab.icon;
                        const docs = docStats.byType[tab.type].size;
                        return (
                          <button key={tab.type} type="button"
                            onClick={() => setHType(hType === tab.type ? "all" : tab.type)}
                            className="rounded-2xl px-3 py-2.5 text-left transition-all"
                            style={{
                              background: hType === tab.type ? tab.bg : "#fafafa",
                              border: `1.5px solid ${hType === tab.type ? tab.color : "#f1f3f5"}`,
                            }}>
                            <span className="flex items-center gap-1.5 text-[11px] whitespace-nowrap" style={{ color: tab.ink, fontWeight: 700 }}>
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.4} /> {tab.label}
                            </span>
                            <span className="block text-[18px] mt-0.5" style={{ color: tab.ink, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                              {docs} <span className="text-[11px]" style={{ fontWeight: 600 }}>ใบ</span>
                            </span>
                            <span className="block text-[10.5px] text-gray-400">
                              รวม {docStats.qtyByType[tab.type].toLocaleString()} หน่วย
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* ตัวกรอง */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className={labelCls}>ตั้งแต่วันที่</label>
                        <DatePickerModern value={hStart} onChange={setHStart} />
                      </div>
                      <div>
                        <label className={labelCls}>ถึงวันที่</label>
                        <DatePickerModern value={hEnd} onChange={setHEnd} />
                      </div>
                      <div>
                        <label className={labelCls}>ค้นหา</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input className={inputCls} style={{ paddingLeft: 34 }} value={hSearch}
                            onChange={e => setHSearch(e.target.value)} placeholder="สินค้า / เลขที่ / หมายเหตุ" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11.5px] text-gray-500 px-0.5">
                      <span>
                        {history.length} รายการ
                        {hType !== "all" && <> · กรองเฉพาะ {TABS.find(t => t.type === hType)?.label}</>}
                      </span>
                      {(hType !== "all" || hSearch) && (
                        <button onClick={() => { setHType("all"); setHSearch(""); }}
                          className="text-(--brand-dark) hover:underline" style={{ fontWeight: 600 }}>ล้างตัวกรอง</button>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-[12.5px]">
                          <thead>
                            <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              <th className="text-left px-3 py-2.5" style={{ width: 110 }}>เลขที่</th>
                              <th className="text-left px-3 py-2.5" style={{ width: 130 }}>วันที่</th>
                              <th className="text-left px-3 py-2.5">สินค้า</th>
                              <th className="text-center px-3 py-2.5" style={{ width: 116 }}>ประเภท</th>
                              <th className="text-right px-3 py-2.5" style={{ width: 90 }}>จำนวน</th>
                              <th className="text-left px-3 py-2.5">หมายเหตุ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {history.length === 0 ? (
                              <tr><td colSpan={6} className="text-center text-gray-400 py-12">ไม่มีความเคลื่อนไหวในช่วงที่เลือก</td></tr>
                            ) : history.map(m => {
                              const tab = TABS.find(t => t.type === m.type)!;
                              return (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500">{m.ref || "—"}</td>
                                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{m.date}</td>
                                  <td className="px-3 py-2.5 text-gray-800 truncate" style={{ fontWeight: 600 }}>{m.productName}</td>
                                  {/* ป้ายห้ามตัดบรรทัด — "จ่ายออก" ขึ้นบรรทัดใหม่แล้วแถวสูงไม่เท่ากันทั้งตาราง */}
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="inline-flex items-center justify-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full whitespace-nowrap"
                                      style={{
                                        background: tab.bg,
                                        color: tab.ink,
                                        border: `1px solid color-mix(in srgb, ${tab.color} 26%, transparent)`,
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                      }}>
                                      <tab.icon className="w-3 h-3 flex-shrink-0" strokeWidth={2.4} /> {tab.label}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-right whitespace-nowrap"
                                    style={{ color: m.qty < 0 ? "#dc2626" : "#059669", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                                    {m.qty > 0 ? "+" : ""}{m.qty.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2.5 text-gray-500 truncate">{m.note || <span className="text-gray-300">—</span>}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">
                  {mode === "history" ? "ปิด" : "ยกเลิก"}
                </button>
                {/* ปุ่มบันทึกมาตรฐาน — เหมือนโมดัลอื่นทั้งระบบ (ไล่สีตามธีม ไม่ย้อมตามแท็บ)
                    อยู่ในทะเบียนไม่ต้องมี เพราะไม่มีอะไรให้บันทึก */}
                {mode === "entry" && (
                  <button onClick={handleSubmit} disabled={!canSave} className="vet-btn vet-btn-primary btn-green">
                    <Check className="w-[16px] h-[16px]" />
                    บันทึก
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
