"use client";

import type { ReactNode } from "react";
import { CONTACT } from "@/data/projects";

/**
 * A link to the resume, or nothing at all.
 *
 * `CONTACT.resume` holds either a path in this site or a link to a copy
 * hosted somewhere else, and this works for both. While it is empty this
 * renders nothing, which is the point of the component: there is one place to
 * change and three places that quietly disappear rather than three links to a
 * file that is not there.
 *
 * It always opens in a new tab. A path also gets `download`, because that
 * attribute only works same origin. Either way the room, the open panel and
 * the scroll position behind it survive: following a PDF out of an open case
 * study and then pressing Back lands you on the grid, not where you were.
 */
export function ResumeLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const href = CONTACT.resume;
  if (!href) return null;

  const hosted = !href.startsWith("/");
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noreferrer"
      {...(hosted ? {} : { download: true })}
    >
      {children}
    </a>
  );
}
