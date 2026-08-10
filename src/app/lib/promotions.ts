/* ─────────────────────────────────────────────────────────────
   โปรโมชั่น · คูปองส่วนลด · แพ็กเกจ

   สองแบบที่ต่างกันคนละเรื่อง จึงเก็บในโครงเดียวกันแต่คนละชุดฟิลด์
     คูปอง  — ลดเป็น % ของค่าบริการในกลุ่มที่กำหนด ใช้ได้จนหมดอายุ
     แพ็กเกจ — ซื้อสิทธิ์ล่วงหน้าเป็นจำนวนครั้ง ตัดทีละครั้งตอนมาใช้บริการ

   เก็บลง localStorage เพราะต้องใช้ข้ามหน้า (ตั้งค่า → ชำระเงินของ
   ตรวจรักษา/อาบน้ำตัดขน/ฝากเลี้ยง) และต้องอยู่ข้ามการรีเฟรช
   ───────────────────────────────────────────────────────────── */

const KEY_PROMOS = "ehp_promotions_v1";
const KEY_REDEEM = "ehp_promo_redemptions_v1";

export type PromoKind = "coupon" | "package";

/** กลุ่มบริการที่โปรโมชั่นใช้ได้ — ตรงกับหน้าที่มีการชำระเงิน */
export type PromoScope = "treat" | "groom" | "boarding";

export const PROMO_SCOPES: { key: PromoScope; label: string }[] = [
  { key: "treat",    label: "รักษา" },
  { key: "groom",    label: "อาบน้ำ" },
  { key: "boarding", label: "ฝากเลี้ยง" },
];

export interface Promotion {
  id: string;
  kind: PromoKind;
  name: string;
  scopes: PromoScope[];
  active: boolean;
  createdAt: string;          // ISO

  /* ── คูปอง ── */
  code?: string;              // รหัสที่ลูกค้าบอก เช่น GROOM50
  discountPercent?: number;
  expiry?: string;            // ISO — ไม่ระบุ = ไม่มีวันหมดอายุ

  /* ── แพ็กเกจ ── */
  quota?: number;             // จำนวนสิทธิ์ (ครั้ง)
  price?: number;             // ราคาแพ็กเกจที่ขาย
  unitPrice?: number;         // ราคาปกติต่อครั้ง — ใช้คำนวณส่วนที่ประหยัด
  validDays?: number;         // อายุหลังซื้อ (วัน)
  transferable?: boolean;     // โอนสิทธิ์ให้สัตว์เลี้ยงตัวอื่นได้

  /* ── ผูกกับสัตว์เลี้ยง ── */
  petId?: number | null;      // null = ใช้ได้ทุกตัวของเจ้าของ
  petLabel?: string;          // ชื่อที่แสดง เช่น "น้องมด (บีเกิ้ล) - คุณวนิดา"
}

/** 1 ครั้งที่ถูกใช้ไป */
export interface Redemption {
  id: string;
  promoId: string;
  at: string;                 // ISO
  scope: PromoScope;
  petId?: number | null;
  petName?: string;
  /** ส่วนลดที่ได้จริงจากครั้งนี้ (บาท) */
  amount: number;
  note?: string;
}

/* ── อ่าน/เขียน ── */
function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}
function write<T>(key: string, rows: T[]) {
  try { localStorage.setItem(key, JSON.stringify(rows)); } catch { /* โควตาเต็ม */ }
}


/* ── ข้อมูลตัวอย่าง ──
   ใส่ให้ครั้งแรกที่เปิดระบบ จะได้เห็นหน้าตาจริงโดยไม่ต้องนั่งสร้างเอง
   ใช้ธงแยกจากรายการ — ถ้าเช็คว่า "ว่าง" แล้วเติม ผู้ใช้ลบทิ้งหมดเมื่อไหร่
   ของตัวอย่างจะโผล่กลับมาทุกครั้ง ซึ่งน่ารำคาญกว่าไม่มีเลย */
const KEY_SEEDED = "ehp_promotions_seeded_v1";

const dayShift = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

