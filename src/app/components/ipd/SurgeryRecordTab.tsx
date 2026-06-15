import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scissors, Users, Activity, ClipboardList, HeartPulse, Plus, Trash2, Check, Pencil, X, Calendar, AlertTriangle } from "lucide-react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";
import { DatePickerModern } from "../DatePickerModern";
import { TimePickerModern } from "../TimePickerModern";

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

export interface SurgeryRecord {
  id: string;
  createdAt: string;
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

const emptyRecord = (): SurgeryRecord => ({
  id: `s-${Date.now()}`,
  createdAt: new Date().toISOString(),
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
});

const ASA_OPTIONS: { value: SurgeryRecord["asaStatus"]; label: string; color: string }[] = [
  { value: "I",   label: "I — ปกติ",           color: "#10b981" },
  { value: "II",  label: "II — โรคเล็กน้อย",   color: "#84cc16" },
  { value: "III", label: "III — โรครุนแรง",    color: "#f59e0b" },
  { value: "IV",  label: "IV — คุกคามชีวิต",   color: "#f97316" },
  { value: "V",   label: "V — วิกฤต",          color: "#ef4444" },
];

const ROUTES = ["IV", "IM", "SC", "PO", "INH", "Topical"];
const STAGES: AnesthesiaDrug["stage"][] = ["Premed", "Induction", "Maintenance", "Recovery"];

const ANES_DRUGS = [
  "Acepromazine", "Atropine", "Buprenorphine", "Bupivacaine", "Butorphanol",
  "Dexmedetomidine", "Diazepam (Valium)", "Etomidate", "Fentanyl", "Glycopyrrolate",
  "Isoflurane", "Ketamine", "Lidocaine", "Medetomidine", "Methadone",
  "Midazolam", "Morphine", "Pethidine", "Propofol", "Sevoflurane",
  "Thiopental", "Tramadol", "Xylazine", "Yohimbine",
];

const POSTOP_DRUGS = [
  "Amoxicillin/Clavulanate (Synulox)", "Buprenorphine", "Carprofen (Rimadyl)",
  "Cefovecin (Convenia)", "Cephalexin", "Enrofloxacin (Baytril)", "Famotidine",
  "Firocoxib", "Gabapentin", "Maropitant (Cerenia)", "Meloxicam (Metacam)",
  "Methadone", "Metronidazole", "Omeprazole", "Ondansetron", "Pradofloxacin",
  "Ranitidine", "Robenacoxib (Onsior)", "Sucralfate", "Tramadol", "Tranexamic acid",
];

function loadRecords(key: string): SurgeryRecord[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Backward compat: previously stored a single object. Convert to array.
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object" && "diagnosis" in parsed) {
        return [{ ...emptyRecord(), ...parsed, id: parsed.id ?? `s-${Date.now()}` }];
      }
    }
  } catch { /* ignore */ }
  return [];
}

const thaiDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return "—";
  const M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear() + 543}`;
};

export function SurgeryRecordTab({ admitId }: { admitId: number }) {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const storageKey = `vet-ipd-surgery-${admitId}`;

  const [records, setRecords] = useState<SurgeryRecord[]>(() => loadRecords(storageKey));
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<SurgeryRecord>(() => emptyRecord());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<SurgeryRecord | null>(null);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(records)); } catch { /* ignore */ }
  }, [records, storageKey]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyRecord());
    setModalOpen(true);
  };

  const openEdit = (r: SurgeryRecord) => {
    setEditingId(r.id);
    setDraft({ ...r });
    setModalOpen(true);
  };

  const handleRemove = async (r: SurgeryRecord) => {
    const ok = await confirm({
      title: "ลบบันทึกการผ่าตัด?",
      description: `${r.procedure || r.diagnosis || "บันทึกนี้"} — การกระทำนี้ย้อนกลับไม่ได้`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (ok) {
      setRecords(prev => prev.filter(x => x.id !== r.id));
      showSnackbar("delete", "ลบบันทึกการผ่าตัดแล้ว");
    }
  };

  const setField = <K extends keyof SurgeryRecord>(k: K, v: SurgeryRecord[K]) => setDraft(d => ({ ...d, [k]: v }));
  const addAnesDrug = () => setDraft(d => ({ ...d, anesthesiaDrugs: [...d.anesthesiaDrugs, { id: `a-${Date.now()}`, name: "", stage: "Premed", dose: "", route: "IV" }] }));
  const updateAnesDrug = (id: string, patch: Partial<AnesthesiaDrug>) => setDraft(d => ({ ...d, anesthesiaDrugs: d.anesthesiaDrugs.map(x => x.id === id ? { ...x, ...patch } : x) }));
  const removeAnesDrug = (id: string) => setDraft(d => ({ ...d, anesthesiaDrugs: d.anesthesiaDrugs.filter(x => x.id !== id) }));
  const addPostMed = () => setDraft(d => ({ ...d, postOpMeds: [...d.postOpMeds, { id: `pm-${Date.now()}`, name: "", dose: "", frequency: "q12h", route: "IV" }] }));
  const updatePostMed = (id: string, patch: Partial<PostOpMed>) => setDraft(d => ({ ...d, postOpMeds: d.postOpMeds.map(x => x.id === id ? { ...x, ...patch } : x) }));
  const removePostMed = (id: string) => setDraft(d => ({ ...d, postOpMeds: d.postOpMeds.filter(x => x.id !== id) }));

  const canSave = !!draft.diagnosis.trim() && !!draft.procedure.trim();

  const handleSave = () => {
    if (!canSave) return;
    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? { ...draft } : r));
      showSnackbar("success", "แก้ไขบันทึกการผ่าตัดแล้ว");
    } else {
      setRecords(prev => [{ ...draft, id: `s-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
      showSnackbar("success", "บันทึกการผ่าตัดเรียบร้อย");
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <Scissors className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>การผ่าตัด</h3>
            <p className="text-[11px] text-gray-500">{records.length} รายการ</p>
          </div>
          <button onClick={openCreate} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> เพิ่มการผ่าตัด
          </button>
        </div>

        <div className="p-4">
          {records.length === 0 ? (
            <button onClick={openCreate} className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-500">
              <Scissors className="w-10 h-10 mb-2" strokeWidth={1.5} />
              <div className="text-[12px] mb-2" style={{ fontWeight: 600 }}>ยังไม่มีบันทึกการผ่าตัด</div>
              <div className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#e8802a,#d06a1a)", fontWeight: 700 }}>
                <Plus className="w-3 h-3" /> เพิ่มรายการแรก
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              {records.map(r => {
                const asa = ASA_OPTIONS.find(a => a.value === r.asaStatus)!;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setPreviewRecord(r)}
                    className="group w-full text-left rounded-2xl border border-gray-100 bg-white p-3 hover:shadow-md hover:border-[#19a589]/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: "linear-gradient(135deg,#fb7185,#e11d48)" }}>
                        <Scissors className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{r.procedure || r.diagnosis || "ไม่ได้ระบุ"}</p>
                          {r.isEmergency && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px]" style={{ fontWeight: 700, background: "rgba(239,68,68,0.10)", color: "#b91c1c", border: "1px solid rgba(239,68,68,0.30)" }}>
                              <AlertTriangle className="w-2.5 h-2.5" /> Emergency
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px]" style={{ fontWeight: 700, background: `${asa.color}1f`, color: asa.color, border: `1px solid ${asa.color}55` }}>ASA {r.asaStatus}</span>
                        </div>
                        {r.diagnosis && r.procedure && (
                          <p className="text-[11px] text-gray-500 truncate">Dx: {r.diagnosis}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-[10.5px] text-gray-400 flex-wrap">
                          <span className="inline-flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {thaiDate(r.date)}{r.startTime ? ` · ${r.startTime}${r.endTime ? `-${r.endTime}` : ""}` : ""}</span>
                          {r.surgeon && <span className="truncate">👨‍⚕️ {r.surgeon}</span>}
                          {r.outcome && <span className="truncate">✓ {r.outcome}</span>}
                        </div>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={e => { e.stopPropagation(); openEdit(r); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                          title="แก้ไข"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={e => { e.stopPropagation(); handleRemove(r); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Preview popup — read-only view */}
      <AnimatePresence>
        {previewRecord && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setPreviewRecord(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }}
              className="bg-white rounded-3xl w-full max-w-[680px] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="vet-modal-header flex items-center gap-3">
                <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#fb7185,#e11d48)" }}>
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: 16 }}>{previewRecord.procedure || previewRecord.diagnosis || "บันทึกการผ่าตัด"}</h3>
                  <p className="text-[11px] text-gray-500">{thaiDate(previewRecord.date)}{previewRecord.startTime ? ` · ${previewRecord.startTime}${previewRecord.endTime ? `-${previewRecord.endTime}` : ""}` : ""}</p>
                </div>
                <button onClick={() => setPreviewRecord(null)} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
              </div>

              <div className="vet-modal-body space-y-3">
                {/* Status badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {previewRecord.isEmergency && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px]" style={{ fontWeight: 700, background: "rgba(239,68,68,0.10)", color: "#b91c1c", border: "1px solid rgba(239,68,68,0.30)" }}>
                      <AlertTriangle className="w-3 h-3" /> Emergency
                    </span>
                  )}
                  {(() => {
                    const asa = ASA_OPTIONS.find(a => a.value === previewRecord.asaStatus)!;
                    return (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px]" style={{ fontWeight: 700, background: `${asa.color}1f`, color: asa.color, border: `1px solid ${asa.color}55` }}>
                        ASA {asa.label}
                      </span>
                    );
                  })()}
                </div>

                <PreviewSection icon={Scissors} title="ข้อมูลการผ่าตัด">
                  <PreviewField label="การวินิจฉัย" value={previewRecord.diagnosis} />
                  <PreviewField label="หัตถการ" value={previewRecord.procedure} />
                </PreviewSection>

                <PreviewSection icon={Users} title="ทีมผ่าตัด">
                  <PreviewField label="ศัลยแพทย์" value={previewRecord.surgeon} />
                  <PreviewField label="วิสัญญีแพทย์" value={previewRecord.anesthetist} />
                  {previewRecord.scrubNurse && <PreviewField label="ผู้ช่วย" value={previewRecord.scrubNurse} />}
                </PreviewSection>

                {previewRecord.anesthesiaDrugs.length > 0 && (
                  <PreviewSection icon={Activity} title={`วิสัญญี & ยาสลบ (${previewRecord.anesthesiaDrugs.length})`}>
                    <div className="space-y-1.5">
                      {previewRecord.anesthesiaDrugs.map(d => (
                        <div key={d.id} className="flex items-center gap-2 text-[12px] py-1.5 px-2 rounded-lg bg-gray-50">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] flex-shrink-0" style={{ fontWeight: 700, background: "rgba(25,165,137,0.10)", color: "#0d7c66" }}>{d.stage}</span>
                          <span className="flex-1 truncate text-gray-900" style={{ fontWeight: 600 }}>{d.name || "—"}</span>
                          <span className="text-gray-500">{d.dose}</span>
                          <span className="text-gray-400 text-[10.5px]">{d.route}</span>
                        </div>
                      ))}
                    </div>
                  </PreviewSection>
                )}

                {(previewRecord.intraopFindings || previewRecord.surgicalSteps || previewRecord.complications || previewRecord.outcome) && (
                  <PreviewSection icon={ClipboardList} title="รายละเอียดการผ่าตัด">
                    {previewRecord.intraopFindings && <PreviewField label="สิ่งที่พบ" value={previewRecord.intraopFindings} multiline />}
                    {previewRecord.surgicalSteps && <PreviewField label="ขั้นตอน" value={previewRecord.surgicalSteps} multiline />}
                    {previewRecord.complications && <PreviewField label="ภาวะแทรกซ้อน" value={previewRecord.complications} multiline />}
                    {previewRecord.outcome && <PreviewField label="ผลการผ่าตัด" value={previewRecord.outcome} multiline />}
                  </PreviewSection>
                )}

                {(previewRecord.postOpPlan || previewRecord.postOpMeds.length > 0 || previewRecord.ownerInstructions) && (
                  <PreviewSection icon={HeartPulse} title="หลังผ่าตัด">
                    {previewRecord.postOpPlan && <PreviewField label="แผนการรักษา" value={previewRecord.postOpPlan} multiline />}
                    {previewRecord.postOpMeds.length > 0 && (
                      <div>
                        <div className="text-[11px] text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>ยาที่ได้รับ ({previewRecord.postOpMeds.length})</div>
                        <div className="space-y-1.5">
                          {previewRecord.postOpMeds.map(m => (
                            <div key={m.id} className="flex items-center gap-2 text-[12px] py-1.5 px-2 rounded-lg bg-gray-50">
                              <span className="flex-1 truncate text-gray-900" style={{ fontWeight: 600 }}>{m.name || "—"}</span>
                              <span className="text-gray-500">{m.dose}</span>
                              <span className="text-gray-500">{m.frequency}</span>
                              <span className="text-gray-400 text-[10.5px]">{m.route}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {previewRecord.ownerInstructions && <PreviewField label="คำแนะนำเจ้าของ" value={previewRecord.ownerInstructions} multiline />}
                  </PreviewSection>
                )}
              </div>

              <div className="vet-modal-footer">
                <button onClick={() => { const r = previewRecord; setPreviewRecord(null); if (r) handleRemove(r); }} className="vet-btn vet-btn-ghost text-red-500 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" /> ลบ
                </button>
                <div className="flex-1" />
                <button onClick={() => setPreviewRecord(null)} className="vet-btn vet-btn-secondary">ปิด</button>
                <button onClick={() => { const r = previewRecord; setPreviewRecord(null); if (r) openEdit(r); }} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
                  <Pencil className="w-3.5 h-3.5" /> แก้ไข
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / edit popup */}
      <AnimatePresence>
        {modalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }}
              className="bg-white rounded-3xl w-full max-w-[760px] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="vet-modal-header flex items-center gap-3">
                <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#fb7185,#e11d48)" }}>
                  {editingId ? <Pencil className="w-5 h-5 text-white" /> : <Scissors className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>{editingId ? "แก้ไขการผ่าตัด" : "เพิ่มการผ่าตัด"}</h3>
                  <p className="text-[11px] text-gray-500">กรอกข้อมูลครบทั้ง 5 ส่วน แล้วบันทึก</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
              </div>

              <div className="vet-modal-body space-y-4">
                {/* 1. Operation */}
                <Section icon={Scissors} title="ข้อมูลการผ่าตัด" subtitle="Operation">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="vet-label">การวินิจฉัย (Diagnosis) <span className="required">*</span></label>
                      <input value={draft.diagnosis} onChange={e => setField("diagnosis", e.target.value)} placeholder="เช่น Gastric Dilatation-Volvulus (GDV)" className="vet-input" />
                    </div>
                    <div>
                      <label className="vet-label">หัตถการ (Procedure) <span className="required">*</span></label>
                      <input value={draft.procedure} onChange={e => setField("procedure", e.target.value)} placeholder="เลือกหรือพิมพ์" className="vet-input" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="vet-label">วันที่ผ่าตัด <span className="required">*</span></label>
                    <DatePickerModern value={draft.date} onChange={v => setField("date", v)} placeholder="เลือกวันที่ผ่าตัด" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="vet-label">เวลาเริ่ม</label>
                      <TimePickerModern value={draft.startTime} onChange={v => setField("startTime", v)} placeholder="เลือกเวลาเริ่ม" />
                    </div>
                    <div>
                      <label className="vet-label">เวลาสิ้นสุด</label>
                      <TimePickerModern value={draft.endTime} onChange={v => setField("endTime", v)} placeholder="เลือกเวลาสิ้นสุด" />
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${draft.isEmergency ? "bg-rose-500" : "bg-gray-100 border border-gray-300"}`}>
                      {draft.isEmergency && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-[12.5px] text-gray-700" style={{ fontWeight: 500 }}>เคสฉุกเฉิน (Emergency surgery)</span>
                    <input type="checkbox" checked={draft.isEmergency} onChange={e => setField("isEmergency", e.target.checked)} className="hidden" />
                  </label>
                </Section>

                {/* 2. Team */}
                <Section icon={Users} title="ทีมผ่าตัด" subtitle="Surgical team">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="vet-label">ศัลยแพทย์ (Surgeon) <span className="required">*</span></label>
                      <input value={draft.surgeon} onChange={e => setField("surgeon", e.target.value)} className="vet-input" />
                    </div>
                    <div>
                      <label className="vet-label">วิสัญญีแพทย์ (Anesthetist) <span className="required">*</span></label>
                      <input value={draft.anesthetist} onChange={e => setField("anesthetist", e.target.value)} className="vet-input" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="vet-label">ผู้ช่วยผ่าตัด / Scrub nurse</label>
                    <input value={draft.scrubNurse} onChange={e => setField("scrubNurse", e.target.value)} placeholder="น.สพ. อนุชา · พว. ศุภวัชญ์" className="vet-input" />
                  </div>
                </Section>

                {/* 3. Anesthesia */}
                <Section icon={Activity} title="วิสัญญี & ยาสลบ" subtitle="Anesthesia" rightAccent={`${draft.anesthesiaDrugs.length} รายการ`}>
                  <div className="mb-3">
                    <label className="vet-label">ASA Physical Status <span className="required">*</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {ASA_OPTIONS.map(o => {
                        const active = draft.asaStatus === o.value;
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
                  <datalist id="anes-drug-list">
                    {ANES_DRUGS.map(d => <option key={d} value={d} />)}
                  </datalist>
                  <div className="space-y-2">
                    {draft.anesthesiaDrugs.map(d => (
                      <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_115px_minmax(0,1fr)_72px_36px] gap-2 sm:items-end p-2 rounded-xl bg-white border border-gray-100">
                        <div>
                          <label className="vet-label">ยา (DRUG)</label>
                          <input list="anes-drug-list" value={d.name} onChange={e => updateAnesDrug(d.id, { name: e.target.value })} placeholder="พิมพ์หรือเลือก..." className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">ช่วง</label>
                          <select value={d.stage} onChange={e => updateAnesDrug(d.id, { stage: e.target.value as AnesthesiaDrug["stage"] })} className="vet-select">
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="vet-label">ขนาด</label>
                          <input value={d.dose} onChange={e => updateAnesDrug(d.id, { dose: e.target.value })} placeholder="0.2 mg/kg" className="vet-input" />
                        </div>
                        <div>
                          <label className="vet-label">Route</label>
                          <select value={d.route} onChange={e => updateAnesDrug(d.id, { route: e.target.value })} className="vet-select">
                            {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <button onClick={() => removeAnesDrug(d.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 justify-self-end sm:justify-self-center" title="ลบ">
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
                      <textarea value={draft.intraopFindings} onChange={e => setField("intraopFindings", e.target.value)} rows={3} placeholder="เช่น กระเพาะบิด 360° เนื้อยังมีชีวิตดี ม้ามบวมคั่งเลือดแต่กลับมาปกติ..." className="vet-textarea" />
                    </div>
                    <div>
                      <label className="vet-label">ขั้นตอนการผ่าตัด (Surgical steps) <span className="required">*</span></label>
                      <textarea value={draft.surgicalSteps} onChange={e => setField("surgicalSteps", e.target.value)} rows={3} placeholder="บรรยายขั้นตอน หรือพิมพ์ละบรรทัด..." className="vet-textarea" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="vet-label">ภาวะแทรกซ้อน (Complications)</label>
                        <textarea value={draft.complications} onChange={e => setField("complications", e.target.value)} rows={2} placeholder="เช่น VPCs ช่วง reperfusion — คุมด้วย lidocaine / ไม่มี" className="vet-textarea" />
                      </div>
                      <div>
                        <label className="vet-label">ผลการผ่าตัด (Outcome) <span className="required">*</span></label>
                        <textarea value={draft.outcome} onChange={e => setField("outcome", e.target.value)} rows={2} placeholder="เช่น สำเร็จด้วยดี ฟื้นจากยาสลบเรียบร้อย" className="vet-textarea" />
                      </div>
                    </div>
                  </div>
                </Section>

                {/* 5. Post-op */}
                <Section icon={HeartPulse} title="หลังผ่าตัด" subtitle="Post-operative">
                  <div>
                    <label className="vet-label">แผนการรักษาหลังผ่าตัด (Post-op plan) <span className="required">*</span></label>
                    <textarea value={draft.postOpPlan} onChange={e => setField("postOpPlan", e.target.value)} rows={2} placeholder="เฝ้าระวัง ICU, สารน้ำ, NPO/การให้อาหาร, การติดตาม..." className="vet-textarea" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="vet-label" style={{ marginBottom: 0 }}>ยาที่ได้รับ (Post-op medications)</label>
                      <span className="text-[10.5px] text-gray-400">{draft.postOpMeds.length} รายการ</span>
                    </div>
                    <datalist id="postop-drug-list">
                      {POSTOP_DRUGS.map(d => <option key={d} value={d} />)}
                    </datalist>
                    <div className="space-y-2">
                      {draft.postOpMeds.map(m => (
                        <div key={m.id} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_90px_72px_36px] gap-2 sm:items-end p-2 rounded-xl bg-white border border-gray-100">
                          <div>
                            <label className="vet-label">ยา</label>
                            <input list="postop-drug-list" value={m.name} onChange={e => updatePostMed(m.id, { name: e.target.value })} placeholder="พิมพ์หรือเลือก..." className="vet-input" />
                          </div>
                          <div>
                            <label className="vet-label">ขนาด</label>
                            <input value={m.dose} onChange={e => updatePostMed(m.id, { dose: e.target.value })} placeholder="0.2 mg/kg" className="vet-input" />
                          </div>
                          <div>
                            <label className="vet-label">ความถี่</label>
                            <input value={m.frequency} onChange={e => updatePostMed(m.id, { frequency: e.target.value })} placeholder="q6h" className="vet-input" />
                          </div>
                          <div>
                            <label className="vet-label">Route</label>
                            <select value={m.route} onChange={e => updatePostMed(m.id, { route: e.target.value })} className="vet-select">
                              {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <button onClick={() => removePostMed(m.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 justify-self-end sm:justify-self-center" title="ลบ">
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
                    <textarea value={draft.ownerInstructions} onChange={e => setField("ownerInstructions", e.target.value)} rows={3} placeholder="จำกัดการออกกำลัง, การให้อาหาร, สัญญาณอันตราย, นัดติดตาม..." className="vet-textarea" />
                  </div>
                </Section>
              </div>

              <div className="vet-modal-footer">
                <button onClick={() => setModalOpen(false)} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <button onClick={handleSave} disabled={!canSave} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, rightAccent, children }: { icon: typeof Scissors; title: string; subtitle?: string; rightAccent?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 overflow-hidden" style={{ background: "#fafbfc" }}>
      <div className="px-3 py-2.5 flex items-center gap-3 border-b border-gray-100/80 bg-white">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100">
          <Icon className="w-4 h-4 text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-gray-900" style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.2px" }}>{title}</h4>
          {subtitle && <p className="text-[10.5px] text-gray-500">{subtitle}</p>}
        </div>
        {rightAccent && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 700, background: "rgba(25,165,137,0.10)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)" }}>
            {rightAccent}
          </span>
        )}
      </div>
      <div className="p-3 bg-white">{children}</div>
    </section>
  );
}

function PreviewSection({ icon: Icon, title, children }: { icon: typeof Scissors; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="px-3 py-2.5 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
          <Icon className="w-3.5 h-3.5 text-gray-600" strokeWidth={2.2} />
        </div>
        <h4 className="text-gray-900" style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.2px" }}>{title}</h4>
      </div>
      <div className="p-3 space-y-2">{children}</div>
    </section>
  );
}

function PreviewField({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10.5px] text-gray-400 mb-0.5" style={{ fontWeight: 500, letterSpacing: "0.2px" }}>{label}</div>
      <div className={`text-[13px] text-gray-800 ${multiline ? "whitespace-pre-line" : "truncate"}`} style={{ fontWeight: 500, lineHeight: 1.55 }}>{value}</div>
    </div>
  );
}
