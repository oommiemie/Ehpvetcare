import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, FileText, ChevronDown, Clock,
  AlertTriangle, DoorOpen, Stethoscope,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: XRayOrderData) => void;
}

export interface XRayOrderData {
  exam: string;
  room: string;
  urgency: string;
  clinicalInfo: string;
  clinicalDiagnosis: string;
  note: string;
}

/* ── X-Ray exam options grouped by region ── */
const xrayExamGroups = [
  {
    category: "ทรวงอก (Thorax)",
    tests: [
      "Chest AP",
      "Chest Lateral",
      "Chest AP + Lateral",
      "Chest VD (Ventrodorsal)",
    ],
  },
  {
    category: "ช่องท้อง (Abdomen)",
    tests: [
      "Abdomen AP",
      "Abdomen Lateral",
      "Abdomen AP + Lateral",
    ],
  },
  {
    category: "กระดูก & ข้อ (Skeletal)",
    tests: [
      "Pelvis VD (Hip dysplasia)",
      "Forelimb (ขาหน้า)",
      "Hindlimb (ขาหลัง)",
      "Spine — Cervical",
      "Spine — Thoracolumbar",
      "Spine — Lumbosacral",
      "Skull AP + Lateral",
    ],
  },
  {
    category: "ทันตกรรม (Dental)",
    tests: [
      "Dental Full Mouth",
      "Dental Focal (ระบุซี่)",
    ],
  },
];

const roomOptions = [
  "ห้อง X-Ray 1",
  "ห้อง X-Ray 2",
  "ห้องผ่าตัด (OR)",
  "ห้องตรวจ 1",
  "ห้องตรวจ 2",
];

const urgencyOptions = [
  { value: "routine", label: "ปกติ (Routine)", color: "bg-emerald-500" },
  { value: "urgent", label: "ด่วน (Urgent)", color: "bg-amber-500" },
  { value: "stat", label: "ด่วนมาก (STAT)", color: "bg-red-500" },
];

