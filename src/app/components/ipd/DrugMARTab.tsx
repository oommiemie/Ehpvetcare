import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Pill, Plus, X, Check, AlertTriangle, Lock, Ban, Clock, History, ChevronRight,
  Stethoscope, Printer, Droplet, CalendarPlus, Pencil, Trash2,
} from "lucide-react";
import { useIPD, type DrugOrder, type DrugRoute, type DrugFrequency, type MARRecord } from "../../contexts/IPDContext";
import { IPDMedicationOrderForm } from "./IPDMedicationOrderForm";
import { IPDDailyOrdersView } from "./IPDDailyOrdersView";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });

/* หน่วยจ่ายยา (store room) + จำนวนคงเหลือ mock ต่อคลัง (deterministic ตามชื่อยา) */
export const DISPENSE_ROOMS = ["คลังยา/เวชภัณฑ์ (Pharmacy)", "คลังหลัก (Main)", "คลังหน้าร้าน (Front Store)", "ตู้ยาฉุกเฉิน (ER Box)"];
export function mockStockRemaining(drugName: string, room: string): number {
  let h = 0;
  const key = drugName + room;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 997;
  return 20 + (h % 130);   // 20–149 หน่วย
}
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

const routes: DrugRoute[] = ["PO", "IV", "IM", "SC", "Topical", "Inhalation", "PR", "Other"];
const frequencies: DrugFrequency[] = ["q24h", "q12h", "q8h", "q6h", "q4h", "PRN", "Continuous", "Once"];

const frequencyHours: Record<DrugFrequency, number> = {
  "q24h": 24, "q12h": 12, "q8h": 8, "q6h": 6, "q4h": 4, "PRN": 0, "Continuous": 0, "Once": 0,
};

/* Common allergens for demo Drug Allergy Check */
const COMMON_ALLERGENS = ["Penicillin", "Amoxicillin", "Sulfa", "Penicillin G", "เพนิซิลิน"];

