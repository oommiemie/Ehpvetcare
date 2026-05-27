import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, X, ChevronDown, Check, Trash2 } from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";

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
}

const inputCls = "vet-input";
const textareaCls = "vet-textarea";
const labelCls = "block text-xs text-gray-500 mb-1.5";
const btnPrimary = "flex items-center gap-2 px-5 py-2 text-sm text-white rounded-full active:scale-95 transition-all";

export default function DiagnosisSection() {
  const { showSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dxText, setDxText] = useState("");
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

  const removeDiagnosis = (id: number) => {
    setDiagnoses((prev) => prev.filter((d) => d.id !== id));
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

  return (
    <div className="p-4 space-y-4">
      {/* ── Sub-section: ICD search ── */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-[11px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
            การวินิจฉัยโรค <span className="text-gray-400 normal-case">(ICD-10)</span>
          </label>
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
                          style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", boxShadow: "0 2px 6px rgba(25,165,137,0.40)" }}
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
                        onClick={() => removeDiagnosis(d.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

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
                          onFocus={(e) => { e.target.style.borderColor = "#19a589"; e.target.style.boxShadow = "0 0 0 3px rgba(25,165,137,0.10)"; }}
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
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-[11px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
            บันทึกการวินิจฉัย <span className="text-gray-400 normal-case">(Free Text)</span>
          </label>
          {dxText.trim() && (
            <span className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>{dxText.trim().length} ตัวอักษร</span>
          )}
        </div>
        <textarea
          value={dxText}
          onChange={(e) => setDxText(e.target.value)}
          rows={4}
          placeholder="บันทึกรายละเอียดเพิ่มเติม เช่น อาการ สาเหตุที่สงสัย ข้อสังเกต แผนการรักษา..."
          className="vet-textarea"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end pt-2 border-t border-gray-100">
        <button
          className="vet-btn vet-btn-primary"
          onClick={() => showSnackbar("success", "บันทึกการวินิจฉัยสำเร็จแล้ว")}
        >
          <Check className="w-4 h-4" strokeWidth={2.4} />
          บันทึกการวินิจฉัย
        </button>
      </div>
    </div>
  );
}