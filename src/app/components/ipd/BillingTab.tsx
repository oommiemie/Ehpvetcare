import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Receipt, Plus, X, Check, Pencil, Trash2, CreditCard, Printer, History, ChevronRight, Sparkles, Pill, FlaskConical, Image as ImageIcon,
  CalendarDays, ChevronDown,
} from "lucide-react";
import { useIPD, type Admit, type BillCategory, type BillingItem, type LabType, type ImagingType, type DrugOrder, type LabOrder, type ImagingOrder } from "../../contexts/IPDContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

const categories: { value: BillCategory; color: string }[] = [
  { value: "ค่ายา",         color: "#0ea5e9" },
  { value: "ค่าเวชภัณฑ์",   color: "#06b6d4" },
  { value: "ค่าห้อง/กรง",   color: "#8b5cf6" },
  { value: "ค่าหัตถการ",    color: "#ec4899" },
  { value: "ค่าแพทย์",      color: "#10b981" },
  { value: "ค่าพยาบาล",     color: "#19a589" },
  { value: "ค่า Lab",       color: "#a855f7" },
  { value: "ค่า X-Ray",     color: "#f59e0b" },
  { value: "อื่นๆ",         color: "#6b7280" },
];

/* Reference prices (THB) — used to auto-derive bills from drug/lab/imaging orders */
const LAB_PRICES: Record<LabType, number> = {
  "CBC": 400, "Blood Chemistry": 800, "Electrolyte": 600, "Urinalysis": 300,
  "Cytology": 700, "Culture": 1200, "Other": 500,
};
const IMAGING_PRICES: Record<ImagingType, number> = {
  "X-Ray": 1200, "Ultrasound": 1500, "CT": 5000, "MRI": 8000,
};
const drugPrice = (d: DrugOrder): number => {
  // มีข้อมูลเบิก/จ่ายจริง → คิดตามจำนวนจ่าย × ราคา/หน่วย (HOSxP)
  if (d.pricePerUnit != null && d.qtyDispensed != null) return Math.round(d.qtyDispensed * d.pricePerUnit);
  // ไม่มี → heuristic เดิม: Base 200 + 50/day; CRI ×2; Controlled +30%
  let p = 200;
  if (d.durationDays && d.durationDays > 0) p += d.durationDays * 50;
  if (d.isContinuous) p *= 2;
  if (d.isControlled) p *= 1.3;
  return Math.round(p);
};

type ComputedBillRow = {
  key: string;
  date: string;
  category: BillCategory;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  source: "manual" | "drug" | "lab" | "imaging";
  manualId?: number;
};

