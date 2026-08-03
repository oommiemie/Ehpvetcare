import { createContext, useContext, useState, useRef, ReactNode } from "react";
import type { Pet } from "../data/animals/types";
import { ALL_ANIMALS } from "../data/animals";
import { usePawmely } from "./PawmelyContext";
export type { Pet, PetVaccine, PetSurgery, PetVisit } from "../data/animals/types";

const initialPets: Pet[] = ALL_ANIMALS;

interface PetsContextType {
  pets: Pet[];
  addPet: (pet: Pet) => void;
  updatePet: (id: number, patch: Partial<Pet>) => void;
  deletePet: (id: number) => void;
  getPet: (id: number) => Pet | undefined;
}

const PetsContext = createContext<PetsContextType | null>(null);

export function PetsProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(initialPets);
  /* ทุกการบันทึก/แก้ไขสัตว์ในระบบผ่าน addPet/updatePet ตรงนี้จุดเดียว
     จึงเกาะซิงก์ Pawmely ไว้ที่นี่ที่เดียว ครอบทั้งข้อมูลทั่วไป วัคซีน
     ประวัติการรักษา และการผ่าตัด โดยไม่ต้องไปแก้ทีละหน้า
     (คิวกรองเองว่าเจ้าของติ๊กส่งไว้ไหม — ดู PawmelyContext) */
  const { syncPet } = usePawmely();

  /* กระจกเงาของ pets ล่าสุด — ใช้ประกอบก้อนข้อมูลที่จะซิงก์
     ห้ามเรียก syncPet ข้างใน updater ของ setPets เด็ดขาด: updater ทำงาน
     ช่วง render และ syncPet ไปสั่ง setState ของ PawmelyContext ต่อ
     React จะเตือน "update a component while rendering a different component" */
  const petsRef = useRef(pets);
  petsRef.current = pets;

  const addPet = (pet: Pet) => {
    setPets(prev => [pet, ...prev]);
    syncPet(pet);
  };
  const updatePet = (id: number, patch: Partial<Pet>) => {
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
    const cur = petsRef.current.find(p => p.id === id);
    if (cur) syncPet({ ...cur, ...patch });
  };
  const deletePet = (id: number) => setPets(prev => prev.filter(p => p.id !== id));
  const getPet = (id: number) => pets.find(p => p.id === id);

  return (
    <PetsContext.Provider value={{ pets, addPet, updatePet, deletePet, getPet }}>
      {children}
    </PetsContext.Provider>
  );
}

export function usePets() {
  const ctx = useContext(PetsContext);
  if (!ctx) throw new Error("usePets must be used within PetsProvider");
  return ctx;
}
