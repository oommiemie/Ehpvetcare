/* ─────────────────────────────────────────────────────────────
   แพทย์คนไหน "เปิดใช้ Slot นัดหมาย" บ้าง

   ตั้งค่าที่หน้าข้อมูลบุคลากร แต่คนที่ต้องรู้คือหน้าจองนัดหมาย
   สองหน้านี้อยู่คนละที่และไม่มี context ร่วมกัน จึงพักค่าไว้ตรงนี้

   ความหมายของค่า
     เปิด  → จองได้เฉพาะวัน/เวลาที่แพทย์เปิด slot ไว้ในตารางออกตรวจ
     ปิด   → ไม่คุมด้วย slot จองวันไหนเวลาไหนก็ได้

   ค่าเริ่มต้นเป็น "เปิด" — แพทย์ในระบบมีตารางออกตรวจกันอยู่แล้ว
   ถ้า default เป็นปิด การคุมคิวที่ตั้งไว้จะหายไปเงียบ ๆ ตอนอัปเดต
   ───────────────────────────────────────────────────────────── */

const KEY = "ehp_vet_slot_prefs_v1";

type Prefs = Record<string, boolean>;   // slotKey ("v1") → เปิดใช้ slot ไหม

function read(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

/** ยังไม่เคยตั้งค่า = เปิด */
export function vetUsesSlots(slotKey?: string | null): boolean {
  if (!slotKey) return false;   // ไม่ผูกกับตารางออกตรวจ ก็คุมด้วย slot ไม่ได้
  return read()[slotKey] ?? true;
}

export function setVetUsesSlots(slotKey: string, on: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...read(), [slotKey]: on }));
  } catch { /* โควตาเต็ม — ไม่ควรทำให้การบันทึกบุคลากรล้มไปด้วย */ }
}
