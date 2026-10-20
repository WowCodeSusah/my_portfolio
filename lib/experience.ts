export type Job = {
  role: string;
  company: string;
  type?: string; // e.g. "Full-time", "Internship", "Contract"
  start: string;
  end: string; // "Present" if you're still there
  highlights: string[];
  tech: string[]; // use the same spelling as lib/skills.ts so colors and highlights work
};

// Placeholder content, newest first. Replace every field, and delete entries you don't need.
export const experience: Job[] = [
  {
    role: "Your job title",
    company: "Company name",
    type: "Full-time",
    start: "Month YYYY",
    end: "Present",
    highlights: [
      "Built [a feature or tool] that [what it improved, with a number if you have one].",
      "Fixed or improved [something specific], which [the result].",
      "Worked with [a team, a process, or a tool] to ship [something real].",
    ],
    tech: ["React", "Python", "PostgreSQL"],
  },
  {
    role: "Second job title",
    company: "Second company name",
    type: "Internship",
    start: "Month YYYY",
    end: "Month YYYY",
    highlights: [
      "Developed [a page, component or feature] used by [who or how many].",
      "Improved [performance, accessibility or code quality] by [what you did].",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    role: "Third job title",
    company: "Third company name",
    type: "Freelance",
    start: "Month YYYY",
    end: "Month YYYY",
    highlights: [
      "Designed and built [an API or backend service] for [a client or purpose].",
      "Set up [a database or authentication] so that [what it made possible].",
    ],
    tech: ["FastAPI", "Firebase"],
  },
];

// Stable id used for jump links and animation keys.
export const jobId = (job: Job) =>
  `job-${`${job.company}-${job.start}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
