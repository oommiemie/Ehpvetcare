import { useState, useMemo } from "react";
import { Pencil, Pill, Calculator, Calendar, Plus, Check, CalendarPlus } from "lucide-react";
import { DatePickerModern } from "../DatePickerModern";
import { useIPD, type DrugRoute, type DrugFrequency } from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { drugCatalog } from "../AddDrugModal";

const ROUTES: DrugRoute[] = ["PO", "IV", "IM", "SC", "Topical", "Inhalation", "PR", "Other"];
const FREQUENCIES: DrugFrequency[] = ["q24h", "q12h", "q8h", "q6h", "q4h", "PRN", "Continuous", "Once"];

const frequencyHours: Record<DrugFrequency, number> = {
  "q24h": 24, "q12h": 12, "q8h": 8, "q6h": 6, "q4h": 4, "PRN": 0, "Continuous": 0, "Once": 0,
};

const fieldCls = "w-full text-[12.5px] text-gray-700 rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-[#19a589]";

const thaiDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  const M = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear() + 543}`;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const dayDiff = (a: string, b: string) => {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000) + 1;
};

export function IPDMedicationOrderForm({ admitId, patientWeightKg = 0, onClose }: { admitId: number; patientWeightKg?: number; onClose?: () => void }) {
  const { addDrug, addMAR } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const orderedBy = user?.displayName ?? "เจ้าหน้าที่";

  // Form state
  const [drugId, setDrugId] = useState<number | null>(null);
  const [doseValue, setDoseValue] = useState("");          // numeric string, e.g. "0.02"
  const [doseUnit, setDoseUnit] = useState<"mg/kg" | "mg">("mg/kg");
  const [route, setRoute] = useState<DrugRoute>("IV");
  const [frequency, setFrequency] = useState<DrugFrequency>("q8h");
  const [duration, setDuration] = useState("3");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDays(todayISO(), 2));
  const [isPRN, setIsPRN] = useState(false);
  const [prnCondition, setPrnCondition] = useState("");
  const [note, setNote] = useState("");

  const selectedDrug = useMemo(() => drugCatalog.find(d => d.id === drugId), [drugId]);

  // Live mg calculation (only meaningful when unit = mg/kg)
  const doseNum = parseFloat(doseValue) || 0;
  const calcMg = doseUnit === "mg/kg" ? doseNum * patientWeightKg : doseNum;
  const calcLabel = doseUnit === "mg/kg"
    ? `${doseNum || 0} mg/kg × ${patientWeightKg || 0} kg = `
    : `${doseNum || 0} mg = `;

  // Sync end date when duration changes
  const handleDurationChange = (v: string) => {
    setDuration(v);
    const days = Math.max(1, parseInt(v) || 1);
    setEndDate(addDays(startDate, days - 1));
  };
  const handleStartChange = (v: string) => {
    setStartDate(v);
    const days = Math.max(1, parseInt(duration) || 1);
    setEndDate(addDays(v, days - 1));
  };
  const handleEndChange = (v: string) => {
    setEndDate(v);
    const d = dayDiff(startDate, v);
    if (d > 0) setDuration(String(d));
  };

  const totalDays = dayDiff(startDate, endDate);
  const canSubmit = !!selectedDrug && doseNum > 0;

  const reset = () => {
    setDrugId(null); setDoseValue(""); setDoseUnit("mg/kg"); setRoute("IV");
    setFrequency("q8h"); setDuration("3"); setStartDate(todayISO()); setEndDate(addDays(todayISO(), 2));
    setIsPRN(false); setPrnCondition(""); setNote("");
  };

  const handleSubmit = () => {
    if (!canSubmit || !selectedDrug) return;
    const days = Math.max(1, totalDays);
    const finalDose = doseUnit === "mg/kg"
      ? `${doseNum} mg/kg (${calcMg.toFixed(2)} mg)`
      : `${doseNum} mg`;

    // จำนวนเบิก/จ่าย (HOSxP) — คำนวณจากจำนวน dose ทั้งคอร์สอัตโนมัติ
    const schedHours = frequencyHours[frequency] ?? 0;
    const autoQty = !isPRN && frequency !== "Continuous" && frequency !== "Once" && schedHours > 0
      ? Math.floor((days * 24) / schedHours)
      : frequency === "Once" ? 1 : undefined;

    const newDrug = addDrug({
      admitId,
      orderedAt: new Date(`${startDate}T08:00:00`).toISOString(),
      orderedBy,
      drugName: selectedDrug.tradeName,
      strength: selectedDrug.genericName,
      dose: finalDose,
      route,
      frequency,
      durationDays: days,
      isPRN,
      isContinuous: frequency === "Continuous",
      isControlled: false,
      note: [isPRN && prnCondition ? `PRN: ${prnCondition}` : null, note].filter(Boolean).join(" · ") || undefined,
      active: true,
      qtyRequested: autoQty,
      qtyDispensed: autoQty,
      qtyUnit: "dose",
    });

    // Auto-generate MAR schedule
    if (!isPRN && frequency !== "Continuous" && frequency !== "Once") {
      const hours = frequencyHours[frequency];
      if (hours > 0) {
        const start = new Date(`${startDate}T08:00:00`);
        const totalDoses = Math.floor((days * 24) / hours);
        for (let i = 0; i < totalDoses; i++) {
          const sched = new Date(start.getTime() + i * hours * 60 * 60 * 1000);
          addMAR({ drugOrderId: newDrug.id, scheduledAt: sched.toISOString(), status: "Pending" });
        }
      }
    } else if (frequency === "Once") {
      addMAR({ drugOrderId: newDrug.id, scheduledAt: new Date(`${startDate}T08:00:00`).toISOString(), status: "Pending" });
    }

    showSnackbar("success", `เพิ่ม ${selectedDrug.tradeName} เข้าคำสั่งยาแล้ว`);
    reset();
    onClose?.();
  };

  return (
    <div className="space-y-4">
        {/* Drug */}
        <div>
          <label className="vet-label">เลือกยา (Drug) <span className="required">*</span></label>
          <select value={drugId ?? ""} onChange={e => setDrugId(e.target.value ? parseInt(e.target.value) : null)} className="vet-select" style={{ fontWeight: drugId ? 600 : 400, color: drugId ? "#111827" : "#9ca3af" }}>
            <option value="">— เลือกจากตำรับยา —</option>
            {drugCatalog.map(d => <option key={d.id} value={d.id}>{d.genericName} · {d.tradeName}</option>)}
          </select>
        </div>

        {/* Dose + Route */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="vet-label">ขนาดยา (Dose) <span className="required">*</span></label>
            <div className="flex items-stretch rounded-full border-[1.5px] border-gray-200 overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-[#19a589]" style={{ height: 40 }}>
              <input type="number" step="any" min={0} value={doseValue} onChange={e => setDoseValue(e.target.value)} placeholder="0.02" className="flex-1 min-w-0 text-[13px] text-gray-800 px-4 bg-transparent focus:outline-none" style={{ fontWeight: 500 }} />
              <select value={doseUnit} onChange={e => setDoseUnit(e.target.value as "mg/kg" | "mg")} className="text-[12px] text-gray-600 bg-white border-l border-gray-200 px-3 focus:outline-none appearance-none cursor-pointer" style={{ fontWeight: 600 }}>
                <option value="mg/kg">mg/kg</option>
                <option value="mg">mg</option>
              </select>
            </div>
          </div>
          <div>
            <label className="vet-label">ช่องทาง (Route) <span className="required">*</span></label>
            <select value={route} onChange={e => setRoute(e.target.value as DrugRoute)} className="vet-select" style={{ fontWeight: 600 }}>
              {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Live calc strip */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px]" style={{ background: "rgba(25,165,137,0.10)", border: "1px solid rgba(25,165,137,0.25)", color: "#0d7c66", fontWeight: 600 }}>
          <Calculator className="w-3.5 h-3.5" />
          {calcLabel}<span style={{ fontWeight: 800 }}>{calcMg ? `${calcMg.toLocaleString(undefined, { maximumFractionDigits: 3 })} mg` : "0 mg"}</span>
        </div>

        {/* Frequency + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="vet-label">ความถี่ (Frequency) <span className="required">*</span></label>
            <select value={frequency} onChange={e => setFrequency(e.target.value as DrugFrequency)} className="vet-select" style={{ fontWeight: 600 }}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="vet-label">ระยะเวลา (วัน)</label>
            <div className="flex items-stretch rounded-full border-[1.5px] border-gray-200 overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-[#19a589]" style={{ height: 40 }}>
              <input type="number" min={1} value={duration} onChange={e => handleDurationChange(e.target.value)} className="flex-1 min-w-0 text-[13px] text-gray-800 px-4 bg-transparent focus:outline-none" style={{ fontWeight: 500 }} />
              <span className="text-[12px] text-gray-500 bg-white border-l border-gray-200 px-4 flex items-center" style={{ fontWeight: 600 }}>วัน</span>
            </div>
          </div>
        </div>

        {/* Start + End dates — Thai BE format via DatePickerModern */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="vet-label">วันที่เริ่มใช้ยา (Start) <span className="required">*</span></label>
            <DatePickerModern value={startDate} onChange={handleStartChange} placeholder="เลือกวันเริ่ม" />
          </div>
          <div>
            <label className="vet-label">วันสิ้นสุด (End)</label>
            <DatePickerModern value={endDate} onChange={handleEndChange} placeholder="เลือกวันสิ้นสุด" />
          </div>
        </div>

        {/* Date range chip */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px]" style={{ background: "rgba(25,165,137,0.06)", border: "1px solid rgba(25,165,137,0.20)", color: "#0d7c66" }}>
          <Calendar className="w-3.5 h-3.5" />
          <span style={{ fontWeight: 600 }}>{thaiDate(startDate)} – {thaiDate(endDate)} · รวม {totalDays} วัน</span>
          {frequency === "Continuous" && (
            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px]" style={{ fontWeight: 700, background: "rgba(25,165,137,0.18)", color: "#0d7c66" }}>ต่อเนื่อง</span>
          )}
          {frequency === "Once" && (
            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px]" style={{ fontWeight: 700, background: "rgba(245,158,11,0.18)", color: "#b45309" }}>ครั้งเดียว</span>
          )}
        </div>

        {/* PRN */}
        <div>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <span className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isPRN ? "bg-[#19a589]" : "bg-white border border-gray-300"}`}>
              {isPRN && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </span>
            <span className="text-[12.5px] text-gray-700" style={{ fontWeight: 600 }}>ให้เมื่อจำเป็น (PRN) — ระบุเงื่อนไข</span>
            <input type="checkbox" checked={isPRN} onChange={e => setIsPRN(e.target.checked)} className="hidden" />
          </label>
          {isPRN && (
            <input value={prnCondition} onChange={e => setPrnCondition(e.target.value)} placeholder="เช่น ปวด ≥ 5/10, อาเจียน, อุณหภูมิ > 103°F" className="vet-input mt-2" />
          )}
        </div>

        {/* Note */}
        <div>
          <label className="vet-label">หมายเหตุการสั่ง</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="เช่น ให้ช้าๆ over 5 นาที, เฝ้าระวังความดัน" className="vet-textarea" />
        </div>

        {/* Footer action */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={!canSubmit} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> เพิ่มคำสั่งยา
          </button>
        </div>
    </div>
  );
}
