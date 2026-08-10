/* ─────────────────────────────────────────────────────────────
   ตั้งค่าโปรโมชั่นใหม่ — คูปองส่วนลด / แพ็กเกจ

   สองแบบใช้ฟอร์มเดียวกัน สลับเฉพาะช่วงกลางที่ต่างกันจริง ๆ
   (คูปองถาม % ลด · แพ็กเกจถามจำนวนสิทธิ์ ราคา อายุ การโอนสิทธิ์)
   ส่วนหัวและส่วนท้ายเหมือนกัน จึงไม่แยกเป็นสองฟอร์ม
   ───────────────────────────────────────────────────────────── */
import { useMemo, useState } from "react";
import { Ticket, Package, Bell, Check } from "lucide-react";
import { DatePickerModern } from "./DatePickerModern";
import { usePets } from "../contexts/PetsContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import {
  PROMO_SCOPES, perUsePrice,
  type Promotion, type PromoKind, type PromoScope,
} from "../lib/promotions";

const PKG_VALID_DAYS = [30, 90, 180];

const labelCls = "block text-[11.5px] text-gray-500 mb-1.5";

/* สวิตช์เปิด-ปิดพร้อมคำอธิบาย — ใช้ซ้ำ 2 ที่ในฟอร์มนี้ */
function SwitchRow({ on, onToggle, title, sub }: {
  on: boolean; onToggle: () => void; title: string; sub: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left"
      style={{
        borderColor: on ? "color-mix(in srgb, var(--brand) 40%, transparent)" : "#e5e7eb",
        background: on ? "color-mix(in srgb, var(--brand) 6%, transparent)" : "#fafafa",
      }}>
      <span className="flex-1 min-w-0">
        <span className="block text-[12.5px]" style={{ fontWeight: 700, color: on ? "var(--brand-dark)" : "#374151" }}>{title}</span>
        <span className="block text-[11px] text-gray-500 mt-0.5">{sub}</span>
      </span>
      <span className="w-[38px] h-[21px] rounded-full flex-shrink-0 p-[2px] transition-colors"
        style={{ background: on ? "var(--brand)" : "#d1d5db" }}>
        <span className="block w-[17px] h-[17px] rounded-full bg-white transition-transform"
          style={{ transform: on ? "translateX(17px)" : "translateX(0)", boxShadow: "0 1px 2px rgba(0,0,0,0.18)" }} />
      </span>
    </button>
  );
}

interface Props {
  editing?: Promotion | null;
  onSave: (p: Promotion) => void;
  onCancel?: () => void;
}

