"use client";

import { motion, useReducedMotion } from "motion/react";
import { Mark } from "./Mark";

/**
 * Five stages keyed off the load percentage. The copy is the work the site is
 * about, which is the joke: it narrates an accessibility build rather than a
 * generic spinner.
 */
const STAGES = [
  { upTo: 25, emoji: "✏️", text: "Sketching in Figma..." },
  { upTo: 50, emoji: "🔊", text: "Starting VoiceOver..." },
  { upTo: 85, emoji: "📐", text: "Measuring contrast..." },
  { upTo: 99, emoji: "📳", text: "Warming up the haptics..." },
  { upTo: 100, emoji: "✓", text: "Ready." },
];

function stageFor(percent: number) {
  return STAGES.find((stage) => percent <= stage.upTo) ?? STAGES[STAGES.length - 1];
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function LoadingScreen({ percent }: { percent: number }) {
  const shouldReduce = useReducedMotion();
  const stage = stageFor(percent);
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="bg-bg fixed inset-0 z-[900] flex flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${Math.round(clamped)} percent. ${stage.text}`}
    >
      <div className="relative h-24 w-24">
        <svg
          className="h-24 w-24 -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="2"
            stroke="rgba(242, 234, 225, 0.12)"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="2"
            stroke="var(--color-highlight)"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
            className="transition-all duration-300 ease-out"
          />
        </svg>

        <motion.div
          className="text-highlight absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            // The mark pulses rather than spins. A spinning mark under a
            // progress ring is two spinners; a pulse reads as a heartbeat.
            ...(shouldReduce || clamped >= 100 ? {} : { opacity: [1, 0.45, 1] }),
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            opacity:
              shouldReduce || clamped >= 100
                ? { duration: 0.3, ease: "easeOut" }
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Mark className="h-12 w-12" />
        </motion.div>
      </div>

      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <p className="text-base font-medium tracking-[0.3em]">LOADING</p>
        <p className="text-text/80 mt-2 text-sm">
          <span aria-hidden="true">{stage.emoji}&nbsp;&nbsp;</span>
          {stage.text}
        </p>
      </motion.div>
    </div>
  );
}
