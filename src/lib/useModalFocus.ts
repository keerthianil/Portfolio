"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Everything a modal owes a keyboard or screen reader user, in one place:
 * focus is remembered and restored, Escape closes, Tab is trapped, and the page
 * behind stops scrolling.
 *
 * The visibility filter matters more than it looks. The projects grid keeps
 * filtered-out cards mounted and marks them `aria-hidden`, so a trap that only
 * checked `display` would still tab into them.
 */
export function useModalFocus(
  isOpen: boolean,
  onClose: () => void,
  returnFocusTo?: React.RefObject<HTMLElement | null>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      return;
    }
    const previous = previouslyFocused.current;
    if (!previous) return;
    // Deferred: the element we are returning to may not be mounted yet.
    const id = window.setTimeout(() => {
      if (returnFocusTo?.current) returnFocusTo.current.focus();
      else if (document.contains(previous)) previous.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [isOpen, returnFocusTo]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const visibleFocusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => {
          const style = getComputedStyle(element);
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            !element.hasAttribute("aria-hidden") &&
            element.closest("[aria-hidden='true']") === null
          );
        },
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusables = visibleFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    const focusId = window.setTimeout(() => {
      const preferred = container.querySelector<HTMLElement>("[autofocus]");
      (preferred ?? visibleFocusables()[0])?.focus();
    }, 100);

    return () => {
      container.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusId);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return containerRef;
}
