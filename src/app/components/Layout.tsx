import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";

// motion-enabled NavLink so sidebar items get press feedback
const MotionNavLink = motion.create(NavLink);
import { ChevronLeft, Menu, LogOut, Settings, ChevronRight, AtSign, ShieldCheck, Bed } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import { AIAssistant } from "../pages/AIAssistant";

/* ─── Nav icon images from Figma ─── */
import navIconDashboard from "@/assets/dashboad-sidebar.png";
import navIconOwners from "@/assets/owner-sidebar.png";
import navIconPets from "@/assets/pet-sidebar.png";
import navIconIpd from "@/assets/IPD-Dashboard.png";
import navIconVisits from "@/assets/Check and treat-sidebar.png";
import navIconAppointments from "@/assets/appointment-sidebar.png";
import navIconChat from "@/assets/chat.png";
import navIconAI from "@/assets/AI.png";
import navIconSchedule from "@/assets/Doctor's-schedule-sidebar.png";
import navIconWard from "@/assets/ward-sidebar.png";
import navIconIpdReports from "@/assets/report-ipd-sidebar.png";
import navIconFinancial from "@/assets/finance-sidebar.png";
import navIconRetail from "@/assets/store-sidebar.png";
import navIconStock from "@/assets/stock-sitebar.png";
import navIconGrooming from "@/assets/grooming-sidebar.png";
import navIconBoarding from "@/assets/Pet-boarding-sidebar.png";
import navIconReports from "@/assets/report-sidebar.png";
import navIconNotifications from "@/assets/notify-sitebar.png";
import navIconSettings from "@/assets/setting-sitebar.png";
import clinicLogo from "@/assets/logo ehpvetcare.png";

type NavIcon = { img?: string; lucideIcon?: typeof Bed };
type NavItem = NavIcon & {
  path: string;
  labelKey: string;
  end?: boolean;
  color: string;
  bg: string;
  stockBadge?: boolean;
};

const navItems: NavItem[] = [
  { path: "/",              img: navIconDashboard,     labelKey: "nav.dashboard",      end: true, color: "#60A5FA", bg: "rgba(96,165,250,0.18)"  },
  { path: "/owners",        img: navIconOwners,        labelKey: "nav.owners",         color: "#A78BFA", bg: "rgba(167,139,250,0.18)" },
  { path: "/pets",          img: navIconPets,          labelKey: "nav.pets",           color: "#FB923C", bg: "rgba(251,146,60,0.18)"  },
  { path: "/visits",        img: navIconVisits,        labelKey: "nav.visits",         color: "#34D399", bg: "rgba(52,211,153,0.18)"  },
  { path: "/appointments",  img: navIconAppointments,  labelKey: "nav.appointments",   color: "#22D3EE", bg: "rgba(34,211,238,0.18)"  },
  { path: "/chat",          img: navIconChat,          labelKey: "nav.chat",           color: "#38BDF8", bg: "rgba(56,189,248,0.18)"  },
  { path: "/assistant",     img: navIconAI,            labelKey: "nav.assistant",      color: "#8B5CF6", bg: "rgba(139,92,246,0.18)" },
  { path: "/schedule",      img: navIconSchedule,      labelKey: "nav.schedule",       color: "#0EA5E9", bg: "rgba(14,165,233,0.18)"  },
  { path: "/ipd",           img: navIconIpd,           labelKey: "nav.ipdDashboard",   end: true, color: "#0d7c66", bg: "rgba(13,124,102,0.18)" },
  { path: "/ipd/ward",      img: navIconWard,          labelKey: "nav.ward",           color: "#10b981", bg: "rgba(16,185,129,0.18)" },
  { path: "/ipd/reports",   img: navIconIpdReports,    labelKey: "nav.ipdReports",     color: "#8b5cf6", bg: "rgba(139,92,246,0.18)" },
  { path: "/financial",     img: navIconFinancial,     labelKey: "nav.financial",      color: "#FBBF24", bg: "rgba(251,191,36,0.18)"  },
  { path: "/retail",        img: navIconRetail,        labelKey: "nav.retail",         color: "#F59E0B", bg: "rgba(245,158,11,0.18)"  },
  { path: "/stock",         img: navIconStock,         labelKey: "nav.stock",          color: "#19a589", bg: "rgba(25,165,137,0.18)", stockBadge: true },
  { path: "/grooming",      img: navIconGrooming,      labelKey: "nav.grooming",       color: "#F472B6", bg: "rgba(244,114,182,0.18)" },
  { path: "/boarding",      img: navIconBoarding,      labelKey: "nav.boarding",       color: "#FB923C", bg: "rgba(251,146,60,0.18)"  },
  { path: "/reports",       img: navIconReports,       labelKey: "nav.reports",        color: "#6366F1", bg: "rgba(99,102,241,0.18)"  },
  { path: "/notifications", img: navIconNotifications, labelKey: "nav.notifications",  color: "#FB7185", bg: "rgba(251,113,133,0.18)" },
  { path: "/settings",      img: navIconSettings,      labelKey: "nav.settings",       color: "#94A3B8", bg: "rgba(148,163,184,0.18)" },
];

