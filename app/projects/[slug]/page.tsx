import type { Metadata } from "next";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import PulseLink from "@/components/ui/pulse-link";
import Story from "@/components/ui/story";
import HeroScroll from "@/components/ui/hero-scroll";
import { categories, projects } from "@/lib/projects";
import { caseStudies } from "@/lib/case-studies";
import { skillTheme } from "@/lib/skills";
import { PANEL_CLASS, panelStyle } from "@/lib/panel";

export function generateStaticParams() {
  return Object.keys(caseStudies).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project ? `${project.title} case study | Your Name` : "Case study" };
}

const back =
  "inline-flex text-[var(--muted)] underline decoration-[var(--line)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--fg)] motion-reduce:transition-none";

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  const study = caseStudies[slug];
  if (!project || !study) notFound();

  const cat = categories[project.category];
  const panel = panelStyle(project.category);

  return (
    <div>
      <PulseLink href="/" className={back}>
        &larr; Back to portfolio
      </PulseLink>

      {/* The opening: the first scroll shrinks the title away and brings the facts up */}
      <HeroScroll
        header={
      <ViewTransition enter="in-l0" exit="out-left">
        <header className="mt-8 max-w-3xl">
          <p className="flex items-center gap-2 text-sm font-medium">
            <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            {project.category}
          </p>
          <ViewTransition name={`project-title-${project.slug}`}>
            <h1 className="mt-4 text-5xl font-semibold tracking-tighter sm:text-7xl">{project.title}</h1>
          </ViewTransition>
          <p className="mt-5 text-xl text-[var(--muted)] sm:text-2xl">{project.pitch}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => {
              const t = skillTheme(s);
              return (
                <li
                  key={s}
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{ backgroundColor: t.tint, color: t.color }}
                >
                  {s}
                </li>
              );
            })}
          </ul>

          {study.liveUrl && (
            <a
              href={study.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full bg-[var(--fg)] px-6 py-3 text-base font-medium text-black transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
            >
              Visit live site
            </a>
          )}
        </header>
      </ViewTransition>
        }
        facts={
      <ViewTransition enter="in-r1" exit="out-right">
        <section aria-label="At a glance" className={`mt-14 ${PANEL_CLASS}`} style={panel}>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {study.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-sm text-[var(--faint)]">{f.label}</dt>
                <dd className="mt-1 text-lg font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </ViewTransition>
        }
      />

      {/* The rest of the case study scrolls as a pinned, scroll-driven story */}
      <Story study={study} panel={panel} accent={cat.color} />

      <footer className="mt-20 flex flex-wrap gap-x-8 gap-y-2 border-t border-[var(--line)] pt-8 text-lg">
        <PulseLink href="/" className={back}>
          &larr; Back to portfolio
        </PulseLink>
      </footer>
    </div>
  );
}
