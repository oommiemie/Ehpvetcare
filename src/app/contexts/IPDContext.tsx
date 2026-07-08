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

/* X-Ray / Imaging */
export type ImagingType = "X-Ray" | "Ultrasound" | "CT" | "MRI";
export type ImagingStatus = "Ordered" | "Imaging" | "Completed" | "Cancelled";

export interface ImagingOrder {
  id: number;
  admitId: number;
  orderedAt: string;
  /* ไฟล์แนบ: DICOM (.dcm) หรือภาพถ่ายฟิล์ม */
  attachments?: { name: string; url: string; kind: "dicom" | "image" }[];
  orderedBy: string;
  type: ImagingType;
  position: string;       // ตำแหน่งตรวจ
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
export type BillCategory = "ค่ายา" | "ค่าเวชภัณฑ์" | "ค่าห้อง/กรง" | "ค่าหัตถการ" | "ค่าแพทย์" | "ค่าพยาบาล" | "ค่า Lab" | "ค่า X-Ray" | "อื่นๆ";

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
    id: 1, hn: "HN-2026-001", petName: "บัดดี้", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์",
    photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    cageId: "A-01", cageType: "Small", severity: "Observation",
    diagnosis: "Gastroenteritis", diagnosisCode: "K29.7",
    admitDate: "2026-05-24", admitTime: "10:30",
    doctor: "สพ.ว. สมชาย รักสัตว์", reason: "ซึมเศร้า ไม่กินข้าว 2 วัน",
    belongings: ["อาหารประจำ", "ผ้าห่ม/ที่นอน"], totalCharge: 4200, paid: 2000,
    vitals: { temp: "38.5", pulse: "120", resp: "24" },
    hasPendingLab: true, consentSigned: true,
  },
  {
    id: 2, hn: "HN-2026-014", petName: "มิ้ว", species: "แมว", breed: "Scottish Fold",
    photo: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=200&q=80",
    owner: "วรรณา ศรีสุข", ownerPhone: "089-876-5432",
    cageId: "A-02", cageType: "Small", severity: "Recovering",
    diagnosis: "Post-spay recovery", admitDate: "2026-05-25", admitTime: "09:00",
    doctor: "สพ.ว. สุภา มีสุข", reason: "พักฟื้นหลังทำหมัน",
    belongings: ["ของเล่น"], totalCharge: 3800, paid: 3800, consentSigned: true,
    vitals: { temp: "38.2", pulse: "140", resp: "28" },
  },
  {
    id: 3, hn: "HN-2026-003", petName: "แม็กซ์", species: "สุนัข", breed: "แบล็ก แลบราดอร์",
    photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80",
    owner: "ประพันธ์ มงคล", ownerPhone: "062-111-2233",
    cageId: "B-01", cageType: "Medium", severity: "Observation",
    diagnosis: "CKD Stage 2", diagnosisCode: "N18.2", admitDate: "2026-05-23", admitTime: "14:15",
    doctor: "สพ.ว. สมชาย รักสัตว์", reason: "ภาวะไตเสื่อมเฉียบพลัน",
    belongings: ["อาหารประจำ", "ยาเดิม"], totalCharge: 7200, paid: 4000, consentSigned: true,
    vitals: { temp: "38.0", pulse: "100", resp: "20" },
    hasPendingMed: true,
  },
  {
    id: 4, hn: "HN-2026-008", petName: "ร็อคกี้", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์",
    photo: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=200&q=80",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    cageId: "B-02", cageType: "Medium", severity: "Recovering",
    diagnosis: "Post-op orthopedic", admitDate: "2026-05-22", admitTime: "16:00",
    doctor: "สพ.ว. ปรีชา", reason: "พักฟื้นหลังผ่าตัดสะโพก",
    belongings: ["ผ้าห่ม/ที่นอน", "อาหารประจำ"], totalCharge: 18500, paid: 10000, consentSigned: true,
  },
  {
    id: 5, hn: "HN-2026-011", petName: "ชาร์ลี", species: "สุนัข", breed: "บีเกิ้ล",
    photo: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&q=80",
    owner: "ธีรพล วงศ์สุวรรณ", ownerPhone: "085-777-8899",
    cageId: "B-04", cageType: "Medium", severity: "Observation",
    diagnosis: "Dermatitis", diagnosisCode: "L30.9", admitDate: "2026-05-25", admitTime: "11:30",
    doctor: "สพ.ว. นภา", reason: "ผิวหนังอักเสบรุนแรง",
    belongings: ["ยาเดิม"], totalCharge: 2800, paid: 2800, consentSigned: true,
  },
  {
    id: 6, hn: "HN-2026-013", petName: "เบลล่า", species: "สุนัข", breed: "ลาบราดอร์",
    photo: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200&q=80",
    owner: "ปรียาภรณ์ ทองดี", ownerPhone: "094-321-6543",
    cageId: "C-01", cageType: "Large", severity: "Recovering",
    diagnosis: "Post C-section", admitDate: "2026-05-24", admitTime: "08:00",
    doctor: "สพ.ว. สุภา มีสุข", reason: "หลังผ่าคลอด",
    belongings: ["ผ้าห่ม/ที่นอน"], totalCharge: 12500, paid: 8000, consentSigned: true,
  },
  {
    id: 7, hn: "HN-2026-002", petName: "ลูน่า", species: "แมว", breed: "เปอร์เซีย",
    photo: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&q=80",
    owner: "วรรณา ศรีสุข", ownerPhone: "089-876-5432",
    cageId: "C-03", cageType: "Large", severity: "Observation",
    diagnosis: "Hypertension", diagnosisCode: "I10", admitDate: "2026-05-23", admitTime: "13:00",
    doctor: "สพ.ว. สุภา มีสุข", reason: "ความดันโลหิตสูง ติดตามอาการ",
    belongings: ["ยาเดิม", "ของเล่น"], totalCharge: 5500, paid: 5500, consentSigned: true,
  },
  {
    id: 8, hn: "HN-2026-004", petName: "ทวีป", species: "นก", breed: "คอกคาเทล",
    photo: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200&q=80",
    owner: "นภาพร รุ่งเรือง", ownerPhone: "091-555-7788",
    cageId: "ICU-1", cageType: "ICU", severity: "Critical",
    diagnosis: "Respiratory distress", diagnosisCode: "J96.0", admitDate: "2026-05-25", admitTime: "06:30",
    doctor: "สพ.ว. สมชาย รักสัตว์", reason: "หายใจลำบาก ต้องการ ICU monitoring",
    belongings: [], totalCharge: 8200, paid: 5000, consentSigned: true,
    hasPendingLab: true, hasPendingMed: true,
  },
  {
    id: 9, hn: "HN-2026-009", petName: "โมจิ", species: "แมว", breed: "เมนคูน",
    photo: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&q=80",
    owner: "ประพันธ์ มงคล", ownerPhone: "062-111-2233",
    cageId: "ICU-2", cageType: "ICU", severity: "Critical",
    diagnosis: "Pancreatitis", diagnosisCode: "K85", admitDate: "2026-05-24", admitTime: "22:15",
    doctor: "สพ.ว. ปรีชา", reason: "ตับอ่อนอักเสบเฉียบพลัน",
    belongings: [], totalCharge: 14700, paid: 8000, consentSigned: true,
    hasPendingMed: true,
  },
  {
    id: 10, hn: "HN-2026-007", petName: "เร็กซ์", species: "สัตว์เลื้อยคลาน", breed: "อีกัวน่า",
    photo: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=200&q=80",
    owner: "ธนากร ชัยชนะ", ownerPhone: "094-882-0033",
    cageId: "ISO-1", cageType: "Isolation", severity: "Isolation",
    diagnosis: "Suspected Salmonella", diagnosisCode: "A02.9", admitDate: "2026-05-25", admitTime: "15:00",
    doctor: "สพ.ว. สมชาย รักสัตว์", reason: "สงสัยติดเชื้อ Salmonella รอผล Culture",
    belongings: [], totalCharge: 3500, paid: 3500, consentSigned: true,
    hasPendingLab: true,
  },
  {
    id: 11, hn: "HN-2026-006", petName: "ทองคำ", species: "ปลา", breed: "Oranda",
    photo: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&q=80",
    owner: "กิตติพงษ์ วงษ์ทอง", ownerPhone: "086-447-2211",
    cageId: "OX-1", cageType: "Oxygen", severity: "Critical",
    diagnosis: "Hypoxia", diagnosisCode: "R09.02", admitDate: "2026-05-24", admitTime: "19:45",
    doctor: "สพ.ว. นภา", reason: "ขาดออกซิเจน ต้องการตู้เพิ่มออกซิเจน",
    belongings: [], totalCharge: 4800, paid: 4800, consentSigned: true,
  },
  /* ─── Past discharged admits (for cross-visit history lookup) ─── */
  {
    id: 100, hn: "HN-2026-001", petName: "บัดดี้", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์",
    photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    cageId: "A-01", cageType: "Small", severity: "Recovering",
    diagnosis: "Annual checkup + Vaccine", admitDate: "2026-02-14", admitTime: "10:00",
    doctor: "สพ.ว. สมชาย รักสัตว์", reason: "ตรวจสุขภาพประจำปี",
    belongings: [], totalCharge: 3200, paid: 3200, consentSigned: true,
    dischargedAt: "2026-02-15T16:00:00",
  },
  {
    id: 101, hn: "HN-2026-001", petName: "บัดดี้", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์",
    photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    cageId: "A-02", cageType: "Small", severity: "Observation",
    diagnosis: "Acute GI upset", diagnosisCode: "K29.7", admitDate: "2025-11-22", admitTime: "14:30",
    doctor: "สพ.ว. สุภา มีสุข", reason: "ท้องเสีย อาเจียน",
    belongings: [], totalCharge: 5400, paid: 5400, consentSigned: true,
    dischargedAt: "2025-11-25T11:00:00",
  },
  {
    id: 102, hn: "HN-2026-001", petName: "บัดดี้", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์",
    photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    cageId: "B-01", cageType: "Medium", severity: "Observation",
    diagnosis: "Suspected tick-borne disease", admitDate: "2025-08-05", admitTime: "09:30",
    doctor: "สพ.ว. ปรีชา", reason: "ซึม มีไข้ ตรวจ Babesia/Ehrlichia",
    belongings: [], totalCharge: 6800, paid: 6800, consentSigned: true,
    dischargedAt: "2025-08-07T15:30:00",
  },
];

