"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { curtain, reduced } from "@/lib/motion";

/**
 * Two black panels that meet in the middle. They start closed and open
 * vertically to reveal the scene, and close again on the way out.
 *
 * Under reduced motion the panels do not move at all; the whole thing becomes
 * a single opacity fade, which reads as the same beat without the travel.
 */
export function Curtain({ open }: { open: boolean }) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <AnimatePresence>
        {!open && (
          <motion.div
            key="curtain-fade"
            className="bg-bg pointer-events-none fixed inset-0 z-40"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 1 }}
            transition={reduced.crossfade}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {!open && (
        <div
          key="curtain"
          className="pointer-events-none fixed inset-0 z-40"
          aria-hidden="true"
        >
          {(["top", "bottom"] as const).map((edge) => (
            <motion.div
              key={edge}
              className="bg-bg absolute inset-0"
              style={{ transformOrigin: `center ${edge}` }}
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              exit={{ scaleY: 1 }}
              transition={curtain}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
