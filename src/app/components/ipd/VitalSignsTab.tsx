import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, Thermometer, Wind, Gauge, Activity, Plus, X, Check, AlertTriangle, History, Pencil, Trash2,
} from "lucide-react";
import { useIPD, type VitalSign } from "../../contexts/IPDContext";
import { getVitalRef, fmtRange, type VitalSignRef } from "../vitalSignRef";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });

/* เทียบกับค่าอ้างอิงตามชนิดสัตว์จากตาราง vital_sign */
function isCritical(v: { temp?: string; pulse?: string; resp?: string; painScore?: number }, ref: VitalSignRef) {
  const t = parseFloat(v.temp ?? "");
  const p = parseFloat(v.pulse ?? "");
  const r = parseFloat(v.resp ?? "");
  if (!isNaN(t) && (t < ref.tempMin || t > ref.tempMax)) return true;
  if (!isNaN(p) && (p < ref.pulseMin || p > ref.pulseMax)) return true;
  if (!isNaN(r) && (r < ref.respMin || r > ref.respMax)) return true;
  if ((v.painScore ?? 0) >= 7) return true;
  return false;
}

/* ─── Example data (shown when no real records exist) — temps in °F ─── */
const EXAMPLE_VITALS: Array<Omit<VitalSign, "id" | "admitId"> & { isExample: true }> = [
  { isExample: true, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),  recordedBy: "พ.ญ. กัลยา", temp: "100.9", pulse: "108", resp: "20", bpSys: "118", bpDia: "75", painScore: 1, note: "อาการดีขึ้น เริ่มกินอาหารอ่อนได้" },
  { isExample: true, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),  recordedBy: "พ.ญ. สิริ",  temp: "101.5", pulse: "124", resp: "24", bpSys: "125", bpDia: "82", painScore: 3, note: "อาเจียน 1 ครั้ง ปริมาณน้อย" },
  { isExample: true, timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),  recordedBy: "พ.ญ. สิริ",  temp: "103.3", pulse: "138", resp: "28", bpSys: "130", bpDia: "85", painScore: 5, note: "ไข้ขึ้น ให้ NSAID" },
  { isExample: true, timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), recordedBy: "พ.ญ. กัลยา", temp: "101.1", pulse: "118", resp: "22", bpSys: "120", bpDia: "80", painScore: 2, note: "ตื่นตัว ตอบสนองดี กินน้ำเอง 30 มล." },
];

