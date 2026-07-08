import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Stethoscope, Plus, Pencil, Trash2, Check, X, Clock,
  ClipboardList, Search, Receipt, CalendarDays,
} from "lucide-react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirm } from "../../contexts/ConfirmContext";
import { useAuth } from "../../contexts/AuthContext";
import { DatePickerModern } from "../DatePickerModern";
import { TimePickerModern } from "../TimePickerModern";

interface Procedure {
  id: string;
  name: string;
  category: string;
  bodyArea: string;
  price: number;
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  durationMin: number;
  vet: string;
  note?: string;
  createdAt: string;
}

interface CatalogItem {
  name: string;
  enName?: string;
  bodyArea: string;
  durationMin: number;
  price: number;
  recommended?: boolean;
}

const CATEGORIES = [
  "ผิวหนัง/แผล",
  "หลอดเลือด/สารน้ำ",
  "ทางเดินปัสสาวะ",
  "ทรวงอก/ช่องท้อง",
  "ภาพวินิจฉัย",
  "หู/ช่องปาก",
  "ระบบหายใจ",
  "ทั่วไป",
] as const;

type Category = typeof CATEGORIES[number];

const CATALOG: Record<Category, CatalogItem[]> = {
  "ผิวหนัง/แผล": [
    { name: "ทำแผล / ล้างแผล", enName: "Wound dressing", bodyArea: "ผิวหนัง (ทั่วไป)", durationMin: 15, price: 150 },
    { name: "เย็บแผล", enName: "Suturing", bodyArea: "ผิวหนัง (ทั่วไป)", durationMin: 30, price: 600 },
    { name: "เจาะระบายฝี", enName: "Abscess drainage", bodyArea: "ผิวหนัง (ทั่วไป)", durationMin: 20, price: 500 },
    { name: "ตัดชิ้นเนื้อส่งตรวจ", enName: "Skin biopsy", bodyArea: "ผิวหนัง (ทั่วไป)", durationMin: 25, price: 1200, recommended: true },
    { name: "เจาะดูดเซลล์ (FNA)", enName: "Fine-needle aspiration", bodyArea: "ผิวหนัง (ทั่วไป)", durationMin: 15, price: 400 },
  ],
  "หลอดเลือด/สารน้ำ": [
    { name: "วางสายน้ำเกลือ (IV catheter)", enName: "IV catheterization", bodyArea: "ขาหน้า (cephalic v.)", durationMin: 10, price: 250 },
    { name: "เจาะเลือดส่งตรวจ", enName: "Blood draw", bodyArea: "คอ (jugular v.)", durationMin: 10, price: 120 },
    { name: "ฉีดยา IM / SC", enName: "IM/SC injection", bodyArea: "กล้ามเนื้อ / ใต้ผิวหนัง", durationMin: 5, price: 100 },
    { name: "ให้เลือด (Blood transfusion)", enName: "Transfusion", bodyArea: "หลอดเลือดดำ", durationMin: 60, price: 2500 },
  ],
  "ทางเดินปัสสาวะ": [
    { name: "สวนปัสสาวะ (Urinary catheter)", enName: "Urinary catheterization", bodyArea: "ท่อปัสสาวะ", durationMin: 30, price: 800 },
    { name: "เจาะกระเพาะปัสสาวะ", enName: "Cystocentesis", bodyArea: "กระเพาะปัสสาวะ", durationMin: 15, price: 500 },
    { name: "ล้างกระเพาะปัสสาวะ", enName: "Bladder lavage", bodyArea: "กระเพาะปัสสาวะ", durationMin: 30, price: 700 },
  ],
  "ทรวงอก/ช่องท้อง": [
    { name: "อัลตราซาวด์ช่องท้อง", enName: "Abdominal ultrasound", bodyArea: "ช่องท้อง", durationMin: 25, price: 1200, recommended: true },
    { name: "เจาะดูดของเหลวช่องท้อง", enName: "Abdominocentesis", bodyArea: "ช่องท้อง", durationMin: 20, price: 800 },
    { name: "เจาะดูดของเหลวช่องอก", enName: "Thoracocentesis", bodyArea: "ช่องอก", durationMin: 25, price: 900 },
  ],
  "ภาพวินิจฉัย": [
    { name: "X-Ray ทั่วไป", enName: "Radiograph", bodyArea: "ตามจุด", durationMin: 10, price: 600 },
    { name: "X-Ray พิเศษ", enName: "Contrast radiograph", bodyArea: "ตามจุด", durationMin: 20, price: 1200 },
    { name: "Ultrasound", enName: "Ultrasound", bodyArea: "ตามจุด", durationMin: 25, price: 1000 },
  ],
  "หู/ช่องปาก": [
    { name: "ทำความสะอาดหู", enName: "Ear cleaning", bodyArea: "ใบหู / รูหู", durationMin: 15, price: 200 },
    { name: "ขูดหินปูน", enName: "Dental scaling", bodyArea: "ช่องปาก", durationMin: 45, price: 1500 },
    { name: "ถอนฟัน", enName: "Tooth extraction", bodyArea: "ช่องปาก", durationMin: 30, price: 800 },
  ],
  "ระบบหายใจ": [
    { name: "ใส่ท่อช่วยหายใจ (Intubation)", enName: "Endotracheal intubation", bodyArea: "ทางเดินหายใจ", durationMin: 15, price: 800 },
    { name: "พ่นยา (Nebulization)", enName: "Nebulization", bodyArea: "ทางเดินหายใจ", durationMin: 20, price: 300 },
    { name: "ดูดเสมหะ (Suction)", enName: "Tracheal suction", bodyArea: "ทางเดินหายใจ", durationMin: 10, price: 200 },
  ],
  "ทั่วไป": [
    { name: "ฝังไมโครชิป (Microchip)", enName: "Microchipping", bodyArea: "หลังคอ", durationMin: 10, price: 500 },
    { name: "ตัดเล็บ", enName: "Nail trim", bodyArea: "เล็บ", durationMin: 10, price: 80 },
    { name: "วัด Vital signs", enName: "Vital signs check", bodyArea: "ทั่วไป", durationMin: 5, price: 50 },
  ],
};

