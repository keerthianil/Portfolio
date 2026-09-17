"use client";

/**
 * Where to go back to when a panel you arrived at from somewhere else closes.
 *
 * The research documents are linked from the case studies, and closing one used
 * to drop you in the room. You had opened the projects window, opened a case
 * study, scrolled, followed a link, read a document, and closing it threw all
 * four of those away. Now it puts you back on the case study you left.
 *
 * A module-level string rather than state, because nothing renders from it and
 * it has to survive one panel unmounting and another mounting, which is exactly
 * the moment React state does not survive.
 *
 * It is cleared as soon as it is used. A return address that outlives the trip
 * sends the next visitor somewhere they have never been.
 */
let target: string | null = null;

/** Called before navigating away. Pass the hash to come back to, no leading #. */
export function setReturnTo(hash: string) {
  target = hash.replace(/^#/, "") || null;
}

/** Returns the address once, then forgets it. */
export function takeReturnTo(): string | null {
  const next = target;
  target = null;
  return next;
}

export function peekReturnTo(): string | null {
  return target;
}