const VITAL_DEFS = [
  { key: "temp",  label: "T",  full: "อุณหภูมิ",   unit: "°F",   color: "#f43f5e", grad: "linear-gradient(135deg, #fb7185, #e11d48)", icon: Thermometer, range: "100.5–102.5" },
  { key: "pulse", label: "P",  full: "ชีพจร",       unit: "bpm",  color: "#ec4899", grad: "linear-gradient(135deg, #f472b6, #db2777)", icon: Heart,       range: "60–180" },
  { key: "resp",  label: "R",  full: "หายใจ",       unit: "rpm",  color: "#0ea5e9", grad: "linear-gradient(135deg, #38bdf8, #0284c7)", icon: Wind,        range: "10–30" },
  { key: "bp",    label: "BP", full: "ความดัน",     unit: "mmHg", color: "#8b5cf6", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", icon: Gauge,       range: "120/80" },
  { key: "pain",  label: "PS", full: "Pain Score",  unit: "/10",  color: "#fb923c", grad: "linear-gradient(135deg, #fb923c, #ea580c)", icon: Activity,    range: "0–3" },
] as const;

function getVal(v: VitalSign | (Omit<VitalSign, "id"|"admitId">) | undefined, key: typeof VITAL_DEFS[number]["key"]): string | undefined {
  if (!v) return undefined;
  if (key === "bp") return v.bpSys && v.bpDia ? `${v.bpSys}/${v.bpDia}` : undefined;
  if (key === "pain") return v.painScore !== undefined ? String(v.painScore) : undefined;
  return (v as any)[key] as string | undefined;
}

export function VitalSignsTab({ admitId }: { admitId: number }) {
  const { vitals, deleteVital, admits } = useIPD();
  const admit = admits.find(a => a.id === admitId);
  const vref = getVitalRef(admit?.species);   // ค่าอ้างอิงตามชนิดสัตว์ (ตาราง vital_sign)
  const defs = VITAL_DEFS.map(m =>
    m.key === "temp"  ? { ...m, range: fmtRange(vref.tempMin, vref.tempMax) } :
    m.key === "pulse" ? { ...m, range: fmtRange(vref.pulseMin, vref.pulseMax) } :
    m.key === "resp"  ? { ...m, range: fmtRange(vref.respMin, vref.respMax) } : m);
  const confirm = useConfirm();
  const { showSnackbar } = useSnackbar();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<VitalSign | null>(null);

  const handleDelete = async (v: VitalSign) => {
    const ok = await confirm({
      title: "ลบการวัดสัญญาณชีพ",
      description: `ลบรายการเวลา ${fmtDateTime(v.timestamp)} ออกจากประวัติการวัด?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    deleteVital(v.id);
    showSnackbar("success", "ลบบันทึกแล้ว");
  };

  const items = useMemo(() =>
    vitals.filter(v => v.admitId === admitId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [vitals, admitId]
  );

  const useExamples = items.length === 0;
  const displayItems: Array<(VitalSign | typeof EXAMPLE_VITALS[number]) & { isExample?: boolean }> =
    useExamples ? EXAMPLE_VITALS : items;
  const latest = displayItems[0];
  const criticalCount = displayItems.filter(v => isCritical(v, vref)).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
      {/* ─── LEFT: Latest preview (read-only) ───
          Laws applied:
          - Miller's Law / Chunking: 1 main group (values) + meta stats inline → ลดการกลุ่ม
          - Law of Common Region: ค่าทั้ง 5 ครอบในกรอบเดียว (visual unity)
          - Selective Attention: critical alert ใช้สีแดงเฉพาะเมื่อมีค่าวิกฤตจริง
          - Aesthetic-Usability: typography hierarchy + consistent spacing
          - Fitts's Law: ปุ่มเพิ่มสูง 40px, hit area ≥44px
          - Von Restorff: ปุ่ม + เพิ่ม เป็น primary action สีเดียวบนหน้า
      */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <Activity className="w-5 h-5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>ค่าล่าสุด <span className="text-[10px] text-gray-400" style={{ fontWeight: 500 }}>· อ้างอิง{vref.species} (vital_sign)</span></h3>
            <p className="text-[11px] text-gray-500 truncate">
              {latest ? <>
                {fmtDateTime(latest.timestamp)} · {latest.recordedBy}
                <span className="mx-1.5 text-gray-300">·</span>
                วัดแล้ว {displayItems.length} ครั้ง
                {criticalCount > 0 && <> <span className="text-rose-600" style={{ fontWeight: 700 }}>· วิกฤต {criticalCount}</span></>}
              </> : "ยังไม่มีข้อมูล"}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="vet-btn vet-btn-orange inline-flex items-center gap-1"
            aria-label="เพิ่มการวัดค่าสัญญาณชีพ"
          >
            <Plus className="w-3.5 h-3.5" /> เพิ่ม
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status banner — Peak-End / Selective Attention */}
          {latest && (
            <div
              className="flex items-center gap-2 p-2.5 rounded-xl"
              style={{
                background: isCritical(latest, vref) ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)",
                border: isCritical(latest, vref) ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(16,185,129,0.20)",
              }}
            >
              {isCritical(latest, vref) ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="text-[11.5px] text-rose-700" style={{ fontWeight: 600 }}>ตรวจพบค่าวิกฤต — แจ้งแพทย์ทันที</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2.6} />
                  <span className="text-[11.5px] text-emerald-700" style={{ fontWeight: 600 }}>ค่าสัญญาณชีพอยู่ในเกณฑ์ปกติ</span>
                </>
              )}
            </div>
          )}

          {/* ช่วงปกติของสัตว์ตัวนี้ — จากตาราง vital_sign */}
          <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(25,165,137,0.06)", border: "1px solid rgba(25,165,137,0.18)" }}>
            <span className="text-[11.5px] text-[#0d7c66]" style={{ fontWeight: 800 }}>
              ช่วงปกติของ{vref.species} <span style={{ fontWeight: 500, opacity: 0.7 }}>(ตาราง vital_sign)</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-white" style={{ fontWeight: 600, color: "#db2777", border: "1px solid rgba(236,72,153,0.25)" }}>
              ชีพจร {fmtRange(vref.pulseMin, vref.pulseMax)} bpm
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-white" style={{ fontWeight: 600, color: "#0284c7", border: "1px solid rgba(14,165,233,0.25)" }}>
              หายใจ {fmtRange(vref.respMin, vref.respMax)} rpm
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-white" style={{ fontWeight: 600, color: "#e11d48", border: "1px solid rgba(244,63,94,0.25)" }}>
              อุณหภูมิ {fmtRange(vref.tempMin, vref.tempMax)} °F
            </span>
          </div>

          {/* Uniform 3-col grid = Law of Common Region + Similarity */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/30 grid grid-cols-3 divide-x divide-y divide-gray-100">
            {defs.map(m => <ValueCell key={m.key} m={m} latest={latest} vref={vref} />)}
            {/* Fill remaining cells to keep grid uniform */}
            <div aria-hidden className="bg-gray-50/40" />
          </div>

          {/* Note — Chunking: no header label, content speaks for itself */}
          {latest?.note && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-gray-50/60 border border-gray-100">
              <span className="text-gray-300 text-[14px] leading-none" style={{ fontWeight: 700 }}>"</span>
              <span className="text-[12px] text-gray-700 italic flex-1" style={{ lineHeight: 1.55 }}>{latest.note}</span>
              <span className="text-gray-300 text-[14px] leading-none" style={{ fontWeight: 700 }}>"</span>
            </div>
          )}
        </div>
      </section>

      {/* ─── RIGHT: History ─── */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <History className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ประวัติการวัด</h3>
            <p className="text-[11px] text-gray-500">{displayItems.length} ครั้ง{criticalCount > 0 && ` · วิกฤต ${criticalCount}`}</p>
          </div>
        </div>

        <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
          {displayItems.map((v, idx) => {
            const crit = isCritical(v, vref);
            const tempN = parseFloat(v.temp ?? "");
            const pulseN = parseFloat(v.pulse ?? "");
            const respN = parseFloat(v.resp ?? "");
            const tempCrit = !isNaN(tempN) && (tempN < vref.tempMin || tempN > vref.tempMax);
            const pulseCrit = !isNaN(pulseN) && (pulseN < vref.pulseMin || pulseN > vref.pulseMax);
            const respCrit = !isNaN(respN) && (respN < vref.respMin || respN > vref.respMax);
            const painCrit = (v.painScore ?? 0) >= 7;
            return (
              <div
                key={v.isExample ? `ex-${idx}` : (v as VitalSign).id}
                className="rounded-2xl border border-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-md overflow-hidden bg-white"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
              >
                <div className="px-3 py-2.5">
                  {/* Header row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] text-gray-900" style={{ fontWeight: 700, letterSpacing: "-0.1px" }}>
                      {fmtDateTime(v.timestamp)}
                    </span>
                    <span className="text-gray-300 text-[11px]">·</span>
                    <span className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{v.recordedBy}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] px-2 py-0.5 rounded-full flex-shrink-0" style={{
                      background: crit ? "rgba(239,68,68,0.10)" : "rgba(16,185,129,0.10)",
                      color: crit ? "#dc2626" : "#059669",
                      fontWeight: 700,
                    }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: crit ? "#dc2626" : "#10b981" }} />
                      {crit ? "วิกฤต" : "ปกติ"}
                    </span>
                    {!v.isExample && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => setEditing(v as VitalSign)}
                          title="แก้ไข"
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v as VitalSign)}
                          title="ลบ"
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Big value strip */}
                  <div className="rounded-xl bg-gray-50/70 border border-gray-100 grid grid-cols-5 divide-x divide-gray-100 mb-2">
                    <BigVal label="T"  unit="°F"   value={v.temp}     critical={tempCrit} />
                    <BigVal label="P"  unit="bpm"  value={v.pulse}    critical={pulseCrit} />
                    <BigVal label="R"  unit="rpm"  value={v.resp} critical={respCrit} />
                    <BigVal label="BP" unit="mmHg" value={v.bpSys && v.bpDia ? `${v.bpSys}/${v.bpDia}` : undefined} small />
                    <BigVal label="PS" unit="/10"  value={v.painScore !== undefined ? String(v.painScore) : undefined} critical={painCrit} />
                  </div>

                  {/* Note */}
                  {v.note && (
                    <div className="text-[11px] text-gray-600 italic flex items-start gap-1 px-1" style={{ lineHeight: 1.5 }}>
                      <span className="text-gray-300 flex-shrink-0">"</span>
                      <span className="line-clamp-2">{v.note}</span>
                      <span className="text-gray-300 flex-shrink-0">"</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {(showAdd || editing) && (
          <VitalAddModal
            key={editing?.id ?? "new"}
            admitId={admitId}
            vref={vref}
            existing={editing}
            onClose={() => { setShowAdd(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ValueCell({ m, latest, vref }: { m: Omit<typeof VITAL_DEFS[number], "range"> & { range: string }; latest?: VitalSign | typeof EXAMPLE_VITALS[number]; vref: VitalSignRef }) {
  const Ico = m.icon;
  const val = getVal(latest, m.key);
  const valNum = parseFloat(val ?? "");
  /* เทียบช่วงปกติจากตาราง vital_sign ตามชนิดสัตว์ */
  const cellCritical = m.key === "temp" ? !isNaN(valNum) && (valNum < vref.tempMin || valNum > vref.tempMax)
    : m.key === "pulse" ? !isNaN(valNum) && (valNum < vref.pulseMin || valNum > vref.pulseMax)
    : m.key === "resp" ? !isNaN(valNum) && (valNum < vref.respMin || valNum > vref.respMax)
    : m.key === "pain" ? (latest?.painScore ?? 0) >= 7
    : false;
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white"
          style={{ background: m.grad, boxShadow: `0 2px 6px ${m.color}45, inset 0 1px 0 rgba(255,255,255,0.30)` }}
        >
          <Ico className="w-3.5 h-3.5" strokeWidth={2.4} />
        </div>
        <span className="text-[10px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>{m.full}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: !val ? "#d1d5db" : cellCritical ? "#dc2626" : "#111827", lineHeight: 1 }}>
          {val ?? "—"}
        </span>
        {val && <span className="text-[11px] text-gray-500" style={{ fontWeight: 500 }}>{m.unit}</span>}
      </div>
      <div className="text-[10px] text-gray-400 mt-1" style={{ fontWeight: 500 }}>ปกติ {m.range}</div>
    </div>
  );
}

function BigVal({ label, value, unit, critical, small }: { label: string; value?: string; unit: string; critical?: boolean; small?: boolean }) {
  const has = !!value;
  return (
    <div className="py-1.5 px-1 text-center min-w-0">
      <div className="text-[9px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.4px" }}>{label}</div>
      <div className="truncate" style={{
        fontSize: small ? 13 : 15,
        fontWeight: 800,
        letterSpacing: "-0.3px",
        lineHeight: 1.2,
        color: !has ? "#d1d5db" : critical ? "#dc2626" : "#111827",
      }}>
        {has ? value : "—"}
      </div>
      {has && <div className="text-[8.5px] text-gray-400" style={{ fontWeight: 600 }}>{unit}</div>}
    </div>
  );
}

/* ─── Add / Edit Modal ─── */
function VitalAddModal({ admitId, vref, existing, onClose }: { admitId: number; vref: VitalSignRef; existing?: VitalSign | null; onClose: () => void }) {
  const { addVital, updateVital } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const isEdit = !!existing;
  const nurseName = isEdit ? existing!.recordedBy : (user?.displayName ?? "เจ้าหน้าที่");
  const [temp, setTemp] = useState(existing?.temp ?? "");
  const [pulse, setPulse] = useState(existing?.pulse ?? "");
  const [resp, setResp] = useState(existing?.resp ?? "");
  const [bpSys, setBpSys] = useState(existing?.bpSys ?? "");
  const [bpDia, setBpDia] = useState(existing?.bpDia ?? "");
  const [pain, setPain] = useState<number>(existing?.painScore ?? 0);
  const [note, setNote] = useState(existing?.note ?? "");

  const submit = () => {
    /* Peak-End: success feedback + critical alert if applicable */
    const critical = isCritical({ temp, pulse, resp, painScore: pain }, vref);
    if (isEdit && existing) {
      updateVital(existing.id, { temp, pulse, resp, bpSys, bpDia, painScore: pain, note });
      showSnackbar(critical ? "warning" : "success", critical ? "⚠ แก้ไขแล้ว — ตรวจพบค่าวิกฤต" : "แก้ไข Vital Signs สำเร็จ");
    } else {
      addVital({ admitId, timestamp: new Date().toISOString(), recordedBy: nurseName, temp, pulse, resp, bpSys, bpDia, painScore: pain, note });
      showSnackbar(critical ? "warning" : "success", critical ? "⚠ บันทึกแล้ว — ตรวจพบค่าวิกฤต" : "บันทึก Vital Signs สำเร็จ");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.20 }}
        className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon"><Heart className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>{isEdit ? "แก้ไข Vital Signs" : "บันทึก Vital Signs"}</h3>
            <p className="text-[11px] text-gray-500">โดย {nurseName}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body grid grid-cols-2 gap-3">
          <RangedField label="อุณหภูมิ (°F)" value={temp} min={vref.tempMin} max={vref.tempMax} species={vref.species}>
            <input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} placeholder="101.3" className="vet-input"
              style={outOfRange(temp, vref.tempMin, vref.tempMax) ? { color: "#dc2626", borderColor: "rgba(239,68,68,0.40)" } : undefined} />
          </RangedField>
          <RangedField label="ชีพจร (bpm)" value={pulse} min={vref.pulseMin} max={vref.pulseMax} species={vref.species}>
            <input type="number" value={pulse} onChange={e => setPulse(e.target.value)} placeholder="120" className="vet-input"
              style={outOfRange(pulse, vref.pulseMin, vref.pulseMax) ? { color: "#dc2626", borderColor: "rgba(239,68,68,0.40)" } : undefined} />
          </RangedField>
          <RangedField label="หายใจ (rpm)" value={resp} min={vref.respMin} max={vref.respMax} species={vref.species}>
            <input type="number" value={resp} onChange={e => setResp(e.target.value)} placeholder="24" className="vet-input"
              style={outOfRange(resp, vref.respMin, vref.respMax) ? { color: "#dc2626", borderColor: "rgba(239,68,68,0.40)" } : undefined} />
          </RangedField>
          <Field label="Pain Score (0-10)"><input type="number" min={0} max={10} value={pain} onChange={e => setPain(parseInt(e.target.value) || 0)} className="vet-input" /></Field>
          <Field label="BP Systolic"><input type="number" value={bpSys} onChange={e => setBpSys(e.target.value)} placeholder="120" className="vet-input" /></Field>
          <Field label="BP Diastolic"><input type="number" value={bpDia} onChange={e => setBpDia(e.target.value)} placeholder="80" className="vet-input" /></Field>
          <div className="col-span-2"><Field label="หมายเหตุ"><textarea rows={2} value={note} onChange={e => setNote(e.target.value)} className="vet-textarea" placeholder="สังเกตอาการเพิ่มเติม..." /></Field></div>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

/* ค่าที่กรอกอยู่นอกช่วงอ้างอิงไหม */
function outOfRange(val: string, min: number, max: number) {
  const n = parseFloat(val);
  return !isNaN(n) && (n < min || n > max);
}

/* Field พร้อมช่วงปกติจากตาราง vital_sign + เตือนเมื่อค่าผิดปกติ */
function RangedField({ label, value, min, max, species, children }: {
  label: string; value: string; min: number; max: number; species: string; children: React.ReactNode;
}) {
  const abnormal = outOfRange(value, min, max);
  return (
    <div>
      <label className="vet-label flex items-baseline justify-between gap-1">
        <span>{label}</span>
        <span className="text-[9.5px] text-gray-400 normal-case" style={{ fontWeight: 500 }}>ปกติ {fmtRange(min, max)}</span>
      </label>
      {children}
      {abnormal && (
        <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1" style={{ fontWeight: 600 }}>
          <AlertTriangle className="w-3 h-3" strokeWidth={2.4} /> ผิดปกติ — ช่วงปกติของ{species} {fmtRange(min, max)}
        </p>
      )}
    </div>
  );
}
