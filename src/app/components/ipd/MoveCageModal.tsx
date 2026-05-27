import { useState } from "react";
import { motion } from "motion/react";
import { Bed, X, Check, ArrowRight, AlertTriangle } from "lucide-react";
import { useIPD, type CageType } from "../../contexts/IPDContext";
import { useSnackbar } from "../../contexts/SnackbarContext";

const cageTypes: CageType[] = ["Small", "Medium", "Large", "ICU", "Isolation", "Oxygen"];

export function MoveCageModal({ admitId, currentCageId, onClose }: { admitId: number; currentCageId: string; onClose: () => void }) {
  const { cages, moveCage } = useIPD();
  const { showSnackbar } = useSnackbar();
  const [targetType, setTargetType] = useState<CageType>("Medium");
  const [targetCageId, setTargetCageId] = useState("");
  const [reason, setReason] = useState("");

  const availableCages = cages.filter(c => c.status === "available" && c.type === targetType && c.id !== currentCageId);

  const submit = () => {
    if (!targetCageId || !reason.trim()) return;
    moveCage(admitId, targetCageId, reason);
    showSnackbar("success", `ย้ายกรงจาก ${currentCageId} → ${targetCageId} สำเร็จ`);
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
          <div className="vet-modal-header-icon"><Bed className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>ย้ายกรงผู้ป่วย</h3>
            <p className="text-[11px] text-gray-500">เลือกกรงใหม่และระบุเหตุผล</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>

        <div className="vet-modal-body space-y-3">
          {/* Current → target preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(25,165,137,0.06), rgba(25,165,137,0.02))", border: "1px solid rgba(25,165,137,0.20)" }}>
            <div className="flex-1 text-center">
              <div className="text-[10px] text-gray-500 mb-1" style={{ fontWeight: 700, textTransform: "uppercase" }}>กรงปัจจุบัน</div>
              <div className="text-[16px] text-gray-900" style={{ fontWeight: 800 }}>{currentCageId}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#0d7c66] flex-shrink-0" />
            <div className="flex-1 text-center">
              <div className="text-[10px] text-gray-500 mb-1" style={{ fontWeight: 700, textTransform: "uppercase" }}>ย้ายไป</div>
              <div className="text-[16px]" style={{ fontWeight: 800, color: targetCageId ? "#0d7c66" : "#d1d5db" }}>{targetCageId || "—"}</div>
            </div>
          </div>

          {/* Cage type */}
          <div>
            <label className="vet-label">ประเภทกรง *</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {cageTypes.map(t => (
                <button key={t} type="button" onClick={() => { setTargetType(t); setTargetCageId(""); }} className={targetType === t ? "vet-chip vet-chip-active" : "vet-chip"} style={{ justifyContent: "center" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Available cages */}
          <div>
            <label className="vet-label">เลือกกรง * <span className="text-gray-400">({availableCages.length} ว่าง)</span></label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {availableCages.length === 0 ? (
                <div className="col-span-full text-center py-4 text-[11px] text-gray-400 inline-flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> ไม่มีกรง {targetType} ว่าง
                </div>
              ) : availableCages.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTargetCageId(c.id)}
                  className={`vet-selectable p-2 text-center ${targetCageId === c.id ? "active" : ""}`}
                >
                  <div className="text-[12px] text-gray-900" style={{ fontWeight: 700 }}>{c.id}</div>
                  <div className="text-[9px] text-gray-500 truncate">{c.ward.replace("Ward ", "")}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="vet-label">เหตุผลการย้ายกรง *</label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="vet-textarea"
              placeholder="เช่น อาการดีขึ้น ย้ายจาก ICU มา ward, ต้องการ Oxygen support..."
            />
          </div>
        </div>

        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!targetCageId || !reason.trim()} className="vet-btn vet-btn-primary inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> ยืนยันการย้ายกรง
          </button>
        </div>
      </motion.div>
    </div>
  );
}
