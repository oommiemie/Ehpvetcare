import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Droplet, Apple, Plus, X, Check, ArrowUp, ArrowDown,
  Clock, AlertTriangle, TrendingUp, Utensils,
} from "lucide-react";
import {
  useIPD, type IntakeOutput, type FeedingRecord,
} from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
const fmtShort = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีก่อน`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ชม.ก่อน`;
  return `${Math.round(h / 24)} วันก่อน`;
};

export function IOFeedingTab({ admitId }: { admitId: number }) {
  const { io, feedings } = useIPD();
  const [showAddIO, setShowAddIO] = useState(false);
  const [showAddFeed, setShowAddFeed] = useState(false);

  const patientIO = useMemo(() => io.filter(e => e.admitId === admitId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [io, admitId]);
  const patientFeed = useMemo(() => feedings.filter(f => f.admitId === admitId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [feedings, admitId]);

  const totalIn = patientIO.reduce((s, x) => s + (x.intakeAmount ?? 0), 0);
  const totalOut = patientIO.reduce((s, x) => s + (x.outputAmount ?? 0), 0);
  const balance = totalIn - totalOut;
  const total = totalIn + totalOut;
  const inPct = total > 0 ? (totalIn / total) * 100 : 50;

  const lastIO = patientIO[0];
  const lastFeed = patientFeed[0];

  // Critical: no output for > 8 hours (oliguria warning), or negative balance > 200ml
  const noOutputHours = lastIO ? (Date.now() - new Date(lastIO.timestamp).getTime()) / 3600000 : 0;
  const isCritical = (patientIO.length > 0 && noOutputHours > 8) || balance < -200;

  // Average feeding intake (last 5)
  const avgIntakePct = patientFeed.length > 0
    ? Math.round(patientFeed.slice(0, 5).reduce((s, f) => s + (f.intakePct ?? 0), 0) / Math.min(patientFeed.length, 5))
    : 0;

  return (
    <div className="space-y-4">
      {/* Top: 2-column grid — LEFT Fluid Balance, RIGHT 3 quick stats (2 top + 1 bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* LEFT: Fluid Balance — white card with colored icon badge */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col relative overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          {/* Decorative gradient blob */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-50 pointer-events-none"
            style={{
              background: balance >= 0
                ? "radial-gradient(circle, rgba(13,124,102,0.10) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(220,38,38,0.10) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-3 mb-4 relative">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: balance >= 0
                  ? "linear-gradient(135deg, #34d399, #0d7c66)"
                  : "linear-gradient(135deg, #f87171, #dc2626)",
                boxShadow: balance >= 0 ? "0 4px 12px rgba(13,124,102,0.30)" : "0 4px 12px rgba(220,38,38,0.30)",
              }}
            >
              <Droplet className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gray-500 mb-0.5" style={{ fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Fluid Balance</div>
              <div className="flex items-baseline gap-1.5">
                <span style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: "-1px", color: balance >= 0 ? "#0d7c66" : "#dc2626" }}>
                  {balance > 0 ? "+" : ""}{balance}
                </span>
                <span className="text-[14px] text-gray-500" style={{ fontWeight: 600 }}>ml</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1" style={{ fontWeight: 500 }}>
                {balance >= 0 ? "สมดุลปกติ • ร่างกายได้รับน้ำเพียงพอ" : "ขาดน้ำ • ตรวจสอบและเพิ่ม intake"}
              </div>
            </div>
            {isCritical && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0" style={{ background: "rgba(220,38,38,0.10)", color: "#dc2626" }}>
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[10px]" style={{ fontWeight: 700 }}>เฝ้าระวัง</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-auto relative">
            <div className="flex items-center justify-between text-[11px] text-gray-700" style={{ fontWeight: 600 }}>
              <div className="flex items-center gap-1.5">
                <ArrowDown className="w-3 h-3 text-sky-600" />
                <span>Intake {totalIn} ml</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{totalOut} ml Output</span>
                <ArrowUp className="w-3 h-3 text-amber-600" />
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
              <div className="h-full" style={{ width: `${inPct}%`, background: "#0ea5e9" }} />
              <div className="h-full" style={{ width: `${100 - inPct}%`, background: "#f59e0b" }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1" style={{ fontWeight: 500 }}>
              <span>{lastIO ? `บันทึก I/O ล่าสุด ${relTime(lastIO.timestamp)}` : "ยังไม่มีบันทึก I/O"}</span>
              <span>{patientIO.length} รายการ</span>
            </div>
          </div>
        </section>

        {/* RIGHT: 3 quick stats — 2 top, 1 bottom full width */}
        <div className="grid grid-cols-2 gap-3 grid-rows-[1fr_1fr]">
          <QuickStat
            icon={Utensils}
            label="ให้อาหาร"
            value={`${patientFeed.length}`}
            unit="มื้อ"
            sub={lastFeed ? `ล่าสุด ${relTime(lastFeed.timestamp)}` : "ยังไม่มีบันทึก"}
          />
          <QuickStat
            icon={TrendingUp}
            label="กินจริงเฉลี่ย"
            value={`${avgIntakePct}`}
            unit="%"
            sub={patientFeed.length === 0 ? "ยังไม่มีบันทึก" : avgIntakePct >= 75 ? "กินดี" : avgIntakePct >= 50 ? "ปกติ" : "กินน้อย"}
            alert={patientFeed.length > 0 && avgIntakePct < 50}
          />
          <div className="col-span-2">
            <QuickStat
              icon={Clock}
              label="ช่วงห่าง I/O"
              value={lastIO ? `${Math.round(noOutputHours)}` : "—"}
              unit="ชม."
              sub={lastIO ? (noOutputHours > 8 ? "นานเกินไป" : "ปกติ") : "ยังไม่มีบันทึก"}
              alert={!!lastIO && noOutputHours > 8}
            />
          </div>
        </div>
      </div>

      {/* Two-column history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* I/O list */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
              <Droplet className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>Intake / Output</h3>
              <p className="text-[11px] text-gray-500">{patientIO.length} รายการ</p>
            </div>
            <button onClick={() => setShowAddIO(true)} className="vet-btn vet-btn-primary inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> เพิ่ม I/O
            </button>
          </div>
          <div className="p-3" style={{ maxHeight: 480, overflowY: "auto" }}>
            {patientIO.length === 0 ? (
              <EmptyAdd icon={Droplet} label="ยังไม่มีการบันทึก I/O" cta="บันทึกครั้งแรก" onClick={() => setShowAddIO(true)} color="#0284c7" />
            ) : (
              <div className="space-y-2">
                {patientIO.map(e => <IOCard key={e.id} entry={e} />)}
              </div>
            )}
          </div>
        </section>

        {/* Feeding list */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
              <Apple className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>การให้อาหาร</h3>
              <p className="text-[11px] text-gray-500">{patientFeed.length} มื้อ</p>
            </div>
            <button onClick={() => setShowAddFeed(true)} className="vet-btn vet-btn-primary inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> เพิ่มมื้อ
            </button>
          </div>
          <div className="p-3" style={{ maxHeight: 480, overflowY: "auto" }}>
            {patientFeed.length === 0 ? (
              <EmptyAdd icon={Apple} label="ยังไม่มีการบันทึกอาหาร" cta="บันทึกมื้อแรก" onClick={() => setShowAddFeed(true)} color="#d97706" />
            ) : (
              <div className="space-y-2">
                {patientFeed.map(f => <FeedCard key={f.id} entry={f} />)}
              </div>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showAddIO && <IOAddModal admitId={admitId} onClose={() => setShowAddIO(false)} />}
        {showAddFeed && <FeedAddModal admitId={admitId} onClose={() => setShowAddFeed(false)} />}
      </AnimatePresence>
    </div>
  );
}

function IOCard({ entry }: { entry: IntakeOutput }) {
  const hasIn = (entry.intakeAmount ?? 0) > 0;
  const hasOut = (entry.outputAmount ?? 0) > 0;
  return (
    <div className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50/70 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-[10.5px] text-gray-500">
          <Clock className="w-3 h-3" />
          <span style={{ fontWeight: 600 }}>{fmtTime(entry.timestamp)}</span>
          <span className="text-gray-300">·</span>
          <span>{fmtShort(entry.timestamp)}</span>
        </div>
        <span className="text-[9.5px] text-gray-400" style={{ fontWeight: 600 }}>{entry.recordedBy}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {hasIn && (
          <span className="inline-flex items-center gap-1 text-[10.5px] text-sky-700 px-2 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.10)", fontWeight: 700 }}>
            <ArrowDown className="w-2.5 h-2.5" />
            {entry.intakeType} {entry.intakeAmount} ml
          </span>
        )}
        {hasOut && (
          <span className="inline-flex items-center gap-1 text-[10.5px] text-amber-700 px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.10)", fontWeight: 700 }}>
            <ArrowUp className="w-2.5 h-2.5" />
            {entry.outputType} {entry.outputAmount}{entry.outputType === "Feces" ? "g" : "ml"}
          </span>
        )}
      </div>
      {entry.note && <div className="text-[11px] text-gray-600 mt-1.5 leading-snug">{entry.note}</div>}
    </div>
  );
}

function FeedCard({ entry }: { entry: FeedingRecord }) {
  const pct = entry.intakePct ?? 0;
  const pctColor = pct >= 75 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50/70 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-[10.5px] text-gray-500">
          <Clock className="w-3 h-3" />
          <span style={{ fontWeight: 600 }}>{fmtTime(entry.timestamp)}</span>
          <span className="text-gray-300">·</span>
          <span>{fmtShort(entry.timestamp)}</span>
        </div>
        <span className="text-[9.5px] text-gray-400" style={{ fontWeight: 600 }}>{entry.recordedBy}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] text-gray-900" style={{ fontWeight: 700 }}>{entry.food}</span>
            <span className="text-[9.5px] text-orange-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(251,146,60,0.10)", fontWeight: 700 }}>{entry.route}</span>
          </div>
          <div className="text-[10.5px] text-gray-500 mt-0.5">{entry.amount}</div>
        </div>
        {entry.intakePct !== undefined && (
          <div className="flex-shrink-0 text-right pl-2 border-l border-gray-100">
            <div style={{ fontSize: 16, fontWeight: 800, color: pctColor, lineHeight: 1 }}>{pct}%</div>
            <div className="text-[9px] text-gray-400 mt-0.5" style={{ fontWeight: 600 }}>กินจริง</div>
          </div>
        )}
      </div>
      {entry.note && <div className="text-[11px] text-gray-600 mt-1.5 leading-snug">{entry.note}</div>}
    </div>
  );
}

