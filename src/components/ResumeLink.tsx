"use client";

import type { ReactNode } from "react";
import { CONTACT } from "@/data/projects";

/**
 * A link to the resume, or nothing at all.
 *
 * The resume is not in this repository. It is a personal document and the
 * repository is public, so it is hosted somewhere else and `CONTACT.resume`
 * holds the link. While that is empty this renders nothing, which is the point
 * of the component: there is one place to paste a URL and three places that
 * quietly disappear until somebody does, rather than three links to a file
 * that is not there.
 *
 * A path gets `download`, because that only works same origin. A URL opens in
 * a new tab instead, which is what a browser does with a cross origin
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
