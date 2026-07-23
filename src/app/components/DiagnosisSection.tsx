import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, X, ChevronDown, Check, Trash2, Pencil, RefreshCw } from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { TemplatePicker } from "./TemplatePicker";
import type { DiagHistoryItem } from "../pages/Visits";

/* ── เทมเพลตเริ่มต้นสำหรับบันทึกการวินิจฉัย (Free Text) ── */
const DX_TEMPLATE_SEED = [
  "วินิจฉัยจากอาการทางคลินิก ประวัติ และผลตรวจร่างกาย",
  "แนะนำตรวจเพิ่มเติม (CBC, Blood Chemistry) เพื่อยืนยันการวินิจฉัย",
  "Differential diagnosis: ยังต้องแยกโรคจาก ___ และ ___",
  "สงสัยติดเชื้อแบคทีเรีย — พิจารณาให้ยาปฏิชีวนะและติดตามอาการ",
  "ให้การรักษาตามอาการ ติดตามอาการ 3–5 วัน หากไม่ดีขึ้นนัดตรวจซ้ำ",
];

/* ── เทมเพลตเริ่มต้นสำหรับวินิจฉัยสุดท้าย (Final Diagnosis) ── */
const FINAL_DX_SEED = [
  "ยืนยันการวินิจฉัยตาม ICD-10 ข้างต้น — อาการดีขึ้นตามการรักษา",
  "วินิจฉัยสุดท้ายสอดคล้องกับวินิจฉัยเบื้องต้น ไม่พบภาวะแทรกซ้อน",
  "หายเป็นปกติ จำหน่ายได้ นัดติดตามอาการตามกำหนด",
  "อาการคงที่ ให้ยากลับบ้าน นัดตรวจซ้ำเพื่อประเมินผล",
  "ส่งต่อผู้เชี่ยวชาญเพื่อวินิจฉัยและรักษาเพิ่มเติม",
];

/* ── ICD-10 mock database ── */
const icdDatabase = [
  { icd: "J00", name: "Acute nasopharyngitis [common cold]", nameTh: "โพรงจมูกอักเสบเฉียบพลัน [หวัด]" },
  { icd: "J06.9", name: "Acute upper respiratory infection, unspecified", nameTh: "การติดเชื้อทางเดินหายใจส่วนบนเฉียบพลัน" },
  { icd: "A08.4", name: "Viral intestinal infection, unspecified", nameTh: "ลำไส้อักเสบจากไวรัส" },
  { icd: "A09", name: "Infectious gastroenteritis and colitis, unspecified", nameTh: "กระเพาะลำไส้อักเสบติดเชื้อ" },
  { icd: "K29.7", name: "Gastritis, unspecified", nameTh: "กระเพาะอาหารอักเสบ" },
  { icd: "L30.9", name: "Dermatitis, unspecified", nameTh: "ผิวหนังอักเสบ" },
  { icd: "B36.0", name: "Pityriasis versicolor", nameTh: "เกลื้อน" },
  { icd: "H10.9", name: "Conjunctivitis, unspecified", nameTh: "เยื่อบุตาอักเสบ" },
  { icd: "M54.5", name: "Low back pain", nameTh: "ปวดหลังส่วนล่าง" },
  { icd: "R50.9", name: "Fever, unspecified", nameTh: "ไข้ไม่ทราบสาเหตุ" },
  { icd: "R11", name: "Nausea and vomiting", nameTh: "คลื่นไส้อาเจียน" },
  { icd: "K52.9", name: "Non-infective gastroenteritis and colitis, unspecified", nameTh: "กระเพาะลำไส้อักเสบไม่ติดเชื้อ" },
  { icd: "J20.9", name: "Acute bronchitis, unspecified", nameTh: "หลอดลมอักเสบเฉียบพลัน" },
  { icd: "N39.0", name: "Urinary tract infection, site not specified", nameTh: "ติดเชื้อทางเดินปัสสาวะ" },
  { icd: "T14.0", name: "Superficial injury of unspecified body region", nameTh: "บาดแผลที่ผิวหนัง" },
  { icd: "Z00.0", name: "General adult medical examination", nameTh: "ตรวจสุขภาพทั่วไป" },
];

