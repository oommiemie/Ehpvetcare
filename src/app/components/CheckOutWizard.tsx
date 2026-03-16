import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, ChevronLeft, ChevronRight, Camera, Package,
  Stethoscope, ClipboardCheck, Shield, AlertTriangle, Plus, Trash2,
  QrCode, User, PawPrint,
} from "lucide-react";

interface BookingData {
  id: number;
  petName: string;
  species: string;
  breed: string;
  ownerName: string;
  ownerPhone: string;
  photo: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  roomNumber: string;
  deposit?: number;
  weight?: string;
  temperature?: string;
  healthStatus?: "ปกติ" | "เครียด" | "ป่วย";
}

export interface CheckOutFormData {
  petIdVerified: boolean;
  finalWeight: string;
  finalTemperature: string;
  finalHealthStatus: "ปกติ" | "เครียด" | "ป่วย";
  finalHealthNotes: string;
  equipmentReturned: { name: string; returned: boolean; condition: string }[];
  photos: string[];
  depositRefund: number;
  depositDeduction: number;
  deductionReason: string;
  handoverNote: string;
}

const CHECKOUT_STEPS = [
  { label: "ยืนยันตัวตน", icon: QrCode },
  { label: "ตรวจสุขภาพ", icon: Stethoscope },
  { label: "อุปกรณ์คืน", icon: Package },
  { label: "สรุปและคืนมัดจำ", icon: Shield },
];

const mockEquipment = [
  { name: "สายจูง", returned: true, condition: "สมบูรณ์" },
  { name: "ชามอาหาร", returned: true, condition: "สมบูรณ์" },
  { name: "ผ้าห่ม/ที่นอน", returned: true, condition: "สมบูรณ์" },
];