function seedRows(): { promos: Promotion[]; redemptions: Redemption[] } {
  const now = new Date();
  const promos: Promotion[] = [
    {
      id: "seed-pkg-groom5", kind: "package",
      name: "แพ็กเกจอาบน้ำตัดขน 5 ครั้ง",
      scopes: ["groom"], active: true,
      createdAt: dayShift(now, -9),
      quota: 5, price: 2200, unitPrice: 550, validDays: 90, transferable: false,
      petId: null,
    },
    {
      id: "seed-cp-groom50", kind: "coupon",
      name: "ลด 50% ค่าอาบน้ำตัดขน", code: "GROOM50",
      scopes: ["groom"], active: true,
      createdAt: dayShift(now, -20),
      discountPercent: 50, expiry: dayShift(now, 21),
      petId: null,
    },
    {
      id: "seed-cp-newpet", kind: "coupon",
      name: "ลูกค้าใหม่ ลด 20% ค่าตรวจรักษา", code: "NEWPET20",
      scopes: ["treat"], active: true,
      createdAt: dayShift(now, -45),
      discountPercent: 20, expiry: dayShift(now, 60),
      petId: null,
    },
    {
      id: "seed-pkg-vax3", kind: "package",
      name: "แพ็กเกจวัคซีนประจำปี 3 เข็ม",
      scopes: ["treat"], active: true,
      createdAt: dayShift(now, -30),
      quota: 3, price: 900, unitPrice: 350, validDays: 180, transferable: true,
      petId: null,
    },
    {
      id: "seed-cp-stay", kind: "coupon",
      name: "ฝากเลี้ยง 7 คืนขึ้นไป ลด 15%", code: "STAY15",
      scopes: ["boarding"], active: true,
      createdAt: dayShift(now, -14),
      discountPercent: 15, expiry: dayShift(now, 45),
      petId: null,
    },
    /* ตัวอย่างที่ใช้ไม่ได้ — ให้เห็นว่าระบบบอกเหตุผลยังไง */
    {
      id: "seed-cp-expired", kind: "coupon",
      name: "โปรฯ สงกรานต์ ลด 30%", code: "SONGKRAN30",
      scopes: ["groom", "treat"], active: true,
      createdAt: dayShift(now, -150),
      discountPercent: 30, expiry: dayShift(now, -5),
      petId: null,
    },
  ];

  /* ใช้แพ็กเกจอาบน้ำไปแล้ว 2 ครั้ง — แถบสิทธิ์คงเหลือจะได้มีอะไรให้ดู */
  const redemptions: Redemption[] = [
    { id: "seed-r2", promoId: "seed-pkg-groom5", at: dayShift(now, -2), scope: "groom", petId: null, amount: 550, note: "ตัดจากแพ็กเกจ (ครั้งที่ 2)" },
    { id: "seed-r1", promoId: "seed-pkg-groom5", at: dayShift(now, -9), scope: "groom", petId: null, amount: 550, note: "ตัดจากแพ็กเกจ (ครั้งที่ 1)" },
  ];
  return { promos, redemptions };
}

/** เติมตัวอย่างครั้งเดียวตอนเปิดระบบครั้งแรก */
function ensureSeeded() {
  try {
    if (localStorage.getItem(KEY_SEEDED)) return;
    localStorage.setItem(KEY_SEEDED, "1");
    const { promos, redemptions } = seedRows();
    if (!localStorage.getItem(KEY_PROMOS)) write(KEY_PROMOS, promos);
    if (!localStorage.getItem(KEY_REDEEM)) write(KEY_REDEEM, redemptions);
  } catch { /* ปิด storage — ไม่มีตัวอย่างก็ใช้งานได้ปกติ */ }
}

export const listPromotions = () => { ensureSeeded(); return read<Promotion>(KEY_PROMOS); };
export const listRedemptions = () => { ensureSeeded(); return read<Redemption>(KEY_REDEEM); };

export function savePromotion(p: Promotion) {
  const all = listPromotions();
  const i = all.findIndex(x => x.id === p.id);
  if (i >= 0) all[i] = p; else all.unshift(p);
  write(KEY_PROMOS, all);
}
export function deletePromotion(id: string) {
  write(KEY_PROMOS, listPromotions().filter(p => p.id !== id));
  /* ประวัติการใช้เก็บไว้ — ลบโปรฯ แล้วบิลเก่าต้องยังอธิบายได้ว่าส่วนลดมาจากไหน */
}

