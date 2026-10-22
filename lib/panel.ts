import type { CSSProperties } from "react";
import { categories, type Category } from "@/lib/projects";

export const PANEL_CLASS =
  "rounded-[2rem] border p-5 transition-colors duration-500 motion-reduce:transition-none sm:p-8";

// The category colour at about 12% over black, as a solid colour, so the animated backdrop
// never shows through behind text and the colour can still ease smoothly between categories
const onBlack = (hex: string, a = 0.122) => {
  const n = parseInt(hex.slice(1, 7), 16);
  const c = (v: number) => Math.round(v * a);
  return `rgb(${c((n >> 16) & 255)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
};

/** Shared look for the projects panel and every section panel; follows the category filter. */
export function panelStyle(filter: "All" | Category): CSSProperties {
  if (filter === "All") return { backgroundColor: "#0a0a0a", borderColor: "#262626" };
  const color = categories[filter].color;
  return { backgroundColor: onBlack(color), borderColor: `${color}40` };
}