export function CheckOutWizardModal({ open, booking, onClose, onComplete }: {
  open: boolean;
  booking: BookingData;
  onClose: () => void;
  onComplete: (data: CheckOutFormData) => void;
}) {
  const [step, setStep] = useState(0);
  const deposit = booking.deposit || 1000;
  const [form, setForm] = useState<CheckOutFormData>({
    petIdVerified: false,
    finalWeight: booking.weight || "",
    finalTemperature: booking.temperature || "38.5",
    finalHealthStatus: "ปกติ",
    finalHealthNotes: "",
    equipmentReturned: [...mockEquipment.map(e => ({ ...e }))],
    photos: [],
    depositRefund: deposit,
    depositDeduction: 0,
    deductionReason: "",
    handoverNote: `${booking.petName}สุขภาพดี กลับบ้านเรียบร้อย ขอบคุณที่ใช้บริการครับ`,
  });

  const handleOpen = () => {
    setStep(0);
    setForm({
      petIdVerified: false,
      finalWeight: booking.weight || "",
      finalTemperature: booking.temperature || "38.5",
      finalHealthStatus: "ปกติ",
      finalHealthNotes: "",
      equipmentReturned: [...mockEquipment.map(e => ({ ...e }))],
      photos: [],
      depositRefund: deposit,
      depositDeduction: 0,
      deductionReason: "",
      handoverNote: `${booking.petName}สุขภาพดี กลับบ้านเรียบร้อย ขอบคุณที่ใช้บริการครับ`,
    });
  };

  const addPhoto = () => {
    const placeholders = [
      "https://images.unsplash.com/photo-1770836037793-95bdbf190f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    ];
    setForm(prev => ({ ...prev, photos: [...prev.photos, placeholders[prev.photos.length % placeholders.length]] }));
  };

  const canProceed = () => {
    if (step === 0) return form.petIdVerified;
    if (step === 1) return !!form.finalWeight && !!form.finalHealthStatus;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(form);
  };

  const bookingCode = `#BK-2025-${String(booking.id).padStart(4, "0")}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}
            onAnimationStart={handleOpen} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[600px] vet-modal flex flex-col"
              style={{ height: "min(720px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl flex-shrink-0">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(59,130,246,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                      <ClipboardCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">Check-out ส่งคืนสัตว์</h2>
                      <p className="vet-tiny mt-[2px]">{booking.petName} · {bookingCode}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  {CHECKOUT_STEPS.map((s, i) => {
                    const StepIcon = s.icon;
                    const isActive = i === step;
                    const isDone = i < step;
                    return (
                      <div key={i} className="flex items-center flex-1">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isDone ? "bg-blue-500 text-white" : isActive ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-400"
                          }`} style={isActive ? { boxShadow: "0 2px 8px rgba(59,130,246,0.3)" } : {}}>
                            {isDone ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[10px] leading-tight hidden sm:block ${isActive ? "text-blue-600" : isDone ? "text-gray-600" : "text-gray-400"}`}
                            style={{ fontWeight: isActive ? 600 : 400 }}>
                            {s.label}
                          </span>
                        </div>
                        {i < CHECKOUT_STEPS.length - 1 && (
                          <div className={`flex-1 h-[2px] mx-2 rounded-full ${isDone ? "bg-blue-500" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body flex-1 min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step === 0 && (
                      <div className="space-y-[20px]">
                        <div>
                          <p className="vet-divider">ยืนยันตัวตนเจ้าของ</p>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                              <img src={booking.photo} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{booking.petName}</p>
                              <p className="text-[11px] text-gray-500">{booking.breed}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400">เจ้าของ</p>
                              <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>{booking.ownerName}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="vet-divider">สแกน QR / Pet ID</p>
                          <div className="flex items-center justify-center py-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30">
                            <div className="text-center">
                              <QrCode className="w-10 h-10 mx-auto mb-2 text-blue-400" />
                              <p className="text-xs text-blue-600" style={{ fontWeight: 500 }}>สแกน QR Code หรือค้นหา Pet ID</p>
                              <p className="text-[10px] text-blue-400 mt-1">{bookingCode}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setForm(prev => ({ ...prev, petIdVerified: !prev.petIdVerified }))}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            form.petIdVerified ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            form.petIdVerified ? "bg-blue-500" : "bg-gray-200"
                          }`}>
                            {form.petIdVerified && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>ยืนยันตัวตนเจ้าของและ Pet ID</p>
                            <p className="text-[10px] text-gray-400">ตรวจสอบข้อมูลเจ้าของและสัตว์เลี้ยงถูกต้อง</p>
                          </div>
                        </button>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-[20px]">
                        <div>
                          <p className="vet-divider">ตรวจสุขภาพสุดท้ายก่อนส่งคืน</p>
                          <div className="vet-form-gap">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="vet-label">น้ำหนัก (กก.) <span className="required">*</span></label>
                                <input value={form.finalWeight} onChange={e => setForm(prev => ({ ...prev, finalWeight: e.target.value }))}
                                  placeholder="เช่น 28" className="vet-input" />
                              </div>
                              <div>
                                <label className="vet-label">อุณหภูมิ (°C)</label>
                                <input value={form.finalTemperature} onChange={e => setForm(prev => ({ ...prev, finalTemperature: e.target.value }))}
                                  placeholder="เช่น 38.5" className="vet-input" />
                              </div>
                            </div>
                            <div>
                              <label className="vet-label">สถานะสุขภาพ <span className="required">*</span></label>
                              <div className="flex gap-2">
                                {(["ปกติ", "เครียด", "ป่วย"] as const).map(s => {
                                  const colors = { "ปกติ": "border-green-400 bg-green-50 text-green-700", "เครียด": "border-yellow-400 bg-yellow-50 text-yellow-700", "ป่วย": "border-red-400 bg-red-50 text-red-700" };
                                  const dots = { "ปกติ": "bg-green-400", "เครียด": "bg-yellow-400", "ป่วย": "bg-red-400" };
                                  return (
                                    <button key={s}
                                      onClick={() => setForm(prev => ({ ...prev, finalHealthStatus: s }))}
                                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs rounded-xl border-2 transition-all ${
                                        form.finalHealthStatus === s ? colors[s] : "border-gray-200 bg-white text-gray-500"
                                      }`}
                                      style={{ fontWeight: form.finalHealthStatus === s ? 600 : 400 }}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${form.finalHealthStatus === s ? dots[s] : "bg-gray-300"}`} />
                                      {s}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <label className="vet-label">หมายเหตุสุขภาพ</label>
                              <textarea value={form.finalHealthNotes} onChange={e => setForm(prev => ({ ...prev, finalHealthNotes: e.target.value }))}
                                placeholder="บันทึกอาการหรือข้อสังเกตเพิ่มเติม..." className="vet-textarea" rows={2} />
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="vet-divider">ถ่ายรูปสัตว์ก่อนคืน</p>
                          <div className="flex gap-3 overflow-x-auto pb-1">
                            {form.photos.map((p, i) => (
                              <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-200 flex-shrink-0 relative group">
                                <img src={p} alt="" className="w-full h-full object-cover" />
                                <button onClick={() => setForm(prev => ({ ...prev, photos: prev.photos.filter((_, j) => j !== i) }))}
                                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                            <button onClick={addPhoto}
                              className="w-16 h-16 rounded-xl border-2 border-dashed border-blue-200 flex-shrink-0 flex items-center justify-center text-blue-300 hover:border-blue-400 hover:text-blue-500 transition-colors">
                              <Camera className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-[20px]">
                        <div>
                          <p className="vet-divider">ตรวจสอบอุปกรณ์ที่คืน</p>
                          <div className="space-y-2">
                            {form.equipmentReturned.map((eq, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <button
                                  onClick={() => setForm(prev => ({
                                    ...prev,
                                    equipmentReturned: prev.equipmentReturned.map((e, j) => j === i ? { ...e, returned: !e.returned } : e)
                                  }))}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                                    eq.returned ? "bg-green-500" : "bg-gray-300"
                                  }`}
                                >
                                  {eq.returned && <Check className="w-3.5 h-3.5 text-white" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{eq.name}</p>
                                </div>
                                <select
                                  value={eq.condition}
                                  onChange={e => setForm(prev => ({
                                    ...prev,
                                    equipmentReturned: prev.equipmentReturned.map((eq2, j) => j === i ? { ...eq2, condition: e.target.value } : eq2)
                                  }))}
                                  className="text-[11px] px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-600"
                                >
                                  <option value="สมบูรณ์">สมบูรณ์</option>
                                  <option value="ชำรุด">ชำรุด</option>
                                  <option value="สูญหาย">สูญหาย</option>
                                </select>
                                <button onClick={() => setForm(prev => ({
                                  ...prev,
                                  equipmentReturned: prev.equipmentReturned.filter((_, j) => j !== i)
                                }))} className="p-1 text-red-400 hover:text-red-600">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            <button onClick={() => setForm(prev => ({
                              ...prev,
                              equipmentReturned: [...prev.equipmentReturned, { name: "", returned: false, condition: "สมบูรณ์" }]
                            }))}
                              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-blue-500 border border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                              <Plus className="w-3.5 h-3.5" /> เพิ่มรายการอุปกรณ์
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-[20px]">
                        <div>
                          <p className="vet-divider">คืนมัดจำ</p>
                          <div className="vet-form-gap">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-xs text-gray-600">มัดจำที่ชำระ</span>
                              <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>฿{deposit.toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="vet-label">หักค่าซ่อม/เสียหาย (บาท)</label>
                                <input type="number" value={form.depositDeduction}
                                  onChange={e => {
                                    const d = Math.max(0, Math.min(deposit, Number(e.target.value)));
                                    setForm(prev => ({ ...prev, depositDeduction: d, depositRefund: deposit - d }));
                                  }}
                                  min="0" max={deposit} className="vet-input" />
                              </div>
                              <div>
                                <label className="vet-label">ยอดคืนมัดจำ</label>
                                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700" style={{ fontWeight: 700 }}>
                                  ฿{form.depositRefund.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            {form.depositDeduction > 0 && (
                              <div>
                                <label className="vet-label">เหตุผลหักมัดจำ</label>
                                <input value={form.deductionReason} onChange={e => setForm(prev => ({ ...prev, deductionReason: e.target.value }))}
                                  placeholder="เช่น กรงมีรอยขีดข่วน" className="vet-input" />
                              </div>
                            )}
                            {form.equipmentReturned.some(e => e.condition === "ชำรุด" || e.condition === "สูญหาย") && (
                              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs text-amber-700" style={{ fontWeight: 600 }}>พบอุปกรณ์ชำรุด/สูญหาย</p>
                                  <p className="text-[10px] text-amber-600 mt-0.5">
                                    {form.equipmentReturned.filter(e => e.condition !== "สมบูรณ์").map(e => `${e.name} (${e.condition})`).join(", ")}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="vet-divider">Handover Note ส่ง Line</p>
                          <textarea value={form.handoverNote} onChange={e => setForm(prev => ({ ...prev, handoverNote: e.target.value }))}
                            placeholder="ข้อความส่งให้เจ้าของผ่าน Line..."
                            className="vet-textarea" rows={3} />
                          <p className="text-[10px] text-gray-400 mt-1">ข้อความนี้จะส่งไปยัง Line ของเจ้าของสัตว์เลี้ยงอัตโนมัติ</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer flex-shrink-0">
                {step > 0 ? (
                  <button onClick={() => setStep(step - 1)} className="vet-btn vet-btn-secondary">
                    <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
                  </button>
                ) : (
                  <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="vet-btn vet-btn-primary btn-green ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(177deg, #3b82f6, #2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.28)" }}
                >
                  {step < 3 ? (
                    <>ถัดไป <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <><Check className="w-4 h-4" /> ยืนยัน Check-out</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
