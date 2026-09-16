"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A second level of the hash, for a panel that opens on top of a panel:
 * `#work/stemally` inside `#work`, `#about/timeline` inside `#about`.
 *
 * Opening one pushes a history entry rather than replacing the current one.
 * That is the whole point of this hook. Both of these used to replace, with a
 * comment saying the back button closed them, and it did not: replacing a
 * history entry leaves nothing to go back to, so Back from an open case study
 * left the site altogether. On a phone that is the system back gesture, which
 * makes it the most likely way anybody closes anything.
 *
 * Closing goes back rather than pushing a second entry, so opening and closing
 * five case studies does not leave five entries to walk out through. If the
 * panel was open on arrival, from a link somebody sent, there is nothing to go
 * back to and closing rewrites the hash instead.
 */
export function useSubRoute(parent: string) {
  const read = () => {
    const parts = window.location.hash.replace(/^#/, "").split("/");
    return parts[0] === parent ? (parts[1] ?? null) : null;
  };

  const [openId, setOpenId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : read(),
  );
  /** Whether this hook is the reason there is an entry to go back to. */
  const pushed = useRef(false);

  const open = useCallback(
    (id: string) => {
      setOpenId(id);
      window.history.pushState(null, "", `#${parent}/${id}`);
      pushed.current = true;
    },
    [parent],
  );

  const close = useCallback(() => {
    setOpenId(null);
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", `#${parent}`);
  }, [parent]);

  /**
   * The parent panel stays mounted while only the sub-route changes, so a hash
   * arriving after mount, which is both the back button and a link from
   * another tab, has to be picked up here.
   */
  useEffect(() => {
    const sync = () => {
      const next = read();
      if (next === null) pushed.current = false;
      setOpenId(next);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
    // `read` closes over `parent` only, which never changes for a given panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent]);

  return { openId, open, close };
}
