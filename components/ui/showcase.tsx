"use client";

import { ViewTransition, type ReactNode } from "react";
import ProjectGrid from "@/components/ui/project-grid";
import SectionNav from "@/components/ui/section-nav";
import Experience from "@/components/ui/experience";
import Education from "@/components/ui/education";
import About from "@/components/ui/about";
import { useSite } from "@/components/ui/site-shell";
import { panelStyle } from "@/lib/panel";

export default function Showcase({ header }: { header: ReactNode }) {
  const { filter, setFilter, skill, setSkill } = useSite();
  const panel = panelStyle(filter);

  return (
    <div>
      <ViewTransition exit="out-up" enter="in-u0">
        {header}
      </ViewTransition>

      <SectionNav skill={skill} onClear={() => setSkill(null)} />

      <section id="projects" aria-label="Projects" className="mt-12 scroll-mt-28">
        <h2 className="text-3xl font-semibold tracking-tight">Projects</h2>
        <div className="mt-8">
          <ProjectGrid filter={filter} onFilterChange={setFilter} highlight={skill} />
        </div>
      </section>

      <Experience highlight={skill} panel={panel} />
      <Education panel={panel} />
      <About panel={panel} />
    </div>
  );
}
