export type Study = {
  degree: string;
  school: string;
  location?: string;
  start: string;
  end: string;
  grade?: string; // GPA, honors or class rank, only if you want to show it
  highlights: string[];
  coursework?: string[];
};

// Placeholder content, newest first. Replace every field, and delete entries you don't need.
export const education: Study[] = [
  {
    degree: "Computer Science",
    school: "Binus International",
    location: "Jakarta",
    start: "2022",
    end: "2026",
    grade: "3.80",
    highlights: [
      "Final-year project: [title, and what you built or found].",
      "[A scholarship, award, society or activity worth mentioning.]",
    ],
    coursework: ["Data Science", "Artificial Intelligence", "Android Development", "Fullstack Development"],
  },
  {
    degree: "Information Technology",
    school: "RMIT University",
    start: "2025",
    end: "2026",
    grade: "3.60",
    highlights: ["[What you completed or built, in one line.]"],
    coursework: ["IOS Development", "Game Design and Development", "Software Engineering", "DevOps Workflow"],
  },
];
