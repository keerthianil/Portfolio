"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { NAV_ROUTES, type RouteId } from "@/data/routes";
import { pick, springIndicator, springPop } from "@/lib/motion";

/**
 * How wide a nav label is, and the gap between two of them, at each size.
 *
 * The pill used to be 378px wide at every width, which is wider than a 360px
 * Android phone and wider than an iPhone SE. Both rounded ends ran off the
 * screen. The label width is read in JavaScript rather than set in a class
 * because the sliding indicator behind the hovered label is positioned by
 * multiplying it, so a class that changed the width at a breakpoint and a
 * constant that did not would put the indicator under the wrong word.
 */
const SIZES = {
  wide: { label: 70, gap: 8 },
  phone: { label: 66, gap: 4 },
  small: { label: 56, gap: 4 },
};

interface BottomNavProps {
  activeRoute: RouteId | null;
  overlayOpen: boolean;
  onNavigate: (id: RouteId) => void;
  onClose: () => void;
  /** Called every animation frame while an arrow is held down. */
  onRotate: (direction: 1 | -1) => void;
  /** Called once per press. One press is one stop of the two each way. */
  onRotateStep: (direction: 1 | -1) => void;
  /** Pulses the arrows once, to teach that the scene rotates. */
  showArrowGlow?: boolean;
  /** Which way the view is fully turned, if either. */
  limit?: "left" | "right" | null;
  /** False in the flat view, where there is nothing to rotate. */
  canRotate?: boolean;
  /** Set while the welcome card owns the screen. */
  inert?: boolean;
}

