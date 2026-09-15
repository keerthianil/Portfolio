"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { NAV_ROUTES, type RouteId } from "@/data/routes";
import { pick, springIndicator, springPop } from "@/lib/motion";

const LABEL_WIDTH = 70;

interface BottomNavProps {
  activeRoute: RouteId | null;
  overlayOpen: boolean;
  onNavigate: (id: RouteId) => void;
  onClose: () => void;
  /** Called every animation frame while an arrow is held. */
  onRotate: (direction: 1 | -1) => void;
  /** Pulses the arrows once, to teach that the scene rotates. */
  showArrowGlow?: boolean;
  /** Which way the view is fully turned, if either. */
  limit?: "left" | "right" | null;
  /** False in the flat view, where there is nothing to rotate. */
  canRotate?: boolean;
}

export function BottomNav({
  activeRoute,
  overlayOpen,
  onNavigate,
  onClose,
  onRotate,
  showArrowGlow = false,
  limit = null,
  canRotate = true,
}: BottomNavProps) {
  const shouldReduce = useReducedMotion();
  const [hovered, setHovered] = useState<RouteId | null>(null);
  const [gap, setGap] = useState(8);

  const held = useRef(false);
  const direction = useRef<1 | -1>(1);

  useEffect(() => {
    const read = () =>
      setGap(window.matchMedia("(min-width: 640px)").matches ? 8 : 4);
    read();
    window.addEventListener("resize", read, { passive: true });
    return () => window.removeEventListener("resize", read);
  }, []);

  // Hold to rotate. The button fires once on click for keyboard and tap; this
  // loop is what makes press-and-drag feel continuous.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      if (held.current) onRotate(direction.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onRotate]);

  const startHold = useCallback((value: 1 | -1) => {
    held.current = true;
    direction.current = value;
  }, []);
  const endHold = useCallback(() => {
    held.current = false;
  }, []);

  const indicatorIndex = hovered
    ? NAV_ROUTES.findIndex((route) => route.id === hovered)
    : 0;

  const arrowClasses = (disabled: boolean) => [
    "flex h-14 w-14 cursor-pointer items-center justify-center rounded-full",
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

  function rotateOnce(value: 1 | -1, event: { currentTarget: HTMLElement }) {
    onRotate(value);
    event.currentTarget.blur();
  }

  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-0 z-[500] h-[100px] w-full"
      aria-label="Site"
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
            className="flex h-[84px] items-center rounded-full px-4 shadow-lg backdrop-blur-sm"
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
              className="relative mx-2 flex items-center gap-1 sm:gap-2"
              onMouseLeave={() => setHovered(null)}
            >
              <motion.div
                className="absolute rounded-full backdrop-blur-sm"
                style={{
                  width: LABEL_WIDTH,
                  height: 48,
                  backgroundColor: "rgba(12, 10, 9, 0.28)",
                  transformOrigin: "center center",
                }}
                animate={{
                  x: hovered ? indicatorIndex * (LABEL_WIDTH + gap) : 0,
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
                    className={[
                      "relative z-10 flex h-12 w-[70px] cursor-pointer items-center justify-center",
                      "rounded-full text-[16px] font-normal select-none",
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
