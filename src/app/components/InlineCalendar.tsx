import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const THAI_DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
const isTodayCell = (y: number, m: number, d: number) => {
  const t = new Date();
  return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
};

/** ปฏิทินแบบ inline (แสดงเต็มในฟอร์ม ไม่ใช่ dropdown) · จำกัดช่วงด้วย min/max ("YYYY-MM-DD")
 *  รองรับ 2 โหมด:
 *  - เลือกวันเดียว: ส่ง value + onChange
 *  - เลือกช่วงวันที่: ส่ง range + start + end + onRangeChange (คลิกวันแรก=เริ่ม, วันถัดไป=สิ้นสุด) */
export function InlineCalendar({
  value = "", onChange,
  range = false, start = "", end = "", onRangeChange,
  min, max,
}: {
  value?: string; onChange?: (v: string) => void;
  range?: boolean; start?: string; end?: string; onRangeChange?: (start: string, end?: string) => void;
  min?: string; max?: string;
}) {
  const today = new Date();
  const anchor = range ? (start || value) : value;
  const parsed = anchor ? anchor.split("-").map(Number) : null;

  const pick = (cellStr: string) => {
    if (!range) { onChange?.(cellStr); return; }
    // เริ่มเลือกใหม่เมื่อยังไม่มี start หรือมีครบทั้ง start+end แล้ว
    if (!start || (start && end)) { onRangeChange?.(cellStr, undefined); return; }
    if (cellStr < start) onRangeChange?.(cellStr, start);
    else onRangeChange?.(start, cellStr);
  };
  const [viewYear, setViewYear] = useState(parsed ? parsed[0] : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed ? parsed[1] - 1 : today.getMonth());

  useEffect(() => {
    if (anchor) {
      const [y, m] = anchor.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [anchor]);

  const prevMonth = () => setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  const nextMonth = () => setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });

  const dim = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const prevDays = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);
  const selStart = range ? start : value;
  const selEnd = range ? end : "";

  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= dim; d++) cells.push({ day: d, current: true });
  for (let d = 1; d <= 42 - cells.length; d++) cells.push({ day: d, current: false });

  // จำกัดปุ่มเลื่อนเดือนไม่ให้พ้นช่วง min/max
  const firstOfView = `${viewYear}-${pad(viewMonth + 1)}-01`;
  const lastOfView = `${viewYear}-${pad(viewMonth + 1)}-${pad(dim)}`;
  const canPrev = !min || firstOfView > min;
  const canNext = !max || lastOfView < max;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2.5 select-none">
      <div className="flex items-center justify-between px-1 pb-1.5">
        <button type="button" onClick={prevMonth} disabled={!canPrev} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>{THAI_MONTHS[viewMonth]} {viewYear + 543}</span>
        <button type="button" onClick={nextMonth} disabled={!canNext} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7">
        {THAI_DAYS.map(d => <div key={d} className="text-center text-[10.5px] text-gray-400 py-0.5" style={{ fontWeight: 500 }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, i) => {
          const cellStr = cell.current ? `${viewYear}-${pad(viewMonth + 1)}-${pad(cell.day)}` : "";
          const outOfRange = !!(cell.current && ((min && cellStr < min) || (max && cellStr > max)));
          const disabled = !cell.current || outOfRange;
          const isEndpoint = cell.current && !outOfRange && (cellStr === selStart || (!!selEnd && cellStr === selEnd));
          const inMiddle = cell.current && !outOfRange && !!selStart && !!selEnd && cellStr > selStart && cellStr < selEnd;
          const isTod = cell.current && isTodayCell(viewYear, viewMonth, cell.day);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && pick(cellStr)}
              title={outOfRange ? "นอกช่วง admit" : undefined}
              className={`w-8 h-8 mx-auto rounded-full text-[12.5px] flex items-center justify-center transition-all
                ${disabled ? "text-gray-200 cursor-default" : "cursor-pointer hover:bg-(--brand-dark)/10 text-gray-700"}
                ${inMiddle ? "!bg-(--brand)/15 !text-(--brand-dark)" : ""}
                ${isEndpoint ? "!bg-gradient-to-b from-(--brand) to-(--brand-dark) !text-white shadow-md" : ""}
                ${isTod && !isEndpoint && !inMiddle && !disabled ? "ring-1 ring-(--brand)/40 !text-(--brand-dark)" : ""}`}
              style={isEndpoint ? { fontWeight: 600, boxShadow: "0 3px 10px color-mix(in srgb, var(--brand-dark) 30%, transparent)" } : (isTod && !disabled ? { fontWeight: 600 } : {})}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
