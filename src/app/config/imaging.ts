/* ─────────────────────────────────────────────────────────────
   แคตตาล็อกงานภาพวินิจฉัย (Medical Imaging)

   ตาม feedback จากคุณหมอ — รายการ imaging แบ่งได้หลายมิติพร้อมกัน
     1) วิธีตรวจ (modality)  — X-ray · Ultrasound · Echo · CT · MRI
     2) บริเวณ (region)      — หัว · ช่องอก · ช่องท้อง · ขาหน้า · ขาหลัง …
     3) ท่า (view)           — ท่าถ่ายตามหลักรังสีวิทยาสัตว์ เลือกได้หลายท่า
     4) ด้าน (side)          — ซ้าย/ขวา/สองข้าง เฉพาะอวัยวะที่มีคู่
     5) เทคนิค (technique)   — ธรรมดา · ฉีดสี · กลืนแป้ง · Doppler …

   ชื่อท่าใช้ศัพท์รังสีวิทยาสัตว์จริง (CrCd/CdCr/ML/VD/DV) ไม่ใช่ AP/PA
   ของคน เพราะสัตว์สี่ขาอ้างอิงแกนลำตัวคนละแบบ
   ───────────────────────────────────────────────────────────── */

export interface ImagingRegion {
  key: string;
  label: string;
  /** อวัยวะที่มีซ้าย-ขวา → ต้องระบุด้าน */
  paired?: boolean;
  /** ท่าที่ใช้กับบริเวณนี้ — ว่าง = บริเวณนี้ไม่ต้องเลือกท่า (เช่น Ultrasound) */
  views: string[];
}

export interface ImagingModality {
  key: string;
  label: string;
  /** ชื่อขึ้นต้นเวลาประกอบชื่อรายการ เช่น "X-ray ช่องอก" */
  prefix: string;
  color: string;
  regions: ImagingRegion[];
  techniques: string[];
}

/* ท่ามาตรฐานของลำตัว — ใช้ซ้ำหลายบริเวณ */
const TRUNK_VIEWS = ["Right Lateral", "Left Lateral", "VD (หงาย)", "DV (คว่ำ)"];
/* ท่ามาตรฐานของขา — CrCd = ขาหน้า, CdCr = ขาหลัง */
const FORELIMB_VIEWS = ["CrCd (หน้า-หลัง)", "Mediolateral", "Oblique", "งอข้อ (Flexed)", "เหยียดข้อ (Extended)"];
const HINDLIMB_VIEWS = ["CdCr (หลัง-หน้า)", "Mediolateral", "Oblique", "งอข้อ (Flexed)", "เหยียดข้อ (Extended)"];

