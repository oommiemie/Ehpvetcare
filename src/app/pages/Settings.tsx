import image_d0ed46269162105ec3b29e48ba732cdf2fa8a50e from 'figma:asset/d0ed46269162105ec3b29e48ba732cdf2fa8a50e.png'
import { useState, useEffect, useRef } from "react";
import clinicLogoPreview from "@/assets/logo ehpvetcare.png";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import imgBellDecor from "figma:asset/61e3deff78de5b26a258fd61a501194bbb56540e.png";
import imgPillDecor from "figma:asset/06e1c759c341a01d94357ce5f310930d6ac67fec.png";
import svgPathsDrugs from "../../imports/svg-kfb9yozat5";
import imgSpeciesDecor from "figma:asset/79aa0d129b80a6c28f2ec59b3d52a771c31f94d3.png";
import svgPathsSpecies from "../../imports/svg-dxty3ipi3r";
import imgBreedDecor from "figma:asset/da8cd26150a5d3079b941efb6b052bf596754082.png";
import svgPathsBreed from "../../imports/svg-pxaodt0vwc";
import imgServiceDecor from "figma:asset/2d18f6929a57bb9f599514b4d247d99a664978ee.png";
import svgPathsService from "../../imports/svg-moblrm1ucj";
import imgVaccineDecor from "figma:asset/c7ae8058070a2fcff56e2b1c68c76eeed7211788.png";
import svgPathsVaccine from "../../imports/svg-o1aril1pcz";
import imgTableDecor from "figma:asset/d8728e640123b6ca80f81e3d52778a4128bd3dbf.png";
import imgDoctorDecor from "figma:asset/38108e79459bb2b9651de437b75b70a9a555c6fe.png";
import imgKingCrownDecor from "figma:asset/05a0f845d714a6db51d1fae2a240c09834a47cfb.png";
import imgUserShieldDecor from "figma:asset/5e01f2edff644c9264205ae39b9cb5ac4d530d5f.png";
import svgPathsNotify from "../../imports/svg-7usflk4bo2";
import {
  Bell, Database, Users, Plus, Edit2, Trash2, Copy, Search, Package,
  Shield, X, Building2, UserCircle, Syringe, Pill,
  Check, PawPrint, Wrench, ChevronRight, Lock,
  BellRing, ToggleLeft, ToggleRight, AlertCircle, Star,
  Bed, Power, Pencil, Settings as SettingsIcon, Sparkles,
  ArrowLeft, Home as HomeIcon, MoreHorizontal,
  Percent, Coins, Printer, Tag, Calculator, ShoppingCart, Crown, ChevronDown, ArrowRight,
  FlaskConical, ScanLine, Layers, Palette, Type as TypeIcon, Monitor, PanelLeft, ImageIcon, Scissors, Keyboard, ArrowBigUp, GripVertical, Camera,
  FileText, Route, BookOpen, Bug, Ruler, Activity, ClipboardList, Stethoscope, Calendar, Truck, Boxes, Briefcase,
  Landmark, QrCode, Phone, CreditCard, BadgeCheck, RefreshCw, Clock, ListChecks, ChevronLeft,
  Snowflake, Heart, Ghost, Droplets, Target, Scale,
  type LucideIcon,
  Ticket,
} from "lucide-react";
import type { LoginBgSet } from "../config/loginBackgrounds";
import { useDisplay, daysUntilFestival } from "../contexts/DisplayContext";
import { usePosSettings } from "../contexts/PosSettingsContext";
import { DatePickerModern } from "../components/DatePickerModern";
import { useIPD, type Ward, type Cage, type CageType, type CageStatus } from "../contexts/IPDContext";
import { NewRoomModal, roomTypes as BOARDING_ROOM_TYPES } from "./Boarding";
import { useConfirm } from "../contexts/ConfirmContext";
import { useLang } from "../contexts/LanguageContext";

const CAGE_TYPES: CageType[] = ["Small", "Medium", "Large", "ICU", "Isolation", "Oxygen"];
const CAGE_STATUS_LABEL: Record<CageStatus, string> = {
  available: "ว่าง",
  occupied: "มีผู้ป่วย",
  cleaning: "ทำความสะอาด",
  maintenance: "ซ่อมบำรุง",
};
const CAGE_STATUS_COLOR: Record<CageStatus, string> = {
  available: "#10b981",
  occupied: "#3b82f6",
  cleaning: "#f59e0b",
  maintenance: "#ef4444",
};
import { PageMotion, PageItem } from "../components/PageMotion";
import { useSnackbar } from "../contexts/SnackbarContext";
import { MEMBER_LEVELS_KEY, INIT_MEMBER_LEVELS, levelTone, type MemberLevelCfg } from "../utils/memberTier";
import { useClinicData, CATEGORY_EMOJI, type DrugStockLink, type Drug, type ServiceItem } from "../contexts/ClinicDataContext";
import { PromotionForm } from "../components/PromotionForm";
import { listPromotions, listRedemptions, savePromotion, deletePromotion, usedCount, expiryOf, PROMO_SCOPES, type Promotion } from "../lib/promotions";
import { fmtThaiDate } from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { useClinicProfile } from "../contexts/ClinicProfileContext";
import { useShortcutKeys, SHORTCUT_COMBOS, SHORTCUT_ACTIONS, comboLabel, actionByPath } from "../contexts/ShortcutsContext";
import { heroPillClearStyle } from "../utils/heroFilter";
import { useTabPrefs, LOCKED_TABS, type TabScope } from "../contexts/TabPrefsContext";
import { IMAGING_CATALOG_SEED } from "../config/imaging";
import { OPD_TAB_META, IPD_TAB_META } from "../config/tabMeta";

import { vetUsesSlots, setVetUsesSlots } from "../lib/vetSlotPrefs";
// ─── Types ────────────────────────────────────────────────────────
type MainTab = "notify" | "master" | "users";
type MasterSub = "drugs" | "species" | "breeds" | "services" | "vaccines" | "wards" | "boarding";
type UsersSub = "rooms" | "personnel" | "roles" | "access";

/* Drug / ServiceItem ใช้ของจริงจาก ClinicDataContext
   ไฟล์นี้เคยมีสำเนาของตัวเองค้างไว้ตั้งแต่ตอนย้าย type ไป context แล้วไม่ได้ลบ
   สำเนานั้นเก่ากว่าและขาดหลายฟิลด์ (unit, strength, image, stockLinks, surgeryUse)
   ทำให้ TypeScript มองไม่เห็นฟิลด์ที่โค้ดในไฟล์นี้ใช้อยู่จริง */
interface PetSpecies { id: number; code: string; name: string; icon: string; active: boolean; }
interface PetBreed   { id: number; name: string; speciesId: number; active: boolean; }
/** ล็อตวัคซีน 1 ล็อต — วัคซีนตัวเดียวกันสั่งเข้ามาหลายรอบ แต่ละรอบคนละล็อตคนละวันหมดอายุ */
interface VaccineLot { lot: string; expiry: string }
interface VaccineItem {
  id: number;
  brand: string;        // ผู้ผลิต / ยี่ห้อ (บังคับ)
  typeId: number | null; // อ้าง VaccineType — ประเภทวัคซีน (บังคับ)
  icode: string;        // รหัสสินค้าในคลัง (StockProduct.code) — "" = ยังไม่ผูก
  lots: VaccineLot[];
  active: boolean;
}
interface Room       { id: number; name: string; type: string; active: boolean; }
interface Personnel  { id: number; name: string; licenseNo: string; position: string; role: string; roomId: number | null; active: boolean;
  /** ผูกกับแพทย์ในตารางออกตรวจ (SlotBuilder VETS.id) — มีเฉพาะสัตวแพทย์ที่รับนัดได้ */
  slotKey?: string; }

// ─── Mock Data ────────────────────────────────────────────────────
// หมายเหตุ: INIT_DRUGS และ INIT_SERVICES ถูกย้ายไปใน ClinicDataContext.tsx แล้ว
//           DrugsSection / ServicesSection ดึงข้อมูลผ่าน useClinicData() โดยตรง
const INIT_SPECIES: PetSpecies[] = [
  { id:1, code:"S001", name:"สุนัข",         icon:"🐶", active:true  },
  { id:2, code:"S002", name:"แมว",           icon:"🐱", active:true  },
  { id:3, code:"S003", name:"กระต่าย",       icon:"🐰", active:true  },
  { id:4, code:"S004", name:"นก",            icon:"🐦", active:true  },
  { id:5, code:"S005", name:"หนู/แฮมสเตอร์", icon:"🐹", active:true  },
  { id:6, code:"S006", name:"เต่า",          icon:"🐢", active:false },
];
const INIT_BREEDS: PetBreed[] = [
  { id:1,  name:"โกลเดน รีทรีฟเวอร์", speciesId:1, active:true },
  { id:2,  name:"แลบราดอร์",          speciesId:1, active:true },
  { id:3,  name:"พุดเดิ้ล",           speciesId:1, active:true },
  { id:4,  name:"ชิสุ",              speciesId:1, active:true },
  { id:5,  name:"ชิวาวา",            speciesId:1, active:true },
  { id:6,  name:"ปอมเมอเรเนียน",     speciesId:1, active:true },
  { id:7,  name:"เปอร์เซีย",         speciesId:2, active:true },
  { id:8,  name:"สยาม",             speciesId:2, active:true },
  { id:9,  name:"สก็อตติช โฟลด์",    speciesId:2, active:true },
  { id:10, name:"เมนคูน",           speciesId:2, active:true },
  { id:11, name:"ฮอลแลนด์ ลอป",     speciesId:3, active:true },
  { id:12, name:"มินิ เร็กซ์",       speciesId:3, active:true },
];
const INIT_VACCINES: VaccineItem[] = [
  { id:1, brand:"RabiVax",      typeId:1, icode:"", lots:[{ lot:"LOT2026A", expiry:"2027-06-30" }], active:true },
  { id:2, brand:"NovaVax",      typeId:2, icode:"", lots:[{ lot:"LOT2026B", expiry:"2027-03-31" }], active:true },
  { id:3, brand:"FelisGuard",   typeId:5, icode:"", lots:[{ lot:"LOT2026C", expiry:"2027-09-30" }], active:true },
  { id:4, brand:"KennelShield", typeId:null, icode:"", lots:[], active:true },
  { id:5, brand:"LeptoVax",     typeId:null, icode:"", lots:[], active:true },
  { id:6, brand:"FelisGuard",   typeId:6, icode:"", lots:[{ lot:"LOT2026D", expiry:"2028-01-31" }], active:true },
];
const INIT_ROOMS: Room[] = [
  { id:1, name:"ห้องตรวจ A",  type:"ห้องตรวจ",    active:true  },
  { id:2, name:"ห้องตรวจ B",  type:"ห้องตรวจ",    active:true  },
  { id:3, name:"ห้องผ่าตัด",  type:"ห้องผ่าตัด",  active:true  },
  { id:4, name:"ห้องพักฟื้น", type:"ห้องพักฟื้น", active:true  },
  { id:5, name:"ห้องแล็บ",    type:"ห้องแล็บ",    active:false },
];
const INIT_PERSONNEL: Personnel[] = [
  { id:1, name:"นพ. ปราโมทย์ วงศ์เพียร", licenseNo:"ว.12345", position:"สัตวแพทย์",       role:"สัตวแพทย์", roomId:1,    active:true, slotKey:"v1" },
  { id:2, name:"พญ. ศักรา สุขศรี",       licenseNo:"ว.23456", position:"สัตวแพทย์",       role:"สัตวแพทย์", roomId:2,    active:true, slotKey:"v2" },
  { id:6, name:"นพ. ธีรวัฒน์ คงเดช",     licenseNo:"ว.34567", position:"สัตวแพทย์",       role:"สัตวแพทย์", roomId:1,    active:true, slotKey:"v3" },
  { id:7, name:"พญ. ณัฐสุดา ทองพูล",     licenseNo:"ว.45678", position:"สัตวแพทย์",       role:"สัตวแพทย์", roomId:2,    active:true, slotKey:"v4" },
  { id:3, name:"อรัญ นพรัตน์",       licenseNo:"-",       position:"ผู้ช่วยสัตวแพทย์", role:"เจ้าหน้าที่",roomId:1,    active:true },
  { id:4, name:"ทอม ศรีนคร",         licenseNo:"-",       position:"เจ้าหน้าที่",       role:"เจ้าหน้าที่",roomId:null, active:true },
  { id:5, name:"ผู้ดูแลระบบ",         licenseNo:"-",       position:"ผู้ดูแลระบบ",       role:"แอดมิน",    roomId:null, active:true },
];
const ROLE_PERMS = [
  { name:"ข้อมูลเจ้าของและสัตว์เลี้ยง", admin:true,  vet:true,  staff:true  },
  { name:"บันทึกการตรวจ / EMR",         admin:true,  vet:true,  staff:false },
  { name:"นัดหมาย",                     admin:true,  vet:true,  staff:true  },
  { name:"คลังยา / ขายปลีก",            admin:true,  vet:false, staff:true  },
  { name:"ข้อมูลการเงิน",               admin:true,  vet:false, staff:true  },
  { name:"รายงาน",                      admin:true,  vet:true,  staff:false },
  { name:"ตั้งค่าระบบ",                 admin:true,  vet:false, staff:false },
  { name:"จัดการผู้ใช้งาน",            admin:true,  vet:false, staff:false },
];

// ─── Helpers ──────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${checked ? "bg-(--brand)" : "bg-gray-200"}`}
    >
      <span className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

/* Checkbox ใน footer ของโมดัลทะเบียนยา/ค่าบริการ
   เช่น "เพิ่มเข้าคลังสินค้า (stock)" · "ใช้ในงานผ่าตัด" */
function FooterCheck({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} title={hint}
      className="inline-flex items-center gap-2 cursor-pointer select-none text-left">
      <span
        className="w-[18px] h-[18px] rounded-[6px] flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: checked ? "linear-gradient(135deg, var(--brand), var(--brand-dark))" : "#fff",
          border: checked ? "1px solid var(--brand-dark)" : "1.5px solid #d1d5db",
        }}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
      </span>
      <span className="text-[12.5px] leading-tight whitespace-nowrap" style={{ fontWeight: 700, color: checked ? "var(--brand-dark)" : "#6b7280" }}>
        {label}
      </span>
    </button>
  );
}

/** เลขหน้าที่จะแสดงบนแถบแบ่งหน้า — ย่อด้วย "…" เมื่อหน้าเยอะ
    คงหน้าแรก · หน้าสุดท้าย · และหน้ารอบ ๆ หน้าปัจจุบันไว้เสมอ
    (เกิน 7 หน้าถึงจะเริ่มย่อ ต่ำกว่านั้นโชว์ครบหมดอ่านง่ายกว่า) */
function pageList(cur: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | "…"> = [1];
  const from = Math.max(2, cur - 1);
  const to = Math.min(total - 1, cur + 1);
  if (from > 2) out.push("…");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push("…");
  out.push(total);
  return out;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${active ? "bg-(--brand)/15 text-(--brand-dark)" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 500 }}>
      {active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
    </span>
  );
}

const inputCls = "vet-input";
const selectCls = "vet-select";
const labelCls = "vet-label";
const nextId = (arr: { id: number }[]) => Math.max(0, ...arr.map(x => x.id)) + 1;

// ─── Modal Wrapper ────────────────────────────────────────────────
/* ความกว้างโมดัล — md = ฟอร์มสั้น (ค่าเริ่มต้น)
   wide = ฟอร์มที่มี checkbox ใน footer ด้วย (448px แคบไป ข้อความจะตกบรรทัด)
   lg   = ฟอร์มที่มีตารางข้างใน เช่น ผูกสินค้าตัด Stock
   footerLeft = ช่องซ้ายของ footer สำหรับ checkbox/ตัวเลือกที่ต้องอยู่คู่กับปุ่มบันทึก */
