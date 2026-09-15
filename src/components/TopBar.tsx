"use client";

import { useState } from "react";
import { CircleQuestionMark, X } from "lucide-react";
import { Mark } from "./Mark";
import { HelpMenu } from "./HelpMenu";

export function TopBar({
  onHome,
  hidden = false,
}: {
  onHome: () => void;
  hidden?: boolean;
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 z-[600] flex h-16 w-full items-center",
          "justify-between px-4 transition-opacity duration-300",
          hidden ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onHome}
          className="text-text hover:text-highlight flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200"
          aria-label="Keerthi Anil, back to the room"
        >
          <Mark className="h-7 w-7" />
        </button>

        <button
          type="button"
          onClick={() => setHelpOpen((open) => !open)}
          aria-label={helpOpen ? "Close help" : "How to move around"}
          aria-expanded={helpOpen}
          className="hover:bg-surface/60 group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 select-none hover:scale-110"
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
