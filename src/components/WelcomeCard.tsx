"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CURTAIN_EASE, pick } from "@/lib/motion";
import { Mark } from "./Mark";

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
      <div className="border-border bg-surface/85 pointer-events-auto flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border p-8 text-center shadow-2xl backdrop-blur-md">
        <span
          className="border-border text-highlight flex h-16 w-16 items-center justify-center rounded-full border"
          aria-hidden="true"
        >
          <Mark className="h-8 w-8" />
        </span>

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl leading-tight">Keerthi Anil</h1>
          <p className="text-highlight text-sm tracking-wide">
            Designer, Developer &amp; Researcher
          </p>
        </div>

        <p className="text-lg leading-snug text-balance">
          I design, build, and research interfaces for the people default
          products miss.
        </p>

        <p className="font-mono text-text-muted text-xs tracking-widest uppercase">
          iOS / SwiftUI / Accessibility / AI
        </p>

        <button
          type="button"
          autoFocus
          onClick={() => {
            setLeaving(true);
            onDismiss();
          }}
          className="bg-accent text-text hover:bg-highlight hover:text-bg mt-1 cursor-pointer rounded-full px-6 py-3 text-[15px] font-medium transition-colors duration-200"
        >
          Start exploring
        </button>
      </div>
    </motion.div>
  );
}
