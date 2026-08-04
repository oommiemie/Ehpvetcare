/* ─────────────────────────────────────────────────────────────
   ตัวเลือก "วัน + เวลา" ตามธีมของระบบ

   ใช้แทน <input type="datetime-local"> ซึ่งเป็นตัวเลือกของเบราว์เซอร์
   หน้าตาคนละอย่างกันทุกเครื่อง เป็น ค.ศ. และคุมสไตล์ไม่ได้เลย

   ไม่ได้เขียนปฏิทินใหม่ — ประกอบจาก DatePickerModern + TimePickerModern
   ที่ระบบมีอยู่แล้ว จึงได้ พ.ศ. และธีมสีเดียวกับที่อื่นโดยอัตโนมัติ

   ค่าเข้า-ออกเป็น "YYYY-MM-DDTHH:mm" รูปแบบเดียวกับ datetime-local เป๊ะ
   จึงสลับมาใช้แทนได้โดยไม่ต้องแตะ state หรือข้อมูลที่บันทึกไว้เดิม
   ───────────────────────────────────────────────────────────── */
import { DatePickerModern } from "./DatePickerModern";
import { TimePickerModern } from "./TimePickerModern";

interface Props {
  /** "YYYY-MM-DDTHH:mm" — ว่างได้ */
  value: string;
  onChange: (val: string) => void;
  className?: string;
  disabled?: boolean;
}

export function DateTimePickerModern({ value, onChange, className = "", disabled = false }: Props) {
  const [date = "", time = ""] = (value || "").split("T");

  /* ประกอบกลับเป็นค่าเดียว — เลือกอย่างใดอย่างหนึ่งก่อนก็ได้
     ยังไม่ครบทั้งคู่ก็ส่งเท่าที่มี ไม่บังคับลำดับการกรอก
     (ถ้าเลือกเวลาก่อนแล้วบังคับต้องมีวันที่ จะกรอกไม่ได้เลย) */
  const emit = (d: string, t: string) => onChange(d || t ? `${d}${t ? `T${t}` : ""}` : "");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 min-w-0">
        <DatePickerModern value={date} onChange={d => emit(d, time)} placeholder="เลือกวันที่" disabled={disabled} />
      </div>
      <div className="w-[124px] flex-shrink-0">
        <TimePickerModern value={time} onChange={t => emit(date, t)} placeholder="เวลา" />
      </div>
    </div>
  );
}
