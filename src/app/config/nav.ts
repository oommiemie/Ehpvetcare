/* ─────────────────────────────────────────────────────────────
   นิยามเมนูนำทางกลาง — ใช้ร่วมกันระหว่าง Sidebar (Layout.tsx)
   และ "เมนูลัด" บนหน้า Dashboard เพื่อไม่ให้รายการเมนูแตกกันสองที่
   ───────────────────────────────────────────────────────────── */
import type { Bed } from "lucide-react";

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

export type NavIcon = { img?: string; lucideIcon?: typeof Bed };
export type NavItem = NavIcon & {
  path: string;
  labelKey: string;
  end?: boolean;
  color: string;
  bg: string;
  stockBadge?: boolean;
};

export const navItems: NavItem[] = [
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

export const navGroups = [
  { labelKey: "nav.group.overview", paths: ["/", "/chat", "/assistant"] },
  { labelKey: "nav.group.data",     paths: ["/owners", "/pets"] },
  { labelKey: "nav.group.services", paths: ["/visits", "/appointments", "/schedule", "/grooming", "/boarding"] },
  { labelKey: "nav.group.ipd",      paths: ["/ipd", "/ipd/ward", "/ipd/reports"] },
  { labelKey: "nav.group.finance",  paths: ["/financial", "/retail", "/stock"] },
  { labelKey: "nav.group.system",   paths: ["/reports", "/notifications", "/settings"] },
] as const;

export const navItemByPath = (path: string) => navItems.find(n => n.path === path);
