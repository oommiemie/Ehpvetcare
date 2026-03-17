import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Bell, Syringe, AlertTriangle, Calendar, Home, Send, CheckCheck, Clock, X, Settings } from "lucide-react";
import { useSnackbar } from "../contexts/SnackbarContext";

type NotifType = "vaccine" | "drug" | "appointment" | "boarding" | "system";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  urgent: boolean;
  petName?: string;
  owner?: string;
}

const notifications: Notification[] = [
  { id: 1, type: "vaccine", title: "วัคซีนครบกำหนด — บัดดี้", body: "บัดดี้ (HN-2026-001) ครบกำหนดฉีดวัคซีนพิษสุนัขบ้า วันที่ 5 มีนาคม 2026 เจ้าของ: สมศักดิ์ ใจดี (081-234-5678)", time: "5 นาทีที่แล้ว", read: false, urgent: true, petName: "บัดดี้", owner: "สมศักดิ์ ใจดี" },
  { id: 2, type: "appointment", title: "นัดหมายใกล้ถึง", body: "ลูน่า มีนัดฉีดวัคซีนวันนี้เวลา 09:30 น. เจ้าของ: วรรณา ศรีสุข", time: "10 นาทีที่แล้ว", read: false, urgent: false, petName: "ลูน่า", owner: "วรรณา ศรีสุข" },
  { id: 3, type: "drug", title: "ยาใกล้หมดอายุ", body: "ด็อกซีไซคลิน (รุ่น DX-2024-018) หมดอายุใน 7 วัน คงเหลือ: 48 หน่วย กรุณาสั่งเพิ่ม", time: "1 ชั่วโมงที่แล้ว", read: false, urgent: true },
  { id: 4, type: "vaccine", title: "วัคซีนครบกำหนด — ชาร์ลี", body: "ชาร์ลี (HN-2026-005) ครบกำหนดฉีด DHPP วันที่ 10 มีนาคม 2026", time: "2 ชั่วโมงที่แล้ว", read: false, urgent: false, petName: "ชาร์ลี", owner: "ธีรพล วงศ์สุวรรณ" },
  { id: 5, type: "boarding", title: "ถึงกำหนดรับสัตว์เลี้ยงวันนี้", body: "ร็อคกี้ (HN-2026-008) บริการฝากเลี้ยงสิ้นสุดวันนี้เวลา 17:00 น. เจ้าของ: สมศักดิ์ ใจดี ควรได้รับการแจ้ง", time: "3 ชั่วโมงที่แล้ว", read: true, urgent: false, petName: "ร็อคกี้", owner: "สมศักดิ์ ใจดี" },
  { id: 6, type: "drug", title: "สต็อกยาต่ำ", body: "อะม็อกซิซิลลิน 250mg เหลือน้อย — คงเหลือเพียง 8 หน่วย ขั้นต่ำที่กำหนด: 20 หน่วย", time: "5 ชั่วโมงที่แล้ว", read: true, urgent: true },
  { id: 7, type: "appointment", title: "บันทึกขาดนัด", body: "เบลล่า (HN-2026-013) ไม่มาตามนัดเวลา 11:30 น. เจ้าของ: ปรียาภรณ์ ทองดี", time: "6 ชั่วโมงที่แล้ว", read: true, urgent: false, petName: "เบลล่า", owner: "ปรียาภรณ์ ทองดี" },
  { id: 8, type: "system", title: "สำรองข้อมูลเสร็จสมบูรณ์", body: "สำรองข้อมูลประจำวันเสร็จสมบูรณ์เวลา 02:00 น. ข้อมูลทั้งหมดปลอดภัย", time: "8 ชั่วโมงที่แล้ว", read: true, urgent: false },
  { id: 9, type: "vaccine", title: "วัคซีนครบกำหนด — โมจิ", body: "โมจิ (HN-2026-009) ครบกำหนดฉีด FVRCP วันที่ 15 มีนาคม 2026", time: "เมื่อวาน", read: true, urgent: false, petName: "โมจิ", owner: "ประพันธ์ มงคล" },
  { id: 10, type: "appointment", title: "ส่งการแจ้งเตือนนัดหมายแล้ว", body: "ส่งการแจ้งเตือนทาง Line ถึง ธีรพล วงศ์สุวรรณ สำหรับนัดหมายของชาร์ลี วันที่ 2 มีนาคม", time: "เมื่อวาน", read: true, urgent: false },
];

const typeConfig: Record<NotifType, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  vaccine: { icon: Syringe, color: "text-white", bg: "bg-gradient-to-br from-[#5a9e60] to-[#2d5232]", label: "วัคซีน" },
  drug: { icon: AlertTriangle, color: "text-white", bg: "bg-gradient-to-br from-orange-400 to-orange-600", label: "ยา" },
  appointment: { icon: Calendar, color: "text-white", bg: "bg-gradient-to-br from-blue-400 to-blue-600", label: "นัดหมาย" },
  boarding: { icon: Home, color: "text-white", bg: "bg-gradient-to-br from-purple-400 to-purple-600", label: "ฝากเลี้ยง" },
  system: { icon: Bell, color: "text-white", bg: "bg-gradient-to-br from-gray-400 to-gray-600", label: "ระบบ" },
};

