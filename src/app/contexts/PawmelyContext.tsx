/**
 * คิวส่งข้อมูลไป Pawmely + สถานะรายตัว
 *
 * ทำไมต้องมีคิว: การซิงก์ต้องไม่ทำให้การกดบันทึกช้าหรือพัง
 * บันทึกเสร็จ → เข้าคิว → ทยอยยิงเบื้องหลัง → ล้มก็รีทรายเอง
 * ผู้ใช้ไม่ต้องรอ และข้อมูลใน EHP ไม่ผูกชะตากับ Pawmely ล่ม
 *
 * คิวเก็บลง localStorage ด้วย ปิดจอกลางคันแล้วเปิดใหม่ของที่ค้างยังส่งต่อ
 *
 * ⚠️ ยังไม่ได้ตั้ง VITE_PAWMELY_BASE = ยังไม่ได้ต่อ API จริง
 * ของจะกองอยู่ในคิวสถานะ "รอต่อระบบ" ไม่ใช่ "ส่งไม่สำเร็จ" — แยกกันชัดเจน
 * เพราะสองอย่างนี้ต้องแก้คนละทาง
 */
import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import type { Pet } from "../data/animals/types";
import { useOwners } from "./OwnersContext";
import { buildPetPayload, pushPet, isPawmelyConfigured, type PawmelyPetPayload } from "../lib/pawmely";

/** รอต่อระบบ = ยังไม่ได้ตั้ง base URL · รอส่ง = อยู่ในคิว · ส่งแล้ว · ส่งไม่สำเร็จ */
export type PawmelyState = "not-configured" | "queued" | "synced" | "error";

export interface PawmelyStatus {
  state: PawmelyState;
  /** เวลาที่ส่งสำเร็จครั้งล่าสุด (ISO) */
  syncedAt?: string;
  /** ข้อความ error ล่าสุด — มีเฉพาะตอน state = error */
  error?: string;
  /** ยิงไปกี่รอบแล้ว ใช้คำนวณเวลารอก่อนลองใหม่ */
  attempts: number;
}

const STORE_KEY = "ehp_pawmely_v1";
/** รอ 5s → 15s → 45s → … สูงสุด 5 นาที ก่อนลองใหม่ */
const backoffMs = (attempts: number) => Math.min(5_000 * 3 ** Math.max(0, attempts - 1), 300_000);

/** สิ่งที่เก็บลงเครื่อง — คิวต้องเก็บด้วย ไม่ใช่แค่สถานะ
    ไม่งั้นรีโหลดแล้วของที่ค้างหายไป แต่สถานะยังค้างว่า "กำลังส่ง" ตลอดกาล */
interface PawmelyStore {
  statuses: Record<string, PawmelyStatus>;
  queue: Record<string, PawmelyPetPayload>;
}

interface PawmelyCtx {
  /** สถานะรายตัว key = HN */
  statuses: Record<string, PawmelyStatus>;
  statusOf: (hn: string) => PawmelyStatus | undefined;
  /** จำนวนตัวที่ยังส่งไม่สำเร็จ/ยังไม่ได้ส่ง — เอาไปขึ้นป้ายรวมได้ */
  pendingCount: number;
  /** สั่งซิงก์สัตว์ 1 ตัว — เรียกจาก PetsContext ทุกครั้งที่บันทึก/แก้ไข */
  syncPet: (pet: Pet) => void;
  /** กดส่งเองจากหน้าจอ (ปุ่ม "ส่งข้อมูลไป Pawmely") — ข้ามเวลารอ */
  syncNow: (pet: Pet) => void;
  configured: boolean;
}

const Ctx = createContext<PawmelyCtx | null>(null);

const loadStore = (): PawmelyStore => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
    return { statuses: s.statuses ?? {}, queue: s.queue ?? {} };
  } catch { return { statuses: {}, queue: {} }; }
};

