import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Check, Info, X, Trash2 } from "lucide-react";

export type ConfirmKind = "danger" | "warning" | "info" | "success";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  kind?: ConfirmKind;
  /** ถ้าเป็น destructive (Discharge, Delete) → ต้องพิมพ์ยืนยัน */
  requireTyping?: string;
}

interface ConfirmContextType {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

const kindCfg: Record<ConfirmKind, { color: string; bg: string; grad: string; icon: typeof AlertTriangle }> = {
  danger:  { color: "#dc2626", bg: "rgba(239,68,68,0.10)",  grad: "linear-gradient(135deg, #f87171, #dc2626)", icon: Trash2 },
  warning: { color: "#d97706", bg: "rgba(245,158,11,0.10)", grad: "linear-gradient(135deg, #fbbf24, #d97706)", icon: AlertTriangle },
  info:    { color: "#0284c7", bg: "rgba(14,165,233,0.10)", grad: "linear-gradient(135deg, #38bdf8, #0284c7)", icon: Info },
  success: { color: "#059669", bg: "rgba(16,185,129,0.10)", grad: "linear-gradient(135deg, #34d399, #059669)", icon: Check },
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const [typed, setTyped] = useState("");
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      resolveRef.current = resolve;
      setState(opts);
      setTyped("");
    });
  }, []);

  const close = (v: boolean) => {
    resolveRef.current?.(v);
    resolveRef.current = null;
    setState(null);
    setTyped("");
  };

  const cfg = state ? kindCfg[state.kind ?? "warning"] : kindCfg.warning;
  const Icon = cfg.icon;
  const typingOk = !state?.requireTyping || typed.trim() === state.requireTyping.trim();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => close(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-4 flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: cfg.grad, boxShadow: `0 6px 18px ${cfg.color}40, inset 0 1px 0 rgba(255,255,255,0.30)` }}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id="confirm-title" className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(16px * var(--fs))", letterSpacing: "-0.2px" }}>
                    {state.title}
                  </h3>
                  {state.description && (
                    <p className="text-[12.5px] text-gray-600 mt-1" style={{ lineHeight: 1.55 }}>
                      {state.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => close(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
                  aria-label="ปิด"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Require typing */}
              {state.requireTyping && (
                <div className="px-5 pb-4">
                  <label className="vet-label">
                    พิมพ์ <span className="text-rose-600" style={{ fontWeight: 700 }}>"{state.requireTyping}"</span> เพื่อยืนยัน
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={typed}
                    onChange={e => setTyped(e.target.value)}
                    className="vet-input"
                    placeholder={state.requireTyping}
                  />
                </div>
              )}

              {/* Footer */}
              <div
                className="px-5 py-3 flex items-center justify-end gap-2"
                style={{ background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}
              >
                <button onClick={() => close(false)} className="vet-btn vet-btn-secondary">
                  {state.cancelLabel ?? "ยกเลิก"}
                </button>
                <button
                  onClick={() => close(true)}
                  disabled={!typingOk}
                  className={state.kind === "danger" ? "vet-btn vet-btn-danger" : "vet-btn vet-btn-primary"}
                >
                  {state.confirmLabel ?? "ยืนยัน"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}
