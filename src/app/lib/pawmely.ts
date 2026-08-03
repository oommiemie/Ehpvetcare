/**
 * ส่งข้อมูลสัตว์เลี้ยงจาก EHP VetCare → Pawmely
 *
 * ไฟล์นี้คือ "สัญญาข้อมูล" ล้วน ๆ — ประกอบ payload + ยิง HTTP
 * ส่วนคิว/สถานะ/รีทราย อยู่ที่ contexts/PawmelyContext.tsx
 *
 * ⚠️ ยังไม่มีสเปก API จริงของ Pawmely
 * โครง payload ด้านล่างตั้งตามข้อมูลที่ Pawmely ต้องแสดง (ข้อมูลทั่วไป ·
 * ประวัติสัตว์ · ประวัติวัคซีน) พอได้สเปกจริงมาแล้วให้แก้ 2 จุดเท่านั้น:
 *   1. ชื่อฟิลด์ใน PawmelyPetPayload + ตัวประกอบ buildPetPayload()
 *   2. path/หัวข้อ auth ใน pushPet()
 * ที่เหลือ (จุดเรียก · คิว · สถานะบนหน้าจอ) ไม่ต้องแตะ
 *
 * ไม่ตั้ง VITE_PAWMELY_BASE = ยังไม่ได้ต่อ — ระบบจะเข้าคิวไว้เฉย ๆ ไม่ยิงออก
 * (ดู isPawmelyConfigured)
 */
import type { Pet, Owner } from "../data/animals/types";

export const PAWMELY_BASE = import.meta.env.VITE_PAWMELY_BASE ?? "";
const PAWMELY_KEY = import.meta.env.VITE_PAWMELY_KEY ?? "";

/** ต่อ API จริงแล้วหรือยัง — ยังไม่ต่อก็เข้าคิวรอไว้ ไม่ถือว่าพัง */
export const isPawmelyConfigured = () => !!PAWMELY_BASE;

/* ── รูปแบบข้อมูลที่ส่งออก ────────────────────────────────────── */

export interface PawmelyVaccine {
  name: string;
  date: string;       // ISO หรือ พ.ศ. ตามที่บันทึกไว้
  nextDue: string;
  batch: string;
}

export interface PawmelyVisit {
  date: string;
  time: string;
  type: string;
  weightKg: number | null;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  vet: string;
  notes: string;
}

export interface PawmelySurgery {
  name: string;
  date: string;
  vet: string;
  notes: string;
}

export interface PawmelyPetPayload {
  /** ระบบต้นทาง — Pawmely อาจรับข้อมูลจากหลายคลินิก */
  source: "ehp-vetcare";
  /** HN = คีย์จับคู่สัตว์ตัวเดียวกันระหว่างสองระบบ (ไม่ใช้ id ที่รันในเครื่อง) */
  hn: string;
  syncedAt: string;

  /* ── ข้อมูลทั่วไปของสัตว์ ── */
  profile: {
    name: string;
    nameEn: string;
    species: string;
    breed: string;
    gender: string;
    color: string;
    /** ข้อความอายุแบบที่ EHP แสดง เช่น "29 วัน" / "2 ปี 3 เดือน" */
    age: string;
    /** วันเกิดโดยประมาณ ถอดจากข้อความอายุ — EHP ไม่ได้เก็บวันเกิดจริง (ดู birthDateFromAge) */
    birthDate: string | null;
    weightKg: number | null;
    sterilized: boolean;
    microchip: string;
    photo: string | null;
  };

  owner: { name: string; phone: string };

  /* ── ประวัติสัตว์ ── */
  medical: { allergies: string; chronic: string };
  vaccines: PawmelyVaccine[];
  visits: PawmelyVisit[];
  surgeries: PawmelySurgery[];

