"use client";

import { Coffee, Laptop, Monitor, BookOpen, CalendarDays, PanelsTopLeft } from "lucide-react";
import { ROUTES, SCENE_PROPS, type RouteId } from "@/data/routes";

const GLYPH: Record<string, typeof Monitor> = {
  monitor: Monitor,
  laptop: Laptop,
  reader: BookOpen,
  calendar: CalendarDays,
  posterLeft: PanelsTopLeft,
  frameRight: PanelsTopLeft,
};

const BLURB: Record<RouteId, string> = {
  work: "Four projects, with the case studies",
  about: "Who I am and what I have shipped",
  research: "Studies, reviews and instruments",
  timeline: "Where I have worked and studied",
  taborder: "A small thing about focus order",
  beforeafter: "One screen, failing and fixed",
};

/**
 * What stands in for the room when the canvas cannot run: no WebGL, a
 * blocklisted driver, or a crash inside the scene.
 *
 * Not a picture of the room. A photograph of a room you cannot touch is worse
 * than no room, and everything the room does is a link anyway, so this shows
 * those links instead. Nothing about the site is unreachable from here.
 */
export function RoomFallback({
  onNavigate,
  onProp,
}: {
  onNavigate: (id: RouteId) => void;
  onProp: (object: string) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(139,35,50,0.22) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-3xl flex-col gap-8 px-6 pt-24 pb-40">
        <header className="flex flex-col gap-3">
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">
            Keerthi Anil
          </h2>
          <p className="text-highlight text-sm">
            Designer, Developer &amp; Researcher
          </p>
          <p className="max-w-xl text-lg leading-snug text-balance">
            I design, build, and research interfaces for the people default
            products miss.
          </p>
          <p className="font-mono text-text-muted text-xs tracking-widest uppercase">
            iOS / SwiftUI / Accessibility / AI
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2">
          {ROUTES.map((route) => {
            const Glyph = GLYPH[route.sceneObject] ?? Monitor;
            return (
              <li key={route.id} className="flex">
                <button
                  type="button"
                  onClick={() => onNavigate(route.id)}
                  className="group border-border bg-surface hover:border-highlight/40 flex flex-1 cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-200"
                >
                  <span
                    className="text-highlight mt-0.5 shrink-0"
                    aria-hidden="true"
                  >
                    <Glyph size={20} />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-lg capitalize">
                      {route.label}
                    </span>
                    <span className="text-text-muted text-[13px] leading-snug">
                      {BLURB[route.id]}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}

          {SCENE_PROPS.map((prop) => (
            <li key={prop.object} className="flex">
              <button
                type="button"
                onClick={() => onProp(prop.object)}
                className="group border-border bg-surface hover:border-highlight/40 flex flex-1 cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-200"
              >
                <span
                  className="text-highlight mt-0.5 shrink-0"
                  aria-hidden="true"
                >
                  <Coffee size={20} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-lg">Coffee</span>
                  <span className="text-text-muted text-[13px] leading-snug">
                    Take a sip
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="text-text-muted max-w-prose text-[13px] leading-relaxed">
          You are seeing the flat view, either because this browser cannot give
          the page a 3D context or because you asked for it. Nothing is missing:
          every object in the room is a link, and these are those links.
        </p>
      </div>
    </div>
  );
}
