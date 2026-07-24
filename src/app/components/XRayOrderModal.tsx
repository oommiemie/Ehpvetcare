import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, FileText, ChevronDown, DoorOpen } from "lucide-react";
import {
  IMAGING_MODALITIES, IMAGING_SIDES, modalityByKey, regionByKey, buildExamName,
} from "../config/imaging";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: XRayOrderData) => void;
  /** ถ้ามีค่า = โหมดแก้ไข: เติมค่าจากรายการเดิม */
  editing?: XRayOrderData | null;
}

export interface XRayOrderData {
  /** ชื่อรายการที่ประกอบแล้ว — ใช้แสดงในตาราง/ใบสั่ง (ฟิลด์เดิม ห้ามถอด) */
  exam: string;
  /* ── มิติที่คุณหมอขอให้แยก ── */
  modality?: string;    // วิธีตรวจ: xray / ultrasound / echo / ct / mri
  region?: string;      // บริเวณ: ช่องอก / ช่องท้อง / ขาหน้า …
  views?: string[];     // ท่า (เลือกได้หลายท่า)
  side?: string;        // ด้าน: ซ้าย / ขวา / ทั้งสองข้าง
  technique?: string;   // เทคนิค: ธรรมดา / ฉีดสี / กลืนแป้ง …
  room: string;
  urgency: string;
  clinicalInfo: string;
  clinicalDiagnosis: string;
  note: string;
}

const roomOptions = [
  "ห้อง Medical Imaging 1",
  "ห้อง Medical Imaging 2",
  "ห้อง Ultrasound",
  "ห้องผ่าตัด (OR)",
  "ห้องตรวจ 1",
  "ห้องตรวจ 2",
];

const urgencyOptions = [
  { value: "routine", label: "ปกติ", color: "bg-emerald-500" },
  { value: "urgent", label: "ด่วน", color: "bg-amber-500" },
  { value: "stat", label: "ด่วนมาก", color: "bg-red-500" },
];

/* เดาวิธีตรวจ/บริเวณจากชื่อรายการเดิม — ของที่สั่งไว้ก่อนมีฟิลด์แยกจะได้ไม่หาย
   เดาไม่ออกก็ตกไปที่ X-ray ช่องอก แล้วให้คุณหมอแก้เอง */
function inferFromExam(exam: string): { modality: string; region: string } {
  const s = exam.toLowerCase();
  const mk =
    /ultrasound|ยูเอส|us /.test(s) ? "ultrasound"
    : /echo|หัวใจ/.test(s) ? "echo"
    : /ct /.test(s) || s.startsWith("ct") ? "ct"
    : /mri/.test(s) ? "mri"
    : "xray";
  const m = modalityByKey(mk)!;
  const hit = m.regions.find(r => s.includes(r.label.toLowerCase()))
    ?? m.regions.find(r =>
      (r.key === "thorax" && /chest|thorax|อก/.test(s)) ||
      (r.key === "abdomen" && /abdomen|ท้อง/.test(s)) ||
      (r.key === "skull" && /skull|head|หัว/.test(s)) ||
      (r.key === "pelvis" && /pelvis|hip|สะโพก/.test(s)) ||
      (r.key === "forelimb" && /forelimb|ขาหน้า/.test(s)) ||
      (r.key === "hindlimb" && /hindlimb|ขาหลัง/.test(s)) ||
      (r.key === "dental" && /dental|ฟัน/.test(s)) ||
      (r.key.startsWith("spine") && /spine|สันหลัง/.test(s)));
  return { modality: mk, region: (hit ?? m.regions[0]).key };
}

