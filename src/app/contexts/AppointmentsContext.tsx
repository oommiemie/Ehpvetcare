import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { petPhotoMap } from "../data/animals";

export type AppointmentType = "การรักษา" | "วัคซีน" | "อาบน้ำ" | "ฝากเลี้ยง";
export interface Appointment {
  id: number; time: string; petName: string; owner: string;
  type: AppointmentType; vet: string; day: number; status: string; photo: string;
  timeNote?: string;   // หมายเหตุเวลานัด กรณีไม่ระบุเวลา เช่น "ช่วงบ่าย"
}

/* ── Seed: ก.ค. 2569 — วันนี้วันที่ 8, กระจายวันที่ 6-15 ── */
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 1, time: "09:00", petName: "บัดดี้", owner: "สมศักดิ์ ใจดี", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 6, status: "ยืนยันแล้ว", photo: petPhotoMap["บัดดี้"] },
  { id: 2, time: "13:30", petName: "เดซี่", owner: "ธีรพล วงศ์สุวรรณ", type: "การรักษา", vet: "สพ.ว. สุภา", day: 6, status: "ยืนยันแล้ว", photo: petPhotoMap["เดซี่"] },
  { id: 3, time: "10:00", petName: "ลูน่า", owner: "วรรณา ศรีสุข", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 7, status: "ยืนยันแล้ว", photo: petPhotoMap["ลูน่า"] },
  { id: 4, time: "15:00", petName: "เร็กซ์", owner: "ธนากร ชัยชนะ", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 7, status: "ยืนยันแล้ว", photo: petPhotoMap["เร็กซ์"] },
  { id: 5, time: "09:00", petName: "โมจิ", owner: "ประพันธ์ มงคล", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 8, status: "ยืนยันแล้ว", photo: petPhotoMap["โมจิ"] },
  { id: 6, time: "10:30", petName: "โคโค่", owner: "อรอนงค์ พรมเสน", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 8, status: "ยืนยันแล้ว", photo: petPhotoMap["โคโค่"] },
  { id: 7, time: "13:00", petName: "แม็กซ์", owner: "ประพันธ์ มงคล", type: "อาบน้ำ", vet: "เจ้าหน้าที่", day: 8, status: "รอยืนยัน", photo: petPhotoMap["แม็กซ์"] },
  { id: 8, time: "16:30", petName: "ทองคำ", owner: "กิตติพงษ์ วงษ์ทอง", type: "การรักษา", vet: "สพ.ว. สุภา", day: 8, status: "รอยืนยัน", photo: petPhotoMap["ทองคำ"] },
  { id: 9, time: "09:30", petName: "เบลล่า", owner: "ปรียาภรณ์ ทองดี", type: "ฝากเลี้ยง", vet: "เจ้าหน้าที่", day: 9, status: "กำหนดการ", photo: petPhotoMap["เบลล่า"] },
  { id: 10, time: "14:00", petName: "เรนโบว์", owner: "สราวุฒิ ตั้งตรงจิตร", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 9, status: "กำหนดการ", photo: petPhotoMap["เรนโบว์"] },
  { id: 11, time: "10:00", petName: "สกาย", owner: "วิชัย มงคล", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 10, status: "กำหนดการ", photo: petPhotoMap["สกาย"] },
  { id: 12, time: "11:00", petName: "เต่าทอง", owner: "วิภาดา สายทอง", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 11, status: "กำหนดการ", photo: petPhotoMap["เต่าทอง"] },
  { id: 13, time: "13:30", petName: "มิ้ว", owner: "กัญญา สุวรรณ", type: "อาบน้ำ", vet: "เจ้าหน้าที่", day: 12, status: "กำหนดการ", photo: petPhotoMap["มิ้ว"] },
  { id: 14, time: "15:30", petName: "มิลค์", owner: "ศิริพร แก้วมณี", type: "การรักษา", vet: "สพ.ว. สุภา", day: 13, status: "กำหนดการ", photo: petPhotoMap["มิลค์"] },
  { id: 15, time: "09:00", petName: "ลัคกี้", owner: "อนันต์ ศรีวิไล", type: "วัคซีน", vet: "สพ.ว. สมชาย", day: 14, status: "กำหนดการ", photo: petPhotoMap["ลัคกี้"] },
  { id: 16, time: "14:30", petName: "หิมะ", owner: "อรอนงค์ พรมเสน", type: "ฝากเลี้ยง", vet: "เจ้าหน้าที่", day: 15, status: "กำหนดการ", photo: petPhotoMap["หิมะ"] },
  /* ── นัดที่ผ่านมาแล้ว (ต้นเดือน) — ครบวงจรสถานะ ── */
  { id: 17, time: "10:00", petName: "ชาร์ลี", owner: "ธีรพล วงศ์สุวรรณ", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 4, status: "เสร็จสิ้น", photo: petPhotoMap["ชาร์ลี"] },
  { id: 18, time: "14:00", petName: "ส้มโอ", owner: "รัตนา จันทร์เพ็ญ", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 5, status: "เสร็จสิ้น", photo: petPhotoMap["ส้มโอ"] },
  { id: 19, time: "11:30", petName: "ยูริ", owner: "มานพ สิงห์โต", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 6, status: "เสร็จสิ้น", photo: petPhotoMap["ยูริ"] },
  { id: 20, time: "09:30", petName: "บอล", owner: "ดวงใจ ประเสริฐ", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 5, status: "ยกเลิก", photo: petPhotoMap["บอล"] },
];

const STORAGE_KEY = "ehp_appointments_v3";
const load = (): Appointment[] | null => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? (JSON.parse(r) as Appointment[]) : null; } catch { return null; }
};

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, "id">) => number;
  updateAppointment: (id: number, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: number) => void;
}
const AppointmentsContext = createContext<AppointmentsContextType | null>(null);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(() => load() ?? INITIAL_APPOINTMENTS);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments)); } catch { /* quota */ } }, [appointments]);

  const addAppointment = (a: Omit<Appointment, "id">) => {
    const id = appointments.reduce((m, x) => Math.max(m, x.id), 0) + 1;
    setAppointments(prev => [...prev, { ...a, id }]);
    return id;
  };
  const updateAppointment = (id: number, patch: Partial<Appointment>) =>
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  const deleteAppointment = (id: number) =>
    setAppointments(prev => prev.filter(a => a.id !== id));

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, updateAppointment, deleteAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const c = useContext(AppointmentsContext);
  if (!c) throw new Error("useAppointments must be used within AppointmentsProvider");
  return c;
}
