import { useState, useEffect } from "react";
import { Scissors, Users, Activity, ClipboardList, HeartPulse, Plus, Trash2, Check, AlertTriangle } from "lucide-react";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface AnesthesiaDrug {
  id: string;
  name: string;
  stage: "Premed" | "Induction" | "Maintenance" | "Recovery";
  dose: string;
  route: string;
}

interface PostOpMed {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
}

interface SurgeryRecord {
  diagnosis: string;
  procedure: string;
  date: string;
  startTime: string;
  endTime: string;
  isEmergency: boolean;
  surgeon: string;
  anesthetist: string;
  scrubNurse: string;
  asaStatus: "I" | "II" | "III" | "IV" | "V";
  anesthesiaDrugs: AnesthesiaDrug[];
  intraopFindings: string;
  surgicalSteps: string;
  complications: string;
  outcome: string;
  postOpPlan: string;
  postOpMeds: PostOpMed[];
  ownerInstructions: string;
}

const DEFAULT_RECORD: SurgeryRecord = {
  diagnosis: "",
  procedure: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "",
  endTime: "",
  isEmergency: false,
  surgeon: "สพญ. ปาริชาติ บุญมี — Surgery",
  anesthetist: "สพญ. กนลอนก ศรีสุข — Critical Care",
  scrubNurse: "",
  asaStatus: "II",
  anesthesiaDrugs: [],
  intraopFindings: "",
  surgicalSteps: "",
  complications: "",
  outcome: "",
  postOpPlan: "",
  postOpMeds: [],
  ownerInstructions: "",
};

const ASA_OPTIONS: { value: SurgeryRecord["asaStatus"]; label: string; color: string }[] = [
  { value: "I",   label: "I — ปกติ",           color: "#10b981" },
  { value: "II",  label: "II — โรคเล็กน้อย",   color: "#84cc16" },
  { value: "III", label: "III — โรครุนแรง",    color: "#f59e0b" },
  { value: "IV",  label: "IV — คุกคามชีวิต",   color: "#f97316" },
  { value: "V",   label: "V — วิกฤต",          color: "#ef4444" },
];

const ROUTES = ["IV", "IM", "SC", "PO", "INH", "Topical"];
const STAGES: AnesthesiaDrug["stage"][] = ["Premed", "Induction", "Maintenance", "Recovery"];

const fieldCls = "w-full text-[12.5px] text-gray-700 rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-[#19a589]";
const textareaCls = `${fieldCls} resize-none leading-relaxed`;

function load(key: string): SurgeryRecord {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...DEFAULT_RECORD, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_RECORD;
}

