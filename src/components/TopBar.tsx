"use client";

import { useState } from "react";
import { CircleQuestionMark, X } from "lucide-react";
import { HelpMenu } from "./HelpMenu";

export function TopBar({
  hidden = false,
  overlayOpen = false,
}: {
  hidden?: boolean;
  /**
   * Set while an overlay is open. The bar leaves entirely rather than sitting
   * there greyed out: `aria-modal` already hides it from a screen reader, and
   * help about moving around the room is not help while you are reading a case
   * study. It comes back when you close the panel.
   */
  overlayOpen?: boolean;
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header
        inert={hidden || overlayOpen}
        className={[
          "fixed top-0 left-0 z-[600] flex h-16 w-full items-center",
          "justify-between px-4 transition-opacity duration-300",
          hidden || overlayOpen ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
      >
        {/* Nothing in this corner. The name is in the page heading and the
            face is in About, and a third copy of the same identity up here is
            a badge. The room is reachable from the nav and from Escape. */}
        <span aria-hidden="true" />

        <button
          type="button"
          onClick={() => setHelpOpen((open) => !open)}
          aria-label={helpOpen ? "Close help" : "How to move around"}
          aria-expanded={helpOpen}
          className="hover:bg-surface/60 group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 select-none hover:scale-110 active:scale-95"
        >
          {helpOpen ? (
            <X
              size={24}
              aria-hidden="true"
              className="text-text/70 group-hover:text-text transition-all duration-200"
            />
          ) : (
            <CircleQuestionMark
              size={24}
              aria-hidden="true"
              className="text-text/70 group-hover:text-text transition-all duration-200"
            />
          )}
        </button>
      </header>

      {helpOpen && <HelpMenu onClose={() => setHelpOpen(false)} />}
    </>
  );
}
