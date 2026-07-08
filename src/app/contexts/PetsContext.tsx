import { createContext, useContext, useState, ReactNode } from "react";
import type { Pet } from "../data/animals/types";
import { ALL_ANIMALS } from "../data/animals";
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

  const addPet = (pet: Pet) => setPets(prev => [pet, ...prev]);
  const updatePet = (id: number, patch: Partial<Pet>) =>
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
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
