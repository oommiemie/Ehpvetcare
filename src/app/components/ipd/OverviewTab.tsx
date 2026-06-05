import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  Stethoscope, Phone, Bed, AlertTriangle, ClipboardList, Heart, Package,
  Calendar, Clock, Activity, History, ArrowRightLeft,
} from "lucide-react";
import { useIPD, type Admit } from "../../contexts/IPDContext";
import { MoveCageModal } from "./MoveCageModal";
import { formatPhone } from "../../utils/format";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });

export function OverviewTab({ admit }: { admit: Admit }) {
  const { vitals, nursingNotes, io, feedings, labs, imagings, drugs } = useIPD();
  const [showMove, setShowMove] = useState(false);

  const recent = useMemo(() => {
    const events: { time: string; label: string; icon: typeof Activity; color: string }[] = [];
    vitals.filter(v => v.admitId === admit.id).forEach(v => events.push({ time: v.timestamp, label: `Vital Signs: T ${v.temp ?? "-"}, P ${v.pulse ?? "-"}, R ${v.resp ?? "-"}`, icon: Heart, color: "#ec4899" }));
    nursingNotes.filter(n => n.admitId === admit.id).forEach(n => events.push({ time: n.timestamp, label: `${n.kind}: ${n.kind === "SOAP" ? n.assessment ?? n.subjective ?? "—" : n.note ?? "—"}`, icon: ClipboardList, color: "#19a589" }));
    io.filter(e => e.admitId === admit.id).forEach(e => events.push({ time: e.timestamp, label: `I/O: ↓${e.intakeType} ${e.intakeAmount}ml · ↑${e.outputType} ${e.outputAmount}`, icon: Activity, color: "#0ea5e9" }));
    feedings.filter(f => f.admitId === admit.id).forEach(f => events.push({ time: f.timestamp, label: `อาหาร: ${f.food} ${f.amount} (${f.intakePct ?? "—"}%)`, icon: Activity, color: "#f59e0b" }));
    labs.filter(l => l.admitId === admit.id).forEach(l => events.push({ time: l.orderedAt, label: `Lab สั่ง: ${l.customName ?? l.labType} (${l.status})`, icon: Activity, color: "#a855f7" }));
    imagings.filter(i => i.admitId === admit.id).forEach(i => events.push({ time: i.orderedAt, label: `Imaging: ${i.type} ${i.position}`, icon: Activity, color: "#8b5cf6" }));
    drugs.filter(d => d.admitId === admit.id).forEach(d => events.push({ time: d.orderedAt, label: `ยา: ${d.drugName} ${d.dose} ${d.route} ${d.frequency}`, icon: Activity, color: "#0ea5e9" }));
    return events.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10);
  }, [admit.id, vitals, nursingNotes, io, feedings, labs, imagings, drugs]);

  const daysSinceAdmit = (() => {
    // Inclusive count: matches Daily view D1..Dn (D1 = admit day, Dn = today)
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const start = startOfDay(new Date(`${admit.admitDate}T00:00:00`));
    const today = startOfDay(new Date());
    const diff = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
    const dayNo = diff + 1;
    return `${dayNo} วัน`;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 items-start">
      {/* LEFT */}
      <div className="space-y-4">
        {/* Diagnosis + Treatment Plan */}
        <section className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Stethoscope className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ข้อมูลทางการแพทย์</h3>
              <p className="text-[11px] text-gray-500">การวินิจฉัยและแผนการรักษา</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <Row label="การวินิจฉัย">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] text-gray-900" style={{ fontWeight: 600 }}>{admit.diagnosis}</span>
                {admit.diagnosisCode && (
                  <span className="text-[10px] text-blue-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.10)", fontWeight: 700 }}>ICD-10: {admit.diagnosisCode}</span>
                )}
              </div>
            </Row>
            <Row label="เหตุผล Admit">
              <span className="text-[12.5px] text-gray-700">{admit.reason || "—"}</span>
            </Row>
            {admit.treatmentPlan && (
              <Row label="Treatment Plan">
                <span className="text-[12.5px] text-gray-700">{admit.treatmentPlan}</span>
              </Row>
            )}
            <Row label="แพทย์ผู้ดูแล">
              <span className="text-[13px] text-[#0d7c66]" style={{ fontWeight: 600 }}>{admit.doctor}</span>
            </Row>
          </div>
        </section>

        {/* Cage history */}
        <section className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Bed className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ประวัติกรง</h3>
              <p className="text-[11px] text-gray-500">{admit.cageId} · {admit.cageType}{admit.cageHistory && admit.cageHistory.length > 0 ? ` · ย้าย ${admit.cageHistory.length} ครั้ง` : ""}</p>
            </div>
            <button onClick={() => setShowMove(true)} className="vet-btn vet-btn-brand-soft inline-flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5" /> ย้ายกรง
            </button>
          </div>
          <div className="p-4">
            {admit.cageHistory && admit.cageHistory.length > 0 ? (
              <div className="space-y-1.5">
                {admit.cageHistory.slice().reverse().map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 bg-gray-50/40">
                    <History className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 600 }}>
                        {h.fromCage} → {h.toCage}
                      </div>
                      <div className="text-[10.5px] text-gray-500 truncate">{h.reason} · {fmtDateTime(h.movedAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11.5px] text-gray-400 text-center py-2">ยังไม่มีประวัติย้ายกรง</div>
            )}
          </div>
        </section>

        {/* Recent activity timeline */}
        <section className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Activity className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>กิจกรรมล่าสุด</h3>
              <p className="text-[11px] text-gray-500">{recent.length} เหตุการณ์ล่าสุด</p>
            </div>
          </div>
          <div className="p-4">
            {recent.length === 0 ? (
              <div className="text-[11.5px] text-gray-400 text-center py-4">ยังไม่มีกิจกรรม</div>
            ) : (
              <div className="space-y-1.5">
                {recent.map((e, i) => {
                  const Ico = e.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: e.color, boxShadow: `0 2px 6px ${e.color}40` }}>
                        <Ico className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-gray-800 truncate">{e.label}</div>
                        <div className="text-[10px] text-gray-400">{fmtDateTime(e.time)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* RIGHT */}
      <div className="space-y-4">
        {/* Owner contact */}
        <section className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Phone className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>เจ้าของสัตว์</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>{admit.owner}</div>
            <a href={`tel:${admit.ownerPhone}`} className="text-[12px] text-[#0d7c66] mt-0.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
              <Phone className="w-3 h-3" /> {formatPhone(admit.ownerPhone)}
            </a>
          </div>
        </section>

        {/* Admit info */}
        <section className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Calendar className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ข้อมูล Admit</h3>
            </div>
          </div>
          <div className="p-4 space-y-2 text-[12.5px]">
            <InfoRow icon={Calendar} label="วันที่ Admit" value={`${admit.admitDate} · ${admit.admitTime}`} />
            <InfoRow icon={Clock} label="ระยะเวลา" value={daysSinceAdmit} />
            <InfoRow icon={Bed} label="กรง" value={`${admit.cageId} (${admit.cageType})`} />
            {admit.consentSigned ? (
              <InfoRow icon={ClipboardList} label="Consent" value="ลงนามแล้ว" color="#10b981" />
            ) : (
              <InfoRow icon={AlertTriangle} label="Consent" value="ยังไม่ได้ลงนาม" color="#ef4444" />
            )}
          </div>
        </section>

        {/* Belongings */}
        {admit.belongings && admit.belongings.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
            <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                <Package className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>สิ่งของส่วนตัว</h3>
                <p className="text-[11px] text-gray-500">{admit.belongings.length} รายการ</p>
              </div>
            </div>
            <div className="p-3 flex flex-wrap gap-1.5">
              {admit.belongings.map(b => (
                <span key={b} className="text-[11px] text-gray-700 px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.04)", fontWeight: 600 }}>{b}</span>
              ))}
            </div>
          </section>
        )}

        {/* Balance */}
        <section className="relative rounded-2xl p-3 overflow-hidden" style={{
          background: admit.totalCharge - admit.paid > 0
            ? "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(254,251,248,0.6))"
            : "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(254,251,248,0.6))",
          border: admit.totalCharge - admit.paid > 0 ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(16,185,129,0.25)",
        }}>
          <div className="text-[10px] mb-1" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: admit.totalCharge - admit.paid > 0 ? "#b45309" : "#047857" }}>
            {admit.totalCharge - admit.paid > 0 ? "ยอดค้างชำระ" : "ชำระครบ"}
          </div>
          <div className="text-gray-900 text-[22px]" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
            ฿{Math.max(0, admit.totalCharge - admit.paid).toLocaleString()}
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-black/5 flex items-center justify-between text-[10px] text-gray-500">
            <span>รวม ฿{admit.totalCharge.toLocaleString()}</span>
            <span>จ่าย ฿{admit.paid.toLocaleString()}</span>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showMove && <MoveCageModal admitId={admit.id} currentCageId={admit.cageId} onClose={() => setShowMove(false)} />}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 mb-0.5" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

function InfoRow({ icon: Ico, label, value, color }: { icon: typeof Calendar; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Ico className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <span className="text-gray-500 flex-1" style={{ fontWeight: 500 }}>{label}</span>
      <span className="text-gray-900" style={{ fontWeight: 700, color: color ?? "#111827" }}>{value}</span>
    </div>
  );
}
