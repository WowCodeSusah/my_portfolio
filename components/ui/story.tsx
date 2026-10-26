"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ArchitectureDiagram from "@/components/ui/architecture-diagram";
import MiniBrowser from "@/components/ui/mini-browser";
import { PANEL_CLASS } from "@/lib/panel";
import type { CaseStudy } from "@/lib/case-studies";

const STEP_VH = 60; // how much scrolling each step takes, as a share of the screen height
const card = "rounded-2xl border border-[var(--line)] bg-black p-5 sm:p-6";
const h2 = "text-3xl font-semibold tracking-tight";

type Chapter = {
  id: string;
  label: string;
  steps: number; // how many scroll steps the chapter lasts
  // sub = which step of the chapter (null in the plain layout); near = close enough to start loading heavy things
  render: (sub: number | null, near: boolean) => ReactNode;
};

/**
 * The case study as a scroll-driven story. On larger screens the content is pinned to the
 * screen and changes as you scroll: chapters slide in and out, the diagram lights up one part
 * at a time, and the decisions are picked out one by one. On small screens, and for people who
 * prefer reduced motion, it falls back to a plain stack of sections.
 */
export default function Story({
  study,
  panel,
  accent,
}: {
  study: CaseStudy;
  panel: CSSProperties;
  accent: string;
}) {
  const a = study.architecture;
  const order = [a.front.name, a.api.name, a.data.name, a.auth.name];

  const chapters: Chapter[] = [
    {
      id: "overview",
      label: "Overview",
      steps: 1,
      render: () => (
        <div className="max-w-prose space-y-4 text-lg leading-relaxed">
          {study.overview.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      ),
    },
    {
      id: "live",
      label: "See it live",
      steps: 1,
      render: (_sub, near) => (
        <div>
          <MiniBrowser url={study.liveUrl} load={near} />
          {study.liveUrl && (
            <div className="mt-6 text-center">
              <a
                href={study.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--muted)] underline decoration-[var(--line)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--fg)] motion-reduce:transition-none"
              >
                Open the live site
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "architecture",
      label: "How it fits together",
      steps: order.length,
      render: (sub) => (
        <ArchitectureDiagram nodes={a} focusName={sub === null ? undefined : order[sub]} />
      ),
    },
    {
      id: "decisions",
      label: "Decisions",
      steps: study.decisions.length,
      render: (sub) => (
        <ul className="grid gap-4 md:grid-cols-3">
          {study.decisions.map((d, i) => {
            const on = sub === i;
            const dim = sub !== null && !on;
            return (
              <li
                key={d.title}
                className={`${card} transition duration-500 motion-reduce:transition-none ${
                  dim ? "opacity-40" : "opacity-100"
                }`}
                style={{
                  borderColor: on ? accent : undefined,
                  boxShadow: on
                    ? `0 0 0 1px ${accent}, 0 0 28px ${accent}33`
                    : "0 0 0 0 transparent, 0 0 0 0 transparent",
                }}
              >
                <h3 className="text-xl font-semibold tracking-tight">{d.title}</h3>
                <p className="mt-3 text-[var(--muted)]">{d.body}</p>
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      id: "stands",
      label: "Where it stands",
      steps: 1,
      render: () => (
        <div className="grid gap-4 md:grid-cols-2">
          <div className={card}>
            <h3 className="text-xl font-semibold tracking-tight">Built so far</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--muted)] marker:text-[var(--faint)]">
              {study.built.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className={card}>
            <h3 className="text-xl font-semibold tracking-tight">Still to do</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--muted)] marker:text-[var(--faint)]">
              {study.next.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "lessons",
      label: "What I learned",
      steps: 1,
      render: () => (
        <ul className="max-w-prose list-disc space-y-3 pl-5 text-lg marker:text-[var(--faint)]">
          {study.lessons.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ),
    },
  ];

  // One entry per scroll step: which chapter it belongs to, and which step within it
  const stepMap = chapters.flatMap((c, ci) => Array.from({ length: c.steps }, (_, sub) => ({ ci, sub })));
  const firstStep = chapters.map((_, ci) => stepMap.findIndex((s) => s.ci === ci));
  const total = stepMap.length;

  const wrap = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const barBox = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      // The bar only shows once the scrolling has begun
      if (barBox.current) barBox.current.style.opacity = p > 0.01 ? "1" : "0";
      setStep(Math.min(total - 1, Math.floor(p * total)));
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
  }, [total]);

  function jumpTo(stepIndex: number) {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((stepIndex + 0.5) / total) * span, behavior: "smooth" });
  }

  const { ci, sub } = stepMap[step];

  return (
    <>
      {/* Pinned, scroll-driven version */}
      <div
        ref={wrap}
        className="relative mt-20 hidden md:motion-safe:block"
        style={{ height: `calc(${total * STEP_VH}vh + 100vh)` }}
      >
        <div className="sticky top-0 flex h-screen items-center gap-10">
          <nav aria-label="Story chapters" className="hidden w-44 shrink-0 lg:block">
            <ul>
              {chapters.map((c, i) => {
                const on = i === ci;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(firstStep[i])}
                      aria-current={on ? "step" : undefined}
                      className={`block w-full border-l-4 py-2 pl-4 text-left text-lg transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                        on ? "font-semibold text-[var(--fg)]" : "text-[var(--faint)] hover:text-[var(--fg)]"
                      }`}
                      style={{ borderColor: on ? accent : "rgba(255,255,255,0.12)" }}
                    >
                      {c.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div
              ref={barBox}
              aria-hidden
              className="h-1 overflow-hidden rounded-full bg-[var(--line)] transition-opacity duration-500 motion-reduce:transition-none"
              style={{ opacity: 0 }}
            >
              <div
                ref={bar}
                className="h-full origin-left rounded-full"
                style={{ backgroundColor: accent, transform: "scaleX(0)" }}
              />
            </div>

            <div className="relative" style={{ height: "calc(100vh - 9rem)" }}>
              {chapters.map((c, i) => {
                const state = i === ci ? "active" : i < ci ? "before" : "after";
                const thisSub = i === ci ? sub : i < ci ? c.steps - 1 : 0;
                return (
                  <div
                    key={c.id}
                    inert={state !== "active"}
                    aria-hidden={state !== "active"}
                    className={`absolute inset-0 flex items-center transition duration-700 ease-out motion-reduce:transition-none ${
                      state === "active"
                        ? "translate-x-0 opacity-100"
                        : `pointer-events-none opacity-0 ${state === "before" ? "-translate-x-24" : "translate-x-24"}`
                    }`}
                  >
                    <div className={`${PANEL_CLASS} max-h-full w-full overflow-y-auto`} style={panel}>
                      <h2 className={`${h2} mb-6`}>{c.label}</h2>
                      {c.render(thisSub, ci >= i - 1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Plain stacked version for small screens and reduced motion */}
      <div className="block md:motion-safe:hidden">
        {chapters.map((c) => (
          <section key={c.id} aria-label={c.label} className="mt-20">
            <h2 className={h2}>{c.label}</h2>
            <div className={`mt-8 ${PANEL_CLASS}`} style={panel}>
              {c.render(null, true)}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
