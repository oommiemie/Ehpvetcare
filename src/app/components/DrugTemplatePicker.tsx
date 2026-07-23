import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutTemplate, Plus, Pencil, Trash2, Check, X, Pill, RefreshCw, ChevronDown, FileText, Stethoscope, Search } from "lucide-react";

export interface PresetDrug {
  name: string;
  genericName?: string;
  qty: number;
  unit: string;
  price: number;
  instruction: string;
  indication: string;
  perDay?: number;   // จำนวนที่ใช้ต่อวัน (ไม่ระบุ = ใช้ qty เป็น 1 วัน)
  days?: number;     // จำนวนวัน (ไม่ระบุ = 1)
}

export interface DrugPreset {
  id: string;
  name: string;
  drugs: PresetDrug[];
}

export interface CatalogDrug {
  id: number;
  genericName: string;
  tradeName: string;
  unit: string;
  pricePerUnit: number;
  defaultInstruction: string;
  defaultIndication: string;
}

function loadPresets(key: string, seed: Omit<DrugPreset, "id">[]): DrugPreset[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as DrugPreset[];
  } catch {
    /* ignore corrupt storage */
  }
  return seed.map((p, i) => ({ id: `seed-${i}`, ...p }));
}

const emptyDrug = (): PresetDrug => ({ name: "", genericName: "", qty: 1, unit: "เม็ด", price: 0, instruction: "", indication: "" });

const fieldCls = "text-[12.5px] text-gray-700 rounded-lg border border-gray-200 px-2.5 py-1.5 bg-white focus:outline-none focus:border-(--brand)";

/**
 * Preset picker for the "ใบสั่งยา" section — saves named groups of drugs.
 * Selecting a preset adds all its drugs to the prescription via `onApply`.
 * The create/edit popup is a full editor: add, edit, and remove drug rows, or
 * pull the current prescription in. Presets persist in localStorage.
 */
