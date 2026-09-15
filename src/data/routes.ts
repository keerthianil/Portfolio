/**
 * The overlay registry. Hash drives everything: `#work` opens the work overlay
 * and moves the camera to `work`. Adding a section means adding a row here.
 */

export type RouteId = "work" | "about" | "research";

export type CameraState = RouteId | "room";

export interface RouteDefinition {
  id: RouteId;
  /** The hash, without the `#`. */
  path: string;
  /** Used in the nav and as the accessible name. */
  label: string;
  /** Announced while the overlay's chunk loads. */
  loadingMessage: string;
  /** Name of the object in the 3D scene that opens this route. */
  sceneObject: string;
  /** What that object is, for the screen reader label on its mirror button. */
  sceneObjectLabel: string;
}

export const ROUTES: RouteDefinition[] = [
  {
    id: "work",
    path: "work",
    label: "work",
    loadingMessage: "Loading work...",
    sceneObject: "monitor",
    sceneObjectLabel: "the monitor",
  },
  {
    id: "about",
    path: "about",
    label: "about",
    loadingMessage: "System booting...",
    sceneObject: "laptop",
    sceneObjectLabel: "the laptop",
  },
  {
    id: "research",
    path: "research",
    label: "research",
    loadingMessage: "Loading research...",
    sceneObject: "reader",
    sceneObjectLabel: "the e-reader",
  },
];

export const ROUTE_BY_ID = Object.fromEntries(
  ROUTES.map((route) => [route.id, route]),
) as Record<RouteId, RouteDefinition>;

export function routeFromHash(hash: string): RouteDefinition | null {
  const path = hash.replace(/^#/, "").split("/")[0];
  return ROUTES.find((route) => route.path === path) ?? null;
}

/**
 * Props in the scene that make a sound but do not open anything. Kept in the
 * same file as the routes because they share the click handler and both need
 * keyboard mirrors.
 */
export interface SceneProp {
  object: string;
  label: string;
  /** Announced when activated, since the payoff is audio. */
  announcement: string;
  sound: string;
}

export const SCENE_PROPS: SceneProp[] = [
  {
    object: "mug",
    label: "the coffee mug",
    announcement: "Coffee.",
    sound: "/audio/coffee-sip.mp3",
  },
  {
    object: "speaker",
    label: "the speaker",
    announcement: "Playing a short screen reader clip.",
    sound: "/audio/screen-reader.mp3",
  },
];