export function SurgeryRecordTab({ admitId }: { admitId: number }) {
  const { showSnackbar } = useSnackbar();
  const storageKey = `vet-ipd-surgery-${admitId}`;
  const [rec, setRec] = useState<SurgeryRecord>(() => load(storageKey));

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(rec)); } catch { /* ignore */ }
  }, [rec, storageKey]);

  const setField = <K extends keyof SurgeryRecord>(k: K, v: SurgeryRecord[K]) => setRec(r => ({ ...r, [k]: v }));

  const addAnesDrug = () => setRec(r => ({ ...r, anesthesiaDrugs: [...r.anesthesiaDrugs, { id: `a-${Date.now()}`, name: "", stage: "Premed", dose: "", route: "IV" }] }));
  const updateAnesDrug = (id: string, patch: Partial<AnesthesiaDrug>) => setRec(r => ({ ...r, anesthesiaDrugs: r.anesthesiaDrugs.map(d => d.id === id ? { ...d, ...patch } : d) }));
  const removeAnesDrug = (id: string) => setRec(r => ({ ...r, anesthesiaDrugs: r.anesthesiaDrugs.filter(d => d.id !== id) }));

  const addPostMed = () => setRec(r => ({ ...r, postOpMeds: [...r.postOpMeds, { id: `pm-${Date.now()}`, name: "", dose: "", frequency: "q12h", route: "IV" }] }));
  const updatePostMed = (id: string, patch: Partial<PostOpMed>) => setRec(r => ({ ...r, postOpMeds: r.postOpMeds.map(m => m.id === id ? { ...m, ...patch } : m) }));
  const removePostMed = (id: string) => setRec(r => ({ ...r, postOpMeds: r.postOpMeds.filter(m => m.id !== id) }));

  const handleSave = () => {
    showSnackbar("success", "บันทึกการผ่าตัดเรียบร้อย");
  };

  return (
    <div className="space-y-4">
      {/* 1. Operation info */}
      <Section icon={Scissors} title="ข้อมูลการผ่าตัด" subtitle="Operation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="vet-label">การวินิจฉัย (Diagnosis) <span className="required">*</span></label>
            <input value={rec.diagnosis} onChange={e => setField("diagnosis", e.target.value)} placeholder="เช่น Gastric Dilatation-Volvulus (GDV)" className={fieldCls} />
          </div>
          <div>
            <label className="vet-label">หัตถการ (Procedure) <span className="required">*</span></label>
            <input value={rec.procedure} onChange={e => setField("procedure", e.target.value)} placeholder="เลือกหรือพิมพ์" className={fieldCls} />
          </div>
          <div>
            <label className="vet-label">วันที่ผ่าตัด <span className="required">*</span></label>
            <input type="date" value={rec.date} onChange={e => setField("date", e.target.value)} className={fieldCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="vet-label">เริ่ม</label>
              <input type="time" value={rec.startTime} onChange={e => setField("startTime", e.target.value)} className={fieldCls} />
            </div>
            <div>
              <label className="vet-label">สิ้นสุด</label>
              <input type="time" value={rec.endTime} onChange={e => setField("endTime", e.target.value)} className={fieldCls} />
            </div>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none">
          <span className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${rec.isEmergency ? "bg-rose-500" : "bg-gray-100 border border-gray-300"}`}>
            {rec.isEmergency && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </span>
          <span className="text-[12.5px] text-gray-700" style={{ fontWeight: 500 }}>เคสฉุกเฉิน (Emergency surgery)</span>
          <input type="checkbox" checked={rec.isEmergency} onChange={e => setField("isEmergency", e.target.checked)} className="hidden" />
        </label>
      </Section>

      {/* 2. Surgical team */}
      <Section icon={Users} title="ทีมผ่าตัด" subtitle="Surgical team">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="vet-label">ศัลยแพทย์ (Surgeon) <span className="required">*</span></label>
            <input value={rec.surgeon} onChange={e => setField("surgeon", e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className="vet-label">วิสัญญีแพทย์ (Anesthetist) <span className="required">*</span></label>
            <input value={rec.anesthetist} onChange={e => setField("anesthetist", e.target.value)} className={fieldCls} />
          </div>
        </div>
        <div className="mt-3">
          <label className="vet-label">ผู้ช่วยผ่าตัด / Scrub nurse</label>
          <input value={rec.scrubNurse} onChange={e => setField("scrubNurse", e.target.value)} placeholder="น.สพ. อนุชา · พว. ศุภวัชญ์" className={fieldCls} />
        </div>
      </Section>

      {/* 3. Anesthesia */}
      <Section icon={Activity} title="วิสัญญี & ยาสลบ" subtitle="Anesthesia" rightAccent={`${rec.anesthesiaDrugs.length} รายการ`}>
        <div className="mb-3">
          <label className="vet-label">ASA Physical Status <span className="required">*</span></label>
          <div className="flex flex-wrap gap-1.5">
            {ASA_OPTIONS.map(o => {
              const active = rec.asaStatus === o.value;
              return (
                <button key={o.value} type="button" onClick={() => setField("asaStatus", o.value)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11.5px] transition-all"
                  style={{
                    background: active ? o.color : "#ffffff",
                    border: `1px solid ${active ? o.color : "#e5e7eb"}`,
                    color: active ? "#ffffff" : "#6b7280",
                    fontWeight: active ? 700 : 500,
                  }}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {rec.anesthesiaDrugs.map(d => (
            <div key={d.id} className="grid grid-cols-[1fr_140px_120px_100px_36px] gap-2 items-center">
              <input value={d.name} onChange={e => updateAnesDrug(d.id, { name: e.target.value })} placeholder="ยา (DRUG)" className={fieldCls} />
              <select value={d.stage} onChange={e => updateAnesDrug(d.id, { stage: e.target.value as AnesthesiaDrug["stage"] })} className={fieldCls}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input value={d.dose} onChange={e => updateAnesDrug(d.id, { dose: e.target.value })} placeholder="ขนาด (DOSE)" className={fieldCls} />
              <select value={d.route} onChange={e => updateAnesDrug(d.id, { route: e.target.value })} className={fieldCls}>
                {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={() => removeAnesDrug(d.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500" title="ลบ">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addAnesDrug} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] text-[#0d7c66] border border-dashed border-[#19a589]/45 hover:bg-[#19a589]/5" style={{ fontWeight: 600 }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่มยา
        </button>
      </Section>

      {/* 4. Operative details */}
      <Section icon={ClipboardList} title="รายละเอียดการผ่าตัด" subtitle="Operative details">
        <div className="space-y-3">
          <div>
            <label className="vet-label">สิ่งที่พบระหว่างผ่าตัด (Intraoperative findings) <span className="required">*</span></label>
            <textarea value={rec.intraopFindings} onChange={e => setField("intraopFindings", e.target.value)} rows={3} placeholder="เช่น กระเพาะบิด 360° เนื้อยังมีชีวิตดี ม้ามบวมคั่งเลือดแต่กลับมาปกติ..." className={textareaCls} />
          </div>
          <div>
            <label className="vet-label">ขั้นตอนการผ่าตัด (Surgical steps) <span className="required">*</span></label>
            <textarea value={rec.surgicalSteps} onChange={e => setField("surgicalSteps", e.target.value)} rows={3} placeholder="บรรยายขั้นตอน หรือพิมพ์ละบรรทัด..." className={textareaCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="vet-label">ภาวะแทรกซ้อน (Complications)</label>
              <textarea value={rec.complications} onChange={e => setField("complications", e.target.value)} rows={2} placeholder="เช่น VPCs ช่วง reperfusion — คุมด้วย lidocaine / ไม่มี" className={textareaCls} />
            </div>
            <div>
              <label className="vet-label">ผลการผ่าตัด (Outcome) <span className="required">*</span></label>
              <textarea value={rec.outcome} onChange={e => setField("outcome", e.target.value)} rows={2} placeholder="เช่น สำเร็จด้วยดี ฟื้นจากยาสลบเรียบร้อย" className={textareaCls} />
            </div>
          </div>
        </div>
      </Section>

      {/* 5. Post-operative */}
      <Section icon={HeartPulse} title="หลังผ่าตัด" subtitle="Post-operative">
        <div>
          <label className="vet-label">แผนการรักษาหลังผ่าตัด (Post-op plan) <span className="required">*</span></label>
          <textarea value={rec.postOpPlan} onChange={e => setField("postOpPlan", e.target.value)} rows={2} placeholder="เฝ้าระวัง ICU, สารน้ำ, NPO/การให้อาหาร, การติดตาม..." className={textareaCls} />
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="vet-label" style={{ marginBottom: 0 }}>ยาที่ได้รับ (Post-op medications)</label>
            <span className="text-[10.5px] text-gray-400">{rec.postOpMeds.length} รายการ</span>
          </div>
          <div className="space-y-2">
            {rec.postOpMeds.map(m => (
              <div key={m.id} className="grid grid-cols-[1fr_120px_120px_100px_36px] gap-2 items-center">
                <input value={m.name} onChange={e => updatePostMed(m.id, { name: e.target.value })} placeholder="ยา เช่น Methadone" className={fieldCls} />
                <input value={m.dose} onChange={e => updatePostMed(m.id, { dose: e.target.value })} placeholder="ขนาด 0.2 mg/kg" className={fieldCls} />
                <input value={m.frequency} onChange={e => updatePostMed(m.id, { frequency: e.target.value })} placeholder="ความถี่ q6h" className={fieldCls} />
                <select value={m.route} onChange={e => updatePostMed(m.id, { route: e.target.value })} className={fieldCls}>
                  {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button onClick={() => removePostMed(m.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500" title="ลบ">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addPostMed} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] text-[#0d7c66] border border-dashed border-[#19a589]/45 hover:bg-[#19a589]/5" style={{ fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5" /> เพิ่มยา
          </button>
        </div>

        <div className="mt-3">
          <label className="vet-label">คำแนะนำเจ้าของสัตว์ (Owner instruction) <span className="required">*</span></label>
          <textarea value={rec.ownerInstructions} onChange={e => setField("ownerInstructions", e.target.value)} rows={3} placeholder="จำกัดการออกกำลัง, การให้อาหาร, สัญญาณอันตราย, นัดติดตาม..." className={textareaCls} />
        </div>
      </Section>

      <div className="flex justify-end gap-2">
        <button onClick={() => showSnackbar("info", "บันทึกร่างแล้ว")} className="px-4 py-2 text-[12.5px] text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200" style={{ fontWeight: 600 }}>
          บันทึกร่าง
        </button>
        <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-5 py-2 text-[12.5px] text-white rounded-full" style={{ fontWeight: 700, background: "linear-gradient(135deg,#19a589,#0d7c66)", boxShadow: "0 4px 14px rgba(25,165,137,0.28)" }}>
          <Check className="w-4 h-4" /> บันทึกการผ่าตัด
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, rightAccent, children }: { icon: typeof Scissors; title: string; subtitle?: string; rightAccent?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
          <Icon className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
        </div>
        {rightAccent && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px]" style={{ fontWeight: 700, background: "rgba(25,165,137,0.10)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)" }}>
            {rightAccent}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
