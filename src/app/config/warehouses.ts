import type { StockProduct } from "../contexts/ClinicDataContext";

/* ─────────────────────────────────────────────────────────────
   คลัง / หน่วยจ่ายย่อย (Store room)

   ระบบเดิมเก็บ stock เป็นยอดรวมก้อนเดียวต่อสินค้า (StockProduct.stock)
   ไม่มีมิติ "คลัง" — ไฟล์นี้เพิ่มมิตินั้นเข้ามา

   ⚠️ การกระจายยอดลงคลังเป็นการ "แบ่งยอดรวมที่มีอยู่" ด้วยสูตรคงที่
      (อิง id สินค้า) ไม่ใช่ยอดจริงรายคลังจากระบบหลังบ้าน
      ผลรวมทุกคลัง = product.stock เสมอ และค่าคงที่ทุกครั้งที่เปิด
      หากต่อ backend จริงในอนาคต ให้แทนที่ stockByWarehouse() ด้วยข้อมูลจริง
   ───────────────────────────────────────────────────────────── */

export interface Warehouse {
  key: string;
  label: string;      // ชื่อที่แสดง
  sub: string;        // คำอธิบายสั้น
  color: string;      // สีประจำคลัง (ใช้กับชิป/ไอคอน)
  main?: boolean;     // คลังหลัก — รับของเข้าจาก PO
  /** สัดส่วนของยอดรวมที่อยู่ในคลังนี้ (รวมทุกคลัง = 1) */
  share: number;
  /** หมวดสินค้าที่คลังนี้ถือ — ถ้าไม่ระบุ = ถือได้ทุกหมวด */
  onlyCategories?: string[];
}

export const WAREHOUSES: Warehouse[] = [
  /* คลังหลักถือทุกหมวด (รับเข้าจาก PO ก่อนกระจายไปคลังย่อย)
     คลังย่อยถือเฉพาะหมวดที่ตรงกับหน้าที่ของตัวเอง */
  { key: "main",     label: "คลังหลัก",        sub: "Main Store · รับเข้าจาก PO", color: "#0d9488", main: true, share: 0.45 },
  { key: "opd",      label: "ห้องยา OPD",      sub: "จ่ายยาผู้ป่วยนอก",           color: "#3b82f6", share: 0.18,
    onlyCategories: ["ยา/วิตามิน"] },
  { key: "ipd",      label: "ห้องยา IPD",      sub: "จ่ายยาผู้ป่วยใน",            color: "#8b5cf6", share: 0.12,
    onlyCategories: ["ยา/วิตามิน"] },
  { key: "pos",      label: "คลังร้านค้า",      sub: "หน้าร้าน / POS",             color: "#f59e0b", share: 0.17,
    onlyCategories: ["อาหาร/ขนม", "ของเล่น", "อุปกรณ์"] },
  { key: "grooming", label: "คลังอาบน้ำ-ตัดขน", sub: "อุปกรณ์บริการ",              color: "#ec4899", share: 0.08,
    onlyCategories: ["Grooming"] },
];

/** คลังนี้ถือสินค้าตัวนี้ได้ไหม (ไม่ระบุ onlyCategories = ถือได้ทุกหมวด) */
export const whHolds = (w: Warehouse, category: string) =>
  !w.onlyCategories || w.onlyCategories.includes(category);

export const warehouseByKey = (k: string) => WAREHOUSES.find(w => w.key === k);

/* กระจายยอดคงเหลือลงคลังแบบคงที่ (deterministic)
   - ปัดเศษลงทุกคลัง แล้วโยนเศษที่เหลือทั้งหมดเข้าคลังหลัก → ผลรวมตรงกับ product.stock เสมอ
   - เลื่อนลำดับคลังตาม id สินค้า เพื่อให้แต่ละสินค้ากระจายไม่เหมือนกัน (ดูสมจริง) */
