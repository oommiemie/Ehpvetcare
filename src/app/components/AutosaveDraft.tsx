import { useEffect, useRef, useState } from "react";
import { Check, Loader2, FileEdit } from "lucide-react";

export type AutosaveStatus = "idle" | "dirty" | "saving" | "saved";

/**
 * Watches `input` / `change` events bubbling inside `scopeRef` and runs
 * a debounced fake-save that flips status: idle → dirty → saving → saved.
 *
 * Mock-only: doesn't persist anywhere. Replace `simulateSave` once a real
 * draft endpoint exists.
 */
export function useAutosaveDraft(
  scopeRef: React.RefObject<HTMLElement | null>,
  options?: { debounceMs?: number; saveDurationMs?: number; storageKey?: string },
) {
  const debounceMs    = options?.debounceMs    ?? 1200;
  const saveDurationMs = options?.saveDurationMs ?? 500;

  const [status, setStatus]     = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setSaved] = useState<Date | null>(null);
  const debounceRef = useRef<number | null>(null);
  const saveRef     = useRef<number | null>(null);

  // Trigger the same dirty → saving → saved cycle programmatically.
  // Use for non-form widgets (custom dropdowns, toggle buttons, chips) that
  // don't bubble a native `input`/`change` event.
  const markDirty = () => {
    setStatus("dirty");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (saveRef.current) clearTimeout(saveRef.current);
    debounceRef.current = window.setTimeout(() => {
      setStatus("saving");
      saveRef.current = window.setTimeout(() => {
        setStatus("saved");
        setSaved(new Date());
      }, saveDurationMs);
    }, debounceMs);
  };

  useEffect(() => {
    const el = scopeRef.current;
    if (!el) return;

    const onChange = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT" && !(target as HTMLElement).isContentEditable) return;
      markDirty();
    };

    el.addEventListener("input", onChange, true);
    el.addEventListener("change", onChange, true);
    return () => {
      el.removeEventListener("input", onChange, true);
      el.removeEventListener("change", onChange, true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (saveRef.current) clearTimeout(saveRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeRef, debounceMs, saveDurationMs]);

  return { status, lastSavedAt, markDirty };
}

/** Tiny status badge: idle / dirty / saving / saved. */
export function AutosaveStatusBadge({
  status, lastSavedAt, className = "",
}: {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}) {
  const timeLabel = lastSavedAt
    ? lastSavedAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    : null;

  if (status === "idle") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] text-gray-400 ${className}`} style={{ fontWeight: 500 }}>
        <FileEdit className="w-3 h-3" />
        ร่างใหม่ — เริ่มกรอกได้
      </span>
    );
  }
  if (status === "dirty") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] text-amber-600 ${className}`} style={{ fontWeight: 500 }}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        กำลังพิมพ์…
      </span>
    );
  }
  if (status === "saving") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] text-blue-600 ${className}`} style={{ fontWeight: 500 }}>
        <Loader2 className="w-3 h-3 animate-spin" />
        บันทึกร่างอัตโนมัติ…
      </span>
    );
  }
  // saved
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] text-emerald-600 ${className}`} style={{ fontWeight: 500 }}>
      <Check className="w-3 h-3" />
      บันทึกร่างแล้ว{timeLabel ? ` · ${timeLabel}` : ""}
    </span>
  );
}
