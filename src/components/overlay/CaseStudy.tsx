"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
// lucide v1 dropped every brand glyph, so there is no Figma or GitHub mark to
// use. The link text carries it, which is what a screen reader was reading
// anyway.
import { BookOpen, Code, Frame, X } from "lucide-react";
import { ASSETS } from "@/data/assets";
import { CASE_STUDIES } from "@/data/caseStudies";
import { OVERLAY_MS, pick, springModal } from "@/lib/motion";
import { onReadingScroll, resetReadingProgress } from "@/lib/reading";
import { useModalFocus } from "@/lib/useModalFocus";
import { Gallery } from "./Gallery";

/**
 * One case study, opened over the grid.
 *
 * Every project has one and every one has the same four sections, plus Screens
 * at the bottom for the projects that have more shots than the card holds.
 * There is no short brief path any more: a grid where half the cards open a
 * case study and half open an apology ranks itself, and the coursework is in
 * the list because it is worth looking at.
 *
 * The table of contents tracks scroll with an IntersectionObserver rather than
 * a scroll handler, and it is a real list of links so it works before the
 * observer has fired and with JS doing nothing at all.
 */
export function CaseStudy({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const study = CASE_STUDIES[id];
  const assets = ASSETS[id];
  const shouldReduce = useReducedMotion();
  /**
   * The lightbox in the Screens section puts its own Escape handler on
   * `window`. Both would fire, and the case study would close underneath it.
   */
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useModalFocus(true, onClose, { escape: !lightboxOpen });
  const scrollRef = useRef<HTMLDivElement>(null);

  const toc = useMemo(() => {
    const entries = (study?.sections ?? []).map((section) => ({
      id: section.id as string,
      title: section.title,
    }));
    if (assets?.length) entries.push({ id: "screens", title: "Screens" });
    return entries;
  }, [study, assets]);

  const [active, setActive] = useState<string>(toc[0]?.id ?? "summary");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { root, rootMargin: "0px 0px -55% 0px", threshold: 0.01 },
    );
    const timer = window.setTimeout(() => {
      toc.forEach((section) => {
        const element = root.querySelector(`#${section.id}`);
        if (element) observer.observe(element);
      });
    }, 100);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [toc]);

  /**
   * The case study scrolls inside its own container, over a window that has
   * its own. Closing it hands reading back to the grid underneath, which is at
   * the top, so the room goes back with it.
   */
  useEffect(() => resetReadingProgress, []);

  const jump = useCallback((section: string) => {
    const root = scrollRef.current;
    const target = root?.querySelector<HTMLElement>(`#${section}`);
    if (!root || !target) return;
    root.scrollTo({ top: target.offsetTop - 24, behavior: "smooth" });
  }, []);

  if (!study) return null;

  /**
   * Not every project has a hero or a clip. Without one, the five column
   * header left a third of the screen empty beside the title, so it collapses
   * to a single column and the metric tiles spread out instead.
   */
  const hasMedia = !!(study.hero || study.clip);

  /**
   * Portalled to the body on purpose. The parent window animates on `y`, and a
   * transformed ancestor becomes the containing block for `position: fixed`, so
   * rendered in place this modal was sized to the window rather than to the
   * viewport.
   */
  return createPortal(
    <div className="fixed inset-0 z-[800] flex items-center justify-center px-3 py-6 sm:px-6">
      <motion.div
        data-print="hide"
        className="bg-bg/75 absolute inset-0 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: OVERLAY_MS / 1000 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${study.title} case study`}
        className="bg-surface border-border relative flex max-h-full w-full max-w-[1120px] flex-col overflow-hidden rounded-2xl border shadow-2xl"
        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 18 }}
        animate={shouldReduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
        transition={pick(!!shouldReduce, springModal)}
      >
        <div
          data-print="hide"
          className="border-border bg-surface-raised flex h-[42px] shrink-0 items-center justify-between border-b px-4"
        >
          <span className="text-text-muted truncate font-mono text-xs">
            {study.title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close the ${study.title} case study`}
            className="text-text-muted hover:text-text hover:bg-bg/60 -mr-1.5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md transition-colors duration-200"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Progress across the top of the case study. It sits under the title
            bar rather than over it, so it never crosses the close button. */}
        <div aria-hidden="true" data-print="hide" className="relative h-px shrink-0">
          <div
            className="bg-highlight absolute inset-y-0 left-0"
            style={{ width: "calc(var(--reading, 0) * 100%)" }}
          />
        </div>

        <div
          ref={scrollRef}
          onScroll={onReadingScroll}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 sm:py-10">
            <header
              className={
                hasMedia
                  ? "grid gap-8 lg:grid-cols-5"
                  : "flex flex-col gap-4"
              }
            >
              <div
                className={
                  hasMedia
                    ? "flex flex-col gap-4 lg:col-span-2"
                    : "flex max-w-[76ch] flex-col gap-4"
                }
              >
                <p className="text-text-muted font-mono text-[11px] tracking-wide">
                  {study.timeframe}
                </p>
                <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                  {study.title}
                </h2>
                <p className="text-text/85 text-[15px] leading-relaxed">
                  {study.subtitle}
                </p>

                {study.metrics && (
                  <dl
                    className={[
                      "mt-1 grid grid-cols-2 gap-3",
                      hasMedia ? "" : "sm:grid-cols-4",
                    ].join(" ")}
                  >
                    {study.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="border-border bg-surface-raised rounded-lg border p-3"
                      >
                        <dt className="sr-only">{metric.label}</dt>
                        <dd>
                          <span className="font-display text-highlight block text-2xl leading-none">
                            {metric.value}
                          </span>
                          <span className="text-text-muted mt-1.5 block text-[12px] leading-snug">
                            {metric.label}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {study.metricsNote && (
                  <p className="text-text-muted text-[12px] leading-relaxed">
                    {study.metricsNote}
                  </p>
                )}

                {/*
                  What I did, under the facts rather than above them. The grid
                  card carries a job title where there is one; this carries the
                  work, which is the part worth reading.
                */}
                <div className="border-border border-t pt-4">
                  <h3 className="text-text-muted font-mono text-[11px] tracking-wide uppercase">
                    My part
                  </h3>
                  <p className="text-text/80 mt-1.5 text-[14px] leading-relaxed">
                    {study.role}
                  </p>
                </div>

                <ul className="flex flex-col gap-1">
                  {study.repo && (
                    <li>
                      <a
                        href={study.repo}
                        className="text-highlight hover:text-text inline-flex min-h-6 items-center gap-2 py-1 text-sm transition-colors duration-200"
                      >
                        <Code size={14} aria-hidden="true" />
                        GitHub
                      </a>
                    </li>
                  )}
                  {study.figma && (
                    <li>
                      <a
                        href={study.figma.href}
                        className="text-highlight hover:text-text inline-flex min-h-6 items-center gap-2 py-1 text-sm transition-colors duration-200"
                      >
                        <Frame size={14} aria-hidden="true" />
                        {study.figma.label}
                      </a>
                    </li>
                  )}
                  {study.research?.map((link) => (
                    <li key={link.id}>
                      <a
                        href={`#research/${link.id}`}
                        className="text-highlight hover:text-text inline-flex min-h-6 items-center gap-2 py-1 text-sm transition-colors duration-200"
                      >
                        <BookOpen size={14} aria-hidden="true" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={
                  hasMedia ? "flex flex-col gap-5 lg:col-span-3" : "hidden"
                }
              >
                {study.hero && (
                  <figure className="flex flex-col gap-2">
                    <Image
                      src={`/images/case/${study.id}/${study.hero.src}`}
                      alt={study.hero.alt}
                      width={1600}
                      height={760}
                      className="border-border w-full rounded-xl border"
                    />
                    {study.hero.caption && (
                      <figcaption className="text-text-muted text-[12px]">
                        {study.hero.caption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {study.clip && (
                  <figure className="flex flex-col gap-2">
                    {/* Not muted and not autoplaying. These are screen reader
                        recordings: the audio is the content, so it gets
                        controls and a description rather than a silent loop. */}
                    <video
                      controls
                      preload="metadata"
                      poster={study.clip.poster}
                      className="border-border mx-auto w-full max-w-[300px] rounded-xl border"
                    >
                      <source src={study.clip.webm} type="video/webm" />
                      <source src={study.clip.mp4} type="video/mp4" />
                    </video>
                    <figcaption className="text-text-muted text-[12px] leading-relaxed">
                      {study.clip.description}{" "}
                      <span className="text-text/60">
                        Captions are not written yet.
                      </span>
                    </figcaption>
                  </figure>
                )}
              </div>
            </header>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_200px]">
              <div className="flex flex-col gap-12">
                {study.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="flex scroll-mt-6 flex-col gap-4"
                  >
                    <h3 className="font-display border-border border-b pb-2 text-2xl">
                      {section.title}
                    </h3>
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="text-text/85 text-[15px] leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {section.points && (
                      <ul className="mt-1 flex flex-col gap-3">
                        {section.points.map((point) => (
                          <li
                            key={point.slice(0, 40)}
                            className="border-highlight/40 text-text/80 border-l-2 pl-4 text-[14px] leading-relaxed"
                          >
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.figures?.map((figure) => (
                      <figure key={figure.src} className="mt-2 flex flex-col gap-2">
                        <Image
                          src={`/images/case/${study.id}/${figure.src}`}
                          alt={figure.alt}
                          width={1600}
                          height={900}
                          className="border-border w-full rounded-xl border"
                        />
                        {figure.caption && (
                          <figcaption className="text-text-muted text-[12px]">
                            {figure.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </section>
                ))}

                {assets?.length ? (
                  <Gallery
                    projectId={study.id}
                    groups={assets}
                    onLightboxChange={setLightboxOpen}
                  />
                ) : null}

                <div className="h-16" aria-hidden="true" />
              </div>

              <nav
                aria-label="Sections"
                className="hidden self-start lg:sticky lg:top-2 lg:block"
              >
                <ul className="flex flex-col gap-1">
                  {toc.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(event) => {
                          event.preventDefault();
                          jump(section.id);
                        }}
                        aria-current={active === section.id ? "true" : undefined}
                        className={[
                          "block rounded-md px-3 py-2 text-sm transition-colors duration-200",
                          active === section.id
                            ? "text-highlight bg-surface-raised font-medium"
                            : "text-text-muted hover:text-text hover:bg-surface-raised/60",
                        ].join(" ")}
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
