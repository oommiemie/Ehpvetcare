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
  "ba login chistmast 2026": "คริสต์มาส · ห้องตรวจ",   // ห้องตรวจ 3D พื้นแดง ต้นคริสต์มาส กองหิมะ
  "ba3 login chistmast 2026 2": "คริสต์มาส · เลื่อนซานตา", // ต้นคริสต์มาสจริง + เลื่อน หมาใส่หมวกซานตากับแมว
  "bg login1 Valentine 2026": "วาเลนไทน์ · ห้องตรวจ",    // ห้องตรวจ 3D พื้นชมพู ต้นกุหลาบทรงหัวใจ ก้อนเมฆ
  "bg login2 Valentine 2026": "วาเลนไทน์ · สัตว์เลี้ยงบนก้อนเมฆ", // หมา แมว กระต่าย ปลาทอง บนก้อนเมฆ + ช่อลูกโป่งหัวใจ พื้นชมพูไล่เฉด
  "bg login1 Mother's Day2026": "วันแม่ · แม่กับน้องแมว", // พื้นฟ้าอ่อน ดอกมะลิ ริบบิ้นน้ำเงิน แม่อุ้มแมวในกรอบพวงมะลิ
  "ba1 login halloween 2026": "ฮาโลวีน · ห้องตรวจ",   // ห้องตรวจ 3D ฟักทอง ผี ใยแมงมุม ต้นไม้แห้งค้างคาว
  "ba2 login halloween 2026": "ฮาโลวีน · แมวดำฟักทอง", // แมวดำโผล่จากฟักทอง + ค้างคาวบิน พื้นส้ม
  "ba1 login songkran 2026": "สงกรานต์ · ห้องตรวจสาดน้ำ", // ห้องตรวจ 3D ปืนฉีดน้ำ ขันเงิน พวงมาลัย คลื่นน้ำ พื้นฟ้า
};

/* จับภาพเข้า "ชุดของธีมเทศกาล" จากชื่อไฟล์
   วางไฟล์ใหม่ที่มีทั้งคำว่า "login" และคำของเทศกาลใน src/assets/
   แล้วภาพจะขึ้นเป็นตัวเลือกของธีมนั้นเองทันที ไม่ต้องแก้โค้ด
   (chistmast = สะกดผิดที่ใช้จริงในไฟล์ ต้องรับไว้ด้วย) */
const SET_PATTERNS: Array<[Exclude<LoginBgSet, undefined>, RegExp]> = [
  ["xmas",       /christmas|chistmast|xmas|คริสต์?มาส/i],
  ["valentine",  /valentine|วาเลนไทน์/i],
  /* รับได้ทั้ง Mother's Day / Mothers Day / MothersDay (มี-ไม่มี ' และเว้นวรรค) */
  ["mothersday", /mother'?s?\s*day|วันแม่/i],
  ["halloween",  /hall?owe?en|ฮาโลวีน|ฮัลโลวีน/i],
  ["songkran",   /songkran|สงกรานต์/i],
];

const detectSet = (key: string): LoginBgSet =>
  SET_PATTERNS.find(([, re]) => re.test(key))?.[0];

/** ชุดของภาพ — undefined = ชุดปกติ (ธีมทั่วไป) / อื่น ๆ = ชุดของธีมเทศกาล
    หน้าตั้งค่าจะโชว์เฉพาะภาพที่ set ตรงกับ bgSet ของธีมที่เลือกอยู่ */
export type LoginBgSet = "xmas" | "valentine" | "mothersday" | "halloween" | "songkran" | undefined;

export interface LoginBg {
  key: string;     // ชื่อไฟล์ไม่มีนามสกุล — ใช้เป็นค่าที่บันทึก
  label: string;
  src: string;
  set?: LoginBgSet;
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
  .map((b, i) => ({
    ...b,
    label: LABELS[b.key] ?? `แบบที่ ${i + 1}`,
    set: detectSet(b.key),
  }));

/** ภาพในชุดที่ระบุ — ใช้สร้างตัวเลือกในหน้าตั้งค่าตามธีมที่เลือกอยู่ */
export const loginBackgroundsOf = (set: LoginBgSet) =>
  LOGIN_BACKGROUNDS.filter(b => b.set === set);

/** ภาพตัวแรกของชุด — undefined ถ้าชุดนั้นยังไม่มีไฟล์ใน assets */
export const defaultLoginBgOf = (set: LoginBgSet): string | undefined =>
  loginBackgroundsOf(set)[0]?.key;

export const DEFAULT_LOGIN_BG = defaultLoginBgOf(undefined) ?? DEFAULT_KEY;

/** ภาพนี้อยู่ในชุดไหน */
export const loginBgSet = (key: string): LoginBgSet =>
  LOGIN_BACKGROUNDS.find(b => b.key === key)?.set;

/** ค่า CSS background ของหน้าล็อกอิน
    ใส่เครื่องหมายคำพูดใน url() ด้วย — ชื่อไฟล์บางอันมีเว้นวรรค */
export const loginBgCss = (key: string): string => {
  const bg = LOGIN_BACKGROUNDS.find(b => b.key === key) ?? LOGIN_BACKGROUNDS[0];
  return bg ? `url("${bg.src}") center / cover no-repeat` : "";
};
