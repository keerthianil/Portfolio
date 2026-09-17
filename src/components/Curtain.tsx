"use client";

import { motion, useReducedMotion } from "motion/react";
import { curtain, reduced } from "@/lib/motion";

/**
 * Two black panels that meet in the middle and open vertically to reveal the
 * room.
 *
 * The panels are always mounted and driven by `open`. They used to be wrapped
 * in an AnimatePresence keyed on `!open`, which meant they animated from
 * closed to open the moment they mounted, and then ran their exit animation,
 * closed again, and vanished when `open` finally flipped. The curtain went up
 * twice.
 *
 * Under reduced motion the panels do not move at all; the whole thing becomes
 * a single opacity fade, which reads as the same beat without the travel.
 */
export function Curtain({ open }: { open: boolean }) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <motion.div
        data-print="hide"
        className="bg-bg pointer-events-none fixed inset-0 z-[700]"
        initial={{ opacity: 1 }}
        animate={{ opacity: open ? 0 : 1 }}
        transition={reduced.crossfade}
        style={{ visibility: open ? "hidden" : "visible" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      data-print="hide"
      className="pointer-events-none fixed inset-0 z-[700]"
      aria-hidden="true"
    >
      {(["top", "bottom"] as const).map((edge) => (
        <motion.div
          key={edge}
          className="bg-bg absolute inset-0"
          style={{ transformOrigin: `center ${edge}` }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: open ? 0 : 1 }}
          transition={curtain}
        />
      ))}
    </div>
  );
}
