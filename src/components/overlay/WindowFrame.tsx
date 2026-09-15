"use client";

import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useModalFocus } from "@/lib/useModalFocus";
import { OVERLAY_MS, pick } from "@/lib/motion";

/**
 * The window every overlay lives in. It slides up from the bottom edge over the
 * room, the way an application window does.
 *
 * The three dots are the desktop-window signifier, in this palette rather than
 * the system's. They are decorative and marked as such.
 *
 * The close button in the bottom nav sits outside this dialog, and `aria-modal`
 * hides everything outside it from a screen reader. So the window carries its
 * own close control: a screen reader user would otherwise have Escape and no
 * discoverable way to leave.
 */
export function WindowFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const shouldReduce = useReducedMotion();
  const containerRef = useModalFocus(true, onClose);

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
        className="bg-surface border-border relative mx-auto flex w-[96vw] max-w-[1400px] flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ height: "min(88dvh, 980px)" }}
        initial={shouldReduce ? { opacity: 0 } : { y: "100%" }}
        animate={shouldReduce ? { opacity: 1 } : { y: 0 }}
        exit={shouldReduce ? { opacity: 0 } : { y: "100%" }}
        transition={pick(!!shouldReduce, {
          duration: OVERLAY_MS / 1000,
          ease: "easeOut",
        })}
      >
        <div className="border-border bg-surface-raised flex h-[34px] shrink-0 items-center border-b px-4">
          <span className="flex items-center gap-2" aria-hidden="true">
            <span className="bg-accent block h-3 w-3 rounded-full" />
            <span className="bg-highlight/70 block h-3 w-3 rounded-full" />
            <span className="bg-text-muted/60 block h-3 w-3 rounded-full" />
          </span>
          <span className="text-text-muted flex-1 text-center font-mono text-xs tracking-wide">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text hover:bg-bg/60 -mr-1 flex h-7 w-[68px] cursor-pointer items-center justify-end gap-1 rounded-md pr-1 text-xs transition-colors duration-200"
          >
            <span className="font-mono">esc</span>
            <X size={14} aria-hidden="true" />
            <span className="sr-only">Close {title}</span>
          </button>
        </div>

        {/* The bottom nav's close button floats over the bottom edge of this
            window, so the scroll area keeps a lane clear underneath it. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[104px]">
          {children}
        </div>
      </motion.section>
    </div>
  );
}
