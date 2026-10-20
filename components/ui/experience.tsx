"use client";

import { experience, jobId, type Job } from "@/lib/experience";
import { skillTheme } from "@/lib/skills";
import { useFlip } from "@/lib/use-flip";

export default function Experience({ highlight }: { highlight: string | null }) {
  const matches = (j: Job) => !!highlight && j.tech.includes(highlight);
  const anyHit = experience.some(matches);
  // Roles that used the picked skill move to the front
  const ordered = anyHit
    ? [...experience].sort((a, b) => Number(matches(b)) - Number(matches(a)))
    : experience;
  const flip = useFlip(ordered.map(jobId).join(","));
  const ring = highlight ? skillTheme(highlight).color : "transparent";

  return (
    <section id="experience" aria-label="Experience" className="mt-20 scroll-mt-28">
      <h2 className="text-3xl font-semibold tracking-tight">Experience</h2>

      <ol className="mt-8 space-y-4">
        {ordered.map((job) => {
          const id = jobId(job);
          const isHit = matches(job);
          const dim = anyHit && !isHit;
          return (
            <li
              key={id}
              id={id}
              ref={flip(id)}
              className={`grid scroll-mt-28 gap-3 rounded-2xl border p-6 transition duration-300 motion-reduce:transition-none sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 sm:p-8 ${
                isHit ? "border-transparent bg-[var(--surface)]" : "border-[var(--line)]"
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
    </section>
  );
}
