import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ChevronRight, ChevronLeft, PawPrint, Dog, Cat, Bird, Fish, Rabbit, Rat, Squirrel,
  Camera, Check, User, Phone, AlertTriangle, Heart, Hash, Palette,
  Scale, Calendar, Cpu, Shield, GitBranch, Upload, Wand2, UtensilsCrossed,
  Search, Plus, UserCheck
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { AddOwnerModal } from "./AddOwnerModal";
import { getSpeciesAvatar } from "./petAvatars";

const speciesOptions = [
  { label: "สุนัข", icon: Dog, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "แมว", icon: Cat, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
  { label: "นก", icon: Bird, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200" },
  { label: "ปลา", icon: Fish, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "สัตว์เลี้ยงขนาดเล็ก", icon: Rabbit, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200" },
  { label: "สัตว์เลี้ยงคลาน", icon: PawPrint, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  { label: "กระต่าย", icon: Rabbit, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
  { label: "หนู", icon: Rat, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  { label: "กระรอก", icon: Squirrel, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  { label: "อื่นๆ", icon: PawPrint, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
];

const genderOptions = [
  { label: "เพศผู้", symbol: "♂", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", active: "bg-blue-500 text-white border-blue-500" },
  { label: "เพศเมีย", symbol: "♀", color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200", active: "bg-pink-500 text-white border-pink-500" },
  { label: "ไม่ระบุ", symbol: "?", color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200", active: "bg-gray-500 text-white border-gray-500" },
];

const steps = [
  { id: 1, label: "ข้อมูลพื้นฐาน", icon: PawPrint },
  { id: 2, label: "ข้อมูลเจ้าของ", icon: User },
  { id: 3, label: "ข้อมูลสุขภาพ", icon: Heart },
];

type FormData = {
  hn: string;
  name: string;
  nameEn: string;
  species: string;
  breed: string;
  gender: string;
  color: string;
  weight: string;
  age: string;
  ageText: string;
  microchip: string;
  sterilized: boolean | null;
  sterilizedDate: string;
  food: string;
  owner: string;
  ownerPhone: string;
  allergies: string;
  chronic: string;
  imagePreview: string | null;
};

interface AddPetModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: FormData, openVisit?: boolean) => void;
  initialData?: FormData | null;
}

export function AddPetModal({ open, onClose, onSave, initialData }: AddPetModalProps) {
  /* ติ๊กแล้วหลังบันทึกจะเปิดหน้าต่างส่งตรวจ (Visit) ให้ทันที */
  const [openVisitAfter, setOpenVisitAfter] = useState(false);
  const [step, setStep] = useState(1);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [showBirthCalendar, setShowBirthCalendar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  const [form, setForm] = useState<FormData>({
    hn: "", name: "", nameEn: "", species: "", breed: "", gender: "",
    color: "", weight: "", age: "", ageText: "", microchip: "",
    sterilized: null, sterilizedDate: "", food: "", owner: "", ownerPhone: "",
    allergies: "ไม่มี", chronic: "ไม่มี", imagePreview: null,
  });

  useEffect(() => {
    if (open && initialData) {
      setForm(initialData);
      setStep(1);
    } else if (open && !initialData) {
      setForm({
        hn: "", name: "", nameEn: "", species: "", breed: "", gender: "",
        color: "", weight: "", age: "", ageText: "", microchip: "",
        sterilized: null, sterilizedDate: "", food: "", owner: "", ownerPhone: "",
        allergies: "ไม่มี", chronic: "ไม่มี", imagePreview: null,
      });
      setStep(1);
    }
  }, [open, initialData]);

  const set = (key: keyof FormData, val: FormData[keyof FormData]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("imagePreview", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canNext1 = form.name.trim() && form.species;
  const canNext2 = form.owner.trim() && form.ownerPhone.trim();

  const generateHN = () => {
    const num = String(Math.floor(Math.random() * 90000) + 10000);
    set("hn", `HN-${num}`);
  };

  const handleSubmit = () => {
    onSave?.(form, openVisitAfter);
    setOpenVisitAfter(false);
    setStep(1);
    setForm({
      hn: "", name: "", nameEn: "", species: "", breed: "", gender: "",
      color: "", weight: "", age: "", ageText: "", microchip: "",
      sterilized: null, sterilizedDate: "", food: "", owner: "", ownerPhone: "",
      allergies: "ไม่มี", chronic: "ไม่มี", imagePreview: null,
    });
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    setOwnerSearch("");
    setShowAddOwnerModal(false);
    setForm({
      hn: "", name: "", nameEn: "", species: "", breed: "", gender: "",
      color: "", weight: "", age: "", ageText: "", microchip: "",
      sterilized: null, sterilizedDate: "", food: "", owner: "", ownerPhone: "",
      allergies: "ไม่มี", chronic: "ไม่มี", imagePreview: null,
    });
    onClose();
  };

  const inputCls = "vet-input";

  const mockOwners = [
    { id: 1, name: "สมชาย ใจดี", phone: "081-234-5678", pets: 2, color: "bg-blue-100 text-blue-600" },
    { id: 2, name: "วิไล รักสัตว์", phone: "089-876-5432", pets: 1, color: "bg-pink-100 text-pink-600" },
    { id: 3, name: "ประเสริฐ มีสุข", phone: "062-345-6789", pets: 3, color: "bg-amber-100 text-amber-600" },
    { id: 4, name: "นิดา สวัสดี", phone: "095-111-2233", pets: 1, color: "bg-purple-100 text-purple-600" },
    { id: 5, name: "กิตติ พงษ์ดี", phone: "086-999-0011", pets: 4, color: "bg-green-100 text-green-600" },
    { id: 6, name: "รัตนา ชัยชนะ", phone: "093-456-7890", pets: 2, color: "bg-orange-100 text-orange-600" },
    { id: 7, name: "สุภาพ แสงทอง", phone: "088-222-3344", pets: 1, color: "bg-teal-100 text-teal-600" },
    { id: 8, name: "มาลี วงศ์ดี", phone: "064-567-8901", pets: 2, color: "bg-red-100 text-red-600" },
  ];

  return (
    <>
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      <PawPrint className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">{isEditMode ? "แก้ไขข้อมูลสัตว์เลี้ยง" : "เพิ่มสัตว์เลี้ยงใหม่"}</h2>
                      <p className="vet-tiny mt-[2px]">{isEditMode ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"}</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Step indicator */}
              <div className="bg-white vet-border-b px-5 py-3 flex-shrink-0 flex justify-center">
                <div className="flex items-center gap-2">
                  {steps.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = step === s.id;
                    const isDone = step > s.id;
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                          isActive ? "bg-(--brand) text-white" :
                          isDone ? "bg-(--brand)/15 text-(--brand)" :
                          "bg-gray-100 text-gray-400"
                        }`}>
                          {isDone ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Icon className="w-3 h-3" />
                          )}
                          <span style={{ fontWeight: isActive || isDone ? 600 : 400 }}>{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`h-px w-4 ${step > s.id ? "bg-(--brand)/40" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="p-5 space-y-5"
                    >
                      {/* Photo upload */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div
                            onClick={() => fileRef.current?.click()}
                            className={`w-24 h-24 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center overflow-hidden group ${
                              form.imagePreview
                                ? "border-(--brand) bg-white"
                                : form.species
                                ? "border-solid border-gray-200 bg-gray-50 hover:border-(--brand) hover:bg-(--brand)/5"
                                : "border-dashed border-gray-200 bg-gray-50 hover:border-(--brand) hover:bg-(--brand)/5"
                            }`}
                          >
                            {form.imagePreview ? (
                              <img src={form.imagePreview} alt="preview" className="w-full h-full object-cover" />
                            ) : form.species ? (
                              <img src={getSpeciesAvatar(form.species)} alt={form.species} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1.5">
                                <Camera className="w-6 h-6 text-gray-300 group-hover:text-(--brand) transition-colors" />
                                <span className="text-xs text-gray-300 group-hover:text-(--brand) transition-colors">อัปโหลด</span>
                              </div>
                            )}
                          </div>
                          {form.imagePreview && (
                            <button
                              onClick={() => set("imagePreview", null)}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          {/* Camera icon overlay */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                            className="absolute bottom-0 right-0 w-6 h-6 rounded-full border border-gray-200 shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer bg-white/80 backdrop-blur-sm opacity-60 hover:opacity-100"
                          >
                            <Camera className="w-3 h-3 text-gray-400" />
                          </button>
                          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                        </div>
                      </div>

                      {/* HN */}
                      <div>
                        <label className="vet-label">
                          HN <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>(Hospital Number)</span>
                        </label>
                        <div className="relative flex gap-2">
                          <div className="relative flex-1">
                            <Hash className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                            <input
                              value={form.hn}
                              onChange={(e) => set("hn", e.target.value)}
                              placeholder="เช่น HN-00123"
                              className={`${inputCls} has-icon-left`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={generateHN}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-(--brand)/10 hover:bg-(--brand)/20 text-(--brand) text-xs transition-colors flex-shrink-0"
                            style={{ fontWeight: 500 }}
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            New HN
                          </button>
                        </div>
                      </div>

                      {/* ชื่อ */}
                      <div>
                        <label className="vet-label">
                          ชื่อสัตว์เลี้ยง <span className="required">*</span>
                        </label>
                        <input
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="เช่น บัดดี้, ลูน่า"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="vet-label">
                          ชื่อภาษาอังกฤษ
                        </label>
                        <input
                          value={form.nameEn || ""}
                          onChange={(e) => set("nameEn", e.target.value)}
                          placeholder="e.g. Buddy, Luna"
                          className={inputCls}
                        />
                      </div>

                      {/* ชนิดสัตว์ */}
                      <div>
                        <label className="vet-label">
                          ชนิดสัตว์ <span className="required">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {speciesOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = form.species === opt.label;
                            return (
                              <button
                                key={opt.label}
                                onClick={() => set("species", opt.label)}
                                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs transition-all ${
                                  isActive
                                    ? `${opt.bg} ${opt.border} ${opt.color}`
                                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                }`}
                              >
                                <Icon className={`w-5 h-5 ${isActive ? opt.color : "text-gray-400"}`} />
                                <span style={{ fontWeight: isActive ? 600 : 400 }} className="text-center leading-tight">
                                  {opt.label === "สัตว์เลี้ยงขนาดเล็ก" ? "เล็ก" :
                                   opt.label === "สัตว์เลี้ยงคลาน" ? "คลาน" : opt.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* สายพันธุ์ */}
                      <div>
                        <label className="vet-label">สายพันธุ์</label>
                        <div className="relative">
                          <GitBranch className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                          <input
                            value={form.breed}
                            onChange={(e) => set("breed", e.target.value)}
                            placeholder="เช่น โกลเดน รีทรีฟเวอร์, เปอร์เซีย"
                            className={`${inputCls} has-icon-left`}
                          />
                        </div>
                      </div>

                      {/* เพศ */}
                      <div>
                        <label className="vet-label">เพศ</label>
                        <div className="flex gap-2">
                          {genderOptions.map((g) => {
                            const isActive = form.gender === g.label;
                            return (
                              <button
                                key={g.label}
                                onClick={() => set("gender", g.label)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm transition-all ${
                                  isActive ? g.active : `${g.bg} ${g.border} ${g.color} hover:brightness-95`
                                }`}
                              >
                                <span style={{ fontWeight: 700 }}>{g.symbol}</span>
                                <span className="text-xs" style={{ fontWeight: isActive ? 600 : 400 }}>{g.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* สี + น้ำหนัก */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">สี / ลักษณะขน</label>
                          <div className="relative">
                            <Palette className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                            <input
                              value={form.color}
                              onChange={(e) => set("color", e.target.value)}
                              placeholder="เช่น สีทอง"
                              className={`${inputCls} has-icon-left`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="vet-label">น้ำหนัก (กก.)</label>
                          <div className="relative">
                            <Scale className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                            <input
                              value={form.weight}
                              onChange={(e) => set("weight", e.target.value)}
                              placeholder="เช่น 4.5"
                              className={`${inputCls} has-icon-left`}
                              type="number"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* วันเกิด + อายุ */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="vet-label">วันเกิด</label>
                          <div className="relative">
                            <Calendar className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300 pointer-events-none z-10" />
                            <button
                              type="button"
                              onClick={() => setShowBirthCalendar((v) => !v)}
                              className={`${inputCls} has-icon-left w-full text-left`}
                            >
                              {form.age
                                ? format(new Date(form.age), "d MMMM yyyy", { locale: th })
                                : <span className="text-gray-300">เลือกวันเกิด</span>}
                            </button>
                            {showBirthCalendar && (
                              <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
                                <DayPicker
                                  mode="single"
                                  selected={form.age ? new Date(form.age) : undefined}
                                  onSelect={(date) => {
                                    if (date) set("age", format(date, "yyyy-MM-dd"));
                                    setShowBirthCalendar(false);
                                  }}
                                  locale={th}
                                  captionLayout="dropdown"
                                  fromYear={2000}
                                  toYear={new Date().getFullYear()}
                                  style={{ fontSize: "calc(0.75rem * var(--fs))" }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="vet-label">อายุ</label>
                          <div className="relative">
                            <Calendar className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                            <input
                              value={form.age ? (() => {
                                const birth = new Date(form.age);
                                const now = new Date();
                                const totalMonths =
                                  (now.getFullYear() - birth.getFullYear()) * 12 +
                                  (now.getMonth() - birth.getMonth()) -
                                  (now.getDate() < birth.getDate() ? 1 : 0);
                                if (totalMonths < 1) return "น้อยกว่า 1 เดือน";
                                if (totalMonths < 12) return `${totalMonths} เดือน`;
                                const y = Math.floor(totalMonths / 12);
                                const m = totalMonths % 12;
                                return m > 0 ? `${y} ปี ${m} เดือน` : `${y} ปี`;
                              })() : form.ageText}
                              onChange={(e) => !form.age && set("ageText", e.target.value)}
                              placeholder="เช่น 2 ปี"
                              readOnly={!!form.age}
                              className={`${inputCls} has-icon-left ${form.age ? "bg-(--brand)/5 text-(--brand) cursor-default" : ""}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ไมโครชิป */}
                      <div>
                        <label className="vet-label">ไมโครชิป</label>
                        <div className="relative">
                          <Cpu className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-300" />
                          <input
                            value={form.microchip}
                            onChange={(e) => set("microchip", e.target.value)}
                            placeholder="หมายเลข 15 หลัก"
                            className={`${inputCls} has-icon-left`}
                          />
                        </div>
                      </div>

                      {/* ทำหมัน */}
                      <div>
                        <label className="vet-label">ทำหมันแล้วหรือไม่</label>
                        <div className="flex gap-2">
                          {[{ val: true, label: "ทำหมันแล้ว" }, { val: false, label: "ยังไม่ทำหมัน" }].map((opt) => (
                            <button
                              key={String(opt.val)}
                              onClick={() => {
                                set("sterilized", opt.val);
                                if (!opt.val) {
                                  set("sterilizedDate", "");
                                }
                              }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm transition-all ${
                                form.sterilized === opt.val
                                  ? "bg-(--brand) text-white border-(--brand)"
                                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span className="text-xs" style={{ fontWeight: form.sterilized === opt.val ? 600 : 400 }}>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                        {form.sterilized === true && (
                          <div className="mt-2.5">
                            <label className="vet-label">
                              วันที่ทำหมัน
                              {form.sterilizedDate && (
                                <span className="ml-2 text-(--brand)" style={{ fontWeight: 600 }}>
                                  {format(new Date(form.sterilizedDate), "d MMMM yyyy", { locale: th })}
                                </span>
                              )}
                            </label>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 flex justify-center">
                              <DayPicker
                                mode="single"
                                selected={form.sterilizedDate ? new Date(form.sterilizedDate) : undefined}
                                onSelect={(date) => {
                                  if (date) set("sterilizedDate", format(date, "yyyy-MM-dd"));
                                }}
                                locale={th}
                                captionLayout="dropdown"
                                fromYear={2000}
                                toYear={new Date().getFullYear()}
                                style={{ fontSize: "calc(0.75rem * var(--fs))" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="p-5 space-y-4"
                    >
                      {/* Pet summary */}
                      <div className="bg-(--brand)/5 border border-(--brand)/10 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-(--brand)/20">
                          {form.imagePreview
                            ? <img src={form.imagePreview} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><PawPrint className="w-4 h-4 text-gray-300" /></div>}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{form.name || "—"}</p>
                          <p className="text-xs text-gray-500">{form.species || "—"} · {form.breed || "—"}</p>
                        </div>
                      </div>

                      {/* Selected owner card */}
                      {form.owner && !showAddOwnerModal && (
                        <div className="bg-(--brand)/8 border border-(--brand)/20 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-(--brand) flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-(--brand)" style={{ fontWeight: 600 }}>{form.owner}</p>
                            <p className="text-xs text-gray-500">{form.ownerPhone}</p>
                          </div>
                          <button
                            onClick={() => { set("owner", ""); set("ownerPhone", ""); }}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-full hover:bg-gray-100"
                          >
                            เปลี่ยน
                          </button>
                        </div>
                      )}

                      {/* Search + Add button */}
                      {(
                        <>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>
                              {form.owner ? "เปลี่ยนเจ้าของ" : <>เลือกเจ้าของ <span className="text-red-400">*</span></>}
                            </label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                  value={ownerSearch}
                                  onChange={(e) => setOwnerSearch(e.target.value)}
                                  placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                                  className={`${inputCls} has-icon-left`}
                                />
                              </div>
                              <button
                                onClick={() => setShowAddOwnerModal(true)}
                                className="btn-add-green flex items-center gap-1.5 px-3 py-2 rounded-full bg-(--brand) hover:bg-[var(--brand-dark)] text-white text-xs transition-colors flex-shrink-0"
                                style={{ fontWeight: 500 }}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                เพิ่มใหม่
                              </button>
                            </div>
                          </div>

                          {/* Owner list */}
                          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                            {mockOwners
                              .filter((o) =>
                                o.name.includes(ownerSearch) || o.phone.includes(ownerSearch)
                              )
                              .map((owner) => {
                                const isSelected = form.owner === owner.name;
                                return (
                                  <button
                                    key={owner.id}
                                    onClick={() => { set("owner", owner.name); set("ownerPhone", owner.phone); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                      isSelected
                                        ? "border-(--brand) bg-(--brand)/5"
                                        : "border-gray-100 bg-white hover:border-(--brand)/30 hover:bg-(--brand)/3"
                                    }`}
                                  >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${owner.color}`} style={{ fontWeight: 700 }}>
                                      {owner.name.slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-800 truncate" style={{ fontWeight: isSelected ? 600 : 500 }}>{owner.name}</p>
                                      <p className="text-xs text-gray-400">{owner.phone} · {owner.pets} สัตว์เลี้ยง</p>
                                    </div>
                                    {isSelected && (
                                      <div className="w-5 h-5 rounded-full bg-(--brand) flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            {mockOwners.filter((o) => o.name.includes(ownerSearch) || o.phone.includes(ownerSearch)).length === 0 && (
                              <div className="text-center py-8 text-gray-400">
                                <User className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                                <p className="text-xs">ไม่พบเจ้าของที่ค้นหา</p>
                                <button
                                  onClick={() => setShowAddOwnerModal(true)}
                                  className="mt-2 text-xs text-(--brand) hover:underline"
                                  style={{ fontWeight: 500 }}
                                >
                                  + เพิ่มเจ้าของใหม่
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="p-5 space-y-5"
                    >
                      {/* Summary card */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
                        <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>สรุปข้อมูล</p>
                        {[
                          { label: "ชื่อ", value: form.name },
                          { label: "ชนิด", value: form.species },
                          { label: "สายพันธุ์", value: form.breed || "—" },
                          { label: "เจ้าของ", value: form.owner },
                          { label: "เบอร์โทร", value: form.ownerPhone },
                        ].map((r) => (
                          <div key={r.label} className="flex justify-between text-xs">
                            <span className="text-gray-400">{r.label}</span>
                            <span className="text-gray-700" style={{ fontWeight: 500 }}>{r.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* อาหารหลัก */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>
                          <span className="flex items-center gap-1.5">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-(--brand)" />
                            อาหารหลัก
                          </span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {["อาหารเม็ด", "อาหารเปียก", "อาหารสด", "อาหารผสม"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => set("food", form.food === opt ? "" : opt)}
                              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                                form.food === opt
                                  ? "bg-(--brand) text-white border-(--brand)"
                                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                              }`}
                              style={{ fontWeight: form.food === opt ? 600 : 400 }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            value={form.food}
                            onChange={(e) => set("food", e.target.value)}
                            placeholder="ระบุยี่ห้อ หรือรายละเอียดเพิ่มเติม..."
                            className={`${inputCls} has-icon-left`}
                          />
                        </div>
                      </div>

                      {/* ประวัติแพ้ยา */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                            ประวัติแพ้ยา / สารก่อภูมิแพ้
                          </span>
                        </label>
                        <div className="flex gap-2 mb-2">
                          {["ไม่มี", "มี"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => set("allergies", opt === "ไม่มี" ? "ไม่มี" : "")}
                              className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
                                (opt === "ไม่มี" && form.allergies === "ไม่มี") || (opt === "มี" && form.allergies !== "ไม่มี")
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                              }`}
                              style={{ fontWeight: 500 }}
                            >{opt}</button>
                          ))}
                        </div>
                        {form.allergies !== "ไม่มี" && (
                          <textarea
                            value={form.allergies}
                            onChange={(e) => set("allergies", e.target.value)}
                            placeholder="ระบุยา หรือสิ่งที่แพ้..."
                            rows={2}
                            className={`${inputCls} resize-none`}
                          />
                        )}
                      </div>

                      {/* โรคประจำตัว */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>
                          <span className="flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-red-400" />
                            โรคประจำตัว / ภาวะเรื้อรัง
                          </span>
                        </label>
                        <div className="flex gap-2 mb-2">
                          {["ไม่มี", "มี"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => set("chronic", opt === "ไม่มี" ? "ไม่มี" : "")}
                              className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
                                (opt === "ไม่มี" && form.chronic === "ไม่มี") || (opt === "มี" && form.chronic !== "ไม่มี")
                                  ? "bg-red-500 text-white border-red-500"
                                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                              }`}
                              style={{ fontWeight: 500 }}
                            >{opt}</button>
                          ))}
                        </div>
                        {form.chronic !== "ไม่มี" && (
                          <textarea
                            value={form.chronic}
                            onChange={(e) => set("chronic", e.target.value)}
                            placeholder="ระบุโรคประจำตัว..."
                            rows={2}
                            className={`${inputCls} resize-none`}
                          />
                        )}
                      </div>

                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                        <p style={{ fontWeight: 600 }}>หมายเหตุ</p>
                        <p className="mt-0.5 text-amber-600">ข้อมูลสุขภาพสามารถเพิ่มเติมได้ภายหลังในหน้าประวัติสัตว์เลี้ยง</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-3xl" style={{ flexWrap: "wrap", gap: 8 }}>
                {step === 3 && !initialData && (
                  <button
                    type="button"
                    onClick={() => setOpenVisitAfter(v => !v)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors text-left"
                    style={{
                      borderColor: openVisitAfter ? "color-mix(in srgb, var(--brand) 40%, transparent)" : "#e5e7eb",
                      background: openVisitAfter ? "color-mix(in srgb, var(--brand) 6%, transparent)" : "#fafafa",
                    }}
                  >
                    <span className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 border transition-colors"
                      style={{ background: openVisitAfter ? "var(--brand)" : "#fff", borderColor: openVisitAfter ? "var(--brand)" : "#d1d5db" }}>
                      {openVisitAfter && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-[12.5px]" style={{ fontWeight: 600, color: openVisitAfter ? "var(--brand-dark)" : "#6b7280" }}>
                      เปิด Visit ส่งตรวจทันทีหลังบันทึก
                    </span>
                  </button>
                )}
                {step > 1 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="vet-btn vet-btn-secondary"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    ย้อนกลับ
                  </button>
                )}
                <button
                  onClick={step < 3 ? () => setStep((s) => s + 1) : handleSubmit}
                  disabled={step === 1 ? !canNext1 : step === 2 ? !canNext2 : false}
                  className="flex-1 vet-btn vet-btn-primary"
                >
                  {step < 3 ? (
                    <>ถัดไป <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      บันทึกสัตว์เลี้ยง
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
    <AddOwnerModal
      open={showAddOwnerModal}
      onClose={() => setShowAddOwnerModal(false)}
      onSave={(data) => {
        set("owner", data.name);
        set("ownerPhone", data.phone);
        setShowAddOwnerModal(false);
      }}
    />
    </>
  );
}