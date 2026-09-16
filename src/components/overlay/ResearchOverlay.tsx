"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { RESEARCH, type ResearchItem } from "@/data/research";
import { WindowFrame } from "./WindowFrame";

/**
 * Research, as the notebook it opens from.
 *
 * Paper rather than the site's dark palette, because this is the one place on
 * the site meant for reading at length and the rest of it is not. Contrast
 * holds either way: near black ink on warm cream is the same 16.59:1 as the
 * dark mode pair, inverted.
 *
 * It is a sheet, not an application window: torn top edge, a ruled margin down
 * the left, no title bar and no traffic lights. A notebook that opens a Mac
 * window is two objects pretending to be one.
 */
export function ResearchOverlay({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<ResearchItem | null>(null);

  return (
    <WindowFrame title="Research" onClose={onClose} escapeEnabled={!open} paper>
      <div className="relative min-h-full bg-[#f2eae1] text-[#0c0a09]">
        {/* The ruling, under everything. Faint enough to read across. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 31px, rgba(12,10,9,0.06) 31px 32px)",
          }}
        />
        {/* The margin rule a notebook page has, and the punch holes. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[42px] hidden w-px bg-[#8b2332]/30 sm:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-0 left-[14px] hidden w-4 flex-col justify-around py-24 sm:flex"
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="block h-4 w-4 rounded-full border border-[#0c0a09]/12 bg-[#e5dccf]"
            />
          ))}
        </div>

        <div className="relative sm:pl-10">
          {open ? (
            <Reader item={open} onBack={() => setOpen(null)} />
          ) : (
            <Shelf onOpen={setOpen} />
          )}
        </div>
      </div>
    </WindowFrame>
  );
}

function Shelf({ onOpen }: { onOpen: (item: ResearchItem) => void }) {
  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-7 px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-3xl sm:text-4xl">Research</h2>
        <p className="max-w-prose text-[15px] leading-relaxed text-[#0c0a09]/75">
          Studies, reviews and instruments. Some of this became a product and
          some of it stayed as a finding. Both are here.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {RESEARCH.map((item) => (
          <li key={item.id} className="flex">
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="group flex flex-1 cursor-pointer flex-col gap-3 rounded-xl border border-[#0c0a09]/15 bg-[#f7f1e9] p-5 text-left transition-colors duration-200 hover:border-[#8b2332]/50"
              aria-label={`Read: ${item.title}`}
            >
              <span className="flex items-baseline justify-between gap-3 font-mono text-[10px] tracking-widest uppercase text-[#0c0a09]/50">
                <span>{item.kind}</span>
                <span>{item.date}</span>
              </span>
              <span className="font-display text-xl leading-tight group-hover:text-[#8b2332]">
                {item.title}
              </span>
              <span className="text-[14px] leading-relaxed text-[#0c0a09]/75">
                {item.summary}
              </span>
              {item.facts && (
                <span className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 font-mono text-[11px] text-[#8b2332]">
                  {item.facts.slice(0, 2).map((fact) => (
                    <span key={fact.label}>
                      {fact.value}{" "}
                      <span className="text-[#0c0a09]/50">{fact.label}</span>
                    </span>
                  ))}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Reader({
  item,
  onBack,
}: {
  item: ResearchItem;
  onBack: () => void;
}) {
  // Escape goes back to the shelf rather than closing the whole window, which
  // is what a reader view should do when it is one level deep.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onBack]);

  return (
    <article className="mx-auto flex max-w-[68ch] flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
      <button
        type="button"
        onClick={onBack}
        autoFocus
        className="self-start font-mono text-[12px] text-[#8b2332] underline decoration-[#8b2332]/40 underline-offset-4 transition-colors hover:decoration-[#8b2332]"
      >
        Back to the shelf
      </button>

      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] tracking-widest uppercase text-[#0c0a09]/50">
          {item.kind} · {item.date}
        </p>
        <h2 className="font-display text-3xl leading-tight">{item.title}</h2>
      </header>

      {item.facts && (
        <dl className="grid grid-cols-2 gap-4 border-y border-[#0c0a09]/12 py-5 sm:grid-cols-4">
          {item.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span className="font-display block text-xl leading-none text-[#8b2332]">
                  {fact.value}
                </span>
                <span className="mt-1.5 block text-[12px] leading-snug text-[#0c0a09]/60">
                  {fact.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex flex-col gap-4">
        {item.body.map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="text-[16px] leading-[1.75] text-[#0c0a09]/85"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {(item.file || item.link) && (
        <div className="flex flex-wrap gap-5 border-t border-[#0c0a09]/12 pt-5">
          {item.file && (
            <a
              href={item.file.href}
              download
              className="inline-flex items-center gap-2 text-[14px] text-[#8b2332] transition-opacity hover:opacity-70"
            >
              <Download size={14} aria-hidden="true" />
              {item.file.label}
            </a>
          )}
          {item.link && (
            <a
              href={item.link.href}
              className="inline-flex items-center gap-2 text-[14px] text-[#8b2332] transition-opacity hover:opacity-70"
            >
              <ExternalLink size={14} aria-hidden="true" />
              {item.link.label}
            </a>
          )}
        </div>
      )}
    </article>
  );
}
