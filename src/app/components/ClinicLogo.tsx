/* ─────────────────────────────────────────────────────────────
   โลโก้คลินิก + ของประดับประจำเทศกาล
     คริสต์มาส → หมวกซานตา
     ฮาโลวีน   → ค้างคาว 2 ตัวเกาะมุมบน

   ใช้ <LogoDecor /> จุดเดียวได้ทุกที่ — ตัวมันเลือกของประดับตามธีมเอง
   เพิ่มเทศกาลใหม่ก็เติมในนี้ ไม่ต้องไล่แก้ทุกหน้าที่มีโลโก้

   ของประดับวางคร่อมมุมของ "กล่อง" ที่ครอบโลโก้อยู่
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

/* ── ค้างคาวรอบโลโก้ (ธีมฮาโลวีน) ──
   2 ตัวเกาะมุมบนซ้าย-ขวา กระพือปีกคนละจังหวะ (ดู .vet-logo-bat ใน theme.css)
   ตัวขวาพลิกด้าน จะได้ไม่ดูเป็นตัวเดียวก๊อปมาวาง

   วาดเป็น SVG ในโค้ด ไม่ใช้ไฟล์ภาพ — ตัวเล็กมาก (~20px) ถ้าใช้ PNG
   จะเบลอบนจอ retina และต้องมีไฟล์เพิ่มอีกใบโดยไม่จำเป็น */
/* สัดส่วนกรอบ 120:32 — ปีกกางยาว ลำตัวเรียวเล็กอยู่กลาง
   ต้องวาดใหม่ ไม่ใช่ยืดของเดิม เพราะยืดกรอบแล้วลำตัวกับหูจะอ้วนตามไปด้วย
   ปีกทำขอบท้ายเป็นหยัก 2 ลอน = ลักษณะเด่นที่ทำให้อ่านออกว่าค้างคาว */
export const BAT_RATIO = "120 / 32";
const BAT_PATH_BODY = "M60 8c-1.9 0-3.4 1.5-3.4 3.4v11.2c0 1.9 1.5 3.4 3.4 3.4s3.4-1.5 3.4-3.4V11.4C63.4 9.5 61.9 8 60 8z";
const BAT_PATH_WING_L = "M56.6 12C41.1 3.5 20.2 1.5 3 5c5.5 4 7.4 9 8 14C14.7 14.5 18.4 14 22.1 16.5 25.1 19 27 22 30.1 23.5c3.7-2 6.1-5 9.2-5.5C43.6 18.5 50.9 21 56.6 23Z";
const BAT_PATH_WING_R = "M63.4 12C78.9 3.5 99.8 1.5 117 5c-5.5 4-7.4 9-8 14C105.3 14.5 101.6 14 97.9 16.5 94.9 19 93 22 89.9 23.5c-3.7-2-6.1-5-9.2-5.5C76.4 18.5 69.1 21 63.4 23Z";

/** รูปค้างคาวล้วน ๆ ไม่มีตำแหน่ง/แอนิเมชัน — เอาไปวางที่ไหนก็ได้
    (ใช้ที่โลโก้ และที่แถบขีดเมนู active ใน sidebar) */
export const BatMark = ({ fill }: { fill: string }) => (
  <svg viewBox="0 0 120 32" width="100%" height="100%" aria-hidden>
    <g fill={fill}>
      <path d={BAT_PATH_BODY} />
      <path d="M57.6 9.4 56.2 3 59.8 6.6z" />
      <path d="M62.4 9.4 63.8 3 60.2 6.6z" />
      <path d={BAT_PATH_WING_L} />
      <path d={BAT_PATH_WING_R} />
    </g>
  </svg>
);

/* ตัวหลัก (ซ้าย) ใหญ่กว่าและเข้มกว่า · ตัวรอง (ขวา) เล็กกว่า สูงกว่า พลิกด้าน */
const BAT_VARIANTS = {
  box:  { w: "40%", lead: { left: "-14%", top: "-22%" }, trail: { right: "-12%", top: "-34%" } },
  icon: { w: "36%", lead: { left: "-12%", top: "-20%" }, trail: { right: "-10%", top: "-30%" } },
} as const;

