"use client";

import { experience, jobId, type Job } from "@/lib/experience";
import { skillTheme } from "@/lib/skills";
import { useFlip } from "@/lib/use-flip";
import { PANEL_CLASS } from "@/lib/panel";
import { ViewTransition, type CSSProperties } from "react";

export default function Experience({
  highlight,
  panel,
}: {
  highlight: string | null;
  panel: CSSProperties;
}) {
  const matches = (j: Job) => !!highlight && j.tech.includes(highlight);
  const anyHit = experience.some(matches);
  // Roles that used the picked skill move to the front
  const ordered = anyHit
    ? [...experience].sort((a, b) => Number(matches(b)) - Number(matches(a)))
    : experience;
  const flip = useFlip(ordered.map(jobId).join(","));
  const ring = highlight ? skillTheme(highlight).color : "transparent";

  return (
    <ViewTransition exit="out-left" enter="in-l2">
    <section id="experience" aria-label="Experience" className="mt-20 scroll-mt-28">
      <h2 className="text-3xl font-semibold tracking-tight">Experience</h2>

      <div className={`mt-8 ${PANEL_CLASS}`} style={panel}>
      <ol className="space-y-4">
        {ordered.map((job) => {
          const id = jobId(job);
          const isHit = matches(job);
          const dim = anyHit && !isHit;
          return (
            <li
              key={id}
              id={id}
              ref={flip(id)}
              className={`grid scroll-mt-28 gap-3 rounded-2xl border bg-black p-5 transition duration-300 motion-reduce:transition-none sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 sm:p-6 ${
                isHit ? "border-transparent" : "border-[var(--line)]"
              } ${dim ? "opacity-40" : "opacity-100"}`}
              style={{ boxShadow: isHit
                  ? `0 0 0 2px ${ring}, 0 0 28px ${ring}33`
                  : "0 0 0 0 transparent, 0 0 0 0 transparent" }}
            >
              <p className="text-[var(--faint)]">
                {job.start} to {job.end}
              </p>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight">{job.role}</h3>
                <p className="mt-1 text-lg text-[var(--muted)]">
                  {job.company}
                  {job.type ? `, ${job.type.toLowerCase()}` : ""}
                </p>

                <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5 marker:text-[var(--faint)]">
                  {job.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {job.tech.map((t) => {
                    const theme = skillTheme(t);
                    const on = t === highlight;
                    return (
                      <li
                        key={t}
                        className="rounded-full px-3 py-1 text-sm font-medium transition-colors duration-300 motion-reduce:transition-none"
                        style={{
                          backgroundColor: on ? theme.color : theme.tint,
                          color: on ? theme.on : theme.color,
                        }}
                      >
                        {t}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
      </div>
    </section>
    </ViewTransition>
  );
}
