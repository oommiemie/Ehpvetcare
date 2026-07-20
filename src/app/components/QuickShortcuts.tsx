import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Check, Pencil, RotateCcw } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { navItems, navGroups } from "../config/nav";
import { useShortcuts, MAX_SHORTCUTS } from "../hooks/useShortcuts";

/* ไอคอนเมนูเป็นรูป PNG จาก Figma — ห่อในวงกลมสีตามเมนูเหมือน sidebar */
function ShortcutIcon({ item, size = 40 }: { item: (typeof navItems)[number]; size?: number }) {
  const Ico = item.lucideIcon;
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, #ffffff 0%, ${item.bg} 100%)`,
        border: `1px solid ${item.color}33`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px ${item.color}22`,
      }}
    >
      {Ico
        ? <Ico style={{ width: size * 0.55, height: size * 0.55, color: item.color }} />
        /* draggable={false} สำคัญ — ไม่งั้น browser เริ่ม native drag ของรูป
           แล้วไปแย่ง pointer จาก motion ทำให้ลากจัดลำดับไม่ได้ */
        : <img src={item.img} alt="" draggable={false} className="object-contain" style={{ width: size * 0.6, height: size * 0.6 }} />}
    </div>
  );
}

export function QuickShortcuts() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { paths, items, toggle, remove, reorder, reset, isFull } = useShortcuts();
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  const fs = (px: number) => `calc(${px}px * var(--fs))`;

  /* ── ลากวางจัดลำดับ ──
     ใช้ pointer event ของ motion (ไม่ใช่ HTML5 drag) เพราะแอปรันบน iOS ด้วย
     ซึ่ง HTML5 drag-and-drop ไม่ทำงานบนจอสัมผัส */
  const tileRefs = useRef(new Map<string, HTMLElement>());
  const setTileRef = (path: string) => (el: HTMLElement | null) => {
    if (el) tileRefs.current.set(path, el);
    else tileRefs.current.delete(path);
  };

  /* ระหว่างลาก: หาไทล์ที่ใกล้จุดกึ่งกลางของตัวที่ลากที่สุด แล้วสลับตำแหน่ง */
  const handleDrag = (path: string) => {
    const el = tileRefs.current.get(path);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    let target: string | null = null;
    let best = Infinity;
    tileRefs.current.forEach((other, otherPath) => {
      if (otherPath === path) return;
      const o = other.getBoundingClientRect();
      const d = Math.hypot(o.left + o.width / 2 - cx, o.top + o.height / 2 - cy);
      if (d < best) { best = d; target = otherPath; }
    });

    /* ต้องเข้าไปทับเกินครึ่งไทล์ก่อนถึงจะสลับ — กันสลับรัวตอนขยับนิดเดียว */
    if (target && best < r.width * 0.55) reorder(path, target);
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
      {/* ── หัวข้อ ── */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="min-w-0">
          <h3 className="text-gray-800" style={{ fontWeight: 600 }}>{t("shortcut.title")}</h3>
          <p className="text-gray-400 truncate" style={{ fontSize: fs(11.5) }}>
            {editing ? t("shortcut.pickHint") : t("shortcut.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {editing && (
            <button
              onClick={reset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-gray-500 transition-colors hover:bg-gray-100"
              style={{ fontSize: fs(11.5), fontWeight: 600, border: "1px solid #e5e7eb" }}
            >
              <RotateCcw style={{ width: fs(12), height: fs(12) }} />
              {t("shortcut.reset")}
            </button>
          )}
          <button
            onClick={() => setEditing(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full transition-all"
            style={{
              fontSize: fs(11.5), fontWeight: 700,
              color: editing ? "#fff" : "var(--brand-dark)",
              background: editing ? "var(--brand)" : "transparent",
              border: `1px solid ${editing ? "var(--brand)" : "#e5e7eb"}`,
            }}
          >
            {editing
              ? <><Check style={{ width: fs(12), height: fs(12) }} />{t("shortcut.done")}</>
              : <><Pencil style={{ width: fs(12), height: fs(12) }} />{t("shortcut.edit")}</>}
          </button>
        </div>
      </div>

      {/* ── ไทล์เมนูลัด ── */}
      {items.length === 0 && !editing ? (
        <button
          onClick={() => setEditing(true)}
          className="w-full rounded-2xl py-7 text-center transition-colors hover:bg-gray-50"
          style={{ border: "1.5px dashed #d1d5db" }}
        >
          <p className="text-gray-500" style={{ fontSize: fs(13), fontWeight: 600 }}>{t("shortcut.empty")}</p>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: fs(11.5) }}>{t("shortcut.emptyHint")}</p>
        </button>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1">
          <AnimatePresence initial={false}>
            {items.map(item => (
              <motion.div
                key={item.path}
                ref={setTileRef(item.path)}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                /* ลากได้เฉพาะโหมดแก้ไข */
                drag={editing}
                dragSnapToOrigin
                dragMomentum={false}
                dragElastic={0.2}
                onDragStart={() => setDragging(item.path)}
                onDrag={() => handleDrag(item.path)}
                onDragEnd={() => setDragging(null)}
                whileDrag={{ scale: 1.12, zIndex: 40 }}
                className="relative select-none"
                style={{
                  cursor: editing ? (dragging === item.path ? "grabbing" : "grab") : "default",
                  touchAction: editing ? "none" : undefined,  /* กันหน้าจอเลื่อนตอนลากบนมือถือ */
                  zIndex: dragging === item.path ? 40 : 0,
                }}
              >
                {/* ไม่มีกรอบรอบเมนู — ใช้พื้นจาง ๆ ตอน hover แทนการตีเส้นแบ่ง */}
                <button
                  onClick={() => { if (!editing) navigate(item.path); }}
                  className={`w-full rounded-2xl px-1 py-3 flex flex-col items-center gap-2 transition-colors duration-200 ${editing ? "" : "hover:bg-gray-50"}`}
                  style={{ cursor: editing ? "default" : "pointer" }}
                >
                  <ShortcutIcon item={item} />
                  <span
                    className="text-gray-700 text-center leading-tight line-clamp-2"
                    style={{ fontSize: fs(11), fontWeight: 600 }}
                  >
                    {t(item.labelKey)}
                  </span>
                </button>

                {/* โหมดแก้ไข: ปุ่มลบ (จัดลำดับใช้ลากวางแทนปุ่มลูกศร) */}
                {editing && (
                  <button
                    onPointerDown={e => e.stopPropagation()}  /* กันไปเริ่ม drag ตอนกดปุ่มลบ */
                    onClick={() => remove(item.path)}
                    aria-label={`ลบ ${t(item.labelKey)}`}
                    className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center text-white shadow-md"
                    style={{ width: fs(20), height: fs(20), background: "#ef4444" }}
                  >
                    <X style={{ width: fs(12), height: fs(12) }} strokeWidth={3} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ไทล์ "เพิ่มเมนู" */}
          {editing && (
            <motion.button
              layout
              onClick={() => setPicking(true)}
              disabled={isFull}
              className="rounded-2xl px-1 py-3 flex flex-col items-center gap-2 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 40, height: 40, background: "#f3f4f6", border: "1.5px dashed #d1d5db" }}
              >
                <Plus style={{ width: fs(18), height: fs(18), color: "#6b7280" }} />
              </div>
              <span className="text-gray-500 text-center leading-tight" style={{ fontSize: fs(11), fontWeight: 600 }}>
                {isFull ? t("shortcut.full").replace("{n}", String(MAX_SHORTCUTS)) : t("shortcut.add")}
              </span>
            </motion.button>
          )}
        </div>
      )}

      {/* ── Modal เลือกเมนู ── */}
      {picking && createPortal(
        <AnimatePresence>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPicking(false)}
            className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)" }}
          >
            <motion.div
              key="sheet"
              onClick={e => e.stopPropagation()}
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
              style={{ maxHeight: "82vh", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
            >
              <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="min-w-0">
                  <p className="text-gray-800" style={{ fontSize: fs(15), fontWeight: 700 }}>{t("shortcut.pick")}</p>
                  <p className="text-gray-400" style={{ fontSize: fs(11.5) }}>
                    {t("shortcut.count").replace("{n}", String(paths.length))} · {t("shortcut.full").replace("{n}", String(MAX_SHORTCUTS))}
                  </p>
                </div>
                <button
                  onClick={() => setPicking(false)}
                  className="rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-gray-100"
                  style={{ width: 32, height: 32, border: "1px solid #e5e7eb" }}
                >
                  <X style={{ width: fs(15), height: fs(15) }} className="text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto px-5 py-3">
                {navGroups.map(group => {
                  const groupItems = navItems.filter(n => (group.paths as readonly string[]).includes(n.path));
                  if (!groupItems.length) return null;
                  return (
                    <div key={group.labelKey} className="mb-4 last:mb-1">
                      <p className="text-gray-400 uppercase mb-2" style={{ fontSize: fs(10), fontWeight: 700, letterSpacing: "1.2px" }}>
                        {t(group.labelKey)}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupItems.map(item => {
                          const on = paths.includes(item.path);
                          const blocked = !on && isFull;
                          return (
                            <button
                              key={item.path}
                              onClick={() => toggle(item.path)}
                              disabled={blocked}
                              className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-all disabled:opacity-40"
                              style={{
                                background: "#fff",
                                border: on ? `2px solid ${item.color}` : "1px solid #e5e7eb",
                                boxShadow: on ? `0 4px 12px ${item.color}22` : "none",
                              }}
                            >
                              <ShortcutIcon item={item} size={32} />
                              <span className="flex-1 min-w-0 truncate text-gray-700" style={{ fontSize: fs(12.5), fontWeight: on ? 700 : 500 }}>
                                {t(item.labelKey)}
                              </span>
                              <span
                                className="rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  width: fs(18), height: fs(18),
                                  background: on ? item.color : "transparent",
                                  border: on ? "none" : "1.5px solid #d1d5db",
                                }}
                              >
                                {on && <Check style={{ width: fs(11), height: fs(11) }} className="text-white" strokeWidth={3} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-5 py-3" style={{ borderTop: "1px solid #f1f3f5" }}>
                <button
                  onClick={() => setPicking(false)}
                  className="w-full rounded-full py-2.5 text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--brand)", fontSize: fs(13), fontWeight: 700 }}
                >
                  {t("shortcut.done")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
