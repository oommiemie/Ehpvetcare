/* ──────────────────────────────────────────────────────────────────────────
 * Runtime seeder — เขียน mock ลง localStorage รายผู้ป่วย IPD "ครั้งเดียว"
 * แท็บ IPD (Diet / Surgery / Procedures / Discharge / Deworming) อ่านข้อมูล
 * จาก localStorage รายผู้ป่วย ซึ่งว่างเปล่าจนกว่าจะกรอกเอง — ไฟล์นี้ seed
 * ตัวอย่างให้เห็นผลทันที โดยไม่ทับข้อมูลที่ผู้ใช้กรอกไว้แล้ว
 *   guard: localStorage["ehp_seed_runtime_v1"] — ถ้ามีแล้ว return ทันที
 * ────────────────────────────────────────────────────────────────────────── */

import type { SurgeryRecord } from "../components/SurgeryRecordTab";
import type { DewormingRecord } from "../components/DewormingTab";

const SEED_KEY = "ehp_seed_runtime_v1";

/* ── shape ที่แต่ละแท็บคาดหวัง (mirror interface ภายใน component ที่ไม่ได้ export) ── */
interface DchInfo {
  dchDate: string; dchTime: string; dchVet: string;
  dchType: string; dchOther: string; dchStatus: string;
  refer?: null; death?: null;
}
interface Procedure {
  id: string; name: string; category: string; bodyArea: string;
  price: number; date: string; startTime: string; endTime: string;
  durationMin: number; vet: string; note?: string; createdAt: string;
}
interface DietPlan {
  id: string; species: string; date?: string; dateEnd?: string;
  foodName: string; foodType: string; meals: string[]; amount?: string; note?: string;
}

