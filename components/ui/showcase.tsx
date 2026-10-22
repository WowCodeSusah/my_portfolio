"use client";

import { useState, type ReactNode } from "react";
import ProjectGrid, { type Filter } from "@/components/ui/project-grid";
import SkillsDrawer from "@/components/ui/skills-drawer";
import SectionNav from "@/components/ui/section-nav";
import Experience from "@/components/ui/experience";
import Education from "@/components/ui/education";
import About from "@/components/ui/about";
import SkillWall from "@/components/ui/skill-wall";
import Backdrop from "@/components/ui/backdrop";
import { skillTheme } from "@/lib/skills";
import { panelStyle } from "@/lib/panel";
import { categories, projects } from "@/lib/projects";

export default function Showcase({ header }: { header: ReactNode }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [skill, setSkill] = useState<string | null>(null);

  function pickSkill(s: string) {
    const next = skill === s ? null : s;
    setSkill(next);
    if (next) {
      // Make sure the linked projects are visible in the grid
      const matches = projects.filter((p) => p.stack.includes(next));
      const anyVisible = matches.some((p) => filter === "All" || p.category === filter);
      if (matches.length > 0 && !anyVisible) setFilter("All");
    }
  }

  // The background takes the colour of the picked skill, or of the chosen category
  const accent = skill ? skillTheme(skill).color : filter !== "All" ? categories[filter].color : null;
  const panel = panelStyle(filter);

  return (
    <>
      <Backdrop accent={accent} />
      <SkillWall side="left" selected={skill} onPick={pickSkill} />
      <SkillWall side="right" selected={skill} onPick={pickSkill} />
      <SkillsDrawer selected={skill} onSelect={pickSkill} />

      <div>
        {header}

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
    </>
  );
}
