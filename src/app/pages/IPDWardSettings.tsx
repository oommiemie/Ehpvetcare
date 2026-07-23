import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Bed, Plus, Pencil, Trash2, Settings, Check, AlertTriangle, Power, Building2, X } from "lucide-react";
import { useIPD, type CageType, type CageStatus, type Cage, type Ward } from "../contexts/IPDContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";

const CAGE_TYPES: CageType[] = ["Small", "Medium", "Large", "ICU", "Isolation", "Oxygen"];
const CAGE_STATUSES: { value: CageStatus; label: string; color: string }[] = [
  { value: "available",   label: "ว่าง",         color: "#10b981" },
  { value: "occupied",    label: "มีผู้ป่วย",    color: "#3b82f6" },
  { value: "cleaning",    label: "ทำความสะอาด",  color: "#f59e0b" },
  { value: "maintenance", label: "ซ่อมบำรุง",    color: "#ef4444" },
];

const fieldCls = "w-full text-[12.5px] text-gray-700 rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-(--brand)";

export function IPDWardSettings() {
  const navigate = useNavigate();
  const { cages, addCage, updateCage, removeCage, wards, addWard, updateWard, removeWard, toggleWard } = useIPD();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();

  // New-cage form state
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState("");
  const [newWard, setNewWard] = useState("Ward A — Small");
  const [newType, setNewType] = useState<CageType>("Small");
  const [newStatus, setNewStatus] = useState<CageStatus>("available");

  // Ward management state
  const [showWardForm, setShowWardForm] = useState(false);
  const [newWardName, setNewWardName] = useState("");
  const [editingWardId, setEditingWardId] = useState<string | null>(null);
  const [editingWardName, setEditingWardName] = useState("");

  const handleAddWard = () => {
    const name = newWardName.trim();
    if (!name) return;
    if (wards.some(w => w.name.toLowerCase() === name.toLowerCase())) {
      showSnackbar("warning", "ชื่อ Ward นี้มีอยู่แล้ว");
      return;
    }
    addWard({ name, enabled: true });
    showSnackbar("success", `เพิ่ม Ward "${name}" แล้ว`);
    setNewWardName("");
    setShowWardForm(false);
  };

  const handleStartEditWard = (w: Ward) => {
    setEditingWardId(w.id);
    setEditingWardName(w.name);
  };

  const handleSaveEditWard = (w: Ward) => {
    const name = editingWardName.trim();
    if (!name) { setEditingWardId(null); return; }
    updateWard(w.id, { name });
    showSnackbar("success", "แก้ไขชื่อ Ward แล้ว");
    setEditingWardId(null);
  };

  const handleRemoveWard = async (w: Ward) => {
    const cageCount = cages.filter(c => c.ward === w.name).length;
    if (cageCount > 0) {
      showSnackbar("warning", `ลบไม่ได้ — มี ${cageCount} กรงใน Ward นี้`);
      return;
    }
    const ok = await confirm({
      title: `ลบ Ward "${w.name}"?`,
      description: "การกระทำนี้ย้อนกลับไม่ได้",
      confirmLabel: "ลบ Ward",
      kind: "danger",
    });
    if (ok) {
      removeWard(w.id);
      showSnackbar("delete", `ลบ Ward "${w.name}" แล้ว`);
    }
  };

  const wardNames = Array.from(new Set(cages.map(c => c.ward)));
  const grouped = wardNames.map(w => ({ ward: w, list: cages.filter(c => c.ward === w) }));

  const isDuplicate = cages.some(c => c.id === newId.trim());
  const canAdd = newId.trim() && !isDuplicate && newWard.trim();

  const handleAdd = () => {
    if (!canAdd) return;
    addCage({ id: newId.trim(), ward: newWard.trim(), type: newType, status: newStatus });
    showSnackbar("success", `เพิ่มกรง ${newId} แล้ว`);
    setNewId("");
    setShowForm(false);
  };

  const handleRemove = async (cage: Cage) => {
    if (cage.status === "occupied") {
      showSnackbar("warning", "ลบกรงไม่ได้ — มีผู้ป่วยอยู่");
      return;
    }
    const ok = await confirm({
      title: `ลบกรง ${cage.id}?`,
      description: `${cage.ward} · ${cage.type} — การกระทำนี้ย้อนกลับไม่ได้`,
      confirmLabel: "ลบกรง",
      kind: "danger",
    });
    if (ok) {
      removeCage(cage.id);
      showSnackbar("delete", `ลบกรง ${cage.id} แล้ว`);
    }
  };

  return (
    <div className="p-4 space-y-4 min-h-full" style={{ background: "#FEFBF8" }}>
      {/* Appbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate("/ipd/ward")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0" style={{ fontWeight: 500 }}>
            <ArrowLeft className="w-3.5 h-3.5" /> กลับ
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0 text-[12px]">
            <span className="text-gray-400">IPD</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400">Ward</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 truncate" style={{ fontWeight: 600 }}>ตั้งค่ากรง / Ward</span>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> เพิ่มกรงใหม่
        </button>
      </motion.div>

      {/* New-cage form */}
      {showForm && (
        <motion.section
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
              <Plus className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>เพิ่มกรงใหม่</h3>
              <p className="text-[11px] text-gray-500">กำหนดรหัสกรง ward ประเภท และสถานะเริ่มต้น</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="vet-label">รหัสกรง <span className="required">*</span></label>
              <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="เช่น A-07" className={fieldCls} />
              {isDuplicate && newId && <p className="text-[10.5px] text-rose-500 mt-1 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> รหัสนี้มีอยู่แล้ว</p>}
            </div>
            <div>
              <label className="vet-label">Ward</label>
              <input value={newWard} onChange={e => setNewWard(e.target.value)} placeholder="เช่น Ward A — Small" className={fieldCls} />
            </div>
            <div>
              <label className="vet-label">ประเภท</label>
              <select value={newType} onChange={e => setNewType(e.target.value as CageType)} className={fieldCls}>
                {CAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="vet-label">สถานะเริ่มต้น</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as CageStatus)} className={fieldCls}>
                {CAGE_STATUSES.filter(s => s.value !== "occupied").map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="px-4 pb-4 flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setNewId(""); }} className="px-3.5 py-1.5 text-[12px] text-gray-600 rounded-full hover:bg-gray-100" style={{ fontWeight: 600 }}>ยกเลิก</button>
            <button onClick={handleAdd} disabled={!canAdd} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> เพิ่มกรง
            </button>
          </div>
        </motion.section>
      )}

      {/* Cages list, grouped by ward */}
      <div className="space-y-4">
        {grouped.map(group => {
          const counts = CAGE_STATUSES.map(s => ({ ...s, n: group.list.filter(c => c.status === s.value).length }));
          return (
            <section key={group.ward} className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
              <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80 flex-wrap">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
                  <Bed className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>{group.ward}</h3>
                  <p className="text-[11px] text-gray-500">{group.list.length} กรง</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {counts.map(c => (
                    <span key={c.value} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px]" style={{ fontWeight: 700, background: `color-mix(in srgb, ${c.color} 7.8%, transparent)`, color: c.color, border: `1px solid color-mix(in srgb, ${c.color} 25.1%, transparent)` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} /> {c.label} {c.n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5">
                {group.list.map(cage => {
                  const sCfg = CAGE_STATUSES.find(s => s.value === cage.status)!;
                  return (
                    <div key={cage.id} className="group flex items-center gap-3 rounded-xl border border-gray-100 p-2.5 hover:shadow-sm transition-shadow bg-white">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: `linear-gradient(135deg, ${sCfg.color}, color-mix(in srgb, ${sCfg.color} 86.7%, transparent))` }}>
                        <Bed className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] text-gray-900 truncate" style={{ fontWeight: 700, letterSpacing: "-0.2px" }}>{cage.id}</p>
                        <p className="text-[11px] text-gray-500 truncate">{cage.type}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={cage.status}
                          onChange={e => updateCage(cage.id, { status: e.target.value as CageStatus })}
                          disabled={cage.status === "occupied"}
                          className="text-[11px] rounded-lg border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:border-(--brand) disabled:opacity-50"
                          style={{ fontWeight: 600, color: sCfg.color }}
                        >
                          {CAGE_STATUSES.map(s => <option key={s.value} value={s.value} disabled={s.value === "occupied" && cage.status !== "occupied"}>{s.label}</option>)}
                        </select>
                        <button onClick={() => handleRemove(cage)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="ลบกรง">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400">ยังไม่มีกรง — กด "เพิ่มกรงใหม่" เพื่อเริ่ม</p>
          </div>
        )}
      </div>
    </div>
  );
}
