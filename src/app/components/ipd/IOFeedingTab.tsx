import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Droplet, Apple, Plus, X, Check, ArrowUp, ArrowDown,
  Clock, AlertTriangle, Sunrise, Sun, Moon, UserCheck,
  Activity, Heart, ChevronDown, ChevronRight, Pencil, Trash2, History, CalendarDays,
} from "lucide-react";
import {
  useIPD, type MonitorRound, type FeedRoute, type ShiftName,
} from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";
import { DatePickerModern } from "../DatePickerModern";
import { TimePickerModern } from "../TimePickerModern";

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

/* ─── เวร (Shift) helpers ─── */
const SHIFTS: { key: ShiftName; label: string; range: string; icon: typeof Sunrise }[] = [
  { key: "เช้า", label: "เช้า", range: "06:00–13:59", icon: Sunrise },
  { key: "บ่าย", label: "บ่าย", range: "14:00–21:59", icon: Sun },
  { key: "ดึก", label: "ดึก", range: "22:00–05:59", icon: Moon },
];
const shiftFromHour = (h: number): ShiftName => (h >= 6 && h < 14 ? "เช้า" : h >= 14 && h < 22 ? "บ่าย" : "ดึก");
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const nowTimeStr = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

const HYDRATION_OPTS = ["ปกติ (<5%)", "5–6%", "7–8%", "9–10%", ">10%"];

const num = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };

