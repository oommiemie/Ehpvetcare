import image_d0ed46269162105ec3b29e48ba732cdf2fa8a50e from 'figma:asset/d0ed46269162105ec3b29e48ba732cdf2fa8a50e.png'
import { useState, useEffect, useRef } from "react";
import { LOGIN_BACKGROUNDS } from "../config/loginBackgrounds";
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
  Bell, Database, Users, Plus, Edit2, Trash2, Search, Package,
  Shield, X, Building2, UserCircle, Syringe, Pill,
  Check, PawPrint, Wrench, ChevronRight, Lock,
  BellRing, ToggleLeft, ToggleRight, AlertCircle, Star,
  Bed, Power, Pencil, Settings as SettingsIcon, Sparkles,
  ArrowLeft, Home as HomeIcon, MoreHorizontal,
  Percent, Coins, Printer, Tag, Calculator, ShoppingCart, Crown, ChevronDown, ArrowRight,
  FlaskConical, ScanLine, Layers, Palette, Type as TypeIcon, Monitor, PanelLeft, ImageIcon, Scissors, Keyboard, ArrowBigUp, GripVertical,
} from "lucide-react";
import { useDisplay } from "../contexts/DisplayContext";
import { usePosSettings } from "../contexts/PosSettingsContext";
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
import { useClinicData, CATEGORY_EMOJI, type DrugStockLink } from "../contexts/ClinicDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useClinicProfile } from "../contexts/ClinicProfileContext";
import { useShortcutKeys, SHORTCUT_COMBOS, SHORTCUT_ACTIONS, comboLabel, actionByPath } from "../contexts/ShortcutsContext";
import { useTabPrefs, LOCKED_TABS, type TabScope } from "../contexts/TabPrefsContext";
import { OPD_TAB_META, IPD_TAB_META } from "../config/tabMeta";

// ─── Types ────────────────────────────────────────────────────────
type MainTab = "notify" | "master" | "users";
type MasterSub = "drugs" | "species" | "breeds" | "services" | "vaccines" | "wards" | "boarding";
type UsersSub = "rooms" | "personnel" | "roles" | "access";

