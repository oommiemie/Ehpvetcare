import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ─── Types ─── */
export type CageType = "Small" | "Medium" | "Large" | "ICU" | "Isolation" | "Oxygen";
export type CageStatus = "available" | "occupied" | "cleaning" | "maintenance";
export type AdmitSeverity = "Critical" | "Observation" | "Recovering" | "Isolation";

export interface Cage {
  id: string;
  ward: string;
  type: CageType;
  status: CageStatus;
  patientId?: number;
}

/* Ward — โซน/อาคารที่เก็บกรง · เปิด/ปิดใช้งานได้ */
export interface Ward {
  id: string;       // kebab-case slug (e.g. "ward-a")
  name: string;     // display name (e.g. "Ward A — Small")
  enabled: boolean;
}

/* Vital Signs — บันทึกสัญญาณชีพ */
export interface VitalSign {
  id: number;
  admitId: number;
  timestamp: string;     // ISO datetime
  recordedBy: string;
  temp?: string;         // °F (ค่าปกติ 100.5–102.5)
  pulse?: string;        // bpm
  resp?: string;         // rpm
  bpSys?: string;
  bpDia?: string;
  painScore?: number;    // 0-10
  note?: string;
}

/* เวร (Shift) — เช้า / บ่าย / ดึก */
export type ShiftName = "เช้า" | "บ่าย" | "ดึก";

/* Intake/Output — สารน้ำเข้า-ออก */
export interface IntakeOutput {
  id: number;
  admitId: number;
  timestamp: string;       // ISO datetime (วันที่+เวลาที่บันทึก)
  recordedBy: string;      // ผู้บันทึก (จาก login)
  shift?: ShiftName;       // เวร
  intakeType: "Oral" | "IV" | "SC" | "Water" | "Other";
  intakeAmount?: number;   // ml
  fluidRate?: number;      // ml/hr — Fluid / rate (สำหรับ IV) ตามเอกสาร Monitor
  outputType: "Urine" | "Feces" | "Vomit" | "Drain" | "Other";
  outputAmount?: number;   // ml or g
  fecesScore?: number;     // 1-5 — Feces score ตามเอกสาร Monitor
  note?: string;
}

/* Monitor Round — รอบ Monitor รวม (ตามใบ Monitor sheet: vitals + I/O ในรอบเดียว) */
export interface MonitorRound {
  id: number;
  admitId: number;
  timestamp: string;       // วันที่+เวลาของรอบ
  recordedBy: string;      // ผู้บันทึก (จาก login)
  shift?: ShiftName;       // เวร
  /* ── สัญญาณชีพ / Monitor ── */
  painScore?: number;      // 0-4 (Pain score)
  temp?: string;           // °F (Temperature)
  hydration?: string;      // Hydration (ปกติ / 5-7% / 8-10% / >10%)
  crt?: string;            // วินาที (CRT)
  bpSys?: string;          // Blood pressure systolic (mmHg)
  bpDia?: string;          // Blood pressure diastolic (mmHg)
  pulse?: string;          // bpm (Heart rate)
  resp?: string;           // bpm (Respiratory rate)
  oxygen?: string;         // L/min (Oxygen)
  /* ── Intake (เข้า) ── */
  fluidRate?: number;      // ml/hr (Fluid / rate)
  waterIntake?: number;    // ml (water)
  /* ── อาหาร (Feeding) ── */
  food?: string;           // ประเภทอาหาร
  foodAmount?: string;     // ปริมาณ (เช่น 50 ml / 1/4 กระป๋อง)
  feedRoute?: FeedRoute;   // Oral / Syringe Feed / Tube Feed
  intakePct?: number;      // % ที่กินจริง (0-100)
  /* ── Output (ออก) ── */
  uop?: number;            // ml (UOP — ml/kg/hr คำนวณตอนแสดงถ้ามีน้ำหนัก)
  fecesScore?: number;     // 1-5 (Feces score)
  vomit?: number;          // ml (Vomit)
  drain?: number;          // ml (Drain)
  note?: string;
}

/* Nursing Note / SOAP — บันทึกพยาบาล */
export type NursingNoteKind = "Note" | "SOAP";
export interface NursingNote {
  id: number;
  admitId: number;
  timestamp: string;
  recordedBy: string;
  kind: NursingNoteKind;
  subjective?: string;    // SOAP S
  objective?: string;     // SOAP O
  assessment?: string;    // SOAP A
  plan?: string;          // SOAP P
  note?: string;          // plain note
}

/* Wound Care — บันทึกแผล */
export interface WoundRecord {
  id: number;
  admitId: number;
  timestamp: string;
  recordedBy: string;
  location: string;
  size?: string;
  description: string;
  treatment: string;
  photo?: string;
}

/* Feeding — การให้อาหาร */
export type FeedRoute = "Oral" | "Syringe Feed" | "Tube Feed";
export interface FeedingRecord {
  id: number;
  admitId: number;
  timestamp: string;
  recordedBy: string;
  shift?: ShiftName;     // เวร
  food: string;
  amount: string;        // e.g. "50 ml" or "1/4 can"
  route: FeedRoute;
  intakePct?: number;    // % ที่กินจริง (0-100)
  note?: string;
}

/* Lab Order */
export type LabPriority = "STAT" | "Routine";
export type LabStatus = "Ordered" | "Collected" | "Processing" | "Completed" | "Cancelled";
export type LabType = "CBC" | "Blood Chemistry" | "Electrolyte" | "Urinalysis" | "Cytology" | "Culture" | "Other";

export interface LabOrder {
  id: number;
  admitId: number;
  orderedAt: string;
  orderedBy: string;
  labType: LabType;
  customName?: string;
  priority: LabPriority;
  status: LabStatus;
  reason?: string;
  result?: string;
  resultFile?: string;
  completedAt?: string;
  photos?: string[];        // ภาพถ่ายแนบ (สไลด์/ใบผล/ตัวอย่าง)
}

/* Medical Imaging / Imaging */
/* วิธีตรวจ — ตรงกับ key ใน config/imaging.ts (X-ray/Ultrasound/Echo/CT/MRI)
   คงค่าเดิม "Medical Imaging" ไว้ เพราะออร์เดอร์เก่าที่บันทึกแล้วยังใช้ค่านี้ */
export type ImagingType = "Medical Imaging" | "X-ray" | "Ultrasound" | "Echo" | "CT" | "MRI";
export type ImagingStatus = "Ordered" | "Imaging" | "Completed" | "Cancelled";

export interface ImagingOrder {
  id: number;
  admitId: number;
  orderedAt: string;
  /* ไฟล์แนบ: DICOM (.dcm) หรือภาพถ่ายฟิล์ม */
  attachments?: { name: string; url: string; kind: "dicom" | "image" }[];
  orderedBy: string;
  type: ImagingType;
  position: string;       // ชื่อรายการเต็ม (บริเวณ + ท่า + ด้าน + เทคนิค)
  /* มิติที่แยกไว้ — สั่งจากตัวเลือกจะมีครบ ของเก่ามีแค่ position */
  region?: string;
  views?: string[];
  side?: string;
  technique?: string;
  reason: string;
  status: ImagingStatus;
  findings?: string;
  imageUrl?: string;
  completedAt?: string;
}

/* Drug Order + MAR */
export type DrugRoute = "PO" | "IV" | "IM" | "SC" | "Topical" | "Inhalation" | "PR" | "Other";
export type DrugFrequency = "q24h" | "q12h" | "q8h" | "q6h" | "q4h" | "PRN" | "Continuous" | "Once";

export interface DrugOrder {
  id: number;
  admitId: number;
  orderedAt: string;
  orderedBy: string;
  drugName: string;
  strength?: string;       // เช่น "10mg/ml"
  dose: string;            // เช่น "1mg/kg"
  route: DrugRoute;
  frequency: DrugFrequency;
  durationDays?: number;
  isPRN: boolean;
  isContinuous: boolean;
  isControlled?: boolean;
  note?: string;
  active: boolean;
  /* ── เบิก/จ่าย แบบ HOSxP (optional — ออเดอร์เก่าไม่มีได้) ── */
  qtyRequested?: number;   // จำนวนเบิก
  qtyDispensed?: number;   // จำนวนจ่าย (ใช้คิดเงินเมื่อมี pricePerUnit)
  qtyUnit?: string;        // หน่วย เช่น เม็ด / ml / vial
  pricePerUnit?: number;   // ราคา/หน่วย (฿)
  /* ── การจ่ายยาจากหน่วยจ่าย (store room) ── */
  dispenseStoreRoom?: string;                                  // หน่วยจ่าย (ชื่อ store room)
  dispenseStatus?: "pending" | "dispensed" | "cancelled";      // รอจ่าย / รับยาแล้ว(ตัดสต๊อก) / ยกเลิกจ่าย(คืนสต๊อกแล้ว)
  dispensedAt?: string;
  dispensedBy?: string;
  /* ── การคืนยา ── */
  returnedQty?: number;    // จำนวนที่คืนเข้า Stock แล้ว (หักออกจากค่าใช้จ่าย)
  returnedAt?: string;
}

/* MAR — Medication Administration Record */
export interface MARRecord {
  id: number;
  drugOrderId: number;
  scheduledAt: string;     // ISO datetime
  administeredAt?: string;
  administeredBy?: string;
  status: "Pending" | "Administered" | "Missed" | "Held";
  note?: string;
}

/* Billing */
export type BillCategory = "ค่ายา" | "ค่าเวชภัณฑ์" | "ค่าห้อง/กรง" | "ค่าหัตถการ" | "ค่าแพทย์" | "ค่าพยาบาล" | "ค่า Lab" | "ค่า Medical Imaging" | "อื่นๆ";

export interface BillingItem {
  id: number;
  admitId: number;
  date: string;            // ISO date
  category: BillCategory;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;           // qty * unitPrice
  discount?: number;
  recordedBy?: string;     // เจ้าหน้าที่ผู้บันทึกรายการ
  recordedAt?: string;     // ISO datetime ที่บันทึก
}

export interface Payment {
  id: number;
  admitId: number;
  paidAt: string;
  amount: number;
  method: "Cash" | "Card" | "Transfer" | "Deposit" | "Insurance";
  note?: string;
  /* key ของรายการที่ชำระในรอบนี้ (ชำระรายวัน/บางส่วน) — ใช้ติ๊กสถานะ "ชำระแล้ว" ต่อรายการ */
  itemKeys?: string[];
}

/* Admit */
export interface Admit {
  id: number;
  an?: string;             // Admission Number — รันตามปี พ.ศ. เช่น AN-2569-001
  hn: string;
  petName: string;
  species: string;
  breed: string;
  photo?: string;
  owner: string;
  ownerPhone: string;
  cageId: string;
  cageType: CageType;
  severity: AdmitSeverity;
  diagnosis: string;
  provisionalDx?: string;  // วินิจฉัยเบื้องต้น (ก่อนยืนยัน Dx)
  diagnosisCode?: string;  // ICD-10
  admitDate: string;
  admitTime: string;
  doctor: string;
  reason: string;
  belongings: string[];
  treatmentPlan?: string;
  consentSigned?: boolean;
  consentSignedBy?: string;
  consentSignedAt?: string;
  estimatedDays?: number;
  totalCharge: number;
  paid: number;
  deposit?: number;
  vitals?: { temp?: string; pulse?: string; resp?: string; bp?: string; pain?: string };
  hasPendingLab?: boolean;
  hasPendingMed?: boolean;
  /* Cage transfer history */
  cageHistory?: Array<{ fromCage: string; toCage: string; reason: string; movedAt: string }>;
  /* Discharge */
  dischargedAt?: string;
  dischargeSummary?: string;
  takeHomeMeds?: string[];
  followUpDate?: string;
  followUpNote?: string;
  followUpVet?: string;       // ชื่อสัตวแพทย์ (sync ตาราง slot)
  followUpTime?: string;      // "HH:MM"
}

/* ─── Cage layout ─── */
const initialCages: Cage[] = [
  { id: "A-01", ward: "Ward A — Small", type: "Small",  status: "occupied",   patientId: 1 },
  { id: "A-02", ward: "Ward A — Small", type: "Small",  status: "occupied",   patientId: 2 },
  { id: "A-03", ward: "Ward A — Small", type: "Small",  status: "available" },
  { id: "A-04", ward: "Ward A — Small", type: "Small",  status: "cleaning" },
  { id: "A-05", ward: "Ward A — Small", type: "Small",  status: "available" },
  { id: "A-06", ward: "Ward A — Small", type: "Small",  status: "available" },
  { id: "B-01", ward: "Ward B — Medium", type: "Medium", status: "occupied",   patientId: 3 },
  { id: "B-02", ward: "Ward B — Medium", type: "Medium", status: "occupied",   patientId: 4 },
  { id: "B-03", ward: "Ward B — Medium", type: "Medium", status: "available" },
  { id: "B-04", ward: "Ward B — Medium", type: "Medium", status: "occupied",   patientId: 5 },
  { id: "B-05", ward: "Ward B — Medium", type: "Medium", status: "available" },
  { id: "B-06", ward: "Ward B — Medium", type: "Medium", status: "maintenance" },
  { id: "C-01", ward: "Ward C — Large", type: "Large",  status: "occupied",   patientId: 6 },
  { id: "C-02", ward: "Ward C — Large", type: "Large",  status: "available" },
  { id: "C-03", ward: "Ward C — Large", type: "Large",  status: "occupied",   patientId: 7 },
  { id: "C-04", ward: "Ward C — Large", type: "Large",  status: "cleaning" },
  { id: "ICU-1", ward: "Ward ICU",       type: "ICU",   status: "occupied",   patientId: 8 },
  { id: "ICU-2", ward: "Ward ICU",       type: "ICU",   status: "occupied",   patientId: 9 },
  { id: "ICU-3", ward: "Ward ICU",       type: "ICU",   status: "available" },
  { id: "ISO-1", ward: "Ward Isolation", type: "Isolation", status: "occupied", patientId: 10 },
  { id: "ISO-2", ward: "Ward Isolation", type: "Isolation", status: "available" },
  { id: "OX-1",  ward: "Ward Oxygen",    type: "Oxygen",    status: "occupied", patientId: 11 },
  { id: "OX-2",  ward: "Ward Oxygen",    type: "Oxygen",    status: "available" },
];

/* ─── Initial wards ─── */
const initialWards: Ward[] = [
  { id: "ward-a",         name: "Ward A — Small",     enabled: true },
  { id: "ward-b",         name: "Ward B — Medium",    enabled: true },
  { id: "ward-c",         name: "Ward C — Large",     enabled: true },
  { id: "ward-icu",       name: "Ward ICU",           enabled: true },
  { id: "ward-isolation", name: "Ward Isolation",     enabled: true },
  { id: "ward-oxygen",    name: "Ward Oxygen",        enabled: true },
];

