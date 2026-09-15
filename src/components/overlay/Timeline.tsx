"use client";

import { CONTACT } from "@/data/projects";
import { TIMELINE } from "@/data/timeline";
import { WindowFrame } from "./WindowFrame";

/**
 * The timeline, opened from the desk calendar.
 *
 * An ordered list with a rule down the side rather than a horizontal scroller.
 * A horizontal timeline is the classic version of this and it is hostile on a
 * phone: it hides half the content behind a gesture with no affordance, and it
 * puts the reading direction at right angles to the scroll direction.
 */
export function Timeline({ onClose }: { onClose: () => void }) {
  return (
    <WindowFrame title="Timeline" onClose={onClose}>
      <div className="mx-auto flex max-w-[820px] flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-2">
          <h2 className="font-display text-3xl sm:text-4xl">Timeline</h2>
          <p className="text-text/80 max-w-prose text-[15px] leading-relaxed">
            Boston, and Bengaluru before that. The overlaps are real: the
            research assistantship ran alongside both the teaching work and the
            role at Clean Harbors.
          </p>
        </header>

        <ol className="flex flex-col">
          {TIMELINE.map((entry, index) => (
            <li
              key={`${entry.org}-${entry.start}`}
              className="border-border relative flex flex-col gap-2 border-l pb-9 pl-6 last:border-l-transparent last:pb-0 sm:pl-8"
            >
              <span
                className={[
                  "absolute top-1.5 left-0 h-3 w-3 -translate-x-1/2 rounded-full border-2",
                  entry.kind === "work"
                    ? "bg-accent border-accent"
                    : "bg-surface border-highlight",
                ].join(" ")}
                aria-hidden="true"
              />
              <p className="text-highlight font-mono text-xs tracking-wide">
                {entry.from} to {entry.to}
                {entry.kind === "study" ? " · study" : ""}
              </p>
              <h3 className="font-display text-xl leading-tight">
                {entry.role}
              </h3>
              <p className="text-text/85 text-[15px]">
                {entry.org}
                <span className="text-text-muted"> · {entry.place}</span>
              </p>
              {entry.lines.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1.5">
                  {entry.lines.map((line) => (
                    <li
                      key={line}
                      className="text-text/80 text-[14px] leading-relaxed"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              )}
              {index === 0 && <span className="sr-only">Current role.</span>}
            </li>
          ))}
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
}
