"use client";

import { useEffect, useRef } from "react";
import { skillGroups, skillTheme } from "@/lib/skills";

const WORDS = skillGroups.flatMap((g) => g.skills);

// Small, tightly packed text so the names read like lines of code
const CELL_H = 14; // row height
const FONT_PX = 9;
const GAP = 9; // space between neighbouring names, in px
const LENS_R = 90; // radius of the magnifier around the pointer, in px

// The glow travels across the whole page, so both walls behave like one surface
const HIT_MS = 2000; // time for the ring to reach a point HIT_D px away
const HIT_D = 1300;
const SIGMA_T = 380; // softness of the ring, in ms (bigger = wider, gentler band)
const DECAY_LEN = 1500; // the ring gets a little weaker with distance
const CORE_MS = 2000; // how long the clicked name itself glows

type Ripple = { x: number; y: number; t0: number; end: number; color: string };
type Item = { word: string; cx: number; w: number };
type Anchor = { r: number; i: number; word: string; level: number; active: boolean };

// Shared between the left and right wall so a click on one continues on the other
const shared = { ripples: [] as Ripple[], subs: new Set<() => void>() };

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/**
 * A faint wall of skill names in the side margins. Hover to magnify the names under the
 * pointer; click one to light it up, and a soft ring of glow travels outward from it, across the
 * page and into the wall on the other side, then fades away. The name you clicked stays coloured
 * while its skill is selected. Clicking also picks the skill. Decorative only, so it is hidden
 * from assistive tech.
 */
