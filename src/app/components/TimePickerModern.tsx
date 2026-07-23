import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Clock } from "lucide-react";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

interface TimePickerModernProps {
  value: string; // "HH:mm"
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePickerModern({
  value,
  onChange,
  placeholder = "เลือกเวลา",
  className = "",
}: TimePickerModernProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const [selH, selM] = value ? value.split(":").map(Number) : [-1, -1];

  // Position popup near trigger via fixed coords (escapes parent overflow)
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      const popW = Math.max(r.width, 240);
      const popH = 320;
      const spaceBelow = window.innerHeight - r.bottom;
      const showBelow = spaceBelow >= popH + 12 || spaceBelow >= r.top;
      const top = showBelow ? r.bottom + 6 : Math.max(8, r.top - popH - 6);
      const left = Math.max(8, Math.min(r.left, window.innerWidth - popW - 8));
      setPopupPos({ top, left, width: popW });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  // Close on outside click — include trigger + portal popup
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      const insideTrigger = ref.current?.contains(t);
      const insidePopup = popupRef.current?.contains(t);
      if (!insideTrigger && !insidePopup) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Auto-scroll to selected hour/minute when opening
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (hourListRef.current && selH >= 0) {
        const el = hourListRef.current.querySelector(`[data-hour="${selH}"]`);
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      if (minuteListRef.current && selM >= 0) {
        const el = minuteListRef.current.querySelector(`[data-minute="${selM}"]`);
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [open, selH, selM]);

  const setNow = useCallback(() => {
    const now = new Date();
    onChange(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    setOpen(false);
  }, [onChange]);

  const selectHour = (h: number) => {
    const m = selM >= 0 ? selM : 0;
    onChange(`${pad(h)}:${pad(m)}`);
  };

  const selectMinute = (m: number) => {
    const h = selH >= 0 ? selH : 0;
    onChange(`${pad(h)}:${pad(m)}`);
  };

  const displayText = value
    ? `${pad(selH)} : ${pad(selM)} น.`
    : placeholder;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="vet-select cursor-pointer hover:bg-gray-100/60 !justify-start gap-[8px]"
      >
        <Clock className="w-[16px] h-[16px] text-gray-400 shrink-0" />
        <span className={value ? "text-gray-700" : "text-gray-300"}>
          {displayText}
        </span>
      </button>

      {/* Dropdown — rendered via portal to escape parent overflow */}
      {open && popupPos && createPortal(
        <AnimatePresence>
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed z-[10000] vet-dropdown"
            style={{ top: popupPos.top, left: popupPos.left, width: popupPos.width, minWidth: 240 }}
          >
            {/* Header */}
            <div
              className="px-[16px] py-[12px] flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--brand) 9%, white) 0%, #FEFBF8 50%, color-mix(in srgb, var(--brand) 6%, white) 100%)",
              }}
            >
              <div className="flex items-center gap-[8px]">
                <div
                  className="vet-icon-badge vet-icon-badge-sm"
                  style={{
                    background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                    boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 30%, transparent)",
                  }}
                >
                  <Clock className="w-[14px] h-[14px] text-white" />
                </div>
                <span className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>
                  เลือกเวลา
                </span>
              </div>
              {/* Live display */}
              <div
                className="text-sm tracking-wide"
                style={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {value ? `${pad(selH)}:${pad(selM)}` : "--:--"}
              </div>
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-2 border-b border-gray-100">
              <div
                className="text-center py-[6px] text-[11px] text-gray-400 border-r border-gray-100"
                style={{ fontWeight: 600 }}
              >
                ชั่วโมง
              </div>
              <div
                className="text-center py-[6px] text-[11px] text-gray-400"
                style={{ fontWeight: 600 }}
              >
                นาที
              </div>
            </div>

            {/* Scroll columns */}
            <div className="grid grid-cols-2" style={{ height: 200 }}>
              {/* Hours */}
              <div
                ref={hourListRef}
                className="overflow-y-auto border-r border-gray-100 py-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {Array.from({ length: 24 }, (_, h) => {
                  const isActive = h === selH;
                  return (
                    <div
                      key={h}
                      data-hour={h}
                      className={`mx-[6px] my-[2px] px-[12px] py-[8px] text-[14px] text-center cursor-pointer rounded-[8px] transition-all ${
                        isActive
                          ? "text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                              boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 25%, transparent)",
                              fontWeight: 700,
                            }
                          : { fontWeight: 400 }
                      }
                      onClick={() => selectHour(h)}
                    >
                      {pad(h)}
                    </div>
                  );
                })}
              </div>
              {/* Minutes */}
              <div
                ref={minuteListRef}
                className="overflow-y-auto py-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const m = i * 5;
                  const isActive = m === selM;
                  return (
                    <div
                      key={m}
                      data-minute={m}
                      className={`mx-[6px] my-[2px] px-[12px] py-[8px] text-[14px] text-center cursor-pointer rounded-[8px] transition-all ${
                        isActive
                          ? "text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                              boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 25%, transparent)",
                              fontWeight: 700,
                            }
                          : { fontWeight: 400 }
                      }
                      onClick={() => selectMinute(m)}
                    >
                      {pad(m)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-[12px] py-[10px] flex items-center justify-between">
              <button
                type="button"
                onClick={setNow}
                className="text-[12px] text-(--brand) hover:text-[var(--brand-dark)] transition-colors px-[8px] py-[4px] rounded-[8px] hover:bg-(--brand)/5"
                style={{ fontWeight: 600 }}
              >
                ตอนนี้
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="vet-btn vet-btn-primary vet-btn-xs"
              >
                ตกลง
              </button>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}