/* เขียนเฉพาะเมื่อ key ยังว่าง — กันไม่ให้ทับข้อมูลผู้ใช้ (ชั้นกันซ้ำเพิ่มเติมจาก SEED_KEY) */
function put(key: string, value: unknown): void {
  try {
    if (localStorage.getItem(key) == null) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch { /* quota / private mode — ข้าม */ }
}

export function seedRuntimeOnce(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (localStorage.getItem(SEED_KEY)) return;
  } catch {
    return; // localStorage เข้าถึงไม่ได้ (private mode ฯลฯ)
  }

  const NOW = new Date().toISOString();

  /* ═══════════ 1) Discharge — vet-ipd-dch-${admitId} (ผู้ป่วยที่จำหน่ายแล้ว) ═══════════ */
  const discharges: Record<number, DchInfo> = {
    // 12 = มิลค์ (หนู/แฮมสเตอร์) จำหน่าย 11 มิ.ย. 2569
    12: { dchDate: "2026-06-11", dchTime: "15:30", dchVet: "พญ. ณัฐสุดา ทองพูล", dchType: "With Approval", dchOther: "", dchStatus: "Complete Recovery — หาย" },
    // 13 = ทวีป (นก/ค็อกคาเทล HN-2026-022) จำหน่าย 22 มิ.ย. 2569
    13: { dchDate: "2026-06-22", dchTime: "14:00", dchVet: "พญ. ณัฐสุดา ทองพูล", dchType: "With Approval", dchOther: "", dchStatus: "Improved — ทุเลา / ดีขึ้น" },
    // 14 = เบลล่า (สุนัข HN-2026-004, ผ่าคลอด) จำหน่าย 27 มิ.ย. 2569
    14: { dchDate: "2026-06-27", dchTime: "11:30", dchVet: "สพ.ว. วรรณา ใจดี", dchType: "With Approval", dchOther: "", dchStatus: "Improved — ทุเลา / ดีขึ้น" },
  };
  for (const [id, info] of Object.entries(discharges)) put(`vet-ipd-dch-${id}`, info);

  /* ═══════════ 2) Surgery — vet-ipd-surgery-${admitId} (array) ═══════════ */
  // 7 = ไทเกอร์ (สุนัข) — พักฟื้นหลังผ่าตัดดามกระดูกต้นขาหักจากอุบัติเหตุ
  const surgery7: SurgeryRecord = {
    id: "seed-s-7-1",
    createdAt: "2026-07-01T19:15:00.000Z",
    diagnosis: "กระดูกต้นขาหักแบบปิดกลางลำ (Closed mid-shaft femoral fracture) ขาหลังขวา จากอุบัติเหตุรถชน",
    procedure: "ORIF — ผ่าตัดจัดกระดูกและยึดตรึงด้วยแผ่นเพลทและสกรู (Femur plate & screws)",
    date: "2026-07-01",
    startTime: "16:45",
    endTime: "18:55",
    isEmergency: true,
    surgeon: "นพ. ปราโมทย์ วงศ์เพียร — Orthopedics",
    anesthetist: "สพ.ว. สุภา มีสุข",
    anesthesiaStart: "16:20",
    anesthesiaEnd: "19:10",
    scrubNurse: "พว. ศุภวัชญ์ ทองแท้",
    asaStatus: "III",
    anesthesiaDrugs: [
      { id: "a-7-1", name: "Methadone", stage: "Premed", dose: "0.3 mg/kg", route: "IM" },
      { id: "a-7-2", name: "Propofol", stage: "Induction", dose: "5 mg/kg", route: "IV" },
      { id: "a-7-3", name: "Isoflurane", stage: "Maintenance", dose: "1.5–2%", route: "INH" },
      { id: "a-7-4", name: "Bupivacaine", stage: "Maintenance", dose: "1 mg/kg (epidural)", route: "Topical" },
    ],
    intraopFindings: "กระดูกต้นขาหักเฉียงกลางลำ มีเศษกระดูกย่อย 2 ชิ้น เนื้อเยื่อรอบข้างบวมช้ำแต่ยังมีเลือดมาเลี้ยงดี ไม่มีการปนเปื้อนเปิดสู่ภายนอก",
    surgicalSteps: "1. เปิดแผลด้าน lateral ของต้นขา แยกกล้ามเนื้อ vastus lateralis\n2. จัดเรียงเศษกระดูกเข้าที่ (reduction) ยึดชั่วคราวด้วย K-wire\n3. ดามด้วยแผ่นเพลท 3.5 mm ยึดสกรู 6 ตัว (proximal 3 · distal 3)\n4. ตรวจความมั่นคง ล้างแผลด้วย NSS เย็บปิดเป็นชั้น",
    complications: "ไม่มีภาวะแทรกซ้อนระหว่างผ่าตัด สัญญาณชีพคงที่ตลอด",
    outcome: "ผ่าตัดสำเร็จด้วยดี จัดกระดูกเข้าที่และยึดตรึงมั่นคง ฟื้นจากยาสลบเรียบร้อย ขยับนิ้วเท้าได้",
    postOpPlan: "เฝ้าระวังใน Ward 48 ชม. · ประคบเย็นลดบวม · จำกัดการเคลื่อนไหวในกรง · ถ่ายภาพรังสีติดตาม 2 และ 6 สัปดาห์ · เริ่มกายภาพเบาหลัง 3 วัน",
    postOpMeds: [
      { id: "pm-7-1", name: "Carprofen (Rimadyl)", dose: "4 mg/kg", frequency: "q24h", route: "PO" },
      { id: "pm-7-2", name: "Amoxicillin/Clavulanate (Synulox)", dose: "12.5 mg/kg", frequency: "q12h", route: "PO" },
      { id: "pm-7-3", name: "Gabapentin", dose: "10 mg/kg", frequency: "q8h", route: "PO" },
    ],
    ownerInstructions: "จำกัดการเคลื่อนไหวเข้มงวด 6 สัปดาห์ · ใส่ปลอกคอกันเลียแผล · ห้ามกระโดด/ขึ้นลงบันได · สังเกตแผลบวมแดง/มีหนอง · มาตามนัดถ่ายภาพรังสีและตัดไหม 10–14 วัน",
  };
  put("vet-ipd-surgery-7", [surgery7]);

  /* ═══════════ 3) Procedures — vet-ipd-procedures-${admitId} (array) ═══════════ */
  const procedures: Record<number, Procedure[]> = {
    // 5 = ชาร์ลี (สุนัข) ผิวหนังอักเสบติดเชื้อ — อาบน้ำยา
    5: [{
      id: "seed-proc-5-1", name: "อาบน้ำยา (Medicated bath)", category: "ผิวหนัง/แผล",
      bodyArea: "ผิวหนัง (ทั่วไป)", price: 400, date: "2026-07-08",
      startTime: "09:00", endTime: "09:30", durationMin: 30, vet: "นพ. ธีรวัฒน์ คงเดช",
      note: "อาบน้ำยา Chlorhexidine + Miconazole ทั่วตัว เช็ดแห้ง ทำวันเว้นวัน", createdAt: NOW,
    }],
    // 7 = ไทเกอร์ (สุนัข) post-op — เปลี่ยนผ้าพันแผล
    7: [{
      id: "seed-proc-7-1", name: "ทำแผล / เปลี่ยนผ้าพันแผลหลังผ่าตัด", category: "ผิวหนัง/แผล",
      bodyArea: "ผิวหนัง (ทั่วไป)", price: 250, date: "2026-07-08",
      startTime: "10:00", endTime: "10:20", durationMin: 20, vet: "นพ. ปราโมทย์ วงศ์เพียร",
      note: "เปลี่ยนผ้าพันแผลแผลผ่าตัด ORIF ขาหลังขวา แผลสะอาดดี ไม่มี discharge ขอบแผลติดดี", createdAt: NOW,
    }],
    // 11 = ป๊อบ (สุนัข) ปอดอักเสบ — พ่นยา
    11: [{
      id: "seed-proc-11-1", name: "พ่นยา (Nebulization)", category: "ระบบหายใจ",
      bodyArea: "ทางเดินหายใจ", price: 300, date: "2026-07-08",
      startTime: "08:00", endTime: "08:20", durationMin: 20, vet: "นพ. ธีรวัฒน์ คงเดช",
      note: "พ่นยาขยายหลอดลม + น้ำเกลือ 0.9% ตามด้วย coupage ทำวันละ 2–3 ครั้ง", createdAt: NOW,
    }],
  };
  for (const [id, list] of Object.entries(procedures)) put(`vet-ipd-procedures-${id}`, list);

  /* ═══════════ 4) Diet — vet-ipd-diet-${admitId} (array) ═══════════ */
  const diets: Record<number, DietPlan[]> = {
    // 6 = แม็กซ์ (สุนัข) ค่าไตสูง — อาหารโรคไต
    6: [{
      id: "seed-dp-6-1", species: "สุนัข", date: "2026-07-02", dateEnd: "2026-07-08",
      foodName: "Royal Canin Renal / Hill's k/d (อาหารโรคไต)", foodType: "อาหารโรค",
      meals: ["เช้า", "เย็น"], amount: "150 g/มื้อ",
      note: "โปรตีนคุณภาพสูงปริมาณจำกัด · ฟอสฟอรัสต่ำ · กระตุ้นการดื่มน้ำ เพิ่มน้ำในอาหารเปียก",
    }],
    // 8 = ลูน่า (แมว) ความดันสูงวิกฤต — อาหารหัวใจ/ลดโซเดียม
    8: [{
      id: "seed-dp-8-1", species: "แมว", date: "2026-07-05", dateEnd: "2026-07-08",
      foodName: "Royal Canin Early Cardiac / อาหารโซเดียมต่ำ", foodType: "อาหารโรค",
      meals: ["เช้า", "กลางวัน", "เย็น"], amount: "50 g/มื้อ",
      note: "ลดโซเดียมสำหรับโรคหัวใจ/ความดันสูง · เสริม Taurine + Omega-3 · แบ่งมื้อเล็กบ่อยครั้ง",
    }],
    // 9 = เร็กซ์ (สัตว์เลื้อยคลาน/เบียร์ดดราก้อน) MBD — เสริมแคลเซียม
    9: [{
      id: "seed-dp-9-1", species: "อื่นๆ", date: "2026-07-03", dateEnd: "2026-07-08",
      foodName: "ผักใบเขียว + แมลง โรยแคลเซียม (Calcium+D3 dusting)", foodType: "อาหารสูตรพิเศษ",
      meals: ["เช้า", "ตามต้องการ"], amount: "โรยแคลเซียมทุกมื้อ",
      note: "ภาวะ MBD (แคลเซียมต่ำ) · โรยผงแคลเซียม/วิตามิน D3 ทุกมื้อ · ฉาย UVB สม่ำเสมอ · ผักคะน้า/ผักโขม/ดอกไม้กินได้",
    }],
  };
  for (const [id, list] of Object.entries(diets)) put(`vet-ipd-diet-${id}`, list);

  /* ═══════════ 5) Deworming — vet-pet-deworming-${hn} (array, วันที่ในอดีต) ═══════════ */
  const dewormings: Record<string, DewormingRecord[]> = {
    // HN-2026-001 บัดดี้ (สุนัข)
    "HN-2026-001": [
      {
        id: "seed-dw-001-1", date: "2026-04-12", time: "10:30", type: "ทั้งภายในและภายนอก", route: "รับประทาน",
        productName: "Drontal Plus", brand: "Bayer / Elanco", drugRegNo: "1A 123/2560", lotNumber: "DP24-118", expiryDate: "2027-05-31",
        preAssessment: ["สุขภาพปกติ"], preNote: "น้ำหนัก 32 กก.", postEffects: ["ไม่มีอาการผิดปกติ"],
        nextAppointmentDate: "2026-07-12", recordedAt: "2026-04-12T10:35:00.000Z", recordedBy: "สพ.ว. สมชาย รักสัตว์",
      },
      {
        id: "seed-dw-001-2", date: "2026-01-15", time: "09:45", type: "ภายใน", route: "รับประทาน",
        productName: "Endogard", brand: "Virbac", lotNumber: "EG23-204",
        preAssessment: ["สุขภาพปกติ"], postEffects: ["ไม่มีอาการผิดปกติ"],
        nextAppointmentDate: "2026-04-15", recordedAt: "2026-01-15T09:50:00.000Z", recordedBy: "สพ.ว. สุภา มีสุข",
      },
    ],
    // HN-2026-003 แม็กซ์ (สุนัข)
    "HN-2026-003": [
      {
        id: "seed-dw-003-1", date: "2026-05-02", time: "11:00", type: "ภายใน", route: "รับประทาน",
        productName: "Milbemax", brand: "Elanco", lotNumber: "MB25-077",
        preAssessment: ["สุขภาพปกติ"], postEffects: ["ไม่มีอาการผิดปกติ"],
        nextAppointmentDate: "2026-08-02", recordedAt: "2026-05-02T11:05:00.000Z", recordedBy: "สพ.ว. สมชาย รักสัตว์",
      },
      {
        id: "seed-dw-003-2", date: "2026-02-01", time: "10:15", type: "ภายนอก", route: "หยอดหลังคอ",
        productName: "Frontline Plus", brand: "Boehringer Ingelheim", lotNumber: "FL25-330",
        preAssessment: ["สุขภาพปกติ"], postEffects: ["ไม่มีอาการผิดปกติ"],
        nextAppointmentDate: "2026-03-01", recordedAt: "2026-02-01T10:20:00.000Z", recordedBy: "สพ.ว. วรรณา ใจดี",
      },
    ],
    // HN-2026-011 ลูน่า (แมว)
    "HN-2026-011": [
      {
        id: "seed-dw-011-1", date: "2026-03-20", time: "14:20", type: "ทั้งภายในและภายนอก", route: "หยอดหลังคอ",
        productName: "Revolution Plus (Selamectin/Sarolaner)", brand: "Zoetis", lotNumber: "RV25-091", expiryDate: "2027-02-28",
        preAssessment: ["สุขภาพปกติ"], postEffects: ["ไม่มีอาการผิดปกติ"],
        nextAppointmentDate: "2026-06-20", recordedAt: "2026-03-20T14:25:00.000Z", recordedBy: "พญ. ณัฐสุดา ทองพูล",
      },
    ],
    // HN-2026-005 ชาร์ลี (สุนัข)
    "HN-2026-005": [
      {
        id: "seed-dw-005-1", date: "2026-06-01", time: "13:30", type: "ทั้งภายในและภายนอก", route: "หยอดหลังคอ",
        productName: "NexGard Spectra", brand: "Boehringer Ingelheim", lotNumber: "NG25-142",
        preAssessment: ["สุขภาพปกติ", "โรคประจำตัว"], preNote: "มีผิวหนังอักเสบเดิม", postEffects: ["ไม่มีอาการผิดปกติ"],
        nextAppointmentDate: "2026-07-01", recordedAt: "2026-06-01T13:35:00.000Z", recordedBy: "นพ. ธีรวัฒน์ คงเดช",
      },
    ],
  };
  for (const [hn, list] of Object.entries(dewormings)) put(`vet-pet-deworming-${hn}`, list);

  /* ── ปิดท้าย: ตั้ง version key เพื่อไม่ให้ seed ซ้ำ ── */
  try { localStorage.setItem(SEED_KEY, "1"); } catch { /* ignore */ }
}
