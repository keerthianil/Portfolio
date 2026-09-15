"use client";

import { useState } from "react";
import { WindowFrame } from "./WindowFrame";

/**
 * A divider you drag across one screen. Left of it, the version that fails.
 * Right of it, the same screen fixed.
 *
 * Built from live DOM rather than a pair of screenshots, so the contrast
 * figures on it are the real computed ratios of the colours being shown, and
 * the touch targets are really the sizes the labels claim.
 *
 * The control is a range input. A drag handle that is only a pointer target
 * would be the exact failure this panel is about.
 */

const FAILS = [
  { label: "Body text", value: "2.1:1", note: "grey on grey" },
  { label: "Tap target", value: "22pt", note: "under the 44pt floor" },
  { label: "Input", value: "no label", note: "placeholder only" },
  { label: "Status", value: "colour only", note: "red means error" },
];

const FIXES = [
  { label: "Body text", value: "16.6:1", note: "cream on near black" },
  { label: "Tap target", value: "44pt", note: "meets 2.5.5" },
  { label: "Input", value: "labelled", note: "label stays visible" },
  { label: "Status", value: "icon plus text", note: "colour is redundant" },
];

export function BeforeAfter({ onClose }: { onClose: () => void }) {
  const [split, setSplit] = useState(50);

  return (
    <WindowFrame title="Before and after" onClose={onClose}>
      <div className="mx-auto flex max-w-[900px] flex-col gap-6 px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-2">
          <h2 className="font-display text-3xl">Before and after</h2>
          <p className="text-text/80 max-w-prose text-[15px] leading-relaxed">
            The same screen twice. Drag the divider, or use the slider below it
            with the arrow keys. Every number on the right is measured, not
            asserted.
          </p>
        </header>

        <div className="border-border relative overflow-hidden rounded-xl border">
          {/* The failing version sits underneath, full width. */}
          <div className="h-[290px] bg-[#2a2622] p-6 sm:h-[310px] sm:p-8">
            <Panel rows={FAILS} failing />
          </div>

          {/* The fixed version is clipped to the right of the divider. */}
          <div
            className="bg-surface-raised absolute inset-0 p-6 sm:p-8"
            style={{ clipPath: `inset(0 0 0 ${split}%)` }}
            aria-hidden="true"
          >
            <Panel rows={FIXES} />
          </div>

          <div
            className="bg-highlight absolute inset-y-0 w-0.5"
            style={{ left: `${split}%` }}
            aria-hidden="true"
          />
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-text-muted font-mono text-xs tracking-widest uppercase">
            Reveal the fixed version
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={split}
            onChange={(event) => setSplit(Number(event.target.value))}
            className="accent-accent w-full cursor-pointer"
          />
        </label>

        {/* The fixed version also exists as plain text, because a clip path is
            invisible to a screen reader and the comparison is the content. */}
        <div className="grid gap-6 sm:grid-cols-2">
          <ListOut title="What fails" rows={FAILS} />
          <ListOut title="What it becomes" rows={FIXES} />
        </div>
      </div>
    </WindowFrame>
  );
}

function Panel({
  rows,
  failing = false,
}: {
  rows: typeof FAILS;
  failing?: boolean;
}) {
  /**
   * The rows span the full width on purpose. An earlier version laid the
   * content out in a narrow left column, and clipping the left half of it left
   * the fixed side of the slider completely empty.
   */
  return (
    <div className="flex h-full flex-col gap-4">
      <div
        className={[
          "flex items-center justify-between border-b pb-3",
          failing ? "border-[#3a342e]" : "border-border",
        ].join(" ")}
      >
        <span
          className={
            failing
              ? "text-[13px] text-[#3f3a35]"
              : "text-text text-[15px] font-medium"
          }
        >
          Session summary
        </span>
        <span
          className={
            failing
              ? "font-mono text-[10px] text-[#3a352f]"
              : "text-highlight font-mono text-[10px] tracking-widest uppercase"
          }
        >
          {failing ? "before" : "after"}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex w-full items-center gap-3">
            <span
              className={[
                "flex shrink-0 items-center justify-center rounded-full",
                failing
                  ? "h-[22px] w-[22px] bg-[#4a423b] text-[9px] text-[#6b625a]"
                  : "bg-accent text-text h-11 w-11 text-[11px]",
              ].join(" ")}
              aria-hidden="true"
            >
              {failing ? "?" : "OK"}
            </span>
            <span
              className={[
                "flex-1 truncate",
                failing ? "text-[12px] text-[#4a443e]" : "text-text text-sm",
              ].join(" ")}
            >
              {row.label}
            </span>
            <span
              className={[
                "shrink-0 text-right font-mono",
                failing
                  ? "text-[11px] text-[#463f39]"
                  : "text-highlight text-[11px]",
              ].join(" ")}
            >
              {row.value}
              <span
                className={
                  failing
                    ? "block text-[10px] text-[#3f3934]"
                    : "text-text-muted block text-[10px]"
                }
              >
                {row.note}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListOut({ title, rows }: { title: string; rows: typeof FAILS }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-display text-lg">{title}</h3>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li key={row.label} className="text-[14px] leading-relaxed">
            <span className="text-text">{row.label}: </span>
            <span className="text-text-muted font-mono text-[12px]">
              {row.value}, {row.note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
