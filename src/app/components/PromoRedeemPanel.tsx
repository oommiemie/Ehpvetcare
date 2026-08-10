/* ─────────────────────────────────────────────────────────────
   ใช้คูปอง / ตัดสิทธิ์แพ็กเกจ ที่หน้าชำระเงิน

   ตัวเดียวใช้ได้ทั้งตรวจรักษา (OPD/IPD) · อาบน้ำตัดขน · ฝากเลี้ยง
   ต่างกันแค่ scope ที่ส่งเข้ามา — เพราะหน้าจอและกติกาเหมือนกันหมด
   แยกเป็นคนละอันจะกลายเป็นโค้ดสี่ชุดที่ต้องแก้พร้อมกันทุกครั้ง

   ตัวนี้ไม่เก็บยอดเงินเอง — คืนส่วนลดผ่าน onChange ให้หน้าที่เรียกไป
   คิดรวมกับบิลของตัวเอง เพราะโครงสร้างบิลแต่ละหน้าไม่เหมือนกัน
   ───────────────────────────────────────────────────────────── */
import { useMemo, useState } from "react";
import { Ticket, Package, Check, X, Clock, AlertTriangle } from "lucide-react";
import {
  listPromotions, listRedemptions, redeem, undoLastRedeem,
  blockReason, discountFor, remainingQuota, expiryOf, usedCount, BLOCK_TEXT,
  type Promotion, type PromoScope,
} from "../lib/promotions";
import { fmtThaiDate } from "../utils/format";
import { useSnackbar } from "../contexts/SnackbarContext";

const baht = (n: number) => `฿${n.toLocaleString("th-TH")}`;

interface Props {
  scope: PromoScope;
  subtotal: number;
  pet?: { id: number; name: string } | null;
  /** ส่วนลดรวมที่ใช้อยู่ — หน้าที่เรียกเอาไปหักจากยอดบิล */
  onChange: (discount: number, appliedIds: string[]) => void;
}