export function LogoBats({ variant = "box", className = "" }: { variant?: keyof typeof BAT_VARIANTS; className?: string }) {
  const { bgSet } = useDisplay();
  if (bgSet !== "halloween") return null;
  /* ไม่เกาะวงไอคอนเมนู — ต่างจากหมวกซานตาที่มีใบเดียวนิ่ง ๆ
     ค้างคาว 2 ตัวกระพือปีกบนไอคอน 36px ที่เห็นอยู่ทุกหน้าจะรกเกินไป
     เอาไว้ที่โลโก้อย่างเดียว (sidebar · ล็อกอิน · splash) */
  if (variant === "icon") return null;
  const v = BAT_VARIANTS[variant];
  const common = "absolute pointer-events-none select-none z-10 vet-logo-bat";
  return (
    <>
      <span aria-hidden className={`${common} ${className}`}
        style={{ width: v.w, aspectRatio: BAT_RATIO, ...v.lead,
                 filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.30))" }}>
        <BatMark fill="#2e0f42" />
      </span>
      <span aria-hidden className={`${common} ${className}`}
        style={{ width: `calc(${v.w} * 0.72)`, aspectRatio: BAT_RATIO, ...v.trail,
                 transform: "scaleX(-1)", animationDelay: "-0.45s",
                 filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}>
        <BatMark fill="#4c1d68" />
      </span>
    </>
  );
}

/** หยดน้ำใส — ใช้ที่แถบขีดเมนู active ของธีมสงกรานต์
    อ่านออกว่าเป็นน้ำจาก 3 อย่างเหมือนเม็ดน้ำบนกระจก:
    ไล่เฉดสว่างมุมบนซ้าย · ขอบขาวบางรับแสง · จุดไฮไลต์ทึบตรงท้องหยด */
export const DropMark = () => (
  <svg viewBox="0 0 24 32" width="100%" height="100%" aria-hidden>
    <defs>
      <radialGradient id="vet-drop-g" cx="34%" cy="26%" r="80%">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.98" />
        <stop offset="0.36" stopColor="#cfeaff" stopOpacity="0.9" />
        <stop offset="1" stopColor="#1d7fc4" stopOpacity="0.98" />
      </radialGradient>
    </defs>
    <path
      fill="url(#vet-drop-g)"
      stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1"
      d="M12 1.5C12 1.5 3.5 14 3.5 20a8.5 8.5 0 0 0 17 0c0-6-8.5-18.5-8.5-18.5z"
    />
    {/* ไฮไลต์ท้องหยด — ตำแหน่งแสงสะท้อน ตัวชี้ขาดว่าเป็นของเหลว */}
    <ellipse cx="8.8" cy="19.4" rx="2.3" ry="3.3" fill="#ffffff" fillOpacity="0.8" />
  </svg>
);

/* ── ดอกลั่นทมรอบโลโก้ (ธีมสงกรานต์) ──
   ดอกไม้ที่ลอยในขันน้ำสงกรานต์ — กลีบ 5 กลีบเรียงแบบกังหัน
   (กลีบเยื้องจากแกนกลางเล็กน้อย ไม่ใช่สมมาตรเป๊ะ) ซึ่งเป็นลักษณะของลั่นทมจริง
   แกว่งเบา ๆ เหมือนลอยน้ำ — ดู .vet-logo-flower ใน theme.css */
const Plumeria = ({ petal, core }: { petal: string; core: string }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
    <g fill={petal}>
      {[0, 72, 144, 216, 288].map(deg => (
        <ellipse key={deg} cx="54" cy="30" rx="16" ry="22" transform={`rotate(${deg} 50 50)`} />
      ))}
    </g>
    <circle cx="50" cy="50" r="11" fill={core} />
  </svg>
);

/* ดอกใหญ่มุมซ้าย (ขาว) · ดอกเล็กมุมขวา (ครีมเหลือง) เยื้องกันไม่ให้ดูเป็นคู่แฝด */
const FLOWER_VARIANTS = {
  box:  { w: "34%", lead: { left: "-12%", top: "-16%" }, trail: { right: "-10%", top: "-26%" } },
  icon: { w: "30%", lead: { left: "-10%", top: "-14%" }, trail: { right: "-8%",  top: "-22%" } },
} as const;

export function LogoFlowers({ variant = "box", className = "" }: { variant?: keyof typeof FLOWER_VARIANTS; className?: string }) {
  const { bgSet } = useDisplay();
  if (bgSet !== "songkran") return null;
  const v = FLOWER_VARIANTS[variant];
  const common = "absolute pointer-events-none select-none z-10 vet-logo-flower";
  return (
    <>
      <span aria-hidden className={`${common} ${className}`}
        style={{ width: v.w, aspectRatio: "1 / 1", ...v.lead,
                 filter: "drop-shadow(0 2px 3px rgba(12,74,110,0.28))" }}>
        <Plumeria petal="#ffffff" core="#f7c948" />
      </span>
      <span aria-hidden className={`${common} ${className}`}
        style={{ width: `calc(${v.w} * 0.72)`, aspectRatio: "1 / 1", ...v.trail,
                 animationDelay: "-1.3s",
                 filter: "drop-shadow(0 2px 3px rgba(12,74,110,0.24))" }}>
        <Plumeria petal="#fff6d6" core="#eda93b" />
      </span>
    </>
  );
}

/** ของประดับรอบโลโก้ตามเทศกาลของธีมปัจจุบัน — แต่ละตัวเช็คธีมเอง ไม่มีก็ไม่วาดอะไร */
export function LogoDecor({ variant = "box" }: { variant?: "box" | "icon" }) {
  return (
    <>
      <SantaHat variant={variant} />
      <LogoBats variant={variant} />
      <LogoFlowers variant={variant} />
    </>
  );
}

export function ClinicLogo({ className = "", alt = "EHP VetCare" }: { className?: string; alt?: string }) {
  return <img src={clinicLogo} alt={alt} className={`object-contain ${className}`} draggable={false} />;
}
