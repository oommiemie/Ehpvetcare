import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, Database, Users, Plus, Edit2, Trash2, Search,
  Shield, X, Building2, UserCircle, Syringe, Pill,
  Check, PawPrint, Wrench, ChevronRight, Lock,
  BellRing, ToggleLeft, ToggleRight, AlertCircle, Star,
} from "lucide-react";
import { PageMotion, PageItem } from "../components/PageMotion";
import { useSnackbar } from "../contexts/SnackbarContext";

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
const INIT_DRUGS: Drug[] = [
  { id:1, code:"D001", name:"อะม็อกซิซิลลิน 250mg",      genericName:"Amoxicillin",    category:"ยาปฏิชีวนะ",    unit:"แผง",      costPrice:85,  sellPrice:120, minStock:10, active:true  },
  { id:2, code:"D002", name:"เพรดนิโซโลน 5mg",            genericName:"Prednisolone",   category:"สเตียรอยด์",    unit:"แผง",      costPrice:55,  sellPrice:80,  minStock:5,  active:true  },
  { id:3, code:"D003", name:"เมโทรนิดาโซล 200mg",         genericName:"Metronidazole",  category:"ยาปฏิชีวนะ",    unit:"แผง",      costPrice:60,  sellPrice:90,  minStock:10, active:true  },
  { id:4, code:"D004", name:"ด็อกซีไซคลิน 100mg",         genericName:"Doxycycline",    category:"ยาปฏิชีวนะ",    unit:"แคปซูล",   costPrice:140, sellPrice:200, minStock:20, active:true  },
  { id:5, code:"D005", name:"เมล็อกซิแคม 1mg/ml",         genericName:"Meloxicam",      category:"ยาแก้ปวด NSAID",unit:"ขวด",      costPrice:250, sellPrice:350, minStock:5,  active:true  },
  { id:6, code:"D006", name:"ฟูโรเซไมด์ 40mg",            genericName:"Furosemide",     category:"ยาขับปัสสาวะ",  unit:"แผง",      costPrice:40,  sellPrice:60,  minStock:10, active:true  },
  { id:7, code:"D007", name:"เอนโรฟลอกซาซิน 50mg",        genericName:"Enrofloxacin",   category:"ยาปฏิชีวนะ",    unit:"เม็ด",     costPrice:180, sellPrice:250, minStock:20, active:false },
];
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
const INIT_SERVICES: ServiceItem[] = [
  { id:1, code:"SV001", name:"ค่าตรวจ",               category:"ทั่วไป",     price:300,  active:true },
  { id:2, code:"SV002", name:"ตรวจเลือด CBC",          category:"แล็บ",       price:450,  active:true },
  { id:3, code:"SV003", name:"ชีวเคมีในเลือด",         category:"แล็บ",       price:600,  active:true },
  { id:4, code:"SV004", name:"เอกซเรย์ทรวงอก",        category:"เอกซเรย์",   price:800,  active:true },
  { id:5, code:"SV005", name:"น้ำเกลือ IV",            category:"การรักษา",   price:250,  active:true },
  { id:6, code:"SV006", name:"ค่าพักรักษา/วัน",        category:"วอร์ด",      price:500,  active:true },
  { id:7, code:"SV007", name:"ผ่าตัดทำหมัน (ตัวผู้)", category:"ศัลยกรรม",   price:2500, active:true },
  { id:8, code:"SV008", name:"ผ่าตัดทำหมัน (ตัวเมีย)",category:"ศัลยกรรม",   price:3500, active:true },
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
    <span className={`text-[11px] px-2 py-0.5 rounded-full ${active ? "bg-[#19a589]/15 text-[#0d7c66]" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 500 }}>
      {active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
    </span>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#19a589]/30 focus:border-[#19a589] bg-white";
const labelCls = "block text-xs text-gray-500 mb-1";
const nextId = (arr: { id: number }[]) => Math.max(0, ...arr.map(x => x.id)) + 1;

// ─── Modal Wrapper ────────────────────────────────────────────────
function Modal({ open, title, onClose, onSave, canSave, children }: {
  open: boolean; title: string; onClose: () => void; onSave: () => void;
  canSave: boolean; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{title}</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">{children}</div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
              <button onClick={onClose} className="px-5 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors" style={{ fontWeight: 500 }}>ยกเลิก</button>
              <button onClick={onSave} disabled={!canSave}
                className="px-5 py-2 rounded-full text-sm text-white transition-all active:scale-95 disabled:opacity-40"
                style={{ fontWeight: 600, background: canSave ? "linear-gradient(135deg,#19a589,#0d7c66)" : undefined, boxShadow: canSave ? "0 2px 10px rgba(25,165,137,0.3)" : undefined }}>
                บันทึก
              </button>
            </div>
          </motion.div>
        </motion.div>
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
        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/60">
          <div className="w-1 h-8 rounded-full bg-[#19a589] flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            <BellRing className="w-4 h-4 text-[#19a589]" />
            <span className="text-sm text-gray-800" style={{ fontWeight: 700 }}>ระบบแจ้งเตือนอัตโนมัติ</span>
            <span className="text-xs text-gray-400">Notification Settings</span>
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
                  <p className="text-xs text-gray-400 mt-0.5">แจ้งเตือนเจ้าของสัตว์เลี้ยงเมื่อวัคซีนใกล้ถึงกำหนดฉีด</p>
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
  const [drugs, setDrugs]   = useState<Drug[]>(INIT_DRUGS);
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
        <div className="flex items-center gap-3 px-6 bg-[rgba(249,250,251,0.6)] border-b border-[#f3f4f6]" style={{ height: 60 }}>
          <div className="w-1 h-8 rounded-full bg-[#19a589] flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Pill className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>รายการยา</span>
            <span className="text-xs text-[#99a1af]">Drug Registry</span>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-4 h-8 rounded-full text-white text-xs flex-shrink-0 shadow-[0px_2px_10px_0px_rgba(25,165,137,0.3)] transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: "linear-gradient(159deg, #19a589 0%, #0d7c66 100%)", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5" />
            เพิ่มยา
          </button>
        </div>
        {/* ── Search Bar ── */}
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อยา / รหัสยา..." className="vet-search pl-9 w-64" />
          </div>
        </div>
        {/* ── Cards ── */}
        <div className="divide-y divide-[#f3f4f6]">
          {filtered.map(d => (
            <div key={d.id} className="mx-4 my-2 rounded-[14px] border border-[#e5e7eb] bg-white hover:border-[#19a589]/40 transition-all group p-4 flex flex-col gap-4">
              {/* ── Top: image + name block + status + actions ── */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white flex-shrink-0 p-1">
                  {(d as any).image
                    ? <img src={(d as any).image} alt={d.name} className="w-full h-full rounded-full object-cover" />
                    : <div className="w-full h-full rounded-full bg-[#f0fdf9] flex items-center justify-center"><Pill className="w-6 h-6 text-[#19a589]" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] text-[#99a1af] font-mono bg-[#f9fafb] px-2 py-0.5 rounded-lg flex-shrink-0">{d.code}</span>
                      <span className="text-sm text-[#1e2939] truncate" style={{ fontWeight: 600 }}>{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge active={d.active} />
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(d)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(d.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#99a1af]">{d.genericName || "—"}</p>
                </div>
              </div>
              {/* ── Bottom: category + unit chips + pricing ── */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[11px] bg-[#eff6ff] text-[#155dfc] px-2 py-0.5 rounded-full">{d.category}</span>
                <span className="text-[11px] text-[#6a7282] bg-[#f9fafb] px-2 py-0.5 rounded-full">{d.unit}</span>
                <div className="flex items-center gap-[10px] ml-auto">
                  <span className="text-[11px] text-[#6a7282]">ทุน <span className="text-[#1e2939]" style={{ fontWeight: 500 }}>฿{d.costPrice.toLocaleString()}</span></span>
                  <span className="text-[11px] text-[#6a7282]">ขาย <span className="text-[#19a589]" style={{ fontWeight: 600 }}>฿{d.sellPrice.toLocaleString()}</span></span>
                  <span className="text-[11px] text-[#6a7282]">Stock ขั้นต่ำ <span className="text-[#1e2939]" style={{ fontWeight: 500 }}>{d.minStock} {d.unit}</span></span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-gray-400">ไม่พบรายการยา</div>
          )}
        </div>
      </div>
      <Modal open={open} title={editing ? "แก้ไขข้อมูลยา" : "เพิ่มรายการยา"} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>รหัสยา <span className="text-red-400">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="D001" /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อยา <span className="text-red-400">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ชื่อยา..." /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อสามัญ (Generic Name)</label><input className={inputCls} value={form.genericName} onChange={e => set("genericName", e.target.value)} placeholder="Generic name..." /></div>
          <div>
            <label className={labelCls}>หมวดหมู่</label>
            <select className={inputCls} value={form.category} onChange={e => set("category", e.target.value)}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>หน่วยนับ</label>
            <select className={inputCls} value={form.unit} onChange={e => set("unit", e.target.value)}>
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
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-800" style={{ fontWeight:600 }}>ทะเบียนประเภทสัตว์เลี้ยง</span>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-white rounded-full text-[12px] pl-3 pr-4 h-8 active:scale-95 transition-all"
            style={{ fontWeight:600, background:"linear-gradient(135deg,#19a589,#0d7c66)", boxShadow:"0 2px 10px rgba(25,165,137,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> เพิ่มประเภท
          </button>
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
      <Modal open={open} title={editing ? "แก้ไขประเภทสัตว์" : "เพิ่มประเภทสัตว์"} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}>
        <div><label className={labelCls}>รหัส <span className="text-red-400">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="S001" /></div>
        <div><label className={labelCls}>ชื่อประเภทสัตว์ <span className="text-red-400">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="สุนัข" /></div>
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
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <select className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#19a589]/30 bg-white"
            value={filterSp} onChange={e => setFilterSp(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">ทุกประเภท</option>
            {species.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-white rounded-full text-[12px] pl-3 pr-4 h-8 active:scale-95 transition-all"
            style={{ fontWeight:600, background:"linear-gradient(135deg,#19a589,#0d7c66)", boxShadow:"0 2px 10px rgba(25,165,137,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> เพิ่มพันธุ์
          </button>
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
      <Modal open={open} title={editing ? "แก้ไขพันธุ์สัตว์" : "เพิ่มพันธุ์สัตว์"} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name}>
        <div><label className={labelCls}>ชื่อพันธุ์ <span className="text-red-400">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="โกลเดน รีทรีฟเวอร์" /></div>
        <div>
          <label className={labelCls}>ประเภทสัตว์</label>
          <select className={inputCls} value={form.speciesId} onChange={e => set("speciesId", Number(e.target.value))}>
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
  const [items, setItems]   = useState<ServiceItem[]>(INIT_SERVICES);
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาบริการ..." className="vet-search pl-9 w-56" />
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-white rounded-full text-[12px] pl-3 pr-4 h-8 active:scale-95 transition-all"
            style={{ fontWeight:600, background:"linear-gradient(135deg,#19a589,#0d7c66)", boxShadow:"0 2px 10px rgba(25,165,137,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> เพิ่มบริการ
          </button>
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
      <Modal open={open} title={editing ? "แก้ไขค่าบริการ" : "เพิ่มค่าบริการ"} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>รหัส <span className="text-red-400">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="SV001" /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อบริการ <span className="text-red-400">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ชื่อบริการ..." /></div>
          <div><label className={labelCls}>หมวดหมู่</label><select className={inputCls} value={form.category} onChange={e => set("category", e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
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
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-800" style={{ fontWeight:600 }}>ทะเบียนข้อมูลพื้นฐ��นวัคซีน</span>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-white rounded-full text-[12px] pl-3 pr-4 h-8 active:scale-95 transition-all"
            style={{ fontWeight:600, background:"linear-gradient(135deg,#19a589,#0d7c66)", boxShadow:"0 2px 10px rgba(25,165,137,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> เพิ่มวัคซีน
          </button>
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
      <Modal open={open} title={editing ? "แก้ไขข้อมูลวัคซีน" : "เพิ่มวัคซีน"} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.code && !!form.name}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>รหัส <span className="text-red-400">*</span></label><input className={inputCls} value={form.code} onChange={e => set("code", e.target.value)} placeholder="V001" /></div>
          <div className="col-span-2"><label className={labelCls}>ชื่อวัคซีน <span className="text-red-400">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="พิษสุนัขบ้า" /></div>
          <div className="col-span-2"><label className={labelCls}>ชนิดสัตว์ (คั่นด้วยจุลภาค)</label><input className={inputCls} value={form.species} onChange={e => set("species", e.target.value)} placeholder="สุนัข, แมว" /></div>
          <div><label className={labelCls}>ยี่ห้อ</label><input className={inputCls} value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="ยี่ห้อ..." /></div>
          <div><label className={labelCls}>ระยะฉีดซ้ำ (เดือน)</label><input type="number" className={inputCls} value={form.intervalMonths} onChange={e => set("intervalMonths", Number(e.target.value))} /></div>
          <div><label className={labelCls}>ราคา (฿)</label><input type="number" className={inputCls} value={form.price} onChange={e => set("price", Number(e.target.value))} /></div>
          <div className="flex items-center gap-3 pt-5"><Toggle checked={form.active} onChange={v => set("active", v)} /><span className="text-sm text-gray-600">{form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
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
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-800" style={{ fontWeight:600 }}>รายการห้องทำงาน</span>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-white rounded-full text-[12px] pl-3 pr-4 h-8 active:scale-95 transition-all"
            style={{ fontWeight:600, background:"linear-gradient(135deg,#19a589,#0d7c66)", boxShadow:"0 2px 10px rgba(25,165,137,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> เพิ่มห้อง
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
      <Modal open={open} title={editing ? "แก้ไขห้องทำงาน" : "เพิ่มห้องทำงาน"} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name}>
        <div><label className={labelCls}>ชื่อห้องทำงาน <span className="text-red-400">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ห้องตรวจ A" /></div>
        <div><label className={labelCls}>ประเภทห้อง</label><select className={inputCls} value={form.type} onChange={e => set("type", e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select></div>
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
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-800" style={{ fontWeight:600 }}>รายการบุคลากร</span>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-white rounded-full text-[12px] pl-3 pr-4 h-8 active:scale-95 transition-all"
            style={{ fontWeight:600, background:"linear-gradient(135deg,#19a589,#0d7c66)", boxShadow:"0 2px 10px rgba(25,165,137,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> เพิ่มบุคลากร
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
      <Modal open={open} title={editing ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากร"} onClose={() => setOpen(false)} onSave={handleSave} canSave={!!form.name}>
        <div><label className={labelCls}>ชื่อ-นามสกุล <span className="text-red-400">*</span></label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="สพ.ว. ชื่อ นามสกุล" /></div>
        <div><label className={labelCls}>เลขใบประกอบวิชาชีพ</label><input className={inputCls} value={form.licenseNo} onChange={e => set("licenseNo", e.target.value)} placeholder="ว.XXXXX หรือ -" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>ตำแหน่ง</label><select className={inputCls} value={form.position} onChange={e => set("position", e.target.value)}>{positions.map(p => <option key={p}>{p}</option>)}</select></div>
          <div><label className={labelCls}>บทบาท (Role)</label><select className={inputCls} value={form.role} onChange={e => set("role", e.target.value)}>{roles.map(r => <option key={r}>{r}</option>)}</select></div>
          <div className="col-span-2">
            <label className={labelCls}>ห้องทำงานหลัก</label>
            <select className={inputCls} value={form.roomId ?? ""} onChange={e => set("roomId", e.target.value ? Number(e.target.value) : null)}>
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
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#19a589]" />
            <span className="text-sm text-gray-800" style={{ fontWeight:700 }}>สิทธิ์การเข้าถึงตามบทบาท</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
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
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#19a589]" />
            <span className="text-sm text-gray-800" style={{ fontWeight:700 }}>สิทธิ์การเข้าใช้ห้องทำงาน</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">กำหนดว่าบุคลากรแต่ละคนสามารถเข้าใช้ห้องใดได้บ้าง</p>
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
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isActive ? m.bg : "bg-gray-100 group-hover:bg-gray-200"}`}>
                      <span className={`transition-colors ${isActive ? "text-white" : m.color}`}>{s.icon}</span>
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
