"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CASE_STUDIES } from "@/data/caseStudies";
import { CONTACT, PROJECTS } from "@/data/projects";
import { RESEARCH } from "@/data/research";
import { ROUTES } from "@/data/routes";
import { useModalFocus } from "@/lib/useModalFocus";

/**
 * Everything on the site, one keystroke away.
 *
 * The router here is a hash and the nav is three words, so a visitor who knows
 * what they are looking for has to open a section and then find the card. This
 * is the accelerator for the one who does: type four letters, press Enter,
 * land on the case study.
 *
 * It is a combobox, properly: the input owns `aria-expanded` and
 * `aria-activedescendant`, the results are a real listbox of real options, and
 * the arrow keys move the active option without moving focus off the input,
 * which is what lets you keep typing. Focus never enters the list.
 *
 * **Escape is handled in the capture phase and stops propagation.** Every
 * overlay on this site puts an Escape handler on `window` in the bubble phase,
 * so without that, closing the palette from inside an open case study closed
 * the case study and the projects window behind it as well. Capture on
 * `window` runs before all of them.
 *
 * The shortcut is announced in the help menu, because a shortcut nobody is
 * told about does not exist, which is the same argument that took two custom
 * gestures out of TactileNav.
 */

interface Entry {
  id: string;
  label: string;
  hint: string;
  kind: string;
  /** Hash to navigate to, or a URL to open. */
  href: string;
  external?: boolean;
  /** Extra words that should match, beyond the label. */
  terms?: string;
}

/**
 * What a query is matched against.
 *
 * The label alone is not enough. Typing "contrast" should find Ally, whose
 * whole Results section is about contrast, and the design system extraction,
 * which measures it. So an entry carries the words its own document is made
 * of: the section headings and the first paragraph of each, which is where a
 * well written section says what it is about.
 *
 * A case study is 700 words, so all of it goes in. A research document is
 * 2,000 and only its headings and its first dozen paragraphs do: indexing
 * every word of those turns the palette into a full text search that matches
 * everything, and the thing a palette is for is jumping to something you can
 * already name.
 */
function projectTerms(id: string): string {
  const study = CASE_STUDIES[id];
  if (!study) return "";
  return [
    study.subtitle,
    study.role,
    ...study.sections.map((section) =>
      [section.title, ...section.body, ...(section.points ?? [])].join(" "),
    ),
  ].join(" ");
}

function researchTerms(item: (typeof RESEARCH)[number]): string {
  const parts: string[] = [item.summary];
  for (const block of item.blocks) {
    if (block.kind === "h") parts.push(block.text);
    else if (block.kind === "p" && parts.length < 14) parts.push(block.text);
  }
  for (const doc of item.docs ?? []) {
    parts.push(doc.title, doc.summary);
  }
  return parts.join(" ");
}

