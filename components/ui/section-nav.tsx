"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { projects } from "@/lib/projects";
import { experience } from "@/lib/experience";
import { skillTheme } from "@/lib/skills";

const items = [
  { id: "projects", label: "Projects", color: "#3291ff", on: "#000000" },
  { id: "experience", label: "Experience", color: "#50e3c2", on: "#000000" },
  { id: "education", label: "Education", color: "#f5a623", on: "#000000" },
  { id: "about", label: "About", color: "#f81ce5", on: "#000000" },
];

export default function SectionNav({
  skill,
  onClear,
}: {
  skill: string | null;
  onClear: () => void;
}) {
  const [active, setActive] = useState("projects");
  const [past, setPast] = useState(false); // scrolled beyond the intro
  const [open, setOpen] = useState(false); // dropped down by hover, focus or tap
  const sentinel = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mark the section that is currently near the top of the screen
  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Tuck the bar away once the title and intro have scrolled out of view
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      const scrolledPast = !e.isIntersecting && e.boundingClientRect.top < 0;
      setPast(scrolledPast);
      if (!scrolledPast) setOpen(false);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

  function openNow() {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }
  function closeSoon() {
    if (timer.current) clearTimeout(timer.current);
    // short delay so the pointer can travel from the arrow to the bar
    timer.current = setTimeout(() => setOpen(false), 250);
  }

  function go(e: MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
    setOpen(false);
  }

  // When a skill is picked, show how many projects and roles use it
  const counts: Record<string, number> = skill
    ? {
        projects: projects.filter((p) => p.stack.includes(skill)).length,
        experience: experience.filter((j) => j.tech.includes(skill)).length,
      }
    : {};
  const theme = skill ? skillTheme(skill) : null;
  const tucked = past && !open;

  return (
    <>
      {/* Marks the end of the intro; the bar only tucks away after this scrolls past */}
      <div ref={sentinel} aria-hidden className="h-px" />

      <div
        ref={wrap}
        className="pointer-events-none sticky top-8 z-20 mt-10 w-fit max-w-full"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        {/* Arrow tab, shown at the top edge while the bar is tucked away */}
        <button
          type="button"
          aria-label="Show section navigation"
          aria-expanded={!tucked}
          aria-controls="section-nav"
          tabIndex={past ? 0 : -1}
          onPointerEnter={(e) => e.pointerType === "mouse" && openNow()}
          onPointerLeave={(e) => e.pointerType === "mouse" && closeSoon()}
          onFocus={openNow}
          onBlur={(e) => {
            if (!wrap.current?.contains(e.relatedTarget as Node)) closeSoon();
          }}
          onClick={() => {
            // Hover-capable devices already opened it; touch devices toggle on tap
            if (window.matchMedia("(hover: none)").matches) setOpen((o) => !o);
            else openNow();
          }}
          className={`pointer-events-auto absolute -top-8 left-1/2 flex h-7 -translate-x-1/2 items-center gap-2 rounded-b-xl border border-t-0 border-[var(--line)] bg-black/80 px-4 text-[var(--muted)] backdrop-blur transition-opacity duration-300 hover:text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-white motion-reduce:transition-none ${
            past ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {skill && theme && (
            <>
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: theme.color }}
              />
              <span className="sr-only">{skill} is highlighted</span>
            </>
          )}
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
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

        <nav
          id="section-nav"
          aria-label="Page sections"
          onPointerEnter={(e) => e.pointerType === "mouse" && openNow()}
          onPointerLeave={(e) => e.pointerType === "mouse" && closeSoon()}
          onFocus={openNow}
          onBlur={(e) => {
            if (!wrap.current?.contains(e.relatedTarget as Node)) closeSoon();
          }}
          className={`flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[var(--line)] bg-black/70 p-1.5 backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none ${
            tucked ? "pointer-events-none" : "pointer-events-auto"
          }`}
          style={{ transform: tucked ? "translateY(calc(-100% - 3rem))" : "none" }}
        >
          {items.map((i) => {
            const on = active === i.id;
            const n = counts[i.id] ?? 0;
            return (
              <a
                key={i.id}
                href={`#${i.id}`}
                onClick={(e) => go(e, i.id)}
                aria-current={on ? "true" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-base font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${
                  on ? "" : "text-[var(--muted)] hover:bg-white/10 hover:text-[var(--fg)]"
                }`}
                style={on ? { backgroundColor: i.color, color: i.on } : undefined}
              >
                {i.label}
                {n > 0 && (
                  <>
                    <span
                      aria-hidden
                      className="rounded-full bg-[var(--fg)] px-2 text-sm text-black"
                    >
                      {n}
                    </span>
                    <span className="sr-only">
                      , {n} {n === 1 ? "match" : "matches"} for {skill}
                    </span>
                  </>
                )}
              </a>
            );
          })}

          {skill && theme && (
            <button
              type="button"
              onClick={onClear}
              aria-label={`Clear ${skill} highlight`}
              className="ml-1 shrink-0 rounded-full px-4 py-2 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ backgroundColor: theme.color, color: theme.on }}
            >
              {skill} &times;
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
