import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppointmentType = "การรักษา" | "วัคซีน" | "อาบน้ำ" | "ฝากเลี้ยง";
export interface Appointment {
  id: number; time: string; petName: string; owner: string;
  type: AppointmentType; vet: string; day: number; status: string; photo: string;
}

const PET_PHOTOS = {
  บัดดี้: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&q=80",
  ลูน่า: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=120&q=80",
  แม็กซ์: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&q=80",
  โคโค่: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=120&q=80",
  ชาร์ลี: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=120&q=80",
  เบลล่า: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=120&q=80",
  ร็อคกี้: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=120&q=80",
  เดซี่: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=120&q=80",
  โมจิ: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=120&q=80",
} as Record<string, string>;

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 1, time: "09:00", petName: "บัดดี้", owner: "สมศักดิ์ ใจดี", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 17, status: "ยืนยันแล้ว", photo: PET_PHOTOS["บัดดี้"] },
  { id: 2, time: "09:30", petName: "ลูน่า", owner: "วรรณา ศรีสุข", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 17, status: "ยืนยันแล้ว", photo: PET_PHOTOS["ลูน่า"] },
  { id: 3, time: "10:00", petName: "แม็กซ์", owner: "ประพันธ์ มงคล", type: "อาบน้ำ", vet: "เจ้าหน้าที่", day: 17, status: "ยืนยันแล้ว", photo: PET_PHOTOS["แม็กซ์"] },
  { id: 4, time: "11:00", petName: "โคโค่", owner: "อรอนงค์ พรมเสน", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 17, status: "รอยืนยัน", photo: PET_PHOTOS["โคโค่"] },
  { id: 5, time: "13:00", petName: "ชาร์ลี", owner: "ธีรพล วงศ์สุวรรณ", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 17, status: "ยืนยันแล้ว", photo: PET_PHOTOS["ชาร์ลี"] },
  { id: 6, time: "14:00", petName: "เบลล่า", owner: "ปรียาภรณ์ ทองดี", type: "ฝากเลี้ยง", vet: "เจ้าหน้าที่", day: 17, status: "ยืนยันแล้ว", photo: PET_PHOTOS["เบลล่า"] },
  { id: 7, time: "09:00", petName: "ร็อคกี้", owner: "สมศักดิ์ ใจดี", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 15, status: "ยืนยันแล้ว", photo: PET_PHOTOS["ร็อคกี้"] },
  { id: 8, time: "10:30", petName: "เดซี่", owner: "ธีรพล วงศ์สุวรรณ", type: "อาบน้ำ", vet: "เจ้าหน้าที่", day: 16, status: "ยืนยันแล้ว", photo: PET_PHOTOS["เดซี่"] },
  { id: 9, time: "15:00", petName: "โมจิ", owner: "ประพันธ์ มงคล", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 14, status: "ยืนยันแล้ว", photo: PET_PHOTOS["โมจิ"] },
  { id: 10, time: "09:00", petName: "บัดดี้", owner: "สมศักดิ์ ใจดี", type: "การรักษา", vet: "สพ.ว. สมชาย", day: 22, status: "กำหนดการ", photo: PET_PHOTOS["บัดดี้"] },
  { id: 11, time: "14:30", petName: "ลูน่า", owner: "วรรณา ศรีสุข", type: "วัคซีน", vet: "สพ.ว. สุภา", day: 27, status: "กำหนดการ", photo: PET_PHOTOS["ลูน่า"] },
];

const STORAGE_KEY = "ehp_appointments_v1";
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
