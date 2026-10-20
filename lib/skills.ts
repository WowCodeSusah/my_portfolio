// Skill names must match the entries in each project's `stack` (and each job's `tech`)
// exactly for the highlight to link them. Edit this list to match what you actually know.
export type SkillGroup = {
  name: string;
  color: string;
  tint: string;
  on: string; // readable text color on `color`
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    name: "Frontend",
    color: "#3291ff",
    tint: "#3291ff1f",
    on: "#000000",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    name: "Backend",
    color: "#50e3c2",
    tint: "#50e3c21f",
    on: "#000000",
    skills: ["Python", "FastAPI"],
  },
  {
    name: "Data",
    color: "#f5a623",
    tint: "#f5a6231f",
    on: "#000000",
    skills: ["PostgreSQL", "Firebase"],
  },
];

const FALLBACK = { color: "#ededed", tint: "#ffffff14", on: "#000000" };

// Colors for a skill, taken from its group. Unknown skills get a neutral look.
export function skillTheme(name: string) {
  const g = skillGroups.find((group) => group.skills.includes(name));
  return g ? { color: g.color, tint: g.tint, on: g.on } : FALLBACK;
}
