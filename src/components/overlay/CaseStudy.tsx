"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { ExternalLink, X } from "lucide-react";
import { CASE_STUDIES, type Section } from "@/data/caseStudies";
import { PROJECTS } from "@/data/projects";
import { OVERLAY_MS, pick, springModal } from "@/lib/motion";
import { useModalFocus } from "@/lib/useModalFocus";

const TOC: Section["id"][] = ["summary", "challenge", "approach", "results"];

/**
 * One case study, opened over the grid.
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
  const shouldReduce = useReducedMotion();
  const containerRef = useModalFocus(true, onClose);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Section["id"]>("summary");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id as Section["id"]);
      },
      { root, rootMargin: "0px 0px -55% 0px", threshold: 0.01 },
    );
    const id = window.setTimeout(() => {
      TOC.forEach((section) => {
        const element = root.querySelector(`#${section}`);
        if (element) observer.observe(element);
      });
    }, 100);
    return () => {
      window.clearTimeout(id);
      observer.disconnect();
    };
  }, []);

  const jump = useCallback((section: Section["id"]) => {
    const root = scrollRef.current;
    const target = root?.querySelector<HTMLElement>(`#${section}`);
    if (!root || !target) return;
    root.scrollTo({
      top: target.offsetTop - 24,
      behavior: "smooth",
    });
  }, []);

  // Five of the nine projects have a written case study. The other four are
  // coursework, and a made up case study is worse than an honest short one, so
  // they get a brief from the card's own data and a link to the code.
  if (!study) {
    return createPortal(
      <ShortBrief id={id} onClose={onClose} containerRef={containerRef} />,
      document.body,
    );
  }

  /**
   * Portalled to the body on purpose. The parent window animates on `y`, and a
   * transformed ancestor becomes the containing block for `position: fixed`, so
   * rendered in place this modal was sized to the window rather than to the
   * viewport.
   */
  return createPortal(
    <div className="fixed inset-0 z-[800] flex items-center justify-center px-3 py-6 sm:px-6">
      <motion.div
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
        <div className="border-border bg-surface-raised flex h-[42px] shrink-0 items-center justify-between border-b px-4">
          <span className="text-text-muted truncate font-mono text-xs">
            {study.title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close the ${study.title} case study`}
            className="text-text-muted hover:text-text hover:bg-bg/60 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-200"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 sm:py-10">
            <header className="grid gap-8 lg:grid-cols-5">
              <div className="flex flex-col gap-4 lg:col-span-2">
                <p className="text-text-muted font-mono text-[11px] tracking-wide">
                  {study.role}
                  <span className="block">{study.timeframe}</span>
                </p>
                <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                  {study.title}
                </h2>
                <p className="text-text/85 text-[15px] leading-relaxed">
                  {study.subtitle}
                </p>

                {study.metrics && (
                  <dl className="mt-1 grid grid-cols-2 gap-3">
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

                {study.repo && (
                  <a
                    href={study.repo}
                    className="text-highlight hover:text-text inline-flex items-center gap-2 text-sm transition-colors duration-200"
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                    Source
                  </a>
                )}
              </div>

              <div className="flex flex-col gap-5 lg:col-span-3">
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
                <div className="h-16" aria-hidden="true" />
              </div>

              <nav
                aria-label="Sections"
                className="hidden self-start lg:sticky lg:top-2 lg:block"
              >
                <ul className="flex flex-col gap-1">
                  {study.sections.map((section) => (
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

/**
 * What opens for a project with no written case study: the same facts the card
 * carries, at reading size, and a link to the code. Shorter than a case study
 * and honest about being shorter.
 */
function ShortBrief({
  id,
  onClose,
  containerRef,
}: {
  id: string;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const project = PROJECTS.find((item) => item.id === id);
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center px-3 py-6 sm:px-6">
      <div
        className="bg-bg/75 absolute inset-0 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <section
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="bg-surface border-border relative flex max-h-full w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="border-border bg-surface-raised flex shrink-0 items-center gap-4 border-b px-5 py-3">
          <h2 className="font-display flex-1 truncate text-lg">
            {project.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text cursor-pointer font-mono text-xs"
          >
            esc
            <span className="sr-only">Close {project.title}</span>
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-7">
          <p className="text-text/85 text-[17px] leading-relaxed">
            {project.summary}
          </p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-text-muted font-mono text-[11px] tracking-wide uppercase">
                Role
              </dt>
              <dd className="text-text/85 mt-1 text-[15px]">{project.role}</dd>
            </div>
            <div>
              <dt className="text-text-muted font-mono text-[11px] tracking-wide uppercase">
                When
              </dt>
              <dd className="text-text/85 mt-1 text-[15px]">
                {project.timeframe}
              </dd>
            </div>
          </dl>

          <div className="flex gap-3">
            {project.cover.map((shot) => (
              // Already sized and converted once. Running these through
              // next/image would re-encode an optimised file.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={shot.file}
                src={`/images/projects/${project.id}/${shot.file}.webp`}
                alt={shot.alt}
                loading="lazy"
                decoding="async"
                className="border-border w-1/2 rounded-lg border object-cover"
              />
            ))}
          </div>

          <p className="text-text-muted border-border border-t pt-5 text-sm leading-relaxed">
            This one has no written case study. It was coursework, the decisions
            are in its readme, and inventing a narrative for it after the fact
            would be the opposite of the point of the rest of this site.
            {project.repo ? " The code is below." : ""}
          </p>

          {project.repo && (
            <a
              href={project.repo}
              className="text-highlight hover:text-text self-start text-[15px] transition-colors duration-200"
            >
              Read the code
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
