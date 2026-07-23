import { useState, useMemo, useEffect, useRef, type ChangeEvent } from "react";
import { MessageCircle, Search, Send, Phone, Video, Info, ArrowLeft, Smile, CheckCheck, X, Paperclip, FileText } from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import { useOwners } from "../contexts/OwnersContext";

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาที`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ชม.`;
  return `${Math.round(h / 24)} วัน`;
};
const dayLabel = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
const fmtSize = (b?: number) => { if (!b) return ""; if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`; return `${(b / 1048576).toFixed(1)} MB`; };
const gapMin = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) > 5 * 60000;
/* สถานะออนไลน์แบบจำลอง (คงที่ตาม id) */
const isOnline = (id: number) => id % 2 === 1;

export function Chat() {
  const { conversations, getMessages, sendMessage, sendImage, sendFile, markRead, unread } = useChat();
  const { owners } = useOwners();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ownerById = (id: number) => owners.find(o => o.id === id);

  const list = useMemo(() =>
    conversations
      .map(c => ({ ownerId: c.ownerId, owner: ownerById(c.ownerId), last: c.messages[c.messages.length - 1] }))
      .filter(c => c.owner && c.last)
      .filter(c => {
        const q = search.trim();
        return !q || c.owner!.name.includes(q) || (c.owner!.nickname ?? "").includes(q);
      })
      .sort((a, b) => b.last!.ts.localeCompare(a.last!.ts)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversations, owners, search]
  );

  const active = activeId != null ? ownerById(activeId) : null;
  const messages = activeId != null ? getMessages(activeId) : [];
  const lastVetIdx = (() => { for (let i = messages.length - 1; i >= 0; i--) if (messages[i].from === "vet") return i; return -1; })();

  useEffect(() => { if (activeId != null) markRead(activeId); }, [activeId, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages.length, activeId, typing]);

  const send = () => {
    if (!draft.trim() || activeId == null) return;
    sendMessage(activeId, draft);
    setDraft("");
    setTyping(true);
    window.setTimeout(() => setTyping(false), 1400);
  };

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";  // เลือกไฟล์เดิมซ้ำได้
    if (!file || activeId == null) return;
    const afterSend = () => { setDraft(""); setTyping(true); window.setTimeout(() => setTyping(false), 1400); };
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => { sendImage(activeId, String(reader.result), draft); afterSend(); };
      reader.readAsDataURL(file);
    } else {
      sendFile(activeId, file.name, file.size, draft);
      afterSend();
    }
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <style>{`
        @keyframes chatDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
        .chat-dot{ width:6px;height:6px;border-radius:9999px;background:#9ca3af;animation:chatDot 1.2s infinite ease-in-out }
        @media (prefers-reduced-motion: reduce){ .chat-dot{ animation:none } }
      `}</style>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-[350px_1fr] flex-1 min-h-0" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)" }}>
        {/* ───── LEFT: conversation list ───── */}
        <div className={`border-r border-gray-100 flex-col min-h-0 ${active ? "hidden lg:flex" : "flex"}`}>
          {/* Hero — ทักทาย + สรุป */}
          {/* hero ตามธีมที่เลือก — สูตรเดียวกับ header หน้าอื่น (เดิม hardcode ฟ้า→เขียว เลยไม่เปลี่ยนตามธีม) */}
          <div className="relative overflow-hidden px-4 pt-4 pb-4 flex-shrink-0" style={{ backgroundImage: `
            radial-gradient(at 100% 0%, rgba(var(--brand-hero-accent), 0.55) 0%, transparent 55%),
            radial-gradient(at 0% 100%, rgba(var(--brand-hero-deep), 0.65) 0%, transparent 60%),
            linear-gradient(135deg, var(--brand-hero-from) 0%, var(--brand-hero-to) 100%)` }}>
            <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="absolute -bottom-12 -left-6 w-28 h-28 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.22)", boxShadow: "0 0 0 1px rgba(255,255,255,0.30)" }}>
                <MessageCircle className="w-[22px] h-[22px] text-white" strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[17px]" style={{ fontWeight: 800, letterSpacing: "-0.3px" }}>แชท</p>
                <p className="text-white/85 text-[11px]" style={{ fontWeight: 500 }}>พูดคุยกับเจ้าของสัตว์ · ติดตามอาการ นัดหมาย</p>
              </div>
            </div>
            {/* ค้นหา (ใน hero) */}
            <div className="relative mt-3.5">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเจ้าของสัตว์..."
                className="w-full h-10 pl-10 pr-3 rounded-full bg-white text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pt-3 pb-2 min-h-0">
            {list.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-8">ไม่พบรายการสนทนา</p>
            ) : list.map(c => {
              const u = unread(c.ownerId);
              const on = c.ownerId === activeId;
              const online = isOnline(c.ownerId);
              return (
                <button key={c.ownerId} onClick={() => setActiveId(c.ownerId)}
                  className="relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-2xl text-left transition-all mb-0.5 focus:outline-none focus-visible:outline-none"
                  style={on ? { background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 12%, transparent), color-mix(in srgb, var(--brand-dark) 6%, transparent))" } : u > 0 ? { background: "rgba(56,189,248,0.06)" } : undefined}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = u > 0 ? "rgba(56,189,248,0.06)" : ""; }}>
                  <div className="relative flex-shrink-0">
                    <img src={c.owner!.photo} alt="" className="w-12 h-12 rounded-full object-cover" style={{ boxShadow: on ? "0 0 0 2px var(--brand)" : "0 0 0 1px rgba(0,0,0,0.04)" }} />
                    {online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22c55e] border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] text-gray-900 truncate" style={{ fontWeight: u > 0 ? 800 : 700 }}>{c.owner!.name}</span>
                      <span className={`text-[10px] ml-auto flex-shrink-0 ${u > 0 ? "text-[#0284c7]" : "text-gray-400"}`} style={{ fontWeight: u > 0 ? 700 : 400 }}>{relTime(c.last!.ts)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-[12px] truncate flex-1 ${u > 0 ? "text-gray-700" : "text-gray-400"}`} style={{ fontWeight: u > 0 ? 600 : 400 }}>
                        {c.last!.from === "vet" ? "คุณ: " : ""}{c.last!.image ? `📷 รูปภาพ${c.last!.text ? " " + c.last!.text : ""}` : c.last!.fileName ? `📎 ${c.last!.fileName}` : c.last!.text}
                      </p>
                      {u > 0 && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#ef4444] text-white text-[10.5px] flex items-center justify-center flex-shrink-0" style={{ fontWeight: 800 }}>{u}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ───── RIGHT: thread ───── */}
        <div className={`flex-col min-h-0 ${active ? "flex" : "hidden lg:flex"}`}>
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="w-20 h-20 rounded-[28px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.15), color-mix(in srgb, var(--brand) 12%, transparent))" }}>
                <MessageCircle className="w-9 h-9" style={{ color: "#0284c7" }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[15px] text-gray-800" style={{ fontWeight: 700 }}>เริ่มการสนทนา</p>
                <p className="text-[12.5px] text-gray-400 mt-1 max-w-[280px]">เลือกเจ้าของสัตว์จากรายการด้านซ้าย เพื่อพูดคุย ตอบคำถาม และติดตามอาการ</p>
              </div>
            </div>
          ) : (
            <>
              {/* thread header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
                <button onClick={() => setActiveId(null)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 flex-shrink-0"><ArrowLeft className="w-4 h-4" /></button>
                <div className="relative flex-shrink-0">
                  <img src={active.photo} alt="" className="w-11 h-11 rounded-full object-cover" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.04)" }} />
                  {isOnline(active.id) && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22c55e] border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14.5px] text-gray-900 truncate" style={{ fontWeight: 800 }}>{active.name}</p>
                  <p className="text-[11px] truncate flex items-center gap-1.5">
                    {isOnline(active.id)
                      ? <><span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /><span className="text-[#16a34a]" style={{ fontWeight: 600 }}>ออนไลน์</span></>
                      : <span className="text-gray-400">ใช้งานล่าสุด {relTime(messages[messages.length - 1].ts)}ที่แล้ว</span>}
                    {active.pets?.length ? <span className="text-gray-400 truncate">· เจ้าของ {active.pets.join(", ")}</span> : null}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a href={`tel:${active.phone}`} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5" style={{ color: "var(--brand-dark)" }} title={`โทร ${active.phone}`}><Phone className="w-4 h-4" /></a>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100" title="วิดีโอคอล"><Video className="w-4 h-4" /></button>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100" title="ข้อมูลเจ้าของ"><Info className="w-4 h-4" /></button>
                  <button onClick={() => setActiveId(null)} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="ปิดแชท"><X className="w-4 h-4" /></button>
                </div>
              </div>

              {/* messages */}
              <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-4 min-h-0" style={{ background: "radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--brand) 4%, transparent) 0%, rgba(249,250,251,0.6) 40%)" }}>
                {messages.map((m, i) => {
                  const prev = messages[i - 1], next = messages[i + 1];
                  const firstOfGroup = !prev || prev.from !== m.from || gapMin(prev.ts, m.ts);
                  const lastOfGroup = !next || next.from !== m.from || gapMin(m.ts, next.ts);
                  const showDay = i === 0 || dayLabel(prev.ts) !== dayLabel(m.ts);
                  const mine = m.from === "vet";
                  return (
                    <div key={m.id}>
                      {showDay && (
                        <div className="flex justify-center my-3">
                          <span className="text-[10px] text-gray-500 bg-white/90 px-3 py-1 rounded-full border border-gray-100" style={{ fontWeight: 600 }}>{dayLabel(m.ts)}</span>
                        </div>
                      )}
                      <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} ${firstOfGroup ? "mt-2.5" : "mt-0.5"}`}>
                        {!mine && (lastOfGroup
                          ? <img src={active.photo} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          : <span className="w-7 flex-shrink-0" />)}
                        <div className={`max-w-[74%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                          {m.image ? (
                            <div className="overflow-hidden"
                              style={{ borderRadius: 18, borderBottomRightRadius: mine && lastOfGroup ? 6 : 18, borderBottomLeftRadius: !mine && lastOfGroup ? 6 : 18, boxShadow: mine ? "0 2px 8px rgba(0,0,0,0.14)" : "0 1px 2px rgba(0,0,0,0.06)", border: mine ? "none" : "1px solid #eef0f2" }}>
                              <img src={m.image} alt="" className="block max-w-[220px] w-full object-cover" />
                              {m.text && (
                                <div className="px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words"
                                  style={mine ? { background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", color: "#fff" } : { background: "#fff", color: "#374151" }}>
                                  {m.text}
                                </div>
                              )}
                            </div>
                          ) : m.fileName ? (
                            <div className="flex flex-col gap-1.5" style={{ borderRadius: 18, borderBottomRightRadius: mine && lastOfGroup ? 6 : 18, borderBottomLeftRadius: !mine && lastOfGroup ? 6 : 18,
                                background: mine ? "linear-gradient(135deg, var(--brand), var(--brand-dark))" : "#ffffff", border: mine ? "none" : "1px solid #eef0f2", boxShadow: mine ? "0 2px 8px rgba(0,0,0,0.14)" : "0 1px 2px rgba(0,0,0,0.04)", padding: "10px 12px" }}>
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: mine ? "rgba(255,255,255,0.20)" : "rgba(2,132,199,0.10)" }}>
                                  <FileText className="w-[18px] h-[18px]" style={{ color: mine ? "#fff" : "#0284c7" }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[12.5px] truncate max-w-[150px]" style={{ fontWeight: 700, color: mine ? "#fff" : "#374151" }}>{m.fileName}</p>
                                  {m.fileSize ? <p className="text-[10px]" style={{ color: mine ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>{fmtSize(m.fileSize)}</p> : null}
                                </div>
                              </div>
                              {m.text && <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: mine ? "#fff" : "#374151" }}>{m.text}</p>}
                            </div>
                          ) : (
                            <div className="px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words"
                              style={mine
                                ? { background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", color: "#fff", borderRadius: 18, borderBottomRightRadius: lastOfGroup ? 6 : 18, boxShadow: "0 2px 8px rgba(0,0,0,0.14)" }
                                : { background: "#ffffff", color: "#374151", borderRadius: 18, borderBottomLeftRadius: lastOfGroup ? 6 : 18, border: "1px solid #eef0f2", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                              {m.text}
                            </div>
                          )}
                          {lastOfGroup && (
                            <div className={`flex items-center gap-1 mt-1 px-1 text-[9.5px] text-gray-400 ${mine ? "flex-row-reverse" : ""}`}>
                              <span>{fmtTime(m.ts)}</span>
                              {mine && i === lastVetIdx && <span className="inline-flex items-center gap-0.5" style={{ color: "var(--brand-dark)" }}><CheckCheck className="w-3 h-3" /> ส่งแล้ว</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* typing indicator */}
                {typing && (
                  <div className="flex items-end gap-2 justify-start mt-2.5">
                    <img src={active.photo} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-md border border-gray-100 flex items-center gap-1" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                      <span className="chat-dot" style={{ animationDelay: "0ms" }} />
                      <span className="chat-dot" style={{ animationDelay: "160ms" }} />
                      <span className="chat-dot" style={{ animationDelay: "320ms" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* input */}
              <div className="px-3 py-3 border-t border-gray-100 flex items-end gap-2 flex-shrink-0 bg-white">
                <div className="flex-1 flex items-end gap-1 rounded-3xl border border-gray-200 bg-gray-50/70 pl-2 pr-1.5 py-1 focus-within:border-(--brand) focus-within:bg-white transition-colors">
                  <button type="button" onClick={() => setDraft(d => d + "🙂")} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#f59e0b] flex-shrink-0" title="อีโมจิ"><Smile className="w-[18px] h-[18px]" /></button>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    rows={1}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 bg-transparent resize-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400 py-2 leading-snug"
                    style={{ maxHeight: 112 }}
                  />
                  <input ref={fileRef} type="file" className="hidden" onChange={onPickFile} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0284c7] flex-shrink-0" title="แนบไฟล์"><Paperclip className="w-[18px] h-[18px]" /></button>
                </div>
                <button onClick={send} disabled={!draft.trim()}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", boxShadow: "0 4px 12px color-mix(in srgb, var(--brand-dark) 35%, transparent)" }}>
                  <Send className="w-[18px] h-[18px]" style={{ marginLeft: -1 }} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
