import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FlaskConical, Plus, X, Check, Clock, AlertTriangle, Barcode, FileText, Trash2, Zap, History, ChevronRight, Camera,
} from "lucide-react";
import { useIPD, type LabOrder, type LabPriority, type LabStatus, type LabType } from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

const labTypes: LabType[] = ["CBC", "Blood Chemistry", "Electrolyte", "Urinalysis", "Cytology", "Culture", "Other"];

const statusCfg: Record<LabStatus, { color: string; bg: string; label: string }> = {
  Ordered:    { color: "#6b7280", bg: "rgba(107,114,128,0.10)", label: "สั่งแล้ว" },
  Collected:  { color: "#0ea5e9", bg: "rgba(14,165,233,0.10)",  label: "เก็บแล้ว" },
  Processing: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "กำลังตรวจ" },
  Completed:  { color: "#10b981", bg: "rgba(16,185,129,0.10)",  label: "เสร็จแล้ว" },
  Cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "ยกเลิก" },
};

export function LabTab({ admitId }: { admitId: number }) {
  const { labs, admits, cancelLab, updateLab } = useIPD();
  const confirm = useConfirm();
  const [showAdd, setShowAdd] = useState(false);
  const [editLab, setEditLab] = useState<LabOrder | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  const askCancel = async (l: LabOrder) => {
    const ok = await confirm({
      title: "ยกเลิกใบสั่ง Lab?",
      description: `ใบสั่ง ${l.customName || l.labType} จะถูกยกเลิก ไม่สามารถกู้คืนได้`,
      confirmLabel: "ยกเลิกใบสั่ง",
      kind: "danger",
    });
    if (ok) cancelLab(l.id);
  };

  const currentAdmit = admits.find(a => a.id === admitId);
  const items = useMemo(() => labs.filter(l => l.admitId === admitId).sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)), [labs, admitId]);

  // Cross-admission lab history grouped by admission (most recent first)
  const pastGroups = useMemo(() => {
    if (!currentAdmit) return [];
    const sameHNAdmits = admits
      .filter(a => a.hn === currentAdmit.hn && a.id !== admitId)
      .sort((a, b) => `${b.admitDate}T${b.admitTime}`.localeCompare(`${a.admitDate}T${a.admitTime}`));
    return sameHNAdmits
      .map(a => ({
        admit: a,
        labs: labs
          .filter(l => l.admitId === a.id && l.status === "Completed")
          .sort((x, y) => (y.completedAt || y.orderedAt).localeCompare(x.completedAt || x.orderedAt)),
      }))
      .filter(g => g.labs.length > 0);
  }, [labs, admits, admitId, currentAdmit]);
  const pastLabsCount = pastGroups.reduce((s, g) => s + g.labs.length, 0);

  const counts = {
    pending:   items.filter(l => l.status !== "Completed" && l.status !== "Cancelled").length,
    completed: items.filter(l => l.status === "Completed").length,
    stat:      items.filter(l => l.priority === "STAT" && l.status !== "Completed" && l.status !== "Cancelled").length,
  };

  return (
    <div className="space-y-4">
      {/* Quiet status strip — gray icons consistent with other tabs */}
      <div className="grid grid-cols-3 gap-3">
        <StatusCard icon={Clock} label="รอผล" value={counts.pending} />
        <StatusCard icon={Check} label="เสร็จแล้ว" value={counts.completed} />
        <StatusCard icon={Zap} label="STAT รอ" value={counts.stat} alert={counts.stat > 0} />
      </div>

      {/* 2-column: LEFT current visit (wide), RIGHT history (sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
        {/* LEFT — Current admission labs */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <FlaskConical className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>กำลังรักษา · Visit นี้</h3>
              <p className="text-[11px] text-gray-500">{items.length} รายการ</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> สั่ง Lab
            </button>
          </div>
          <div className="p-3" style={{ maxHeight: 600, overflowY: "auto" }}>
            {items.length === 0 ? (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-500"
              >
                <FlaskConical className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <div className="text-[12px] mb-2" style={{ fontWeight: 600 }}>ยังไม่มีการสั่ง Lab</div>
                <div className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#e8802a,#d06a1a)", fontWeight: 700 }}>
                  <Plus className="w-3 h-3" /> สั่ง Lab แรก
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                {items.map(l => (
                  <LabRow key={l.id} l={l} onEditResult={() => setEditLab(l)} onStatus={(s) => updateLab(l.id, { status: s })} onCancel={() => askCancel(l)} onPhotos={(photos) => updateLab(l.id, { photos })} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT — History grouped by past admission */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <button
            onClick={() => setShowHistory(s => !s)}
            className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100/80 hover:bg-gray-50/50 transition-colors"
            disabled={pastLabsCount === 0}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <History className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>ประวัติย้อนหลัง</h3>
              <p className="text-[11px] text-gray-500">
                {pastLabsCount > 0 ? `${pastGroups.length} Visit · ${pastLabsCount} ผล` : "ยังไม่มีประวัติย้อนหลัง"}
              </p>
            </div>
            {pastLabsCount > 0 && (
              <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>{showHistory ? "ซ่อน" : "ดู"}</span>
            )}
          </button>
          <AnimatePresence initial={false}>
            {showHistory && pastLabsCount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className="p-3 space-y-3" style={{ maxHeight: 600, overflowY: "auto" }}>
                  {pastGroups.map(g => (
                    <VisitHistoryGroup key={g.admit.id} admit={g.admit} labs={g.labs} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {pastLabsCount === 0 && (
            <div className="p-3">
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <History className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <div className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มี Lab ย้อนหลังของสัตว์ตัวนี้</div>
                <div className="text-[10.5px] text-gray-400 mt-1">ประวัติจะปรากฏหลังจาก Visit อื่นมีผล Lab</div>
              </div>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showAdd && <LabAddModal admitId={admitId} onClose={() => setShowAdd(false)} />}
        {editLab && <LabResultModal lab={editLab} onClose={() => setEditLab(null)} />}
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
      <div style={{ fontSize: "calc(22px * var(--fs))", fontWeight: 800, color: numColor, letterSpacing: "-0.5px" }}>{value}</div>
    </div>
  );
}

function LabRow({ l, onEditResult, onStatus, onCancel, onPhotos }: { l: LabOrder; onEditResult: () => void; onStatus: (s: LabStatus) => void; onCancel: () => void; onPhotos?: (photos: string[]) => void }) {
  const sc = statusCfg[l.status];
  const fileRef = useRef<HTMLInputElement>(null);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const addPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !onPhotos) return;
    const urls = files.map(f => URL.createObjectURL(f));
    onPhotos([...(l.photos ?? []), ...urls].slice(0, 6));   // สูงสุด 6 ภาพ/รายการ
    e.target.value = "";
  };
  const removePhoto = (idx: number) => onPhotos?.((l.photos ?? []).filter((_, i) => i !== idx));
  return (
    <div className="p-3 rounded-2xl border border-gray-100 hover:bg-gray-50/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
          {l.status === "Completed" ? <Check className="w-4.5 h-4.5 text-gray-600" /> : <Clock className="w-4.5 h-4.5 text-gray-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>{l.customName || l.labType}</span>
            {l.priority === "STAT" && (
              <span className="inline-flex items-center gap-0.5 text-[9.5px] text-white px-1.5 py-0.5 rounded-full" style={{ background: "linear-gradient(135deg, #f87171, #dc2626)", fontWeight: 800, letterSpacing: "0.3px" }}>
                <Zap className="w-2.5 h-2.5" /> STAT
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color, fontWeight: 700 }}>{sc.label}</span>
            <span className="text-[10px] text-gray-400 ml-auto inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
              <Barcode className="w-3 h-3" /> LAB-{l.id.toString().slice(-6)}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            สั่งเมื่อ {fmtDateTime(l.orderedAt)} · โดย {l.orderedBy}
          </div>
          {l.reason && <div className="text-[11px] text-gray-600 mt-1">เหตุผล: {l.reason}</div>}
          {l.result && (
            <div className="text-[12px] text-gray-700 mt-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-gray-500 text-[10px]" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>ผลตรวจ</span>
              <div className="mt-0.5">{l.result}</div>
            </div>
          )}

          {/* ภาพถ่ายแนบ (สไลด์/ใบผล/ตัวอย่าง) */}
          {(l.photos?.length || onPhotos) && l.status !== "Cancelled" && (
            <div className="mt-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(l.photos ?? []).map((ph, i) => (
                  <div key={i} className="relative group/ph">
                    <button type="button" onClick={() => setViewPhoto(ph)}
                      className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 hover:border-(--brand) transition-colors block">
                      <img src={ph} alt={`แนบ ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                    {onPhotos && (
                      <button type="button" onClick={() => removePhoto(i)} title="ลบภาพ"
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white items-center justify-center hidden group-hover/ph:flex">
                        <X className="w-2.5 h-2.5" strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))}
                {onPhotos && (l.photos?.length ?? 0) < 6 && (
                  <button type="button" onClick={() => fileRef.current?.click()} title="แนบภาพถ่าย"
                    className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 hover:border-(--brand)/60 hover:text-(--brand) text-gray-300 flex flex-col items-center justify-center transition-colors">
                    <Camera className="w-4 h-4" />
                    <span className="text-[8px] mt-0.5" style={{ fontWeight: 700 }}>แนบภาพ</span>
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
            </div>
          )}

          {/* ดูภาพขยาย */}
          {viewPhoto && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setViewPhoto(null)}>
              <img src={viewPhoto} alt="ภาพแนบ" className="max-w-full max-h-full rounded-2xl" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }} />
              <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {l.status !== "Cancelled" && l.status !== "Completed" && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
          {l.status === "Ordered" && (
            <button onClick={() => onStatus("Collected")} className="text-[11px] px-2.5 py-1 rounded-full text-sky-700" style={{ background: "rgba(14,165,233,0.10)", fontWeight: 700 }}>
              → เก็บแล้ว
            </button>
          )}
          {l.status === "Collected" && (
            <button onClick={() => onStatus("Processing")} className="text-[11px] px-2.5 py-1 rounded-full text-amber-700" style={{ background: "rgba(245,158,11,0.10)", fontWeight: 700 }}>
              → กำลังตรวจ
            </button>
          )}
          {l.status === "Processing" && (
            <button onClick={onEditResult} className="text-[11px] px-2.5 py-1 rounded-full text-emerald-700" style={{ background: "rgba(16,185,129,0.10)", fontWeight: 700 }}>
              <Check className="w-3 h-3 inline -mt-0.5 mr-0.5" /> ใส่ผล
            </button>
          )}
          <button onClick={onCancel} className="ml-auto text-[11px] px-2.5 py-1 rounded-full text-rose-600 hover:bg-rose-50" style={{ fontWeight: 600 }}>
            <Trash2 className="w-3 h-3 inline -mt-0.5 mr-0.5" /> ยกเลิก
          </button>
        </div>
      )}
    </div>
  );
}

function VisitHistoryGroup({ admit, labs }: { admit: { id: number; admitDate: string; admitTime: string; diagnosis: string; doctor: string }; labs: LabOrder[] }) {
  const [open, setOpen] = useState(true);
  const visitDate = new Date(`${admit.admitDate}T${admit.admitTime}`);
  const yearTH = visitDate.getFullYear() + 543;
  const monthTH = visitDate.toLocaleDateString("th-TH", { month: "short" });
  const day = visitDate.getDate();
  const yearShort = String(yearTH).slice(-2);

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      {/* Visit header — date pill + diagnosis */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50/60 hover:bg-gray-50 transition-colors"
      >
        {/* Date stack */}
        <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-white border border-gray-100 flex-shrink-0">
          <div className="text-[8px] text-gray-400 leading-none" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{monthTH}</div>
          <div className="text-[15px] text-gray-900 leading-none mt-0.5" style={{ fontWeight: 800 }}>{day}</div>
          <div className="text-[8px] text-gray-400 leading-none mt-0.5" style={{ fontWeight: 600 }}>'{yearShort}</div>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{admit.diagnosis}</span>
            <span className="text-[9.5px] text-gray-600 px-1.5 py-0.5 rounded-full bg-white border border-gray-200 flex-shrink-0" style={{ fontWeight: 700 }}>{labs.length} ผล</span>
          </div>
          <div className="text-[10.5px] text-gray-500 truncate mt-0.5">{admit.doctor}</div>
        </div>

        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} strokeWidth={2.2} />
      </button>

      {/* Labs under this visit */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <ul className="divide-y divide-gray-100">
              {labs.map(l => (
                <PastLabItem key={l.id} l={l} />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PastLabItem({ l }: { l: LabOrder }) {
  return (
    <li className="px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        <span className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{l.customName || l.labType}</span>
        {l.priority === "STAT" && (
          <span className="text-[9px] text-rose-700 px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(244,63,94,0.10)", fontWeight: 800, letterSpacing: "0.3px" }}>STAT</span>
        )}
        <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0" style={{ fontWeight: 600 }}>{l.completedAt ? fmtDate(l.completedAt) : ""}</span>
      </div>
      {l.result && (
        <div className="text-[11.5px] text-gray-700 pl-3.5 leading-snug">{l.result}</div>
      )}
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

/* ─── Modals ─── */

function LabAddModal({ admitId, onClose }: { admitId: number; onClose: () => void }) {
  const { addLab } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const orderedBy = user?.displayName ?? "เจ้าหน้าที่";
  const [labType, setLabType] = useState<LabType>("CBC");
  const [customName, setCustomName] = useState("");
  const [priority, setPriority] = useState<LabPriority>("Routine");
  const [reason, setReason] = useState("");

  const submit = () => {
    addLab({ admitId, orderedAt: new Date().toISOString(), orderedBy, labType, customName: labType === "Other" ? customName : undefined, priority, status: "Ordered", reason });
    showSnackbar("success", `สั่ง Lab สำเร็จ${priority === "STAT" ? " (STAT)" : ""}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #a855f7, #7e22ce)" }}><FlaskConical className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>สั่ง Lab ใหม่</h3>
            <p className="text-[11px] text-gray-500">โดย {orderedBy}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="ชุดตรวจ *">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {labTypes.map(t => (
                <button key={t} type="button" onClick={() => setLabType(t)} className={labType === t ? "vet-chip vet-chip-active" : "vet-chip"} style={{ justifyContent: "center" }}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          {labType === "Other" && (
            <Field label="ระบุชื่อชุดตรวจ"><input type="text" value={customName} onChange={e => setCustomName(e.target.value)} className="vet-input" placeholder="เช่น T4, PCR..." /></Field>
          )}
          <Field label="Priority">
            <div className="grid grid-cols-2 gap-1.5">
              <button type="button" onClick={() => setPriority("Routine")} className={priority === "Routine" ? "vet-btn vet-btn-orange" : "vet-btn vet-btn-secondary"} style={{ width: "100%" }}>Routine</button>
              <button type="button" onClick={() => setPriority("STAT")} className={priority === "STAT" ? "vet-btn vet-btn-danger" : "vet-btn vet-btn-secondary"} style={{ width: "100%" }}>
                <Zap className="w-3.5 h-3.5" /> STAT
              </button>
            </div>
          </Field>
          <Field label="เหตุผล / Indication"><textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} className="vet-textarea" placeholder="เช่น สงสัยติดเชื้อ, ติดตามค่าตับ..." /></Field>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} className="vet-btn vet-btn-orange inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> สั่ง Lab</button>
        </div>
      </motion.div>
    </div>
  );
}

function LabResultModal({ lab, onClose }: { lab: LabOrder; onClose: () => void }) {
  const { updateLab } = useIPD();
  const { showSnackbar } = useSnackbar();
  const [result, setResult] = useState(lab.result ?? "");
  const [isCritical, setIsCritical] = useState(false);

  const submit = () => {
    if (!result.trim()) return;
    updateLab(lab.id, { status: "Completed", result, completedAt: new Date().toISOString() });
    showSnackbar(isCritical ? "warning" : "success", isCritical ? "⚠ บันทึกผล Lab — ค่า Critical แจ้งแพทย์ทันที" : "บันทึกผล Lab สำเร็จ");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon"><FileText className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>บันทึกผล Lab</h3>
            <p className="text-[11px] text-gray-500">{lab.customName || lab.labType}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="ผลตรวจ *"><textarea rows={6} value={result} onChange={e => setResult(e.target.value)} className="vet-textarea" placeholder="ค่าผลตรวจ + interpretation..." /></Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isCritical} onChange={e => setIsCritical(e.target.checked)} className="w-4 h-4" />
            <span className="text-[12px] text-rose-700 inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
              <AlertTriangle className="w-3.5 h-3.5" /> Critical Value (จะแจ้งเตือนแพทย์)
            </span>
          </label>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!result.trim()} className="vet-btn vet-btn-orange inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> บันทึกผล</button>
        </div>
      </motion.div>
    </div>
  );
}
