import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, TrendingUp, TrendingDown, RefreshCw, Package, ChevronDown } from "lucide-react";
import { DatePickerModern } from "./DatePickerModern";
import { TimePickerModern } from "./TimePickerModern";

type MovementType = "in" | "out" | "adjust";

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

interface MovementFormData {
  productId: number | "";
  type: MovementType;
  qty: string;
  date: string;
  time: string;
  reason: string;
  recordedBy: string;
  note: string;
}

interface StockMovementModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
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
  }) => void;
  products: StockProduct[];
  /** movement เดิมที่กำลังแก้ไข — ถ้ามี โมดัลจะ prefill ค่าและ onSave จะหมายถึงการอัปเดต */
  editing?: EditingMovement | null;
}

const REASONS: Record<MovementType, string[]> = {
  in:     ["รับสินค้าจาก Supplier", "รับจาก PO", "โอนย้ายจากสาขา", "คืนสินค้าจากลูกค้า", "อื่นๆ"],
  out:    ["ขาย POS", "ใช้ภายใน", "โอนย้ายไปสาขา", "สินค้าเสียหาย/หมดอายุ", "อื่นๆ"],
  adjust: ["ตรวจนับสต็อก", "ปรับยอดคลัง", "แก้ไขข้อผิดพลาด", "อื่นๆ"],
};

const STAFF = ["สมใจ ใจดี", "นายแพทย์ วิชัย", "พยาบาล สุดา", "ผู้ดูแลระบบ"];

