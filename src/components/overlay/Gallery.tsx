"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { AssetGroup, AssetItem } from "@/data/assets";
import { useModalFocus } from "@/lib/useModalFocus";

/**
 * Every screen and clip a project has, at the bottom of its case study.
 *
 * The card at the top of the grid shows two screens, because a grid of eight
 * cards of screenshots is a wall. This is the other half of that: the rest of
 * them, grouped under the part of the app they belong to, for somebody who has
 * read the case study and now wants to see the thing.
 *
 * Groups with `modes` are one set of screens in two appearances rather than
 * two sets. They get one toggle over the group, because an app whose contrast
 * work is the subject should be shown in both and a reader should not have to
 * scroll past the same twenty screens twice to do it.
 *
 * Thumbnails open full size. A 240px thumbnail of a phone screenshot tells you
 * roughly nothing, so a gallery without a way through to the real image is a
 * decoration rather than a section.
 */

interface OpenShot {
  src: string;
  alt: string;
  caption?: string;
  /** Position in the flattened list, for the arrow keys. */
  index: number;
}

export function Gallery({
  projectId,
  groups,
  onLightboxChange,
}: {
  projectId: string;
  groups: AssetGroup[];
  /**
   * The case study owns an Escape handler on `window` and so does the
   * lightbox, so the parent has to be told to stand down while this one is up.
   */
  onLightboxChange?: (open: boolean) => void;
}) {
  const [modes, setModes] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<OpenShot | null>(null);

  useEffect(() => {
    onLightboxChange?.(!!open);
  }, [open, onLightboxChange]);

  const src = useCallback(
    (group: AssetGroup, item: AssetItem) => {
      const suffix = group.modes
        ? `-${modes[group.title] ?? group.modes[0].id}`
        : "";
      return `/images/projects/${projectId}/${item.file}${suffix}.webp`;
    },
    [projectId, modes],
  );

  /**
   * Every still in the section, in reading order, so the arrow keys in the
   * lightbox walk the whole case study rather than one group of it.
   */
  const flat = useMemo(() => {
    const out: { src: string; alt: string; caption?: string }[] = [];
    for (const group of groups) {
      if (group.kind === "video") continue;
      for (const item of group.items) {
        out.push({
          src: src(group, item),
          alt: item.alt,
          caption: item.caption,
        });
      }
    }
    return out;
  }, [groups, src]);

  const step = useCallback(
    (delta: number) => {
      setOpen((current) => {
        if (!current || flat.length === 0) return current;
        const next = (current.index + delta + flat.length) % flat.length;
        return { ...flat[next], index: next };
      });
    },
    [flat],
  );

  return (
    <section id="screens" className="flex scroll-mt-6 flex-col gap-6">
      <h3 className="font-display border-border border-b pb-2 text-2xl">
        Screens
      </h3>

      {groups.map((group) => {
        const mode = modes[group.title] ?? group.modes?.[0].id;
        return (
          <div key={group.title} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <h4 className="font-display text-text/90 text-lg">
                {group.title}
              </h4>
              {group.modes && (
                <div
                  role="group"
                  aria-label={`Appearance for ${group.title}`}
                  className="border-border flex overflow-hidden rounded-full border"
                >
                  {group.modes.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={mode === option.id}
                      onClick={() =>
                        setModes((current) => ({
                          ...current,
                          [group.title]: option.id,
                        }))
                      }
                      className={[
                        "min-h-8 cursor-pointer px-3.5 py-1 font-mono text-[11px] tracking-wide transition-colors duration-200",
                        mode === option.id
                          ? "bg-highlight/20 text-highlight"
                          : "text-text-muted hover:text-text",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {group.note && (
              <p className="text-text-muted max-w-prose text-[13px] leading-relaxed">
                {group.note}
              </p>
            )}

            {group.kind === "video" ? (
              <ul className="grid gap-5 sm:grid-cols-2">
                {group.items.map((item) => (
                  <li key={item.file} className="flex flex-col gap-2">
                    {/* Not autoplaying. Two of these are screen reader
                        recordings where the audio is the content, and the rest
                        are motion demos that have no business starting on
                        their own under reduced motion. */}
                    <video
                      controls
                      loop
                      playsInline
                      preload="metadata"
                      poster={
                        item.poster ? `/video/${item.poster}.jpg` : undefined
                      }
                      aria-label={item.alt}
                      // Capped, and letterboxed rather than cropped. These
                      // clips are crops of different parts of a phone screen,
                      // so at their intrinsic sizes the grid came out ragged
                      // and a portrait one ran to most of a screen on its own.
                      className="border-border bg-bg max-h-[440px] w-full rounded-lg border object-contain"
                    >
                      <source src={`/video/${item.file}.webm`} type="video/webm" />
                      <source src={`/video/${item.file}.mp4`} type="video/mp4" />
                    </video>
                    <p className="text-text-muted text-[12px] leading-relaxed">
                      {item.caption ?? item.alt}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((item) => {
                  const href = src(group, item);
                  const index = flat.findIndex((shot) => shot.src === href);
                  return (
                    <li key={item.file} className="flex">
                      <button
                        type="button"
                        onClick={() =>
                          setOpen({
                            src: href,
                            alt: item.alt,
                            caption: item.caption,
                            index: index < 0 ? 0 : index,
                          })
                        }
                        className="group border-border hover:border-highlight/50 flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-colors duration-200"
                      >
                        {/* Already sized and converted once. Running these
                            through the image pipeline would re-encode an
                            optimised file. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={href}
                          alt={item.alt}
                          loading="lazy"
                          decoding="async"
                          className="bg-bg w-full object-cover"
                        />
                        {item.caption && (
                          <span className="text-text-muted block px-3 py-2 text-[12px] leading-snug">
                            {item.caption}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {open && (
        <Lightbox
          shot={open}
          total={flat.length}
          onStep={step}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

/**
 * Portalled to the body for the same reason the case study is: the window it
 * opens over animates on `y`, and a transformed ancestor becomes the containing
 * block for `position: fixed`.
 */
function Lightbox({
  shot,
  total,
  onStep,
  onClose,
}: {
  shot: OpenShot;
  total: number;
  onStep: (delta: number) => void;
  onClose: () => void;
}) {
  const containerRef = useModalFocus(true, onClose);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onStep(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onStep(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onStep]);

  return createPortal(
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
      <div
        data-print="hide"
        className="bg-bg/90 absolute inset-0 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={shot.alt}
        className="relative flex max-h-full w-full max-w-[520px] flex-col items-center gap-3"
      >
        <div className="flex w-full items-center justify-between gap-3">
          <p className="text-text-muted font-mono text-[11px]">
            {shot.index + 1} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="Previous screen"
              className="text-text-muted hover:text-text hover:bg-surface-raised flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-lg transition-colors duration-200"
            >
              <span aria-hidden="true">&lt;</span>
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="Next screen"
              className="text-text-muted hover:text-text hover:bg-surface-raised flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-lg transition-colors duration-200"
            >
              <span aria-hidden="true">&gt;</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              autoFocus
              className="text-text-muted hover:text-text hover:bg-surface-raised flex h-10 w-10 cursor-pointer items-center justify-center rounded-md transition-colors duration-200"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shot.src}
          alt={shot.alt}
          className="border-border min-h-0 w-auto max-w-full flex-1 rounded-xl border object-contain"
        />

        <p className="text-text/75 w-full text-center text-[13px] leading-relaxed">
          {shot.caption ?? shot.alt}
        </p>
      </div>
    </div>,
    document.body,
  );
}
