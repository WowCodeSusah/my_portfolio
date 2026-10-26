"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * The opening of the case study. The title, the facts panel and the scroll cue are all on screen
 * from the start. On larger screens the opening pins to the screen, and scrolling eases the title
 * block back and lifts the facts as it leads into the story. On small screens and for reduced
 * motion, nothing is pinned and everything simply sits on the page.
 *
 * The scroll position is written straight into CSS variables (no re-rendering), and the
 * --on variable switches the whole effect off outside the pinned layout.
 */
export default function HeroScroll({ header, facts }: { header: ReactNode; facts: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="relative md:motion-safe:h-[160vh] md:motion-safe:[--on:1]"
      style={{ "--p": 0 } as CSSProperties}
    >
      <div className="md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:flex-col md:motion-safe:justify-start">
        <div
          style={{
            transformOrigin: "left top",
            transform:
              "scale(calc(1 - var(--p) * var(--on, 0) * 0.2))",
            opacity: "calc(1 - var(--p) * var(--on, 0) * 0.5)",
          }}
        >
          {header}
        </div>

        {/* Always visible; it rides up with the title block as you scroll */}
        <div style={{ transform: "translateY(calc(var(--p) * var(--on, 0) * -9vh))" }}>{facts}</div>

        {/* A nudge to scroll, which disappears as soon as you do */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-16 left-0 hidden items-center gap-2 text-sm text-[var(--faint)] md:motion-safe:flex"
          style={{ opacity: "max(0, calc(1 - var(--p) * 10))" }}
        >
          <span>Scroll</span>
          <svg
            viewBox="0 0 16 16"
            className="size-4 motion-safe:animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 6 8 10.5 12.5 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