export function BillingTab({ admit }: { admit: Admit }) {
  const { bills, payments, admits, drugs, labs, imagings, removeBill } = useIPD();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [showAddBill, setShowAddBill] = useState(false);
  const [editingBill, setEditingBill] = useState<BillingItem | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [daysOpen, setDaysOpen] = useState(true);   // กาง "ค่ายาแยกรายวัน"

  const askRemoveBill = async (id: number, item: string, total: number) => {
    const ok = await confirm({
      title: "ลบรายการ?",
      description: `${item} (฿${total.toLocaleString()}) จะถูกลบจากบิล`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (ok) {
      removeBill(id);
      showSnackbar("info", "ลบรายการแล้ว");
    }
  };

  const openEditBill = (id: number) => {
    const bill = bills.find(b => b.id === id);
    if (bill) setEditingBill(bill);
  };

  /* Manual + auto-derived rows for this admit */
  const rows: ComputedBillRow[] = useMemo(() => {
    const out: ComputedBillRow[] = [];

    bills.filter(b => b.admitId === admit.id).forEach(b => {
      out.push({
        key: `m-${b.id}`, date: b.date, category: b.category, description: b.description,
        qty: b.qty, unitPrice: b.unitPrice, total: b.total, source: "manual", manualId: b.id,
      });
    });
    drugs.filter(d => d.admitId === admit.id).forEach(d => {
      const price = drugPrice(d);
      const hasQty = d.pricePerUnit != null && d.qtyDispensed != null;
      const qtyInfo = d.qtyRequested != null || d.qtyDispensed != null
        ? ` · เบิก ${d.qtyRequested ?? "—"}/จ่าย ${d.qtyDispensed ?? d.qtyRequested ?? "—"} ${d.qtyUnit ?? ""}`
        : "";
      const desc = `${d.drugName}${d.strength ? ` (${d.strength})` : ""} · ${d.dose} ${d.route} ${d.frequency}${d.durationDays ? ` Day ${d.durationDays}` : ""}${qtyInfo}${d.active ? "" : " · ยกเลิก"}`;
      out.push({
        key: `d-${d.id}`, date: d.orderedAt.slice(0, 10), category: "ค่ายา", description: desc,
        qty: hasQty ? d.qtyDispensed! : 1,
        unitPrice: hasQty ? d.pricePerUnit! : price,
        total: price, source: "drug",
      });
    });
    labs.filter(l => l.admitId === admit.id && l.status !== "Cancelled").forEach(l => {
      const price = LAB_PRICES[l.labType] ?? 500;
      out.push({
        key: `l-${l.id}`, date: l.orderedAt.slice(0, 10), category: "ค่า Lab",
        description: l.customName || l.labType, qty: 1, unitPrice: price, total: price, source: "lab",
      });
    });
    imagings.filter(i => i.admitId === admit.id && i.status !== "Cancelled").forEach(i => {
      const price = IMAGING_PRICES[i.type] ?? 1500;
      out.push({
        key: `i-${i.id}`, date: i.orderedAt.slice(0, 10), category: "ค่า X-Ray",
        description: `${i.type} · ${i.position}`, qty: 1, unitPrice: price, total: price, source: "imaging",
      });
    });

    return out.sort((a, b) => b.date.localeCompare(a.date));
  }, [bills, drugs, labs, imagings, admit.id]);

  const pays = useMemo(() => payments.filter(p => p.admitId === admit.id).sort((a, b) => b.paidAt.localeCompare(a.paidAt)), [payments, admit.id]);
  const totalItems = rows.reduce((s, r) => s + r.total, 0);
  const totalPaid = pays.reduce((s, p) => s + p.amount, 0);
  const balance = totalItems - totalPaid;

  /* Past payment history (cross-admit, read-only) */
  const pastGroups = useMemo(() => {
    const sameHNAdmits = admits
      .filter(a => a.hn === admit.hn && a.id !== admit.id)
      .sort((a, b) => `${b.admitDate}T${b.admitTime}`.localeCompare(`${a.admitDate}T${a.admitTime}`));
    return sameHNAdmits.map(a => ({
      admit: a,
      pays: payments.filter(p => p.admitId === a.id).sort((x, y) => y.paidAt.localeCompare(x.paidAt)),
    }));
  }, [payments, admits, admit.hn, admit.id]);
  const pastPaysCount = pastGroups.reduce((s, g) => s + g.pays.length, 0);
  const pastVisitsWithPays = pastGroups.filter(g => g.pays.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Status strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SumCard label="รวมทั้งสิ้น" value={totalItems} />
        <SumCard label="ชำระแล้ว" value={totalPaid} positive={totalPaid > 0} />
        <SumCard label="ค้างชำระ" value={Math.max(0, balance)} alert={balance > 0} />
        <SumCard label="Deposit" value={admit.deposit ?? 0} />
      </div>

      {/* 2-column: LEFT cost items, RIGHT payment history */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
        {/* LEFT — Current visit cost items + ค่ายาแยกรายวัน */}
        <div className="min-w-0 space-y-4">
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Receipt className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>รายการค่าใช้จ่าย</h3>
              <p className="text-[11px] text-gray-500">{rows.length} รายการ · ดึงจาก ยา/Lab/X-Ray อัตโนมัติ</p>
            </div>
            <button onClick={() => setShowAddBill(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="p-4">
              <button
                onClick={() => setShowAddBill(true)}
                className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-500"
              >
                <Receipt className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <div className="text-[12px] mb-2" style={{ fontWeight: 600 }}>ยังไม่มีรายการค่าใช้จ่าย</div>
                <div className="text-[10.5px] text-gray-400 mb-2">เพิ่มรายการเอง หรือสั่งยา/Lab/X-Ray ระบบจะคำนวณให้</div>
                <div className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#e8802a,#d06a1a)", fontWeight: 700 }}>
                  <Plus className="w-3 h-3" /> เพิ่มรายการแรก
                </div>
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {rows.map(r => (
                  <BillRow
                    key={r.key}
                    row={r}
                    onEdit={r.source === "manual" && r.manualId !== undefined ? () => openEditBill(r.manualId!) : undefined}
                    onDelete={r.source === "manual" && r.manualId !== undefined ? () => askRemoveBill(r.manualId!, r.description, r.total) : undefined}
                  />
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between" style={{ background: "rgba(25,165,137,0.04)" }}>
                <span className="text-[11.5px] text-gray-600" style={{ fontWeight: 700 }}>รวมทั้งสิ้น</span>
                <span className="text-[18px] text-[#0d7c66]" style={{ fontWeight: 800, letterSpacing: "-0.4px" }}>฿{totalItems.toLocaleString()}</span>
              </div>
            </>
          )}

          {/* Print action */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[11px] text-gray-500">
              ค้างชำระ <span style={{ fontWeight: 700, color: balance > 0 ? "#dc2626" : "#0d7c66" }}>฿{Math.max(0, balance).toLocaleString()}</span>
            </div>
            <button onClick={() => window.print()} className="vet-btn vet-btn-secondary inline-flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" /> พิมพ์ใบเสร็จ
            </button>
          </div>
        </section>

        {/* ── ค่ายาแยกรายวัน (HOSxP) — ยา active ของ visit นี้ กางเห็นเป็นวันๆ ── */}
        {(() => {
          const courseDrugs = drugs.filter(d => d.admitId === admit.id && d.active && (d.durationDays ?? 0) >= 1);
          if (courseDrugs.length === 0) return null;
          const maxDays = Math.max(...courseDrugs.map(d => d.durationDays!));
          const perDayCost = (d: DrugOrder) => drugPrice(d) / d.durationDays!;
          const dayRows = Array.from({ length: maxDays }, (_, i) => {
            const dayNo = i + 1;
            const active = courseDrugs.filter(d => dayNo <= d.durationDays!);
            return { dayNo, active, cost: active.reduce((s, d) => s + perDayCost(d), 0) };
          });
          const courseTotal = dayRows.reduce((s, r) => s + r.cost, 0);
          return (
            <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
              <button onClick={() => setDaysOpen(o => !o)} className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100/80 hover:bg-gray-50/40 transition-colors">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(25,165,137,0.10))" }}>
                  <CalendarDays className="w-[18px] h-[18px] text-[#1d4ed8]" strokeWidth={2.2} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ค่ายาแยกรายวัน</h3>
                  <p className="text-[11px] text-gray-500">คอร์สยา {maxDays} วัน · รวม ฿{Math.round(courseTotal).toLocaleString()}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${daysOpen ? "rotate-180" : ""}`} />
              </button>
              {daysOpen && (
                <div className="divide-y divide-gray-50">
                  {dayRows.map(({ dayNo, active, cost }) => (
                    <div key={dayNo} className="flex items-start gap-3 px-4 py-2.5">
                      <div className="flex-shrink-0 w-14 pt-0.5">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px] text-white" style={{ fontWeight: 700, background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>วันที่ {dayNo}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-wrap gap-1.5">
                        {active.map(d => (
                          <span key={d.id} className="inline-flex items-center gap-1 text-[10.5px] text-gray-600 px-2 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.20)", fontWeight: 600 }}>
                            {d.drugName} · {d.frequency}
                          </span>
                        ))}
                      </div>
                      <span className="flex-shrink-0 text-[12px] text-gray-900 pt-0.5" style={{ fontWeight: 700 }}>฿{Math.round(cost).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0fdf9]">
                    <span className="text-[12px] text-gray-600" style={{ fontWeight: 600 }}>รวมค่ายาทั้งคอร์ส ({maxDays} วัน)</span>
                    <span className="text-[15px] text-[#0d7c66]" style={{ fontWeight: 800 }}>฿{Math.round(courseTotal).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </section>
          );
        })()}
        </div>

        {/* RIGHT — Payment history (read-only) */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <button
            onClick={() => setShowHistory(s => !s)}
            className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100/80 hover:bg-gray-50/50 transition-colors"
            disabled={pastPaysCount === 0}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <History className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ประวัติการชำระเงิน</h3>
              <p className="text-[11px] text-gray-500">
                {pastPaysCount > 0 ? `${pastVisitsWithPays} Visit · ${pastPaysCount} รายการ` : "ยังไม่มีประวัติการชำระ"}
              </p>
            </div>
            {pastPaysCount > 0 && (
              <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>{showHistory ? "ซ่อน" : "ดู"}</span>
            )}
          </button>
          <AnimatePresence initial={false}>
            {showHistory && pastPaysCount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: "hidden" }}
              >
                <div className="p-3 space-y-3" style={{ maxHeight: 720, overflowY: "auto" }}>
                  {pastGroups.filter(g => g.pays.length > 0).map(g => (
                    <PastPayGroup key={g.admit.id} admit={g.admit} pays={g.pays} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {pastPaysCount === 0 && (
            <div className="p-3">
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <History className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <div className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มีประวัติการชำระของสัตว์ตัวนี้</div>
                <div className="text-[10.5px] text-gray-400 mt-1">ประวัติจะปรากฏหลังจาก Visit ก่อนหน้ามีการชำระ</div>
              </div>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {(showAddBill || editingBill) && (
          <BillAddModal
            key={editingBill?.id ?? "new"}
            admitId={admit.id}
            existing={editingBill}
            onClose={() => { setShowAddBill(false); setEditingBill(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SumCard({ label, value, alert, positive }: { label: string; value: number; alert?: boolean; positive?: boolean }) {
  const color =
    alert && value > 0   ? "#dc2626" :
    positive && value > 0 ? "#0d7c66" :
    value > 0            ? "#111827" : "#9ca3af";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="text-[10px] text-gray-500 mb-1" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: "-0.5px" }}>฿{value.toLocaleString()}</div>
    </div>
  );
}

function SourceBadge({ source }: { source: ComputedBillRow["source"] }) {
  if (source === "manual") {
    return <span className="text-[9.5px] text-gray-600 px-1.5 py-0.5 rounded-full bg-gray-100 inline-flex items-center gap-1" style={{ fontWeight: 700 }}>Manual</span>;
  }
  if (source === "drug") {
    return <span className="text-[9.5px] text-sky-700 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(14,165,233,0.10)", fontWeight: 700 }}><Pill className="w-2.5 h-2.5" /> Drug</span>;
  }
  if (source === "lab") {
    return <span className="text-[9.5px] text-purple-700 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(168,85,247,0.10)", fontWeight: 700 }}><FlaskConical className="w-2.5 h-2.5" /> Lab</span>;
  }
  return <span className="text-[9.5px] text-amber-700 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(245,158,11,0.10)", fontWeight: 700 }}><ImageIcon className="w-2.5 h-2.5" /> X-Ray</span>;
}

const sourceIconCfg = {
  manual:  { Icon: Receipt,        bg: "bg-gray-100",   color: "text-gray-600" },
  drug:    { Icon: Pill,           bg: "bg-sky-50",     color: "text-sky-600" },
  lab:     { Icon: FlaskConical,   bg: "bg-purple-50",  color: "text-purple-600" },
  imaging: { Icon: ImageIcon,      bg: "bg-amber-50",   color: "text-amber-600" },
} as const;

function BillRow({ row, onEdit, onDelete }: { row: ComputedBillRow; onEdit?: () => void; onDelete?: () => void }) {
  const cat = categories.find(c => c.value === row.category)!;
  const cfg = sourceIconCfg[row.source];
  const SIco = cfg.Icon;
  return (
    <li className="group px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
      {/* Source icon */}
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <SIco className={`w-4.5 h-4.5 ${cfg.color}`} strokeWidth={2.2} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{row.description}</span>
          <span className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${cat.color}15`, color: cat.color, fontWeight: 700 }}>{cat.value}</span>
          {row.source !== "manual" && (
            <span className="text-[9px] text-gray-400 px-1 py-0.5 rounded-full bg-gray-100 flex-shrink-0" style={{ fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase" }}>auto</span>
          )}
        </div>
        <div className="text-[10.5px] text-gray-500 mt-0.5">
          {row.qty > 1 && <span>{row.qty} × ฿{row.unitPrice.toLocaleString()} · </span>}
          {row.qty === 1 && <span>฿{row.unitPrice.toLocaleString()}/หน่วย · </span>}
          <span>{row.date}</span>
        </div>
      </div>

      {/* Total */}
      <div className="text-right flex-shrink-0">
        <div className="text-[15px] text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.3px" }}>฿{row.total.toLocaleString()}</div>
      </div>

      {/* แก้ไข / ลบ (manual only) — appears on hover */}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              aria-label={`แก้ไขรายการ ${row.description}`}
              title="แก้ไขรายการ"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
              aria-label={`ลบรายการ ${row.description}`}
              title="ลบรายการ"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function PastPayGroup({ admit, pays }: { admit: { id: number; admitDate: string; admitTime: string; diagnosis: string; totalCharge: number; paid: number }; pays: { id: number; paidAt: string; amount: number; method: string; note?: string }[] }) {
  const [open, setOpen] = useState(true);
  const visitDate = new Date(`${admit.admitDate}T${admit.admitTime}`);
  const yearTH = visitDate.getFullYear() + 543;
  const monthTH = visitDate.toLocaleDateString("th-TH", { month: "short" });
  const day = visitDate.getDate();
  const yearShort = String(yearTH).slice(-2);
  const sumPays = pays.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50/60 hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-white border border-gray-100 flex-shrink-0">
          <div className="text-[8px] text-gray-400 leading-none" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{monthTH}</div>
          <div className="text-[15px] text-gray-900 leading-none mt-0.5" style={{ fontWeight: 800 }}>{day}</div>
          <div className="text-[8px] text-gray-400 leading-none mt-0.5" style={{ fontWeight: 600 }}>'{yearShort}</div>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{admit.diagnosis}</span>
          </div>
          <div className="text-[10.5px] text-gray-500 truncate mt-0.5">รวม ฿{sumPays.toLocaleString()} · {pays.length} ครั้ง</div>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} strokeWidth={2.2} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{ overflow: "hidden" }}
          >
            <ul className="divide-y divide-gray-100">
              {pays.map(p => (
                <li key={p.id} className="px-3 py-2.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-emerald-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.10)", fontWeight: 700 }}>{p.method}</span>
                      <span className="text-[10px] text-gray-400" style={{ fontWeight: 600 }}>{fmtDate(p.paidAt)}</span>
                    </div>
                    {p.note && <div className="text-[10.5px] text-gray-600 mt-0.5 line-clamp-1">{p.note}</div>}
                  </div>
                  <div className="text-[13px] text-emerald-700 flex-shrink-0" style={{ fontWeight: 800 }}>฿{p.amount.toLocaleString()}</div>
                </li>
              ))}
            </ul>
            <div className="px-3 py-2 bg-emerald-50/40 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10.5px] text-gray-600" style={{ fontWeight: 600 }}>ยอดบิล Visit นี้</span>
              <span className="text-[12px] text-gray-900" style={{ fontWeight: 700 }}>฿{admit.totalCharge.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

function BillAddModal({ admitId, existing, onClose }: { admitId: number; existing?: BillingItem | null; onClose: () => void }) {
  const { addBill, updateBill } = useIPD();
  const { showSnackbar } = useSnackbar();
  const isEdit = !!existing;
  const [category, setCategory] = useState<BillCategory>(existing?.category ?? "ค่ายา");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [qty, setQty] = useState(existing ? String(existing.qty) : "1");
  const [unitPrice, setUnitPrice] = useState(existing ? String(existing.unitPrice) : "");
  const [discount, setDiscount] = useState(existing?.discount != null ? String(existing.discount) : "");
  const today = new Date().toISOString().slice(0, 10);

  const submit = () => {
    if (!description || !unitPrice) return;
    const q = parseInt(qty) || 1;
    const up = parseFloat(unitPrice) || 0;
    const disc = parseFloat(discount) || 0;
    const total = Math.max(0, q * up - disc);
    if (isEdit && existing) {
      updateBill(existing.id, { date: existing.date, category, description, qty: q, unitPrice: up, total, discount: disc || undefined });
      showSnackbar("success", `แก้ไขรายการ ฿${total.toLocaleString()} สำเร็จ`);
    } else {
      addBill({ admitId, date: today, category, description, qty: q, unitPrice: up, total, discount: disc || undefined });
      showSnackbar("success", `เพิ่มรายการ ฿${total.toLocaleString()} สำเร็จ`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #fb923c, #d97706)" }}><Receipt className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>{isEdit ? "แก้ไขรายการค่าใช้จ่าย" : "เพิ่มรายการค่าใช้จ่าย"}</h3>
            <p className="text-[11px] text-gray-500 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> ระบบจะดึงค่ายา/Lab/X-Ray ให้อัตโนมัติแล้ว</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="หมวด *">
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map(c => (
                <button key={c.value} type="button" onClick={() => setCategory(c.value)} className={category === c.value ? "vet-chip vet-chip-active" : "vet-chip"} style={{ justifyContent: "center" }}>
                  {c.value}
                </button>
              ))}
            </div>
          </Field>
          <Field label="รายการ *"><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="vet-input" placeholder="เช่น ค่าหัตถการ, ค่าห้อง 2 คืน" /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="จำนวน"><input type="number" value={qty} onChange={e => setQty(e.target.value)} className="vet-input" min={1} /></Field>
            <Field label="ราคา/หน่วย *"><input type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="vet-input" placeholder="0" /></Field>
            <Field label="ส่วนลด"><input type="number" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} className="vet-input" placeholder="0" /></Field>
          </div>
          {qty && unitPrice && (
            <div className="text-right text-[14px] text-[#0d7c66] p-2 rounded-lg" style={{ background: "rgba(25,165,137,0.06)", fontWeight: 800 }}>
              รวม: ฿{Math.max(0, (parseInt(qty) || 0) * (parseFloat(unitPrice) || 0) - (parseFloat(discount) || 0)).toLocaleString()}
            </div>
          )}
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!description || !unitPrice} className="vet-btn vet-btn-orange inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {isEdit ? "บันทึกการแก้ไข" : "เพิ่ม"}</button>
        </div>
      </motion.div>
    </div>
  );
}
