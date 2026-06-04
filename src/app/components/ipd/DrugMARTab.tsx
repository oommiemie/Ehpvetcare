import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Pill, Plus, X, Check, AlertTriangle, Lock, Ban, Clock, History, ChevronRight,
} from "lucide-react";
import { useIPD, type DrugOrder, type DrugRoute, type DrugFrequency, type MARRecord } from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

const routes: DrugRoute[] = ["PO", "IV", "IM", "SC", "Topical", "Inhalation", "PR", "Other"];
const frequencies: DrugFrequency[] = ["q24h", "q12h", "q8h", "q6h", "q4h", "PRN", "Continuous", "Once"];

const frequencyHours: Record<DrugFrequency, number> = {
  "q24h": 24, "q12h": 12, "q8h": 8, "q6h": 6, "q4h": 4, "PRN": 0, "Continuous": 0, "Once": 0,
};

/* Common allergens for demo Drug Allergy Check */
const COMMON_ALLERGENS = ["Penicillin", "Amoxicillin", "Sulfa", "Penicillin G", "เพนิซิลิน"];

export function DrugMARTab({ admitId, petAllergies }: { admitId: number; petAllergies?: string }) {
  const { drugs, mar, admits, discontinueDrug, administerMAR } = useIPD();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [tab, setTab] = useState<"orders" | "mar">("orders");
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const administerWithFeedback = (id: number, by: string, note?: string) => {
    administerMAR(id, by, note);
    showSnackbar("success", "ติ๊กให้ยาสำเร็จ");
  };
  const askDiscontinue = async (d: DrugOrder) => {
    const ok = await confirm({
      title: `Discontinue ${d.drugName}?`,
      description: `${d.dose} · ${d.route} ${d.frequency} — จะหยุดให้ยานี้ทันที`,
      confirmLabel: "Discontinue",
      kind: "danger",
    });
    if (ok) {
      discontinueDrug(d.id);
      showSnackbar("info", `Discontinue ${d.drugName} แล้ว`);
    }
  };

  const currentAdmit = admits.find(a => a.id === admitId);
  const patientDrugs = useMemo(() => drugs.filter(d => d.admitId === admitId).sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)), [drugs, admitId]);
  const activeDrugs = patientDrugs.filter(d => d.active);
  const patientMAR = useMemo(() => {
    const drugIds = new Set(patientDrugs.map(d => d.id));
    return mar.filter(m => drugIds.has(m.drugOrderId)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [mar, patientDrugs]);

  const pendingMAR = patientMAR.filter(m => m.status === "Pending").length;
  const lateMAR = patientMAR.filter(m => m.status === "Pending" && new Date(m.scheduledAt).getTime() < Date.now()).length;

  // History grouped by past visit
  const pastGroups = useMemo(() => {
    if (!currentAdmit) return [];
    const sameHNAdmits = admits
      .filter(a => a.hn === currentAdmit.hn && a.id !== admitId)
      .sort((a, b) => `${b.admitDate}T${b.admitTime}`.localeCompare(`${a.admitDate}T${a.admitTime}`));
    return sameHNAdmits
      .map(a => ({
        admit: a,
        items: drugs.filter(d => d.admitId === a.id).sort((x, y) => y.orderedAt.localeCompare(x.orderedAt)),
      }))
      .filter(g => g.items.length > 0);
  }, [drugs, admits, admitId, currentAdmit]);
  const pastCount = pastGroups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="space-y-4">
      {/* Status strip */}
      <div className="grid grid-cols-3 gap-3">
        <StatusCard icon={Pill} label="ยาใช้งาน" value={activeDrugs.length} />
        <StatusCard icon={Clock} label="รอให้ยา" value={pendingMAR} />
        <StatusCard icon={AlertTriangle} label="เลยเวลา" value={lateMAR} alert={lateMAR > 0} />
      </div>

      {/* 2-column: LEFT current visit (orders + MAR sub-tabs), RIGHT history */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
        {/* LEFT — Current visit */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Pill className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>กำลังรักษา · Visit นี้</h3>
              <p className="text-[11px] text-gray-500">{activeDrugs.length} ยาใช้งาน · {patientMAR.length} dose schedule</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="vet-btn vet-btn-primary inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> สั่งยา
            </button>
          </div>

          {/* Sub-tab toggle */}
          <div className="px-4 pt-3">
            <div className="inline-flex items-center gap-0.5 bg-gray-100 rounded-full p-1">
              {(["orders", "mar"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1 rounded-full text-[11.5px] transition-colors"
                  style={{
                    color: tab === t ? "#ffffff" : "#6b7280",
                    fontWeight: tab === t ? 700 : 600,
                    background: tab === t ? "linear-gradient(135deg, #19a589, #0d7c66)" : "transparent",
                  }}
                >
                  {t === "orders" ? `คำสั่งยา / Medication (${patientDrugs.length})` : `คำสั่งรายวัน / Daily (${patientMAR.length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4" style={{ maxHeight: 720, overflowY: "auto" }}>
            {tab === "orders" && (
              patientDrugs.length === 0 ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <Pill className="w-10 h-10 mb-2" strokeWidth={1.5} />
                  <div className="text-[12px] mb-2" style={{ fontWeight: 600 }}>ยังไม่มีการสั่งยา</div>
                  <div className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-white" style={{ background: "var(--vet-teal, #0d7c66)", fontWeight: 700 }}>
                    <Plus className="w-3 h-3" /> สั่งยาแรก
                  </div>
                </button>
              ) : (
                <div className="space-y-2">
                  {patientDrugs.map((d, idx) => (
                    <DrugCard key={d.id} d={d} idx={idx} onDiscontinue={() => askDiscontinue(d)} />
                  ))}
                </div>
              )
            )}

            {tab === "mar" && (
              patientMAR.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Clock className="w-10 h-10 mb-2" strokeWidth={1.5} />
                  <div className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มีตารางให้ยา</div>
                  <div className="text-[10.5px] mt-0.5">ใบสั่งยาจะสร้าง schedule อัตโนมัติเมื่อสั่ง</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[11.5px]">
                    <thead>
                      <tr className="border-b border-gray-100" style={{ background: "#f9fafb" }}>
                        <th className="text-left px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>ยา</th>
                        <th className="text-left px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>เวลา</th>
                        <th className="text-left px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>สถานะ</th>
                        <th className="text-left px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>ให้โดย</th>
                        <th className="text-right px-3 py-2 text-[10px] text-gray-500" style={{ fontWeight: 700, textTransform: "uppercase" }}>การกระทำ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientMAR.map(m => {
                        const drug = patientDrugs.find(d => d.id === m.drugOrderId);
                        if (!drug) return null;
                        return <MARRow key={m.id} m={m} drugName={`${drug.drugName} ${drug.dose}`} onAdminister={administerWithFeedback} />;
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </section>

        {/* RIGHT — History */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <button
            onClick={() => setShowHistory(s => !s)}
            className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100/80 hover:bg-gray-50/50 transition-colors"
            disabled={pastCount === 0}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <History className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ประวัติย้อนหลัง</h3>
              <p className="text-[11px] text-gray-500">
                {pastCount > 0 ? `${pastGroups.length} Visit · ${pastCount} ใบสั่งยา` : "ยังไม่มีประวัติย้อนหลัง"}
              </p>
            </div>
            {pastCount > 0 && (
              <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>{showHistory ? "ซ่อน" : "ดู"}</span>
            )}
          </button>
          <AnimatePresence initial={false}>
            {showHistory && pastCount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: "hidden" }}
              >
                <div className="p-3 space-y-3" style={{ maxHeight: 720, overflowY: "auto" }}>
                  {pastGroups.map(g => (
                    <VisitDrugGroup key={g.admit.id} admit={g.admit} items={g.items} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {pastCount === 0 && (
            <div className="p-3">
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <History className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <div className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มีประวัติยาของสัตว์ตัวนี้</div>
                <div className="text-[10.5px] text-gray-400 mt-1">ประวัติจะปรากฏหลังจาก Visit อื่นมีใบสั่งยา</div>
              </div>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showAdd && <DrugAddModal admitId={admitId} petAllergies={petAllergies} activeDrugs={activeDrugs} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}

function StatusCard({ icon: Ico, label, value, alert }: { icon: typeof Clock; label: string; value: number; alert?: boolean }) {
  const numColor = alert && value > 0 ? "#dc2626" : value > 0 ? "#111827" : "#9ca3af";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100">
          <Ico className="w-3.5 h-3.5 text-gray-600" strokeWidth={2.2} />
        </div>
        <span className="text-[10px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{label}</span>
        {alert && value > 0 && <AlertTriangle className="w-3 h-3 text-rose-500 ml-auto" />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: numColor, letterSpacing: "-0.5px" }}>{value}</div>
    </div>
  );
}

function DrugCard({ d, idx, onDiscontinue }: { d: DrugOrder; idx: number; onDiscontinue: () => void }) {
  return (
    <div className="p-3 rounded-2xl border" style={{ borderColor: d.active ? "#e5e7eb" : "rgba(239,68,68,0.20)", background: d.active ? "rgba(249,250,251,0.5)" : "rgba(239,68,68,0.03)", opacity: d.active ? 1 : 0.7 }}>
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[11px] bg-gray-100 text-gray-600 flex-shrink-0" style={{ fontWeight: 800 }}>
          #{idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>{d.drugName}</span>
            {d.strength && <span className="text-[10.5px] text-gray-500">{d.strength}</span>}
            <span className="text-[10px] text-sky-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.10)", fontWeight: 700 }}>{d.route}</span>
            <span className="text-[10px] text-purple-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.10)", fontWeight: 700 }}>{d.frequency}</span>
            {d.isPRN && <span className="text-[10px] text-amber-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.10)", fontWeight: 700 }}>PRN</span>}
            {d.isContinuous && <span className="text-[10px] text-blue-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.10)", fontWeight: 700 }}>CRI</span>}
            {d.isControlled && (
              <span className="text-[10px] text-rose-700 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5" style={{ background: "rgba(239,68,68,0.10)", fontWeight: 700 }}>
                <Lock className="w-2.5 h-2.5" /> Controlled
              </span>
            )}
            {!d.active && (
              <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)", fontWeight: 700 }}>ยกเลิกแล้ว</span>
            )}
          </div>
          <div className="text-[11.5px] text-gray-600 mt-0.5">
            {d.dose}
            {d.durationDays && ` · ${d.durationDays} วัน`}
          </div>
          <div className="text-[10.5px] text-gray-500 mt-0.5">สั่งโดย {d.orderedBy} · {fmtDateTime(d.orderedAt)}</div>
          {d.note && <div className="text-[11px] text-gray-600 mt-1 italic">{d.note}</div>}
        </div>
        {d.active && (
          <button onClick={onDiscontinue} className="text-[11px] px-2.5 py-1 rounded-full text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
            <Ban className="w-3 h-3" /> Discontinue
          </button>
        )}
      </div>
    </div>
  );
}

function VisitDrugGroup({ admit, items }: { admit: { id: number; admitDate: string; admitTime: string; diagnosis: string; doctor: string }; items: DrugOrder[] }) {
  const [open, setOpen] = useState(true);
  const visitDate = new Date(`${admit.admitDate}T${admit.admitTime}`);
  const yearTH = visitDate.getFullYear() + 543;
  const monthTH = visitDate.toLocaleDateString("th-TH", { month: "short" });
  const day = visitDate.getDate();
  const yearShort = String(yearTH).slice(-2);

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50/60 hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-white border border-gray-100 flex-shrink-0">
          <div className="text-[8px] text-gray-400 leading-none" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{monthTH}</div>
          <div className="text-[15px] text-gray-900 leading-none mt-0.5" style={{ fontWeight: 800 }}>{day}</div>
          <div className="text-[8px] text-gray-400 leading-none mt-0.5" style={{ fontWeight: 600 }}>'{yearShort}</div>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{admit.diagnosis}</span>
            <span className="text-[9.5px] text-gray-600 px-1.5 py-0.5 rounded-full bg-white border border-gray-200 flex-shrink-0" style={{ fontWeight: 700 }}>{items.length} ยา</span>
          </div>
          <div className="text-[10.5px] text-gray-500 truncate mt-0.5">{admit.doctor}</div>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} strokeWidth={2.2} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{ overflow: "hidden" }}
          >
            <ul className="divide-y divide-gray-100">
              {items.map(d => <PastDrugItem key={d.id} d={d} />)}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PastDrugItem({ d }: { d: DrugOrder }) {
  return (
    <li className="px-3 py-2.5">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
        <span className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{d.drugName}</span>
        {d.strength && <span className="text-[10px] text-gray-500 truncate">{d.strength}</span>}
        {d.isControlled && <Lock className="w-3 h-3 text-rose-500 flex-shrink-0" />}
        <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0" style={{ fontWeight: 600 }}>{fmtDate(d.orderedAt)}</span>
      </div>
      <div className="text-[11px] text-gray-600 pl-3.5">
        {d.dose} · <span className="text-sky-700" style={{ fontWeight: 600 }}>{d.route}</span> · <span className="text-purple-700" style={{ fontWeight: 600 }}>{d.frequency}</span>
        {d.durationDays ? ` · ${d.durationDays} วัน` : ""}
      </div>
    </li>
  );
}

function MARRow({ m, drugName, onAdminister }: { m: MARRecord; drugName: string; onAdminister: (id: number, by: string, note?: string) => void }) {
  const { user } = useAuth();
  const isPast = new Date(m.scheduledAt).getTime() < Date.now();
  const isPending = m.status === "Pending";
  const isLate = isPending && isPast;
  return (
    <tr className="border-b border-gray-50 last:border-b-0" style={{ background: isLate ? "rgba(245,158,11,0.04)" : undefined }}>
      <td className="px-3 py-2 text-gray-900" style={{ fontWeight: 600 }}>{drugName}</td>
      <td className="px-3 py-2 text-gray-700">{fmtDateTime(m.scheduledAt)}</td>
      <td className="px-3 py-2">
        <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full" style={{
          background:
            m.status === "Administered" ? "rgba(16,185,129,0.10)" :
            m.status === "Missed"       ? "rgba(239,68,68,0.10)" :
            isLate                       ? "rgba(245,158,11,0.10)" : "rgba(0,0,0,0.05)",
          color:
            m.status === "Administered" ? "#059669" :
            m.status === "Missed"       ? "#dc2626" :
            isLate                       ? "#b45309" : "#6b7280",
          fontWeight: 700,
        }}>
          {m.status === "Administered" ? "✓ ให้แล้ว" : m.status === "Missed" ? "× พลาด" : isLate ? "⚠ เลยเวลา" : "○ รอ"}
        </span>
      </td>
      <td className="px-3 py-2 text-gray-600">{m.administeredBy ?? "—"}</td>
      <td className="px-3 py-2 text-right">
        {isPending && (
          <button
            onClick={() => onAdminister(m.id, user?.displayName ?? "เจ้าหน้าที่")}
            className="text-[11px] px-2.5 py-1 rounded-full text-emerald-700 hover:bg-emerald-50 inline-flex items-center gap-1"
            style={{ background: "rgba(16,185,129,0.08)", fontWeight: 700 }}
          >
            <Check className="w-3 h-3" /> ติ๊กให้ยา
          </button>
        )}
      </td>
    </tr>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

/* ─── Add Drug Modal ─── */

function DrugAddModal({ admitId, petAllergies, activeDrugs, onClose }: { admitId: number; petAllergies?: string; activeDrugs: DrugOrder[]; onClose: () => void }) {
  const { addDrug, addMAR } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const orderedBy = user?.displayName ?? "เจ้าหน้าที่";

  const [drugName, setDrugName] = useState("");
  const [strength, setStrength] = useState("");
  const [dose, setDose] = useState("");
  const [route, setRoute] = useState<DrugRoute>("PO");
  const [frequency, setFrequency] = useState<DrugFrequency>("q12h");
  const [durationDays, setDurationDays] = useState<string>("3");
  const [isPRN, setIsPRN] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [isControlled, setIsControlled] = useState(false);
  const [note, setNote] = useState("");

  /* Safety checks */
  const allergyAlert = useMemo(() => {
    if (!petAllergies || !drugName) return null;
    const allergies = petAllergies.toLowerCase();
    const drug = drugName.toLowerCase();
    if (allergies && drug && (allergies.includes(drug) || drug.includes(allergies))) return petAllergies;
    for (const a of COMMON_ALLERGENS) {
      if (allergies.includes(a.toLowerCase()) && drug.includes(a.toLowerCase())) return a;
    }
    return null;
  }, [petAllergies, drugName]);

  const duplicateAlert = useMemo(() => {
    if (!drugName) return null;
    const dup = activeDrugs.find(d => d.drugName.toLowerCase() === drugName.toLowerCase());
    return dup ? dup.drugName : null;
  }, [drugName, activeDrugs]);

  const submit = async () => {
    if (!drugName || !dose) return;
    if (allergyAlert) {
      const ok = await confirm({
        title: "⚠ ตรวจพบประวัติแพ้ยา",
        description: `สัตว์แพ้ ${allergyAlert} — การสั่งยานี้อาจมีความเสี่ยงต่อชีวิต ยืนยันสั่งต่อ?`,
        confirmLabel: "ยืนยันสั่งยา",
        kind: "danger",
        requireTyping: "ยืนยัน",
      });
      if (!ok) return;
    }
    if (duplicateAlert) {
      const ok = await confirm({
        title: "ยานี้สั่งซ้ำ",
        description: `มี ${duplicateAlert} อยู่แล้วในรายการ active — สั่งซ้ำเพิ่มอีกใบ?`,
        confirmLabel: "สั่งซ้ำ",
        kind: "warning",
      });
      if (!ok) return;
    }

    const days = parseInt(durationDays) || 0;
    const newDrug = addDrug({
      admitId, orderedAt: new Date().toISOString(), orderedBy,
      drugName, strength, dose, route, frequency,
      durationDays: days,
      isPRN, isContinuous, isControlled, note, active: true,
    });

    /* Auto-generate MAR schedule */
    if (!isPRN && !isContinuous && frequency !== "Once") {
      const hours = frequencyHours[frequency];
      if (hours > 0 && days > 0) {
        const start = new Date();
        start.setMinutes(0, 0, 0);
        start.setHours(start.getHours() + 1);
        const totalDoses = Math.floor((days * 24) / hours);
        for (let i = 0; i < totalDoses; i++) {
          const sched = new Date(start.getTime() + i * hours * 60 * 60 * 1000);
          addMAR({ drugOrderId: newDrug.id, scheduledAt: sched.toISOString(), status: "Pending" });
        }
      }
    } else if (frequency === "Once") {
      const t = new Date();
      t.setMinutes(0, 0, 0);
      t.setHours(t.getHours() + 1);
      addMAR({ drugOrderId: newDrug.id, scheduledAt: t.toISOString(), status: "Pending" });
    }

    showSnackbar("success", `สั่งยา ${drugName} สำเร็จ`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}><Pill className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>สั่งยาใหม่</h3>
            <p className="text-[11px] text-gray-500">โดย {orderedBy}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="ชื่อยา *"><input type="text" value={drugName} onChange={e => setDrugName(e.target.value)} className="vet-input" placeholder="เช่น Amoxicillin/Clav" /></Field>

          {/* Safety alerts */}
          {allergyAlert && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-[11.5px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.30)", color: "#b91c1c", fontWeight: 600 }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>⚠ Drug Allergy: สัตว์แพ้ {allergyAlert} — ตรวจสอบก่อนสั่ง</span>
            </div>
          )}
          {duplicateAlert && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-[11.5px]" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.30)", color: "#b45309", fontWeight: 600 }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>⚠ Duplicate: มี {duplicateAlert} อยู่แล้วในรายการ active</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="ความแรง"><input type="text" value={strength} onChange={e => setStrength(e.target.value)} className="vet-input" placeholder="10mg/ml" /></Field>
            <Field label="Dose *"><input type="text" value={dose} onChange={e => setDose(e.target.value)} className="vet-input" placeholder="1mg/kg" /></Field>
            <Field label="Route">
              <select value={route} onChange={e => setRoute(e.target.value as DrugRoute)} className="vet-select">
                {routes.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Frequency">
              <select value={frequency} onChange={e => setFrequency(e.target.value as DrugFrequency)} className="vet-select">
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="ระยะเวลา (วัน)"><input type="number" value={durationDays} onChange={e => setDurationDays(e.target.value)} className="vet-input" min={0} /></Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Toggle label="PRN" checked={isPRN} onChange={setIsPRN} />
            <Toggle label="Continuous Infusion" checked={isContinuous} onChange={setIsContinuous} />
            <Toggle label="Controlled Drug" checked={isControlled} onChange={setIsControlled} color="#ef4444" />
          </div>

          <Field label="หมายเหตุ"><input type="text" value={note} onChange={e => setNote(e.target.value)} className="vet-input" placeholder="คำแนะนำเพิ่มเติม..." /></Field>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!drugName || !dose} className="vet-btn vet-btn-primary inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> สั่งยา</button>
        </div>
      </motion.div>
    </div>
  );
}

function Toggle({ label, checked, onChange, color = "#19a589" }: { label: string; checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <label className="inline-flex items-center gap-1.5 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
      <span
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: checked ? color : "#ffffff", border: `1.5px solid ${checked ? color : "#d1d5db"}` }}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      <span className="text-[11.5px] text-gray-700" style={{ fontWeight: checked ? 700 : 500 }}>{label}</span>
    </label>
  );
}
