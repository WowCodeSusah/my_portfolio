"use client";

import { useEffect, useRef, useState } from "react";
import { skillGroups, type SkillGroup } from "@/lib/skills";
import { projects } from "@/lib/projects";
import { experience, jobId } from "@/lib/experience";

const INK = "#ededed";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

function Group({
  group,
  selected,
  onSelect,
}: {
  group: SkillGroup;
  selected: string | null;
  onSelect: (skill: string) => void;
}) {
  const [ref, shown] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <h3 className="text-lg font-semibold">{group.name}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {group.skills.map((s, i) => {
          const on = selected === s;
          return (
            <li
              key={s}
              className={`transition duration-500 motion-reduce:transition-none ${
                shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: shown ? `${i * 80}ms` : "0ms" }}
            >
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(s)}
                className="rounded-full border-2 px-4 py-2 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
                style={{
                  borderColor: group.color,
                  backgroundColor: on ? group.color : "transparent",
                  color: on ? group.on : INK,
                }}
              >
                {s}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Links({ items }: { items: { label: string; href: string }[] }) {
  return (
    <>
      {items.map((it, i) => (
        <span key={it.href}>
          {i > 0 && (i === items.length - 1 ? " and " : ", ")}
          <a href={it.href} className="font-semibold underline decoration-2 underline-offset-4">
            {it.label}
          </a>
        </span>
      ))}
    </>
  );
}

export default function Skills({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (skill: string) => void;
}) {
  const inProjects = selected
    ? projects
        .filter((p) => p.stack.includes(selected))
        .map((p) => ({ label: p.title, href: `#project-${p.slug}` }))
    : [];
  const inJobs = selected
    ? experience
        .filter((j) => j.tech.includes(selected))
        .map((j) => ({ label: j.company, href: `#${jobId(j)}` }))
    : [];

  return (
    <section aria-label="Skills">
      <h2 className="text-2xl font-semibold tracking-tight">Skills</h2>
      <div className="mt-6 grid gap-8">
        {skillGroups.map((g) => (
          <Group key={g.name} group={g} selected={selected} onSelect={onSelect} />
        ))}
      </div>

      <p className="mt-8 text-base" aria-live="polite">
        {!selected && (
          <span className="text-[var(--faint)]">Select a skill to see where I&apos;ve used it.</span>
        )}
        {selected && inProjects.length === 0 && inJobs.length === 0 && (
          <span>{selected} isn&apos;t linked to a project or role yet.</span>
        )}
        {selected && (inProjects.length > 0 || inJobs.length > 0) && (
          <span>
            {selected} is used
            {inProjects.length > 0 && (
              <>
                {" "}in <Links items={inProjects} />
              </>
            )}
            {inProjects.length > 0 && inJobs.length > 0 && " and"}
            {inJobs.length > 0 && (
              <>
                {" "}at <Links items={inJobs} />
              </>
            )}
            .
          </span>
        )}
      </p>
    </section>
  );
}
