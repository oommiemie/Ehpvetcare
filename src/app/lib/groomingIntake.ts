/* ─────────────────────────────────────────────────────────────
   สัตว์ที่ถูกส่งเข้าทะเบียนอาบน้ำตัดขนจากหน้าอื่น

   ตอนลงทะเบียนสัตว์ใหม่ ถ้าติ๊ก "อาบน้ำตัดขน" ไว้ ต้องเห็นชื่อน้อง
   โผล่ในทะเบียนอาบน้ำทันที แต่หน้าอาบน้ำเก็บรายการไว้ใน state ของ
   ตัวเอง ซึ่งหายทุกครั้งที่เปลี่ยนหน้า — เขียนตรง ๆ จากหน้าสัตว์เลี้ยง
   จึงไม่ได้ ที่พักไว้ตรงนี้เลยทำหน้าที่เป็นตัวกลางส่งของข้ามหน้า

   เก็บลง localStorage เพราะรายการที่ส่งเข้ามาต้องอยู่ข้ามการรีเฟรช
   เหมือนรายการอื่นในทะเบียน ไม่ใช่หายไปเพราะเผลอกด F5
   ───────────────────────────────────────────────────────────── */

const KEY = "ehp_groom_intake_v1";

export type GroomStatus = "เสร็จสิ้น" | "กำลังดำเนินการ" | "รออนุมัติ" | "รอรับบริการ";

/** โครงเดียวกับ GroomRecord ในหน้าอาบน้ำตัดขน เฉพาะฟิลด์ที่ต้องมีตอนสร้าง */
export interface GroomIntake {
  id: number;
  hn: string;
  pet: string;
  breed: string;
  owner: string;
  phone: string;
  animal: string;
  photo: string;
  date: string;
  groomer: string;
  services: string[];
  style: string;
  length: string;
  size: string;
  difficulty: string;
  price: number;
  note: string;
  status: GroomStatus;
  nextAppt: string;
  sex?: "ผู้" | "เมีย";
}

export function listIntake(): GroomIntake[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list: GroomIntake[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* โควตาเต็มหรือปิด storage — ไม่ควรทำให้การบันทึกสัตว์ล้มไปด้วย */ }
}

/** ส่งเข้าคิว — ของใหม่อยู่บนสุดให้เห็นก่อน เหมือนที่ทะเบียนเรียงอยู่ */
export function addIntake(rec: GroomIntake) {
  write([rec, ...listIntake()]);
}

/** แก้ไขรายการที่ส่งเข้ามา — เงียบถ้าไม่ใช่รายการในคิว (เป็นข้อมูลตั้งต้นของหน้า) */
export function updateIntake(rec: GroomIntake) {
  const list = listIntake();
  if (!list.some(r => r.id === rec.id)) return;
  write(list.map(r => (r.id === rec.id ? rec : r)));
}

export function removeIntake(id: number) {
  const list = listIntake();
  if (!list.some(r => r.id === id)) return;
  write(list.filter(r => r.id !== id));
}

/* ── ตัวช่วยแปลงข้อมูลสัตว์ → รายการอาบน้ำตัดขน ── */

const SPECIES_EMOJI: Record<string, string> = {
  "สุนัข": "🐕", "แมว": "🐈", "นก": "🐦", "กระต่าย": "🐇",
  "หนู": "🐹", "ปลา": "🐠", "สัตว์เลื้อยคลาน": "🦎",
};

/** ขนาดตัวเดาจากน้ำหนัก — เลือกไว้ให้ก่อน พนักงานแก้ทีหลังได้ในหน้าอาบน้ำ */
function sizeFromWeight(weight: string): string {
  const kg = parseFloat(String(weight).replace(/[^\d.]/g, ""));
  if (!kg || isNaN(kg)) return "กลาง (10–20 กก.)";
  if (kg < 10) return "เล็ก (< 10 กก.)";
  if (kg <= 20) return "กลาง (10–20 กก.)";
  if (kg <= 35) return "ใหญ่ (20–35 กก.)";
  return "ใหญ่มาก (> 35 กก.)";
}

const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** วันนี้เป็นสตริงไทย พ.ศ. — ทะเบียนอาบน้ำเก็บวันที่เป็นรูปแบบนี้ */
export function groomToday(now = new Date()): string {
  return `${now.getDate()} ${THAI_MONTHS_SHORT[now.getMonth()]} ${now.getFullYear() + 543}`;
}

/**
 * สร้างรายการอาบน้ำตัดขนจากข้อมูลสัตว์ที่เพิ่งลงทะเบียน
 *
 * กรอกค่าตั้งต้นให้พอเปิดงานได้เลย (บริการพื้นฐาน ราคาเริ่มต้น) ไม่บังคับ
 * ให้กรอกครบตั้งแต่ตอนลงทะเบียน เพราะรายละเอียดจริงจะรู้ตอนน้องมาถึงร้าน
 */
export function intakeFromPet(pet: {
  id: number; hn: string; name: string; species: string; breed: string;
  weight: string; owner: string; ownerPhone: string; image?: string | null; gender?: string;
}): GroomIntake {
  return {
    id: pet.id,
    hn: pet.hn,
    pet: pet.name,
    breed: pet.breed && pet.breed !== "-" ? pet.breed : pet.species,
    owner: pet.owner,
    phone: pet.ownerPhone,
    animal: SPECIES_EMOJI[pet.species] ?? "🐾",
    photo: pet.image ?? "",
    date: groomToday(),
    groomer: "—",
    services: ["อาบน้ำพื้นฐาน"],
    style: "—",
    length: "—",
    size: sizeFromWeight(pet.weight),
    difficulty: "ปกติ",
    price: 200,
    note: "",
    status: "รอรับบริการ",
    nextAppt: "—",
    sex: /เมีย|ผู้เมีย|female|f/i.test(pet.gender ?? "") ? "เมีย" : "ผู้",
  };
}
