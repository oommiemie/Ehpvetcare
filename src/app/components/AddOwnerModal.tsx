import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, User, Phone, Mail, MapPin,
  MessageCircle, CreditCard, Camera, ScanLine, Loader2,
} from "lucide-react";
import { getGenderAvatar } from "./petAvatars";
import femaleAvatar from "figma:asset/8ed3fd7e8cc21248c15f1ec53db08aef89704a21.png";

type OwnerFormData = {
  name: string;
  nickname: string;
  gender: "ชาย" | "หญิง" | "";
  idCard: string;
  phone: string;
  email: string;
  lineId: string;
  address: string;
};

interface AddOwnerModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: OwnerFormData) => void;
  initialData?: OwnerFormData | null;
}

const emptyForm: OwnerFormData = {
  name: "", nickname: "", gender: "", idCard: "",
  phone: "", email: "", lineId: "", address: "",
};

/* ข้อมูลจำลองจากเครื่องอ่านบัตรประชาชน (Smart Card Reader) — ระบบจริงจะอ่านจากชิปบัตร */
const MOCK_ID_CARDS: Array<Pick<OwnerFormData, "name" | "gender" | "idCard" | "address">> = [
  { name: "สมชาย ใจดี",      gender: "ชาย", idCard: "3-1012-04567-88-1", address: "88/12 ถ.พหลโยธิน แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพมหานคร 10220" },
  { name: "วรรณา ศรีสุข",     gender: "หญิง", idCard: "1-1014-02233-45-6", address: "45 ซ.ลาดพร้าว 71 แขวงสะพานสอง เขตวังทองหลาง กรุงเทพมหานคร 10310" },
  { name: "ปิยะพร ทองสุข",   gender: "หญิง", idCard: "1-5099-00877-21-3", address: "129/4 หมู่ 3 ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200" },
];

