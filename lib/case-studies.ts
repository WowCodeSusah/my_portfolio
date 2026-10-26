// One entry per project that has a case study page. The key must match the project's slug.
// Anything in [square brackets] is a placeholder for you to replace.

export type StackNode = { name: string; role: string; note: string };

export type CaseStudy = {
  liveUrl?: string;
  facts: { label: string; value: string }[];
  overview: string[];
  architecture: { front: StackNode; api: StackNode; data: StackNode; auth: StackNode };
  decisions: { title: string; body: string }[];
  built: string[];
  next: string[];
  lessons: string[];
};

export const caseStudies: Record<string, CaseStudy> = {
  moringa: {
    // Replace with the real address of the live site
    liveUrl: "https://your-live-link.example",
    facts: [
      { label: "My role", value: "Team lead" },
      { label: "Team", value: "[Number] people" },
      { label: "Timeline", value: "[Month YYYY] to [Month YYYY]" },
      { label: "Status", value: "In progress" },
    ],
    overview: [
      "Moringa is a production line website designed for both web and mobile. I led the group that built it. [Describe what leading meant in practice: how you split the work, ran reviews, made decisions.]",
      "It isn't finished. Core functionality is still incomplete, and I've kept it in my portfolio on purpose: it shows my progress as a developer, including the parts that are still unfinished.",
    ],
    architecture: {
      front: {
        name: "React",
        role: "Front end",
        note: "The interface people use, built with both web and mobile screens in mind.",
      },
      api: {
        name: "FastAPI",
        role: "Back end",
        note: "The API layer the interface talks to. [Add what it handles, for example the production line data and rules.]",
      },
      data: {
        name: "PostgreSQL",
        role: "Database",
        note: "Stores the data for everything in the application.",
      },
      auth: {
        name: "Firebase",
        role: "Login",
        note: "Handles user login.",
      },
    },
    decisions: [
      {
        title: "Firebase for login",
        body: "User login is handled by Firebase. [Why Firebase? For example: faster than building authentication ourselves.]",
      },
      {
        title: "PostgreSQL for storage",
        body: "All of the application's data lives in PostgreSQL. [Why a relational database for a production line?]",
      },
      {
        title: "FastAPI for the back end",
        body: "[Why FastAPI? For example: speed of development, or how well it fits Python.]",
      },
    ],
    built: [
      "User login through Firebase",
      "Data storage in PostgreSQL",
      "[Add the main features that work today]",
    ],
    next: ["[List the functionality that is still unfinished]", "[Anything planned for mobile]"],
    lessons: [
      "[What leading the group taught you.]",
      "[What you would do differently next time.]",
    ],
  },
};
