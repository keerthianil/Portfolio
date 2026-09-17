"use client";

import { useEffect, useRef } from "react";

/**
 * A soft light that follows the pointer around the room, a little behind it.
 *
 * It lags by design. A glow pinned exactly to the cursor is a second cursor,
 * which is noise; one that trails reads as the pointer disturbing something in
 * the room rather than as a decoration stuck to it. The lerp is 0.12 a frame,
 * so it catches up in about a fifth of a second and never quite arrives while
 * you are still moving.
 *
 * `mix-blend-mode: screen` rather than an overlay with opacity, so it only
 * ever adds light. On the dark oak it glows and on a white case study page it
 * is invisible, which is the correct behaviour for both without a single
 * branch: screen blending against near-white is a no-op.
 *
 * Off in three cases, and each of them is a real one:
 *
 * - Reduced motion. A light chasing the cursor is exactly the class of thing
 *   the setting is asking for less of.
 * - Coarse pointers. There is no cursor on a phone, and mounting this would
 *   leave a glow parked wherever the last tap landed.
 * - Before the first pointer move, so the page does not open with a light
 *   sitting in the top left corner of a room it is not in yet.
 *
 * Everything runs off refs and one rAF loop that writes `transform`. There is
 * no state here on purpose: a pointer move is not a render.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    if (motion.matches || !fine.matches) return;

    const element = ref.current;
    if (!element) return;

    const pointer = { x: 0, y: 0 };
    const glow = { x: 0, y: 0 };
    let seen = false;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (seen) return;
      // First sighting: arrive where the pointer already is rather than flying
      // in from the corner.
      seen = true;
      glow.x = pointer.x;
      glow.y = pointer.y;
      element.style.opacity = "1";
    };

    const onLeave = () => {
      element.style.opacity = "0";
      seen = false;
    };

    const tick = () => {
      glow.x += (pointer.x - glow.x) * 0.12;
      glow.y += (pointer.y - glow.y) * 0.12;
      element.style.transform = `translate3d(${glow.x}px, ${glow.y}px, 0) translate(-50%, -50%)`;
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-print="hide"
      className="pointer-events-none fixed top-0 left-0 z-[300] h-[420px] w-[420px] opacity-0 transition-opacity duration-500"
      style={{
        mixBlendMode: "screen",
        background:
          "radial-gradient(circle closest-side, rgba(212,160,160,0.22), rgba(139,35,50,0.14) 45%, transparent 72%)",
      }}
    />
  );
}
