export type Category = "Web" | "Apps" | "AI" | "Other";

// color = solid accent, tint = soft background, on = text color that is readable on the accent
export const categories: Record<Category, { color: string; tint: string; on: string }> = {
  Web: { color: "#3291ff", tint: "#3291ff1f", on: "#000000" },
  Apps: { color: "#f81ce5", tint: "#f81ce51f", on: "#000000" },
  AI: { color: "#50e3c2", tint: "#50e3c21f", on: "#000000" },
  Other: { color: "#f5a623", tint: "#f5a6231f", on: "#000000" },
};

export type Project = {
  slug: string;
  title: string;
  pitch: string;
  category: Category;
  stack: string[];
  details: string;
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "moringa",
    title: "Moringa",
    pitch: "Replace this with one sentence on what Moringa does.",
    category: "Web",
    stack: ["React", "FastAPI", "PostgreSQL", "Firebase"],
    details:
      "Describe the problem Moringa solves, your role, and one result worth mentioning (users, speed, accuracy).",
    links: [
      // { label: "Live demo", href: "https://..." },
      // { label: "GitHub", href: "https://github.com/..." },
    ],
  },
  // Placeholders so the filters have something to show. Replace or delete.
  {
    slug: "placeholder-ai",
    title: "AI project",
    pitch: "Placeholder. Describe your AI project here.",
    category: "AI",
    stack: ["Python"],
    details: "Placeholder details.",
  },
  {
    slug: "placeholder-app",
    title: "App project",
    pitch: "Placeholder. Describe your app here.",
    category: "Apps",
    stack: ["React Native"],
    details: "Placeholder details.",
  },
];
