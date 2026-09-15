/**
 * The overlay registry. Hash drives everything: `#work` opens the work overlay
 * and moves the camera to `work`. Adding a section means adding a row here.
 */

export type RouteId =
  | "work"
  | "about"
  | "research"
  | "timeline"
  | "taborder"
  | "beforeafter";

export type CameraState = RouteId | "room";

export interface RouteDefinition {
  id: RouteId;
  /** The hash, without the `#`. */
  path: string;
  /** Used in the nav and as the accessible name. */
  label: string;
  /** Title shown in the window chrome. */
  title: string;
  /** Announced while the overlay's chunk loads. */
  loadingMessage: string;
  /** Name of the object in the 3D scene that opens this route. */
  sceneObject: string;
  /** What that object is, for the screen reader label on its mirror button. */
  sceneObjectLabel: string;
  /** Whether it appears in the bottom nav. */
  inNav: boolean;
}

export const ROUTES: RouteDefinition[] = [
  {
    id: "work",
    path: "work",
    label: "work",
    title: "Projects",
    loadingMessage: "Loading projects...",
    sceneObject: "monitor",
    sceneObjectLabel: "the monitor",
    inNav: true,
  },
  {
    id: "about",
    path: "about",
    label: "about",
    title: "Keerthi - About",
    loadingMessage: "System booting...",
    sceneObject: "laptop",
    sceneObjectLabel: "the laptop",
    inNav: true,
  },
  {
    id: "research",
    path: "research",
    label: "research",
    title: "Research",
    loadingMessage: "Loading research...",
    sceneObject: "reader",
    sceneObjectLabel: "the e-reader",
    inNav: true,
  },
  {
    id: "timeline",
    path: "timeline",
    label: "timeline",
    title: "Timeline",
    loadingMessage: "Loading timeline...",
    sceneObject: "calendar",
    sceneObjectLabel: "the desk calendar",
    inNav: false,
  },
  {
    id: "taborder",
    path: "taborder",
    label: "tab order",
    title: "Tab order",
    loadingMessage: "Loading...",
    sceneObject: "posterLeft",
    sceneObjectLabel: "the poster on the left wall",
    inNav: false,
  },
  {
    id: "beforeafter",
    path: "beforeafter",
    label: "before and after",
    title: "Before and after",
    loadingMessage: "Loading...",
    sceneObject: "frameRight",
    sceneObjectLabel: "the framed screen on the right wall",
    inNav: false,
  },
];

export const NAV_ROUTES = ROUTES.filter((route) => route.inNav);

export const ROUTE_BY_ID = Object.fromEntries(
  ROUTES.map((route) => [route.id, route]),
) as Record<RouteId, RouteDefinition>;

export function routeFromHash(hash: string): RouteDefinition | null {
  const path = hash.replace(/^#/, "").split("/")[0];
  return ROUTES.find((route) => route.path === path) ?? null;
}

/**
 * Props in the scene that do something but do not open a panel. The mug is the
 * only one: there used to be a speaker here for a voice assistant, and that is
 * gone along with every other voice feature.
 */
export interface SceneProp {
  object: string;
  label: string;
  sound?: string;
}

export const SCENE_PROPS: SceneProp[] = [
  {
    object: "mug",
    label: "the coffee mug",
    sound: "/audio/coffee-sip.mp3",
  },
];
