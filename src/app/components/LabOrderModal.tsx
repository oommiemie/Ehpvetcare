import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, FlaskConical, Search, ChevronDown, ChevronRight,
  FileText, Clock, User, AlertTriangle, CalendarClock,
} from "lucide-react";
import { DatePickerModern } from "./DatePickerModern";
import { TimePickerModern } from "./TimePickerModern";
import imgLab from "figma:asset/6d3f7eb3a84dbadfb81427f57e9bf2e7e36583b7.png";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: LabOrderData) => void;
}

export interface LabOrderData {
  test: string;
  specimen: string;
  collectionDate: string;
  urgency: string;
  note: string;
  profiles?: string[];
  items?: string[];
  collectionTime?: string;
  orderer?: string;
}

/* ── Lab form templates ── */
const labForms = [
  { id: "lab-general", name: "LAB" },
  { id: "lab-anywhere", name: "LAB Any where" },
  { id: "lab-report", name: "LAB รายงานผลเอง" },
  { id: "lab-emergency", name: "LAB Emergency" },
  { id: "lab-extern", name: "LAB ส่งตรวจภายนอก" },
  { id: "lab-special", name: "LAB Special Request" },
];

/* ── Profile options ── */
const profileOptions = [
  "AFB Day 1", "AFB Day 2", "AFB Day 3",
  "Anti HIV screening", "Blood group",
  "Body fluid examination", "CBC",
  "Cell Count & Differentiation", "Cytology",
  "Dengue IgG IgM", "Dilantin level",
  "Electrolytes", "G - 6 - PD", "Lipid Profile",
  "Liver Function Test", "Renal Function Test",
  "Thyroid Function Test", "Coagulation Panel",
  "Urinalysis Panel",
];

/* ── Item options ── */
const itemOptions = [
  "ABO group", "ADA", "AFB", "AFB Day1", "AFB Day2", "AFB Day3",
  "AFB STAINS", "AFP (Alpha Fetoprotein)", "Albumin",
  "Alkaline Phosphatase", "ALT (SGPT)", "Amylase (Serum)",
  "Anti HAV (total)", "Anti HBc (total)", "Anti HBs",
  "Anti HCV", "AST (SGOT)", "BUN", "Calcium", "Chloride",
  "Cholesterol", "CO2", "Creatinine", "CRP",
  "Direct Bilirubin", "ESR", "FBS", "Ferritin",
  "GGT", "Globulin", "HbA1c", "HBsAg",
  "HDL Cholesterol", "Hematocrit", "Hemoglobin",
  "Iron", "LDH", "LDL Cholesterol", "Lipase",
  "Magnesium", "MCH", "MCHC", "MCV",
  "Phosphorus", "Platelet Count", "Potassium",
  "Protein (Total)", "PT", "PTT", "RBC Count",
  "Reticulocyte Count", "Sodium", "Total Bilirubin",
  "Triglyceride", "Troponin I", "TSH",
  "Uric Acid", "WBC Count",
];

const urgencyOptions = [
  { value: "routine", label: "ปกติ (Routine)", color: "#19a589" },
  { value: "urgent", label: "ด่วน (Urgent)", color: "#f59e0b" },
  { value: "stat", label: "ด่วนมาก (STAT)", color: "#ef4444" },
];

const ordererOptions = [
  "นพ.สมชาย รักสัตว์",
  "สพ.วิภาดา ใจดี",
  "สพ.ปรีชา มั่นคง",
  "น.สึ.ทดสอบ ดรีม",
];

