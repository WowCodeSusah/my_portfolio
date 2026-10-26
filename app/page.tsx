import Showcase from "@/components/ui/showcase";
import { about } from "@/lib/about";

export default function Home() {
  return (
    <div>
      <Showcase
        header={
          <header className="max-w-2xl">
            <h1 className="text-5xl font-semibold tracking-tighter sm:text-7xl">{about.name}</h1>
            <p className="mt-5 text-xl text-[var(--muted)] sm:text-2xl">
              Self-driven, quick learner, passionate programmer with a curious mind who enjoys solving unique problems.
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
  );
}
