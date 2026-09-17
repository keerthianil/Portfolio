"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONTACT } from "@/data/projects";
import { LANE_SPAN, TIMELINE, type TimelineEntry } from "@/data/timeline";
import { ResumeLink } from "../ResumeLink";
import { WindowFrame } from "./WindowFrame";

/**
 * The timeline, opened from the desk calendar.
 *
 * On a wide screen it is a chart: years running down the left, and every role
 * drawn as a bar in a lane, so the overlaps are something you can see rather
 * than a sentence asserting them. Three things ran at once in late 2025 and
 * that is the shape of the last few years, not a footnote about it.
 *
 * The chart is a real navigation, not a picture. Every bar is a button
 * labelled with its role and dates, and pressing one moves focus to that
 * entry. It is the same accelerator the case studies get from their table of
 * contents, which is the only thing that justifies having it at all: a chart
 * that repeats the list without doing anything is content read twice.
 *
 * Below 1024px the chart goes. A time axis needs width and a phone does not
 * have any, so each entry keeps the torn-off calendar page it has always had,
 * which is also the object you clicked to get here.
 *
 * It opens from two places and closes back to whichever one you came from.
 * From the desk calendar it is a window over the room. From the timeline
 * folder on the laptop's desktop it is `nested`: a window over the laptop,
 * and closing it puts you back on the laptop rather than back in the room,
 * because a file you opened on a desktop closes onto that desktop.
 */

const MONTH_PX = 6;
const NOW = 202612;

function months(value: number) {
  const year = Math.floor(value / 100);
  const month = value % 100;
  return year * 12 + (month - 1);
}

const SPAN_FROM = months(LANE_SPAN.from);
const SPAN_TO = months(LANE_SPAN.to);
const CHART_HEIGHT = (SPAN_TO - SPAN_FROM + 1) * MONTH_PX;

/**
 * Lanes, assigned greedily within each kind. Study gets its own column on the
 * left so a degree never sits in the middle of the jobs, and work fills the
 * columns to the right of it, taking the leftmost lane it does not collide in.
 */
function assignLanes(entries: TimelineEntry[]) {
  const ends: Record<"study" | "work", number[]> = { study: [], work: [] };
  const lanes = new Map<string, { lane: number; kind: "study" | "work" }>();

  // Oldest first, so the leftmost lane is the longest-running thing.
  for (const entry of [...entries].sort((a, b) => a.start - b.start)) {
    const start = months(entry.start);
    const end = months(entry.end ?? NOW);
    const row = ends[entry.kind];
    let lane = row.findIndex((busyUntil) => busyUntil < start);
    if (lane === -1) lane = row.length;
    row[lane] = end;
    lanes.set(entry.id, { lane, kind: entry.kind });
  }

  const studyLanes = ends.study.length;
  const workLanes = ends.work.length;
  return { lanes, studyLanes, workLanes, total: studyLanes + workLanes };
}

