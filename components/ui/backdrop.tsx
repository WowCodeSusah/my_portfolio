"use client";

import { useEffect, useRef } from "react";

const SPACING = 30; // distance between dots, in px
const SPOT_R = 260; // radius of the pointer spotlight, in px
const DEFAULT_ACCENT = "#3291ff";
const TAU = Math.PI * 2;

// Slow drifting glows behind everything
const BLOBS = [
  { color: "#3291ff", x: 0.22, y: 0.25, ax: 0.14, ay: 0.12, px: 52000, py: 67000, ph: 0, r: 560 },
  { color: "#f81ce5", x: 0.8, y: 0.35, ax: 0.12, ay: 0.16, px: 61000, py: 47000, ph: 2, r: 520 },
  { color: "#50e3c2", x: 0.5, y: 0.85, ax: 0.2, ay: 0.08, px: 73000, py: 55000, ph: 4, r: 600 },
];
const BUCKET_ALPHA = [0.05, 0.08, 0.11, 0.15];

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/**
 * A quiet animated backdrop: a dot grid that shimmers, glows that drift, and a spotlight that
 * follows the pointer and lights the dots near it. The accent colour follows the picked skill
 * or category. Fixed behind the page and never captures the pointer. It stays out of the side
 * margins, which are reserved for the skill wall.
 */
export default function Backdrop({ accent }: { accent: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const accentRef = useRef(accent);
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    accentRef.current = accent;
    wake.current();
  }, [accent]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, px: 0, py: 0, level: 0, target: 0 };
    const col: number[] = [...rgb(DEFAULT_ACCENT)];
    let mix = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = reduce ? 0 : now;
      const [ar, ag, ab] = col.map(Math.round);

      // Drifting glows, pulled toward the accent colour when one is active
      for (const b of BLOBS) {
        const [br, bg, bb] = rgb(b.color);
        const cr = Math.round(br + (col[0] - br) * mix);
        const cg = Math.round(bg + (col[1] - bg) * mix);
        const cb = Math.round(bb + (col[2] - bb) * mix);
        const cx = (b.x + b.ax * Math.sin((t / b.px) * TAU + b.ph)) * w;
        const cy = (b.y + b.ay * Math.cos((t / b.py) * TAU + b.ph)) * h;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},0.09)`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Spotlight glow under the pointer
      if (mouse.level > 0.01) {
        const g = ctx.createRadialGradient(mouse.px, mouse.py, 0, mouse.px, mouse.py, SPOT_R * 1.3);
        g.addColorStop(0, `rgba(${ar},${ag},${ab},${0.14 * mouse.level})`);
        g.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Dot grid. Dots drift slightly as the page scrolls and shimmer in a slow diagonal wave.
      const oy = reduce ? 0 : -((window.scrollY * 0.25) % SPACING);
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 2;
      const buckets: number[][] = [[], [], [], []];
      const lit: number[] = [];
      for (let r = -1; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING + SPACING / 2;
          const y = r * SPACING + SPACING / 2 + oy;
          if (mouse.level > 0.01) {
            const d = Math.hypot(x - mouse.px, y - mouse.py);
            if (d < SPOT_R) {
              lit.push(x, y, d);
              continue;
            }
          }
          const wave = 0.5 + 0.5 * Math.sin(x * 0.011 + y * 0.007 - t * 0.0007);
          buckets[Math.min(3, Math.floor(wave * 4))].push(x, y);
        }
      }
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = `rgba(255,255,255,${BUCKET_ALPHA[i]})`;
        ctx.beginPath();
        const pts = buckets[i];
        for (let j = 0; j < pts.length; j += 2) ctx.rect(pts[j] - 0.75, pts[j + 1] - 0.75, 1.5, 1.5);
        ctx.fill();
      }
      // Dots near the pointer brighten, grow and take the accent colour
      for (let j = 0; j < lit.length; j += 3) {
        const k = Math.pow(1 - lit[j + 2] / SPOT_R, 2) * mouse.level;
        const m = Math.min(1, k * 1.6);
        const r = Math.round(255 + (ar - 255) * m);
        const g = Math.round(255 + (ag - 255) * m);
        const b = Math.round(255 + (ab - 255) * m);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.1 + 0.75 * k})`;
        ctx.beginPath();
        ctx.arc(lit[j], lit[j + 1], 0.9 + 1.4 * k, 0, TAU);
        ctx.fill();
      }
    };

    // Eases colours and the pointer, then draws. Returns true while more frames are needed.
    const frame = (now: number) => {
      const goal = accentRef.current ? rgb(accentRef.current) : rgb(DEFAULT_ACCENT);
      const mixGoal = accentRef.current ? 0.75 : 0;
      let busy = !reduce;
      for (let i = 0; i < 3; i++) {
        col[i] += (goal[i] - col[i]) * 0.08;
        if (Math.abs(goal[i] - col[i]) > 0.5) busy = true;
      }
      mix += (mixGoal - mix) * 0.08;
      if (Math.abs(mixGoal - mix) > 0.01) busy = true;
      if (!reduce) {
        mouse.px += (mouse.x - mouse.px) * 0.14;
        mouse.py += (mouse.y - mouse.py) * 0.14;
        mouse.level += (mouse.target - mouse.level) * 0.08;
      }
      draw(now);
      return busy;
    };

    // About 30 frames a second is plenty for something this slow, and easier on batteries
    const loop = (now: number) => {
      if (!reduce && now - last < 32) {
        raf = requestAnimationFrame(loop);
        return;
      }
      last = now;
      raf = frame(now) ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    wake.current = start;

    // Fades the backdrop out across the same stretch where the skill wall fades out, using a smooth
    // curve, so the two blend into each other instead of meeting at an edge. Must match the wall's
    // width in page.tsx: (100vw - 72rem) / 2, and the wall's own fade in skill-wall.tsx.
    const applyMask = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const wall = window.innerWidth >= 1360 ? (window.innerWidth - 72 * rem) / 2 : 0;
      if (wall <= 0) {
        canvas.style.setProperty("mask-image", "none");
        canvas.style.setProperty("-webkit-mask-image", "none");
        return;
      }
      const W = canvas.clientWidth;
      const from = wall * 0.4; // where the wall starts to fade, and the backdrop starts to appear
      const to = wall + 3 * rem; // fully visible from here
      const steps = 10;
      const up: string[] = [];
      const down: string[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = (t * t * (3 - 2 * t)).toFixed(3); // smoothstep
        up.push(`rgba(0,0,0,${a}) ${(from + (to - from) * t).toFixed(1)}px`);
        down.unshift(`rgba(0,0,0,${a}) ${(W - from - (to - from) * t).toFixed(1)}px`);
      }
      const g = `linear-gradient(to right, transparent 0px, ${up.join(", ")}, ${down.join(", ")}, transparent ${W}px)`;
      canvas.style.setProperty("mask-image", g);
      canvas.style.setProperty("-webkit-mask-image", g);
    };

    const resize = () => {
      applyMask();
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      start();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      if (mouse.target === 0) {
        mouse.px = e.clientX;
        mouse.py = e.clientY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.target = 1;
      start();
    };
    const onLeave = () => {
      mouse.target = 0;
      start();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  // On wide screens the side margins belong to the skill wall; the backdrop blends out into it
  // (see applyMask above), so the two effects never fight over the same space.
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
