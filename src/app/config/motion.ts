/* ─────────────────────────────────────────────────────────────
   จังหวะการเคลื่อนไหวของทั้งระบบ — แหล่งอ้างอิงเดียว

   กติกา 2 ข้อ:
   1) ทุก tween ใช้เส้นโค้งเดียวกัน (EASE) — ถ้าไม่ระบุ motion จะใช้
      easeOut ของตัวเอง ทำให้แอปมีจังหวะ 2 แบบปนกัน
   2) duration เลือกจาก DUR เท่านั้น ไม่ตั้งค่าลอย ๆ

   ยกเว้นได้ 2 กรณี:
   - แอนิเมชันวนซ้ำ (repeat: Infinity) เช่น spinner/pulse → ใช้ linear
     หรือ easeInOut เพราะ EASE ออกแบบมาสำหรับการเข้า-ออกครั้งเดียว
   - การกด/ลาก → ใช้ SPRING ให้รู้สึกตอบสนองมือ ไม่ใช่ tween
   ───────────────────────────────────────────────────────────── */

/* easeOutExpo — ออกตัวเร็ว หยุดนุ่ม เหมาะกับ UI ที่ต้องรู้สึกฉับไว */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DUR = {
  fast: 0.15,   // hover, toggle, chip — สิ่งที่ต้องตอบสนองทันมือ
  base: 0.22,   // ค่าเริ่มต้น: modal, การ์ด, dropdown
  slow: 0.35,   // เนื้อหาเข้าหน้าจอ, section เปิด-ปิด
  hero: 0.5,    // ภาพใหญ่ / หน้า Login — ตั้งใจให้ค่อย ๆ มา
} as const;

/* กดแล้วเด้ง — ใช้กับ whileTap / การลาก ไม่ใช่การเข้า-ออก */
export const SPRING = { type: "spring", stiffness: 500, damping: 28 } as const;

const tween = (duration: number, delay = 0) => ({ duration, ease: EASE, delay });

/* ── ชุดสำเร็จรูปที่ใช้บ่อย ── */
export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: tween(DUR.base, delay),
});

export const fadeUp = (delay = 0, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: tween(DUR.slow, delay),
});

export const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: tween(DUR.base, delay),
});

/* การ์ด modal — ขึ้นจากล่างเล็กน้อยพร้อมย่อ/ขยาย */
export const modalCard = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 24, scale: 0.97 },
  transition: tween(DUR.base),
};

export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: tween(DUR.fast),
};
