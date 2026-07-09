import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Send, Stethoscope, Syringe, Pill, Bone, RefreshCw, User,
  Paperclip, Mic, Square, Copy, Check, Volume2, Loader2, Wrench, ShieldCheck, ArrowRight, History, X,
  Calendar, Package, FileText, Home, BarChart3, MessageSquare, Zap, ClipboardList,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RTooltip, PieChart, Pie, Legend } from "recharts";
import aiIcon from "@/assets/AI.png";
import mohMiew from "@/assets/moh-miew.gif";
import { streamAgent, AI_BASE, AI_BASE_BACKUP, type AgentMessage } from "../lib/aiClient";
import { useNavigate } from "react-router";
import { APP_TOOLS, TOOLS_SYSTEM_HINT, PAGE_ROUTES } from "../lib/aiTools";
import { extractText } from "../lib/ocrClient";
import { transcribe, synthesize, startRecording } from "../lib/voiceClient";
import { useOwners } from "../contexts/OwnersContext";
import { usePets } from "../contexts/PetsContext";
import { useClinicData } from "../contexts/ClinicDataContext";
import { useIPD } from "../contexts/IPDContext";
import { useChat } from "../contexts/ChatContext";
import { useAppointments } from "../contexts/AppointmentsContext";
import { useBilling, billTotal, type Bill } from "../contexts/BillingContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import { logAudit, getAudit, type AuditEntry } from "../lib/aiAudit";

const SYSTEM_PROMPT = `คุณคือ "หมอเหมียว" (Dr. Meow) ผู้ช่วย AI ประจำระบบจัดการคลินิกสัตวแพทย์ EHP VetCare (แนะนำตัวว่า "หมอเหมียว" เมื่อถูกถามว่าเป็นใคร)
บุคลิก: คุณเป็นแมวสัตวแพทย์ที่อบอุ่น ร่าเริง ใส่ใจ พูดจาสุภาพเป็นกันเอง และมั่นใจแบบมืออาชีพ · ชอบให้กำลังใจทีมงาน · เติมความน่ารักด้วยคำว่า "เหมียว~" ได้เล็กน้อยตอนทักทายหรือให้กำลังใจ (พองาม ไม่พร่ำเพรื่อ และเลี่ยงในเรื่องจริงจัง/ฉุกเฉิน)
ผู้ใช้งานคือสัตวแพทย์และเจ้าหน้าที่คลินิก ตอบเป็นภาษาไทยที่สุภาพ กระชับ ตรงประเด็น ใช้ bullet เมื่อเหมาะสม
คุณช่วยได้เรื่อง: ข้อมูลยา/ขนาดยาอ้างอิง แนวทางดูแลอาการเบื้องต้น โปรแกรมวัคซีน โภชนาการ การคำนวณ (โดสยา/พลังงานอาหาร/สารน้ำ) อ่าน/สรุปเอกสารทางคลินิก และเข้าถึงข้อมูลจริงในระบบผ่านเครื่องมือ
สำคัญ: เมื่อให้ข้อมูลเรื่องขนาดยา การวินิจฉัย หรือการรักษา ให้ระบุเสมอว่าเป็นข้อมูลอ้างอิงเบื้องต้น และสัตวแพทย์ต้องพิจารณาน้ำหนัก อายุ โรคประจำตัว และตัดสินใจขั้นสุดท้ายเอง ห้ามแทนที่การวินิจฉัยของสัตวแพทย์
${TOOLS_SYSTEM_HINT}`;

interface DashCard { label: string; value: string; tone?: string; }
interface DashSpec { title: string; subtitle?: string; cards: DashCard[]; chart?: { type: "bar" | "pie"; data: { name: string; value: number }[] }; }
interface ReceiptSpec { billNo: string; memberName: string; items: { name: string; qty: number; price: number }[]; total: number; status: "open" | "held" | "paid"; method?: string; receiptNo?: string; }
interface Msg { id: string; from: "user" | "ai"; text: string; ts: number; context?: string; tools?: string[]; dashboard?: DashSpec; image?: string; receipt?: ReceiptSpec; }
const toReceipt = (b: Bill): ReceiptSpec => ({ billNo: b.billNo, memberName: b.memberName, items: b.items, total: billTotal(b), status: b.status, method: b.method, receiptNo: b.receiptNo });
const BAHT = (n: number) => n.toLocaleString("th-TH");
const BILL_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "ค้างชำระ", color: "#b45309", bg: "rgba(245,158,11,0.12)" },
  held: { label: "พักบิล", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  paid: { label: "ชำระแล้ว", color: "#15803d", bg: "rgba(34,197,94,0.14)" },
};

/* ─── ใบเสร็จ/บิล ที่หมอเหมียวสร้าง ─── */
const ReceiptBlock = ({ r }: { r: ReceiptSpec }) => {
  const st = BILL_STATUS[r.status] ?? BILL_STATUS.open;
  return (
    <div className="mt-2 w-full max-w-[340px] rounded-2xl border border-gray-100 bg-white overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
      <div className="px-4 pt-3 pb-2.5 border-b border-dashed border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] text-gray-900" style={{ fontWeight: 800 }}>EHP VetCare</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color, fontWeight: 700 }}>{st.label}</span>
        </div>
        <p className="text-[10.5px] text-gray-400 mt-0.5">{r.status === "paid" && r.receiptNo ? `ใบเสร็จ ${r.receiptNo}` : `บิล ${r.billNo}`} · {r.memberName}</p>
      </div>
      <div className="px-4 py-2">
        {r.items.map((it, i) => (
          <div key={i} className="flex items-baseline gap-2 py-1 text-[12px]">
            <span className="text-gray-700 flex-1">{it.name} {it.qty > 1 && <span className="text-gray-400">×{it.qty}</span>}</span>
            <span className="text-gray-800 tabular-nums" style={{ fontWeight: 600 }}>{BAHT(it.qty * it.price)}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-dashed border-gray-200 flex items-baseline justify-between">
        <span className="text-[12px] text-gray-500" style={{ fontWeight: 600 }}>รวมทั้งสิ้น{r.method ? ` · ${r.method}` : ""}</span>
        <span className="text-[16px] tabular-nums" style={{ fontWeight: 800, color: "#0d7c66" }}>฿{BAHT(r.total)}</span>
      </div>
    </div>
  );
};

/* ย่อรูปก่อนส่งให้ AI (กันไฟล์ใหญ่ + เร็วขึ้น) → คืน data URL (jpeg) */
const scaleImage = (file: File, max = 1024): Promise<string> => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    resolve(canvas.toDataURL("image/jpeg", 0.85));
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("โหลดรูปไม่สำเร็จ")); };
  img.src = url;
});

