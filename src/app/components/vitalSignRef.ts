/* ── ตาราง vital_sign — ค่าอ้างอิงสัญญาณชีพตามชนิดสัตว์ ──
 * ใช้ร่วมกันทั้งหน้าจอสัญญาณชีพ OPD (Visits) และ IPD (VitalSignsTab)
 * อุณหภูมิหน่วย °F · ชีพจร bpm · หายใจ rpm
 */
export interface VitalSignRef {
  species: string;      // ชนิดสัตว์ (ตรงกับค่า species ในระบบ)
  pulseMin: number;
  pulseMax: number;
  respMin: number;
  respMax: number;
  tempMin: number;
  tempMax: number;
}

export const VITAL_SIGN_TABLE: VitalSignRef[] = [
  { species: "สุนัข",   pulseMin: 60,  pulseMax: 140, respMin: 10, respMax: 30, tempMin: 100.5, tempMax: 102.5 },
  { species: "แมว",     pulseMin: 140, pulseMax: 220, respMin: 20, respMax: 30, tempMin: 100.5, tempMax: 102.5 },
  { species: "กระต่าย", pulseMin: 130, pulseMax: 325, respMin: 30, respMax: 60, tempMin: 101.3, tempMax: 104.0 },
  { species: "นก",      pulseMin: 250, pulseMax: 600, respMin: 25, respMax: 75, tempMin: 104.0, tempMax: 108.5 },
  { species: "หนู",     pulseMin: 260, pulseMax: 450, respMin: 70, respMax: 115, tempMin: 96.6, tempMax: 99.5 },
  { species: "กระรอก",  pulseMin: 250, pulseMax: 400, respMin: 50, respMax: 100, tempMin: 98.6, tempMax: 102.2 },
];

/* หา row อ้างอิงจากชนิดสัตว์ — ไม่พบใช้ค่าสุนัขเป็น default */
export function getVitalRef(species?: string): VitalSignRef {
  if (species) {
    const hit = VITAL_SIGN_TABLE.find(r => species.includes(r.species) || r.species.includes(species));
    if (hit) return hit;
  }
  return VITAL_SIGN_TABLE[0];
}

export const fmtRange = (min: number, max: number) => `${min}–${max}`;