export function LabOrderModal({ open, onClose, onSubmit }: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [formSearch, setFormSearch] = useState("");
  const [selectedForm, setSelectedForm] = useState<typeof labForms[0] | null>(null);

  // Step 2
  const [profiles, setProfiles] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const [collectionDate, setCollectionDate] = useState(todayStr);
  const [collectionTime, setCollectionTime] = useState(timeStr);
  const [urgency, setUrgency] = useState("routine");
  const [orderer, setOrderer] = useState(ordererOptions[0]);
  const [note, setNote] = useState("");

  // Dropdowns
  const [profileDropOpen, setProfileDropOpen] = useState(false);
  const [itemDropOpen, setItemDropOpen] = useState(false);
  const [urgencyDropOpen, setUrgencyDropOpen] = useState(false);
  const [ordererDropOpen, setOrdererDropOpen] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const urgencyRef = useRef<HTMLDivElement>(null);
  const ordererRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileDropOpen(false);
      if (itemRef.current && !itemRef.current.contains(e.target as Node)) setItemDropOpen(false);
      if (urgencyRef.current && !urgencyRef.current.contains(e.target as Node)) setUrgencyDropOpen(false);
      if (ordererRef.current && !ordererRef.current.contains(e.target as Node)) setOrdererDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredForms = useMemo(
    () => labForms.filter((f) => f.name.toLowerCase().includes(formSearch.toLowerCase())),
    [formSearch]
  );

  const filteredProfiles = useMemo(
    () => profileOptions.filter((p) => p.toLowerCase().includes(profileSearch.toLowerCase())),
    [profileSearch]
  );

  const filteredItems = useMemo(
    () => itemOptions.filter((it) => it.toLowerCase().includes(itemSearch.toLowerCase())),
    [itemSearch]
  );

  const resetAll = () => {
    setStep(1);
    setFormSearch("");
    setSelectedForm(null);
    setProfiles([]);
    setItems([]);
    setCollectionDate(todayStr);
    setCollectionTime(timeStr);
    setUrgency("routine");
    setOrderer(ordererOptions[0]);
    setNote("");
    setProfileSearch("");
    setItemSearch("");
    setProfileDropOpen(false);
    setItemDropOpen(false);
    setUrgencyDropOpen(false);
    setOrdererDropOpen(false);
  };

  const handleClose = () => { resetAll(); onClose(); };

  const handleSubmit = () => {
    onSubmit?.({
      test: selectedForm?.name || "",
      specimen: profiles.join(", "),
      collectionDate,
      urgency,
      note,
      profiles,
      items,
      collectionTime,
      orderer,
    });
    resetAll();
    onClose();
  };

  const canSave = selectedForm !== null;

  const toggleTag = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const inputCls = "vet-input";

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
              className="w-full max-w-[560px] vet-modal"
              style={{ height: "min(600px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-[24px]">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="vet-modal-header-icon">
                      {step === 1
                        ? <img src={imgLab} alt="Lab" className="w-[20px] h-[20px] object-contain" />
                        : <FlaskConical className="w-[20px] h-[20px] text-white" />}
                    </div>
                    <div>
                      <h2 className="vet-section-title">
                        {step === 1 ? "สั่ง Lab — เลือกแบบฟอร์ม" : `สั่ง Lab — ${selectedForm?.name || ""}`}
                      </h2>
                      <p className="vet-tiny mt-[2px]">
                        {step === 1 ? "เลือกแบบฟอร์มที่ต้องการสั่งตรวจ" : "กรอกรายละเอียดการสั่งตรวจ"}
                      </p>
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
                  {step === 1 ? (
                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-[14px]">
                      {/* Search forms */}
                      <div className="relative">
                        <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
                        <input
                          value={formSearch}
                          onChange={(e) => setFormSearch(e.target.value)}
                          placeholder="ค้นหาแบบฟอร์ม..."
                          className="vet-search"
                          autoFocus
                        />
                      </div>
                      {/* Form list */}
                      <div className="space-y-[8px]">
                        {filteredForms.map((f) => {
                          const sel = selectedForm?.id === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => { setSelectedForm(f); setStep(2); }}
                              className={`w-full flex items-center gap-[12px] px-[14px] py-[12px] rounded-[12px] border transition-all text-left ${sel ? "border-[#19a589] bg-[#19a589]/5" : "border-gray-100 hover:border-[#19a589]/30 hover:bg-[#19a589]/[0.02]"}`}
                            >
                              <div className="vet-icon-badge vet-icon-badge-sm" style={{ background: "linear-gradient(135deg, #19a589, #148f74)", boxShadow: "0 2px 8px rgba(25,165,137,0.2)" }}>
                                <FlaskConical className="w-[14px] h-[14px] text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>{f.name}</span>
                              </div>
                              <ChevronRight className="w-[16px] h-[16px] text-gray-300" />
                            </button>
                          );
                        })}
                        {filteredForms.length === 0 && (
                          <div className="py-[32px] text-center">
                            <FlaskConical className="w-[40px] h-[40px] text-gray-200 mx-auto mb-[8px]" />
                            <p className="vet-caption">ไม่พบแบบฟอร์มที่ค้นหา</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-[16px]">
                      {/* Profiles */}
                      <div ref={profileRef}>
                        <label className="vet-label">Lab Profiles</label>
                        <div className="relative">
                          <div
                            className="vet-select min-h-[42px] h-auto cursor-text !justify-start flex-wrap gap-[6px] py-[6px] px-[10px] pr-[32px]"
                            onClick={() => { setProfileDropOpen(true); setItemDropOpen(false); setUrgencyDropOpen(false); setOrdererDropOpen(false); }}
                          >
                            {profiles.length > 0 ? profiles.map((p) => (
                              <span key={p} className="inline-flex items-center gap-[4px] px-[10px] py-[3px] rounded-full text-[12px] bg-gradient-to-r from-[#19a589]/[0.08] to-[#0d7c66]/[0.06] text-[#0d7c66] border border-[#19a589]/20 shadow-[0_1px_2px_rgba(25,165,137,0.06)]" style={{ fontWeight: 500 }}>
                                {p}
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleTag(p, profiles, setProfiles); }} className="ml-[1px] rounded-full p-[1px] hover:bg-red-100 hover:text-red-500 text-[#19a589]/60 transition-colors">
                                  <X className="w-[11px] h-[11px]" />
                                </button>
                              </span>
                            )) : <span className="text-gray-300 text-[13px] pl-[2px]">เลือก Profile...</span>}
                          </div>
                          <AnimatePresence>
                            {profileDropOpen && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
                                className="absolute z-50 mt-[4px] left-0 right-0 vet-dropdown max-h-[200px] overflow-y-auto py-[4px]">
                                <div className="px-[10px] py-[4px]">
                                  <input value={profileSearch} onChange={(e) => setProfileSearch(e.target.value)} placeholder="ค้นหา Profile..." className="vet-input" autoFocus />
                                </div>
                                {filteredProfiles.map((p) => {
                                  const sel = profiles.includes(p);
                                  return (
                                    <button key={p} type="button" onClick={() => toggleTag(p, profiles, setProfiles)}
                                      className={`w-full flex items-center gap-[8px] px-[14px] py-[8px] text-[14px] transition-colors ${sel ? "bg-[#19a589]/10 text-[#19a589]" : "hover:bg-gray-50 text-gray-700"}`}
                                      style={sel ? { fontWeight: 600 } : {}}>
                                      <div className={`w-[16px] h-[16px] rounded-[4px] border-2 flex items-center justify-center ${sel ? "bg-[#19a589] border-[#19a589]" : "border-gray-300"}`}>
                                        {sel && <Check className="w-[10px] h-[10px] text-white" />}
                                      </div>
                                      {p}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Items */}
                      <div ref={itemRef}>
                        <label className="vet-label">Lab Items</label>
                        <div className="relative">
                          <div
                            className="vet-select min-h-[40px] h-auto cursor-text flex flex-wrap items-center gap-[6px] pr-[32px]"
                            onClick={() => { setItemDropOpen(true); setProfileDropOpen(false); setUrgencyDropOpen(false); setOrdererDropOpen(false); }}
                          >
                            {items.length > 0 ? items.map((it) => (
                              <span key={it} className="vet-chip bg-blue-50 text-blue-600">
                                {it}
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleTag(it, items, setItems); }} className="ml-[2px] hover:text-red-400">
                                  <X className="w-[12px] h-[12px]" />
                                </button>
                              </span>
                            )) : <span className="text-gray-400 text-[14px]">เลือก Item...</span>}
                          </div>
                          <AnimatePresence>
                            {itemDropOpen && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
                                className="absolute z-50 mt-[4px] left-0 right-0 vet-dropdown max-h-[200px] overflow-y-auto py-[4px]">
                                <div className="px-[10px] py-[4px]">
                                  <input value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="ค้นหา Item..." className="vet-input" autoFocus />
                                </div>
                                {filteredItems.map((it) => {
                                  const sel = items.includes(it);
                                  return (
                                    <button key={it} type="button" onClick={() => toggleTag(it, items, setItems)}
                                      className={`w-full flex items-center gap-[8px] px-[14px] py-[8px] text-[14px] transition-colors ${sel ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"}`}
                                      style={sel ? { fontWeight: 600 } : {}}>
                                      <div className={`w-[16px] h-[16px] rounded-[4px] border-2 flex items-center justify-center ${sel ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                                        {sel && <Check className="w-[10px] h-[10px] text-white" />}
                                      </div>
                                      {it}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-[12px]">
                        <div>
                          <label className="vet-label">
                            <CalendarClock className="w-[14px] h-[14px] inline mr-[4px]" />วันที่เก็บตัวอย่าง
                          </label>
                          <DatePickerModern value={collectionDate} onChange={setCollectionDate} />
                        </div>
                        <div>
                          <label className="vet-label">
                            <Clock className="w-[14px] h-[14px] inline mr-[4px]" />เวลา
                          </label>
                          <TimePickerModern value={collectionTime} onChange={setCollectionTime} />
                        </div>
                      </div>

                      {/* Urgency */}
                      <div>
                        <label className="vet-label">
                          <AlertTriangle className="w-[14px] h-[14px] inline mr-[4px]" />ความเร่งด่วน
                        </label>
                        <div className="flex gap-[8px]">
                          {urgencyOptions.map((opt) => {
                            const sel = urgency === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setUrgency(opt.value)}
                                className={`flex-1 flex items-center justify-center gap-[6px] py-[10px] rounded-[12px] border text-[13px] transition-all ${sel ? "border-[#19a589] bg-[#19a589]/5" : "border-gray-200 hover:border-gray-300"}`}
                                style={{ fontWeight: sel ? 600 : 400 }}
                              >
                                <span className="w-[8px] h-[8px] rounded-full" style={{ background: opt.color }} />
                                {opt.label.split(" ")[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Orderer */}
                      <div ref={ordererRef}>
                        <label className="vet-label">
                          <User className="w-[14px] h-[14px] inline mr-[4px]" />ผู้สั่ง
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            className="vet-select"
                            onClick={() => { setOrdererDropOpen(!ordererDropOpen); setProfileDropOpen(false); setItemDropOpen(false); setUrgencyDropOpen(false); }}
                          >
                            <span className="text-gray-700">{orderer}</span>
                            <ChevronDown className={`w-[16px] h-[16px] text-gray-400 transition-transform ${ordererDropOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {ordererDropOpen && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
                                className="absolute z-50 mt-[4px] left-0 right-0 vet-dropdown py-[4px]">
                                {ordererOptions.map((o) => (
                                  <button key={o} type="button"
                                    onClick={() => { setOrderer(o); setOrdererDropOpen(false); }}
                                    className={`w-full px-[14px] py-[8px] text-left text-[14px] transition-colors ${orderer === o ? "bg-[#19a589]/10 text-[#19a589]" : "hover:bg-gray-50 text-gray-700"}`}
                                    style={orderer === o ? { fontWeight: 600 } : {}}>
                                    {o}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Note */}
                      <div>
                        <label className="vet-label">
                          <FileText className="w-[14px] h-[14px] inline mr-[4px]" />หมายเหตุ
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="หมายเหตุเพิ่มเติม..."
                          rows={2}
                          className="vet-textarea"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer rounded-b-[24px]">
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="vet-btn vet-btn-ghost vet-btn-sm mr-auto">
                    ← ย้อนกลับ
                  </button>
                )}
                <button onClick={handleClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>
                  ยกเลิก
                </button>
                {step === 2 && (
                  <button
                    onClick={handleSubmit}
                    disabled={!canSave}
                    className="vet-btn vet-btn-primary btn-green"
                    style={{ width: 110 }}
                  >
                    <Check className="w-[16px] h-[16px]" />
                    บันทึก
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}