export function Timeline({
  onClose,
  nested = false,
}: {
  onClose: () => void;
  /** Opened from inside another dialog, so it is portalled and sits over it. */
  nested?: boolean;
}) {
  const { lanes, studyLanes, total } = useMemo(
    () => assignLanes(TIMELINE),
    [],
  );
  const [active, setActive] = useState<string>(TIMELINE[0].id);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  /**
   * Which entry the reader is looking at, so the chart can mark it. Observed
   * against the viewport rather than against a named scroll root: the window
   * this lives in is the thing that scrolls, and scrolling it changes viewport
   * intersection all the same.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (visible?.target.id) setActive(visible.target.id.replace("entry-", ""));
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.01 },
    );
    const timer = window.setTimeout(() => {
      cardRefs.current.forEach((element) => observer.observe(element));
    }, 100);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const jump = useCallback((id: string) => {
    const element = cardRefs.current.get(id);
    if (!element) return;
    // Focus first, without scrolling, so the smooth scroll below is not
    // cancelled by the instant jump focus would otherwise cause.
    element.focus({ preventScroll: true });
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const years: number[] = [];
  for (
    let year = Math.floor(LANE_SPAN.from / 100);
    year <= Math.floor(LANE_SPAN.to / 100);
    year += 1
  ) {
    years.push(year);
  }

  const frame = (
    <WindowFrame title="Timeline" onClose={onClose}>
      <div className="mx-auto flex max-w-[980px] flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-2">
          <h2 className="font-display text-3xl sm:text-4xl">Timeline</h2>
          <p className="text-text/80 max-w-prose text-[15px] leading-relaxed">
            How I got from a club room in Bengaluru to a research lab in Boston.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[232px_1fr]">
          {/* The chart. Hidden below lg, where there is no width for an axis. */}
          <nav
            aria-label="Jump to a role"
            className="hidden self-start lg:sticky lg:top-2 lg:block"
          >
            <div className="relative" style={{ height: CHART_HEIGHT }}>
              {/* Year rail. */}
              <ul className="absolute inset-y-0 left-0 w-9">
                {years.map((year) => {
                  const top = (year * 12 - SPAN_FROM) * MONTH_PX;
                  if (top < 0 || top > CHART_HEIGHT) return null;
                  return (
                    <li
                      key={year}
                      className="absolute left-0"
                      style={{ top: top - 6 }}
                    >
                      <span className="text-text-muted font-mono text-[11px]">
                        {year}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {/* One hairline per year, so a bar can be read against a scale. */}
              <div aria-hidden="true" className="absolute inset-0 left-9">
                {years.map((year) => {
                  const top = (year * 12 - SPAN_FROM) * MONTH_PX;
                  if (top < 0 || top > CHART_HEIGHT) return null;
                  return (
                    <span
                      key={year}
                      className="bg-border absolute right-0 left-0 h-px"
                      style={{ top }}
                    />
                  );
                })}
              </div>

              {/* The bars. */}
              <ul className="absolute inset-y-0 right-0 left-11">
                {TIMELINE.map((entry) => {
                  const placement = lanes.get(entry.id);
                  if (!placement) return null;
                  const start = months(entry.start);
                  const end = months(entry.end ?? NOW);
                  const top = (start - SPAN_FROM) * MONTH_PX;
                  const height = Math.max(
                    MONTH_PX * 2,
                    (end - start + 1) * MONTH_PX,
                  );
                  const column =
                    placement.kind === "study"
                      ? placement.lane
                      : studyLanes + placement.lane;
                  const isActive = active === entry.id;
                  return (
                    <li
                      key={entry.id}
                      className="absolute"
                      style={{
                        top,
                        height,
                        left: `${(column / total) * 100}%`,
                        width: `${(1 / total) * 100}%`,
                        paddingRight: 6,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => jump(entry.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={[
                          "block h-full w-full cursor-pointer rounded-full transition-[outline-color,filter] duration-200",
                          entry.kind === "study"
                            ? "bg-[color:var(--color-text-muted)]"
                            : "bg-[color:var(--color-highlight)]",
                          isActive
                            ? "outline-highlight outline-2 outline-offset-2"
                            : "hover:brightness-125",
                        ].join(" ")}
                      >
                        <span className="sr-only">
                          {entry.role}, {entry.org}, {entry.from} to {entry.to}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="text-text-muted mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-wide uppercase">
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="block h-2.5 w-2.5 rounded-full bg-[color:var(--color-highlight)]"
                />
                work
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="block h-2.5 w-2.5 rounded-full bg-[color:var(--color-text-muted)]"
                />
                study
              </span>
            </p>
          </nav>

          <ol className="flex flex-col gap-5">
            {TIMELINE.map((entry) => {
              const [month, year] = entry.from.split(" ");
              const current = entry.to === "now";
              return (
                <li
                  key={entry.id}
                  className="flex gap-4 sm:gap-6"
                  ref={(node) => {
                    if (node) cardRefs.current.set(entry.id, node);
                    else cardRefs.current.delete(entry.id);
                  }}
                  id={`entry-${entry.id}`}
                  tabIndex={-1}
                >
                  {/* The page torn off the calendar for that month. The chart
                      carries the dates on a wide screen, so it stands down
                      there rather than saying the same thing twice. */}
                  <div className="relative shrink-0 pt-3 lg:hidden">
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

                  <div
                    className={[
                      "border-border bg-surface/60 flex flex-1 flex-col gap-2 rounded-xl border p-5",
                      current ? "border-highlight/40" : "",
                    ].join(" ")}
                  >
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
                      <span className="text-text-muted"> - {entry.place}</span>
                    </p>
                    <p className="text-text-muted hidden font-mono text-[11px] tracking-wide lg:block">
                      {entry.from} to {entry.to}
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
        </div>

        {CONTACT.resume && (
          <p className="border-border border-t pt-6 text-[15px]">
            <ResumeLink className="text-highlight hover:text-text transition-colors duration-200">
              Read the resume
            </ResumeLink>
            <span className="text-text-muted"> for the full version.</span>
          </p>
        )}
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
