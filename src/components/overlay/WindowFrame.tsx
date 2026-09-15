"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useModalFocus } from "@/lib/useModalFocus";
import { OVERLAY_MS, pick } from "@/lib/motion";

/**
 * The window every overlay lives in. It slides up from the bottom edge over the
 * room, the way an application window does.
 *
 * All three chrome buttons work. Red closes, yellow minimises the window down
 * to its title bar, green toggles it full bleed. Decorative traffic lights are
 * a lie the moment anybody clicks one.
 *
 * The window also carries its own close control because `aria-modal` hides
 * everything outside a dialog from a screen reader, so the close button in the
 * bottom nav is one they cannot find.
 */
export function WindowFrame({
  title,
  onClose,
  children,
  escapeEnabled = true,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** False while a nested dialog owns Escape. */
  escapeEnabled?: boolean;
}) {
  const shouldReduce = useReducedMotion();
  const containerRef = useModalFocus(true, onClose, { escape: escapeEnabled });
  const [minimised, setMinimised] = useState(false);
  const [maximised, setMaximised] = useState(false);

  const dots = [
    {
      key: "close",
      label: `Close ${title}`,
      className: "bg-accent hover:brightness-125",
      onClick: onClose,
    },
    {
      key: "minimise",
      label: minimised ? `Restore ${title}` : `Minimise ${title}`,
      className: "bg-highlight/70 hover:bg-highlight",
      onClick: () => setMinimised((value) => !value),
    },
    {
      key: "maximise",
      label: maximised ? `Restore ${title} size` : `Maximise ${title}`,
      className: "bg-text-muted/60 hover:bg-text-muted",
      onClick: () => setMaximised((value) => !value),
    },
  ];

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center">
      <motion.div
        className="bg-bg/70 absolute inset-0 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: OVERLAY_MS / 1000 }}
        aria-hidden="true"
      />

      <motion.section
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "bg-surface border-border relative mx-auto flex flex-col overflow-hidden border shadow-2xl",
          maximised
            ? "h-dvh w-screen rounded-none border-0"
            : "w-[96vw] max-w-[1400px] rounded-2xl",
          // A width and height change on a one shot 300ms toggle is fine. The
          // rule against animating layout properties is about per frame work.
          "transition-[width,height,border-radius] duration-300 ease-out",
        ].join(" ")}
        style={maximised ? undefined : { height: "min(88dvh, 980px)" }}
        initial={shouldReduce ? { opacity: 0 } : { y: "100%" }}
        animate={
          shouldReduce
            ? { opacity: 1 }
            : // Minimising slides the body off the bottom and leaves the title
              // bar, which is a transform rather than a height change.
              { y: minimised ? "calc(100% - 34px)" : 0 }
        }
        exit={shouldReduce ? { opacity: 0 } : { y: "100%" }}
        transition={pick(!!shouldReduce, {
          duration: OVERLAY_MS / 1000,
          ease: "easeOut",
        })}
      >
        <div className="border-border bg-surface-raised flex h-[34px] shrink-0 items-center gap-4 border-b px-4">
          <span className="flex items-center gap-2">
            {dots.map((dot) => (
              <button
                key={dot.key}
                type="button"
                onClick={dot.onClick}
                aria-label={dot.label}
                className={`block h-3 w-3 cursor-pointer rounded-full transition-all duration-150 hover:scale-125 ${dot.className}`}
              />
            ))}
          </span>
          <span className="text-text-muted flex-1 truncate text-center font-mono text-xs tracking-wide">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text hover:bg-bg/60 -mr-1 flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 font-mono text-xs transition-colors duration-200"
          >
            esc
            <span className="sr-only">Close {title}</span>
          </button>
        </div>

        {/* The bottom nav's close button floats over the bottom edge of this
            window, so the scroll area keeps a lane clear underneath it. */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[104px]"
          aria-hidden={minimised}
          inert={minimised}
        >
          {children}
        </div>
      </motion.section>
    </div>
  );
}
