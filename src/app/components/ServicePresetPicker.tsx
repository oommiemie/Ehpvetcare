import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutTemplate, Plus, Pencil, Trash2, Check, X, Home, Stethoscope } from "lucide-react";

export interface ServicePreset {
  id: string;
  name: string;
  visitType: string;
  room: string;
  doctor: string;
}

function loadPresets(key: string, seed: Omit<ServicePreset, "id">[]): ServicePreset[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as ServicePreset[];
  } catch {
    /* ignore corrupt storage */
  }
  return seed.map((p, i) => ({ id: `seed-${i}`, ...p }));
}

const selectCls =
  "w-full text-[13px] text-gray-700 rounded-xl border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-(--brand)";

/**
 * Preset picker for the "รายละเอียดบริการ" section — saves combinations of
 * visit type + exam room + doctor. Selecting a preset fills all three fields
 * at once via `onApply`. Presets persist in localStorage and can be created,
 * edited, and deleted.
 */
export function ServicePresetPicker({
  storageKey,
  visitTypeOptions,
  roomOptions,
  doctorOptions,
  onApply,
  seed = [],
}: {
  storageKey: string;
  visitTypeOptions: string[];
  roomOptions: string[];
  doctorOptions: string[];
  onApply: (p: ServicePreset) => void;
  seed?: Omit<ServicePreset, "id">[];
}) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [presets, setPresets] = useState<ServicePreset[]>(() => loadPresets(storageKey, seed));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dName, setDName] = useState("");
  const [dType, setDType] = useState(visitTypeOptions[0] ?? "");
  const [dRoom, setDRoom] = useState(roomOptions[0] ?? "");
  const [dDoctor, setDDoctor] = useState(doctorOptions[0] ?? "");
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(presets));
    } catch {
      /* ignore quota errors */
    }
  }, [presets, storageKey]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const openCreate = () => {
    setEditingId(null);
    setDName("");
    setDType(visitTypeOptions[0] ?? "");
    setDRoom(roomOptions[0] ?? "");
    setDDoctor(doctorOptions[0] ?? "");
    setModalOpen(true);
  };

  const openEdit = (p: ServicePreset) => {
    setEditingId(p.id);
    setDName(p.name);
    setDType(p.visitType);
    setDRoom(p.room);
    setDDoctor(p.doctor);
    setModalOpen(true);
  };

  const submit = () => {
    const name = dName.trim();
    if (!name) return;
    const data = { name, visitType: dType, room: dRoom, doctor: dDoctor };
    if (editingId) {
      setPresets(prev => prev.map(x => (x.id === editingId ? { ...x, ...data } : x)));
    } else {
      setPresets(prev => [{ id: `p-${Date.now()}`, ...data }, ...prev]);
    }
    setEditingId(null);
    setModalOpen(false);
  };

  const remove = (id: string) => setPresets(prev => prev.filter(x => x.id !== id));

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-(--brand-dark) hover:bg-(--brand)/15 transition-colors"
        style={{ fontWeight: 600, background: "color-mix(in srgb, var(--brand) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)" }}
      >
        <LayoutTemplate className="w-3.5 h-3.5" /> Template
      </button>

      {/* Dropdown list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 480, damping: 32 }}
            className="absolute right-0 top-full mt-2 z-50 w-[300px] bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
              <span className="text-[12px] text-gray-800" style={{ fontWeight: 700 }}>พรีเซ็ตบริการ</span>
              <span className="text-[10px] text-gray-400">{presets.length} รายการ</span>
            </div>

            <div className="p-2.5 border-b border-gray-100">
              <button
                type="button"
                onClick={openCreate}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] text-(--brand-dark) border border-dashed border-(--brand)/45 hover:bg-(--brand)/5 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-3.5 h-3.5" /> สร้างพรีเซ็ตใหม่
              </button>
            </div>

            <div className="max-h-[240px] overflow-y-auto p-1.5">
              {presets.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-5">ยังไม่มีพรีเซ็ต</p>
              ) : (
                presets.map(p => (
                  <div key={p.id} className="group rounded-xl hover:bg-gray-50 transition-colors px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { onApply(p); setOpen(false); }}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-gray-400">
                          <span className="inline-flex items-center gap-1 truncate"><Home className="w-3 h-3 text-(--brand)" /> {p.room}</span>
                          <span className="inline-flex items-center gap-1 truncate"><Stethoscope className="w-3 h-3 text-(--brand)" /> {p.doctor}</span>
                        </div>
                      </button>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button type="button" onClick={() => openEdit(p)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600" title="แก้ไข">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => remove(p.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500" title="ลบ">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / edit popup */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-[380px] overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-dark))" }}>
                  {editingId ? <Pencil className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4" />}
                </div>
                <h3 className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>
                  {editingId ? "แก้ไขพรีเซ็ต" : "สร้างพรีเซ็ตใหม่"}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} className="ml-auto w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ชื่อพรีเซ็ต</label>
                  <input value={dName} onChange={e => setDName(e.target.value)} autoFocus placeholder="เช่น ตรวจผิวหนัง" className={selectCls} />
                </div>
                <div>
                  <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ประเภทการตรวจ</label>
                  <select value={dType} onChange={e => setDType(e.target.value)} className={selectCls}>
                    {visitTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ห้องตรวจ</label>
                  <select value={dRoom} onChange={e => setDRoom(e.target.value)} className={selectCls}>
                    {roomOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>สัตวแพทย์</label>
                  <select value={dDoctor} onChange={e => setDDoctor(e.target.value)} className={selectCls}>
                    {doctorOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3.5 py-1.5 text-[12px] text-gray-600 rounded-full hover:bg-gray-100" style={{ fontWeight: 600 }}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!dName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded-full disabled:opacity-40"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg,var(--brand),var(--brand-dark))" }}
                >
                  <Check className="w-3.5 h-3.5" /> บันทึก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