const TONE_COLORS: Record<string, string> = { blue: "#0ea5e9", green: "#22c55e", red: "#ef4444", amber: "#f59e0b", purple: "#7c3aed", teal: "#0d7c66" };
const PIE_COLORS = ["#7c3aed", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#0d7c66", "#a78bfa"];

/* ─── แดชบอร์ดที่ AI สร้างในคำตอบ (การ์ด + กราฟ) ─── */
const DashboardBlock = ({ d }: { d: DashSpec }) => (
  <div className="mt-2 w-full rounded-2xl border border-gray-100 bg-white overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
    <div className="px-3.5 pt-3 pb-1.5" style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.06),rgba(79,70,229,0.03))" }}>
      <p className="text-[13.5px] text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>{d.title}</p>
      {d.subtitle && <p className="text-[10.5px] text-gray-500 mt-0.5">{d.subtitle}</p>}
    </div>
    {d.cards?.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
        {d.cards.map((c, i) => {
          const tone = TONE_COLORS[c.tone ?? "purple"] ?? "#7c3aed";
          return (
            <div key={i} className="rounded-xl px-3 py-2.5 border border-gray-100" style={{ background: `linear-gradient(135deg, ${tone}12, ${tone}05)` }}>
              <p className="text-[16px] leading-none truncate" style={{ fontWeight: 800, color: tone }}>{c.value}</p>
              <p className="text-[10px] text-gray-500 mt-1.5" style={{ fontWeight: 600 }}>{c.label}</p>
            </div>
          );
        })}
      </div>
    )}
    {d.chart && d.chart.data?.length > 0 && (
      <div className="px-3 pb-3" style={{ width: "100%", height: d.chart.type === "pie" ? 190 : Math.max(130, d.chart.data.length * 34) }}>
        <ResponsiveContainer>
          {d.chart.type === "pie" ? (
            <PieChart>
              <Pie data={d.chart.data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={66} paddingAngle={2}>
                {d.chart.data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 10, border: "1px solid #eee", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          ) : (
            <BarChart data={d.chart.data} layout="vertical" margin={{ left: 0, right: 26, top: 2, bottom: 2 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "#4b5563" }} axisLine={false} tickLine={false} />
              <RTooltip cursor={{ fill: "rgba(124,58,237,0.06)" }} contentStyle={{ borderRadius: 10, border: "1px solid #eee", fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16} label={{ position: "right", fontSize: 11, fill: "#6b7280", fontWeight: 700 }}>
                {d.chart.data.map((_, i) => <Cell key={i} fill={`hsl(${262 - i * 10}, 70%, ${58 + i * 2}%)`} />)}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )}
  </div>
);
const uid = () => `a-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const now = () => Date.now();
const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
const STORE_KEY = "ehp_ai_chat_v1";
const TOOL_LABEL: Record<string, string> = {
  get_pet: "ข้อมูลสัตว์", get_owner: "ข้อมูลเจ้าของ", list_low_stock: "สต๊อกใกล้หมด",
  get_product: "ค้นหาสินค้า", get_ipd_status: "สถานะผู้ป่วยใน", message_owner: "ส่งข้อความหาเจ้าของ",
  get_appointments: "ดูนัดหมาย", create_appointment: "สร้างนัด", save_to_record: "บันทึกเวชระเบียน",
  daily_overview: "สรุปภาพรวมวันนี้", navigate_to: "เปิดหน้า", list_services: "รายการบริการ", check_boarding: "ห้องฝากเลี้ยง",
  book_boarding: "จองห้องฝากเลี้ยง", render_dashboard: "สร้างแดชบอร์ด",
  search_member: "ค้นหาสมาชิก", list_bills: "รายการบิล", create_bill: "เปิดบิล",
  hold_bill: "พักบิล", pay_bill: "ชำระเงิน", get_receipt: "ใบเสร็จ",
};

/* ─── render markdown เบาๆ (bold / หัวข้อ / bullet / เส้นคั่น) ─── */
const inline = (s: string, k: string) => {
  const parts = s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={`${k}-${i}`} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : <span key={`${k}-${i}`}>{p}</span>
  );
};
const cleanLatex = (s: string) => s
  .replace(/\$?\\(?:rightarrow|to|Rightarrow)\$?/g, "→")
  .replace(/\$?\\(?:leftarrow|gets)\$?/g, "←")
  .replace(/\\times/g, "×").replace(/\\pm/g, "±").replace(/\\leq/g, "≤").replace(/\\geq/g, "≥")
  .replace(/\\degree/g, "°").replace(/\$([^$]*)\$/g, "$1");
const renderMarkdown = (text: string) => {
  const lines = cleanLatex(text).replace(/\r/g, "").split("\n");
  return lines.map((raw, i) => {
    const line = raw.replace(/\t/g, "  ");
    const t = line.trim();
    if (t === "---" || t === "***") return <hr key={i} className="my-2 border-gray-100" />;
    if (t === "") return <div key={i} style={{ height: 6 }} />;
    const h = /^(#{1,6})\s+(.*)$/.exec(t);
    if (h) return <p key={i} className="text-[14px] text-gray-900 mt-1.5 mb-0.5" style={{ fontWeight: 800 }}>{inline(h[2], String(i))}</p>;
    const b = /^([*\-•])\s+(.*)$/.exec(t);
    if (b) {
      const indent = (line.length - line.trimStart().length) >= 2;
      return (
        <div key={i} className="flex gap-2" style={{ paddingLeft: indent ? 16 : 2 }}>
          <span className="flex-shrink-0" style={{ color: "#7c3aed" }}>•</span>
          <span className="flex-1">{inline(b[2], String(i))}</span>
        </div>
      );
    }
    return <p key={i}>{inline(t, String(i))}</p>;
  });
};

/* ─── คำตอบจำลองสำรอง (ใช้เมื่อเชื่อมต่อ AI ไม่ได้) ─── */
const KB: { keys: string[]; answer: string }[] = [
  { keys: ["ขนาดยา", "โดส", "amoxi"], answer: "โดยทั่วไป Amoxicillin ในสุนัข/แมวใช้ 10–20 mg/kg ทุก 12 ชม.\n\n⚠️ ข้อมูลอ้างอิงเบื้องต้น ควรพิจารณาน้ำหนัก อายุ และโรคประจำตัวก่อนสั่งจ่ายเสมอค่ะ" },
  { keys: ["อาเจียน", "ท้องเสีย"], answer: "อาการอาเจียน/ท้องเสียเบื้องต้น:\n• งดอาหาร 6–12 ชม. แล้วเริ่มอาหารอ่อน\n• ให้น้ำสะอาดเลี่ยงขาดน้ำ\n• ซึม เลือดปน หรือ >24 ชม. → ตรวจเพิ่มเติม" },
  { keys: ["วัคซีน", "เข็ม"], answer: "โปรแกรมวัคซีนลูกสุนัข:\n• 6–8 สัปดาห์: DHPP เข็มแรก\n• 10–12 สัปดาห์: กระตุ้น\n• 14–16 สัปดาห์: กระตุ้น + พิษสุนัขบ้า\n• จากนั้นทุกปี" },
];
const answerFor = (q: string) => {
  const t = q.toLowerCase();
  return (KB.find(k => k.keys.some(key => t.includes(key)))?.answer)
    ?? "ขออภัยค่ะ ตอนนี้เชื่อมต่อหมอเหมียวไม่ได้ กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ตค่ะ";
};

/* คลังคำถามแนะนำ — สุ่มมาแสดงครั้งละ 4 ข้อ */
const SUGGESTION_POOL = [
  { icon: Pill,        label: "ยาที่ใกล้หมดสต๊อก", q: "ตอนนี้มียาหรือสินค้าอะไรใกล้หมดสต๊อกบ้าง" },
  { icon: Stethoscope, label: "ข้อมูลคนไข้ บัดดี้", q: "ขอข้อมูลของบัดดี้หน่อย แพ้ยาอะไรไหม" },
  { icon: Syringe,     label: "สถานะผู้ป่วยใน (IPD)", q: "ตอนนี้ผู้ป่วยในมีกี่ตัว เตียงว่างเท่าไหร่" },
  { icon: Bone,        label: "คำนวณอาหารตามน้ำหนัก", q: "ช่วยคำนวณพลังงานอาหาร (RER/MER) สำหรับสุนัข 12 กก." },
  { icon: FileText,    label: "สรุปภาพรวมวันนี้", q: "สรุปภาพรวมของคลินิกวันนี้ให้หน่อย" },
  { icon: Calendar,    label: "นัดหมายวันนี้", q: "วันนี้มีนัดหมายกี่ราย ใครบ้าง" },
  { icon: Home,        label: "ห้องฝากเลี้ยงว่าง", q: "ตอนนี้มีห้องฝากเลี้ยงว่างกี่ห้อง" },
  { icon: Package,     label: "บริการ & ราคา", q: "คลินิกมีบริการอะไรบ้าง ราคาเท่าไหร่" },
  { icon: Syringe,     label: "โปรแกรมวัคซีนลูกสุนัข", q: "โปรแกรมวัคซีนลูกสุนัขเป็นอย่างไร" },
  { icon: Stethoscope, label: "สุนัขอาเจียน ทำยังไง", q: "สุนัขอาเจียนและไม่กินอาหาร ควรดูแลอย่างไร" },
  { icon: Pill,        label: "ขนาดยา Amoxicillin", q: "ขนาดยา Amoxicillin ในแมวเท่าไหร่" },
  { icon: Bone,        label: "โภชนาการแมวโรคไต", q: "แนะนำโภชนาการสำหรับแมวโรคไต" },
];
const pickSuggestions = () => [...SUGGESTION_POOL].sort(() => Math.random() - 0.5).slice(0, 4);

export function AIAssistant({ embedded = false, onClose }: { embedded?: boolean; onClose?: () => void } = {}) {
  const { owners } = useOwners();
  const { pets, updatePet } = usePets();
  const { stockProducts, services, boardingRooms, setBoardingRooms } = useClinicData();
  const ipd = useIPD();
  const { sendMessage, totalUnread } = useChat();
  const { appointments, addAppointment } = useAppointments();
  const { bills, addBill, holdBill, payBill } = useBilling();
  const confirm = useConfirm();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>(() => {
    try { const r = localStorage.getItem(STORE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);      // รอ token แรก
  const [busy, setBusy] = useState(false);          // กำลังทำงาน (stream/tool)
  const [recording, setRecording] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [suggestions, setSuggestions] = useState(pickSuggestions);
  const [dashOpen, setDashOpen] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const msgsRef = useRef<Msg[]>([]);
  const billsRef = useRef<Bill[]>(bills);   // เงาบิลล่าสุด (ให้ tool หลายตัวใน run เดียวเห็นการอัปเดตทันที)
  billsRef.current = bills;
  const abortRef = useRef<AbortController | null>(null);
  const pendingAiIdRef = useRef<string | null>(null);  // id ของบับเบิล AI ปัจจุบัน (ให้ render_dashboard แนบผลได้)
  const recRef = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  msgsRef.current = messages;

  useEffect(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, typing]);
  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(messages)); } catch { /* quota */ } }, [messages]);

  // สลับชุดคำถามแนะนำอัตโนมัติทุก 5 วิ (เฉพาะตอนอยู่หน้าเริ่มต้น)
  const started = messages.length > 0;
  useEffect(() => {
    if (started) return;
    const id = window.setInterval(() => setSuggestions(pickSuggestions()), 5000);
    return () => window.clearInterval(id);
  }, [started]);

  const matchOwners = (query: string) => {
    const s = query.trim().toLowerCase();
    if (!s) return [];
    return owners.filter(o => o.name.toLowerCase().includes(s) || o.nickname?.toLowerCase().includes(s) || (o.phone ?? "").includes(s));
  };
  const attachReceipt = (r: ReceiptSpec) => {
    const id = pendingAiIdRef.current;
    if (id) setMessages(prev => prev.map(m => m.id === id ? { ...m, receipt: r } : m));
  };
  const findBill = (billNo: string) => billsRef.current.find(b => b.billNo.toLowerCase() === billNo.trim().toLowerCase());

  /* ── executor ของ tools (อ่าน/เขียนข้อมูลจริงในแอป) + audit log ── */
  const runTool = async (name: string, args: Record<string, unknown>): Promise<string> => {
    const result = await execTool(name, args);
    logAudit(name, args, result);
    return result;
  };

  const execTool = async (name: string, args: Record<string, unknown>): Promise<string> => {
    const q = String(args.name ?? "").trim().toLowerCase();
    switch (name) {
      case "get_pet": {
        const p = pets.find(x => x.name.toLowerCase().includes(q) || x.nameEn?.toLowerCase().includes(q));
        if (!p) return `ไม่พบสัตว์เลี้ยงชื่อ "${args.name}"`;
        return JSON.stringify({
          ชื่อ: p.name, ชนิด: p.species, พันธุ์: p.breed, เพศ: p.gender, น้ำหนัก: p.weight, อายุ: p.age,
          แพ้ยา: p.allergies || "ไม่ระบุ", โรคประจำตัว: p.chronic || "ไม่มี", เจ้าของ: p.owner, เบอร์: p.ownerPhone,
          วัคซีนล่าสุด: p.vaccines?.slice(-2).map(v => `${v.name} (${v.date})`).join(", ") || "ไม่มี",
          จำนวนครั้งที่มา: p.visits,
        });
      }
      case "get_owner": {
        const o = owners.find(x => x.name.toLowerCase().includes(q) || x.nickname?.toLowerCase().includes(q));
        if (!o) return `ไม่พบเจ้าของชื่อ "${args.name}"`;
        return JSON.stringify({ ชื่อ: o.name, ชื่อเล่น: o.nickname, เบอร์: o.phone, LINE: o.lineId || "-", อีเมล: o.email || "-", สัตว์เลี้ยง: o.pets, มาแล้ว: `${o.totalVisits} ครั้ง` });
      }
      case "list_low_stock": {
        const low = stockProducts.filter(p => p.type === "stock" && p.stock < p.minStock);
        if (!low.length) return "ไม่มีสินค้าที่ต่ำกว่าจุดสั่งซื้อ";
        return JSON.stringify(low.map(p => ({ ชื่อ: p.name, คงเหลือ: `${p.stock} ${p.unit}`, จุดสั่งซื้อ: p.minStock, สถานะ: p.stock === 0 ? "หมด" : "ใกล้หมด" })));
      }
      case "get_product": {
        const p = stockProducts.find(x => x.name.toLowerCase().includes(q));
        if (!p) return `ไม่พบสินค้าชื่อ "${args.name}"`;
        return JSON.stringify({ ชื่อ: p.name, คงเหลือ: `${p.stock} ${p.unit}`, ราคาขาย: `${p.sellPrice} บาท`, หมวด: p.category });
      }
      case "get_ipd_status": {
        const admitted = ipd.admits.filter(a => !a.dischargedAt);
        const byWard: Record<string, { occupied: number; total: number }> = {};
        for (const c of ipd.cages) {
          const w = ipd.wards.find(x => x.id === c.ward)?.name ?? c.ward;
          (byWard[w] ??= { occupied: 0, total: 0 }).total++;
          if (c.status === "occupied") byWard[w].occupied++;
        }
        return JSON.stringify({
          ผู้ป่วยในทั้งหมด: admitted.length,
          รายชื่อ: admitted.slice(0, 8).map(a => `${a.petName} (${a.diagnosis || "-"})`),
          กรงแต่ละวอร์ด: Object.entries(byWard).map(([w, v]) => `${w}: ใช้ ${v.occupied}/${v.total}`),
        });
      }
      case "daily_overview": {
        const today = new Date().getDate();
        const todayAppts = appointments.filter(a => a.day === today);
        const admitted = ipd.admits.filter(a => !a.dischargedAt);
        const freeCages = ipd.cages.filter(c => c.status === "available").length;
        const low = stockProducts.filter(p => p.type === "stock" && p.stock < p.minStock);
        return JSON.stringify({
          นัดวันนี้: `${todayAppts.length} ราย`,
          รายการนัด: todayAppts.slice(0, 6).map(a => `${a.time} ${a.petName} (${a.type})`),
          ผู้ป่วยใน: `${admitted.length} ตัว`, กรงว่าง: freeCages,
          สินค้าใกล้หมด: low.length ? low.map(p => p.name) : "ไม่มี",
          แชทยังไม่อ่าน: `${totalUnread} ข้อความ`,
        });
      }
      case "render_dashboard": {
        const spec: DashSpec = {
          title: String(args.title ?? "สรุป"),
          subtitle: args.subtitle ? String(args.subtitle) : undefined,
          cards: Array.isArray(args.cards) ? (args.cards as DashCard[]) : [],
          chart: (args.chart && Array.isArray((args.chart as { data?: unknown }).data)) ? (args.chart as DashSpec["chart"]) : undefined,
        };
        const id = pendingAiIdRef.current;
        if (id) setMessages(prev => prev.map(m => m.id === id ? { ...m, dashboard: spec } : m));
        return "แสดงแดชบอร์ดในคำตอบเรียบร้อยแล้ว";
      }
      case "navigate_to": {
        const route = PAGE_ROUTES[String(args.page)];
        if (!route) return `ไม่รู้จักหน้า "${args.page}"`;
        navigate(route.path);
        showSnackbar("info", `เปิดหน้า ${route.label}`);
        return `เปิดหน้า ${route.label} ให้แล้ว`;
      }
      case "list_services": {
        const active = services.filter(s => s.active);
        if (!active.length) return "ไม่มีรายการบริการ";
        return JSON.stringify(active.slice(0, 20).map(s => ({ บริการ: s.name, หมวด: s.category, ราคา: `${s.price} บาท` })));
      }
      case "check_boarding": {
        const free = boardingRooms.filter(r => r.status === "ว่าง");
        const busy = boardingRooms.filter(r => r.status === "ไม่ว่าง");
        return JSON.stringify({
          ห้องว่าง: free.length, ไม่ว่าง: busy.length, ทั้งหมด: boardingRooms.length,
          รายการห้องว่าง: free.slice(0, 10).map(r => `${r.id} (${r.type})`),
        });
      }
      case "book_boarding": {
        const petName = String(args.petName ?? "").trim();
        if (!petName) return "ต้องระบุชื่อสัตว์";
        const roomId = String(args.roomId ?? "").trim();
        const room = roomId
          ? boardingRooms.find(r => r.id.toLowerCase() === roomId.toLowerCase())
          : boardingRooms.find(r => r.status === "ว่าง");
        if (!room) return roomId ? `ไม่พบห้อง "${roomId}"` : "ไม่มีห้องว่างในขณะนี้";
        if (room.status !== "ว่าง") return `ห้อง ${room.id} ไม่ว่าง (${room.status})`;
        const ok = await confirm({
          title: `จองห้องฝากเลี้ยง ${room.id}?`,
          description: `${petName} เข้าพักห้อง ${room.id} (${room.type})`,
          confirmLabel: "จองห้อง", cancelLabel: "ยกเลิก", kind: "info",
        });
        if (!ok) return "ผู้ใช้ยกเลิกการจอง";
        setBoardingRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: "ไม่ว่าง" as const, petName } : r));
        showSnackbar("success", `จองห้อง ${room.id} ให้ ${petName} แล้ว`);
        return `จองห้องฝากเลี้ยง ${room.id} (${room.type}) ให้ ${petName} เรียบร้อยแล้ว`;
      }
      case "get_appointments": {
        const day = Number(args.day) || new Date().getDate();
        const list = appointments.filter(a => a.day === day);
        if (!list.length) return `วันที่ ${day} ไม่มีนัดหมาย`;
        return JSON.stringify({ วันที่: day, จำนวน: list.length, รายการ: list.map(a => `${a.time} ${a.petName} (${a.type}) - ${a.vet}`) });
      }
      case "create_appointment": {
        const petName = String(args.petName ?? "").trim();
        const day = Number(args.day);
        const time = String(args.time ?? "").trim();
        if (!petName || !day || !time) return "ข้อมูลไม่ครบ ต้องมีชื่อสัตว์ วัน และเวลา";
        const type = ["การรักษา", "วัคซีน", "อาบน้ำ", "ฝากเลี้ยง"].includes(String(args.type)) ? String(args.type) : "การรักษา";
        const pet = pets.find(p => p.name.toLowerCase().includes(petName.toLowerCase()));
        const vet = String(args.vet ?? "").trim() || "สพ.ว. สมชาย";
        const ok = await confirm({
          title: "สร้างนัดหมายใหม่?",
          description: `${petName} · วันที่ ${day} เวลา ${time} น. · ${type} · ${vet}`,
          confirmLabel: "สร้างนัด", cancelLabel: "ยกเลิก", kind: "info",
        });
        if (!ok) return "ผู้ใช้ยกเลิกการสร้างนัด";
        addAppointment({ time, petName: pet?.name ?? petName, owner: pet?.owner ?? "", type: type as never, vet, day, status: "กำหนดการ", photo: pet?.image ?? "" });
        showSnackbar("success", `สร้างนัด ${petName} วันที่ ${day} เวลา ${time} แล้ว`);
        return `สร้างนัดหมายให้ ${petName} วันที่ ${day} เวลา ${time} น. (${type}) เรียบร้อยแล้ว`;
      }
      case "save_to_record": {
        const petName = String(args.petName ?? "").trim();
        const note = String(args.note ?? "").trim();
        if (!petName || !note) return "ต้องมีชื่อสัตว์และเนื้อหาที่จะบันทึก";
        const pet = pets.find(p => p.name.toLowerCase().includes(petName.toLowerCase()));
        if (!pet) return `ไม่พบสัตว์ชื่อ "${petName}"`;
        const ok = await confirm({
          title: `บันทึกลงเวชระเบียนของ ${pet.name}?`,
          description: note.slice(0, 160), confirmLabel: "บันทึก", cancelLabel: "ยกเลิก", kind: "info",
        });
        if (!ok) return "ผู้ใช้ยกเลิกการบันทึก";
        const d = new Date();
        const entry = {
          id: Date.now(), date: d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }),
          time: d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          type: "บันทึกจาก AI", weight: pet.weight, chiefComplaint: "", diagnosis: String(args.diagnosis ?? ""),
          treatment: "", medications: [] as string[], vet: "หมอเหมียว (AI)", notes: note,
        };
        updatePet(pet.id, { visitHistory: [...(pet.visitHistory ?? []), entry], visits: (pet.visits ?? 0) + 1 });
        showSnackbar("success", `บันทึกลงเวชระเบียนของ ${pet.name} แล้ว`);
        return `บันทึกลงเวชระเบียนของ ${pet.name} เรียบร้อยแล้ว`;
      }
      case "search_member": {
        const m = matchOwners(String(args.query ?? ""));
        if (!m.length) return `ไม่พบสมาชิกที่ตรงกับ "${args.query}"`;
        return JSON.stringify(m.slice(0, 6).map(o => ({ ชื่อ: o.name, ชื่อเล่น: o.nickname || "-", เบอร์: o.phone, สัตว์เลี้ยง: o.pets })));
      }
      case "list_bills": {
        const st = String(args.status ?? "all");
        const list = billsRef.current.filter(b => st === "all" || b.status === st);
        if (!list.length) return "ไม่มีบิลตามเงื่อนไข";
        return JSON.stringify(list.map(b => ({ เลขบิล: b.billNo, ลูกค้า: b.memberName, ยอด: `${billTotal(b)} บาท`, สถานะ: BILL_STATUS[b.status]?.label ?? b.status })));
      }
      case "create_bill": {
        const member = String(args.member ?? "").trim();
        const rawItems = Array.isArray(args.items) ? (args.items as { name?: unknown; qty?: unknown; price?: unknown }[]) : [];
        const items = rawItems.map(it => ({ name: String(it.name ?? "-"), qty: Number(it.qty) || 1, price: Number(it.price) || 0 })).filter(it => it.price >= 0 && it.name !== "-");
        if (!member || !items.length) return "ต้องระบุชื่อสมาชิกและรายการอย่างน้อย 1 รายการ";
        const owner = owners.find(o => o.name.toLowerCase().includes(member.toLowerCase()) || o.nickname?.toLowerCase().includes(member.toLowerCase()));
        const total = items.reduce((s, it) => s + it.qty * it.price, 0);
        const ok = await confirm({ title: "เปิดบิลใหม่?", description: `${owner?.name ?? member} · ${items.length} รายการ · รวม ${total} บาท`, confirmLabel: "เปิดบิล", cancelLabel: "ยกเลิก", kind: "info" });
        if (!ok) return "ผู้ใช้ยกเลิกการเปิดบิล";
        const bill = addBill(owner?.name ?? member, items, owner?.id);
        billsRef.current = [...billsRef.current, bill];
        attachReceipt(toReceipt(bill));
        showSnackbar("success", `เปิดบิล ${bill.billNo} แล้ว`);
        return `เปิดบิล ${bill.billNo} ให้ ${bill.memberName} ยอดรวม ${total} บาท เรียบร้อยแล้ว`;
      }
      case "hold_bill": {
        const bill = findBill(String(args.billNo ?? ""));
        if (!bill) return `ไม่พบบิล "${args.billNo}"`;
        if (bill.status === "paid") return `บิล ${bill.billNo} ชำระแล้ว พักไม่ได้`;
        const ok = await confirm({ title: "พักบิล?", description: `${bill.billNo} · ${bill.memberName} · ${billTotal(bill)} บาท`, confirmLabel: "พักบิล", cancelLabel: "ยกเลิก", kind: "warning" });
        if (!ok) return "ผู้ใช้ยกเลิก";
        holdBill(bill.id);
        billsRef.current = billsRef.current.map(b => b.id === bill.id ? { ...b, status: "held" } : b);
        showSnackbar("info", `พักบิล ${bill.billNo} แล้ว`);
        return `พักบิล ${bill.billNo} เรียบร้อยแล้ว (ยังไม่ชำระ)`;
      }
      case "pay_bill": {
        const bill = findBill(String(args.billNo ?? ""));
        if (!bill) return `ไม่พบบิล "${args.billNo}"`;
        if (bill.status === "paid") return `บิล ${bill.billNo} ชำระไปแล้ว (ใบเสร็จ ${bill.receiptNo})`;
        const method = ["เงินสด", "บัตร", "โอน", "QR"].includes(String(args.method)) ? String(args.method) : "เงินสด";
        const total = billTotal(bill);
        const ok = await confirm({ title: `รับชำระ ${total} บาท?`, description: `${bill.billNo} · ${bill.memberName} · ${method}`, confirmLabel: "รับชำระ & ออกใบเสร็จ", cancelLabel: "ยกเลิก", kind: "success" });
        if (!ok) return "ผู้ใช้ยกเลิกการชำระ";
        const receiptNo = payBill(bill.id, method);
        billsRef.current = billsRef.current.map(b => b.id === bill.id ? { ...b, status: "paid", method, receiptNo } : b);
        attachReceipt({ ...toReceipt(bill), status: "paid", method, receiptNo });
        showSnackbar("success", `ชำระเงินบิล ${bill.billNo} แล้ว`);
        return `รับชำระบิล ${bill.billNo} จำนวน ${total} บาท (${method}) ออกใบเสร็จ ${receiptNo} เรียบร้อยแล้ว`;
      }
      case "get_receipt": {
        const bill = findBill(String(args.billNo ?? ""));
        if (!bill) return `ไม่พบบิล "${args.billNo}"`;
        attachReceipt(toReceipt(bill));
        return `แสดง${bill.status === "paid" ? "ใบเสร็จ" : "บิล"} ${bill.billNo} · ${bill.memberName} · รวม ${billTotal(bill)} บาท (${BILL_STATUS[bill.status]?.label})`;
      }
      case "message_owner": {
        const target = String(args.owner ?? "").trim().toLowerCase();
        const body = String(args.message ?? "").trim();
        const o = owners.find(x => x.name.toLowerCase().includes(target) || x.nickname?.toLowerCase().includes(target));
        if (!o) return `ไม่พบเจ้าของชื่อ "${args.owner}" จึงยังไม่ได้ส่งข้อความ`;
        if (!body) return "ไม่มีเนื้อความให้ส่ง";
        const ok = await confirm({
          title: `ส่งข้อความถึง ${o.name}?`,
          description: `ข้อความ: "${body}"`,
          confirmLabel: "ส่งเข้าแชท", cancelLabel: "ยกเลิก", kind: "info",
        });
        if (!ok) return "ผู้ใช้ยกเลิกการส่งข้อความ";
        sendMessage(o.id, body);
        showSnackbar("success", `ส่งข้อความถึง ${o.name} แล้ว`);
        return `ส่งข้อความถึง ${o.name} เรียบร้อยแล้ว`;
      }
      default: return `ไม่รู้จักเครื่องมือ ${name}`;
    }
  };

  /* ── ส่งคำถามไปยัง AI agent (streaming + tools) ── */
  const send = async (visibleText: string, llmText?: string, image?: string) => {
    const text = visibleText.trim();
    if ((!text && !llmText && !image) || busy) return;
    const userMsg: Msg = { id: uid(), from: "user", text, ts: now(), context: llmText, image };
    setMessages(prev => [...prev, userMsg]);
    setDraft("");
    setTyping(true);
    setBusy(true);

    // ข้อความล่าสุด: ถ้ามีรูปให้ส่งแบบ multimodal (vision) มิฉะนั้นเป็นข้อความล้วน
    const newUser: AgentMessage = image
      ? { role: "user", content: [{ type: "text", text: llmText ?? text ?? "" }, { type: "image_url", image_url: { url: image } }] }
      : { role: "user", content: llmText ?? text };
    const convo: AgentMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...msgsRef.current.map(m => ({ role: (m.from === "ai" ? "assistant" : "user") as "assistant" | "user", content: m.image ? `${m.context ?? m.text} [ผู้ใช้แนบรูปภาพ]` : (m.context ?? m.text) })),
      newUser,
    ];

    const aiId = uid();
    pendingAiIdRef.current = aiId;
    const usedTools: string[] = [];
    let opened = false;
    const openBubble = () => {
      if (opened) return;
      opened = true;
      setTyping(false);
      setMessages(prev => [...prev, { id: aiId, from: "ai", text: "", ts: now() }]);
    };
    const ac = new AbortController();
    abortRef.current = ac;

    const runOn = (base: string) => streamAgent(convo, APP_TOOLS, runTool, {
      base, signal: ac.signal,
      onTool: (n) => {
        openBubble();  // เปิดบับเบิลทันทีเพื่อโชว์ว่ากำลังใช้เครื่องมือ
        if (!usedTools.includes(n)) { usedTools.push(n); setMessages(prev => prev.map(m => m.id === aiId ? { ...m, tools: [...usedTools] } : m)); }
      },
      onDelta: (delta) => { openBubble(); setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: m.text + delta } : m)); },
    });

    try {
      let full = "";
      try { full = await runOn(AI_BASE); }
      catch (e) {
        if ((e as Error).name === "AbortError") throw e;
        try { full = await runOn(AI_BASE_BACKUP); }                    // fallback โมเดลสำรอง
        catch (e2) {
          if ((e2 as Error).name === "AbortError") throw e2;
          await new Promise(r => setTimeout(r, 900));                  // auto-retry: เว้นจังหวะแล้วลองตัวหลักซ้ำอีกรอบ
          full = await runOn(AI_BASE);
        }
      }
      if (!opened) { openBubble(); setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: full || answerFor(text) } : m)); }
    } catch (e) {
      if ((e as Error).name === "AbortError") { setBusy(false); setTyping(false); return; }  // ผู้ใช้กดหยุด
      openBubble();
      const fb = answerFor(text);
      const reason = (e as Error)?.message?.slice(0, 140) || "ไม่ทราบสาเหตุ";
      // แนบสาเหตุทางเทคนิคเฉพาะตอนไม่มีคำตอบสำรองจากฐานความรู้ เพื่อช่วยวิเคราะห์ปัญหา
      const detail = fb.startsWith("ขออภัยค่ะ")
        ? `${fb}\n\n🔧 สาเหตุทางเทคนิค: ${reason}\nถ้าขึ้น "Failed to fetch" บ่อย ๆ อาจโดน ad-blocker/ส่วนขยายบล็อค — ลองเปิดหน้าต่างไม่ระบุตัวตนดูค่ะ แล้วกดปุ่ม 🔄 ใต้ข้อความนี้เพื่อลองใหม่`
        : fb;
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: detail } : m));
    } finally {
      setTyping(false); setBusy(false); abortRef.current = null;
    }
  };

  const stop = () => { abortRef.current?.abort(); setBusy(false); setTyping(false); };

  const regenerate = () => {
    if (busy) return;
    const arr = msgsRef.current;
    const lastUser = [...arr].reverse().find(m => m.from === "user");
    if (!lastUser) return;
    // ตัดคำตอบ AI ล่าสุดออกก่อนถามซ้ำ
    let cut = arr.length;
    for (let i = arr.length - 1; i >= 0; i--) { if (arr[i].id === lastUser.id) { cut = i; break; } }
    setMessages(arr.slice(0, cut));
    setTimeout(() => send(lastUser.text, lastUser.context, lastUser.image), 30);
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]); setDraft(""); setTyping(false); setBusy(false);
    setSuggestions(pickSuggestions());
    try { localStorage.removeItem(STORE_KEY); } catch { /* noop */ }
  };

  /* ── OCR: แนบเอกสาร/รูป → อ่านข้อความ → ให้ AI สรุป ── */
  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy) return;
    setOcrLoading(true);
    try {
      if (file.type.startsWith("image/")) {
        // รูปภาพ → วิเคราะห์ด้วย vision (ดูอาการสัตว์ / อ่านเอกสารที่ถ่ายมา)
        const dataUrl = await scaleImage(file);
        const prompt = "ช่วยดูรูปที่แนบมานี้ในฐานะหมอเหมียว:\n" +
          "• ถ้าเป็นรูปสัตว์เลี้ยง ให้ประเมินสิ่งที่มองเห็น เช่น บาดแผล บวม แดง ผื่น/ผิวหนัง ตา หู ท่าทาง การลงน้ำหนัก ระบุตำแหน่งที่น่ากังวลและอาการที่เป็นไปได้ พร้อมคำแนะนำเบื้องต้น\n" +
          "• ถ้าเป็นเอกสาร/ผลตรวจ ให้อ่านและสรุปค่าที่ผิดปกติ\n" +
          "ย้ำว่าเป็นการประเมินจากภาพเบื้องต้น ไม่แทนการตรวจร่างกายจริง";
        await send("", prompt, dataUrl);
      } else {
        // PDF/เอกสาร → OCR แล้วสรุป
        const text = await extractText(file);
        if (!text) { showSnackbar("warning", "อ่านเอกสารไม่พบข้อความ"); return; }
        const visible = `📎 แนบเอกสาร: ${file.name}`;
        const forLLM = `ช่วยอ่านและสรุปสาระสำคัญของเอกสารนี้ (ชื่อไฟล์: ${file.name}) แบบกระชับ เน้นค่าที่ผิดปกติหรือประเด็นทางคลินิก\n\n[เนื้อหาเอกสารจาก OCR]\n${text}`;
        await send(visible, forLLM);
      }
    } catch {
      showSnackbar("error", "ประมวลผลไฟล์ไม่สำเร็จ");
    } finally { setOcrLoading(false); }
  };

  /* ── Voice input (ASR): พูด → ข้อความ ── */
  const toggleMic = async () => {
    if (recording) {
      setRecording(false);
      try {
        const blob = await recRef.current?.stop();
        recRef.current = null;
        if (blob) {
          setOcrLoading(true);
          const text = await transcribe(blob);
          if (text) setDraft(d => (d ? d + " " : "") + text);
          else showSnackbar("warning", "ไม่ได้ยินเสียงพูด");
        }
      } catch { showSnackbar("error", "ถอดเสียงไม่สำเร็จ"); }
      finally { setOcrLoading(false); }
      return;
    }
    try {
      recRef.current = await startRecording();
      setRecording(true);
    } catch { showSnackbar("error", "เข้าถึงไมโครโฟนไม่ได้"); }
  };

  /* ── Voice output (TTS): อ่านคำตอบออกเสียง ── */
  const speak = async (m: Msg) => {
    if (speakingId === m.id) { audioRef.current?.pause(); audioRef.current = null; setSpeakingId(null); return; }
    audioRef.current?.pause();
    setSpeakingId(m.id);
    try {
      const blob = await synthesize(m.text.replace(/[*#•]/g, "").slice(0, 800));
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
      await audio.play();
    } catch { setSpeakingId(null); showSnackbar("error", "อ่านออกเสียงไม่สำเร็จ"); }
  };

  const copy = (m: Msg) => {
    navigator.clipboard?.writeText(m.text).then(() => { setCopiedId(m.id); setTimeout(() => setCopiedId(null), 1500); });
  };

  const lastAiId = [...messages].reverse().find(m => m.from === "ai")?.id;

  /* ── KPI งานที่ต้องทำวันนี้ (หน้าเริ่มต้น · แตะเพื่อให้ AI สรุป) ── */
  const todoDay = new Date().getDate();
  const todoAppts = appointments.filter(a => a.day === todoDay).length;
  const todoAdmitted = ipd.admits.filter(a => !a.dischargedAt).length;
  const todoLowStock = stockProducts.filter(p => p.type === "stock" && p.stock < p.minStock).length;
  const todoBills = bills.filter(b => b.status !== "paid").length;
  const todoKpis = [
    { label: "นัดวันนี้", value: `${todoAppts} ราย`, tone: "#0ea5e9", q: "สรุปนัดหมายวันนี้ให้หน่อย มีใครบ้าง ช่วงเวลาไหน" },
    { label: "ผู้ป่วยใน", value: `${todoAdmitted} ตัว`, tone: "#0d7c66", q: "สรุปสถานะผู้ป่วยในตอนนี้ให้หน่อย" },
    { label: "ของใกล้หมด", value: `${todoLowStock} รายการ`, tone: todoLowStock ? "#ef4444" : "#22c55e", q: "มีสินค้าใกล้หมดอะไรบ้าง ต้องสั่งเพิ่มเท่าไหร่" },
    { label: "บิลค้าง/พักไว้", value: `${todoBills} ใบ`, tone: todoBills ? "#f59e0b" : "#22c55e", q: "มีบิลค้างชำระหรือบิลที่พักไว้ไหม สรุปให้หน่อย" },
  ];

  /* ── สรุปสถิติสำหรับแดชบอร์ด ── */
  const ACTION_TOOLS = ["message_owner", "create_appointment", "save_to_record", "book_boarding"];
  const computeStats = () => {
    const audit = getAudit();
    const counts: Record<string, number> = {};
    for (const a of audit) counts[a.tool] = (counts[a.tool] ?? 0) + 1;
    const bars = Object.entries(counts)
      .map(([tool, count]) => ({ name: TOOL_LABEL[tool] ?? tool, count }))
      .sort((a, b) => b.count - a.count).slice(0, 8);
    const day = new Date().getDate();
    return {
      questions: messages.filter(m => m.from === "user").length,
      answers: messages.filter(m => m.from === "ai" && m.text).length,
      toolCalls: audit.length,
      actions: audit.filter(a => ACTION_TOOLS.includes(a.tool)).length,
      bars,
      snapshot: {
        appts: appointments.filter(a => a.day === day).length,
        admitted: ipd.admits.filter(a => !a.dischargedAt).length,
        lowStock: stockProducts.filter(p => p.type === "stock" && p.stock < p.minStock).length,
        unread: totalUnread,
      },
    };
  };
  const stats = dashOpen ? computeStats() : null;

  return (
    <div className={`${embedded ? "" : "p-4 sm:p-6"} h-full flex flex-col`}>
      <style>{`
        @keyframes aiDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
        .ai-dot{ width:6px;height:6px;border-radius:9999px;background:#a78bfa;animation:aiDot 1.2s infinite ease-in-out }
        @keyframes recPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.75} }
        @keyframes wave { 0%,100%{transform:scaleY(0.28)} 50%{transform:scaleY(1)} }
        .wave-bar{ width:3px; height:22px; border-radius:3px; background:linear-gradient(#c4b5fd,#a78bfa); transform-origin:center; animation:wave 0.85s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce){ .ai-dot,.wave-bar{ animation:none } }
      `}</style>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-0" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)" }}>
        {/* Header — minimal */}
        <div className="px-5 py-3.5 flex items-center gap-3 flex-shrink-0 border-b border-gray-100 bg-white">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.10)" }}>
            <Sparkles className="w-5 h-5" style={{ color: "#7c3aed" }} strokeWidth={2.3} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 text-[15.5px]" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>หมอเหมียว</p>
            <p className="text-gray-400 text-[11px]" style={{ fontWeight: 500 }}>ผู้ช่วย AI · เชื่อมข้อมูลคลินิก · อ่านเอกสาร · สั่งงานด้วยเสียง</p>
          </div>
          <button onClick={() => setDashOpen(true)} title="แดชบอร์ดสรุปสถิติ"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 hover:bg-gray-100 hover:text-[#7c3aed] transition-colors">
            <BarChart3 className="w-4 h-4" />
          </button>
          <button onClick={() => { setAuditLog(getAudit().slice().reverse()); setAuditOpen(true); }} title="ประวัติการใช้งาน AI"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <History className="w-4 h-4" />
          </button>
          {started && (
            <button onClick={reset} className="flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] flex-shrink-0 transition-colors text-gray-500 hover:bg-gray-100" style={{ fontWeight: 600 }}>
              <RefreshCw className="w-3.5 h-3.5" /> เริ่มใหม่
            </button>
          )}
          {onClose && (
            <button onClick={onClose} title="ปิด (Esc)" className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Audit log modal */}
        {auditOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setAuditOpen(false)}>
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
            <div className="relative w-full max-w-[460px] max-h-[80%] bg-white rounded-2xl overflow-hidden flex flex-col" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
                <History className="w-4 h-4 text-[#7c3aed]" />
                <p className="text-[14px] text-gray-900 flex-1" style={{ fontWeight: 800 }}>ประวัติการใช้งาน AI</p>
                <button onClick={() => setAuditOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {auditLog.length === 0 ? (
                  <p className="text-[12px] text-gray-400 text-center py-8">ยังไม่มีบันทึกการใช้เครื่องมือ</p>
                ) : auditLog.map((e, i) => (
                  <div key={i} className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(124,58,237,0.10)" }}>
                      <Wrench className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] text-gray-800" style={{ fontWeight: 700 }}>{TOOL_LABEL[e.tool] ?? e.tool}</span>
                        <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">{fmtTime(e.ts)}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{e.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* แดชบอร์ดสรุปสถิติ */}
        {dashOpen && stats && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setDashOpen(false)}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
            <div className="relative w-full max-w-[560px] max-h-[86%] bg-white rounded-2xl overflow-hidden flex flex-col" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.28)" }} onClick={e => e.stopPropagation()}>
              <div className="px-4 py-3 flex items-center gap-2.5 flex-shrink-0" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                <BarChart3 className="w-[18px] h-[18px] text-white" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-white" style={{ fontWeight: 800 }}>แดชบอร์ดสรุปจากหมอเหมียว</p>
                  <p className="text-[10.5px] text-white/80">สถิติการถาม-ตอบ · การใช้เครื่องมือ · ภาพรวมคลินิก</p>
                </div>
                <button onClick={() => setDashOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* การ์ดสถิติการถาม-ตอบ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { icon: MessageSquare, label: "คำถามที่ถาม", value: stats.questions, tone: "#0ea5e9" },
                    { icon: Sparkles, label: "คำตอบ AI", value: stats.answers, tone: "#7c3aed" },
                    { icon: Wrench, label: "เรียกเครื่องมือ", value: stats.toolCalls, tone: "#0d7c66" },
                    { icon: Zap, label: "ทำ action", value: stats.actions, tone: "#f59e0b" },
                  ] as const).map(c => {
                    const Ico = c.icon;
                    return (
                      <div key={c.label} className="rounded-xl px-3 py-2.5 border border-gray-100" style={{ background: `linear-gradient(135deg, ${c.tone}0d, ${c.tone}05)` }}>
                        <Ico className="w-4 h-4 mb-1" style={{ color: c.tone }} />
                        <p className="text-[18px] leading-none" style={{ fontWeight: 800, color: c.tone }}>{c.value}</p>
                        <p className="text-[10px] text-gray-500 mt-1" style={{ fontWeight: 600 }}>{c.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* กราฟการใช้เครื่องมือ */}
                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-[12.5px] text-gray-800 mb-2" style={{ fontWeight: 700 }}>การใช้เครื่องมือแต่ละชนิด</p>
                  {stats.bars.length === 0 ? (
                    <p className="text-[11.5px] text-gray-400 py-6 text-center">ยังไม่มีการใช้เครื่องมือ — ลองถามข้อมูลในระบบดูก่อนนะคะ</p>
                  ) : (
                    <div style={{ width: "100%", height: Math.max(120, stats.bars.length * 36) }}>
                      <ResponsiveContainer>
                        <BarChart data={stats.bars} layout="vertical" margin={{ left: 0, right: 24, top: 2, bottom: 2 }}>
                          <XAxis type="number" hide domain={[0, "dataMax"]} allowDecimals={false} />
                          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "#4b5563" }} axisLine={false} tickLine={false} />
                          <RTooltip cursor={{ fill: "rgba(124,58,237,0.06)" }} contentStyle={{ borderRadius: 10, border: "1px solid #eee", fontSize: 12 }} formatter={(v: number) => [`${v} ครั้ง`, "ใช้งาน"]} />
                          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}
                            label={{ position: "right", fontSize: 11, fill: "#6b7280", fontWeight: 700 }}>
                            {stats.bars.map((_, i) => <Cell key={i} fill={`hsl(${262 - i * 8}, 70%, ${58 + i * 2}%)`} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* ภาพรวมคลินิกสด */}
                <div>
                  <p className="text-[12.5px] text-gray-800 mb-2" style={{ fontWeight: 700 }}>ภาพรวมคลินิกวันนี้</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {([
                      { label: "นัดวันนี้", value: `${stats.snapshot.appts} ราย`, tone: "#0ea5e9" },
                      { label: "ผู้ป่วยใน", value: `${stats.snapshot.admitted} ตัว`, tone: "#0d7c66" },
                      { label: "ของใกล้หมด", value: `${stats.snapshot.lowStock}`, tone: stats.snapshot.lowStock ? "#ef4444" : "#22c55e" },
                      { label: "แชทค้าง", value: `${stats.snapshot.unread}`, tone: stats.snapshot.unread ? "#f59e0b" : "#22c55e" },
                    ] as const).map(c => (
                      <div key={c.label} className="rounded-xl px-3 py-2.5 border border-gray-100 bg-gray-50/40">
                        <p className="text-[10px] text-gray-500" style={{ fontWeight: 600 }}>{c.label}</p>
                        <p className="text-[15px] mt-0.5 truncate" style={{ fontWeight: 800, color: c.tone }}>{c.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thread */}
        <div ref={threadRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 min-h-0 flex flex-col" style={{ background: "radial-gradient(120% 100% at 50% 0%, rgba(124,58,237,0.04) 0%, rgba(249,250,251,0.6) 40%)" }}>
          {!started && !typing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden bg-white" style={{ boxShadow: "0 10px 30px rgba(124,58,237,0.22), inset 0 0 0 1px rgba(124,58,237,0.12)" }}>
                <img src={mohMiew} alt="หมอเหมียว" className="w-full h-full object-cover" draggable={false} />
              </div>
              <p className="text-gray-900 text-[18px] mt-5" style={{ fontWeight: 800, letterSpacing: "-0.3px" }}>สวัสดีค่ะคุณหมอ หมอเหมียวเองค่ะ 👋</p>
              <p className="text-gray-500 text-[13px] mt-1.5 max-w-[380px]">ถามข้อมูลคนไข้/สต๊อก/ผู้ป่วยใน แนบผลแล็บให้ช่วยสรุป หรือสั่งงานด้วยเสียงได้เลยค่ะ</p>

              {/* KPI งานที่ต้องทำวันนี้ */}
              <div className="w-full max-w-[560px] mt-5">
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <ClipboardList className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#7c3aed" }} />
                  <p className="text-[11px] text-gray-400" style={{ fontWeight: 700, letterSpacing: "0.2px" }}>งานที่ต้องทำวันนี้ · แตะเพื่อให้หมอเหมียวสรุป</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {todoKpis.map((k, i) => (
                    <motion.button key={k.label} onClick={() => send(k.q)}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(124,58,237,0.12)" }} whileTap={{ scale: 0.97 }}
                      className="text-left rounded-2xl px-3 py-2.5 bg-white border border-gray-100 hover:border-[#c4b5fd] transition-colors"
                      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                      <p className="text-[10.5px] text-gray-500 truncate" style={{ fontWeight: 600 }}>{k.label}</p>
                      <p className="text-[15px] mt-0.5 truncate" style={{ fontWeight: 800, color: k.tone }}>{k.value}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 w-full max-w-[560px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  {suggestions.map((s, i) => {
                    const Ico = s.icon;
                    return (
                      <motion.button key={s.label} onClick={() => send(s.q)} layout
                        initial={{ opacity: 0, y: 14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.96 }}
                        transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -3, boxShadow: "0 10px 24px rgba(124,58,237,0.14)" }}
                        whileTap={{ scale: 0.97 }}
                        className="group flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white border border-gray-100 text-left hover:border-[#c4b5fd]"
                        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_4px_12px_rgba(124,58,237,0.3)]"
                          style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.10),rgba(79,70,229,0.10))" }}>
                          <Ico className="w-[18px] h-[18px] transition-colors" style={{ color: "#7c3aed" }} />
                        </div>
                        <span className="text-[13px] text-gray-700 flex-1 transition-colors group-hover:text-gray-900" style={{ fontWeight: 600 }}>{s.label}</span>
                        <ArrowRight className="w-4 h-4 text-[#7c3aed] flex-shrink-0 opacity-0 -translate-x-1.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ) : (
          <div className="max-w-[720px] mx-auto w-full">
            {messages.map(m => {
              const mine = m.from === "user";
              return (
                <div key={m.id} className={`flex items-end gap-2.5 mb-3 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white" style={{ boxShadow: "0 2px 6px rgba(79,70,229,0.25), inset 0 0 0 1px rgba(124,58,237,0.12)" }}>
                      <img src={aiIcon} alt="AI" className="w-6 h-6 object-contain" draggable={false} />
                    </div>
                  )}
                  <div className={`flex flex-col ${!mine && m.dashboard ? "max-w-[94%] w-full" : "max-w-[80%]"}`} style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
                    {/* chip แสดง tool ที่ AI ใช้ */}
                    {!mine && m.tools && m.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {m.tools.map(tn => (
                          <span key={tn} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.10)", color: "#7c3aed", fontWeight: 600 }}>
                            <Wrench className="w-2.5 h-2.5" /> {TOOL_LABEL[tn] ?? tn}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="px-4 py-2.5 text-[13.5px] leading-relaxed break-words"
                      style={mine
                        ? { background: "linear-gradient(135deg,#19a589,#0d7c66)", color: "#fff", borderRadius: 18, borderBottomRightRadius: 6, boxShadow: "0 2px 8px rgba(13,124,102,0.22)", whiteSpace: "pre-wrap" }
                        : { background: "#ffffff", color: "#374151", borderRadius: 18, borderBottomLeftRadius: 6, border: "1px solid #eef0f2", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                      {mine
                        ? <>
                            {m.image && <img src={m.image} alt="" className="rounded-xl mb-1.5 block" style={{ maxWidth: 220, width: "100%" }} />}
                            {m.text}
                          </>
                        : (m.text ? renderMarkdown(m.text) : <span className="text-gray-400">…</span>)}
                    </div>
                    {!mine && m.dashboard && <DashboardBlock d={m.dashboard} />}
                    {!mine && m.receipt && <ReceiptBlock r={m.receipt} />}
                    <div className="flex items-center gap-2 mt-1 px-1">
                      {m.ts > 0 && <span className="text-[9.5px] text-gray-400">{fmtTime(m.ts)}</span>}
                      {!mine && m.text && (
                        <>
                          <button onClick={() => copy(m)} title="คัดลอก" className="text-gray-300 hover:text-gray-500 transition-colors">
                            {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-[#16a34a]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => speak(m)} title="อ่านออกเสียง" className="text-gray-300 hover:text-[#7c3aed] transition-colors">
                            {speakingId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7c3aed]" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                          {m.id === lastAiId && !busy && (
                            <button onClick={regenerate} title="สร้างคำตอบใหม่" className="text-gray-300 hover:text-gray-500 transition-colors">
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {mine && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <User className="w-4 h-4 text-gray-500" strokeWidth={2.2} />
                    </div>
                  )}
                </div>
              );
            })}

            {typing && (
              <div className="flex items-end gap-2.5 mb-3 justify-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white" style={{ boxShadow: "0 2px 6px rgba(79,70,229,0.25), inset 0 0 0 1px rgba(124,58,237,0.12)" }}>
                  <img src={aiIcon} alt="AI" className="w-6 h-6 object-contain" draggable={false} />
                </div>
                <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-md border border-gray-100 flex items-center gap-1" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                  <span className="ai-dot" style={{ animationDelay: "0ms" }} />
                  <span className="ai-dot" style={{ animationDelay: "160ms" }} />
                  <span className="ai-dot" style={{ animationDelay: "320ms" }} />
                </div>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 sm:px-6 pt-3 pb-2.5 border-t border-gray-100 flex flex-col gap-1.5 flex-shrink-0 bg-white">
          <div className="max-w-[720px] w-full mx-auto flex items-end gap-2">
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onPickFile} />
            {recording ? (
              /* ── โหมดอัดเสียง: บาร์สีเข้ม + คลื่นเสียง ── */
              <div className="flex-1 flex items-center gap-3 rounded-3xl pl-4 pr-1.5 py-1 transition-colors"
                style={{ background: "linear-gradient(135deg,#312e81,#1e1b4b)", boxShadow: "0 4px 16px rgba(49,46,129,0.35)" }}>
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" style={{ animation: "recPulse 1s infinite" }} />
                <span className="text-[12px] text-white flex-shrink-0" style={{ fontWeight: 600 }}>กำลังฟัง…</span>
                <div className="flex-1 flex items-center justify-center gap-[3px] h-8 overflow-hidden">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span key={i} className="wave-bar" style={{ animationDelay: `${(i % 7) * 0.09}s`, height: `${10 + (i * 5 % 16)}px` }} />
                  ))}
                </div>
                <button type="button" onClick={toggleMic} title="หยุดอัดเสียง"
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                  style={{ background: "#ef4444", boxShadow: "0 2px 8px rgba(239,68,68,0.5)" }}>
                  <Square className="w-3.5 h-3.5" fill="#fff" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-end gap-1 rounded-3xl border border-gray-200 bg-gray-50/70 pl-1.5 pr-1.5 py-1 focus-within:border-[#7c3aed] focus-within:bg-white transition-colors">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={busy || ocrLoading} title="แนบเอกสาร/รูป (OCR)"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#7c3aed] flex-shrink-0 disabled:opacity-40">
                  {ocrLoading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Paperclip className="w-[18px] h-[18px]" />}
                </button>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                  rows={1}
                  placeholder="พิมพ์คำถาม หรือแนบผลแล็บ / กดไมค์พูด…"
                  className="flex-1 bg-transparent resize-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400 py-2 leading-snug"
                  style={{ maxHeight: 112 }}
                />
                <button type="button" onClick={toggleMic} disabled={busy} title="พูดเป็นข้อความ"
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors" style={{ color: "#9ca3af" }}>
                  <Mic className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}
            {recording ? null : busy ? (
              <button onClick={stop} title="หยุด"
                className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all hover:scale-105 active:scale-95"
                style={{ background: "#ef4444", boxShadow: "0 4px 12px rgba(239,68,68,0.35)" }}>
                <Square className="w-4 h-4" fill="#fff" />
              </button>
            ) : (
              <button onClick={() => send(draft)} disabled={!draft.trim()}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 12px rgba(79,70,229,0.35)" }}>
                <Send className="w-[18px] h-[18px]" style={{ marginLeft: -1 }} />
              </button>
            )}
          </div>
          {/* PDPA / disclaimer */}
          <div className="max-w-[720px] w-full mx-auto flex items-center gap-1.5 px-1">
            <ShieldCheck className="w-3 h-3 text-gray-300 flex-shrink-0" />
            <span className="text-[10px] text-gray-400">ข้อมูลบางส่วนถูกส่งไปประมวลผลที่เซิร์ฟเวอร์ AI · เป็นข้อมูลอ้างอิง สัตวแพทย์ตรวจสอบก่อนใช้เสมอ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
