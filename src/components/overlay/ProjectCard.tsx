"use client";

import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

/**
 * One project.
 *
 * The screens are 1206x2622 phone captures, so the card composites two of them
 * at an angle on a field tinted with that app's own accent rather than cropping
 * a portrait screenshot into a landscape thumbnail.
 *
 * Two layers of hover: the card lifts on a short curve and the art scales on a
 * longer one, so the art keeps moving after the card has settled.
 */
export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(project.id)}
      className="group border-border bg-surface-raised hover:border-highlight/40 flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-[transform,border-color] duration-150 hover:-translate-y-0.5 active:translate-y-0"
      aria-label={`Open the ${project.title} case study`}
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{
          background: `radial-gradient(120% 100% at 50% 0%, ${project.tint}55 0%, ${project.tint}18 45%, transparent 100%), #120e0c`,
        }}
      >
        <div className="absolute inset-0 flex items-end justify-center gap-3 pt-7 transition-transform duration-300 ease-out group-hover:scale-[1.04] sm:gap-4">
          {project.cover.map((shot, index) => (
            <picture key={shot.file}>
              <source
                srcSet={`/images/projects/${project.id}/${shot.file}.avif`}
                type="image/avif"
              />
              <source
                srcSet={`/images/projects/${project.id}/${shot.file}.webp`}
                type="image/webp"
              />
              <img
                src={`/images/projects/${project.id}/${shot.file}.webp`}
                alt={shot.alt}
                width={1206}
                height={2622}
                loading="lazy"
                decoding="async"
                // Sized so the tinted field still reads above and beside the
                // screens. At 86% they filled the card and the tint, which is
                // the only thing telling the four cards apart, vanished.
                className="h-[74%] w-auto self-end rounded-[12px] shadow-2xl ring-1 ring-black/50"
                style={{
                  transform: `rotate(${index === 0 ? -5 : 5}deg) translateY(${index === 0 ? 5 : 0}%)`,
                }}
              />
            </picture>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display flex items-center gap-2 text-xl">
          {project.title}
          <ArrowUpRight
            size={18}
            aria-hidden="true"
            className="text-text-muted group-hover:text-highlight transition-colors duration-200"
          />
        </h3>
        <p className="text-text/85 text-[15px] leading-relaxed">
          {project.summary}
        </p>
        <p className="text-text-muted mt-auto pt-2 font-mono text-[11px] tracking-wide">
          {project.role}
        </p>
      </div>
    </button>
  );
}
