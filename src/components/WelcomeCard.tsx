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
        {/* Not cropped to a circle: the raised hand is the whole point of the
            pose, and a circular mask cuts it off. It sits on a soft burgundy
            glow instead. */}
        <span
          className="relative flex h-24 w-24 items-center justify-center"
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
            className="relative h-24 w-24 object-contain"
          />
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

        {/* Split so a narrow phone breaks between pairs rather than orphaning
            "AI" on its own line. */}
        <p className="font-mono text-text-muted text-xs tracking-widest uppercase">
          <span className="whitespace-nowrap">iOS / SwiftUI</span>{" "}
          <span aria-hidden="true">/</span>{" "}
          <span className="whitespace-nowrap">Accessibility / AI</span>
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
