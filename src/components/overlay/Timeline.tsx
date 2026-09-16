"use client";

import { createPortal } from "react-dom";
import { CONTACT } from "@/data/projects";
import { TIMELINE } from "@/data/timeline";
import { WindowFrame } from "./WindowFrame";

/**
 * The timeline, opened from the desk calendar, and built as one.
 *
 * Every entry is a torn-off page from a wall calendar: a maroon month band, the
 * year in the block below it, and the entry written on the page. Stacked down
 * the left with a spiral binding running through them, so the whole thing reads
 * as the object you clicked rather than as a list that happens to have dates.
 *
 * It is still an ordered list underneath, and it still scrolls vertically. A
 * horizontal timeline is the classic version of this and it is hostile on a
 * phone: it hides half the content behind a gesture with no affordance and
 * puts the reading direction at right angles to the scroll direction.
 *
 * It opens from two places and closes back to whichever one you came from.
 * From the desk calendar it is a window over the room. From the timeline
 * folder on the laptop's desktop it is `nested`: a window over the laptop,
 * and closing it puts you back on the laptop rather than back in the room,
 * because a file you opened on a desktop closes onto that desktop.
 */
export function Timeline({
  onClose,
  nested = false,
}: {
  onClose: () => void;
  /** Opened from inside another dialog, so it is portalled and sits over it. */
  nested?: boolean;
}) {
  const frame = (
    <WindowFrame title="Timeline" onClose={onClose}>
      <div className="mx-auto flex max-w-[860px] flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-2">
          <h2 className="font-display text-3xl sm:text-4xl">Timeline</h2>
          <p className="text-text/80 max-w-prose text-[15px] leading-relaxed">
            Boston, and Bengaluru before that. The overlaps are real: the
            research assistantship ran alongside both the teaching work and the
            role at Clean Harbors.
          </p>
        </header>

        <ol className="flex flex-col gap-5">
          {TIMELINE.map((entry) => {
            const [month, year] = entry.from.split(" ");
            const current = entry.to === "now";
            return (
              <li
                key={`${entry.org}-${entry.start}`}
                className="flex gap-4 sm:gap-6"
              >
                {/* The page torn off the calendar for that month. */}
                <div className="relative shrink-0 pt-3">
                  {/* Two rings through the top of it. */}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-4 h-6 w-2.5 rounded-full border-2 border-[color:var(--color-text-muted)]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-0 right-4 h-6 w-2.5 rounded-full border-2 border-[color:var(--color-text-muted)]"
                  />
                  <div
                    className={[
                      "border-border w-[78px] overflow-hidden rounded-lg border text-center shadow-lg sm:w-[92px]",
                      current ? "ring-highlight/60 ring-2" : "",
                    ].join(" ")}
                  >
                    <p className="bg-accent text-text py-1 font-mono text-[11px] tracking-[0.2em] uppercase">
                      {month}
                    </p>
                    <p className="bg-surface-raised text-text font-display py-2 text-2xl leading-none sm:text-3xl">
                      {year}
                    </p>
                    <p className="bg-surface-raised text-text-muted pb-2 font-mono text-[10px]">
                      to {entry.to}
                    </p>
                  </div>
                </div>

                {/* The entry, written on the page beside it. */}
                <div className="border-border bg-surface/60 flex flex-1 flex-col gap-2 rounded-xl border p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-xl leading-tight">
                      {entry.role}
                    </h3>
                    <span className="text-text-muted font-mono text-[11px] tracking-wide uppercase">
                      {entry.kind === "study" ? "study" : "work"}
                    </span>
                  </div>
                  <p className="text-text/85 text-[15px]">
                    {entry.org}
                    <span className="text-text-muted"> · {entry.place}</span>
                  </p>
                  {entry.lines.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-1.5">
                      {entry.lines.map((line) => (
                        <li
                          key={line}
                          className="text-text/80 border-highlight/30 border-l pl-3 text-[14px] leading-relaxed"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <p className="border-border border-t pt-6 text-[15px]">
          <a
            href={CONTACT.resume}
            download
            className="text-highlight hover:text-text transition-colors duration-200"
          >
            Download the resume
          </a>
          <span className="text-text-muted"> for the full version.</span>
        </p>
      </div>
    </WindowFrame>
  );

  if (!nested) return frame;

  /**
   * Portalled to the body, for the same reason the case studies are: the
   * window it opens over animates on `y`, and a transformed ancestor becomes
   * the containing block for `position: fixed`, so rendered in place this
   * would be sized to that window instead of to the viewport.
   */
  return createPortal(
    <div className="fixed inset-0 z-[800]">{frame}</div>,
    document.body,
  );
}
