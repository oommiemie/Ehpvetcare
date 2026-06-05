import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Activity, Bandage, Plus, Clock, X, Check, ChevronDown,
} from "lucide-react";
import { useIPD, type NursingNote } from "../../contexts/IPDContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";

type SubKind = "soap" | "note" | "wound";

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });

type FilterKind = "all" | "soap" | "note" | "wound";

export function NursingNotesTab({ admitId }: { admitId: number }) {
  const { nursingNotes, wounds } = useIPD();
  const [showAdd, setShowAdd] = useState<SubKind | null>(null);
  const [filter, setFilter] = useState<FilterKind>("all");
  const [showAddMenu, setShowAddMenu] = useState(false);

  const soapNotes = useMemo(() => nursingNotes.filter(n => n.admitId === admitId && n.kind === "SOAP").sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [nursingNotes, admitId]);
  const generalNotes = useMemo(() => nursingNotes.filter(n => n.admitId === admitId && n.kind === "Note").sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [nursingNotes, admitId]);
  const woundRecs = useMemo(() => wounds.filter(w => w.admitId === admitId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [wounds, admitId]);

  /* Unified timeline (all 3 types merged, sorted chronological) */
  type Event = { kind: "SOAP" | "Note" | "Wound"; time: string; by: string; title: string; detail?: string; raw: any };
  const timeline: Event[] = useMemo(() => {
    const events: Event[] = [];
    soapNotes.forEach(n => events.push({
      kind: "SOAP", time: n.timestamp, by: n.recordedBy,
      title: n.assessment || n.subjective || "SOAP Note",
      detail: [n.subjective && `S: ${n.subjective}`, n.objective && `O: ${n.objective}`, n.assessment && `A: ${n.assessment}`, n.plan && `P: ${n.plan}`].filter(Boolean).join(" · "),
      raw: n,
    }));
    generalNotes.forEach(n => events.push({
      kind: "Note", time: n.timestamp, by: n.recordedBy,
      title: n.note ?? "",
      raw: n,
    }));
    woundRecs.forEach(w => events.push({
      kind: "Wound", time: w.timestamp, by: w.recordedBy,
      title: `${w.location}${w.size ? ` (${w.size})` : ""} — ${w.description}`,
      detail: `Treatment: ${w.treatment}`,
      raw: w,
    }));
    return events.sort((a, b) => b.time.localeCompare(a.time));
  }, [soapNotes, generalNotes, woundRecs]);

  const columnsCfg = [
    { kind: "soap" as const,  title: "SOAP Note",    sub: "S/O/A/P",       color: "#0d7c66", grad: "linear-gradient(135deg, #34d399, #0d7c66)", icon: FileText, items: timeline.filter(e => e.kind === "SOAP") },
    { kind: "note" as const,  title: "Nursing Note", sub: "บันทึกพยาบาล",  color: "#7c3aed", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", icon: Activity, items: timeline.filter(e => e.kind === "Note") },
    { kind: "wound" as const, title: "Wound Care",   sub: "บันทึกแผล",     color: "#d97706", grad: "linear-gradient(135deg, #fbbf24, #d97706)", icon: Bandage,  items: timeline.filter(e => e.kind === "Wound") },
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {columnsCfg.map(col => {
          const Ico = col.icon;
          return (
            <section
              key={col.kind}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
            >
              {/* Column header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/80">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-100 flex-shrink-0">
                  <Ico className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 inline-flex items-center gap-1.5" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>
                    {col.title}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${col.color}15`, color: col.color, fontWeight: 800 }}>{col.items.length}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">{col.sub}</p>
                </div>
                <button
                  onClick={() => setShowAdd(col.kind)}
                  className="vet-btn vet-btn-orange inline-flex items-center gap-1"
                  aria-label={`เพิ่ม ${col.title}`}
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่ม
                </button>
              </div>

              {/* Column body */}
              <div className="p-3 space-y-2 flex-1 max-h-[560px] overflow-y-auto">
                {col.items.length === 0 ? (
                  <button
                    onClick={() => setShowAdd(col.kind)}
                    className="w-full py-8 px-3 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 transition-colors flex flex-col items-center gap-1.5"
                  >
                    <Ico className="w-8 h-8" strokeWidth={1.5} />
                    <div className="text-[11.5px]" style={{ fontWeight: 600 }}>ยังไม่มี {col.title}</div>
                    <div className="text-[10.5px] inline-flex items-center gap-0.5" style={{ color: col.color, fontWeight: 700 }}>
                      <Plus className="w-3 h-3" /> เพิ่มบันทึกแรก
                    </div>
                  </button>
                ) : (
                  col.items.map((evt, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-gray-100 bg-white p-3 hover:bg-gray-50/50 transition-colors"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-gray-700" style={{ fontWeight: 600 }}>
                        <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span>{fmtDateTime(evt.time)}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-500 truncate">{evt.by}</span>
                      </div>
                      <div className="text-[12.5px] text-gray-800" style={{ fontWeight: 600, lineHeight: 1.5 }}>{evt.title}</div>
                      {evt.detail && (
                        <div className="text-[11.5px] text-gray-600 mt-1" style={{ lineHeight: 1.6 }}>{evt.detail}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <AnimatePresence>
        {showAdd && <AddModal admitId={admitId} kind={showAdd} onClose={() => setShowAdd(null)} />}
      </AnimatePresence>
    </>
  );
}

function KindBadge({ kind }: { kind: "SOAP" | "Note" | "Wound" }) {
  const cfg = {
    SOAP:  { color: "#0d7c66", bg: "rgba(25,165,137,0.10)", label: "SOAP" },
    Note:  { color: "#7c3aed", bg: "rgba(139,92,246,0.10)", label: "Note" },
    Wound: { color: "#d97706", bg: "rgba(245,158,11,0.10)", label: "Wound" },
  }[kind];
  return (
    <span className="text-[9.5px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: cfg.bg, color: cfg.color, fontWeight: 800, letterSpacing: "0.3px" }}>
      {cfg.label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="vet-label">{label}</label>{children}</div>;
}

function AddModal({ admitId, kind, onClose }: { admitId: number; kind: SubKind; onClose: () => void }) {
  const { addNursingNote, addWound } = useIPD();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const nurseName = user?.displayName ?? "เจ้าหน้าที่";
  const nowISO = new Date().toISOString();

  const [s, setS] = useState(""); const [o, setO] = useState("");
  const [a, setA] = useState(""); const [p, setP] = useState("");
  const [note, setNote] = useState("");
  const [wLoc, setWLoc] = useState(""); const [wSize, setWSize] = useState("");
  const [wDesc, setWDesc] = useState(""); const [wTx, setWTx] = useState("");

  const submit = () => {
    if (kind === "soap") addNursingNote({ admitId, timestamp: nowISO, recordedBy: nurseName, kind: "SOAP", subjective: s, objective: o, assessment: a, plan: p });
    else if (kind === "note") addNursingNote({ admitId, timestamp: nowISO, recordedBy: nurseName, kind: "Note", note });
    else if (kind === "wound") addWound({ admitId, timestamp: nowISO, recordedBy: nurseName, location: wLoc, size: wSize, description: wDesc, treatment: wTx });
    const labels = { soap: "บันทึก SOAP", note: "Nursing Note", wound: "Wound Care" };
    showSnackbar("success", `บันทึก${labels[kind]}สำเร็จ`);
    onClose();
  };

  const titles = { soap: "บันทึก SOAP Note", note: "บันทึก Nursing Note", wound: "บันทึก Wound Care" };
  const icons = { soap: FileText, note: Activity, wound: Bandage };
  const Ico = icons[kind];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.20 }} className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header flex items-center gap-3">
          <div className="vet-modal-header-icon"><Ico className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: 16 }}>{titles[kind]}</h3>
            <p className="text-[11px] text-gray-500">โดย {nurseName} · {fmtDateTime(nowISO)}</p>
          </div>
          <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="vet-modal-body space-y-3">
          {kind === "soap" && (<>
            <Field label="S — Subjective"><textarea rows={2} value={s} onChange={e => setS(e.target.value)} placeholder="อาการที่เจ้าของแจ้ง" className="vet-textarea" /></Field>
            <Field label="O — Objective"><textarea rows={2} value={o} onChange={e => setO(e.target.value)} placeholder="ผลตรวจ ค่าตรวจ" className="vet-textarea" /></Field>
            <Field label="A — Assessment"><textarea rows={2} value={a} onChange={e => setA(e.target.value)} placeholder="การประเมินผล/วินิจฉัย" className="vet-textarea" /></Field>
            <Field label="P — Plan"><textarea rows={2} value={p} onChange={e => setP(e.target.value)} placeholder="แผนการรักษาต่อไป" className="vet-textarea" /></Field>
          </>)}
          {kind === "note" && (
            <Field label="บันทึกพยาบาล *"><textarea rows={6} value={note} onChange={e => setNote(e.target.value)} placeholder="บันทึกอาการ, การให้การรักษา..." className="vet-textarea" /></Field>
          )}
          {kind === "wound" && (<>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ตำแหน่ง *"><input type="text" value={wLoc} onChange={e => setWLoc(e.target.value)} placeholder="ขาหลังขวา" className="vet-input" /></Field>
              <Field label="ขนาด"><input type="text" value={wSize} onChange={e => setWSize(e.target.value)} placeholder="2x3 cm" className="vet-input" /></Field>
            </div>
            <Field label="ลักษณะแผล *"><textarea rows={2} value={wDesc} onChange={e => setWDesc(e.target.value)} placeholder="สี หนอง ขอบแผล..." className="vet-textarea" /></Field>
            <Field label="การรักษา *"><textarea rows={2} value={wTx} onChange={e => setWTx(e.target.value)} placeholder="ล้าง NSS, ทา betadine, ปิดผ้าก๊อซ..." className="vet-textarea" /></Field>
          </>)}
        </div>
        <div className="vet-modal-footer">
          <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
          <button onClick={submit} className="vet-btn vet-btn-orange inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> บันทึก</button>
        </div>
      </motion.div>
    </div>
  );
}
