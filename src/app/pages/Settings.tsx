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
} from "lucide-react";
import { PageMotion, PageItem } from "../components/PageMotion";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useClinicData } from "../contexts/ClinicDataContext";

// ─── Types ────────────────────────────────────────────────────────
type MainTab = "notify" | "master" | "users";
type MasterSub = "drugs" | "species" | "breeds" | "services" | "vaccines";
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

  const save = () => showSnackbar("success", "บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อย");

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="relative flex items-center gap-3 px-6 overflow-hidden border-b border-[#f3f4f6]"
          style={{ height: 60, backgroundImage: "linear-gradient(176.455deg, rgb(25, 165, 137) 0%, rgb(13, 124, 102) 100%)" }}>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="relative shrink-0 size-[15.996px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
                  <g clipPath="url(#clip0_notify)">
                    <path d={svgPathsNotify.p3050ad80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                    <path d={svgPathsNotify.p189e2300} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                    <path d={svgPathsNotify.p18aa2900} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                    <path d={svgPathsNotify.p1acd4e00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  </g>
                  <defs>
                    <clipPath id="clip0_notify">
                      <rect fill="white" height="15.996" width="15.996" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>ระบบแจ้งเตือนอัตโนมัติ</span>
            </div>
            <span className="text-xs pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Notification Settings</span>
          </div>
          <div className="absolute pointer-events-none" style={{ width: 150, height: 150, bottom: -12, right: -0.28, opacity: 0.7 }}>
            <img alt="" className="absolute inset-0 max-w-none object-cover size-full pointer-events-none select-none" src={imgBellDecor} />
          </div>
        </div>
        {/* Items */}
        <div className="divide-y divide-gray-50">
          {/* วัคซีน */}
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Syringe className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>วัคซีนถึงกำหนด</span>
                  <p className="text-xs text-gray-400 mt-0.5">แจ���งเตือนเจ้าของสัตว์เลี้ยงเมื่อวัคซีนใกล้ถึงกำหนดฉีด</p>
                  {vaccineOn && (
                    <div className="mt-3 inline-flex items-center gap-2.5 bg-[#f0fbf8] rounded-xl px-4 py-2.5 border border-[#19a589]/15">
                      <span className="text-xs text-gray-500">แจ้งเตือนล่วงหน้า</span>
                      <input
                        type="number" min={1} max={30} value={vaccineDays}
                        onChange={e => setVaccineDays(Number(e.target.value))}
                        className="w-14 border border-[#19a589]/30 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#19a589]/30 bg-white"
                      />
                      <span className="text-xs text-gray-500">วัน</span>
                    </div>
                  )}
                </div>
              </div>
              <Toggle checked={vaccineOn} onChange={setVaccineOn} />
            </div>
          </div>
          {/* นัดหมาย */}
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>นัดหมายล่วงหน้า</span>
                    <span className="text-[10px] bg-orange-50 text-orange-400 px-2 py-0.5 rounded-full border border-orange-100">เร็วๆ นี้</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">แจ้งเตือนก่อนถึงวันนัดหมาย</p>
                </div>
              </div>
              <Toggle checked={apptOn} onChange={setApptOn} />
            </div>
          </div>
          {/* สต็อกต่ำ */}
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ยาและวัคซีนสต็อกต่ำ</span>
                    <span className="text-[10px] bg-red-50 text-red-400 px-2 py-0.5 rounded-full border border-red-100">เร็วๆ นี้</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">แจ้งเตือนเมื่อสินค้าต่ำกว่า stock ขั้นต่ำ</p>
                </div>
              </div>
              <Toggle checked={stockOn} onChange={setStockOn} />
            </div>
          </div>
        </div>
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ── Header Strip (Figma) ── */}
        <div className="relative flex items-center gap-3 px-6 overflow-hidden" style={{ height: 60, backgroundImage: "linear-gradient(174.852deg, rgb(59,130,246) 0%, rgba(29,78,216,0.5) 100%)", borderBottom: "0.633px solid #f3f4f6" }}>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 15.996 15.996">
                <g clipPath="url(#clip_drugs)">
                  <path d={svgPathsDrugs.p17774600} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d={svgPathsDrugs.p38b71c00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                </g>
                <defs><clipPath id="clip_drugs"><rect fill="white" height="15.996" width="15.996" /></clipPath></defs>
              </svg>
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>รายการยา</span>
            </div>
            <span className="text-xs pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Drug Registry</span>
          </div>
          <button onClick={openAdd}
            className="btn-add-outline flex items-center gap-1.5 px-4 h-8 rounded-full text-xs flex-shrink-0 border border-white/50 bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 active:opacity-80 z-10"
            style={{ color: "#e8802a", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5 text-[#e8802a]" />
            เพิ่มยา
          </button>
          <div className="absolute pointer-events-none" style={{ width: 150, height: 150, bottom: -24, right: -10, opacity: 0.7 }}>
            <img src={imgPillDecor} alt="" className="absolute inset-0 max-w-none object-cover w-full h-full pointer-events-none select-none" />
          </div>
        </div>
        {/* ── Search Bar ── */}
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อยา / รหัสยา..." className="vet-search pl-9 w-64" />
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
    </>
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative flex items-center gap-3 px-6 overflow-hidden" style={{ height: 60, backgroundImage: "linear-gradient(174.852deg, rgb(0,188,125) 0%, rgba(0,133,88,0.5) 100%)", borderBottom: "0.633px solid #f3f4f6" }}>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 15.996 15.996">
                <g clipPath="url(#clip_species)">
                  <path d={svgPathsSpecies.pc66bb00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d={svgPathsSpecies.p25a22bf0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d={svgPathsSpecies.pf93f200} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d={svgPathsSpecies.pc2e9d00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                </g>
                <defs><clipPath id="clip_species"><rect fill="white" height="15.996" width="15.996" /></clipPath></defs>
              </svg>
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>ทะเบียนประเภทสัตว์เลี้ยง</span>
            </div>
            <span className="text-xs pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Species Registry</span>
          </div>
          <button onClick={openAdd}
            className="btn-add-outline flex items-center gap-1.5 px-4 h-8 rounded-full text-xs flex-shrink-0 border border-white/50 bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 active:opacity-80 z-10"
            style={{ color: "#e8802a", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5 text-[#e8802a]" />
            เพิ่มประเภท
          </button>
          <div className="absolute pointer-events-none" style={{ width: 150, height: 150, bottom: -55, right: -30 }}>
            <img src={imgSpeciesDecor} alt="" className="absolute inset-0 max-w-none object-cover w-full h-full opacity-70 pointer-events-none select-none" />
          </div>
        </div>
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
    </>
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative flex items-center gap-3 px-6 overflow-hidden" style={{ height: 60, backgroundImage: "linear-gradient(174.852deg, rgb(139,92,246) 0%, rgba(124,58,237,0.5) 100%)", borderBottom: "0.633px solid #f3f4f6" }}>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 15.996 15.996">
                <g clipPath="url(#clip_breed)">
                  <path d={svgPathsBreed.p11e552f0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                </g>
                <defs><clipPath id="clip_breed"><rect fill="white" height="15.996" width="15.996" /></clipPath></defs>
              </svg>
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>ทะเบียนพันธุ์สัตว์</span>
            </div>
            <span className="text-xs pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Breed Registry</span>
          </div>
          <button onClick={openAdd}
            className="btn-add-outline flex items-center gap-1.5 px-4 h-8 rounded-full text-xs flex-shrink-0 border border-white/50 bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 active:opacity-80 z-10"
            style={{ color: "#e8802a", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5 text-[#e8802a]" />
            เพิ่มพันธุ์
          </button>
          <div className="absolute pointer-events-none" style={{ width: 150, height: 149, top: -60, right: -20 }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70">
              <img src={imgBreedDecor} alt="" className="absolute max-w-none pointer-events-none select-none" style={{ width: "121%", height: "121%", top: "-10.5%", left: "-10.5%" }} />
            </div>
          </div>
        </div>
        {/* ── Filter Bar ── */}
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
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
    </>
  );
}

// ─── Section: ค่าบริการ ───────────────────────────────────────────
function ServicesSection() {
  const { showSnackbar } = useSnackbar();
  const { services: items, setServices: setItems } = useClinicData();
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const empty: ServiceItem = { id:0, code:"", name:"", category:"ทั่ว��ป", price:0, active:true };
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative flex items-center gap-3 px-6 overflow-hidden" style={{ height: 60, backgroundImage: "linear-gradient(174.852deg, rgb(232,128,42) 0%, rgba(208,106,26,0.5) 100%)", borderBottom: "0.633px solid #f3f4f6" }}>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 15.996 15.996">
                <g clipPath="url(#clip_service)">
                  <path d={svgPathsService.p12ea7100} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                </g>
                <defs><clipPath id="clip_service"><rect fill="white" height="15.996" width="15.996" /></clipPath></defs>
              </svg>
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>ทะเบียนค่าบริการ</span>
            </div>
            <span className="text-xs pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Service Registry</span>
          </div>
          <button onClick={openAdd}
            className="btn-add-outline flex items-center gap-1.5 px-4 h-8 rounded-full text-xs flex-shrink-0 border border-white/50 bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 active:opacity-80 z-10"
            style={{ color: "#e8802a", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5 text-[#e8802a]" />
            เพิ่มบริการ
          </button>
          <div className="absolute pointer-events-none opacity-70" style={{ width: 150, height: 150, top: -16, right: -25 }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img src={imgServiceDecor} alt="" className="absolute max-w-none pointer-events-none select-none" style={{ width: "142%", height: "142%", top: "-20.99%", left: "-18.6%" }} />
            </div>
          </div>
        </div>
        {/* ── Search Bar ── */}
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาบริการ..." className="vet-search pl-9 w-64" />
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
    </>
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative flex items-center gap-3 px-6 overflow-hidden" style={{ height: 60, backgroundImage: "linear-gradient(175deg, rgb(0,184,219) 0%, rgba(0,161,192,0.5) 100%)", borderBottom: "0.633px solid #f3f4f6" }}>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 15.996 15.996">
                <g clipPath="url(#clip_vaccine)">
                  <path d="M11.997 1.333L14.663 3.999" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d="M11.3305 4.6655L13.33 2.666" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d={svgPathsVaccine.p3dd2000} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d={svgPathsVaccine.p2012d600} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d="M3.3325 12.6635L1.333 14.663" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                  <path d="M9.33099 2.666L13.33 6.66499" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
                </g>
                <defs><clipPath id="clip_vaccine"><rect fill="white" height="15.996" width="15.996" /></clipPath></defs>
              </svg>
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>ทะเบียนวัคซีน</span>
            </div>
            <span className="text-xs pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Vaccine Registry</span>
          </div>
          <button onClick={openAdd}
            className="btn-add-outline flex items-center gap-1.5 px-4 h-8 rounded-full text-xs flex-shrink-0 border border-white/50 bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 active:opacity-80 z-10"
            style={{ color: "#e8802a", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5 text-[#e8802a]" />
            เพิ่มวัคซีน
          </button>
          <div className="absolute pointer-events-none" style={{ width: 150, height: 150, top: -19.58, right: -0.02, opacity: 0.7 }}>
            <img src={imgVaccineDecor} alt="" className="absolute inset-0 max-w-none object-cover w-full h-full pointer-events-none select-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["รหัส","ชื่อวัคซีน","ชนิดสัตว์","ยี่ห้อ","ระยะฉีดซ้ำ","ราคา (฿)","สถ���นะ","จัดการ"].map(h => <th key={h} className="text-left px-3 py-3 text-xs text-gray-500" style={{ fontWeight:600 }}>{h}</th>)}</tr>
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
    </>
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative flex items-center gap-3 px-6 overflow-hidden border-b border-[#f3f4f6]"
          style={{ height: 60, backgroundImage: "linear-gradient(174.852deg, rgb(0, 187, 167) 0%, rgba(0, 147, 131, 0.5) 100%)" }}>
          <img src={imgTableDecor} alt="" className="absolute h-[149px] opacity-70 right-0 top-[-20px] w-[150px] object-cover pointer-events-none select-none" />
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>ทะเบียนห้องทำงาน</span>
            </div>
            <p className="text-xs mt-0.5 pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Room Registry</p>
          </div>
          <button onClick={openAdd}
            className="btn-add-outline relative z-10 flex items-center gap-1 px-4 h-8 rounded-full text-[#e8802a] text-xs flex-shrink-0 bg-white border border-[rgba(255,255,255,0.5)] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 active:opacity-80"
            style={{ fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5" />
            เพิ่มห้อง
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {rooms.map(r => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${r.active ? "bg-[#19a589]" : "bg-gray-400"}`}>
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-800" style={{ fontWeight:500 }}>{r.name}</p>
                  <p className="text-xs text-gray-400">{r.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Toggle checked={r.active} onChange={v => { setRooms(rs => rs.map(x => x.id === r.id ? { ...x, active: v } : x)); showSnackbar("success", v ? `เปิดใช้งาน ${r.name}` : `ปิดใช้งาน ${r.name}`); }} />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(r)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(r.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal open={open} title={editing ? "แก้ไขห้องทำงาน" : "เพิ่มห้องทำงาน"} subtitle={editing ? "แก้ไขข้อมูลแล้วกดบันทึก" : "กรอกข้อมูลให้ครบถ้วน"} icon={<Building2 className="w-[20px] h-[20px] text-white" />} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name}>
        <div><label className={labelCls}>ชื่อห้องทำงาน <span className="required">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ห้องตรวจ A" /></div>
        <div><label className={labelCls}>ประเภทห้อง</label><select className={selectCls} value={form.type} onChange={e => set("type", e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select></div>
        <div className="flex items-center gap-3"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
      </Modal>
    </>
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative flex items-center gap-3 px-6 overflow-hidden border-b border-[#f3f4f6]"
          style={{ height: 60, backgroundImage: "linear-gradient(174.852deg, rgb(139, 92, 246) 0%, rgba(124, 58, 237, 0.5) 100%)" }}>
          <img src={imgDoctorDecor} alt="" className="absolute h-[149px] opacity-70 right-[-22px] top-[-24px] w-[150px] object-cover pointer-events-none select-none" />
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>ทะเบียนบุคลากร</span>
            </div>
            <p className="text-xs mt-0.5 pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Personnel Registry</p>
          </div>
          <button onClick={openAdd}
            className="btn-add-outline relative z-10 flex items-center gap-1 px-4 h-8 rounded-full text-[#e8802a] text-xs flex-shrink-0 bg-white border border-[rgba(255,255,255,0.5)] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 active:opacity-80"
            style={{ fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5" />
            เพิ่มบุคลากร
          </button>
        </div>
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
    </>
  );
}

// ─── Section: กำหนดสิท��ิ์ Role ────────────────────────────────────
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
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative flex items-center gap-3 px-6 overflow-hidden border-b border-[#f3f4f6]"
          style={{ height: 60, backgroundImage: "linear-gradient(174.852deg, rgb(255, 32, 86) 0%, rgba(179, 19, 58, 0.5) 100%)" }}>
          <img src={imgKingCrownDecor} alt="" className="absolute opacity-70 right-0 top-[-15px] w-[120px] h-[120px] object-cover pointer-events-none select-none" />
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>สิทธิ์การเข้าถึงตามบทบาท</span>
            </div>
            <p className="text-xs mt-0.5 pl-6" style={{ color: "rgba(255,255,255,0.7)" }}>Role Permissions</p>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full flex-shrink-0 border"
            style={{ color: "rgba(255,255,255,0.9)", borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)" }}>
            <Shield className="w-3 h-3" /> สิทธิ์แอดมินแก้ไขไม่ได้
          </div>
        </div>
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
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative flex items-center gap-3 px-6 overflow-hidden border-b border-[#f3f4f6]"
          style={{ height: 60, backgroundImage: "linear-gradient(174.852deg, rgb(232, 128, 42) 0%, rgba(208, 106, 26, 0.5) 100%)" }}>
          <img src={imgUserShieldDecor} alt="" className="absolute opacity-70 right-0 top-0 w-[120px] h-[120px] object-cover pointer-events-none select-none" />
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-sm text-white" style={{ fontWeight: 700 }}>สิทธิ์การเข้าใช้</span>
            </div>
            <p className="text-xs mt-0.5 pl-6 truncate" style={{ color: "rgba(255,255,255,0.7)" }}>กำหนดว่าบุคลากรแต่ละคนสามารถเข้าใช้ห้องใดได้บ้าง</p>
          </div>
        </div>
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

// ─── Main Component ───────────────────────────────────────────────
export function Settings() {
  const [mainTab,   setMainTab]   = useState<MainTab>("notify");
  const [masterSub, setMasterSub] = useState<MasterSub>("drugs");
  const [usersSub,  setUsersSub]  = useState<UsersSub>("rooms");

  // shared state (lifted so sub-sections can share)
  const [species,   setSpecies]   = useState<PetSpecies[]>(INIT_SPECIES);
  const [breeds,    setBreeds]    = useState<PetBreed[]>(INIT_BREEDS);
  const [rooms,     setRooms]     = useState<Room[]>(INIT_ROOMS);
  const [personnel, setPersonnel] = useState<Personnel[]>(INIT_PERSONNEL);

  const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key:"notify", label:"ระบบแจ้งเตือน",     icon:<Bell className="w-4 h-4" /> },
    { key:"master", label:"ข้อมูลพื้นฐาน",     icon:<Database className="w-4 h-4" /> },
    { key:"users",  label:"ระบบผู้ใช้งาน",      icon:<Users className="w-4 h-4" /> },
  ];

  const masterSubs: { key: MasterSub; label: string; icon: React.ReactNode }[] = [
    { key:"drugs",    label:"รายการยา",       icon:<Pill className="w-3.5 h-3.5" /> },
    { key:"species",  label:"ประเภทสัตว์",    icon:<PawPrint className="w-3.5 h-3.5" /> },
    { key:"breeds",   label:"พันธุ์สัตว์",    icon:<Star className="w-3.5 h-3.5" /> },
    { key:"services", label:"ค่าบริการ",       icon:<Wrench className="w-3.5 h-3.5" /> },
    { key:"vaccines", label:"วัคซีน",         icon:<Syringe className="w-3.5 h-3.5" /> },
  ];

  const usersSubs: { key: UsersSub; label: string; icon: React.ReactNode }[] = [
    { key:"rooms",     label:"ห้องทำงาน",         icon:<Building2 className="w-3.5 h-3.5" /> },
    { key:"personnel", label:"บุคลากร",            icon:<UserCircle className="w-3.5 h-3.5" /> },
    { key:"roles",     label:"กำหนดสิทธิ์ Role",   icon:<Shield className="w-3.5 h-3.5" /> },
    { key:"access",    label:"สิทธิ์เข้าใช้งาน",  icon:<Lock className="w-3.5 h-3.5" /> },
  ];

  const activeSubs = mainTab === "master" ? masterSubs : mainTab === "users" ? usersSubs : [];
  const activeSub  = mainTab === "master" ? masterSub  : usersSub;

  return (
    <PageMotion className="flex flex-col h-full">
      {/* ── Header ── */}
      <PageItem className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-start sm:items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h1 className="text-gray-900" style={{ fontWeight:700 }}>ตั้งค่าระบบ</h1>
            <p className="text-xs text-gray-400 mt-0.5">จัดการข้อมูลพื้นฐาน • ผู้ใช้งาน • การแจ้งเตือน</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 flex-shrink-0">
            <Shield className="w-3 h-3" /> เฉพาะผู้��ูแลระบบ
          </div>
        </div>
        {/* Main tabs */}
        <div className="inline-flex items-center bg-white/90 rounded-full shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] p-1 gap-0">
          {mainTabs.map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all active:scale-95 ${mainTab === t.key ? "bg-[#19a589] text-white" : "text-[#6a7282] hover:text-gray-700"}`}
              style={{ fontWeight: mainTab === t.key ? 500 : 400 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </PageItem>

      {/* ── Content ── */}
      <div className="flex flex-1 overflow-hidden bg-[#FEFBF8]">
        {/* Sub nav (master & users only) */}
        {activeSubs.length > 0 && (
          <PageItem className="w-[320px] flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto py-4">
            {(() => {
              const meta: Record<string, { sub: string; color: string; bg: string }> = {
                drugs:     { sub: "Drug Registry",       color: "text-blue-500",    bg: "bg-blue-500"    },
                species:   { sub: "Pet Species",         color: "text-emerald-500", bg: "bg-emerald-500" },
                breeds:    { sub: "Breed Management",    color: "text-violet-500",  bg: "bg-violet-500"  },
                services:  { sub: "Service Pricing",     color: "text-amber-500",   bg: "bg-amber-500"   },
                vaccines:  { sub: "Vaccine Catalog",     color: "text-cyan-500",    bg: "bg-cyan-500"    },
                rooms:     { sub: "Room Management",     color: "text-teal-500",    bg: "bg-teal-500"    },
                personnel: { sub: "Staff & Vets",        color: "text-indigo-500",  bg: "bg-indigo-500"  },
                roles:     { sub: "Role Permissions",    color: "text-rose-500",    bg: "bg-rose-500"    },
                access:    { sub: "Room Access Control", color: "text-orange-500",  bg: "bg-orange-500"  },
              };
              return activeSubs.map(s => {
                const m = meta[s.key] ?? { sub: "", color: "text-gray-400", bg: "bg-gray-400" };
                const isActive = activeSub === s.key;
                return (
                  <button key={s.key}
                    onClick={() => mainTab === "master" ? setMasterSub(s.key as MasterSub) : setUsersSub(s.key as UsersSub)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 transition-all text-left group relative ${isActive ? "bg-[#19a589]/8" : "hover:bg-gray-50/80"}`}>
                    {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#19a589]" />}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                      <div className={`absolute inset-0 rounded-xl transition-all ${m.bg} ${isActive ? "opacity-100" : "opacity-25 group-hover:opacity-40"}`} />
                      <span className={`relative z-10 transition-colors ${isActive ? "text-white" : m.color}`}>{s.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight transition-colors ${isActive ? "text-[#0d7c66]" : "text-gray-700 group-hover:text-gray-900"}`}
                        style={{ fontWeight: isActive ? 700 : 500 }}>
                        {s.label}
                      </p>
                      <p className={`text-[11px] mt-0.5 transition-colors ${isActive ? "text-[#19a589]/70" : "text-gray-400"}`}>
                        {m.sub}
                      </p>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-all ${isActive ? "text-[#19a589]" : "text-gray-300 group-hover:text-gray-400 -translate-x-1 group-hover:translate-x-0"}`} />
                  </button>
                );
              });
            })()}
          </PageItem>
        )}

        {/* Main area */}
        <PageItem className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {mainTab === "notify" && (
              <motion.div key="notify" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <NotifySection />
              </motion.div>
            )}
            {mainTab === "master" && masterSub === "drugs" && (
              <motion.div key="drugs" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <DrugsSection />
              </motion.div>
            )}
            {mainTab === "master" && masterSub === "species" && (
              <motion.div key="species" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <SpeciesSection species={species} setSpecies={setSpecies} />
              </motion.div>
            )}
            {mainTab === "master" && masterSub === "breeds" && (
              <motion.div key="breeds" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <BreedsSection breeds={breeds} setBreeds={setBreeds} species={species} />
              </motion.div>
            )}
            {mainTab === "master" && masterSub === "services" && (
              <motion.div key="services" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <ServicesSection />
              </motion.div>
            )}
            {mainTab === "master" && masterSub === "vaccines" && (
              <motion.div key="vaccines" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <VaccinesSection />
              </motion.div>
            )}
            {mainTab === "users" && usersSub === "rooms" && (
              <motion.div key="rooms" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <RoomsSection rooms={rooms} setRooms={setRooms} />
              </motion.div>
            )}
            {mainTab === "users" && usersSub === "personnel" && (
              <motion.div key="personnel" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <PersonnelSection personnel={personnel} setPersonnel={setPersonnel} rooms={rooms} />
              </motion.div>
            )}
            {mainTab === "users" && usersSub === "roles" && (
              <motion.div key="roles" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <RolesSection />
              </motion.div>
            )}
            {mainTab === "users" && usersSub === "access" && (
              <motion.div key="access" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
                <AccessSection personnel={personnel} rooms={rooms} />
              </motion.div>
            )}
          </AnimatePresence>
        </PageItem>
      </div>
    </PageMotion>
  );
}
