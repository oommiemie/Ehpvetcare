/* ─────────────────────────────────────────────────────────────
   โอนสินค้าให้หน่วยจ่าย (Store Room → Store Room)

   ของเข้าคลังหลักก่อนเสมอ แล้วค่อยกระจายไปห้องยา OPD/IPD หน้าร้าน
   ห้องอาบน้ำ เดิมไม่มีที่บันทึกการกระจายนี้ ยอดรายคลังจึงไม่มีเอกสาร
   รองรับ — ใบโอนตรงนี้คือหลักฐานว่าของย้ายจากไหนไปไหน เมื่อไหร่ ใครสั่ง

   1 ใบมีได้หลายรายการ เพราะเบิกของไปห้องยาทีหนึ่งย่อมไม่ได้เบิกตัวเดียว
   ───────────────────────────────────────────────────────────── */

const KEY = "ehp_stock_transfers_v1";

/** เหตุผลการโอน — ตรงกับที่ใช้จริงหน้างาน */
export const TRANSFER_REASONS = [
  "เบิกใช้ประจำวัน",
  "เติมสต็อกหน่วยจ่าย",
  "รับสินค้า มี PO",
  "รับสินค้า ไม่มี PO",
  "รับคืนจากลูกค้า",
  "โอนคืนคลังหลัก",
  "อื่นๆ",
];

export interface TransferLine {
  key: string;
  productId: number | "";
  /** จำนวนตามหน่วยบรรจุที่เลือก */
  qty: string;
  /** หน่วยบรรจุที่กรอก เช่น กล่อง/โหล — คูณด้วย packSize เป็นหน่วยจ่าย */
  packUnit: string;
  packSize: number;
  costPerUnit: string;
}

export interface StockTransfer {
  id: string;
  docNo: string;
  fromWh: string;      // key ของ WAREHOUSES
  toWh: string;
  date: string;        // YYYY-MM-DD
  reason: string;
  note: string;
  createdAt: string;   // ISO
  items: {
    productId: number;
    productName: string;
    /** จำนวนหน่วยจ่ายจริงที่ตัด/เพิ่ม (qty × packSize) */
    stockQty: number;
    stockUnit: string;
    packQty: number;
    packUnit: string;
    costPerUnit: number;
  }[];
}

function read(): StockTransfer[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}
function write(rows: StockTransfer[]) {
  try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch { /* โควตาเต็ม */ }
}

export const listTransfers = () => read();

export function saveTransfer(t: StockTransfer) {
  const all = read();
  const i = all.findIndex(x => x.id === t.id);
  if (i >= 0) all[i] = t; else all.unshift(t);
  write(all);
}
export const deleteTransfer = (id: string) => write(read().filter(t => t.id !== id));

/** มูลค่ารวมของใบโอน */
export const transferValue = (t: StockTransfer) =>
  t.items.reduce((s, it) => s + it.stockQty * it.costPerUnit, 0);

/** เลขที่เอกสารถัดไป — TF-69xxxx นับต่อจากใบล่าสุดของปีนี้ */
export function nextDocNo(now = new Date()): string {
  const yr = String((now.getFullYear() + 543) % 100).padStart(2, "0");
  const prefix = `TF-${yr}`;
  const used = read()
    .map(t => t.docNo)
    .filter(d => d.startsWith(prefix))
    .map(d => parseInt(d.slice(prefix.length), 10))
    .filter(n => !isNaN(n));
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}