const filters: (NotifType | "all")[] = ["all", "vaccine", "appointment", "drug", "boarding", "system"];
const filterLabels: Record<string, string> = {
  all: "ทั้งหมด", vaccine: "วัคซีน", appointment: "นัดหมาย", drug: "ยา", boarding: "ฝากเลี้ยง", system: "ระบบ",
};

export function Notifications() {
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState<NotifType | "all">("all");
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = notifs.filter(n => filter === "all" || n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => { setNotifs(prev => prev.map(n => ({ ...n, read: true }))); showSnackbar("update", "ทำเครื่องหมายอ่านแล้วทั้งหมด"); };
  const markRead = (id: number) => { setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); showSnackbar("info", "ทำเครื่องหมายอ่านแล้ว"); };
  const dismiss = (id: number) => { setNotifs(prev => prev.filter(n => n.id !== id)); showSnackbar("delete", "ลบการแจ้งเตือนแล้ว"); };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="flex flex-col h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white vet-border-b px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-gray-900" style={{ fontWeight: 700 }}>การแจ้งเตือน</h1>
            {unreadCount > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                ยังไม่อ่าน {unreadCount} รายการ
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              ทำเครื่องหมายอ่านทั้งหมด
            </button>
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${showSettings ? "bg-[#19a589] text-white border-[#19a589]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                title="ตั้งค่าการแจ้งเตือน"
              >
                <Settings className="w-4 h-4" />
              </button>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-3rem)] sm:w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50"
                >
                  <h2 className="text-sm text-gray-700 mb-3" style={{ fontWeight: 600 }}>การตั้งค่าการแจ้งเตือนอัตโนมัติ</h2>
                  <div className="space-y-2">
                    {[
                      { label: "แจ้งเตือนวัคซีนครบกำหนด", desc: "3 วันก่อนครบกำหนด" },
                      { label: "แจ้งเตือนนัดหมาย", desc: "1 วันก่อนนัดหมาย" },
                      { label: "แจ้งเตือนยาใกล้หมดอายุ", desc: "14 วันก่อนหมดอายุ" },
                      { label: "แจ้งเตือนรับสัตว์เลี้ยง", desc: "วันที่ต้องรับสัตว์" },
                    ].map((setting) => (
                      <div key={setting.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <div className="text-xs text-gray-700" style={{ fontWeight: 500 }}>{setting.label}</div>
                          <div className="text-xs text-gray-400">{setting.desc}</div>
                        </div>
                        <div className="relative">
                          <input type="checkbox" defaultChecked className="sr-only peer" id={`setting-${setting.label}`} />
                          <label htmlFor={`setting-${setting.label}`} className="flex w-9 h-5 bg-gray-200 peer-checked:bg-[#19a589] rounded-full cursor-pointer transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="inline-flex bg-white/90 backdrop-blur-sm rounded-full shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] p-1 items-center overflow-x-auto scrollbar-hide mt-3">
          {filters.map(f => {
            const count = f === "all"
              ? notifs.filter(n => !n.read).length
              : notifs.filter(n => n.type === f && !n.read).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-full whitespace-nowrap transition-all ${filter === f ? "bg-[#19a589] text-white" : "text-[#6a7282] hover:text-gray-900 hover:bg-gray-100"}`}
                style={{ fontWeight: filter === f ? 500 : 400 }}
              >
                {filterLabels[f]}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] leading-[1.5] ${filter === f ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`} style={{ fontWeight: 600 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto bg-[#FEFBF8] p-3 sm:p-6">
        <motion.div
          className="w-full space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Notification items */}
          {filtered.map((notif) => {
            const config = typeConfig[notif.type];
            return (
              <motion.div
                key={notif.id}
                variants={itemVariants}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${notif.read ? "border-gray-100" : "border-blue-200 shadow-blue-50"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <config.icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm ${notif.read ? "text-gray-700" : "text-gray-900"}`} style={{ fontWeight: notif.read ? 400 : 600 }}>
                          {notif.title}
                        </span>
                        {notif.urgent && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 500 }}>ด่วน</span>
                        )}
                        {!notif.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notif.read && (
                          <button
                            onClick={() => markRead(notif.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                            title="ทำเครื่องหมายอ่านแล้ว"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => dismiss(notif.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {notif.time}
                      </div>
                      {notif.petName && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{notif.petName}</span>
                      )}
                      {(notif.type === "vaccine" || notif.type === "appointment") && (
                        <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1" style={{ fontWeight: 500 }}>
                          <Send className="w-3 h-3" />
                          ส่ง Line
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">ไม่มีการแจ้งเตือนในหมวดนี้</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}