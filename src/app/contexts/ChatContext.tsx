import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface ChatMessage {
  id: string;
  from: "vet" | "owner";
  text: string;
  ts: string;      // ISO datetime
  read: boolean;
  image?: string;    // data URL (ถ้าเป็นรูปภาพ)
  fileName?: string; // ชื่อไฟล์ (ถ้าเป็นไฟล์แนบทั่วไป)
  fileSize?: number; // ขนาดไฟล์ (bytes)
}
export interface Conversation {
  ownerId: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = "ehp_chat_v1";
const load = (): Conversation[] | null => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? (JSON.parse(r) as Conversation[]) : null; }
  catch { return null; }
};
const save = (c: Conversation[]) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* quota */ } };
const uid = () => `m-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

/* ─── ข้อความตัวอย่าง (seed ครั้งแรก) ─── */
const seed = (): Conversation[] => {
  const now = Date.now();
  const ago = (min: number) => new Date(now - min * 60000).toISOString();
  return [
    { ownerId: 1, messages: [
      { id: uid(), from: "owner", text: "สวัสดีค่ะคุณหมอ บัดดี้ยังกินยาไม่ค่อยได้เลย ต้องทำยังไงดีคะ", ts: ago(180), read: true },
      { id: uid(), from: "vet",   text: "ลองบดยาผสมอาหารเปียกดูครับ ป้อนทีละน้อย", ts: ago(176), read: true },
      { id: uid(), from: "owner", text: "โอเคค่ะ เดี๋ยวลองดู ขอบคุณค่ะ 🙏", ts: ago(174), read: true },
      { id: uid(), from: "owner", text: "คุณหมอคะ วันนี้บัดดี้อาเจียน 1 ครั้ง ปกติไหมคะ", ts: ago(9), read: false },
      { id: uid(), from: "owner", text: "แนบรูปมาให้ดูด้วยนะคะ", ts: ago(8), read: false },
    ] },
    { ownerId: 2, messages: [
      { id: uid(), from: "owner", text: "ขอเลื่อนนัดพรุ่งนี้เป็นช่วงบ่ายได้ไหมคะ", ts: ago(95), read: false },
    ] },
    { ownerId: 3, messages: [
      { id: uid(), from: "vet",   text: "ผลเลือดของแม็กซ์ออกแล้วนะครับ ค่าตับปกติดี ไม่ต้องกังวล", ts: ago(1440), read: true },
      { id: uid(), from: "owner", text: "ขอบคุณมากครับคุณหมอ สบายใจขึ้นเยอะเลย 🙏", ts: ago(1430), read: true },
    ] },
    { ownerId: 4, messages: [
      { id: uid(), from: "owner", text: "อยากปรึกษาเรื่องวัคซีนเข็มถัดไปค่ะ", ts: ago(3200), read: true },
      { id: uid(), from: "vet",   text: "ได้ครับ เข็มถัดไปนัดประมาณ 3 เม.ย. นะครับ เดี๋ยวทางคลินิกโทรยืนยันอีกที", ts: ago(3195), read: true },
      { id: uid(), from: "owner", text: "โอเคค่ะ ขอบคุณค่ะ", ts: ago(3190), read: true },
    ] },
  ];
};

interface ChatContextType {
  conversations: Conversation[];
  getMessages: (ownerId: number) => ChatMessage[];
  sendMessage: (ownerId: number, text: string) => void;
  sendImage: (ownerId: number, image: string, caption?: string) => void;
  sendFile: (ownerId: number, fileName: string, fileSize: number, caption?: string) => void;
  markRead: (ownerId: number) => void;
  unread: (ownerId: number) => number;
  totalUnread: number;
}
const ChatContext = createContext<ChatContextType | null>(null);

const AUTO_REPLIES = ["รับทราบค่ะ ขอบคุณคุณหมอ 🙏", "โอเคค่ะ เดี๋ยวทำตามนะคะ", "ขอบคุณมากครับ", "เข้าใจแล้วค่ะ", "ได้เลยค่ะ 🙂"];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => load() ?? seed());
  useEffect(() => { save(conversations); }, [conversations]);

  const getMessages = (ownerId: number) => conversations.find(c => c.ownerId === ownerId)?.messages ?? [];

  const append = (ownerId: number, msg: ChatMessage) => setConversations(prev => {
    const exists = prev.some(c => c.ownerId === ownerId);
    return exists
      ? prev.map(c => c.ownerId === ownerId ? { ...c, messages: [...c.messages, msg] } : c)
      : [...prev, { ownerId, messages: [msg] }];
  });

  const sendMessage = (ownerId: number, text: string) => {
    const t = text.trim();
    if (!t) return;
    append(ownerId, { id: uid(), from: "vet", text: t, ts: new Date().toISOString(), read: true });
    // จำลองการตอบกลับจากเจ้าของสัตว์
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      append(ownerId, { id: uid(), from: "owner", text: reply, ts: new Date().toISOString(), read: false });
    }, 1400);
  };

  const sendImage = (ownerId: number, image: string, caption?: string) => {
    if (!image) return;
    append(ownerId, { id: uid(), from: "vet", text: caption?.trim() ?? "", image, ts: new Date().toISOString(), read: true });
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      append(ownerId, { id: uid(), from: "owner", text: reply, ts: new Date().toISOString(), read: false });
    }, 1400);
  };

  const sendFile = (ownerId: number, fileName: string, fileSize: number, caption?: string) => {
    if (!fileName) return;
    append(ownerId, { id: uid(), from: "vet", text: caption?.trim() ?? "", fileName, fileSize, ts: new Date().toISOString(), read: true });
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      append(ownerId, { id: uid(), from: "owner", text: reply, ts: new Date().toISOString(), read: false });
    }, 1400);
  };

  const markRead = (ownerId: number) => setConversations(prev => prev.map(c =>
    c.ownerId === ownerId ? { ...c, messages: c.messages.map(m => m.read ? m : { ...m, read: true }) } : c
  ));

  const unread = (ownerId: number) => getMessages(ownerId).filter(m => m.from === "owner" && !m.read).length;
  const totalUnread = conversations.reduce((s, c) => s + c.messages.filter(m => m.from === "owner" && !m.read).length, 0);

  return (
    <ChatContext.Provider value={{ conversations, getMessages, sendMessage, sendImage, sendFile, markRead, unread, totalUnread }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const c = useContext(ChatContext);
  if (!c) throw new Error("useChat must be used within ChatProvider");
  return c;
}
