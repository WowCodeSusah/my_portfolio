"use client";

import { useEffect, useRef, useState } from "react";
import Skills from "@/components/ui/skills";
import { skillTheme } from "@/lib/skills";

/**
 * The skills panel, tucked away at the left edge. A small tab stays in view; hover it (or tap,
 * or tab to it) and the panel slides out. Picking a skill works exactly as before.
 */
export default function SkillsDrawer({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (skill: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = selected ? skillTheme(selected) : null;

  function openNow() {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }
  function closeSoon() {
    if (timer.current) clearTimeout(timer.current);
    // short delay so the pointer can travel from the tab to the panel
    timer.current = setTimeout(() => setOpen(false), 300);
  }

  // Tapping anywhere else closes it again (touch screens)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const mouseIn = (e: React.PointerEvent) => e.pointerType === "mouse" && openNow();
  const mouseOut = (e: React.PointerEvent) => e.pointerType === "mouse" && closeSoon();
  const onBlur = (e: React.FocusEvent) => {
    if (!wrap.current?.contains(e.relatedTarget as Node)) closeSoon();
  };

  return (
    <div
      ref={wrap}
      className="pointer-events-none fixed left-0 top-1/2 z-30 flex -translate-y-1/2 items-center gap-2"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label="Show skills"
        aria-expanded={open}
        aria-controls="skills-drawer"
        onPointerEnter={mouseIn}
        onPointerLeave={mouseOut}
        onFocus={openNow}
        onBlur={onBlur}
        onClick={() => {
          // Hover-capable devices already opened it; touch devices toggle on tap
          if (window.matchMedia("(hover: none)").matches) setOpen((o) => !o);
          else openNow();
        }}
        className="pointer-events-auto flex flex-col items-center gap-3 rounded-r-xl border border-l-0 border-[var(--line)] bg-black/80 px-2 py-4 text-[var(--muted)] backdrop-blur transition-colors duration-300 hover:text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-white motion-reduce:transition-none"
      >
        {selected && theme && (
          <>
            <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: theme.color }} />
            <span className="sr-only">{selected} is highlighted</span>
          </>
        )}
        <span className="text-sm font-medium [writing-mode:vertical-rl]">Skills</span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${
            open ? "rotate-90" : "-rotate-90"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 6 8 10.5 12.5 6" />
        </svg>
      </button>

      <div
        id="skills-drawer"
        onPointerEnter={mouseIn}
        onPointerLeave={mouseOut}
        onFocus={openNow}
        onBlur={onBlur}
        className={`max-h-[calc(100vh-6rem)] w-64 max-w-[calc(100vw-4rem)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-black/85 p-5 backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ transform: open ? "none" : "translateX(calc(-100% - 4rem))" }}
      >
        <Skills selected={selected} onSelect={onSelect} />
      </div>
    </div>
  );
}
