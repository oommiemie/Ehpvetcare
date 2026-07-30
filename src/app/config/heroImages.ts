/* ─────────────────────────────────────────────────────────────
   ภาพสัตว์มุมขวาล่างของ hero section — สลับตามชุดภาพของธีม

   ใช้ชุดเดียวกับภาพพื้นหลังหน้าล็อกอิน (LoginBgSet)
   ธีมประกาศไว้ที่ ColorTheme.bgSet — undefined = ชุดปกติ / "xmas" = คริสต์มาส

   ⭐ เพิ่มชุดใหม่: import ภาพเข้ามา แล้วใส่คีย์ในตาราง HERO_IMAGES
   ───────────────────────────────────────────────────────────── */
import type { LoginBgSet } from "./loginBackgrounds";

import heroDashboard from "@/assets/hero1.png";
import heroIpd from "@/assets/ipd hero.png";
import heroDashboardXmas from "@/assets/Sectionhero1.png";
import heroIpdXmas from "@/assets/Sectionhero2.png";
import heroDashboardVlt from "@/assets/herosectionVLT1.png";
import heroIpdVlt from "@/assets/herosectionVLT2.png";
import heroDashboardMom from "@/assets/herosectionMother's Day1.png";
import heroIpdMom from "@/assets/herosectionMother's Day2.png";

/** จุดที่มีภาพสัตว์ใน hero — ปัจจุบันมี 2 หน้า */
export type HeroSlot = "dashboard" | "ipd";

/* Partial = ชุดที่ยังไม่มีภาพของตัวเองก็ไม่ต้องใส่
   heroImage จะถอยไปใช้ชุดปกติให้เอง

   หน้าอื่นที่ไม่มี slot ของตัวเองได้ของประดับประจำเทศกาลจาก CSS แทน
   (คริสต์มาส = ต้นคริสต์มาส / วาเลนไทน์ = ช่อลูกโป่งหัวใจ)
   ดู [data-season] .vet-hero-fx::before ใน styles/theme.css */
const HERO_IMAGES: Record<"default", Record<HeroSlot, string>> &
  Partial<Record<NonNullable<LoginBgSet>, Record<HeroSlot, string>>> = {
  default:    { dashboard: heroDashboard,     ipd: heroIpd },
  xmas:       { dashboard: heroDashboardXmas, ipd: heroIpdXmas },
  /* หมาคู่ผูกโบว์ + ลูกโป่งหัวใจ (แดชบอร์ด) · แมวคู่พันพวงหัวใจ (IPD) */
  valentine:  { dashboard: heroDashboardVlt,  ipd: heroIpdVlt },
  /* โกลเด้นคาบพวงมาลัยมะลิ (แดชบอร์ด) · แมวคู่กับพวงมาลัย (IPD) */
  mothersday: { dashboard: heroDashboardMom,  ipd: heroIpdMom },
};

/* ── ความกว้างที่ใช้วางภาพในแต่ละชุด ──
   หน้า hero บังคับความกว้าง ปล่อยความสูงตามสัดส่วนภาพ
   ชุดส่วนใหญ่ภาพเป็น 3:2 กว้าง 420 จึงได้สูงราว 280 พอดีกรอบ hero
   ชุดไหนภาพเกือบจัตุรัสต้องแคบลง ไม่งั้นสูงเกินแล้วหัวสัตว์โดนขอบบนตัด
   (วันแม่ 703×636 → ถ้ากว้าง 420 จะสูงถึง 380) */
const DEFAULT_WIDTH = 420;
const HERO_WIDTH: Partial<Record<NonNullable<LoginBgSet>, number>> = {
  mothersday: 310,   // → สูงราว 280 เท่าชุดอื่น
};

/** ภาพ hero พร้อมความกว้างที่ควรใช้ */
export interface HeroArt { src: string; width: number }

/** ภาพ hero ของ slot นั้นตามชุดของธีม — ไม่มีชุดนั้นก็ถอยไปใช้ชุดปกติ
    (ถอยไปใช้ภาพชุดปกติเมื่อไหร่ ก็ใช้ความกว้างมาตรฐานด้วย) */
export const heroImage = (slot: HeroSlot, set: LoginBgSet): HeroArt => {
  const src = set && HERO_IMAGES[set]?.[slot];
  return src
    ? { src, width: (set && HERO_WIDTH[set]) ?? DEFAULT_WIDTH }
    : { src: HERO_IMAGES.default[slot], width: DEFAULT_WIDTH };
};