export function DrugMARTab({ admitId, petAllergies, patientWeightKg = 0 }: { admitId: number; petAllergies?: string; patientWeightKg?: number }) {
  const { drugs, mar, admits, discontinueDrug, administerMAR, addMAR, deleteMAR, updateDrug } = useIPD();
  const { user: authUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [tab, setTab] = useState<"orders" | "mar">("orders");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [editingDrug, setEditingDrug] = useState<DrugOrder | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  const administerWithFeedback = (id: number, by: string, note?: string) => {
    administerMAR(id, by, note);
    showSnackbar("success", "ติ๊กให้ยาสำเร็จ");
  };
  const pushToToday = (d: DrugOrder) => {
    // Build today's MAR schedule based on the order's frequency
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const hours = frequencyHours[d.frequency] || 0;
    if (d.frequency === "PRN") { showSnackbar("warning", "ยา PRN ไม่มีตารางตายตัว — ให้เมื่อจำเป็น"); return; }
    if (d.frequency === "Continuous") { showSnackbar("info", `${d.drugName} เป็นยาต่อเนื่อง แสดงในแบนเนอร์รายวันแล้ว`); return; }
    if (hours === 0 || d.frequency === "Once") {
      addMAR({ drugOrderId: d.id, scheduledAt: new Date(`${today}T08:00:00`).toISOString(), status: "Pending" });
      showSnackbar("success", `เพิ่ม ${d.drugName} เข้าตารางวันนี้`);
      return;
    }
    const dosesPerDay = Math.floor(24 / hours);
    const startHour = 8;
    for (let i = 0; i < dosesPerDay; i++) {
      const h = (startHour + i * hours) % 24;
      const hh = String(h).padStart(2, "0");
      addMAR({ drugOrderId: d.id, scheduledAt: new Date(`${today}T${hh}:00:00`).toISOString(), status: "Pending" });
    }
    showSnackbar("success", `เพิ่ม ${d.drugName} เข้าตารางวันนี้ (${dosesPerDay} dose)`);
  };

  const askDiscontinue = async (d: DrugOrder) => {
    const ok = await confirm({
      title: `Discontinue ${d.drugName}?`,
      description: `${d.dose} · ${d.route} ${d.frequency} — จะหยุดให้ยานี้ทันที`,
      confirmLabel: "Discontinue",
      kind: "danger",
    });
    if (ok) {
      discontinueDrug(d.id);
      showSnackbar("info", `Discontinue ${d.drugName} แล้ว`);
    }
  };

  const askDeleteMAR = async (m: MARRecord, drugName: string) => {
    const ok = await confirm({
      title: "ลบรายการให้ยา (MAR)",
      description: `ลบกำหนดให้ยา ${drugName} · ${fmtDateTime(m.scheduledAt)} ออกจากตาราง?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    deleteMAR(m.id);
    showSnackbar("delete", "ลบรายการให้ยาแล้ว");
  };

  const currentAdmit = admits.find(a => a.id === admitId);
  const patientDrugs = useMemo(() => drugs.filter(d => d.admitId === admitId).sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)), [drugs, admitId]);
  const activeDrugs = patientDrugs.filter(d => d.active);
  const patientMAR = useMemo(() => {
    const drugIds = new Set(patientDrugs.map(d => d.id));
    return mar.filter(m => drugIds.has(m.drugOrderId)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [mar, patientDrugs]);

  const pendingMAR = patientMAR.filter(m => m.status === "Pending").length;
  const lateMAR = patientMAR.filter(m => m.status === "Pending" && new Date(m.scheduledAt).getTime() < Date.now()).length;

  // History grouped by past visit
  const pastGroups = useMemo(() => {
    if (!currentAdmit) return [];
    const sameHNAdmits = admits
      .filter(a => a.hn === currentAdmit.hn && a.id !== admitId)
      .sort((a, b) => `${b.admitDate}T${b.admitTime}`.localeCompare(`${a.admitDate}T${a.admitTime}`));
    return sameHNAdmits
      .map(a => ({
        admit: a,
        items: drugs.filter(d => d.admitId === a.id).sort((x, y) => y.orderedAt.localeCompare(x.orderedAt)),
      }))
      .filter(g => g.items.length > 0);
  }, [drugs, admits, admitId, currentAdmit]);
  const pastCount = pastGroups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="space-y-4">
      {/* Status strip */}
      <div className="grid grid-cols-3 gap-3">
        <StatusCard icon={Pill} label="ยาใช้งาน" value={activeDrugs.length} />
        <StatusCard icon={Clock} label="รอให้ยา" value={pendingMAR} />
        <StatusCard icon={AlertTriangle} label="เลยเวลา" value={lateMAR} alert={lateMAR > 0} />
      </div>

      {/* Current visit — LEFT card (orders + tabs) | RIGHT card (summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          {/* Header — title + segmented pill tabs + action all in one row */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80 flex-wrap">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
              <Pill className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))" }}>กำลังรักษา · Visit นี้</h3>
              <p className="text-[11px] text-gray-500">{activeDrugs.length} ยาใช้งาน · {patientMAR.length} dose schedule</p>
            </div>

            {/* Segmented pill tabs — animated sliding indicator */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
              {(["orders", "mar"] as const).map(t => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="relative flex items-center gap-1.5 px-4 py-2 text-[12.5px] rounded-full whitespace-nowrap transition-colors"
                    style={{
                      fontWeight: active ? 700 : 500,
                      color: active ? "#ffffff" : "#6a7282",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="drug-tab-pill"
                        transition={{ type: "spring", stiffness: 480, damping: 36 }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(135deg,#19a589,#0d7c66)",
                          boxShadow: "0 3px 10px rgba(25,165,137,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
                        }}
                      />
                    )}
                    <span className="relative z-10">
                      {t === "orders" ? `คำสั่งยา (${patientDrugs.length})` : `Daily (${patientMAR.length})`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4" style={{ maxHeight: 720, overflowY: "auto" }}>
            {tab === "orders" && (
              patientDrugs.length === 0 ? (
                <button
                  onClick={() => setShowNewOrder(true)}
                  className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <Pill className="w-10 h-10 mb-2" strokeWidth={1.5} />
                  <div className="text-[12px] mb-2" style={{ fontWeight: 600 }}>ยังไม่มีการสั่งยา</div>
                  <div className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#e8802a,#d06a1a)", fontWeight: 700 }}>
                    <Plus className="w-3 h-3" /> สั่งยาแรก
                  </div>
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11.5px] text-gray-500">{patientDrugs.length} รายการ</span>
                    <button onClick={() => setShowNewOrder(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> สั่งยา
                    </button>
                  </div>
                  <div className="space-y-2">
                    {patientDrugs.map((d, idx) => (
                      <DrugCard key={d.id} d={d} idx={idx} onEdit={() => setEditingDrug(d)} onDiscontinue={() => askDiscontinue(d)} onAddToToday={() => pushToToday(d)}
                        onDispense={() => {
                          updateDrug(d.id, { dispenseStatus: "dispensed", dispensedAt: new Date().toISOString(), dispensedBy: authUser?.displayName ?? "เจ้าหน้าที่", dispenseStoreRoom: d.dispenseStoreRoom ?? DISPENSE_ROOMS[0] });
                          showSnackbar("success", `จ่ายยา ${d.drugName} · ตัด Stock ${d.qtyDispensed ?? ""} ${d.qtyUnit ?? ""} จาก ${d.dispenseStoreRoom ?? DISPENSE_ROOMS[0]} แล้ว`);
                        }}
                        onCancelDispense={() => {
                          updateDrug(d.id, { dispenseStatus: "cancelled" });
                          showSnackbar("info", `ยกเลิกจ่ายยา ${d.drugName} · คืน ${d.qtyDispensed ?? ""} ${d.qtyUnit ?? ""} เข้า Stock แล้ว`);
                        }} />
                    ))}
                  </div>
                </>
              )
            )}

            {tab === "mar" && (
              <div className="space-y-4">
                <IPDDailyOrdersView
                  admitId={admitId}
                  patientWeightKg={patientWeightKg}
                  attendingDoctor={currentAdmit?.doctor}
                />

                {/* MAR records — full schedule list with administer + delete */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-3 py-2.5 flex items-center gap-2 border-b border-gray-100 bg-gray-50/60">
                    <History className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[12px] text-gray-700" style={{ fontWeight: 700 }}>รายการให้ยาทั้งหมด (MAR)</span>
                    <span className="text-[10.5px] text-gray-400 ml-auto">{patientMAR.length} รายการ</span>
                  </div>
                  {patientMAR.length === 0 ? (
                    <p className="text-[11.5px] text-gray-400 text-center py-6">ยังไม่มีรายการให้ยา</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[12px] min-w-[560px]">
                        <thead className="bg-gray-50/60 border-b border-gray-100">
                          <tr>
                            <th className="text-left px-3 py-2 text-[10.5px] text-gray-500" style={{ fontWeight: 700 }}>ยา</th>
                            <th className="text-left px-3 py-2 text-[10.5px] text-gray-500" style={{ fontWeight: 700 }}>กำหนดเวลา</th>
                            <th className="text-left px-3 py-2 text-[10.5px] text-gray-500" style={{ fontWeight: 700 }}>สถานะ</th>
                            <th className="text-left px-3 py-2 text-[10.5px] text-gray-500" style={{ fontWeight: 700 }}>ผู้ให้ยา</th>
                            <th className="text-right px-3 py-2 text-[10.5px] text-gray-500" style={{ fontWeight: 700 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientMAR.map(m => {
                            const drugName = patientDrugs.find(d => d.id === m.drugOrderId)?.drugName ?? "—";
                            return (
                              <MARRow
                                key={m.id}
                                m={m}
                                drugName={drugName}
                                onAdminister={administerWithFeedback}
                                onDelete={() => askDeleteMAR(m, drugName)}
                              />
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT — separate summary card (sibling of main section, always shown) */}
        <OrdersSummaryCard
          drugs={patientDrugs}
          activeCount={activeDrugs.length}
          marCount={patientMAR.length}
          attendingDoctor={currentAdmit?.doctor}
        />
      </div>

      {/* Edit-order popup — reuses the order form prefilled, updates in place */}
      <AnimatePresence>
        {editingDrug && (
          <DrugAddModal
            admitId={admitId}
            petAllergies={petAllergies}
            activeDrugs={activeDrugs.filter(d => d.id !== editingDrug.id)}
            editing={editingDrug}
            onClose={() => setEditingDrug(null)}
          />
        )}
      </AnimatePresence>

      {/* New-order popup — standard vet-modal */}
      <AnimatePresence>
        {showNewOrder && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowNewOrder(false)}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-[560px] shadow-2xl flex flex-col overflow-hidden"
              style={{ height: 720, maxHeight: "92vh" }}
              initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="vet-modal-header flex items-center gap-3">
                <div className="vet-modal-header-icon">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>สั่งยาใหม่</h3>
                  <p className="text-[11px] text-gray-500">เลือกยาจากตำรับ + ระบุขนาด/ความถี่/ระยะเวลา</p>
                </div>
                <button onClick={() => setShowNewOrder(false)} className="vet-modal-close">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="vet-modal-body">
                <IPDMedicationOrderForm
                  admitId={admitId}
                  patientWeightKg={patientWeightKg}
                  onClose={() => setShowNewOrder(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusCard({ icon: Ico, label, value, alert }: { icon: typeof Clock; label: string; value: number; alert?: boolean }) {
  const numColor = alert && value > 0 ? "#dc2626" : value > 0 ? "#111827" : "#9ca3af";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100">
          <Ico className="w-3.5 h-3.5 text-gray-600" strokeWidth={2.2} />
        </div>
        <span className="text-[10px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{label}</span>
        {alert && value > 0 && <AlertTriangle className="w-3 h-3 text-rose-500 ml-auto" />}
      </div>
      <div style={{ fontSize: "calc(22px * var(--fs))", fontWeight: 800, color: numColor, letterSpacing: "-0.5px" }}>{value}</div>
    </div>
  );
}

function DrugCard({ d, idx, onEdit, onDiscontinue, onAddToToday, onDispense, onCancelDispense }: { d: DrugOrder; idx: number; onEdit: () => void; onDiscontinue: () => void; onAddToToday?: () => void; onDispense?: () => void; onCancelDispense?: () => void }) {
  return (
    <div className="p-3 rounded-2xl border" style={{ borderColor: d.active ? "#e5e7eb" : "rgba(239,68,68,0.20)", background: d.active ? "rgba(249,250,251,0.5)" : "rgba(239,68,68,0.03)", opacity: d.active ? 1 : 0.7 }}>
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[11px] bg-gray-100 text-gray-600 flex-shrink-0" style={{ fontWeight: 800 }}>
          #{idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>{d.drugName}</span>
            {d.strength && <span className="text-[10.5px] text-gray-500">{d.strength}</span>}
            <span className="text-[10px] text-sky-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.10)", fontWeight: 700 }}>{d.route}</span>
            <span className="text-[10px] text-purple-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.10)", fontWeight: 700 }}>{d.frequency}</span>
            {d.isPRN && <span className="text-[10px] text-amber-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.10)", fontWeight: 700 }}>PRN</span>}
            {d.isContinuous && <span className="text-[10px] text-blue-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.10)", fontWeight: 700 }}>CRI</span>}
            {d.isControlled && (
              <span className="text-[10px] text-rose-700 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5" style={{ background: "rgba(239,68,68,0.10)", fontWeight: 700 }}>
                <Lock className="w-2.5 h-2.5" /> Controlled
              </span>
            )}
            {!d.active && (
              <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)", fontWeight: 700 }}>ยกเลิกแล้ว</span>
            )}
          </div>
          <div className="text-[11.5px] text-gray-600 mt-0.5">
            {d.dose}
            {d.durationDays && ` · Day ${d.durationDays}`}
          </div>
          {/* เบิก/จ่าย/ราคา แบบ HOSxP (แสดงเมื่อออเดอร์มีข้อมูล) */}
          {(d.qtyRequested != null || d.qtyDispensed != null) && (
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded-full bg-gray-100" style={{ fontWeight: 600 }}>
                เบิก <span style={{ fontWeight: 700 }}>{d.qtyRequested ?? "—"}</span> {d.qtyUnit ?? ""}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                fontWeight: 700,
                background: (d.qtyDispensed ?? d.qtyRequested) !== d.qtyRequested ? "rgba(234,88,12,0.10)" : "rgba(25,165,137,0.08)",
                color: (d.qtyDispensed ?? d.qtyRequested) !== d.qtyRequested ? "#c2410c" : "#0d7c66",
              }}>
                จ่าย {d.qtyDispensed ?? d.qtyRequested ?? "—"} {d.qtyUnit ?? ""}
              </span>
              {d.pricePerUnit != null && (
                <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded-full bg-gray-100" style={{ fontWeight: 600 }}>
                  ฿{d.pricePerUnit}/{d.qtyUnit ?? "หน่วย"}
                </span>
              )}
            </div>
          )}
          <div className="text-[10.5px] text-gray-500 mt-0.5">สั่งโดย {d.orderedBy} · {fmtDateTime(d.orderedAt)}</div>
          {/* หน่วยจ่าย + สถานะการจ่ายยา/ตัดสต๊อก */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {d.dispenseStoreRoom && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600" style={{ fontWeight: 600 }}>
                หน่วยจ่าย: {d.dispenseStoreRoom}
              </span>
            )}
            {d.dispenseStatus === "dispensed" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700, background: "rgba(22,163,74,0.10)", color: "#15803d" }}>
                ✓ รับยาแล้ว · ตัดสต๊อก {d.dispensedAt ? fmtDateTime(d.dispensedAt) : ""}{d.dispensedBy ? ` · ${d.dispensedBy}` : ""}
              </span>
            )}
            {d.dispenseStatus === "cancelled" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700, background: "rgba(244,63,94,0.10)", color: "#e11d48" }}>
                ยกเลิกจ่ายยา · คืน Stock แล้ว
              </span>
            )}
            {(d.returnedQty ?? 0) > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700, background: "rgba(245,158,11,0.10)", color: "#b45309" }}>
                คืนยา {d.returnedQty} {d.qtyUnit ?? ""} · คืน Stock แล้ว
              </span>
            )}
            {d.active && !d.dispenseStatus && (d.qtyDispensed ?? 0) > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600" style={{ fontWeight: 700 }}>รอจ่ายยา</span>
            )}
          </div>
          {d.note && <div className="text-[11px] text-gray-600 mt-1 italic">{d.note}</div>}
        </div>
        {d.active && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onAddToToday && (
              <button onClick={onAddToToday} className="text-[11px] px-2.5 py-1 rounded-full text-[#0d7c66] hover:bg-[#19a589]/10 inline-flex items-center gap-1" style={{ fontWeight: 600, border: "1px solid rgba(25,165,137,0.35)" }} title="เพิ่มเข้าตารางรายวันของวันนี้">
                <CalendarPlus className="w-3 h-3" /> เข้าวันนี้
              </button>
            )}
            {onDispense && !d.dispenseStatus && (d.qtyDispensed ?? 0) > 0 && (
              <button onClick={onDispense} className="text-[11px] px-2.5 py-1 rounded-full text-white inline-flex items-center gap-1" style={{ fontWeight: 700, background: "#19a589" }} title="บันทึกจ่ายยา + ตัด Stock จากหน่วยจ่าย">
                <Check className="w-3 h-3" /> ตัดสต๊อก·จ่ายยา
              </button>
            )}
            {onCancelDispense && d.dispenseStatus === "dispensed" && (
              <button onClick={onCancelDispense} className="text-[11px] px-2.5 py-1 rounded-full text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1" style={{ fontWeight: 600, border: "1px solid rgba(244,63,94,0.30)" }} title="ยกเลิกการจ่ายยา และคืนจำนวนเข้า Stock">
                <Ban className="w-3 h-3" /> ยกเลิกจ่าย·คืน Stock
              </button>
            )}
            <button onClick={onEdit} className="text-[11px] px-2.5 py-1 rounded-full text-sky-700 hover:bg-sky-50 inline-flex items-center gap-1" style={{ fontWeight: 600, border: "1px solid rgba(14,165,233,0.30)" }} title="แก้ไขคำสั่งยา">
              <Pencil className="w-3 h-3" /> แก้ไข
            </button>
            <button onClick={onDiscontinue} className="text-[11px] px-2.5 py-1 rounded-full text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
              <Ban className="w-3 h-3" /> Discontinue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VisitDrugGroup({ admit, items }: { admit: { id: number; admitDate: string; admitTime: string; diagnosis: string; doctor: string }; items: DrugOrder[] }) {
  const [open, setOpen] = useState(true);
  const visitDate = new Date(`${admit.admitDate}T${admit.admitTime}`);
  const yearTH = visitDate.getFullYear() + 543;
  const monthTH = visitDate.toLocaleDateString("th-TH", { month: "short" });
  const day = visitDate.getDate();
  const yearShort = String(yearTH).slice(-2);

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50/60 hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-white border border-gray-100 flex-shrink-0">
          <div className="text-[8px] text-gray-400 leading-none" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{monthTH}</div>
          <div className="text-[15px] text-gray-900 leading-none mt-0.5" style={{ fontWeight: 800 }}>{day}</div>
          <div className="text-[8px] text-gray-400 leading-none mt-0.5" style={{ fontWeight: 600 }}>'{yearShort}</div>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{admit.diagnosis}</span>
            <span className="text-[9.5px] text-gray-600 px-1.5 py-0.5 rounded-full bg-white border border-gray-200 flex-shrink-0" style={{ fontWeight: 700 }}>{items.length} ยา</span>
          </div>
          <div className="text-[10.5px] text-gray-500 truncate mt-0.5">{admit.doctor}</div>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} strokeWidth={2.2} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <ul className="divide-y divide-gray-100">
              {items.map(d => <PastDrugItem key={d.id} d={d} />)}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PastDrugItem({ d }: { d: DrugOrder }) {
  return (
    <li className="px-3 py-2.5">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
        <span className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{d.drugName}</span>
        {d.strength && <span className="text-[10px] text-gray-500 truncate">{d.strength}</span>}
        {d.isControlled && <Lock className="w-3 h-3 text-rose-500 flex-shrink-0" />}
        <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0" style={{ fontWeight: 600 }}>{fmtDate(d.orderedAt)}</span>
      </div>
      <div className="text-[11px] text-gray-600 pl-3.5">
        {d.dose} · <span className="text-sky-700" style={{ fontWeight: 600 }}>{d.route}</span> · <span className="text-purple-700" style={{ fontWeight: 600 }}>{d.frequency}</span>
        {d.durationDays ? ` · ${d.durationDays} วัน` : ""}
      </div>
    </li>
  );
}

function MARRow({ m, drugName, onAdminister, onDelete }: { m: MARRecord; drugName: string; onAdminister: (id: number, by: string, note?: string) => void; onDelete: () => void }) {
  const { user } = useAuth();
  const isPast = new Date(m.scheduledAt).getTime() < Date.now();
  const isPending = m.status === "Pending";
  const isLate = isPending && isPast;
  return (
    <tr className="border-b border-gray-50 last:border-b-0" style={{ background: isLate ? "rgba(245,158,11,0.04)" : undefined }}>
      <td className="px-3 py-2 text-gray-900" style={{ fontWeight: 600 }}>{drugName}</td>
      <td className="px-3 py-2 text-gray-700">{fmtDateTime(m.scheduledAt)}</td>
      <td className="px-3 py-2">
        <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full" style={{
          background:
            m.status === "Administered" ? "rgba(16,185,129,0.10)" :
            m.status === "Missed"       ? "rgba(239,68,68,0.10)" :
            isLate                       ? "rgba(245,158,11,0.10)" : "rgba(0,0,0,0.05)",
          color:
            m.status === "Administered" ? "#059669" :
            m.status === "Missed"       ? "#dc2626" :
            isLate                       ? "#b45309" : "#6b7280",
          fontWeight: 700,
        }}>
          {m.status === "Administered" ? "✓ ให้แล้ว" : m.status === "Missed" ? "× พลาด" : isLate ? "⚠ เลยเวลา" : "○ รอ"}
        </span>
      </td>
      <td className="px-3 py-2 text-gray-600">{m.administeredBy ?? "—"}</td>
      <td className="px-3 py-2 text-right">
        <div className="inline-flex items-center gap-1 justify-end">
          {isPending && (
            <button
              onClick={() => onAdminister(m.id, user?.displayName ?? "เจ้าหน้าที่")}
              className="text-[11px] px-2.5 py-1 rounded-full text-emerald-700 hover:bg-emerald-50 inline-flex items-center gap-1"
              style={{ background: "rgba(16,185,129,0.08)", fontWeight: 700 }}
            >
              <Check className="w-3 h-3" /> ติ๊กให้ยา
            </button>
          )}
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="ลบรายการให้ยา"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

/* ─── Add Drug Modal ─── */

function DrugAddModal({ admitId, petAllergies, activeDrugs, editing, onClose }: { admitId: number; petAllergies?: string; activeDrugs: DrugOrder[]; editing?: DrugOrder; onClose: () => void }) {
  const { addDrug, updateDrug, addMAR } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const isEditing = !!editing;
  const orderedBy = editing?.orderedBy ?? user?.displayName ?? "เจ้าหน้าที่";

  const [drugName, setDrugName] = useState(editing?.drugName ?? "");
  const [strength, setStrength] = useState(editing?.strength ?? "");
  const [dose, setDose] = useState(editing?.dose ?? "");
  const [route, setRoute] = useState<DrugRoute>(editing?.route ?? "PO");
  const [frequency, setFrequency] = useState<DrugFrequency>(editing?.frequency ?? "q12h");
  const [durationDays, setDurationDays] = useState<string>(editing?.durationDays != null ? String(editing.durationDays) : "3");
  const [isPRN, setIsPRN] = useState(editing?.isPRN ?? false);
  const [isContinuous, setIsContinuous] = useState(editing?.isContinuous ?? false);
  const [isControlled, setIsControlled] = useState(editing?.isControlled ?? false);
  const [note, setNote] = useState(editing?.note ?? "");
  /* เบิก/จ่าย แบบ HOSxP */
  const [qtyRequested, setQtyRequested] = useState<string>(editing?.qtyRequested != null ? String(editing.qtyRequested) : "");
  const [qtyDispensed, setQtyDispensed] = useState<string>(editing?.qtyDispensed != null ? String(editing.qtyDispensed) : "");
  const [dispenseStoreRoom, setDispenseStoreRoom] = useState<string>(editing?.dispenseStoreRoom ?? DISPENSE_ROOMS[0]);
  const [qtyUnit, setQtyUnit] = useState(editing?.qtyUnit ?? "dose");
  const [pricePerUnit, setPricePerUnit] = useState<string>(editing?.pricePerUnit != null ? String(editing.pricePerUnit) : "");

  /* Safety checks */
  const allergyAlert = useMemo(() => {
    if (!petAllergies || !drugName) return null;
    const allergies = petAllergies.toLowerCase();
    const drug = drugName.toLowerCase();
    if (allergies && drug && (allergies.includes(drug) || drug.includes(allergies))) return petAllergies;
    for (const a of COMMON_ALLERGENS) {
      if (allergies.includes(a.toLowerCase()) && drug.includes(a.toLowerCase())) return a;
    }
    return null;
  }, [petAllergies, drugName]);

  const duplicateAlert = useMemo(() => {
    if (!drugName) return null;
    const dup = activeDrugs.find(d => d.drugName.toLowerCase() === drugName.toLowerCase());
    return dup ? dup.drugName : null;
  }, [drugName, activeDrugs]);

  const submit = async () => {
    if (!drugName || !dose) return;
    if (allergyAlert) {
      const ok = await confirm({
        title: "⚠ ตรวจพบประวัติแพ้ยา",
        description: `สัตว์แพ้ ${allergyAlert} — การสั่งยานี้อาจมีความเสี่ยงต่อชีวิต ยืนยันสั่งต่อ?`,
        confirmLabel: "ยืนยันสั่งยา",
        kind: "danger",
        requireTyping: "ยืนยัน",
      });
      if (!ok) return;
    }

    const days = parseInt(durationDays) || 0;

    /* Edit mode — update the existing order in place, no new MAR generation */
    const qtyPatch = {
      qtyRequested: qtyRequested !== "" ? Math.max(0, parseFloat(qtyRequested) || 0) : undefined,
      qtyDispensed: qtyDispensed !== "" ? Math.max(0, parseFloat(qtyDispensed) || 0)
        : qtyRequested !== "" ? Math.max(0, parseFloat(qtyRequested) || 0) : undefined,   // ไม่กรอกจ่าย = จ่ายเท่าเบิก
      qtyUnit,
      pricePerUnit: pricePerUnit !== "" ? Math.max(0, parseFloat(pricePerUnit) || 0) : undefined,
      dispenseStoreRoom,
    };

    if (isEditing && editing) {
      updateDrug(editing.id, {
        drugName, strength, dose, route, frequency,
        durationDays: days,
        isPRN, isContinuous, isControlled, note,
        ...qtyPatch,
      });
      showSnackbar("success", `แก้ไขคำสั่งยา ${drugName} แล้ว`);
      onClose();
      return;
    }

    if (duplicateAlert) {
      const ok = await confirm({
        title: "ยานี้สั่งซ้ำ",
        description: `มี ${duplicateAlert} อยู่แล้วในรายการ active — สั่งซ้ำเพิ่มอีกใบ?`,
        confirmLabel: "สั่งซ้ำ",
        kind: "warning",
      });
      if (!ok) return;
    }

    const newDrug = addDrug({
      admitId, orderedAt: new Date().toISOString(), orderedBy,
      drugName, strength, dose, route, frequency,
      durationDays: days,
      isPRN, isContinuous, isControlled, note, active: true,
      ...qtyPatch,
    });

    /* Auto-generate MAR schedule */
    if (!isPRN && !isContinuous && frequency !== "Once") {
      const hours = frequencyHours[frequency];
      if (hours > 0 && days > 0) {
        const start = new Date();
        start.setMinutes(0, 0, 0);
        start.setHours(start.getHours() + 1);
        const totalDoses = Math.floor((days * 24) / hours);
        for (let i = 0; i < totalDoses; i++) {
          const sched = new Date(start.getTime() + i * hours * 60 * 60 * 1000);
          addMAR({ drugOrderId: newDrug.id, scheduledAt: sched.toISOString(), status: "Pending" });
        }
      }
    } else if (frequency === "Once") {
      const t = new Date();
      t.setMinutes(0, 0, 0);
      t.setHours(t.getHours() + 1);
      addMAR({ drugOrderId: newDrug.id, scheduledAt: t.toISOString(), status: "Pending" });
    }

    showSnackbar("success", `สั่งยา ${drugName} สำเร็จ`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}>{isEditing ? <Pencil className="w-5 h-5 text-white" /> : <Pill className="w-5 h-5 text-white" />}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))" }}>{isEditing ? "แก้ไขคำสั่งยา" : "สั่งยาใหม่"}</h3>
            <p className="text-[11px] text-gray-500">โดย {orderedBy}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="ชื่อยา *"><input type="text" value={drugName} onChange={e => setDrugName(e.target.value)} className="vet-input" placeholder="เช่น Amoxicillin/Clav" /></Field>

          {/* Safety alerts */}
          {allergyAlert && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-[11.5px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.30)", color: "#b91c1c", fontWeight: 600 }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>⚠ Drug Allergy: สัตว์แพ้ {allergyAlert} — ตรวจสอบก่อนสั่ง</span>
            </div>
          )}
          {duplicateAlert && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-[11.5px]" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.30)", color: "#b45309", fontWeight: 600 }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>⚠ Duplicate: มี {duplicateAlert} อยู่แล้วในรายการ active</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="ความแรง"><input type="text" value={strength} onChange={e => setStrength(e.target.value)} className="vet-input" placeholder="10mg/ml" /></Field>
            <Field label="Dose *"><input type="text" value={dose} onChange={e => setDose(e.target.value)} className="vet-input" placeholder="1mg/kg" /></Field>
            <Field label="Route">
              <select value={route} onChange={e => setRoute(e.target.value as DrugRoute)} className="vet-select">
                {routes.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Frequency">
              <select value={frequency} onChange={e => setFrequency(e.target.value as DrugFrequency)} className="vet-select">
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="ระยะเวลา (วัน)"><input type="number" value={durationDays} onChange={e => setDurationDays(e.target.value)} className="vet-input" min={0} /></Field>
          </div>

          {/* เบิก/จ่าย แบบ HOSxP */}
          <div className="grid grid-cols-4 gap-3">
            <Field label="จำนวนเบิก">
              <input type="number" min={0} step="any" value={qtyRequested}
                onChange={e => { setQtyRequested(e.target.value); if (qtyDispensed === "" || qtyDispensed === qtyRequested) setQtyDispensed(e.target.value); }}
                className="vet-input" placeholder="เช่น 14" />
            </Field>
            <Field label="จำนวนจ่าย">
              <input type="number" min={0} step="any" value={qtyDispensed} onChange={e => setQtyDispensed(e.target.value)} className="vet-input" placeholder="= เบิก" />
            </Field>
            <Field label="หน่วย">
              <input type="text" value={qtyUnit} onChange={e => setQtyUnit(e.target.value)} className="vet-input" placeholder="dose / เม็ด / ml" />
            </Field>
            <Field label="ราคา/หน่วย (฿)">
              <input type="number" min={0} step="any" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} className="vet-input" placeholder="0" />
            </Field>
          </div>

          {/* รับยาที่หน่วยจ่าย (store room) + จำนวนคงเหลือ */}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <Field label="รับยาที่หน่วยจ่าย (Store Room)">
              <select value={dispenseStoreRoom} onChange={e => setDispenseStoreRoom(e.target.value)} className="vet-select">
                {DISPENSE_ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <div className="pb-1">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl whitespace-nowrap"
                style={{ fontWeight: 700, background: "rgba(25,165,137,0.08)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.20)" }}>
                คงเหลือ {drugName ? mockStockRemaining(drugName, dispenseStoreRoom) : "—"} {qtyUnit || "หน่วย"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Toggle label="PRN" checked={isPRN} onChange={setIsPRN} />
            <Toggle label="Continuous Infusion" checked={isContinuous} onChange={setIsContinuous} />
            <Toggle label="Controlled Drug" checked={isControlled} onChange={setIsControlled} color="#ef4444" />
          </div>

          <Field label="หมายเหตุ"><input type="text" value={note} onChange={e => setNote(e.target.value)} className="vet-input" placeholder="คำแนะนำเพิ่มเติม..." /></Field>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!drugName || !dose} className="vet-btn vet-btn-orange inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {isEditing ? "บันทึกการแก้ไข" : "สั่งยา"}</button>
        </div>
      </motion.div>
    </div>
  );
}

function OrdersSummaryCard({
  drugs,
  activeCount,
  marCount,
  attendingDoctor,
}: {
  drugs: DrugOrder[];
  activeCount: number;
  marCount: number;
  attendingDoctor?: string;
}) {
  const fluidOrders = drugs.filter(d => d.route === "IV" && (d.frequency === "Continuous"));
  const discontinuedCount = drugs.length - activeCount;
  const prnCount = drugs.filter(d => d.frequency === "PRN").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:sticky lg:top-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12.5px] text-gray-800" style={{ fontWeight: 700 }}>สรุปคำสั่งยา · Visit นี้</span>
      </div>
      <dl className="space-y-2 text-[11.5px]">
        <SumRow label="ยาทั้งหมด" value={`${drugs.length} รายการ`} />
        <SumRow label="กำลังใช้งาน" value={`${activeCount} รายการ`} accent="#0d7c66" />
        {discontinuedCount > 0 && <SumRow label="หยุดยา" value={`${discontinuedCount} รายการ`} accent="#9ca3af" />}
        {prnCount > 0 && <SumRow label="ยา PRN" value={`${prnCount} รายการ`} accent="#f59e0b" />}
        <SumRow label="Dose schedule วันนี้" value={`${marCount} ครั้ง`} />
        {fluidOrders.length > 0 && (
          <SumRow
            label="สารน้ำ (IV Fluid)"
            value={fluidOrders.map(f => f.dose).join(", ")}
            icon={<Droplet className="w-3 h-3 text-sky-500" />}
          />
        )}
        <SumRow label="ความถี่ติดตาม" value="TPR q4h" />
        <SumRow label="อาหาร" value="ตาม Diet plan" />
      </dl>

      {attendingDoctor && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#19a589]/15 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-3.5 h-3.5 text-[#0d7c66]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>ผู้สั่งการรักษา</p>
            <p className="text-[12px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{attendingDoctor}</p>
          </div>
        </div>
      )}

      <button onClick={() => window.print()} className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[12px] text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200" style={{ fontWeight: 600 }}>
        <Printer className="w-3.5 h-3.5" /> พิมพ์ใบคำสั่งยา
      </button>
    </div>
  );
}

function SumRow({ label, value, accent, icon }: { label: string; value: string; accent?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-gray-500 inline-flex items-center gap-1.5">{icon}{label}</dt>
      <dd className="text-gray-900 text-right" style={{ fontWeight: 700, color: accent ?? "#111827" }}>{value}</dd>
    </div>
  );
}

function Toggle({ label, checked, onChange, color = "#19a589" }: { label: string; checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <label className="inline-flex items-center gap-1.5 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
      <span
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: checked ? color : "#ffffff", border: `1.5px solid ${checked ? color : "#d1d5db"}` }}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      <span className="text-[11.5px] text-gray-700" style={{ fontWeight: checked ? 700 : 500 }}>{label}</span>
    </label>
  );
}