export function stockByWarehouse(p: StockProduct): Record<string, number> {
  const out: Record<string, number> = {};
  const total = Math.max(0, p.stock);
  /* เฉพาะคลังย่อยที่ "ถือหมวดนี้ได้" เท่านั้น — คลังอื่นได้ 0 */
  const eligible = WAREHOUSES.filter(w => !w.main && whHolds(w, p.category));
  for (const w of WAREHOUSES) out[w.key] = 0;

  let assigned = 0;
  if (eligible.length) {
    /* กระจายยอดของคลังย่อยที่เข้าเกณฑ์ตามสัดส่วนของตัวเอง
       ปรับสเกลให้สัดส่วนรวมของกลุ่มที่เข้าเกณฑ์ = 55% เท่าเดิม (คลังหลักเหลือ ~45%) */
    const sumShare = eligible.reduce((t, w) => t + w.share, 0);
    const scale = 0.55 / sumShare;
    for (const w of eligible) {
      const qty = Math.floor(total * w.share * scale);
      out[w.key] = qty;
      assigned += qty;
    }
  }
  const mainKey = WAREHOUSES.find(w => w.main)!.key;
  out[mainKey] = total - assigned;   // เศษทั้งหมดอยู่คลังหลัก
  return out;
}

/* ── ล็อตสินค้าในคลัง ── */
export interface WarehouseLot {
  lotNo: string;
  receivedAt: string;   // ISO
  expiry: string;       // ISO
  qty: number;
  costPerUnit: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const isoShift = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/* แตกยอดของสินค้าในคลังหนึ่ง ๆ ออกเป็นล็อต (คงที่ต่อ product+warehouse)
   today ส่งเข้ามาจาก component เพื่อให้คำนวณครั้งเดียว ไม่สร้าง Date ใหม่ทุกแถว

   อายุล็อตกระจายเป็น 3 กลุ่มตามสัดส่วนจริงของคลังยา:
     ~7%  หมดอายุแล้ว        (ค้างสต๊อก รอทำลาย/ตัดจำหน่าย)
     ~13% ใกล้หมดอายุ ≤90 วัน (ต้องเร่งใช้/ระบาย)
     ~80% ปกติ 91–700 วัน
   (สูตรเดิมให้อายุขั้นต่ำ 160 วันเสมอ ทำให้ไม่มีของหมดอายุเลย KPI จึงเป็น 0 ตลอด) */
export function lotsOf(p: StockProduct, whKey: string, qty: number, today: Date): WarehouseLot[] {
  if (qty <= 0) return [];
  const seed = p.id * 7 + whKey.length * 13 + whKey.charCodeAt(0);
  /* ของเยอะ = หลายล็อต (สูงสุด 3) */
  const n = qty > 40 ? 3 : qty > 12 ? 2 : 1;
  const lots: WarehouseLot[] = [];
  let left = qty;
  for (let i = 0; i < n; i++) {
    const isLast = i === n - 1;
    const q = isLast ? left : Math.max(1, Math.floor(qty / n));
    left -= q;

    const bucket = (seed + i * 29) % 100;          // 0–99 กระจายกลุ่มอายุ
    const jitter = (seed + i * 17) % 60;
    const daysToExpiry =
      bucket < 7   ? -(1 + ((seed + i * 11) % 120))    // หมดอายุแล้ว 1–120 วัน
      : bucket < 20 ? 5 + ((seed + i * 13) % 85)        // ใกล้หมดอายุ 5–89 วัน
      :               95 + jitter + ((seed + i * 41) % 545);  // ปกติ 95–700 วัน
    const ageDays = 20 + ((seed + i * 37) % 90);   // รับเข้ามาแล้ว 20–110 วัน

    lots.push({
      lotNo: `LOT-${String(p.id).padStart(3, "0")}${whKey.slice(0, 2).toUpperCase()}${i + 1}`,
      receivedAt: isoShift(today, -ageDays),
      expiry: isoShift(today, daysToExpiry),
      qty: q,
      costPerUnit: p.costPrice,
    });
    if (left <= 0) break;
  }
  return lots;
}

/* จุดสั่งซื้อรายคลัง — ย่อ minStock ของสินค้าตามสัดส่วนที่คลังนี้ถือ
   (ถ้าเทียบยอดคลังย่อยกับ minStock ของทั้งก้อน ทุกคลังย่อยจะขึ้น "ถึงจุดสั่งซื้อ" หมด) */
export function minStockOf(p: { minStock: number }, whKey: string): number {
  const w = WAREHOUSES.find(x => x.key === whKey);
  if (!w) return p.minStock;
  return Math.max(1, Math.round(p.minStock * w.share));
}

/** เหลือกี่วันจะหมดอายุ (ติดลบ = หมดแล้ว) */
export const daysLeft = (isoDate: string, today: Date) =>
  Math.round((new Date(isoDate).getTime() - today.getTime()) / 86400000);