/* ─── Initial labs — past results for history demo ─── */
const initialLabs: LabOrder[] = [
  // Annual checkup (admit 100) — 2026-02
  {
    id: 9001, admitId: 100, orderedAt: "2026-02-14T10:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "CBC", priority: "Routine", status: "Completed",
    reason: "ตรวจสุขภาพประจำปี",
    result: "WBC 8.5 (ปกติ), RBC 6.8 (ปกติ), HCT 45% (ปกติ), PLT 280k (ปกติ) — ค่าทุกอย่างอยู่ในเกณฑ์ปกติ",
    completedAt: "2026-02-14T14:00:00",
  },
  {
    id: 9002, admitId: 100, orderedAt: "2026-02-14T10:35:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    labType: "Blood Chemistry", priority: "Routine", status: "Completed",
    reason: "ตรวจค่าตับ ไต ประจำปี",
    result: "ALT 42, AST 28, BUN 18, Cre 1.1, ALP 95 — ทุกค่าอยู่ในเกณฑ์ปกติ",
    completedAt: "2026-02-14T15:30:00",
  },
  // GI upset (admit 101) — 2025-11
  {
    id: 9003, admitId: 101, orderedAt: "2025-11-22T15:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    labType: "CBC", priority: "STAT", status: "Completed",
    reason: "สงสัยติดเชื้อ มีไข้",
    result: "WBC 18.2 (สูง) — Leukocytosis with left shift, สงสัยติดเชื้อแบคทีเรีย",
    completedAt: "2025-11-22T17:30:00",
  },
  {
    id: 9004, admitId: 101, orderedAt: "2025-11-23T08:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    labType: "Blood Chemistry", priority: "Routine", status: "Completed",
    reason: "ติดตามค่า electrolyte หลังขาดน้ำ",
    result: "Na 138, K 3.2 (ต่ำ), Cl 108, BUN 28 (สูงเล็กน้อย จากภาวะขาดน้ำ)",
    completedAt: "2025-11-23T11:00:00",
  },
  {
    id: 9005, admitId: 101, orderedAt: "2025-11-23T08:05:00", orderedBy: "สพ.ว. สุภา มีสุข",
    labType: "Urinalysis", priority: "Routine", status: "Completed",
    reason: "ตรวจสีและความเข้มข้นของปัสสาวะ",
    result: "USG 1.045 (เข้มข้น) — สอดคล้องกับภาวะขาดน้ำ, ไม่พบโปรตีน/เม็ดเลือดผิดปกติ",
    completedAt: "2025-11-23T13:00:00",
  },
  // Tick-borne (admit 102) — 2025-08
  {
    id: 9006, admitId: 102, orderedAt: "2025-08-05T10:00:00", orderedBy: "สพ.ว. ปรีชา",
    labType: "CBC", priority: "STAT", status: "Completed",
    reason: "สงสัย Tick-borne disease",
    result: "PLT 95k (ต่ำมาก) — Thrombocytopenia รุนแรง สงสัย Ehrlichia/Babesia",
    completedAt: "2025-08-05T12:30:00",
  },
  {
    id: 9007, admitId: 102, orderedAt: "2025-08-05T10:05:00", orderedBy: "สพ.ว. ปรีชา",
    labType: "Cytology", priority: "Routine", status: "Completed",
    reason: "ส่องหา intracellular organism ใน blood smear",
    result: "พบ Ehrlichia morulae ใน monocyte — ยืนยัน Canine Monocytic Ehrlichiosis (CME)",
    completedAt: "2025-08-06T09:00:00",
  },
];

