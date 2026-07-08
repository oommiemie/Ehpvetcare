import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown, ChevronUp, Clock, Stethoscope, Syringe,
  Pill, FlaskConical, FileText, Activity, Calendar,
  CheckCircle2, Thermometer, Bug,
} from "lucide-react";
import { type DewormingRecord } from "./DewormingTab";
import { findAnimal, findAnimalByHN, type PetVisit } from "../data/animals";

/* ─────────────────────── Types ─────────────────────── */
interface PastVisit {
  id: number;
  date: string;
  type: string;
  doctor: string;
  status: string;
  summary: string;
  vitals: { temp: string; pulse: string; weight: string };
  diagnoses: string[];
  vaccines: string[];
  drugs: string[];
  labs: string[];
}

/* ─────────────────────── Registry → PastVisit mapping ─────────────────────── */
const TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

/* แปลงวันที่แบบไทย "12 เม.ย. 2569" → { display: "12/04/2569", sortKey } ให้ตรงกับที่ component ใช้ split("/") */
function parseThaiVisitDate(s: string): { display: string; sortKey: number } {
  const parts = (s || "").trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monIdx = TH_MONTHS.indexOf(parts[1]);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monIdx >= 0 && !isNaN(year)) {
      return {
        display: `${String(day).padStart(2, "0")}/${String(monIdx + 1).padStart(2, "0")}/${year}`,
        sortKey: year * 10000 + (monIdx + 1) * 100 + day,
      };
    }
  }
  return { display: s || "—", sortKey: 0 };
}

/* จัดหมวดชนิดการรักษาให้ตรงกับ typeConfig (วัคซีน / ตรวจสุขภาพ / การรักษา) */
function deriveVisitType(v: PetVisit): string {
  const hay = `${v.type} ${v.chiefComplaint} ${v.treatment} ${v.diagnosis}`;
  if (hay.includes("วัคซีน")) return "วัคซีน";
  if (v.diagnosis.includes("สุขภาพดี") || hay.includes("ตรวจสุขภาพ") || hay.includes("Healthy") || hay.includes("health check")) return "ตรวจสุขภาพ";
  return "การรักษา";
}

/* map PetVisit จากทะเบียนจริง → PastVisit ที่ component เรนเดอร์ (เรียงใหม่ → เก่า) */
function mapVisitHistory(history: PetVisit[]): PastVisit[] {
  return [...history]
    .map(v => ({ v, d: parseThaiVisitDate(v.date) }))
    .sort((a, b) => b.d.sortKey - a.d.sortKey)
    .map(({ v, d }): PastVisit => ({
      id: v.id,
      date: d.display,
      type: deriveVisitType(v),
      doctor: v.vet || "—",
      status: "เสร็จสิ้น",
      summary: v.chiefComplaint || v.diagnosis || v.treatment || "—",
      vitals: { temp: "—", pulse: "—", weight: v.weight || "—" },
      diagnoses: v.diagnosis ? [v.diagnosis] : [],
      vaccines: [],
      drugs: v.medications ?? [],
      labs: [],
    }));
}

/* ─────────────────────── Helpers ─────────────────────── */
const typeConfig: Record<string, { emoji: string; bg: string; text: string }> = {
  "วัคซีน":     { emoji: "💉", bg: "bg-purple-50", text: "text-purple-600" },
  "การรักษา":   { emoji: "🩺", bg: "bg-orange-50", text: "text-orange-600" },
  "ตรวจสุขภาพ": { emoji: "📋", bg: "bg-blue-50", text: "text-blue-600" },
};

function loadDewormingHistory(hn?: string): DewormingRecord[] {
  if (!hn) return [];
  try {
    const raw = localStorage.getItem(`vet-pet-deworming-${hn}`);
    if (raw) return JSON.parse(raw) as DewormingRecord[];
  } catch { /* ignore */ }
  return [];
}

function thaiShortDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/* ─────────────────────── Component ─────────────────────── */
export function EMRHistorySummary({ petName, hn }: { petName: string; hn?: string }) {
  const visits = useMemo<PastVisit[]>(() => {
    const pet = (hn ? findAnimalByHN(hn) : undefined) ?? findAnimal(petName);
    return pet ? mapVisitHistory(pet.visitHistory) : [];
  }, [petName, hn]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const dewormingHistory = useMemo(() => {
    const list = loadDewormingHistory(hn);
    return [...list].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }, [hn]);

  return (
    <section
      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
    >
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
          <FileText className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>ประวัติเวชระเบียน</h3>
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px]"
              style={{ background: "rgba(25,165,137,0.10)", color: "#0d7c66", fontWeight: 700, border: "1px solid rgba(25,165,137,0.20)" }}
            >
              {visits.length} ครั้ง
            </span>
          </div>
          <p className="text-[11px] text-gray-500">EMR History — รายละเอียดการรักษาทั้งหมด</p>
        </div>
      </div>

      {/* Deworming history block (from localStorage) */}
      {dewormingHistory.length > 0 && (
        <div className="px-4 pt-3">
          <div className="rounded-2xl border border-gray-100 overflow-hidden" style={{ background: "rgba(5,150,105,0.04)" }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-100/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
                  <Bug className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>ประวัติถ่ายพยาธิ</p>
                  <p className="text-[10px] text-gray-500" style={{ fontWeight: 500 }}>Deworming History · {dewormingHistory.length} ครั้ง</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 700 }}>
                ล่าสุด {thaiShortDate(dewormingHistory[0].date)}
              </span>
            </div>
            <div className="divide-y divide-emerald-100/40 max-h-[200px] overflow-y-auto">
              {dewormingHistory.map(d => (
                <div key={d.id} className="px-3 py-2 flex items-center gap-3 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>
                      {d.productName} <span className="text-[10.5px] text-gray-500" style={{ fontWeight: 500 }}>· {d.brand || "—"}</span>
                    </p>
                    <p className="text-[10.5px] text-gray-500 truncate">
                      {thaiShortDate(d.date)} · พยาธิ{d.type} · {d.route}
                      {d.nextAppointmentDate && ` · นัดถัดไป ${thaiShortDate(d.nextAppointmentDate)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-2">
      {visits.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p style={{ fontWeight: 600 }}>ยังไม่มีประวัติการรักษา</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visits.map((v) => {
            const tc = typeConfig[v.type] ?? typeConfig["การรักษา"];
            const isOpen = expandedId === v.id;
            const hasDiag = v.diagnoses.length > 0;
            const hasDrugs = v.drugs.length > 0;
            const hasVax = v.vaccines.length > 0;
            const hasLabs = v.labs.length > 0;

            return (
              <div key={v.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden transition-all">
                {/* Collapsed row */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : v.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-all duration-200 group ${
                    isOpen
                      ? "bg-gradient-to-r from-[#19a589]/[0.06] to-transparent"
                      : "hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-transparent"
                  }`}
                >
                  {/* Date column — card style */}
                  <div
                    className="flex flex-col items-center justify-center flex-shrink-0 w-[56px] h-[56px] rounded-2xl border transition-all duration-200"
                    style={{
                      background: isOpen
                        ? "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)"
                        : "linear-gradient(135deg, #f8fafb 0%, #f1f5f4 100%)",
                      borderColor: isOpen ? "rgba(25,165,137,0.3)" : "rgba(0,0,0,0.04)",
                      boxShadow: isOpen ? "0 2px 8px rgba(25,165,137,0.18)" : "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span
                      className={`text-[16px] leading-none ${isOpen ? "text-white" : "text-gray-700"}`}
                      style={{ fontWeight: 700 }}
                    >
                      {v.date.split("/")[0]}
                    </span>
                    <span
                      className={`text-[11px] leading-[1.5] mt-0.5 ${isOpen ? "text-white/75" : "text-gray-400"}`}
                      style={{ fontWeight: 500 }}
                    >
                      {(() => {
                        const m = parseInt(v.date.split("/")[1], 10);
                        const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                        return `${months[m - 1]} ${v.date.split("/")[2]}`;
                      })()}
                    </span>
                  </div>

                  {/* Timeline connector */}
                  <div className="flex flex-col items-center flex-shrink-0 self-stretch py-1">
                    
                    <div
                      className="w-px flex-1 mt-1"
                      style={{
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.08), transparent)",
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] leading-[1.6] px-2.5 py-[3px] rounded-full border ${tc.bg} ${tc.text}`}
                        style={{
                          fontWeight: 600,
                          borderColor: v.type === "วัคซีน"
                            ? "rgba(167,139,250,0.25)"
                            : v.type === "การรักษา"
                            ? "rgba(251,146,60,0.25)"
                            : "rgba(96,165,250,0.25)",
                        }}
                      >
                        {tc.emoji} {v.type}
                      </span>
                      <span className="text-[12px] leading-[1.6] text-gray-400 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />{v.doctor}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] leading-[1.6] text-[#19a589]/60 ml-auto">
                        <CheckCircle2 className="w-3 h-3" />
                        <span style={{ fontWeight: 500 }}>{v.status}</span>
                      </span>
                    </div>
                    <p className="text-[13px] leading-[1.6] text-gray-700 mt-1.5 line-clamp-2" style={{ fontWeight: 500 }}>
                      {v.summary}
                    </p>
                    {/* Quick tags */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {hasDiag && (
                        <span className="inline-flex items-center gap-1 text-[11px] leading-[1.6] text-orange-500 bg-orange-50 px-2 py-[3px] rounded-full border border-orange-100/60" style={{ fontWeight: 500 }}>
                          <FileText className="w-3 h-3" />{v.diagnoses.length} วินิจฉัย
                        </span>
                      )}
                      {hasDrugs && (
                        <span className="inline-flex items-center gap-1 text-[11px] leading-[1.6] text-blue-500 bg-blue-50 px-2 py-[3px] rounded-full border border-blue-100/60" style={{ fontWeight: 500 }}>
                          <Pill className="w-3 h-3" />{v.drugs.length} รายการยา
                        </span>
                      )}
                      {hasVax && (
                        <span className="inline-flex items-center gap-1 text-[11px] leading-[1.6] text-purple-500 bg-purple-50 px-2 py-[3px] rounded-full border border-purple-100/60" style={{ fontWeight: 500 }}>
                          <Syringe className="w-3 h-3" />{v.vaccines.length} วัคซีน
                        </span>
                      )}
                      {hasLabs && (
                        <span className="inline-flex items-center gap-1 text-[11px] leading-[1.6] text-teal-500 bg-teal-50 px-2 py-[3px] rounded-full border border-teal-100/60" style={{ fontWeight: 500 }}>
                          <FlaskConical className="w-3 h-3" />{v.labs.length} แล็บ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand icon */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isOpen
                        ? "bg-[#19a589]/10 text-[#19a589]"
                        : "bg-gray-100/80 text-gray-400 group-hover:bg-gray-200/60"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-3 border-t border-gray-100/80 space-y-3">
                        {/* Vitals mini row */}
                        <div className="rounded-2xl p-3" style={{ background: "linear-gradient(135deg, #f0fdf8 0%, #ecfdf5 50%, #f0f9ff 100%)" }}>
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)" }}>
                              <Activity className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[12px] leading-[1.6] text-[#0d7c66]" style={{ fontWeight: 600 }}>สัญญาณชีพ</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/80 backdrop-blur rounded-xl px-3 py-2.5 text-center border border-white">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Thermometer className="w-3 h-3 text-red-400" />
                                <span className="text-[11px] leading-[1.6] text-gray-400" style={{ fontWeight: 500 }}>อุณหภูมิ</span>
                              </div>
                              <span className="text-[13px] leading-[1.5] text-gray-800" style={{ fontWeight: 600 }}>{v.vitals.temp}</span>
                            </div>
                            <div className="bg-white/80 backdrop-blur rounded-xl px-3 py-2.5 text-center border border-white">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Activity className="w-3 h-3 text-pink-400" />
                                <span className="text-[11px] leading-[1.6] text-gray-400" style={{ fontWeight: 500 }}>ชีพจร</span>
                              </div>
                              <span className="text-[13px] leading-[1.5] text-gray-800" style={{ fontWeight: 600 }}>{v.vitals.pulse}</span>
                            </div>
                            <div className="bg-white/80 backdrop-blur rounded-xl px-3 py-2.5 text-center border border-white">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-[11px] text-blue-400">&#9878;</span>
                                <span className="text-[11px] leading-[1.6] text-gray-400" style={{ fontWeight: 500 }}>น้ำหนัก</span>
                              </div>
                              <span className="text-[13px] leading-[1.5] text-gray-800" style={{ fontWeight: 600 }}>{v.vitals.weight}</span>
                            </div>
                          </div>
                        </div>

                        {/* Diagnoses */}
                        {hasDiag && (
                          <div className="rounded-2xl p-3 bg-orange-50/60 border border-orange-100/50">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)" }}>
                                <FileText className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-[12px] leading-[1.6] text-orange-700" style={{ fontWeight: 600 }}>การวินิจฉัย</span>
                            </div>
                            <div className="space-y-1.5">
                              {v.diagnoses.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-2.5 py-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                  <span className="text-[12px] leading-[1.6] text-gray-700" style={{ fontWeight: 500 }}>{d}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vaccines */}
                        {hasVax && (
                          <div className="rounded-2xl p-3 bg-purple-50/60 border border-purple-100/50">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
                                <Syringe className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-[12px] leading-[1.6] text-purple-700" style={{ fontWeight: 600 }}>วัคซีน</span>
                            </div>
                            <div className="space-y-1.5">
                              {v.vaccines.map((vx, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-2.5 py-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                  <span className="text-[12px] leading-[1.6] text-gray-700" style={{ fontWeight: 500 }}>{vx}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Drugs */}
                        {hasDrugs && (
                          <div className="rounded-2xl p-3 bg-blue-50/60 border border-blue-100/50">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                                <Pill className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-[12px] leading-[1.6] text-blue-700" style={{ fontWeight: 600 }}>ยาที่ได้รับ</span>
                            </div>
                            <div className="space-y-1.5">
                              {v.drugs.map((dr, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-2.5 py-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                  <span className="text-[12px] leading-[1.6] text-gray-700" style={{ fontWeight: 500 }}>{dr}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Labs */}
                        {hasLabs && (
                          <div className="rounded-2xl p-3 bg-teal-50/60 border border-teal-100/50">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                                <FlaskConical className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-[12px] leading-[1.6] text-teal-700" style={{ fontWeight: 600 }}>ผลแล็บ</span>
                            </div>
                            <div className="space-y-1.5">
                              {v.labs.map((l, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-2.5 py-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                                  <span className="text-[12px] leading-[1.6] text-gray-700" style={{ fontWeight: 500 }}>{l}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </section>
  );
}
