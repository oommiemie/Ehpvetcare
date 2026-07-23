/**
 * ระดับสมาชิก (Member Tiers) — อ่านค่าที่ตั้งไว้จากเมนู ตั้งค่า → ระดับสมาชิก
 * แล้วคำนวณระดับจากแต้มสะสมของเจ้าของสัตว์
 */
export interface MemberLevelCfg {
  id: number;
  name: string;
  discountPct: number;     // ซื้อสินค้าได้ส่วนลด (%)
  accumMin: number;        // มูลค่าสะสม จาก
  accumMax: number;        // มูลค่าสะสม ถึง
  redeemPoints: number;    // แต้มสะสม (แต้ม)
  redeemBaht: number;      // = จำนวนเงิน (บาท)
  condition: string;
}

export const MEMBER_LEVELS_KEY = "ehp_member_levels_v1";
export const INIT_MEMBER_LEVELS: MemberLevelCfg[] = [
  { id: 1, name: "Silver",   discountPct: 0,  accumMin: 0,    accumMax: 1000, redeemPoints: 10, redeemBaht: 1, condition: "สมัครสมาชิกใหม่เริ่มต้นที่ระดับนี้" },
  { id: 2, name: "Gold",     discountPct: 5,  accumMin: 1001, accumMax: 2000, redeemPoints: 10, redeemBaht: 1, condition: "" },
  { id: 3, name: "Platinum", discountPct: 10, accumMin: 2001, accumMax: 5000, redeemPoints: 8,  redeemBaht: 1, condition: "รับของขวัญวันเกิดสัตว์เลี้ยงฟรี" },
];

const LEVEL_TONES: Record<string, string> = { Silver: "#94a3b8", Gold: "#d97706", Platinum: "#7c3aed", Diamond: "#0ea5e9" };
export const levelTone = (name: string) => LEVEL_TONES[name] ?? "var(--brand)";

export const getMemberLevels = (): MemberLevelCfg[] => {
  try {
    const s = localStorage.getItem(MEMBER_LEVELS_KEY);
    if (s) { const arr = JSON.parse(s); if (Array.isArray(arr) && arr.length) return arr; }
  } catch { /* ใช้ค่าตั้งต้น */ }
  return INIT_MEMBER_LEVELS;
};

/* ระดับตามแต้มสะสม — เกินช่วงสูงสุดนับเป็นระดับท้ายสุด, ต่ำกว่าทุกช่วงนับเป็นระดับแรก */
export const tierForPoints = (points: number): MemberLevelCfg => {
  const levels = [...getMemberLevels()].sort((a, b) => a.accumMin - b.accumMin);
  return levels.find(l => points >= l.accumMin && points <= l.accumMax)
    ?? (points > levels[levels.length - 1].accumMax ? levels[levels.length - 1] : levels[0]);
};