/* ─── ตั้งชื่อ Ward ให้สื่อความหมาย (migration ตาม id · เปลี่ยนเฉพาะที่ยังเป็นชื่อ default เดิม) ─── */
const WARD_RENAME: Record<string, { old: string; to: string }> = {
  "ward-a":         { old: "Ward A — Small",  to: "วอร์ดสัตว์ป่วยทั่วไป A — กรงเล็ก" },
  "ward-b":         { old: "Ward B — Medium", to: "วอร์ดสัตว์ป่วยทั่วไป B — กรงกลาง" },
  "ward-c":         { old: "Ward C — Large",  to: "วอร์ดสัตว์ป่วยทั่วไป C — กรงใหญ่" },
  "ward-icu":       { old: "Ward ICU",        to: "วอร์ด ICU — ผู้ป่วยวิกฤต" },
  "ward-isolation": { old: "Ward Isolation",  to: "วอร์ดแยกโรคติดเชื้อ — Isolation" },
  "ward-oxygen":    { old: "Ward Oxygen",     to: "วอร์ดออกซิเจน — Oxygen" },
};
const migrateWardNames = (wards: Ward[], cages: Cage[]): { wards: Ward[]; cages: Cage[] } => {
  let w = wards, c = cages;
  for (const id in WARD_RENAME) {
    const { old, to } = WARD_RENAME[id];
    const target = w.find(x => x.id === id);
    if (target && target.name === old) {
      w = w.map(x => (x.id === id ? { ...x, name: to } : x));
      c = c.map(cg => (cg.ward === old ? { ...cg, ward: to } : cg));
    }
  }
  return { wards: w, cages: c };
};

/* ─── Initial admits ─── */
const initialAdmits: Admit[] = [
  {
    id: 1, an: "AN-2569-064", hn: "HN-2026-012", petName: "โมจิ", species: "แมว", breed: "สก็อตติช โฟลด์",
    photo: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80&auto=format&fit=crop",
    owner: "ประพันธ์ มงคล", ownerPhone: "062-111-2233",
    cageId: "A-01", cageType: "Small", severity: "Observation",
    diagnosis: "Enteritis (ลำไส้อักเสบ)", diagnosisCode: "K52.9",
    admitDate: "2026-07-05", admitTime: "10:30",
    doctor: "สพ.ว. สุภา มีสุข", reason: "ถ่ายเหลว 3 วัน ซึม กินอาหารน้อยลง",
    belongings: ["อาหารประจำ", "ผ้าห่ม/ที่นอน"], totalCharge: 4600, paid: 2000,
    vitals: { temp: "39.0", pulse: "175", resp: "32" },
    hasPendingLab: true, consentSigned: true, estimatedDays: 4,
  },
  {
    id: 2, an: "AN-2569-067", hn: "HN-2026-024", petName: "กีวี่", species: "นก", breed: "เลิฟเบิร์ด",
    photo: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=400&q=80&auto=format&fit=crop",
    owner: "ชลธิชา อินทร์แก้ว", ownerPhone: "095-888-2211",
    cageId: "A-02", cageType: "Small", severity: "Observation",
    diagnosis: "Feather plucking (ถอนขนตัวเอง)", diagnosisCode: "L98.1",
    admitDate: "2026-07-07", admitTime: "09:15",
    doctor: "พญ. ณัฐสุดา ทองพูล", reason: "ถอนขนตัวเองบริเวณอกและใต้ปีก สังเกตพฤติกรรมและหาสาเหตุ",
    belongings: ["ของเล่น", "อาหารเม็ดประจำ"], totalCharge: 2400, paid: 1000,
    vitals: { temp: "41.2", pulse: "340", resp: "62" },
    consentSigned: true, estimatedDays: 3,
  },
  {
    id: 3, an: "AN-2569-060", hn: "HN-2026-001", petName: "บัดดี้", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์",
    photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    cageId: "B-01", cageType: "Medium", severity: "Observation",
    diagnosis: "Acute gastroenteritis", diagnosisCode: "K52.9",
    admitDate: "2026-07-03", admitTime: "11:00",
    doctor: "สพ.ว. สมชาย รักสัตว์", reason: "อาเจียน ท้องเสีย 2 วัน มีภาวะขาดน้ำ — ให้น้ำเกลือ IV",
    belongings: ["อาหารประจำ", "ผ้าห่ม/ที่นอน"], totalCharge: 6800, paid: 3000,
    vitals: { temp: "39.3", pulse: "112", resp: "28" },
    hasPendingLab: true, consentSigned: true, estimatedDays: 4,
  },
  {
    id: 4, an: "AN-2569-065", hn: "HN-2026-042", petName: "โคโค่", species: "กระต่าย", breed: "ฮอลแลนด์ลอป",
    photo: "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=400&q=80&auto=format&fit=crop",
    owner: "อรอนงค์ พรมเสน", ownerPhone: "091-444-5566",
    cageId: "B-02", cageType: "Medium", severity: "Observation",
    diagnosis: "GI stasis", diagnosisCode: "K56.0",
    admitDate: "2026-07-06", admitTime: "14:20",
    doctor: "พญ. ณัฐสุดา ทองพูล", reason: "ไม่กินอาหาร ไม่ถ่ายมูลนานกว่า 24 ชม. ท้องอืด",
    belongings: ["หญ้าทิโมธี", "ผ้ารองกรง"], totalCharge: 3900, paid: 2000,
    vitals: { temp: "38.6", pulse: "245", resp: "48" },
    hasPendingMed: true, consentSigned: true, estimatedDays: 3,
  },
  {
    id: 5, an: "AN-2569-062", hn: "HN-2026-005", petName: "ชาร์ลี", species: "สุนัข", breed: "บีเกิ้ล",
    photo: "https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?w=400&q=80&auto=format&fit=crop",
    owner: "ธีรพล วงศ์สุวรรณ", ownerPhone: "085-777-8899",
    cageId: "B-04", cageType: "Medium", severity: "Recovering",
    diagnosis: "Severe pyoderma / dermatitis", diagnosisCode: "L30.9",
    admitDate: "2026-07-04", admitTime: "13:45",
    doctor: "นพ. ธีรวัฒน์ คงเดช", reason: "ผิวหนังอักเสบรุนแรง คันเกา มีแผลติดเชื้อหลายตำแหน่ง",
    belongings: ["ยาเดิม", "ปลอกคอกันเลีย"], totalCharge: 5200, paid: 5200,
    vitals: { temp: "38.7", pulse: "96", resp: "22" },
    consentSigned: true, estimatedDays: 5,
  },
  {
    id: 6, an: "AN-2569-059", hn: "HN-2026-003", petName: "แม็กซ์", species: "สุนัข", breed: "แบล็ก แลบราดอร์",
    photo: "https://images.unsplash.com/photo-1608138498905-05b5cd816a36?w=400&q=80&auto=format&fit=crop",
    owner: "ประพันธ์ มงคล", ownerPhone: "062-111-2233",
    cageId: "C-01", cageType: "Large", severity: "Observation",
    diagnosis: "CKD Stage 2", diagnosisCode: "N18.2",
    admitDate: "2026-07-02", admitTime: "09:30",
    doctor: "สพ.ว. สมชาย รักสัตว์", reason: "ค่าไตสูงขึ้นจากนัดติดตาม — ให้สารน้ำและปรับยา",
    belongings: ["อาหารสูตรโรคไต", "ยาเดิม"], totalCharge: 8400, paid: 4000,
    vitals: { temp: "38.2", pulse: "88", resp: "20", bp: "150/95" },
    hasPendingMed: true, consentSigned: true, estimatedDays: 6,
  },
  {
    id: 7, an: "AN-2569-058", hn: "HN-2026-010", petName: "ไทเกอร์", species: "สุนัข", breed: "ไทยบางแก้ว",
    photo: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&q=80&auto=format&fit=crop",
    owner: "ปกรณ์ เลิศวิริยะ", ownerPhone: "084-777-1234",
    cageId: "C-03", cageType: "Large", severity: "Recovering",
    diagnosis: "Post-op femoral fracture repair (ขาหลังขวา)", diagnosisCode: "S72.90",
    admitDate: "2026-07-01", admitTime: "16:30",
    doctor: "นพ. ปราโมทย์ วงศ์เพียร", reason: "พักฟื้นหลังผ่าตัดดามกระดูกขาหลังหักจากอุบัติเหตุ",
    belongings: ["ผ้าห่ม/ที่นอน", "อาหารประจำ"], totalCharge: 24500, paid: 15000,
    vitals: { temp: "38.4", pulse: "92", resp: "20", pain: "3" },
    consentSigned: true, estimatedDays: 10,
  },
  {
    id: 8, an: "AN-2569-063", hn: "HN-2026-011", petName: "ลูน่า", species: "แมว", breed: "เปอร์เซีย",
    photo: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&q=80&auto=format&fit=crop",
    owner: "วรรณา ศรีสุข", ownerPhone: "089-876-5432",
    cageId: "ICU-1", cageType: "ICU", severity: "Critical",
    diagnosis: "Hypertensive crisis", diagnosisCode: "I16.9",
    admitDate: "2026-07-05", admitTime: "22:40",
    doctor: "พญ. ศักรา สุขศรี", reason: "ความดันโลหิตสูงวิกฤต รูม่านตาขยาย ต้อง monitor ใกล้ชิดใน ICU",
    belongings: [], totalCharge: 12800, paid: 6000,
    vitals: { temp: "38.9", pulse: "205", resp: "36", bp: "220/130" },
    hasPendingLab: true, hasPendingMed: true, consentSigned: true, estimatedDays: 5,
  },
  {
    id: 9, an: "AN-2569-061", hn: "HN-2026-029", petName: "เร็กซ์", species: "สัตว์เลื้อยคลาน", breed: "เบียร์ดดราก้อน",
    photo: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&q=80&auto=format&fit=crop",
    owner: "ธนากร ชัยชนะ", ownerPhone: "094-882-0033",
    cageId: "ICU-2", cageType: "ICU", severity: "Critical",
    diagnosis: "Severe Metabolic Bone Disease (MBD)", diagnosisCode: "M83.9",
    admitDate: "2026-07-03", admitTime: "15:10",
    doctor: "พญ. ณัฐสุดา ทองพูล", reason: "ขาหลังอ่อนแรง กระดูกขากรรไกรนิ่ม ชักเกร็งจากแคลเซียมต่ำ",
    belongings: ["หลอดไฟ UVB ส่วนตัว"], totalCharge: 9600, paid: 5000,
    vitals: { temp: "36.0", pulse: "72", resp: "18" },
    hasPendingMed: true, consentSigned: true, estimatedDays: 7,
  },
  {
    id: 10, an: "AN-2569-066", hn: "HN-2026-014", petName: "ส้มโอ", species: "แมว", breed: "แมวส้มไทย",
    photo: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80&auto=format&fit=crop",
    owner: "รัตนา จันทร์เพ็ญ", ownerPhone: "086-321-9900",
    cageId: "ISO-1", cageType: "Isolation", severity: "Isolation",
    diagnosis: "Feline panleukopenia", diagnosisCode: "B34.3",
    admitDate: "2026-07-06", admitTime: "08:20",
    doctor: "สพ.ว. สุภา มีสุข", reason: "ไข้สูง อาเจียน เม็ดเลือดขาวต่ำ — แยกโรคติดเชื้อ",
    belongings: [], totalCharge: 7400, paid: 3000,
    vitals: { temp: "40.1", pulse: "190", resp: "40" },
    hasPendingLab: true, consentSigned: true, estimatedDays: 7,
  },
  {
    id: 11, an: "AN-2569-068", hn: "HN-2026-006", petName: "ป๊อบ", species: "สุนัข", breed: "ปอมเมอเรเนียน",
    photo: "https://images.unsplash.com/photo-1703368786305-4e1dcfcfd0db?w=400&q=80&auto=format&fit=crop",
    owner: "วิชัย มงคล", ownerPhone: "083-456-7890",
    cageId: "OX-1", cageType: "Oxygen", severity: "Critical",
    diagnosis: "Pneumonia", diagnosisCode: "J18.9",
    admitDate: "2026-07-07", admitTime: "07:50",
    doctor: "นพ. ธีรวัฒน์ คงเดช", reason: "หายใจลำบาก เหนื่อยง่าย ปอดอักเสบ — ให้ออกซิเจน",
    belongings: ["ผ้าห่ม/ที่นอน"], totalCharge: 8900, paid: 4500,
    vitals: { temp: "39.5", pulse: "132", resp: "46" },
    hasPendingLab: true, hasPendingMed: true, consentSigned: true, estimatedDays: 6,
  },
  /* ─── Discharged admits (มิ.ย. 2569 — สำหรับประวัติ/ค้นหาย้อนหลัง) ─── */
  {
    id: 12, an: "AN-2569-041", hn: "HN-2026-039", petName: "มิลค์", species: "หนู", breed: "แฮมสเตอร์ซีเรียน",
    photo: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=80&auto=format&fit=crop",
    owner: "ศิริพร แก้วมณี", ownerPhone: "083-321-6655",
    cageId: "A-03", cageType: "Small", severity: "Recovering",
    diagnosis: "Overgrown incisors (ฟันหน้ายาวเกิน)",
    admitDate: "2026-06-10", admitTime: "10:00",
    doctor: "พญ. ณัฐสุดา ทองพูล", reason: "กินอาหารไม่ได้ น้ำลายไหล ฟันหน้ายาวผิดปกติ",
    belongings: ["กรงส่วนตัว"], totalCharge: 1800, paid: 1800, consentSigned: true,
    dischargedAt: "2026-06-11T15:30:00",
    dischargeSummary: "กรอฟันหน้าภายใต้ยาสลบระยะสั้น เรียบร้อยดี กลับมากินอาหารได้ปกติ แนะนำของแทะลับฟัน และตรวจฟันซ้ำทุก 6-8 สัปดาห์",
    takeHomeMeds: ["Meloxicam oral drop 3 วัน"],
  },
  {
    id: 13, an: "AN-2569-046", hn: "HN-2026-022", petName: "ทวีป", species: "นก", breed: "ค็อกคาเทล",
    photo: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80&auto=format&fit=crop",
    owner: "นภาพร รุ่งเรือง", ownerPhone: "091-555-7788",
    cageId: "A-05", cageType: "Small", severity: "Recovering",
    diagnosis: "Beak fracture (จะงอยปากหัก)", diagnosisCode: "S02.8",
    admitDate: "2026-06-18", admitTime: "11:40",
    doctor: "พญ. ณัฐสุดา ทองพูล", reason: "บินชนกระจก จะงอยปากบนแตกร้าว กินอาหารเองไม่ได้",
    belongings: ["อาหารเม็ดประจำ"], totalCharge: 5600, paid: 5600, consentSigned: true,
    dischargedAt: "2026-06-22T14:00:00",
    dischargeSummary: "ซ่อมจะงอยปากด้วย dental acrylic และป้อนอาหารเหลวระหว่างพักฟื้น เริ่มจิกกินเองได้ นัดติดตามการงอกของจะงอยปากใน 2 สัปดาห์",
    takeHomeMeds: ["Vitamin supplement ผสมน้ำ 14 วัน"],
  },
  {
    id: 14, an: "AN-2569-052", hn: "HN-2026-004", petName: "เบลล่า", species: "สุนัข", breed: "ปอมเมอเรเนียน",
    photo: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=80&auto=format&fit=crop",
    owner: "ปรียาภรณ์ ทองดี", ownerPhone: "094-321-6543",
    cageId: "C-02", cageType: "Large", severity: "Recovering",
    diagnosis: "Post C-section", diagnosisCode: "O82",
    admitDate: "2026-06-24", admitTime: "08:00",
    doctor: "พญ. ศักรา สุขศรี", reason: "ผ่าคลอดลูก 3 ตัว พักฟื้นและดูแลแผลผ่าตัด",
    belongings: ["ผ้าห่ม/ที่นอน"], totalCharge: 16800, paid: 16800, consentSigned: true,
    dischargedAt: "2026-06-27T11:30:00",
    dischargeSummary: "แผลผ่าตัดแห้งดี ลูกสุนัขแข็งแรงทั้ง 3 ตัว แม่ให้นมได้ปกติ นัดตัดไหม 10 วันหลังผ่าตัด",
    takeHomeMeds: ["Amoxicillin/Clavulanate 7 วัน", "Meloxicam 3 วัน"],
  },
];