/* ─── Initial imaging — past results for history demo ─── */
const initialImagings: ImagingOrder[] = [
  // Annual checkup (admit 100) — 2026-02
  {
    id: 8001, admitId: 100, orderedAt: "2026-02-14T11:00:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    type: "X-Ray", position: "Thorax (lateral + VD)",
    reason: "ตรวจสุขภาพประจำปี — สแกนทรวงอก", status: "Completed",
    findings: "ปอดทั้งสองข้างใส ไม่พบจุดผิดปกติ หัวใจขนาดปกติ (VHS 9.5) — ไม่พบความผิดปกติ",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    completedAt: "2026-02-14T13:30:00",
  },
  // GI upset (admit 101) — 2025-11
  {
    id: 8002, admitId: 101, orderedAt: "2025-11-22T16:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    type: "X-Ray", position: "Abdomen (lateral + VD)",
    reason: "อาเจียน ท้องเสีย — แยก obstruction vs gastritis", status: "Completed",
    findings: "ลำไส้มี gas-distention เล็กน้อย ไม่พบ foreign body หรือ obstruction — สอดคล้องกับ acute gastroenteritis",
    imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    completedAt: "2025-11-22T17:00:00",
  },
  {
    id: 8003, admitId: 101, orderedAt: "2025-11-23T10:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    type: "Ultrasound", position: "Abdomen — Liver, GB, GI",
    reason: "ติดตามภาวะลำไส้ + ตรวจตับ", status: "Completed",
    findings: "ผนังลำไส้หนาเล็กน้อย (3.2mm) ลักษณะ inflammatory pattern · ตับและถุงน้ำดีปกติ",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80",
    completedAt: "2025-11-23T12:00:00",
  },
  // Tick-borne (admit 102) — 2025-08
  {
    id: 8004, admitId: 102, orderedAt: "2025-08-05T11:00:00", orderedBy: "สพ.ว. ปรีชา",
    type: "Ultrasound", position: "Spleen + Lymph nodes",
    reason: "ตรวจม้ามและต่อมน้ำเหลือง — สงสัย Ehrlichia", status: "Completed",
    findings: "ม้ามโต (splenomegaly) มี hypoechoic pattern กระจาย · ต่อมน้ำเหลือง mesenteric โตเล็กน้อย — สอดคล้องกับ tick-borne disease",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    completedAt: "2025-08-05T13:00:00",
  },
];

