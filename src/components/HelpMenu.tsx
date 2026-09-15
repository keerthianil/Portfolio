"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard, MousePointerClick, Rotate3d } from "lucide-react";

const ITEMS = [
  {
    Icon: Rotate3d,
    body: "Use the arrows to rotate the room. The left and right arrow keys do the same thing.",
  },
  {
    Icon: MousePointerClick,
    body: "Click the things on the desk. The monitor, the laptop and the e-reader each open a section.",
  },
  {
    Icon: Keyboard,
    body: "Every object in the room is also a real button. Tab reaches all of them, and nothing here needs a mouse.",
  },
];

export function HelpMenu({ onClose }: { onClose: () => void }) {
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 50);
    return () => window.clearTimeout(id);
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
      aria-label="How to move around"
      className={[
        "fixed top-16 right-4 z-[700] w-[calc(100vw-2rem)] max-w-[400px]",
        "transition-all duration-300",
        shown ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      ].join(" ")}
    >
      <div className="bg-surface border-border rounded-3xl border p-4 shadow-2xl">
        <ul className="space-y-6">
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
