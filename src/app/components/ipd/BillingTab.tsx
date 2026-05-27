import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Receipt, Plus, X, Check, Trash2, CreditCard, ChevronDown, Printer, Percent,
} from "lucide-react";
import { useIPD, type Admit, type BillCategory, type Payment } from "../../contexts/IPDContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });

const categories: { value: BillCategory; color: string; grad: string }[] = [
  { value: "ค่ายา",         color: "#0ea5e9", grad: "linear-gradient(135deg, #38bdf8, #0284c7)" },
  { value: "ค่าเวชภัณฑ์",   color: "#06b6d4", grad: "linear-gradient(135deg, #22d3ee, #0891b2)" },
  { value: "ค่าห้อง/กรง",   color: "#8b5cf6", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
  { value: "ค่าหัตถการ",    color: "#ec4899", grad: "linear-gradient(135deg, #f472b6, #db2777)" },
  { value: "ค่าแพทย์",      color: "#10b981", grad: "linear-gradient(135deg, #34d399, #059669)" },
  { value: "ค่าพยาบาล",     color: "#19a589", grad: "linear-gradient(135deg, #2dd4bf, #0d7c66)" },
  { value: "ค่า Lab",       color: "#a855f7", grad: "linear-gradient(135deg, #c084fc, #9333ea)" },
  { value: "ค่า X-Ray",     color: "#f59e0b", grad: "linear-gradient(135deg, #fbbf24, #d97706)" },
  { value: "อื่นๆ",         color: "#6b7280", grad: "linear-gradient(135deg, #9ca3af, #4b5563)" },
];

export function BillingTab({ admit }: { admit: Admit }) {
  const { bills, payments, removeBill } = useIPD();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [showAddBill, setShowAddBill] = useState(false);
  const [showPay, setShowPay] = useState(false);

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

  const items = useMemo(() => bills.filter(b => b.admitId === admit.id).sort((a, b) => b.date.localeCompare(a.date)), [bills, admit.id]);
  const pays = useMemo(() => payments.filter(p => p.admitId === admit.id).sort((a, b) => b.paidAt.localeCompare(a.paidAt)), [payments, admit.id]);

  const sumByCategory = useMemo(() => {
    const m: Partial<Record<BillCategory, number>> = {};
    items.forEach(b => { m[b.category] = (m[b.category] ?? 0) + b.total; });
    return m;
  }, [items]);

  const totalItems = items.reduce((s, b) => s + b.total, 0);
  const totalPaid = pays.reduce((s, p) => s + p.amount, 0);
  const balance = totalItems - totalPaid;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SumCard label="รวมทั้งสิ้น" value={`฿${totalItems.toLocaleString()}`} color="#0ea5e9" grad="linear-gradient(135deg, #38bdf8, #0284c7)" />
        <SumCard label="ชำระแล้ว" value={`฿${totalPaid.toLocaleString()}`} color="#10b981" grad="linear-gradient(135deg, #34d399, #059669)" />
        <SumCard label="ค้างชำระ" value={`฿${Math.max(0, balance).toLocaleString()}`} color={balance > 0 ? "#f59e0b" : "#10b981"} grad={balance > 0 ? "linear-gradient(135deg, #fbbf24, #d97706)" : "linear-gradient(135deg, #34d399, #059669)"} />
        <SumCard label="Deposit" value={`฿${(admit.deposit ?? 0).toLocaleString()}`} color="#8b5cf6" grad="linear-gradient(135deg, #a78bfa, #7c3aed)" />
      </div>

      {/* By category breakdown */}
      {Object.keys(sumByCategory).length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 className="text-[12px] text-gray-500 mb-3" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>แยกตามหมวด</h3>
          <div className="space-y-2">
            {categories.filter(c => sumByCategory[c.value]).map(c => {
              const amount = sumByCategory[c.value] ?? 0;
              const pct = (amount / totalItems) * 100;
              return (
                <div key={c.value} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-[12px] text-gray-700 w-[110px] flex-shrink-0">{c.value}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.grad }} />
                  </div>
                  <span className="text-[11.5px] text-gray-700 w-[80px] text-right flex-shrink-0" style={{ fontWeight: 700 }}>฿{amount.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Items */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <Receipt className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>รายการค่าใช้จ่าย</h3>
            <p className="text-[11px] text-gray-500">{items.length} รายการ</p>
          </div>
          <button onClick={() => setShowAddBill(true)} className="vet-btn vet-btn-primary inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
          </button>
        </div>
        <div className="p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Receipt className="w-10 h-10 mb-2" strokeWidth={1.5} />
              <div className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มีรายการค่าใช้จ่าย</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-gray-100" style={{ background: "#f9fafb" }}>
                    <th className="text-left px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>วันที่</th>
                    <th className="text-left px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>หมวด</th>
                    <th className="text-left px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>รายการ</th>
                    <th className="text-center px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>จน</th>
                    <th className="text-right px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>ราคา</th>
                    <th className="text-right px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>รวม</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(b => {
                    const c = categories.find(cc => cc.value === b.category)!;
                    return (
                      <tr key={b.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50">
                        <td className="px-3 py-2 text-gray-500 text-[11px]">{b.date}</td>
                        <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${c.color}15`, color: c.color, fontWeight: 700 }}>{b.category}</span></td>
                        <td className="px-3 py-2 text-gray-800">{b.description}</td>
                        <td className="px-3 py-2 text-center text-gray-700">{b.qty}</td>
                        <td className="px-3 py-2 text-right text-gray-700">฿{b.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-gray-900" style={{ fontWeight: 700 }}>฿{b.total.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => askRemoveBill(b.id, b.description, b.total)}
                            className="vet-icon-btn vet-icon-btn-danger"
                            aria-label={`ลบรายการ ${b.description}`}
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200" style={{ background: "rgba(25,165,137,0.04)" }}>
                    <td colSpan={5} className="px-3 py-2.5 text-right text-gray-600" style={{ fontWeight: 700 }}>รวมทั้งสิ้น</td>
                    <td className="px-3 py-2.5 text-right text-[#0d7c66]" style={{ fontWeight: 800, fontSize: 14 }}>฿{totalItems.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Payments */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <CreditCard className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ประวัติการชำระเงิน</h3>
            <p className="text-[11px] text-gray-500">{pays.length} ครั้ง · รวม ฿{totalPaid.toLocaleString()}</p>
          </div>
          <button onClick={() => setShowPay(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> รับชำระ
          </button>
        </div>
        <div className="p-4">
          {pays.length === 0 ? (
            <div className="text-[11.5px] text-gray-400 text-center py-4">ยังไม่มีการชำระเงิน</div>
          ) : (
            <div className="space-y-1.5">
              {pays.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 bg-gray-50/40">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-emerald-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.10)", fontWeight: 700 }}>{p.method}</span>
                      <span className="text-[10.5px] text-gray-500">{fmtDateTime(p.paidAt)}</span>
                    </div>
                    {p.note && <div className="text-[11px] text-gray-600 mt-0.5">{p.note}</div>}
                  </div>
                  <div className="text-[14px] text-emerald-700 flex-shrink-0" style={{ fontWeight: 800 }}>+฿{p.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Invoice action */}
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => window.print()} className="vet-btn vet-btn-secondary inline-flex items-center gap-1">
          <Printer className="w-3.5 h-3.5" /> พิมพ์ใบเสร็จ/ใบแจ้งหนี้
        </button>
      </div>

      <AnimatePresence>
        {showAddBill && <BillAddModal admitId={admit.id} onClose={() => setShowAddBill(false)} />}
        {showPay && <PaymentModal admitId={admit.id} balance={balance} onClose={() => setShowPay(false)} />}
      </AnimatePresence>
    </div>
  );
}

function SumCard({ label, value, color, grad }: { label: string; value: string; color: string; grad: string }) {
  return (
    <div className="bg-white rounded-2xl border p-3" style={{ borderColor: `${color}25`, boxShadow: `0 4px 14px ${color}10` }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg" style={{ background: grad }} />
        <span className="text-[9.5px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div className="text-[18px]" style={{ fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

function BillAddModal({ admitId, onClose }: { admitId: number; onClose: () => void }) {
  const { addBill } = useIPD();
  const { showSnackbar } = useSnackbar();
  const [category, setCategory] = useState<BillCategory>("ค่ายา");
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const submit = () => {
    if (!description || !unitPrice) return;
    const q = parseInt(qty) || 1;
    const up = parseFloat(unitPrice) || 0;
    const disc = parseFloat(discount) || 0;
    const total = Math.max(0, q * up - disc);
    addBill({ admitId, date: today, category, description, qty: q, unitPrice: up, total, discount: disc || undefined });
    showSnackbar("success", `เพิ่มรายการ ฿${total.toLocaleString()} สำเร็จ`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #fb923c, #d97706)" }}><Receipt className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>เพิ่มรายการค่าใช้จ่าย</h3>
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
          <Field label="รายการ *"><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="vet-input" placeholder="เช่น Amoxicillin 100ml" /></Field>
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
          <button onClick={submit} disabled={!description || !unitPrice} className="vet-btn vet-btn-primary inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> เพิ่ม</button>
        </div>
      </motion.div>
    </div>
  );
}

function PaymentModal({ admitId, balance, onClose }: { admitId: number; balance: number; onClose: () => void }) {
  const { addPayment } = useIPD();
  const { showSnackbar } = useSnackbar();
  const [amount, setAmount] = useState(String(Math.max(0, balance)));
  const [method, setMethod] = useState<Payment["method"]>("Cash");
  const [note, setNote] = useState("");

  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    addPayment({ admitId, paidAt: new Date().toISOString(), amount: amt, method, note });
    showSnackbar("success", `รับชำระ ฿${amt.toLocaleString()} สำเร็จ`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[420px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}><CreditCard className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>รับชำระเงิน</h3>
            <p className="text-[11px] text-gray-500">ยอดค้าง ฿{balance.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="จำนวนเงิน *"><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="vet-input" /></Field>
          <Field label="วิธีชำระ">
            <div className="grid grid-cols-5 gap-1.5">
              {(["Cash", "Card", "Transfer", "Deposit", "Insurance"] as const).map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)} className={method === m ? "vet-chip vet-chip-active" : "vet-chip"} style={{ justifyContent: "center" }}>
                  {m}
                </button>
              ))}
            </div>
          </Field>
          <Field label="หมายเหตุ"><input type="text" value={note} onChange={e => setNote(e.target.value)} className="vet-input" placeholder="เลขที่บัตร, เลขอ้างอิง..." /></Field>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} className="vet-btn vet-btn-primary inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> รับชำระ</button>
        </div>
      </motion.div>
    </div>
  );
}
