"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { emitRipple } from "@/components/ui/skill-wall";

/**
 * A normal link that also sends a burst of white rings across the skill walls from the spot you
 * clicked, as the page content flies away.
 */
export default function PulseLink({
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "onClick"> & {
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        // Keyboard activation has no pointer position, so start from the middle of the link
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.detail > 0 ? e.clientX : r.left + r.width / 2;
        const y = e.detail > 0 ? e.clientY : r.top + r.height / 2;
        // The page is about to do a lot at once, so let the backdrop slow down for a moment
        window.dispatchEvent(new Event("portfolio:transition"));
        emitRipple(x, y);
        onClick?.(e);
      }}
    />
  );
}
