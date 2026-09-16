"use client";

import { AnimatePresence } from "motion/react";
import { Code, ExternalLink, Mail } from "lucide-react";
import { CONTACT, PROJECTS } from "@/data/projects";
import { useSubRoute } from "@/lib/useSubRoute";
import { CaseStudy } from "./CaseStudy";
import { ProjectCard } from "./ProjectCard";
import { WindowFrame } from "./WindowFrame";

export function WorkOverlay({ onClose }: { onClose: () => void }) {
  /**
   * The open case study is a sub-route, so a link to a specific project works
   * and the back button, which on a phone is a swipe from the edge, closes it.
   */
  const {
    openId,
    open: openProject,
    close: closeProject,
  } = useSubRoute("work");

  return (
    <WindowFrame
      title="Projects"
      onClose={onClose}
      escapeEnabled={!openId}
      // You clicked the monitor, so the work opens on the monitor: same bezel,
      // same chin, the desktop behind it. The bezel is thinner than the
      // laptop's, because a card grid needs the width more than the joke does.
      screen={{
        device: "monitor",
        wallpaper: (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/scene/wallpaper.jpg)" }}
          />
        ),
      }}
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-2">
          <h2 className="font-display text-3xl sm:text-4xl">Projects</h2>
          <p className="text-text/80 max-w-2xl text-[15px] leading-relaxed">
            Nine, strongest first. The first five went in front of people who
            were not me, with the accessibility work tested rather than
            claimed, and each of their case studies says what I would fix.
          </p>
        </header>

        {/*
          One list, strongest first. No filter pills: a control that never
          changes the result is furniture, and with nine cards the order is
          doing the filtering.
        */}
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map((project) => (
            <li key={project.id} className="flex">
              <ProjectCard project={project} onOpen={openProject} />
            </li>
          ))}
        </ul>

        <section className="border-border bg-surface-raised flex flex-col gap-4 rounded-xl border p-6">
          <h3 className="font-display text-xl">Thanks for reading</h3>
          <p className="text-text/80 max-w-prose text-[15px] leading-relaxed">
            If any of this is useful to you, or you want the long version of one
            of them, I would like to hear from you.
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-7 gap-y-2">
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-highlight hover:text-text inline-flex min-h-6 items-center gap-2 py-1 text-[15px] transition-colors duration-200"
              >
                <Mail size={16} aria-hidden="true" />
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={CONTACT.github}
                className="text-highlight hover:text-text inline-flex min-h-6 items-center gap-2 py-1 text-[15px] transition-colors duration-200"
              >
                <Code size={16} aria-hidden="true" />
                github.com/keerthianil
              </a>
            </li>
            <li>
              <a
                href={CONTACT.linkedin}
                className="text-highlight hover:text-text inline-flex min-h-6 items-center gap-2 py-1 text-[15px] transition-colors duration-200"
              >
                <ExternalLink size={16} aria-hidden="true" />
                linkedin.com/in/keerthiareddy
              </a>
            </li>
          </ul>
        </section>
      </div>

      <AnimatePresence>
        {openId && (
          <CaseStudy key={openId} id={openId} onClose={closeProject} />
        )}
      </AnimatePresence>
    </WindowFrame>
  );
}
