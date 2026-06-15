import image_d0ed46269162105ec3b29e48ba732cdf2fa8a50e from 'figma:asset/d0ed46269162105ec3b29e48ba732cdf2fa8a50e.png'
import { useState, useEffect } from "react";
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
  Bell, Database, Users, Plus, Edit2, Trash2, Search,
  Shield, X, Building2, UserCircle, Syringe, Pill,
  Check, PawPrint, Wrench, ChevronRight, Lock,
  BellRing, ToggleLeft, ToggleRight, AlertCircle, Star,
  Bed, Power, Pencil, Settings as SettingsIcon, Sparkles,
  ArrowLeft, Home as HomeIcon,
} from "lucide-react";
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
import { useClinicData } from "../contexts/ClinicDataContext";

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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[#19a589]" : "bg-gray-200"}`}
    >
      <span className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${active ? "bg-[#19a589]/15 text-[#0d7c66]" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 500 }}>
      {active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
    </span>
  );
}

const inputCls = "vet-input";
const selectCls = "vet-select";
const labelCls = "vet-label";
const nextId = (arr: { id: number }[]) => Math.max(0, ...arr.map(x => x.id)) + 1;

// ─── Modal Wrapper ────────────────────────────────────────────────
function Modal({ open, title, subtitle, icon, onClose, onSave, canSave, children }: {
  open: boolean; title: string; subtitle?: string; icon?: React.ReactNode;
  onClose: () => void; onSave: () => void;
  canSave: boolean; children: React.ReactNode;
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
            transition={{ duration: 0.2 }}
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
              className="w-full max-w-md vet-modal"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[100px] h-[100px] opacity-[0.04] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(25,165,137,1) 0%, transparent 70%)" }} />
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
        <div className="mt-3 inline-flex items-center gap-2.5 bg-[#f0fbf8] rounded-xl px-3.5 py-2 border border-[#19a589]/15">
          <span className="text-[12px] text-gray-600">แจ้งเตือนล่วงหน้า</span>
          <input
            type="number" min={1} max={30} value={vaccineDays}
            onChange={e => setVaccineDays(Number(e.target.value))}
            className="w-14 border border-[#19a589]/30 rounded-lg px-2 py-1 text-[12.5px] text-center focus:outline-none focus:ring-2 focus:ring-[#19a589]/30 bg-white"
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
        <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>ระบบแจ้งเตือนอัตโนมัติ</p>
        <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>
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
                border: `1px solid ${r.enabled ? "rgba(25,165,137,0.20)" : "#f3f4f6"}`,
                boxShadow: r.enabled
                  ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(25,165,137,0.06)"
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
  const { drugs, setDrugs } = useClinicData();
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<Drug | null>(null);
  const empty: Drug = { id:0, code:"", name:"", genericName:"", category:"ยาปฏิชีวนะ", unit:"แผง", costPrice:0, sellPrice:0, minStock:10, active:true };
  const [form, setForm]     = useState<Drug>(empty);

  const set = <K extends keyof Drug>(k: K, v: Drug[K]) => setForm(f => ({ ...f, [k]: v }));
  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (d: Drug) => { setEditing(d); setForm({ ...d }); setOpen(true); };
  const handleSave = () => {
    if (editing) {
      setDrugs(ds => ds.map(d => d.id === editing.id ? form : d));
      showSnackbar("success", "แก้ไขข้อมูลยาเรียบร้อย");
    } else {
      setDrugs(ds => [...ds, { ...form, id: nextId(ds) }]);
      showSnackbar("success", "เพิ่มรายการยาเรียบร้อย");
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>รายการยา</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>Drug Registry · {drugs.length} รายการ</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
            border: "1px solid rgba(253,186,116,0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
                    <span className="inline-flex items-center text-[11px] font-mono text-[#6a7282] bg-[#f3f4f6] group-hover:bg-white px-2 py-0.5 rounded-md border border-[#e5e7eb] group-hover:border-[#19a589]/20 transition-all">
                      {d.code}
                    </span>
                  </td>
                  {/* ชื่อยา */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f0fdf9] to-[#d1fae5] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#a7f3d0]/40">
                        <Pill className="w-4 h-4 text-[#19a589]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] text-[#1e2939] truncate" style={{ fontWeight: 600 }}>{d.name}</span>
                        <span className="text-[11px] text-[#9ca3af] truncate mt-0.5">{d.genericName || "—"}</span>
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
                      <span className="text-[13px] text-[#19a589]" style={{ fontWeight: 700 }}>฿{d.sellPrice.toLocaleString()}</span>
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
      <Modal open={open} title={editing ? "แก้ไขข้อมูลยา" : "เพิ่มรายการยา"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<Pill className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>รหัสยา <span className="required">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="D001" /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อยา <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ชื่อยา..." /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อสามัญ (Generic Name)</label><input className={inputCls} value={form.genericName} onChange={e => set("genericName", e.target.value)} placeholder="Generic name..." /></div>
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
          <div><label className={labelCls}>ราคาทุน (฿)</label><input type="number" className={inputCls} value={form.costPrice} onChange={e => set("costPrice", Number(e.target.value))} /></div>
          <div><label className={labelCls}>ราคาขาย (฿)</label><input type="number" className={inputCls} value={form.sellPrice} onChange={e => set("sellPrice", Number(e.target.value))} /></div>
          <div><label className={labelCls}>Stock ขั้นต่ำ</label><input type="number" className={inputCls} value={form.minStock} onChange={e => set("minStock", Number(e.target.value))} /></div>
          <div className="flex items-center gap-3 pt-5">
            <Toggle checked={form.active} onChange={v => set("active", v)} />
            <span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>ทะเบียนประเภทสัตว์เลี้ยง</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>Species Registry · {species.length} รายการ</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
            border: "1px solid rgba(253,186,116,0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>ทะเบียนพันธุ์สัตว์</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>
              Breed Registry · {breeds.length} รายการ{filterSp !== "all" ? ` · กรอง: ${filtered.length}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
            border: "1px solid rgba(253,186,116,0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มพันธุ์
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
        {/* ── Filter Bar ── */}
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
          <span className="text-[11.5px] text-gray-500" style={{ fontWeight: 500 }}>กรองตามประเภท</span>
          <select className="border border-[#e5e7eb] rounded-full px-3 py-1.5 text-xs text-[#1e2939] focus:outline-none focus:ring-2 focus:ring-[#19a589]/30 bg-white"
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
  const { services: items, setServices: setItems } = useClinicData();
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const empty: ServiceItem = { id:0, code:"", name:"", category:"ทั่วไป", price:0, active:true };
  const [form, setForm]     = useState<ServiceItem>(empty);
  const set = <K extends keyof ServiceItem>(k: K, v: ServiceItem[K]) => setForm(f => ({ ...f, [k]: v }));
  const cats = ["ทั่วไป","แล็บ","เอกซเรย์","การรักษา","วอร์ด","ศัลยกรรม","ทันตกรรม","อื่นๆ"];

  const openAdd  = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: ServiceItem) => { setEditing(s); setForm({ ...s }); setOpen(true); };
  const handleSave = () => {
    if (editing) { setItems(ss => ss.map(s => s.id === editing.id ? form : s)); showSnackbar("success", "แก้ไขค่าบริการเรียบร้อย"); }
    else { setItems(ss => [...ss, { ...form, id: nextId(ss) }]); showSnackbar("success", "เพิ่มค่าบริการเรียบร้อย"); }
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>ทะเบียนค่าบริการ</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>Service Registry · {items.length} รายการ</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
            border: "1px solid rgba(253,186,116,0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
      <Modal open={open} title={editing ? "แก้ไขค่าบริการ" : "เพิ่มค่าบริการ"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<Wrench className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>รหัส <span className="required">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="SV001" /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อบริการ <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ชื่อบริการ..." /></div>
          <div><label className={labelCls}>หมวดหมู่</label><select className={selectCls} value={form.category} onChange={e => set("category", e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>ทะเบียนวัคซีน</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>Vaccine Registry · {items.length} รายการ</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
            border: "1px solid rgba(253,186,116,0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>ทะเบียนห้องทำงาน</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>
              Room Registry · {rooms.length} ห้อง · เปิดใช้งาน {rooms.filter(r => r.active).length}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
            border: "1px solid rgba(253,186,116,0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
                border: `1px solid ${r.active ? "rgba(25,165,137,0.20)" : "#f3f4f6"}`,
                boxShadow: r.active
                  ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(25,165,137,0.06)"
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>ทะเบียนบุคลากร</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>
              Personnel Registry · {personnel.length} คน · เปิดใช้งาน {personnel.filter(p => p.active).length}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
            border: "1px solid rgba(253,186,116,0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#19a589] to-[#0d7c66] flex items-center justify-center flex-shrink-0">
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
        className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-all border ${checked ? "bg-[#19a589] border-[#19a589]" : "border-gray-200 hover:border-gray-300"} ${disabled ? "opacity-60 cursor-default" : "cursor-pointer"}`}>
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>สิทธิ์การเข้าถึงตามบทบาท</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>Role Permissions · 3 บทบาท × {perms.length} ฟีเจอร์</p>
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
        style={{ fontWeight:600, background:"linear-gradient(135deg,#19a589,#0d7c66)", boxShadow:"0 2px 12px rgba(25,165,137,0.3)" }}>
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
          <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>สิทธิ์การเข้าใช้ห้อง</p>
          <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>กำหนดว่าบุคลากรแต่ละคนสามารถเข้าใช้ห้องใดได้บ้าง · {personnel.length} คน × {activeRooms.length} ห้อง</p>
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
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#19a589] to-[#0d7c66] flex items-center justify-center flex-shrink-0">
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
                        className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto border transition-all ${access[`${p.id}-${r.id}`] ? "bg-[#19a589] border-[#19a589]" : "border-gray-200 hover:border-gray-300"}`}>
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
        style={{ fontWeight:600, background:"linear-gradient(135deg,#19a589,#0d7c66)", boxShadow:"0 2px 12px rgba(25,165,137,0.3)" }}>
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
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>จัดการ Ward (IPD)</h3>
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
                  {/* Top row */}
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50/50 transition-colors">
                    <button
                      onClick={() => setExpandedWardId(isExpanded ? null : w.id)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
                      title={isExpanded ? "ย่อ" : "ขยาย"}
                    >
                      <ChevronRight className="w-4 h-4 transition-transform" style={{ transform: isExpanded ? "rotate(90deg)" : undefined }} />
                    </button>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: w.enabled ? "linear-gradient(135deg,rgba(25,165,137,0.15),rgba(13,124,102,0.10))" : "#f3f4f6",
                        color: w.enabled ? "#0d7c66" : "#9ca3af",
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
                          className="vet-input"
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

                    <button
                      onClick={() => toggleWard(w.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] transition-all flex-shrink-0"
                      style={{
                        fontWeight: 700,
                        color: w.enabled ? "#0d7c66" : "#9ca3af",
                        background: w.enabled ? "rgba(25,165,137,0.12)" : "#f3f4f6",
                        border: `1px solid ${w.enabled ? "rgba(25,165,137,0.30)" : "#e5e7eb"}`,
                      }}
                    >
                      <Power className="w-3 h-3" />
                      {w.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </button>

                    {!isEditing && (
                      <button onClick={() => handleStartEdit(w)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 flex-shrink-0" title="แก้ไขชื่อ">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isEditing && (
                      <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 flex-shrink-0" title="ยกเลิก">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleRemove(w)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 flex-shrink-0" title="ลบ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expanded cage section */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="border-t border-gray-100 bg-gray-50/40 p-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11.5px] text-gray-500" style={{ fontWeight: 600 }}>
                              ห้อง / กรง ({cageCount})
                            </span>
                            <button
                              onClick={() => { setCageFormWardId(cageFormWardId === w.id ? null : w.id); setNewCageId(""); setNewCageType("Small"); }}
                              className="vet-btn vet-btn-orange vet-btn-sm inline-flex items-center gap-1.5"
                              style={{ height: 32, padding: "0 14px" }}
                            >
                              <Plus className="w-3.5 h-3.5" /> เพิ่มห้อง
                            </button>
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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
                                      background: `${CAGE_STATUS_COLOR[c.status]}1a`,
                                      color: CAGE_STATUS_COLOR[c.status],
                                      border: `1px solid ${CAGE_STATUS_COLOR[c.status]}55`,
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
            <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>ข้อมูลฝากเลี้ยง</p>
            <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>
              Boarding Rooms · {boardingRooms.length} ห้อง/กรง · ว่าง {boardingRooms.filter(r => r.status === "ว่าง").length}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
            border: "1px solid rgba(253,186,116,0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
                background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "rgba(0,0,0,0.04)",
                border: on ? "1px solid #0d7c66" : "1px solid transparent",
                boxShadow: on ? "0 3px 10px rgba(25,165,137,0.22)" : "none",
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

// ─── Main Component ───────────────────────────────────────────────
type SettingView = "menu" | "notify" | MasterSub | UsersSub;

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
      en: "Notifications",
      items: [
        { key: "notify", label: t("settings.sub.notify"), sub: "Alert preferences", icon: BellRing,
          grad: "linear-gradient(135deg,#fb923c,#ea580c)", accent: "rgba(234,88,12,0.35)" },
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
        { key: "wards",    label: t("settings.sub.wards"),    sub: "IPD Ward Setup",   icon: Bed,       grad: "linear-gradient(135deg,#19a589,#0d7c66)", accent: "rgba(13,124,102,0.35)" },
        { key: "boarding", label: "ข้อมูลฝากเลี้ยง",          sub: "Boarding Rooms",   icon: HomeIcon,  grad: "linear-gradient(135deg,#fb923c,#ea580c)", accent: "rgba(234,88,12,0.35)" },
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
                radial-gradient(at 100% 0%, rgba(45,212,191,0.55) 0%, transparent 55%),
                radial-gradient(at 0% 100%, rgba(8,75,62,0.65) 0%, transparent 60%),
                linear-gradient(135deg, #1aa78b 0%, #0e5e4f 100%)
              `,
            }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)" }} />
              <div className="absolute -bottom-28 left-1/4 w-[260px] h-[260px] rounded-full" style={{ background: "radial-gradient(circle, rgba(45,212,191,0.35) 0%, transparent 70%)" }} />
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
                <h1 className="text-white" style={{ fontWeight: 800, fontSize: 25, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                  {t("settings.title")}
                </h1>
                <p className="text-white/75 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>{t("settings.subtitle")}</p>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontSize: 11.5,
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
            transition={{ duration: 0.35 }}
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
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              {groups.map((g, gi) => (
                <motion.section
                  key={g.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 + gi * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <div>
                      <p className="text-gray-900" style={{ fontSize: 13.5, fontWeight: 700 }}>{g.title}</p>
                      <p className="text-gray-400" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.4px" }}>{g.en} · {g.items.length} รายการ</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                              <p className="text-gray-900 truncate" style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 }}>
                                {item.label}
                              </p>
                              <p className="text-gray-400 mt-0.5 truncate" style={{ fontSize: 11, fontWeight: 500 }}>
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
              transition={{ duration: 0.22 }}
            >
              {view === "notify"    && <NotifySection />}
              {view === "drugs"     && <DrugsSection />}
              {view === "species"   && <SpeciesSection species={species} setSpecies={setSpecies} />}
              {view === "breeds"    && <BreedsSection breeds={breeds} setBreeds={setBreeds} species={species} />}
              {view === "services"  && <ServicesSection />}
              {view === "vaccines"  && <VaccinesSection />}
              {view === "wards"     && <WardsSection />}
              {view === "boarding"  && <BoardingRoomsSection />}
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
