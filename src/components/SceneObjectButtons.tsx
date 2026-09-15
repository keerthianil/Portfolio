"use client";

import { ROUTES, SCENE_PROPS, type RouteId } from "@/data/routes";

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
  inert = false,
}: {
  onNavigate: (id: RouteId) => void;
  onProp: (object: string) => void;
  /** Set while an overlay is open, so Tab does not wander into the room behind it. */
  inert?: boolean;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[520]" inert={inert}>
      <h2 className="sr-only">Things on the desk</h2>
      <ul className="absolute top-20 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        {ROUTES.map((route) => (
          <li key={route.id}>
            <button
              type="button"
              onClick={() => onNavigate(route.id)}
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
              className="scene-object-button"
            >
              Use {prop.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
