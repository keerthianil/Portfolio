"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Download, FileText, Mail, CalendarDays } from "lucide-react";
import {
  ABOUT_BLOCKS,
  BOOT_INTERVALS,
  BOOT_LINES,
  DESKTOP_ICONS,
  NAME_BANNER,
} from "@/data/about";
import { CONTACT } from "@/data/projects";
import { WindowFrame } from "./WindowFrame";

/**
 * About, as a terminal on a desktop.
 *
 * The boot sequence is a determinate bar per line rather than a character
 * typewriter, so the whole thing takes about 5.5s and never leaves a word half
 * printed. Under reduced motion it is already finished on arrival: a progress
 * animation you did not ask for is still an animation.
 *
 * The prose is in the DOM from the first frame either way. Only the boot lines
 * are staged, so a screen reader is never waiting on a timer to reach the
 * content.
 */
export function AboutOverlay({
  onClose,
  onOpenTimeline,
}: {
  onClose: () => void;
  onOpenTimeline: () => void;
}) {
  const shouldReduce = useReducedMotion();
  const [line, setLine] = useState(shouldReduce ? BOOT_LINES.length : 0);
  const [percent, setPercent] = useState(shouldReduce ? 100 : 0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const booted = line >= BOOT_LINES.length;

  useEffect(() => {
    if (shouldReduce || booted) return;
    const id = window.setInterval(
      () => setPercent((value) => Math.min(100, value + 2)),
      BOOT_INTERVALS[line] ?? 8,
    );
    return () => window.clearInterval(id);
  }, [line, booted, shouldReduce]);

  useEffect(() => {
    if (shouldReduce || booted || percent < 100) return;
    // Hold at 100 so the eye registers the line completing.
    const id = window.setTimeout(() => {
      setLine((value) => value + 1);
      setPercent(0);
    }, 420);
    return () => window.clearTimeout(id);
  }, [percent, booted, shouldReduce]);

  return (
    <WindowFrame title="Keerthi - About" onClose={onClose}>
      <div className="relative flex min-h-full">
        {/* Terminal */}
        <div
          ref={bodyRef}
          className="font-mono flex-1 px-5 py-7 text-[13px] leading-relaxed sm:px-9"
        >
          <div className="mx-auto flex max-w-[70ch] flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              {BOOT_LINES.map((text, index) => {
                const state =
                  index < line ? 100 : index === line ? percent : null;
                if (state === null) return null;
                return (
                  <p key={text} className="flex gap-2">
                    <span className="text-text/70">{text}</span>
                    <span
                      className={
                        state === 100 ? "text-highlight" : "text-text-muted"
                      }
                    >
                      [{state}%]
                    </span>
                  </p>
                );
              })}
              {booted && <p className="text-text">Ready.</p>}
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <Image
                src="/images/keerthi.png"
                alt="Keerthi Anil, waving"
                width={242}
                height={240}
                className="h-24 w-24 shrink-0 object-contain"
              />
              {/*
                Solid block art only stacks if the rows touch and every glyph
                comes from one font. JetBrains Mono has no U+2588, so the
                browser was substituting it from a fallback with different
                metrics and the letterforms broke up. Menlo has it, and the
                leading is pulled under 1 so the rows meet.
              */}
              <pre
                className="text-highlight text-[9px] sm:text-[12px]"
                style={{
                  fontFamily: 'Menlo, "DejaVu Sans Mono", monospace',
                  lineHeight: 0.82,
                  letterSpacing: 0,
                }}
                aria-hidden="true"
              >
                {NAME_BANNER}
              </pre>
              <h2 className="sr-only">Keerthi Anil</h2>
            </div>

            <div className="flex flex-col gap-5">
              {ABOUT_BLOCKS.map((block) =>
                block.kind === "art" ? (
                  <figure key={block.content} className="my-1">
                    <pre
                      className="text-text-muted overflow-x-auto text-[10px] leading-[1.2] sm:text-[11px]"
                      aria-hidden="true"
                    >
                      {block.content}
                    </pre>
                    <figcaption className="sr-only">{block.label}</figcaption>
                  </figure>
                ) : (
                  <p
                    key={block.content}
                    className="text-text/85 font-sans text-[15px] leading-relaxed"
                  >
                    {block.content}
                  </p>
                ),
              )}
              <p className="text-text">- Keerthi</p>
            </div>

            <div className="border-border flex flex-wrap gap-x-5 gap-y-2 border-t pt-5">
              <a
                href={CONTACT.resume}
                download
                className="text-highlight hover:text-text inline-flex items-center gap-2 transition-colors duration-200"
              >
                <Download size={14} aria-hidden="true" />
                View resume
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-highlight hover:text-text inline-flex items-center gap-2 transition-colors duration-200"
              >
                <Mail size={14} aria-hidden="true" />
                Email me
              </a>
              <button
                type="button"
                onClick={onOpenTimeline}
                className="text-highlight hover:text-text inline-flex cursor-pointer items-center gap-2 transition-colors duration-200"
              >
                <CalendarDays size={14} aria-hidden="true" />
                See the timeline
              </button>
            </div>
          </div>
        </div>

        {/* Desktop icons, in a real column on the right rather than scattered.
            Scattered icons need a drag to be useful, and a drag is a gesture
            with no keyboard equivalent. */}
        <aside className="border-border hidden w-[148px] shrink-0 flex-col items-center gap-6 border-l py-8 lg:flex">
          <h3 className="sr-only">Files</h3>
          {DESKTOP_ICONS.map((icon) => {
            const shared =
              "group flex w-[104px] cursor-pointer flex-col items-center gap-2 rounded-lg p-2 text-center transition-colors duration-200 hover:bg-surface-raised";
            const glyph = (
              <span
                className="border-border bg-surface-raised text-highlight flex h-14 w-14 items-center justify-center rounded-xl border"
                aria-hidden="true"
              >
                {icon.id === "resume" ? (
                  <FileText size={24} />
                ) : icon.id === "timeline" ? (
                  <CalendarDays size={24} />
                ) : (
                  <Mail size={24} />
                )}
              </span>
            );
            const label = (
              <span className="text-text/80 group-hover:text-text font-sans text-[11px] leading-tight">
                {icon.label}
              </span>
            );

            if (icon.id === "resume") {
              return (
                <a key={icon.id} href={CONTACT.resume} download className={shared}>
                  {glyph}
                  {label}
                </a>
              );
            }
            if (icon.id === "contact") {
              return (
                <a
                  key={icon.id}
                  href={`mailto:${CONTACT.email}`}
                  className={shared}
                >
                  {glyph}
                  {label}
                </a>
              );
            }
            return (
              <button
                key={icon.id}
                type="button"
                onClick={onOpenTimeline}
                className={shared}
              >
                {glyph}
                {label}
              </button>
            );
          })}
        </aside>
      </div>
    </WindowFrame>
  );
}