export function PromotionForm({ editing, onSave, onCancel }: Props) {
  const { pets } = usePets();
  const { showSnackbar } = useSnackbar();

  const [kind, setKind]         = useState<PromoKind>(editing?.kind ?? "coupon");
  const [name, setName]         = useState(editing?.name ?? "");
  const [code, setCode]         = useState(editing?.code ?? "");
  const [scopes, setScopes]     = useState<PromoScope[]>(editing?.scopes ?? ["groom"]);
  const [percent, setPercent]   = useState(editing?.discountPercent ?? 50);
  const [expiry, setExpiry]     = useState(editing?.expiry?.slice(0, 10) ?? "");
  const [quota, setQuota]       = useState(String(editing?.quota ?? 5));
  const [price, setPrice]       = useState(String(editing?.price ?? ""));
  const [unitPrice, setUnitPrice] = useState(String(editing?.unitPrice ?? ""));
  const [validDays, setValidDays] = useState(editing?.validDays ?? 90);
  const [transferable, setTransferable] = useState(editing?.transferable ?? false);
  const [bindPet, setBindPet]   = useState(editing?.petId != null);
  const [petId, setPetId]       = useState<number | null>(editing?.petId ?? null);

  const toggleScope = (k: PromoScope) =>
    setScopes(s => (s.includes(k) ? s.filter(x => x !== k) : [...s, k]));

  const q = Number(quota) || 0;
  const pr = Number(price) || 0;
  const up = Number(unitPrice) || 0;
  const normalTotal = up * q;

  const petOptions = useMemo(
    () => pets.map(p => ({ id: p.id, label: `${p.name} (${p.breed})${p.owner ? ` - ${p.owner}` : ""}` })),
    [pets],
  );

  const submit = () => {
    if (!name.trim())      { showSnackbar("error", "ระบุชื่อโปรโมชั่น"); return; }
    if (!scopes.length)    { showSnackbar("error", "เลือกบริการที่ร่วมรายการอย่างน้อย 1 อย่าง"); return; }
    if (kind === "package" && q <= 0) { showSnackbar("error", "จำนวนสิทธิ์ต้องมากกว่า 0"); return; }
    /* ผูกกับสัตว์เลี้ยงแต่ยังไม่เลือกตัว = ผูกไม่สำเร็จ ต้องกันไว้ */
    if (bindPet && petId == null)     { showSnackbar("error", "เลือกสัตว์เลี้ยงที่จะผูกสิทธิ์"); return; }

    onSave({
      id: editing?.id ?? `p${Date.now()}`,
      kind, name: name.trim(), scopes, active: editing?.active ?? true,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      ...(kind === "coupon"
        ? { code: code.trim().toUpperCase() || undefined, discountPercent: percent, expiry: expiry || undefined }
        : { quota: q, price: pr, unitPrice: up || undefined, validDays, transferable }),
      petId: bindPet ? petId : null,
      petLabel: bindPet ? petOptions.find(o => o.id === petId)?.label : undefined,
    });
  };

  return (
    <div className="space-y-3.5">
      {/* ── ประเภทโปรโมชั่น ── */}
      <div>
        <label className={labelCls}>ประเภทโปรโมชั่น</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { k: "coupon"  as const, icon: Ticket,  label: "คูปองส่วนลด" },
            { k: "package" as const, icon: Package, label: "แพ็กเกจ" },
          ]).map(o => {
            const on = kind === o.k;
            const Ico = o.icon;
            return (
              <button key={o.k} type="button" onClick={() => setKind(o.k)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-colors"
                style={{
                  borderColor: on ? "var(--brand)" : "#e5e7eb",
                  background: on ? "color-mix(in srgb, var(--brand) 7%, transparent)" : "#fafafa",
                  color: on ? "var(--brand-dark)" : "#6b7280",
                  fontWeight: on ? 700 : 500,
                }}>
                <Ico className="w-4 h-4" />
                <span className="text-[12.5px]">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelCls}>ชื่อโปรโมชั่น <span className="required">*</span></label>
        <input className="vet-input" value={name} onChange={e => setName(e.target.value)}
          placeholder={kind === "package" ? "แพ็กเกจอาบน้ำตัดขน 5 ครั้ง" : "ลด 50% ค่าอาบน้ำตัดขน"} />
      </div>

      {/* ── บริการที่ร่วมรายการ ── */}
      <div>
        <label className={labelCls}>บริการที่ร่วมรายการ <span className="required">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {PROMO_SCOPES.map(sc => {
            const on = scopes.includes(sc.key);
            return (
              <button key={sc.key} type="button" onClick={() => toggleScope(sc.key)}
                className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[12.5px] transition-colors"
                style={{
                  borderColor: on ? "var(--brand)" : "#e5e7eb",
                  background: on ? "color-mix(in srgb, var(--brand) 7%, transparent)" : "#fafafa",
                  color: on ? "var(--brand-dark)" : "#6b7280",
                  fontWeight: on ? 700 : 500,
                }}>
                {on && <Check className="w-3 h-3" strokeWidth={3} />}
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ ช่วงที่ต่างกันตามประเภท ═══ */}
      {kind === "coupon" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>รหัสคูปอง</label>
              <input className="vet-input" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="GROOM50" style={{ letterSpacing: "0.05em", fontWeight: 600 }} />
            </div>
            <div>
              <label className={labelCls}>วันหมดอายุ</label>
              <DatePickerModern value={expiry} onChange={setExpiry} placeholder="ไม่มีวันหมดอายุ" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls} style={{ marginBottom: 0 }}>ลดเท่าไหร่</label>
              <span className="inline-flex items-baseline gap-0.5 px-2.5 py-0.5 rounded-full"
                style={{ background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand-dark)" }}>
                <span className="text-[16px]" style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{percent}</span>
                <span className="text-[11px]" style={{ fontWeight: 700 }}>%</span>
              </span>
            </div>
            {/* --fill บอก CSS ว่าระบายรางถึงไหน — CSS อ่านค่าของ input[range] เองไม่ได้ */}
            <input type="range" min={1} max={100} value={percent}
              onChange={e => setPercent(Number(e.target.value))}
              className="vet-range" style={{ ["--fill" as string]: `${percent}%` }} />
            {/* หมายจุดที่ใช้บ่อย — กดเลือกได้เลย ไม่ต้องลากให้ตรงเป๊ะ */}
            <div className="flex items-center justify-between mt-1.5">
              {[10, 25, 50, 75, 100].map(v => (
                <button key={v} type="button" onClick={() => setPercent(v)}
                  className="text-[10.5px] px-1.5 py-0.5 rounded-md transition-colors"
                  style={{ color: percent === v ? "var(--brand-dark)" : "#9ca3af", fontWeight: percent === v ? 700 : 500 }}>
                  {v}%
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>จำนวนสิทธิ์ (ครั้ง) <span className="required">*</span></label>
              <input type="number" min={1} className="vet-input no-spin" value={quota}
                onChange={e => setQuota(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>ราคาแพ็กเกจ (฿)</label>
              <input type="number" min={0} className="vet-input no-spin" value={price}
                onChange={e => setPrice(e.target.value)} placeholder="2200" />
            </div>
          </div>
          <div>
            <label className={labelCls}>ราคาปกติต่อครั้ง (฿)</label>
            <input type="number" min={0} className="vet-input no-spin" value={unitPrice}
              onChange={e => setUnitPrice(e.target.value)} placeholder="550" />
          </div>
          {/* เทียบให้เห็นว่าคุ้มแค่ไหน — ตัวเลขนี้คือสิ่งที่พนักงานใช้อธิบายลูกค้า */}
          {q > 0 && pr > 0 && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl text-[12px]"
              style={{ background: "#f6f7f9", border: "1px solid #eef0f2" }}>
              <span className="text-gray-500">
                {up > 0 ? <>ราคาปกติ {q} x ฿{up.toLocaleString()} = <span className="line-through">฿{normalTotal.toLocaleString()}</span></> : `แพ็กเกจ ${q} ครั้ง`}
              </span>
              <span className="text-(--brand-dark)" style={{ fontWeight: 700 }}>
                เฉลี่ย ฿{perUsePrice(pr, q).toLocaleString()}/ครั้ง
              </span>
            </div>
          )}
          <div>
            <label className={labelCls}>อายุแพ็กเกจหลังซื้อ</label>
            <div className="grid grid-cols-3 gap-2">
              {PKG_VALID_DAYS.map(d => {
                const on = validDays === d;
                return (
                  <button key={d} type="button" onClick={() => setValidDays(d)}
                    className="py-2 rounded-xl border text-[12.5px] transition-colors"
                    style={{
                      borderColor: on ? "var(--brand)" : "#e5e7eb",
                      background: on ? "color-mix(in srgb, var(--brand) 7%, transparent)" : "#fafafa",
                      color: on ? "var(--brand-dark)" : "#6b7280",
                      fontWeight: on ? 700 : 500,
                    }}>{d} วัน</button>
                );
              })}
            </div>
          </div>
          <SwitchRow on={transferable} onToggle={() => setTransferable(v => !v)}
            title="โอนสิทธิ์ให้สัตว์เลี้ยงตัวอื่นได้" sub="เผื่อลูกค้ามีสัตว์เลี้ยงหลายตัว" />
        </>
      )}

      {/* ── ผูกกับสัตว์เลี้ยง ── */}
      <SwitchRow on={bindPet} onToggle={() => setBindPet(v => !v)}
        title="ผูกกับสัตว์เลี้ยงตัวนี้โดยเฉพาะ" sub="ล็อกไว้ที่ 1 ตัว ไม่ให้แชร์สิทธิ์ได้" />

      {bindPet && (
        <>
          <select className="vet-select" value={petId ?? ""}
            onChange={e => setPetId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">— เลือกสัตว์เลี้ยง —</option>
            {petOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.30)" }}>
            <Bell className="w-3.5 h-3.5 flex-shrink-0 mt-[2px]" style={{ color: "#b45309" }} />
            <p className="text-[11.5px]" style={{ color: "#b45309" }}>
              เมื่อผูกกับสัตว์เลี้ยง ระบบจะแจ้งเตือนไปแอป Pawmely อัตโนมัติทุกครั้งที่ใช้สิทธิ์ และเมื่อใกล้หมดสิทธิ์/หมดอายุ
            </p>
          </div>
        </>
      )}

      {/* ปุ่มท้ายฟอร์ม — ชิดขวาและกว้างเท่ากัน ชุดเดียวกับแถบท้ายโมดัลอื่น */}
      <div className="flex items-center justify-end gap-2.5 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="vet-btn vet-btn-secondary" style={{ minWidth: 112 }}>
            ยกเลิก
          </button>
        )}
        <button type="button" onClick={submit} className="vet-btn vet-btn-primary btn-green" style={{ minWidth: 112 }}>
          <Check className="w-4 h-4" /> {editing ? "บันทึกการแก้ไข" : "สร้างโปรโมชั่น"}
        </button>
      </div>
    </div>
  );
}