const MODAL_W = { md: "max-w-md", wide: "max-w-[640px]", lg: "max-w-[880px]" } as const;
function Modal({ open, title, subtitle, icon, onClose, onSave, canSave, size = "md", footerLeft, hideFooter, children }: {
  open: boolean; title: string; subtitle?: string; icon?: React.ReactNode;
  onClose: () => void; onSave: () => void;
  canSave: boolean; size?: keyof typeof MODAL_W; footerLeft?: React.ReactNode;
  /** ฟอร์มข้างในมีปุ่มบันทึกเอง — ซ่อนแถบท้ายของโมดัล ไม่ให้มีปุ่มบันทึกสองชุด */
  hideFooter?: boolean; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={`w-full vet-modal ${MODAL_W[size]}`}
              style={{ maxHeight: "calc(100vh - 2rem)" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 100%, transparent) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon">
                      {icon ?? <Wrench className="w-[20px] h-[20px] text-white" />}
                    </div>
                    <div>
                      <h2 className="vet-section-title">{title}</h2>
                      {subtitle && <p className="vet-tiny mt-[2px]">{subtitle}</p>}
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close">
                    <X className="w-[16px] h-[16px] text-gray-500" />
                  </button>
                </div>
              </div>
              {/* Content */}
              <div className="vet-modal-body">
                {children}
              </div>
              {/* Footer */}
              {!hideFooter && (
                <div className="vet-modal-footer rounded-b-3xl">
                  {footerLeft && <div className="mr-auto min-w-0">{footerLeft}</div>}
                  <button onClick={onClose} className="vet-btn vet-btn-secondary">
                    ยกเลิก
                  </button>
                  <button onClick={onSave} disabled={!canSave} className="vet-btn vet-btn-primary btn-green">
                    <Check className="w-[16px] h-[16px]" />
                    บันทึก
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Section: วิธีการใช้ยา (Drug Usage Methods) ───────────────────
/* 3 แท็บ — ความถี่ · ช่วงเวลา · วิธีการใช้ยา
   ทั้ง 3 เป็นข้อมูลตั้งต้นสำหรับประกอบ "วิธีใช้ยา" ในใบสั่งยา
   เก็บใน localStorage · โครงตารางเหมือนหน้ารายการยา/Lab */
interface UsageRow { id: number; code: string; name: string; nameEn: string; active: boolean; }
const DU_FREQ_KEY = "ehp_du_freq_v1";
const DU_PERIOD_KEY = "ehp_du_period_v1";
const DU_METHOD_KEY = "ehp_du_method_v1";
const DU_FORM_KEY = "ehp_du_form_v1";
const duCode = (n: number) => String(n).padStart(4, "0");

const FREQ_SEED: UsageRow[] = [
  { id: 1, code: "0001", name: "วันละ 1 ครั้ง", nameEn: "ONCE_DAILY", active: true },
  { id: 2, code: "0002", name: "วันละ 2 ครั้ง", nameEn: "BID", active: true },
  { id: 3, code: "0003", name: "วันละ 3 ครั้ง", nameEn: "TID", active: true },
  { id: 4, code: "0004", name: "วันละ 4 ครั้ง", nameEn: "QID", active: true },
  { id: 5, code: "0005", name: "ทุก 12 ชม.",   nameEn: "Q12H", active: true },
  { id: 6, code: "0006", name: "ทุก 8 ชม.",    nameEn: "Q8H",  active: true },
  { id: 7, code: "0007", name: "เมื่อมีอาการ",   nameEn: "PRN",  active: true },
];
const PERIOD_SEED: UsageRow[] = [
  { id: 1, code: "0001", name: "เช้า หลังอาหาร",           nameEn: "MORNING_AFTER",     active: true },
  { id: 2, code: "0002", name: "เช้า-เย็น หลังอาหาร",       nameEn: "AM_PM_AFTER",       active: true },
  { id: 3, code: "0003", name: "เช้า-กลางวัน-เย็น หลังอาหาร", nameEn: "TID_AFTER",         active: true },
  { id: 4, code: "0004", name: "เช้า ก่อนอาหาร",           nameEn: "MORNING_BEFORE",    active: true },
  { id: 5, code: "0005", name: "ก่อนนอน",                 nameEn: "BEDTIME",           active: true },
];
const METHOD_SEED: UsageRow[] = [
  { id: 1,  code: "0001", name: "ป้อนทางปาก",       nameEn: "TAKE_ORAL",        active: true },
  { id: 2,  code: "0002", name: "ผสมอาหาร",         nameEn: "MIX_FOOD",         active: true },
  { id: 3,  code: "0003", name: "ให้หลังอาหาร",      nameEn: "GIVE_AFTER_MEAL",  active: true },
  { id: 4,  code: "0004", name: "ให้ก่อนอาหาร",      nameEn: "GIVE_BEFORE_MEAL", active: true },
  { id: 5,  code: "0005", name: "ให้เคี้ยวกิน",       nameEn: "CHEW",             active: true },
  { id: 6,  code: "0006", name: "ทาบริเวณผิวหนัง",    nameEn: "APPLY_SKIN",       active: true },
  { id: 7,  code: "0007", name: "ทาบริเวณแผล",       nameEn: "APPLY_WOUND",      active: true },
  { id: 8,  code: "0008", name: "หยดบริเวณหลังคอ",    nameEn: "SPOT_ON",          active: true },
  { id: 9,  code: "0009", name: "หยอดตา",           nameEn: "EYE_DROP",         active: true },
  { id: 10, code: "0010", name: "ป้ายตา",           nameEn: "EYE_OINTMENT",     active: true },
  { id: 11, code: "0011", name: "หยอดหู",           nameEn: "EAR_DROP",         active: true },
  { id: 12, code: "0012", name: "พ่นจมูก",          nameEn: "NASAL_SPRAY",      active: true },
  { id: 13, code: "0013", name: "ฉีดเข้าใต้ผิวหนัง",  nameEn: "SUBCUT",           active: true },
  { id: 14, code: "0014", name: "ฉีดเข้ากล้ามเนื้อ",  nameEn: "IM",               active: true },
  { id: 15, code: "0015", name: "ฉีดเข้าเส้นเลือด",   nameEn: "IV",               active: true },
  { id: 16, code: "0016", name: "เหน็บทวารหนัก",     nameEn: "RECTAL",           active: true },
  { id: 17, code: "0017", name: "อมใต้ลิ้น",         nameEn: "SUBLINGUAL",       active: true },
  { id: 18, code: "0018", name: "สวนล้าง",          nameEn: "ENEMA",            active: true },
  { id: 19, code: "0019", name: "พ่นละอองยา",        nameEn: "NEBULIZE",         active: true },
  { id: 20, code: "0020", name: "ป้ายเหงือก",        nameEn: "GUM",              active: true },
  { id: 21, code: "0021", name: "ผสมน้ำดื่ม",        nameEn: "MIX_WATER",        active: true },
  { id: 22, code: "0022", name: "หยอดปาก",          nameEn: "ORAL_DROP",        active: true },
];
/* รูปแบบยา (dosage form) — เม็ด/แคปซูล/น้ำเชื่อม ฯลฯ */
const FORM_SEED: UsageRow[] = [
  { id: 1,  code: "0001", name: "เม็ด",       nameEn: "TABLET",      active: true },
  { id: 2,  code: "0002", name: "แคปซูล",     nameEn: "CAPSULE",     active: true },
  { id: 3,  code: "0003", name: "น้ำเชื่อม",   nameEn: "SYRUP",       active: true },
  { id: 4,  code: "0004", name: "ยาน้ำแขวนตะกอน", nameEn: "SUSPENSION", active: true },
  { id: 5,  code: "0005", name: "ผง",         nameEn: "POWDER",      active: true },
  { id: 6,  code: "0006", name: "ครีม",       nameEn: "CREAM",       active: true },
  { id: 7,  code: "0007", name: "ขี้ผึ้ง",     nameEn: "OINTMENT",    active: true },
  { id: 8,  code: "0008", name: "เจล",        nameEn: "GEL",         active: true },
  { id: 9,  code: "0009", name: "ยาหยอดตา",   nameEn: "EYE_DROP",    active: true },
  { id: 10, code: "0010", name: "ยาป้ายตา",   nameEn: "EYE_OINTMENT", active: true },
  { id: 11, code: "0011", name: "ยาหยอดหู",   nameEn: "EAR_DROP",    active: true },
  { id: 12, code: "0012", name: "ยาฉีด",      nameEn: "INJECTION",   active: true },
  { id: 13, code: "0013", name: "ยาพ่น",      nameEn: "SPRAY",       active: true },
  { id: 14, code: "0014", name: "ยาเหน็บ",    nameEn: "SUPPOSITORY", active: true },
];

type DuTab = "freq" | "period" | "method" | "form";
const DU_MEALS = ["เช้า", "กลางวัน", "เย็น", "ก่อนนอน"];
const DU_BEFORE_AFTER = ["ไม่ระบุ", "ก่อนอาหาร", "หลังอาหาร"];

function DrugUsageSection() {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [tab, setTab] = useState<DuTab>("freq");

  const [freq, setFreq]     = useState<UsageRow[]>(() => loadJson(DU_FREQ_KEY, FREQ_SEED));
  const [period, setPeriod] = useState<UsageRow[]>(() => loadJson(DU_PERIOD_KEY, PERIOD_SEED));
  const [method, setMethod] = useState<UsageRow[]>(() => loadJson(DU_METHOD_KEY, METHOD_SEED));
  const [dform, setDform]   = useState<UsageRow[]>(() => loadJson(DU_FORM_KEY, FORM_SEED));
  useEffect(() => { try { localStorage.setItem(DU_FREQ_KEY, JSON.stringify(freq)); } catch { /* quota */ } }, [freq]);
  useEffect(() => { try { localStorage.setItem(DU_PERIOD_KEY, JSON.stringify(period)); } catch { /* quota */ } }, [period]);
  useEffect(() => { try { localStorage.setItem(DU_METHOD_KEY, JSON.stringify(method)); } catch { /* quota */ } }, [method]);
  useEffect(() => { try { localStorage.setItem(DU_FORM_KEY, JSON.stringify(dform)); } catch { /* quota */ } }, [dform]);

  const CFG: Record<DuTab, { rows: UsageRow[]; set: React.Dispatch<React.SetStateAction<UsageRow[]>>; label: string; addLabel: string; icon: React.ComponentType<{ className?: string }>; empty: string }> = {
    freq:   { rows: freq,   set: setFreq,   label: "ความถี่",     addLabel: "เพิ่มความถี่",   icon: RefreshCw,  empty: "ยังไม่มีความถี่" },
    period: { rows: period, set: setPeriod, label: "ช่วงเวลา",     addLabel: "เพิ่มช่วงเวลา",   icon: Clock,      empty: "ยังไม่มีช่วงเวลา" },
    method: { rows: method, set: setMethod, label: "วิธีการใช้ยา", addLabel: "เพิ่มวิธีการ",    icon: ListChecks, empty: "ยังไม่มีวิธีการใช้ยา" },
    form:   { rows: dform,  set: setDform,  label: "รูปแบบยา",     addLabel: "เพิ่มรูปแบบยา",   icon: Pill,       empty: "ยังไม่มีรูปแบบยา" },
  };
  const cur = CFG[tab];

  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); setQ(""); }, [tab]);

  const filtered = cur.rows.filter(r => !q.trim() || r.name.toLowerCase().includes(q.toLowerCase()) || r.nameEn.toLowerCase().includes(q.toLowerCase()) || r.code.includes(q));
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const curPage = Math.min(page, totalPages);
  const paged = filtered.slice((curPage - 1) * perPage, curPage * perPage);

  /* ── โมดัลเพิ่ม/แก้ไข ── */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UsageRow | null>(null);
  const [form, setForm] = useState<UsageRow>({ id: 0, code: "", name: "", nameEn: "", active: true });
  const setFm = <K extends keyof UsageRow>(k: K, v: UsageRow[K]) => setForm(f => ({ ...f, [k]: v }));
  /* ฟอร์มเสริมของแต่ละแท็บ */
  const [freqTimes, setFreqTimes] = useState("");                 // จำนวนครั้ง/วัน
  const [pdBeforeAfter, setPdBeforeAfter] = useState("ไม่ระบุ");
  const [pdMeals, setPdMeals] = useState<string[]>([]);

  const openAdd = () => {
    setEditing(null);
    setForm({ id: 0, code: "", name: "", nameEn: "", active: true });
    setFreqTimes(""); setPdBeforeAfter("ไม่ระบุ"); setPdMeals([]);
    setOpen(true);
  };
  const openEdit = (r: UsageRow) => { setEditing(r); setForm({ ...r }); setFreqTimes(""); setPdBeforeAfter("ไม่ระบุ"); setPdMeals([]); setOpen(true); };

  /* ช่วงเวลา: ชื่อสร้างจากมื้อ + ก่อน/หลังอาหาร อัตโนมัติ */
  const periodName = [pdMeals.join("-"), pdBeforeAfter !== "ไม่ระบุ" ? pdBeforeAfter : ""].filter(Boolean).join(" ");
  const canSave = tab === "period" ? pdMeals.length > 0 : !!form.name.trim();

  const handleSave = () => {
    const finalName = tab === "period" ? periodName : form.name.trim();
    cur.set(prev => {
      const nid = editing ? editing.id : (Math.max(0, ...prev.map(x => x.id)) + 1);
      const row: UsageRow = { ...form, id: nid, code: editing?.code ?? duCode(nid), name: finalName };
      return editing ? prev.map(x => x.id === editing.id ? row : x) : [...prev, row];
    });
    showSnackbar("success", editing ? `แก้ไข${cur.label}เรียบร้อย` : `เพิ่ม${cur.label}เรียบร้อย`);
    setOpen(false);
  };
  const toggleActive = (id: number) => cur.set(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const del = async (r: UsageRow) => {
    if (!(await confirm({ title: `ลบ${cur.label}`, description: `ลบ "${r.name}"?`, confirmText: "ลบ", kind: "danger" }))) return;
    cur.set(prev => prev.filter(x => x.id !== r.id));
    showSnackbar("success", "ลบรายการแล้ว");
  };

  return (
    <div className="space-y-3">
      {/* ตาราง / empty
          มุมนอก 30 / มุมใน 22 ห่างกัน 12px (= m-3) — มุมสองชั้นจึงขนานกันพอดี
          ถ้าใช้รัศมีเท่ากันทั้งคู่ มุมในจะดูแหลมกว่ามุมนอกทั้งที่ตัวเลขเท่ากัน */}
      <div className="bg-white rounded-[30px] border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        {/* ค้นหาอยู่ในหัวการ์ดเดียวกับตาราง เหมือนหน้าอื่น
            (ของเดิมลอยอยู่นอกการ์ด ทำให้หน้านี้ดูไม่เข้าชุดกับที่เหลือ) */}
        {/* หัวข้อ + แท็บ + ค้นหา อยู่ในการ์ดเดียวกับตารางทั้งหมด
            เปลี่ยนแท็บแล้วตารางใต้มันเปลี่ยนตาม วางรวมกันจึงเห็นความสัมพันธ์ชัด

            พื้นเป็น gradient ชุดเดียวกับ hero ของหน้าอื่น (สูตร 3 ชั้นเดียวกันเป๊ะ)
            จึงเปลี่ยนตามธีมเองทุกธีม และได้อนุภาคเทศกาลผ่าน .vet-hero-fx ด้วย
            ใส่ vet-hero-notree กันของประดับชิ้นใหญ่ (ต้นคริสต์มาส/ช่อดอกไม้)
            มาลงในแถบเตี้ย ๆ แบบนี้ */}
        <div className="vet-hero-fx vet-hero-notree relative m-3 mb-1 rounded-[22px] overflow-hidden" style={{
          backgroundImage: `
            radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
            radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
            linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)
          `,
          /* ไม่มีเงา — ระยะขอบรอบ (m-3) กับมุมมนทุกด้านบอกความเป็นการ์ดคนละชิ้นพอแล้ว
             เหลือขอบขาวบาง ๆ ไว้ตัดกับพื้นการ์ดตารางด้านหลัง */
          border: "1px solid rgba(255,255,255,0.30)",
        }}>
        <div className="relative px-4 pt-4 pb-1 flex items-center gap-2.5">
          {/* วงไอคอนขาวทึบ — ไอคอนสีธีมข้างใน อ่านออกบน hero ทุกสี */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#ffffff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.18)" }}>
            <ListChecks className="w-[18px] h-[18px]" style={{ color: "var(--brand-dark)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-white truncate" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.28)" }}>วิธีการใช้ยา</p>
            <p className="text-white/80 truncate" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px", textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>Drug Usage Methods · {filtered.length} รายการ</p>
          </div>
        </div>
        <div className="relative px-4 pt-3 pb-0">
          {/* glass segmented ชุดเดียวกับหน้าหลัก (นัดหมาย · ตารางแพทย์)
              — รางกระจกโปร่งบน hero + พิลล์ขาวที่ "เลื่อน" ตามแท็บที่เลือก
              พิลล์ใช้ layoutId ของ framer-motion จึงไถลไปเองตอนสลับ ไม่ใช่กะพริบเปลี่ยน */}
          <div className="relative inline-flex items-center p-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}>
            {(Object.keys(CFG) as DuTab[]).map(k => {
              const on = tab === k; const Ico = CFG[k].icon;
              return (
                <button key={k} onClick={() => setTab(k)}
                  className="relative px-3 py-1.5 rounded-full text-[12px] inline-flex items-center gap-1.5 transition-colors"
                  style={{
                    color: on ? "var(--brand-dark)" : "rgba(255,255,255,0.85)",
                    fontWeight: on ? 700 : 500,
                    zIndex: 1,
                  }}>
                  {on && (
                    <motion.span
                      layoutId="du-tab-indicator"
                      className="absolute inset-0 rounded-full bg-white"
                      style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 480, damping: 32 }}
                    />
                  )}
                  <Ico className="relative w-3.5 h-3.5" />
                  <span className="relative">{CFG[k].label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="relative px-4 pt-3 pb-4 flex items-center gap-2 flex-wrap">
          {/* ช่องค้นหายืดเต็มที่ว่าง — flex-1 + min-w-0 (ขาด min-w-0 ตัว input
              จะดันกล่องให้กว้างเกินจนปุ่มถูกเบียดตกขอบ) */}
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหารหัส / ชื่อ..." className="vet-search pl-9" />
          </div>
          {/* ปุ่มเพิ่มต่อท้ายช่องค้นหา — ข้อความเปลี่ยนตามแท็บที่เลือกอยู่ */}
          <button onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5 flex-shrink-0"
            style={{
              background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
              border: "1px solid var(--hero-btn-border)", boxShadow: "var(--hero-btn-shadow)", fontWeight: 700,
            }}>
            <Plus className="w-3.5 h-3.5" /> {cur.addLabel}
          </button>
        </div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#f3f4f6" }}>
              <cur.icon className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-[13px] text-gray-400" style={{ fontWeight: 600 }}>{q ? "ไม่พบรายการที่ค้นหา" : cur.empty}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{["รหัส", "ชื่อ", "ชื่อ (EN)", "สถานะ", "จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontWeight: 600 }}>{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paged.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{r.code}</td>
                      <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight: 500 }}>{r.name}</td>
                      <td className="px-4 py-2.5 text-gray-500 font-mono text-[12px]">{r.nameEn || "—"}</td>
                      <td className="px-4 py-2.5"><button onClick={() => toggleActive(r.id)}><StatusBadge active={r.active} /></button></td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(r)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => del(r)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              {/* ตัวเลือกจำนวนต่อหน้าอยู่ตรงนี้แทนข้อความ "หน้า x จาก y"
                  ซึ่งซ้ำกับจำนวนรายการที่บอกไว้ที่หัวข้อด้านบนอยู่แล้ว */}
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <span>แสดง</span>
                <select className="vet-select" style={{ width: 72, height: 34 }} value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span>รายการ/หน้า</span>
              </div>
              {/* เลขหน้ากดข้ามได้ทีเดียว — ลูกศรอย่างเดียวต้องกดทีละหน้า
                  หน้าเยอะจะย่อด้วย … โดยคงหน้าแรก/หน้าสุดท้าย/รอบ ๆ หน้าปัจจุบันไว้เสมอ */}
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={curPage === 1}
                  title="ก่อนหน้า"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-35 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {pageList(curPage, totalPages).map((n, i) =>
                  n === "…" ? (
                    <span key={`gap${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-gray-300">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n)}
                      className="min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-[12.5px] transition-colors"
                      style={n === curPage ? {
                        background: "var(--brand)", color: "#fff", fontWeight: 700,
                        boxShadow: "0 2px 6px color-mix(in srgb, var(--brand) 35%, transparent)",
                      } : {
                        border: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600, background: "#fff",
                      }}>
                      {n}
                    </button>
                  ),
                )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={curPage === totalPages}
                  title="ถัดไป"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-35 disabled:cursor-not-allowed">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* โมดัล */}
      <Modal open={open} title={`${editing ? "แก้ไข" : "เพิ่ม"}${cur.label === "วิธีการใช้ยา" ? "วิธีการใช้ยา" : cur.label}`} subtitle="กรอกข้อมูลให้ครบถ้วน"
        icon={<cur.icon className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={canSave}
        footerLeft={<FooterCheck label="เปิดใช้งาน" checked={form.active} onChange={v => setFm("active", v)} />}>

        {tab === "freq" && (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>จำนวนครั้ง/วัน</label>
              <input type="number" min={0} className={inputCls} value={freqTimes} placeholder="0"
                onChange={e => {
                  const v = e.target.value; setFreqTimes(v);
                  const n = Number(v);
                  /* ตั้งชื่อ "วันละ N ครั้ง" ให้ ถ้าผู้ใช้ยังไม่พิมพ์ชื่อเอง */
                  if (n > 0 && (!form.name || /^วันละ \d+ ครั้ง$/.test(form.name))) setFm("name", `วันละ ${n} ครั้ง`);
                }} />
              <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                ระบุจำนวนครั้ง/วัน ระบบจะตั้งชื่อเป็น "วันละ N ครั้ง" อัตโนมัติ — หรือพิมพ์ชื่อเอง เช่น "ทุก 12 ชม." โดยไม่ต้องใส่จำนวนครั้ง
              </p>
            </div>
            <div><label className={labelCls}>ชื่อ <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => setFm("name", e.target.value)} placeholder="เช่น ทุก 2 ชม." /></div>
            <div><label className={labelCls}>ชื่อ (ภาษาอังกฤษ)</label><input className={inputCls} value={form.nameEn} onChange={e => setFm("nameEn", e.target.value)} placeholder="เช่น BID / Q12H" /></div>
          </div>
        )}

        {tab === "period" && (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>ก่อน / หลังอาหาร</label>
              <div className="flex flex-wrap gap-1.5">
                {DU_BEFORE_AFTER.map(x => {
                  const on = pdBeforeAfter === x;
                  return <button key={x} type="button" onClick={() => setPdBeforeAfter(x)} className={`vet-chip ${on ? "vet-chip-active" : ""}`}>{x}</button>;
                })}
              </div>
            </div>
            <div>
              <label className={labelCls}>มื้อ <span className="required">*</span> <span className="text-gray-400 normal-case">(เลือกได้หลายมื้อ)</span></label>
              <div className="flex flex-wrap gap-1.5">
                {DU_MEALS.map(m => {
                  const on = pdMeals.includes(m);
                  return <button key={m} type="button" onClick={() => setPdMeals(p => on ? p.filter(x => x !== m) : [...p, m])} className={`vet-chip ${on ? "vet-chip-active" : ""}`}>{on && <Check className="w-3 h-3" strokeWidth={3} />}{m}</button>;
                })}
              </div>
            </div>
            <div className="rounded-xl px-3 py-2.5" style={{ background: "color-mix(in srgb, var(--brand) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)" }}>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] text-gray-500" style={{ fontWeight: 600 }}>ชื่อ (สร้างอัตโนมัติ)</p>
                <p className="text-[10.5px] text-gray-400">มื้อ/วัน: <span style={{ fontWeight: 700, color: "var(--brand-dark)" }}>{pdMeals.length}</span></p>
              </div>
              <p className="text-[14px] mt-0.5" style={{ fontWeight: 700, color: periodName ? "var(--brand-dark)" : "#9ca3af" }}>{periodName || "— เลือกมื้อก่อน —"}</p>
            </div>
            <div><label className={labelCls}>ชื่อ (ภาษาอังกฤษ)</label><input className={inputCls} value={form.nameEn} onChange={e => setFm("nameEn", e.target.value)} placeholder="เช่น AM_PM_AFTER" /></div>
          </div>
        )}

        {tab === "method" && (
          <div className="space-y-3">
            <div><label className={labelCls}>วิธีใช้ยา <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => setFm("name", e.target.value)} placeholder="เช่น ทาบริเวณที่มีอาการ วันละ 2-3 ครั้ง" /></div>
            <div><label className={labelCls}>วิธีใช้ยา (ภาษาอังกฤษ)</label><input className={inputCls} value={form.nameEn} onChange={e => setFm("nameEn", e.target.value)} placeholder="e.g. Apply to affected area 2-3 times daily" /></div>
          </div>
        )}

        {tab === "form" && (
          <div className="space-y-3">
            <div><label className={labelCls}>รูปแบบยา <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => setFm("name", e.target.value)} placeholder="เช่น น้ำเชื่อม" /></div>
            <div><label className={labelCls}>รูปแบบยา (ภาษาอังกฤษ)</label><input className={inputCls} value={form.nameEn} onChange={e => setFm("nameEn", e.target.value)} placeholder="e.g. Syrup" /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Section: การรับชำระเงิน ──────────────────────────────────────
/* บัญชีธนาคาร (เพิ่มได้หลายบัญชี · ตั้งบัญชีหลักได้) + หมายเลขพร้อมเพย์
   เก็บใน localStorage — ตอนต่อ backend ให้ย้ายไปตาราง payment_accounts */
interface BankAccount {
  id: number; bank: string; accountName: string; accountNo: string;
  accountType: string; branch: string; primary: boolean;
}
interface PromptPayAcc {
  id: number; type: string; number: string; name: string; primary: boolean;
}

const THAI_BANKS = [
  "ธนาคารกสิกรไทย (KBANK)", "ธนาคารไทยพาณิชย์ (SCB)", "ธนาคารกรุงเทพ (BBL)",
  "ธนาคารกรุงไทย (KTB)", "ธนาคารกรุงศรีอยุธยา (BAY)", "ธนาคารทหารไทยธนชาต (ttb)",
  "ธนาคารออมสิน (GSB)", "ธนาคารเพื่อการเกษตรฯ (BAAC)", "ธนาคารซีไอเอ็มบีไทย (CIMB)",
  "ธนาคารเกียรตินาคินภัทร (KKP)", "ธนาคารยูโอบี (UOB)", "ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)",
];
const ACCOUNT_TYPES = ["ออมทรัพย์", "กระแสรายวัน", "ฝากประจำ"];
const PROMPTPAY_TYPES = ["เบอร์โทรศัพท์", "เลขบัตรประชาชน", "เลขนิติบุคคล", "e-Wallet ID"];

const PAY_BANK_KEY = "ehp_pay_banks_v1";
const PAY_PP_KEY   = "ehp_pay_promptpay_v1";
const loadJson = <T,>(key: string, fallback: T): T => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
};
const BANK_SEED: BankAccount[] = [
  { id: 1, bank: "ธนาคารกสิกรไทย (KBANK)", accountName: "โรงพยาบาลสัตว์ อีเอชพี", accountNo: "123-4-56789-0", accountType: "ออมทรัพย์", branch: "สาขาพระราม 9", primary: true },
];
const PP_SEED: PromptPayAcc[] = [
  { id: 1, type: "เบอร์โทรศัพท์", number: "02-123-4567", name: "โรงพยาบาลสัตว์ อีเอชพี", primary: true },
];

function PaymentsSection() {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [banks, setBanks] = useState<BankAccount[]>(() => loadJson(PAY_BANK_KEY, BANK_SEED));
  const [pps, setPps]     = useState<PromptPayAcc[]>(() => loadJson(PAY_PP_KEY, PP_SEED));
  useEffect(() => { try { localStorage.setItem(PAY_BANK_KEY, JSON.stringify(banks)); } catch { /* quota */ } }, [banks]);
  useEffect(() => { try { localStorage.setItem(PAY_PP_KEY, JSON.stringify(pps)); } catch { /* quota */ } }, [pps]);

  /* ── โมดัลบัญชีธนาคาร ── */
  const emptyBank: BankAccount = { id: 0, bank: THAI_BANKS[0], accountName: "", accountNo: "", accountType: ACCOUNT_TYPES[0], branch: "", primary: false };
  const [bankOpen, setBankOpen] = useState(false);
  const [bankEditing, setBankEditing] = useState<BankAccount | null>(null);
  const [bankForm, setBankForm] = useState<BankAccount>(emptyBank);
  const setB = <K extends keyof BankAccount>(k: K, v: BankAccount[K]) => setBankForm(f => ({ ...f, [k]: v }));
  const openAddBank  = () => { setBankEditing(null); setBankForm({ ...emptyBank, primary: banks.length === 0 }); setBankOpen(true); };
  const openEditBank = (a: BankAccount) => { setBankEditing(a); setBankForm({ ...a }); setBankOpen(true); };
  const saveBank = () => {
    setBanks(prev => {
      let next = bankEditing
        ? prev.map(a => a.id === bankEditing.id ? bankForm : a)
        : [...prev, { ...bankForm, id: nextId(prev) }];
      /* บัญชีหลักมีได้ตัวเดียว · ถ้าไม่มีตัวไหนเป็นหลักเลย ให้ตัวแรกเป็นหลัก */
      if (bankForm.primary) next = next.map(a => ({ ...a, primary: a.id === (bankEditing?.id ?? Math.max(...next.map(x => x.id))) ? true : false }));
      if (!next.some(a => a.primary) && next.length) next[0].primary = true;
      return next;
    });
    showSnackbar("success", bankEditing ? "แก้ไขบัญชีเรียบร้อย" : "เพิ่มบัญชีธนาคารเรียบร้อย");
    setBankOpen(false);
  };
  const delBank = async (a: BankAccount) => {
    if (!(await confirm({ title: "ลบบัญชีธนาคาร", description: `ลบ "${a.bank} · ${a.accountNo}"?`, confirmText: "ลบ", kind: "danger" }))) return;
    setBanks(prev => {
      const next = prev.filter(x => x.id !== a.id);
      if (a.primary && next.length) next[0].primary = true;   // ลบบัญชีหลัก → เลื่อนตัวถัดไปเป็นหลัก
      return next;
    });
    showSnackbar("success", "ลบบัญชีแล้ว");
  };
  const setPrimaryBank = (id: number) => setBanks(prev => prev.map(a => ({ ...a, primary: a.id === id })));

  /* ── โมดัลพร้อมเพย์ ── */
  const emptyPp: PromptPayAcc = { id: 0, type: PROMPTPAY_TYPES[0], number: "", name: "", primary: false };
  const [ppOpen, setPpOpen] = useState(false);
  const [ppEditing, setPpEditing] = useState<PromptPayAcc | null>(null);
  const [ppForm, setPpForm] = useState<PromptPayAcc>(emptyPp);
  const setP = <K extends keyof PromptPayAcc>(k: K, v: PromptPayAcc[K]) => setPpForm(f => ({ ...f, [k]: v }));
  const openAddPp  = () => { setPpEditing(null); setPpForm({ ...emptyPp, primary: pps.length === 0 }); setPpOpen(true); };
  const openEditPp = (a: PromptPayAcc) => { setPpEditing(a); setPpForm({ ...a }); setPpOpen(true); };
  const savePp = () => {
    setPps(prev => {
      let next = ppEditing ? prev.map(a => a.id === ppEditing.id ? ppForm : a) : [...prev, { ...ppForm, id: nextId(prev) }];
      if (ppForm.primary) next = next.map(a => ({ ...a, primary: a.id === (ppEditing?.id ?? Math.max(...next.map(x => x.id))) }));
      if (!next.some(a => a.primary) && next.length) next[0].primary = true;
      return next;
    });
    showSnackbar("success", ppEditing ? "แก้ไขพร้อมเพย์เรียบร้อย" : "เพิ่มพร้อมเพย์เรียบร้อย");
    setPpOpen(false);
  };
  const delPp = async (a: PromptPayAcc) => {
    if (!(await confirm({ title: "ลบพร้อมเพย์", description: `ลบ "${a.number}"?`, confirmText: "ลบ", kind: "danger" }))) return;
    setPps(prev => { const next = prev.filter(x => x.id !== a.id); if (a.primary && next.length) next[0].primary = true; return next; });
    showSnackbar("success", "ลบพร้อมเพย์แล้ว");
  };
  const setPrimaryPp = (id: number) => setPps(prev => prev.map(a => ({ ...a, primary: a.id === id })));

  const PrimaryTag = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] flex-shrink-0"
      style={{ background: "color-mix(in srgb, var(--brand) 12%, transparent)", color: "var(--brand-dark)", fontWeight: 700 }}>
      <BadgeCheck className="w-3 h-3" /> บัญชีหลัก
    </span>
  );
  const RowActions = ({ onEdit, onDel }: { onEdit: () => void; onDel: () => void }) => (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
      <button onClick={onDel} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 px-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#34d399,#059669)", boxShadow: "0 4px 12px rgba(5,150,105,0.25), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
          <Coins className="w-[18px] h-[18px]" />
        </div>
        <div>
          <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>การรับชำระเงิน</p>
          <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Payment Methods · บัญชีธนาคาร &amp; พร้อมเพย์</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
      {/* ── บัญชีธนาคาร ── */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2.5">
          <Landmark className="w-4 h-4" style={{ color: "var(--brand-dark)" }} />
          <p className="text-[13px] text-gray-800 flex-1" style={{ fontWeight: 700 }}>บัญชีธนาคาร <span className="text-gray-400" style={{ fontWeight: 500 }}>· {banks.length} บัญชี</span></p>
          <button onClick={openAddBank} className="vet-btn vet-btn-primary btn-green vet-btn-sm inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> เพิ่มบัญชี</button>
        </div>
        <div className="p-4 space-y-3">
          {banks.length === 0 && <p className="col-span-full text-center text-[12.5px] text-gray-400 py-6">ยังไม่มีบัญชีธนาคาร</p>}
          {banks.map(a => (
            <div key={a.id} className="rounded-2xl p-3.5 relative"
              style={{ border: a.primary ? "1.5px solid color-mix(in srgb, var(--brand) 40%, transparent)" : "1px solid #eef0f2", background: a.primary ? "color-mix(in srgb, var(--brand) 4%, transparent)" : "#fff" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand-dark)" }}>
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{a.bank}</p>
                    {a.primary && <PrimaryTag />}
                  </div>
                  <p className="text-[13px] text-gray-700 font-mono mt-0.5">{a.accountNo}</p>
                  <p className="text-[11.5px] text-gray-500 mt-0.5 truncate">{a.accountName} · {a.accountType}{a.branch ? ` · ${a.branch}` : ""}</p>
                </div>
                <RowActions onEdit={() => openEditBank(a)} onDel={() => delBank(a)} />
              </div>
              {!a.primary && (
                <button onClick={() => setPrimaryBank(a.id)}
                  className="mt-2.5 w-full py-1.5 rounded-lg text-[11.5px] transition-colors hover:bg-(--brand)/5"
                  style={{ border: "1px dashed color-mix(in srgb, var(--brand) 30%, transparent)", color: "var(--brand-dark)", fontWeight: 600 }}>
                  ตั้งเป็นบัญชีหลัก
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── พร้อมเพย์ ── */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2.5">
          <QrCode className="w-4 h-4" style={{ color: "var(--brand-dark)" }} />
          <p className="text-[13px] text-gray-800 flex-1" style={{ fontWeight: 700 }}>พร้อมเพย์ <span className="text-gray-400" style={{ fontWeight: 500 }}>· {pps.length} หมายเลข</span></p>
          <button onClick={openAddPp} className="vet-btn vet-btn-primary btn-green vet-btn-sm inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> เพิ่มพร้อมเพย์</button>
        </div>
        <div className="p-4 space-y-3">
          {pps.length === 0 && <p className="col-span-full text-center text-[12.5px] text-gray-400 py-6">ยังไม่มีพร้อมเพย์</p>}
          {pps.map(a => (
            <div key={a.id} className="rounded-2xl p-3.5"
              style={{ border: a.primary ? "1.5px solid color-mix(in srgb, var(--brand) 40%, transparent)" : "1px solid #eef0f2", background: a.primary ? "color-mix(in srgb, var(--brand) 4%, transparent)" : "#fff" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand-dark)" }}>
                  {a.type === "เบอร์โทรศัพท์" ? <Phone className="w-5 h-5" /> : a.type === "e-Wallet ID" ? <CreditCard className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] text-gray-900 font-mono truncate" style={{ fontWeight: 700 }}>{a.number}</p>
                    {a.primary && <PrimaryTag />}
                  </div>
                  <p className="text-[11.5px] text-gray-500 mt-0.5 truncate">{a.type}{a.name ? ` · ${a.name}` : ""}</p>
                </div>
                <RowActions onEdit={() => openEditPp(a)} onDel={() => delPp(a)} />
              </div>
              {!a.primary && (
                <button onClick={() => setPrimaryPp(a.id)}
                  className="mt-2.5 w-full py-1.5 rounded-lg text-[11.5px] transition-colors hover:bg-(--brand)/5"
                  style={{ border: "1px dashed color-mix(in srgb, var(--brand) 30%, transparent)", color: "var(--brand-dark)", fontWeight: 600 }}>
                  ตั้งเป็นพร้อมเพย์หลัก
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* โมดัลบัญชีธนาคาร */}
      <Modal open={bankOpen} title={bankEditing ? "แก้ไขบัญชีธนาคาร" : "เพิ่มบัญชีธนาคาร"} subtitle="กรอกข้อมูลบัญชีให้ครบถ้วน" icon={<Landmark className="w-[20px] h-[20px] text-white" />}
        onClose={() => setBankOpen(false)} onSave={saveBank} canSave={!!bankForm.accountName.trim() && !!bankForm.accountNo.trim()}
        footerLeft={<FooterCheck label="ตั้งเป็นบัญชีหลัก" checked={bankForm.primary} onChange={v => setB("primary", v)} />}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={labelCls}>ธนาคาร</label>
            <select className={selectCls} value={bankForm.bank} onChange={e => setB("bank", e.target.value)}>{THAI_BANKS.map(x => <option key={x}>{x}</option>)}</select></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อบัญชี <span className="required">*</span></label><input className={inputCls} value={bankForm.accountName} onChange={e => setB("accountName", e.target.value)} placeholder="ชื่อเจ้าของบัญชี" /></div>
          <div><label className={labelCls}>เลขที่บัญชี <span className="required">*</span></label><input className={inputCls} value={bankForm.accountNo} onChange={e => setB("accountNo", e.target.value)} placeholder="xxx-x-xxxxx-x" /></div>
          <div><label className={labelCls}>ประเภทบัญชี</label>
            <select className={selectCls} value={bankForm.accountType} onChange={e => setB("accountType", e.target.value)}>{ACCOUNT_TYPES.map(x => <option key={x}>{x}</option>)}</select></div>
          <div className="col-span-2"><label className={labelCls}>สาขา</label><input className={inputCls} value={bankForm.branch} onChange={e => setB("branch", e.target.value)} placeholder="เช่น สาขาพระราม 9" /></div>
        </div>
      </Modal>

      {/* โมดัลพร้อมเพย์ */}
      <Modal open={ppOpen} title={ppEditing ? "แก้ไขพร้อมเพย์" : "เพิ่มพร้อมเพย์"} subtitle="กรอกหมายเลขพร้อมเพย์" icon={<QrCode className="w-[20px] h-[20px] text-white" />}
        onClose={() => setPpOpen(false)} onSave={savePp} canSave={!!ppForm.number.trim()}
        footerLeft={<FooterCheck label="ตั้งเป็นพร้อมเพย์หลัก" checked={ppForm.primary} onChange={v => setP("primary", v)} />}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>ประเภท</label>
            <select className={selectCls} value={ppForm.type} onChange={e => setP("type", e.target.value)}>{PROMPTPAY_TYPES.map(x => <option key={x}>{x}</option>)}</select></div>
          <div><label className={labelCls}>หมายเลข <span className="required">*</span></label><input className={inputCls} value={ppForm.number} onChange={e => setP("number", e.target.value)} placeholder="เบอร์โทร / เลขบัตร ปชช." /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อบัญชีพร้อมเพย์</label><input className={inputCls} value={ppForm.name} onChange={e => setP("name", e.target.value)} placeholder="ชื่อที่แสดงตอนสแกนจ่าย" /></div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: ข้อมูลคลินิก ────────────────────────────────────────
/* ข้อมูลทะเบียนคลินิกมาจากบัญชีที่ล็อกอิน — แก้ได้เฉพาะโลโก้
   ที่เหลือเป็นข้อมูลทะเบียนที่ต้องแก้จากระบบส่วนกลาง จึงล็อกไว้ทั้งหมด */
function ClinicSection() {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const { clinic, setLogo, hasLogo } = useClinicProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const pickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) { showSnackbar("error", "รองรับเฉพาะไฟล์รูปภาพ"); return; }
    if (f.size > 1.5 * 1024 * 1024) { showSnackbar("error", "ไฟล์ใหญ่เกิน 1.5 MB — ย่อรูปก่อนอัปโหลด"); return; }
    const r = new FileReader();
    r.onload = ev => { setLogo(ev.target?.result as string); showSnackbar("success", "เปลี่ยนโลโก้คลินิกเรียบร้อย"); };
    r.readAsDataURL(f);
  };

  /* ไม่ล็อกความสูง / ไม่มี scroll ในคอลัมน์ — เนื้อหาสั้น ปล่อยไหลตามหน้าปกติ */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

      {/* ══ ซ้าย: การ์ดโลโก้ ══ */}
      <div className="lg:pl-1.5 space-y-4">
        <SectionHead icon={<ImageIcon className="w-4 h-4 text-(--brand-dark)" />} title="โลโก้คลินิก" hint="ส่วนเดียวที่แก้ไขได้" />

        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          {/* เรียงลงมา: โลโก้ → คำแนะนำ → ปุ่ม */}
          <div className="flex flex-col items-center text-center gap-3">
            {/* ยังไม่อัปโหลด = กล่องขาวเปล่า (ไม่มีโลโก้เริ่มต้น) */}
            <span className="w-[160px] h-[160px] rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white"
              style={{ border: hasLogo ? "1px solid #eef0f2" : "1.5px dashed #d1d5db", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)" }}>
              {hasLogo
                ? <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-contain p-3" draggable={false} />
                : <ImageIcon className="w-9 h-9 text-gray-300" />}
            </span>

            <p className="text-[11.5px] text-gray-500 leading-snug max-w-[260px]">
              แนะนำ PNG พื้นหลังโปร่ง สัดส่วนจัตุรัส ไม่เกิน 1.5 MB
            </p>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickLogo} />
              <button onClick={() => fileRef.current?.click()} className="vet-btn vet-btn-primary btn-green vet-btn-sm inline-flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> {hasLogo ? "เปลี่ยนภาพ" : "อัปโหลดภาพ"}
              </button>
              {hasLogo && (
                <button onClick={() => { setLogo(null); showSnackbar("success", "ลบโลโก้แล้ว"); }}
                  className="vet-btn vet-btn-secondary vet-btn-sm">ลบโลโก้</button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ══ ขวา: ข้อมูลทะเบียน — หัวข้อปักบนสุด เลื่อนเฉพาะรายการ ══ */}
      <div>
        <SectionHead icon={<Lock className="w-4 h-4 text-gray-400" />} title="ข้อมูลหน่วยงาน" hint={`แก้ไขได้ที่ระบบบัญชี EHP · บัญชี ${user?.username ?? "—"}`} />
        <div className="space-y-4">

          <section className="rounded-2xl border border-gray-100 bg-white p-4">
            <SectionHead icon={<Building2 className="w-4 h-4 text-(--brand-dark)" />} title="ข้อมูลทั่วไป" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <RoField label="รหัสสถานพยาบาล" value={clinic.hospitalCode} mono />
              <RoField label="ประเภท" value={clinic.type} />
              <RoField label="ชื่อ" value={clinic.name} wide />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4">
            <SectionHead icon={<HomeIcon className="w-4 h-4 text-(--brand-dark)" />} title="ที่อยู่" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <RoField label="ที่อยู่เพิ่มเติม" wide
                value={[clinic.addressExtra, clinic.subDistrict && `แขวง${clinic.subDistrict}`, clinic.district, clinic.province, clinic.postcode].filter(Boolean).join(" ")} />
              <RoField label="จังหวัด" value={clinic.province} />
              <RoField label="อำเภอ / เขต" value={clinic.district} />
              <RoField label="ตำบล / แขวง" value={clinic.subDistrict} />
              <RoField label="รหัส ปณ" value={clinic.postcode} mono />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4">
            <SectionHead icon={<Shield className="w-4 h-4 text-(--brand-dark)" />} title="ใบอนุญาต & ติดต่อ" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <RoField label="เลขที่ใบอนุญาต" value={clinic.licenseNo} />
              <RoField label="หมายเลขโทรศัพท์" value={clinic.phone} mono />
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}

/** แสดงข้อมูลแบบอ่านอย่างเดียว — เป็นข้อความ ไม่ใช่ช่องกรอก
    ไม่มีค่า = เขียน "ไม่มีข้อมูล" สีเทา จะได้รู้ว่าว่างจริง ไม่ใช่โหลดไม่ขึ้น */
function RoField({ label, value, wide, mono }: { label: string; value?: string; wide?: boolean; mono?: boolean }) {
  const v = (value ?? "").trim();
  return (
    <div className={`${wide ? "sm:col-span-2 " : ""}py-2 border-b border-gray-50 last:border-b-0`}>
      <p className="text-[10.5px] text-gray-400" style={{ fontWeight: 600, letterSpacing: "0.2px" }}>{label}</p>
      <p className="mt-0.5 break-words"
        style={{
          fontSize: "calc(13px * var(--fs))",
          fontWeight: v ? 600 : 400,
          color: v ? "#1e2939" : "#9ca3af",
          fontFamily: v && mono ? "ui-monospace, monospace" : undefined,
        }}>
        {v || "ไม่มีข้อมูล"}
      </p>
    </div>
  );
}


// ─── Section: แท็บ OPD / IPD ─────────────────────────────────────
/* เลือกแท็บที่แสดง + ลากสลับตำแหน่ง แยก 2 ชุด (OPD / IPD)
   ลากด้วย pointer event ตรง ๆ ไม่ใช้ HTML5 drag เพราะ ghost image
   ของ native drag คุมหน้าตาไม่ได้และบนแท็บเล็ตใช้ไม่ได้ */
function TabsSection() {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { getPref, setOrder, toggleHidden, resetScope } = useTabPrefs();
  const [scope, setScope] = useState<TabScope>("opd");

  const META = scope === "opd" ? OPD_TAB_META : IPD_TAB_META;
  const allKeys = META.map(m => m.key);
  const { order, hidden } = getPref(scope, allKeys);
  const locked = LOCKED_TABS[scope];
  const labelOf = (k: string) => META.find(m => m.key === k)?.label ?? k;
  const shownCount = order.filter(k => !hidden.includes(k)).length;

  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);   // ตำแหน่งตอนเริ่มลาก ไว้บอก "เดิม N → M"

  /* ปล่อยเมาส์ที่ไหนก็จบการลาก — ไม่งั้นค้างสถานะถ้าปล่อยนอกรายการ */
  useEffect(() => {
    if (!dragKey) return;
    const stop = () => { setDragKey(null); setDragFrom(null); };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => { window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); };
  }, [dragKey]);

  /* หาแถวใต้เคอร์เซอร์เอง แทนการรอ pointerenter ของแต่ละแถว
     เพราะระหว่างลาก ปุ่มจับยึด pointer ไว้ อีเวนต์ enter ของแถวอื่นจะไม่ยิง */
  const onMove = (e: React.PointerEvent) => {
    if (!dragKey) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const overKey = el?.closest<HTMLElement>("[data-tabkey]")?.dataset.tabkey;
    if (!overKey || overKey === dragKey) return;
    const next = [...order];
    const from = next.indexOf(dragKey), to = next.indexOf(overKey);
    if (from === -1 || to === -1) return;
    next.splice(to, 0, next.splice(from, 1)[0]);
    setOrder(scope, next);
  };

  const doReset = async () => {
    if (!(await confirm({ title: `คืนค่าแท็บ ${scope.toUpperCase()}`, description: "ลำดับและการซ่อนแท็บจะกลับเป็นค่าตั้งต้น", confirmText: "คืนค่า" }))) return;
    resetScope(scope);
    showSnackbar("success", `คืนค่าแท็บ ${scope.toUpperCase()} แล้ว`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#34d399,#059669)", boxShadow: "0 4px 12px rgba(5,150,105,0.25), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
            <Layers className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>แท็บ OPD / IPD</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>
              Tab Layout · แสดงอยู่ {shownCount} จาก {allKeys.length} แท็บ
            </p>
          </div>
        </div>
        <button onClick={doReset} className="vet-btn vet-btn-secondary vet-btn-sm">คืนค่าเริ่มต้น</button>
      </div>

      {/* สลับชุด OPD / IPD */}
      <div className="flex p-1 rounded-full bg-gray-100 max-w-[320px]">
        {(["opd", "ipd"] as TabScope[]).map(k => {
          const on = scope === k;
          return (
            <button key={k} onClick={() => setScope(k)}
              className="flex-1 rounded-full py-1.5 transition-all duration-200"
              style={{
                fontSize: "calc(12.5px * var(--fs))", fontWeight: on ? 700 : 600,
                background: on ? "#ffffff" : "transparent",
                color: on ? "var(--brand-dark)" : "#6b7280",
                boxShadow: on ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              }}>
              {k === "opd" ? "OPD ผู้ป่วยนอก" : "IPD ผู้ป่วยใน"}
            </button>
          );
        })}
      </div>

      {/* ── ตัวอย่างแถบแท็บจริง — อัปเดตทันทีที่ลาก/ปิดแท็บ ── */}
      <div className="rounded-2xl overflow-hidden" style={{
        backgroundImage: `radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
          radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
          linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)`,
      }}>
        <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-white/70" />
          <span className="text-white/85 text-[11px]" style={{ fontWeight: 700 }}>ตัวอย่างแถบแท็บ</span>
          <span className="text-white/50 text-[10.5px]">หน้าเคส {scope === "opd" ? "OPD" : "IPD"} · เลื่อนดูได้</span>
          {dragKey && (
            <span className="ml-auto text-white text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.22)", fontWeight: 700 }}>
              กำลังย้าย “{labelOf(dragKey)}” → ตำแหน่งที่ {order.filter(x => !hidden.includes(x)).indexOf(dragKey) + 1}
            </span>
          )}
        </div>
        <div className="px-3 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-min bg-white/95 rounded-full p-1"
            style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
            {order.filter(k => !hidden.includes(k)).map((k, i) => {
              const m = META.find(x => x.key === k)!;
              const on = i === 0;   /* แท็บแรกคือหน้าที่เปิดมาเจอ */
              return (
                <span key={k}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full whitespace-nowrap transition-all"
                  style={k === dragKey
                    ? { background: "#fff", color: "var(--brand-dark)", fontWeight: 800, fontSize: "calc(11.5px * var(--fs))", boxShadow: "0 0 0 2px var(--brand-dark)" }
                    : on
                    ? { background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", color: "#fff", fontWeight: 700, fontSize: "calc(11.5px * var(--fs))" }
                    : { color: "#6b7280", fontWeight: 600, fontSize: "calc(11.5px * var(--fs))" }}>
                  <img src={m.img} alt="" className="w-4 h-4 object-contain flex-shrink-0" draggable={false} />
                  {m.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-2.5 border-b border-[#f3f4f6] flex items-center gap-2 flex-wrap">
          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-[12px] text-gray-600" style={{ fontWeight: 700 }}>ลากเพื่อสลับตำแหน่ง</p>
          <span className="text-[11px] text-gray-400">ลำดับบนลงล่าง = ลำดับซ้ายไปขวาในหน้าเคส</span>
        </div>

        <div className="divide-y divide-gray-50" onPointerMove={onMove} style={{ touchAction: dragKey ? "none" : undefined }}>
          {order.map((k, i) => {
            const off = hidden.includes(k);
            const isLocked = locked.includes(k);
            const dragging = dragKey === k;
            return (
              <div key={k}
                data-tabkey={k}
                className="relative px-4 py-2.5 flex items-center gap-3 transition-colors"
                style={{
                  background: dragging ? "color-mix(in srgb, var(--brand) 10%, transparent)" : undefined,
                  opacity: off ? 0.45 : dragKey && !dragging ? 0.55 : 1,
                  boxShadow: dragging ? "inset 3px 0 0 var(--brand-dark), 0 6px 18px rgba(0,0,0,0.10)" : undefined,
                  zIndex: dragging ? 2 : undefined,
                }}>
                {/* เส้นบอกจุดวาง — ขีดที่ขอบบนของแถวที่ลากอยู่ = จะแทรกตรงนี้ */}
                {dragging && (
                  <span aria-hidden className="absolute left-0 right-0 -top-px flex items-center pointer-events-none" style={{ height: 2 }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0 -ml-0.5" style={{ background: "var(--brand-dark)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--brand) 25%, transparent)" }} />
                    <span className="flex-1 h-[2px] rounded-full" style={{ background: "var(--brand-dark)" }} />
                    <span className="w-2 h-2 rounded-full flex-shrink-0 -mr-0.5" style={{ background: "var(--brand-dark)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--brand) 25%, transparent)" }} />
                  </span>
                )}

                {/* ป้ายบอกว่าตอนนี้ลากมาอยู่ตำแหน่งไหนแล้ว — ตอบคำถาม "จะไปลงตรงไหน" */}
                {dragging && (
                  <span className="absolute right-16 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] pointer-events-none whitespace-nowrap"
                    style={{ background: "var(--brand-dark)", color: "#fff", fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,0.20)" }}>
                    ตำแหน่งที่ {i + 1} / {order.length}
                    {dragFrom !== null && dragFrom !== i && (
                      <span className="opacity-70">· เดิมที่ {dragFrom + 1}</span>
                    )}
                  </span>
                )}
                <button
                  onPointerDown={e => { e.preventDefault(); setDragKey(k); setDragFrom(order.indexOf(k)); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 flex-shrink-0"
                  style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                  title="ลากเพื่อย้าย">
                  <GripVertical className="w-4 h-4" />
                </button>

                <span className="w-6 text-[11px] text-gray-400 tabular-nums flex-shrink-0">{i + 1}</span>
                <img src={META.find(m => m.key === k)?.img} alt="" className="w-5 h-5 object-contain flex-shrink-0" draggable={false} />

                <span className="flex-1 min-w-0 text-[13px] text-gray-800 truncate" style={{ fontWeight: 600 }}>
                  {labelOf(k)}
                  {isLocked && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full align-middle"
                      style={{ background: "#f3f4f6", color: "#9ca3af", fontWeight: 700 }}>บังคับ</span>
                  )}
                </span>

                {isLocked
                  ? <Lock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  : <Toggle checked={!off} onChange={() => toggleHidden(scope, k)} />}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 px-1">
        แท็บ "บังคับ" ปิดไม่ได้ เพราะเป็นจุดเริ่ม/จบของงาน — OPD: บันทึกส่งตรวจ · ชำระเงิน / IPD: ภาพรวม · Discharge
      </p>
    </div>
  );
}

// ─── Section: คีย์ลัด ─────────────────────────────────────────────
/* คีย์เป็นชุดตายตัว 10 ชุด (Alt+1…Alt+0) แก้ตัวคีย์ไม่ได้
   ผู้ใช้เลือกได้แค่ว่าแต่ละคีย์จะพาไปหน้าไหน */
function HotkeysSection() {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { actions, enabled, setEnabled, setAction, resetAll } = useShortcutKeys();

  /* จัดกลุ่มปลายทางให้ dropdown อ่านง่าย */
  const grouped = SHORTCUT_ACTIONS.reduce<Record<string, typeof SHORTCUT_ACTIONS>>((m, a) => {
    (m[a.group] ??= []).push(a); return m;
  }, {});
  const usedCount = actions.filter(Boolean).length;

  const doReset = async () => {
    if (!(await confirm({ title: "คืนค่าคีย์ลัดเริ่มต้น", description: "ปลายทางทั้ง 10 คีย์จะกลับเป็นค่าตั้งต้น", confirmText: "คืนค่า" }))) return;
    resetAll();
    showSnackbar("success", "คืนค่าคีย์ลัดเริ่มต้นแล้ว");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#38bdf8,#0369a1)", boxShadow: "0 4px 12px rgba(3,105,161,0.25), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
            <Keyboard className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>คีย์ลัด</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>
              Keyboard Shortcuts · ใช้อยู่ {usedCount} จาก {SHORTCUT_COMBOS.length} คีย์
            </p>
          </div>
        </div>
        <button onClick={doReset} className="vet-btn vet-btn-secondary vet-btn-sm">คืนค่าเริ่มต้น</button>
      </div>

      {/* เปิด/ปิดคีย์ลัดทั้งหมด */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-3"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="min-w-0">
          <p className="text-[13px] text-gray-800" style={{ fontWeight: 700 }}>เปิดใช้งานคีย์ลัด</p>
          <p className="text-[11.5px] text-gray-500 mt-0.5">
            ระบบไม่ยิงคีย์ลัดขณะพิมพ์ในช่องข้อความ — พิมพ์ ! @ # ในฟอร์มได้ตามปกติ
          </p>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-2.5 border-b border-[#f3f4f6] flex items-center gap-2 flex-wrap">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-[12px] text-gray-600" style={{ fontWeight: 700 }}>ปุ่มคีย์บอร์ดกำหนดมาให้แล้ว</p>
          <span className="text-[11px] text-gray-400">เลือกได้เฉพาะหน้าปลายทาง</span>
        </div>

        <div className="divide-y divide-gray-50" style={{ opacity: enabled ? 1 : 0.55 }}>
          {SHORTCUT_COMBOS.map((combo, i) => {
            const target = actions[i];
            const info = actionByPath(target);
            return (
              <div key={combo} className="px-4 py-2.5 grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-2 sm:gap-4 sm:items-center">
                {/* ปุ่มคีย์ — แสดงเป็น keycap แก้ไม่ได้ */}
                {/* ปุ่มคีย์แสดงเป็นชิป — ชื่อปุ่มเหมือนกันทั้ง Windows/Mac */}
                <div className="flex items-center gap-1">
                  {combo.split("+").flatMap((part, k) => [
                    ...(k > 0 ? [<span key={`p${k}`} className="text-gray-300 text-[11px]">+</span>] : []),
                    <span key={part}
                      className="inline-flex items-center justify-center gap-1 px-2.5 h-7 rounded-full text-[11.5px]"
                      style={{
                        fontWeight: 700,
                        background: "color-mix(in srgb, var(--brand) 8%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--brand) 28%, transparent)",
                        color: "var(--brand-dark)",
                        minWidth: 30,
                      }}>
                      {/* ⇧ คือสัญลักษณ์สากลของปุ่ม Shift — ช่วยให้หาเจอบนคีย์บอร์ดเร็วขึ้น */}
                      {part === "shift" && <ArrowBigUp className="w-3.5 h-3.5" strokeWidth={2.5} />}
                      {comboLabel(part)}
                    </span>,
                  ])}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <select className={selectCls} style={{ height: 36 }} disabled={!enabled}
                    value={target}
                    onChange={e => {
                      setAction(i, e.target.value);
                      const lb = actionByPath(e.target.value)?.label;
                      showSnackbar("success", lb ? `${comboLabel(combo)} → ${lb}` : `ยกเลิกคีย์ ${comboLabel(combo)} แล้ว`);
                    }}>
                    <option value="">— ไม่ใช้คีย์นี้ —</option>
                    {Object.entries(grouped).map(([g, list]) => (
                      <optgroup key={g} label={g}>
                        {list.map(a => <option key={a.path} value={a.path}>{a.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <span className="text-[11px] text-gray-400 font-mono flex-shrink-0 hidden sm:inline w-[110px] truncate">
                    {info ? info.path : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 px-1">
        หน้าหนึ่งผูกได้คีย์เดียว — เลือกหน้าที่ผูกกับคีย์อื่นอยู่ ระบบจะถอดออกจากคีย์เดิมให้อัตโนมัติ
      </p>
    </div>
  );
}

// ─── Section: แจ้งเตือน ───────────────────────────────────────────
function NotifySection() {
  const { showSnackbar } = useSnackbar();
  const [vaccineOn, setVaccineOn]   = useState(true);
  const [vaccineDays, setVaccineDays] = useState(7);
  const [apptOn, setApptOn]         = useState(false);
  const [stockOn, setStockOn]       = useState(false);

  const autoSave = (label: string, on: boolean) =>
    showSnackbar("success", `${on ? "เปิด" : "ปิด"} "${label}" แล้ว`);

  type NotifyRow = {
    key: string;
    icon: React.ComponentType<{ className?: string }>;
    grad: string;
    accent: string;
    title: string;
    desc: string;
    enabled: boolean;
    onToggle: (v: boolean) => void;
    comingSoon?: boolean;
    extra?: React.ReactNode;
  };
  const rows: NotifyRow[] = [
    {
      key: "vaccine",
      icon: Syringe,
      grad: "linear-gradient(135deg,#60a5fa,#2563eb)",
      accent: "rgba(37,99,235,0.30)",
      title: "วัคซีนถึงกำหนด",
      desc: "แจ้งเตือนเจ้าของสัตว์เลี้ยงเมื่อวัคซีนใกล้ถึงกำหนดฉีด",
      enabled: vaccineOn,
      onToggle: (v: boolean) => { setVaccineOn(v); autoSave("วัคซีนถึงกำหนด", v); },
      extra: vaccineOn && (
        <div className="mt-3 inline-flex items-center gap-2.5 bg-[#f0fbf8] rounded-xl px-3.5 py-2 border border-(--brand)/15">
          <span className="text-[12px] text-gray-600">แจ้งเตือนล่วงหน้า</span>
          <input
            type="number" min={1} max={30} value={vaccineDays}
            onChange={e => setVaccineDays(Number(e.target.value))}
            className="w-14 border border-(--brand)/30 rounded-lg px-2 py-1 text-[12.5px] text-center focus:outline-none focus:ring-2 focus:ring-(--brand)/30 bg-white"
            style={{ fontWeight: 600 }}
          />
          <span className="text-[12px] text-gray-600">วัน</span>
        </div>
      ),
    },
    {
      key: "appt",
      icon: AlertCircle,
      grad: "linear-gradient(135deg,#fb923c,#ea580c)",
      accent: "rgba(234,88,12,0.30)",
      title: "นัดหมายล่วงหน้า",
      desc: "แจ้งเตือนก่อนถึงวันนัดหมาย",
      enabled: apptOn,
      onToggle: (v: boolean) => { setApptOn(v); autoSave("นัดหมายล่วงหน้า", v); },
      comingSoon: true,
    },
    {
      key: "stock",
      icon: AlertCircle,
      grad: "linear-gradient(135deg,#fb7185,#e11d48)",
      accent: "rgba(225,29,72,0.30)",
      title: "ยาและวัคซีนสต็อกต่ำ",
      desc: "แจ้งเตือนเมื่อสินค้าต่ำกว่า stock ขั้นต่ำ",
      enabled: stockOn,
      onToggle: (v: boolean) => { setStockOn(v); autoSave("ยาและวัคซีนสต็อกต่ำ", v); },
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Section title + count */}
      <div className="px-1">
        <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ระบบแจ้งเตือนอัตโนมัติ</p>
        <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>
          Notification Settings · {rows.filter(r => r.enabled).length}/{rows.length} เปิดใช้งาน
        </p>
      </div>

      {/* Rows — each its own card */}
      <div className="space-y-2.5">
        {rows.map(r => {
          const Ico = r.icon;
          return (
            <div
              key={r.key}
              className="bg-white rounded-2xl p-4 transition-all"
              style={{
                border: `1px solid ${r.enabled ? "color-mix(in srgb, var(--brand) 20%, transparent)" : "#f3f4f6"}`,
                boxShadow: r.enabled
                  ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px color-mix(in srgb, var(--brand) 6%, transparent)"
                  : "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      background: r.grad,
                      boxShadow: `0 4px 12px ${r.accent}, inset 0 1px 0 rgba(255,255,255,0.30)`,
                    }}
                  >
                    <Ico className="w-[18px] h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] text-gray-900" style={{ fontWeight: 700 }}>{r.title}</span>
                      {r.comingSoon && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(245,158,11,0.10)", color: "#b45309", border: "1px solid rgba(245,158,11,0.30)", fontWeight: 600 }}
                        >
                          เร็วๆ นี้
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-gray-500 mt-0.5">{r.desc}</p>
                    {r.extra}
                  </div>
                </div>
                <Toggle checked={r.enabled} onChange={r.onToggle} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: ยา ─────────────────────────────────────────────────
function DrugsSection() {
  const { showSnackbar } = useSnackbar();
  const { drugs, setDrugs, stockProducts, addStockItem } = useClinicData();
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<Drug | null>(null);
  const empty: Drug = { id:0, code:"", name:"", genericName:"", category:"ยาปฏิชีวนะ", unit:"แผง", costPrice:0, sellPrice:0, minStock:10, active:true, strength:"", surgeryUse:false, stockLinks:[] };

  const [form, setForm]     = useState<Drug>(empty);
  /* ติ๊ก = ส่งชื่อยา+ความแรง และหน่วยนับ ไปสร้างสินค้าในคลังตอนกดบันทึก */
  const [toStock, setToStock] = useState(true);
  const drugImgRef = useRef<HTMLInputElement>(null);

  /* รูปยาเก็บเป็น data URL — จำกัดขนาดกันโป่งใน localStorage ตอนต่อ backend จริง
     ค่อยเปลี่ยนไปอัปโหลดไฟล์แล้วเก็บ URL แทน */
  const pickDrugImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) { showSnackbar("error", "รองรับเฉพาะไฟล์รูปภาพ"); return; }
    if (f.size > 1.5 * 1024 * 1024) { showSnackbar("error", "ไฟล์ใหญ่เกิน 1.5 MB — ย่อรูปก่อนอัปโหลด"); return; }
    const r = new FileReader();
    r.onload = ev => setForm(fm => ({ ...fm, image: ev.target?.result as string }));
    r.readAsDataURL(f);
  };

  /* ── ข้อมูลตัด Stock (ตาราง stock_item_drugitems) ──
     ยา 1 ตัวผูกสินค้าได้หลายรายการ · จ่ายยา 1 หน่วย → ตัดตามจำนวนที่ระบุ */
  const stockable = stockProducts.filter(p => p.type === "stock");
  const links = form.stockLinks ?? [];
  const setLinks = (next: DrugStockLink[]) => setForm(f => ({ ...f, stockLinks: next }));
  const addLink = () => {
    const used = new Set(links.map(l => l.productId));
    const first = stockable.find(p => !used.has(p.id));
    if (!first) { showSnackbar("info", "ผูกครบทุกสินค้าแล้ว"); return; }
    setLinks([...links, { productId: first.id, qty: 1, unit: first.unit }]);
  };
  const updLink = (i: number, patch: Partial<DrugStockLink>) =>
    setLinks(links.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const delLink = (i: number) => setLinks(links.filter((_, j) => j !== i));
  /* หน่วยที่เลือกได้ของสินค้าตัวนั้น — หน่วยหลัก + หน่วยย่อยที่พบบ่อย */
  const unitsOf = (productId: number) => {
    const p = stockable.find(x => x.id === productId);
    const base = p?.unit ?? "ชิ้น";
    return Array.from(new Set([base, "เม็ด", "แคปซูล", "ขวด", "กล่อง", "แผง", "หลอด", "ชิ้น"]));
  };

  const set = <K extends keyof Drug>(k: K, v: Drug[K]) => setForm(f => ({ ...f, [k]: v }));
  /* ชื่อที่จะใช้สร้างสินค้าในคลัง = ชื่อยา + ความแรง */
  const stockName = [form.name.trim(), (form.strength ?? "").trim()].filter(Boolean).join(" ");
  const openAdd  = () => { setEditing(null); setForm(empty); setToStock(true); setOpen(true); };
  const openEdit = (d: Drug) => { setEditing(d); setForm({ ...d }); setToStock(false); setOpen(true); };
  const handleSave = () => {
    let saved: Drug = form;

    /* ส่งเข้าคลังก่อน — จะได้ id สินค้ามาผูก stockLinks ให้ยาตัวนี้ตัดสต๊อกได้ทันที */
    if (toStock && stockName) {
      const { product, created } = addStockItem({
        name: stockName, unit: form.unit,
        category: "ยา/วิตามิน", categoryEmoji: "💊",
        costPrice: form.costPrice, sellPrice: form.sellPrice, minStock: form.minStock,
        image: form.image, sourceType: "drug", sourceId: editing?.id ?? 0,
      });
      const already = (form.stockLinks ?? []).some(l => l.productId === product.id);
      if (!already) saved = { ...form, stockLinks: [...(form.stockLinks ?? []), { productId: product.id, qty: 1, unit: product.unit }] };
      showSnackbar("success", created
        ? `เพิ่มเข้าคลังสินค้าแล้ว — ${product.name} (${product.unit})`
        : `มีสินค้า "${product.name}" ในคลังอยู่แล้ว · ผูกให้ตัดสต๊อกเรียบร้อย`);
    }

    if (editing) {
      setDrugs(ds => ds.map(d => d.id === editing.id ? saved : d));
      if (!toStock) showSnackbar("success", "แก้ไขข้อมูลยาเรียบร้อย");
    } else {
      setDrugs(ds => [...ds, { ...saved, id: nextId(ds) }]);
      if (!toStock) showSnackbar("success", "เพิ่มรายการยาเรียบร้อย");
    }
    setOpen(false);
  };
  const handleDelete = (id: number) => {
    setDrugs(ds => ds.filter(d => d.id !== id));
    showSnackbar("success", "ลบรายการยาเรียบร้อย");
  };
  const filtered = drugs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.includes(search));
  const cats = ["ยาปฏิชีวนะ","สเตียรอยด์","ยาแก้ปวด NSAID","ยาขับปัสสาวะ","ยาถ่ายพยาธิ","วิตามิน","ฮอร์โมน","ยาทาภายนอก","อื่นๆ"];
  const units = ["แผง","เม็ด","แคปซูล","ขวด","ซอง","หลอด","กล่อง","มล."];

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#60a5fa,#2563eb)",
              boxShadow: "0 4px 12px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <Pill className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>รายการยา</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Drug Registry · {drugs.length} รายการ</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)",
            boxShadow: "var(--hero-btn-shadow)",
            fontWeight: 700,
            
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มยา
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        {/* ── Search Bar ── */}
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อยา / รหัสยา..." className="vet-search pl-9" />
          </div>
        </div>
        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-0">
            <thead>
              <tr>
                {[
                  { label: "รหัส", w: "w-[90px]" },
                  { label: "ชื่อยา / ชื่อสามัญ", w: "" },
                  { label: "หมวดหมู่", w: "w-[130px]" },
                  { label: "หน่วย", w: "w-[80px]" },
                  { label: "ราคาทุน", w: "w-[100px]" },
                  { label: "ราคาขาย", w: "w-[100px]" },
                  { label: "Stock ขั้นต่ำ", w: "w-[110px]" },
                  { label: "สถานะ", w: "w-[90px]" },
                  { label: "", w: "w-[72px]" },
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`${h.w} px-4 py-2.5 text-left text-[11px] text-[#9ca3af] bg-[#f9fafb] border-b border-[#f0f0f0] whitespace-nowrap`}
                    style={{ fontWeight: 600, letterSpacing: "0.03em" }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <tr
                  key={d.id}
                  className="group transition-colors hover:bg-[#f0fdf9]/60"
                  style={{ background: idx % 2 === 0 ? "white" : "#fafafa" }}
                >
                  {/* รหัส */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center text-[11px] font-mono text-[#6a7282] bg-[#f3f4f6] group-hover:bg-white px-2 py-0.5 rounded-md border border-[#e5e7eb] group-hover:border-(--brand)/20 transition-all">
                      {d.code}
                    </span>
                  </td>
                  {/* ชื่อยา */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f0fdf9] to-[#d1fae5] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#a7f3d0]/40 overflow-hidden">
                        {d.image
                          ? <img src={d.image} alt={d.name} className="w-full h-full object-cover" draggable={false} />
                          : <Pill className="w-4 h-4 text-(--brand)" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] text-[#1e2939] truncate" style={{ fontWeight: 600 }}>
                          {d.name}{d.strength ? <span className="text-[#6b7280]"> {d.strength}</span> : null}
                        </span>
                        <span className="text-[11px] text-[#9ca3af] truncate mt-0.5 inline-flex items-center gap-1.5">
                          {d.genericName || "—"}
                          {d.surgeryUse && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] flex-shrink-0"
                              style={{ background: "rgba(139,92,246,0.10)", color: "#7c3aed", border: "1px solid rgba(139,92,246,0.25)", fontWeight: 700 }}>
                              <Scissors className="w-2.5 h-2.5" /> ผ่าตัด
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  {/* หมวดหมู่ */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center text-[11px] bg-[#eff6ff] text-[#3b82f6] px-2.5 py-1 rounded-full whitespace-nowrap border border-[#bfdbfe]/60" style={{ fontWeight: 500 }}>
                      {d.category}
                    </span>
                  </td>
                  {/* หน่วย */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center text-[11px] text-[#6a7282] bg-[#f3f4f6] px-2.5 py-1 rounded-full border border-[#e5e7eb]">
                      {d.unit}
                    </span>
                  </td>
                  {/* ราคาทุน */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#9ca3af]">ทุน</span>
                      <span className="text-[13px] text-[#374151]" style={{ fontWeight: 600 }}>฿{d.costPrice.toLocaleString()}</span>
                    </div>
                  </td>
                  {/* ราคาขาย */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#9ca3af]">ขาย</span>
                      <span className="text-[13px] text-(--brand)" style={{ fontWeight: 700 }}>฿{d.sellPrice.toLocaleString()}</span>
                    </div>
                  </td>
                  {/* Stock ขั้นต่ำ */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] flex-shrink-0" />
                      <span className="text-[12px] text-[#374151]" style={{ fontWeight: 500 }}>{d.minStock} <span className="text-[#9ca3af]">{d.unit}</span></span>
                    </div>
                  </td>
                  {/* สถานะ */}
                  <td className="px-4 py-3">
                    <StatusBadge active={d.active} />
                  </td>
                  {/* จัดการ */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(d)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#d1d5db] hover:bg-blue-50 hover:text-blue-500 transition-colors"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#d1d5db] hover:bg-red-50 hover:text-red-400 transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center">
                <Pill className="w-6 h-6 text-[#d1d5db]" />
              </div>
              <p className="text-sm text-[#9ca3af]">ไม่พบรายการยา</p>
            </div>
          )}
        </div>
      </div>
      <Modal open={open} size="lg" title={editing ? "แก้ไขข้อมูลยา" : "เพิ่มรายการยา"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<Pill className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}
        footerLeft={
          <div className="min-w-0">
            <div className="flex items-center gap-5 flex-wrap">
              <FooterCheck label="ใช้ในงานผ่าตัด" checked={!!form.surgeryUse} onChange={v => set("surgeryUse", v)}
                hint="ยานี้จะขึ้นในรายการยาสลบ / ยาหลังผ่าตัด ของบันทึกการผ่าตัด" />
              <FooterCheck label="เพิ่มเข้าคลังสินค้า (stock)" checked={toStock} onChange={setToStock} />
            </div>
            <p className="text-[10.5px] text-gray-400 mt-0.5 truncate">
              {toStock
                ? (stockName ? <>สร้างสินค้า <span style={{ color: "var(--brand-dark)", fontWeight: 700 }}>{stockName}</span> · หน่วย {form.unit}</> : "กรอกชื่อยาก่อน")
                : "ติ๊กเพื่อสร้างสินค้าในคลังพร้อมผูกตัดสต๊อกให้อัตโนมัติ"}
            </p>
          </div>
        }>
        {/* รูปยา — วางบนสุดตามที่คุณหมอขอ ช่วยให้หยิบยาถูกตัวตอนจ่าย */}
        <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: "1px solid #f1f3f5" }}>
          <button type="button" onClick={() => drugImgRef.current?.click()}
            className="w-[96px] h-[96px] rounded-2xl flex flex-col items-center justify-center flex-shrink-0 overflow-hidden bg-white transition-colors hover:border-(--brand)"
            style={{ border: form.image ? "1px solid #eef0f2" : "1.5px dashed #d1d5db" }}
            title={form.image ? "เปลี่ยนรูปยา" : "เพิ่มรูปยา"}>
            {form.image
              ? <img src={form.image} alt={form.name} className="w-full h-full object-cover" draggable={false} />
              : <><Camera className="w-6 h-6 text-gray-300" /><span className="text-[10px] text-gray-400 mt-1">เพิ่มรูป</span></>}
          </button>
          <input ref={drugImgRef} type="file" accept="image/*" className="hidden" onChange={pickDrugImage} />
          <div className="min-w-0">
            <p className="text-[13px] text-gray-800" style={{ fontWeight: 700 }}>รูปยา</p>
            <p className="text-[11.5px] text-gray-500 mt-0.5 leading-snug">
              แสดงในทะเบียนยา · ใบสั่งยา · และใช้เป็นรูปสินค้าถ้าติ๊กเพิ่มเข้าคลัง — ไม่เกิน 1.5 MB
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button type="button" onClick={() => drugImgRef.current?.click()} className="vet-btn vet-btn-secondary vet-btn-sm inline-flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> {form.image ? "เปลี่ยนรูป" : "เพิ่มรูป"}
              </button>
              {form.image && (
                <button type="button" onClick={() => set("image", undefined)} className="vet-btn vet-btn-ghost vet-btn-sm">ลบรูป</button>
              )}
            </div>
          </div>
        </div>

        {/* 3 คอลัมน์ — โมดัลนี้กว้าง 880px ถ้าใช้ 2 คอลัมน์ ช่องตัวเลขจะยืดเกินจำเป็นและฟอร์มจะยาวจนต้องเลื่อน */}
        <div className="grid grid-cols-3 gap-3">
          <div><label className={labelCls}>รหัสยา <span className="required">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="D001" /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อยา <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ชื่อยา..." /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อสามัญ (Generic Name)</label><input className={inputCls} value={form.genericName} onChange={e => set("genericName", e.target.value)} placeholder="Generic name..." /></div>
          {/* ความแรง — ต่อท้ายชื่อยาเวลาสร้างสินค้าในคลัง เช่น "Amoxy-Clav 250 mg" */}
          <div><label className={labelCls}>ความแรง</label><input className={inputCls} value={form.strength ?? ""} onChange={e => set("strength", e.target.value)} placeholder="เช่น 250 mg" /></div>
          <div>
            <label className={labelCls}>หมวดหมู่</label>
            <select className={selectCls} value={form.category} onChange={e => set("category", e.target.value)}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>หน่วยนับ</label>
            <select className={selectCls} value={form.unit} onChange={e => set("unit", e.target.value)}>
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Stock ขั้นต่ำ</label><input type="number" className={inputCls} value={form.minStock} onChange={e => set("minStock", Number(e.target.value))} /></div>
          <div><label className={labelCls}>ราคาทุน (฿)</label><input type="number" className={inputCls} value={form.costPrice} onChange={e => set("costPrice", Number(e.target.value))} /></div>
          <div><label className={labelCls}>ราคาขาย (฿)</label><input type="number" className={inputCls} value={form.sellPrice} onChange={e => set("sellPrice", Number(e.target.value))} /></div>
          <div className="flex items-center gap-3 pt-5">
            <Toggle checked={form.active} onChange={v => set("active", v)} />
            <span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
          </div>

          {/* ══ ข้อมูลตัด Stock — ผูกกับสินค้าในคลังเพื่อตัดสต๊อกทันทีที่จ่ายยา ══ */}
          <div className="col-span-3 mt-1 pt-4" style={{ borderTop: "1px solid #f1f3f5" }}>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4" style={{ color: "var(--brand-dark)" }} />
              <span className="text-[13px] text-gray-800" style={{ fontWeight: 700 }}>ข้อมูลตัด Stock</span>
              <span className="text-[11px] text-gray-400">ตัดสต๊อกทันทีเมื่อจ่ายยา · ผูกได้หลายสินค้า</span>
              <button type="button" onClick={addLink}
                className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] transition-all"
                style={{ background: "color-mix(in srgb, var(--brand) 8%, transparent)", color: "var(--brand-dark)", border: "1px solid color-mix(in srgb, var(--brand) 35%, transparent)", fontWeight: 700 }}>
                <Plus className="w-3.5 h-3.5" /> เพิ่มสินค้า
              </button>
            </div>

            {links.length === 0 ? (
              <div className="rounded-xl px-4 py-5 text-center" style={{ border: "1.5px dashed #e5e7eb" }}>
                <p className="text-[12px] text-gray-500" style={{ fontWeight: 600 }}>ยังไม่ได้ผูกสินค้า</p>
                <p className="text-[11px] text-gray-400 mt-0.5">ถ้าไม่ผูก ระบบจะตัดสต๊อกโดยเทียบชื่อยากับชื่อสินค้าแทน</p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #eef0f2" }}>
                <div className="grid items-center gap-2 px-3 py-2 bg-gray-50 text-gray-400 text-[10px]"
                  style={{ gridTemplateColumns: "1fr 84px 130px 32px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <span>สินค้า</span><span className="text-center">จำนวน</span><span>หน่วยบรรจุ</span><span />
                </div>
                {links.map((l, i) => (
                  <div key={i} className="grid items-center gap-2 px-3 py-2 border-t border-gray-50"
                    style={{ gridTemplateColumns: "1fr 84px 130px 32px" }}>
                    <select className={inputCls} style={{ height: 36 }}
                      value={l.productId}
                      onChange={e => { const pid = Number(e.target.value); updLink(i, { productId: pid, unit: stockable.find(p => p.id === pid)?.unit ?? l.unit }); }}>
                      {stockable.map(p => (
                        <option key={p.id} value={p.id}
                          disabled={p.id !== l.productId && links.some(x => x.productId === p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input type="number" min={1} className={inputCls} style={{ height: 36, textAlign: "center" }}
                      value={l.qty} onChange={e => updLink(i, { qty: Math.max(1, Number(e.target.value)) })} />
                    <select className={inputCls} style={{ height: 36 }}
                      value={l.unit} onChange={e => updLink(i, { unit: e.target.value })}>
                      {unitsOf(l.productId).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button type="button" onClick={() => delLink(i)} aria-label="ลบรายการ"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {/* สรุปผลของการผูก — อ่านแล้วเข้าใจทันทีว่าจ่าย 1 หน่วยตัดอะไรบ้าง */}
                <div className="px-3 py-2 bg-gray-50/70 border-t border-gray-100">
                  <p className="text-[11px] text-gray-500">
                    จ่ายยา 1 {form.unit} → ตัด{" "}
                    <span style={{ color: "var(--brand-dark)", fontWeight: 700 }}>
                      {links.map(l => `${stockable.find(p => p.id === l.productId)?.name ?? "-"} ${l.qty} ${l.unit}`).join(" + ")}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: ประเภทสัตว์ ─────────────────────────────────────────
function SpeciesSection({ species, setSpecies }: { species: PetSpecies[]; setSpecies: React.Dispatch<React.SetStateAction<PetSpecies[]>> }) {
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PetSpecies | null>(null);
  const empty: PetSpecies = { id:0, code:"", name:"", icon:"🐾", active:true };
  const [form, setForm] = useState<PetSpecies>(empty);
  const set = <K extends keyof PetSpecies>(k: K, v: PetSpecies[K]) => setForm(f => ({ ...f, [k]: v }));

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: PetSpecies) => { setEditing(s); setForm({ ...s }); setOpen(true); };
  const handleSave = () => {
    if (editing) { setSpecies(ss => ss.map(s => s.id === editing.id ? form : s)); showSnackbar("success", "แก้ไขประเภทสัตว์เรียบร้อย"); }
    else { setSpecies(ss => [...ss, { ...form, id: nextId(ss) }]); showSnackbar("success", "เพิ่มประเภทสัตว์เรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setSpecies(ss => ss.filter(s => s.id !== id)); showSnackbar("success", "ลบประเภทสัตว์เรียบร้อย"); };

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#34d399,#059669)",
              boxShadow: "0 4px 12px rgba(5,150,105,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <PawPrint className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ทะเบียนประเภทสัตว์เลี้ยง</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Species Registry · {species.length} รายการ</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)",
            boxShadow: "var(--hero-btn-shadow)",
            fontWeight: 700,
            
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มประเภท
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["รหัส","สัญลักษณ์","ชื่อประเภท","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {species.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{s.code}</td>
                  <td className="px-4 py-3 text-xl">{s.icon}</td>
                  <td className="px-4 py-3 text-gray-800" style={{ fontWeight:500 }}>{s.name}</td>
                  <td className="px-4 py-3"><StatusBadge active={s.active} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editing ? "แก้ไขประเภทสัตว์" : "เพิ่มประเภทสัตว์"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<PawPrint className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}>
        <div><label className={labelCls}>รหัส <span className="required">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="S001" /></div>
        <div><label className={labelCls}>ชื่อประเภทสัตว์ <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="สุนัข" /></div>
        <div><label className={labelCls}>สัญลักษณ์ (Emoji)</label><input className={inputCls} value={form.icon} onChange={e => set("icon", e.target.value)} placeholder="🐾" /></div>
        <div className="flex items-center gap-3"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
      </Modal>
    </div>
  );
}

// ─── Section: พันธุ์สัตว์ ─────────────────────────────────────────
function BreedsSection({ breeds, setBreeds, species }: { breeds: PetBreed[]; setBreeds: React.Dispatch<React.SetStateAction<PetBreed[]>>; species: PetSpecies[] }) {
  const { showSnackbar } = useSnackbar();
  const [filterSp, setFilterSp] = useState<number | "all">("all");
  const [open, setOpen]   = useState(false);
  const [editing, setEditing] = useState<PetBreed | null>(null);
  const empty: PetBreed = { id:0, name:"", speciesId: species[0]?.id ?? 1, active:true };
  const [form, setForm]   = useState<PetBreed>(empty);
  const set = <K extends keyof PetBreed>(k: K, v: PetBreed[K]) => setForm(f => ({ ...f, [k]: v }));

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (b: PetBreed) => { setEditing(b); setForm({ ...b }); setOpen(true); };
  const handleSave = () => {
    if (editing) { setBreeds(bs => bs.map(b => b.id === editing.id ? form : b)); showSnackbar("success", "แก้ไขพันธุ์สัตว์เรียบร้อย"); }
    else { setBreeds(bs => [...bs, { ...form, id: nextId(bs) }]); showSnackbar("success", "เพิ่มพันธุ์สัตว์เรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setBreeds(bs => bs.filter(b => b.id !== id)); showSnackbar("success", "ลบพันธุ์สัตว์เรียบร้อย"); };
  const filtered = breeds.filter(b => filterSp === "all" || b.speciesId === filterSp);

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
              boxShadow: "0 4px 12px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <Star className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ทะเบียนพันธุ์สัตว์</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>
              Breed Registry · {breeds.length} รายการ{filterSp !== "all" ? ` · กรอง: ${filtered.length}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)",
            boxShadow: "var(--hero-btn-shadow)",
            fontWeight: 700,
            
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มพันธุ์
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        {/* ── Filter Bar ── */}
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <span className="text-[11.5px] text-gray-500" style={{ fontWeight: 500 }}>กรองตามประเภท</span>
          <select className="border border-[#e5e7eb] rounded-full px-3 py-1.5 text-xs text-[#1e2939] focus:outline-none focus:ring-2 focus:ring-(--brand)/30 bg-white"
            style={{ fontWeight: 500 }}
            value={filterSp} onChange={e => setFilterSp(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">ทุกประเภท</option>
            {species.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["ชื่อพันธุ์","ประเภทสัตว์","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => {
                const sp = species.find(s => s.id === b.speciesId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{b.name}</td>
                    <td className="px-4 py-2.5"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sp?.icon} {sp?.name}</span></td>
                    <td className="px-4 py-2.5"><StatusBadge active={b.active} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(b)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(b.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editing ? "แก้ไขพันธุ์สัตว์" : "เพิ่มพันธุ์สัตว์"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<Star className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name}>
        <div><label className={labelCls}>ชื่อพันธุ์ <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="โกลเดน รีทรีฟเวอร์" /></div>
        <div>
          <label className={labelCls}>ประเภทสัตว์</label>
          <select className={selectCls} value={form.speciesId} onChange={e => set("speciesId", Number(e.target.value))}>
            {species.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
      </Modal>
    </div>
  );
}

// ─── Section: ค่าบริการ ───────────────────────────────────────────
function ServicesSection() {
  const { showSnackbar } = useSnackbar();
  const { services: items, setServices: setItems, addStockItem } = useClinicData();
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const empty: ServiceItem = { id:0, code:"", name:"", category:"ทั่วไป", price:0, costPrice:0, active:true, unit:"ชิ้น" };
  const [form, setForm]     = useState<ServiceItem>(empty);
  const set = <K extends keyof ServiceItem>(k: K, v: ServiceItem[K]) => setForm(f => ({ ...f, [k]: v }));
  const cats = ["ทั่วไป","แล็บ","Medical Imaging","การรักษา","วอร์ด","ศัลยกรรม","ทันตกรรม","ค่าเวชภัณฑ์ที่ไม่ใช่ยา","Grooming","อื่นๆ"];
  const svcUnits = ["ชิ้น","ครั้ง","ชุด","อัน","ม้วน","หลอด","ขวด","แผ่น","คู่","กล่อง"];
  /* ค่าเวชภัณฑ์ที่มิใช่ยาเป็นของนับสต๊อกได้ → ติ๊กส่งเข้าคลังไว้ให้เลย */
  const [toStock, setToStock] = useState(false);
  /* แถวที่กำลังกรอกอยู่ท้ายตารางช่วงน้ำหนัก — ยังไม่เข้า form จนกว่าจะกด + */
  const WEIGHT_UNITS = ["กิโลกรัม", "กรัม"];
  const emptyTier = { unit: WEIGHT_UNITS[0], from: "", to: "", price: "" };
  const [tierDraft, setTierDraft] = useState(emptyTier);

  const addTier = () => {
    const from = Number(tierDraft.from), to = Number(tierDraft.to), price = Number(tierDraft.price);
    if (!isFinite(from) || !isFinite(to) || tierDraft.from === "" || tierDraft.to === "") {
      showSnackbar("error", "ระบุน้ำหนักเริ่มต้นและสิ้นสุดให้ครบ"); return;
    }
    if (to < from) { showSnackbar("error", "น้ำหนักสิ้นสุดต้องไม่น้อยกว่าน้ำหนักเริ่มต้น"); return; }
    /* ช่วงคาบเกี่ยวกันแปลว่าน้ำหนักหนึ่งเข้าได้สองราคา — ต้องกันไว้ ไม่งั้นคิดเงินไม่แน่นอน */
    const overlap = (form.weightTiers ?? []).find(t => from <= t.to && to >= t.from);
    if (overlap) { showSnackbar("error", `ช่วงนี้ทับกับ ${overlap.from}–${overlap.to} ${overlap.unit} ที่มีอยู่แล้ว`); return; }
    set("weightTiers", [...(form.weightTiers ?? []), { id: `t${Date.now()}`, unit: tierDraft.unit, from, to, price: Math.max(0, price || 0) }]
      .sort((a, b) => a.from - b.from));
    setTierDraft(emptyTier);
  };
  const delTier = (id: string) => set("weightTiers", (form.weightTiers ?? []).filter(t => t.id !== id));

  /* หมวดในคลังที่จะสร้างให้ — Grooming ไปคลังอาบน้ำ-ตัดขน ที่เหลือเป็นอุปกรณ์/เวชภัณฑ์ */
  const stockCat = form.category === "Grooming" ? "Grooming" : "อุปกรณ์";

  const openAdd  = () => { setEditing(null); setForm(empty); setToStock(false); setTierDraft(emptyTier); setOpen(true); };
  const openEdit = (s: ServiceItem) => { setEditing(s); setForm({ unit: "ชิ้น", ...s }); setToStock(false); setTierDraft(emptyTier); setOpen(true); };
  /* คัดลอกรายการเดิม — เปิดโหมด "เพิ่ม" พร้อมข้อมูลชุดเดิม แก้เฉพาะที่ต้องการแล้วบันทึก
     ล้างรหัสทิ้งเพราะเป็นค่าที่ต้องไม่ซ้ำ และเป็นช่องบังคับ จึงกันบันทึกซ้ำรหัสเดิมโดยไม่ตั้งใจ
     ส่วนชื่อคงไว้ตามเดิม — งานจริงมักคัดลอกเพื่อทำรายการชื่อเดียวกันคนละเงื่อนไข */
  const openCopy = (s: ServiceItem) => { setEditing(null); setForm({ ...s, id: 0, code: "" }); setToStock(false); setOpen(true); };
  const handleSave = () => {
    if (toStock && form.name.trim()) {
      const { product, created } = addStockItem({
        name: form.name, unit: form.unit || "ชิ้น",
        category: stockCat, categoryEmoji: CATEGORY_EMOJI[stockCat],
        sellPrice: form.price, costPrice: form.costPrice ?? 0,
        sourceType: "service", sourceId: editing?.id ?? 0,
      });
      showSnackbar("success", created
        ? `เพิ่มเข้าคลังสินค้าแล้ว — ${product.name} (${product.unit})`
        : `มีสินค้า "${product.name}" ในคลังอยู่แล้ว`);
    }
    if (editing) { setItems(ss => ss.map(s => s.id === editing.id ? form : s)); if (!toStock) showSnackbar("success", "แก้ไขค่าบริการเรียบร้อย"); }
    else { setItems(ss => [...ss, { ...form, id: nextId(ss) }]); if (!toStock) showSnackbar("success", "เพิ่มค่าบริการเรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setItems(ss => ss.filter(s => s.id !== id)); showSnackbar("success", "ลบค่าบริการเรียบร้อย"); };
  const filtered = items.filter(s => s.name.includes(search) || s.code.includes(search));

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#fbbf24,#d97706)",
              boxShadow: "0 4px 12px rgba(217,119,6,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <Wrench className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ทะเบียนค่าบริการ</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Service Registry · {items.length} รายการ</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)",
            boxShadow: "var(--hero-btn-shadow)",
            fontWeight: 700,
            
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มบริการ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        {/* ── Search Bar ── */}
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาบริการ..." className="vet-search pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["รหัส","ชื่อบริการ","หมวดหมู่","ราคาทุน (฿)","ราคาขาย (฿)","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{s.code}</td>
                  <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{s.name}</td>
                  <td className="px-4 py-2.5"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.category}</span></td>
                  <td className="px-4 py-2.5 text-gray-500">฿{(s.costPrice ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight:500 }}>฿{s.price.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><StatusBadge active={s.active} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} title="แก้ไข" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openCopy(s)} title="คัดลอกรายการนี้" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(s.id)} title="ลบ" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} size="wide" title={editing ? "แก้ไขค่าบริการ" : "เพิ่มค่าบริการ"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<Wrench className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}
        footerLeft={
          <div className="min-w-0">
            <FooterCheck label="เพิ่มเข้าคลังสินค้า (stock)" checked={toStock} onChange={setToStock} />
            <p className="text-[10.5px] text-gray-400 mt-0.5 truncate pl-[26px]">
              {form.name.trim() ? <>สร้างสินค้า <span style={{ color: "var(--brand-dark)", fontWeight: 700 }}>{form.name.trim()}</span> · หน่วย {form.unit || "ชิ้น"}</> : "กรอกชื่อบริการก่อน"}
            </p>
          </div>
        }>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>รหัส <span className="required">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="SV001" /></div>
          <div><label className={labelCls}>หมวดหมู่</label><select className={selectCls} value={form.category} onChange={e => set("category", e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อบริการ <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ชื่อบริการ..." /></div>
          {/* หน่วยนับ — ใช้เป็นหน่วยพื้นฐานตอนสร้างสินค้าในคลัง (stock_item_unit) */}
          <div>
            <label className={labelCls}>หน่วย</label>
            <select className={selectCls} value={form.unit ?? "ชิ้น"} onChange={e => set("unit", e.target.value)}>{svcUnits.map(u => <option key={u}>{u}</option>)}</select>
          </div>
          <div><label className={labelCls}>ราคาทุน (฿)</label><input type="number" min={0} className={inputCls} value={form.costPrice ?? 0} onChange={e => set("costPrice", Math.max(0, Number(e.target.value) || 0))} /></div>
          <div><label className={labelCls}>ราคาขาย (฿)</label><input type="number" min={0} className={inputCls} value={form.price} onChange={e => set("price", Math.max(0, Number(e.target.value) || 0))} /></div>
          {/* ── ราคาตามช่วงน้ำหนัก ──
              ตั้งไว้แล้วระบบจะเลือกราคาให้เองจากน้ำหนักที่บันทึกในสัญญาณชีพ
              ไม่ตั้ง = ใช้ราคาขายด้านบนราคาเดียวเหมือนเดิม */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>การคิดราคาตามน้ำหนัก</label>
              <span className="text-[10.5px] text-gray-400">(ไม่บังคับ)</span>
              {(form.weightTiers?.length ?? 0) > 0 && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand-dark)", fontWeight: 700 }}>
                  {form.weightTiers!.length} ช่วง
                </span>
              )}
            </div>
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th className="text-left px-3 py-2.5" style={{ width: 150 }}>หน่วย</th>
                    <th className="text-left px-3 py-2.5">ช่วงน้ำหนัก เริ่มต้น – สิ้นสุด</th>
                    <th className="text-right px-3 py-2.5" style={{ width: 130 }}>ราคา/หน่วย</th>
                    <th className="px-3 py-2.5" style={{ width: 44 }} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(form.weightTiers ?? []).map(t => (
                    <tr key={t.id}>
                      <td className="px-3 py-2 text-gray-700">{t.unit}</td>
                      <td className="px-3 py-2 text-gray-700" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {t.from}–{t.to} <span className="text-gray-400 text-[11px]">{t.unit}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-900" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                        ฿{t.price.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => delTier(t.id)} title="ลบช่วงนี้"
                          className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                  {/* แถวกรอกใหม่ — กด Enter ที่ช่องราคาก็เพิ่มได้ ไม่ต้องเอื้อมไปกดปุ่ม */}
                  <tr className="bg-gray-50/60">
                    <td className="px-3 py-2">
                      <select className={selectCls} style={{ height: 34 }} value={tierDraft.unit}
                        onChange={e => setTierDraft(d => ({ ...d, unit: e.target.value }))}>
                        {WEIGHT_UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <input type="number" min={0} step="0.1" placeholder="เริ่ม" value={tierDraft.from}
                          onChange={e => setTierDraft(d => ({ ...d, from: e.target.value }))}
                          className={`${inputCls} no-spin text-center`} style={{ height: 34 }} />
                        <span className="text-gray-400">–</span>
                        <input type="number" min={0} step="0.1" placeholder="สิ้นสุด" value={tierDraft.to}
                          onChange={e => setTierDraft(d => ({ ...d, to: e.target.value }))}
                          className={`${inputCls} no-spin text-center`} style={{ height: 34 }} />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} placeholder="0.00" value={tierDraft.price}
                        onChange={e => setTierDraft(d => ({ ...d, price: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTier(); } }}
                        className={`${inputCls} no-spin text-right`} style={{ height: 34 }} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button type="button" onClick={addTier} title="เพิ่มช่วงน้ำหนัก"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-colors"
                        style={{ background: "var(--brand)" }}>
                        <Plus className="w-4 h-4" strokeWidth={2.6} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="vet-tiny mt-1.5">
              ตั้งช่วงไว้แล้ว ระบบจะเลือกราคาให้เองจากน้ำหนักที่บันทึกในสัญญาณชีพ · น้ำหนักที่ไม่เข้าช่วงไหนจะใช้ราคาขายด้านบน
            </p>
          </div>

          <div className="flex items-center gap-3 col-span-2"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: วัคซีน ─────────────────────────────────────────────
function VaccinesSection({ types }: { types: VaccineType[] }) {
  const { showSnackbar } = useSnackbar();
  const { stockProducts } = useClinicData();
  const [items, setItems]   = useState<VaccineItem[]>(INIT_VACCINES);
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<VaccineItem | null>(null);
  const empty: VaccineItem  = { id:0, brand:"", typeId:null, icode:"", lots:[{ lot:"", expiry:"" }], active:true };
  const [form, setForm]     = useState<VaccineItem>(empty);
  const set = <K extends keyof VaccineItem>(k: K, v: VaccineItem[K]) => setForm(f => ({ ...f, [k]: v }));

  /* รหัสสินค้าเลือกจากคลังยาเท่านั้น — วัคซีนเป็นเวชภัณฑ์ ไม่ใช่ของใช้ทั่วไป */
  const drugStock = stockProducts.filter(sp => sp.category === "ยา/วิตามิน");
  const typeOf  = (id: number | null) => types.find(t => t.id === id);
  const stockOf = (code: string) => stockProducts.find(sp => sp.code === code);

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (v: VaccineItem) => { setEditing(v); setForm({ ...v, lots: v.lots.length ? [...v.lots] : [{ lot: "", expiry: "" }] }); setOpen(true); };
  const openCopy = (v: VaccineItem) => { setEditing(null); setForm({ ...v, id: 0, lots: v.lots.length ? [...v.lots] : [{ lot: "", expiry: "" }] }); setOpen(true); };

  /* ── ล็อต — เพิ่ม/ลบ/แก้ทีละแถว ── */
  const patchLot = (i: number, patch: Partial<VaccineLot>) =>
    setForm(f => ({ ...f, lots: f.lots.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const addLot = () => setForm(f => ({ ...f, lots: [...f.lots, { lot: "", expiry: "" }] }));
  const delLot = (i: number) => setForm(f => ({ ...f, lots: f.lots.filter((_, j) => j !== i) }));

  const handleSave = () => {
    /* ทิ้งแถวล็อตที่ยังไม่ได้กรอกอะไรเลย — แถวเปล่าที่เผลอกด "เพิ่มล็อต" ไว้ไม่ควรถูกบันทึก */
    const row: VaccineItem = {
      ...form,
      brand: form.brand.trim(),
      lots: form.lots.filter(l => l.lot.trim() || l.expiry).map(l => ({ ...l, lot: l.lot.trim() })),
    };
    if (editing) { setItems(vs => vs.map(v => v.id === editing.id ? row : v)); showSnackbar("success", "แก้ไขข้อมูลวัคซีนเรียบร้อย"); }
    else { setItems(vs => [...vs, { ...row, id: nextId(vs) }]); showSnackbar("success", "เพิ่มวัคซีนเรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setItems(vs => vs.filter(v => v.id !== id)); showSnackbar("success", "ลบวัคซีนเรียบร้อย"); };

  /* ค้นได้ทั้งผู้ผลิต ชื่อประเภท เลขล็อต และรหัสสินค้า — ผู้ใช้จำอันไหนได้ก็พิมพ์อันนั้น */
  const q = search.trim().toLowerCase();
  const filtered = items.filter(v => !q
    || v.brand.toLowerCase().includes(q)
    || (typeOf(v.typeId)?.name ?? "").toLowerCase().includes(q)
    || v.icode.toLowerCase().includes(q)
    || v.lots.some(l => l.lot.toLowerCase().includes(q)));

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#22d3ee,#0891b2)", boxShadow: "0 4px 12px rgba(8,145,178,0.25), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
            <Syringe className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ทะเบียนวัคซีน</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Vaccine Registry · {items.length} รายการ</p>
          </div>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)", boxShadow: "var(--hero-btn-shadow)", fontWeight: 700,
          }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่มวัคซีน
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาผู้ผลิต / ประเภท / ล็อต..." className="vet-search pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["ลำดับ","ผู้ผลิต","ประเภท","ล็อตวัคซีน","รหัสสินค้า","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-3 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v, i) => {
                const t = typeOf(v.typeId);
                const sp = stockOf(v.icode);
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{v.brand}</td>
                    <td className="px-3 py-2.5">
                      {t
                        ? <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">{t.name}</span>
                        : <span className="text-gray-300">–</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">
                      {v.lots.length ? `${v.lots.length} ล็อต` : <span className="text-gray-300">0 ล็อต</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {sp
                        ? <span className="text-gray-500 font-mono">{sp.code}</span>
                        : <span className="text-gray-300">–</span>}
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge active={v.active} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(v)} title="แก้ไข" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openCopy(v)} title="คัดลอกรายการนี้" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(v.id)} title="ลบ" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <Syringe className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">ไม่พบวัคซีน</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={open} title={editing ? "แก้ไขข้อมูลวัคซีน" : "เพิ่มวัคซีน"}
        subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"}
        icon={<Syringe className="w-[20px] h-[20px] text-white" />}
        onClose={() => setOpen(false)} onSave={handleSave}
        canSave={!!form.brand.trim() && form.typeId !== null}>
        <div className="space-y-3.5">
          <div>
            <label className={labelCls}>ผู้ผลิต / ยี่ห้อ <span className="required">*</span></label>
            <input className={inputCls} value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="RabiVax" autoFocus />
          </div>
          <div>
            <label className={labelCls}>ประเภทวัคซีน <span className="required">*</span></label>
            <select className={selectCls} value={form.typeId ?? ""}
              onChange={e => set("typeId", e.target.value === "" ? null : Number(e.target.value))}>
              <option value="">— เลือกประเภท —</option>
              {types.filter(t => t.active).map(t => (
                <option key={t.id} value={t.id}>{t.name}{t.nameEn ? ` (${t.nameEn})` : ""}</option>
              ))}
            </select>
            {types.length === 0 && <p className="vet-tiny mt-1">ยังไม่มีประเภทวัคซีน — เพิ่มได้ที่เมนู “ประเภทวัคซีน”</p>}
          </div>
          <div>
            <label className={labelCls}>รหัสสินค้า (icode)</label>
            <ChargeCodePicker items={drugStock} value={form.icode} onChange={c => set("icode", c)}
              placeholder="— เลือกรหัสสินค้าจากคลังยา —" emptyLabel="— ไม่ผูกสินค้าในคลัง —" />
          </div>

          {/* ── ล็อต / วันหมดอายุ ──
                 วัคซีนตัวเดียวกันสั่งเข้าหลายรอบ แต่ละรอบคนละล็อตคนละวันหมดอายุ
                 จึงต้องเก็บได้หลายแถว ไม่ใช่ช่องเดียว */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>ล็อต / วันหมดอายุ</label>
              <button type="button" onClick={addLot} className="vet-btn vet-btn-secondary vet-btn-sm inline-flex items-center gap-1">
                <Plus className="w-3 h-3" /> เพิ่มล็อต
              </button>
            </div>
            <div className="space-y-2">
              {form.lots.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={l.lot} onChange={e => patchLot(i, { lot: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-(--brand) focus:bg-white"
                    placeholder="เช่น LOT2026A" />
                  <div style={{ width: 178 }}>
                    <DatePickerModern value={l.expiry} onChange={d => patchLot(i, { expiry: d })} placeholder="เลือกวันหมดอายุ" />
                  </div>
                  <button type="button" onClick={() => delLot(i)} disabled={form.lots.length <= 1}
                    title="ลบล็อตนี้"
                    className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Toggle checked={form.active} onChange={v => set("active", v)} />
            <span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: ประเภทวัคซีน ────────────────────────────────────────
/* แคตตาล็อก "ชนิดของวัคซีน" (พิษสุนัขบ้า · หัดสุนัข · ลิวคีเมียแมว ...)
   คนละชั้นกับ "รายการวัคซีน" ซึ่งเป็นของจริงที่มีผู้ผลิต/ล็อต/ราคา
   รายการวัคซีน 1 ตัวอ้างประเภทได้ — เช่น Nobivac Rabies → ประเภท "พิษสุนัขบ้า" */
interface VaccineType {
  id: number;
  code: string;          // เว้นว่างได้ ระบบออกรหัส VTxxx ให้เอง
  name: string;          // ชื่อไทย (บังคับ)
  nameEn: string;        // ชื่ออังกฤษ
  speciesId: number | null;  // null = ใช้ได้ทุกชนิดสัตว์
  active: boolean;
}
const INIT_VACCINE_TYPES: VaccineType[] = [
  { id:1, code:"VT001", name:"พิษสุนัขบ้า",        nameEn:"Rabies",              speciesId:null, active:true },
  { id:2, code:"VT002", name:"หัดสุนัข",           nameEn:"Canine Distemper",    speciesId:1,    active:true },
  { id:3, code:"VT003", name:"ลำไส้อักเสบ",        nameEn:"Parvovirus",          speciesId:1,    active:true },
  { id:4, code:"VT004", name:"ตับอักเสบ",          nameEn:"Hepatitis",           speciesId:1,    active:true },
  { id:5, code:"VT005", name:"ไข้หัดแมว",          nameEn:"Feline Panleukopenia", speciesId:2,   active:true },
  { id:6, code:"VT006", name:"ลิวคีเมียแมว",       nameEn:"Feline Leukemia",     speciesId:2,    active:true },
];

function VaccineTypesSection({ species, items, setItems }: {
  species: PetSpecies[];
  items: VaccineType[];
  setItems: React.Dispatch<React.SetStateAction<VaccineType[]>>;
}) {
  const { showSnackbar } = useSnackbar();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VaccineType | null>(null);
  const empty: VaccineType = { id:0, code:"", name:"", nameEn:"", speciesId:null, active:true };
  const [form, setForm] = useState<VaccineType>(empty);
  const set = <K extends keyof VaccineType>(k: K, v: VaccineType[K]) => setForm(f => ({ ...f, [k]: v }));

  /* รหัสถัดไปแบบ VTxxx — ไล่จากเลขที่มากที่สุดที่ใช้อยู่ ไม่ใช่จำนวนแถว
     (ถ้าใช้จำนวนแถว พอลบรายการกลางออกแล้วเพิ่มใหม่จะได้รหัสซ้ำกับที่มีอยู่) */
  const nextCode = () => {
    const max = items.reduce((m, v) => {
      const n = Number(/^VT(\d+)$/.exec(v.code)?.[1] ?? 0);
      return n > m ? n : m;
    }, 0);
    return `VT${String(max + 1).padStart(3, "0")}`;
  };

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (v: VaccineType) => { setEditing(v); setForm({ ...v }); setOpen(true); };
  /* คัดลอก — เปิดโหมดเพิ่มพร้อมข้อมูลเดิม ล้างรหัสให้ระบบออกใหม่ */
  const openCopy = (v: VaccineType) => { setEditing(null); setForm({ ...v, id: 0, code: "" }); setOpen(true); };
  const handleSave = () => {
    const row: VaccineType = { ...form, name: form.name.trim(), nameEn: form.nameEn.trim(), code: form.code.trim() || nextCode() };
    if (editing) { setItems(vs => vs.map(v => v.id === editing.id ? row : v)); showSnackbar("success", "แก้ไขประเภทวัคซีนเรียบร้อย"); }
    else { setItems(vs => [...vs, { ...row, id: nextId(vs) }]); showSnackbar("success", "เพิ่มประเภทวัคซีนเรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setItems(vs => vs.filter(v => v.id !== id)); showSnackbar("success", "ลบประเภทวัคซีนเรียบร้อย"); };

  const speciesOf = (id: number | null) => species.find(sp => sp.id === id);
  const q = search.trim().toLowerCase();
  const filtered = items.filter(v => !q
    || v.name.toLowerCase().includes(q)
    || v.nameEn.toLowerCase().includes(q)
    || v.code.toLowerCase().includes(q));

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#22d3ee,#0891b2)", boxShadow: "0 4px 12px rgba(8,145,178,0.25), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
            <Syringe className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ประเภทวัคซีน</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Vaccine Types · {items.length} รายการ</p>
          </div>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)", boxShadow: "var(--hero-btn-shadow)", fontWeight: 700,
          }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่มประเภทวัคซีน
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ / รหัส..." className="vet-search pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["รหัส","ชื่อ (ภาษาไทย)","ชื่อ (English)","ประเภทสัตว์","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(v => {
                const sp = speciesOf(v.speciesId);
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{v.code}</td>
                    <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{v.name}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{v.nameEn || "—"}</td>
                    <td className="px-4 py-2.5">
                      {sp
                        ? <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">{sp.icon} {sp.name}</span>
                        : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">ทุกชนิดสัตว์</span>}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge active={v.active} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(v)} title="แก้ไข" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openCopy(v)} title="คัดลอกรายการนี้" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(v.id)} title="ลบ" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <Syringe className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">ไม่พบประเภทวัคซีน</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={open} title={editing ? "แก้ไขประเภทวัคซีน" : "เพิ่มประเภทวัคซีน"}
        subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"}
        icon={<Syringe className="w-[20px] h-[20px] text-white" />}
        onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name.trim()}>
        <div className="space-y-3.5">
          <div>
            <label className={labelCls}>รหัส</label>
            <input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="VT001" />
            <p className="vet-tiny mt-1">ถ้าไม่กรอก ระบบจะสร้างรหัสให้อัตโนมัติ</p>
          </div>
          <div>
            <label className={labelCls}>ชื่อ (ภาษาไทย) <span className="required">*</span></label>
            <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="พิษสุนัขบ้า" autoFocus />
          </div>
          <div>
            <label className={labelCls}>ชื่อ (English)</label>
            <input className={inputCls} value={form.nameEn} onChange={e => set("nameEn", e.target.value)} placeholder="Rabies" />
          </div>
          <div>
            <label className={labelCls}>ประเภทสัตว์</label>
            {/* ไม่บังคับ — วัคซีนบางชนิดใช้ได้หลายสายพันธุ์ เช่นพิษสุนัขบ้าฉีดได้ทั้งหมาและแมว */}
            <select className={selectCls} value={form.speciesId ?? ""}
              onChange={e => set("speciesId", e.target.value === "" ? null : Number(e.target.value))}>
              <option value="">เลือกประเภทสัตว์ (ไม่บังคับ)</option>
              {species.filter(sp => sp.active).map(sp => <option key={sp.id} value={sp.id}>{sp.icon} {sp.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Toggle checked={form.active} onChange={v => set("active", v)} />
            <span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: หัตถการห้องตรวจ ─────────────────────────────────────
/* หัตถการที่ทำในห้องตรวจ (ตัดไหม · ทำแผล · ทำหมัน ...)
   ผูกกับ "รหัสรายการ" ของค่าบริการ เพื่อให้เรียกเก็บเงินอัตโนมัติเมื่อทำหัตถการ
   ไม่ผูกก็ได้ — หัตถการบางอย่างรวมอยู่ในค่าตรวจแล้วไม่คิดเงินแยก */
interface Procedure {
  id: number;
  name: string;
  chargeCode: string;   // รหัสของ ServiceItem — "" = ไม่ผูกค่าใช้จ่าย
  active: boolean;
}
const INIT_PROCEDURES: Procedure[] = [
  { id:1, name:"ตรวจร่างกายทั่วไป (Physical exam)", chargeCode:"", active:true },
  { id:2, name:"ตัดไหม",                            chargeCode:"", active:true },
  { id:3, name:"ทำแผล",                             chargeCode:"", active:true },
  { id:4, name:"การทำหมัน",                         chargeCode:"", active:true },
  { id:5, name:"ผ่าคลอด",                           chargeCode:"", active:true },
  { id:6, name:"ผ่าตัดช่องท้อง",                     chargeCode:"", active:true },
  { id:7, name:"หัตถการทันตกรรม",                    chargeCode:"", active:true },
  { id:8, name:"ศัลยกรรมช่องปากและใบหน้า",           chargeCode:"", active:true },
  { id:9, name:"ศัลยกรรมใบหู",                       chargeCode:"", active:true },
];

/** dropdown เลือกรหัสรายการค่าบริการ พร้อมช่องค้นหาในตัว
    รายการค่าบริการมีเป็นร้อย ถ้าใช้ <select> ธรรมดาจะเลื่อนหาไม่ไหว */
function ChargeCodePicker({ items, value, onChange, placeholder = "เลือกรหัสรายการ (nondrugitems)", emptyLabel = "— ไม่ผูกค่าใช้จ่าย —" }: {
  items: Array<{ id: number; code: string; name: string }>;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const picked = items.find(it => it.code === value);
  const kw = q.trim().toLowerCase();
  const shown = items.filter(it => !kw || it.code.toLowerCase().includes(kw) || it.name.toLowerCase().includes(kw));

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="vet-select w-full flex items-center justify-between gap-2 text-left"
        style={{ borderColor: open ? "var(--brand)" : undefined }}>
        <span className={`truncate ${picked ? "text-gray-800" : "text-gray-400"}`}
          title={picked ? `${picked.code} · ${picked.name}` : undefined}>
          {picked ? `${picked.code} · ${picked.name}` : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl border border-gray-200 overflow-hidden"
          style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.14)" }}>
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="ค้นหาด้วยรหัส / ชื่อรายการ..."
                className="w-full pl-8 pr-2 py-1.5 text-[12.5px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-(--brand)" />
            </div>
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {/* ไม่ผูกค่าใช้จ่าย — ต้องเลือกกลับได้ ไม่ใช่ตั้งแล้วล้างไม่ได้ */}
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-50">
              <span className="text-[12px] text-gray-400">{emptyLabel}</span>
            </button>
            {shown.map(it => (
              <button key={it.id} type="button" onClick={() => { onChange(it.code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors">
                <span className="text-[10.5px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">{it.code}</span>
                <span className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 500 }} title={it.name}>{it.name}</span>
              </button>
            ))}
            {shown.length === 0 && <p className="px-3 py-6 text-center text-[12px] text-gray-400">ไม่พบรายการ</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ProceduresSection() {
  const { showSnackbar } = useSnackbar();
  const { services } = useClinicData();
  const [items, setItems] = useState<Procedure[]>(INIT_PROCEDURES);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Procedure | null>(null);
  const empty: Procedure = { id:0, name:"", chargeCode:"", active:true };
  const [form, setForm] = useState<Procedure>(empty);
  const set = <K extends keyof Procedure>(k: K, v: Procedure[K]) => setForm(f => ({ ...f, [k]: v }));

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Procedure) => { setEditing(p); setForm({ ...p }); setOpen(true); };
  const openCopy = (p: Procedure) => { setEditing(null); setForm({ ...p, id: 0 }); setOpen(true); };
  const handleSave = () => {
    const row: Procedure = { ...form, name: form.name.trim() };
    if (editing) { setItems(ps => ps.map(p => p.id === editing.id ? row : p)); showSnackbar("success", "แก้ไขหัตถการเรียบร้อย"); }
    else { setItems(ps => [...ps, { ...row, id: nextId(ps) }]); showSnackbar("success", "เพิ่มหัตถการเรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setItems(ps => ps.filter(p => p.id !== id)); showSnackbar("success", "ลบหัตถการเรียบร้อย"); };

  const chargeOf = (code: string) => services.find(sv => sv.code === code);
  const q = search.trim().toLowerCase();
  const filtered = items.filter(p => !q || p.name.toLowerCase().includes(q) || p.chargeCode.toLowerCase().includes(q));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#f472b6,#db2777)", boxShadow: "0 4px 12px rgba(219,39,119,0.25), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
            <Scissors className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>หัตถการห้องตรวจ</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Procedures · {items.length} รายการ</p>
          </div>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)", boxShadow: "var(--hero-btn-shadow)", fontWeight: 700,
          }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่มหัตถการ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาหัตถการ..." className="vet-search pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["ลำดับ","ชื่อหัตถการ","รหัสรายการ","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => {
                const ch = chargeOf(p.chargeCode);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{p.name}</td>
                    <td className="px-4 py-2.5">
                      {ch
                        ? <span className="inline-flex items-center gap-1.5">
                            <span className="text-[10.5px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{ch.code}</span>
                            <span className="text-xs text-gray-500 truncate">{ch.name}</span>
                          </span>
                        : <span className="text-gray-300">–</span>}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge active={p.active} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} title="แก้ไข" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openCopy(p)} title="คัดลอกรายการนี้" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} title="ลบ" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <Scissors className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">ไม่พบหัตถการ</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={open} title={editing ? "แก้ไขหัตถการ" : "เพิ่มหัตถการ"}
        subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"}
        icon={<Scissors className="w-[20px] h-[20px] text-white" />}
        onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name.trim()}>
        <div className="space-y-3.5">
          <div>
            <label className={labelCls}>ชื่อหัตถการ <span className="required">*</span></label>
            <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="เช่น ตัดไหม" autoFocus />
          </div>
          <div>
            <label className={labelCls}>รหัสรายการ</label>
            <ChargeCodePicker items={services} value={form.chargeCode} onChange={c => set("chargeCode", c)} />
            <p className="vet-tiny mt-1">ผูกกับค่าบริการเพื่อคิดเงินอัตโนมัติ · เว้นว่างได้ถ้าไม่คิดเงินแยก</p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Toggle checked={form.active} onChange={v => set("active", v)} />
            <span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: ทะเบียนแบบ "รหัส + ชื่อ" (ใช้ซ้ำได้) ─────────────────
/* ทะเบียนหลายหน้าในระบบมีโครงเดียวกันเป๊ะ — รหัส + ชื่อ + สถานะ
   (ตำแหน่งที่ฉีด · วิธีการฉีด ...) จึงทำเป็นตัวเดียวแล้วส่งข้อความ/ไอคอนเข้าไป
   เพิ่มทะเบียนแบบนี้หน้าใหม่ = เพิ่ม seed + เรียกใช้ ไม่ต้องก๊อปตารางทั้งชุด */
interface CodeNameRow { id: number; code: string; name: string; active: boolean }

const INIT_INJ_SITES: CodeNameRow[] = [
  { id:1, code:"SITE01", name:"ต้นขาหลังซ้าย",   active:true },
  { id:2, code:"SITE02", name:"ต้นขาหลังขวา",    active:true },
  { id:3, code:"SITE03", name:"หนังคอ (Scruff)", active:true },
  { id:4, code:"SITE04", name:"ไหล่ซ้าย",        active:true },
  { id:5, code:"SITE05", name:"ไหล่ขวา",         active:true },
];
/* หน่วยยาไม่มีรหัส — มีแค่ชื่อ (ดู withCode ใน CodeNameSection) */
const INIT_DRUG_UNITS: CodeNameRow[] = [
  { id:1, code:"", name:"เม็ด",    active:true },
  { id:2, code:"", name:"แคปซูล",  active:true },
  { id:3, code:"", name:"ขวด",     active:true },
  { id:4, code:"", name:"มล.",     active:true },
  { id:5, code:"", name:"ซีซี",    active:true },
  { id:6, code:"", name:"หลอด",    active:true },
  { id:7, code:"", name:"ซอง",     active:true },
  { id:8, code:"", name:"แผง",     active:true },
  { id:9, code:"", name:"กล่อง",   active:true },
  { id:10, code:"", name:"หยด",    active:true },
];
const INIT_INJ_ROUTES: CodeNameRow[] = [
  { id:1, code:"RT01", name:"ฉีดเข้ากล้ามเนื้อ (IM)",   active:true },
  { id:2, code:"RT02", name:"ฉีดใต้ผิวหนัง (SC)",       active:true },
  { id:3, code:"RT03", name:"ฉีดเข้าหลอดเลือดดำ (IV)",  active:true },
  { id:4, code:"RT04", name:"ฉีดเข้าช่องท้อง (IP)",     active:true },
  { id:5, code:"RT05", name:"หยอดจมูก (IN)",            active:true },
];

function CodeNameSection({ entity, titleEn, icon: Ico, grad, glow, seed, codePlaceholder = "", namePlaceholder, nameLabel = "ชื่อ", withCode = true }: {
  entity: string;            // ชื่อไทยของทะเบียน ใช้ทั้งหัวข้อ ปุ่ม และข้อความแจ้งเตือน
  titleEn: string;
  icon: LucideIcon;
  grad: string;
  glow: string;
  seed: CodeNameRow[];
  codePlaceholder?: string;
  namePlaceholder: string;
  nameLabel?: string;
  /* บางทะเบียนมีแค่ชื่ออย่างเดียว ไม่มีรหัส (เช่นหน่วยยา)
     ปิดแล้วซ่อนทั้งคอลัมน์ในตารางและช่องในฟอร์ม + ไม่บังคับกรอก */
  withCode?: boolean;
}) {
  const { showSnackbar } = useSnackbar();
  const [items, setItems] = useState<CodeNameRow[]>(seed);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CodeNameRow | null>(null);
  const empty: CodeNameRow = { id:0, code:"", name:"", active:true };
  const [form, setForm] = useState<CodeNameRow>(empty);
  const set = <K extends keyof CodeNameRow>(k: K, v: CodeNameRow[K]) => setForm(f => ({ ...f, [k]: v }));

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (x: CodeNameRow) => { setEditing(x); setForm({ ...x }); setOpen(true); };
  const handleSave = () => {
    const row: CodeNameRow = { ...form, code: form.code.trim(), name: form.name.trim() };
    if (editing) { setItems(xs => xs.map(x => x.id === editing.id ? row : x)); showSnackbar("success", `แก้ไข${entity}เรียบร้อย`); }
    else { setItems(xs => [...xs, { ...row, id: nextId(xs) }]); showSnackbar("success", `เพิ่ม${entity}เรียบร้อย`); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setItems(xs => xs.filter(x => x.id !== id)); showSnackbar("success", `ลบ${entity}เรียบร้อย`); };

  const q = search.trim().toLowerCase();
  const filtered = items.filter(x => !q || x.name.toLowerCase().includes(q) || (withCode && x.code.toLowerCase().includes(q)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: grad, boxShadow: `0 4px 12px ${glow}, inset 0 1px 0 rgba(255,255,255,0.30)` }}>
            <Ico className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>{entity}</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>{titleEn} · {items.length} รายการ</p>
          </div>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)", boxShadow: "var(--hero-btn-shadow)", fontWeight: 700,
          }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่ม{entity}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ / รหัส..." className="vet-search pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["ลำดับ", ...(withCode ? ["รหัส"] : []), nameLabel, "สถานะ", "จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((x, i) => (
                <tr key={x.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                  {withCode && <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{x.code}</td>}
                  <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{x.name}</td>
                  <td className="px-4 py-2.5"><StatusBadge active={x.active} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(x)} title="แก้ไข" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(x.id)} title="ลบ" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <Ico className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">ไม่พบ{entity}</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={open} title={`${editing ? "แก้ไข" : "เพิ่ม"}${entity}`}
        subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"}
        icon={<Ico className="w-[20px] h-[20px] text-white" />}
        onClose={() => setOpen(false)} onSave={handleSave}
        canSave={(!withCode || !!form.code.trim()) && !!form.name.trim()}>
        <div className="space-y-3.5">
          {withCode && (
            <div>
              <label className={labelCls}>รหัส <span className="required">*</span></label>
              <input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder={codePlaceholder} />
            </div>
          )}
          <div>
            <label className={labelCls}>{nameLabel} <span className="required">*</span></label>
            <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder={namePlaceholder} autoFocus />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Toggle checked={form.active} onChange={v => set("active", v)} />
            <span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: รายการยาถ่ายพยาธิ ────────────────────────────────────
/* ยาถ่ายพยาธิเก็บแยกจากทะเบียนยาทั่วไป เพราะต้องคุมล็อต/วันหมดอายุรายตัว
   (ยาถ่ายพยาธิหมดอายุแล้วประสิทธิภาพตกทันที ต้องรู้ว่าจ่ายจากล็อตไหน) */
const DEWORMER_TYPES = ["ถ่ายพยาธิภายใน", "ถ่ายพยาธิภายนอก", "ถ่ายพยาธิรวม (ใน+นอก)", "ถ่ายพยาธิหนอนหัวใจ", "อื่นๆ"];
interface Dewormer {
  id: number;
  icode: string;        // รหัสสินค้าในคลังยา (StockProduct.code)
  drugType: string;     // ประเภทยา
  lots: VaccineLot[];   // ใช้โครงล็อตชุดเดียวกับวัคซีน — รูปแบบเหมือนกันเป๊ะ
  active: boolean;
}
/* วันหมดอายุของล็อตตรงกับ expiry ของสินค้าในคลัง — ถ้าตั้งไว้คนละวัน
   จะงงว่าจะเชื่ออันไหนตอนหยิบยาจ่ายจริง */
const INIT_DEWORMERS: Dewormer[] = [
  { id:1, icode:"1000008", drugType:"ถ่ายพยาธิภายใน",        lots:[{ lot:"MRX-2026A", expiry:"2027-05-31" }], active:true },
  { id:2, icode:"1000009", drugType:"ถ่ายพยาธิรวม (ใน+นอก)", lots:[{ lot:"NGS-2026B", expiry:"2027-07-31" }], active:true },
  { id:3, icode:"1000012", drugType:"ถ่ายพยาธิภายใน",        lots:[{ lot:"PAN-2026C", expiry:"2027-01-31" }], active:true },
  { id:4, icode:"1000013", drugType:"ถ่ายพยาธิรวม (ใน+นอก)", lots:[{ lot:"RVP-2026D", expiry:"2027-04-30" }], active:true },
];

function DewormersSection() {
  const { showSnackbar } = useSnackbar();
  const { drugs } = useClinicData();
  const [items, setItems] = useState<Dewormer[]>(INIT_DEWORMERS);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dewormer | null>(null);
  const empty: Dewormer = { id:0, icode:"", drugType:DEWORMER_TYPES[0], lots:[{ lot:"", expiry:"" }], active:true };
  const [form, setForm] = useState<Dewormer>(empty);
  const set = <K extends keyof Dewormer>(k: K, v: Dewormer[K]) => setForm(f => ({ ...f, [k]: v }));

  /* เฉพาะยาถ่ายพยาธิในคลังยา — เดิมดึงหมวด "ยา/วิตามิน" ของหน้าร้าน
     ซึ่งเป็นอาหารเสริมขาย ไม่มียาถ่ายพยาธิเลย ส่วนคลังยาทั้งก้อนก็กว้างไป
     (มี Famotidine, Carprofen ปนมา) หน้านี้ผูกได้แค่ยาถ่ายพยาธิเท่านั้น */
  const drugStock = drugs.filter(d => d.active && d.category === "ยาถ่ายพยาธิ");
  const stockOf = (code: string) => drugs.find(d => d.code === code);

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (d: Dewormer) => { setEditing(d); setForm({ ...d, lots: d.lots.length ? [...d.lots] : [{ lot:"", expiry:"" }] }); setOpen(true); };
  const openCopy = (d: Dewormer) => { setEditing(null); setForm({ ...d, id: 0, lots: d.lots.length ? [...d.lots] : [{ lot:"", expiry:"" }] }); setOpen(true); };

  const patchLot = (i: number, patch: Partial<VaccineLot>) =>
    setForm(f => ({ ...f, lots: f.lots.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const addLot = () => setForm(f => ({ ...f, lots: [...f.lots, { lot: "", expiry: "" }] }));
  const delLot = (i: number) => setForm(f => ({ ...f, lots: f.lots.filter((_, j) => j !== i) }));

  const handleSave = () => {
    const row: Dewormer = { ...form, lots: form.lots.filter(l => l.lot.trim() || l.expiry).map(l => ({ ...l, lot: l.lot.trim() })) };
    if (editing) { setItems(ds => ds.map(d => d.id === editing.id ? row : d)); showSnackbar("success", "แก้ไขยาถ่ายพยาธิเรียบร้อย"); }
    else { setItems(ds => [...ds, { ...row, id: nextId(ds) }]); showSnackbar("success", "เพิ่มยาถ่ายพยาธิเรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setItems(ds => ds.filter(d => d.id !== id)); showSnackbar("success", "ลบยาถ่ายพยาธิเรียบร้อย"); };

  const q = search.trim().toLowerCase();
  const filtered = items.filter(d => !q
    || d.icode.toLowerCase().includes(q)
    || d.drugType.toLowerCase().includes(q)
    || (stockOf(d.icode)?.name ?? "").toLowerCase().includes(q)
    || d.lots.some(l => l.lot.toLowerCase().includes(q)));

  /* บันทึกได้เมื่อเลือกรหัสรายการแล้ว และมีล็อตที่กรอกจริงอย่างน้อย 1 ล็อต
     (ทั้งสองช่องมีดาวแดงในแบบ) */
  const canSave = !!form.icode && form.lots.some(l => l.lot.trim() || l.expiry);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#a78bfa,#7c3aed)", boxShadow: "0 4px 12px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
            <Bug className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>รายการยาถ่ายพยาธิ</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Dewormers · {items.length} รายการ</p>
          </div>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)", boxShadow: "var(--hero-btn-shadow)", fontWeight: 700,
          }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่มยาถ่ายพยาธิ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหารหัส / ชื่อยา / ล็อต..." className="vet-search pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["ลำดับ","รหัสรายการ","ชื่อยา","ประเภทยา","ล็อต","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-3 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d, i) => {
                const sp = stockOf(d.icode);
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2.5 text-xs">{sp ? <span className="text-gray-500 font-mono">{sp.code}</span> : <span className="text-gray-300">–</span>}</td>
                    <td className="px-3 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{sp?.name ?? <span className="text-gray-300">–</span>}</td>
                    <td className="px-3 py-2.5"><span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{d.drugType}</span></td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{d.lots.length ? `${d.lots.length} ล็อต` : <span className="text-gray-300">0 ล็อต</span>}</td>
                    <td className="px-3 py-2.5"><StatusBadge active={d.active} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(d)} title="แก้ไข" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openCopy(d)} title="คัดลอกรายการนี้" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(d.id)} title="ลบ" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <Bug className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">ไม่พบยาถ่ายพยาธิ</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={open} title={editing ? "แก้ไขยาถ่ายพยาธิ" : "เพิ่มยาถ่ายพยาธิ"}
        subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"}
        icon={<Bug className="w-[20px] h-[20px] text-white" />}
        onClose={() => setOpen(false)} onSave={handleSave} canSave={canSave}>
        <div className="space-y-3.5">
          {/* icode กินเต็มแถว — ชื่อยาในคลังยาว (ตัวยา + ความแรง + รูปแบบ)
              บีบไว้ครึ่งแถวแล้วโดนตัดจนแยกไม่ออกว่าคนละตัว เลือกผิดง่าย
              รายการที่เลื่อนลงมาก็กว้างตามปุ่ม จึงได้อานิสงส์ไปด้วย */}
          <div>
            <label className={labelCls}>รหัสรายการ (icode) <span className="required">*</span></label>
            <ChargeCodePicker items={drugStock} value={form.icode} onChange={c => set("icode", c)}
              placeholder="เลือกรายการ" emptyLabel="— ไม่เลือก —" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ประเภทยา</label>
              <select className={selectCls} value={form.drugType} onChange={e => set("drugType", e.target.value)}>
                {DEWORMER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>ล็อต / วันหมดอายุ <span className="required">*</span></label>
              <button type="button" onClick={addLot} className="vet-btn vet-btn-secondary vet-btn-sm inline-flex items-center gap-1">
                <Plus className="w-3 h-3" /> เพิ่มล็อต
              </button>
            </div>
            <div className="space-y-2">
              {form.lots.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={l.lot} onChange={e => patchLot(i, { lot: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-(--brand) focus:bg-white"
                    placeholder="เช่น LOT2026A" />
                  <div style={{ width: 178 }}>
                    <DatePickerModern value={l.expiry} onChange={d => patchLot(i, { expiry: d })} placeholder="เลือกวันหมดอายุ" />
                  </div>
                  <button type="button" onClick={() => delLot(i)} disabled={form.lots.length <= 1} title="ลบล็อตนี้"
                    className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Toggle checked={form.active} onChange={v => set("active", v)} />
            <span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: ห้องทำงาน ───────────────────────────────────────────
function RoomsSection({ rooms, setRooms }: { rooms: Room[]; setRooms: React.Dispatch<React.SetStateAction<Room[]>> }) {
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const empty: Room = { id:0, name:"", type:"ห้องตรวจ", active:true };
  const [form, setForm] = useState<Room>(empty);
  const set = <K extends keyof Room>(k: K, v: Room[K]) => setForm(f => ({ ...f, [k]: v }));
  const types = ["ห้องตรวจ","ห้องผ่าตัด","ห้องพักฟื้น","ห้องแล็บ","ห้องประชุม","อื่นๆ"];

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (r: Room) => { setEditing(r); setForm({ ...r }); setOpen(true); };
  const handleSave = () => {
    if (editing) { setRooms(rs => rs.map(r => r.id === editing.id ? form : r)); showSnackbar("success", "แก้ไขห้องทำงานเรียบร้อย"); }
    else { setRooms(rs => [...rs, { ...form, id: nextId(rs) }]); showSnackbar("success", "เพิ่มห้องทำงานเรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setRooms(rs => rs.filter(r => r.id !== id)); showSnackbar("success", "ลบห้องทำงานเรียบร้อย"); };

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#2dd4bf,#0d9488)",
              boxShadow: "0 4px 12px rgba(13,148,136,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <Building2 className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ทะเบียนห้องทำงาน</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>
              Room Registry · {rooms.length} ห้อง · เปิดใช้งาน {rooms.filter(r => r.active).length}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)",
            boxShadow: "var(--hero-btn-shadow)",
            fontWeight: 700,
            
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มห้อง
        </button>
      </div>

      {/* Rows — each its own card */}
      <div className="space-y-2.5">
        {rooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-12 gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#d1d5db]" />
            </div>
            <p className="text-sm text-[#9ca3af]">ยังไม่มีห้องทำงาน</p>
          </div>
        ) : (
          rooms.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all"
              style={{
                border: `1px solid ${r.active ? "color-mix(in srgb, var(--brand) 20%, transparent)" : "#f3f4f6"}`,
                boxShadow: r.active
                  ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px color-mix(in srgb, var(--brand) 6%, transparent)"
                  : "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                  style={{
                    background: r.active
                      ? "linear-gradient(135deg,#2dd4bf,#0d9488)"
                      : "linear-gradient(135deg,#94a3b8,#64748b)",
                    boxShadow: r.active
                      ? "0 4px 12px rgba(13,148,136,0.25), inset 0 1px 0 rgba(255,255,255,0.30)"
                      : "0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.20)",
                  }}
                >
                  <Building2 className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{r.name}</p>
                  <p className="text-[11px] text-gray-500 truncate" style={{ fontWeight: 500 }}>{r.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Toggle
                  checked={r.active}
                  onChange={v => {
                    setRooms(rs => rs.map(x => x.id === r.id ? { ...x, active: v } : x));
                    showSnackbar("success", v ? `เปิดใช้งาน ${r.name}` : `ปิดใช้งาน ${r.name}`);
                  }}
                />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(r)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(r.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={open} title={editing ? "แก้ไขห้องทำงาน" : "เพิ่มห้องทำงาน"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<Building2 className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name}>
        <div><label className={labelCls}>ชื่อห้องทำงาน <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ห้องตรวจ A" /></div>
        <div><label className={labelCls}>ประเภทห้อง</label><select className={selectCls} value={form.type} onChange={e => set("type", e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select></div>
        <div className="flex items-center gap-3"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
      </Modal>
    </div>
  );
}


// ─── Section: โปรโมชั่น & คูปอง ────────────────────────────────
function PromotionsSection() {
  const { showSnackbar } = useSnackbar();
  const [rows, setRows] = useState<Promotion[]>(() => listPromotions());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [search, setSearch] = useState("");
  const redemptions = listRedemptions();

  const reload = () => setRows(listPromotions());
  const handleSave = (p: Promotion) => {
    savePromotion(p); reload(); setOpen(false);
    showSnackbar("success", editing ? "แก้ไขโปรโมชั่นเรียบร้อย" : "สร้างโปรโมชั่นเรียบร้อย");
  };
  const handleDelete = (p: Promotion) => {
    deletePromotion(p.id); reload();
    showSnackbar("success", `ลบ "${p.name}" แล้ว`);
  };
  const toggleActive = (p: Promotion) => {
    savePromotion({ ...p, active: !p.active }); reload();
    showSnackbar("success", !p.active ? `เปิดใช้งาน ${p.name}` : `ปิดใช้งาน ${p.name}`);
  };

  const q = search.trim().toLowerCase();
  const filtered = rows.filter(p => !q || p.name.toLowerCase().includes(q) || (p.code ?? "").toLowerCase().includes(q));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#fb7185,#e11d48)", boxShadow: "0 4px 12px rgba(225,29,72,0.25), inset 0 1px 0 rgba(255,255,255,0.30)" }}>
            <Ticket className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>โปรโมชั่น & คูปอง</p>
            <p className="vet-tiny">คูปองส่วนลด · แพ็กเกจ — ใช้ได้ที่หน้าชำระเงินของทุกบริการ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input className="vet-search" style={{ paddingLeft: 34 }} value={search}
              onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ หรือรหัสคูปอง..." />
          </div>
          <button onClick={() => { setEditing(null); setOpen(true); }}
            className="vet-btn vet-btn-primary btn-green flex-shrink-0 whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> สร้างโปรโมชั่น
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[12.5px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th className="text-left px-3 py-3" style={{ width: 46 }}>#</th>
                <th className="text-left px-3 py-3">ชื่อโปรโมชั่น</th>
                <th className="text-left px-3 py-3">ประเภท</th>
                <th className="text-left px-3 py-3" style={{ width: 170 }}>บริการที่ร่วม</th>
                <th className="text-left px-3 py-3" style={{ width: 150 }}>สิทธิ์ / ส่วนลด</th>
                <th className="text-left px-3 py-3" style={{ width: 130 }}>ผูกสัตว์เลี้ยง</th>
                <th className="text-left px-3 py-3" style={{ width: 100 }}>สถานะ</th>
                <th className="px-3 py-3" style={{ width: 84 }}>จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-400 py-12">ยังไม่มีโปรโมชั่น — กด “สร้างโปรโมชั่น”</td></tr>
              ) : filtered.map((p, i) => {
                const used = usedCount(p.id, redemptions);
                const exp = expiryOf(p);
                const isPkg = p.kind === "package";
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <p className="text-gray-800 truncate" style={{ fontWeight: 600 }}>{p.name}</p>
                      {p.code && <p className="text-[10.5px] text-gray-400 font-mono">{p.code}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full"
                        style={isPkg ? { background: "rgba(139,92,246,0.10)", color: "#7c3aed" } : { background: "rgba(245,158,11,0.12)", color: "#b45309" }}>
                        {isPkg ? <Package className="w-3 h-3" /> : <Ticket className="w-3 h-3" />}
                        {isPkg ? "แพ็กเกจ" : "คูปอง"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 truncate">
                      {p.scopes.map(k => PROMO_SCOPES.find(s => s.key === k)?.label).join(" · ")}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">
                      {isPkg
                        ? <>{used}/{p.quota} ครั้ง{p.price ? <span className="text-gray-400"> · ฿{p.price.toLocaleString()}</span> : null}</>
                        : <>ลด {p.discountPercent}%<span className="text-gray-400"> · ใช้ {used} ครั้ง</span></>}
                      {exp && <p className="text-[10.5px] text-gray-400">หมด {fmtThaiDate(exp.toISOString())}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 truncate">
                      {p.petLabel ? <span className="text-[11.5px]">{p.petLabel}</span> : <span className="text-gray-300">ทุกตัว</span>}
                    </td>
                    <td className="px-3 py-2.5"><Toggle checked={p.active} onChange={() => toggleActive(p)} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(p); setOpen(true); }} title="แก้ไข"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p)} title="ลบ"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <Modal open={open} title={editing ? "แก้ไขโปรโมชั่น" : "ตั้งค่าโปรโมชั่นใหม่"}
          subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "คูปองส่วนลด หรือแพ็กเกจ"}
          icon={<Ticket className="w-[20px] h-[20px] text-white" />}
          onClose={() => setOpen(false)} onSave={() => {}} canSave={false} hideFooter>
          <PromotionForm editing={editing} onSave={handleSave} onCancel={() => setOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

// ─── Section: บุคลากร ─────────────────────────────────────────────
function PersonnelSection({ personnel, setPersonnel, rooms }: { personnel: Personnel[]; setPersonnel: React.Dispatch<React.SetStateAction<Personnel[]>>; rooms: Room[] }) {
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Personnel | null>(null);
  const empty: Personnel = { id:0, name:"", licenseNo:"", position:"สัตวแพทย์", role:"สัตวแพทย์", roomId:null, active:true };
  const [form, setForm] = useState<Personnel>(empty);
  const set = <K extends keyof Personnel>(k: K, v: Personnel[K]) => setForm(f => ({ ...f, [k]: v }));
  /* เปิดใช้ Slot นัดหมาย — เก็บแยกจาก Personnel เพราะหน้าจองนัดหมายต้องอ่านได้
     โดยไม่ต้องรู้จักตาราง Personnel (คนละหน้า ไม่มี context ร่วมกัน) */
  const [useSlots, setUseSlots] = useState(true);
  const isVet = form.position === "สัตวแพทย์";
  const positions = ["สัตวแพทย์","ผู้ช่วยสัตวแพทย์","เจ้าหน้าที่","พยาบาลสัตว์","ผู้ดูแลระบบ"];
  const roles = ["สัตวแพทย์","เจ้าหน้าที่","แอดมิน"];

  const roleColor = (r: string) => r === "แอดมิน" ? "bg-red-100 text-red-600" : r === "สัตวแพทย์" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600";

  const openAdd  = () => { setEditing(null); setForm(empty); setUseSlots(true); setOpen(true); };
  const openEdit = (p: Personnel) => { setEditing(p); setForm({ ...p }); setUseSlots(vetUsesSlots(p.slotKey)); setOpen(true); };
  const handleSave = () => {
    /* ค่า "เปิดใช้ Slot" เก็บโดยอ้าง slotKey — สัตวแพทย์ที่เพิ่มใหม่ยังไม่มี
       จึงออกรหัสให้ตรงนี้ ใช้ p- นำหน้ากันชนกับ v1..v4 ของตารางออกตรวจเดิม */
    const id = editing ? editing.id : nextId(personnel);
    const row: Personnel = form.position === "สัตวแพทย์" && !form.slotKey
      ? { ...form, slotKey: `p${id}` }
      : form;
    if (row.slotKey) setVetUsesSlots(row.slotKey, useSlots);
    if (editing) { setPersonnel(ps => ps.map(p => p.id === editing.id ? row : p)); showSnackbar("success", "แก้ไขข้อมูลบุคลากรเรียบร้อย"); }
    else { setPersonnel(ps => [...ps, { ...row, id }]); showSnackbar("success", "เพิ่มบุคลากรเรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setPersonnel(ps => ps.filter(p => p.id !== id)); showSnackbar("success", "ลบบุคลากรเรียบร้อย"); };

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#818cf8,#4f46e5)",
              boxShadow: "0 4px 12px rgba(79,70,229,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <UserCircle className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ทะเบียนบุคลากร</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>
              Personnel Registry · {personnel.length} คน · เปิดใช้งาน {personnel.filter(p => p.active).length}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)",
            boxShadow: "var(--hero-btn-shadow)",
            fontWeight: 700,
            
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มบุคลากร
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["ชื่อ-นามสกุล","เลขใบประกอบวิชาชีพ","ตำแหน่ง","บทบาท","ห้องทำงาน","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-3 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {personnel.map(p => {
                const room = rooms.find(r => r.id === p.roomId);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-(--brand) to-(--brand-dark) flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-white" style={{ fontWeight:700 }}>{p.name.charAt(0)}</span>
                        </div>
                        <span className="text-gray-800" style={{ fontWeight:500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs font-mono">{p.licenseNo}</td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">{p.position}</td>
                    <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${roleColor(p.role)}`} style={{ fontWeight:500 }}>{p.role}</span></td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{room ? room.name : "—"}</td>
                    <td className="px-3 py-2.5"><StatusBadge active={p.active} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editing ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากร"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<UserCircle className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name}>
        <div className="space-y-3.5">
          <div><label className={labelCls}>ชื่อ-นามสกุล <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="สพ.ว. ชื่อ นามสกุล" /></div>
          <div><label className={labelCls}>เลขใบประกอบวิชาชีพ</label><input className={inputCls} value={form.licenseNo} onChange={e => set("licenseNo", e.target.value)} placeholder="ว.XXXXX หรือ -" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>ตำแหน่ง</label><select className={selectCls} value={form.position} onChange={e => set("position", e.target.value)}>{positions.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label className={labelCls}>บทบาท (Role)</label><select className={selectCls} value={form.role} onChange={e => set("role", e.target.value)}>{roles.map(r => <option key={r}>{r}</option>)}</select></div>
            <div className="col-span-2">
              <label className={labelCls}>ห้องทำงานหลัก</label>
              <select className={selectCls} value={form.roomId ?? ""} onChange={e => set("roomId", e.target.value ? Number(e.target.value) : null)}>
                <option value="">— ไม่ระบุ —</option>
                {rooms.filter(r => r.active).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>

          {/* เฉพาะสัตวแพทย์ที่มีตารางออกตรวจ — คนอื่นไม่มี slot ให้คุมอยู่แล้ว
              แยกเป็นกล่องของตัวเอง เพราะคำอธิบายยาวเกินกว่าจะเบียดอยู่แถวเดียวกับ Toggle */}
          {isVet && (
            <button type="button" role="switch" aria-checked={useSlots} onClick={() => setUseSlots(v => !v)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-colors text-left"
              style={{
                borderColor: useSlots ? "color-mix(in srgb, var(--brand) 40%, transparent)" : "#e5e7eb",
                background: useSlots ? "color-mix(in srgb, var(--brand) 6%, transparent)" : "#fafafa",
              }}>
              <span className="w-[18px] h-[18px] mt-[1px] rounded flex items-center justify-center flex-shrink-0 border transition-colors"
                style={{ background: useSlots ? "var(--brand)" : "#fff", borderColor: useSlots ? "var(--brand)" : "#d1d5db" }}>
                {useSlots && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px]" style={{ fontWeight: 700, color: useSlots ? "var(--brand-dark)" : "#374151" }}>
                  เปิดใช้ Slot นัดหมาย
                </span>
                <span className="block text-[11.5px] text-gray-500 mt-0.5">
                  {useSlots
                    ? "จองนัดได้เฉพาะวัน/เวลาที่แพทย์เปิด slot ไว้ในตารางออกตรวจ"
                    : "ไม่คุมด้วย slot — จองนัดวันไหนเวลาไหนก็ได้"}
                </span>
              </span>
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: กำหนดสิทธิ์ Role ────────────────────────────────────
function RolesSection() {
  const { showSnackbar } = useSnackbar();
  const [perms, setPerms] = useState(ROLE_PERMS);
  const toggle = (i: number, col: "admin"|"vet"|"staff") => {
    if (col === "admin") return; // แอดมินแก้ไม่ได้
    setPerms(ps => ps.map((p, idx) => idx === i ? { ...p, [col]: !p[col as keyof typeof p] } : p));
  };

  const CheckCell = ({ checked, onClick, disabled }: { checked: boolean; onClick: () => void; disabled?: boolean }) => (
    <td className="px-4 py-3 text-center">
      <button onClick={onClick} disabled={disabled}
        className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-all border ${checked ? "bg-(--brand) border-(--brand)" : "border-gray-200 hover:border-gray-300"} ${disabled ? "opacity-60 cursor-default" : "cursor-pointer"}`}>
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </button>
    </td>
  );

  return (
    <div className="space-y-3">
      {/* Section title + admin notice */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#fb7185,#e11d48)",
              boxShadow: "0 4px 12px rgba(225,29,72,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <Lock className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>สิทธิ์การเข้าถึงตามบทบาท</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Role Permissions · 3 บทบาท × {perms.length} ฟีเจอร์</p>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] text-orange-600 bg-orange-50 border border-orange-100"
          style={{ fontWeight: 600 }}
          title="แอดมินมีสิทธิ์ทุกอย่างโดยอัตโนมัติ"
        >
          <Shield className="w-3 h-3" /> สิทธิ์แอดมินแก้ไขไม่ได้
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[440px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>โมดูล / ฟีเจอร์</th>
                <th className="text-center px-4 py-3 text-xs text-red-500" style={{ fontWeight:600 }}>แอดมิน</th>
                <th className="text-center px-4 py-3 text-xs text-blue-500" style={{ fontWeight:600 }}>สัตวแพทย์</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>เจ้าหน้าที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {perms.map((p, i) => (
                <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-700 text-xs">{p.name}</td>
                  <CheckCell checked={p.admin} onClick={() => toggle(i,"admin")} disabled={true} />
                  <CheckCell checked={p.vet}   onClick={() => toggle(i,"vet")}   />
                  <CheckCell checked={p.staff} onClick={() => toggle(i,"staff")} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button onClick={() => showSnackbar("success","บันทึกสิทธิ์เรียบร้อย")}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm active:scale-95 transition-all"
        style={{ fontWeight:600, background:"linear-gradient(135deg,var(--brand),var(--brand-dark))", boxShadow:"0 2px 12px color-mix(in srgb, var(--brand) 30%, transparent)" }}>
        <Check className="w-4 h-4" /> บันทึกสิทธิ์
      </button>
    </div>
  );
}

// ─── Section: สิทธิ์การเข้าใช้ห้อง ────────────────────────────────
function AccessSection({ personnel, rooms }: { personnel: Personnel[]; rooms: Room[] }) {
  const { showSnackbar } = useSnackbar();
  const activeRooms = rooms.filter(r => r.active);
  const [access, setAccess] = useState<Record<string,boolean>>(() => {
    const m: Record<string,boolean> = {};
    personnel.forEach(p => activeRooms.forEach(r => { m[`${p.id}-${r.id}`] = p.roomId === r.id; }));
    return m;
  });
  const toggle = (pId: number, rId: number) => setAccess(a => ({ ...a, [`${pId}-${rId}`]: !a[`${pId}-${rId}`] }));

  return (
    <div className="space-y-3">
      {/* Section title */}
      <div className="flex items-center gap-2.5 px-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{
            background: "linear-gradient(135deg,#fb923c,#ea580c)",
            boxShadow: "0 4px 12px rgba(234,88,12,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
          }}
        >
          <Building2 className="w-[18px] h-[18px]" />
        </div>
        <div>
          <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>สิทธิ์การเข้าใช้ห้อง</p>
          <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>กำหนดว่าบุคลากรแต่ละคนสามารถเข้าใช้ห้องใดได้บ้าง · {personnel.length} คน × {activeRooms.length} ห้อง</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 min-w-[180px]" style={{ fontWeight:600 }}>บุคลากร</th>
                {activeRooms.map(r => (
                  <th key={r.id} className="text-center px-3 py-3 text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight:600 }}>{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {personnel.filter(p => p.active).map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-(--brand) to-(--brand-dark) flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-white" style={{ fontWeight:700 }}>{p.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-800 leading-tight" style={{ fontWeight:500 }}>{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.role}</p>
                      </div>
                    </div>
                  </td>
                  {activeRooms.map(r => (
                    <td key={r.id} className="px-3 py-3 text-center">
                      <button onClick={() => toggle(p.id, r.id)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto border transition-all ${access[`${p.id}-${r.id}`] ? "bg-(--brand) border-(--brand)" : "border-gray-200 hover:border-gray-300"}`}>
                        {access[`${p.id}-${r.id}`] && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button onClick={() => showSnackbar("success","บันทึกสิทธิ์การเข้าใช้ห้องเรียบร้อย")}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm active:scale-95 transition-all"
        style={{ fontWeight:600, background:"linear-gradient(135deg,var(--brand),var(--brand-dark))", boxShadow:"0 2px 12px color-mix(in srgb, var(--brand) 30%, transparent)" }}>
        <Check className="w-4 h-4" /> บันทึกสิทธิ์
      </button>
    </div>
  );
}

// ─── Wards (IPD) Section ──────────────────────────────────────────
function WardsSection() {
  const { wards, cages, addWard, updateWard, removeWard, toggleWard, addCage, removeCage } = useIPD();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [expandedWardId, setExpandedWardId] = useState<string | null>(null);
  const [menuWardId, setMenuWardId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [cageFormWardId, setCageFormWardId] = useState<string | null>(null);
  const [newCageId, setNewCageId] = useState("");
  const [newCageType, setNewCageType] = useState<CageType>("Small");

  const handleAddCage = (wardName: string) => {
    const id = newCageId.trim();
    if (!id) return;
    if (cages.some(c => c.id === id)) {
      showSnackbar("warning", `รหัส "${id}" มีอยู่แล้ว`);
      return;
    }
    addCage({ id, ward: wardName, type: newCageType, status: "available" });
    showSnackbar("success", `เพิ่มห้อง "${id}" แล้ว`);
    setNewCageId("");
    setCageFormWardId(null);
  };

  const handleRemoveCage = async (c: Cage) => {
    if (c.status === "occupied") {
      showSnackbar("warning", "ลบห้องไม่ได้ — มีผู้ป่วยอยู่");
      return;
    }
    const ok = await confirm({
      title: `ลบห้อง "${c.id}"?`,
      description: `${c.ward} · ${c.type} — การกระทำนี้ย้อนกลับไม่ได้`,
      confirmLabel: "ลบห้อง",
      kind: "danger",
    });
    if (ok) {
      removeCage(c.id);
      showSnackbar("delete", `ลบห้อง "${c.id}" แล้ว`);
    }
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (wards.some(w => w.name.toLowerCase() === name.toLowerCase())) {
      showSnackbar("warning", "ชื่อ Ward นี้มีอยู่แล้ว");
      return;
    }
    addWard({ name, enabled: true });
    showSnackbar("success", `เพิ่ม Ward "${name}" แล้ว`);
    setNewName("");
    setShowForm(false);
  };

  const handleStartEdit = (w: Ward) => { setEditingId(w.id); setEditingName(w.name); };
  const handleSaveEdit = (w: Ward) => {
    const name = editingName.trim();
    if (!name) { setEditingId(null); return; }
    updateWard(w.id, { name });
    showSnackbar("success", "แก้ไขชื่อ Ward แล้ว");
    setEditingId(null);
  };

  const handleRemove = async (w: Ward) => {
    const cageCount = cages.filter(c => c.ward === w.name).length;
    if (cageCount > 0) {
      showSnackbar("warning", `ลบไม่ได้ — มี ${cageCount} กรงใน Ward นี้`);
      return;
    }
    const ok = await confirm({
      title: `ลบ Ward "${w.name}"?`,
      description: "การกระทำนี้ย้อนกลับไม่ได้",
      confirmLabel: "ลบ Ward",
      kind: "danger",
    });
    if (ok) {
      removeWard(w.id);
      showSnackbar("delete", `ลบ Ward "${w.name}" แล้ว`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
            <Bed className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>จัดการ Ward (IPD)</h3>
            <p className="text-[11px] text-gray-500">
              {wards.length} Ward · เปิดใช้งาน {wards.filter(w => w.enabled).length} / ปิด {wards.filter(w => !w.enabled).length}
            </p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> เพิ่ม Ward
          </button>
        </div>

        {showForm && (
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 flex-wrap">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setShowForm(false); setNewName(""); } }}
              placeholder="ชื่อ Ward เช่น Ward D — Exotic"
              className="vet-input flex-1 min-w-[200px]"
            />
            <button onClick={() => { setShowForm(false); setNewName(""); }} className="vet-btn vet-btn-secondary">ยกเลิก</button>
            <button onClick={handleAdd} disabled={!newName.trim()} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> เพิ่ม
            </button>
          </div>
        )}

        <div className="p-3 space-y-2">
          {wards.length === 0 ? (
            <p className="text-[12px] text-gray-400 text-center py-6">ยังไม่มี Ward — กดปุ่ม "เพิ่ม Ward" ด้านบน</p>
          ) : (
            wards.map(w => {
              const wardCages = cages.filter(c => c.ward === w.name);
              const cageCount = wardCages.length;
              const isEditing = editingId === w.id;
              const isExpanded = expandedWardId === w.id;
              return (
                <div
                  key={w.id}
                  className="rounded-xl border border-gray-100 bg-white overflow-hidden"
                  style={{ opacity: w.enabled ? 1 : 0.65 }}
                >
                  {/* Top row — กดทั้งแถบเพื่อขยาย/หด */}
                  <div
                    onClick={() => { if (!isEditing) setExpandedWardId(isExpanded ? null : w.id); }}
                    className={`flex items-center gap-3 p-3 hover:bg-gray-50/50 transition-colors ${isEditing ? "" : "cursor-pointer"}`}
                  >
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0"
                      title={isExpanded ? "ย่อ" : "ขยาย"}
                    >
                      <ChevronRight className="w-4 h-4 transition-transform" style={{ transform: isExpanded ? "rotate(90deg)" : undefined }} />
                    </span>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: w.enabled ? "linear-gradient(135deg,color-mix(in srgb, var(--brand) 15%, transparent),color-mix(in srgb, var(--brand-dark) 10%, transparent))" : "#f3f4f6",
                        color: w.enabled ? "var(--brand-dark)" : "#9ca3af",
                      }}
                    >
                      <Bed className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleSaveEdit(w); if (e.key === "Escape") setEditingId(null); }}
                          onBlur={() => handleSaveEdit(w)}
                          onClick={e => e.stopPropagation()}
                          className="vet-input"
                          placeholder="ตั้งชื่อ Ward เช่น Ward A — Small"
                        />
                      ) : (
                        <>
                          <p className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{w.name}</p>
                          <p className="text-[10.5px] text-gray-500 truncate">
                            {cageCount} ห้อง · {w.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </p>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedWardId(w.id); setCageFormWardId(w.id); setNewCageId(""); setNewCageType("Small"); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] text-(--brand-dark) border border-(--brand)/30 hover:bg-(--brand)/12 transition-colors flex-shrink-0"
                        style={{ fontWeight: 600, background: "color-mix(in srgb, var(--brand) 8%, transparent)" }}
                        title="เพิ่มห้อง / กรง"
                      >
                        <Plus className="w-3.5 h-3.5" /> เพิ่มห้อง
                      </button>
                    )}

                    {isEditing ? (
                      <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 flex-shrink-0" title="ยกเลิก">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (menuWardId === w.id) { setMenuWardId(null); return; }
                            const r = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) });
                            setMenuWardId(w.id);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          title="เพิ่มเติม"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuWardId === w.id && menuPos && createPortal(
                          <>
                            <div className="fixed inset-0 z-[120]" onClick={() => setMenuWardId(null)} />
                            <div
                              className="fixed z-[121] w-44 bg-white rounded-xl border border-gray-100 py-1 overflow-hidden"
                              style={{ top: menuPos.top, right: menuPos.right, boxShadow: "0 12px 32px rgba(0,0,0,0.14)" }}
                            >
                              <button
                                onClick={() => { toggleWard(w.id); setMenuWardId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-gray-700 hover:bg-gray-50 text-left"
                                style={{ fontWeight: 600 }}
                              >
                                <Power className="w-3.5 h-3.5" style={{ color: w.enabled ? "#9ca3af" : "var(--brand-dark)" }} />
                                {w.enabled ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                              </button>
                              <button
                                onClick={() => { handleStartEdit(w); setMenuWardId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-gray-700 hover:bg-gray-50 text-left"
                                style={{ fontWeight: 600 }}
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-400" /> แก้ไขชื่อ
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button
                                onClick={() => { setMenuWardId(null); handleRemove(w); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-red-500 hover:bg-red-50 text-left"
                                style={{ fontWeight: 600 }}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> ลบ Ward
                              </button>
                            </div>
                          </>,
                          document.body
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded cage section */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="border-t border-gray-100 bg-gray-50/40 p-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11.5px] text-gray-500" style={{ fontWeight: 600 }}>
                              ห้อง / กรง ({cageCount})
                            </span>
                          </div>

                          {/* Add cage form */}
                          {cageFormWardId === w.id && (
                            <div className="flex items-end gap-2 flex-wrap bg-white p-3 rounded-xl border border-gray-100">
                              <div className="flex-1 min-w-[140px]">
                                <label className="vet-label">รหัสห้อง</label>
                                <input
                                  autoFocus
                                  value={newCageId}
                                  onChange={e => setNewCageId(e.target.value)}
                                  onKeyDown={e => { if (e.key === "Enter") handleAddCage(w.name); }}
                                  placeholder="เช่น A-07"
                                  className="vet-input"
                                />
                              </div>
                              <div className="w-[140px]">
                                <label className="vet-label">ประเภท</label>
                                <select value={newCageType} onChange={e => setNewCageType(e.target.value as CageType)} className="vet-select">
                                  {CAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <button onClick={() => { setCageFormWardId(null); setNewCageId(""); }} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                              <button onClick={() => handleAddCage(w.name)} disabled={!newCageId.trim()} className="vet-btn vet-btn-orange inline-flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> เพิ่ม
                              </button>
                            </div>
                          )}

                          {/* Cage list */}
                          {cageCount === 0 ? (
                            <p className="text-[11.5px] text-gray-400 text-center py-4">ยังไม่มีห้อง — กด "+ เพิ่มห้อง"</p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
                              {wardCages.map(c => (
                                <div key={c.id} className="group rounded-xl border border-gray-100 bg-white p-2.5 hover:shadow-sm transition-shadow">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[12px] text-gray-900" style={{ fontWeight: 700 }}>{c.id}</p>
                                      <p className="text-[10px] text-gray-500">{c.type}</p>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveCage(c)}
                                      className="w-6 h-6 rounded-md flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                      title="ลบห้อง"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] mt-1.5"
                                    style={{
                                      fontWeight: 700,
                                      background: `color-mix(in srgb, ${CAGE_STATUS_COLOR[c.status]} 10.2%, transparent)`,
                                      color: CAGE_STATUS_COLOR[c.status],
                                      border: `1px solid color-mix(in srgb, ${CAGE_STATUS_COLOR[c.status]} 33.3%, transparent)`,
                                    }}
                                  >
                                    {CAGE_STATUS_LABEL[c.status]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section: ข้อมูลฝากเลี้ยง (Boarding Rooms) ────────────────────
function BoardingRoomsSection() {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { boardingRooms, setBoardingRooms } = useClinicData();
  const [filterType, setFilterType] = useState<string>("ทั้งหมด");
  const [open, setOpen] = useState(false);

  const filtered = filterType === "ทั้งหมด"
    ? boardingRooms
    : boardingRooms.filter(r => r.type === filterType);

  const statusColor: Record<string, { bg: string; color: string; border: string }> = {
    "ว่าง":       { bg: "rgba(16,185,129,0.10)", color: "#047857", border: "rgba(16,185,129,0.30)" },
    "ไม่ว่าง":    { bg: "rgba(234,88,12,0.10)",  color: "#c2410c", border: "rgba(234,88,12,0.30)" },
    "ซ่อมบำรุง":  { bg: "rgba(107,114,128,0.12)", color: "#4b5563", border: "rgba(107,114,128,0.30)" },
  };

  const handleDelete = async (id: string) => {
    const room = boardingRooms.find(r => r.id === id);
    if (!room) return;
    if (room.status === "ไม่ว่าง") {
      showSnackbar("error", `ลบไม่ได้ — ห้อง ${id} มีสัตว์เข้าพักอยู่`);
      return;
    }
    const ok = await confirm({
      title: "ลบห้อง/กรง",
      description: `ลบ "${id}" (${room.type}) ออกจากรายการ?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    setBoardingRooms(prev => prev.filter(r => r.id !== id));
    showSnackbar("success", `ลบห้อง ${id} แล้ว`);
  };

  // Group by type for display
  const byType: Record<string, typeof boardingRooms> = {};
  filtered.forEach(r => {
    if (!byType[r.type]) byType[r.type] = [];
    byType[r.type].push(r);
  });

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#fb923c,#ea580c)",
              boxShadow: "0 4px 12px rgba(234,88,12,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <HomeIcon className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ข้อมูลฝากเลี้ยง</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>
              Boarding Rooms · {boardingRooms.length} ห้อง/กรง · ว่าง {boardingRooms.filter(r => r.status === "ว่าง").length}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)", textShadow: "var(--hero-btn-text-shadow)",
            border: "1px solid var(--hero-btn-border)",
            boxShadow: "var(--hero-btn-shadow)",
            fontWeight: 700,
            
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มห้อง/กรง
        </button>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {(["ทั้งหมด", ...BOARDING_ROOM_TYPES] as const).map(t => {
          const on = filterType === t;
          const count = t === "ทั้งหมด" ? boardingRooms.length : boardingRooms.filter(r => r.type === t).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] transition-all"
              style={{
                fontWeight: on ? 700 : 600,
                color: on ? "#ffffff" : "#475569",
                background: on ? "linear-gradient(135deg,var(--brand),var(--brand-dark))" : "rgba(0,0,0,0.04)",
                border: on ? "1px solid var(--brand-dark)" : "1px solid transparent",
                boxShadow: on ? "0 3px 10px color-mix(in srgb, var(--brand) 22%, transparent)" : "none",
              }}
            >
              {t} <span className="text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-12 gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center">
            <HomeIcon className="w-6 h-6 text-[#d1d5db]" />
          </div>
          <p className="text-sm text-[#9ca3af]">ยังไม่มีห้อง/กรงในกลุ่มนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(byType).map(([type, rooms]) => (
            <div key={type} className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[12px] text-gray-700" style={{ fontWeight: 700 }}>{type}</span>
                </div>
                <span className="text-[11px] text-gray-400" style={{ fontWeight: 600 }}>{rooms.length} ห้อง</span>
              </div>
              <div className="divide-y divide-gray-50">
                {rooms.map(r => {
                  const sc = statusColor[r.status] ?? statusColor["ว่าง"];
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                      <span className="text-[12.5px] text-gray-900 font-mono w-16" style={{ fontWeight: 700 }}>{r.id}</span>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontWeight: 600 }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
                        {r.status}
                      </span>
                      {r.petName && (
                        <span className="text-[11px] text-gray-500 truncate">{r.petName}</span>
                      )}
                      {r.pricePerNight && (
                        <span className="text-[11px] text-gray-500 ml-auto truncate" style={{ fontWeight: 600 }}>฿{r.pricePerNight}/คืน</span>
                      )}
                      <div className="flex gap-1 flex-shrink-0 ml-auto">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={r.status === "ไม่ว่าง"}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                          title={r.status === "ไม่ว่าง" ? "ห้องมีสัตว์อยู่ — ลบไม่ได้" : "ลบห้อง"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <NewRoomModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={(room) => {
          setBoardingRooms(prev => [...prev, room]);
          showSnackbar("success", `เพิ่มห้อง ${room.id} เรียบร้อยแล้ว`);
          setOpen(false);
        }}
        existingRoomIds={boardingRooms.map(r => r.id)}
      />
    </div>
  );
}

// ─── Section: รายการ Medical Imaging & Lab (แคตตาล็อกแบบ HOSxP) ─────────────
/** ประเภทผลตรวจของรายการ Lab
    numeric = กรอกตัวเลข เทียบค่าปกติ/วิกฤตได้ · text = พิมพ์บรรยาย
    choice  = เลือกจากตัวเลือกที่ตั้งไว้ (เช่น Negative/Positive)

    มีแต่ numeric เท่านั้นที่แยกค่าตามชนิดสัตว์ได้ — อีกสองแบบไม่มีค่าอ้างอิง
    เป็นตัวเลข จึงใช้ชุดเดียวกันทุกชนิดสัตว์ */
type LabResultType = "numeric" | "text" | "choice";

/** ค่าปกติ + ค่าวิกฤตของรายการ Lab แยกตามชนิดสัตว์
    สัตว์แต่ละชนิดมีช่วงค่าปกติต่างกันมาก (เช่น RBC สุนัข 5.5-8.5 / แมว 5-10)
    ถ้าใช้ช่วงเดียวกันหมดจะแปลผลผิดข้ามชนิด

    speciesId = null → แถว "ทั่วไป" ใช้กับชนิดสัตว์ที่ไม่ได้ตั้งค่าเฉพาะไว้
    ค่า null ในช่องไหน = ไม่กำหนด (ไม่เอามาใช้ตัดสิน) */
interface LabRefRange {
  speciesId: number | null;
  min: number | null;
  max: number | null;
  criticalLow: number | null;
  criticalHigh: number | null;
}

/** ตัวเลือกผลแบบ choice — flag บอกว่าเลือกอันนี้แล้วถือว่าผลผิดปกติแค่ไหน */
interface LabChoice {
  label: string;
  flag: "normal" | "abnormal" | "critical";
}
const LAB_CHOICE_FLAGS: Array<{ v: LabChoice["flag"]; label: string; color: string }> = [
  { v: "normal",   label: "ปกติ",     color: "#10b981" },
  { v: "abnormal", label: "ผิดปกติ",  color: "#f59e0b" },
  { v: "critical", label: "วิกฤต",    color: "#ef4444" },
];

interface DxItem {
  id: number;
  name: string;         // ชื่อรายการ เช่น Chest PA
  chargeName: string;   // ชื่อค่าใช้จ่าย (dropdown)
  group: string;        // กลุ่มรายการ (dropdown — ใช้กับ Medical Imaging)
  unit?: string;        // หน่วย (ใช้กับ Lab เช่น test/หลอด)
  priceOpd: number;     // ราคา OPD
  priceIpd: number;     // ราคา IPD
  active: boolean;      // เปิดใช้งาน
  /* ── เฉพาะ Lab ── */
  resultType?: LabResultType;   // ไม่ระบุ = numeric (ค่าเดิมก่อนมีฟีเจอร์นี้)
  refRanges?: LabRefRange[];    // ใช้เมื่อ resultType = numeric
  hint?: string;                // ใช้เมื่อ resultType = text — ข้อความช่วยตอนกรอกผล
  choices?: LabChoice[];        // ใช้เมื่อ resultType = choice
}
type DxKind = "xray" | "lab";
const DX_GROUPS: Record<DxKind, string[]> = {
  xray: ["Medical Imaging", "Ultrasound", "CT", "MRI", "Mammogram"],   // xray_item_group
  lab: ["Hematology", "Chemistry", "Electrolyte", "Urinalysis", "Cytology", "Microbiology", "Parasitology", "อื่นๆ"],
};
/* Non-Drug Items — แคตตาล็อกค่าใช้จ่ายที่ไม่ใช่ยา (แหล่ง dropdown ชื่อค่าใช้จ่ายของ Lab) */
const NONDRUG_ITEMS = [
  "ค่าตรวจทางห้องปฏิบัติการ (Lab)", "ค่าตรวจเลือด", "ค่าตรวจปัสสาวะ", "ค่าตรวจอุจจาระ",
  "ค่าเพาะเชื้อ", "ค่าตรวจเซลล์/ชิ้นเนื้อ", "ค่าบริการทางการแพทย์", "ค่าเวชภัณฑ์ที่ไม่ใช่ยา", "ค่าตรวจพิเศษอื่นๆ",
];
const DX_CHARGES: Record<DxKind, string[]> = {
  xray: ["ค่า Medical Imaging", "ค่า Ultrasound", "ค่า CT Scan", "ค่า MRI", "ค่าMedical Imagingพิเศษ"],
  lab: NONDRUG_ITEMS,
};
/* หน่วยของ Lab items */
const LAB_UNITS = ["test", "ครั้ง", "ตัวอย่าง", "หลอด", "แผ่น (slide)", "ชุด"];
const DX_SEED: Record<DxKind, DxItem[]> = {
  /* ใช้ชุดเดียวกับฟอร์มสั่ง imaging — แก้ที่ config/imaging.ts ที่เดียว */
  xray: IMAGING_CATALOG_SEED,
  lab: [
    { id: 1, name: "CBC",             chargeName: "ค่าตรวจเลือด",        group: "Hematology",   unit: "test",  priceOpd: 400,  priceIpd: 400,  active: true },
    { id: 2, name: "Blood Chemistry", chargeName: "ค่าตรวจเลือด",        group: "Chemistry",    unit: "test",  priceOpd: 800,  priceIpd: 800,  active: true },
    { id: 3, name: "Electrolyte",     chargeName: "ค่าตรวจเลือด",        group: "Electrolyte",  unit: "test",  priceOpd: 600,  priceIpd: 600,  active: true },
    { id: 4, name: "Urinalysis",      chargeName: "ค่าตรวจปัสสาวะ",      group: "Urinalysis",   unit: "ตัวอย่าง", priceOpd: 300,  priceIpd: 300,  active: true },
    { id: 5, name: "Culture",         chargeName: "ค่าเพาะเชื้อ",         group: "Microbiology", unit: "ตัวอย่าง", priceOpd: 1200, priceIpd: 1200, active: true },
    { id: 6, name: "Cytology",        chargeName: "ค่าตรวจเซลล์/ชิ้นเนื้อ", group: "Cytology",     unit: "แผ่น (slide)", priceOpd: 700, priceIpd: 700, active: false },
  ],
};
/** แถวค่าอ้างอิงเปล่า — ใช้เป็นแถว "ทั่วไป" ตั้งต้นของรายการที่ยังไม่ได้ตั้งค่า */
const BLANK_REF_RANGE: LabRefRange = { speciesId: null, min: null, max: null, criticalLow: null, criticalHigh: null };

const DX_STORE_KEY = "ehp_dx_items_v1";
const loadDxItems = (): Record<DxKind, DxItem[]> => {
  try {
    const r = localStorage.getItem(DX_STORE_KEY);
    if (r) {
      const p = JSON.parse(r);
      return {
        xray: p.xray ?? DX_SEED.xray,
        /* lab เก่าที่บันทึกก่อนมีช่อง "หน่วย" และก่อนมีประเภทผล — เติม default ให้
           ของเดิมทั้งหมดถือเป็นแบบตัวเลข พร้อมแถวค่าอ้างอิง "ทั่วไป" ว่าง ๆ 1 แถว */
        lab: (p.lab ?? DX_SEED.lab).map((it: DxItem) => ({
          unit: "test", resultType: "numeric" as LabResultType,
          refRanges: [BLANK_REF_RANGE], ...it,
        })),
      };
    }
  } catch { /* ignore */ }
  return DX_SEED;
};

/* ── Lab Profile — ชุดรายการ Lab หลายตัวสั่งพร้อมกัน ── */
interface LabProfile {
  id: number;
  name: string;         // ชื่อ Lab profile
  active: boolean;      // สถานะเปิดใช้งาน
  itemIds: number[];    // รายการ Lab items ในโปรไฟล์ (อ้าง id ของ DxItem kind "lab")
}
const LAB_PROFILE_SEED: LabProfile[] = [
  { id: 1, name: "Health Check Basic",  active: true,  itemIds: [1, 4] },
  { id: 2, name: "Pre-Operative Panel", active: true,  itemIds: [1, 2, 3] },
  { id: 3, name: "Full Blood Workup",   active: false, itemIds: [1, 2, 3, 5] },
];
const LAB_PROFILE_KEY = "ehp_lab_profiles_v1";
const loadLabProfiles = (): LabProfile[] => {
  try {
    const r = localStorage.getItem(LAB_PROFILE_KEY);
    if (r) return JSON.parse(r);
  } catch { /* ignore */ }
  return LAB_PROFILE_SEED;
};

function XrayLabSection({ kind, species = [] }: { kind: DxKind; species?: PetSpecies[] }) {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [items, setItems] = useState<Record<DxKind, DxItem[]>>(() => loadDxItems());
  const [editing, setEditing] = useState<DxItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { try { localStorage.setItem(DX_STORE_KEY, JSON.stringify(items)); } catch { /* quota */ } }, [items]);

  const list = items[kind].filter(it => !q.trim()
    || it.name.toLowerCase().includes(q.trim().toLowerCase())
    || it.group.toLowerCase().includes(q.trim().toLowerCase())
    || (it.unit ?? "").toLowerCase().includes(q.trim().toLowerCase())
    || it.chargeName.toLowerCase().includes(q.trim().toLowerCase()));
  const setKindItems = (fn: (prev: DxItem[]) => DxItem[]) => setItems(prev => ({ ...prev, [kind]: fn(prev[kind]) }));
  const toggleActive = (id: number) => setKindItems(prev => prev.map(it => it.id === id ? { ...it, active: !it.active } : it));
  const removeItem = async (it: DxItem) => {
    const ok = await confirm({ title: "ลบรายการ", description: `ลบ "${it.name}" ออกจากรายการ${kind === "xray" ? " Medical Imaging" : " Lab"}?`, confirmLabel: "ลบ", kind: "danger" });
    if (!ok) return;
    setKindItems(prev => prev.filter(x => x.id !== it.id));
    showSnackbar("delete", "ลบรายการแล้ว");
  };
  const saveItem = (d: DxItem, isNew: boolean) => {
    if (isNew) setKindItems(prev => [...prev, { ...d, id: prev.length ? Math.max(...prev.map(x => x.id)) + 1 : 1 }]);
    else setKindItems(prev => prev.map(x => x.id === d.id ? d : x));
    showSnackbar(isNew ? "success" : "update", isNew ? "เพิ่มรายการแล้ว" : "บันทึกการแก้ไขแล้ว");
    setAdding(false); setEditing(null);
  };

  return (
    <div className="space-y-4">
      {/* Header + search + add */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-white" style={{ background: kind === "xray" ? "linear-gradient(135deg,#38bdf8,#0284c7)" : "linear-gradient(135deg,#c084fc,#7e22ce)", fontWeight: 700, fontSize: "calc(12.5px * var(--fs))" }}>
          {kind === "xray" ? <ScanLine className="w-3.5 h-3.5" /> : <FlaskConical className="w-3.5 h-3.5" />}
          {kind === "xray" ? "รายการ Medical Imaging" : "รายการ Lab"}
          <span className="text-[10px] px-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>{items[kind].length}</span>
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาชื่อรายการ / กลุ่ม..." className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-(--brand)" />
        </div>
        <button onClick={() => setAdding(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1 ml-auto">
          <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px] min-w-[680px]">
            <thead>
              <tr className="bg-gray-50/60 text-gray-500 text-[10.5px]" style={{ fontWeight: 600 }}>
                <th className="text-left px-4 py-2.5">ชื่อรายการ</th>
                {kind === "xray" ? (
                  <>
                    <th className="text-left px-2 py-2.5">กลุ่มรายการ</th>
                    <th className="text-left px-2 py-2.5">ชื่อค่าใช้จ่าย</th>
                    <th className="text-right px-2 py-2.5">ราคา OPD</th>
                    <th className="text-right px-2 py-2.5">ราคา IPD</th>
                  </>
                ) : (
                  <>
                    <th className="text-left px-2 py-2.5">หน่วย</th>
                    <th className="text-left px-2 py-2.5">ชื่อค่าใช้จ่าย (Non-Drug Items)</th>
                  </>
                )}
                <th className="text-center px-2 py-2.5">เปิดใช้งาน</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-[12px]">ไม่พบรายการ</td></tr>
              )}
              {list.map(it => (
                <tr key={it.id} className="group hover:bg-gray-50/50 transition-colors" style={{ opacity: it.active ? 1 : 0.55 }}>
                  <td className="px-4 py-2.5 text-gray-900" style={{ fontWeight: 600 }}>{it.name}</td>
                  {kind === "xray" ? (
                    <>
                      <td className="px-2 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 700, background: "rgba(245,158,11,0.10)", color: "#b45309" }}>{it.group}</span>
                      </td>
                      <td className="px-2 py-2.5 text-gray-600">{it.chargeName}</td>
                      <td className="px-2 py-2.5 text-right text-gray-800" style={{ fontWeight: 600 }}>฿{it.priceOpd.toLocaleString()}</td>
                      <td className="px-2 py-2.5 text-right text-gray-800" style={{ fontWeight: 600 }}>฿{it.priceIpd.toLocaleString()}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 700, background: "rgba(168,85,247,0.10)", color: "#7e22ce" }}>{it.unit || "test"}</span>
                      </td>
                      <td className="px-2 py-2.5 text-gray-600">{it.chargeName}</td>
                    </>
                  )}
                  <td className="px-2 py-2.5 text-center">
                    <button onClick={() => toggleActive(it.id)} className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" style={{ background: it.active ? "var(--brand)" : "#d1d5db" }} title={it.active ? "เปิดใช้งาน — กดเพื่อปิด" : "ปิดใช้งาน — กดเพื่อเปิด"}>
                      <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: it.active ? "translateX(18px)" : "translateX(3px)", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(it)} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-(--brand-dark) hover:bg-(--brand)/10 transition-colors" title="แก้ไข"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeItem(it)} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="ลบ"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 text-[11px] text-gray-400">
          {items[kind].filter(i => i.active).length} เปิดใช้งาน / {items[kind].length} รายการ · {kind === "xray" ? "ใช้เป็นราคาอ้างอิงตอนสั่ง Medical Imaging (OPD/IPD)" : "ชื่อค่าใช้จ่ายอ้างอิงจาก Non-Drug Items · จัดชุดได้ที่เมนู Lab Profile"}
        </div>
      </div>

      {(adding || editing) && (
        <DxItemModal
          species={species}
          kind={kind}
          item={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSave={saveItem}
        />
      )}
    </div>
  );
}

/* Modal เพิ่ม/แก้ไขรายการ Medical Imaging / Lab — ฟิลด์ตามแบบ HOSxP */
/** ช่องตัวเลขในตารางค่าอ้างอิง Lab — แคบพอให้ 5 คอลัมน์อยู่ในโมดัลได้
    ต้องประกาศนอก DxItemModal: ถ้าไว้ข้างใน component จะถูกสร้างใหม่ทุก render
    React จะมองเป็นคนละชนิดแล้ว remount input ทิ้ง — พิมพ์ทีเดียวโฟกัสหลุด */
function RangeCell({ value, onChange, placeholder }: { value: number | null; onChange: (v: number | null) => void; placeholder: string }) {
  return (
    <input
      type="number" inputMode="decimal"
      value={value ?? ""} placeholder={placeholder}
      onChange={e => onChange(e.target.value.trim() === "" ? null : Number(e.target.value))}
      className="w-full min-w-0 px-1.5 py-1 text-[12px] text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-(--brand)"
    />
  );
}

function DxItemModal({ kind, item, species, onClose, onSave }: { kind: DxKind; item: DxItem | null; species: PetSpecies[]; onClose: () => void; onSave: (d: DxItem, isNew: boolean) => void }) {
  const isNew = !item;
  const [name, setName] = useState(item?.name ?? "");
  const [chargeName, setChargeName] = useState(item?.chargeName ?? DX_CHARGES[kind][0]);
  const [group, setGroup] = useState(item?.group ?? DX_GROUPS[kind][0]);
  const [unit, setUnit] = useState(item?.unit ?? LAB_UNITS[0]);
  const [priceOpd, setPriceOpd] = useState(item?.priceOpd ?? 0);
  const [priceIpd, setPriceIpd] = useState(item?.priceIpd ?? 0);
  const [active, setActive] = useState(item?.active ?? true);
  /* ── ประเภทผลตรวจ (Lab เท่านั้น) ──
     เก็บ state ของทั้ง 3 แบบไว้พร้อมกัน สลับประเภทไปมาแล้วค่าที่กรอกไว้ไม่หาย
     ตอนบันทึกค่อยส่งเฉพาะก้อนที่ตรงกับประเภทที่เลือกอยู่ */
  const [resultType, setResultType] = useState<LabResultType>(item?.resultType ?? "numeric");
  const [hint, setHint] = useState(item?.hint ?? "");
  const [ranges, setRanges] = useState<LabRefRange[]>(
    item?.refRanges?.length ? item.refRanges : [BLANK_REF_RANGE],
  );
  const [choices, setChoices] = useState<LabChoice[]>(
    item?.choices?.length ? item.choices : [{ label: "Negative", flag: "normal" }, { label: "Positive", flag: "critical" }],
  );

  /* แถว "ทั่วไป" (speciesId = null) ต้องมีเสมอและอยู่ล่างสุด — เป็นค่าที่ใช้
     กับชนิดสัตว์ที่ไม่ได้ตั้งค่าเฉพาะไว้ ถ้าลบได้จะเหลือสัตว์บางชนิดไม่มีค่าอ้างอิง */
  const perSpecies = ranges.filter(r => r.speciesId !== null);
  const fallback = ranges.find(r => r.speciesId === null) ?? BLANK_REF_RANGE;
  const usedIds = new Set(perSpecies.map(r => r.speciesId));
  const freeSpecies = species.filter(sp => sp.active && !usedIds.has(sp.id));

  const patchRange = (speciesId: number | null, patch: Partial<LabRefRange>) =>
    setRanges(prev => {
      const has = prev.some(r => r.speciesId === speciesId);
      return has
        ? prev.map(r => (r.speciesId === speciesId ? { ...r, ...patch } : r))
        : [...prev, { ...BLANK_REF_RANGE, speciesId, ...patch }];
    });
  const addSpeciesRow = () => {
    const sp = freeSpecies[0];
    if (!sp) return;
    setRanges(prev => [...prev, { ...BLANK_REF_RANGE, speciesId: sp.id }]);
  };
  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className={`w-full ${kind === "lab" ? "max-w-[580px]" : "max-w-[460px]"} vet-modal relative`} onClick={e => e.stopPropagation()}>
          <div className="vet-modal-header rounded-t-3xl">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="vet-modal-header-icon">{kind === "xray" ? <ScanLine className="w-[20px] h-[20px] text-white" /> : <FlaskConical className="w-[20px] h-[20px] text-white" />}</div>
                <div>
                  <h2 className="vet-section-title">{isNew ? "เพิ่ม" : "แก้ไข"}รายการ {kind === "xray" ? "Medical Imaging" : "Lab"}</h2>
                  <p className="vet-tiny mt-[2px]">{kind === "xray" ? "ชื่อรายการ · ค่าใช้จ่าย · กลุ่ม · ราคา OPD/IPD" : "ชื่อรายการ · หน่วย · ค่าใช้จ่าย · ประเภทผลตรวจ"}</p>
                </div>
              </div>
              <button onClick={onClose} className="vet-modal-close"><X className="w-[16px] h-[16px] text-gray-500" /></button>
            </div>
          </div>

          <div className="p-5 space-y-3.5">
            <div>
              <label className="vet-label">ชื่อรายการ *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="vet-input" placeholder={kind === "xray" ? "เช่น Chest PA" : "เช่น CBC"} autoFocus />
            </div>
            {kind === "xray" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">ชื่อค่าใช้จ่าย</label>
                    <select value={chargeName} onChange={e => setChargeName(e.target.value)} className="vet-select">
                      {DX_CHARGES.xray.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="vet-label">กลุ่มรายการ Medical Imaging</label>
                    <select value={group} onChange={e => setGroup(e.target.value)} className="vet-select">
                      {DX_GROUPS.xray.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="vet-label">ราคา OPD (฿)</label>
                    <input type="number" min={0} value={priceOpd} onChange={e => setPriceOpd(Math.max(0, parseFloat(e.target.value) || 0))} className="vet-input" />
                  </div>
                  <div>
                    <label className="vet-label">ราคา IPD (฿)</label>
                    <input type="number" min={0} value={priceIpd} onChange={e => setPriceIpd(Math.max(0, parseFloat(e.target.value) || 0))} className="vet-input" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="vet-label">หน่วย</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="vet-select">
                    {(LAB_UNITS.includes(unit) ? LAB_UNITS : [unit, ...LAB_UNITS]).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="vet-label">ชื่อค่าใช้จ่าย (Non-Drug Items)</label>
                  <select value={chargeName} onChange={e => setChargeName(e.target.value)} className="vet-select">
                    {(NONDRUG_ITEMS.includes(chargeName) ? NONDRUG_ITEMS : [chargeName, ...NONDRUG_ITEMS]).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* ── ประเภทของผล ── */}
                <div>
                  <label className="vet-label">ประเภทของผล</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { v: "numeric", label: "ตัวเลข",         icon: <Calculator className="w-3.5 h-3.5" /> },
                      { v: "text",    label: "ตัวอักษร",       icon: <TypeIcon className="w-3.5 h-3.5" /> },
                      { v: "choice",  label: "เลือกจากรายการ", icon: <ListChecks className="w-3.5 h-3.5" /> },
                    ] as const).map(o => {
                      const on = resultType === o.v;
                      return (
                        <button key={o.v} type="button" onClick={() => setResultType(o.v)}
                          className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border text-[12px] transition-colors"
                          style={{
                            borderColor: on ? "color-mix(in srgb, var(--brand) 45%, transparent)" : "#e5e7eb",
                            background: on ? "color-mix(in srgb, var(--brand) 8%, transparent)" : "#ffffff",
                            color: on ? "var(--brand-dark)" : "#6b7280",
                            fontWeight: on ? 700 : 500,
                          }}>
                          {o.icon} {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── ตัวเลข: ค่าปกติ / ค่าวิกฤต แยกตามชนิดสัตว์ ──
                       สัตว์แต่ละชนิดช่วงค่าปกติต่างกันมาก ถ้าใช้ช่วงเดียวกันหมด
                       จะแปลผลผิดข้ามชนิด จึงต้องตั้งแยกได้ */}
                {resultType === "numeric" && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="vet-label" style={{ marginBottom: 0 }}>ค่าปกติ / ค่าวิกฤต แยกตามชนิดสัตว์</label>
                      <button type="button" onClick={addSpeciesRow} disabled={!freeSpecies.length}
                        className="vet-btn vet-btn-secondary vet-btn-sm inline-flex items-center gap-1 disabled:opacity-40">
                        <Plus className="w-3 h-3" /> เพิ่มชนิดสัตว์
                      </button>
                    </div>
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full" style={{ tableLayout: "fixed" }}>
                        <thead>
                          <tr className="bg-gray-50 text-[10.5px] text-gray-500" style={{ fontWeight: 600 }}>
                            <th className="text-left px-2 py-1.5" style={{ width: "30%" }}>ชนิดสัตว์</th>
                            <th className="px-1 py-1.5" style={{ width: "26%" }}>ค่าปกติ (min - max)</th>
                            <th className="px-1 py-1.5" style={{ width: "18%" }}>วิกฤตต่ำกว่า</th>
                            <th className="px-1 py-1.5" style={{ width: "18%" }}>วิกฤตสูงกว่า</th>
                            <th style={{ width: "8%" }} />
                          </tr>
                        </thead>
                        <tbody>
                          {perSpecies.map(r => {
                            const sp = species.find(x => x.id === r.speciesId);
                            return (
                              <tr key={r.speciesId} className="border-t border-gray-100">
                                <td className="px-2 py-1.5">
                                  <select
                                    value={String(r.speciesId)}
                                    onChange={e => patchRange(r.speciesId, { speciesId: Number(e.target.value) })}
                                    className="vet-select-sm w-full px-1.5 py-1 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-(--brand)">
                                    {species.filter(x => x.active && (x.id === r.speciesId || !usedIds.has(x.id)))
                                      .map(x => <option key={x.id} value={x.id}>{x.icon} {x.name}</option>)}
                                  </select>
                                </td>
                                <td className="px-1 py-1.5">
                                  <div className="flex items-center gap-1">
                                    <RangeCell value={r.min} placeholder="min" onChange={v => patchRange(r.speciesId, { min: v })} />
                                    <span className="text-[11px] text-gray-400">-</span>
                                    <RangeCell value={r.max} placeholder="max" onChange={v => patchRange(r.speciesId, { max: v })} />
                                  </div>
                                </td>
                                <td className="px-1 py-1.5">
                                  <RangeCell value={r.criticalLow} placeholder="-" onChange={v => patchRange(r.speciesId, { criticalLow: v })} />
                                </td>
                                <td className="px-1 py-1.5">
                                  <RangeCell value={r.criticalHigh} placeholder="-" onChange={v => patchRange(r.speciesId, { criticalHigh: v })} />
                                </td>
                                <td className="px-1 py-1.5 text-center">
                                  <button type="button" title={`ลบ ${sp?.name ?? ""}`}
                                    onClick={() => setRanges(prev => prev.filter(x => x.speciesId !== r.speciesId))}
                                    className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {/* แถวทั่วไป — ใช้กับชนิดสัตว์ที่ไม่ได้ตั้งค่าเฉพาะ ลบไม่ได้ */}
                          <tr className="border-t border-gray-100 bg-gray-50/60">
                            <td className="px-2 py-1.5">
                              <span className="inline-flex items-center gap-1 text-[11.5px] text-gray-500" style={{ fontWeight: 600 }}>
                                <PawPrint className="w-3 h-3" /> ทั่วไป (default)
                              </span>
                            </td>
                            <td className="px-1 py-1.5">
                              <div className="flex items-center gap-1">
                                <RangeCell value={fallback.min} placeholder="min" onChange={v => patchRange(null, { min: v })} />
                                <span className="text-[11px] text-gray-400">-</span>
                                <RangeCell value={fallback.max} placeholder="max" onChange={v => patchRange(null, { max: v })} />
                              </div>
                            </td>
                            <td className="px-1 py-1.5">
                              <RangeCell value={fallback.criticalLow} placeholder="-" onChange={v => patchRange(null, { criticalLow: v })} />
                            </td>
                            <td className="px-1 py-1.5">
                              <RangeCell value={fallback.criticalHigh} placeholder="-" onChange={v => patchRange(null, { criticalHigh: v })} />
                            </td>
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="vet-tiny mt-1">ชนิดสัตว์ที่ไม่ได้ตั้งค่าเฉพาะจะใช้แถว “ทั่วไป” · เว้นว่าง = ไม่นำมาตัดสิน</p>
                  </div>
                )}

                {/* ── ตัวอักษร: พิมพ์บรรยายอิสระ ไม่มีค่าอ้างอิงเป็นตัวเลข ── */}
                {resultType === "text" && (
                  <div>
                    <label className="vet-label">ข้อความช่วยเหลือ (แสดงตอนกรอกผล)</label>
                    <input value={hint} onChange={e => setHint(e.target.value)} className="vet-input"
                      placeholder="เช่น ระบุลักษณะที่พบเห็น" />
                    <p className="vet-tiny mt-1">ใช้ร่วมกันทุกชนิดสัตว์ · ไม่มีค่าอ้างอิงปกติ/วิกฤต</p>
                  </div>
                )}

                {/* ── เลือกจากรายการ: ตั้งตัวเลือกเอง พร้อมบอกว่าอันไหนถือว่าผิดปกติ ── */}
                {resultType === "choice" && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="vet-label" style={{ marginBottom: 0 }}>ตัวเลือกผลลัพธ์</label>
                      <button type="button" onClick={() => setChoices(prev => [...prev, { label: "", flag: "normal" }])}
                        className="vet-btn vet-btn-secondary vet-btn-sm inline-flex items-center gap-1">
                        <Plus className="w-3 h-3" /> เพิ่มตัวเลือก
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {choices.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input value={c.label}
                            onChange={e => setChoices(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                            className="flex-1 min-w-0 px-2.5 py-1.5 text-[12.5px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-(--brand)"
                            placeholder="เช่น Negative" />
                          <select value={c.flag}
                            onChange={e => setChoices(prev => prev.map((x, j) => j === i ? { ...x, flag: e.target.value as LabChoice["flag"] } : x))}
                            className="vet-select-sm px-2 py-1.5 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-(--brand)"
                            style={{ width: 104, color: LAB_CHOICE_FLAGS.find(f => f.v === c.flag)?.color }}>
                            {LAB_CHOICE_FLAGS.map(f => <option key={f.v} value={f.v}>{f.label}</option>)}
                          </select>
                          <button type="button" onClick={() => setChoices(prev => prev.filter((_, j) => j !== i))}
                            disabled={choices.length <= 1}
                            className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="vet-tiny mt-1">ใช้ร่วมกันทุกชนิดสัตว์ · ป้ายกำกับใช้ไฮไลต์ผลตอนอ่านรายงาน</p>
                  </div>
                )}
              </>
            )}
            {/* เปิดใช้งาน */}
            <button onClick={() => setActive(a => !a)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors"
              style={{ borderColor: active ? "color-mix(in srgb, var(--brand) 35%, transparent)" : "#e5e7eb", background: active ? "color-mix(in srgb, var(--brand) 5%, transparent)" : "#fafafa" }}>
              <span className="text-[12.5px]" style={{ fontWeight: 600, color: active ? "var(--brand-dark)" : "#6b7280" }}>เปิดใช้งาน</span>
              <span className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" style={{ background: active ? "var(--brand)" : "#d1d5db" }}>
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: active ? "translateX(18px)" : "translateX(3px)", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
              </span>
            </button>
          </div>

          <div className="vet-modal-footer">
            <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
            <button
              onClick={() => {
                if (!name.trim()) return;
                /* ส่งเฉพาะก้อนที่ตรงกับประเภทที่เลือกอยู่ — ไม่งั้นข้อมูลของแบบที่
                   ไม่ได้ใช้จะติดไปกับรายการ แล้วอ่านยากว่าตกลงใช้อะไรกันแน่ */
                const labFields = kind === "lab" ? {
                  unit,
                  resultType,
                  refRanges: resultType === "numeric" ? ranges : undefined,
                  hint: resultType === "text" ? hint.trim() || undefined : undefined,
                  choices: resultType === "choice"
                    ? choices.map(c => ({ ...c, label: c.label.trim() })).filter(c => c.label)
                    : undefined,
                } : { unit: undefined };
                onSave({ id: item?.id ?? 0, name: name.trim(), chargeName, group, priceOpd, priceIpd, active, ...labFields }, isNew);
              }}
              disabled={!name.trim()}
              className="vet-btn vet-btn-primary btn-green disabled:opacity-40">
              <Check className="w-[16px] h-[16px]" /> บันทึก
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

// ─── Section: Lab Profile (ชุดรายการ Lab) ─────────────────────────
function LabProfileSection() {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [profiles, setProfiles] = useState<LabProfile[]>(() => loadLabProfiles());
  const [labItems] = useState<DxItem[]>(() => loadDxItems().lab);   // ใช้เลือกรายการเข้าโปรไฟล์
  const [editing, setEditing] = useState<LabProfile | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { try { localStorage.setItem(LAB_PROFILE_KEY, JSON.stringify(profiles)); } catch { /* quota */ } }, [profiles]);

  const itemName = (id: number) => labItems.find(it => it.id === id)?.name ?? `#${id}`;
  const list = profiles.filter(p => !q.trim()
    || p.name.toLowerCase().includes(q.trim().toLowerCase())
    || p.itemIds.some(id => itemName(id).toLowerCase().includes(q.trim().toLowerCase())));
  const toggleActive = (id: number) => setProfiles(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const removeProfile = async (p: LabProfile) => {
    const ok = await confirm({ title: "ลบ Lab Profile", description: `ลบโปรไฟล์ "${p.name}"? (รายการ Lab ในระบบไม่ถูกลบ)`, confirmLabel: "ลบ", kind: "danger" });
    if (!ok) return;
    setProfiles(prev => prev.filter(x => x.id !== p.id));
    showSnackbar("delete", "ลบ Lab Profile แล้ว");
  };
  const saveProfile = (p: LabProfile, isNew: boolean) => {
    if (isNew) setProfiles(prev => [...prev, { ...p, id: prev.length ? Math.max(...prev.map(x => x.id)) + 1 : 1 }]);
    else setProfiles(prev => prev.map(x => x.id === p.id ? p : x));
    showSnackbar(isNew ? "success" : "update", isNew ? "เพิ่ม Lab Profile แล้ว" : "บันทึกการแก้ไขแล้ว");
    setAdding(false); setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-white" style={{ background: "linear-gradient(135deg,#a78bfa,#6d28d9)", fontWeight: 700, fontSize: "calc(12.5px * var(--fs))" }}>
          <Layers className="w-3.5 h-3.5" />
          Lab Profile
          <span className="text-[10px] px-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>{profiles.length}</span>
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาชื่อโปรไฟล์ / รายการ Lab..." className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-(--brand)" />
        </div>
        <button onClick={() => setAdding(true)} className="vet-btn vet-btn-orange inline-flex items-center gap-1 ml-auto">
          <Plus className="w-3.5 h-3.5" /> เพิ่ม Lab Profile
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px] min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/60 text-gray-500 text-[10.5px]" style={{ fontWeight: 600 }}>
                <th className="text-left px-4 py-2.5">ชื่อ Lab Profile</th>
                <th className="text-left px-2 py-2.5">รายการ Lab ในชุด</th>
                <th className="text-center px-2 py-2.5">เปิดใช้งาน</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-[12px]">ไม่พบโปรไฟล์</td></tr>
              )}
              {list.map(p => (
                <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors" style={{ opacity: p.active ? 1 : 0.55 }}>
                  <td className="px-4 py-2.5 text-gray-900 whitespace-nowrap" style={{ fontWeight: 600 }}>
                    {p.name}
                    <span className="ml-1.5 text-[10px] text-gray-400" style={{ fontWeight: 500 }}>({p.itemIds.length} รายการ)</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {p.itemIds.map(id => (
                        <span key={id} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]" style={{ fontWeight: 600, background: "rgba(168,85,247,0.10)", color: "#7e22ce" }}>{itemName(id)}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <button onClick={() => toggleActive(p.id)} className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" style={{ background: p.active ? "var(--brand)" : "#d1d5db" }} title={p.active ? "เปิดใช้งาน — กดเพื่อปิด" : "ปิดใช้งาน — กดเพื่อเปิด"}>
                      <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: p.active ? "translateX(18px)" : "translateX(3px)", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(p)} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-(--brand-dark) hover:bg-(--brand)/10 transition-colors" title="แก้ไข"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeProfile(p)} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="ลบ"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 text-[11px] text-gray-400">
          {profiles.filter(p => p.active).length} เปิดใช้งาน / {profiles.length} โปรไฟล์ · เลือกโปรไฟล์ = สั่ง Lab ทุกตัวในชุดพร้อมกัน
        </div>
      </div>

      {(adding || editing) && (
        <LabProfileModal
          profile={editing}
          labItems={labItems}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSave={saveProfile}
        />
      )}
    </div>
  );
}

/* Modal เพิ่ม/แก้ไข Lab Profile — ชื่อ + สถานะ + เลือกรายการ Lab ได้หลายตัว */
function LabProfileModal({ profile, labItems, onClose, onSave }: {
  profile: LabProfile | null;
  labItems: DxItem[];
  onClose: () => void;
  onSave: (p: LabProfile, isNew: boolean) => void;
}) {
  const isNew = !profile;
  const [name, setName] = useState(profile?.name ?? "");
  const [active, setActive] = useState(profile?.active ?? true);
  const [ids, setIds] = useState<number[]>(profile?.itemIds ?? []);
  const [q, setQ] = useState("");

  const toggleId = (id: number) => setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const shown = labItems.filter(it => !q.trim() || it.name.toLowerCase().includes(q.trim().toLowerCase()));
  const canSave = !!name.trim() && ids.length > 0;

  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-[480px] vet-modal relative flex flex-col" style={{ maxHeight: "min(640px, calc(100vh - 2rem))" }} onClick={e => e.stopPropagation()}>
          <div className="vet-modal-header rounded-t-3xl flex-shrink-0">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="vet-modal-header-icon"><Layers className="w-[20px] h-[20px] text-white" /></div>
                <div>
                  <h2 className="vet-section-title">{isNew ? "เพิ่ม" : "แก้ไข"} Lab Profile</h2>
                  <p className="vet-tiny mt-[2px]">ชื่อโปรไฟล์ · สถานะ · เลือกรายการ Lab ได้หลายตัว</p>
                </div>
              </div>
              <button onClick={onClose} className="vet-modal-close"><X className="w-[16px] h-[16px] text-gray-500" /></button>
            </div>
          </div>

          <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
            <div>
              <label className="vet-label">ชื่อ Lab Profile *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="vet-input" placeholder="เช่น Health Check Basic" autoFocus />
            </div>

            {/* เปิดใช้งาน */}
            <button onClick={() => setActive(a => !a)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors"
              style={{ borderColor: active ? "color-mix(in srgb, var(--brand) 35%, transparent)" : "#e5e7eb", background: active ? "color-mix(in srgb, var(--brand) 5%, transparent)" : "#fafafa" }}>
              <span className="text-[12.5px]" style={{ fontWeight: 600, color: active ? "var(--brand-dark)" : "#6b7280" }}>เปิดใช้งาน</span>
              <span className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" style={{ background: active ? "var(--brand)" : "#d1d5db" }}>
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: active ? "translateX(18px)" : "translateX(3px)", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
              </span>
            </button>

            {/* เลือกรายการ Lab */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="vet-label" style={{ marginBottom: 0 }}>รายการ Lab ในชุด *</label>
                <span className="text-[11px]" style={{ fontWeight: 700, color: ids.length ? "var(--brand-dark)" : "#9ca3af" }}>เลือกแล้ว {ids.length} รายการ</span>
              </div>
              {/* chips ที่เลือกแล้ว */}
              {ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {ids.map(id => {
                    const it = labItems.find(x => x.id === id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px]" style={{ fontWeight: 600, background: "rgba(168,85,247,0.10)", color: "#7e22ce" }}>
                        {it?.name ?? `#${id}`}
                        <button onClick={() => toggleId(id)} className="hover:text-rose-500" title="เอาออก"><X className="w-3 h-3" /></button>
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหารายการ Lab..." className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-(--brand)" />
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-50 max-h-[200px] overflow-y-auto">
                {shown.length === 0 && <p className="text-center py-4 text-[11.5px] text-gray-400">ไม่พบรายการ Lab</p>}
                {shown.map(it => {
                  const on = ids.includes(it.id);
                  return (
                    <button key={it.id} onClick={() => toggleId(it.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-gray-50/70"
                      style={{ background: on ? "color-mix(in srgb, var(--brand) 5%, transparent)" : undefined }}>
                      <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors"
                        style={{ background: on ? "var(--brand)" : "#fff", borderColor: on ? "var(--brand)" : "#d1d5db" }}>
                        {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                      <span className="flex-1 text-[12.5px] text-gray-800" style={{ fontWeight: 600, opacity: it.active ? 1 : 0.5 }}>
                        {it.name}
                        {!it.active && <span className="ml-1.5 text-[9.5px] text-gray-400" style={{ fontWeight: 500 }}>(ปิดใช้งาน)</span>}
                      </span>
                      <span className="text-[10px] text-gray-400">{it.unit || "test"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="vet-modal-footer flex-shrink-0">
            <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
            <button
              onClick={() => { if (!canSave) return; onSave({ id: profile?.id ?? 0, name: name.trim(), active, itemIds: ids }, isNew); }}
              disabled={!canSave}
              className="vet-btn vet-btn-primary btn-green disabled:opacity-40">
              <Check className="w-[16px] h-[16px]" /> บันทึก
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

// ─── Section: การแสดงผล (ธีมสี + ขนาด + ฟอนต์ + ภาษา) ──────────────
/* หัวข้อย่อยของหน้าการแสดงผล — รูปแบบเดียวกันทุกบล็อก */
/* placeholder ของเมนูที่เพิ่มไว้แต่ยังไม่มีหน้าจัดการข้างใน */
function ComingSoon({ title, sub, icon: Icon }: { title: string; sub?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-24">
      <div className="w-[72px] h-[72px] rounded-3xl flex items-center justify-center"
        style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand-dark)", border: "1px solid color-mix(in srgb, var(--brand) 22%, transparent)" }}>
        {Icon ? <Icon className="w-8 h-8" /> : <SettingsIcon className="w-8 h-8" />}
      </div>
      <div>
        <p className="text-gray-800" style={{ fontSize: "calc(16px * var(--fs))", fontWeight: 700 }}>{title}</p>
        {sub && <p className="text-gray-400 text-[12px] mt-0.5">{sub}</p>}
      </div>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]"
        style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 700 }}>
        <Wrench className="w-3.5 h-3.5" /> เมนูพร้อมแล้ว — หน้าจัดการข้อมูลกำลังพัฒนา
      </span>
    </div>
  );
}

const SectionHead = ({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) => (
  <div className="flex items-baseline gap-2 mb-3">
    <span className="self-center flex-shrink-0">{icon}</span>
    <span className="text-[13px] text-gray-800" style={{ fontWeight: 700 }}>{title}</span>
    {hint && <span className="text-[11px] text-gray-400 truncate">{hint}</span>}
  </div>
);

/* ป้ายมุมบนของการ์ดตัวอย่างพื้นหลังล็อกอิน — บอกว่าภาพอยู่ในชุดธีมเทศกาลไหน
   เป็นตาราง ไม่ใช่โซ่ if-else: ของเดิมตัวสุดท้ายเป็น fallback ชุดใหม่ที่เพิ่มมา
   เลยโดนติดป้ายของชุดสุดท้ายผิด ๆ โดยไม่มีอะไรเตือน
   ⭐ เพิ่มชุดใหม่: เพิ่มบรรทัดที่นี่ ไม่ต้องแตะ JSX ด้านล่าง */
const BG_SET_BADGE: Partial<Record<NonNullable<LoginBgSet>,
  { icon: LucideIcon; label: string; cls: string; fill?: boolean }>> = {
  xmas:       { icon: Snowflake, label: "คริสต์มาส", cls: "text-sky-500" },
  valentine:  { icon: Heart,     label: "วาเลนไทน์", cls: "text-pink-500", fill: true },
  mothersday: { icon: Sparkles,  label: "วันแม่",    cls: "text-sky-500" },
  halloween:  { icon: Ghost,     label: "ฮาโลวีน",   cls: "text-orange-500" },
  songkran:   { icon: Droplets,  label: "สงกรานต์",  cls: "text-sky-500" },
};

function DisplaySection() {
  const { showSnackbar } = useSnackbar();
  const { lang, setLang } = useLang();
  /* loginBgs = ภาพพื้นหลังของชุดที่ธีมปัจจุบันใช้ (ธีมปกติ / ธีมคริสต์มาส คนละชุด) */
  const { themeKey, fontKey, sizeKey, sbStyle, sbIcon, loginBg, loginBgs, setTheme, setFont, setSize, setSbStyle, setSbIcon, setLoginBg, themes, fonts, sizes } = useDisplay();
  const activeTheme = themes.find(t => t.key === themeKey) ?? themes[0];

  const LANGS: { key: "th" | "en"; label: string; sub: string; flag: string }[] = [
    { key: "th", label: "ไทย", sub: "Thai", flag: "🇹🇭" },
    { key: "en", label: "English", sub: "อังกฤษ", flag: "🇬🇧" },
  ];

  /* ล็อกความสูง = พื้นที่จอที่เหลือจริง — วัดตอน runtime แทนเลขตายตัว
     เพราะ header ด้านบนสูงไม่คงที่ (เปลี่ยนตามขนาดตัวอักษร/ฟอนต์)
     คำนวณใหม่เมื่อ scale/ฟอนต์เปลี่ยน + ตอนย่อขยายหน้าต่าง / จอ < lg ปล่อยสูงตามเนื้อหา */
  const lockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = lockRef.current;
    if (!el) return;
    const apply = () => {
      if (window.innerWidth < 1024) { el.style.height = ""; return; }
      el.style.height = `${window.innerHeight - el.getBoundingClientRect().top - 12}px`;
    };
    apply();
    const t = window.setTimeout(apply, 350);   // เผื่อฟอนต์โหลด/แอนิเมชันเข้าหน้าเพิ่งจบ
    window.addEventListener("resize", apply);
    return () => { window.clearTimeout(t); window.removeEventListener("resize", apply); };
  }, [sizeKey, fontKey]);

  /* ── Wireframe จำลองโครงเว็บ — อ่านค่าจาก CSS vars จริงทั้งหมด
        (--sb-bg, --sb-active-*, hero, --hero-btn-*, --brand, --fs, ฟอนต์ตาม body)
        เลยสะท้อนทุกการปรับแต่งสดโดยไม่ต้อง sync state เอง ── */
  const fsz = (px: number) => `calc(${px}px * var(--fs))`;
  const Bar = ({ w, a = 0.5, h = 5 }: { w: number | string; a?: number; h?: number }) => (
    <span className="block rounded-full" style={{ width: w, height: h, background: `rgba(var(--sb-fg-rgb), ${a})` }} />
  );
  const GrayBar = ({ w, h = 5 }: { w: number | string; h?: number }) => (
    <span className="block rounded-full bg-gray-200" style={{ width: w, height: h }} />
  );
  const Wireframe = () => (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white" style={{ boxShadow: "0 10px 34px rgba(0,0,0,0.10)" }}>
      {/* แถบเบราว์เซอร์ */}
      <div className="h-8 px-3 flex items-center gap-2 bg-gray-50 border-b border-gray-100">
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fc5f57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex-1 mx-2 h-4 rounded-full bg-white border border-gray-200 flex items-center px-2">
          <span className="text-[8px] text-gray-400">ehpvetcare.app</span>
        </span>
      </div>
      <div className="flex" style={{ height: 460 }}>
        {/* ── mini sidebar (--sb-bg จริง) ── */}
        {/* vet-hero-notree = เป็น sidebar ไม่ใช่ hero — เอาแค่หิมะ ไม่เอาต้นคริสต์มาส */}
        <div className={"vet-hero-fx vet-hero-notree relative w-[96px] flex-shrink-0 flex flex-col py-2.5 px-2 gap-2 " + (sbStyle === "float" ? "rounded-xl m-1.5 shadow-lg" : "")} style={{ background: "var(--sb-bg)" }}>
          <div className="flex items-center gap-1.5 px-1 mb-1">
            <span className="w-4 h-4 rounded-lg bg-white flex-shrink-0" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
            <Bar w={40} a={0.9} h={6} />
          </div>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-1.5 px-1.5 py-1"
              style={i === 0
                ? { borderRadius: sbIcon === "rounded" ? 6 : 9999, background: "var(--sb-active-bg)", border: "1px solid var(--sb-active-border)" }
                : { borderRadius: sbIcon === "rounded" ? 6 : 9999 }}>
              <span className="w-3.5 h-3.5 bg-white flex-shrink-0" style={{ borderRadius: sbIcon === "rounded" ? 4 : 9999, boxShadow: "0 1px 2px rgba(0,0,0,0.18)" }} />
              <Bar w={i === 0 ? 34 : 28} a={i === 0 ? 0.85 : 0.45} />
            </div>
          ))}
          <div className="mt-auto flex items-center gap-1.5 bg-white rounded-full px-1.5 py-1" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }} />
            <GrayBar w={30} h={4} />
          </div>
        </div>
        {/* ── เนื้อหา ── */}
        <div className="flex-1 min-w-0 p-2.5 flex flex-col gap-2" style={{ background: "#FEFBF8" }}>
          {/* hero + ปุ่ม hero ตามธีม */}
          <div className="vet-hero-fx relative rounded-xl px-3 py-2.5 flex items-center justify-between gap-2" style={{
            backgroundImage: `radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
              radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
              linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)` }}>
            <div className="min-w-0">
              <p className="text-white truncate" style={{ fontWeight: 800, fontSize: fsz(11.5), letterSpacing: "-0.2px" }}>ระบบจัดการคลินิกสัตวแพทย์</p>
              <p className="text-white/75 truncate" style={{ fontSize: fsz(8) }}>ภาพรวมวันนี้ · 12 นัดหมาย</p>
            </div>
            <span className="flex-shrink-0 rounded-full px-2.5 py-1" style={{
              background: "var(--hero-btn-bg)", color: "var(--hero-btn-fg)",
              border: "1px solid var(--hero-btn-border)", textShadow: "var(--hero-btn-text-shadow)",
              fontSize: fsz(8.5), fontWeight: 700 }}>+ เพิ่มรายการ</span>
          </div>
          {/* การ์ดสถิติ */}
          <div className="grid grid-cols-3 gap-1.5">
            {["var(--brand)", "#f59e0b", "#8b5cf6"].map((c, i) => (
              <div key={i} className="bg-white rounded-lg p-1.5 border border-gray-100 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c }} />
                <GrayBar w="70%" h={4} />
              </div>
            ))}
          </div>
          {/* การ์ดเนื้อหา + ตัวอย่างตัวอักษร */}
          <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0">
            <div className="bg-white rounded-lg p-2 border border-gray-100 flex flex-col gap-1.5">
              <GrayBar w="55%" h={6} />
              <GrayBar w="90%" /><GrayBar w="75%" /><GrayBar w="85%" />
              <span className="mt-auto self-start rounded-full px-2.5 py-1 text-white" style={{ background: "var(--brand)", fontSize: fsz(8.5), fontWeight: 700 }}>บันทึก</span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-100 flex flex-col gap-1">
              <p className="text-gray-800" style={{ fontSize: fsz(15), fontWeight: 800, lineHeight: 1.2 }}>Aa กขคง</p>
              <p className="text-gray-500" style={{ fontSize: fsz(8.5), lineHeight: 1.5 }}>The quick brown fox 0123456789 กขคง ฉฉ ๆ ฯ</p>
              <p style={{ color: "var(--brand-dark)", fontSize: fsz(8.5), fontWeight: 700 }}>สีลิงก์ / ตัวเน้นตามธีม</p>
              <div className="mt-auto grid grid-cols-2 gap-1">
                <span className="rounded-md border border-gray-200 px-1.5 py-0.5 text-gray-500 text-center" style={{ fontSize: fsz(7.5) }}>Secondary</span>
                <span className="rounded-md px-1.5 py-0.5 text-center" style={{ background: "color-mix(in srgb, var(--brand) 12%, transparent)", color: "var(--brand-dark)", fontSize: fsz(7.5), fontWeight: 700 }}>ชิป</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    /* จอใหญ่: สูงพอดีจอ (วัดจริงตอน runtime — เลขตายตัวพังเมื่อ scale ตัวอักษรทำ header สูงขึ้น)
       ตัวอย่างซ้ายอยู่กับที่ เลื่อนได้เฉพาะฝั่งเครื่องมือ */
    <div ref={lockRef} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start lg:items-stretch lg:overflow-hidden">

      {/* ══ ซ้าย: ตัวอย่างโครงเว็บ (นิ่ง ไม่เลื่อน) —
            ห้ามใส่ overflow-hidden ที่คอลัมน์นี้ เงาของการ์ดจะโดนตัด ══ */}
      <div className="lg:col-span-8 lg:h-full lg:pl-1.5">
        <SectionHead icon={<Monitor className="w-4 h-4 text-[#7c3aed]" />} title="ตัวอย่างหน้าเว็บ" hint="อัปเดตตามการปรับแต่งทันที" />
        <Wireframe />
        <p className="text-[11px] text-gray-400 mt-3">การตั้งค่าจะถูกจดจำไว้ในเครื่องนี้ และใช้กับทุกหน้าโดยอัตโนมัติ</p>
      </div>

      {/* ══ ขวา: เครื่องมือจัดแต่ง — หัวข้อปักบนสุด, scroll เฉพาะรายการเครื่องมือ ══ */}
      <div className="lg:col-span-4 lg:h-full lg:flex lg:flex-col lg:min-h-0">
        <SectionHead icon={<Wrench className="w-4 h-4 text-[#7c3aed]" />} title="เครื่องมือจัดแต่ง" hint="ปรับแล้วเห็นผลที่ตัวอย่างทันที" />
        <div className="space-y-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-1.5 lg:pb-4" style={{ scrollbarWidth: "thin" }}>

        {/* ── ธีมสี ── */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <SectionHead icon={<Palette className="w-4 h-4 text-[#7c3aed]" />} title="ธีมสี" hint="เปลี่ยนสี Sidebar · Hero · ปุ่มหลัก" />
          {(() => {
            /* พาเลตแบบวงสี — เลือกแล้วมีวงแหวนสีแบรนด์ล้อม + ติ๊กกลางวง
               ชื่อธีมดูจาก tooltip (hover) และแถว "ธีมปัจจุบัน" ด้านล่าง */
            const Swatch = ({ th, days }: { th: (typeof themes)[number]; days?: number }) => {
              const on = th.key === themeKey;
              /* ── ทูลทิปชื่อธีม ──
                 ยิงออกไปวาดที่ document.body ด้วย portal + position: fixed
                 เพราะคอลัมน์เครื่องมือเป็น overflow-y-auto (พอแกนหนึ่งเป็น auto
                 อีกแกนที่ visible จะกลายเป็น auto ตามสเปก จึง clip ทั้งสองแกน)
                 ถ้าใช้ ::after ธรรมดา วงสีซ้ายสุดที่ชื่อยาวจะถูกขอบตัด
                 — วิธีเดียวกับทูลทิปเมนู sidebar ตอนย่อ (ดู Layout.tsx) */
              const wrapRef = useRef<HTMLSpanElement | null>(null);
              const [tip, setTip] = useState<{ top: number; left: number } | null>(null);
              const showTip = () => {
                const r = wrapRef.current?.getBoundingClientRect();
                if (!r) return;
                /* กันล้นขอบจอซ้าย-ขวาเผื่อไว้ ถึงแม้พาเนลนี้จะไม่ติดขอบจอ */
                const cx = Math.min(Math.max(r.left + r.width / 2, 80), window.innerWidth - 80);
                setTip({ top: r.bottom + 9, left: cx });
              };
              return (
                <span
                  ref={wrapRef}
                  className="inline-flex flex-shrink-0"
                  onMouseEnter={showTip}
                  onMouseLeave={() => setTip(null)}
                >
                <button
                  onClick={() => { setTheme(th.key); showSnackbar("success", `เปลี่ยนธีมเป็น "${th.label}" แล้ว`); }}
                  aria-label={th.label}
                  className="relative w-11 h-11 rounded-full transition-transform duration-150 hover:scale-110 active:scale-95 flex-shrink-0"
                  style={{
                    background: th.pastel && th.sbFrom
                      ? `linear-gradient(to top, ${th.sbTo} 0%, ${th.sbFrom} 100%)`
                      : `linear-gradient(135deg, ${th.heroFrom}, ${th.heroTo})`,
                    border: th.pastel ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.35)",
                    boxShadow: on
                      ? `0 0 0 2px #ffffff, 0 0 0 4.5px ${th.brand}, 0 6px 16px color-mix(in srgb, ${th.brand} 33.3%, transparent)`
                      : "0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25)",
                  }}
                >
                  {on && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
                        <Check className="w-3 h-3" strokeWidth={3.5} style={{ color: th.brand }} />
                      </span>
                    </span>
                  )}
                </button>
                {tip && createPortal(
                  <div
                    style={{
                      position: "fixed", top: tip.top, left: tip.left,
                      transform: "translateX(-50%)", zIndex: 9999, pointerEvents: "none",
                    }}
                  >
                    {/* หัวลูกศรชี้ขึ้นกลับไปที่วงสี */}
                    <span
                      aria-hidden
                      className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45"
                      style={{ background: "#1f2937" }}
                    />
                    <span
                      className="relative block px-2.5 py-1 rounded-lg text-white whitespace-nowrap"
                      style={{
                        background: "#1f2937",
                        fontSize: "calc(10.5px * var(--fs))",
                        fontWeight: 600,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
                      }}
                    >
                      {th.label}
                      {days !== undefined && Number.isFinite(days) && (
                        <span style={{ opacity: 0.65, fontWeight: 500 }}>
                          {days === 0 ? " · วันนี้!" : ` · อีก ${days} วัน`}
                        </span>
                      )}
                    </span>
                  </div>,
                  document.body,
                )}
                </span>
              );
            };
            const mains = themes.filter(t => !t.pastel && !t.special);
            const pastels = themes.filter(t => t.pastel);
            /* ธีมเทศกาลเรียงตาม "อีกกี่วันจะถึง" — ที่จะมาถึงก่อนอยู่ซ้ายสุด
               คิดจากวันที่จริงตอนเปิดหน้า ไม่ได้ fix ลำดับไว้ พอผ่านเทศกาลไป
               ตัวนั้นจะเลื่อนไปท้ายแถวเอง (นับเป็นของปีหน้า) */
            const specials = themes.filter(t => t.special)
              .map(t => ({ th: t, days: daysUntilFestival(t.festival) }))
              .sort((a, b) => a.days - b.days);
            return (
              <>
                <p className="text-[10.5px] text-gray-400 uppercase mb-2.5" style={{ fontWeight: 700, letterSpacing: "1.2px" }}>โทนมาตรฐาน</p>
                <div className="flex flex-wrap gap-3">
                  {mains.map(th => <Swatch key={th.key} th={th} />)}
                </div>
                <p className="text-[10.5px] text-gray-400 uppercase mt-4 mb-2.5" style={{ fontWeight: 700, letterSpacing: "1.2px" }}>โทนพาสเทล · สบายตา</p>
                <div className="flex flex-wrap gap-3">
                  {pastels.map(th => <Swatch key={th.key} th={th} />)}
                </div>
                {/* ── ธีมพิเศษตามเทศกาล — มีเอฟเฟกต์เพิ่มเติมที่ล็อกอิน · Sidebar · Hero
                       คริสต์มาส = หิมะตก / วาเลนไทน์ = หัวใจร่วง / วันแม่ = ดาวระยิบระยับ ── */}
                {specials.length > 0 && (
                  <>
                    <p className="text-[10.5px] text-gray-400 uppercase mt-4 mb-2.5" style={{ fontWeight: 700, letterSpacing: "1.2px" }}>
                      ธีมพิเศษ · เทศกาล
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {specials.map(({ th, days }) => <Swatch key={th.key} th={th} days={days} />)}
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${activeTheme.heroFrom}, ${activeTheme.heroTo})` }} />
                  <p className="text-[11.5px] text-gray-500">ธีมปัจจุบัน · <span style={{ color: "var(--brand-dark)", fontWeight: 700 }}>{activeTheme.label}</span></p>
                </div>
              </>
            );
          })()}
        </section>

        {/* ── ภาพพื้นหลังหน้าเข้าสู่ระบบ ── */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          {/* โชว์เฉพาะภาพของชุดที่ธีมปัจจุบันใช้ — เปลี่ยนธีมแล้วตัวเลือกเปลี่ยนตาม */}
          <SectionHead icon={<ImageIcon className="w-4 h-4 text-[#7c3aed]" />} title="ภาพพื้นหลังหน้าล็อกอิน"
            hint={`${loginBgs.length} แบบ · ชุดของธีม "${activeTheme.label}"`} />
          <div className="grid grid-cols-2 gap-2.5">
            {loginBgs.map(bg => {
              const on = bg.key === loginBg;
              return (
                <button key={bg.key}
                  onClick={() => { setLoginBg(bg.key); showSnackbar("success", "เปลี่ยนภาพพื้นหลังเป็น \"" + bg.label + "\" แล้ว"); }}
                  className="relative rounded-2xl overflow-hidden text-left transition-all"
                  style={{ border: on ? "2px solid " + activeTheme.brand : "1px solid #e5e7eb", boxShadow: on ? "0 4px 14px " + `color-mix(in srgb, ${activeTheme.brand} 13.3%, transparent)` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                  {/* ตัวอย่างภาพ — สัดส่วน 16:10 ใกล้เคียงจอจริง */}
                  {/* ตัวอย่าง = ภาพพื้นหลัง + โครงการ์ดล็อกอินจิ๋ววางทับ (เห็นเลยว่าการ์ดไปทับตรงไหนของภาพ) */}
                  <span className="relative block w-full bg-gray-100 overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
                    <img src={bg.src} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} loading="lazy" />
                    {/* ป้ายบอกว่าอยู่ในชุดธีมเทศกาลไหน — ภาพชุดปกติ (set = undefined) ไม่มีป้าย */}
                    {bg.set && BG_SET_BADGE[bg.set] && (() => {
                      const b = BG_SET_BADGE[bg.set!]!;
                      return (
                        <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-[2px] rounded-full"
                          style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }}>
                          <b.icon className={`w-2.5 h-2.5 ${b.cls}`} {...(b.fill ? { fill: "currentColor" } : {})} />
                          <span className="text-[8.5px] text-gray-700" style={{ fontWeight: 700 }}>{b.label}</span>
                        </span>
                      );
                    })()}
                    <span className="absolute inset-0 flex items-center justify-end pr-[7%]">
                      <span className="rounded-lg flex flex-col items-center px-1.5 py-1.5 overflow-hidden"
                        style={{
                          width: "40%",
                          background: "rgba(255,255,255,0.94)",
                          border: "1px solid rgba(255,255,255,0.85)",
                          boxShadow: "0 8px 22px rgba(0,0,0,0.26)",
                        }}>
                        {/* เส้นสีบนหัวการ์ด */}
                        <span aria-hidden className="block rounded-full" style={{ width: "60%", height: 1.5, background: "linear-gradient(90deg, transparent, var(--brand), transparent)" }} />
                        {/* โลโก้จริง */}
                        <img src={clinicLogoPreview} alt="" draggable={false} className="object-contain mt-0.5" style={{ width: 12, height: 12 }} />
                        {/* ชื่อระบบ */}
                        <span className="flex items-baseline gap-[1px] leading-none mt-0.5 whitespace-nowrap" style={{ letterSpacing: "-0.2px" }}>
                          <span style={{ fontSize: 5, fontWeight: 800, background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EHP</span>
                          <span className="text-gray-900" style={{ fontSize: 5, fontWeight: 800 }}>VetCare</span>
                        </span>
                        <span className="text-gray-400 leading-none mt-[2px] whitespace-nowrap" style={{ fontSize: 2.4, letterSpacing: "0.1px" }}>VETERINARY CLINIC MANAGEMENT</span>
                        {/* ชิปต้อนรับ */}
                        <span className="inline-flex items-center gap-[2px] rounded-full mt-1 mb-1 px-[3px] py-[1px] whitespace-nowrap max-w-full"
                          style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 22%, transparent)" }}>
                          <span className="block rounded-full" style={{ width: 3, height: 3, background: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }} />
                          <span className="leading-none" style={{ color: "var(--brand-dark)", fontSize: 3, fontWeight: 700 }}>ยินดีต้อนรับกลับ</span>
                        </span>
                        {/* ช่องกรอก */}
                        {["Username", "Password"].map(ph => (
                          <span key={ph} className="w-full rounded-full flex items-center gap-[3px] px-[4px] mb-[3px]"
                            style={{ height: 7, background: "#fff", border: "1px solid #e8eaed" }}>
                            <span className="block rounded-full bg-gray-300" style={{ width: 3, height: 3 }} />
                            <span className="text-gray-400 leading-none truncate" style={{ fontSize: 3.2 }}>{ph}</span>
                          </span>
                        ))}
                        {/* ปุ่ม LOGIN */}
                        <span className="w-full rounded-full flex items-center justify-center text-white"
                          style={{
                            height: 8,
                            background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 50%, color-mix(in srgb, var(--brand-dark) 72%, black) 100%)",
                            fontSize: 4, fontWeight: 800, letterSpacing: "0.6px",
                          }}>LOGIN</span>
                        {/* แถวล่าง */}
                        <span className="w-full flex items-center justify-between mt-[3px] leading-none whitespace-nowrap">
                          <span className="text-gray-400" style={{ fontSize: 3 }}>Remember me</span>
                          <span style={{ color: "var(--brand-dark)", fontSize: 3, fontWeight: 700 }}>Forgot?</span>
                        </span>
                      </span>
                    </span>
                  </span>
                  <span className="block px-2.5 py-2">
                    <span className="block text-[11.5px] text-gray-800 truncate" style={{ fontWeight: on ? 700 : 600 }}>{bg.label}</span>
                  </span>
                  {on && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: activeTheme.brand, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── ขนาดตัวอักษร ── */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <SectionHead icon={<TypeIcon className="w-4 h-4 text-[#7c3aed]" />} title="ขนาดตัวอักษร" hint="ใช้กับทั้งระบบ" />
          {(() => {
            /* slider 5 ระดับ — เลื่อนถึงจุดไหน setSize ทันที (wireframe ซ้ายคือ feedback สด) */
            const idx = Math.max(0, sizes.findIndex(z => z.key === sizeKey));
            const cur = sizes[idx];
            const pct = (idx / (sizes.length - 1)) * 100;
            return (
              <div className="px-1">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 leading-none flex-shrink-0" style={{ fontSize: 13, fontWeight: 800 }}>ก</span>
                  <input
                    type="range"
                    min={0}
                    max={sizes.length - 1}
                    step={1}
                    value={idx}
                    onChange={e => setSize(sizes[Number(e.target.value)].key)}
                    aria-label="ขนาดตัวอักษร"
                    aria-valuetext={cur.label}
                    className="fs-slider flex-1"
                    style={{ background: `linear-gradient(90deg, var(--brand) ${pct}%, #e5e7eb ${pct}%)` }}
                  />
                  <span className="text-gray-800 leading-none flex-shrink-0" style={{ fontSize: 24, fontWeight: 800 }}>ก</span>
                </div>
                {/* ป้าย 5 ระดับใต้ราง — ระดับที่เลือกเป็นสีแบรนด์ */}
                <div className="flex justify-between mt-2" style={{ padding: "0 26px 0 22px" }}>
                  {sizes.map((z, i) => (
                    <button key={z.key} onClick={() => setSize(z.key)}
                      className="flex flex-col items-center gap-0.5"
                      style={{ transform: i === 0 ? "translateX(-4px)" : i === sizes.length - 1 ? "translateX(4px)" : undefined }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: i === idx ? "var(--brand)" : "#d1d5db" }} />
                      <span className="text-[10px]" style={{ color: i === idx ? "var(--brand-dark)" : "#9ca3af", fontWeight: i === idx ? 700 : 500 }}>{z.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-2.5 pt-2.5 border-t border-gray-100">
                  ระดับปัจจุบัน · <span style={{ color: "var(--brand-dark)", fontWeight: 700 }}>{cur.label}</span>
                  <span className="text-gray-400"> ({Math.round(cur.scale * 100)}%) — {cur.sub}</span>
                </p>
              </div>
            );
          })()}
        </section>

        {/* ── เมนู Sidebar: ปกติ / แบบลอย ── */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <SectionHead icon={<PanelLeft className="w-4 h-4 text-[#7c3aed]" />} title="เมนูด้านข้าง" hint="รูปทรงของ Sidebar" />
          <div className="grid grid-cols-2 gap-2.5">
            {([
              { k: "normal" as const, label: "ปกติ",   sub: "ชิดขอบ เต็มความสูง" },
              { k: "float"  as const, label: "แบบลอย", sub: "การ์ดลอย ขอบมน" },
            ]).map(opt => {
              const on = sbStyle === opt.k;
              return (
                <button key={opt.k}
                  onClick={() => { setSbStyle(opt.k); showSnackbar("success", "เปลี่ยนเมนูด้านข้างเป็น \"" + opt.label + "\" แล้ว"); }}
                  className="relative rounded-2xl p-2.5 text-left transition-all"
                  style={{ background: "#fff", border: on ? "2px solid " + activeTheme.brand : "1px solid #e5e7eb", boxShadow: on ? "0 4px 14px " + `color-mix(in srgb, ${activeTheme.brand} 13.3%, transparent)` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                  {/* แผนภาพจิ๋ว */}
                  <div className="h-14 rounded-lg bg-gray-100 flex overflow-hidden mb-1.5" style={{ padding: opt.k === "float" ? 4 : 0 }}>
                    <div className={opt.k === "float" ? "w-3.5 rounded-md" : "w-3.5"}
                      style={{ background: "linear-gradient(180deg, var(--brand), var(--brand-dark))", boxShadow: opt.k === "float" ? "0 2px 5px rgba(0,0,0,0.3)" : "none" }} />
                    <div className="flex-1 p-1.5 flex flex-col gap-1">
                      <span className="block h-1.5 w-3/4 rounded-full bg-gray-300" />
                      <span className="block h-1.5 w-1/2 rounded-full bg-gray-200" />
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-800" style={{ fontWeight: on ? 700 : 600 }}>{opt.label}</p>
                  <p className="text-[10px] text-gray-400">{opt.sub}</p>
                  {on && <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: activeTheme.brand }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={3} /></span>}
                </button>
              );
            })}
          </div>

          {/* รูปทรงไอคอนเมนู — วงกลม / ขอบมน */}
          <p className="text-[10.5px] text-gray-400 uppercase mt-3.5 mb-2" style={{ fontWeight: 700, letterSpacing: "1.2px" }}>รูปทรงไอคอนเมนู</p>
          <div className="grid grid-cols-2 gap-2.5">
            {([
              { k: "circle"  as const, label: "วงกลม", r: "9999px" },
              /* 6px บนจุด 20px = สัดส่วนความมนเท่าของจริง (36px/12px) — ห้ามใส่ 10px จะกลมสนิท */
              { k: "rounded" as const, label: "ขอบมน", r: "6px" },
            ]).map(opt => {
              const on = sbIcon === opt.k;
              return (
                <button key={opt.k}
                  onClick={() => { setSbIcon(opt.k); showSnackbar("success", "เปลี่ยนไอคอนเมนูเป็นแบบ \"" + opt.label + "\" แล้ว"); }}
                  className="relative rounded-2xl p-2.5 text-center transition-all"
                  style={{ background: "#fff", border: on ? "2px solid " + activeTheme.brand : "1px solid #e5e7eb", boxShadow: on ? "0 4px 14px " + `color-mix(in srgb, ${activeTheme.brand} 13.3%, transparent)` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center justify-center gap-1.5 h-10 rounded-lg bg-gray-100 mb-1.5">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-5 h-5" style={{ borderRadius: opt.r, background: i === 0 ? "linear-gradient(135deg, var(--brand), var(--brand-dark))" : "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }} />
                    ))}
                  </div>
                  <p className="text-[12px] text-gray-800" style={{ fontWeight: on ? 700 : 600 }}>{opt.label}</p>
                  {on && <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: activeTheme.brand }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={3} /></span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── ฟอนต์ ── */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <SectionHead icon={<TypeIcon className="w-4 h-4 text-[#7c3aed]" />} title="ฟอนต์ตัวอักษร" hint="ตัวอย่างแสดงด้วยฟอนต์จริง" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fonts.map(fo => {
              const on = fo.key === fontKey;
              return (
                <button key={fo.key} onClick={() => { setFont(fo.key); showSnackbar("success", `เปลี่ยนฟอนต์เป็น "${fo.label}" แล้ว`); }}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-all"
                  style={{ background: "#fff", border: on ? `2px solid ${activeTheme.brand}` : "1px solid #e5e7eb", boxShadow: on ? `0 4px 14px color-mix(in srgb, ${activeTheme.brand} 13.3%, transparent)` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div className="min-w-0">
                    <p className="text-[13px] text-gray-800 truncate" style={{ fontWeight: 700, fontFamily: fo.stack }}>{fo.label}</p>
                    <p className="text-[12px] text-gray-500 truncate" style={{ fontFamily: fo.stack }}>ทดสอบ กขคง Abc 123</p>
                  </div>
                  {on && <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: activeTheme.brand }}><Check className="w-3 h-3 text-white" strokeWidth={3} /></span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── ภาษา ── */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <SectionHead icon={<Layers className="w-4 h-4 text-[#7c3aed]" />} title="ภาษา · Language" />
          <div className="grid grid-cols-2 gap-2.5">
            {LANGS.map(lg => {
              const on = lang === lg.key;
              return (
                <button key={lg.key} onClick={() => { setLang(lg.key); showSnackbar("success", `เปลี่ยนภาษาเป็น "${lg.label}" แล้ว`); }}
                  className="flex items-center gap-2.5 rounded-2xl px-3 py-3 text-left transition-all"
                  style={{ background: "#fff", border: on ? `2px solid ${activeTheme.brand}` : "1px solid #e5e7eb", boxShadow: on ? `0 4px 14px color-mix(in srgb, ${activeTheme.brand} 13.3%, transparent)` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <span className="text-[20px] flex-shrink-0">{lg.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 700 }}>{lg.label}</p>
                    <p className="text-[10.5px] text-gray-400 truncate">{lg.sub}</p>
                  </div>
                  {on && <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: activeTheme.brand }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={3} /></span>}
                </button>
              );
            })}
          </div>
        </section>

        </div>
      </div>
    </div>
  );
}


// ─── Main Component ───────────────────────────────────────────────
type SettingView = "menu" | "notify" | MasterSub | UsersSub | "pos" | "finance" | "members" | "xrayitems" | "labitems" | "labprofile" | "display";

// ─── Section: ตั้งค่าระบบ POS (การ์ด 2 คอลัมน์) ───────────────────
/* ── Helper components สำหรับหน้าตั้งค่า POS / การเงิน (presentational) ── */
/* ช่องกรอกตัวเลขแบบ pill — หน่วยอยู่ในตัว โฟกัสแล้วติดวงแหวนเขียว */
const PosAmountField = ({ value, unit, onChange }: { value: number; unit: string; onChange: (n: number) => void }) => (
  <label className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 pl-1 pr-2.5 py-1 cursor-text transition-all hover:border-gray-300 focus-within:border-(--brand) focus-within:bg-white focus-within:ring-2 focus-within:ring-(--brand)/15">
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      onFocus={e => e.currentTarget.select()}
      className="w-14 px-1 py-0.5 text-center text-[15px] text-gray-800 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      style={{ fontWeight: 700 }}
    />
    <span className="text-[11px] text-gray-400 flex-shrink-0" style={{ fontWeight: 600 }}>{unit}</span>
  </label>
);
const PosSwitch = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <button onClick={onClick} aria-pressed={on} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
    style={{ background: on ? "var(--brand)" : "#d1d5db" }}>
    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? "22px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
  </button>
);
const PosToggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <div className="flex items-center gap-2 flex-shrink-0"><PosSwitch on={on} onClick={onClick} /><span className="text-[10px] text-gray-400 w-8">{on ? "เปิด" : "ปิด"}</span></div>
);
const PosRow = ({ icon, tone, title, sub, right, onClick }: { icon?: React.ReactNode; tone?: string; title: string; sub?: string; right: React.ReactNode; onClick?: () => void }) => {
  const inner = (
    <>
      {icon && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${(tone ?? "#6b7280")} 7.8%, transparent)`, color: tone ?? "#6b7280" }}>{icon}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>{title}</p>
        {sub && <p className="text-[10.5px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
      {right}
    </>
  );
  return onClick ? (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50/70 transition-colors">{inner}</button>
  ) : (
    <div className="flex items-center gap-3 px-5 py-3.5">{inner}</div>
  );
};
const PosGroupCard = ({ tone, icon, title, sub, right, children }: { tone: string; icon: React.ReactNode; title: string; sub: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 10px 28px rgba(0,0,0,0.05)" }}>
    <div className="relative flex items-center gap-3 px-5 py-4 overflow-hidden" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${tone} 8.6%, transparent), color-mix(in srgb, ${tone} 2%, transparent))` }}>
      <div aria-hidden className="absolute -top-10 -right-8 w-28 h-28 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${tone} 13.3%, transparent) 0%, transparent 70%)` }} />
      <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: `linear-gradient(135deg, ${tone}, color-mix(in srgb, ${tone} 80%, transparent))`, boxShadow: `0 4px 12px color-mix(in srgb, ${tone} 33.3%, transparent)` }}>{icon}</div>
      <div className="relative flex-1 min-w-0">
        <p className="text-[14.5px] text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>{title}</p>
        <p className="text-[11px] text-gray-400 truncate">{sub}</p>
      </div>
      <div className="relative flex-shrink-0">{right}</div>
    </div>
    <div className="divide-y divide-gray-50 flex-1">{children}</div>
  </div>
);

/* ── ตั้งค่าการเงิน — VAT + การเก็บเงินสด/ปัดเศษ (ย้ายออกมาจากตั้งค่า POS) ── */
function FinanceSettingsSection() {
  const { settings, update } = usePosSettings();
  const roundOn = (m: "ceil" | "half") => settings.rounding.enabled && settings.rounding.mode === m;
  const setRound = (m: "ceil" | "half") => roundOn(m) ? update("rounding", { enabled: false }) : update("rounding", { enabled: true, mode: m });
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}>
          <Percent className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="vet-section-title">ตั้งค่าการเงิน</h2>
          <p className="text-[12px] text-gray-400">ภาษีมูลค่าเพิ่ม (VAT) · การเก็บเงินสด & ปัดเศษ</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <PosGroupCard tone="#0ea5e9" icon={<Percent className="w-5 h-5" />} title="ภาษีมูลค่าเพิ่ม (VAT)" sub="การคิดภาษีท้ายบิล · แยกนอกราคาสินค้า"
          right={<PosToggle on={settings.vat.enabled} onClick={() => update("vat", { enabled: !settings.vat.enabled })} />}>
          <PosRow icon={<Calculator className="w-4 h-4" />} tone="#0ea5e9" title="อัตราภาษี" sub="กำหนด % การเก็บค่า VAT"
            right={<PosAmountField value={settings.vat.rate} unit="%" onChange={n => update("vat", { rate: n })} />} />
        </PosGroupCard>

        <PosGroupCard tone="#16a34a" icon={<Coins className="w-5 h-5" />} title="การเก็บเงินสด & ปัดเศษ" sub="เลือกวิธีปัดเศษได้อย่างใดอย่างหนึ่ง">
          <PosRow icon={<Coins className="w-4 h-4" />} tone="#16a34a" title="ปัดเต็มบาท (ปัดขึ้นเสมอ)" sub="เช่น 426.10 → 427"
            right={<PosToggle on={roundOn("ceil")} onClick={() => setRound("ceil")} />} />
          <PosRow icon={<Calculator className="w-4 h-4" />} tone="#16a34a" title="ปัดตามทศนิยม (ครึ่งขึ้น)" sub="ต่ำกว่า 0.5 ปัดลง · ตั้งแต่ 0.5 ปัดขึ้น"
            right={<PosToggle on={roundOn("half")} onClick={() => setRound("half")} />} />
        </PosGroupCard>
      </div>
      <p className="text-[11px] text-gray-400 text-center pt-4">การตั้งค่าถูกบันทึกอัตโนมัติ · มีผลกับบิล/ใบเสร็จทันที</p>
    </div>
  );
}

/* ── ระดับสมาชิก — ตารางระดับ + ฟอร์มเพิ่ม/แก้ไข (mock, เก็บใน localStorage) ──
   ค่าตั้งต้น/คีย์/สีประจำระดับ ใช้ร่วมกับหน้าอื่นผ่าน utils/memberTier */
type MemberLevel = MemberLevelCfg;

function MemberLevelsSection() {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [levels, setLevels] = useState<MemberLevel[]>(() => {
    try { const s = localStorage.getItem(MEMBER_LEVELS_KEY); if (s) return JSON.parse(s); } catch { /* ใช้ค่าตั้งต้น */ }
    return INIT_MEMBER_LEVELS;
  });
  useEffect(() => { localStorage.setItem(MEMBER_LEVELS_KEY, JSON.stringify(levels)); }, [levels]);

  const [editing, setEditing] = useState<MemberLevel | null>(null);   // ระดับที่กำลังแก้ (id 0 = สร้างใหม่)
  const openAdd = () => {
    const last = levels[levels.length - 1];
    setEditing({ id: 0, name: "", discountPct: 0, accumMin: last ? last.accumMax + 1 : 0, accumMax: last ? last.accumMax + 1000 : 1000, redeemPoints: 10, redeemBaht: 1, condition: "" });
  };
  const handleSave = (lv: MemberLevel) => {
    if (lv.id) {
      setLevels(ls => ls.map(x => x.id === lv.id ? lv : x));
      showSnackbar("success", `แก้ไขระดับ "${lv.name}" เรียบร้อย`);
    } else {
      setLevels(ls => [...ls, { ...lv, id: Math.max(0, ...ls.map(x => x.id)) + 1 }]);
      showSnackbar("success", `เพิ่มระดับ "${lv.name}" เรียบร้อย`);
    }
    setEditing(null);
  };
  const handleDelete = async (lv: MemberLevel) => {
    const ok = await confirm({ title: `ลบระดับ "${lv.name}"?`, description: "สมาชิกที่อยู่ระดับนี้จะไม่ถูกลบ แต่ต้องจัดระดับใหม่", confirmLabel: "ลบระดับ", cancelLabel: "ยกเลิก", kind: "danger" });
    if (!ok) return;
    setLevels(ls => ls.filter(x => x.id !== lv.id));
    showSnackbar("delete", `ลบระดับ "${lv.name}" แล้ว`);
  };
  const money = (n: number) => n.toLocaleString("th-TH");

  return (
    <div>
      {/* หัวข้อ + ปุ่มเพิ่ม */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#c084fc,#7c3aed)" }}>
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="vet-section-title">ระดับสมาชิก</h2>
          <p className="text-[12px] text-gray-400">แบ่งระดับตามมูลค่าสะสม · ส่วนลด · แต้มแลกเงิน</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,color-mix(in srgb, var(--brand) 62%, white),var(--brand-dark))", boxShadow: "0 4px 14px color-mix(in srgb, var(--brand) 35%, transparent)", fontWeight: 700 }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่มระดับสมาชิก
        </button>
      </div>

      {/* ตารางระดับ */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #eef0f2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12.5px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px]" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th className="text-center px-3 py-2.5 w-12">ลำดับ</th>
                <th className="text-left px-3 py-2.5">ระดับสมาชิก</th>
                <th className="text-left px-3 py-2.5">มูลค่าสะสม</th>
                <th className="text-center px-3 py-2.5">ส่วนลด</th>
                <th className="text-center px-3 py-2.5 whitespace-nowrap">แต้มแลกเงิน</th>
                <th className="text-left px-3 py-2.5">เงื่อนไขการสะสม</th>
                <th className="px-3 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {levels.map((lv, i) => {
                const tone = levelTone(lv.name);
                return (
                  <tr key={lv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-3 py-3 text-center text-gray-400" style={{ fontWeight: 600 }}>{i + 1}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full" style={{ background: `color-mix(in srgb, ${tone} 7.1%, transparent)`, color: tone, fontWeight: 700 }}>
                        <Crown className="w-3.5 h-3.5" /> {lv.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap" style={{ fontWeight: 600 }}>{money(lv.accumMin)} ถึง {money(lv.accumMax)}</td>
                    <td className="px-3 py-3 text-center">
                      {lv.discountPct > 0
                        ? <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand-dark)", fontWeight: 700 }}>{lv.discountPct}%</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600 whitespace-nowrap">{lv.redeemPoints} แต้ม = {lv.redeemBaht} บาท</td>
                    <td className="px-3 py-3 text-gray-500 max-w-[220px] truncate" title={lv.condition}>{lv.condition || <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(lv)} title="แก้ไข"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-(--brand) hover:bg-(--brand)/10 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(lv)} title="ลบ"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {levels.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">ยังไม่มีระดับสมาชิก — กด "เพิ่มระดับสมาชิก" เพื่อเริ่มต้น</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 text-center pt-4">การตั้งค่าถูกบันทึกอัตโนมัติ · ใช้คำนวณส่วนลดและแต้มที่หน้า POS</p>

      {/* ฟอร์มเพิ่ม/แก้ไขระดับ */}
      <MemberLevelModal level={editing} onClose={() => setEditing(null)} onSave={handleSave} />
    </div>
  );
}

function MemberLevelModal({ level, onClose, onSave }: {
  level: MemberLevel | null; onClose: () => void; onSave: (lv: MemberLevel) => void;
}) {
  const [form, setForm] = useState<MemberLevel | null>(level);
  const [prevLevel, setPrevLevel] = useState<MemberLevel | null>(level);
  if (level !== prevLevel) { setPrevLevel(level); setForm(level); }
  const setF = <K extends keyof MemberLevel>(k: K, v: MemberLevel[K]) => setForm(f => f ? { ...f, [k]: v } : f);
  const canSave = !!form && form.name.trim().length > 0 && form.accumMax >= form.accumMin && form.redeemPoints > 0 && form.redeemBaht > 0;
  const inCls = "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-(--brand)";
  const lbCls = "text-[11px] text-gray-500 mb-1 block";
  return (
    <AnimatePresence>
      {level && form && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden pointer-events-auto"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
              {/* header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#c084fc,#7c3aed)" }}>
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <h3 className="flex-1 text-[15px] text-gray-900" style={{ fontWeight: 800 }}>
                  {form.id ? `แก้ไขระดับ "${level.name}"` : "เพิ่มระดับสมาชิก"}
                </h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* body */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbCls}>ระดับสมาชิก <span className="text-red-400">*</span></label>
                    <input className={inCls} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="เช่น Silver, Gold, Platinum" />
                  </div>
                  <div>
                    <label className={lbCls}>ซื้อสินค้าได้ส่วนลด</label>
                    <div className="relative">
                      <input type="number" min={0} max={100} className={`${inCls} pr-8`} value={form.discountPct || ""} placeholder="0"
                        onChange={e => setF("discountPct", Math.min(100, Math.max(0, Number(e.target.value))))} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400" style={{ fontWeight: 600 }}>%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={lbCls}>มูลค่าสะสม (บาท) <span className="text-red-400">*</span></label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={0} className={inCls} value={form.accumMin || (form.accumMin === 0 ? "0" : "")}
                      onChange={e => setF("accumMin", Math.max(0, Number(e.target.value)))} />
                    <span className="text-[12px] text-gray-400 flex-shrink-0" style={{ fontWeight: 600 }}>ถึง</span>
                    <input type="number" min={0} className={inCls} value={form.accumMax || ""}
                      onChange={e => setF("accumMax", Math.max(0, Number(e.target.value)))} />
                  </div>
                  {form.accumMax < form.accumMin && <p className="text-[11px] text-red-400 mt-1">ค่าสิ้นสุดต้องไม่น้อยกว่าค่าเริ่มต้น</p>}
                </div>
                {/* แต้มแลกเงิน */}
                <div className="rounded-2xl p-3.5" style={{ background: "color-mix(in srgb, var(--brand) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 20%, transparent)" }}>
                  <p className="text-[12px] text-(--brand-dark) mb-2.5 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                    <Coins className="w-3.5 h-3.5" /> เปลี่ยนแต้มสะสมแทนการชำระเงิน
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className={lbCls}>แต้มสะสม (แต้ม)</label>
                      <input type="number" min={1} className={inCls} value={form.redeemPoints || ""}
                        onChange={e => setF("redeemPoints", Math.max(0, Number(e.target.value)))} />
                    </div>
                    <span className="text-gray-400 mt-5 flex-shrink-0" style={{ fontWeight: 700 }}>=</span>
                    <div className="flex-1">
                      <label className={lbCls}>จำนวนเงิน (บาท)</label>
                      <input type="number" min={1} className={inCls} value={form.redeemBaht || ""}
                        onChange={e => setF("redeemBaht", Math.max(0, Number(e.target.value)))} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={lbCls}>เงื่อนไขการสะสม</label>
                  <textarea rows={2} className={`${inCls} resize-none`} value={form.condition}
                    onChange={e => setF("condition", e.target.value)} placeholder="เช่น สะสมภายใน 12 เดือน, สิทธิพิเศษวันเกิด..." />
                </div>
              </div>
              {/* footer */}
              <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-full text-[12.5px] text-gray-500 hover:bg-gray-100 transition-colors" style={{ fontWeight: 600, border: "1px solid #e5e7eb" }}>
                  ยกเลิก
                </button>
                <button onClick={() => form && onSave({ ...form, name: form.name.trim() })} disabled={!canSave}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[12.5px] text-white transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,color-mix(in srgb, var(--brand) 62%, white),var(--brand-dark))", boxShadow: "0 4px 14px color-mix(in srgb, var(--brand) 35%, transparent)", fontWeight: 700 }}>
                  <Check className="w-3.5 h-3.5" /> บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function PosSettingsSection({ onOpenMembers }: { onOpenMembers?: () => void }) {
  const { settings, update } = usePosSettings();
  const [printerEdit, setPrinterEdit] = useState<null | "receipt" | "label">(null);
  /* ชื่อระดับสมาชิกจริงจากที่ตั้งไว้ (เมนู "ระดับสมาชิก") — ไว้โชว์ในแถวลัด */
  const memberLevelNames: string[] = (() => {
    try { const s = localStorage.getItem(MEMBER_LEVELS_KEY); if (s) return (JSON.parse(s) as MemberLevel[]).map(l => l.name); } catch { /* ใช้ค่าตั้งต้น */ }
    return INIT_MEMBER_LEVELS.map(l => l.name);
  })();
  const inCls  = "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-(--brand)";

  /* ช่องกรอกตัวเลขแบบ pill — หน่วยอยู่ในตัว โฟกัสแล้วติดวงแหวนเขียว */
  const AmountField = ({ value, unit, onChange }: { value: number; unit: string; onChange: (n: number) => void }) => (
    <label className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 pl-1 pr-2.5 py-1 cursor-text transition-all hover:border-gray-300 focus-within:border-(--brand) focus-within:bg-white focus-within:ring-2 focus-within:ring-(--brand)/15">
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        onFocus={e => e.currentTarget.select()}
        className="w-14 px-1 py-0.5 text-center text-[15px] text-gray-800 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        style={{ fontWeight: 700 }}
      />
      <span className="text-[11px] text-gray-400 flex-shrink-0" style={{ fontWeight: 600 }}>{unit}</span>
    </label>
  );

  const Switch = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} aria-pressed={on} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: on ? "var(--brand)" : "#d1d5db" }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? "22px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
    </button>
  );
  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <div className="flex items-center gap-2 flex-shrink-0"><Switch on={on} onClick={onClick} /><span className="text-[10px] text-gray-400 w-8">{on ? "เปิด" : "ปิด"}</span></div>
  );
  /* แถวตั้งค่าภายในการ์ด */
  const Row = ({ icon, tone, title, sub, right, onClick }: { icon?: React.ReactNode; tone?: string; title: string; sub?: string; right: React.ReactNode; onClick?: () => void }) => {
    const inner = (
      <>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${(tone ?? "#6b7280")} 7.8%, transparent)`, color: tone ?? "#6b7280" }}>{icon}</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>{title}</p>
          {sub && <p className="text-[10.5px] text-gray-400 mt-0.5 truncate">{sub}</p>}
        </div>
        {right}
      </>
    );
    return onClick ? (
      <button onClick={onClick} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50/70 transition-colors">{inner}</button>
    ) : (
      <div className="flex items-center gap-3 px-5 py-3.5">{inner}</div>
    );
  };

  /* การ์ดรวมหมวด — หัวไล่เฉดสี + แถวย่อยคั่นเส้น */
  const GroupCard = ({ tone, icon, title, sub, right, children }: { tone: string; icon: React.ReactNode; title: string; sub: string; right?: React.ReactNode; children: React.ReactNode }) => (
    <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 10px 28px rgba(0,0,0,0.05)" }}>
      <div className="relative flex items-center gap-3 px-5 py-4 overflow-hidden" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${tone} 8.6%, transparent), color-mix(in srgb, ${tone} 2%, transparent))` }}>
        <div aria-hidden className="absolute -top-10 -right-8 w-28 h-28 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${tone} 13.3%, transparent) 0%, transparent 70%)` }} />
        <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: `linear-gradient(135deg, ${tone}, color-mix(in srgb, ${tone} 80%, transparent))`, boxShadow: `0 4px 12px color-mix(in srgb, ${tone} 33.3%, transparent)` }}>{icon}</div>
        <div className="relative flex-1 min-w-0">
          <p className="text-[14.5px] text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>{title}</p>
          <p className="text-[11px] text-gray-400 truncate">{sub}</p>
        </div>
        <div className="relative flex-shrink-0">{right}</div>
      </div>
      <div className="divide-y divide-gray-50 flex-1">{children}</div>
    </div>
  );
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="vet-section-title">ตั้งค่าระบบ POS</h2>
          <p className="text-[12px] text-gray-400">แต้มสะสม · เครื่องพิมพ์</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* ── การ์ด: ระบบสะสมแต้ม ── */}
        <GroupCard tone="#f59e0b" icon={<Star className="w-5 h-5" />} title="ระบบสะสมแต้ม" sub="อัตราสะสม · การแลกส่วนลด · ระดับสมาชิก"
          right={<Toggle on={settings.points.enabled} onClick={() => update("points", { enabled: !settings.points.enabled })} />}>
          <Row icon={<Coins className="w-4 h-4" />} tone="#f59e0b" title="การสะสมแต้ม" sub="ซื้อครบทุกกี่บาท ได้รับกี่แต้ม"
            right={
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <AmountField value={settings.points.earnSpend} unit="บาท" onChange={n => update("points", { earnSpend: n })} />
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <AmountField value={settings.points.earnPoints} unit="แต้ม" onChange={n => update("points", { earnPoints: n })} />
              </div>
            } />
          <Row icon={<Star className="w-4 h-4" />} tone="#d97706" title="การใช้แต้มแลกส่วนลด" sub="ใช้กี่แต้ม แลกส่วนลดกี่บาท"
            right={
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <AmountField value={settings.points.redeemPoints} unit="แต้ม" onChange={n => update("points", { redeemPoints: n })} />
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <AmountField value={settings.points.redeemBaht} unit="บาท" onChange={n => update("points", { redeemBaht: n })} />
              </div>
            } />
          <Row icon={<Crown className="w-4 h-4" />} tone="#7c3aed" title="ข้อมูลระดับสมาชิก" sub="ตั้งค่าช่วงมูลค่าสะสม · ส่วนลด · แต้มแลกเงิน — กดเพื่อจัดการ"
            onClick={onOpenMembers}
            right={
              <div className="flex items-center gap-1 flex-shrink-0">
                {memberLevelNames.slice(0, 4).map(lb => {
                  const cl = levelTone(lb);
                  return <span key={lb} className="text-[9.5px] px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${cl} 9.4%, transparent)`, color: cl, fontWeight: 700 }}>{lb}</span>;
                })}
                {memberLevelNames.length > 4 && <span className="text-[9.5px] text-gray-400" style={{ fontWeight: 700 }}>+{memberLevelNames.length - 4}</span>}
                <ChevronRight className="w-4 h-4 text-gray-300 ml-0.5" />
              </div>
            } />
        </GroupCard>

        {/* ── การ์ด: อุปกรณ์เชื่อมต่อ ── */}
        <GroupCard tone="#7c3aed" icon={<Printer className="w-5 h-5" />} title="อุปกรณ์เชื่อมต่อ" sub="เครื่องพิมพ์ใบเสร็จ · สติกเกอร์หน้าซองยา">
          <Row icon={<Printer className="w-4 h-4" />} tone="var(--brand-dark)" title="เครื่องพิมพ์ใบเสร็จ"
            sub={settings.receiptPrinter.enabled ? `${settings.receiptPrinter.name} · ${settings.receiptPrinter.paper}` : "ปิดใช้งาน · กดเพื่อตั้งค่า"}
            onClick={() => setPrinterEdit("receipt")}
            right={<ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />} />
          <Row icon={<Tag className="w-4 h-4" />} tone="#e11d48" title="เครื่องพิมพ์สติกเกอร์หน้าซองยา"
            sub={settings.labelPrinter.enabled ? `${settings.labelPrinter.name} · ${settings.labelPrinter.size}` : "ปิดใช้งาน · กดเพื่อตั้งค่า"}
            onClick={() => setPrinterEdit("label")}
            right={<ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />} />
        </GroupCard>
      </div>

      <p className="text-[11px] text-gray-400 text-center pt-4">การตั้งค่าถูกบันทึกอัตโนมัติ · มีผลกับหน้าร้านค้า POS ทันที</p>

      {/* Printer edit modal */}
      {printerEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setPrinterEdit(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
          <div className="relative w-full max-w-[380px] bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              {printerEdit === "receipt" ? <Printer className="w-4 h-4 text-(--brand-dark)" /> : <Tag className="w-4 h-4 text-[#e11d48]" />}
              <p className="text-[14px] text-gray-900 flex-1" style={{ fontWeight: 800 }}>{printerEdit === "receipt" ? "เครื่องพิมพ์ใบเสร็จ" : "เครื่องพิมพ์สติกเกอร์ซองยา"}</p>
              <button onClick={() => setPrinterEdit(null)} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              {printerEdit === "receipt" ? (
                <>
                  <label className="flex items-center justify-between text-[13px] text-gray-600"><span>เปิดใช้งาน</span><Switch on={settings.receiptPrinter.enabled} onClick={() => update("receiptPrinter", { enabled: !settings.receiptPrinter.enabled })} /></label>
                  <div><p className="text-[11px] text-gray-400 mb-1">ชื่อเครื่องพิมพ์</p><input className={inCls} value={settings.receiptPrinter.name} onChange={e => update("receiptPrinter", { name: e.target.value })} /></div>
                  <div className="flex gap-2">
                    <div className="flex-1"><p className="text-[11px] text-gray-400 mb-1">ขนาดกระดาษ</p>
                      <select className={inCls} value={settings.receiptPrinter.paper} onChange={e => update("receiptPrinter", { paper: e.target.value })}>
                        <option value="58mm">58mm</option><option value="80mm">80mm</option><option value="A5">A5</option>
                      </select>
                    </div>
                    <div className="w-24"><p className="text-[11px] text-gray-400 mb-1">สำเนา</p><input type="number" min={1} className={inCls} value={settings.receiptPrinter.copies} onChange={e => update("receiptPrinter", { copies: Number(e.target.value) })} /></div>
                  </div>
                  <div><p className="text-[11px] text-gray-400 mb-1">ข้อความท้ายใบเสร็จ</p><input className={inCls} value={settings.receiptPrinter.footer} onChange={e => update("receiptPrinter", { footer: e.target.value })} /></div>
                </>
              ) : (
                <>
                  <label className="flex items-center justify-between text-[13px] text-gray-600"><span>เปิดใช้งาน</span><Switch on={settings.labelPrinter.enabled} onClick={() => update("labelPrinter", { enabled: !settings.labelPrinter.enabled })} /></label>
                  <div><p className="text-[11px] text-gray-400 mb-1">ชื่อเครื่องพิมพ์</p><input className={inCls} value={settings.labelPrinter.name} onChange={e => update("labelPrinter", { name: e.target.value })} /></div>
                  <div><p className="text-[11px] text-gray-400 mb-1">ขนาดสติกเกอร์</p>
                    <select className={inCls} value={settings.labelPrinter.size} onChange={e => update("labelPrinter", { size: e.target.value })}>
                      <option>40 × 30 mm</option><option>50 × 30 mm</option><option>60 × 40 mm</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-[12.5px] text-gray-600 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-(--brand-dark)" checked={settings.labelPrinter.showClinic} onChange={e => update("labelPrinter", { showClinic: e.target.checked })} /> ชื่อคลินิก</label>
                    <label className="flex items-center gap-1.5 text-[12.5px] text-gray-600 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-(--brand-dark)" checked={settings.labelPrinter.showUsage} onChange={e => update("labelPrinter", { showUsage: e.target.checked })} /> วิธีใช้ยา</label>
                  </div>
                </>
              )}
            </div>
            <div className="px-4 pb-4">
              <button onClick={() => setPrinterEdit(null)} className="w-full py-2.5 rounded-full text-white text-[14px]" style={{ fontWeight: 700, background: "linear-gradient(135deg,var(--brand),var(--brand-dark))" }}>เสร็จสิ้น</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Settings() {
  const [view, setView] = useState<string>("menu");
  const [menuSearch, setMenuSearch] = useState("");

  // shared state (lifted so sub-sections can share)
  const [species,   setSpecies]   = useState<PetSpecies[]>(INIT_SPECIES);
  /* ทะเบียนประเภทวัคซีนอยู่ที่นี่ เพราะใช้ร่วมกัน 2 หน้า —
     หน้าจัดการประเภท และ dropdown "ประเภทวัคซีน" ในฟอร์มเพิ่มวัคซีน */
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>(INIT_VACCINE_TYPES);
  const [breeds,    setBreeds]    = useState<PetBreed[]>(INIT_BREEDS);
  const [rooms,     setRooms]     = useState<Room[]>(INIT_ROOMS);
  const [personnel, setPersonnel] = useState<Personnel[]>(INIT_PERSONNEL);

  const { t } = useLang();

  // ── Menu groups ────────────────────────────────────────────────
  type MenuItem = {
    key: string;        // เมนูที่ยังไม่มีหน้าจัดการ (placeholder) ใช้ key อิสระได้
    label: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
    grad: string;       // CSS gradient for icon background
    accent: string;     // accent border color (rgba)
  };
  /* เมนูที่มีหน้าจัดการจริงแล้ว — ที่เหลือเป็น placeholder (โชว์ "กำลังพัฒนา") */
  const G = {
    brand: "linear-gradient(135deg,var(--brand),var(--brand-dark))", brandA: "color-mix(in srgb, var(--brand-dark) 35%, transparent)",
    blue: "linear-gradient(135deg,#60a5fa,#2563eb)", blueA: "rgba(37,99,235,0.35)",
    sky: "linear-gradient(135deg,#38bdf8,#0284c7)", skyA: "rgba(2,132,199,0.35)",
    teal: "linear-gradient(135deg,#2dd4bf,#0d9488)", tealA: "rgba(13,148,136,0.35)",
    green: "linear-gradient(135deg,#34d399,#059669)", greenA: "rgba(5,150,105,0.35)",
    violet: "linear-gradient(135deg,#a78bfa,#7c3aed)", violetA: "rgba(124,58,237,0.35)",
    purple: "linear-gradient(135deg,#c084fc,#7e22ce)", purpleA: "rgba(126,34,206,0.35)",
    indigo: "linear-gradient(135deg,#818cf8,#4f46e5)", indigoA: "rgba(79,70,229,0.35)",
    amber: "linear-gradient(135deg,#fbbf24,#d97706)", amberA: "rgba(217,119,6,0.35)",
    orange: "linear-gradient(135deg,#fb923c,#ea580c)", orangeA: "rgba(234,88,12,0.35)",
    cyan: "linear-gradient(135deg,#22d3ee,#0891b2)", cyanA: "rgba(8,145,178,0.35)",
    rose: "linear-gradient(135deg,#fb7185,#e11d48)", roseA: "rgba(225,29,72,0.35)",
    pink: "linear-gradient(135deg,#f472b6,#db2777)", pinkA: "rgba(219,39,119,0.35)",
  };
  const groups: { key: string; title: string; en: string; items: MenuItem[] }[] = [
    {
      key: "notify", title: t("settings.tab.notify"), en: "System settings",
      items: [
        { key: "clinic",   label: "ข้อมูลสถานพยาบาล", sub: "Hospital Information", icon: Building2, grad: G.brand,  accent: G.brandA },
        { key: "display",  label: "การแสดงผล",        sub: "Theme · Size · Sidebar · Font · Language", icon: Palette, grad: G.violet, accent: G.violetA },
        { key: "notify",   label: t("settings.sub.notify"), sub: "Alert Preferences", icon: BellRing, grad: G.orange, accent: G.orangeA },
        { key: "medrec",   label: "เวชระเบียน",        sub: "Medical Record Setup", icon: FileText, grad: G.blue,   accent: G.blueA },
        { key: "hotkeys",  label: "คีย์ลัด",           sub: "Shift + 1…0",         icon: Keyboard,  grad: G.sky,    accent: G.skyA },
        { key: "tabs",     label: "แท็บ OPD / IPD",    sub: "Tab Layout",          icon: Layers,    grad: G.green,  accent: G.greenA },
      ],
    },
    {
      key: "meds", title: "ข้อมูลยา", en: "Medications",
      items: [
        { key: "drugs",     label: "รายการยา",           sub: "Drug Registry",       icon: Pill,     grad: G.blue,   accent: G.blueA },
        { key: "vacTypes",  label: "ประเภทวัคซีน",        sub: "Vaccine Types",       icon: Syringe,  grad: G.cyan,   accent: G.cyanA },
        { key: "vaccines",  label: "รายการวัคซีน",        sub: "Vaccine List",        icon: Syringe,  grad: G.sky,    accent: G.skyA },
        { key: "injSites",  label: "ตำแหน่งที่ฉีด",       sub: "Injection Sites",     icon: Target,   grad: G.rose,   accent: G.roseA },
        { key: "injRoutes", label: "วิธีการฉีด",          sub: "Injection Routes",    icon: Route,    grad: G.indigo, accent: G.indigoA },
        { key: "drugUsage", label: "วิธีการใช้ยา",        sub: "Drug Usage Methods",  icon: BookOpen, grad: G.green,  accent: G.greenA },
        { key: "dewormers", label: "รายการยาถ่ายพยาธิ",   sub: "Dewormers",           icon: Bug,      grad: G.violet, accent: G.violetA },
        { key: "drugUnits", label: "หน่วยยา",            sub: "Drug Units",          icon: Scale,    grad: G.teal,   accent: G.tealA },
      ],
    },
    {
      key: "master", title: t("settings.tab.master"), en: "Master Data",
      items: [
        { key: "species",       label: t("settings.sub.species"), sub: "Pet Species",     icon: PawPrint, grad: G.green,  accent: G.greenA },
        { key: "breeds",        label: t("settings.sub.breeds"),  sub: "Breed Management", icon: Star,    grad: G.violet, accent: G.violetA },
        { key: "vitalCriteria", label: "เกณฑ์สัญญาณชีพ",           sub: "Vital Sign Criteria", icon: Activity, grad: G.rose, accent: G.roseA },
        { key: "visitTypes",    label: "ประเภทการมารับบริการ",     sub: "Visit Types",     icon: ClipboardList, grad: G.violet, accent: G.violetA },
        { key: "symptoms",      label: "รายละเอียดอาการ",          sub: "Symptom Registry", icon: Stethoscope, grad: G.rose, accent: G.roseA },
        { key: "services",      label: t("settings.sub.services"), sub: "Service Pricing", icon: Wrench,  grad: G.amber,  accent: G.amberA },
        { key: "incomeCat",     label: "หมวดหมู่ค่าบริการ",         sub: "Income Categories", icon: Coins, grad: G.orange, accent: G.orangeA },
        { key: "apptTypes",     label: "ประเภทนัดหมาย",            sub: "Appointment Types", icon: Calendar, grad: G.sky, accent: G.skyA },
        { key: "bodySites",     label: "บริเวณที่ทำหัตถการ",        sub: "Body Sites",      icon: PawPrint, grad: G.teal,   accent: G.tealA },
        { key: "procedures",    label: "หัตถการห้องตรวจ",          sub: "Procedures",      icon: Scissors, grad: G.pink,   accent: G.pinkA },
        { key: "xrayitems",     label: "รายการ Medical Imaging",   sub: "Imaging Catalog", icon: ScanLine, grad: G.sky,    accent: G.skyA },
        { key: "labitems",      label: "รายการ Lab",              sub: "Lab Catalog",     icon: FlaskConical, grad: G.purple, accent: G.purpleA },
        { key: "labprofile",    label: "Lab Profile",             sub: "Lab Bundles",     icon: Layers,   grad: G.violet, accent: G.violetA },
      ],
    },
    {
      key: "boardingIpd", title: "ข้อมูลฝากเลี้ยง / IPD", en: "Boarding / IPD",
      items: [
        { key: "roomTypes",      label: "ประเภทห้องพัก",           sub: "Room Types",      icon: Bed,     grad: G.pink,   accent: G.pinkA },
        { key: "boarding",       label: "ห้องพัก",                sub: "Boarding Rooms",  icon: HomeIcon, grad: G.teal,  accent: G.tealA },
        { key: "roomFacilities", label: "สิ่งอำนวยความสะดวกในห้อง", sub: "Room Facilities", icon: Sparkles, grad: G.cyan, accent: G.cyanA },
        { key: "wards",          label: "Ward (IPD)",             sub: "IPD Ward Setup",  icon: Bed,     grad: G.brand,  accent: G.brandA },
      ],
    },
    {
      key: "surgery", title: "ข้อมูลผ่าตัด", en: "Surgery",
      items: [
        { key: "surgeryDx",   label: "วินิจฉัยผ่าตัด",  sub: "Surgery Diagnoses",  icon: FileText, grad: G.rose, accent: G.roseA },
        { key: "surgeryProc", label: "หัตถการผ่าตัด",   sub: "Surgery Procedures", icon: Scissors, grad: G.pink, accent: G.pinkA },
      ],
    },
    {
      key: "grooming", title: "ข้อมูลอาบน้ำตัดขน", en: "Grooming",
      items: [
        { key: "petSizes",      label: "ขนาดตัวสัตว์",        sub: "Pet Body Sizes",  icon: Ruler,    grad: G.green,  accent: G.greenA },
        { key: "groomServices", label: "บริการอาบน้ำตัดขน",    sub: "Grooming Services", icon: Scissors, grad: G.pink, accent: G.pinkA },
        { key: "groomStyles",   label: "สไตล์การตัดขน",        sub: "Grooming Styles", icon: Palette,  grad: G.violet, accent: G.violetA },
      ],
    },
    {
      key: "pos", title: "ร้านค้า & POS", en: "Point of Sale",
      items: [
        { key: "pos",            label: "ตั้งค่าระบบ POS",     sub: "POS Settings",     icon: ShoppingCart, grad: G.amber, accent: G.amberA },
        { key: "suppliers",      label: "ข้อมูล Supplier",     sub: "Suppliers",        icon: Building2, grad: G.green,  accent: G.greenA },
        { key: "delivery",       label: "วิธีส่งสินค้า",        sub: "Delivery Methods", icon: Truck,    grad: G.sky,    accent: G.skyA },
        { key: "taxTypes",       label: "ประเภทการคิดภาษี",     sub: "Tax Types",        icon: Percent,  grad: G.blue,   accent: G.blueA },
        { key: "productTypes",   label: "ประเภทสินค้า",         sub: "Product Types",    icon: Tag,      grad: G.orange, accent: G.orangeA },
        { key: "productClasses", label: "กลุ่มสินค้า",          sub: "Product Classes",  icon: Boxes,    grad: G.green,  accent: G.greenA },
        { key: "memberTypes",    label: "ประเภทสมาชิก",        sub: "Member Levels",    icon: Crown,    grad: G.pink,   accent: G.pinkA },
        { key: "members",        label: "ระดับสมาชิก (สะสมแต้ม)", sub: "Loyalty Tiers",  icon: Star,     grad: G.violet, accent: G.violetA },
      ],
    },
    {
      key: "finance", title: "การเงิน", en: "Finance",
      items: [
        { key: "payments",  label: "การรับชำระเงิน", sub: "Payment Methods", icon: Coins,      grad: G.green, accent: G.greenA },
        { key: "finance",   label: "ภาษีมูลค่าเพิ่ม", sub: "VAT · ปัดเศษ",     icon: Calculator, grad: G.sky,   accent: G.skyA },
        { key: "discounts", label: "ส่วนลด",         sub: "Discounts",       icon: Tag,        grad: G.teal,  accent: G.tealA },
        { key: "promos",    label: "โปรโมชั่น & คูปอง", sub: "Promotions · Packages", icon: Ticket, grad: G.rose, accent: G.roseA },
      ],
    },
    {
      key: "users", title: t("settings.tab.users"), en: "Users & Access",
      items: [
        { key: "rooms",          label: t("settings.sub.rooms"),     sub: "Room Management",     icon: Building2,  grad: G.teal,   accent: G.tealA },
        { key: "staffPositions", label: "ตำแหน่งงาน",                sub: "Staff Positions",     icon: Briefcase,  grad: G.indigo, accent: G.indigoA },
        { key: "personnel",      label: t("settings.sub.personnel"), sub: "Staff & Vets",        icon: UserCircle, grad: G.indigo, accent: G.indigoA },
        { key: "sysUsers",       label: "ผู้ใช้งาน",                 sub: "System Users",        icon: Users,      grad: G.violet, accent: G.violetA },
        { key: "roles",          label: t("settings.sub.roles"),     sub: "Role Permissions",    icon: Shield,     grad: G.rose,   accent: G.roseA },
        { key: "access",         label: t("settings.sub.access"),    sub: "Room Access Control", icon: Lock,       grad: G.orange, accent: G.orangeA },
      ],
    },
  ];

  /* คีย์ที่มีหน้าจัดการจริง — นอกเหนือจากนี้เป็น placeholder */
  const IMPLEMENTED_VIEWS = new Set([
    "clinic", "payments", "drugUsage", "notify", "display", "hotkeys", "tabs",
    "drugs", "species", "breeds", "services", "vaccines", "vacTypes", "procedures", "injSites", "injRoutes", "dewormers", "drugUnits", "wards", "boarding",
    "pos", "finance", "members", "xrayitems", "labitems", "labprofile", "promos",
    "rooms", "personnel", "roles", "access",
  ]);

  const allItems = groups.flatMap(g => g.items);
  const currentItem = allItems.find(it => it.key === view);
  const currentGroup = groups.find(g => g.items.some(it => it.key === view));
  const isMenu = view === "menu";

  /* กรองเมนูตามคำค้น — เทียบทั้งชื่อไทย คำอธิบาย และชื่อกลุ่ม
     กลุ่มที่ไม่มีเมนูตรงเลยจะถูกซ่อนทั้งกลุ่ม */
  const mq = menuSearch.trim().toLowerCase();
  const shownGroups = mq
    ? groups
        .map(g => ({ ...g, items: g.items.filter(it =>
          it.label.toLowerCase().includes(mq) || it.sub.toLowerCase().includes(mq) || g.title.toLowerCase().includes(mq)) }))
        .filter(g => g.items.length > 0)
    : groups;
  const matchCount = shownGroups.reduce((s, g) => s + g.items.length, 0);

  return (
    <PageMotion className="flex flex-col h-full" >
      {isMenu ? (
        /* ── HERO (menu landing) ── */
        <PageItem className="p-4 pb-0 flex-shrink-0" >
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="vet-hero-fx relative rounded-3xl overflow-hidden"
            style={{
              backgroundImage: `
                radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
                radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
                linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)
              `,
            }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)" }} />
              <div className="absolute -bottom-28 left-1/4 w-[260px] h-[260px] rounded-full" style={{ background: "radial-gradient(circle, rgba(var(--brand-hero-accent), 0.35) 0%, transparent 70%)" }} />
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)" }} />
            </div>

            <div className="relative p-5 flex items-center gap-3 flex-wrap">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))",
                  border: "1px solid rgba(255,255,255,0.32)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.12)",
                }}
              >
                <SettingsIcon className="w-[22px] h-[22px] text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-white" style={{ fontWeight: 800, fontSize: "calc(25px * var(--fs))", letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                  {t("settings.title")}
                </h1>
                <p className="text-white/75 mt-1" style={{ fontSize: "calc(12px * var(--fs))", fontWeight: 500 }}>{t("settings.subtitle")}</p>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontSize: "calc(11.5px * var(--fs))",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                <Shield className="w-3 h-3" /> {t("settings.adminOnly")}
              </div>

              {/* ── ช่องค้นหาเมนู — แพตเทิร์น search-in-hero เดียวกับหน้า Owners/Pets ── */}
              <div className="w-full flex items-center gap-2 mt-1">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    placeholder="ค้นหาเมนูตั้งค่า..."
                    className="w-full pl-9 pr-9 py-2 text-[13px] rounded-full text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.5)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
                    }}
                  />
                  {menuSearch && (
                    <button onClick={() => setMenuSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:opacity-80"
                      style={heroPillClearStyle}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        </PageItem>
      ) : (
        /* ── APPBAR (sub-view) — matches IPDPatientDetail pattern ── */
        <PageItem className="px-4 pt-4 pb-0 flex-shrink-0" >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setView("menu")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
                style={{ fontWeight: 500 }}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> กลับ
              </button>
              <div className="hidden sm:flex items-center gap-2 min-w-0 text-[12px]">
                <span className="text-gray-400">{t("settings.title")}</span>
                {currentGroup && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-500 truncate" style={{ fontWeight: 500 }}>{currentGroup.title}</span>
                  </>
                )}
                {currentItem && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-900 truncate" style={{ fontWeight: 700 }}>{currentItem.label}</span>
                  </>
                )}
              </div>
              {/* Mobile: show just current item label */}
              {currentItem && (
                <div className="flex sm:hidden items-center gap-2 min-w-0">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-white flex-shrink-0"
                    style={{ background: currentItem.grad }}
                  >
                    <currentItem.icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[13px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{currentItem.label}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full text-orange-600 bg-orange-50 border border-orange-100 text-[11.5px]"
                style={{ fontWeight: 600 }}
              >
                <Shield className="w-3 h-3" /> {t("settings.adminOnly")}
              </span>
            </div>
          </motion.div>
        </PageItem>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4 pt-3" style={{ background: "#FEFBF8" }}>
        <AnimatePresence mode="wait">
          {isMenu ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              {mq && (
                <p className="text-[12px] text-gray-500 px-1">
                  ผลการค้นหา "<span className="text-(--brand-dark)" style={{ fontWeight: 700 }}>{menuSearch}</span>" · พบ {matchCount} เมนู
                </p>
              )}
              {matchCount === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#f3f4f6" }}>
                    <Search className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-[13px] text-gray-500" style={{ fontWeight: 600 }}>ไม่พบเมนูที่ค้นหา</p>
                </div>
              )}
              {shownGroups.map((g, gi) => (
                <motion.section
                  key={g.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 + gi * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <div>
                      <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>{g.title}</p>
                      <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>{g.en} · {g.items.length} รายการ</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {g.items.map(item => {
                      const Ico = item.icon;
                      return (
                        <motion.button
                          key={item.key}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setView(item.key)}
                          className="group relative text-left bg-white rounded-2xl p-3.5 transition-all overflow-hidden"
                          style={{
                            border: `1px solid #f3f4f6`,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.05)",
                          }}
                        >
                          {/* Soft accent glow on hover */}
                          <div
                            className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: item.grad, filter: "blur(28px)" }}
                          />
                          <div className="relative flex items-start gap-3">
                            <div
                              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 transition-transform group-hover:scale-105"
                              style={{
                                background: item.grad,
                                boxShadow: `0 6px 18px ${item.accent}, inset 0 1px 0 rgba(255,255,255,0.32)`,
                              }}
                            >
                              <Ico className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 truncate" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700, lineHeight: 1.25 }}>
                                {item.label}
                              </p>
                              <p className="text-gray-400 mt-0.5 truncate" style={{ fontSize: "calc(11px * var(--fs))", fontWeight: 500 }}>
                                {item.sub}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0 mt-1" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.section>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === "clinic"    && <ClinicSection />}
              {view === "payments"  && <PaymentsSection />}
              {view === "drugUsage" && <DrugUsageSection />}
              {view === "hotkeys"   && <HotkeysSection />}
              {view === "tabs"      && <TabsSection />}
              {view === "notify"    && <NotifySection />}
              {view === "display"   && <DisplaySection />}
              {view === "drugs"     && <DrugsSection />}
              {view === "species"   && <SpeciesSection species={species} setSpecies={setSpecies} />}
              {view === "breeds"    && <BreedsSection breeds={breeds} setBreeds={setBreeds} species={species} />}
              {view === "services"  && <ServicesSection />}
              {view === "vacTypes"  && <VaccineTypesSection species={species} items={vaccineTypes} setItems={setVaccineTypes} />}
              {view === "procedures" && <ProceduresSection />}
              {view === "injSites"  && <CodeNameSection entity="ตำแหน่งที่ฉีด" titleEn="Injection Sites" icon={Target} nameLabel="ชื่อตำแหน่ง"
                grad="linear-gradient(135deg,#fb7185,#e11d48)" glow="rgba(225,29,72,0.25)" seed={INIT_INJ_SITES}
                codePlaceholder="SITE01" namePlaceholder="ต้นขาหลังซ้าย" />}
              {view === "injRoutes" && <CodeNameSection entity="วิธีการฉีด" titleEn="Injection Routes" icon={Route} nameLabel="ชื่อวิธี"
                grad="linear-gradient(135deg,#818cf8,#4f46e5)" glow="rgba(79,70,229,0.25)" seed={INIT_INJ_ROUTES}
                codePlaceholder="RT01" namePlaceholder="ฉีดเข้ากล้ามเนื้อ (IM)" />}
              {view === "dewormers" && <DewormersSection />}
              {view === "drugUnits" && <CodeNameSection entity="หน่วยยา" titleEn="Drug Units" icon={Scale} nameLabel="ชื่อหน่วยยา" withCode={false}
                grad="linear-gradient(135deg,#2dd4bf,#0d9488)" glow="rgba(13,148,136,0.25)" seed={INIT_DRUG_UNITS}
                namePlaceholder="เช่น เม็ด / ขวด / มล." />}
              {view === "vaccines"  && <VaccinesSection types={vaccineTypes} />}
              {view === "wards"     && <WardsSection />}
              {view === "boarding"  && <BoardingRoomsSection />}
              {view === "pos"       && <PosSettingsSection onOpenMembers={() => setView("members")} />}
              {view === "finance"   && <FinanceSettingsSection />}
              {view === "members"   && <MemberLevelsSection />}
              {view === "xrayitems" && <XrayLabSection key="xray" kind="xray" />}
              {view === "labitems"  && <XrayLabSection key="lab" kind="lab" species={species} />}
              {view === "labprofile" && <LabProfileSection key="labprofile" />}
              {view === "rooms"     && <RoomsSection rooms={rooms} setRooms={setRooms} />}
              {view === "promos" && <PromotionsSection />}
              {view === "personnel" && <PersonnelSection personnel={personnel} setPersonnel={setPersonnel} rooms={rooms} />}
              {view === "roles"     && <RolesSection />}
              {view === "access"    && <AccessSection personnel={personnel} rooms={rooms} />}
              {/* เมนูที่ยังไม่มีหน้าจัดการ — โชว์ placeholder ไปก่อน */}
              {!IMPLEMENTED_VIEWS.has(view) && <ComingSoon title={currentItem?.label ?? ""} sub={currentItem?.sub} icon={currentItem?.icon} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageMotion>
  );
}
