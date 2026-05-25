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
    <div className="p-5 space-y-5">
      {/* ── Section: การวินิจฉัย (ICD Search + Table) ── */}
      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-purple-50/30 to-white p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-purple-400" />
          <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>การวินิจฉัยโรค</span>
          <span className="text-[10px] text-gray-400">Diagnosis (ICD-10)</span>
        </div>

        {/* Search bar */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              placeholder="ค้นหาชื่อโรค หรือ รหัส ICD-10 เช่น J00, nasopharyngitis, ลำไส้อักเสบ..."
              className={`${inputCls} has-icon-left pr-[16px]`}
            />
          </div>

          {/* Dropdown results */}
          {showDropdown && filteredIcd.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[240px] overflow-y-auto">
              {filteredIcd.map((item) => {
                const alreadyAdded = diagnoses.some((d) => d.icd === item.icd);
                return (
                  <button
                    key={item.icd}
                    onClick={() => !alreadyAdded && addDiagnosis(item)}
                    disabled={alreadyAdded}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-b-0 ${
                      alreadyAdded
                        ? "opacity-40 cursor-not-allowed bg-gray-50"
                        : "hover:bg-vet-teal/5 cursor-pointer"
                    }`}
                  >
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 flex-shrink-0"
                      style={{ fontWeight: 600 }}
                    >
                      {item.icd}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800 truncate">{item.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{item.nameTh}</div>
                    </div>
                    {alreadyAdded ? (
                      <span className="text-[10px] text-gray-400 flex-shrink-0">เพิ่มแล้ว</span>
                    ) : (
                      <Plus className="w-4 h-4 text-vet-teal flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {showDropdown && searchQuery.trim() && filteredIcd.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-sm text-gray-400">
              ไม่พบรหัส ICD หรือชื่อโรคที่ค้นหา
            </div>
          )}
        </div>

        {/* Diagnosis table */}
        {diagnoses.length > 0 && (
          <div className="space-y-2">
            {diagnoses.map((d, idx) => (
              <div
                key={d.id}
                className="rounded-xl border border-gray-200 bg-white hover:border-vet-teal/40 hover:shadow-sm transition-all overflow-hidden group"
              >
                {/* Header: ICD badge + Disease name + Diag type + delete */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-100 bg-gradient-to-r from-purple-50/40 to-transparent">
                  <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums" style={{ fontWeight: 600 }}>#{idx + 1}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[11px] flex-shrink-0 tracking-wide" style={{ fontWeight: 700 }}>
                    {d.icd}
                  </span>
                  <span className="text-sm text-gray-800 truncate flex-1" style={{ fontWeight: 500 }}>{d.diseaseName}</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-vet-teal/10 text-vet-teal text-[11px] flex-shrink-0" style={{ fontWeight: 700 }}>{d.diagType}</span>
                  <button
                    onClick={() => removeDiagnosis(d.id)}
                    className="p-1 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Body: compact two-row layout */}
                <div className="px-3.5 py-2.5 space-y-2">
                  {/* Row 1: ชนิดการวินิจฉัย + ความสำคัญ */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 flex-shrink-0" style={{ fontWeight: 600 }}>ชนิด</span>
                      <select
                        value={d.diagType}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const found = diagTypes.find((dt) => dt.value === val);
                          updateDiagType(d.id, val, found?.label || "");
                        }}
                        className="text-xs bg-gray-50/80 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-vet-teal/20 focus:border-vet-teal text-gray-700 cursor-pointer flex-1 min-w-0 transition-colors"
                      >
                        {diagTypes.map((dt) => (
                          <option key={dt.value} value={dt.value}>
                            {dt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="w-px h-4 bg-gray-200 flex-shrink-0" />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-gray-400" style={{ fontWeight: 600 }}>ลำดับ</span>
                      <input
                        type="text"
                        defaultValue={d.priority}
                        className="w-14 text-xs text-center bg-gray-50/80 border border-gray-200 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-vet-teal/20 focus:border-vet-teal transition-colors"
                        placeholder="-"
                      />
                    </div>
                  </div>
                  {/* Row 2: ผู้วินิจฉัย + รหัส + License */}
                  <div className="flex items-center gap-2 pt-1.5 border-t border-gray-50 text-[10px] text-gray-400 flex-wrap">
                    <span style={{ fontWeight: 600 }}>ผู้วินิจฉัย</span>
                    <span className="text-xs text-gray-700" style={{ fontWeight: 500 }}>{d.diagnoser}</span>
                    <span className="w-px h-3 bg-gray-200" />
                    <span className="text-gray-600 px-1 py-0.5 bg-gray-100 rounded text-[11px]" style={{ fontWeight: 500 }}>{d.diagnoserCode}</span>
                    <span className="w-px h-3 bg-gray-200" />
                    <span style={{ fontWeight: 600 }}>Lic.</span>
                    <span className="text-gray-600 px-1 py-0.5 bg-gray-100 rounded text-[11px]" style={{ fontWeight: 500 }}>{d.licenseNo || "-"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {diagnoses.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>ยังไม่มีการวินิจฉัย</p>
            <p className="text-[10px] mt-1">ค้นหาชื่อโรค หรือรหัส ICD-10 เพื่อเพิ่มการวินิจฉัย</p>
          </div>
        )}
      </div>

      {/* ── Section: บันทึกการวินิจฉัย (Dx Text) ── */}
      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-emerald-50/30 to-white p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-emerald-400" />
          <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>บันทึกการวินิจฉัย</span>
          <span className="text-[10px] text-gray-400">Diagnosis Notes (Free Text)</span>
        </div>
        <textarea
          value={dxText}
          onChange={(e) => setDxText(e.target.value)}
          rows={4}
          placeholder="บันทึกรายละเอียดการวินิจฉัยเพิ่มเติม เช่น อาการ สาเหตุที่สงสัย ข้อสังเกต แผนการรักษา..."
          className={textareaCls}
        />
        {dxText.trim() && (
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span>{dxText.trim().length} ตัวอักษร</span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-end pt-3 border-t border-[rgba(52,199,89,0.2)]">
        <button
          className="vet-btn vet-btn-primary btn-green"
          onClick={() => showSnackbar("success", "บันทึกการวินิจฉัยสำเร็จแล้ว")}
        >
          บันทึกการวินิจฉัย
        </button>
      </div>
    </div>
  );
}