/* ─── Initial drug orders — past prescriptions for history demo ─── */
const initialDrugs: DrugOrder[] = [
  // Annual checkup (admit 100) — 2026-02
  {
    id: 7001, admitId: 100, orderedAt: "2026-02-14T11:30:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "Bravecto", strength: "1000mg", dose: "1 เม็ด", route: "PO", frequency: "Once",
    durationDays: 90, isPRN: false, isContinuous: false,
    note: "ป้องกันเห็บ-หมัด รอบถัดไป 14 พ.ค. 2569", active: false,
  },
  {
    id: 7002, admitId: 100, orderedAt: "2026-02-14T11:35:00", orderedBy: "สพ.ว. สมชาย รักสัตว์",
    drugName: "NexGard Spectra", strength: "1 เม็ด", dose: "1 เม็ด", route: "PO", frequency: "Once",
    durationDays: 30, isPRN: false, isContinuous: false,
    note: "ถ่ายพยาธิหัวใจ + พยาธิภายใน", active: false,
  },
  // GI upset (admit 101) — 2025-11
  {
    id: 7003, admitId: 101, orderedAt: "2025-11-22T15:30:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Maropitant (Cerenia)", strength: "10mg/ml", dose: "1mg/kg",
    route: "SC", frequency: "q24h", durationDays: 3, isPRN: false, isContinuous: false,
    note: "Antiemetic ก่อนให้อาหาร", active: false,
  },
  {
    id: 7004, admitId: 101, orderedAt: "2025-11-22T15:35:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Amoxicillin/Clavulanate", strength: "62.5mg/ml", dose: "12.5mg/kg",
    route: "PO", frequency: "q12h", durationDays: 7, isPRN: false, isContinuous: false,
    note: "ครอบคลุมเชื้อแบคทีเรียในลำไส้", active: false,
  },
  {
    id: 7005, admitId: 101, orderedAt: "2025-11-22T15:40:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "LRS (Lactated Ringer's)", dose: "60 ml/kg/day",
    route: "IV", frequency: "Continuous", isPRN: false, isContinuous: true,
    note: "ทดแทนน้ำที่สูญเสียจากอาเจียน/ท้องเสีย", active: false,
  },
  {
    id: 7006, admitId: 101, orderedAt: "2025-11-23T09:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Metronidazole", strength: "50mg/ml", dose: "15mg/kg",
    route: "IV", frequency: "q12h", durationDays: 5, isPRN: false, isContinuous: false,
    note: "ครอบคลุม anaerobe + antiprotozoal", active: false,
  },
  // Tick-borne (admit 102) — 2025-08
  {
    id: 7007, admitId: 102, orderedAt: "2025-08-05T13:30:00", orderedBy: "สพ.ว. ปรีชา",
    drugName: "Doxycycline", strength: "100mg", dose: "10mg/kg",
    route: "PO", frequency: "q24h", durationDays: 28, isPRN: false, isContinuous: false,
    note: "First-line สำหรับ Ehrlichia — เน้นกินสม่ำเสมอ 28 วัน", active: false,
  },
  {
    id: 7008, admitId: 102, orderedAt: "2025-08-05T13:35:00", orderedBy: "สพ.ว. ปรีชา",
    drugName: "Prednisolone", strength: "5mg", dose: "0.5mg/kg",
    route: "PO", frequency: "q12h", durationDays: 7, isPRN: false, isContinuous: false,
    isControlled: false,
    note: "Taper หลัง PLT ขึ้น", active: false,
  },

  /* ─── Active orders — มิ้ว (HN-2026-014, admit 2) · Post-spay recovery
       Ordered 2 days ago (2026-06-03) so durations are still in range on today (2026-06-05 = Day 3) ─── */
  {
    id: 8001, admitId: 2, orderedAt: "2026-06-03T09:30:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Meloxicam (Metacam)", strength: "5mg/ml", dose: "0.1mg/kg",
    route: "SC", frequency: "q24h", durationDays: 5, isPRN: false, isContinuous: false,
    note: "NSAID — ลดปวดและบวมหลังผ่าตัด", active: true,
    qtyRequested: 5, qtyDispensed: 5, qtyUnit: "dose", pricePerUnit: 90,
  },
  {
    id: 8002, admitId: 2, orderedAt: "2026-06-03T09:35:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Buprenorphine", strength: "0.3mg/ml", dose: "0.02mg/kg",
    route: "IM", frequency: "q8h", durationDays: 5, isPRN: false, isContinuous: false,
    isControlled: true,
    note: "Opioid analgesia — เน้น 48 ชม.แรก", active: true,
    qtyRequested: 15, qtyDispensed: 15, qtyUnit: "dose", pricePerUnit: 60,
  },
  {
    id: 8003, admitId: 2, orderedAt: "2026-06-03T09:40:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Amoxicillin/Clavulanate", strength: "62.5mg/ml", dose: "12.5mg/kg",
    route: "PO", frequency: "q12h", durationDays: 7, isPRN: false, isContinuous: false,
    note: "ป้องกันการติดเชื้อแผลผ่าตัด", active: true,
    qtyRequested: 14, qtyDispensed: 14, qtyUnit: "dose", pricePerUnit: 35,
  },
  {
    id: 8004, admitId: 2, orderedAt: "2026-06-03T09:00:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "LRS (Lactated Ringer's)", dose: "3 ml/kg/hr",
    route: "IV", frequency: "Continuous", isPRN: false, isContinuous: true,
    note: "รักษาสารน้ำหลังผ่าตัด · หยุดเมื่อกินน้ำเองได้", active: true,
  },
  {
    id: 8005, admitId: 2, orderedAt: "2026-06-03T09:45:00", orderedBy: "สพ.ว. สุภา มีสุข",
    drugName: "Maropitant (Cerenia)", strength: "10mg/ml", dose: "1mg/kg",
    route: "SC", frequency: "PRN", isPRN: true, isContinuous: false,
    note: "PRN เมื่ออาเจียน — ห้ามให้ถี่กว่า q12h", active: true,
  },
];

/* ─── Initial MAR records — schedule for มิ้ว's drugs for today (2026-06-05)
       Some marked Given to show ✓ chips ─── */
const initialMAR: MARRecord[] = [
  // Meloxicam q24h — 1 dose/day at 08:00
  { id: 9101, drugOrderId: 8001, scheduledAt: "2026-06-05T08:00:00", status: "Administered",
    administeredAt: "2026-06-05T08:05:00", administeredBy: "พว. ธิดา" },
  // Buprenorphine q8h — 06:00, 14:00, 22:00
  { id: 9102, drugOrderId: 8002, scheduledAt: "2026-06-05T06:00:00", status: "Administered",
    administeredAt: "2026-06-05T06:10:00", administeredBy: "พว. ธิดา" },
  { id: 9103, drugOrderId: 8002, scheduledAt: "2026-06-05T14:00:00", status: "Pending" },
  { id: 9104, drugOrderId: 8002, scheduledAt: "2026-06-05T22:00:00", status: "Pending" },
  // Amoxicillin q12h — 08:00, 20:00
  { id: 9105, drugOrderId: 8003, scheduledAt: "2026-06-05T08:00:00", status: "Administered",
    administeredAt: "2026-06-05T08:15:00", administeredBy: "พว. ธิดา" },
  { id: 9106, drugOrderId: 8003, scheduledAt: "2026-06-05T20:00:00", status: "Pending" },
];

/* ─── Initial payments — past payment history for billing demo ─── */
const initialPayments: Payment[] = [
  { id: 6001, admitId: 100, paidAt: "2026-02-15T15:30:00", amount: 1500, method: "Card", note: "บัตรเครดิต •••• 4521" },
  { id: 6002, admitId: 100, paidAt: "2026-02-15T15:35:00", amount: 1700, method: "Cash", note: "ชำระยอดคงเหลือ" },
  { id: 6003, admitId: 101, paidAt: "2025-11-23T10:00:00", amount: 3000, method: "Transfer", note: "ชำระมัดจำ" },
  { id: 6004, admitId: 101, paidAt: "2025-11-25T11:00:00", amount: 2400, method: "Card", note: "ชำระก่อน Discharge" },
  { id: 6005, admitId: 102, paidAt: "2025-08-05T16:00:00", amount: 4000, method: "Transfer", note: "ชำระมัดจำเริ่มต้น" },
  { id: 6006, admitId: 102, paidAt: "2025-08-07T15:00:00", amount: 2800, method: "Cash", note: "ชำระก่อนกลับบ้าน" },
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
const STORAGE_KEY = "ehp_ipd_state_v11";
const OLD_STORAGE_KEYS = ["ehp_ipd_state_v1", "ehp_ipd_state_v2", "ehp_ipd_state_v3", "ehp_ipd_state_v4", "ehp_ipd_state_v5", "ehp_ipd_state_v6", "ehp_ipd_state_v7", "ehp_ipd_state_v8", "ehp_ipd_state_v9", "ehp_ipd_state_v10"];
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
  const [vitals, setVitals] = useState<VitalSign[]>(persisted?.vitals ?? []);
  const [io, setIO] = useState<IntakeOutput[]>(persisted?.io ?? []);
  const [monitorRounds, setMonitorRounds] = useState<MonitorRound[]>(() => {
    const existing = persisted?.monitorRounds ?? [];
    // ผูกตัวอย่างกับ admit ที่มีบันทึกอยู่แล้ว (ถ้ามี) มิฉะนั้นใช้ผู้ป่วยรายแรก
    const targetAdmit = existing[0]?.admitId ?? (persisted?.admits ?? initialAdmits)[0]?.id ?? 1;
    // เติมเฉพาะ id ตัวอย่างที่ยังไม่มี (idempotent ต่อ id — เพิ่มตัวอย่างใหม่ได้โดยไม่ซ้ำ)
    const existingIds = new Set(existing.map(r => r.id));
    const toAdd = buildSampleRounds(targetAdmit).filter(s => !existingIds.has(s.id));
    return [...toAdd, ...existing];
  });
  const [nursingNotes, setNursingNotes] = useState<NursingNote[]>(persisted?.nursingNotes ?? []);
  const [wounds, setWounds] = useState<WoundRecord[]>(persisted?.wounds ?? []);
  const [feedings, setFeedings] = useState<FeedingRecord[]>(persisted?.feedings ?? []);
  const [labs, setLabs] = useState<LabOrder[]>(persisted?.labs ?? initialLabs);
  const [imagings, setImagings] = useState<ImagingOrder[]>(persisted?.imagings ?? initialImagings);
  const [drugs, setDrugs] = useState<DrugOrder[]>(persisted?.drugs ?? initialDrugs);
  const [mar, setMAR] = useState<MARRecord[]>(persisted?.mar ?? initialMAR);
  const [bills, setBills] = useState<BillingItem[]>(persisted?.bills ?? []);
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