export function IOFeedingTab({ admitId }: { admitId: number }) {
  const { monitorRounds, deleteMonitorRound } = useIPD();
  const confirm = useConfirm();
  const { showSnackbar } = useSnackbar();
  const [showAddRound, setShowAddRound] = useState(false);
  const [editing, setEditing] = useState<MonitorRound | null>(null);
  const [viewing, setViewing] = useState<MonitorRound | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const toggleDate = (d: string) => setCollapsedDates(prev => {
    const next = new Set(prev);
    next.has(d) ? next.delete(d) : next.add(d);
    return next;
  });
  const handleDelete = async (r: MonitorRound) => {
    const ok = await confirm({
      title: "ลบบันทึกเฝ้าระวัง",
      description: `ลบรายการเวลา ${fmtTime(r.timestamp)} · ${fmtShort(r.timestamp)} ออกจากบันทึก?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    deleteMonitorRound(r.id);
    showSnackbar("success", "ลบบันทึกแล้ว");
  };

  const rounds = useMemo(() => monitorRounds.filter(e => e.admitId === admitId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [monitorRounds, admitId]);

  // สมดุลน้ำ: เข้า = water, ออก = UOP + vomit + drain
  const totalIn = rounds.reduce((s, x) => s + (x.waterIntake ?? 0), 0);
  const totalOut = rounds.reduce((s, x) => s + (x.uop ?? 0) + (x.vomit ?? 0) + (x.drain ?? 0), 0);
  const balance = totalIn - totalOut;
  const total = totalIn + totalOut;
  const inPct = total > 0 ? (totalIn / total) * 100 : 50;

  const lastRound = rounds[0];
  const feedRounds = rounds.filter(r => r.food);
  const lastFeed = feedRounds[0];

  // จัดกลุ่มรอบตามวันที่ (รอบเรียงใหม่→เก่าอยู่แล้ว)
  const grouped = useMemo(() => {
    const map = new Map<string, MonitorRound[]>();
    for (const r of rounds) {
      const key = new Date(r.timestamp).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [rounds]);

  // แยก "วันนี้" กับ "ประวัติ"
  const dateKey = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  const todayKey = dateKey(new Date().toISOString());
  const todayRounds = rounds.filter(r => dateKey(r.timestamp) === todayKey);
  const historyGrouped = grouped.filter(([date]) => date !== todayKey);

  // สรุปอาหาร
  const fedWithPct = feedRounds.filter(r => r.intakePct !== undefined);
  const avgIntakePct = fedWithPct.length ? Math.round(fedWithPct.reduce((s, r) => s + (r.intakePct ?? 0), 0) / fedWithPct.length) : 0;
  const feedColor = avgIntakePct >= 75 ? "#059669" : avgIntakePct >= 50 ? "#d97706" : "#dc2626";
  const feedDesc = feedRounds.length === 0 ? "ยังไม่มีบันทึกการให้อาหาร" : avgIntakePct >= 75 ? "กินดี • ความอยากอาหารปกติ" : avgIntakePct >= 50 ? "กินปานกลาง • เฝ้าติดตาม" : "กินน้อย • ควรกระตุ้น/ปรับแผน";
  const recentMeals = [...feedRounds.slice(0, 6)].reverse(); // เก่า→ใหม่

  const noRoundHours = lastRound ? (Date.now() - new Date(lastRound.timestamp).getTime()) / 3600000 : 0;
  const isCritical = (rounds.length > 0 && noRoundHours > 8) || balance < -200;

  return (
    <div className="space-y-4">
      {/* Top: Fluid balance + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <section className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col relative overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
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
                background: balance >= 0 ? "linear-gradient(135deg, #34d399, #0d7c66)" : "linear-gradient(135deg, #f87171, #dc2626)",
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
              <span>{lastRound ? `บันทึกล่าสุด ${relTime(lastRound.timestamp)}` : "ยังไม่มีบันทึกเฝ้าระวัง"}</span>
              <span>{rounds.length} รอบ</span>
            </div>
          </div>
        </section>

        {/* Feeding summary — สรุปอาหาร */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col relative overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-50 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${feedColor}1a 0%, transparent 70%)` }}
          />
          <div className="flex items-start gap-3 mb-4 relative">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #fb923c, #d97706)", boxShadow: "0 4px 12px rgba(217,119,6,0.30)" }}
            >
              <Apple className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gray-500 mb-0.5" style={{ fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>สรุปอาหาร · Feeding</div>
              <div className="flex items-baseline gap-1.5">
                <span style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: "-1px", color: feedColor }}>
                  {feedRounds.length === 0 ? "—" : `${avgIntakePct}`}
                </span>
                {feedRounds.length > 0 && <span className="text-[14px] text-gray-500" style={{ fontWeight: 600 }}>% กินจริงเฉลี่ย</span>}
              </div>
              <div className="text-[11px] text-gray-500 mt-1" style={{ fontWeight: 500 }}>{feedDesc}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{feedRounds.length}</div>
              <div className="text-[9px] text-gray-400 mt-0.5" style={{ fontWeight: 600 }}>มื้อ</div>
            </div>
          </div>
          <div className="space-y-1.5 mt-auto relative">
            {recentMeals.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-[9px] text-gray-400" style={{ fontWeight: 600 }}>
                  <span>% กินจริงต่อมื้อ ({recentMeals.length} มื้อล่าสุด)</span>
                  <span>เก่า → ใหม่</span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  {recentMeals.map(m => {
                    const p = m.intakePct ?? 0;
                    const col = p >= 75 ? "#059669" : p >= 50 ? "#d97706" : "#dc2626";
                    return (
                      <div key={m.id} className="flex-1 flex flex-col items-center gap-1" title={`${fmtTime(m.timestamp)} · ${m.food} · กินจริง ${p}%`}>
                        <div className="w-full rounded-md bg-gray-100 flex items-end overflow-hidden" style={{ height: 36 }}>
                          <div className="w-full rounded-md transition-all" style={{ height: `${Math.max(p, 4)}%`, background: col }} />
                        </div>
                        <span className="text-[9px]" style={{ fontWeight: 700, color: col }}>{p}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 border-t border-gray-50" style={{ fontWeight: 500 }}>
                  <span className="truncate pr-2">{lastFeed ? `มื้อล่าสุด: ${lastFeed.food}` : ""}</span>
                  <span className="flex-shrink-0">{lastFeed ? relTime(lastFeed.timestamp) : ""}</span>
                </div>
              </>
            ) : (
              <div className="text-[11px] text-gray-400 text-center py-3" style={{ fontWeight: 500 }}>บันทึกอาหารในฟอร์มบันทึกเฝ้าระวัง — จะสรุปกินจริงเฉลี่ยให้อัตโนมัติ</div>
            )}
          </div>
        </section>
      </div>

      {/* ซ้าย = วันนี้ (กว้าง) · ขวา = ประวัติ (แคบ เหมือนหน้า Lab) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
        {/* LEFT — วันนี้ (วันที่ปัจจุบัน) */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #34d399, #0d7c66)" }}>
              <CalendarDays className="w-4.5 h-4.5" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>วันนี้ · {todayKey}</h3>
              <p className="text-[11px] text-gray-500">{todayRounds.length} รอบ · บันทึกของวันนี้</p>
            </div>
            <button onClick={() => setShowAddRound(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1 flex-shrink-0" title="บันทึกเฝ้าระวัง">
              <Plus className="w-3.5 h-3.5" /> เพิ่ม
            </button>
          </div>
          <div className="p-3">
            {todayRounds.length === 0 ? (
              <EmptyAdd icon={Activity} label="วันนี้ยังไม่มีบันทึกเฝ้าระวัง" cta="บันทึกรอบแรกของวันนี้" onClick={() => setShowAddRound(true)} color="#0d7c66" />
            ) : (
              <div className="space-y-2.5">
                {todayRounds.map(r => <MonitorRoundCard key={r.id} entry={r} onEdit={setEditing} onDelete={handleDelete} />)}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT — ประวัติ (วันก่อนหน้า) */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
              <History className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14 }}>ประวัติ</h3>
              <p className="text-[11px] text-gray-500">{rounds.length - todayRounds.length} รอบ · วันก่อนหน้า</p>
            </div>
          </div>
          <div className="p-3">
            {historyGrouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <History className="w-8 h-8 mb-2 opacity-40" strokeWidth={1.6} />
                <span className="text-[12px]" style={{ fontWeight: 500 }}>ยังไม่มีประวัติย้อนหลัง</span>
              </div>
            ) : (
              <div className="space-y-4">
                {historyGrouped.map(([date, items]) => {
                  const open = !collapsedDates.has(date);
                  return (
                    <div key={date}>
                      <button type="button" onClick={() => toggleDate(date)} className="w-full flex items-center gap-2 mb-2 px-0.5 py-0.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform" style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }} />
                        <span className="text-[11px] text-gray-900" style={{ fontWeight: 700 }}>{date}</span>
                        <span className="h-px flex-1 bg-gray-100" />
                        <span className="text-[10px] text-gray-400" style={{ fontWeight: 600 }}>{items.length} รอบ{open ? "" : " · ซ่อนอยู่"}</span>
                      </button>
                      {open && (
                        <div className="space-y-1.5">
                          {items.map(r => <HistoryRow key={r.id} entry={r} onClick={() => setViewing(r)} />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {(showAddRound || editing) && (
          <MonitorRoundModal
            key={editing?.id ?? "new"}
            admitId={admitId}
            existing={editing}
            onClose={() => { setShowAddRound(false); setEditing(null); }}
          />
        )}
        {viewing && (
          <MonitorRoundDetailModal
            round={viewing}
            onClose={() => setViewing(null)}
            onEdit={(r) => { setViewing(null); setEditing(r); }}
            onDelete={async (r) => { setViewing(null); await handleDelete(r); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ShiftBadge({ shift }: { shift?: ShiftName }) {
  if (!shift) return null;
  const def = SHIFTS.find(s => s.key === shift);
  const Ico = def?.icon ?? Sun;
  return (
    <span className="inline-flex items-center gap-1 text-[9.5px] text-violet-700 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.10)", fontWeight: 700 }}>
      <Ico className="w-2.5 h-2.5" /> เวร{shift}
    </span>
  );
}

/* ─── Monitor Round card ─── */
type Tone = "crit" | "in" | "out" | "default";
const TONE: Record<Tone, string> = {
  crit:    "#dc2626",
  in:      "#0369a1",
  out:     "#b45309",
  default: "#1f2937",
};

function StatTile({ label, value, tone = "default" }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/60 px-2.5 py-1.5" title={`${label}: ${value}`}>
      <div className="text-[8.5px] text-gray-400 uppercase" style={{ fontWeight: 700, letterSpacing: "0.3px", lineHeight: 1.5 }}>{label}</div>
      <div className="text-[12.5px]" style={{ fontWeight: 800, color: TONE[tone], lineHeight: 1.25 }}>{value}</div>
    </div>
  );
}

function SectionLabel({ icon: Ico, color, children }: { icon: typeof Heart; color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-md flex-shrink-0" style={{ background: `${color}1f`, color }}>
        <Ico className="w-2.5 h-2.5" strokeWidth={2.4} />
      </span>
      <span className="text-[9.5px] uppercase" style={{ fontWeight: 700, letterSpacing: "0.5px", color }}>{children}</span>
    </div>
  );
}

type Tile = { k: string; label: string; value: string; tone?: Tone };

function MonitorRoundCard({ entry: e, onEdit, onDelete }: { entry: MonitorRound; onEdit: (r: MonitorRound) => void; onDelete: (r: MonitorRound) => void }) {
  const tempN = parseFloat(e.temp ?? "");
  const tempCrit = !isNaN(tempN) && (tempN < 100.5 || tempN > 102.5);
  const pulseN = parseFloat(e.pulse ?? "");
  const pulseCrit = !isNaN(pulseN) && (pulseN < 60 || pulseN > 180);
  const painCrit = (e.painScore ?? 0) >= 3;

  const vitals: Tile[] = [];
  if (e.temp) vitals.push({ k: "t", label: "Temp", value: `${e.temp}°F`, tone: tempCrit ? "crit" : "default" });
  if (e.pulse) vitals.push({ k: "p", label: "HR", value: `${e.pulse} bpm`, tone: pulseCrit ? "crit" : "default" });
  if (e.resp) vitals.push({ k: "r", label: "RR", value: `${e.resp} bpm` });
  if (e.bpSys && e.bpDia) vitals.push({ k: "bp", label: "BP", value: `${e.bpSys}/${e.bpDia}` });
  if (e.crt) vitals.push({ k: "crt", label: "CRT", value: `${e.crt} s` });
  if (e.oxygen) vitals.push({ k: "o2", label: "O₂", value: `${e.oxygen} L/min` });
  if (e.hydration) vitals.push({ k: "hyd", label: "Hydration", value: e.hydration });
  if (e.painScore !== undefined) vitals.push({ k: "pain", label: "Pain", value: `${e.painScore}/4`, tone: painCrit ? "crit" : "default" });

  const io: Tile[] = [];
  if (e.fluidRate) io.push({ k: "fl", label: "Fluid", value: `${e.fluidRate} ml/hr`, tone: "in" });
  if (e.waterIntake) io.push({ k: "w", label: "Water", value: `${e.waterIntake} ml`, tone: "in" });
  if (e.uop) io.push({ k: "uop", label: "UOP", value: `${e.uop} ml`, tone: "out" });
  if (e.fecesScore) io.push({ k: "fs", label: "Feces", value: `score ${e.fecesScore}`, tone: "out" });
  if (e.vomit) io.push({ k: "v", label: "Vomit", value: `${e.vomit} ml`, tone: "out" });
  if (e.drain) io.push({ k: "dr", label: "Drain", value: `${e.drain} ml`, tone: "out" });

  const pctCol = (e.intakePct ?? 0) >= 75 ? "#059669" : (e.intakePct ?? 0) >= 50 ? "#d97706" : "#dc2626";
  const initial = (e.recordedBy ?? "").trim().charAt(0) || "?";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      {/* header strip */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-50 bg-gray-50/40">
        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.2} />
        </div>
        <div className="flex items-baseline gap-1 text-[12px] leading-tight">
          <span className="text-gray-900" style={{ fontWeight: 700 }}>{fmtTime(e.timestamp)}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500">{fmtShort(e.timestamp)}</span>
        </div>
        <ShiftBadge shift={e.shift} />
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: "linear-gradient(135deg, #19a589, #0d7c66)", fontWeight: 800 }}>{initial}</div>
          <span className="text-[10px] text-gray-500 hidden sm:inline" style={{ fontWeight: 600 }}>{e.recordedBy}</span>
          <div className="flex items-center gap-0.5 ml-0.5">
            <button onClick={() => onEdit(e)} title="แก้ไข" className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(e)} title="ลบ" className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      {/* body */}
      <div className="px-3 py-2.5 space-y-3">
        {vitals.length > 0 && (
          <div>
            <SectionLabel icon={Heart} color="#f43f5e">สัญญาณชีพ</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">{vitals.map(t => <StatTile key={t.k} label={t.label} value={t.value} tone={t.tone} />)}</div>
          </div>
        )}
        {io.length > 0 && (
          <div>
            <SectionLabel icon={Droplet} color="#0ea5e9">Intake / Output</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">{io.map(t => <StatTile key={t.k} label={t.label} value={t.value} tone={t.tone} />)}</div>
          </div>
        )}
        {e.food && (
          <div>
            <SectionLabel icon={Apple} color="#d97706">อาหาร</SectionLabel>
            <div className="flex items-center gap-2 flex-wrap rounded-lg border border-gray-100 bg-gray-50/60 px-2.5 py-2">
              <span className="text-[12.5px] text-gray-900" style={{ fontWeight: 700 }}>{e.food}</span>
              {e.foodAmount && <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>· {e.foodAmount}</span>}
              {e.feedRoute && <span className="text-[9.5px] text-gray-500 px-1.5 py-0.5 rounded-full bg-white border border-gray-100" style={{ fontWeight: 700 }}>{e.feedRoute}</span>}
              {e.intakePct !== undefined && (
                <span className="ml-auto text-[11.5px]" style={{ color: pctCol, fontWeight: 800 }}>กินจริง {e.intakePct}%</span>
              )}
            </div>
          </div>
        )}
        {e.note && (
          <div className="flex items-start gap-1.5 text-[11px] leading-snug pt-2.5 border-t border-gray-50">
            <span className="text-gray-400 flex-shrink-0" style={{ fontWeight: 700 }}>หมายเหตุ</span>
            <span className="text-gray-600">{e.note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── History summary row (กดเพื่อดูรายละเอียดเต็มใน popup) ─── */
function HistoryRow({ entry: e, onClick }: { entry: MonitorRound; onClick: () => void }) {
  const bits: string[] = [];
  if (e.temp) bits.push(`T ${e.temp}°F`);
  if (e.pulse) bits.push(`HR ${e.pulse}`);
  if (e.painScore != null) bits.push(`Pain ${e.painScore}/4`);
  if (e.uop) bits.push(`UOP ${e.uop}ml`);
  if (e.food) bits.push(`อาหาร ${e.intakePct ?? 0}%`);
  const summary = bits.slice(0, 3).join(" · ") || "ดูรายละเอียด";
  return (
    <button onClick={onClick} className="w-full text-left rounded-xl border border-gray-100 hover:border-sky-200 hover:bg-sky-50/40 transition-colors px-3 py-2 flex items-center gap-2 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900" style={{ fontWeight: 700 }}>{fmtTime(e.timestamp)}</span>
          <ShiftBadge shift={e.shift} />
        </div>
        <div className="text-[10.5px] text-gray-500 truncate mt-0.5">{summary}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500 flex-shrink-0 transition-colors" />
    </button>
  );
}

/* ─── Detail popup (อ่านอย่างเดียว + แก้ไข/ลบ) ─── */
function MonitorRoundDetailModal({ round, onClose, onEdit, onDelete }: { round: MonitorRound; onClose: () => void; onEdit: (r: MonitorRound) => void; onDelete: (r: MonitorRound) => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}><Activity className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>รายละเอียดบันทึกเฝ้าระวัง</h3>
            <p className="text-[11px] text-gray-500">{fmtShort(round.timestamp)} · {fmtTime(round.timestamp)} น.{round.shift ? ` · เวร${round.shift}` : ""}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body overflow-y-auto">
          <MonitorRoundCard entry={round} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </motion.div>
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

/* ─── Shared record metadata: วันที่ • เวลา • เวร • ผู้บันทึก ─── */
interface RecordMeta { date: string; time: string; shift: ShiftName; shiftAuto: boolean; }

function useRecordMeta(initial?: { iso: string; shift?: ShiftName }): [RecordMeta, (m: Partial<RecordMeta>) => void] {
  const [meta, setMeta] = useState<RecordMeta>(() => {
    if (initial?.iso) {
      const d = new Date(initial.iso);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return { date, time, shift: initial.shift ?? shiftFromHour(d.getHours()), shiftAuto: false };
    }
    return { date: todayStr(), time: nowTimeStr(), shift: shiftFromHour(new Date().getHours()), shiftAuto: true };
  });
  const patch = (m: Partial<RecordMeta>) => setMeta(prev => {
    const next = { ...prev, ...m };
    // เวรปรับตามเวลาอัตโนมัติ จนกว่าผู้ใช้จะเลือกเวรเอง
    if (m.time !== undefined && next.shiftAuto) next.shift = shiftFromHour(parseInt(m.time.slice(0, 2)) || 0);
    if (m.shift !== undefined) next.shiftAuto = false;
    return next;
  });
  return [meta, patch];
}

/** รวมวันที่+เวลาเป็น ISO timestamp (เวลาท้องถิ่น) */
const metaToISO = (m: RecordMeta) => new Date(`${m.date}T${m.time || "00:00"}`).toISOString();

function RecordMetaFields({ meta, patch, accent }: { meta: RecordMeta; patch: (m: Partial<RecordMeta>) => void; accent: string }) {
  const { user } = useAuth();
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="วันที่">
          <DatePickerModern value={meta.date} onChange={(v) => patch({ date: v })} placeholder="เลือกวันที่" />
        </Field>
        <Field label="เวลา">
          <TimePickerModern value={meta.time} onChange={(v) => patch({ time: v })} placeholder="เลือกเวลา" />
        </Field>
      </div>
      <Field label="เวร">
        <div className="flex items-center gap-1.5">
          {SHIFTS.map(s => {
            const Ico = s.icon;
            const active = meta.shift === s.key;
            return (
              <button key={s.key} type="button" onClick={() => patch({ shift: s.key })}
                className={`vet-chip flex-1 justify-center ${active ? "vet-chip-active" : ""}`} title={s.range}>
                <Ico className="w-3.5 h-3.5" /> {s.label}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="ผู้บันทึก">
        <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: accent }}>
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{user?.displayName ?? "เจ้าหน้าที่"}</div>
            <div className="text-[10px] text-gray-400" style={{ fontWeight: 600 }}>{user?.role ?? "ผู้บันทึก"} · ตามบัญชีที่เข้าสู่ระบบ</div>
          </div>
        </div>
      </Field>
    </div>
  );
}

/* ─── Monitor Round Modal — ฟอร์มรวม 15 ช่องตามใบ Monitor (เพิ่ม/แก้ไข) ─── */
function MonitorRoundModal({ admitId, existing, onClose }: { admitId: number; existing?: MonitorRound | null; onClose: () => void }) {
  const { addMonitorRound, updateMonitorRound } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const isEdit = !!existing;
  const nurseName = isEdit ? existing!.recordedBy : (user?.displayName ?? "เจ้าหน้าที่");
  const [meta, patchMeta] = useRecordMeta(existing ? { iso: existing.timestamp, shift: existing.shift } : undefined);
  const numStr = (n?: number) => (n != null ? String(n) : "");

  // Vitals
  const [pain, setPain] = useState(existing?.painScore != null ? String(existing.painScore) : "");
  const [temp, setTemp] = useState(existing?.temp ?? "");
  const [crt, setCrt] = useState(existing?.crt ?? "");
  const [hydration, setHydration] = useState(existing?.hydration ?? "");
  const [bpSys, setBpSys] = useState(existing?.bpSys ?? "");
  const [bpDia, setBpDia] = useState(existing?.bpDia ?? "");
  const [pulse, setPulse] = useState(existing?.pulse ?? "");
  const [resp, setResp] = useState(existing?.resp ?? "");
  const [oxygen, setOxygen] = useState(existing?.oxygen ?? "");
  // Intake
  const [fluidRate, setFluidRate] = useState(numStr(existing?.fluidRate));
  const [water, setWater] = useState(numStr(existing?.waterIntake));
  // Output
  const [uop, setUop] = useState(numStr(existing?.uop));
  const [fecesScore, setFecesScore] = useState(numStr(existing?.fecesScore));
  const [vomit, setVomit] = useState(numStr(existing?.vomit));
  const [drain, setDrain] = useState(numStr(existing?.drain));
  // อาหาร (Feeding)
  const [food, setFood] = useState(existing?.food ?? "");
  const [foodAmount, setFoodAmount] = useState(existing?.foodAmount ?? "");
  const [feedRoute, setFeedRoute] = useState<FeedRoute>(existing?.feedRoute ?? "Oral");
  const [intakePct, setIntakePct] = useState<number>(existing?.intakePct ?? 100);
  const [note, setNote] = useState(existing?.note ?? "");

  const hasFood = food.trim() !== "";
  const hasAny =
    [pain, temp, crt, bpSys, bpDia, pulse, resp, oxygen, fluidRate, water, food, foodAmount, uop, fecesScore, vomit, drain, note].some(v => v.trim() !== "")
    || hydration !== "";

  const submit = () => {
    if (!hasAny) { showSnackbar("error", "กรอกอย่างน้อย 1 ช่องก่อนบันทึก"); return; }
    const data = {
      timestamp: metaToISO(meta),
      recordedBy: nurseName,
      shift: meta.shift,
      painScore: pain !== "" ? (parseInt(pain) || 0) : undefined,
      temp: temp.trim() || undefined,
      hydration: hydration || undefined,
      crt: crt.trim() || undefined,
      bpSys: bpSys.trim() || undefined,
      bpDia: bpDia.trim() || undefined,
      pulse: pulse.trim() || undefined,
      resp: resp.trim() || undefined,
      oxygen: oxygen.trim() || undefined,
      fluidRate: num(fluidRate),
      waterIntake: num(water),
      uop: num(uop),
      fecesScore: fecesScore !== "" ? (parseInt(fecesScore) || undefined) : undefined,
      vomit: num(vomit),
      drain: num(drain),
      food: food.trim() || undefined,
      foodAmount: hasFood ? (foodAmount.trim() || undefined) : undefined,
      feedRoute: hasFood ? feedRoute : undefined,
      intakePct: hasFood ? intakePct : undefined,
      note: note.trim() || undefined,
    };
    if (isEdit && existing) {
      updateMonitorRound(existing.id, data);
      showSnackbar("success", "แก้ไขบันทึกสำเร็จ");
    } else {
      addMonitorRound({ admitId, ...data });
      showSnackbar("success", "บันทึกเฝ้าระวังสำเร็จ");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[680px] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}><Activity className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>{isEdit ? "แก้ไขบันทึกเฝ้าระวัง" : "บันทึกเฝ้าระวัง"}</h3>
            <p className="text-[11px] text-gray-500">สัญญาณชีพ + I/O + อาหาร · {fmtShort(metaToISO(meta))} {meta.time} น.</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3 overflow-y-auto">
          <RecordMetaFields meta={meta} patch={patchMeta} accent="linear-gradient(135deg, #38bdf8, #0284c7)" />

          {/* สัญญาณชีพ / Monitor */}
          <div className="vet-divider"><Heart className="w-3.5 h-3.5 text-rose-500" /> สัญญาณชีพ</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Pain score (0–4)"><input type="number" min={0} max={4} value={pain} onChange={e => setPain(e.target.value)} placeholder="0" className="vet-input" /></Field>
            <Field label="อุณหภูมิ (°F)"><input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} placeholder="101.3" className="vet-input" /></Field>
            <Field label="CRT (วินาที)"><input type="number" step="0.5" value={crt} onChange={e => setCrt(e.target.value)} placeholder="< 2" className="vet-input" /></Field>
            <Field label="Hydration"><select value={hydration} onChange={e => setHydration(e.target.value)} className="vet-select"><option value="">— เลือก —</option>{HYDRATION_OPTS.map(o => <option key={o} value={o}>{o}</option>)}</select></Field>
            <Field label="Heart rate (bpm)"><input type="number" value={pulse} onChange={e => setPulse(e.target.value)} placeholder="120" className="vet-input" /></Field>
            <Field label="Respiratory rate (bpm)"><input type="number" value={resp} onChange={e => setResp(e.target.value)} placeholder="24" className="vet-input" /></Field>
            <Field label="BP Systolic (mmHg)"><input type="number" value={bpSys} onChange={e => setBpSys(e.target.value)} placeholder="120" className="vet-input" /></Field>
            <Field label="BP Diastolic (mmHg)"><input type="number" value={bpDia} onChange={e => setBpDia(e.target.value)} placeholder="80" className="vet-input" /></Field>
            <Field label="Oxygen (L/min)"><input type="number" step="0.5" value={oxygen} onChange={e => setOxygen(e.target.value)} placeholder="เช่น 2" className="vet-input" /></Field>
          </div>

          {/* Intake */}
          <div className="vet-divider"><ArrowDown className="w-3.5 h-3.5 text-sky-600" /> Intake (เข้า)</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Fluid / rate (ml/hr)"><input type="number" value={fluidRate} onChange={e => setFluidRate(e.target.value)} placeholder="เช่น 10" className="vet-input" /></Field>
            <Field label="Water (ml)"><input type="number" value={water} onChange={e => setWater(e.target.value)} placeholder="30" className="vet-input" /></Field>
          </div>

          {/* Output */}
          <div className="vet-divider"><ArrowUp className="w-3.5 h-3.5 text-amber-600" /> Output (ออก)</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="UOP (ml)"><input type="number" value={uop} onChange={e => setUop(e.target.value)} placeholder="30" className="vet-input" /></Field>
            <Field label="Feces score (1–5)"><input type="number" min={1} max={5} value={fecesScore} onChange={e => setFecesScore(e.target.value)} placeholder="3" className="vet-input" /></Field>
            <Field label="Vomit (ml)"><input type="number" value={vomit} onChange={e => setVomit(e.target.value)} placeholder="0" className="vet-input" /></Field>
            <Field label="Drain (ml)"><input type="number" value={drain} onChange={e => setDrain(e.target.value)} placeholder="0" className="vet-input" /></Field>
          </div>

          {/* อาหาร (Feeding) */}
          <div className="vet-divider"><Apple className="w-3.5 h-3.5 text-orange-500" /> อาหาร (Feeding)</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-3"><Field label="ประเภทอาหาร"><input type="text" value={food} onChange={e => setFood(e.target.value)} placeholder="เช่น อาหารอ่อน i/d, นม, ยาน้ำ" className="vet-input" /></Field></div>
            <Field label="ปริมาณ"><input type="text" value={foodAmount} onChange={e => setFoodAmount(e.target.value)} placeholder="50 ml / 1/4 กระป๋อง" className="vet-input" /></Field>
            <Field label="Route"><select value={feedRoute} onChange={e => setFeedRoute(e.target.value as FeedRoute)} className="vet-select"><option value="Oral">Oral</option><option value="Syringe Feed">Syringe Feed</option><option value="Tube Feed">Tube Feed</option></select></Field>
          </div>
          {hasFood && (
            <Field label={`% ที่กินจริง — ${intakePct}%`}>
              <input type="range" min={0} max={100} step={5} value={intakePct} onChange={e => setIntakePct(parseInt(e.target.value))} className="w-full" />
            </Field>
          )}

          <Field label="หมายเหตุ"><input type="text" value={note} onChange={e => setNote(e.target.value)} className="vet-input" placeholder="ลักษณะ สี กลิ่น อาการอื่น ๆ..." /></Field>
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} disabled={!hasAny} className="vet-btn vet-btn-orange inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> บันทึก</button>
        </div>
      </motion.div>
    </div>
  );
}

