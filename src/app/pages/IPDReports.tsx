import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, LabelList,
} from "recharts";
import {
  FileSpreadsheet, Bed, Activity, Pill, FlaskConical, Image as ImageIcon,
  Receipt, AlertTriangle, Users, TrendingUp, Download, ChevronDown, HeartPulse,
} from "lucide-react";
import { useIPD } from "../contexts/IPDContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useLang } from "../contexts/LanguageContext";
import { toCSV, downloadFile, formatBaht } from "../utils/format";

const PALETTE = ["#0d9488", "#2563eb", "#7c3aed", "#d97706", "#e11d48", "#0891b2", "#db2777", "#4f46e5"];
const SEVERITY_COLOR: Record<string, string> = {
  Critical: "#e11d48", วิกฤต: "#e11d48",
  Recovering: "#059669", ฟื้นตัว: "#059669",
  Observation: "#2563eb", สังเกตอาการ: "#2563eb",
  Isolation: "#d97706", แยกกัก: "#d97706",
  Stable: "#7c3aed", คงที่: "#7c3aed",
};
const sevColor = (n: string, i: number) => SEVERITY_COLOR[n] ?? PALETTE[i % PALETTE.length];

export function IPDReports() {
  const { t } = useLang();
  const { admits, cages, vitals, nursingNotes, drugs, labs, imagings, bills, payments, mar } = useIPD();
  const { showSnackbar } = useSnackbar();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  /* ─── Compute report data ─── */
  const census = useMemo(() => {
    const total = admits.length;
    const bySeverity: Record<string, number> = {};
    admits.forEach(a => { bySeverity[a.severity] = (bySeverity[a.severity] ?? 0) + 1; });
    const bySpecies: Record<string, number> = {};
    admits.forEach(a => { bySpecies[a.species] = (bySpecies[a.species] ?? 0) + 1; });
    return {
      total,
      bySeverity: Object.entries(bySeverity).map(([name, value]) => ({ name, value })),
      bySpecies: Object.entries(bySpecies).map(([name, value]) => ({ name, value })),
    };
  }, [admits]);

  const cageOccupancy = useMemo(() => {
    const total = cages.length;
    const occupied = cages.filter(c => c.status === "occupied").length;
    const available = cages.filter(c => c.status === "available").length;
    const cleaning = cages.filter(c => c.status === "cleaning").length;
    const maintenance = cages.filter(c => c.status === "maintenance").length;
    const byType: Record<string, { total: number; occupied: number }> = {};
    cages.forEach(c => {
      byType[c.type] = byType[c.type] ?? { total: 0, occupied: 0 };
      byType[c.type].total++;
      if (c.status === "occupied") byType[c.type].occupied++;
    });
    return { total, occupied, available, cleaning, maintenance, byType, pct: total ? Math.round((occupied / total) * 100) : 0 };
  }, [cages]);

  const revenue = useMemo(() => {
    const total = bills.reduce((s, b) => s + b.total, 0);
    const paid = payments.reduce((s, p) => s + p.amount, 0);
    const outstanding = total - paid;
    const byCategory: Record<string, number> = {};
    bills.forEach(b => { byCategory[b.category] = (byCategory[b.category] ?? 0) + b.total; });
    return {
      total, paid, outstanding,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    };
  }, [bills, payments]);

  const medUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    drugs.forEach(d => { usage[d.drugName] = (usage[d.drugName] ?? 0) + 1; });
    return Object.entries(usage).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [drugs]);

  const labStats = useMemo(() => {
    const total = labs.length;
    const completed = labs.filter(l => l.status === "Completed").length;
    const pending = labs.filter(l => l.status !== "Completed" && l.status !== "Cancelled").length;
    const stat = labs.filter(l => l.priority === "STAT").length;
    const byType: Record<string, number> = {};
    labs.forEach(l => { byType[l.labType] = (byType[l.labType] ?? 0) + 1; });
    return { total, completed, pending, stat, byType: Object.entries(byType).map(([name, value]) => ({ name, value })) };
  }, [labs]);

  const xrayStats = useMemo(() => {
    const total = imagings.length;
    const completed = imagings.filter(i => i.status === "Completed").length;
    const byType: Record<string, number> = {};
    imagings.forEach(i => { byType[i.type] = (byType[i.type] ?? 0) + 1; });
    return { total, completed, byType: Object.entries(byType).map(([name, value]) => ({ name, value })) };
  }, [imagings]);

  const nursingActivity = useMemo(() => ({
    vitalCount: vitals.length,
    noteCount: nursingNotes.length,
    soapCount: nursingNotes.filter(n => n.kind === "SOAP").length,
    marAdministered: mar.filter(m => m.status === "Administered").length,
    marPending: mar.filter(m => m.status === "Pending").length,
  }), [vitals, nursingNotes, mar]);

  const mortality = useMemo(() => {
    const dischargedCount = admits.filter(a => !!a.dischargedAt).length;
    return { discharged: dischargedCount, alive: admits.length - dischargedCount };
  }, [admits]);

  const dailyTreatment = useMemo(() => {
    const days: Record<string, number> = {};
    [...drugs, ...labs, ...imagings].forEach(item => {
      const t = "orderedAt" in item ? (item as any).orderedAt : "";
      if (!t) return;
      const day = t.slice(0, 10);
      days[day] = (days[day] ?? 0) + 1;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  }, [drugs, labs, imagings]);

  const reports = [
    { key: "census", label: "Census", icon: Users, color: "#0ea5e9" },
    { key: "occupancy", label: "Cage Occupancy", icon: Bed, color: "var(--brand)" },
    { key: "treatment", label: "Daily Treatment", icon: Activity, color: "#8b5cf6" },
    { key: "med", label: "Medication", icon: Pill, color: "#ec4899" },
    { key: "revenue", label: "Revenue", icon: Receipt, color: "#f59e0b" },
    { key: "nursing", label: "Nursing", icon: HeartPulse, color: "#10b981" },
    { key: "lab", label: "Lab Stats", icon: FlaskConical, color: "#a855f7" },
    { key: "xray", label: "Medical Imaging Stats", icon: ImageIcon, color: "#3b82f6" },
    { key: "mortality", label: "Mortality", icon: AlertTriangle, color: "#ef4444" },
  ];

  const handleExport = (reportKey: string) => {
    const today = new Date().toISOString().slice(0, 10);
    let rows: any[] = [];
    let headers: { key: string; label: string }[] = [];
    let filename = "";

    switch (reportKey) {
      case "census":
        rows = admits.map(a => ({ hn: a.hn, name: a.petName, species: a.species, breed: a.breed, cage: a.cageId, severity: a.severity, diagnosis: a.diagnosis, admitDate: a.admitDate, doctor: a.doctor }));
        headers = [{ key: "hn", label: "HN" }, { key: "name", label: "ชื่อสัตว์" }, { key: "species", label: "ชนิด" }, { key: "breed", label: "พันธุ์" }, { key: "cage", label: "กรง" }, { key: "severity", label: "ระดับ" }, { key: "diagnosis", label: "การวินิจฉัย" }, { key: "admitDate", label: "วันที่ Admit" }, { key: "doctor", label: "แพทย์" }];
        filename = `IPD-Census-${today}.csv`; break;
      case "occupancy":
        rows = cages.map(c => ({ id: c.id, ward: c.ward, type: c.type, status: c.status, patient: admits.find(a => a.id === c.patientId)?.petName ?? "" }));
        headers = [{ key: "id", label: "กรง" }, { key: "ward", label: "Ward" }, { key: "type", label: "ประเภท" }, { key: "status", label: "สถานะ" }, { key: "patient", label: "ผู้ป่วย" }];
        filename = `IPD-Cage-Occupancy-${today}.csv`; break;
      case "med":
        rows = drugs.map(d => ({ drug: d.drugName, dose: d.dose, route: d.route, freq: d.frequency, orderedBy: d.orderedBy, orderedAt: d.orderedAt }));
        headers = [{ key: "drug", label: "ชื่อยา" }, { key: "dose", label: "Dose" }, { key: "route", label: "Route" }, { key: "freq", label: "Frequency" }, { key: "orderedBy", label: "สั่งโดย" }, { key: "orderedAt", label: "เวลาสั่ง" }];
        filename = `IPD-Medication-${today}.csv`; break;
      case "revenue":
        rows = bills.map(b => ({ date: b.date, category: b.category, description: b.description, qty: b.qty, price: b.unitPrice, total: b.total }));
        headers = [{ key: "date", label: "วันที่" }, { key: "category", label: "หมวด" }, { key: "description", label: "รายการ" }, { key: "qty", label: "จำนวน" }, { key: "price", label: "ราคา/หน่วย" }, { key: "total", label: "รวม" }];
        filename = `IPD-Revenue-${today}.csv`; break;
      case "lab":
        rows = labs.map(l => ({ type: l.labType, custom: l.customName ?? "", priority: l.priority, status: l.status, orderedBy: l.orderedBy, result: l.result ?? "" }));
        headers = [{ key: "type", label: "ชุดตรวจ" }, { key: "custom", label: "ระบุ" }, { key: "priority", label: "Priority" }, { key: "status", label: "สถานะ" }, { key: "orderedBy", label: "สั่งโดย" }, { key: "result", label: "ผล" }];
        filename = `IPD-Lab-${today}.csv`; break;
      case "xray":
        rows = imagings.map(i => ({ type: i.type, position: i.position, status: i.status, findings: i.findings ?? "", orderedBy: i.orderedBy }));
        headers = [{ key: "type", label: "ประเภท" }, { key: "position", label: "ตำแหน่ง" }, { key: "status", label: "สถานะ" }, { key: "findings", label: "Findings" }, { key: "orderedBy", label: "สั่งโดย" }];
        filename = `IPD-XRay-${today}.csv`; break;
      case "nursing":
        rows = [
          ...vitals.map(v => ({ kind: "Vital", time: v.timestamp, by: v.recordedBy, detail: `T${v.temp} P${v.pulse} R${v.resp}` })),
          ...nursingNotes.map(n => ({ kind: n.kind, time: n.timestamp, by: n.recordedBy, detail: n.note ?? n.assessment ?? "" })),
          ...mar.filter(m => m.status === "Administered").map(m => ({ kind: "MAR", time: m.administeredAt ?? m.scheduledAt, by: m.administeredBy ?? "", detail: "ติ๊กให้ยา" })),
        ];
        headers = [{ key: "kind", label: "ประเภท" }, { key: "time", label: "เวลา" }, { key: "by", label: "ผู้บันทึก" }, { key: "detail", label: "รายละเอียด" }];
        filename = `IPD-Nursing-Activity-${today}.csv`; break;
      case "treatment":
        rows = [...drugs, ...labs, ...imagings].map((item: any) => ({ time: item.orderedAt, kind: "drugName" in item ? "ยา" : "labType" in item ? "Lab" : "Imaging", detail: item.drugName ?? item.customName ?? item.labType ?? item.type, by: item.orderedBy }));
        headers = [{ key: "time", label: "เวลา" }, { key: "kind", label: "ประเภท" }, { key: "detail", label: "รายการ" }, { key: "by", label: "สั่งโดย" }];
        filename = `IPD-Daily-Treatment-${today}.csv`; break;
      case "mortality":
        rows = admits.map(a => ({ hn: a.hn, name: a.petName, status: a.dischargedAt ? "Discharged" : "Active", admitDate: a.admitDate, dischargedAt: a.dischargedAt ?? "" }));
        headers = [{ key: "hn", label: "HN" }, { key: "name", label: "ชื่อ" }, { key: "status", label: "สถานะ" }, { key: "admitDate", label: "Admit" }, { key: "dischargedAt", label: "Discharged" }];
        filename = `IPD-Mortality-${today}.csv`; break;
    }

    if (rows.length === 0) { showSnackbar("warning", "ยังไม่มีข้อมูลสำหรับรายงานนี้"); return; }
    downloadFile(filename, toCSV(rows, headers));
    showSnackbar("success", `Export ${rows.length} แถว → ${filename}`);
  };

  const sevColors = census.bySeverity.map((s, i) => sevColor(s.name, i));
  const occData = [
    { name: "ใช้งาน", value: cageOccupancy.occupied, color: "#2563eb" },
    { name: "ว่าง", value: cageOccupancy.available, color: "#059669" },
    { name: "ทำความสะอาด", value: cageOccupancy.cleaning, color: "#d97706" },
    { name: "ปิดซ่อม", value: cageOccupancy.maintenance, color: "#e11d48" },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 sm:p-5 space-y-5 min-h-full" style={{ background: "#FEFBF8" }}>
      {/* ─── HERO ─── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          backgroundImage: `radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%), radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.7) 0%, transparent 60%), linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)`,
        }}>
          <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)" }} />
          <div className="absolute -bottom-28 left-1/4 w-[260px] h-[260px] rounded-full" style={{ background: "radial-gradient(circle, rgba(var(--brand-hero-accent), 0.35) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)" }} />
        </div>

        <div className="relative p-5 sm:p-6 flex flex-col gap-5">
          {/* Top row: title + export */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))", border: "1px solid rgba(255,255,255,0.32)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.12)" }}>
                <FileSpreadsheet className="w-[22px] h-[22px] text-white" />
              </div>
              <div>
                <h1 className="text-white" style={{ fontWeight: 800, fontSize: "calc(25px * var(--fs))", letterSpacing: "-0.5px", lineHeight: 1.12 }}>{t("ipdReports.title")}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ background: "#6ee7b7" }} />
                    <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ background: "#6ee7b7" }} />
                  </span>
                  <p className="text-white/75" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 500 }}>ภาพรวม 9 รายงาน · อัปเดตแบบ Real-time</p>
                </div>
              </div>
            </div>

            {/* Export dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setExportMenuOpen(o => !o)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
                style={{ background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)", border: "1px solid var(--hero-btn-border)", boxShadow: "var(--hero-btn-shadow)", fontWeight: 600,  }}
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportMenuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {exportMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl overflow-hidden p-1.5"
                      style={{ width: 230, boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
                    >
                      <p className="text-[10px] text-gray-400 px-2 py-1.5" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>เลือกรายงานที่จะ Export</p>
                      {reports.map(r => {
                        const Ico = r.icon;
                        return (
                          <button key={r.key} onClick={() => { handleExport(r.key); setExportMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${r.color} 7.8%, transparent)` }}>
                              <Ico className="w-3.5 h-3.5" style={{ color: r.color }} strokeWidth={2.2} />
                            </span>
                            <span className="text-[12px] text-gray-800 flex-1" style={{ fontWeight: 600 }}>{r.label}</span>
                            <Download className="w-3 h-3 text-gray-300" />
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* KPI chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiChip icon={Users} label="ผู้ป่วยทั้งหมด" value={census.total} accent="#5eead4" />
            <KpiChip icon={Bed} label="ครอบครองกรง" value={`${cageOccupancy.pct}%`} accent="#7dd3fc" />
            <KpiChip icon={Receipt} label="รายได้รวม" value={formatBaht(revenue.total)} accent="#fcd34d" />
            <KpiChip icon={TrendingUp} label="ค้างชำระ" value={formatBaht(revenue.outstanding)} accent="#fda4af" />
          </div>
        </div>
      </motion.section>

      {/* ─── ALL REPORTS — single page, grouped by section ─── */}
      <div className="space-y-7">
        <SectionGroup label="ภาพรวมผู้ป่วย" icon={Users} color="#0ea5e9">
        {/* Census — severity donut */}
        <ChartCard title="ผู้ป่วยตามระดับความรุนแรง" subtitle="สัดส่วนผู้ป่วยในปัจจุบัน" icon={Users} color="#0ea5e9" onExport={() => handleExport("census")}>
          {census.bySeverity.length === 0 ? <Empty label="ยังไม่มีผู้ป่วย" /> : (
            <>
              <Donut data={census.bySeverity} colors={sevColors} />
              <Legend data={census.bySeverity} colors={sevColors} />
            </>
          )}
        </ChartCard>

        {/* Census — species bar */}
        <ChartCard title="ผู้ป่วยตามชนิดสัตว์" subtitle="จำนวนแยกตามสายพันธุ์" icon={Activity} color="var(--brand)" onExport={() => handleExport("census")}>
          {census.bySpecies.length === 0 ? <Empty label="ยังไม่มีผู้ป่วย" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={census.bySpecies} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="barTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="var(--brand-dark)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "color-mix(in srgb, var(--brand) 6%, transparent)" }} />
                <Bar dataKey="value" fill="url(#barTeal)" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: "calc(11px * var(--fs))", fontWeight: 700, fill: "#64748b" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        </SectionGroup>

        <SectionGroup label="ทรัพยากร & กรง" icon={Bed} color="var(--brand)">
        {/* Cage occupancy donut */}
        <ChartCard title="อัตราการครอบครองกรง" subtitle={`${cageOccupancy.occupied}/${cageOccupancy.total} กรงถูกใช้งาน`} icon={Bed} color="var(--brand)" onExport={() => handleExport("occupancy")}>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <Donut data={occData} colors={occData.map(d => d.color)} centerLabel={`${cageOccupancy.pct}%`} centerSub="ครอบครอง" />
            </div>
            <div className="grid grid-cols-1 gap-1.5 flex-shrink-0 w-[118px]">
              <MiniStat label="ใช้งาน" value={cageOccupancy.occupied} color="#2563eb" />
              <MiniStat label="ว่าง" value={cageOccupancy.available} color="#059669" />
              <MiniStat label="ทำความสะอาด" value={cageOccupancy.cleaning} color="#d97706" />
              <MiniStat label="ปิดซ่อม" value={cageOccupancy.maintenance} color="#e11d48" />
            </div>
          </div>
        </ChartCard>

        {/* Cage by type */}
        <ChartCard title="การใช้งานแยกตามประเภทกรง" subtitle="อัตราการใช้งานของแต่ละประเภท" icon={Bed} color="var(--brand-dark)">
          <div className="space-y-3 pt-1">
            {Object.entries(cageOccupancy.byType).map(([type, stats]) => {
              const pct = stats.total ? (stats.occupied / stats.total) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-[12px] mb-1.5">
                    <span className="text-gray-700" style={{ fontWeight: 600 }}>{type}</span>
                    <span className="text-gray-400" style={{ fontWeight: 600 }}>{stats.occupied}/{stats.total} · {Math.round(pct)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--brand) 65%, white), var(--brand-dark))" }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
        </SectionGroup>

        <SectionGroup label="การรักษา" icon={Activity} color="#8b5cf6">
        {/* Daily treatment area */}
        <ChartCard title="กิจกรรมการรักษารายวัน" subtitle="คำสั่งยา/Lab/Imaging · 7 วันล่าสุด" icon={Activity} color="#8b5cf6" onExport={() => handleExport("treatment")} full>
          {dailyTreatment.length === 0 ? <Empty label="ยังไม่มีข้อมูลการรักษา" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyTreatment} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="cTreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="count" name="กิจกรรม" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#cTreat)" dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Medication top 10 */}
        <ChartCard title="ยอดการใช้ยา (Top 10)" subtitle="ยาที่ถูกสั่งบ่อยที่สุด" icon={Pill} color="#ec4899" onExport={() => handleExport("med")} full>
          {medUsage.length === 0 ? <Empty label="ยังไม่มีข้อมูลการสั่งยา" /> : (
            <ResponsiveContainer width="100%" height={Math.max(220, medUsage.length * 34)}>
              <BarChart data={medUsage} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="barPink" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#475569" }} width={140} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(236,72,153,0.06)" }} />
                <Bar dataKey="value" name="ครั้ง" fill="url(#barPink)" radius={[0, 8, 8, 0]} maxBarSize={22}>
                  <LabelList dataKey="value" position="right" style={{ fontSize: "calc(11px * var(--fs))", fontWeight: 700, fill: "#64748b" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        </SectionGroup>

        <SectionGroup label="การเงิน" icon={Receipt} color="#f59e0b">
        {/* Revenue summary */}
        <ChartCard title="สรุปรายได้" subtitle="ค่ารักษาและการชำระเงิน" icon={Receipt} color="#f59e0b" onExport={() => handleExport("revenue")}>
          <div className="space-y-2.5 pt-1">
            <RevenueRow label="ค่ารักษารวม" value={revenue.total} color="#0ea5e9" pct={100} />
            <RevenueRow label="เก็บได้แล้ว" value={revenue.paid} color="#10b981" pct={revenue.total ? (revenue.paid / revenue.total) * 100 : 0} />
            <RevenueRow label="ค้างชำระ" value={revenue.outstanding} color="#f59e0b" pct={revenue.total ? (revenue.outstanding / revenue.total) * 100 : 0} />
          </div>
        </ChartCard>

        {/* Revenue by category */}
        <ChartCard title="รายได้แยกตามหมวด" subtitle="สัดส่วนค่าใช้จ่าย" icon={Receipt} color="#f59e0b" onExport={() => handleExport("revenue")}>
          {revenue.byCategory.length === 0 ? <Empty label="ยังไม่มีรายการ" /> : (
            <>
              <Donut data={revenue.byCategory} colors={PALETTE} money />
              <Legend data={revenue.byCategory} colors={PALETTE} money />
            </>
          )}
        </ChartCard>
        </SectionGroup>

        <SectionGroup label="Lab & Imaging" icon={FlaskConical} color="#a855f7">
        {/* Lab stats */}
        <ChartCard title="สถิติ Lab" subtitle="คำสั่งตรวจทางห้องปฏิบัติการ" icon={FlaskConical} color="#a855f7" onExport={() => handleExport("lab")}>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatTile label="ทั้งหมด" value={labStats.total} color="#0ea5e9" />
            <StatTile label="STAT" value={labStats.stat} color="#ef4444" />
            <StatTile label="เสร็จแล้ว" value={labStats.completed} color="#10b981" />
            <StatTile label="รอผล" value={labStats.pending} color="#f59e0b" />
          </div>
          {labStats.byType.length > 0 && (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={labStats.byType} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="barPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(168,85,247,0.06)" }} />
                <Bar dataKey="value" name="คำสั่ง" fill="url(#barPurple)" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: "calc(11px * var(--fs))", fontWeight: 700, fill: "#64748b" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Medical Imaging stats */}
        <ChartCard title="สถิติ Imaging / Medical Imaging" subtitle="คำสั่งถ่ายภาพรังสี" icon={ImageIcon} color="#3b82f6" onExport={() => handleExport("xray")}>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatTile label="ทั้งหมด" value={xrayStats.total} color="#3b82f6" />
            <StatTile label="เสร็จแล้ว" value={xrayStats.completed} color="#10b981" />
          </div>
          {xrayStats.byType.length === 0 ? <Empty label="ยังไม่มีคำสั่ง Imaging" /> : (
            <>
              <Donut data={xrayStats.byType} colors={PALETTE} height={180} />
              <Legend data={xrayStats.byType} colors={PALETTE} />
            </>
          )}
        </ChartCard>
        </SectionGroup>

        <SectionGroup label="การพยาบาล & การจำหน่าย" icon={HeartPulse} color="#10b981">
        {/* Nursing */}
        <ChartCard title="กิจกรรมการพยาบาล" subtitle="บันทึกการดูแลผู้ป่วย" icon={HeartPulse} color="#10b981" onExport={() => handleExport("nursing")}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Vital Signs" value={nursingActivity.vitalCount} color="#ec4899" />
            <StatTile label="Nursing Notes" value={nursingActivity.noteCount} color="#10b981" />
            <StatTile label="SOAP" value={nursingActivity.soapCount} color="var(--brand)" />
            <StatTile label="MAR ให้แล้ว" value={nursingActivity.marAdministered} color="#0ea5e9" />
            <StatTile label="MAR รอ" value={nursingActivity.marPending} color="#f59e0b" />
          </div>
        </ChartCard>

        {/* Mortality / discharge */}
        <ChartCard title="สถิติการจำหน่ายผู้ป่วย" subtitle="ผู้ป่วยที่จำหน่ายและกำลังรักษา" icon={AlertTriangle} color="#ef4444" onExport={() => handleExport("mortality")}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Discharge แล้ว" value={mortality.discharged} color="#10b981" />
            <StatTile label="ยังรักษาอยู่" value={mortality.alive} color="#0ea5e9" />
          </div>
        </ChartCard>
        </SectionGroup>
      </div>
    </div>
  );
}

/* ═══════════ Shared pieces ═══════════ */
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

function ChartCard({ title, subtitle, icon: Ico, color, onExport, full, children }: {
  title: string; subtitle?: string; icon: React.ElementType; color: string; onExport?: () => void; full?: boolean; children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: "0 2px 4px rgba(0,0,0,0.03), 0 16px 36px rgba(0,0,0,0.08), 0 36px 64px rgba(0,0,0,0.05)" }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={`relative rounded-3xl p-5 overflow-hidden ${full ? "lg:col-span-2" : ""}`}
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #fefcfa 100%)", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 10px 28px rgba(0,0,0,0.05), 0 28px 56px rgba(0,0,0,0.03)" }}
    >
      {/* soft color glow — top-right corner */}
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-12 w-44 h-44 rounded-full" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${color} 7.8%, transparent) 0%, transparent 70%)` }} />
      {/* soft top accent */}
      <div aria-hidden className="pointer-events-none absolute top-0 left-6 right-6 h-px" style={{ background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${color} 33.3%, transparent), transparent)` }} />
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${color} 12.2%, transparent), color-mix(in srgb, ${color} 3.9%, transparent))`, border: `1px solid color-mix(in srgb, ${color} 14.1%, transparent)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6)` }}>
          <Ico className="w-[18px] h-[18px]" style={{ color }} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: "calc(14.5px * var(--fs))", letterSpacing: "-0.2px" }}>{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-400 truncate mt-0.5">{subtitle}</p>}
        </div>
        {onExport && (
          <button onClick={onExport} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0" title="Export CSV" aria-label="Export CSV">
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </motion.section>
  );
}

function SectionGroup({ label, icon: Ico, color, children }: {
  label: string; icon: React.ElementType; color: string; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 px-1 mb-3">
        <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${color} 8.6%, transparent)` }}>
          <Ico className="w-3.5 h-3.5" style={{ color }} strokeWidth={2.4} />
        </span>
        <h2 className="text-gray-700 flex-shrink-0" style={{ fontWeight: 800, fontSize: "calc(13px * var(--fs))", letterSpacing: "-0.1px" }}>{label}</h2>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.08), transparent)" }} />
      </div>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      >
        {children}
      </motion.div>
    </section>
  );
}

function KpiChip({ icon: Ico, label, value, accent }: { icon: React.ElementType; label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-2xl px-3.5 py-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${accent} 14.9%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 26.7%, transparent)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}>
        <Ico className="w-[18px] h-[18px]" style={{ color: accent }} strokeWidth={2.3} />
      </div>
      <div className="min-w-0">
        <p className="text-white/70 text-[10px] truncate" style={{ fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>{label}</p>
        <p className="text-white text-[20px] truncate" style={{ fontWeight: 800, letterSpacing: "-0.4px", lineHeight: 1.25 }}>{value}</p>
      </div>
    </div>
  );
}

function Donut({ data, colors, height = 220, money, centerLabel, centerSub }: {
  data: { name: string; value: number }[]; colors: string[]; height?: number; money?: boolean; centerLabel?: string; centerSub?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="68%" outerRadius="90%" paddingAngle={data.length > 1 ? 4 : 0} cornerRadius={7} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip content={<ChartTip money={money} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-gray-900" style={{ fontWeight: 800, fontSize: centerLabel ? 26 : 24, letterSpacing: "-0.5px" }}>
          {centerLabel ?? (money ? formatBaht(total) : total)}
        </span>
        <span className="text-[10px] text-gray-400" style={{ fontWeight: 600 }}>{centerSub ?? "รวม"}</span>
      </div>
    </div>
  );
}

function Legend({ data, colors, money }: { data: { name: string; value: number }[]; colors: string[]; money?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `color-mix(in srgb, ${colors[i % colors.length]} 5.9%, transparent)`, border: `1px solid color-mix(in srgb, ${colors[i % colors.length]} 13.3%, transparent)` }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
          <span className="text-[11px] text-gray-600" style={{ fontWeight: 600 }}>{d.name}</span>
          <span className="text-[11px]" style={{ fontWeight: 800, color: colors[i % colors.length] }}>{money ? formatBaht(d.value) : d.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartTip({ active, payload, label, money }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white px-3 py-2" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.05)" }}>
      {label !== undefined && label !== "" && <p className="text-[10px] text-gray-400 mb-1" style={{ fontWeight: 600 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color ?? p.payload?.fill ?? "var(--brand)" }} />
          <span className="text-[12px] text-gray-800" style={{ fontWeight: 700 }}>
            {p.name}: {money ? formatBaht(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatTile({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="p-3 rounded-2xl" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent) 0%, color-mix(in srgb, ${color} 7.8%, transparent) 100%)`, border: `1px solid color-mix(in srgb, ${color} 25.1%, transparent)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)" }}>
      <div className="text-[10px] text-gray-600" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>{label}</div>
      <div className="text-[22px] mt-0.5" style={{ fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[10.5px] text-gray-500 flex-1 truncate" style={{ fontWeight: 600 }}>{label}</span>
      <span className="text-[12px] text-gray-900" style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}

function RevenueRow({ label, value, color, pct }: { label: string; value: number; color: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] text-gray-700" style={{ fontWeight: 600 }}>{label}</span>
        <span className="text-[13px]" style={{ fontWeight: 800, color, letterSpacing: "-0.2px" }}>{formatBaht(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-[12px]" style={{ fontWeight: 600 }}>{label}</div>;
}
