/* ─────────────────────────────────────────────────────────────
   แท็บงานของเคสอาบน้ำตัดขน

   เดิมหน้าอาบน้ำตัดขนบันทึกได้แค่รายละเอียดการอาบน้ำ พอน้องมาแล้วเจอ
   อะไรผิดปกติ (ผิวหนัง ก้อน ไข้) ต้องออกไปเปิดเคสที่หน้าตรวจรักษาอีกที
   งานชุดเดียวเลยกระจายอยู่สองที่ แท็บพวกนี้ทำให้จบในเคสเดียว

   ค่าที่บันทึกเก็บใน localStorage แยกตามเลขเคส — หน้านี้ยังไม่มี backend
   และข้อมูลต้องอยู่ข้ามการเปลี่ยนหน้า/รีเฟรช เหมือนบันทึกอื่นในระบบ
   ───────────────────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
/* ไอคอนภาพชุดเดียวกับแท็บหน้า IPD — เส้น lucide ดูคนละภาษากับที่อื่นในระบบ */
import imgGroom  from "@/assets/grooming-sidebar.png";
import imgVital  from "@/assets/vital-sign-pet.png";
import imgExam   from "@/assets/Check-up-pet.png";
import imgSvc    from "@/assets/service-pet.png";
import imgAppt   from "@/assets/appointment-pet.png";
import imgEmr    from "@/assets/emr-pet.png";
import imgPay    from "@/assets/finance-sidebar.png";
import {
  HeartPulse, Stethoscope, Receipt, CalendarDays, FileText, CreditCard,
  Plus, Check, X, Trash2, User, Clock, CheckCircle2, Scissors,
  Eye, Ear, Wind, Heart, Activity, FlaskConical, Droplets, Bone, Brain, Layers, PawPrint,
  ChevronDown, ImagePlus, MapPin, AlertTriangle, Printer,
} from "lucide-react";
import { AddServiceModal, type OrderLineItem } from "./AddServiceModal";
import { AddAppointmentModal } from "./AddAppointmentModal";
import { EMRHistorySummary } from "./EMRHistorySummary";
import { ExamPhotosPanel, ExamBodyMapPanel } from "./ExamMediaPanel";
import { PromoRedeemPanel } from "./PromoRedeemPanel";
import { getVitalRef, fmtRange } from "./vitalSignRef";
import { useSnackbar } from "../contexts/SnackbarContext";
import { fmtThaiDate } from "../utils/format";

/* ── ชนิดข้อมูลของเคส ── */
export type SysState = "normal" | "abnormal" | "skip" | null;

export interface GroomCase {
  vitals: { temp: string; pulse: string; resp: string; weight: string; by: string; at: string };
  history: { chief: string; illness: string; duration: string; better: string; past: string };
  exam: Record<string, SysState>;
  /** หมายเหตุของระบบที่ผิดปกติ — เก็บแยกเพราะกดกลับเป็นปกติแล้วยังไม่ควรลบทิ้ง */
  examNotes: Record<string, string>;
  examNote: string;
  charges: OrderLineItem[];
  appts: { id: number; date: string; time: string; vet: string; reasons: string[]; note: string }[];
  paid: boolean;
  paidAt?: string;
}

const emptyCase = (): GroomCase => ({
  vitals: { temp: "", pulse: "", resp: "", weight: "", by: "", at: "" },
  history: { chief: "", illness: "", duration: "", better: "", past: "" },
  exam: {}, examNotes: {}, examNote: "", charges: [], appts: [], paid: false,
});

const keyOf = (recordId: number) => `ehp_groom_case_${recordId}`;

export function loadGroomCase(recordId: number): GroomCase {
  try {
    const raw = localStorage.getItem(keyOf(recordId));
    return raw ? { ...emptyCase(), ...JSON.parse(raw) } : emptyCase();
  } catch {
    return emptyCase();
  }
}
function saveGroomCase(recordId: number, c: GroomCase) {
  try { localStorage.setItem(keyOf(recordId), JSON.stringify(c)); } catch { /* โควตาเต็ม */ }
}

