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
  caseStudy?: string; // path to a case study page
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "moringa",
    title: "Moringa",
    pitch: "A production line website for web and mobile, built by a team I led and still in progress.",
    category: "Web",
    stack: ["React", "FastAPI", "PostgreSQL", "Firebase"],
    details:
      "I led the group that built it. Firebase handles user login and PostgreSQL stores the data. Functionality is still incomplete, so I use it to show my progress as a developer.",
    links: [
      // { label: "Live demo", href: "https://..." },
      // { label: "GitHub", href: "https://github.com/..." },
    ],
    caseStudy: "/projects/moringa",
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
