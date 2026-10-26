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
const HIT_MS = 3000; // time for the ring to reach a point HIT_D px away (bigger = slower)
const HIT_D = 1300;
const RING_BASE = 28; // thickness of the ring near the click, in px
const RING_GROW = 0.025; // the ring gets a little thicker as it travels
const DECAY_LEN = 1800; // the ring gets a little weaker with distance
const CORE_MS = 2800; // how long the clicked name itself glows at the start
const BURST_SPEED = 0.65; // link bursts travel faster than the idle pulses
const IDLE_MS = 14000; // each wall sends a gentle pulse this often, taking turns with the other

type Ripple = {
  x: number;
  y: number;
  t0: number;
  end: number;
  color: string;
  strength: number;
  speed: number; // 1 = normal; lower is faster
  hot: boolean; // runs white-hot at its peak
  pop: number; // how much the names swell as the ring passes
  width: number; // ring thickness multiplier
};
type Item = { word: string; cx: number; w: number };
type Anchor = { r: number; i: number; word: string; level: number; active: boolean };

// Shared between the left and right wall so a click on one continues on the other
const shared = { ripples: [] as Ripple[], subs: new Set<() => void>(), cycle: 0 };

// Fades the wall out toward the page content with a smooth curve (smoothstep) rather than a
// straight ramp, so it blends into the backdrop. Pairs with applyMask in backdrop.tsx.
const fadeMask = (dir: "to right" | "to left") => {
  const stops: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const a = 1 - t * t * (3 - 2 * t);
    stops.push(`rgba(0,0,0,${a.toFixed(3)}) ${(40 + 60 * t).toFixed(1)}%`);
  }
  return `linear-gradient(${dir}, black 0%, ${stops.join(", ")})`;
};
const MASKS = { left: fadeMask("to right"), right: fadeMask("to left") };

/**
 * A burst for page links: two bright white rings, one after the other, faster and thicker than the
 * idle pulses. Names swell and flare white as a ring passes, so it reads as a different event
 * from the coloured pulses.
 */
