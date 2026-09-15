"use client";

import { Code, ExternalLink, Mail } from "lucide-react";
import { CONTACT, PROJECTS } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { WindowFrame } from "./WindowFrame";

export function WorkOverlay({
  onClose,
  onOpenProject,
}: {
  onClose: () => void;
  onOpenProject: (id: string) => void;
}) {
  return (
    <WindowFrame title="Selected work" onClose={onClose}>
      <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-2">
          <h2 className="font-display text-3xl sm:text-4xl">Selected work</h2>
          <p className="text-text/80 max-w-2xl text-[15px] leading-relaxed">
            Four products for people the defaults miss. Each one ships with the
            accessibility work tested rather than claimed, and each case study
            says what I would fix.
          </p>
        </header>

        {/* No filter pills. Four projects do not need filtering, and a control
            that never changes the result is furniture. */}
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map((project) => (
            <li key={project.id} className="flex">
              <ProjectCard project={project} onOpen={onOpenProject} />
            </li>
          ))}

          <li className="flex">
            <div className="border-border bg-surface-raised flex flex-1 flex-col justify-center gap-4 rounded-xl border p-6">
              <h3 className="font-display text-xl">Thanks for reading</h3>
              <p className="text-text/80 text-[15px] leading-relaxed">
                If any of this is useful to you, or you want the long version of
                one of them, I would like to hear from you.
              </p>
              <ul className="mt-1 flex flex-col gap-2">
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-highlight hover:text-text inline-flex items-center gap-2 text-[15px] transition-colors duration-200"
                  >
                    <Mail size={16} aria-hidden="true" />
                    {CONTACT.email}
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT.github}
                    className="text-highlight hover:text-text inline-flex items-center gap-2 text-[15px] transition-colors duration-200"
                  >
                    <Code size={16} aria-hidden="true" />
                    github.com/keerthianil
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT.linkedin}
                    className="text-highlight hover:text-text inline-flex items-center gap-2 text-[15px] transition-colors duration-200"
                  >
                    <ExternalLink size={16} aria-hidden="true" />
                    linkedin.com/in/keerthiareddy
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </WindowFrame>
  );
}