export default function SkillWall({
  side,
  selected,
  onPick,
}: {
  side: "left" | "right";
  selected: string | null;
  onPick: (skill: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRef = useRef<Anchor | null>(null);
  const onPickRef = useRef(onPick);
  const redraw = useRef<() => void>(() => {});

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  // When the picked skill changes or is cleared, the clicked name fades back to normal
  useEffect(() => {
    const a = anchorRef.current;
    if (a && selected !== a.word) a.active = false;
    redraw.current();
  }, [selected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, inside: false };
    let rows: Item[][] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let lens = 0; // eased 0..1
    let raf = 0;
    let fam = "monospace";

    // Lay each row out as a continuous line of names, with a different start per row
    const buildRows = () => {
      ctx.font = `400 ${FONT_PX}px ${fam}`;
      const count = Math.ceil(h / CELL_H);
      const out: Item[][] = [];
      for (let r = 0; r < count; r++) {
        const items: Item[] = [];
        let x = -((r * 37 + (side === "right" ? 19 : 0)) % 80);
        let k = r * 3 + (side === "right" ? 2 : 0);
        while (x < w + 80) {
          const word = WORDS[k % WORDS.length];
          k++;
          const tw = ctx.measureText(word).width;
          items.push({ word, cx: x + tw / 2, w: tw });
          x += tw + GAP;
        }
        out.push(items);
      }
      rows = out;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      shared.ripples = shared.ripples.filter((rp) => now - rp.t0 < rp.end);
      const box = canvas.getBoundingClientRect();
      const anchor = anchorRef.current;

      for (let r = 0; r < rows.length; r++) {
        const cy = r * CELL_H + CELL_H / 2;
        for (let i = 0; i < rows[r].length; i++) {
          const { word, cx } = rows[r][i];

          // Glow from every active ripple, measured in page coordinates so it carries across
          let glow = 0;
          let accent = "#ffffff";
          for (const rp of shared.ripples) {
            const t = now - rp.t0;
            const d = Math.hypot(box.left + cx - rp.x, box.top + cy - rp.y);
            const coreFade = Math.pow(Math.max(0, 1 - t / CORE_MS), 1.6);
            let v: number;
            if (reduce) {
              v = d < 90 ? coreFade : 0;
            } else {
              // A soft ring: each name brightens as it approaches and dims as it passes
              const s = t - HIT_MS * Math.pow(d / HIT_D, 0.7);
              const ring = Math.exp(-(s * s) / (2 * SIGMA_T * SIGMA_T)) * Math.exp(-d / DECAY_LEN);
              const core = Math.exp(-(d * d) / (2 * 12 * 12)) * coreFade;
              v = Math.max(ring, core);
            }
            if (v > glow) {
              glow = v;
              accent = rp.color;
            }
          }
          // The name that was clicked stays coloured while its skill is selected
          if (anchor && anchor.r === r && anchor.i === i && anchor.level * 0.9 > glow) {
            glow = anchor.level * 0.9;
            accent = skillTheme(anchor.word).color;
          }
          const g = Math.min(1, glow);

          // Magnifier around the pointer
          let k = 0;
          if (lens > 0.01) {
            k = Math.max(0, 1 - Math.hypot(cx - mouse.x, cy - mouse.y) / LENS_R) * lens;
          }
          const scale = reduce ? 1 : 1 + 0.9 * k * k;
          const base = 0.13 + 0.62 * k;

          // Colour blends from the quiet white toward the accent as the glow rises, and back
          // as it falls, so there is never a sudden jump
          const [ar, ag, ab] = rgb(accent);
          ctx.fillStyle = `rgb(${Math.round(255 + (ar - 255) * g)}, ${Math.round(
            255 + (ag - 255) * g
          )}, ${Math.round(255 + (ab - 255) * g)})`;
          ctx.globalAlpha = Math.min(1, base + 0.85 * g);
          ctx.shadowColor = accent;
          ctx.shadowBlur = g > 0.03 ? 12 * g : 0;
          ctx.font = `400 ${FONT_PX * scale}px ${fam}`;
          ctx.fillText(word, cx, cy);
        }
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    // Only runs while something is animating, so it costs nothing at rest
    const tick = (now: number) => {
      const target = mouse.inside ? 1 : 0;
      lens += (target - lens) * 0.18;
      if (Math.abs(target - lens) < 0.01) lens = target;

      // Ease the clicked name in and out
      let anchorBusy = false;
      const a = anchorRef.current;
      if (a) {
        const to = a.active ? 1 : 0;
        a.level += (to - a.level) * 0.07;
        if (Math.abs(to - a.level) < 0.01) {
          a.level = to;
          if (!a.active) anchorRef.current = null;
        }
        const cur = anchorRef.current;
        anchorBusy = cur !== null && cur.level !== (cur.active ? 1 : 0);
      }

      draw(now);
      raf = shared.ripples.length > 0 || lens !== target || anchorBusy ? requestAnimationFrame(tick) : 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    redraw.current = schedule;
    shared.subs.add(schedule);

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      fam = getComputedStyle(canvas).fontFamily || "monospace";
      buildRows();
      schedule();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.fonts.ready.then(resize);

    const local = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      Object.assign(mouse, local(e), { inside: true });
      schedule();
    };
    const onLeave = () => {
      mouse.inside = false;
      schedule();
    };
    const onClick = (e: MouseEvent) => {
      const { x, y } = local(e);
      const r = Math.min(rows.length - 1, Math.max(0, Math.floor(y / CELL_H)));
      const row = rows[r];
      if (!row || row.length === 0) return;
      // The name whose centre is closest to the pointer
      let best = 0;
      for (let i = 1; i < row.length; i++) {
        if (Math.abs(row[i].cx - x) < Math.abs(row[best].cx - x)) best = i;
      }
      const item = row[best];
      const box = canvas.getBoundingClientRect();
      const reach = Math.hypot(window.innerWidth, window.innerHeight);
      shared.ripples.push({
        x: box.left + item.cx,
        y: box.top + r * CELL_H + CELL_H / 2,
        t0: performance.now(),
        end: reduce ? CORE_MS : HIT_MS * Math.pow(reach / HIT_D, 0.7) + 3.5 * SIGMA_T,
        color: skillTheme(item.word).color,
      });
      anchorRef.current = { r, i: best, word: item.word, level: 0, active: true };
      onPickRef.current(item.word);
      shared.subs.forEach((fn) => fn()); // wake both walls
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      shared.subs.delete(schedule);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [side]);

  return (
    <div
      aria-hidden
      className={`fixed inset-y-0 z-0 hidden w-[calc((100vw-72rem)/2)] font-[family-name:var(--font-geist-mono)] min-[1360px]:block ${
        side === "left"
          ? "left-0 [mask-image:linear-gradient(to_right,black_45%,transparent)]"
          : "right-0 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
      }`}
    >
      <canvas ref={canvasRef} className="block h-full w-full cursor-pointer" />
    </div>
  );
}
