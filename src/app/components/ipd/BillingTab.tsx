import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Receipt, Plus, X, Check, Pencil, Trash2, CreditCard, Printer, History, ChevronRight, ChevronLeft, Sparkles, Pill, FlaskConical, Image as ImageIcon,
  CalendarDays, ChevronDown, Clock, Wallet, Undo2, AlertTriangle, Banknote, QrCode,
} from "lucide-react";
import { useIPD, type Admit, type BillCategory, type BillingItem, type LabType, type ImagingType, type DrugOrder, type LabOrder, type ImagingOrder } from "../../contexts/IPDContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";
import { useAuth } from "../../contexts/AuthContext";
import { loadOutstanding, upsertOutstanding, removeOutstanding, type OutstandingEntry } from "../outstandingRegistry";
import { FakeQR } from "../FakeQR";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

const categories: { value: BillCategory; color: string }[] = [
  { value: "ค่ายา",         color: "#0ea5e9" },
  { value: "ค่าเวชภัณฑ์",   color: "#06b6d4" },
  { value: "ค่าห้อง/กรง",   color: "#8b5cf6" },
  { value: "ค่าหัตถการ",    color: "#ec4899" },
  { value: "ค่าแพทย์",      color: "#10b981" },
  { value: "ค่าพยาบาล",     color: "var(--brand)" },
  { value: "ค่า Lab",       color: "#a855f7" },
  { value: "ค่า Medical Imaging",     color: "#f59e0b" },
  { value: "อื่นๆ",         color: "#6b7280" },
];

/* Reference prices (THB) — used to auto-derive bills from drug/lab/imaging orders */
const LAB_PRICES: Record<LabType, number> = {
  "CBC": 400, "Blood Chemistry": 800, "Electrolyte": 600, "Urinalysis": 300,
  "Cytology": 700, "Culture": 1200, "Other": 500,
};
const IMAGING_PRICES: Record<ImagingType, number> = {
  "Medical Imaging": 1200, "Ultrasound": 1500, "CT": 5000, "MRI": 8000,
};
const drugPrice = (d: DrugOrder): number => {
  // มีข้อมูลเบิก/จ่ายจริง → คิดตาม (จำนวนจ่าย − จำนวนคืน) × ราคา/หน่วย (HOSxP)
  if (d.pricePerUnit != null && d.qtyDispensed != null)
    return Math.round(Math.max(0, d.qtyDispensed - (d.returnedQty ?? 0)) * d.pricePerUnit);
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
  /* วันที่-เวลา-ผู้บันทึก เช่น "บันทึกสั่งยา 7 ก.ค. 69 14:32 · สพ.ญ. อรพิน" */
  meta?: string;
};

