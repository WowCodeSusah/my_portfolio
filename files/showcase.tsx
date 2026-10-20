"use client";

import { useState, type ReactNode } from "react";
import ProjectGrid, { type Filter } from "@/components/project-grid";
import Skills from "@/components/skills";
import SectionNav from "@/components/section-nav";
import Experience from "@/components/experience";
import Education from "@/components/education";
import About from "@/components/about";
import SkillWall from "@/components/skill-wall";
import { projects } from "@/lib/projects";

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

  return (
    <>
      <SkillWall side="left" selected={skill} onPick={pickSkill} />
      <SkillWall side="right" selected={skill} onPick={pickSkill} />
    <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
      {/* Left rail: starts level with the title and follows the page on desktop.
          On mobile it sits after the content and does not stick. */}
      <aside className="order-2 lg:sticky lg:top-8 lg:order-1 lg:-mx-1 lg:max-h-[calc(100vh-4rem)] lg:self-start lg:overflow-y-auto lg:px-1">
        <Skills selected={skill} onSelect={pickSkill} />
      </aside>

      <div className="order-1 lg:order-2">
        {header}

        <SectionNav skill={skill} onClear={() => setSkill(null)} />

        <section id="projects" aria-label="Projects" className="mt-12 scroll-mt-28">
          <h2 className="text-3xl font-semibold tracking-tight">Projects</h2>
          <div className="mt-8">
            <ProjectGrid filter={filter} onFilterChange={setFilter} highlight={skill} />
          </div>
        </section>

        <Experience highlight={skill} />
        <Education />
        <About />
      </div>
    </div>
    </>
  );
}
