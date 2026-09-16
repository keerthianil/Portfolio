"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
 *
 * `screen` is the second form. The laptop opens onto the laptop's own screen:
 * a wallpaper filling the viewport with files down one side and the window on
 * top of it. In that form the whole screen is the dialog, not the window,
 * because anything left outside a dialog is invisible to a screen reader and
 * the files on the desktop are content.
 */
export function WindowFrame({
  title,
  onClose,
  children,
  escapeEnabled = true,
  paper = false,
  screen,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** False while a nested dialog owns Escape. */
  escapeEnabled?: boolean;
  /**
   * Paper rather than an application window: no title bar, no traffic lights,
   * a ruled margin and a torn top edge. Research uses it, because the object
   * that opens it is a notebook and a notebook is not a Mac.
   */
  paper?: boolean;
  /** Renders the window on a device's own screen instead of over the room. */
  screen?: {
    /** Which object in the room you just opened. Draws its bezel. */
    device: "laptop" | "monitor";
    /** Painted across the whole screen, behind everything else. */
    wallpaper: ReactNode;
    /** Files on that desktop. Inside the dialog, beside the window. */
    files?: ReactNode;
    /**
     * False holds the desktop on screen with no window on it. About uses it so
     * you see the machine before the terminal opens on it.
     */
    windowOpen?: boolean;
  };
}) {
  const shouldReduce = useReducedMotion();
  const containerRef = useModalFocus(true, onClose, { escape: escapeEnabled });
  const [maximised, setMaximised] = useState(false);

  /**
   * Red closes, green goes full bleed. Yellow is drawn and does nothing.
   *
   * It is a `span`, not a disabled button: a dot that never minimises anything
   * is decoration, and shipping it as a button would put a control in the tab
   * order and in the screen reader's list that has no behaviour behind it.
   * Drawn as part of the window chrome, announced as nothing.
   */
  const chrome = (
    <>
      {/*
        The dots stay three millimetres across and the things you press are
        24px square around them.

        They were 12px buttons, which is a fine mouse target and half of what
        a finger needs. They are drawn as a span inside a button now rather
        than as a button that is the dot, and the row's own gap comes off to
        pay for the buttons being twice the size, so the chrome looks the same
        and stops being three tiny targets 8px apart.
      */}
      <div className="border-border bg-surface-raised flex h-9 shrink-0 items-center gap-3 border-b px-2.5 sm:gap-4 sm:px-4">
        <span className="flex items-center">
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="group flex h-6 w-6 cursor-pointer items-center justify-center rounded-full"
          >
            <span className="bg-accent block h-3 w-3 rounded-full transition-all duration-150 group-hover:scale-125 group-hover:brightness-125" />
          </button>
          <span className="flex h-6 w-6 items-center justify-center">
            <span
              aria-hidden="true"
              className="bg-highlight/40 block h-3 w-3 rounded-full"
            />
          </span>
          <button
            type="button"
            onClick={() => setMaximised((value) => !value)}
            aria-label={
              maximised ? `Restore ${title} size` : `Maximise ${title}`
            }
            className="group flex h-6 w-6 cursor-pointer items-center justify-center rounded-full"
          >
            <span className="bg-text-muted/60 group-hover:bg-text-muted block h-3 w-3 rounded-full transition-all duration-150 group-hover:scale-125" />
          </button>
        </span>
        <span className="text-text-muted flex-1 truncate text-center font-mono text-xs tracking-wide">
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text hover:bg-bg/60 -mr-1 flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 font-mono text-xs transition-colors duration-200"
        >
          {screen ? "Exit [esc]" : "esc"}
          <span className="sr-only">Close {title}</span>
        </button>
      </div>

      {/* The bottom nav's close button floats over the bottom edge of this
          window, so the scroll area keeps a lane clear underneath it. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[104px]">
        {children}
      </div>
    </>
  );

  const windowMotion = {
    initial: shouldReduce ? { opacity: 0 } : { y: "100%" },
    animate: shouldReduce ? { opacity: 1 } : { y: 0 },
    exit: shouldReduce ? { opacity: 0 } : { y: "100%" },
    transition: pick(!!shouldReduce, {
      duration: OVERLAY_MS / 1000,
      ease: "easeOut" as const,
    }),
  };

  if (screen) {
    const laptop = screen.device === "laptop";
    return (
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-[400] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: OVERLAY_MS / 1000 }}
      >
        {/* The room, still there, just out of focus behind the device. */}
        <div
          className="bg-bg/85 absolute inset-0 backdrop-blur-[3px]"
          aria-hidden="true"
        />

        {/*
          The device the content is on. You clicked a laptop, so what opens is
          a laptop: bezel, notch, chin. It is the same move the room makes,
          which is that the thing you touched is the thing you get.
        */}
        {/* The device is drawn tight to the edges on a phone. A laptop bezel
            is a nice joke on a desk and it is 50px of a 375px screen, which
            is the width of five characters of the terminal inside it. */}
        <div className="absolute inset-0 flex items-center justify-center p-1 sm:p-5">
          <div
            className={[
              "relative flex h-full w-full max-w-[1600px] flex-col",
              "bg-[#17171b] shadow-[0_30px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/8",
              laptop
                ? "rounded-[14px] p-1 sm:rounded-[20px] sm:p-3"
                : "rounded-[10px] p-1 sm:rounded-[12px] sm:p-2",
            ].join(" ")}
          >
            {/* The screen itself, and everything on it */}
            <div
              className={[
                "relative flex-1 overflow-hidden bg-black",
                laptop ? "rounded-[12px]" : "rounded-[6px]",
              ].join(" ")}
            >
              <div className="absolute inset-0" aria-hidden="true">
                {screen.wallpaper}
              </div>

              {/* The notch, on the screen rather than above it, which is where
                  a notch actually is. */}
              {laptop && (
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 h-[18px] w-[128px] -translate-x-1/2 rounded-b-[9px] bg-[#17171b]"
                />
              )}

              {screen.files}

              {/*
                The window floats clear of the bottom edge, so the desktop
                shows underneath it and it reads as a window on a screen rather
                than as the screen.

                This wrapper fills the screen and sits above `screen.files` in
                paint order, so without `pointer-events-none` it swallowed
                every click aimed at the icons on the desktop beside it. The
                window itself takes its events back.
              */}
              <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[2%] sm:pb-[5%]">
                <AnimatePresence>
                {(screen.windowOpen ?? true) && (
                <motion.section
                  aria-label={`${title} window`}
                  className={[
                    "bg-surface border-border pointer-events-auto relative flex flex-col overflow-hidden border shadow-2xl",
                    maximised
                      ? "h-full w-full rounded-none border-0"
                      : screen.files
                        ? // A lane down the right for the files on the desktop
                          "mx-auto w-[99%] rounded-lg sm:w-[94%] sm:max-w-[1180px] sm:rounded-xl lg:mr-[168px] lg:w-[calc(94%-140px)]"
                        : "mx-auto w-[99%] rounded-lg sm:w-[96%] sm:max-w-[1400px] sm:rounded-xl",
                    "transition-[width,height,border-radius] duration-300 ease-out",
                  ].join(" ")}
                  style={maximised ? undefined : { height: "94%" }}
                  {...windowMotion}
                >
                  {chrome}
                </motion.section>
                )}
                </AnimatePresence>
              </div>
            </div>

            {/* The chin. A laptop's carries the hinge, a monitor's the stand. */}
            <div
              aria-hidden="true"
              className={[
                "flex shrink-0 items-center justify-center",
                laptop ? "h-4 sm:h-5" : "h-5 sm:h-7",
              ].join(" ")}
            >
              {laptop ? (
                <span className="h-[3px] w-24 rounded-full bg-white/10" />
              ) : (
                <span className="bg-accent/70 h-[6px] w-[6px] rounded-full" />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (paper) {
    return (
      <div className="fixed inset-0 z-[400] flex items-end justify-center pb-[6vh]">
        <motion.div
          className="bg-bg/75 absolute inset-0 backdrop-blur-[2px]"
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
          className="relative mx-auto flex w-[94vw] max-w-[1080px] flex-col overflow-hidden rounded-[3px] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          style={{ height: "min(82dvh, 920px)" }}
          {...windowMotion}
        >
          {/* The torn top edge. A sheet pulled off a pad does not have a
              straight one, and a straight one is what makes a white rectangle
              read as a dialog. */}
          <div
            aria-hidden="true"
            className="h-3 shrink-0 bg-[#f2eae1]"
            style={{
              clipPath:
                "polygon(0 60%, 3% 20%, 7% 70%, 12% 25%, 17% 75%, 23% 30%, 29% 70%, 35% 20%, 41% 65%, 47% 25%, 54% 72%, 60% 28%, 66% 68%, 72% 22%, 78% 70%, 84% 30%, 90% 66%, 95% 24%, 100% 62%, 100% 100%, 0 100%)",
            }}
          />

          {/* The close control, because `aria-modal` hides everything outside
              this dialog from a screen reader, including the nav's own. */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 z-10 flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#0c0a09]/8 px-4 font-mono text-xs text-[#0c0a09]/70 transition-colors duration-200 hover:bg-[#0c0a09]/15 hover:text-[#0c0a09]"
          >
            esc
            <span className="sr-only">Close {title}</span>
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f2eae1] pb-[104px]">
            {children}
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center pb-[4vh]">
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
        style={maximised ? undefined : { height: "min(84dvh, 960px)" }}
        {...windowMotion}
      >
        {chrome}
      </motion.section>
    </div>
  );
}