export function redeem(r: Omit<Redemption, "id">) {
  write(KEY_REDEEM, [{ ...r, id: `r${Date.now()}${Math.floor(performance.now() % 1000)}` }, ...listRedemptions()]);
}
/** ยกเลิกการใช้ครั้งล่าสุดของโปรฯ นี้ — กดใช้ผิดใบต้องถอยได้ */
export function undoLastRedeem(promoId: string) {
  const all = listRedemptions();
  const i = all.findIndex(r => r.promoId === promoId);
  if (i < 0) return;
  write(KEY_REDEEM, all.filter((_, k) => k !== i));
}

/* ── สถานะการใช้งาน ── */
export const usedCount = (promoId: string, rows = listRedemptions()) =>
  rows.filter(r => r.promoId === promoId).length;

export function remainingQuota(p: Promotion, rows = listRedemptions()): number {
  if (p.kind !== "package" || !p.quota) return Infinity;
  return Math.max(0, p.quota - usedCount(p.id, rows));
}

/** วันหมดอายุจริง — คูปองใช้ expiry ตรง ๆ แพ็กเกจนับจากวันสร้าง + อายุ */
export function expiryOf(p: Promotion): Date | null {
  if (p.kind === "coupon") return p.expiry ? new Date(p.expiry) : null;
  if (!p.validDays) return null;
  const d = new Date(p.createdAt);
  d.setDate(d.getDate() + p.validDays);
  return d;
}

export type PromoBlock = "inactive" | "expired" | "used-up" | "wrong-pet" | "wrong-scope" | null;

/**
 * ใช้โปรฯ นี้กับงานตรงหน้าได้ไหม — คืนเหตุผลที่ใช้ไม่ได้ หรือ null ถ้าใช้ได้
 * แยกเป็นเหตุผลแทน boolean เพราะหน้าจอต้องบอกได้ว่าติดอะไร
 */
export function blockReason(
  p: Promotion,
  ctx: { scope: PromoScope; petId?: number | null; now?: Date; rows?: Redemption[] },
): PromoBlock {
  const now = ctx.now ?? new Date();
  if (!p.active) return "inactive";
  if (!p.scopes.includes(ctx.scope)) return "wrong-scope";
  const exp = expiryOf(p);
  if (exp && now > exp) return "expired";
  if (p.kind === "package" && remainingQuota(p, ctx.rows) <= 0) return "used-up";
  /* ผูกไว้กับตัวเดียว — โอนสิทธิ์ได้ก็ข้ามข้อนี้ไป */
  if (p.petId != null && !p.transferable && ctx.petId != null && p.petId !== ctx.petId) return "wrong-pet";
  return null;
}

export const BLOCK_TEXT: Record<Exclude<PromoBlock, null>, string> = {
  inactive:     "ปิดใช้งานอยู่",
  expired:      "หมดอายุแล้ว",
  "used-up":    "ใช้สิทธิ์ครบแล้ว",
  "wrong-pet":  "ผูกกับสัตว์เลี้ยงตัวอื่น",
  "wrong-scope":"ใช้กับบริการนี้ไม่ได้",
};

/**
 * ส่วนลดที่จะได้จากบิลนี้
 *   คูปอง  — ลดตาม % ของยอด
 *   แพ็กเกจ — ตัด 1 สิทธิ์ ลดเท่าราคาปกติต่อครั้ง แต่ไม่เกินยอดบิล
 */
export function discountFor(p: Promotion, subtotal: number): number {
  if (p.kind === "coupon") return Math.round((subtotal * (p.discountPercent ?? 0)) / 100);
  const perUse = p.unitPrice ?? (p.quota ? Math.round((p.price ?? 0) / p.quota) : 0);
  return Math.min(subtotal, perUse);
}

/** ราคาเฉลี่ยต่อครั้งของแพ็กเกจ — โชว์ตอนตั้งค่าให้เห็นว่าคุ้มแค่ไหน */
export const perUsePrice = (price: number, quota: number) =>
  quota > 0 ? Math.round(price / quota) : 0;
