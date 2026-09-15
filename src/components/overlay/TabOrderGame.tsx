"use client";

import { useMemo, useState } from "react";
import { WindowFrame } from "./WindowFrame";

/**
 * Nine targets, scattered. Tab through them.
 *
 * The first pass runs with the DOM order scrambled, so focus leaps around the
 * poster and the numbers come out wrong. Then you fix it, the DOM order matches
 * the reading order, and Tab walks 1 to 9. That contrast is the whole lesson:
 * focus order is DOM order, and where a thing sits on screen has nothing to do
 * with it.
 *
 * Mouse and touch work too. Clicking a target does what focusing it does, so
 * the poster is not a keyboard-only puzzle.
 */

/** Visual positions as percentages, in reading order. */
const TARGETS = [
  { x: 18, y: 16 },
  { x: 50, y: 12 },
  { x: 82, y: 20 },
  { x: 14, y: 46 },
  { x: 48, y: 50 },
  { x: 84, y: 44 },
  { x: 20, y: 78 },
  { x: 52, y: 84 },
  { x: 83, y: 74 },
];

/** The scrambled tab sequence: which target each Tab press lands on. */
const SCRAMBLED = [4, 8, 1, 6, 2, 9, 3, 7, 5];

export function TabOrderGame({ onClose }: { onClose: () => void }) {
  const [fixed, setFixed] = useState(false);
  const [visited, setVisited] = useState<number[]>([]);

  const order = useMemo(
    () => (fixed ? TARGETS.map((_, i) => i + 1) : SCRAMBLED),
    [fixed],
  );

  const inOrder = visited.every((n, i) => n === i + 1);
  const done = visited.length === 9;

  function visit(n: number) {
    setVisited((current) =>
      current.includes(n) ? current : [...current, n],
    );
  }

  function reset(next: boolean) {
    setFixed(next);
    setVisited([]);
  }

  return (
    <WindowFrame title="Tab order" onClose={onClose}>
      <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-2">
          <h2 className="font-display text-3xl">Tab order</h2>
          <p className="text-text/80 max-w-prose text-[15px] leading-relaxed">
            Focus follows the order things appear in the markup, not the order
            they appear on screen. Press Tab nine times and watch where it goes.
            Then fix it and do it again.
          </p>
        </header>

        <div
          className="border-border relative rounded-xl border p-4"
          style={{ background: "var(--color-surface-raised)" }}
        >
          <div className="relative aspect-[3/2] w-full">
            {order.map((n, tabPosition) => {
              const target = TARGETS[n - 1];
              const seen = visited.indexOf(n);
              return (
                <button
                  key={n}
                  type="button"
                  onFocus={() => visit(n)}
                  onClick={() => visit(n)}
                  className={[
                    "absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2",
                    "cursor-pointer items-center justify-center rounded-full",
                    "border font-mono text-sm transition-colors duration-200",
                    seen === -1
                      ? "border-border bg-surface text-text/70"
                      : seen === n - 1
                        ? "border-highlight bg-accent text-text"
                        : "border-highlight/50 bg-surface text-highlight",
                  ].join(" ")}
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                  aria-label={`Target ${n}, tab position ${tabPosition + 1}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p
            aria-live="polite"
            className="font-mono text-text-muted min-h-[1.5rem] text-sm"
          >
            {visited.length === 0
              ? fixed
                ? "Markup order matches reading order. Press Tab."
                : "Markup order is scrambled. Press Tab."
              : done
                ? inOrder
                  ? "Nine for nine, in order. That is what a sensible DOM gives you for free."
                  : `Reached all nine in this order: ${visited.join(", ")}. A screen reader user just read your page that way.`
                : `Visited ${visited.join(", ")}`}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset(!fixed)}
              className="bg-accent text-text hover:bg-highlight hover:text-bg cursor-pointer rounded-full px-5 py-2.5 text-sm transition-colors duration-200"
            >
              {fixed ? "Scramble it again" : "Fix the markup order"}
            </button>
            <button
              type="button"
              onClick={() => setVisited([])}
              className="border-border text-text/80 hover:text-text cursor-pointer rounded-full border px-5 py-2.5 text-sm transition-colors duration-200"
            >
              Start over
            </button>
          </div>

          <p className="text-text-muted max-w-prose text-sm leading-relaxed">
            This is WCAG 2.4.3. It is also the most common thing a visual
            redesign quietly breaks: move a card with CSS and the reading order
            stays where the markup left it.
          </p>
        </div>
      </div>
    </WindowFrame>
  );
}
