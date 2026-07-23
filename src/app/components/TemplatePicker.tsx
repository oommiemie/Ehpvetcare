import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutTemplate, Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface Template {
  id: string;
  text: string;
}

function loadTemplates(key: string, seed: string[]): Template[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as Template[];
  } catch {
    /* ignore corrupt storage */
  }
  return seed.map((t, i) => ({ id: `seed-${i}`, text: t }));
}

/**
 * Reusable "Template" picker — a button that opens a popup of saved text
 * templates. Templates can be created, edited, and deleted, and persist in
 * localStorage under `storageKey`. Selecting one calls `onSelect(text)`.
 * Both create and edit happen in a centered popup dialog.
 */
export function TemplatePicker({
  storageKey,
  title = "เทมเพลต",
  onSelect,
  seed = [],
}: {
  storageKey: string;
  title?: string;
  onSelect: (text: string) => void;
  seed?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>(() => loadTemplates(storageKey, seed));
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(templates));
    } catch {
      /* ignore quota errors */
    }
  }, [templates, storageKey]);

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
    setDraft("");
    setModalOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditingId(t.id);
    setDraft(t.text);
    setModalOpen(true);
  };

  const submitTemplate = () => {
    const t = draft.trim();
    if (!t) return;
    if (editingId) {
      setTemplates(prev => prev.map(x => (x.id === editingId ? { ...x, text: t } : x)));
    } else {
      setTemplates(prev => [{ id: `t-${Date.now()}`, text: t }, ...prev]);
    }
    setDraft("");
    setEditingId(null);
    setModalOpen(false);
  };

  const remove = (id: string) => setTemplates(prev => prev.filter(x => x.id !== id));

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] text-(--brand-dark) hover:bg-(--brand)/15 transition-colors"
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
            className="absolute right-0 top-full mt-2 z-50 w-[300px] bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 18px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
              <span className="text-[12px] text-gray-800" style={{ fontWeight: 700 }}>{title}</span>
              <span className="text-[10px] text-gray-400">{templates.length} รายการ</span>
            </div>

            {/* Create new — opens popup */}
            <div className="p-2.5 border-b border-gray-100">
              <button
                type="button"
                onClick={openCreate}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] text-(--brand-dark) border border-dashed border-(--brand)/45 hover:bg-(--brand)/5 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-3.5 h-3.5" /> สร้างเทมเพลตใหม่
              </button>
            </div>

            {/* List */}
            <div className="max-h-[220px] overflow-y-auto p-1.5">
              {templates.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-5">ยังไม่มีเทมเพลต</p>
              ) : (
                templates.map(t => (
                  <div key={t.id} className="group rounded-xl hover:bg-gray-50 transition-colors px-2 py-1.5">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => { onSelect(t.text); setOpen(false); }}
                        className="flex-1 text-left text-[12px] text-gray-700 leading-snug whitespace-pre-wrap break-words"
                      >
                        {t.text}
                      </button>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                          title="แก้ไข"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(t.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500"
                          title="ลบ"
                        >
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
              className="bg-white rounded-2xl w-full max-w-[360px] overflow-hidden"
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
                  {editingId ? "แก้ไขเทมเพลต" : "สร้างเทมเพลตใหม่"}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} className="ml-auto w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  rows={4}
                  autoFocus
                  placeholder="พิมพ์ข้อความเทมเพลต..."
                  className="w-full text-[13px] text-gray-700 rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-(--brand) resize-none leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3.5 py-1.5 text-[12px] text-gray-600 rounded-full hover:bg-gray-100" style={{ fontWeight: 600 }}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={submitTemplate}
                  disabled={!draft.trim()}
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
