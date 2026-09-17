"use client";

import { useEffect, useRef, useState } from "react";
import {
  Command,
  Keyboard,
  MousePointerClick,
  Rotate3d,
  SunMedium,
} from "lucide-react";

const ITEMS = [
  {
    Icon: Rotate3d,
    body: "Drag anywhere in the room to look around, or use the arrows. The left and right arrow keys do the same thing.",
  },
  {
    Icon: MousePointerClick,
    body: "Click the things on the desk. The monitor, the laptop and the notebook each open a section, and the calendar opens the timeline.",
  },
  {
    Icon: SunMedium,
    body: "The mug, the switch by the door and the window each do something instead. None of it is undoable.",
  },
  {
    Icon: Keyboard,
    body: "Every object in the room is also a real button. Tab reaches all of them, Escape closes whatever is open, and nothing here needs a mouse.",
  },
  {
    // A shortcut nobody is told about does not exist, which is the same
    // argument that took two custom gestures out of TactileNav.
    Icon: Command,
    body: "If you already know what you are looking for, press Command K, or Control K, and type. Every project, every research document and every section is in there.",
  },
];

export function HelpMenu({ onClose }: { onClose: () => void }) {
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 50);
    return () => window.clearTimeout(id);
  }, []);

  /**
   * Focus moves into the panel and comes back to the button that opened it.
   *
   * Without it a screen reader user pressed a button called "How to move
   * around", was told the button was now expanded, and was read nothing,
   * because their cursor was still on the button and the four things they had
   * just asked for were somewhere below it.
   */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => opener?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    // Deferred so the click that opened the menu does not immediately close it.
    const id = window.setTimeout(
      () => window.addEventListener("pointerdown", onPointerDown),
      0,
    );
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      tabIndex={-1}
      aria-label="How to move around"
      className={[
        "fixed top-16 right-4 z-[700] w-[calc(100vw-2rem)] max-w-[400px]",
        "transition-all duration-300",
        shown ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      ].join(" ")}
    >
      <div className="bg-surface border-border rounded-3xl border p-4 shadow-2xl">
        <ul className="space-y-5">
          {ITEMS.map(({ Icon, body }) => (
            <li key={body} className="flex items-start gap-4">
              <span
                className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--accent-soft)" }}
                aria-hidden="true"
              >
                <Icon className="text-highlight h-6 w-6" />
              </span>
              <p className="pt-2.5 text-[14px] leading-relaxed">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