interface Drug {
  id: number; code: string; name: string; genericName: string;
  category: string; unit: string; costPrice: number; sellPrice: number;
  minStock: number; active: boolean;
}
interface PetSpecies { id: number; code: string; name: string; icon: string; active: boolean; }
interface PetBreed   { id: number; name: string; speciesId: number; active: boolean; }
interface ServiceItem { id: number; code: string; name: string; category: string; price: number; active: boolean; }
interface VaccineItem { id: number; code: string; name: string; species: string; brand: string; intervalMonths: number; price: number; active: boolean; }
interface Room       { id: number; name: string; type: string; active: boolean; }
interface Personnel  { id: number; name: string; licenseNo: string; position: string; role: string; roomId: number | null; active: boolean; }

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
  { id:1, code:"V001", name:"พิษสุนัขบ้า",  species:"สุนัข, แมว", brand:"RabiVax",      intervalMonths:12, price:350, active:true },
  { id:2, code:"V002", name:"DHPP",         species:"สุนัข",       brand:"NovaVax",      intervalMonths:12, price:600, active:true },
  { id:3, code:"V003", name:"FVRCP",        species:"แมว",         brand:"FelisGuard",   intervalMonths:12, price:550, active:true },
  { id:4, code:"V004", name:"บอร์เดเทลลา", species:"สุนัข",       brand:"KennelShield", intervalMonths:6,  price:400, active:true },
  { id:5, code:"V005", name:"เลปโตสไปรา",  species:"สุนัข",       brand:"LeptoVax",     intervalMonths:12, price:450, active:true },
  { id:6, code:"V006", name:"FeLV",         species:"แมว",         brand:"FelisGuard",   intervalMonths:12, price:500, active:true },
];
const INIT_ROOMS: Room[] = [
  { id:1, name:"ห้องตรวจ A",  type:"ห้องตรวจ",    active:true  },
  { id:2, name:"ห้องตรวจ B",  type:"ห้องตรวจ",    active:true  },
  { id:3, name:"ห้องผ่าตัด",  type:"ห้องผ่าตัด",  active:true  },
  { id:4, name:"ห้องพักฟื้น", type:"ห้องพักฟื้น", active:true  },
  { id:5, name:"ห้องแล็บ",    type:"ห้องแล็บ",    active:false },
];
const INIT_PERSONNEL: Personnel[] = [
  { id:1, name:"สพ.ว. สมชาย สุขใจ", licenseNo:"ว.12345", position:"สัตวแพทย์",       role:"สัตวแพทย์", roomId:1,    active:true },
  { id:2, name:"สพ.ว. สุภา วงศ์ดี",  licenseNo:"ว.23456", position:"สัตวแพทย์",       role:"สัตวแพทย์", roomId:2,    active:true },
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
function Modal({ open, title, subtitle, icon, onClose, onSave, canSave, size = "md", footerLeft, children }: {
  open: boolean; title: string; subtitle?: string; icon?: React.ReactNode;
  onClose: () => void; onSave: () => void;
  canSave: boolean; size?: keyof typeof MODAL_W; footerLeft?: React.ReactNode; children: React.ReactNode;
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
              <div className="vet-modal-footer rounded-b-3xl">
                {footerLeft && <div className="mr-auto min-w-0">{footerLeft}</div>}
                <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>
                  ยกเลิก
                </button>
                <button onClick={onSave} disabled={!canSave} className="vet-btn vet-btn-primary btn-green" style={{ width: 110 }}>
                  <Check className="w-[16px] h-[16px]" />
                  บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
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
        sourceType: "drug", sourceId: editing?.id ?? 0,
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
  const cats = ["ยาปฏิชีวนะ","สเตียรอยด์","ยาแก้ปวด NSAID","ยาขับปัสสาวะ","วิตามิน","ฮอร์โมน","ยาทาภายนอก","อื่นๆ"];
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
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อยา / รหัสยา..." className="vet-search pl-9 w-full sm:w-64" />
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
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f0fdf9] to-[#d1fae5] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#a7f3d0]/40">
                        <Pill className="w-4 h-4 text-(--brand)" />
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
  const empty: ServiceItem = { id:0, code:"", name:"", category:"ทั่วไป", price:0, active:true, unit:"ชิ้น" };
  const [form, setForm]     = useState<ServiceItem>(empty);
  const set = <K extends keyof ServiceItem>(k: K, v: ServiceItem[K]) => setForm(f => ({ ...f, [k]: v }));
  const cats = ["ทั่วไป","แล็บ","Medical Imaging","การรักษา","วอร์ด","ศัลยกรรม","ทันตกรรม","ค่าเวชภัณฑ์ที่ไม่ใช่ยา","Grooming","อื่นๆ"];
  const svcUnits = ["ชิ้น","ครั้ง","ชุด","อัน","ม้วน","หลอด","ขวด","แผ่น","คู่","กล่อง"];
  /* ค่าเวชภัณฑ์ที่มิใช่ยาเป็นของนับสต๊อกได้ → ติ๊กส่งเข้าคลังไว้ให้เลย */
  const [toStock, setToStock] = useState(false);

  /* หมวดในคลังที่จะสร้างให้ — Grooming ไปคลังอาบน้ำ-ตัดขน ที่เหลือเป็นอุปกรณ์/เวชภัณฑ์ */
  const stockCat = form.category === "Grooming" ? "Grooming" : "อุปกรณ์";

  const openAdd  = () => { setEditing(null); setForm(empty); setToStock(false); setOpen(true); };
  const openEdit = (s: ServiceItem) => { setEditing(s); setForm({ unit: "ชิ้น", ...s }); setToStock(false); setOpen(true); };
  const handleSave = () => {
    if (toStock && form.name.trim()) {
      const { product, created } = addStockItem({
        name: form.name, unit: form.unit || "ชิ้น",
        category: stockCat, categoryEmoji: CATEGORY_EMOJI[stockCat],
        sellPrice: form.price, sourceType: "service", sourceId: editing?.id ?? 0,
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
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาบริการ..." className="vet-search pl-9 w-full sm:w-64" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["รหัส","ชื่อบริการ","หมวดหมู่","ราคา (฿)","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{s.code}</td>
                  <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{s.name}</td>
                  <td className="px-4 py-2.5"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.category}</span></td>
                  <td className="px-4 py-2.5 text-gray-800" style={{ fontWeight:500 }}>฿{s.price.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><StatusBadge active={s.active} /></td>
                  <td className="px-4 py-2.5">
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
          <div><label className={labelCls}>ราคา (฿)</label><input type="number" className={inputCls} value={form.price} onChange={e => set("price", Number(e.target.value))} /></div>
          <div className="flex items-center gap-3 col-span-2"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section: วัคซีน ─────────────────────────────────────────────
function VaccinesSection() {
  const { showSnackbar } = useSnackbar();
  const [items, setItems]   = useState<VaccineItem[]>(INIT_VACCINES);
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<VaccineItem | null>(null);
  const empty: VaccineItem  = { id:0, code:"", name:"", species:"", brand:"", intervalMonths:12, price:0, active:true };
  const [form, setForm]     = useState<VaccineItem>(empty);
  const set = <K extends keyof VaccineItem>(k: K, v: VaccineItem[K]) => setForm(f => ({ ...f, [k]: v }));

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (v: VaccineItem) => { setEditing(v); setForm({ ...v }); setOpen(true); };
  const handleSave = () => {
    if (editing) { setItems(vs => vs.map(v => v.id === editing.id ? form : v)); showSnackbar("success", "แก้ไขข้อมูลวัคซีนเรียบร้อย"); }
    else { setItems(vs => [...vs, { ...form, id: nextId(vs) }]); showSnackbar("success", "เพิ่มวัคซีนเรียบร้อย"); }
    setOpen(false);
  };
  const handleDelete = (id: number) => { setItems(vs => vs.filter(v => v.id !== id)); showSnackbar("success", "ลบวัคซีนเรียบร้อย"); };

  return (
    <div className="space-y-3">
      {/* Section title + add */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#22d3ee,#0891b2)",
              boxShadow: "0 4px 12px rgba(8,145,178,0.25), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <Syringe className="w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: "calc(13.5px * var(--fs))", fontWeight: 700 }}>ทะเบียนวัคซีน</p>
            <p className="text-gray-400" style={{ fontSize: "calc(10.5px * var(--fs))", fontWeight: 500, letterSpacing: "0.4px" }}>Vaccine Registry · {items.length} รายการ</p>
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
          <Plus className="w-3.5 h-3.5" /> เพิ่มวัคซีน
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["รหัส","ชื่อวัคซีน","ชนิดสัตว์","ยี่ห้อ","ระยะฉีดซ้ำ","ราคา (฿)","สถานะ","จัดการ"].map(h => <th key={h} className="text-left px-3 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">{v.code}</td>
                  <td className="px-3 py-2.5 text-gray-800" style={{ fontWeight:500 }}>{v.name}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{v.species}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{v.brand}</td>
                  <td className="px-3 py-2.5"><span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{v.intervalMonths} เดือน</span></td>
                  <td className="px-3 py-2.5 text-gray-800 text-xs" style={{ fontWeight:500 }}>฿{v.price.toLocaleString()}</td>
                  <td className="px-3 py-2.5"><StatusBadge active={v.active} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(v)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(v.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editing ? "แก้ไขข้อมูลวัคซีน" : "เพิ่มวัคซีน"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<Syringe className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>รหัส <span className="required">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="V001" /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อวัคซีน <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="พิษสุนัขบ้า" /></div>
          <div className="col-span-2"><label className={labelCls}>ชนิดสัตว์ (คั่นด้วยจุลภาค)</label><input className={inputCls} value={form.species} onChange={e => set("species", e.target.value)} placeholder="สุนัข, แมว" /></div>
          <div><label className={labelCls}>ยี่ห้อ</label><input className={inputCls} value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="ยี่ห้อ..." /></div>
          <div><label className={labelCls}>ระยะฉีดซ้ำ (เดือน)</label><input type="number" className={inputCls} value={form.intervalMonths} onChange={e => set("intervalMonths", Number(e.target.value))} /></div>
          <div><label className={labelCls}>ราคา (฿)</label><input type="number" className={inputCls} value={form.price} onChange={e => set("price", Number(e.target.value))} /></div>
          <div className="flex items-center gap-3 pt-2"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
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

// ─── Section: บุคลากร ─────────────────────────────────────────────
function PersonnelSection({ personnel, setPersonnel, rooms }: { personnel: Personnel[]; setPersonnel: React.Dispatch<React.SetStateAction<Personnel[]>>; rooms: Room[] }) {
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Personnel | null>(null);
  const empty: Personnel = { id:0, name:"", licenseNo:"", position:"สัตวแพทย์", role:"สัตวแพทย์", roomId:null, active:true };
  const [form, setForm] = useState<Personnel>(empty);
  const set = <K extends keyof Personnel>(k: K, v: Personnel[K]) => setForm(f => ({ ...f, [k]: v }));
  const positions = ["สัตวแพทย์","ผู้ช่วยสัตวแพทย์","เจ้าหน้าที่","พยาบาลสัตว์","ผู้ดูแลระบบ"];
  const roles = ["สัตวแพทย์","เจ้าหน้าที่","แอดมิน"];

  const roleColor = (r: string) => r === "แอดมิน" ? "bg-red-100 text-red-600" : r === "สัตวแพทย์" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600";

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Personnel) => { setEditing(p); setForm({ ...p }); setOpen(true); };
  const handleSave = () => {
    if (editing) { setPersonnel(ps => ps.map(p => p.id === editing.id ? form : p)); showSnackbar("success", "แก้ไขข้อมูลบุคลากรเรียบร้อย"); }
    else { setPersonnel(ps => [...ps, { ...form, id: nextId(ps) }]); showSnackbar("success", "เพิ่มบุคลากรเรียบร้อย"); }
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
interface DxItem {
  id: number;
  name: string;         // ชื่อรายการ เช่น Chest PA
  chargeName: string;   // ชื่อค่าใช้จ่าย (dropdown)
  group: string;        // กลุ่มรายการ (dropdown — ใช้กับ Medical Imaging)
  unit?: string;        // หน่วย (ใช้กับ Lab เช่น test/หลอด)
  priceOpd: number;     // ราคา OPD
  priceIpd: number;     // ราคา IPD
  active: boolean;      // เปิดใช้งาน
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
  xray: [
    { id: 1, name: "Chest PA",            chargeName: "ค่า Medical Imaging",      group: "Medical Imaging",      priceOpd: 220,  priceIpd: 220,  active: true },
    { id: 2, name: "Chest Lateral",       chargeName: "ค่า Medical Imaging",      group: "Medical Imaging",      priceOpd: 220,  priceIpd: 220,  active: true },
    { id: 3, name: "Abdomen VD",          chargeName: "ค่า Medical Imaging",      group: "Medical Imaging",      priceOpd: 250,  priceIpd: 250,  active: true },
    { id: 4, name: "Ultrasound ช่องท้อง", chargeName: "ค่า Ultrasound", group: "Ultrasound", priceOpd: 800,  priceIpd: 900,  active: true },
    { id: 5, name: "CT สมอง",             chargeName: "ค่า CT Scan",    group: "CT",         priceOpd: 5000, priceIpd: 5000, active: false },
  ],
  lab: [
    { id: 1, name: "CBC",             chargeName: "ค่าตรวจเลือด",        group: "Hematology",   unit: "test",  priceOpd: 400,  priceIpd: 400,  active: true },
    { id: 2, name: "Blood Chemistry", chargeName: "ค่าตรวจเลือด",        group: "Chemistry",    unit: "test",  priceOpd: 800,  priceIpd: 800,  active: true },
    { id: 3, name: "Electrolyte",     chargeName: "ค่าตรวจเลือด",        group: "Electrolyte",  unit: "test",  priceOpd: 600,  priceIpd: 600,  active: true },
    { id: 4, name: "Urinalysis",      chargeName: "ค่าตรวจปัสสาวะ",      group: "Urinalysis",   unit: "ตัวอย่าง", priceOpd: 300,  priceIpd: 300,  active: true },
    { id: 5, name: "Culture",         chargeName: "ค่าเพาะเชื้อ",         group: "Microbiology", unit: "ตัวอย่าง", priceOpd: 1200, priceIpd: 1200, active: true },
    { id: 6, name: "Cytology",        chargeName: "ค่าตรวจเซลล์/ชิ้นเนื้อ", group: "Cytology",     unit: "แผ่น (slide)", priceOpd: 700, priceIpd: 700, active: false },
  ],
};
const DX_STORE_KEY = "ehp_dx_items_v1";
const loadDxItems = (): Record<DxKind, DxItem[]> => {
  try {
    const r = localStorage.getItem(DX_STORE_KEY);
    if (r) {
      const p = JSON.parse(r);
      return {
        xray: p.xray ?? DX_SEED.xray,
        // lab เก่าที่บันทึกก่อนมีช่อง "หน่วย" — เติม default ให้
        lab: (p.lab ?? DX_SEED.lab).map((it: DxItem) => ({ unit: "test", ...it })),
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

function XrayLabSection({ kind }: { kind: DxKind }) {
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
function DxItemModal({ kind, item, onClose, onSave }: { kind: DxKind; item: DxItem | null; onClose: () => void; onSave: (d: DxItem, isNew: boolean) => void }) {
  const isNew = !item;
  const [name, setName] = useState(item?.name ?? "");
  const [chargeName, setChargeName] = useState(item?.chargeName ?? DX_CHARGES[kind][0]);
  const [group, setGroup] = useState(item?.group ?? DX_GROUPS[kind][0]);
  const [unit, setUnit] = useState(item?.unit ?? LAB_UNITS[0]);
  const [priceOpd, setPriceOpd] = useState(item?.priceOpd ?? 0);
  const [priceIpd, setPriceIpd] = useState(item?.priceIpd ?? 0);
  const [active, setActive] = useState(item?.active ?? true);

  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-[460px] vet-modal relative" onClick={e => e.stopPropagation()}>
          <div className="vet-modal-header rounded-t-3xl">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="vet-modal-header-icon">{kind === "xray" ? <ScanLine className="w-[20px] h-[20px] text-white" /> : <FlaskConical className="w-[20px] h-[20px] text-white" />}</div>
                <div>
                  <h2 className="vet-section-title">{isNew ? "เพิ่ม" : "แก้ไข"}รายการ {kind === "xray" ? "Medical Imaging" : "Lab"}</h2>
                  <p className="vet-tiny mt-[2px]">{kind === "xray" ? "ชื่อรายการ · ค่าใช้จ่าย · กลุ่ม · ราคา OPD/IPD" : "ชื่อรายการ · หน่วย · ค่าใช้จ่าย (Non-Drug Items)"}</p>
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
              <div className="grid grid-cols-2 gap-3">
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
              </div>
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
            <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>ยกเลิก</button>
            <button
              onClick={() => { if (!name.trim()) return; onSave({ id: item?.id ?? 0, name: name.trim(), chargeName, group, unit: kind === "lab" ? unit : undefined, priceOpd, priceIpd, active }, isNew); }}
              disabled={!name.trim()}
              className="vet-btn vet-btn-primary btn-green disabled:opacity-40" style={{ width: 110 }}>
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
            <button onClick={onClose} className="vet-btn vet-btn-secondary" style={{ width: 110 }}>ยกเลิก</button>
            <button
              onClick={() => { if (!canSave) return; onSave({ id: profile?.id ?? 0, name: name.trim(), active, itemIds: ids }, isNew); }}
              disabled={!canSave}
              className="vet-btn vet-btn-primary btn-green disabled:opacity-40" style={{ width: 110 }}>
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
const SectionHead = ({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) => (
  <div className="flex items-baseline gap-2 mb-3">
    <span className="self-center flex-shrink-0">{icon}</span>
    <span className="text-[13px] text-gray-800" style={{ fontWeight: 700 }}>{title}</span>
    {hint && <span className="text-[11px] text-gray-400 truncate">{hint}</span>}
  </div>
);

function DisplaySection() {
  const { showSnackbar } = useSnackbar();
  const { lang, setLang } = useLang();
  const { themeKey, fontKey, sizeKey, sbStyle, sbIcon, loginBg, setTheme, setFont, setSize, setSbStyle, setSbIcon, setLoginBg, themes, fonts, sizes } = useDisplay();
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
        <div className={"w-[96px] flex-shrink-0 flex flex-col py-2.5 px-2 gap-2 " + (sbStyle === "float" ? "rounded-xl m-1.5 shadow-lg" : "")} style={{ background: "var(--sb-bg)" }}>
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
          <div className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-2" style={{
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
            const Swatch = ({ th }: { th: (typeof themes)[number] }) => {
              const on = th.key === themeKey;
              return (
                <button
                  onClick={() => { setTheme(th.key); showSnackbar("success", `เปลี่ยนธีมเป็น "${th.label}" แล้ว`); }}
                  title={th.label}
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
              );
            };
            const mains = themes.filter(t => !t.pastel);
            const pastels = themes.filter(t => t.pastel);
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
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${activeTheme.heroFrom}, ${activeTheme.heroTo})` }} />
                  <p className="text-[11.5px] text-gray-500">ธีมปัจจุบัน · <span style={{ color: "var(--brand-dark)", fontWeight: 700 }}>{activeTheme.label}</span></p>
                </div>
              </>
            );
          })()}
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

        {/* ── ภาพพื้นหลังหน้าเข้าสู่ระบบ ── */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <SectionHead icon={<ImageIcon className="w-4 h-4 text-[#7c3aed]" />} title="ภาพพื้นหลังหน้าล็อกอิน" hint={`${LOGIN_BACKGROUNDS.length} แบบ`} />
          <div className="grid grid-cols-2 gap-2.5">
            {LOGIN_BACKGROUNDS.map(bg => {
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
  const [view, setView] = useState<SettingView>("menu");

  // shared state (lifted so sub-sections can share)
  const [species,   setSpecies]   = useState<PetSpecies[]>(INIT_SPECIES);
  const [breeds,    setBreeds]    = useState<PetBreed[]>(INIT_BREEDS);
  const [rooms,     setRooms]     = useState<Room[]>(INIT_ROOMS);
  const [personnel, setPersonnel] = useState<Personnel[]>(INIT_PERSONNEL);

  const { t } = useLang();

  // ── Menu groups ────────────────────────────────────────────────
  type MenuItem = {
    key: SettingView;
    label: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
    grad: string;       // CSS gradient for icon background
    accent: string;     // accent border color (rgba)
  };
  const groups: { key: string; title: string; en: string; items: MenuItem[] }[] = [
    {
      key: "notify",
      title: t("settings.tab.notify"),
      en: "System settings",
      items: [
        { key: "clinic", label: "ข้อมูลคลินิก", sub: "ชื่อ · รหัส · โลโก้", icon: Building2,
          grad: "linear-gradient(135deg,var(--brand),var(--brand-dark))", accent: "color-mix(in srgb, var(--brand-dark) 35%, transparent)" },
        { key: "notify", label: t("settings.sub.notify"), sub: t("settings.sub.notifyDesc"), icon: BellRing,
          grad: "linear-gradient(135deg,#fb923c,#ea580c)", accent: "rgba(234,88,12,0.35)" },
        { key: "display", label: "การแสดงผล", sub: t("settings.sub.displayDesc"), icon: Palette,
          grad: "linear-gradient(135deg,#818cf8,#7c3aed)", accent: "rgba(124,58,237,0.35)" },
        { key: "hotkeys", label: "คีย์ลัด", sub: "Shift + 1…0 · เลือกหน้าปลายทางเอง", icon: Keyboard,
          grad: "linear-gradient(135deg,#38bdf8,#0369a1)", accent: "rgba(3,105,161,0.35)" },
        { key: "tabs", label: "แท็บ OPD / IPD", sub: "เลือกแท็บที่แสดง · ลากสลับตำแหน่ง", icon: Layers,
          grad: "linear-gradient(135deg,#34d399,#059669)", accent: "rgba(5,150,105,0.35)" },
      ],
    },
    {
      key: "master",
      title: t("settings.tab.master"),
      en: "Master Data",
      items: [
        { key: "drugs",    label: t("settings.sub.drugs"),    sub: "Drug Registry",    icon: Pill,      grad: "linear-gradient(135deg,#60a5fa,#2563eb)", accent: "rgba(37,99,235,0.35)" },
        { key: "species",  label: t("settings.sub.species"),  sub: "Pet Species",      icon: PawPrint,  grad: "linear-gradient(135deg,#34d399,#059669)", accent: "rgba(5,150,105,0.35)" },
        { key: "breeds",   label: t("settings.sub.breeds"),   sub: "Breed Management", icon: Star,      grad: "linear-gradient(135deg,#a78bfa,#7c3aed)", accent: "rgba(124,58,237,0.35)" },
        { key: "services", label: t("settings.sub.services"), sub: "Service Pricing",  icon: Wrench,    grad: "linear-gradient(135deg,#fbbf24,#d97706)", accent: "rgba(217,119,6,0.35)" },
        { key: "vaccines", label: t("settings.sub.vaccines"), sub: "Vaccine Catalog",  icon: Syringe,   grad: "linear-gradient(135deg,#22d3ee,#0891b2)", accent: "rgba(8,145,178,0.35)" },
        { key: "wards",    label: t("settings.sub.wards"),    sub: "IPD Ward Setup",   icon: Bed,       grad: "linear-gradient(135deg,var(--brand),var(--brand-dark))", accent: "color-mix(in srgb, var(--brand-dark) 35%, transparent)" },
        { key: "boarding", label: "ข้อมูลฝากเลี้ยง",          sub: "Boarding Rooms",   icon: HomeIcon,  grad: "linear-gradient(135deg,#fb923c,#ea580c)", accent: "rgba(234,88,12,0.35)" },
        { key: "xrayitems", label: "รายการ Medical Imaging",            sub: "Medical Imaging Catalog",    icon: ScanLine,     grad: "linear-gradient(135deg,#38bdf8,#0284c7)", accent: "rgba(2,132,199,0.35)" },
        { key: "labitems",  label: "รายการ Lab",              sub: "Lab Catalog",      icon: FlaskConical, grad: "linear-gradient(135deg,#c084fc,#7e22ce)", accent: "rgba(126,34,206,0.35)" },
        { key: "labprofile", label: "Lab Profile",            sub: "Lab Bundles",      icon: Layers,       grad: "linear-gradient(135deg,#a78bfa,#6d28d9)", accent: "rgba(109,40,217,0.35)" },
      ],
    },
    {
      key: "pos",
      title: "ร้านค้า & POS",
      en: "Point of Sale",
      items: [
        { key: "finance", label: "ตั้งค่าการเงิน", sub: "VAT · ปัดเศษ", icon: Percent, grad: "linear-gradient(135deg,#38bdf8,#0369a1)", accent: "rgba(3,105,161,0.35)" },
        { key: "pos", label: "ตั้งค่าระบบ POS", sub: "แต้ม · เครื่องพิมพ์", icon: ShoppingCart, grad: "linear-gradient(135deg,#fbbf24,#d97706)", accent: "rgba(217,119,6,0.35)" },
        { key: "members", label: "ระดับสมาชิก", sub: "Silver · Gold · Platinum", icon: Crown, grad: "linear-gradient(135deg,#c084fc,#7c3aed)", accent: "rgba(124,58,237,0.35)" },
      ],
    },
    {
      key: "users",
      title: t("settings.tab.users"),
      en: "Users & Access",
      items: [
        { key: "rooms",     label: t("settings.sub.rooms"),     sub: "Room Management",     icon: Building2,  grad: "linear-gradient(135deg,#2dd4bf,#0d9488)", accent: "rgba(13,148,136,0.35)" },
        { key: "personnel", label: t("settings.sub.personnel"), sub: "Staff & Vets",        icon: UserCircle, grad: "linear-gradient(135deg,#818cf8,#4f46e5)", accent: "rgba(79,70,229,0.35)" },
        { key: "roles",     label: t("settings.sub.roles"),     sub: "Role Permissions",    icon: Shield,     grad: "linear-gradient(135deg,#fb7185,#e11d48)", accent: "rgba(225,29,72,0.35)" },
        { key: "access",    label: t("settings.sub.access"),    sub: "Room Access Control", icon: Lock,       grad: "linear-gradient(135deg,#fb923c,#ea580c)", accent: "rgba(234,88,12,0.35)" },
      ],
    },
  ];

  const allItems = groups.flatMap(g => g.items);
  const currentItem = allItems.find(it => it.key === view);
  const currentGroup = groups.find(g => g.items.some(it => it.key === view));
  const isMenu = view === "menu";

  return (
    <PageMotion className="flex flex-col h-full" >
      {isMenu ? (
        /* ── HERO (menu landing) ── */
        <PageItem className="p-4 pb-0 flex-shrink-0" >
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden"
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
              {groups.map((g, gi) => (
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
              {view === "hotkeys"   && <HotkeysSection />}
              {view === "tabs"      && <TabsSection />}
              {view === "notify"    && <NotifySection />}
              {view === "display"   && <DisplaySection />}
              {view === "drugs"     && <DrugsSection />}
              {view === "species"   && <SpeciesSection species={species} setSpecies={setSpecies} />}
              {view === "breeds"    && <BreedsSection breeds={breeds} setBreeds={setBreeds} species={species} />}
              {view === "services"  && <ServicesSection />}
              {view === "vaccines"  && <VaccinesSection />}
              {view === "wards"     && <WardsSection />}
              {view === "boarding"  && <BoardingRoomsSection />}
              {view === "pos"       && <PosSettingsSection onOpenMembers={() => setView("members")} />}
              {view === "finance"   && <FinanceSettingsSection />}
              {view === "members"   && <MemberLevelsSection />}
              {view === "xrayitems" && <XrayLabSection key="xray" kind="xray" />}
              {view === "labitems"  && <XrayLabSection key="lab" kind="lab" />}
              {view === "labprofile" && <LabProfileSection key="labprofile" />}
              {view === "rooms"     && <RoomsSection rooms={rooms} setRooms={setRooms} />}
              {view === "personnel" && <PersonnelSection personnel={personnel} setPersonnel={setPersonnel} rooms={rooms} />}
              {view === "roles"     && <RolesSection />}
              {view === "access"    && <AccessSection personnel={personnel} rooms={rooms} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageMotion>
  );
}
