/* ── ชนิดข้อมูลกลางของทะเบียนสัตว์เลี้ยง/เจ้าของ (mock dataset) ── */

export interface PetVaccine {
  name: string;
  date: string;
  nextDue: string;
  batch: string;
}

export interface PetSurgery {
  name: string;
  date: string;
  vet: string;
  notes: string;
}

export interface PetVisit {
  id: number;
  date: string;
  time: string;
  type: string;
  weight: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  vet: string;
  notes: string;
}

export interface Pet {
  id: number;
  hn: string;
  name: string;
  nameEn: string;
  species: string;
  breed: string;
  gender: string;
  weight: string;
  age: string;
  microchip: string;
  color: string;
  owner: string;
  ownerPhone: string;
  allergies: string;
  chronic: string;
  sterilized: boolean;
  image: string | null;
  vaccines: PetVaccine[];
  surgeries: PetSurgery[];
  visits: number;
  visitHistory: PetVisit[];
}

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
  customerType?: string;   // ประเภทลูกค้า: ลูกค้าทั่วไป / สมาชิก / สมาชิก VIP / ราคาส่ง / ราคาพนักงาน
  points?: number;         // แต้มสะสม — ใช้คำนวณระดับสมาชิก (Silver/Gold/Platinum) ตามช่วงที่ตั้งไว้
}
