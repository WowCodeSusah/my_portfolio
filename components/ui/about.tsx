import Image from "next/image";
import { about } from "@/lib/about";

const initials = about.name
  .split(" ")
  .filter(Boolean)
  .map((w) => w[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function About() {
  return (
    <section id="about" aria-label="About" className="mt-20 scroll-mt-28">
      <h2 className="text-3xl font-semibold tracking-tight">About</h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
        {about.photo ? (
          <Image
            src={about.photo}
            alt={`Photo of ${about.name}`}
            width={160}
            height={160}
            className="size-40 rounded-2xl object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-40 items-center justify-center rounded-2xl bg-[#3291ff1f] text-5xl font-semibold text-[#3291ff]"
          >
            {initials}
          </div>
        )}

        <div>
          <div className="max-w-prose space-y-4 text-lg leading-relaxed">
            {about.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          {about.resume && (
            <a
              href={about.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full bg-[var(--fg)] px-6 py-3 text-base font-medium text-black transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
            >
              View resume
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
