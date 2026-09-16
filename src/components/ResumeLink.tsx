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
 * A path gets `download`, because that attribute only works same origin. A URL
 * opens in a new tab instead, which is what a browser does with a cross origin
 * `download` anyway.
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
      {...(hosted
        ? { target: "_blank", rel: "noreferrer" }
        : { download: true })}
    >
      {children}
    </a>
  );
}