  /**
   * ประวัติอาบน้ำ/ตัดขน · ฝากเลี้ยง — ⚠️ ยังส่งไม่ได้ ยังไม่ใส่ในก้อนข้อมูล
   *
   * ต่างจากส่วนอื่นตรงที่ไม่ได้เกาะอยู่กับ Pet: ตอนนี้เก็บเป็น useState
   * ภายในหน้า Grooming.tsx / Boarding.tsx (mockRecords) ข้างนอกอ่านไม่ถึง
   *
   * ต่อให้ครบต้องทำ 2 ขั้น
   *   1. ยกสองก้อนนั้นออกมาเป็น context เหมือน PetsContext
   *   2. ใส่พารามิเตอร์รับเข้ามาที่ buildPetPayload() แล้ว map ลงช่องนี้
   * ส่วนคิว · จุดเรียก · สถานะบนหน้าจอ ใช้ของเดิมได้เลย ไม่ต้องแก้
   */
  grooming?: Array<{ date: string; services: string[]; staff: string; notes: string }>;
  boarding?: Array<{ checkIn: string; checkOut: string; room: string; notes: string }>;
}

/* ── ตัวแปลงหน่วย ─────────────────────────────────────────────── */

/** "12.5 กก." · "12.5" · "" → 12.5 | null — EHP เก็บน้ำหนักเป็นข้อความที่มีหน่วยติดมา */
export function weightToKg(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseFloat(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * ถอดวันเกิดโดยประมาณจากข้อความอายุ เช่น "29 วัน" · "2 ปี 3 เดือน"
 *
 * ทำไมต้องเดา: EHP เก็บอายุเป็น "ข้อความสำหรับแสดงผล" ไม่ได้เก็บวันเกิดจริง
 * แต่ Pawmely มีช่องวันเกิดให้แสดง (ตอนนี้จึงว่างอยู่)
 * ค่าที่ได้เป็นค่าประมาณจากวันที่ซิงก์ ถ้าภายหลัง EHP เพิ่มฟิลด์วันเกิดจริง
 * ให้เลิกใช้ฟังก์ชันนี้แล้วส่งค่าจริงแทน
 */
export function birthDateFromAge(age: string | undefined, now = new Date()): string | null {
  if (!age) return null;
  const years  = Number(age.match(/(\d+)\s*ปี/)?.[1]   ?? 0);
  const months = Number(age.match(/(\d+)\s*เดือน/)?.[1] ?? 0);
  const days   = Number(age.match(/(\d+)\s*วัน/)?.[1]   ?? 0);
  if (!years && !months && !days) return null;
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - months);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/* ── ประกอบ payload ───────────────────────────────────────────── */

/** แปลงสัตว์ 1 ตัวใน EHP เป็นก้อนข้อมูลที่ Pawmely ต้องใช้แสดงผลครบทุกส่วน */
export function buildPetPayload(pet: Pet, owner?: Owner): PawmelyPetPayload {
  /* ค่าว่างใน EHP ใช้ "-" กับ "—" ปนกัน — ล้างให้เหลือสตริงว่างก่อนส่ง
     ไม่งั้น Pawmely จะไปแสดงขีดกลางเป็นเนื้อหาจริง */
  const clean = (v: string | undefined) => {
    const s = (v ?? "").trim();
    return s === "-" || s === "—" ? "" : s;
  };

  return {
    source: "ehp-vetcare",
    hn: pet.hn,
    syncedAt: new Date().toISOString(),

    profile: {
      name: clean(pet.name),
      nameEn: clean(pet.nameEn),
      species: clean(pet.species),
      breed: clean(pet.breed),
      gender: clean(pet.gender),
      color: clean(pet.color),
      age: clean(pet.age),
      birthDate: birthDateFromAge(pet.age),
      weightKg: weightToKg(pet.weight),
      sterilized: !!pet.sterilized,
      microchip: clean(pet.microchip),
      photo: pet.image ?? null,
    },

    owner: {
      name: clean(owner?.name ?? pet.owner),
      phone: clean(owner?.phone ?? pet.ownerPhone),
    },

    medical: {
      allergies: clean(pet.allergies),
      chronic: clean(pet.chronic),
    },

    vaccines: (pet.vaccines ?? []).map(v => ({
      name: clean(v.name), date: clean(v.date),
      nextDue: clean(v.nextDue), batch: clean(v.batch),
    })),

    visits: (pet.visitHistory ?? []).map(v => ({
      date: clean(v.date), time: clean(v.time), type: clean(v.type),
      weightKg: weightToKg(v.weight),
      chiefComplaint: clean(v.chiefComplaint),
      diagnosis: clean(v.diagnosis),
      treatment: clean(v.treatment),
      medications: v.medications ?? [],
      vet: clean(v.vet), notes: clean(v.notes),
    })),

    surgeries: (pet.surgeries ?? []).map(s => ({
      name: clean(s.name), date: clean(s.date),
      vet: clean(s.vet), notes: clean(s.notes),
    })),
  };
}

/* ── ยิงออก ───────────────────────────────────────────────────── */

/** ส่งข้อมูลสัตว์ 1 ตัวขึ้น Pawmely — โยน error ถ้าไม่สำเร็จ (ให้คิวจับไปรีทราย) */
export async function pushPet(payload: PawmelyPetPayload): Promise<void> {
  if (!isPawmelyConfigured()) throw new Error("ยังไม่ได้ตั้งค่า VITE_PAWMELY_BASE");

  const res = await fetch(`${PAWMELY_BASE}/pets/${encodeURIComponent(payload.hn)}`, {
    method: "PUT",   // upsert ด้วย HN — ส่งซ้ำตัวเดิมต้องทับ ไม่ใช่สร้างใหม่
    headers: {
      "Content-Type": "application/json",
      ...(PAWMELY_KEY ? { Authorization: `Bearer ${PAWMELY_KEY}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Pawmely ตอบกลับ ${res.status} ${res.statusText}`);
}

/* ── คำเชิญลงทะเบียนผ่าน QR ──────────────────────────────────────
   ให้เจ้าของสัตว์สแกนที่เคาน์เตอร์แล้วลงทะเบียนแอป Pawmely ได้เลย
   ไม่ต้องพิมพ์ชื่อ/เบอร์/ข้อมูลสัตว์ซ้ำ — ดึงจากที่บันทึกไว้ใน EHP ทั้งหมด

   หมดอายุใน 10 นาที: QR ใบนี้พาเข้าถึงข้อมูลส่วนตัวของเจ้าของได้
   ถ้าไม่มีวันหมดอายุ ภาพที่ถูกถ่ายเก็บไว้จะใช้ได้ตลอดไป
   เวลาหมดอายุติดไปกับตัว payload ด้วย ฝั่ง Pawmely จึงตรวจซ้ำได้เอง
   ไม่ใช่แค่ซ่อนบนหน้าจอเรา (ซึ่งกันคนที่ถ่ายรูป QR ไว้ไม่ได้)
   ────────────────────────────────────────────────────────────── */

/** อายุของ QR ลงทะเบียน — 10 นาที */
export const INVITE_TTL_MS = 10 * 60 * 1000;

const INVITE_BASE = import.meta.env.VITE_PAWMELY_INVITE_URL ?? "https://pawmely.app/register";

export interface PawmelyInvite {
  v: 1;
  source: "ehp-vetcare";
  owner: { ref: string; name: string; phone: string; email: string; lineId: string };
  /** สัตว์ในความดูแล — ให้แอปดึงไปสร้างโปรไฟล์ให้ล่วงหน้า */
  pets: Array<{ hn: string; name: string; species: string; breed: string }>;
  iat: number;   // เวลาที่ออก (ms)
  exp: number;   // เวลาหมดอายุ (ms)
}

/** base64url ที่รองรับภาษาไทย — btoa รับได้แค่ Latin-1 ต้องแปลงเป็น UTF-8 ก่อน */
const b64url = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export function buildInvite(
  owner: { id: number; name: string; phone: string; email: string; lineId: string },
  pets: Pet[],
  now = Date.now(),
): PawmelyInvite {
  const clean = (v: string | undefined) => {
    const s = (v ?? "").trim();
    return s === "-" || s === "—" ? "" : s;
  };
  return {
    v: 1,
    source: "ehp-vetcare",
    owner: {
      ref: `EHP-O${owner.id}`,
      name: clean(owner.name), phone: clean(owner.phone),
      email: clean(owner.email), lineId: clean(owner.lineId),
    },
    pets: pets.map(p => ({
      hn: p.hn, name: clean(p.name),
      species: clean(p.species), breed: clean(p.breed),
    })),
    iat: now,
    exp: now + INVITE_TTL_MS,
  };
}

/** ลิงก์ที่ฝังใน QR — สแกนด้วยกล้องมือถือธรรมดาก็เปิดหน้าลงทะเบียนได้ ไม่ต้องเปิดแอปก่อน */
export const inviteUrl = (invite: PawmelyInvite) =>
  `${INVITE_BASE}?d=${b64url(JSON.stringify(invite))}`;
