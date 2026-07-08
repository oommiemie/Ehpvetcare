import type { Pet } from "./types";
import { DOGS } from "./dogs";
import { CATS } from "./cats";
import { BIRDS } from "./birds";
import { REPTILES } from "./reptiles";
import { FISH } from "./fish";
import { SMALLS } from "./smalls";
import { OWNERS } from "./owners";

export type { Pet, Owner, PetVaccine, PetSurgery, PetVisit } from "./types";
export { DOGS, CATS, BIRDS, REPTILES, FISH, SMALLS, OWNERS };

/* ── ทะเบียนสัตว์ 48 ตัว: สุนัข 10 · แมว 10 · นก 8 · เลื้อยคลาน 5 · ปลา 5 · เล็ก 10 ── */
export const ALL_ANIMALS: Pet[] = [...DOGS, ...CATS, ...BIRDS, ...REPTILES, ...FISH, ...SMALLS];

/* ── Maps อ้างอิงข้ามหน้าจอ (ชื่อ → ชนิด/รูป) ── */
export const petSpeciesMap: Record<string, string> =
  Object.fromEntries(ALL_ANIMALS.map(p => [p.name, p.species]));

export const petPhotoMap: Record<string, string> =
  Object.fromEntries(ALL_ANIMALS.filter(p => p.image).map(p => [p.name, p.image as string]));

export const findAnimal = (name: string) => ALL_ANIMALS.find(p => p.name === name);
export const findAnimalByHN = (hn: string) => ALL_ANIMALS.find(p => p.hn === hn);