const TABS: { type: MovementType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { type: "in",     label: "รับเข้า",  icon: TrendingUp,   color: "#19a589", bg: "rgba(25,165,137,0.1)"  },
  { type: "out",    label: "จ่ายออก", icon: TrendingDown,  color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  { type: "adjust", label: "ปรับยอด", icon: RefreshCw,     color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
];

const todayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};
const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const emptyForm = (): MovementFormData => ({
  productId: "",
  type: "in",
  qty: "",
  date: todayStr(),
  time: nowTime(),
  reason: REASONS["in"][0],
  recordedBy: STAFF[0],
  note: "",
});

const inputCls = "vet-input";
const labelCls = "vet-label";

const formFromEditing = (e: EditingMovement): MovementFormData => ({
  productId: e.productId,
  type: e.type,
  // adjust เก็บค่าติดลบได้ (บวก=เพิ่ม ลบ=ลด) จึงคงเครื่องหมายไว้; in/out ใช้ค่าสัมบูรณ์
  qty: String(e.type === "adjust" ? e.qty : Math.abs(e.qty)),
  date: e.date || todayStr(),
  time: e.time || nowTime(),
  reason: e.reason && REASONS[e.type].includes(e.reason) ? e.reason : REASONS[e.type][0],
  recordedBy: STAFF[0],
  note: e.note || "",
});

export function StockMovementModal({ open, onClose, onSave, products, editing }: StockMovementModalProps) {
  const [form, setForm] = useState<MovementFormData>(emptyForm());

  useEffect(() => {
    if (open) setForm(editing ? formFromEditing(editing) : emptyForm());
  }, [open, editing]);

  const set = <K extends keyof MovementFormData>(k: K, v: MovementFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const switchType = (t: MovementType) => {
    setForm((f) => ({ ...f, type: t, reason: REASONS[t][0] }));
  };

  const selectedProduct = products.find((p) => p.id === Number(form.productId));
  const canSave = form.productId !== "" && form.qty !== "" && Number(form.qty) > 0;

  const handleSubmit = () => {
    if (!canSave || !selectedProduct) return;
    const dateLabel = `${new Date(form.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })} ${form.time}`;
    const refPrefix = form.type === "in" ? "IN" : form.type === "out" ? "OUT" : "ADJ";
    const ref = `${refPrefix}-${Date.now().toString().slice(-6)}`;
    const qty = form.type === "adjust"
      ? Number(form.qty)  // can be negative via note
      : Number(form.qty);

    onSave({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: form.type,
      qty: form.type === "out" ? -Math.abs(qty) : qty,
      costPerUnit: selectedProduct.costPrice,
      date: dateLabel,
      ref,
      supplier: form.type === "in" ? form.reason : "",
      lot: "",
      note: form.note || form.reason,
    });
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
              className="w-full max-w-[480px] vet-modal overflow-hidden"
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

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {/* Type tabs */}
                <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "#f3f4f6" }}>
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = form.type === tab.type;
                    return (
                      <button
                        key={tab.type}
                        onClick={() => switchType(tab.type)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm transition-all duration-200"
                        style={{
                          background: isActive ? "white" : "transparent",
                          color: isActive ? tab.color : "#9ca3af",
                          fontWeight: isActive ? 600 : 400,
                          boxShadow: isActive ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* สินค้า */}
                <div>
                  <label className={labelCls}>
                    สินค้า <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                      value={form.productId}
                      onChange={(e) => set("productId", e.target.value === "" ? "" : Number(e.target.value))}
                    >
                      <option value="">— เลือกสินค้า —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (คงเหลือ {p.stock} {p.unit})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* จำนวน */}
                <div>
                  <label className={labelCls}>
                    จำนวน{form.type === "adjust" ? " (บวก = เพิ่ม, ลบ = ลด)" : ""} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={form.type === "adjust" ? undefined : 1}
                      className={inputCls}
                      placeholder="0"
                      value={form.qty}
                      onChange={(e) => set("qty", e.target.value)}
                    />
                    {selectedProduct && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {selectedProduct.unit}
                      </span>
                    )}
                  </div>

                  {/* stock preview */}
                  {selectedProduct && form.qty !== "" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                      style={{ background: activeTab.bg }}
                    >
                      <activeTab.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: activeTab.color }} />
                      <span style={{ color: activeTab.color }}>
                        {selectedProduct.stock} → {" "}
                        <strong>
                          {form.type === "out"
                            ? selectedProduct.stock - Math.abs(Number(form.qty))
                            : form.type === "in"
                            ? selectedProduct.stock + Number(form.qty)
                            : selectedProduct.stock + Number(form.qty)}{" "}
                          {selectedProduct.unit}
                        </strong>
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* วันที่ / เวลา — ป้ายวันที่เปลี่ยนตามประเภท (รับเข้า/จ่ายออก/ปรับยอด) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>
                      {form.type === "in" ? "วันที่รับ" : form.type === "out" ? "วันที่จ่าย" : "วันที่ปรับยอด"}
                    </label>
                    <DatePickerModern value={form.date} onChange={(v) => set("date", v)} />
                  </div>
                  <div>
                    <label className={labelCls}>เวลา</label>
                    <TimePickerModern value={form.time} onChange={(v) => set("time", v)} />
                  </div>
                </div>

                {/* สาเหตุ */}
                <div>
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

                {/* บันทึกโดย */}
                <div>
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

                {/* หมายเหตุ — มีชิปข้อความด่วนตามประเภทความเคลื่อนไหว */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls} style={{ marginBottom: 0 }}>หมายเหตุ</label>
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
                        className="text-[10.5px] px-2.5 py-1 rounded-full transition-colors hover:text-[#0d7c66]"
                        style={{ background: "rgba(25,165,137,0.06)", color: "#6b7280", border: "1px solid rgba(25,165,137,0.15)", fontWeight: 600 }}
                      >
                        + {txt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl">
                <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSave}
                  className="vet-btn vet-btn-primary btn-green disabled:opacity-40"
                  style={canSave ? { background: `linear-gradient(135deg, ${activeTab.color}, ${activeTab.color}cc)`, boxShadow: "none" } : undefined}
                >
                  <activeTab.icon className="w-[16px] h-[16px]" />
                  {editing ? "บันทึกการแก้ไข" : "บันทึกการเคลื่อนไหว"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
