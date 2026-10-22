import type { CSSProperties } from "react";
import { education } from "@/lib/education";
import { PANEL_CLASS } from "@/lib/panel";

export default function Education({ panel }: { panel: CSSProperties }) {
  return (
    <section id="education" aria-label="Education" className="mt-20 scroll-mt-28">
      <h2 className="text-3xl font-semibold tracking-tight">Education</h2>

      <div className={`mt-8 ${PANEL_CLASS}`} style={panel}>
      <ol className="space-y-4">
        {education.map((s) => (
          <li
            key={`${s.school}-${s.start}`}
            className="grid gap-3 rounded-2xl border border-[var(--line)] bg-black p-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 sm:p-6"
          >
            <p className="text-[var(--faint)]">
              {s.start} to {s.end}
            </p>

            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{s.degree}</h3>
              <p className="mt-1 text-lg text-[var(--muted)]">
                {s.school}
                {s.location ? `, ${s.location}` : ""}
              </p>
              {s.grade && <p className="mt-1 text-[var(--faint)]">{s.grade}</p>}

              {s.highlights.length > 0 && (
                <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5 marker:text-[var(--faint)]">
                  {s.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}

              {s.coursework && s.coursework.length > 0 && (
                <p className="mt-4 max-w-prose text-[var(--muted)]">
                  Coursework: {s.coursework.join(", ")}.
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
}
