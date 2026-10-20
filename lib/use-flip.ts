import { useCallback, useLayoutEffect, useRef } from "react";

type Pos = { x: number; y: number };

/**
 * Animates list items to their new position when the order (or the visible set) changes.
 * Pass a string that changes whenever the order changes, then attach `flip(key)` as each item's ref.
 * No dependencies: it uses the Web Animations API and skips the motion for reduced-motion users.
 */
export function useFlip(orderKey: string) {
  const els = useRef(new Map<string, HTMLElement>());
  const last = useRef(new Map<string, Pos>());
  const lastKey = useRef(orderKey);

  const flip = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) els.current.set(key, el);
      else els.current.delete(key);
    },
    []
  );

  // Runs after every render so positions stay current; only animates when the order changed.
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const orderChanged = lastKey.current !== orderKey;
    const next = new Map<string, Pos>();

    els.current.forEach((el, key) => {
      const r = el.getBoundingClientRect();
      const pos = { x: r.left + window.scrollX, y: r.top + window.scrollY };
      next.set(key, pos);

      const before = last.current.get(key);
      if (orderChanged && before && !reduce) {
        const dx = before.x - pos.x;
        const dy = before.y - pos.y;
        if (dx !== 0 || dy !== 0) {
          el.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
            { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
          );
        }
      }
    });

    last.current = next;
    lastKey.current = orderKey;
  });

  return flip;
}
