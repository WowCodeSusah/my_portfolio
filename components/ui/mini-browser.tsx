"use client";

import { useEffect, useRef, useState } from "react";

const W = 1280; // the width the site is rendered at inside the window, then scaled down
const H = 800;

/**
 * A small browser window showing the live site. The site renders at desktop size and is scaled
 * to fit. It ignores the mouse until you click it, so scrolling the page never gets stuck inside it.
 * Some sites refuse to be shown inside another page; if yours does, the window stays blank and
 * the "Open the live site" link next to it still works.
 */
export default function MiniBrowser({ url, load }: { url?: string; load: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const placeholder = !url || /your-live-link|example\./i.test(url);
  const host = url ? url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "your-site.com";

  return (
    <div
      className="group mx-auto w-full overflow-hidden rounded-xl border border-[var(--line)] bg-black"
      // Keep the window short enough to fit the screen next to the heading
      style={{ maxWidth: "min(100%, calc((100vh - 19rem) * 1.6))" }}
      onMouseLeave={() => setLive(false)}
    >
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-sm text-[var(--muted)]">
          {host}
        </span>
      </div>

      <div ref={box} className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ height: H * scale }}>
        {placeholder ? (
          <p className="flex h-full items-center justify-center px-6 text-center text-[var(--faint)]">
            Add your live link in lib/case-studies.ts to show the site here.
          </p>
        ) : (
          load && (
            <>
              <iframe
                src={url}
                title="Live preview of the site"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                tabIndex={live ? 0 : -1}
                className="absolute left-0 top-0 origin-top-left border-0 bg-white"
                style={{
                  width: W,
                  height: H,
                  transform: `scale(${scale})`,
                  pointerEvents: live ? "auto" : "none",
                }}
              />
              {!live && (
                <button
                  type="button"
                  onClick={() => setLive(true)}
                  className="absolute inset-0 flex items-end justify-center pb-4 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
                >
                  <span className="rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-[var(--fg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
                    Click to interact
                  </span>
                </button>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
