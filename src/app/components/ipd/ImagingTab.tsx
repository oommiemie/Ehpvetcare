import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Image as ImageIcon, Plus, X, Check, Clock, FileText, Trash2, Eye, History, ChevronRight, AlertTriangle, Paperclip, FileDigit,
} from "lucide-react";
import { useIPD, type ImagingOrder, type ImagingType, type ImagingStatus } from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

const imagingTypes: { value: ImagingType; label: string }[] = [
  { value: "X-Ray",      label: "X-Ray" },
  { value: "Ultrasound", label: "Ultrasound" },
  { value: "CT",         label: "CT" },
  { value: "MRI",        label: "MRI" },
];

const statusCfg: Record<ImagingStatus, { color: string; bg: string; label: string }> = {
  Ordered:   { color: "#6b7280", bg: "rgba(107,114,128,0.10)", label: "สั่งแล้ว" },
  Imaging:   { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "กำลังถ่าย" },
  Completed: { color: "#10b981", bg: "rgba(16,185,129,0.10)",  label: "เสร็จแล้ว" },
  Cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "ยกเลิก" },
};

export function ImagingTab({ admitId }: { admitId: number }) {
  const { imagings, admits, cancelImaging, updateImaging } = useIPD();
  const confirm = useConfirm();
  const [showAdd, setShowAdd] = useState(false);
  const [editImg, setEditImg] = useState<ImagingOrder | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  const askCancel = async (i: ImagingOrder) => {
    const ok = await confirm({
      title: "ยกเลิกใบสั่ง Imaging?",
      description: `${i.type} ${i.position} จะถูกยกเลิก`,
      confirmLabel: "ยกเลิก",
      kind: "danger",
    });
    if (ok) cancelImaging(i.id);
  };

  const currentAdmit = admits.find(a => a.id === admitId);
  const items = useMemo(() => imagings.filter(i => i.admitId === admitId).sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)), [imagings, admitId]);

  // Cross-admission imaging history, grouped by past visit
  const pastGroups = useMemo(() => {
    if (!currentAdmit) return [];
    const sameHNAdmits = admits
      .filter(a => a.hn === currentAdmit.hn && a.id !== admitId)
      .sort((a, b) => `${b.admitDate}T${b.admitTime}`.localeCompare(`${a.admitDate}T${a.admitTime}`));
    return sameHNAdmits
      .map(a => ({
        admit: a,
        items: imagings
          .filter(i => i.admitId === a.id && i.status === "Completed")
          .sort((x, y) => (y.completedAt || y.orderedAt).localeCompare(x.completedAt || x.orderedAt)),
      }))
      .filter(g => g.items.length > 0);
  }, [imagings, admits, admitId, currentAdmit]);
  const pastCount = pastGroups.reduce((s, g) => s + g.items.length, 0);

  const counts = {
    pending:   items.filter(i => i.status !== "Completed" && i.status !== "Cancelled").length,
    completed: items.filter(i => i.status === "Completed").length,
    imaging:   items.filter(i => i.status === "Imaging").length,
  };

  return (
    <div className="space-y-4">
      {/* Status strip */}
      <div className="grid grid-cols-3 gap-3">
        <StatusCard icon={Clock} label="รอถ่าย" value={counts.pending} />
        <StatusCard icon={ImageIcon} label="กำลังถ่าย" value={counts.imaging} />
        <StatusCard icon={Check} label="เสร็จแล้ว" value={counts.completed} />
      </div>

      {/* 2-column: LEFT current visit, RIGHT history */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
        {/* LEFT — Current visit imaging */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <ImageIcon className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>กำลังรักษา · Visit นี้</h3>
              <p className="text-[11px] text-gray-500">{items.length} รายการ</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> สั่งใหม่
            </button>
          </div>
          <div className="p-3" style={{ maxHeight: 720, overflowY: "auto" }}>
            {items.length === 0 ? (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-500"
              >
                <ImageIcon className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <div className="text-[12px] mb-2" style={{ fontWeight: 600 }}>ยังไม่มีการสั่ง Imaging</div>
                <div className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#e8802a,#d06a1a)", fontWeight: 700 }}>
                  <Plus className="w-3 h-3" /> สั่ง Imaging แรก
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                {items.map(i => (
                  <ImagingCard
                    key={i.id}
                    i={i}
                    onEdit={() => setEditImg(i)}
                    onStatus={(s) => updateImaging(i.id, { status: s })}
                    onCancel={() => askCancel(i)}
                    onAttach={(attachments) => updateImaging(i.id, { attachments })}
                  />
                ))}
              </div>
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
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>ประวัติย้อนหลัง</h3>
              <p className="text-[11px] text-gray-500">
                {pastCount > 0 ? `${pastGroups.length} Visit · ${pastCount} ภาพ` : "ยังไม่มีประวัติย้อนหลัง"}
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
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className="p-3 space-y-3" style={{ maxHeight: 720, overflowY: "auto" }}>
                  {pastGroups.map(g => (
                    <VisitImagingGroup key={g.admit.id} admit={g.admit} items={g.items} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {pastCount === 0 && (
            <div className="p-3">
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <History className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <div className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มี Imaging ย้อนหลังของสัตว์ตัวนี้</div>
                <div className="text-[10.5px] text-gray-400 mt-1">ประวัติจะปรากฏหลังจาก Visit อื่นมีผลภาพ</div>
              </div>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showAdd && <ImgAddModal admitId={admitId} onClose={() => setShowAdd(false)} />}
        {editImg && <ImgFindingsModal img={editImg} onClose={() => setEditImg(null)} />}
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

function ImagingCard({ i, onEdit, onStatus, onCancel, onAttach }: { i: ImagingOrder; onEdit: () => void; onStatus: (s: ImagingStatus) => void; onCancel: () => void; onAttach?: (attachments: NonNullable<ImagingOrder["attachments"]>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [viewImg, setViewImg] = useState<string | null>(null);
  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !onAttach) return;
    const items = files.map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
      kind: (f.name.toLowerCase().endsWith(".dcm") || f.type === "application/dicom" ? "dicom" : "image") as "dicom" | "image",
    }));
    onAttach([...(i.attachments ?? []), ...items].slice(0, 8));   // สูงสุด 8 ไฟล์/รายการ
    e.target.value = "";
  };
  const removeFile = (idx: number) => onAttach?.((i.attachments ?? []).filter((_, x) => x !== idx));
  const sc = statusCfg[i.status];
  return (
    <div className="p-3 rounded-2xl border border-gray-100 hover:bg-gray-50/40 transition-colors">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {i.imageUrl ? (
          <a href={i.imageUrl} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 group relative">
            <img src={i.imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </a>
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>{i.type}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color, fontWeight: 700 }}>{sc.label}</span>
          </div>
          <div className="text-[12px] text-gray-700" style={{ fontWeight: 600 }}>{i.position}</div>
          <div className="text-[10.5px] text-gray-500 mt-0.5">{fmtDateTime(i.orderedAt)} · {i.orderedBy}</div>
          {i.reason && <div className="text-[11px] text-gray-600 mt-1 line-clamp-2">{i.reason}</div>}
        </div>
      </div>

      {i.findings && (
        <div className="text-[11.5px] text-gray-700 mt-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
          <span className="text-gray-500 text-[10px]" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>Findings</span>
          <div className="mt-0.5">{i.findings}</div>
        </div>
      )}

      {/* ไฟล์แนบ DICOM / ภาพฟิล์ม */}
      {onAttach && i.status !== "Cancelled" && (
        <div className="mt-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(i.attachments ?? []).map((a, idx) => (
              <div key={idx} className="relative group/at">
                {a.kind === "image" ? (
                  <button type="button" onClick={() => setViewImg(a.url)} title={a.name}
                    className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 hover:border-[#19a589] transition-colors block">
                    <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <a href={a.url} download={a.name} title={`ดาวน์โหลด ${a.name}`}
                    className="w-12 h-12 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 flex flex-col items-center justify-center transition-colors">
                    <FileDigit className="w-4 h-4 text-indigo-500" />
                    <span className="text-[7.5px] text-indigo-600 mt-0.5 px-0.5 truncate max-w-[44px]" style={{ fontWeight: 700 }}>DICOM</span>
                  </a>
                )}
                <button type="button" onClick={() => removeFile(idx)} title="ลบไฟล์"
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white items-center justify-center hidden group-hover/at:flex">
                  <X className="w-2.5 h-2.5" strokeWidth={3} />
                </button>
              </div>
            ))}
            {(i.attachments?.length ?? 0) < 8 && (
              <button type="button" onClick={() => fileRef.current?.click()} title="แนบไฟล์ DICOM (.dcm) หรือภาพ"
                className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#19a589]/60 hover:text-[#19a589] text-gray-300 flex flex-col items-center justify-center transition-colors">
                <Paperclip className="w-4 h-4" />
                <span className="text-[7.5px] mt-0.5" style={{ fontWeight: 700 }}>DICOM/ภาพ</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".dcm,application/dicom,image/*" multiple className="hidden" onChange={addFiles} />
        </div>
      )}

      {/* ดูภาพขยาย */}
      {viewImg && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setViewImg(null)}>
          <img src={viewImg} alt="ไฟล์แนบ" className="max-w-full max-h-full rounded-2xl" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }} />
        </div>
      )}

      {i.status !== "Cancelled" && i.status !== "Completed" && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          {i.status === "Ordered" && (
            <button onClick={() => onStatus("Imaging")} className="text-[10.5px] px-2 py-1 rounded-full text-amber-700" style={{ background: "rgba(245,158,11,0.10)", fontWeight: 700 }}>→ กำลังถ่าย</button>
          )}
          {i.status === "Imaging" && (
            <button onClick={onEdit} className="text-[10.5px] px-2 py-1 rounded-full text-emerald-700" style={{ background: "rgba(16,185,129,0.10)", fontWeight: 700 }}>
              <Check className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" /> ใส่ผล
            </button>
          )}
          <button onClick={onCancel} className="ml-auto text-[10.5px] px-2 py-1 rounded-full text-rose-600 hover:bg-rose-50" style={{ fontWeight: 600 }}>
            <Trash2 className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" /> ยกเลิก
          </button>
        </div>
      )}
    </div>
  );
}

function VisitImagingGroup({ admit, items }: { admit: { id: number; admitDate: string; admitTime: string; diagnosis: string; doctor: string }; items: ImagingOrder[] }) {
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
            <span className="text-[9.5px] text-gray-600 px-1.5 py-0.5 rounded-full bg-white border border-gray-200 flex-shrink-0" style={{ fontWeight: 700 }}>{items.length} ภาพ</span>
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
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <ul className="divide-y divide-gray-100">
              {items.map(i => <PastImagingItem key={i.id} i={i} />)}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PastImagingItem({ i }: { i: ImagingOrder }) {
  return (
    <li className="px-3 py-2.5">
      <div className="flex gap-2">
        {i.imageUrl ? (
          <a href={i.imageUrl} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 group relative">
            <img src={i.imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </a>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[11.5px] text-gray-800 truncate" style={{ fontWeight: 700 }}>{i.type}</span>
            <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0" style={{ fontWeight: 600 }}>{i.completedAt ? fmtDate(i.completedAt) : ""}</span>
          </div>
          <div className="text-[11px] text-gray-700 leading-snug" style={{ fontWeight: 600 }}>{i.position}</div>
          {i.findings && <div className="text-[11px] text-gray-600 mt-1 leading-snug line-clamp-2">{i.findings}</div>}
        </div>
      </div>
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

function ImgAddModal({ admitId, onClose }: { admitId: number; onClose: () => void }) {
  const { addImaging } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const orderedBy = user?.displayName ?? "เจ้าหน้าที่";
  const [type, setType] = useState<ImagingType>("X-Ray");
  const [position, setPosition] = useState("");
  const [reason, setReason] = useState("");

  const submit = () => {
    if (!position || !reason) return;
    addImaging({ admitId, orderedAt: new Date().toISOString(), orderedBy, type, position, reason, status: "Ordered" });
    showSnackbar("success", `สั่ง ${type} สำเร็จ`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}><ImageIcon className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>สั่ง Imaging ใหม่</h3>
            <p className="text-[11px] text-gray-500">โดย {orderedBy}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="ประเภท *">
            <div className="grid grid-cols-4 gap-1.5">
              {imagingTypes.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)} className={type === t.value ? "vet-chip vet-chip-active" : "vet-chip"} style={{ justifyContent: "center" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="ตำแหน่งตรวจ *"><input type="text" value={position} onChange={e => setPosition(e.target.value)} className="vet-input" placeholder="เช่น ช่องท้อง (lateral + VD), Thorax" /></Field>
          <Field label="เหตุผล *"><textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} className="vet-textarea" placeholder="indication, suspected findings..." /></Field>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!position || !reason} className="vet-btn vet-btn-orange inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> สั่ง</button>
        </div>
      </motion.div>
    </div>
  );
}

function ImgFindingsModal({ img, onClose }: { img: ImagingOrder; onClose: () => void }) {
  const { updateImaging } = useIPD();
  const { showSnackbar } = useSnackbar();
  const [findings, setFindings] = useState(img.findings ?? "");
  const [imageUrl, setImageUrl] = useState(img.imageUrl ?? "");

  const submit = () => {
    if (!findings.trim()) return;
    updateImaging(img.id, { status: "Completed", findings, imageUrl, completedAt: new Date().toISOString() });
    showSnackbar("success", "บันทึกผล Imaging สำเร็จ");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon"><FileText className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>บันทึกผล Imaging</h3>
            <p className="text-[11px] text-gray-500">{img.type} · {img.position}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="Findings *"><textarea rows={6} value={findings} onChange={e => setFindings(e.target.value)} className="vet-textarea" placeholder="ผลการตรวจ + interpretation..." /></Field>
          <Field label="URL รูปภาพ (DICOM/PNG/PDF)"><input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="vet-input" placeholder="https://..." /></Field>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!findings.trim()} className="vet-btn vet-btn-orange inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> บันทึก</button>
        </div>
      </motion.div>
    </div>
  );
}
