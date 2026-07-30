/* ─────────────────────────────────────────────────────────────
   โลโก้คลินิก + หมวกซานตา (ธีมที่ใช้ชุดภาพคริสต์มาส)

   <SantaHat /> วางคร่อมมุมซ้ายบนของ "กล่อง" ที่ครอบโลโก้อยู่
   (การ์ดขาวใน sidebar / วงกลมในหน้าล็อกอิน / การ์ดใน splash)
   ไม่ได้แปะบนตัวโลโก้ เพื่อไม่ให้บังลายโลโก้

   ขนาด/ตำแหน่งเป็น % ของกล่อง จึงสเกลตามกล่องเองทุกจุด
   เงื่อนไข: กล่องต้องเป็น position: relative และไม่ overflow-hidden
   ───────────────────────────────────────────────────────────── */
import { useDisplay } from "../contexts/DisplayContext";
import clinicLogo from "@/assets/logo ehpvetcare.png";
import santaHat from "@/assets/Santa hat.png";

/** ธีมปัจจุบันสวมหมวกซานตาหรือไม่ */
export function useSantaHat() {
  const { bgSet } = useDisplay();
  return bgSet === "xmas";
}

/* box  = กล่องโลโก้ (การ์ดขาว sidebar / วงกลมหน้าล็อกอิน / การ์ด splash)
   icon = วงกลมไอคอนเมนูที่เลือกอยู่ใน sidebar — เล็กกว่า ยกน้อยกว่า
          ไม่ให้หมวกล้ำขึ้นไปทับเมนูตัวบน (ไอคอน 36px ระยะห่างแถวแค่ 6px) */
const HAT_VARIANTS = {
  box:  { width: "58%", left: "-8%", top: "-34%", deg: -20 },
  icon: { width: "52%", left: "-6%", top: "-30%", deg: -22 },
} as const;

export function SantaHat({
  variant = "box",
  className = "",
}: {
  variant?: keyof typeof HAT_VARIANTS;
  className?: string;
}) {
  const show = useSantaHat();
  if (!show) return null;
  const v = HAT_VARIANTS[variant];
  return (
    <img
      src={santaHat}
      alt=""
      aria-hidden
      draggable={false}
      className={`absolute pointer-events-none select-none z-10 ${className}`}
      style={{
        width: v.width,
        left: v.left,
        top: v.top,
        transform: `rotate(${v.deg}deg)`,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
      }}
    />
  );
}

export function ClinicLogo({ className = "", alt = "EHP VetCare" }: { className?: string; alt?: string }) {
  return <img src={clinicLogo} alt={alt} className={`object-contain ${className}`} draggable={false} />;
}