export const IMAGING_MODALITIES: ImagingModality[] = [
  {
    key: "xray",
    label: "X-ray",
    prefix: "X-ray",
    color: "#3b82f6",
    techniques: [
      "ธรรมดา (Plain)",
      "ฉีดสี (Contrast)",
      "กลืนแป้ง (Barium swallow)",
      "สวนแป้ง (Barium enema)",
      "ฉีดสีดูไต (IVP)",
      "ฉีดสีกระเพาะปัสสาวะ (Cystography)",
      "ฉีดสีไขสันหลัง (Myelography)",
    ],
    regions: [
      { key: "thorax",   label: "ช่องอก",         views: TRUNK_VIEWS },
      { key: "abdomen",  label: "ช่องท้อง",       views: [...TRUNK_VIEWS, "ยืน (Horizontal beam)"] },
      { key: "skull",    label: "หัว / กะโหลก",   views: ["Lateral", "DV (คว่ำ)", "VD (หงาย)", "Oblique", "อ้าปาก (Rostrocaudal)"] },
      { key: "spine-c",  label: "กระดูกคอ",       views: ["Lateral", "VD (หงาย)", "งอคอ (Flexed)", "แหงนคอ (Extended)"] },
      { key: "spine-tl", label: "กระดูกอก-เอว",   views: ["Lateral", "VD (หงาย)"] },
      { key: "spine-ls", label: "กระดูกเอว-ก้นกบ", views: ["Lateral", "VD (หงาย)"] },
      { key: "pelvis",   label: "เชิงกราน / สะโพก", views: ["VD เหยียดขา (Hip dysplasia)", "VD ท่ากบ (Frog-leg)", "Lateral"] },
      { key: "forelimb", label: "ขาหน้า",  paired: true, views: FORELIMB_VIEWS },
      { key: "hindlimb", label: "ขาหลัง",  paired: true, views: HINDLIMB_VIEWS },
      { key: "dental",   label: "ฟัน",             views: ["ทั้งปาก (Full mouth)", "Bisecting angle", "Parallel technique"] },
    ],
  },
  {
    key: "ultrasound",
    label: "Ultrasound",
    prefix: "Ultrasound",
    color: "#8b5cf6",
    techniques: ["B-mode (ธรรมดา)", "Doppler สี", "Doppler สเปกตรัม", "ฉีดสาร contrast"],
    regions: [
      { key: "abdomen-full", label: "ช่องท้องทั้งหมด",      views: [] },
      { key: "liver",        label: "ตับ & ถุงน้ำดี",        views: [] },
      { key: "urinary",      label: "ไต & ทางเดินปัสสาวะ",   views: [] },
      { key: "pregnancy",    label: "ตรวจการตั้งท้อง",       views: [] },
      { key: "repro",        label: "มดลูก / ต่อมลูกหมาก",   views: [] },
      { key: "eye",          label: "ตา", paired: true,      views: [] },
      { key: "fast",         label: "FAST scan (ฉุกเฉิน)",   views: [] },
    ],
  },
  {
    key: "echo",
    label: "Echo (หัวใจ)",
    prefix: "Echo",
    color: "#ec4899",
    techniques: ["2D + M-mode", "Doppler สี", "Doppler สเปกตรัม", "ครบชุด (Full study)"],
    regions: [
      { key: "heart", label: "หัวใจ", views: ["Right parasternal long axis", "Right parasternal short axis", "Left apical 4-chamber", "Left apical 5-chamber"] },
    ],
  },
  {
    key: "ct",
    label: "CT scan",
    prefix: "CT",
    color: "#f59e0b",
    techniques: ["ไม่ฉีดสี (Non-contrast)", "ฉีดสี (Contrast)", "ก่อน-หลังฉีดสี"],
    regions: [
      { key: "head",     label: "หัว / สมอง",   views: [] },
      { key: "thorax",   label: "ช่องอก",       views: [] },
      { key: "abdomen",  label: "ช่องท้อง",     views: [] },
      { key: "skeletal", label: "กระดูก / ข้อ", paired: true, views: [] },
      { key: "whole",    label: "ทั้งตัว",      views: [] },
    ],
  },
  {
    key: "mri",
    label: "MRI",
    prefix: "MRI",
    color: "#14b8a6",
    techniques: ["T1", "T2", "FLAIR", "ฉีดสี (Gadolinium)"],
    regions: [
      { key: "brain", label: "สมอง",           views: [] },
      { key: "spine", label: "ไขสันหลัง",       views: [] },
      { key: "joint", label: "ข้อ", paired: true, views: [] },
    ],
  },
];

/** ด้านที่เลือกได้ — ใช้เฉพาะบริเวณที่ paired */
export const IMAGING_SIDES = ["ซ้าย", "ขวา", "ทั้งสองข้าง"] as const;

export const modalityByKey = (k: string) => IMAGING_MODALITIES.find(m => m.key === k);
export const regionByKey = (mk: string, rk: string) => modalityByKey(mk)?.regions.find(r => r.key === rk);

/** ประกอบชื่อรายการที่อ่านรู้เรื่องในบรรทัดเดียว
 *  เช่น "X-ray ขาหน้า (ขวา) — CrCd + Mediolateral · ฉีดสี" */
export function buildExamName(o: {
  modality: string; region: string; views: string[]; side?: string; technique?: string;
}): string {
  const m = modalityByKey(o.modality);
  const r = regionByKey(o.modality, o.region);
  if (!m || !r) return "";
  let s = `${m.prefix} ${r.label}`;
  if (r.paired && o.side) s += ` (${o.side})`;
  if (o.views.length) s += ` — ${o.views.join(" + ")}`;
  /* เทคนิคธรรมดาไม่ต้องเขียน — เขียนเฉพาะที่ต่างจากปกติ จะได้อ่านไว */
  if (o.technique && !/^(ธรรมดา|B-mode|ไม่ฉีดสี)/.test(o.technique)) s += ` · ${o.technique}`;
  return s;
}
