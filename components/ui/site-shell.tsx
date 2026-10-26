"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Backdrop from "@/components/ui/backdrop";
import SkillWall from "@/components/ui/skill-wall";
import SkillsDrawer from "@/components/ui/skills-drawer";
import type { Filter } from "@/components/ui/project-grid";
import { categories, projects } from "@/lib/projects";
import { skillTheme } from "@/lib/skills";

type Site = {
  filter: Filter;
  setFilter: (f: Filter) => void;
  skill: string | null;
  setSkill: (s: string | null) => void;
  pickSkill: (s: string) => void;
};

const SiteContext = createContext<Site | null>(null);

export function useSite() {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite must be used inside <SiteShell>");
  return site;
}

/**
 * Everything that stays put while you move between pages: the animated backdrop, the skill walls
 * and the skills drawer. The picked skill and category also live here, so they carry over.
 * Only the page content passed in as children changes (and animates) on navigation.
 */
export default function SiteShell({ children }: { children: ReactNode }) {
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

  return (
    <SiteContext.Provider value={{ filter, setFilter, skill, setSkill, pickSkill }}>
      <Backdrop accent={accent} />
      <SkillWall side="left" selected={skill} onPick={pickSkill} />
      <SkillWall side="right" selected={skill} onPick={pickSkill} />
      <SkillsDrawer selected={skill} onSelect={pickSkill} />
      {children}
    </SiteContext.Provider>
  );
}
