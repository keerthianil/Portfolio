"use client";

import { Mark } from "./Mark";

/**
 * Five stages keyed off the load percentage. The copy narrates an accessibility
 * build rather than a generic spinner.
 *
 * Deliberately free of any JS animation. This renders during the busiest moment
 * of the page's life, before hydration has settled and while the 3D canvas is
 * initialising. An earlier version faded the text in with Motion and it stayed
 * stuck at opacity 0, because the animation never got a frame: the loading
 * screen was invisible except for its ring. CSS keyframes run without waiting
 * for JS, and the global reduced-motion rule already neutralises them.
 */
const STAGES = [
  { upTo: 25, emoji: "✏️", text: "Sketching in Figma..." },
  { upTo: 50, emoji: "🔊", text: "Starting VoiceOver..." },
  { upTo: 85, emoji: "📐", text: "Measuring contrast..." },
  { upTo: 99, emoji: "📳", text: "Warming up the haptics..." },
  { upTo: 100, emoji: "✓", text: "Ready." },
];

function stageFor(percent: number) {
  return (
    STAGES.find((stage) => percent <= stage.upTo) ?? STAGES[STAGES.length - 1]
  );
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function LoadingScreen({ percent }: { percent: number }) {
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

        <div className="text-highlight absolute inset-0 flex items-center justify-center">
          {/* The mark pulses rather than spins. A spinner inside a progress ring
              is two spinners; a pulse reads as a heartbeat. */}
          <Mark
            className={`h-12 w-12 ${clamped >= 100 ? "" : "loading-pulse"}`}
          />
        </div>
      </div>

      <div className="loading-rise mt-4 text-center">
        <p className="text-base font-medium tracking-[0.3em]">LOADING</p>
        <p className="text-text/80 mt-2 text-sm">
          <span aria-hidden="true">{stage.emoji}&nbsp;&nbsp;</span>
          {stage.text}
        </p>
      </div>
    </div>
  );
}