/* วันที่+เวลาแบบไทยสั้นจาก ISO */
const fmtOrderedAt = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })} ${d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`;
};

export function BillingTab({ admit }: { admit: Admit }) {
  const { bills, payments, admits, drugs, labs, imagings, removeBill, addPayment, updateDrug } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [showAddBill, setShowAddBill] = useState(false);
  const [editingBill, setEditingBill] = useState<BillingItem | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [daysOpen, setDaysOpen] = useState(true);   // กาง "ค่ายาแยกรายวัน"
  const [showDailyPay, setShowDailyPay] = useState(false);      // ชำระเงินรายวัน (เลือกรายการ)
  const [showReturnDrug, setShowReturnDrug] = useState(false);  // บันทึกคืนยา
  const [issuedReceipt, setIssuedReceipt] = useState<{ no: string; time: string; method: string; total: number; items: { name: string; total: number }[] } | null>(null);  // ใบเสร็จที่ออกหลังชำระ
  const [outstanding, setOutstanding] = useState<OutstandingEntry[]>(() => loadOutstanding());

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
        meta: b.recordedBy ? `บันทึก ${b.recordedAt ? fmtOrderedAt(b.recordedAt) : b.date} · โดย ${b.recordedBy}` : undefined,
      });
    });
    drugs.filter(d => d.admitId === admit.id).forEach(d => {
      const price = drugPrice(d);
      const hasQty = d.pricePerUnit != null && d.qtyDispensed != null;
      const qtyInfo = d.qtyRequested != null || d.qtyDispensed != null
        ? ` · เบิก ${d.qtyRequested ?? "—"}/จ่าย ${d.qtyDispensed ?? d.qtyRequested ?? "—"} ${d.qtyUnit ?? ""}${(d.returnedQty ?? 0) > 0 ? ` · คืน ${d.returnedQty} (คืน Stock แล้ว)` : ""}`
        : "";
      const desc = `${d.drugName}${d.strength ? ` (${d.strength})` : ""} · ${d.dose} ${d.route} ${d.frequency}${d.durationDays ? ` Day ${d.durationDays}` : ""}${qtyInfo}${d.active ? "" : " · ยกเลิก"}`;
      out.push({
        key: `d-${d.id}`, date: d.orderedAt.slice(0, 10), category: "ค่ายา", description: desc,
        qty: hasQty ? d.qtyDispensed! : 1,
        unitPrice: hasQty ? d.pricePerUnit! : price,
        total: price, source: "drug",
        meta: `บันทึกสั่งยา ${fmtOrderedAt(d.orderedAt)} · โดย ${d.orderedBy}`,
      });
    });
    labs.filter(l => l.admitId === admit.id && l.status !== "Cancelled").forEach(l => {
      const price = LAB_PRICES[l.labType] ?? 500;
      out.push({
        key: `l-${l.id}`, date: l.orderedAt.slice(0, 10), category: "ค่า Lab",
        description: l.customName || l.labType, qty: 1, unitPrice: price, total: price, source: "lab",
        meta: `สั่งเมื่อ ${fmtOrderedAt(l.orderedAt)} · โดย ${l.orderedBy}`,
      });
    });
    imagings.filter(i => i.admitId === admit.id && i.status !== "Cancelled").forEach(i => {
      const price = IMAGING_PRICES[i.type] ?? 1500;
      out.push({
        key: `i-${i.id}`, date: i.orderedAt.slice(0, 10), category: "ค่า Medical Imaging",
        description: `${i.type} · ${i.position}`, qty: 1, unitPrice: price, total: price, source: "imaging",
        meta: `สั่งเมื่อ ${fmtOrderedAt(i.orderedAt)} · โดย ${i.orderedBy}`,
      });
    });

    return out.sort((a, b) => b.date.localeCompare(a.date));
  }, [bills, drugs, labs, imagings, admit.id]);

  const pays = useMemo(() => payments.filter(p => p.admitId === admit.id).sort((a, b) => b.paidAt.localeCompare(a.paidAt)), [payments, admit.id]);
  const totalItems = rows.reduce((s, r) => s + r.total, 0);
  const totalPaid = pays.reduce((s, p) => s + p.amount, 0);
  const balance = totalItems - totalPaid;

  /* รายการที่ชำระแล้ว (จากการชำระรายวันแบบเลือกรายการ) */
  const paidKeys = useMemo(() => new Set(pays.flatMap(p => p.itemKeys ?? [])), [pays]);
  const unpaidRows = rows.filter(r => !paidKeys.has(r.key));
  /* ยอดการคืนยา/อุปกรณ์ของ admit นี้ */
  const totalReturned = useMemo(
    () => drugs.filter(d => d.admitId === admit.id)
      .reduce((sum, d) => sum + (d.returnedQty ?? 0) * (d.pricePerUnit ?? 0), 0),
    [drugs, admit.id]);
  const thisOutstanding = outstanding.find(o => o.admitId === admit.id);

  /* บันทึกชำระรายวัน — จ่ายเฉพาะรายการที่เลือก */
  const handleDailyPay = (keys: string[], method: "Cash" | "Card" | "Transfer" | "Deposit" | "Insurance") => {
    const sel = rows.filter(r => keys.includes(r.key));
    if (sel.length === 0) return;
    const amount = sel.reduce((sum, r) => sum + r.total, 0);
    const receiptNo = admit.an ? admit.an.replace(/^AN/, "RC") : `RC-2569-${String(admit.id).padStart(4, "0")}`;
    addPayment({ admitId: admit.id, paidAt: new Date().toISOString(), amount, method, note: `ชำระรายวัน ${sel.length} รายการ · ใบเสร็จ ${receiptNo}`, itemKeys: keys });
    showSnackbar("success", `ออกใบเสร็จ ${receiptNo} · ชำระ ฿${amount.toLocaleString()} (${sel.length} รายการ) แล้ว`);
    setShowDailyPay(false);
    /* ออกใบเสร็จเต็ม (พิมพ์ได้) แบบหน้า POS */
    setIssuedReceipt({
      no: receiptNo,
      time: new Date().toLocaleString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) + " น.",
      method, total: amount,
      items: sel.map(r => ({ name: r.description, total: r.total })),
    });
  };

  /* บันทึกยอดค้างชำระเข้าทะเบียน — เตือนเมื่อสัตว์มารับบริการครั้งถัดไป */
  const handleRecordOutstanding = () => {
    const entry: OutstandingEntry = {
      admitId: admit.id, an: admit.an, hn: admit.hn, petName: admit.petName,
      owner: admit.owner, ownerPhone: admit.ownerPhone,
      amount: Math.max(0, balance),
      recordedAt: new Date().toISOString(), recordedBy: user?.displayName ?? "เจ้าหน้าที่",
    };
    setOutstanding(upsertOutstanding(entry));
    showSnackbar("warning", `บันทึกยอดค้างชำระ ฿${Math.max(0, balance).toLocaleString()} เข้าทะเบียนแล้ว — ระบบจะเตือนเมื่อส่งตรวจครั้งถัดไป`);
  };

  /* ยืนยันคืนยา — คืนเข้า Stock + ค่าใช้จ่ายลดลงอัตโนมัติ (drugPrice หักจำนวนคืน) */
  const handleReturnDrugs = (items: { id: number; qty: number }[]) => {
    let value = 0;
    items.forEach(({ id, qty }) => {
      if (qty <= 0) return;
      const d = drugs.find(x => x.id === id);
      if (!d) return;
      value += qty * (d.pricePerUnit ?? 0);
      updateDrug(id, { returnedQty: (d.returnedQty ?? 0) + qty, returnedAt: new Date().toISOString() });
    });
    if (value > 0) showSnackbar("success", `บันทึกคืนยาเข้า Stock แล้ว · ค่าใช้จ่ายลดลง ฿${value.toLocaleString()}`);
    setShowReturnDrug(false);
  };

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
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>รายการค่าใช้จ่าย</h3>
              <p className="text-[11px] text-gray-500">{rows.length} รายการ · ดึงจาก ยา/Lab/Medical Imaging อัตโนมัติ</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <button onClick={() => setShowDailyPay(true)} disabled={unpaidRows.length === 0}
                className="vet-btn vet-btn-secondary inline-flex items-center gap-1 disabled:opacity-40"
                style={{ color: "var(--brand-dark)", borderColor: "color-mix(in srgb, var(--brand) 35%, transparent)" }} title="เลือกรายการที่จะชำระวันนี้ (ชำระบางส่วนแบบรายวัน)">
                <Wallet className="w-3.5 h-3.5" /> ชำระรายวัน
              </button>
              <button onClick={() => setShowReturnDrug(true)}
                className="vet-btn vet-btn-secondary inline-flex items-center gap-1"
                style={{ color: "#b45309", borderColor: "rgba(245,158,11,0.35)" }} title="บันทึกคืนยา — คืนเข้า Stock และลดค่าใช้จ่าย">
                <Undo2 className="w-3.5 h-3.5" /> คืนยา
              </button>
              <button onClick={() => setShowAddBill(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="p-4">
              <button
                onClick={() => setShowAddBill(true)}
                className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-500"
              >
                <Receipt className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <div className="text-[12px] mb-2" style={{ fontWeight: 600 }}>ยังไม่มีรายการค่าใช้จ่าย</div>
                <div className="text-[10.5px] text-gray-400 mb-2">เพิ่มรายการเอง หรือสั่งยา/Lab/Medical Imaging ระบบจะคำนวณให้</div>
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
                    paid={paidKeys.has(r.key)}
                    onEdit={r.source === "manual" && r.manualId !== undefined ? () => openEditBill(r.manualId!) : undefined}
                    onDelete={r.source === "manual" && r.manualId !== undefined ? () => askRemoveBill(r.manualId!, r.description, r.total) : undefined}
                  />
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-gray-100 space-y-1.5" style={{ background: "color-mix(in srgb, var(--brand) 4%, transparent)" }}>
                {totalReturned > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-amber-600">
                    <span style={{ fontWeight: 600 }}>ยอดการคืนยา/อุปกรณ์ (คืน Stock แล้ว — หักออกแล้ว)</span>
                    <span style={{ fontWeight: 700 }}>− ฿{totalReturned.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] text-gray-600" style={{ fontWeight: 700 }}>รวมทั้งสิ้น</span>
                  <span className="text-[18px] text-(--brand-dark)" style={{ fontWeight: 800, letterSpacing: "-0.4px" }}>฿{totalItems.toLocaleString()}</span>
                </div>
                {balance > 0 && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                    <span className="text-[11px] text-rose-600 inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
                      <AlertTriangle className="w-3 h-3" /> ค้างชำระ ฿{balance.toLocaleString()}
                      {thisOutstanding && <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-500" style={{ fontWeight: 700 }}>บันทึกเข้าทะเบียนแล้ว</span>}
                    </span>
                    <button onClick={handleRecordOutstanding}
                      className="text-[11px] px-3 py-1 rounded-full text-white transition-colors hover:opacity-90"
                      style={{ fontWeight: 700, background: "linear-gradient(135deg,#f87171,#dc2626)" }}
                      title="บันทึกยอดค้างชำระเข้าทะเบียน — ระบบจะเตือนเมื่อสัตว์มารับบริการครั้งถัดไป">
                      {thisOutstanding ? "อัปเดตยอดค้างชำระ" : "บันทึกค้างชำระ"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Print action */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[11px] text-gray-500">
              ค้างชำระ <span style={{ fontWeight: 700, color: balance > 0 ? "#dc2626" : "var(--brand-dark)" }}>฿{Math.max(0, balance).toLocaleString()}</span>
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
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), color-mix(in srgb, var(--brand) 10%, transparent))" }}>
                  <CalendarDays className="w-[18px] h-[18px] text-[#1d4ed8]" strokeWidth={2.2} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>ค่ายาแยกรายวัน</h3>
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
                    <span className="text-[15px] text-(--brand-dark)" style={{ fontWeight: 800 }}>฿{Math.round(courseTotal).toLocaleString()}</span>
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
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>ประวัติการชำระเงิน</h3>
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
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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

          {/* ── ทะเบียนค้างชำระ (ทั้งคลินิก) — ใช้ตรวจสอบ + ระบบเตือนตอนส่งตรวจ ── */}
          <div className="border-t border-gray-100">
            <div className="px-4 py-2.5 flex items-center gap-2 bg-rose-50/50">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="text-[12px] text-rose-700 flex-1" style={{ fontWeight: 700 }}>ทะเบียนค้างชำระ</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-rose-500 border border-rose-100" style={{ fontWeight: 700 }}>{outstanding.length} ราย</span>
            </div>
            {outstanding.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-4">— ไม่มียอดค้างชำระ —</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {outstanding.map(o => (
                  <div key={o.admitId} className="px-4 py-2.5 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-800" style={{ fontWeight: 700 }}>
                        {o.petName} <span className="text-gray-400 font-mono text-[10px]" style={{ fontWeight: 500 }}>{o.hn}</span>
                      </p>
                      <p className="text-[10.5px] text-gray-500 truncate">
                        {o.owner}{o.ownerPhone ? ` · ${o.ownerPhone}` : ""} · บันทึก {fmtDateTime(o.recordedAt)}{o.recordedBy ? ` · ${o.recordedBy}` : ""}
                      </p>
                    </div>
                    <span className="text-[13px] text-rose-600 flex-shrink-0" style={{ fontWeight: 800 }}>฿{o.amount.toLocaleString()}</span>
                    <button onClick={() => { setOutstanding(removeOutstanding(o.admitId)); showSnackbar("success", `เคลียร์ยอดค้างของ "${o.petName}" ออกจากทะเบียนแล้ว`); }}
                      className="text-[10px] px-2 py-1 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex-shrink-0"
                      style={{ fontWeight: 600 }} title="ชำระครบแล้ว — เอาออกจากทะเบียน">
                      เคลียร์
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {/* ── ชำระเงินรายวัน — เลือกรายการที่จ่ายวันนี้ ── */}
      {showDailyPay && (
        <DailyPayModal admit={admit} rows={unpaidRows} onClose={() => setShowDailyPay(false)} onPay={handleDailyPay} />
      )}
      {issuedReceipt && (
        <IPDReceiptModal admit={admit} receipt={issuedReceipt} onClose={() => setIssuedReceipt(null)} />
      )}

      {/* ── บันทึกคืนยา ── */}
      {showReturnDrug && (
        <ReturnDrugModal drugs={drugs.filter(d => d.admitId === admit.id && (d.qtyDispensed ?? 0) > 0 && d.dispenseStatus !== "cancelled")}
          onClose={() => setShowReturnDrug(false)} onConfirm={handleReturnDrugs} />
      )}

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
    positive && value > 0 ? "var(--brand-dark)" :
    value > 0            ? "#111827" : "#9ca3af";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="text-[10px] text-gray-500 mb-1" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "calc(20px * var(--fs))", fontWeight: 800, color, letterSpacing: "-0.5px" }}>฿{value.toLocaleString()}</div>
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
  return <span className="text-[9.5px] text-amber-700 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(245,158,11,0.10)", fontWeight: 700 }}><ImageIcon className="w-2.5 h-2.5" /> Medical Imaging</span>;
}

const sourceIconCfg = {
  manual:  { Icon: Receipt,        bg: "bg-gray-100",   color: "text-gray-600" },
  drug:    { Icon: Pill,           bg: "bg-sky-50",     color: "text-sky-600" },
  lab:     { Icon: FlaskConical,   bg: "bg-purple-50",  color: "text-purple-600" },
  imaging: { Icon: ImageIcon,      bg: "bg-amber-50",   color: "text-amber-600" },
} as const;

function BillRow({ row, paid, onEdit, onDelete }: { row: ComputedBillRow; paid?: boolean; onEdit?: () => void; onDelete?: () => void }) {
  const cat = categories.find(c => c.value === row.category)!;
  const cfg = sourceIconCfg[row.source];
  const SIco = cfg.Icon;
  return (
    <li className="group relative px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
      {/* Source icon */}
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <SIco className={`w-4.5 h-4.5 ${cfg.color}`} strokeWidth={2.2} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{row.description}</span>
          <span className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `color-mix(in srgb, ${cat.color} 8.2%, transparent)`, color: cat.color, fontWeight: 700 }}>{cat.value}</span>
          {row.source !== "manual" && (
            <span className="text-[9px] text-gray-400 px-1 py-0.5 rounded-full bg-gray-100 flex-shrink-0" style={{ fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase" }}>auto</span>
          )}
          {paid && (
            <span className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0 inline-flex items-center gap-0.5" style={{ fontWeight: 700, background: "rgba(22,163,74,0.10)", color: "#15803d" }}>
              <Check className="w-2.5 h-2.5" strokeWidth={3} /> ชำระแล้ว
            </span>
          )}
        </div>
        <div className="text-[10.5px] text-gray-500 mt-0.5">
          {row.qty > 1 && <span>{row.qty} × ฿{row.unitPrice.toLocaleString()} · </span>}
          {row.qty === 1 && <span>฿{row.unitPrice.toLocaleString()}/หน่วย · </span>}
          <span>{row.date}</span>
        </div>
        {row.meta && (
          <div className="text-[10px] text-(--brand-dark) mt-0.5 flex items-center gap-1" style={{ fontWeight: 500 }}>
            <Clock className="w-3 h-3 flex-shrink-0" /> {row.meta}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="text-right flex-shrink-0">
        <div className="text-[15px] text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.3px" }}>฿{row.total.toLocaleString()}</div>
      </div>

      {/* แก้ไข / ลบ (manual only) — ปุ่มลอยทับตอน hover ไม่กินที่ ทำให้ยอดเงินชิดขวาตรงกันทุกแถว */}
      {(onEdit || onDelete) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white rounded-full px-1 py-0.5 border border-gray-100" style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.10)" }}>
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
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
  const { user } = useAuth();
  const recorder = user?.displayName ?? "เจ้าหน้าที่";
  /* เวลาที่จะ stamp ลงรายการ — โชว์ให้เห็นก่อนบันทึก (แบบ modal สั่งยา) */
  const [nowIso] = useState(() => new Date().toISOString());
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
      updateBill(existing.id, {
        date: existing.date, category, description, qty: q, unitPrice: up, total, discount: disc || undefined,
        // คงผู้บันทึกเดิมไว้ — ถ้ารายการเก่าไม่เคยมี ให้ stamp คนที่แก้ล่าสุด
        recordedBy: existing.recordedBy ?? recorder,
        recordedAt: existing.recordedAt ?? new Date().toISOString(),
      });
      showSnackbar("success", `แก้ไขรายการ ฿${total.toLocaleString()} สำเร็จ`);
    } else {
      addBill({
        admitId, date: today, category, description, qty: q, unitPrice: up, total, discount: disc || undefined,
        recordedBy: recorder, recordedAt: new Date().toISOString(),
      });
      showSnackbar("success", `เพิ่มรายการ ฿${total.toLocaleString()} สำเร็จ`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #fb923c, #d97706)" }}><Receipt className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>{isEdit ? "แก้ไขรายการค่าใช้จ่าย" : "เพิ่มรายการค่าใช้จ่าย"}</h3>
            <p className="text-[11px] text-(--brand-dark) inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
              <Clock className="w-3 h-3" />
              {isEdit && existing?.recordedBy
                ? `บันทึกครั้งแรก ${existing.recordedAt ? fmtOrderedAt(existing.recordedAt) : existing.date} · โดย ${existing.recordedBy}`
                : `บันทึก ${fmtOrderedAt(nowIso)} · โดย ${recorder}`}
            </p>
            <p className="text-[10.5px] text-gray-400 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> ระบบจะดึงค่ายา/Lab/Medical Imaging ให้อัตโนมัติแล้ว</p>
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
            <div className="text-right text-[14px] text-(--brand-dark) p-2 rounded-lg" style={{ background: "color-mix(in srgb, var(--brand) 6%, transparent)", fontWeight: 800 }}>
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


/* ── ชำระเงินรายวันแบบ POS — เลือกรายการ → เลือกช่องทางชำระ → ยืนยัน → ใบเสร็จ ── */
function DailyPayModal({ admit, rows, onClose, onPay }: {
  admit: Admit;
  rows: ComputedBillRow[];
  onClose: () => void;
  onPay: (keys: string[], method: "Cash" | "Card" | "Transfer" | "Deposit" | "Insurance") => void;
}) {
  const [step, setStep] = useState<"select" | "pay">("select");
  const [selected, setSelected] = useState<string[]>(rows.map(r => r.key));
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "qr">("cash");
  const [cashReceived, setCashReceived] = useState("");
  const toggle = (k: string) => setSelected(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  const sum = rows.filter(r => selected.includes(r.key)).reduce((s, r) => s + r.total, 0);
  const change = cashReceived ? Number(cashReceived) - sum : 0;
  const methodMap = { cash: "Cash", card: "Card", qr: "Transfer" } as const;
  const methodLabel = { cash: "เงินสด", card: "บัตร", qr: "QR พร้อมเพย์" } as const;
  /* จัดกลุ่มตามวัน — เห็นเป็นรายวันชัดเจน */
  const byDate = useMemo(() => {
    const m = new Map<string, ComputedBillRow[]>();
    rows.forEach(r => { if (!m.has(r.date)) m.set(r.date, []); m.get(r.date)!.push(r); });
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "min(680px, calc(100vh - 2rem))" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3 flex-shrink-0">
          {step === "pay" && (
            <button onClick={() => setStep("select")} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0"><ChevronLeft className="w-4 h-4" /></button>
          )}
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,color-mix(in srgb, var(--brand) 62%, white),var(--brand-dark))" }}><Wallet className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>{step === "select" ? "ชำระเงินรายวัน" : "ชำระเงิน"}</h3>
            <p className="text-[11px] text-gray-500 truncate">{step === "select" ? "เลือกรายการที่ชำระวันนี้" : `${admit.petName} · ${admit.hn}`}</p>
          </div>
          {step === "pay" && (
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-gray-400">ยอดชำระ</p>
              <p className="text-[19px] text-(--brand-dark)" style={{ fontWeight: 800 }}>฿{sum.toLocaleString()}</p>
            </div>
          )}
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>

        {step === "select" ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button onClick={() => setSelected(prev => prev.length === rows.length ? [] : rows.map(r => r.key))}
                  className="text-[11.5px] text-(--brand-dark) hover:underline" style={{ fontWeight: 600 }}>เลือกทั้งหมด / ล้าง</button>
                <span className="text-[11.5px] text-gray-500" style={{ fontWeight: 600 }}>เลือกแล้ว {selected.length}/{rows.length} รายการ</span>
              </div>
              {byDate.map(([date, list]) => (
                <div key={date} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="px-3 py-1.5 bg-gray-50/70 text-[10.5px] text-gray-500 inline-flex items-center gap-1 w-full" style={{ fontWeight: 700 }}>
                    <CalendarDays className="w-3 h-3" /> {fmtDate(date)}
                  </div>
                  <div className="divide-y divide-gray-50">
                    {list.map(r => {
                      const on = selected.includes(r.key);
                      return (
                        <button key={r.key} onClick={() => toggle(r.key)} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50/60 transition-colors"
                          style={{ background: on ? "color-mix(in srgb, var(--brand) 5%, transparent)" : undefined }}>
                          <span className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 border transition-colors"
                            style={{ background: on ? "var(--brand)" : "#fff", borderColor: on ? "var(--brand)" : "#d1d5db" }}>
                            {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </span>
                          <span className="flex-1 min-w-0 text-[12px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{r.description}</span>
                          <span className="text-[12px] text-gray-900 flex-shrink-0" style={{ fontWeight: 700 }}>฿{r.total.toLocaleString()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {rows.length === 0 && <p className="text-center text-[12px] text-gray-400 py-8">ไม่มีรายการค้างชำระ</p>}
            </div>
            <div className="vet-modal-footer flex-shrink-0">
              <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
              <button onClick={() => setStep("pay")} disabled={selected.length === 0}
                className="vet-btn vet-btn-primary btn-green inline-flex items-center gap-1.5 disabled:opacity-40">
                ถัดไป · ชำระ ฿{sum.toLocaleString()} ({selected.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Method tabs */}
              <div className="px-5 pt-4 grid grid-cols-3 gap-2">
                {([["cash", Banknote, "เงินสด"], ["card", CreditCard, "บัตร"], ["qr", QrCode, "QR"]] as const).map(([m, Ico, label]) => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-2xl border transition-all"
                    style={payMethod === m
                      ? { borderColor: "var(--brand)", background: "color-mix(in srgb, var(--brand) 8%, transparent)", color: "var(--brand-dark)" }
                      : { borderColor: "#eef0f2", color: "#9ca3af" }}>
                    <Ico className="w-5 h-5" />
                    <span className="text-[11px]" style={{ fontWeight: 700 }}>{label}</span>
                  </button>
                ))}
              </div>
              {/* Method body */}
              <div className="px-5 py-4 min-h-[170px]">
                {payMethod === "cash" && (
                  <div className="space-y-2.5">
                    <label className="text-[11px] text-gray-400" style={{ fontWeight: 600 }}>รับเงินมา (บาท)</label>
                    <input value={cashReceived} onChange={e => setCashReceived(e.target.value)} type="number" autoFocus
                      placeholder={String(sum)} className="w-full px-3 py-2.5 text-[15px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20" style={{ fontWeight: 700 }} />
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set([sum, Math.ceil(sum / 100) * 100, Math.ceil(sum / 500) * 500, Math.ceil(sum / 1000) * 1000].filter(v => v >= sum))].slice(0, 4).map(v => (
                        <button key={v} onClick={() => setCashReceived(String(v))}
                          className="px-3 py-1 text-[12px] rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" style={{ fontWeight: 600 }}>฿{v.toLocaleString()}</button>
                      ))}
                    </div>
                    {cashReceived && change >= 0 && (
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-[12px] text-gray-500">เงินทอน</span>
                        <span className="text-[16px] text-(--brand-dark)" style={{ fontWeight: 800 }}>฿{change.toLocaleString()}</span>
                      </div>
                    )}
                    {cashReceived && change < 0 && <p className="text-[11px] text-rose-500" style={{ fontWeight: 600 }}>รับเงินไม่พอ (ขาด ฿{Math.abs(change).toLocaleString()})</p>}
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
                      <FakeQR text={`PP|EHPVETCARE|${sum}|${admit.id}`} size={150} />
                    </div>
                    <p className="text-[12px] text-gray-700" style={{ fontWeight: 700 }}>สแกนจ่าย ฿{sum.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">พร้อมเพย์ · EHP VetCare</p>
                  </div>
                )}
              </div>
            </div>
            <div className="vet-modal-footer flex-shrink-0">
              <button onClick={() => setStep("select")} className="vet-btn vet-btn-secondary">ย้อนกลับ</button>
              <button onClick={() => onPay(selected, methodMap[payMethod])}
                disabled={payMethod === "cash" && !!cashReceived && change < 0}
                className="vet-btn vet-btn-primary btn-green inline-flex items-center gap-1.5 disabled:opacity-40">
                <Check className="w-3.5 h-3.5" /> ยืนยันชำระ · {methodLabel[payMethod]}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ── ใบเสร็จรับเงิน IPD (พิมพ์ได้ + QR) — โผล่หลังชำระ แบบหน้า POS ── */
function IPDReceiptModal({ admit, receipt, onClose }: {
  admit: Admit;
  receipt: { no: string; time: string; method: string; total: number; items: { name: string; total: number }[] };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[340px] bg-white rounded-2xl overflow-hidden flex flex-col" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.3)", maxHeight: "calc(100vh - 2rem)" }}
        onClick={e => e.stopPropagation()}>
        <div className="rc-print px-5 py-4 overflow-y-auto">
          <div className="text-center pb-3 border-b border-dashed border-gray-300">
            <p className="text-[15px] text-gray-900" style={{ fontWeight: 800 }}>EHP VetCare</p>
            <p className="text-[10px] text-gray-400">คลินิกสัตวแพทย์ · โทร 02-123-4567</p>
            <p className="text-[10px] text-(--brand-dark) mt-0.5" style={{ fontWeight: 700 }}>ใบเสร็จรับเงิน · ผู้ป่วยใน (IPD)</p>
          </div>
          <div className="py-2.5 text-[11px] text-gray-500 space-y-0.5 border-b border-dashed border-gray-300">
            <div className="flex justify-between"><span>เลขที่</span><span style={{ fontWeight: 700, color: "#111" }}>{receipt.no}</span></div>
            <div className="flex justify-between"><span>วันที่</span><span>{receipt.time}</span></div>
            <div className="flex justify-between"><span>ผู้ป่วย</span><span>{admit.petName} · {admit.hn}</span></div>
            {admit.an && <div className="flex justify-between"><span>AN</span><span>{admit.an}</span></div>}
          </div>
          <div className="py-2.5 border-b border-dashed border-gray-300 max-h-[200px] overflow-y-auto">
            {receipt.items.map((it, i) => (
              <div key={i} className="flex items-baseline gap-2 py-0.5 text-[11.5px]">
                <span className="text-gray-700 flex-1 truncate">{it.name}</span>
                <span className="text-gray-800 tabular-nums flex-shrink-0" style={{ fontWeight: 600 }}>{it.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="py-2.5 text-[12px] space-y-1 border-b border-dashed border-gray-300">
            <div className="flex justify-between items-baseline"><span className="text-gray-800" style={{ fontWeight: 800 }}>รวมสุทธิ</span><span className="text-[16px] text-(--brand-dark)" style={{ fontWeight: 800 }}>฿{receipt.total.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500"><span>ชำระโดย</span><span style={{ fontWeight: 700, color: "#111" }}>{receipt.method}</span></div>
          </div>
          <p className="text-center text-[10px] text-gray-400 pt-3">ขอบคุณที่ใช้บริการค่ะ 🐾</p>
        </div>
        <div className="px-5 pb-5 pt-1 flex gap-2 rc-noprint flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 rounded-full text-[13px] text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>ปิด</button>
          <button onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 text-white text-[14px] py-2.5 rounded-full transition-all active:scale-[0.98]"
            style={{ fontWeight: 700, background: "linear-gradient(135deg,var(--brand),var(--brand-dark))", boxShadow: "0 4px 16px color-mix(in srgb, var(--brand-dark) 35%, transparent)" }}>
            <Printer className="w-4 h-4" /> พิมพ์ใบเสร็จ
          </button>
        </div>
        <style>{`@media print { body * { visibility: hidden !important; } .rc-print, .rc-print * { visibility: visible !important; } .rc-print { position: fixed; inset: 0; margin: 0 auto; width: 300px; } .rc-noprint { display: none !important; } }`}</style>
      </motion.div>
    </div>
  );
}

/* ── บันทึกคืนยา — แสดงจำนวนจ่าย → ระบุจำนวนคืน → คืนเข้า Stock + ค่าใช้จ่ายลดลง ── */
function ReturnDrugModal({ drugs, onClose, onConfirm }: {
  drugs: DrugOrder[];
  onClose: () => void;
  onConfirm: (items: { id: number; qty: number }[]) => void;
}) {
  const [qtys, setQtys] = useState<Record<number, number>>({});
  const maxReturn = (d: DrugOrder) => Math.max(0, (d.qtyDispensed ?? 0) - (d.returnedQty ?? 0));
  const setQty = (id: number, v: number, max: number) =>
    setQtys(prev => ({ ...prev, [id]: Math.min(Math.max(0, v), max) }));
  const totalValue = drugs.reduce((s, d) => s + (qtys[d.id] ?? 0) * (d.pricePerUnit ?? 0), 0);
  const totalQty = drugs.reduce((s, d) => s + (qtys[d.id] ?? 0), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl w-full max-w-[640px] shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "min(680px, calc(100vh - 2rem))" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3 flex-shrink-0">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#fbbf24,#d97706)" }}><Undo2 className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>บันทึกคืนยา</h3>
            <p className="text-[11px] text-gray-500">จำนวนที่คืนจะกลับเข้า Stock และค่าใช้จ่ายลดลงอัตโนมัติ</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {drugs.length === 0 ? (
            <p className="text-center text-[12px] text-gray-400 py-8">ยังไม่มีรายการยาที่จ่ายแล้วให้คืน</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-gray-400 text-[10px] bg-gray-50" style={{ fontWeight: 700, textTransform: "uppercase" }}>
                  <th className="text-left px-3 py-2">ยา</th>
                  <th className="text-center px-2 py-2">จ่ายแล้ว</th>
                  <th className="text-center px-2 py-2">คืนแล้ว</th>
                  <th className="text-center px-2 py-2">จำนวนคืน</th>
                  <th className="text-right px-2 py-2">ราคา/หน่วย</th>
                  <th className="text-right px-3 py-2">มูลค่าที่คืน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {drugs.map(d => {
                  const max = maxReturn(d);
                  const q = qtys[d.id] ?? 0;
                  return (
                    <tr key={d.id} style={max === 0 ? { opacity: 0.5 } : undefined}>
                      <td className="px-3 py-2">
                        <p className="text-gray-900" style={{ fontWeight: 700 }}>{d.drugName}{d.strength ? ` (${d.strength})` : ""}</p>
                        <p className="text-[10px] text-gray-400">{d.dose} · {d.frequency}{d.dispenseStoreRoom ? ` · ${d.dispenseStoreRoom}` : ""}</p>
                      </td>
                      <td className="px-2 py-2 text-center text-gray-700" style={{ fontWeight: 600 }}>{d.qtyDispensed} {d.qtyUnit ?? ""}</td>
                      <td className="px-2 py-2 text-center" style={{ color: (d.returnedQty ?? 0) > 0 ? "#b45309" : "#9ca3af", fontWeight: 600 }}>{d.returnedQty ?? 0}</td>
                      <td className="px-2 py-2">
                        <input type="number" min={0} max={max} disabled={max === 0} value={q || ""}
                          onChange={e => setQty(d.id, parseFloat(e.target.value) || 0, max)}
                          placeholder="0"
                          className="w-16 mx-auto block text-sm text-center border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#d97706] disabled:bg-gray-50" />
                      </td>
                      <td className="px-2 py-2 text-right text-gray-600">฿{(d.pricePerUnit ?? 0).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right" style={{ fontWeight: 700, color: q > 0 ? "#b45309" : "#9ca3af" }}>
                        ฿{(q * (d.pricePerUnit ?? 0)).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "rgba(245,158,11,0.04)" }}>
          <span className="text-[11.5px] text-gray-600" style={{ fontWeight: 600 }}>
            รวมคืน {totalQty.toLocaleString()} หน่วย · มูลค่า <span className="text-amber-600" style={{ fontWeight: 800 }}>฿{totalValue.toLocaleString()}</span>
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
            <button onClick={() => onConfirm(drugs.map(d => ({ id: d.id, qty: qtys[d.id] ?? 0 })))} disabled={totalQty <= 0}
              className="vet-btn vet-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#fbbf24,#d97706)" }}>
              <Check className="w-3.5 h-3.5" /> ยืนยันคืนยา
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
