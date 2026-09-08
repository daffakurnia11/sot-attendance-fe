import type { CSSProperties } from "react";
export const designTokens = {
  background: "#070605",
  backgroundSoft: "#100d09",
  surface: "#151008",
  primary: "#f2b63d",
  primaryBright: "#ffd966",
  primaryMuted: "#a98245",
  danger: "#d83a2f",
  dangerSoft: "#ef7474",
  success: "#55dfbd",
  foreground: "#fff6d6",
  foregroundMuted: "#b9ac91",
  border: "rgba(217,169,80,.24)",
  borderSubtle: "rgba(217,169,80,.14)",
  panelSoft: "rgba(242,182,61,.025)",
  panelAccent: "rgba(242,182,61,.2)",
  controlBackground: "rgba(7,6,5,.7)",
  radius: 8,
  controlHeight: 40,
} as const;
export const designTokenStyle = Object.fromEntries(
  Object.entries(designTokens)
    .filter(([, value]) => typeof value === "string")
    .map(([key, value]) => [`--sot-${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`, value]),
) as CSSProperties;