export function PawmelyProvider({ children }: { children: ReactNode }) {
  const { owners } = useOwners();
  const initial = useRef(loadStore()).current;
  const [statuses, setStatuses] = useState<Record<string, PawmelyStatus>>(initial.statuses);

  /* คิวเก็บ payload ล่าสุดของแต่ละ HN — แก้ซ้ำ ๆ ระหว่างรอส่ง ให้ยิงแค่ก้อนล่าสุดพอ
     เก็บเป็น payload ที่ประกอบเสร็จแล้ว (ไม่ใช่ตัว Pet) เพราะ
     1. เป็นภาพ ณ ตอนกดบันทึกจริง ๆ ไม่เปลี่ยนตามข้อมูลที่ขยับทีหลัง
     2. เขียนลง localStorage ได้ตรง ๆ รีโหลดแล้วส่งต่อได้
     ref = เปลี่ยนแล้วไม่ต้อง re-render (สถานะที่ต้องโชว์แยกไปอยู่ที่ statuses) */
  const queue = useRef<Map<string, PawmelyPetPayload>>(new Map(Object.entries(initial.queue)));
  /* เวลาที่ "ห้ามยิงก่อนถึง" ของแต่ละ HN — ใช้หน่วงรีทรายแบบ backoff
     ไม่ต้องเก็บลงเครื่อง เปิดจอใหม่ให้ลองทันทีเลยดีกว่ารอต่อ */
  const nextTryAt = useRef<Map<string, number>>(new Map());
  const running = useRef(false);

  const persist = useCallback((next: Record<string, PawmelyStatus>) => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        statuses: next, queue: Object.fromEntries(queue.current),
      }));
    } catch { /* quota */ }
  }, []);

  useEffect(() => { persist(statuses); }, [statuses, persist]);

  const setStatus = useCallback((hn: string, patch: Partial<PawmelyStatus>) => {
    setStatuses(prev => ({
      ...prev,
      [hn]: { state: "queued", attempts: 0, ...prev[hn], ...patch },
    }));
  }, []);

  /* เดินคิวทีละตัว — ตัวไหนยังไม่ถึงเวลาลองใหม่ก็ข้ามไปก่อน
     ไม่ยิงพร้อมกันหลายตัว กันถล่ม API ปลายทางตอนแก้ข้อมูลรัว ๆ */
  const drain = useCallback(async () => {
    if (running.current || !isPawmelyConfigured()) return;
    running.current = true;
    try {
      for (const [hn, payload] of [...queue.current]) {
        const wait = nextTryAt.current.get(hn) ?? 0;
        if (Date.now() < wait) continue;

        try {
          await pushPet(payload);
          queue.current.delete(hn);
          nextTryAt.current.delete(hn);
          setStatus(hn, { state: "synced", syncedAt: new Date().toISOString(), attempts: 0, error: undefined });
        } catch (e) {
          const attempts = (statuses[hn]?.attempts ?? 0) + 1;
          nextTryAt.current.set(hn, Date.now() + backoffMs(attempts));
          setStatus(hn, { state: "error", attempts, error: e instanceof Error ? e.message : String(e) });
        }
      }
    } finally {
      running.current = false;
    }
  }, [statuses, setStatus]);

  /* เดินคิวทุก 5 วิ — ครอบทั้งของใหม่ที่เพิ่งเข้าคิวและของเก่าที่ถึงเวลารีทราย
     ช่วงที่ยังไม่ได้ต่อ API ตัว drain จะออกทันที ไม่กินแรง */
  useEffect(() => {
    const t = setInterval(drain, 5_000);
    return () => clearInterval(t);
  }, [drain]);

  const enqueue = useCallback((pet: Pet, immediate: boolean) => {
    /* เจ้าของไม่ได้ติ๊ก "ส่งข้อมูลไปยัง Pawmely" = ไม่ส่ง และไม่ต้องมีสถานะค้างไว้ */
    const owner = owners.find(o => o.name === pet.owner);
    if (!owner?.sendToPawmely) return;
    if (!pet.hn) return;

    queue.current.set(pet.hn, buildPetPayload(pet, owner));
    if (immediate) nextTryAt.current.delete(pet.hn);
    setStatus(pet.hn, isPawmelyConfigured()
      ? { state: "queued", error: undefined }
      : { state: "not-configured", attempts: 0 });
    if (immediate) void drain();
  }, [owners, setStatus, drain]);

  const value: PawmelyCtx = {
    statuses,
    statusOf: (hn) => statuses[hn],
    pendingCount: Object.values(statuses).filter(s => s.state === "queued" || s.state === "error").length,
    syncPet: (pet) => enqueue(pet, false),
    syncNow: (pet) => enqueue(pet, true),
    configured: isPawmelyConfigured(),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePawmely() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePawmely must be used within PawmelyProvider");
  return c;
}