const ALL_BODY_AREAS = [
  "ผิวหนัง (ทั่วไป)", "ช่องท้อง", "ช่องอก", "ขาหน้า (cephalic v.)",
  "คอ (jugular v.)", "ท่อปัสสาวะ", "กระเพาะปัสสาวะ", "ทางเดินหายใจ",
  "ใบหู / รูหู", "ช่องปาก", "หลังคอ", "เล็บ", "ทั่วไป",
];

function loadProcedures(key: string): Procedure[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as Procedure[];
  } catch { /* ignore */ }
  return [];
}

function calcDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
  const total = (eh * 60 + em) - (sh * 60 + sm);
  return total > 0 ? total : 0;
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function thaiShortDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function ProceduresTab({ admitId, storageKey: storageKeyProp }: { admitId?: number; storageKey?: string }) {
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { user } = useAuth();
  const defaultVet = user?.displayName ?? "เจ้าหน้าที่";
  const storageKey = storageKeyProp ?? `vet-ipd-procedures-${admitId}`;

  const [list, setList] = useState<Procedure[]>(() => loadProcedures(storageKey));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Draft form fields
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<Category>("ผิวหนัง/แผล");
  const [draftBodyArea, setDraftBodyArea] = useState(ALL_BODY_AREAS[0]);
  const [draftPrice, setDraftPrice] = useState<number>(0);
  const [draftDate, setDraftDate] = useState(todayKey());
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [draftVet, setDraftVet] = useState(defaultVet);
  const [draftNote, setDraftNote] = useState("");

  // Catalog filter in modal
  const [catalogCat, setCatalogCat] = useState<Category>("ผิวหนัง/แผล");

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(list)); } catch { /* ignore */ }
  }, [list, storageKey]);

  const todayList = useMemo(() => list.filter(p => p.date === todayKey()), [list]);
  const todayCount = todayList.length;
  const todayTotalMin = todayList.reduce((s, p) => s + p.durationMin, 0);
  const totalCost = list.reduce((s, p) => s + p.price, 0);

  const openCreate = () => {
    setEditingId(null);
    setDraftName("");
    setDraftCategory("ผิวหนัง/แผล");
    setCatalogCat("ผิวหนัง/แผล");
    setDraftBodyArea(ALL_BODY_AREAS[0]);
    setDraftPrice(0);
    setDraftDate(todayKey());
    setDraftStart(nowTime());
    setDraftEnd("");
    setDraftVet(defaultVet);
    setDraftNote("");
    setModalOpen(true);
  };

  const openEdit = (p: Procedure) => {
    setEditingId(p.id);
    setDraftName(p.name);
    setDraftCategory(CATEGORIES.includes(p.category as Category) ? (p.category as Category) : "ทั่วไป");
    setCatalogCat(CATEGORIES.includes(p.category as Category) ? (p.category as Category) : "ทั่วไป");
    setDraftBodyArea(p.bodyArea);
    setDraftPrice(p.price);
    setDraftDate(p.date);
    setDraftStart(p.startTime);
    setDraftEnd(p.endTime);
    setDraftVet(p.vet);
    setDraftNote(p.note ?? "");
    setModalOpen(true);
  };

  const applyCatalog = (item: CatalogItem) => {
    setDraftName(item.name);
    setDraftBodyArea(item.bodyArea);
    setDraftPrice(item.price);
    setDraftCategory(catalogCat);
    if (draftStart && !draftEnd) {
      const [sh, sm] = draftStart.split(":").map(Number);
      const totalMin = sh * 60 + sm + item.durationMin;
      const eh = String(Math.floor((totalMin % (24 * 60)) / 60)).padStart(2, "0");
      const em = String(totalMin % 60).padStart(2, "0");
      setDraftEnd(`${eh}:${em}`);
    }
  };

  const save = () => {
    if (!draftName.trim()) { showSnackbar("error", "กรุณาระบุชื่อหัตถการ"); return; }
    if (!draftBodyArea.trim()) { showSnackbar("error", "กรุณาระบุบริเวณที่ทำ"); return; }
    if (draftPrice < 0) { showSnackbar("error", "ราคาต้องไม่ติดลบ"); return; }
    if (!draftDate) { showSnackbar("error", "กรุณาระบุวันที่"); return; }
    if (!draftStart || !draftEnd) { showSnackbar("error", "กรุณาระบุเวลาเริ่ม/สิ้นสุด"); return; }
    const durationMin = calcDuration(draftStart, draftEnd);
    if (durationMin <= 0) { showSnackbar("error", "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม"); return; }

    const record: Procedure = {
      id: editingId ?? `proc-${Date.now()}`,
      name: draftName.trim(),
      category: draftCategory,
      bodyArea: draftBodyArea.trim(),
      price: draftPrice,
      date: draftDate,
      startTime: draftStart,
      endTime: draftEnd,
      durationMin,
      vet: draftVet || defaultVet,
      note: draftNote.trim() || undefined,
      createdAt: editingId ? (list.find(p => p.id === editingId)?.createdAt ?? new Date().toISOString()) : new Date().toISOString(),
    };

    if (editingId) {
      setList(prev => prev.map(p => p.id === editingId ? record : p));
      showSnackbar("success", "แก้ไขหัตถการแล้ว");
    } else {
      setList(prev => [...prev, record]);
      showSnackbar("success", "บันทึกหัตถการแล้ว");
    }
    setModalOpen(false);
  };

  const handleDelete = async (p: Procedure) => {
    const ok = await confirm({
      title: "ลบหัตถการ",
      description: `ลบ "${p.name}" ออกจากบันทึก?`,
      confirmLabel: "ลบ",
      kind: "danger",
    });
    if (!ok) return;
    setList(prev => prev.filter(x => x.id !== p.id));
    showSnackbar("success", "ลบหัตถการแล้ว");
  };

  // Sorted list (newest date+time first)
  const sortedList = useMemo(
    () => [...list].sort((a, b) => {
      const ka = `${a.date}T${a.startTime}`;
      const kb = `${b.date}T${b.startTime}`;
      return kb.localeCompare(ka);
    }),
    [list],
  );

  // Today timeline (chronological)
  const todayTimeline = useMemo(
    () => [...todayList].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [todayList],
  );

  return (
    <div className="space-y-3">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          icon={<ClipboardList className="w-4 h-4 text-[#19a589]" />}
          softBg="rgba(25,165,137,0.10)"
          label="หัตถการที่บันทึกวันนี้"
          value={String(todayCount)}
        />
        <KpiCard
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          softBg="rgba(245,158,11,0.12)"
          label="เวลารวมที่ใช้ทำหัตถการ"
          value={`${todayTotalMin} น.`}
        />
        <KpiCard
          icon={<Receipt className="w-4 h-4 text-emerald-600" />}
          softBg="rgba(16,185,129,0.12)"
          label="ค่าหัตถการสะสม"
          value={`฿${totalCost.toLocaleString()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Procedure list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)" }}>
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>รายการหัตถการ</p>
                <p className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>{list.length} รายการ</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
                border: "1px solid rgba(253,186,116,0.85)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(234,88,12,0.45)",
                fontWeight: 700,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มหัตถการ
            </button>
          </div>
          <div className="overflow-x-auto">
            {sortedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Stethoscope className="w-10 h-10 mb-2" strokeWidth={1.5} />
                <p className="text-[12px]" style={{ fontWeight: 600 }}>ยังไม่มีบันทึกหัตถการ</p>
                <p className="text-[11px] text-gray-300 mt-0.5">กด "+ เพิ่มหัตถการ" เพื่อเริ่มบันทึก</p>
              </div>
            ) : (
              <table className="w-full text-[12.5px] min-w-[720px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-3 py-2.5 text-[11px] text-gray-500" style={{ fontWeight: 600 }}>หัตถการ</th>
                    <th className="text-left px-3 py-2.5 text-[11px] text-gray-500" style={{ fontWeight: 600 }}>บริเวณที่ทำ</th>
                    <th className="text-left px-3 py-2.5 text-[11px] text-gray-500 whitespace-nowrap" style={{ fontWeight: 600 }}>เวลา</th>
                    <th className="text-left px-3 py-2.5 text-[11px] text-gray-500" style={{ fontWeight: 600 }}>นาที</th>
                    <th className="text-left px-3 py-2.5 text-[11px] text-gray-500" style={{ fontWeight: 600 }}>สัตวแพทย์</th>
                    <th className="text-right px-3 py-2.5 text-[11px] text-gray-500" style={{ fontWeight: 600 }}>ราคา</th>
                    <th className="text-right px-3 py-2.5 text-[11px] text-gray-500 w-[80px]" style={{ fontWeight: 600 }}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedList.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 py-2.5">
                        <p className="text-gray-900 truncate max-w-[220px]" style={{ fontWeight: 700 }}>{p.name}</p>
                        {p.note && <p className="text-[10.5px] text-gray-400 truncate max-w-[220px]">{p.note}</p>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center text-[10.5px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {p.bodyArea}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" style={{ fontWeight: 600 }}>
                        <p>{p.startTime}–{p.endTime}</p>
                        {p.date !== todayKey() && <p className="text-[10px] text-gray-400">{thaiShortDate(p.date)}</p>}
                      </td>
                      <td className="px-3 py-2.5 text-gray-700" style={{ fontWeight: 600 }}>{p.durationMin}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px]">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: "linear-gradient(135deg,#19a589,#0d7c66)", fontWeight: 700 }}>
                            {p.vet.charAt(0)}
                          </span>
                          <span className="text-gray-600 truncate max-w-[110px]">{p.vet}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-[#19a589] whitespace-nowrap" style={{ fontWeight: 700 }}>฿{p.price.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors" title="แก้ไข">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors" title="ลบ">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right sidebar — timeline + summary */}
        <div className="space-y-3">
          {/* Today timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#fbbf24,#d97706)" }}>
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] text-gray-900" style={{ fontWeight: 700 }}>ไทม์ไลน์หัตถการวันนี้</p>
                <p className="text-[10.5px] text-gray-400" style={{ fontWeight: 500 }}>{todayCount} รายการ</p>
              </div>
            </div>
            {todayTimeline.length === 0 ? (
              <p className="text-[11.5px] text-gray-400 text-center py-4">ยังไม่มีหัตถการในวันนี้</p>
            ) : (
              <div className="space-y-2.5 relative">
                <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-gray-200" />
                {todayTimeline.map(p => (
                  <div key={p.id} className="flex items-start gap-2.5 relative">
                    <span className="w-3 h-3 rounded-full border-2 border-[#19a589] bg-white flex-shrink-0 mt-0.5 z-10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-500" style={{ fontWeight: 600 }}>
                        {p.startTime}–{p.endTime}
                      </p>
                      <p className="text-[12px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{p.name}</p>
                      <p className="text-[10.5px] text-gray-400 truncate">{p.bodyArea} · ฿{p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
            <p className="text-[13px] text-gray-900 mb-3" style={{ fontWeight: 700 }}>สรุปค่าหัตถการ</p>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">จำนวนหัตถการ</span>
                <span className="text-gray-900" style={{ fontWeight: 700 }}>{list.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">เวลารวม</span>
                <span className="text-gray-900" style={{ fontWeight: 700 }}>{list.reduce((s, p) => s + p.durationMin, 0)} น.</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                <span className="text-gray-600" style={{ fontWeight: 600 }}>รวม</span>
                <span className="text-[16px] text-[#19a589]" style={{ fontWeight: 800 }}>฿{totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ProcedureModal
            editingId={editingId}
            catalogCat={catalogCat}
            setCatalogCat={setCatalogCat}
            draftName={draftName}
            setDraftName={setDraftName}
            draftCategory={draftCategory}
            setDraftCategory={setDraftCategory}
            draftBodyArea={draftBodyArea}
            setDraftBodyArea={setDraftBodyArea}
            draftPrice={draftPrice}
            setDraftPrice={setDraftPrice}
            draftDate={draftDate}
            setDraftDate={setDraftDate}
            draftStart={draftStart}
            setDraftStart={setDraftStart}
            draftEnd={draftEnd}
            setDraftEnd={setDraftEnd}
            draftVet={draftVet}
            setDraftVet={setDraftVet}
            draftNote={draftNote}
            setDraftNote={setDraftNote}
            applyCatalog={applyCatalog}
            onClose={() => setModalOpen(false)}
            onSave={save}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function KpiCard({ icon, softBg, label, value }: { icon: React.ReactNode; softBg: string; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: softBg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[18px] text-gray-900" style={{ fontWeight: 800, lineHeight: 1.1 }}>{value}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 truncate" style={{ fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

function ProcedureModal(props: {
  editingId: string | null;
  catalogCat: Category;
  setCatalogCat: (c: Category) => void;
  draftName: string;
  setDraftName: (v: string) => void;
  draftCategory: Category;
  setDraftCategory: (v: Category) => void;
  draftBodyArea: string;
  setDraftBodyArea: (v: string) => void;
  draftPrice: number;
  setDraftPrice: (v: number) => void;
  draftDate: string;
  setDraftDate: (v: string) => void;
  draftStart: string;
  setDraftStart: (v: string) => void;
  draftEnd: string;
  setDraftEnd: (v: string) => void;
  draftVet: string;
  setDraftVet: (v: string) => void;
  draftNote: string;
  setDraftNote: (v: string) => void;
  applyCatalog: (item: CatalogItem) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const items = CATALOG[props.catalogCat] ?? [];
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={props.onClose}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-[560px] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh" }}
        initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>
              {props.editingId ? "แก้ไขหัตถการ" : "บันทึกหัตถการ"}
            </h3>
            <p className="text-[11px] text-gray-500">เลือกจากแคตตาล็อก (เติมราคา/บริเวณอัตโนมัติ) หรือกรอกเอง</p>
          </div>
          <button onClick={props.onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>

        <div className="vet-modal-body">
          {/* Category filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => {
              const on = props.catalogCat === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => props.setCatalogCat(c)}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] transition-all"
                  style={{
                    fontWeight: on ? 700 : 600,
                    color: on ? "#ffffff" : "#6b7280",
                    background: on ? "linear-gradient(135deg,#19a589,#0d7c66)" : "#f3f4f6",
                    border: on ? "1px solid #0d7c66" : "1px solid transparent",
                    boxShadow: on ? "0 3px 10px rgba(25,165,137,0.22)" : "none",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {items.map(item => (
              <button
                key={item.name}
                type="button"
                onClick={() => props.applyCatalog(item)}
                className="text-left p-2.5 rounded-xl border border-gray-100 bg-white hover:border-[#19a589]/40 hover:bg-[#f0fbf8]/50 transition-all relative"
              >
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>{item.name}</p>
                    <p className="text-[10.5px] text-gray-400 truncate">
                      {item.enName ? `${item.enName} · ` : ""}~{item.durationMin} น.
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11.5px] text-gray-800 inline-flex items-center gap-0.5" style={{ fontWeight: 700 }}>
                      <Receipt className="w-3 h-3 opacity-50" /> {item.price.toLocaleString()}
                    </p>
                    {item.recommended && (
                      <span className="inline-flex items-center text-[9.5px] mt-0.5 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#b45309", border: "1px solid rgba(245,158,11,0.30)", fontWeight: 700 }}>
                        แนะนำ
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="vet-label">ชื่อหัตถการ <span className="required">*</span></label>
              <input
                type="text"
                value={props.draftName}
                onChange={e => props.setDraftName(e.target.value)}
                placeholder="เลือกด้านบน หรือพิมพ์เอง"
                className="vet-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="vet-label">บริเวณที่ทำ (Body area) <span className="required">*</span></label>
                <select
                  value={props.draftBodyArea}
                  onChange={e => props.setDraftBodyArea(e.target.value)}
                  className="vet-select"
                >
                  {ALL_BODY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="vet-label">ราคา (Price) <span className="required">*</span></label>
                <div className="flex items-stretch rounded-full border-[1.5px] border-gray-200 overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-[#19a589]" style={{ height: 40 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={props.draftPrice === 0 ? "" : String(props.draftPrice)}
                    onChange={e => {
                      const digits = e.target.value.replace(/[^\d]/g, "");
                      props.setDraftPrice(digits ? parseInt(digits, 10) : 0);
                    }}
                    placeholder="0"
                    className="flex-1 min-w-0 text-[13px] text-gray-800 px-4 bg-transparent focus:outline-none"
                    style={{ fontWeight: 500 }}
                  />
                  <span className="text-[12px] text-gray-600 bg-white border-l border-gray-200 px-3 inline-flex items-center" style={{ fontWeight: 600 }}>บาท</span>
                </div>
              </div>
            </div>
            <div>
              <label className="vet-label">วันที่บันทึก <span className="required">*</span></label>
              <DatePickerModern value={props.draftDate} onChange={props.setDraftDate} placeholder="เลือกวันที่" />
            </div>
            <div className="grid grid-cols-2 gap-3 items-start">
              <div>
                <label className="vet-label">เวลาเริ่ม <span className="required">*</span></label>
                <TimePickerModern value={props.draftStart} onChange={props.setDraftStart} placeholder="เลือกเวลาเริ่ม" />
              </div>
              <div>
                <label className="vet-label">เวลาสิ้นสุด <span className="required">*</span></label>
                <TimePickerModern value={props.draftEnd} onChange={props.setDraftEnd} placeholder="เลือกเวลาสิ้นสุด" />
                {/* ปุ่มลัด: สิ้นสุด = เวลาเริ่ม + N นาที */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  {[5, 10].map(m => {
                    const on = !!props.draftStart && !!props.draftEnd && calcDuration(props.draftStart, props.draftEnd) === m;
                    const setFromStart = () => {
                      if (!props.draftStart) return;
                      const [h, mm] = props.draftStart.split(":").map(Number);
                      if (isNaN(h) || isNaN(mm)) return;
                      const total = (h * 60 + mm + m) % (24 * 60);
                      props.setDraftEnd(`${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`);
                    };
                    return (
                      <button key={m} type="button" onClick={setFromStart}
                        className="px-2.5 py-1 rounded-full text-[11px] transition-all active:scale-95"
                        style={on
                          ? { fontWeight: 700, background: "#19a589", color: "#fff", border: "1px solid #0d7c66" }
                          : { fontWeight: 600, background: "rgba(25,165,137,0.08)", color: "#0d7c66", border: "1px solid rgba(25,165,137,0.25)" }}>
                        +{m} นาที
                      </button>
                    );
                  })}
                  <span className="text-[10px] text-gray-300">นับจากเวลาเริ่ม</span>
                </div>
              </div>
            </div>
            {props.draftStart && props.draftEnd && (
              <p className="text-[11px] text-gray-500 -mt-1.5">
                ระยะเวลา: <span className="text-[#19a589]" style={{ fontWeight: 700 }}>{calcDuration(props.draftStart, props.draftEnd)} นาที</span>
              </p>
            )}
            <div>
              <label className="vet-label">สัตวแพทย์ผู้ทำ (Veterinarian) <span className="required">*</span></label>
              <input
                type="text"
                value={props.draftVet}
                onChange={e => props.setDraftVet(e.target.value)}
                placeholder="ชื่อสัตวแพทย์"
                className="vet-input"
              />
            </div>
            <div>
              <label className="vet-label">บันทึกเพิ่มเติม (Note)</label>
              <textarea
                value={props.draftNote}
                onChange={e => props.setDraftNote(e.target.value)}
                rows={3}
                placeholder="รายละเอียด / ผลที่ได้ / เบอร์อุปกรณ์"
                className="vet-textarea"
              />
            </div>
          </div>
        </div>

        <div className="vet-modal-footer">
          <button onClick={props.onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={props.onSave} className="vet-btn vet-btn-primary inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> {props.editingId ? "บันทึกการแก้ไข" : "บันทึกหัตถการ"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
