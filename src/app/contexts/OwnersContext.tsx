import { createContext, useContext, useState, ReactNode } from "react";

export interface Owner {
  id: number;
  name: string;
  nickname: string;
  gender: string;
  phone: string;
  email: string;
  lineId: string;
  address: string;
  idCard: string;
  pets: string[];
  joinDate: string;
  totalVisits: number;
  photo: string;
}

export const petSpeciesMap: Record<string, string> = {
  "บัดดี้": "สุนัข", "ร็อคกี้": "สุนัข", "ลูน่า": "แมว", "แม็กซ์": "สุนัข",
  "เบลล่า": "สุนัข", "โมจิ": "แมว", "โคโค่": "กระต่าย", "ชาร์ลี": "สุนัข",
  "เดซี่": "นก", "ทวีป": "นก", "มิลค์": "สัตว์เลี้ยงขนาดเล็ก",
  "ทองคำ": "ปลา", "เร็กซ์": "สัตว์เลื้อยคลาน",
};

export const petPhotoMap: Record<string, string> = {
  // Dogs
  "บัดดี้":  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop",
  "ร็อคกี้": "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400&q=80&auto=format&fit=crop",
  "แม็กซ์":  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80&auto=format&fit=crop",
  "เบลล่า":  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=80&auto=format&fit=crop",
  "ชาร์ลี":  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80&auto=format&fit=crop",
  // Cats
  "ลูน่า":   "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&q=80&auto=format&fit=crop",
  "โมจิ":    "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80&auto=format&fit=crop",
  // Rabbit
  "โคโค่":   "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=400&q=80&auto=format&fit=crop",
  // Birds
  "เดซี่":   "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=80&auto=format&fit=crop",
  "ทวีป":    "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80&auto=format&fit=crop",
  // Small pet (hamster)
  "มิลค์":   "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=80&auto=format&fit=crop",
  // Fish
  "ทองคำ":  "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80&auto=format&fit=crop",
  // Reptile
  "เร็กซ์":  "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&q=80&auto=format&fit=crop",
};

