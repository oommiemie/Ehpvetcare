/* ── ทะเบียนยอดค้างชำระ (Outstanding Balance Registry) ──
 * บันทึกจากหน้าการเงิน IPD เมื่อเจ้าของยังไม่ชำระ
 * ใช้เตือนอัตโนมัติเมื่อสัตว์ตัวเดิมมารับบริการครั้งถัดไป (ตอนส่งตรวจ)
 */
export interface OutstandingEntry {
  admitId: number;
  an?: string;
  hn: string;
  petName: string;
  owner: string;
  ownerPhone?: string;
  amount: number;
  note?: string;
  recordedAt: string;   // ISO
  recordedBy?: string;
}

const KEY = "ehp_outstanding_v1";

export function loadOutstanding(): OutstandingEntry[] {
  try {
    const r = localStorage.getItem(KEY);
    if (r) return JSON.parse(r);
  } catch { /* ignore */ }
  return [];
}

function save(list: OutstandingEntry[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* quota */ }
}

/* เพิ่ม/อัปเดตยอดค้างของ admit เดิม (ทับรายการเก่า) */
export function upsertOutstanding(entry: OutstandingEntry): OutstandingEntry[] {
  const list = loadOutstanding().filter(e => e.admitId !== entry.admitId);
  const next = [entry, ...list];
  save(next);
  return next;
}

/* ลบเมื่อเคลียร์ยอดแล้ว */
export function removeOutstanding(admitId: number): OutstandingEntry[] {
  const next = loadOutstanding().filter(e => e.admitId !== admitId);
  save(next);
  return next;
}

/* หายอดค้างของสัตว์ตัวนี้ — ใช้เตือนตอนส่งตรวจ (match ด้วย HN หรือชื่อ+เจ้าของ) */
export function findOutstandingForPet(hn?: string, petName?: string): OutstandingEntry[] {
  return loadOutstanding().filter(e =>
    (hn && e.hn === hn) || (petName && e.petName === petName)
  );
}
