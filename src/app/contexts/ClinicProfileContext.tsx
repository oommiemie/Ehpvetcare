/* ─────────────────────────────────────────────────────────────
   ข้อมูลคลินิก — ผูกกับบัญชีผู้ใช้ที่ล็อกอิน

   ผู้ใช้ 1 คนสังกัด 1 คลินิก (AuthUser.clinicId)
   ล็อกอินด้วยบัญชีคนละคลินิก → หน้าแดชบอร์ดและตั้งค่าจะเปลี่ยนตาม

   แก้ได้เฉพาะ "โลโก้" เท่านั้น — ชื่อคลินิก รหัส เลขที่ใบอนุญาต ฯลฯ
   เป็นข้อมูลทะเบียนที่ต้องแก้จากระบบส่วนกลาง ไม่ใช่แก้เองในแอป

   โลโก้เป็น 3 สถานะ (เก็บใน localStorage แยกตามรหัสคลินิก)
     ไม่มีคีย์  → ใช้โลโก้ตัวอย่างที่มากับข้อมูลคลินิก
     data URL  → โลโก้ที่ผู้ใช้อัปโหลดเอง
     ""        → ผู้ใช้กดลบ = ไม่มีโลโก้จริง ๆ ต้องแสดงกล่องขาวเปล่า

   ที่ต้องแยก "" ออกจาก "ไม่มีคีย์" เพราะถ้าลบแล้วเด้งกลับไปใช้ตัวอย่าง
   ผู้ใช้จะลบโลโก้ไม่ได้เลย
   ───────────────────────────────────────────────────────────── */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import ehpLogo from "@/assets/EHPlogo.png";

export interface ClinicProfile {
  id: string;
  hospitalCode: string;   // รหัสสถานพยาบาล
  type: string;           // ประเภท — คลินิก / โรงพยาบาลสัตว์
  name: string;           // ชื่อหน่วยงาน
  addressExtra: string;   // ที่อยู่เพิ่มเติม (บ้านเลขที่ หมู่บ้าน ถนน)
  province: string;       // จังหวัด
  district: string;       // อำเภอ / เขต
  subDistrict: string;    // ตำบล / แขวง
  postcode: string;       // รหัส ปณ
  licenseNo: string;      // เลขที่ใบอนุญาต
  phone: string;          // หมายเลขโทรศัพท์
  active: boolean;        // สถานะการใช้งาน
  logo: string;           // โลโก้ตัวอย่างของคลินิกนี้ — "" = ไม่มี
}

export const CLINICS: Record<string, ClinicProfile> = {
  "ehp-01": {
    id: "ehp-01",
    hospitalCode: "10015",
    type: "โรงพยาบาลสัตว์",
    name: "โรงพยาบาลสัตว์ อีเอชพี",
    addressExtra: "128/9 ถนนพระราม 9",
    province: "กรุงเทพมหานคร",
    district: "เขตห้วยขวาง",
    subDistrict: "ห้วยขวาง",
    postcode: "10310",
    licenseNo: "สพส. 10-2565-0042",
    phone: "021234567",
    active: true,
    logo: ehpLogo,
  },
  "ehp-02": {
    id: "ehp-02",
    hospitalCode: "10042",
    type: "คลินิก",
    name: "อีเอชพี เพ็ทแคร์ คลินิก (รัชดาภิเษก)",
    addressExtra: "45/12 ถนนรัชดาภิเษก",
    province: "กรุงเทพมหานคร",
    district: "เขตดินแดง",
    subDistrict: "ดินแดง",
    postcode: "10400",
    licenseNo: "",
    phone: "0954287415",
    active: true,
    logo: ehpLogo,
  },
};

export const DEFAULT_CLINIC_ID = "ehp-01";
const logoKey = (id: string) => `ehp_clinic_logo_${id}`;

interface ClinicProfileContextType {
  clinic: ClinicProfile;
  /** เปลี่ยนโลโก้ (data URL) — ส่ง null = ลบโลโก้ (กลายเป็นกล่องขาวเปล่า) */
  setLogo: (dataUrl: string | null) => void;
  /** อัปโหลดโลโก้ไว้แล้วหรือยัง — false = ยังเป็นกล่องขาวเปล่า */
  hasLogo: boolean;
}

const Ctx = createContext<ClinicProfileContextType | null>(null);

export function ClinicProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const clinicId = user?.clinicId && CLINICS[user.clinicId] ? user.clinicId : DEFAULT_CLINIC_ID;
  const base = CLINICS[clinicId];

  const [custom, setCustom] = useState<Record<string, string | null>>(() => {
    const out: Record<string, string | null> = {};
    try {
      for (const id of Object.keys(CLINICS)) out[id] = localStorage.getItem(logoKey(id));
    } catch { /* localStorage ปิดอยู่ — ใช้โลโก้เริ่มต้น */ }
    return out;
  });

  const setLogo = useCallback((dataUrl: string | null) => {
    setCustom(prev => ({ ...prev, [clinicId]: dataUrl ?? "" }));
    try {
      /* ลบ = เขียน "" ทับ ไม่ใช่ removeItem — กันไม่ให้เด้งกลับไปใช้โลโก้ตัวอย่าง */
      localStorage.setItem(logoKey(clinicId), dataUrl ?? "");
    } catch { /* เขียนไม่ได้ก็ยังใช้งานต่อได้ในรอบนี้ */ }
  }, [clinicId]);

  /* null/undefined = ยังไม่เคยแตะ → ใช้ตัวอย่าง · "" = กดลบแล้ว → ว่างจริง */
  const override = custom[clinicId];
  const clinic: ClinicProfile = override == null ? base : { ...base, logo: override };

  return (
    <Ctx.Provider value={{ clinic, setLogo, hasLogo: !!clinic.logo }}>
      {children}
    </Ctx.Provider>
  );
}

export function useClinicProfile() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useClinicProfile ต้องอยู่ภายใน ClinicProfileProvider");
  return v;
}
