import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut, FileText, Pill, Calendar, Check, AlertTriangle, Plus, X, Printer, Sparkles, ChevronRight,
  Send, HeartCrack, Pencil, Clock,
} from "lucide-react";
import { useIPD, type Admit } from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { VETS, INIT_SLOTS } from "../../pages/SlotBuilder";

/* Vet schedule helpers — sync with SlotBuilder */
function dayIdxMonFirst(d: Date): number { return (d.getDay() + 6) % 7; }
function vetHasSlotsOn(slotKey: string, isoDate: string): boolean {
  if (!isoDate) return true;
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return true;
  return INIT_SLOTS.some(s => s.vetId === slotKey && s.day === dayIdxMonFirst(d));
}
function vetAvailableTimes(slotKey: string | undefined, isoDate: string | undefined): Set<string> | null {
  if (!slotKey || !isoDate) return null;
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const di = dayIdxMonFirst(d);
  const out = new Set<string>();
  INIT_SLOTS.forEach(s => {
    if (s.vetId !== slotKey || s.day !== di) return;
    if (s.booked >= s.capacity) return;
    const h = String(Math.floor(s.start / 60)).padStart(2, "0");
    const m = String(s.start % 60).padStart(2, "0");
    out.add(`${h}:${m}`);
  });
  return out;
}
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

/* ── วิธีการจำหน่าย (ตาราง dchtype) ── */
const DCH_TYPES = [
  { value: "With Approval", th: "จำหน่ายปกติ", color: "#0d7c66" },
  { value: "By Transfer",   th: "ส่งต่อ (Refer)", color: "#0284c7" },
  { value: "Dead",          th: "เสียชีวิต", color: "#e11d48" },
  { value: "Other",         th: "อื่นๆ (ระบุ)", color: "#6b7280" },
] as const;
/* ── สถานะภาพการจำหน่าย (ตาราง dchstts) ── */
const DCH_STATUSES = [
  "Complete Recovery — หาย",
  "Improved — ทุเลา / ดีขึ้น",
  "Not Improved — ไม่ดีขึ้น",
  "Normal Delivery",
  "Un-Delivery",
  "Normal Child Discharged with Mother",
  "Normal Child Discharged separately",
  "Dead Still Birth",
  "Dead",
];

/* รายชื่อสัตวแพทย์ให้เลือก — ชื่อผู้ล็อกอินขึ้นเป็นตัวเลือกแรกเสมอ */
const vetOptions = (loginName?: string, extra?: string): string[] => {
  const base = VETS.map(v => v.name);
  const out: string[] = [];
  [loginName, extra, ...base].forEach(n => { if (n && !out.includes(n)) out.push(n); });
  return out;
};

export interface ReferRecord {
  destClinic: string; destVet: string; destPhone: string; destAddress: string;
  reason: string; reasonDetail: string; provisionalDx: string; treatmentSummary: string;
  attachedResults: string[]; vitalsAtTransfer: string;
  transferAt: string; referringVet: string; transport: string;
  attachedDocs: string[]; ownerConsent: boolean; ownerContact: string;
}
/* สถานที่เสียชีวิต / ประเภทการตาย / วิธีจัดการซาก */
const DEATH_PLACES = ["ในกรง (Ward)", "ICU", "ห้องผ่าตัด", "ระหว่างส่งต่อ", "DOA — เสียชีวิตแรกรับ"];
const DEATH_TYPES = [
  "ตายเอง (Natural death)",
  "การุณยฆาต (Euthanasia)",
  "ตายระหว่าง/หลังวางยาสลบ-ผ่าตัด",
  "ตายจากเหตุไม่พึงประสงค์",
  "DOA (Dead on Arrival)",
  "ไม่ทราบสาเหตุ",
];
const BODY_MGMT = ["คืนเจ้าของ", "ฌาปนกิจเดี่ยว (รับอัฐิคืน)", "ฌาปนกิจรวม", "ฝากโรงพยาบาลกำจัด", "ส่งชันสูตร"];

