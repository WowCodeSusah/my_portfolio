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
    role: "Technology Mentor",
    company: "Digimaker",
    type: "Part-time",
    start: "Jan 2026",
    end: "Jul 2026",
    highlights: [
      "Taught kids of ages 6 to 10, regarding many different languanges including but not limited to Python, C++, and Javascript.",
      "Teaching in 3 different schools with a multitude of different cultures, adapting well to each culture.",
    ],
    tech: ["C++", "Python", "Javascript"],
  },
  {
    role: "Web Developer Intern",
    company: "PT Rohto Laboratories Indonesia",
    type: "Internship",
    start: "Feb 2025",
    end: "Jul 2025",
    highlights: [
      "Developed a fully functional frontend website with PHP, Javascript, and CSS.",
      "Designed the frontend UI/UX elements based on features that was requested by the client.",
    ],
    tech: ["PHP", "Javascript", "CSS"],
  },
  {
    role: "Student Mentor",
    company: "Bina Nusantara Indonesia",
    type: "Full-time",
    start: "Feb 2024",
    end: "Jun 2024",
    highlights: [
      "Designed and built [an API or backend service] for [a client or purpose].",
      "Set up [a database or authentication] so that [what it made possible].",
    ],
    tech: ["Java", "Mathematics"],
  },
  {
    role: "Teacher Assistant",
    company: "Bina Nusantara Indonesia",
    type: "Full-time",
    start: "Sep 2023",
    end: "Oct 2023",
    highlights: [
      "Designed and built [an API or backend service] for [a client or purpose].",
      "Set up [a database or authentication] so that [what it made possible].",
    ],
    tech: ["OOP", "Basic IT", "Python"],
  },
];

// Stable id used for jump links and animation keys.
export const jobId = (job: Job) =>
  `job-${`${job.company}-${job.start}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