/* ── ระบบต่าง ๆ ของร่างกาย — ชุดและไอคอนเดียวกับหน้าตรวจรักษา (OPD) ── */
const BODY_SYSTEMS = [
  { key: "eyes",  th: "ตา",                   en: "Eyes",            icon: Eye },
  { key: "ears",  th: "หู",                   en: "Ears",            icon: Ear },
  { key: "nose",  th: "จมูก",                 en: "Nose",            icon: Wind },
  { key: "mouth", th: "ปาก/ฟัน",              en: "Mouth/Teeth",     icon: Stethoscope },
  { key: "cardio",th: "หัวใจและหลอดเลือด",    en: "Cardiovascular",  icon: Heart },
  { key: "resp",  th: "ระบบทางเดินหายใจ",     en: "Respiratory",     icon: Activity },
  { key: "gi",    th: "ระบบทางเดินอาหาร",     en: "GI",              icon: FlaskConical },
  { key: "uro",   th: "ระบบทางเดินปัสสาวะ",   en: "Urogenital",      icon: Droplets },
  { key: "msk",   th: "กระดูกและกล้ามเนื้อ",   en: "Musculoskeletal", icon: Bone },
  { key: "neuro", th: "ระบบประสาท",           en: "Neurological",    icon: Brain },
  { key: "skin",  th: "ผิวหนังและขน",         en: "Skin/Coat",       icon: Layers },
  { key: "lymph", th: "ต่อมน้ำเหลือง",        en: "Lymph Nodes",     icon: PawPrint },
];

/* img = ไอคอนหลัก · icon = ตัวสำรองเผื่อภาพโหลดไม่ขึ้น (โครงเดียวกับ tabs ของ IPD) */
export const GROOM_TABS = [
  { key: "groom",   label: "บันทึกอาบน้ำตัดขน", icon: Scissors,     img: imgGroom },
  { key: "vitals",  label: "สัญญาณชีพ",         icon: HeartPulse,   img: imgVital },
  { key: "exam",    label: "ตรวจร่างกาย",       icon: Stethoscope,  img: imgExam },
  { key: "charges", label: "ค่าบริการ",         icon: Receipt,      img: imgSvc },
  { key: "appts",   label: "นัดหมาย",           icon: CalendarDays, img: imgAppt },
  { key: "emr",     label: "EMR",               icon: FileText,     img: imgEmr },
  { key: "pay",     label: "ชำระเงิน",          icon: CreditCard,   img: imgPay },
] as const;
export type GroomTabKey = typeof GROOM_TABS[number]["key"];

