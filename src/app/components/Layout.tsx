import { useState, useCallback, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Search,
  Menu,
  LogOut,
  UserCircle2,
  Clock,
  Syringe,
  Bell,
  Calendar,
  Stethoscope,
  AlertCircle,
  Scissors,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/* ─── Nav icon images from Figma ─── */
import navIconDashboard from "figma:asset/0aeebc36dbf18a3d430334dfb08d2ea779f78c0f.png";
import navIconOwners from "figma:asset/2b733266e2c5755139d98c4cdfd3bd3268709b5c.png";
import navIconPets from "figma:asset/da8cd26150a5d3079b941efb6b052bf596754082.png";
import navIconVisits from "figma:asset/5e3b12e3aeddc82a0d8c387b2370fe2f6072e827.png";
import navIconAppointments from "figma:asset/7af6fa39ab1239c822c03ce83229dadf771644de.png";
import navIconFinancial from "figma:asset/64fd893bfa9af014e3100a673fc160a8c8dc26f3.png";
import navIconRetail from "figma:asset/2d18f6929a57bb9f599514b4d247d99a664978ee.png";
import navIconGrooming from "figma:asset/0868106d7ce5a4e2462adfe2ae32cdaeb86f4bba.png";
import navIconBoarding from "figma:asset/2edae94fcac727da17fb7250e33dfff7fe5e8544.png";
import navIconNotifications from "figma:asset/61e3deff78de5b26a258fd61a501194bbb56540e.png";
import navIconSettings from "figma:asset/188deadb31bd553f99f3c4cfef88320158f1d67b.png";
import navIconReports from "figma:asset/ef62c090cdf49826cf4d524dfb91db2be5e89bfd.png";
import navIconStock from "figma:asset/cde28e4167e2423bd9930f817ff84d3353824047.png";

const navItems = [
  { path: "/",              img: navIconDashboard,     label: "แดชบอร์ด",      end: true, color: "#60A5FA", bg: "rgba(96,165,250,0.18)"  },
  { path: "/owners",        img: navIconOwners,        label: "เจ้าของสัตว์",   color: "#A78BFA", bg: "rgba(167,139,250,0.18)" },
  { path: "/pets",          img: navIconPets,          label: "สัตว์เลี้ยง",    color: "#FB923C", bg: "rgba(251,146,60,0.18)"  },
  { path: "/visits",        img: navIconVisits,        label: "การตรวจรักษา",   color: "#34D399", bg: "rgba(52,211,153,0.18)"  },
  { path: "/appointments",  img: navIconAppointments,  label: "นัดหมาย",         color: "#22D3EE", bg: "rgba(34,211,238,0.18)"  },
  { path: "/financial",     img: navIconFinancial,     label: "การเงิน",          color: "#FBBF24", bg: "rgba(251,191,36,0.18)"  },
  { path: "/retail",        img: navIconRetail,        label: "ขายปลีก POS",    color: "#F59E0B", bg: "rgba(245,158,11,0.18)"  },
  { path: "/stock",         img: navIconRetail,        label: "จัดการ Stock",   color: "#19a589", bg: "rgba(25,165,137,0.18)", stockBadge: true },
  { path: "/grooming",      img: navIconGrooming,      label: "บริการอาบน้ำ",   color: "#F472B6", bg: "rgba(244,114,182,0.18)" },
  { path: "/boarding",      img: navIconBoarding,      label: "ฝากเลี้ยง",       color: "#FB923C", bg: "rgba(251,146,60,0.18)"  },
  { path: "/reports",       img: navIconReports,       label: "รายงาน",           color: "#6366F1", bg: "rgba(99,102,241,0.18)"  },
  { path: "/notifications", img: navIconNotifications, label: "การแจ้งเตือน",   color: "#FB7185", bg: "rgba(251,113,133,0.18)" },
  { path: "/settings",      img: navIconSettings,      label: "ตั้งค่า",           color: "#94A3B8", bg: "rgba(148,163,184,0.18)" },
];

const SB_BG_FROM = "#19a589";
const SB_BG_TO   = "#0d7c66";

/* ─── Mock notifications ─── */
const mockNotifications = [
  { id: 1, icon: Calendar, iconGrad: "linear-gradient(135deg, #22D3EE, #0891B2)", shadow: "0 2px 8px rgba(34,211,238,0.35)", title: "นัดหมายใหม่", desc: "น้องมิลค์ (ฉีดวัคซีน) — 14:30 น.", time: "5 นาทีที่แล้ว", unread: true },
  { id: 2, icon: Stethoscope, iconGrad: "linear-gradient(135deg, #34D399, #059669)", shadow: "0 2px 8px rgba(52,211,153,0.35)", title: "ผลแล็บพร้อม", desc: "CBC ของน้องโชกุน — ผลปกติ", time: "12 นาทีที่แล้ว", unread: true },
  { id: 3, icon: AlertCircle, iconGrad: "linear-gradient(135deg, #FB7185, #E11D48)", shadow: "0 2px 8px rgba(251,113,133,0.35)", title: "ยาใกล้หมดอายุ", desc: "Amoxicillin 250mg — เหลือ 30 วัน", time: "1 ชม. ที่แล้ว", unread: true },
  { id: 4, icon: Scissors, iconGrad: "linear-gradient(135deg, #F472B6, #DB2777)", shadow: "0 2px 8px rgba(244,114,182,0.35)", title: "อาบน้ำเสร็จแล้ว", desc: "น้องบีม — ส่งคืนเจ้าของได้", time: "2 ชม. ที่แล้ว", unread: false },
  { id: 5, icon: Syringe, iconGrad: "linear-gradient(135deg, #A78BFA, #7C3AED)", shadow: "0 2px 8px rgba(167,139,250,0.35)", title: "เตือนวัคซีน", desc: "น้องแม็กซ์ ครบกำหนดฉีดพรุ่งนี้", time: "3 ชม. ที่แล้ว", unread: false },
];

import clinicLogo from "figma:asset/9e42a8c1455d674552b44623404a14821a06b85e.png";

const navGroups = [
  { label: "ภาพรวม",          paths: ["/"] },
  { label: "ข้อมูล",           paths: ["/owners", "/pets"] },
  { label: "บริการ",           paths: ["/visits", "/appointments", "/grooming", "/boarding"] },
  { label: "การเงิน & สินค้า", paths: ["/financial", "/retail", "/stock"] },
  { label: "ระบบ",             paths: ["/reports", "/notifications", "/settings"] },
] as const;

function NavGroup({
  label,
  paths,
  sidebarCollapsed,
  onItemClick,
}: {
  label: string;
  paths: readonly string[];
  sidebarCollapsed: boolean;
  onItemClick: () => void;
}) {
  const location = useLocation();
  const hasActive = navItems
    .filter((n) => (paths as readonly string[]).includes(n.path))
    .some((n) =>
      n.end ? location.pathname === n.path : location.pathname.startsWith(n.path)
    );
  const [open, setOpen] = useState(true);
  const items = navItems.filter((n) => (paths as readonly string[]).includes(n.path));

  return (
    <div className="mb-1">
      {!sidebarCollapsed ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between mx-0 px-4 mt-3 mb-1 group/hdr transition-opacity duration-150 hover:opacity-80"
        >
          <span
            className="text-[10px] tracking-widest uppercase select-none"
            style={{ color: hasActive ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)", fontWeight: 600 }}
          >
            {label}
          </span>
          <ChevronLeft
            className="w-3 h-3 transition-transform duration-200"
            style={{
              color: "rgba(255,255,255,0.35)",
              transform: open ? "rotate(-90deg)" : "rotate(-180deg)",
            }}
          />
        </button>
      ) : (
        <div className="mx-3 my-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
      )}

      <AnimatePresence initial={false}>
        {(open || sidebarCollapsed) && (
          <motion.div
            key="items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            {items.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                collapsed={sidebarCollapsed}
                onClick={onItemClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof navItems)[0];
  collapsed: boolean;
  onClick: () => void;
}) {
  const location = useLocation();
  const isActive = item.end
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      className={`relative flex items-center gap-3 mx-2 my-0.5 px-2.5 py-2 rounded-xl transition-all duration-200 group
        ${collapsed ? "justify-center" : ""}
      `}
      style={
        isActive
          ? {
              background: "#ffffff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }
          : undefined
      }
      onMouseEnter={(e) => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.background = "";
      }}
    >
      {/* Active indicator bar */}
      {isActive && !collapsed && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
          style={{ background: item.color }}
        />
      )}

      {/* Icon bubble */}
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 backdrop-blur-[8px]"
        style={{
          background: isActive ? item.bg : "rgba(255,255,255,0.6)",
        }}
      >
        <img
          src={item.path === "/stock" ? navIconStock : item.img}
          alt={item.label}
          className="w-[22px] h-[22px] flex-shrink-0 object-contain transition-transform duration-200 group-hover:scale-125"
          draggable={false}
        />
      </span>

      {/* Label */}
      {!collapsed && (
        <span
          className="text-sm flex-1 truncate"
          style={{
            color: isActive ? "#0a3d30" : "rgba(255,255,255,0.80)",
            fontWeight: isActive ? 600 : 400,
          }}
        >
          {item.label}
        </span>
      )}

      {/* Badge */}
      {!collapsed && item.path === "/notifications" && (
        <span
          className="text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: "#FB7185", fontWeight: 700, fontSize: 10 }}
        >
          5
        </span>
      )}
      {!collapsed && item.path === "/stock" && (
        <span
          className="text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: "#ef4444", fontWeight: 700, fontSize: 10 }}
        >
          3
        </span>
      )}
    </NavLink>
  );
}

export type LayoutOutletContext = {
  setSidebarCollapsed: (v: boolean) => void;
};

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifHover, setNotifHover] = useState(false);
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-[#FEFBF8] overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-30 h-full flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: `linear-gradient(180deg, ${SB_BG_FROM} 0%, ${SB_BG_TO} 100%)`,
          boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-3 py-4 mb-1 ${collapsed ? "justify-center" : ""}`}
        >
          <img
            src={clinicLogo}
            alt="EHP VetCare"
            className="w-10 h-10 rounded-2xl flex-shrink-0 object-contain"
            style={{
              boxShadow: "0 4px 12px rgba(25,165,137,0.45)",
            }}
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <div
                className="text-sm text-white truncate"
                style={{ fontWeight: 700, letterSpacing: "0.02em" }}
              >
                EHP VetCare
              </div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.50)" }}>
                ระบบจัดการคลินิก
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3 mb-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* Nav */}
        <nav className="flex-1 py-1 overflow-y-auto overflow-x-visible">
          {navGroups.map((group, gi) => (
            <NavGroup
              key={gi}
              label={group.label}
              paths={group.paths}
              sidebarCollapsed={collapsed}
              onItemClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-3 mt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* User profile row */}
        <div className={`flex items-center gap-2.5 px-3 py-3 ${collapsed ? "justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2 transition-all duration-200 cursor-pointer ${collapsed ? "justify-center" : ""}`}
            style={{ background: "rgba(251,113,133,0.12)" }}
            title="ออกจากระบบ"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(251,113,133,0.22)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(251,113,133,0.12)")
            }
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,113,133,0.25)" }}
            >
              <LogOut className="w-4 h-4" style={{ color: "#fca5a5" }} strokeWidth={2} />
            </div>
            {!collapsed && (
              <span className="text-sm truncate" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                ออกจากระบบ
              </span>
            )}
          </button>
        </div>

        {/* Collapse toggle */}
        <div
          className={`flex pb-3 px-3 ${collapsed ? "justify-center" : "justify-end"}`}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")
            }
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 bg-white vet-border-b flex items-center gap-4 px-4 lg:px-6 flex-shrink-0 shadow-sm">
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              
              
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (notifTimeout.current) clearTimeout(notifTimeout.current);
                setNotifHover(true);
              }}
              onMouseLeave={() => {
                notifTimeout.current = setTimeout(() => setNotifHover(false), 200);
              }}
            >
              <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
              </button>

              {/* Hover preview dropdown */}
              <AnimatePresence>
                {notifHover && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", damping: 28, stiffness: 380 }}
                    className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] bg-white rounded-2xl overflow-hidden z-50"
                    style={{
                      boxShadow: "0 12px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 vet-border-b">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ fontWeight: 600, color: "#1a1a1a" }}>การแจ้งเตือน</span>
                        <span
                          className="text-xs text-white px-1.5 py-0.5 rounded-full"
                          style={{ background: "#FB7185", fontWeight: 700, fontSize: 10 }}
                        >
                          {mockNotifications.filter(n => n.unread).length}
                        </span>
                      </div>
                      <button className="text-xs transition-colors" style={{ color: "#19a589", fontWeight: 500 }}>
                        อ่านทั้งหมด
                      </button>
                    </div>

                    {/* Items */}
                    <div className="max-h-[320px] overflow-y-auto">
                      {mockNotifications.map((n, i) => {
                        const NIcon = n.icon;
                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                            style={{
                              borderBottom: i < mockNotifications.length - 1 ? "1px solid rgba(0,0,0,0.04)" : undefined,
                              background: n.unread ? "rgba(25,165,137,0.03)" : undefined,
                            }}
                          >
                            {/* Icon */}
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: n.iconGrad, boxShadow: n.shadow }}
                            >
                              <NIcon className="w-4 h-4" style={{ color: "white" }} />
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[13px] truncate" style={{ fontWeight: n.unread ? 600 : 400, color: "#1a1a1a" }}>
                                  {n.title}
                                </span>
                                {n.unread && (
                                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{n.desc}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-[11px] text-gray-400">{n.time}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 vet-border-t text-center">
                      <button className="text-xs transition-colors" style={{ color: "#19a589", fontWeight: 500 }}>
                        ดูทั้งหมด →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[13px] text-gray-800 truncate max-w-[120px]" style={{ fontWeight: 600, lineHeight: 1.3 }}>{user?.displayName ?? "สัตวแพทย์"}</span>
                <span className="text-[11px] text-gray-400 truncate max-w-[120px]" style={{ lineHeight: 1.2 }}>{user?.role ?? ""}</span>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)" }}
              >
                <span className="text-xs text-white" style={{ fontWeight: 600 }}>{user?.avatar ?? "สพ"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="h-full"
            >
              <Outlet context={{ setSidebarCollapsed: setCollapsed } satisfies LayoutOutletContext} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}