export function XRayOrderModal({ open, onClose, onSubmit, editing }: Props) {
  const isEditing = !!editing;
  const [modality, setModality] = useState("xray");
  const [region, setRegion] = useState("thorax");
  const [views, setViews] = useState<string[]>([]);
  const [side, setSide] = useState("");
  const [technique, setTechnique] = useState("");
  const [room, setRoom] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [clinicalInfo, setClinicalInfo] = useState("");
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState("");
  const [note, setNote] = useState("");
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);

  const mod = modalityByKey(modality) ?? IMAGING_MODALITIES[0];
  const reg = regionByKey(modality, region) ?? mod.regions[0];
  const examName = useMemo(
    () => buildExamName({ modality, region, views, side, technique }),
    [modality, region, views, side, technique],
  );

  const resetForm = () => {
    setModality("xray"); setRegion("thorax"); setViews([]); setSide(""); setTechnique("");
    setRoom(""); setUrgency("routine"); setClinicalInfo(""); setClinicalDiagnosis(""); setNote("");
  };

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const guess = editing.modality && editing.region
        ? { modality: editing.modality, region: editing.region }
        : inferFromExam(editing.exam || "");
      setModality(guess.modality);
      setRegion(guess.region);
      setViews(editing.views ?? []);
      setSide(editing.side ?? "");
      setTechnique(editing.technique ?? "");
      setRoom(editing.room || "");
      setUrgency(editing.urgency || "routine");
      setClinicalInfo(editing.clinicalInfo || "");
      setClinicalDiagnosis(editing.clinicalDiagnosis || "");
      setNote(editing.note || "");
    } else {
      resetForm();
    }
  }, [open, editing]);

  /* เปลี่ยนวิธีตรวจ = บริเวณ/ท่า/ด้าน ของเดิมใช้ไม่ได้แล้ว ต้องล้าง */
  const pickModality = (k: string) => {
    if (k === modality) return;
    const m = modalityByKey(k)!;
    setModality(k); setRegion(m.regions[0].key);
    setViews([]); setSide(""); setTechnique("");
  };
  const pickRegion = (k: string) => {
    if (k === region) return;
    setRegion(k); setViews([]);
    if (!regionByKey(modality, k)?.paired) setSide("");
  };
  const toggleView = (v: string) =>
    setViews(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  /* บริเวณที่มีซ้าย-ขวาต้องระบุด้าน ไม่งั้นห้องถ่ายไม่รู้ว่าถ่ายขาไหน */
  const needSide = !!reg.paired;
  const canSave = !!examName && (!needSide || !!side);

  const handleSubmit = () => {
    if (!canSave) return;
    onSubmit?.({
      exam: examName, modality, region, views, side, technique,
      room, urgency, clinicalInfo, clinicalDiagnosis, note,
    });
    resetForm();
    onClose();
  };
  const handleClose = () => { resetForm(); onClose(); };

  /* แถวชิป — ใช้ซ้ำทุกกลุ่มตัวเลือก */
  const ChipRow = ({ label, hint, required, children }: {
    label: string; hint?: string; required?: boolean; children: React.ReactNode;
  }) => (
    <div>
      <label className="vet-label flex items-center gap-1.5">
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-gray-400 normal-case" style={{ fontWeight: 400 }}>{hint}</span>}
      </label>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );

  /* ตัวเลือกแบบเลือกได้ค่าเดียว → dropdown (สั้นกว่าชิปมาก ฟอร์มไม่ยาว)
     ส่วน "ท่า" ยังเป็นชิป เพราะเลือกได้หลายท่าพร้อมกัน dropdown ทำไม่ได้ */
  const Select = ({ label, hint, required, value, onChange, options, placeholder }: {
    label: string; hint?: string; required?: boolean; value: string;
    onChange: (v: string) => void; options: { v: string; l: string }[]; placeholder?: string;
  }) => (
    <div>
      <label className="vet-label flex items-center gap-1.5">
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-gray-400 normal-case" style={{ fontWeight: 400 }}>{hint}</span>}
      </label>
      <select className="vet-select" value={value} onChange={e => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  const Chip = ({ on, onClick, children, tone }: {
    on: boolean; onClick: () => void; children: React.ReactNode; tone?: string;
  }) => (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition-all"
      style={on
        ? { fontWeight: 700, borderColor: tone ?? "var(--brand-dark)", background: `color-mix(in srgb, ${tone ?? "var(--brand)"} 10%, transparent)`, color: tone ?? "var(--brand-dark)" }
        : { fontWeight: 600, borderColor: "#e5e7eb", background: "#fff", color: "#6b7280" }}>
      {children}
    </button>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full vet-modal flex flex-col"
              style={{ maxWidth: "min(880px, calc(100vw - 2rem))", height: "min(720px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-[24px] flex-shrink-0">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="vet-modal-header-icon">
                      <FileText className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">{isEditing ? "แก้ไข Medical Imaging" : "สั่ง Medical Imaging"}</h2>
                      <p className="vet-tiny mt-[2px]">เลือกวิธีตรวจ · บริเวณ · ท่า · ด้าน · เทคนิค</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body flex-1 min-h-0 overflow-y-auto space-y-4">
                {/* 1–2. วิธีตรวจ + บริเวณ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select label="วิธีตรวจ" hint="Modality" required value={modality} onChange={pickModality}
                    options={IMAGING_MODALITIES.map(m => ({ v: m.key, l: m.label }))} />
                  <Select label="บริเวณที่ตรวจ" hint="Region" required value={region} onChange={pickRegion}
                    options={mod.regions.map(r => ({ v: r.key, l: r.paired ? `${r.label} (ซ้าย/ขวา)` : r.label }))} />

                  {/* 3. ด้าน — เฉพาะอวัยวะที่มีคู่ */}
                  {needSide && (
                    <Select label="ด้าน" hint="Side" required value={side} onChange={setSide} placeholder="— เลือกด้าน —"
                      options={IMAGING_SIDES.map(s => ({ v: s, l: s }))} />
                  )}

                  {/* 5. เทคนิค */}
                  <Select label="เทคนิค" hint="Technique" value={technique} onChange={setTechnique} placeholder="— ไม่ระบุ —"
                    options={mod.techniques.map(tq => ({ v: tq, l: tq }))} />
                </div>

                {/* 4. ท่า — คงเป็นชิป เพราะเลือกได้หลายท่าในคำสั่งเดียว */}
                {reg.views.length > 0 && (
                  <ChipRow label="ท่า" hint={`View · เลือกได้หลายท่า${views.length ? ` (เลือกแล้ว ${views.length})` : ""}`}>
                    {reg.views.map(v => (
                      <Chip key={v} on={views.includes(v)} onClick={() => toggleView(v)}>
                        {views.includes(v) && <Check className="w-3 h-3" strokeWidth={3} />}
                        {v}
                      </Chip>
                    ))}
                  </ChipRow>
                )}

                {/* สรุปรายการที่จะสั่ง — ให้เห็นชื่อเต็มก่อนกดบันทึก */}
                <div className="rounded-xl px-3.5 py-2.5"
                  style={{ background: "color-mix(in srgb, var(--brand) 7%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 22%, transparent)" }}>
                  <p className="text-[10px] text-gray-500" style={{ fontWeight: 700 }}>รายการที่จะสั่ง</p>
                  <p className="text-[13.5px] mt-0.5" style={{ fontWeight: 700, color: "var(--brand-dark)" }}>
                    {examName || "— เลือกวิธีตรวจและบริเวณก่อน —"}
                  </p>
                  {needSide && !side && (
                    <p className="text-[11px] text-red-500 mt-1" style={{ fontWeight: 600 }}>ยังไม่ได้เลือกด้าน (ซ้าย/ขวา)</p>
                  )}
                </div>

                {/* ห้อง + ความเร่งด่วน */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">ห้องถ่ายภาพ</label>
                    <div className="relative">
                      <button type="button" onClick={() => setRoomDropdownOpen(o => !o)} className="vet-select">
                        <span className={room ? "text-gray-700" : "text-gray-400"}>{room || "เลือกห้อง"}</span>
                        <ChevronDown className={`w-[16px] h-[16px] text-gray-400 transition-transform ${roomDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {roomDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute z-50 mt-[4px] left-0 right-0 vet-dropdown max-h-[240px] overflow-y-auto py-[4px]"
                          >
                            {roomOptions.map(r => (
                              <button key={r} type="button"
                                onClick={() => { setRoom(r); setRoomDropdownOpen(false); }}
                                className="w-full px-[14px] py-[8px] text-left text-[14px] transition-colors hover:bg-gray-50"
                                style={room === r ? { fontWeight: 700, color: "var(--brand-dark)" } : { color: "#374151" }}>
                                <DoorOpen className="w-[14px] h-[14px] inline mr-[6px]" />{r}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="vet-label">ความเร่งด่วน</label>
                    <div className="flex gap-[8px]">
                      {urgencyOptions.map(opt => {
                        const sel = urgency === opt.value;
                        return (
                          <button key={opt.value} type="button" onClick={() => setUrgency(opt.value)}
                            className="flex-1 flex items-center justify-center gap-[6px] py-[9px] rounded-[12px] border text-[12.5px] transition-all"
                            style={sel
                              ? { fontWeight: 700, borderColor: "var(--brand-dark)", background: "color-mix(in srgb, var(--brand) 8%, transparent)", color: "var(--brand-dark)" }
                              : { fontWeight: 500, borderColor: "#e5e7eb", color: "#6b7280" }}>
                            <span className={`w-[8px] h-[8px] rounded-full ${opt.color}`} />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="vet-label">ข้อมูลทางคลินิก</label>
                  <textarea value={clinicalInfo} onChange={e => setClinicalInfo(e.target.value)}
                    placeholder="ประวัติ อาการ ข้อมูลเพิ่มเติม..." rows={2} className="vet-textarea" />
                </div>

                <div>
                  <label className="vet-label">การวินิจฉัยเบื้องต้น</label>
                  <input value={clinicalDiagnosis} onChange={e => setClinicalDiagnosis(e.target.value)}
                    placeholder="เช่น Suspected fracture, Foreign body..." className="vet-input" />
                </div>

                <div>
                  <label className="vet-label">หมายเหตุ</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="หมายเหตุเพิ่มเติม..." rows={2} className="vet-textarea" />
                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-[24px] flex-shrink-0">
                <button onClick={handleClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>
                  ยกเลิก
                </button>
                <button onClick={handleSubmit} disabled={!canSave} className="vet-btn vet-btn-primary btn-green" style={{ width: 110 }}>
                  <Check className="w-[16px] h-[16px]" />
                  บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
