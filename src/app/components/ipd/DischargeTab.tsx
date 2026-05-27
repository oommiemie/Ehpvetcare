import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  LogOut, FileText, Pill, Calendar, Check, AlertTriangle, Plus, X, Printer,
} from "lucide-react";
import { useIPD, type Admit } from "../../contexts/IPDContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

export function DischargeTab({ admit }: { admit: Admit }) {
  const navigate = useNavigate();
  const { bills, payments, drugs, discharge } = useIPD();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();

  const totalCharge = bills.filter(b => b.admitId === admit.id).reduce((s, b) => s + b.total, 0);
  const totalPaid = payments.filter(p => p.admitId === admit.id).reduce((s, p) => s + p.amount, 0);
  const balance = totalCharge - totalPaid;

  const activeDrugs = drugs.filter(d => d.admitId === admit.id && d.active);

  const [summary, setSummary] = useState(admit.dischargeSummary ?? "");
  const [takeHome, setTakeHome] = useState<string[]>(admit.takeHomeMeds ?? activeDrugs.map(d => `${d.drugName} ${d.dose} ${d.route} ${d.frequency}`));
  const [newMed, setNewMed] = useState("");
  const [followUpDate, setFollowUpDate] = useState(admit.followUpDate ?? "");
  const [followUpNote, setFollowUpNote] = useState(admit.followUpNote ?? "");

  const addMed = () => {
    if (!newMed.trim()) return;
    setTakeHome(p => [...p, newMed.trim()]);
    setNewMed("");
  };

  const removeMed = (i: number) => setTakeHome(p => p.filter((_, idx) => idx !== i));

  const handleDischarge = async () => {
    if (balance > 0) {
      const ok = await confirm({
        title: "ยังมียอดค้างชำระ",
        description: `ค้าง ฿${balance.toLocaleString()} — แนะนำให้เก็บเงินก่อน Discharge`,
        confirmLabel: "Discharge ทั้งที่ค้าง",
        kind: "warning",
      });
      if (!ok) return;
    }
    const ok = await confirm({
      title: `Discharge ${admit.petName}?`,
      description: "ระบบจะปิด Visit · ส่งข้อมูลกลับ OPD · เปิดกรงสำหรับผู้ป่วยรายอื่น",
      confirmLabel: "ยืนยัน Discharge",
      kind: "danger",
    });
    if (!ok) return;
    discharge(admit.id, { dischargeSummary: summary, takeHomeMeds: takeHome, followUpDate, followUpNote });
    showSnackbar("success", `Discharge ${admit.petName} สำเร็จ — ส่งกลับ OPD แล้ว`);
    navigate("/ipd/ward");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
      {/* LEFT — form */}
      <div className="space-y-4">
        {/* Discharge Summary */}
        <Section icon={FileText} title="สรุปการรักษา (Discharge Summary)">
          <textarea
            rows={6}
            value={summary}
            onChange={e => setSummary(e.target.value)}
            className="vet-textarea"
            placeholder={`สรุปอาการแรกเข้า: ${admit.diagnosis}\n\nการรักษาที่ให้:\n- ...\n\nผลการรักษา:\n- อาการดีขึ้น, สามารถจำหน่ายได้`}
          />
        </Section>

        {/* Take Home Meds */}
        <Section icon={Pill} title="ยากลับบ้าน (Take Home)">
          <div className="space-y-2">
            {takeHome.length === 0 ? (
              <div className="text-[11.5px] text-gray-400 text-center py-3">ยังไม่มียากลับบ้าน</div>
            ) : (
              takeHome.map((m, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 bg-gray-50/40">
                  <span className="text-[12px] text-gray-700 flex-1">{m}</span>
                  <button onClick={() => removeMed(i)} className="vet-icon-btn vet-icon-btn-danger" aria-label={`ลบ ${m}`} title="ลบ">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMed}
                onChange={e => setNewMed(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addMed(); } }}
                className="vet-input flex-1"
                placeholder="เช่น Amoxicillin 250mg 1 เม็ด PO q12h × 7 วัน"
              />
              <button onClick={addMed} className="vet-btn vet-btn-primary inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> เพิ่ม
              </button>
            </div>
          </div>
        </Section>

        {/* Follow-up */}
        <Section icon={Calendar} title="นัดติดตามอาการ">
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3">
            <div>
              <label className="vet-label">วันที่นัด</label>
              <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="vet-input" />
            </div>
            <div>
              <label className="vet-label">คำแนะนำ / เหตุผลนัด</label>
              <input type="text" value={followUpNote} onChange={e => setFollowUpNote(e.target.value)} className="vet-input" placeholder="ตรวจติดตามค่าไต ผลเลือด..." />
            </div>
          </div>
        </Section>
      </div>

      {/* RIGHT — actions */}
      <div className="space-y-4">
        {/* Balance check */}
        <section className="relative rounded-2xl p-4 overflow-hidden" style={{
          background: balance > 0
            ? "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(254,251,248,0.6))"
            : "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(254,251,248,0.6))",
          border: balance > 0 ? "1px solid rgba(245,158,11,0.30)" : "1px solid rgba(16,185,129,0.30)",
        }}>
          <div className="text-[10px] mb-1" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: balance > 0 ? "#b45309" : "#047857" }}>
            สถานะการชำระ
          </div>
          <div className="text-[24px]" style={{ fontWeight: 800, color: balance > 0 ? "#b45309" : "#047857", letterSpacing: "-0.5px" }}>
            {balance > 0 ? `ค้าง ฿${balance.toLocaleString()}` : "ครบแล้ว"}
          </div>
          <div className="text-[10.5px] text-gray-500 mt-1 flex items-center justify-between pt-2 border-t border-black/5">
            <span>รวม ฿{totalCharge.toLocaleString()}</span>
            <span>จ่าย ฿{totalPaid.toLocaleString()}</span>
          </div>
          {balance > 0 && (
            <div className="mt-3 flex items-start gap-1.5 text-[10.5px] text-amber-700" style={{ fontWeight: 600 }}>
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>กรุณาเก็บเงินก่อน Discharge — หรือยืนยันค้างชำระ</span>
            </div>
          )}
        </section>

        {/* Summary checklist */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 className="text-[12px] text-gray-500 mb-3" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ตรวจสอบก่อน Discharge</h3>
          <div className="space-y-2 text-[11.5px]">
            <CheckItem label="สรุปการรักษา" done={!!summary.trim()} />
            <CheckItem label={`ยากลับบ้าน (${takeHome.length} รายการ)`} done={takeHome.length > 0} />
            <CheckItem label="นัดติดตามอาการ" done={!!followUpDate} />
            <CheckItem label="ชำระเงินครบ" done={balance <= 0} />
            <CheckItem label="Consent ลงนาม" done={!!admit.consentSigned} />
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={handlePrint} className="vet-btn vet-btn-secondary w-full inline-flex items-center justify-center gap-1.5">
            <Printer className="w-3.5 h-3.5" /> พิมพ์ Discharge Summary
          </button>
          <button onClick={handleDischarge} className="vet-btn vet-btn-primary w-full inline-flex items-center justify-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> ยืนยัน Discharge & ส่งกลับ OPD
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Ico, title, children }: { icon: typeof FileText; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
          <Ico className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>{title}</h3>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{
        background: done ? "linear-gradient(135deg, #34d399, #059669)" : "#f3f4f6",
        boxShadow: done ? "0 2px 6px rgba(16,185,129,0.40)" : "none",
      }}>
        {done ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : <span className="text-gray-400 text-[10px]">○</span>}
      </span>
      <span className="text-gray-700" style={{ fontWeight: done ? 600 : 500, color: done ? "#111827" : "#6b7280" }}>{label}</span>
    </div>
  );
}