export function XRayOrderModal({ open, onClose, onSubmit }: Props) {
  const [selectedExam, setSelectedExam] = useState("");
  const [room, setRoom] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [clinicalInfo, setClinicalInfo] = useState("");
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState("");
  const [note, setNote] = useState("");

  /* dropdown open states */
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [urgencyDropdownOpen, setUrgencyDropdownOpen] = useState(false);

  const canSave = selectedExam.trim() !== "";

  const handleSubmit = () => {
    if (!canSave) return;
    onSubmit?.({
      exam: selectedExam,
      room,
      urgency,
      clinicalInfo,
      clinicalDiagnosis,
      note,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedExam("");
    setRoom("");
    setUrgency("routine");
    setClinicalInfo("");
    setClinicalDiagnosis("");
    setNote("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const inputCls = "vet-input";

  /* Reusable dropdown */
  const Dropdown = ({ isOpen, options, onSelect, renderItem }: {
    isOpen: boolean;
    options: { value: string; label: string }[];
    onSelect: (val: string) => void;
    renderItem?: (opt: { value: string; label: string }) => React.ReactNode;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
          className="absolute z-50 mt-[4px] left-0 right-0 vet-dropdown max-h-[240px] overflow-y-auto py-[4px]"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className="w-full px-[14px] py-[8px] text-left text-[14px] hover:bg-gray-50 transition-colors"
            >
              {renderItem ? renderItem(opt) : opt.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[480px] vet-modal"
              style={{ height: "min(580px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-[24px]">
                <div className="vet-glow-teal pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="vet-modal-header-icon">
                      <FileText className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">สั่ง X-Ray</h2>
                      <p className="vet-tiny mt-[2px]">เลือกรายการเอกซเรย์ที่ต้องการ</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body">
                <AnimatePresence mode="wait">
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-[16px]">
                      {/* Exam selection */}
                      <div>
                        <label className="vet-label">รายการเอกซเรย์ <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => { setExamDropdownOpen(!examDropdownOpen); setRoomDropdownOpen(false); setUrgencyDropdownOpen(false); }}
                            className="vet-select"
                          >
                            <span className={selectedExam ? "text-gray-700" : "text-gray-400"}>
                              {selectedExam || "เลือกรายการเอกซเรย์"}
                            </span>
                            <ChevronDown className={`w-[16px] h-[16px] text-gray-400 transition-transform ${examDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {examDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute z-50 mt-[4px] left-0 right-0 vet-dropdown max-h-[280px] overflow-y-auto py-[4px]"
                              >
                                {xrayExamGroups.map((group) => (
                                  <div key={group.category}>
                                    <div className="px-[14px] py-[6px] text-[11px] text-gray-400" style={{ fontWeight: 600 }}>{group.category}</div>
                                    {group.tests.map((test) => (
                                      <button
                                        key={test}
                                        type="button"
                                        onClick={() => { setSelectedExam(test); setExamDropdownOpen(false); }}
                                        className={`w-full px-[14px] py-[8px] text-left text-[14px] transition-colors ${selectedExam === test ? "bg-vet-teal/10 text-vet-teal" : "hover:bg-gray-50 text-gray-700"}`}
                                        style={selectedExam === test ? { fontWeight: 600 } : {}}
                                      >
                                        {test}
                                        {selectedExam === test && <Check className="w-[14px] h-[14px] inline ml-[8px]" />}
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Room */}
                      <div>
                        <label className="vet-label">ห้องถ่ายภาพ</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => { setRoomDropdownOpen(!roomDropdownOpen); setExamDropdownOpen(false); setUrgencyDropdownOpen(false); }}
                            className="vet-select"
                          >
                            <span className={room ? "text-gray-700" : "text-gray-400"}>
                              {room || "เลือกห้อง"}
                            </span>
                            <ChevronDown className={`w-[16px] h-[16px] text-gray-400 transition-transform ${roomDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {roomDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute z-50 mt-[4px] left-0 right-0 vet-dropdown max-h-[240px] overflow-y-auto py-[4px]"
                              >
                                {roomOptions.map((r) => (
                                  <button
                                    key={r}
                                    type="button"
                                    onClick={() => { setRoom(r); setRoomDropdownOpen(false); }}
                                    className={`w-full px-[14px] py-[8px] text-left text-[14px] transition-colors ${room === r ? "bg-vet-teal/10 text-vet-teal" : "hover:bg-gray-50 text-gray-700"}`}
                                    style={room === r ? { fontWeight: 600 } : {}}
                                  >
                                    <DoorOpen className="w-[14px] h-[14px] inline mr-[6px]" />{r}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Urgency */}
                      <div>
                        <label className="vet-label">ความเร่งด่วน</label>
                        <div className="flex gap-[8px]">
                          {urgencyOptions.map((opt) => {
                            const sel = urgency === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setUrgency(opt.value)}
                                className={`flex-1 flex items-center justify-center gap-[6px] py-[10px] rounded-[12px] border text-[13px] transition-all ${sel ? "border-vet-teal bg-vet-teal/5" : "border-gray-200 hover:border-gray-300"}`}
                                style={{ fontWeight: sel ? 600 : 400 }}
                              >
                                <span className={`w-[8px] h-[8px] rounded-full ${opt.color}`} />
                                {opt.label.split(" ")[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Clinical info */}
                      <div>
                        <label className="vet-label">ข้อมูลทางคลินิก</label>
                        <textarea
                          value={clinicalInfo}
                          onChange={(e) => setClinicalInfo(e.target.value)}
                          placeholder="ประวัติ อาการ ข้อมูลเพิ่มเติม..."
                          rows={2}
                          className="vet-textarea"
                        />
                      </div>

                      {/* Clinical diagnosis */}
                      <div>
                        <label className="vet-label">การวินิจฉัยเบื้องต้น</label>
                        <input
                          value={clinicalDiagnosis}
                          onChange={(e) => setClinicalDiagnosis(e.target.value)}
                          placeholder="เช่น Suspected fracture, Foreign body..."
                          className={inputCls}
                        />
                      </div>

                      {/* Note */}
                      <div>
                        <label className="vet-label">หมายเหตุ</label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="หมายเหตุเพิ่มเติม..."
                          rows={2}
                          className="vet-textarea"
                        />
                      </div>
                    </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
                <div className="vet-modal-footer rounded-b-[24px]">
                  <button onClick={handleClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSave}
                    className="vet-btn vet-btn-primary btn-green"
                    style={{ width: 110 }}
                  >
                    <Check className="w-[16px] h-[16px]" />
                    บันทึก
                  </button>
                </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}