export function DrugTemplatePicker({
  storageKey,
  catalog,
  currentDrugs,
  onApply,
  seed = [],
}: {
  storageKey: string;
  catalog: CatalogDrug[];
  currentDrugs: PresetDrug[];
  onApply: (drugs: PresetDrug[], name: string) => void;
  seed?: Omit<DrugPreset, "id">[];
}) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [presets, setPresets] = useState<DrugPreset[]>(() => loadPresets(storageKey, seed));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dName, setDName] = useState("");
  const [dDrugs, setDDrugs] = useState<PresetDrug[]>([]);
  const [openDrugRow, setOpenDrugRow] = useState<number | null>(null);
  const [drugSearch, setDrugSearch] = useState("");
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
    setDDrugs([emptyDrug()]);
    setModalOpen(true);
  };

  const openEdit = (p: DrugPreset) => {
    setEditingId(p.id);
    setDName(p.name);
    setDDrugs(p.drugs.length ? p.drugs.map(d => ({ ...d })) : [emptyDrug()]);
    setModalOpen(true);
  };

  const updateRow = (i: number, patch: Partial<PresetDrug>) =>
    setDDrugs(prev => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const addRow = () => setDDrugs(prev => [...prev, emptyDrug()]);
  const removeRow = (i: number) => setDDrugs(prev => prev.filter((_, idx) => idx !== i));
  const selectDrug = (i: number, tradeName: string) => {
    const c = catalog.find(x => x.tradeName === tradeName);
    if (!c) { updateRow(i, { name: "", genericName: "" }); return; }
    updateRow(i, {
      name: c.tradeName,
      genericName: c.genericName,
      unit: c.unit,
      price: c.pricePerUnit,
      instruction: c.defaultInstruction,
      indication: c.defaultIndication,
    });
  };

  const cleaned = dDrugs.filter(d => d.name.trim());
  const canSave = dName.trim().length > 0 && cleaned.length > 0;

  const submit = () => {
    if (!canSave) return;
    const data = { name: dName.trim(), drugs: cleaned };
    if (editingId) {
      setPresets(prev => prev.map(x => (x.id === editingId ? { ...x, ...data } : x)));
    } else {
      setPresets(prev => [{ id: `d-${Date.now()}`, ...data }, ...prev]);
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
        style={{ fontWeight: 600, background: "color-mix(in srgb, var(--brand) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)" }}
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
            className="absolute right-0 top-full mt-2 z-50 w-[320px] bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
              <span className="text-[12px] text-gray-800" style={{ fontWeight: 700 }}>ชุดยา</span>
              <span className="text-[10px] text-gray-400">{presets.length} ชุด</span>
            </div>

            <div className="p-2.5 border-b border-gray-100">
              <button
                type="button"
                onClick={openCreate}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] text-(--brand-dark) border border-dashed border-(--brand)/45 hover:bg-(--brand)/5 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-3.5 h-3.5" /> สร้างชุดยาใหม่
              </button>
            </div>

            <div className="max-h-[260px] overflow-y-auto p-1.5">
              {presets.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-5">ยังไม่มีชุดยา</p>
              ) : (
                presets.map(p => (
                  <div key={p.id} className="group rounded-xl hover:bg-gray-50 transition-colors px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { onApply(p.drugs, p.name); setOpen(false); }}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 600 }}>{p.name}</p>
                        <p className="text-[10.5px] text-gray-400 truncate mt-0.5">
                          {p.drugs.length} รายการ · {p.drugs.slice(0, 2).map(d => d.name).join(", ")}{p.drugs.length > 2 ? "…" : ""}
                        </p>
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

      {/* Create / edit editor popup */}
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
              className="bg-white rounded-2xl w-full max-w-[520px] max-h-[88vh] flex flex-col overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-dark))" }}>
                  {editingId ? <Pencil className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4" />}
                </div>
                <h3 className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>
                  {editingId ? "แก้ไขชุดยา" : "สร้างชุดยาใหม่"}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} className="ml-auto w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 overflow-y-auto">
                <div>
                  <label className="text-[10.5px] text-gray-400 mb-1.5 block" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>ชื่อชุดยา</label>
                  <input value={dName} onChange={e => setDName(e.target.value)} autoFocus placeholder="เช่น ชุดท้องเสีย" className={`w-full ${fieldCls}`} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10.5px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>รายการยา ({cleaned.length})</label>
                    <button
                      type="button"
                      onClick={() => setDDrugs(currentDrugs.length ? currentDrugs.map(d => ({ ...d })) : [emptyDrug()])}
                      disabled={currentDrugs.length === 0}
                      className="inline-flex items-center gap-1 text-[10.5px] text-(--brand-dark) disabled:opacity-40"
                      style={{ fontWeight: 600 }}
                      title="ดึงรายการยาจากใบสั่งยาปัจจุบัน"
                    >
                      <RefreshCw className="w-3 h-3" /> ดึงจากใบสั่งยาปัจจุบัน ({currentDrugs.length})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {dDrugs.map((d, i) => (
                      <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                        {/* Drug header */}
                        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100" style={{ background: "linear-gradient(180deg,#f7faf9,#ffffff)" }}>
                          <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-colors" style={{ background: d.name ? "linear-gradient(135deg,#34d399,#059669)" : "linear-gradient(135deg,#cbd5e1,#94a3b8)" }}>
                            <Pill className="w-4 h-4" />
                          </span>
                          <button type="button" onClick={() => { setOpenDrugRow(openDrugRow === i ? null : i); setDrugSearch(""); }} className="flex-1 min-w-0 flex items-center justify-between gap-2 text-[12.5px] rounded-lg border border-gray-200 px-2.5 py-1.5 bg-white text-left hover:border-gray-300 transition-colors">
                            <span className="truncate" style={{ fontWeight: d.name ? 600 : 400, color: d.name ? "#111827" : "#9ca3af" }}>{d.name ? (d.genericName || d.name) : "เลือกยาจากคลัง…"}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openDrugRow === i ? "rotate-180" : ""}`} />
                          </button>
                          {!!d.name && <span className="text-[11px] px-2 py-0.5 rounded-full bg-(--brand)/10 text-(--brand-dark) flex-shrink-0" style={{ fontWeight: 700 }}>฿{d.price.toLocaleString()}</span>}
                          <button type="button" onClick={() => removeRow(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 flex-shrink-0 transition-colors" title="ลบยา">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Inline searchable drug list */}
                        {openDrugRow === i && (
                          <div className="border-b border-gray-100 p-2 bg-gray-50/60">
                            <div className="relative mb-1.5">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input value={drugSearch} onChange={e => setDrugSearch(e.target.value)} autoFocus placeholder="ค้นหายา…" className="w-full text-[12px] rounded-lg border border-gray-200 pl-8 pr-2 py-1.5 bg-white focus:outline-none focus:border-(--brand)" />
                            </div>
                            <div className="max-h-[180px] overflow-y-auto space-y-0.5">
                              {catalog
                                .filter(c => {
                                  const q = drugSearch.trim().toLowerCase();
                                  return !q || c.genericName.toLowerCase().includes(q) || c.tradeName.toLowerCase().includes(q);
                                })
                                .map(c => {
                                  const active = d.name === c.tradeName;
                                  return (
                                    <button key={c.id} type="button" onClick={() => { selectDrug(i, c.tradeName); setOpenDrugRow(null); }} className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${active ? "bg-(--brand)/10" : "hover:bg-white"}`}>
                                      <div className="min-w-0">
                                        <p className="text-[12px] truncate" style={{ fontWeight: 600, color: active ? "var(--brand-dark)" : "#1f2937" }}>{c.genericName}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{c.tradeName}</p>
                                      </div>
                                      <span className="text-[11px] text-(--brand-dark) flex-shrink-0" style={{ fontWeight: 700 }}>฿{c.pricePerUnit}</span>
                                    </button>
                                  );
                                })}
                              {catalog.filter(c => { const q = drugSearch.trim().toLowerCase(); return !q || c.genericName.toLowerCase().includes(q) || c.tradeName.toLowerCase().includes(q); }).length === 0 && (
                                <p className="text-[11px] text-gray-400 text-center py-3">ไม่พบยา</p>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Body */}
                        <div className="p-3 space-y-2.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>จำนวน</span>
                            <div className="inline-flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
                              <button type="button" onClick={() => updateRow(i, { qty: Math.max(0, d.qty - 1) })} className="w-7 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-[15px]">−</button>
                              <input type="text" inputMode="numeric" value={d.qty} onChange={e => updateRow(i, { qty: Number(e.target.value.replace(/\D/g, "")) || 0 })} className="w-10 text-center text-[12.5px] text-gray-800 border-x border-gray-200 py-1.5 focus:outline-none" style={{ fontWeight: 700 }} />
                              <button type="button" onClick={() => updateRow(i, { qty: d.qty + 1 })} className="w-7 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-[15px]">+</button>
                            </div>
                            {!!d.name && <span className="text-[11px] text-gray-400">{d.unit}</span>}
                            {!!d.name && <span className="ml-auto text-[11px] text-gray-400">รวม <span className="text-(--brand-dark)" style={{ fontWeight: 700 }}>฿{(d.qty * d.price).toLocaleString()}</span></span>}
                          </div>
                          <div className="relative">
                            <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-300" />
                            <input value={d.instruction} onChange={e => updateRow(i, { instruction: e.target.value })} placeholder="คำแนะนำการใช้ยา เช่น กินวันละ 2 ครั้ง หลังอาหาร" className="w-full text-[12.5px] text-gray-700 rounded-xl border border-gray-200 pl-9 pr-3 py-2 bg-white focus:outline-none focus:border-(--brand)" />
                          </div>
                          <div className="relative">
                            <Stethoscope className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-300" />
                            <input value={d.indication} onChange={e => updateRow(i, { indication: e.target.value })} placeholder="ข้อบ่งใช้ เช่น ติดเชื้อแบคทีเรีย" className="w-full text-[12.5px] text-gray-700 rounded-xl border border-gray-200 pl-9 pr-3 py-2 bg-white focus:outline-none focus:border-(--brand)" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] text-(--brand-dark) border border-dashed border-(--brand)/45 hover:bg-(--brand)/5 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มรายการยา
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3.5 py-1.5 text-[12px] text-gray-600 rounded-full hover:bg-gray-100" style={{ fontWeight: 600 }}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSave}
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