const baht = (n: number) => `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const lineTotal = (l: OrderLineItem) => l.qty * l.pricePerUnit - l.discount;
/* ชื่อการค้าอ่านง่ายกว่า แต่บางรายการมีแต่ชื่อสามัญ */
const itemName = (l: OrderLineItem) => l.catalogItem.tradeName || l.catalogItem.genericName;

/* ── กล่องหัวข้อมาตรฐานของแท็บ ── */
function Panel({ icon: Icon, title, sub, right, children }: {
  icon: typeof HeartPulse; title: string; sub?: string;
  right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)" }}>
          <Icon className="w-4 h-4 text-(--brand-dark)" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{title}</p>
          {sub && <p className="text-[11px] text-gray-400 truncate">{sub}</p>}
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

/* กรอบหัวข้อแบบหน้าตรวจรักษา — ไอคอนเทาในกล่องมน ไม่ใช่ไอคอนสีแบรนด์แบบ Panel */
function ExamSection({ icon: Icon, title, sub, pad = true, action, children }: {
  icon: typeof FileText; title: string; sub?: string; pad?: boolean;
  action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
          <Icon className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>{title}</h3>
          {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
        </div>
        {action}
      </div>
      {pad ? <div className="p-4">{children}</div> : children}
    </section>
  );
}

const labelCls = "block text-[11.5px] text-gray-500 mb-1.5";
const inputCls = "vet-input";
const textareaCls = "vet-textarea";

interface Props {
  tab: GroomTabKey;
  record: { id: number; pet: string; hn: string; owner: string; phone: string; date: string; price: number; services: string[]; breed: string; groomer: string };
  species?: string;
  onDirty?: (c: GroomCase) => void;
}

export function GroomCaseTabs({ tab, record, species, onDirty }: Props) {
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState<GroomCase>(() => loadGroomCase(record.id));

  /* เปลี่ยนเคสแล้วต้องโหลดของเคสนั้น ไม่ใช่ค้างค่าเคสก่อนหน้า */
  useEffect(() => { setData(loadGroomCase(record.id)); }, [record.id]);

  const patch = (p: Partial<GroomCase>) => {
    setData(prev => {
      const next = { ...prev, ...p };
      saveGroomCase(record.id, next);
      onDirty?.(next);
      return next;
    });
  };

  const [noteOpen, setNoteOpen] = useState(true);
  /* ส่วนลดจากคูปอง/แพ็กเกจ — แผงใช้สิทธิ์คืนค่ามาให้ ไม่ได้เก็บยอดเงินเอง */
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [addSvcOpen, setAddSvcOpen] = useState(false);
  const [addApptOpen, setAddApptOpen] = useState(false);

  const chargeTotal = useMemo(() => data.charges.reduce((t, l) => t + lineTotal(l), 0), [data.charges]);
  const vref = getVitalRef(species);

  /* ═══ 2. สัญญาณชีพ ═══ (ชุดเดียวกับหน้าตรวจรักษา OPD) */
  if (tab === "vitals") {
    const v = data.vitals;
    const setV = (k: keyof GroomCase["vitals"], val: string) => patch({ vitals: { ...v, [k]: val } });
    const vitalItems = [
      { k: "temp"   as const, label: "อุณหภูมิ",   unit: "°F",  min: vref.tempMin,  max: vref.tempMax,  rangeText: fmtRange(vref.tempMin, vref.tempMax) },
      { k: "pulse"  as const, label: "ชีพจร",       unit: "BPM", min: vref.pulseMin, max: vref.pulseMax, rangeText: fmtRange(vref.pulseMin, vref.pulseMax) },
      { k: "resp"   as const, label: "อัตราหายใจ", unit: "rpm", min: vref.respMin,  max: vref.respMax,  rangeText: fmtRange(vref.respMin, vref.respMax) },
      { k: "weight" as const, label: "น้ำหนัก",     unit: "กก.", min: null, max: null, rangeText: null },
    ];
    const upLabel = "text-[11px] text-gray-500 mb-1.5 block";
    const upStyle = { fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" as const };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ═══ ซ้าย — ค่าสัญญาณชีพ + ผู้บันทึก ═══ */}
        <div className="space-y-4">
          <ExamSection icon={Activity} title="ค่าสัญญาณชีพ"
            sub={`ค่าอ้างอิงตามชนิดสัตว์ (${vref.species}) จากตาราง vital_sign · ระบบจะเตือนเมื่อค่าผิดปกติ`}
            pad={false}>
            {/* 4 ค่าอยู่แถวเดียวบนจอกว้าง — ช่องตัวเลขไม่ต้องยืดเต็มครึ่งจอ */}
            <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {vitalItems.map(it => {
                const val = v[it.k] ?? "";
                const num = parseFloat(val);
                const isEmpty = val.trim() === "" || isNaN(num);
                const isAbnormal = !isEmpty && it.min !== null && it.max !== null && (num < it.min || num > it.max);
                return (
                  <div key={it.k}>
                    {/* ป้ายบรรทัดเดียวทุกช่อง — ช่วงปกติอยู่ใต้ช่องกรอก
                        ไม่งั้นช่องที่ไม่มีช่วงปกติ (น้ำหนัก) จะลอยสูงกว่าเพื่อน */}
                    <label htmlFor={`gv-${it.k}`} className="block mb-1.5">
                      <span className="text-[11.5px] text-gray-600 block truncate" style={{ fontWeight: 600 }}>
                        {it.label} <span className="text-gray-400" style={{ fontWeight: 500 }}>({it.unit})</span>
                      </span>
                    </label>
                    <input id={`gv-${it.k}`} value={val} inputMode="decimal"
                      placeholder={`ระบุ${it.label}`}
                      onChange={e => setV(it.k, e.target.value)}
                      className="vet-input"
                      style={isAbnormal ? { color: "#dc2626", borderColor: "rgba(239,68,68,0.40)" } : undefined} />
                    {isAbnormal ? (
                      <p className="text-[10.5px] text-rose-500 mt-1 flex items-start gap-1" style={{ fontWeight: 600 }}>
                        <AlertTriangle className="w-3 h-3 mt-[1px] flex-shrink-0" strokeWidth={2.4} /> ค่าผิดปกติ — ปกติ {it.rangeText}
                      </p>
                    ) : it.rangeText ? (
                      <p className="text-[10px] text-gray-400 mt-1" style={{ fontWeight: 500 }}>ปกติ {it.rangeText}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </ExamSection>

          <ExamSection icon={User} title="ผู้บันทึก" sub="Recorded By">
            <div className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: "0 3px 10px rgba(14,165,233,0.40)" }}>
                <div className="w-full h-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}>
                  <Stethoscope className="w-5 h-5" strokeWidth={2.2} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10.5px] text-gray-500" style={upStyle}>ชื่อผู้บันทึก</div>
                <div className="text-[14px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{v.by || record.groomer || "—"}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10.5px] text-gray-500" style={upStyle}>วันที่บันทึก</div>
                <div className="text-[12px] text-gray-700" style={{ fontWeight: 600 }}>{fmtThaiDate(record.date)}</div>
              </div>
            </div>
          </ExamSection>
        </div>

        {/* ═══ ขวา — อาการ & ประวัติ ═══ */}
        <ExamSection icon={FileText} title="อาการ & ประวัติ" sub="History & Chief Complaint">
          <div className="space-y-3">
            <div>
              <label className={upLabel} style={upStyle}>
                อาการสำคัญ <span className="text-gray-400 normal-case">(Chief Complaint)</span>
              </label>
              <textarea rows={2} className={textareaCls} value={data.history.chief}
                onChange={e => patch({ history: { ...data.history, chief: e.target.value } })}
                placeholder="ระบุอาการสำคัญที่นำสัตว์มาพบสัตวแพทย์" />
            </div>
            <div>
              <label className={upLabel} style={upStyle}>ประวัติการเจ็บป่วย</label>
              <textarea rows={2} className={textareaCls} value={data.history.illness}
                onChange={e => patch({ history: { ...data.history, illness: e.target.value } })}
                placeholder="อธิบายอาการเจ็บป่วยในรายละเอียด" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={upLabel} style={upStyle}>ระยะเวลาที่มีอาการ</label>
                <input className={inputCls} value={data.history.duration}
                  onChange={e => patch({ history: { ...data.history, duration: e.target.value } })}
                  placeholder="เช่น 3 วัน, 1 สัปดาห์" />
              </div>
              <div>
                <label className={upLabel} style={upStyle}>อาการที่เพิ่มเติมที่มีความผิดปกติ</label>
                <input className={inputCls} value={data.history.better}
                  onChange={e => patch({ history: { ...data.history, better: e.target.value } })}
                  placeholder="เช่น ขนร่วง, ผิวหนังแดง" />
              </div>
            </div>
            <div>
              <label className={upLabel} style={upStyle}>ประวัติการรักษาก่อนหน้า</label>
              <textarea rows={2} className={textareaCls} value={data.history.past}
                onChange={e => patch({ history: { ...data.history, past: e.target.value } })}
                placeholder="ระบุการรักษาที่เคยได้รับในครั้งก่อน (ถ้ามี)" />
            </div>
          </div>
        </ExamSection>
      </div>
    );
  }

  /* ═══ 3. ตรวจร่างกาย ═══ (ชุดเดียวกับหน้าตรวจรักษา OPD) */
  if (tab === "exam") {
    const c = BODY_SYSTEMS.reduce((a, sy) => {
      const v = data.exam[sy.key];
      if (v === "normal") a.normal++; else if (v === "abnormal") a.abnormal++; else if (v === "skip") a.skip++;
      return a;
    }, { normal: 0, abnormal: 0, skip: 0 });
    const total = BODY_SYSTEMS.length;
    const checked = c.normal + c.abnormal + c.skip;
    /* กดปุ่มเดิมซ้ำ = ยกเลิก กลับเป็นยังไม่ตรวจ */
    const setSys = (k: string, v: Exclude<SysState, null>) =>
      patch({ exam: { ...data.exam, [k]: data.exam[k] === v ? null : v } });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <section className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
            <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                <Stethoscope className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>ระบบต่างๆ ของร่างกาย</h3>
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
                    style={{
                      background: checked === total ? "rgba(16,185,129,0.10)" : "color-mix(in srgb, var(--brand) 10%, transparent)",
                      color: checked === total ? "#059669" : "var(--brand-dark)",
                      fontWeight: 700,
                      border: `1px solid ${checked === total ? "rgba(16,185,129,0.20)" : "color-mix(in srgb, var(--brand) 20%, transparent)"}`,
                    }}>
                    {checked === total && <Check className="w-2.5 h-2.5 mr-0.5" strokeWidth={3} />}
                    {checked}/{total}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[10.5px] mt-0.5">
                  <span className="inline-flex items-center gap-1 text-(--brand-dark)" style={{ fontWeight: 600 }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-(--brand)" /> ปกติ {c.normal}
                  </span>
                  <span className="inline-flex items-center gap-1 text-rose-500" style={{ fontWeight: 600 }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> ผิดปกติ {c.abnormal}
                  </span>
                  <span className="inline-flex items-center gap-1 text-gray-400" style={{ fontWeight: 600 }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> ข้าม {c.skip}
                  </span>
                </div>
              </div>
              {/* ส่วนใหญ่ตรวจแล้วปกติหมด — กดทีเดียวแล้วค่อยแก้เฉพาะที่ผิดปกติ */}
              <button type="button"
                onClick={() => patch({ exam: Object.fromEntries(BODY_SYSTEMS.map(sy => [sy.key, "normal" as SysState])) })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-(--brand-dark) hover:bg-(--brand)/15 transition-colors flex-shrink-0"
                style={{ fontWeight: 600, background: "color-mix(in srgb, var(--brand) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)" }}>
                <Check className="w-3.5 h-3.5" strokeWidth={2.4} /> ปกติทั้งหมด
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {BODY_SYSTEMS.map(({ key, th, en, icon: Icon }) => {
                const st = data.exam[key] ?? null;
                const isNormal = st === "normal", isAbnormal = st === "abnormal", isSkipped = st === "skip";
                return (
                  <div key={key} className="px-4 py-2.5 transition-colors"
                    style={{ background: isAbnormal ? "rgba(239,68,68,0.03)" : isNormal ? "color-mix(in srgb, var(--brand) 3%, transparent)" : "transparent" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: isAbnormal ? "linear-gradient(135deg, #f87171, #dc2626)"
                            : isNormal ? "linear-gradient(135deg, #34d399, #059669)"
                            : isSkipped ? "#e5e7eb" : "#f3f4f6",
                          boxShadow: isAbnormal ? "0 2px 6px rgba(239,68,68,0.30), inset 0 1px 0 rgba(255,255,255,0.30)"
                            : isNormal ? "0 2px 6px color-mix(in srgb, var(--brand) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.30)"
                            : "none",
                        }}>
                        <Icon className={`w-4 h-4 ${isNormal || isAbnormal ? "text-white" : "text-gray-400"}`} strokeWidth={2.2} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] truncate ${st ? "text-gray-900" : "text-gray-700"}`} style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{th}</div>
                        <div className="text-[10px] text-gray-400 truncate" style={{ fontWeight: 500, letterSpacing: "0.3px" }}>{en}</div>
                      </div>

                      <div className="flex items-center bg-gray-100 rounded-full p-0.5 flex-shrink-0">
                        <button type="button" title="ปกติ" onClick={() => setSys(key, "normal")}
                          className="w-8 h-7 inline-flex items-center justify-center rounded-full transition-all"
                          style={{
                            background: isNormal ? "linear-gradient(135deg, var(--brand), var(--brand-dark))" : "transparent",
                            color: isNormal ? "#ffffff" : "#9ca3af",
                            boxShadow: isNormal ? "0 2px 6px color-mix(in srgb, var(--brand) 40%, transparent)" : "none",
                          }}>
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                        <button type="button" title="ผิดปกติ" onClick={() => setSys(key, "abnormal")}
                          className="w-8 h-7 inline-flex items-center justify-center rounded-full transition-all"
                          style={{
                            background: isAbnormal ? "linear-gradient(135deg, #f87171, #dc2626)" : "transparent",
                            color: isAbnormal ? "#ffffff" : "#9ca3af",
                            boxShadow: isAbnormal ? "0 2px 6px rgba(239,68,68,0.40)" : "none",
                          }}>
                          <X className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                        <button type="button" title="ไม่ได้ตรวจ" onClick={() => setSys(key, "skip")}
                          className="w-8 h-7 inline-flex items-center justify-center rounded-full transition-all text-[12px]"
                          style={{
                            background: isSkipped ? "linear-gradient(135deg, #9ca3af, #6b7280)" : "transparent",
                            color: isSkipped ? "#ffffff" : "#9ca3af",
                            fontWeight: 700,
                            boxShadow: isSkipped ? "0 2px 6px rgba(107,114,128,0.40)" : "none",
                          }}>
                          —
                        </button>
                      </div>
                    </div>

                    {/* ผิดปกติแล้วต้องระบุว่าเจออะไร ไม่งั้นบันทึกไว้ก็ใช้ต่อไม่ได้ */}
                    <AnimatePresence initial={false}>
                      {isAbnormal && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden ml-12">
                          <input
                            value={data.examNotes[key] ?? ""}
                            onChange={e => patch({ examNotes: { ...data.examNotes, [key]: e.target.value } })}
                            placeholder="ระบุความผิดปกติที่พบ..."
                            className="w-full px-3 py-1.5 text-[11.5px] rounded-full focus:outline-none transition-all"
                            style={{ background: "#ffffff", border: "1.5px solid rgba(239,68,68,0.25)", color: "#7f1d1d" }}
                            onFocus={e => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 4px rgba(239,68,68,0.10)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(239,68,68,0.25)"; e.target.style.boxShadow = "none"; }}
                            autoFocus />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>

          {/* บันทึกทั่วไป — พับเก็บได้เหมือน OPD ส่วนใหญ่ไม่ได้กรอก ไม่ต้องกินที่ */}
          <section className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
            <button type="button" onClick={() => setNoteOpen(o => !o)}
              className="w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-gray-50/60">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
                <FileText className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>บันทึกทั่วไป</h3>
                <p className="text-[11px] text-gray-500">พฤติกรรม อุปนิสัย และข้อสังเกตอื่นๆ</p>
              </div>
              <motion.span animate={{ rotate: noteOpen ? 180 : 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {noteOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }} className="overflow-hidden border-t border-gray-100/80">
                  <div className="p-4">
                    <textarea rows={4} className={textareaCls} value={data.examNote}
                      onChange={e => patch({ examNote: e.target.value })}
                      placeholder="บันทึกการตรวจทั่วไป พฤติกรรม อุปนิสัยของสัตว์..." />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* ═══ ขวา — รูปภาพ + แผนผังร่างกาย (กรอบหัวข้อชุดเดียวกับ OPD) ═══ */}
        <div className="space-y-4">
          <ExamSection icon={ImagePlus} title="รูปภาพการตรวจ" sub="อัปโหลดรูปประกอบการวินิจฉัย">
            <ExamPhotosPanel />
          </ExamSection>
          <ExamSection icon={MapPin} title="แผนผังร่างกาย" sub="ปักหมายจุดที่พบความผิดปกติ">
            <ExamBodyMapPanel species={species} />
          </ExamSection>
        </div>
      </div>
    );
  }

  /* ═══ 4. ค่าบริการ ═══ (ชุดเดียวกับหน้าตรวจรักษา OPD) */
  if (tab === "charges") {
    const vat = Math.round(chargeTotal * 0.07);
    return (
      <>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <ExamSection icon={Receipt} title="ค่าบริการ" sub="รายการบริการและค่าใช้จ่าย" pad={false}
              action={
                <button onClick={() => setAddSvcOpen(true)} className="vet-btn vet-btn-orange"
                  style={{ height: 32, padding: "0 14px", fontSize: "calc(12px * var(--fs))" }}>
                  <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
                </button>
              }>
              <div className="p-5">
                {/* การ์ดรายรายการ — ไม่ใช่ตาราง เพราะแต่ละแถวมีทั้งชื่อ หน่วย จำนวน ราคา ส่วนลด */}
                <div className="space-y-2">
                  {data.charges.length === 0 ? (
                    <p className="text-[12.5px] text-gray-400 py-8 text-center">ยังไม่มีรายการค่าบริการ — กด “เพิ่มรายการ”</p>
                  ) : data.charges.map((l, idx) => (
                    <motion.div key={idx}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="group relative rounded-2xl bg-white transition-all"
                      style={{ border: "1.5px solid #f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                      <div className="p-3">
                        <div className="flex items-start gap-2.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] flex-shrink-0 tabular-nums"
                            style={{ background: "linear-gradient(135deg, #34d399, #059669)", fontWeight: 700, boxShadow: "0 2px 6px rgba(16,185,129,0.30), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[13.5px] text-gray-900 block truncate" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{itemName(l)}</span>
                            <span className="text-[11px] text-gray-500 block truncate" style={{ fontWeight: 500 }}>{l.catalogItem.unit}</span>
                          </div>
                          {/* ปุ่มโผล่ตอนชี้เมาส์ — ลดสิ่งรบกวนตอนไล่อ่านรายการ */}
                          <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => patch({ charges: data.charges.filter((_, k) => k !== idx) })}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title="ลบ">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-600 px-2 py-0.5 rounded-full"
                            style={{ background: "color-mix(in srgb, var(--brand) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 18%, transparent)", fontWeight: 600 }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-(--brand)" />
                            {l.qty} {l.catalogItem.unit}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-600 px-2 py-0.5 rounded-full bg-gray-100" style={{ fontWeight: 600 }}>
                            ฿{l.pricePerUnit.toLocaleString()}<span className="text-gray-400">/หน่วย</span>
                          </span>
                          {l.discount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "#dc2626", fontWeight: 700 }}>
                              -฿{l.discount.toLocaleString()}
                            </span>
                          )}
                          <div className="ml-auto flex items-baseline gap-1 flex-shrink-0">
                            <span className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>รวม</span>
                            <span className="text-[16px] text-(--brand-dark)" style={{ fontWeight: 800, letterSpacing: "-0.3px" }}>฿{lineTotal(l).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* สรุปค่าใช้จ่าย */}
                <div className="mt-4 rounded-xl border border-(--brand)/15 bg-gradient-to-br from-(--brand)/[0.03] to-white p-4 space-y-2.5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full bg-(--brand)" />
                    <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>สรุปค่าใช้จ่าย</span>
                  </div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">รวมค่าบริการ</span><span className="text-gray-700">฿{chargeTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">ภาษีมูลค่าเพิ่ม 7%</span><span className="text-gray-700">฿{vat.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-(--brand)/10 pt-3 mt-1">
                    <span className="text-gray-900" style={{ fontWeight: 700 }}>ยอดรวมทั้งหมด</span>
                    <span className="text-lg text-(--brand)" style={{ fontWeight: 700 }}>฿{(chargeTotal + vat).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <button onClick={() => window.print()} className="vet-btn vet-btn-secondary"
                    style={{ height: 36, fontSize: "calc(12px * var(--fs))", padding: "0 14px" }}>
                    <Printer className="w-3.5 h-3.5" />พิมพ์ใบสรุปค่ารักษา
                  </button>
                </div>
              </div>
            </ExamSection>
          </div>

          {/* ประวัติค่าบริการเดิม — ซ่อนบนจอแคบเหมือน OPD */}
          <div className="hidden lg:block w-[420px] flex-shrink-0">
            <ExamSection icon={Receipt} title="ประวัติค่าบริการ" sub="รายการค่ารักษาก่อนหน้า">
              <EMRHistorySummary petName={record.pet} hn={record.hn} />
            </ExamSection>
          </div>
        </div>

        <AddServiceModal open={addSvcOpen} onClose={() => setAddSvcOpen(false)}
          weightKg={parseFloat(data.vitals.weight) || null}
          onAdd={items => {
            patch({ charges: [...data.charges, ...items] });
            setAddSvcOpen(false);
            showSnackbar("success", `เพิ่ม ${items.length} รายการค่าบริการแล้ว`);
          }} />
      </>
    );
  }

  /* ═══ 5. นัดหมาย ═══ */
  if (tab === "appts") {
    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          <Panel icon={CalendarDays} title="รายการนัดหมาย" sub={`กำลังจะถึง ${data.appts.length} รายการ`}
            right={
              <button onClick={() => setAddApptOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)", fontWeight: 600 }}>
                <Plus className="w-3.5 h-3.5" /> เพิ่มนัดใหม่
              </button>
            }>
            {data.appts.length === 0 ? (
              <p className="text-[12.5px] text-gray-400 py-8 text-center">ยังไม่มีนัดหมายที่กำลังจะถึง</p>
            ) : (
              <div className="space-y-2">
                {data.appts.map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "color-mix(in srgb, var(--brand) 12%, transparent)" }}>
                      <CalendarDays className="w-4 h-4 text-(--brand-dark)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>
                        {fmtThaiDate(a.date)} {a.time && `· ${a.time} น.`}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{a.vet}{a.reasons.length ? ` · ${a.reasons.join(", ")}` : ""}</p>
                    </div>
                    <button onClick={() => patch({ appts: data.appts.filter(x => x.id !== a.id) })}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0" title="ลบนัดนี้">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel icon={Clock} title="ประวัตินัดหมาย" sub="นัดหมายที่ผ่านมา — มาตามนัด/ผิดนัด">
            <p className="text-[12.5px] text-gray-400 py-8 text-center">ไม่มีประวัตินัดหมาย</p>
          </Panel>
        </div>

        <AddAppointmentModal open={addApptOpen} onClose={() => setAddApptOpen(false)}
          onSave={r => {
            /* โมดัลคืน day เป็นวันที่ของเดือนปัจจุบัน — ประกอบเป็นวันเต็มเอง */
            const now = new Date();
            const d = new Date(now.getFullYear(), now.getMonth(), r.day || now.getDate());
            patch({ appts: [...data.appts, {
              id: Date.now(),
              date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
              time: r.time || r.timeNote || "", vet: r.vetName || "—",
              reasons: [], note: r.timeNote ?? "",
            }] });
            setAddApptOpen(false);
            showSnackbar("success", `บันทึกนัดหมายให้ "${record.pet}" แล้ว`);
          }} />
      </>
    );
  }

  /* ═══ 6. EMR ═══ */
  if (tab === "emr") {
    return <EMRHistorySummary petName={record.pet} hn={record.hn} />;
  }

  /* ═══ 7. ชำระเงิน ═══ */
  if (tab === "pay") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: data.paid ? "rgba(16,185,129,0.07)" : "rgba(245,158,11,0.08)",
            border: `1px solid ${data.paid ? "rgba(16,185,129,0.28)" : "rgba(245,158,11,0.30)"}`,
          }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: data.paid ? "#10b981" : "#f59e0b" }}>
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px]" style={{ fontWeight: 700, color: data.paid ? "#047857" : "#b45309" }}>
              {data.paid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
            </p>
            <p className="text-[11.5px]" style={{ color: data.paid ? "#059669" : "#d97706" }}>
              {data.charges.length} รายการ · รวม {baht(Math.max(0, chargeTotal - promoDiscount))}
              {data.paid && data.paidAt ? ` · ${data.paidAt}` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          <Panel icon={Receipt} title="สรุปบิล" sub={`${data.charges.length} รายการ`}>
            {data.charges.length === 0 ? (
              <p className="text-[12.5px] text-gray-400 py-8 text-center">
                ยังไม่มีรายการ — เพิ่มได้ที่แท็บ “ค่าบริการ”
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-[12.5px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th className="text-left px-3 py-2.5">รายการ</th>
                      <th className="text-center px-3 py-2.5">จำนวน</th>
                      <th className="text-right px-3 py-2.5">ราคา/หน่วย</th>
                      <th className="text-right px-3 py-2.5">ส่วนลด</th>
                      <th className="text-right px-3 py-2.5">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.charges.map((l, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5">
                          <p className="text-gray-800 truncate" style={{ fontWeight: 600 }}>{itemName(l)}</p>
                          <p className="text-[10.5px] text-gray-400">{baht(l.pricePerUnit)} / หน่วย</p>
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{l.qty}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600">{baht(l.pricePerUnit)}</td>
                        <td className="px-3 py-2.5 text-right text-gray-400">{l.discount ? `−${baht(l.discount)}` : "—"}</td>
                        <td className="px-3 py-2.5 text-right text-gray-900" style={{ fontWeight: 700 }}>{baht(lineTotal(l))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="space-y-4">
            <Panel icon={Receipt} title="สรุปยอด">
              <div className="flex items-center justify-between text-[12.5px] text-gray-500">
                <span>ยอดรวมรายการ</span><span>{baht(chargeTotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex items-center justify-between text-[12.5px] mt-1.5" style={{ color: "#dc2626" }}>
                  <span>ส่วนลดคูปอง/แพ็กเกจ</span><span style={{ fontWeight: 600 }}>−{baht(promoDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>ยอดที่ต้องชำระ</span>
                <span className="text-[19px] text-(--brand-dark)" style={{ fontWeight: 800 }}>{baht(Math.max(0, chargeTotal - promoDiscount))}</span>
              </div>
            </Panel>
            <PromoRedeemPanel scope="groom" subtotal={chargeTotal}
              pet={{ id: record.id, name: record.pet }}
              onChange={d => setPromoDiscount(d)} />
            <Panel icon={CreditCard} title="วิธีชำระเงิน">
              <button
                disabled={data.paid || data.charges.length === 0}
                onClick={() => {
                  patch({ paid: true, paidAt: new Date().toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) });
                  showSnackbar("success", `รับชำระ ${baht(Math.max(0, chargeTotal - promoDiscount))} เรียบร้อย`);
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-dark))", fontWeight: 700, fontSize: 14 }}>
                <CheckCircle2 className="w-4 h-4" />
                {data.paid ? "ชำระเงินแล้ว" : "ยืนยันชำระเงิน"}
              </button>
              {!data.paid && data.charges.length === 0 && (
                <p className="vet-tiny mt-2 text-center">ต้องมีรายการค่าบริการก่อนจึงจะรับชำระได้</p>
              )}
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