function QuickStat({ icon: Ico, label, value, unit, sub, alert }: { icon: typeof Droplet; label: string; value: string; unit: string; sub: string; alert?: boolean }) {
  const numColor = alert ? "#dc2626" : "#111827";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 h-full flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100">
          <Ico className="w-3.5 h-3.5 text-gray-600" strokeWidth={2.2} />
        </div>
        <span className="text-[10px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 22, fontWeight: 800, color: numColor, lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</span>
        <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>{unit}</span>
      </div>
      <div className="text-[10px] mt-1 inline-flex items-center gap-1" style={{ fontWeight: 500, color: alert ? "#dc2626" : "#6b7280" }}>
        {alert && <AlertTriangle className="w-2.5 h-2.5" />}
        {sub}
      </div>
    </div>
  );
}

function EmptyAdd({ icon: Ico, label, cta, onClick, color }: { icon: typeof Droplet; label: string; cta: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed transition-all hover:bg-gray-50"
      style={{ borderColor: `${color}30` }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2" style={{ background: `${color}12`, color }}>
        <Ico className="w-5 h-5" strokeWidth={2} />
      </div>
      <div className="text-[12px] text-gray-500 mb-2" style={{ fontWeight: 600 }}>{label}</div>
      <div className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full text-white" style={{ background: color, fontWeight: 700 }}>
        <Plus className="w-3 h-3" /> {cta}
      </div>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

/* ─── I/O Modal ─── */

function IOAddModal({ admitId, onClose }: { admitId: number; onClose: () => void }) {
  const { addIO } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const nurseName = user?.displayName ?? "เจ้าหน้าที่";
  const [iType, setIType] = useState<IntakeOutput["intakeType"]>("Oral");
  const [iAmt, setIAmt] = useState("");
  const [oType, setOType] = useState<IntakeOutput["outputType"]>("Urine");
  const [oAmt, setOAmt] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    addIO({ admitId, timestamp: new Date().toISOString(), recordedBy: nurseName, intakeType: iType, intakeAmount: parseInt(iAmt) || 0, outputType: oType, outputAmount: parseInt(oAmt) || 0, note });
    showSnackbar("success", "บันทึก I/O สำเร็จ");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}><Droplet className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>บันทึก Intake / Output</h3>
            <p className="text-[11px] text-gray-500">โดย {nurseName}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body grid grid-cols-2 gap-3">
          <Field label="Intake Type"><select value={iType} onChange={e => setIType(e.target.value as IntakeOutput["intakeType"])} className="vet-select"><option value="Oral">Oral</option><option value="IV">IV</option><option value="SC">SC</option><option value="Other">Other</option></select></Field>
          <Field label="Intake (ml)"><input type="number" value={iAmt} onChange={e => setIAmt(e.target.value)} placeholder="50" className="vet-input" /></Field>
          <Field label="Output Type"><select value={oType} onChange={e => setOType(e.target.value as IntakeOutput["outputType"])} className="vet-select"><option value="Urine">Urine</option><option value="Feces">Feces</option><option value="Vomit">Vomit</option><option value="Drain">Drain</option><option value="Other">Other</option></select></Field>
          <Field label="Output (ml/g)"><input type="number" value={oAmt} onChange={e => setOAmt(e.target.value)} placeholder="30" className="vet-input" /></Field>
          <div className="col-span-2"><Field label="หมายเหตุ"><input type="text" value={note} onChange={e => setNote(e.target.value)} className="vet-input" placeholder="ลักษณะ สี กลิ่น..." /></Field></div>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} className="vet-btn vet-btn-primary inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> บันทึก</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Feeding Modal ─── */

function FeedAddModal({ admitId, onClose }: { admitId: number; onClose: () => void }) {
  const { addFeeding } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const nurseName = user?.displayName ?? "เจ้าหน้าที่";
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [route, setRoute] = useState<FeedingRecord["route"]>("Oral");
  const [intakePct, setIntakePct] = useState<number>(100);
  const [note, setNote] = useState("");

  const submit = () => {
    if (!food || !amount) return;
    addFeeding({ admitId, timestamp: new Date().toISOString(), recordedBy: nurseName, food, amount, route, intakePct, note });
    showSnackbar("success", "บันทึกการให้อาหารสำเร็จ");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #fb923c, #d97706)" }}><Apple className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>บันทึกการให้อาหาร</h3>
            <p className="text-[11px] text-gray-500">โดย {nurseName}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          <Field label="ประเภทอาหาร *"><input type="text" value={food} onChange={e => setFood(e.target.value)} placeholder="เช่น อาหารอ่อน i/d, นม, ยาน้ำ" className="vet-input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ปริมาณ *"><input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50 ml / 1/4 กระป๋อง" className="vet-input" /></Field>
            <Field label="Route"><select value={route} onChange={e => setRoute(e.target.value as FeedingRecord["route"])} className="vet-select"><option value="Oral">Oral</option><option value="Syringe Feed">Syringe Feed</option><option value="Tube Feed">Tube Feed</option></select></Field>
          </div>
          <Field label={`% ที่กินจริง — ${intakePct}%`}>
            <input type="range" min={0} max={100} step={5} value={intakePct} onChange={e => setIntakePct(parseInt(e.target.value))} className="w-full" />
          </Field>
          <Field label="หมายเหตุ"><input type="text" value={note} onChange={e => setNote(e.target.value)} className="vet-input" placeholder="พฤติกรรมการกิน..." /></Field>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!food || !amount} className="vet-btn vet-btn-primary inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> บันทึก</button>
        </div>
      </motion.div>
    </div>
  );
}