function buildEntries(): Entry[] {
  const entries: Entry[] = [];

  for (const route of ROUTES) {
    entries.push({
      id: `route-${route.id}`,
      label: route.title,
      hint: `Opens on ${route.sceneObjectLabel}`,
      kind: "Section",
      href: `#${route.path}`,
      terms: route.label,
    });
  }

  for (const project of PROJECTS) {
    entries.push({
      id: `project-${project.id}`,
      label: project.title,
      hint: project.summary,
      kind: "Project",
      href: `#work/${project.id}`,
      terms: `${project.summary} ${project.role ?? ""} ${projectTerms(project.id)}`,
    });
  }

  for (const item of RESEARCH) {
    entries.push({
      id: `research-${item.id}`,
      label: item.title,
      hint: item.summary,
      kind: item.kind,
      href: `#research/${item.id}`,
      terms: researchTerms(item),
    });
  }

  entries.push({
    id: "contact-email",
    label: "Email me",
    hint: CONTACT.email,
    kind: "Contact",
    href: `mailto:${CONTACT.email}`,
    external: true,
    terms: "contact hire get in touch mail",
  });
  entries.push({
    id: "contact-github",
    label: "GitHub",
    hint: "The code for most of these",
    kind: "Contact",
    href: CONTACT.github,
    external: true,
    terms: "code source repository",
  });
  entries.push({
    id: "contact-linkedin",
    label: "LinkedIn",
    hint: "The rest of it",
    kind: "Contact",
    href: CONTACT.linkedin,
    external: true,
    terms: "profile experience",
  });
  if (CONTACT.resume) {
    entries.push({
      id: "contact-resume",
      label: "Read the resume",
      hint: "PDF",
      kind: "Contact",
      href: CONTACT.resume,
      external: true,
      terms: "cv resume pdf download",
    });
  }

  return entries;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const containerRef = useModalFocus(open, close, { escape: false });

  const entries = useMemo(() => buildEntries(), []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;
    const words = needle.split(/\s+/);
    return entries.filter((entry) => {
      const hay =
        `${entry.label} ${entry.kind} ${entry.hint} ${entry.terms ?? ""}`.toLowerCase();
      return words.every((word) => hay.includes(word));
    });
  }, [entries, query]);

  /**
   * The highlight is clamped on read rather than reset in an effect. A
   * `setState` in an effect body is a cascading render and the compiler
   * rejects it; typing is also the transition that owns the reset, so it does
   * it in the change handler, and this clamp only catches the frame in
   * between.
   */
  const index = results.length ? Math.min(active, results.length - 1) : 0;

  /** Cmd+K, or Ctrl+K. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey))
        return;
      event.preventDefault();
      setQuery("");
      setOpen((current) => !current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /**
   * Escape, in the capture phase, stopping everything behind it. See the note
   * at the top: the overlays all listen on `window` in the bubble phase.
   */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, close]);

  const go = useCallback(
    (entry: Entry) => {
      close();
      if (entry.external) {
        window.open(entry.href, "_blank", "noopener,noreferrer");
        return;
      }
      window.location.hash = entry.href.replace(/^#/, "");
    },
    [close],
  );

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(results.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[index]);
    }
  };

  // Keep the active row in view while the arrow keys walk past the fold.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [index, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[950] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="bg-bg/80 absolute inset-0 backdrop-blur-sm"
        aria-hidden="true"
        onClick={close}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Go to"
        className="bg-surface border-border relative flex max-h-[70vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="border-border flex items-center gap-3 border-b px-4">
          <span aria-hidden="true" className="text-text-muted font-mono text-sm">
            &gt;
          </span>
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-autocomplete="list"
            aria-activedescendant={
              results.length ? `palette-${results[index]?.id}` : undefined
            }
            aria-label="Search projects, research and sections"
            placeholder="Go to a project, a document, a section"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            className="text-text placeholder:text-text-muted flex-1 bg-transparent py-4 text-[15px] outline-none"
          />
          <kbd
            aria-hidden="true"
            className="text-text-muted border-border rounded border px-1.5 py-0.5 font-mono text-[10px]"
          >
            esc
          </kbd>
        </div>

        {results.length === 0 ? (
          <p className="text-text-muted px-4 py-6 text-[14px]">
            Nothing matches that. There are eight projects and seven research
            documents in here.
          </p>
        ) : (
          <ul
            ref={listRef}
            id="palette-results"
            role="listbox"
            aria-label="Results"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2"
          >
            {results.map((entry, position) => (
              <li
                key={entry.id}
                id={`palette-${entry.id}`}
                role="option"
                aria-selected={position === index}
                onClick={() => go(entry)}
                onPointerMove={() => setActive(position)}
                className={[
                  "mx-2 flex cursor-pointer items-baseline gap-3 rounded-lg px-3 py-2.5",
                  position === index ? "bg-surface-raised" : "",
                ].join(" ")}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={[
                      "truncate text-[15px]",
                      position === index ? "text-highlight" : "text-text",
                    ].join(" ")}
                  >
                    {entry.label}
                  </span>
                  <span className="text-text-muted truncate text-[12px]">
                    {entry.hint}
                  </span>
                </span>
                <span className="text-text-muted shrink-0 font-mono text-[10px] tracking-wide uppercase">
                  {entry.kind}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="border-border text-text-muted border-t px-4 py-2.5 font-mono text-[10px] tracking-wide">
          up and down to move, enter to open
        </p>
      </div>
    </div>,
    document.body,
  );
}
