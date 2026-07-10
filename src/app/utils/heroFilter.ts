import type { CSSProperties } from "react";

/**
 * Filter pills sit on the dark hero bar. They stay white in every state so the
 * look matches the search box and date pickers next to them; an active filter is
 * marked with the brand green instead of a background swap.
 */
const BRAND = "#0d7c66";
const BRAND_RGB = "25,165,137";

export function heroPillStyle(active: boolean): CSSProperties {
  return {
    background: "#fff",
    border: active ? `1px solid rgba(${BRAND_RGB},0.45)` : "1px solid rgba(255,255,255,0.5)",
    boxShadow: active
      ? `0 2px 10px rgba(${BRAND_RGB},0.22), inset 0 1px 0 rgba(255,255,255,0.9)`
      : "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
    color: active ? BRAND : "#374151",
    fontWeight: 600,
  };
}

export function heroPillIconStyle(active: boolean, grad?: string, glow?: string): CSSProperties {
  return {
    background: active && grad ? grad : "#f1f5f9",
    boxShadow: active && glow ? `0 2px 8px ${glow}55` : "none",
  };
}

export const heroPillIconClass = (active: boolean) =>
  `w-3.5 h-3.5 ${active ? "text-white" : "text-gray-400"}`;

export const heroPillClearStyle: CSSProperties = {
  background: `rgba(${BRAND_RGB},0.12)`,
  color: BRAND,
};