/* ─── Initial labs — past results for history demo ─── */
const initialLabs: LabOrder[] = [
  // Annual checkup (admit 100) — 2026-02
  {
    id: 9001, admitId: 6, orderedAt: "2026-02-14T10:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "CBC", priority: "Routine", status: "Completed",
    reason: "ตรวจสุขภาพประจำปี",
    result: "WBC 8.5 (ปกติ), RBC 6.8 (ปกติ), HCT 45% (ปกติ), PLT 280k (ปกติ) — ค่าทุกอย่างอยู่ในเกณฑ์ปกติ",
    completedAt: "2026-02-14T14:00:00",
  },
  {
    id: 9002, admitId: 6, orderedAt: "2026-02-14T10:35:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "Blood Chemistry", priority: "Routine", status: "Completed",
    reason: "ตรวจค่าตับ ไต ประจำปี",
    result: "ALT 42, AST 28, BUN 18, Cre 1.1, ALP 95 — ทุกค่าอยู่ในเกณฑ์ปกติ",
    completedAt: "2026-02-14T15:30:00",
  },
  // GI upset (admit 101) — 2025-11
  {
    id: 9003, admitId: 3, orderedAt: "2025-11-22T15:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    labType: "CBC", priority: "STAT", status: "Completed",
    reason: "สงสัยติดเชื้อ มีไข้",
    result: "WBC 18.2 (สูง) — Leukocytosis with left shift, สงสัยติดเชื้อแบคทีเรีย",
    completedAt: "2025-11-22T17:30:00",
  },
  {
    id: 9004, admitId: 3, orderedAt: "2025-11-23T08:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    labType: "Blood Chemistry", priority: "Routine", status: "Completed",
    reason: "ติดตามค่า electrolyte หลังขาดน้ำ",
    result: "Na 138, K 3.2 (ต่ำ), Cl 108, BUN 28 (สูงเล็กน้อย จากภาวะขาดน้ำ)",
    completedAt: "2025-11-23T11:00:00",
  },
  {
    id: 9005, admitId: 3, orderedAt: "2025-11-23T08:05:00", orderedBy: "สพ.ว. สุภา มีสุข",
    labType: "Urinalysis", priority: "Routine", status: "Completed",
    reason: "ตรวจสีและความเข้มข้นของปัสสาวะ",
    result: "USG 1.045 (เข้มข้น) — สอดคล้องกับภาวะขาดน้ำ, ไม่พบโปรตีน/เม็ดเลือดผิดปกติ",
    completedAt: "2025-11-23T13:00:00",
  },
  // Tick-borne (admit 102) — 2025-08
  {
    id: 9006, admitId: 7, orderedAt: "2025-08-05T10:00:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    labType: "CBC", priority: "STAT", status: "Completed",
    reason: "สงสัย Tick-borne disease",
    result: "PLT 95k (ต่ำมาก) — Thrombocytopenia รุนแรง สงสัย Ehrlichia/Babesia",
    completedAt: "2025-08-05T12:30:00",
  },
  {
    id: 9007, admitId: 7, orderedAt: "2025-08-05T10:05:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    labType: "Cytology", priority: "Routine", status: "Completed",
    reason: "ส่องหา intracellular organism ใน blood smear",
    result: "พบ Ehrlichia morulae ใน monocyte — ยืนยัน Canine Monocytic Ehrlichiosis (CME)",
    completedAt: "2025-08-06T09:00:00",
  },

  /* ─── Current-admit labs (2569 · ผูก admit จริง 1-11 · มีทั้งเสร็จแล้วและรอผล) ─── */
  // id1 โมจิ (แมว · ลำไส้อักเสบ)
  {
    id: 9101, admitId: 1, orderedAt: "2026-07-05T12:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    labType: "CBC", priority: "STAT", status: "Completed",
    reason: "ถ่ายเหลว/ซึม — ประเมินการติดเชื้อและภาวะขาดน้ำ",
    result: "WBC 16.8 (สูง) neutrophilia, HCT 44% (สูงจากภาวะขาดน้ำ), PLT 320k — สอดคล้องลำไส้อักเสบ",
    completedAt: "2026-07-05T14:30:00",
  },
  // id3 บัดดี้ (สุนัข · gastroenteritis)
  {
    id: 9102, admitId: 3, orderedAt: "2026-07-03T12:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "CBC", priority: "STAT", status: "Completed",
    reason: "อาเจียน/ท้องเสีย + ขาดน้ำ",
    result: "WBC 14.2 (สูงเล็กน้อย), HCT 52% (สูง — hemoconcentration), PLT ปกติ — สอดคล้องภาวะขาดน้ำจาก GI",
    completedAt: "2026-07-03T14:30:00",
  },
  {
    id: 9103, admitId: 3, orderedAt: "2026-07-08T08:00:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "Electrolyte", priority: "Routine", status: "Processing",
    reason: "ติดตาม electrolyte ก่อนหยุดสารน้ำ",
  },
  // id10 ส้มโอ (แมว · panleukopenia)
  {
    id: 9104, admitId: 10, orderedAt: "2026-07-06T10:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    labType: "CBC", priority: "STAT", status: "Completed",
    reason: "ไข้สูง อาเจียน — สงสัยไข้หัดแมว",
    result: "WBC 1.8k (ต่ำมาก) — Severe leukopenia (neutropenia) สนับสนุน Feline Panleukopenia",
    completedAt: "2026-07-06T12:00:00",
  },
  // id6 แม็กซ์ (สุนัข · CKD Stage 2)
  {
    id: 9105, admitId: 6, orderedAt: "2026-07-02T11:00:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "Blood Chemistry", priority: "STAT", status: "Completed",
    reason: "Renal panel — ค่าไตสูงจากนัดติดตาม",
    result: "BUN 48 (สูง), Creatinine 2.6 (สูง), Phosphorus 6.8 (สูง), SDMA 25 — CKD Stage 2 (IRIS)",
    completedAt: "2026-07-02T14:00:00",
  },
  {
    id: 9106, admitId: 6, orderedAt: "2026-07-08T07:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "Blood Chemistry", priority: "Routine", status: "Ordered",
    reason: "ตรวจซ้ำค่าไตหลังให้สารน้ำ 6 วัน",
  },
  // id8 ลูน่า (แมว · hypertensive crisis · ICU)
  {
    id: 9107, admitId: 8, orderedAt: "2026-07-06T02:00:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    labType: "Electrolyte", priority: "STAT", status: "Completed",
    reason: "ความดันสูงวิกฤต — ประเมิน electrolyte/หัวใจ",
    result: "Na 148, K 5.4 (สูง), iCa 1.28 · cTnI สูงเล็กน้อย — เฝ้าระวังภาวะหัวใจจากความดันสูง",
    completedAt: "2026-07-06T03:30:00",
  },
  // id5 ชาร์ลี (สุนัข · pyoderma/dermatitis)
  {
    id: 9108, admitId: 5, orderedAt: "2026-07-04T15:00:00", orderedBy: "สพ.ว. วรรณา ใจดี",
    labType: "Cytology", priority: "Routine", status: "Completed",
    reason: "Skin cytology — หาสาเหตุผิวหนังอักเสบ",
    result: "พบ cocci bacteria จำนวนมาก + neutrophils degenerate — bacterial pyoderma; ไม่พบ Malassezia",
    completedAt: "2026-07-04T16:30:00",
  },
  // id9 เร็กซ์ (เบียร์ดดราก้อน · MBD)
  {
    id: 9109, admitId: 9, orderedAt: "2026-07-03T16:30:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    labType: "Blood Chemistry", priority: "STAT", status: "Completed",
    reason: "สงสัย MBD — ตรวจแคลเซียม/ฟอสฟอรัส",
    result: "Total Ca 6.2 mg/dL (ต่ำมาก), Phosphorus 8.5 (สูง), Ca:P ผกผัน — สอดคล้อง MBD รุนแรง",
    completedAt: "2026-07-03T18:00:00",
  },
  // id11 ป๊อบ (สุนัข · pneumonia)
  {
    id: 9110, admitId: 11, orderedAt: "2026-07-07T09:00:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "CBC", priority: "STAT", status: "Completed",
    reason: "หายใจลำบาก — ประเมินการติดเชื้อ",
    result: "WBC 22.5 (สูงมาก) neutrophilia with left shift — สอดคล้อง bacterial pneumonia",
    completedAt: "2026-07-07T10:30:00",
  },
  {
    id: 9111, admitId: 11, orderedAt: "2026-07-07T14:00:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "Culture", priority: "Routine", status: "Processing",
    reason: "เพาะเชื้อจาก tracheal wash — เลือกยาปฏิชีวนะ",
  },
];