export interface DeathRecord {
  /* 1. ข้อมูลการเสียชีวิต */
  deathAt: string;
  place: string;
  confirmedBy: string;
  deathType: string;
  /* 2. สาเหตุการตาย 3 ระดับ (ตามหลักเวชระเบียน) */
  causeImmediate: string;    // สาเหตุโดยตรง
  causeAntecedent: string;   // สาเหตุนำ
  causeUnderlying: string;   // โรค/ภาวะต้นเหตุ
  /* 3. การชันสูตรและเอกสาร */
  necropsy: string;
  necropsyResult: string;
  euConsentDoc: boolean;     // การุณยฆาต: เอกสารยินยอม (PC40)
  euDrug: string;            // ยา/ขนาดที่ใช้
  euPerformedBy: string;     // ผู้ทำ
  euCommLog: string;         // บันทึกการสื่อสาร ก่อน-ระหว่าง-หลัง
  aeItems: string;           // เหตุไม่พึงประสงค์ (PC34): ยา/อุปกรณ์ที่ใช้
  aeProcedure: string;       // วิธีปฏิบัติ
  aeSeverity: string;        // ความรุนแรง
  aeReportedTo: string;      // ผู้ที่ได้รับรายงาน
  aeOutcome: string;         // ผลลัพธ์
  aePrevention: string;      // แผนป้องกันไม่ให้เกิดซ้ำ (PC35)
  certificateIssued: boolean;// ออกหนังสือรับรอง/ใบแจ้งการตายแล้ว
  certificateNo: string;     // เลขที่เอกสาร
  /* 4. การจัดการซาก */
  bodyManagement: string;
  bodyReceiver: string;
  bodyReceivedAt: string;
  ownerInformed: boolean;
  note: string;
  /* legacy */
  cause?: string;
}
interface DchInfo {
  dchDate: string; dchTime: string; dchVet: string;
  dchType: string; dchOther: string; dchStatus: string;
  refer?: ReferRecord | null; death?: DeathRecord | null;
}
const loadDch = (admitId: number): DchInfo | null => {
  try { const r = localStorage.getItem(`vet-ipd-dch-${admitId}`); if (r) return JSON.parse(r); } catch { /* ignore */ }
  return null;
};

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
  const [followUpVet, setFollowUpVet] = useState(admit.followUpVet ?? "");
  const [followUpTime, setFollowUpTime] = useState(admit.followUpTime ?? "");
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  /* ── ข้อมูลการจำหน่าย (dchtype/dchstts) ── */
  const { user } = useAuth();
  const saved = useMemo(() => loadDch(admit.id), [admit.id]);
  const now = new Date();
  const [dchDate, setDchDate] = useState(saved?.dchDate ?? now.toISOString().slice(0, 10));
  const [dchTime, setDchTime] = useState(saved?.dchTime ?? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  const [dchVet, setDchVet] = useState(saved?.dchVet ?? (user?.displayName ?? admit.doctor));
  const [dchType, setDchType] = useState(saved?.dchType ?? "");
  const [dchOther, setDchOther] = useState(saved?.dchOther ?? "");
  const [dchStatus, setDchStatus] = useState(saved?.dchStatus ?? "");
  const [referRec, setReferRec] = useState<ReferRecord | null>(saved?.refer ?? null);
  const [deathRec, setDeathRec] = useState<DeathRecord | null>(saved?.death ?? null);
  const [showRefer, setShowRefer] = useState(false);
  const [showDeath, setShowDeath] = useState(false);

  /* persist อัตโนมัติ */
  useEffect(() => {
    const info: DchInfo = { dchDate, dchTime, dchVet, dchType, dchOther, dchStatus, refer: referRec, death: deathRec };
    try { localStorage.setItem(`vet-ipd-dch-${admit.id}`, JSON.stringify(info)); } catch { /* quota */ }
  }, [dchDate, dchTime, dchVet, dchType, dchOther, dchStatus, referRec, deathRec, admit.id]);

  const pickDchType = (v: string) => {
    setDchType(v);
    if (v === "By Transfer" && !referRec) setShowRefer(true);   // เปิดหน้าส่งต่อ Refer ทันที
    if (v === "Dead" && !deathRec) setShowDeath(true);          // เปิดหน้าบันทึกการเสียชีวิตทันที
  };

  const checklist = [
    { key: "dch",      label: "ข้อมูลการจำหน่าย",  done: !!dchType && !!dchStatus && (dchType !== "By Transfer" || !!referRec) && (dchType !== "Dead" || !!deathRec) },
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
  const addFollowUpMonths = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setFollowUpDate(d.toISOString().slice(0, 10));
  };
  const followUpTargetIso = (days: number, kind: "day" | "month") => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    if (kind === "day") d.setDate(d.getDate() + days);
    else d.setMonth(d.getMonth() + days);
    return d.toISOString().slice(0, 10);
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
    discharge(admit.id, { dischargeSummary: summary, takeHomeMeds: takeHome, followUpDate, followUpNote, followUpVet, followUpTime });
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
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
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
          {/* ── การจำหน่ายผู้ป่วย (dchtype / dchstts) ── */}
          <Section icon={LogOut} title="การจำหน่ายผู้ป่วย" subtitle="วันที่ · เวลา · สัตวแพทย์ · วิธีการจำหน่าย · สถานะภาพ">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="vet-label">วันที่จำหน่าย <span className="required">*</span></label>
                <input type="date" value={dchDate} onChange={e => setDchDate(e.target.value)} className="vet-input" />
              </div>
              <div>
                <label className="vet-label">เวลา <span className="required">*</span></label>
                <input type="time" value={dchTime} onChange={e => setDchTime(e.target.value)} className="vet-input" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="vet-label">สัตวแพทย์ <span className="required">*</span></label>
                <select value={dchVet} onChange={e => setDchVet(e.target.value)} className="vet-select">
                  {vetOptions(user?.displayName, admit.doctor).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* วิธีการจำหน่าย (dchtype) */}
            <label className="vet-label">วิธีการจำหน่าย (dchtype) <span className="required">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1.5">
              {DCH_TYPES.map(t => {
                const on = dchType === t.value;
                return (
                  <button key={t.value} type="button" onClick={() => pickDchType(t.value)}
                    className="px-2 py-2 rounded-xl text-center transition-all"
                    style={on
                      ? { background: t.color, color: "#fff", fontWeight: 700, border: `1px solid ${t.color}`, boxShadow: `0 4px 12px ${t.color}40` }
                      : { background: "#fff", color: "#374151", fontWeight: 600, border: "1px solid #e5e7eb" }}>
                    <div className="text-[12px]">{t.value}</div>
                    <div className="text-[10px]" style={{ opacity: on ? 0.9 : 0.55 }}>{t.th}</div>
                  </button>
                );
              })}
            </div>

            {/* สถานะย่อยตามประเภท */}
            {dchType === "Other" && (
              <input value={dchOther} onChange={e => setDchOther(e.target.value)} placeholder="ระบุวิธีการจำหน่าย..." className="vet-input mb-2" />
            )}
            {dchType === "By Transfer" && (
              <div className="flex items-center gap-2 flex-wrap mb-2 p-2.5 rounded-xl" style={{ background: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.20)" }}>
                <Send className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                {referRec ? (
                  <>
                    <span className="text-[11.5px] text-sky-700 flex-1 min-w-0" style={{ fontWeight: 600 }}>
                      บันทึกส่งต่อแล้ว → {referRec.destClinic}{referRec.destVet ? ` · ${referRec.destVet}` : ""} · {new Date(referRec.transferAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <button onClick={() => setShowRefer(true)} className="text-[11px] px-2.5 py-1 rounded-full text-sky-700 hover:bg-sky-100 inline-flex items-center gap-1" style={{ fontWeight: 700, border: "1px solid rgba(2,132,199,0.30)" }}>
                      <Pencil className="w-3 h-3" /> แก้ไขข้อมูล Refer
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[11.5px] text-sky-700 flex-1" style={{ fontWeight: 600 }}>ยังไม่ได้บันทึกข้อมูลการส่งต่อ</span>
                    <button onClick={() => setShowRefer(true)} className="text-[11px] px-2.5 py-1 rounded-full text-white" style={{ fontWeight: 700, background: "#0284c7" }}>
                      กรอกข้อมูล Refer
                    </button>
                  </>
                )}
              </div>
            )}
            {dchType === "Dead" && (
              <div className="flex items-center gap-2 flex-wrap mb-2 p-2.5 rounded-xl" style={{ background: "rgba(225,29,72,0.06)", border: "1px solid rgba(225,29,72,0.20)" }}>
                <HeartCrack className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                {deathRec ? (
                  <>
                    <span className="text-[11.5px] text-rose-700 flex-1 min-w-0" style={{ fontWeight: 600 }}>
                      บันทึกการเสียชีวิตแล้ว · {new Date(deathRec.deathAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} น. · {deathRec.deathType || ""} · {deathRec.causeImmediate || deathRec.cause || ""}
                    </span>
                    <button onClick={() => setShowDeath(true)} className="text-[11px] px-2.5 py-1 rounded-full text-rose-700 hover:bg-rose-100 inline-flex items-center gap-1" style={{ fontWeight: 700, border: "1px solid rgba(225,29,72,0.30)" }}>
                      <Pencil className="w-3 h-3" /> แก้ไขบันทึก
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[11.5px] text-rose-700 flex-1" style={{ fontWeight: 600 }}>ยังไม่ได้บันทึกข้อมูลการเสียชีวิต</span>
                    <button onClick={() => setShowDeath(true)} className="text-[11px] px-2.5 py-1 rounded-full text-white" style={{ fontWeight: 700, background: "#e11d48" }}>
                      บันทึกการเสียชีวิต
                    </button>
                  </>
                )}
              </div>
            )}

            {/* สถานะภาพการจำหน่าย (dchstts) */}
            <label className="vet-label mt-1">สถานะภาพการจำหน่าย (dchstts) <span className="required">*</span></label>
            <select value={dchStatus} onChange={e => setDchStatus(e.target.value)} className="vet-select">
              <option value="">— เลือกสถานะภาพ —</option>
              {DCH_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </Section>

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

          {/* Follow-up — summary card + popup */}
          <Section icon={Calendar} title="นัดติดตามอาการ" subtitle={followUpDate ? new Date(followUpDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "ยังไม่กำหนด"}>
            {!followUpDate ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <Calendar className="w-9 h-9" strokeWidth={1.5} />
                <p className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่ได้กำหนดนัดติดตาม</p>
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(true)}
                  className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                    border: "1px solid rgba(253,186,116,0.85)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
                    fontWeight: 700,
                    textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> สร้างนัดติดตาม
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-[#19a589]/20 p-3 space-y-2" style={{ background: "rgba(25,165,137,0.05)" }}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>
                        {new Date(followUpDate).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        <span className="ml-2 text-[#0d7c66]" style={{ fontWeight: 800 }}>{followUpTime ? `${followUpTime} น.` : "· ไม่ระบุเวลา"}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {followUpVet || "ยังไม่เลือกแพทย์"}{followUpNote ? ` · ${followUpNote}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFollowUpModal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11.5px] text-[#0d7c66] bg-white border border-[#19a589]/30 hover:bg-[#19a589]/5 transition-colors flex-shrink-0"
                    style={{ fontWeight: 700 }}
                  >
                    <Calendar className="w-3 h-3" /> แก้ไขนัด
                  </button>
                </div>
              </div>
            )}
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

      {/* ── Follow-up appointment popup ── */}
      <AnimatePresence>
        {showFollowUpModal && (
          <FollowUpModal
            petName={admit.petName}
            petInfo={`${admit.species ?? ""} · ${admit.hn ?? ""}`}
            initial={{ date: followUpDate, time: followUpTime, vet: followUpVet, note: followUpNote }}
            onClose={() => setShowFollowUpModal(false)}
            onSave={({ date, time, vet, note }) => {
              setFollowUpDate(date);
              setFollowUpTime(time);
              setFollowUpVet(vet);
              setFollowUpNote(note);
              setShowFollowUpModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── หน้าส่งต่อ Refer (เมื่อ dchtype = By Transfer) ── */}
      {showRefer && (
        <ReferModal admit={admit} existing={referRec} defaultVet={dchVet}
          onClose={() => setShowRefer(false)}
          onSave={(r) => { setReferRec(r); setShowRefer(false); showSnackbar("success", `บันทึกข้อมูลส่งต่อไป ${r.destClinic} แล้ว`); }} />
      )}

      {/* ── หน้าบันทึกการเสียชีวิต (เมื่อ dchtype = Dead) ── */}
      {showDeath && (
        <DeathModal admit={admit} existing={deathRec} defaultVet={dchVet}
          onClose={() => setShowDeath(false)}
          onSave={(d) => { setDeathRec(d); setShowDeath(false); showSnackbar("success", "บันทึกข้อมูลการเสียชีวิตแล้ว"); }} />
      )}
    </div>
  );
}

/* ── หน้าส่งต่อ Refer — บันทึกข้อมูลการส่งต่อครบตามแบบฟอร์ม ── */
function ReferModal({ admit, existing, defaultVet, onClose, onSave }: {
  admit: Admit; existing: ReferRecord | null; defaultVet: string;
  onClose: () => void; onSave: (r: ReferRecord) => void;
}) {
  const nowLocal = (() => { const d = new Date(); d.setSeconds(0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); })();
  const [f, setF] = useState<ReferRecord>(existing ?? {
    destClinic: "", destVet: "", destPhone: "", destAddress: "",
    reason: "เกินขีดความสามารถ", reasonDetail: "",
    provisionalDx: admit.diagnosis ?? "", treatmentSummary: "",
    attachedResults: [], vitalsAtTransfer: "",
    transferAt: nowLocal, referringVet: defaultVet, transport: "",
    attachedDocs: ["สำเนาเวชระเบียน", "ใบส่งตัว"], ownerConsent: false, ownerContact: admit.ownerPhone ?? "",
  });
  const set = <K extends keyof ReferRecord>(k: K, v: ReferRecord[K]) => setF(prev => ({ ...prev, [k]: v }));
  const toggleIn = (k: "attachedResults" | "attachedDocs", v: string) =>
    setF(prev => ({ ...prev, [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v] }));
  const canSave = !!f.destClinic.trim() && !!f.reason && !!f.transferAt && !!f.referringVet.trim();

  const SecHead = ({ n, t }: { n: string; t: string }) => (
    <div className="flex items-center gap-2 pt-1">
      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]" style={{ fontWeight: 800 }}>{n}</span>
      <span className="text-[12.5px] text-gray-800" style={{ fontWeight: 700 }}>{t}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-[640px] shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "min(760px, calc(100vh - 2rem))" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3 flex-shrink-0">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#38bdf8,#0284c7)" }}><Send className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>ส่งต่อผู้ป่วย (Refer)</h3>
            <p className="text-[11px] text-gray-500">{admit.petName} · {admit.hn} · จำหน่ายแบบ By Transfer</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          <SecHead n="1" t="สถานพยาบาลปลายทาง" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="vet-label">ชื่อสถานพยาบาลสัตว์/คลินิกปลายทาง <span className="required">*</span></label>
              <input value={f.destClinic} onChange={e => set("destClinic", e.target.value)} className="vet-input" placeholder="เช่น โรงพยาบาลสัตว์มหาวิทยาลัยเกษตรศาสตร์" />
            </div>
            <div>
              <label className="vet-label">สัตวแพทย์ผู้รับ (ถ้าทราบ)</label>
              <input value={f.destVet} onChange={e => set("destVet", e.target.value)} className="vet-input" placeholder="ชื่อสัตวแพทย์ปลายทาง" />
            </div>
            <div>
              <label className="vet-label">เบอร์ติดต่อปลายทาง</label>
              <input value={f.destPhone} onChange={e => set("destPhone", e.target.value)} className="vet-input" placeholder="0X-XXX-XXXX" />
            </div>
            <div className="sm:col-span-2">
              <label className="vet-label">ที่อยู่ / แผนกที่ส่งไป</label>
              <input value={f.destAddress} onChange={e => set("destAddress", e.target.value)} className="vet-input" placeholder="เช่น แผนกศัลยกรรมกระดูก ชั้น 3" />
            </div>
          </div>

          <SecHead n="2" t="เหตุผลและรายละเอียดการส่งต่อ" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="vet-label">เหตุผลการส่งต่อ <span className="required">*</span></label>
              <select value={f.reason} onChange={e => set("reason", e.target.value)} className="vet-select">
                {["เกินขีดความสามารถ", "ต้องใช้เครื่องมือ/ผู้เชี่ยวชาญเฉพาะทาง", "เจ้าของร้องขอ", "อื่นๆ"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="vet-label">รายละเอียดเหตุผลเพิ่มเติม</label>
              <input value={f.reasonDetail} onChange={e => set("reasonDetail", e.target.value)} className="vet-input" placeholder="ระบุเพิ่มเติม..." />
            </div>
            <div className="sm:col-span-2">
              <label className="vet-label">การวินิจฉัยเบื้องต้น / ปัญหาหลัก</label>
              <input value={f.provisionalDx} onChange={e => set("provisionalDx", e.target.value)} className="vet-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="vet-label">สรุปการรักษาที่ให้ไปแล้ว + ยาและขนาดที่ให้ล่าสุด (วัน-เวลา)</label>
              <textarea rows={3} value={f.treatmentSummary} onChange={e => set("treatmentSummary", e.target.value)} className="vet-textarea" placeholder="เช่น ให้ LRS IV 3 ml/kg/hr, Amoxi-Clav 12.5 mg/kg PO ล่าสุด 8 ก.ค. 08:00 น." />
            </div>
            <div className="sm:col-span-2">
              <label className="vet-label">ผลตรวจสำคัญที่แนบ</label>
              <div className="flex flex-wrap gap-1.5">
                {["ผล Lab", "ภาพรังสี (X-Ray/US)", "ผลวินิจฉัย", "ผล ECG", "อื่นๆ"].map(rlabel => {
                  const on = f.attachedResults.includes(rlabel);
                  return (
                    <button key={rlabel} type="button" onClick={() => toggleIn("attachedResults", rlabel)}
                      className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
                      style={on ? { fontWeight: 700, background: "#0284c7", color: "#fff" } : { fontWeight: 600, background: "#f9fafb", color: "#6b7280", border: "1px solid #f3f4f6" }}>
                      {on ? "✓ " : ""}{rlabel}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="vet-label">อาการ / สัญญาณชีพ ณ เวลาส่งต่อ</label>
              <input value={f.vitalsAtTransfer} onChange={e => set("vitalsAtTransfer", e.target.value)} className="vet-input" placeholder="เช่น T 101.2°F · P 96 · R 22 · รู้สึกตัวดี" />
            </div>
          </div>

          <SecHead n="3" t="การดำเนินการและเอกสาร" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="vet-label">วัน-เวลาที่ส่งต่อ <span className="required">*</span></label>
              <input type="datetime-local" value={f.transferAt} onChange={e => set("transferAt", e.target.value)} className="vet-input" />
            </div>
            <div>
              <label className="vet-label">สัตวแพทย์ผู้สั่ง Refer <span className="required">*</span></label>
              <select value={f.referringVet} onChange={e => set("referringVet", e.target.value)} className="vet-select">
                {vetOptions(defaultVet, f.referringVet).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="vet-label">วิธีเดินทาง / การดูแลระหว่างส่ง</label>
              <input value={f.transport} onChange={e => set("transport", e.target.value)} className="vet-input" placeholder="เช่น เจ้าของขับรถเอง · ให้ออกซิเจน + สารน้ำระหว่างทาง" />
            </div>
            <div className="sm:col-span-2">
              <label className="vet-label">เอกสารที่แนบไป</label>
              <div className="flex flex-wrap gap-1.5">
                {["สำเนาเวชระเบียน", "ใบส่งตัว", "ผล Lab/X-Ray", "ใบเสร็จ/สรุปค่าใช้จ่าย"].map(doc => {
                  const on = f.attachedDocs.includes(doc);
                  return (
                    <button key={doc} type="button" onClick={() => toggleIn("attachedDocs", doc)}
                      className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
                      style={on ? { fontWeight: 700, background: "#0284c7", color: "#fff" } : { fontWeight: 600, background: "#f9fafb", color: "#6b7280", border: "1px solid #f3f4f6" }}>
                      {on ? "✓ " : ""}{doc}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <button type="button" onClick={() => set("ownerConsent", !f.ownerConsent)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors"
                style={{ borderColor: f.ownerConsent ? "rgba(25,165,137,0.40)" : "#e5e7eb", background: f.ownerConsent ? "rgba(25,165,137,0.06)" : "#fafafa" }}>
                <span className="text-[12px]" style={{ fontWeight: 600, color: f.ownerConsent ? "#0d7c66" : "#6b7280" }}>เจ้าของรับทราบ/ยินยอมการส่งต่อแล้ว</span>
                <span className="relative inline-flex h-5 w-9 items-center rounded-full" style={{ background: f.ownerConsent ? "#19a589" : "#d1d5db" }}>
                  <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: f.ownerConsent ? "translateX(18px)" : "translateX(3px)" }} />
                </span>
              </button>
              <div>
                <label className="vet-label">ช่องทางติดต่อกลับเจ้าของ</label>
                <input value={f.ownerContact} onChange={e => set("ownerContact", e.target.value)} className="vet-input" placeholder="เบอร์โทร / LINE" />
              </div>
            </div>
          </div>
        </div>

        <div className="vet-modal-footer flex-shrink-0">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={() => canSave && onSave(f)} disabled={!canSave}
            className="vet-btn vet-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40" style={{ background: "linear-gradient(135deg,#38bdf8,#0284c7)" }}>
            <Check className="w-3.5 h-3.5" /> บันทึกข้อมูล Refer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── หน้าบันทึกข้อมูลการเสียชีวิต (เมื่อ dchtype = Dead) — 4 ส่วนตามมาตรฐานเวชระเบียน ── */
function DeathModal({ admit, existing, defaultVet, onClose, onSave }: {
  admit: Admit; existing: DeathRecord | null; defaultVet: string;
  onClose: () => void; onSave: (d: DeathRecord) => void;
}) {
  const nowLocal = (() => { const d = new Date(); d.setSeconds(0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); })();
  const [f, setF] = useState<DeathRecord>({
    deathAt: existing?.deathAt ?? nowLocal,
    place: existing?.place && DEATH_PLACES.includes(existing.place) ? existing.place : DEATH_PLACES[0],
    confirmedBy: existing?.confirmedBy ?? defaultVet,
    deathType: existing?.deathType ?? "",
    causeImmediate: existing?.causeImmediate ?? existing?.cause ?? "",
    causeAntecedent: existing?.causeAntecedent ?? "",
    causeUnderlying: existing?.causeUnderlying ?? "",
    necropsy: existing?.necropsy ?? "ไม่ทำ",
    necropsyResult: existing?.necropsyResult ?? "",
    euConsentDoc: existing?.euConsentDoc ?? false,
    euDrug: existing?.euDrug ?? "",
    euPerformedBy: existing?.euPerformedBy ?? defaultVet,
    euCommLog: existing?.euCommLog ?? "",
    aeItems: existing?.aeItems ?? "",
    aeProcedure: existing?.aeProcedure ?? "",
    aeSeverity: existing?.aeSeverity ?? "",
    aeReportedTo: existing?.aeReportedTo ?? "",
    aeOutcome: existing?.aeOutcome ?? "",
    aePrevention: existing?.aePrevention ?? "",
    certificateIssued: existing?.certificateIssued ?? false,
    certificateNo: existing?.certificateNo ?? "",
    bodyManagement: existing?.bodyManagement && BODY_MGMT.includes(existing.bodyManagement) ? existing.bodyManagement : BODY_MGMT[0],
    bodyReceiver: existing?.bodyReceiver ?? "",
    bodyReceivedAt: existing?.bodyReceivedAt ?? "",
    ownerInformed: existing?.ownerInformed ?? false,
    note: existing?.note ?? "",
  });
  const set = <K extends keyof DeathRecord>(k: K, v: DeathRecord[K]) => setF(prev => ({ ...prev, [k]: v }));
  const isEuthanasia = f.deathType === "การุณยฆาต (Euthanasia)";
  const isAdverse = f.deathType === "ตายจากเหตุไม่พึงประสงค์" || f.deathType === "ตายระหว่าง/หลังวางยาสลบ-ผ่าตัด";
  const canSave = !!f.deathAt && !!f.confirmedBy.trim() && !!f.deathType && !!f.causeImmediate.trim();

  const SecHead = ({ n, t, sub }: { n: string; t: string; sub?: string }) => (
    <div className="flex items-center gap-2 pt-1">
      <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] flex-shrink-0" style={{ fontWeight: 800 }}>{n}</span>
      <span className="text-[12.5px] text-gray-800" style={{ fontWeight: 700 }}>{t}</span>
      {sub && <span className="text-[10px] text-gray-400">{sub}</span>}
    </div>
  );
  const Toggle = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
    <button type="button" onClick={onClick}
      className="flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors w-full"
      style={{ borderColor: on ? "rgba(25,165,137,0.40)" : "#e5e7eb", background: on ? "rgba(25,165,137,0.06)" : "#fafafa" }}>
      <span className="text-[12px]" style={{ fontWeight: 600, color: on ? "#0d7c66" : "#6b7280" }}>{label}</span>
      <span className="relative inline-flex h-5 w-9 items-center rounded-full flex-shrink-0" style={{ background: on ? "#19a589" : "#d1d5db" }}>
        <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(18px)" : "translateX(3px)" }} />
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-[680px] shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "min(800px, calc(100vh - 2rem))" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3 flex-shrink-0">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg,#fb7185,#e11d48)" }}><HeartCrack className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>บันทึกข้อมูลการเสียชีวิต</h3>
            <p className="text-[11px] text-gray-500">{admit.petName} · {admit.hn} · จำหน่ายแบบ Dead</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* ── 1. ข้อมูลการเสียชีวิต ── */}
          <SecHead n="1" t="ข้อมูลการเสียชีวิต" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="vet-label">วัน-เวลาที่เสียชีวิต <span className="required">*</span></label>
              <input type="datetime-local" value={f.deathAt} onChange={e => set("deathAt", e.target.value)} className="vet-input" />
            </div>
            <div>
              <label className="vet-label">สถานที่</label>
              <select value={f.place} onChange={e => set("place", e.target.value)} className="vet-select">
                {DEATH_PLACES.map(pl => <option key={pl}>{pl}</option>)}
              </select>
            </div>
            <div>
              <label className="vet-label">สัตวแพทย์ผู้ยืนยันการตาย <span className="required">*</span></label>
              <select value={f.confirmedBy} onChange={e => set("confirmedBy", e.target.value)} className="vet-select">
                {vetOptions(defaultVet, f.confirmedBy).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="vet-label">ประเภทการตาย <span className="required">*</span></label>
              <select value={f.deathType} onChange={e => set("deathType", e.target.value)} className="vet-select">
                <option value="">— เลือกประเภท —</option>
                {DEATH_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* ── 2. สาเหตุการตาย 3 ระดับ ── */}
          <SecHead n="2" t="สาเหตุการตาย" sub="แยก 3 ระดับตามหลักเวชระเบียน" />
          <div className="space-y-2.5">
            <div>
              <label className="vet-label">สาเหตุโดยตรง (Immediate cause) <span className="required">*</span></label>
              <input value={f.causeImmediate} onChange={e => set("causeImmediate", e.target.value)} className="vet-input" placeholder="เช่น Cardiac arrest" />
            </div>
            <div>
              <label className="vet-label">สาเหตุนำ (Antecedent cause)</label>
              <input value={f.causeAntecedent} onChange={e => set("causeAntecedent", e.target.value)} className="vet-input" placeholder="เช่น Septic shock" />
            </div>
            <div>
              <label className="vet-label">โรค/ภาวะต้นเหตุ (Underlying cause)</label>
              <input value={f.causeUnderlying} onChange={e => set("causeUnderlying", e.target.value)} className="vet-input" placeholder="เช่น Pyometra ที่มีภาวะติดเชื้อลุกลาม" />
            </div>
          </div>

          {/* ── 3. การชันสูตรและเอกสาร ── */}
          <SecHead n="3" t="การชันสูตรและเอกสาร" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="vet-label">การชันสูตรซาก (Necropsy)</label>
              <select value={f.necropsy} onChange={e => set("necropsy", e.target.value)} className="vet-select">
                {["ไม่ทำ", "ทำ — เจ้าของยินยอม", "รอเจ้าของตัดสินใจ", "ส่งหน่วยงานภายนอก"].map(nc => <option key={nc}>{nc}</option>)}
              </select>
            </div>
            <div>
              <label className="vet-label">ผลชันสูตร (ถ้ามี)</label>
              <input value={f.necropsyResult} onChange={e => set("necropsyResult", e.target.value)} className="vet-input" placeholder="สรุปผล necropsy..." />
            </div>
          </div>

          {/* การุณยฆาต — PC40 */}
          {isEuthanasia && (
            <div className="p-3 rounded-xl space-y-2.5" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.20)" }}>
              <p className="text-[11.5px] text-violet-700" style={{ fontWeight: 800 }}>กรณีการุณยฆาต (มาตรฐาน PC40)</p>
              <Toggle on={f.euConsentDoc} label="มีเอกสารยินยอมการุณยฆาตจากเจ้าของ (ลงนามแล้ว)" onClick={() => set("euConsentDoc", !f.euConsentDoc)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="vet-label">ยา/ขนาดที่ใช้</label>
                  <input value={f.euDrug} onChange={e => set("euDrug", e.target.value)} className="vet-input" placeholder="เช่น Pentobarbital 85 mg/kg IV" />
                </div>
                <div>
                  <label className="vet-label">ผู้ทำการุณยฆาต</label>
                  <select value={f.euPerformedBy} onChange={e => set("euPerformedBy", e.target.value)} className="vet-select">
                    {vetOptions(defaultVet, f.euPerformedBy).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="vet-label">บันทึกการสื่อสารกับเจ้าของ ก่อน-ระหว่าง-หลัง</label>
                <textarea rows={2} value={f.euCommLog} onChange={e => set("euCommLog", e.target.value)} className="vet-textarea" placeholder="สรุปการพูดคุย ทางเลือกที่เสนอ การตัดสินใจของเจ้าของ..." />
              </div>
            </div>
          )}

          {/* เหตุไม่พึงประสงค์ — PC34/PC35 */}
          {isAdverse && (
            <div className="p-3 rounded-xl space-y-2.5" style={{ background: "rgba(234,88,12,0.05)", border: "1px solid rgba(234,88,12,0.25)" }}>
              <p className="text-[11.5px] text-orange-700" style={{ fontWeight: 800 }}>รายงานเหตุการณ์ไม่พึงประสงค์ (PC34) + แผนป้องกัน (PC35)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="vet-label">ยา/อุปกรณ์ที่ใช้</label>
                  <input value={f.aeItems} onChange={e => set("aeItems", e.target.value)} className="vet-input" placeholder="เช่น Isoflurane, ET tube 5.5" />
                </div>
                <div>
                  <label className="vet-label">ความรุนแรง</label>
                  <select value={f.aeSeverity} onChange={e => set("aeSeverity", e.target.value)} className="vet-select">
                    <option value="">— เลือก —</option>
                    {["Mild", "Moderate", "Severe", "Fatal"].map(sv => <option key={sv}>{sv}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="vet-label">วิธีปฏิบัติ/ขั้นตอนที่เกิดเหตุ</label>
                  <input value={f.aeProcedure} onChange={e => set("aeProcedure", e.target.value)} className="vet-input" placeholder="เช่น ระหว่าง induction ก่อนผ่าตัด..." />
                </div>
                <div>
                  <label className="vet-label">ผู้ที่ได้รับรายงาน</label>
                  <input value={f.aeReportedTo} onChange={e => set("aeReportedTo", e.target.value)} className="vet-input" placeholder="เช่น ผอ.คลินิก / หัวหน้าแพทย์" />
                </div>
                <div>
                  <label className="vet-label">ผลลัพธ์</label>
                  <input value={f.aeOutcome} onChange={e => set("aeOutcome", e.target.value)} className="vet-input" placeholder="เช่น CPR 15 นาที ไม่ตอบสนอง" />
                </div>
                <div className="sm:col-span-2">
                  <label className="vet-label">แผนป้องกันไม่ให้เกิดซ้ำ (PC35)</label>
                  <textarea rows={2} value={f.aePrevention} onChange={e => set("aePrevention", e.target.value)} className="vet-textarea" placeholder="มาตรการ/แนวปฏิบัติที่ปรับปรุง..." />
                </div>
              </div>
            </div>
          )}

          {/* หนังสือรับรอง/ใบแจ้งการตาย */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <Toggle on={f.certificateIssued} label="ออกหนังสือรับรอง/ใบแจ้งการตายให้เจ้าของแล้ว" onClick={() => set("certificateIssued", !f.certificateIssued)} />
            <div>
              <label className="vet-label">เลขที่เอกสาร</label>
              <input value={f.certificateNo} onChange={e => set("certificateNo", e.target.value)} className="vet-input" placeholder="เช่น DC-2569-014" />
            </div>
          </div>

          {/* ── 4. การจัดการซาก ── */}
          <SecHead n="4" t="การจัดการซาก (Carcass management)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="vet-label">วิธีจัดการ</label>
              <div className="flex flex-wrap gap-1.5">
                {BODY_MGMT.map(bm => {
                  const on = f.bodyManagement === bm;
                  return (
                    <button key={bm} type="button" onClick={() => set("bodyManagement", bm)}
                      className="text-[11.5px] px-3 py-1.5 rounded-full transition-colors"
                      style={on ? { fontWeight: 700, background: "#e11d48", color: "#fff" } : { fontWeight: 600, background: "#f9fafb", color: "#6b7280", border: "1px solid #f3f4f6" }}>
                      {on ? "✓ " : ""}{bm}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="vet-label">ผู้รับซาก</label>
              <input value={f.bodyReceiver} onChange={e => set("bodyReceiver", e.target.value)} className="vet-input" placeholder="ชื่อเจ้าของ / บริษัทฌาปนกิจ" />
            </div>
            <div>
              <label className="vet-label">วัน-เวลาที่รับ</label>
              <input type="datetime-local" value={f.bodyReceivedAt} onChange={e => set("bodyReceivedAt", e.target.value)} className="vet-input" />
            </div>
            <div className="sm:col-span-2">
              <Toggle on={f.ownerInformed} label="แจ้งเจ้าของทราบ และยินยอมวิธีจัดการซากแล้ว" onClick={() => set("ownerInformed", !f.ownerInformed)} />
            </div>
            <div className="sm:col-span-2">
              <label className="vet-label">หมายเหตุเพิ่มเติม</label>
              <textarea rows={2} value={f.note} onChange={e => set("note", e.target.value)} className="vet-textarea" placeholder="รายละเอียดเหตุการณ์ / การช่วยชีวิต (CPR) ที่ทำ..." />
            </div>
          </div>
        </div>

        <div className="vet-modal-footer flex-shrink-0">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={() => canSave && onSave(f)} disabled={!canSave}
            className="vet-btn vet-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40" style={{ background: "linear-gradient(135deg,#fb7185,#e11d48)" }}>
            <Check className="w-3.5 h-3.5" /> บันทึกการเสียชีวิต
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Helpers ─── */
const FOLLOWUP_TIMES: string[] = (() => {
  const out: string[] = [];
  for (let h = 8; h <= 18; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 18) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
}
function dateToIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* Calendar widget (matches AddAppointmentModal's ApptCalendar) */
function MiniCalendar({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const selected = isoToDate(value);
  const [vm, setVm] = useState((selected ?? today).getMonth());
  const [vy, setVy] = useState((selected ?? today).getFullYear());
  const MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  const DAY_LABELS = ["จ.","อ.","พ.","พฤ.","ศ.","ส.","อา."];
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const firstDow = (new Date(vy, vm, 1).getDay() + 6) % 7;
  const prev = () => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); };
  const next = () => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); };
  const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  return (
    <div className="rounded-2xl border border-gray-100 p-3" style={{ background: "#fafafa" }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prev} type="button" className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><ChevronLeftIcon /></button>
        <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>{MONTHS_FULL[vm]} <span className="text-gray-500">{vy + 543}</span></p>
        <button onClick={next} type="button" className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><ChevronRightIcon /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_LABELS.map(l => <div key={l} className="text-[10px] text-gray-400 text-center" style={{ fontWeight: 600 }}>{l}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`x${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const d = new Date(vy, vm, day);
          const on = selected ? same(d, selected) : false;
          const isToday = same(d, today);
          const isPast = d < today;
          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onChange(dateToIso(d))}
              className="aspect-square rounded-lg text-[11.5px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontWeight: on ? 800 : isToday ? 700 : 500,
                color: on ? "#ffffff" : isPast ? "#d1d5db" : "#475569",
                background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : isToday ? "rgba(25,165,137,0.10)" : "transparent",
                border: isToday && !on ? "1px solid rgba(25,165,137,0.40)" : "1px solid transparent",
                boxShadow: on ? "0 2px 8px rgba(25,165,137,0.30)" : "none",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function ChevronLeftIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRightIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }

/* ─── Follow-up appointment popup — full layout like appointments page ─── */
function FollowUpModal({ petName, petInfo, initial, onClose, onSave }: {
  petName: string;
  petInfo: string;
  initial: { date: string; time: string; vet: string; note: string };
  onClose: () => void;
  onSave: (v: { date: string; time: string; vet: string; note: string }) => void;
}) {
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [vet, setVet] = useState(initial.vet);
  const [note, setNote] = useState(initial.note);

  const followUpTargetIso = (n: number, kind: "day" | "month") => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    if (kind === "day") d.setDate(d.getDate() + n);
    else d.setMonth(d.getMonth() + n);
    return dateToIso(d);
  };

  const vetObj = VETS.find(v => v.name === vet);
  const avail = vetAvailableTimes(vetObj?.id, date);

  useEffect(() => {
    if (time && avail && !avail.has(time)) setTime("");
  }, [date, vet]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtitle = `${petName} · ${date ? new Date(date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "เลือกวัน"} · ${time || "ไม่ระบุเวลา"}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-[860px] vet-modal"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {/* Header */}
          <div className="vet-modal-header flex items-center gap-3">
            <div className="vet-modal-header-icon">
              <Calendar className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>นัดติดตามอาการ</h3>
              <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
            </div>
            <button onClick={onClose} className="vet-modal-close">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Body — 2 columns */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">

              {/* ─── LEFT: Calendar + shortcuts + time grid ─── */}
              <div className="space-y-4 min-w-0">
                <div>
                  <p className="text-[11px] text-gray-700 mb-1.5" style={{ fontWeight: 700 }}>วันที่นัด</p>
                  <MiniCalendar value={date} onChange={setDate} />
                </div>

                <div>
                  <p className="text-[11px] text-gray-700 mb-1.5" style={{ fontWeight: 700 }}>นัด follow-up อีก…</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { label: "พรุ่งนี้",    n: 1,  kind: "day"   as const },
                        { label: "+3 วัน",      n: 3,  kind: "day"   as const },
                        { label: "+1 สัปดาห์",  n: 7,  kind: "day"   as const },
                        { label: "+2 สัปดาห์",  n: 14, kind: "day"   as const },
                        { label: "+1 เดือน",    n: 1,  kind: "month" as const },
                        { label: "+3 เดือน",    n: 3,  kind: "month" as const },
                      ]
                    ).map(s => {
                      const target = followUpTargetIso(s.n, s.kind);
                      const on = date === target;
                      return (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setDate(target)}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] transition-all"
                          style={{
                            fontWeight: on ? 700 : 600,
                            color: on ? "#ffffff" : "#475569",
                            background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "rgba(0,0,0,0.04)",
                            border: on ? "1px solid #0d7c66" : "1px solid transparent",
                            boxShadow: on ? "0 3px 10px rgba(25,165,137,0.22)" : "none",
                          }}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-gray-700 mb-1.5" style={{ fontWeight: 700 }}>
                    {(() => {
                      if (!avail) return "เวลานัด";
                      if (avail.size === 0) return "เวลานัด · ไม่มีคิวว่าง";
                      return `เวลานัด · ว่าง ${avail.size} คิว`;
                    })()}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {FOLLOWUP_TIMES.map(t => {
                      const on = time === t;
                      const disabled = avail !== null && !avail.has(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={disabled}
                          onClick={() => !disabled && setTime(t)}
                          title={disabled ? "หมอไม่ได้เปิดคิวเวลานี้" : undefined}
                          className="text-[11.5px] py-1.5 rounded-lg transition-colors disabled:cursor-not-allowed"
                          style={{
                            background: on ? "#0d7c66" : disabled ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.03)",
                            color: on ? "#ffffff" : disabled ? "#d1d5db" : "#475569",
                            fontWeight: on ? 700 : 500,
                            textDecoration: disabled ? "line-through" : "none",
                            opacity: disabled ? 0.55 : 1,
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {/* ไม่ระบุเวลา — บันทึกนัดติดตามได้โดยไม่ต้องเลือกเวลา */}
                  <button
                    type="button"
                    onClick={() => setTime("")}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 text-[12px] py-2 rounded-lg transition-colors"
                    style={{
                      background: !time ? "#0d7c66" : "rgba(0,0,0,0.03)",
                      color: !time ? "#ffffff" : "#475569",
                      fontWeight: !time ? 700 : 500,
                      border: !time ? "1px solid #0d7c66" : "1px dashed rgba(0,0,0,0.15)",
                    }}
                  >
                    {!time && <Check className="w-3.5 h-3.5" />}
                    ไม่ระบุเวลา
                  </button>
                </div>
              </div>

              {/* ─── RIGHT: pet info + vet + note ─── */}
              <div className="space-y-4 min-w-0">
                <div>
                  <p className="text-[11px] text-gray-700 mb-1.5" style={{ fontWeight: 700 }}>ผู้ป่วย</p>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                      <Pill className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{petName}</p>
                      <p className="text-[10.5px] text-gray-500 truncate">{petInfo}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>IPD</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-gray-700 mb-1.5" style={{ fontWeight: 700 }}>สัตวแพทย์</p>
                  <select value={vet} onChange={e => { setVet(e.target.value); setTime(""); }} className="vet-select">
                    <option value="">-- เลือกแพทย์ --</option>
                    {VETS.map(v => {
                      const has = vetHasSlotsOn(v.id, date);
                      return (
                        <option key={v.id} value={v.name} disabled={!has}>
                          {v.name} · {v.specialty}{has ? "" : " (ไม่ว่าง)"}
                        </option>
                      );
                    })}
                  </select>
                  {!vet && date && (
                    <p className="text-[10.5px] text-gray-400 mt-1.5" style={{ fontWeight: 500 }}>
                      💡 เลือกแพทย์เพื่อดูคิวว่างจริงจากตารางหมอ
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] text-gray-700 mb-1.5" style={{ fontWeight: 700 }}>คำแนะนำ / เหตุผลนัด</p>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    placeholder="เช่น ตรวจติดตามค่าไต ผลเลือด, ตัดไหม, ดูแผล..."
                    className="vet-textarea"
                  />
                </div>

                {avail && avail.size === 0 && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" style={{ fontWeight: 600 }}>
                    ⚠ แพทย์ท่านนี้ไม่มีคิวว่างในวันที่เลือก กรุณาเปลี่ยนวันหรือเลือกแพทย์ท่านอื่น
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="vet-modal-footer">
            <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
            <button
              onClick={() => onSave({ date, time, vet, note })}
              disabled={!date}
              className="vet-btn vet-btn-primary inline-flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" /> บันทึกนัด
            </button>
          </div>
        </motion.div>
      </div>
    </>
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
