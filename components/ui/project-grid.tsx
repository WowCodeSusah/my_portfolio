"use client";

import { useState } from "react";
import { categories, projects, type Category, type Project } from "@/lib/projects";
import { useFlip } from "@/lib/use-flip";
import { PANEL_CLASS, panelStyle } from "@/lib/panel";

export type Filter = "All" | Category;

const ALL = { color: "#ededed", tint: "#0a0a0a", on: "#000000" };
const INK = "#ededed";

export default function ProjectGrid({
  filter,
  onFilterChange,
  highlight,
}: {
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  highlight: string | null;
}) {
  const [open, setOpen] = useState<string | null>(null);

  const used = (Object.keys(categories) as Category[]).filter((c) =>
    projects.some((p) => p.category === c)
  );
  const filters: Filter[] = ["All", ...used];
  const visible = projects.filter((p) => filter === "All" || p.category === filter);
  const matches = (p: Project) => !!highlight && p.stack.includes(highlight);
  const anyHit = visible.some(matches);
  // Projects that use the picked skill move to the front
  const ordered = anyHit
    ? [...visible].sort((a, b) => Number(matches(b)) - Number(matches(a)))
    : visible;
  const flip = useFlip(ordered.map((p) => p.slug).join(","));
  const count = (f: Filter) =>
    f === "All" ? projects.length : projects.filter((p) => p.category === f).length;

  return (
    <div className={PANEL_CLASS} style={panelStyle(filter)}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {filters.map((f) => {
          const t = f === "All" ? ALL : categories[f];
          const selected = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={selected}
              onClick={() => onFilterChange(f)}
              className="rounded-full border-2 px-4 py-2 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
              style={{
                backgroundColor: selected ? t.color : "transparent",
                borderColor: t.color,
                color: selected ? t.on : INK,
              }}
            >
              {f} <span className="opacity-70">{count(f)}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((p) => {
          const c = categories[p.category];
          const isOpen = open === p.slug;
          const isHit = matches(p);
          const dim = anyHit && !isHit;
          return (
            <li
              key={p.slug}
              id={`project-${p.slug}`}
              ref={flip(p.slug)}
              className={`scroll-mt-28 self-start rounded-2xl border border-[var(--line)] bg-black p-6 transition duration-300 motion-reduce:transition-none ${
                dim ? "opacity-40" : "opacity-100"
              }`}
              style={{ boxShadow: isHit
                  ? `0 0 0 2px ${c.color}, 0 0 28px ${c.color}33`
                  : "0 0 0 0 transparent, 0 0 0 0 transparent" }}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {p.category}
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-[var(--muted)]">{p.pitch}</p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-full px-3 py-1 text-sm font-medium"
                    style={{
                      backgroundColor: s === highlight ? c.color : c.tint,
                      color: s === highlight ? c.on : c.color,
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${p.slug}-details`}
                onClick={() => setOpen(isOpen ? null : p.slug)}
                className="mt-5 text-sm font-semibold underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                style={{ textDecorationColor: c.color }}
              >
                {isOpen ? "Hide details" : "Show details"}
              </button>

              <div
                id={`${p.slug}-details`}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pt-4 text-[var(--muted)]">{p.details}</p>
                  {p.links && p.links.length > 0 && (
                    <div className="flex gap-4 pt-3">
                      {p.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold underline decoration-2 underline-offset-4"
                          style={{ textDecorationColor: c.color }}
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