/* ─── Initial imaging — past results for history demo ─── */
const initialImagings: ImagingOrder[] = [
  // Annual checkup (admit 100) — 2026-02
  {
    id: 8001, admitId: 6, orderedAt: "2026-02-14T11:00:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    type: "Medical Imaging", position: "Thorax (lateral + VD)",
    reason: "ตรวจสุขภาพประจำปี — สแกนทรวงอก", status: "Completed",
    findings: "ปอดทั้งสองข้างใส ไม่พบจุดผิดปกติ หัวใจขนาดปกติ (VHS 9.5) — ไม่พบความผิดปกติ",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    completedAt: "2026-02-14T13:30:00",
  },
  // GI upset (admit 101) — 2025-11
  {
    id: 8002, admitId: 3, orderedAt: "2025-11-22T16:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    type: "Medical Imaging", position: "Abdomen (lateral + VD)",
    reason: "อาเจียน ท้องเสีย — แยก obstruction vs gastritis", status: "Completed",
    findings: "ลำไส้มี gas-distention เล็กน้อย ไม่พบ foreign body หรือ obstruction — สอดคล้องกับ acute gastroenteritis",
    imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    completedAt: "2025-11-22T17:00:00",
  },
  {
    id: 8003, admitId: 3, orderedAt: "2025-11-23T10:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    type: "Ultrasound", position: "Abdomen — Liver, GB, GI",
    reason: "ติดตามภาวะลำไส้ + ตรวจตับ", status: "Completed",
    findings: "ผนังลำไส้หนาเล็กน้อย (3.2mm) ลักษณะ inflammatory pattern · ตับและถุงน้ำดีปกติ",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80",
    completedAt: "2025-11-23T12:00:00",
  },
  // Tick-borne (admit 102) — 2025-08
  {
    id: 8004, admitId: 7, orderedAt: "2025-08-05T11:00:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    type: "Ultrasound", position: "Spleen + Lymph nodes",
    reason: "ตรวจม้ามและต่อมน้ำเหลือง — สงสัย Ehrlichia", status: "Completed",
    findings: "ม้ามโต (splenomegaly) มี hypoechoic pattern กระจาย · ต่อมน้ำเหลือง mesenteric โตเล็กน้อย — สอดคล้องกับ tick-borne disease",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    completedAt: "2025-08-05T13:00:00",
  },

  /* ─── Current-admit imaging (2569 · ผูก admit จริง) ─── */
  // id7 ไทเกอร์ — Medical Imaging กระดูกต้นขา (post-op · มีไฟล์ DICOM)
  {
    id: 8101, admitId: 7, orderedAt: "2026-07-01T17:30:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    type: "Medical Imaging", position: "Femur ขวา (lateral + craniocaudal)",
    reason: "ประเมินการดามกระดูกต้นขาหักหลังผ่าตัด",
    attachments: [
      { name: "femur_R_lateral_postop.dcm", url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80", kind: "dicom" },
      { name: "femur_R_craniocaudal_postop.dcm", url: "https://images.unsplash.com/photo-1516069677018-378515003435?w=800&q=80", kind: "dicom" },
    ],
    status: "Completed",
    findings: "แนวกระดูกต้นขาเข้าที่ดี plate 8 รู + screw 6 ตัวยึดมั่นคง ไม่มี gap ที่รอยหัก — ผลผ่าตัดน่าพอใจ",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    completedAt: "2026-07-01T18:15:00",
  },
  // id11 ป๊อบ — Chest Medical Imaging (pneumonia)
  {
    id: 8102, admitId: 11, orderedAt: "2026-07-07T09:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    type: "Medical Imaging", position: "Thorax (lateral + DV)",
    reason: "หายใจลำบาก — ประเมินปอด",
    status: "Completed",
    findings: "Alveolar pattern ที่ปอดกลีบ cranioventral ทั้งสองข้าง มี air bronchogram — สอดคล้อง bronchopneumonia",
    imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    completedAt: "2026-07-07T10:00:00",
  },
  // id3 บัดดี้ — Ultrasound ช่องท้อง (GI)
  {
    id: 8103, admitId: 3, orderedAt: "2026-07-03T13:00:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    type: "Ultrasound", position: "Abdomen — GI, Liver, Pancreas",
    reason: "อาเจียน/ท้องเสีย — แยก obstruction vs enteritis",
    status: "Completed",
    findings: "ผนังลำไส้หนาแบบ inflammatory (3.5mm) ไม่พบ foreign body/obstruction · ตับอ่อนขนาดปกติ — acute gastroenteritis",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80",
    completedAt: "2026-07-03T14:00:00",
  },
  // id6 แม็กซ์ — Ultrasound ไต (CKD)
  {
    id: 8104, admitId: 6, orderedAt: "2026-07-02T11:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    type: "Ultrasound", position: "Kidneys (bilateral)",
    reason: "ประเมินโครงสร้างไตในภาวะ CKD",
    status: "Completed",
    findings: "ไตทั้งสองข้างขนาดลดลงเล็กน้อย เพิ่ม cortical echogenicity เส้นแบ่ง corticomedullary ไม่ชัด — chronic renal changes",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    completedAt: "2026-07-02T12:30:00",
  },
  // id4 โคโค่ — Medical Imaging ช่องท้องกระต่าย (GI stasis)
  {
    id: 8105, admitId: 4, orderedAt: "2026-07-06T15:00:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    type: "Medical Imaging", position: "Abdomen (lateral + VD)",
    reason: "ไม่ถ่าย ท้องอืด — แยก GI stasis vs obstruction",
    status: "Completed",
    findings: "กระเพาะอาหารเต็มไปด้วยอาหาร+แก๊ส (halo sign) ลำไส้มีแก๊สกระจาย ไม่พบจุดอุดตันชัดเจน — สอดคล้อง GI stasis",
    imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80",
    completedAt: "2026-07-06T15:45:00",
  },
];

/* ─── Initial drug orders — past prescriptions for history demo ─── */
const initialDrugs: DrugOrder[] = [
  // Annual checkup (admit 100) — 2026-02
  {
    id: 7001, admitId: 6, orderedAt: "2026-02-14T11:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "Bravecto", strength: "1000mg", dose: "1 เม็ด", route: "PO", frequency: "Once",
    durationDays: 90, isPRN: false, isContinuous: false,
    note: "ป้องกันเห็บ-หมัด รอบถัดไป 14 พ.ค. 2569", active: false,
  },
  {
    id: 7002, admitId: 6, orderedAt: "2026-02-14T11:35:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "NexGard Spectra", strength: "1 เม็ด", dose: "1 เม็ด", route: "PO", frequency: "Once",
    durationDays: 30, isPRN: false, isContinuous: false,
    note: "ถ่ายพยาธิหัวใจ + พยาธิภายใน", active: false,
  },
  // GI upset (admit 101) — 2025-11
  {
    id: 7003, admitId: 3, orderedAt: "2025-11-22T15:30:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Maropitant (Cerenia)", strength: "10mg/ml", dose: "1mg/kg",
    route: "SC", frequency: "q24h", durationDays: 3, isPRN: false, isContinuous: false,
    note: "Antiemetic ก่อนให้อาหาร", active: false,
  },
  {
    id: 7004, admitId: 3, orderedAt: "2025-11-22T15:35:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Amoxicillin/Clavulanate", strength: "62.5mg/ml", dose: "12.5mg/kg",
    route: "PO", frequency: "q12h", durationDays: 7, isPRN: false, isContinuous: false,
    note: "ครอบคลุมเชื้อแบคทีเรียในลำไส้", active: false,
  },
  {
    id: 7005, admitId: 3, orderedAt: "2025-11-22T15:40:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "LRS (Lactated Ringer's)", dose: "60 ml/kg/day",
    route: "IV", frequency: "Continuous", isPRN: false, isContinuous: true,
    note: "ทดแทนน้ำที่สูญเสียจากอาเจียน/ท้องเสีย", active: false,
  },
  {
    id: 7006, admitId: 3, orderedAt: "2025-11-23T09:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Metronidazole", strength: "50mg/ml", dose: "15mg/kg",
    route: "IV", frequency: "q12h", durationDays: 5, isPRN: false, isContinuous: false,
    note: "ครอบคลุม anaerobe + antiprotozoal", active: false,
  },
  // Tick-borne (admit 102) — 2025-08
  {
    id: 7007, admitId: 7, orderedAt: "2025-08-05T13:30:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    drugName: "Doxycycline", strength: "100mg", dose: "10mg/kg",
    route: "PO", frequency: "q24h", durationDays: 28, isPRN: false, isContinuous: false,
    note: "First-line สำหรับ Ehrlichia — เน้นกินสม่ำเสมอ 28 วัน", active: false,
  },
  {
    id: 7008, admitId: 7, orderedAt: "2025-08-05T13:35:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    drugName: "Prednisolone", strength: "5mg", dose: "0.5mg/kg",
    route: "PO", frequency: "q12h", durationDays: 7, isPRN: false, isContinuous: false,
    isControlled: false,
    note: "Taper หลัง PLT ขึ้น", active: false,
  },

  /* ─── Active orders — กีวี่ (HN-2026-024, admit 2) · Feather plucking + dermatitis
       สั่งยาวันแรกรับ (2026-07-07) · durations ยังอยู่ในช่วงรักษา ณ วันนี้ (2026-07-08 = Day 2) ─── */
  {
    id: 8001, admitId: 2, orderedAt: "2026-07-07T09:30:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "Meloxicam (Metacam)", strength: "1.5mg/ml", dose: "0.3mg/kg",
    route: "PO", frequency: "q24h", durationDays: 5, isPRN: false, isContinuous: false,
    note: "NSAID — ลดการอักเสบผิวหนังและความไม่สบายตัวจากการจิกขน", active: true,
    qtyRequested: 5, qtyDispensed: 5, qtyUnit: "dose", pricePerUnit: 90,
  },
  {
    id: 8002, admitId: 2, orderedAt: "2026-07-07T09:35:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "Buprenorphine", strength: "0.3mg/ml", dose: "0.02mg/kg",
    route: "IM", frequency: "q8h", durationDays: 3, isPRN: false, isContinuous: false,
    isControlled: true,
    note: "Opioid — บรรเทาความเจ็บ ลดพฤติกรรมจิกถอนขนทำร้ายตัวเอง 48 ชม.แรก", active: true,
    qtyRequested: 9, qtyDispensed: 9, qtyUnit: "dose", pricePerUnit: 60,
  },
  {
    id: 8003, admitId: 2, orderedAt: "2026-07-07T09:40:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "Amoxicillin/Clavulanate", strength: "62.5mg/ml", dose: "125mg/kg",
    route: "PO", frequency: "q12h", durationDays: 7, isPRN: false, isContinuous: false,
    note: "ครอบคลุมการติดเชื้อแบคทีเรียที่ผิวหนัง (secondary pyoderma)", active: true,
    qtyRequested: 14, qtyDispensed: 14, qtyUnit: "dose", pricePerUnit: 35,
  },
  {
    id: 8004, admitId: 2, orderedAt: "2026-07-07T09:20:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "LRS (Lactated Ringer's)", dose: "25 ml/kg",
    route: "SC", frequency: "q12h", durationDays: 3, isPRN: false, isContinuous: false,
    note: "สารน้ำใต้ผิวหนังพยุงร่างกาย (นกเครียด/กินน้ำน้อย)", active: true,
    qtyRequested: 6, qtyDispensed: 4, qtyUnit: "dose", pricePerUnit: 40,
  },
  {
    id: 8005, admitId: 2, orderedAt: "2026-07-07T09:45:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "Haloperidol", strength: "1mg/ml", dose: "0.15mg/kg",
    route: "PO", frequency: "q12h", durationDays: 14, isPRN: false, isContinuous: false,
    note: "ยาปรับพฤติกรรม — ลดการจิกถอนขนตัวเอง (feather plucking)", active: true,
    qtyRequested: 28, qtyDispensed: 6, qtyUnit: "dose", pricePerUnit: 25,
  },

  /* ─── Active orders — ผู้ป่วยแอดมิตปัจจุบัน (id1,3-11) · ผูก admit จริง · ครบทุกโรค ─── */
  // id1 โมจิ (แมว · ลำไส้อักเสบ)
  {
    id: 7101, admitId: 1, orderedAt: "2026-07-05T11:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Maropitant (Cerenia)", strength: "10mg/ml", dose: "1mg/kg",
    route: "SC", frequency: "q24h", durationDays: 3, isPRN: false, isContinuous: false,
    note: "Antiemetic — ลดอาเจียนก่อนป้อนอาหาร", active: true,
    qtyRequested: 3, qtyDispensed: 3, qtyUnit: "dose", pricePerUnit: 120,
  },
  {
    id: 7102, admitId: 1, orderedAt: "2026-07-05T10:50:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "LRS (Lactated Ringer's)", dose: "40 ml/kg/day",
    route: "IV", frequency: "Continuous", isPRN: false, isContinuous: true,
    note: "ทดแทนน้ำที่เสียจากถ่ายเหลว", active: true,
    qtyRequested: 3, qtyDispensed: 2, qtyUnit: "ถุง(500ml)", pricePerUnit: 150,
  },
  // id3 บัดดี้ (สุนัข · gastroenteritis · IV)
  {
    id: 7103, admitId: 3, orderedAt: "2026-07-03T11:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "LRS (Lactated Ringer's)", dose: "60 ml/kg/day",
    route: "IV", frequency: "Continuous", isPRN: false, isContinuous: true,
    note: "แก้ภาวะขาดน้ำจากอาเจียน/ท้องเสีย", active: true,
    qtyRequested: 6, qtyDispensed: 5, qtyUnit: "ถุง(1000ml)", pricePerUnit: 180,
  },
  {
    id: 7104, admitId: 3, orderedAt: "2026-07-03T11:35:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "Maropitant (Cerenia)", strength: "10mg/ml", dose: "1mg/kg",
    route: "SC", frequency: "q24h", durationDays: 6, isPRN: false, isContinuous: false,
    note: "Antiemetic — คุมอาเจียน", active: true,
    qtyRequested: 4, qtyDispensed: 4, qtyUnit: "dose", pricePerUnit: 120,
  },
  // id4 โคโค่ (กระต่าย · GI stasis)
  {
    id: 7105, admitId: 4, orderedAt: "2026-07-06T14:45:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "Metoclopramide", strength: "5mg/ml", dose: "0.5mg/kg",
    route: "SC", frequency: "q8h", durationDays: 3, isPRN: false, isContinuous: false,
    note: "Prokinetic — กระตุ้นการเคลื่อนไหวลำไส้", active: true,
    qtyRequested: 9, qtyDispensed: 9, qtyUnit: "dose", pricePerUnit: 25,
  },
  {
    id: 7106, admitId: 4, orderedAt: "2026-07-06T14:50:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "Meloxicam (Metacam)", strength: "1.5mg/ml", dose: "0.3mg/kg",
    route: "SC", frequency: "q24h", durationDays: 3, isPRN: false, isContinuous: false,
    note: "NSAID — ลดปวดท้องอืด กระตุ้นความอยากอาหาร", active: true,
    qtyRequested: 3, qtyDispensed: 3, qtyUnit: "dose", pricePerUnit: 90,
  },
  // id5 ชาร์ลี (สุนัข · pyoderma/dermatitis)
  {
    id: 7107, admitId: 5, orderedAt: "2026-07-04T14:00:00", orderedBy: "สพ.ว. วรรณา ใจดี",
    drugName: "Cephalexin", strength: "250mg", dose: "22mg/kg",
    route: "PO", frequency: "q12h", durationDays: 21, isPRN: false, isContinuous: false,
    note: "ยาปฏิชีวนะสำหรับ pyoderma — ให้ครบคอร์ส", active: true,
    qtyRequested: 42, qtyDispensed: 10, qtyUnit: "เม็ด", pricePerUnit: 20,
  },
  {
    id: 7108, admitId: 5, orderedAt: "2026-07-04T14:05:00", orderedBy: "สพ.ว. วรรณา ใจดี",
    drugName: "Oclacitinib (Apoquel)", strength: "5.4mg", dose: "0.5mg/kg",
    route: "PO", frequency: "q12h", durationDays: 14, isPRN: false, isContinuous: false,
    note: "ลดอาการคัน (anti-pruritic)", active: true,
    qtyRequested: 28, qtyDispensed: 8, qtyUnit: "เม็ด", pricePerUnit: 65,
  },
  // id6 แม็กซ์ (สุนัข · CKD Stage 2)
  {
    id: 7109, admitId: 6, orderedAt: "2026-07-02T10:00:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "Aluminium hydroxide", strength: "300mg", dose: "30mg/kg",
    route: "PO", frequency: "q12h", durationDays: 30, isPRN: false, isContinuous: false,
    note: "Phosphate binder — ให้พร้อมอาหาร คุมฟอสฟอรัส", active: true,
    qtyRequested: 60, qtyDispensed: 12, qtyUnit: "dose", pricePerUnit: 15,
  },
  {
    id: 7110, admitId: 6, orderedAt: "2026-07-02T10:05:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "LRS (Lactated Ringer's)", dose: "20 ml/kg",
    route: "SC", frequency: "q12h", durationDays: 6, isPRN: false, isContinuous: false,
    note: "สารน้ำพยุงไต ลดของเสียคั่ง", active: true,
    qtyRequested: 12, qtyDispensed: 11, qtyUnit: "dose", pricePerUnit: 40,
  },
  // id7 ไทเกอร์ (สุนัข · post-op femoral fracture)
  {
    id: 7111, admitId: 7, orderedAt: "2026-07-01T17:00:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    drugName: "Tramadol", strength: "50mg", dose: "4mg/kg",
    route: "PO", frequency: "q8h", durationDays: 10, isPRN: false, isContinuous: false,
    isControlled: true,
    note: "Analgesia หลังผ่าตัด — คุมปวดร่วมกับ NSAID", active: true,
    qtyRequested: 21, qtyDispensed: 21, qtyUnit: "เม็ด", pricePerUnit: 18,
  },
  {
    id: 7112, admitId: 7, orderedAt: "2026-07-01T17:05:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    drugName: "Cefazolin", strength: "1g/vial", dose: "22mg/kg",
    route: "IV", frequency: "q8h", durationDays: 5, isPRN: false, isContinuous: false,
    note: "ยาปฏิชีวนะป้องกันติดเชื้อแผลผ่าตัดกระดูก", active: true,
    qtyRequested: 15, qtyDispensed: 15, qtyUnit: "vial", pricePerUnit: 120,
  },
  // id8 ลูน่า (แมว · hypertensive crisis · ICU)
  {
    id: 7113, admitId: 8, orderedAt: "2026-07-06T00:30:00", orderedBy: "สพ.ว. ปรีชา เก่งกล้า",
    drugName: "Amlodipine", strength: "1.25mg", dose: "0.125mg/kg",
    route: "PO", frequency: "q24h", durationDays: 30, isPRN: false, isContinuous: false,
    note: "Calcium channel blocker — ลดความดันโลหิต ให้ตรงเวลา", active: true,
    qtyRequested: 30, qtyDispensed: 3, qtyUnit: "เม็ด", pricePerUnit: 12,
  },
  // id9 เร็กซ์ (เบียร์ดดราก้อน · MBD)
  {
    id: 7114, admitId: 9, orderedAt: "2026-07-03T15:40:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "Calcium gluconate 10%", strength: "100mg/ml", dose: "100mg/kg",
    route: "SC", frequency: "q12h", durationDays: 7, isPRN: false, isContinuous: false,
    note: "แก้ภาวะแคลเซียมต่ำวิกฤต (MBD) — เจือจางก่อนให้", active: true,
    qtyRequested: 10, qtyDispensed: 10, qtyUnit: "dose", pricePerUnit: 85,
  },
  {
    id: 7115, admitId: 9, orderedAt: "2026-07-03T15:45:00", orderedBy: "พญ. ณัฐสุดา ทองพูล",
    drugName: "Calcium glubionate (syrup)", strength: "23mg/ml", dose: "10mg/kg",
    route: "PO", frequency: "q12h", durationDays: 30, isPRN: false, isContinuous: false,
    note: "เสริมแคลเซียมต่อเนื่องพร้อมปรับ UVB/โภชนาการ", active: true,
    qtyRequested: 60, qtyDispensed: 10, qtyUnit: "ml", pricePerUnit: 30,
  },
  // id10 ส้มโอ (แมว · panleukopenia · isolation)
  {
    id: 7116, admitId: 10, orderedAt: "2026-07-06T09:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "LRS (Lactated Ringer's)", dose: "50 ml/kg/day",
    route: "IV", frequency: "Continuous", isPRN: false, isContinuous: true,
    note: "สารน้ำพยุงร่างกาย งดน้ำ-อาหารทางปากช่วงอาเจียน", active: true,
    qtyRequested: 4, qtyDispensed: 3, qtyUnit: "ถุง(500ml)", pricePerUnit: 150,
  },
  {
    id: 7117, admitId: 10, orderedAt: "2026-07-06T09:05:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Amoxicillin/Clavulanate", strength: "600mg/vial", dose: "20mg/kg",
    route: "IV", frequency: "q12h", durationDays: 7, isPRN: false, isContinuous: false,
    note: "ป้องกันติดเชื้อแทรกซ้อนช่วงเม็ดเลือดขาวต่ำ", active: true,
    qtyRequested: 14, qtyDispensed: 14, qtyUnit: "vial", pricePerUnit: 95,
  },
  // id11 ป๊อบ (สุนัข · pneumonia · oxygen)
  {
    id: 7118, admitId: 11, orderedAt: "2026-07-07T08:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "Amoxicillin/Clavulanate", strength: "600mg/vial", dose: "20mg/kg",
    route: "IV", frequency: "q8h", durationDays: 7, isPRN: false, isContinuous: false,
    note: "ยาปฏิชีวนะสำหรับปอดบวมจากแบคทีเรีย", active: true,
    qtyRequested: 21, qtyDispensed: 21, qtyUnit: "vial", pricePerUnit: 95,
  },
  {
    id: 7119, admitId: 11, orderedAt: "2026-07-07T08:35:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "Terbutaline", strength: "1mg/ml", dose: "0.01mg/kg",
    route: "SC", frequency: "q8h", durationDays: 4, isPRN: false, isContinuous: false,
    note: "Bronchodilator — ช่วยขยายหลอดลม ลดหอบ", active: true,
    qtyRequested: 12, qtyDispensed: 12, qtyUnit: "dose", pricePerUnit: 45,
  },
];

/* ─── Initial MAR records — ตารางให้ยาวันนี้ (2026-07-08) · บางมื้อ Administered เพื่อโชว์ ✓ ─── */
const initialMAR: MARRecord[] = [
  /* กีวี่ (admit 2) */
  // Meloxicam q24h — 1 dose/day at 08:00
  { id: 9101, drugOrderId: 8001, scheduledAt: "2026-07-08T08:00:00", status: "Administered",
    administeredAt: "2026-07-08T08:05:00", administeredBy: "พว. ธิดา" },
  // Buprenorphine q8h — 06:00, 14:00, 22:00
  { id: 9102, drugOrderId: 8002, scheduledAt: "2026-07-08T06:00:00", status: "Administered",
    administeredAt: "2026-07-08T06:10:00", administeredBy: "พว. ธิดา" },
  { id: 9103, drugOrderId: 8002, scheduledAt: "2026-07-08T14:00:00", status: "Pending" },
  { id: 9104, drugOrderId: 8002, scheduledAt: "2026-07-08T22:00:00", status: "Pending" },
  // Amoxicillin q12h — 08:00, 20:00
  { id: 9105, drugOrderId: 8003, scheduledAt: "2026-07-08T08:00:00", status: "Administered",
    administeredAt: "2026-07-08T08:15:00", administeredBy: "พว. ธิดา" },
  { id: 9106, drugOrderId: 8003, scheduledAt: "2026-07-08T20:00:00", status: "Pending" },

  /* id3 บัดดี้ — Maropitant q24h (7104) */
  { id: 9201, drugOrderId: 7104, scheduledAt: "2026-07-08T08:00:00", status: "Administered",
    administeredAt: "2026-07-08T08:10:00", administeredBy: "พว. ธิดา" },
  /* id6 แม็กซ์ — Aluminium hydroxide q12h (7109) */
  { id: 9202, drugOrderId: 7109, scheduledAt: "2026-07-08T08:00:00", status: "Administered",
    administeredAt: "2026-07-08T08:20:00", administeredBy: "พว. มาลี" },
  { id: 9203, drugOrderId: 7109, scheduledAt: "2026-07-08T20:00:00", status: "Pending" },
  /* id8 ลูน่า — Amlodipine q24h (7113) */
  { id: 9204, drugOrderId: 7113, scheduledAt: "2026-07-08T08:00:00", status: "Administered",
    administeredAt: "2026-07-08T08:05:00", administeredBy: "พว. อรพิน" },
  /* id11 ป๊อบ — Amoxicillin/Clav q8h (7118) */
  { id: 9205, drugOrderId: 7118, scheduledAt: "2026-07-08T06:00:00", status: "Administered",
    administeredAt: "2026-07-08T06:15:00", administeredBy: "พว. ธิดา" },
  { id: 9206, drugOrderId: 7118, scheduledAt: "2026-07-08T14:00:00", status: "Pending" },
  { id: 9207, drugOrderId: 7118, scheduledAt: "2026-07-08T22:00:00", status: "Pending" },
  /* id7 ไทเกอร์ — Tramadol q8h (7111) */
  { id: 9208, drugOrderId: 7111, scheduledAt: "2026-07-08T06:00:00", status: "Administered",
    administeredAt: "2026-07-08T06:20:00", administeredBy: "พว. มาลี" },
  { id: 9209, drugOrderId: 7111, scheduledAt: "2026-07-08T14:00:00", status: "Pending" },
  /* id9 เร็กซ์ — Calcium gluconate q12h (7114) */
  { id: 9210, drugOrderId: 7114, scheduledAt: "2026-07-08T08:00:00", status: "Administered",
    administeredAt: "2026-07-08T08:30:00", administeredBy: "พว. กนกวรรณ" },
];

/* ─── Initial payments — ประวัติชำระบางส่วนของผู้ป่วยปัจจุบัน (ผูก admit จริง · รวมเท่ากับ paid) ─── */
const initialPayments: Payment[] = [
  // id1 โมจิ — paid 2000 / 4600
  { id: 6001, admitId: 1, paidAt: "2026-07-05T12:30:00", amount: 2000, method: "Transfer", note: "ชำระมัดจำแรกรับ" },
  // id3 บัดดี้ — paid 3000 / 6800
  { id: 6002, admitId: 3, paidAt: "2026-07-03T12:00:00", amount: 2000, method: "Transfer", note: "ชำระมัดจำแรกรับ" },
  { id: 6003, admitId: 3, paidAt: "2026-07-06T10:00:00", amount: 1000, method: "Cash", note: "ชำระเพิ่มระหว่างรักษา" },
  // id6 แม็กซ์ — paid 4000 / 8400
  { id: 6004, admitId: 6, paidAt: "2026-07-02T10:00:00", amount: 4000, method: "Card", note: "บัตรเครดิต •••• 4521 · ชำระมัดจำ" },
  // id7 ไทเกอร์ — paid 15000 / 24500
  { id: 6005, admitId: 7, paidAt: "2026-07-01T18:00:00", amount: 15000, method: "Transfer", note: "ชำระมัดจำค่าผ่าตัด" },
  // id8 ลูน่า — paid 6000 / 12800
  { id: 6006, admitId: 8, paidAt: "2026-07-06T01:00:00", amount: 6000, method: "Card", note: "ชำระมัดจำ ICU" },
];

/* ─── Initial vitals — สัญญาณชีพย้อนหลังของผู้ป่วยปัจจุบัน (ค่า temp เป็น °C ตาม snapshot · ตามชนิดสัตว์) ─── */
const initialVitals: VitalSign[] = [
  // id1 โมจิ (แมว · ลำไส้อักเสบ)
  { id: 5001, admitId: 1, timestamp: "2026-07-05T14:00:00", recordedBy: "พว. ธิดา", temp: "39.2", pulse: "190", resp: "34", painScore: 2, note: "แรกรับ ซึม ขาดน้ำเล็กน้อย" },
  { id: 5002, admitId: 1, timestamp: "2026-07-06T20:00:00", recordedBy: "พว. มาลี", temp: "39.0", pulse: "178", resp: "30", painScore: 1, note: "เริ่มกินอาหารอ่อนได้บ้าง ไม่อาเจียน" },
  { id: 5003, admitId: 1, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. ธิดา", temp: "38.7", pulse: "168", resp: "28", painScore: 1, note: "อาการดีขึ้น อุจจาระเป็นก้อนขึ้น" },
  // id2 กีวี่ (นก · ถอนขนตัวเอง)
  { id: 5004, admitId: 2, timestamp: "2026-07-07T11:00:00", recordedBy: "พว. กนกวรรณ", temp: "41.2", pulse: "340", resp: "62", note: "แรกรับ ขนบริเวณอก-ใต้ปีกถูกถอน ผิวหนังแดง" },
  { id: 5005, admitId: 2, timestamp: "2026-07-08T09:00:00", recordedBy: "พว. กนกวรรณ", temp: "41.0", pulse: "320", resp: "58", note: "ใส่ collar กันจิก พฤติกรรมสงบขึ้น" },
  // id3 บัดดี้ (สุนัข · gastroenteritis · IV)
  { id: 5006, admitId: 3, timestamp: "2026-07-03T13:00:00", recordedBy: "พว. ธิดา", temp: "39.3", pulse: "120", resp: "28", painScore: 2, note: "แรกรับ ขาดน้ำ ~6% เริ่มให้สารน้ำ IV" },
  { id: 5007, admitId: 3, timestamp: "2026-07-05T09:00:00", recordedBy: "พว. มาลี", temp: "38.9", pulse: "104", resp: "24", painScore: 1, note: "อาเจียนลดลง ยังถ่ายเหลวเล็กน้อย" },
  { id: 5008, admitId: 3, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. ธิดา", temp: "38.6", pulse: "92", resp: "22", painScore: 0, note: "กินได้ ถ่ายเป็นก้อน เตรียมลดสารน้ำ" },
  // id4 โคโค่ (กระต่าย · GI stasis)
  { id: 5009, admitId: 4, timestamp: "2026-07-06T16:00:00", recordedBy: "พว. กนกวรรณ", temp: "38.6", pulse: "245", resp: "48", note: "แรกรับ ท้องอืด ไม่ถ่าย ไม่กินอาหาร" },
  { id: 5010, admitId: 4, timestamp: "2026-07-08T08:30:00", recordedBy: "พว. กนกวรรณ", temp: "38.9", pulse: "220", resp: "44", note: "เริ่มถ่ายมูลเม็ดเล็ก เสียงลำไส้กลับมา" },
  // id5 ชาร์ลี (สุนัข · dermatitis)
  { id: 5011, admitId: 5, timestamp: "2026-07-04T15:00:00", recordedBy: "พว. ธิดา", temp: "38.7", pulse: "96", resp: "22", painScore: 1, note: "แรกรับ ผิวหนังอักเสบหลายตำแหน่ง คันเกามาก" },
  { id: 5012, admitId: 5, timestamp: "2026-07-06T20:00:00", recordedBy: "พว. มาลี", temp: "38.5", pulse: "90", resp: "20", painScore: 1, note: "รอยแดงลดลงหลังเริ่มยาปฏิชีวนะ" },
  { id: 5013, admitId: 5, timestamp: "2026-07-08T09:00:00", recordedBy: "พว. ธิดา", temp: "38.6", pulse: "88", resp: "20", painScore: 0, note: "แผลแห้งขึ้น คันน้อยลง" },
  // id6 แม็กซ์ (สุนัข · CKD)
  { id: 5014, admitId: 6, timestamp: "2026-07-02T11:00:00", recordedBy: "พว. มาลี", temp: "38.2", pulse: "88", resp: "20", bpSys: "165", bpDia: "98", note: "แรกรับ ค่าไตสูง ให้สารน้ำ" },
  { id: 5015, admitId: 6, timestamp: "2026-07-05T09:00:00", recordedBy: "พว. ธิดา", temp: "38.3", pulse: "84", resp: "18", bpSys: "150", bpDia: "92", note: "กินอาหารสูตรโรคไตได้ ปัสสาวะปกติ" },
  { id: 5016, admitId: 6, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. มาลี", temp: "38.4", pulse: "82", resp: "18", bpSys: "145", bpDia: "90", note: "อาการคงที่ รอผลค่าไตซ้ำ" },
  // id7 ไทเกอร์ (สุนัข · post-op fracture)
  { id: 5017, admitId: 7, timestamp: "2026-07-01T18:00:00", recordedBy: "พว. ธิดา", temp: "38.4", pulse: "100", resp: "22", painScore: 4, note: "หลังผ่าตัด ปวดแผล ให้ยาแก้ปวด" },
  { id: 5018, admitId: 7, timestamp: "2026-07-04T09:00:00", recordedBy: "พว. มาลี", temp: "38.5", pulse: "92", resp: "20", painScore: 3, note: "แผลแห้งดี เริ่มลงน้ำหนักขาเล็กน้อย" },
  { id: 5019, admitId: 7, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. ธิดา", temp: "38.3", pulse: "88", resp: "18", painScore: 2, note: "เดินได้ดีขึ้น ทำกายภาพต่อเนื่อง" },
  // id8 ลูน่า (แมว · hypertensive crisis · ICU — ค่าผิดปกติ)
  { id: 5020, admitId: 8, timestamp: "2026-07-05T23:30:00", recordedBy: "พว. อรพิน", temp: "38.9", pulse: "205", resp: "36", bpSys: "220", bpDia: "130", painScore: 2, note: "แรกรับ ICU ความดันสูงวิกฤต รูม่านตาขยาย" },
  { id: 5021, admitId: 8, timestamp: "2026-07-06T12:00:00", recordedBy: "พว. อรพิน", temp: "38.8", pulse: "190", resp: "32", bpSys: "195", bpDia: "118", note: "หลังเริ่ม amlodipine ความดันเริ่มลด" },
  { id: 5022, admitId: 8, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. อรพิน", temp: "38.7", pulse: "182", resp: "30", bpSys: "178", bpDia: "108", note: "ความดันลดต่อเนื่อง ยังต้องเฝ้าระวังใกล้ชิด" },
  // id9 เร็กซ์ (เบียร์ดดราก้อน · MBD — ectotherm ค่าต่ำ)
  { id: 5023, admitId: 9, timestamp: "2026-07-03T16:00:00", recordedBy: "พว. กนกวรรณ", temp: "36.0", pulse: "68", resp: "18", note: "แรกรับ ขาหลังอ่อนแรง ขากรรไกรนิ่ม" },
  { id: 5024, admitId: 9, timestamp: "2026-07-05T10:00:00", recordedBy: "พว. กนกวรรณ", temp: "36.5", pulse: "72", resp: "20", note: "ให้แคลเซียมแล้ว อาการชักเกร็งลดลง" },
  { id: 5025, admitId: 9, timestamp: "2026-07-08T09:00:00", recordedBy: "พว. กนกวรรณ", temp: "37.0", pulse: "74", resp: "20", note: "เริ่มขยับขาได้ กินแมลงได้บ้าง" },
  // id10 ส้มโอ (แมว · panleukopenia · isolation)
  { id: 5026, admitId: 10, timestamp: "2026-07-06T10:00:00", recordedBy: "พว. อรพิน", temp: "40.1", pulse: "190", resp: "40", painScore: 2, note: "แรกรับ ไข้สูง อาเจียน เม็ดเลือดขาวต่ำ" },
  { id: 5027, admitId: 10, timestamp: "2026-07-07T20:00:00", recordedBy: "พว. อรพิน", temp: "39.6", pulse: "182", resp: "36", painScore: 1, note: "ไข้เริ่มลด ให้สารน้ำต่อเนื่อง" },
  { id: 5028, admitId: 10, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. อรพิน", temp: "39.2", pulse: "176", resp: "34", painScore: 1, note: "ไข้ลดลง ยังงดน้ำ-อาหารทางปาก" },
  // id11 ป๊อบ (สุนัข · pneumonia · oxygen — resp สูง)
  { id: 5029, admitId: 11, timestamp: "2026-07-07T09:00:00", recordedBy: "พว. ธิดา", temp: "39.5", pulse: "132", resp: "46", painScore: 1, note: "แรกรับ หายใจลำบาก ให้ออกซิเจน SpO2 92%" },
  { id: 5030, admitId: 11, timestamp: "2026-07-07T22:00:00", recordedBy: "พว. มาลี", temp: "39.3", pulse: "126", resp: "42", note: "หลังยาปฏิชีวนะ+ขยายหลอดลม หายใจดีขึ้นเล็กน้อย" },
  { id: 5031, admitId: 11, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. ธิดา", temp: "39.0", pulse: "120", resp: "38", note: "SpO2 95% ใน O2 cage หายใจสม่ำเสมอขึ้น" },
];

/* ─── Initial intake/output — ผู้ป่วยที่ให้สารน้ำ (id3/id8/id10/id11) ─── */
const initialIO: IntakeOutput[] = [
  // id3 บัดดี้
  { id: 4001, admitId: 3, timestamp: "2026-07-07T08:00:00", recordedBy: "พว. ธิดา", shift: "เช้า", intakeType: "IV", intakeAmount: 120, fluidRate: 12, outputType: "Urine", outputAmount: 90, note: "ปัสสาวะสีปกติ" },
  { id: 4002, admitId: 3, timestamp: "2026-07-07T16:00:00", recordedBy: "พว. มาลี", shift: "บ่าย", intakeType: "Oral", intakeAmount: 60, outputType: "Feces", outputAmount: 40, fecesScore: 4, note: "ถ่ายเหลวน้อยลง" },
  { id: 4003, admitId: 3, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. ธิดา", shift: "เช้า", intakeType: "IV", intakeAmount: 100, fluidRate: 10, outputType: "Urine", outputAmount: 110, note: "สมดุลน้ำดี เตรียมลดอัตรา" },
  // id8 ลูน่า
  { id: 4004, admitId: 8, timestamp: "2026-07-06T08:00:00", recordedBy: "พว. อรพิน", shift: "เช้า", intakeType: "IV", intakeAmount: 80, fluidRate: 8, outputType: "Urine", outputAmount: 70, note: "monitor UOP ใน ICU" },
  { id: 4005, admitId: 8, timestamp: "2026-07-07T08:00:00", recordedBy: "พว. อรพิน", shift: "เช้า", intakeType: "IV", intakeAmount: 80, fluidRate: 8, outputType: "Urine", outputAmount: 85, note: "ปัสสาวะปกติ" },
  { id: 4006, admitId: 8, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. อรพิน", shift: "เช้า", intakeType: "IV", intakeAmount: 70, fluidRate: 6, outputType: "Urine", outputAmount: 80, note: "ลดอัตราสารน้ำตามความดันที่ลด" },
  // id10 ส้มโอ
  { id: 4007, admitId: 10, timestamp: "2026-07-06T20:00:00", recordedBy: "พว. อรพิน", shift: "บ่าย", intakeType: "IV", intakeAmount: 100, fluidRate: 10, outputType: "Vomit", outputAmount: 25, note: "อาเจียน 2 ครั้ง" },
  { id: 4008, admitId: 10, timestamp: "2026-07-07T08:00:00", recordedBy: "พว. อรพิน", shift: "เช้า", intakeType: "IV", intakeAmount: 110, fluidRate: 10, outputType: "Urine", outputAmount: 75, note: "ปัสสาวะน้อย ให้สารน้ำต่อ" },
  { id: 4009, admitId: 10, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. อรพิน", shift: "เช้า", intakeType: "IV", intakeAmount: 100, fluidRate: 8, outputType: "Feces", outputAmount: 20, fecesScore: 4, note: "อาเจียนหยุด เริ่มถ่าย" },
  // id11 ป๊อบ
  { id: 4010, admitId: 11, timestamp: "2026-07-07T12:00:00", recordedBy: "พว. ธิดา", shift: "เช้า", intakeType: "IV", intakeAmount: 60, fluidRate: 6, outputType: "Urine", outputAmount: 55, note: "ให้สารน้ำระวังภาวะน้ำเกิน (ปอด)" },
  { id: 4011, admitId: 11, timestamp: "2026-07-08T08:00:00", recordedBy: "พว. มาลี", shift: "เช้า", intakeType: "IV", intakeAmount: 50, fluidRate: 5, outputType: "Urine", outputAmount: 60, note: "สมดุลน้ำเหมาะสม หายใจดีขึ้น" },
];

/* ─── Initial nursing notes — ทุกผู้ป่วยอย่างน้อย 1-2 โน้ต (Note/SOAP) ─── */
const initialNursingNotes: NursingNote[] = [
  { id: 3001, admitId: 1, timestamp: "2026-07-06T21:00:00", recordedBy: "พว. มาลี", kind: "Note", note: "ป้อนอาหารอ่อน i/d ทาง syringe กินได้ 3/4 ส่วน ไม่อาเจียน ทำความสะอาดกระบะทราย" },
  { id: 3002, admitId: 1, timestamp: "2026-07-08T08:30:00", recordedBy: "สพ.ว. สุภา มีสุข", kind: "SOAP", subjective: "เจ้าของแจ้งกินขนมได้เล็กน้อย ร่าเริงขึ้น", objective: "ตื่นตัวดี อุจจาระเป็นก้อนขึ้น ไม่มีอาเจียน", assessment: "ลำไส้อักเสบตอบสนองการรักษาดี", plan: "ลดสารน้ำ ติดตามการกิน 1-2 วันก่อนพิจารณากลับบ้าน" },
  { id: 3003, admitId: 2, timestamp: "2026-07-07T13:00:00", recordedBy: "พว. กนกวรรณ", kind: "Note", note: "ใส่ Elizabethan collar กันจิกขน จัดสภาพแวดล้อมลดความเครียด เพิ่มของเล่นหากิน" },
  { id: 3004, admitId: 2, timestamp: "2026-07-08T09:30:00", recordedBy: "พว. กนกวรรณ", kind: "Note", note: "ทาครีมบำรุงผิวบริเวณที่ถอนขน สังเกตยังจิกเป็นครั้งคราว บันทึกพฤติกรรม" },
  { id: 3005, admitId: 3, timestamp: "2026-07-05T10:00:00", recordedBy: "พว. ธิดา", kind: "Note", note: "ให้สารน้ำ IV ต่อเนื่อง เช็ดตัวลดไข้ ป้อนอาหารอ่อน สังเกตอาเจียน/การถ่าย" },
  { id: 3006, admitId: 3, timestamp: "2026-07-08T08:30:00", recordedBy: "สพ.ว. สมชาย รักสัตว์", kind: "SOAP", subjective: "เจ้าของแจ้งกินอาหารเองได้แล้ว", objective: "ร่าเริง อุจจาระเป็นก้อน ไม่ขาดน้ำ", assessment: "Gastroenteritis ตอบสนองการรักษาดี", plan: "เตรียมหยุดสารน้ำ ตรวจ electrolyte ซ้ำ วางแผน discharge" },
  { id: 3007, admitId: 4, timestamp: "2026-07-07T10:00:00", recordedBy: "พว. กนกวรรณ", kind: "Note", note: "นวดท้องเบา ๆ กระตุ้นการเคลื่อนไหวลำไส้ ป้อน critical care ทาง syringe จัดหญ้าสดกระตุ้นการกิน" },
  { id: 3008, admitId: 5, timestamp: "2026-07-05T20:00:00", recordedBy: "พว. ธิดา", kind: "Note", note: "อาบน้ำยาฆ่าเชื้อ chlorhexidine เช็ดแผล ใส่ปลอกคอกันเลีย ทายาเฉพาะจุด" },
  { id: 3009, admitId: 6, timestamp: "2026-07-06T09:00:00", recordedBy: "พว. มาลี", kind: "Note", note: "ให้อาหารสูตรโรคไต บันทึกปริมาณน้ำดื่ม/ปัสสาวะ ให้ยาลดฟอสเฟตพร้อมอาหาร" },
  { id: 3010, admitId: 7, timestamp: "2026-07-05T09:00:00", recordedBy: "พว. ธิดา", kind: "Note", note: "ทำแผลผ่าตัดขาหลังขวา แผลแห้งดีไม่มีหนอง ประคบเย็น กายภาพขยับข้อเบา ๆ" },
  { id: 3011, admitId: 7, timestamp: "2026-07-08T08:30:00", recordedBy: "พว. มาลี", kind: "Note", note: "พาเดินระยะสั้นด้วย sling ประเมิน pain score ลดลง ให้ยาแก้ปวดตามแผน" },
  { id: 3012, admitId: 8, timestamp: "2026-07-06T02:00:00", recordedBy: "สพ.ว. ปรีชา เก่งกล้า", kind: "SOAP", subjective: "เจ้าของแจ้งซึม เดินชนของ", objective: "BP 220/130 รูม่านตาขยาย ตอบสนองช้า", assessment: "Hypertensive crisis", plan: "เริ่ม amlodipine, monitor BP q4h, จำกัดแสง/เสียง เฝ้าระวังภาวะแทรกซ้อนทางตา/สมอง" },
  { id: 3013, admitId: 8, timestamp: "2026-07-08T09:00:00", recordedBy: "พว. อรพิน", kind: "Note", note: "วัด BP q4h แนวโน้มลดลง ให้ยาตรงเวลา สังเกตอาการทางระบบประสาท" },
  { id: 3014, admitId: 9, timestamp: "2026-07-04T10:00:00", recordedBy: "พว. กนกวรรณ", kind: "Note", note: "จัด UVB + จุดอุ่นให้เหมาะสม ป้อนแคลเซียมเสริม จับตัวระวังกระดูกเปราะ บันทึกการชักเกร็ง" },
  { id: 3015, admitId: 10, timestamp: "2026-07-07T09:00:00", recordedBy: "พว. อรพิน", kind: "Note", note: "ดูแลในห้องแยกโรค สวม PPE ทุกครั้ง เช็ดตัวลดไข้ ให้สารน้ำ ฆ่าเชื้อกรงเข้มงวด" },
  { id: 3016, admitId: 10, timestamp: "2026-07-08T08:30:00", recordedBy: "พว. อรพิน", kind: "Note", note: "ไข้ลดลง เริ่มป้อน a/d ปริมาณน้อย สังเกตอาเจียน แยกขยะติดเชื้อ" },
  { id: 3017, admitId: 11, timestamp: "2026-07-07T09:30:00", recordedBy: "พว. ธิดา", kind: "Note", note: "ดูแลใน oxygen cage วัด SpO2 ต่อเนื่อง จัดท่านอนตะแคง เคาะปอดเบา ๆ (coupage)" },
  { id: 3018, admitId: 11, timestamp: "2026-07-08T08:30:00", recordedBy: "สพ.ว. สมชาย รักสัตว์", kind: "SOAP", subjective: "-", objective: "SpO2 95% ใน O2, resp 38, เสียงปอดครืดลดลง", assessment: "Pneumonia ตอบสนองยาปฏิชีวนะ", plan: "ให้ O2 ต่อ, antibiotic ตามแผน, X-ray ทรวงอกซ้ำใน 3 วัน" },
];

/* ─── Initial wounds — id7 แผลผ่าตัด, id5 แผลผิวหนัง ─── */
const initialWounds: WoundRecord[] = [
  { id: 2001, admitId: 7, timestamp: "2026-07-05T09:30:00", recordedBy: "พว. ธิดา", location: "ขาหลังขวา (femur ด้านข้าง)", size: "8 ซม.", description: "แผลผ่าตัดดามกระดูก เย็บ 12 เข็ม ขอบแผลแห้ง ไม่มีหนอง บวมแดงเล็กน้อย", treatment: "ทำความสะอาดด้วย NSS + povidine, ทายาปฏิชีวนะ, พันผ้าใหม่, ประคบเย็น" },
  { id: 2002, admitId: 5, timestamp: "2026-07-05T20:30:00", recordedBy: "พว. ธิดา", location: "ลำตัวด้านซ้าย + ซอกขาหน้า", size: "หลายจุด 1-3 ซม.", description: "แผลถลอกจากการเการุนแรง ผิวหนังแดง มีสะเก็ดและหนองเล็กน้อย", treatment: "อาบ chlorhexidine, เช็ดแห้ง, ทา mupirocin, ใส่ปลอกคอกันเลีย" },
];

/* ─── Initial feedings — id4 syringe feeding (กระต่าย), id9 assisted feeding (เร็กซ์) ─── */
const initialFeedings: FeedingRecord[] = [
  { id: 2501, admitId: 4, timestamp: "2026-07-07T10:00:00", recordedBy: "พว. กนกวรรณ", shift: "เช้า", food: "Critical Care (Oxbow) ผสมน้ำ", amount: "15 ml", route: "Syringe Feed", intakePct: 70, note: "ป้อนช้า ๆ กระต่ายกลืนได้ดี" },
  { id: 2502, admitId: 4, timestamp: "2026-07-08T08:30:00", recordedBy: "พว. กนกวรรณ", shift: "เช้า", food: "Critical Care + หญ้าสด", amount: "20 ml + หญ้าเล็กน้อย", route: "Syringe Feed", intakePct: 80, note: "เริ่มแทะหญ้าเองได้บ้าง" },
  { id: 2503, admitId: 9, timestamp: "2026-07-04T11:00:00", recordedBy: "พว. กนกวรรณ", shift: "เช้า", food: "อาหารสัตว์เลื้อยคลานบด + แคลเซียม", amount: "5 ml", route: "Syringe Feed", intakePct: 60, note: "ป้อนเสริมแคลเซียม จับตัวระวังกระดูก" },
  { id: 2504, admitId: 9, timestamp: "2026-07-08T09:30:00", recordedBy: "พว. กนกวรรณ", shift: "เช้า", food: "หนอนนก + ผักบด", amount: "3-4 ตัว", route: "Oral", intakePct: 75, note: "เริ่มกินแมลงเองได้" },
];

/* ─── Initial manual bills — ค่าห้อง/หัตถการ/แพทย์ (รวมกับ auto-derived จากยา/lab/x-ray ในหน้า Billing) ─── */
const initialBills: BillingItem[] = [
  // id1 โมจิ
  { id: 1001, admitId: 1, date: "2026-07-05", category: "ค่าห้อง/กรง", description: "ค่ากรงพัก Ward A (กรงเล็ก) 3 วัน", qty: 3, unitPrice: 350, total: 1050, recordedBy: "พว. ธิดา", recordedAt: "2026-07-05T12:00:00" },
  { id: 1002, admitId: 1, date: "2026-07-05", category: "ค่าแพทย์", description: "ค่าตรวจ/ประเมินโดยสัตวแพทย์", qty: 3, unitPrice: 300, total: 900, recordedBy: "สพ.ว. สุภา มีสุข", recordedAt: "2026-07-05T12:05:00" },
  // id3 บัดดี้
  { id: 1003, admitId: 3, date: "2026-07-03", category: "ค่าห้อง/กรง", description: "ค่ากรงพัก Ward B (กรงกลาง) 5 วัน", qty: 5, unitPrice: 450, total: 2250, recordedBy: "พว. ธิดา", recordedAt: "2026-07-03T12:00:00" },
  { id: 1004, admitId: 3, date: "2026-07-03", category: "ค่าหัตถการ", description: "ให้สารน้ำทางหลอดเลือดดำ (IV catheter + set)", qty: 1, unitPrice: 500, total: 500, recordedBy: "สพ.ว. สมชาย รักสัตว์", recordedAt: "2026-07-03T11:20:00" },
  // id6 แม็กซ์
  { id: 1005, admitId: 6, date: "2026-07-02", category: "ค่าห้อง/กรง", description: "ค่ากรงพัก Ward C (กรงใหญ่) 6 วัน", qty: 6, unitPrice: 550, total: 3300, recordedBy: "พว. มาลี", recordedAt: "2026-07-02T11:00:00" },
  { id: 1006, admitId: 6, date: "2026-07-02", category: "ค่าแพทย์", description: "ปรึกษาโรคไตเรื้อรัง + วางแผนการรักษา", qty: 1, unitPrice: 800, total: 800, recordedBy: "สพ.ว. สมชาย รักสัตว์", recordedAt: "2026-07-02T10:30:00" },
  // id7 ไทเกอร์
  { id: 1007, admitId: 7, date: "2026-07-01", category: "ค่าหัตถการ", description: "ผ่าตัดดามกระดูกต้นขา (ORIF) + วัสดุยึดกระดูก", qty: 1, unitPrice: 15000, total: 15000, recordedBy: "สพ.ว. ปรีชา เก่งกล้า", recordedAt: "2026-07-01T20:00:00" },
  { id: 1008, admitId: 7, date: "2026-07-01", category: "ค่าห้อง/กรง", description: "ค่ากรงพัก Ward C (กรงใหญ่) 7 วัน", qty: 7, unitPrice: 550, total: 3850, recordedBy: "พว. ธิดา", recordedAt: "2026-07-01T18:00:00" },
  // id8 ลูน่า
  { id: 1009, admitId: 8, date: "2026-07-05", category: "ค่าห้อง/กรง", description: "ค่าห้อง ICU + monitor 24 ชม. 3 วัน", qty: 3, unitPrice: 1200, total: 3600, recordedBy: "พว. อรพิน", recordedAt: "2026-07-06T00:00:00" },
  { id: 1010, admitId: 8, date: "2026-07-06", category: "ค่าหัตถการ", description: "วัดความดันโลหิต (Doppler BP) ต่อเนื่อง", qty: 4, unitPrice: 250, total: 1000, recordedBy: "พว. อรพิน", recordedAt: "2026-07-06T12:00:00" },
  // id9 เร็กซ์
  { id: 1011, admitId: 9, date: "2026-07-03", category: "ค่าห้อง/กรง", description: "ค่าห้อง ICU สัตว์พิเศษ (exotic) 5 วัน", qty: 5, unitPrice: 700, total: 3500, recordedBy: "พว. กนกวรรณ", recordedAt: "2026-07-03T16:00:00" },
  // id10 ส้มโอ
  { id: 1012, admitId: 10, date: "2026-07-06", category: "ค่าห้อง/กรง", description: "ค่าห้องแยกโรคติดเชื้อ (Isolation) 3 วัน", qty: 3, unitPrice: 650, total: 1950, recordedBy: "พว. อรพิน", recordedAt: "2026-07-06T09:00:00" },
  // id11 ป๊อบ
  { id: 1013, admitId: 11, date: "2026-07-07", category: "ค่าห้อง/กรง", description: "ค่าห้องออกซิเจน (Oxygen cage) 2 วัน", qty: 2, unitPrice: 900, total: 1800, recordedBy: "พว. ธิดา", recordedAt: "2026-07-07T09:00:00" },
];

/* ─── ตัวอย่าง Monitor รอบ (seed · id คงที่ 9001+ · กรอกครบทุกช่อง · มีประวัติย้อนหลังหลายวัน) ─── */
const buildSampleRounds = (admitId: number): MonitorRound[] => {
  const mk = (hoursAgo: number, data: Omit<MonitorRound, "id" | "admitId" | "timestamp" | "shift">): MonitorRound => {
    const ts = new Date(Date.now() - hoursAgo * 3600000);
    const hr = ts.getHours();
    const shift: ShiftName = hr >= 6 && hr < 14 ? "เช้า" : hr >= 14 && hr < 22 ? "บ่าย" : "ดึก";
    return { id: 9000, admitId, timestamp: ts.toISOString(), shift, ...data };
  };
  const rounds = [
    // วันนี้
    mk(2, {
      recordedBy: "น.ส. สุภาพร",
      painScore: 1, temp: "101.6", hydration: "ปกติ (<5%)", crt: "1.5", bpSys: "125", bpDia: "82", pulse: "110", resp: "22", oxygen: "2",
      fluidRate: 10, waterIntake: 40,
      uop: 35, fecesScore: 3, vomit: 0, drain: 5,
      food: "อาหารอ่อน i/d", foodAmount: "1/4 กระป๋อง", feedRoute: "Oral", intakePct: 80,
      note: "อาการดีขึ้น ตื่นตัวดี เริ่มกินเองได้บางส่วน",
    }),
    mk(7, {
      recordedBy: "สพ.ญ. อรพิน",
      painScore: 2, temp: "102.4", hydration: "5–6%", crt: "2", bpSys: "118", bpDia: "76", pulse: "128", resp: "26", oxygen: "1",
      fluidRate: 12, waterIntake: 25,
      uop: 28, fecesScore: 4, vomit: 15, drain: 8,
      food: "Syringe feed a/d", foodAmount: "30 ml", feedRoute: "Syringe Feed", intakePct: 50,
      note: "อาเจียน 1 ครั้ง ปริมาณน้อย ให้ยาแก้อาเจียน ติดตามอาการ",
    }),
    // เมื่อวาน
    mk(20, {
      recordedBy: "น.ส. สุภาพร",
      painScore: 2, temp: "102.0", hydration: "5–6%", crt: "2", bpSys: "122", bpDia: "78", pulse: "132", resp: "27", oxygen: "2",
      fluidRate: 14, waterIntake: 20,
      uop: 24, fecesScore: 4, vomit: 10, drain: 9,
      food: "Syringe feed a/d", foodAmount: "25 ml", feedRoute: "Syringe Feed", intakePct: 45,
      note: "เริ่มตอบสนองต่อสิ่งเร้า ปัสสาวะสีเข้มเล็กน้อย",
    }),
    mk(26, {
      recordedBy: "สพ.ว. สมชาย",
      painScore: 3, temp: "103.1", hydration: "7–8%", crt: "2.5", bpSys: "130", bpDia: "85", pulse: "140", resp: "30", oxygen: "3",
      fluidRate: 15, waterIntake: 15,
      uop: 20, fecesScore: 5, vomit: 30, drain: 12,
      food: "ป้อน a/d ทาง tube", foodAmount: "15 ml", feedRoute: "Tube Feed", intakePct: 20,
      note: "ไข้สูง ให้ NSAID · ภาวะขาดน้ำ — เพิ่มอัตราสารน้ำ เฝ้าระวังใกล้ชิด",
    }),
    // 2 วันก่อน
    mk(44, {
      recordedBy: "สพ.ญ. อรพิน",
      painScore: 3, temp: "103.6", hydration: "8–10%", crt: "3", bpSys: "134", bpDia: "88", pulse: "150", resp: "34", oxygen: "4",
      fluidRate: 18, waterIntake: 10,
      uop: 15, fecesScore: 5, vomit: 40, drain: 15,
      food: "ป้อน a/d ทาง tube", foodAmount: "10 ml", feedRoute: "Tube Feed", intakePct: 10,
      note: "อาเจียนซ้ำ ภาวะขาดน้ำชัดเจน — ปรับแผนสารน้ำ + ยาแก้อาเจียน",
    }),
    mk(52, {
      recordedBy: "สพ.ว. สมชาย",
      painScore: 4, temp: "104.0", hydration: ">10%", crt: "3.5", bpSys: "142", bpDia: "92", pulse: "162", resp: "38", oxygen: "5",
      fluidRate: 20, waterIntake: 5,
      uop: 10, fecesScore: 5, vomit: 55, drain: 20,
      food: "งดอาหาร — ป้อนน้ำเกลือแร่", foodAmount: "5 ml", feedRoute: "Syringe Feed", intakePct: 5,
      note: "แรกรับ ICU · อาการวิกฤต ไข้สูง ขาดน้ำรุนแรง ให้ออกซิเจน เฝ้าระวัง 24 ชม.",
    }),
  ];
  return rounds.map((r, i) => ({ ...r, id: 9001 + i }));
};

/* ─── localStorage helpers ─── */
const STORAGE_KEY = "ehp_ipd_state_v13";
const OLD_STORAGE_KEYS = ["ehp_ipd_state_v1", "ehp_ipd_state_v2", "ehp_ipd_state_v3", "ehp_ipd_state_v4", "ehp_ipd_state_v5", "ehp_ipd_state_v6", "ehp_ipd_state_v7", "ehp_ipd_state_v8", "ehp_ipd_state_v9", "ehp_ipd_state_v10", "ehp_ipd_state_v11", "ehp_ipd_state_v12"];
type PersistedState = {
  admits: Admit[];
  cages: Cage[];
  wards: Ward[];
  vitals: VitalSign[];
  io: IntakeOutput[];
  monitorRounds: MonitorRound[];
  nursingNotes: NursingNote[];
  wounds: WoundRecord[];
  feedings: FeedingRecord[];
  labs: LabOrder[];
  imagings: ImagingOrder[];
  drugs: DrugOrder[];
  mar: MARRecord[];
  bills: BillingItem[];
  payments: Payment[];
};

const loadFromStorage = (): Partial<PersistedState> | null => {
  try {
    /* Cleanup old versions */
    OLD_STORAGE_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
const saveToStorage = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
};
const nextId = () => Date.now() + Math.floor(Math.random() * 1000);

/* ─── Context API ─── */
interface IPDContextType {
  /* Core */
  admits: Admit[];
  cages: Cage[];
  addAdmit: (admit: Omit<Admit, "id">) => Admit;
  updateAdmit: (id: number, patch: Partial<Admit>) => void;
  discharge: (id: number, summary?: Partial<Pick<Admit, "dischargeSummary" | "takeHomeMeds" | "followUpDate" | "followUpNote" | "followUpVet" | "followUpTime">>) => void;
  moveCage: (admitId: number, newCageId: string, reason: string) => void;
  addCage: (cage: Cage) => void;
  updateCage: (id: string, patch: Partial<Omit<Cage, "id">>) => void;
  removeCage: (id: string) => void;

  /* Ward management */
  wards: Ward[];
  addWard: (ward: Omit<Ward, "id"> & { id?: string }) => Ward;
  updateWard: (id: string, patch: Partial<Omit<Ward, "id">>) => void;
  removeWard: (id: string) => void;
  toggleWard: (id: string) => void;
  getAdmit: (id: number) => Admit | undefined;
  getCage: (id: string) => Cage | undefined;
  resetData: () => void;

  /* Nursing */
  vitals: VitalSign[];
  addVital: (v: Omit<VitalSign, "id">) => VitalSign;
  updateVital: (id: number, patch: Partial<Omit<VitalSign, "id" | "admitId">>) => void;
  deleteVital: (id: number) => void;
  io: IntakeOutput[];
  addIO: (e: Omit<IntakeOutput, "id">) => IntakeOutput;
  monitorRounds: MonitorRound[];
  addMonitorRound: (r: Omit<MonitorRound, "id">) => MonitorRound;
  updateMonitorRound: (id: number, patch: Partial<Omit<MonitorRound, "id" | "admitId">>) => void;
  deleteMonitorRound: (id: number) => void;
  nursingNotes: NursingNote[];
  addNursingNote: (n: Omit<NursingNote, "id">) => NursingNote;
  updateNursingNote: (id: number, patch: Partial<Omit<NursingNote, "id" | "admitId">>) => void;
  deleteNursingNote: (id: number) => void;
  wounds: WoundRecord[];
  addWound: (w: Omit<WoundRecord, "id">) => WoundRecord;
  updateWound: (id: number, patch: Partial<Omit<WoundRecord, "id" | "admitId">>) => void;
  deleteWound: (id: number) => void;

  /* Feeding */
  feedings: FeedingRecord[];
  addFeeding: (f: Omit<FeedingRecord, "id">) => FeedingRecord;

  /* Lab */
  labs: LabOrder[];
  addLab: (l: Omit<LabOrder, "id">) => LabOrder;
  updateLab: (id: number, patch: Partial<LabOrder>) => void;
  cancelLab: (id: number) => void;

  /* Imaging */
  imagings: ImagingOrder[];
  addImaging: (i: Omit<ImagingOrder, "id">) => ImagingOrder;
  updateImaging: (id: number, patch: Partial<ImagingOrder>) => void;
  cancelImaging: (id: number) => void;

  /* Drugs + MAR */
  drugs: DrugOrder[];
  addDrug: (d: Omit<DrugOrder, "id">) => DrugOrder;
  updateDrug: (id: number, patch: Partial<DrugOrder>) => void;
  discontinueDrug: (id: number) => void;
  mar: MARRecord[];
  addMAR: (m: Omit<MARRecord, "id">) => MARRecord;
  updateMAR: (id: number, patch: Partial<MARRecord>) => void;
  deleteMAR: (id: number) => void;
  administerMAR: (id: number, by: string, note?: string) => void;

  /* Billing */
  bills: BillingItem[];
  addBill: (b: Omit<BillingItem, "id">) => BillingItem;
  updateBill: (id: number, patch: Partial<Omit<BillingItem, "id" | "admitId">>) => void;
  removeBill: (id: number) => void;
  payments: Payment[];
  addPayment: (p: Omit<Payment, "id">) => Payment;
}

const IPDContext = createContext<IPDContextType | null>(null);

export function IPDProvider({ children }: { children: ReactNode }) {
  const persisted = typeof window !== "undefined" ? loadFromStorage() : null;

  const [admits, setAdmits] = useState<Admit[]>(persisted?.admits ?? initialAdmits);
  const _migrated = migrateWardNames(
    (persisted as { wards?: Ward[] })?.wards ?? initialWards,
    persisted?.cages ?? initialCages,
  );
  const [cages, setCages] = useState<Cage[]>(_migrated.cages);
  const [wards, setWards] = useState<Ward[]>(_migrated.wards);
  const [vitals, setVitals] = useState<VitalSign[]>(persisted?.vitals ?? initialVitals);
  const [io, setIO] = useState<IntakeOutput[]>(persisted?.io ?? initialIO);
  const [monitorRounds, setMonitorRounds] = useState<MonitorRound[]>(() => {
    const existing = persisted?.monitorRounds ?? [];
    // ผูกตัวอย่างกับ admit ที่มีบันทึกอยู่แล้ว (ถ้ามี) มิฉะนั้นใช้ผู้ป่วยรายแรก
    const targetAdmit = existing[0]?.admitId ?? (persisted?.admits ?? initialAdmits)[0]?.id ?? 1;
    // เติมเฉพาะ id ตัวอย่างที่ยังไม่มี (idempotent ต่อ id — เพิ่มตัวอย่างใหม่ได้โดยไม่ซ้ำ)
    const existingIds = new Set(existing.map(r => r.id));
    const toAdd = buildSampleRounds(targetAdmit).filter(s => !existingIds.has(s.id));
    return [...toAdd, ...existing];
  });
  const [nursingNotes, setNursingNotes] = useState<NursingNote[]>(persisted?.nursingNotes ?? initialNursingNotes);
  const [wounds, setWounds] = useState<WoundRecord[]>(persisted?.wounds ?? initialWounds);
  const [feedings, setFeedings] = useState<FeedingRecord[]>(persisted?.feedings ?? initialFeedings);
  const [labs, setLabs] = useState<LabOrder[]>(persisted?.labs ?? initialLabs);
  const [imagings, setImagings] = useState<ImagingOrder[]>(persisted?.imagings ?? initialImagings);
  const [drugs, setDrugs] = useState<DrugOrder[]>(persisted?.drugs ?? initialDrugs);
  const [mar, setMAR] = useState<MARRecord[]>(persisted?.mar ?? initialMAR);
  const [bills, setBills] = useState<BillingItem[]>(persisted?.bills ?? initialBills);
  const [payments, setPayments] = useState<Payment[]>(persisted?.payments ?? initialPayments);

  /* persist on every change */
  useEffect(() => {
    saveToStorage({ admits, cages, wards, vitals, io, monitorRounds, nursingNotes, wounds, feedings, labs, imagings, drugs, mar, bills, payments });
  }, [admits, cages, wards, vitals, io, monitorRounds, nursingNotes, wounds, feedings, labs, imagings, drugs, mar, bills, payments]);

  /* ─── Admits ─── */
  const addAdmit = (admit: Omit<Admit, "id">): Admit => {
    const newAdmit: Admit = { ...admit, id: nextId() };
    setAdmits(prev => [newAdmit, ...prev]);
    setCages(prev => prev.map(c => c.id === admit.cageId ? { ...c, status: "occupied", patientId: newAdmit.id } : c));
    return newAdmit;
  };
  const updateAdmit = (id: number, patch: Partial<Admit>) => {
    setAdmits(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  };
  const discharge = (id: number, summary?: Partial<Pick<Admit, "dischargeSummary" | "takeHomeMeds" | "followUpDate" | "followUpNote" | "followUpVet" | "followUpTime">>) => {
    const admit = admits.find(a => a.id === id);
    if (!admit) return;
    setAdmits(prev => prev.map(a => a.id === id
      ? { ...a, ...summary, dischargedAt: new Date().toISOString() }
      : a));
    setCages(prev => prev.map(c => c.id === admit.cageId ? { ...c, status: "cleaning", patientId: undefined } : c));
  };
  const moveCage = (admitId: number, newCageId: string, reason: string) => {
    const admit = admits.find(a => a.id === admitId);
    if (!admit) return;
    const oldCageId = admit.cageId;
    const movedAt = new Date().toISOString();
    setCages(prev => prev.map(c => {
      if (c.id === oldCageId) return { ...c, status: "cleaning", patientId: undefined };
      if (c.id === newCageId) return { ...c, status: "occupied", patientId: admitId };
      return c;
    }));
    setAdmits(prev => prev.map(a => a.id === admitId
      ? {
          ...a,
          cageId: newCageId,
          cageType: cages.find(c => c.id === newCageId)?.type ?? a.cageType,
          cageHistory: [...(a.cageHistory ?? []), { fromCage: oldCageId, toCage: newCageId, reason, movedAt }],
        }
      : a));
  };
  const getAdmit = (id: number) => admits.find(a => a.id === id);
  const getCage = (id: string) => cages.find(c => c.id === id);

  /* ─── Cage management (ward settings) ─── */
  const addCage = (cage: Cage) => setCages(prev => [...prev, cage]);
  const updateCage = (id: string, patch: Partial<Omit<Cage, "id">>) =>
    setCages(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const removeCage = (id: string) =>
    setCages(prev => prev.filter(c => c.id !== id));

  const addWard = (input: Omit<Ward, "id"> & { id?: string }) => {
    const id = (input.id ?? input.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")).slice(0, 40) || `ward-${Date.now()}`;
    const w: Ward = { id, name: input.name, enabled: input.enabled ?? true };
    setWards(prev => [...prev, w]);
    return w;
  };
  const updateWard = (id: string, patch: Partial<Omit<Ward, "id">>) =>
    setWards(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
  const removeWard = (id: string) =>
    setWards(prev => prev.filter(w => w.id !== id));
  const toggleWard = (id: string) =>
    setWards(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAdmits(initialAdmits);
    setCages(initialCages);
    setVitals([]); setIO([]); setMonitorRounds([]); setNursingNotes([]); setWounds([]);
    setFeedings([]); setLabs([]); setImagings([]);
    setDrugs([]); setMAR([]); setBills([]); setPayments([]);
  };

  /* ─── Nursing ─── */
  const addVital = (v: Omit<VitalSign, "id">) => { const n = { ...v, id: nextId() }; setVitals(p => [n, ...p]); return n; };
  const updateVital = (id: number, patch: Partial<Omit<VitalSign, "id" | "admitId">>) => setVitals(p => p.map(v => v.id === id ? { ...v, ...patch } : v));
  const deleteVital = (id: number) => setVitals(p => p.filter(v => v.id !== id));
  const addIO = (e: Omit<IntakeOutput, "id">) => { const n = { ...e, id: nextId() }; setIO(p => [n, ...p]); return n; };
  const addMonitorRound = (r: Omit<MonitorRound, "id">) => { const n = { ...r, id: nextId() }; setMonitorRounds(p => [n, ...p]); return n; };
  const updateMonitorRound = (id: number, patch: Partial<Omit<MonitorRound, "id" | "admitId">>) => setMonitorRounds(p => p.map(r => r.id === id ? { ...r, ...patch } : r));
  const deleteMonitorRound = (id: number) => setMonitorRounds(p => p.filter(r => r.id !== id));
  const addNursingNote = (n: Omit<NursingNote, "id">) => { const x = { ...n, id: nextId() }; setNursingNotes(p => [x, ...p]); return x; };
  const updateNursingNote = (id: number, patch: Partial<Omit<NursingNote, "id" | "admitId">>) => setNursingNotes(p => p.map(n => n.id === id ? { ...n, ...patch } : n));
  const deleteNursingNote = (id: number) => setNursingNotes(p => p.filter(n => n.id !== id));
  const addWound = (w: Omit<WoundRecord, "id">) => { const n = { ...w, id: nextId() }; setWounds(p => [n, ...p]); return n; };
  const updateWound = (id: number, patch: Partial<Omit<WoundRecord, "id" | "admitId">>) => setWounds(p => p.map(w => w.id === id ? { ...w, ...patch } : w));
  const deleteWound = (id: number) => setWounds(p => p.filter(w => w.id !== id));

  /* ─── Feeding ─── */
  const addFeeding = (f: Omit<FeedingRecord, "id">) => { const n = { ...f, id: nextId() }; setFeedings(p => [n, ...p]); return n; };

  /* ─── Lab ─── */
  const addLab = (l: Omit<LabOrder, "id">) => { const n = { ...l, id: nextId() }; setLabs(p => [n, ...p]); return n; };
  const updateLab = (id: number, patch: Partial<LabOrder>) => setLabs(p => p.map(l => l.id === id ? { ...l, ...patch } : l));
  const cancelLab = (id: number) => updateLab(id, { status: "Cancelled" });

  /* ─── Imaging ─── */
  const addImaging = (i: Omit<ImagingOrder, "id">) => { const n = { ...i, id: nextId() }; setImagings(p => [n, ...p]); return n; };
  const updateImaging = (id: number, patch: Partial<ImagingOrder>) => setImagings(p => p.map(i => i.id === id ? { ...i, ...patch } : i));
  const cancelImaging = (id: number) => updateImaging(id, { status: "Cancelled" });

  /* ─── Drugs + MAR ─── */
  const addDrug = (d: Omit<DrugOrder, "id">) => { const n = { ...d, id: nextId() }; setDrugs(p => [n, ...p]); return n; };
  const updateDrug = (id: number, patch: Partial<DrugOrder>) => setDrugs(p => p.map(d => d.id === id ? { ...d, ...patch } : d));
  const discontinueDrug = (id: number) => updateDrug(id, { active: false });
  const addMAR = (m: Omit<MARRecord, "id">) => { const n = { ...m, id: nextId() }; setMAR(p => [n, ...p]); return n; };
  const updateMAR = (id: number, patch: Partial<MARRecord>) => setMAR(p => p.map(m => m.id === id ? { ...m, ...patch } : m));
  const deleteMAR = (id: number) => setMAR(p => p.filter(m => m.id !== id));
  const administerMAR = (id: number, by: string, note?: string) =>
    updateMAR(id, { status: "Administered", administeredAt: new Date().toISOString(), administeredBy: by, note });

  /* ─── Billing ─── */
  const addBill = (b: Omit<BillingItem, "id">) => {
    const n = { ...b, id: nextId() };
    setBills(p => [n, ...p]);
    setAdmits(p => p.map(a => a.id === b.admitId ? { ...a, totalCharge: a.totalCharge + n.total } : a));
    return n;
  };
  const updateBill = (id: number, patch: Partial<Omit<BillingItem, "id" | "admitId">>) => {
    const item = bills.find(b => b.id === id);
    if (!item) return;
    const updated = { ...item, ...patch };
    const delta = updated.total - item.total;
    setBills(p => p.map(b => b.id === id ? updated : b));
    if (delta !== 0) setAdmits(p => p.map(a => a.id === item.admitId ? { ...a, totalCharge: a.totalCharge + delta } : a));
  };
  const removeBill = (id: number) => {
    const item = bills.find(b => b.id === id);
    if (!item) return;
    setBills(p => p.filter(b => b.id !== id));
    setAdmits(p => p.map(a => a.id === item.admitId ? { ...a, totalCharge: a.totalCharge - item.total } : a));
  };
  const addPayment = (p: Omit<Payment, "id">) => {
    const n = { ...p, id: nextId() };
    setPayments(prev => [n, ...prev]);
    setAdmits(prev => prev.map(a => a.id === p.admitId ? { ...a, paid: a.paid + n.amount } : a));
    return n;
  };

  return (
    <IPDContext.Provider value={{
      admits, cages, addAdmit, updateAdmit, discharge, moveCage, addCage, updateCage, removeCage, getAdmit, getCage, resetData,
      wards, addWard, updateWard, removeWard, toggleWard,
      vitals, addVital, updateVital, deleteVital, io, addIO, monitorRounds, addMonitorRound, updateMonitorRound, deleteMonitorRound, nursingNotes, addNursingNote, updateNursingNote, deleteNursingNote, wounds, addWound, updateWound, deleteWound,
      feedings, addFeeding,
      labs, addLab, updateLab, cancelLab,
      imagings, addImaging, updateImaging, cancelImaging,
      drugs, addDrug, updateDrug, discontinueDrug, mar, addMAR, updateMAR, deleteMAR, administerMAR,
      bills, addBill, updateBill, removeBill, payments, addPayment,
    }}>
      {children}
    </IPDContext.Provider>
  );
}

export function useIPD() {
  const ctx = useContext(IPDContext);
  if (!ctx) throw new Error("useIPD must be used within IPDProvider");
  return ctx;
}
