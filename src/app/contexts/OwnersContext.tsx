import { createContext, useContext, useState, ReactNode } from "react";
import type { Owner } from "../data/animals/types";
import { OWNERS } from "../data/animals";

export type { Owner } from "../data/animals/types";
export { petSpeciesMap, petPhotoMap } from "../data/animals";

const initialOwners: Owner[] = OWNERS;

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
