"use client";

import { ROUTES, SCENE_PROPS, type RouteId } from "@/data/routes";
import type { Hotspot } from "@/scene/Room";

/**
 * The 3D objects, mirrored as real buttons.
 *
 * A canvas is mouse only: nothing inside it is ever in the tab order. Rather
 * than bolt ARIA onto the canvas, every
 * clickable object gets a button here, visually hidden until focused. Tab lands
 * on it, Enter opens the same route, and the canvas stays a pure enhancement.
 */
export function SceneObjectButtons({
  onNavigate,
  onProp,
  onFocusObject,
  inert = false,
}: {
  onNavigate: (id: RouteId) => void;
  onProp: (object: string) => void;
  /**
   * Reports which object has focus, so the scene can draw a ring on it.
   *
   * The browser's own ring on the button is not enough on its own: the
   * button is a pill at the top of the screen and the object it opens is
   * across the room, so without the ring there is nothing connecting the two.
   * It is on whenever the room is.
   */
  onFocusObject?: (object: Hotspot | null) => void;
  /** Set while an overlay is open, so Tab does not wander into the room behind it. */
  inert?: boolean;
}) {
  return (
    <div
      data-print="hide"
      className="pointer-events-none fixed inset-0 z-[520]"
      inert={inert}
    >
      <h2 className="sr-only">Things in the room</h2>
      <ul className="absolute top-20 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        {ROUTES.map((route) => (
          <li key={route.id}>
            <button
              type="button"
              onClick={() => onNavigate(route.id)}
              onFocus={() => onFocusObject?.(route.sceneObject as Hotspot)}
              onBlur={() => onFocusObject?.(null)}
              className="scene-object-button"
            >
              Open {route.label}, on {route.sceneObjectLabel}
            </button>
          </li>
        ))}
        {SCENE_PROPS.map((prop) => (
          <li key={prop.object}>
            <button
              type="button"
              onClick={() => onProp(prop.object)}
              onFocus={() => onFocusObject?.(prop.object as Hotspot)}
              onBlur={() => onFocusObject?.(null)}
              className="scene-object-button"
            >
              {prop.action} {prop.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
