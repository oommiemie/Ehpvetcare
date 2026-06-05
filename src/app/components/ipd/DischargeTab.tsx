import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  LogOut, FileText, Pill, Calendar, Check, AlertTriangle, Plus, X, Printer, Sparkles, ChevronRight,
} from "lucide-react";
import { useIPD, type Admit } from "../../contexts/IPDContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const SUMMARY_TEMPLATES: { label: string; build: (admit: Admit) => string }[] = [
  {
    label: "อาการดีขึ้น พร้อมจำหน่าย",
    build: (a) => `สรุปอาการแรกเข้า: ${a.diagnosis}\n\nการรักษาที่ให้:\n- ตรวจอาการสม่ำเสมอตาม Vital Signs\n- ให้ยาตามแผนการรักษา\n- พยาบาลดูแลใกล้ชิด\n\nผลการรักษา:\n- อาการดีขึ้นตามลำดับ ทานอาหารและน้ำได้ดี\n- ค่าตรวจอยู่ในเกณฑ์ปกติ\n- ไม่พบภาวะแทรกซ้อน\n\nคำแนะนำ:\n- พักผ่อนเพียงพอ\n- กินยาให้ครบตามที่จัดให้\n- มาตรวจตามนัด`,
  },
  {
    label: "อาการคงที่ ติดตามต่อ OPD",
    build: (a) => `สรุปอาการแรกเข้า: ${a.diagnosis}\n\nการรักษาที่ให้:\n- การรักษาเบื้องต้นและพยุงอาการ\n\nผลการรักษา:\n- อาการคงที่ ไม่แย่ลง\n- ต้องติดตามต่อที่ OPD\n\nคำแนะนำ:\n- สังเกตอาการที่บ้าน\n- หากอาการแย่ลงให้รีบกลับมาทันที`,
  },
  {
    label: "ผ่าตัด/หัตถการสำเร็จ",
    build: (a) => `สรุปอาการแรกเข้า: ${a.diagnosis}\n\nการรักษา:\n- ทำหัตถการ/ผ่าตัด\n- พักฟื้นในโรงพยาบาล\n\nผลการรักษา:\n- แผลผ่าตัดสะอาด ไม่มี discharge\n- สัตว์รู้สึกตัวดี เคลื่อนไหวได้\n\nคำแนะนำ:\n- ใส่ปลอกคอกันเลีย 7-10 วัน\n- จำกัดการเคลื่อนไหว\n- ตัดไหมตามนัด`,
  },
];