const diagTypes = [
  { value: 1, label: "Principal Diagnosis" },
  { value: 2, label: "Co-morbidity" },
  { value: 3, label: "Complication" },
  { value: 4, label: "Other" },
  { value: 5, label: "External cause" },
];

interface DiagRow {
  id: number;
  approved: boolean;
  approver: string;
  icd: string;
  diseaseName: string;
  diagType: number;
  diagTypeLabel: string;
  priority: string;
  provider: string;
  diagnoserCode: string;
  diagnoser: string;
  licenseNo: string;
  note?: string;
}

const inputCls = "vet-input";
const textareaCls = "vet-textarea";
const labelCls = "block text-xs text-gray-500 mb-1.5";
const btnPrimary = "flex items-center gap-2 px-5 py-2 text-sm text-white rounded-full active:scale-95 transition-all";

/* remedHistory เป็น optional เพื่อไม่ให้ call site เดิมพัง — ถ้าไม่ส่งมา ปุ่ม Remed จะไม่แสดง */
export default function DiagnosisSection({ remedHistory = [] }: { remedHistory?: DiagHistoryItem[] } = {}) {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dxText, setDxText] = useState("");
  const dxRef = useRef<HTMLTextAreaElement>(null);
  const [finalDx, setFinalDx] = useState("");
  const finalDxRef = useRef<HTMLTextAreaElement>(null);

  /* ── inline "แก้ไขเต็ม" ต่อแถว ── */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editIcd, setEditIcd] = useState("");
  const [editDiseaseName, setEditDiseaseName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editSearch, setEditSearch] = useState("");
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  /* แทรกเทมเพลตที่ตำแหน่งเคอร์เซอร์ (ถ้าไม่มี ให้ต่อท้าย) */
  const insertDxTemplate = (text: string) => {
    const el = dxRef.current;
    if (!el) { setDxText(prev => (prev ? `${prev}\n${text}` : text)); return; }
    const start = el.selectionStart ?? dxText.length;
    const end = el.selectionEnd ?? dxText.length;
    const next = dxText.slice(0, start) + text + dxText.slice(end);
    setDxText(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  /* แทรกเทมเพลตวินิจฉัยสุดท้ายที่ตำแหน่งเคอร์เซอร์ */
  const insertFinalDxTemplate = (text: string) => {
    const el = finalDxRef.current;
    if (!el) { setFinalDx(prev => (prev ? `${prev}\n${text}` : text)); return; }
    const start = el.selectionStart ?? finalDx.length;
    const end = el.selectionEnd ?? finalDx.length;
    const next = finalDx.slice(0, start) + text + finalDx.slice(end);
    setFinalDx(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };
  const [diagnoses, setDiagnoses] = useState<DiagRow[]>([
    {
      id: 1,
      approved: true,
      approver: "",
      icd: "J00",
      diseaseName: "Acute nasopharyngitis [common cold]",
      diagType: 1,
      diagTypeLabel: "Principal Diagnosis",
      priority: "3551",
      provider: "dream เจ้าหน้าที่ทดสอบระบบ",
      diagnoserCode: "12345",
      diagnoser: "dream เจ้าหน้าที่ทดสอบระบบ",
      licenseNo: "555",
    },
  ]);
  const [nextId, setNextId] = useState(2);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (editRef.current && !editRef.current.contains(e.target as Node)) {
        setShowEditDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredIcd = searchQuery.trim()
    ? icdDatabase.filter(
        (item) =>
          item.icd.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.nameTh.includes(searchQuery)
      )
    : [];

  const addDiagnosis = (item: (typeof icdDatabase)[0]) => {
    const newRow: DiagRow = {
      id: nextId,
      approved: false,
      approver: "",
      icd: item.icd,
      diseaseName: `${item.name}`,
      diagType: diagnoses.length === 0 ? 1 : 4,
      diagTypeLabel: diagnoses.length === 0 ? "Principal Diagnosis" : "Other",
      priority: "",
      provider: "dream เจ้าหน้าที่ทดสอบระบบ",
      diagnoserCode: "12345",
      diagnoser: "dream เจ้าหน้าที่ทดสอบระบบ",
      licenseNo: "555",
    };
    setDiagnoses((prev) => [...prev, newRow]);
    setNextId((prev) => prev + 1);
    setSearchQuery("");
    setShowDropdown(false);
  };

  /* ── Remed โรคเดิม — ดึงการวินิจฉัยจาก visit ก่อนหน้า เลือกเฉพาะที่ต้องการได้ ── */
  const [showRemedModal, setShowRemedModal] = useState(false);
  const [remedSelected, setRemedSelected] = useState<number[]>([]);

  /* ICD ที่มีอยู่แล้วในใบนี้ — กัน Remed ซ้ำ */
  const existingIcd = new Set(diagnoses.map(d => d.icd));

  const openRemedModal = () => {
    /* ตั้งต้นเลือกเฉพาะโรคที่ยังไม่อยู่ในรายการปัจจุบัน */
    setRemedSelected(
      remedHistory.map((h, i) => ({ h, i })).filter(({ h }) => !existingIcd.has(h.icd)).map(({ i }) => i)
    );
    setShowRemedModal(true);
  };

  const applyRemed = () => {
    const sel = remedSelected.map(i => remedHistory[i]).filter(Boolean);
    if (sel.length === 0) return;
    setDiagnoses(prev => {
      let id = prev.length ? Math.max(...prev.map(d => d.id)) + 1 : 1;
      /* มี Principal ได้ใบละ 1 รายการ — ถ้าใบนี้มีแล้ว โรคที่ Remed เข้ามาจะลงเป็น Other */
      let hasPrincipal = prev.some(d => d.diagType === 1);
      const added = sel.map(h => {
        const wantPrincipal = h.diagType === "Principal" && !hasPrincipal;
        if (wantPrincipal) hasPrincipal = true;
        const type = wantPrincipal
          ? diagTypes[0]
          : diagTypes.find(t => t.label === h.diagType) ?? diagTypes[3];
        return {
          id: id++,
          approved: false,                 /* Remed มาแล้วต้องให้สัตวแพทย์ยืนยันเองอีกครั้ง */
          approver: "",
          icd: h.icd,
          diseaseName: h.disease,
          diagType: wantPrincipal ? 1 : (type.value === 1 ? 4 : type.value),
          diagTypeLabel: wantPrincipal ? diagTypes[0].label : (type.value === 1 ? diagTypes[3].label : type.label),
          priority: h.priority,
          provider: "dream เจ้าหน้าที่ทดสอบระบบ",
          diagnoserCode: "12345",
          diagnoser: "dream เจ้าหน้าที่ทดสอบระบบ",
          licenseNo: h.licenseNo,
          note: h.note || undefined,
        } as DiagRow;
      });
      return [...prev, ...added];
    });
    setNextId(prev => prev + sel.length);
    showSnackbar("success", `Remed โรคเดิม ${sel.length} รายการเรียบร้อย`);
    setShowRemedModal(false);
  };

  const removeDiagnosis = async (d: DiagRow) => {
    const ok = await confirm({
      title: "ลบการวินิจฉัย",
      description: `ลบ "${d.icd} · ${d.diseaseName}" ออกจากรายการ?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    setDiagnoses((prev) => prev.filter((x) => x.id !== d.id));
    if (editingId === d.id) setEditingId(null);
    showSnackbar("delete", "ลบการวินิจฉัยแล้ว");
  };

  const toggleApproved = (id: number) => {
    setDiagnoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, approved: !d.approved } : d))
    );
  };

  const updateDiagType = (id: number, type: number, label: string) => {
    setDiagnoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, diagType: type, diagTypeLabel: label } : d))
    );
  };

  /* เปิด/ปิด แก้ไขเต็ม + บันทึกการแก้ไข */
  const openEdit = (d: DiagRow) => {
    setEditingId(d.id);
    setEditIcd(d.icd);
    setEditDiseaseName(d.diseaseName);
    setEditNote(d.note ?? "");
    setEditSearch("");
    setShowEditDropdown(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowEditDropdown(false);
  };

  const pickEditIcd = (item: (typeof icdDatabase)[0]) => {
    setEditIcd(item.icd);
    setEditDiseaseName(item.name);
    setEditSearch("");
    setShowEditDropdown(false);
  };

  const saveEdit = (id: number) => {
    if (!editIcd.trim()) { showSnackbar("error", "กรุณาระบุรหัส ICD"); return; }
    if (!editDiseaseName.trim()) { showSnackbar("error", "กรุณาระบุชื่อโรค"); return; }
    setDiagnoses((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, icd: editIcd.trim(), diseaseName: editDiseaseName.trim(), note: editNote.trim() || undefined }
          : d
      )
    );
    setEditingId(null);
    setShowEditDropdown(false);
    showSnackbar("success", "แก้ไขการวินิจฉัยแล้ว");
  };

  const filteredEditIcd = editSearch.trim()
    ? icdDatabase.filter(
        (item) =>
          item.icd.toLowerCase().includes(editSearch.toLowerCase()) ||
          item.name.toLowerCase().includes(editSearch.toLowerCase()) ||
          item.nameTh.includes(editSearch)
      )
    : [];

  return (
    <div className="p-4 space-y-4">
      {/* ── Sub-section: ICD search ── */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-[11px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
            การวินิจฉัยโรค <span className="text-gray-400 normal-case">(ICD-10)</span>
          </label>
          <div className="flex items-center gap-2 flex-shrink-0">
            {remedHistory.length > 0 && (
              <button
                onClick={openRemedModal}
                className="vet-btn vet-btn-secondary"
                style={{ height: 28, padding: "0 12px", fontSize: "calc(11.5px * var(--fs))", color: "var(--brand-dark)", borderColor: "color-mix(in srgb, var(--brand) 35%, transparent)" }}
                title="ดึงการวินิจฉัยจาก visit ก่อนหน้า — เลือกเฉพาะโรคที่ต้องการได้"
              >
                <RefreshCw className="w-3 h-3" /> Remed โรคเดิม
              </button>
            )}
            {diagnoses.length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px]"
                style={{
                  background: "rgba(147,51,234,0.10)",
                  color: "#7c3aed",
                  fontWeight: 700,
                  border: "1px solid rgba(147,51,234,0.20)",
                }}
              >
                <Check className="w-2.5 h-2.5" strokeWidth={3} /> {diagnoses.length} รายการ
              </span>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setShowDropdown(true);
              }}
              placeholder="ค้นหาชื่อโรค หรือ รหัส ICD-10 (เช่น J00, nasopharyngitis)"
              className="vet-input has-icon-left"
            />
          </div>

          {/* Dropdown results */}
          {showDropdown && filteredIcd.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl max-h-[260px] overflow-y-auto"
              style={{
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div className="p-1.5">
                {filteredIcd.map((item) => {
                  const alreadyAdded = diagnoses.some((d) => d.icd === item.icd);
                  return (
                    <button
                      key={item.icd}
                      onClick={() => !alreadyAdded && addDiagnosis(item)}
                      disabled={alreadyAdded}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-xl transition-colors ${
                        alreadyAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span
                        className="text-[10.5px] px-2 py-0.5 rounded-md flex-shrink-0"
                        style={{
                          background: "rgba(147,51,234,0.10)",
                          color: "#7c3aed",
                          fontWeight: 700,
                          border: "1px solid rgba(147,51,234,0.20)",
                        }}
                      >
                        {item.icd}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 600 }}>{item.name}</div>
                        <div className="text-[10.5px] text-gray-400 truncate" style={{ fontWeight: 500 }}>{item.nameTh}</div>
                      </div>
                      {alreadyAdded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0" style={{ fontWeight: 600 }}>
                          <Check className="w-3 h-3" strokeWidth={2.6} /> เพิ่มแล้ว
                        </span>
                      ) : (
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                          style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", boxShadow: "0 2px 6px color-mix(in srgb, var(--brand) 40%, transparent)" }}
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={2.6} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showDropdown && searchQuery.trim() && filteredIcd.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl p-6 text-center"
              style={{
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              <Search className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
              <p className="text-[12.5px] text-gray-500" style={{ fontWeight: 600 }}>ไม่พบรหัส ICD หรือชื่อโรคที่ค้นหา</p>
              <p className="text-[10.5px] text-gray-400 mt-0.5">ลองคำค้นอื่น เช่น "หวัด", "ผิวหนัง", "J00"</p>
            </div>
          )}
        </div>

        {/* Diagnosis cards */}
        {diagnoses.length > 0 && (
          <div className="space-y-2">
            {diagnoses.map((d, idx) => {
              const isPrincipal = d.diagType === 1;
              return (
                <div
                  key={d.id}
                  className="rounded-2xl bg-white overflow-hidden transition-all group relative"
                  style={{
                    border: isPrincipal ? "1.5px solid rgba(147,51,234,0.30)" : "1.5px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Left accent bar — purple for Principal */}
                  {isPrincipal && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                      style={{ background: "linear-gradient(180deg, #a78bfa, #7c3aed)", boxShadow: "0 0 8px rgba(147,51,234,0.50)" }}
                    />
                  )}

                  <div className="p-3 pl-3.5">
                    {/* Row 1: # + ICD + Disease name + delete */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10.5px] flex-shrink-0 tabular-nums"
                        style={{
                          background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                          color: "white",
                          fontWeight: 700,
                          boxShadow: "0 2px 6px rgba(147,51,234,0.35), inset 0 1px 0 rgba(255,255,255,0.30)",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[11px] flex-shrink-0"
                        style={{ background: "rgba(147,51,234,0.10)", color: "#7c3aed", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(147,51,234,0.25)" }}
                      >
                        {d.icd}
                      </span>
                      <span className="text-[13.5px] text-gray-900 truncate flex-1" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{d.diseaseName}</span>
                      <button
                        onClick={() => openEdit(d)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                          editingId === d.id
                            ? "text-[#7c3aed] bg-[rgba(147,51,234,0.10)]"
                            : "text-gray-300 hover:text-[#7c3aed] hover:bg-[rgba(147,51,234,0.10)] opacity-0 group-hover:opacity-100"
                        }`}
                        title="แก้ไขเต็ม"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeDiagnosis(d)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* note ของแถว (ถ้ามี) */}
                    {d.note && editingId !== d.id && (
                      <p className="text-[11.5px] text-gray-500 mb-2 -mt-0.5 pl-8 truncate" style={{ fontWeight: 500 }} title={d.note}>
                        {d.note}
                      </p>
                    )}

                    {/* Row 2: inline pill row — type select + priority input + diagnoser */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Type select — pill */}
                      <div className="relative inline-flex items-center">
                        <select
                          value={d.diagType}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const found = diagTypes.find((dt) => dt.value === val);
                            updateDiagType(d.id, val, found?.label || "");
                          }}
                          className="appearance-none cursor-pointer text-[11px] pl-2.5 pr-7 py-1 rounded-full focus:outline-none transition-colors"
                          style={{
                            background: isPrincipal ? "rgba(147,51,234,0.10)" : "#f3f4f6",
                            color: isPrincipal ? "#7c3aed" : "#374151",
                            border: isPrincipal ? "1px solid rgba(147,51,234,0.30)" : "1px solid #e5e7eb",
                            fontWeight: 700,
                            height: 28,
                          }}
                        >
                          {diagTypes.map((dt) => (
                            <option key={dt.value} value={dt.value}>{dt.label}</option>
                          ))}
                        </select>
                        <ChevronDown className={`w-3 h-3 absolute right-2 pointer-events-none ${isPrincipal ? "text-[#7c3aed]" : "text-gray-400"}`} />
                      </div>

                      {/* Priority — pill */}
                      <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1 h-7 rounded-full bg-gray-100">
                        <span className="text-[10px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ลำดับ</span>
                        <input
                          type="text"
                          defaultValue={d.priority}
                          className="w-12 text-center bg-white rounded-full text-[11px] focus:outline-none transition-colors px-1"
                          style={{
                            border: "1px solid #e5e7eb",
                            height: 22,
                            fontWeight: 700,
                            color: "#374151",
                          }}
                          placeholder="-"
                          onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--brand) 10%, transparent)"; }}
                          onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                        />
                      </div>

                      {/* Diagnoser — pill (right-aligned via ml-auto) */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-gray-50 ml-auto">
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 text-white text-[9.5px]"
                          style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)", fontWeight: 700, boxShadow: "0 1px 3px rgba(14,165,233,0.40)" }}
                          title={`${d.diagnoser} · Lic. ${d.licenseNo}`}
                        >
                          {d.diagnoser.split(" ").slice(-1)[0]?.[0]?.toUpperCase() || "Dr"}
                        </span>
                        <span className="text-[11px] text-gray-700 truncate max-w-[120px]" style={{ fontWeight: 600 }}>{d.diagnoser.split(" ")[0]}</span>
                        <span className="text-[10px] text-gray-400" style={{ fontWeight: 600 }}>#{d.diagnoserCode}</span>
                      </div>
                    </div>

                    {/* ── แก้ไขเต็ม (inline edit) ── */}
                    {editingId === d.id && (
                      <div
                        className="mt-3 pt-3 space-y-2.5"
                        style={{ borderTop: "1px dashed rgba(147,51,234,0.25)" }}
                      >
                        {/* ค้นใหม่จาก icdDatabase */}
                        <div ref={editRef} className="relative">
                          <label className={labelCls}>ค้นหา ICD / ชื่อโรค (เลือกเพื่อแทนค่าเดิม)</label>
                          <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              type="text"
                              value={editSearch}
                              onChange={(e) => { setEditSearch(e.target.value); setShowEditDropdown(true); }}
                              onFocus={() => { if (editSearch.trim()) setShowEditDropdown(true); }}
                              placeholder="ค้นหาชื่อโรค หรือ รหัส ICD-10"
                              className="vet-input has-icon-left"
                            />
                          </div>
                          {showEditDropdown && filteredEditIcd.length > 0 && (
                            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl max-h-[220px] overflow-y-auto"
                              style={{
                                border: "1px solid rgba(0,0,0,0.05)",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
                              }}
                            >
                              <div className="p-1.5">
                                {filteredEditIcd.map((item) => (
                                  <button
                                    key={item.icd}
                                    onClick={() => pickEditIcd(item)}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-xl transition-colors hover:bg-gray-50 cursor-pointer"
                                  >
                                    <span
                                      className="text-[10.5px] px-2 py-0.5 rounded-md flex-shrink-0"
                                      style={{ background: "rgba(147,51,234,0.10)", color: "#7c3aed", fontWeight: 700, border: "1px solid rgba(147,51,234,0.20)" }}
                                    >
                                      {item.icd}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 600 }}>{item.name}</div>
                                      <div className="text-[10.5px] text-gray-400 truncate" style={{ fontWeight: 500 }}>{item.nameTh}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ICD + ชื่อโรค แก้มือ */}
                        <div className="flex gap-2">
                          <div className="w-[110px] flex-shrink-0">
                            <label className={labelCls}>รหัส ICD</label>
                            <input
                              type="text"
                              value={editIcd}
                              onChange={(e) => setEditIcd(e.target.value)}
                              placeholder="เช่น J00"
                              className={inputCls}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className={labelCls}>ชื่อโรค</label>
                            <input
                              type="text"
                              value={editDiseaseName}
                              onChange={(e) => setEditDiseaseName(e.target.value)}
                              placeholder="ชื่อโรค / Diagnosis"
                              className={inputCls}
                            />
                          </div>
                        </div>

                        {/* หมายเหตุของแถว */}
                        <div>
                          <label className={labelCls}>หมายเหตุ (เฉพาะรายการนี้)</label>
                          <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            rows={2}
                            placeholder="บันทึกเพิ่มเติมสำหรับการวินิจฉัยนี้..."
                            className={textareaCls}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-0.5">
                          <button onClick={cancelEdit} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                          <button onClick={() => saveEdit(d.id)} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" strokeWidth={2.4} /> บันทึกการแก้ไข
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {diagnoses.length === 0 && (
          <div className="text-center py-8 rounded-2xl" style={{ background: "rgba(147,51,234,0.04)", border: "1.5px dashed rgba(147,51,234,0.20)" }}>
            <div className="inline-flex w-10 h-10 rounded-full items-center justify-center mb-2" style={{ background: "rgba(147,51,234,0.10)" }}>
              <Search className="w-5 h-5" style={{ color: "#7c3aed" }} />
            </div>
            <p className="text-[13px] text-gray-700" style={{ fontWeight: 700 }}>ยังไม่มีการวินิจฉัย</p>
            <p className="text-[11px] text-gray-500 mt-0.5" style={{ fontWeight: 500 }}>ค้นหาชื่อโรค หรือรหัส ICD-10 เพื่อเพิ่ม</p>
          </div>
        )}
      </div>

      {/* ── Sub-section: บันทึกการวินิจฉัย ── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
            บันทึกการวินิจฉัย <span className="text-gray-400 normal-case">(Free Text)</span>
          </label>
          <div className="flex items-center gap-2">
            {dxText.trim() && (
              <span className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>{dxText.trim().length} ตัวอักษร</span>
            )}
            <TemplatePicker
              storageKey="vet-dx-freetext-templates"
              title="เทมเพลตบันทึกการวินิจฉัย"
              seed={DX_TEMPLATE_SEED}
              onSelect={insertDxTemplate}
            />
          </div>
        </div>
        <textarea
          ref={dxRef}
          value={dxText}
          onChange={(e) => setDxText(e.target.value)}
          rows={4}
          placeholder="บันทึกรายละเอียดเพิ่มเติม เช่น อาการ สาเหตุที่สงสัย ข้อสังเกต แผนการรักษา..."
          className="vet-textarea"
        />
      </div>

      {/* ── Sub-section: วินิจฉัยสุดท้าย (Final Diagnosis) ── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] flex items-center gap-1.5" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: "var(--brand-dark)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand-dark)" }} />
            วินิจฉัยสุดท้าย <span className="text-gray-400 normal-case">(Final Diagnosis)</span>
          </label>
          <div className="flex items-center gap-2">
            {finalDx.trim() && (
              <span className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>{finalDx.trim().length} ตัวอักษร</span>
            )}
            <TemplatePicker
              storageKey="vet-final-dx-templates"
              title="เทมเพลตวินิจฉัยสุดท้าย"
              seed={FINAL_DX_SEED}
              onSelect={insertFinalDxTemplate}
            />
          </div>
        </div>
        <textarea
          ref={finalDxRef}
          value={finalDx}
          onChange={(e) => setFinalDx(e.target.value)}
          rows={3}
          placeholder="สรุปวินิจฉัยสุดท้ายเมื่อปิดเคส เช่น ยืนยันตามวินิจฉัยเบื้องต้น / เปลี่ยนการวินิจฉัยเป็น ___ / หายเป็นปกติ..."
          className="vet-textarea"
          style={{ borderColor: finalDx.trim() ? "color-mix(in srgb, var(--brand) 45%, transparent)" : undefined, background: finalDx.trim() ? "color-mix(in srgb, var(--brand) 3%, transparent)" : undefined }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end pt-2 border-t border-gray-100">
        <button
          className="vet-btn vet-btn-primary"
          onClick={() => showSnackbar("success", finalDx.trim() ? "บันทึกการวินิจฉัย + วินิจฉัยสุดท้ายแล้ว" : "บันทึกการวินิจฉัยสำเร็จแล้ว")}
        >
          <Check className="w-4 h-4" strokeWidth={2.4} />
          บันทึกการวินิจฉัย
        </button>
      </div>

      {/* ══════════ Modal: Remed โรคเดิม ══════════ */}
      {showRemedModal && createPortal(
        <AnimatePresence>
          <motion.div
            key="remed-dx-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px]"
            onClick={() => setShowRemedModal(false)}
          >
            <motion.div
              key="remed-dx-card"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white w-full max-w-[560px] rounded-3xl overflow-hidden flex flex-col"
              style={{ maxHeight: "min(640px, calc(100vh - 2rem))", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
            >
              {/* header */}
              <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-dark))", boxShadow: "0 4px 12px color-mix(in srgb, var(--brand) 45%, transparent)" }}
                >
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900" style={{ fontSize: "calc(15px * var(--fs))", fontWeight: 800, letterSpacing: "-0.2px" }}>Remed โรคเดิม</p>
                  <p className="text-gray-400 truncate" style={{ fontSize: "calc(11.5px * var(--fs))" }}>เลือกการวินิจฉัยจากประวัติมาใส่ใบนี้</p>
                </div>
                <button
                  onClick={() => setShowRemedModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 transition-colors hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* เลือกทั้งหมด / ไม่เลือก */}
              <div className="px-5 py-2.5 flex items-center justify-between border-b border-gray-100 bg-gray-50/60">
                <button
                  onClick={() => {
                    const selectable = remedHistory.map((h, i) => ({ h, i })).filter(({ h }) => !existingIcd.has(h.icd)).map(({ i }) => i);
                    setRemedSelected(remedSelected.length === selectable.length ? [] : selectable);
                  }}
                  className="text-(--brand-dark)"
                  style={{ fontSize: "calc(11.5px * var(--fs))", fontWeight: 700 }}
                >
                  {remedSelected.length > 0 ? "ไม่เลือกทั้งหมด" : "เลือกทั้งหมด"}
                </button>
                <span className="text-gray-400" style={{ fontSize: "calc(11px * var(--fs))" }}>
                  เลือกแล้ว {remedSelected.length} รายการ
                </span>
              </div>

              {/* รายการ */}
              <div className="overflow-y-auto px-5 py-3 space-y-2 flex-1">
                {remedHistory.map((h, i) => {
                  const already = existingIcd.has(h.icd);
                  const on = remedSelected.includes(i);
                  return (
                    <button
                      key={`${h.icd}-${i}`}
                      disabled={already}
                      onClick={() => setRemedSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                      className="w-full flex items-start gap-3 rounded-2xl px-3.5 py-3 text-left transition-all"
                      style={{
                        background: "#fff",
                        border: on ? "2px solid var(--brand)" : "1px solid #e5e7eb",
                        boxShadow: on ? "0 4px 12px color-mix(in srgb, var(--brand) 15%, transparent)" : "none",
                        opacity: already ? 0.5 : 1,
                        cursor: already ? "not-allowed" : "pointer",
                      }}
                    >
                      <span
                        className="mt-0.5 w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: on ? "var(--brand)" : "transparent", border: on ? "none" : "1.5px solid #d1d5db" }}
                      >
                        {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-1.5 py-0.5 rounded-md"
                            style={{ background: "rgba(147,51,234,0.10)", color: "#7c3aed", fontSize: "calc(10.5px * var(--fs))", fontWeight: 800 }}
                          >
                            {h.icd}
                          </span>
                          <span className="text-gray-800 truncate" style={{ fontSize: "calc(12.5px * var(--fs))", fontWeight: 700 }}>{h.disease}</span>
                        </div>
                        <p className="text-gray-400 mt-1" style={{ fontSize: "calc(10.5px * var(--fs))" }}>
                          {h.date} · {h.diagType} · {h.vet}
                        </p>
                        {h.note && (
                          <p className="text-gray-500 mt-1 line-clamp-2" style={{ fontSize: "calc(11px * var(--fs))" }}>{h.note}</p>
                        )}
                      </div>
                      {already && (
                        <span
                          className="flex-shrink-0 px-2 py-0.5 rounded-full"
                          style={{ background: "#f3f4f6", color: "#6b7280", fontSize: "calc(10px * var(--fs))", fontWeight: 700 }}
                        >
                          มีในใบนี้แล้ว
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* footer */}
              <div className="px-5 py-3.5 border-t border-gray-100">
                <button
                  onClick={applyRemed}
                  disabled={remedSelected.length === 0}
                  className="w-full rounded-full py-2.5 text-white transition-opacity disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-dark))", fontSize: "calc(13px * var(--fs))", fontWeight: 700 }}
                >
                  Remed ที่เลือก ({remedSelected.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}