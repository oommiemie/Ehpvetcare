import { createContext, useContext, useState, useCallback, useRef, forwardRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";

/* ─── Types ─── */
export type SnackbarType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "delete"
  | "update";

export interface SnackbarItem {
  id: number;
  type: SnackbarType;
  message: string;
  duration?: number;
}

interface SnackbarContextType {
  showSnackbar: (type: SnackbarType, message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}

/* ─── Style configs ─── */
const typeConfig: Record<
  SnackbarType,
  {
    icon: typeof CheckCircle2;
    bg: string;
    border: string;
    iconColor: string;
    iconBg: string;
    textColor: string;
    progressColor: string;
    glow: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    bg: "linear-gradient(135deg, #1a2e1f 0%, #1c2b20 50%, #222c25 100%)",
    border: "rgba(90,158,96,0.3)",
    iconColor: "#6bcf72",
    iconBg: "rgba(90,158,96,0.18)",
    textColor: "#e2f5e3",
    progressColor: "#5a9e60",
    glow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(90,158,96,0.15)",
  },
  error: {
    icon: XCircle,
    bg: "linear-gradient(135deg, #2e1a1a 0%, #2b1c1c 50%, #2c2222 100%)",
    border: "rgba(220,38,38,0.3)",
    iconColor: "#f87171",
    iconBg: "rgba(220,38,38,0.18)",
    textColor: "#fde2e2",
    progressColor: "#dc2626",
    glow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(220,38,38,0.15)",
  },
  warning: {
    icon: AlertTriangle,
    bg: "linear-gradient(135deg, #2e2a1a 0%, #2b271c 50%, #2c2922 100%)",
    border: "rgba(234,179,8,0.3)",
    iconColor: "#fbbf24",
    iconBg: "rgba(234,179,8,0.18)",
    textColor: "#fef3c7",
    progressColor: "#d97706",
    glow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(234,179,8,0.15)",
  },
  info: {
    icon: Info,
    bg: "linear-gradient(135deg, #1a2230 0%, #1c2430 50%, #22272e 100%)",
    border: "rgba(59,130,246,0.3)",
    iconColor: "#60a5fa",
    iconBg: "rgba(59,130,246,0.18)",
    textColor: "#dbeafe",
    progressColor: "#3b82f6",
    glow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(59,130,246,0.15)",
  },
  delete: {
    icon: Trash2,
    bg: "linear-gradient(135deg, #2e1a1a 0%, #2b1c1e 50%, #2c2224 100%)",
    border: "rgba(239,68,68,0.3)",
    iconColor: "#f87171",
    iconBg: "rgba(239,68,68,0.18)",
    textColor: "#fee2e2",
    progressColor: "#ef4444",
    glow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(239,68,68,0.15)",
  },
  update: {
    icon: RefreshCw,
    bg: "linear-gradient(135deg, #1a2e2a 0%, #1c2b27 50%, #222c29 100%)",
    border: "color-mix(in srgb, var(--brand) 30%, transparent)",
    iconColor: "#34d399",
    iconBg: "color-mix(in srgb, var(--brand) 18%, transparent)",
    textColor: "#d1fae5",
    progressColor: "var(--brand)",
    glow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px color-mix(in srgb, var(--brand) 15%, transparent)",
  },
};

/* ─── Single Snackbar Toast ─── */
const SnackbarToast = forwardRef<
  HTMLDivElement,
  { item: SnackbarItem; onDismiss: (id: number) => void }
>(({ item, onDismiss }, ref) => {
  const cfg = typeConfig[item.type];
  const Icon = cfg.icon;
  const duration = item.duration || 3500;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: -40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.92, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
      transition={{ type: "spring", damping: 24, stiffness: 340 }}
      className="pointer-events-auto relative overflow-hidden"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 16,
        boxShadow: cfg.glow,
        minWidth: 320,
        maxWidth: 460,
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-[32px] h-[32px] rounded-full flex items-center justify-center"
          style={{
            background: cfg.iconBg,
            boxShadow: `0 2px 8px color-mix(in srgb, ${cfg.iconColor} 13.3%, transparent)`,
          }}
        >
          <Icon className="w-[16px] h-[16px]" style={{ color: cfg.iconColor }} />
        </div>

        {/* Message */}
        <p
          className="flex-1 text-[13px] leading-[1.45]"
          style={{ color: cfg.textColor, fontWeight: 500 }}
        >
          {item.message}
        </p>

        {/* Close btn */}
        <button
          onClick={() => onDismiss(item.id)}
          className="flex-shrink-0 w-[24px] h-[24px] rounded-full flex items-center justify-center transition-colors cursor-pointer"
          style={{ background: "rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
          }
        >
          <X className="w-[12px] h-[12px]" style={{ color: "rgba(255,255,255,0.45)" }} />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        style={{
          height: 2.5,
          background: `linear-gradient(90deg, ${cfg.progressColor}, color-mix(in srgb, ${cfg.progressColor} 53.3%, transparent))`,
          transformOrigin: "left",
          borderRadius: "0 0 16px 16px",
        }}
      />
    </motion.div>
  );
});
SnackbarToast.displayName = "SnackbarToast";

/* ─── Provider ─── */
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SnackbarItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showSnackbar = useCallback(
    (type: SnackbarType, message: string, duration = 3500) => {
      const id = ++idRef.current;
      const newItem: SnackbarItem = { id, type, message, duration };

      setItems((prev) => {
        // Max 5 items visible
        const next = [...prev, newItem];
        if (next.length > 5) {
          const removed = next.shift();
          if (removed) {
            const t = timersRef.current.get(removed.id);
            if (t) {
              clearTimeout(t);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return next;
      });

      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {createPortal(
        <div
          className="fixed top-0 left-0 right-0 z-[99999] flex flex-col items-center gap-2 pt-4 pointer-events-none"
          style={{ fontFamily: "'IBM Plex Sans Thai Looped', sans-serif" }}
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <SnackbarToast key={item.id} item={item} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </SnackbarContext.Provider>
  );
}