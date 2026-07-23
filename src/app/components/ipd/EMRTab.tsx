import { useMemo } from "react";
import { useState } from "react";
import {
  FileText, PawPrint, Heart, Stethoscope, BookOpen, Pill, Syringe, ClipboardList,
  History, ChevronRight, FlaskConical,
} from "lucide-react";
import { useIPD, type Admit } from "../../contexts/IPDContext";
import { getVitalRef, fmtRange } from "../vitalSignRef";

/* หัตถการที่บันทึกไว้ใน ProceduresTab (localStorage ต่อ admit) */
interface ProcedureLite {
  id: string; name: string; category: string; bodyArea: string;
  price: number; date: string; startTime: string; endTime: string; vet: string; note?: string;
}
function loadProcedures(admitId: number): ProcedureLite[] {
  try {
    const raw = localStorage.getItem(`vet-ipd-procedures-${admitId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

interface PetLite {
  gender?: string; age?: string; weight?: string; color?: string;
  allergies?: string; chronic?: string;
  vaccines?: { name: string; date: string; nextDue: string; batch: string }[];
  visitHistory?: {
    id: number; date: string; time: string; type: string;
    chiefComplaint: string; diagnosis: string; treatment: string;
    medications: string[]; vet: string;
  }[];
}

const fmtDT = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const TH_M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
/* วันที่ ISO หรือไทย ("2 มี.ค. 2569") → ISO สำหรับเรียงลำดับ */
function toIso(s?: string): string {
  if (!s) return "0000-00-00";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.trim().match(/^(\d{1,2})\s+(\S+)\s*(\d{4})?/);
  if (!m) return "0000-00-00";
  const mi = TH_M.indexOf(m[2]);
  if (mi < 0) return "0000-00-00";
  let y = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
  if (y > 2400) y -= 543;
  return `${y}-${String(mi + 1).padStart(2, "0")}-${String(parseInt(m[1], 10)).padStart(2, "0")}`;
}
const fmtD = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
};

/* รายการเดียวในไทม์ไลน์ประวัติ (IPD admit เก่า หรือ OPD visit) */
interface HistEntry {
  key: string; kind: "IPD" | "OPD"; iso: string;
  title: string; code?: string; subtitle: string; reason?: string;
  drugs?: { id: number; name: string; detail: string }[];
  labs?: { id: number; name: string; detail: string }[];
  opd?: { chiefComplaint: string; treatment: string; meds: string[] };
}

/* ── EMR — สรุปประวัติทุกหมวดของ admit นี้ในหน้าเดียว ── */
export function EMRTab({ admit, pet }: { admit: Admit; pet?: PetLite }) {
  const { vitals, nursingNotes, drugs, labs, admits } = useIPD();
  const vref = getVitalRef(admit.species);

  const myVitals = useMemo(
    () => vitals.filter(v => v.admitId === admit.id).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6),
    [vitals, admit.id]);
  const myNotes = useMemo(
    () => nursingNotes.filter(n => n.admitId === admit.id).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6),
    [nursingNotes, admit.id]);
  const myDrugs = useMemo(
    () => drugs.filter(d => d.admitId === admit.id).sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)),
    [drugs, admit.id]);
  const procedures = useMemo(() => loadProcedures(admit.id), [admit.id]);
  const vaccines = pet?.vaccines ?? [];
  /* ประวัติย้อนหลังรวม IPD + OPD — เรียงตามวันที่ล่าสุด (สไตล์ประวัติ Lab) */
  const historyEntries = useMemo<HistEntry[]>(() => {
    const out: HistEntry[] = [];
    admits.filter(a => a.hn === admit.hn && a.id !== admit.id && a.dischargedAt).forEach(pa => {
      const paDrugs = drugs.filter(d => d.admitId === pa.id);
      const paLabs = labs.filter(l => l.admitId === pa.id);
      out.push({
        key: `ipd-${pa.id}`, kind: "IPD", iso: toIso(pa.admitDate),
        title: pa.diagnosis, code: pa.diagnosisCode, reason: pa.reason,
        subtitle: `Admit ${fmtD(pa.admitDate)} → Discharge ${fmtD(pa.dischargedAt)} · ${pa.doctor}${paDrugs.length || paLabs.length ? ` · ยา ${paDrugs.length} · Lab ${paLabs.length}` : ""}`,
        drugs: paDrugs.map(d => ({ id: d.id, name: `${d.drugName}${d.strength ? ` (${d.strength})` : ""}`, detail: `${d.dose} · ${d.frequency}` })),
        labs: paLabs.map(l => ({ id: l.id, name: l.customName || l.labType, detail: l.result ? l.result.slice(0, 90) + (l.result.length > 90 ? "…" : "") : `(${l.status})` })),
      });
    });
    (pet?.visitHistory ?? []).forEach(v => {
      out.push({
        key: `opd-${v.id}`, kind: "OPD", iso: toIso(v.date),
        title: v.diagnosis || v.type,
        subtitle: `${v.type} · ${v.date} ${v.time} · ${v.vet}`,
        opd: { chiefComplaint: v.chiefComplaint, treatment: v.treatment, meds: v.medications },
      });
    });
    return out.sort((a, b) => b.iso.localeCompare(a.iso));
  }, [admits, drugs, labs, admit.hn, admit.id, pet?.visitHistory]);


  return (
    <div className="space-y-4">
      {/* header strip */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: "color-mix(in srgb, var(--brand) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 18%, transparent)" }}>
        <FileText className="w-4 h-4 text-(--brand-dark) flex-shrink-0" />
        <p className="text-[12.5px] text-(--brand-dark)" style={{ fontWeight: 700 }}>
          EMR — ประวัติเวชระเบียนของ {admit.petName} (admit ครั้งนี้)
        </p>
      </div>

      {/* ซ้าย: ข้อมูล admit ปัจจุบัน · ขวา: ประวัติย้อนหลัง (โครงเดียวกับหน้า Lab) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
      <div className="space-y-3">
        {/* 1. ข้อมูลทั่วไปสัตว์เลี้ยง — ชื่อใหญ่ + chips อ่านปราดเดียวจบ */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-2.5 border-b border-gray-100/80">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "color-mix(in srgb, var(--brand-dark) 8%, transparent)" }}>
              <PawPrint className="w-4 h-4 text-(--brand-dark)" strokeWidth={2.2} />
            </div>
            <h3 className="text-[13px] text-gray-900 flex-1" style={{ fontWeight: 700 }}>ข้อมูลทั่วไปสัตว์เลี้ยง</h3>
            <span className="text-[10.5px] text-gray-400 font-mono">HN {admit.hn}{admit.an ? ` · ${admit.an}` : ""}</span>
          </div>
          <div className="p-4 space-y-3">
            {/* ชื่อ + คุณสมบัติเป็น chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[17px] text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.3px" }}>{admit.petName}</span>
              {[`${admit.species} · ${admit.breed}`,
                pet?.gender ? `เพศ${pet.gender}` : null,
                pet?.age ?? null,
                pet?.weight ?? null,
                pet?.color ?? null,
              ].filter(Boolean).map((c, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100" style={{ fontWeight: 600 }}>{c}</span>
              ))}
            </div>

            {/* แพ้ยา / โรคประจำตัว — เด่นเมื่อมีจริง */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] px-2 py-1 rounded-lg" style={pet?.allergies && pet.allergies !== "ไม่มี"
                ? { background: "rgba(239,68,68,0.08)", color: "#dc2626", fontWeight: 700, border: "1px solid rgba(239,68,68,0.25)" }
                : { background: "#f9fafb", color: "#9ca3af", fontWeight: 600, border: "1px solid #f3f4f6" }}>
                ⚠ แพ้ยา: {pet?.allergies ?? "ไม่มี"}
              </span>
              <span className="text-[11px] px-2 py-1 rounded-lg" style={pet?.chronic && pet.chronic !== "ไม่มี"
                ? { background: "rgba(245,158,11,0.08)", color: "#b45309", fontWeight: 700, border: "1px solid rgba(245,158,11,0.25)" }
                : { background: "#f9fafb", color: "#9ca3af", fontWeight: 600, border: "1px solid #f3f4f6" }}>
                โรคประจำตัว: {pet?.chronic ?? "ไม่มี"}
              </span>
            </div>

            {/* เจ้าของ + Admit — บรรทัดสั้น อ่านไล่ลงมา */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-2.5 border-t border-gray-50 text-[12px]">
              <p className="text-gray-700"><span className="text-gray-400">เจ้าของ&nbsp;&nbsp;</span><span style={{ fontWeight: 600 }}>{admit.owner} · {admit.ownerPhone}</span></p>
              <p className="text-gray-700"><span className="text-gray-400">Admit&nbsp;&nbsp;</span><span style={{ fontWeight: 600 }}>{admit.admitDate} {admit.admitTime} น.</span></p>
              <p className="text-gray-700"><span className="text-gray-400">แพทย์ผู้ดูแล&nbsp;&nbsp;</span><span style={{ fontWeight: 600 }}>{admit.doctor}</span></p>
              <p className="text-gray-700"><span className="text-gray-400">กรง&nbsp;&nbsp;</span><span style={{ fontWeight: 600 }}>{admit.cageId} · {admit.cageType}</span></p>
            </div>
          </div>
        </section>

        {/* 2. วินิจฉัย — ข้อมูลสำคัญ ขึ้นก่อน */}
        <EMRSection icon={BookOpen} title="วินิจฉัย" accent="#7c3aed">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>
              {admit.diagnosis}
              {admit.diagnosisCode && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full align-middle" style={{ background: "rgba(59,130,246,0.10)", color: "#1d4ed8", fontWeight: 700 }}>ICD-10: {admit.diagnosisCode}</span>}
            </p>
            {admit.provisionalDx && <p className="text-[11.5px] text-gray-500 mt-1">วินิจฉัยเบื้องต้น: {admit.provisionalDx}</p>}
            {admit.reason && <p className="text-[11.5px] text-gray-500 mt-0.5">เหตุผล Admit: {admit.reason}</p>}
          </div>
        </EMRSection>

        {/* 3. สัญญาณชีพ */}
        {myVitals.length === 0 ? (
          <SlimSection icon={Heart} title="สัญญาณชีพ" accent="#ec4899" />
        ) : (
          <EMRSection icon={Heart} title="สัญญาณชีพ" accent="#ec4899" count={myVitals.length}
            hint={`ช่วงปกติ${vref.species}: P ${fmtRange(vref.pulseMin, vref.pulseMax)} · R ${fmtRange(vref.respMin, vref.respMax)} · T ${fmtRange(vref.tempMin, vref.tempMax)}`}>
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="text-gray-400 text-[9.5px]" style={{ fontWeight: 700, textTransform: "uppercase" }}>
                  <th className="text-left py-1">เวลา</th><th className="text-center py-1">T</th><th className="text-center py-1">P</th>
                  <th className="text-center py-1">R</th><th className="text-center py-1">BP</th><th className="text-left py-1">ผู้วัด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myVitals.map(v => {
                  const bad = (x?: string, mn?: number, mx?: number) => {
                    const n = parseFloat(x ?? ""); return !isNaN(n) && mn != null && mx != null && (n < mn || n > mx);
                  };
                  return (
                    <tr key={v.id}>
                      <td className="py-1.5 text-gray-600">{fmtDT(v.timestamp)}</td>
                      <td className="py-1.5 text-center" style={{ fontWeight: 700, color: bad(v.temp, vref.tempMin, vref.tempMax) ? "#dc2626" : "#111827" }}>{v.temp || "—"}</td>
                      <td className="py-1.5 text-center" style={{ fontWeight: 700, color: bad(v.pulse, vref.pulseMin, vref.pulseMax) ? "#dc2626" : "#111827" }}>{v.pulse || "—"}</td>
                      <td className="py-1.5 text-center" style={{ fontWeight: 700, color: bad(v.resp, vref.respMin, vref.respMax) ? "#dc2626" : "#111827" }}>{v.resp || "—"}</td>
                      <td className="py-1.5 text-center text-gray-700">{v.bpSys && v.bpDia ? `${v.bpSys}/${v.bpDia}` : "—"}</td>
                      <td className="py-1.5 text-gray-500 truncate">{v.recordedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </EMRSection>
        )}

        {/* 4. สั่งยา */}
        {myDrugs.length === 0 ? (
          <SlimSection icon={Pill} title="สั่งยา" accent="#ea580c" />
        ) : (
          <EMRSection icon={Pill} title="สั่งยา" accent="#ea580c" count={myDrugs.length}>
            <div className="space-y-1.5">
              {myDrugs.map(d => (
                <div key={d.id} className="flex items-start gap-2 p-2 rounded-xl bg-gray-50/70 border border-gray-100" style={{ opacity: d.active ? 1 : 0.55 }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>
                      {d.drugName}{d.strength ? ` (${d.strength})` : ""}
                      {!d.active && <span className="ml-1 text-[9.5px] text-rose-500" style={{ fontWeight: 600 }}>· ยกเลิก</span>}
                    </p>
                    <p className="text-[10.5px] text-gray-500 mt-0.5">
                      {d.dose} · {d.route} · {d.frequency}{d.durationDays ? ` · Day ${d.durationDays}` : ""}
                      {d.qtyRequested != null && ` · เบิก ${d.qtyRequested}/จ่าย ${d.qtyDispensed ?? d.qtyRequested} ${d.qtyUnit ?? ""}`}
                    </p>
                    <p className="text-[10px] text-(--brand-dark) mt-0.5" style={{ fontWeight: 500 }}>สั่ง {fmtDT(d.orderedAt)} · {d.orderedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </EMRSection>
        )}

        {/* 5. ตรวจร่างกาย / บันทึกอาการ */}
        {myNotes.length === 0 ? (
          <SlimSection icon={Stethoscope} title="ตรวจร่างกาย / บันทึกอาการ" accent="#0284c7" />
        ) : (
          <EMRSection icon={Stethoscope} title="ตรวจร่างกาย / บันทึกอาการ" accent="#0284c7" count={myNotes.length}>
            <div className="space-y-2">
              {myNotes.map(n => (
                <div key={n.id} className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <p className="text-[10.5px] text-gray-400" style={{ fontWeight: 600 }}>{fmtDT(n.timestamp)} · {n.recordedBy} · {n.kind}</p>
                  <p className="text-[12px] text-gray-700 mt-1" style={{ lineHeight: 1.5 }}>
                    {n.kind === "SOAP"
                      ? [n.subjective && `S: ${n.subjective}`, n.objective && `O: ${n.objective}`, n.assessment && `A: ${n.assessment}`, n.plan && `P: ${n.plan}`].filter(Boolean).join(" · ")
                      : n.note}
                  </p>
                </div>
              ))}
            </div>
          </EMRSection>
        )}

        {/* 6. หัตถการ */}
        {procedures.length === 0 ? (
          <SlimSection icon={ClipboardList} title="หัตถการ" accent="#0891b2" />
        ) : (
          <EMRSection icon={ClipboardList} title="หัตถการ" accent="#0891b2" count={procedures.length}>
            <div className="space-y-1.5">
              {procedures.map(pr => (
                <div key={pr.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>{pr.name}</p>
                    <p className="text-[10.5px] text-gray-500 mt-0.5">{pr.category} · {pr.bodyArea} · {pr.date} {pr.startTime}–{pr.endTime} · {pr.vet}</p>
                  </div>
                  <span className="text-[12px] text-gray-800 flex-shrink-0" style={{ fontWeight: 700 }}>฿{pr.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </EMRSection>
        )}

        {/* 7. วัคซีน */}
        {vaccines.length === 0 ? (
          <SlimSection icon={Syringe} title="วัคซีน" accent="#059669" />
        ) : (
          <EMRSection icon={Syringe} title="วัคซีน" accent="#059669" count={vaccines.length}>
            <div className="space-y-1.5">
              {vaccines.map((vc, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>{vc.name}</p>
                    <p className="text-[10.5px] text-gray-500 mt-0.5">ฉีดเมื่อ {vc.date} · Lot {vc.batch}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(5,150,105,0.10)", color: "#047857", fontWeight: 700 }}>
                    เข็มถัดไป {vc.nextDue}
                  </span>
                </div>
              ))}
            </div>
          </EMRSection>
        )}
      </div>

      {/* ── ขวา: ประวัติการรักษาย้อนหลัง — รวม IPD + OPD เรียงตามวันที่ (แบบหน้า Lab) ── */}
      <EMRSection icon={History} title="ประวัติการรักษาย้อนหลัง" accent="#b45309"
        count={historyEntries.length} hint="รวม IPD และ OPD เรียงจากล่าสุด">
        {historyEntries.length === 0 ? <Empty /> : (
          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {historyEntries.map(en => <HistoryCard key={en.key} en={en} />)}
          </div>
        )}
      </EMRSection>
      </div>
    </div>
  );
}

/* การ์ดประวัติ 1 ครั้ง (IPD/OPD) — date pill แบบประวัติ Lab + กดกางดูรายละเอียด */
function HistoryCard({ en }: { en: HistEntry }) {
  const [open, setOpen] = useState(false);
  const d = new Date(en.iso + "T00:00:00");
  const ok = !isNaN(d.getTime());
  const kindCfg = en.kind === "IPD"
    ? { bg: "rgba(180,83,9,0.10)", color: "#b45309" }
    : { bg: "rgba(79,70,229,0.10)", color: "#4f46e5" };
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50/60 hover:bg-gray-50 transition-colors text-left">
        {/* Date stack — แบบประวัติ Lab */}
        <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-white border border-gray-100 flex-shrink-0">
          <div className="text-[8px] text-gray-400 leading-none" style={{ fontWeight: 700, letterSpacing: "0.4px" }}>{ok ? TH_M[d.getMonth()] : "—"}</div>
          <div className="text-[15px] text-gray-900 leading-none mt-0.5" style={{ fontWeight: 800 }}>{ok ? d.getDate() : "?"}</div>
          <div className="text-[8px] text-gray-400 leading-none mt-0.5" style={{ fontWeight: 600 }}>'{ok ? String((d.getFullYear() + 543) % 100) : "--"}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: kindCfg.bg, color: kindCfg.color, fontWeight: 800, letterSpacing: "0.3px" }}>{en.kind}</span>
            <span className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{en.title}</span>
            {en.code && <span className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(59,130,246,0.10)", color: "#1d4ed8", fontWeight: 700 }}>{en.code}</span>}
          </div>
          <p className="text-[10.5px] text-gray-500 truncate mt-0.5">{en.subtitle}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="px-3 py-2.5 space-y-2 border-t border-gray-100">
          {en.reason && <p className="text-[11px] text-gray-500">เหตุผล Admit: {en.reason}</p>}
          {en.opd && (
            <>
              <p className="text-[11.5px] text-gray-700">อาการสำคัญ: {en.opd.chiefComplaint || "—"}</p>
              <p className="text-[11.5px] text-gray-700">การรักษา: {en.opd.treatment || "—"}</p>
              {en.opd.meds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {en.opd.meds.map((m, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(234,88,12,0.08)", color: "#c2410c", fontWeight: 600 }}>{m}</span>
                  ))}
                </div>
              )}
            </>
          )}
          {(en.drugs?.length ?? 0) > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 mb-1 inline-flex items-center gap-1" style={{ fontWeight: 700, textTransform: "uppercase" }}><Pill className="w-3 h-3" /> ยาที่ได้รับ</p>
              {en.drugs!.map(dd => (
                <p key={dd.id} className="text-[11.5px] text-gray-700">• {dd.name} — {dd.detail}</p>
              ))}
            </div>
          )}
          {(en.labs?.length ?? 0) > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 mb-1 inline-flex items-center gap-1" style={{ fontWeight: 700, textTransform: "uppercase" }}><FlaskConical className="w-3 h-3" /> ผล Lab</p>
              {en.labs!.map(ll => (
                <p key={ll.id} className="text-[11.5px] text-gray-700">• {ll.name} — {ll.detail}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EMRSection({ icon: Ico, title, accent, count, hint, children }: {
  icon: typeof FileText; title: string; accent: string; count?: number; hint?: string; children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-gray-100/80">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${accent} 7.1%, transparent)` }}>
          <Ico className="w-4 h-4" style={{ color: accent }} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>{title}</h3>
          {hint && <p className="text-[10px] text-gray-400 truncate">{hint}</p>}
        </div>
        {count !== undefined && (
          <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `color-mix(in srgb, ${accent} 7.1%, transparent)`, color: accent, fontWeight: 700 }}>{count} รายการ</span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

/* หมวดที่ยังไม่มีข้อมูล — ยุบเป็นแถวบางไม่กินที่ */
function SlimSection({ icon: Ico, title, accent }: { icon: typeof FileText; title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${accent} 5.1%, transparent)` }}>
        <Ico className="w-3.5 h-3.5" style={{ color: accent, opacity: 0.55 }} strokeWidth={2.2} />
      </div>
      <span className="text-[12.5px] text-gray-500 flex-1" style={{ fontWeight: 600 }}>{title}</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100" style={{ fontWeight: 600 }}>ยังไม่มีข้อมูล</span>
    </div>
  );
}

function Empty() {
  return <p className="text-[11.5px] text-gray-400 text-center py-4">— ยังไม่มีข้อมูล —</p>;
}
