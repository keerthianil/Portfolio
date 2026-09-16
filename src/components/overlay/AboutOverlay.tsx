"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarDays, Download, Mail } from "lucide-react";
import {
  ABOUT_BLOCKS,
  BOOT_INTERVALS,
  BOOT_LINES,
  DESKTOP_ICONS,
  NAME_BANNER,
} from "@/data/about";
import { CONTACT } from "@/data/projects";
import { useSubRoute } from "@/lib/useSubRoute";
import { ResumeLink } from "../ResumeLink";
import { Timeline } from "./Timeline";
import { WindowFrame } from "./WindowFrame";

/**
 * About, as a terminal on the laptop's own screen.
 *
 * The boot sequence is a determinate bar per line rather than a character
 * typewriter, so the whole thing takes about 5.5s and never leaves a word half
 * printed. The prose arrives when the boot finishes, the way a terminal hands
 * you a prompt rather than printing over itself.
 *
 * Nobody is made to wait for it. Under reduced motion it is already finished
 * on arrival, and any key ends it, so the five seconds are only ever spent by
 * someone who is watching them.
 */
export function AboutOverlay({ onClose }: { onClose: () => void }) {
  const shouldReduce = useReducedMotion();

  /**
   * The timeline folder on the desktop.
   *
   * It used to navigate to `#timeline`, which threw the laptop away, swung the
   * camera across the desk to the calendar, and then put you back in the room
   * when you closed it. You opened a folder and the machine it was on
   * vanished. It is a sub-route of About now: the window opens over the
   * laptop's own screen, and closing it puts the desktop back, which is what
   * closing a file on a desktop does.
   *
   * The desk calendar still opens the same timeline over the room, because
   * that one is a different object in a different place.
   */
  const { openId, open, close: closeTimeline } = useSubRoute("about");
  const timelineOpen = openId === "timeline";
  const openTimeline = useCallback(() => open("timeline"), [open]);

  /**
   * The desktop is on screen for a beat before the terminal opens, the way a
   * machine you just woke up is. Under reduced motion the window is already
   * there: a delay you did not ask for is still motion.
   */
  const [windowOpen, setWindowOpen] = useState(!!shouldReduce);
  useEffect(() => {
    if (windowOpen) return;
    const id = window.setTimeout(() => setWindowOpen(true), 700);
    return () => window.clearTimeout(id);
  }, [windowOpen]);

  /**
   * The tax folder. It opens a toast rather than a window, because the joke is
   * that there is nothing in it and a whole modal would oversell that.
   */
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const [line, setLine] = useState(shouldReduce ? BOOT_LINES.length : 0);
  const [percent, setPercent] = useState(shouldReduce ? 100 : 0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const booted = line >= BOOT_LINES.length;

  /**
   * The terminal boots before it shows anything, because that is what a
   * terminal does and it is the reason the laptop is the About object.
   *
   * The boot runs about five and a half seconds, which is five and a half
   * seconds of nothing if you cannot see the bars filling. So any key, and a
   * click anywhere in the window, finishes it immediately, and reduced motion
   * arrives with it already finished.
   */
  const skip = useCallback(() => {
    setLine(BOOT_LINES.length);
    setPercent(100);
  }, []);

  useEffect(() => {
    if (booted || !windowOpen) return;
    const onKey = () => skip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, windowOpen, skip]);

  useEffect(() => {
    if (shouldReduce || booted || !windowOpen) return;
    const id = window.setInterval(
      () => setPercent((value) => Math.min(100, value + 2)),
      BOOT_INTERVALS[line] ?? 8,
    );
    return () => window.clearInterval(id);
  }, [line, booted, windowOpen, shouldReduce]);

  useEffect(() => {
    if (shouldReduce || booted || !windowOpen || percent < 100) return;
    // Hold at 100 so the eye registers the line completing.
    const id = window.setTimeout(() => {
      setLine((value) => value + 1);
      setPercent(0);
    }, 420);
    return () => window.clearTimeout(id);
  }, [percent, booted, windowOpen, shouldReduce]);

  /**
   * The laptop's own wallpaper, and the same file the lid in the room shows,
   * so opening the laptop lands you on the screen you were just looking at.
   */
  const wallpaper = (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url(/images/scene/wallpaper.jpg)" }}
    />
  );

  /**
   * The files on that desktop, drawn the way the system draws them: a folder
   * shape for a folder, a page with a corner turned for a document, the label
   * under the icon rather than beside it.
   *
   * They live inside the dialog rather than beside it, because `aria-modal`
   * hides everything outside a dialog from a screen reader and two of these
   * three are real routes.
   */
  const files = (
    <>
    <aside className="pointer-events-none absolute inset-y-0 right-0 hidden w-[164px] flex-col items-center gap-3 pt-14 lg:flex">
      <h3 className="sr-only">Files on the desktop</h3>
      {DESKTOP_ICONS.map((icon) => {
        const shared =
          "group pointer-events-auto flex w-[128px] cursor-pointer flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-center transition-colors duration-200 hover:bg-text/12";

        const folder = (
          <svg viewBox="0 0 64 52" className="h-14 w-16" aria-hidden="true">
            <path
              d="M2 8a4 4 0 0 1 4-4h17l6 6h29a4 4 0 0 1 4 4v34a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z"
              fill="#4ea3e0"
            />
            <path
              d="M2 16h60v30a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z"
              fill="#7cc4f2"
            />
          </svg>
        );
        const document_ = (
          <svg viewBox="0 0 52 60" className="h-14 w-12" aria-hidden="true">
            <path d="M4 4h30l14 14v38H4Z" fill="#f3f0ea" />
            <path d="M34 4l14 14H34Z" fill="#cfc8bc" />
            <rect x="12" y="34" width="28" height="4" rx="2" fill="#8b2332" />
            <rect x="12" y="42" width="18" height="4" rx="2" fill="#b79aa0" />
          </svg>
        );

        const glyph = icon.id === "resume" ? document_ : folder;
        const label = (
          <span className="text-text/95 font-sans text-[12px] leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {icon.label}
          </span>
        );

        if (icon.id === "resume") {
          // Renders nothing while there is no resume to link to, which takes
          // the icon off the desktop rather than leaving one that 404s.
          return (
            <ResumeLink key={icon.id} className={shared}>
              {glyph}
              {label}
            </ResumeLink>
          );
        }
        if (icon.id === "taxes") {
          // It does do something: it tells you there is nothing in it.
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => setToast("You really think I'd leave those there?")}
              className={shared}
            >
              {glyph}
              {label}
            </button>
          );
        }
        return (
          <button
            key={icon.id}
            type="button"
            onClick={openTimeline}
            className={shared}
          >
            {glyph}
            {label}
          </button>
        );
      })}
    </aside>

    {/* Outside the aside, because the aside is a narrow column on the right
        and hidden below lg, and the toast belongs to the whole screen. */}
    <AnimatePresence>
      {toast && (
        <motion.p
          role="status"
          className="bg-bg/85 text-text pointer-events-none absolute top-8 left-1/2 z-20 w-max -translate-x-1/2 rounded-full px-5 py-2.5 font-mono text-[13px] shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {toast}
        </motion.p>
      )}
    </AnimatePresence>
    </>
  );

  return (
    <WindowFrame
      title="Keerthi - About"
      onClose={onClose}
      // The timeline owns Escape while it is open. Both handlers sit on
      // `window`, so without this one Escape would close both of them.
      escapeEnabled={!timelineOpen}
      screen={{ device: "laptop", wallpaper, files, windowOpen }}
    >
      <div className="relative flex min-h-full">
        {/* Terminal */}
        <div
          ref={bodyRef}
          className="font-mono flex-1 px-3.5 py-6 text-[13px] leading-relaxed sm:px-9 sm:py-7"
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
              {booted ? (
                <p className="text-text">Ready.</p>
              ) : (
                <p className="text-text-muted pt-2 text-xs">
                  Press any key to skip.
                </p>
              )}
            </div>

            {!booted ? null : (
              <>
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
              <ResumeLink className="text-highlight hover:text-text inline-flex min-h-6 items-center gap-2 py-1 transition-colors duration-200">
                <Download size={14} aria-hidden="true" />
                Read resume
              </ResumeLink>
              {/*
                The same timeline the folder on the desktop opens. The folder
                is in a column that is hidden below 1024px, which left the
                timeline reachable on a phone only by finding a two centimetre
                calendar in the room. This is the row everybody reaches.
              */}
              <button
                type="button"
                onClick={openTimeline}
                className="text-highlight hover:text-text inline-flex min-h-6 cursor-pointer items-center gap-2 py-1 transition-colors duration-200"
              >
                <CalendarDays size={14} aria-hidden="true" />
                Timeline
              </button>
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-highlight hover:text-text inline-flex min-h-6 items-center gap-2 py-1 transition-colors duration-200"
              >
                <Mail size={14} aria-hidden="true" />
                Contact me
              </a>
            </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {timelineOpen && (
          <Timeline key="timeline" nested onClose={closeTimeline} />
        )}
      </AnimatePresence>
    </WindowFrame>
  );
}