export function DischargeTab({ admit }: { admit: Admit }) {
  const navigate = useNavigate();
  const { bills, payments, drugs, discharge } = useIPD();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();

  const totalCharge = bills.filter(b => b.admitId === admit.id).reduce((s, b) => s + b.total, 0);
  const totalPaid = payments.filter(p => p.admitId === admit.id).reduce((s, p) => s + p.amount, 0);
  const balance = totalCharge - totalPaid;

  const activeDrugs = useMemo(() => drugs.filter(d => d.admitId === admit.id && d.active), [drugs, admit.id]);

  const [summary, setSummary] = useState(admit.dischargeSummary ?? "");
  const [takeHome, setTakeHome] = useState<string[]>(admit.takeHomeMeds ?? []);
  const [newMed, setNewMed] = useState("");
  const [followUpDate, setFollowUpDate] = useState(admit.followUpDate ?? "");
  const [followUpNote, setFollowUpNote] = useState(admit.followUpNote ?? "");

  const checklist = [
    { key: "summary",  label: "สรุปการรักษา",     done: !!summary.trim() },
    { key: "meds",     label: `ยากลับบ้าน${takeHome.length > 0 ? ` (${takeHome.length})` : ""}`, done: takeHome.length > 0 },
    { key: "followup", label: "นัดติดตามอาการ",    done: !!followUpDate },
    { key: "balance",  label: "ชำระเงินครบ",       done: balance <= 0 },
    { key: "consent",  label: "Consent ลงนาม",     done: !!admit.consentSigned },
  ];
  const doneCount = checklist.filter(c => c.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  const addMed = (text?: string) => {
    const v = (text ?? newMed).trim();
    if (!v) return;
    if (takeHome.includes(v)) return;
    setTakeHome(p => [...p, v]);
    setNewMed("");
  };
  const removeMed = (i: number) => setTakeHome(p => p.filter((_, idx) => idx !== i));

  const applyTemplate = (tpl: (a: Admit) => string) => {
    if (summary.trim()) {
      // confirm before overwriting
      if (!window.confirm("แทนที่ข้อความเดิม?")) return;
    }
    setSummary(tpl(admit));
  };

  const addFollowUpDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().slice(0, 10));
  };

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

  return (
    <div className="space-y-4">
      {/* TOP — Readiness progress bar */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <LogOut className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>พร้อม Discharge</h3>
            <p className="text-[11px] text-gray-500">เสร็จแล้ว {doneCount}/{checklist.length} รายการ · {progress}%</p>
          </div>
          <div className="text-right">
            <div className="text-[22px]" style={{ fontWeight: 800, letterSpacing: "-0.5px", color: progress === 100 ? "#059669" : "#111827" }}>{progress}%</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? "linear-gradient(90deg, #34d399, #0d7c66)"
                : "linear-gradient(90deg, #fbbf24, #f59e0b)",
            }}
          />
        </div>

        {/* Checklist horizontal */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {checklist.map(c => (
            <div key={c.key} className="flex items-center gap-1.5 text-[11px]" style={{ fontWeight: c.done ? 700 : 500, color: c.done ? "#0d7c66" : "#6b7280" }}>
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: c.done ? "#0d7c66" : "#e5e7eb" }}
              >
                {c.done ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} /> : null}
              </span>
              <span className="truncate">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        {/* LEFT — form */}
        <div className="space-y-4">
          {/* Discharge Summary */}
          <Section icon={FileText} title="สรุปการรักษา" subtitle="เลือก template หรือพิมพ์เอง">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SUMMARY_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => applyTemplate(tpl.build)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {tpl.label}
                </button>
              ))}
            </div>
            <textarea
              rows={8}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="vet-textarea"
              placeholder={`สรุปอาการแรกเข้า: ${admit.diagnosis}\nการรักษาที่ให้: ...\nผลการรักษา: ...`}
            />
          </Section>

          {/* Take Home Meds */}
          <Section icon={Pill} title="ยากลับบ้าน (Take Home)" subtitle={`${takeHome.length} รายการ${activeDrugs.length > 0 ? ` · ดึงจากยา active ${activeDrugs.length} ใบสั่ง` : ""}`}>
            {/* Active drugs — toggle to include */}
            {activeDrugs.length > 0 && (
              <div className="mb-4">
                <div className="text-[10px] text-gray-500 mb-2" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                  ยาที่กำลังให้ใน Visit นี้
                </div>
                <div className="space-y-1.5">
                  {activeDrugs.map(d => {
                    const text = `${d.drugName} ${d.dose} ${d.route} ${d.frequency}${d.durationDays ? ` × ${d.durationDays}วัน` : ""}`;
                    const included = takeHome.includes(text) || takeHome.some(m => m.startsWith(d.drugName));
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          if (included) {
                            setTakeHome(p => p.filter(m => !m.startsWith(d.drugName)));
                          } else {
                            addMed(text);
                          }
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left"
                        style={{
                          borderColor: included ? "rgba(13,124,102,0.30)" : "#e5e7eb",
                          background: included ? "rgba(13,124,102,0.04)" : "#ffffff",
                        }}
                      >
                        {/* Checkbox */}
                        <span
                          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: included ? "#0d7c66" : "#ffffff",
                            border: `1.5px solid ${included ? "#0d7c66" : "#d1d5db"}`,
                          }}
                        >
                          {included && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
                        </span>

                        {/* Drug info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>{d.drugName}</span>
                            {d.strength && <span className="text-[10px] text-gray-500">{d.strength}</span>}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap mt-0.5">
                            <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded-full bg-gray-100" style={{ fontWeight: 600 }}>{d.dose}</span>
                            <span className="text-[10px] text-sky-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.10)", fontWeight: 700 }}>{d.route}</span>
                            <span className="text-[10px] text-purple-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.10)", fontWeight: 700 }}>{d.frequency}</span>
                            {d.durationDays ? <span className="text-[10px] text-gray-500">{d.durationDays} วัน</span> : null}
                          </div>
                        </div>

                        {included && (
                          <span className="text-[10px] text-[#0d7c66] inline-flex items-center gap-0.5 flex-shrink-0" style={{ fontWeight: 700 }}>
                            <Check className="w-3 h-3" /> รวมในใบยา
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom meds (not matching any active drug) */}
            {(() => {
              const customMeds = takeHome.filter(m => !activeDrugs.some(d => m.startsWith(d.drugName)));
              if (customMeds.length === 0) return null;
              return (
                <div className="mb-4">
                  <div className="text-[10px] text-gray-500 mb-2" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                    ยาเพิ่มเติม (พิมพ์เอง)
                  </div>
                  <ul className="space-y-1.5">
                    {customMeds.map((m) => {
                      const idx = takeHome.indexOf(m);
                      return (
                        <li key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 bg-gray-50/40">
                          <span className="w-5 h-5 rounded-md flex items-center justify-center bg-[#0d7c66] flex-shrink-0">
                            <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
                          </span>
                          <span className="text-[12px] text-gray-800 flex-1" style={{ fontWeight: 500 }}>{m}</span>
                          <button onClick={() => removeMed(idx)} className="vet-icon-btn vet-icon-btn-danger" aria-label={`ลบ ${m}`} title="ลบ">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}

            {/* Manual add input */}
            <div>
              <div className="text-[10px] text-gray-500 mb-2" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                เพิ่มยานอกระบบ
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMed}
                  onChange={e => setNewMed(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addMed(); } }}
                  className="vet-input flex-1"
                  placeholder="เช่น Amoxicillin 250mg 1 เม็ด PO q12h × 7 วัน"
                />
                <button onClick={() => addMed()} disabled={!newMed.trim()} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> เพิ่ม
                </button>
              </div>
            </div>

            {/* Empty state when no active drugs + no custom */}
            {activeDrugs.length === 0 && takeHome.length === 0 && (
              <div className="mt-3 text-[11.5px] text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                ยังไม่มียา active ใน Visit นี้ — พิมพ์ยาเองในช่องด้านบน
              </div>
            )}
          </Section>

          {/* Follow-up */}
          <Section icon={Calendar} title="นัดติดตามอาการ" subtitle={followUpDate ? new Date(followUpDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "ยังไม่กำหนด"}>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: "+ 3 วัน", days: 3 },
                { label: "+ 1 สัปดาห์", days: 7 },
                { label: "+ 2 สัปดาห์", days: 14 },
                { label: "+ 1 เดือน", days: 30 },
              ].map(s => (
                <button
                  key={s.days}
                  onClick={() => addFollowUpDays(s.days)}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  {s.label}
                </button>
              ))}
            </div>
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
        <div className="space-y-4 lg:sticky lg:top-4">
          {/* Balance check */}
          <section className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="text-[10px] text-gray-500 mb-1" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
              สถานะการชำระ
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: balance > 0 ? "#dc2626" : "#0d7c66", letterSpacing: "-0.5px" }}>
              {balance > 0 ? `ค้าง ฿${balance.toLocaleString()}` : "ครบแล้ว"}
            </div>
            <div className="text-[10.5px] text-gray-500 mt-2 flex items-center justify-between pt-2 border-t border-gray-100">
              <span>รวม ฿{totalCharge.toLocaleString()}</span>
              <span>จ่าย ฿{totalPaid.toLocaleString()}</span>
            </div>
            {balance > 0 && (
              <div className="mt-3 flex items-start gap-1.5 text-[10.5px] p-2 rounded-lg" style={{ background: "rgba(245,158,11,0.08)", color: "#b45309", fontWeight: 600 }}>
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>เก็บเงินก่อน Discharge หรือยืนยันค้างชำระ</span>
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={() => window.print()} className="vet-btn vet-btn-secondary w-full inline-flex items-center justify-center gap-1.5">
              <Printer className="w-3.5 h-3.5" /> พิมพ์ Discharge Summary
            </button>
            <button
              onClick={handleDischarge}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white transition-all active:scale-[0.99]"
              style={{
                background: progress === 100
                  ? "linear-gradient(135deg, #19a589, #0d7c66)"
                  : "linear-gradient(135deg, #34d399, #059669)",
                boxShadow: "0 6px 16px rgba(13,124,102,0.30)",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "-0.2px",
              }}
            >
              <LogOut className="w-4 h-4" />
              ยืนยัน Discharge
              <ChevronRight className="w-4 h-4" />
            </button>
            {progress < 100 && (
              <div className="text-[10.5px] text-amber-600 text-center" style={{ fontWeight: 600 }}>
                ⚠ ยังไม่ครบ {checklist.length - doneCount} รายการ — Discharge ได้แต่อาจไม่สมบูรณ์
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Ico, title, subtitle, children }: { icon: typeof FileText; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
          <Ico className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
