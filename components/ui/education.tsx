import { education } from "@/lib/education";

export default function Education() {
  return (
    <section id="education" aria-label="Education" className="mt-20 scroll-mt-28">
      <h2 className="text-3xl font-semibold tracking-tight">Education</h2>

      <ol className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {education.map((s) => (
          <li
            key={`${s.school}-${s.start}`}
            className="grid gap-3 py-8 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8"
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
    </section>
  );
}