export function AddOwnerModal({ open, onClose, onSave, initialData }: AddOwnerModalProps) {
  const [form, setForm] = useState<OwnerFormData>(emptyForm);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [cardReading, setCardReading] = useState(false);
  const [cardReadOk, setCardReadOk] = useState(false);

  const isEditMode = !!initialData;

  /* อ่านข้อมูลจากบัตรประชาชน — เติม ชื่อ/เพศ/เลขบัตร/ที่อยู่ ให้อัตโนมัติ */
  const readIdCard = () => {
    if (cardReading) return;
    setCardReading(true);
    setCardReadOk(false);
    setTimeout(() => {
      const c = MOCK_ID_CARDS[Math.floor(Math.random() * MOCK_ID_CARDS.length)];
      setForm(f => ({ ...f, name: c.name, gender: c.gender, idCard: c.idCard, address: c.address }));
      setCardReading(false);
      setCardReadOk(true);
    }, 1200);
  };

  useEffect(() => {
    if (open && initialData) {
      setForm(initialData);
      setCardReadOk(false);
    } else if (open && !initialData) {
      setForm(emptyForm);
      setCustomAvatar(null);
      setCardReadOk(false);
    }
  }, [open, initialData]);

  const set = <K extends keyof OwnerFormData>(key: K, val: OwnerFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canSave = form.name.trim() && form.gender && form.phone.trim();

  const handleSubmit = () => {
    if (!canSave) return;
    onSave?.(form);
    setForm(emptyForm);
    setCustomAvatar(null);
    onClose();
  };

  const handleClose = () => {
    setForm(emptyForm);
    setCustomAvatar(null);
    onClose();
  };

  const inputCls =
    "vet-input";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[480px] vet-modal"
              style={{ height: "min(680px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <User className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">{isEditMode ? "แก้ไขข้อมูลเจ้าของสัตว์" : "เพิ่มเจ้าของสัตว์ใหม่"}</h2>
                      <p className="vet-tiny mt-[2px]">{isEditMode ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"}</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="vet-modal-body">
                <AnimatePresence mode="wait">
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-[20px]"
                    >
                      {/* Avatar preview */}
                      <div className="flex justify-center pb-[4px]">
                        <div className="relative group">
                          <div
                            className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all ${
                              form.gender === "หญิง"
                                ? "bg-pink-50 border-pink-200"
                                : form.gender === "ชาย"
                                ? "bg-sky-50 border-sky-200"
                                : "bg-gray-50 border-gray-200 border-dashed"
                            }`}
                          >
                            {customAvatar ? (
                              <img
                                src={customAvatar}
                                alt="โปรไฟล์"
                                className="w-full h-full object-cover"
                              />
                            ) : form.gender ? (
                              <img
                                src={getGenderAvatar(form.gender)}
                                alt={form.gender}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-7 h-7 text-gray-300" />
                            )}
                          </div>
                          {/* Camera icon overlay */}
                          <button
                            type="button"
                            onClick={() => document.getElementById("owner-avatar-input")?.click()}
                            className="absolute bottom-0 right-0 w-6 h-6 rounded-full border border-gray-200 shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer bg-white/80 backdrop-blur-sm opacity-60 hover:opacity-100"
                          >
                            <Camera className="w-3 h-3 text-gray-400" />
                          </button>
                          <input
                            id="owner-avatar-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setCustomAvatar(ev.target?.result as string);
                                reader.readAsDataURL(file);
                              }
                              e.target.value = "";
                            }}
                          />
                        </div>
                      </div>

                      {/* อ่านข้อมูลจากบัตรประชาชน */}
                      <div>
                        <button
                          type="button"
                          onClick={readIdCard}
                          disabled={cardReading}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all active:scale-[0.99] disabled:cursor-wait"
                          style={cardReading
                            ? { background: "rgba(25,165,137,0.06)", border: "1.5px solid rgba(25,165,137,0.30)", color: "#0d7c66" }
                            : { background: "rgba(25,165,137,0.08)", border: "1.5px dashed rgba(25,165,137,0.45)", color: "#0d7c66" }}
                        >
                          {cardReading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <ScanLine className="w-4 h-4" />}
                          <span className="text-[13px]" style={{ fontWeight: 700 }}>
                            {cardReading ? "กำลังอ่านบัตร… เสียบบัตรค้างไว้" : "อ่านข้อมูลจากบัตรประชาชน"}
                          </span>
                        </button>
                        {cardReadOk && !cardReading && (
                          <p className="flex items-center gap-1 text-[11px] text-[#16a34a] mt-1.5" style={{ fontWeight: 600 }}>
                            <Check className="w-3.5 h-3.5" /> อ่านบัตรสำเร็จ — กรอกชื่อ เพศ เลขบัตร และที่อยู่ให้แล้ว ตรวจสอบก่อนบันทึก
                          </p>
                        )}
                      </div>

                      {/* Section: ข้อมูลส่วนตัว */}
                      <div>
                        <p className="vet-divider">
                          ข้อมูลส่วนตัว
                        </p>
                        <div className="vet-form-gap">
                          {/* ชื่อ-นามสกุล + ชื่อเล่น */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                              <label className="vet-label">
                                ชื่อ-นามสกุล <span className="required">*</span>
                              </label>
                              <div className="relative">
                                <User className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                                <input
                                  value={form.name}
                                  onChange={(e) => set("name", e.target.value)}
                                  placeholder="เช่น สมชาย ใจดี"
                                  className={`${inputCls} has-icon-left`}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="vet-label">ชื่อเล่น</label>
                              <div className="relative">
                                <User className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                                <input
                                  value={form.nickname}
                                  onChange={(e) => set("nickname", e.target.value)}
                                  placeholder="เช่น ชาย"
                                  className={`${inputCls} has-icon-left`}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="vet-label">
                                เพศ <span className="required">*</span>
                              </label>
                              <div className="flex gap-[8px]" style={{ height: 40 }}>
                                {(["ชาย", "หญิง"] as const).map((g) => {
                                  const isActive = form.gender === g;
                                  return (
                                    <button
                                      key={g}
                                      onClick={() => set("gender", g)}
                                      className={`flex-1 flex items-center justify-center gap-[6px] rounded-[12px] border text-[13px] transition-all ${
                                        isActive
                                          ? g === "หญิง"
                                            ? "bg-pink-500 text-white border-pink-500"
                                            : "bg-sky-500 text-white border-sky-500"
                                          : g === "หญิง"
                                          ? "bg-pink-50 border-pink-200 text-pink-500"
                                          : "bg-sky-50 border-sky-200 text-sky-500"
                                      }`}
                                    >
                                      <span style={{ fontWeight: 700 }}>{g === "หญิง" ? "♀" : "♂"}</span>
                                      <span style={{ fontWeight: isActive ? 600 : 400 }}>{g}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* เลขบัตรประชาชน */}
                          <div>
                            <label className="vet-label">เลขบัตรประชาชน</label>
                            <div className="relative">
                              <CreditCard className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                              <input
                                value={form.idCard}
                                onChange={(e) => set("idCard", e.target.value)}
                                placeholder="X-XXXX-XXXXX-XX-X"
                                className={`${inputCls} has-icon-left`}
                                maxLength={17}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section: ข้อมูลการติดต่อ */}
                      <div>
                        <p className="vet-divider">
                          ข้อมูลการติดต่อ
                        </p>
                        <div className="vet-form-gap">
                          {/* โทร + อีเมล */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="vet-label">
                                เบอร์โทรศัพท์ <span className="required">*</span>
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                                <input
                                  value={form.phone}
                                  onChange={(e) => set("phone", e.target.value)}
                                  placeholder="0XX-XXX-XXXX"
                                  className={`${inputCls} has-icon-left`}
                                  type="tel"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="vet-label">ไลน์ไอดี</label>
                              <div className="relative">
                                <MessageCircle className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                                <input
                                  value={form.lineId}
                                  onChange={(e) => set("lineId", e.target.value)}
                                  placeholder="@lineID"
                                  className={`${inputCls} has-icon-left`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* อีเมล */}
                          <div>
                            <label className="vet-label">อีเมล</label>
                            <div className="relative">
                              <Mail className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                              <input
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                                placeholder="email@example.com"
                                className={`${inputCls} has-icon-left`}
                                type="email"
                              />
                            </div>
                          </div>

                          {/* ที่อยู่ */}
                          <div>
                            <label className="vet-label">ที่อยู่</label>
                            <div className="relative">
                              <MapPin className="absolute left-[14px] top-[12px] w-[16px] h-[16px] text-gray-300" />
                              <textarea
                                value={form.address}
                                onChange={(e) => set("address", e.target.value)}
                                placeholder="ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                                rows={3}
                                className="vet-textarea has-icon-left"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
                <div className="vet-modal-footer rounded-b-3xl">
                  <button
                    onClick={handleClose}
                    className="vet-btn vet-btn-secondary"
                    style={{ width: 110 }}
                  >
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