/* Refined brand gradient — calm depth, fewer stops */
const SB_BG = `
  radial-gradient(at 100% 0%, rgba(45,212,191,0.55) 0%, transparent 55%),
  radial-gradient(at 0% 100%, rgba(8,75,62,0.65) 0%, transparent 60%),
  linear-gradient(178deg, #1aa78b 0%, #0e5e4f 100%)
`;


const navGroups = [
  { labelKey: "nav.group.overview", paths: ["/", "/chat", "/assistant"] },
  { labelKey: "nav.group.data",     paths: ["/owners", "/pets"] },
  { labelKey: "nav.group.services", paths: ["/visits", "/appointments", "/schedule", "/grooming", "/boarding"] },
  { labelKey: "nav.group.ipd",      paths: ["/ipd", "/ipd/ward", "/ipd/reports"] },
  { labelKey: "nav.group.finance",  paths: ["/financial", "/retail", "/stock"] },
  { labelKey: "nav.group.system",   paths: ["/reports", "/notifications", "/settings"] },
] as const;

function NavGroup({
  labelKey,
  paths,
  sidebarCollapsed,
  onItemClick,
}: {
  labelKey: string;
  paths: readonly string[];
  sidebarCollapsed: boolean;
  onItemClick: () => void;
}) {
  const { t } = useLang();
  const label = t(labelKey);
  const location = useLocation();
  const hasActive = navItems
    .filter((n) => (paths as readonly string[]).includes(n.path))
    .some((n) =>
      n.end ? location.pathname === n.path : location.pathname.startsWith(n.path)
    );
  const [open, setOpen] = useState(true);
  const items = navItems.filter((n) => (paths as readonly string[]).includes(n.path));

  return (
    <div className="mb-2">
      {!sidebarCollapsed ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-5 mt-5 mb-2 transition-opacity duration-150 hover:opacity-80"
        >
          <span
            className="text-[10px] tracking-[1.6px] uppercase select-none flex-shrink-0"
            style={{ color: hasActive ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.42)", fontWeight: 700 }}
          >
            {label}
          </span>
          <span
            aria-hidden
            className="flex-1 h-px"
            style={{ background: hasActive
              ? "linear-gradient(90deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.04) 100%)"
              : "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)" }}
          />
          <ChevronLeft
            className="w-3 h-3 transition-transform duration-200 flex-shrink-0"
            style={{
              color: hasActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.35)",
              transform: open ? "rotate(-90deg)" : "rotate(-180deg)",
            }}
          />
        </button>
      ) : (
        <div className="mx-4 my-3" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} />
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
  item: NavItem;
  collapsed: boolean;
  onClick: () => void;
}) {
  const { t } = useLang();
  const itemLabel = t(item.labelKey);
  const LucideIco = item.lucideIcon;
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null);
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const isActive = item.end
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  const updateTipPos = () => {
    const el = linkRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTipPos({ top: r.top + r.height / 2, left: r.right + 10 });
  };

  return (
    <MotionNavLink
      ref={linkRef}
      to={item.path}
      end={item.end}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={collapsed ? undefined : { x: 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      onMouseEnter={(e) => {
        setHovered(true);
        if (collapsed) updateTipPos();
        if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        if (!isActive) (e.currentTarget as HTMLElement).style.background = "";
      }}
      className={`relative flex items-center my-[3px] rounded-full transition-all duration-200
        ${collapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 mx-3 p-2"}
      `}
      style={
        isActive
          ? {
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.32)",
              boxShadow:
                `inset 0 1px 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(0,0,0,0.05), 0 4px 20px ${item.color}55, 0 2px 8px rgba(0,0,0,0.10)`,
            }
          : { border: "1px solid transparent" }
      }
    >
      {/* Collapsed hover tooltip — rendered via portal to escape sidebar overflow + transforms */}
      {collapsed && createPortal(
        <AnimatePresence>
          {hovered && tipPos && (
            <div
              style={{
                position: "fixed",
                top: tipPos.top,
                left: tipPos.left,
                transform: "translateY(-50%)",
                zIndex: 9999,
                pointerEvents: "none",
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -6, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="relative px-3 py-1.5 rounded-lg text-[12px] whitespace-nowrap"
                style={{
                  background: "#ffffff",
                  color: "#111827",
                  fontWeight: 600,
                  letterSpacing: "-0.1px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.18), 0 3px 8px rgba(0,0,0,0.08)",
                  transformOrigin: "left center",
                }}
              >
                {/* Arrow pointing left */}
                <span
                  aria-hidden
                  className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 rotate-45"
                  style={{
                    background: "#ffffff",
                    borderLeft: "1px solid rgba(0,0,0,0.06)",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                />
                {itemLabel}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
      {/* Sliding active indicator on left edge */}
      {isActive && !collapsed && (
        <motion.span
          layoutId="nav-active-edge"
          transition={{ type: "spring", stiffness: 480, damping: 38 }}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
          style={{ background: `linear-gradient(180deg, ${item.color}, ${item.color}99)`, boxShadow: `0 0 16px ${item.color}cc, 0 0 4px ${item.color}` }}
        />
      )}

      {/* Icon bubble — solid white with depth, icons always pop */}
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 relative"
        style={{
          background: isActive
            ? `linear-gradient(135deg, #ffffff 0%, ${item.bg.replace("0.18", "0.55")} 100%)`
            : "linear-gradient(135deg, #ffffff 0%, #e8f3ef 100%)",
          boxShadow: isActive
            ? `inset 0 1px 0 rgba(255,255,255,1), 0 3px 12px ${item.color}66, 0 1px 4px rgba(0,0,0,0.10)`
            : "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.18)",
        }}
      >
        {LucideIco ? (
          <LucideIco
            className="w-5 h-5 flex-shrink-0"
            strokeWidth={2.2}
            style={{ color: item.color, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.12))" }}
          />
        ) : (
          <img
            src={item.img}
            alt={itemLabel}
            className="w-6 h-6 flex-shrink-0 object-contain"
            draggable={false}
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.12))" }}
          />
        )}
      </span>

      {/* Label */}
      {!collapsed && (
        <span
          className="text-[14px] flex-1 truncate text-white"
          style={{
            fontWeight: isActive ? 600 : 500,
            letterSpacing: "0.13px",
            textShadow: isActive ? "0 1px 6px rgba(0,0,0,0.15)" : undefined,
          }}
        >
          {itemLabel}
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
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FB7185] ring-2 ring-[#0d7c66]" />
      )}
      {collapsed && item.path === "/stock" && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-[#0d7c66]" />
      )}
    </MotionNavLink>
  );
}

export type LayoutOutletContext = {
  setSidebarCollapsed: (v: boolean) => void;
};

export function Layout() {
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1280 : false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const profileTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout } = useAuth();
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);

  // ── ปุ่มลอย AI: ลากได้อิสระ ปล่อยแล้วดูดเข้าขอบจอที่ใกล้ที่สุด (แบบ chat head) + จำตำแหน่ง ──
  const FAB_POS_KEY = "ehp_ai_fab_pos_v1";
  const fabX = useMotionValue(0);
  const fabY = useMotionValue(0);
  const fabRef = useRef<HTMLDivElement>(null);
  const fabAreaRef = useRef<HTMLDivElement>(null);
  const fabDraggedRef = useRef(false);
  const snapFabToEdge = (instant = false) => {
    const el = fabRef.current;
    if (!el) return;
    const M = 12, vw = window.innerWidth, vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    // เริ่มจากตำแหน่งเดิมแบบ clamp ไว้ในจอ แล้วดูดแกนที่ใกล้ขอบสุดชิดขอบ
    let targetLeft = Math.min(vw - r.width - M, Math.max(M, r.left));
    let targetTop = Math.min(vh - r.height - M, Math.max(M, r.top));
    const nearest = Math.min(cx, vw - cx, cy, vh - cy);
    if (nearest === cx) targetLeft = M;
    else if (nearest === vw - cx) targetLeft = vw - r.width - M;
    else if (nearest === cy) targetTop = M;
    else targetTop = vh - r.height - M;
    const nx = fabX.get() + (targetLeft - r.left);
    const ny = fabY.get() + (targetTop - r.top);
    if (instant) { fabX.set(nx); fabY.set(ny); }
    else {
      animate(fabX, nx, { type: "spring", stiffness: 380, damping: 30 });
      animate(fabY, ny, { type: "spring", stiffness: 380, damping: 30 });
    }
    try { localStorage.setItem(FAB_POS_KEY, JSON.stringify({ x: nx, y: ny })); } catch { /* quota */ }
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAB_POS_KEY);
      if (raw) { const p = JSON.parse(raw); fabX.set(Number(p.x) || 0); fabY.set(Number(p.y) || 0); }
    } catch { /* ignore */ }
    // โหลด/ย่อจอแล้วจัดให้เกาะขอบเสมอ
    snapFabToEdge(true);
    const onResize = () => snapFabToEdge(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เปิด/ปิดผู้ช่วย AI ด้วย Cmd/Ctrl+K (ยกเว้นตอนอยู่หน้า AI อยู่แล้ว)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (location.pathname !== "/assistant") setAiOpen(o => !o);
      }
      if (e.key === "Escape") setAiOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [location.pathname]);

  // ปิด drawer เมื่อเปลี่ยนหน้า (เช่น AI นำทางไปหน้าอื่น)
  useEffect(() => { setAiOpen(false); }, [location.pathname]);

  // Auto-collapse sidebar on iPad portrait / smaller tablets (768–1279px),
  // auto-expand on desktop (≥1280px). User can still toggle manually.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1280px)");
    const apply = (e: MediaQueryListEvent | MediaQueryList) => setCollapsed(!e.matches);
    apply(mql);
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); };

  const openProfile = () => {
    if (profileTimeout.current) clearTimeout(profileTimeout.current);
    setProfileHover(true);
  };
  const closeProfile = () => {
    profileTimeout.current = setTimeout(() => setProfileHover(false), 180);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "#FEFBF8",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Mobile overlay (visible < md = phone-size) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed md:relative z-30 h-full flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          backgroundImage: SB_BG,
          boxShadow: "4px 0 40px rgba(0,0,0,0.22), 1px 0 0 rgba(255,255,255,0.10) inset",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Ambient decoration — clipped to sidebar bounds */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 -right-24 w-[340px] h-[340px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 65%)" }}
          />
        </div>
        {/* ── Brand header ── */}
        <div
          className={`flex items-center px-4 flex-shrink-0 ${collapsed ? "justify-center px-3" : "gap-2.5"}`}
          style={{ paddingTop: 18, paddingBottom: 16 }}
        >
          {!collapsed ? (
            <>
              {/* Logo — soft white card, refined shadows */}
              <div
                className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <img src={clinicLogo} alt="EHP VetCare" className="w-8 h-8 object-contain" />
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div
                  className="text-white truncate"
                  style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px", lineHeight: 1.15 }}
                >
                  {t("app.name")}
                </div>
                <div
                  className="truncate mt-0.5"
                  style={{ color: "rgba(255,255,255,0.60)", fontSize: 10, lineHeight: 1.3, letterSpacing: "0.2px", fontWeight: 500 }}
                >
                  {t("app.tagline")}
                </div>
              </div>

              <button
                onClick={() => setCollapsed(true)}
                title={t("sidebar.collapse")}
                aria-label={t("sidebar.collapse")}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.75)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              title={t("sidebar.expand")}
              aria-label={t("sidebar.expand")}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.90)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)")}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
          {navGroups.map((group, gi) => (
            <NavGroup
              key={gi}
              labelKey={group.labelKey}
              paths={group.paths}
              sidebarCollapsed={collapsed}
              onItemClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* ── User pill (Figma) ── */}
        {/* Pre-pill divider — fades nav scroll into user zone */}
        {!collapsed && (
          <div
            aria-hidden
            className="mx-5 mt-2"
            style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
          />
        )}
        {!collapsed ? (
          <div className="px-4 pt-3 pb-4 relative" onMouseEnter={openProfile} onMouseLeave={closeProfile}>
            {/* Hover popover — profile details */}
            <AnimatePresence>
              {profileHover && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.96 }}
                  transition={{ type: "spring", damping: 28, stiffness: 380 }}
                  className="absolute left-full bottom-3 ml-3 w-[280px] rounded-2xl overflow-hidden z-50 bg-white"
                  style={{
                    boxShadow: "0 18px 48px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
                  }}
                  onMouseEnter={openProfile}
                  onMouseLeave={closeProfile}
                >
                  {/* Header strip — brand gradient */}
                  <div
                    className="px-4 py-4 relative"
                    style={{ background: "linear-gradient(135deg, #2dd4bf 0%, #19a589 50%, #0d7c66 100%)" }}
                  >
                    <div
                      aria-hidden
                      className="absolute -top-10 -right-8 w-32 h-32 rounded-full pointer-events-none"
                      style={{ background: "radial-gradient(circle, rgba(255,255,255,0.30) 0%, transparent 70%)" }}
                    />
                    <div className="relative flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #ffffff 0%, #d1fae5 100%)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 14px rgba(0,0,0,0.20)",
                          }}
                        >
                          {user?.photo ? (
                            <img src={user.photo} alt={user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ fontSize: 18, fontWeight: 700, color: "#0d7c66", letterSpacing: "-0.3px" }}>{user?.avatar ?? "สพ"}</span>
                          )}
                        </div>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-[2.5px] ring-white"
                          style={{ background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-white" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px", lineHeight: 1.2 }}>
                          {user?.displayName ?? t("vet.fallback")}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{user?.role ?? t("user.role.fallback")}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-white/50" />
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{t("user.online")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div className="px-2 py-2">
                    <div className="flex items-center gap-2.5 px-2 py-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#f3f4f6" }}>
                        <AtSign className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>Username</div>
                        <div className="truncate" style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{user?.username ?? "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-2 py-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(25,165,137,0.10)" }}>
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#0d7c66" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>{t("user.permissions")}</div>
                        <div className="truncate" style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{user?.role ?? "—"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px mx-3" style={{ background: "rgba(0,0,0,0.06)" }} />

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      onClick={() => { setProfileHover(false); navigate("/settings"); }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors hover:bg-gray-50"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#f3f4f6" }}>
                        <Settings className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                      </div>
                      <span className="flex-1 text-left" style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{t("user.editAccount")}</span>
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: "#9ca3af" }} />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors hover:bg-red-50 group"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: "rgba(239,68,68,0.08)" }}>
                        <LogOut className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                      </div>
                      <span className="flex-1 text-left" style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{t("user.logout")}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="flex items-center gap-3 pl-1.5 pr-1.5 py-1.5 rounded-full bg-white w-full cursor-pointer transition-shadow duration-200"
              style={{
                boxShadow: profileHover
                  ? "0 16px 40px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.95)"
                  : "0 10px 28px rgba(0,0,0,0.22), 0 3px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.95)",
              }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #2dd4bf 0%, #19a589 50%, #0d7c66 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(13,124,102,0.40)",
                  }}
                >
                  {user?.photo ? (
                    <img src={user.photo} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[13px] text-white tracking-tight" style={{ fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.20)" }}>{user?.avatar ?? "สพ"}</span>
                  )}
                </div>
                {/* online status — soft ring */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-[2.5px] ring-white"
                  style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.1px", color: "#111827" }}>
                  {user?.displayName ?? t("vet.fallback")}
                </div>
                <div className="truncate flex items-center gap-1 mt-0.5" style={{ fontSize: 11, lineHeight: 1.2, color: "#6b7280", fontWeight: 500 }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: "#22c55e" }} />
                  {user?.role ?? t("user.role.fallback")}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title={t("user.logout")}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{ color: "#9ca3af", background: "rgba(0,0,0,0.03)" }}
                onMouseEnter={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  t.style.background = "rgba(239,68,68,0.10)";
                  t.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  t.style.background = "rgba(0,0,0,0.03)";
                  t.style.color = "#9ca3af";
                }}
              >
                <LogOut className="w-[15px] h-[15px]" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-2 py-3 relative" onMouseEnter={openProfile} onMouseLeave={closeProfile}>
            {/* Collapsed-mode profile popover — pops to the right of sidebar */}
            <AnimatePresence>
              {profileHover && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.96 }}
                  transition={{ type: "spring", damping: 28, stiffness: 380 }}
                  className="absolute left-full bottom-2 ml-3 w-[280px] rounded-2xl overflow-hidden z-50 bg-white"
                  style={{
                    boxShadow: "0 18px 48px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
                  }}
                  onMouseEnter={openProfile}
                  onMouseLeave={closeProfile}
                >
                  {/* Header strip — brand gradient */}
                  <div
                    className="px-4 py-4 relative"
                    style={{ background: "linear-gradient(135deg, #2dd4bf 0%, #19a589 50%, #0d7c66 100%)" }}
                  >
                    <div
                      aria-hidden
                      className="absolute -top-10 -right-8 w-32 h-32 rounded-full pointer-events-none"
                      style={{ background: "radial-gradient(circle, rgba(255,255,255,0.30) 0%, transparent 70%)" }}
                    />
                    <div className="relative flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #ffffff 0%, #d1fae5 100%)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 14px rgba(0,0,0,0.20)",
                          }}
                        >
                          {user?.photo ? (
                            <img src={user.photo} alt={user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ fontSize: 18, fontWeight: 700, color: "#0d7c66", letterSpacing: "-0.3px" }}>{user?.avatar ?? "สพ"}</span>
                          )}
                        </div>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-[2.5px] ring-white"
                          style={{ background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-white" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px", lineHeight: 1.2 }}>
                          {user?.displayName ?? t("vet.fallback")}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{user?.role ?? t("user.role.fallback")}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-white/50" />
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{t("user.online")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div className="px-2 py-2">
                    <div className="flex items-center gap-2.5 px-2 py-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#f3f4f6" }}>
                        <AtSign className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>Username</div>
                        <div className="truncate" style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{user?.username ?? "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-2 py-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(25,165,137,0.10)" }}>
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#0d7c66" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>{t("user.permissions")}</div>
                        <div className="truncate" style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{user?.role ?? "—"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px mx-3" style={{ background: "rgba(0,0,0,0.06)" }} />

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      onClick={() => { setProfileHover(false); navigate("/settings"); }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors hover:bg-gray-50"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#f3f4f6" }}>
                        <Settings className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                      </div>
                      <span className="flex-1 text-left" style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{t("user.editAccount")}</span>
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: "#9ca3af" }} />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors hover:bg-red-50 group"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: "rgba(239,68,68,0.08)" }}>
                        <LogOut className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                      </div>
                      <span className="flex-1 text-left" style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{t("user.logout")}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative cursor-pointer">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #2dd4bf 0%, #19a589 50%, #0d7c66 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(13,124,102,0.40)",
                }}
              >
                {user?.photo ? (
                  <img src={user.photo} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[13px] text-white" style={{ fontWeight: 700 }}>{user?.avatar ?? "สพ"}</span>
                )}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-[2.5px] ring-[#0e5e4f]"
                style={{ background: "#22c55e" }}
              />
            </div>
          </div>
        )}
      </aside>

      {/* ─── Main area ─── */}
      <div
        className="flex-1 flex flex-col overflow-hidden min-w-0 relative"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >

        {/* Mobile menu — floating, only on phone sizes (< md = 768px) */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden absolute z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md transition-colors"
          style={{ color: "#374151", top: "max(12px, env(safe-area-inset-top))", left: 12 }}
          aria-label="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto" style={{ background: "#FEFBF8" }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.20, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Outlet context={{ setSidebarCollapsed: setCollapsed } satisfies LayoutOutletContext} />
          </motion.div>
        </main>
      </div>

      {/* ── ปุ่มลอยเรียกผู้ช่วย AI (ทุกหน้า ยกเว้นหน้า AI) · ลากวางได้ทุกที่ ── */}
      {location.pathname !== "/assistant" && !aiOpen && (
        <>
          {/* ขอบเขตการลาก = ทั้งจอ เว้นขอบ 12px */}
          <div ref={fabAreaRef} aria-hidden className="fixed pointer-events-none" style={{ inset: 12 }} />
          <motion.div
            ref={fabRef}
            drag
            dragConstraints={fabAreaRef}
            dragElastic={0.12}
            dragMomentum={false}
            onDragStart={() => { fabDraggedRef.current = true; }}
            onDragEnd={() => snapFabToEdge()}
            className="fixed z-40 cursor-grab active:cursor-grabbing"
            style={{
              bottom: "max(24px, env(safe-area-inset-bottom))", right: 24, width: 56, height: 56,
              x: fabX, y: fabY, touchAction: "none",
            }}
          >
            <motion.button
              onClick={() => {
                // กันคลิกลั่นหลังปล่อยจากการลาก
                if (fabDraggedRef.current) { fabDraggedRef.current = false; return; }
                setAiOpen(true);
              }}
              title="หมอเหมี่ยว · ผู้ช่วย AI (⌘K) · ลากย้ายตำแหน่งได้"
              initial={{ scale: 0, opacity: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -7, 0] }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.94 }}
              transition={{
                scale: { type: "spring", stiffness: 400, damping: 22 },
                opacity: { duration: 0.3 },
                y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
              }}
              className="w-full h-full flex items-center justify-center rounded-full overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px) saturate(160%)",
                WebkitBackdropFilter: "blur(16px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.75)",
              }}
            >
              {/* ไฮไลต์กระจกด้านบน */}
              <span aria-hidden className="absolute inset-x-1 top-1 h-1/2 rounded-full pointer-events-none"
                style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)" }} />
              <img src={navIconAI} alt="AI" className="relative w-8 h-8 object-contain" draggable={false} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }} />
            </motion.button>
          </motion.div>
        </>
      )}

      {/* ── กล่องแชทลอย ผู้ช่วย AI (floating chat widget) ── */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed z-50 overflow-hidden rounded-3xl bg-[#FEFBF8] flex flex-col"
            style={{
              right: "max(16px, env(safe-area-inset-right))",
              bottom: "max(16px, env(safe-area-inset-bottom))",
              width: "min(560px, calc(100vw - 32px))",
              height: "min(680px, calc(100dvh - 48px))",
              transformOrigin: "bottom right",
              boxShadow: "0 24px 64px rgba(0,0,0,0.28), 0 6px 18px rgba(0,0,0,0.14)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex-1 min-h-0">
              <AIAssistant embedded onClose={() => setAiOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}