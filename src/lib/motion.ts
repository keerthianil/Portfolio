import type { Transition } from "motion/react";

/**
 * The whole site's motion vocabulary: one custom curve, three springs, two
 * durations. Most of the polish comes from that restraint, so nothing new gets
 * invented per component.
 */

/** easeOutQuad. Reserved for full-screen curtains. Nothing else uses it. */
export const CURTAIN_EASE = [0.25, 0.46, 0.45, 0.94] as const;

/**
 * 700ms, not 1200. The curtain is the last thing between the visitor and the
 * room, and every millisecond of it is spent looking at black. A slow theatre
 * wipe is a nice idea on the second visit and a wait on the first.
 */
export const curtain: Transition = {
  duration: 0.7,
  ease: CURTAIN_EASE,
};

/** Case study modal enter and exit. */
export const springModal: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/** The sliding pill behind the hovered nav label. */
export const springIndicator: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};

/** The close button popping in when an overlay opens. */
export const springPop: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

/** Hover and colour. */
export const HOVER_MS = 200;
/** Overlay window slide and backdrop fade. */
export const OVERLAY_MS = 300;

/**
 * The camera leads the overlay. A route change moves the camera first and
 * mounts the overlay 700ms later, so you arrive at the object before its
 * content covers it. This is the single most important timing on the site.
 */
export const CAMERA_LEAD_MS = 700;

/** First move into the room is slower than every move after it. */
export const FIRST_CAMERA_MS = 2000;
export const CAMERA_MS = 900;

/**
 * Reduced-motion variants. Every animated surface picks one of these instead of
 * branching inline, so "off" means a crossfade rather than a jump.
 */
export const reduced = {
  instant: { duration: 0 } satisfies Transition,
  crossfade: { duration: 0.2, ease: "linear" } satisfies Transition,
};

export function pick<T extends Transition>(
  shouldReduce: boolean,
  full: T,
  fallback: Transition = reduced.crossfade,
): Transition {
  return shouldReduce ? fallback : full;
}
