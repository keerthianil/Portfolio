"use client";

/**
 * How far the reader has got through whatever panel is open, 0 to 1.
 *
 * The room is still there behind an open panel and it was frozen, which made
 * the window read as a screenshot pasted over a picture rather than as
 * something sitting in a space. So the camera drifts a couple of degrees and
 * the bar light on the monitor comes down a little as you read, and both go
 * back when you scroll back up. It is small on purpose: anything you can
 * consciously watch while reading is a distraction.
 *
 * This is a plain mutable object rather than state or context, for the same
 * reason the blind's lighting is driven from a frame loop. It changes on every
 * scroll event and is read once per frame by the render loop, and not one of
 * those readings is a render anybody needs. Nothing subscribes to it; the
 * things that care poll it inside `useFrame`.
 */
export const reading = { progress: 0 };

/**
 * The same number, published as a CSS variable on `<html>`, which is how the
 * progress hairline over a long document draws itself. A `<div>` whose width
 * is `calc(var(--reading) * 100%)` needs no React at all, and this is already
 * being written on every scroll event either way.
 */
export function setReadingProgress(value: number) {
  const next = Math.max(0, Math.min(1, value));
  reading.progress = next;
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--reading", String(next));
  }
}

/**
 * Called when a panel closes. Without it the room stays leaned over at
 * whatever angle the last thing you read left it at, which looks like a bug
 * rather than like reading.
 */
export function resetReadingProgress() {
  setReadingProgress(0);
}

/**
 * Attach to a scrolling element. Returns a handler rather than taking a ref,
 * because the two scroll containers on this site are owned by two different
 * components and neither wants a hook reaching into it.
 */
export function onReadingScroll(event: { currentTarget: HTMLElement }) {
  const element = event.currentTarget;
  const range = element.scrollHeight - element.clientHeight;
  setReadingProgress(range <= 0 ? 0 : element.scrollTop / range);
}
