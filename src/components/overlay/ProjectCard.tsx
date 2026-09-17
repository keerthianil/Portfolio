"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Project } from "@/data/projects";

/**
 * One project.
 *
 * The screens are 1206x2622 phone captures, so the card composites two of them
 * at an angle on a field tinted with that app's own accent rather than cropping
 * a portrait screenshot into a landscape thumbnail.
 *
 * The two screens are deliberately different sizes and both are cropped by the
 * bottom edge. Sitting them side by side at the same height filled the card
 * and left a grid that was each a wall of white screenshot: the tint is the
 * only thing telling them apart, so the tint has to survive. The back one is
 * smaller, pushed up and behind; the front one overlaps it.
 *
 * `shape: "wide"` is the one browser capture in the set. It sits square on,
 * because a landscape screenshot tipped seven degrees reads as a broken phone
 * rather than as a laptop.
 *
 * There is no arrow on the heading any more. An arrow pointing out of a card
 * says this opens somewhere else, and this opens a panel over the grid, so it
 * was making a promise the interaction does not keep.
 *
 * The card tilts toward the pointer and the art inside it moves further than
 * the card does, which is what gives it thickness: two planes at different
 * depths moving by different amounts is the whole of the parallax illusion.
 * Five degrees is the ceiling. Past that the screenshots start to look like
 * they are sliding off the card rather than sitting in it.
 *
 * It is written straight to `style` from the pointer handler with no
 * transition, because a transition on a value that updates every pointer move
 * is a lag, not a smoothing. The spring back on leave is the only transition,
 * and it is the only moment the card is animating rather than tracking.
 *
 * None of it runs on a coarse pointer or under reduced motion. Both fall back
 * to the flat lift and scale in the class list, which is why those classes are
 * still there.
 */
export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (id: string) => void;
}) {
  const wide = project.shape === "wide";
  const cardRef = useRef<HTMLButtonElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const tilts = useRef(false);

  useEffect(() => {
    tilts.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const track = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const card = cardRef.current;
    const art = artRef.current;
    if (!tilts.current || !card || !art) return;
    const box = card.getBoundingClientRect();
    // -0.5 at one edge, 0.5 at the other.
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    card.style.transition = "border-color 150ms";
    card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-2px)`;
    art.style.transition = "none";
    art.style.transform = `translate3d(${x * 16}px, ${y * 11}px, 0) scale(1.04)`;
  }, []);

  const release = useCallback(() => {
    const card = cardRef.current;
    const art = artRef.current;
    if (!card || !art) return;
    // Cleared rather than set to a rest value, so the hover and active classes
    // own the card again the moment the pointer is off it.
    card.style.transition = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), border-color 150ms";
    card.style.transform = "";
    art.style.transition = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)";
    art.style.transform = "";
  }, []);

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={() => onOpen(project.id)}
      onPointerMove={track}
      onPointerLeave={release}
      onBlur={release}
      className="group border-border bg-surface-raised hover:border-highlight/40 flex transform-gpu cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-[transform,border-color] duration-150 hover:-translate-y-0.5 active:translate-y-0"
      aria-label={`Open the ${project.title} case study`}
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{
          background: `radial-gradient(120% 100% at 50% 0%, ${project.tint}55 0%, ${project.tint}18 45%, transparent 100%), #120e0c`,
        }}
      >
        <div
          ref={artRef}
          className={[
            "absolute inset-0 flex transform-gpu justify-center transition-transform duration-300 ease-out group-hover:scale-[1.03]",
            wide ? "items-center px-4" : "items-end pb-1",
          ].join(" ")}
        >
          {project.cover.map((shot, index) => (
            <picture key={shot.file}>
              {/* Only some projects have an avif pair. The rest came off the
                  simulator and were converted once, to webp. */}
              {project.avif && (
                <source
                  srcSet={`/images/projects/${project.id}/${shot.file}.avif`}
                  type="image/avif"
                />
              )}
              <source
                srcSet={`/images/projects/${project.id}/${shot.file}.webp`}
                type="image/webp"
              />
              <img
                src={`/images/projects/${project.id}/${shot.file}.webp`}
                alt={shot.alt}
                loading="lazy"
                decoding="async"
                className={
                  wide
                    ? "w-[86%] rounded-md shadow-2xl ring-1 ring-black/40"
                    : [
                        "absolute bottom-0 w-auto rounded-[10px] shadow-2xl ring-1 ring-black/40",
                        // The back screen is smaller, higher and behind; the
                        // front one is larger and overlaps it. Both run off the
                        // bottom edge, which is what stops the pair reading as
                        // two thumbnails in a row.
                        index === 0
                          ? "h-[46%] translate-x-[-30%] rotate-[-7deg]"
                          : "z-10 h-[56%] translate-x-[24%] rotate-[5deg]",
                      ].join(" ")
                }
              />
            </picture>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-xl">{project.title}</h3>
        <p className="text-text/85 text-[15px] leading-relaxed">
          {project.summary}
        </p>
        {/*
          A job title, on the two research projects only. Everything else in
          the grid was mine end to end, and "product design and build" under
          six cards in a row is furniture rather than information.
        */}
        {project.role && (
          <p className="text-text-muted mt-auto pt-2 font-mono text-[11px] tracking-wide">
            {project.role}
          </p>
        )}
      </div>
    </button>
  );
}
