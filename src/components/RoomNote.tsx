"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { pick } from "@/lib/motion";

export interface RoomNoteContent {
  title: string;
  body: string;
}

/**
 * The card that explains what just happened in the room.
 *
 * The three wall interactions are wordless on purpose: you press the switch
 * and the colour goes, you pull the cord and the screen goes. But a
 * demonstration nobody can name is a light show, so each one puts two lines up
 * for a few seconds saying what it was.
 *
 * It is not a dialog. It never takes focus, it never blocks anything, and it
 * leaves on its own, because it is a caption on something you are already
 * looking at rather than a thing to deal with. The screen reader gets the same
 * information through the live region in `Experience`, so this is not
 * duplicated into one.
 */
export function RoomNote({ note }: { note: RoomNoteContent | null }) {
  const shouldReduce = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-[550] flex justify-center px-4"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {note && (
          <motion.div
            key={note.title}
            className="border-highlight/30 bg-surface/92 max-w-[380px] rounded-xl border px-5 py-4 shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={pick(!!shouldReduce, { duration: 0.22, ease: "easeOut" })}
          >
            <p className="text-highlight font-mono text-[11px] tracking-widest uppercase">
              {note.title}
            </p>
            <p className="text-text/90 mt-1.5 text-[14px] leading-relaxed">
              {note.body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
