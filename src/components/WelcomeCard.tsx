"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { CURTAIN_EASE, pick } from "@/lib/motion";

export function WelcomeCard({ onDismiss }: { onDismiss: () => void }) {
  const shouldReduce = useReducedMotion();
  // The card stays mounted for the length of its exit animation. An animating,
  // half-faded card is still tabbable, so it goes inert the moment it starts
  // leaving rather than when it finally unmounts.
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setLeaving(true);
      onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  return (
    <motion.div
      inert={leaving}
      data-print="hide"
      className="pointer-events-none fixed inset-0 z-[550] flex items-center justify-center px-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={pick(!!shouldReduce, {
        duration: 0.6,
        ease: CURTAIN_EASE,
        delay: 0.2,
      })}
    >
      {/*
        A phone on its side is under 400px tall, and the card was taller than
        that, which cut off the only way in. On a short screen it tightens up,
        and if it still does not fit it scrolls rather than clipping.
      */}
      <div className="border-border bg-surface/85 pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col items-center gap-5 overflow-y-auto overscroll-contain rounded-3xl border p-8 text-center shadow-2xl backdrop-blur-md [@media(max-height:520px)]:gap-3 [@media(max-height:520px)]:p-5">
        {/* Not cropped to a circle: the raised hand is the whole point of the
            pose, and a circular mask cuts it off. It sits on a soft burgundy
            glow instead. */}
        <span
          className="relative flex h-24 w-24 shrink-0 items-center justify-center [@media(max-height:520px)]:h-16 [@media(max-height:520px)]:w-16"
          aria-hidden="true"
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 55%, var(--accent-soft) 0%, transparent 70%)",
            }}
          />
          <Image
            src="/images/keerthi.png"
            alt=""
            width={242}
            height={240}
            priority
            className="relative h-24 w-24 object-contain [@media(max-height:520px)]:h-16 [@media(max-height:520px)]:w-16"
          />
        </span>

        <div className="flex flex-col gap-1">
          {/* A paragraph, not a heading. The page already has its one h1 on
              main, and a second one appearing and then unmounting when the
              card is dismissed rewrites the document outline under anybody
              reading it by headings. */}
          <p className="font-display text-3xl leading-tight [@media(max-height:520px)]:text-2xl">Keerthi Anil</p>
          <p className="text-highlight text-sm tracking-wide">
            Designer, Developer &amp; Researcher
          </p>
        </div>

        <p className="text-lg leading-snug text-balance [@media(max-height:520px)]:text-base">
          I design, build, and research interfaces for the people default
          products miss.
        </p>

        {/* Split so a narrow phone breaks between pairs rather than orphaning
            "AI" on its own line. */}
        <p className="font-mono text-text-muted text-xs tracking-widest uppercase">
          <span className="whitespace-nowrap">iOS / SwiftUI</span>{" "}
          <span aria-hidden="true">/</span>{" "}
          <span className="whitespace-nowrap">Accessibility / AI</span>
        </p>

        {/* The one piece of news on the card. It sits above the button rather
            than under the strapline because it is the thing a recruiter is
            looking for, and it has a date on it so it goes stale honestly
            instead of saying "currently" forever. */}
        <p className="border-highlight/40 bg-accent/15 text-text/90 rounded-full border px-4 py-2 text-[13px]">
          <span className="bg-highlight mr-2 inline-block h-2 w-2 rounded-full align-middle" aria-hidden="true" />
          Open to full-time roles from January 2027
        </p>

        <button
          type="button"
          autoFocus
          onClick={() => {
            setLeaving(true);
            onDismiss();
          }}
          className="bg-accent text-text hover:bg-highlight hover:text-bg active:scale-95 mt-1 cursor-pointer rounded-full px-6 py-3 text-[15px] font-medium transition-all duration-200"
        >
          Start exploring
        </button>
      </div>
    </motion.div>
  );
}
