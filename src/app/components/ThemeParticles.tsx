/* ─────────────────────────────────────────────────────────────
   อนุภาคประจำธีม — หิมะ (คริสต์มาส) / หัวใจ (วาเลนไทน์) / ดาว (วันแม่)
   ใช้ที่หน้าล็อกอิน + sidebar

   เอฟเฟกต์ทั้งหมดอยู่ใน styles/theme.css (.vet-snow / .vet-hearts / .vet-stars)
   เป็น CSS ล้วน — 3 ชั้น tile: หิมะ/หัวใจเลื่อนลงคนละความเร็ว
   ส่วนดาวอยู่กับที่แล้วกะพริบคนละจังหวะ
   ไม่มี state / requestAnimationFrame / canvas จึงไม่ทำให้หน้าหนืด

   hero section ไม่ใช้คอมโพเนนต์นี้ — ใช้คลาส .vet-hero-fx
   ที่ตัว div ของ gradient แทน (::after) เพื่อไม่ต้องแก้ทุกหน้า
   ───────────────────────────────────────────────────────────── */
import type { ThemeFx } from "../contexts/DisplayContext";

const KIND_CLASS: Record<ThemeFx, string> = {
  snow: "vet-snow",
  hearts: "vet-hearts",
  stars: "vet-stars",
};

interface ThemeParticlesProps {
  /** ชนิดอนุภาคของธีมปัจจุบัน (จาก useDisplay().fx) */
  fx: ThemeFx;
  /** sm = sidebar (จางลงไม่ให้กวนเมนู) · lg = เต็มจอหน้าล็อกอิน */
  size?: "sm" | "lg";
  className?: string;
}

export function ThemeParticles({ fx, size = "lg", className = "" }: ThemeParticlesProps) {
  return (
    <div aria-hidden className={`${KIND_CLASS[fx]} vet-fx-${size} ${className}`}>
      {/* ชั้นไกล → ใกล้ (ดูลำดับ nth-child ใน theme.css) */}
      <span />
      <span />
      <span />
    </div>
  );
}
