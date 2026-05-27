import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  FileSpreadsheet, ArrowLeft, Bed, Activity, Pill, FlaskConical, Image as ImageIcon,
  Receipt, AlertTriangle, Users, TrendingUp, Download, Calendar,
} from "lucide-react";
import { useIPD } from "../contexts/IPDContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import { toCSV, downloadFile, formatBaht } from "../utils/format";

export function IPDReports() {
  const navigate = useNavigate();
  const { admits, cages, vitals, nursingNotes, drugs, labs, imagings, bills, payments, mar } = useIPD();
  const { showSnackbar } = useSnackbar();

  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    let rows: any[] = [];
    let headers: { key: string; label: string }[] = [];
    let filename = "";

    switch (activeReport) {
      case "census":
        rows = admits.map(a => ({
          hn: a.hn, name: a.petName, species: a.species, breed: a.breed,
          cage: a.cageId, severity: a.severity, diagnosis: a.diagnosis,
          admitDate: a.admitDate, doctor: a.doctor,
        }));
        headers = [
          { key: "hn", label: "HN" }, { key: "name", label: "ชื่อสัตว์" },
          { key: "species", label: "ชนิด" }, { key: "breed", label: "พันธุ์" },
          { key: "cage", label: "กรง" }, { key: "severity", label: "ระดับ" },
          { key: "diagnosis", label: "การวินิจฉัย" }, { key: "admitDate", label: "วันที่ Admit" },
          { key: "doctor", label: "แพทย์" },
        ];
        filename = `IPD-Census-${today}.csv`;
        break;
      case "occupancy":
        rows = cages.map(c => ({
          id: c.id, ward: c.ward, type: c.type, status: c.status,
          patient: admits.find(a => a.id === c.patientId)?.petName ?? "",
        }));
        headers = [
          { key: "id", label: "กรง" }, { key: "ward", label: "Ward" },
          { key: "type", label: "ประเภท" }, { key: "status", label: "สถานะ" },
          { key: "patient", label: "ผู้ป่วย" },
        ];
        filename = `IPD-Cage-Occupancy-${today}.csv`;
        break;
      case "med":
        rows = drugs.map(d => ({
          drug: d.drugName, dose: d.dose, route: d.route, freq: d.frequency,
          orderedBy: d.orderedBy, orderedAt: d.orderedAt,
        }));
        headers = [
          { key: "drug", label: "ชื่อยา" }, { key: "dose", label: "Dose" },
          { key: "route", label: "Route" }, { key: "freq", label: "Frequency" },
          { key: "orderedBy", label: "สั่งโดย" }, { key: "orderedAt", label: "เวลาสั่ง" },
        ];
        filename = `IPD-Medication-${today}.csv`;
        break;
      case "revenue":
        rows = bills.map(b => ({
          date: b.date, category: b.category, description: b.description,
          qty: b.qty, price: b.unitPrice, total: b.total,
        }));
        headers = [
          { key: "date", label: "วันที่" }, { key: "category", label: "หมวด" },
          { key: "description", label: "รายการ" }, { key: "qty", label: "จำนวน" },
          { key: "price", label: "ราคา/หน่วย" }, { key: "total", label: "รวม" },
        ];
        filename = `IPD-Revenue-${today}.csv`;
        break;
      case "lab":
        rows = labs.map(l => ({
          type: l.labType, custom: l.customName ?? "", priority: l.priority,
          status: l.status, orderedBy: l.orderedBy, result: l.result ?? "",
        }));
        headers = [
          { key: "type", label: "ชุดตรวจ" }, { key: "custom", label: "ระบุ" },
          { key: "priority", label: "Priority" }, { key: "status", label: "สถานะ" },
          { key: "orderedBy", label: "สั่งโดย" }, { key: "result", label: "ผล" },
        ];
        filename = `IPD-Lab-${today}.csv`;
        break;
      case "xray":
        rows = imagings.map(i => ({
          type: i.type, position: i.position, status: i.status,
          findings: i.findings ?? "", orderedBy: i.orderedBy,
        }));
        headers = [
          { key: "type", label: "ประเภท" }, { key: "position", label: "ตำแหน่ง" },
          { key: "status", label: "สถานะ" }, { key: "findings", label: "Findings" },
          { key: "orderedBy", label: "สั่งโดย" },
        ];
        filename = `IPD-XRay-${today}.csv`;
        break;
      case "nursing":
        rows = [
          ...vitals.map(v => ({ kind: "Vital", time: v.timestamp, by: v.recordedBy, detail: `T${v.temp} P${v.pulse} R${v.resp}` })),
          ...nursingNotes.map(n => ({ kind: n.kind, time: n.timestamp, by: n.recordedBy, detail: n.note ?? n.assessment ?? "" })),
          ...mar.filter(m => m.status === "Administered").map(m => ({ kind: "MAR", time: m.administeredAt ?? m.scheduledAt, by: m.administeredBy ?? "", detail: "ติ๊กให้ยา" })),
        ];
        headers = [
          { key: "kind", label: "ประเภท" }, { key: "time", label: "เวลา" },
          { key: "by", label: "ผู้บันทึก" }, { key: "detail", label: "รายละเอียด" },
        ];
        filename = `IPD-Nursing-Activity-${today}.csv`;
        break;
      case "treatment":
        rows = [...drugs, ...labs, ...imagings].map((item: any) => ({
          time: item.orderedAt, kind: "drugName" in item ? "ยา" : "labType" in item ? "Lab" : "Imaging",
          detail: item.drugName ?? item.customName ?? item.labType ?? item.type,
          by: item.orderedBy,
        }));
        headers = [
          { key: "time", label: "เวลา" }, { key: "kind", label: "ประเภท" },
          { key: "detail", label: "รายการ" }, { key: "by", label: "สั่งโดย" },
        ];
        filename = `IPD-Daily-Treatment-${today}.csv`;
        break;
      case "mortality":
        rows = admits.map(a => ({
          hn: a.hn, name: a.petName, status: a.dischargedAt ? "Discharged" : "Active",
          admitDate: a.admitDate, dischargedAt: a.dischargedAt ?? "",
        }));
        headers = [
          { key: "hn", label: "HN" }, { key: "name", label: "ชื่อ" },
          { key: "status", label: "สถานะ" }, { key: "admitDate", label: "Admit" },
          { key: "dischargedAt", label: "Discharged" },
        ];
        filename = `IPD-Mortality-${today}.csv`;
        break;
    }

    if (rows.length === 0) {
      showSnackbar("warning", "ยังไม่มีข้อมูลสำหรับรายงานนี้");
      return;
    }
    downloadFile(filename, toCSV(rows, headers));
    showSnackbar("success", `Export ${rows.length} แถว → ${filename}`);
  };
  const [activeReport, setActiveReport] = useState<string>("census");

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
    return { total, occupied, available, cleaning, maintenance, byType };
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
    return { discharged: dischargedCount, alive: admits.length };
  }, [admits]);

  /* ─── Daily treatment chart (mock from existing data) ─── */
  const dailyTreatment = useMemo(() => {
    const days: Record<string, number> = {};
    [...drugs, ...labs, ...imagings].forEach(item => {
      const t = "orderedAt" in item ? item.orderedAt : "";
      if (!t) return;
      const day = t.slice(0, 10);
      days[day] = (days[day] ?? 0) + 1;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  }, [drugs, labs, imagings]);

  const reports = [
    { key: "census",    label: "Census",        icon: Users,         color: "#0ea5e9" },
    { key: "occupancy", label: "Cage Occupancy", icon: Bed,           color: "#19a589" },
    { key: "treatment", label: "Daily Treatment", icon: Activity,      color: "#8b5cf6" },
    { key: "med",       label: "Medication",    icon: Pill,          color: "#ec4899" },
    { key: "revenue",   label: "Revenue",       icon: Receipt,       color: "#f59e0b" },
    { key: "nursing",   label: "Nursing",       icon: Activity,      color: "#10b981" },
    { key: "lab",       label: "Lab Stats",     icon: FlaskConical,  color: "#a855f7" },
    { key: "xray",      label: "X-Ray Stats",   icon: ImageIcon,     color: "#3b82f6" },
    { key: "mortality", label: "Mortality",     icon: AlertTriangle, color: "#ef4444" },
  ];

  const PIE_COLORS = ["#19a589", "#0ea5e9", "#a855f7", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

  return (
    <div className="p-4 space-y-4 min-h-full" style={{ background: "#FEFBF8" }}>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden" style={{
          backgroundImage: `radial-gradient(at 100% 0%, rgba(45,212,191,0.55) 0%, transparent 55%), radial-gradient(at 0% 100%, rgba(8,75,62,0.65) 0%, transparent 60%), linear-gradient(135deg, #1aa78b 0%, #0e5e4f 100%)`,
        }}>
          <div className="absolute -top-24 -right-16 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 65%)" }} />
        </div>
        <div className="relative p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/ipd")} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.16)", color: "white", border: "1px solid rgba(255,255,255,0.30)" }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))", border: "1px solid rgba(255,255,255,0.30)" }}>
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: 22 }}>รายงาน IPD</h1>
              <p className="text-white/70" style={{ fontSize: 12 }}>9 รายงานหลัก · ดูสถิติแบบ Real-time</p>
            </div>
          </div>
          <button onClick={() => handleExport()} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </motion.section>

      {/* Report tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 overflow-x-auto" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-1 min-w-min">
          {reports.map(r => {
            const Ico = r.icon;
            const isActive = activeReport === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setActiveReport(r.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
                style={{
                  background: isActive ? r.color : "transparent",
                  color: isActive ? "#ffffff" : "#374151",
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 12,
                  boxShadow: isActive ? `0 4px 12px ${r.color}55` : "none",
                  textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                }}
              >
                <Ico className="w-3.5 h-3.5" />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report content */}
      <div>
        {activeReport === "census" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="ผู้ป่วยตามระดับความรุนแรง">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={census.bySeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {census.bySeverity.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card title="ผู้ป่วยตามชนิดสัตว์">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={census.bySpecies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#19a589" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="สรุปจำนวนผู้ป่วย" full>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="รวมทั้งหมด" value={census.total} color="#0ea5e9" />
                {census.bySeverity.map((s, i) => <Stat key={s.name} label={s.name} value={s.value} color={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </div>
            </Card>
          </div>
        )}

        {activeReport === "occupancy" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="อัตราการใช้กรง">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="ใช้งาน" value={cageOccupancy.occupied} color="#0ea5e9" />
                <Stat label="ว่าง" value={cageOccupancy.available} color="#10b981" />
                <Stat label="ทำความสะอาด" value={cageOccupancy.cleaning} color="#f59e0b" />
                <Stat label="ปิดซ่อม" value={cageOccupancy.maintenance} color="#ef4444" />
              </div>
              <div className="mt-3 text-center text-[28px]" style={{ fontWeight: 800, color: "#0d7c66" }}>
                {Math.round((cageOccupancy.occupied / cageOccupancy.total) * 100)}%
              </div>
              <div className="text-center text-[11px] text-gray-500">อัตราการครอบครองรวม</div>
            </Card>
            <Card title="แยกตามประเภทกรง">
              <div className="space-y-2">
                {Object.entries(cageOccupancy.byType).map(([type, stats]) => {
                  const pct = (stats.occupied / stats.total) * 100;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between text-[12px] mb-1">
                        <span className="text-gray-700" style={{ fontWeight: 600 }}>{type}</span>
                        <span className="text-gray-500">{stats.occupied}/{stats.total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #19a589, #0d7c66)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeReport === "treatment" && (
          <Card title="กิจกรรมการรักษารายวัน (7 วันล่าสุด)" full>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTreatment}>
                <defs>
                  <linearGradient id="cTreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#cTreat)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {activeReport === "med" && (
          <Card title="ยอดการใช้ยา (Top 10)" full>
            {medUsage.length === 0 ? <Empty label="ยังไม่มีข้อมูลการสั่งยา" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={medUsage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ec4899" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}

        {activeReport === "revenue" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="สรุปรายได้">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="ค่ารักษารวม" value={`฿${revenue.total.toLocaleString()}`} color="#0ea5e9" />
                <Stat label="เก็บได้แล้ว" value={`฿${revenue.paid.toLocaleString()}`} color="#10b981" />
                <Stat label="ค้างชำระ" value={`฿${revenue.outstanding.toLocaleString()}`} color="#f59e0b" />
              </div>
            </Card>
            <Card title="แยกหมวดรายได้">
              {revenue.byCategory.length === 0 ? <Empty label="ยังไม่มีรายการ" /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={revenue.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {revenue.byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        )}

        {activeReport === "nursing" && (
          <Card title="กิจกรรมการพยาบาล" full>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Stat label="Vital Signs" value={nursingActivity.vitalCount} color="#ec4899" />
              <Stat label="Nursing Notes" value={nursingActivity.noteCount} color="#10b981" />
              <Stat label="SOAP" value={nursingActivity.soapCount} color="#19a589" />
              <Stat label="MAR ให้แล้ว" value={nursingActivity.marAdministered} color="#0ea5e9" />
              <Stat label="MAR รอ" value={nursingActivity.marPending} color="#f59e0b" />
            </div>
          </Card>
        )}

        {activeReport === "lab" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="สรุป Lab">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="ทั้งหมด" value={labStats.total} color="#0ea5e9" />
                <Stat label="STAT" value={labStats.stat} color="#ef4444" />
                <Stat label="เสร็จแล้ว" value={labStats.completed} color="#10b981" />
                <Stat label="รอผล" value={labStats.pending} color="#f59e0b" />
              </div>
            </Card>
            <Card title="ตามชุดตรวจ">
              {labStats.byType.length === 0 ? <Empty label="ยังไม่มีคำสั่ง Lab" /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={labStats.byType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#a855f7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        )}

        {activeReport === "xray" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="สรุป Imaging">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="ทั้งหมด" value={xrayStats.total} color="#3b82f6" />
                <Stat label="เสร็จแล้ว" value={xrayStats.completed} color="#10b981" />
              </div>
            </Card>
            <Card title="ตามประเภท">
              {xrayStats.byType.length === 0 ? <Empty label="ยังไม่มีคำสั่ง Imaging" /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={xrayStats.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {xrayStats.byType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        )}

        {activeReport === "mortality" && (
          <Card title="สถิติการจำหน่ายผู้ป่วย" full>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Discharge แล้ว" value={mortality.discharged} color="#10b981" />
              <Stat label="ยังรักษาอยู่" value={mortality.alive} color="#0ea5e9" />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <section className={full ? "lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4" : "bg-white rounded-2xl border border-gray-100 p-4"} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
      <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: 14 }}>{title}</h3>
      {children}
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="p-3 rounded-2xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="text-[10px] text-gray-500" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>{label}</div>
      <div className="text-[22px] mt-0.5" style={{ fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-[12px]" style={{ fontWeight: 600 }}>{label}</div>;
}
