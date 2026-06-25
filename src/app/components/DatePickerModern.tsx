import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const THAI_DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

interface DatePickerModernProps {
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  min?: string; // "YYYY-MM-DD" — วันแรกที่เลือกได้
  max?: string; // "YYYY-MM-DD" — วันสุดท้ายที่เลือกได้
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatDisplay(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${THAI_MONTHS_SHORT[m - 1]} ${y + 543}`;
}
function isToday(year: number, month: number, day: number) {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

export function DatePickerModern({ value, onChange, placeholder = "เลือกวันที่", className = "", min, max }: DatePickerModernProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; width: number } | null>(null);

  // Position popup near the trigger via fixed coords (escapes parent overflow)
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      const popW = 300;
      const popH = 360; // approx
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

  const today = new Date();
  const parsed = value ? value.split("-").map(Number) : null;
  const [viewYear, setViewYear] = useState(parsed ? parsed[0] : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed ? parsed[1] - 1 : today.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [value]);

  // Close on outside click — include both trigger wrapper and portal popup
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

  const prevMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 0) { setViewYear(y => y - 1); return 11; }
      return m - 1;
    });
  }, []);
  const nextMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 11) { setViewYear(y => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const selectDay = (day: number) => {
    onChange(`${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`);
    setOpen(false);
  };

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const todayInRange = (!min || todayStr >= min) && (!max || todayStr <= max);
  const goToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    if (todayInRange) {
      onChange(todayStr);
      setOpen(false);
    }
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

  const selectedY = parsed?.[0];
  const selectedM = parsed ? parsed[1] - 1 : undefined;
  const selectedD = parsed?.[2];

  // Build calendar grid
  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="vet-select cursor-pointer hover:bg-gray-100/60 !justify-start gap-[8px]"
      >
        <Calendar className="w-[16px] h-[16px] text-gray-400 shrink-0" />
        <span className={value ? "text-gray-700" : "text-gray-300"}>{value ? formatDisplay(value) : placeholder}</span>
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
            style={{ top: popupPos.top, left: popupPos.left, width: popupPos.width }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[16px] pt-[14px] pb-[8px]">
              <button type="button" onClick={prevMonth} className="p-[6px] rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-[16px] h-[16px] text-gray-500" />
              </button>
              <span className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>
                {THAI_MONTHS[viewMonth]} {viewYear + 543}
              </span>
              <button type="button" onClick={nextMonth} className="p-[6px] rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-[16px] h-[16px] text-gray-500" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-[12px] pb-[4px]">
              {THAI_DAYS.map(d => (
                <div key={d} className="text-center text-[11px] text-gray-400 py-[4px]" style={{ fontWeight: 500 }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 px-[12px] pb-[8px] gap-y-[2px]">
              {cells.map((cell, i) => {
                const cellStr = cell.current ? `${viewYear}-${pad(viewMonth + 1)}-${pad(cell.day)}` : "";
                const outOfRange = !!(cell.current && ((min && cellStr < min) || (max && cellStr > max)));
                const disabled = !cell.current || outOfRange;
                const isSelected = cell.current && !outOfRange && selectedY === viewYear && selectedM === viewMonth && selectedD === cell.day;
                const isTodayCell = cell.current && isToday(viewYear, viewMonth, cell.day);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => !disabled && selectDay(cell.day)}
                    disabled={disabled}
                    title={outOfRange ? "นอกช่วงที่เลือกได้" : undefined}
                    className={`
                      w-[36px] h-[36px] mx-auto rounded-full text-[13px] flex items-center justify-center transition-all
                      ${disabled ? "text-gray-200 cursor-default" : "cursor-pointer hover:bg-[#0d7c66]/10 text-gray-700"}
                      ${isSelected ? "!bg-gradient-to-b from-[#19a589] to-[#0d7c66] !text-white shadow-md hover:!bg-none" : ""}
                      ${isTodayCell && !isSelected && !disabled ? "ring-1.5 ring-[#19a589]/40 !text-[#0d7c66]" : ""}
                    `}
                    style={isSelected ? { fontWeight: 600, boxShadow: "0 3px 10px rgba(13,124,102,0.3)" } : isTodayCell && !disabled ? { fontWeight: 600 } : {}}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-[16px] py-[10px] flex items-center justify-between">
              {todayInRange ? (
                <button type="button" onClick={goToday} className="text-[12px] text-[#0d7c66] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
                  วันนี้
                </button>
              ) : <span />}
              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); }}
                  className="text-xs text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                >
                  ล้าง
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}