"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import {
  RESEARCH,
  type Block,
  type ResearchDoc,
  type ResearchItem,
} from "@/data/research";
import { peekReturnTo, takeReturnTo } from "@/lib/returnTo";
import { useSubRoute } from "@/lib/useSubRoute";
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
 *
 * The open document is a sub-route, so `#research/stemally-study` works as a
 * link. The case studies link into here, which is the point: the work section
 * carries the 700 word version and this carries the 2,000 word one.
 */
export function ResearchOverlay({ onClose }: { onClose: () => void }) {
  const { openId, open, close } = useSubRoute("research");
  const item = RESEARCH.find((entry) => entry.id === openId) ?? null;

  /**
   * If we got here from a case study, closing goes back to it rather than to
   * the room. You opened a window, opened a case study, scrolled, and followed
   * a link: throwing all four of those away on close is the rudest thing a
   * panel can do.
   */
  const closeWindow = useCallback(() => {
    const back = takeReturnTo();
    if (back) {
      window.location.hash = back;
      return;
    }
    onClose();
  }, [onClose]);

  const closeDocument = useCallback(() => {
    if (peekReturnTo()) {
      closeWindow();
      return;
    }
    close();
  }, [close, closeWindow]);

  return (
    <WindowFrame
      title="Research"
      onClose={closeWindow}
      escapeEnabled={!item}
      paper
    >
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
          {item ? (
            <Reader key={item.id} item={item} onBack={closeDocument} />
          ) : (
            <Shelf onOpen={open} />
          )}
        </div>
      </div>
    </WindowFrame>
  );
}

