/* ─────────────────────────────────────────────────────────────
   QR ลงทะเบียนแอป Pawmely — ให้เจ้าของสัตว์สแกนที่เคาน์เตอร์

   ข้อมูลทั้งหมดดึงจากที่บันทึกไว้ใน EHP แล้ว (ชื่อ เบอร์ อีเมล ไลน์
   และสัตว์ในความดูแล) เจ้าของจึงไม่ต้องกรอกอะไรซ้ำอีก

   ⏱ หมดอายุใน 10 นาที — QR ใบนี้พาเข้าถึงข้อมูลส่วนตัวได้
   จึงต้องมีอายุ ไม่งั้นภาพที่ถูกถ่ายเก็บไว้จะใช้ได้ตลอดไป
   เวลาหมดอายุฝังอยู่ใน payload ด้วย ฝั่ง Pawmely ตรวจซ้ำได้เอง
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { X, QrCode, RefreshCw, Clock, AlertTriangle, Link2Off, Download } from "lucide-react";
import type { Pet } from "../data/animals/types";
import { buildInvite, inviteUrl, INVITE_TTL_MS } from "../lib/pawmely";

interface Props {
  owner: { id: number; name: string; phone: string; email: string; lineId: string; sendToPawmely?: boolean };
  pets: Pet[];
  onClose: () => void;
}

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export function PawmelyQrModal({ owner, pets, onClose }: Props) {
  /* issuedAt เปลี่ยนทีเดียวตอนกด "สร้างรหัสใหม่" — ใช้เป็นตัวบังคับสร้าง QR ใหม่
     (ถ้าสร้าง invite ใหม่ทุก render, QR จะกะพริบตลอดเพราะ payload มี iat) */
  const [issuedAt, setIssuedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  const invite = useMemo(() => buildInvite(owner, pets, issuedAt), [owner, pets, issuedAt]);
  const url = useMemo(() => inviteUrl(invite), [invite]);

  const left = issuedAt + INVITE_TTL_MS - now;
  const expired = left <= 0;

  /* เดินนาฬิกาทุกวินาที — หยุดเองเมื่อหมดอายุ ไม่ปล่อย timer ค้าง */
  useEffect(() => {
    if (expired) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expired]);

  /* ปิดด้วย Esc — โมดัลนี้เปิดค้างต่อหน้าลูกค้า ต้องปิดได้ไวโดยไม่ต้องหาปุ่ม */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* เตือนล่วงหน้าตอนเหลือไม่ถึง 1 นาที — จะได้กดสร้างใหม่ก่อนลูกค้าสแกนไม่ทัน */
  const urgent = !expired && left <= 60_000;

  /* ── ดาวน์โหลดเป็น PNG ──
     วาด QR ซ้ำอีกใบเป็น <canvas> ที่ซ่อนไว้ ความละเอียดสูงกว่าที่แสดงบนจอ
     (จอใช้ SVG เพราะคมทุกความละเอียด แต่ SVG แปลงเป็นไฟล์ภาพตรง ๆ ไม่ได้)
     ขนาด 640 ให้พอสำหรับส่งไลน์หรือพิมพ์ใส่กระดาษได้โดยไม่แตก */
  const canvasRef = useRef<HTMLDivElement>(null);
  const download = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const safe = owner.name.replace(/[\\/:*?"<>|\s]+/g, "-").slice(0, 40) || "owner";
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `pawmely-${safe}.png`;
    a.click();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-[400px] vet-modal relative" onClick={e => e.stopPropagation()}>

          <div className="vet-modal-header rounded-t-3xl">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="vet-modal-header-icon"><QrCode className="w-[20px] h-[20px] text-white" /></div>
                <div>
                  <h2 className="vet-section-title">ลงทะเบียนแอป Pawmely</h2>
                  <p className="vet-tiny mt-[2px]">ให้เจ้าของสัตว์สแกนด้วยกล้องมือถือ</p>
                </div>
              </div>
              <button onClick={onClose} className="vet-modal-close"><X className="w-[16px] h-[16px] text-gray-500" /></button>
            </div>
          </div>

          <div className="p-5 flex flex-col items-center gap-3">
            {/* เจ้าของไม่ได้เปิดส่งข้อมูล — ลงทะเบียนได้ แต่ข้อมูลจะไม่ตามไปอัปเดต */}
            {!owner.sendToPawmely && (
              <div className="w-full flex items-start gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.32)" }}>
                <Link2Off className="w-3.5 h-3.5 flex-shrink-0 mt-[2px]" style={{ color: "#b45309" }} />
                <p className="text-[11.5px]" style={{ color: "#b45309" }}>
                  เจ้าของรายนี้ยังไม่ได้ติ๊ก “ส่งข้อมูลไปยัง Pawmely” — ลงทะเบียนได้ แต่ข้อมูลจะไม่อัปเดตตามหลังจากนี้
                </p>
              </div>
            )}

            {/* ── ตัว QR ── */}
            <div className="relative rounded-2xl bg-white p-3" style={{ border: "1px solid #eef0f2" }}>
              <QRCodeSVG value={url} size={216} level="M" marginSize={0} />
              {expired && (
                /* ทับด้วยฝ้าแทนการซ่อน — ให้เห็นว่าของอยู่ตรงนี้ แค่ต้องสร้างใหม่ */
                <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(2px)" }}>
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <p className="text-[12.5px] text-gray-700" style={{ fontWeight: 700 }}>รหัสหมดอายุแล้ว</p>
                  <button onClick={() => { const t = Date.now(); setIssuedAt(t); setNow(t); }}
                    className="vet-btn vet-btn-primary vet-btn-sm inline-flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> สร้างรหัสใหม่
                  </button>
                </div>
              )}
            </div>

            {/* ── นับถอยหลัง + ดาวน์โหลด ── */}
            <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: expired ? "rgba(239,68,68,0.08)" : urgent ? "rgba(245,158,11,0.10)" : "color-mix(in srgb, var(--brand) 8%, transparent)",
                border: `1px solid ${expired ? "rgba(239,68,68,0.30)" : urgent ? "rgba(245,158,11,0.35)" : "color-mix(in srgb, var(--brand) 25%, transparent)"}`,
              }}>
              <Clock className="w-3.5 h-3.5" style={{ color: expired ? "#b91c1c" : urgent ? "#b45309" : "var(--brand-dark)" }} />
              <span className="text-[12px]" style={{ fontWeight: 700, color: expired ? "#b91c1c" : urgent ? "#b45309" : "var(--brand-dark)" }}>
                {expired ? "หมดอายุแล้ว" : `หมดอายุใน ${mmss(left)}`}
              </span>
            </div>
            {/* ดาวน์โหลดได้เฉพาะตอนยังไม่หมดอายุ — ไฟล์ที่โหลดไปแล้วสแกนไม่ผ่านอยู่ดี */}
            <button onClick={download} disabled={expired}
              title={expired ? "รหัสหมดอายุแล้ว — สร้างใหม่ก่อน" : "ดาวน์โหลด QR เป็นไฟล์ภาพ"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontWeight: 600 }}>
              <Download className="w-3.5 h-3.5" /> ดาวน์โหลด
            </button>
            </div>

            {/* ใบสำหรับแปลงเป็นไฟล์เท่านั้น ไม่ได้แสดงผล */}
            <div ref={canvasRef} className="hidden" aria-hidden>
              <QRCodeCanvas value={url} size={640} level="M" marginSize={2} />
            </div>

            {/* ── สรุปสิ่งที่ติดไปกับ QR ── */}
            <div className="w-full rounded-2xl px-3.5 py-3" style={{ background: "#fafafa", border: "1px solid #f1f3f5" }}>
              <p className="text-[12.5px] text-gray-800 truncate" style={{ fontWeight: 700 }}>{owner.name}</p>
              <p className="text-[11.5px] text-gray-500 mt-0.5">
                {owner.phone || "ไม่มีเบอร์โทร"} · สัตว์ {pets.length} ตัว
                {pets.length > 0 && <span className="text-gray-400"> ({pets.map(p => p.name).join(", ")})</span>}
              </p>
            </div>

            <p className="vet-tiny text-center">
              สแกนแล้วแอปจะดึงข้อมูลเจ้าของและสัตว์ไปกรอกให้อัตโนมัติ · รหัสมีอายุ 10 นาทีเพื่อความปลอดภัย
            </p>
          </div>

          <div className="vet-modal-footer">
            <button onClick={() => { const t = Date.now(); setIssuedAt(t); setNow(t); }}
              className="vet-btn vet-btn-secondary inline-flex items-center gap-1.5">
              <RefreshCw className="w-[15px] h-[15px]" /> สร้างรหัสใหม่
            </button>
            <button onClick={onClose} className="vet-btn vet-btn-primary btn-green">เสร็จสิ้น</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
