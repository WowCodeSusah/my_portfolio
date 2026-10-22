import type { CSSProperties } from "react";
import Showcase from "@/components/ui/showcase";
import { about } from "@/lib/about";

// Theme tokens used across the components as var(--name)
const theme = {
  "--fg": "#ededed",
  "--muted": "#a1a1a1",
  "--faint": "#8a8a8a",
  "--line": "#2e2e2e",
  "--surface": "#0a0a0a",
} as CSSProperties;

export default function Home() {
  return (
    <main
      className="min-h-screen bg-black font-[family-name:var(--font-geist)] text-[var(--fg)]"
      style={theme}
    >
      <div className="isolate mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Showcase
          header={
            <header className="max-w-2xl">
              <h1 className="text-5xl font-semibold tracking-tighter sm:text-7xl">{about.name}</h1>
              <p className="mt-5 text-xl text-[var(--muted)] sm:text-2xl">
                I build web apps, mobile apps and AI tools. Pick a category to see what I&apos;ve made.
              </p>
            </header>
          }
        />

        <footer className="mt-20 flex flex-wrap gap-x-8 gap-y-2 border-t border-[var(--line)] pt-8 text-lg">
          {about.links.map((l) => (
            <a
              key={l.href}
              className="text-[var(--muted)] underline decoration-[var(--line)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--fg)] motion-reduce:transition-none"
              href={l.href}
            >
              {l.label}
            </a>
          ))}
        </footer>
      </div>
    </main>
  );
}
