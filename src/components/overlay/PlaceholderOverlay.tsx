"use client";

import { WindowFrame } from "./WindowFrame";

/** Stands in for About and Research until phase 5 builds them. */
export function PlaceholderOverlay({
  label,
  onClose,
}: {
  label: string;
  onClose: () => void;
}) {
  return (
    <WindowFrame title={label} onClose={onClose}>
      <div className="grid h-full place-items-center p-10">
        <p className="text-text-muted font-mono text-sm">
          {label} is built in a later phase.
        </p>
      </div>
    </WindowFrame>
  );
}