function Shelf({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-7 px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-3xl sm:text-4xl">Research</h2>
        <p className="max-w-prose text-[15px] leading-relaxed text-[#0c0a09]/75">
          Studies, reviews and instruments, at full length. Some of this became
          a product and some of it stayed as a finding. Both are here, with the
          working.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {RESEARCH.map((item) => (
          <li key={item.id} className="flex">
            <button
              type="button"
              onClick={() => onOpen(item.id)}
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
              <span className="mt-auto flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-2 font-mono text-[11px] text-[#8b2332]">
                {item.facts?.slice(0, 2).map((fact) => (
                  <span key={fact.label}>
                    {fact.value}{" "}
                    <span className="text-[#0c0a09]/50">{fact.label}</span>
                  </span>
                ))}
                {item.docs && (
                  <span className="text-[#0c0a09]/50">
                    plus {item.docs.length} supporting{" "}
                    {item.docs.length === 1 ? "document" : "documents"}
                  </span>
                )}
              </span>
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
  /**
   * A supporting document is a third level, and three levels of hash is one
   * more than this is worth. It lives in state, and Escape steps back one
   * level at a time: document, then write-up, then the shelf.
   */
  const [doc, setDoc] = useState<ResearchDoc | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (doc) setDoc(null);
      else onBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [doc, onBack]);

  if (doc) {
    return (
      <article className="mx-auto flex max-w-[72ch] flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
        {/* A button that looks like a button. It was an underlined text link
            in a mono face, at the top of a cream page full of other maroon
            text, and she could not find it and kept reaching for the close
            control instead. A 44px target with a border and an arrow. */}
        <button
          type="button"
          onClick={() => setDoc(null)}
          autoFocus
          className="group inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-full border border-[#0c0a09]/25 bg-[#f7f1e9] px-4 py-2 text-[13px] font-medium text-[#0c0a09]/80 transition-colors duration-200 hover:border-[#8b2332] hover:bg-[#8b2332] hover:text-[#f2eae1]"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back
        </button>
        <header className="flex flex-col gap-2">
          <p className="font-mono text-[10px] tracking-widest uppercase text-[#0c0a09]/50">
            Supporting document
          </p>
          <h2 className="font-display text-3xl leading-tight">{doc.title}</h2>
        </header>
        <Blocks blocks={doc.blocks} />
      </article>
    );
  }

  return (
    <article className="mx-auto flex max-w-[72ch] flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
      <button
        type="button"
        onClick={onBack}
        autoFocus
        className="group inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-full border border-[#0c0a09]/25 bg-[#f7f1e9] px-4 py-2 text-[13px] font-medium text-[#0c0a09]/80 transition-colors duration-200 hover:border-[#8b2332] hover:bg-[#8b2332] hover:text-[#f2eae1]"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back
      </button>

      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] tracking-widest uppercase text-[#0c0a09]/50">
          {item.kind} - {item.date}
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

      <Blocks blocks={item.blocks} />

      {item.docs && (
        <section className="flex flex-col gap-3 border-t border-[#0c0a09]/12 pt-6">
          <h3 className="font-display text-xl">The working</h3>
          <p className="text-[14px] leading-relaxed text-[#0c0a09]/70">
            What sat under this in its own folder. A finding without its working
            is an assertion.
          </p>
          <ul className="flex flex-col gap-2">
            {item.docs.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setDoc(entry)}
                  className="group flex w-full cursor-pointer flex-col gap-1 rounded-lg border border-[#0c0a09]/15 bg-[#f7f1e9] p-4 text-left transition-colors duration-200 hover:border-[#8b2332]/50"
                >
                  <span className="font-display text-[17px] leading-tight group-hover:text-[#8b2332]">
                    {entry.title}
                  </span>
                  <span className="text-[13px] leading-relaxed text-[#0c0a09]/70">
                    {entry.summary}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(item.file || item.links) && (
        <div className="flex flex-wrap gap-5 border-t border-[#0c0a09]/12 pt-5">
          {item.file && (
            <a
              href={item.file.href}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-[14px] text-[#8b2332] transition-opacity hover:opacity-70"
            >
              <Download size={14} aria-hidden="true" />
              {item.file.label}
            </a>
          )}
          {item.links?.map((link) => {
            // A hash is somewhere on this site; anything else leaves it, and
            // anything that leaves it opens in its own tab rather than taking
            // the room, the open panel and the scroll position with it.
            const away = !link.href.startsWith("#");
            return (
              <a
                key={link.href}
                href={link.href}
                target={away ? "_blank" : undefined}
                rel={away ? "noreferrer" : undefined}
                className="inline-flex min-h-11 items-center gap-2 text-[14px] text-[#8b2332] transition-opacity hover:opacity-70"
              >
                <ExternalLink size={14} aria-hidden="true" />
                {link.label}
                {away && <span className="sr-only">(opens in a new tab)</span>}
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
}

/**
 * The document itself. Headings, paragraphs, lists, pull quotes, tables,
 * figures and clips, which is every shape the source write-ups use and nothing
 * more. A table is a real `<table>` rather than a grid of divs, because a
 * screen reader user needs the row and column headers to move around one.
 */
function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "h":
            return (
              <h3
                key={index}
                className="font-display mt-3 text-[22px] leading-snug"
              >
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p
                key={index}
                className="text-[16px] leading-[1.75] text-[#0c0a09]/85"
              >
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={index} className="flex flex-col gap-2.5">
                {block.items.map((entry) => (
                  <li
                    key={entry.slice(0, 40)}
                    className="border-l-2 border-[#8b2332]/30 pl-4 text-[15px] leading-relaxed text-[#0c0a09]/80"
                  >
                    {entry}
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <figure key={index} className="flex flex-col gap-1.5">
                <blockquote className="border-l-2 border-[#8b2332] pl-4 text-[16px] leading-[1.7] text-[#0c0a09]/80">
                  {block.text}
                </blockquote>
                {block.source && (
                  <figcaption className="pl-4 font-mono text-[11px] text-[#0c0a09]/50">
                    {block.source}
                  </figcaption>
                )}
              </figure>
            );
          case "note":
            return (
              <p
                key={index}
                className="rounded-lg border border-[#0c0a09]/12 bg-[#f7f1e9] p-4 text-[14px] leading-relaxed text-[#0c0a09]/75"
              >
                {block.text}
              </p>
            );
          case "table":
            return (
              <figure key={index} className="flex flex-col gap-2">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
                    <thead>
                      <tr>
                        {block.head.map((cell) => (
                          <th
                            key={cell}
                            scope="col"
                            className="border-b border-[#0c0a09]/25 py-2 pr-4 align-bottom font-mono text-[10px] tracking-wide uppercase text-[#0c0a09]/60"
                          >
                            {cell}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row) => (
                        <tr key={row.join("|").slice(0, 60)}>
                          {row.map((cell, cellIndex) =>
                            cellIndex === 0 ? (
                              <th
                                key={cellIndex}
                                scope="row"
                                className="border-b border-[#0c0a09]/10 py-2.5 pr-4 align-top font-medium text-[#0c0a09]/85"
                              >
                                {cell}
                              </th>
                            ) : (
                              <td
                                key={cellIndex}
                                className="border-b border-[#0c0a09]/10 py-2.5 pr-4 align-top leading-relaxed text-[#0c0a09]/75"
                              >
                                {cell}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {block.caption && (
                  <figcaption className="text-[12px] text-[#0c0a09]/55">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "figure":
            return (
              <figure key={index} className="flex flex-col gap-2">
                {/* These are already sized and converted. The reader is on a
                    cream sheet, so they get a border rather than a shadow. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.src}
                  alt={block.alt}
                  loading="lazy"
                  decoding="async"
                  className="mx-auto block h-auto max-h-[420px] w-auto max-w-full rounded-lg border border-[#0c0a09]/15"
                />
                {block.caption && (
                  <figcaption className="text-[12px] leading-relaxed text-[#0c0a09]/55">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "clip":
            return (
              <figure key={index} className="flex flex-col gap-2">
                {/* Not muted and not autoplaying. These are screen reader
                    recordings: the audio is the content. */}
                <video
                  controls
                  preload="metadata"
                  poster={block.poster}
                  aria-label={block.alt}
                  className="mx-auto block max-h-[420px] w-auto max-w-full rounded-lg border border-[#0c0a09]/15"
                >
                  {block.webm && <source src={block.webm} type="video/webm" />}
                  <source src={block.mp4} type="video/mp4" />
                </video>
                {block.caption && (
                  <figcaption className="text-center text-[12px] leading-relaxed text-[#0c0a09]/55">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
        }
      })}
    </div>
  );
}
