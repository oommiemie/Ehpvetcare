import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Image as ImageIcon, Plus, X, Check, Clock, FileText, Trash2, Eye,
} from "lucide-react";
import { useIPD, type ImagingOrder, type ImagingType, type ImagingStatus } from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });

const imagingTypes: { value: ImagingType; label: string; color: string }[] = [
  { value: "X-Ray",      label: "X-Ray",      color: "#0ea5e9" },
  { value: "Ultrasound", label: "Ultrasound", color: "#8b5cf6" },
  { value: "CT",         label: "CT",         color: "#ec4899" },
  { value: "MRI",        label: "MRI",        color: "#f59e0b" },
];

const statusCfg: Record<ImagingStatus, { color: string; bg: string; grad: string; label: string }> = {
  Ordered:   { color: "#6b7280", bg: "rgba(107,114,128,0.10)", grad: "linear-gradient(135deg, #9ca3af, #4b5563)", label: "สั่งแล้ว" },
  Imaging:   { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  grad: "linear-gradient(135deg, #fbbf24, #d97706)", label: "กำลังถ่าย" },
  Completed: { color: "#10b981", bg: "rgba(16,185,129,0.10)",  grad: "linear-gradient(135deg, #34d399, #059669)", label: "เสร็จแล้ว" },
  Cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   grad: "linear-gradient(135deg, #f87171, #dc2626)", label: "ยกเลิก" },
};

export function ImagingTab({ admitId }: { admitId: number }) {
  const { imagings, cancelImaging, updateImaging } = useIPD();
  const confirm = useConfirm();
  const [showAdd, setShowAdd] = useState(false);
  const [editImg, setEditImg] = useState<ImagingOrder | null>(null);

  const askCancel = async (i: ImagingOrder) => {
    const ok = await confirm({
      title: "ยกเลิกใบสั่ง Imaging?",
      description: `${i.type} ${i.position} จะถูกยกเลิก`,
      confirmLabel: "ยกเลิก",
      kind: "danger",
    });
    if (ok) cancelImaging(i.id);
  };

  const items = useMemo(() => imagings.filter(i => i.admitId === admitId).sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)), [imagings, admitId]);

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <ImageIcon className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>X-Ray / Imaging</h3>
            <p className="text-[11px] text-gray-500">{items.length} รายการ</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="vet-btn vet-btn-primary inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> สั่งใหม่
          </button>
        </div>
        <div className="p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <ImageIcon className="w-10 h-10 mb-2" strokeWidth={1.5} />
              <div className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มีการสั่ง Imaging</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map(i => {
                const sc = statusCfg[i.status];
                const tc = imagingTypes.find(t => t.value === i.type)!;
                return (
                  <div key={i.id} className="relative rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/40">
                    {i.imageUrl ? (
                      <div className="aspect-video bg-gray-900 relative overflow-hidden">
                        <img src={i.imageUrl} alt="" className="w-full h-full object-cover" />
                        <button className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] text-white inline-flex items-center gap-1" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", fontWeight: 600 }}>
                          <Eye className="w-3 h-3" /> ดูเต็มจอ
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ background: tc.color, fontWeight: 700 }}>{i.type}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color, fontWeight: 700 }}>{sc.label}</span>
                      </div>
                      <div className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>{i.position}</div>
                      <div className="text-[10.5px] text-gray-500 mt-0.5">{fmtDateTime(i.orderedAt)} · {i.orderedBy}</div>
                      <div className="text-[11px] text-gray-600 mt-1">{i.reason}</div>
                      {i.findings && (
                        <div className="text-[11.5px] text-gray-700 mt-2 p-2 rounded-lg" style={{ background: "rgba(25,165,137,0.05)", border: "1px solid rgba(25,165,137,0.15)" }}>
                          <span className="text-[#0d7c66]" style={{ fontWeight: 700 }}>Findings:</span> {i.findings}
                        </div>
                      )}
                      {/* Actions */}
                      {i.status !== "Cancelled" && i.status !== "Completed" && (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                          {i.status === "Ordered" && (
                            <button onClick={() => updateImaging(i.id, { status: "Imaging" })} className="text-[10.5px] px-2 py-1 rounded-full text-amber-700" style={{ background: "rgba(245,158,11,0.10)", fontWeight: 700 }}>→ กำลังถ่าย</button>
                          )}
                          {i.status === "Imaging" && (
                            <button onClick={() => setEditImg(i)} className="text-[10.5px] px-2 py-1 rounded-full text-emerald-700" style={{ background: "rgba(16,185,129,0.10)", fontWeight: 700 }}>
                              <Check className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" /> ใส่ผล
                            </button>
                          )}
                          <button onClick={() => askCancel(i)} className="ml-auto text-[10.5px] px-2 py-1 rounded-full text-rose-600 hover:bg-rose-50" style={{ fontWeight: 600 }}>
                            <Trash2 className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" /> ยกเลิก
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showAdd && <ImgAddModal admitId={admitId} onClose={() => setShowAdd(false)} />}
        {editImg && <ImgFindingsModal img={editImg} onClose={() => setEditImg(null)} />}
      </AnimatePresence>
    </div>
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
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}><ImageIcon className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>สั่ง Imaging ใหม่</h3>
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
          <button onClick={submit} disabled={!position || !reason} className="vet-btn vet-btn-primary inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> สั่ง</button>
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
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon"><FileText className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>บันทึกผล Imaging</h3>
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
          <button onClick={submit} disabled={!findings.trim()} className="vet-btn vet-btn-primary inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> บันทึก</button>
        </div>
      </motion.div>
    </div>
  );
}