export function BottomNav({
  activeRoute,
  overlayOpen,
  onNavigate,
  onClose,
  onRotate,
  onRotateStep,
  showArrowGlow = false,
  limit = null,
  canRotate = true,
  inert = false,
}: BottomNavProps) {
  const shouldReduce = useReducedMotion();
  const [hovered, setHovered] = useState<RouteId | null>(null);
  const [size, setSize] = useState(SIZES.wide);

  const held = useRef(false);
  const direction = useRef<1 | -1>(1);
  const holdTimer = useRef<number | undefined>(undefined);
  const lastPointerStep = useRef(0);

  /**
   * Which of the three sizes applies, watched through the media queries
   * themselves rather than through `resize`.
   *
   * On iOS the address bar collapses and expands as you scroll, and each one
   * of those is a resize event. A resize listener that re-renders the nav
   * would be firing all the way down a case study to answer a question whose
   * answer had not changed. A media query only says something when the answer
   * does change, which on a phone is when it is turned on its side.
   */
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 640px)");
    const phone = window.matchMedia("(min-width: 390px)");
    const read = () =>
      setSize(wide.matches ? SIZES.wide : phone.matches ? SIZES.phone : SIZES.small);
    read();
    wide.addEventListener("change", read);
    phone.addEventListener("change", read);
    return () => {
      wide.removeEventListener("change", read);
      phone.removeEventListener("change", read);
    };
  }, []);

  /**
   * A press is one stop. Holding past a beat turns the room continuously
   * instead.
   *
   * The continuous turn does not start on pointer down, it starts 260ms later,
   * because a click is a pointer down and a pointer up and the two would
   * otherwise both fire: a stop plus however many frames the click took.
   */
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      if (held.current) onRotate(direction.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onRotate]);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  const startHold = useCallback(
    (value: 1 | -1) => {
      direction.current = value;
      onRotateStep(value);
      lastPointerStep.current = Date.now();
      window.clearTimeout(holdTimer.current);
      holdTimer.current = window.setTimeout(() => {
        held.current = true;
      }, 260);
    },
    [onRotateStep],
  );
  const endHold = useCallback(() => {
    held.current = false;
    window.clearTimeout(holdTimer.current);
  }, []);

  const indicatorIndex = hovered
    ? NAV_ROUTES.findIndex((route) => route.id === hovered)
    : 0;

  const arrowClasses = (disabled: boolean) => [
    // 48 on a phone and 56 from 640 up. Both clear the 44px a thumb needs.
    "flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full",
    "bg-bg/25 hover:bg-bg/50 transition-all duration-200",
    // Press is its own state. Without it a held arrow gives no feedback that
    // the hold registered, which is exactly when the user is holding it.
    "hover:scale-110 active:scale-95 active:bg-bg/60",
    "select-none touch-manipulation group",
    showArrowGlow && !disabled
      ? "ring-2 ring-highlight/50 shadow-[0_0_20px_var(--accent-soft)] motion-safe:animate-pulse"
      : "",
    disabled ? "opacity-35 cursor-not-allowed hover:scale-100" : "",
  ].join(" ");

  const arrowIconClasses = (glow: boolean) =>
    [
      "transition-all duration-200 group-hover:scale-110",
      glow ? "text-highlight" : "text-text/70 group-hover:text-highlight",
    ].join(" ");

  /**
   * Enter or Space on a focused arrow fires a click with no pointer down
   * before it, so this is the keyboard path. A mouse or a tap has already
   * turned the room on pointer down, and the click that follows would
   * otherwise turn it a second time.
   *
   * The blur afterwards is for the mouse only. A click from a pointer carries
   * a detail count and a click from a key does not, and blurring on the key
   * path threw focus to the body: you pressed Enter on "Look left", the room
   * turned one stop, and the next Tab started again from the top of the page
   * instead of from the arrow you were still trying to hold.
   */
  function rotateOnce(
    value: 1 | -1,
    event: { currentTarget: HTMLElement; detail: number },
  ) {
    if (Date.now() - lastPointerStep.current > 700) onRotateStep(value);
    if (event.detail > 0) event.currentTarget.blur();
  }

  return (
    <nav
      data-print="hide"
      className={[
        "pointer-events-none fixed bottom-0 left-0 z-[500] h-[100px] w-full",
        inert ? "opacity-0" : "opacity-100 transition-opacity duration-300",
      ].join(" ")}
      aria-label="Site"
      inert={inert}
    >
      <div
        className="absolute bottom-0 h-[130px] w-full"
        style={{ background: "var(--scrim)" }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-auto absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-end justify-center px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pick(!!shouldReduce, { duration: 0.5, ease: "easeOut" })}
        >
          <motion.div
            className="flex h-[76px] items-center rounded-full px-2 shadow-lg backdrop-blur-sm sm:h-[84px] sm:px-4"
            style={{
              background:
                "linear-gradient(90deg, rgba(46, 37, 33, 0.72) 0%, rgba(12, 10, 9, 0.18) 100%)",
            }}
            animate={{
              opacity: overlayOpen ? 0 : 1,
              scale: overlayOpen ? 0.8 : 1,
            }}
            transition={pick(!!shouldReduce, {
              duration: 0.3,
              ease: "easeInOut",
            })}
            // The pill animates to zero opacity when an overlay opens, and an
            // invisible element is still tabbable. `inert` removes it from both
            // the tab order and the accessibility tree in one attribute, which
            // `aria-hidden` alone would not do.
            inert={overlayOpen}
          >
            {canRotate && (
            <button
              type="button"
              className={arrowClasses(limit === "left")}
              disabled={limit === "left"}
              aria-label="Look left"
              onClick={(event) => rotateOnce(1, event)}
              onMouseDown={() => startHold(1)}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={() => startHold(1)}
              onTouchEnd={endHold}
              onContextMenu={(event) => event.preventDefault()}
            >
              <ChevronLeft
                size={24}
                aria-hidden="true"
                className={arrowIconClasses(showArrowGlow)}
              />
            </button>
            )}

            <div
              className="relative mx-1.5 flex items-center gap-1 sm:mx-2 sm:gap-2"
              onMouseLeave={() => setHovered(null)}
            >
              <motion.div
                className="absolute rounded-full backdrop-blur-sm"
                style={{
                  width: size.label,
                  height: 48,
                  backgroundColor: "rgba(12, 10, 9, 0.28)",
                  transformOrigin: "center center",
                }}
                animate={{
                  x: hovered ? indicatorIndex * (size.label + size.gap) : 0,
                  opacity: hovered ? 1 : 0,
                  scale: hovered ? 1 : 0,
                }}
                transition={pick(!!shouldReduce, springIndicator)}
                aria-hidden="true"
              />

              {NAV_ROUTES.map((route) => {
                const isActive = activeRoute === route.id;
                return (
                  <button
                    key={route.id}
                    type="button"
                    style={{ width: size.label }}
                    className={[
                      "relative z-10 flex h-12 cursor-pointer items-center justify-center",
                      "rounded-full text-[15px] font-normal select-none sm:text-[16px]",
                      "touch-manipulation transition-colors duration-200",
                      "active:text-highlight",
                      isActive
                        ? "text-highlight"
                        : "text-text/70 hover:text-text",
                    ].join(" ")}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(event) => {
                      onNavigate(route.id);
                      event.currentTarget.blur();
                    }}
                    onMouseEnter={() => setHovered(route.id)}
                    onFocus={() => setHovered(route.id)}
                    onBlur={() => setHovered(null)}
                  >
                    {route.label}
                  </button>
                );
              })}
            </div>

            {canRotate && (
            <button
              type="button"
              className={arrowClasses(limit === "right")}
              disabled={limit === "right"}
              aria-label="Look right"
              onClick={(event) => rotateOnce(-1, event)}
              onMouseDown={() => startHold(-1)}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={() => startHold(-1)}
              onTouchEnd={endHold}
              onContextMenu={(event) => event.preventDefault()}
            >
              <ChevronRight
                size={24}
                aria-hidden="true"
                className={arrowIconClasses(showArrowGlow)}
              />
            </button>
            )}
          </motion.div>

          <AnimatePresence>
            {overlayOpen && (
              <motion.button
                type="button"
                className="bg-surface/80 hover:bg-surface absolute flex h-16 w-16 cursor-pointer items-center justify-center rounded-full backdrop-blur-md transition-transform duration-200 ease-in-out select-none hover:scale-110 active:scale-95"
                onClick={(event) => {
                  onClose();
                  event.currentTarget.blur();
                }}
                onContextMenu={(event) => event.preventDefault()}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={pick(!!shouldReduce, springPop)}
                aria-label="Close and return to the room"
              >
                <X size={28} className="text-text" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </nav>
  );
}
