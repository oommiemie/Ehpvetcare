/**
 * Default pet profile avatars by species type.
 * Uses cute 3D-style illustrations from Figma assets.
 */
import dogAvatar from "figma:asset/8619b7ade86b4481ffdfd7d284d3961ce3364615.png";
import catAvatar from "figma:asset/38e3e6905517346a1fd9773482115f5a7e2d7fe3.png";
import birdAvatar from "figma:asset/38dd0f816c6412bfab8e6c583ed1382a175efd51.png";
import fishAvatar from "figma:asset/b9efb9ea21e70e921041b0099cb85e2fb187d410.png";
import reptileAvatar from "figma:asset/b5202321c19eb28be13da13c81b3ee0d5514dcee.png";
import smallAnimalAvatar from "figma:asset/22cb03295a94024a2dc84061f3d1d2a8fafd3bf2.png";
import otherAvatar from "figma:asset/79aa0d129b80a6c28f2ec59b3d52a771c31f94d3.png";

/* ── Owner avatars by gender ── */
import maleOwnerAvatar from "figma:asset/54b5c3675baeb511a0f245f5348d0e84485759f2.png";
import femaleOwnerAvatar from "figma:asset/c86b9a8fa4d32b6c9765d27f5e240e1889863a5b.png";

const speciesAvatarMap: Record<string, string> = {
  "สุนัข": dogAvatar,
  "แมว": catAvatar,
  "นก": birdAvatar,
  "ปลา": fishAvatar,
  "สัตว์เลี้ยงคลาน": reptileAvatar,
  "สัตว์เลื้อยคลาน": reptileAvatar,
  "สัตว์ครึ่งบกครึ่งน้ำ": reptileAvatar,
  "กระต่าย": smallAnimalAvatar,
  "สัตว์เลี้ยงขนาดเล็ก": smallAnimalAvatar,
  "แฮมสเตอร์": smallAnimalAvatar,
  "หนู": smallAnimalAvatar,
  "เม่น": smallAnimalAvatar,
  "อื่นๆ": otherAvatar,
};

/**
 * Get default avatar image URL for a given species.
 * Falls back to otherAvatar if species is not found.
 */
export function getSpeciesAvatar(species: string): string {
  return speciesAvatarMap[species] ?? otherAvatar;
}

/**
 * Get default avatar image URL for an owner based on gender.
 * Falls back to male avatar if gender is not recognized.
 */
export function getGenderAvatar(gender: string): string {
  if (gender === "หญิง" || gender === "female" || gender === "F") return femaleOwnerAvatar;
  return maleOwnerAvatar;
}

export {
  dogAvatar,
  catAvatar,
  birdAvatar,
  fishAvatar,
  reptileAvatar,
  smallAnimalAvatar,
  maleOwnerAvatar,
  femaleOwnerAvatar,
  otherAvatar,
};