export function emitRipple(x: number, y: number) {
  const reach = Math.hypot(window.innerWidth, window.innerHeight);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const now = performance.now();
  const rings = reduce
    ? [{ delay: 0, strength: 1 }]
    : [
        { delay: 0, strength: 1 },
        { delay: 260, strength: 0.65 },
      ];
  for (const { delay, strength } of rings) {
    shared.ripples.push({
      x,
      y,
      t0: now + delay,
      end: HIT_MS * BURST_SPEED * Math.pow(reach / HIT_D, 0.7) + 400,
      color: "#ffffff",
      strength,
      speed: BURST_SPEED,
      hot: true,
      pop: 0.45,
      width: 1.6,
    });
  }
  shared.subs.forEach((fn) => fn());
}

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/**
 * A faint wall of skill names in the side margins. Hover to magnify the names under the
 * pointer; click one to light it up, and a single ring of glow travels outward from it, across the
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
      let lastFont = "";
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
          let hot = false;
          let pop = 0;
          for (const rp of shared.ripples) {
            const t = now - rp.t0;
            if (t < 0) continue; // an echo that hasn't started yet
            const d = Math.hypot(box.left + cx - rp.x, box.top + cy - rp.y);
            const coreFade = Math.pow(Math.max(0, 1 - t / CORE_MS), 1.6);
            let v: number;
            if (reduce) {
              v = d < 90 ? coreFade : 0;
            } else {
              // One ring that expands outward from the click, speeding up as it goes
              const radius = HIT_D * Math.pow(t / (HIT_MS * rp.speed), 1 / 0.7);
              const sigma = (RING_BASE + RING_GROW * d) * rp.width;
              const ring =
                Math.exp(-Math.pow(d - radius, 2) / (2 * sigma * sigma)) * Math.exp(-d / DECAY_LEN);
              const core = Math.exp(-(d * d) / (2 * 12 * 12)) * coreFade;
              v = Math.max(ring, core);
            }
            v *= rp.strength;
            if (rp.pop > 0) pop = Math.max(pop, rp.pop * v);
            if (v > glow) {
              glow = v;
              accent = rp.color;
              hot = rp.hot;
            }
          }
          // The name that was clicked stays coloured while its skill is selected
          if (anchor && anchor.r === r && anchor.i === i && anchor.level * 0.9 > glow) {
            glow = anchor.level * 0.9;
            accent = skillTheme(anchor.word).color;
            hot = false;
          }
          const g = Math.min(1, glow);

          // Magnifier around the pointer
          let k = 0;
          if (lens > 0.01) {
            k = Math.max(0, 1 - Math.hypot(cx - mouse.x, cy - mouse.y) / LENS_R) * lens;
          }
          const scale = reduce ? 1 : 1 + 0.9 * k * k + pop;
          const base = 0.13 + 0.62 * k;

          // Colour blends from the quiet white toward the accent as the glow rises, and back
          // as it falls, so there is never a sudden jump
          const [ar, ag, ab] = rgb(accent);
          // Link bursts run white-hot at their peak; everything else just takes the accent colour
          const white = hot ? Math.max(0, (g - 0.35) / 0.65) * 0.75 : 0;
          const tone = (a: number) => {
            const c = 255 + (a - 255) * g;
            return Math.round(c + (255 - c) * white);
          };
          ctx.fillStyle = `rgb(${tone(ar)}, ${tone(ag)}, ${tone(ab)})`;
          ctx.globalAlpha = Math.min(1, base + 0.85 * g);
          const blur = g > 0.25 ? (hot ? 16 : 10) * g : 0;
          if (blur > 0) ctx.shadowColor = accent;
          ctx.shadowBlur = blur;
          const font = `400 ${(FONT_PX * scale).toFixed(1)}px ${fam}`;
          if (font !== lastFont) {
            ctx.font = font;
            lastFont = font;
          }
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
        end: reduce ? CORE_MS : HIT_MS * Math.pow(reach / HIT_D, 0.7) + 400,
        color: skillTheme(item.word).color,
        strength: 1,
        speed: 1,
        hot: false,
        pop: 0,
        width: 1,
      });
      anchorRef.current = { r, i: best, word: item.word, level: 0, active: true };
      onPickRef.current(item.word);
      shared.subs.forEach((fn) => fn()); // wake both walls
    };

    // Every so often a gentle pulse in the next colour runs by itself, so it is clear the wall
    // can change colour. It never selects anything, and the two walls take turns.
    const pulse = () => {
      if (reduce || document.hidden || w === 0 || rows.length === 0) return;
      const wanted = skillGroups[shared.cycle++ % skillGroups.length].color;
      let found: { r: number; item: Item } | null = null;
      for (let tries = 0; tries < 40 && !found; tries++) {
        const r = Math.floor(Math.random() * rows.length);
        const row = rows[r];
        const item = row[Math.floor(Math.random() * row.length)];
        if (item && skillTheme(item.word).color === wanted) found = { r, item };
      }
      if (!found) return;
      const box = canvas.getBoundingClientRect();
      const reach = Math.hypot(window.innerWidth, window.innerHeight);
      shared.ripples.push({
        x: box.left + found.item.cx,
        y: box.top + found.r * CELL_H + CELL_H / 2,
        t0: performance.now(),
        end: HIT_MS * Math.pow(reach / HIT_D, 0.7) + 400,
        color: wanted,
        strength: 0.6,
        speed: 1,
        hot: false,
        pop: 0,
        width: 1,
      });
      shared.subs.forEach((fn) => fn());
    };
    let idle: ReturnType<typeof setInterval> | undefined;
    const idleStart = setTimeout(
      () => {
        pulse();
        idle = setInterval(pulse, IDLE_MS);
      },
      IDLE_MS / 2 + (side === "right" ? IDLE_MS / 2 : 0)
    );

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idleStart);
      if (idle) clearInterval(idle);
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
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ maskImage: MASKS[side], WebkitMaskImage: MASKS[side] }}
    >
      <canvas ref={canvasRef} className="block h-full w-full cursor-pointer" />
    </div>
  );
}
