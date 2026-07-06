import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface PosSettings {
  vat: { enabled: boolean; rate: number };                    // ภาษีมูลค่าเพิ่ม เปิด/ปิด + %
  points: {
    enabled: boolean;
    earnSpend: number;    // ซื้อครบทุกกี่บาท
    earnPoints: number;   // ได้กี่แต้ม
    redeemPoints: number; // ใช้กี่แต้ม
    redeemBaht: number;   // แลกเป็นส่วนลดกี่บาท
  };
  rounding: { enabled: boolean; mode: "ceil" | "half" };       // ปัดเศษ: ceil=ปัดเต็มบาทขึ้นเสมอ · half=ครึ่งขึ้น
  receiptPrinter: { enabled: boolean; name: string; paper: string; copies: number; footer: string };
  labelPrinter: { enabled: boolean; name: string; size: string; showClinic: boolean; showUsage: boolean };
  camera: { autoScan: boolean };                               // เปิดกล้องสแกนบาร์โค้ดอัตโนมัติ
}

export const DEFAULT_POS_SETTINGS: PosSettings = {
  vat: { enabled: false, rate: 7 },
  points: { enabled: true, earnSpend: 100, earnPoints: 10, redeemPoints: 5, redeemBaht: 1 },
  rounding: { enabled: false, mode: "half" },
  receiptPrinter: { enabled: true, name: "POS Printer (58mm)", paper: "58mm", copies: 1, footer: "ขอบคุณที่ใช้บริการค่ะ 🐾" },
  labelPrinter: { enabled: false, name: "Label Printer", size: "40 × 30 mm", showClinic: true, showUsage: true },
  camera: { autoScan: false },
};

const STORAGE_KEY = "ehp_pos_settings_v1";
const load = (): PosSettings => {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (!r) return DEFAULT_POS_SETTINGS;
    const parsed = JSON.parse(r);
    // merge กับ default กันฟิลด์ขาด
    return {
      ...DEFAULT_POS_SETTINGS, ...parsed,
      vat: { ...DEFAULT_POS_SETTINGS.vat, ...parsed.vat },
      points: { ...DEFAULT_POS_SETTINGS.points, ...parsed.points },
      rounding: { ...DEFAULT_POS_SETTINGS.rounding, ...parsed.rounding },
      receiptPrinter: { ...DEFAULT_POS_SETTINGS.receiptPrinter, ...parsed.receiptPrinter },
      labelPrinter: { ...DEFAULT_POS_SETTINGS.labelPrinter, ...parsed.labelPrinter },
      camera: { ...DEFAULT_POS_SETTINGS.camera, ...parsed.camera },
    };
  } catch { return DEFAULT_POS_SETTINGS; }
};

/** ปัดเศษเงินตามโหมด: ceil=ปัดเต็มบาทขึ้นเสมอ · half=ครึ่งขึ้น (<0.5 ลง, ≥0.5 ขึ้น) */
export const applyRounding = (n: number, r: { enabled: boolean; mode: "ceil" | "half" }) =>
  !r.enabled ? n : r.mode === "ceil" ? Math.ceil(n) : Math.round(n);

interface PosSettingsContextType {
  settings: PosSettings;
  update: <K extends keyof PosSettings>(key: K, patch: Partial<PosSettings[K]>) => void;
}
const Ctx = createContext<PosSettingsContextType | null>(null);

export function PosSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PosSettings>(() => load());
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* quota */ } }, [settings]);
  const update: PosSettingsContextType["update"] = (key, patch) =>
    setSettings(s => ({ ...s, [key]: { ...s[key], ...patch } }));
  return <Ctx.Provider value={{ settings, update }}>{children}</Ctx.Provider>;
}

export function usePosSettings() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePosSettings must be used within PosSettingsProvider");
  return c;
}
