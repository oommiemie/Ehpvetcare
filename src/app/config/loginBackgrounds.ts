/* ─────────────────────────────────────────────────────────────
   ภาพพื้นหลังหน้าเข้าสู่ระบบ

   ⭐ วิธีเพิ่มภาพใหม่: วางไฟล์ที่มีคำว่า "login" อยู่ในชื่อ ลงใน src/assets/
      เช่น bglogin2.png, "ba2 login.png", login-clinic.jpg
      แล้วภาพจะขึ้นในหน้าตั้งค่าเองทันที — ไม่ต้องแก้โค้ดไฟล์นี้

   ตั้งชื่อไทยที่แสดงได้ใน LABELS ด้านล่าง (key = ชื่อไฟล์ไม่มีนามสกุล)
   ถ้าไม่ตั้ง จะใช้ "แบบที่ N" ตามลำดับ
   ───────────────────────────────────────────────────────────── */

const modules = import.meta.glob("../../assets/*login*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

/** ชื่อไทยของแต่ละไฟล์ — key = ชื่อไฟล์ (ไม่มีนามสกุล) */
const LABELS: Record<string, string> = {
  bglogin: "โรงพยาบาลอัจฉริยะ (เริ่มต้น)",   // ภาพถ่ายโทนเขียวมิ้นต์ + เส้นแสง AI
  "ba2 login": "โมเสกสัตว์เลี้ยง",            // บล็อกสีสดตัดกัน + ไอคอนบริการ
  "ba3 login": "คลินิกอบอุ่น",                // ภาพวาดคุณหมอกับสัตว์เลี้ยง โทนพาสเทล
  "ba4 login": "เคาน์เตอร์ต้อนรับ",           // ภาพถ่ายจริง คุณหมอทักทายหลังเคาน์เตอร์ โทนน้ำเงิน-ครีม
};

export interface LoginBg {
  key: string;     // ชื่อไฟล์ไม่มีนามสกุล — ใช้เป็นค่าที่บันทึก
  label: string;
  src: string;
}

const DEFAULT_KEY = "bglogin";

export const LOGIN_BACKGROUNDS: LoginBg[] = Object.entries(modules)
  .map(([path, src]) => ({
    key: path.split("/").pop()!.replace(/\.(png|jpg|jpeg|webp)$/i, ""),
    src,
  }))
  /* ตัวเริ่มต้นมาก่อนเสมอ ที่เหลือเรียงตามชื่อไฟล์ */
  .sort((a, b) =>
    a.key === DEFAULT_KEY ? -1 : b.key === DEFAULT_KEY ? 1 : a.key.localeCompare(b.key, "th"),
  )
  .map((b, i) => ({ ...b, label: LABELS[b.key] ?? `แบบที่ ${i + 1}` }));

export const DEFAULT_LOGIN_BG = LOGIN_BACKGROUNDS[0]?.key ?? DEFAULT_KEY;

export const loginBgSrc = (key: string) =>
  (LOGIN_BACKGROUNDS.find(b => b.key === key) ?? LOGIN_BACKGROUNDS[0])?.src ?? "";
