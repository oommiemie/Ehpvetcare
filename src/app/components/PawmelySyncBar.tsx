/* ─────────────────────────────────────────────────────────────
   แถบสถานะการส่งข้อมูลไป Pawmely — ใช้ที่หน้ารายละเอียดสัตว์

   บอก 4 สถานะที่ต้องแก้คนละทาง จึงแยกให้ชัดไม่รวมเป็น "ผิดพลาด" ก้อนเดียว
     ปิดอยู่      → เจ้าของไม่ได้ติ๊ก "ส่งข้อมูลไปยัง Pawmely" (แก้ที่ข้อมูลเจ้าของ)
     รอต่อระบบ   → ยังไม่ได้ตั้ง VITE_PAWMELY_BASE (แก้ที่ตั้งค่าระบบ)
     กำลังส่ง     → อยู่ในคิว
     ส่งแล้ว      → สำเร็จ พร้อมเวลาล่าสุด
     ส่งไม่สำเร็จ → มีข้อความ error + กดลองใหม่ได้ทันที
   ───────────────────────────────────────────────────────────── */
import { Send, CheckCircle2, AlertCircle, Clock, Link2Off, RefreshCw } from "lucide-react";
import type { Pet } from "../data/animals/types";
import { usePawmely } from "../contexts/PawmelyContext";
import { useOwners } from "../contexts/OwnersContext";

const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "";

export function PawmelySyncBar({ pet }: { pet: Pet }) {
  const { statusOf, syncNow, configured } = usePawmely();
  const { owners } = useOwners();

  const owner = owners.find(o => o.name === pet.owner);
  const enabled = !!owner?.sendToPawmely;
  const st = statusOf(pet.hn);

  /* เจ้าของไม่ได้เปิดส่ง — บอกเบา ๆ ว่าทำไมข้อมูลไม่ขึ้นที่ Pawmely
     ไม่ซ่อนทิ้ง เพราะ "ไม่มีอะไรขึ้นเลย" คือสิ่งที่ทำให้คนสงสัยว่าระบบพัง */
  if (!enabled) {
    return (
      <Bar tone="muted" icon={<Link2Off className="w-3.5 h-3.5" />}
        title="ไม่ได้ส่งข้อมูลไป Pawmely"
        detail="เจ้าของรายนี้ไม่ได้ติ๊ก “ส่งข้อมูลไปยัง Pawmely” — เปิดได้ที่ข้อมูลเจ้าของ" />
    );
  }

  if (!configured) {
    return (
      <Bar tone="warn" icon={<Clock className="w-3.5 h-3.5" />}
        title="รอเชื่อมต่อระบบ Pawmely"
        detail="ข้อมูลถูกเก็บเข้าคิวไว้แล้ว จะส่งอัตโนมัติเมื่อตั้งค่าปลายทางเรียบร้อย" />
    );
  }

  if (st?.state === "error") {
    return (
      <Bar tone="error" icon={<AlertCircle className="w-3.5 h-3.5" />}
        title="ส่งข้อมูลไป Pawmely ไม่สำเร็จ"
        detail={`${st.error ?? ""} · ลองใหม่อัตโนมัติแล้ว ${st.attempts} ครั้ง`}
        action={<RetryButton onClick={() => syncNow(pet)} />} />
    );
  }

  if (st?.state === "queued") {
    return (
      <Bar tone="info" icon={<Send className="w-3.5 h-3.5" />}
        title="กำลังส่งข้อมูลไป Pawmely"
        detail="ระบบกำลังทยอยส่งเบื้องหลัง ไม่ต้องรอหน้านี้" />
    );
  }

  return (
    <Bar tone="ok" icon={<CheckCircle2 className="w-3.5 h-3.5" />}
      title="ข้อมูลตรงกับ Pawmely แล้ว"
      detail={st?.syncedAt ? `ส่งล่าสุด ${fmtTime(st.syncedAt)}` : "จะส่งอัตโนมัติเมื่อมีการแก้ไขข้อมูล"}
      action={<RetryButton onClick={() => syncNow(pet)} label="ส่งอีกครั้ง" />} />
  );
}

function RetryButton({ onClick, label = "ลองใหม่" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}
      className="vet-btn vet-btn-secondary vet-btn-sm inline-flex items-center gap-1.5 flex-shrink-0">
      <RefreshCw className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

const TONES = {
  ok:    { bg: "rgba(16,185,129,0.07)",  bd: "rgba(16,185,129,0.30)",  fg: "#047857" },
  info:  { bg: "rgba(14,165,233,0.07)",  bd: "rgba(14,165,233,0.30)",  fg: "#0369a1" },
  warn:  { bg: "rgba(245,158,11,0.08)",  bd: "rgba(245,158,11,0.32)",  fg: "#b45309" },
  error: { bg: "rgba(239,68,68,0.07)",   bd: "rgba(239,68,68,0.30)",   fg: "#b91c1c" },
  muted: { bg: "#fafafa",                bd: "#e5e7eb",                fg: "#6b7280" },
} as const;

function Bar({ tone, icon, title, detail, action }: {
  tone: keyof typeof TONES;
  icon: React.ReactNode;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl"
      style={{ background: t.bg, border: `1px solid ${t.bd}` }}>
      <span className="flex-shrink-0" style={{ color: t.fg }}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] truncate" style={{ color: t.fg, fontWeight: 700 }}>{title}</p>
        <p className="text-[11px] text-gray-500 truncate mt-0.5">{detail}</p>
      </div>
      {action}
    </div>
  );
}