export function PromoRedeemPanel({ scope, subtotal, pet, onChange }: Props) {
  const { showSnackbar } = useSnackbar();
  /* tick บังคับให้อ่าน localStorage ใหม่หลังกดใช้/ยกเลิก */
  const [tick, setTick] = useState(0);
  const [applied, setApplied] = useState<string[]>([]);

  const rows = useMemo(() => listRedemptions(), [tick]);
  const promos = useMemo(() => listPromotions(), [tick]);

  /* แยกใช้ได้ / ใช้ไม่ได้ — ใช้ไม่ได้ยังต้องเห็น พร้อมเหตุผล
     ไม่งั้นลูกค้ายื่นคูปองมาแล้วหาไม่เจอ จะไม่รู้ว่าเพราะอะไร */
  const { usable, blocked } = useMemo(() => {
    const u: Promotion[] = [], b: { p: Promotion; why: string }[] = [];
    for (const p of promos) {
      const why = blockReason(p, { scope, petId: pet?.id ?? null, rows });
      if (why) { if (why !== "wrong-scope") b.push({ p, why: BLOCK_TEXT[why] }); }
      else u.push(p);
    }
    return { usable: u, blocked: b };
  }, [promos, rows, scope, pet?.id]);

  const totalDiscount = useMemo(
    () => applied.reduce((t, id) => {
      const p = promos.find(x => x.id === id);
      return p ? t + discountFor(p, subtotal) : t;
    }, 0),
    [applied, promos, subtotal],
  );

  const push = (ids: string[]) => {
    setApplied(ids);
    onChange(
      ids.reduce((t, id) => {
        const p = promos.find(x => x.id === id);
        return p ? t + discountFor(p, subtotal) : t;
      }, 0),
      ids,
    );
  };

  const use = (p: Promotion) => {
    const d = discountFor(p, subtotal);
    redeem({ promoId: p.id, at: new Date().toISOString(), scope, petId: pet?.id ?? null, petName: pet?.name, amount: d });
    setTick(t => t + 1);
    push([...applied, p.id]);
    showSnackbar("success", p.kind === "package"
      ? `ตัดสิทธิ์แพ็กเกจ "${p.name}" 1 ครั้ง`
      : `ใช้คูปอง ${p.code ?? p.name} — ลด ${baht(d)}`);
  };

  const cancel = (p: Promotion) => {
    undoLastRedeem(p.id);
    setTick(t => t + 1);
    push(applied.filter(id => id !== p.id));
    showSnackbar("update", `ยกเลิกการใช้ "${p.name}" แล้ว`);
  };

  const recent = rows.slice(0, 3);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100">
          <Ticket className="w-[18px] h-[18px] text-gray-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(14px * var(--fs))", letterSpacing: "-0.2px" }}>
            คูปอง / โปรโมชั่น / Package
          </h3>
          <p className="text-[11px] text-gray-500 truncate">
            {pet ? `สิทธิ์ของ${pet.name}` : "สิทธิ์ที่ใช้ได้กับบิลนี้"}
          </p>
        </div>
        {totalDiscount > 0 && (
          <span className="text-[13px] text-(--brand-dark) flex-shrink-0" style={{ fontWeight: 800 }}>
            −{baht(totalDiscount)}
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        {usable.length === 0 && blocked.length === 0 && (
          <p className="text-[12.5px] text-gray-400 py-6 text-center">ไม่มีคูปองหรือแพ็กเกจที่ใช้ได้</p>
        )}

        {usable.map(p => {
          const on = applied.includes(p.id);
          const d = discountFor(p, subtotal);
          const left = remainingQuota(p, rows);
          const exp = expiryOf(p);
          const used = usedCount(p.id, rows);
          const isPkg = p.kind === "package";
          return (
            <div key={p.id} className="rounded-xl p-3 transition-colors"
              style={{
                border: on ? "1.5px solid color-mix(in srgb, var(--brand) 45%, transparent)" : "1.5px solid #f3f4f6",
                background: on ? "color-mix(in srgb, var(--brand) 5%, transparent)" : "#fff",
              }}>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isPkg ? "rgba(139,92,246,0.12)" : "rgba(245,158,11,0.14)" }}>
                  {isPkg ? <Package className="w-4 h-4" style={{ color: "#7c3aed" }} />
                         : <Ticket className="w-4 h-4" style={{ color: "#d97706" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-gray-900 truncate" style={{ fontWeight: 700 }}>
                    {p.code ? `${p.code} · ` : ""}{p.name}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {isPkg
                      ? `ตัด 1 สิทธิ์ · ลด ${baht(d)}`
                      : `ลด ${p.discountPercent}% · ลด ${baht(d)}`}
                    {exp && ` · หมด ${fmtThaiDate(exp.toISOString())}`}
                  </p>
                </div>
                {on ? (
                  <button onClick={() => cancel(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] text-gray-500 border border-gray-200 hover:bg-gray-50 flex-shrink-0 transition-colors"
                    style={{ fontWeight: 600 }}>
                    <X className="w-3 h-3" /> ยกเลิก
                  </button>
                ) : (
                  <button onClick={() => use(p)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11.5px] text-white flex-shrink-0 transition-colors"
                    style={{ background: "var(--brand)", fontWeight: 700 }}>
                    <Check className="w-3 h-3" strokeWidth={3} /> ใช้
                  </button>
                )}
              </div>

              {/* แถบสิทธิ์คงเหลือ — เห็นทันทีว่าใช้ไปกี่ครั้งจากทั้งหมด */}
              {isPkg && p.quota ? (
                <div className="mt-2.5">
                  <div className="flex gap-1">
                    {Array.from({ length: p.quota }).map((_, i) => (
                      <span key={i} className="h-1.5 flex-1 rounded-full"
                        style={{ background: i < used ? "var(--brand)" : "#e5e7eb" }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10.5px] text-gray-500">
                    <span>ใช้ไปแล้ว {used} ครั้ง</span>
                    <span style={{ fontWeight: 700, color: left <= 1 ? "#d97706" : undefined }}>คงเหลือ {left} ครั้ง</span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {/* ใช้ไม่ได้ — แสดงพร้อมเหตุผล กันงงว่าทำไมคูปองที่ลูกค้ามีไม่ขึ้น */}
        {blocked.map(({ p, why }) => (
          <div key={p.id} className="flex items-center gap-2.5 rounded-xl p-3 opacity-60"
            style={{ border: "1.5px solid #f3f4f6", background: "#fafafa" }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-gray-600 truncate" style={{ fontWeight: 600 }}>
                {p.code ? `${p.code} · ` : ""}{p.name}
              </p>
            </div>
            <span className="text-[10.5px] text-gray-400 flex-shrink-0">{why}</span>
          </div>
        ))}

        {recent.length > 0 && (
          <div className="pt-2 mt-1 border-t border-gray-100">
            <p className="text-[10.5px] text-gray-400 mb-1.5" style={{ fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
              การใช้งานล่าสุด
            </p>
            {recent.map(r => {
              const p = promos.find(x => x.id === r.promoId);
              return (
                <div key={r.id} className="flex items-center gap-2 text-[11px] text-gray-500 py-0.5">
                  <Clock className="w-3 h-3 flex-shrink-0 text-gray-300" />
                  <span className="flex-shrink-0">{fmtThaiDate(r.at)}</span>
                  <span className="truncate flex-1">{p?.name ?? "—"}{r.petName ? ` · ${r.petName}` : ""}</span>
                  <span className="flex-shrink-0" style={{ fontWeight: 600 }}>−{baht(r.amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
