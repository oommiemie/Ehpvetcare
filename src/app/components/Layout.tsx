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
  { path: "/retail",        img: navIconRetail,        label: "ร้านค้า & POS",    color: "#F59E0B", bg: "rgba(245,158,11,0.18)"  },
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
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center gap-3 mx-2 my-0.5 px-2.5 py-2.5 rounded-xl transition-all duration-200 group
        ${collapsed ? "justify-center" : ""}
      `}
      style={
        isActive
          ? {
              background: "#ffffff",
              boxShadow: "0 2px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
            }
          : undefined
      }
      onMouseEnter={(e) => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)";
      }}
      onMouseLeave={(e) => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.background = "";
      }}
    >
      {/* Active indicator bar */}
      {isActive && !collapsed && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
          style={{ background: `linear-gradient(180deg, ${item.color}, ${item.color}88)` }}
        />
      )}

      {/* Icon bubble */}
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          background: isActive ? item.bg : "rgba(255,255,255,0.13)",
          boxShadow: isActive ? `0 2px 8px ${item.color}44` : undefined,
        }}
      >
        <img
          src={item.path === "/stock" ? navIconStock : item.img}
          alt={item.label}
          className="w-5 h-5 flex-shrink-0 object-contain transition-transform duration-200 group-hover:scale-110"
          draggable={false}
        />
      </span>

      {/* Label */}
      {!collapsed && (
        <span
          className="text-[13px] flex-1 truncate"
          style={{
            color: isActive ? "#0a3d30" : "rgba(255,255,255,0.82)",
            fontWeight: isActive ? 600 : 400,
            letterSpacing: "0.01em",
          }}
        >
          {item.label}
        </span>
      )}

      {/* Badges — expanded */}
      {!collapsed && item.path === "/notifications" && (
        <span
          className="text-white text-[10px] px-1.5 rounded-full flex-shrink-0 min-w-[18px] text-center"
          style={{ background: "#FB7185", fontWeight: 700, lineHeight: "16px" }}
        >
          5
        </span>
      )}
      {!collapsed && item.path === "/stock" && (
        <span
          className="text-white text-[10px] px-1.5 rounded-full flex-shrink-0 min-w-[18px] text-center"
          style={{ background: "#ef4444", fontWeight: 700, lineHeight: "16px" }}
        >
          3
        </span>
      )}

      {/* Badges — collapsed (dot) */}
      {collapsed && item.path === "/notifications" && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FB7185] ring-2 ring-[#19a589]" />
      )}
      {collapsed && item.path === "/stock" && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-[#0d7c66]" />
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
  const [searchValue, setSearchValue] = useState("");
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => { logout(); };

  const currentItem = navItems.find((item) =>
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );
  const pageTitle = currentItem?.label ?? "แดชบอร์ด";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#FEFBF8" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed lg:relative z-30 h-full flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: `linear-gradient(175deg, ${SB_BG_FROM} 0%, ${SB_BG_TO} 100%)`,
          boxShadow: "4px 0 32px rgba(0,0,0,0.16), 1px 0 0 rgba(255,255,255,0.06) inset",
        }}
      >
        {/* ── Logo ── */}
        <div
          className={`flex items-center gap-3 px-4 flex-shrink-0 ${collapsed ? "justify-center" : ""}`}
          style={{ height: 64 }}
        >
          <div
            className="relative flex-shrink-0"
            style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}
          >
            <img
              src={clinicLogo}
              alt="EHP VetCare"
              className="w-9 h-9 rounded-xl object-contain"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div
                className="text-white truncate"
                style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.01em", lineHeight: 1.2 }}
              >
                EHP VetCare
              </div>
              <div style={{ color: "rgba(255,255,255,0.48)", fontSize: 11, lineHeight: 1.4 }}>
                ระบบจัดการคลินิก
              </div>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 mb-1" style={{ height: 1, background: "rgba(255,255,255,0.10)" }} />

        {/* ── Nav ── */}
        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
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

        {/* ── Bottom divider ── */}
        <div className="mx-4" style={{ height: 1, background: "rgba(255,255,255,0.10)" }} />

        {/* ── User card ── */}
        {!collapsed ? (
          <div className="px-3 pt-3 pb-2">
            {/* User info */}
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))" }}
              >
                <span className="text-xs text-white" style={{ fontWeight: 700 }}>{user?.avatar ?? "สพ"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white truncate" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                  {user?.displayName ?? "สัตวแพทย์"}
                </div>
                <div className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", lineHeight: 1.3 }}>
                  {user?.role ?? "เจ้าหน้าที่"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{ background: "rgba(251,113,133,0.15)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(251,113,133,0.35)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(251,113,133,0.15)")}
              >
                <LogOut className="w-3.5 h-3.5" style={{ color: "#fca5a5" }} strokeWidth={2} />
              </button>
            </div>

            {/* Logout */}
            
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-2 py-3">
            {/* Avatar only */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <span className="text-xs text-white" style={{ fontWeight: 700 }}>{user?.avatar ?? "สพ"}</span>
            </div>
            {/* Logout icon */}
            <button
              onClick={handleLogout}
              title="ออกจากระบบ"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: "rgba(251,113,133,0.12)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(251,113,133,0.25)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(251,113,133,0.12)")}
            >
              <LogOut className="w-4 h-4" style={{ color: "#fca5a5" }} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* ── Collapse toggle ── */}
        <div className={`flex pb-3 px-3 ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)")}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Header ── */}
        <header
          className="flex-shrink-0 flex items-center gap-3 px-4 lg:px-6 bg-white"
          style={{
            height: 64,
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          }}
        >
          {/* Mobile menu */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: "#6b7280" }}
            onClick={() => setMobileOpen(true)}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f3f4f6")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Divider */}
          

          {/* Search bar */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              

            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Notification bell */}
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
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                style={{ color: "#6b7280" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f3f4f6")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
              >
                <Bell className="w-[18px] h-[18px]" />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white"
                  style={{ background: "#f97316" }}
                />
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {notifHover && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", damping: 28, stiffness: 380 }}
                    className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] bg-white rounded-2xl overflow-hidden z-50"
                    style={{
                      boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>การแจ้งเตือน</span>
                        <span
                          className="text-white px-1.5 rounded-full"
                          style={{ background: "#FB7185", fontWeight: 700, fontSize: 10, lineHeight: "16px" }}
                        >
                          {mockNotifications.filter((n) => n.unread).length}
                        </span>
                      </div>
                      <button style={{ fontSize: 12, color: "#19a589", fontWeight: 500 }}>อ่านทั้งหมด</button>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto">
                      {mockNotifications.map((n, i) => {
                        const NIcon = n.icon;
                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{
                              borderBottom: i < mockNotifications.length - 1 ? "1px solid rgba(0,0,0,0.04)" : undefined,
                              background: n.unread ? "rgba(25,165,137,0.03)" : undefined,
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: n.iconGrad, boxShadow: n.shadow }}
                            >
                              <NIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, color: "#111827" }} className="truncate">
                                  {n.title}
                                </span>
                                {n.unread && <span className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />}
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

                    <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <button style={{ fontSize: 12, color: "#19a589", fontWeight: 500 }}>ดูทั้งหมด →</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* User pill */}
            <button
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-200"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f3f4f6")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-gray-800 truncate max-w-[110px]" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                  {user?.displayName ?? "สัตวแพทย์"}
                </span>
                <span className="text-gray-400 truncate max-w-[110px]" style={{ fontSize: 11, lineHeight: 1.3 }}>
                  {user?.role ?? "เจ้าหน้าที่"}
                </span>
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)", boxShadow: "0 2px 8px rgba(25,165,137,0.35)" }}
              >
                <span className="text-xs text-white" style={{ fontWeight: 700 }}>{user?.avatar ?? "สพ"}</span>
              </div>
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto" style={{ background: "#FEFBF8" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.20, ease: [0.22, 1, 0.36, 1] }}
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