import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";

/* ── Thai locale ─────────────────────────────────────── */
const THAI_MONTHS_FULL = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];
const THAI_MONTHS_SHORT = [
  "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
  "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",
];
const THAI_DAYS = ["อา","จ","อ","พ","พฤ","ศ","ส"];

/* ── helpers ─────────────────────────────────────────── */
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function getDIM(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

function fmtThai(s: string): string {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return `${d} ${THAI_MONTHS_SHORT[m - 1]} ${y + 543}`;
}

function todayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

/* ── Single month calendar ───────────────────────────── */
interface CalMonthProps {
  year: number; month: number;
  start: string; end: string; hover: string;
  selecting: "start" | "end";
  onDay: (s: string) => void;
  onHover: (s: string) => void;
}

function CalMonth({ year, month, start, end, hover, selecting, onDay, onHover }: CalMonthProps) {
  const dim = getDIM(year, month);
  const fd  = getFirstDay(year, month);
  const pdim = getDIM(year, month === 0 ? 11 : month - 1);

  const cells: { day: number; cur: boolean }[] = [];
  for (let i = fd - 1; i >= 0; i--) cells.push({ day: pdim - i, cur: false });
  for (let d = 1; d <= dim; d++)      cells.push({ day: d,        cur: true  });
  let nd = 1;
  while (cells.length < 42)            cells.push({ day: nd++,    cur: false });

  const effectiveEnd = end || (selecting === "end" ? hover : "");

  return (
    <div className="w-[252px] select-none">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {THAI_DAYS.map(d => (
          <div key={d} className="text-center text-[11px] text-gray-400 py-[3px]" style={{ fontWeight: 500 }}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          if (!cell.cur) return <div key={idx} className="h-[34px]" />;

          const ds = `${year}-${pad(month + 1)}-${pad(cell.day)}`;
          const isToday = ds === todayStr();
          const isSt = ds === start;
          const isEn = ds === end;
          const isSelected = isSt || isEn;

          // Range logic: a date is in-range when it's strictly between start and effectiveEnd
          const inRange = !!(start && effectiveEnd && ds > start && ds < effectiveEnd);
          // Preview strip (while hovering, no confirmed end yet)
          const inPreview = !!(start && !end && selecting === "end" && hover && ds > start && ds < hover);
          const isHoverEnd = ds === hover && selecting === "end" && !end;

          // Strip backgrounds
          const hasStripFull   = inRange || inPreview;
          const hasStripRight  = isSt && effectiveEnd && effectiveEnd !== start;
          const hasStripLeft   = isEn && start && start !== end;
          const colIdx = idx % 7;

          const stripCls = [
            "absolute inset-y-[4px]",
            inPreview ? "bg-[#19a589]/7" : "bg-[#19a589]/12",
          ].join(" ");

          return (
            <div key={idx} className="relative h-[34px] flex items-center justify-center">
              {/* Range strip */}
              {hasStripFull && (
                <div
                  className={stripCls + " " +
                    (colIdx === 0 ? "rounded-l-full left-0" : "left-0") + " " +
                    (colIdx === 6 ? "rounded-r-full right-0" : "right-0")
                  }
                />
              )}
              {hasStripRight && (
                <div className={stripCls + " left-1/2 right-0"} />
              )}
              {hasStripLeft && (
                <div className={stripCls + " left-0 right-1/2"} />
              )}

              {/* Day button */}
              <button
                type="button"
                onClick={() => onDay(ds)}
                onMouseEnter={() => onHover(ds)}
                className={[
                  "relative z-10 w-[30px] h-[30px] rounded-full text-[12px] flex items-center justify-center transition-all cursor-pointer",
                  isSelected
                    ? "text-white"
                    : inRange || inPreview || isHoverEnd
                      ? "text-[#0d7c66] hover:bg-[#19a589]/15"
                      : isToday
                        ? "ring-1 ring-[#19a589]/50 text-[#0d7c66] hover:bg-[#0d7c66]/10"
                        : "text-gray-700 hover:bg-[#0d7c66]/10",
                ].join(" ")}
                style={
                  isSelected
                    ? {
                        background: "linear-gradient(135deg,#19a589,#0d7c66)",
                        fontWeight: 700,
                        boxShadow: "0 2px 8px rgba(13,124,102,0.3)",
                      }
                    : isToday
                      ? { fontWeight: 600 }
                      : {}
                }
              >
                {cell.day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Public component ────────────────────────────────── */
export interface DateRangePickerModernProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  placeholder?: string;
  className?: string;
  isActive?: boolean;
  variant?: "pill" | "input";   // pill = ชิปเขียว (หน้า Reports) · input = หน้าตาเหมือนช่องฟอร์ม
  align?: "right" | "left";     // ฝั่งที่ popup กางออก (left = ชิดซ้าย trigger กางไปขวา)
}

export function DateRangePickerModern({
  startDate,
  endDate,
  onChange,
  placeholder = "กำหนดเอง",
  className = "",
  isActive = false,
  variant = "pill",
  align = "right",
}: DateRangePickerModernProps) {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd,   setTempEnd]   = useState(endDate);
  const [hoverDate, setHoverDate] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  // left month = current month - 1, right = current month
  const initLeftMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
  const initLeftYear  = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const [leftYear,  setLeftYear]  = useState(initLeftYear);
  const [leftMonth, setLeftMonth] = useState(initLeftMonth);

  const rightMonth = (leftMonth + 1) % 12;
  const rightYear  = leftMonth === 11 ? leftYear + 1 : leftYear;

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setHoverDate("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  /* Sync with props when opening */
  useEffect(() => {
    if (open) {
      setTempStart(startDate);
      setTempEnd(endDate);
      setSelecting(startDate ? "end" : "start");
      // Navigate to the month of startDate
      if (startDate) {
        const [y, m] = startDate.split("-").map(Number);
        setLeftYear(y);
        setLeftMonth(m - 2 < 0 ? 11 : m - 2); // show start month in right panel
      }
    }
  }, [open]); // eslint-disable-line

  const prevMonth = () => {
    if (leftMonth === 0) { setLeftYear(y => y - 1); setLeftMonth(11); }
    else setLeftMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (leftMonth === 11) { setLeftYear(y => y + 1); setLeftMonth(0); }
    else setLeftMonth(m => m + 1);
  };

  const handleDayClick = (ds: string) => {
    if (selecting === "start" || (tempStart && ds < tempStart)) {
      setTempStart(ds);
      setTempEnd("");
      setSelecting("end");
    } else if (ds === tempStart) {
      // click same → single day range, confirm
      setTempEnd(ds);
    } else {
      setTempEnd(ds);
      setSelecting("start");
    }
  };

  const handleApply = () => {
    const s = tempStart;
    const e = tempEnd || tempStart; // single-day if no end
    if (s) {
      onChange(s, e);
      setOpen(false);
      setHoverDate("");
    }
  };

  const handleClear = () => {
    setTempStart("");
    setTempEnd("");
    onChange("", "");
    setOpen(false);
    setHoverDate("");
  };

  const displayText =
    startDate && endDate && startDate !== endDate
      ? `${fmtThai(startDate)} – ${fmtThai(endDate)}`
      : startDate
        ? fmtThai(startDate)
        : placeholder;

  const hasRange = !!(startDate);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      {variant === "input" ? (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="vet-select cursor-pointer hover:bg-gray-100/60 !justify-start gap-[8px]"
        >
          <Calendar className="w-[16px] h-[16px] text-gray-400 shrink-0" />
          <span className={`truncate ${hasRange ? "text-gray-700" : "text-gray-300"}`}>{displayText}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={[
            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-all",
            isActive || hasRange
              ? "bg-[#19a589] text-white"
              : "text-[#6a7282] hover:text-gray-700",
          ].join(" ")}
          style={{ fontWeight: isActive || hasRange ? 600 : 400 }}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          {displayText}
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className={`absolute z-[9999] mt-2 ${align === "left" ? "left-0" : "right-0"} vet-dropdown p-4`}
            onMouseLeave={() => setHoverDate("")}
            style={{ minWidth: 570 }}
          >
            {/* Status bar */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={[
                  "flex-1 rounded-xl px-3 py-2 text-[12px] transition-all cursor-pointer",
                  selecting === "start"
                    ? "ring-1 ring-[#19a589] bg-[#19a589]/8 text-[#0d7c66]"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                ].join(" ")}
                style={{ fontWeight: 500 }}
                onClick={() => setSelecting("start")}
              >
                <span className="block text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>
                  วันเริ่มต้น
                </span>
                {tempStart
                  ? fmtThai(tempStart)
                  : <span className="text-gray-300">เลือกวันเริ่มต้น</span>
                }
              </div>
              <div className="text-gray-300 text-[18px]">→</div>
              <div
                className={[
                  "flex-1 rounded-xl px-3 py-2 text-[12px] transition-all cursor-pointer",
                  selecting === "end"
                    ? "ring-1 ring-[#19a589] bg-[#19a589]/8 text-[#0d7c66]"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                ].join(" ")}
                style={{ fontWeight: 500 }}
                onClick={() => tempStart && setSelecting("end")}
              >
                <span className="block text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>
                  วันสิ้นสุด
                </span>
                {tempEnd
                  ? fmtThai(tempEnd)
                  : <span className="text-gray-300">เลือกวันสิ้นสุด</span>
                }
              </div>
            </div>

            {/* Calendars side-by-side */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={prevMonth}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>
                    {THAI_MONTHS_FULL[leftMonth]} {leftYear + 543}
                  </span>
                  <div className="w-7" />
                </div>
                <CalMonth
                  year={leftYear} month={leftMonth}
                  start={tempStart} end={tempEnd} hover={hoverDate}
                  selecting={selecting}
                  onDay={handleDayClick} onHover={setHoverDate}
                />
              </div>

              <div className="w-px bg-gray-100 self-stretch" />

              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7" />
                  <span className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>
                    {THAI_MONTHS_FULL[rightMonth]} {rightYear + 543}
                  </span>
                  <button type="button" onClick={nextMonth}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <CalMonth
                  year={rightYear} month={rightMonth}
                  start={tempStart} end={tempEnd} hover={hoverDate}
                  selecting={selecting}
                  onDay={handleDayClick} onHover={setHoverDate}
                />
              </div>
            </div>

            {/* Quick ranges */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
              {[
                { label: "7 วันล่าสุด",  days: 7  },
                { label: "30 วันล่าสุด", days: 30 },
                { label: "90 วันล่าสุด", days: 90 },
                { label: "ปีนี้",        days: 0, isYear: true },
              ].map(({ label, days, isYear }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const t = new Date();
                    let s: Date;
                    if (isYear) {
                      s = new Date(t.getFullYear(), 0, 1);
                    } else {
                      s = new Date(t.getTime() - (days - 1) * 86400000);
                    }
                    const ss = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
                    const es = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
                    setTempStart(ss); setTempEnd(es); setSelecting("start");
                  }}
                  className="px-3 py-1 rounded-full text-[11px] bg-gray-100 text-gray-600 hover:bg-[#19a589]/12 hover:text-[#0d7c66] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                type="button" onClick={handleClear}
                className="text-[12px] text-gray-400 hover:text-red-400 transition-colors"
              >
                ล้างข้อมูล
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button" onClick={() => { setOpen(false); setHoverDate(""); }}
                  className="px-4 py-1.5 rounded-full text-[12px] text-gray-500 hover:bg-gray-100 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  ยกเลิก
                </button>
                <button
                  type="button" onClick={handleApply}
                  disabled={!tempStart}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] text-white disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)", fontWeight: 600 }}
                >
                  <Check className="w-3.5 h-3.5" /> ยืนยัน
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
