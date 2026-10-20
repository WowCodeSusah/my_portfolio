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
    degree: "Your degree and major",
    school: "University name",
    location: "City",
    start: "YYYY",
    end: "YYYY",
    grade: "GPA or honors (optional)",
    highlights: [
      "Final-year project: [title, and what you built or found].",
      "[A scholarship, award, society or activity worth mentioning.]",
    ],
    coursework: ["Databases", "Algorithms", "Machine learning", "Software engineering"],
  },
  {
    degree: "Course or certification name",
    school: "Provider name",
    start: "Month YYYY",
    end: "Month YYYY",
    highlights: ["[What you completed or built, in one line.]"],
  },
];