const initialOwners: Owner[] = [
  {
    id: 1, name: "สมศักดิ์ ใจดี", nickname: "ศักดิ์", gender: "ชาย", phone: "081-234-5678", email: "somsak@email.com",
    lineId: "@somsak", address: "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110", idCard: "1-1001-00001-00-0",
    pets: ["บัดดี้", "ร็อคกี้"], joinDate: "15 ม.ค. 2567", totalVisits: 24,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2, name: "วรรณา ศรีสุข", nickname: "นุ้ย", gender: "หญิง", phone: "089-876-5432", email: "wanna@email.com",
    lineId: "@wannas", address: "45 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900", idCard: "1-1002-00002-00-0",
    pets: ["ลูน่า"], joinDate: "22 มี.ค. 2567", totalVisits: 12,
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 3, name: "ประพันธ์ มงคล", nickname: "พันธ์", gender: "ชาย", phone: "062-111-2233", email: "praphan@email.com",
    lineId: "@praphanm", address: "78 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310", idCard: "1-1003-00003-00-0",
    pets: ["แม็กซ์", "โมจิ"], joinDate: "8 พ.ย. 2566", totalVisits: 41,
    photo: "https://randomuser.me/api/portraits/men/53.jpg",
  },
  {
    id: 4, name: "อรอนงค์ พรมเสน", nickname: "อ้อ", gender: "หญิง", phone: "091-444-5566", email: "oranong@email.com",
    lineId: "@oranongg", address: "12 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400", idCard: "1-1004-00004-00-0",
    pets: ["โคโค่"], joinDate: "1 มิ.ย. 2567", totalVisits: 8,
    photo: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    id: 5, name: "ธีรพล วงศ์สุวรรณ", nickname: "ไก่", gender: "ชาย", phone: "085-777-8899", email: "teerapon@email.com",
    lineId: "@teeraponw", address: "99 ถ.เจริญนคร แขวงบางลำภูล่าง เขตคลองสาน กรุงเทพฯ 10600", idCard: "1-1005-00005-00-0",
    pets: ["ชาร์ลี", "เดซี่"], joinDate: "14 ส.ค. 2566", totalVisits: 33,
    photo: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  {
    id: 6, name: "ปรียาภรณ์ ทองดี", nickname: "แพร", gender: "หญิง", phone: "094-321-6543", email: "preeyaporn@email.com",
    lineId: "@preeyaphornt", address: "56 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500", idCard: "1-1006-00006-00-0",
    pets: ["เบลล่า"], joinDate: "10 ก.ย. 2567", totalVisits: 5,
    photo: "https://randomuser.me/api/portraits/women/89.jpg",
  },
  {
    id: 7, name: "นภาพร รุ่งเรือง", nickname: "แนน", gender: "หญิง", phone: "091-555-7788", email: "napaporn@email.com",
    lineId: "@napapornr", address: "88 ถ.รัชดาภิเษก แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900", idCard: "1-1007-00007-00-0",
    pets: ["ทวีป"], joinDate: "20 ก.พ. 2569", totalVisits: 3,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 8, name: "ศิริพร แก้วมณี", nickname: "ต่าย", gender: "หญิง", phone: "083-321-6655", email: "siriporn@email.com",
    lineId: "@siripornk", address: "23 ถ.พระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110", idCard: "1-1008-00008-00-0",
    pets: ["มิลค์"], joinDate: "5 ส.ค. 2566", totalVisits: 5,
    photo: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 9, name: "กิตติพงษ์ วงษ์ทอง", nickname: "เบียร์", gender: "ชาย", phone: "086-447-2211", email: "kittipong@email.com",
    lineId: "@kittipongw", address: "15 ถ.นวมินทร์ แขวงนวมินทร์ เขตบึงกุ่ม กรุงเทพฯ 10230", idCard: "1-1009-00009-00-0",
    pets: ["ทองคำ"], joinDate: "12 มิ.ย. 2567", totalVisits: 2,
    photo: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    id: 10, name: "ธนากร ชัยชนะ", nickname: "โอ๊ต", gender: "ชาย", phone: "094-882-0033", email: "tanakorn@email.com",
    lineId: "@tanakornc", address: "67 ถ.บางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ 10260", idCard: "1-1010-00010-00-0",
    pets: ["เร็กซ์"], joinDate: "3 ม.ค. 2569", totalVisits: 2,
    photo: "https://randomuser.me/api/portraits/men/91.jpg",
  },
];

interface OwnersContextType {
  owners: Owner[];
  addOwner: (owner: Owner) => void;
  updateOwner: (id: number, patch: Partial<Owner>) => void;
  deleteOwner: (id: number) => void;
  getOwner: (id: number) => Owner | undefined;
}

const OwnersContext = createContext<OwnersContextType | null>(null);

export function OwnersProvider({ children }: { children: ReactNode }) {
  const [owners, setOwners] = useState<Owner[]>(initialOwners);

  const addOwner = (owner: Owner) => setOwners(prev => [owner, ...prev]);
  const updateOwner = (id: number, patch: Partial<Owner>) =>
    setOwners(prev => prev.map(o => (o.id === id ? { ...o, ...patch } : o)));
  const deleteOwner = (id: number) => setOwners(prev => prev.filter(o => o.id !== id));
  const getOwner = (id: number) => owners.find(o => o.id === id);

  return (
    <OwnersContext.Provider value={{ owners, addOwner, updateOwner, deleteOwner, getOwner }}>
      {children}
    </OwnersContext.Provider>
  );
}

export function useOwners() {
  const ctx = useContext(OwnersContext);
  if (!ctx) throw new Error("useOwners must be used within OwnersProvider");
  return ctx;
}
