"use client";

import { useState } from "react";
import { skillTheme } from "@/lib/skills";
import type { CaseStudy, StackNode } from "@/lib/case-studies";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={`mx-auto size-5 text-[var(--faint)] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v12M3 9l5 5 5-5" />
    </svg>
  );
}

/** How the pieces connect. Hover, focus or tap a part to see what it does. */
export default function ArchitectureDiagram({
  nodes,
  focusName,
}: {
  nodes: CaseStudy["architecture"];
  focusName?: string; // when set, the diagram follows it (used by the scrolling story) instead of the pointer
}) {
  const [hovered, setHovered] = useState<StackNode | null>(null);
  const all = [nodes.front, nodes.api, nodes.data, nodes.auth];
  const active = focusName !== undefined ? (all.find((n) => n.name === focusName) ?? null) : hovered;
  const setActive = (n: StackNode) => {
    if (focusName === undefined) setHovered(n);
  };

  const node = (n: StackNode, className = "") => {
    const t = skillTheme(n.name);
    const on = active?.name === n.name;
    return (
      <button
        type="button"
        onPointerEnter={(e) => e.pointerType === "mouse" && setActive(n)}
        onFocus={() => setActive(n)}
        onClick={() => setActive(n)}
        aria-pressed={on}
        className={`rounded-2xl border bg-black p-5 text-left transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${className}`}
        style={{
          borderColor: on ? t.color : "var(--line)",
          boxShadow: on ? `0 0 0 1px ${t.color}, 0 0 28px ${t.color}33` : "0 0 0 0 transparent, 0 0 0 0 transparent",
        }}
      >
        <span className="block text-2xl font-semibold tracking-tight" style={{ color: t.color }}>
          {n.name}
        </span>
        <span className="mt-1 block text-sm text-[var(--faint)]">{n.role}</span>
      </button>
    );
  };

  const accent = active ? skillTheme(active.name).color : undefined;

  return (
    <div>
      {/* Arrows only appear on wider screens, where the parts sit side by side */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center md:gap-4">
        {node(nodes.front)}
        <Arrow className="hidden -rotate-90 md:block" />
        {node(nodes.api)}
        <Arrow className="hidden -rotate-90 md:block" />
        {node(nodes.data)}
        <Arrow className="hidden md:col-start-1 md:block" />
        {node(nodes.auth, "md:col-start-1")}
      </div>

      <p
        aria-live="polite"
        className="mt-6 min-h-12 max-w-prose text-lg text-[var(--muted)]"
      >
        {active ? (
          <>
            <span className="font-semibold" style={{ color: accent }}>
              {active.name}
            </span>{" "}
            {active.note}
          </>
        ) : (
          "Hover or tap a part to see what it does."
        )}
      </p>
    </div>
  );
}
