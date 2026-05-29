import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutTemplate, Plus, Pencil, Trash2, Check, X } from "lucide-react";

export interface SymptomSet {
  id: string;
  name: string;
  symptoms: string[];
}

function loadSets(key: string, seed: Omit<SymptomSet, "id">[]): SymptomSet[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as SymptomSet[];
  } catch {
    /* ignore corrupt storage */
  }
  return seed.map((s, i) => ({ id: `seed-${i}`, ...s }));
}

/**
 * Preset picker for the "อาการที่พบ" section — saves named groups of symptoms.
 * Selecting a set applies all its symptoms at once via `onApply`. Sets persist
 * in localStorage and can be created, edited (chip multi-select), and deleted.
 */
export function SymptomSetPicker({
  storageKey,
  options,
  onApply,
  seed = [],
}: {
  storageKey: string;
  options: string[];
  onApply: (symptoms: string[]) => void;
  seed?: Omit<SymptomSet, "id">[];
}) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sets, setSets] = useState<SymptomSet[]>(() => loadSets(storageKey, seed));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dName, setDName] = useState("");
  const [dSymptoms, setDSymptoms] = useState<string[]>([]);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sets));
    } catch {
      /* ignore quota errors */
    }
  }, [sets, storageKey]);

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
    setDSymptoms([]);
    setModalOpen(true);
  };

  const openEdit = (s: SymptomSet) => {
    setEditingId(s.id);
    setDName(s.name);
    setDSymptoms(s.symptoms);
    setModalOpen(true);
  };

  const toggleDraft = (sym: string) =>
    setDSymptoms(prev => (prev.includes(sym) ? prev.filter(x => x !== sym) : [...prev, sym]));

  const submit = () => {
    const name = dName.trim();
    if (!name || dSymptoms.length === 0) return;
    const data = { name, symptoms: dSymptoms };
    if (editingId) {
      setSets(prev => prev.map(x => (x.id === editingId ? { ...x, ...data } : x)));
    } else {
      setSets(prev => [{ id: `s-${Date.now()}`, ...data }, ...prev]);
    }
    setEditingId(null);
    setModalOpen(false);
  };

  const remove = (id: string) => setSets(prev => prev.filter(x => x.id !== id));

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-[#0d7c66] hover:bg-[#19a589]/15 transition-colors"
        style={{ fontWeight: 600, background: "rgba(25,165,137,0.08)", border: "1px solid rgba(25,165,137,0.20)" }}
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
              <span className="text-[12px] text-gray-800" style={{ fontWeight: 700 }}>ชุดอาการ</span>
              <span className="text-[10px] text-gray-400">{sets.length} ชุด</span>
            </div>

            <div className="p-2.5 border-b border-gray-100">
              <button
                type="button"
                onClick={openCreate}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] text-[#0d7c66] border border-dashed border-[#19a589]/45 hover:bg-[#19a589]/5 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-3.5 h-3.5" /> สร้างชุดอาการใหม่
              </button>
            </div>

            <div className="max-h-[240px] overflow-y-auto p-1.5">
              {sets.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-5">ยังไม่มีชุดอาการ</p>
              ) : (
                sets.map(s => (
                  <div key={s.id} className="group rounded-xl hover:bg-gray-50 transition-colors px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { onApply(s.symptoms); setOpen(false); }}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{s.name}</p>
                        <p className="text-[10.5px] text-gray-400 truncate mt-0.5">
                          {s.symptoms.slice(0, 3).join(" · ")}{s.symptoms.length > 3 ? ` +${s.symptoms.length - 3}` : ""}
                        </p>
                      </button>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button type="button" onClick={() => openEdit(s)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600" title="แก้ไข">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => remove(s.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500" title="ลบ">
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
              className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                  {editingId ? <Pencil className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4" />}
                </div>
                <h3 className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>
                  {editingId ? "แก้ไขชุดอาการ" : "สร้างชุดอาการใหม่"}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} className="ml-auto w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ชื่อชุดอาการ</label>
                  <input value={dName} onChange={e => setDName(e.target.value)} autoFocus placeholder="เช่น ทางเดินอาหาร" className="w-full text-[13px] text-gray-700 rounded-xl border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-[#19a589]" />
                </div>
                <div>
                  <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>เลือกอาการ ({dSymptoms.length})</label>
                  <div className="flex flex-wrap gap-1.5">
                    {options.map(sym => {
                      const active = dSymptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => toggleDraft(sym)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] rounded-full transition-all"
                          style={{
                            background: active ? "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)" : "#ffffff",
                            border: active ? "1px solid #0d7c66" : "1px solid #e5e7eb",
                            color: active ? "#ffffff" : "#6b7280",
                            fontWeight: active ? 700 : 500,
                          }}
                        >
                          {active && <Check className="w-3 h-3" strokeWidth={3} />}
                          {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3.5 py-1.5 text-[12px] text-gray-600 rounded-full hover:bg-gray-100" style={{ fontWeight: 600 }}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!dName.trim() || dSymptoms.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-white rounded-full disabled:opacity-40"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg,#19a589,#0d7c66)" }}
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
